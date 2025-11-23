import { Session } from '../types'
import { customAlphabet } from 'nanoid'

// Generate 6-character alphanumeric codes (like XK9P2M)
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6)

// Generate secure tokens (32 characters)
const generateToken = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 32)

// In-memory store for MVP (replace with Redis in production)
const sessions = new Map<string, Session>()
const codeToSessionId = new Map<string, string>()
const userTokens = new Map<string, { sessionId: string; username: string; isCreator: boolean }>()

export const sessionStore = {
  createSession(username: string, socketId?: string): { session: Session; token: string } {
    const code = nanoid()
    const token = generateToken()
    const sessionId = `session_${Date.now()}_${code}`
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours

    const session: Session = {
      id: sessionId,
      code,
      creator: {
        username,
        socketId,
      },
      joiner: null,
      status: 'waiting',
      createdAt: now,
      expiresAt,
      readyStatus: {},
      activities: {
        quickPicks: [],
        songs: [],
        voices: [],
        photos: [],
        creative: null,
      },
      questionSync: {
        currentActivity: null,
        currentQuestionIndex: 0,
        answersReceived: new Set(),
        questions: [],
      },
    }

    sessions.set(sessionId, session)
    codeToSessionId.set(code, sessionId)
    userTokens.set(token, { sessionId, username, isCreator: true })

    // Auto-expire after 2 hours
    setTimeout(() => {
      this.expireSession(sessionId)
    }, 2 * 60 * 60 * 1000)

    return { session, token }
  },

  getSessionByCode(code: string): Session | undefined {
    const sessionId = codeToSessionId.get(code)
    if (!sessionId) return undefined
    return sessions.get(sessionId)
  },

  getSessionById(sessionId: string): Session | undefined {
    return sessions.get(sessionId)
  },

  joinSession(code: string, username: string, socketId?: string): { session: Session; token: string } | null {
    const session = this.getSessionByCode(code)
    if (!session) return null
    if (session.status !== 'waiting') return null
    if (session.joiner) return null // Already has a joiner

    const token = generateToken()

    session.joiner = {
      username,
      socketId,
    }
    session.status = 'active'
    sessions.set(session.id, session)
    userTokens.set(token, { sessionId: session.id, username, isCreator: false })

    return { session, token }
  },

  validateToken(token: string): { sessionId: string; username: string; isCreator: boolean } | null {
    return userTokens.get(token) || null
  },

  updateReadyStatus(sessionId: string, username: string, ready: boolean): Session | null {
    const session = sessions.get(sessionId)
    if (!session) return null

    session.readyStatus[username] = ready
    sessions.set(sessionId, session)

    return session
  },

  areBothReady(sessionId: string): boolean {
    const session = sessions.get(sessionId)
    if (!session || !session.joiner) return false

    const creatorReady = session.readyStatus[session.creator.username] || false
    const joinerReady = session.readyStatus[session.joiner.username] || false

    return creatorReady && joinerReady
  },

  updateSocketId(sessionId: string, username: string, socketId: string): void {
    const session = sessions.get(sessionId)
    if (!session) return

    if (session.creator.username === username) {
      session.creator.socketId = socketId
    } else if (session.joiner && session.joiner.username === username) {
      session.joiner.socketId = socketId
    }

    sessions.set(sessionId, session)
  },

  updateSession(sessionId: string, updates: Partial<Session>): Session | null {
    const session = sessions.get(sessionId)
    if (!session) return null

    const updated = { ...session, ...updates }
    sessions.set(sessionId, updated)

    return updated
  },

  expireSession(sessionId: string): void {
    const session = sessions.get(sessionId)
    if (!session) return

    session.status = 'expired'
    sessions.set(sessionId, session)

    // Clean up after 24 hours
    setTimeout(() => {
      sessions.delete(sessionId)
      codeToSessionId.delete(session.code)
    }, 24 * 60 * 60 * 1000)
  },

  completeSession(sessionId: string): Session | null {
    const session = sessions.get(sessionId)
    if (!session) return null

    session.status = 'completed'
    sessions.set(sessionId, session)

    return session
  },

  // Question synchronization methods
  initializeActivity(sessionId: string, activity: string, questions: any[]): Session | null {
    const session = sessions.get(sessionId)
    if (!session || !session.questionSync) return null

    session.questionSync.currentActivity = activity
    session.questionSync.currentQuestionIndex = 0
    session.questionSync.answersReceived = new Set()
    session.questionSync.questions = questions

    sessions.set(sessionId, session)
    return session
  },

  recordAnswer(sessionId: string, username: string): { bothAnswered: boolean; session: Session } | null {
    const session = sessions.get(sessionId)
    if (!session || !session.questionSync) return null

    session.questionSync.answersReceived.add(username)
    const bothAnswered = session.questionSync.answersReceived.size === 2

    sessions.set(sessionId, session)
    return { bothAnswered, session }
  },

  advanceQuestion(sessionId: string): Session | null {
    const session = sessions.get(sessionId)
    if (!session || !session.questionSync) return null

    session.questionSync.currentQuestionIndex += 1
    session.questionSync.answersReceived = new Set()

    sessions.set(sessionId, session)
    return session
  },

  getCurrentQuestion(sessionId: string): any | null {
    const session = sessions.get(sessionId)
    if (!session || !session.questionSync) return null

    const { currentQuestionIndex, questions } = session.questionSync
    return questions[currentQuestionIndex] || null
  },
}
