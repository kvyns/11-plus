import { Send } from 'lucide-react'

function SubmitConfirmModal({ answeredCount, unansweredCount, markedCount, onSubmit, onCancel, title = 'Submit this mock?' }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-100 max-w-sm w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-pastel-yellow p-3">
            <Send className="h-6 w-6 text-pastel-yellow-ink" />
          </div>
        </div>
        <h3 className="font-display text-xl font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 mb-5">You won't be able to change your answers after this.</p>

        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="rounded-xl bg-pastel-mint p-2.5">
            <p className="font-display text-lg font-bold text-slate-900">{answeredCount}</p>
            <p className="text-[10px] font-semibold text-pastel-mint-ink">Answered</p>
          </div>
          <div className="rounded-xl bg-pastel-pink p-2.5">
            <p className="font-display text-lg font-bold text-slate-900">{unansweredCount}</p>
            <p className="text-[10px] font-semibold text-pastel-pink-ink">Unanswered</p>
          </div>
          <div className="rounded-xl bg-pastel-lavender p-2.5">
            <p className="font-display text-lg font-bold text-slate-900">{markedCount}</p>
            <p className="text-[10px] font-semibold text-pastel-lavender-ink">Marked</p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onSubmit}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-full text-sm transition-colors shadow-btn"
          >
            Submit
          </button>
          <button
            onClick={onCancel}
            className="w-full bg-white hover:bg-slate-50 text-slate-600 font-bold py-3 rounded-full text-sm transition-colors border-2 border-slate-200"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}

export default SubmitConfirmModal
