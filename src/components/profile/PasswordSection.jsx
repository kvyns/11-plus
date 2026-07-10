import { Eye, EyeOff, KeyRound } from 'lucide-react'

function PasswordSection({
  showPasswordForm,
  setShowPasswordForm,
  passwordForm,
  setPasswordForm,
  showPasswords,
  setShowPasswords,
  isChangingPassword,
  onSubmit,
}) {
  return (
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
            onClick={onSubmit}
            disabled={isChangingPassword}
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 px-3 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            {isChangingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      )}
    </div>
  )
}

export default PasswordSection
