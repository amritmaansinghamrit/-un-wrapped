import { Server, Socket } from 'socket.io'
import { sessionStore } from '../utils/sessionStore'

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`👤 Client connected: ${socket.id}`)

    // Session creation
    socket.on('session:create', ({ username }: { username: string }) => {
      try {
        const session = sessionStore.createSession(username, socket.id)

        // Join room
        socket.join(session.code)

        socket.emit('session:created', {
          sessionId: session.id,
          code: session.code,
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
          const session = sessionStore.joinSession(code, username, socket.id)

          if (!session) {
            socket.emit('error', { message: 'Session not found or already full' })
            return
          }

          // Join room
          socket.join(code)

          // Notify joiner
          socket.emit('session:joined', {
            sessionId: session.id,
            code: session.code,
          })

          // Notify creator
          io.to(code).emit('partner:joined', { username })

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

          // Notify room
          io.to(sessionCode).emit('partner:ready', { username })

          // Check if both ready
          if (sessionStore.areBothReady(session.id)) {
            io.to(sessionCode).emit('both:ready')
            console.log(`🎉 Both users ready in session: ${sessionCode}`)
          }
        } catch (error) {
          console.error('Error setting ready:', error)
          socket.emit('error', { message: 'Failed to set ready status' })
        }
      }
    )

    // Activity answer submission
    socket.on('activity:answer', (data: any) => {
      try {
        const { sessionCode, activity, answer, username } = data

        // Broadcast to room (excluding sender)
        socket.to(sessionCode).emit('partner:answered', {
          activity,
          username,
        })

        console.log(`📝 Answer submitted by ${username} in ${sessionCode}`)
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
