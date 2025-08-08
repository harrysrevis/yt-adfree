export function parseISODurationToSeconds(iso: string) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const [, h, m, s] = match
  return (
    parseInt(h || "0") * 3600 + parseInt(m || "0") * 60 + parseInt(s || "0")
  )
}
