import { QuickPickQuestion } from '@/types'

export const QUICK_PICK_QUESTIONS: QuickPickQuestion[] = [
  { id: 'q1', question: 'Mountains or Beach?', optionA: 'Mountains', optionB: 'Beach' },
  { id: 'q2', question: 'Save or Splurge?', optionA: 'Save', optionB: 'Splurge' },
  { id: 'q3', question: 'Plan ahead or Spontaneous?', optionA: 'Plan ahead', optionB: 'Spontaneous' },
  { id: 'q4', question: 'Morning bird or Night owl?', optionA: 'Morning bird', optionB: 'Night owl' },
  { id: 'q5', question: 'Sweet or Spicy?', optionA: 'Sweet', optionB: 'Spicy' },
  { id: 'q6', question: 'City life or Countryside?', optionA: 'City life', optionB: 'Countryside' },
  { id: 'q7', question: 'Adventure or Comfort?', optionA: 'Adventure', optionB: 'Comfort' },
  { id: 'q8', question: 'Coffee or Tea?', optionA: 'Coffee', optionB: 'Tea' },
  { id: 'q9', question: 'Books or Movies?', optionA: 'Books', optionB: 'Movies' },
  { id: 'q10', question: 'Summer or Winter?', optionA: 'Summer', optionB: 'Winter' },
  { id: 'q11', question: 'Cats or Dogs?', optionA: 'Cats', optionB: 'Dogs' },
  { id: 'q12', question: 'Cook or Order in?', optionA: 'Cook', optionB: 'Order in' },
  { id: 'q13', question: 'Party or Netflix?', optionA: 'Party', optionB: 'Netflix' },
  { id: 'q14', question: 'Traditional or Modern?', optionA: 'Traditional', optionB: 'Modern' },
  { id: 'q15', question: 'Leader or Follower?', optionA: 'Leader', optionB: 'Follower' },
  { id: 'q16', question: 'Text or Call?', optionA: 'Text', optionB: 'Call' },
  { id: 'q17', question: 'Indoor or Outdoor?', optionA: 'Indoor', optionB: 'Outdoor' },
  { id: 'q18', question: 'Music loud or Soft?', optionA: 'Loud', optionB: 'Soft' },
  { id: 'q19', question: 'Early or Fashionably late?', optionA: 'Early', optionB: 'Fashionably late' },
  { id: 'q20', question: 'Minimalist or Maximalist?', optionA: 'Minimalist', optionB: 'Maximalist' },
]

// Get random 7 questions for a session
export function getRandomQuestions(count: number = 7): QuickPickQuestion[] {
  const shuffled = [...QUICK_PICK_QUESTIONS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
