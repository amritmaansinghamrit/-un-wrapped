import { Router } from 'express'
import { sessionStore } from '../utils/sessionStore'

export const sessionRouter = Router()

// Get session by ID
sessionRouter.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    const session = sessionStore.getSessionById(id)

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    res.json(session)
  } catch (error) {
    console.error('Error fetching session:', error)
    res.status(500).json({ error: 'Failed to fetch session' })
  }
})

// Get session by code
sessionRouter.get('/code/:code', (req, res) => {
  try {
    const { code } = req.params
    const session = sessionStore.getSessionByCode(code)

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    res.json(session)
  } catch (error) {
    console.error('Error fetching session:', error)
    res.status(500).json({ error: 'Failed to fetch session' })
  }
})
