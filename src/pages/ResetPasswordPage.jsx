import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore.jsx'
import { Eye, EyeOff, KeyRound, Mail } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import AuthHero from '../components/auth/AuthHero.jsx'
import IconInput from '../components/ui/IconInput.jsx'
import CodeInput from '../components/ui/CodeInput.jsx'
import SubmitButton from '../components/ui/SubmitButton.jsx'
import AlertBanner from '../components/ui/AlertBanner.jsx'

function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { api } = useAppStore()
  const [email, setEmail] = useState(location.state?.email || '')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await api.auth.resetPassword({ email, code, newPassword })
      navigate('/login', { state: { email } })
    } catch (error) {
      setErrorMessage(error.message || 'Unable to reset password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout onBack={() => navigate('/forgot-password', { state: { email } })}>
      <form onSubmit={handleSubmit} className="w-full bg-white rounded-[1.75rem] shadow-card-xl p-6 border border-amber-100/60 space-y-5">
        <AuthHero
          icon={KeyRound}
          iconBg="bg-pastel-yellow"
          iconColor="text-pastel-yellow-ink"
          title="Create new password"
          subtitle="Enter the reset code and your new password."
        />

        {errorMessage && <AlertBanner variant="error">{errorMessage}</AlertBanner>}

        <IconInput
          icon={Mail}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <CodeInput
          placeholder="0 0 0 0 0 0"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          required
        />

        <IconInput
          icon={KeyRound}
          type={showPassword ? 'text' : 'password'}
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-indigo-500 hover:text-indigo-700"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          }
        />

        <SubmitButton
          loading={isSubmitting}
          loadingText="Resetting..."
          disabled={code.length !== 6 || newPassword.length < 8}
        >
          Reset Password
        </SubmitButton>
      </form>
    </AuthLayout>
  )
}

export default ResetPasswordPage
