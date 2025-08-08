import Head from "next/head"
import {
  AspectRatio,
  Button,
  Container,
  Flex,
  Heading,
  Image,
  Stack,
  Text
} from "@chakra-ui/react"

import { useForm } from "react-hook-form"
import { extractYouTubeVideoId, getThumb } from "@/utils/url-helpers"
import {
  ClipboardEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"
import RecentList from "@/components/RecentList"
import { VideoInfo } from "@/types"
import {
  formatDuration,
  readInfoCache,
  writeInfoCache
} from "@/utils/local-storage"
import UrlInput from "@/components/UrlInput"

interface FormValues {
  url: string
}

const RECENT_LS_KEY = "recent-yt"

export default function Home() {
  const inflightController = useRef<AbortController | null>(null)

  const [videoInfoMap, setVideoInfoMap] = useState<Record<string, VideoInfo>>(
    {}
  )
  const [recent, setRecent] = useState<string[]>([])

  const currentIdRef = useRef<string>("")
  const [playerSrc, setPlayerSrc] = useState<string>("")
  const [iframeLoading, setIframeLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting, isValid },
    watch
  } = useForm<FormValues>({ mode: "onChange" })

  const url = (watch("url") || "").trim()

  const videoId = useMemo(() => {
    try {
      return extractYouTubeVideoId(url || "")
    } catch {
      return ""
    }
  }, [url])

  const currentId = currentIdRef.current || videoId
  const currentInfo = currentId ? videoInfoMap[currentId] : undefined
  const thumbnail = currentId ? getThumb(currentId) : ""

  useEffect(() => {
    // hydrate recent and info cache once
    try {
      const stored = JSON.parse(localStorage.getItem(RECENT_LS_KEY) || "[]")
      setRecent(stored)
    } catch {
      setRecent([])
    }
    setVideoInfoMap(readInfoCache())
  }, [])

  async function fetchVideoInfo(id: string): Promise<VideoInfo | null> {
    // try cache first
    const cache = readInfoCache()
    const cached = cache[id]
    if (cached) {
      setVideoInfoMap((m) => (m[id] ? m : { ...m, [id]: cached }))
      return cached
    }

    inflightController.current?.abort()
    inflightController.current = new AbortController()

    const res = await fetch(`/api/youtube/fetch?id=${encodeURIComponent(id)}`, {
      signal: inflightController.current.signal
    })
    if (!res.ok) return null

    const data = await res.json()
    const info: VideoInfo = {
      id: data.id,
      title: data.title,
      channelTitle: data.channelTitle,
      durationISO: data.durationISO,
      durationSeconds: data.durationSeconds,
      fetchedAt: Date.now()
    }

    const nextCache = { ...cache, [id]: info }
    writeInfoCache(nextCache)
    setVideoInfoMap(nextCache)

    return info
  }

  const loadVideo = (id: string, force?: boolean) => {
    if (!id) return
    if (!force && id === currentIdRef.current) return

    currentIdRef.current = id
    setIframeLoading(true)
    setPlayerSrc(
      `https://www.youtube-nocookie.com/embed/${id}?modestbranding=1&rel=0&playsinline=1`
    )

    // recent is an array of ids
    setRecent((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, 6)
      localStorage.setItem(RECENT_LS_KEY, JSON.stringify(next))
      return next
    })

    // fire-and-forget
    fetchVideoInfo(id).catch(() => {})
  }

  const clearRecent = () => {
    setRecent([])
    if (typeof window !== "undefined") localStorage.removeItem(RECENT_LS_KEY)
  }

  const onSubmit = handleSubmit((data) => {
    const { url } = data
    const id = extractYouTubeVideoId(url)
    if (!id) return
    loadVideo(id)
  })

  const handlePaste: ClipboardEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault()
    const text = e.clipboardData?.getData("text") || ""
    setValue("url", text, { shouldValidate: true })
    const id = extractYouTubeVideoId(text)
    if (id) loadVideo(id)
  }

  const handleReset = () => {
    reset({ url: "" })
    setPlayerSrc("")
    setIframeLoading(false)
    currentIdRef.current = ""
  }

  // derive VideoInfo[] for recent grid
  const recentInfos = useMemo(
    () => recent.map((id) => videoInfoMap[id]).filter(Boolean) as VideoInfo[],
    [recent, videoInfoMap]
  )

  return (
    <>
      <Head>
        <title>Distraction-Reduced YouTube Viewer</title>
        <meta
          name="description"
          content="Paste a YouTube link and watch with fewer distractions using privacy-enhanced embeds."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://www.youtube-nocookie.com" />
        <link rel="preconnect" href="https://i.ytimg.com" />
      </Head>

      <Container fluid p={5}>
        <Stack gap={10}>
          <Stack gap={1} textAlign="center">
            <Heading size="lg" color="whiteAlpha.900">
              Distraction-Reduced YouTube Viewer
            </Heading>
            <Text color="whiteAlpha.700" fontSize="sm">
              Uses YouTube’s privacy-enhanced embeds. No ad-circumvention.
            </Text>
          </Stack>

          <Stack>
            <UrlInput
              {...register("url", { required: "Paste a YouTube link" })}
              onPaste={handlePaste}
              error={errors.url?.message}
            />
            <Flex
              gap={2}
              direction={{ base: "column", md: "row" }}
              justify={"flex-end"}
            >
              <Button
                disabled={!isValid}
                loading={isSubmitting}
                onClick={onSubmit}
                borderRadius="full"
                size="lg"
                px={10}
                _hover={{ transform: "translateY(-1px)" }}
                bgGradient={"to-r"}
                // If using Chakra, consider:
                // bgGradient="linear(to-r, teal.300, cyan.400)"
                // and remove the custom gradientFrom/To props
                gradientFrom={"teal.300"}
                gradientTo={"cyan.400"}
                color="gray.900"
              >
                Play without Distractions
              </Button>
              <Button
                onClick={handleReset}
                borderRadius="full"
                size={"lg"}
                px={10}
                variant={"outline"}
              >
                Reset
              </Button>
            </Flex>
          </Stack>

          <Stack gap={1}>
            {currentInfo ? (
              <Flex
                justify="space-between"
                align="center"
                px={3}
                py={2}
                borderRadius="md"
                bg="blackAlpha.400"
              >
                <Text fontSize="sm">
                  <b>{currentInfo.title}</b> — {currentInfo.channelTitle}
                </Text>
                <Text fontSize="sm" opacity={0.8}>
                  {formatDuration(currentInfo.durationSeconds)}
                </Text>
              </Flex>
            ) : null}

            {playerSrc ? (
              <div style={{ position: "relative" }}>
                {!iframeLoading ? null : (
                  <AspectRatio ratio={16 / 9}>
                    <Image
                      src={thumbnail}
                      alt="Loading preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 12
                      }}
                    />
                  </AspectRatio>
                )}
                <AspectRatio ratio={16 / 9}>
                  <iframe
                    key={playerSrc}
                    src={playerSrc}
                    onLoad={() => setIframeLoading(false)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    style={{
                      border: 0,
                      borderRadius: 12,
                      opacity: iframeLoading ? 0 : 1,
                      transition: "opacity .2s ease"
                    }}
                  />
                </AspectRatio>
              </div>
            ) : null}
          </Stack>
        </Stack>

        <RecentList
          items={recentInfos}
          onClickVideo={(id) => loadVideo(id)}
          onClear={clearRecent}
        />
      </Container>
    </>
  )
}
