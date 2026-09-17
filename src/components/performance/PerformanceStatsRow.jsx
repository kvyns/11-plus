import { CheckCircle2, Target, TrendingUp } from 'lucide-react'

function PerformanceStatsRow({ totalCorrect, accuracy, totalQuizzes }) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      <div className="bg-white rounded-2xl p-4 shadow-card border border-amber-100/60 flex flex-col items-center text-center">
        <div className="h-10 w-10 rounded-full bg-pastel-yellow flex items-center justify-center mb-2">
          <CheckCircle2 className="h-5 w-5 text-pastel-yellow-ink" />
        </div>
        <p className="font-display text-2xl font-bold text-slate-900">{totalCorrect}</p>
        <p className="text-xs text-slate-400 mt-1">Correct Answers</p>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-card border border-amber-100/60 flex flex-col items-center text-center">
        <div className="h-10 w-10 rounded-full bg-pastel-mint flex items-center justify-center mb-2">
          <Target className="h-5 w-5 text-pastel-mint-ink" />
        </div>
        <p className="font-display text-2xl font-bold text-slate-900">{accuracy}%</p>
        <p className="text-xs text-slate-400 mt-1">Accuracy</p>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-card border border-amber-100/60 flex flex-col items-center text-center">
        <div className="h-10 w-10 rounded-full bg-pastel-lavender flex items-center justify-center mb-2">
          <TrendingUp className="h-5 w-5 text-pastel-lavender-ink" />
        </div>
        <p className="font-display text-2xl font-bold text-slate-900">{totalQuizzes}</p>
        <p className="text-xs text-slate-400 mt-1">Quizzes Done</p>
      </div>
    </div>
  )
}

export default PerformanceStatsRow
