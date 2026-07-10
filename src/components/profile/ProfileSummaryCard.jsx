import { Camera, Loader2, Star } from 'lucide-react'
import { buildMediaUrl } from '../../services/api.js'

function ProfileSummaryCard({ currentUser, isUploadingPic, fileInputRef, onPicSelected }) {
  return (
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
          onChange={onPicSelected}
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
  )
}

export default ProfileSummaryCard
