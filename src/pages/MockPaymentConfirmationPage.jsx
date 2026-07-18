import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Clock3, XCircle } from 'lucide-react'

const AUTO_REDIRECT_SECONDS = 5

// Stripe appends these to whatever return_url is passed to
// stripe.confirmPayment() — payment_intent / payment_intent_client_secret /
// redirect_status. There's no Checkout Session here (see StripePaymentForm),
// so there's no `id` param to read.
const STATUS_CONTENT = {
  succeeded: {
    Icon: CheckCircle2,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    title: 'Payment received',
    message: "We're confirming your registration now — this usually takes a few seconds.",
    autoRedirect: true,
  },
  processing: {
    Icon: Clock3,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    title: 'Payment processing',
    message: "Your payment is still being processed — we'll update your registration as soon as it clears.",
    autoRedirect: false,
  },
  requires_payment_method: {
    Icon: XCircle,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
    title: 'Payment failed',
    message: 'Your card was not charged. Please go back and try a different payment method.',
    autoRedirect: true,
  },
}

function MockPaymentConfirmationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const paymentIntentId = searchParams.get('payment_intent')
  const redirectStatus = searchParams.get('redirect_status')
  const content = STATUS_CONTENT[redirectStatus] || STATUS_CONTENT.succeeded
  const [secondsLeft, setSecondsLeft] = useState(AUTO_REDIRECT_SECONDS)

  useEffect(() => {
    if (!content.autoRedirect) return undefined

    if (secondsLeft <= 0) {
      navigate('/mock-tests')
      return undefined
    }

    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [content.autoRedirect, secondsLeft, navigate])

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-[1.75rem] p-8 shadow-card-xl border border-amber-100/60 text-center">
        <div className="flex justify-center mb-4">
          <div className={`rounded-full p-4 ${content.iconBg}`}>
            <content.Icon className={`h-10 w-10 ${content.iconColor}`} />
          </div>
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900 mb-2">{content.title}</h1>
        <p className="text-slate-500 text-sm mb-1">{content.message}</p>
        {paymentIntentId && (
          <p className="text-xs text-slate-400 mb-6 break-all">Reference: {paymentIntentId}</p>
        )}
        {content.autoRedirect && (
          <p className="text-xs text-slate-400 mb-4">Redirecting to Mock Tests in {secondsLeft}s…</p>
        )}
        <button
          onClick={() => navigate('/mock-tests')}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-full transition-colors shadow-btn"
        >
          {content.autoRedirect ? 'Redirect now' : 'Back to Mock Tests'}
        </button>
      </div>
    </div>
  )
}

export default MockPaymentConfirmationPage
