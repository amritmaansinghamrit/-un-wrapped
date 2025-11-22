'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/store/useSessionStore'

export default function SessionChoicePage() {
  const router = useRouter()
  const { currentUser } = useSessionStore()

  useEffect(() => {
    if (!currentUser) {
      router.push('/enter')
    }
  }, [currentUser, router])

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
            Hey, {currentUser.username}!
          </h1>
          <p className="text-white/80">
            Ready to create something unique?
          </p>
        </motion.div>

        <div className="space-y-4">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/create-session')}
            className="w-full glass rounded-3xl p-8 text-left hover:bg-white/90 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white group-hover:text-primary-purple transition-colors mb-2">
                  Start New Session
                </h2>
                <p className="text-white/70 group-hover:text-gray-600 transition-colors">
                  Create a code to share with your partner
                </p>
              </div>
              <div className="text-4xl">→</div>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/join-session')}
            className="w-full glass rounded-3xl p-8 text-left hover:bg-white/90 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white group-hover:text-primary-purple transition-colors mb-2">
                  Join Session
                </h2>
                <p className="text-white/70 group-hover:text-gray-600 transition-colors">
                  Enter the code from your partner
                </p>
              </div>
              <div className="text-4xl">→</div>
            </div>
          </motion.button>
        </div>
      </div>
    </main>
  )
}
