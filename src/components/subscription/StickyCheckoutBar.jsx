import { Loader2 } from 'lucide-react'
import { getPlanPrice } from '../../lib/subscriptionHelpers.js'

function StickyCheckoutBar({ selectedPlan, billingCycle, selected, selectedChildIds, childrenCount, isContinuing, onContinue }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 md:left-72 bg-cream/95 backdrop-blur-md border-t border-amber-100 px-4 py-4 md:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="text-sm text-slate-500 hidden sm:block">
          {selectedPlan ? (
            <span>
              <span className="font-display font-semibold text-slate-900">
                {selectedPlan.name} ({billingCycle === 'yearly' ? 'Yearly' : 'Monthly'})
              </span>{' '}
              — {getPlanPrice(selectedPlan)} {selectedPlan.billing}
            </span>
          ) : (
            'Select a plan to continue'
          )}
        </div>
        <button
          onClick={onContinue}
          disabled={!selected || selectedChildIds.length === 0 || isContinuing}
          className={`flex-1 sm:flex-none sm:min-w-50 py-3.5 px-8 rounded-full font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 ${
            selected && selectedChildIds.length > 0
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-btn'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isContinuing && <Loader2 className="h-4 w-4 animate-spin" />}
          {isContinuing
            ? 'Processing...'
            : selected && childrenCount > 0 && selectedChildIds.length === 0
            ? 'Select a child'
            : 'Continue'}
        </button>
      </div>
    </div>
  )
}

export default StickyCheckoutBar
