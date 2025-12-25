import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Input,
} from '@/components/ui'
import { useSocket } from '@/hooks'
import { useRoomStore, useUserStore } from '@/stores'
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/lib/i18n'
import {
  CONSTANTS,
  type GameMode,
  getMinPlayersForImpostors,
  getRecommendedImpostors,
  isImpostorCountWarning,
} from '@impostor/shared'

export function RoomLobby() {
  const { t } = useTranslation()
  const { room } = useRoomStore()
  const { user } = useUserStore()
  const { leaveRoom, kickPlayer, changeRoomLanguage, startGame } = useSocket()
  const [playerToKick, setPlayerToKick] = useState<{ id: string; name: string } | null>(null)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [customWord, setCustomWord] = useState('')

  // Restore last used mode and impostor count from localStorage
  const [gameMode, setGameMode] = useState<GameMode>(() => {
    const saved = localStorage.getItem('lastGameMode') as GameMode | null
    return saved && ['classic', 'random', 'custom', 'roulette'].includes(saved) ? saved : 'classic'
  })

  const [impostorCount, setImpostorCount] = useState(() => {
    const saved = localStorage.getItem('lastImpostorCount')
    return saved ? Math.max(1, Math.min(CONSTANTS.MAX_IMPOSTORS, parseInt(saved, 10) || 1)) : 1
  })

  // Save mode and impostor count to localStorage when they change
  useEffect(() => {
    localStorage.setItem('lastGameMode', gameMode)
  }, [gameMode])

  useEffect(() => {
    localStorage.setItem('lastImpostorCount', String(impostorCount))
  }, [impostorCount])

  // Reset to classic mode if current language doesn't support random
  useEffect(() => {
    if (gameMode === 'random' && room?.language !== 'es') {
      setGameMode('classic')
    }
  }, [room?.language, gameMode])

  // Auto-adjust impostor count if it exceeds what's valid for player count
  useEffect(() => {
    if (room) {
      const maxValid = Math.floor(room.players.length / CONSTANTS.MIN_PLAYERS_PER_IMPOSTOR)
      if (impostorCount > maxValid && maxValid >= 1) {
        setImpostorCount(maxValid)
      }
    }
  }, [room?.players.length, impostorCount])

  if (!room || !user) return null

  // Check which modes are available for the current room language
  const isRandomModeAvailable = room.language === 'es'

  const isAdmin = room.adminId === user.id
  const hasEnoughPlayers = room.players.length >= CONSTANTS.MIN_PLAYERS
  const playersNeeded = CONSTANTS.MIN_PLAYERS - room.players.length

  // Impostor count validation
  const minPlayersForImpostors = getMinPlayersForImpostors(impostorCount)
  const canHaveThisImpostorCount = room.players.length >= minPlayersForImpostors
  const impostorWarning = isImpostorCountWarning(impostorCount, room.players.length)
  const recommended = getRecommendedImpostors(room.players.length)

  // For custom mode, also need a word
  const canStartCustom = gameMode === 'custom' ? customWord.trim().length > 0 : true
  const canStart = hasEnoughPlayers && canStartCustom && canHaveThisImpostorCount

  // Get the mode description
  const getModeDescription = () => {
    switch (gameMode) {
      case 'classic':
        return t('room.modeClassicDesc')
      case 'random':
        return t('room.modeRandomDesc')
      case 'custom':
        return t('room.modeCustomDesc')
      case 'roulette':
        return t('room.modeRouletteDesc')
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      {/* Room Code Display */}
      <div className="text-center">
        <p className="text-sm font-medium text-text-secondary">
          {t('room.code')}
        </p>
        <div className="mt-2">
          <p
            className="font-mono text-5xl font-bold tracking-[0.3em] text-accent"
            style={{
              textShadow: '0 0 30px rgba(168, 85, 247, 0.5), 0 0 60px rgba(168, 85, 247, 0.3)',
            }}
          >
            {room.code}
          </p>
        </div>
        <p className="mt-2 text-xs text-text-tertiary">
          {t('room.shareCode')}
        </p>
      </div>

      {/* Players List */}
      <div>
        <Card variant="glass">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                {t('room.players')}
                <span className="rounded-full bg-bg-elevated px-2 py-0.5 text-sm font-normal text-text-secondary">
                  {room.players.length}
                </span>
              </span>
              {!canStart && (
                <span className="text-xs font-normal text-text-tertiary">
                  {t('room.minimum', { count: CONSTANTS.MIN_PLAYERS })}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {room.players.map((player) => {
                const isMe = player.id === user.id
                const isPlayerAdmin = player.id === room.adminId

                return (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors ${
                      isMe
                        ? 'border border-accent/30 bg-accent/5'
                        : 'bg-bg-tertiary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Connection status */}
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          player.isConnected
                            ? 'bg-success'
                            : 'bg-text-tertiary'
                        }`}
                      />

                      {/* Avatar */}
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                          isPlayerAdmin
                            ? 'bg-neon-yellow text-black'
                            : isMe
                              ? 'bg-accent text-white'
                              : 'bg-bg-elevated text-text-secondary'
                        }`}
                      >
                        {player.displayName.charAt(0).toUpperCase()}
                      </div>

                      {/* Name */}
                      <div className="flex flex-col">
                        <span className={`font-medium ${isMe ? 'text-accent' : 'text-text-primary'}`}>
                          {player.displayName}
                          {isMe && (
                            <span className="ml-1.5 text-xs text-text-secondary">{t('common.you')}</span>
                          )}
                        </span>
                        {isPlayerAdmin && (
                          <span className="text-xs text-neon-yellow">{t('common.admin')}</span>
                        )}
                      </div>
                    </div>

                    {/* Kick button */}
                    {isAdmin && player.id !== user.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-text-tertiary hover:text-danger"
                        onClick={() => setPlayerToKick({ id: player.id, name: player.displayName })}
                      >
                        {t('room.kick')}
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Waiting indicator */}
      {!hasEnoughPlayers && (
        <div className="flex items-center justify-center gap-3 rounded-lg border border-border bg-bg-tertiary px-4 py-3">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-2 w-2 rounded-full bg-accent"
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
          <span className="text-sm text-text-secondary">
            {t('room.waitingPlayers', { count: playersNeeded })}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {isAdmin && (
          <>
            {/* Game Settings */}
            <div className="space-y-3 rounded-lg border border-border bg-bg-tertiary p-3">
              {/* Mode Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="w-16 text-sm text-text-secondary">{t('room.gameMode')}</span>
                  <Select value={gameMode} onValueChange={(v) => setGameMode(v as GameMode)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classic">{t('room.modeClassic')}</SelectItem>
                      <SelectItem value="random" disabled={!isRandomModeAvailable}>
                        {t('room.modeRandom')}
                      </SelectItem>
                      <SelectItem value="custom">{t('room.modeCustom')}</SelectItem>
                      <SelectItem value="roulette">{t('room.modeRoulette')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-text-tertiary">
                  {getModeDescription()}
                </p>
              </div>

              {/* Custom Word Input (only for custom mode) */}
              {gameMode === 'custom' && (
                <div className="space-y-1.5">
                  <Input
                    placeholder={t('room.customWordPlaceholder')}
                    value={customWord}
                    onChange={(e) => setCustomWord(e.target.value)}
                    maxLength={30}
                  />
                  {!customWord.trim() && (
                    <p className="text-xs text-warning">{t('room.customWordRequired')}</p>
                  )}
                </div>
              )}

              {/* Impostor Count Selector */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="w-16 text-sm text-text-secondary">{t('room.impostors')}</span>
                  <div className="flex flex-1 items-center justify-between rounded-md border border-border bg-bg-secondary px-3 py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setImpostorCount(Math.max(1, impostorCount - 1))}
                      disabled={impostorCount <= 1}
                    >
                      -
                    </Button>
                    <span className="font-medium tabular-nums">{impostorCount}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setImpostorCount(Math.min(CONSTANTS.MAX_IMPOSTORS, impostorCount + 1))}
                      disabled={impostorCount >= CONSTANTS.MAX_IMPOSTORS || !canHaveThisImpostorCount}
                    >
                      +
                    </Button>
                  </div>
                </div>
                {/* Warnings and recommendations - only show for 2+ impostors since 1 impostor is always valid with game minimum */}
                {!canHaveThisImpostorCount && impostorCount > 1 && (
                  <p className="text-xs text-danger">
                    {t('room.needMorePlayers', { count: minPlayersForImpostors })}
                  </p>
                )}
                {canHaveThisImpostorCount && impostorWarning === 'too_many' && (
                  <p className="text-xs text-warning">
                    {t('room.tooManyImpostors')}
                  </p>
                )}
                {canHaveThisImpostorCount && impostorWarning === 'too_few' && impostorCount > 1 && (
                  <p className="text-xs text-text-tertiary">
                    {t('room.recommendedImpostors', { min: recommended.min, max: recommended.max })}
                  </p>
                )}
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-3">
                <span className="w-16 text-sm text-text-secondary">{t('room.language')}</span>
                <Select
                  value={room.language}
                  onValueChange={(v) => changeRoomLanguage(v as SupportedLanguage)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SUPPORTED_LANGUAGES).map(([code, { flag, name }]) => (
                      <SelectItem key={code} value={code}>
                        {flag} {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              variant={canStart ? 'neon' : 'outline'}
              className="w-full"
              disabled={!canStart}
              onClick={() => startGame({
                mode: gameMode,
                customWord: gameMode === 'custom' ? customWord.trim() : undefined,
                impostorCount,
              })}
            >
              {hasEnoughPlayers ? t('room.startGame') : t('room.waitingForPlayers')}
            </Button>
          </>
        )}

        {!isAdmin && (
          <div className="flex items-center justify-center gap-2 text-sm text-text-tertiary">
            <motion.span
              className="h-2 w-2 rounded-full bg-accent"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            {t('room.waitingAdmin')}
          </div>
        )}

        <Button
          variant="ghost"
          className="w-full text-text-tertiary hover:text-danger"
          onClick={() => setShowLeaveConfirm(true)}
        >
          {t('room.leaveRoom')}
        </Button>
      </div>

      {/* Kick confirmation dialog */}
      <AlertDialog open={!!playerToKick} onOpenChange={(open) => !open && setPlayerToKick(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('room.kickPlayer')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('room.kickConfirm', { name: playerToKick?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              variant="danger"
              onClick={() => {
                if (playerToKick) kickPlayer(playerToKick.id)
              }}
            >
              {t('room.kick')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave confirmation dialog */}
      <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('room.leaveRoom')}</AlertDialogTitle>
            <AlertDialogDescription>
              {isAdmin
                ? t('room.leaveAdminWarning')
                : t('room.leaveConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction variant="danger" onClick={leaveRoom}>
              {t('room.leave')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
