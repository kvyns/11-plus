import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useAppStore } from '../store/appStore.jsx'
import { Loader2 } from 'lucide-react'
import ParentLayout from '../components/dashboard/ParentLayout.jsx'
import PerformanceStatsRow from '../components/performance/PerformanceStatsRow.jsx'
import SubjectBreakdownGrid from '../components/performance/SubjectBreakdownGrid.jsx'
import { fetchAllQuizHistory, quizCountsBySubject } from '../lib/childHelpers.js'

function ChildPerformancePage() {
  const { childID } = useParams()
  const location = useLocation()
  const { api } = useAppStore()
  const childName = location.state?.childName || 'this child'
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
        const response = await api.quiz.childPerformance({ childID })
        if (isCancelled) return
        const rawSubjects = response.subjects || []
        setPerformance(response.performance || null)
        setSubjects(rawSubjects)

        try {
          const history = await fetchAllQuizHistory(api, childID)
          if (isCancelled) return
          const counts = quizCountsBySubject(history)
          setSubjects(rawSubjects.map((s) => ({ ...s, quizCount: counts[s.subject] ?? 0 })))
        } catch {
          // Subject-wise counts are a nice-to-have on top of the core performance
          // data already rendered above — don't fail the whole page for this.
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(error.message || 'Unable to load performance right now.')
        }
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    loadPerformance()
    return () => { isCancelled = true }
  }, [api.quiz, childID])

  const totalCorrect = performance?.totalCorrect ?? 0
  const accuracy = performance?.accuracy ?? 0
  const totalQuizzes = performance?.totalQuizzes ?? 0

  return (
    <ParentLayout title={`${childName}'s Performance`} activePage="dashboard">
      <div className="max-w-4xl mx-auto">
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
            <PerformanceStatsRow
              totalCorrect={totalCorrect}
              accuracy={accuracy}
              totalQuizzes={totalQuizzes}
            />

            <h2 className="font-display text-xl font-bold text-slate-900 mb-4">By Subject</h2>
            <SubjectBreakdownGrid
              subjects={subjects}
              emptyMessage={`${childName} hasn't attempted any quizzes yet.`}
            />
          </>
        )}
      </div>
    </ParentLayout>
  )
}

export default ChildPerformancePage
