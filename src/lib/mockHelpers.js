export const subjectArt = {
  ENGLISH: '/english/english.png',
  VERBAL: '/verbal/verbal.png',
  MATHS: '/maths/maths.png',
  NON_VERBAL: '/non-verbal/non_verbal.png',
}

// The API's mockStatus field doesn't reliably flip to "LIVE" once the window
// opens (it's often still "UPCOMING") — the doc explicitly calls out that the
// LIVE state has to be derived from startTime/endTime on the client.
export function isMockLive(mock) {
  const statusIndicatesLive = ['LIVE', 'OPEN'].includes(String(mock.mockStatus || '').toUpperCase())
  const startMs = mock.startTime ? new Date(mock.startTime).getTime() : null
  const endMs = mock.endTime ? new Date(mock.endTime).getTime() : null
  const withinWindow = startMs !== null && endMs !== null && !Number.isNaN(startMs) && !Number.isNaN(endMs)
    ? Date.now() >= startMs && Date.now() <= endMs
    : false
  return statusIndicatesLive || withinWindow
}

export function formatMockDate(value) {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatDateRange(start, end) {
  const startLabel = formatMockDate(start)
  const endLabel = formatMockDate(end)
  if (startLabel && endLabel) return `${startLabel} – ${endLabel}`
  return startLabel || endLabel || null
}
