import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  Clock3,
  FileText,
  GraduationCap,
  ShoppingCart,
} from 'lucide-react'
import { useAppStore } from '../store/appStore.jsx'

const subjectArt = {
  ENGLISH: '/english/english.png',
  VERBAL: '/verbal/verbal.png',
  MATHS: '/maths/maths.png',
  NON_VERBAL: '/non-verbal/non_verbal.png',
}

// The API's mockStatus field doesn't reliably flip to "LIVE" once the window
// opens (it's often still "UPCOMING") — the doc explicitly calls out that the
// LIVE state has to be derived from startTime/endTime on the client.
function isMockLive(mock) {
  const statusIndicatesLive = ['LIVE', 'OPEN'].includes(String(mock.mockStatus || '').toUpperCase())
  const startMs = mock.startTime ? new Date(mock.startTime).getTime() : null
  const endMs = mock.endTime ? new Date(mock.endTime).getTime() : null
  const withinWindow = startMs !== null && endMs !== null && !Number.isNaN(startMs) && !Number.isNaN(endMs)
    ? Date.now() >= startMs && Date.now() <= endMs
    : false
  return statusIndicatesLive || withinWindow
}

// For a parent token, /mocks?status=purchased returns one row PER CHILD who
// purchased the mock — so the same mockID repeats once for every child it
// was bought for. Collapse those rows into a single card and remember which
// childIDs are already covered, instead of showing the same mock N times.
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

  const selectedStatus = useMemo(() => (activeTab === 'purchased' ? 'purchased' : 'upcoming'), [activeTab])

  useEffect(() => {
    let isCancelled = false

    async function loadMocks() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const response = await api.mock.listMocks(selectedStatus)
        const mocks = response.mocks || response.result?.mocks || response.data?.mocks || []
        if (!isCancelled) {
          setMockTests(dedupeMocksByChildren(mocks))
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
      await api.mock.mockLeaderboard({ mockID: test.mockID || test.id })
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

  const formatMockDate = (value) => {
    if (!value) return null
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value
    return parsed.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const formatDateRange = (start, end) => {
    const startLabel = formatMockDate(start)
    const endLabel = formatMockDate(end)
    if (startLabel && endLabel) return `${startLabel} – ${endLabel}`
    return startLabel || endLabel || null
  }

  const toCardModel = (mock, index) => {
    const rawLevel = mock.yearGroup || mock.level
    const level =
      rawLevel === undefined || rawLevel === null || rawLevel === ''
        ? 'Year 5'
        : /^\d+$/.test(String(rawLevel))
        ? `Year ${rawLevel}`
        : rawLevel

    const amount = mock.price ?? mock.amount
    // If the price is explicitly 0, the mock is free for everyone regardless
    // of what priceType says.
    const isFree = mock.priceType === 'FREE' || mock.free || amount === 0 || amount === '0'

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

  const registerForMock = (test) => {
    navigate(`/mock-tests/${test.mockID || test.id}/register`, { state: { mockDetails: test } })
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
        <h1 className="font-display text-xl font-bold text-slate-900">Mock Tests</h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-5xl mx-auto px-4 py-6 md:px-6 md:py-8">
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
        </div>

        {/* Mock Test Grid */}
        {isLoading && (
          <div className="grid sm:grid-cols-2 gap-5">
            {[1, 2].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-white border border-amber-100/60 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && mockTests.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-5">
            {mockTests.map((rawMock, index) => {
              const test = toCardModel(rawMock, index)
              return (
                <div
                  key={test.id}
                  className="relative bg-white rounded-2xl p-6 shadow-card hover:shadow-card-lg transition-shadow border border-amber-100/60 text-left"
                >
                  {test.live && (
                    <span className="absolute -top-2 right-4 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-bold text-slate-900 shadow-card-lg tracking-wide">
                      LIVE
                    </span>
                  )}

                  <div className="flex gap-4 mb-4">
                    <img
                      src={subjectArt[test.subjects[0]]}
                      alt={`${test.subjects[0]} subject`}
                      className="h-16 w-16 shrink-0 rounded-full object-cover shadow-card ring-4 ring-white"
                    />
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-bold text-slate-900 mb-1 truncate pr-6">{test.title}</h3>
                      <p className="text-2xl font-bold text-indigo-600">{test.price}</p>
                      {test.free && <p className="text-xs text-slate-500">Free for Subscribers</p>}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
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
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-sm text-slate-600 mb-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
                      {test.questions} Questions
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock3 className="h-4 w-4 text-indigo-400 shrink-0" />
                      {test.duration} Min
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <CalendarDays className="h-4 w-4 text-indigo-400 shrink-0" />
                      {test.date}
                    </div>
                    {test.live && (
                      <p className="text-amber-600 col-span-2 font-semibold text-xs">
                        • LIVE NOW — Mock window is open
                      </p>
                    )}
                    <p className="text-slate-400 col-span-2 text-xs">
                      Leaderboard available after the mock window closes.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <button
                      onClick={() => registerForMock(test)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-full text-sm transition-colors shadow-btn flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>
                        {test.free
                          ? 'Register Free'
                          : test.registeredChildIds.length > 0
                          ? 'Register'
                          : test.live
                          ? 'Pay & Register'
                          : 'Register'}
                      </span>
                    </button>
                    <button
                      onClick={() => handleLeaderboardClick(test)}
                      className="w-full bg-white hover:bg-indigo-50 text-indigo-600 font-bold py-3 rounded-full text-sm transition-colors border-2 border-indigo-200 hover:border-indigo-300 flex items-center justify-center gap-2"
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>Leaderboard</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!isLoading && mockTests.length === 0 && (
          <div className="text-center">
            <img
              src="/no-mocks.png"
              alt="No upcoming mock tests"
              className="w-full rounded-2xl border border-amber-100/60 shadow-card mb-4"
            />
            <p className="text-slate-500 text-sm">
              {activeTab === 'purchased'
                ? "You haven't purchased any mocks yet."
                : 'No upcoming mocks right now — check back soon.'}
            </p>
          </div>
        )}

        {/* Leaderboard Unavailable Modal */}
        {showLeaderboardUnavailable && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 shadow-2xl border border-slate-100 text-center max-w-sm w-full">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-pastel-lavender p-3">
                  <BarChart3 className="h-7 w-7 text-pastel-lavender-ink" />
                </div>
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 mb-2">Not available yet</h3>
              <p className="text-slate-500 text-sm mb-6">
                Leaderboard rankings are published after the mock test window closes.
              </p>
              <button
                onClick={() => setShowLeaderboardUnavailable(false)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-full transition-colors shadow-btn"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MockTestsPage
