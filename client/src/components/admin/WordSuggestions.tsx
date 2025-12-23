import { useState, useEffect } from 'react'
import { Button, Card, CardContent, Skeleton } from '@/components/ui'
import { supabase } from '@/lib/supabase'

interface WordSuggestion {
  id: string
  word: string
  categoryId: string
  categoryName: string
  suggestedBy: string
  createdAt: string
}

const API_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

export function WordSuggestions() {
  const [suggestions, setSuggestions] = useState<WordSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSuggestions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('No autenticado')
        setLoading(false)
        return
      }

      const response = await fetch(`${API_URL}/api/admin/suggestions`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 403) {
          setError('No tienes permisos de administrador')
        } else {
          setError('Error al cargar sugerencias')
        }
        setLoading(false)
        return
      }

      const data = await response.json()
      setSuggestions(data)
      setLoading(false)
    } catch {
      setError('Error de conexión')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuggestions()
  }, [])

  const handleApprove = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const response = await fetch(`${API_URL}/api/admin/words/${id}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })

    if (response.ok) {
      setSuggestions((prev) => prev.filter((s) => s.id !== id))
    }
  }

  const handleReject = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const response = await fetch(`${API_URL}/api/admin/words/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })

    if (response.ok) {
      setSuggestions((prev) => prev.filter((s) => s.id !== id))
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Skeleton className="mx-auto h-8 w-56" />
          <Skeleton className="mx-auto mt-2 h-4 w-32" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20 rounded-lg" />
                  <Skeleton className="h-8 w-20 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sugerencias de Palabras</h1>
        </div>
        <Card variant="glass">
          <CardContent className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-2xl">
              ⚠️
            </div>
            <p className="font-medium text-danger">{error}</p>
            <p className="mt-1 text-sm text-text-tertiary">
              No se pudieron cargar las sugerencias
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setError(null)
                setLoading(true)
                fetchSuggestions()
              }}
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Sugerencias de Palabras</h1>
        <p className="text-sm text-text-tertiary">
          {suggestions.length} sugerencias pendientes
        </p>
      </div>

      {suggestions.length === 0 ? (
        <Card variant="glass">
          <CardContent className="py-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bg-elevated text-4xl">
              ✨
            </div>
            <p className="font-medium text-text-primary">
              ¡Todo al día!
            </p>
            <p className="mt-1 text-sm text-text-tertiary">
              No hay sugerencias pendientes de revisar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-semibold">{suggestion.word}</p>
                  <p className="text-sm text-text-tertiary">
                    {suggestion.categoryName}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {new Date(suggestion.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(suggestion.id)}
                  >
                    Aprobar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(suggestion.id)}
                  >
                    Rechazar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Button variant="outline" className="w-full" onClick={fetchSuggestions}>
        Actualizar
      </Button>
    </div>
  )
}
