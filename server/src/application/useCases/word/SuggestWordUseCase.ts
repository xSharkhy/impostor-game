import { IWordRepository } from '../../ports/repositories/IWordRepository.js'

export interface SuggestWordInput {
  word: string
  categoryId: string
  suggestedBy: string
  lang: string
}

export interface SuggestWordOutput {
  success: boolean
  alreadyExists: boolean
}

export class SuggestWordUseCase {
  constructor(private readonly wordRepository: IWordRepository) {}

  async execute(input: SuggestWordInput): Promise<SuggestWordOutput> {
    // Normalize word
    const normalizedWord = input.word.trim().toLowerCase()

    if (!normalizedWord || normalizedWord.length < 2) {
      return { success: false, alreadyExists: false }
    }

    // Check if word already exists
    const exists = await this.wordRepository.wordExists(normalizedWord, input.categoryId)
    if (exists) {
      return { success: false, alreadyExists: true }
    }

    // Create suggestion
    await this.wordRepository.createSuggestion(normalizedWord, input.categoryId, input.suggestedBy, input.lang)

    return { success: true, alreadyExists: false }
  }
}
