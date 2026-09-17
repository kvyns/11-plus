import { AlertTriangle, Clock3 } from 'lucide-react'

function MockLandingCard({
  mockTitle, onStart,
  subtitle = 'Read each question carefully and answer as many as you can before the timer runs out.',
  warningText = "Once you start, the timer keeps running until you submit — you can't pause or leave the mock halfway through.",
  startLabel = 'Start Mock',
}) {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-[1.75rem] p-6 md:p-8 shadow-card-xl border border-amber-100/60 text-center">
      <div className="flex justify-center mb-4">
        <div className="rounded-full bg-pastel-lavender p-4">
          <Clock3 className="h-10 w-10 text-pastel-lavender-ink" />
        </div>
      </div>
      <p className="text-xs font-bold uppercase tracking-wide text-indigo-600 mb-1">Ready to start?</p>
      <h2 className="font-display text-2xl font-bold text-slate-900 mb-3">{mockTitle}</h2>

      <p className="text-slate-500 mb-6">{subtitle}</p>

      {warningText && (
        <div className="rounded-2xl bg-pastel-yellow p-4 mb-6 flex items-start gap-3 text-left">
          <AlertTriangle className="h-5 w-5 shrink-0 text-pastel-yellow-ink mt-0.5" />
          <p className="text-sm text-pastel-yellow-ink">{warningText}</p>
        </div>
      )}

      <button
        onClick={onStart}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-full text-lg transition-colors shadow-btn"
      >
        {startLabel}
      </button>
    </div>
  )
}

export default MockLandingCard
