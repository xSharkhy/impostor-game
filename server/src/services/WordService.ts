import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SECRET_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export interface WordResult {
  word: string
  category: string
}

export interface WordSuggestion {
  id: string
  word: string
  categoryId: string
  categoryName: string
  suggestedBy: string
  createdAt: string
}

class WordService {
  async getRandomWord(categoryId?: string): Promise<WordResult | null> {
    let query = supabase
      .from('words')
      .select('word, category_id')
      .eq('approved', true)
      .eq('lang', 'es')

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

    return {
      word: selected.word,
      category: selected.category_id,
    }
  }

  async getCategories(): Promise<Array<{ id: string; name: string }>> {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name_es')

    if (error || !data) {
      console.error('Error fetching categories:', error)
      return []
    }

    return data.map((c) => ({ id: c.id, name: c.name_es }))
  }

  async suggestWord(
    word: string,
    categoryId: string,
    userId: string,
    lang: string = 'es'
  ): Promise<{ success: boolean; error?: string }> {
    // Check if word already exists
    const { data: existing } = await supabase
      .from('words')
      .select('id')
      .eq('word', word)
      .eq('category_id', categoryId)
      .single()

    if (existing) {
      return { success: false, error: 'Esta palabra ya existe' }
    }

    const { error } = await supabase.from('words').insert({
      word: word.trim(),
      category_id: categoryId,
      lang: lang || 'es',
      approved: false,
      suggested_by: userId,
    })

    if (error) {
      console.error('Error suggesting word:', error)
      return { success: false, error: 'Error al sugerir palabra' }
    }

    return { success: true }
  }

  async getPendingSuggestions(): Promise<WordSuggestion[]> {
    const { data, error } = await supabase
      .from('words')
      .select(`
        id,
        word,
        category_id,
        suggested_by,
        created_at,
        categories(name_es)
      `)
      .eq('approved', false)
      .order('created_at', { ascending: false })

    if (error || !data) {
      console.error('Error fetching suggestions:', error)
      return []
    }

    return data.map((w: any) => ({
      id: w.id,
      word: w.word,
      categoryId: w.category_id,
      categoryName: w.categories?.name_es || w.category_id,
      suggestedBy: w.suggested_by,
      createdAt: w.created_at,
    }))
  }

  async approveWord(wordId: string): Promise<boolean> {
    const { error } = await supabase
      .from('words')
      .update({ approved: true })
      .eq('id', wordId)

    if (error) {
      console.error('Error approving word:', error)
      return false
    }

    return true
  }

  async rejectWord(wordId: string): Promise<boolean> {
    const { error } = await supabase.from('words').delete().eq('id', wordId)

    if (error) {
      console.error('Error rejecting word:', error)
      return false
    }

    return true
  }
}

export const wordService = new WordService()
