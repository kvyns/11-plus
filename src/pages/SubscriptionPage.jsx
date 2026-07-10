import { useEffect, useMemo, useState } from 'react'
import { Gift, RotateCcw } from 'lucide-react'
import { useAppStore } from '../store/appStore.jsx'
import { useToast } from '../store/toastStore.jsx'
import { planIdOf, getPlanCycle } from '../lib/subscriptionHelpers.js'
import fallbackPlans from '../components/subscription/fallbackPlans.js'
import PlanCard from '../components/subscription/PlanCard.jsx'
import PlanCardSkeleton from '../components/subscription/PlanCardSkeleton.jsx'
import ChildPicker from '../components/subscription/ChildPicker.jsx'
import StickyCheckoutBar from '../components/subscription/StickyCheckoutBar.jsx'
import ParentLayout from '../components/dashboard/ParentLayout.jsx'

function SubscriptionPage() {
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
    <ParentLayout title="Subscription" activePage="subscription">
      {/* Content */}
      <div className="relative max-w-4xl mx-auto pb-28">
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
          <PlanCardSkeleton />
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {visiblePlans.map((plan, index) => {
              const id = planIdOf(plan, index)
              return (
                <PlanCard
                  key={id}
                  plan={plan}
                  id={id}
                  index={index}
                  billingCycle={billingCycle}
                  isSelected={selected === id}
                  onSelect={setSelected}
                />
              )
            })}
          </div>
        )}

        {/* Who is this plan for */}
        {selected && children.length > 0 && (
          <ChildPicker
            childList={children}
            selectedChildIds={selectedChildIds}
            planChildLimit={planChildLimit}
            onToggle={toggleChildSelection}
          />
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

      <StickyCheckoutBar
        selectedPlan={selectedPlan}
        billingCycle={billingCycle}
        selected={selected}
        selectedChildIds={selectedChildIds}
        childrenCount={children.length}
        isContinuing={isContinuing}
        onContinue={handleContinue}
      />
    </ParentLayout>
  )
}

export default SubscriptionPage
