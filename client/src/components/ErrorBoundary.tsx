import { Component, ReactNode } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[50vh] items-center justify-center p-6">
          <Card variant="glass" className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mb-4 text-6xl">💥</div>
              <CardTitle className="text-xl text-[--color-text-primary]">
                ¡Algo salió mal!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-sm text-[--color-text-secondary]">
                Ha ocurrido un error inesperado. Puedes intentar recargar la página.
              </p>
              {import.meta.env.DEV && this.state.error && (
                <pre className="mt-4 max-h-32 overflow-auto rounded-lg bg-[--color-bg-tertiary] p-3 text-left text-xs text-[--color-danger]">
                  {this.state.error.message}
                </pre>
              )}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={this.handleReset}>
                  Reintentar
                </Button>
                <Button variant="neon" className="flex-1" onClick={this.handleReload}>
                  Recargar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
