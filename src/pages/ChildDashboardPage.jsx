import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore.jsx'
import { useToast } from '../store/toastStore.jsx'
import { CheckCircle2, FileQuestion, BookOpen, BarChart3, Loader2, Sparkles, Target } from 'lucide-react'
import ChildLayout from '../components/child/ChildLayout.jsx'

const subjectCards = [
  { title: 'English', image: '/english.jpeg', pastel: 'bg-pastel-pink', subject: 'ENGLISH' },
  { title: 'Maths', image: '/maths.jpeg', pastel: 'bg-pastel-lavender', subject: 'MATHS' },
  { title: 'Verbal', image: '/verbal.jpeg', pastel: 'bg-pastel-mint', subject: 'VERBAL' },
  { title: 'Non-Verbal', image: '/non-verbal.jpeg', pastel: 'bg-pastel-yellow', subject: 'NON_VERBAL' },
]

function ChildDashboardPage() {
  const navigate = useNavigate()
  const { api, user } = useAppStore()
  const toast = useToast()
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isCancelled = false

    async function loadDashboard() {
      setIsLoading(true)
      try {
        const data = await api.quiz.childDashboard()
        if (!isCancelled) {
          setDashboardData(data.result || data.data || data)
        }
      } catch (error) {
        if (!isCancelled) {
          setDashboardData(null)
          toast.error(error.message || 'Unable to load your dashboard right now.')
        }
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    loadDashboard()
    return () => { isCancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api.quiz])

  const handleSubjectClick = (subject) => {
    navigate(`/child-mocks?subject=${subject}`)
  }

  const handleStartFreeQuiz = (card) => {
    navigate(`/quiz/${card.subject}`, {
      state: { quizType: 'FREE_QUIZ', title: `${card.title} Free Quiz` },
    })
  }


  const performance = dashboardData?.performance || {}
  const accuracy = performance.accuracy ?? 0
  const totalCorrect = performance.totalCorrect ?? 0
  const totalQuestions = performance.totalQuestions ?? 0
  const subjects = dashboardData?.subjects || []
  const child = dashboardData?.child || {}
  const childName = child.name || user?.firstName || user?.childName || user?.name || user?.username || 'Champion'
  const subjectMeta = (subjectKey) => subjects.find((s) => s.subject === subjectKey) || {}

  return (
    <ChildLayout title="11+ Learning" activePage="child-dashboard" childName={childName}>
      <div className="max-w-5xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <>
            {/* Welcome */}
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl font-bold text-slate-900 mb-1">
                Hey, {childName}! 👋
              </h2>
              <p className="text-slate-500">Ready for your next challenge?</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-pastel-mint rounded-2xl p-4 shadow-card flex flex-col items-center text-center">
                <div className="h-10 w-10 rounded-full bg-white/70 flex items-center justify-center mb-2">
                  <Target className="h-5 w-5 text-pastel-mint-ink" />
                </div>
                <p className="font-display text-2xl font-bold text-slate-900">{accuracy}%</p>
                <p className="text-xs text-pastel-mint-ink opacity-80 mt-1">Accuracy</p>
              </div>

              <div className="bg-pastel-lavender rounded-2xl p-4 shadow-card flex flex-col items-center text-center">
                <div className="h-10 w-10 rounded-full bg-white/70 flex items-center justify-center mb-2">
                  <CheckCircle2 className="h-5 w-5 text-pastel-lavender-ink" />
                </div>
                <p className="font-display text-2xl font-bold text-slate-900">{totalCorrect}</p>
                <p className="text-xs text-pastel-lavender-ink opacity-80 mt-1">Correct Answers</p>
              </div>

              <div className="bg-pastel-pink rounded-2xl p-4 shadow-card flex flex-col items-center text-center">
                <div className="h-10 w-10 rounded-full bg-white/70 flex items-center justify-center mb-2">
                  <FileQuestion className="h-5 w-5 text-pastel-pink-ink" />
                </div>
                <p className="font-display text-2xl font-bold text-slate-900">{totalQuestions}</p>
                <p className="text-xs text-pastel-pink-ink opacity-80 mt-1">Questions Answered</p>
              </div>
            </div>

            {/* Subject Cards */}
            <h3 className="font-display text-xl font-bold text-slate-900 mb-4">Choose a Subject</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {subjectCards.map((card) => {
                const meta = subjectMeta(card.subject)
                return (
                <div
                  key={card.subject}
                  className={`group rounded-2xl p-3 shadow-card transition-shadow hover:shadow-card-lg text-left ${card.pastel}`}
                >
                  <button onClick={() => handleSubjectClick(card.subject)} className="w-full text-left">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="aspect-square w-full rounded-2xl object-cover shadow-card ring-4 ring-white transition-transform duration-300 group-hover:-translate-y-1"
                    />
                    <p className="mt-3 text-sm font-display font-bold text-slate-900 text-center">{card.title}</p>
                    {meta.accuracy != null && (
                      <p className="text-xs text-slate-500 text-center mt-0.5">{meta.accuracy}% accuracy</p>
                    )}
                  </button>
                  {meta.freeQuizUsed ? (
                    <p className="mt-2 text-center text-xs font-semibold text-slate-400 bg-white/70 rounded-full py-1.5">
                      Free Test Used
                    </p>
                  ) : (
                    <button
                      onClick={() => handleStartFreeQuiz(card)}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-full bg-white/80 py-1.5 text-xs font-semibold text-slate-900 hover:bg-white transition-colors"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      Start Free Quiz
                    </button>
                  )}
                </div>
                )
              })}
            </div>

            {/* Quick Actions */}
            <h3 className="font-display text-xl font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/child-mocks')}
                className="bg-indigo-600 text-white rounded-2xl p-5 shadow-btn hover:bg-indigo-700 transition-colors flex items-center gap-4"
              >
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-display font-bold text-lg">Take a Mock Test</p>
                  <p className="text-white/80 text-sm">Practice with timed tests</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/child-profile')}
                className="bg-amber-500 text-white rounded-2xl p-5 shadow-lg shadow-amber-500/30 hover:bg-amber-600 transition-colors flex items-center gap-4"
              >
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-display font-bold text-lg">View Progress</p>
                  <p className="text-white/80 text-sm">See how you're improving</p>
                </div>
              </button>
            </div>
          </>
        )}
      </div>
    </ChildLayout>
  )
}

export default ChildDashboardPage
