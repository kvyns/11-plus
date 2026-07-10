import { useNavigate } from 'react-router-dom'
import {
  motion, useMotionValue, useSpring, useTransform, useInView, useReducedMotion,
} from 'framer-motion'
import { useEffect, useRef } from 'react'
import {
  BookOpen, Target, Zap, Shield, Award, Star,
  School, GraduationCap, ArrowRight, ArrowUpRight, Trophy, BadgeCheck, LayoutDashboard,
} from 'lucide-react'
import { useAppStore } from '../store/appStore.jsx'
import WaveDivider from '../components/landing/WaveDivider.jsx'
import StickerBadge from '../components/landing/StickerBadge.jsx'
import MobileNav from '../components/landing/MobileNav.jsx'
import Footer from '../components/landing/Footer.jsx'

const features = [
  { icon: BookOpen, title: 'Structured Learning', desc: 'Clear, step-by-step study plans and organized mock tests that build steadily toward exam day, not last-minute cramming.' },
  { icon: Target, title: 'Exam Simulation', desc: 'Mirrors real exam conditions.' },
  { icon: Zap, title: 'Smart Analytics', desc: 'Insights into strengths and weak spots.' },
  { icon: Shield, title: 'Anytime, Anywhere', desc: 'Study on any device, on the go.' },
  { icon: Award, title: 'Current Curriculum', desc: 'Always aligned to current formats.' },
  { icon: Star, title: 'Progress Tracking', desc: 'Detailed reports the whole way.' },
]
const [heroFeature, ...restFeatures] = features

const pastelCycle = [
  { bg: 'bg-pastel-yellow', ink: 'text-pastel-yellow-ink', iconBg: 'bg-white/70' },
  { bg: 'bg-pastel-pink', ink: 'text-pastel-pink-ink', iconBg: 'bg-white/70' },
  { bg: 'bg-pastel-mint', ink: 'text-pastel-mint-ink', iconBg: 'bg-white/70' },
  { bg: 'bg-pastel-lavender', ink: 'text-pastel-lavender-ink', iconBg: 'bg-white/70' },
]

const subjects = [
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

const marqueeItems = [
  'Comprehension', 'Algebra', 'Logic Puzzles', 'Geometry', 'Vocabulary',
  'Matrices', 'Sequences', 'Grammar', 'Fractions', 'Spatial Reasoning',
]

function Counter({ to, suffix = '', duration = 1.4 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { duration: duration * 1000, bounce: 0 })
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString())

  useEffect(() => {
    if (inView) motionValue.set(to)
  }, [inView, to, motionValue])

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  )
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

function LandingPage() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const { isLoggedIn, accountType } = useAppStore()
  const dashboardPath = accountType === 'child' ? '/child-dashboard' : '/dashboard'

  return (
    <div className="min-h-screen overflow-x-hidden bg-cream">
      {/* NAV */}
      <header className="sticky top-0 z-30 border-b border-amber-100 bg-cream/90 backdrop-blur">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <img src="/11plus.png" alt="11+ Logo" className="h-10 w-10" />
            <span className="font-display text-lg font-bold text-slate-900">11+ eLearning</span>
          </div>
          <nav className="hidden gap-8 font-display text-sm font-semibold text-slate-600 md:flex">
            <a href="#why" className="transition hover:text-indigo-600">Why us</a>
            <a href="#subjects" className="transition hover:text-indigo-600">Subjects</a>
            <a href="#progress" className="transition hover:text-indigo-600">Progress</a>
            <a href="#cta" className="transition hover:text-indigo-600">Get started</a>
          </nav>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <button
                onClick={() => navigate(dashboardPath)}
                className="hidden items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-btn transition hover:bg-indigo-700 sm:flex"
              >
                <LayoutDashboard className="h-4 w-4" />
                Go to Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="hidden rounded-full px-5 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 sm:block"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="hidden rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-btn transition hover:bg-indigo-700 sm:block"
                >
                  Register
                </button>
              </>
            )}
            <MobileNav />
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-24 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-10 lg:pt-20">
        <div className="text-left">

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-5 max-w-xl font-display text-5xl font-bold leading-[1.05] text-slate-900 sm:text-6xl"
          >
            Ace with 11+.
            <br />
            Learning made{' '}
            <span className="relative inline-block font-accent text-6xl font-bold mr-1 text-indigo-600 sm:text-7xl">
              simple 
              <svg
                aria-hidden="true"
                viewBox="0 0 200 20"
                className="absolute -bottom-2 left-0 w-full text-amber-400"
              >
                <path d="M2 14 C60 4, 140 4, 198 14" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
              </svg>
            </span>
            .
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-md text-lg text-slate-500"
          >
            English, Maths, Verbal and Non-Verbal Reasoning — structured lessons, adaptive quizzes,
            and realistic mock tests that build real exam confidence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center gap-5"
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/explore')}
              className="flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-8 py-3.5 text-lg font-semibold text-white shadow-btn transition hover:bg-indigo-700"
            >
              Get Started <ArrowRight className="h-5 w-5" />
            </motion.button>
            <button
              onClick={() => navigate('/schools')}
              className="flex items-center gap-1.5 text-base font-semibold text-slate-700 underline decoration-amber-400 decoration-2 underline-offset-4 transition hover:text-indigo-600"
            >
              <School className="h-4 w-4" /> Explore Schools
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex items-center gap-3 text-sm text-slate-500"
          >
            <div className="flex -space-x-3">
              {['bg-rose-300', 'bg-indigo-300', 'bg-emerald-300', 'bg-amber-300'].map((c, i) => (
                <span key={i} className={`h-8 w-8 rounded-full border-2 border-cream ${c}`} />
              ))}
            </div>
            <p>
              <span className="font-bold text-slate-900">Parents trust us</span> to prepare their kids for exam day.
            </p>
          </motion.div>
        </div>

        {/* Photo collage */}
        <div className="relative mx-auto h-[420px] w-full max-w-md lg:h-[480px]">
          <motion.img
            initial={{ opacity: 0, y: 30, rotate: -6 }}
            animate={{ opacity: 1, y: 0, rotate: -6 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            src="/maths.jpeg"
            alt="Maths program"
            className="absolute left-2 top-4 h-56 w-44 rounded-[2rem] object-cover shadow-card-xl ring-4 ring-white sm:h-64 sm:w-52"
          />
          <motion.img
            initial={{ opacity: 0, y: 30, rotate: 5 }}
            animate={{ opacity: 1, y: 0, rotate: 5 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            src="/english.jpeg"
            alt="English program"
            className="absolute right-0 top-0 h-48 w-40 rounded-[2rem] object-cover shadow-card-xl ring-4 ring-white sm:h-56 sm:w-48"
          />
          <motion.img
            initial={{ opacity: 0, y: 30, rotate: -3 }}
            animate={{ opacity: 1, y: 0, rotate: -3 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            src="/non-verbal.jpeg"
            alt="Non-verbal reasoning program"
            className="absolute bottom-2 right-4 h-44 w-44 rounded-[2rem] object-cover shadow-card-xl ring-4 ring-white sm:h-52 sm:w-52"
          />

          <StickerBadge
            icon={Trophy}
            label="500+ Mock Questions"
            sublabel="Across all subjects"
            rotate={-6}
            delay={0.6}
            className="absolute -left-4 bottom-8 sm:-left-8"
          />
          <StickerBadge
            icon={BadgeCheck}
            label="4 Core Subjects"
            sublabel="Fully covered"
            rotate={5}
            delay={0.75}
            className="absolute -right-2 bottom-0 sm:right-0"
          />
        </div>
      </section>

      <WaveDivider fromColor="#fffaf0" toColor="#f3effe" />

      {/* WHY US */}
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

      <WaveDivider fromColor="#f3effe" toColor="#0f172a" />

      {/* MARQUEE */}
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

      <WaveDivider fromColor="#0f172a" toColor="#fffaf0" flip />

      {/* SUBJECTS */}
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

      {/* PROGRESS */}
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
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              viewport={{ once: true }}
              src="/trophy_gold.png"
              alt="Trophy"
              className="absolute -bottom-6 -right-6 h-24 w-24 drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* CTA */}
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

      <Footer />
    </div>
  )
}

export default LandingPage
