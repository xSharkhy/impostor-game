import { SupabaseClient } from '@supabase/supabase-js'
import {
  IWordRepository,
  WordResult,
  Category,
  WordSuggestion,
} from '../../../application/ports/repositories/IWordRepository.js'

export class SupabaseWordRepository implements IWordRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getRandomWord(categoryId?: string, lang: string = 'es'): Promise<WordResult | null> {
    let query = this.supabase
      .from('words')
      .select('id, word, category_id')
      .eq('approved', true)
      .eq('lang', lang)

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      console.error('Error fetching words:', error)
      return null
    }

    // Pick random word
    const randomIndex = Math.floor(Math.random() * data.length)
    const selected = data[randomIndex]

    // Get category name
    const { data: categoryData } = await this.supabase
      .from('categories')
      .select('name_es')
      .eq('id', selected.category_id)
      .single()

    return {
      id: selected.id,
      word: selected.word,
      categoryId: selected.category_id,
      categoryName: categoryData?.name_es || selected.category_id,
    }
  }

  async getCategories(): Promise<Category[]> {
    const { data, error } = await this.supabase.from('categories').select('id, name_es').order('name_es')

    if (error || !data) {
      console.error('Error fetching categories:', error)
      return []
    }

    return data.map((c) => ({
      id: c.id,
      name: c.name_es,
    }))
  }

  async wordExists(word: string, categoryId: string): Promise<boolean> {
    const normalizedWord = word.trim().toLowerCase()

    const { data, error } = await this.supabase
      .from('words')
      .select('id')
      .eq('word', normalizedWord)
      .eq('category_id', categoryId)
      .single()

    if (error && error.code === 'PGRST116') {
      return false
    }

    return !!data
  }

  async createSuggestion(word: string, categoryId: string, suggestedBy: string): Promise<void> {
    const normalizedWord = word.trim()

    const { error } = await this.supabase.from('words').insert({
      word: normalizedWord,
      category_id: categoryId,
      lang: 'es',
      approved: false,
      suggested_by: suggestedBy,
    })

    if (error) {
      throw new Error(`Failed to create suggestion: ${error.message}`)
    }
  }

  async getPendingSuggestions(): Promise<WordSuggestion[]> {
    const { data, error } = await this.supabase
      .from('words')
      .select(
        `
        id,
        word,
        category_id,
        suggested_by,
        created_at,
        categories(name_es)
      `
      )
      .eq('approved', false)
      .order('created_at', { ascending: false })

    if (error || !data) {
      console.error('Error fetching suggestions:', error)
      return []
    }

    return data.map((row: any) => {
      return {
        id: row.id,
        word: row.word,
        categoryId: row.category_id,
        categoryName: row.categories?.name_es || row.category_id,
        suggestedBy: row.suggested_by ?? 'unknown',
        createdAt: new Date(row.created_at),
      }
    })
  }

  async approveWord(wordId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('words')
      .update({ approved: true })
      .eq('id', wordId)

    if (error) {
      console.error('Error approving word:', error)
    }
    return !error
  }

  async rejectWord(wordId: string): Promise<boolean> {
    const { error } = await this.supabase.from('words').delete().eq('id', wordId)

    return !error
  }
}
