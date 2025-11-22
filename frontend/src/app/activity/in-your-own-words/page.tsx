'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/store/useSessionStore'
import { getSocket } from '@/lib/socket'
import { VOICE_PROMPTS } from '@/data/voicePrompts'
import { AudioRecorder } from '@/lib/audioRecorder'

const MAX_DURATION = 20 // seconds

export default function InYourOwnWordsPage() {
  const router = useRouter()
  const { currentUser, sessionCode } = useSessionStore()
  const socket = getSocket()

  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [waveform, setWaveform] = useState<number[]>([])
  const [partnerAnswered, setPartnerAnswered] = useState(false)

  const recorderRef = useRef<AudioRecorder | null>(null)
  const animationFrameRef = useRef<number>()
  const timerRef = useRef<NodeJS.Timeout>()

  const currentPrompt = VOICE_PROMPTS[currentPromptIndex]

  // Listen for partner answers
  useEffect(() => {
    socket.on('partner:answered', ({ activity }: { activity: string }) => {
      if (activity === 'in-your-own-words') {
        setPartnerAnswered(true)
      }
    })

    return () => {
      socket.off('partner:answered')
    }
  }, [socket])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const updateWaveform = () => {
    if (recorderRef.current && recorderRef.current.isRecording()) {
      const newWaveform = recorderRef.current.getWaveform()
      setWaveform(newWaveform)
      animationFrameRef.current = requestAnimationFrame(updateWaveform)
    }
  }

  const handleStartRecording = async () => {
    try {
      recorderRef.current = new AudioRecorder()
      await recorderRef.current.start()

      setIsRecording(true)
      setRecordingTime(0)
      setAudioBlob(null)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= MAX_DURATION - 1) {
            handleStopRecording()
            return MAX_DURATION
          }
          return prev + 1
        })
      }, 1000)

      // Start waveform animation
      updateWaveform()
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Failed to access microphone. Please check permissions.')
    }
  }

  const handleStopRecording = async () => {
    if (!recorderRef.current) return

    try {
      const blob = await recorderRef.current.stop()
      setAudioBlob(blob)
      setIsRecording(false)

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      // Stop waveform animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    } catch (error) {
      console.error('Error stopping recording:', error)
    }
  }

  const handleSubmit = async () => {
    if (!audioBlob) return

    // Get final waveform and frequencies
    const frequencies = recorderRef.current?.getFrequencies() || []

    // Convert blob to base64 for transmission (in production, upload to S3)
    const reader = new FileReader()
    reader.readAsDataURL(audioBlob)
    reader.onloadend = () => {
      const base64Audio = reader.result as string

      // Emit to partner
      socket.emit('activity:answer', {
        sessionCode,
        activity: 'in-your-own-words',
        answer: {
          promptId: currentPrompt.id,
          audio: base64Audio, // In production, this would be an S3 URL
          duration: recordingTime,
          frequencies,
          waveform,
        },
        username: currentUser?.username,
      })

      // Move to next prompt
      setTimeout(() => {
        if (currentPromptIndex < VOICE_PROMPTS.length - 1) {
          setCurrentPromptIndex((prev) => prev + 1)
          setAudioBlob(null)
          setRecordingTime(0)
          setWaveform([])
          setPartnerAnswered(false)
        } else {
          // All prompts complete, move to next activity
          router.push('/activity/the-moments')
        }
      }, 1500)
    }
  }

  const progress = ((currentPromptIndex + 1) / VOICE_PROMPTS.length) * 100

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-500 p-6">
      {/* Header */}
      <div className="w-full max-w-md mx-auto mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white font-semibold">In Your Own Words</h2>
          <span className="text-white/80 text-sm">
            {currentPromptIndex + 1} / {VOICE_PROMPTS.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPromptIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="glass rounded-3xl p-8">
                {/* Prompt */}
                <h1 className="text-2xl font-serif font-semibold text-white text-center mb-8">
                  {currentPrompt.prompt}
                </h1>

                {/* Waveform Visualization */}
                <div className="h-32 flex items-center justify-center mb-8 bg-white/10 rounded-2xl overflow-hidden">
                  {isRecording || audioBlob ? (
                    <div className="flex items-center justify-center space-x-1 h-full w-full px-4">
                      {waveform.map((value, index) => (
                        <motion.div
                          key={index}
                          className="flex-1 bg-white rounded-full"
                          style={{
                            height: `${(value / 255) * 100}%`,
                            minHeight: '4px',
                          }}
                          animate={{
                            scaleY: isRecording ? [1, 1.2, 1] : 1,
                          }}
                          transition={{
                            duration: 0.3,
                            repeat: isRecording ? Infinity : 0,
                            delay: index * 0.02,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-white/50 text-sm">Tap and hold to record</div>
                  )}
                </div>

                {/* Timer */}
                {(isRecording || audioBlob) && (
                  <div className="text-center mb-6">
                    <span className="text-white text-3xl font-bold">
                      {recordingTime}s
                    </span>
                    <span className="text-white/70 text-lg"> / {MAX_DURATION}s</span>
                  </div>
                )}

                {/* Record Button */}
                {!audioBlob && (
                  <div className="flex justify-center mb-6">
                    <motion.button
                      onMouseDown={handleStartRecording}
                      onMouseUp={handleStopRecording}
                      onTouchStart={handleStartRecording}
                      onTouchEnd={handleStopRecording}
                      whileTap={{ scale: 0.9 }}
                      className={`
                        w-24 h-24 rounded-full flex items-center justify-center
                        transition-all duration-300 shadow-2xl
                        ${
                          isRecording
                            ? 'bg-red-500 animate-pulse'
                            : 'bg-white hover:scale-105'
                        }
                      `}
                    >
                      {isRecording ? (
                        <div className="w-8 h-8 bg-white rounded-sm" />
                      ) : (
                        <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-red-500 border-b-8 border-b-transparent ml-1" />
                      )}
                    </motion.button>
                  </div>
                )}

                {/* Instructions */}
                <p className="text-center text-white/70 text-sm mb-6">
                  {!audioBlob
                    ? 'Hold to record (max 20 seconds)'
                    : 'Recording saved!'}
                </p>

                {/* Action Buttons */}
                {audioBlob && (
                  <div className="space-y-3">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSubmit}
                      disabled={partnerAnswered}
                      className="w-full touch-button bg-white text-purple-600 font-semibold text-lg py-4 px-8 rounded-full shadow-lg disabled:opacity-50 transition-opacity"
                    >
                      {partnerAnswered ? 'Moving on...' : 'Continue'}
                    </motion.button>

                    <button
                      onClick={() => setAudioBlob(null)}
                      className="w-full text-white/80 hover:text-white text-sm underline transition-colors"
                    >
                      Re-record
                    </button>
                  </div>
                )}
              </div>

              {/* Partner Status */}
              <AnimatePresence>
                {partnerAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 text-center text-white/80 text-sm"
                  >
                    ✓ Partner recorded their message
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
