interface SessionLog {
  sessionId: string
  sessionCode: string
  timestamp: string
  event: string
  data: any
  username?: string
}

interface SessionAnalytics {
  sessionId: string
  sessionCode: string
  createdAt: string
  creator: string
  partner?: string
  status: 'waiting' | 'active' | 'completed' | 'abandoned'
  events: SessionLog[]
  completedActivities: string[]
  lastActivity?: string
  duration?: number // in seconds
}

// In-memory storage (in production, use a database)
const sessionLogs = new Map<string, SessionLog[]>()
const sessionAnalytics = new Map<string, SessionAnalytics>()

export class Logger {
  static logEvent(
    sessionId: string,
    sessionCode: string,
    event: string,
    data: any = {},
    username?: string
  ) {
    const log: SessionLog = {
      sessionId,
      sessionCode,
      timestamp: new Date().toISOString(),
      event,
      data,
      username,
    }

    // Store the log
    if (!sessionLogs.has(sessionId)) {
      sessionLogs.set(sessionId, [])
    }
    sessionLogs.get(sessionId)!.push(log)

    // Also add to analytics events
    if (sessionAnalytics.has(sessionId)) {
      sessionAnalytics.get(sessionId)!.events.push(log)
    }

    // Console log for debugging
    console.log(
      `[${log.timestamp}] [${sessionCode}] ${event}${username ? ` (${username})` : ''}`,
      data
    )
  }

  static createSession(sessionId: string, sessionCode: string, creator: string) {
    const analytics: SessionAnalytics = {
      sessionId,
      sessionCode,
      createdAt: new Date().toISOString(),
      creator,
      status: 'waiting',
      events: [],
      completedActivities: [],
    }

    sessionAnalytics.set(sessionId, analytics)

    this.logEvent(sessionId, sessionCode, 'session:created', { creator })
  }

  static partnerJoined(sessionId: string, sessionCode: string, partner: string) {
    if (sessionAnalytics.has(sessionId)) {
      const analytics = sessionAnalytics.get(sessionId)!
      analytics.partner = partner
      analytics.status = 'active'
    }

    this.logEvent(sessionId, sessionCode, 'partner:joined', { partner })
  }

  static activityStarted(sessionId: string, sessionCode: string, activity: string, username: string) {
    if (sessionAnalytics.has(sessionId)) {
      const analytics = sessionAnalytics.get(sessionId)!
      analytics.lastActivity = activity
    }

    this.logEvent(sessionId, sessionCode, 'activity:started', { activity }, username)
  }

  static activityCompleted(sessionId: string, sessionCode: string, activity: string) {
    if (sessionAnalytics.has(sessionId)) {
      const analytics = sessionAnalytics.get(sessionId)!
      if (!analytics.completedActivities.includes(activity)) {
        analytics.completedActivities.push(activity)
      }
    }

    this.logEvent(sessionId, sessionCode, 'activity:completed', { activity })
  }

  static sessionCompleted(sessionId: string, sessionCode: string) {
    if (sessionAnalytics.has(sessionId)) {
      const analytics = sessionAnalytics.get(sessionId)!
      analytics.status = 'completed'

      // Calculate duration
      const createdTime = new Date(analytics.createdAt).getTime()
      const now = Date.now()
      analytics.duration = Math.floor((now - createdTime) / 1000)
    }

    this.logEvent(sessionId, sessionCode, 'session:completed', {})
  }

  static getSessionLogs(sessionId: string): SessionLog[] {
    return sessionLogs.get(sessionId) || []
  }

  static getSessionAnalytics(sessionId: string): SessionAnalytics | undefined {
    return sessionAnalytics.get(sessionId)
  }

  static getAllAnalytics(): SessionAnalytics[] {
    return Array.from(sessionAnalytics.values())
  }

  static getAnalyticsSummary() {
    const allSessions = Array.from(sessionAnalytics.values())

    return {
      totalSessions: allSessions.length,
      completedSessions: allSessions.filter((s) => s.status === 'completed').length,
      activeSessions: allSessions.filter((s) => s.status === 'active').length,
      waitingSessions: allSessions.filter((s) => s.status === 'waiting').length,
      abandonedSessions: allSessions.filter((s) => s.status === 'abandoned').length,
      averageDuration:
        allSessions
          .filter((s) => s.duration)
          .reduce((sum, s) => sum + (s.duration || 0), 0) / allSessions.length || 0,
      mostCompletedActivity: this.getMostCompletedActivity(allSessions),
    }
  }

  private static getMostCompletedActivity(sessions: SessionAnalytics[]): string | null {
    const activityCounts = new Map<string, number>()

    sessions.forEach((session) => {
      session.completedActivities.forEach((activity) => {
        activityCounts.set(activity, (activityCounts.get(activity) || 0) + 1)
      })
    })

    let maxCount = 0
    let mostCompleted: string | null = null

    activityCounts.forEach((count, activity) => {
      if (count > maxCount) {
        maxCount = count
        mostCompleted = activity
      }
    })

    return mostCompleted
  }

  static printSessionSummary(sessionId: string) {
    const analytics = this.getSessionAnalytics(sessionId)
    if (!analytics) {
      console.log(`No analytics found for session ${sessionId}`)
      return
    }

    console.log('\n' + '='.repeat(60))
    console.log(`SESSION SUMMARY: ${analytics.sessionCode}`)
    console.log('='.repeat(60))
    console.log(`Creator: ${analytics.creator}`)
    console.log(`Partner: ${analytics.partner || 'Not joined'}`)
    console.log(`Status: ${analytics.status}`)
    console.log(`Created: ${analytics.createdAt}`)
    console.log(`Duration: ${analytics.duration ? `${analytics.duration}s` : 'N/A'}`)
    console.log(`Completed Activities: ${analytics.completedActivities.join(', ') || 'None'}`)
    console.log(`\nTotal Events: ${analytics.events.length}`)
    console.log('='.repeat(60) + '\n')
  }
}
