import { CheckCircle2 } from 'lucide-react'
import { childName } from '../../lib/childHelpers.js'

function CurrentPlanStatus({ childList }) {
  const covered = childList
    .map((child, i) => ({ name: childName(child, i), plan: child.activeSubscription || child.plan }))
    .filter((entry) => entry.plan)

  if (covered.length === 0) return null

  return (
    <div className="mb-8 bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-emerald-800 mb-2">Your current plan</h3>
      <div className="space-y-1.5">
        {covered.map((entry) => (
          <p key={entry.name} className="flex items-center gap-2 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="font-semibold">{entry.name}</span> — {entry.plan} (Active)
          </p>
        ))}
      </div>
    </div>
  )
}

export default CurrentPlanStatus
