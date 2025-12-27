// Room status enum
export type RoomStatus = 'lobby' | 'collecting_words' | 'playing' | 'voting' | 'finished'

// Game modes
export type GameMode = 'classic' | 'random' | 'custom' | 'roulette'

// Supported languages
export type SupportedLanguage = 'es' | 'en' | 'ca' | 'eu' | 'gl'

// Room interface
export interface Room {
  id: string
  code: string
  adminId: string
  players: Player[]
  status: RoomStatus
  language: SupportedLanguage
  currentWord?: string
  turnOrder?: string[]
  currentRound: number
  category?: string
  createdAt: Date
  lastActivity: Date
}

// Player interface
export interface Player {
  id: string
  displayName: string
  isConnected: boolean
  isEliminated: boolean
  hasVoted: boolean
  votedFor?: string
}

// Client room state (without sensitive data)
export interface ClientRoom extends Omit<Room, 'currentWord'> {
  currentWord?: string | null // null for impostor, string for crew
  wordCount?: number // number of words submitted in roulette mode
}

// Socket events - Client to Server
export interface ClientToServerEvents {
  'room:create': (data: { language: SupportedLanguage }) => void
  'room:join': (data: { code: string }) => void
  'room:leave': () => void
  'room:kick': (data: { playerId: string }) => void
  'room:changeLanguage': (data: { language: SupportedLanguage }) => void
  'game:start': (data: { mode?: GameMode; category?: string; customWord?: string; impostorCount?: number }) => void
  'game:nextRound': () => void
  'game:submitWord': (data: { word: string }) => void
  'game:forceStart': () => void
  'game:startVoting': () => void
  'vote:cast': (data: { targetId: string }) => void
  'vote:confirm': (data: { eliminate: boolean }) => void
  'game:playAgain': () => void
  'word:suggest': (data: { word: string; categoryId: string; lang: SupportedLanguage }) => void
  'word:getCategories': () => void
  'user:updateDisplayName': (data: { displayName: string }) => void
}

// Socket events - Server to Client
export interface ServerToClientEvents {
  'room:created': (data: { code: string }) => void
  'room:state': (data: ClientRoom) => void
  'room:playerJoined': (data: Player) => void
  'room:playerLeft': (data: { playerId: string }) => void
  'room:playerKicked': (data: { playerId: string }) => void
  'room:adminChanged': (data: { newAdminId: string }) => void
  'room:languageChanged': (data: { language: SupportedLanguage }) => void
  'game:collectingStarted': (data: { timeLimit: number; minWords: number; playerCount: number; impostorCount: number }) => void
  'game:wordCollected': (data: { count: number }) => void
  'game:started': (data: { word: string | null; isImpostor: boolean; turnOrder: string[]; mode: GameMode; impostorCount: number }) => void
  'game:newRound': (data: { round: number }) => void
  'game:votingStarted': () => void
  'vote:update': (data: { votes: Record<string, string>; twoThirdsReached: boolean }) => void
  'vote:result': (data: { eliminated?: string; wasImpostor?: boolean; newRound?: number }) => void
  'game:ended': (data: { winner: 'crew' | 'impostor'; impostorIds: string[]; word: string }) => void
  'word:suggested': (data: { success: boolean; error?: string }) => void
  'word:categories': (data: { id: string; name: string }[]) => void
  'error': (data: { code: string; message: string }) => void
}

// Category interface
export interface Category {
  id: string
  name: {
    es: string
    en?: string
    ca?: string
    gl?: string
    eu?: string
  }
}

// Word interface
export interface Word {
  id: string
  word: string
  categoryId: string
  lang: string
  approved: boolean
  suggestedBy?: string
  createdAt: Date
}

// Error codes
export const ErrorCodes = {
  ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
  ROOM_FULL: 'ROOM_FULL',
  MAX_ROOMS_REACHED: 'MAX_ROOMS_REACHED',
  NOT_ADMIN: 'NOT_ADMIN',
  NOT_ENOUGH_PLAYERS: 'NOT_ENOUGH_PLAYERS',
  GAME_ALREADY_STARTED: 'GAME_ALREADY_STARTED',
  ALREADY_VOTED: 'ALREADY_VOTED',
  INVALID_VOTE_TARGET: 'INVALID_VOTE_TARGET',
  RATE_LIMITED: 'RATE_LIMITED',
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

// Constants
export const CONSTANTS = {
  MIN_PLAYERS: 3,
  MAX_ROOMS: 5,
  ROOM_TIMEOUT_MS: 5 * 60 * 1000, // 5 minutes
  CODE_LENGTH: 4,
  RATE_LIMIT_ROOMS_PER_HOUR: 3,
  ROULETTE_TIME_LIMIT: 30, // seconds
  // Multi-impostor settings
  MIN_PLAYERS_PER_IMPOSTOR: 2,
  MAX_IMPOSTORS: 6,
  IMPOSTOR_WARNING_THRESHOLD: 0.33,
} as const

// Multi-impostor helper functions
export function getMinPlayersForImpostors(impostorCount: number): number {
  return impostorCount * CONSTANTS.MIN_PLAYERS_PER_IMPOSTOR
}

export function getRecommendedImpostors(playerCount: number): { min: number; max: number } {
  if (playerCount < 6) return { min: 1, max: 1 }
  if (playerCount < 10) return { min: 1, max: 2 }
  if (playerCount < 16) return { min: 2, max: 3 }
  return { min: 3, max: 4 }
}

export function isImpostorCountValid(impostorCount: number, playerCount: number): boolean {
  if (impostorCount < 1 || impostorCount > CONSTANTS.MAX_IMPOSTORS) return false
  return playerCount >= getMinPlayersForImpostors(impostorCount)
}

export function isImpostorCountWarning(impostorCount: number, playerCount: number): 'too_many' | 'too_few' | null {
  const ratio = impostorCount / playerCount
  if (ratio > CONSTANTS.IMPOSTOR_WARNING_THRESHOLD) return 'too_many'

  const recommended = getRecommendedImpostors(playerCount)
  if (impostorCount < recommended.min) return 'too_few'

  return null
}
