import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 shadow-btn',
  amber: 'bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 shadow-lg shadow-amber-500/30',
}

function SubmitButton({ loading, loadingText, children, variant = 'primary', className = '', ...props }) {
  return (
    <button
      type="submit"
      disabled={loading || props.disabled}
      className={`w-full flex items-center justify-center gap-2 rounded-full py-3.5 text-lg font-bold text-white transition-all duration-200 disabled:shadow-none ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          {loadingText || 'Please wait...'}
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default SubmitButton
