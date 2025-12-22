import { IWordRepository, WordSuggestion } from '../../ports/repositories/IWordRepository.js'
import { IEmailService } from '../../ports/services/IEmailService.js'

export interface ApproveWordInput {
  wordId: string
  approve: boolean
}

export interface ApproveWordOutput {
  success: boolean
}

export interface GetPendingSuggestionsOutput {
  suggestions: WordSuggestion[]
}

export class ApproveWordUseCase {
  constructor(
    private readonly wordRepository: IWordRepository,
    private readonly emailService?: IEmailService
  ) {}

  async execute(input: ApproveWordInput): Promise<ApproveWordOutput> {
    let success: boolean

    if (input.approve) {
      success = await this.wordRepository.approveWord(input.wordId)
    } else {
      success = await this.wordRepository.rejectWord(input.wordId)
    }

    return { success }
  }

  async getPendingSuggestions(): Promise<GetPendingSuggestionsOutput> {
    const suggestions = await this.wordRepository.getPendingSuggestions()
    return { suggestions }
  }
}
