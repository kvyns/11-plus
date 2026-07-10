function PlanCardSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 gap-5">
      {[1, 2].map((i) => (
        <div key={i} className="h-64 rounded-2xl bg-white border border-amber-100/60 animate-pulse" />
      ))}
    </div>
  )
}

export default PlanCardSkeleton
