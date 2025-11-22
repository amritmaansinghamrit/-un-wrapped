export interface VoicePrompt {
  id: string
  prompt: string
}

export const VOICE_PROMPTS: VoicePrompt[] = [
  {
    id: 'vp1',
    prompt: 'First impression in one sentence',
  },
  {
    id: 'vp2',
    prompt: 'Why them?',
  },
  {
    id: 'vp3',
    prompt: 'Our inside joke',
  },
]
