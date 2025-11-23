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
  const { currentUser, sessionCode, partnerUser } = useSessionStore()
  const socket = getSocket()

  const [questions, setQuestions] = useState<QuickPickQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION)
  const [startTime, setStartTime] = useState<number>(0)
  const [partnerAnswered, setPartnerAnswered] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Initialize questions (synchronized with backend)
  useEffect(() => {
    if (!sessionCode) return

    try {
      const selectedQuestions = getRandomQuestions(QUESTIONS_COUNT)
      setQuestions(selectedQuestions)
      setStartTime(Date.now())

      // Tell server to initialize activity with these questions
      socket.emit('activity:start', {
        sessionCode,
        activity: 'quick-picks',
        questions: selectedQuestions,
      })

      // Listen for current question from server
      socket.on('question:current', ({ questionIndex, question }) => {
        try {
          if (question) {
            setCurrentQuestionIndex(questionIndex)
            setStartTime(Date.now())
          }
        } catch (error) {
          console.error('Error handling question:current:', error)
        }
      })

      // Listen for next question from server (only advances when both answered)
      socket.on('question:next', ({ questionIndex, question }) => {
        try {
          setIsTransitioning(true)
          setTimeout(() => {
            setCurrentQuestionIndex(questionIndex)
            setSelectedAnswer(null)
            setTimeLeft(TIMER_DURATION)
            setStartTime(Date.now())
            setPartnerAnswered(false)
            setIsTransitioning(false)
          }, 500)
        } catch (error) {
          console.error('Error handling question:next:', error)
          setIsTransitioning(false)
        }
      })

      // Listen for activity complete
      socket.on('activity:complete', () => {
        try {
          router.push('/activity/your-sound')
        } catch (error) {
          console.error('Error handling activity:complete:', error)
        }
      })
    } catch (error) {
      console.error('Error initializing activity:', error)
    }

    return () => {
      socket.off('question:current')
      socket.off('question:next')
      socket.off('activity:complete')
    }
  }, [sessionCode, socket, router])

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

    // Emit answer to server (server will advance when both answered)
    socket.emit('activity:answer', {
      sessionCode,
      activity: 'quick-picks',
      answer: {
        questionId: questions[currentQuestionIndex]?.id,
        answer,
        time: responseTime,
        username: currentUser?.username,
      },
      username: currentUser?.username,
    })
    // No auto-advance - server controls this now!
  }

  const handleTimeout = () => {
    // Auto-select random answer on timeout
    const randomAnswer = Math.random() > 0.5 ? 'A' : 'B'
    handleAnswer(randomAnswer)
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
    <main className="min-h-screen flex flex-col bg-white p-4">
      {/* QuizUp-style Player Status Bar */}
      <div className="w-full max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-4 shadow-sm">
          {/* You */}
          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                {currentUser?.username?.[0]?.toUpperCase() || 'Y'}
              </div>
              {selectedAnswer && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <span className="text-white text-xs font-bold">✓</span>
                </motion.div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{currentUser?.username}</p>
              <p className="text-xs text-gray-500">
                {selectedAnswer ? 'Answered!' : 'Choosing...'}
              </p>
            </div>
          </div>

          {/* VS */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
              VS
            </div>
          </div>

          {/* Partner */}
          <div className="flex items-center gap-3 flex-1 flex-row-reverse">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                {partnerUser?.username?.[0]?.toUpperCase() || '?'}
              </div>
              {partnerAnswered && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -left-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <span className="text-white text-xs font-bold">✓</span>
                </motion.div>
              )}
            </div>
            <div className="flex-1 min-w-0 text-right">
              <p className="font-semibold text-gray-900 truncate">
                {partnerUser?.username || 'Partner'}
              </p>
              <p className="text-xs text-gray-500">
                {partnerAnswered ? 'Answered!' : 'Choosing...'}
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">
            {currentQuestionIndex + 1} of {questions.length}
          </span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-rose-400 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-1 flex items-center justify-center px-2">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              {/* Hinge-style Card */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Timer Bar at top */}
                <div className="relative h-1.5 bg-gray-100">
                  <motion.div
                    className="h-full bg-gradient-to-r from-rose-500 to-pink-500"
                    animate={{ width: `${(timeLeft / TIMER_DURATION) * 100}%` }}
                    transition={{ duration: 1, ease: 'linear' }}
                  />
                </div>

                {/* Card Content */}
                <div className="p-8">
                  {/* Timer Display */}
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                        <span className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                          {timeLeft}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Question */}
                  <h1 className="text-3xl font-serif font-semibold text-gray-900 text-center mb-10 leading-tight">
                    {currentQuestion.question}
                  </h1>

                  {/* Options - Full width stacked buttons */}
                  <div className="space-y-4">
                    {/* Option A */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer('A')}
                      disabled={!!selectedAnswer || isTransitioning}
                      className={`
                        w-full touch-button py-6 px-6 rounded-2xl font-semibold text-lg
                        transition-all duration-300 border-2
                        ${
                          selectedAnswer === 'A'
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg scale-[1.02]'
                            : 'bg-white text-gray-900 border-gray-200 hover:border-blue-400 hover:shadow-md'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {selectedAnswer === 'A' && <span>✓</span>}
                        {currentQuestion.optionA}
                      </span>
                    </motion.button>

                    {/* Option B */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer('B')}
                      disabled={!!selectedAnswer || isTransitioning}
                      className={`
                        w-full touch-button py-6 px-6 rounded-2xl font-semibold text-lg
                        transition-all duration-300 border-2
                        ${
                          selectedAnswer === 'B'
                            ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white border-pink-600 shadow-lg scale-[1.02]'
                            : 'bg-white text-gray-900 border-gray-200 hover:border-pink-400 hover:shadow-md'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {selectedAnswer === 'B' && <span>✓</span>}
                        {currentQuestion.optionB}
                      </span>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Waiting indicator when both answered */}
              <AnimatePresence>
                {selectedAnswer && partnerAnswered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center"
                  >
                    <p className="text-green-700 font-semibold flex items-center justify-center gap-2">
                      <span className="text-2xl">🎉</span>
                      Both answered! Moving to next question...
                    </p>
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
