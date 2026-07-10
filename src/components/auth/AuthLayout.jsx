import { motion } from 'framer-motion'
import { CheckCircle2, ChevronLeft } from 'lucide-react'
import StickerBadge from '../landing/StickerBadge.jsx'

const checklist = [
  'Structured lessons across all 4 subjects',
  'Realistic mock tests with instant feedback',
  'Progress tracking parents can trust',
]

function AuthLayout({ children, maxWidth = 'max-w-md', onBack }) {
  return (
    <div className="bg-cream lg:flex lg:h-screen lg:overflow-hidden">
      {/* Illustration panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-lavender-50 to-pastel-lavender lg:flex lg:h-full lg:w-[46%] lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 -top-16 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -right-10 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl"
        />

        <a href="/" className="relative z-10 flex items-center gap-3">
          <img src="/11plus.png" alt="11+ Logo" className="h-10 w-10" />
          <span className="font-display text-lg font-bold text-slate-900">11+ eLearning</span>
        </a>

        {/* Photo collage */}
        <div className="relative z-10 mx-auto my-8 w-full max-w-sm">
          <div className="grid grid-cols-2 gap-4 px-2">
            <motion.img
              initial={{ opacity: 0, y: 20, rotate: -6 }}
              animate={{ opacity: 1, y: 0, rotate: -6 }}
              transition={{ duration: 0.6 }}
              src="/maths.jpeg"
              alt="Maths program"
              className="aspect-square w-full justify-self-end rounded-[1.5rem] object-cover shadow-card-xl ring-4 ring-white xl:h-32 xl:w-32"
            />
            <motion.img
              initial={{ opacity: 0, y: 20, rotate: 5 }}
              animate={{ opacity: 1, y: 0, rotate: 5 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              src="/english.jpeg"
              alt="English program"
              className="aspect-square w-full justify-self-start rounded-[1.5rem] object-cover shadow-card-xl ring-4 ring-white xl:h-32 xl:w-32"
            />
            <motion.img
              initial={{ opacity: 0, y: 20, rotate: 4 }}
              animate={{ opacity: 1, y: 0, rotate: 4 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              src="/verbal.jpeg"
              alt="Verbal reasoning program"
              className="aspect-square w-full justify-self-end rounded-[1.5rem] object-cover shadow-card-xl ring-4 ring-white xl:h-32 xl:w-32"
            />
            <motion.img
              initial={{ opacity: 0, y: 20, rotate: -4 }}
              animate={{ opacity: 1, y: 0, rotate: -4 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              src="/non-verbal.jpeg"
              alt="Non-verbal reasoning program"
              className="aspect-square w-full justify-self-start rounded-[1.5rem] object-cover shadow-card-xl ring-4 ring-white xl:h-32 xl:w-32"
            />
          </div>

          <StickerBadge
            icon={CheckCircle2}
            label="500+ Mock Questions"
            sublabel="Across all subjects"
            rotate={-3}
            delay={0.5}
            className="relative z-10 mx-auto -mt-4 w-fit"
          />
        </div>

        <div className="relative z-10">
          <h2 className="font-display text-3xl font-bold leading-tight text-slate-900">
            Learning made{' '}
            <span className="relative inline-block font-accent text-4xl font-bold text-indigo-600">
              simple
              <svg
                aria-hidden="true"
                viewBox="0 0 200 20"
                className="absolute -bottom-1.5 left-0 w-full text-amber-400"
              >
                <path d="M2 14 C60 4, 140 4, 198 14" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </h2>
          <p className="mt-2 max-w-sm text-sm text-slate-600">
            Everything your child needs to walk into the 11+ exam with confidence.
          </p>

          <ul className="mt-6 space-y-2.5">
            {checklist.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center px-4 py-10 lg:h-full lg:justify-center lg:overflow-y-auto lg:px-10 lg:py-6">
        <div className={`w-full ${maxWidth}`}>
          {onBack && (
            <button
              onClick={onBack}
              aria-label="Go back"
              className="mb-4 flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-600 lg:-ml-2"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
