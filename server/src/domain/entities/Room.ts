import { Player, PlayerId, PlayerProps } from './Player.js'
import {
  AlreadyInRoomError,
  GameAlreadyStartedError,
  InvalidStateError,
  NotAdminError,
  NotEnoughPlayersError,
  PlayerNotFoundError,
  RoomNotFoundError,
} from '../errors/DomainError.js'

export type RoomId = string
export type RoomCode = string
export type RoomStatus = 'lobby' | 'playing' | 'voting' | 'finished'
export type WinCondition = 'impostor_caught' | 'impostor_survived'
export type RoomLanguage = 'es' | 'en' | 'ca' | 'eu' | 'gl'

export interface RoomProps {
  id: RoomId
  code: RoomCode
  adminId: PlayerId
  status: RoomStatus
  language: RoomLanguage
  players: PlayerProps[]
  currentWord?: string
  impostorId?: PlayerId
  turnOrder?: PlayerId[]
  currentRound: number
  category?: string
  winCondition?: WinCondition
  createdAt: Date
  lastActivity: Date
}

const MIN_PLAYERS = 3
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 4

export class Room {
  readonly id: RoomId
  readonly code: RoomCode
  private _language: RoomLanguage
  readonly createdAt: Date

  private _adminId: PlayerId
  private _status: RoomStatus
  private _players: Map<PlayerId, Player>
  private _currentWord?: string
  private _impostorId?: PlayerId
  private _turnOrder?: PlayerId[]
  private _currentRound: number
  private _category?: string
  private _winCondition?: WinCondition
  private _lastActivity: Date

  private constructor(props: RoomProps) {
    this.id = props.id
    this.code = props.code
    this._language = props.language
    this.createdAt = props.createdAt
    this._adminId = props.adminId
    this._status = props.status
    this._players = new Map(
      props.players.map(p => [p.id, Player.create(p)])
    )
    this._currentWord = props.currentWord
    this._impostorId = props.impostorId
    this._turnOrder = props.turnOrder
    this._currentRound = props.currentRound
    this._category = props.category
    this._winCondition = props.winCondition
    this._lastActivity = props.lastActivity
  }

  static generateCode(): RoomCode {
    return Array.from(
      { length: CODE_LENGTH },
      () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
    ).join('')
  }

  static create(id: RoomId, code: RoomCode, adminId: PlayerId, adminName: string, language: RoomLanguage = 'es'): Room {
    const now = new Date()
    return new Room({
      id,
      code,
      adminId,
      status: 'lobby',
      language,
      players: [{
        id: adminId,
        displayName: adminName,
        isConnected: true,
        isEliminated: false,
        hasVoted: false,
      }],
      currentRound: 0,
      createdAt: now,
      lastActivity: now,
    })
  }

  static fromProps(props: RoomProps): Room {
    return new Room(props)
  }

  // Getters
  get adminId(): PlayerId { return this._adminId }
  get status(): RoomStatus { return this._status }
  get language(): RoomLanguage { return this._language }
  get currentWord(): string | undefined { return this._currentWord }
  get impostorId(): PlayerId | undefined { return this._impostorId }
  get turnOrder(): PlayerId[] | undefined { return this._turnOrder }
  get currentRound(): number { return this._currentRound }
  get category(): string | undefined { return this._category }
  get winCondition(): WinCondition | undefined { return this._winCondition }
  get lastActivity(): Date { return this._lastActivity }

  get currentTurnIndex(): number {
    if (!this._turnOrder) return 0
    return (this._currentRound - 1) % this._turnOrder.length
  }

  getCurrentPlayer(): Player | undefined {
    if (!this._turnOrder || this._turnOrder.length === 0) return undefined
    const playerId = this._turnOrder[this.currentTurnIndex]
    return this._players.get(playerId)
  }

  get players(): Player[] {
    return Array.from(this._players.values())
  }

  get activePlayers(): Player[] {
    return this.players.filter(p => !p.isEliminated)
  }

  get connectedPlayers(): Player[] {
    return this.players.filter(p => p.isConnected)
  }

  get playerCount(): number {
    return this._players.size
  }

  // Player operations
  getPlayer(playerId: PlayerId): Player | undefined {
    return this._players.get(playerId)
  }

  hasPlayer(playerId: PlayerId): boolean {
    return this._players.has(playerId)
  }

  isAdmin(playerId: PlayerId): boolean {
    return this._adminId === playerId
  }

  addPlayer(playerId: PlayerId, displayName: string): Room {
    if (this._status !== 'lobby') {
      throw new GameAlreadyStartedError()
    }

    if (this._players.has(playerId)) {
      // Reconnect existing player
      const player = this._players.get(playerId)!
      const newPlayers = new Map(this._players)
      newPlayers.set(playerId, player.connect())

      return this.withUpdate({ players: newPlayers })
    }

    const newPlayers = new Map(this._players)
    newPlayers.set(playerId, Player.create({
      id: playerId,
      displayName,
      isConnected: true,
    }))

    return this.withUpdate({ players: newPlayers })
  }

  removePlayer(playerId: PlayerId): Room {
    if (!this._players.has(playerId)) {
      throw new PlayerNotFoundError()
    }

    const newPlayers = new Map(this._players)
    newPlayers.delete(playerId)

    // If admin left, transfer to first remaining player
    let newAdminId = this._adminId
    if (playerId === this._adminId && newPlayers.size > 0) {
      newAdminId = newPlayers.keys().next().value!
    }

    return this.withUpdate({
      players: newPlayers,
      adminId: newAdminId,
    })
  }

  disconnectPlayer(playerId: PlayerId): Room {
    const player = this._players.get(playerId)
    if (!player) {
      throw new PlayerNotFoundError()
    }

    const newPlayers = new Map(this._players)
    newPlayers.set(playerId, player.disconnect())

    return this.withUpdate({ players: newPlayers })
  }

  connectPlayer(playerId: PlayerId): Room {
    const player = this._players.get(playerId)
    if (!player) {
      throw new PlayerNotFoundError()
    }

    const newPlayers = new Map(this._players)
    newPlayers.set(playerId, player.connect())

    return this.withUpdate({ players: newPlayers })
  }

  updatePlayerDisplayName(playerId: PlayerId, displayName: string): Room {
    const player = this._players.get(playerId)
    if (!player) {
      throw new PlayerNotFoundError()
    }

    const newPlayers = new Map(this._players)
    newPlayers.set(playerId, player.updateDisplayName(displayName))

    return this.withUpdate({ players: newPlayers })
  }

  changeLanguage(language: RoomLanguage): Room {
    if (this._status !== 'lobby') {
      throw new GameAlreadyStartedError()
    }

    return this.withUpdate({ language })
  }

  // Game operations
  startGame(word: string, category?: string): Room {
    if (this._status !== 'lobby') {
      throw new GameAlreadyStartedError()
    }

    if (this._players.size < MIN_PLAYERS) {
      throw new NotEnoughPlayersError(MIN_PLAYERS)
    }

    // Generate random turn order
    const playerIds = Array.from(this._players.keys())
    const shuffled = this.shuffle(playerIds)

    // Select random impostor
    const impostorId = shuffled[Math.floor(Math.random() * shuffled.length)]

    return this.withUpdate({
      status: 'playing',
      currentWord: word,
      impostorId,
      turnOrder: shuffled,
      currentRound: 1,
      category,
    })
  }

  nextRound(): Room {
    if (this._status !== 'playing') {
      throw new InvalidStateError('Not in playing state')
    }

    return this.withUpdate({
      currentRound: this._currentRound + 1,
    })
  }

  startVoting(): Room {
    if (this._status !== 'playing') {
      throw new InvalidStateError('Not in playing state')
    }

    // Reset all votes
    const newPlayers = new Map(this._players)
    for (const [id, player] of newPlayers) {
      newPlayers.set(id, player.resetVote())
    }

    return this.withUpdate({
      status: 'voting',
      players: newPlayers,
    })
  }

  castVote(voterId: PlayerId, targetId: PlayerId): Room {
    if (this._status !== 'voting') {
      throw new InvalidStateError('Not in voting state')
    }

    const voter = this._players.get(voterId)
    if (!voter || !voter.canVote) {
      throw new InvalidStateError('Cannot vote')
    }

    const target = this._players.get(targetId)
    if (!target || target.isEliminated) {
      throw new InvalidStateError('Invalid target')
    }

    const newPlayers = new Map(this._players)
    newPlayers.set(voterId, voter.castVote(targetId))

    return this.withUpdate({ players: newPlayers })
  }

  calculateVotes(): { voteCounts: Map<PlayerId, number>; twoThirdsReached: boolean } {
    const voteCounts = new Map<PlayerId, number>()

    for (const player of this.activePlayers) {
      if (player.hasVoted && player.votedFor) {
        const current = voteCounts.get(player.votedFor) ?? 0
        voteCounts.set(player.votedFor, current + 1)
      }
    }

    const threshold = Math.ceil((this.activePlayers.length * 2) / 3)
    const twoThirdsReached = Array.from(voteCounts.values()).some(c => c >= threshold)

    return { voteCounts, twoThirdsReached }
  }

  eliminatePlayer(playerId: PlayerId): Room {
    const player = this._players.get(playerId)
    if (!player) {
      throw new PlayerNotFoundError()
    }

    const newPlayers = new Map(this._players)
    newPlayers.set(playerId, player.eliminate())

    return this.withUpdate({ players: newPlayers })
  }

  continueAfterVoting(): Room {
    // Reset votes and return to playing
    const newPlayers = new Map(this._players)
    for (const [id, player] of newPlayers) {
      newPlayers.set(id, player.resetVote())
    }

    return this.withUpdate({
      status: 'playing',
      players: newPlayers,
    })
  }

  finishGame(winCondition: WinCondition): Room {
    return this.withUpdate({
      status: 'finished',
      winCondition,
    })
  }

  checkWinCondition(): WinCondition | null {
    const active = this.activePlayers
    const impostorEliminated = this._impostorId &&
      this._players.get(this._impostorId)?.isEliminated

    if (impostorEliminated) {
      return 'impostor_caught'
    }

    if (active.length <= 2 && active.some(p => p.id === this._impostorId)) {
      return 'impostor_survived'
    }

    return null
  }

  resetToLobby(): Room {
    const newPlayers = new Map(this._players)
    for (const [id, player] of newPlayers) {
      newPlayers.set(id, player.resetForNewGame())
    }

    return this.withUpdate({
      status: 'lobby',
      players: newPlayers,
      currentWord: undefined,
      impostorId: undefined,
      turnOrder: undefined,
      currentRound: 0,
      category: undefined,
      winCondition: undefined,
    })
  }

  // Utility methods
  private shuffle<T>(array: T[]): T[] {
    const result = [...array]
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }

  private withUpdate(updates: Partial<{
    adminId: PlayerId
    status: RoomStatus
    language: RoomLanguage
    players: Map<PlayerId, Player>
    currentWord: string | undefined
    impostorId: PlayerId | undefined
    turnOrder: PlayerId[] | undefined
    currentRound: number
    category: string | undefined
    winCondition: WinCondition | undefined
  }>): Room {
    const playerArray = updates.players
      ? Array.from(updates.players.values()).map(p => p.toProps())
      : this.players.map(p => p.toProps())

    return new Room({
      id: this.id,
      code: this.code,
      adminId: updates.adminId ?? this._adminId,
      status: updates.status ?? this._status,
      language: updates.language ?? this._language,
      players: playerArray,
      currentWord: 'currentWord' in updates ? updates.currentWord : this._currentWord,
      impostorId: 'impostorId' in updates ? updates.impostorId : this._impostorId,
      turnOrder: 'turnOrder' in updates ? updates.turnOrder : this._turnOrder,
      currentRound: updates.currentRound ?? this._currentRound,
      category: 'category' in updates ? updates.category : this._category,
      winCondition: 'winCondition' in updates ? updates.winCondition : this._winCondition,
      createdAt: this.createdAt,
      lastActivity: new Date(),
    })
  }

  toProps(): RoomProps {
    return {
      id: this.id,
      code: this.code,
      adminId: this._adminId,
      status: this._status,
      language: this.language,
      players: this.players.map(p => p.toProps()),
      currentWord: this._currentWord,
      impostorId: this._impostorId,
      turnOrder: this._turnOrder,
      currentRound: this._currentRound,
      category: this._category,
      winCondition: this._winCondition,
      createdAt: this.createdAt,
      lastActivity: this._lastActivity,
    }
  }

  toClientProps(): Omit<RoomProps, 'impostorId' | 'currentWord'> & {
    currentWord?: string | null
  } {
    const props = this.toProps()
    const { impostorId, currentWord, ...rest } = props
    return rest
  }
}
