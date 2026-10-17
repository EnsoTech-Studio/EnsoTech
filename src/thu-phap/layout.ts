/**
 * Khung tranh: 1U = min(1vw, 100svh/56) — màn 16:9 nhìn trọn 100U × 56U ở độ phóng 1.
 * Chữ, nét vẽ và máy quay cùng một hệ toạ độ U nên bố cục giữ nguyên trên mọi màn rộng.
 * Đổi PAINT_Q thì sửa luôn khối @media tương ứng trong thu-phap.css.
 */
export const PAINT_Q = '(min-width: 64rem) and (min-height: 37.5rem) and (prefers-reduced-motion: no-preference)'
export const unit = (w: number, h: number) => Math.min(w / 100, h / 56)

export interface Cam {
  x: number
  y: number
  z: number
}

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

// Các trạm dừng đọc (tâm khung nhìn, độ phóng). Phải khớp vị trí chữ trong page.tsx và chapters.tsx.
const HERO: Cam = { x: 50, y: 30, z: 1 }
const B1: Cam = { x: 50, y: 93, z: 1 }
const B2: Cam = { x: 142, y: 106, z: 1 }
// Các chương giữa tranh: trạm cao, trạm thấp xen kẽ để máy quay lượn lên xuống như nét bút.
const SV1: Cam = { x: 256, y: 70, z: 1 }
const SV2: Cam = { x: 352, y: 94, z: 1 }
const SV3: Cam = { x: 448, y: 66, z: 1 }
const PJ1: Cam = { x: 544, y: 90, z: 1 }
const PJ2: Cam = { x: 640, y: 64, z: 1 }
const PJ3: Cam = { x: 736, y: 90, z: 1 }
const SC1: Cam = { x: 832, y: 64, z: 1 }
const SC2: Cam = { x: 928, y: 90, z: 1 }
const PR: Cam = { x: 1024, y: 63, z: 1 }
const WY: Cam = { x: 1121, y: 88, z: 1 }
const FQ: Cam = { x: 1216, y: 64, z: 1 }
const CT: Cam = { x: 1312, y: 88, z: 1 }
// Khung nhìn x 1339–1521, y 34–136: chữ liên hệ (hết ở x 1358) tan vì máy quay lùi xa (painting.client, blocks).
const GATE: Cam = { x: 1430, y: 85, z: 0.55 }

/** Máy quay lúc hoá rồng theo tiến độ f: theo cá lên thác, rồi lùi xa thấy rồng cuộn mây và vòng Ensō. */
const FIN: [number, Cam][] = [
  [0, { x: 1444, y: 108, z: 1 }],
  [0.08, { x: 1446, y: 104, z: 1 }],
  [0.22, { x: 1448, y: 56, z: 0.92 }],
  [0.34, { x: 1444, y: 46, z: 0.78 }],
  [0.58, { x: 1434, y: 52, z: 0.58 }],
  [0.8, { x: 1438, y: 52, z: 0.5 }],
  [1, { x: 1438, y: 52, z: 0.5 }],
]

/** Các khung dừng đọc: lớp sâu đứng đúng chỗ khi máy quay ở khung gần nhất. */
export const STOPS: readonly Cam[] = [HERO, B1, B2, SV1, SV2, SV3, PJ1, PJ2, PJ3, SC1, SC2, PR, WY, FQ, CT, GATE, FIN[FIN.length - 1][1]]

/** arc: lùi xa giữa đường (0.35 = còn 65% độ phóng), lift: vồng lên (U, âm là lên trời) — chuyển cảnh như máy quay cẩu. */
function lerpCam(a: Cam, b: Cam, t: number, arc = 0, lift = 0): Cam {
  const d = Math.hypot(b.x - a.x, b.y - a.y)
  const s = Math.sin(Math.PI * t)
  const z = Math.exp(Math.log(a.z) + (Math.log(b.z) - Math.log(a.z)) * t) * (1 - arc * s * Math.min(1, d / 90))
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t + lift * s, z }
}

function finCam(f: number): Cam {
  let k = 0
  while (k < FIN.length - 2 && f > FIN[k + 1][0]) k++
  const [fa, a] = FIN[k], [fb, b] = FIN[k + 1]
  return lerpCam(a, b, smooth(fa, fb, f))
}

interface Step {
  /** Độ dài đoạn, tính bằng số màn hình cuộn. */
  len: number
  cam: (t: number) => Cam
  fin?: boolean
}
const hold = (c: Cam, len: number): Step => ({ len, cam: () => c })
const go = (a: Cam, b: Cam, len: number, arc = 0.22, lift = 0): Step => ({ len, cam: (t) => lerpCam(a, b, ease(t), arc, lift) })

const STEPS: Step[] = [
  hold(HERO, 0.3),
  go(HERO, B1, 1),
  hold(B1, 0.8),
  go(B1, B2, 1.1),
  hold(B2, 0.9),
  // Sang chương mới: lùi xa thấy cả tranh rồi sà xuống; trong một chương: lướt gần.
  go(B2, SV1, 1.1, 0.35, -8),
  hold(SV1, 0.6),
  go(SV1, SV2, 1, 0.15),
  hold(SV2, 0.6),
  go(SV2, SV3, 1, 0.2),
  hold(SV3, 0.6),
  go(SV3, PJ1, 1.1, 0.4, -10),
  hold(PJ1, 0.6),
  go(PJ1, PJ2, 1, 0.12),
  hold(PJ2, 0.6),
  go(PJ2, PJ3, 1, 0.12),
  hold(PJ3, 0.6),
  go(PJ3, SC1, 1.1, 0.4, -10),
  hold(SC1, 0.6),
  go(SC1, SC2, 1, 0.15),
  hold(SC2, 0.6),
  go(SC2, PR, 1.1, 0.35, 8),
  hold(PR, 0.7),
  go(PR, WY, 1, 0.25),
  hold(WY, 0.7),
  go(WY, FQ, 1, 0.3, -8),
  hold(FQ, 0.8),
  go(FQ, CT, 1, 0.2),
  hold(CT, 0.9),
  go(CT, GATE, 1),
  hold(GATE, 0.35),
  go(GATE, FIN[0][1], 0.7),
  { len: 5, cam: finCam, fin: true },
  hold(FIN[FIN.length - 1][1], 0.4),
]

/** Tổng hành trình (số màn hình cuộn). thu-phap.css giữ sẵn chiều cao này trước khi JS chạy: sửa cả hai. */
export const TOTAL = STEPS.reduce((s, x) => s + x.len, 0)

/** Vị trí cuộn v (đơn vị màn hình) → máy quay và tiến độ hoá rồng f. */
export function journey(v: number): { cam: Cam; f: number } {
  let a = 0
  let f = 0
  for (const s of STEPS) {
    if (v <= a + s.len || s === STEPS[STEPS.length - 1]) {
      const t = clamp((v - a) / s.len)
      return { cam: s.cam(t), f: s.fin ? t : f }
    }
    if (s.fin) f = 1
    a += s.len
  }
  return { cam: HERO, f }
}

/** Vị trí cuộn (màn hình) ứng với tiến độ hoá rồng f. */
export function vAtF(f: number) {
  let a = 0
  for (const s of STEPS) {
    if (s.fin) return a + s.len * clamp(f)
    a += s.len
  }
  return a
}
