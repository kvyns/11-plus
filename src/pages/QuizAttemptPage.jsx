import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Bookmark, CheckCircle2, ChevronLeft, Hourglass, Loader2, Send } from 'lucide-react'
import { useAppStore } from '../store/appStore.jsx'
import { useToast } from '../store/toastStore.jsx'
import {
  resolveQuestions, flattenQuestions,
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
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'

const subjectLabels = { ENGLISH: 'English', MATHS: 'Maths', VERBAL: 'Verbal', NON_VERBAL: 'Non-Verbal' }

function QuizAttemptPage() {
  const { subject } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { api, user } = useAppStore()
  const toast = useToast()
  const category = location.state?.category || null
  const topic = location.state?.topic || null
  const quizType = location.state?.quizType || 'FREE_QUIZ'
  const quizTitle = location.state?.title || `${subjectLabels[subject] || subject} Free Quiz`

  // 'landing' -> 'loading' -> 'taking' -> 'submitting' -> 'result' -> 'review'
  const [stage, setStage] = useState('landing')
  const [quizID, setQuizID] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [markedForReview, setMarkedForReview] = useState({})
  const [visited, setVisited] = useState({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [startedAt, setStartedAt] = useState(null)
  const [result, setResult] = useState(null)
  const [reviewReport, setReviewReport] = useState(null)
  const [reviewIndex, setReviewIndex] = useState(0)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [savedToastVisible, setSavedToastVisible] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  const flatQuestions = useMemo(() => flattenQuestions(questions), [questions])
  const current = flatQuestions[currentIndex]

  const reviewQuestions = useMemo(
    () => flattenQuestions(reviewReport?.questions || reviewReport?.answers || []),
    [reviewReport]
  )
  const reviewCurrent = reviewQuestions[reviewIndex]

  // Mark the current question visited the moment it's shown.
  useEffect(() => {
    if (stage !== 'taking' || !current) return
    setVisited((prev) => (prev[current.id] ? prev : { ...prev, [current.id]: true }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, currentIndex, current?.id])

  const handleStart = async () => {
    setStage('loading')

    try {
      const response = await api.quiz.generateQuiz({
        userID: user?.email,
        childID: user?.childID,
        subject,
        category,
        topic,
        quizType,
      })
      const quiz = response.quiz || response.result || response.data || {}
      setQuizID(quiz.quizID || quiz.id || null)
      const resolvedQuestions = await resolveQuestions(quiz.questions || [], api)
      setQuestions(resolvedQuestions)
      setStartedAt(Date.now())
      setStage('taking')
    } catch (error) {
      toast.error(error.message || 'Unable to start this quiz right now.')
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

    const timeTaken = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0

    const submitAnswers = flatQuestions.map((q) => ({
      questionID: q.id,
      childAnswers: answers[q.id] ? [answers[q.id]] : [],
    }))

    try {
      const response = await api.quiz.submitQuiz({
        quizID,
        childID: user?.childID,
        timeTaken,
        answers: submitAnswers,
      })
      setResult(response.result || response.data || null)
      setStage('result')
      toast.success('Quiz submitted! Here are your results.')
    } catch (error) {
      toast.error(error.message || 'Unable to submit this quiz right now.')
      setStage('taking')
    }
  }

  const loadReview = async () => {
    setStage('loading')

    try {
      const response = await api.quiz.reviewQuiz({ quizID, childID: user?.childID })
      const report = response.quiz || response.result || response.data || null
      const rawQuestions = report?.questions || report?.answers || []

      const alreadyResolved = new Map(flattenQuestions(questions).map((q) => [q.id, q]))
      const merged = rawQuestions.map((q) => {
        const known = alreadyResolved.get(q.id)
        if (!known) return q
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

  const handleBackClick = () => {
    if (stage === 'taking' || stage === 'review') {
      setShowExitConfirm(true)
      return
    }
    navigate('/child-dashboard')
  }

  const confirmExit = () => {
    setShowExitConfirm(false)
    navigate('/child-dashboard')
  }

  const answeredCount = Object.keys(answers).length
  const markedCount = Object.values(markedForReview).filter(Boolean).length
  const unansweredCount = flatQuestions.length - answeredCount

  const takingStats = [
    { Icon: CheckCircle2, iconClassName: 'text-emerald-500', value: answeredCount, valueClassName: 'text-emerald-600', label: 'Answered' },
    { Icon: Bookmark, iconClassName: 'text-purple-500', value: markedCount, valueClassName: 'text-purple-600', label: 'Review' },
    { Icon: Hourglass, iconClassName: 'text-slate-400', value: unansweredCount, valueClassName: 'text-slate-600', label: 'Remaining' },
  ]

  const reviewStats = [
    { Icon: CheckCircle2, iconClassName: 'text-emerald-500', value: reviewQuestions.filter((q) => getReviewStatus(q) === 'correct').length, valueClassName: 'text-emerald-600', label: 'Correct' },
    { Icon: Hourglass, iconClassName: 'text-slate-400', value: reviewQuestions.filter((q) => getReviewStatus(q) === 'incorrect').length, valueClassName: 'text-slate-600', label: 'Incorrect' },
    { Icon: Hourglass, iconClassName: 'text-slate-400', value: reviewQuestions.filter((q) => getReviewStatus(q) === 'skipped').length, valueClassName: 'text-slate-600', label: 'Skipped' },
  ]

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-cream/90 backdrop-blur-md border-b border-amber-100 py-3 px-4 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-30">
        <button
          onClick={handleBackClick}
          className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          aria-label="Back to dashboard"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="font-display text-lg sm:text-xl font-bold text-slate-900 truncate">{quizTitle}</h1>
        {stage === 'taking' ? (
          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="hidden sm:flex items-center gap-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 text-sm font-bold text-white shadow-btn transition-colors shrink-0"
          >
            <Send className="h-3.5 w-3.5" /> Submit
          </button>
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
          <MockLandingCard
            mockTitle={quizTitle}
            onStart={handleStart}
            subtitle="Take your time and answer each question carefully — this quiz isn't timed."
            warningText={null}
            startLabel="Start Quiz"
          />
        )}

        {stage === 'taking' && current && (
          <div className="grid gap-6 lg:grid-cols-[1fr_300px] items-start">
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
                submitLabel="Submit Quiz"
              />
            </div>

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
            isResultMode={false}
            mockTitle={quizTitle}
            mockDetails={null}
            mockMeta={null}
            totalQuestions={flatQuestions.length}
            onReviewAnswers={loadReview}
            onBackToMocks={() => navigate('/child-dashboard')}
            completeMessage="Quiz complete!"
            backLabel="Back to Dashboard"
            showLeaderboard={false}
          />
        )}

        {stage === 'review' && reviewReport && reviewCurrent && (
          <div className="grid gap-6 lg:grid-cols-[1fr_300px] items-start">
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
                  Next
                </button>
              </div>
            </div>

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

      {showSubmitConfirm && (
        <SubmitConfirmModal
          answeredCount={answeredCount}
          unansweredCount={unansweredCount}
          markedCount={markedCount}
          onSubmit={handleSubmit}
          onCancel={() => setShowSubmitConfirm(false)}
          title="Submit this quiz?"
        />
      )}

      <ConfirmDialog
        open={showExitConfirm}
        icon={ChevronLeft}
        title="Leave this quiz?"
        message={
          stage === 'taking'
            ? "Your answers so far won't be saved if you leave now."
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

export default QuizAttemptPage
