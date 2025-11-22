'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/store/useSessionStore'

export default function RevealPage() {
  const router = useRouter()
  const { session } = useSessionStore()
  const [currentScreen, setCurrentScreen] = useState(0)

  const nextScreen = () => {
    if (currentScreen < 9) {
      setCurrentScreen((prev) => prev + 1)
    }
  }

  const prevScreen = () => {
    if (currentScreen > 0) {
      setCurrentScreen((prev) => prev - 1)
    }
  }

  // Mock data (in production, this comes from session)
  const data = {
    pattern: 'data:image/png;base64,...', // Generated pattern
    compatibility: 'Cosmic Rare',
    compatibilityScore: 89,
    quickPicks: {
      matches: 5,
      total: 7,
      biggestDiff: 'Morning bird vs Night owl',
    },
    songs: [
      { title: 'Song 1', artist: 'Artist 1' },
      { title: 'Song 2', artist: 'Artist 2' },
    ],
    insights: [
      "You're 73% sunset people",
      'You both hate mornings',
      'Musical overlap: 67%',
    ],
    stats: {
      responseSync: 85,
      musicalOverlap: 67,
      colorHarmony: 78,
      voiceMatch: 72,
    },
  }

  const screens = [
    // Screen 1: The Unique Pattern
    <div key="pattern" className="text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="mb-8"
      >
        <div className="w-full aspect-square rounded-3xl bg-gradient-to-br from-primary-purple to-primary-pink shadow-2xl overflow-hidden">
          {/* Pattern placeholder - in production, show generated pattern */}
          <div className="w-full h-full flex items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="text-white text-6xl"
            >
              ✨
            </motion.div>
          </div>
        </div>
      </motion.div>

      <h1 className="text-3xl font-serif font-semibold text-white mb-3">
        This is yours.
      </h1>
      <p className="text-3xl font-serif font-semibold text-white mb-6">
        Only yours.
      </p>

      <button className="glass px-6 py-3 rounded-full text-white font-medium">
        Save as wallpaper
      </button>
    </div>,

    // Screen 2: What You Are
    <div key="compatibility" className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="mb-8"
      >
        <div className="text-8xl mb-6">🌟</div>
        <h1 className="text-4xl font-serif font-bold text-white mb-4">
          You're
        </h1>
        <h2 className="text-5xl font-serif font-bold gradient-text mb-6">
          {data.compatibility}
        </h2>
      </motion.div>

      <div className="glass rounded-3xl p-8">
        <div className="text-white/80 mb-3">Compatibility</div>
        <div className="text-6xl font-bold text-white mb-4">
          {data.compatibilityScore}%
        </div>
        <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${data.compatibilityScore}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </div>
    </div>,

    // Screen 3: Quick Picks Revealed
    <div key="quickpicks" className="text-center">
      <h1 className="text-3xl font-serif font-semibold text-white mb-8">
        Quick Picks
      </h1>

      <div className="glass rounded-3xl p-8 mb-6">
        <div className="text-white/80 mb-2">You agreed on</div>
        <div className="text-5xl font-bold text-white mb-6">
          {data.quickPicks.matches}/{data.quickPicks.total}
        </div>

        <div className="space-y-3">
          {[...Array(data.quickPicks.total)].map((_, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl ${
                i < data.quickPicks.matches
                  ? 'bg-green-500/30'
                  : 'bg-red-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-white">Question {i + 1}</span>
                <span className="text-white text-xl">
                  {i < data.quickPicks.matches ? '✓' : '✗'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-white/80">
        Biggest difference:{' '}
        <span className="font-semibold">{data.quickPicks.biggestDiff}</span>
      </p>
    </div>,

    // Screen 4: Your Sound
    <div key="sound" className="text-center">
      <h1 className="text-3xl font-serif font-semibold text-white mb-8">
        Your Sound
      </h1>

      <div className="glass rounded-3xl p-8 mb-6">
        <div className="mb-6">
          <div className="text-white/80 mb-4">Your connection sounds like this</div>

          {/* Waveform visualization placeholder */}
          <div className="flex items-center justify-center space-x-1 h-32 mb-6">
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                className="flex-1 bg-white rounded-full"
                initial={{ height: 4 }}
                animate={{
                  height: [
                    4,
                    Math.random() * 100 + 20,
                    4,
                    Math.random() * 80 + 10,
                    4,
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.05,
                }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {data.songs.map((song, i) => (
            <div key={i} className="p-4 bg-white/10 rounded-xl text-left">
              <p className="text-white font-semibold">{song.title}</p>
              <p className="text-white/70 text-sm">{song.artist}</p>
            </div>
          ))}
        </div>
      </div>

      <button className="glass px-6 py-3 rounded-full text-white font-medium">
        Play combined mix
      </button>
    </div>,

    // Screen 5: Voice Frequencies
    <div key="voices" className="text-center">
      <h1 className="text-3xl font-serif font-semibold text-white mb-8">
        Your Voices
      </h1>

      <div className="glass rounded-3xl p-8">
        <p className="text-white/80 mb-6">
          When you speak together, you create this
        </p>

        {/* Abstract voice pattern */}
        <div className="relative h-64 mb-6 bg-white/5 rounded-2xl overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle, ${
                  i === 0
                    ? 'rgba(59, 130, 246, 0.3)'
                    : i === 1
                    ? 'rgba(236, 72, 153, 0.3)'
                    : 'rgba(168, 85, 247, 0.3)'
                } 0%, transparent 70%)`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        <p className="text-white text-sm">
          Your voice frequencies create a unique harmony
        </p>
      </div>
    </div>,

    // Screen 6: Memory Mosaic
    <div key="photos" className="text-center">
      <h1 className="text-3xl font-serif font-semibold text-white mb-8">
        Your Moments in Color
      </h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.2 }}
            className="aspect-square rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 shadow-lg"
          />
        ))}
      </div>

      {/* Color story */}
      <div className="glass rounded-3xl p-6">
        <p className="text-white/80 mb-4">Your color story</p>
        <div className="flex justify-center space-x-2">
          {['#6B5B95', '#FF6B9D', '#874da8', '#ff8fab', '#9b6db3'].map(
            (color, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="w-12 h-12 rounded-full shadow-lg"
                style={{ backgroundColor: color }}
              />
            )
          )}
        </div>
      </div>
    </div>,

    // Screen 7: Creative Fusion
    <div key="creative" className="text-center">
      <h1 className="text-3xl font-serif font-semibold text-white mb-8">
        Your Creation
      </h1>

      <div className="glass rounded-3xl p-8 mb-6">
        {/* Drawing placeholder */}
        <div className="aspect-square bg-white rounded-2xl mb-6" />

        <p className="text-white/80 mb-4">Your 6-word story:</p>
        <p className="text-white text-xl font-medium">
          "Adventure · Connection · Joy · Laughter · Forever · Together"
        </p>
      </div>

      <div className="flex justify-center space-x-3 text-4xl">
        {['❤️', '😂', '✨'].map((emoji, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: i * 0.2, type: 'spring' }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>
    </div>,

    // Screen 8: The Analysis
    <div key="analysis" className="text-center">
      <h1 className="text-3xl font-serif font-semibold text-white mb-8">
        What we learned
      </h1>

      <div className="space-y-4">
        {data.insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <p className="text-white text-lg">{insight}</p>
          </motion.div>
        ))}
      </div>
    </div>,

    // Screen 9: Your Unique Stats
    <div key="stats" className="text-center">
      <h1 className="text-3xl font-serif font-semibold text-white mb-8">
        Your Stats
      </h1>

      <div className="space-y-4">
        {Object.entries(data.stats).map(([key, value], i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.15 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-white capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="text-white font-bold text-xl">{value}%</span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1, delay: i * 0.15 + 0.3 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>,

    // Screen 10: Save or Share
    <div key="save" className="text-center">
      <h1 className="text-3xl font-serif font-semibold text-white mb-8">
        Want to keep this forever?
      </h1>

      <div className="glass rounded-3xl p-8 mb-6">
        <p className="text-white/80 mb-6">Download your unique pattern</p>

        <div className="space-y-3 mb-8">
          <button className="w-full bg-white text-primary-purple font-semibold py-4 rounded-full">
            📱 Save as wallpaper
          </button>
          <button className="w-full bg-white/20 text-white font-semibold py-4 rounded-full">
            🎬 Download animated version
          </button>
          <button className="w-full bg-white/20 text-white font-semibold py-4 rounded-full">
            📸 Instagram story templates
          </button>
        </div>

        <div className="pt-6 border-t border-white/20">
          <p className="text-white/80 mb-4">Want to save all your sessions?</p>
          <button className="w-full bg-gradient-to-r from-primary-purple to-primary-pink text-white font-semibold py-4 rounded-full">
            Create Account (optional)
          </button>
        </div>
      </div>

      <p className="text-white/60 text-sm">
        Sessions are saved for 48 hours without an account
      </p>
    </div>,
  ]

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-primary-purple via-purple-400 to-primary-pink p-6">
      {/* Screen indicator */}
      <div className="w-full max-w-md mx-auto mb-6">
        <div className="flex justify-center space-x-2">
          {screens.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === currentScreen ? 'w-8 bg-white' : 'w-1 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Screen content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {screens[currentScreen]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="w-full max-w-md mx-auto mt-6">
        <div className="flex justify-between items-center">
          <button
            onClick={prevScreen}
            disabled={currentScreen === 0}
            className="text-white/80 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Back
          </button>

          <span className="text-white/60 text-sm">
            {currentScreen + 1} / {screens.length}
          </span>

          <button
            onClick={nextScreen}
            disabled={currentScreen === screens.length - 1}
            className="text-white/80 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
    </main>
  )
}
