import { ShieldAlert } from 'lucide-react'

function DangerZoneCard({ isDeleting, onDelete }) {
  return (
    <div className="bg-red-50 rounded-2xl p-6 md:p-8 border-2 border-red-100">
      <div className="flex items-center gap-3 mb-1">
        <ShieldAlert className="h-5 w-5 text-red-500" />
        <h3 className="font-display text-lg font-bold text-red-700">Danger Zone</h3>
      </div>
      <p className="text-sm text-red-600/80 mb-4">
        Deleting your account is permanent and cannot be undone.
      </p>
      <button
        onClick={onDelete}
        disabled={isDeleting}
        className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-bold py-2.5 px-6 rounded-full text-sm transition-all duration-200 shadow-lg shadow-red-500/20 disabled:shadow-none"
      >
        {isDeleting ? 'Processing...' : 'Delete My Account'}
      </button>
    </div>
  )
}

export default DangerZoneCard
