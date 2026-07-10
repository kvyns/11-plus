import { LayoutDashboard } from 'lucide-react'
import MobileNav from './MobileNav.jsx'

function LandingHeader({ navigate, isLoggedIn, dashboardPath }) {
  return (
    <header className="sticky top-0 z-30 border-b border-amber-100 bg-cream/90 backdrop-blur">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <div className="flex items-center gap-3">
          <img src="/11plus.png" alt="11+ Logo" className="h-10 w-10" />
          <span className="font-display text-lg font-bold text-slate-900">11+ eLearning</span>
        </div>
        <nav className="hidden gap-8 font-display text-sm font-semibold text-slate-600 md:flex">
          <a href="#why" className="transition hover:text-indigo-600">Why us</a>
          <a href="#subjects" className="transition hover:text-indigo-600">Subjects</a>
          <a href="#progress" className="transition hover:text-indigo-600">Progress</a>
          <a href="#cta" className="transition hover:text-indigo-600">Get started</a>
        </nav>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <button
              onClick={() => navigate(dashboardPath)}
              className="hidden items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-btn transition hover:bg-indigo-700 sm:flex"
            >
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="hidden rounded-full px-5 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 sm:block"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="hidden rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-btn transition hover:bg-indigo-700 sm:block"
              >
                Register
              </button>
            </>
          )}
          <MobileNav />
        </div>
      </div>
    </header>
  )
}

export default LandingHeader
