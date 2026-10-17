import { clamp, ease, smooth } from '../layout'
import { flat } from './kit'
import type { Rect } from './scene'
import { InkBatch, Path, brush, dot, leaf, type Pt, type Stroke } from './stroke'

/**
 * Rồng thuỷ mặc: đầu bay dọc một đường cố định, thân nối đuôi theo đúng vệt đầu đã qua (như rắn trườn),
 * cộng một làn sóng nhỏ chạy từ đầu xuống đuôi. Vẽ lại bằng nét bút mỗi khung hình.
 * Bên "lưng" là B = (fy, -fx): khi bay vòng ngược chiều kim đồng hồ, lưng quay vào trong vòng.
 */

// Đường bay trong khung trời gốc SKY (đơn vị U, khớp page.tsx): vọt lên từ gờ thác, lượn một vòng lớn, cuộn lại rồi ngẩng đầu sang phải.
const SKY: Rect = [122, -6, 112, 108]
const PATH: readonly Pt[] = [
  [204, 18], [192, 8], [170, 8], [150, 18], [140, 36], [146, 56], [164, 70],
  [186, 66], [196, 50], [190, 36], [182, 28], [190, 18], [206, 18], [218, 24],
]

/**
 * Đường bay khớp vào khung trời thực tế; màn dọc thì kéo giãn tối đa 1.6× theo một chiều để rồng không bị bẹp.
 * u của rồng theo tỉ lệ đường bay (không theo nét chuẩn) để thân luôn cân với vòng lượn ở mọi cỡ màn.
 */
export function dragonPath(lip: Pt, sky: Rect, u: number) {
  const [x, y, w, h] = sky
  const s = Math.min(w / SKY[2], h / SKY[3])
  const sx = Math.min(w / SKY[2], 1.6 * s), sy = Math.min(h / SKY[3], 1.6 * s)
  const cx = SKY[0] + SKY[2] / 2, cy = SKY[1] + SKY[3] / 2
  const path = new Path([lip, ...PATH.map(([px, py]): Pt => [x + w / 2 + (px - cx) * sx, y + h / 2 + (py - cy) * sy])], u * 0.5)
  return { path, u: 1.5 * Math.sqrt(sx * sy) }
}

const dab = (p: Pt, w: number, s: Partial<Stroke> = {}): Stroke => ({ pts: [[p[0] - w, p[1]], [p[0] + w, p[1]]], w, press: dot, ...s })
const hash = (i: number) => {
  const x = Math.sin(i * 127.1) * 43758.5453
  return x - Math.floor(x)
}
const add = (p: Pt, d: Pt, k: number): Pt => [p[0] + d[0] * k, p[1] + d[1] * k]
const taper = (q: number) => Math.pow(1 - q, 0.8) * Math.sqrt(Math.min(1, q / 0.1))

/**
 * f: tiến độ hoá rồng (0..1); t: giây (râu, bờm, sóng thân); u: một nét chuẩn (px).
 * Rồng hiện từ f .3, đầu bay hết đường lúc f .75.
 */
export function drawDragon(b: InkBatch, path: Path, f: number, t: number, u: number, reduced: boolean, group: number) {
  const alpha = reduced ? (f >= 0.3 ? 1 : 0) : smooth(0.3, 0.38, f)
  if (alpha <= 0.01) return
  const L = path.L, Lb = 0.68 * L, W = 1.8 * u
  const head = reduced ? L : L * ease(clamp((f - 0.3) / 0.45))
  const tt = reduced ? 0 : t
  const vis = Math.min(head, Lb)
  if (vis < 2 * u) return
  const uMax = vis / Lb

  // Xương sống: n điểm từ đầu (i = 0) về đuôi.
  const n = Math.max(3, Math.ceil(vis / (0.6 * u)) + 1)
  const X = new Float32Array(n), Y = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const uu = (i / (n - 1)) * uMax
    const s = head - uu * Lb
    const [x, y] = path.at(s)
    const [x1, y1] = path.at(s + 0.5 * u), [x0, y0] = path.at(s - 0.5 * u)
    const fl = Math.hypot(x1 - x0, y1 - y0) || 1
    const fx = (x1 - x0) / fl, fy = (y1 - y0) / fl
    const wv = reduced ? 0 : 1.2 * u * Math.sin((uu * Lb) / (7 * u) - 1.6 * tt) * smooth(0, 0.12, uu)
    X[i] = x + fy * wv
    Y[i] = y - fx * wv
  }
  const hw = (uu: number) => W * (0.6 + 0.4 * smooth(0, 0.22, uu)) * (1 - 0.72 * smooth(0.55, 1, uu))
  /** Điểm trên thân ở uu (0 đầu → 1 đuôi), lệch side × nửa bề ngang về phía lưng; f hướng tới đầu, b hướng lưng. */
  const at = (uu: number, side = 0) => {
    const q = clamp(uu / uMax) * (n - 1), i = Math.min(n - 2, Math.floor(q)), k = q - i
    const x = X[i] + (X[i + 1] - X[i]) * k, y = Y[i] + (Y[i + 1] - Y[i]) * k
    const a = Math.max(0, i - 1), c = Math.min(n - 1, i + 2)
    const fl = Math.hypot(X[a] - X[c], Y[a] - Y[c]) || 1
    const fx = (X[a] - X[c]) / fl, fy = (Y[a] - Y[c]) / fl
    const h = hw(uu) * side
    return { p: [x + fy * h, y - fx * h] as Pt, f: [fx, fy] as Pt, b: [fy, -fx] as Pt }
  }
  const line = (u0: number, u1: number, side: number): Pt[] | null => {
    const a0 = Math.max(0, u0), a1 = Math.min(uMax, u1)
    if (a1 - a0 < 1e-3) return null
    const m = Math.max(2, Math.ceil(((a1 - a0) * Lb) / (0.8 * u)))
    return Array.from({ length: m + 1 }, (_, j) => at(a0 + ((a1 - a0) * j) / m, side).p)
  }
  const A = (s: Stroke) => b.add({ ...s, a: (s.a ?? 1) * alpha, group })
  const along = (u0: number, u1: number, side: number, s: Omit<Stroke, 'pts'>) => {
    const pts = line(u0, u1, side)
    if (pts) A({ ...s, pts })
  }
  const thick = (q: number) => hw(q * uMax) / W

  // Khối thân: lớp loang, lưng sẫm hơn bụng.
  along(0, 1, 0, { w: W * 1.05, press: thick, a: 0.26, wet: 0.9, seed: 1 })
  along(0, 1, 0.45, { w: W * 0.55, press: thick, a: 0.22, wet: 0.8, seed: 2 })

  // Vảy: ba hàng vòng cung, lồi về phía đuôi, gắn theo thân (không trôi khi rồng bay).
  const lim = Math.min(0.92, uMax)
  ;[0.62, 0.2, -0.18].forEach((row, k) => {
    for (let j = 0, sg = 0.6 * u + (k % 2) * 0.8 * u; sg / Lb < lim; j++, sg += 1.6 * u) {
      const uu = sg / Lb
      if (uu < 0.04) continue
      const c = at(uu, row + (hash(j * 3 + k) - 0.5) * 0.08)
      const r = 0.5 * u * (hw(uu) / W) * (0.9 + 0.2 * hash(j + k * 50))
      A({
        pts: [add(add(c.p, c.b, r * 0.75), c.f, r * 0.25), add(c.p, c.f, -r * 0.45), add(add(c.p, c.b, -r * 0.75), c.f, r * 0.25)],
        w: 0.07 * u, press: leaf, a: 0.45, dry: 0.3, seed: 100 + j * 3 + k, step: 0.25 * u,
      })
    }
  })

  // Dải bụng và vạch ngang.
  along(0.02, 0.9, -0.45, { w: 0.1 * u, press: leaf, a: 0.45, dry: 0.4, seed: 3 })
  for (let j = 0, sg = 0.8 * u; sg / Lb < Math.min(0.9, uMax); j++, sg += 1.3 * u) {
    const uu = sg / Lb
    A({ pts: [at(uu, -0.45).p, at(uu + (0.15 * u) / Lb, -0.95).p], w: 0.08 * u, press: leaf, a: 0.45, dry: 0.3, seed: 400 + j, step: 0.25 * u })
  }

  // Viền lưng nhấc bút ba đoạn, viền bụng hai đoạn.
  ;[[0, 0.3], [0.31, 0.62], [0.63, 1]].forEach(([a, c], i) => along(a, c, 1, { w: 0.35 * u, press: brush, a: 0.9, dry: 0.55, seed: 5 + i }))
  ;[[0, 0.5], [0.52, 1]].forEach(([a, c], i) => along(a, c, -1, { w: 0.22 * u, press: brush, a: 0.8, dry: 0.45, seed: 9 + i }))

  // Vây lưng: hàng gai nhọn ngả về sau, to nhỏ xen kẽ.
  for (let j = 0, sg = 1.5 * u; sg / Lb < lim; j++, sg += 2.2 * u) {
    const uu = sg / Lb
    const c = at(uu, 0.95)
    const sz = (hw(uu) / W) * (j % 2 ? 0.8 : 1.15) * u
    A({ pts: [c.p, add(add(c.p, c.f, -0.35 * sz), c.b, 0.75 * sz), add(add(c.p, c.f, -1.1 * sz), c.b, sz)], w: 0.3 * sz, press: taper, a: 0.8, dry: 0.4, seed: 500 + j })
  }

  // Bốn chân (thấy hai cặp): chân xa nhạt và lùi một chút, chân gần đậm; quạt nhẹ như bơi trong mây.
  for (const [i, uu] of [[0, 0.2], [1, 0.62]] as const) {
    if (uu > uMax - 0.02) continue
    const c = at(uu), hv = hw(uu)
    const pad = reduced ? 0 : 0.35 * Math.sin(1.3 * tt + i * 1.7)
    const dir = (phi: number): Pt => [c.f[0] * Math.cos(phi) + c.b[0] * Math.sin(phi), c.f[1] * Math.cos(phi) + c.b[1] * Math.sin(phi)]
    for (const far of [true, false]) {
      const a = far ? 0.4 : 0.88
      const base = add(add(c.p, c.b, -(far ? 0.35 : 0.7) * hv), c.f, far ? 0.7 * u : 0)
      const p1 = -2.2 + pad + (far ? 0.25 : 0), p2 = -0.55 + pad * 0.6
      const knee = add(base, dir(p1), 1.5 * W)
      const ankle = add(knee, dir(p2), 1.3 * W)
      A({ pts: [base, add(add(base, dir(p1), 0.75 * W), dir(p1 + Math.PI / 2), 0.12 * W), knee], w: 0.42 * W, press: (q) => 1 - 0.45 * q, a, dry: 0.45, seed: 600 + i * 4 + +far })
      A({ pts: [knee, ankle], w: 0.28 * W, press: (q) => 0.9 - 0.3 * q, a, dry: 0.4, seed: 602 + i * 4 + +far })
      A({ pts: [knee, add(add(knee, c.f, -0.7 * W), c.b, 0.15 * W), add(add(knee, c.f, -1.3 * W), c.b, -0.1 * W)], w: 0.16 * W, press: leaf, a: a * 0.7, dry: 0.6, seed: 610 + i })
      for (let j = -1; j <= 1; j++) {
        const pc = p2 + 0.3 + j * 0.45
        const mid = add(ankle, dir(pc), 0.45 * W)
        A({ pts: [ankle, mid, add(mid, dir(pc - 0.9), 0.32 * W)], w: 0.13 * W, press: taper, a, seed: 620 + i * 3 + j })
      }
    }
  }

  // Đuôi: chùm lông lửa, chỉ khi cả thân đã ra khỏi thác.
  if (head - Lb >= 0) {
    const c = at(1)
    for (let k = -2; k <= 2; k++) {
      const th = Math.PI + k * 0.28
      const d: Pt = [c.f[0] * Math.cos(th) + c.b[0] * Math.sin(th), c.f[1] * Math.cos(th) + c.b[1] * Math.sin(th)]
      const len = (2.6 + 0.6 * (2 - Math.abs(k))) * u
      A({
        pts: [c.p, add(add(c.p, d, len * 0.5), c.b, 0.35 * u * Math.sin(1.6 * tt + k)), add(add(c.p, d, len), c.b, 0.6 * u * Math.sin(1.6 * tt + k - 1))],
        w: 0.3 * u, press: leaf, a: 0.8, dry: 0.55, seed: 700 + k,
      })
    }
  }

  // Đầu: hệ toạ độ riêng (a tới trước, c về phía lưng), đơn vị S.
  const h0 = at(0)
  const S = 1.3 * W
  const H = (a: number, c: number): Pt => [h0.p[0] + (h0.f[0] * a + h0.b[0] * c) * S, h0.p[1] + (h0.f[1] * a + h0.b[1] * c) * S]
  const hs = (pts: readonly (readonly [number, number])[], s: Omit<Stroke, 'pts'>) => A({ ...s, pts: pts.map(([a, c]) => H(a, c)) })

  hs([[-0.4, 0.35], [1.2, 0.45], [2.6, 0.25]], { w: 0.62 * S, press: flat, a: 0.16, wet: 0.9, seed: 40 })
  // Bờm: năm lọn bay ngược về sau, phấp phới theo thời gian.
  for (let i = 0; i < 5; i++) {
    const a0 = -0.15 - 0.3 * i, c0 = 0.95 - 0.32 * i, ph = tt * 1.4 + i * 0.9
    hs([[a0, c0], [a0 - 1.1, c0 + 0.35 + 0.25 * Math.sin(ph)], [a0 - 2.3, c0 + 0.15 + 0.4 * Math.sin(ph - 0.8)], [a0 - 3.2, c0 - 0.1 + 0.45 * Math.sin(ph - 1.6)]], {
      w: 0.26 * u, press: leaf, a: 0.75, dry: 0.6, seed: 60 + i,
    })
  }
  // Sừng nai: sừng xa nhạt, sừng gần có hai nhánh.
  hs([[0.45, 1.0], [-0.2, 1.6], [-1.0, 1.95], [-1.7, 1.9]], { w: 0.22 * u, press: brush, a: 0.45, dry: 0.55, seed: 41 })
  hs([[0.15, 1.1], [-0.6, 1.85], [-1.5, 2.25], [-2.3, 2.2]], { w: 0.28 * u, press: brush, a: 0.9, dry: 0.55, seed: 42 })
  hs([[-0.6, 1.85], [-0.45, 2.45]], { w: 0.16 * u, press: taper, a: 0.85, dry: 0.4, seed: 43 })
  hs([[-1.5, 2.25], [-1.65, 2.8]], { w: 0.14 * u, press: taper, a: 0.85, dry: 0.4, seed: 44 })
  // Sọ, mũi cuộn, hàm trên, hàm dưới (miệng hé), nanh.
  hs([[-0.5, 0.95], [0.4, 1.15], [1.25, 0.78], [2.1, 0.9], [2.85, 0.5]], { w: 0.3 * u, press: brush, a: 0.92, dry: 0.5, seed: 45 })
  hs([[2.85, 0.5], [3.08, 0.28], [3.0, 0.02], [2.78, 0.0], [2.72, 0.18]], { w: 0.2 * u, press: leaf, a: 0.85, dry: 0.35, seed: 46 })
  hs([[2.95, 0], [2.4, -0.12], [1.7, -0.08], [1.05, -0.2]], { w: 0.2 * u, press: brush, a: 0.85, dry: 0.4, seed: 47 })
  hs([[2.55, -0.42], [2.0, -0.62], [1.4, -0.55], [0.95, -0.28]], { w: 0.26 * u, press: brush, a: 0.85, dry: 0.45, seed: 48 })
  hs([[2.6, -0.4], [2.7, -0.55], [2.5, -0.7]], { w: 0.12 * u, press: leaf, a: 0.6, seed: 49 })
  hs([[1.05, -0.2], [0.75, -0.3], [0.6, -0.05], [0.8, 0.1]], { w: 0.16 * u, press: leaf, a: 0.6, dry: 0.5, seed: 50 })
  hs([[2.3, -0.14], [2.26, -0.42]], { w: 0.1 * u, press: taper, a: 0.9, seed: 51 })
  hs([[1.9, -0.58], [1.95, -0.32]], { w: 0.09 * u, press: taper, a: 0.8, seed: 52 })
  // Mắt, mí, mày lửa.
  A(dab(H(1.08, 0.62), 0.16 * S, { a: 0.95, seed: 53 }))
  hs([[0.78, 0.52], [1.0, 0.8], [1.36, 0.66], [1.3, 0.5]], { w: 0.1 * u, press: leaf, a: 0.8, seed: 54 })
  hs([[0.62, 0.82], [1.05, 1.08], [1.55, 0.95]], { w: 0.24 * u, press: brush, a: 0.9, dry: 0.4, seed: 55 })
  hs([[1.0, 1.02], [0.55, 1.4], [0.05, 1.5], [-0.3, 1.35]], { w: 0.2 * u, press: leaf, a: 0.7, dry: 0.5, seed: 56 })
  // Râu dài: vươn tới trước rồi quặt về sau, uốn lượn.
  for (const s of [1, -1]) {
    const ctrl: [number, number][] = [[2.8, s > 0 ? 0.3 : -0.05], [3.4, 0.9 * s], [3.3, 1.8 * s], [2.5, 2.5 * s], [1.4, 2.9 * s], [0.2, 3.0 * s], [-1.0, 2.8 * s]]
    hs(ctrl.map(([a, c], j) => [a, c + s * 0.3 * Math.sin(tt * 1.2 + j * 0.9 + s) * (j / 6)] as const), { w: 0.1 * u, press: leaf, a: 0.8, dry: 0.3, seed: 57 + s })
  }
  // Chòm râu cằm.
  for (let i = 0; i < 3; i++) {
    const a0 = 1.6 + 0.25 * i, ph = tt * 1.1 + i
    hs([[a0, -0.6], [a0 - 0.3, -1.1], [a0 - 0.8, -1.6 + 0.15 * Math.sin(ph)]], { w: 0.2 * u, press: leaf, a: 0.7, dry: 0.55, seed: 70 + i })
  }
}
