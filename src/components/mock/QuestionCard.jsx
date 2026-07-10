import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { buildMediaUrl } from '../../services/api.js'
import { getQuestionText, getQuestionOptions, isImageValue } from '../../lib/mockAttempt.js'

function QuestionCard({ current, currentIndex, answers, onSelectAnswer }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={current.id || currentIndex}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="bg-white rounded-[1.75rem] p-6 sm:p-8 shadow-card-xl border border-amber-100/60"
      >
        {!getQuestionText(current) && !current.passage && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 mb-4 text-sm text-red-600">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            This question couldn't be loaded — skip ahead and it'll be marked unanswered.
          </div>
        )}

        {current.passage && (
          <div className="mb-6 rounded-2xl p-5 max-h-64 overflow-y-auto" style={{ backgroundColor: '#F7F5FF' }}>
            <p className="text-xs font-bold uppercase tracking-wide text-pastel-lavender-ink mb-2">
              Read the passage, then answer the question below.
            </p>
            <p className="text-sm text-slate-800 whitespace-pre-line leading-loose">{current.passage}</p>
          </div>
        )}

        {(current.image_key || current.imageKey) && (
          <img
            src={buildMediaUrl(current.image_key || current.imageKey)}
            alt="Question"
            className="mb-4 max-h-56 mx-auto rounded-xl border border-slate-100 object-contain"
          />
        )}

        {current.context && (
          <p className="mb-3 text-sm font-semibold text-slate-600">{current.context}</p>
        )}

        <p className="font-display text-xl leading-relaxed font-bold text-slate-900 mb-6 whitespace-pre-line">
          {getQuestionText(current)}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(getQuestionOptions(current) || {}).map(([key, value], optionIndex) => {
            const selected = answers[current.id] === key
            return (
              <button
                key={key}
                onClick={() => onSelectAnswer(current.id, key)}
                className={`relative flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                  selected
                    ? 'border-indigo-500 bg-indigo-50 shadow-card-lg'
                    : 'border-slate-200 hover:border-indigo-300 hover:shadow-card'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base font-bold transition-colors ${
                    selected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {key}
                </span>
                {isImageValue(value) ? (
                  <img src={buildMediaUrl(value)} alt={`Option ${key}`} className="h-14 w-14 object-contain" />
                ) : (
                  <span className="text-base leading-relaxed font-medium text-slate-800">{value}</span>
                )}
                {selected && (
                  <CheckCircle2 className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white text-indigo-600 shadow-card" />
                )}
                {optionIndex < 9 && (
                  <span className="hidden sm:block absolute bottom-1.5 right-2 text-[10px] font-semibold text-slate-300">
                    {optionIndex + 1}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default QuestionCard
