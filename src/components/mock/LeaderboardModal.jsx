function LeaderboardModal({ data, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 max-w-sm w-full max-h-[80vh] overflow-y-auto">
        <h3 className="font-display text-lg font-bold text-slate-900 mb-1">{data.title}</h3>
        <p className="text-sm text-slate-500 mb-4">Leaderboard</p>

        {data.myRank && (
          <div className="rounded-xl bg-pastel-lavender p-3 mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-pastel-lavender-ink">
              Your rank: #{data.myRank.rank}
            </span>
            <span className="text-sm font-bold text-pastel-lavender-ink">
              {data.myRank.correct}/{data.myRank.totalQuestions}
            </span>
          </div>
        )}

        <div className="space-y-2 mb-4">
          {data.top10.map((entry) => (
            <div key={entry.rank} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-600 shadow-card">
                  {entry.rank}
                </span>
                <span className="text-sm font-semibold text-slate-800">{entry.childName}</span>
              </div>
              <span className="text-sm font-bold text-indigo-600">{entry.score}%</span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-full transition-colors shadow-btn"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default LeaderboardModal
