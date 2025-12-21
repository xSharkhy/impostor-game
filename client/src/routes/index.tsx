import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="mb-4 text-5xl font-bold text-[--color-accent-pink]">
        El Impostor
      </h1>
      <p className="mb-8 text-center text-[--color-text-muted]">
        Juego de deducción social con palabras
      </p>
      <div className="flex gap-4">
        <Button size="lg">Crear Sala</Button>
        <Button variant="outline" size="lg">
          Unirse
        </Button>
      </div>
    </div>
  )
}
