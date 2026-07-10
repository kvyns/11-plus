import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore.jsx'
import { useToast } from '../store/toastStore.jsx'
import {
  AlertTriangle,
  ClipboardList,
  Gift,
  Heart,
  House,
  KeyRound,
  Loader2,
  LogOut,
  Menu,
  MoreVertical,
  School,
  Star,
  UserCheck,
  UserMinus,
  UserPlus,
  UsersRound,
  X,
} from 'lucide-react'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import { buildMediaUrl } from '../services/api.js'

const subjectCards = [
  { title: 'English', image: '/english.jpeg', pastel: 'bg-pastel-pink' },
  { title: 'Maths', image: '/maths.jpeg', pastel: 'bg-pastel-lavender' },
  { title: 'Verbal', image: '/verbal.jpeg', pastel: 'bg-pastel-mint' },
  { title: 'Non-Verbal', image: '/non-verbal.jpeg', pastel: 'bg-pastel-yellow' },
]

function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout, api } = useAppStore()
  const toast = useToast()
  const profilePicKey = user?.profilePic || user?.profilePicKey || user?.imageKey || user?.image_key
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [children, setChildren] = useState([])
  const [isLoadingChildren, setIsLoadingChildren] = useState(true)
  const [menuChild, setMenuChild] = useState(null)
  const [removeConfirmChild, setRemoveConfirmChild] = useState(null)
  const [isRemoving, setIsRemoving] = useState(false)
  const [removeError, setRemoveError] = useState('')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const loadChildren = async () => {
    setIsLoadingChildren(true)
    try {
      const response = await api.quiz.parentDashboard()
      const list = response.children || response.result?.children || response.data?.children || []
      setChildren(list)
    } catch {
      setChildren([])
    } finally {
      setIsLoadingChildren(false)
    }
  }

  useEffect(() => {
    loadChildren()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api.quiz])

  const childName = (child, i) => child.firstName || child.name || child.username || `Child ${i + 1}`

  const openChangePassword = (child) => {
    setMenuChild(null)
    navigate(`/change-child-password/${child.childID || child.id}`, {
      state: { childName: childName(child, 0), childUsername: child.username },
    })
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

  const menuItems = [
    { Icon: House, label: 'Home', page: 'dashboard' },
    { Icon: UserCheck, label: 'Profile', page: 'profile' },
    { Icon: Gift, label: 'Subscription', page: 'subscription' },
    { Icon: ClipboardList, label: 'Mock Tests', page: 'mock-tests' },
    { Icon: School, label: 'Explore Schools', page: 'schools' },
    { Icon: Heart, label: 'Saved Schools', page: 'schools' },
    { Icon: UserPlus, label: 'Add Child', page: 'add-child' },
    { Icon: LogOut, label: 'Logout', page: 'logout' },
  ]

  const handleMenuClick = (page) => {
    if (page === 'logout') {
      setShowLogoutConfirm(true)
      setSidebarOpen(false)
      return
    }

    const pathMap = {
      dashboard: '/dashboard',
      profile: '/profile',
      subscription: '/subscription',
      'mock-tests': '/mock-tests',
      schools: '/schools',
      'add-child': '/add-child',
    }
    navigate(pathMap[page] || '/')
    setSidebarOpen(false)
  }

  const confirmLogout = () => {
    setShowLogoutConfirm(false)
    logout()
    navigate('/')
    toast.success('You have been logged out.')
  }

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
          <h1 className="font-display text-xl font-bold text-slate-900 hidden sm:block">
            Parent Dashboard
          </h1>
        </div>

        <button
          onClick={() => navigate('/profile')}
          className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-lg shadow-indigo-600/30 overflow-hidden"
        >
          {profilePicKey ? (
            <img src={buildMediaUrl(profilePicKey)} alt="Your profile" className="h-full w-full object-cover" />
          ) : (
            user?.firstName?.charAt(0) || 'K'
          )}
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
              <span className="font-bold text-slate-900">11 Plus</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="h-9 w-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Profile block */}
          <div className="px-6 pb-6 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-lg overflow-hidden">
                {profilePicKey ? (
                  <img src={buildMediaUrl(profilePicKey)} alt="Your profile" className="h-full w-full object-cover" />
                ) : (
                  user?.firstName?.charAt(0) || 'K'
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 truncate">
                  {user?.firstName || 'User'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          <nav className="space-y-1 px-4">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleMenuClick(item.page)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors font-semibold flex items-center gap-3 text-sm ${
                  item.page === 'logout'
                    ? 'text-red-600 hover:bg-red-50'
                    : item.page === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                <item.Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-4 py-6 md:px-8 md:py-8 min-w-0">
          <div className="max-w-4xl mx-auto bg-white rounded-[2rem] p-6 md:p-8 shadow-card-xl border border-amber-100/60 text-center">
            {isLoadingChildren ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              </div>
            ) : children.length > 0 ? (
              <div className="text-left mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl md:text-2xl font-bold text-slate-900">
                    Your Children
                  </h2>
                  <button
                    onClick={() => navigate('/add-child')}
                    className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    <UserPlus className="h-4 w-4" />
                    Add another
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {children.map((child, i) => {
                    const name = childName(child, i)
                    const initial = name.charAt(0).toUpperCase()

                    return (
                      <div
                        key={child.childID || child.id || i}
                        className="relative flex items-center gap-3 rounded-2xl bg-pastel-lavender p-4 shadow-card transition-shadow hover:shadow-card-lg"
                      >
                        <button
                          onClick={() => navigate('/mock-tests')}
                          className="flex flex-1 min-w-0 items-center gap-3 text-left"
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-lg font-bold text-pastel-lavender-ink">
                            {initial}
                          </div>
                          <div className="min-w-0 pr-8">
                            <p className="font-display font-bold text-slate-900 truncate">{name}</p>
                            <p className="text-sm text-pastel-lavender-ink opacity-80">
                              {child.username ? `@${child.username}` : 'View progress'}
                            </p>
                          </div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setMenuChild(child)
                          }}
                          className="absolute right-3 top-3 h-8 w-8 shrink-0 flex items-center justify-center rounded-full text-pastel-lavender-ink hover:bg-white/60 transition-colors"
                          aria-label="Child options"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <>
                <img
                  src="/home.jpeg"
                  alt="11+ learning"
                  className="w-full h-auto md:h-auto object-cover rounded-[1.5rem] mb-6"
                />

                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-pastel-lavender p-4">
                    <UsersRound className="h-10 w-10 text-pastel-lavender-ink" />
                  </div>
                </div>

                <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900 mb-8">
                  Add a child to explore exam preparation!
                </h2>

                <div className="space-y-4 mb-8 text-left max-w-2xl mx-auto">
                  {[
                    'Clear study plans and organized mock tests.',
                    'Simulates actual exam conditions.',
                    'Tailored insights into strengths and weaknesses.',
                    'Study anytime, anywhere via mobile devices.',
                    'Ensures relevance with current exam formats and curriculum.',
                  ].map((text) => (
                    <div key={text} className="flex items-start gap-4">
                      <Star className="mt-1 h-5 w-5 shrink-0 fill-amber-400 text-amber-400" />
                      <p className="text-slate-700 font-medium">{text}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate('/add-child')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-full text-lg transition-all duration-200 shadow-btn flex items-center gap-2 mx-auto"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Add a Child</span>
                </button>
              </>
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
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Child options bottom sheet */}
      {menuChild && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end justify-center"
          onClick={() => setMenuChild(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-[1.75rem] p-6 pb-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-200" />
            <h3 className="font-display text-xl font-bold text-slate-900">
              {childName(menuChild, 0)}
            </h3>
            {menuChild.username && (
              <p className="text-sm text-slate-500 mb-5">@{menuChild.username}</p>
            )}

            <div className="space-y-3">
              <button
                onClick={() => openChangePassword(menuChild)}
                className="w-full flex items-center gap-3 rounded-2xl border-2 border-slate-200 px-4 py-3.5 font-semibold text-slate-900 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
              >
                <KeyRound className="h-5 w-5 text-indigo-600" />
                Change password
              </button>
              <button
                onClick={() => {
                  setRemoveConfirmChild(menuChild)
                  setMenuChild(null)
                }}
                className="w-full flex items-center gap-3 rounded-2xl border-2 border-red-100 px-4 py-3.5 font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <UserMinus className="h-5 w-5" />
                Remove child
              </button>
            </div>
          </div>
        </div>
      )}

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

      <ConfirmDialog
        open={showLogoutConfirm}
        icon={LogOut}
        title="Log out?"
        message="You'll need to sign in again to access your dashboard."
        confirmLabel="Log Out"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  )
}

export default DashboardPage