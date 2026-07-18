import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { AlertTriangle, CreditCard, Loader2 } from 'lucide-react'
import { stripePublishableKey } from '../../services/api.js'
import { formatCurrency } from '../../lib/mockPurchaseHelpers.js'
import StripeErrorBoundary from './StripeErrorBoundary.jsx'

const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null

function PaymentFormInner({ amount, currency, isProcessing, setIsProcessing }) {
  const navigate = useNavigate()
  const stripe = useStripe()
  const elements = useElements()
  const [formError, setFormError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setFormError('')
    setIsProcessing(true)

    // Stripe redirects the browser to return_url itself on success, appending
    // its own `payment_intent` / `redirect_status` query params — there's no
    // response to handle here on the happy path, only the error path stays
    // on this page.
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/confirmation` },
    })

    if (error) {
      setFormError(error.message || 'Your payment could not be completed. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />

      {formError && (
        <p className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full flex items-center justify-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 text-sm transition-colors shadow-btn disabled:opacity-60"
      >
        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
        {isProcessing ? 'Processing…' : `Pay ${formatCurrency(amount, currency)}`}
      </button>

      <button
        type="button"
        onClick={() => navigate('/cancel')}
        disabled={isProcessing}
        className="w-full text-sm font-semibold text-slate-500 hover:text-slate-700 disabled:opacity-50"
      >
        Cancel
      </button>
    </form>
  )
}

function StripePaymentForm({ clientSecret, amount, currency, isProcessing, setIsProcessing }) {
  if (!stripePublishableKey) {
    return (
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3.5 text-sm text-amber-700 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
        Card checkout isn't configured yet on this environment (missing Stripe publishable key).
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <StripeErrorBoundary>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <PaymentFormInner amount={amount} currency={currency} isProcessing={isProcessing} setIsProcessing={setIsProcessing} />
      </Elements>
    </StripeErrorBoundary>
  )
}

export default StripePaymentForm
