import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

let socket: Socket | null = null

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    })

    // Error handling
    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message)
    })

    socket.on('connect_timeout', () => {
      console.error('❌ Socket connection timeout')
    })

    socket.on('error', (error) => {
      console.error('❌ Socket error:', error)
    })

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}`)
    })

    socket.on('reconnect_failed', () => {
      console.error('❌ Failed to reconnect after maximum attempts')
    })

    socket.on('disconnect', (reason) => {
      console.log('👋 Socket disconnected:', reason)
      if (reason === 'io server disconnect') {
        // Server disconnected, manually reconnect
        socket?.connect()
      }
    })

    socket.on('connect', () => {
      console.log('✅ Socket connected')
    })
  }
  return socket
}

export const connectSocket = () => {
  const socket = getSocket()
  if (!socket.connected) {
    socket.connect()
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
