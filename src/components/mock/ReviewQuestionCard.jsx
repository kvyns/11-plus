import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Hourglass, XCircle } from 'lucide-react'
import { buildMediaUrl } from '../../services/api.js'
import { getQuestionText, getQuestionOptions, isImageValue, getReviewStatus } from '../../lib/mockAttempt.js'

function ReviewQuestionCard({ reviewCurrent, reviewIndex }) {
  const childAnswers = reviewCurrent.childAnswers || []
  const status = getReviewStatus(reviewCurrent)
  const correctKey = reviewCurrent.answer

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={reviewCurrent.id || reviewIndex}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="bg-white rounded-[1.75rem] p-6 sm:p-8 shadow-card-xl border border-amber-100/60"
      >
        <div
          className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${
            status === 'correct'
              ? 'bg-emerald-50 text-emerald-700'
              : status === 'incorrect'
              ? 'bg-red-50 text-red-600'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          {status === 'correct' && <CheckCircle2 className="h-4 w-4" />}
          {status === 'incorrect' && <XCircle className="h-4 w-4" />}
          {status === 'skipped' && <Hourglass className="h-4 w-4" />}
          {status === 'correct' ? 'Correct' : status === 'incorrect' ? 'Incorrect' : "You didn't answer this one"}
        </div>

        {reviewCurrent.passage && (
          <div className="mb-6 rounded-2xl p-5 max-h-64 overflow-y-auto" style={{ backgroundColor: '#F7F5FF' }}>
            <p className="text-xs font-bold uppercase tracking-wide text-pastel-lavender-ink mb-2">
              Passage
            </p>
            <p className="text-sm text-slate-800 whitespace-pre-line leading-loose">{reviewCurrent.passage}</p>
          </div>
        )}

        {(reviewCurrent.image_key || reviewCurrent.imageKey) && (
          <img
            src={buildMediaUrl(reviewCurrent.image_key || reviewCurrent.imageKey)}
            alt="Question"
            className="mb-4 max-h-56 mx-auto rounded-xl border border-slate-100 object-contain"
          />
        )}

        {reviewCurrent.context && (
          <p className="mb-3 text-sm font-semibold text-slate-600">{reviewCurrent.context}</p>
        )}

        <p className="font-display text-xl leading-relaxed font-bold text-slate-900 mb-6 whitespace-pre-line">
          {getQuestionText(reviewCurrent)}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(getQuestionOptions(reviewCurrent) || {}).map(([key, value]) => {
            const wasSelected = childAnswers.includes(key)
            const isCorrectOption = key === correctKey
            const isWrongPick = wasSelected && !isCorrectOption

            return (
              <div
                key={key}
                className={`relative flex items-center gap-3 rounded-xl border-2 p-4 text-left ${
                  isCorrectOption
                    ? 'border-emerald-500 bg-emerald-50'
                    : isWrongPick
                    ? 'border-red-400 bg-red-50'
                    : 'border-slate-200'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base font-bold ${
                    isCorrectOption
                      ? 'bg-emerald-500 text-white'
                      : isWrongPick
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {key}
                </span>
                {isImageValue(value) ? (
                  <img src={buildMediaUrl(value)} alt={`Option ${key}`} className="h-14 w-14 object-contain" />
                ) : (
                  <span className="text-base leading-relaxed font-medium text-slate-800">{value}</span>
                )}
                {isCorrectOption && (
                  <CheckCircle2 className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white text-emerald-500 shadow-card" />
                )}
                {isWrongPick && (
                  <XCircle className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white text-red-500 shadow-card" />
                )}
              </div>
            )
          })}
        </div>

        {(reviewCurrent.answer_text || correctKey) && (
          <p className="mt-5 text-sm text-slate-500">
            Correct answer:{' '}
            <span className="font-semibold text-emerald-600">{reviewCurrent.answer_text || correctKey}</span>
          </p>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default ReviewQuestionCard
