"use client"
import { motion } from "framer-motion";

export default function Onboarding() {
    return (
    <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
      <motion.h1
        className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        Paste. Pick. <span className="text-primary">Play.</span>
      </motion.h1>

      <motion.div
        className="mt-4 text-lg sm:text-xl text-muted-foreground text-center space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <p className="max-w-xl mx-auto font-medium">
          Clip videos, and extract audio from
          YouTube, Instagram, Reddit, Twitter, Pinterest, and many more.
        </p>
      </motion.div>

      <motion.button
        className="mt-6 bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-100 transition text-base font-semibold shadow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        Get Started
      </motion.button>

      <motion.p
        className="mt-2 text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        No watermark · 100% free
      </motion.p>
    </div>
    )
}