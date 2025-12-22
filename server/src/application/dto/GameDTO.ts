export interface GameStartDTO {
  roomId: string
  word: string | null // null for impostor
  category: string
  turnOrder: string[]
  isImpostor: boolean
}

export interface VoteResultDTO {
  oderId: string
  displayName: string
  votes: number
}

export interface GameEndDTO {
  winCondition: 'impostor_caught' | 'impostor_survived'
  impostorId: string
  impostorName: string
  word: string
}

export interface RoundInfoDTO {
  currentRound: number
  currentPlayerId: string
  currentPlayerName: string
}
