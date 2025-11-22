'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/store/useSessionStore'

export default function EnterPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { setCurrentUser } = useSessionStore()

  const handleContinue = () => {
    if (username.trim().length < 2) {
      alert('Please enter a username (at least 2 characters)')
      return
    }

    setIsLoading(true)
    setCurrentUser({
      username: username.trim(),
      isReady: false,
    })
    router.push('/session-choice')
  }

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
            What should we call you?
          </h1>
          <p className="text-white/80">
            Pick a name - no password needed
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
            placeholder="Your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
            maxLength={20}
            className="w-full text-xl text-center py-4 px-6 rounded-2xl bg-white/90 border-2 border-transparent focus:border-primary-purple focus:outline-none transition-colors"
            autoFocus
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleContinue}
            disabled={isLoading || username.trim().length < 2}
            className="w-full mt-6 touch-button bg-gradient-to-r from-primary-purple to-primary-pink text-white font-semibold text-lg py-4 px-8 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {isLoading ? 'Loading...' : 'Continue'}
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-white/70 text-sm"
        >
          <p>Your partner will see this name</p>
        </motion.div>
      </div>
    </main>
  )
}
