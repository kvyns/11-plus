import { Calendar, Check, CircleCheck, Mail, MapPin, Pencil, Phone, User, X } from 'lucide-react'

function PersonalDetailsCard({ currentUser, profileForm, setProfileForm, isEditing, isSaving, onEdit, onCancel, onSave }) {
  return (
    <div className="bg-white rounded-[1.75rem] p-6 md:p-8 shadow-card-xl border border-amber-100/60">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display text-lg font-bold text-slate-900">Personal Details</h3>
        {!isEditing ? (
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={onSave}
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
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
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
              <p className="text-sm font-semibold text-slate-900 px-3 py-2.5">{currentUser.firstName}</p>
            )}
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
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
              <p className="text-sm font-semibold text-slate-900 px-3 py-2.5">{currentUser.lastName}</p>
            )}
          </div>
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            <Mail className="h-3.5 w-3.5 text-indigo-500" />
            Email
          </label>
          <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-sm font-semibold text-slate-900">{currentUser.email}</span>
            <CircleCheck className="h-4 w-4 text-green-500 shrink-0" />
          </div>
        </div>

        {/* Mobile + DOB row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
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
              <p className="text-sm font-semibold text-slate-900 px-3 py-2.5">{currentUser.mobile}</p>
            )}
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
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
              <p className="text-sm font-semibold text-slate-900 px-3 py-2.5">
                {currentUser.dob || '—'}
              </p>
            )}
          </div>
        </div>

        {/* Gender (only shown while editing, or if set) */}
        {(isEditing || currentUser.gender) && (
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
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
              <p className="text-sm font-semibold text-slate-900 px-3 py-2.5">{currentUser.gender}</p>
            )}
          </div>
        )}

        {/* Address */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
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
            <p className="text-sm font-semibold text-slate-900 px-3 py-2.5">
              {profileForm.addressLine
                ? `${profileForm.addressLine}, ${profileForm.country} ${profileForm.postcode}`.trim()
                : '—'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default PersonalDetailsCard
