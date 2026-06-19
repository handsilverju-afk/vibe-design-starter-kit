import { useRef, useEffect } from 'react'
import styles from './NowPlayingBanner.module.css'

// ── Scene Detection ──────────────────────────────────────────────────────────
const TAG_MAP = [
  [/전자|일렉|EDM|클럽|테크노|ambient|앰비/i,   'flow'],
  [/소울|R&B|부드|감미|실크|neo.soul|팝/i,      'silk'],
  [/인디|밝|경쾌|청량|화사|선명|팝/i,           'prism'],
  [/재즈|jazz|로파이|카페|잔잔|차분|스윙/i,     'drift'],
  [/힙합|랩|트랩|다크|어두|인더스/i,           'void'],
  [/신스|레트로|사이버|도시|네온|80/i,          'signal'],
  [/어쿠|포크|자연|힐링|숲|봄|풀/i,            'bloom'],
  [/열정|강렬|파워|드라이브|업템포|신나/i,      'ember'],
  [/우주|새벽|몽환|신비|꿈|서사|코스모/i,       'cosmos'],
]

const SCENE_KEYS = ['flow', 'silk', 'prism', 'drift', 'void', 'signal', 'bloom', 'ember', 'cosmos']
const N = SCENE_KEYS.length

// trackIndex shifts the result → every track gets a different scene, guaranteed
function detectScene(tags = [], idx = 0) {
  const str = (tags || []).join(' ')
  for (const [rx, scene] of TAG_MAP) {
    if (rx.test(str)) {
      const base = SCENE_KEYS.indexOf(scene)
      return SCENE_KEYS[(base + idx) % N]
    }
  }
  return SCENE_KEYS[(idx * 4 + 2) % N]
}

// ── Utility ──────────────────────────────────────────────────────────────────
function flowAngle(x, y, t) {
  const s = 0.0022
  return (
    Math.sin(x * s + t * 0.007) * Math.PI * 1.3 +
    Math.sin(y * s * 0.9 + t * 0.005) * Math.PI * 0.9 +
    Math.sin((x - y) * s * 0.55 + t * 0.004) * Math.PI * 0.55
  )
}

// ── FLOW ─────────────────────────────────────────────────────────────────────
// Refik Anadol: data-as-pigment, trails accumulate into a living painting
function initFlow(W, H) {
  return {
    t: 0,
    particles: Array.from({ length: 1800 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      px: -1, py: -1,
      life: Math.random(),
      maxLife: 0.55 + Math.random() * 0.45,
      hue: 160 + Math.random() * 120,
    })),
    paletteSeed: Math.random() * 360,
  }
}

function drawFlow(ctx, W, H, st, paused) {
  const sp = paused ? 0.06 : 0.55
  st.t += sp
  const T = st.t

  ctx.fillStyle = 'rgba(3, 6, 16, 0.02)'
  ctx.fillRect(0, 0, W, H)

  const palHue = (st.paletteSeed + T * 0.12) % 360

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.lineWidth = 0.75

  for (const p of st.particles) {
    const angle = flowAngle(p.x, p.y, T)
    const spd = 1.6 + Math.sin(p.x * 0.006 + T * 0.012) * 0.6
    const nx = p.x + Math.cos(angle) * spd * sp
    const ny = p.y + Math.sin(angle) * spd * sp

    p.life -= 0.0012 * sp

    if (p.px >= 0 && p.life > 0 && nx > 0 && nx < W && ny > 0 && ny < H) {
      const a = Math.min(p.life / p.maxLife, 1) * 0.19
      const h = (palHue + (p.hue - 160) * 0.5) % 360
      ctx.beginPath()
      ctx.moveTo(p.px, p.py)
      ctx.lineTo(nx, ny)
      ctx.strokeStyle = `hsla(${h}, 85%, 65%, ${a.toFixed(3)})`
      ctx.stroke()
    }

    p.px = nx; p.py = ny; p.x = nx; p.y = ny

    if (p.life <= 0 || nx < -2 || nx > W + 2 || ny < -2 || ny > H + 2) {
      p.x = Math.random() * W; p.y = Math.random() * H
      p.px = -1; p.py = -1
      p.life = p.maxLife
      p.hue = 160 + Math.random() * 120
    }
  }

  ctx.globalCompositeOperation = 'source-over'
  ctx.restore()
}

// ── SILK ─────────────────────────────────────────────────────────────────────
// Iridescent woven surface — angle-dependent color like real fabric
function initSilk(W, H) {
  const cols = 50, rows = 24
  return {
    t: 0, cols, rows,
    grid: Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => ({
        bx: (c / (cols - 1)) * W,
        by: (r / (rows - 1)) * H,
        ph: (c * 0.38 + r * 0.55) + Math.random() * 0.4,
        amp: 14 + Math.random() * 20,
        f: 0.7 + Math.random() * 0.55,
      }))
    ),
  }
}

function drawSilk(ctx, W, H, st, paused) {
  const sp = paused ? 0.05 : 0.48
  st.t += sp
  const T = st.t

  ctx.fillStyle = 'rgba(4, 2, 10, 1)'
  ctx.fillRect(0, 0, W, H)

  const { cols, rows, grid } = st
  const pos = (r, c) => {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return null
    const g = grid[r][c]
    const dv =
      Math.sin(g.bx * 0.006 + T * g.f * 0.018 + g.ph) * g.amp +
      Math.cos(g.by * 0.009 + T * g.f * 0.013) * g.amp * 0.42 +
      Math.sin((g.bx + g.by) * 0.004 + T * 0.009) * g.amp * 0.26
    return { x: g.bx, y: g.by + dv }
  }

  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const tl = pos(r, c), tr = pos(r, c + 1)
      const bl = pos(r + 1, c), br = pos(r + 1, c + 1)
      if (!tl || !tr || !bl || !br) continue

      const dy = bl.y - tl.y
      const norm = Math.atan2(dy, W / cols * 2.5)
      const hue = (norm * 230 / Math.PI + c * 7 + T * 0.38 + 200) % 360
      const sat = 58 + Math.abs(Math.sin(norm * 2.2)) * 36
      const lit = 28 + Math.abs(Math.cos(norm * 2.8)) * 30
      const a = 0.82 + Math.sin(norm * 3) * 0.14

      ctx.beginPath()
      ctx.moveTo(tl.x, tl.y); ctx.lineTo(tr.x, tr.y)
      ctx.lineTo(br.x, br.y); ctx.lineTo(bl.x, bl.y)
      ctx.closePath()
      ctx.fillStyle = `hsla(${hue},${sat}%,${lit}%,${a.toFixed(2)})`
      ctx.fill()
    }
  }

  const sx = W * (0.35 + 0.3 * Math.sin(T * 0.007))
  const sy = H * (0.28 + 0.2 * Math.cos(T * 0.005))
  const spec = ctx.createRadialGradient(sx, sy, 0, sx, sy, W * 0.42)
  spec.addColorStop(0, 'rgba(255,255,255,0.16)')
  spec.addColorStop(0.35, 'rgba(255,255,255,0.04)')
  spec.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = spec
  ctx.fillRect(0, 0, W, H)
}

// ── PRISM ─────────────────────────────────────────────────────────────────────
// Crystal geometry — chromatic aberration + diffraction rays
function initPrism(W, H) {
  const n = 7
  return {
    t: 0,
    verts: Array.from({ length: n }, (_, i) => ({
      angle: (i / n) * Math.PI * 2,
      r: W * 0.2 + Math.random() * W * 0.08,
      spd: (0.003 + Math.random() * 0.004) * (Math.random() < 0.5 ? 1 : -1),
    })),
  }
}

function drawPrism(ctx, W, H, st, paused) {
  const sp = paused ? 0.05 : 0.5
  st.t += sp
  const T = st.t

  ctx.fillStyle = `rgba(2, 2, 8, ${paused ? 0.38 : 0.22})`
  ctx.fillRect(0, 0, W, H)

  const cx = W * 0.5, cy = H * 0.5
  const pts = st.verts.map(v => ({
    x: cx + Math.cos(v.angle + T * v.spd) * v.r,
    y: cy + Math.sin(v.angle + T * v.spd * 0.72) * v.r * 0.55,
  }))
  const n = pts.length

  // chromatic aberration pass
  for (const [ox, oy, c] of [[3, 1, 'r'], [-2, 2, 'g'], [0, -3, 'b']]) {
    for (let i = 0; i < n; i++) {
      const a = pts[i], b = pts[(i + 1) % n]
      ctx.beginPath()
      ctx.moveTo(cx + ox, cy + oy)
      ctx.lineTo(a.x + ox, a.y + oy)
      ctx.lineTo(b.x + ox, b.y + oy)
      ctx.closePath()
      ctx.strokeStyle = c === 'r' ? 'rgba(255,80,160,0.20)'
                      : c === 'g' ? 'rgba(80,255,180,0.14)'
                      :             'rgba(100,140,255,0.16)'
      ctx.lineWidth = 0.7
      ctx.stroke()
    }
  }

  // main face fills
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n]
    const hue = (i / n) * 300 + T * 0.22
    const grd = ctx.createLinearGradient(cx, cy, (a.x + b.x) / 2, (a.y + b.y) / 2)
    grd.addColorStop(0, `hsla(${hue},75%,55%,0.03)`)
    grd.addColorStop(1, `hsla(${(hue + 55) % 360},90%,72%,0.11)`)
    ctx.beginPath()
    ctx.moveTo(cx, cy); ctx.lineTo(a.x, a.y); ctx.lineTo(b.x, b.y)
    ctx.closePath()
    ctx.fillStyle = grd; ctx.fill()
    ctx.strokeStyle = `hsla(${hue}, 90%, 75%, 0.30)`
    ctx.lineWidth = 0.8; ctx.stroke()
  }

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'

  // edge glow + vertex glints
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n]
    const hue = (i / n) * 300 + T * 0.22
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y)
    ctx.strokeStyle = `hsla(${hue},100%,82%,0.20)`
    ctx.lineWidth = 1.6; ctx.stroke()
  }
  for (const p of pts) {
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 10)
    g.addColorStop(0, 'rgba(255,255,255,0.55)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI * 2); ctx.fill()
  }

  // diffraction rays from rotating peak vertex
  const peak = pts[Math.floor(T * 0.028) % n]
  for (let r = 0; r < 6; r++) {
    const ang = (r / 6) * Math.PI * 2 + T * 0.009
    const ex = peak.x + Math.cos(ang) * W * 0.45
    const ey = peak.y + Math.sin(ang) * H * 0.45
    const lg = ctx.createLinearGradient(peak.x, peak.y, ex, ey)
    lg.addColorStop(0, `hsla(${r * 60 + T * 0.25},100%,82%,0.16)`)
    lg.addColorStop(1, `hsla(${r * 60 + T * 0.25},100%,82%,0)`)
    ctx.beginPath(); ctx.moveTo(peak.x, peak.y); ctx.lineTo(ex, ey)
    ctx.strokeStyle = lg; ctx.lineWidth = 1; ctx.stroke()
  }

  ctx.globalCompositeOperation = 'source-over'
  ctx.restore()
}

// ── DRIFT ─────────────────────────────────────────────────────────────────────
// Gravitational dance — particles orbit moving wells, leaving luminous trails
function mkDriftPtcl(W, H, wx, wy) {
  const ang = Math.random() * Math.PI * 2
  const r = 30 + Math.random() * 90
  return {
    x: wx + Math.cos(ang) * r,
    y: wy + Math.sin(ang) * r * 0.55,
    vx: Math.sin(ang) * (1.4 + Math.random() * 0.8),
    vy: -Math.cos(ang) * (1.4 + Math.random() * 0.8),
    trail: [],
    hue: Math.random() * 80 + 170,
  }
}

function initDrift(W, H) {
  const cx = W * 0.5, cy = H * 0.5
  const wells = [
    { ang: 0,           r: W * 0.22, spd: 0.006, mass: 1200 },
    { ang: Math.PI,     r: W * 0.18, spd: -0.005, mass: 900 },
    { ang: Math.PI / 2, r: W * 0.12, spd: 0.009,  mass: 600 },
  ]
  return {
    t: 0, wells,
    particles: Array.from({ length: 520 }, () =>
      mkDriftPtcl(W, H, cx + (Math.random() - 0.5) * W * 0.6, cy + (Math.random() - 0.5) * H * 0.4)
    ),
  }
}

function drawDrift(ctx, W, H, st, paused) {
  const sp = paused ? 0.05 : 0.5
  st.t += sp
  const T = st.t
  const cx = W * 0.5, cy = H * 0.5

  ctx.fillStyle = 'rgba(4, 5, 14, 0.20)'
  ctx.fillRect(0, 0, W, H)

  const wPts = st.wells.map(w => ({
    x: cx + Math.cos(w.ang + T * w.spd) * w.r,
    y: cy + Math.sin(w.ang + T * w.spd * 0.65) * w.r * 0.5,
    mass: w.mass,
  }))

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'

  for (const p of st.particles) {
    let ax = 0, ay = 0
    for (const w of wPts) {
      const dx = w.x - p.x, dy = w.y - p.y
      const d2 = dx * dx + dy * dy + 400
      const f = w.mass / (d2 * Math.sqrt(d2)) * 1100
      ax += dx * f; ay += dy * f
    }
    p.vx = (p.vx + ax * sp) * 0.990
    p.vy = (p.vy + ay * sp) * 0.990
    p.x += p.vx * sp; p.y += p.vy * sp

    p.trail.push([p.x, p.y])
    if (p.trail.length > 24) p.trail.shift()

    const spd2 = p.vx * p.vx + p.vy * p.vy
    const bright = Math.min(spd2 / 8, 1)

    if (p.trail.length > 2) {
      ctx.beginPath()
      ctx.moveTo(p.trail[0][0], p.trail[0][1])
      for (const [tx, ty] of p.trail) ctx.lineTo(tx, ty)
      ctx.strokeStyle = `hsla(${(p.hue + bright * 28) % 360}, 88%, ${52 + bright * 28}%, ${(bright * 0.18 + 0.04).toFixed(3)})`
      ctx.lineWidth = 0.6 + bright * 0.4
      ctx.stroke()
    }

    if (p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20 || spd2 > 420) {
      const w = wPts[Math.floor(Math.random() * wPts.length)]
      Object.assign(p, mkDriftPtcl(W, H, w.x + (Math.random() - 0.5) * 60, w.y + (Math.random() - 0.5) * 40))
    }
  }

  for (const w of wPts) {
    const g = ctx.createRadialGradient(w.x, w.y, 0, w.x, w.y, 38)
    g.addColorStop(0, 'rgba(130,170,255,0.20)')
    g.addColorStop(1, 'rgba(40,70,200,0)')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(w.x, w.y, 38, 0, Math.PI * 2); ctx.fill()
  }

  ctx.globalCompositeOperation = 'source-over'
  ctx.restore()
}

// ── VOID ─────────────────────────────────────────────────────────────────────
// Dark matter: stars spiral into a gravitational singularity
function initVoid(W, H) {
  return {
    t: 0, pulse: 0,
    stars: Array.from({ length: 300 }, () => {
      const ang = Math.random() * Math.PI * 2
      const r = 40 + Math.random() * Math.min(W, H) * 0.48
      return {
        ang,
        r,
        spd: (0.0008 + Math.random() * 0.0025) * (Math.random() < 0.5 ? 1 : -1),
        drift: -0.001 - Math.random() * 0.002, // inward spiral
        size: 0.5 + Math.random() * 1.5,
        a: 0.4 + Math.random() * 0.5,
      }
    }),
  }
}

function drawVoid(ctx, W, H, st, paused) {
  const sp = paused ? 0.06 : 0.5
  st.t += sp
  const T = st.t
  const cx = W * 0.5, cy = H * 0.5

  ctx.fillStyle = 'rgba(1, 1, 4, 0.30)'
  ctx.fillRect(0, 0, W, H)

  for (const s of st.stars) {
    s.ang += s.spd * sp
    s.r = Math.max(22, s.r + s.drift * sp)
    if (s.r <= 22) {
      s.ang = Math.random() * Math.PI * 2
      s.r = Math.min(W, H) * (0.3 + Math.random() * 0.2)
    }

    const sx = cx + Math.cos(s.ang) * s.r * (W / Math.min(W, H) * 0.9)
    const sy = cy + Math.sin(s.ang) * s.r * 0.48

    const dist = s.r
    const lensed = Math.max(0, 1 - dist / (Math.min(W, H) * 0.45))
    const bx = sx - (sx - cx) * lensed * 0.32
    const by = sy - (sy - cy) * lensed * 0.32

    const fade = Math.min(1, (dist - 22) / 40)
    ctx.beginPath()
    ctx.arc(bx, by, s.size * fade, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(195,210,255,${(s.a * fade).toFixed(3)})`
    ctx.fill()
  }

  st.pulse = (st.pulse + sp * 0.014) % (Math.PI * 2)
  const pm = 1 + 0.07 * Math.sin(st.pulse)

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < 3; i++) {
    const rg = ctx.createRadialGradient(cx, cy, 22 + i * 8, cx, cy, 90 + i * 30)
    rg.addColorStop(0, `rgba(${70 + i * 25}, 0, ${180 - i * 20}, ${0.07 - i * 0.015})`)
    rg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H)
  }
  ctx.globalCompositeOperation = 'source-over'
  ctx.restore()

  for (let ring = 0; ring < 3; ring++) {
    ctx.beginPath()
    ctx.arc(cx, cy, (26 + ring * 9) * pm, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(155,90,255,${[0.55, 0.25, 0.10][ring]})`
    ctx.lineWidth = ring === 0 ? 2 : 1
    ctx.stroke()
  }

  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30)
  core.addColorStop(0, 'rgba(0,0,0,1)')
  core.addColorStop(0.75, 'rgba(0,0,0,0.94)')
  core.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = core; ctx.fillRect(0, 0, W, H)
}

// ── SIGNAL ───────────────────────────────────────────────────────────────────
// Lissajous figures morphing in real time — math as gallery art
function initSignal() {
  return {
    t: 0,
    curves: [
      { fx: 1, fy: 2, hue: 185 },
      { fx: 3, fy: 2, hue: 285 },
      { fx: 3, fy: 4, hue: 338 },
    ],
  }
}

function drawSignal(ctx, W, H, st, paused) {
  const sp = paused ? 0.06 : 0.5
  st.t += sp
  const T = st.t

  ctx.fillStyle = 'rgba(3, 5, 10, 0.24)'
  ctx.fillRect(0, 0, W, H)

  const cx = W * 0.5, cy = H * 0.5
  const rx = W * 0.39, ry = H * 0.39

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'

  for (const c of st.curves) {
    const phase = T * 0.007 + c.fx * 0.4
    const STEPS = 700

    ctx.lineWidth = 1.3
    for (let i = 1; i <= STEPS; i++) {
      const a0 = ((i - 1) / STEPS) * Math.PI * 2
      const a1 = (i / STEPS) * Math.PI * 2
      const x0 = cx + rx * Math.sin(c.fx * a0 + phase)
      const y0 = cy + ry * Math.sin(c.fy * a0)
      const x1 = cx + rx * Math.sin(c.fx * a1 + phase)
      const y1 = cy + ry * Math.sin(c.fy * a1)

      const frac = i / STEPS
      const alpha = Math.sin(frac * Math.PI) * 0.22 + 0.04
      const hue = (c.hue + frac * 28) % 360
      ctx.beginPath()
      ctx.moveTo(x0, y0); ctx.lineTo(x1, y1)
      ctx.strokeStyle = `hsla(${hue}, 92%, 72%, ${alpha.toFixed(3)})`
      ctx.stroke()
    }

    // inner luminous core
    ctx.lineWidth = 0.35
    for (let i = 1; i <= STEPS; i++) {
      const a0 = ((i - 1) / STEPS) * Math.PI * 2
      const a1 = (i / STEPS) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(cx + rx * Math.sin(c.fx * a0 + phase), cy + ry * Math.sin(c.fy * a0))
      ctx.lineTo(cx + rx * Math.sin(c.fx * a1 + phase), cy + ry * Math.sin(c.fy * a1))
      ctx.strokeStyle = `hsla(${c.hue}, 100%, 92%, 0.07)`
      ctx.stroke()
    }
  }

  ctx.globalCompositeOperation = 'source-over'
  ctx.restore()

  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.14)
  glow.addColorStop(0, 'rgba(100,200,255,0.09)')
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H)
}

// ── BLOOM ────────────────────────────────────────────────────────────────────
// Fibonacci botanical spiral — organic mathematical growth
function initBloom(W, H) {
  const phi = (1 + Math.sqrt(5)) / 2
  const n = 300
  return {
    t: 0,
    petals: Array.from({ length: n }, (_, i) => {
      const ang = i * Math.PI * 2 / phi
      const dist = Math.sqrt(i / n) * Math.min(W, H) * 0.42
      return {
        ang,
        dist,
        r: 2.5 + (i / n) * 8,
        hue: 80 + (i / n) * 220,
        t: i * 0.018,
      }
    }),
  }
}

function drawBloom(ctx, W, H, st, paused) {
  const sp = paused ? 0.04 : 0.4
  st.t += sp
  const T = st.t
  const cx = W * 0.5, cy = H * 0.5

  ctx.fillStyle = 'rgba(4, 8, 6, 0.20)'
  ctx.fillRect(0, 0, W, H)

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'

  const rot = T * 0.0038
  for (const p of st.petals) {
    const breathe = 0.88 + 0.12 * Math.sin(T * 0.016 + p.t)
    const bx = cx + Math.cos(p.ang + rot) * p.dist * breathe
    const by = cy + Math.sin(p.ang + rot) * p.dist * 0.58 * breathe

    const hue = (p.hue + T * 0.14) % 360
    const a = 0.09 + 0.06 * Math.sin(T * 0.022 + p.t)

    ctx.save()
    ctx.translate(bx, by)
    ctx.rotate(p.ang + rot + Math.PI / 2)
    ctx.beginPath()
    ctx.ellipse(0, 0, p.r * breathe, p.r * 0.32 * breathe, 0, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${hue}, 78%, 65%, ${a.toFixed(3)})`
    ctx.fill()
    ctx.restore()
  }

  ctx.globalCompositeOperation = 'source-over'

  const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, H * 0.22)
  cg.addColorStop(0, `hsla(${(65 + T * 0.28) % 360}, 90%, 82%, 0.20)`)
  cg.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = cg; ctx.fillRect(0, 0, W, H)

  ctx.restore()
}

// ── EMBER ────────────────────────────────────────────────────────────────────
// Fire as sculpture — turbulent multi-layer particle system
function mkEmberPtcl(W, H) {
  return {
    x: W * 0.5 + (Math.random() - 0.5) * W * 0.22,
    y: H * 0.82 + Math.random() * H * 0.08,
    vx: (Math.random() - 0.5) * 0.7,
    vy: -(1.2 + Math.random() * 3.8),
    r: 1.2 + Math.random() * 4.8,
    life: 1,
    maxLife: 0.45 + Math.random() * 0.55,
    hue: 5 + Math.random() * 32,
    smoke: Math.random() < 0.18,
  }
}

function initEmber(W, H) {
  return { t: 0, particles: Array.from({ length: 240 }, () => mkEmberPtcl(W, H)) }
}

function drawEmber(ctx, W, H, st, paused) {
  const sp = paused ? 0.1 : 1.0
  st.t += sp
  const T = st.t

  ctx.fillStyle = `rgba(8, 3, 1, ${paused ? 0.38 : 0.16})`
  ctx.fillRect(0, 0, W, H)

  const heat = ctx.createRadialGradient(W * 0.5, H * 0.84, 0, W * 0.5, H * 0.84, W * 0.42)
  heat.addColorStop(0, `rgba(255,90,10,${(0.28 + 0.08 * Math.sin(T * 0.045)).toFixed(3)})`)
  heat.addColorStop(0.4, 'rgba(200,50,5,0.10)')
  heat.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = heat; ctx.fillRect(0, 0, W, H)

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'

  for (const p of st.particles) {
    p.vx += (Math.random() - 0.5) * 0.28 * sp
    p.vx += Math.sin(p.y * 0.038 + T * 0.04) * 0.14 * sp
    p.x += p.vx * sp; p.y += p.vy * sp
    p.life -= (0.005 + Math.random() * 0.003) * sp
    if (p.smoke) p.r *= 1 + 0.011 * sp

    if (p.life <= 0 || p.y < H * 0.04) {
      Object.assign(p, mkEmberPtcl(W, H)); p.life = p.maxLife; continue
    }

    const decay = p.life / p.maxLife

    if (!p.smoke) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r * decay, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${p.hue + (1 - decay) * 20}, 100%, ${52 + decay * 38}%, ${(decay * 0.72).toFixed(3)})`
      ctx.shadowBlur = p.r * 3.5; ctx.shadowColor = `hsla(${p.hue},100%,60%,0.5)`
      ctx.fill(); ctx.shadowBlur = 0
    } else {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(70,35,18,${(decay * 0.055).toFixed(3)})`
      ctx.fill()
    }
  }

  ctx.globalCompositeOperation = 'source-over'
  ctx.restore()
}

// ── COSMOS ───────────────────────────────────────────────────────────────────
// Deep space — parallax star layers, drifting nebulae, shooting stars
function initCosmos(W, H) {
  const mkStar = scale => ({
    x: Math.random() * W, y: Math.random() * H,
    r: Math.random() * scale,
    ph: Math.random() * Math.PI * 2,
    spd: 0.012 + Math.random() * 0.03,
    drift: (Math.random() - 0.5) * 0.06,
  })
  return {
    t: 0,
    layers: [
      Array.from({ length: 130 }, () => mkStar(0.75)),
      Array.from({ length: 85 },  () => mkStar(1.4)),
      Array.from({ length: 48 },  () => mkStar(2.2)),
    ],
    shoots: [], nextShoot: 65,
    nebulae: [
      { x: W * 0.28, y: H * 0.40, r: W * 0.32, h: 248, s: 50, a: 0.13, d: 26 },
      { x: W * 0.74, y: H * 0.60, r: W * 0.27, h: 192, s: 44, a: 0.10, d: -22 },
      { x: W * 0.50, y: H * 0.50, r: W * 0.17, h: 278, s: 40, a: 0.065, d: 14 },
    ],
  }
}

function drawCosmos(ctx, W, H, st, paused) {
  const sp = paused ? 0.06 : 0.5
  st.t += sp
  const T = st.t

  const bg = ctx.createRadialGradient(W * 0.42, H * 0.36, 0, W * 0.5, H * 0.5, Math.max(W, H))
  bg.addColorStop(0, '#120830')
  bg.addColorStop(0.5, '#080520')
  bg.addColorStop(1, '#030112')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

  for (const n of st.nebulae) {
    const ox = Math.cos(T * 0.0022) * n.d
    const oy = Math.sin(T * 0.0018) * n.d * 0.6
    const ng = ctx.createRadialGradient(n.x + ox, n.y + oy, 0, n.x, n.y, n.r)
    ng.addColorStop(0, `hsla(${n.h}, ${n.s}%, 44%, ${n.a})`)
    ng.addColorStop(0.55, `hsla(${n.h + 25}, ${n.s - 10}%, 32%, ${n.a * 0.5})`)
    ng.addColorStop(1, `hsla(${n.h}, ${n.s}%, 22%, 0)`)
    ctx.fillStyle = ng; ctx.fillRect(0, 0, W, H)
  }

  const parallax = [0.3, 0.65, 1.0]
  const colors = [
    (a) => `rgba(175,182,255,${(a * 0.4).toFixed(3)})`,
    (a) => `rgba(205,212,255,${(a * 0.7).toFixed(3)})`,
    (a) => `rgba(220,228,255,${a.toFixed(3)})`,
  ]
  for (let l = 0; l < 3; l++) {
    for (const s of st.layers[l]) {
      s.ph += s.spd * sp
      s.x += s.drift * sp * parallax[l]
      if (s.x > W + 2) s.x = -2
      if (s.x < -2) s.x = W + 2
      const a = 0.3 + Math.sin(s.ph) * 0.28
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fillStyle = colors[l](a); ctx.fill()
    }
  }

  if (T >= st.nextShoot) {
    st.shoots.push({
      x: Math.random() * W * 0.65, y: Math.random() * H * 0.32,
      vx: 5.5 + Math.random() * 7, vy: 2.5 + Math.random() * 3.5,
      life: 1, len: 55 + Math.random() * 85,
    })
    st.nextShoot = T + 90 + Math.random() * 160
  }
  for (let i = st.shoots.length - 1; i >= 0; i--) {
    const s = st.shoots[i]
    s.x += s.vx * sp; s.y += s.vy * sp; s.life -= 0.038 * sp
    if (s.life < 0) { st.shoots.splice(i, 1); continue }
    const mag = Math.sqrt(s.vx * s.vx + s.vy * s.vy)
    const sg = ctx.createLinearGradient(
      s.x - s.vx / mag * s.len, s.y - s.vy / mag * s.len, s.x, s.y)
    sg.addColorStop(0, 'rgba(255,255,255,0)')
    sg.addColorStop(1, `rgba(255,255,255,${(s.life * 0.92).toFixed(2)})`)
    ctx.beginPath()
    ctx.moveTo(s.x - s.vx / mag * s.len, s.y - s.vy / mag * s.len)
    ctx.lineTo(s.x, s.y)
    ctx.strokeStyle = sg; ctx.lineWidth = 1.8; ctx.stroke()
  }
}

// ── Scene Registry ───────────────────────────────────────────────────────────
const SCENES = {
  flow:   { init: initFlow,   draw: drawFlow },
  silk:   { init: initSilk,   draw: drawSilk },
  prism:  { init: initPrism,  draw: drawPrism },
  drift:  { init: initDrift,  draw: drawDrift },
  void:   { init: initVoid,   draw: drawVoid },
  signal: { init: initSignal, draw: drawSignal },
  bloom:  { init: initBloom,  draw: drawBloom },
  ember:  { init: initEmber,  draw: drawEmber },
  cosmos: { init: initCosmos, draw: drawCosmos },
}

const SCENE_LABELS = {
  flow: 'FLOW', silk: 'SILK', prism: 'PRISM', drift: 'DRIFT', void: 'VOID',
  signal: 'SIGNAL', bloom: 'BLOOM', ember: 'EMBER', cosmos: 'COSMOS',
}

// ── Component ────────────────────────────────────────────────────────────────
export function NowPlayingBanner({
  playlist,
  isPaused,
  onPlayPause,
  onStop,
  onPrev,
  onNext,
  canPrev,
  canNext,
  volume,
  onVolumeChange,
  trackIndex = 0,
}) {
  const canvasRef  = useRef(null)
  const pausedRef  = useRef(isPaused)
  const sceneId    = detectScene(playlist?.tags, trackIndex)

  useEffect(() => { pausedRef.current = isPaused }, [isPaused])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const W = canvas.width  = canvas.offsetWidth  || 800
    const H = canvas.height = canvas.offsetHeight || 280
    const ctx = canvas.getContext('2d')
    const scene = SCENES[sceneId]
    const state = scene.init(W, H)
    let raf

    const tick = () => {
      scene.draw(ctx, W, H, state, pausedRef.current)
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [sceneId])

  return (
    <div className={styles.banner}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <span className={styles.sceneBadge}>{SCENE_LABELS[sceneId]}</span>
      <div className={styles.content}>
        <div className={styles.trackInfo}>
          {playlist.artworkUrl && (
            <img src={playlist.artworkUrl} alt={playlist.title} className={styles.thumb} />
          )}
          <div className={styles.meta}>
            <span className={styles.title}>{playlist.title}</span>
            {playlist.artist && <span className={styles.artist}>{playlist.artist}</span>}
          </div>
        </div>
        <div className={styles.controls}>
          <button className={styles.ctrlBtn} onClick={onPrev} disabled={!canPrev} aria-label="이전">⏮</button>
          <button className={`${styles.ctrlBtn} ${styles.playBtn}`} onClick={onPlayPause} aria-label={isPaused ? '재생' : '일시정지'}>
            {isPaused ? '▶' : '⏸'}
          </button>
          <button className={styles.ctrlBtn} onClick={onNext} disabled={!canNext} aria-label="다음">⏭</button>
          <button className={styles.ctrlBtn} onClick={onStop} aria-label="정지">■</button>
          <div className={styles.volumeWrap}>
            <span className={styles.volumeIcon} aria-label="볼륨">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77 0-4.28-2.99-7.86-7-8.77z"/>
              </svg>
            </span>
            <input
              type="range" min="0" max="1" step="0.05"
              value={volume}
              onChange={e => onVolumeChange(Number(e.target.value))}
              className={styles.volumeSlider}
              aria-label="볼륨 조절"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
