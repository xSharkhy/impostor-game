import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Button, Skeleton } from '@/components/ui'
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
  const { room, isConnecting } = useRoomStore()
  const { phase } = useGameStore()
  const { signOut } = useAuth()
  const { createRoom, isConnected } = useSocket()

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-12">
        <div className="mx-auto w-full max-w-sm space-y-8 text-center">
          {/* Logo skeleton */}
          <div className="space-y-3">
            <Skeleton className="mx-auto h-16 w-16 rounded-2xl" />
            <Skeleton className="mx-auto h-10 w-48" />
            <Skeleton className="mx-auto h-4 w-36" />
          </div>
          {/* Buttons skeleton */}
          <div className="space-y-3 pt-4">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
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
        {/* Logo & Title */}
        <div className="space-y-3">
          <div className="text-6xl">🕵️</div>
          <h1
            className="text-4xl font-black tracking-tight sm:text-5xl"
            style={{
              background: 'linear-gradient(135deg, var(--color-text-primary), var(--color-accent))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            El Impostor
          </h1>
          <p className="text-sm text-text-secondary">
            Juego de deducción social
          </p>
        </div>

        {isAuthenticated ? (
          view === 'join' ? (
            <JoinRoom onBack={() => setView('home')} />
          ) : view === 'suggest' ? (
            <SuggestWord onClose={() => setView('home')} />
          ) : (
            <div className="space-y-6">
              {/* User greeting */}
              <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
                <span>Hola,</span>
                <span className="font-medium text-text-primary">{user?.displayName}</span>
                {isConnected && (
                  <span className="h-2 w-2 rounded-full bg-success" />
                )}
              </div>

              {/* Main actions */}
              <div className="flex flex-col gap-3">
                <Button
                  variant="neon"
                  size="lg"
                  className="w-full"
                  onClick={createRoom}
                  disabled={isConnecting}
                  isLoading={isConnecting}
                >
                  {isConnecting ? 'Creando...' : 'Crear Sala'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => setView('join')}
                  disabled={isConnecting}
                >
                  Unirse a Sala
                </Button>
              </div>

              {/* Secondary actions */}
              <div className="flex flex-col items-center gap-2 pt-2">
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
                  size="sm"
                  className="text-text-tertiary"
                  onClick={signOut}
                >
                  Cerrar sesión
                </Button>
              </div>
            </div>
          )
        ) : (
          <LoginForm />
        )}
      </div>
    </div>
  )
}
