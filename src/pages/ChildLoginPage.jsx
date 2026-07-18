import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore.jsx'
import { Eye, EyeOff, KeyRound, User } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import IconInput from '../components/ui/IconInput.jsx'
import SubmitButton from '../components/ui/SubmitButton.jsx'
import AlertBanner from '../components/ui/AlertBanner.jsx'

function ChildLoginPage() {
  const navigate = useNavigate()
  const { loginChild } = useAppStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleChildLogin = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await loginChild({ username, password })
      navigate('/child-dashboard')
    } catch (error) {
      setErrorMessage(error.message || 'Unable to login child account right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout onBack={() => navigate(-1)}>
      {/* Logo Card */}
      <div className="w-full bg-white rounded-[1.75rem] shadow-card-xl p-8 mb-6 text-center border border-amber-100/60">
        <div className="flex justify-center mb-5">
          <img src="/11plus.png" alt="11+ Logo" className="h-20 w-20" />
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Child Login</h1>
        <p className="text-sm text-slate-500 mt-2">Sign in to your child's account</p>
      </div>

      {/* Form */}
      <div className="w-full bg-white rounded-[1.75rem] p-8 shadow-card-xl space-y-5 border border-amber-100/60">
        <form onSubmit={handleChildLogin} className="space-y-5">
          {errorMessage && <AlertBanner variant="error">{errorMessage}</AlertBanner>}

          <IconInput
            icon={User}
            label="Username"
            type="text"
            placeholder="Username"
            value={username}
            autoCorrect="off"
            spellCheck={false}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <IconInput
            icon={KeyRound}
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
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

          <SubmitButton loading={isSubmitting} loadingText="Logging in...">
            Login as Child
          </SubmitButton>
        </form>
        <div className="text-center text-sm mt-6">
          <button
            onClick={() => navigate('/login')}
            className="text-indigo-600 font-semibold hover:underline"
          >
            Parent Login
          </button>
        </div>
      </div>
    </AuthLayout>
  )
}

export default ChildLoginPage
