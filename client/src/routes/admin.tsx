import { createFileRoute, redirect } from '@tanstack/react-router'
import { WordSuggestions } from '@/components/admin/WordSuggestions'
import { Button } from '@/components/ui'
import { useNavigate } from '@tanstack/react-router'
import { useUserStore } from '@/stores'

/**
 * Whitelist de emails con acceso al panel de administración.
 * Añade aquí los emails de los administradores autorizados.
 */
const ADMIN_EMAILS = [
  'ismobla@gmail.com',
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
  beforeLoad: () => {
    const { isAuthenticated, isLoading, user } = useUserStore.getState()
    // If not authenticated and not loading, redirect to home
    if (!isAuthenticated && !isLoading) {
      throw redirect({ to: '/' })
    }
    // If authenticated but not admin, redirect to home
    if (isAuthenticated && !isAdmin(user?.email)) {
      throw redirect({ to: '/' })
    }
  },
  component: AdminPage,
})

function AdminPage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useUserStore()

  // Double-check auth and admin status (handles edge cases during hydration)
  if (!isAuthenticated || !isAdmin(user?.email)) {
    navigate({ to: '/' })
    return null
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-md space-y-6">
        <WordSuggestions />

        <Button
          variant="ghost"
          className="w-full text-[--color-text-muted]"
          onClick={() => navigate({ to: '/' })}
        >
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}
