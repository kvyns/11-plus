import { Check, Copy, Gift } from 'lucide-react'

function ReferralCard({ referralCode, copied, onCopy }) {
  return (
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
          value={referralCode}
          readOnly
          className="w-full pl-4 pr-12 py-3 bg-slate-50 rounded-full border-2 border-slate-200 font-semibold tracking-widest text-slate-900 text-sm"
        />
        <button
          onClick={onCopy}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full flex items-center justify-center text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

export default ReferralCard
