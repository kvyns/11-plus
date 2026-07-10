import { Check, Sparkles, User, Users } from 'lucide-react'
import { getPlanPrice, getPlanFeatures } from '../../lib/subscriptionHelpers.js'

const pastelCycle = [
  { bg: 'bg-pastel-lavender', ink: 'text-pastel-lavender-ink' },
  { bg: 'bg-pastel-pink', ink: 'text-pastel-pink-ink' },
  { bg: 'bg-pastel-mint', ink: 'text-pastel-mint-ink' },
  { bg: 'bg-pastel-yellow', ink: 'text-pastel-yellow-ink' },
]

function PlanCard({ plan, id, index, billingCycle, isSelected, onSelect }) {
  const isPlus = (plan.childLimit || 1) > 1
  const palette = pastelCycle[index % pastelCycle.length]

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`relative text-left rounded-2xl p-6 transition-all duration-200 border-2 ${palette.bg} ${
        isSelected
          ? 'border-indigo-500 shadow-card-lg'
          : 'border-transparent shadow-card hover:shadow-card-lg'
      }`}
    >
      {plan.badge && (
        <span className="absolute -top-3 left-6 px-3 py-1 bg-amber-400 text-slate-900 text-xs font-bold rounded-full shadow-card-lg flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          {plan.badge}
        </span>
      )}

      {/* Selected check */}
      <div
        className={`absolute top-5 right-5 h-6 w-6 rounded-full flex items-center justify-center border-2 transition-colors ${
          isSelected
            ? 'bg-indigo-600 border-indigo-600'
            : 'border-white bg-white/70'
        }`}
      >
        {isSelected && <Check className="h-4 w-4 text-white" />}
      </div>

      {/* Icon + name */}
      <div className="flex items-center gap-2 mb-3">
        <div className="rounded-full bg-white/70 p-1.5">
          {isPlus ? (
            <Users className={`h-4 w-4 ${palette.ink}`} />
          ) : (
            <User className={`h-4 w-4 ${palette.ink}`} />
          )}
        </div>
        <h3 className="font-display text-lg font-bold text-slate-900">
          {plan.name || plan.title || 'Subscription Plan'}
        </h3>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="font-display text-3xl font-bold text-slate-900">{getPlanPrice(plan)}</span>
        <span className={`text-sm ${palette.ink} opacity-80`}>
          {plan.billing || (billingCycle === 'yearly' ? 'per year' : 'per month')}
        </span>
      </div>

      <p className={`text-xs font-semibold ${palette.ink} opacity-80 mb-4`}>
        {isPlus ? 'Up to 3 children' : '1 child'}
      </p>

      <p className="text-sm text-slate-700 mb-4">{plan.description}</p>

      {/* Subject chips */}
      <div className="flex flex-wrap gap-1.5">
        {getPlanFeatures(plan).map((feature, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 bg-white/70 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-full"
          >
            <Check className={`h-3 w-3 ${palette.ink}`} />
            {feature}
          </span>
        ))}
      </div>
    </button>
  )
}

export default PlanCard
