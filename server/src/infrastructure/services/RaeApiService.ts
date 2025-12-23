/**
 * Service for fetching random words from RAE API
 * https://rae-api.com/api/random
 */

interface RaeApiResponse {
  ok: boolean
  data: {
    word: string
    meanings?: string[]
  }
}

export interface IRandomWordService {
  getRandomWord(): Promise<{ word: string } | null>
}

export class RaeApiService implements IRandomWordService {
  private readonly apiUrl = 'https://rae-api.com/api/random'

  async getRandomWord(): Promise<{ word: string } | null> {
    try {
      const response = await fetch(this.apiUrl)

      if (!response.ok) {
        console.error(`RAE API error: HTTP ${response.status}`)
        return null
      }

      const data: RaeApiResponse = await response.json()

      if (!data.ok || !data.data?.word) {
        console.error('RAE API returned invalid data:', data)
        return null
      }

      // Clean up the word (remove accents info, etc.)
      const word = data.data.word.trim()

      return { word }
    } catch (error) {
      console.error('Error fetching from RAE API:', error)
      return null
    }
  }
}
