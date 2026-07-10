import { Star, UserPlus, UsersRound } from 'lucide-react'

const benefits = [
  'Clear study plans and organized mock tests.',
  'Simulates actual exam conditions.',
  'Tailored insights into strengths and weaknesses.',
  'Study anytime, anywhere via mobile devices.',
  'Ensures relevance with current exam formats and curriculum.',
]

function EmptyChildrenState({ onAddChild }) {
  return (
    <>
      <img
        src="/home.jpeg"
        alt="11+ learning"
        className="w-full h-auto md:h-auto object-cover rounded-[1.5rem] mb-6"
      />

      <div className="flex justify-center mb-4">
        <div className="rounded-full bg-pastel-lavender p-4">
          <UsersRound className="h-10 w-10 text-pastel-lavender-ink" />
        </div>
      </div>

      <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900 mb-8">
        Add a child to explore exam preparation!
      </h2>

      <div className="space-y-4 mb-8 text-left max-w-2xl mx-auto">
        {benefits.map((text) => (
          <div key={text} className="flex items-start gap-4">
            <Star className="mt-1 h-5 w-5 shrink-0 fill-amber-400 text-amber-400" />
            <p className="text-slate-700 font-medium">{text}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onAddChild}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-full text-lg transition-all duration-200 shadow-btn flex items-center gap-2 mx-auto"
      >
        <UserPlus className="h-5 w-5" />
        <span>Add a Child</span>
      </button>
    </>
  )
}

export default EmptyChildrenState
