import React from 'react'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'
import Button from './ui/Button'
import { HeritageDivider } from './ui/HeritagePattern'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-cream-100 px-4 py-12 text-center selection:bg-chili-200">
          <div className="mx-auto max-w-md rounded-2xl border border-cream-300 bg-cream-50 p-8 shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-chili-100 text-chili-600">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <h1 className="mt-5 font-serif text-2xl font-bold tracking-tight text-ink-900">
              Something went unexpected
            </h1>

            <HeritageDivider className="my-3 text-cream-300" />

            <p className="font-serif text-xs italic text-chili-600">
              “Safe, as your mother's home.”
            </p>

            <p className="mt-3 text-sm leading-relaxed text-ink-500">
              We encountered a momentary glitch in the kitchen. Your cart and account information remain completely safe.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                onClick={this.handleReload}
                className="w-full sm:w-auto"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reload Page</span>
              </Button>
              <Button
                variant="outline"
                onClick={this.handleReset}
                className="w-full sm:w-auto"
              >
                <Home className="h-4 w-4" />
                <span>Return Home</span>
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
