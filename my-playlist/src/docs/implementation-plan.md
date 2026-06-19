# Vibe Playlist — 구현 계획

## 설치 패키지

```bash
pnpm add @anthropic-ai/sdk
```

---

## 1. 폴더 구조

```
src/
├── context/
│   └── AppContext.jsx         # 전역 상태: 화면 전환 + Toast
│
├── api/
│   └── claude.js              # Claude API 호출 모듈
├── lib/
│   └── storage.js             # localStorage 유틸
├── hooks/
│   └── useDebounce.js         # debounce 커스텀 훅
│
├── components/
│   ├── layout/                # 앱 뼈대
│   │   ├── AppShell.jsx       # 전체 래퍼 + Toast 렌더링
│   │   └── BottomNav.jsx      # 홈 / 기록 탭
│   │
│   ├── playlist/              # 홈·상세 공용 ✦ 재사용
│   │   ├── PlaylistCard.jsx   # 카드 1개 — onPlay prop으로 동작 분기
│   │   └── PlaylistGrid.jsx   # 카드 목록 래퍼
│   │
│   └── ui/                    # 범용 원자 컴포넌트
│       ├── DateBadge.jsx            # 날짜 표시
│       ├── VibeTagList.jsx          # 분위기 태그 뱃지
│       ├── MemoInput.jsx            # textarea
│       ├── RecommendingIndicator.jsx  # "분석 중..." 표시
│       ├── ErrorBanner.jsx          # 에러 + 재시도
│       ├── ArchiveItem.jsx          # 아카이브 목록 항목
│       ├── EmptyState.jsx           # 빈 상태 안내
│       └── Toast.jsx                # 전역 알림
│
├── pages/
│   ├── HomeScreen.jsx         # 메모 입력 + 추천
│   ├── ArchiveScreen.jsx      # 기록 목록
│   └── DetailScreen.jsx       # 기록 상세
│
├── App.jsx                    # AppContext 구독 → 현재 화면 렌더
├── App.css
├── index.css
└── main.jsx
```

### 컴포넌트 재사용 맵

| 컴포넌트 | 사용 위치 |
|----------|-----------|
| `PlaylistCard` | HomeScreen (클릭 → 재생 + 저장), DetailScreen (클릭 → 재생만) |
| `PlaylistGrid` | HomeScreen, DetailScreen |
| `DateBadge` | HomeScreen, DetailScreen |
| `VibeTagList` | PlaylistCard 내부 |
| `EmptyState` | ArchiveScreen |
| `Toast` | AppShell (전역 1개) |

---

## 2. Context 설계

화면 전환(`view`)과 전역 알림(`toast`)은 prop drilling 없이 Context로 관리합니다.

```jsx
// src/context/AppContext.jsx

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [view, setView] = useState({ screen: 'home', date: null })
  const [toast, setToast] = useState({ visible: false, message: '' })

  function navigate(screen, date = null) {
    setView({ screen, date })
  }

  function showToast(message) {
    setToast({ visible: true, message })
    setTimeout(() => setToast({ visible: false, message: '' }), 2000)
  }

  return (
    <AppContext.Provider value={{ view, navigate, toast, showToast }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
```

**Context가 제공하는 것**

| 값 | 타입 | 사용처 |
|----|------|--------|
| `view` | `{ screen, date }` | App.jsx — 어떤 페이지 렌더할지 |
| `navigate(screen, date?)` | function | BottomNav, ArchiveItem, DetailHeader |
| `toast` | `{ visible, message }` | AppShell → Toast 렌더 |
| `showToast(message)` | function | HomeScreen — 카드 클릭 후 호출 |

---

## 3. 페이지 구성

### App.jsx — 화면 라우팅

```jsx
// context 구독 → 현재 screen에 맞는 페이지 렌더
import { useApp } from './context/AppContext'

function App() {
  const { view } = useApp()

  return (
    <AppShell>
      {view.screen === 'home'    && <HomeScreen />}
      {view.screen === 'archive' && <ArchiveScreen />}
      {view.screen === 'detail'  && <DetailScreen date={view.date} />}
    </AppShell>
  )
}
```

---

### HomeScreen 상태 흐름

```
idle
  → (입력 시작) → typing
  → (멈춤 1.5초 + 최소 10자) → loading  ← Claude 자동 호출
  → (성공) → ready
  → (실패) → error

ready
  → (메모 수정) → typing → loading → ready   // 재추천
  → (카드 클릭) → window.open() + saveEntry() + showToast()
```

**컴포넌트 트리**

```
HomeScreen
├── DateBadge
├── MemoInput                  ← onChange로 typing 전환
├── RecommendingIndicator      ← loading 상태일 때
├── PlaylistGrid               ← ready 상태일 때
│   └── PlaylistCard[]         ← onPlay = 재생 + 저장 + showToast
└── ErrorBanner                ← error 상태일 때
```

---

### ArchiveScreen

```
ArchiveScreen
├── ArchiveItem[]  ← 클릭 → navigate('detail', date)
└── EmptyState     ← 기록 없을 때
```

---

### DetailScreen

```
DetailScreen (date prop 받음)
├── DateBadge      ← 해당 날짜 표시 + 뒤로가기 버튼 포함
├── MemoDisplay    ← 저장된 메모 전문 (인라인, 별도 컴포넌트 불필요)
└── PlaylistGrid
    └── PlaylistCard[]  ← onPlay = 재생만 (저장 없음)
```

---

## 4. API 제작

### 4-1. `src/lib/storage.js`

```js
const KEY = 'vibe_entries'

// { date: 'YYYY-MM-DD', memo, playlists, savedAt }
export function saveEntry(entry) {
  const list = getEntries()
  const idx = list.findIndex(e => e.date === entry.date)
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
```

---

### 4-2. `src/hooks/useDebounce.js`

```js
import { useState, useEffect } from 'react'

export function useDebounce(value, delay = 1500) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
```

---

### 4-3. `src/api/claude.js`

```js
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

const SYSTEM_PROMPT = `당신은 음악 플레이리스트 큐레이터입니다.
사용자의 오늘 기분과 일정을 읽고 그 바이브에 맞는 플레이리스트를 3–5개 추천하세요.
반드시 아래 JSON 배열만 응답하세요. 마크다운, 설명 텍스트 없이.
[
  {
    "title": "플레이리스트 이름",
    "tags": ["태그1", "태그2"],
    "url": "https://open.spotify.com/... 또는 https://youtube.com/...",
    "platform": "spotify 또는 youtube",
    "reason": "오늘 메모와 연결된 이유 한 줄"
  }
]
규칙: tags는 한국어 분위기 단어 2–3개. url은 실제 존재하는 링크.`

export async function getRecommendations(memo) {
  const res = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `오늘의 바이브 메모: "${memo}"` }],
  })
  const text = res.content[0].type === 'text' ? res.content[0].text : ''
  return JSON.parse(text).map((p, i) => ({ ...p, id: `${Date.now()}-${i}` }))
}
```

---

### 4-4. HomeScreen 연동 포인트

```jsx
const { showToast } = useApp()
const [memo, setMemo] = useState('')
const [playlists, setPlaylists] = useState([])
const [status, setStatus] = useState('idle') // idle | typing | loading | ready | error

const debouncedMemo = useDebounce(memo)

// debounce 발동 → Claude 자동 호출
useEffect(() => {
  if (debouncedMemo.trim().length < 10) return
  setStatus('loading')
  getRecommendations(debouncedMemo)
    .then(result => { setPlaylists(result); setStatus('ready') })
    .catch(() => setStatus('error'))
}, [debouncedMemo])

// 카드 클릭 → 재생 + 저장 + 토스트
function handlePlay(playlist) {
  window.open(playlist.url, '_blank')
  saveEntry({ date: today(), memo, playlists, savedAt: new Date().toISOString() })
  showToast('기록됐어요!')   // Context로 전역 Toast 호출
}
```

---

## 5. 환경 변수

```
# .env.local
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

> ⚠️ MVP는 클라이언트에서 직접 호출합니다. 실서비스 전 백엔드 프록시로 이전 필요.

---

## 6. 구현 순서

| 단계 | 작업 | 파일 |
|------|------|------|
| 1 | 패키지 설치 + 환경변수 | `.env.local` |
| 2 | Context 세팅 | `AppContext.jsx`, `main.jsx` 래핑 |
| 3 | 데이터 레이어 | `storage.js`, `useDebounce.js` |
| 4 | Claude API 모듈 | `claude.js` |
| 5 | layout 컴포넌트 | `AppShell.jsx`, `BottomNav.jsx` |
| 6 | ui 원자 컴포넌트 | `ui/*` |
| 7 | playlist 공용 컴포넌트 | `PlaylistCard.jsx`, `PlaylistGrid.jsx` |
| 8 | HomeScreen 조립 | `HomeScreen.jsx` |
| 9 | ArchiveScreen + DetailScreen | `ArchiveScreen.jsx`, `DetailScreen.jsx` |
| 10 | App.jsx 최종 조립 | `App.jsx` |
