import { motion } from 'framer-motion'
import { fadeUp, stagger } from './landingData.js'
import Counter from './Counter.jsx'

function ProgressSection() {
  return (
    <motion.section
      id="progress"
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-100px' }}
      className="mx-auto max-w-7xl px-6 py-8 lg:px-10"
    >
      <div className="relative grid items-center gap-12 overflow-hidden rounded-[2rem] bg-slate-900 p-8 text-white lg:grid-cols-2 lg:p-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl"
        />

        <motion.div variants={fadeUp} className="relative space-y-6">
          <span className="inline-flex rounded-full bg-amber-500/20 px-3 py-1 text-sm font-medium text-amber-200">
            Track every step
          </span>
          <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
            Real mock tests. Real progress you can see.
          </h2>
          <p className="max-w-md text-slate-300">
            Adaptive quizzes generate personalised mock tests, then break down performance
            by subject and topic so parents and children both know exactly where to focus next.
          </p>
          <div className="flex gap-10 pt-2">
            <div>
              <p className="font-display text-3xl font-bold text-amber-400">
                <Counter to={500} suffix="+" />
              </p>
              <p className="text-sm text-slate-400">Mock questions</p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-amber-400">
                <Counter to={4} />
              </p>
              <p className="text-sm text-slate-400">Core subjects</p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-amber-400">
                <Counter to={30} suffix="+" />
              </p>
              <p className="text-sm text-slate-400">Topic areas</p>
            </div>
          </div>
        </motion.div>
        <motion.div variants={fadeUp} className="relative">
          <motion.img
            whileHover={{ rotate: 0, scale: 1.03 }}
            initial={{ rotate: -3 }}
            src="/mocks-available.png"
            alt="Mock tests available"
            className="w-full rounded-2xl shadow-card-xl"
          />
          <motion.img
            initial={{ rotate: 6, opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0, rotate: 6 }}
            whileHover={{ rotate: 0, scale: 1.06 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            viewport={{ once: true }}
            src="/trophy_gold.png"
            alt="Trophy"
            className="absolute -bottom-6 -right-6 h-24 w-24 rounded-2xl shadow-card-xl"
          />
        </motion.div>
      </div>
    </motion.section>
  )
}

export default ProgressSection
