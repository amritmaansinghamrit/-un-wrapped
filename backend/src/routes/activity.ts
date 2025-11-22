import { Router } from 'express'
import { sessionStore } from '../utils/sessionStore'

export const activityRouter = Router()

// Submit Quick Pick answer
activityRouter.post('/quickpick', (req, res) => {
  try {
    const { sessionId, answer } = req.body
    const session = sessionStore.getSessionById(sessionId)

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    // Store answer in session
    session.activities.quickPicks.push(answer)
    sessionStore.updateSession(sessionId, session)

    res.json({ success: true })
  } catch (error) {
    console.error('Error submitting quick pick:', error)
    res.status(500).json({ error: 'Failed to submit answer' })
  }
})

// Submit song choice
activityRouter.post('/song', (req, res) => {
  try {
    const { sessionId, song } = req.body
    const session = sessionStore.getSessionById(sessionId)

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    session.activities.songs.push(song)
    sessionStore.updateSession(sessionId, session)

    res.json({ success: true })
  } catch (error) {
    console.error('Error submitting song:', error)
    res.status(500).json({ error: 'Failed to submit song' })
  }
})

// Upload voice recording
activityRouter.post('/voice', (req, res) => {
  try {
    const { sessionId, voice } = req.body
    const session = sessionStore.getSessionById(sessionId)

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    session.activities.voices.push(voice)
    sessionStore.updateSession(sessionId, session)

    res.json({ success: true })
  } catch (error) {
    console.error('Error uploading voice:', error)
    res.status(500).json({ error: 'Failed to upload voice' })
  }
})

// Upload photo
activityRouter.post('/photo', (req, res) => {
  try {
    const { sessionId, photo } = req.body
    const session = sessionStore.getSessionById(sessionId)

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    session.activities.photos.push(photo)
    sessionStore.updateSession(sessionId, session)

    res.json({ success: true })
  } catch (error) {
    console.error('Error uploading photo:', error)
    res.status(500).json({ error: 'Failed to upload photo' })
  }
})

// Submit creative response
activityRouter.post('/creative', (req, res) => {
  try {
    const { sessionId, creative } = req.body
    const session = sessionStore.getSessionById(sessionId)

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    session.activities.creative = creative
    sessionStore.updateSession(sessionId, session)

    res.json({ success: true })
  } catch (error) {
    console.error('Error submitting creative:', error)
    res.status(500).json({ error: 'Failed to submit creative' })
  }
})
