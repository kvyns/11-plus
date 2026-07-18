// The API spec only documents `result: JSON Object` / `promotion: JSON Object`
// generically for these two endpoints — no field-level schema is given, so
// every accessor here is defensive (multiple plausible key names) rather
// than trusting one exact shape.

export function parsePriceBreakdown(response) {
  const result = response?.result || response?.data || response || {}
  const perChild = result.childBreakdown || result.children || result.breakdown || (Array.isArray(result) ? result : []) || []
  const map = {}
  perChild.forEach((entry) => {
    const id = entry.childID || entry.id
    if (id) map[id] = entry
  })
  const total = result.totalAmount ?? result.total ?? result.amount ?? sumBreakdown(perChild)
  const currency = result.currency || perChild[0]?.currency || 'GBP'
  return { byChildId: map, total, currency }
}

export function parseVoucherResult(response) {
  const promotion = response?.promotion || response?.result || {}
  const perChild = promotion.childBreakdown || promotion.children || []
  const map = {}
  perChild.forEach((entry) => {
    const id = entry.childID || entry.id
    if (id) map[id] = entry
  })
  const total = promotion.totalAmount ?? promotion.total ?? promotion.finalAmount ?? sumBreakdown(perChild)
  return { byChildId: map, total }
}

// stripe/payment's response is confirmed (live-tested) to be a Stripe
// PaymentSheet bundle — the same shape the mobile SDKs use for their
// embedded card form, not a Checkout Session. `clientSecret` here drives
// the web Payment Element via Elements' `options.clientSecret`.
export function parsePaymentSheet(response) {
  const sheet = response?.paymentSheet || response?.result?.paymentSheet || {}
  return {
    clientSecret: sheet.paymentIntent || null,
    ephemeralKey: sheet.ephemeralKey || null,
    customerId: sheet.customer || null,
  }
}

function sumBreakdown(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return undefined
  return entries.reduce((sum, entry) => sum + (Number(entry.price ?? entry.amount) || 0), 0)
}

export function formatCurrency(amount, currency = 'GBP') {
  if (amount === undefined || amount === null) return ''
  const symbol = String(currency).toUpperCase() === 'GBP' ? '£' : ''
  return `${symbol}${Number(amount).toFixed(2)}`
}
