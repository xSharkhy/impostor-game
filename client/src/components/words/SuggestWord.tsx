import { useState, useEffect } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui'
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

  const selectedCategory = categories.find((c) => c.id === categoryId)

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
            <Label>Categoría</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría">
                  {selectedCategory?.name_es}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name_es}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Palabra</Label>
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

          <p className="text-center text-xs text-text-tertiary">
            Las sugerencias serán revisadas antes de añadirse al juego
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
