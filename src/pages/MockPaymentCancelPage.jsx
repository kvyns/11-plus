import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { XCircle } from 'lucide-react'

const AUTO_REDIRECT_SECONDS = 5

function MockPaymentCancelPage() {
  const navigate = useNavigate()
  const [secondsLeft, setSecondsLeft] = useState(AUTO_REDIRECT_SECONDS)

  useEffect(() => {
    if (secondsLeft <= 0) {
      navigate('/mock-tests')
      return undefined
    }

    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft, navigate])

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-[1.75rem] p-8 shadow-card-xl border border-amber-100/60 text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-red-50 p-4">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900 mb-2">Payment cancelled</h1>
        <p className="text-slate-500 text-sm mb-1">
          No payment was taken. You can pick up where you left off any time from Mock Tests.
        </p>
        <p className="text-xs text-slate-400 mb-4">Redirecting to Mock Tests in {secondsLeft}s…</p>
        <button
          onClick={() => navigate('/mock-tests')}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-full transition-colors shadow-btn"
        >
          Redirect now
        </button>
      </div>
    </div>
  )
}

export default MockPaymentCancelPage
