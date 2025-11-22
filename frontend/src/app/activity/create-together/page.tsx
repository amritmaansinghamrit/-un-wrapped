'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/store/useSessionStore'
import { getSocket } from '@/lib/socket'
import type { DrawingStroke } from '@/types'

const DRAWING_DURATION = 30 // seconds
const EMOJIS = ['❤️', '😂', '🎉', '🔥', '✨', '🌟', '💫', '🎨', '🎵', '🌈', '☀️', '🌙']

type Step = 'drawing' | 'words' | 'emojis'

export default function CreateTogetherPage() {
  const router = useRouter()
  const { currentUser, sessionCode } = useSessionStore()
  const socket = getSocket()

  const [step, setStep] = useState<Step>('drawing')
  const [timeLeft, setTimeLeft] = useState(DRAWING_DURATION)
  const [words, setWords] = useState<string[]>(['', '', ''])
  const [selectedEmojis, setSelectedEmojis] = useState<string[]>([])
  const [strokes, setStrokes] = useState<DrawingStroke[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [partnerCompleted, setPartnerCompleted] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const currentPath = useRef<{ x: number; y: number }[]>([])

  const userColor = currentUser?.username.charCodeAt(0) % 2 === 0 ? '#3B82F6' : '#EC4899'

  // Listen for partner strokes
  useEffect(() => {
    socket.on('drawing:stroke', ({ stroke }: { stroke: DrawingStroke }) => {
      setStrokes((prev) => [...prev, stroke])
      drawStroke(stroke)
    })

    socket.on('partner:answered', ({ activity }: { activity: string }) => {
      if (activity === 'create-together') {
        setPartnerCompleted(true)
      }
    })

    return () => {
      socket.off('drawing:stroke')
      socket.off('partner:answered')
    }
  }, [socket])

  // Drawing timer
  useEffect(() => {
    if (step !== 'drawing' || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleDrawingComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [step, timeLeft])

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Clear and set background
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [step])

  const drawStroke = (stroke: DrawingStroke) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = stroke.x * canvas.width
    const y = stroke.y * canvas.height

    ctx.strokeStyle = stroke.color
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (currentPath.current.length === 0) {
      currentPath.current.push({ x, y })
    } else {
      const lastPoint = currentPath.current[currentPath.current.length - 1]
      ctx.beginPath()
      ctx.moveTo(lastPoint.x, lastPoint.y)
      ctx.lineTo(x, y)
      ctx.stroke()
      currentPath.current.push({ x, y })
    }
  }

  const handleDrawStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true)
    currentPath.current = []

    const point = getPoint(e)
    if (point) {
      const stroke: DrawingStroke = {
        x: point.x,
        y: point.y,
        color: userColor,
        username: currentUser?.username || '',
        timestamp: Date.now(),
      }

      setStrokes((prev) => [...prev, stroke])
      drawStroke(stroke)

      // Emit to partner
      socket.emit('drawing:stroke', {
        sessionCode,
        stroke,
      })
    }
  }

  const handleDrawMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return

    const point = getPoint(e)
    if (point) {
      const stroke: DrawingStroke = {
        x: point.x,
        y: point.y,
        color: userColor,
        username: currentUser?.username || '',
        timestamp: Date.now(),
      }

      setStrokes((prev) => [...prev, stroke])
      drawStroke(stroke)

      // Emit to partner
      socket.emit('drawing:stroke', {
        sessionCode,
        stroke,
      })
    }
  }

  const handleDrawEnd = () => {
    setIsDrawing(false)
    currentPath.current = []
  }

  const getPoint = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    let clientX, clientY

    if ('touches' in e) {
      clientX = e.touches[0]?.clientX
      clientY = e.touches[0]?.clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    if (clientX === undefined || clientY === undefined) return null

    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    }
  }

  const handleDrawingComplete = () => {
    setStep('words')
  }

  const handleWordsSubmit = () => {
    if (words.filter((w) => w.trim()).length < 3) {
      alert('Please enter 3 words')
      return
    }
    setStep('emojis')
  }

  const handleEmojiToggle = (emoji: string) => {
    if (selectedEmojis.includes(emoji)) {
      setSelectedEmojis(selectedEmojis.filter((e) => e !== emoji))
    } else if (selectedEmojis.length < 3) {
      setSelectedEmojis([...selectedEmojis, emoji])
    }
  }

  const handleFinalSubmit = () => {
    if (selectedEmojis.length < 3) {
      alert('Please select 3 emojis')
      return
    }

    // Emit final creative response
    socket.emit('activity:answer', {
      sessionCode,
      activity: 'create-together',
      answer: {
        drawing: {
          strokes,
          users: [currentUser?.username],
        },
        words,
        emojis: selectedEmojis,
      },
      username: currentUser?.username,
    })

    // Move to processing/reveal
    setTimeout(() => {
      router.push('/processing')
    }, 1500)
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-amber-500 via-orange-500 to-pink-500 p-6">
      {/* Header */}
      <div className="w-full max-w-md mx-auto mb-6">
        <h2 className="text-white font-semibold text-center">Create Together</h2>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {step === 'drawing' && (
              <motion.div
                key="drawing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass rounded-3xl p-6"
              >
                <div className="text-center mb-4">
                  <h1 className="text-2xl font-serif text-white mb-2">
                    Draw something together
                  </h1>
                  <p className="text-white/80">You have {timeLeft} seconds</p>
                </div>

                {/* Canvas */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-2xl mb-4">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleDrawStart}
                    onMouseMove={handleDrawMove}
                    onMouseUp={handleDrawEnd}
                    onMouseLeave={handleDrawEnd}
                    onTouchStart={handleDrawStart}
                    onTouchMove={handleDrawMove}
                    onTouchEnd={handleDrawEnd}
                    className="w-full aspect-square cursor-crosshair touch-none"
                    style={{ touchAction: 'none' }}
                  />
                </div>

                {/* Color Indicator */}
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: userColor }}
                    />
                    <span className="text-white text-sm">You</span>
                  </div>
                </div>

                <button
                  onClick={handleDrawingComplete}
                  className="w-full mt-4 text-white/80 hover:text-white text-sm underline"
                >
                  Skip to next →
                </button>
              </motion.div>
            )}

            {step === 'words' && (
              <motion.div
                key="words"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="glass rounded-3xl p-8"
              >
                <h1 className="text-2xl font-serif text-white text-center mb-6">
                  Your 3 words for this duo
                </h1>

                <div className="space-y-3 mb-6">
                  {words.map((word, index) => (
                    <input
                      key={index}
                      type="text"
                      placeholder={`Word ${index + 1}`}
                      value={word}
                      onChange={(e) => {
                        const newWords = [...words]
                        newWords[index] = e.target.value
                        setWords(newWords)
                      }}
                      maxLength={20}
                      className="w-full py-3 px-4 rounded-xl bg-white/90 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                    />
                  ))}
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWordsSubmit}
                  className="w-full touch-button bg-white text-orange-600 font-semibold text-lg py-4 px-8 rounded-full shadow-lg"
                >
                  Continue
                </motion.button>
              </motion.div>
            )}

            {step === 'emojis' && (
              <motion.div
                key="emojis"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="glass rounded-3xl p-8"
              >
                <h1 className="text-2xl font-serif text-white text-center mb-2">
                  Pick your emoji combo
                </h1>
                <p className="text-white/80 text-center mb-6">
                  Select 3 emojis ({selectedEmojis.length}/3)
                </p>

                {/* Selected Emojis */}
                <div className="flex justify-center space-x-4 mb-6 min-h-[60px]">
                  {selectedEmojis.map((emoji, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-5xl"
                    >
                      {emoji}
                    </motion.div>
                  ))}
                </div>

                {/* Emoji Grid */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {EMOJIS.map((emoji) => (
                    <motion.button
                      key={emoji}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEmojiToggle(emoji)}
                      className={`
                        aspect-square rounded-2xl text-4xl flex items-center justify-center
                        transition-all
                        ${
                          selectedEmojis.includes(emoji)
                            ? 'bg-white scale-110'
                            : 'bg-white/20 hover:bg-white/30'
                        }
                      `}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFinalSubmit}
                  disabled={selectedEmojis.length < 3 || partnerCompleted}
                  className="w-full touch-button bg-white text-orange-600 font-semibold text-lg py-4 px-8 rounded-full shadow-lg disabled:opacity-50 transition-opacity"
                >
                  {partnerCompleted ? 'Creating your pattern...' : 'Finish'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}
