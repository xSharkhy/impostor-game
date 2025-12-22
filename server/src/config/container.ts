import { getSupabaseClient } from './supabase.js'
import { env } from './env.js'

// Repositories
import { SupabaseRoomRepository } from '../infrastructure/persistence/supabase/SupabaseRoomRepository.js'
import { SupabaseWordRepository } from '../infrastructure/persistence/supabase/SupabaseWordRepository.js'
import { SupabaseRealtimeSubscriber } from '../infrastructure/persistence/supabase/SupabaseRealtimeSubscriber.js'

// Services
import { SupabaseAuthService } from '../infrastructure/services/SupabaseAuthService.js'
import { ResendEmailService } from '../infrastructure/services/ResendEmailService.js'

// Use Cases - Room
import { CreateRoomUseCase } from '../application/useCases/room/CreateRoomUseCase.js'
import { JoinRoomUseCase } from '../application/useCases/room/JoinRoomUseCase.js'
import { LeaveRoomUseCase } from '../application/useCases/room/LeaveRoomUseCase.js'
import { KickPlayerUseCase } from '../application/useCases/room/KickPlayerUseCase.js'

// Use Cases - Game
import { StartGameUseCase } from '../application/useCases/game/StartGameUseCase.js'
import { NextRoundUseCase } from '../application/useCases/game/NextRoundUseCase.js'
import { PlayAgainUseCase } from '../application/useCases/game/PlayAgainUseCase.js'

// Use Cases - Voting
import { StartVotingUseCase } from '../application/useCases/voting/StartVotingUseCase.js'
import { CastVoteUseCase } from '../application/useCases/voting/CastVoteUseCase.js'
import { ConfirmVoteUseCase } from '../application/useCases/voting/ConfirmVoteUseCase.js'

// Use Cases - Word
import { GetRandomWordUseCase } from '../application/useCases/word/GetRandomWordUseCase.js'
import { SuggestWordUseCase } from '../application/useCases/word/SuggestWordUseCase.js'
import { ApproveWordUseCase } from '../application/useCases/word/ApproveWordUseCase.js'

// Interfaces
import type { IRoomRepository } from '../application/ports/repositories/IRoomRepository.js'
import type { IWordRepository } from '../application/ports/repositories/IWordRepository.js'
import type { IAuthService } from '../application/ports/services/IAuthService.js'
import type { IEmailService } from '../application/ports/services/IEmailService.js'

/**
 * Dependency Injection Container
 * Creates and wires all dependencies following Clean Architecture
 */
export interface Container {
  // Infrastructure
  roomRepository: IRoomRepository
  wordRepository: IWordRepository
  authService: IAuthService
  emailService: IEmailService | null
  realtimeSubscriber: SupabaseRealtimeSubscriber

  // Use Cases - Room
  createRoomUseCase: CreateRoomUseCase
  joinRoomUseCase: JoinRoomUseCase
  leaveRoomUseCase: LeaveRoomUseCase
  kickPlayerUseCase: KickPlayerUseCase

  // Use Cases - Game
  startGameUseCase: StartGameUseCase
  nextRoundUseCase: NextRoundUseCase
  playAgainUseCase: PlayAgainUseCase

  // Use Cases - Voting
  startVotingUseCase: StartVotingUseCase
  castVoteUseCase: CastVoteUseCase
  confirmVoteUseCase: ConfirmVoteUseCase

  // Use Cases - Word
  getRandomWordUseCase: GetRandomWordUseCase
  suggestWordUseCase: SuggestWordUseCase
  approveWordUseCase: ApproveWordUseCase
}

let containerInstance: Container | null = null

/**
 * Create and initialize the dependency container
 */
export function createContainer(): Container {
  if (containerInstance) {
    return containerInstance
  }

  const supabase = getSupabaseClient()

  // Infrastructure - Repositories
  const roomRepository = new SupabaseRoomRepository(supabase)
  const wordRepository = new SupabaseWordRepository(supabase)

  // Infrastructure - Services
  const authService = new SupabaseAuthService(supabase)
  const emailService = env.resendApiKey ? new ResendEmailService(env.resendApiKey) : null

  // Infrastructure - Realtime
  const realtimeSubscriber = new SupabaseRealtimeSubscriber(supabase)

  // Use Cases - Room
  const createRoomUseCase = new CreateRoomUseCase(roomRepository)
  const joinRoomUseCase = new JoinRoomUseCase(roomRepository)
  const leaveRoomUseCase = new LeaveRoomUseCase(roomRepository)
  const kickPlayerUseCase = new KickPlayerUseCase(roomRepository)

  // Use Cases - Game
  const startGameUseCase = new StartGameUseCase(roomRepository, wordRepository)
  const nextRoundUseCase = new NextRoundUseCase(roomRepository)
  const playAgainUseCase = new PlayAgainUseCase(roomRepository)

  // Use Cases - Voting
  const startVotingUseCase = new StartVotingUseCase(roomRepository)
  const castVoteUseCase = new CastVoteUseCase(roomRepository)
  const confirmVoteUseCase = new ConfirmVoteUseCase(roomRepository)

  // Use Cases - Word
  const getRandomWordUseCase = new GetRandomWordUseCase(wordRepository)
  const suggestWordUseCase = new SuggestWordUseCase(wordRepository)
  const approveWordUseCase = new ApproveWordUseCase(wordRepository, emailService ?? undefined)

  containerInstance = {
    // Infrastructure
    roomRepository,
    wordRepository,
    authService,
    emailService,
    realtimeSubscriber,

    // Use Cases - Room
    createRoomUseCase,
    joinRoomUseCase,
    leaveRoomUseCase,
    kickPlayerUseCase,

    // Use Cases - Game
    startGameUseCase,
    nextRoundUseCase,
    playAgainUseCase,

    // Use Cases - Voting
    startVotingUseCase,
    castVoteUseCase,
    confirmVoteUseCase,

    // Use Cases - Word
    getRandomWordUseCase,
    suggestWordUseCase,
    approveWordUseCase,
  }

  return containerInstance
}

/**
 * Get the container (must be created first)
 */
export function getContainer(): Container {
  if (!containerInstance) {
    throw new Error('Container not initialized. Call createContainer() first.')
  }
  return containerInstance
}
