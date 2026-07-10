import { Gift } from 'lucide-react'
import CodeInput from '../ui/CodeInput.jsx'
import SubmitButton from '../ui/SubmitButton.jsx'
import AlertBanner from '../ui/AlertBanner.jsx'

function ReferralForm({
  handleReferralSubmit,
  referral,
  setReferral,
  isValidatingReferral,
  referralError,
  onSkip,
}) {
  return (
    <form onSubmit={handleReferralSubmit} className="space-y-3">
      <div className="flex justify-center">
        <div className="rounded-full bg-pastel-yellow p-4">
          <Gift className="h-10 w-10 text-pastel-yellow-ink" />
        </div>
      </div>

      {referralError && <AlertBanner variant="error">{referralError}</AlertBanner>}

      <CodeInput
        label="Referral Code"
        maxLength={20}
        placeholder="Referral code"
        value={referral}
        onChange={(e) => setReferral(e.target.value.toUpperCase())}
        className="font-semibold text-lg"
        required
      />

      <SubmitButton loading={isValidatingReferral} loadingText="Validating...">
        Validate Referral
      </SubmitButton>

      <button
        type="button"
        onClick={onSkip}
        className="w-full text-sm font-semibold text-slate-500 hover:text-indigo-600"
      >
        Skip and login
      </button>
    </form>
  )
}

export default ReferralForm
