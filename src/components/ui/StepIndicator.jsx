import { Fragment } from 'react'

function StepIndicator({ steps, currentIndex }) {
  return (
    <div className="flex items-center">
      {steps.map((label, i) => {
        const done = i < currentIndex
        const active = i === currentIndex

        return (
          <Fragment key={label}>
            <div className="flex flex-col items-center flex-1">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  done || active ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {done ? '✓' : i + 1}
              </div>
              <span
                className={`mt-1 text-[11px] font-semibold text-center ${
                  active ? 'text-indigo-600' : done ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div
                className={`h-1 flex-1 -mt-5 rounded-full transition-colors ${
                  i < currentIndex ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}

export default StepIndicator
