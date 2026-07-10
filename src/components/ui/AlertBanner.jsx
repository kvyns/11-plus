import { AlertCircle } from 'lucide-react'

const variants = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-red-50 border-red-200 text-red-800',
}

function AlertBanner({ variant = 'error', children }) {
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm flex items-start gap-2 ${variants[variant]}`}>
      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  )
}

export default AlertBanner
