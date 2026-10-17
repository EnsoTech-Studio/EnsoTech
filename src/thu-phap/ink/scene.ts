import { Path, brush, dot, leaf, type Pt, type Stroke } from './stroke'
import { PAPER, R, along, arcLen, broken, dab, flat, jag, lerp, lift, rng, span, tight, inkWash, type Rnd } from './kit'
import { MOTIFS, pine } from './motifs'
import { MOTIFS2 } from './motifs2'

/**
 * Cảnh tĩnh: mỗi điểm neo trên trang (núi, đá, lau, vách thác…) thành một nhóm nét bút.
 * Toạ độ là px thế giới. u = "một nét chuẩn" (px), để bề dày nét đồng đều dù khung neo to nhỏ.
 */

export interface Anchor {
  art: string
  x: number
  y: number
  w: number
  h: number
  o: number
  seed: number
  tone: number
  gap: number
  over: boolean
  d: number
  f?: number[]
  /** 1 = nằm trên sân khấu màn cuối (dọc: dính màn hình). */
  group: number
  /** Cửa sổ vẽ theo thước cuộn (px); client tính. */
  t0: number
  t1: number
  /** Chiều sâu khi cuộn: dương = lớp xa (trôi theo máy quay), âm = lớp gần. home = tâm khung nhìn lúc vật đứng đúng chỗ. */
  par: number
  home: Pt
}

export type Rect = readonly [x: number, y: number, w: number, h: number]

export interface Scene {
  back: Stroke[]
  front: Stroke[]
  stream: Path | null
  lip: Pt | null
  pool: Pt | null
  sky: Rect | null
  /** Nhóm của lip/pool/sky. */
  stage: number
  /** Thước vẽ tại quãng s dọc suối (để cánh hoa trôi chỉ hiện trên khúc suối đã vẽ). */
  streamT: ((s: number) => number) | null
  /** Điểm neo của vật chuyển động (chim, thuyền, hoa rơi), vẽ lại mỗi khung hình. */
  life: Anchor[]
}

export interface Ctx {
  lip: Pt | null
}
export type Art = (a: Anchor, u: number, r: Rnd, c: Ctx) => Stroke[]

// Núi: sống núi khô, mảng mực loang tan vào sương, nét phi ma bì, chấm rêu.
const mount: Art = (a, u, r) => {
  const out: Stroke[] = []
  const tone = a.tone
  const pk = R(r, 0.3, 0.7), sg = R(r, 0.14, 0.22)
  const p2 = R(r, 0.08, 0.92), s2 = R(r, 0.07, 0.13), h2 = R(r, 0.35, 0.65)
  const ph = [r() * 6, r() * 6]
  const H = (t: number) =>
    Math.max(Math.exp(-(((t - pk) / sg) ** 2) / 2), h2 * Math.exp(-(((t - p2) / s2) ** 2) / 2), 0.1) +
    0.05 * Math.sin(t * 23 + ph[0]) + 0.03 * Math.sin(t * 51 + ph[1])
  const n = 48
  const ridge: Pt[] = []
  for (let i = 0; i <= n; i++) ridge.push([a.x + (a.w * i) / n, a.y + a.h * (1 - H(i / n))])

  out.push(...inkWash(ridge, a.h * 0.75, 0.08 * tone, 0.03 * tone, r))
  out.push(...broken(ridge, r, 2 + Math.floor(r() * 3), { w: R(r, 0.32, 0.5) * u, dry: 0.55, a: 0.9 * tone, press: brush }))

  // Nét phi ma: chạy xuôi theo sườn núi (hướng xuống, ra xa đỉnh), không rủ thẳng đứng. Mảnh và dày thì thành lá thông: thưa, bè, nhạt, ướt.
  const cun = Math.round((a.w / u) * 0.14)
  for (let i = 0; i < cun; i++) {
    const t = R(r, 0.04, 0.96)
    const h = H(t), sd = Math.sign(t - pk) || 1
    const [x, y] = [a.x + a.w * t, a.y + a.h * (1 - h) + R(r, 0.03, 0.1) * a.h]
    const dx = sd * a.w * 0.01, dy = a.h * (H(t) - H(t + sd * 0.01))
    const dl = Math.hypot(dx, dy) || 1, sx = dx / dl, sy = Math.max(0.35, dy / dl)
    const len = R(r, 0.15, 0.35) * a.h * Math.max(0.4, h)
    out.push({
      pts: [[x, y], [x + sx * len * 0.5 + R(r, -0.05, 0.05) * len, y + sy * len * 0.5], [x + sx * len, y + sy * len]],
      w: 0.45 * u, dry: 0.55, wet: 0.4, a: 0.16 * tone, press: lift, seed: r() * 100,
    })
  }
  for (let i = 0; i < 10; i++) {
    const t = r() < 0.6 ? pk + R(r, -1, 1) * sg : p2 + R(r, -1, 1) * s2
    const tt = Math.min(0.98, Math.max(0.02, t))
    out.push(dab(a.x + a.w * tt + R(r, -0.5, 0.5) * u, a.y + a.h * (1 - H(tt)) + R(r, -0.1, 0.6) * u, R(r, 0.22, 0.4) * u, { a: 0.75 * tone, dry: 0.2, wet: 0.3, seed: r() * 100 }))
  }
  return out
}

// Đá giữa suối: khối gãy góc, rộng hơn cao, lệch một bên. Hai nét viền cùng đặt bút ở đỉnh, đi xuống hai sườn và nhấc bút
// trước mặt nước (viền chạm chân thì thành chân côn trùng); mặt tối loang đậm, chồng nét rìu ngắn bè theo nét gấp.
const rock: Art = (a, u, r) => {
  const out: Stroke[] = []
  const w = a.w, h = a.h
  const cx = a.x + w / 2, rx = w / 2, ry = h / 2
  const base = a.y + h * 0.85
  const sd = r() < 0.5 ? 1 : -1
  // t = 0 phía sáng, 1 phía tối; sd lật gương để các hòn không cùng một dáng.
  const X = (t: number) => cx + sd * (t - 0.5) * w
  const L: Pt = [X(R(r, 0, 0.05)), base]
  const p1: Pt = [X(R(r, 0.08, 0.16)), a.y + h * R(r, 0.3, 0.45)]
  const p2: Pt = [X(R(r, 0.3, 0.42)), a.y + h * R(r, 0, 0.08)]
  const p3: Pt = [X(R(r, 0.62, 0.74)), a.y + h * R(r, 0.1, 0.22)]
  const p4: Pt = [X(R(r, 0.9, 0.97)), a.y + h * R(r, 0.38, 0.52)]
  const Rb: Pt = [X(1), base]
  const fb: Pt = [X(R(r, 0.5, 0.6)), base]
  // Thân đặc trước (chỉ có viền thì thành con cua / mái lều). Lấp bằng vệt ngang đúng bề ngang khối ở từng độ cao
  // (dải dọc thì thành hộp đèn); ướt ít để mép vệt không thành sọc. Mặt tối (sau nét gấp) chồng thêm lớp đậm.
  const poly = [L, p1, p2, p3, p4, Rb]
  // Vệt chồng nhau ~3 lớp thì không lộ sọc.
  const top = Math.min(p2[1], p3[1]), rows = 10, gap = (base - top) / (rows + 0.5)
  for (let i = 0; i < rows; i++) {
    const y = top + gap * (i + 1)
    const [l, rr] = span(poly, y)
    out.push({ pts: [[l, y], [rr, y]], w: gap * 1.4, press: flat, wet: 0.35, a: 0.07, seed: r() * 100 })
    if (y > p3[1]) {
      const fx = p3[0] + ((fb[0] - p3[0]) * (y - p3[1])) / (base - p3[1])
      out.push({ pts: [[fx, y], [sd > 0 ? rr : l, y]], w: gap * 1.4, press: flat, wet: 0.35, a: 0.14, seed: r() * 100 })
    }
  }
  out.push({ pts: tight([p2, p1, lerp(p1, L, 0.3)]), w: 0.24 * u, dry: 0.65, a: 0.55, press: lift, seed: r() * 100 })
  out.push({ pts: tight([p2, p3, p4, lerp(p4, Rb, 0.45)]), w: 0.34 * u, dry: 0.5, a: 0.9, press: lift, seed: r() * 100 })
  // Nét gấp: từ góc đỉnh xuống, chia mặt sáng / tối; tan trước khi chạm chân.
  const fd: Pt = [fb[0] - p3[0], fb[1] - p3[1]], fl = Math.hypot(fd[0], fd[1]) || 1
  out.push({ pts: [[p3[0], p3[1] + 0.2 * u], [lerp(p3, fb, 0.45)[0] + R(r, -0.04, 0.04) * w, lerp(p3, fb, 0.45)[1]], lerp(p3, fb, 0.75)], w: 0.22 * u, dry: 0.6, a: 0.55, press: lift, seed: r() * 100 })
  // Rìu: rải khắp mặt tối, xuôi theo nét gấp, đậm sát cạnh đỉnh và nhạt dần xuống; vài nét nhạt bên mặt sáng.
  const axe = (t: number) => Math.sqrt(Math.min(1, t / 0.06)) * (1 - 0.5 * t)
  for (let i = 0, n = 4 + Math.floor(r() * 3); i < n; i++) {
    const light = i < 2
    const [ex, ey] = light ? along([p1, p2], R(r, 0.3, 0.9)) : along([p3, p4], R(r, 0.05, 0.9))
    const dp = R(r, 0, 1) ** 1.5
    const x = ex, y = ey + 0.3 * u + dp * 0.35 * (base - ey)
    const len = Math.min(R(r, 0.25, 0.45) * h, base - 0.12 * h - y)
    if (len > 0.4 * u) out.push({ pts: [[x, y], [x + (fd[0] / fl) * len * 0.5, y + len * 0.5], [x + (fd[0] / fl) * len * 0.7, y + len]], w: R(r, 0.55, 0.9) * u, dry: R(r, 0.4, 0.6), a: (light ? 0.15 : R(r, 0.3, 0.42)) * (1 - 0.5 * dp), press: axe, seed: r() * 100 })
  }
  out.push({ pts: [[X(0.45), base + 0.05 * u], [Rb[0] + sd * 0.6 * u, base + 0.1 * u]], w: 0.14 * u, a: 0.55, dry: 0.4, press: leaf, seed: r() * 100 })
  const ry_ = base + ry * 0.12
  const rip = { w: 0.1 * u, a: 0.35, dry: 0.3, press: leaf }
  out.push({ ...rip, pts: [[cx - rx * 1.35, ry_], [cx - rx, ry_ + 0.1 * u], [cx - rx * 0.65, ry_]], seed: r() * 100 })
  out.push({ ...rip, pts: [[cx + rx * 0.55, ry_ + 0.2 * u], [cx + rx, ry_ + 0.3 * u], [cx + rx * 1.45, ry_ + 0.15 * u]], seed: r() * 100 })
  return out
}

// Lau sậy: vài lá mọc từ một gốc, lả theo gió.
const reed: Art = (a, u, r) => {
  const out: Stroke[] = []
  const bx = a.x + a.w / 2, by = a.y + a.h
  const n = 3 + Math.floor(r() * 4)
  const wind = R(r, -0.6, 0.6)
  for (let i = 0; i < n; i++) {
    const lean = R(r, -1, 1) + wind
    const tip: Pt = [bx + lean * a.w * R(r, 0.6, 1.6), by - a.h * R(r, 0.55, 1)]
    const x0 = bx + R(r, -0.2, 0.2) * a.w
    const mid: Pt = [(x0 + tip[0]) / 2 - lean * a.w * 0.35, (by + tip[1]) / 2]
    // Lá dài lả nhiều hơn lá ngắn (k chung cho cả bụi: độ lệch tăng theo bình phương chiều cao).
    out.push({ pts: [[x0, by], mid, tip], w: 0.35 * u, press: leaf, a: 0.8, dry: 0.35, sway: [by, (1.2 * u) / (a.h * a.h)], seed: r() * 100 })
  }
  for (let i = 0; i < 3; i++) out.push(dab(bx + R(r, -1, 1) * a.w, by + R(r, -0.2, 0.3) * u, R(r, 0.15, 0.25) * u, { a: 0.6, seed: r() * 100 }))
  return out
}

// Vách thác kiểu "phủ phách" (nét rìu chẻ, như Mã Viễn, Hạ Khuê): mỗi bên là vài khối đá lớn chồng so le, gờ thò thụt.
// Khối: gờ trên xiên theo vỉa chung (nét khô đậm); mực loang đậm sát gờ và sát mép nước rồi nhạt dần vào lòng khối;
// nét rìu bè quét chéo từ gờ xuống; chấm rêu trên gờ. Tô đều một màu xám thì thành cột bìa cứng.
const cliff: Art = (a, u, r, c) => {
  const line: Stroke[] = [], tex: Stroke[] = [], wash: Stroke[] = [], water: Stroke[] = [], dots: Stroke[] = []
  const top = a.y, bot = a.y + a.h
  const gx0 = a.x + a.w * a.gap, gx1 = a.x + a.w * (a.gap + 0.14)
  const wTop = c.lip ? c.lip[1] : top + a.h * 0.14
  // Một hướng vỉa (rad, dương = dốc xuống bên phải) và một hướng quét rìu cho cả vách, như một bàn tay vẽ.
  const tilt = R(r, 0.12, 0.3) * (r() < 0.5 ? 1 : -1)
  const th = R(r, 0.6, 0.9), dir: Pt = [Math.sign(tilt) * Math.sin(th), Math.cos(th)]
  const moss = (p: Pt, n: number, al: number) => {
    for (let i = 0; i < n; i++) dots.push(dab(p[0] + R(r, -1.2, 1.2) * u, p[1] - R(r, 0.1, 0.5) * u, R(r, 0.16, 0.3) * u, { a: 0.85 * al, seed: r() * 100 }))
  }
  // Một dải sương cắt ngang cả hai vách lẫn dòng thác: trên là vách lơ lửng, dưới là đá chân thác (liền một mạch thì thành hai cột).
  const my = top + a.h * 0.6, mh = a.h * 0.065
  const veil = (y: number) => Math.min(1, Math.max(0, (Math.abs(y - my) - mh) / (a.h * 0.04)))

  const axe = (t: number) => Math.sqrt(Math.min(1, t / 0.05)) * (1 - 0.45 * t)
  const tree = (b: Pt, lean: number, s: number, al: number) => dots.push(...pine(r, b, lean, s, al, { sway: [b[1], (0.5 * u) / (s * s)] }))

  /** t0: đỉnh khối (tỉ lệ chiều cao). tone: vách xa nhạt hơn. pf: [t, bề ngang k] — dáng khối đá. */
  const mass = (xa: number, xb: number, waterLeft: boolean, t0: number, tone: number, pf: readonly (readonly [number, number])[]) => {
    const ww = xb - xa
    /** k: 0 = mép nước → 1 = mép ngoài. */
    const X = (k: number) => (waterLeft ? xa + ww * k : xb - ww * k)
    const inw: Pt = [waterLeft ? 1 : -1, 0]
    const yTop = top + a.h * t0, yEnd = bot - a.h * 0.05
    // Càng xuống chân càng tan vào bụi nước.
    const fadeAt = (y: number) => tone * (1 - 0.45 * Math.min(1, Math.max(0, (y - top) / a.h)) ** 1.5)
    const vk = (y: number) => fadeAt(y) * veil(y)
    const prof = (y: number) => {
      const t = (y - top) / a.h, i = Math.max(0, pf.findIndex((p) => p[0] > t) - 1), p = pf[i], q = pf[Math.min(pf.length - 1, i + 1)]
      return p[1] + (q[1] - p[1]) * Math.min(1, Math.max(0, (t - p[0]) / (q[0] - p[0] || 1)))
    }

    // Vách = vài khối lớn chồng so le (nhiều phiến mỏng thì thành chồng đai ốc). Bề ngang theo dáng định sẵn (prof):
    // bề ngang gần đều từ trên xuống thì thành hai cột đá. Mỗi khối phình ra rồi khoét vào ở chân (hàm ếch).
    // Tô nền xám đều thì thành cột bìa cứng: mặt sáng để giấy trống, chỉ loang sát gờ, sát mép nước, dưới hàm ếch.
    // Hai đoạn: trên và dưới dải sương; khối không vắt qua sương.
    const blocks: { P: Pt[]; T: Pt; M: Pt }[] = []
    for (const [s0, s1] of [[yTop, my - mh * 0.5], [my + mh * 0.7, yEnd]]) {
      let y0 = s0
      while (y0 < s1 - 6 * u) {
        const h0 = R(r, 14, 30) * u, h = s1 - y0 - h0 < 8 * u ? s1 - y0 : h0
        const y1 = y0 + h, ym = y0 + h * R(r, 0.25, 0.7)
        // Ba điểm mép ngoài bám theo dáng: chỗ dáng thắt lại thì đáy khối thành mặt dưới xiên dài của mỏm đá nhô ra.
        const km = prof(ym) * R(r, 0.92, 1.06), kt = Math.max(0.2, prof(y0) * R(r, 0.85, 1.05)), kb = Math.max(0.2, prof(y1) * R(r, 0.85, 1) - R(r, 0, 0.12))
        // Khối đầu: đỉnh ở mép ngoài, mặt trên dốc xuống phía thác (đỉnh bằng thì thành nóc cột). Mép nước thò thụt từng khối.
        const W0: Pt = [X(R(r, -0.02, 0.1)), blocks.length ? y0 : y0 + h * R(r, 0.25, 0.4)], W1: Pt = [X(R(r, -0.02, 0.1)), y1]
        const T: Pt = [X(kt), blocks.length ? Math.max(top, y0 + (X(kt) - W0[0]) * Math.tan(tilt + R(r, -0.2, 0.2))) : y0]
        const M: Pt = [X(km), ym], B: Pt = [X(kb), y1]
        // Gờ trên và mép ngoài gãy khúc nhiều mặt: mấu nhô, chỗ sứt.
        const ridge = [W0, ...jag(W0, T, r, -0.4, 1), T], mb = jag(M, B, r)
        const P = [...ridge, ...jag(T, M, r), M, ...mb, B, W1]
        const prev = y0 === s0 ? null : blocks[blocks.length - 1]
        blocks.push({ P, T, M })
        const ya = Math.min(...ridge.map((p) => p[1]))
        // Khối dưới nấp sau khối trên: gờ chỉ lộ phần nhô ra ngoài khối trên (kẻ / loang trọn thì thành kệ ngang, gặp viền dọc thành chữ "L").
        const rl = tight([...ridge].reverse())
        const hid = prev ? rl.findIndex((p) => { const [lo, hi] = span(prev.P, p[1]); return p[0] > lo - 0.3 * u && p[0] < hi + 0.3 * u }) : -1
        const seen = hid < 0 ? rl : rl.slice(0, hid)
        // Bóng: đậm sát gờ trên và dưới hàm ếch, nhạt dần vào lòng khối.
        if (seen.length > 2) wash.push(...inkWash(seen, (y1 - ya) * R(r, 0.15, 0.25), 0.16 * vk(ya), 0.02 * vk(ya), r))
        if (kb < km - 0.08) wash.push(...inkWash([M, ...mb, B], R(r, 3, 5) * u, 0.16 * vk(y1), 0.02 * vk(y1), r, [-inw[0], 0]))
        // Mép ngoài: bóng khối đậm sát viền, giữa khối để giấy sáng (khối có thể tích thay vì chỉ có nét viền rời).
        else wash.push(...inkWash([T, ...P.slice(ridge.length, P.indexOf(M)), M, ...mb, B], R(r, 3, 4.5) * u, 0.13 * vk(ym), 0.02 * vk(ym), r, [-inw[0], 0]))
        // Mép nước: vài nét rìu đậm dọc đá ẩm cho thác trắng nổi lên (dải loang trơn thì thành hai ống xám kẹp thác).
        for (let j = 0, n = 2 + Math.floor(r() * 2); j < n; j++) {
          const ys = y0 + h * R(r, 0.05, 0.6), ye = Math.min(y1 - 0.5 * u, ys + h * R(r, 0.2, 0.45))
          if (veil(ys) < 0.5 || veil(ye) < 0.5) continue
          const x = lerp(W0, W1, (ys - y0) / h)[0] + inw[0] * R(r, 0.6, 1.8) * u
          tex.push({ pts: [[x, ys], [x + inw[0] * R(r, -0.3, 0.5) * u, (ys + ye) / 2], [x + inw[0] * R(r, 0, 0.8) * u, ye]], w: R(r, 0.6, 1.1) * u, dry: R(r, 0.45, 0.65), a: R(r, 0.3, 0.5) * vk(ys), press: axe, seed: r() * 100 })
        }
        // Viền: gờ trên đặt bút ở góc ngoài, nhấc bút giữa chừng, tan trước khi tới thác (kẻ trọn bề ngang thì thành mặt bàn).
        // Hàm ếch một nét ngắn ở góc; khối chân thác thì không (tan vào bụi nước, viền đáy thành dấu ngoặc).
        const vis = Math.min(seen.length, Math.ceil(rl.length * R(r, 0.55, 0.85)))
        if (vis > 2) line.push(...broken(rl.slice(0, vis), r, 2, { w: 0.42 * u, dry: 0.5, a: 0.9 * vk(ya), press: lift }))
        if (y1 < yEnd - 2 * u && (kb < km - 0.08 || r() < 0.4)) line.push({ pts: tight([...mb.slice(-1), B, lerp(B, W1, R(r, 0.15, 0.35))]), w: 0.34 * u, dry: 0.5, a: 0.75 * vk(y1), press: lift, seed: r() * 100 })
        // Nét gấp: vết nứt từ gờ chéo xuống, chia mặt sáng / tối.
        if (seen.length > 2 && r() < 0.6) {
          const f = along(seen, R(r, 0.3, 0.65)), len = h * R(r, 0.4, 0.65)
          line.push({ pts: [[f[0], f[1] + 0.3 * u], [f[0] + dir[0] * len * 0.5 + R(r, -0.5, 0.5) * u, f[1] + dir[1] * len * 0.5], [f[0] + dir[0] * len, f[1] + dir[1] * len]], w: 0.22 * u, dry: 0.65, a: 0.5 * vk(ym), press: lift, seed: r() * 100 })
        }
        // Nét rìu chẻ: bè, dài, quét chéo cùng một hướng cả vách, đặt bút sát gờ trên, nằm gọn trong khối.
        // Bút nghiêng: một mép đậm sắc, mép kia nhạt (fade), ngắn như nhát chặt; dài và đậm đều hai mép thì thành chùm lông vũ.
        for (let j = 0, n = 5 + Math.floor(r() * 4); j < n; j++) {
          const [px, py] = along([...ridge, M], R(r, 0.05, 0.85))
          const dp = R(r, 0, 1) ** 1.6
          // Khối dưới có đỉnh chìm trong sương: nét rìu bắt đầu từ chỗ sương tan (không thì chỉ còn mỗi viền ngoài, lòng khối trống).
          const ya2 = Math.max(py + 0.4 * u, s0 > my ? my + mh + a.h * 0.04 : -Infinity) + dp * 0.45 * h, yb2 = Math.min(y1 - 0.8 * u, ya2 + R(r, 4, 8) * u * dir[1])
          if (yb2 - ya2 < 2.5 * u || veil(yb2) < 0.5) continue
          const [lo, hi] = span(P, ya2), [lo2, hi2] = span(P, yb2)
          if (!(hi - lo > 3 * u && hi2 - lo2 > 3 * u)) continue
          const x = Math.min(hi - 1.5 * u, Math.max(lo + 1.5 * u, px))
          const ex = Math.min(hi2 - 1.5 * u, Math.max(lo2 + 1.5 * u, x + (dir[0] / dir[1]) * (yb2 - ya2)))
          tex.push({ pts: [[x, ya2], [(x + ex) / 2, (ya2 + yb2) / 2], [ex, yb2]], w: R(r, 1, 1.5) * u, dry: R(r, 0.35, 0.55), fade: 0.85, a: R(r, 0.45, 0.7) * vk(ya2) * (1 - 0.4 * dp), press: axe, seed: r() * 100 })
        }
        if (vis > 2 && r() < 0.6) moss(along(rl.slice(0, vis), R(r, 0.05, 0.7)), 2 + Math.floor(r() * 3), vk(ya))
        y0 = y1 - h * R(r, 0.04, 0.12)
      }
    }
    if (!blocks.length) return
    // Viền ngoài và mép nước: mỗi bên một nét chung ôm mép các khối (thò thụt, hàm ếch thành chỗ khuyết), nhấc bút vài lần
    // và đứt hẳn chỗ sương. Mỗi khối tự viền thì thành chuỗi dấu ngoặc.
    const trace = (outer: boolean, w: number, al: number) => {
      const right = waterLeft === outer
      let run: Pt[] = []
      const flush = () => {
        if (run.length > 2) line.push(...broken(run, r, Math.max(1, Math.round(arcLen(run) / (8 * u))), { w, dry: 0.55, a: al * fadeAt(run[run.length >> 1][1]), press: lift }))
        run = []
      }
      for (let y = yTop + 0.5 * u; y < yEnd - 4 * u; y += 1.5 * u) {
        const xs = blocks.map(({ P }) => span(P, y)[right ? 1 : 0]).filter(Number.isFinite)
        if (!xs.length || veil(y) < 0.8) {
          flush()
          continue
        }
        const x = right ? Math.max(...xs) : Math.min(...xs)
        // Cạnh thoải (mặt dưới mỏm nhô, chỗ nối khối) để mảng loang và nét hàm ếch lo; viền theo thì thành dấu "<", tia chớp.
        if (run.length && Math.abs(x - run[run.length - 1][0]) > 1.8 * u) flush()
        run.push([x, y])
      }
      flush()
    }
    trace(true, 0.45 * u, 0.9)
    trace(false, 0.34 * u, 0.75)
    // Sương = giấy trống (mọi nét đã nhạt dần theo veil); phủ dải màu giấy lên thì thành đốm sáng lạ.
    // Tùng: một cây trên sườn đỉnh (đứng ngay chóp thì thành tháp chùa), một cây bám mỏm nhô xa nhất; cùng ngả ra khoảng trống.
    const out = waterLeft ? 1 : -1, b0 = blocks[0]
    tree(along([b0.T, b0.M], R(r, 0.12, 0.3)), out * R(r, 0.3, 0.55), R(r, 5.5, 7) * u, tone)
    // Vách xa không có cây mỏm: cây ngả ra sẽ đè lên chữ cuối trang.
    const tip = blocks.slice(1).reduce((b, k) => (k.T[0] * out > b.T[0] * out ? k : b), b0)
    if (tip !== b0 && !waterLeft) tree(tip.T, out * R(r, 0.6, 0.9), R(r, 6.5, 8.5) * u, tone)
  }
  // Trái (gần, đậm): đỉnh nhọn, vai rộng vươn ra trên khoảng giấy trống, thắt lại ngang chữ kết chương.
  // Phải (xa, nhạt): thấp hơn, hẹp (chừa chữ cuối trang). Hai vách đậm như nhau thì thành cổng hai cột.
  mass(a.x, gx0, false, 0, 1, [[0, 0.35], [0.12, 0.7], [0.22, 1], [0.3, 0.9], [0.4, 0.5], [0.5, 0.45], [0.72, 0.45], [0.82, 0.55], [1, 0.55]])
  mass(gx1, a.x + a.w, true, 0.08, 0.6, [[0, 0.4], [0.15, 0.85], [0.35, 1], [0.5, 0.7], [0.65, 0.95], [0.85, 0.8], [1, 1]])

  // Nước: để trống giấy, chỉ vài sợi chảy đứt quãng; mép nước cuộn qua gờ.
  water.push({ pts: [[gx0 - 0.5 * u, wTop], [(gx0 + gx1) / 2, wTop - 0.3 * u], [gx1 + 0.5 * u, wTop]], w: 0.22 * u, press: leaf, a: 0.6, dry: 0.3, seed: r() * 100 })
  for (let i = 0, n = 4 + Math.floor(r() * 3); i < n; i++) {
    const x = gx0 + ((i + 0.5) / n) * (gx1 - gx0) + R(r, -0.3, 0.3) * u, sw = R(r, 0.08, 0.14) * u
    let pts: Pt[] = []
    const flush = () => {
      if (pts.length > 2) water.push(...broken(pts, r, 1 + Math.floor(r() * 2), { w: sw, a: 0.28, dry: 0.5, press: leaf }))
      pts = []
    }
    // Thác khuất vào dải sương rồi hiện lại bên dưới.
    for (let y = wTop + R(r, 0, 0.03) * a.h; y < bot - a.h * 0.05; y += a.h / 24) {
      if (veil(y) < 0.35) flush()
      else pts.push([x + R(r, -0.12, 0.12) * u, y])
    }
    flush()
  }
  // Sương chân thác (màu giấy phủ lên).
  for (let i = 0; i < 2; i++) {
    const y = bot - a.h * (0.05 + i * 0.05)
    water.push({ pts: [[a.x - a.w * 0.1, y], [a.x + a.w * 0.5, y + R(r, -1, 1) * u], [a.x + a.w * 1.1, y]], w: a.h * 0.035, col: PAPER, press: leaf, wet: 1, a: 0.9, seed: r() * 100 })
  }
  return [...line, ...tex, ...wash, ...dots, ...water]
}

const pool: Art = (a, u, r) => {
  const out: Stroke[] = []
  const cx = a.x + a.w / 2, cy = a.y + a.h / 2
  out.push({ pts: [[a.x, cy], [a.x + a.w, cy]], w: a.h * 0.35, press: dot, wet: 1, a: 0.1, seed: r() * 100 })
  for (let k = 1; k <= 3; k++) {
    const rx = (a.w / 2) * (0.3 + 0.22 * k), ry = (a.h / 2) * (0.3 + 0.22 * k)
    for (let j = 0; j < 2; j++) {
      const a0 = Math.PI * (j + R(r, 0.05, 0.25)), a1 = a0 + Math.PI * R(r, 0.45, 0.7)
      const pts: Pt[] = []
      for (let i = 0; i <= 10; i++) {
        const t = a0 + ((a1 - a0) * i) / 10
        pts.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t)])
      }
      out.push({ pts, w: 0.12 * u, a: 0.4 * (1 - k * 0.2), dry: 0.4, press: leaf, seed: r() * 100 })
    }
  }
  return out
}

const mist: Art = (a, u, r) => {
  const cy = a.y + a.h / 2
  return [{ pts: [[a.x, cy], [a.x + a.w * 0.5, cy + R(r, -0.5, 0.5) * u], [a.x + a.w, cy]], w: a.h / 2, col: PAPER, press: leaf, wet: 1, a: 0.92, seed: r() * 100, step: 10 }]
}

// Mây: vài dải loang dài nằm ngang, hai đầu thon, xếp so le như sương trôi; một hai cuộn xoắn nhỏ có đuôi.
const cloud: Art = (a, u, r) => {
  const out: Stroke[] = []
  for (let i = 0, n = 3 + Math.floor(r() * 2); i < n; i++) {
    const len = R(r, 0.4, 0.8) * a.w, x = R(r, a.x, a.x + a.w - len), y = a.y + a.h * (0.2 + (0.6 * (i + R(r, 0, 1))) / n)
    const sag = R(r, -0.08, 0.08) * a.h
    out.push({ pts: [[x, y], [x + len * 0.5, y + sag], [x + len, y + R(r, -0.04, 0.04) * a.h]], w: R(r, 0.12, 0.2) * a.h, press: leaf, wet: 1, fade: 0.6, a: R(r, 0.08, 0.1), seed: r() * 100, step: 10 })
  }
  for (let i = 0, n = 1 + Math.floor(r() * 2); i < n; i++) {
    const cx = R(r, a.x + a.w * 0.15, a.x + a.w * 0.85), cy = R(r, a.y + a.h * 0.3, a.y + a.h * 0.7)
    const r0 = R(r, 0.18, 0.3) * a.h, th0 = r() * 6, sp = r() < 0.5 ? 1 : -1
    const tail = R(r, 0.15, 0.3) * a.w * (r() < 0.5 ? 1 : -1)
    const sx = cx + r0 * Math.cos(th0), sy = cy + r0 * Math.sin(th0) * 0.8
    const pts: Pt[] = [
      [sx + tail, sy + R(r, -0.1, 0.1) * a.h],
      [sx + tail * 0.5, sy + (r() < 0.5 ? 1 : -1) * R(r, 0.1, 0.2) * a.h],
    ]
    for (let j = 0; j <= 24; j++) {
      const t = j / 24, rr = r0 * (1 - 0.85 * t), th = th0 + sp * 2 * Math.PI * 1.4 * t
      pts.push([cx + rr * Math.cos(th), cy + rr * Math.sin(th) * 0.8])
    }
    out.push({ pts, w: 0.2 * u, a: 0.35, dry: 0.3, press: brush, seed: r() * 100 })
  }
  return out
}

// Vòng Ensō: một nét, gần khép, khô dần cuối nét.
const enso: Art = (a, _u, r) => {
  const d = a.h > 0 ? Math.min(a.w, a.h) : a.w
  const rad = (d / 2) * 0.92, cx = a.x + a.w / 2, cy = a.y + d / 2
  const th0 = R(r, -2.2, -1.6), k = r() * 6
  const pts: Pt[] = []
  for (let i = 0; i <= 64; i++) {
    const t = i / 64, th = th0 + 0.92 * 2 * Math.PI * t
    const rr = rad * (1 + 0.03 * Math.sin(th * 3 + k)) * (1 - 0.04 * t)
    pts.push([cx + rr * Math.cos(th), cy + rr * Math.sin(th)])
  }
  return [{ pts, w: rad * 0.11, dry: 0.55, a: 0.95, press: (t) => Math.sqrt(Math.min(1, t / 0.04)) * (1 - 0.35 * t), seed: r() * 100 }]
}

const ARTS: Record<string, Art> = { mount, rock, reed, cliff, pool, mist, cloud, enso, ...MOTIFS, ...MOTIFS2 }
/** Vật chuyển động: life.ts / life2.ts vẽ mỗi khung hình. 'willow' có cả hai: thân cành tĩnh, sợi rủ động. */
export const LIFE = new Set(['birds', 'geese', 'crane', 'boat', 'petals', 'drift', 'rain', 'leaves', 'lanterns', 'rise', 'smoke', 'junk', 'fish', 'willow', 'kite', 'dragonfly'])

/** Chia cửa sổ [t0, t1] của một nhóm cho từng nét theo độ dài: bút đi lần lượt, chấm thì nhanh. */
function timed(list: Stroke[], a: Anchor): Stroke[] {
  const wt = list.map((s) => arcLen(s.pts) + 2 * s.w)
  const tot = wt.reduce((x, y) => x + y, 0) || 1
  const span = a.t1 - a.t0
  let acc = 0
  return list.map((s, i) => {
    const t0 = a.t0 + (span * acc) / tot
    acc += wt[i]
    return { ...s, t0, t1: Math.max(t0 + 1e-3, a.t0 + (span * acc) / tot), group: a.group, par: s.par ?? a.par, home: a.home }
  })
}

// Dòng suối: lớp loang rất nhạt + ba làn sóng đứt quãng; vẽ dần theo các điểm mốc.
function stream(wps: Anchor[], u: number, vh: number): { strokes: Stroke[]; path: Path; tAt: (s: number) => number } {
  const path = new Path(wps.map((w): Pt => [w.x, w.y]), Math.max(2, u * 0.5))
  const ss: number[] = []
  const T: number[] = []
  for (const w of wps) {
    ss.push(path.nearest(w.x, w.y, ss.length ? ss[ss.length - 1] : 0))
    T.push(Math.max(w.t0, T.length ? T[T.length - 1] : -Infinity))
  }
  const tAt = (s: number) => {
    let i = 0
    while (i < ss.length - 2 && s > ss[i + 1]) i++
    const k = Math.min(1, Math.max(0, (s - ss[i]) / (ss[i + 1] - ss[i] || 1)))
    return T[i] + (T[i + 1] - T[i]) * k
  }
  const out: Stroke[] = []
  const r = rng(991)
  const span = (s0: number, s1: number, st: number) => {
    const pts: Pt[] = []
    for (let s = s0; s < s1; s += st) pts.push(path.at(s))
    pts.push(path.at(s1))
    return pts
  }
  // Chỉ vuốt nhọn ở đầu và cuối cả dòng; chỗ nối giữa các đoạn giữ nguyên bề rộng để không lộ vết nối.
  const segs = ss.flatMap((s, i) => (i < ss.length - 1 && ss[i + 1] - s >= 1 ? [i] : []))
  for (const i of segs) {
    const head = i === segs[0], tail = i === segs[segs.length - 1]
    const press = (t: number) => Math.sqrt(Math.min(1, head ? t / 0.04 : 1, tail ? (1 - t) / 0.04 : 1))
    out.push({ pts: span(ss[i], ss[i + 1], 8), w: 3.2 * u, press, wet: 1, bloom: false, a: 0.07, seed: r() * 100, t0: T[i], t1: Math.max(T[i] + 1, T[i + 1]), step: 10 })
  }
  for (const lane of [-0.9, 0, 0.9]) {
    let s = R(r, 0, 3) * u
    while (s < path.L - u) {
      const len = R(r, 2, 5) * u
      const pts: Pt[] = []
      for (let q = 0; q <= 6; q++) {
        const sq = Math.min(path.L, s + (len * q) / 6)
        const [x, y] = path.at(sq), [x2, y2] = path.at(sq + 1)
        const tl = Math.hypot(x2 - x, y2 - y) || 1
        const off = lane * u + Math.sin(sq / (3 * u) + lane * 2) * 0.25 * u
        pts.push([x - ((y2 - y) / tl) * off, y + ((x2 - x) / tl) * off])
      }
      const t0 = tAt(s)
      out.push({ pts, w: 0.1 * u, a: 0.3, dry: 0.5, press: leaf, seed: r() * 100, t0, t1: t0 + 0.25 * vh })
      s += len + R(r, 1, 3) * u
    }
  }
  return { strokes: out, path, tAt }
}

export function buildScene(anchors: readonly Anchor[], u: number, vh: number): Scene {
  const sc: Scene = { back: [], front: [], stream: null, lip: null, pool: null, sky: null, stage: 0, streamT: null, life: anchors.filter((a) => LIFE.has(a.art)) }
  for (const a of anchors) {
    if (a.art === 'lip') sc.lip = [a.x, a.y]
    else if (a.art === 'pool') sc.pool = [a.x + a.w / 2, a.y + a.h / 2]
    else if (a.art === 'sky') sc.sky = [a.x, a.y, a.w, a.h]
    else continue
    sc.stage = a.group
  }
  const ctx: Ctx = { lip: sc.lip }
  for (const a of anchors) {
    const art = ARTS[a.art]
    if (!art) continue
    const list = timed(art(a, u, rng(a.seed * 7919 + 13), ctx), a)
    ;(a.over ? sc.front : sc.back).push(...list)
  }
  const wps = anchors.filter((a) => a.art === 'wp').sort((a, b) => a.o - b.o || a.y - b.y)
  if (wps.length > 1) {
    const s = stream(wps, u, vh)
    sc.back.unshift(...s.strokes)
    sc.stream = s.path
    sc.streamT = s.tAt
  }
  return sc
}
