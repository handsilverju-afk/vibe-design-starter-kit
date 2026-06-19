# Vibe Playlist — Design System

## 디자인 원칙

1. **White Dream** — 흰 배경에 아주 옅은 라벤더 그라디언트. 빛이 스며드는 느낌.
2. **AI Native** — 그라디언트 구체(orb)가 AI의 존재를 상징. 살아있고 반응한다.
3. **Conversational** — 대화처럼 자연스럽게 흐르는 레이아웃. 채팅 UI의 리듬.
4. **Extreme Minimal** — 필요한 것만. 여백이 디자인.

---

## 레퍼런스 분석 요약

| 레퍼런스 | 핵심 요소 |
|----------|-----------|
| 이미지 1 | 흰 배경 + 상단 서브틀 라벤더 그라디언트 + 극한 여백 |
| 이미지 2 | 멀티컬러 그라디언트 오브 (AI 심볼) + 다크 원형 전송 버튼 + 라이트 그레이 배경 |
| 이미지 3 | 패스텔 그라디언트 blob + "Activate Agent" 오브 + 에이전트 활성화 UX |

---

## 컬러 시스템 — Soft White Dream

### CSS 변수

```css
:root {
  /* 배경 */
  --bg-base: #FFFFFF;
  --bg-elevated: #F8F7FF;
  --bg-gradient:
    radial-gradient(ellipse at 50% -10%,
      rgba(195,180,255,0.18) 0%, transparent 60%),
    radial-gradient(ellipse at 100% 100%,
      rgba(147,197,253,0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 0% 100%,
      rgba(167,243,208,0.07) 0%, transparent 50%);

  /* 서피스 */
  --surface: #FFFFFF;
  --surface-hover: rgba(0,0,0,0.025);
  --border: rgba(0,0,0,0.07);
  --card-shadow: 0 2px 16px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);

  /* 텍스트 (대비 강화) */
  --text-primary:   #18172B;                   /* 딥 네이비 블랙 */
  --text-secondary: rgba(24,23,43,0.62);       /* 기존 0.45 → 0.62 */
  --text-muted:     rgba(24,23,43,0.42);       /* 기존 0.25 → 0.42 */

  /* 액센트 */
  --accent:      #8B7AEE;                      /* 소프트 라벤더-바이올렛 */
  --accent-glow: rgba(139,122,238,0.15);

  /* 버튼 */
  --btn-bg:       #18172B;                     /* 다크 원형 전송 버튼 */
  --btn-bg-hover: #2D2B4E;

  /* 재생 상태 */
  --playing-glow: 0 0 0 1.5px #8B7AEE, 0 4px 20px rgba(139,122,238,0.2);

  /* AI 오브 */
  --orb-gradient: linear-gradient(
    -45deg,
    #FFB3D9,   /* 소프트 핑크 */
    #C4B5FD,   /* 라벤더 */
    #93C5FD,   /* 스카이 블루 */
    #6EE7B7,   /* 민트 */
    #C4B5FD    /* 라벤더 (순환) */
  );
}
```

### 색상 용도 가이드

| 요소 | 값 |
|------|-----|
| 전체 배경 | `--bg-base` + `--bg-gradient` (fixed, 3겹 레이어) |
| 카드 | `--surface` + `box-shadow: var(--card-shadow)` |
| 카드 테두리 | `1px solid var(--border)` |
| 본문 텍스트 | `--text-primary` |
| 보조 텍스트 | `--text-secondary` (rgba(24,23,43,0.62)) |
| 날짜·레이블 | `--text-muted` (rgba(24,23,43,0.42)) |
| 태그 배경 | `rgba(139,122,238,0.1)` |
| 태그 텍스트 | `--accent` |
| 전송 버튼 | `--btn-bg` (다크 원형) |
| 유저 버블 | `linear-gradient(135deg, #EDE9FE, #DDD6FE)` |
| 유저 버블 텍스트 | `#3730A3` |
| 재생 중 항목 | `box-shadow: var(--playing-glow)`, `border-color: var(--accent)` |

---

## AI 오브 (AiOrb)

레퍼런스: ai1.png, ai2.png, ai3.png. CSS만으로 구현하는 글래스/홀로그래픽 구체.

```css
/* 기본 상태: 유리 표면 + 내부 핑크/블루 스월 + 상단좌측 흰 반사광 */
/* .orb::before: mix-blend-mode: screen으로 스월링 컬러 레이어 */
/* animation: glassSwirl(11s) — 내부 스월 360도 회전 */
/* animation: glassFloat(6s) — 상하 부유 */

/* 로딩 상태: float 2s + pulse 1.4s (빠름), 내부 스월 3.5s */

/* compact 모드: 외부 헤일로 숨김, 작은 glow만 유지 */
```

### 배치

| 화면 상태 | 오브 |
|-----------|------|
| idle (리스트 없음) | 대화 영역 상단 중앙, 60px, gradientFlow + float 애니메이션 |
| loading | gradientFlow + pulse 동시 실행 (빠르게), 현재 위치 유지 |
| ready (리스트 있음) | 좌상단 컴팩트 모드, 28px, 보라 글로우 |

---

## 타이포그래피

```
폰트: Pretendard Variable (CDN), fallback: -apple-system, BlinkMacSystemFont

제목: 없음 (화면 타이틀을 최소화)

날짜: 11px / weight 500 / letter-spacing 0.06em / uppercase / --text-muted
AI 레이블: 12px / --text-secondary
유저 버블: 14px / line-height 1.65
앨범 제목: 14px / weight 500 / --text-primary
아티스트: 12px / --text-secondary
태그: 11px / weight 500 / --accent
Empty State 메인 문구: 18px / weight 300 / --text-primary
Empty State 부제: 14px / --text-secondary
```

---

## 컴포넌트 스펙

### AppShell
```
좌측 SideNav:
  배경: #F4F3F8 (옅은 lavender-grey)
  box-shadow: 6px 0 32px rgba(0,0,0,0.07), 1px 0 0 rgba(0,0,0,0.04)
  border-right: 없음 (shadow가 구분선 역할)
  position: relative; z-index: 1 (shadow 노출용)

우측 메인 패널:
  배경: #FFFFFF (solid white)
  background-image: 없음 (gradient 제거)
```

### AiOrb — 가스 성운 빛 덩어리
```
경계가 불분명한 빛 덩어리. 원형에서 찌그러지고 변화하며 움직임.
뚜렷한 원이 아닌 가스 구름처럼 퍼져있는 형태.

크기: 140px (Welcome 모드 기준, 수직 균형 최적화)
  → CSS 140px + filter:blur(8px) + inset:-55% 헤일로 → 시각적 지름 약 294px

컬러: 핑크 + 하늘색 우세, 라벤더-퍼플 대폭 감소
  pink:     rgba(255,150,205,0.70)  — 따뜻한 핑크
  sky:      rgba(100,195,255,0.75)  — 진한 하늘색 (주색)
  sky-lite: rgba(175,232,255,0.58)  — 밝은 하늘색 (보조)
  lavender: rgba(200,172,255,0.36)  — 라벤더 (억제)
  base:     rgba(140,185,245,0.22)  — 블루계열 기반 (퍼플 제거)

구조: .orbWrap (float+rotate 애니메이션) + .orb (가스 구체) + ::before (핵 glow)

.orbWrap::before — 대형 외부 헤일로
  inset: -55% (구 바깥으로 크게 번지는 빛 구름)
  4개 radial-gradient (pink / sky / sky-lite / lavender 미세)
  filter: blur(22px)
  animation: outerHaloDrift 12s ease-in-out infinite (scale + rotate)

.orb — 메인 가스 구체
  background: 5겹 radial-gradient (pink / sky / sky-lite / lavender / blue-base)
  filter: blur(8px)  ← 핵심: heavy blur로 경계 완전 제거
  animation:
    nebulaMorph 10s — border-radius 극적 변형 (62% 38% 46% 54% / ... 등)
    nebulaColorDrift 18s — 360도 회전 + scale 변화

.orb::before — 내부 밝은 핵
  inset: 12%, 50% 중앙
  radial-gradient 흰색 → 스카이블루 tint → transparent
  filter: blur(4px)
  animation: coreGlow 4.5s (scale 0.85↔1.15, opacity 0.65↔1)

compact 모드: 외부 헤일로 숨김, filter: blur(5px)
loading 상태: float 2.5s + pulse 1.4s 동시, morph 2.8s (빠름), core 1.2s
```

### MemoInput (채팅 입력창) — 기본 스타일 업데이트
```
Welcome 모드 (기본):
  border: 1px solid rgba(0,0,0,0.13) (강화)
  box-shadow: 0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)
  border-radius: 16px

Chat 모드 (.chatTextarea className):
  border: 1px solid rgba(0,0,0,0.15) + 더 강한 shadow
```

### MemoInput (채팅 입력창)
```
Welcome 모드 (기본):
  배경: #FFFFFF
  테두리: 1px solid var(--border) (옅음)
  border-radius: 16px
  max-width: 560px, 중앙 배치

Chat 모드 (.chatTextarea className):
  패널 전체 폭 (max-width 없음), 좌우=하단=20px 여백
  테두리: 1px solid rgba(0,0,0,0.15) (더 진함)
  box-shadow: 0 2px 16px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)
  배경 white, border-top 구분선

공통:
  포커스: border-color var(--accent), box-shadow 0 0 0 3px var(--accent-glow)
  Enter: 전송 → 입력창 자동 초기화
  Shift+Enter: 줄바꿈
  props: value, onChange, loading, onKeyDown, className
```

### 전송 버튼 (채팅창 내장)
```
위치: .inputWrap 기준 position: absolute, right: 10px, bottom: 10px
배경: var(--btn-bg) = #18172B (다크)
color: #FFFFFF
크기: 34px 원형
hover: scale(1.08)
MemoInput 우측 패딩: 52px (버튼 영역 확보)
```

### PlaylistCard (리스트 항목)
```
플랫 라인 스타일 (카드 아님):
  배경: transparent
  테두리: 없음 (border-radius: 0)
  그림자: 없음
  구분선: border-bottom 1px solid var(--border)
  패딩: 12px 16px
  썸네일: 46px × 46px, border-radius 8px

hover: background rgba(0,0,0,0.025)

재생 중:
  border-left: 없음 (삭제 — hover 시 보라색 bar 제거)
  background: rgba(139,122,238,0.05) (옅은 라벤더 tint)

플레이/스탑 버튼 (오른쪽):
  라인 타입 원형 버튼: width/height 28px, border-radius 50%
  border: 1.5px solid rgba(0,0,0,0.18) (기본)
  font-size: 10px, color: var(--text-secondary)
  재생 중: border-color var(--accent), color var(--accent)

PlaylistGrid:
  gap: 0
  border-top: 1px solid var(--border) (리스트 시작 상단선)
```

### SideNav
```
width: 240px
background: #F4F3F8 (옅은 grey — AppShell에서 지정)
shadow로 우측 패널과 시각적 구분 (border-right 없음)

로고: "Vibe" 18px weight 600 — <button> 요소, 클릭 시 newPlaylist() 호출 (첫화면 복귀)
  hover: opacity 0.65 트랜지션

"새 뮤직리스트" 버튼:
  border: 1px solid rgba(0,0,0,0.18) (진한 border)
  border-radius: 10px
  font-size: 13px, weight 500
  hover: surface-hover + card-shadow

히스토리 섹션 레이블: 10px, uppercase, text-muted
히스토리 항목:
  날짜: 10px, text-muted
  제목: 12px, var(--text-primary) (진한 색), truncate
  hover: surface-hover
  active: accent-glow background
```

### NowPlayingBanner — 공연장 미디어아트
```
height: 280px
구현: Canvas API (requestAnimationFrame) 기반 제너레이티브 아트
비전: 공연장 미디어 설치 아트. 검정 배경 지양, 컬러·그라데이션 중심.
     음악 태그에 따라 씬이 자동 전환되고 빠른/느린 음악 분위기가 시각적으로 반영됨.

── 씬 감지 로직 ──────────────────────────────────────
  playlist.tags 배열 기반:
  에너지|드라이브|파워|업템포|신나|강렬  → electric
  집중|로파이|작업|차분|미니멀           → lofi
  새벽|몽환|우주|신비|꿈|심연            → cosmic
  팝|댄스|축제|경쾌|비트                 → pulse
  힐링|잔잔|평화|자연|감성|포근|따뜻     → aurora
  fallback: trackIndex % 5 순환

── 씬 목록 ────────────────────────────────────────────

aurora (힐링/잔잔):
  배경: 딥 틸-인디고 다크 (#04101e → #100820)
  요소: 흐르는 오로라 밴드 4개 (sin-wave path, filled gradient),
        부유하는 소프트 orb 7개, 중앙 인간 형상 빛 실루엣 (희미한 타원 3개)
  컬러: 틸(#00DCB4), 로즈(#FF64A0), 민트(#6EE7B7), 라벤더(#C8AAFF)
  속도: 매우 느림 (play 0.70, pause 0.08)

electric (에너지/드라이브):
  배경: 어두운 인디고-퍼플, 모션블러 페이드 (rgba(5,0,18,0.22))
  요소: 220 파티클 (중앙→방사, 12프레임 트레일),
        확장 ring (emit 간격 12-34f), 번개 streaks (random 2.5%)
  컬러: 시안·마젠타·핫핑크·네온옐로우 전 스펙트럼 (hue 160-400)
  속도: 빠름 (play 1.00, pause 0.10)

cosmic (몽환/새벽):
  배경: 딥 스페이스 (#160a30 → #030110), 라디얼 그라디언트
  요소: 별 220개 (twinkle sin), 성운 2개 (slow drift rotate),
        슈팅스타 (70-120f 간격 랜덤), 중앙 은하 코어 glow
  컬러: 미드나잇 블루, 딥 바이올렛(hsl 255), 골드-화이트 별빛
  속도: 느림 (play 0.65, pause 0.08)

lofi (집중/로파이):
  배경: 웜 앰버 그라디언트 (#280e04 → #180d1c)
  요소: 중앙 방사 동심 vinyl ring (0.5-0.95spd),
        회전하는 턴테이블 레이블 (32px 원형), 정적 필름 그레인 오버레이
  컬러: 웜 앰버(rgba 215,125,45), 더스티 로즈(175,95,155)
  속도: 느림 (play 0.55, pause 0.08)

pulse (팝/댄스):
  배경: hue 연속 시프트 다크 그라디언트 (0.28°/frame)
  요소: 8방향 칼레이도스코프 다이아몬드 (6ring/arm, 38f 주기),
        중앙 확장 링 3개 (hue-shifted)
  컬러: 전 스펙트럼 순환 (hue shift)
  속도: 빠름 (play 1.00, pause 0.10)

── 공통 규칙 ──────────────────────────────────────────
  isPaused: 속도 파라미터 대폭 감소 (약 0.1-0.15)
  트랙 변경: sceneId 변경 시 Canvas state 완전 초기화, 새 씬 즉시 시작
  Canvas 레이어:
    1: canvas (position: absolute; inset: 0) — 제너레이티브 아트 전체
    2: .sceneBadge — 현재 씬 이름 (좌상단 디버그 라벨)
    3: .content — 트랙 정보 + 컨트롤 (position: relative)

컨트롤:
  일반 버튼: border 1px solid rgba(255,255,255,0.15), bg rgba(255,255,255,0.08), 36px
  재생 버튼: 48px, border rgba(255,255,255,0.20), bg rgba(255,255,255,0.12)
  볼륨 아이콘: rgba(255,255,255,0.70)
  슬라이더: bg rgba(255,255,255,0.20)
```

### AiOrb — 가스 성운 빛 덩어리
```
크기: 140px (Welcome 모드), 시각적 지름 약 260px (blur 5px + 헤일로)
blur: filter: blur(5px) — 이전 8px보다 선명, 경계감 유지하면서 가스 느낌

컬러 (opacity 강화):
  pink:     rgba(255,150,205,0.85)
  sky:      rgba(100,195,255,0.88)  ← 하늘색 주색
  sky-lite: rgba(175,232,255,0.72)
  lavender: rgba(200,172,255,0.50)
  base:     rgba(140,185,245,0.35)
  핵 glow:  rgba(255,255,255,0.88) center → rgba(210,242,255,0.55) → transparent
  핵 blur:  3px (이전 4px보다 선명)
```

### 유저 버블
```
background: linear-gradient(135deg, #F2F0F9, #ECEAF5)  — 깔끔한 회색 + 살짝 퍼플 느낌
color: #3A3552  — 다크 퍼플-그레이
border-radius: 18px 18px 4px 18px
탁한 느낌 없이 밝고 클린한 그레이-라벤더
```

### AI 응답 영역
```
배경: 없음 (투명)
label: 12px / --text-muted
```

### DetailScreen — 에디토리얼 스타일
```
레이아웃: 스크롤 가능, 이전 버튼/제목 없음

날짜 헤더:
  padding: 52px 36px 20px
  border-bottom: 1px solid rgba(0,0,0,0.06)
  dateLine: "2026. 06. 19" — 14px, font-weight 700, letter-spacing 0.1em
  dayBadge: "목요일" — 12px, text-muted, 옆에 나란히

인용 블록 (quoteBlock):
  padding: 36px 36px 32px
  openQuote: " — Georgia/serif, 78px, rgba(139,122,238,0.2), 장식용
             line-height: 0.65, margin-bottom: 2px (간격 최소화)
  quoteText: 17px, font-weight 400, line-height 1.9, letter-spacing -0.02em
             white-space pre-wrap (개행 유지)

날짜 헤더:
  dateLine: letter-spacing: 0.02em (이전 0.1em → 축소, 과도한 자간 제거)

플레이리스트:
  padding: 0 36px 48px
  PlaylistGrid (기존 컴포넌트 그대로 사용)

네비게이션 키:
  entry.sessionId ?? entry.date 를 키로 사용
  getEntryByKey(key) — sessionId 또는 date로 fallback 조회
```

### BottomNav
```
배경: rgba(255,255,255,0.92) + backdrop-blur(20px)
border-top: 1px solid var(--border)
active: var(--accent)
inactive: var(--text-muted)
```

### 홈 화면 Empty State
```
첫 접속 / 리로드 시 표시

메인 문구: "오늘 하루는 어떤가요?"
  font-size: 18px
  font-weight: 300
  color: --text-primary

부제: "기분이나 일정을 입력하면 바이브에 맞는 음악을 추천해드려요."
  font-size: 14px
  color: --text-secondary
```

---

## 애니메이션

```css
/* AI 오브 기본 float */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}

/* AI 오브 그라디언트 흐름 */
@keyframes gradientFlow {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* AI 오브 로딩 */
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.85; }
  50% { transform: scale(1.1); opacity: 1; }
}

/* 앨범 리스트 진입 */
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* 버블 진입 */
@keyframes bubbleIn {
  from { opacity: 0; transform: scale(0.95) translateY(4px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
```

---

## 레이아웃 구조 (데스크탑)

```
┌──────────────────────────────────────────────────────┐
│ SideNav (240px)  │  Main Content (flex: 1)           │
│                  │                                    │
│ [Vibe]           │  ┌──────────────────────────────┐│
│                  │  │  NowPlayingBanner (고정)     ││  ← 재생 중에만 표시
│ [+ 새 뮤직리스트]│  │  트랙별 배경 애니메이션       ││  ← 트랙 변경 시 효과 전환
│                  │  └──────────────────────────────┘│
│ 히스토리         │  ┌──────────────────────────────┐│
│  오늘 · Album1   │  │  콘텐츠 영역                 ││  ← max-width: 760px, 중앙
│  어제 · Album2   │  │  (Welcome or Chat 모드)       ││
│                  │  └──────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

### Welcome 모드 레이아웃

```
[콘텐츠 영역, 전체 높이, 수직·수평 중앙]
  ◉  (AiOrb, 140px, nebulaMorph + nebulaColorDrift + nebulaFloat)
  
  "오늘 하루는 어떤가요?"  (24px, weight 300)
  "기분이나 일정을 입력하면 바이브에 맞는 음악을 추천해드려요."  (15px)
  
  ┌─────────────────────────────────┐  ●
  │  오늘 기분을 적어보세요...      │ ↑  ← max-width: 560px
  └─────────────────────────────────┘
```

### Chat 모드 레이아웃

```
[스크롤 영역]
  2026.06.19  (날짜 배지)

  [유저 버블 — 라벤더, 우측 정렬]
  
  [AI 로딩 버블 또는 응답]
  "오늘 바이브에 맞는 앨범이에요"
  [PlaylistCard × N ... 스크롤]

[하단 고정 입력창]
  ┌──────────────────────────────┐  ●
  │  새 기분이나 일정을 추가...  │ ↑
  └──────────────────────────────┘
```

---

## 구현 파일 목록

### 신규
- `src/components/ui/AiOrb.jsx`
- `src/components/ui/AiOrb.module.css`
- `src/components/ui/PlaylistSheet.jsx`
- `src/components/ui/PlaylistSheet.module.css`

### 수정
- `src/index.css` — CSS 변수 전면 교체 (화이트 테마, 대비 강화, 3겹 그라디언트)
- `src/components/layout/AppShell.module.css` — 그라디언트 배경
- `src/components/layout/BottomNav.module.css` — 화이트 블러
- `src/pages/HomeScreen.jsx` — AiOrb + PlaylistSheet + Empty State 추가
- `src/pages/HomeScreen.module.css` — 유저 버블, 입력창, Empty State 스타일
- `src/components/ui/NowPlayingBanner.jsx` — 높이 확대 + 플레이 컨트롤 추가
- `src/components/ui/NowPlayingBanner.module.css` — 컨트롤 버튼 스타일
- `src/context/AppContext.jsx` — audio 전역 상태 관리 추가
- 모든 `.module.css` — 다크 변수 → 라이트 변수 교체
