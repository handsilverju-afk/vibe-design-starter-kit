# Vibe Playlist — UX 설계 문서

## 1. 유저 시나리오 리스트

| # | 시나리오 | 트리거 | 기대 결과 |1
|---|----------|--------|-----------|
| S1 | **첫 방문** | 앱 최초 실행 | 홈 화면 진입, 메모 입력 안내 문구 표시 |
| S2 | **아침 메모 작성** | 홈 진입 → 텍스트 입력 | 오늘 날짜 자동 표시, 기분/일정 텍스트 입력 |
| S3 | **자동 추천 시작** | 메모 입력 후 타이핑 멈춤 (debounce 1.5초, 최소 10자) | Claude가 자동으로 메모를 분석해 3–5개 플레이리스트 카드 표시 (버튼 없음) |
| S4 | **추천 중 로딩** | debounce 발동 → API 요청 중 | 로딩 인디케이터 표시, 메모 입력 유지 |
| S5 | **플레이리스트 선택 및 자동 저장** | 플레이리스트 카드 클릭 | 외부 링크 새 탭으로 열림 + 동시에 메모·추천 목록 자동 저장 |
| S6 | **메모 수정 후 재추천** | 기존 메모 수정 → 다시 타이핑 멈춤 | 새 메모 기준으로 추천 목록 자동 갱신, 이전 기록 덮어씀 |
| S7 | **아카이브 조회** | 하단 탭 "기록" 클릭 | 날짜 역순으로 과거 기록 리스트 표시 |
| S8 | **기록 상세 보기** | 아카이브 리스트 항목 클릭 | 해당 날짜의 메모 + 들은 플레이리스트 상세 표시 |
| S9 | **기록이 없을 때 아카이브 진입** | 아카이브 탭 진입 (기록 0건) | 빈 상태 안내 문구 + 홈으로 돌아가기 버튼 |

---

## 2. UX Flow

### 메인 플로우

```
[앱 실행]
    │
    ▼
[홈 화면]
 오늘 날짜 표시
 당일 기록 있으면 메모 + 추천 목록 복원
    │
    ├─ 메모 입력 (textarea)
    │       │
    │       │  타이핑 멈춤 (debounce 1.5초, 최소 10자)
    │       │  ← 버튼 없음, 자동 감지
    │       ▼
    │  [로딩 인디케이터]  ← Claude API 자동 호출
    │       │
    │       ▼
    │  [플레이리스트 카드 3–5개 표시]
    │       │
    │       │  카드 클릭
    │       ▼
    │  ┌─────────────────────────────────────┐
    │  │ 외부 링크 새 탭으로 열림             │
    │  │ + 메모 & 추천 목록 자동 저장        │  ← 저장 버튼 없음
    │  │ + 토스트 "기록됐어요!" 표시         │
    │  └─────────────────────────────────────┘
    │
    └─ [하단 탭: 기록]
            │
            ▼
       [아카이브 화면]
        날짜별 리스트 (역순)
            │
            ├─ 기록 없음 → 빈 상태 안내
            │
            └─ 항목 클릭
                    │
                    ▼
              [기록 상세 화면]
               메모 전문
               들은 플레이리스트 목록
               외부 링크 버튼
```

### 상태 전이 (홈 화면)

```
idle
  │  텍스트 입력 시작
  ▼
typing
  │  타이핑 멈춤 (debounce 1.5초) + 최소 10자 충족
  ▼
loading          ← Claude API 자동 호출
  │  성공
  ▼
has_recommendations
  │  카드 클릭
  ▼
auto_saved       ← 저장 + 외부 링크 동시에 / 토스트 표시

  (메모 수정 시)
has_recommendations → typing → loading → has_recommendations

  (loading 중 에러 발생)
loading → error  ← 에러 메시지 + 재시도 버튼
```

---

## 3. Component List

### 공통 (Shared)

| 컴포넌트 | 설명 | Props |
|----------|------|-------|
| `AppShell` | 전체 레이아웃 + 하단 탭 내비게이션 | `children` |
| `BottomNav` | 홈 / 기록 탭 전환 | `activeTab`, `onTabChange` |
| `Toast` | 저장 완료 / 에러 알림 | `message`, `type` |
| `LoadingSpinner` | 추천 로딩 중 표시 | `size?` |
| `EmptyState` | 데이터 없을 때 안내 | `message`, `actionLabel?`, `onAction?` |

---

### 홈 화면 (Home)

| 컴포넌트 | 설명 | Props |
|----------|------|-------|
| `HomeScreen` | 홈 화면 전체 컨테이너 | — |
| `DateBadge` | 오늘 날짜 표시 (YYYY.MM.DD) | `date` |
| `MemoInput` | 기분/일정 입력 textarea (debounce 내장) | `value`, `onChange`, `placeholder`, `loading` |
| `RecommendingIndicator` | 자동 추천 중 상태 표시 (입력창 하단, 미묘하게) | `visible` |
| `PlaylistGrid` | 추천 카드 목록 래퍼 | `playlists`, `onPlay` |
| `PlaylistCard` | 플레이리스트 단일 카드 (클릭 = 재생 + 저장) | `title`, `tags[]`, `url`, `platform`, `onClick` |
| `VibeTagList` | 분위기 태그 뱃지 목록 | `tags[]` |
| `ErrorBanner` | API 오류 메시지 + 재시도 | `message`, `onRetry` |

---

### 아카이브 화면 (Archive)

| 컴포넌트 | 설명 | Props |
|----------|------|-------|
| `ArchiveScreen` | 아카이브 화면 컨테이너 | — |
| `ArchiveList` | 날짜별 기록 목록 | `entries[]` |
| `ArchiveItem` | 리스트 단일 항목 (날짜 + 메모 요약) | `date`, `memoPreview`, `playlistCount`, `onClick` |

---

### 기록 상세 화면 (Detail)

| 컴포넌트 | 설명 | Props |
|----------|------|-------|
| `DetailScreen` | 기록 상세 화면 컨테이너 | `entryDate` |
| `DetailHeader` | 날짜 + 뒤로가기 버튼 | `date`, `onBack` |
| `MemoDisplay` | 저장된 메모 전문 표시 | `memo` |
| `SavedPlaylistList` | 저장된 추천 목록 | `playlists[]` |
| `PlaylistLinkButton` | 외부 재생 링크 버튼 | `url`, `platform` |

---

## 4. Data Model

```typescript
// 플레이리스트 단일 항목
interface Playlist {
  id: string;
  title: string;
  tags: string[];          // 분위기 태그 (예: ["집중", "로파이", "잔잔함"])
  url: string;             // Spotify / YouTube 링크
  platform: "spotify" | "youtube" | "other";
  reason: string;          // AI가 이 플레이리스트를 추천한 이유 (1줄)
}

// 하루 기록 단위
interface DayEntry {
  date: string;            // "2026-06-19" (YYYY-MM-DD)
  memo: string;            // 사용자 입력 메모
  playlists: Playlist[];   // 추천 플레이리스트 목록
  savedAt: string;         // ISO timestamp
}

// localStorage 키: "vibe_entries"
// 저장 형태: DayEntry[] (날짜 역순 정렬)
```

---

## 5. API List

### 5-1. Claude AI 추천 API

| 항목 | 내용 |
|------|------|
| **엔드포인트** | `POST https://api.anthropic.com/v1/messages` |
| **SDK** | `@anthropic-ai/sdk` (TypeScript) |
| **모델** | `claude-haiku-4-5` (빠른 응답, 비용 효율적) |
| **호출 시점** | 메모 입력 후 타이핑 멈춤 (debounce 1.5초, 최소 10자) |
| **입력** | 사용자 메모 텍스트 |
| **출력** | 3–5개의 플레이리스트 JSON 배열 |

#### 요청 구조

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
});

async function getPlaylistRecommendations(memo: string): Promise<Playlist[]> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    system: `당신은 음악 플레이리스트 큐레이터입니다.
사용자가 오늘 아침의 기분과 일정을 텍스트로 남기면,
그 바이브에 맞는 플레이리스트를 3–5개 추천해주세요.

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.
[
  {
    "title": "플레이리스트 이름",
    "tags": ["태그1", "태그2"],
    "url": "https://open.spotify.com/... 또는 https://youtube.com/...",
    "platform": "spotify 또는 youtube",
    "reason": "이 플레이리스트를 추천하는 이유 한 줄"
  }
]

규칙:
- tags는 분위기를 나타내는 한국어 단어 2–3개 (예: "집중", "잔잔함", "에너지업")
- url은 실제 존재하는 Spotify 플레이리스트 또는 YouTube 링크
- reason은 사용자의 오늘 메모와 연결된 이유
- 응답은 JSON 배열만, 마크다운 코드블록 없이`,
    messages: [
      {
        role: "user",
        content: `오늘의 바이브 메모: "${memo}"`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const parsed: Omit<Playlist, "id">[] = JSON.parse(text);

  return parsed.map((p, i) => ({
    ...p,
    id: `${Date.now()}-${i}`,
  }));
}
```

#### 에러 처리

```typescript
import Anthropic from "@anthropic-ai/sdk";

try {
  const playlists = await getPlaylistRecommendations(memo);
} catch (error) {
  if (error instanceof Anthropic.RateLimitError) {
    // "요청이 너무 많아요. 잠시 후 다시 시도해주세요."
  } else if (error instanceof Anthropic.AuthenticationError) {
    // "API 키를 확인해주세요."
  } else if (error instanceof Anthropic.APIError) {
    // "추천을 불러오지 못했어요. 다시 시도해주세요."
  } else if (error instanceof SyntaxError) {
    // JSON 파싱 실패 → "추천 데이터 형식이 올바르지 않아요."
  }
}
```

---

### 5-2. localStorage API (내부)

| 함수 | 설명 | 인자 | 반환 |
|------|------|------|------|
| `saveEntry(entry)` | 하루 기록 저장 (같은 날이면 덮어씀) | `DayEntry` | `void` |
| `getEntries()` | 전체 기록 조회 (날짜 역순) | — | `DayEntry[]` |
| `getEntry(date)` | 특정 날짜 기록 조회 | `string` (YYYY-MM-DD) | `DayEntry \| null` |
| `deleteEntry(date)` | 특정 날짜 기록 삭제 | `string` | `void` |

```typescript
const STORAGE_KEY = "vibe_entries";

export function saveEntry(entry: DayEntry): void {
  const entries = getEntries();
  const idx = entries.findIndex((e) => e.date === entry.date);
  if (idx !== -1) {
    entries[idx] = entry;
  } else {
    entries.unshift(entry);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getEntries(): DayEntry[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function getEntry(date: string): DayEntry | null {
  return getEntries().find((e) => e.date === date) ?? null;
}
```

---

## 6. 환경 변수

```
# .env.local
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

> ⚠️ MVP에서는 클라이언트에서 직접 API를 호출합니다.
> 실제 서비스 배포 시에는 백엔드 프록시를 통해 API 키를 숨겨야 합니다.

---

## 7. 화면별 상태 정리

### 홈 화면

| 상태 | 표시 요소 |
|------|-----------|
| 초기 (메모 없음) | DateBadge + MemoInput(빈 값, 안내 placeholder) |
| 타이핑 중 | MemoInput(내용 입력 중) |
| 자동 추천 대기 (debounce) | MemoInput + RecommendingIndicator(점멸 표시) |
| 로딩 중 | MemoInput + RecommendingIndicator(로딩) |
| 추천 완료 | MemoInput + PlaylistGrid |
| 카드 클릭 후 자동 저장 | Toast ("기록됐어요!") + 외부 링크 열림 |
| 에러 | ErrorBanner + 재시도 버튼 |
| 당일 기록 있음 (재진입) | 기존 메모 + 기존 추천 목록 복원 |

### 아카이브 화면

| 상태 | 표시 요소 |
|------|-----------|
| 기록 있음 | ArchiveList (날짜 역순) |
| 기록 없음 | EmptyState ("아직 기록이 없어요. 오늘 바이브를 남겨보세요!") |

---

## 8. 내비게이션 구조

```
/ (홈)          → HomeScreen
/archive        → ArchiveScreen
/archive/:date  → DetailScreen
```
