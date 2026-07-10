import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, School, Trophy } from 'lucide-react'
import StickerBadge from './StickerBadge.jsx'

function Hero({ navigate }) {
  return (
    <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-24 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-10 lg:pt-20">
      <div className="text-left">

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-5 max-w-xl font-display text-5xl font-bold leading-[1.05] text-slate-900 sm:text-6xl"
        >
          Ace with 11+.
          <br />
          Learning made{' '}
          <span className="relative inline-block font-accent text-6xl font-bold mr-1 text-indigo-600 sm:text-7xl">
            simple
            <svg
              aria-hidden="true"
              viewBox="0 0 200 20"
              className="absolute -bottom-2 left-0 w-full text-amber-400"
            >
              <path d="M2 14 C60 4, 140 4, 198 14" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
            </svg>
          </span>
          .
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-md text-lg text-slate-500"
        >
          English, Maths, Verbal and Non-Verbal Reasoning — structured lessons, adaptive quizzes,
          and realistic mock tests that build real exam confidence.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center gap-5"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/explore')}
            className="flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-8 py-3.5 text-lg font-semibold text-white shadow-btn transition hover:bg-indigo-700"
          >
            Get Started <ArrowRight className="h-5 w-5" />
          </motion.button>
          <button
            onClick={() => navigate('/schools')}
            className="flex items-center gap-1.5 text-base font-semibold text-slate-700 underline decoration-amber-400 decoration-2 underline-offset-4 transition hover:text-indigo-600"
          >
            <School className="h-4 w-4" /> Explore Schools
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 flex items-center gap-3 text-sm text-slate-500"
        >
          <div className="flex -space-x-3">
            {['bg-rose-300', 'bg-indigo-300', 'bg-emerald-300', 'bg-amber-300'].map((c, i) => (
              <span key={i} className={`h-8 w-8 rounded-full border-2 border-cream ${c}`} />
            ))}
          </div>
          <p>
            <span className="font-bold text-slate-900">Parents trust us</span> to prepare their kids for exam day.
          </p>
        </motion.div>
      </div>

      {/* Photo collage */}
      <div className="relative mx-auto h-[420px] w-full max-w-md lg:h-[480px]">
        <motion.img
          initial={{ opacity: 0, y: 30, rotate: -6 }}
          animate={{ opacity: 1, y: 0, rotate: -6 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          src="/maths.jpeg"
          alt="Maths program"
          className="absolute left-2 top-4 h-56 w-44 rounded-[2rem] object-cover shadow-card-xl ring-4 ring-white sm:h-64 sm:w-52"
        />
        <motion.img
          initial={{ opacity: 0, y: 30, rotate: 5 }}
          animate={{ opacity: 1, y: 0, rotate: 5 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          src="/english.jpeg"
          alt="English program"
          className="absolute right-0 top-0 h-48 w-40 rounded-[2rem] object-cover shadow-card-xl ring-4 ring-white sm:h-56 sm:w-48"
        />
        <motion.img
          initial={{ opacity: 0, y: 30, rotate: -3 }}
          animate={{ opacity: 1, y: 0, rotate: -3 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          src="/non-verbal.jpeg"
          alt="Non-verbal reasoning program"
          className="absolute bottom-2 right-4 h-44 w-44 rounded-[2rem] object-cover shadow-card-xl ring-4 ring-white sm:h-52 sm:w-52"
        />

        <StickerBadge
          icon={Trophy}
          label="500+ Mock Questions"
          sublabel="Across all subjects"
          rotate={-6}
          delay={0.6}
          className="absolute -left-4 bottom-8 sm:-left-8"
        />
        <StickerBadge
          icon={BadgeCheck}
          label="4 Core Subjects"
          sublabel="Fully covered"
          rotate={5}
          delay={0.75}
          className="absolute -right-2 bottom-0 sm:right-0"
        />
      </div>
    </section>
  )
}

export default Hero
