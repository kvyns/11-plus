import { X } from 'lucide-react'
import { initials } from '../../lib/childHelpers.js'

function ChildSidebar({ sidebarOpen, setSidebarOpen, childName, menuItems, activePage, onMenuClick }) {
  return (
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
            {initials(childName)}
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
            key={item.page}
            onClick={() => onMenuClick(item.page)}
            className={`w-full text-left px-4 py-3 rounded-xl transition-colors font-semibold flex items-center gap-3 text-sm ${
              item.page === 'logout'
                ? 'text-red-600 hover:bg-red-50'
                : item.page === activePage
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
  )
}

export default ChildSidebar
