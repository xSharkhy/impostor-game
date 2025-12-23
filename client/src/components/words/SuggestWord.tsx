import { useState, useEffect } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { useSocket } from '@/hooks'

interface Category {
  id: string
  name_es: string
}

interface SuggestWordProps {
  onClose?: () => void
}

export function SuggestWord({ onClose }: SuggestWordProps) {
  const [word, setWord] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const { socket } = useSocket()

  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase.from('categories').select('id, name_es')
      if (data) {
        setCategories(data)
        if (data.length > 0) {
          setCategoryId(data[0].id)
        }
      }
    }
    loadCategories()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!word.trim() || !categoryId || !socket) return

    setIsSubmitting(true)
    socket.emit('word:suggest', { word: word.trim(), categoryId })

    // Listen for response
    socket.once('word:suggested', () => {
      setSuccess(true)
      setWord('')
      setIsSubmitting(false)
      setTimeout(() => setSuccess(false), 3000)
    })

    socket.once('error', () => {
      setIsSubmitting(false)
    })
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Sugerir palabra</span>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-text-tertiary">Categoría</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-md border border-border bg-bg-primary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neon-cyan"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name_es}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-text-tertiary">Palabra</label>
            <Input
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Escribe una palabra..."
              maxLength={50}
            />
          </div>

          {success && (
            <p className="text-sm text-success">
              Palabra sugerida correctamente
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!word.trim() || isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Sugerir'}
          </Button>

          <p className="text-xs text-text-tertiary text-center">
            Las sugerencias serán revisadas antes de añadirse al juego
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
