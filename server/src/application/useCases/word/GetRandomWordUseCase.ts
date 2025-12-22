import { IWordRepository, WordResult, Category } from '../../ports/repositories/IWordRepository.js'

export interface GetRandomWordInput {
  categoryId?: string
  lang?: string
}

export interface GetRandomWordOutput {
  word: WordResult | null
}

export interface GetCategoriesOutput {
  categories: Category[]
}

export class GetRandomWordUseCase {
  constructor(private readonly wordRepository: IWordRepository) {}

  async execute(input: GetRandomWordInput): Promise<GetRandomWordOutput> {
    const word = await this.wordRepository.getRandomWord(input.categoryId, input.lang)
    return { word }
  }

  async getCategories(): Promise<GetCategoriesOutput> {
    const categories = await this.wordRepository.getCategories()
    return { categories }
  }
}
