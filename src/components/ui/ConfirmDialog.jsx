import { Loader2 } from 'lucide-react'

function ConfirmDialog({
  open,
  icon: Icon,
  iconBg = 'bg-red-50',
  iconColor = 'text-red-500',
  title,
  message,
  error,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  destructive = true,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 shadow-2xl border border-slate-100 text-center max-w-sm w-full">
        {Icon && (
          <div className="flex justify-center mb-4">
            <div className={`rounded-full p-3 ${iconBg}`}>
              <Icon className={`h-7 w-7 ${iconColor}`} />
            </div>
          </div>
        )}
        <h3 className="font-display text-xl font-bold text-slate-900 mb-2">{title}</h3>
        {message && <p className="text-slate-500 text-sm mb-6">{message}</p>}
        {error && (
          <p className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-full transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 text-white font-bold py-3 rounded-full transition-colors shadow-btn disabled:opacity-60 flex items-center justify-center gap-2 ${
              destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
