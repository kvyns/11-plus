import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Gift, Heart, House, LogOut, Menu, School, UserCheck, UserPlus } from 'lucide-react'
import { useAppStore } from '../../store/appStore.jsx'
import { useToast } from '../../store/toastStore.jsx'
import { buildMediaUrl } from '../../services/api.js'
import ConfirmDialog from '../ui/ConfirmDialog.jsx'
import Sidebar from './Sidebar.jsx'

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

function ParentLayout({ title, activePage, children }) {
  const navigate = useNavigate()
  const { user, logout } = useAppStore()
  const toast = useToast()
  const profilePicKey = user?.profilePic || user?.profilePicKey || user?.imageKey || user?.image_key
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

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
            {title}
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
          activePage={activePage}
          onMenuClick={handleMenuClick}
        />

        {/* Main Content */}
        <div className="flex-1 px-4 py-6 md:px-8 md:py-8 min-w-0">
          {children}
        </div>
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
        message="You'll need to sign in again to access your dashboard."
        confirmLabel="Log Out"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  )
}

export default ParentLayout
