import { motion } from 'framer-motion'

function StickerBadge({ icon: Icon, label, sublabel, rotate = -6, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, rotate: rotate * 2 }}
      whileInView={{ opacity: 1, scale: 1, rotate }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 220, damping: 16, delay }}
      whileHover={{ rotate: 0, scale: 1.04 }}
      className={`flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-card-xl ${className}`}
    >
      {Icon && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <Icon className="h-4.5 w-4.5" />
        </div>
      )}
      <div className="text-left leading-tight">
        <p className="text-sm font-bold text-slate-900">{label}</p>
        {sublabel && <p className="text-xs text-slate-500">{sublabel}</p>}
      </div>
    </motion.div>
  )
}

export default StickerBadge
