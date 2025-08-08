import { VideoInfo } from "@/types"

const INFO_LS_KEY = "yt-info-cache"

export function readInfoCache(): Record<string, VideoInfo> {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(localStorage.getItem(INFO_LS_KEY) || "{}")
  } catch {
    return {}
  }
}

export function writeInfoCache(cache: Record<string, VideoInfo>) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(INFO_LS_KEY, JSON.stringify(cache))
  } catch {}
}

export function formatDuration(s?: number) {
  if (!s && s !== 0) return ""
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return [h, m, sec]
    .map((v, i) => (i === 0 ? String(v) : String(v).padStart(2, "0")))
    .filter((v, i) => v !== "0" || i > 0 || h > 0)
    .join(":")
}
