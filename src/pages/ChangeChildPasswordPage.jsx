import { useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useAppStore } from '../store/appStore.jsx'
import { useToast } from '../store/toastStore.jsx'
import { ChevronLeft, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react'
import IconInput from '../components/ui/IconInput.jsx'

function ChangeChildPasswordPage() {
  const navigate = useNavigate()
  const { childID } = useParams()
  const location = useLocation()
  const { api, user } = useAppStore()
  const toast = useToast()
  const childName = location.state?.childName || 'your child'

  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.')
      return
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error('New password and confirm password must match.')
      return
    }

    setIsSubmitting(true)
    try {
      await api.child.changeChildPassword({
        userID: user?.email,
        childID,
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      })
      toast.success(`${childName}'s password was updated successfully.`)
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error.message || 'Unable to change password right now.')
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
        <h1 className="font-display text-lg font-bold text-white">Change Child Password</h1>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-[1.75rem] shadow-card-xl p-6 md:p-8 border border-amber-100/60">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-pastel-lavender p-4">
              <KeyRound className="h-8 w-8 text-pastel-lavender-ink" />
            </div>
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900 text-center mb-1">
            Update {childName}'s Password
          </h2>
          <p className="text-sm text-slate-500 text-center mb-6">
            Set a new password for this child's account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <IconInput
              icon={KeyRound}
              label="Old Password"
              type="password"
              placeholder="Old Password"
              name="oldPassword"
              value={form.oldPassword}
              onChange={handleChange}
              required
            />

            <IconInput
              icon={KeyRound}
              label="New Password"
              type={showNew ? 'text' : 'password'}
              placeholder="New Password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              required
              minLength={8}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="text-indigo-500 hover:text-indigo-600"
                >
                  {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              }
            />

            <IconInput
              icon={KeyRound}
              label="Confirm Password"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm Password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              minLength={8}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="text-indigo-500 hover:text-indigo-600"
                >
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              }
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-full text-base transition-colors shadow-btn disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChangeChildPasswordPage
