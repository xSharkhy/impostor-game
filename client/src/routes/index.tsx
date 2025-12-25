import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button, Skeleton } from '@/components/ui'
import { LoginForm } from '@/components/auth/LoginForm'
import { JoinRoom } from '@/components/lobby/JoinRoom'
import { RoomLobby } from '@/components/lobby/RoomLobby'
import { EditDisplayName } from '@/components/lobby/EditDisplayName'
import { GameView } from '@/components/game/GameView'
import { SuggestWord } from '@/components/words/SuggestWord'
import { useUserStore, useRoomStore, useGameStore } from '@/stores'
import { useAuth, useSocket } from '@/hooks'
import { getCurrentLanguage } from '@/lib/i18n'

export const Route = createFileRoute('/')({
  component: HomePage,
})

type View = 'home' | 'join' | 'suggest'

function HomePage() {
  const { t } = useTranslation()
  const [view, setView] = useState<View>('home')
  const { isAuthenticated, isLoading } = useUserStore()
  const { room, isConnecting } = useRoomStore()
  const { phase } = useGameStore()
  const { signOut } = useAuth()
  const { createRoom, isConnected } = useSocket()

  const handleCreateRoom = () => {
    createRoom(getCurrentLanguage())
  }

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
          <div className="text-6xl" aria-hidden="true">🕵️</div>
          <h1
            className="text-4xl font-black tracking-tight sm:text-5xl"
            style={{
              background: 'linear-gradient(135deg, var(--color-text-primary), var(--color-accent))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t('app.title')}
          </h1>
          <p className="text-sm text-text-secondary">
            {t('app.subtitle')}
          </p>
        </div>

        {isAuthenticated ? (
          view === 'join' ? (
            <JoinRoom onBack={() => setView('home')} />
          ) : view === 'suggest' ? (
            <SuggestWord onClose={() => setView('home')} />
          ) : (
            <div className="space-y-6">
              {/* User greeting with editable name */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span>{t('home.greeting')}</span>
                  {isConnected && (
                    <span className="h-2 w-2 rounded-full bg-success" title={t('common.connected')} />
                  )}
                </div>
                <EditDisplayName />
              </div>

              {/* Main actions */}
              <div className="flex flex-col gap-3">
                <Button
                  variant="neon"
                  size="lg"
                  className="w-full"
                  onClick={handleCreateRoom}
                  disabled={isConnecting}
                  isLoading={isConnecting}
                >
                  {isConnecting ? t('home.creating') : t('home.createRoom')}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => setView('join')}
                  disabled={isConnecting}
                >
                  {t('home.joinRoom')}
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
                  {t('home.suggestWord')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-text-tertiary"
                  onClick={signOut}
                >
                  {t('auth.logout')}
                </Button>
              </div>
            </div>
          )
        ) : (
          <LoginForm />
        )}

        {/* Legal footer */}
        <footer className="pt-8 text-center text-xs text-text-tertiary">
          <Link to="/terms" className="hover:text-accent">{t('terms.title')}</Link>
          <span className="mx-2">·</span>
          <Link to="/privacy" className="hover:text-accent">{t('privacy.title')}</Link>
        </footer>
      </div>
    </div>
  )
}
