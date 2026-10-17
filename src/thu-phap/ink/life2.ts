import { R, arc, dab, ends, fract, lift, rng } from './kit'
import type { Life, Put } from './life'
import { willowCrown } from './motifs2'
import type { Anchor } from './scene'
import { SON, dot, leaf, type Pt } from './stroke'

/**
 * Vật sống cho các chương sau. Gió cuộn (c.wind −1..1, c.gust dồn theo thời gian) là "tay" của người xem:
 * cuộn nhanh thì mưa xiên, đèn lồng đung đưa, khói và sợi liễu ngả, lá bị hắt ngang, buồm căng, diều giật dây.
 */

// Mưa xiên rơi trong khung; giọt chạm mặt nước thành vòng gợn.
function rain(put: Put, a: Anchor, c: Life) {
  const r = rng(a.seed * 19 + 7), u = c.u
  const sx = Math.max(-1.2, Math.min(1.2, 0.22 + 0.9 * c.wind))
  for (let i = 0, n = Math.min(90, Math.round((a.w * a.h) / (14 * u * u))); i < n; i++) {
    const k = fract(r() + c.t / R(r, 0.9, 1.4)), L = R(r, 1.6, 2.6) * u
    const x = a.x + fract(r() + (sx * k * a.h + c.gust * 0.4) / a.w) * a.w, y = a.y + k * a.h
    put({ pts: [[x, y], [x + sx * L, y + L]], w: 0.035 * u, press: leaf, a: 0.32 * ends(k) })
  }
  for (let i = 0, m = Math.round(a.w / (5 * u)); i < m; i++) {
    const k = fract(r() + c.t / R(r, 1.1, 1.7)), cx = a.x + r() * a.w, cy = a.y + a.h * R(r, 0.9, 1)
    const rx = (0.3 + 1.3 * k) * u, ry = rx * 0.3, al = 0.4 * (1 - k)
    put({ pts: arc(cx, cy, rx, ry, 0.1 * Math.PI, 0.9 * Math.PI, 6), w: 0.06 * u, press: leaf, a: al })
    put({ pts: arc(cx, cy, rx, ry, 1.15 * Math.PI, 1.85 * Math.PI, 6), w: 0.04 * u, press: leaf, a: al * 0.6 })
  }
}

// Lá tre / lá liễu rơi: lộn vòng (bề ngang co giãn như lá lật), gió hắt ngang.
function leaves(put: Put, a: Anchor, c: Life) {
  const r = rng(a.seed * 23 + 9), u = c.u
  for (let i = 0, n = Math.max(3, Math.round((a.w * a.h) / (90 * u * u))); i < n; i++) {
    const k = fract(r() + c.t / R(r, 8, 14)), ph = r() * 6, s = R(r, 0.5, 0.8) * u
    const x = a.x + fract(r() + (Math.sin(c.t * 0.7 + ph) * 1.8 * u + c.gust * 1.3) / a.w) * a.w, y = a.y + k * a.h
    const th = Math.sin(c.t * 1.3 + ph) * 1.1 + ph, dx = Math.cos(th) * s, dy = Math.sin(th) * s * 0.55
    const flip = 0.35 + 0.65 * Math.abs(Math.cos(c.t * 2 + ph))
    put({ pts: [[x - dx, y - dy], [x + dx * 0.2, y + dy * 0.2 - 0.12 * s], [x + dx, y + dy]], w: 0.22 * u * flip, press: leaf, a: 0.6 * ends(k), wet: 0.2 })
  }
}

// Dây đèn lồng son vồng ngang khung; mỗi đèn là một con lắc, gió cuộn đẩy cả dây nghiêng.
function lanterns(put: Put, a: Anchor, c: Life) {
  const r = rng(a.seed * 29 + 3), u = c.u
  const rope = (q: number): Pt => [a.x + q * a.w, a.y + 0.72 * a.h * q * (1 - q)]
  put({ pts: [0, 0.2, 0.4, 0.6, 0.8, 1].map(rope), w: 0.05 * u, press: leaf, a: 0.55 * a.tone })
  for (let i = 0, n = Math.max(2, Math.round(a.w / (6 * u))); i < n; i++) {
    const h = rope((i + 0.5) / n), L = R(r, 0.8, 2) * u, ph = r() * 6, rx = R(r, 0.75, 0.95) * u, ry = rx * 1.3
    const ang = 0.07 * Math.sin(c.t * 1.2 + ph) + 0.35 * c.wind, sn = Math.sin(ang), cs = Math.cos(ang)
    // Toạ độ trong hệ của đèn: dy dọc dây xuống, dx ngang.
    const P = (dx: number, dy: number): Pt => [h[0] + dy * sn + dx * cs, h[1] + dy * cs - dx * sn]
    const top = L, mid = L + ry
    put({ pts: [h, P(0, top)], w: 0.03 * u, press: lift, a: 0.7 * a.tone })
    put({ pts: [P(0, top), P(0, top + 2 * ry)], w: rx, press: dot, col: SON, wet: 0.6, a: 0.78 * a.tone, seed: ph * 10 })
    for (const k of [-0.5, 0.5]) put({ pts: [P(0, top + 0.15 * ry), P(k * rx * 1.05, mid), P(0, top + 1.85 * ry)], w: 0.04 * u, press: leaf, a: 0.4 * a.tone })
    for (const y of [top, top + 2 * ry]) put({ pts: [P(-rx * 0.45, y), P(rx * 0.45, y)], w: 0.14 * u, press: lift, a: 0.9 * a.tone })
    for (const k of [-0.15, 0, 0.15]) put({ pts: [P(0, top + 2 * ry), P(k * u, top + 2 * ry + 1.1 * u)], w: 0.03 * u, press: lift, a: 0.65 * a.tone })
  }
}

// Đèn trời bay lên: thân son nhỏ dần khi lên cao, quầng son loang, ngọn lửa chập chờn; gió đẩy ngang.
function rise(put: Put, a: Anchor, c: Life) {
  const r = rng(a.seed * 37 + 1), u = c.u
  for (let i = 0, n = Math.max(3, Math.round((a.w * a.h) / (120 * u * u))); i < n; i++) {
    const k = fract(r() + c.t / R(r, 16, 26)), ph = r() * 6, al = ends(k)
    const x = a.x + fract(r() + (Math.sin(c.t * 0.4 + ph) * 1.2 * u + c.gust * 0.25) / a.w) * a.w, y = a.y + a.h * (1 - k)
    const s = R(r, 0.45, 0.75) * u * (1 - 0.45 * k), flick = 0.8 + 0.2 * Math.sin(c.t * 9 + ph)
    put(dab(x, y, s * 2.2, { col: SON, wet: 1, a: 0.08 * al * flick }))
    put({ pts: [[x, y - s * 0.8], [x, y + s * 0.7]], w: s * 0.7, press: (t) => 1 - 0.35 * t, col: SON, wet: 0.3, a: 0.7 * al })
    put(dab(x, y + s * 0.75, 0.16 * s, { a: 0.85 * al * flick }))
  }
}

// Khói bếp: cuộn khói nở dần, uốn lượn rồi ngả theo gió; một sợi khói mảnh khô đi kèm.
function smoke(put: Put, a: Anchor, c: Life) {
  const u = c.u, bx = a.x + a.w * a.gap, by = a.y + a.h, lean = 0.15 + 0.85 * c.wind
  const X = (q: number, ph: number) => bx + Math.sin(q * 5 + c.t * 0.6 + ph) * q * a.w * 0.16 + lean * q * q * a.w * 0.6
  for (let i = 0; i < 12; i++) {
    const q = fract(i / 12 + c.t * 0.05), rad = (0.4 + 2 * q) * u
    const x = X(q, 0), y = by - q * a.h
    put({ pts: [[x - rad * 0.6, y], [x + rad * 0.6, y - rad * 0.2]], w: rad, press: dot, wet: 1, a: 0.15 * (1 - q) * Math.min(1, q / 0.1) * a.tone })
  }
  const pts = Array.from({ length: 9 }, (_, j): Pt => [X(j / 12, 1.3), by - (j / 12) * a.h])
  put({ pts, w: 0.07 * u, press: (t) => (1 - t) * Math.min(1, t / 0.1), dry: 0.6, a: 0.35 * a.tone })
}

// Thuyền buồm (buồm cánh dơi có nẹp tre) lướt ngang khung; buồm phồng theo gió cuộn, bóng soi đứt quãng.
function junk(put: Put, a: Anchor, c: Life) {
  const r = rng(a.seed * 43 + 2), u = c.u, dir = a.gap >= 0.5 ? 1 : -1, s = a.h
  const k = fract(r() + (c.t * 0.6 * u) / a.w), al = ends(k)
  const cx = dir > 0 ? a.x + k * a.w : a.x + (1 - k) * a.w, wy = a.y + a.h * 0.9 + Math.sin(c.t + a.seed) * 0.15 * u
  const roll = Math.sin(c.t * 0.7 + a.seed) * 0.04, belly = (0.03 + 0.06 * Math.abs(c.wind)) * s
  const P = (x: number, y: number): Pt => [cx + dir * x * s - y * s * roll, wy + y * s + x * s * roll]
  put({ pts: [P(-0.48, -0.1), P(-0.32, 0.02), P(0.3, 0.02), P(0.52, -0.14)], w: 0.05 * s, press: lift, dry: 0.4, a: 0.9 * al })
  put({ pts: [P(-0.36, -0.03), P(0.36, -0.03)], w: 0.06 * s, press: dot, wet: 0.5, a: 0.3 * al })
  for (const [mx, top, aft, sc] of [[0, -0.85, -0.34, 1], [0.3, -0.55, 0.08, 0.6]] as const) {
    put({ pts: [P(mx, -0.02), P(mx + 0.02, top)], w: 0.02 * s, press: lift, a: 0.85 * al })
    const rows = 6
    for (let j = 0; j <= rows; j++) {
      const q = j / rows, y = top + 0.04 + (-0.12 - top - 0.04) * q, x1 = aft - 0.04 * q
      const m: Pt = P((mx + x1) / 2, y)
      const bow: Pt = [m[0] - dir * belly * Math.sin(Math.PI * q), m[1]]
      if (j < rows) put({ pts: [P(mx + 0.01, y + 0.06 * sc), [bow[0], bow[1] + 0.06 * s * sc], P(x1, y + 0.06 * sc)], w: 0.05 * s * sc, press: (t) => Math.sqrt(Math.min(1, t / 0.1, (1 - t) / 0.1)), wet: 0.4, a: 0.22 * al })
      put({ pts: [P(mx + 0.01, y), bow, P(x1, y)], w: 0.008 * s, press: lift, dry: 0.4, a: 0.75 * al })
    }
  }
  for (let j = 0; j < 4; j++) {
    const y = 0.06 + j * 0.05, hw = 0.4 - j * 0.07
    put({ pts: [P(-hw, y), P(hw, y + 0.005)], w: 0.025 * s, press: leaf, dry: 0.5, a: (0.3 - j * 0.06) * al })
  }
}

// Cá chép nhỏ bơi vòng trong hồ: thân uốn theo nhịp quẫy, một con có mảng son; vây đuôi phẩy.
function fish(put: Put, a: Anchor, c: Life) {
  const r = rng(a.seed * 47 + 3), u = c.u, cx = a.x + a.w / 2, cy = a.y + a.h / 2
  for (let i = 0, n = 2 + Math.floor(r() * 2); i < n; i++) {
    const rx = a.w * R(r, 0.22, 0.45), ry = a.h * R(r, 0.22, 0.45), sg = r() < 0.5 ? 1 : -1, ph = r() * 6
    const L = R(r, 2.2, 3) * u, th = c.t * sg * R(r, 0.25, 0.4) + ph, d = L / (2 * (rx + ry))
    const E = (q: number): Pt => {
      const t = th - sg * q * d * 4, wag = Math.sin(c.t * 7 + ph - q * 3) * 0.18 * u * q
      return [cx + Math.cos(t) * rx + Math.cos(t) * wag, cy + Math.sin(t) * ry + Math.sin(t) * wag]
    }
    const body = [1, 0.75, 0.5, 0.25, 0].map(E)
    put({ pts: body, w: 0.42 * u, press: (t) => Math.sin(Math.PI * (0.08 + 0.62 * t)) ** 0.8, wet: 0.3, a: 0.7 })
    if (i === 0) put(dab(...E(0.3), 0.22 * u, { col: SON, wet: 0.5, a: 0.75 }))
    const tl = body[0], pv = E(0.85)
    for (const k of [-1, 1]) {
      const dx = tl[0] - pv[0], dy = tl[1] - pv[1], f = Math.sin(c.t * 7 + ph) * 0.4 + k * 0.6
      put({ pts: [tl, [tl[0] + dx * 1.4 - dy * f, tl[1] + dy * 1.4 + dx * f]], w: 0.16 * u, press: leaf, a: 0.45 })
    }
  }
}

// Sợi liễu rủ (thân cành tĩnh ở motifs2): lay theo hai nhịp gió trời, ngả hẳn khi cuộn nhanh.
function willow(put: Put, a: Anchor, c: Life) {
  const u = c.u, blow = 0.45 * c.wind
  for (const s of willowCrown(a).strands) {
    const sw = Math.sin(c.t * 0.8 + s.ph) * 0.07 + Math.sin(c.t * 2.1 + s.ph * 2) * 0.02 + blow
    const at = (q: number): Pt => [s.p[0] + sw * s.L * q * q, s.p[1] + s.L * q * (1 - 0.2 * Math.abs(sw) * q)]
    put({ pts: [0, 0.33, 0.66, 1].map(at), w: 0.05 * u, press: (t) => 1 - 0.75 * t, dry: 0.3, a: 0.5 * a.tone })
    for (let j = 1; j <= 3; j++) {
      const p = at(j / 4), side = j % 2 ? 1 : -1
      put({ pts: [p, [p[0] + (side * 0.3 + sw * 0.6) * u, p[1] + 0.55 * u]], w: 0.1 * u, press: leaf, a: 0.45 * a.tone })
    }
  }
}

// Diều sáo: thân thoi có hoa văn son, đuôi dài uốn sóng, dây chùng căng theo gió cuộn.
function kite(put: Put, a: Anchor, c: Life) {
  const u = c.u, ph = a.seed, base: Pt = [a.x + a.w * a.gap, a.y + a.h]
  const kx = a.x + a.w * 0.5 + Math.sin(c.t * 0.5 + ph) * 1.5 * u + c.wind * 3 * u, ky = a.y + a.h * 0.2 + Math.sin(c.t * 0.9 + ph) * 0.8 * u
  const tilt = 0.25 * Math.sin(c.t * 0.7 + ph) + 0.3 * c.wind, s = 1.6 * u
  const K = (x: number, y: number): Pt => [kx + x * s * Math.cos(tilt) - y * s * Math.sin(tilt), ky + x * s * Math.sin(tilt) + y * s * Math.cos(tilt)]
  const sag = (1 - Math.min(1, Math.abs(c.wind) * 1.5)) * 0.15 * a.h
  put({ pts: [K(0, 0.3), [(kx + base[0]) / 2, (ky + base[1]) / 2 + sag], base], w: 0.025 * u, press: (t) => 1 - 0.5 * t, a: 0.55 })
  put({ pts: [K(0, -1), K(0, 1.3)], w: 0.55 * s, press: (t) => Math.min(1, t / 0.4, (1 - t) / 0.6), col: SON, wet: 0.4, a: 0.55 })
  put({ pts: [K(0, -1), K(0, 1.3)], w: 0.05 * u, press: lift, a: 0.85 })
  put({ pts: [K(-0.6, -0.15), K(0, -0.3), K(0.6, -0.15)], w: 0.05 * u, press: leaf, a: 0.85 })
  put(dab(...K(0, 0.15), 0.15 * s, { a: 0.85 }))
  const tail = Array.from({ length: 7 }, (_, j): Pt => {
    const q = j / 6, [x, y] = K(0, 1.3 + q * 2.6)
    return [x + Math.sin(c.t * 3 + ph - q * 4) * q * 0.9 * u - c.wind * q * 1.5 * u, y]
  })
  put({ pts: tail, w: 0.06 * u, press: (t) => 1 - 0.8 * t, a: 0.7 })
  for (const q of [0.35, 0.65]) {
    const p = tail[Math.round(q * 6)]
    put({ pts: [[p[0] - 0.35 * u, p[1]], [p[0] + 0.35 * u, p[1]]], w: 0.12 * u, press: leaf, col: SON, a: 0.7 })
  }
}

// Chuồn chuồn: đứng không trung rung cánh, rồi lao vụt sang chỗ khác (mỗi chặng một điểm ngẫu nhiên trong khung).
function dragonfly(put: Put, a: Anchor, c: Life) {
  const u = c.u
  for (let i = 0, n = 1 + (a.w * a.h > 120 * u * u ? 1 : 0); i < n; i++) {
    const per = 2.6 + i * 0.7, x = c.t / per + i * 0.37, seg = Math.floor(x), q = x - seg
    const spot = (k: number): Pt => {
      const r = rng(a.seed * 53 + k * 7 + i * 101)
      return [a.x + a.w * R(r, 0.1, 0.9), a.y + a.h * R(r, 0.1, 0.9)]
    }
    const p0 = spot(seg - 1), p1 = spot(seg), m = Math.min(1, q / 0.18), e = m * m * (3 - 2 * m)
    const p: Pt = [p0[0] + (p1[0] - p0[0]) * e + Math.sin(c.t * 5 + i) * 0.12 * u, p0[1] + (p1[1] - p0[1]) * e + Math.cos(c.t * 4 + i) * 0.1 * u]
    const dir = p1[0] >= p0[0] ? 1 : -1, s = 1.1 * u
    put({ pts: [[p[0] + dir * 0.3 * s, p[1]], [p[0] - dir * 1.2 * s, p[1] + 0.08 * s]], w: 0.06 * u, press: (t) => 1 - 0.6 * t, a: 0.85 })
    put(dab(p[0] + dir * 0.38 * s, p[1], 0.12 * u, { a: 0.9 }))
    const buzz = 0.5 + 0.5 * Math.sin(c.t * 40 + i)
    for (const [ox, k] of [[0.15, 1], [-0.05, 0.85]] as const) {
      for (const up of [-1, 1]) {
        const tip: Pt = [p[0] + dir * (ox - 0.15) * s, p[1] + up * 0.75 * s * k * (0.6 + 0.4 * buzz)]
        put({ pts: [[p[0] + dir * ox * s, p[1]], tip], w: 0.16 * s, press: leaf, a: 0.22 + 0.1 * buzz })
      }
    }
  }
}

export const LIFE2: Record<string, (put: Put, a: Anchor, c: Life) => void> = { rain, leaves, lanterns, rise, smoke, junk, fish, willow, kite, dragonfly }
