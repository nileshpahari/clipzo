use crate::models::*;
use dashmap::DashMap;
use std::sync::Arc;
use tokio::process::Command;
use uuid::Uuid;
use anyhow::{anyhow, Result};
use tracing::{error, info, warn};
use std::path::PathBuf;

pub struct JobManager {
    jobs: DashMap<Uuid, Job>,
    public_dir: PathBuf,
}

impl JobManager {
    pub fn new() -> Self {
        let public_dir = PathBuf::from("public");
        if let Err(e) = std::fs::create_dir_all(&public_dir) {
            panic!("Failed to create public directory: {}", e);
        }
        
        Self {
            jobs: DashMap::new(),
            public_dir,
        }
    }

    pub fn create_job(&self, request: ClipRequest) -> Uuid {
        let id = Uuid::new_v4();
        let job = Job {
            id,
            status: JobStatus::Processing,
            error: None,
            file_path: None,
            request,
        };
        self.jobs.insert(id, job);
        id
    }

    pub fn get_job(&self, id: &Uuid) -> Option<Job> {
        self.jobs.get(id).map(|entry| entry.clone())
    }

    pub fn update_job_status(&self, id: &Uuid, status: JobStatus, error: Option<String>, file_path: Option<String>) {
        if let Some(mut job) = self.jobs.get_mut(id) {
            job.status = status;
            job.error = error;
            job.file_path = file_path;
        }
    }

    pub fn get_public_dir(&self) -> &std::path::Path {
        &self.public_dir
    }
}

pub struct VideoService;

impl VideoService {
    pub async fn get_metadata(url: &str) -> Result<VideoMetadata> {
        info!("Fetching metadata for URL: {}", url);
        
        let output = Command::new("yt-dlp")
            .args([
                "--dump-json",
                "--no-download",
                url
            ])
            .output()
            .await?;

        if !output.status.success() {
            let error = String::from_utf8_lossy(&output.stderr);
            error!("yt-dlp metadata error: {}", error);
            return Ok(VideoMetadata {
                ok: false,
                title: None,
                description: None,
                thumbnail: None,
                image: None,
                duration: None,
            });
        }

        let json_str = String::from_utf8_lossy(&output.stdout);
        let json_value: serde_json::Value = serde_json::from_str(&json_str)?;

        let title = json_value["title"].as_str().map(|s| s.to_string());
        let description = json_value["description"].as_str().map(|s| s.to_string());
        let thumbnail = json_value["thumbnail"].as_str().map(|s| s.to_string());
        let duration = json_value["duration"].as_f64().map(|d| {
            let hours = (d / 3600.0) as u32;
            let minutes = ((d % 3600.0) / 60.0) as u32;
            let seconds = (d % 60.0) as u32;
            format!("{:02}:{:02}:{:02}", hours, minutes, seconds)
        });

        Ok(VideoMetadata {
            ok: true,
            title,
            description,
            thumbnail: thumbnail.clone(),
            image: thumbnail,
            duration,
        })
    }

    pub async fn get_formats(url: &str) -> Result<FormatsResponse> {
        info!("Fetching formats for URL: {}", url);
        
        let output = Command::new("yt-dlp")
            .args([
                "--list-formats",
                "--dump-json",
                url
            ])
            .output()
            .await?;

        if !output.status.success() {
            let error = String::from_utf8_lossy(&output.stderr);
            error!("yt-dlp formats error: {}", error);
            return Ok(FormatsResponse {
                ok: false,
                formats: vec![],
            });
        }

        let json_str = String::from_utf8_lossy(&output.stdout);
        let mut formats = Vec::new();

        // parse each line as a separate JSON object
        for line in json_str.lines() {
            if let Ok(json_value) = serde_json::from_str::<serde_json::Value>(line) {
                if let Some(format_id) = json_value["format_id"].as_str() {
                    let height = json_value["height"].as_u64();
                    let ext = json_value["ext"].as_str().unwrap_or("mp4");
                    let vcodec = json_value["vcodec"].as_str();
                    
                    // include video formats
                    if vcodec.is_some() && vcodec != Some("none") {
                        let label = if let Some(h) = height {
                            format!("{}p ({})", h, ext)
                        } else {
                            format!("{} ({})", format_id, ext)
                        };
                        
                        formats.push(VideoFormat {
                            format_id: format_id.to_string(),
                            label,
                        });
                    }
                }
            }
        }

        formats.sort_by(|a, b| {
            let a_height = extract_height(&a.label);
            let b_height = extract_height(&b.label);
            b_height.cmp(&a_height)
        });

        formats.insert(0, VideoFormat {
            format_id: "best".to_string(),
            label: "Best Quality".to_string(),
        });

        Ok(FormatsResponse {
            ok: true,
            formats,
        })
    }

    pub async fn process_clip(job_manager: Arc<JobManager>, job_id: Uuid) {
        let job = match job_manager.get_job(&job_id) {
            Some(job) => job,
            None => {
                error!("Job not found: {}", job_id);
                return;
            }
        };

        info!("Processing clip job: {}", job_id);

        let public_dir = job_manager.get_public_dir();
        let output_path = public_dir.join(format!("{}.mp4", job_id));

        let result = Self::download_and_clip(
            &job.request.url,
            &job.request.start_time,
            &job.request.end_time,
            &job.request.crop_ratio,
            &job.request.format_id,
            &output_path,
        ).await;

        match result {
            Ok(_) => {
                info!("Clip processing completed: {}", job_id);
                job_manager.update_job_status(
                    &job_id,
                    JobStatus::Ready,
                    None,
                    Some(output_path.to_string_lossy().to_string()),
                );
            }
            Err(e) => {
                error!("Clip processing failed: {} - {}", job_id, e);
                job_manager.update_job_status(
                    &job_id,
                    JobStatus::Error,
                    Some(e.to_string()),
                    None,
                );
            }
        }
    }

    async fn download_and_clip(
        url: &str,
        start_time: &str,
        end_time: &str,
        crop_ratio: &str,
        format_id: &str,
        output_path: &PathBuf,
    ) -> Result<()> {
        info!("Downloading and clipping video from: {}", url);

        let temp_download = output_path.with_file_name(format!("temp_{}.mp4", 
            output_path.file_stem().unwrap().to_string_lossy()));

        let mut yt_dlp_cmd = Command::new("yt-dlp");
        yt_dlp_cmd.args([
            "-f", format_id,
            "-o", temp_download.to_str().unwrap(),
            url
        ]);

        let download_output = yt_dlp_cmd.output().await?;
        
        if !download_output.status.success() {
            let error = String::from_utf8_lossy(&download_output.stderr);
            return Err(anyhow!("yt-dlp download failed: {}", error));
        }

        let mut ffmpeg_cmd = Command::new("ffmpeg");
        ffmpeg_cmd.args([
            "-i", temp_download.to_str().unwrap(),
            "-ss", start_time,
            "-to", end_time,
            "-c", "copy",
        ]);

        if crop_ratio == "vertical" {
            ffmpeg_cmd.args([
                "-vf", "crop=ih*9/16:ih",
                "-c:a", "copy",
            ]);
        }

        ffmpeg_cmd.args([
            "-avoid_negative_ts", "make_zero",
            output_path.to_str().unwrap()
        ]);

        let clip_output = ffmpeg_cmd.output().await?;

        let _ = tokio::fs::remove_file(&temp_download).await;

        if !clip_output.status.success() {
            let error = String::from_utf8_lossy(&clip_output.stderr);
            return Err(anyhow!("ffmpeg clipping failed: {}", error));
        }

        info!("Video clipping completed successfully");
        Ok(())
    }
}

fn extract_height(label: &str) -> u32 {
    if let Some(captures) = regex::Regex::new(r"(\d+)p").unwrap().captures(label) {
        captures[1].parse().unwrap_or(0)
    } else {
        0
    }
}