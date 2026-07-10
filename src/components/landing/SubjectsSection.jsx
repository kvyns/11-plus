import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { subjects, fadeUp, stagger } from './landingData.js'

function SubjectsSection() {
  return (
    <motion.section
      id="subjects"
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-100px' }}
      className="mx-auto max-w-7xl px-6 py-20 lg:px-10"
    >
      <motion.div variants={fadeUp} className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Programs</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
            Choose the right program
          </h2>
        </div>
        <p className="max-w-sm text-sm text-slate-500">
          Every subject is broken into focused topics, each with its own icon set and mock questions.
        </p>
      </motion.div>

      <div className="grid gap-8 sm:grid-cols-2">
        {subjects.map((subject) => (
          <motion.div
            key={subject.key}
            variants={fadeUp}
            whileHover={{ y: -6 }}
            className={`group relative overflow-visible rounded-[2rem] p-6 pt-20 shadow-card ${subject.bg}`}
          >
            <img
              src={subject.image}
              alt={subject.name}
              style={{ rotate: `${subject.rotate}deg` }}
              className="absolute -top-8 left-6 h-24 w-24 rounded-full object-cover shadow-card-lg ring-4 ring-white transition-transform duration-300 group-hover:-translate-y-1"
            />
            <span
              style={{ rotate: `${subject.rotate * -1}deg` }}
              className={`absolute right-6 top-4 rounded-full bg-white px-3 py-1 text-xs font-bold ${subject.ink} shadow-card`}
            >
              {subject.tag}
            </span>

            <h3 className="font-display text-xl font-bold text-slate-900">{subject.name}</h3>
            <p className={`mt-1.5 text-sm ${subject.ink} opacity-80`}>{subject.desc}</p>

            <div className="mt-5 flex items-center justify-between">
              <div className="flex -space-x-2.5">
                {subject.topics.map((topic) => (
                  <img
                    key={topic.label}
                    src={topic.icon}
                    alt={topic.label}
                    title={topic.label}
                    className="h-9 w-9 rounded-full border-2 border-white bg-white object-contain p-1 shadow-card"
                  />
                ))}
              </div>
              <motion.span
                whileHover={{ scale: 1.1, rotate: 45 }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-card transition-colors group-hover:bg-indigo-600 group-hover:text-white"
              >
                <ArrowUpRight className="h-4 w-4" />
              </motion.span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

export default SubjectsSection
