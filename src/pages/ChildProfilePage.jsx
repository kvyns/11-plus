import { useEffect, useState } from 'react'
import { useAppStore } from '../store/appStore.jsx'
import { useToast } from '../store/toastStore.jsx'
import { Loader2 } from 'lucide-react'
import ChildLayout from '../components/child/ChildLayout.jsx'
import PerformanceStatsRow from '../components/performance/PerformanceStatsRow.jsx'
import SubjectBreakdownGrid from '../components/performance/SubjectBreakdownGrid.jsx'
import { fetchAllQuizHistory, quizCountsBySubject } from '../lib/childHelpers.js'

function ChildProfilePage() {
  const { api, user } = useAppStore()
  const toast = useToast()
  const [performance, setPerformance] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let isCancelled = false

    async function loadPerformance() {
      setIsLoading(true)
      setHasError(false)

      try {
        const response = await api.quiz.childPerformance({ childID: user?.childID })
        if (isCancelled) return
        const rawSubjects = response.subjects || []
        setPerformance(response.performance || null)
        setSubjects(rawSubjects)

        try {
          const history = await fetchAllQuizHistory(api, user?.childID)
          if (isCancelled) return
          const counts = quizCountsBySubject(history)
          setSubjects(rawSubjects.map((s) => ({ ...s, quizCount: counts[s.subject] ?? 0 })))
        } catch {
          // Subject-wise counts are a nice-to-have on top of the core performance
          // data already rendered above — don't fail the whole page for this.
        }
      } catch (error) {
        if (!isCancelled) {
          setHasError(true)
          toast.error(error.message || 'Unable to load progress right now.')
        }
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    loadPerformance()
    return () => { isCancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api.quiz, user?.childID])

  const totalCorrect = performance?.totalCorrect ?? 0
  const accuracy = performance?.accuracy ?? 0
  const totalQuizzes = performance?.totalQuizzes ?? 0

  return (
    <ChildLayout title="My Progress" activePage="child-profile">
      <div className="max-w-4xl mx-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        )}

        {!isLoading && !hasError && (
          <>
            <PerformanceStatsRow
              totalCorrect={totalCorrect}
              accuracy={accuracy}
              totalQuizzes={totalQuizzes}
            />

            <h2 className="font-display text-xl font-bold text-slate-900 mb-4">By Subject</h2>
            <SubjectBreakdownGrid
              subjects={subjects}
              emptyMessage="No quizzes attempted yet — start practicing to see your progress here."
            />
          </>
        )}
      </div>
    </ChildLayout>
  )
}

export default ChildProfilePage
