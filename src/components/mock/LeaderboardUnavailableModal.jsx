import { BarChart3 } from 'lucide-react'

function LeaderboardUnavailableModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 shadow-2xl border border-slate-100 text-center max-w-sm w-full">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-pastel-lavender p-3">
            <BarChart3 className="h-7 w-7 text-pastel-lavender-ink" />
          </div>
        </div>
        <h3 className="font-display text-xl font-bold text-slate-900 mb-2">Not available yet</h3>
        <p className="text-slate-500 text-sm mb-6">
          Leaderboard rankings are published after the mock test window closes.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-full transition-colors shadow-btn"
        >
          OK
        </button>
      </div>
    </div>
  )
}

export default LeaderboardUnavailableModal
