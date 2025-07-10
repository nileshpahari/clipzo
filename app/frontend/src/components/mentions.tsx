"use client";

import { motion } from "motion/react";
import Link from "next/link";

export default function Mentions() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-xl border border-border bg-card/50 backdrop-blur-md p-6 shadow-lg"
      >
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-foreground"
        >
          Special Mentions
        </motion.h1>

        <p className="text-muted-foreground text-sm mt-2">
          This project would not have been what it is without the following:
        </p>

        <ul className="space-y-3 mt-4 text-muted-foreground text-md">
          <li>
            <span className="text-primary text-lg">
              <Link
                href="https://github.com/yt-dlp/yt-dlp"
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Yt-dlp
              </Link>
            </span>
            : For downloading the video/audio.
          </li>

          <li>
            <span className="text-primary text-lg">
              <Link
                href="https://ffmpeg.org"
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                FFmpeg
              </Link>
            </span>
            : For processing the video/audio.
          </li>

          <li>
            <span className="text-primary text-lg">
              <Link
                href="https://clippa.in"
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                clippa.in
              </Link>
            </span>
            : Design inspiration.
          </li>

          <li>
            <span className="text-primary text-lg">
              <Link
                href="https://ytdlp.online"
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                ytdlp.online
              </Link>
            </span>
            : Feature inspiration.
          </li>
        </ul>

        <div className="text-muted-foreground text-sm mt-4">
          And all the other libraries/frameworks used in this project.
          <div>(See <code>package.json</code> and <code>Cargo.toml</code> for more details.)</div>
        </div>
      </motion.div>
    </main>
  );
}
