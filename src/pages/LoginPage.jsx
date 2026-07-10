import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore.jsx'
import { Mail, KeyRound, Eye, EyeOff, ArrowRight } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import IconInput from '../components/ui/IconInput.jsx'
import SubmitButton from '../components/ui/SubmitButton.jsx'
import AlertBanner from '../components/ui/AlertBanner.jsx'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginParent, isLoggedIn, accountType } = useAppStore()

  useEffect(() => {
    if (isLoggedIn) {
      navigate(accountType === 'child' ? '/child-dashboard' : '/dashboard', { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [email, setEmail] = useState(location.state?.email || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await loginParent({ email, password })
      navigate('/dashboard')
    } catch (error) {
      if (error.responseCode === 2) {
        navigate('/register', { state: { step: 'verify', email } })
        return
      }

      setErrorMessage(
        error.message || 'Unable to login. Please check your credentials.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      {/* Logo (mobile only — desktop shows it in the illustration panel) */}
      <div className="w-full text-center mb-8 lg:hidden">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-card-lg">
          <img src="/11plus.png" alt="11+ Logo" className="h-14 w-14" />
        </div>
      </div>

      <div className="mb-8 text-center lg:text-left">
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-1">
          Welcome Back
        </h1>
        <p className="text-slate-500">
          Sign in to continue your 11+ preparation
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full bg-white rounded-[2rem] shadow-card-xl p-6 border border-amber-100/60">
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMessage && <AlertBanner variant="error">{errorMessage}</AlertBanner>}

          <IconInput
            icon={Mail}
            label="Email"
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <IconInput
            icon={KeyRound}
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-indigo-500 hover:text-indigo-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            }
          />

          {/* Forgot Password */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => navigate('/forgot-password', { state: { email } })}
              className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
            >
              Forgot Password?
            </button>
          </div>

          <SubmitButton loading={isSubmitting} loadingText="Signing in...">
            Sign In
          </SubmitButton>
        </form>

        {/* Register Link */}
        <div className="text-center text-slate-600 mt-6">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-indigo-600 font-semibold hover:underline"
          >
            Register
          </button>
        </div>

        <div className="text-center mt-2">
          <button
            onClick={() => navigate('/activate-account')}
            className="text-sm font-semibold text-slate-400 hover:text-indigo-600"
          >
            Reactivate deleted account
          </button>
        </div>
      </div>

      {/* Child Login Button */}
      <div className="w-full mt-6">
        <SubmitButton variant="amber" type="button" onClick={() => navigate('/child-login')}>
          <span>Child Login</span>
          <ArrowRight className="h-5 w-5" />
        </SubmitButton>
      </div>
    </AuthLayout>
  )
}

export default LoginPage
