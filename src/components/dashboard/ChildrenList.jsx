import { UserPlus } from 'lucide-react'
import ChildCard from './ChildCard.jsx'

function ChildrenList({ childList, onAddAnother, onEditProfile, onChangePassword, onRemoveClick, onViewPerformance, performanceByChildId, loadingPerformance }) {
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
          const childId = child.childID || child.id || i
          return (
            <ChildCard
              key={childId}
              child={child}
              index={i}
              onEditProfile={onEditProfile}
              onChangePassword={onChangePassword}
              onRemoveClick={onRemoveClick}
              onViewPerformance={onViewPerformance}
              performance={performanceByChildId?.[childId]}
              isLoadingPerformance={loadingPerformance}
            />
          )
        })}
      </div>
    </div>
  )
}

export default ChildrenList
