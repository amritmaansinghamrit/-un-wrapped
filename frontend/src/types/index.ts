// Session Types
export interface Session {
  id: string // 6-digit code like "XK9P2M"
  creator: {
    username: string
    userId?: string
  }
  joiner: {
    username: string
    userId?: string
  }
  status: 'waiting' | 'active' | 'completed' | 'expired'
  createdAt: Date
  expiresAt: Date
  activities: {
    quickPicks: QuickPickResponse[]
    songs: SongResponse[]
    voices: VoiceResponse[]
    photos: PhotoResponse[]
    creative: CreativeResponse | null
  }
  generatedPattern?: {
    staticUrl: string
    animatedUrl: string
    metadata: PatternMetadata
  }
}

// Quick Pick Types
export interface QuickPickResponse {
  questionId: string
  question: string
  user1Answer: string
  user2Answer: string
  user1Time: number // milliseconds
  user2Time: number
  match: boolean
}

export interface QuickPickQuestion {
  id: string
  question: string
  optionA: string
  optionB: string
}

// Song Types
export interface SongResponse {
  promptId: string
  prompt: string
  user1Song: SongData | null
  user2Song: SongData | null
}

export interface SongData {
  spotifyId: string
  title: string
  artist: string
  albumArt: string
  previewUrl: string
  audioFeatures: {
    bpm: number
    energy: number
    valence: number
    danceability: number
  }
}

// Voice Types
export interface VoiceResponse {
  promptId: string
  prompt: string
  user1Audio: AudioData | null
  user2Audio: AudioData | null
}

export interface AudioData {
  url: string
  duration: number
  frequencies: number[]
  waveform: number[]
}

// Photo Types
export interface PhotoResponse {
  promptId: string
  prompt: string
  user1Photo: PhotoData | null
  user2Photo: PhotoData | null
}

export interface PhotoData {
  url: string
  dominantColors: string[]
}

// Creative Types
export interface CreativeResponse {
  drawing: {
    strokes: DrawingStroke[]
    users: string[]
  }
  words: {
    user1: string[]
    user2: string[]
  }
  emojis: {
    user1: string[]
    user2: string[]
  }
}

export interface DrawingStroke {
  x: number
  y: number
  color: string
  username: string
  timestamp: number
}

// Pattern Types
export interface PatternMetadata {
  seed: string
  compatibility: string
  compatibilityScore: number
  insights: string[]
  stats: {
    responseSync: number
    musicalOverlap: number
    colorHarmony: number
    voiceMatch: number
  }
}

// User Types
export interface User {
  username: string
  userId?: string
  isReady: boolean
}

// WebSocket Event Types
export type SocketEvent =
  | { type: 'session:created'; payload: { sessionId: string; code: string } }
  | { type: 'partner:joined'; payload: { username: string } }
  | { type: 'partner:ready'; payload: { username: string } }
  | { type: 'activity:start'; payload: { activityIndex: number } }
  | { type: 'partner:answered'; payload: any }
  | { type: 'both:complete'; payload: any }
  | { type: 'pattern:generating'; payload: { progress: number } }
  | { type: 'pattern:ready'; payload: PatternMetadata }
  | { type: 'drawing:stroke'; payload: DrawingStroke }
  | { type: 'error'; payload: { message: string } }
