import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LayoutDashboard, Menu, X } from 'lucide-react'
import { useAppStore } from '../../store/appStore.jsx'

const links = [
  { label: 'Why us', href: '#why' },
  { label: 'Subjects', href: '#subjects' },
  { label: 'Progress', href: '#progress' },
  { label: 'Get started', href: '#cta' },
]

function MobileNav() {
  const navigate = useNavigate()
  const { isLoggedIn, accountType } = useAppStore()
  const dashboardPath = accountType === 'child' ? '/child-dashboard' : '/dashboard'
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-700"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-4 top-[calc(100%+0.5rem)] z-40 flex flex-col gap-1 rounded-2xl border border-indigo-100 bg-white p-3 shadow-card-xl"
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-1 flex gap-2 border-t border-slate-100 pt-3">
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    setOpen(false)
                    navigate(dashboardPath)
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setOpen(false)
                      navigate('/login')
                    }}
                    className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setOpen(false)
                      navigate('/register')
                    }}
                    className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MobileNav
