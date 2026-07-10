import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore.jsx'
import { Trophy, Clock3, Star, BookOpen, BarChart3, LogOut, Menu, X, Loader2 } from 'lucide-react'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'

const subjectCards = [
  { title: 'English', image: '/english.jpeg', pastel: 'bg-pastel-pink', subject: 'ENGLISH' },
  { title: 'Maths', image: '/maths.jpeg', pastel: 'bg-pastel-lavender', subject: 'MATHS' },
  { title: 'Verbal', image: '/verbal.jpeg', pastel: 'bg-pastel-mint', subject: 'VERBAL' },
  { title: 'Non-Verbal', image: '/non-verbal.jpeg', pastel: 'bg-pastel-yellow', subject: 'NON_VERBAL' },
]

const menuItems = [
  { Icon: BookOpen, label: 'Home', path: '/child-dashboard' },
  { Icon: BarChart3, label: 'My Progress', path: '/child-profile' },
]

function ChildDashboardPage() {
  const navigate = useNavigate()
  const { api, user, logout } = useAppStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    let isCancelled = false

    async function loadDashboard() {
      setIsLoading(true)
      try {
        const data = await api.quiz.childDashboard()
        if (!isCancelled) {
          setDashboardData(data.result || data.data || data)
        }
      } catch {
        if (!isCancelled) {
          setDashboardData(null)
        }
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    loadDashboard()
    return () => { isCancelled = true }
  }, [api.quiz])

  const handleLogout = () => {
    setSidebarOpen(false)
    setShowLogoutConfirm(true)
  }

  const confirmLogout = () => {
    setShowLogoutConfirm(false)
    logout()
    navigate('/child-login')
  }

  const handleMenuClick = (path) => {
    navigate(path)
    setSidebarOpen(false)
  }

  const handleSubjectClick = (subject) => {
    navigate(`/child-mocks?subject=${subject}`)
  }

  const performance = dashboardData?.performance || {}
  const totalPoints = performance.totalPoints ?? dashboardData?.totalPoints ?? dashboardData?.total_points ?? 0
  const completedQuizzes = performance.completedQuizzes ?? dashboardData?.completedQuizzes ?? dashboardData?.completed_quizzes ?? 0
  const accuracy = performance.accuracy ?? dashboardData?.accuracy ?? 0
  const streak = performance.streak ?? dashboardData?.streak ?? 0
  const child = dashboardData?.child || {}
  const childName = child.firstName || user?.firstName || user?.childName || user?.name || user?.username || 'Champion'

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-cream/90 backdrop-blur-md border-b border-amber-100 py-4 px-6 flex items-center justify-between sticky top-0 z-30">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="h-10 w-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors md:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-2">
          <img src="/11plus.png" alt="11+ Logo" className="h-9 w-9" />
          <h1 className="font-display text-xl font-bold text-slate-900 hidden sm:block">11+ Learning</h1>
        </div>

        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 h-screen w-72 bg-white border-r border-slate-100 transform transition-transform duration-300 z-40 pt-6 ${
            sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          } md:sticky md:top-0 md:translate-x-0 md:h-screen md:shadow-none md:pt-6`}
        >
          {/* Mobile close button */}
          <div className="flex items-center justify-between px-6 mb-4 md:hidden">
            <div className="flex items-center gap-2">
              <img src="/11plus.png" alt="11+ Logo" className="h-8 w-8" />
              <span className="font-display font-bold text-slate-900">11 Plus</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="h-9 w-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Child block */}
          <div className="px-6 pb-6 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-pastel-lavender text-pastel-lavender-ink font-bold flex items-center justify-center text-lg">
                {childName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-display font-semibold text-slate-900 truncate">{childName}</p>
                <p className="text-xs text-slate-500 truncate">Keep up the great work!</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1 px-4">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleMenuClick(item.path)}
                className="w-full text-left px-4 py-3 rounded-xl transition-colors font-semibold flex items-center gap-3 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
              >
                <item.Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 rounded-xl transition-colors font-semibold flex items-center gap-3 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              Logout
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8 min-w-0">
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-pastel-yellow rounded-2xl p-4 shadow-card flex flex-col items-center text-center">
                    <div className="h-10 w-10 rounded-full bg-white/70 flex items-center justify-center mb-2">
                      <Star className="h-5 w-5 text-pastel-yellow-ink" />
                    </div>
                    <p className="font-display text-2xl font-bold text-slate-900">{totalPoints}</p>
                    <p className="text-xs text-pastel-yellow-ink opacity-80 mt-1">Total Points</p>
                  </div>

                  <div className="bg-pastel-lavender rounded-2xl p-4 shadow-card flex flex-col items-center text-center">
                    <div className="h-10 w-10 rounded-full bg-white/70 flex items-center justify-center mb-2">
                      <Trophy className="h-5 w-5 text-pastel-lavender-ink" />
                    </div>
                    <p className="font-display text-2xl font-bold text-slate-900">{completedQuizzes}</p>
                    <p className="text-xs text-pastel-lavender-ink opacity-80 mt-1">Quizzes Done</p>
                  </div>

                  <div className="bg-pastel-mint rounded-2xl p-4 shadow-card flex flex-col items-center text-center">
                    <div className="h-10 w-10 rounded-full bg-white/70 flex items-center justify-center mb-2">
                      <BarChart3 className="h-5 w-5 text-pastel-mint-ink" />
                    </div>
                    <p className="font-display text-2xl font-bold text-slate-900">{accuracy}%</p>
                    <p className="text-xs text-pastel-mint-ink opacity-80 mt-1">Accuracy</p>
                  </div>

                  <div className="bg-pastel-pink rounded-2xl p-4 shadow-card flex flex-col items-center text-center">
                    <div className="h-10 w-10 rounded-full bg-white/70 flex items-center justify-center mb-2">
                      <Clock3 className="h-5 w-5 text-pastel-pink-ink" />
                    </div>
                    <p className="font-display text-2xl font-bold text-slate-900">{streak}</p>
                    <p className="text-xs text-pastel-pink-ink opacity-80 mt-1">Day Streak</p>
                  </div>
                </div>

                {/* Subject Cards */}
                <h3 className="font-display text-xl font-bold text-slate-900 mb-4">Choose a Subject</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {subjectCards.map((card) => (
                    <button
                      key={card.subject}
                      onClick={() => handleSubjectClick(card.subject)}
                      className={`group rounded-2xl p-3 shadow-card transition-shadow hover:shadow-card-lg text-left ${card.pastel}`}
                    >
                      <img
                        src={card.image}
                        alt={card.title}
                        className="aspect-square w-full rounded-2xl object-cover shadow-card ring-4 ring-white transition-transform duration-300 group-hover:-translate-y-1"
                      />
                      <p className="mt-3 text-sm font-display font-bold text-slate-900 text-center">{card.title}</p>
                    </button>
                  ))}
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
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <ConfirmDialog
        open={showLogoutConfirm}
        icon={LogOut}
        title="Log out?"
        message="You'll need to sign in again to keep practicing."
        confirmLabel="Log Out"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  )
}

export default ChildDashboardPage
