import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore.jsx'
import { Mail, KeyRound, Eye, EyeOff, User, Phone, ShieldCheck, Gift, CheckCircle2, Loader2 } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import IconInput from '../components/ui/IconInput.jsx'
import CodeInput from '../components/ui/CodeInput.jsx'
import SubmitButton from '../components/ui/SubmitButton.jsx'
import AlertBanner from '../components/ui/AlertBanner.jsx'
import StepIndicator from '../components/ui/StepIndicator.jsx'

const TERMS_URL = 'https://jmvl.co.uk/terms-and-conditions/'
const PRIVACY_URL = 'https://jmvl.co.uk/privacy-policy/'

const STEPS = ['register', 'verify', 'referral']
const STEP_LABELS = ['Account Details', 'Verify Email', 'Referral']

function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { api, registerParent, isLoggedIn, accountType } = useAppStore()

  const [step, setStep] = useState(location.state?.step || 'register')

  useEffect(() => {
    if (isLoggedIn && !location.state?.step) {
      navigate(accountType === 'child' ? '/child-dashboard' : '/dashboard', { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: location.state?.email || '',
    mobile: '',
    password: '',
    termsAccepted: false,
    subscribed: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Verify-step state
  const [code, setCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [verifyError, setVerifyError] = useState('')

  // Referral-step state
  const [referral, setReferral] = useState('')
  const [isValidatingReferral, setIsValidatingReferral] = useState(false)
  const [referralError, setReferralError] = useState('')

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await registerParent({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobileNumber: formData.mobile,
        password: formData.password,
        subscribed: formData.subscribed,
        platform: 'Web',
      })

      await api.auth.generateCode({ email: formData.email, reason: 'email' })

      // Move to verify step instead of navigating away
      setStep('verify')
    } catch (error) {
      setErrorMessage(error.message || 'Unable to register at the moment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGenerateCode = async () => {
    setStatusMessage('')
    setVerifyError('')
    setIsSendingCode(true)

    try {
      const response = await api.auth.generateCode({ email: formData.email, reason: 'email' })
      setStatusMessage(response.responseMessage || 'Verification code sent.')
    } catch (error) {
      setVerifyError(error.message || 'Unable to send verification code.')
    } finally {
      setIsSendingCode(false)
    }
  }

  const handleVerifySubmit = async (e) => {
    e.preventDefault()
    setStatusMessage('')
    setVerifyError('')
    setIsVerifying(true)

    try {
      await api.auth.verifyEmail({ email: formData.email, code })
      setStep('referral')
    } catch (error) {
      setVerifyError(error.message || 'Unable to verify email. Please check the code.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleReferralSubmit = async (e) => {
    e.preventDefault()
    setReferralError('')
    setIsValidatingReferral(true)

    try {
      await api.auth.validateReferral({ email: formData.email, referral })
      setStep('success')
    } catch (error) {
      setReferralError(error.message || 'Invalid referral code.')
    } finally {
      setIsValidatingReferral(false)
    }
  }

  const handleSkipReferral = () => {
    setStep('success')
  }

  useEffect(() => {
    if (step !== 'success') return undefined

    const timeoutId = setTimeout(() => {
      navigate('/login', { state: { email: formData.email } })
    }, 1800)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  return (
    <AuthLayout maxWidth="max-w-xl">
      {/* Logo (mobile only — desktop shows it in the illustration panel) */}
      <div className="w-full text-center mb-6 lg:hidden">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-card-lg">
          <img src="/11plus.png" alt="11+ Logo" className="h-14 w-14" />
        </div>
      </div>

      <div className="mb-4 text-center lg:text-left">
        <h1 className="font-display text-2xl font-bold text-slate-900 mb-0.5 lg:text-3xl">
          {step === 'register' && 'Create Account'}
          {step === 'verify' && 'Verify Email'}
          {step === 'referral' && 'Referral'}
          {step === 'success' && 'Registration Successful'}
        </h1>

        <p className="text-sm text-slate-500">
          {step === 'register' && 'Start your 11+ preparation journey'}
          {step === 'verify' && `Enter the verification code sent to ${formData.email}`}
          {step === 'referral' && 'Enter your referral code or skip this step'}
          {step === 'success' && 'Redirecting you to login...'}
        </p>
      </div>

      {step !== 'success' && (
        <div className="w-full mb-4">
          <StepIndicator steps={STEP_LABELS} currentIndex={STEPS.indexOf(step)} />
        </div>
      )}

      {/* Card */}
      <div className="w-full bg-white rounded-[1.75rem] shadow-card-xl p-5 border border-amber-100/60">
        {step === 'register' && (
          <>
            <form onSubmit={handleSubmit} className="space-y-3">
              {errorMessage && <AlertBanner variant="error">{errorMessage}</AlertBanner>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <IconInput
                  icon={User}
                  label="First Name"
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                <IconInput
                  icon={User}
                  label="Last Name"
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <IconInput
                icon={Mail}
                label="Email"
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1">
                  Mobile (optional)
                </label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-500" />
                  <span className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-600 text-sm">
                    +44
                  </span>
                  <input
                    type="tel"
                    name="mobile"
                    placeholder="Mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full pl-20 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none bg-slate-50 transition-colors"
                  />
                </div>
              </div>

              <IconInput
                icon={KeyRound}
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
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

              {/* Terms */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  required
                  className="w-4 h-4 mt-0.5 accent-indigo-600"
                />
                <span className="text-sm text-slate-600">
                  I have read & agreed to 11 Plus{' '}
                  <a href={TERMS_URL} target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold hover:underline">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href={PRIVACY_URL} target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold hover:underline">
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>

              {/* Marketing */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="subscribed"
                  checked={formData.subscribed}
                  onChange={handleChange}
                  className="w-4 h-4 mt-0.5 accent-indigo-600"
                />
                <span className="text-sm text-slate-600">
                  I consent to receiving promotional offers and updates from 11 Plus.
                </span>
              </label>

              <SubmitButton loading={isSubmitting} loadingText="Creating account...">
                Create Account
              </SubmitButton>
            </form>

            <div className="text-center text-slate-600 mt-6">
              Already have an account?{' '}
              <button onClick={() => navigate('/login')} className="text-indigo-600 font-semibold hover:underline">
                Sign In
              </button>
            </div>
          </>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerifySubmit} className="space-y-3">
            <div className="flex justify-center">
              <div className="rounded-full bg-pastel-lavender p-4">
                <ShieldCheck className="h-10 w-10 text-pastel-lavender-ink" />
              </div>
            </div>

            {statusMessage && <AlertBanner variant="success">{statusMessage}</AlertBanner>}
            {verifyError && <AlertBanner variant="error">{verifyError}</AlertBanner>}

            <CodeInput
              label="Verification Code"
              placeholder="Enter 6 digit code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
            />

            <SubmitButton loading={isVerifying} loadingText="Verifying...">
              Verify Email
            </SubmitButton>

            <button
              type="button"
              onClick={handleGenerateCode}
              disabled={isSendingCode}
              className="w-full text-sm font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
            >
              {isSendingCode ? 'Sending code...' : 'Resend verification code'}
            </button>

            <button
              type="button"
              onClick={() => setStep('register')}
              className="w-full text-sm font-semibold text-slate-500 hover:text-slate-700"
            >
              ← Back to registration details
            </button>
          </form>
        )}

        {step === 'referral' && (
          <form onSubmit={handleReferralSubmit} className="space-y-3">
            <div className="flex justify-center">
              <div className="rounded-full bg-pastel-yellow p-4">
                <Gift className="h-10 w-10 text-pastel-yellow-ink" />
              </div>
            </div>

            {referralError && <AlertBanner variant="error">{referralError}</AlertBanner>}

            <CodeInput
              label="Referral Code"
              maxLength={20}
              placeholder="Referral code"
              value={referral}
              onChange={(e) => setReferral(e.target.value.toUpperCase())}
              className="font-semibold text-lg"
              required
            />

            <SubmitButton loading={isValidatingReferral} loadingText="Validating...">
              Validate Referral
            </SubmitButton>

            <button
              type="button"
              onClick={handleSkipReferral}
              className="w-full text-sm font-semibold text-slate-500 hover:text-indigo-600"
            >
              Skip and login
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-9 w-9 text-emerald-500" />
            </div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Registration successful!
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Redirecting to the login page...
            </p>
            <Loader2 className="mt-4 h-5 w-5 animate-spin text-indigo-500" />
          </div>
        )}
      </div>
    </AuthLayout>
  )
}

export default RegisterPage
