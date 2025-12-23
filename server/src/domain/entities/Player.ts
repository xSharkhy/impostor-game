export type PlayerId = string

export interface PlayerProps {
  id: PlayerId
  displayName: string
  isConnected?: boolean
  isEliminated?: boolean
  hasVoted?: boolean
  votedFor?: PlayerId
}

export class Player {
  readonly id: PlayerId
  readonly displayName: string
  private _isConnected: boolean
  private _isEliminated: boolean
  private _hasVoted: boolean
  private _votedFor?: PlayerId

  private constructor(props: PlayerProps) {
    this.id = props.id
    this.displayName = props.displayName
    this._isConnected = props.isConnected ?? true
    this._isEliminated = props.isEliminated ?? false
    this._hasVoted = props.hasVoted ?? false
    this._votedFor = props.votedFor
  }

  static create(props: PlayerProps): Player {
    return new Player(props)
  }

  get isConnected(): boolean {
    return this._isConnected
  }

  get isEliminated(): boolean {
    return this._isEliminated
  }

  get hasVoted(): boolean {
    return this._hasVoted
  }

  get votedFor(): PlayerId | undefined {
    return this._votedFor
  }

  get canVote(): boolean {
    return !this._isEliminated && !this._hasVoted
  }

  connect(): Player {
    return new Player({
      ...this.toProps(),
      isConnected: true,
    })
  }

  disconnect(): Player {
    return new Player({
      ...this.toProps(),
      isConnected: false,
    })
  }

  eliminate(): Player {
    return new Player({
      ...this.toProps(),
      isEliminated: true,
    })
  }

  castVote(targetId: PlayerId): Player {
    return new Player({
      ...this.toProps(),
      hasVoted: true,
      votedFor: targetId,
    })
  }

  resetVote(): Player {
    return new Player({
      ...this.toProps(),
      hasVoted: false,
      votedFor: undefined,
    })
  }

  resetForNewGame(): Player {
    return new Player({
      ...this.toProps(),
      isEliminated: false,
      hasVoted: false,
      votedFor: undefined,
    })
  }

  updateDisplayName(newName: string): Player {
    return new Player({
      ...this.toProps(),
      displayName: newName,
    })
  }

  toProps(): PlayerProps {
    return {
      id: this.id,
      displayName: this.displayName,
      isConnected: this._isConnected,
      isEliminated: this._isEliminated,
      hasVoted: this._hasVoted,
      votedFor: this._votedFor,
    }
  }
}
