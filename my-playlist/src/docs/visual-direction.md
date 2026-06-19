# Vibe Playlist — Visual Direction

## 디자인 원칙

1. **몽환적 (Dreamy)** — 색과 빛이 경계 없이 스며드는 느낌. 선명한 테두리보다 흐릿한 글로우.
2. **미니멀 (Minimal)** — 정보는 필요한 것만. 여백이 디자인의 일부.
3. **AI 네이티브** — 사용자가 "AI와 대화한다"는 느낌. 차갑지 않고, 따뜻하면서도 미래적.

---

## 컬러 시스템 — Dark Dream

### CSS 변수

```css
:root {
  /* 배경 */
  --bg-base:       #08080F;   /* 메인 배경 — 딥 블랙 퍼플 */
  --bg-elevated:   #0F0F1A;   /* 카드, 입력창 배경 */

  /* 서피스 (유리 질감) */
  --surface:       rgba(255, 255, 255, 0.05);
  --surface-hover: rgba(255, 255, 255, 0.08);
  --border:        rgba(255, 255, 255, 0.07);

  /* 텍스트 */
  --text-primary:   #F0EEFF;              /* 본문 — 웜 화이트 */
  --text-secondary: rgba(240, 238, 255, 0.45);  /* 부제목, 설명 */
  --text-muted:     rgba(240, 238, 255, 0.25);  /* 날짜, 보조 라벨 */

  /* 액센트 */
  --accent:        #A78BFA;   /* 뮤트 바이올렛 — 강조색 */
  --accent-glow:   rgba(167, 139, 250, 0.2);

  /* 버튼 */
  --btn-bg:        linear-gradient(135deg, #7C3AED, #4F46E5);
  --btn-bg-hover:  linear-gradient(135deg, #8B5CF6, #6366F1);

  /* 재생 상태 */
  --playing-glow:  0 0 0 1px #A78BFA, 0 8px 32px rgba(167, 139, 250, 0.25);
}
```

### 색상 용도 가이드

| 요소 | 색상 |
|------|------|
| 전체 배경 | `--bg-base` |
| 카드 배경 | `--surface` + `backdrop-filter: blur(20px)` |
| 카드 테두리 | `1px solid var(--border)` |
| 본문 텍스트 | `--text-primary` |
| 보조 텍스트 (reason, artist) | `--text-secondary` |
| 날짜, 태그 라벨 | `--text-muted` |
| 태그 배지 배경 | `rgba(167, 139, 250, 0.12)` |
| 태그 배지 텍스트 | `--accent` |
| 추천 버튼 | `--btn-bg` (그라디언트) |
| 재생 중인 카드 | `box-shadow: var(--playing-glow)` |
| 입력창 포커스 링 | `0 0 0 1px var(--accent)` |

---

## 타이포그래피

```css
/* 폰트: 시스템 폰트 스택 (별도 로딩 없음) */
font-family: -apple-system, 'Helvetica Neue', sans-serif;

/* 제목 (오늘의 바이브) */
font-size: 26px;
font-weight: 300;          /* 얇게 — 몽환적 무게감 */
letter-spacing: -0.04em;
color: var(--text-primary);

/* 앨범 타이틀 */
font-size: 14px;
font-weight: 500;
letter-spacing: -0.02em;

/* 아티스트명, reason */
font-size: 12px;
font-weight: 400;
color: var(--text-secondary);
letter-spacing: 0;

/* 날짜 */
font-size: 11px;
font-weight: 500;
letter-spacing: 0.06em;    /* 넓게 — 스탬프 느낌 */
text-transform: uppercase;
color: var(--text-muted);

/* 태그 배지 */
font-size: 11px;
font-weight: 500;
letter-spacing: -0.01em;
```

---

## 컴포넌트 스펙

### AppShell / 전체 레이아웃

```
배경: var(--bg-base)
최대 너비: 430px, 중앙 정렬
패딩 바텀: 80px (하단 네비 높이만큼)
```

### MemoInput (입력창)

```
배경: var(--surface)
테두리: 1px solid var(--border)
border-radius: 20px
패딩: 18px
폰트: 15px / 1.7 / var(--text-primary)
placeholder: var(--text-muted)
포커스: border-color → var(--accent), box-shadow → 0 0 0 3px var(--accent-glow)
transition: border-color 0.2s, box-shadow 0.2s
```

### 추천 버튼

```
배경: var(--btn-bg)
border-radius: 14px
패딩: 14px
폰트: 14px / 600 / #fff
letter-spacing: -0.01em
비활성: opacity 0.25, cursor: default
hover: var(--btn-bg-hover), transform: translateY(-1px)
active: transform: translateY(0)
transition: 0.15s
```

### PlaylistCard

```
배경: var(--surface)
border: 1px solid var(--border)
border-radius: 20px
backdrop-filter: blur(20px)
패딩: 0 (앨범 커버가 상단 전체 차지)
overflow: hidden

앨범 커버:
  - 비율: 1:1 (aspect-ratio: 1)
  - object-fit: cover
  - 없을 때: var(--bg-elevated) + 🎵 이모지 중앙
  - 오버레이: linear-gradient(to bottom, transparent 40%, rgba(8,8,15,0.9))

텍스트 영역 (커버 위 오버레이):
  패딩: 14px
  position: absolute, bottom: 0

재생 버튼:
  position: absolute, top: 12px, right: 12px
  배경: rgba(8,8,15,0.6) + backdrop-blur(8px)
  크기: 36px 원형
  아이콘: ▶ / ■

재생 중 상태:
  box-shadow: var(--playing-glow)
  border-color: var(--accent)
```

### VibeTagList (태그 배지)

```
배경: rgba(167, 139, 250, 0.12)
색상: var(--accent)
border-radius: 100px
패딩: 3px 9px
폰트: 11px / 500
```

### BottomNav

```
배경: rgba(8, 8, 15, 0.85) + backdrop-filter: blur(20px)
테두리 상단: 1px solid var(--border)
활성 탭: var(--accent)
비활성 탭: var(--text-muted)
```

### DateBadge

```
폰트: 11px, letter-spacing: 0.08em, uppercase
색상: var(--text-muted)
```

---

## 애니메이션

### 추천 리스트 진입

```css
/* PlaylistCard 각각에 적용 */
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  animation: fadeSlideUp 0.4s ease forwards;
}

/* 각 카드에 딜레이 (nth-child로) */
.card:nth-child(1) { animation-delay: 0ms; }
.card:nth-child(2) { animation-delay: 60ms; }
.card:nth-child(3) { animation-delay: 120ms; }
.card:nth-child(4) { animation-delay: 180ms; }
.card:nth-child(5) { animation-delay: 240ms; }
```

### 로딩 인디케이터 (pulse dots)

```css
@keyframes pulse {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50%       { opacity: 1;   transform: scale(1); }
}
/* 3개 dot, 각 200ms 딜레이 */
```

### 카드 인터랙션

```css
.card:hover  { transform: translateY(-2px); transition: 0.2s; }
.card:active { transform: scale(0.98); }
```

---

## 스펙 참고 이미지

```
┌─────────────────────────────────┐  ← #08080F 배경
│                                 │
│  2026.06.19                     │  ← text-muted, uppercase
│  오늘의 바이브                   │  ← 26px weight-300
│                                 │
│  ┌─────────────────────────┐    │
│  │                         │    │  ← surface + blur
│  │  오늘 기분을 적어줘...   │    │  ← MemoInput
│  │                         │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │      추천 받기          │    │  ← gradient btn
│  └─────────────────────────┘    │
│                                 │
│  ┌──────────┐ ┌──────────┐      │
│  │[커버이미지│ │[커버이미지│      │  ← PlaylistCard
│  │          │ │          │      │    (2열 그리드)
│  │▶  앨범명 │ │▶  앨범명 │      │
│  │  아티스트│ │  아티스트│      │
│  └──────────┘ └──────────┘      │
│                                 │
└────────────[홈] [기록]──────────┘  ← BottomNav blur
```

---

## 구현 우선순위

1. CSS 변수 선언 (`index.css`)
2. AppShell 배경 + BottomNav 스타일
3. PlaylistCard 커버 레이아웃 + 재생 버튼
4. MemoInput 다크 스타일 + 포커스 효과
5. 추천 버튼 그라디언트
6. 태그 배지 보라 색상
7. 카드 진입 애니메이션
