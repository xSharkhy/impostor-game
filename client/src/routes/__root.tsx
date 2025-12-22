import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { useAuth } from '@/hooks'

function RootComponent() {
  // Initialize auth listener
  useAuth()

  return (
    <>
      <div className="min-h-screen bg-[--color-bg-primary]">
        <Outlet />
      </div>
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
