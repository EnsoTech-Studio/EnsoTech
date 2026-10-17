import { clamp, smooth } from '../layout'
import { rng } from './kit'
import { InkBatch, SON, brush, dot, leaf, type Pt, type Stroke } from './stroke'

/**
 * Cá chép Kohaku nhìn từ trên xuống, vẽ lại bằng nét bút mỗi khung hình.
 * Thân là chuỗi 18 đốt "đi theo đầu" (follow-the-leader): đầu bơi tới đâu thân uốn theo tới đó,
 * cộng thêm sóng quẫy từ đầu xuống đuôi. k = một đơn vị nét (px); thân dài 9k.
 */

const N = 18
// Nửa bề ngang thân (× chiều dài) dọc theo thân, đầu → đuôi.
const PROF: readonly Pt[] = [[0, 0.06], [0.05, 0.1], [0.12, 0.125], [0.25, 0.13], [0.4, 0.115], [0.55, 0.09], [0.7, 0.06], [0.82, 0.04], [0.9, 0.03], [1, 0.02]]
function prof(u: number) {
  let i = 0
  while (i < PROF.length - 2 && u > PROF[i + 1][0]) i++
  const [a, x] = PROF[i], [b, y] = PROF[i + 1]
  return x + (y - x) * smooth(a, b, u)
}

const dab = (p: Pt, w: number, s: Partial<Stroke> = {}): Stroke => ({ pts: [[p[0] - w, p[1]], [p[0] + w, p[1]]], w, press: dot, ...s })

export class Koi {
  private x = new Float32Array(N)
  private y = new Float32Array(N)
  private vx = 0
  private vy = 0
  /** Vận tốc của mục tiêu (đã làm mượt): cá bám kịp khi cuộn nhanh. */
  private tvx = 0
  private tvy = 0
  private tx = NaN
  private ty = 0
  private ph = 0
  private wa = 0
  private sp = 0
  readonly L: number
  private seg: number

  constructor(readonly k: number) {
    this.L = 9 * k
    this.seg = this.L / (N - 1)
  }

  /** Đầu tại p, thân duỗi thẳng ngược hướng d. */
  private place(p: Pt, d: Pt) {
    for (let i = 0; i < N; i++) {
      this.x[i] = p[0] - d[0] * this.seg * i
      this.y[i] = p[1] - d[1] * this.seg * i
    }
    this.vx = this.vy = this.tvx = this.tvy = 0
  }

  /**
   * T: chỗ cá muốn tới; d: hướng dòng nước ở đó. lead: điểm đầu cá bị kéo theo (lúc vượt thác), mix: mức kéo.
   */
  update(T: Pt, d: Pt, dt: number, reduced: boolean, lead: Pt | null, mix: number) {
    const k = this.k
    if (Number.isNaN(this.tx)) {
      // Lần đầu: cá ở phía thượng nguồn rồi bơi vào chỗ.
      this.place([T[0] - d[0] * 12 * k, T[1] - d[1] * 12 * k], d)
      this.tx = T[0]
      this.ty = T[1]
    }
    if (Math.hypot(T[0] - this.x[0], T[1] - this.y[0]) > 50 * k && !lead) this.place(T, d)

    if (dt > 0) {
      const cap = 80 * k
      const vx = clamp((T[0] - this.tx) / dt, -cap, cap), vy = clamp((T[1] - this.ty) / dt, -cap, cap)
      const e = Math.min(1, dt * 6)
      this.tvx += (vx - this.tvx) * e
      this.tvy += (vy - this.tvy) * e
    }
    this.tx = T[0]
    this.ty = T[1]

    // Mục tiêu trôi trên một vòng nhỏ: tới nơi thì cá lượn lờ chứ không đứng im.
    this.wa += dt * (reduced ? 0.15 : 0.3)
    const gx = T[0] + Math.cos(this.wa) * 2.5 * k, gy = T[1] + Math.sin(this.wa * 1.3) * 1.6 * k
    const hx = this.x[0], hy = this.y[0]
    const dx = gx - hx, dy = gy - hy, dist = Math.hypot(dx, dy) || 1
    const sp = Math.min(reduced ? 4 * k : 14 * k, dist * 1.6 + 1.2 * k)
    const e = Math.min(1, dt * 2.5)
    this.vx += (this.tvx + (dx / dist) * sp - this.vx) * e
    this.vy += (this.tvy + (dy / dist) * sp - this.vy) * e
    let nx = hx + this.vx * dt, ny = hy + this.vy * dt
    if (lead && mix > 0) {
      nx += (lead[0] - nx) * mix
      ny += (lead[1] - ny) * mix
      if (dt > 0) {
        this.vx = (nx - hx) / dt
        this.vy = (ny - hy) / dt
      }
    }
    this.x[0] = nx
    this.y[0] = ny
    for (let i = 1; i < N; i++) {
      const ex = this.x[i] - this.x[i - 1], ey = this.y[i] - this.y[i - 1]
      const l = Math.hypot(ex, ey) || 1
      this.x[i] = this.x[i - 1] + (ex / l) * this.seg
      this.y[i] = this.y[i - 1] + (ey / l) * this.seg
    }
    this.sp += (Math.min(Math.hypot(this.vx - this.tvx, this.vy - this.tvy), 20 * k) - this.sp) * Math.min(1, dt * 3)
    // Bơi nhanh thì quẫy nhanh.
    this.ph += dt * 2 * Math.PI * (reduced ? 0.5 : 0.8 + (0.12 * this.sp) / k)
  }

  draw(b: InkBatch, alpha: number) {
    if (alpha <= 0.01) return
    const { L, k } = this
    // Xương thân sau khi cộng sóng quẫy (biên độ lớn dần về đuôi, đầu lắc nhẹ ngược pha).
    const px = new Float32Array(N), py = new Float32Array(N)
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1)
      const a = Math.max(0, i - 1), c = Math.min(N - 1, i + 1)
      let fx = this.x[a] - this.x[c], fy = this.y[a] - this.y[c]
      const fl = Math.hypot(fx, fy) || 1
      fx /= fl
      fy /= fl
      const off = L * (0.012 + 0.06 * u ** 1.5) * Math.sin(this.ph - u * 5.5)
      px[i] = this.x[i] - fy * off
      py[i] = this.y[i] + fx * off
    }
    // Điểm trên thân ở vị trí u (0 đầu → 1 đuôi), lệch ngang side × nửa bề ngang; kèm hướng tới (về phía đầu).
    const at = (u: number, side = 0) => {
      const q = clamp(u) * (N - 1), i = Math.min(N - 2, Math.floor(q)), t = q - i
      const x = px[i] + (px[i + 1] - px[i]) * t, y = py[i] + (py[i + 1] - py[i]) * t
      let fx = px[i] - px[i + 1], fy = py[i] - py[i + 1]
      const fl = Math.hypot(fx, fy) || 1
      fx /= fl
      fy /= fl
      const hw = prof(u) * L * side
      return { p: [x - fy * hw, y + fx * hw] as Pt, f: [fx, fy] as Pt, n: [-fy, fx] as Pt }
    }
    const along = (u0: number, u1: number, side = 0, n = 8) => Array.from({ length: n + 1 }, (_, j) => at(u0 + ((u1 - u0) * j) / n, side).p)
    const A = (s: Stroke) => b.add({ ...s, a: (s.a ?? 1) * alpha })

    // Thân: lớp loang rất nhạt cho có khối, mép trắng giấy.
    A({ pts: along(0, 0.9, 0, 12), w: 0.13 * L, press: (t) => prof(t * 0.9) / 0.13, a: 0.1, wet: 0.9, seed: 1 })
    // Mảng son Kohaku.
    A({ pts: along(0.03, 0.18, 0, 4), w: 0.085 * L, col: SON, a: 0.55, wet: 0.7, press: dot, seed: 2 })
    A({ pts: along(0.3, 0.45, 0.35, 4), w: 0.06 * L, col: SON, a: 0.55, wet: 0.7, press: dot, seed: 3 })
    A({ pts: along(0.52, 0.62, -0.35, 4), w: 0.045 * L, col: SON, a: 0.55, wet: 0.7, press: dot, seed: 4 })

    // Vây ngực, vây bụng: mảng mực trong, quạt nhẹ theo nhịp bơi.
    for (const [u, len, ang] of [[0.2, 1.7 * k, 1], [0.52, 1 * k, 0.8]] as const) {
      for (const side of [1, -1]) {
        const { p, f, n } = at(u, 0.9 * side)
        const th = ang + 0.25 * Math.sin(this.ph * 0.5 + side)
        const dx = -f[0] * Math.cos(th) + n[0] * side * Math.sin(th), dy = -f[1] * Math.cos(th) + n[1] * side * Math.sin(th)
        const tip: Pt = [p[0] + dx * len, p[1] + dy * len]
        const mid: Pt = [p[0] + dx * len * 0.5 - f[0] * len * 0.15, p[1] + dy * len * 0.5 - f[1] * len * 0.15]
        A({ pts: [p, mid, tip], w: len * 0.32, press: leaf, a: 0.22, wet: 0.6, seed: 5 + side })
        A({ pts: [p, mid, tip], w: 0.06 * k, press: leaf, a: 0.6, dry: 0.4, seed: 7 + side })
      }
    }

    // Đuôi chẻ hai thuỳ, có sợi vây.
    const tail = at(1)
    const bx = -tail.f[0], by = -tail.f[1]
    const flick = 0.3 * Math.sin(this.ph - 5.5)
    for (const side of [1, -1]) {
      const th = side * 0.4 + flick
      const dx = bx * Math.cos(th) - by * Math.sin(th), dy = bx * Math.sin(th) + by * Math.cos(th)
      const len = 0.26 * L
      const tip: Pt = [tail.p[0] + dx * len, tail.p[1] + dy * len]
      const mid: Pt = [tail.p[0] + dx * len * 0.5 + tail.n[0] * side * 0.05 * L, tail.p[1] + dy * len * 0.5 + tail.n[1] * side * 0.05 * L]
      A({ pts: [tail.p, mid, tip], w: 0.07 * L, press: leaf, a: 0.2, wet: 0.6, seed: 9 + side })
      A({ pts: [tail.p, mid, tip], w: 0.06 * k, press: leaf, a: 0.7, dry: 0.4, seed: 11 + side })
      for (const f of [0.35, 0.7]) {
        const fth = th - side * 0.18 * f
        const fx = bx * Math.cos(fth) - by * Math.sin(fth), fy = bx * Math.sin(fth) + by * Math.cos(fth)
        A({ pts: [tail.p, [tail.p[0] + fx * len * 0.85, tail.p[1] + fy * len * 0.85]], w: 0.04 * k, press: leaf, a: 0.4, dry: 0.5, seed: 13 + f })
      }
    }

    // Viền thân: mỗi bên hai nét, nhấc bút giữa chừng.
    for (const side of [1, -1]) {
      A({ pts: along(0.05, 0.46, side, 8), w: 0.16 * k, press: brush, a: 0.85, dry: 0.45, seed: 15 + side })
      A({ pts: along(0.44, 0.9, side, 8), w: 0.14 * k, press: brush, a: 0.8, dry: 0.5, seed: 17 + side })
    }
    // Mõm, mang, sống lưng.
    const h = at(0)
    A({ pts: [at(0.09, 0.95).p, at(0.02, 0.8).p, [h.p[0] + h.f[0] * 0.012 * L, h.p[1] + h.f[1] * 0.012 * L], at(0.02, -0.8).p, at(0.09, -0.95).p], w: 0.15 * k, press: leaf, a: 0.85, dry: 0.3, seed: 19 })
    A({ pts: [at(0.18, 0.85).p, at(0.14).p, at(0.18, -0.85).p], w: 0.07 * k, press: leaf, a: 0.45, dry: 0.4, seed: 20 })
    A({ pts: along(0.22, 0.62, 0, 6), w: 0.05 * k, press: leaf, a: 0.4, dry: 0.5, seed: 21 })
    // Mắt và râu.
    for (const side of [1, -1]) {
      b.add(dab(at(0.075, 0.62 * side).p, 0.17 * k, { a: 0.9 * alpha, seed: 22 + side }))
      const r = at(0.02, 0.6 * side)
      const tip: Pt = [r.p[0] + (r.f[0] + r.n[0] * side * 0.8) * 0.06 * L, r.p[1] + (r.f[1] + r.n[1] * side * 0.8) * 0.06 * L]
      A({ pts: [r.p, tip], w: 0.04 * k, press: leaf, a: 0.6, seed: 24 + side })
    }
  }
}

/** Mực bắn lên khi cá nhảy qua gờ thác: theo tiến độ f (cuộn lùi thì tia mực bay ngược về). */
export function splash(b: InkBatch, lip: Pt, f: number, k: number, group: number) {
  const tau = (f - 0.25) / 0.2
  if (tau <= 0 || tau >= 1) return
  const r = rng(77)
  const R = (a: number, c: number) => a + (c - a) * r()
  b.add(dab(lip, (1 + 3 * tau) * k, { a: 0.35 * Math.sqrt(1 - tau), wet: 1, group, seed: 30 }))
  const g = 18 * k, T = tau * 1.1
  for (let i = 0; i < 26; i++) {
    const ang = -Math.PI / 2 + R(-0.9, 0.9), v0 = R(6, 16) * k, size = R(0.15, 0.35) * k * (1 - 0.5 * tau)
    const pos = (t: number): Pt => [lip[0] + Math.cos(ang) * v0 * t, lip[1] + Math.sin(ang) * v0 * t + 0.5 * g * t * t]
    const head = pos(T)
    b.add({ pts: [pos(Math.max(0, T - 0.06)), head], w: size * 0.7, press: (t) => Math.sqrt(t), a: 0.7 * (1 - tau), dry: 0.3, group, seed: 31 + i })
    b.add(dab(head, size, { a: 0.75 * (1 - tau), group, seed: 60 + i }))
  }
  for (let i = 0; i < 14; i++) {
    const at = R(0.1, 0.4), rad = R(2, 7) * k, th = R(-Math.PI, 0.3)
    if (tau < at) continue
    b.add(dab([lip[0] + Math.cos(th) * rad, lip[1] + Math.sin(th) * rad], R(0.08, 0.25) * k, { a: 0.55 * (1 - smooth(0.5, 1, tau)), group, seed: 90 + i }))
  }
}
