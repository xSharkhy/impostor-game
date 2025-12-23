import { useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { WordSuggestions } from '@/components/admin/WordSuggestions'
import { Button, Skeleton } from '@/components/ui'
import { useNavigate } from '@tanstack/react-router'
import { useUserStore } from '@/stores'

/**
 * Whitelist de emails con acceso al panel de administración.
 * Añade aquí los emails de los administradores autorizados.
 */
const ADMIN_EMAILS = [
  'ismobla@gmail.com',
  'ismamoreblas@gmail.com',
  'ismael.morejon@wenalyze.com',
  'sharkhyacc@gmail.com',
  // Añadir más emails de admins aquí
]

/**
 * Verifica si un email tiene permisos de administrador.
 */
function isAdmin(email: string | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})

function AdminPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, user } = useUserStore()

  // Redirect after auth check completes
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin(user?.email))) {
      navigate({ to: '/' })
    }
  }, [isLoading, isAuthenticated, user?.email, navigate])

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
        <div className="mx-auto w-full max-w-md space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  // Not authorized
  if (!isAuthenticated || !isAdmin(user?.email)) {
    return null
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-md space-y-6">
        <WordSuggestions />

        <Button
          variant="ghost"
          className="w-full text-text-tertiary"
          onClick={() => navigate({ to: '/' })}
        >
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}
