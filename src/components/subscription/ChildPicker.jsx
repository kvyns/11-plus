import { Check, Smile, User } from 'lucide-react'

function childName(child, i) {
  return child.firstName || child.name || child.username || `Child ${i + 1}`
}

function childStatus(child) {
  return child.activeSubscription || child.plan || 'No active plan'
}

function ChildPicker({ childList, selectedChildIds, planChildLimit, onToggle }) {
  return (
    <div className="mt-8 bg-white rounded-2xl p-5 md:p-6 shadow-card border border-amber-100/60">
      <div className="flex items-center gap-2 mb-1">
        <Smile className="h-5 w-5 text-indigo-500" />
        <h3 className="font-display text-base font-bold text-slate-900">Who is this plan for?</h3>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        {planChildLimit > 1
          ? `Select up to ${planChildLimit} children (${selectedChildIds.length}/${planChildLimit} selected).`
          : 'This plan covers one child.'}
      </p>

      <div className="space-y-2.5">
        {childList.map((child, i) => {
          const id = child.childID || child.id || i
          const isChecked = selectedChildIds.includes(id)
          const isCapped = !isChecked && planChildLimit > 1 && selectedChildIds.length >= planChildLimit
          return (
            <button
              key={id}
              type="button"
              onClick={() => onToggle(id)}
              disabled={isCapped}
              className={`w-full flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors ${
                isChecked
                  ? 'border-indigo-500 bg-indigo-50'
                  : isCapped
                  ? 'border-slate-100 opacity-50 cursor-not-allowed'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pastel-lavender text-pastel-lavender-ink">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 truncate">{childName(child, i)}</p>
                <p className="text-xs text-slate-500 truncate">{childStatus(child)}</p>
              </div>
              {planChildLimit > 1 ? (
                <span
                  className={`h-5 w-5 shrink-0 rounded-md border-2 flex items-center justify-center ${
                    isChecked ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                  }`}
                >
                  {isChecked && <Check className="h-3.5 w-3.5 text-white" />}
                </span>
              ) : (
                <span
                  className={`h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                    isChecked ? 'border-indigo-600' : 'border-slate-300'
                  }`}
                >
                  {isChecked && <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ChildPicker
