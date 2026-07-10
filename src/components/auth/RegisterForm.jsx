import { Mail, KeyRound, Eye, EyeOff, User, Phone } from 'lucide-react'
import IconInput from '../ui/IconInput.jsx'
import SubmitButton from '../ui/SubmitButton.jsx'
import AlertBanner from '../ui/AlertBanner.jsx'

const TERMS_URL = 'https://jmvl.co.uk/terms-and-conditions/'
const PRIVACY_URL = 'https://jmvl.co.uk/privacy-policy/'

function RegisterForm({
  formData,
  handleChange,
  handleSubmit,
  isSubmitting,
  errorMessage,
  showPassword,
  setShowPassword,
  onSignIn,
}) {
  return (
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
        <button onClick={onSignIn} className="text-indigo-600 font-semibold hover:underline">
          Sign In
        </button>
      </div>
    </>
  )
}

export default RegisterForm
