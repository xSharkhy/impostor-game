import { createFileRoute, redirect } from '@tanstack/react-router'
import { WordSuggestions } from '@/components/admin/WordSuggestions'
import { Button } from '@/components/ui'
import { useNavigate } from '@tanstack/react-router'
import { useUserStore } from '@/stores'

export const Route = createFileRoute('/admin')({
  beforeLoad: () => {
    const { isAuthenticated, isLoading } = useUserStore.getState()
    // If not authenticated and not loading, redirect to home
    if (!isAuthenticated && !isLoading) {
      throw redirect({ to: '/' })
    }
  },
  component: AdminPage,
})

function AdminPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useUserStore()

  // Double-check auth (handles edge cases during hydration)
  if (!isAuthenticated) {
    navigate({ to: '/' })
    return null
  }

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
