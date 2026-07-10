import { motion, useReducedMotion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { marqueeItems } from './landingData.js'

function MarqueeSection() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="overflow-hidden bg-slate-900 py-4">
      <motion.div
        className="flex gap-10 whitespace-nowrap font-display text-lg font-semibold text-white/80"
        animate={reduceMotion ? undefined : { x: ['0%', '-50%'] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      >
        {[...marqueeItems, ...marqueeItems].map((item, i) => (
          <span key={i} className="flex items-center gap-3">
            <Trophy className="h-4 w-4 text-amber-400" /> {item}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

export default MarqueeSection
