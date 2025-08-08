import type { NextApiRequest, NextApiResponse } from "next"
import { parseISODurationToSeconds } from "@/utils/time-utils"

const YT_API = "https://www.googleapis.com/youtube/v3/videos"
const YT_ID_RE = /^[a-zA-Z0-9_-]{11}$/ // basic YouTube ID check

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).json({ error: "Method not allowed" })
  }

  const id = typeof req.query.id === "string" ? req.query.id : undefined
  const key = process.env.YOUTUBE_API_KEY

  if (!id || !YT_ID_RE.test(id))
    return res.status(400).json({ error: "Missing or invalid ?id=VIDEO_ID" })

  if (!key)
    return res.status(500).json({ error: "Server missing YOUTUBE_API_KEY" })

  const apiUrl = `${YT_API}?part=contentDetails,snippet&id=${encodeURIComponent(id)}&key=${key}`

  try {
    const r = await fetch(apiUrl, { cache: "force-cache" })
    if (!r.ok) {
      const errBody = await r.json().catch(() => ({}))
      const reason = errBody?.error?.errors?.[0]?.reason
      const status = r.status
      if (status === 403 && reason === "quotaExceeded") {
        return res
          .status(429)
          .json({ error: "YouTube API quota exceeded. Try again later." })
      }
      return res
        .status(status || 500)
        .json({ error: "YouTube API error", detail: errBody?.error ?? null })
    }

    const data = await r.json()
    const item = data.items?.[0]
    if (!item) return res.status(404).json({ error: "Video not found" })

    const iso: string = item.contentDetails?.duration
    const seconds = parseISODurationToSeconds(iso)

    res.setHeader(
      "Cache-Control",
      "public, max-age=0, s-maxage=86400, stale-while-revalidate=3600"
    )
    return res.status(200).json({
      id: item.id,
      title: item.snippet?.title,
      channelTitle: item.snippet?.channelTitle,
      durationISO: iso,
      durationSeconds: seconds
    })
  } catch (e: unknown) {
    if (e instanceof Error) {
      return res.status(500).json({ error: "Server error", detail: e.message })
    }

    return res.status(500).json({ error: "Server error", detail: String(e) })
  }
}
