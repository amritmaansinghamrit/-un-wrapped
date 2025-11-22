import { Router } from 'express'
import { searchTracks, getTrackAudioFeatures } from '../services/spotify'

export const spotifyRouter = Router()

// Search for tracks
spotifyRouter.get('/search', async (req, res) => {
  try {
    const { q } = req.query

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter required' })
    }

    const tracks = await searchTracks(q)
    res.json({ tracks })
  } catch (error) {
    console.error('Error searching tracks:', error)
    res.status(500).json({ error: 'Failed to search tracks' })
  }
})

// Get audio features for a track
spotifyRouter.get('/audio-features/:trackId', async (req, res) => {
  try {
    const { trackId } = req.params

    const features = await getTrackAudioFeatures(trackId)
    res.json(features)
  } catch (error) {
    console.error('Error fetching audio features:', error)
    res.status(500).json({ error: 'Failed to fetch audio features' })
  }
})
