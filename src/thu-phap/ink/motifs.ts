import { SON, brush, dot, leaf, type Pt, type Stroke } from './stroke'
import { PAPER, R, along, arc, broken, dab, flat, inkWash, lift, tight, type Rnd } from './kit'
import type { Art } from './scene'

/**
 * Vật trang trí tĩnh: mặt trời son, núi xa, tùng, trúc, sen, cầu đá, cành mai.
 * a.gap (0..1) = chỗ đặt gốc theo bề ngang khung; cây ngả về phía rộng hơn.
 */

/** Lay gió: ngọn (cách gốc h px) lệch amp px khi gió = 1. */
export const sway = (base: number, amp: number, h: number) => [base, amp / Math.max(1, h * h)] as const

/** Tùng: thân gầy cong ngả ra khoảng trống, cành ngang so le (dài hơn phía ngả), mỗi cành đỡ một tán dẹt hai lớp.
 *  Tán xếp tầng giữa thân thì thành tháp chùa; thân ngắn đội tán thì thành cây nấm. */
export function pine(r: Rnd, b: Pt, lean: number, s: number, al: number, extra: Partial<Stroke> = {}): Stroke[] {
  const out: Stroke[] = []
  const tp: Pt = [b[0] + Math.sin(lean) * s, b[1] - Math.cos(lean) * s]
  const bend = R(r, 0.15, 0.3) * s * (r() < 0.5 ? 1 : -1)
  const trunk: Pt[] = [b, [(b[0] + tp[0]) / 2 + Math.cos(lean) * bend, (b[1] + tp[1]) / 2 + Math.sin(lean) * bend], tp]
  out.push({ pts: trunk, w: 0.06 * s, press: lift, dry: 0.55, a: 0.9 * al, seed: r() * 100, ...extra })
  const side = Math.sign(Math.sin(lean)) || 1
  for (let i = 0, n = 2 + Math.floor(r() * 2); i <= n; i++) {
    const p = along(trunk, 0.4 + (0.6 * i) / n)
    const sd = i === n || i % 2 ? side : -side
    const bl = i === n ? 0 : s * R(r, 0.2, 0.4) * (sd === side ? 1.4 : 0.8)
    const e: Pt = [p[0] + sd * bl, p[1] - bl * R(r, 0, 0.3)]
    if (bl) out.push({ pts: [p, [(p[0] + e[0]) / 2, (p[1] + e[1]) / 2 + 0.06 * s], e], w: 0.035 * s, press: lift, dry: 0.5, a: 0.85 * al, seed: r() * 100, ...extra })
    const hw = s * R(r, 0.2, 0.32)
    for (let k = 0; k < 2; k++) {
      const y = e[1] + k * 0.07 * s, x = e[0] + R(r, -0.08, 0.08) * s
      out.push({ pts: [[x - hw, y + 0.04 * s], [x, y - 0.05 * s], [x + hw, y + 0.05 * s]], w: (0.1 - 0.03 * k) * s, press: leaf, wet: 0.6, dry: 0.3, a: (0.85 - 0.25 * k) * al, seed: r() * 100, ...extra })
    }
  }
  return out
}

// Mặt trời son: một đốm loang tròn, mép nở không đều như giọt son thấm giấy.
const sun: Art = (a, _u, r) => {
  const rad = a.w / 2, cx = a.x + rad, cy = a.y + rad
  return [
    { pts: [[cx - rad, cy], [cx + rad, cy]], w: rad, press: dot, col: SON, wet: 1, a: 0.42 * a.tone, seed: r() * 100, step: 3 },
    { pts: [[cx - rad * 0.8, cy + rad * 0.06], [cx + rad * 0.78, cy - rad * 0.05]], w: rad * 0.78, press: dot, col: SON, wet: 0.9, a: 0.22 * a.tone, seed: r() * 100, step: 3 },
  ]
}

// Núi xa: chỉ còn bóng loang nhạt và một sống núi khô đứt quãng (lớp xa nhất, trôi chậm khi cuộn).
const far: Art = (a, u, r) => {
  const pk = [R(r, 0.15, 0.4), R(r, 0.55, 0.85)], ph = [r() * 6, r() * 6]
  const H = (t: number) =>
    Math.max(0.15, Math.exp(-(((t - pk[0]) / 0.12) ** 2) / 2), 0.7 * Math.exp(-(((t - pk[1]) / 0.1) ** 2) / 2)) +
    0.06 * Math.sin(t * 17 + ph[0]) + 0.04 * Math.sin(t * 41 + ph[1])
  const ridge = Array.from({ length: 41 }, (_, i): Pt => [a.x + (a.w * i) / 40, a.y + a.h * (1 - H(i / 40))])
  return [...inkWash(ridge, a.h * 0.6, 0.06 * a.tone, 0.02 * a.tone, r), ...broken(ridge, r, 3, { w: 0.22 * u, dry: 0.65, a: 0.3 * a.tone, press: brush })]
}

// Tùng trên gò đá nhỏ, ngả về phía khoảng trống; tán lay nhẹ theo gió.
const tree: Art = (a, u, r) => {
  const sd = a.gap < 0.5 ? 1 : -1
  const b: Pt = [a.x + a.w * a.gap, a.y + a.h]
  const s = a.h * 0.85, kw = Math.max(3 * u, a.w * 0.3)
  const out: Stroke[] = [
    { pts: [[b[0] - kw, b[1]], [b[0] + kw, b[1]]], w: 1.1 * u, press: dot, wet: 0.8, a: 0.22 * a.tone, seed: r() * 100 },
    { pts: tight([[b[0] - kw, b[1] + 0.3 * u], [b[0] - kw * 0.35, b[1] - 1.2 * u], [b[0] + kw * 0.3, b[1] - 0.9 * u], [b[0] + kw, b[1] + 0.2 * u]]), w: 0.3 * u, dry: 0.55, a: 0.85 * a.tone, press: lift, seed: r() * 100 },
  ]
  for (let i = 0; i < 4; i++) out.push(dab(b[0] + R(r, -0.7, 0.7) * kw, b[1] - R(r, 0.6, 1.2) * u, R(r, 0.16, 0.28) * u, { a: 0.8 * a.tone, seed: r() * 100 }))
  return [...out, ...pine(r, [b[0], b[1] - 0.8 * u], sd * R(r, 0.25, 0.45), s, a.tone, { sway: sway(b[1], 0.6 * u, s) })]
}

// Trúc: vài cây so le (cây sau nhạt), thân chia đốt có mắt, lá chụm kiểu chữ "个" rủ xuống; cả cây lay theo gió.
const blade = (t: number) => Math.sqrt(Math.min(1, t / 0.15)) * (1 - t) ** 0.7
const bamboo: Art = (a, u, r) => {
  const out: Stroke[] = []
  const base = a.y + a.h
  for (let i = 0, n = 2 + Math.floor(r() * 2); i < n; i++) {
    const front = i === 0
    const x0 = a.x + a.w * (front ? a.gap : R(r, 0.1, 0.9))
    const tilt = R(r, -0.1, 0.1), top = a.y + a.h * R(r, 0, 0.25), H = base - top
    const cw = R(r, 0.4, 0.55) * u * (front ? 1.25 : 1), tone = (front ? 1 : R(r, 0.4, 0.6)) * a.tone
    const sw = sway(base, R(r, 0.9, 1.4) * u, H)
    const P = (y: number): Pt => [x0 + (base - y) * tilt, y]
    const segs = Math.max(4, Math.round(H / (R(r, 5, 7) * u)))
    for (let k = 0; k < segs; k++) {
      const y0 = base - (H * k) / segs, y1 = base - (H * (k + 1)) / segs
      out.push({ pts: [P(y0 - 0.3 * u), P(y1 + 0.3 * u)], w: cw * (1 - (0.3 * k) / segs), press: (t) => 0.9 + 0.1 * Math.abs(2 * t - 1), dry: 0.5, a: 0.7 * tone, sway: sw, seed: r() * 100, step: 4 })
      if (k === segs - 1) continue
      const [nx, ny] = P(y1)
      out.push({ pts: [[nx - cw * 1.3, ny + 0.15 * u], [nx, ny - 0.15 * u], [nx + cw * 1.3, ny + 0.15 * u]], w: 0.16 * u, press: leaf, a: 0.85 * tone, dry: 0.3, sway: sw, seed: r() * 100 })
      if (k < segs * 0.4 || r() < 0.3) continue
      // Cành nhỏ rồi một chùm lá rủ.
      const sd = r() < 0.5 ? -1 : 1
      const tw: Pt = [nx + sd * R(r, 1.2, 2.6) * u, ny - R(r, 0.4, 1.4) * u]
      out.push({ pts: [[nx, ny], tw], w: 0.1 * u, press: lift, a: 0.7 * tone, dry: 0.4, sway: sw, seed: r() * 100 })
      for (let j = 0, m = 2 + Math.floor(r() * 3); j < m; j++) {
        const th = R(r, 0.35, 1.35), L = R(r, 2.6, 4.4) * u, dx = sd * Math.sin(th), dy = Math.cos(th)
        const mid: Pt = [tw[0] + dx * L * 0.5 + dy * 0.3 * u * sd, tw[1] + dy * L * 0.5 - dx * 0.3 * u * sd]
        out.push({ pts: [tw, mid, [tw[0] + dx * L, tw[1] + dy * L]], w: R(r, 0.42, 0.62) * u, press: blade, a: R(r, 0.75, 0.95) * tone, dry: 0.2, sway: sw, seed: r() * 100 })
      }
    }
  }
  return out
}

// Sen: lá nổi dẹt (nhìn xiên trên mặt nước), một hoa son nở và một nụ trên cuống mảnh lay theo gió, gợn nước dưới lá.
const lotus: Art = (a, u, r) => {
  const out: Stroke[] = []
  const wy = a.y + a.h
  for (let i = 0, n = 3 + Math.floor(r() * 3); i < n; i++) {
    const cx = a.x + (a.w * (i + R(r, 0.15, 0.85))) / n, cy = wy - R(r, 0, 0.2) * a.h
    // Lá là mảng mực loang đậm, lõi đậm hơn, có khe chữ V và gân toả từ tâm. Viền đậm quanh mép thì thành cái đĩa.
    const rx = R(r, 2.2, 3.8) * u, ry = rx * R(r, 0.28, 0.4)
    out.push({ pts: [[cx - rx, cy], [cx + rx, cy]], w: ry, press: dot, wet: 0.9, a: R(r, 0.4, 0.55) * a.tone, seed: r() * 100, step: 3 })
    out.push({ pts: [[cx - rx * 0.55, cy - ry * 0.2], [cx + rx * 0.6, cy - ry * 0.1]], w: ry * 0.6, press: dot, wet: 0.9, a: 0.22 * a.tone, seed: r() * 100, step: 3 })
    const nt = R(r, 0.3, 0.7) * Math.PI
    out.push({ pts: [[cx, cy], [cx + rx * 1.05 * Math.cos(nt), cy + ry * 1.05 * Math.sin(nt)]], w: 0.4 * u, press: (t) => 0.15 + 0.85 * t, col: PAPER, a: 0.95, seed: r() * 100 })
    for (let k = 0; k < 6; k++) {
      const th = nt + 0.5 + (k * (2 * Math.PI - 1)) / 5
      out.push({ pts: [[cx, cy], [cx + rx * 0.8 * Math.cos(th), cy + ry * 0.8 * Math.sin(th)]], w: 0.06 * u, press: leaf, a: 0.3 * a.tone, seed: r() * 100 })
    }
    out.push({ pts: [[cx - rx * 1.4, cy + ry * 1.4], [cx, cy + ry * 1.6], [cx + rx * 1.3, cy + ry * 1.35]], w: 0.08 * u, press: leaf, a: 0.3 * a.tone, dry: 0.4, seed: r() * 100 })
  }
  const stem = (x: number, y: number) => {
    const sw = sway(wy, 0.7 * u, wy - y)
    out.push({ pts: [[x + R(r, -1, 1) * u, wy], [x + R(r, -0.6, 0.6) * u, (wy + y) / 2], [x, y]], w: 0.13 * u, press: (t) => 1 - 0.4 * t, a: 0.75 * a.tone, dry: 0.4, sway: sw, seed: r() * 100 })
    return sw
  }
  // Hoa: năm cánh xoè từ đài, hai cánh trước viền mực.
  const fx = a.x + a.w * a.gap, fy = a.y + a.h * R(r, 0, 0.12)
  const fs = stem(fx, fy + 0.6 * u)
  for (let k = 0; k < 5; k++) {
    const th = -1.05 + (2.1 * k) / 4 + R(r, -0.1, 0.1), L = R(r, 2, 2.7) * u * (k === 2 ? 1.1 : 0.95)
    const tip: Pt = [fx + Math.sin(th) * L, fy - Math.cos(th) * L * 0.9]
    const mid: Pt = [fx + Math.sin(th) * L * 0.55 * 1.25, fy - Math.cos(th) * L * 0.5]
    out.push({ pts: [[fx, fy + 0.4 * u], mid, tip], w: 0.7 * u, press: leaf, col: SON, a: 0.5 * a.tone, wet: 0.5, sway: fs, seed: r() * 100 })
    if (k === 1 || k === 3) out.push({ pts: [[fx, fy + 0.4 * u], mid, tip], w: 0.08 * u, press: leaf, a: 0.6 * a.tone, dry: 0.4, sway: fs, seed: r() * 100 })
  }
  const bx = fx + (a.gap < 0.5 ? 1 : -1) * R(r, 3, 5) * u, by = fy + R(r, 1, 2.5) * u
  const bs = stem(bx, by + 0.6 * u)
  out.push({ pts: [[bx, by + 0.8 * u], [bx + 0.1 * u, by - 0.4 * u], [bx - 0.05 * u, by - 1.4 * u]], w: 0.55 * u, press: leaf, col: SON, a: 0.55 * a.tone, wet: 0.4, sway: bs, seed: r() * 100 })
  return out
}

// Cầu đá vòm bắc qua suối: mặt cầu cong, lan can, vòng cầu soi bóng thành vòng tròn; một người đội nón đi qua.
const bridge: Art = (a, u, r) => {
  const out: Stroke[] = []
  const x0 = a.x, wy = a.y + a.h * 0.8, top = a.y + a.h * 0.3, foot = wy - 0.6 * u
  const deck = (t: number): Pt => [x0 + a.w * t, foot - (foot - top) * Math.sin(Math.PI * t) ** 0.7]
  const D = Array.from({ length: 13 }, (_, i) => deck(i / 12))
  out.push({ pts: D, w: 0.34 * u, dry: 0.55, a: 0.9, press: lift, seed: r() * 100 })
  out.push({ pts: D.slice(1, -1).map(([x, y]): Pt => [x, y + 0.9 * u]), w: 0.16 * u, dry: 0.5, a: 0.5, press: leaf, seed: r() * 100 })
  out.push(...broken(D.slice(2, -2).map(([x, y]): Pt => [x, y - 1.5 * u]), r, 2, { w: 0.15 * u, dry: 0.5, a: 0.75, press: leaf }))
  for (let t = 0.18; t <= 0.83; t += 0.08) {
    const [x, y] = deck(t)
    out.push({ pts: [[x, y - 0.1 * u], [x + 0.05 * u, y - 1.55 * u]], w: 0.11 * u, press: lift, a: 0.7, dry: 0.4, seed: r() * 100 })
  }
  const ax = x0 + a.w / 2, ar = a.w * 0.26, ah = Math.min(wy - top - 1.6 * u, ar * 1.05)
  out.push({ pts: arc(ax, wy, ar * 0.82, ah * 0.75, Math.PI * 1.08, Math.PI * 1.92, 10), w: 0.9 * u, wet: 0.8, a: 0.16, press: flat, seed: r() * 100 })
  out.push({ pts: arc(ax, wy, ar, ah, Math.PI, 2 * Math.PI, 14), w: 0.26 * u, dry: 0.5, a: 0.85, press: brush, seed: r() * 100 })
  out.push(...broken(arc(ax, wy, ar, ah * 0.8, 0.06 * Math.PI, 0.94 * Math.PI, 14), r, 3, { w: 0.13 * u, a: 0.3, dry: 0.5, press: leaf }))
  for (let i = 0; i < 5; i++) {
    const [x, y] = deck(R(r, 0.08, 0.92))
    out.push({ pts: [[x, y + R(r, 1.3, 2.4) * u], [x + R(r, 0.6, 1.2) * u, y + R(r, 1.3, 2.4) * u]], w: 0.1 * u, a: 0.4, dry: 0.5, press: leaf, seed: r() * 100 })
  }
  for (const [x, d] of [[x0, -1], [x0 + a.w, 1]] as const) out.push({ pts: [[x + d * 2.5 * u, wy + 0.3 * u], [x, foot + 0.2 * u]], w: 0.24 * u, press: lift, dry: 0.5, a: 0.75, seed: r() * 100 })
  // Người qua cầu: nón lá, áo, gậy.
  const [fx, fy] = deck(R(r, 0.36, 0.44))
  out.push({ pts: [[fx - 0.7 * u, fy - 2.05 * u], [fx, fy - 2.55 * u], [fx + 0.7 * u, fy - 2.05 * u]], w: 0.22 * u, press: leaf, a: 0.9, seed: r() * 100 })
  out.push({ pts: [[fx, fy - 2 * u], [fx + 0.15 * u, fy - 1 * u], [fx + 0.05 * u, fy - 0.1 * u]], w: 0.36 * u, press: brush, a: 0.85, dry: 0.3, seed: r() * 100 })
  out.push({ pts: [[fx + 0.5 * u, fy - 2.1 * u], [fx + 0.85 * u, fy]], w: 0.07 * u, press: lift, a: 0.8, seed: r() * 100 })
  return out
}

// Cành mai: cành già gãy khúc, khô xơ, vươn từ mép khung; chồi non thẳng tắp; hoa năm cánh son, nụ son, nhị mực.
const plum: Art = (a, u, r) => {
  const out: Stroke[] = []
  const sd = a.gap >= 0.5 ? -1 : 1
  const grow = (from: Pt, ang: number, n: number, L: number, turn: number): Pt[] => {
    const pts: Pt[] = [from]
    for (let k = 0; k < n; k++) {
      ang = Math.max(-0.5, Math.min(1.1, ang + R(r, -turn, turn)))
      const p = pts[pts.length - 1]
      pts.push([p[0] + sd * Math.cos(ang) * L * R(r, 0.7, 1.2), p[1] + Math.sin(ang) * L * R(r, 0.7, 1.2)])
    }
    return pts
  }
  const main = grow([sd < 0 ? a.x + a.w : a.x, a.y + a.h * R(r, 0.05, 0.3)], R(r, 0.15, 0.45), 5, (a.w * 0.8) / 5, 0.55)
  out.push({ pts: tight(main), w: 0.95 * u, dry: 0.75, a: 0.9 * a.tone, press: (t) => 1 - 0.7 * t, seed: r() * 100, step: 3 })
  const tips: Pt[] = [main[main.length - 1]]
  const flowers: Pt[] = []
  for (let k = 1; k < main.length - 1; k++) {
    if (r() < 0.35) continue
    const br = grow(main[k], R(r, -0.4, 0.9), 2 + Math.floor(r() * 2), R(r, 3, 5) * u, 0.5)
    out.push({ pts: tight(br), w: 0.45 * u, dry: 0.65, a: 0.85 * a.tone, press: (t) => 1 - 0.6 * t, seed: r() * 100 })
    tips.push(br[br.length - 1])
    flowers.push(br[1])
    // Chồi non: thẳng, vút lên.
    const p = br[Math.floor(r() * br.length)], L = R(r, 3, 6) * u, th = R(r, -1.4, -0.7)
    const e: Pt = [p[0] + sd * Math.cos(th) * L * 0.5, p[1] + Math.sin(th) * L]
    out.push({ pts: [p, e], w: 0.14 * u, press: lift, a: 0.8 * a.tone, dry: 0.3, seed: r() * 100 })
    tips.push(e)
  }
  for (let k = 1; k < main.length - 1; k++) flowers.push(main[k])
  for (let i = 0; i < 6; i++) {
    const p = main[1 + Math.floor(r() * (main.length - 2))]
    out.push(dab(p[0] + R(r, -0.5, 0.5) * u, p[1] - R(r, 0.3, 0.9) * u, R(r, 0.14, 0.24) * u, { a: 0.9 * a.tone, seed: r() * 100 }))
  }
  // Hoa ở chỗ rẽ cành, nụ ở đầu cành.
  for (const p of flowers) {
    const c: Pt = [p[0] + R(r, -0.8, 0.8) * u, p[1] + R(r, -0.9, 0.3) * u], rot = r() * 6, pr = R(r, 0.5, 0.7) * u
    for (let k = 0; k < 5; k++) {
      const th = rot + (k * 2 * Math.PI) / 5
      out.push(dab(c[0] + Math.cos(th) * pr, c[1] + Math.sin(th) * pr, pr * 0.62, { col: SON, a: 0.5 * a.tone, wet: 0.6, seed: r() * 100 }))
    }
    for (let k = 0; k < 4; k++) {
      const th = r() * 6
      out.push({ pts: [c, [c[0] + Math.cos(th) * pr * 0.9, c[1] + Math.sin(th) * pr * 0.9]], w: 0.05 * u, press: leaf, a: 0.8 * a.tone, seed: r() * 100 })
    }
  }
  for (const p of tips) out.push(dab(p[0], p[1], R(r, 0.22, 0.32) * u, { col: SON, a: 0.7 * a.tone, wet: 0.3, seed: r() * 100 }))
  return out
}

export const MOTIFS: Record<string, Art> = { sun, far, tree, bamboo, lotus, bridge, plum }
