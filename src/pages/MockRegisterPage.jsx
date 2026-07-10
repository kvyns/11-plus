import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAppStore } from '../store/appStore.jsx'
import { useToast } from '../store/toastStore.jsx'
import { CheckCircle2, ChevronLeft, CreditCard, Loader2, UserCheck } from 'lucide-react'

function MockRegisterPage() {
  const navigate = useNavigate()
  const { mockID } = useParams()
  const location = useLocation()
  const { api, user } = useAppStore()
  const toast = useToast()
  const mockDetails = location.state?.mockDetails || null
  const mockTitle = mockDetails?.title || 'Mock Test'

  const [children, setChildren] = useState([])
  const [priceByChild, setPriceByChild] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [busyChildId, setBusyChildId] = useState('')
  const [doneChildIds, setDoneChildIds] = useState({})
  const [payUnavailableChild, setPayUnavailableChild] = useState(null)

  useEffect(() => {
    let isCancelled = false

    async function load() {
      setIsLoading(true)
      try {
        const response = await api.quiz.parentDashboard()
        const list = response.children || response.result?.children || response.data?.children || []
        if (isCancelled) return
        setChildren(list)

        const registeredChildIds = mockDetails?.registeredChildIds || []
        const childIDs = list
          .map((c) => c.childID || c.id)
          .filter((id) => id && !registeredChildIds.includes(id))
        // No point pricing a mock that's already free, or children who are already registered.
        if (childIDs.length && !mockDetails?.free) {
          try {
            const priceResponse = await api.purchase.calculatePrice({ mockID, childIDs })
            const result = priceResponse.result || priceResponse.data || {}
            const perChild = result.children || result.breakdown || (Array.isArray(result) ? result : [])
            const map = {}
            perChild.forEach((entry) => {
              const id = entry.childID || entry.id
              if (id) map[id] = entry
            })
            if (!isCancelled) setPriceByChild(map)
          } catch {
            // Price lookup is best-effort — fall back to the mock's own free/paid flag per child.
          }
        }
      } catch {
        if (!isCancelled) setChildren([])
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    load()
    return () => { isCancelled = true }
  }, [api.quiz, api.purchase, mockID, mockDetails?.free, mockDetails?.registeredChildIds])

  const childName = (child, i) => child.firstName || child.name || child.username || `Child ${i + 1}`

  const childInfo = (child) => {
    const id = child.childID || child.id
    // registeredChildIds comes straight from the mocks list rows for this
    // child — it's the authoritative "already registered" signal, not a guess.
    const alreadyPurchased = (mockDetails?.registeredChildIds || []).includes(id)
    const priced = priceByChild[id]
    const amount = alreadyPurchased || mockDetails?.free ? 0 : priced?.amount ?? priced?.price
    const isFree = alreadyPurchased || amount === 0 || mockDetails?.free
    const currency = String(priced?.currency || '').toUpperCase() === 'GBP' ? '£' : ''
    return {
      id,
      alreadyPurchased,
      isFree,
      priceLabel: amount !== undefined ? `${currency}${amount}` : mockDetails?.price || '',
      statusLabel: alreadyPurchased ? 'Already registered' : isFree ? 'Free for subscribers' : 'No active subscription',
    }
  }

  const handleRegisterFree = async (child) => {
    const id = child.childID || child.id
    setBusyChildId(id)
    try {
      await api.mock.registerFreeMock({
        userID: user?.email,
        mockID,
        childID: id,
        platform: 'web',
      })
      setDoneChildIds((prev) => ({ ...prev, [id]: true }))
      toast.success(`${childName(child, 0)} was registered for ${mockTitle}.`)
    } catch (error) {
      toast.error(error.message || `Unable to register ${childName(child, 0)} right now.`)
    } finally {
      setBusyChildId('')
    }
  }

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
      <div className="max-w-2xl mx-auto px-4 py-8 md:px-6">
        <div className="bg-white rounded-[1.75rem] p-6 md:p-8 shadow-card-xl border border-amber-100/60">
          <p className="text-slate-600 text-sm mb-6">
            Subscribed children can register for free. Others can pay and register — one child per purchase.
          </p>

          <h2 className="font-display text-base font-bold text-slate-900 mb-3">Your children</h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : children.length === 0 ? (
            <p className="text-slate-500 text-sm">Add a child from your dashboard to register them for mocks.</p>
          ) : (
            <div className="space-y-3">
              {children.map((child, i) => {
                const info = childInfo(child)
                const isDone = doneChildIds[info.id]
                const isBusy = busyChildId === info.id

                return (
                  <div
                    key={info.id || i}
                    className={`rounded-2xl border-2 p-4 ${
                      info.alreadyPurchased || isDone ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-indigo-600 font-bold shadow-card">
                          {childName(child, i).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-display font-bold text-slate-900 truncate">{childName(child, i)}</p>
                          {child.username && <p className="text-xs text-slate-500 truncate">{child.username}</p>}
                        </div>
                      </div>
                      {info.priceLabel && !info.isFree && !isDone && (
                        <span className="font-display text-lg font-bold text-slate-900 shrink-0">{info.priceLabel}</span>
                      )}
                    </div>

                    <p className={`text-xs font-semibold mb-3 ${
                      info.alreadyPurchased || isDone ? 'text-emerald-600' : 'text-slate-500'
                    }`}>
                      {isDone ? 'Registered' : info.statusLabel}
                    </p>

                    {isDone || info.alreadyPurchased ? (
                      <div className="w-full flex items-center justify-center gap-2 rounded-full bg-emerald-100 text-emerald-700 font-bold py-3 text-sm">
                        <CheckCircle2 className="h-4 w-4" />
                        Registered
                      </div>
                    ) : info.isFree ? (
                      <button
                        onClick={() => handleRegisterFree(child)}
                        disabled={isBusy}
                        className="w-full flex items-center justify-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 text-sm transition-colors shadow-btn disabled:opacity-60"
                      >
                        {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                        {isBusy ? 'Registering...' : 'Register Free'}
                      </button>
                    ) : (
                      <button
                        onClick={() => setPayUnavailableChild(child)}
                        className="w-full flex items-center justify-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 text-sm transition-colors shadow-btn"
                      >
                        <CreditCard className="h-4 w-4" />
                        Pay &amp; Register
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Payment not yet available on web modal */}
      {payUnavailableChild && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 shadow-2xl border border-slate-100 text-center max-w-sm w-full">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-pastel-lavender p-3">
                <CreditCard className="h-7 w-7 text-pastel-lavender-ink" />
              </div>
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 mb-2">Card payment coming soon</h3>
            <p className="text-slate-500 text-sm mb-6">
              Online card checkout for {childName(payUnavailableChild, 0)} isn't available on the web app yet —
              please complete this purchase from the mobile app for now.
            </p>
            <button
              onClick={() => setPayUnavailableChild(null)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-full transition-colors shadow-btn"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MockRegisterPage
