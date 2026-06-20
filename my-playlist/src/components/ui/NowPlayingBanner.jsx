import { useRef, useEffect, useMemo } from 'react'
import styles from './NowPlayingBanner.module.css'

// ── BPM Inference ────────────────────────────────────────────────────────────
function inferBPM(tags, title) {
  const str = [...(tags || []), title || ''].join(' ').toLowerCase()
  if (/edm|house|techno|trance|드럼앤베이스/.test(str)) return 134
  if (/trap|힙합|hip.hop|랩/.test(str)) return 88
  if (/재즈|jazz|로파이|lo.fi|카페|스윙/.test(str)) return 96
  if (/록|rock|메탈|metal|펑크/.test(str)) return 130
  if (/발라드|ballad|어쿠|acoustic|포크|folk|힐링/.test(str)) return 76
  if (/소울|soul|r&b/.test(str)) return 102
  if (/신스|synth|레트로|retro|일렉트로|80/.test(str)) return 120
  if (/팝|pop|인디|indie/.test(str)) return 116
  if (/클래식|classical/.test(str)) return 88
  return 108
}

// ── Scene Detection ──────────────────────────────────────────────────────────
const TAG_MAP = [
  [/전자|일렉|EDM|클럽|테크노|ambient|앰비/i,   'flow'],
  [/소울|R&B|부드|감미|실크|neo.soul|팝/i,      'silk'],
  [/인디|밝|경쾌|청량|화사|선명|팝/i,           'prism'],
  [/재즈|jazz|로파이|카페|잔잔|차분|스윙/i,     'pop'],
  [/힙합|랩|트랩|다크|어두|인더스/i,           'void'],
  [/시티팝|city.pop|야경|야간크루징|쇼와/i,      'riso'],
  [/신스|레트로|사이버|도시|네온|80/i,          'signal'],
  [/어쿠|포크|자연|힐링|숲|봄|풀/i,            'bloom'],
  [/열정|강렬|파워|드라이브|업템포|신나/i,      'ember'],
  [/우주|새벽|몽환|신비|꿈|서사|코스모/i,       'cosmos'],
  [/댄스|케이팝|K팝|kpop|파티|dance|걸그|보이그/i, 'dancer'],
]

const SCENE_KEYS = ['flow', 'silk', 'prism', 'pop', 'void', 'signal', 'bloom', 'ember', 'cosmos', 'dancer', 'riso']
const N = SCENE_KEYS.length

// LCG-based Fisher-Yates shuffle — deterministic per seed
function seededShuffle(arr, seed) {
  const a = [...arr]
  let s = (seed ^ 0xdeadbeef) >>> 0
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    const j = s % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function detectScene(tags = [], idx = 0) {
  const str = (tags || []).join(' ')
  // Multiplier 4 is coprime with 9: visits all 9 scenes without consecutive repeats
  // Cycle shift adds 3 after each full rotation so track 9 starts on a different scene than track 0
  const rot = (idx * 4) % N
  const cycleShift = Math.floor(idx / N) * 3
  for (const [rx, scene] of TAG_MAP) {
    if (rx.test(str)) {
      const base = SCENE_KEYS.indexOf(scene)
      return SCENE_KEYS[(base + rot + cycleShift) % N]
    }
  }
  return SCENE_KEYS[(rot + cycleShift + 2) % N]
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
function initFlow(W, H, opts = {}) {
  return {
    t: 0,
    speedMult: opts.speedMult ?? 1,
    colorSeed: opts.colorSeed ?? 0,
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

function drawFlow(ctx, W, H, st, paused, beat = 0) {
  const sp = (paused ? 0.06 : 0.55 + beat * 0.35) * st.speedMult
  st.t += sp
  const T = st.t

  ctx.fillStyle = 'rgba(3, 6, 16, 0.02)'
  ctx.fillRect(0, 0, W, H)

  const palHue = (st.paletteSeed + st.colorSeed + T * 0.12) % 360

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
      const a = Math.min(p.life / p.maxLife, 1) * (0.19 + beat * 0.12)
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
function initSilk(W, H, opts = {}) {
  const cols = 50, rows = 24
  return {
    t: 0, cols, rows,
    speedMult: opts.speedMult ?? 1,
    colorSeed: opts.colorSeed ?? 0,
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

function drawSilk(ctx, W, H, st, paused, beat = 0) {
  const sp = (paused ? 0.05 : 0.48) * st.speedMult
  st.t += sp
  const T = st.t
  const ampMult = 1 + beat * 0.55

  ctx.fillStyle = 'rgba(4, 2, 10, 1)'
  ctx.fillRect(0, 0, W, H)

  const { cols, rows, grid } = st
  const pos = (r, c) => {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return null
    const g = grid[r][c]
    const dv =
      Math.sin(g.bx * 0.006 + T * g.f * 0.018 + g.ph) * g.amp * ampMult +
      Math.cos(g.by * 0.009 + T * g.f * 0.013) * g.amp * 0.42 * ampMult +
      Math.sin((g.bx + g.by) * 0.004 + T * 0.009) * g.amp * 0.26 * ampMult
    return { x: g.bx, y: g.by + dv }
  }

  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const tl = pos(r, c), tr = pos(r, c + 1)
      const bl = pos(r + 1, c), br = pos(r + 1, c + 1)
      if (!tl || !tr || !bl || !br) continue

      const dy = bl.y - tl.y
      const norm = Math.atan2(dy, W / cols * 2.5)
      const hue = (norm * 230 / Math.PI + c * 7 + T * 0.38 + 200 + st.colorSeed) % 360
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
  const spec = ctx.createRadialGradient(sx, sy, 0, sx, sy, W * (0.42 + beat * 0.10))
  spec.addColorStop(0, 'rgba(255,255,255,0.16)')
  spec.addColorStop(0.35, 'rgba(255,255,255,0.04)')
  spec.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = spec
  ctx.fillRect(0, 0, W, H)
}

// ── PRISM ─────────────────────────────────────────────────────────────────────
// Crystal geometry — chromatic aberration + diffraction rays
function initPrism(W, H, opts = {}) {
  const n = 7
  return {
    t: 0,
    speedMult: opts.speedMult ?? 1,
    colorSeed: opts.colorSeed ?? 0,
    verts: Array.from({ length: n }, (_, i) => ({
      angle: (i / n) * Math.PI * 2,
      r: W * 0.2 + Math.random() * W * 0.08,
      spd: (0.003 + Math.random() * 0.004) * (Math.random() < 0.5 ? 1 : -1),
    })),
  }
}

function drawPrism(ctx, W, H, st, paused, beat = 0) {
  const sp = (paused ? 0.05 : 0.5) * st.speedMult
  st.t += sp
  const T = st.t

  ctx.fillStyle = `rgba(2, 2, 8, ${paused ? 0.38 : 0.22})`
  ctx.fillRect(0, 0, W, H)

  const cx = W * 0.5, cy = H * 0.5
  const bScale = 1 + beat * 0.15
  const pts = st.verts.map(v => ({
    x: cx + Math.cos(v.angle + T * v.spd) * v.r * bScale,
    y: cy + Math.sin(v.angle + T * v.spd * 0.72) * v.r * 0.55 * bScale,
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
    const hue = (i / n) * 300 + T * 0.22 + st.colorSeed
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
    ctx.strokeStyle = `hsla(${hue},100%,82%,${(0.20 + beat * 0.25).toFixed(3)})`
    ctx.lineWidth = 1.6; ctx.stroke()
  }
  // diffraction rays from rotating peak vertex
  const peak = pts[Math.floor(T * 0.028) % n]
  for (let r = 0; r < 6; r++) {
    const ang = (r / 6) * Math.PI * 2 + T * 0.009
    const ex = peak.x + Math.cos(ang) * W * 0.45
    const ey = peak.y + Math.sin(ang) * H * 0.45
    const lg = ctx.createLinearGradient(peak.x, peak.y, ex, ey)
    lg.addColorStop(0, `hsla(${r * 60 + T * 0.25},100%,82%,${(0.16 + beat * 0.22).toFixed(3)})`)
    lg.addColorStop(1, `hsla(${r * 60 + T * 0.25},100%,82%,0)`)
    ctx.beginPath(); ctx.moveTo(peak.x, peak.y); ctx.lineTo(ex, ey)
    ctx.strokeStyle = lg; ctx.lineWidth = 1; ctx.stroke()
  }

  ctx.globalCompositeOperation = 'source-over'
  ctx.restore()
}

// ── POP ──────────────────────────────────────────────────────────────────────
// Manet-style paint tiles slowly rising + massive red flower petal burst
function initPop(W, H, opts = {}) {
  const cs = opts.colorSeed ?? 0
  const rects = Array.from({ length: 70 }, (_, i) => {
    const hue = (80 + Math.sin(cs * 0.031 + i * 2.71) * 28 + Math.random() * 45 + 360) % 360
    const sat = 22 + Math.random() * 32
    const lit = 18 + Math.random() * 42
    const alpha = 0.38 + Math.random() * 0.48
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      w: 22 + Math.random() * 68,
      h: 8 + Math.random() * 30,
      angle: (Math.random() - 0.5) * 0.28,
      vy: -(0.22 + Math.random() * 0.42),
      vx: (Math.random() - 0.5) * 0.10,
      c: `hsla(${hue},${sat}%,${lit}%,${alpha.toFixed(2)})`,
    }
  })
  return {
    t: 0, speedMult: opts.speedMult ?? 1, colorSeed: cs,
    rects, flowers: [], nextBurst: 25, lastBurst: 0,
  }
}

function drawPop(ctx, W, H, st, paused, beat = 0) {
  const sp = (paused ? 0.025 : 0.30) * st.speedMult
  st.t += sp
  const T = st.t

  // Dark nature-toned background
  const sh = (st.colorSeed * 0.07 + 108) % 360
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, `hsl(${sh + 48}, 20%, 14%)`)
  bg.addColorStop(0.55, `hsl(${sh + 18}, 26%, 18%)`)
  bg.addColorStop(1,   `hsl(${sh + 5},  34%, 8%)`)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Slowly rising Manet-style paint tiles
  for (const r of st.rects) {
    if (!paused) {
      r.y += r.vy * sp
      r.x += r.vx * sp
      if (r.y + r.h < -8) { r.y = H + 8; r.x = Math.random() * W }
      if (r.x < -r.w - 4) r.x = W + r.w
      else if (r.x > W + r.w + 4) r.x = -r.w
    }
    const c = Math.cos(r.angle), sn = Math.sin(r.angle)
    ctx.setTransform(c, sn, -sn, c, r.x, r.y)
    ctx.fillStyle = r.c
    ctx.fillRect(-r.w * 0.5, -r.h * 0.5, r.w, r.h)
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0)

  // Spawn flower burst — petals spread across full canvas width
  if (!paused && (T >= st.nextBurst || (beat > 0.70 && T - st.lastBurst > 90))) {
    st.lastBurst = T
    const n = 45 + Math.floor(Math.random() * 35)
    for (let i = 0; i < n; i++) {
      st.flowers.push({
        x: W * (0.02 + Math.random() * 0.96),
        y: H * (0.70 + Math.random() * 0.24),
        vx: (Math.random() - 0.5) * 2.2,
        vy: -(14 + Math.random() * 16 + beat * 6),
        r: 6 + Math.random() * 10,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.18,
        hue: 338 + Math.random() * 36,
        life: 1.0,
        decay: 0.004 + Math.random() * 0.004,
      })
    }
    st.nextBurst = T + 160 + Math.random() * 180
  }

  // Update + draw petals
  for (let i = st.flowers.length - 1; i >= 0; i--) {
    const f = st.flowers[i]
    f.vy += 0.062 * sp
    f.vx *= 0.985
    f.x += f.vx * sp
    f.y += f.vy * sp
    f.rot += f.rotV * sp
    f.life -= f.decay * sp
    if (f.life <= 0 || f.y > H + 18) { st.flowers.splice(i, 1); continue }
    const a = Math.max(0, f.life) * 0.92
    ctx.save()
    ctx.translate(f.x, f.y)
    ctx.rotate(f.rot)
    ctx.beginPath()
    ctx.ellipse(0, 0, f.r, f.r * 0.50, 0, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${f.hue},90%,58%,${a.toFixed(3)})`
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(-f.r * 0.16, -f.r * 0.14, f.r * 0.35, f.r * 0.20, 0, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255,200,200,${(a * 0.40).toFixed(3)})`
    ctx.fill()
    ctx.restore()
  }
}


// ── VOID ─────────────────────────────────────────────────────────────────────
// Dark matter: stars spiral into a gravitational singularity
function initVoid(W, H, opts = {}) {
  return {
    t: 0, pulse: 0,
    speedMult: opts.speedMult ?? 1,
    colorSeed: opts.colorSeed ?? 0,
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

function drawVoid(ctx, W, H, st, paused, beat = 0) {
  const sp = (paused ? 0.06 : 0.5) * st.speedMult
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
  const pm = 1 + (0.07 + beat * 0.10) * Math.sin(st.pulse)

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < 3; i++) {
    const rg = ctx.createRadialGradient(cx, cy, 22 + i * 8, cx, cy, 90 + i * 30)
    rg.addColorStop(0, `rgba(${70 + i * 25}, 0, ${180 - i * 20}, ${(0.07 - i * 0.015 + beat * 0.05).toFixed(3)})`)
    rg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H)
  }
  ctx.globalCompositeOperation = 'source-over'
  ctx.restore()

  for (let ring = 0; ring < 3; ring++) {
    ctx.beginPath()
    ctx.arc(cx, cy, (26 + ring * 9) * pm + beat * W * 0.022, 0, Math.PI * 2)
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
function initSignal(W, H, opts = {}) {
  const cs = opts.colorSeed ?? 0
  return {
    t: 0,
    speedMult: opts.speedMult ?? 1,
    colorSeed: cs,
    curves: [
      { fx: 1, fy: 2, hue: (185 + cs) % 360 },
      { fx: 3, fy: 2, hue: (285 + cs) % 360 },
      { fx: 3, fy: 4, hue: (338 + cs) % 360 },
    ],
  }
}

function drawSignal(ctx, W, H, st, paused, beat = 0) {
  const sp = (paused ? 0.06 : 0.5) * st.speedMult
  st.t += sp
  const T = st.t

  ctx.fillStyle = 'rgba(3, 5, 10, 0.24)'
  ctx.fillRect(0, 0, W, H)

  const cx = W * 0.5, cy = H * 0.5
  const rx = W * 0.26, ry = H * 0.39

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'

  for (const c of st.curves) {
    const phase = T * 0.007 + c.fx * 0.4
    const STEPS = 700

    ctx.lineWidth = 1.6 + beat * 1.8
    for (let i = 1; i <= STEPS; i++) {
      const a0 = ((i - 1) / STEPS) * Math.PI * 2
      const a1 = (i / STEPS) * Math.PI * 2
      const x0 = cx + rx * Math.sin(c.fx * a0 + phase)
      const y0 = cy + ry * Math.sin(c.fy * a0)
      const x1 = cx + rx * Math.sin(c.fx * a1 + phase)
      const y1 = cy + ry * Math.sin(c.fy * a1)

      const frac = i / STEPS
      const alpha = Math.min(0.85, Math.sin(frac * Math.PI) * 0.62 + 0.12) * (1 + beat * 0.55)
      const hue = (c.hue + frac * 38) % 360
      ctx.beginPath()
      ctx.moveTo(x0, y0); ctx.lineTo(x1, y1)
      ctx.strokeStyle = `hsla(${hue}, 100%, 56%, ${alpha.toFixed(3)})`
      ctx.stroke()
    }

    // inner luminous core — vivid, saturated
    ctx.lineWidth = 0.5
    for (let i = 1; i <= STEPS; i++) {
      const a0 = ((i - 1) / STEPS) * Math.PI * 2
      const a1 = (i / STEPS) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(cx + rx * Math.sin(c.fx * a0 + phase), cy + ry * Math.sin(c.fy * a0))
      ctx.lineTo(cx + rx * Math.sin(c.fx * a1 + phase), cy + ry * Math.sin(c.fy * a1))
      ctx.strokeStyle = `hsla(${c.hue}, 100%, 74%, 0.35)`
      ctx.stroke()
    }
  }

  ctx.globalCompositeOperation = 'source-over'
  ctx.restore()

  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.18)
  glow.addColorStop(0, `rgba(100,200,255,${(0.18 + beat * 0.28).toFixed(3)})`)
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H)
}

// ── BLOOM ────────────────────────────────────────────────────────────────────
// Fibonacci botanical spiral — organic mathematical growth
function initBloom(W, H, opts = {}) {
  const phi = (1 + Math.sqrt(5)) / 2
  const n = 300
  return {
    t: 0,
    speedMult: opts.speedMult ?? 1,
    colorSeed: opts.colorSeed ?? 0,
    petals: Array.from({ length: n }, (_, i) => {
      const ang = i * Math.PI * 2 / phi
      const dist = Math.sqrt(i / n) * Math.min(W, H) * 0.48
      return {
        ang,
        dist,
        r: 8 + (i / n) * 24,
        hue: 80 + (i / n) * 220,
        t: i * 0.018,
      }
    }),
  }
}

function drawBloom(ctx, W, H, st, paused, beat = 0) {
  const sp = (paused ? 0.04 : 0.4) * st.speedMult
  st.t += sp
  const T = st.t
  const cx = W * 0.5, cy = H * 0.5

  ctx.fillStyle = 'rgba(4, 8, 6, 0.20)'
  ctx.fillRect(0, 0, W, H)

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'

  const rot = T * 0.0038
  for (const p of st.petals) {
    const breathe = 0.88 + (0.12 + beat * 0.10) * Math.sin(T * 0.016 + p.t)
    const bx = cx + Math.cos(p.ang + rot) * p.dist * breathe
    const by = cy + Math.sin(p.ang + rot) * p.dist * 0.58 * breathe

    // modulo 260 then +80 → hue stays 80°–339°, never hits red zone
    const hue = ((p.hue + T * 0.14 + st.colorSeed) % 260 + 80)
    const a = Math.max(0.01, 0.09 + (0.06 + beat * 0.05) * Math.sin(T * 0.022 + p.t))

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
  cg.addColorStop(0, `hsla(${(65 + T * 0.28 + st.colorSeed) % 360}, 90%, 82%, ${(0.20 + beat * 0.24).toFixed(3)})`)
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

function initEmber(W, H, opts = {}) {
  return {
    t: 0,
    speedMult: opts.speedMult ?? 1,
    colorSeed: opts.colorSeed ?? 0,
    particles: Array.from({ length: 240 }, () => mkEmberPtcl(W, H)),
  }
}

function drawEmber(ctx, W, H, st, paused, beat = 0) {
  const sp = (paused ? 0.1 : 1.0 + beat * 0.6) * st.speedMult
  st.t += sp
  const T = st.t

  ctx.fillStyle = `rgba(8, 3, 1, ${paused ? 0.38 : 0.16})`
  ctx.fillRect(0, 0, W, H)

  const heat = ctx.createRadialGradient(W * 0.5, H * 0.84, 0, W * 0.5, H * 0.84, W * 0.42)
  heat.addColorStop(0, `rgba(255,90,10,${(0.28 + 0.08 * Math.sin(T * 0.045) + beat * 0.16).toFixed(3)})`)
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
      ctx.shadowBlur = p.r * (3.5 + beat * 4); ctx.shadowColor = `hsla(${p.hue},100%,60%,0.5)`
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
// Small particles: drift freely → converge to cylinder → disperse outward → repeat
function initCosmos(W, H, opts = {}) {
  const N = 200
  const particles = Array.from({ length: N }, (_, i) => ({
    rx: W * (0.04 + Math.random() * 0.92),
    ry: H * (0.04 + Math.random() * 0.92),
    ca: (i / N) * Math.PI * 2 + (Math.random() - 0.5) * 0.18,
    ch: (Math.random() - 0.5) * 0.90,
    ph1: Math.random() * Math.PI * 6,
    ph2: Math.random() * Math.PI * 6,
    dvx: 0.003 + Math.random() * 0.004,
    dvy: 0.002 + Math.random() * 0.003,
    x: 0, y: 0,
    hue: 188 + Math.random() * 102,
    r: 1.2 + Math.random() * 2.2,
  }))
  for (const p of particles) { p.x = p.rx; p.y = p.ry }
  return {
    t: 0, cycleT: 0,
    speedMult: opts.speedMult ?? 1,
    colorSeed: opts.colorSeed ?? 0,
    particles, cylRot: 0,
  }
}

function drawCosmos(ctx, W, H, st, paused, beat = 0) {
  const sp = (paused ? 0.04 : 0.5) * st.speedMult
  st.t += sp
  st.cycleT += sp * (0.0022 + beat * 0.001)
  st.cylRot += sp * 0.016
  const T = st.t
  const CYC = st.cycleT % 1
  const cx = W * 0.5, cy = H * 0.5
  const CYL_R = W * 0.13
  const CYL_H = H * 0.44
  const ease = f => f < 0.5 ? 2*f*f : 1 - 2*(1-f)**2

  const bg = ctx.createRadialGradient(cx, cy * 0.8, 0, cx, cy, Math.max(W, H))
  bg.addColorStop(0, '#0e0525')
  bg.addColorStop(0.6, '#060216')
  bg.addColorStop(1, '#020109')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'

  for (const p of st.particles) {
    const cylX = cx + Math.cos(p.ca + st.cylRot) * CYL_R
    const cylY = cy + p.ch * CYL_H
    const driftX = p.rx + Math.sin(T * p.dvx + p.ph1) * W * 0.055
    const driftY = p.ry + Math.cos(T * p.dvy + p.ph2) * H * 0.055

    let tx, ty, alpha

    if (CYC < 0.35) {
      tx = driftX; ty = driftY
      alpha = 0.40 + 0.22 * (CYC / 0.35)
    } else if (CYC < 0.58) {
      const f = ease((CYC - 0.35) / 0.23)
      tx = driftX + (cylX - driftX) * f
      ty = driftY + (cylY - driftY) * f
      alpha = 0.62 + 0.38 * f
    } else if (CYC < 0.74) {
      tx = cylX; ty = cylY
      const depth = (Math.cos(p.ca + st.cylRot) + 1) * 0.5
      alpha = 0.28 + 0.72 * depth
    } else {
      const f = ease((CYC - 0.74) / 0.26)
      const outX = cx + (p.rx - cx) * 1.32
      const outY = cy + (p.ry - cy) * 1.32
      tx = cylX + (outX - cylX) * f
      ty = cylY + (outY - cylY) * f
      alpha = 1.0 - f * 0.55
    }

    p.x += (tx - p.x) * (0.09 + beat * 0.04)
    p.y += (ty - p.y) * (0.09 + beat * 0.04)

    const hue = (p.hue + st.colorSeed + T * 0.07) % 360
    const a = alpha * (0.88 + beat * 0.14)

    // Outer soft halo
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (3.8 + beat * 1.6), 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${hue},85%,62%,${(a * 0.07).toFixed(3)})`; ctx.fill()
    // Glow ring
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 2.0, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${hue},90%,68%,${(a * 0.30).toFixed(3)})`; ctx.fill()
    // Bright core dot
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${hue},100%,88%,${(alpha * 0.92).toFixed(3)})`; ctx.fill()
  }

  ctx.restore()
}

// ── RISO ─────────────────────────────────────────────────────────────────────
// City pop / AKIRA risograph print — 2-3 flat ink plates, speed lines, city night
function initRiso(W, H, opts = {}) {
  const cs = opts.colorSeed ?? 0
  // Deterministic building layout from colorSeed (no Math.random() in init)
  const bldgs = Array.from({ length: 11 }, (_, i) => ({
    x0: (W / 11) * i + Math.sin(cs * 0.017 + i * 3.71) * W * 0.028,
    w:  W * 0.07 + Math.abs(Math.sin(cs * 0.029 + i * 2.13)) * W * 0.07,
    h:  H * (0.22 + Math.abs(Math.sin(cs * 0.043 + i * 1.47)) * 0.52),
    winPh: Math.abs(Math.sin(cs * 0.011 + i * 7.31)) * Math.PI * 6,
  }))
  return { t: 0, speedMult: opts.speedMult ?? 1, colorSeed: cs, bldgs }
}

function drawRiso(ctx, W, H, st, paused, beat = 0) {
  const sp = (paused ? 0.025 : 0.34) * st.speedMult
  st.t += sp
  const T = st.t
  const cs = st.colorSeed

  // Ink colors — vivid flat, no gradient feel
  const H1 = (cs + 308) % 360  // magenta-red plate
  const H2 = (cs + 168) % 360  // cyan-blue plate
  const H3 = (cs + 52)  % 360  // yellow-orange accent

  // Night sky background
  ctx.fillStyle = '#040108'
  ctx.fillRect(0, 0, W, H)

  // Scanline texture (old anime TV feel)
  ctx.fillStyle = 'rgba(0,0,0,0.09)'
  for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1)

  // Slow city pan
  const panX = Math.sin(T * 0.009) * W * 0.016

  // === PLATE 1: Color 1 buildings (offset right+down) ===
  ctx.fillStyle = `hsl(${H1}, 84%, 42%)`
  for (const b of st.bldgs) {
    ctx.fillRect(b.x0 + panX + 4, H - b.h + 3, b.w, b.h)
  }

  // === PLATE 2: Color 2 buildings (offset left+up) — screen blend for overlap ===
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.fillStyle = `hsl(${H2}, 80%, 36%)`
  for (const b of st.bldgs) {
    ctx.fillRect(b.x0 + panX - 3, H - b.h * 0.96 - 2, b.w, b.h * 0.96)
  }
  ctx.restore()

  // === SPEED LINES from focal point (AKIRA motorcycle) ===
  const fx = W * (0.50 + 0.07 * Math.sin(T * 0.018))
  const fy = H * (0.26 + 0.04 * Math.cos(T * 0.024))
  const lineLen = Math.sqrt(W * W + H * H) * 0.75

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const lineAlpha = 0.10 + beat * 0.24
  for (let i = 0; i < 48; i++) {
    const ang = (i / 48) * Math.PI * 2 + T * 0.005
    const s = 6 + beat * 18
    const e = lineLen * (0.46 + beat * 0.32)
    ctx.beginPath()
    ctx.moveTo(fx + Math.cos(ang) * s, fy + Math.sin(ang) * s)
    ctx.lineTo(fx + Math.cos(ang) * e, fy + Math.sin(ang) * e)
    ctx.strokeStyle = `hsla(${(H3 + i * 2) % 360}, 92%, 68%, ${lineAlpha.toFixed(3)})`
    ctx.lineWidth = 0.7
    ctx.stroke()
  }
  ctx.restore()

  // === WINDOW LIGHTS ===
  for (const b of st.bldgs) {
    const rows = Math.max(2, Math.floor(b.h / 22))
    const cols = Math.max(1, Math.floor(b.w / 11))
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols; c++) {
        const on = Math.sin(b.winPh + r * 0.78 + c * 1.62 + T * 0.07) > 0.38
        if (on) {
          const wx = b.x0 + panX + c * 11 + 5
          const wy = H - b.h + r * 22 + 8
          ctx.fillStyle = `hsla(${(H3 + r * 18 + c * 11) % 360}, 88%, 74%, ${0.52 + beat * 0.3})`
          ctx.fillRect(wx, wy, 4, 7)
        }
      }
    }
  }

  // === FILM GRAIN (rough print texture) — animated static ===
  for (let i = 0; i < 180; i++) {
    const gx = (Math.random() * W) | 0
    const gy = (Math.random() * H) | 0
    ctx.fillStyle = i % 3 === 0
      ? `rgba(255,240,210,0.030)` : `rgba(10,5,20,0.045)`
    ctx.fillRect(gx, gy, 1, 1)
  }

  // === BEAT OVERLAY ===
  if (beat > 0.22) {
    ctx.fillStyle = `hsla(${H1}, 90%, 60%, ${(beat * 0.10).toFixed(3)})`
    ctx.fillRect(0, 0, W, H)
  }
}

// ── DANCER ────────────────────────────────────────────────────────────────────
// LED concert wall — dancer silhouette lit up on a dot-matrix grid

// Joint positions in S-units from dancer center (cx, cy). 6 dance poses.
const DANCER_POSES = [
  { // 0: V-arms up, straight legs
    head:[0,-4.2], neck:[0,-2.8], lS:[-1.1,-2.8], lE:[-2.2,-4.0], lH:[-3.0,-5.4],
    rS:[1.1,-2.8], rE:[2.2,-4.0], rH:[3.0,-5.4],
    hip:[0,0], lHip:[-0.7,0.2], lK:[-0.8,2.2], lF:[-0.9,4.5],
    rHip:[0.7,0.2], rK:[0.8,2.2], rF:[0.9,4.5] },
  { // 1: Right arm up, left arm out low, left leg kick horizontal
    head:[0.4,-4.0], neck:[0.3,-2.8], lS:[-0.9,-2.8], lE:[-2.2,-0.1], lH:[-3.8,0.8],
    rS:[1.4,-2.8], rE:[1.1,-4.0], rH:[0.6,-5.6],
    hip:[0,0], lHip:[-0.7,0.2], lK:[-2.2,1.2], lF:[-4.2,0.8],
    rHip:[0.7,0.2], rK:[0.8,2.2], rF:[0.9,4.5] },
  { // 2: Both arms diagonal (up-left, down-right), legs wide
    head:[-0.2,-4.2], neck:[-0.1,-2.8], lS:[-1.2,-2.8], lE:[-2.6,-3.8], lH:[-4.0,-5.0],
    rS:[1.2,-2.8], rE:[2.6,1.0], rH:[4.0,3.0],
    hip:[0,0], lHip:[-0.7,0.2], lK:[-1.8,2.0], lF:[-2.4,4.2],
    rHip:[0.7,0.2], rK:[1.8,2.0], rF:[2.4,4.2] },
  { // 3: Club wave — arms angled up, right knee raised
    head:[0.5,-3.8], neck:[0.4,-2.8], lS:[-0.7,-2.8], lE:[0.0,-3.8], lH:[1.2,-5.2],
    rS:[1.5,-2.8], rE:[2.4,-3.5], rH:[3.2,-4.8],
    hip:[0,0], lHip:[-0.7,0.2], lK:[-0.5,2.5], lF:[-0.4,4.8],
    rHip:[0.7,0.2], rK:[2.0,1.2], rF:[2.4,-0.8] },
  { // 4: Breakdown crouch — arms low, knees wide
    head:[0.1,-3.2], neck:[0.1,-2.2], lS:[-1.0,-2.2], lE:[-1.8,0.8], lH:[-2.6,2.5],
    rS:[1.0,-2.2], rE:[1.8,0.8], rH:[2.6,2.5],
    hip:[0,0.8], lHip:[-0.8,1.0], lK:[-2.0,2.6], lF:[-2.2,4.6],
    rHip:[0.8,1.0], rK:[2.0,2.6], rF:[2.2,4.6] },
  { // 5: Pop star — left arm wide horizontal, right arm up, right leg back-kick
    head:[-0.3,-4.2], neck:[-0.2,-2.8], lS:[-1.2,-2.8], lE:[-3.0,-0.4], lH:[-4.6,-0.4],
    rS:[1.2,-2.8], rE:[1.5,-4.0], rH:[1.2,-5.6],
    hip:[0,0], lHip:[-0.7,0.2], lK:[-0.8,2.2], lF:[-1.0,4.5],
    rHip:[0.7,0.2], rK:[1.6,0.8], rF:[1.2,-1.8] },
]

function _distSeg(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1
  const len2 = dx * dx + dy * dy
  if (len2 < 1) return Math.hypot(px - x1, py - y1)
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2))
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
}

// dancerCx: custom horizontal center for each dancer (default W*0.5)
function _buildCaps(W, H, pa, pb, et, dancerCx) {
  const S = H / 10, cx = dancerCx ?? W * 0.5, cy = H * 0.56
  const L = k => {
    const [ax, ay] = pa[k], [bx, by] = pb[k]
    return [cx + (ax + (bx - ax) * et) * S, cy + (ay + (by - ay) * et) * S]
  }
  const [hx, hy] = L('head'), [nx, ny] = L('neck'), [hpx, hpy] = L('hip')
  const seg = (k1, k2, r) => { const [x1,y1]=L(k1),[x2,y2]=L(k2); return {x1,y1,x2,y2,r,t:'s'} }
  return [
    { cx:hx, cy:hy, r:S*0.82, t:'c' },
    { x1:nx,y1:ny, x2:hpx,y2:hpy, r:S*0.40, t:'s' },
    seg('lS','lE',S*0.32), seg('lE','lH',S*0.28),
    seg('rS','rE',S*0.32), seg('rE','rH',S*0.28),
    seg('lHip','lK',S*0.38), seg('lK','lF',S*0.33),
    seg('rHip','rK',S*0.38), seg('rK','rF',S*0.33),
  ]
}

function _hitCaps(px, py, caps) {
  for (const c of caps) {
    if (c.t === 'c') { if (Math.hypot(px - c.cx, py - c.cy) <= c.r) return true }
    else { if (_distSeg(px, py, c.x1, c.y1, c.x2, c.y2) <= c.r) return true }
  }
  return false
}

function initDancer(W, H, opts = {}) {
  const COLS = 88, ROWS = 27
  const cw = W / COLS, ch = H / ROWS
  return {
    t: 0, COLS, ROWS, cw, ch,
    r: Math.min(cw, ch) * 0.34,
    speedMult: opts.speedMult ?? 1,
    colorSeed: opts.colorSeed ?? 0,
    poseIdx: 0, poseT: 0,
    // 3 dancers with phase offsets
    dxs: [W * 0.18, W * 0.50, W * 0.82],
    leds: Array.from({ length: COLS * ROWS }, (_, i) => ({
      x: cw * (i % COLS + 0.5),
      y: ch * (Math.floor(i / COLS) + 0.5),
    })),
  }
}

function drawDancer(ctx, W, H, st, paused, beat = 0) {
  const sp = (paused ? 0.03 : 0.45) * st.speedMult
  st.t += sp
  st.poseT += sp * 0.016

  if (st.poseT >= 1) {
    st.poseT -= 1
    st.poseIdx = (st.poseIdx + 1) % DANCER_POSES.length
  }

  const T = st.t
  const N_POSES = DANCER_POSES.length
  const OFFSETS = [0, 0.34, 0.67]

  // Build capsules for each of the 3 dancers (each at a different pose phase)
  const allCaps = st.dxs.map((dancerCx, di) => {
    const rawT = st.poseT + OFFSETS[di]
    const adjT = rawT % 1
    const pIdx = (st.poseIdx + Math.floor(rawT)) % N_POSES
    const pIdx2 = (pIdx + 1) % N_POSES
    const et = adjT < 0.5 ? 2 * adjT * adjT : 1 - 2 * (1 - adjT) ** 2
    return _buildCaps(W, H, DANCER_POSES[pIdx], DANCER_POSES[pIdx2], et, dancerCx)
  })

  ctx.fillStyle = '#030108'
  ctx.fillRect(0, 0, W, H)

  const { leds, r } = st
  const dH = (st.colorSeed + T * 0.22) % 360

  // Classify LEDs
  const bright = [], dim = []
  for (const led of leds) {
    let hit = false
    for (const caps of allCaps) { if (_hitCaps(led.x, led.y, caps)) { hit = true; break } }
    if (hit) bright.push(led)
    else dim.push(led)
  }

  // Dim (off) LEDs
  ctx.fillStyle = `hsl(${dH}, 16%, 6%)`
  for (const { x, y } of dim) {
    ctx.beginPath(); ctx.arc(x, y, r * 0.50, 0, Math.PI * 2); ctx.fill()
  }

  // Additive glow for lit LEDs
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (const { x, y } of bright) {
    const h = (dH + (x / W) * 55 + (y / H) * 20) % 360
    ctx.beginPath(); ctx.arc(x, y, r * (2.8 + beat * 0.7), 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${h}, 100%, 65%, ${(0.055 + beat * 0.06).toFixed(3)})`
    ctx.fill()
  }
  ctx.restore()

  // Lit LED cores
  for (const { x, y } of bright) {
    const h = (dH + (x / W) * 55 + (y / H) * 20) % 360
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = `hsl(${h}, 96%, 74%)`
    ctx.fill()
    ctx.beginPath(); ctx.arc(x, y, r * 0.36, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.82)'
    ctx.fill()
  }
  if (beat > 0.4) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.fillStyle = `rgba(255,255,255,${(beat * 0.05).toFixed(3)})`
    ctx.fillRect(0, 0, W, H)
    ctx.restore()
  }
}

// ── Scene Registry ───────────────────────────────────────────────────────────
const SCENES = {
  flow:   { init: initFlow,   draw: drawFlow },
  silk:   { init: initSilk,   draw: drawSilk },
  prism:  { init: initPrism,  draw: drawPrism },
  pop:    { init: initPop,    draw: drawPop },
  void:   { init: initVoid,   draw: drawVoid },
  signal: { init: initSignal, draw: drawSignal },
  bloom:  { init: initBloom,  draw: drawBloom },
  ember:  { init: initEmber,  draw: drawEmber },
  cosmos: { init: initCosmos, draw: drawCosmos },
  dancer: { init: initDancer, draw: drawDancer },
  riso:   { init: initRiso,   draw: drawRiso },
}

const SCENE_LABELS = {
  flow: 'FLOW', silk: 'SILK', prism: 'PRISM', pop: 'GARDEN', void: 'VOID',
  signal: 'SIGNAL', bloom: 'BLOOM', ember: 'EMBER', cosmos: 'COSMOS',
  dancer: 'DANCER', riso: 'RISO',
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
  loop = false,
  onLoopToggle,
  analyser,   // analyserRef from useAudio — real-time frequency data
  queueSeed,  // stable seed per playlist — drives scene shuffle
}) {
  const canvasRef   = useRef(null)
  const pausedRef   = useRef(isPaused)
  const freqDataRef = useRef(null)
  const beatCtrRef  = useRef(0)
  const bpmRef      = useRef(108)
  const sceneOrder = useMemo(() => seededShuffle(SCENE_KEYS, queueSeed ?? 1), [queueSeed])
  const sceneId    = sceneOrder[trackIndex % N]
  const bpm        = inferBPM(playlist?.tags, playlist?.title)
  const speedMult  = bpm / 108
  const colorSeed  = (trackIndex * 73 + Math.floor(bpm / 10)) % 360

  useEffect(() => { pausedRef.current = isPaused }, [isPaused])
  useEffect(() => { bpmRef.current = bpm; beatCtrRef.current = 0 }, [bpm])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const W = canvas.width  = canvas.offsetWidth  || 800
    const H = canvas.height = canvas.offsetHeight || 280
    const ctx = canvas.getContext('2d')
    const scene = SCENES[sceneId]
    const state = scene.init(W, H, { speedMult, colorSeed })
    let raf

    function getBeat() {
      const a = analyser?.current
      if (a) {
        if (!freqDataRef.current || freqDataRef.current.length !== a.frequencyBinCount) {
          freqDataRef.current = new Uint8Array(a.frequencyBinCount)
        }
        a.getByteFrequencyData(freqDataRef.current)
        const d = freqDataRef.current
        let bass = 0
        for (let i = 0; i < 5; i++) bass += d[i]
        return Math.min(1, Math.pow(bass / (5 * 210), 1.6))
      }
      // BPM pseudo-beat fallback
      beatCtrRef.current += pausedRef.current ? 0.2 : 1
      const beatLen = 3600 / bpmRef.current
      const phase = (beatCtrRef.current % beatLen) / beatLen
      return phase < 0.12 ? (1 - phase / 0.12) ** 2 : 0
    }

    const tick = () => {
      const beat = getBeat()
      scene.draw(ctx, W, H, state, pausedRef.current, beat)
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [sceneId, speedMult, colorSeed])

  return (
    <div className={styles.banner}>
      <canvas ref={canvasRef} className={styles.canvas} />
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
            <button
              className={`${styles.ctrlBtn} ${loop ? styles.loopActive : ''}`}
              onClick={onLoopToggle}
              aria-label={loop ? '반복 해제' : '반복 재생'}
            >
              {loop ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" opacity="0.45"/>
                  <line x1="3.5" y1="20.5" x2="20.5" y2="3.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
