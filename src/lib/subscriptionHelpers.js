export function planIdOf(plan, index) {
  return plan.id || plan.planID || plan.subscriptionID || index + 1
}

export function getPlanCycle(plan) {
  if (plan.cycle) return plan.cycle
  const label = `${plan.billType || ''} ${plan.billing || ''}`.toLowerCase()
  return label.includes('year') ? 'yearly' : 'monthly'
}

export function getPlanPrice(plan) {
  if (plan.price) {
    return plan.price
  }

  if (plan.amount !== undefined) {
    const symbol = String(plan.currency || '').toUpperCase() === 'GBP' ? '£' : ''
    return `${symbol}${plan.amount}`
  }

  return 'N/A'
}

export function getPlanFeatures(plan) {
  if (Array.isArray(plan.subjects) && plan.subjects.length) {
    return plan.subjects
  }
  if (Array.isArray(plan.features) && plan.features.length) {
    return plan.features
  }
  if (plan.description) {
    return [plan.description]
  }
  return []
}
