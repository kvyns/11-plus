import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore.jsx'
import { useToast } from '../store/toastStore.jsx'
import {
  CalendarDays, CheckCircle2, ChevronDown, Eye, EyeOff,
  KeyRound, Loader2, User, UserPlus, VenusAndMars, XCircle,
} from 'lucide-react'
import AuthHero from '../components/auth/AuthHero.jsx'
import IconInput from '../components/ui/IconInput.jsx'
import SubmitButton from '../components/ui/SubmitButton.jsx'
import AlertBanner from '../components/ui/AlertBanner.jsx'
import ParentLayout from '../components/dashboard/ParentLayout.jsx'

function AddChildPage() {
  const navigate = useNavigate()
  const { api, user, refreshCurrentUser } = useAppStore()
  const toast = useToast()

  useEffect(() => {
    if (!user?.email) {
      refreshCurrentUser().catch(() => null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    gender: '',
    dob: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // 'idle' | 'checking' | 'available' | 'taken'
  const [usernameStatus, setUsernameStatus] = useState('idle')

  useEffect(() => {
    const trimmed = formData.username.trim()

    if (!trimmed) {
      setUsernameStatus('idle')
      return undefined
    }

    setUsernameStatus('checking')

    const timeoutId = setTimeout(async () => {
      try {
        await api.child.checkUniqueUsername(trimmed)
        setUsernameStatus('available')
      } catch {
        setUsernameStatus('taken')
      }
    }, 300)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.username])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Password and confirm password must match.')
      return
    }

    if (usernameStatus !== 'available') {
      setErrorMessage(
        usernameStatus === 'taken'
          ? 'This username is already taken — please choose another.'
          : 'Please wait for the username availability check to finish.'
      )
      return
    }

    let userID = user?.email
    if (!userID) {
      try {
        const refreshed = await refreshCurrentUser()
        userID = refreshed?.user?.email || refreshed?.result?.email || refreshed?.data?.email
      } catch {
        userID = null
      }
    }

    if (!userID) {
      setErrorMessage('Unable to confirm your account — please log out and back in, then try again.')
      return
    }

    setIsSubmitting(true)

    try {
      await api.child.addChild({
        userID,
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        dob: formData.dob,
        password: formData.password,
      })

      navigate('/dashboard')
      toast.success(`${formData.firstName} was added successfully.`)
    } catch (error) {
      const message = error.message || 'Unable to add child profile. Please try again.'
      setErrorMessage(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ParentLayout title="Add Child" activePage="add-child">
      {/* Content */}
      <div className="flex flex-col items-center">
        <div className="w-full max-w-xl bg-white rounded-[1.75rem] shadow-card-xl p-6 md:p-8 border border-amber-100/60">
          <div className="mb-6">
            <AuthHero
              icon={UserPlus}
              iconBg="bg-pastel-lavender"
              iconColor="text-pastel-lavender-ink"
              title="Add a Child"
              subtitle="Set up a profile so they can start practicing for the 11+."
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && <AlertBanner variant="error">{errorMessage}</AlertBanner>}

            {/* Username Input (custom — needs live status styling) */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1.5">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-500" />
                <input
                  type="text"
                  placeholder="Choose a username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  className={`w-full pl-12 pr-11 py-3 rounded-xl border-2 focus:outline-none bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors ${
                    usernameStatus === 'taken'
                      ? 'border-red-300 focus:border-red-500'
                      : usernameStatus === 'available'
                      ? 'border-emerald-300 focus:border-emerald-500'
                      : 'border-slate-200 focus:border-indigo-500'
                  }`}
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2">
                  {usernameStatus === 'checking' && <Loader2 className="h-5 w-5 animate-spin text-slate-400" />}
                  {usernameStatus === 'available' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                  {usernameStatus === 'taken' && <XCircle className="h-5 w-5 text-red-500" />}
                </span>
              </div>
              {usernameStatus === 'available' && (
                <p className="mt-1.5 text-xs font-semibold text-emerald-600">Username is available</p>
              )}
              {usernameStatus === 'taken' && (
                <p className="mt-1.5 text-xs font-semibold text-red-500">This username is already taken</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <IconInput
                icon={User}
                label="First Name"
                type="text"
                placeholder="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <IconInput
                icon={User}
                label="Last Name"
                type="text"
                placeholder="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gender Select */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-1.5">Gender</label>
                <div className="relative">
                  <VenusAndMars className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-500" />
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none bg-slate-50 appearance-none text-slate-900"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-500" />
                </div>
              </div>

              <IconInput
                icon={CalendarDays}
                label="Date of Birth"
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <IconInput
                icon={KeyRound}
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                name="password"
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

              <IconInput
                icon={KeyRound}
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-indigo-500 hover:text-indigo-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                }
              />
            </div>

            <SubmitButton
              loading={isSubmitting}
              loadingText="Adding child..."
              disabled={usernameStatus !== 'available'}
              className="mt-2"
            >
              Add Child
            </SubmitButton>
          </form>
        </div>
      </div>
    </ParentLayout>
  )
}

export default AddChildPage
