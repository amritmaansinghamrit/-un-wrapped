'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/store/useSessionStore'
import { connectSocket } from '@/lib/socket'

export default function JoinSessionPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const { currentUser, setSessionCode } = useSessionStore()

  useEffect(() => {
    if (!currentUser) {
      router.push('/enter')
    }
  }, [currentUser, router])

  const handleJoin = () => {
    if (code.length !== 6) {
      alert('Please enter a 6-character code')
      return
    }

    setIsJoining(true)
    const socket = connectSocket()

    socket.emit('session:join', {
      code: code.toUpperCase(),
      username: currentUser?.username,
    })

    socket.on('session:joined', () => {
      setSessionCode(code.toUpperCase())
      router.push('/waiting-room')
    })

    socket.on('error', ({ message }: { message: string }) => {
      alert(message)
      setIsJoining(false)
    })
  }

  if (!currentUser) return null

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary-purple via-purple-400 to-primary-pink">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-serif font-semibold text-white mb-3">
            Enter Session Code
          </h1>
          <p className="text-white/80">
            Get the code from your partner
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="glass rounded-3xl p-8 shadow-2xl"
        >
          <input
            type="text"
            placeholder="ABC123"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            maxLength={6}
            className="w-full text-3xl text-center font-mono tracking-widest py-4 px-6 rounded-2xl bg-white/90 border-2 border-transparent focus:border-primary-purple focus:outline-none transition-colors uppercase"
            autoFocus
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleJoin}
            disabled={isJoining || code.length !== 6}
            className="w-full mt-6 touch-button bg-gradient-to-r from-primary-purple to-primary-pink text-white font-semibold text-lg py-4 px-8 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {isJoining ? 'Joining...' : 'Join Session'}
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => router.back()}
            className="text-white/70 hover:text-white transition-colors text-sm underline"
          >
            ← Go back
          </button>
        </motion.div>
      </div>
    </main>
  )
}
