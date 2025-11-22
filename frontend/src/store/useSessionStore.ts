import { create } from 'zustand'
import type { Session, User } from '@/types'

interface SessionStore {
  // Session state
  session: Session | null
  sessionCode: string | null
  currentUser: User | null
  partnerUser: User | null

  // Activity state
  currentActivity: number
  isActivityComplete: boolean

  // Connection state
  isConnected: boolean
  isWaitingForPartner: boolean

  // Actions
  setSession: (session: Session) => void
  setSessionCode: (code: string) => void
  setCurrentUser: (user: User) => void
  setPartnerUser: (user: User) => void
  setCurrentActivity: (index: number) => void
  setActivityComplete: (complete: boolean) => void
  setConnected: (connected: boolean) => void
  setWaitingForPartner: (waiting: boolean) => void
  updateUserReady: (username: string, ready: boolean) => void
  reset: () => void
}

export const useSessionStore = create<SessionStore>((set) => ({
  // Initial state
  session: null,
  sessionCode: null,
  currentUser: null,
  partnerUser: null,
  currentActivity: -1, // -1 means waiting room, 0-4 are activities, 5+ are reveal screens
  isActivityComplete: false,
  isConnected: false,
  isWaitingForPartner: false,

  // Actions
  setSession: (session) => set({ session }),
  setSessionCode: (code) => set({ sessionCode: code }),
  setCurrentUser: (user) => set({ currentUser: user }),
  setPartnerUser: (user) => set({ partnerUser: user }),
  setCurrentActivity: (index) => set({ currentActivity: index }),
  setActivityComplete: (complete) => set({ isActivityComplete: complete }),
  setConnected: (connected) => set({ isConnected: connected }),
  setWaitingForPartner: (waiting) => set({ isWaitingForPartner: waiting }),

  updateUserReady: (username, ready) =>
    set((state) => {
      if (state.currentUser?.username === username) {
        return { currentUser: { ...state.currentUser, isReady: ready } }
      }
      if (state.partnerUser?.username === username) {
        return { partnerUser: { ...state.partnerUser, isReady: ready } }
      }
      return state
    }),

  reset: () =>
    set({
      session: null,
      sessionCode: null,
      currentUser: null,
      partnerUser: null,
      currentActivity: -1,
      isActivityComplete: false,
      isConnected: false,
      isWaitingForPartner: false,
    }),
}))
