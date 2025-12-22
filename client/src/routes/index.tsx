import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui'
import { LoginForm } from '@/components/auth/LoginForm'
import { JoinRoom } from '@/components/lobby/JoinRoom'
import { RoomLobby } from '@/components/lobby/RoomLobby'
import { useUserStore, useRoomStore } from '@/stores'
import { useAuth, useSocket } from '@/hooks'

export const Route = createFileRoute('/')({
  component: HomePage,
})

type View = 'home' | 'join'

function HomePage() {
  const [view, setView] = useState<View>('home')
  const { user, isAuthenticated, isLoading } = useUserStore()
  const { room } = useRoomStore()
  const { signOut } = useAuth()
  const { createRoom, isConnected } = useSocket()

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <p className="text-[--color-text-muted]">Cargando...</p>
      </div>
    )
  }

  // If in a room, show lobby
  if (room) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-12">
        <RoomLobby />
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
          view === 'join' ? (
            <JoinRoom onBack={() => setView('home')} />
          ) : (
            <div className="space-y-6">
              <p className="text-sm text-[--color-text-muted]">
                Hola, <span className="text-[--color-text]">{user?.displayName}</span>
                {isConnected && (
                  <span className="ml-2 inline-block h-2 w-2 rounded-full bg-[--color-success]" />
                )}
              </p>
              <div className="flex flex-col gap-3">
                <Button size="lg" className="w-full" onClick={createRoom}>
                  Crear Sala
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => setView('join')}
                >
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
          )
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
