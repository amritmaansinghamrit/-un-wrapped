'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/store/useSessionStore'
import { PatternGenerator } from '@/lib/patternGenerator'

const MESSAGES = [
  'Merging your voices...',
  'Blending your choices...',
  'Analyzing your harmony...',
  'Creating your pattern...',
  'Adding the final touches...',
]

export default function ProcessingPage() {
  const router = useRouter()
  const { session } = useSessionStore()

  const [progress, setProgress] = useState(0)
  const [messageIndex, setMessageIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const patternRef = useRef<string | null>(null)

  useEffect(() => {
    // Simulate processing with progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 100)

    // Change messages
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length)
    }, 2000)

    return () => {
      clearInterval(interval)
      clearInterval(messageInterval)
    }
  }, [])

  useEffect(() => {
    if (progress === 100 && !isComplete) {
      // Generate the pattern
      generatePattern()
    }
  }, [progress, isComplete])

  const generatePattern = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const generator = new PatternGenerator(canvas)

      // Use session data to generate pattern
      const metadata = await generator.generate(session?.activities || {})

      // Export images
      const staticImage = generator.exportAsImage()
      patternRef.current = staticImage

      // Wait a moment before transitioning
      setTimeout(() => {
        setIsComplete(true)
        setTimeout(() => {
          router.push('/reveal')
        }, 1000)
      }, 1000)
    } catch (error) {
      console.error('Error generating pattern:', error)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary-purple via-purple-400 to-primary-pink relative overflow-hidden">
      {/* Hidden canvas for pattern generation */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Animated orbs */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 bg-white/20 rounded-full blur-3xl"
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-32 right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"
        animate={{
          y: [0, 30, 0],
          x: [0, -20, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-12"
        >
          {/* Animated heart/connection visual */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center"
              >
                <motion.div
                  animate={{
                    scale: [1, 0.9, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="w-16 h-16 rounded-full bg-white/30"
                />
              </motion.div>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="text-6xl font-bold text-white mb-2">{progress}%</div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

          {/* Message */}
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-white text-lg font-medium"
          >
            {MESSAGES[messageIndex]}
          </motion.p>

          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6"
            >
              <p className="text-white/90 text-xl font-semibold">
                ✨ Ready to reveal
              </p>
            </motion.div>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-white/70 text-sm"
        >
          Creating something unique to just you two...
        </motion.p>
      </div>
    </main>
  )
}
