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
  Skeleton,
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
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [categoriesError, setCategoriesError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const { socket } = useSocket()

  const loadCategories = async () => {
    setIsLoadingCategories(true)
    setCategoriesError(false)
    try {
      const { data, error } = await supabase.from('categories').select('id, name_es')
      if (error) throw error
      if (data) {
        setCategories(data)
        if (data.length > 0) {
          setCategoryId(data[0].id)
        }
      }
    } catch {
      setCategoriesError(true)
    } finally {
      setIsLoadingCategories(false)
    }
  }

  useEffect(() => {
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
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Cerrar">
              ✕
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Categoría</Label>
            {isLoadingCategories ? (
              <Skeleton className="h-10 w-full rounded-lg" />
            ) : categoriesError ? (
              <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2">
                <span className="text-sm text-danger">Error al cargar categorías</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-xs"
                  onClick={loadCategories}
                >
                  Reintentar
                </Button>
              </div>
            ) : categories.length === 0 ? (
              <div className="rounded-lg border border-border bg-bg-tertiary px-3 py-2 text-sm text-text-tertiary">
                No hay categorías disponibles
              </div>
            ) : (
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name_es}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
            disabled={!word.trim() || !categoryId || isSubmitting || isLoadingCategories}
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
