import { SupabaseClient } from '@supabase/supabase-js'
import {
  IWordRepository,
  WordResult,
  Category,
  WordSuggestion,
} from '../../../application/ports/repositories/IWordRepository.js'

export class SupabaseWordRepository implements IWordRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getRandomWord(categoryId?: string, lang?: string): Promise<WordResult | null> {
    let query = this.supabase
      .from('words')
      .select(
        `
        id,
        word,
        category_id,
        categories!inner (
          id,
          name
        )
      `
      )
      .eq('is_approved', true)

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (lang) {
      query = query.eq('lang', lang)
    }

    // Get count first
    const { count } = await this.supabase
      .from('words')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', true)
      .then((res) => res)

    if (!count || count === 0) {
      return null
    }

    // Get random offset
    const randomOffset = Math.floor(Math.random() * count)

    const { data, error } = await query.range(randomOffset, randomOffset).single()

    if (error || !data) {
      return null
    }

    const category = data.categories as unknown as { id: string; name: string }

    return {
      id: data.id,
      word: data.word,
      categoryId: data.category_id,
      categoryName: category.name,
    }
  }

  async getCategories(): Promise<Category[]> {
    const { data, error } = await this.supabase.from('categories').select('id, name').order('name')

    if (error || !data) {
      return []
    }

    return data.map((c) => ({
      id: c.id,
      name: c.name,
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
    const normalizedWord = word.trim().toLowerCase()

    const { error } = await this.supabase.from('words').insert({
      word: normalizedWord,
      category_id: categoryId,
      is_approved: false,
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
        categories!inner (
          name
        )
      `
      )
      .eq('is_approved', false)
      .order('created_at', { ascending: false })

    if (error || !data) {
      return []
    }

    return data.map((row) => {
      const category = row.categories as unknown as { name: string }
      return {
        id: row.id,
        word: row.word,
        categoryId: row.category_id,
        categoryName: category.name,
        suggestedBy: row.suggested_by ?? 'unknown',
        createdAt: new Date(row.created_at),
      }
    })
  }

  async approveWord(wordId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('words')
      .update({ is_approved: true })
      .eq('id', wordId)

    return !error
  }

  async rejectWord(wordId: string): Promise<boolean> {
    const { error } = await this.supabase.from('words').delete().eq('id', wordId)

    return !error
  }
}
