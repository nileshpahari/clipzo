import { LogEntry } from "@/components/logs-dropdown";

export const dummyLogs: LogEntry[] = [
    { timestamp: new Date().toISOString(), level: "info", message: "Starting video processing..." },
    {
      timestamp: new Date(Date.now() - 1000).toISOString(),
      level: "info",
      message: "Fetching video metadata from YouTube",
    },
    {
      timestamp: new Date(Date.now() - 2000).toISOString(),
      level: "success",
      message: "Video metadata retrieved successfully",
    },
    {
      timestamp: new Date(Date.now() - 3000).toISOString(),
      level: "info",
      message: "Initializing video download stream",
    },
    { timestamp: new Date(Date.now() - 4000).toISOString(), level: "info", message: "Processing video segments..." },
    {
      timestamp: new Date(Date.now() - 5000).toISOString(),
      level: "warning",
      message: "High quality format selected, processing may take longer",
    },
    {
      timestamp: new Date(Date.now() - 6000).toISOString(),
      level: "info",
      message: "Applying crop ratio: vertical (9:16)",
    },
    { timestamp: new Date(Date.now() - 7000).toISOString(), level: "info", message: "Extracting audio track..." },
    { timestamp: new Date(Date.now() - 8000).toISOString(), level: "info", message: "Generating subtitle track..." },
    {
      timestamp: new Date(Date.now() - 9000).toISOString(),
      level: "success",
      message: "Video processing completed successfully",
    },
    {
      timestamp: new Date(Date.now() - 10000).toISOString(),
      level: "info",
      message: "Uploading processed video to storage...",
    },
    {
      timestamp: new Date(Date.now() - 11000).toISOString(),
      level: "success",
      message: "Upload completed. Video ready for download.",
    },
  ]

export const platformThumbnails = {
    youtube: "https://yourcdn.com/youtube-fallback.jpg",
    instagram: "https://yourcdn.com/instagram-fallback.jpg",
    reddit: "https://yourcdn.com/reddit-fallback.jpg",
    default: "https://placehold.co/640x360?text=Preview+Unavailable&icon=play",
};

export const specialOptions = [
    // {key: "best_quality", label: "Best Quality"},
    {key: "extract_audio", label: "Extract Audio (MP3)"},
    {key: "download_subtitles", label: "Download Subtitles (English)"},
    {key: "dump_json_info", label: "Dump Json Info"},
    // {key: "best_audio", label: "Best Quality Audio"},
]
