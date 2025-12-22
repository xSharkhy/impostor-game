export interface WordResult {
  id: string
  word: string
  categoryId: string
  categoryName: string
}

export interface Category {
  id: string
  name: string
}

export interface WordSuggestion {
  id: string
  word: string
  categoryId: string
  categoryName: string
  suggestedBy: string
  createdAt: Date
}

export interface IWordRepository {
  /**
   * Get a random approved word, optionally filtered by category
   */
  getRandomWord(categoryId?: string, lang?: string): Promise<WordResult | null>

  /**
   * Get all categories
   */
  getCategories(): Promise<Category[]>

  /**
   * Check if word already exists in category
   */
  wordExists(word: string, categoryId: string): Promise<boolean>

  /**
   * Create a word suggestion (unapproved)
   */
  createSuggestion(word: string, categoryId: string, suggestedBy: string): Promise<void>

  /**
   * Get all pending (unapproved) word suggestions
   */
  getPendingSuggestions(): Promise<WordSuggestion[]>

  /**
   * Approve a word suggestion
   */
  approveWord(wordId: string): Promise<boolean>

  /**
   * Reject (delete) a word suggestion
   */
  rejectWord(wordId: string): Promise<boolean>
}
