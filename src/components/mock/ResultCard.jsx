import { BarChart3 } from 'lucide-react'
import { formatSeconds } from '../../lib/mockAttempt.js'

function ResultCard({ result, isResultMode, mockTitle, mockDetails, mockMeta, totalQuestions, onReviewAnswers, onViewLeaderboard, onBackToMocks }) {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-[1.75rem] p-6 md:p-8 shadow-card-xl border border-amber-100/60 text-center">
      <div className="flex justify-center mb-4">
        <div className="rounded-full bg-pastel-mint p-5">
          <span className="font-display text-3xl font-bold text-pastel-mint-ink">
            {result?.score ?? result?.percentage ?? 0}%
          </span>
        </div>
      </div>
      <h2 className="font-display text-2xl font-bold text-slate-900 mb-1">
        {isResultMode ? mockTitle : 'Mock complete!'}
      </h2>
      {!isResultMode && mockDetails?.title && (
        <p className="text-sm text-slate-500 mb-1">{mockDetails.title}</p>
      )}
      {mockMeta?.durationMins != null && result?.timeTaken != null && (
        <p className="text-sm text-slate-500 mb-4">Time taken: {formatSeconds(result.timeTaken)}</p>
      )}

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl bg-pastel-mint p-3">
          <p className="font-display text-xl font-bold text-slate-900">
            {result?.correct ?? 0}/{result?.totalQuestions ?? totalQuestions}
          </p>
          <p className="text-xs text-pastel-mint-ink">Correct</p>
        </div>
        <div className="rounded-xl bg-pastel-pink p-3">
          <p className="font-display text-xl font-bold text-slate-900">{result?.incorrect ?? 0}</p>
          <p className="text-xs text-pastel-pink-ink">Incorrect</p>
        </div>
        <div className="rounded-xl bg-pastel-yellow p-3">
          <p className="font-display text-xl font-bold text-slate-900">{result?.skipped ?? 0}</p>
          <p className="text-xs text-pastel-yellow-ink">Skipped</p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <button
          onClick={onReviewAnswers}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-full text-sm transition-colors shadow-btn"
        >
          Review Answers
        </button>
        <button
          onClick={onViewLeaderboard}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-indigo-50 text-indigo-600 font-bold py-3 rounded-full text-sm transition-colors border-2 border-indigo-200"
        >
          <BarChart3 className="h-4 w-4" />
          View Leaderboard
        </button>
        <button
          onClick={onBackToMocks}
          className="w-full bg-white hover:bg-indigo-50 text-indigo-600 font-bold py-3 rounded-full text-sm transition-colors border-2 border-indigo-200"
        >
          Back to Mocks
        </button>
      </div>
    </div>
  )
}

export default ResultCard
