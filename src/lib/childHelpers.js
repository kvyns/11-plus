export function childName(child, i) {
  const fullName = [child.firstName, child.lastName].filter(Boolean).join(' ')
  return fullName || child.name || child.username || `Child ${i + 1}`
}
