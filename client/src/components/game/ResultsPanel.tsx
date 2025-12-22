import { Button, Card, CardContent } from '@/components/ui'
import { useGameStore, useRoomStore } from '@/stores'

interface ResultsPanelProps {
  onContinue: () => void
}

export function ResultsPanel({ onContinue }: ResultsPanelProps) {
  const { lastEliminated, wasImpostor } = useGameStore()
  const { room } = useRoomStore()

  if (!room) return null

  const eliminatedPlayer = lastEliminated
    ? room.players.find((p) => p.id === lastEliminated)
    : null

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Resultado de la votación</h2>
      </div>

      <Card>
        <CardContent className="py-8 text-center">
          {eliminatedPlayer ? (
            <div className="space-y-4">
              <p className="text-lg">
                <span className="font-semibold">{eliminatedPlayer.displayName}</span>{' '}
                ha sido eliminado
              </p>
              <p
                className={`text-2xl font-bold ${
                  wasImpostor
                    ? 'text-[--color-success]'
                    : 'text-[--color-danger]'
                }`}
              >
                {wasImpostor ? '¡Era el impostor!' : 'No era el impostor'}
              </p>
            </div>
          ) : (
            <p className="text-lg text-[--color-text-muted]">
              Nadie fue eliminado
            </p>
          )}
        </CardContent>
      </Card>

      <Button className="w-full" onClick={onContinue}>
        Continuar
      </Button>
    </div>
  )
}
