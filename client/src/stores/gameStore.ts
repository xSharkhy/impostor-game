import { create } from 'zustand'
import type { GameMode } from '@impostor/shared'

type GamePhase = 'waiting' | 'collecting' | 'playing' | 'voting' | 'results' | 'finished'

interface VoteState {
  votes: Record<string, string> // voterId -> targetId
  twoThirdsReached: boolean
}

interface CollectingState {
  timeLimit: number
  minWords: number
  playerCount: number
  impostorCount: number
  wordCount: number
  hasSubmittedWord: boolean
}

interface GameState {
  // Game state
  phase: GamePhase
  mode: GameMode
  word: string | null // null if impostor
  isImpostor: boolean
  turnOrder: string[]
  currentRound: number
  impostorCount: number

  // Collecting (roulette mode)
  collecting: CollectingState | null

  // Voting
  voteState: VoteState | null
  hasVoted: boolean
  myVote: string | null

  // Results
  lastEliminated: string | null
  wasImpostor: boolean | null
  winner: 'crew' | 'impostor' | null
  revealedImpostorIds: string[]

  // Actions
  startCollecting: (data: { timeLimit: number; minWords: number; playerCount: number; impostorCount: number }) => void
  updateWordCount: (count: number) => void
  markWordSubmitted: () => void
  startGame: (data: { word: string | null; isImpostor: boolean; turnOrder: string[]; mode: GameMode; impostorCount: number }) => void
  setRound: (round: number) => void
  startVoting: () => void
  updateVotes: (votes: Record<string, string>, twoThirdsReached: boolean) => void
  castVote: (targetId: string) => void
  setVoteResult: (eliminated?: string, wasImpostor?: boolean) => void
  continueFromResults: () => void
  endGame: (winner: 'crew' | 'impostor', impostorIds: string[], word: string) => void
  reset: () => void
}

const initialState = {
  phase: 'waiting' as GamePhase,
  mode: 'classic' as GameMode,
  word: null,
  isImpostor: false,
  turnOrder: [],
  currentRound: 0,
  impostorCount: 1,
  collecting: null,
  voteState: null,
  hasVoted: false,
  myVote: null,
  lastEliminated: null,
  wasImpostor: null,
  winner: null,
  revealedImpostorIds: [] as string[],
}

export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  startCollecting: ({ timeLimit, minWords, playerCount, impostorCount }) =>
    set({
      phase: 'collecting',
      mode: 'roulette',
      impostorCount,
      collecting: {
        timeLimit,
        minWords,
        playerCount,
        impostorCount,
        wordCount: 0,
        hasSubmittedWord: false,
      },
    }),

  updateWordCount: (count) =>
    set((state) => ({
      collecting: state.collecting
        ? { ...state.collecting, wordCount: count }
        : null,
    })),

  markWordSubmitted: () =>
    set((state) => ({
      collecting: state.collecting
        ? { ...state.collecting, hasSubmittedWord: true }
        : null,
    })),

  startGame: ({ word, isImpostor, turnOrder, mode, impostorCount }) =>
    set({
      phase: 'playing',
      mode,
      word,
      isImpostor,
      turnOrder,
      currentRound: 1,
      impostorCount,
      // Reset collecting state
      collecting: null,
      // Reset voting state
      voteState: null,
      hasVoted: false,
      myVote: null,
      // Reset results from previous game
      lastEliminated: null,
      wasImpostor: null,
      winner: null,
      revealedImpostorIds: [],
    }),

  setRound: (round) =>
    set({
      currentRound: round,
      phase: 'playing',
      // Reset voting state for new round
      voteState: null,
      hasVoted: false,
      myVote: null,
    }),

  startVoting: () =>
    set({
      phase: 'voting',
      voteState: { votes: {}, twoThirdsReached: false },
      hasVoted: false,
      myVote: null,
    }),

  updateVotes: (votes, twoThirdsReached) =>
    set({ voteState: { votes, twoThirdsReached } }),

  castVote: (targetId) => set({ hasVoted: true, myVote: targetId }),

  setVoteResult: (eliminated, wasImpostor) =>
    set({
      phase: 'results',
      lastEliminated: eliminated ?? null,
      wasImpostor: wasImpostor ?? null,
    }),

  continueFromResults: () =>
    set({
      phase: 'playing',
      voteState: null,
      hasVoted: false,
      myVote: null,
      lastEliminated: null,
      wasImpostor: null,
    }),

  endGame: (winner, impostorIds, word) =>
    set({
      phase: 'finished',
      winner,
      revealedImpostorIds: impostorIds,
      word, // Reveal word to all players including impostor
    }),

  reset: () => set(initialState),
}))
