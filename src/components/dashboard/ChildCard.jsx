import { useEffect, useRef, useState } from 'react'
import { BarChart3, Cake, GraduationCap, KeyRound, MoreVertical, Pencil, Sparkles, UserMinus, VenusAndMars } from 'lucide-react'
import { childName, initials, formatYearGroup } from '../../lib/childHelpers.js'

function PerformanceRing({ accuracy, hasData }) {
  const clamped = Math.min(100, Math.max(0, accuracy))
  const style = hasData
    ? { background: `conic-gradient(#4f46e5 ${clamped * 3.6}deg, #e0e7ff ${clamped * 3.6}deg)` }
    : { background: '#e0e7ff' }

  return (
    <div className="relative h-20 w-20 shrink-0 rounded-full flex items-center justify-center" style={style}>
      <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center">
        <span className="font-display text-sm font-bold text-indigo-600">
          {hasData ? `${clamped}%` : '—'}
        </span>
      </div>
    </div>
  )
}

function ChildCard({ child, index, onEditProfile, onChangePassword, onRemoveClick, onViewPerformance, performance, isLoadingPerformance }) {
  const name = childName(child, index)
  const initial = initials(name)
  const yearGroup = formatYearGroup(child.yearGroup)
  const totalQuizzes = performance?.totalQuizzes ?? 0
  const accuracy = performance?.accuracy ?? 0
  const hasPerformanceData = totalQuizzes > 0
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return undefined
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <div className="rounded-2xl bg-white p-5 shadow-card border border-amber-100/60 transition-shadow hover:shadow-card-lg">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pastel-lavender text-lg font-bold text-pastel-lavender-ink">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-slate-900 truncate">{name}</p>
            {child.username && (
              <p className="text-sm text-indigo-600 truncate">@{child.username}</p>
            )}
          </div>
        </div>

        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Child options"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-9 z-20 w-52 rounded-xl bg-white shadow-card-lg border border-slate-100 py-1.5 text-left">
              <button
                onClick={() => {
                  setMenuOpen(false)
                  onEditProfile(child)
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <Pencil className="h-4 w-4" />
                Edit profile
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  onChangePassword(child)
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <KeyRound className="h-4 w-4" />
                Change password
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  onRemoveClick(child)
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <UserMinus className="h-4 w-4" />
                Remove child
              </button>
            </div>
          )}
        </div>
      </div>

      {(child.gender || child.dob || yearGroup) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
          {child.gender && (
            <span className="flex items-center gap-1.5">
              <VenusAndMars className="h-4 w-4 text-slate-400" />
              {child.gender}
            </span>
          )}
          {child.dob && (
            <span className="flex items-center gap-1.5">
              <Cake className="h-4 w-4 text-slate-400" />
              {child.dob}
            </span>
          )}
          {yearGroup && (
            <span className="flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4 text-slate-400" />
              {yearGroup}
            </span>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center gap-4 rounded-2xl bg-indigo-50/60 p-4">
        <PerformanceRing accuracy={accuracy} hasData={hasPerformanceData} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-700">Overall Performance</p>
          {isLoadingPerformance ? (
            <p className="text-sm text-slate-400 mt-1">Loading...</p>
          ) : hasPerformanceData ? (
            <p className="text-sm text-slate-500 mt-1">{totalQuizzes} quizzes completed</p>
          ) : (
            <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
              <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
              Start practising to see results!
            </p>
          )}
        </div>
      </div>

      <button
        onClick={() => onViewPerformance(child)}
        className="mt-4 w-full flex items-center justify-center gap-2 rounded-full bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
      >
        <BarChart3 className="h-4 w-4" />
        View Performance
      </button>
    </div>
  )
}

export default ChildCard
