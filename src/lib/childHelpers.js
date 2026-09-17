export function childName(child, i) {
  const fullName = [child.firstName, child.lastName].filter(Boolean).join(' ')
  return fullName || child.name || child.username || `Child ${i + 1}`
}

// "Kavyansh Dhakad" -> "KD"; "Kavyansh" (no last name) -> "K".
export function initials(fullName) {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
}

// The API sometimes returns yearGroup as a bare number (4) and sometimes as
// a full label ("Year 4") — normalize to the label either way.
export function formatYearGroup(yearGroup) {
  if (yearGroup === undefined || yearGroup === null || yearGroup === '') return null
  return /^\d+$/.test(String(yearGroup)) ? `Year ${yearGroup}` : yearGroup
}

// /quiz/history is paginated via lastKey/nextPageKey with no subject-level
// totals endpoint, so subject-wise attempt counts have to be accumulated by
// walking every page. Capped to avoid an unbounded loop against a bad response.
export async function fetchAllQuizHistory(api, childID) {
  let all = []
  let lastKey = null
  let guard = 0

  do {
    const response = await api.quiz.quizHistory({ childID, subject: null, dateFilter: 'ALL_TIME', lastKey })
    all = all.concat(response.quizzes || [])
    lastKey = response.nextPageKey || null
    guard += 1
  } while (lastKey && guard < 20)

  return all
}

// Each /quiz/history item is a distinct quiz config (subject+category+topic)
// with its own quizAttempts count — sum those per subject to get a total.
export function quizCountsBySubject(quizzes) {
  const counts = {}
  quizzes.forEach((quiz) => {
    if (!quiz.subject) return
    counts[quiz.subject] = (counts[quiz.subject] || 0) + (quiz.quizAttempts ?? 0)
  })
  return counts
}
