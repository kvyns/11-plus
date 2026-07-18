import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Bookmark, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Hourglass, Loader2, Send, XCircle } from 'lucide-react'
import { useAppStore } from '../store/appStore.jsx'
import { useToast } from '../store/toastStore.jsx'
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
import LeaderboardModal from '../components/mock/LeaderboardModal.jsx'
import LeaderboardUnavailableModal from '../components/mock/LeaderboardUnavailableModal.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'

function MockAttemptPage() {
  const { mockID } = useParams()
  const location = useLocation()
  const isResultMode = location.pathname.endsWith('/result')
  const navigate = useNavigate()
  const { api, user } = useAppStore()
  const toast = useToast()
  // Passed from the mocks list so the title/subjects/duration are available
  // immediately on the landing screen, before startMock has even run (the
  // API's own start/result responses don't include this metadata).
  const mockDetails = location.state?.mockDetails || null
  const mockTitle = mockDetails?.title || 'Mock Test'

  // 'landing' -> 'loading' -> 'taking' -> 'submitting' -> 'result' -> 'review'
  const [stage, setStage] = useState(isResultMode ? 'loading' : 'landing')
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
  const [leaderboardData, setLeaderboardData] = useState(null)
  const [showLeaderboardUnavailable, setShowLeaderboardUnavailable] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

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
          setResult(response.mockResult || response.result || response.data || null)
          setMockMeta({ mockID })
          setStage('result')
        }
      } catch (error) {
        if (!isCancelled) {
          toast.error(error.message || 'Unable to load this result right now.')
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
      toast.error(error.message || 'Unable to start this mock right now.')
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

    const timeTaken = mockMeta ? mockMeta.durationMins * 60 - secondsLeft : 0

    const submitAnswers = flatQuestions.map((q) => ({
      questionID: q.id,
      childAnswers: answers[q.id] ? [answers[q.id]] : [],
    }))

    // Diagnostic only: if two flat questions share the same id (e.g. a
    // comprehension passage's sub-questions colliding with another
    // question), the submit payload ends up with duplicate questionID
    // entries. The backend can then only grade one of each duplicate pair,
    // and silently scores the other occurrence as skipped even though the
    // child answered it on screen — this would explain "submitted but a
    // few came back as skipped" without any local answer actually missing.
    const idCounts = {}
    flatQuestions.forEach((q) => { idCounts[q.id] = (idCounts[q.id] || 0) + 1 })
    const duplicateIds = Object.entries(idCounts).filter(([, count]) => count > 1)
    if (duplicateIds.length > 0) {
      // eslint-disable-next-line no-console
      console.warn('[MockAttemptPage] duplicate question ids in this mock — submit payload will collapse these:', duplicateIds)
    }

    try {
      const response = await api.mock.submitMock({
        mockID: mockMeta?.mockID || mockID,
        childID: user?.childID,
        timeTaken,
        answers: submitAnswers,
      })
      setResult(response.result || response.mockResult || response.data || null)
      setStage('result')
      toast.success('Mock submitted! Here are your results.')
    } catch (error) {
      toast.error(error.message || 'Unable to submit this mock right now.')
      setStage('taking')
    }
  }

  const loadReview = async () => {
    setStage('loading')

    try {
      const response = await api.mock.reviewMock({ childID: user?.childID, mockID: mockMeta?.mockID || mockID })
      const report = response.mockReport || response.result || response.data || null
      const rawQuestions = report?.questions || report?.answers || []

      // Attempted this mock in the current session? Its full content (question
      // text/options) is already resolved in local `questions` state from
      // handleStart — merge it in first so we don't re-hit the network for
      // data we already have. Anything still missing (e.g. a review opened
      // via a direct link, with no local `questions` state) falls through to
      // resolveQuestions(), the same S3-key resolver used when starting a mock.
      const alreadyResolved = new Map(flattenQuestions(questions).map((q) => [q.id, q]))
      const merged = rawQuestions.map((q) => {
        const known = alreadyResolved.get(q.id)
        if (!known) return q
        // Only backfill fields the review item is missing — never let a
        // null/undefined field from the review response clobber content
        // we already resolved during the exam.
        const filled = { ...q }
        Object.entries(known).forEach(([key, value]) => {
          if (filled[key] == null && value != null) filled[key] = value
        })
        return filled
      })
      const resolved = await resolveQuestions(merged, api)

      setReviewReport(report ? { ...report, questions: resolved } : null)
      setReviewIndex(0)
      setStage('review')
    } catch (error) {
      toast.error(error.message || 'Unable to load the review right now.')
      setStage('result')
    }
  }

  const handleViewLeaderboard = async () => {
    try {
      const response = await api.mock.mockLeaderboard({ mockID: mockMeta?.mockID || mockID })
      setLeaderboardData({
        title: mockTitle,
        top10: response.top10 || [],
        myRank: response.myRank || null,
      })
    } catch {
      setShowLeaderboardUnavailable(true)
    }
  }

  // Submitting an exam already has its own confirm modal; leaving mid-exam
  // (or mid-review) via the header back arrow had none — an unguarded exit
  // right next to a guarded one. Landing/result stages have nothing to lose,
  // so only guard the two stages where progress/timer state is live.
  const handleBackClick = () => {
    if (stage === 'taking' || stage === 'review') {
      setShowExitConfirm(true)
      return
    }
    navigate('/child-mocks')
  }

  const confirmExit = () => {
    setShowExitConfirm(false)
    navigate('/child-mocks')
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
          onClick={handleBackClick}
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

      <div className={`max-w-7xl mx-auto px-4 py-6 sm:py-8 ${stage === 'taking' || stage === 'review' ? 'pb-28 sm:pb-24' : ''}`}>
        {(stage === 'loading' || stage === 'submitting') && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <p className="text-sm text-slate-500">{stage === 'submitting' ? 'Submitting your answers…' : 'Loading…'}</p>
          </div>
        )}

        {stage === 'landing' && (
          <MockLandingCard mockTitle={mockTitle} onStart={handleStart} />
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
            onViewLeaderboard={handleViewLeaderboard}
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

              {/* Nav — fixed to the viewport so it never shifts as question content changes height */}
              <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 bg-cream/95 backdrop-blur-md shadow-card-lg border-t border-amber-100/60 px-4 py-3 sm:px-6">
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

      {leaderboardData && (
        <LeaderboardModal data={leaderboardData} onClose={() => setLeaderboardData(null)} />
      )}

      {showLeaderboardUnavailable && (
        <LeaderboardUnavailableModal onClose={() => setShowLeaderboardUnavailable(false)} />
      )}

      <ConfirmDialog
        open={showExitConfirm}
        icon={ChevronLeft}
        title="Leave this mock?"
        message={
          stage === 'taking'
            ? "The timer keeps running until time's up — leaving now won't pause it, and you'll return to a shorter clock."
            : "You'll need to reopen the review to see it again."
        }
        confirmLabel="Leave"
        destructive
        onConfirm={confirmExit}
        onCancel={() => setShowExitConfirm(false)}
      />
    </div>
  )
}

export default MockAttemptPage
