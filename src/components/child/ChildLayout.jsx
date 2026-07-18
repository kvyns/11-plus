import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, BookOpen, ClipboardList, LogOut, Menu } from 'lucide-react'
import { useAppStore } from '../../store/appStore.jsx'
import { useToast } from '../../store/toastStore.jsx'
import ConfirmDialog from '../ui/ConfirmDialog.jsx'
import ChildSidebar from './ChildSidebar.jsx'

const menuItems = [
  { Icon: BookOpen, label: 'Home', page: 'child-dashboard' },
  { Icon: ClipboardList, label: 'Mock Tests', page: 'child-mocks' },
  { Icon: BarChart3, label: 'My Progress', page: 'child-profile' },
  { Icon: LogOut, label: 'Logout', page: 'logout' },
]

function ChildLayout({ title, activePage, childName, children }) {
  const navigate = useNavigate()
  const { user, logout } = useAppStore()
  const toast = useToast()
  const resolvedChildName = childName || user?.firstName || user?.childName || user?.name || user?.username || 'Champion'
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const pathMap = {
    'child-dashboard': '/child-dashboard',
    'child-mocks': '/child-mocks',
    'child-profile': '/child-profile',
  }

  const handleMenuClick = (page) => {
    if (page === 'logout') {
      setShowLogoutConfirm(true)
      setSidebarOpen(false)
      return
    }
    navigate(pathMap[page] || '/child-dashboard')
    setSidebarOpen(false)
  }

  const confirmLogout = () => {
    setShowLogoutConfirm(false)
    logout()
    navigate('/child-login')
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
          onClick={() => navigate('/child-profile')}
          className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-lg shadow-indigo-600/30"
        >
          {resolvedChildName.charAt(0).toUpperCase()}
        </button>
      </div>

      <div className="flex">
        <ChildSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          childName={resolvedChildName}
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
        message="You'll need to sign in again to keep practicing."
        confirmLabel="Log Out"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  )
}

export default ChildLayout
