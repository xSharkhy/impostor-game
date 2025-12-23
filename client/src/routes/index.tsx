import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui'
import { LoginForm } from '@/components/auth/LoginForm'
import { JoinRoom } from '@/components/lobby/JoinRoom'
import { RoomLobby } from '@/components/lobby/RoomLobby'
import { GameView } from '@/components/game/GameView'
import { SuggestWord } from '@/components/words/SuggestWord'
import { useUserStore, useRoomStore, useGameStore } from '@/stores'
import { useAuth, useSocket } from '@/hooks'

export const Route = createFileRoute('/')({
  component: HomePage,
})

type View = 'home' | 'join' | 'suggest'

function HomePage() {
  const [view, setView] = useState<View>('home')
  const { user, isAuthenticated, isLoading } = useUserStore()
  const { room } = useRoomStore()
  const { phase } = useGameStore()
  const { signOut } = useAuth()
  const { createRoom, isConnected } = useSocket()

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <p className="text-text-tertiary">Cargando...</p>
      </div>
    )
  }

  // If game is in progress, show game view
  if (room && phase !== 'waiting') {
    return (
      <div className="flex h-[100dvh] flex-col px-4 py-4">
        <div className="mx-auto flex h-full w-full max-w-md flex-col">
          <GameView />
        </div>
      </div>
    )
  }

  // If in a room lobby, show lobby
  if (room) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center px-4 py-4">
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
          <p className="text-sm text-text-tertiary">
            Juego de deducción social con palabras
          </p>
        </div>

        {isAuthenticated ? (
          view === 'join' ? (
            <JoinRoom onBack={() => setView('home')} />
          ) : view === 'suggest' ? (
            <SuggestWord onClose={() => setView('home')} />
          ) : (
            <div className="space-y-6">
              <p className="text-sm text-text-tertiary">
                Hola, <span className="text-text-primary">{user?.displayName}</span>
                {isConnected && (
                  <span className="ml-2 inline-block h-2 w-2 rounded-full bg-success" />
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
                size="sm"
                className="text-text-tertiary"
                onClick={() => setView('suggest')}
              >
                Sugerir palabra
              </Button>
              <Button
                variant="ghost"
                className="text-text-tertiary"
                onClick={signOut}
              >
                Cerrar sesión
              </Button>
            </div>
          )
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-text-tertiary">
              Inicia sesión para jugar
            </p>
            <LoginForm />
          </div>
        )}
      </div>
    </div>
  )
}
