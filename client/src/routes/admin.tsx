import { createFileRoute } from '@tanstack/react-router'
import { WordSuggestions } from '@/components/admin/WordSuggestions'
import { Button } from '@/components/ui'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})

function AdminPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-md space-y-6">
        <WordSuggestions />

        <Button
          variant="ghost"
          className="w-full text-[--color-text-muted]"
          onClick={() => navigate({ to: '/' })}
        >
          Volver al inicio
        </Button>
      </div>
    </div>
  )
}
