import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore.jsx'
import { Mail } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import AuthHero from '../components/auth/AuthHero.jsx'
import IconInput from '../components/ui/IconInput.jsx'
import SubmitButton from '../components/ui/SubmitButton.jsx'
import AlertBanner from '../components/ui/AlertBanner.jsx'

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { api } = useAppStore()
  const [email, setEmail] = useState(location.state?.email || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const response = await api.auth.generateCode({ email, reason: 'password' })
      setMessage(response.responseMessage || 'Reset code generated.')
      navigate('/reset-password', { state: { email } })
    } catch (error) {
      setErrorMessage(error.message || 'Unable to generate reset code.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout onBack={() => navigate('/login')}>
      <form onSubmit={handleSubmit} className="w-full bg-white rounded-[1.75rem] shadow-card-xl p-6 border border-amber-100/60 space-y-5">
        <AuthHero
          icon={Mail}
          iconBg="bg-pastel-pink"
          iconColor="text-pastel-pink-ink"
          title="Generate reset code"
          subtitle="Enter your email to receive a password reset code."
        />

        {message && <AlertBanner variant="success">{message}</AlertBanner>}
        {errorMessage && <AlertBanner variant="error">{errorMessage}</AlertBanner>}

        <IconInput
          icon={Mail}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <SubmitButton loading={isSubmitting} loadingText="Sending...">
          Generate Code
        </SubmitButton>
      </form>
    </AuthLayout>
  )
}

export default ForgotPasswordPage
