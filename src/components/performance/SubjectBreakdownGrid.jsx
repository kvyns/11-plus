const pastelCycle = [
  { bg: 'bg-pastel-pink', ink: 'text-pastel-pink-ink' },
  { bg: 'bg-pastel-lavender', ink: 'text-pastel-lavender-ink' },
  { bg: 'bg-pastel-mint', ink: 'text-pastel-mint-ink' },
  { bg: 'bg-pastel-yellow', ink: 'text-pastel-yellow-ink' },
]

function SubjectBreakdownGrid({ subjects, emptyMessage = 'No quizzes attempted yet — start practicing to see progress here.' }) {
  if (subjects.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-card border border-amber-100/60 text-center">
        <p className="text-slate-500 text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {subjects.map((subject, i) => {
        const palette = pastelCycle[i % pastelCycle.length]
        const name = subject.subjectName || subject.subject || subject.name || `Subject ${i + 1}`
        const subjectAccuracy = subject.accuracy ?? 0
        const quizCount = subject.quizCount

        return (
          <div key={name} className={`rounded-2xl p-5 shadow-card ${palette.bg}`}>
            <p className="font-display font-bold text-slate-900 mb-1">{name}</p>
            {quizCount != null && (
              <p className={`text-sm ${palette.ink} opacity-80 mb-3`}>{quizCount} quiz{quizCount === 1 ? '' : 'zes'} attempted</p>
            )}
            <div className={`h-2 rounded-full bg-white/60 overflow-hidden ${quizCount == null ? 'mt-3' : ''}`}>
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${Math.min(100, Math.max(0, subjectAccuracy))}%` }}
              />
            </div>
            <p className={`mt-1.5 text-xs font-semibold ${palette.ink}`}>{subjectAccuracy}% accuracy</p>
          </div>
        )
      })}
    </div>
  )
}

export default SubjectBreakdownGrid
