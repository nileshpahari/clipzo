// "use client"

// import { useState, useEffect, useRef } from "react"
// import { Button } from "@/components/ui/button"
// import { Terminal, ChevronUp, Loader2 } from 'lucide-react'
// import { motion, AnimatePresence } from "motion/react"

// export interface LogEntry {
//   timestamp: string
//   level: "info" | "error" | "warning" | "success"
//   message: string
// }

// interface LogsDropdownProps {
//   /** Whether the logs dropdown is currently open */
//   isOpen: boolean
//   /** Function to toggle the dropdown open/closed state */
//   onToggle: () => void
//   /** Array of log entries to display */
//   logs: LogEntry[]
//   /** Whether logs are currently being fetched */
//   isLoading?: boolean
//   /** Function to fetch logs when dropdown is opened */
//   onFetchLogs?: () => void
//   /** Title to display in the logs header */
//   title?: string
//   /** Maximum height of the logs container */
//   maxHeight?: string
//   /** Whether to show the toggle button */
//   showToggleButton?: boolean
//   /** Custom CSS classes for the container */
//   className?: string
//   /** Position of the dropdown relative to the trigger */
//   position?: "top" | "bottom"
//   /** Whether to auto-scroll to bottom when new logs are added */
//   autoScroll?: boolean
// }

// export default function LogsDropdown({
//   isOpen,
//   onToggle,
//   logs,
//   isLoading = false,
//   onFetchLogs,
//   title = "Processing Logs",
//   maxHeight = "16rem", // h-64 equivalent
//   showToggleButton = true,
//   className = "",
//   position = "top",
//   autoScroll = true,
// }: LogsDropdownProps) {
//   const logsEndRef = useRef<HTMLDivElement>(null)

//   // Auto-scroll to bottom when new logs are added
//   useEffect(() => {
//     if (autoScroll && logsEndRef.current) {
//       logsEndRef.current.scrollIntoView({ behavior: "smooth" })
//     }
//   }, [logs, autoScroll])

//   // Fetch logs when dropdown is opened for the first time
//   useEffect(() => {
//     if (isOpen && logs.length === 0 && onFetchLogs && !isLoading) {
//       onFetchLogs()
//     }
//   }, [isOpen, logs.length, onFetchLogs, isLoading])

//   const formatTimestamp = (timestamp: string) => {
//     return new Date(timestamp).toLocaleTimeString("en-US", {
//       hour12: false,
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//     })
//   }

//   const getLogColor = (level: LogEntry["level"]) => {
//     switch (level) {
//       case "error":
//         return "text-red-400"
//       case "warning":
//         return "text-yellow-400"
//       case "success":
//         return "text-green-400"
//       default:
//         return "text-gray-300"
//     }
//   }

//   const getLogIcon = (level: LogEntry["level"]) => {
//     switch (level) {
//       case "error":
//         return "✕"
//       case "warning":
//         return "⚠"
//       case "success":
//         return "✓"
//       default:
//         return "•"
//     }
//   }

//   return (
//     <>
//       {/* Toggle Button */}
//       {showToggleButton && (
//         <Button 
//           variant="outline" 
//           size="icon" 
//           onClick={onToggle} 
//         //   className="bg-transparent"
//           aria-label="Toggle logs"
//         >
//           <Terminal className="h-4 w-4" />
//           {isOpen && (
//             <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
//           )}
//         </Button>
//       )}

//       {/* Logs Dropdown */}
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: "auto" }}
//             exit={{ opacity: 0, height: 0 }}
//             className={`${
//               position === "top" 
//                 ? "fixed top-20 left-4 right-4 z-10" 
//                 : "absolute bottom-full left-0 right-0 mb-2"
//             } max-w-3xl mx-auto ${className}`}
//           >
//             <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden">
//               {/* Header */}
//               <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
//                 <div className="flex items-center gap-2">
//                   <Terminal className="w-4 h-4 text-green-400" />
//                   <span className="text-sm font-medium text-gray-200">{title}</span>
//                   {isLoading && <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
//                   {logs.length > 0 && (
//                     <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
//                       {logs.length} entries
//                     </span>
//                   )}
//                 </div>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={onToggle}
//                   className="text-gray-400 hover:text-gray-200 p-1"
//                   aria-label="Close logs"
//                 >
//                   <ChevronUp className="w-4 h-4" />
//                 </Button>
//               </div>

//               {/* Logs Content */}
//               <div 
//                 className="overflow-y-auto bg-gray-900 font-mono text-xs"
//                 style={{ height: maxHeight }}
//               >
//                 {isLoading && logs.length === 0 ? (
//                   <div className="flex items-center justify-center h-full text-gray-400">
//                     <Loader2 className="w-4 h-4 animate-spin mr-2" />
//                     Loading logs...
//                   </div>
//                 ) : logs.length === 0 ? (
//                   <div className="flex items-center justify-center h-full text-gray-500">
//                     No logs available
//                   </div>
//                 ) : (
//                   <div className="p-3 space-y-1">
//                     {logs.map((log, index) => (
//                       <div key={index} className="flex items-start gap-2 hover:bg-gray-800/50 px-2 py-1 rounded">
//                         <span className="text-gray-500 shrink-0 text-[10px] mt-0.5">
//                           {formatTimestamp(log.timestamp)}
//                         </span>
//                         <span className={`shrink-0 w-3 text-center ${getLogColor(log.level)}`}>
//                           {getLogIcon(log.level)}
//                         </span>
//                         <span className={`uppercase text-[10px] font-bold shrink-0 w-8 ${getLogColor(log.level)}`}>
//                           {log.level}
//                         </span>
//                         <span className="text-gray-300 break-all leading-relaxed">{log.message}</span>
//                       </div>
//                     ))}
//                     {autoScroll && <div ref={logsEndRef} />}
//                   </div>
//                 )}
//               </div>

//               {/* Footer with stats */}
//               {logs.length > 0 && (
//                 <div className="px-3 py-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
//                   <div className="flex justify-between items-center">
//                     <span>
//                       {logs.filter(l => l.level === 'error').length} errors, {' '}
//                       {logs.filter(l => l.level === 'warning').length} warnings, {' '}
//                       {logs.filter(l => l.level === 'success').length} success
//                     </span>
//                     <span>Last updated: {logs.length > 0 ? formatTimestamp(logs[logs.length - 1].timestamp) : 'N/A'}</span>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   )
// }


"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Terminal, ChevronUp, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from "motion/react"

export interface LogEntry {
  timestamp: string
  level: "info" | "error" | "warning" | "success"
  message: string
}

interface LogsDropdownProps {
  /** Whether the logs dropdown is currently open */
  isOpen: boolean
  /** Function to toggle the dropdown open/closed state */
  onToggle: () => void
  /** Array of log entries to display */
  logs: LogEntry[]
  /** Whether logs are currently being fetched */
  isLoading?: boolean
  /** Function to fetch logs when dropdown is opened */
  onFetchLogs?: () => void
  /** Title to display in the logs header */
  title?: string
  /** Maximum height of the logs container */
  maxHeight?: string
  /** Whether to show the toggle button */
  showToggleButton?: boolean
  /** Custom CSS classes for the container */
  className?: string
  /** Whether to auto-scroll to bottom when new logs are added */
  autoScroll?: boolean
}

export default function LogsDropdown({
  isOpen,
  onToggle,
  logs,
  isLoading = false,
  onFetchLogs,
  title = "Processing Logs",
  maxHeight = "16rem", // h-64 equivalent
  showToggleButton = true,
  className = "",
  autoScroll = true,
}: LogsDropdownProps) {
  const logsEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [logs, autoScroll])

  // Fetch logs when dropdown is opened for the first time
  useEffect(() => {
    if (isOpen && logs.length === 0 && onFetchLogs && !isLoading) {
      onFetchLogs()
    }
  }, [isOpen, logs.length, onFetchLogs, isLoading])

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const getLogColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "error":
        return "text-red-500 dark:text-red-400"
      case "warning":
        return "text-yellow-600 dark:text-yellow-400"
      case "success":
        return "text-green-600 dark:text-green-400"
      default:
        return "text-foreground"
    }
  }

  const getLogIcon = (level: LogEntry["level"]) => {
    switch (level) {
      case "error":
        return "✕"
      case "warning":
        return "⚠"
      case "success":
        return "✓"
      default:
        return "•"
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Toggle Button */}
      {showToggleButton && (
        <Button
          variant="outline"
          // size="icon"
          onClick={onToggle}
          className="relative bg-transparent flex justify-start gap-2 w-full"
          aria-label="Toggle logs"
        >
          <Terminal className="h-4 w-4" />
          Logs
          {isOpen && <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
        </Button>
      )}

      {/* Logs Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="w-full top-full right-0 mt-2 max-w-[90vw] z-50"
          >
            <div className="bg-card border border-border rounded-lg shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-3 bg-muted/50 border-b border-border">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-foreground">{title}</span>
                  {isLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
                  {logs.length > 0 && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {logs.length} entries
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="text-muted-foreground hover:text-foreground p-1 h-auto"
                  aria-label="Close logs"
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
              </div>

              {/* Logs Content */}
              <div className="overflow-y-auto bg-card font-mono text-xs" style={{ height: maxHeight }}>
                {isLoading && logs.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Loading logs...
                  </div>
                ) : logs.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No logs available
                  </div>
                ) : (
                  <div className="p-3 space-y-1">
                    {logs.map((log, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 hover:bg-muted/30 px-2 py-1 rounded transition-colors"
                      >
                        <span className="text-muted-foreground shrink-0 text-[10px] mt-0.5">
                          {formatTimestamp(log.timestamp)}
                        </span>
                        <span className={`shrink-0 w-3 text-center ${getLogColor(log.level)}`}>
                          {getLogIcon(log.level)}
                        </span>
                        <span className={`uppercase text-[10px] font-bold shrink-0 w-8 ${getLogColor(log.level)}`}>
                          {log.level}
                        </span>
                        <span className="text-foreground break-all leading-relaxed">{log.message}</span>
                      </div>
                    ))}
                    {autoScroll && <div ref={logsEndRef} />}
                  </div>
                )}
              </div>

              {/* Footer with stats */}
              {logs.length > 0 && (
                <div className="px-3 py-2 bg-muted/30 border-t border-border text-xs text-muted-foreground">
                  <div className="flex justify-between items-center">
                    <span>
                      <span className="text-red-500 dark:text-red-400">
                        {logs.filter((l) => l.level === "error").length} errors
                      </span>
                      {", "}
                      <span className="text-yellow-600 dark:text-yellow-400">
                        {logs.filter((l) => l.level === "warning").length} warnings
                      </span>
                      {", "}
                      <span className="text-green-600 dark:text-green-400">
                        {logs.filter((l) => l.level === "success").length} success
                      </span>
                    </span>
                    <span>
                      Last: {logs.length > 0 ? formatTimestamp(logs[logs.length - 1].timestamp) : "N/A"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
