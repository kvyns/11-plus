function StatsSidebar({ stats }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-card border border-amber-100/60 grid grid-cols-3 gap-2 text-center">
      {stats.map(({ Icon, iconClassName, value, valueClassName, label }) => (
        <div key={label}>
          <Icon className={`h-4 w-4 mx-auto mb-1 ${iconClassName}`} />
          <p className={`font-display text-2xl font-bold leading-none ${valueClassName}`}>{value}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        </div>
      ))}
    </div>
  )
}

export default StatsSidebar
