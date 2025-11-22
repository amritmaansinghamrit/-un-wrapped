'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/store/useSessionStore'
import { getSocket } from '@/lib/socket'
import { PHOTO_PROMPTS } from '@/data/photoPrompts'
import { extractDominantColors, rgbToHex } from '@/lib/colorExtractor'

export default function TheMomentsPage() {
  const router = useRouter()
  const { currentUser, sessionCode } = useSessionStore()
  const socket = getSocket()

  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [dominantColors, setDominantColors] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [partnerAnswered, setPartnerAnswered] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentPrompt = PHOTO_PROMPTS[currentPromptIndex]

  // Listen for partner answers
  useEffect(() => {
    socket.on('partner:answered', ({ activity }: { activity: string }) => {
      if (activity === 'the-moments') {
        setPartnerAnswered(true)
      }
    })

    return () => {
      socket.off('partner:answered')
    }
  }, [socket])

  const handlePhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)

    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setSelectedPhoto(previewUrl)
      setPhotoFile(file)

      // Extract dominant colors
      const colors = await extractDominantColors(file)
      setDominantColors(colors.map(rgbToHex))

      setIsProcessing(false)
    } catch (error) {
      console.error('Error processing photo:', error)
      alert('Failed to process photo. Please try again.')
      setIsProcessing(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedPhoto || !photoFile) return

    // Convert photo to base64 for transmission (in production, upload to S3)
    const reader = new FileReader()
    reader.readAsDataURL(photoFile)
    reader.onloadend = () => {
      const base64Photo = reader.result as string

      // Emit to partner
      socket.emit('activity:answer', {
        sessionCode,
        activity: 'the-moments',
        answer: {
          promptId: currentPrompt.id,
          photo: base64Photo, // In production, this would be an S3 URL
          dominantColors,
        },
        username: currentUser?.username,
      })

      // Move to next prompt
      setTimeout(() => {
        if (currentPromptIndex < PHOTO_PROMPTS.length - 1) {
          setCurrentPromptIndex((prev) => prev + 1)
          setSelectedPhoto(null)
          setPhotoFile(null)
          setDominantColors([])
          setPartnerAnswered(false)
        } else {
          // All prompts complete, move to next activity
          router.push('/activity/create-together')
        }
      }, 1500)
    }
  }

  const progress = ((currentPromptIndex + 1) / PHOTO_PROMPTS.length) * 100

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 p-6">
      {/* Header */}
      <div className="w-full max-w-md mx-auto mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white font-semibold">The Moments</h2>
          <span className="text-white/80 text-sm">
            {currentPromptIndex + 1} / {PHOTO_PROMPTS.length}
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

                {/* Photo Display */}
                <div className="mb-6">
                  {selectedPhoto ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative"
                    >
                      {/* Polaroid-style photo */}
                      <div className="bg-white p-3 rounded-2xl shadow-2xl">
                        <div className="aspect-square rounded-xl overflow-hidden bg-gray-200">
                          <img
                            src={selectedPhoto}
                            alt="Selected moment"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Color Palette */}
                      {dominantColors.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="mt-4 flex justify-center space-x-2"
                        >
                          {dominantColors.map((color, index) => (
                            <motion.div
                              key={index}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.4 + index * 0.1 }}
                              className="w-10 h-10 rounded-full shadow-lg"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="aspect-square rounded-2xl bg-white/10 border-2 border-dashed border-white/30 flex items-center justify-center">
                      {isProcessing ? (
                        <div className="text-center">
                          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                          <p className="text-white/70">Processing...</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="text-6xl mb-3">📸</div>
                          <p className="text-white/70">Select a photo</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* File Input (Hidden) */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />

                {/* Action Buttons */}
                <div className="space-y-3">
                  {!selectedPhoto ? (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessing}
                      className="w-full touch-button bg-white text-pink-600 font-semibold text-lg py-4 px-8 rounded-full shadow-lg disabled:opacity-50 transition-opacity"
                    >
                      Choose Photo
                    </motion.button>
                  ) : (
                    <>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSubmit}
                        disabled={partnerAnswered}
                        className="w-full touch-button bg-white text-pink-600 font-semibold text-lg py-4 px-8 rounded-full shadow-lg disabled:opacity-50 transition-opacity"
                      >
                        {partnerAnswered ? 'Moving on...' : 'Continue'}
                      </motion.button>

                      <button
                        onClick={() => {
                          setSelectedPhoto(null)
                          setPhotoFile(null)
                          setDominantColors([])
                        }}
                        className="w-full text-white/80 hover:text-white text-sm underline transition-colors"
                      >
                        Choose different photo
                      </button>
                    </>
                  )}
                </div>
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
                    ✓ Partner selected their photo
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
