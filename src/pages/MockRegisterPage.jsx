import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAppStore } from '../store/appStore.jsx'
import { useToast } from '../store/toastStore.jsx'
import { ChevronLeft, CreditCard, Loader2, Tag, UserCheck } from 'lucide-react'
import { isMockFree as isMockFreeCheck } from '../lib/mockHelpers.js'
import { parsePriceBreakdown, parseVoucherResult, parsePaymentSheet, formatCurrency } from '../lib/mockPurchaseHelpers.js'
import StepIndicator from '../components/ui/StepIndicator.jsx'
import MockChildSelector from '../components/mock/MockChildSelector.jsx'
import StripePaymentForm from '../components/mock/StripePaymentForm.jsx'

const STEPS = ['Select children', 'Review price', 'Pay']

function MockRegisterPage() {
  const navigate = useNavigate()
  const { mockID } = useParams()
  const location = useLocation()
  const { api, user } = useAppStore()
  const toast = useToast()
  const mockDetails = location.state?.mockDetails || null
  const mockTitle = mockDetails?.title || 'Mock Test'
  const registeredChildIds = mockDetails?.registeredChildIds || []

  const [children, setChildren] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedChildIds, setSelectedChildIds] = useState([])

  const [isCalculating, setIsCalculating] = useState(false)
  const [pricing, setPricing] = useState(null) // { byChildId, total, currency }

  const [voucherCode, setVoucherCode] = useState('')
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false)
  const [voucherApplied, setVoucherApplied] = useState(false)

  const [isRegistering, setIsRegistering] = useState(false)
  const [isCreatingIntent, setIsCreatingIntent] = useState(false)
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
  const [clientSecret, setClientSecret] = useState(null)
  const [registeredThisSession, setRegisteredThisSession] = useState(false)

  useEffect(() => {
    let isCancelled = false

    async function load() {
      setIsLoading(true)
      try {
        const response = await api.quiz.parentDashboard()
        const list = response.children || response.result?.children || response.data?.children || []
        if (!isCancelled) setChildren(list)
      } catch {
        if (!isCancelled) setChildren([])
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    load()
    return () => { isCancelled = true }
  }, [api.quiz])

  // Same field ChildPicker.jsx reads for the Subscription page — so a parent
  // can see, right where they're choosing children for a mock, whether a
  // child's existing plan already covers it.
  const childSubscriptionMap = {}
  children.forEach((child) => {
    const id = child.childID || child.id
    const plan = child.activeSubscription || child.plan
    if (id && plan) childSubscriptionMap[id] = plan
  })

  const toggleChild = (id) => {
    setPricing(null)
    setVoucherApplied(false)
    setClientSecret(null)
    setSelectedChildIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  const eligibleChildIds = selectedChildIds.filter((id) => !registeredChildIds.includes(id))

  const handleCalculatePrice = async () => {
    if (eligibleChildIds.length === 0) return
    setIsCalculating(true)
    setVoucherApplied(false)

    try {
      const response = await api.purchase.calculatePrice({ mockID, childIDs: eligibleChildIds })
      setPricing(parsePriceBreakdown(response))
    } catch (error) {
      toast.error(error.message || 'Unable to calculate the price right now.')
    } finally {
      setIsCalculating(false)
    }
  }

  // Auto-fires once eligible children are selected, instead of making the
  // parent click a separate "Calculate Price" button — debounced so rapid
  // toggling doesn't fire one request per click.
  useEffect(() => {
    if (isMockFreeCheck(mockDetails || {})) return undefined
    if (eligibleChildIds.length === 0) return undefined

    const timeoutId = setTimeout(() => {
      handleCalculatePrice()
    }, 400)
    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligibleChildIds.join(',')])

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim() || !pricing) return
    setIsApplyingVoucher(true)

    try {
      const response = await api.purchase.validateVoucher({
        mockID,
        userID: user?.email,
        promotionCode: voucherCode.trim(),
        originalAmount: pricing.total,
      })
      const voucherResult = parseVoucherResult(response)
      setPricing((prev) => ({
        ...prev,
        total: voucherResult.total,
        byChildId: Object.keys(voucherResult.byChildId).length ? voucherResult.byChildId : prev.byChildId,
      }))
      setVoucherApplied(true)
      toast.success('Voucher applied.')
    } catch (error) {
      toast.error(error.message || 'That voucher code is not valid.')
    } finally {
      setIsApplyingVoucher(false)
    }
  }

  const registerFreeChildren = async (ids) => {
    setIsRegistering(true)
    try {
      for (const id of ids) {
        // eslint-disable-next-line no-await-in-loop
        await api.mock.registerFreeMock({ userID: user?.email, mockID, childID: id, platform: 'web' })
      }
      setRegisteredThisSession(true)
      toast.success(
        ids.length > 1 ? `${ids.length} children registered for ${mockTitle}.` : `Registered for ${mockTitle}.`
      )
    } catch (error) {
      toast.error(error.message || 'Unable to register right now.')
    } finally {
      setIsRegistering(false)
    }
  }

  const handleFreeOrZeroAmountRegister = () => registerFreeChildren(eligibleChildIds)

  // Creates the PaymentIntent up front — the embedded Payment Element needs
  // its clientSecret before it can even mount, unlike a Checkout redirect
  // where the session is only needed at click-time.
  const handleContinueToPayment = async () => {
    setIsCreatingIntent(true)
    try {
      // A client-generated reference so the backend can correlate this
      // attempt with the PaymentIntent it creates — the spec lists
      // `purchaseRef` as a request field, implying the caller supplies it.
      const purchaseRef = crypto.randomUUID()

      const response = await api.purchase.stripePayment({
        userID: user?.email,
        mockPurchaseID: mockID,
        purchaseRef,
        finalAmount: pricing?.total,
        currency: pricing?.currency || 'GBP',
        payer: {
          email: user?.email || '',
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          mobileNumber: user?.mobileNumber || user?.mobile || '',
        },
      })
      const sheet = parsePaymentSheet(response)
      if (!sheet.clientSecret) {
        toast.error('Payment could not be started — no client secret was returned. Please try again.')
        return
      }
      setClientSecret(sheet.clientSecret)
    } catch (error) {
      toast.error(error.message || 'Unable to start payment right now.')
    } finally {
      setIsCreatingIntent(false)
    }
  }

  const isMockFree = isMockFreeCheck(mockDetails || {})
  const allSelectedAlreadyRegistered = selectedChildIds.length > 0 && eligibleChildIds.length === 0
  const amountDue = isMockFree ? 0 : pricing?.total ?? null
  const stepIndex = registeredThisSession ? 3 : clientSecret ? 2 : selectedChildIds.length > 0 ? 1 : 0

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-cream/90 backdrop-blur-md border-b border-amber-100 py-4 px-6 flex items-center justify-between sticky top-0 z-30">
        <button
          onClick={() => navigate(-1)}
          className="h-10 w-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="font-display text-lg font-bold text-slate-900 truncate px-2">{mockTitle}</h1>
        <div className="w-10 shrink-0" />
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8 md:px-6 space-y-5">
        <div className="px-2">
          <StepIndicator steps={STEPS} currentIndex={stepIndex} />
        </div>

        <div className="bg-white rounded-[1.75rem] p-6 md:p-8 shadow-card-xl border border-amber-100/60">
          <p className="text-slate-600 text-sm mb-6">
            Select the children you're registering, then continue to pricing and checkout.
          </p>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : children.length === 0 ? (
            <p className="text-slate-500 text-sm">Add a child from your dashboard to register them for mocks.</p>
          ) : (
            <MockChildSelector
              childList={children}
              selectedChildIds={selectedChildIds}
              registeredChildIds={registeredChildIds}
              priceByChildId={pricing?.byChildId}
              currency={pricing?.currency}
              childSubscriptionMap={childSubscriptionMap}
              onToggle={toggleChild}
            />
          )}
        </div>

        {registeredThisSession ? (
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 text-center space-y-4">
            <div>
              <UserCheck className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <p className="font-display font-bold text-emerald-800">You're all set!</p>
              <p className="text-sm text-emerald-700 mt-1">Registration for {mockTitle} is complete.</p>
            </div>
            <button
              onClick={() => navigate('/mock-tests')}
              className="w-full bg-white hover:bg-emerald-50 text-emerald-700 font-bold py-3 rounded-full text-sm transition-colors border-2 border-emerald-200"
            >
              Back to Mock Tests
            </button>
          </div>
        ) : allSelectedAlreadyRegistered ? (
          <p className="text-center text-sm text-slate-500">All selected children are already registered.</p>
        ) : selectedChildIds.length === 0 ? null : isMockFree ? (
          <button
            onClick={handleFreeOrZeroAmountRegister}
            disabled={isRegistering}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 text-sm transition-colors shadow-btn disabled:opacity-60"
          >
            {isRegistering ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
            {isRegistering ? 'Registering…' : 'Register (Free)'}
          </button>
        ) : !pricing ? (
          <div className="flex items-center justify-center gap-2 py-4 text-sm text-slate-500">
            {isCalculating && <Loader2 className="h-4 w-4 animate-spin" />}
            {isCalculating ? 'Calculating price…' : ' '}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-card border border-amber-100/60 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">Total</span>
              <span className="font-display text-2xl font-bold text-slate-900">
                {formatCurrency(amountDue, pricing?.currency)}
              </span>
            </div>

            {!voucherApplied && !clientSecret && (
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Voucher code (optional)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500" />
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SAVE30"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none bg-slate-50 text-sm transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleApplyVoucher}
                    disabled={isApplyingVoucher || !voucherCode.trim()}
                    className="shrink-0 rounded-xl border-2 border-indigo-200 text-indigo-600 font-semibold px-4 py-2.5 text-sm hover:bg-indigo-50 disabled:opacity-50 transition-colors"
                  >
                    {isApplyingVoucher ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                  </button>
                </div>
              </div>
            )}

            {amountDue === 0 ? (
              <button
                onClick={handleFreeOrZeroAmountRegister}
                disabled={isRegistering}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 text-sm transition-colors shadow-btn disabled:opacity-60"
              >
                {isRegistering ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                {isRegistering ? 'Registering…' : 'Register (Free)'}
              </button>
            ) : !clientSecret ? (
              <button
                onClick={handleContinueToPayment}
                disabled={isCreatingIntent}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 text-sm transition-colors shadow-btn disabled:opacity-60"
              >
                {isCreatingIntent ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                {isCreatingIntent ? 'Preparing checkout…' : 'Continue to Payment'}
              </button>
            ) : (
              <StripePaymentForm
                clientSecret={clientSecret}
                amount={amountDue}
                currency={pricing?.currency}
                isProcessing={isPaymentProcessing}
                setIsProcessing={setIsPaymentProcessing}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MockRegisterPage
