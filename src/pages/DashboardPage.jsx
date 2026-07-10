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
  Loader2,
  LogOut,
  Menu,
  School,
  UserCheck,
  UserPlus,
} from 'lucide-react'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import { buildMediaUrl } from '../services/api.js'
import { childName } from '../lib/childHelpers.js'
import Sidebar from '../components/dashboard/Sidebar.jsx'
import ChildrenList from '../components/dashboard/ChildrenList.jsx'
import EmptyChildrenState from '../components/dashboard/EmptyChildrenState.jsx'
import ChildOptionsSheet from '../components/dashboard/ChildOptionsSheet.jsx'

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
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          user={user}
          profilePicKey={profilePicKey}
          menuItems={menuItems}
          onMenuClick={handleMenuClick}
        />

        {/* Main Content */}
        <div className="flex-1 px-4 py-6 md:px-8 md:py-8 min-w-0">
          <div className="max-w-4xl mx-auto bg-white rounded-[2rem] p-6 md:p-8 shadow-card-xl border border-amber-100/60 text-center">
            {isLoadingChildren ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              </div>
            ) : children.length > 0 ? (
              <ChildrenList
                childList={children}
                onAddAnother={() => navigate('/add-child')}
                onOpenChild={() => navigate('/mock-tests')}
                onOpenMenu={setMenuChild}
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
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <ChildOptionsSheet
        child={menuChild}
        onClose={() => setMenuChild(null)}
        onChangePassword={openChangePassword}
        onRemoveClick={(child) => {
          setRemoveConfirmChild(child)
          setMenuChild(null)
        }}
      />

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
