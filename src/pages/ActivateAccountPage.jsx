import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore.jsx'
import { Mail, RotateCcw } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import AuthHero from '../components/auth/AuthHero.jsx'
import IconInput from '../components/ui/IconInput.jsx'
import SubmitButton from '../components/ui/SubmitButton.jsx'
import AlertBanner from '../components/ui/AlertBanner.jsx'

function ActivateAccountPage() {
  const navigate = useNavigate()
  const { api } = useAppStore()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const response = await api.auth.activateAccount({ email })
      setMessage(response.responseMessage || 'Account activated. You can login now.')
    } catch (error) {
      setErrorMessage(error.message || 'Unable to reactivate account.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout onBack={() => navigate('/login')}>
      <form onSubmit={handleSubmit} className="w-full bg-white rounded-[1.75rem] shadow-card-xl p-6 border border-amber-100/60 space-y-5">
        <AuthHero
          icon={RotateCcw}
          iconBg="bg-pastel-lavender"
          iconColor="text-pastel-lavender-ink"
          title="Reactivate account"
          subtitle="Enter your email to reactivate your account."
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

        <SubmitButton loading={isSubmitting} loadingText="Activating...">
          Reactivate Account
        </SubmitButton>

        {message && (
          <button
            type="button"
            onClick={() => navigate('/login', { state: { email } })}
            className="w-full text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Go to login
          </button>
        )}
      </form>
    </AuthLayout>
  )
}

export default ActivateAccountPage
