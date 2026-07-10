import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { School, GraduationCap, Brain, ArrowUpRight } from 'lucide-react'

const options = [
  {
    icon: School,
    title: 'Explore Schools',
    desc: 'Find the best schools for 11+ preparation',
    pastel: 'bg-pastel-yellow',
    ink: 'text-pastel-yellow-ink',
    path: '/schools',
  },
  {
    icon: GraduationCap,
    title: 'Mock Tests',
    desc: 'Practice with realistic exam simulations',
    pastel: 'bg-pastel-lavender',
    ink: 'text-pastel-lavender-ink',
    path: '/mock-tests',
  },
  {
    icon: Brain,
    title: 'Practice Questions',
    desc: 'Sharpen skills with topic-wise questions',
    pastel: 'bg-pastel-mint',
    ink: 'text-pastel-mint-ink',
    path: '/practice',
  },
]

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const fadeUp = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } }

function ExplorePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-10">
      {/* Logo */}
      <div className="w-full max-w-md text-center mb-8">
        <div className="flex justify-center mb-4">
          <img src="/11plus.png" alt="11+ Logo" className="h-24 w-24" />
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-1">11+ eLearning</h1>
        <p className="text-slate-500">Choose how you want to continue</p>
      </div>

      {/* Options Cards */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="w-full max-w-md space-y-4 mb-8"
      >
        {options.map((option) => (
          <motion.button
            key={option.title}
            variants={fadeUp}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(option.path)}
            className={`group w-full flex items-center gap-4 p-4 rounded-2xl shadow-card transition-shadow hover:shadow-card-lg text-left ${option.pastel}`}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/70">
              <option.icon className={`h-6 w-6 ${option.ink}`} />
            </div>
            <div className="flex-1">
              <p className="font-display font-bold text-slate-900">{option.title}</p>
              <p className={`text-sm mt-0.5 ${option.ink} opacity-80`}>{option.desc}</p>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-700 shadow-card transition-colors group-hover:bg-indigo-600 group-hover:text-white">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Bottom Login/Register Links */}
      <div className="w-full max-w-md space-y-3">
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-full text-lg transition-all duration-200 shadow-btn"
        >
          Login
        </button>
        <button
          onClick={() => navigate('/register')}
          className="w-full bg-white hover:bg-indigo-50 text-indigo-600 font-semibold py-3.5 rounded-full text-lg transition-all duration-200 border border-indigo-200 shadow-card"
        >
          Register
        </button>
      </div>
    </div>
  )
}

export default ExplorePage
