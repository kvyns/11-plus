import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronLeft, Gift, Loader2, RotateCcw, Smile, Sparkles, User, Users } from 'lucide-react'
import { useAppStore } from '../store/appStore.jsx'
import { useToast } from '../store/toastStore.jsx'

const pastelCycle = [
  { bg: 'bg-pastel-lavender', ink: 'text-pastel-lavender-ink' },
  { bg: 'bg-pastel-pink', ink: 'text-pastel-pink-ink' },
  { bg: 'bg-pastel-mint', ink: 'text-pastel-mint-ink' },
  { bg: 'bg-pastel-yellow', ink: 'text-pastel-yellow-ink' },
]

function SubscriptionPage() {
  const navigate = useNavigate()
  const { api } = useAppStore()
  const toast = useToast()
  const [selected, setSelected] = useState(null)
  const [billingCycle, setBillingCycle] = useState('monthly') // 'monthly' | 'yearly'
  const [plans, setPlans] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isRestoring, setIsRestoring] = useState(false)
  const [children, setChildren] = useState([])
  const [selectedChildIds, setSelectedChildIds] = useState([])
  const [isContinuing, setIsContinuing] = useState(false)

  const fallbackPlans = [
    {
      id: 1,
      name: 'Standard',
      cycle: 'monthly',
      price: '₹1,250',
      billing: 'per month',
      childLimit: 1,
      subjects: ['Maths', 'English', 'Verbal Reasoning', 'Non-Verbal Reasoning'],
      description: 'Full access to all 11+ exam preparation content for one child. Cancel anytime.',
    },
    {
      id: 2,
      name: 'Plus',
      cycle: 'monthly',
      price: '₹1,900',
      billing: 'per month',
      childLimit: 3,
      subjects: ['Maths', 'English', 'Verbal Reasoning', 'Non-Verbal Reasoning'],
      description: 'Full access for up to 3 children — perfect for siblings preparing together.',
    },
    {
      id: 3,
      name: 'Standard',
      cycle: 'yearly',
      price: '₹7,500',
      billing: 'per year',
      childLimit: 1,
      subjects: ['Maths', 'English', 'Verbal Reasoning', 'Non-Verbal Reasoning'],
      description: 'Full access to all 11+ exam preparation content for one child. Cancel anytime.',
    },
    {
      id: 4,
      name: 'Plus',
      cycle: 'yearly',
      price: '₹12,500',
      billing: 'per year',
      childLimit: 3,
      badge: 'BEST VALUE',
      subjects: ['Maths', 'English', 'Verbal Reasoning', 'Non-Verbal Reasoning'],
      description: 'Full access for up to 3 children — perfect for siblings preparing together.',
    },
  ]

  useEffect(() => {
    let isCancelled = false

    async function loadPlans() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const response = await api.purchase.subscriptions()
        const subscriptionPlans = response.subscriptions || response.result?.subscriptions || response.plans || []
        if (!isCancelled) {
          setPlans(subscriptionPlans)
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(error.message || 'Unable to load subscriptions right now.')
          setPlans([])
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    loadPlans()

    return () => {
      isCancelled = true
    }
  }, [api.purchase])

  useEffect(() => {
    let isCancelled = false

    async function loadChildren() {
      try {
        const response = await api.quiz.parentDashboard()
        const list = response.children || response.result?.children || response.data?.children || []
        if (!isCancelled) {
          setChildren(list)
          if (list.length === 1) {
            setSelectedChildIds([list[0].childID || list[0].id || ''])
          }
        }
      } catch {
        if (!isCancelled) {
          setChildren([])
        }
      }
    }

    loadChildren()
    return () => { isCancelled = true }
  }, [api.quiz])

  const renderedPlans = plans.length ? plans : fallbackPlans

  const planIdOf = (plan, index) => plan.id || plan.planID || plan.subscriptionID || index + 1

  const getPlanCycle = (plan) => {
    if (plan.cycle) return plan.cycle
    const label = `${plan.billType || ''} ${plan.billing || ''}`.toLowerCase()
    return label.includes('year') ? 'yearly' : 'monthly'
  }

  const getPlanPrice = (plan) => {
    if (plan.price) {
      return plan.price
    }

    if (plan.amount !== undefined) {
      const symbol = String(plan.currency || '').toUpperCase() === 'GBP' ? '£' : ''
      return `${symbol}${plan.amount}`
    }

    return 'N/A'
  }

  const getPlanFeatures = (plan) => {
    if (Array.isArray(plan.subjects) && plan.subjects.length) {
      return plan.subjects
    }
    if (Array.isArray(plan.features) && plan.features.length) {
      return plan.features
    }
    if (plan.description) {
      return [plan.description]
    }
    return []
  }

  // Filter to the selected billing cycle; if nothing matches (e.g. unknown API shape), show everything.
  const visiblePlans = useMemo(() => {
    const filtered = renderedPlans.filter((plan) => getPlanCycle(plan) === billingCycle)
    return filtered.length ? filtered : renderedPlans
  }, [renderedPlans, billingCycle])

  const selectedPlan = renderedPlans.find((plan, index) => planIdOf(plan, index) === selected)

  const handleRestorePurchases = async () => {
    try {
      setIsRestoring(true)
      await api.purchase.restorePurchase({ platform: 'web' })
      toast.success('Purchases restored successfully.')
    } catch (error) {
      toast.error(error.message || 'Unable to restore purchases.')
    } finally {
      setIsRestoring(false)
    }
  }

  const childName = (child, i) => child.firstName || child.name || child.username || `Child ${i + 1}`
  const childStatus = (child) => child.activeSubscription || child.plan || 'No active plan'

  const planChildLimit = selectedPlan?.childLimit || 1

  const toggleChildSelection = (id) => {
    setSelectedChildIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((childId) => childId !== id)
      }
      if (planChildLimit === 1) {
        return [id]
      }
      if (prev.length >= planChildLimit) {
        return prev
      }
      return [...prev, id]
    })
  }

  // If a lower-capacity plan is selected after children were already picked, trim the selection to fit.
  useEffect(() => {
    setSelectedChildIds((prev) => (prev.length > planChildLimit ? prev.slice(0, planChildLimit) : prev))
  }, [planChildLimit])

  const handleContinue = async () => {
    if (!selected || selectedChildIds.length === 0) return

    setIsContinuing(true)

    try {
      await api.purchase.verifyPurchase({
        childIDs: selectedChildIds,
        subjects: selectedPlan?.subjects || [],
        planID: selectedPlan ? planIdOf(selectedPlan, 0) : selected,
        billingCycle,
        platform: 'web',
      })
      toast.success(
        selectedChildIds.length > 1
          ? `Subscription request submitted for ${selectedChildIds.length} children.`
          : 'Subscription request submitted for this child.'
      )
    } catch (error) {
      toast.error(error.message || 'Unable to process this subscription right now.')
    } finally {
      setIsContinuing(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream pb-28">
      {/* Header */}
      <div className="bg-cream/90 backdrop-blur-md border-b border-amber-100 py-4 px-6 flex items-center justify-between sticky top-0 z-30">
        <button
          onClick={() => navigate('/dashboard')}
          className="h-10 w-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="font-display text-xl font-bold text-slate-900">Subscription</h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-4xl mx-auto px-4 py-8 md:px-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-pastel-lavender/50 blur-3xl"
        />

        {/* Icon + Heading */}
        <div className="relative flex justify-center mb-5">
          <div className="rounded-full bg-pastel-lavender p-4 shadow-card">
            <Gift className="h-9 w-9 text-pastel-lavender-ink" />
          </div>
        </div>

        <h2 className="relative font-display text-3xl md:text-4xl font-bold text-slate-900 text-center mb-2">
          Unlock premium learning
        </h2>
        <p className="relative text-slate-500 text-center mb-8">
          Choose the plan that fits your child's 11+ journey.
        </p>

        {errorMessage && (
          <p className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        {/* Billing cycle toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-slate-100 rounded-full p-1">
            {['monthly', 'yearly'].map((cycle) => (
              <button
                key={cycle}
                onClick={() => setBillingCycle(cycle)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors relative ${
                  billingCycle === cycle
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cycle === 'monthly' ? 'Monthly' : 'Yearly'}
                {cycle === 'yearly' && (
                  <span
                    className={`ml-1.5 text-[10px] font-bold ${
                      billingCycle === cycle ? 'text-amber-300' : 'text-amber-500'
                    }`}
                  >
                    SAVE
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plans grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 gap-5">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-white border border-amber-100/60 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {visiblePlans.map((plan, index) => {
              const id = planIdOf(plan, index)
              const isSelected = selected === id
              const isPlus = (plan.childLimit || 1) > 1
              const palette = pastelCycle[index % pastelCycle.length]

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelected(id)}
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
            })}
          </div>
        )}

        {/* Who is this plan for */}
        {selected && children.length > 0 && (
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
              {children.map((child, i) => {
                const id = child.childID || child.id || i
                const isChecked = selectedChildIds.includes(id)
                const isCapped = !isChecked && planChildLimit > 1 && selectedChildIds.length >= planChildLimit
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleChildSelection(id)}
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
        )}

        {/* Restore Purchases */}
        <div className="text-center mt-8">
          <button
            onClick={handleRestorePurchases}
            disabled={isRestoring}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            {isRestoring ? 'Restoring...' : 'Restore purchases'}
          </button>
        </div>
      </div>

      {/* Sticky CTA bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-cream/95 backdrop-blur-md border-t border-amber-100 px-4 py-4 md:px-6">
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
            onClick={handleContinue}
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
              : selected && children.length > 0 && selectedChildIds.length === 0
              ? 'Select a child'
              : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionPage
