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
import UrlInput from "@/components/UrlInput"

interface FormValues {
  url: string
}

export default function Home() {
  const currentIdRef = useRef<string>("")
  const [playerSrc, setPlayerSrc] = useState<string>("")
  const [iframeLoading, setIframeLoading] = useState(false)
  const [recent, setRecent] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting, isValid },
    watch
  } = useForm<FormValues>()

  const url = (watch("url") || "").trim()

  const videoId = useMemo(() => {
    try {
      return extractYouTubeVideoId(url || "")
    } catch {
      return ""
    }
  }, [url])

  const currentId = currentIdRef.current || videoId
  const thumbnail = currentId ? getThumb(currentId) : ""

  const loadVideo = (id: string, force?: boolean) => {
    if (!id) return
    if (!force && id === currentIdRef.current) return

    currentIdRef.current = id
    setIframeLoading(true)
    setPlayerSrc(
      `https://www.youtube-nocookie.com/embed/${id}?modestbranding=1&rel=0&playsinline=1`
    )

    setRecent((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, 6)
      localStorage.setItem("recent-yt", JSON.stringify(next))
      return next
    })
  }

  const clearRecent = () => {
    setRecent([])
    if (typeof window !== "undefined") localStorage.removeItem("recent-yt")
  }

  const onSubmit = handleSubmit((data) => {
    const { url } = data
    console.log({ data })
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

  useEffect(() => {
    const stored = localStorage.getItem("recent-yt")
    if (stored) {
      try {
        setRecent(JSON.parse(stored))
      } catch {
        setRecent([])
      }
    }
  }, [])

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
      <>
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
                      opacity: iframeLoading ? 0 : 1, // hide the iframe visually until it loads
                      transition: "opacity .2s ease"
                    }}
                  />
                </AspectRatio>
              </div>
            ) : null}
          </Stack>
          <RecentList
            items={recent}
            onClickVideo={(id) => loadVideo(id)}
            onClear={clearRecent}
          />
        </Container>
      </>
    </>
  )
}
