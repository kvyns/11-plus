import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Bookmark, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Hourglass, Loader2, Send, XCircle } from 'lucide-react'
import { useAppStore } from '../store/appStore.jsx'
import {
  resolveQuestions, flattenQuestions, formatSeconds, getQuestionOptions,
  STATUS_STYLES, getQuestionStatus, REVIEW_STATUS_STYLES, getReviewStatus,
} from '../lib/mockAttempt.js'
import MockLandingCard from '../components/mock/MockLandingCard.jsx'
import QuestionCard from '../components/mock/QuestionCard.jsx'
import AttemptActionBar from '../components/mock/AttemptActionBar.jsx'
import QuestionPalette from '../components/mock/QuestionPalette.jsx'
import StatsSidebar from '../components/mock/StatsSidebar.jsx'
import ResultCard from '../components/mock/ResultCard.jsx'
import ReviewQuestionCard from '../components/mock/ReviewQuestionCard.jsx'
import SubmitConfirmModal from '../components/mock/SubmitConfirmModal.jsx'

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

  const takingStats = [
    { Icon: CheckCircle2, iconClassName: 'text-emerald-500', value: answeredCount, valueClassName: 'text-emerald-600', label: 'Answered' },
    { Icon: Bookmark, iconClassName: 'text-purple-500', value: markedCount, valueClassName: 'text-purple-600', label: 'Review' },
    { Icon: Hourglass, iconClassName: 'text-slate-400', value: unansweredCount, valueClassName: 'text-slate-600', label: 'Remaining' },
  ]

  const reviewStats = [
    { Icon: CheckCircle2, iconClassName: 'text-emerald-500', value: reviewQuestions.filter((q) => getReviewStatus(q) === 'correct').length, valueClassName: 'text-emerald-600', label: 'Correct' },
    { Icon: XCircle, iconClassName: 'text-red-500', value: reviewQuestions.filter((q) => getReviewStatus(q) === 'incorrect').length, valueClassName: 'text-red-600', label: 'Incorrect' },
    { Icon: Hourglass, iconClassName: 'text-slate-400', value: reviewQuestions.filter((q) => getReviewStatus(q) === 'skipped').length, valueClassName: 'text-slate-600', label: 'Skipped' },
  ]

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
          <MockLandingCard mockTitle={mockTitle} mockDetails={mockDetails} onStart={handleStart} />
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

              <QuestionCard
                current={current}
                currentIndex={currentIndex}
                answers={answers}
                onSelectAnswer={selectAnswer}
              />

              <AttemptActionBar
                current={current}
                currentIndex={currentIndex}
                totalQuestions={flatQuestions.length}
                answers={answers}
                markedForReview={markedForReview}
                onPrevious={() => goToIndex(currentIndex - 1)}
                onNext={() => goToIndex(currentIndex + 1)}
                onClear={clearResponse}
                onToggleMark={toggleMarkForReview}
                onSubmitClick={() => setShowSubmitConfirm(true)}
              />
            </div>

            {/* Sidebar: progress + palette + legend */}
            <div className="order-2 lg:sticky lg:top-24 space-y-4">
              <StatsSidebar stats={takingStats} />
              <QuestionPalette
                questions={flatQuestions}
                getStatus={(q) => getQuestionStatus(q.id, { answers, markedForReview, visited })}
                styles={STATUS_STYLES}
                currentIndex={currentIndex}
                onSelect={goToIndex}
                legendColumns={2}
                labelKey="shortLabel"
              />
            </div>
          </div>
        )}

        {stage === 'result' && (
          <ResultCard
            result={result}
            isResultMode={isResultMode}
            mockTitle={mockTitle}
            mockDetails={mockDetails}
            mockMeta={mockMeta}
            totalQuestions={flatQuestions.length}
            onReviewAnswers={loadReview}
            onBackToMocks={() => navigate('/child-mocks')}
          />
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

              <ReviewQuestionCard reviewCurrent={reviewCurrent} reviewIndex={reviewIndex} />

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
              <StatsSidebar stats={reviewStats} />
              <QuestionPalette
                questions={reviewQuestions}
                getStatus={getReviewStatus}
                styles={REVIEW_STATUS_STYLES}
                currentIndex={reviewIndex}
                onSelect={setReviewIndex}
                legendColumns={1}
                labelKey="label"
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit confirmation dialog */}
      {showSubmitConfirm && (
        <SubmitConfirmModal
          answeredCount={answeredCount}
          unansweredCount={unansweredCount}
          markedCount={markedCount}
          onSubmit={handleSubmit}
          onCancel={() => setShowSubmitConfirm(false)}
        />
      )}
    </div>
  )
}

export default MockAttemptPage
