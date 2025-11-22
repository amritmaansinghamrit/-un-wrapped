'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/store/useSessionStore'
import { getSocket } from '@/lib/socket'

export default function WaitingRoomPage() {
  const router = useRouter()
  const {
    currentUser,
    partnerUser,
    sessionCode,
    setPartnerUser,
    updateUserReady,
  } = useSessionStore()

  const [copied, setCopied] = useState(false)
  const socket = getSocket()

  useEffect(() => {
    if (!currentUser || !sessionCode) {
      router.push('/enter')
      return
    }

    // Listen for partner joining
    socket.on('partner:joined', ({ username }: { username: string }) => {
      setPartnerUser({ username, isReady: false })
    })

    // Listen for ready status
    socket.on('partner:ready', ({ username }: { username: string }) => {
      updateUserReady(username, true)
    })

    // Listen for both ready (start activities)
    socket.on('both:ready', () => {
      router.push('/activity/quick-picks')
    })

    return () => {
      socket.off('partner:joined')
      socket.off('partner:ready')
      socket.off('both:ready')
    }
  }, [currentUser, sessionCode, router, socket, setPartnerUser, updateUserReady])

  const copyCode = async () => {
    if (sessionCode) {
      await navigator.clipboard.writeText(sessionCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleReady = () => {
    if (currentUser) {
      updateUserReady(currentUser.username, true)
      socket.emit('user:ready', {
        sessionCode,
        username: currentUser.username,
      })
    }
  }

  if (!currentUser || !sessionCode) return null

  const isCurrentUserReady = currentUser.isReady
  const isPartnerReady = partnerUser?.isReady || false
  const bothReady = isCurrentUserReady && isPartnerReady

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary-purple via-purple-400 to-primary-pink">
      <div className="w-full max-w-md">
        {/* Session Code */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <p className="text-white/80 mb-2">Session Code</p>
          <div className="glass rounded-2xl p-6 mb-4">
            <h1 className="text-5xl font-mono font-bold tracking-widest text-white">
              {sessionCode}
            </h1>
          </div>
          <button
            onClick={copyCode}
            className="text-white/90 hover:text-white transition-colors text-sm font-medium"
          >
            {copied ? '✓ Copied!' : '📋 Copy code'}
          </button>
        </motion.div>

        {/* Waiting Room */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-3xl p-8 mb-6"
        >
          {/* Users */}
          <div className="space-y-4 mb-6">
            {/* Current User */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                  {currentUser.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white">
                    {currentUser.username} <span className="text-sm opacity-70">(you)</span>
                  </p>
                </div>
              </div>
              {isCurrentUserReady && (
                <span className="text-success font-medium">✓ Ready</span>
              )}
            </div>

            {/* Partner User */}
            <AnimatePresence>
              {partnerUser ? (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-semibold">
                      {partnerUser.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{partnerUser.username}</p>
                    </div>
                  </div>
                  {isPartnerReady && (
                    <span className="text-success font-medium">✓ Ready</span>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className="text-white/70">Waiting for partner...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Ready Button */}
          {partnerUser && !bothReady && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReady}
              disabled={isCurrentUserReady}
              className="w-full touch-button bg-gradient-to-r from-success to-green-500 text-white font-semibold text-lg py-4 px-8 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {isCurrentUserReady ? 'Waiting for partner...' : "I'm Ready!"}
            </motion.button>
          )}

          {/* Both Ready */}
          {bothReady && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="text-4xl mb-3">🎉</div>
              <p className="text-white font-semibold text-lg">
                Starting your journey together...
              </p>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-white/60 text-sm"
        >
          <p>Both of you need to be ready to start</p>
        </motion.div>
      </div>
    </main>
  )
}
