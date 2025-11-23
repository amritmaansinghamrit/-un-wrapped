'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleStart = () => {
    setIsLoading(true)
    router.push('/enter')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-purple via-purple-400 to-primary-pink opacity-90" />

      {/* Floating orbs */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 bg-white/20 rounded-full blur-3xl"
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-32 right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"
        animate={{
          y: [0, 20, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-6xl mb-6">💝</div>
          <h1 className="text-5xl font-serif font-semibold text-white mb-4">
            (un)wrapped
          </h1>
          <p className="text-2xl text-white/90 mb-2 font-medium">
            25 minutes to discover each other
          </p>
          <p className="text-lg text-white/80 mb-12">
            Create a moment that's uniquely yours
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          disabled={isLoading}
          className="touch-button w-full bg-white text-primary-purple font-semibold text-lg py-4 px-8 rounded-full shadow-2xl hover:shadow-3xl transition-all disabled:opacity-50"
        >
          {isLoading ? 'Starting...' : 'Start Session'}
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-8 text-white/70 text-sm"
        >
          <p>No login required · Just the two of you</p>
          <p className="mt-2">A shared experience made with love</p>
        </motion.div>
      </div>

      {/* Bottom text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-8 text-white/60 text-xs"
      >
        Available November 15 - February 14
      </motion.div>
    </main>
  )
}
