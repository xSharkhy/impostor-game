import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui'
import { LoginForm } from '@/components/auth/LoginForm'
import { useUserStore } from '@/stores'
import { useAuth } from '@/hooks'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { user, isAuthenticated, isLoading } = useUserStore()
  const { signOut } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <p className="text-[--color-text-muted]">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            El Impostor
          </h1>
          <p className="text-sm text-[--color-text-muted]">
            Juego de deducción social con palabras
          </p>
        </div>

        {isAuthenticated ? (
          <div className="space-y-6">
            <p className="text-sm text-[--color-text-muted]">
              Hola, <span className="text-[--color-text]">{user?.displayName}</span>
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" className="w-full sm:w-auto">
                Crear Sala
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Unirse
              </Button>
            </div>
            <Button
              variant="ghost"
              className="text-[--color-text-muted]"
              onClick={signOut}
            >
              Cerrar sesión
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-[--color-text-muted]">
              Inicia sesión para jugar
            </p>
            <LoginForm />
          </div>
        )}
      </div>
    </div>
  )
}
