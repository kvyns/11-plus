import { Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'

function AttemptActionBar({ current, currentIndex, totalQuestions, answers, markedForReview, onPrevious, onNext, onClear, onToggleMark, onSubmitClick, submitLabel = 'Submit Mock' }) {
  const isLast = currentIndex === totalQuestions - 1

  return (
    <>
      <p className="mt-3 text-center text-xs text-slate-400 hidden sm:block">
        <kbd className="rounded border border-slate-200 px-1.5 py-0.5 font-sans">1–9</kbd> select ·{' '}
        <kbd className="rounded border border-slate-200 px-1.5 py-0.5 font-sans">N</kbd> next ·{' '}
        <kbd className="rounded border border-slate-200 px-1.5 py-0.5 font-sans">P</kbd> previous ·{' '}
        <kbd className="rounded border border-slate-200 px-1.5 py-0.5 font-sans">M</kbd> mark for review
      </p>

      {/* Bottom action bar — fixed to the viewport so it never shifts as question content changes height */}
      <div className="fixed inset-x-0 bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 bg-cream/95 backdrop-blur-md shadow-card-lg border-t border-amber-100/60 px-4 py-3 sm:px-6">
        <button
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 rounded-full border-2 border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-40 hover:border-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>

        <div className="hidden sm:flex items-center gap-2 justify-center">
          <button
            onClick={onClear}
            disabled={!answers[current.id]}
            className="flex items-center gap-1.5 rounded-full border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 disabled:opacity-40 hover:border-red-200 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors"
          >
            <RotateCcw className="h-4 w-4" /> Clear
          </button>
          <button
            onClick={onToggleMark}
            className={`flex items-center gap-1.5 rounded-full border-2 px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
              markedForReview[current.id]
                ? 'border-purple-300 bg-purple-50 text-purple-700'
                : 'border-slate-200 text-slate-600 hover:border-purple-200'
            }`}
          >
            {markedForReview[current.id] ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            {markedForReview[current.id] ? 'Marked' : 'Mark for Review'}
          </button>
        </div>

        {isLast ? (
          <button
            onClick={onSubmitClick}
            className="rounded-full bg-indigo-600 hover:bg-indigo-700 px-10 py-3 text-sm font-bold text-white shadow-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors"
          >
            {submitLabel}
          </button>
        ) : (
          <button
            onClick={onNext}
            className="flex items-center gap-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 px-7 py-3 text-sm font-bold text-white shadow-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors"
          >
            Save &amp; Next <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {/* Clear/Mark on mobile: own row so Previous/Next stay in the primary row */}
        <div className="flex sm:hidden w-full items-center gap-2 justify-center order-4">
          <button
            onClick={onClear}
            disabled={!answers[current.id]}
            className="flex items-center gap-1.5 rounded-full border-2 border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" /> Clear
          </button>
          <button
            onClick={onToggleMark}
            className={`flex items-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors ${
              markedForReview[current.id]
                ? 'border-purple-300 bg-purple-50 text-purple-700'
                : 'border-slate-200 text-slate-600'
            }`}
          >
            {markedForReview[current.id] ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            {markedForReview[current.id] ? 'Marked' : 'Mark'}
          </button>
        </div>
      </div>
    </>
  )
}

export default AttemptActionBar
