import axios from 'axios'

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'
const SPOTIFY_AUTH_BASE = 'https://accounts.spotify.com/api'

let accessToken: string | null = null
let tokenExpiry: number = 0

// Get access token using Client Credentials flow
async function getAccessToken(): Promise<string> {
  // Check if we have a valid token
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken
  }

  try {
    const response = await axios.post(
      `${SPOTIFY_AUTH_BASE}/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`,
        },
      }
    )

    accessToken = response.data.access_token
    tokenExpiry = Date.now() + response.data.expires_in * 1000

    if (!accessToken) {
      throw new Error('No access token received from Spotify')
    }

    return accessToken
  } catch (error) {
    console.error('Error getting Spotify token:', error)
    throw new Error('Failed to authenticate with Spotify')
  }
}

export async function searchTracks(query: string): Promise<any[]> {
  if (!query.trim()) return []

  try {
    const token = await getAccessToken()

    const response = await axios.get(`${SPOTIFY_API_BASE}/search`, {
      params: {
        q: query,
        type: 'track',
        limit: 10,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data.tracks.items
  } catch (error) {
    console.error('Error searching tracks:', error)
    return []
  }
}

export async function getTrackAudioFeatures(trackId: string) {
  try {
    const token = await getAccessToken()

    const response = await axios.get(
      `${SPOTIFY_API_BASE}/audio-features/${trackId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    return {
      bpm: response.data.tempo,
      energy: response.data.energy,
      valence: response.data.valence,
      danceability: response.data.danceability,
    }
  } catch (error) {
    console.error('Error fetching audio features:', error)
    return null
  }
}
