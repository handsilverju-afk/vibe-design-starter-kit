# Vibe Playlist — UX 설계 문서

## 1. 유저 시나리오 리스트

| # | 시나리오 | 트리거 | 기대 결과 |
|---|----------|--------|-----------|
| S1 | **첫 방문 / 리로딩 / "새 뮤직리스트" 클릭 / "Vibe" 로고 클릭 / 날짜 변경** | 앱 최초 실행, 새로고침, 사이드바 "새 뮤직리스트" 버튼 또는 "Vibe" 텍스트 클릭, 날짜 바뀐 뒤 첫 방문 | Welcome 모드: 중앙에 AiOrb(140px) + 인사말 + 입력창 표시 |
| S2 | **아침 메모 작성** | Welcome 모드 중앙 입력창에 텍스트 입력 | 중앙 입력창에서 타이핑. Enter 전송 / Shift+Enter 줄바꿈. 전송 후 입력창 자동 초기화. |
| S3 | **추천 요청** | Enter 또는 버튼 클릭 (최소 10자) | Chat 모드로 전환: 유저 버블 + AI 로딩 → **previewUrl 있는 앨범만** 리스트 표시 (15-20개) + **자동재생 시작** + 기록 저장 |
| S3-1 | **자동재생** | 추천 목록 수신 완료 시 | previewUrl이 있는 트랙만 필터링 후 첫 번째 트랙 자동 재생. NowPlayingBanner 즉시 표시. 토스트 "기록됐어요!" |
| S4 | **추천 중 로딩** | 전송 후 | Chat 모드로 전환, 유저 버블 + AI 타이핑 버블. 입력창 버튼이 **다크(#18172B) ■ stop 버튼**으로 변경. 이전 목록이 있으면 함께 표시. |
| S4-1 | **추천 중단** | stop 버튼 클릭 | 작업 즉시 중단. AI 질문 버블 노출: "오늘 기분이 어떤지, 어떤 일정이 있으신지 조금 더 알려주시면…" 입력창 계속 활성 상태. |
| S5 | **앨범 수동 재생** | 앨범 항목 클릭 | 해당 트랙으로 전환 재생 (toggle). 목록 내 모든 트랙은 previewUrl 보장. |
| S5-1 | **루프 재생** | 기본 ON / NowPlayingBanner 반복 버튼으로 토글 | 마지막 트랙 종료 시 첫 트랙부터 자동 재시작. **기본값: 루프 ON**. 버튼 퍼플 하이라이트로 활성 표시. 루프 OFF 시 마지막 트랙에서 일시정지 — NowPlayingBanner는 계속 표시. |
| S5-2 | **NowPlayingBanner 유지 조건** | stop·pause·루프 OFF 마지막 곡 종료 (홈/Chat 화면 내) | 배너 유지. 마지막 트랙 정보 표시. "새 뮤직 리스트" 클릭 또는 히스토리 클릭 시에만 배너 제거. |
| S6 | **재추천** | Chat 모드에서 하단 입력창으로 새 메모 입력 후 전송 | 동일 화면에서 새 추천 목록으로 갱신 + 새 목록 자동재생 |
| S7 | **히스토리 조회** | 사이드바 히스토리 항목 클릭 | **현재 재생 중인 음악 즉시 중지 + 배너 제거** → 해당 세션의 기록 상세 화면 이동. key = sessionId ?? date. |
| S8 | **기록 상세 보기** | 사이드바 히스토리 항목 클릭 | 에디토리얼 스타일 상세 화면: 년월일+요일 → 사용자 입력 (인용 스타일) → 플레이리스트. NowPlayingBanner 없음. |
| S9 | **히스토리 없음** | 첫 방문 사이드바 | 히스토리 섹션 없음 (빈 상태 표시 없음, 섹션 자체 미노출) |

---

## 2. UX Flow

### 메인 플로우

```
[앱 실행]
    │
    ▼
[Welcome 모드] — 항상 빈 상태
 AiOrb 140px 중앙 표시
 인사말: "오늘 하루는 어떤가요?"
 중앙 입력창
    │
    ├─ 입력 (Enter = 전송, Shift+Enter = 줄바꿈)
    │       │
    │       ▼
    │  [Chat 모드로 전환]
    │   - 상단: NowPlaying 고정 (재생 시)
    │   - 스크롤 영역: 유저버블 + AI로딩 + 추천목록 인라인
    │   - 하단 고정: 채팅 입력창
    │       │
    │       │  앨범 클릭
    │       ▼
    │  [재생] NowPlayingBanner 활성화 (트랙별 배경 애니메이션)
    │
    └─ [사이드바: 히스토리 항목 클릭]
            │  audio.stop() → 배너 제거
            ▼
       [기록 상세 화면]
        메모 전문 + 추천 앨범 + 미리듣기 (배너 없음)
```

### 상태 전이 (홈 화면)

```
Welcome 모드 (idle)
  │  Enter / 버튼 클릭 (10자 이상)
  ▼
Chat 모드 - loading
  │  성공
  ▼
Chat 모드 - ready (인라인 목록 표시)
  │  앨범 클릭
  ▼
Chat 모드 - playing (NowPlayingBanner 활성)
  │  트랙 종료
  ▼
다음 트랙 자동 재생
  │  "새 뮤직리스트" 클릭
  ▼
Welcome 모드 (reset)
```

---

## 3. Component List

### 공통 (Shared)

| 컴포넌트 | 설명 | Props |
|----------|------|-------|
| `AppShell` | 좌측 사이드바(SideNav) + 우측 콘텐츠(NowPlayingBanner + 화면) 레이아웃 | `children` |
| `SideNav` | 좌측 사이드바. "Vibe" 로고(클릭 시 첫화면, newPlaylist 동일) + "새 뮤직리스트" 버튼 + 히스토리 목록 | — (useApp 내부 사용) |
| `Toast` | 저장 완료 / 에러 알림 | `message` |

---

### 홈 화면 (Home)

| 컴포넌트 | 설명 | Props |
|----------|------|-------|
| `HomeScreen` | Welcome 모드 / Chat 모드 두 가지 상태 | — |
| `AiOrb` | Welcome 모드에서만 80px 중앙 표시. Chat 모드에서 숨김. 글래스/홀로그래픽 구체 스타일 (ai1, ai2, ai3 레퍼런스 기반). 계속 애니메이션. | `size`, `mode`, `loading` |
| `MemoInput` | Welcome 모드: 중앙 배치, max-width 560px, 기본 스타일. Chat 모드: 패널 100% 전체 폭, 좌우=하단=20px 여백, 진한 border + shadow. Enter 전송(입력창 초기화), Shift+Enter 줄바꿈. 전송 버튼 우측 하단 내장. | `value`, `onChange`, `loading`, `className` |
| `PlaylistGrid` | Chat 모드에서 인라인 스크롤. 상단 border로 리스트 시작, 각 항목 사이 하단 border 구분선. | `playlists`, `onPlay`, `currentId` |
| `PlaylistCard` | 플랫 라인 리스트 스타일. 썸네일(46px) + 제목/아티스트 + 재생 아이콘. 선택 시 좌측 2px 보라색 bar + 옅은 배경. 카드 테두리/그림자 없음. | `title`, `artist`, `tags[]`, `artworkUrl?`, `previewUrl?`, `platform`, `reason`, `isPlaying`, `onPlay` |
| `NowPlayingBanner` | AppShell에서 렌더링. 콘텐츠 상단 고정. 디지털 다크 배경(#07050E) + Hot-temperature glow 파동(yellow→orange→crimson). overlay/gradient shadow 없음. 파동은 박스 정중앙에 배치. 재생 중 파동 좌→우 이동, 일시정지 시 멈춤. | `playlist`, `trackIndex`, `isPaused`, `onStop`, `onPrev`, `onNext`, `onVolumeChange` |
| `VibeTagList` | 분위기 태그 뱃지 목록 | `tags[]` |
| `ErrorBanner` | API 오류 메시지 + 재시도 | `message`, `onRetry` |

---

### 기록 상세 화면 (Detail)

| 컴포넌트 | 설명 | Props |
|----------|------|-------|
| `DetailScreen` | 에디토리얼 스타일 상세 화면. 이전 버튼 없음. 날짜(YYYY.MM.DD)+요일 헤더 → 인용 스타일 메모 → PlaylistGrid. key = sessionId ?? date. | `date` (실제로는 sessionId ?? date 키값) |
| `PlaylistGrid` | 저장된 추천 목록 (미리듣기 포함) | `playlists`, `onPlay`, `currentId` |

---

## 4. Data Model

```typescript
// 플레이리스트 단일 항목
interface Playlist {
  id: string;
  title: string;            // 앨범 이름
  artist: string;           // 아티스트 이름
  tags: string[];           // 분위기 태그 (예: ["집중", "로파이", "잔잔함"])
  platform: "itunes";
  reason: string;           // AI가 이 앨범을 추천한 이유 (1줄)
  // iTunes Search API로 보강되는 필드
  artworkUrl?: string;      // 앨범 커버 이미지 URL (500x500)
  previewUrl?: string;      // 30초 미리듣기 MP3 URL
  itunesUrl?: string;       // Apple Music 앨범 링크
}

// 하루 기록 단위
interface DayEntry {
  date: string;             // "2026-06-19" (YYYY-MM-DD)
  memo: string;             // 사용자 입력 메모
  playlists: Playlist[];    // 추천 앨범 목록
  savedAt: string;          // ISO timestamp
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
| **SDK** | `@anthropic-ai/sdk` |
| **모델** | `claude-haiku-4-5` |
| **호출 시점** | Enter 키 또는 "추천 받기" 버튼 클릭 (최소 10자) |
| **입력** | 사용자 메모 텍스트 |
| **출력** | 15-20개의 앨범 JSON 배열 (title, artist, tags, platform, reason) |

#### 요청 구조

```js
const SYSTEM_PROMPT = `당신은 음악 큐레이터입니다.
사용자의 오늘 아침 기분과 일정을 읽고, 그 바이브에 맞는 앨범을 15-20개 추천하세요.

반드시 아래 JSON 배열 형식으로만 응답하세요. 마크다운 코드블록 없이, 순수 JSON 배열만.
[
  {
    "title": "앨범 이름",
    "artist": "아티스트 이름",
    "tags": ["태그1", "태그2"],
    "platform": "itunes",
    "reason": "오늘 메모와 연결된 추천 이유 한 문장"
  }
]`
```

---

### 5-2. iTunes Search API (앨범 보강)

| 항목 | 내용 |
|------|------|
| **엔드포인트** | `GET https://itunes.apple.com/search` |
| **인증** | 불필요 (무료 공개 API) |
| **호출 시점** | Claude 추천 완료 직후, 각 앨범별 1회 |
| **입력** | `term={title}+{artist}&entity=musicTrack&country=kr&limit=1` |
| **출력** | `artworkUrl100` (커버), `previewUrl` (30초 MP3), `collectionViewUrl` |

#### 처리 흐름

```
Claude 추천 결과 (title + artist) 배열
    │
    ▼ Promise.all — 병렬 요청
iTunes Search API × N개
    │
    ▼
각 앨범에 artworkUrl + previewUrl + itunesUrl merge
    │
    ▼ filter(p => p.previewUrl) — previewUrl 없는 항목 제거
재생 불가 트랙 제외
    │
    ▼
PlaylistGrid 인라인 렌더링 (모든 항목 재생 가능 보장)
```

#### artworkUrl 해상도 변환

```js
// artworkUrl100 → 500x500으로 교체
artwork.replace('100x100bb', '500x500bb')
```

---

### 5-3. localStorage API (내부)

| 함수 | 설명 | 인자 | 반환 |
|------|------|------|------|
| `saveEntry(entry)` | 하루 기록 저장 (같은 날이면 덮어씀) | `DayEntry` | `void` |
| `getEntries()` | 전체 기록 조회 (날짜 역순) | — | `DayEntry[]` |
| `getEntry(date)` | 특정 날짜 기록 조회 | `string` | `DayEntry \| null` |

> **히스토리 반응성**: `entries` 상태는 `AppContext`에서 관리. `addEntry(entry)` 호출 시 localStorage 쓰기 + React 상태 동기화가 동시에 발생. SideNav는 context의 `entries`를 직접 구독하여 즉시 반응함.

> **히스토리 제목**: Claude가 `summary` 필드로 사용자의 기분/일정 메모를 10글자 이내로 요약하여 반환. `entry.title`에 저장되고 SideNav에 표시됨. (예: "집중이 필요한 오전")

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

### 홈 화면 (Welcome 모드)

| 상태 | 표시 요소 |
|------|-----------|
| 초기 | AiOrb(80px, 중앙) + "오늘 하루는 어떤가요?" + 부제 + 중앙 입력창 |
| 로딩 중 | AiOrb(80px, loading 상태 pulse) + "…" 버튼 비활성 |
| 에러 | ErrorBanner + 재시도 버튼 |

### 홈 화면 (Chat 모드)

| 상태 | 표시 요소 |
|------|-----------|
| 로딩 중 | 유저 버블 + AI 타이핑 버블(점3개) |
| 추천 완료 | 유저 버블 + "오늘 바이브에 맞는 앨범이에요" + 인라인 PlaylistGrid |
| 재생 중 | NowPlayingBanner(상단 고정, 트랙별 배경 애니메이션) + 목록 스크롤 |
| 하단 입력창 | 항상 고정. 새 메모 입력 → 재추천 가능 |

> **제거됨**: Chat 모드 상단 DateBadge(날짜/요일 표시) 제거.

---

## 8. 내비게이션 구조

```
좌측 SideNav:
  - "새 뮤직리스트" / "Vibe" 로고 → audio.stop() + HomeScreen 리셋 (homeKey 증가)
  - 히스토리 항목 클릭           → audio.stop() + DetailScreen(key) ← 배너 제거됨

우측 콘텐츠:
  AppShell: NowPlayingBanner (audio.currentTrack 존재 시 표시) + children

NowPlayingBanner 표시/제거 규칙:
  표시 유지: stop 버튼 클릭(홈), pause(홈), 루프 OFF 마지막 곡 종료(홈)
  제거:     "새 뮤직리스트" 클릭, 히스토리 항목 클릭 (→ audio.stop() 호출)

view.screen === 'home'    → HomeScreen
view.screen === 'detail'  → DetailScreen (key prop)
ArchiveScreen 제거 (히스토리는 SideNav에서 처리)
```

> 라우터 없음. AppContext의 view 상태 + homeKey로 화면 전환.
> audio 상태는 AppContext에서 전역 관리.

---

## 9. 레이아웃 패널 스펙

| 패널 | 배경 | 구분 |
|------|------|------|
| 좌측 SideNav (240px) | #F4F3F8 (옅은 grey) | 우측 box-shadow (wide, soft) |
| 우측 콘텐츠 패널 | #FFFFFF (white) | — |

### SideNav 세부
- 히스토리 표시 순서: **제목 (위) → 날짜/시간 (아래)**
- 히스토리 날짜 포맷 (`entry.date` + `entry.savedAt` 기준):
  - 오늘: `"오늘 HH:MM"` (저장 시각 표시, 예: "오늘 13:00")
  - 그 외(어제 포함): `"YYYY.MM.DD"` (예: "2026.06.19")
- 히스토리 제목: `var(--text-primary)` (진한 색)
- "새 뮤직 리스트" 버튼 border: `rgba(0,0,0,0.13)`

### Chat 모드 하단 입력창
- 입력창(inputWrap) max-width 760px, margin 0 auto로 chatContent 컬럼과 정렬
- 좌우=하단=20px 여백, 배경: #fff
- textarea: border `rgba(0,0,0,0.15)` + 부드러운 box-shadow

### 기록 상세 화면 (DetailScreen) 레이아웃
- 전체 scroll 영역 내부에 max-width 760px inner 컨테이너 (margin 0 auto)
- 날짜 헤더 / 인용 블록 / 음악 리스트 모두 inner 컨테이너 안에 배치
- 수평 패딩 32px (chatContent 동일), 뮤직 리스트 width = 채팅 리스트 동일 폭

### 스크롤바
- 전체 패널: webkit-scrollbar width 3px, track 투명
- thumb: 기본 투명 (숨김) → 컨테이너 hover 시 `rgba(0,0,0,0.13)` 표시, thumb hover 시 0.22

### 뮤직 리스트 (PlaylistGrid + PlaylistCard)
- 플랫 라인 스타일: 카드 없음, border-radius 없음, shadow 없음
- 구분선: 상단 border + 각 항목 하단 border (1px, rgba(0,0,0,0.1) — 약간 진하게)
- 재생 중 표시: 좌측 2px 보라색 bar + 옅은 라벤더 배경 tint

### 전송 / 중단 버튼
- 기본 상태: 다크 원형 버튼 ↑
- 로딩 중: 회색(#8A8A9E) 원형 ■ stop 버튼으로 전환. disabled 해제 (클릭 가능)
- 클릭: AbortController.abort() → 즉시 취소, AI 질문 버블 표시

### 채팅 버블 색상
- 유저 버블: linear-gradient(135deg, #EDEAF2, #E4E1EE) — 퍼플 섞인 그레이
- 텍스트: #3A3552 (다크 퍼플-그레이)
