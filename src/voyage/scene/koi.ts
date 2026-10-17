// Cá Koi Kohaku (trắng tuyết, ba mảng son) dựng hoàn toàn bằng code: thân tiện từ bảng mặt cắt đo theo tỉ lệ cá thật,
// vây là các tấm màng có tia, mắt lồi có giác mạc, hai đôi râu. Vảy và mảng son (mép sau sắc theo vảy, mép trước ửng
// qua vài hàng vảy) đều tính trong shader. Mũi ở +x, lưng +y. Chiều dài chuẩn SL (mũi → gốc đuôi).

import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { LIGHT, NOISE, SCALES, curve, lightUniforms } from './kit'

export const SL = 4.6
const NOSE = SL / 2
/** Số hàng vảy quanh thân (cá chép thật ~ 24–30). Chẵn để lưới so le khép kín ở sống lưng. */
const NC = 24
/** Nhịp sóng thân (số rad trên một chiều dài chuẩn): bước sóng ~1.1 thân như cá chép thật. */
const K = 5.8
const V3 = THREE.Vector3

// Mặt cắt theo tỉ lệ SL: lưng (trên trục), bụng (dưới trục), nửa bề ngang. Sâu nhất ~0.28 SL ở 0.4, rộng ~0.18 SL.
const U = [0, 0.05, 0.1, 0.15, 0.2, 0.26, 0.32, 0.4, 0.48, 0.56, 0.64, 0.72, 0.8, 0.87, 0.93, 1]
const fTop = curve(U, [0.05, 0.07, 0.094, 0.112, 0.127, 0.14, 0.15, 0.157, 0.155, 0.147, 0.132, 0.112, 0.092, 0.077, 0.068, 0.066])
const fBot = curve(U, [0.042, 0.058, 0.076, 0.089, 0.1, 0.109, 0.116, 0.121, 0.12, 0.114, 0.101, 0.085, 0.07, 0.06, 0.056, 0.057])
const fWid = curve(U, [0.04, 0.058, 0.072, 0.08, 0.086, 0.09, 0.091, 0.089, 0.084, 0.075, 0.063, 0.05, 0.038, 0.028, 0.021, 0.017])
/** Mõm tròn: chỏm elip dài 0.055 SL, không nhọn. */
const CAP = 0.055
const cap = (u: number) => (u >= CAP ? 1 : Math.sqrt(Math.max(0, 1 - (1 - u / CAP) ** 2)))
/** Mặt cắt siêu elip (đầy đặn hơn elip), lưng hẹp lại thành sống. */
const SE = 0.82
const sgn = (x: number) => (x < 0 ? -1 : 1)

function surf0(u: number, ang: number, out: THREE.Vector3) {
  const c = Math.cos(ang)
  const s = Math.sin(ang)
  const k = cap(u)
  const h = (c >= 0 ? fTop(u) : fBot(u)) * k
  return out.set(NOSE - u * SL, sgn(c) * Math.abs(c) ** SE * h * SL, sgn(s) * Math.abs(s) ** SE * fWid(u) * k * (1 - 0.2 * Math.max(c, 0) ** 2) * SL)
}

/** Pháp tuyến ngoài bằng sai phân: ∂u × ∂góc. */
function normalAt(f: typeof surf0, u: number, ang: number, out: THREE.Vector3) {
  const h = 1e-4
  const ue = Math.max(u, 3e-4)
  const du = f(ue + h, ang, new V3()).sub(f(Math.max(ue - h, 0), ang, new V3()))
  const da = f(ue, ang + h, new V3()).sub(f(ue, ang - h, new V3()))
  return out.crossVectors(du, da).normalize()
}

// Mắt: ngang tầm 0.02 SL trên trục, ở 0.1 SL sau mũi; bán kính 0.021 SL; lồi 0.3 bán kính.
const EYE_U = 0.1
const EYE_ANG = Math.acos((0.02 / fTop(EYE_U)) ** (1 / SE))
const EYE_R = 0.018 * SL
const eyeC = surf0(EYE_U, EYE_ANG, new V3())
const eyeN = normalAt(surf0, EYE_U, EYE_ANG, new V3())

function surf(u: number, ang: number, out: THREE.Vector3) {
  surf0(u, ang, out)
  const side = sgn(Math.sin(ang))
  const d2 = ((out.x - eyeC.x) ** 2 + (out.y - eyeC.y) ** 2 + (out.z - eyeC.z * side) ** 2) / EYE_R ** 2
  if (d2 < 9) out.add(new V3(eyeN.x, eyeN.y, eyeN.z * side).multiplyScalar(0.3 * EYE_R * Math.exp(-1.4 * d2)))
  return out
}

/** Vòng mặt cắt ở u: điểm, quãng cộng dồn quanh vòng, chu vi. */
function ring(u: number, nt: number, f = surf) {
  const pts = Array.from({ length: nt + 1 }, (_, j) => f(u, (j / nt) * Math.PI * 2, new V3()))
  const cum = [0]
  for (let j = 1; j <= nt; j++) cum.push(cum[j - 1] + pts[j].distanceTo(pts[j - 1]))
  return { pts, cum, per: cum[nt] }
}

/** Toạ độ vảy dọc thân a(u) = ∫ SL·du / (chu vi / NC): vảy vuông vức, nhỏ dần về cuống đuôi như cá thật. */
const A_TABLE = (() => {
  const us: number[] = []
  const as: number[] = []
  let a = 0
  let pu = 0
  let pp = 0
  const pmin = ring(0.2, 64, surf0).per * 0.6
  for (let i = 0; i <= 400; i++) {
    const u = i / 400
    const per = Math.max(ring(u, 64, surf0).per, pmin)
    if (i) a += ((u - pu) * SL * NC) / ((per + pp) / 2)
    us.push(u)
    as.push(a)
    pu = u
    pp = per
  }
  return { us, as }
})()
const aOf = (u: number) => {
  const i = Math.min(399, Math.floor(u * 400))
  return THREE.MathUtils.lerp(A_TABLE.as[i], A_TABLE.as[i + 1], u * 400 - i)
}

const BODY = 0
const BARBEL = 1
const DORSAL = 2
const PEC = 3
const PEL = 4
const ANAL = 5
const CAUDAL = 6

type Attr = { [name: string]: { data: number[]; size: number } }
function geo(attrs: Attr, index: number[]) {
  const g = new THREE.BufferGeometry()
  for (const [name, a] of Object.entries(attrs)) g.setAttribute(name, new THREE.Float32BufferAttribute(a.data, a.size))
  g.setIndex(index)
  return g
}
/** Chỉ số tam giác cho lưới (ni+1)×(nj+1), mặt ngoài theo chiều ∂i × ∂j. */
function gridIndex(ni: number, nj: number, flip = false) {
  const idx: number[] = []
  for (let i = 0; i < ni; i++) {
    for (let j = 0; j < nj; j++) {
      const a = i * (nj + 1) + j
      const b = a + nj + 1
      if (flip) idx.push(a, a + 1, b, a + 1, b + 1, b)
      else idx.push(a, b, a + 1, a + 1, b, b + 1)
    }
  }
  return idx
}

function body() {
  const NU = 220
  const NT = 96
  const P: number[] = []
  const N: number[] = []
  const T: number[] = []
  const S: number[] = []
  const n = new V3()
  const t = new V3()
  for (let i = 0; i <= NU; i++) {
    const u = (i / NU) ** 1.25
    const r = ring(u, NT)
    const a = aOf(u)
    for (let j = 0; j <= NT; j++) {
      const ang = (j / NT) * Math.PI * 2
      P.push(r.pts[j].x, r.pts[j].y, r.pts[j].z)
      if (u < 1e-6) n.set(1, 0, 0)
      else normalAt(surf, u, ang, n)
      const ue = Math.max(u, 3e-4)
      t.copy(surf(ue + 1e-4, ang, new V3())).sub(surf(Math.max(ue - 1e-4, 0), ang, new V3())).normalize()
      N.push(n.x, n.y, n.z)
      T.push(t.x, t.y, t.z)
      S.push(u, r.per > 1e-9 ? r.cum[j] / r.per : j / NT, a, BODY)
    }
  }
  return geo({ position: { data: P, size: 3 }, normal: { data: N, size: 3 }, aTan: { data: T, size: 3 }, aSkin: { data: S, size: 4 } }, gridIndex(NU, NT))
}

/** Râu: ống thon dọc đường cong, mọc từ khoé miệng. */
function barbel(root: THREE.Vector3, pts: THREE.Vector3[], r0: number, u: number) {
  const c = new THREE.CatmullRomCurve3([root, ...pts.map((p) => p.clone().add(root))])
  const NT = 12
  const NR = 8
  const P: number[] = []
  const N: number[] = []
  const T: number[] = []
  const S: number[] = []
  for (let i = 0; i <= NT; i++) {
    const s = i / NT
    const p = c.getPointAt(s)
    const tg = c.getTangentAt(s)
    const b1 = new V3().crossVectors(tg, new V3(0, 0, 1)).normalize()
    const b2 = new V3().crossVectors(b1, tg).normalize()
    const r = r0 * (1 - 0.75 * s)
    for (let j = 0; j <= NR; j++) {
      const ph = (j / NR) * Math.PI * 2
      const d = b1.clone().multiplyScalar(Math.cos(ph)).addScaledVector(b2, Math.sin(ph))
      P.push(p.x + d.x * r, p.y + d.y * r, p.z + d.z * r)
      N.push(d.x, d.y, d.z)
      T.push(tg.x, tg.y, tg.z)
      S.push(u, s, 0, BARBEL)
    }
  }
  return geo({ position: { data: P, size: 3 }, normal: { data: N, size: 3 }, aTan: { data: T, size: 3 }, aSkin: { data: S, size: 4 } }, gridIndex(NT, NR))
}

function barbels() {
  return [1, -1].flatMap((side) => {
    const corner = surf(0.014, Math.PI * 0.64, new V3())
    corner.z *= side
    const top = surf(0.03, Math.PI * 0.46, new V3())
    top.z *= side
    return [
      barbel(corner, [new V3(0, -0.05, 0.035 * side), new V3(-0.05, -0.09, 0.055 * side), new V3(-0.12, -0.1, 0.065 * side)], 0.016, 0.014),
      barbel(top, [new V3(0.01, -0.03, 0.025 * side), new V3(-0.01, -0.055, 0.035 * side)], 0.011, 0.03),
    ]
  })
}

/**
 * Tấm vây: f(s, t) với s chạy dọc gốc vây (tia), t từ gốc ra mép. Pháp tuyến bằng sai phân.
 * uw = vị trí dọc thân để vây đi cùng sóng thân (vây chẵn dùng gốc vây, vây lẻ dùng chính chỗ của nó).
 */
function sheet(ns: number, nt: number, f: (s: number, t: number) => THREE.Vector3, part: number, s0: number, s1: number, uRoot?: number) {
  const P: number[] = []
  const N: number[] = []
  const F: number[] = []
  const h = 1e-3
  for (let i = 0; i <= ns; i++) {
    const s = THREE.MathUtils.lerp(s0, s1, i / ns)
    for (let j = 0; j <= nt; j++) {
      const t = j / nt
      const p = f(s, t)
      const ds = f(s + h, t).sub(f(s - h, t))
      const dt = f(s, Math.min(t + h, 1)).sub(f(s, Math.max(t - h, 0)))
      const n = new V3().crossVectors(ds, dt).normalize()
      P.push(p.x, p.y, p.z)
      N.push(n.x, n.y, n.z)
      F.push(s, t, part, uRoot ?? (NOSE - p.x) / SL)
    }
  }
  return { P, N, F, idx: gridIndex(ns, nt) }
}
type Sheet = ReturnType<typeof sheet>
const toGeo = (s: Sheet) => geo({ position: { data: s.P, size: 3 }, normal: { data: s.N, size: 3 }, aFin: { data: s.F, size: 4 } }, s.idx)
/** Vây chẵn bên trái = soi gương vây phải (để vẫy đối xứng), đảo chiều tam giác. */
function mirror(s: Sheet): Sheet {
  return {
    P: s.P.map((v, i) => (i % 3 === 2 ? -v : v)),
    N: s.N.map((v, i) => (i % 3 === 2 ? -v : v)),
    F: s.F,
    idx: s.idx.map((_, i, a) => a[i - (i % 3) + [0, 2, 1][i % 3]]),
  }
}
const sm = THREE.MathUtils.smootherstep

function dorsal() {
  return sheet(
    64,
    14,
    (s, t) => {
      const u = THREE.MathUtils.lerp(0.37, 0.7, s)
      const al = THREE.MathUtils.lerp(1.02, 0.38, Math.max(s, 0) ** 0.8)
      const H = SL * (0.042 + 0.1 * Math.max(1 - s, 0) ** 1.35) * (0.32 + 0.68 * sm(s, 0, 0.07))
      return new V3(NOSE - u * SL - t * H * Math.cos(al), (fTop(u) - 0.006) * SL + t * H * Math.sin(al), 0)
    },
    DORSAL,
    0,
    1,
  )
}

function anal() {
  return sheet(
    20,
    10,
    (s, t) => {
      const u = THREE.MathUtils.lerp(0.715, 0.79, s)
      const al = THREE.MathUtils.lerp(0.95, 0.5, s)
      const H = SL * (0.035 + 0.085 * Math.max(1 - s, 0) ** 1.2) * (0.4 + 0.6 * sm(s, 0, 0.12))
      return new V3(NOSE - u * SL - t * H * Math.cos(al), -(fBot(u) - 0.006) * SL - t * H * Math.sin(al), 0)
    },
    ANAL,
    0,
    1,
  )
}

/** Đuôi chẻ hai thuỳ: tia giữa ngắn, tia ngoài dài, chóp thuỳ tròn; thả lỏng hơi rủ. s ∈ [-1, 1]. */
function caudal() {
  return sheet(
    76,
    18,
    (s, t) => {
      const a = Math.abs(s)
      const be = s * 0.62
      const L = SL * (0.19 + 0.155 * sm(a, 0, 0.9) - 0.035 * sm(a, 0.88, 1))
      return new V3(NOSE - 0.99 * SL - t * L * Math.cos(be), s * (s > 0 ? 0.058 : 0.05) * SL + t * L * Math.sin(be) - 0.02 * t * t * SL, 0)
    },
    CAUDAL,
    -1,
    1,
  )
}

/** Vây chẵn (ngực, bụng) bên phải: quạt tia từ một gốc ngắn trên sườn dưới, tia trước dài nhất, hơi khum. */
function paired(part: number) {
  const front = part === PEC
  const u = front ? 0.235 : 0.46
  const root = surf0(u, Math.PI * (front ? 0.68 : 0.87), new V3())
  const d0 = (front ? new V3(-0.38, -0.28, 0.88) : new V3(-0.5, -0.6, 0.62)).normalize()
  const d1 = (front ? new V3(-0.97, -0.2, 0.15) : new V3(-0.95, -0.28, 0.12)).normalize()
  const eb = (front ? new V3(-0.45, -0.85, -0.25) : new V3(-0.9, -0.3, -0.1)).normalize()
  const nf = new V3().crossVectors(d0, d1).normalize()
  const base = SL * (front ? 0.035 : 0.025)
  return sheet(
    front ? 40 : 26,
    14,
    (s, t) => {
      const L = SL * (front ? 0.2 + 0.025 * Math.sin(Math.PI * s) - 0.065 * s * s : 0.135 - 0.04 * s * s)
      const d = d0.clone().lerp(d1, s).normalize()
      return root
        .clone()
        .addScaledVector(eb, s * base)
        .addScaledVector(d, t * L)
        .addScaledVector(nf, 0.03 * SL * t * t * Math.sin(Math.PI * Math.min(Math.max(s, 0), 1)))
    },
    part,
    0,
    1,
    u,
  )
}

/** Trạng thái bơi mỗi khung hình. phase/amp: sóng quẫy; bend: uốn chữ C khi rẽ; curl: cong cả thân quanh pivot (khi nhảy). */
export interface Swim {
  phase: number
  amp: number
  bend: number
  flap: number
  spread: number
  curl: number
  pivot: number
}

const envK = (u: number) => 0.07 - 0.3 * u + 0.9 * u * u

/** Bản JS của sóng thân trong shader — để nhãn chú thích, bọt nước bám đúng vào thân đang uốn. */
export function koiPoint(p: THREE.Vector3, u: number, s: Swim) {
  const ph = s.phase - K * u
  const w = s.amp * envK(u) * Math.sin(ph) + s.bend * (u - 0.35) ** 2
  const dw = s.amp * ((-0.3 + 1.8 * u) * Math.sin(ph) - K * envK(u) * Math.cos(ph)) + 2 * s.bend * (u - 0.35)
  const sl = -dw / SL
  const c = 1 / Math.hypot(1, sl)
  const x = p.x - sl * c * p.z
  const y = p.y
  const z = w + c * p.z
  const k = Math.abs(s.curl) < 1e-4 ? 1e-4 : s.curl
  const a = k * (s.pivot - x)
  const hs = Math.sin(a / 2)
  return p.set(s.pivot - Math.sin(a) / k + y * Math.sin(a), (2 * hs * hs) / k + y * Math.cos(a), z)
}

/** Điểm neo nhãn trang đầu (thứ tự HERO.trust): miệng, vây ngực, vảy lưng. */
export const ANCHORS = [
  { p: surf(0.004, Math.PI * 0.55, new V3()), u: 0.004 },
  // Giữa vây ngực phải: lưới 41×15 điểm, tia thứ 20, 70% chiều dài.
  { p: new V3().fromArray(paired(PEC).P, (20 * 15 + 10) * 3), u: 0.235 },
  { p: surf(0.46, Math.PI * 0.12, new V3()), u: 0.46 },
]

const SWIM = /* glsl */ `
uniform float uPhase, uAmp, uBend, uFlap, uSpread, uCurl, uPivot, uTime;
const float SL = ${SL.toFixed(3)}, NOSE = ${NOSE.toFixed(3)}, K = ${K.toFixed(2)};
float envK(float u) { return .07 - .3 * u + .9 * u * u; }
// Sóng ngang chạy từ đầu ra đuôi; mặt cắt xoay theo độ dốc xương sống (thân uốn như cơ thật, không bị xô méo).
vec3 swim(vec3 p, inout vec3 n, inout vec3 tg, float u) {
  float ph = uPhase - K * u;
  float w = uAmp * envK(u) * sin(ph) + uBend * (u - .35) * (u - .35);
  float dw = uAmp * ((-.3 + 1.8 * u) * sin(ph) - K * envK(u) * cos(ph)) + 2. * uBend * (u - .35);
  float sl = -dw / SL, c = inversesqrt(1. + sl * sl), s = sl * c;
  vec3 q = vec3(p.x - s * p.z, p.y, w + c * p.z);
  n = vec3(c * n.x - s * n.z, n.y, s * n.x + c * n.z);
  tg = vec3(c * tg.x - s * tg.z, tg.y, s * tg.x + c * tg.z);
  float k = abs(uCurl) < 1e-4 ? 1e-4 : uCurl;
  float a = k * (uPivot - q.x), sa = sin(a), ca = cos(a), hs = sin(a * .5);
  q.xy = vec2(uPivot - sa / k, 2. * hs * hs / k) + q.y * vec2(sa, ca);
  n.xy = vec2(n.x * ca + n.y * sa, -n.x * sa + n.y * ca);
  tg.xy = vec2(tg.x * ca + tg.y * sa, -tg.x * sa + tg.y * ca);
  return q;
}`

const f = (x: number) => x.toFixed(4)
// Ba mảng son kiểu Sandan: đầu (không phủ mắt), vai, hông; cuống đuôi trắng. [đầu u, cuối u, mép dưới (0 lưng → 1 bụng)]
const PATCHES = [
  [0.05, 0.19, 0.32],
  [0.262, 0.5, 0.58],
  [0.56, 0.785, 0.5],
]
const eyeRing = ring(EYE_U, 400)
const eyeCf = eyeRing.cum[Math.round((EYE_ANG / (Math.PI * 2)) * 400)] / eyeRing.per
const eyeMu = surf(EYE_U + 1e-3, EYE_ANG, new V3()).distanceTo(surf(EYE_U - 1e-3, EYE_ANG, new V3())) / 2e-3

const SKIN = /* glsl */ `
const float NC = ${NC}., SL = ${SL.toFixed(3)}, NOSE = ${NOSE.toFixed(3)};
const vec3 HI = vec3(.4, .011, .007);
const vec3 SHIRO = vec3(.8, .79, .765);
const vec3 EYE = vec3(${f(EYE_U)}, ${f(eyeCf)}, ${f(EYE_R)});
const vec2 EYE_M = vec2(${f(eyeMu)}, ${f(eyeRing.per)});
${PATCHES.map((p, i) => `const vec3 P${i} = vec3(${f(aOf(p[0]))}, ${f(aOf(p[1]))}, ${f(p[2])});`).join('\n')}
${SCALES}

// Mảng son. Trên vảy: mép sau và mép dưới sắc theo từng vảy (kiwa); mép trước (sashi) là vài hàng vảy trắng phủ lên nền son,
// son chỉ ửng ở chân vảy bị vảy trước che. Trên đầu (không vảy): mép sắc nhưng trơn. sc = (toạ độ dọc, 0 lưng → ±1 bụng).
float hiPatch(vec3 P, vec2 sc, float lipD, float on, float seed) {
  float es = sc.y;
  float n1 = fbm(vec3(sc.x * .2, es * 2.4, seed)) - .5;
  float n2 = fbm(vec3(sc.x * .2 + 3.1, es * 2.4, seed + 5.)) - .5;
  float n3 = (fbm(vec3(sc.x * .45, es * 5., seed + 9.)) - .5) * on;
  float aa = mix(.1, .001, on);
  float fe = sc.x + n1 * 3. - P.x;
  float sashi = smoothstep(-2., 0., fe) * (.3 + .45 * (1. - smoothstep(0., .55, lipD)));
  float front = mix(smoothstep(-.8, .4, fe), max(step(0., fe), sashi), on);
  float rear = smoothstep(-aa, aa, P.y - sc.x - n2 * 3.4 - abs(es) * 2.2);
  float low = smoothstep(-aa * .08, aa * .08, P.z - abs(es) - n2 * .2 - n3 * .14);
  return front * rear * low;
}
`

export function createKoi() {
  const uniforms = {
    ...lightUniforms(),
    uPhase: { value: 0 },
    uAmp: { value: 0.6 },
    uBend: { value: 0 },
    uFlap: { value: 0.04 },
    uSpread: { value: 0 },
    uCurl: { value: 0 },
    uPivot: { value: 0 },
    uTime: { value: 0 },
    uOpacity: { value: 1 },
    uDissolve: { value: 0 },
    uGlow: { value: 0 },
    uViewH: { value: 900 },
    uShadow: { value: new V3(0.5, -0.8, -2.5) },
    uShadowA: { value: 0.32 },
  }

  const bodyGeo = mergeGeometries([body(), ...barbels()])
  const right = [paired(PEC), paired(PEL)]
  const finGeo = mergeGeometries([dorsal(), anal(), caudal(), ...right, ...right.map(mirror)].map(toGeo))
  for (const g of [bodyGeo, finGeo]) g.boundingSphere = new THREE.Sphere(new V3(-0.4, 0, 0), 4.2)

  const bodyMat = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.DoubleSide,
    transparent: true,
    vertexShader: /* glsl */ `
      ${SWIM}
      attribute vec3 aTan;
      attribute vec4 aSkin;
      varying vec3 vW, vN, vT, vObj;
      varying vec4 vSkin;
      void main() {
        vec3 p = position, n = normal, tg = aTan;
        float u = aSkin.x;
        if (aSkin.w > .5) {
          // Râu đung đưa theo nước, ngọn trễ hơn gốc.
          float t = aSkin.y;
          p.y -= t * t * .012 * SL * (1. + sin(uTime * 1.3 + p.z * 4.));
          p.z += t * t * .014 * SL * sin(uTime * 1.7 + sign(p.z) * 1.5);
        } else {
          // Thở: miệng mấp máy, nắp mang phập phồng.
          float br = sin(uTime * 2.6);
          p.x += .004 * SL * br * (1. - smoothstep(0., .03, u));
          p.z += sign(p.z) * .003 * SL * (br * .5 + .5) * smoothstep(.16, .2, u) * (1. - smoothstep(.2, .225, u)) * step(.12, abs(n.z));
        }
        vec3 q = swim(p, n, tg, u);
        vec4 w = modelMatrix * vec4(q, 1.);
        vW = w.xyz;
        vN = normalize(mat3(modelMatrix) * n);
        vT = normalize(mat3(modelMatrix) * tg);
        vObj = position;
        vSkin = aSkin;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uOpacity, uDissolve, uGlow;
      varying vec3 vW, vN, vT, vObj;
      varying vec4 vSkin;
      ${NOISE}
      ${LIGHT}
      ${SKIN}
      void main() {
        float u = vSkin.x, cf = vSkin.y;
        bool barb = vSkin.w > .5;
        // Tan thành bụi vàng từ đuôi lên đầu.
        float dn = fbm(vObj * 3.3);
        float eD = 1.1 - u * .7 + dn * .35 - uDissolve * 1.8;
        if (eD < 0.) discard;

        vec3 V = normalize(cameraPosition - vW);
        vec3 N = normalize(vN);
        if (!gl_FrontFacing) N = -N;
        vec3 T = normalize(vT - N * dot(vT, N));
        vec3 B = cross(N, T);
        float side = cf < .5 ? 1. : -1.;
        float d = cf < .5 ? 2. * cf : 2. * (1. - cf);
        float ep = d * side;

        // ---------- Vảy ----------
        vec2 g = vec2(vSkin.z, cf * NC), cen;
        vec4 sc = scaleAt(g, cen);
        // Mép sau nắp mang (cong ra sau ở giữa sườn); trên gáy vảy bắt đầu ngay sau đầu.
        float uo = .224 - .028 * min(pow((d - .5) / .34, 2.), 1.3);
        float scaleOn = barb ? 0. : smoothstep(uo + .004, uo + .016, u);
        vec2 sid = vec2(cen.x, mod(cen.y, NC));
        float r1 = hash12(sid + 1.3), r2 = hash12(sid + 7.9);
        float cd = mod(cen.y, NC) / NC;
        float ecen = (cd < .5 ? 2. * cd : 2. * (1. - cd)) * (cd < .5 ? 1. : -1.);

        // ---------- Mảng son ----------
        vec2 px = vec2(vSkin.z, ep);
        vec2 sp = mix(px, vec2(cen.x, ecen), scaleOn);
        float hi = max(max(hiPatch(P0, px, 1., 0., 1.7), hiPatch(P1, sp, sc.w, scaleOn, 4.3)), hiPatch(P2, sp, sc.w, scaleOn, 8.9));
        hi *= barb ? 0. : 1.;

        // ---------- Màu nền ----------
        vec3 alb = mix(SHIRO, HI * (.9 + .2 * r1 * scaleOn), hi);
        // Bụng trắng ấm, họng hồng nhẹ (máu dưới da mỏng).
        alb = mix(alb, vec3(.84, .74, .7), smoothstep(.75, 1., d) * (1. - smoothstep(.1, .3, u)) * .5);
        // Nắp mang da mỏng: ửng hồng mạch máu bên dưới, đậm dần về mép sau.
        float cheek = smoothstep(.13, .21, u) * (1. - smoothstep(uo - .01, uo + .004, u)) * smoothstep(.3, .55, d) * (1. - smoothstep(.85, .95, d));
        alb = mix(alb, vec3(.86, .6, .55), cheek * (1. - hi) * .45);
        // Lưới vảy: vệt bóng mảnh ngay sau mép vảy trước đè lên. Trên son rõ như lưới son sẫm, trên nền trắng chỉ thoáng như ngọc trai.
        float lip = (1. - smoothstep(0., .12, sc.w)) * scaleOn * (1. - smoothstep(.8, .98, d));
        alb *= 1. - lip * mix(.07, .42, hi);
        // Đường bên: hàng lỗ cảm giác mờ giữa sườn.
        float ll = (1. - smoothstep(.5, .9, abs(mod(cen.y, NC) - (side > 0. ? .25 : .75) * NC - .4 * sin(cen.x * .2)))) * (1. - smoothstep(.08, .16, length(sc.xy - vec2(.2, 0.)))) * scaleOn;
        alb *= 1. - .3 * ll * (1. - hi);
        if (barb) alb = vec3(.84, .74, .7);

        // ---------- Pháp tuyến: vảy vồng, nghiêng nhẹ từng chiếc; nắp mang gồ ----------
        float gA = .25 * (1. - smoothstep(0., .25, sc.z)) - .1;
        vec3 Np = normalize(N - (T * (gA + (r1 - .5) * .05) + B * (sc.y * .2 + (r2 - .5) * .05)) * scaleOn * .5);
        float op = (u - uo) * 160.;
        float gill = step(.16, d) * step(d, .86) * (1. - step(.5, scaleOn));
        Np = normalize(Np - T * exp(-op * op) * .35 * gill);
        // Da đầu không vảy nhưng không nhẵn như nhựa: gợn lỗ chân nhỏ làm vệt bóng vỡ ra.
        float sk = fbm(vObj * 38.), sk2 = fbm(vObj * 38. + 4.2);
        Np = normalize(Np + (T * (sk - .5) + B * (sk2 - .5)) * .16 * (1. - scaleOn));
        alb *= 1. - .16 * gill * smoothstep(-.5, .5, op) * (1. - smoothstep(.5, 3., op));

        // ---------- Mắt: tròng vàng đồng, con ngươi đen, giác mạc lồi bóng ----------
        vec2 eo = vec2((u - EYE.x) * EYE_M.x, ((side > 0. ? cf : 1. - cf) - EYE.y) * EYE_M.y * side) / EYE.z;
        float er = length(eo);
        float eye = barb ? 0. : 1. - smoothstep(.96, 1.02, er);
        float sock = barb ? 0. : smoothstep(.85, 1., er) * (1. - smoothstep(1., 1.35, er));
        alb *= 1. - .45 * sock;
        vec3 Ne = normalize(Np + (T * eo.x + B * eo.y * side) * .5);
        if (eye > 0.) {
          float ang = atan(eo.y, eo.x);
          float streak = fbm(vec3(ang * 4., er * 3., 2.));
          vec3 iris = mix(vec3(.2, .11, .03), vec3(.5, .32, .1), streak) * mix(.4, 1., smoothstep(.95, .62, er)) * mix(.45, 1., smoothstep(.2, -.4, eo.y * side));
          iris = mix(iris, vec3(.04, .025, .01), smoothstep(.78, .97, er));
          vec3 ec = mix(iris, vec3(.004, .004, .006), 1. - smoothstep(.55, .61, er));
          alb = mix(alb, ec, eye);
        }
        // Lỗ mũi, miệng.
        float nos = 0.;
        for (int k = 0; k < 2; k++) {
          vec2 no = vec2((u - .052 - float(k) * .012) * EYE_M.x, ((side > 0. ? cf : 1. - cf) - .085) * EYE_M.y * .7) / (EYE.z * (.38 - float(k) * .1));
          nos = max(nos, 1. - smoothstep(.7, 1., length(no)));
        }
        alb *= 1. - .7 * nos * (barb ? 0. : 1.);
        vec3 mo = (vObj - vec3(NOSE - .014 * SL, -.03 * SL, 0.)) / vec3(.012, .005, .035) / SL;
        float mouth = (1. - smoothstep(.7, 1., length(mo))) * (barb ? 0. : 1.);
        alb *= 1. - .85 * mouth;

        // ---------- Ánh sáng ----------
        float ao = mix(.55, 1., smoothstep(1., .55, d)) * (1. - .5 * sock) * (1. - .4 * mouth);
        float NoL = dot(Np, KEY);
        float wrap = mix(.3, .55, hi);
        float dif = max((NoL + wrap) / (1. + wrap), 0.);
        // Da cá dày thịt: phần tối hơi ửng ấm (ánh sáng tán xạ dưới da), nhất là mảng son.
        vec3 scatter = mix(vec3(1., .9, .85), vec3(1., .45, .3), hi) * (dif - max(NoL, 0.)) * .8;
        vec3 col = alb * (keyCol() * (max(NoL, 0.) + scatter) + envIrr(Np) * .85 * ao);
        col += alb * rimCol() * max(dot(Np, RIM), 0.) * .35;
        // Bóng ướt chạy liền một dải dọc thân; vảy chỉ làm nó gợn nhẹ.
        vec3 Ns = eye > 0. ? Ne : normalize(mix(N, Np, .45));
        float rough = mix(mix(.3 + .12 * sk, .2, scaleOn), .04, eye);
        float f0 = mix(.035, .05, eye);
        col += keyCol() * (specLobe(Ns, V, KEY, rough, f0) + .4 * specLobe(Ns, V, KEY, .5, f0));
        col += rimCol() * specLobe(Ns, V, RIM, .3, f0);
        col += envRad(reflect(-V, Ns), rough) * fSchlick(f0, max(dot(Ns, V), 0.)) * mix(ao, 1., eye);

        // Hoá mực (trước khi tan): da thẫm lại như mực ướt, mảng son còn le lói; mép vẫn bắt chút sáng trời.
        if (uGlow > 0.) {
          float fr = pow(1. - max(dot(Np, V), 0.), 3.);
          vec3 ink = vec3(.006, .009, .009) * (1. + 2. * max(NoL, 0.)) + envRad(reflect(-V, Np), .3) * fr * .25;
          col = mix(col, ink, uGlow * .9);
        }
        // Mép đang tan: viền mực đặc loang ra.
        col = mix(col, vec3(.002, .003, .003), (1. - smoothstep(0., .09, eD)) * step(.001, uDissolve));
        gl_FragColor = vec4(toScreen(col), uOpacity);
      }`,
  })

  const finMat = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      ${SWIM}
      attribute vec4 aFin;
      varying vec3 vW, vN, vObj;
      varying vec4 vFin;
      void main() {
        vec3 p = position, n = normal, tg = vec3(-1., 0., 0.);
        float s = aFin.x, t = aFin.y, part = aFin.z, u = aFin.w;
        float side = position.z < 0. ? -1. : 1.;
        if (part > 2.5 && part < 4.5) {
          // Vây chẵn chèo: ngọn trễ nhịp so với gốc, mép sau trễ hơn mép trước — sóng lượn trên màng vây.
          float k = part < 3.5 ? 1. : .7;
          float w = sin(uTime * (part < 3.5 ? 2.3 : 2.9) + side * 1.1 + part - t * 2.4 - s * 1.3);
          p += n * SL * k * (uFlap * pow(t, 1.4) * w + uSpread * t);
        } else if (part < 2.5 || part > 4.5 && part < 5.5) {
          // Vây lưng, vây hậu môn gợn sóng chạy về sau.
          p.z += t * t * .028 * SL * sin(uTime * 3.4 - s * 7. + part);
        }
        vec3 q = swim(p, n, tg, u);
        vec4 w = modelMatrix * vec4(q, 1.);
        vW = w.xyz;
        vN = normalize(mat3(modelMatrix) * n);
        vObj = position;
        vFin = aFin;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uOpacity, uDissolve, uGlow;
      varying vec3 vW, vN, vObj;
      varying vec4 vFin;
      ${NOISE}
      ${LIGHT}
      void main() {
        float s = vFin.x, t = vFin.y, part = vFin.z, u = vFin.w;
        float eD = 1.1 - u * .7 + fbm(vObj * 3.3) * .35 - uDissolve * 1.8;
        if (eD < 0.) discard;
        float nR = part < 2.5 ? 19. : part < 3.5 ? 15. : part < 4.5 ? 9. : part < 5.5 ? 8. : 13.;
        float sr = s * nR;
        // Mép vây khía nhẹ giữa các tia; tia tách đôi về phía ngọn.
        float scal = .5 - .5 * cos(6.2832 * sr);
        float edge = 1. - .05 * scal * smoothstep(.2, .6, t);
        if (t > edge) discard;
        float aT = fwidth(t);
        float edgeA = 1. - smoothstep(edge - aT * 1.5, edge, t);
        float br = .23 * smoothstep(.4, 1., t);
        float dr = min(abs(fract(sr + .5 - br) - .5), abs(fract(sr + .5 + br) - .5));
        float aw = fwidth(sr);
        float rw = .035 + .04 * (1. - t);
        float ray = 1. - smoothstep(rw, rw + aw * 1.3, dr);
        // Đốt tia: khe sáng ngắn dọc tia.
        ray *= 1. - .2 * step(.88, fract(t * 14. + s * 3.)) * step(.3, t);

        vec3 V = normalize(cameraPosition - vW);
        vec3 N = normalize(vN);
        if (dot(N, V) < 0.) N = -N;
        vec3 alb = mix(vec3(.84, .84, .82), vec3(.93, .91, .87), ray);
        alb = mix(alb, vec3(.86, .66, .6), (1. - smoothstep(0., .25, t)) * .4);
        float NoL = dot(N, KEY);
        // Màng vây mỏng: sáng từ cả hai mặt; nhìn ngược sáng thì rực ấm như lụa.
        vec3 col = alb * (keyCol() * (max(NoL, 0.) * .7 + max(-NoL, 0.) * .5 * vec3(1., .82, .66)) + envIrr(N) * .8);
        col += alb * keyCol() * vec3(1., .8, .6) * pow(max(dot(-V, KEY), 0.), 4.) * .9;
        col += keyCol() * specLobe(N, V, KEY, .28, .035) + envRad(reflect(-V, N), .28) * fSchlick(.035, max(dot(N, V), 0.));
        float alpha = mix(mix(.6, .34, t), .74, ray) * edgeA;
        alpha = mix(alpha, 1., pow(1. - abs(dot(N, V)), 4.) * .5);
        if (uGlow > 0.) {
          // Vây thấm mực: tia đậm, màng loang nhạt.
          col = mix(col, vec3(.004, .006, .006) * (1. + 3. * (1. - ray)), uGlow * .9);
          alpha = mix(alpha, .9, uGlow * .7);
        }
        col = mix(col, vec3(.002, .003, .003), (1. - smoothstep(0., .09, eD)) * step(.001, uDissolve));
        gl_FragColor = vec4(toScreen(col), alpha * uOpacity);
      }`,
  })

  // Bóng mềm in xuống "nền" phía sau: chuỗi đốm mờ dọc xương sống, gộp bằng MAX nên không loang lổ chỗ chồng nhau.
  const NS = 96
  const sh = new Float32Array(NS * 2)
  for (let i = 0; i < NS; i++) {
    const u = -0.01 + (i / (NS - 1)) * 1.3
    sh[i * 2] = u
    sh[i * 2 + 1] = u <= 1 ? ((fTop(u) + fBot(u)) / 2) * cap(Math.max(u, 0)) * SL * 1.25 : (0.06 + 0.25 * (u - 1)) * SL
  }
  const shGeo = new THREE.BufferGeometry()
  shGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(NS * 3), 3))
  shGeo.setAttribute('aSh', new THREE.Float32BufferAttribute(sh, 2))
  shGeo.boundingSphere = new THREE.Sphere(new V3(), 1e3)
  const shMat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendEquation: THREE.MaxEquation,
    vertexShader: /* glsl */ `
      ${SWIM}
      uniform float uViewH, uDissolve;
      uniform vec3 uShadow;
      attribute vec2 aSh;
      varying float vA;
      void main() {
        vec3 n = vec3(0.), tg = vec3(0.);
        vec3 q = swim(vec3(NOSE - aSh.x * SL, 0., 0.), n, tg, aSh.x);
        vec4 w = modelMatrix * vec4(q, 1.) + vec4(uShadow, 0.);
        vec4 mv = viewMatrix * w;
        float r = aSh.y * length(modelMatrix[0].xyz);
        gl_PointSize = 2.6 * r * projectionMatrix[1][1] * uViewH * .5 / -mv.z;
        vA = (aSh.x > 1. ? .55 : 1.) * smoothstep(0., .25, 1.27 - aSh.x * .7 - uDissolve * 1.8);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uShadowA, uOpacity;
      varying float vA;
      void main() {
        vec2 c = gl_PointCoord * 2. - 1.;
        float a = exp(-dot(c, c) * 3.2) * uShadowA * vA * uOpacity;
        gl_FragColor = vec4(vec3(.03, .07, .07) * a, a);
      }`,
  })

  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat)
  const finMesh = new THREE.Mesh(finGeo, finMat)
  const shadow = new THREE.Points(shGeo, shMat)
  shadow.renderOrder = 0
  bodyMesh.renderOrder = 1
  finMesh.renderOrder = 2
  const group = new THREE.Group()
  group.add(shadow, bodyMesh, finMesh)

  return {
    group,
    uniforms,
    /** Ghi trạng thái bơi vào shader. */
    swim(s: Swim) {
      uniforms.uPhase.value = s.phase
      uniforms.uAmp.value = s.amp
      uniforms.uBend.value = s.bend
      uniforms.uFlap.value = s.flap
      uniforms.uSpread.value = s.spread
      uniforms.uCurl.value = s.curl
      uniforms.uPivot.value = s.pivot
    },
    dispose() {
      for (const o of [bodyMesh, finMesh, shadow]) {
        o.geometry.dispose()
        o.material.dispose()
      }
    },
  }
}
