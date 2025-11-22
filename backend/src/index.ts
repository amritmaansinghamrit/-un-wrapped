import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import { sessionRouter } from './routes/session'
import { activityRouter } from './routes/activity'
import { spotifyRouter } from './routes/spotify'
import { setupSocketHandlers } from './socket/handlers'

dotenv.config()

// Validate required environment variables
function validateEnvironment() {
  const required = [
    'SPOTIFY_CLIENT_ID',
    'SPOTIFY_CLIENT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:')
    missing.forEach((key) => console.error(`   - ${key}`))
    console.error('\n💡 Please set these in Railway dashboard: Settings > Variables')
    process.exit(1)
  }

  console.log('✅ All required environment variables are set')
}

// Validate environment before starting
validateEnvironment()

console.log('🔧 Creating Express app...')
const app = express()
const httpServer = createServer(app)

console.log('🔧 Initializing Socket.io...')
const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

console.log('🔧 Setting up middleware...')
// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

console.log('🔧 Registering routes...')
// Routes
app.use('/api/session', sessionRouter)
app.use('/api/activity', activityRouter)
app.use('/api/spotify', spotifyRouter)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

console.log('🔧 Setting up Socket.io handlers...')
// Setup Socket.io handlers
setupSocketHandlers(io)

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

const PORT = parseInt(process.env.PORT || '3001', 10)
const HOST = '0.0.0.0'

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Server error handler
httpServer.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`)
  } else {
    console.error('❌ Server error:', error)
  }
  process.exit(1)
})

console.log(`🔧 Starting server on ${HOST}:${PORT}...`)

httpServer.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`)
  console.log(`📡 WebSocket server ready`)
  console.log(`🌐 Health check: http://${HOST}:${PORT}/health`)
})

export { io }
