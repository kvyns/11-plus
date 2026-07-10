import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, Bookmark, BookmarkCheck, BookOpen, CheckCircle2, ChevronLeft, ChevronRight,
  Clock3, FileText, GraduationCap, Hourglass, Loader2, RotateCcw, Send, XCircle,
} from 'lucide-react'
import { useAppStore } from '../store/appStore.jsx'
import { buildMediaUrl } from '../services/api.js'

function isImageValue(value) {
  return typeof value === 'string' && (/\.(svg|png|jpe?g)$/i.test(value) || value.includes('/'))
}

function getQuestionText(q) {
  return q.question || q.questionText || q.text || q.prompt || q.body || ''
}

function getQuestionOptions(q) {
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
async function resolveQuestions(rawQuestions, api) {
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

function flattenQuestions(questions = []) {
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

function formatSeconds(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// Palette status → visual treatment. Marked-for-review uses purple/indigo
// (a deliberate exception to the "no raw purple" rule — this is a
// functional exam-status convention the whole industry shares, not a
// brand-color choice) and every state pairs a color with a distinct icon
// so it doesn't rely on color alone.
const STATUS_STYLES = {
  notVisited: { dot: 'bg-slate-200 text-slate-500', label: 'Not Visited', shortLabel: 'Not Visited' },
  visited: { dot: 'bg-amber-400 text-white', label: 'Visited, Not Answered', shortLabel: 'Visited' },
  answered: { dot: 'bg-emerald-500 text-white', label: 'Answered', shortLabel: 'Answered' },
  marked: { dot: 'bg-purple-500 text-white', label: 'Marked for Review', shortLabel: 'Review' },
  answeredMarked: { dot: 'bg-indigo-600 text-white', label: 'Answered & Marked', shortLabel: 'Ans + Review' },
}

function getQuestionStatus(id, { answers, markedForReview, visited }) {
  const isAnswered = Boolean(answers[id])
  const isMarked = Boolean(markedForReview[id])
  if (isAnswered && isMarked) return 'answeredMarked'
  if (isMarked) return 'marked'
  if (isAnswered) return 'answered'
  if (visited[id]) return 'visited'
  return 'notVisited'
}

const REVIEW_STATUS_STYLES = {
  correct: { dot: 'bg-emerald-500 text-white', label: 'Correct' },
  incorrect: { dot: 'bg-red-500 text-white', label: 'Incorrect' },
  skipped: { dot: 'bg-slate-300 text-white', label: 'Skipped' },
}

function isReviewAnswerCorrect(q) {
  const childAnswers = q.childAnswers || []
  return q.correct ?? q.isCorrect ?? (q.answer != null && childAnswers.includes(q.answer))
}

function getReviewStatus(q) {
  const childAnswers = q.childAnswers || []
  if (childAnswers.length === 0) return 'skipped'
  return isReviewAnswerCorrect(q) ? 'correct' : 'incorrect'
}

function MockAttemptPage() {
  const { mockID } = useParams()
  const location = useLocation()
  const isResultMode = location.pathname.endsWith('/result')
  const navigate = useNavigate()
  const { api, user } = useAppStore()
  // Passed from the mocks list so the title/subjects/duration are available
  // immediately on the landing screen, before startMock has even run (the
  // API's own start/result responses don't include this metadata).
  const mockDetails = location.state?.mockDetails || null
  const mockTitle = mockDetails?.title || 'Mock Test'

  // 'landing' -> 'loading' -> 'taking' -> 'submitting' -> 'result' -> 'review'
  const [stage, setStage] = useState(isResultMode ? 'loading' : 'landing')
  const [errorMessage, setErrorMessage] = useState('')
  const [mockMeta, setMockMeta] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [markedForReview, setMarkedForReview] = useState({})
  const [visited, setVisited] = useState({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [startedAt, setStartedAt] = useState(null)
  const [result, setResult] = useState(null)
  const [reviewReport, setReviewReport] = useState(null)
  const [reviewIndex, setReviewIndex] = useState(0)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [savedToastVisible, setSavedToastVisible] = useState(false)

  const flatQuestions = useMemo(() => flattenQuestions(questions), [questions])
  const current = flatQuestions[currentIndex]

  const reviewQuestions = useMemo(
    () => flattenQuestions(reviewReport?.questions || reviewReport?.answers || []),
    [reviewReport]
  )
  const reviewCurrent = reviewQuestions[reviewIndex]

  useEffect(() => {
    if (stage !== 'taking') return undefined

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [stage])

  useEffect(() => {
    if (stage === 'taking' && secondsLeft === 0 && startedAt) {
      handleSubmit()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, stage])

  // Mark the current question visited the moment it's shown.
  useEffect(() => {
    if (stage !== 'taking' || !current) return
    setVisited((prev) => (prev[current.id] ? prev : { ...prev, [current.id]: true }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, currentIndex, current?.id])

  // Keyboard shortcuts: 1-9 select an option, N/P navigate, M marks for review.
  useEffect(() => {
    if (stage !== 'taking' || showSubmitConfirm) return undefined

    const handleKeyDown = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      const key = e.key.toLowerCase()
      const optionKeys = current ? Object.keys(getQuestionOptions(current) || {}) : []
      const numericIndex = Number(e.key) - 1

      if (!Number.isNaN(numericIndex) && optionKeys[numericIndex]) {
        selectAnswer(current.id, optionKeys[numericIndex])
      } else if (key === 'n') {
        goToIndex(currentIndex + 1)
      } else if (key === 'p') {
        goToIndex(currentIndex - 1)
      } else if (key === 'm') {
        toggleMarkForReview()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, showSubmitConfirm, current, currentIndex])

  useEffect(() => {
    if (!isResultMode) return undefined
    let isCancelled = false

    async function loadResult() {
      try {
        const response = await api.mock.mockResult({ childID: user?.childID, mockID })
        if (!isCancelled) {
          setResult(response.mockResult || null)
          setMockMeta({ mockID })
          setStage('result')
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(error.message || 'Unable to load this result right now.')
          setStage('result')
        }
      }
    }

    loadResult()
    return () => { isCancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResultMode, mockID])

  const handleStart = async () => {
    setStage('loading')
    setErrorMessage('')

    try {
      const response = await api.mock.startMock({ childID: user?.childID, mockID })
      const durationMins = response.durationMins || 60
      setMockMeta({ mockID: response.mockID || mockID, durationMins })
      const resolvedQuestions = await resolveQuestions(response.questions || [], api)
      setQuestions(resolvedQuestions)
      setSecondsLeft(durationMins * 60)
      setStartedAt(Date.now())
      setStage('taking')
    } catch (error) {
      setErrorMessage(error.message || 'Unable to start this mock right now.')
      setStage('landing')
    }
  }

  const flashSaved = () => {
    setSavedToastVisible(true)
    setTimeout(() => setSavedToastVisible(false), 1000)
  }

  const selectAnswer = (questionId, optionKey) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionKey }))
    flashSaved()
  }

  const clearResponse = () => {
    if (!current) return
    setAnswers((prev) => {
      const next = { ...prev }
      delete next[current.id]
      return next
    })
    flashSaved()
  }

  const toggleMarkForReview = () => {
    if (!current) return
    setMarkedForReview((prev) => ({ ...prev, [current.id]: !prev[current.id] }))
    flashSaved()
  }

  const goToIndex = (index) => {
    setCurrentIndex(Math.max(0, Math.min(flatQuestions.length - 1, index)))
  }

  const handleSubmit = async () => {
    if (stage === 'submitting') return
    setShowSubmitConfirm(false)
    setStage('submitting')
    setErrorMessage('')

    const timeTaken = mockMeta ? mockMeta.durationMins * 60 - secondsLeft : 0

    try {
      const response = await api.mock.submitMock({
        mockID: mockMeta?.mockID || mockID,
        childID: user?.childID,
        timeTaken,
        answers: flatQuestions.map((q) => ({
          questionID: q.id,
          childAnswers: answers[q.id] ? [answers[q.id]] : [],
        })),
      })
      setResult(response.result || null)
      setStage('result')
    } catch (error) {
      setErrorMessage(error.message || 'Unable to submit this mock right now.')
      setStage('taking')
    }
  }

  const loadReview = async () => {
    setStage('loading')
    setErrorMessage('')

    try {
      const response = await api.mock.reviewMock({ childID: user?.childID, mockID: mockMeta?.mockID || mockID })
      setReviewReport(response.mockReport || null)
      setReviewIndex(0)
      setStage('review')
    } catch (error) {
      setErrorMessage(error.message || 'Unable to load the review right now.')
      setStage('result')
    }
  }

  const answeredCount = Object.keys(answers).length
  const markedCount = Object.values(markedForReview).filter(Boolean).length
  const unansweredCount = flatQuestions.length - answeredCount

  const timerTone =
    secondsLeft <= 60
      ? 'bg-red-100 text-red-600'
      : secondsLeft <= 300
      ? 'bg-orange-100 text-orange-700'
      : 'bg-amber-100 text-amber-700'

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-cream/90 backdrop-blur-md border-b border-amber-100 py-3 px-4 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-30">
        <button
          onClick={() => navigate('/child-mocks')}
          className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          aria-label="Back to mocks"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="font-display text-lg sm:text-xl font-bold text-slate-900 truncate">{mockTitle}</h1>
        {stage === 'taking' ? (
          <div className="flex items-center gap-2 shrink-0">
            <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition-colors ${timerTone}`}>
              <Clock3 className="h-4 w-4" /> {formatSeconds(secondsLeft)}
            </span>
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="hidden sm:flex items-center gap-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 text-sm font-bold text-white shadow-btn transition-colors"
            >
              <Send className="h-3.5 w-3.5" /> Submit
            </button>
          </div>
        ) : (
          <div className="w-10 shrink-0" />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {errorMessage && (
          <p className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        {(stage === 'loading' || stage === 'submitting') && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <p className="text-sm text-slate-500">{stage === 'submitting' ? 'Submitting your answers…' : 'Loading…'}</p>
          </div>
        )}

        {stage === 'landing' && (
          <div className="max-w-2xl mx-auto bg-white rounded-[1.75rem] p-6 md:p-8 shadow-card-xl border border-amber-100/60 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-pastel-lavender p-4">
                <Clock3 className="h-10 w-10 text-pastel-lavender-ink" />
              </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-600 mb-1">Ready to start?</p>
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-3">{mockTitle}</h2>

            {mockDetails && (
              <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                {(mockDetails.subjects || []).map((subject) => (
                  <span key={subject} className="px-2.5 py-1 bg-pastel-lavender text-pastel-lavender-ink rounded-full text-xs font-semibold flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" /> {subject}
                  </span>
                ))}
                {mockDetails.level && (
                  <span className="px-2.5 py-1 bg-pastel-pink text-pastel-pink-ink rounded-full text-xs font-semibold flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5" /> {mockDetails.level}
                  </span>
                )}
              </div>
            )}

            {mockDetails && (
              <div className="flex items-center justify-center gap-6 mb-6 text-sm text-slate-600">
                <span className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-indigo-400" /> {mockDetails.questions} Questions
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4 text-indigo-400" /> {mockDetails.duration} Min
                </span>
              </div>
            )}

            <p className="text-slate-500 mb-6">
              Read each question carefully and answer as many as you can before the timer runs out.
            </p>

            <div className="rounded-2xl bg-pastel-yellow p-4 mb-6 flex items-start gap-3 text-left">
              <AlertTriangle className="h-5 w-5 shrink-0 text-pastel-yellow-ink mt-0.5" />
              <p className="text-sm text-pastel-yellow-ink">
                Once you start, the timer keeps running until you submit — you can't pause or leave the mock
                halfway through.
              </p>
            </div>

            <button
              onClick={handleStart}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-full text-lg transition-colors shadow-btn"
            >
              Start Mock
            </button>
          </div>
        )}

        {stage === 'taking' && current && (
          <div className="grid gap-6 lg:grid-cols-[1fr_300px] items-start">
            {/* Question column */}
            <div className="order-1">
              <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-500">
                <span>Question {currentIndex + 1} of {flatQuestions.length}</span>
                <span
                  className={`flex items-center gap-1 transition-opacity duration-200 ${
                    savedToastVisible ? 'opacity-100' : 'opacity-0'
                  } text-emerald-600`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Saved
                </span>
              </div>

              <div className="mb-4 h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / flatQuestions.length) * 100}%` }}
                />
              </div>

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
                          onClick={() => selectAnswer(current.id, key)}
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

              <p className="mt-3 text-center text-xs text-slate-400 hidden sm:block">
                <kbd className="rounded border border-slate-200 px-1.5 py-0.5 font-sans">1–9</kbd> select ·{' '}
                <kbd className="rounded border border-slate-200 px-1.5 py-0.5 font-sans">N</kbd> next ·{' '}
                <kbd className="rounded border border-slate-200 px-1.5 py-0.5 font-sans">P</kbd> previous ·{' '}
                <kbd className="rounded border border-slate-200 px-1.5 py-0.5 font-sans">M</kbd> mark for review
              </p>

              {/* Bottom action bar — sticky on shorter viewports so nav never needs a scroll */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 lg:sticky lg:bottom-4 lg:z-20 lg:rounded-full lg:bg-cream/95 lg:backdrop-blur-md lg:shadow-card-lg lg:border lg:border-amber-100/60 lg:px-4 lg:py-2.5">
                <button
                  onClick={() => goToIndex(currentIndex - 1)}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1 rounded-full border-2 border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-40 hover:border-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>

                <div className="flex flex-1 sm:flex-none items-center gap-2 justify-center order-3 sm:order-2">
                  <button
                    onClick={clearResponse}
                    disabled={!answers[current.id]}
                    className="flex items-center gap-1.5 rounded-full border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 disabled:opacity-40 hover:border-red-200 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" /> Clear
                  </button>
                  <button
                    onClick={toggleMarkForReview}
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

                {currentIndex === flatQuestions.length - 1 ? (
                  <button
                    onClick={() => setShowSubmitConfirm(true)}
                    className="order-2 sm:order-3 rounded-full bg-indigo-600 hover:bg-indigo-700 px-10 py-3 text-sm font-bold text-white shadow-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors"
                  >
                    Submit Mock
                  </button>
                ) : (
                  <button
                    onClick={() => goToIndex(currentIndex + 1)}
                    className="order-2 sm:order-3 flex items-center gap-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 px-7 py-3 text-sm font-bold text-white shadow-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors"
                  >
                    Save &amp; Next <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Mobile-only submit shortcut since the header one is hidden below sm: */}
              <button
                onClick={() => setShowSubmitConfirm(true)}
                className="sm:hidden mt-3 w-full flex items-center justify-center gap-1.5 rounded-full border-2 border-indigo-200 text-indigo-600 px-4 py-2.5 text-sm font-bold"
              >
                <Send className="h-4 w-4" /> Submit Mock
              </button>
            </div>

            {/* Sidebar: progress + palette + legend */}
            <div className="order-2 lg:sticky lg:top-24 space-y-4">
              <div className="bg-white rounded-2xl p-4 shadow-card border border-amber-100/60 grid grid-cols-3 gap-2 text-center">
                <div>
                  <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
                  <p className="font-display text-2xl font-bold text-emerald-600 leading-none">{answeredCount}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Answered</p>
                </div>
                <div>
                  <Bookmark className="h-4 w-4 mx-auto mb-1 text-purple-500" />
                  <p className="font-display text-2xl font-bold text-purple-600 leading-none">{markedCount}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Review</p>
                </div>
                <div>
                  <Hourglass className="h-4 w-4 mx-auto mb-1 text-slate-400" />
                  <p className="font-display text-2xl font-bold text-slate-600 leading-none">{unansweredCount}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Remaining</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-card border border-amber-100/60">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">Questions</p>
                <div className="grid grid-cols-6 lg:grid-cols-5 gap-3">
                  {flatQuestions.map((q, i) => {
                    const status = getQuestionStatus(q.id, { answers, markedForReview, visited })
                    const isCurrent = i === currentIndex
                    return (
                      <button
                        key={q.id || i}
                        onClick={() => goToIndex(i)}
                        className={`relative h-10 w-10 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-150 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${STATUS_STYLES[status].dot} ${
                          isCurrent ? 'ring-4 ring-indigo-300 shadow-card-lg scale-110 z-10' : ''
                        }`}
                        aria-label={`Question ${i + 1} — ${STATUS_STYLES[status].label}${isCurrent ? ' (current)' : ''}`}
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
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  {Object.entries(STATUS_STYLES).map(([key, style]) => (
                    <div key={key} className="flex items-center gap-1.5 text-xs text-slate-600">
                      <span className={`h-3 w-3 rounded-full shrink-0 ${style.dot}`} />
                      <span className="truncate">{style.shortLabel}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {stage === 'result' && (
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
                  {result?.correct ?? 0}/{result?.totalQuestions ?? flatQuestions.length}
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
                onClick={loadReview}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-full text-sm transition-colors shadow-btn"
              >
                Review Answers
              </button>
              <button
                onClick={() => navigate('/child-mocks')}
                className="w-full bg-white hover:bg-indigo-50 text-indigo-600 font-bold py-3 rounded-full text-sm transition-colors border-2 border-indigo-200"
              >
                Back to Mocks
              </button>
            </div>
          </div>
        )}

        {stage === 'review' && reviewReport && reviewCurrent && (
          <div className="grid gap-6 lg:grid-cols-[1fr_300px] items-start">
            {/* Question column */}
            <div className="order-1">
              <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-500">
                <span>Review — Question {reviewIndex + 1} of {reviewQuestions.length}</span>
                <button
                  onClick={() => setStage('result')}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Back to result
                </button>
              </div>

              <div className="mb-4 h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${((reviewIndex + 1) / reviewQuestions.length) * 100}%` }}
                />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={reviewCurrent.id || reviewIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="bg-white rounded-[1.75rem] p-6 sm:p-8 shadow-card-xl border border-amber-100/60"
                >
                  {(() => {
                    const childAnswers = reviewCurrent.childAnswers || []
                    const status = getReviewStatus(reviewCurrent)
                    const correctKey = reviewCurrent.answer

                    return (
                      <>
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
                      </>
                    )
                  })()}
                </motion.div>
              </AnimatePresence>

              {/* Nav */}
              <div className="mt-5 flex items-center justify-between gap-3">
                <button
                  onClick={() => setReviewIndex((i) => Math.max(0, i - 1))}
                  disabled={reviewIndex === 0}
                  className="flex items-center gap-1 rounded-full border-2 border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-40 hover:border-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <button
                  onClick={() => setReviewIndex((i) => Math.min(reviewQuestions.length - 1, i + 1))}
                  disabled={reviewIndex === reviewQuestions.length - 1}
                  className="flex items-center gap-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 px-7 py-3 text-sm font-bold text-white shadow-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Sidebar: stats + palette */}
            <div className="order-2 lg:sticky lg:top-24 space-y-4">
              <div className="bg-white rounded-2xl p-4 shadow-card border border-amber-100/60 grid grid-cols-3 gap-2 text-center">
                <div>
                  <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
                  <p className="font-display text-2xl font-bold text-emerald-600 leading-none">
                    {reviewQuestions.filter((q) => getReviewStatus(q) === 'correct').length}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Correct</p>
                </div>
                <div>
                  <XCircle className="h-4 w-4 mx-auto mb-1 text-red-500" />
                  <p className="font-display text-2xl font-bold text-red-600 leading-none">
                    {reviewQuestions.filter((q) => getReviewStatus(q) === 'incorrect').length}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Incorrect</p>
                </div>
                <div>
                  <Hourglass className="h-4 w-4 mx-auto mb-1 text-slate-400" />
                  <p className="font-display text-2xl font-bold text-slate-600 leading-none">
                    {reviewQuestions.filter((q) => getReviewStatus(q) === 'skipped').length}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Skipped</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-card border border-amber-100/60">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">Questions</p>
                <div className="grid grid-cols-6 lg:grid-cols-5 gap-3">
                  {reviewQuestions.map((q, i) => {
                    const status = getReviewStatus(q)
                    const isCurrent = i === reviewIndex
                    return (
                      <button
                        key={q.id || i}
                        onClick={() => setReviewIndex(i)}
                        className={`relative h-10 w-10 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-150 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${REVIEW_STATUS_STYLES[status].dot} ${
                          isCurrent ? 'ring-4 ring-indigo-300 shadow-card-lg scale-110 z-10' : ''
                        }`}
                        aria-label={`Question ${i + 1} — ${REVIEW_STATUS_STYLES[status].label}${isCurrent ? ' (current)' : ''}`}
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
                <div className="space-y-2">
                  {Object.entries(REVIEW_STATUS_STYLES).map(([key, style]) => (
                    <div key={key} className="flex items-center gap-1.5 text-xs text-slate-600">
                      <span className={`h-3 w-3 rounded-full shrink-0 ${style.dot}`} />
                      {style.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit confirmation dialog */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-100 max-w-sm w-full text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-pastel-yellow p-3">
                <Send className="h-6 w-6 text-pastel-yellow-ink" />
              </div>
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 mb-1">Submit this mock?</h3>
            <p className="text-sm text-slate-500 mb-5">You won't be able to change your answers after this.</p>

            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="rounded-xl bg-pastel-mint p-2.5">
                <p className="font-display text-lg font-bold text-slate-900">{answeredCount}</p>
                <p className="text-[10px] font-semibold text-pastel-mint-ink">Answered</p>
              </div>
              <div className="rounded-xl bg-pastel-pink p-2.5">
                <p className="font-display text-lg font-bold text-slate-900">{unansweredCount}</p>
                <p className="text-[10px] font-semibold text-pastel-pink-ink">Unanswered</p>
              </div>
              <div className="rounded-xl bg-pastel-lavender p-2.5">
                <p className="font-display text-lg font-bold text-slate-900">{markedCount}</p>
                <p className="text-[10px] font-semibold text-pastel-lavender-ink">Marked</p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleSubmit}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-full text-sm transition-colors shadow-btn"
              >
                Submit
              </button>
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="w-full bg-white hover:bg-slate-50 text-slate-600 font-bold py-3 rounded-full text-sm transition-colors border-2 border-slate-200"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MockAttemptPage
