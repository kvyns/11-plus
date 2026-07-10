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

export const subjects = [
  {
    key: 'english',
    name: 'English',
    tag: 'Core subject',
    image: '/english.jpeg',
    bg: 'bg-pastel-pink',
    ink: 'text-pastel-pink-ink',
    rotate: -2,
    desc: 'Comprehension, grammar, vocabulary and creative writing.',
    topics: [
      { icon: '/english/comprehension.png', label: 'Comprehension' },
      { icon: '/english/grammar.png', label: 'Grammar' },
      { icon: '/english/vocabulary.png', label: 'Vocabulary' },
      { icon: '/english/creative_writing.png', label: 'Creative Writing' },
    ],
  },
  {
    key: 'maths',
    name: 'Maths',
    tag: 'Core subject',
    image: '/maths.jpeg',
    bg: 'bg-pastel-lavender',
    ink: 'text-pastel-lavender-ink',
    rotate: 2,
    desc: 'Arithmetic, algebra, geometry, fractions and word problems.',
    topics: [
      { icon: '/maths/algebra.png', label: 'Algebra' },
      { icon: '/maths/fractions.png', label: 'Fractions' },
      { icon: '/maths/geometry.png', label: 'Geometry' },
      { icon: '/maths/word_problems.png', label: 'Word Problems' },
    ],
  },
  {
    key: 'verbal',
    name: 'Verbal Reasoning',
    tag: 'Reasoning',
    image: '/verbal.jpeg',
    bg: 'bg-pastel-mint',
    ink: 'text-pastel-mint-ink',
    rotate: 2,
    desc: 'Logic, sequences, codes and mathematical reasoning.',
    topics: [
      { icon: '/verbal/logic.png', label: 'Logic' },
      { icon: '/verbal/sequences.png', label: 'Sequences' },
      { icon: '/verbal/codes_sequences.png', label: 'Codes' },
      { icon: '/verbal/words_language.png', label: 'Words & Language' },
    ],
  },
  {
    key: 'non-verbal',
    name: 'Non-Verbal Reasoning',
    tag: 'Reasoning',
    image: '/non-verbal.jpeg',
    bg: 'bg-pastel-yellow',
    ink: 'text-pastel-yellow-ink',
    rotate: -2,
    desc: '2D/3D shapes, matrices, patterns and transformations.',
    topics: [
      { icon: '/non-verbal/matrices.png', label: 'Matrices' },
      { icon: '/non-verbal/patterns.png', label: 'Patterns' },
      { icon: '/non-verbal/2d_shapes.png', label: '2D Shapes' },
      { icon: '/non-verbal/spatial_reasoning.png', label: 'Spatial Reasoning' },
    ],
  },
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
