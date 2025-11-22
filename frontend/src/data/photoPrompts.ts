export interface PhotoPrompt {
  id: string
  prompt: string
}

export const PHOTO_PROMPTS: PhotoPrompt[] = [
  {
    id: 'pp1',
    prompt: 'First photo together',
  },
  {
    id: 'pp2',
    prompt: 'Favorite memory',
  },
  {
    id: 'pp3',
    prompt: 'Funniest moment',
  },
  {
    id: 'pp4',
    prompt: 'Recent favorite',
  },
  {
    id: 'pp5',
    prompt: "One that captures 'us'",
  },
]
