const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID

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

let accessToken: string | null = null
let tokenExpiry: number = 0

// Get Spotify access token (client credentials flow)
async function getAccessToken(): Promise<string> {
  // Check if we have a valid token
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken
  }

  // For demo purposes, we'll use a mock token
  // In production, this should call your backend to get a real token
  console.warn('Using mock Spotify token - implement backend token endpoint')
  accessToken = 'mock_token'
  tokenExpiry = Date.now() + 3600000 // 1 hour

  return accessToken
}

export async function searchTracks(query: string): Promise<SpotifyTrack[]> {
  if (!query.trim()) return []

  try {
    const token = await getAccessToken()

    // For demo, return mock data
    // In production, this would call the real Spotify API
    const mockResults: SpotifyTrack[] = [
      {
        id: '1',
        name: query,
        artists: [{ name: 'Demo Artist' }],
        album: {
          name: 'Demo Album',
          images: [
            {
              url: 'https://via.placeholder.com/300?text=Album+Art',
            },
          ],
        },
        preview_url: null,
        external_urls: {
          spotify: 'https://open.spotify.com/track/demo',
        },
      },
    ]

    return mockResults
  } catch (error) {
    console.error('Error searching tracks:', error)
    return []
  }
}

export async function getTrackAudioFeatures(trackId: string) {
  try {
    // In production, fetch from Spotify API
    return {
      bpm: 120 + Math.floor(Math.random() * 60),
      energy: Math.random(),
      valence: Math.random(),
      danceability: Math.random(),
    }
  } catch (error) {
    console.error('Error fetching audio features:', error)
    return null
  }
}
