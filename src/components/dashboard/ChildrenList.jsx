import { MoreVertical, UserPlus } from 'lucide-react'
import { childName } from '../../lib/childHelpers.js'

function ChildrenList({ childList, onAddAnother, onOpenChild, onOpenMenu }) {
  return (
    <div className="text-left mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl md:text-2xl font-bold text-slate-900">
          Your Children
        </h2>
        <button
          onClick={onAddAnother}
          className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          <UserPlus className="h-4 w-4" />
          Add another
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {childList.map((child, i) => {
          const name = childName(child, i)
          const initial = name.charAt(0).toUpperCase()

          return (
            <div
              key={child.childID || child.id || i}
              className="relative flex items-center gap-3 rounded-2xl bg-pastel-lavender p-4 shadow-card transition-shadow hover:shadow-card-lg"
            >
              <button
                onClick={() => onOpenChild(child)}
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
                  onOpenMenu(child)
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
  )
}

export default ChildrenList
