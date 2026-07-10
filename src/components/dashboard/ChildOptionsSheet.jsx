import { KeyRound, UserMinus } from 'lucide-react'
import { childName } from '../../lib/childHelpers.js'

function ChildOptionsSheet({ child, onClose, onChangePassword, onRemoveClick }) {
  if (!child) return null

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-[1.75rem] p-6 pb-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-200" />
        <h3 className="font-display text-xl font-bold text-slate-900">
          {childName(child, 0)}
        </h3>
        {child.username && (
          <p className="text-sm text-slate-500 mb-5">@{child.username}</p>
        )}

        <div className="space-y-3">
          <button
            onClick={() => onChangePassword(child)}
            className="w-full flex items-center gap-3 rounded-2xl border-2 border-slate-200 px-4 py-3.5 font-semibold text-slate-900 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
          >
            <KeyRound className="h-5 w-5 text-indigo-600" />
            Change password
          </button>
          <button
            onClick={() => onRemoveClick(child)}
            className="w-full flex items-center gap-3 rounded-2xl border-2 border-red-100 px-4 py-3.5 font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <UserMinus className="h-5 w-5" />
            Remove child
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChildOptionsSheet
