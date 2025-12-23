import { Component, ReactNode } from 'react'
import i18n from '@/lib/i18n'
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
              <div className="mb-4 text-6xl" aria-hidden="true">💥</div>
              <CardTitle className="text-xl text-text-primary">
                {i18n.t('error.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-sm text-text-secondary">
                {i18n.t('error.description')}
              </p>
              {import.meta.env.DEV && this.state.error && (
                <pre className="mt-4 max-h-32 overflow-auto rounded-lg bg-bg-tertiary p-3 text-left text-xs text-danger">
                  {this.state.error.message}
                </pre>
              )}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={this.handleReset}>
                  {i18n.t('common.retry')}
                </Button>
                <Button variant="neon" className="flex-1" onClick={this.handleReload}>
                  {i18n.t('error.reload')}
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
