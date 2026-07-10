import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, X, XCircle, Info } from 'lucide-react'
import { ToastContext } from './toastStore.jsx'

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    border: 'border-emerald-100',
    bar: 'bg-emerald-400',
  },
  error: {
    icon: XCircle,
    iconColor: 'text-red-500',
    border: 'border-red-100',
    bar: 'bg-red-400',
  },
  info: {
    icon: Info,
    iconColor: 'text-indigo-500',
    border: 'border-indigo-100',
    bar: 'bg-indigo-400',
  },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((message, { type = 'info', duration = 3500 } = {}) => {
    const id = ++idRef.current
    setToasts((prev) => [...prev, { id, message, type, duration }])
    if (duration) {
      setTimeout(() => dismissToast(id), duration)
    }
    return id
  }, [dismissToast])

  const toast = {
    success: (message, opts) => showToast(message, { ...opts, type: 'success' }),
    error: (message, opts) => showToast(message, { ...opts, type: 'error' }),
    info: (message, opts) => showToast(message, { ...opts, type: 'info' }),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}

      <div className="fixed top-4 right-4 z-100 flex w-full max-w-sm flex-col gap-2.5 sm:top-6 sm:right-6">
        <AnimatePresence>
          {toasts.map((item) => {
            const variant = VARIANTS[item.type] || VARIANTS.info
            const Icon = variant.icon
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -16, x: 16 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, x: 40, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className={`pointer-events-auto relative overflow-hidden rounded-2xl border bg-white shadow-card-xl ${variant.border}`}
              >
                <div className="flex items-start gap-3 px-4 py-3.5">
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${variant.iconColor}`} />
                  <p className="flex-1 text-sm font-medium text-slate-700">{item.message}</p>
                  <button
                    onClick={() => dismissToast(item.id)}
                    aria-label="Dismiss"
                    className="shrink-0 text-slate-400 transition-colors hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {item.duration > 0 && (
                  <motion.div
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    transition={{ duration: item.duration / 1000, ease: 'linear' }}
                    style={{ originX: 1 }}
                    className={`absolute bottom-0 left-0 h-0.75 w-full ${variant.bar}`}
                  />
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
