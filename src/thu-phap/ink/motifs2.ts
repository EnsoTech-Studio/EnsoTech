import { SON, brush, dot, even, leaf, type Pt, type Stroke } from './stroke'
import { R, along, arc, broken, dab, flat, lift, rng, tight, type Rnd } from './kit'
import { sway } from './motifs'
import type { Anchor, Art } from './scene'

/**
 * Vật tĩnh cho các chương sau: lan, cúc, đình, liễu, đá kê, trăng, làng, nét quét, tháp xa.
 * Cùng quy ước với motifs.ts: a.gap = chỗ đặt gốc theo bề ngang khung, a.tone = độ đậm cả vật.
 */

// Lan: lá "mắt phượng" (phình, thắt, phình rồi vuốt nhọn) rủ ra hai bên; hai hoa nhạt, nhuỵ son.
const eye = (t: number) => (0.35 + 0.65 * Math.abs(Math.sin(2.2 * Math.PI * t)) ** 0.7) * Math.sqrt(Math.min(1, t / 0.05)) * (1 - t) ** 0.6
const orchid: Art = (a, u, r) => {
  const out: Stroke[] = []
  const b: Pt = [a.x + a.w * a.gap, a.y + a.h]
  for (let i = 0, n = 6 + Math.floor(r() * 3); i < n; i++) {
    // Góc nghiêng cộng dồn dọc lá: lá càng xa gốc càng ngả ra ngoài rồi rủ xuống.
    const th = R(r, -1.2, 1.2), L = a.h * R(r, 0.55, 1.1), bend = (Math.sign(th) || 1) * R(r, 0.5, 1.7)
    let ang = th, x = b[0] + R(r, -0.4, 0.4) * u, y = b[1]
    const pts: Pt[] = [[x, y]]
    for (let k = 0; k < 6; k++) {
      ang += bend / 6
      x += (Math.sin(ang) * L) / 6
      y -= (Math.cos(ang) * L) / 6
      pts.push([x, y])
    }
    out.push({ pts, w: R(r, 0.3, 0.42) * u, press: eye, a: R(r, 0.7, 0.95) * a.tone, dry: 0.35, seed: r() * 100, sway: sway(b[1], 0.5 * u, L), step: 3 })
  }
  for (const sd of [-1, 1]) {
    const top: Pt = [b[0] + sd * R(r, 1, 3) * u, b[1] - a.h * R(r, 0.4, 0.65)]
    const sw = sway(b[1], 0.6 * u, b[1] - top[1])
    out.push({ pts: [b, [(b[0] + top[0]) / 2 + sd * 0.5 * u, (b[1] + top[1]) / 2], top], w: 0.08 * u, press: lift, a: 0.7 * a.tone, dry: 0.3, sway: sw, seed: r() * 100, step: 3 })
    const rot = R(r, -0.4, 0.4)
    for (let k = 0; k < 5; k++) {
      const t = rot + (k - 2) * 0.75, L = R(r, 1, 1.4) * u
      const tip: Pt = [top[0] + Math.sin(t) * L, top[1] - Math.cos(t) * L]
      out.push({ pts: [top, [top[0] + Math.sin(t + 0.2) * L * 0.5, top[1] - Math.cos(t + 0.2) * L * 0.5], tip], w: 0.32 * u, press: leaf, a: 0.32 * a.tone, wet: 0.4, sway: sw, seed: r() * 100 })
    }
    out.push(dab(top[0], top[1], 0.2 * u, { col: SON, a: 0.75 * a.tone, sway: sw, seed: r() * 100 }))
    for (let k = 0; k < 3; k++) out.push(dab(top[0] + R(r, -0.3, 0.3) * u, top[1] - R(r, 0.1, 0.4) * u, 0.07 * u, { a: 0.9 * a.tone, sway: sw, seed: r() * 100 }))
  }
  for (let i = 0; i < 5; i++) out.push(dab(b[0] + R(r, -2.5, 2.5) * u, b[1] + R(r, -0.2, 0.3) * u, R(r, 0.12, 0.25) * u, { a: 0.8 * a.tone, seed: r() * 100 }))
  return out
}

// Cúc: thân gãy khúc, lá ba chấm loang có gân, đầu hoa vòng cánh mảnh nhìn xiên; một bông nằm trên vệt son.
const chrys: Art = (a, u, r) => {
  const out: Stroke[] = []
  const b: Pt = [a.x + a.w * a.gap, a.y + a.h]
  for (let i = 0, n = 2 + Math.floor(r() * 2); i < n; i++) {
    const top: Pt = [a.x + a.w * R(r, 0.15, 0.85), a.y + a.h * R(r, 0.08, 0.45)]
    const sw = sway(b[1], 0.5 * u, b[1] - top[1]), z = R(r, 0.4, 0.8) * u
    const stem = Array.from({ length: 6 }, (_, k): Pt => [b[0] + (top[0] - b[0]) * (k / 5) + (k % 5 ? (k % 2 ? z : -z) : 0), b[1] + (top[1] - b[1]) * (k / 5)])
    out.push({ pts: tight(stem), w: 0.13 * u, press: lift, dry: 0.5, a: 0.85 * a.tone, sway: sw, seed: r() * 100, step: 3 })
    for (let k = 1; k < 5; k++) {
      if (r() < 0.25) continue
      const sd = k % 2 ? 1 : -1, p = stem[k], c: Pt = [p[0] + sd * 1.6 * u, p[1] - 0.3 * u]
      for (let j = 0; j < 3; j++) out.push(dab(c[0] + sd * (j - 1) * 0.6 * u, c[1] + R(r, -0.4, 0.4) * u, R(r, 0.5, 0.75) * u, { wet: 0.8, a: R(r, 0.4, 0.55) * a.tone, sway: sw, seed: r() * 100 }))
      out.push({ pts: [p, [c[0] + sd * 0.4 * u, c[1] - 0.2 * u], [c[0] + sd * 1.2 * u, c[1]]], w: 0.06 * u, press: leaf, a: 0.75 * a.tone, sway: sw, seed: r() * 100, step: 3 })
    }
    const rx = R(r, 1.5, 2.1) * u, ry = rx * 0.75
    if (i === 0) out.push(dab(top[0], top[1], rx * 1.15, { col: SON, wet: 1, a: 0.28 * a.tone, sway: sw, seed: r() * 100 }))
    for (let k = 0; k < 18; k++) {
      const th = (k / 18) * Math.PI * 2 + R(r, -0.1, 0.1), cs = Math.cos(th), sn = Math.sin(th), L = R(r, 0.85, 1.05)
      const o: Pt = [top[0] + cs * rx * 0.25, top[1] + sn * ry * 0.25], e: Pt = [top[0] + cs * rx * L, top[1] + sn * ry * L]
      out.push({ pts: [o, [(o[0] + e[0]) / 2 - sn * 0.25 * u, (o[1] + e[1]) / 2 + cs * 0.2 * u], e], w: 0.15 * u, press: leaf, a: 0.8 * a.tone, sway: sw, seed: r() * 100, step: 2 })
    }
    out.push(dab(top[0], top[1], 0.3 * u, { a: 0.9 * a.tone, sway: sw, seed: r() * 100 }))
  }
  return out
}

// Đình hai tầng mái cong vút, cột, lan can, sàn trên cọc giữa hồ; bóng soi đứt quãng dưới nước. Toạ độ theo tỉ lệ khung.
const pavilion: Art = (a, u, r) => {
  const out: Stroke[] = []
  const t = a.tone, cx = a.x + a.w / 2
  const P = (x: number, y: number): Pt => [cx + x * a.w, a.y + y * a.h]
  const roof = (ry: number, ey: number, rw: number, ew: number, fw: number, fy: number) => {
    for (let k = 0; k < 5; k++) {
      const q = (k + 0.5) / 5, hw = rw + (ew - rw) * q
      out.push({ pts: [P(-hw, ry + (ey - ry) * q), P(hw, ry + (ey - ry) * q)], w: (((ey - ry) * a.h) / 5) * 0.75, press: flat, wet: 0.35, a: 0.25 * t, seed: r() * 100, step: 6 })
    }
    for (let k = 0; k <= 6; k++) {
      const q = k / 6 - 0.5
      out.push({ pts: [P(q * 2 * rw, ry + 0.01), P(q * 2 * ew * 0.94, ey - 0.012)], w: 0.06 * u, press: leaf, dry: 0.6, a: 0.35 * t, seed: r() * 100, step: 3 })
    }
    out.push({ pts: [P(-rw - 0.025, ry - 0.025), P(-rw, ry), P(rw, ry), P(rw + 0.025, ry - 0.025)], w: 0.24 * u, press: lift, dry: 0.4, a: 0.9 * t, seed: r() * 100, step: 3 })
    out.push({ pts: [P(-fw, fy), P(-ew, ey), P(0, ey - 0.012), P(ew, ey), P(fw, fy)], w: 0.2 * u, press: brush, dry: 0.45, a: 0.9 * t, seed: r() * 100, step: 3 })
    for (const d of [-1, 1]) out.push({ pts: [P(d * rw, ry), P(d * (rw + ew) * 0.52, (ry + ey) / 2 + 0.01), P(d * ew, ey)], w: 0.12 * u, press: leaf, dry: 0.5, a: 0.7 * t, seed: r() * 100, step: 3 })
  }
  roof(0.05, 0.22, 0.12, 0.32, 0.38, 0.12)
  out.push({ pts: [P(-0.16, 0.265), P(0.16, 0.265)], w: 0.04 * a.h, press: flat, wet: 0.5, a: 0.3 * t, seed: r() * 100, step: 6 })
  for (const x of [-0.16, -0.05, 0.05, 0.16]) out.push({ pts: [P(x, 0.22), P(x, 0.31)], w: 0.1 * u, press: lift, a: 0.8 * t, dry: 0.3, seed: r() * 100, step: 3 })
  roof(0.31, 0.44, 0.2, 0.5, 0.56, 0.36)
  out.push({ pts: [P(-0.4, 0.5), P(0.4, 0.5)], w: 0.05 * a.h, press: flat, wet: 0.6, a: 0.12 * t, seed: r() * 100, step: 6 })
  for (const x of [-0.42, -0.14, 0.14, 0.42]) out.push({ pts: [P(x, 0.44), P(x, 0.66)], w: 0.14 * u, press: lift, a: 0.85 * t, dry: 0.35, seed: r() * 100, step: 3 })
  out.push({ pts: [P(-0.47, 0.58), P(0.47, 0.58)], w: 0.1 * u, press: brush, a: 0.75 * t, dry: 0.45, seed: r() * 100, step: 3 })
  for (let k = -9; k <= 9; k++) out.push({ pts: [P(k * 0.05, 0.585), P(k * 0.05, 0.66)], w: 0.05 * u, press: lift, a: 0.5 * t, seed: r() * 100, step: 3 })
  out.push({ pts: [P(-0.52, 0.665), P(0.52, 0.66)], w: 0.22 * u, press: brush, a: 0.9 * t, dry: 0.4, seed: r() * 100, step: 3 })
  for (const x of [-0.46, -0.24, 0, 0.24, 0.46]) out.push({ pts: [P(x, 0.67), P(x + R(r, -0.01, 0.01), 0.77)], w: 0.1 * u, press: lift, a: 0.7 * t, dry: 0.4, seed: r() * 100, step: 3 })
  out.push({ pts: [P(-0.45, 0.87), P(0.45, 0.87)], w: 0.05 * a.h, press: flat, wet: 0.7, a: 0.08 * t, seed: r() * 100, step: 8 })
  for (let k = 0; k < 9; k++) {
    const y = 0.8 + k * 0.024, hw = 0.5 - k * 0.04 + R(r, -0.04, 0.04), x0 = R(r, -0.05, 0.05)
    out.push(...broken([P(x0 - hw, y), P(x0 - hw / 2, y + 0.003), P(x0, y + 0.004), P(x0 + hw / 2, y + 0.002), P(x0 + hw, y)], r, 2, { w: 0.08 * u, press: leaf, a: (0.28 - k * 0.025) * t, dry: 0.5, step: 4 }))
  }
  return out
}

// Liễu: thân xù gốc to, cành vồng ra; sợi liễu rủ do life.ts vẽ mỗi khung hình (lay theo gió cuộn).
interface Crown {
  trunk: Pt[]
  branches: Pt[][]
  strands: { p: Pt; L: number; ph: number }[]
}
const crowns = new WeakMap<Anchor, Crown>()
export function willowCrown(a: Anchor): Crown {
  const hit = crowns.get(a)
  if (hit) return hit
  const r = rng(a.seed * 7 + 11), sd = a.gap < 0.5 ? 1 : -1
  const b: Pt = [a.x + a.w * a.gap, a.y + a.h]
  const trunk: Pt[] = [b, [b[0] - sd * a.w * 0.04, a.y + a.h * 0.7], [b[0] + sd * a.w * 0.05, a.y + a.h * 0.42], [b[0] + sd * a.w * 0.1, a.y + a.h * 0.2]]
  const branches = [0.45, 0.65, 0.85, 1].map((q, i): Pt[] => {
    const s = along(trunk, q), d = i % 2 ? -sd : sd, L = a.w * R(r, 0.25, 0.45)
    return [s, [s[0] + d * L * 0.45, s[1] - R(r, 0.08, 0.16) * a.h], [s[0] + d * L, s[1] + R(r, 0, 0.12) * a.h]]
  })
  const strands = branches.flatMap((br) => Array.from({ length: 8 }, (_, k) => ({ p: along(br, 0.12 + k * 0.11), L: a.h * R(r, 0.3, 0.6), ph: r() * 6 })))
  const c = { trunk, branches, strands }
  crowns.set(a, c)
  return c
}
const willow: Art = (a, u, r) => {
  const { trunk, branches } = willowCrown(a)
  const out: Stroke[] = [{ pts: tight(trunk), w: 0.75 * u, press: (t) => 1 - 0.55 * t, dry: 0.65, a: 0.9 * a.tone, seed: r() * 100, step: 3 }]
  for (const br of branches) out.push({ pts: br, w: 0.28 * u, press: lift, dry: 0.55, a: 0.8 * a.tone, seed: r() * 100, step: 3 })
  for (let i = 0; i < 6; i++) {
    const p = along(trunk, R(r, 0.1, 0.9))
    out.push(dab(p[0] + R(r, -0.4, 0.4) * u, p[1], R(r, 0.12, 0.22) * u, { a: 0.8 * a.tone, seed: r() * 100 }))
  }
  const b = trunk[0]
  for (const d of [-1, 1]) out.push({ pts: [[b[0], b[1] - 0.8 * u], [b[0] + d * 1.6 * u, b[1] + 0.2 * u]], w: 0.3 * u, press: lift, dry: 0.6, a: 0.75 * a.tone, seed: r() * 100 })
  return out
}

// Đá kê bước qua suối: bậc đá dẹt loang, gờ trên khô đậm, gợn nước quanh chân; xếp chéo lên như bậc thang.
const stones: Art = (a, u, r) => {
  const out: Stroke[] = []
  for (let i = 0, n = 5 + Math.floor(r() * 3); i < n; i++) {
    const q = (i + R(r, 0.2, 0.8)) / n, cx = a.x + a.w * q, cy = a.y + a.h * (1 - q) + R(r, -0.5, 0.5) * u
    const rx = R(r, 1.2, 2) * u, ry = rx * R(r, 0.4, 0.5)
    out.push({ pts: [[cx - rx, cy], [cx + rx, cy]], w: ry, press: dot, wet: 0.8, a: 0.35 * a.tone, seed: r() * 100, step: 3 })
    out.push({ pts: arc(cx, cy, rx * 0.95, ry * 0.9, Math.PI * 1.05, Math.PI * 1.95, 8), w: 0.14 * u, press: brush, dry: 0.6, a: 0.8 * a.tone, seed: r() * 100, step: 3 })
    out.push(...broken(arc(cx, cy + ry * 0.3, rx * 1.5, ry * 1.4, 0.1 * Math.PI, 0.9 * Math.PI, 10), r, 2, { w: 0.07 * u, press: leaf, a: 0.3 * a.tone, step: 3 }))
    if (r() < 0.5) out.push(dab(cx + R(r, -0.5, 0.5) * rx, cy - ry * 0.6, 0.12 * u, { a: 0.85 * a.tone, seed: r() * 100 }))
  }
  return out
}

// Trăng "hông vân thác nguyệt": không vẽ trăng, chỉ loang mây quanh để chừa đĩa giấy trắng; viền mảnh đứt quãng.
const moon: Art = (a, u, r) => {
  const out: Stroke[] = []
  const cx = a.x + a.w / 2, cy = a.y + a.h / 2, rad = Math.min(a.w, a.h) * 0.24
  for (const [k, al, ww] of [[1.45, 0.11, 0.42], [2.1, 0.06, 0.5]] as const) {
    for (let i = 0; i < 4; i++) {
      const a0 = (i / 4) * Math.PI * 2 + R(r, -0.2, 0.2)
      out.push({ pts: arc(cx, cy, rad * k, rad * k, a0, a0 + Math.PI * R(r, 0.6, 0.75), 10), w: rad * ww, press: flat, wet: 1, a: al * a.tone, seed: r() * 100, step: 8 })
    }
  }
  out.push(...broken(arc(cx, cy, rad, rad, 0, Math.PI * 2, 28), r, 4, { w: 0.07 * u, press: leaf, a: 0.25 * a.tone, dry: 0.4, step: 3 }))
  return out
}

/** Chuối: thân mập, tàu lá to rủ hai bên. */
function banana(out: Stroke[], r: Rnd, x: number, gy: number, s: number, u: number, t: number) {
  const top: Pt = [x + 0.05 * s, gy - 0.7 * s]
  out.push({ pts: [[x, gy], top], w: 0.28 * u, press: (q) => 1 - 0.4 * q, dry: 0.4, a: 0.75 * t, seed: r() * 100, step: 3 })
  for (let k = 0; k < 5; k++) {
    const th = -1.3 + (2.6 * k) / 4 + R(r, -0.15, 0.15), L = R(r, 0.5, 0.7) * s
    const e: Pt = [top[0] + Math.sin(th) * L, top[1] - Math.cos(th) * L * 0.4 + Math.abs(Math.sin(th)) * 0.3 * s]
    out.push({ pts: [top, [top[0] + Math.sin(th) * L * 0.5, top[1] - Math.cos(th) * L * 0.5], e], w: 0.32 * u, press: leaf, wet: 0.3, a: 0.7 * t, seed: r() * 100, step: 3 })
  }
}
/** Cau: thân mảnh vút cao, tàu lá xoè cong. */
function areca(out: Stroke[], r: Rnd, x: number, gy: number, s: number, u: number, t: number) {
  const top: Pt = [x + R(r, -0.15, 0.15) * s, gy - 1.7 * s]
  out.push({ pts: [[x, gy], [(x + top[0]) / 2 + 0.05 * s, gy - 0.85 * s], top], w: 0.1 * u, press: (q) => 1 - 0.4 * q, dry: 0.3, a: 0.8 * t, seed: r() * 100, step: 3 })
  for (let k = 0; k < 6; k++) {
    const th = -1.4 + (2.8 * k) / 5, L = 0.5 * s
    out.push({ pts: [top, [top[0] + Math.sin(th) * L * 0.5, top[1] - Math.cos(th) * L * 0.4 - 0.1 * s], [top[0] + Math.sin(th) * L, top[1] - Math.cos(th) * L * 0.3 + 0.15 * s]], w: 0.13 * u, press: leaf, a: 0.75 * t, seed: r() * 100, step: 3 })
  }
}
/** Trâu đứng gặm cỏ, mục đồng đội nón ngồi trên lưng. */
function buffalo(out: Stroke[], r: Rnd, x: number, gy: number, s: number, t: number, dir: number) {
  const B = (dx: number, dy: number): Pt => [x + dir * dx * s, gy + dy * s]
  const at = (dx: number, dy: number, w: number, o: Partial<Stroke>) => {
    const [px, py] = B(dx, dy)
    out.push(dab(px, py, w, { seed: r() * 100, ...o }))
  }
  out.push({ pts: [B(-0.45, -0.42), B(0.3, -0.45)], w: 0.17 * s, press: dot, wet: 0.5, a: 0.75 * t, seed: r() * 100 })
  at(0.44, -0.38, 0.09 * s, { a: 0.85 * t })
  for (const k of [-1, 1]) out.push({ pts: [B(0.4, -0.46), B(0.4 + k * 0.08, -0.58), B(0.4 + k * 0.16, -0.55)], w: 0.025 * s, press: leaf, a: 0.85 * t, seed: r() * 100 })
  for (const dx of [-0.38, -0.27, 0.14, 0.24]) out.push({ pts: [B(dx, -0.33), B(dx + 0.02, 0)], w: 0.035 * s, press: lift, a: 0.8 * t, dry: 0.3, seed: r() * 100 })
  out.push({ pts: [B(-0.6, -0.46), B(-0.68, -0.32), B(-0.66, -0.2)], w: 0.015 * s, press: lift, a: 0.7 * t, seed: r() * 100 })
  out.push({ pts: [B(-0.06, -0.6), B(-0.04, -0.76)], w: 0.06 * s, press: dot, a: 0.85 * t, seed: r() * 100 })
  out.push({ pts: [B(-0.17, -0.78), B(-0.04, -0.87), B(0.09, -0.78)], w: 0.03 * s, press: leaf, a: 0.9 * t, seed: r() * 100 })
}

// Làng: nhà mái tranh (có nhà sàn khi gap ≥ .5), chuối, cau, rào tre, đống rơm, trâu và mục đồng.
const village: Art = (a, u, r) => {
  const out: Stroke[] = []
  const gy = a.y + a.h, s = a.h * 0.45, t = a.tone
  out.push(...broken([[a.x, gy], [a.x + a.w * 0.5, gy + 0.2 * u], [a.x + a.w, gy]], r, 3, { w: 0.14 * u, press: brush, dry: 0.7, a: 0.55 * t, step: 4 }))
  const n = 2 + Math.floor(r() * 2)
  for (let i = 0; i < n; i++) {
    const hx = a.x + (a.w * (i + R(r, 0.35, 0.65))) / n, stilt = a.gap >= 0.5 && r() < 0.8, fy = gy - (stilt ? 0.35 * s : 0)
    const H = (x: number, y: number): Pt => [hx + x * s, fy + y * s]
    for (let k = 0; k < 4; k++) {
      const q = (k + 0.5) / 4, hw = 0.3 + 0.45 * q
      out.push({ pts: [H(-hw, -0.85 + 0.45 * q), H(hw, -0.85 + 0.45 * q)], w: 0.065 * s, press: flat, wet: 0.5, a: 0.3 * t, seed: r() * 100, step: 6 })
    }
    out.push({ pts: tight([H(-0.82, -0.36), H(-0.3, -0.86), H(0.3, -0.86), H(0.82, -0.36)]), w: 0.16 * u, press: lift, dry: 0.5, a: 0.85 * t, seed: r() * 100, step: 3 })
    for (let k = 0; k < 6; k++) {
      const x0 = -0.28 + (0.56 * k) / 5
      out.push({ pts: [H(x0, -0.83), H(x0 * 2.5, -0.42)], w: 0.08 * u, press: leaf, dry: 0.8, a: 0.45 * t, seed: r() * 100, step: 3 })
    }
    for (const d of [-1, 1]) out.push({ pts: [H(d * 0.55, -0.4), H(d * 0.55, 0)], w: 0.1 * u, press: lift, a: 0.8 * t, dry: 0.3, seed: r() * 100, step: 3 })
    out.push({ pts: [H(-0.62, 0), H(0.62, 0)], w: 0.14 * u, press: brush, a: 0.85 * t, dry: 0.4, seed: r() * 100, step: 3 })
    out.push({ pts: [H(0.15, -0.32), H(0.15, -0.02)], w: 0.1 * s, press: even, wet: 0.3, a: 0.6 * t, seed: r() * 100, step: 3 })
    out.push(dab(...H(-0.3, -0.22), 0.08 * s, { a: 0.45 * t, seed: r() * 100 }))
    if (stilt) {
      for (const x of [-0.5, -0.17, 0.17, 0.5]) out.push({ pts: [H(x, 0), [hx + x * s, gy]], w: 0.08 * u, press: lift, a: 0.75 * t, dry: 0.3, seed: r() * 100, step: 3 })
      for (const o of [0.2, 0.32]) out.push({ pts: [H(o, 0), [hx + (o + 0.25) * s, gy]], w: 0.05 * u, press: lift, a: 0.7 * t, seed: r() * 100, step: 3 })
      for (let k = 1; k <= 3; k++) {
        const q = k / 4, y = fy + (gy - fy) * q
        out.push({ pts: [[hx + (0.2 + 0.25 * q) * s, y], [hx + (0.32 + 0.25 * q) * s, y]], w: 0.04 * u, press: lift, a: 0.7 * t, seed: r() * 100 })
      }
    }
    const px = hx + (r() < 0.5 ? -1 : 1) * R(r, 0.95, 1.3) * s
    if (r() < 0.5) banana(out, r, px, gy, s, u, t)
    else areca(out, r, px, gy, s, u, t)
  }
  // Rào tre chạy dọc sân.
  const fx0 = a.x + a.w * R(r, 0.05, 0.2), fx1 = fx0 + a.w * R(r, 0.25, 0.35)
  out.push({ pts: [[fx0, gy - 0.22 * s], [fx1, gy - 0.2 * s]], w: 0.06 * u, press: brush, dry: 0.5, a: 0.6 * t, seed: r() * 100, step: 3 })
  for (let x = fx0; x <= fx1; x += 0.22 * s) out.push({ pts: [[x, gy + 0.02 * s], [x + R(r, -0.02, 0.02) * s, gy - 0.32 * s]], w: 0.05 * u, press: lift, a: 0.65 * t, seed: r() * 100, step: 3 })
  if (r() < 0.6) {
    const x = a.x + a.w * R(r, 0.7, 0.9)
    out.push({ pts: [[x - 0.35 * s, gy - 0.16 * s], [x + 0.35 * s, gy - 0.16 * s]], w: 0.24 * s, press: dot, wet: 0.5, a: 0.35 * t, seed: r() * 100 })
    out.push({ pts: arc(x, gy, 0.36 * s, 0.42 * s, Math.PI * 1.08, Math.PI * 1.92, 8), w: 0.1 * u, press: brush, dry: 0.7, a: 0.7 * t, seed: r() * 100, step: 3 })
  }
  if (a.gap < 0.5) buffalo(out, r, a.x + a.w * R(r, 0.55, 0.75), gy, s, t, r() < 0.5 ? 1 : -1)
  return out
}

// Một nét quét lớn, khô xơ (phi bạch) vắt ngang trang: nhịp nghỉ giữa hai cảnh.
const swash: Art = (a, u, r) => {
  const P = (x: number, y: number): Pt => [a.x + a.w * x, a.y + a.h * y]
  const pts = [P(0, 0.75), P(0.22, 0.3), P(0.5, 0.45), P(0.78, 0.7), P(1, 0.2)]
  return [
    { pts, w: 1.6 * u, press: brush, dry: 0.85, a: 0.55 * a.tone, seed: r() * 100, step: 4 },
    { pts: pts.map(([x, y]): Pt => [x + 1.2 * u, y + 1.4 * u]), w: 0.35 * u, press: brush, dry: 0.9, a: 0.35 * a.tone, seed: r() * 100, step: 4 },
  ]
}

// Tháp năm tầng nhạt trên núi xa: mỗi tầng một mái cong và một vệt loang.
const tower: Art = (a, u, r) => {
  const out: Stroke[] = []
  const cx = a.x + a.w / 2, th = a.h / 6, t = a.tone
  for (let i = 0; i < 5; i++) {
    const y = a.y + a.h - i * th, bw = a.w * (0.3 - i * 0.045), rw = bw * 1.6
    for (const d of [-1, 1]) out.push({ pts: [[cx + d * bw, y], [cx + d * bw, y - th * 0.55]], w: 0.07 * u, press: lift, a: 0.7 * t, seed: r() * 100, step: 3 })
    out.push({ pts: [[cx - rw * 0.75, y - th * 0.64], [cx + rw * 0.75, y - th * 0.64]], w: th * 0.12, press: flat, wet: 0.5, a: 0.3 * t, seed: r() * 100, step: 4 })
    out.push({ pts: [[cx - rw, y - th * 0.72], [cx - rw * 0.8, y - th * 0.55], [cx + rw * 0.8, y - th * 0.55], [cx + rw, y - th * 0.72]], w: 0.13 * u, press: brush, dry: 0.4, a: 0.8 * t, seed: r() * 100, step: 3 })
  }
  out.push({ pts: [[cx, a.y + th], [cx, a.y]], w: 0.07 * u, press: lift, a: 0.7 * t, seed: r() * 100, step: 3 })
  return out
}

export const MOTIFS2: Record<string, Art> = { orchid, chrys, pavilion, willow, stones, moon, village, swash, tower }
