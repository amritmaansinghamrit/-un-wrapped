'use client'

import { Component, ReactNode } from 'react'
import { motion } from 'framer-motion'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Log to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-purple to-primary-pink p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-8 max-w-md w-full text-center"
          >
            <div className="text-6xl mb-4">💔</div>
            <h1 className="text-2xl font-serif font-semibold text-white mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-white/80 mb-6">
              We encountered an unexpected error. Don't worry, your session is safe!
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-white/60 text-sm cursor-pointer mb-2">
                  Error Details (dev only)
                </summary>
                <pre className="text-xs text-white/70 bg-black/20 p-3 rounded overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={this.handleReset}
              className="w-full touch-button bg-white text-purple-600 font-semibold text-lg py-4 px-8 rounded-full shadow-lg"
            >
              Return to Home
            </motion.button>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}
