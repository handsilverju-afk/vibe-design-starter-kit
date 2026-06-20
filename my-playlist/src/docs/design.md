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

### 스크롤바
```
webkit-scrollbar: width 3px (항상 고정 — 레이아웃 shift 방지)
track: transparent
thumb (기본): 패널 배경색과 동일 (#F4F3F8 for sidebar) — 시각적 은폐
  ※ transparent 미사용 — macOS에서 OS 레벨이 재정의하는 문제 방지
thumb (hover): rgba(0,0,0,0.13), thumb:hover 시 rgba(0,0,0,0.22)
border-radius: 3px
좌측 사이드바: .sidebar::-webkit-scrollbar-thumb { background: #F4F3F8 } 로 직접 타겟
```

### DetailScreen (기록 상세 화면) 레이아웃
```
.screen: height 100%, overflow-y auto, background #fff
.inner:  max-width 760px, margin 0 auto, width 100%
  — 날짜 헤더, 인용 블록, 플레이리스트 모두 inner 컨테이너 안
수평 패딩: 32px (chatContent 동일 → 뮤직 리스트 폭 일치)
날짜 헤더: padding 28px 32px 20px
인용 블록: padding 8px 32px 32px (상단 8px — 날짜↔따옴표 간격 최소화)
플레이리스트: padding 0 32px 48px
```

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

.orbWrap::before — 외부 헤일로
  inset: -28%, filter: blur(14px)
  4개 radial-gradient (pink / sky / sky-lite / lavender)
  animation: outerHaloDrift 12s

.orb — 메인 가스 구체
  filter: blur(4px) — 색 경계 부드럽되 구분 가능
  6겹 radial-gradient: 0%→42% 점진적 fade → 60-65% transparent (soft stop)
    pink:  rgba(255,168,220,0.82) — 소프트 핑크 (퍼플 인접색)
    sky:   rgba(50,180,255,0.80)  — 블루
    lite:  rgba(145,218,255,0.72) — 라이트 블루
    teal:  rgba(48,205,172,0.62)  — 블루 믹스 그린 (블루·하늘색 사이 볼륨 보강, at 30% 68%)
    purple: rgba(178,135,255,0.65)
    base:  rgba(70,155,225,0.28)  — 블루 베이스
  animation: nebulaMorph 10s + nebulaColorDrift 18s

.orb::before — 에너지 코어 (구슬 스펙큘러 아님)
  inset: 15%, circle at 38% 35%
  흰색(0.75) → 하늘색 tint(0.35) → transparent 58%
  filter: blur(4px) — 색조 에너지 스팟, 유리 반사 아님
  animation: coreGlow 4.5s

nebulaMorph — 진폭 대폭 확대 (was 38–62% → now 28–72% 범위)
  더 극적인 비구형 변형으로 자유분방한 플라즈마 느낌

※ .orbWrap::after (유리 림) 제거 — 구슬 느낌 원인이었음

compact 모드: 외부 헤일로 숨김, filter: blur(2px)
loading 상태: float 2.5s + pulse 1.4s 동시, morph 2.8s (빠름), core 1.2s
```

### MemoInput (채팅 입력창)
```
공통 (Welcome·Chat 모드 동일 컴포넌트):
  min-height: 100px (기본 시작 높이)
  max-height: 360px (내용에 따라 자동 확장)
  auto-resize: useEffect로 scrollHeight 감지 → style.height 동적 조정
  border-radius: 16px
  padding: 14px 56px 14px 16px (우측 버튼 영역 확보)
  transition: height 0.1s ease (확장 시 부드럽게)
  포커스: border-color var(--accent), box-shadow 0 0 0 3px var(--accent-glow)
  Enter: 전송 → 입력창 자동 초기화 (height도 120px으로 리셋)
  Shift+Enter: 줄바꿈

Welcome 모드: max-width 560px, 중앙 배치
Chat 모드: inputWrap max-width 760px, margin 0 auto (chatContent와 정렬), 진한 border + shadow (.chatTextarea className)
```

### 전송 버튼 (채팅창 내장)
```
위치: .inputWrap 기준 position: absolute, right: 14px, bottom: 14px
크기: 34px 원형

상태별 컬러:
  미입력 (disabled):  bg var(--btn-bg) = #18172B, opacity: 0.25
  입력 활성 (active): bg var(--accent) = #8B7AEE (퍼플) ← .activeBtn
  로딩/Stop 중:       bg var(--btn-bg) = #18172B (Vibe 텍스트와 동일 다크) ← .stopBtn
                      아이콘: ■, font-size: 13px

MemoInput 내부 패딩: 14px 56px 14px 16px (버튼 영역 확보, 넉넉한 공간감)
chat 모드 rows: 6 (welcome 모드: 2)
chatInput container padding: 16px 20px 28px
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

로고: "Vibe" 20px weight 600 letter-spacing 0.06em — <button> 요소, 클릭 시 newPlaylist() 호출 (첫화면 복귀)
  hover: opacity 0.65 트랜지션
  로고 하단 패딩: 14px (버튼과의 간격 축소)

"새 뮤직 리스트" 버튼:
  rest:  background #F9F8FC (패널 #F4F3F8보다 약간 밝은 라벤더-화이트)
         border: 1px solid rgba(0,0,0,0.12)
  hover: background #FBFAFE (rest보다 미세하게 밝게)
         border-color: rgba(0,0,0,0.16) (아주 살짝 진하게)
         box-shadow: 0 1px 3px rgba(0,0,0,0.05) (매우 약한 그림자)
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s
  border-radius: 10px
  font-size: 13px, weight 500
  아이콘: "+" 텍스트, 16px, color var(--text-primary) (폰트 색상과 동일)
  gap: 7px (아이콘 ↔ 텍스트)

히스토리 섹션 레이블: 10px, uppercase, text-muted
히스토리 항목 (제목 → 날짜 순서):
  제목: 13px, var(--text-primary) (진한 색), truncate — 상단
  날짜: 10px, text-muted — 하단
  hover: surface-hover
  active: accent-glow background
```

### NowPlayingBanner — 공연장 미디어아트
```
height: 280px
진입 애니메이션: bannerSlideDown 0.42s cubic-bezier(0.22,1,0.36,1)
  — 위에서 부드럽게 내려오며 opacity 0→1 전환 (spring 곡선)
구현: Canvas API (requestAnimationFrame) 기반 제너레이티브 아트
비전: 뉴욕 미디어 아티스트 레벨. Refik Anadol의 데이터 페인팅, Lissajous 수학 예술,
     Perlin noise flow field 기법을 Canvas 2D로 구현. 가산 블렌딩(lighter)으로
     파티클이 겹칠수록 발광하는 고급 질감.

── BPM 추론 시스템 ────────────────────────────────────
  inferBPM(tags, title): 장르 태그 / 제목 키워드로 BPM 추론
    EDM/테크노 → 134, 트랩/힙합 → 88, 재즈/로파이 → 96, 록 → 130
    발라드/포크 → 76, 소울/R&B → 102, 신스/레트로 → 120, 팝/인디 → 116, 기본값 → 108
  
  speedMult = bpm / 108 (기준값 108 BPM 기준 비율)
    → 빠른 곡(EDM 134): sp × 1.24 / 느린 곡(발라드 76): sp × 0.70
  
  colorSeed = (trackIndex × 73 + floor(bpm/10)) % 360
    → 모든 씬의 기준 hue 오프셋. 곡이 바뀌면 반드시 다른 색상.
  
  useEffect 의존성: [sceneId, speedMult, colorSeed]
    → 곡 변경 시 sceneId 또는 colorSeed 변화 → 씬 반드시 재초기화

── 씬 감지 규칙 ──────────────────────────────────────
  playlist.tags 기반 매칭 → (base + idx*4 + cycleShift) % 11 오프셋 보장
  → 곱수 4 (gcd(4,11)=1): 11트랙 내 연속 중복 없음
  → cycleShift = floor(idx/11) * 3: 11트랙 초과 시 시작점 이동으로 반복 체감 감소

  전자|일렉|EDM|클럽|ambient  → FLOW
  소울|R&B|부드|팝             → SILK
  인디|밝|청량|화사             → PRISM
  재즈|로파이|카페|잔잔         → GARDEN (씬키: 'pop')
  힙합|랩|트랩|다크             → VOID
  신스|레트로|사이버|네온       → SIGNAL
  어쿠|포크|자연|힐링           → BLOOM
  열정|강렬|파워|드라이브       → EMBER
  우주|새벽|몽환|신비           → COSMOS
  댄스|케이팝|K팝|파티|걸그룹  → DANCER
  시티팝|야경|쇼와              → RISO

── 씬 목록 (총 11종) ──────────────────────────────────

FLOW (데이터 페인팅 / Refik Anadol):
  기법: Perlin-like flow field, 1800 파티클 트레일 누적
  특징: 파티클이 흐르며 남기는 발광 궤적이 캔버스에 축적 — 살아있는 그림
  블렌딩: globalCompositeOperation = 'lighter' (가산)
  팔레트: 시간에 따라 hue 회전, 청록-바이올렛-마젠타 계열

SILK (이리데센트 직물):
  기법: 50×24 격자 메시, 각 점 sin 변위, 표면 각도로 무지개빛 결정
  특징: 실제 천 표면처럼 각도에 따라 색이 변함. 스펙큘러 하이라이트 이동.
  팔레트: 각도 기반 hsla, 홀로그래픽 실크 느낌

PRISM (크리스탈 기하학):
  기법: 7꼭짓점 다각형 + 크로마틱 어버레이션 + 회절 광선
  특징: 프리즘이 회전하며 각 면에서 무지개 빛 분리, 꼭짓점에서 확산 광선
  블렌딩: 'lighter' (엣지 글로우)
  팔레트: 전 스펙트럼 순환
  [변경] 꼭짓점 흰색 원 글린트 제거 — 엣지 글로우만 유지

GARDEN (마네 스타일 페인트 타일 + 꽃잎 버스트):
  씬키: 'pop' (장르 매핑 동일), 뱃지 표시: 'GARDEN'
  기법: 마네풍 사각 페인트 타일 70개 천천히 위로 상승 + 대규모 붉은 꽃잎 버스트 파티클
  배경: 어두운 자연 톤 그라디언트 (sh = colorSeed*0.07+108 → 황록·올리브 계열)
  페인트 타일: 22–90px 직사각형, ±0.14rad 회전, 녹색·황록·어스 톤 반투명
               vy = -0.22~-0.64 (천천히 상승), 상단 이탈 시 하단 재진입
  꽃잎 버스트:
    수량: 45–80개 타원형 꽃잎이 한 번에 발사
    위치: 각 꽃잎 x = W*(0.02–0.98) 독립 랜덤 → 캔버스 전체 폭 고르게 분포 (뭉침 없음)
          y = H*(0.70–0.94) (하단에서 출발)
    발사: vy = -(14~30) 빠른 상향, vx = ±1.1
    물리: 중력 +0.062/frame (낮아서 긴 호 궤적), 공기 저항 vx *= 0.985
    크기: r = 6–16px
    수명: decay = 0.004–0.008 (천천히 페이드)
    색상: hue 338–374° (진홍·크림슨·장밋빛 적색), 내부 밝은 하이라이트
    주기: 160–340프레임 (~2.7–5.7초) — 여백 후 갑작스러운 터짐
  BPM 연동: sp = 0.30 × speedMult
  [교체 이력] Kusama 오브 → 4단계 시차 레이어 → 현재: 사각 페인트 타일 + 꽃잎 버스트

VOID (블랙홀 / 암흑물질):
  기법: 별들이 나선형으로 중심부로 빨려들어가는 중력 렌즈 효과
  특징: 중심 30px 완전 블랙홀, 주변 퍼플 발광, 별 굴절(gravity lensing)
  팔레트: 딥 퍼플-블랙, 블루-화이트 별

SIGNAL (리사주 도형 / 뫼비우스 띠):
  기법: 주파수 비율이 다른 Lissajous 곡선 3개 실시간 위상 변화
  특징: 수학적 패턴이 오실로스코프처럼 모핑. 내부 발광 코어 레이어.
        fx:fy = 1:2(∞자) / 3:2(클로버) / 3:4(꼬인 리본) — 위상 변화로 뫼비우스 띠처럼 회전
  크기: rx = W*0.26 (가로), ry = H*0.39 (세로) — 세로로 길쭉한 비율
  팔레트: colorSeed 기반 hue 3색 (하늘 185° / 보라 285° / 레드핑크 338°), 'lighter' 블렌딩
  라인: 밝기 56% (core 74%), alpha 0.10–0.85, 원색 강조
  [변경 이력] 라인 밝기 82%→56% (하얗게 보이던 문제) / rx W*0.39→W*0.26 (가로 축소)

BLOOM (피보나치 보태니컬):
  기법: 황금비(φ) 기반 피보나치 나선 배치, 꽃잎 호흡 애니메이션
  특징: 300개 꽃잎 타원이 황금각으로 배치, 전체가 천천히 회전하며 숨쉼
  팔레트: hue % 260 + 80 → 80°–340° (yellow-green~violet, 빨간색 계열 완전 배제)
  [변경] 꽃잎 r 최대 32px, 분포 반경 0.48
         hue 클램핑 적용 — colorSeed가 어떤 값이든 빨간색 꽃잎 생성 안 됨

EMBER (조각적 불꽃):
  기법: 불꽃 파티클 + 연기 파티클 멀티레이어 물리, 난류 바람 필드
  특징: 불꽃은 shadowBlur 발광, 연기는 확장하며 페이드. 열기 글로우 베이스.
  팔레트: 레드-오렌지-옐로우, 발광 코어

COSMOS (소형 파티클 원통 사이클):
  기법: **200개 소형 파티클**(r 1.2–3.4px) — 4단계 사이클 루프 애니메이션
  특징: 작은 빛점들이 이리저리 자유롭게 떠다니다 → 중앙으로 모여 원통(실린더)을 형성 →
        원통 궤도 유지하며 회전 → 다시 분해되며 바깥으로 퍼져나감 → 반복.
  사이클 구조 (약 12–13초 1루프):
    DRIFT (0%–35%):  각 파티클이 기준 위치 주변 sin 진동 유영. alpha 서서히 증가.
    CONVERGE (35%–58%): ease-in-out으로 원통 목표 위치 수렴. alpha 최고조.
    CYLINDER (58%–74%): 수직 실린더 표면 배치 + cylRot 회전.
                         앞면(cos>0)은 밝고 뒷면은 어둠 → 3D 깊이감.
    DISPERSE (74%–100%): 기준 위치 132% 밖으로 발사 → alpha 감소 → DRIFT 재개.
  렌더링: 외부 헤일로(r×3.8) + 글로우 링(r×2.0) + 밝은 코어 점(r×1.0).
          globalCompositeOperation = 'lighter' — 원통 수렴 시 집단 발광 효과.
  팔레트: hue 188–290° (블루-시안-보라-인디고). colorSeed + 시간 드리프트.
  [업데이트] 22개 대형 blob → 200개 소형 파티클 (r 1.2–3.4px)

DANCER (LED 댄스 퍼포먼스):
  기법: 88×27 = 2376개 도트 매트릭스 + 캡슐 히트테스트 + 3인 동시 렌더링
  특징: 3명의 댄서가 W*0.18 / W*0.50 / W*0.82 위치에 배치 → 캔버스 전체 점등.
        각 댄서는 포즈 위상이 0 / 0.34 / 0.67만큼 어긋나 서로 다른 동작.
        S = H/10 (이전 H/12 대비 20% 확대). 도트 반경 ≈ 3px (이전 5.9px 대비 절반).
        켜진 LED: vivid 색상 + 흰 하이라이트 + 가산 블렌딩 헤일로.
  포즈: V자 팔 / 한팔 킥 / 대각 X자 / 클럽 웨이브 / 브레이크다운 크라우치 / 팝스타 포즈
  팔레트: colorSeed + 시간 hue 드리프트, x/y 위치에 따라 ±55°/20° hue 그래디언트
  BPM 연동: speedMult로 포즈 전환 속도 조정
  [변경] 단일 댄서→3인, 50×17→88×27, S=H/12→H/10, 도트 크기 절반으로 축소

RISO (시티팝 / 리소그라프 판화):
  기법: 2개 잉크 플레이트 각각 4px 오프셋 오버프린트 + 방사형 속도선 + 창문 빛
  특징: 일본 시티팝 80s 야경 감성. 11개 빌딩 실루엣이 두 가지 비비드 색상으로
        약간 어긋나게 인쇄된 리소그라프/판화 느낌. AKIRA 스타일 방사형 속도선.
        animated grain (필름 노이즈), 스캔라인 (구형 TV 텍스처).
  잉크 색상: H1 (colorSeed+308 = 마젠타 계열), H2 (colorSeed+168 = 시안 계열)
             H3 (colorSeed+52 = 옐로우-오렌지 = 창문/속도선 액센트)
  플레이트 겹침: screen 블렌딩 → 두 플레이트가 겹치는 곳은 밝고 복잡한 색 생성
  BPM 연동: 속도선 길이 + 비트 플래시 강도

── 공통 기술 규칙 ─────────────────────────────────────
  globalCompositeOperation: 주요 씬 'lighter' (발광 가산 블렌딩)
  isPaused: sp 계수 ~0.06–0.12 (느린 ambient 상태 유지)
  BPM 연동: const sp = (base_speed) * st.speedMult (모든 씬 공통)
  색상 연동: st.colorSeed를 hue에 더해 트랙별 팔레트 분리
  트랙 변경: useEffect deps [sceneId, speedMult, colorSeed] → 반드시 재초기화
  Canvas 레이어:
    1: canvas (position: absolute; inset: 0)
    2: .content — 트랙 정보 + 컨트롤 오버레이
  ※ sceneBadge(씬 이름 레이블) 제거됨

컨트롤 — 리퀴드 글래스 스타일:
  일반 버튼 (ctrlBtn):
    background: linear-gradient(145deg, rgba(255,255,255,0.22) → rgba(255,255,255,0.08))
    backdrop-filter: blur(20px) saturate(160%)
    border: 1px solid rgba(255,255,255,0.30)
    box-shadow: 0 4px 16px rgba(0,0,0,0.28) + inset top/bottom highlight
    크기: 36px 원형

  재생 버튼 (playBtn):
    background: linear-gradient(145deg, rgba(255,255,255,0.30) → rgba(255,255,255,0.10))
    backdrop-filter: blur(24px) saturate(200%)
    border: rgba(255,255,255,0.42)
    box-shadow: 0 8px 32px rgba(0,0,0,0.40) + 강화 inset highlight
    크기: 48px 원형

  볼륨 래퍼 (volumeWrap):
    글래스 pill 형태: border-radius 20px, padding 6px 12px
    background: linear-gradient(145deg, rgba(255,255,255,0.14) → rgba(255,255,255,0.06))
    backdrop-filter: blur(16px) saturate(140%)
    border: 1px solid rgba(255,255,255,0.20)

  볼륨 슬라이더 (playbar):
    width: 80px, height: 3px
    track: linear-gradient(to right, rgba(255,255,255,0.65) → rgba(255,255,255,0.18))
    thumb: 13px, gradient white, box-shadow 글래스 광택

  loop 버튼:
    아이콘 이중 상태 (상태에 따라 SVG 변경):
      활성(ON):  표준 루프 화살표 아이콘 + 퍼플 글래스 하이라이트
                 background: linear-gradient(145deg, rgba(139,122,238,0.55) → rgba(139,122,238,0.28))
                 box-shadow: 0 4px 18px rgba(139,122,238,0.42) + inset highlight
      비활성(OFF): 루프 화살표 아이콘 + 대각선 슬래시 (opacity 0.45) — 루프 해제 상태 명시
    기본값: ON (loopRef = useRef(true))
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
  padding: 28px 36px 20px (위로 올림 — 52px → 28px)
  border-bottom: 없음 (제거)
  dateLine: "2026. 06. 19" — 22px, font-weight 700, letter-spacing -0.01em
  dayBadge: "목요일" — 16px, text-muted, 옆에 나란히

인용 블록 (quoteBlock):
  padding: 16px 36px 32px
  openQuote: " — Georgia/serif, 78px, rgba(139,122,238,0.2), 장식용
             line-height: 0.65, margin-bottom: -28px (따옴표와 텍스트 간격 최소화)
  quoteText: 17px, font-weight 400, line-height 1.9, letter-spacing -0.02em
             white-space pre-wrap (개행 유지)

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
  font-size: 42px
  font-weight: 300
  color: --text-primary

부제: "기분이나 일정을 입력하면 음악을 추천해드려요."
  font-size: 15px
  color: --text-secondary

레이아웃:
  콘텐츠 수직 중앙에서 위로 80px 이동
  padding: 48px 40px 208px (bottom 패딩으로 center offset 조정)
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
