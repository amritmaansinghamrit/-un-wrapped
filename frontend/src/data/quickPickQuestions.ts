import { QuickPickQuestion } from '@/types'

export const QUICK_PICK_QUESTIONS: QuickPickQuestion[] = [
  // Lifestyle & Travel
  { id: 'q1', question: 'Our dream date: Mountains or Beach?', optionA: 'Mountains', optionB: 'Beach' },
  { id: 'q2', question: 'Plan our trips or Be spontaneous?', optionA: 'Plan ahead', optionB: 'Spontaneous' },
  { id: 'q6', question: 'Perfect life together: City or Countryside?', optionA: 'City life', optionB: 'Countryside' },
  { id: 'q7', question: 'Our vibe: Adventure or Cozy comfort?', optionA: 'Adventure', optionB: 'Comfort' },
  { id: 'q17', question: 'Date night: Indoor or Outdoor?', optionA: 'Indoor', optionB: 'Outdoor' },

  // Daily Life Together
  { id: 'q4', question: "I'm more of a: Morning person or Night owl?", optionA: 'Morning bird', optionB: 'Night owl' },
  { id: 'q8', question: 'Our morning ritual: Coffee or Tea?', optionA: 'Coffee', optionB: 'Tea' },
  { id: 'q12', question: 'Dinner together: Cook or Order in?', optionA: 'Cook', optionB: 'Order in' },
  { id: 'q13', question: 'Friday night: Go out or Stay in?', optionA: 'Party', optionB: 'Netflix' },
  { id: 'q11', question: 'Our future pet: Cat or Dog?', optionA: 'Cats', optionB: 'Dogs' },

  // Personality & Preferences
  { id: 'q3', question: 'With money: Save for us or Treat ourselves?', optionA: 'Save', optionB: 'Splurge' },
  { id: 'q5', question: 'My taste: Sweet or Spicy?', optionA: 'Sweet', optionB: 'Spicy' },
  { id: 'q9', question: 'Quiet night in: Books or Movies?', optionA: 'Books', optionB: 'Movies' },
  { id: 'q10', question: 'Favorite season: Summer or Winter?', optionA: 'Summer', optionB: 'Winter' },
  { id: 'q18', question: 'Our music style: Loud or Soft?', optionA: 'Loud', optionB: 'Soft' },

  // Communication & Connection
  { id: 'q16', question: 'Miss you: Text or Call?', optionA: 'Text', optionB: 'Call' },
  { id: 'q19', question: 'For our dates: Early or Fashionably late?', optionA: 'Early', optionB: 'Late' },

  // Style & Aesthetics
  { id: 'q14', question: 'Our style: Traditional or Modern?', optionA: 'Traditional', optionB: 'Modern' },
  { id: 'q20', question: 'Our space: Minimalist or Full of memories?', optionA: 'Minimalist', optionB: 'Maximalist' },

  // Love Languages & Romance
  { id: 'q21', question: 'Show love: Physical touch or Words of affirmation?', optionA: 'Touch', optionB: 'Words' },
  { id: 'q22', question: 'Perfect gift: Something practical or Sentimental?', optionA: 'Practical', optionB: 'Sentimental' },
  { id: 'q23', question: 'Date idea: Try something new or Our favorite spot?', optionA: 'Something new', optionB: 'Favorite spot' },
  { id: 'q24', question: 'Express feelings: Actions or Words?', optionA: 'Actions', optionB: 'Words' },
]

// Get random 7 questions for a session
export function getRandomQuestions(count: number = 7): QuickPickQuestion[] {
  const shuffled = [...QUICK_PICK_QUESTIONS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
