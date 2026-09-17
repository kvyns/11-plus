import { useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAppStore } from '../store/appStore.jsx'
import { useToast } from '../store/toastStore.jsx'
import { CalendarDays, ChevronDown, ChevronLeft, GraduationCap, KeyRound, User, VenusAndMars } from 'lucide-react'
import IconInput from '../components/ui/IconInput.jsx'
import SubmitButton from '../components/ui/SubmitButton.jsx'
import AlertBanner from '../components/ui/AlertBanner.jsx'
import { formatYearGroup } from '../lib/childHelpers.js'

function EditChildProfilePage() {
  const navigate = useNavigate()
  const { childID } = useParams()
  const location = useLocation()
  const { api, user } = useAppStore()
  const toast = useToast()
  const child = location.state?.child || {}
  const yearGroup = formatYearGroup(child.yearGroup)

  const [formData, setFormData] = useState({
    firstName: child.firstName || '',
    lastName: child.lastName || '',
    gender: child.gender || '',
    dob: child.dob || '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await api.child.updateChild({
        userID: user?.email,
        childID,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dob: formData.dob,
        gender: formData.gender,
      })
      toast.success(`${formData.firstName}'s profile was updated.`)
      navigate('/dashboard')
    } catch (error) {
      const message = error.message || 'Unable to update this profile right now.'
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 py-5 px-6 flex items-center gap-4 sticky top-0 z-30">
        <button
          onClick={() => navigate(-1)}
          className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="font-display text-xl font-bold text-white">Edit Child Profile</h1>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center px-4 py-10">
        <div className="w-full max-w-xl bg-white rounded-[1.75rem] shadow-card-xl p-6 md:p-8 border border-amber-100/60">
          <div className="flex items-center gap-3 mb-5">
            <div className="rounded-full bg-pastel-lavender p-2.5 shrink-0">
              <User className="h-5 w-5 text-pastel-lavender-ink" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">Edit Profile</h2>
              <p className="text-sm text-slate-500">Update your child's name, gender and date of birth.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {errorMessage && <AlertBanner variant="error">{errorMessage}</AlertBanner>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            {/* Year group is derived from date of birth on the backend — shown
                for context, not directly editable here. */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1.5">Year Group</label>
              <div className="relative flex items-center">
                <GraduationCap className="absolute left-4 h-5 w-5 text-slate-400" />
                <div className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-100 text-slate-500">
                  {yearGroup || 'Set automatically from date of birth'}
                </div>
              </div>
            </div>

            <SubmitButton loading={isSubmitting} loadingText="Saving..." className="mt-2">
              Save Changes
            </SubmitButton>

            <button
              type="button"
              onClick={() =>
                navigate(`/change-child-password/${childID}`, {
                  state: { childName: formData.firstName, childUsername: child.username },
                })
              }
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 py-2"
            >
              <KeyRound className="h-4 w-4" />
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditChildProfilePage
