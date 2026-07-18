import { ExternalLink } from 'lucide-react'

function SupportCard({ appVersion, onOpenPrivacy, onOpenTerms }) {
  return (
    <div className="bg-white rounded-[1.75rem] p-6 shadow-card-xl border border-amber-100/60">
      <h3 className="font-display text-lg font-bold text-slate-900 mb-2">Support</h3>
      <div className="space-y-1">
        <button
          onClick={onOpenPrivacy}
          className="w-full text-left flex items-center justify-between px-3 py-2.5 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          <span className="text-sm text-slate-700 font-medium">Privacy Policy</span>
          <ExternalLink className="h-4 w-4 text-indigo-500" />
        </button>
        <button
          onClick={onOpenTerms}
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
          <span className="text-sm text-slate-400 font-semibold">{appVersion}</span>
        </div>
      </div>
    </div>
  )
}

export default SupportCard
