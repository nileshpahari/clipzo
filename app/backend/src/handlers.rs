use crate::{models::*, services::*, AppState};
use axum::{
    extract::{Path, Query, State},
    http::{header, StatusCode},
    response::{IntoResponse, Json, Response},
};
use std::sync::Arc;
use tracing::{error, info};
use uuid::Uuid;

pub async fn get_metadata(
    Query(params): Query<MetadataQuery>,
) -> Result<Json<VideoMetadata>, StatusCode> {
    match VideoService::get_metadata(&params.url).await {
        Ok(metadata) => Ok(Json(metadata)),
        Err(e) => {
            error!("Failed to get metadata: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_formats(
    Query(params): Query<FormatsQuery>,
) -> Result<Json<FormatsResponse>, StatusCode> {
    match VideoService::get_formats(&params.url).await {
        Ok(formats) => Ok(Json(formats)),
        Err(e) => {
            error!("Failed to get formats: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn create_clip_job(
    State(job_manager): State<AppState>,
    Json(request): Json<ClipRequest>,
) -> Result<Json<ClipResponse>, StatusCode> {
    info!("Creating clip job for URL: {}", request.url);
    
    let job_id = job_manager.create_job(request);
    
    let job_manager_clone = Arc::clone(&job_manager);
    tokio::spawn(async move {
        VideoService::process_clip(job_manager_clone, job_id).await;
    });
    
    Ok(Json(ClipResponse {
        id: job_id.to_string(),
    }))
}

pub async fn get_job_status(
    State(job_manager): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<JobStatusResponse>, StatusCode> {
    let job_id = match Uuid::parse_str(&id) {
        Ok(id) => id,
        Err(_) => return Err(StatusCode::BAD_REQUEST),
    };

    match job_manager.get_job(&job_id) {
        Some(job) => Ok(Json(JobStatusResponse {
            status: job.status,
            error: job.error,
            url: job.file_path,
        })),
        None => Err(StatusCode::NOT_FOUND),
    }
}

pub async fn download_clip(
    State(job_manager): State<AppState>,
    Path(id): Path<String>,
) -> Result<Response, StatusCode> {
    let job_id = match Uuid::parse_str(&id) {
        Ok(id) => id,
        Err(_) => return Err(StatusCode::BAD_REQUEST),
    };

    let job = match job_manager.get_job(&job_id) {
        Some(job) => job,
        None => return Err(StatusCode::NOT_FOUND),
    };

    let file_path = match job.file_path {
        Some(path) => path,
        None => return Err(StatusCode::NOT_FOUND),
    };

    match tokio::fs::read(&file_path).await {
        Ok(file_contents) => {
            let response = Response::builder()
                .status(StatusCode::OK)
                .header(header::CONTENT_TYPE, "video/mp4")
                .header(
                    header::CONTENT_DISPOSITION,
                    "attachment; filename=\"clip.mp4\"",
                )
                .body(file_contents.into())
                .unwrap();
            
            let _ = tokio::fs::remove_file(&file_path).await;
            
            Ok(response)
        }
        Err(e) => {
            error!("Failed to read file {}: {}", file_path, e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}