import { useEffect, useMemo, useState } from 'react'
import { BarChart3, BookOpen, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore.jsx'
import { useToast } from '../store/toastStore.jsx'
import { isMockLive, formatDateRange } from '../lib/mockHelpers.js'
import ChildLayout from '../components/child/ChildLayout.jsx'
import MockCard from '../components/mock/MockCard.jsx'
import LeaderboardUnavailableModal from '../components/mock/LeaderboardUnavailableModal.jsx'
import LeaderboardModal from '../components/mock/LeaderboardModal.jsx'

function ChildMockTestsPage() {
  const navigate = useNavigate()
  const { api } = useAppStore()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('upcoming')
  const [mockTests, setMockTests] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showLeaderboardUnavailable, setShowLeaderboardUnavailable] = useState(false)
  const [leaderboardData, setLeaderboardData] = useState(null)

  const selectedStatus = useMemo(() => (activeTab === 'appeared' ? 'appeared' : 'upcoming'), [activeTab])

  useEffect(() => {
    let isCancelled = false

    async function loadMocks() {
      setIsLoading(true)

      try {
        const response = await api.mock.listMocks(selectedStatus)
        const mocks = response.mocks || response.result?.mocks || response.data?.mocks || []
        if (!isCancelled) {
          setMockTests(mocks)
        }
      } catch (error) {
        if (!isCancelled) {
          setMockTests([])
          toast.error(error.message || 'Unable to load mock tests right now.')
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    loadMocks()
    return () => { isCancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api.mock, selectedStatus])

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
    <ChildLayout title="Mock Tests" activePage="child-mocks">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-card border border-amber-100/60 mb-6">
          <p className="text-slate-600 text-center mb-6">
            Take on a mock test and see how you rank against everyone else.
          </p>

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
                Completed
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
                <MockCard
                  key={test.id}
                  title={test.title}
                  subjectKey={test.subjects[0]}
                  live={test.live && !test.appeared}
                  questions={test.questions}
                  duration={test.duration}
                  date={test.date}
                  level={test.level}
                  headerExtra={
                    test.appeared ? (
                      <p className="text-2xl font-bold text-indigo-600">
                        {test.correct ?? 0}/{test.totalQuestions ?? test.questions}{' '}
                        <span className="text-base font-semibold text-slate-500">({test.accuracy ?? 0}%)</span>
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
                    )
                  }
                  actions={
                    <>
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
                    </>
                  }
                />
              )
            })}
          </div>
        )}

        {!isLoading && mockTests.length === 0 && (
          <div className="text-center">
            <img src="/no-mocks.png" alt="No mock tests" className="w-full rounded-2xl border border-amber-100/60 mb-4" />
            <p className="text-slate-500 text-sm">
              {activeTab === 'appeared'
                ? "You haven't completed any mocks yet."
                : 'No upcoming mocks right now — check back soon.'}
            </p>
          </div>
        )}

        {leaderboardData && (
          <LeaderboardModal data={leaderboardData} onClose={() => setLeaderboardData(null)} />
        )}

        {showLeaderboardUnavailable && (
          <LeaderboardUnavailableModal onClose={() => setShowLeaderboardUnavailable(false)} />
        )}
      </div>
    </ChildLayout>
  )
}

export default ChildMockTestsPage
