import { create } from 'zustand'

type GamePhase = 'waiting' | 'playing' | 'voting' | 'results' | 'finished'

interface VoteState {
  votes: Record<string, string> // voterId -> targetId
  twoThirdsReached: boolean
}

interface GameState {
  // Game state
  phase: GamePhase
  word: string | null // null if impostor
  isImpostor: boolean
  turnOrder: string[]
  currentRound: number

  // Voting
  voteState: VoteState | null
  hasVoted: boolean
  myVote: string | null

  // Results
  lastEliminated: string | null
  wasImpostor: boolean | null
  winner: 'crew' | 'impostor' | null
  revealedImpostorId: string | null

  // Actions
  startGame: (data: { word: string | null; isImpostor: boolean; turnOrder: string[] }) => void
  setRound: (round: number) => void
  startVoting: () => void
  updateVotes: (votes: Record<string, string>, twoThirdsReached: boolean) => void
  castVote: (targetId: string) => void
  setVoteResult: (eliminated?: string, wasImpostor?: boolean) => void
  endGame: (winner: 'crew' | 'impostor', impostorId: string, word: string) => void
  reset: () => void
}

const initialState = {
  phase: 'waiting' as GamePhase,
  word: null,
  isImpostor: false,
  turnOrder: [],
  currentRound: 0,
  voteState: null,
  hasVoted: false,
  myVote: null,
  lastEliminated: null,
  wasImpostor: null,
  winner: null,
  revealedImpostorId: null,
}

export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  startGame: ({ word, isImpostor, turnOrder }) =>
    set({
      phase: 'playing',
      word,
      isImpostor,
      turnOrder,
      currentRound: 1,
      voteState: null,
      hasVoted: false,
      myVote: null,
    }),

  setRound: (round) => set({ currentRound: round, phase: 'playing' }),

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

  endGame: (winner, impostorId, word) =>
    set({
      phase: 'finished',
      winner,
      revealedImpostorId: impostorId,
      word, // Reveal word to all players including impostor
    }),

  reset: () => set(initialState),
}))
