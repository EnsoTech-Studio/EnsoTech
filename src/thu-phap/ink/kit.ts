import { dot, resample, type Pt, type Rgb, type Stroke } from './stroke'

/** Đồ nghề chung cho mọi bức vẽ: số ngẫu nhiên có hạt giống, dáng nét, đo đường gấp khúc. */

export const PAPER: Rgb = [0.95, 0.92, 0.86]

export function rng(seed: number) {
  let a = seed >>> 0 || 1
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
export type Rnd = () => number
export const R = (r: Rnd, a: number, b: number) => a + (b - a) * r()
export const fract = (x: number) => x - Math.floor(x)
/** Hiện / tan ở hai đầu một vòng lặp (vật bay ra khỏi khung rồi quay lại từ phía kia). */
export const ends = (k: number) => Math.max(0, Math.min(1, Math.min(k, 1 - k) / 0.12))

/** Bề ngang phẳng, hai đầu thon: mảng mực loang. */
export const flat = (t: number) => Math.sqrt(Math.min(1, t / 0.12, (1 - t) / 0.12))
/** Ấn mạnh lúc đặt bút, nhấc hẳn ở cuối. */
export const lift = (t: number) => Math.sqrt(Math.min(1, t / 0.05)) * (1 - 0.85 * t * t)
export const dab = (x: number, y: number, w: number, s: Partial<Stroke> = {}): Stroke => ({ pts: [[x - w, y], [x + w, y]], w, press: dot, ...s })
export const arcLen = (p: readonly Pt[]) => p.reduce((s, q, i) => (i ? s + Math.hypot(q[0] - p[i - 1][0], q[1] - p[i - 1][1]) : 0), 0)

/** Cắt một dãy điểm thành vài nét đứt (nhấc bút giữa chừng). */
export function broken(pts: readonly Pt[], r: Rnd, pieces: number, s: Omit<Stroke, 'pts'>): Stroke[] {
  const out: Stroke[] = []
  const n = pts.length
  let i = 0
  for (let k = 0; k < pieces && i < n - 1; k++) {
    const end = k === pieces - 1 ? n : Math.min(n, i + Math.max(2, Math.round((n / pieces) * R(r, 0.8, 1.2))))
    out.push({ ...s, pts: pts.slice(i, end), seed: r() * 100 })
    i = end + (r() < 0.6 ? 1 : 0)
  }
  return out
}

export const lerp = (p: Pt, q: Pt, t: number): Pt => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]
/** Điểm ở tỉ lệ t (0..1) dọc một đường gấp khúc, chia đều theo số đoạn. */
export const along = (pts: readonly Pt[], t: number): Pt => {
  const q = Math.min(0.999, Math.max(0, t)) * (pts.length - 1), i = Math.floor(q)
  return lerp(pts[i], pts[i + 1], q - i)
}
/** Chèn điểm kẹp sát mỗi góc để spline gãy góc thay vì bo tròn (bo tròn thì đá thành mũ bảo hiểm). */
export const tight = (pts: readonly Pt[]) => pts.flatMap((p, i) => (i ? [lerp(pts[i - 1], p, 0.2), lerp(pts[i - 1], p, 0.8), p] : [p]))
/** Bề ngang [trái, phải] của một đa giác khép kín ở độ cao y. */
export const span = (poly: readonly Pt[], y: number): [number, number] => {
  const xs = poly.flatMap((p, i) => {
    const q = poly[(i + 1) % poly.length]
    return (p[1] - y) * (q[1] - y) <= 0 && p[1] !== q[1] ? [p[0] + ((y - p[1]) / (q[1] - p[1])) * (q[0] - p[0])] : []
  })
  return [Math.min(...xs), Math.max(...xs)]
}
/** Cạnh đá gãy khúc: một hai mấu lệch khỏi đường thẳng p→q (cạnh thẳng thì thành thước kẻ, mái nhà). [lo, hi]: lệch lên (dương) / xuống. */
export const jag = (p: Pt, q: Pt, r: Rnd, lo = -1, hi = 1): Pt[] => {
  const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1, s = dx < 0 ? -1 : 1, n = 2 + Math.floor(r() * 3)
  return Array.from({ length: n - 1 }, (_, i): Pt => {
    const [x, y] = lerp(p, q, (i + 1) / n + R(r, -0.06, 0.06)), o = R(r, lo, hi) * 0.09 * l * s
    return [x + (dy / l) * o, y - (dx / l) * o]
  })
}
/** Mảng loang dọc một mép (sống núi, gờ đá): sâu `depth` theo hướng inw (vào lòng khối), đậm a0 sát mép nhạt dần tới a1.
 *  Một dải rộng hơn bán kính cong của mép thì gập thành chùm nét toả / vây xám, nên dùng 14 dải hẹp chồng ~3 lớp,
 *  bám theo mép đã lấy mẫu đều và làm mượt (±4 mẫu ≈ ±depth/4). */
export function inkWash(edge: readonly Pt[], depth: number, a0: number, a1: number, r: Rnd, inw: Pt = [0, 1]): Stroke[] {
  const q = resample(edge, depth / 16), m = q.length / 2
  let soft = Array.from({ length: m }, (_, i): Pt => {
    let x = 0, y = 0, c = 0
    for (let j = Math.max(0, i - 4); j <= Math.min(m - 1, i + 4); j++, c++) {
      x += q[2 * j]
      y += q[2 * j + 1]
    }
    return [x / c, y / c]
  })
  // Phía đậm của nét fade là (dy, −dx): quay về phía mép.
  const s = soft[0], e = soft[m - 1]
  if ((e[1] - s[1]) * inw[0] - (e[0] - s[0]) * inw[1] > 0) soft = soft.reverse()
  const K = 14, g = depth / K
  return Array.from({ length: K }, (_, k): Stroke => ({
    pts: soft.map(([x, y]): Pt => [x + inw[0] * g * (k + 3), y + inw[1] * g * (k + 3)]),
    w: 3 * g, press: flat, wet: 0.8, fade: 1, a: a0 + ((a1 - a0) * k) / (K - 1), seed: r() * 100, step: 10,
  }))
}
/** Cung tròn / elip quanh (cx, cy) từ góc a0 tới a1. */
export const arc = (cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 16): Pt[] =>
  Array.from({ length: n + 1 }, (_, i): Pt => {
    const t = a0 + ((a1 - a0) * i) / n
    return [cx + rx * Math.cos(t), cy + ry * Math.sin(t)]
  })
