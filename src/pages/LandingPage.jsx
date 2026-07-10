import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore.jsx'
import WaveDivider from '../components/landing/WaveDivider.jsx'
import Footer from '../components/landing/Footer.jsx'
import LandingHeader from '../components/landing/LandingHeader.jsx'
import Hero from '../components/landing/Hero.jsx'
import WhyUsSection from '../components/landing/WhyUsSection.jsx'
import MarqueeSection from '../components/landing/MarqueeSection.jsx'
import SubjectsSection from '../components/landing/SubjectsSection.jsx'
import ProgressSection from '../components/landing/ProgressSection.jsx'
import CtaSection from '../components/landing/CtaSection.jsx'

function LandingPage() {
  const navigate = useNavigate()
  const { isLoggedIn, accountType } = useAppStore()
  const dashboardPath = accountType === 'child' ? '/child-dashboard' : '/dashboard'

  return (
    <div className="min-h-screen overflow-x-hidden bg-cream">
      <LandingHeader navigate={navigate} isLoggedIn={isLoggedIn} dashboardPath={dashboardPath} />

      <Hero navigate={navigate} />

      <WaveDivider fromColor="#fffaf0" toColor="#f3effe" />

      <WhyUsSection />

      <WaveDivider fromColor="#f3effe" toColor="#0f172a" />

      <MarqueeSection />

      <WaveDivider fromColor="#0f172a" toColor="#fffaf0" flip />

      <SubjectsSection />

      <ProgressSection />

      <CtaSection />

      <Footer />
    </div>
  )
}

export default LandingPage
