import { Router } from 'express'
import { Logger } from '../utils/logger'

const router = Router()

// Get all analytics summary
router.get('/summary', (req, res) => {
  try {
    const summary = Logger.getAnalyticsSummary()
    res.json(summary)
  } catch (error) {
    console.error('Error getting analytics summary:', error)
    res.status(500).json({ error: 'Failed to get analytics summary' })
  }
})

// Get all sessions
router.get('/sessions', (req, res) => {
  try {
    const sessions = Logger.getAllAnalytics()
    res.json({ sessions, total: sessions.length })
  } catch (error) {
    console.error('Error getting sessions:', error)
    res.status(500).json({ error: 'Failed to get sessions' })
  }
})

// Get specific session details
router.get('/sessions/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params
    const analytics = Logger.getSessionAnalytics(sessionId)

    if (!analytics) {
      return res.status(404).json({ error: 'Session not found' })
    }

    const logs = Logger.getSessionLogs(sessionId)

    res.json({
      analytics,
      logs,
      totalEvents: logs.length,
    })
  } catch (error) {
    console.error('Error getting session details:', error)
    res.status(500).json({ error: 'Failed to get session details' })
  }
})

// Get session logs by code
router.get('/sessions/code/:code', (req, res) => {
  try {
    const { code } = req.params
    const allSessions = Logger.getAllAnalytics()
    const session = allSessions.find((s) => s.sessionCode === code)

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    const logs = Logger.getSessionLogs(session.sessionId)

    res.json({
      analytics: session,
      logs,
      totalEvents: logs.length,
    })
  } catch (error) {
    console.error('Error getting session by code:', error)
    res.status(500).json({ error: 'Failed to get session' })
  }
})

export default router
