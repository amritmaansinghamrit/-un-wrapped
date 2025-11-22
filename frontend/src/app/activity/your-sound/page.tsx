'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/store/useSessionStore'
import { getSocket } from '@/lib/socket'
import { SONG_PROMPTS } from '@/data/songPrompts'
import { searchTracks, getTrackAudioFeatures, SpotifyTrack } from '@/lib/spotify'

export default function YourSoundPage() {
  const router = useRouter()
  const { currentUser, sessionCode } = useSessionStore()
  const socket = getSocket()

  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedSong, setSelectedSong] = useState<SpotifyTrack | null>(null)
  const [rating, setRating] = useState(5)
  const [partnerAnswered, setPartnerAnswered] = useState(false)

  const currentPrompt = SONG_PROMPTS[currentPromptIndex]

  // Listen for partner answers
  useEffect(() => {
    socket.on('partner:answered', ({ activity }: { activity: string }) => {
      if (activity === 'your-sound') {
        setPartnerAnswered(true)
      }
    })

    return () => {
      socket.off('partner:answered')
    }
  }, [socket])

  // Search for songs
  useEffect(() => {
    if (!searchQuery.trim() || currentPrompt.type !== 'search') return

    const timeoutId = setTimeout(async () => {
      setIsSearching(true)
      const results = await searchTracks(searchQuery)
      setSearchResults(results)
      setIsSearching(false)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, currentPrompt.type])

  const handleSelectSong = (song: SpotifyTrack) => {
    setSelectedSong(song)
  }

  const handleSubmit = async () => {
    if (currentPrompt.type === 'search' && !selectedSong) return
    if (currentPrompt.type === 'rating' && !rating) return

    // Get audio features for selected song
    let audioFeatures = null
    if (selectedSong) {
      audioFeatures = await getTrackAudioFeatures(selectedSong.id)
    }

    // Emit to partner
    socket.emit('activity:answer', {
      sessionCode,
      activity: 'your-sound',
      answer: {
        promptId: currentPrompt.id,
        song: selectedSong
          ? {
              spotifyId: selectedSong.id,
              title: selectedSong.name,
              artist: selectedSong.artists[0].name,
              albumArt: selectedSong.album.images[0]?.url,
              previewUrl: selectedSong.preview_url,
              audioFeatures,
            }
          : null,
        rating: currentPrompt.type === 'rating' ? rating : null,
      },
      username: currentUser?.username,
    })

    // Move to next prompt
    setTimeout(() => {
      if (currentPromptIndex < SONG_PROMPTS.length - 1) {
        setCurrentPromptIndex((prev) => prev + 1)
        setSearchQuery('')
        setSearchResults([])
        setSelectedSong(null)
        setRating(5)
        setPartnerAnswered(false)
      } else {
        // All prompts complete, move to next activity
        router.push('/activity/in-your-own-words')
      }
    }, 1500)
  }

  const progress = ((currentPromptIndex + 1) / SONG_PROMPTS.length) * 100

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500 p-6">
      {/* Header */}
      <div className="w-full max-w-md mx-auto mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white font-semibold">Your Sound</h2>
          <span className="text-white/80 text-sm">
            {currentPromptIndex + 1} / {SONG_PROMPTS.length}
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
              {/* Vinyl Record Visual */}
              <div className="flex justify-center mb-8">
                <div className="relative w-32 h-32">
                  <motion.div
                    animate={{ rotate: selectedSong ? 360 : 0 }}
                    transition={{
                      duration: 3,
                      repeat: selectedSong ? Infinity : 0,
                      ease: 'linear',
                    }}
                    className="w-full h-full rounded-full bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl"
                  >
                    <div className="absolute inset-4 rounded-full bg-white/10" />
                    <div className="absolute inset-12 rounded-full bg-gray-900" />
                  </motion.div>
                </div>
              </div>

              {/* Prompt */}
              <div className="glass rounded-3xl p-8">
                <h1 className="text-2xl font-serif font-semibold text-white text-center mb-6">
                  {currentPrompt.prompt}
                </h1>

                {/* Search Input (for search type) */}
                {currentPrompt.type === 'search' && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Search for a song..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full py-3 px-4 rounded-xl bg-white/90 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                    />

                    {/* Search Results */}
                    {isSearching && (
                      <div className="text-center text-white/70">Searching...</div>
                    )}

                    {searchResults.length > 0 && (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {searchResults.map((song) => (
                          <motion.button
                            key={song.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelectSong(song)}
                            className={`
                              w-full p-3 rounded-xl text-left transition-all
                              ${
                                selectedSong?.id === song.id
                                  ? 'bg-white text-gray-900'
                                  : 'bg-white/20 text-white hover:bg-white/30'
                              }
                            `}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 rounded-lg bg-gray-700 overflow-hidden flex-shrink-0">
                                {song.album.images[0] && (
                                  <img
                                    src={song.album.images[0].url}
                                    alt={song.name}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{song.name}</p>
                                <p className="text-sm opacity-70 truncate">
                                  {song.artists[0].name}
                                </p>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Rating Slider (for rating type) */}
                {currentPrompt.type === 'rating' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <span className="text-6xl font-bold text-white">{rating}</span>
                      <span className="text-2xl text-white/70">/10</span>
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full h-3 bg-white/20 rounded-full appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6
                        [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-white
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                    />

                    <div className="flex justify-between text-white/60 text-sm">
                      <span>Not their vibe</span>
                      <span>Perfect taste!</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit}
                  disabled={
                    (currentPrompt.type === 'search' && !selectedSong) ||
                    partnerAnswered
                  }
                  className="w-full mt-6 touch-button bg-white text-purple-600 font-semibold text-lg py-4 px-8 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {partnerAnswered ? 'Moving on...' : 'Continue'}
                </motion.button>
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
