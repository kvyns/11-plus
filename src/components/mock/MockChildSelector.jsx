import { Check, CheckCircle2, User } from 'lucide-react'
import { childName } from '../../lib/childHelpers.js'
import { formatCurrency } from '../../lib/mockPurchaseHelpers.js'

function MockChildSelector({ childList, selectedChildIds, registeredChildIds, priceByChildId, currency, childSubscriptionMap, onToggle }) {
  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 shadow-card border border-amber-100/60">
      <h3 className="font-display text-base font-bold text-slate-900 mb-1">Select children</h3>
      <p className="text-xs text-slate-500 mb-4">Pick who you're registering for this mock.</p>

      <div className="space-y-2.5">
        {childList.map((child, i) => {
          const id = child.childID || child.id || i
          const isRegistered = registeredChildIds.includes(id)
          const isChecked = isRegistered || selectedChildIds.includes(id)
          const priced = priceByChildId?.[id]
          const priceLabel = priced ? formatCurrency(priced.price ?? priced.amount, currency) : ''
          const coveringPlan = childSubscriptionMap?.[id]

          return (
            <button
              key={id}
              type="button"
              onClick={() => !isRegistered && onToggle(id)}
              disabled={isRegistered}
              className={`w-full flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors ${
                isRegistered
                  ? 'border-emerald-200 bg-emerald-50 cursor-not-allowed'
                  : isChecked
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pastel-lavender text-pastel-lavender-ink">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 truncate">{childName(child, i)}</p>
                <p className="text-xs text-slate-500 truncate">
                  {isRegistered ? 'Already registered' : priceLabel || 'Tap to select'}
                </p>
                {!isRegistered && coveringPlan && (
                  <p className="text-xs text-emerald-600 font-semibold truncate">Covered by {coveringPlan}</p>
                )}
              </div>
              {isRegistered ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
              ) : (
                <span
                  className={`h-5 w-5 shrink-0 rounded-md border-2 flex items-center justify-center ${
                    isChecked ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                  }`}
                >
                  {isChecked && <Check className="h-3.5 w-3.5 text-white" />}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default MockChildSelector
