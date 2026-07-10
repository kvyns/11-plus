import { CheckCircle2, Loader2 } from 'lucide-react'

function RegisterSuccess() {
  return (
    <div className="flex flex-col items-center py-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircle2 className="h-9 w-9 text-emerald-500" />
      </div>
      <h2 className="font-display text-lg font-bold text-slate-900">
        Registration successful!
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Redirecting to the login page...
      </p>
      <Loader2 className="mt-4 h-5 w-5 animate-spin text-indigo-500" />
    </div>
  )
}

export default RegisterSuccess
