use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoMetadata {
    pub ok: bool,
    pub title: Option<String>,
    pub description: Option<String>,
    pub thumbnail: Option<String>,
    pub image: Option<String>,
    pub duration: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoFormat {
    pub format_id: String,
    pub label: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FormatsResponse {
    pub ok: bool,
    pub formats: Vec<VideoFormat>,
}

#[derive(Clone, Debug, Deserialize)]
pub struct ClipRequest {
    pub url: String,
    pub start_time: String,
    pub end_time: String,
    pub crop_ratio: String,
    pub format_id: String,
}

#[derive(Debug, Serialize)]
pub struct ClipResponse {
    pub id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum JobStatus {
    #[serde(rename = "processing")]
    Processing,
    #[serde(rename = "ready")]
    Ready,
    #[serde(rename = "error")]
    Error,
}

#[derive(Debug, Clone, Serialize)]
pub struct JobStatusResponse {
    pub status: JobStatus,
    pub error: Option<String>,
    pub url: Option<String>,
}

#[derive(Debug, Clone)]
pub struct Job {
    pub id: Uuid,
    pub status: JobStatus,
    pub error: Option<String>,
    pub file_path: Option<String>,
    pub request: ClipRequest,
}

#[derive(Debug, Deserialize)]
pub struct MetadataQuery {
    pub url: String,
}

#[derive(Debug, Deserialize)]
pub struct FormatsQuery {
    pub url: String,
}