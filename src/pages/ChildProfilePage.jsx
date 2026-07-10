import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore.jsx'
import { ChevronLeft, Loader2, Star, Target, TrendingUp } from 'lucide-react'

const pastelCycle = [
  { bg: 'bg-pastel-pink', ink: 'text-pastel-pink-ink' },
  { bg: 'bg-pastel-lavender', ink: 'text-pastel-lavender-ink' },
  { bg: 'bg-pastel-mint', ink: 'text-pastel-mint-ink' },
  { bg: 'bg-pastel-yellow', ink: 'text-pastel-yellow-ink' },
]

function ChildProfilePage() {
  const navigate = useNavigate()
  const { api, user } = useAppStore()
  const [performance, setPerformance] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isCancelled = false

    async function loadPerformance() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const response = await api.quiz.childPerformance({ childID: user?.childID })
        if (!isCancelled) {
          setPerformance(response.performance || null)
          setSubjects(response.subjects || [])
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(error.message || 'Unable to load progress right now.')
        }
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    loadPerformance()
    return () => { isCancelled = true }
  }, [api.quiz, user?.childID])

  const totalPoints = performance?.totalPoints ?? performance?.total_points ?? 0
  const accuracy = performance?.accuracy ?? 0
  const completedQuizzes = performance?.completedQuizzes ?? performance?.completed_quizzes ?? 0

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
        <h1 className="font-display text-xl font-bold text-slate-900">My Progress</h1>
        <div className="w-10" />
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 text-center">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && (
          <>
            {/* Overall stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-4 shadow-card border border-amber-100/60 flex flex-col items-center text-center">
                <div className="h-10 w-10 rounded-full bg-pastel-yellow flex items-center justify-center mb-2">
                  <Star className="h-5 w-5 text-pastel-yellow-ink" />
                </div>
                <p className="font-display text-2xl font-bold text-slate-900">{totalPoints}</p>
                <p className="text-xs text-slate-400 mt-1">Total Points</p>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-card border border-amber-100/60 flex flex-col items-center text-center">
                <div className="h-10 w-10 rounded-full bg-pastel-mint flex items-center justify-center mb-2">
                  <Target className="h-5 w-5 text-pastel-mint-ink" />
                </div>
                <p className="font-display text-2xl font-bold text-slate-900">{accuracy}%</p>
                <p className="text-xs text-slate-400 mt-1">Accuracy</p>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-card border border-amber-100/60 flex flex-col items-center text-center">
                <div className="h-10 w-10 rounded-full bg-pastel-lavender flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-pastel-lavender-ink" />
                </div>
                <p className="font-display text-2xl font-bold text-slate-900">{completedQuizzes}</p>
                <p className="text-xs text-slate-400 mt-1">Quizzes Done</p>
              </div>
            </div>

            {/* Per-subject breakdown */}
            <h2 className="font-display text-xl font-bold text-slate-900 mb-4">By Subject</h2>

            {subjects.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 shadow-card border border-amber-100/60 text-center">
                <p className="text-slate-500 text-sm">
                  No quizzes attempted yet — start practicing to see your progress here.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {subjects.map((subject, i) => {
                  const palette = pastelCycle[i % pastelCycle.length]
                  const name = subject.subject || subject.name || `Subject ${i + 1}`
                  const subjectAccuracy = subject.accuracy ?? 0
                  const attempts = subject.completedQuizzes ?? subject.attempts ?? subject.quizAttempts ?? 0

                  return (
                    <div key={name} className={`rounded-2xl p-5 shadow-card ${palette.bg}`}>
                      <p className="font-display font-bold text-slate-900 mb-1">{name}</p>
                      <p className={`text-sm ${palette.ink} opacity-80 mb-3`}>{attempts} quizzes attempted</p>
                      <div className="h-2 rounded-full bg-white/60 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-white"
                          style={{ width: `${Math.min(100, Math.max(0, subjectAccuracy))}%` }}
                        />
                      </div>
                      <p className={`mt-1.5 text-xs font-semibold ${palette.ink}`}>{subjectAccuracy}% accuracy</p>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default ChildProfilePage
