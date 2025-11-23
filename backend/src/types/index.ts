export interface Session {
  id: string
  code: string
  creator: {
    username: string
    userId?: string
    socketId?: string
  }
  joiner: {
    username: string
    userId?: string
    socketId?: string
  } | null
  status: 'waiting' | 'active' | 'completed' | 'expired'
  createdAt: Date
  expiresAt: Date
  readyStatus: {
    [username: string]: boolean
  }
  activities: SessionActivities
  // Question synchronization
  questionSync?: {
    currentActivity: string | null
    currentQuestionIndex: number
    answersReceived: Set<string> // usernames who answered current question
    questions: any[] // Shared question set for current activity
  }
}

export interface SessionActivities {
  quickPicks: QuickPickResponse[]
  songs: SongResponse[]
  voices: VoiceResponse[]
  photos: PhotoResponse[]
  creative: CreativeResponse | null
}

export interface QuickPickResponse {
  questionId: string
  question: string
  user1Answer: string
  user2Answer: string
  user1Time: number
  user2Time: number
  match: boolean
}

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
  audioFeatures: any
}

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
