'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/store/useSessionStore'
import { connectSocket } from '@/lib/socket'

export default function CreateSessionPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const { currentUser, setSessionCode, setSessionToken, setWaitingForPartner } =
    useSessionStore()

  useEffect(() => {
    if (!currentUser) {
      router.push('/enter')
      return
    }

    const createSession = async () => {
      setIsCreating(true)
      const socket = connectSocket()

      socket.emit('session:create', { username: currentUser.username })

      socket.on('session:created', ({ code, token }: { code: string; token: string }) => {
        setSessionCode(code)
        setSessionToken(token)
        setWaitingForPartner(true)
        setIsCreating(false)
        // Store token in localStorage for reconnection
        localStorage.setItem('unwrapped_token', token)
        router.push('/waiting-room')
      })

      socket.on('error', ({ message }: { message: string }) => {
        alert(message)
        setIsCreating(false)
      })
    }

    createSession()
  }, [currentUser, router, setSessionCode, setSessionToken, setWaitingForPartner])

  if (!currentUser) return null

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary-purple via-purple-400 to-primary-pink">
      <div className="w-full max-w-md text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="glass rounded-3xl p-12">
            <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-semibold text-white mb-2">
              {isCreating ? 'Creating your session...' : 'Setting up...'}
            </h1>
            <p className="text-white/70">
              This will only take a moment
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
