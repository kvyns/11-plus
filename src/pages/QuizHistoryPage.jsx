import { useEffect, useState } from 'react'
import { BookOpen, ChevronDown, Loader2, Target } from 'lucide-react'
import { useAppStore } from '../store/appStore.jsx'
import { useToast } from '../store/toastStore.jsx'
import ChildLayout from '../components/child/ChildLayout.jsx'

const subjectOptions = [
  { value: '', label: 'All Subjects' },
  { value: 'ENGLISH', label: 'English' },
  { value: 'MATHS', label: 'Maths' },
  { value: 'VERBAL', label: 'Verbal' },
  { value: 'NON_VERBAL', label: 'Non-Verbal' },
]

const dateOptions = [
  { value: 'ALL_TIME', label: 'All Time' },
  { value: 'TODAY', label: 'Today' },
  { value: 'THIS_WEEK', label: 'This Week' },
  { value: 'THIS_MONTH', label: 'This Month' },
]

function QuizHistoryPage() {
  const { api, user } = useAppStore()
  const toast = useToast()
  const [subject, setSubject] = useState('')
  const [dateFilter, setDateFilter] = useState('ALL_TIME')
  const [quizzes, setQuizzes] = useState([])
  const [nextPageKey, setNextPageKey] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  useEffect(() => {
    let isCancelled = false

    async function loadHistory() {
      setIsLoading(true)
      try {
        const response = await api.quiz.quizHistory({
          childID: user?.childID,
          subject: subject || null,
          dateFilter,
        })
        if (!isCancelled) {
          setQuizzes(response.quizzes || [])
          setNextPageKey(response.nextPageKey || null)
        }
      } catch (error) {
        if (!isCancelled) {
          setQuizzes([])
          toast.error(error.message || 'Unable to load quiz history right now.')
        }
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    loadHistory()
    return () => { isCancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api.quiz, user?.childID, subject, dateFilter])

  const loadMore = async () => {
    if (!nextPageKey) return
    setIsLoadingMore(true)
    try {
      const response = await api.quiz.quizHistory({
        childID: user?.childID,
        subject: subject || null,
        dateFilter,
        lastKey: nextPageKey,
      })
      setQuizzes((prev) => [...prev, ...(response.quizzes || [])])
      setNextPageKey(response.nextPageKey || null)
    } catch (error) {
      toast.error(error.message || 'Unable to load more history right now.')
    } finally {
      setIsLoadingMore(false)
    }
  }

  return (
    <ChildLayout title="Quiz History" activePage="quiz-history">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-4 shadow-card border border-amber-100/60 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full appearance-none rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-2.5 pr-9 text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none"
            >
              {subjectOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative flex-1">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full appearance-none rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-2.5 pr-9 text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none"
            >
              {dateOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : quizzes.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-card border border-amber-100/60 text-center">
            <p className="text-slate-500 text-sm">No quizzes found for this filter.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {quizzes.map((quiz, i) => {
                const title = quiz.quizTitle || quiz.subject || 'Quiz'
                const score = quiz.latestScore ?? quiz.averageScore ?? 0
                const attempts = quiz.quizAttempts ?? 0
                const date = quiz.completedAt || quiz.createdAt || ''
                return (
                  <div
                    key={quiz.quizID || i}
                    className="bg-white rounded-2xl p-4 shadow-card border border-amber-100/60 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-pastel-lavender flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-pastel-lavender-ink" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display font-bold text-slate-900 truncate">{title}</p>
                        {quiz.category && (
                          <p className="text-xs text-slate-500 truncate">{quiz.category}{quiz.topic ? ` · ${quiz.topic}` : ''}</p>
                        )}
                        {date && <p className="text-xs text-slate-400 mt-0.5">{new Date(date).toLocaleDateString()}</p>}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="flex items-center justify-end gap-1 font-display font-bold text-slate-900">
                        <Target className="h-4 w-4 text-indigo-500" />
                        {score}%
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{attempts} attempt{attempts === 1 ? '' : 's'}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {nextPageKey && (
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-full border-2 border-indigo-200 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-60"
              >
                {isLoadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoadingMore ? 'Loading...' : 'Load More'}
              </button>
            )}
          </>
        )}
      </div>
    </ChildLayout>
  )
}

export default QuizHistoryPage
