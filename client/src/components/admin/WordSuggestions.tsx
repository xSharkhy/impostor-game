import { useState, useEffect } from 'react'
import { Button, Card, CardContent } from '@/components/ui'
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
      <div className="flex items-center justify-center p-8">
        <p className="text-[--color-text-muted]">Cargando...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-[--color-danger]">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Sugerencias de Palabras</h1>
        <p className="text-sm text-[--color-text-muted]">
          {suggestions.length} sugerencias pendientes
        </p>
      </div>

      {suggestions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-[--color-text-muted]">No hay sugerencias pendientes</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-semibold">{suggestion.word}</p>
                  <p className="text-sm text-[--color-text-muted]">
                    {suggestion.categoryName}
                  </p>
                  <p className="text-xs text-[--color-text-muted]">
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
