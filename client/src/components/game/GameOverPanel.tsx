import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useSocket } from '@/hooks'
import { useGameStore, useRoomStore, useUserStore } from '@/stores'

export function GameOverPanel() {
  const { winner, revealedImpostorId, word } = useGameStore()
  const { room } = useRoomStore()
  const { user } = useUserStore()
  const { leaveRoom, playAgain } = useSocket()

  if (!room || !user) return null

  const impostor = room.players.find((p) => p.id === revealedImpostorId)
  const isAdmin = room.adminId === user.id
  const wasImpostor = revealedImpostorId === user.id

  const crewWon = winner === 'crew'

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">¡Fin del juego!</h2>
        <p
          className={`text-xl font-semibold ${
            crewWon ? 'text-[--color-accent-cyan]' : 'text-[--color-accent-pink]'
          }`}
        >
          {crewWon ? 'Victoria de los civiles' : 'Victoria del impostor'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">El impostor era</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-2xl font-bold text-[--color-accent-pink]">
            {impostor?.displayName || 'Desconocido'}
            {wasImpostor && ' (tú)'}
          </p>
        </CardContent>
      </Card>

      {word && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">La palabra era</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-2xl font-bold text-[--color-accent-cyan]">{word}</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {isAdmin && (
          <Button className="w-full" onClick={playAgain}>
            Nueva partida
          </Button>
        )}
        <Button
          variant="outline"
          className="w-full"
          onClick={leaveRoom}
        >
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}
