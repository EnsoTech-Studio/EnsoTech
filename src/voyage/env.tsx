import type { CSSProperties } from 'react'

/**
 * Cảnh vật dọc dòng sông, vẽ bằng mực (SVG + CSS, không tải ảnh). Mỗi mảnh .piece bám một chương qua --c{k}/--w{k}
 * do engine đo; 's' = sân khấu màn cuối. Back nằm sau cá (z-0), Front nằm trước cá nhưng sau chữ (z-2).
 * Hoạt ảnh chỉ đặt trên phần tử HTML / thẻ <svg> ngoài cùng (rotate, translate, opacity) để trình duyệt tự ghép lớp, không vẽ lại.
 */

type K = number | 's'
const at = (k: K, ext = '0px', more: Record<string, string | number> = {}) =>
  ({ '--at': `var(--c${k})`, '--len': `var(--w${k})`, '--ext': ext, ...more }) as CSSProperties
const css = (o: Record<string, string | number>) => o as CSSProperties
/** Ngẫu nhiên cố định (cùng kết quả mỗi lần dựng), đủ để nét cọ không đều tăm tắp. */
const rnd = (i: number) => {
  const x = Math.sin(i * 91.7 + 13.1) * 43758.5453
  return x - Math.floor(x)
}
const r1 = (v: number) => Math.round(v * 10) / 10

const INK = '#19211f'
const PAPER = '#faf5ea'

/* ---------- Nét vẽ ---------- */

/** Lá sen nhìn nghiêng: mép đậm hơn lòng lá (mực đọng ở mép như màu nước), một khe cắt vào tâm. */
const PAD_VEINS = Array.from({ length: 11 }, (_, i) => {
  const a = 0.45 + i * 0.52
  return `M100 60L${r1(100 + 88 * Math.cos(a))} ${r1(60 + 49 * Math.sin(a))}`
}).join('')
function Pad({ className, style }: { className: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 200 120" className={`absolute ${className}`} style={style}>
      <g filter="url(#bleed)">
        <path d="M100 60L195.3 53.5A96 54 0 1 0 195.3 66.5Z" fill="url(#pad)" />
        <path d={PAD_VEINS} stroke={PAPER} strokeOpacity=".4" strokeWidth="1.1" />
      </g>
    </svg>
  )
}

const PETAL = 'M60 96C41 74 44 34 60 8C76 34 79 74 60 96Z'
function Lotus({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 120 150" className={`absolute ${className}`}>
      <path d="M60 96C58 118 63 132 58 150" stroke={INK} strokeOpacity=".5" strokeWidth="2.2" fill="none" />
      <g stroke={INK} strokeOpacity=".55" strokeWidth=".9" fill="url(#petal)">
        {[-62, 62, -38, 38, -15, 15, 0].map((r) => (
          <path key={r} d={PETAL} transform={`rotate(${r} 60 96) translate(60 96) scale(${Math.abs(r) > 50 ? 0.82 : Math.abs(r) > 30 ? 0.92 : 1}) translate(-60 -96)`} />
        ))}
      </g>
    </svg>
  )
}

/** Cụm lau sậy: lá thon cong theo gió, vài lá gập ngọn, vài cọng trổ bông lau. Cả cụm đung đưa (một lớp, không vẽ lại). */
function Reeds({ seed, n = 9, className, style }: { seed: number; n?: number; className: string; style?: CSSProperties }) {
  const blades: string[] = []
  const stems: string[] = []
  const plumes: { x: number; y: number; a: number; s: number }[] = []
  for (let i = 0; i < n; i++) {
    const x = r1(16 + i * (168 / n) + rnd(seed + i) * 16)
    const h = 110 + rnd(seed + i * 3) * 180
    const b = (rnd(seed + i * 7) - 0.5) * 150 // độ nghiêng ngọn
    const droop = rnd(seed + i * 11) > 0.62 // lá dài gập ngọn xuống
    const tip = [x + b, 300 - h * (droop ? 0.74 : 1)]
    const c1 = [x + b * 0.04, 300 - h * 0.5]
    const c2 = [x + b * (droop ? 0.62 : 0.3), 300 - h * (droop ? 1.04 : 0.84)]
    if (rnd(seed + i * 13) > 0.7) {
      // cọng trổ bông: thân mảnh, bông lau rủ theo hướng ngọn
      stems.push(`M${x} 300C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(tip[0])} ${r1(tip[1])}`)
      plumes.push({ x: r1(tip[0]), y: r1(tip[1]), a: r1((Math.atan2(tip[1] - c2[1], tip[0] - c2[0]) * 180) / Math.PI), s: r1(0.8 + rnd(seed + i) * 0.5) })
      continue
    }
    const w = 2.5 + rnd(seed + i * 5) * 4
    // pháp tuyến của đoạn c1 → c2, để lá vẫn có bề dày khi ngọn đã ngả ngang
    const dx = c2[0] - c1[0]
    const dy = c2[1] - c1[1]
    const L = Math.hypot(dx, dy) || 1
    const nx = (-dy / L) * w
    const ny = (dx / L) * w
    blades.push(
      `M${r1(x - w)} 300C${r1(c1[0] - w * 0.8)} ${r1(c1[1])} ${r1(c2[0] - nx * 0.4)} ${r1(c2[1] - ny * 0.4)} ${r1(tip[0])} ${r1(tip[1])}` +
        `C${r1(c2[0] + nx * 0.4)} ${r1(c2[1] + ny * 0.4)} ${r1(c1[0] + w * 0.8)} ${r1(c1[1])} ${r1(x + w)} 300Z`,
    )
  }
  return (
    <svg viewBox="0 0 200 300" preserveAspectRatio="xMidYMax meet" overflow="visible" className={`sway absolute bottom-0 ${className}`} style={style}>
      <path d={blades.join('')} fill="url(#reed)" />
      <path d={stems.join('')} stroke={INK} strokeOpacity=".45" strokeWidth="1.3" fill="none" />
      {plumes.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.a}) scale(${p.s})`} filter="url(#bleed)">
          <path d="M-2 0C6-7 22-8 36-3C26 1 12 4-2 0Z" fill={INK} fillOpacity=".32" />
          <path d="M2 0C10 3 20 6 30 6M4-1C12-6 20-8 28-9" stroke={INK} strokeOpacity=".3" strokeWidth=".8" fill="none" />
        </g>
      ))}
    </svg>
  )
}

/** Đá giữa dòng: khối mực loang, đỉnh nhạt (chỗ nước vỗ), chân đậm. */
function Rock({ className, seed }: { className: string; seed: number }) {
  const k = (i: number) => r1(rnd(seed + i) * 10)
  return (
    <svg viewBox="0 0 160 90" className={`absolute ${className}`}>
      <path
        filter="url(#bleed)"
        fill="url(#rock)"
        d={`M6 88C4 64 ${18 + k(1)} 40 ${40 + k(2)} 30C${58 + k(3)} 12 ${84 + k(4)} 6 ${104 + k(5)} 18C${124 + k(6)} 22 ${146 + k(7)} 44 154 88Z`}
      />
      <path d={`M${34 + k(8)} 44C52 30 70 26 86 28`} stroke={INK} strokeOpacity=".35" strokeWidth="1.6" fill="none" />
    </svg>
  )
}

/**
 * Núi thác Vũ Môn: một khối liền, hai đỉnh, khe chữ V mở rộng ôm trọn mặt trời; gờ thác X 500–625 ↔ sân khấu .68–.76, ở Y 400 ↔ 40% chiều cao.
 * Toạ độ sân khấu = .36 + .64·X/1000. Hình vẽ tràn quá đáy khung (Y 1100) để bộ lọc loang mực không khoét lỗ ở mép dưới.
 * Nước là giấy trắng giữa hai vách mực (lối thuỷ mặc): chỉ vẽ nét vách hai bên, không tô nền sau thác.
 */
const RIDGES = [
  'M350 186C318 230 296 300 276 370C262 420 244 470 214 530',
  'M356 186C372 240 380 290 410 330',
  'M300 290C318 350 336 410 372 470C396 510 410 550 440 600',
  'M828 130C800 180 776 240 752 300C736 340 716 380 690 430',
  'M832 130C858 180 872 220 900 262C920 290 944 316 982 340',
  'M760 260C792 320 806 380 796 460',
  'M498 404C493 480 486 560 478 640C472 700 462 770 446 840',
  'M627 404C633 480 642 560 652 640C660 700 672 770 690 840',
  'M484 470C476 540 466 610 450 690',
  'M646 470C654 540 666 610 682 690',
]
const MOSS = [
  [340, 192], [362, 190], [326, 206], [372, 204], [316, 232], [386, 222], [306, 270],
  [818, 136], [838, 134], [804, 150], [852, 150], [792, 176], [866, 170], [782, 206], [880, 204],
]
function Massif() {
  return (
    <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" overflow="visible" className="absolute left-[36%] top-0 h-full w-[64%]">
      <path
        filter="url(#bleed)"
        fill="#5d8fa8"
        fillOpacity=".26"
        d="M-380 1100C-330 960-260 840-170 760C-110 710-60 640 10 580C70 530 120 552 170 528C220 504 250 470 300 466C420 456 600 520 760 556C880 584 960 596 1040 600V1100Z"
      />
      <path
        filter="url(#bleed)"
        fill="url(#massif)"
        d="M-300 1100C-200 1030-110 940-40 900C30 870 80 820 120 760C160 700 190 620 220 540C250 460 275 330 300 260C315 215 330 188 350 184C372 180 388 200 402 230C425 280 445 320 468 352C482 372 492 392 500 398Q504 401 512 401H612Q620 401 626 397C640 384 656 360 676 330C700 292 724 246 752 200C776 160 800 132 826 128C852 124 868 150 886 180C910 220 950 250 1040 262V1100Z"
      />
      <g filter="url(#bleed)" fill="none" stroke={INK} strokeLinecap="round">
        {RIDGES.map((d, i) => (
          <path key={i} d={d} strokeOpacity={r1(0.3 + rnd(i + 60) * 0.25)} strokeWidth={r1(2.5 + rnd(i + 70) * 3)} />
        ))}
      </g>
      {/* Nét kim tuyến men theo sống núi (lối kim bích sơn thuỷ), bắt nắng bình minh */}
      <g fill="none" stroke="#e0b25c" strokeLinecap="round" transform="translate(5 -3)">
        {RIDGES.map((d, i) => (
          <path key={i} d={d} strokeOpacity={r1(0.35 + rnd(i + 30) * 0.3)} strokeWidth="1.4" />
        ))}
      </g>
      <g fill="#173a30">
        {MOSS.map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx={r1(5 + rnd(i + 80) * 5)} ry={r1(2.4 + rnd(i + 90) * 1.6)} fillOpacity={r1(0.45 + rnd(i + 99) * 0.3)} />
        ))}
      </g>
    </svg>
  )
}

/**
 * Cành mai vàng chìa vào từ mép trên (chương Hỏi đáp: trời vừa sáng sau đêm). Mỗi nhánh là một nét Bézier thon dần,
 * mép hơi sần như gỗ già; hoa năm cánh vàng, nhuỵ son; nụ ở đầu cành. Mỗi hoa: [t trên nhánh, phía (0 = nụ ở ngọn), cỡ].
 */
type Pt = [number, number]
const bez = ([a, b, c, d]: Pt[], t: number): Pt => {
  const u = 1 - t
  const f = (i: 0 | 1) => u * u * u * a[i] + 3 * u * u * t * b[i] + 3 * u * t * t * c[i] + t * t * t * d[i]
  return [f(0), f(1)]
}
const MAI: { p: Pt[]; w: Pt; f: [number, number, number][] }[] = [
  { p: [[-40, -30], [90, 30], [230, 110], [420, 112]], w: [26, 13], f: [[0.72, 1, 1.1], [0.9, -1, 0.9]] },
  { p: [[420, 112], [540, 114], [650, 58], [790, 60]], w: [13, 6], f: [[0.2, -1, 1.2], [0.45, 1, 1], [0.7, -1, 1.1], [0.9, 1, 0.8]] },
  { p: [[790, 60], [860, 62], [925, 92], [985, 84]], w: [6, 1.4], f: [[0.3, 1, 0.9], [0.6, -1, 0.8], [1, 0, 1]] },
  { p: [[240, 96], [250, 140], [288, 168], [282, 210]], w: [8, 1.4], f: [[0.4, 1, 1], [0.7, -1, 1.1], [1, 0, 1]] },
  { p: [[530, 106], [552, 72], [590, 40], [636, 14]], w: [6, 1.4], f: [[0.35, -1, 1], [0.65, 1, 0.9], [1, 0, 1]] },
  { p: [[690, 56], [706, 96], [690, 146], [716, 192]], w: [5, 1.2], f: [[0.3, 1, 1], [0.6, -1, 1], [0.85, 1, 0.8], [1, 0, 1]] },
  { p: [[96, 34], [150, 4], [200, -4], [250, -26]], w: [9, 2], f: [[0.5, 1, 1], [0.85, -1, 0.8]] },
  { p: [[372, 116], [392, 150], [430, 166], [462, 184]], w: [5, 1.2], f: [[0.5, -1, 1], [1, 0, 1]] },
  { p: [[880, 72], [900, 40], [930, 30], [950, 14]], w: [2.5, 1], f: [[0.6, 1, 0.7], [1, 0, 1]] },
]
const BOUGH = MAI.map(({ p, w: [w0, w1], f }, k) => {
  const nrm = (t: number): Pt => {
    const [ax, ay] = bez(p, Math.max(0, t - 0.01))
    const [bx, by] = bez(p, Math.min(1, t + 0.01))
    const L = Math.hypot(bx - ax, by - ay) || 1
    return [-(by - ay) / L, (bx - ax) / L]
  }
  const L: string[] = []
  const R: string[] = []
  for (let i = 0; i <= 18; i++) {
    const t = i / 18
    const [x, y] = bez(p, t)
    const [nx, ny] = nrm(t)
    const w = ((w0 + (w1 - w0) * t) / 2) * (0.88 + rnd(k * 31 + i) * 0.24)
    L.push(`${r1(x + nx * w)} ${r1(y + ny * w)}`)
    R.unshift(`${r1(x - nx * w)} ${r1(y - ny * w)}`)
  }
  const blooms = f.map(([t, side, s], j) => {
    const [x, y] = bez(p, t)
    const [nx, ny] = nrm(t)
    const off = side * ((w0 + (w1 - w0) * t) / 2 + 6)
    return { x: r1(x + nx * off), y: r1(y + ny * off), a: r1(rnd(k * 17 + j) * 72), s: r1(s * (0.9 + rnd(k * 7 + j) * 0.25)), bud: side === 0 }
  })
  return { d: `M${L.join('L')}L${R.join('L')}Z`, blooms }
})
function Mai({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 1000 260" overflow="visible" className={className} aria-hidden>
      <defs>
        <radialGradient id="mai-petal" cx=".5" cy=".85" r=".9">
          <stop offset="0" stopColor="#fbe7a1" />
          <stop offset=".55" stopColor="#f2c24e" />
          <stop offset="1" stopColor="#e2a12c" />
        </radialGradient>
        <g id="mai-f">
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse key={r} cy="-5.6" rx="4.6" ry="6" transform={`rotate(${r})`} fill="url(#mai-petal)" stroke="#c4862a" strokeOpacity=".55" strokeWidth=".4" />
          ))}
          <g stroke="#8a3a1a" strokeOpacity=".7" strokeWidth=".35">
            {[20, 80, 140, 200, 260, 320].map((r) => (
              <path key={r} d="M0 0V-3.6" transform={`rotate(${r})`} />
            ))}
          </g>
          <circle r="1.7" fill="#b8322a" />
        </g>
        <g id="mai-bud">
          <ellipse rx="2.8" ry="3.8" fill="#eab43e" />
          <path d="M-2.6 1.4Q0 5.4 2.6 1.4" fill="#5a3b1f" />
        </g>
      </defs>
      <g filter="url(#bleed)" fill={INK} fillOpacity=".82">
        {BOUGH.map((b, i) => (
          <path key={i} d={b.d} />
        ))}
      </g>
      {/* rêu điểm trên gỗ già */}
      <g fill="#173a30" fillOpacity=".6">
        {[0.25, 0.42, 0.6, 0.78].map((t, i) => {
          const [x, y] = bez(MAI[0].p, t)
          return <ellipse key={i} cx={r1(x)} cy={r1(y - 8)} rx="4" ry="1.8" />
        })}
      </g>
      {BOUGH.flatMap((b, i) =>
        b.blooms.map((f, j) => (
          <use key={`${i}-${j}`} href={f.bud ? '#mai-bud' : '#mai-f'} transform={`translate(${f.x} ${f.y}) rotate(${f.a}) scale(${f.s * 1.25})`} />
        )),
      )}
    </svg>
  )
}

/** Trăng rằm và vệt trăng trên mặt nước (chương "Vì sao"): gần chân trời vệt dày và hẹp, về phía người xem thưa và rộng ra. */
const GLINTS = Array.from({ length: 34 }, (_, i) => {
  const t = i / 33
  const y = 111 + t * t * 140 + rnd(i + 600) * 2
  const spread = 4 + t * 34
  const h = 0.7 + t * 2
  // mỗi gợn sóng vỡ thành 1–3 mảnh sáng, không phải một vạch liền
  return Array.from({ length: 1 + Math.floor(rnd(i + 650) * 3) }, (_, j) => {
    const w = (3 + t * 26) * (0.4 + rnd(i * 7 + j + 700))
    return { x: r1(100 + (rnd(i * 5 + j + 800) - 0.5) * spread * 2 - w / 2), y: r1(y + j * 0.7), w: r1(w), h: r1(h), o: r1(0.35 + rnd(i * 3 + j + 900) * 0.6) }
  })
}).flat()
export function MoonPath({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 200 260" className={className} aria-hidden data-moon>
      <defs>
        <radialGradient id="moon" cx=".42" cy=".4">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset=".7" stopColor="#f6ecd6" />
          <stop offset="1" stopColor="#e6d4ae" />
        </radialGradient>
        <radialGradient id="halo">
          <stop offset="0" stopColor="#f6ecd6" stopOpacity=".32" />
          <stop offset="1" stopColor="#f6ecd6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sea" gradientUnits="userSpaceOnUse" x1="0" x2="200">
          <stop offset="0" stopColor={PAPER} stopOpacity="0" />
          <stop offset=".5" stopColor={PAPER} stopOpacity=".3" />
          <stop offset="1" stopColor={PAPER} stopOpacity="0" />
        </linearGradient>
        <filter id="soft">
          <feGaussianBlur stdDeviation=".45" />
        </filter>
      </defs>
      <circle cx="100" cy="50" r="74" fill="url(#halo)" />
      <circle cx="100" cy="50" r="25" fill="url(#moon)" />
      <g fill="#cbb98f" fillOpacity=".28">
        <ellipse cx="92" cy="44" rx="7" ry="5" />
        <ellipse cx="108" cy="58" rx="5" ry="3.5" />
        <ellipse cx="104" cy="41" rx="3" ry="2.2" />
      </g>
      <path d="M0 108H200" stroke="url(#sea)" strokeWidth=".7" />
      {/* quầng trăng loang trên nước, sau các mảnh sáng */}
      <ellipse cx="100" cy="176" rx="34" ry="74" fill="url(#halo)" />
      {[0, 1].map((g) => (
        <g key={g} className={g ? 'shimmer alt' : 'shimmer'} fill="#f4e2b4" filter="url(#soft)">
          {GLINTS.filter((_, i) => i % 2 === g).map((s, i) => (
            <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx={r1(s.h / 2)} fillOpacity={s.o} />
          ))}
        </g>
      ))}
    </svg>
  )
}

/* ---------- Lớp sau cá ---------- */

export function EnvBack() {
  return (
    <>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <filter id="bleed" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="3" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="7" />
          </filter>
          <radialGradient id="pad">
            <stop offset="0" stopColor="#3f8b76" stopOpacity=".3" />
            <stop offset=".72" stopColor="#2f6b5a" stopOpacity=".34" />
            <stop offset="1" stopColor="#173a30" stopOpacity=".6" />
          </radialGradient>
          <linearGradient id="petal" x1="0" y1="1" x2="0" y2="0">
            <stop offset=".25" stopColor={PAPER} />
            <stop offset="1" stopColor="#e7a89c" />
          </linearGradient>
          <linearGradient id="reed" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#173a30" stopOpacity=".7" />
            <stop offset="1" stopColor="#5d9a7c" stopOpacity=".35" />
          </linearGradient>
          <linearGradient id="rock" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3f8b76" stopOpacity=".3" />
            <stop offset=".5" stopColor="#1d4a63" stopOpacity=".5" />
            <stop offset="1" stopColor={INK} stopOpacity=".7" />
          </linearGradient>
          <linearGradient id="cliff" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1d4a63" stopOpacity=".85" />
            <stop offset=".4" stopColor="#2f7c68" stopOpacity=".7" />
            <stop offset=".8" stopColor="#b8894b" stopOpacity=".25" />
            <stop offset="1" stopColor="#b8894b" stopOpacity="0" />
          </linearGradient>
          {/* Khối núi thác kiểu thanh lục sơn thuỷ: đỉnh thạch thanh, sườn thạch lục, chân đất son vàng tan vào sương */}
          <linearGradient id="massif" gradientUnits="userSpaceOnUse" x1="0" y1="100" x2="0" y2="1000">
            <stop offset="0" stopColor="#1d4a63" stopOpacity=".96" />
            <stop offset=".14" stopColor="#22606a" stopOpacity=".92" />
            <stop offset=".3" stopColor="#2f7c68" stopOpacity=".82" />
            <stop offset=".48" stopColor="#8a9a62" stopOpacity=".55" />
            <stop offset=".64" stopColor="#b8894b" stopOpacity=".34" />
            <stop offset=".85" stopColor="#b8894b" stopOpacity=".08" />
            <stop offset="1" stopColor="#b8894b" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* 0 · Ao sen: lá sen, một bông sen, vòng sóng quanh tấm tiêu bản */}
      <div className="piece" style={at(0, '6vw')}>
        <Pad className="-bottom-[6%] left-[1%] w-[26vw] min-w-48 rotate-[-8deg] opacity-90" />
        <Pad className="-bottom-[3%] left-[22%] w-[15vw] min-w-32 rotate-[14deg] opacity-70" />
        <Pad className="bottom-[9%] left-[40%] w-[9vw] min-w-20 rotate-[-20deg] opacity-60 [@media(max-height:46rem)]:hidden" />
        <Pad className="-bottom-[10%] right-[-4%] w-[30vw] min-w-56 rotate-[10deg] opacity-80" />
        {/* ponytail: dọc thì danh sách cam kết nằm đúng chỗ này, nên bỏ hẳn bông sen thay vì tìm chỗ khác */}
        <Lotus className="bottom-[3%] left-[46%] hidden h-[24svh] w-auto hz:block" />
        {[
          [70, 56, 22],
          [76, 62, 14],
          [30, 92, 18],
        ].map(([l, t, w], i) => (
          <span
            key={i}
            className="ring absolute aspect-[3.4] rounded-[50%] border border-ink/25"
            style={css({ left: `${l}%`, top: `${t}%`, width: `${w}vw`, '--d': i, translate: '-50% -50%' })}
          />
        ))}
      </div>

      {/* 1 · Lau sậy, bèo tấm */}
      <div className="piece" style={at(1, '4vw')}>
        {[4, 19, 41, 63, 84].map((l, i) => (
          <Reeds key={l} seed={l} className="h-[34svh] w-[16vw] min-w-40 opacity-30 hz:opacity-70" style={css({ left: `${l}%`, '--d': i })} />
        ))}
        <svg viewBox="0 0 400 40" preserveAspectRatio="none" className="absolute inset-x-0 top-[13%] h-[7svh] opacity-50">
          {Array.from({ length: 70 }, (_, i) => (
            <ellipse key={i} cx={r1(rnd(i) * 400)} cy={r1(8 + rnd(i + 99) * 26)} rx={r1(1.4 + rnd(i + 7) * 2.2)} ry="1.1" fill="#3f8b76" fillOpacity={r1(0.25 + rnd(i + 3) * 0.4)} />
          ))}
        </svg>
      </div>

      {/* 2 · Ghềnh: dòng chảy ngược chiều cá, đá hai mép */}
      <div className="piece overflow-clip" style={at(2, '8vw')}>
        <div className="flow absolute inset-y-[18%] left-0 w-[200%] opacity-55" />
        <Rock seed={1} className="-bottom-[2%] left-[6%] w-[18vw] min-w-40" />
        <Rock seed={9} className="-bottom-[4%] left-[44%] w-[26vw] min-w-48" />
        <Rock seed={4} className="-bottom-[1%] left-[78%] w-[14vw] min-w-32" />
      </div>

      {/* 3 · Nước trong: vệt nắng xiên xuống đáy, sỏi */}
      <div className="piece" style={at(3, '6vw')}>
        <div className="shafts absolute inset-0" />
        <svg viewBox="0 0 600 60" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[9svh]">
          {Array.from({ length: 46 }, (_, i) => (
            <ellipse key={i} cx={r1(rnd(i + 40) * 600)} cy={r1(30 + rnd(i + 80) * 28)} rx={r1(3 + rnd(i + 5) * 8)} ry={r1(2 + rnd(i + 6) * 3)} fill={INK} fillOpacity={r1(0.08 + rnd(i + 9) * 0.16)} />
          ))}
        </svg>
      </div>

      {/* 4 · Ngã ba sông: ba nhánh nước toả ra, mỗi nhánh một tình huống */}
      <div className="piece" style={at(4, '6vw')}>
        <svg viewBox="0 0 1000 600" preserveAspectRatio="none" className="absolute inset-0 size-full opacity-80">
          <g fill="#2d5e78" fillOpacity=".09" filter="url(#bleed)">
            <path d="M-40 270C160 250 260 230 380 200C520 160 640 50 1040 30V120C700 140 560 230 430 270C330 300 160 320 -40 330Z" />
            <path d="M-40 280C200 280 400 290 560 300C720 310 860 300 1040 290V350C860 360 700 360 540 350C380 340 200 330 -40 320Z" />
            <path d="M-40 300C160 310 300 330 420 380C560 440 700 560 1040 580V490C760 470 600 380 460 340C320 300 160 300 -40 310Z" />
          </g>
        </svg>
      </div>

      {/* 5 · Bậc nước: ruộng bậc thang đá, nước tràn qua từng bậc */}
      <div className="piece" style={at(5, '4vw')}>
        <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[24svh]">
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              d={`M0 ${40 + i * 34}C200 ${20 + i * 34} 330 ${60 + i * 34} 500 ${44 + i * 34}S820 ${18 + i * 34} 1000 ${38 + i * 34}`}
              fill="none"
              stroke={INK}
              strokeOpacity={0.12 + i * 0.05}
              strokeWidth="1.4"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-[14svh] rotate-180 opacity-70 hz-only">
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M0 ${30 + i * 32}C250 ${10 + i * 32} 420 ${50 + i * 32} 640 ${30 + i * 32}S900 ${14 + i * 32} 1000 ${26 + i * 32}`} fill="none" stroke={INK} strokeOpacity=".14" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
      </div>

      {/* 6 · Đêm: mực loang, vài vì sao */}
      <div className="piece night" style={at(6, '10vw')}>
        <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="absolute inset-x-[10vw] top-0 h-[45%]">
          {Array.from({ length: 40 }, (_, i) => (
            <circle key={i} cx={r1(rnd(i + 200) * 1000)} cy={r1(rnd(i + 300) * 300)} r={r1(0.6 + rnd(i + 400) * 1.3)} fill={PAPER} fillOpacity={r1(0.25 + rnd(i + 500) * 0.55)} />
          ))}
        </svg>
      </div>

      {/* 7 · Trời vừa sáng: cành mai vàng chìa vào từ mép trên, cánh mai lả tả rơi xuống mặt nước */}
      <div className="piece overflow-clip" style={at(7, '4vw')}>
        <Mai className="bough absolute left-[14%] top-0 h-[24svh] w-auto hz-only" />
        {[
          [24, 24],
          [40, 34],
          [57, 20],
          [68, 38],
          [33, 50],
          [80, 26],
          [50, 58],
        ].map(([l, t], i) => (
          <i key={i} className="petal" style={css({ left: `${l}%`, top: `${t}%`, '--d': i })} />
        ))}
      </div>

      {/* 8 · Chân thác: sương bốc lên, một ngọn núi đá tan vào sương ngay trước thác */}
      <div className="piece" style={at(8, '6vw')}>
        <div className="mist drift-slow absolute inset-x-0 bottom-[6%] h-[30svh]" />
        <svg viewBox="0 0 400 600" preserveAspectRatio="none" overflow="visible" className="absolute bottom-0 right-[3vw] h-[66%] w-[22vw] min-w-48 hz-only">
          {/* núi đá vôi đỉnh tròn kiểu tranh thuỷ mặc: ngọn sau nhạt, ngọn trước đậm, chân tan vào sương */}
          <path filter="url(#bleed)" fill="url(#cliff)" opacity=".45" d="M30 600C52 520 66 430 92 344C108 290 120 214 150 182C172 158 200 170 210 214C224 276 226 372 240 452C250 512 256 562 262 660H22Z" />
          <path filter="url(#bleed)" fill="url(#cliff)" opacity=".8" d="M140 600C170 536 186 462 202 392C220 318 230 224 262 164C280 130 316 122 332 164C350 214 344 306 356 386C366 452 382 538 400 600V660H130Z" />
        </svg>
      </div>

      {/* Màn cuối · Thác Vũ Môn. Đi ngang: sân khấu = cả màn hình. Dọc: khung dính màn hình suốt quãng cuộn qua sân khấu. */}
      <div className="piece" style={at('s')}>
        <div className="stage-pin">
          <div className="dawn absolute inset-0 bg-[radial-gradient(34%_40%_at_72%_30%,#f2c9a6,rgb(242_201_166/0)_70%),linear-gradient(to_bottom,#f6efe2_0%,#f3dcc2_28%,#efd6c4_44%,rgb(243_238_227/0)_72%)]" />
          <Massif />
          {/* mây vắt ngang lưng núi */}
          <div className="bank drift-slow left-[36%] top-[50%] w-[30vw] opacity-90 [animation-delay:-17s]" />
          <div className="no-gl fall-sheet absolute bottom-[8%] left-[68%] top-[40%] w-[8%]" />
          <div className="mist drift-slow absolute bottom-0 left-[46%] h-[30%] w-[54%]" />
        </div>
      </div>
    </>
  )
}

/* ---------- Lớp trước cá (sau chữ): cho cá bơi khuất sau lau, bọt, sương, mây ---------- */

export function EnvFront() {
  return (
    <>
      <div className="piece hz-only" style={at(1, '4vw')}>
        <Reeds seed={77} n={6} className="left-[30%] h-[52svh] w-[11vw] opacity-80" style={css({ '--d': 2 })} />
        <Reeds seed={31} n={5} className="left-[74%] h-[46svh] w-[9vw] opacity-75" style={css({ '--d': 4 })} />
      </div>
      <div className="piece hz-only" style={at(2, '8vw')}>
        <div className="flow foam absolute inset-y-[34%] left-0 w-[200%] opacity-70" />
      </div>
      <div className="piece" style={at(8, '6vw')}>
        <div className="mist drift-slow absolute inset-x-[30%] bottom-0 h-[16svh] opacity-80 [animation-delay:-9s]" />
      </div>
      <div className="piece" style={at('s')}>
        <div className="stage-pin">
          {/* Mây sáng kéo ngang thân rồng (rồng ẩn hiện trong mây), chừa đầu rồng và thanh menu phía trên */}
          <div className="clouds-in absolute inset-0">
            <div className="bank drift-slow left-[41%] top-[30%] w-[24vw]" />
            <div className="bank drift-slow left-[70%] top-[4%] w-[26vw] opacity-80 [animation-delay:-11s]" />
            <div className="bank drift-slow left-[84%] top-[34%] w-[18vw] opacity-90 [animation-delay:-6s]" />
          </div>
          <Rock seed={3} className="-bottom-[3%] left-[57%] w-[11vw] min-w-28" />
          <Rock seed={8} className="-bottom-[5%] left-[77%] w-[15vw] min-w-36" />
          <div className="mist drift-slow absolute -bottom-[2%] left-[56%] h-[12%] w-[34%] opacity-70 [animation-delay:-5s]" />
        </div>
      </div>
    </>
  )
}
