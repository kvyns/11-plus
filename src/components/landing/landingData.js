import { BookOpen, Target, Zap, Shield, Award, Star } from 'lucide-react'

export const features = [
  { icon: BookOpen, title: 'Structured Learning', desc: 'Clear, step-by-step study plans and organized mock tests that build steadily toward exam day, not last-minute cramming.' },
  { icon: Target, title: 'Exam Simulation', desc: 'Mirrors real exam conditions.' },
  { icon: Zap, title: 'Smart Analytics', desc: 'Insights into strengths and weak spots.' },
  { icon: Shield, title: 'Anytime, Anywhere', desc: 'Study on any device, on the go.' },
  { icon: Award, title: 'Current Curriculum', desc: 'Always aligned to current formats.' },
  { icon: Star, title: 'Progress Tracking', desc: 'Detailed reports the whole way.' },
]

export const pastelCycle = [
  { bg: 'bg-pastel-yellow', ink: 'text-pastel-yellow-ink', iconBg: 'bg-white/70' },
  { bg: 'bg-pastel-pink', ink: 'text-pastel-pink-ink', iconBg: 'bg-white/70' },
  { bg: 'bg-pastel-mint', ink: 'text-pastel-mint-ink', iconBg: 'bg-white/70' },
  { bg: 'bg-pastel-lavender', ink: 'text-pastel-lavender-ink', iconBg: 'bg-white/70' },
]

export const marqueeItems = [
  'Comprehension', 'Algebra', 'Logic Puzzles', 'Geometry', 'Vocabulary',
  'Matrices', 'Sequences', 'Grammar', 'Fractions', 'Spatial Reasoning',
]

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}
