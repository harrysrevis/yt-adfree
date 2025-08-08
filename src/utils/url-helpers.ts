export const extractYouTubeVideoId = (url: string) => {
  const match = url.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )

  return match ? match[1] : null
}

export const getThumb = (id: string) =>
  `https://img.youtube.com/vi/${id}/hqdefault.jpg`
