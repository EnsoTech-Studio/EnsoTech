import * as THREE from 'three'

/**
 * Nét bút lông: một dải (ribbon) dọc theo xương nét, bề ngang theo lực ấn bút.
 * Shader lo phần "mực": mép xơ theo thớ giấy, sợi lông bút, khô dần về cuối nét (phi bạch), loang mực ướt.
 * Mọi toạ độ là px của "tờ giấy" (thế giới), trục y hướng xuống như CSS.
 */

export type Pt = readonly [number, number]
export type Rgb = readonly [number, number, number]

export const INK: Rgb = [0.075, 0.085, 0.08]
export const SON: Rgb = [0.72, 0.17, 0.13]

export interface Stroke {
  pts: readonly Pt[]
  /** Nửa bề ngang tối đa (px). */
  w: number
  /** Lực ấn dọc nét 0..1 → hệ số bề ngang. */
  press?: (t: number) => number
  col?: Rgb
  a?: number
  /** Độ khô: 0 = mực đẫm, 1 = xơ hẳn. */
  dry?: number
  /** Độ loang: 0 = nét gọn, 1 = mảng mực nước (mép mềm, viền đậm khi khô). */
  wet?: number
  /** Nhạt dần về phía v = +1 (bên trái hướng vẽ, với nét vẽ trái → phải là phía dưới): núi tan vào sương. */
  fade?: number
  /** Cửa sổ hiện nét theo thước vẽ (uDraw): t0 → t1 đầu bút chạy từ đầu tới cuối nét. */
  t0?: number
  t1?: number
  seed?: number
  /** 0 = gắn vào tờ giấy, 1 = gắn vào sân khấu màn cuối (dọc: dính màn hình). */
  group?: number
  /** Bước lấy mẫu dọc nét (px). */
  step?: number
  /** Thị sai: 0 = dính giấy; dương = lớp xa (trôi theo máy quay); âm = lớp gần (lướt nhanh hơn giấy). */
  par?: number
  /** Chỗ máy quay đứng (px thế giới) thì nét nằm đúng chỗ vẽ. */
  home?: Pt
  /** Mực nở từ giữa nét ra (thay vì chạy theo đầu bút). Mặc định: nét ướt (wet > .5). */
  bloom?: boolean
  /** Lay theo gió: [y gốc, độ lay]; đầu ngọn lệch ngang ≈ k·(y gốc − y)²·gió. */
  sway?: readonly [base: number, k: number]
}

/** Nhấn bút nhanh, giữ, nhấc dần: dáng nét thường gặp. */
export const brush = (t: number) => Math.sqrt(Math.min(1, t / 0.07)) * (0.35 + 0.65 * Math.pow(Math.min(1, (1 - t) / 0.55), 0.6))
/** Hai đầu nhọn, phình giữa: lá lan, sợi râu. */
export const leaf = (t: number) => Math.pow(Math.sin(Math.PI * t), 0.75)
/** Chấm tròn (hai điểm gần nhau thành chấm mực). */
export const dot = (t: number) => Math.sqrt(Math.max(0, 1 - (2 * t - 1) ** 2))
/** Bề ngang đều, hai đầu tròn nhẹ. */
export const even = (t: number) => Math.sqrt(Math.min(1, t / 0.03, (1 - t) / 0.03))

const PAD = 1.35
const FLOATS = { position: 3, aUv: 2, aA: 4, aB: 4, aC: 4, aD: 2, aE: 4, aF: 2 } as const

/** Catmull-Rom qua các điểm điều khiển → dãy điểm dày, đều theo bước `step` (mảng phẳng x0,y0,x1,y1…). */
export function resample(pts: readonly Pt[], step: number): number[] {
  const out: number[] = []
  const n = pts.length
  if (n < 2) return out
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)]
    const seg = Math.hypot(p2[0] - p1[0], p2[1] - p1[1])
    const k = Math.max(1, Math.ceil(seg / step))
    for (let j = 0; j < k; j++) {
      const t = j / k, t2 = t * t, t3 = t2 * t
      for (let c = 0; c < 2; c++) {
        out.push(0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3))
      }
    }
  }
  out.push(pts[n - 1][0], pts[n - 1][1])
  return out
}

export const stepOf = (s: Stroke) => s.step ?? Math.min(12, Math.max(1.5, s.w * 0.6))

/** Số đỉnh đúng bằng số đỉnh InkBatch.add sẽ tạo: để cấp phát lô tĩnh vừa khít. */
export const countVerts = (list: readonly Stroke[]) => list.reduce((n, s) => n + resample(s.pts, stepOf(s)).length, 0)

/** Một lô nét gộp chung một lần vẽ. Tĩnh: dựng một lần. Động (cá, rồng, giọt mực): reset → add → commit mỗi khung hình. */
export class InkBatch {
  readonly geometry = new THREE.BufferGeometry()
  private arr: Record<keyof typeof FLOATS, Float32Array>
  private idx: Uint32Array
  private nv = 0
  private ni = 0

  constructor(private maxVerts: number, dynamic = false) {
    this.arr = {} as Record<keyof typeof FLOATS, Float32Array>
    for (const [name, size] of Object.entries(FLOATS) as [keyof typeof FLOATS, number][]) {
      this.arr[name] = new Float32Array(maxVerts * size)
      const attr = new THREE.BufferAttribute(this.arr[name], size)
      if (dynamic) attr.setUsage(THREE.DynamicDrawUsage)
      this.geometry.setAttribute(name, attr)
    }
    this.idx = new Uint32Array(maxVerts * 3)
    const index = new THREE.BufferAttribute(this.idx, 1)
    if (dynamic) index.setUsage(THREE.DynamicDrawUsage)
    this.geometry.setIndex(index)
    this.geometry.setDrawRange(0, 0)
  }

  reset() {
    this.nv = 0
    this.ni = 0
  }

  add(s: Stroke) {
    const p = resample(s.pts, stepOf(s))
    const m = p.length / 2
    if (m < 2 || this.nv + m * 2 > this.maxVerts) return
    const len = new Float32Array(m)
    for (let i = 1; i < m; i++) len[i] = len[i - 1] + Math.hypot(p[i * 2] - p[i * 2 - 2], p[i * 2 + 1] - p[i * 2 - 1])
    const L = Math.max(len[m - 1], 1e-3)
    const press = s.press ?? brush
    const [r, g, b] = s.col ?? INK
    const { position, aUv, aA, aB, aC, aD, aE, aF } = this.arr
    const base = this.nv
    const home = s.home ?? [0, 0], par = s.par ?? 0, bloom = (s.bloom ?? (s.wet ?? 0) > 0.5) ? 1 : 0
    const [swayY, swayK] = s.sway ?? [0, 0]
    for (let i = 0; i < m; i++) {
      const a = Math.max(0, i - 1), c = Math.min(m - 1, i + 1)
      let tx = p[c * 2] - p[a * 2], ty = p[c * 2 + 1] - p[a * 2 + 1]
      const tl = Math.hypot(tx, ty) || 1
      tx /= tl
      ty /= tl
      const u = len[i] / L
      const hw = Math.max(0.45, s.w * press(u))
      for (let side = 0; side < 2; side++) {
        const v = side ? PAD : -PAD
        const k = this.nv
        position[k * 3] = p[i * 2] - ty * hw * v
        position[k * 3 + 1] = p[i * 2 + 1] + tx * hw * v
        position[k * 3 + 2] = 0
        aUv[k * 2] = u
        aUv[k * 2 + 1] = v
        aA[k * 4] = s.t0 ?? -1e9
        aA[k * 4 + 1] = s.t1 ?? -1e9
        aA[k * 4 + 2] = s.seed ?? 0
        aA[k * 4 + 3] = L
        aB[k * 4] = r
        aB[k * 4 + 1] = g
        aB[k * 4 + 2] = b
        aB[k * 4 + 3] = s.a ?? 1
        aC[k * 4] = s.dry ?? 0
        aC[k * 4 + 1] = s.wet ?? 0
        aC[k * 4 + 2] = hw
        aC[k * 4 + 3] = s.fade ?? 0
        aD[k * 2] = s.group ?? 0
        aD[k * 2 + 1] = s.w
        aE[k * 4] = home[0]
        aE[k * 4 + 1] = home[1]
        aE[k * 4 + 2] = par
        aE[k * 4 + 3] = bloom
        aF[k * 2] = swayY
        aF[k * 2 + 1] = swayK
        this.nv++
      }
    }
    for (let i = 0; i < m - 1; i++) {
      const q = base + i * 2
      this.idx.set([q, q + 1, q + 2, q + 1, q + 3, q + 2], this.ni)
      this.ni += 6
    }
  }

  commit() {
    for (const name of Object.keys(FLOATS)) {
      const attr = this.geometry.getAttribute(name) as THREE.BufferAttribute
      attr.clearUpdateRanges()
      attr.addUpdateRange(0, this.nv * FLOATS[name as keyof typeof FLOATS])
      attr.needsUpdate = true
    }
    const index = this.geometry.getIndex()!
    index.clearUpdateRanges()
    index.addUpdateRange(0, this.ni)
    index.needsUpdate = true
    this.geometry.setDrawRange(0, this.ni)
  }

  get vertices() {
    return this.nv
  }
}

/** Đường đi dày điểm, đo theo độ dài: cá bơi dọc suối, rồng bay dọc đường cuộn. */
export class Path {
  readonly p: number[]
  readonly acc: Float32Array
  readonly L: number

  constructor(ctrl: readonly Pt[], step: number) {
    this.p = ctrl.length > 1 ? resample(ctrl, step) : ctrl.length ? [ctrl[0][0], ctrl[0][1]] : [0, 0]
    const m = this.p.length / 2
    this.acc = new Float32Array(m)
    for (let i = 1; i < m; i++) this.acc[i] = this.acc[i - 1] + Math.hypot(this.p[i * 2] - this.p[i * 2 - 2], this.p[i * 2 + 1] - this.p[i * 2 - 1])
    this.L = this.acc[m - 1]
  }

  private seg(s: number) {
    const a = this.acc
    let lo = 0, hi = a.length - 1
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1
      if (a[mid] <= s) lo = mid
      else hi = mid
    }
    return lo
  }

  /** Điểm ở quãng s; ngoài hai đầu thì kéo thẳng theo hướng đầu/cuối. */
  at(s: number): Pt {
    const m = this.acc.length
    if (m < 2) return [this.p[0], this.p[1]]
    const i = s <= 0 ? 0 : s >= this.L ? m - 2 : this.seg(s)
    const d = this.acc[i + 1] - this.acc[i] || 1
    const t = (s - this.acc[i]) / d
    return [this.p[i * 2] + (this.p[i * 2 + 2] - this.p[i * 2]) * t, this.p[i * 2 + 1] + (this.p[i * 2 + 3] - this.p[i * 2 + 1]) * t]
  }

  /** Quãng s của điểm gần p nhất, tìm trong [lo, hi]. */
  nearest(x: number, y: number, lo = 0, hi = this.L) {
    let best = 0, bd = Infinity
    const a = this.acc
    for (let i = 0; i < a.length; i++) {
      if (a[i] < lo || a[i] > hi) continue
      const d = (this.p[i * 2] - x) ** 2 + (this.p[i * 2 + 1] - y) ** 2
      if (d < bd) {
        bd = d
        best = a[i]
      }
    }
    return best
  }
}

export const inkUniforms = () => ({
  uDraw: { value: 0 },
  uPx: { value: 1 },
  uStage: { value: new THREE.Vector2() },
  /** Tâm máy quay (px thế giới) và giới hạn lệch thị sai. */
  uCam: { value: new THREE.Vector2() },
  uLim: { value: new THREE.Vector2(1e6, 1e6) },
  /** 1 = có chuyển động phụ (thị sai, lay gió); 0 = giảm chuyển động. */
  uParK: { value: 1 },
  /** Gió do tốc độ cuộn, khoảng -1..1. */
  uWind: { value: 0 },
  uT: { value: 0 },
})

const vert = /* glsl */ `
attribute vec2 aUv;
attribute vec4 aA;
attribute vec4 aB;
attribute vec4 aC;
attribute vec2 aD;
attribute vec4 aE;
attribute vec2 aF;
uniform vec2 uStage;
uniform vec2 uCam;
uniform vec2 uLim;
uniform float uParK;
uniform float uWind;
uniform float uT;
varying vec2 vUv;
varying vec4 vA;
varying vec4 vB;
varying vec4 vC;
varying vec2 vW;
varying float vMax;
varying float vBloom;
void main() {
  vec3 p = position;
  p.xy += uStage * aD.x;
  // Thị sai: lớp xa trôi theo máy quay, lớp gần lướt ngược; kẹp để vật không trôi sang chương khác.
  p.xy += clamp(uCam - aE.xy, -uLim, uLim) * aE.z * uParK;
  // Lay gió: gốc đứng yên, ngọn lệch theo bình phương độ cao; gió cuộn + làn gió nhẹ.
  float h = max(0.0, aF.x - position.y);
  p.x += aF.y * h * h * (uWind + uParK * 0.35 * sin(uT * 1.3 + position.x * 0.004 + aF.x * 0.003));
  vUv = aUv; vA = aA; vB = aB; vC = aC; vW = position.xy; vMax = aD.y; vBloom = aE.w;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`

const frag = /* glsl */ `
precision highp float;
uniform float uDraw;
uniform float uPx;
varying vec2 vUv;
varying vec4 vA;
varying vec4 vB;
varying vec4 vC;
varying vec2 vW;
varying float vMax;
varying float vBloom;

float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vn(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + 1.0), f.x), f.y);
}
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }

void main() {
  float u = vUv.x, v = vUv.y, av = abs(v);
  float seed = vA.z, len = vA.w;
  float dry = vC.x, wet = vC.y, hw = max(vC.z, 0.45), fade = vC.w;
  float s = u * len;

  // Đầu bút chạy dọc nét: hiện tới đâu có mực tới đó, lùi thì thu lại.
  float span = vA.y - vA.x;
  float rev = span <= 0.0 ? step(vA.x, uDraw) : clamp((uDraw - vA.x) / span, 0.0, 1.0);
  if (rev <= 0.0) discard;
  float show = 1.0, ring = 0.0;
  if (rev >= 1.0) {
  } else if (vBloom > 0.5) {
    // Mực nở: thấm từ giữa nét ra, mép loang không đều, viền trước đậm hơn (nước đẩy mực ra mép).
    float R = len * 0.5 + hw;
    float q = length(vec2(s - len * 0.5, av * hw)) / R + (fbm(vW * 0.025 + seed) - 0.5) * 0.4;
    float front = rev * 1.45;
    show = 1.0 - smoothstep(front - 0.14, front, q);
    ring = smoothstep(front - 0.2, front - 0.05, q) * show * (1.0 - smoothstep(0.8, 1.0, rev));
  } else {
    float tip = max(vMax * 2.2, 6.0);
    float head = rev * (len + tip);
    show = 1.0 - smoothstep(head - tip, head, s + av * vMax * 0.6);
  }
  if (show <= 0.002) discard;

  // Mép nét: lượn chậm + xơ theo thớ giấy; nét khô xơ nhiều hơn.
  float e1 = vn(vec2(s / max(vMax, 2.0) * 0.55, seed * 13.1)) - 0.5;
  float e2 = vn(vec2(s * 0.32 + v * 2.0, seed * 7.7)) - 0.5;
  float e3 = vn(vec2(s * 1.1, seed * 3.3 + v)) - 0.5;
  float edge = 1.0 + e1 * (0.2 + wet * 0.25) + e2 * (0.12 + dry * 0.3) + e3 * 0.08;
  float aa = 1.1 / (hw * uPx);
  float soft = aa + wet * 0.5;
  float body = 1.0 - smoothstep(edge - soft, edge + aa * 0.5, av);

  // Sợi lông bút: vệt song song theo hướng nét; khô dần về cuối nét và từ mép vào.
  float bn = clamp(hw * 0.32, 3.0, 16.0);
  float b = 0.62 * vn(vec2(v * bn + seed * 5.3, s * 0.01 / max(hw * 0.05, 0.2) + seed))
          + 0.38 * vn(vec2(v * bn * 2.9 + seed, s * 0.035));
  float d = dry * (0.12 + 0.95 * smoothstep(0.1, 1.0, u)) + dry * 0.4 * av * av;
  float streak = dry > 0.001 ? smoothstep(d - 0.1, d + 0.1, b) : 1.0;

  // Mực: đẫm ở đầu nét, nhạt dần; loang không đều; giấy hút mực theo thớ.
  float dens = mix(1.0, 0.8, smoothstep(0.0, 1.0, u));
  dens *= 0.84 + 0.16 * fbm(vW * 0.012 + seed);
  float fib = vn(vW * vec2(0.22, 0.06) + seed) * 0.6 + vn(vW * vec2(0.05, 0.6)) * 0.4;
  float paper = 0.9 + 0.1 * fib;
  float mist = 1.0 - fade * smoothstep(-0.55, 1.0, v);

  float a = body * streak * dens * paper;
  // Mảng mực nước: lòng nhạt, viền khô đậm hơn (hiệu ứng "nở" của mực trên giấy dó).
  float rim = smoothstep(edge - 0.45, edge - 0.04, av);
  a = mix(a, body * paper * (0.42 + 0.3 * fbm(vW * 0.02 + seed * 3.0) + 0.38 * rim), wet);
  a *= vB.a * mist * show * (1.0 + 0.7 * ring);
  gl_FragColor = vec4(vB.rgb, clamp(a, 0.0, 1.0));
}`

export function inkMaterial(uniforms: ReturnType<typeof inkUniforms>) {
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: vert,
    fragmentShader: frag,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
}
