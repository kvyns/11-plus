import { Mail, Phone, MapPin } from 'lucide-react'

function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  )
}

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TwitterIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.9 3H21l-6.3 7.2L22 21h-6.6l-4.6-6-5.3 6H3l6.7-7.6L2.5 3h6.7l4.2 5.5L18.9 3Zm-1.1 16h1.2L7.4 4.9H6.1L17.8 19Z" />
    </svg>
  )
}

const socialIcons = [FacebookIcon, InstagramIcon, TwitterIcon]

const exploreLinks = [
  { label: 'Why us', href: '#why' },
  { label: 'Subjects', href: '#subjects' },
  { label: 'Progress', href: '#progress' },
  { label: 'Get started', href: '#cta' },
]

const subjectNames = ['English', 'Maths', 'Verbal Reasoning', 'Non-Verbal Reasoning']

const PRIVACY_URL = 'https://jmvl.co.uk/privacy-policy/'
const TERMS_URL = 'https://jmvl.co.uk/terms-and-conditions/'

function Footer() {
  return (
    <footer className="bg-slate-900 px-6 pt-16 text-slate-300 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
        <div>
          <div className="flex items-center gap-3">
            <img src="/11plus.png" alt="11+ Logo" className="h-9 w-9" />
            <span className="font-display text-lg font-bold text-white">11+ eLearning</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-slate-400">
            Structured lessons, adaptive quizzes, and realistic mock tests that build
            real 11+ exam confidence for kids aged 9–13.
          </p>
          <div className="mt-5 flex items-center gap-3">
            {socialIcons.map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-slate-300 transition hover:bg-amber-500 hover:text-slate-900"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="font-display text-sm font-bold uppercase tracking-wide text-white">Explore</p>
          <ul className="mt-4 space-y-3 text-sm">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="transition hover:text-amber-400">{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-bold uppercase tracking-wide text-white">Subjects</p>
          <ul className="mt-4 space-y-3 text-sm">
            {subjectNames.map((name) => (
              <li key={name}>
                <span className="transition hover:text-amber-400">{name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-bold uppercase tracking-wide text-white">Contact</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <span>support@11pluselearning.co.uk</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <span>+44 20 1234 5678</span>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <span>London, United Kingdom</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 border-t border-white/10 py-6 text-center text-xs text-slate-400 sm:flex-row sm:justify-between sm:text-left">
        <p>© {new Date().getFullYear()} 11+ eLearning. All rights reserved.</p>
        <div className="flex items-center gap-5">
          <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="transition hover:text-amber-400">
            Privacy Policy
          </a>
          <a href={TERMS_URL} target="_blank" rel="noopener noreferrer" className="transition hover:text-amber-400">
            Terms and Conditions
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
