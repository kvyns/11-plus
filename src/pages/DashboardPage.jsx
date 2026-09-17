import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore.jsx'
import { useToast } from '../store/toastStore.jsx'
import { AlertTriangle, ClipboardCheck, Loader2, Target } from 'lucide-react'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import { childName } from '../lib/childHelpers.js'
import ParentLayout from '../components/dashboard/ParentLayout.jsx'
import ChildrenList from '../components/dashboard/ChildrenList.jsx'
import EmptyChildrenState from '../components/dashboard/EmptyChildrenState.jsx'

const subjectCards = [
  { title: 'English', image: '/english.jpeg', pastel: 'bg-pastel-pink' },
  { title: 'Maths', image: '/maths.jpeg', pastel: 'bg-pastel-lavender' },
  { title: 'Verbal', image: '/verbal.jpeg', pastel: 'bg-pastel-mint' },
  { title: 'Non-Verbal', image: '/non-verbal.jpeg', pastel: 'bg-pastel-yellow' },
]

function DashboardPage() {
  const navigate = useNavigate()
  const { user, api } = useAppStore()
  const toast = useToast()
  const [children, setChildren] = useState([])
  const [isLoadingChildren, setIsLoadingChildren] = useState(true)
  const [performanceByChildId, setPerformanceByChildId] = useState({})
  const [isLoadingPerformance, setIsLoadingPerformance] = useState(false)
  const [removeConfirmChild, setRemoveConfirmChild] = useState(null)
  const [isRemoving, setIsRemoving] = useState(false)
  const [removeError, setRemoveError] = useState('')

  const loadChildren = async () => {
    setIsLoadingChildren(true)
    try {
      const response = await api.quiz.parentDashboard()
      const list = response.children || response.result?.children || response.data?.children || []
      setChildren(list)
      loadPerformanceForChildren(list)
    } catch {
      setChildren([])
    } finally {
      setIsLoadingChildren(false)
    }
  }

  const loadPerformanceForChildren = async (list) => {
    if (list.length === 0) return
    setIsLoadingPerformance(true)
    try {
      const results = await Promise.allSettled(
        list.map((child) => api.quiz.childPerformance({ childID: child.childID || child.id }))
      )
      const map = {}
      list.forEach((child, i) => {
        const childId = child.childID || child.id || i
        const result = results[i]
        if (result.status === 'fulfilled') {
          map[childId] = result.value.performance || null
        }
      })
      setPerformanceByChildId(map)
    } finally {
      setIsLoadingPerformance(false)
    }
  }

  useEffect(() => {
    loadChildren()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api.quiz])

  const aggregateStats = useMemo(() => {
    const performances = Object.values(performanceByChildId).filter(Boolean)
    const withActivity = performances.filter((p) => (p.totalQuizzes ?? 0) > 0)
    const avgAccuracy = withActivity.length
      ? Math.round(withActivity.reduce((sum, p) => sum + (p.accuracy ?? 0), 0) / withActivity.length)
      : null
    const testsCompleted = performances.reduce((sum, p) => sum + (p.totalQuizzes ?? 0), 0)
    return { avgAccuracy, testsCompleted }
  }, [performanceByChildId])

  const openChangePassword = (child) => {
    navigate(`/change-child-password/${child.childID || child.id}`, {
      state: { childName: childName(child, 0), childUsername: child.username },
    })
  }

  const openEditProfile = (child) => {
    navigate(`/edit-child/${child.childID || child.id}`, { state: { child } })
  }

  const confirmRemoveChild = async () => {
    if (!removeConfirmChild) return
    setIsRemoving(true)
    setRemoveError('')
    try {
      const removedName = childName(removeConfirmChild, 0)
      await api.child.removeChild({
        userID: user?.email,
        childID: removeConfirmChild.childID || removeConfirmChild.id,
      })
      setRemoveConfirmChild(null)
      await loadChildren()
      toast.success(`${removedName}'s profile was removed.`)
    } catch (error) {
      const message = error.message || 'Unable to remove this child right now.'
      setRemoveError(message)
      toast.error(message)
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <ParentLayout title="Parent Dashboard" activePage="dashboard">
      {!isLoadingChildren && children.length > 0 && (
        <div className="max-w-4xl mx-auto grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl bg-white p-4 shadow-card border border-amber-100/60 flex flex-col items-center text-center">
            <div className="h-10 w-10 rounded-full bg-pastel-mint flex items-center justify-center mb-2">
              <Target className="h-5 w-5 text-pastel-mint-ink" />
            </div>
            <p className="font-display text-2xl font-bold text-slate-900">
              {isLoadingPerformance ? '—' : aggregateStats.avgAccuracy === null ? '—' : `${aggregateStats.avgAccuracy}%`}
            </p>
            <p className="text-xs text-slate-500 mt-1">Avg. Accuracy All Children</p>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-card border border-amber-100/60 flex flex-col items-center text-center">
            <div className="h-10 w-10 rounded-full bg-pastel-lavender flex items-center justify-center mb-2">
              <ClipboardCheck className="h-5 w-5 text-pastel-lavender-ink" />
            </div>
            <p className="font-display text-2xl font-bold text-slate-900">
              {isLoadingPerformance ? '—' : aggregateStats.testsCompleted}
            </p>
            <p className="text-xs text-slate-500 mt-1">Tests Completed</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-white rounded-[2rem] p-6 md:p-8 shadow-card-xl border border-amber-100/60 text-center">
        {isLoadingChildren ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : children.length > 0 ? (
          <ChildrenList
            childList={children}
            onAddAnother={() => navigate('/add-child')}
            onEditProfile={openEditProfile}
            onChangePassword={openChangePassword}
            onRemoveClick={setRemoveConfirmChild}
            onViewPerformance={(child) =>
              navigate(`/child-performance/${child.childID || child.id}`, {
                state: { childName: childName(child, 0) },
              })
            }
            performanceByChildId={performanceByChildId}
            loadingPerformance={isLoadingPerformance}
          />
        ) : (
          <EmptyChildrenState onAddChild={() => navigate('/add-child')} />
        )}

        {/* Subjects */}
        <div className="mt-10">
          <h3 className="font-display text-xl font-bold text-slate-900 mb-4 text-left">
            Subjects
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {subjectCards.map((subject) => (
              <button
                key={subject.title}
                className={`group rounded-2xl p-3 pt-3 shadow-card transition-shadow hover:shadow-card-lg text-left ${subject.pastel}`}
              >
                <img
                  src={subject.image}
                  alt={subject.title}
                  className="aspect-square w-full rounded-2xl object-cover shadow-card ring-4 ring-white transition-transform duration-300 group-hover:-translate-y-1"
                />
                <p className="mt-3 text-sm font-display font-bold text-slate-900 text-center">
                  {subject.title}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Progress / Mocks */}
        <div className="mt-8 space-y-4">
          <img
            src="/no-progress-yet.png"
            alt="No progress yet"
            className="w-full rounded-2xl shadow-card"
          />
          <img
            src="/no-mocks.png"
            alt="No upcoming mock test"
            className="w-full rounded-2xl shadow-card"
          />
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(removeConfirmChild)}
        icon={AlertTriangle}
        title="Remove child?"
        message={
          removeConfirmChild && (
            <>
              This will permanently remove{' '}
              <span className="font-semibold text-slate-700">{childName(removeConfirmChild, 0)}</span>'s
              profile and all of their progress. This action cannot be undone.
            </>
          )
        }
        error={removeError}
        confirmLabel={isRemoving ? 'Removing...' : 'Remove'}
        isLoading={isRemoving}
        onConfirm={confirmRemoveChild}
        onCancel={() => {
          setRemoveConfirmChild(null)
          setRemoveError('')
        }}
      />
    </ParentLayout>
  )
}

export default DashboardPage
