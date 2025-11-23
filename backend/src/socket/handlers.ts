import { Server, Socket } from 'socket.io'
import { sessionStore } from '../utils/sessionStore'
import { Logger } from '../utils/logger'

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`👤 Client connected: ${socket.id}`)

    // Session creation
    socket.on('session:create', ({ username }: { username: string }) => {
      try {
        const { session, token } = sessionStore.createSession(username, socket.id)

        // Join room
        socket.join(session.code)

        socket.emit('session:created', {
          sessionId: session.id,
          code: session.code,
          token,
        })

        console.log(`✅ Session created: ${session.code} by ${username}`)
      } catch (error) {
        console.error('Error creating session:', error)
        socket.emit('error', { message: 'Failed to create session' })
      }
    })

    // Session joining
    socket.on(
      'session:join',
      ({ code, username }: { code: string; username: string }) => {
        try {
          const result = sessionStore.joinSession(code, username, socket.id)

          if (!result) {
            socket.emit('error', { message: 'Session not found or already full' })
            return
          }

          const { session, token } = result

          // Join room
          socket.join(code)

          // Notify joiner
          socket.emit('session:joined', {
            sessionId: session.id,
            code: session.code,
            token,
            creator: {
              username: session.creator.username,
              isReady: session.readyStatus[session.creator.username] || false
            }
          })

          // Notify creator only (not the joiner)
          socket.to(code).emit('partner:joined', {
            username,
            isReady: false
          })

          console.log(`✅ ${username} joined session: ${code}`)
        } catch (error) {
          console.error('Error joining session:', error)
          socket.emit('error', { message: 'Failed to join session' })
        }
      }
    )

    // User ready
    socket.on(
      'user:ready',
      ({ sessionCode, username }: { sessionCode: string; username: string }) => {
        try {
          const session = sessionStore.getSessionByCode(sessionCode)
          if (!session) {
            socket.emit('error', { message: 'Session not found' })
            return
          }

          sessionStore.updateReadyStatus(session.id, username, true)

          // Notify partner only (not the user who just got ready)
          socket.to(sessionCode).emit('partner:ready', { username })

          // Check if both ready
          if (sessionStore.areBothReady(session.id)) {
            // Notify everyone when both are ready
            io.to(sessionCode).emit('both:ready')
            console.log(`🎉 Both users ready in session: ${sessionCode}`)
          }
        } catch (error) {
          console.error('Error setting ready:', error)
          socket.emit('error', { message: 'Failed to set ready status' })
        }
      }
    )

    // Activity initialization (synchronized)
    socket.on('activity:start', (data: { sessionCode: string; activity: string; questions: any[] }) => {
      try {
        const { sessionCode, activity, questions } = data
        const session = sessionStore.getSessionByCode(sessionCode)

        if (!session) {
          socket.emit('error', { message: 'Session not found' })
          return
        }

        // Only initialize if not already initialized (first user to arrive)
        if (!session.questionSync?.currentActivity || session.questionSync.currentActivity !== activity) {
          sessionStore.initializeActivity(session.id, activity, questions)
          Logger.activityStarted(session.id, sessionCode, activity, 'system')
          console.log(`🎮 Activity initialized: ${activity} for session ${sessionCode}`)
        }

        // Send current question to the user
        const currentQuestion = sessionStore.getCurrentQuestion(session.id)
        socket.emit('question:current', {
          questionIndex: session.questionSync?.currentQuestionIndex || 0,
          question: currentQuestion,
          totalQuestions: session.questionSync?.questions.length || 0,
        })
      } catch (error) {
        console.error('Error starting activity:', error)
        socket.emit('error', { message: 'Failed to start activity' })
      }
    })

    // Activity answer submission (synchronized)
    socket.on('activity:answer', (data: any) => {
      try {
        const { sessionCode, activity, answer, username } = data
        const session = sessionStore.getSessionByCode(sessionCode)

        if (!session) {
          socket.emit('error', { message: 'Session not found' })
          return
        }

        // Record that this user answered
        const result = sessionStore.recordAnswer(session.id, username)

        if (!result) {
          socket.emit('error', { message: 'Failed to record answer' })
          return
        }

        const { bothAnswered } = result

        // Log the answer
        Logger.logEvent(session.id, sessionCode, 'answer:submitted', { activity, answer }, username)

        // Notify partner that user answered
        socket.to(sessionCode).emit('partner:answered', {
          activity,
          username,
        })

        console.log(`📝 Answer submitted by ${username} in ${sessionCode}`)

        // If both answered, advance to next question
        if (bothAnswered) {
          const updatedSession = sessionStore.advanceQuestion(session.id)

          if (updatedSession && updatedSession.questionSync) {
            const nextQuestion = sessionStore.getCurrentQuestion(session.id)
            const { currentQuestionIndex, questions } = updatedSession.questionSync

            if (nextQuestion) {
              // Send next question to both users
              io.to(sessionCode).emit('question:next', {
                questionIndex: currentQuestionIndex,
                question: nextQuestion,
                totalQuestions: questions.length,
              })
              console.log(`➡️  Advanced to question ${currentQuestionIndex + 1} in ${sessionCode}`)
            } else {
              // Activity complete
              Logger.activityCompleted(session.id, sessionCode, activity)
              io.to(sessionCode).emit('activity:complete', { activity })
              console.log(`✅ Activity complete: ${activity} in ${sessionCode}`)
            }
          }
        }
      } catch (error) {
        console.error('Error handling answer:', error)
      }
    })

    // Drawing stroke (collaborative drawing)
    socket.on('drawing:stroke', (data: any) => {
      try {
        const { sessionCode, stroke } = data

        // Broadcast to room (excluding sender)
        socket.to(sessionCode).emit('drawing:stroke', { stroke })
      } catch (error) {
        console.error('Error handling drawing stroke:', error)
      }
    })

    // Disconnection
    socket.on('disconnect', () => {
      console.log(`👋 Client disconnected: ${socket.id}`)
    })
  })
}
