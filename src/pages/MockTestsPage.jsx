import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { BarChart3, BookOpen, CheckCircle2, GraduationCap, ShoppingCart, User } from 'lucide-react'
import { useAppStore } from '../store/appStore.jsx'
import { isMockLive, isMockFree, formatDateRange } from '../lib/mockHelpers.js'
import { childName } from '../lib/childHelpers.js'
import MockCard from '../components/mock/MockCard.jsx'
import LeaderboardUnavailableModal from '../components/mock/LeaderboardUnavailableModal.jsx'
import ParentLayout from '../components/dashboard/ParentLayout.jsx'

// The Purchased tab wants the opposite of dedup — one card per (mock, child)
// pair, since each child has their own leaderboard/attempt for the mock.
function expandPurchasedRows(mocks) {
  const rows = []
  mocks.forEach((mock) => {
    const ids = mock.childIDs || (mock.childID ? [mock.childID] : [])
    if (ids.length === 0) {
      rows.push({ ...mock, childID: null })
      return
    }
    ids.forEach((childID) => rows.push({ ...mock, childID }))
  })
  return rows
}

// For a parent token, /mocks?status=purchased returns one row PER CHILD who
// purchased the mock — so the same mockID repeats once for every child it
// was bought for. Collapse those rows into a single card and remember which
// childIDs are already covered, instead of showing the same mock N times.
// (Used for the Upcoming tab, where a mock is shown once regardless of who
// it's already registered for — see expandPurchasedRows above for Purchased.)
function dedupeMocksByChildren(mocks) {
  const byId = new Map()

  mocks.forEach((mock) => {
    const id = mock.mockID || mock.id
    const rowChildIds = mock.childIDs || (mock.childID ? [mock.childID] : [])

    if (!byId.has(id)) {
      byId.set(id, { ...mock, registeredChildIds: [...rowChildIds] })
      return
    }

    const existing = byId.get(id)
    rowChildIds.forEach((childId) => {
      if (!existing.registeredChildIds.includes(childId)) {
        existing.registeredChildIds.push(childId)
      }
    })
  })

  return Array.from(byId.values())
}

function MockTestsPage() {
  const navigate = useNavigate()
  const { api } = useAppStore()
  const [activeTab, setActiveTab] = useState('upcoming')
  const [showLeaderboardUnavailable, setShowLeaderboardUnavailable] = useState(false)
  const [mockTests, setMockTests] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [children, setChildren] = useState([])
  const [childFilter, setChildFilter] = useState('all')

  const selectedStatus = useMemo(() => (activeTab === 'purchased' ? 'purchased' : 'upcoming'), [activeTab])
  const hasAnyPlan = children.some((child) => child.activeSubscription || child.plan)

  // Also doubles as the child-name lookup for the Purchased tab (each row
  // there only carries a childID, not a name) and the child filter pills.
  useEffect(() => {
    let isCancelled = false

    async function loadChildren() {
      try {
        const response = await api.quiz.parentDashboard()
        const list = response.children || response.result?.children || response.data?.children || []
        if (!isCancelled) setChildren(list)
      } catch {
        if (!isCancelled) setChildren([])
      }
    }

    loadChildren()
    return () => { isCancelled = true }
  }, [api.quiz])

  useEffect(() => {
    setChildFilter('all')
  }, [activeTab])

  const childNameById = (id) => {
    const index = children.findIndex((c) => (c.childID || c.id) === id)
    return index === -1 ? 'Unknown child' : childName(children[index], index)
  }

  useEffect(() => {
    let isCancelled = false

    async function loadMocks() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const response = await api.mock.listMocks(selectedStatus)
        const mocks = response.mocks || response.result?.mocks || response.data?.mocks || []
        if (!isCancelled) {
          setMockTests(selectedStatus === 'purchased' ? expandPurchasedRows(mocks) : dedupeMocksByChildren(mocks))
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(error.message || 'Unable to load mock tests right now.')
          setMockTests([])
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    loadMocks()

    return () => {
      isCancelled = true
    }
  }, [api.mock, selectedStatus])

  const handleLeaderboardClick = async (test) => {
    try {
      // childID included defensively — leaderboard/rank is inherently a
      // per-child thing once a mock has been bought for more than one
      // child, even though the documented request shape only lists mockID.
      await api.mock.mockLeaderboard({ mockID: test.mockID || test.id, childID: test.childID || undefined })
    } catch {
      setShowLeaderboardUnavailable(true)
    }
  }

  const getMockPriceLabel = (test) => {
    if (test.priceType === 'FREE' || test.free) {
      return 'FREE'
    }

    const amount = test.price ?? test.amount
    const currency = test.currency === 'GBP' || String(test.currency || '').toUpperCase() === 'GBP' ? '£' : ''
    return `${currency}${amount ?? '0.00'}`
  }

  const toCardModel = (mock, index) => {
    const rawLevel = mock.yearGroup || mock.level
    const level =
      rawLevel === undefined || rawLevel === null || rawLevel === ''
        ? 'Year 5'
        : /^\d+$/.test(String(rawLevel))
        ? `Year ${rawLevel}`
        : rawLevel

    const isFree = isMockFree(mock)

    return {
      id: mock.mockID || mock.purchaseID || mock.id || index + 1,
      mockID: mock.mockID || mock.id,
      title: mock.title || mock.mockTitle || `Mock Paper ${index + 1}`,
      subjects: mock.subjects || ['ENGLISH'],
      level,
      questions: mock.totalQuestions || mock.questions || 50,
      duration: mock.durationMins || mock.duration || 60,
      price: getMockPriceLabel(mock),
      free: isFree,
      // childIDs this mock has already been purchased/registered for — only
      // these children get a free "Register" option; everyone else pays.
      registeredChildIds: mock.registeredChildIds || [],
      live: isMockLive(mock),
      date: formatDateRange(mock.startTime, mock.endTime) || mock.date || 'Schedule pending',
    }
  }

  const toCardModelPurchased = (mock, index) => ({
    ...toCardModel(mock, index),
    childID: mock.childID || null,
    childDisplayName: mock.childID ? childNameById(mock.childID) : null,
  })

  const registerForMock = (test) => {
    navigate(`/mock-tests/${test.mockID || test.id}/register`, { state: { mockDetails: test } })
  }

  const isPurchasedTab = activeTab === 'purchased'
  const purchasedChildIds = isPurchasedTab
    ? [...new Set(mockTests.map((m) => m.childID).filter(Boolean))]
    : []
  const visibleMockTests =
    isPurchasedTab && childFilter !== 'all'
      ? mockTests.filter((m) => m.childID === childFilter)
      : mockTests

  return (
    <ParentLayout title="Mock Tests" activePage="mock-tests">
      {/* Content */}
      <div className="relative max-w-5xl mx-auto">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-4 right-0 h-56 w-56 rounded-full bg-indigo-200/30 blur-3xl"
        />

        <div className="relative bg-white rounded-[1.75rem] p-6 md:p-8 shadow-card-xl border border-amber-100/60 mb-8">
          <p className="text-slate-600 text-center mb-6">
            Purchase mocks for your children. They can attempt them from the child app.
          </p>

          {errorMessage && (
            <p className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {errorMessage}
            </p>
          )}

          {/* Tab Navigation */}
          <div className="flex justify-center mb-2">
            <div className="inline-flex bg-slate-100 rounded-full p-1">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
                  activeTab === 'upcoming' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab('purchased')}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
                  activeTab === 'purchased' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Purchased
              </button>
            </div>
          </div>

          {isPurchasedTab && purchasedChildIds.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <button
                onClick={() => setChildFilter('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  childFilter === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All children
              </button>
              {purchasedChildIds.map((id) => (
                <button
                  key={id}
                  onClick={() => setChildFilter(id)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    childFilter === id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <User className="h-3 w-3" />
                  {childNameById(id)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mock Test Grid */}
        {isLoading && (
          <div className="grid sm:grid-cols-2 gap-5">
            {[1, 2].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-white border border-amber-100/60 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && visibleMockTests.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-5">
            {visibleMockTests.map((rawMock, index) => {
              const test = isPurchasedTab ? toCardModelPurchased(rawMock, index) : toCardModel(rawMock, index)
              return (
                <MockCard
                  key={isPurchasedTab ? `${test.id}-${test.childID}` : test.id}
                  title={test.title}
                  subjectKey={test.subjects[0]}
                  live={test.live}
                  questions={test.questions}
                  duration={test.duration}
                  date={test.date}
                  headerExtra={
                    isPurchasedTab ? (
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600">
                        <User className="h-4 w-4" />
                        {test.childDisplayName || 'Registered'}
                      </p>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-indigo-600">{test.price}</p>
                        {test.free && <p className="text-xs text-slate-500">Free for Subscribers</p>}
                        {!test.free && !hasAnyPlan && (
                          <Link to="/subscription" className="text-xs text-indigo-600 font-semibold hover:underline">
                            Have a plan? Check subscription
                          </Link>
                        )}
                      </>
                    )
                  }
                  tagsRow={
                    <>
                      {test.subjects.map((subject) => (
                        <span
                          key={subject}
                          className="px-2.5 py-1 bg-pastel-lavender text-pastel-lavender-ink rounded-full text-xs font-semibold flex items-center gap-1"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>{subject}</span>
                        </span>
                      ))}
                      <span className="px-2.5 py-1 bg-pastel-pink text-pastel-pink-ink rounded-full text-xs font-semibold flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5" />
                        <span>{test.level}</span>
                      </span>
                      {isPurchasedTab && (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Registered</span>
                        </span>
                      )}
                    </>
                  }
                  footnote={
                    <>
                      {test.live && (
                        <p className="text-amber-600 col-span-2 font-semibold text-xs">
                          • LIVE NOW — Mock window is open
                        </p>
                      )}
                      <p className="text-slate-400 col-span-2 text-xs">
                        Leaderboard available after the mock window closes.
                      </p>
                    </>
                  }
                  actions={
                    isPurchasedTab ? (
                      <button
                        onClick={() => handleLeaderboardClick(test)}
                        className="w-full bg-white hover:bg-indigo-50 text-indigo-600 font-bold py-3 rounded-full text-sm transition-colors border-2 border-indigo-200 hover:border-indigo-300 flex items-center justify-center gap-2"
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span>{test.childDisplayName ? `${test.childDisplayName}'s Leaderboard` : 'Leaderboard'}</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => registerForMock(test)}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-full text-sm transition-colors shadow-btn flex items-center justify-center gap-2"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          <span>
                            {test.free ? 'Register (Free)' : `Register — ${test.price}`}
                          </span>
                        </button>
                        <button
                          onClick={() => handleLeaderboardClick(test)}
                          className="w-full bg-white hover:bg-indigo-50 text-indigo-600 font-bold py-3 rounded-full text-sm transition-colors border-2 border-indigo-200 hover:border-indigo-300 flex items-center justify-center gap-2"
                        >
                          <BarChart3 className="h-4 w-4" />
                          <span>Leaderboard</span>
                        </button>
                      </>
                    )
                  }
                />
              )
            })}
          </div>
        )}

        {!isLoading && visibleMockTests.length === 0 && (
          <div className="text-center">
            <img
              src="/no-mocks.png"
              alt="No upcoming mock tests"
              className="w-full rounded-2xl border border-amber-100/60 shadow-card mb-4"
            />
            <p className="text-slate-500 text-sm">
              {isPurchasedTab
                ? "You haven't purchased any mocks yet."
                : 'No upcoming mocks right now — check back soon.'}
            </p>
          </div>
        )}

        {showLeaderboardUnavailable && (
          <LeaderboardUnavailableModal onClose={() => setShowLeaderboardUnavailable(false)} />
        )}
      </div>
    </ParentLayout>
  )
}

export default MockTestsPage
