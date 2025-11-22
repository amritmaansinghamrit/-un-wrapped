'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/store/useSessionStore'
import { getSocket } from '@/lib/socket'
import { getRandomQuestions } from '@/data/quickPickQuestions'
import type { QuickPickQuestion } from '@/types'

const TIMER_DURATION = 25 // seconds
const QUESTIONS_COUNT = 7

export default function QuickPicksPage() {
  const router = useRouter()
  const { currentUser, sessionCode } = useSessionStore()
  const socket = getSocket()

  const [questions, setQuestions] = useState<QuickPickQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION)
  const [startTime, setStartTime] = useState<number>(0)
  const [partnerAnswered, setPartnerAnswered] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Initialize questions
  useEffect(() => {
    const selectedQuestions = getRandomQuestions(QUESTIONS_COUNT)
    setQuestions(selectedQuestions)
    setStartTime(Date.now())
  }, [])

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || selectedAnswer || isTransitioning) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, selectedAnswer, isTransitioning])

  // Listen for partner answers
  useEffect(() => {
    socket.on('partner:answered', ({ activity }: { activity: string }) => {
      if (activity === 'quick-picks') {
        setPartnerAnswered(true)
      }
    })

    return () => {
      socket.off('partner:answered')
    }
  }, [socket])

  const handleAnswer = (answer: string) => {
    if (selectedAnswer || isTransitioning) return

    const responseTime = Date.now() - startTime
    setSelectedAnswer(answer)

    // Emit answer to partner
    socket.emit('activity:answer', {
      sessionCode,
      activity: 'quick-picks',
      answer: {
        questionId: questions[currentQuestionIndex].id,
        answer,
        time: responseTime,
        username: currentUser?.username,
      },
      username: currentUser?.username,
    })

    // Wait for both to answer or move on after 3 seconds
    setTimeout(() => {
      moveToNextQuestion()
    }, 3000)
  }

  const handleTimeout = () => {
    // Auto-select random answer on timeout
    const randomAnswer = Math.random() > 0.5 ? 'A' : 'B'
    handleAnswer(randomAnswer)
  }

  const moveToNextQuestion = () => {
    setIsTransitioning(true)

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1)
        setSelectedAnswer(null)
        setTimeLeft(TIMER_DURATION)
        setStartTime(Date.now())
        setPartnerAnswered(false)
        setIsTransitioning(false)
      } else {
        // All questions complete, move to next activity
        router.push('/activity/your-sound')
      }
    }, 500)
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-purple to-primary-pink">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-primary-purple via-purple-400 to-primary-pink p-6">
      {/* Header */}
      <div className="w-full max-w-md mx-auto mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white font-semibold">Quick Picks</h2>
          <span className="text-white/80 text-sm">
            {currentQuestionIndex + 1} / {questions.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              {/* Timer Circle */}
              <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="white"
                      strokeOpacity="0.2"
                      strokeWidth="4"
                      fill="none"
                    />
                    <motion.circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="white"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={2 * Math.PI * 28}
                      strokeDashoffset={
                        2 * Math.PI * 28 * (1 - timeLeft / TIMER_DURATION)
                      }
                      transition={{ duration: 1, ease: 'linear' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{timeLeft}</span>
                  </div>
                </div>
              </div>

              {/* Question */}
              <div className="glass rounded-3xl p-8 mb-6">
                <h1 className="text-3xl font-serif font-semibold text-white text-center mb-8">
                  {currentQuestion.question}
                </h1>

                {/* VS Divider */}
                <div className="flex items-center justify-center mb-8">
                  <div className="h-px flex-1 bg-white/20" />
                  <span className="mx-4 text-white/60 font-semibold">VS</span>
                  <div className="h-px flex-1 bg-white/20" />
                </div>

                {/* Options */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Option A */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAnswer('A')}
                    disabled={!!selectedAnswer || isTransitioning}
                    className={`
                      touch-button py-6 px-4 rounded-2xl font-semibold text-lg
                      transition-all duration-300
                      ${
                        selectedAnswer === 'A'
                          ? 'bg-blue-500 text-white scale-105'
                          : 'bg-white/90 text-blue-600 hover:bg-white'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    {currentQuestion.optionA}
                  </motion.button>

                  {/* Option B */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAnswer('B')}
                    disabled={!!selectedAnswer || isTransitioning}
                    className={`
                      touch-button py-6 px-4 rounded-2xl font-semibold text-lg
                      transition-all duration-300
                      ${
                        selectedAnswer === 'B'
                          ? 'bg-pink-500 text-white scale-105'
                          : 'bg-white/90 text-pink-600 hover:bg-white'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    {currentQuestion.optionB}
                  </motion.button>
                </div>
              </div>

              {/* Partner Status */}
              <AnimatePresence>
                {partnerAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center text-white/80 text-sm"
                  >
                    ✓ Partner answered
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}
