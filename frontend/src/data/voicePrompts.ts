export interface VoicePrompt {
  id: string
  prompt: string
}

export const VOICE_PROMPTS: VoicePrompt[] = [
  {
    id: 'vp1',
    prompt: 'What was your first thought when we met?',
  },
  {
    id: 'vp2',
    prompt: 'What makes us... us?',
  },
  {
    id: 'vp3',
    prompt: 'Share our inside joke that no one else gets',
  },
  {
    id: 'vp4',
    prompt: 'A moment with them you never want to forget',
  },
  {
    id: 'vp5',
    prompt: 'What do you love most about them?',
  },
]
