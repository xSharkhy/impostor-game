import { IWordRepository, WordSuggestion, WordTranslations } from '../../ports/repositories/IWordRepository.js'
import { IEmailService } from '../../ports/services/IEmailService.js'

export interface ApproveWordInput {
  wordId: string
  approve: boolean
  translations?: WordTranslations
  categoryId?: string
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
      // If translations are provided, use the new multi-language approval
      if (input.translations && input.categoryId) {
        success = await this.wordRepository.approveWordWithTranslations(
          input.wordId,
          input.categoryId,
          input.translations
        )
      } else {
        // Fallback to simple approval (for backwards compatibility)
        success = await this.wordRepository.approveWord(input.wordId)
      }
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
