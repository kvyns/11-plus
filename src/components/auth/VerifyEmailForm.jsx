import { ShieldCheck } from 'lucide-react'
import CodeInput from '../ui/CodeInput.jsx'
import SubmitButton from '../ui/SubmitButton.jsx'
import AlertBanner from '../ui/AlertBanner.jsx'

function VerifyEmailForm({
  handleVerifySubmit,
  code,
  setCode,
  isVerifying,
  statusMessage,
  verifyError,
  handleGenerateCode,
  isSendingCode,
  onBack,
}) {
  return (
    <form onSubmit={handleVerifySubmit} className="space-y-3">
      <div className="flex justify-center">
        <div className="rounded-full bg-pastel-lavender p-4">
          <ShieldCheck className="h-10 w-10 text-pastel-lavender-ink" />
        </div>
      </div>

      {statusMessage && <AlertBanner variant="success">{statusMessage}</AlertBanner>}
      {verifyError && <AlertBanner variant="error">{verifyError}</AlertBanner>}

      <CodeInput
        label="Verification Code"
        placeholder="Enter 6 digit code"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        required
      />

      <SubmitButton loading={isVerifying} loadingText="Verifying...">
        Verify Email
      </SubmitButton>

      <button
        type="button"
        onClick={handleGenerateCode}
        disabled={isSendingCode}
        className="w-full text-sm font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
      >
        {isSendingCode ? 'Sending code...' : 'Resend verification code'}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-sm font-semibold text-slate-500 hover:text-slate-700"
      >
        ← Back to registration details
      </button>
    </form>
  )
}

export default VerifyEmailForm
