export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message)
    this.name = 'DomainError'
  }
}

export class RoomNotFoundError extends DomainError {
  constructor() {
    super('ROOM_NOT_FOUND', 'Room not found')
  }
}

export class RoomFullError extends DomainError {
  constructor() {
    super('ROOM_FULL', 'Room is full')
  }
}

export class MaxRoomsReachedError extends DomainError {
  constructor() {
    super('MAX_ROOMS_REACHED', 'Maximum number of rooms reached')
  }
}

export class NotAdminError extends DomainError {
  constructor() {
    super('NOT_ADMIN', 'Only admin can perform this action')
  }
}

export class NotEnoughPlayersError extends DomainError {
  constructor(required: number) {
    super('NOT_ENOUGH_PLAYERS', `At least ${required} players required`)
  }
}

export class GameAlreadyStartedError extends DomainError {
  constructor() {
    super('GAME_ALREADY_STARTED', 'Game has already started')
  }
}

export class GameNotInProgressError extends DomainError {
  constructor() {
    super('GAME_NOT_IN_PROGRESS', 'No game in progress')
  }
}

export class AlreadyVotedError extends DomainError {
  constructor() {
    super('ALREADY_VOTED', 'Player has already voted')
  }
}

export class InvalidVoteTargetError extends DomainError {
  constructor() {
    super('INVALID_VOTE_TARGET', 'Invalid vote target')
  }
}

export class PlayerNotFoundError extends DomainError {
  constructor() {
    super('PLAYER_NOT_FOUND', 'Player not found')
  }
}

export class AlreadyInRoomError extends DomainError {
  constructor() {
    super('ALREADY_IN_ROOM', 'Player is already in a room')
  }
}

export class InvalidStateError extends DomainError {
  constructor(message: string) {
    super('INVALID_STATE', message)
  }
}
