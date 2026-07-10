function AuthHero({ icon: Icon, iconBg = 'bg-pastel-lavender', iconColor = 'text-pastel-lavender-ink', title, subtitle }) {
  return (
    <div className="text-center">
      <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${iconBg}`}>
        <Icon className={`h-7 w-7 ${iconColor}`} />
      </div>
      <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
    </div>
  )
}

export default AuthHero
