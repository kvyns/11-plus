import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore.jsx'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import StepIndicator from '../components/ui/StepIndicator.jsx'
import RegisterForm from '../components/auth/RegisterForm.jsx'
import VerifyEmailForm from '../components/auth/VerifyEmailForm.jsx'
import ReferralForm from '../components/auth/ReferralForm.jsx'
import RegisterSuccess from '../components/auth/RegisterSuccess.jsx'

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
          <RegisterForm
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            onSignIn={() => navigate('/login')}
          />
        )}

        {step === 'verify' && (
          <VerifyEmailForm
            handleVerifySubmit={handleVerifySubmit}
            code={code}
            setCode={setCode}
            isVerifying={isVerifying}
            statusMessage={statusMessage}
            verifyError={verifyError}
            handleGenerateCode={handleGenerateCode}
            isSendingCode={isSendingCode}
            onBack={() => setStep('register')}
          />
        )}

        {step === 'referral' && (
          <ReferralForm
            handleReferralSubmit={handleReferralSubmit}
            referral={referral}
            setReferral={setReferral}
            isValidatingReferral={isValidatingReferral}
            referralError={referralError}
            onSkip={handleSkipReferral}
          />
        )}

        {step === 'success' && <RegisterSuccess />}
      </div>
    </AuthLayout>
  )
}

export default RegisterPage
