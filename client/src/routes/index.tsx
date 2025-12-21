import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
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
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" className="w-full sm:w-auto">
            Crear Sala
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            Unirse
          </Button>
        </div>
      </div>
    </div>
  )
}
