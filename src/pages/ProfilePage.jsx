import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore.jsx'
import { useToast } from '../store/toastStore.jsx'
import { Loader2 } from 'lucide-react'
import ProfileSummaryCard from '../components/profile/ProfileSummaryCard.jsx'
import ReferralCard from '../components/profile/ReferralCard.jsx'
import SupportCard from '../components/profile/SupportCard.jsx'
import PersonalDetailsCard from '../components/profile/PersonalDetailsCard.jsx'
import PasswordSection from '../components/profile/PasswordSection.jsx'
import DangerZoneCard from '../components/profile/DangerZoneCard.jsx'
import ParentLayout from '../components/dashboard/ParentLayout.jsx'

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

  const currentUser = {
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    mobile: user?.mobileNumber || user?.mobile || '',
    dob: user?.dob || '',
    gender: user?.gender || '',
    rewardPoints: user?.rewardPoints || 0,
    referralCode: user?.referralCode || '',
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
    <ParentLayout title="User Profile" activePage="profile">
      {!user ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        /* Content */
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* LEFT COLUMN — summary, referral, support */}
          <div className="md:col-span-1 space-y-6 md:sticky md:top-24">
            <ProfileSummaryCard
              currentUser={currentUser}
              isUploadingPic={isUploadingPic}
              fileInputRef={fileInputRef}
              onPicSelected={handlePicSelected}
            />

            <ReferralCard
              referralCode={currentUser.referralCode}
              copied={copied}
              onCopy={copyReferralCode}
            />

            <SupportCard
              appVersion={currentUser.appVersion}
              onOpenPrivacy={() => openExternalUrl(PRIVACY_URL)}
              onOpenTerms={() => openExternalUrl(TERMS_URL)}
            />
          </div>

          {/* RIGHT COLUMN — details, security, danger zone */}
          <div className="md:col-span-2 space-y-6">
            <PersonalDetailsCard
              currentUser={currentUser}
              profileForm={profileForm}
              setProfileForm={setProfileForm}
              isEditing={isEditing}
              isSaving={isSaving}
              onEdit={startEditing}
              onCancel={cancelEditing}
              onSave={handleProfileSave}
            />

            <PasswordSection
              showPasswordForm={showPasswordForm}
              setShowPasswordForm={setShowPasswordForm}
              passwordForm={passwordForm}
              setPasswordForm={setPasswordForm}
              showPasswords={showPasswords}
              setShowPasswords={setShowPasswords}
              isChangingPassword={isChangingPassword}
              onSubmit={handlePasswordChange}
            />

            <DangerZoneCard isDeleting={isDeleting} onDelete={handleDeleteAccount} />
          </div>
        </div>
      )}
    </ParentLayout>
  )
}

export default ProfilePage
