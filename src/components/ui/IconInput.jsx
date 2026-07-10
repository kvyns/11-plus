function IconInput({ icon: Icon, label, rightElement, className = '', ...inputProps }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-slate-900 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-500" />}
        <input
          className={`w-full py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none bg-slate-50 text-slate-900 placeholder-slate-400 transition-colors ${Icon ? 'pl-12' : 'pl-4'} ${rightElement ? 'pr-12' : 'pr-4'} ${className}`}
          {...inputProps}
        />
        {rightElement && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
    </div>
  )
}

export default IconInput
