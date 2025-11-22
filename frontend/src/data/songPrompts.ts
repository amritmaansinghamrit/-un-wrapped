export interface SongPrompt {
  id: string
  prompt: string
  type: 'search' | 'rating' | 'special'
}

export const SONG_PROMPTS: SongPrompt[] = [
  {
    id: 'sp1',
    prompt: 'What song reminds you of them?',
    type: 'search',
  },
  {
    id: 'sp2',
    prompt: "What's OUR song according to you?",
    type: 'search',
  },
  {
    id: 'sp3',
    prompt: 'After a fight, what helps?',
    type: 'search',
  },
  {
    id: 'sp4',
    prompt: 'Rate their music taste',
    type: 'rating',
  },
  {
    id: 'sp5',
    prompt: 'Special occasion soundtrack?',
    type: 'search',
  },
]
