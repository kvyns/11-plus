function CodeInput({ label, maxLength = 6, className = '', ...inputProps }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-slate-900 mb-1.5">
          {label}
        </label>
      )}
      <input
        type="text"
        inputMode="numeric"
        maxLength={maxLength}
        className={`w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none bg-slate-50 text-center tracking-widest text-2xl font-mono text-slate-900 placeholder-slate-400 transition-colors ${className}`}
        {...inputProps}
      />
    </div>
  )
}

export default CodeInput
