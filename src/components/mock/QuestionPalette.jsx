function QuestionPalette({ questions, getStatus, styles, currentIndex, onSelect, legendColumns = 2, labelKey = 'shortLabel' }) {
  return (
    <>
      <div className="bg-white rounded-2xl p-4 shadow-card border border-amber-100/60">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">Questions</p>
        <div className="grid grid-cols-6 lg:grid-cols-5 gap-3">
          {questions.map((q, i) => {
            const status = getStatus(q)
            const isCurrent = i === currentIndex
            return (
              <button
                key={q.id || i}
                onClick={() => onSelect(i)}
                className={`relative h-10 w-10 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-150 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${styles[status].dot} ${
                  isCurrent ? 'ring-4 ring-indigo-300 shadow-card-lg scale-110 z-10' : ''
                }`}
                aria-label={`Question ${i + 1} — ${styles[status].label}${isCurrent ? ' (current)' : ''}`}
                aria-current={isCurrent ? 'true' : undefined}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-card border border-amber-100/60">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">Legend</p>
        {legendColumns > 1 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            {Object.entries(styles).map(([key, style]) => (
              <div key={key} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className={`h-3 w-3 rounded-full shrink-0 ${style.dot}`} />
                <span className="truncate">{style[labelKey]}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {Object.entries(styles).map(([key, style]) => (
              <div key={key} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className={`h-3 w-3 rounded-full shrink-0 ${style.dot}`} />
                {style[labelKey]}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default QuestionPalette
