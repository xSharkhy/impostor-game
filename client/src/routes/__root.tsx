import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Toaster } from 'sonner'
import { useAuth } from '@/hooks'
import { ErrorBoundary } from '@/components/ErrorBoundary'

function RootComponent() {
  // Initialize auth listener
  useAuth()

  return (
    <>
      <div className="min-h-screen bg-[--color-bg-primary]">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
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
            success: 'border-[--color-success]/50',
            error: 'border-[--color-danger]/50',
            warning: 'border-[--color-neon-yellow]/50',
            info: 'border-[--color-neon-cyan]/50',
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
