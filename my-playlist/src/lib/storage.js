const KEY = 'vibe_entries'

export function saveEntry(entry) {
  const list = getEntries()
  // sessionId 기준으로 같은 세션 업데이트, 없으면 date로 fallback (구버전 호환)
  const key = entry.sessionId ?? entry.date
  const idx = list.findIndex(e => (e.sessionId ?? e.date) === key)
  if (idx !== -1) list[idx] = entry
  else list.unshift(entry)
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function getEntries() {
  const raw = localStorage.getItem(KEY)
  return raw ? JSON.parse(raw) : []
}

export function getEntry(date) {
  return getEntries().find(e => e.date === date) ?? null
}

export function getEntryByKey(key) {
  return getEntries().find(e => (e.sessionId ?? e.date) === key) ?? null
}

export function today() {
  return new Date().toISOString().slice(0, 10)
}
