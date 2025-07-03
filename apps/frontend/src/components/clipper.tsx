"use client";
import LogsDropdown, { type LogEntry } from "@/components/logs-dropdown";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Loader2, Monitor, Smartphone, ArrowDown } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
// import{ useSession } from "next-auth/react";
import { dummyLogs, platformThumbnails, specialOptions } from "@/constants";
import { useRouter } from "next/navigation";

export default function Clipper() {
  const defaultOption = "Select an option";
  interface Metadata {
    title: string | null;
    description: string | null;
    thumbnail: string | null;
    duration: string | null;
  }
  const defaultMetadata: Metadata = {
    title: null,
    description: null,
    thumbnail: null,
    duration: null,
  };
  // const {data: session} = useSession()
  const session = 1;
  const router = useRouter();

  // states
  const [url, setUrl] = useState("");
  const [startTime, setStartTime] = useState("00:00:00");
  const [endTime, setEndTime] = useState("00:00:00");
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(defaultOption);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Metadata>(defaultMetadata);
  const [cropRatio, setCropRatio] = useState<"original" | "vertical">(
    "original"
  );
  const [formats, setFormats] = useState<
    { format_id: string; label: string }[]
  >([]);
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [isMetadataLoading, setIsMetadataLoading] = useState(true);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push("/signin");
    }
  }, [session]);

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // In a real implementation, you would fetch from your backend:
      // const response = await fetch('/api/logs');
      // const logsData = await response.json();
      setLogs(dummyLogs);
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogs([
        {
          timestamp: new Date().toISOString(),
          level: "error",
          message: "Failed to fetch logs from server",
        },
      ]);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const toggleLogs = () => {
    setShowLogs(!showLogs);
  };

  // const getVideoId = (url: string) => { const regExp =
  //     /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  //   const match = url.match(regExp);
  //   return match && match[7].length === 11 ? match[7] : null;
  // };

  const fetchMetadata = async (url: string | null) => {
    if (!url) return;
    setIsMetadataLoading(true);
    try {
      const metadataResponse = await axios.get(
        `/api/metadata?url=${encodeURIComponent(url)}`
      );
      if (!metadataResponse.data.ok)
        throw new Error("Failed to fetch video metadata");
      const metadata = await metadataResponse.data;
      setMetadata({
        title: metadata.title,
        description: metadata.description,
        thumbnail: metadata.thumbnail,
        duration: metadata.duration,
      });
      //change it to different thumbnails for different platforms (atleast for planned platforms)
      setThumbnailUrl(
        metadata.image ? metadata.image : platformThumbnails.default
      );

      // Fetch formats
      const formatsResponse = await axios.get(
        `/api/formats?url=${encodeURIComponent(url)}`
      );
      if (formatsResponse.data.ok) {
        const formatsData = await formatsResponse.data;
        setFormats(formatsData.formats ?? []);
        if (formatsData.formats?.length > 0) {
          setSelectedFormat(formatsData.formats[0].format_id);
        }
      }
    } catch (error) {
      console.error("Error fetching metadata:", error);
      // Fallback to placeholder thumbnail
      setThumbnailUrl(platformThumbnails.default);
    } finally {
      setIsMetadataLoading(false);
    }
  };

  // Show skeleton immediately by setting thumbnailUrl
  useEffect(() => {
    if (url) {
      setThumbnailUrl("loading");
      setIsMetadataLoading(true);
      fetchMetadata(url);
    } else {
      setThumbnailUrl(null);
      setMetadata({});
      setFormats([]);
      setSelectedFormat("");
      setIsMetadataLoading(false);
      setSelectedOption(defaultOption);
    }
  }, [url]);

  const handleSubmit = async (e: React.FormEvent) => {
    toast("Feature under development");
    e.preventDefault();

    setLoading(true);

    try {
      // Step 1: kick-off processing
      const clipKickoff = await fetch("/api/clip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          startTime,
          endTime,
          cropRatio,
          subtitles: addSubs,
          formatId: selectedFormat,
          userId: session?.user?.id,
        }),
      });

      if (!clipKickoff.ok) {
        const errJson = await clipKickoff.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to start processing");
      }

      const { id } = (await clipKickoff.json()) as { id: string };

      // Step 2: poll until ready
      type JobStatus = "processing" | "ready" | "error";
      interface JobStatusResponse {
        status: JobStatus;
        error?: string;
        url?: string;
      }

      let status: JobStatus = "processing";
      while (status === "processing") {
        await new Promise((r) => setTimeout(r, 3000)); // 3-second polling
        const pollRes = await fetch(`/api/clip/${id}`);
        if (!pollRes.ok) throw new Error("Failed to poll job status");
        const pollJson = (await pollRes.json()) as JobStatusResponse;
        status = pollJson.status;
        if (status === "error")
          throw new Error(pollJson.error || "Processing failed");
      }

      // Step 3: Download via frontend route (handles Supabase download and cleanup)
      const downloadRes = await fetch(`/api/clip/${id}/download`);
      if (!downloadRes.ok) throw new Error("Failed to download clip");

      const blob = await downloadRes.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "clip.mp4";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      a.remove();

      // // Update download count
      // const newCount = downloadCount + 1;
      // if (session?.user?.id) {
      //   localStorage.setItem(`bangers-${session.user.id}`, String(newCount));
      // }
      // setDownloadCount(newCount);
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      // Add user-friendly error handling here
    } finally {
      setLoading(false);
    }
  };

  const resolutionOptions = {
    original: { icon: <Monitor className="w-4 h-4" />, label: "Original" },
    vertical: { icon: <Smartphone className="w-4 h-4" />, label: "Vertical" },
  } as const;

  return (
    <main className="flex flex-col w-full h-full min-h-screen p-4 gap-4 max-w-3xl mx-auto items-center justify-center">
      <section className="flex flex-col w-full gap-4 max-w-2xl mx-auto transition-all duration-300">
        <AnimatePresence mode="wait">
          {!isMetadataLoading && thumbnailUrl === null ? (
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-2xl lg:text-3xl font-medium tracking-tight text-center mx-auto"
            >
              What do you wanna clip?
            </motion.h1>
          ) : isMetadataLoading ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-6 h-full w-fit mx-auto"
            >
              <div className="flex flex-col md:flex-row gap-4 bg-muted/50 p-2 rounded-lg items-center">
                <div className="w-20 h-[45px] bg-muted animate-pulse rounded-md" />
                <div className="flex flex-col gap-2">
                  <div className="h-6 w-48 bg-muted animate-pulse rounded-md" />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-6 h-full w-fit mx-auto"
            >
              <div className="flex flex-col md:flex-row gap-4 bg-muted/50 p-2 rounded-lg md:items-center">
                {thumbnailUrl && (
                  <Image
                    unoptimized
                    width={1280}
                    height={720}
                    src={thumbnailUrl}
                    alt="Video thumbnail"
                    className="w-20 object-cover aspect-video rounded-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src.includes("maxresdefault")) {
                        target.src = target.src.replace(
                          "maxresdefault",
                          "hqdefault"
                        );
                      }
                    }}
                  />
                )}
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium text-lg line-clamp-1">
                    {metadata.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          onSubmit={handleSubmit}
          className="flex flex-col gap-12 border p-4 bg-card rounded-3xl"
        >
          <div className="flex items-center gap-2 w-full">
            <input
              type="text"
              id="url"
              placeholder="Paste video url here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="bg-transparent border-none outline-none w-full"
            />
            <Button type="submit" size="icon" disabled={loading}>
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <ArrowDown className="w-6 h-6" />
              )}
            </Button>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <div className="flex gap-3 w-full items-center">
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="startTime" className="sr-only">
                  Start Time
                </Label>
                <Input
                  type="text"
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
                  placeholder="00:00:00"
                  required
                  className="font-mono text-sm"
                />
              </div>
              <span className="text-sm text-muted-foreground">to</span>
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="endTime" className="sr-only">
                  End Time
                </Label>
                <Input
                  type="text"
                  id="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
                  placeholder="00:00:00"
                  required
                  className="font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <Label htmlFor="cropRatio" className="sr-only">
                Crop Ratio
              </Label>
              <div className="flex items-center justify-between p-2 rounded-2xl border relative bg-white/5 backdrop-blur-md">
                {Object.entries(resolutionOptions).map(
                  ([key, { icon, label }]) => (
                    <div
                      key={key}
                      onClick={() => setCropRatio(key as typeof cropRatio)}
                      className="relative cursor-pointer w-full group text-center py-1.5 overflow-visible hover:scale-105 transition-all duration-300 ease-[cubic-bezier(0.175, 0.885, 0.32, 1.275)] px-4"
                    >
                      {cropRatio === key && (
                        <motion.div
                          layoutId="hover"
                          className="absolute inset-0 bg-primary rounded-md"
                          transition={{
                            type: "spring",
                            stiffness: 120,
                            damping: 10,
                            mass: 0.2,
                            ease: [0, 1, 0.35, 0],
                          }}
                        />
                      )}
                      <span
                        className={`relative flex text-xs sm:text-sm items-center gap-2 justify-center ${
                          cropRatio === key
                            ? "text-primary-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {icon}
                        <span>{label}</span>
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <div className="flex flex-col gap-2 flex-1">
                <Label htmlFor="quality">Quality</Label>
                <select
                  id="quality"
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="bg-transparent border rounded-md p-2 h-10 flex items-center appearance-none bg-no-repeat bg-right bg-[length:16px] pr-8"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 8px center",
                  }}
                  disabled={formats.length === 0}
                >
                  {formats.length === 0 ? (
                    <option value="">Loading formats...</option>
                  ) : (
                    formats.map((format) => (
                      <option key={format.format_id} value={format.format_id}>
                        {format.label}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex flex-col gap-2 flex-1">
                <Label htmlFor="subtitles-switch">Options</Label>
                <div className="flex items-center space-x-2 h-10">
                  {/* <Switch
                    id="subtitles-switch"
                    checked={addSubs}
                    onCheckedChange={setAddSubs}
                  />
                  <Label htmlFor="subtitles-switch" className="text-sm text-muted-foreground">
                    English only
                  </Label> */}
                  <select
                    id="quality"
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="bg-transparent border rounded-md p-2 h-10 flex items-center appearance-none bg-no-repeat bg-right bg-[length:16px] pr-8"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: "right 8px center",
                    }}
                    disabled={url === ""}
                  >
                    <option value={defaultOption} disabled hidden>
                      {defaultOption}
                    </option>
                    {specialOptions.length === 0 ? (
                      <option value="">Loading options...</option>
                    ) : (
                      specialOptions.map((option) => (
                        <option key={option.key} value={option.key}>
                          {option.label}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </motion.form>
        {/* <AnimatePresence mode="wait">
          {downloadCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center mt-4 text-sm text-muted-foreground"
            >
              🔥 {downloadCount} banger{downloadCount > 1 && "s"} clipped
            </motion.div>
          )}
        </AnimatePresence> */}
        <div className="w-full">
          <LogsDropdown
            isOpen={showLogs}
            onToggle={toggleLogs}
            logs={logs}
            isLoading={isLoadingLogs}
            onFetchLogs={fetchLogs}
            title="Video Processing Logs"
            maxHeight="20rem"
          />
        </div>
        <Toaster />
      </section>
    </main>
  );
}
