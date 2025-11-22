const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface SpotifyTrack {
  id: string
  name: string
  artists: { name: string }[]
  album: {
    name: string
    images: { url: string }[]
  }
  preview_url: string | null
  external_urls: {
    spotify: string
  }
}

export async function searchTracks(query: string): Promise<SpotifyTrack[]> {
  if (!query.trim()) return []

  try {
    const response = await fetch(
      `${API_URL}/api/spotify/search?q=${encodeURIComponent(query)}`
    )

    if (!response.ok) {
      throw new Error('Failed to search tracks')
    }

    const data = await response.json()
    return data.tracks || []
  } catch (error) {
    console.error('Error searching tracks:', error)
    return []
  }
}

export async function getTrackAudioFeatures(trackId: string) {
  try {
    const response = await fetch(
      `${API_URL}/api/spotify/audio-features/${trackId}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch audio features')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching audio features:', error)
    return null
  }
}
