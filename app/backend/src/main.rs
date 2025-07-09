use axum::{
    extract::{Path, Query, State},
    http::{header, StatusCode},
    response::{IntoResponse, Json, Response},
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, sync::Arc};
use tower_http::cors::CorsLayer;
use tracing::{error, info};

mod handlers;
mod models;
mod services;
mod utils;

use handlers::*;
use models::*;
use services::*;

pub type AppState = Arc<JobManager>;


#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt::init();

    let job_manager = Arc::new(JobManager::new());

    let app = Router::new()
        .route("/metadata", get(get_metadata))
        .route("/formats", get(get_formats))
        .route("/clip", post(create_clip_job))
        .route("/clip/:id", get(get_job_status))
        .route("/clip/:id/download", get(download_clip))
        .layer(CorsLayer::permissive())
        .with_state(job_manager);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:5001").await?;
    info!("Server running on http://localhost:5001");
    
    axum::serve(listener, app).await?;
    Ok(())
}