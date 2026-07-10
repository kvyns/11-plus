import { Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, RotateCcw, Send } from 'lucide-react'

function AttemptActionBar({ current, currentIndex, totalQuestions, answers, markedForReview, onPrevious, onNext, onClear, onToggleMark, onSubmitClick }) {
  const isLast = currentIndex === totalQuestions - 1

  return (
    <>
      <p className="mt-3 text-center text-xs text-slate-400 hidden sm:block">
        <kbd className="rounded border border-slate-200 px-1.5 py-0.5 font-sans">1–9</kbd> select ·{' '}
        <kbd className="rounded border border-slate-200 px-1.5 py-0.5 font-sans">N</kbd> next ·{' '}
        <kbd className="rounded border border-slate-200 px-1.5 py-0.5 font-sans">P</kbd> previous ·{' '}
        <kbd className="rounded border border-slate-200 px-1.5 py-0.5 font-sans">M</kbd> mark for review
      </p>

      {/* Bottom action bar — sticky on shorter viewports so nav never needs a scroll */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 lg:sticky lg:bottom-4 lg:z-20 lg:rounded-full lg:bg-cream/95 lg:backdrop-blur-md lg:shadow-card-lg lg:border lg:border-amber-100/60 lg:px-4 lg:py-2.5">
        <button
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 rounded-full border-2 border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-40 hover:border-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>

        <div className="flex flex-1 sm:flex-none items-center gap-2 justify-center order-3 sm:order-2">
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
            className="order-2 sm:order-3 rounded-full bg-indigo-600 hover:bg-indigo-700 px-10 py-3 text-sm font-bold text-white shadow-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors"
          >
            Submit Mock
          </button>
        ) : (
          <button
            onClick={onNext}
            className="order-2 sm:order-3 flex items-center gap-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 px-7 py-3 text-sm font-bold text-white shadow-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors"
          >
            Save &amp; Next <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Mobile-only submit shortcut since the header one is hidden below sm: */}
      <button
        onClick={onSubmitClick}
        className="sm:hidden mt-3 w-full flex items-center justify-center gap-1.5 rounded-full border-2 border-indigo-200 text-indigo-600 px-4 py-2.5 text-sm font-bold"
      >
        <Send className="h-4 w-4" /> Submit Mock
      </button>
    </>
  )
}

export default AttemptActionBar
