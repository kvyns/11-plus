import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

// Stripe.js throws synchronously (not via a rejected promise) when the
// clientSecret it's given is malformed — with no boundary here, that
// uncaught error unmounts the whole app to a blank page. A class component
// is required for error boundaries; there's no hook equivalent.
class StripeErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3.5 text-sm text-red-600 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          Checkout couldn't be loaded. Please refresh and try again.
        </div>
      )
    }

    return this.props.children
  }
}

export default StripeErrorBoundary
