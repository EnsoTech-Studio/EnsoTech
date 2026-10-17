import { clamp } from '../layout'
import { R, dab, ends, fract, lerp, lift, rng } from './kit'
import { LIFE2 } from './life2'
import type { Anchor } from './scene'
import { SON, dot, leaf, type InkBatch, type Path, type Pt, type Stroke } from './stroke'

/**
 * Vật sống trong tranh, vẽ lại mỗi khung hình: đàn chim, nhạn bay hàng, hạc, thuyền câu nhấp nhô, hoa mai rơi,
 * cánh hoa trôi trên suối. Mỗi vật hiện dần theo thước vẽ của điểm neo (a.t0 → a.t1), mang lớp sâu của điểm neo.
 * Giảm chuyển động: t đứng yên nên mọi thứ thành tranh tĩnh.
 */
export interface Life {
  t: number
  draw: number
  /** Gió dồn (px): cánh hoa bị đẩy ngang khi cuộn nhanh. */
  gust: number
  u: number
  stream: Path | null
  streamT: ((s: number) => number) | null
  /** Gió cuộn tức thời (−1..1). */
  wind: number
  /** Khung nhìn đã nới thêm độ trôi lớp sâu: [x0, y0, x1, y1]. Vật ngoài khung thì không vẽ. */
  view: readonly [number, number, number, number]
}

export type Put = (s: Stroke) => void

/** Chim xa: hai nét cánh cong gặp nhau ở thân. flap 1 = cánh vút lên (chữ V), −1 = cánh rủ (vòm như mòng biển). */
function bird(put: Put, p: Pt, s: number, flap: number, w: number, al: number) {
  const up = flap * s * 0.6
  for (const d of [-1, 1]) {
    const tip: Pt = [p[0] + d * s, p[1] - up], mid: Pt = [p[0] + d * s * 0.45, p[1] - s * 0.22 - up * 0.25]
    put({ pts: d < 0 ? [tip, mid, p] : [p, mid, tip], w, press: d < 0 ? (t) => 0.3 + 0.7 * t : (t) => 1 - 0.7 * t, a: al, dry: 0.3, seed: 7 + d })
  }
}

/** Đàn chim / nhạn: bay ngang qua khung rồi vòng lại. dir: hướng bay. */
function flock(put: Put, a: Anchor, c: Life, geese: boolean) {
  const r = rng(a.seed * 31 + 5), u = c.u
  const dir = a.gap >= 0.5 ? 1 : -1
  const n = geese ? 5 + Math.floor(r() * 3) : 3 + Math.floor(r() * 3)
  const sp = R(r, 1.2, 2) * u
  const lead = (k: number, y0: number, ph: number): Pt => [dir > 0 ? a.x + k * a.w : a.x + (1 - k) * a.w, a.y + a.h * y0 + Math.sin(c.t * 0.35 + ph) * 0.8 * u]
  if (geese) {
    // Nhạn bay hàng chữ V: con đầu dẫn, các con sau so le hai cánh, vỗ cánh lệch nhịp.
    const k = fract(R(r, 0, 1) + (c.t * sp) / a.w), al = ends(k), p0 = lead(k, R(r, 0.3, 0.7), 0)
    for (let i = 0; i < n; i++) {
      const row = Math.ceil(i / 2), side = i % 2 ? 1 : -1
      const p: Pt = [p0[0] - dir * row * 2.2 * u, p0[1] + side * row * 1.3 * u + R(r, -0.2, 0.2) * u]
      const s = R(r, 0.9, 1.1) * u
      bird(put, p, s, Math.sin(c.t * 4 - i * 0.7), 0.13 * u, 0.8 * al)
      put({ pts: [p, [p[0] + dir * 0.7 * s, p[1] - 0.05 * s]], w: 0.09 * u, press: lift, a: 0.8 * al })
    }
    return
  }
  for (let i = 0; i < n; i++) {
    const ph = r() * 6, v = sp * R(r, 0.8, 1.2)
    const k = fract(r() + (c.t * v) / a.w), y0 = R(r, 0.1, 0.9), s = R(r, 0.7, 1.4) * u
    // Chim bay vỗ vài nhịp rồi lượn (cánh dang yên).
    const beat = Math.sin(c.t * R(r, 5, 7) + ph), glide = Math.sin(c.t * 0.5 + ph) > 0.3 ? 0.25 : 1
    bird(put, lead(k, y0, ph), s, beat * glide, 0.13 * u, R(r, 0.6, 0.85) * ends(k))
  }
}

/**
 * Hạc đầu đỏ bay: thân trắng (chỉ loang nhạt + viền bụng), cổ đen vươn thẳng, mào son, mỏ dài,
 * chân duỗi quá đuôi, chùm lông đuôi đen. Cánh trắng, viền sau là hàng lông đen; đập xuống nhanh, nâng lên chậm.
 */
function crane(put: Put, a: Anchor, c: Life) {
  const r = rng(a.seed * 17 + 3), u = c.u
  const dir = a.gap >= 0.5 ? 1 : -1
  for (let i = 0, n = 1 + Math.floor(r() * 2); i < n; i++) {
    const s = R(r, 3.6, 4.6) * u, ph = r() * 6
    const k = fract(r() + (c.t * 0.9 * u) / a.w), al = ends(k)
    const ft = c.t * 1.4 + ph, f = Math.sin(ft + 0.45 * Math.sin(ft))
    const p: Pt = [dir > 0 ? a.x + k * a.w : a.x + (1 - k) * a.w, a.y + a.h * R(r, 0.25, 0.75) + Math.sin(c.t * 0.5 + ph) * 0.6 * u + f * 0.06 * s]
    const F = (dx: number, dy: number): Pt => [p[0] + dir * dx * s, p[1] + dy * s]
    put({ pts: [F(-0.42, 0), F(0.34, -0.03)], w: 0.17 * s, press: dot, wet: 0.7, a: 0.12 * al })
    put({ pts: [F(-0.38, 0.06), F(0, 0.13), F(0.32, 0.04)], w: 0.025 * s, press: lift, dry: 0.3, a: 0.55 * al })
    put({ pts: [F(0.3, -0.05), F(0.62, -0.11), F(0.86, -0.1), F(1.05, -0.14)], w: 0.05 * s, press: (t) => 1 - 0.35 * t, a: 0.92 * al })
    put(dab(...F(1.1, -0.15), 0.055 * s, { a: 0.9 * al }))
    put(dab(...F(1.09, -0.2), 0.035 * s, { col: SON, a: 0.95 * al }))
    put({ pts: [F(1.14, -0.14), F(1.44, -0.1)], w: 0.018 * s, press: lift, a: 0.7 * al })
    for (const dy of [-0.04, 0.02, 0.07]) put({ pts: [F(-0.36, -0.01), F(-0.5, dy * 0.5), F(-0.62, dy + 0.03)], w: 0.05 * s, press: leaf, dry: 0.4, a: 0.85 * al })
    for (const dy of [0.06, 0.1]) {
      const end = F(-1.15, dy + 0.02 * Math.sin(c.t + ph))
      put({ pts: [F(-0.28, 0.08), end], w: 0.016 * s, press: lift, a: 0.75 * al })
      put({ pts: [end, [end[0] - dir * 0.08 * s, end[1] + 0.03 * s]], w: 0.012 * s, press: leaf, a: 0.7 * al })
    }
    // Hai cánh: cánh gần đậm và dài, cánh xa nhạt, ngắn hơn (phối cảnh).
    for (const [reach, tone] of [[1, 1], [0.68, 0.45]] as const) {
      const sh = F(0.12, -0.08), elbow = F(0.02, -0.08 - (0.12 + 0.45 * f) * reach), tip = F(-0.22 * reach, -0.08 - (0.15 + 0.9 * f) * reach)
      const edge = [sh, elbow, tip]
      put({ pts: edge.map(([x, y]): Pt => [x - dir * 0.14 * s, y]), w: 0.16 * s, press: leaf, wet: 0.5, a: 0.1 * tone * al })
      put({ pts: edge, w: 0.028 * s, press: lift, dry: 0.3, a: 0.65 * tone * al })
      for (let j = 0; j < 8; j++) {
        const q = (j + 0.5) / 8, e = q < 0.5 ? lerp(sh, elbow, q * 2) : lerp(elbow, tip, q * 2 - 1)
        const len = (0.26 + 0.12 * q) * s, inner = q < 0.62
        put({ pts: [e, [e[0] - dir * len, e[1] + 0.06 * s * (inner ? 1 : 0.4)]], w: (inner ? 0.05 : 0.022) * s, press: leaf, dry: 0.5, a: (inner ? 0.85 : 0.35) * tone * al })
      }
    }
  }
}

/** Thuyền câu: mạn cong, người đội nón cầm cần, dây câu buông xuống; nhấp nhô và gợn nước loang ra. */
function boat(put: Put, a: Anchor, c: Life) {
  const u = c.u, ph = a.seed
  const bob = Math.sin(c.t * 1.1 + ph) * 0.22 * u, roll = Math.sin(c.t * 0.8 + ph) * 0.05
  const cx = a.x + a.w / 2, wy = a.y + a.h * 0.72
  const P = (x: number, y: number): Pt => [cx + x - y * roll, wy + y + x * roll + bob]
  const L = a.w / 2, dir = a.gap >= 0.5 ? 1 : -1
  put({ pts: [P(-L, -0.9 * u), P(-L * 0.55, 0.15 * u), P(L * 0.5, 0.15 * u), P(L, -1.1 * u)], w: 0.32 * u, press: lift, a: 0.9, dry: 0.4 })
  put({ pts: [P(-L * 0.8, -0.3 * u), P(L * 0.75, -0.3 * u)], w: 0.55 * u, press: dot, a: 0.3, wet: 0.5 })
  // Người: thân, nón lá, cần câu vươn ra phía mũi thuyền.
  const fx = -dir * L * 0.35
  put({ pts: [P(fx, -0.4 * u), P(fx + 0.15 * u, -1.5 * u), P(fx + 0.05 * u, -2.4 * u)], w: 0.42 * u, press: dot, a: 0.85, dry: 0.3 })
  put({ pts: [P(fx - 0.8 * u, -2.35 * u), P(fx, -3 * u), P(fx + 0.8 * u, -2.35 * u)], w: 0.24 * u, press: leaf, a: 0.95 })
  const tip = P(fx + dir * L * 1.25, -4.2 * u)
  put({ pts: [P(fx + dir * 0.3 * u, -1.6 * u), P(fx + dir * L * 0.7, -3.6 * u), tip], w: 0.07 * u, press: lift, a: 0.85 })
  put({ pts: [tip, [tip[0] + Math.sin(c.t * 0.7) * 0.2 * u, wy + 0.4 * u]], w: 0.025 * u, press: (t) => 1 - 0.6 * t, a: 0.5 })
  // Gợn nước loang ra từ mạn thuyền, mỗi vòng nhạt dần.
  for (let i = 0; i < 3; i++) {
    const k = fract(c.t * 0.25 + i / 3), rx = L * (1 + k * 0.9), al = 0.4 * (1 - k)
    put({ pts: [[cx - rx, wy + 0.5 * u + k * 0.4 * u], [cx - rx * 0.6, wy + 0.65 * u + k * 0.5 * u]], w: 0.09 * u, press: leaf, a: al })
    put({ pts: [[cx + rx * 0.55, wy + 0.6 * u + k * 0.5 * u], [cx + rx, wy + 0.5 * u + k * 0.4 * u]], w: 0.09 * u, press: leaf, a: al })
  }
  put({ pts: [[tip[0] - 0.5 * u, wy + 0.45 * u], [tip[0] + 0.5 * u, wy + 0.45 * u]], w: 0.07 * u, press: leaf, a: 0.4 })
}

/** Cánh hoa: một chấm son thuôn, xoay khi rơi. */
function petal(put: Put, p: Pt, s: number, th: number, al: number) {
  const dx = Math.cos(th) * s, dy = Math.sin(th) * s * 0.6
  put({ pts: [[p[0] - dx, p[1] - dy], [p[0] + dx, p[1] + dy]], w: s * 0.75, press: dot, col: SON, a: al, wet: 0.3 })
}

/** Hoa mai rơi trong khung: trôi chéo, đảo qua lại, gió (cuộn nhanh) hắt ngang. */
function fall(put: Put, a: Anchor, c: Life) {
  const r = rng(a.seed * 13 + 1), u = c.u
  for (let i = 0, n = Math.max(4, Math.round((a.w * a.h) / (60 * u * u))); i < n; i++) {
    const per = R(r, 7, 12), k = fract(r() + c.t / per), ph = r() * 6
    const x = a.x + fract(r() + (Math.sin(c.t * 0.9 + ph) * 1.2 * u + k * 3 * u + c.gust) / a.w) * a.w
    petal(put, [x, a.y + k * a.h], R(r, 0.25, 0.4) * u, c.t * R(r, 1, 2.5) + ph, 0.6 * ends(k))
  }
}

/** Cánh hoa và lá trôi xuôi dòng suối (ngược hướng cá), chỉ trên khúc suối đã vẽ. */
function drift(put: Put, c: Life) {
  const st = c.stream, tAt = c.streamT
  if (!st || !tAt) return
  const r = rng(404), u = c.u, [x0, y0, x1, y1] = c.view
  // ponytail: quét cả dòng mỗi khung (≤ 400 phép tra), chỉ vẽ cánh nằm trong khung nhìn.
  for (let i = 0, n = Math.min(400, Math.round(st.L / (14 * u))); i < n; i++) {
    const v = R(r, 0.8, 1.4) * u, off = R(r, -1.1, 1.1) * u, th0 = r() * 6, leafy = r() < 0.3
    const s = st.L * fract(r() - (c.t * v) / st.L)
    const show = clamp((c.draw - tAt(s)) / (20 * u))
    if (show <= 0) continue
    const [x, y] = st.at(s)
    if (x < x0 || x > x1 || y < y0 || y > y1) continue
    const [x2, y2] = st.at(s + 1), tl = Math.hypot(x2 - x, y2 - y) || 1
    const p: Pt = [x - ((y2 - y) / tl) * off, y + ((x2 - x) / tl) * off]
    const al = show * Math.min(1, s / (6 * u), (st.L - s) / (6 * u))
    if (leafy) put({ pts: [[p[0] - 0.5 * u, p[1]], [p[0] + 0.5 * u, p[1] + 0.1 * u]], w: 0.22 * u, press: leaf, a: 0.6 * al })
    else petal(put, p, 0.3 * u, th0 + c.t * 0.4, 0.65 * al)
  }
}

const DRAW: Record<string, (put: Put, a: Anchor, c: Life) => void> = {
  birds: (p, a, c) => flock(p, a, c, false),
  geese: (p, a, c) => flock(p, a, c, true),
  crane,
  boat,
  petals: fall,
  drift: (p, _a, c) => drift(p, c),
  ...LIFE2,
}

export function drawLife(b: InkBatch, list: readonly Anchor[], c: Life) {
  const [x0, y0, x1, y1] = c.view, m = 10 * c.u
  for (const a of list) {
    const show = clamp((c.draw - a.t0) / Math.max(1, a.t1 - a.t0))
    if (show <= 0) continue
    // Sân khấu màn cuối (group 1) bị dời theo stage nên không lọc; dòng suối tự lọc từng cánh hoa.
    if (a.group === 0 && a.art !== 'drift' && (a.x > x1 + m || a.x + a.w < x0 - m || a.y > y1 + m || a.y + a.h < y0 - m)) continue
    // ponytail: ghi thẳng vào nét vừa tạo (nét nào cũng là object mới của hàm vẽ), khỏi sao chép hàng nghìn nét mỗi khung.
    DRAW[a.art]?.((s) => {
      s.group = a.group
      s.par = a.par
      s.home = a.home
      s.a = (s.a ?? 1) * show
      b.add(s)
    }, a, c)
  }
}
