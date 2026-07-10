export function childName(child, i) {
  return child.firstName || child.name || child.username || `Child ${i + 1}`
}
