import { motion } from 'framer-motion'
import { features, pastelCycle, fadeUp, stagger } from './landingData.js'

const [heroFeature, ...restFeatures] = features

function WhyUsSection() {
  return (
    <motion.section
      id="why"
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-100px' }}
      className="bg-lavender-50 px-6 py-16 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div variants={fadeUp} className="mb-12 max-w-xl">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Why 11+ eLearning</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
            Everything your child needs to succeed
          </h2>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mb-6 flex flex-col items-start gap-6 rounded-[2rem] bg-white p-8 shadow-card-xl md:flex-row md:items-center"
        >
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
            <heroFeature.icon className="h-7 w-7" />
          </div>
          <div>
            <p className="font-display text-xl font-bold text-slate-900">{heroFeature.title}</p>
            <p className="mt-1 max-w-2xl text-base text-slate-500">{heroFeature.desc}</p>
          </div>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {restFeatures.map((feature, i) => {
            const palette = pastelCycle[i % pastelCycle.length]
            return (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className={`rounded-2xl p-5 shadow-card transition-shadow hover:shadow-card-lg ${palette.bg}`}
              >
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full ${palette.iconBg} ${palette.ink}`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <p className="font-display font-bold text-slate-900">{feature.title}</p>
                <p className={`mt-1 text-sm ${palette.ink} opacity-80`}>{feature.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.section>
  )
}

export default WhyUsSection
