import { YoutubeTranscript } from 'youtube-transcript'

export async function getYouTubeTranscript(url: string) {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(url)

    const fullText = transcript
      .map((item: any) => item.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    return {
      transcript: fullText,
      duration: transcript[transcript.length - 1]?.offset || 0,
    }
  } catch (error) {
    throw new Error(`Failed to fetch YouTube transcript: ${error}`)
  }
}

export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}
