import { createFileRoute } from '@tanstack/react-router'

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
        <button className="rounded-lg bg-[--color-accent-cyan] px-6 py-3 font-semibold text-[--color-bg-primary] transition-transform hover:scale-105">
          Crear Sala
        </button>
        <button className="rounded-lg border-2 border-[--color-accent-purple] px-6 py-3 font-semibold text-[--color-accent-purple] transition-transform hover:scale-105">
          Unirse
        </button>
      </div>
    </div>
  )
}
