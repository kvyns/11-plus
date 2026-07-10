import { CalendarDays, Clock3, FileText, GraduationCap } from 'lucide-react'
import { subjectArt } from '../../lib/mockHelpers.js'

function MockCard({ title, subjectKey, live, questions, duration, date, level, headerExtra, tagsRow, footnote, actions }) {
  return (
    <div className="relative bg-white rounded-2xl p-6 shadow-card hover:shadow-card-lg transition-shadow border border-amber-100/60 text-left">
      {live && (
        <span className="absolute -top-2 right-4 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-bold text-slate-900 shadow-card-lg tracking-wide">
          LIVE
        </span>
      )}

      <div className="flex gap-4 mb-4">
        <img
          src={subjectArt[subjectKey]}
          alt={`${subjectKey} subject`}
          className="h-16 w-16 shrink-0 rounded-full object-cover shadow-card ring-4 ring-white"
        />
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold text-slate-900 mb-1 truncate pr-6">{title}</h3>
          {headerExtra}
        </div>
      </div>

      {tagsRow && <div className="flex flex-wrap gap-1.5 mb-4">{tagsRow}</div>}

      <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-sm text-slate-600 mb-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
          {questions} Questions
        </div>
        <div className="flex items-center gap-1.5">
          <Clock3 className="h-4 w-4 text-indigo-400 shrink-0" />
          {duration} Min
        </div>
        <div className="flex items-center gap-1.5 col-span-2">
          <CalendarDays className="h-4 w-4 text-indigo-400 shrink-0" />
          {date}
        </div>
        {level && (
          <div className="flex items-center gap-1.5 col-span-2">
            <GraduationCap className="h-4 w-4 text-indigo-400 shrink-0" />
            {level}
          </div>
        )}
        {footnote}
      </div>

      <div className="flex flex-col gap-2.5">{actions}</div>
    </div>
  )
}

export default MockCard
