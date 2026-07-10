export function isImageValue(value) {
  return typeof value === 'string' && (/\.(svg|png|jpe?g)$/i.test(value) || value.includes('/'))
}

export function getQuestionText(q) {
  return q.question || q.questionText || q.text || q.prompt || q.body || ''
}

export function getQuestionOptions(q) {
  return q.options || q.choices || q.answerOptions || q.answers || null
}

function getS3Key(q) {
  return q.s3Key || q.s3key || q.key || q.questionKey || q.imageKey || q.image_key || q.path || q.file || q.fileKey
}

// Only treat a field as a "wrapper object" if it's actually an object — the
// real /question response has no envelope at all, it's the flat question
// object directly (id, question, options, answer, ...), and `question` is
// the question *text*. Blindly doing `response.question || response.result
// || response` would pick the text string (truthy) as the "resolved
// object" and spreading a string via `...` shreds it into numeric-index
// characters, silently destroying the real fields.
function unwrapObjectField(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null
}

// mock/start sometimes returns lightweight question references (just a key
// pointing at S3) instead of full content — resolve those via the /question
// endpoint before rendering, otherwise the card shows with no question/options.
export async function resolveQuestions(rawQuestions, api) {
  return Promise.all(
    rawQuestions.map(async (q) => {
      const hasContent = getQuestionText(q) || q.passage
      const s3Key = getS3Key(q)

      if (hasContent) return q

      if (!s3Key) {
        // eslint-disable-next-line no-console
        console.warn('[MockAttemptPage] question has no content and no resolvable key — raw shape:', q)
        return q
      }

      try {
        const response = await api.quiz.getQuestionJson({ s3Key })
        const resolved = unwrapObjectField(response.question) || unwrapObjectField(response.result) || unwrapObjectField(response.data) || response
        const merged = { ...q, ...resolved }
        if (!getQuestionText(merged) && !merged.passage) {
          // eslint-disable-next-line no-console
          console.warn('[MockAttemptPage] resolved via getQuestionJson but still has no content — raw response:', JSON.stringify(response))
        }
        return merged
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('[MockAttemptPage] getQuestionJson failed for key', s3Key, error)
        return q
      }
    })
  )
}

export function flattenQuestions(questions = []) {
  const flat = []
  questions.forEach((q) => {
    if (q.passage && Array.isArray(q.questions)) {
      q.questions.forEach((sub) => {
        flat.push({ ...sub, passage: q.passage, groupId: q.id })
      })
    } else {
      flat.push(q)
    }
  })
  return flat
}

export function formatSeconds(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// Palette status → visual treatment. Marked-for-review uses purple/indigo
// (a deliberate exception to the "no raw purple" rule — this is a
// functional exam-status convention the whole industry shares, not a
// brand-color choice) and every state pairs a color with a distinct icon
// so it doesn't rely on color alone.
export const STATUS_STYLES = {
  notVisited: { dot: 'bg-slate-200 text-slate-500', label: 'Not Visited', shortLabel: 'Not Visited' },
  visited: { dot: 'bg-amber-400 text-white', label: 'Visited, Not Answered', shortLabel: 'Visited' },
  answered: { dot: 'bg-emerald-500 text-white', label: 'Answered', shortLabel: 'Answered' },
  marked: { dot: 'bg-purple-500 text-white', label: 'Marked for Review', shortLabel: 'Review' },
  answeredMarked: { dot: 'bg-indigo-600 text-white', label: 'Answered & Marked', shortLabel: 'Ans + Review' },
}

export function getQuestionStatus(id, { answers, markedForReview, visited }) {
  const isAnswered = Boolean(answers[id])
  const isMarked = Boolean(markedForReview[id])
  if (isAnswered && isMarked) return 'answeredMarked'
  if (isMarked) return 'marked'
  if (isAnswered) return 'answered'
  if (visited[id]) return 'visited'
  return 'notVisited'
}

export const REVIEW_STATUS_STYLES = {
  correct: { dot: 'bg-emerald-500 text-white', label: 'Correct' },
  incorrect: { dot: 'bg-red-500 text-white', label: 'Incorrect' },
  skipped: { dot: 'bg-slate-300 text-white', label: 'Skipped' },
}

export function isReviewAnswerCorrect(q) {
  const childAnswers = q.childAnswers || []
  return q.correct ?? q.isCorrect ?? (q.answer != null && childAnswers.includes(q.answer))
}

export function getReviewStatus(q) {
  const childAnswers = q.childAnswers || []
  if (childAnswers.length === 0) return 'skipped'
  return isReviewAnswerCorrect(q) ? 'correct' : 'incorrect'
}
