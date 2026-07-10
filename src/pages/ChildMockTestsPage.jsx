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
  Play,
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

function ChildMockTestsPage() {
  const navigate = useNavigate()
  const { api } = useAppStore()
  const [activeTab, setActiveTab] = useState('upcoming')
  const [mockTests, setMockTests] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showLeaderboardUnavailable, setShowLeaderboardUnavailable] = useState(false)
  const [leaderboardData, setLeaderboardData] = useState(null)

  const selectedStatus = useMemo(() => (activeTab === 'appeared' ? 'appeared' : 'upcoming'), [activeTab])

  useEffect(() => {
    let isCancelled = false

    async function loadMocks() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const response = await api.mock.listMocks(selectedStatus)
        const mocks = response.mocks || response.result?.mocks || response.data?.mocks || []
        if (!isCancelled) {
          setMockTests(mocks)
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
    return () => { isCancelled = true }
  }, [api.mock, selectedStatus])

  const formatMockDate = (value) => {
    if (!value) return null
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value
    return parsed.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
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

    const appeared = activeTab === 'appeared'

    return {
      id: mock.mockID || mock.id || index + 1,
      mockID: mock.mockID || mock.id,
      title: mock.title || mock.mockTitle || `Mock Paper ${index + 1}`,
      subjects: mock.subjects || ['ENGLISH'],
      level,
      questions: mock.totalQuestions || mock.questions || 50,
      duration: mock.durationMins || mock.duration || 60,
      live: isMockLive(mock),
      date: formatDateRange(mock.startTime, mock.endTime) || mock.date || 'Schedule pending',
      appeared,
      score: mock.score,
      correct: mock.correct,
      totalQuestions: mock.totalQuestions,
      accuracy: mock.accuracy,
    }
  }

  const handleLeaderboardClick = async (test) => {
    try {
      const response = await api.mock.mockLeaderboard({ mockID: test.mockID || test.id })
      setLeaderboardData({
        title: test.title,
        top10: response.top10 || [],
        myRank: response.myRank || null,
      })
    } catch {
      setShowLeaderboardUnavailable(true)
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-cream/90 backdrop-blur-md border-b border-amber-100 py-4 px-6 flex items-center justify-between sticky top-0 z-30">
        <button
          onClick={() => navigate('/child-dashboard')}
          className="h-10 w-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="font-display text-xl font-bold text-slate-900">Mock Tests</h1>
        <div className="w-10" />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 md:px-6 md:py-8">
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-card border border-amber-100/60 mb-6">
          <p className="text-slate-600 text-center mb-6">
            Take on a mock test and see how you rank against everyone else.
          </p>

          {errorMessage && (
            <p className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {errorMessage}
            </p>
          )}

          <div className="flex justify-center">
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
                onClick={() => setActiveTab('appeared')}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
                  activeTab === 'appeared' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Appeared
              </button>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="grid sm:grid-cols-2 gap-5">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-white border border-amber-100/60 animate-pulse" />
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
                  className="relative bg-white rounded-2xl p-6 shadow-card border border-amber-100/60 text-left"
                >
                  {test.live && !test.appeared && (
                    <span className="absolute top-4 right-4 bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide">
                      LIVE
                    </span>
                  )}

                  <div className="flex gap-4 mb-4">
                    <img
                      src={subjectArt[test.subjects[0]]}
                      alt={`${test.subjects[0]} subject`}
                      className="h-16 w-16 shrink-0 rounded-xl object-cover border border-slate-100"
                    />
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-bold text-slate-900 mb-1 truncate pr-14">{test.title}</h3>
                      {test.appeared ? (
                        <p className="text-2xl font-bold text-indigo-600">
                          {test.correct ?? 0}/{test.totalQuestions ?? test.questions} <span className="text-base font-semibold text-slate-500">({test.accuracy ?? 0}%)</span>
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {test.subjects.map((subject) => (
                            <span key={subject} className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-semibold flex items-center gap-1">
                              <BookOpen className="h-3.5 w-3.5" />
                              <span>{subject}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
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
                    <div className="flex items-center gap-1.5 col-span-2">
                      <GraduationCap className="h-4 w-4 text-indigo-400 shrink-0" />
                      {test.level}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {test.appeared ? (
                      <button
                        onClick={() => navigate(`/child-mocks/${test.mockID}/result`, { state: { mockDetails: test } })}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-full text-sm transition-colors shadow-btn flex items-center justify-center gap-2"
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span>View Result</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/child-mocks/${test.mockID}`, { state: { mockDetails: test } })}
                        disabled={!test.live}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-full text-sm transition-colors shadow-btn flex items-center justify-center gap-2"
                      >
                        <Play className="h-4 w-4" />
                        <span>{test.live ? 'Start Mock' : 'Not Open Yet'}</span>
                      </button>
                    )}
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
            <img src="/no-mocks.png" alt="No mock tests" className="w-full rounded-2xl border border-amber-100/60 mb-4" />
            <p className="text-slate-500 text-sm">
              {activeTab === 'appeared'
                ? "You haven't attempted any mocks yet."
                : 'No upcoming mocks right now — check back soon.'}
            </p>
          </div>
        )}

        {leaderboardData && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 max-w-sm w-full max-h-[80vh] overflow-y-auto">
              <h3 className="font-display text-lg font-bold text-slate-900 mb-1">{leaderboardData.title}</h3>
              <p className="text-sm text-slate-500 mb-4">Leaderboard</p>

              {leaderboardData.myRank && (
                <div className="rounded-xl bg-pastel-lavender p-3 mb-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-pastel-lavender-ink">
                    Your rank: #{leaderboardData.myRank.rank}
                  </span>
                  <span className="text-sm font-bold text-pastel-lavender-ink">
                    {leaderboardData.myRank.correct}/{leaderboardData.myRank.totalQuestions}
                  </span>
                </div>
              )}

              <div className="space-y-2 mb-4">
                {leaderboardData.top10.map((entry) => (
                  <div key={entry.rank} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-600 shadow-card">
                        {entry.rank}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">{entry.childName}</span>
                    </div>
                    <span className="text-sm font-bold text-indigo-600">{entry.score}%</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setLeaderboardData(null)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-full transition-colors shadow-btn"
              >
                Close
              </button>
            </div>
          </div>
        )}

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

export default ChildMockTestsPage
