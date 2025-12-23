import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Toaster } from 'sonner'
import { useAuth } from '@/hooks'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { SoundToggle } from '@/components/ui'

function RootComponent() {
  // Initialize auth listener
  useAuth()

  return (
    <>
      <div className="min-h-screen bg-bg-primary">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
        {/* Sound toggle - fixed position */}
        <div className="fixed bottom-4 right-4 z-50">
          <SoundToggle className="bg-bg-elevated/80 backdrop-blur-sm" />
        </div>
      </div>
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          },
          classNames: {
            success: 'border-success/50',
            error: 'border-danger/50',
            warning: 'border-neon-yellow/50',
            info: 'border-accent/50',
          },
        }}
      />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
