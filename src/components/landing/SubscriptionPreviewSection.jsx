import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, Gift, Users } from 'lucide-react'
import { fadeUp, stagger, pastelCycle } from './landingData.js'
import fallbackPlans from '../subscription/fallbackPlans.js'
import { getPlanPrice, getPlanCycle } from '../../lib/subscriptionHelpers.js'

function SubscriptionPreviewSection() {
  const navigate = useNavigate()

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
          <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Plans</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
            Choose the right plan
          </h2>
        </div>
        <p className="max-w-sm text-sm text-slate-500">
          Every plan unlocks all four subjects — pick monthly or yearly, and cover one child or the whole family.
        </p>
      </motion.div>

      <div className="grid gap-8 sm:grid-cols-2">
        {fallbackPlans.map((plan, index) => {
          const palette = pastelCycle[index % pastelCycle.length]
          const cycle = getPlanCycle(plan)

          return (
            <motion.button
              key={`${plan.name}-${plan.cycle}`}
              onClick={() => navigate('/subscription')}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className={`group relative overflow-visible rounded-[2rem] p-6 pt-20 text-left shadow-card ${palette.bg}`}
            >
              <div
                className={`absolute -top-8 left-6 flex h-24 w-24 items-center justify-center rounded-full shadow-card-lg ring-4 ring-white ${palette.iconBg}`}
              >
                <Gift className={`h-10 w-10 ${palette.ink}`} />
              </div>
              <span className={`absolute right-6 top-4 rounded-full bg-white px-3 py-1 text-xs font-bold ${palette.ink} shadow-card`}>
                {plan.badge || (cycle === 'yearly' ? 'Yearly' : 'Monthly')}
              </span>

              <h3 className="font-display text-xl font-bold text-slate-900">
                {plan.name} <span className="font-semibold text-slate-500">— {getPlanPrice(plan)}</span>
              </h3>
              <p className={`mt-1.5 text-sm ${palette.ink} opacity-80`}>{plan.description}</p>

              <div className="mt-5 flex items-center justify-between">
                <span className={`flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold ${palette.ink} shadow-card`}>
                  <Users className="h-3.5 w-3.5" />
                  {plan.childLimit > 1 ? `Up to ${plan.childLimit} children` : '1 child'}
                </span>
                <motion.span
                  whileHover={{ scale: 1.1, rotate: 45 }}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-card transition-colors group-hover:bg-indigo-600 group-hover:text-white"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </motion.span>
              </div>
            </motion.button>
          )
        })}
      </div>
    </motion.section>
  )
}

export default SubscriptionPreviewSection
