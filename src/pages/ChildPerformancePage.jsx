import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useAppStore } from '../store/appStore.jsx'
import { Loader2 } from 'lucide-react'
import ParentLayout from '../components/dashboard/ParentLayout.jsx'
import PerformanceStatsRow from '../components/performance/PerformanceStatsRow.jsx'
import SubjectBreakdownGrid from '../components/performance/SubjectBreakdownGrid.jsx'

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
        if (!isCancelled) {
          setPerformance(response.performance || null)
          setSubjects(response.subjects || [])
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

  const totalPoints = performance?.totalPoints ?? performance?.total_points ?? 0
  const accuracy = performance?.accuracy ?? 0
  const completedQuizzes = performance?.completedQuizzes ?? performance?.completed_quizzes ?? 0

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
              totalPoints={totalPoints}
              accuracy={accuracy}
              completedQuizzes={completedQuizzes}
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
