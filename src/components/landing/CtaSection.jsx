import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'

function CtaSection() {
  return (
    <motion.section
      id="cta"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
      className="relative mx-auto max-w-5xl px-6 pb-24 pt-12"
    >
      <div className="relative overflow-visible rounded-[2rem] bg-gradient-to-br from-lavender-100 to-pastel-lavender p-8 text-slate-900 shadow-card-xl lg:p-12">
        <motion.span
          initial={{ opacity: 0, y: -10, rotate: -8 }}
          whileInView={{ opacity: 1, y: 0, rotate: -8 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="absolute -top-5 left-10 hidden rounded-full bg-amber-400 px-4 py-1.5 text-sm font-bold text-slate-900 shadow-card-lg sm:block"
        >
          Free consultation
        </motion.span>
        <motion.span
          initial={{ opacity: 0, y: -10, rotate: 6 }}
          whileInView={{ opacity: 1, y: 0, rotate: 6 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35, type: 'spring', stiffness: 200 }}
          className="absolute -top-4 right-16 hidden rounded-full bg-white px-4 py-1.5 text-sm font-bold text-indigo-700 shadow-card-lg lg:block"
        >
          15 min setup
        </motion.span>

        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Not sure where to start?</h2>
            <p className="mt-3 max-w-md text-slate-600">
              Leave your details and we'll help you pick the right subjects and pace for your child's 11+ journey.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-indigo-700">
              <GraduationCap className="h-4 w-4" /> Free starter consultation, no commitment
            </div>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="space-y-3 rounded-2xl bg-white/70 p-6 shadow-card backdrop-blur"
          >
            <div>
              <label htmlFor="parent-name" className="sr-only">Parent's name</label>
              <input
                id="parent-name"
                type="text"
                placeholder="Parent's name"
                className="w-full rounded-full border border-indigo-100 bg-white px-5 py-3 text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label htmlFor="parent-email" className="sr-only">Email address</label>
              <input
                id="parent-email"
                type="email"
                placeholder="Email address"
                className="w-full rounded-full border border-indigo-100 bg-white px-5 py-3 text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-400"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full rounded-full bg-amber-500 py-3.5 text-lg font-semibold text-white shadow-btn transition hover:bg-amber-600"
            >
              Notify Me
            </motion.button>
          </form>
        </div>
      </div>
    </motion.section>
  )
}

export default CtaSection
