import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore.jsx'
import { useToast } from '../store/toastStore.jsx'
import { buildMediaUrl } from '../services/api.js'
import {
  Camera,
  Calendar,
  ChevronLeft,
  Check,
  CircleCheck,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  Gift,
  KeyRound,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldAlert,
  Star,
  User,
  X,
} from 'lucide-react'

const MAX_PROFILE_PIC_BYTES = 5 * 1024 * 1024

const TERMS_URL = 'https://jmvl.co.uk/terms-and-conditions/'
const PRIVACY_URL = 'https://jmvl.co.uk/privacy-policy/'

function ProfilePage() {
  const navigate = useNavigate()
  const { user, refreshCurrentUser, updateProfile, deleteAccount, api } = useAppStore()
  const toast = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isUploadingPic, setIsUploadingPic] = useState(false)
  const fileInputRef = useRef(null)
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    mobileNumber: '',
    dob: '',
    gender: '',
    addressLine: '',
    country: 'England',
    postcode: '',
  })
  const [passwordForm, setPasswordForm] = useState({ password: '', newPassword: '' })

  // Dummy user data for demonstration, replace with actual user data from API
  const currentUser = {
    firstName: user?.firstName || 'Kavyansh',
    lastName: user?.lastName || 'Dhakad',
    email: user?.email || 'kd.kavyansh2003@gmail.com',
    mobile: user?.mobileNumber || user?.mobile || '+44 7911 123456',
    dob: user?.dob || '',
    gender: user?.gender || '',
    rewardPoints: user?.rewardPoints || 0,
    referralCode: user?.referralCode || 'OHECAIEO03',
    address: user?.address || {},
    appVersion: '1.1.2',
    profilePicKey: user?.profilePic || user?.profilePicKey || user?.imageKey || user?.image_key || '',
  }

  const buildFormFromUser = () => ({
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    mobileNumber: currentUser.mobile,
    dob: currentUser.dob,
    gender: currentUser.gender,
    addressLine: currentUser.address.addressLine || '',
    country: currentUser.address.country || 'England',
    postcode: currentUser.address.postcode || '',
  })

  useEffect(() => {
    refreshCurrentUser().catch(() => null)
    // Run once on page mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setProfileForm(buildFormFromUser())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.firstName, currentUser.lastName, currentUser.mobile, currentUser.dob, currentUser.gender, currentUser.address.addressLine, currentUser.address.country, currentUser.address.postcode])

  const copyReferralCode = () => {
    navigator.clipboard.writeText(currentUser.referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const startEditing = () => {
    setProfileForm(buildFormFromUser())
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setProfileForm(buildFormFromUser())
    setIsEditing(false)
  }

  const handleProfileSave = async () => {
    setIsSaving(true)

    try {
      await updateProfile({
        userID: currentUser.email,
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        mobileNumber: profileForm.mobileNumber,
        dob: profileForm.dob,
        gender: profileForm.gender,
        completed: true,
        rewardPoints: currentUser.rewardPoints || 100,
        address: {
          addressLine: profileForm.addressLine,
          country: profileForm.country,
          postcode: profileForm.postcode,
          latitude: currentUser.address.latitude || 0,
          longitude: currentUser.address.longitude || 0,
        },
      })
      toast.success('Profile updated successfully.')
      setIsEditing(false)
    } catch (error) {
      toast.error(error.message || 'Unable to update profile right now.')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    setIsChangingPassword(true)

    try {
      await api.auth.changePassword({
        userID: currentUser.email,
        password: passwordForm.password,
        newPassword: passwordForm.newPassword,
      })
      setPasswordForm({ password: '', newPassword: '' })
      setShowPasswordForm(false)
      toast.success('Password changed successfully.')
    } catch (error) {
      toast.error(error.message || 'Unable to change password right now.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    const shouldDelete = window.confirm('Are you sure you want to delete your account?')
    if (!shouldDelete) {
      return
    }

    setIsDeleting(true)

    try {
      await deleteAccount()
      navigate('/login')
      toast.success('Your account has been deleted.')
    } catch (error) {
      toast.error(error.message || 'Unable to delete account right now.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePicSelected = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.')
      return
    }

    if (file.size > MAX_PROFILE_PIC_BYTES) {
      toast.error('Image must be smaller than 5MB.')
      return
    }

    setIsUploadingPic(true)
    try {
      await api.auth.uploadProfilePic(file)
      toast.success('Profile photo updated.')
    } catch (error) {
      toast.error(error.message || 'Unable to upload photo right now.')
    } finally {
      setIsUploadingPic(false)
    }
  }

  const openExternalUrl = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-cream/90 backdrop-blur-md border-b border-amber-100 py-4 px-6 flex items-center justify-between sticky top-0 z-30">
        <button
          onClick={() => navigate(-1)}
          className="h-10 w-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="font-display text-xl font-bold text-slate-900">User Profile</h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6 md:px-6 md:py-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN — summary, referral, support */}
        <div className="md:col-span-1 space-y-6 md:sticky md:top-24">
          {/* Profile summary card */}
          <div className="relative overflow-hidden bg-white rounded-[1.75rem] p-6 shadow-card-xl border border-amber-100/60 text-center">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-pastel-lavender/60 blur-2xl"
            />
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="h-full w-full overflow-hidden rounded-full bg-pastel-lavender text-pastel-lavender-ink font-display font-bold text-3xl flex items-center justify-center shadow-card">
                {currentUser.profilePicKey ? (
                  <img
                    src={buildMediaUrl(currentUser.profilePicKey)}
                    alt={`${currentUser.firstName}'s profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  currentUser.firstName.charAt(0)
                )}
                {isUploadingPic && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePicSelected}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPic}
                className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-1.5 shadow-btn hover:bg-indigo-700 transition-colors disabled:opacity-60"
              >
                <Camera className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
            <h2 className="relative font-display text-lg font-bold text-slate-900 mb-0.5">
              {currentUser.firstName} {currentUser.lastName}
            </h2>
            <p className="relative text-sm text-slate-500 mb-4 truncate">{currentUser.email}</p>

            <div className="relative inline-flex items-center gap-2 bg-pastel-yellow rounded-full px-4 py-1.5 shadow-card">
              <Star className="h-4 w-4 fill-pastel-yellow-ink text-pastel-yellow-ink" />
              <span className="text-sm font-semibold text-pastel-yellow-ink">
                {currentUser.rewardPoints} points
              </span>
            </div>
          </div>

          {/* Refer a friend */}
          <div className="bg-white rounded-[1.75rem] p-6 shadow-card-xl border border-amber-100/60">
            <div className="flex items-center gap-2 mb-4">
              <div className="rounded-full bg-pastel-mint p-2">
                <Gift className="h-4 w-4 text-pastel-mint-ink" />
              </div>
              <h3 className="font-display font-bold text-slate-900">Refer a friend</h3>
            </div>
            <div className="relative">
              <input
                type="text"
                value={currentUser.referralCode}
                readOnly
                className="w-full pl-4 pr-12 py-3 bg-slate-50 rounded-full border-2 border-slate-200 font-semibold tracking-widest text-slate-900 text-sm"
              />
              <button
                onClick={copyReferralCode}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full flex items-center justify-center text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Support */}
          <div className="bg-white rounded-[1.75rem] p-6 shadow-card-xl border border-amber-100/60">
            <h3 className="font-display font-bold text-slate-900 mb-2">Support</h3>
            <div className="space-y-1">
              <button
                onClick={() => openExternalUrl(PRIVACY_URL)}
                className="w-full text-left flex items-center justify-between px-3 py-2.5 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <span className="text-sm text-slate-700 font-medium">Privacy Policy</span>
                <ExternalLink className="h-4 w-4 text-indigo-500" />
              </button>
              <button
                onClick={() => openExternalUrl(TERMS_URL)}
                className="w-full text-left flex items-center justify-between px-3 py-2.5 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <span className="text-sm text-slate-700 font-medium">Terms and Conditions</span>
                <ExternalLink className="h-4 w-4 text-indigo-500" />
              </button>
              <button
                onClick={() => {}}
                className="w-full text-left flex items-center justify-between px-3 py-2.5 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <span className="text-sm text-slate-700 font-medium">Contact Us</span>
                <ExternalLink className="h-4 w-4 text-indigo-500" />
              </button>
              <div className="w-full flex items-center justify-between px-3 py-2.5">
                <span className="text-sm text-slate-700 font-medium">App Version</span>
                <span className="text-sm text-slate-400 font-semibold">{currentUser.appVersion}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — details, security, danger zone */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Details */}
          <div className="bg-white rounded-[1.75rem] p-6 md:p-8 shadow-card-xl border border-amber-100/60">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display text-lg font-bold text-slate-900">Personal Details</h3>
              {!isEditing ? (
                <button
                  onClick={startEditing}
                  className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={cancelEditing}
                    className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleProfileSave}
                    disabled={isSaving}
                    className="flex items-center gap-1 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Check className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Complete your profile to earn 100 reward points
            </p>

            <div className="space-y-5">
              {/* Name row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    <User className="h-3.5 w-3.5 text-indigo-500" />
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))}
                      className="w-full rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none px-3 py-2.5 text-sm bg-white transition-colors"
                    />
                  ) : (
                    <p className="font-semibold text-slate-900 px-3 py-2.5">{currentUser.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    <User className="h-3.5 w-3.5 text-indigo-500" />
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))}
                      className="w-full rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none px-3 py-2.5 text-sm bg-white transition-colors"
                    />
                  ) : (
                    <p className="font-semibold text-slate-900 px-3 py-2.5">{currentUser.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  <Mail className="h-3.5 w-3.5 text-indigo-500" />
                  Email
                </label>
                <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-900">{currentUser.email}</span>
                  <CircleCheck className="h-4 w-4 text-green-500 shrink-0" />
                </div>
              </div>

              {/* Mobile + DOB row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    <Phone className="h-3.5 w-3.5 text-indigo-500" />
                    Mobile
                  </label>
                  {isEditing ? (
                    <input
                      value={profileForm.mobileNumber}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, mobileNumber: e.target.value }))}
                      className="w-full rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none px-3 py-2.5 text-sm bg-white transition-colors"
                      placeholder="+44..."
                    />
                  ) : (
                    <p className="font-semibold text-slate-900 px-3 py-2.5">{currentUser.mobile}</p>
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                    Date of Birth
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={profileForm.dob}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, dob: e.target.value }))}
                      className="w-full rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none px-3 py-2.5 text-sm bg-white transition-colors"
                    />
                  ) : (
                    <p className="font-semibold text-slate-900 px-3 py-2.5">
                      {currentUser.dob || '—'}
                    </p>
                  )}
                </div>
              </div>

              {/* Gender (only shown while editing, or if set) */}
              {(isEditing || currentUser.gender) && (
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    <User className="h-3.5 w-3.5 text-indigo-500" />
                    Gender
                  </label>
                  {isEditing ? (
                    <select
                      value={profileForm.gender}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, gender: e.target.value }))}
                      className="w-full rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none px-3 py-2.5 text-sm bg-white transition-colors"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="font-semibold text-slate-900 px-3 py-2.5">{currentUser.gender}</p>
                  )}
                </div>
              )}

              {/* Address */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                  Address
                </label>
                {isEditing ? (
                  <div className="grid gap-2">
                    <input
                      value={profileForm.addressLine}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, addressLine: e.target.value }))}
                      className="rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none px-3 py-2.5 text-sm bg-white transition-colors"
                      placeholder="Address line"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={profileForm.country}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, country: e.target.value }))}
                        className="rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none px-3 py-2.5 text-sm bg-white transition-colors"
                        placeholder="Country"
                      />
                      <input
                        value={profileForm.postcode}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, postcode: e.target.value }))}
                        className="rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none px-3 py-2.5 text-sm bg-white transition-colors"
                        placeholder="Postcode"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="font-semibold text-slate-900 px-3 py-2.5">
                    {profileForm.addressLine
                      ? `${profileForm.addressLine}, ${profileForm.country} ${profileForm.postcode}`.trim()
                      : '—'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-[1.75rem] p-6 md:p-8 shadow-card-xl border border-amber-100/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-pastel-lavender p-2">
                  <KeyRound className="h-4 w-4 text-pastel-lavender-ink" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900">Password</h3>
                  <p className="text-sm text-slate-500">**********</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordForm((prev) => !prev)}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                {showPasswordForm ? 'Close' : 'Change'}
              </button>
            </div>

            {showPasswordForm && (
              <div className="mt-5 pt-5 border-t border-slate-100 space-y-3">
                <div className="relative">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, password: e.target.value }))}
                    className="w-full rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none px-3 py-2.5 pr-10 text-sm bg-slate-50 transition-colors"
                    placeholder="Current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500"
                  >
                    {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none px-3 py-2.5 text-sm bg-slate-50 transition-colors"
                  placeholder="New password"
                />
                <button
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword}
                  className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 px-3 py-2.5 text-sm font-semibold text-white transition-colors"
                >
                  {isChangingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            )}
          </div>

          {/* Danger zone */}
          <div className="bg-red-50 rounded-2xl p-6 md:p-8 border-2 border-red-100">
            <div className="flex items-center gap-3 mb-1">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              <h3 className="font-display font-bold text-red-700">Danger Zone</h3>
            </div>
            <p className="text-sm text-red-600/80 mb-4">
              Deleting your account is permanent and cannot be undone.
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-bold py-2.5 px-6 rounded-full text-sm transition-all duration-200 shadow-lg shadow-red-500/20 disabled:shadow-none"
            >
              {isDeleting ? 'Processing...' : 'Delete My Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage