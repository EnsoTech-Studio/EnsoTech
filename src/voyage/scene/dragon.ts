// Rồng mực (kiểu Cửu Long Đồ) dựng hoàn toàn bằng code, theo "cửu tượng": sừng hươu, đầu lạc đà, mắt quỷ, cổ rắn, bụng sò,
// vảy chép, vuốt đại bàng, bàn chân hổ. Thân rắn thon dài gần 30 lần bề ngang. Đầu và hàm dưới là khối điêu khắc (hàm khoảng
// cách → lưới bằng surface nets, có che sáng tính sẵn), thân là ống dài DL. Mỗi khung hình JS tính một đường xương sống (ghi
// vào texture), shader uốn mọi đỉnh theo nó. Tô như tranh thuỷ mặc: giấy, mực loang, nét bút lông ở viền, vảy là nét cung,
// điểm son ở mắt và lửa; chương đêm đổi thành sơn mài: nền sơn đen, nét vàng.
// Toạ độ nghỉ: đầu hướng +x, lưng +y; điểm s của xương sống nằm ở x = −s.

import * as THREE from 'three'
import { NOISE, SCALES, curve, lightUniforms } from './kit'

export const DL = 15
const NSP = 128
/** Điểm xương sống giữ cứng cả khối đầu. */
const SA0 = 0.15
const V3 = THREE.Vector3

const BODY = 0
const HEAD = 1
const JAW = 2
const EYE = 3
const TOOTH = 4
const CLAW = 5
const ANTLER = 6
const WHISKER = 7
const LEG = 8
const TONGUE = 9
const MANE = 10
const CREST = 11
/** Lửa son: đuôi, khuỷu, má. */
const FLAME = 12

// ---------------------------------------------------------------- bộ đệm lưới
/** [s xương sống để bám, theo hàm dưới, chân số mấy, độ phấp phới]. */
type Rig = [number, number, number, number]
type RigFn = (p: THREE.Vector3, s: number) => Rig
interface Buf {
  P: number[]
  N: number[]
  T: number[]
  S: number[]
  R: number[]
  I: number[]
}
const buf = (): Buf => ({ P: [], N: [], T: [], S: [], R: [], I: [] })

function vert(b: Buf, p: THREE.Vector3, n: THREE.Vector3, t: THREE.Vector3, s: number[], r: Rig) {
  b.P.push(p.x, p.y, p.z)
  b.N.push(n.x, n.y, n.z)
  b.T.push(t.x, t.y, t.z)
  b.S.push(s[0], s[1], s[2], s[3])
  b.R.push(r[0], r[1], r[2], r[3])
}

/** Tam giác cho lưới (ni+1)×(nj+1) bắt đầu ở đỉnh base; tự chọn chiều để mặt trước quay theo pháp tuyến đỉnh. */
function grid(b: Buf, base: number, ni: number, nj: number) {
  const at = (i: number, j: number) => base + i * (nj + 1) + j
  const pt = (k: number) => new V3().fromArray(b.P, k * 3)
  const i0 = ni >> 1
  const j0 = nj >> 1
  const a0 = at(i0, j0)
  const g = new V3().crossVectors(pt(at(i0 + 1, j0)).sub(pt(a0)), pt(at(i0, j0 + 1)).sub(pt(a0)))
  const flip = g.dot(new V3().fromArray(b.N, a0 * 3)) < 0
  for (let i = 0; i < ni; i++) {
    for (let j = 0; j < nj; j++) {
      const a = at(i, j)
      const c = at(i + 1, j)
      if (flip) b.I.push(a, a + 1, c, a + 1, c + 1, c)
      else b.I.push(a, c, a + 1, a + 1, c, c + 1)
    }
  }
}

function toGeo(b: Buf) {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(b.P, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(b.N, 3))
  g.setAttribute('aTan', new THREE.Float32BufferAttribute(b.T, 3))
  g.setAttribute('aSkin', new THREE.Float32BufferAttribute(b.S, 4))
  g.setAttribute('aRig', new THREE.Float32BufferAttribute(b.R, 4))
  g.setIndex(b.I)
  return g
}

interface TubeOpt {
  ns?: number
  nr?: number
  /** Ép dẹt theo hướng pháp tuyến đầu (lưỡi). */
  flat?: number
  up?: THREE.Vector3
  seed?: number
  /** Toạ độ dọc ống ghi vào aSkin.x (mặc định 0..1). */
  a?: (s: number) => number
}

/** Ống thon dọc đường cong, khung xoay tối thiểu (không xoắn). aSkin = (dọc, quanh 0..1, bộ phận, seed). */
function tube(b: Buf, pts: THREE.Vector3[], rad: (s: number) => number, part: number, rig: RigFn, o: TubeOpt = {}) {
  const c = new THREE.CatmullRomCurve3(pts, false, 'centripetal')
  const ns = o.ns ?? 24
  const nr = o.nr ?? 12
  const fl = o.flat ?? 1
  const base = b.P.length / 3
  const p = new V3()
  const t = new V3()
  const bn = new V3()
  const q = new V3()
  const n = new V3()
  const nm = (o.up ?? new V3(0, 1, 0)).clone()
  c.getTangentAt(0, t)
  if (Math.abs(nm.dot(t)) > 0.95) nm.set(0, 0, 1)
  for (let i = 0; i <= ns; i++) {
    const s = i / ns
    c.getPointAt(s, p)
    c.getTangentAt(s, t)
    nm.addScaledVector(t, -nm.dot(t)).normalize()
    bn.crossVectors(t, nm)
    const r = rad(s)
    for (let j = 0; j <= nr; j++) {
      const ph = (j / nr) * Math.PI * 2
      q.copy(p)
        .addScaledVector(nm, Math.cos(ph) * r * fl)
        .addScaledVector(bn, Math.sin(ph) * r)
      n.copy(nm)
        .multiplyScalar(Math.cos(ph) / fl)
        .addScaledVector(bn, Math.sin(ph))
        .normalize()
      vert(b, q, n, t, [o.a ? o.a(s) : s, j / nr, part, o.seed ?? 0], rig(q, s))
    }
  }
  grid(b, base, ns, nr)
}

/** Dải lửa/bờm: bản rộng wid(s) nằm vuông góc với hint, hơi khum. aSkin = (dọc 0..1, ngang −1..1, bộ phận, seed). */
function ribbon(b: Buf, pts: THREE.Vector3[], wid: (s: number) => number, hint: THREE.Vector3, part: number, rig: RigFn, seed: number, ns = 24) {
  const c = new THREE.CatmullRomCurve3(pts, false, 'centripetal')
  const NW = 4
  const base = b.P.length / 3
  const p = new V3()
  const t = new V3()
  const wd = new V3()
  const n = new V3()
  const q = new V3()
  for (let i = 0; i <= ns; i++) {
    const s = i / ns
    c.getPointAt(s, p)
    c.getTangentAt(s, t)
    wd.crossVectors(hint, t).normalize()
    n.crossVectors(t, wd).normalize()
    const w = wid(s)
    for (let j = 0; j <= NW; j++) {
      const a = (j / NW) * 2 - 1
      q.copy(p)
        .addScaledVector(wd, a * w)
        .addScaledVector(n, 0.25 * a * a * w)
      vert(b, q, n, t, [s, a, part, seed], rig(q, s))
    }
  }
  grid(b, base, ns, NW)
}

function sphere(b: Buf, c: THREE.Vector3, r: number, part: number, side: number, rig: Rig) {
  const NI = 20
  const NJ = 28
  const base = b.P.length / 3
  const n = new V3()
  const t = new V3()
  for (let i = 0; i <= NI; i++) {
    const th = (i / NI) * Math.PI
    for (let j = 0; j <= NJ; j++) {
      const ph = (j / NJ) * Math.PI * 2
      n.set(Math.cos(th), Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph))
      t.set(-Math.sin(th), Math.cos(th) * Math.cos(ph), Math.cos(th) * Math.sin(ph))
      vert(b, c.clone().addScaledVector(n, r), n, t, [0, 0, part, side], rig)
    }
  }
  grid(b, base, NI, NJ)
}

// ---------------------------------------------------------------- hàm khoảng cách (điêu khắc đầu)
type Sdf = (x: number, y: number, z: number) => number

function sdE(x: number, y: number, z: number, cx: number, cy: number, cz: number, rx: number, ry: number, rz: number) {
  const a = (x - cx) / rx
  const b = (y - cy) / ry
  const c = (z - cz) / rz
  const k0 = Math.hypot(a, b, c)
  const k1 = Math.hypot(a / rx, b / ry, c / rz)
  return k1 < 1e-9 ? -Math.min(rx, ry, rz) : (k0 * (k0 - 1)) / k1
}
/** Nón đầu tròn từ a (bán kính r1) tới b (r2) — iquilezles.org. */
function sdCone(x: number, y: number, z: number, ax: number, ay: number, az: number, bx: number, by: number, bz: number, r1: number, r2: number) {
  const [dx, dy, dz] = [bx - ax, by - ay, bz - az]
  const [px, py, pz] = [x - ax, y - ay, z - az]
  const l2 = dx * dx + dy * dy + dz * dz
  const rr = r1 - r2
  const a2 = l2 - rr * rr
  const il2 = 1 / l2
  const yy = px * dx + py * dy + pz * dz
  const zz = yy - l2
  const qx = px * l2 - dx * yy
  const qy = py * l2 - dy * yy
  const qz = pz * l2 - dz * yy
  const x2 = qx * qx + qy * qy + qz * qz
  const y2 = yy * yy * l2
  const z2 = zz * zz * l2
  const k = Math.sign(rr) * rr * rr * x2
  if (Math.sign(zz) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - r2
  if (Math.sign(yy) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - r1
  return (Math.sqrt(x2 * a2 * il2) + yy * rr) * il2 - r1
}
const smin = (a: number, b: number, k: number) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k
  return Math.min(a, b) - h * h * k * 0.25
}
const smax = (a: number, b: number, k: number) => -smin(-a, -b, k)

// Hàm dưới há sẵn JAW0 quanh bản lề HINGE; shader cộng thêm nhịp thở uJaw.
const HINGE = new V3(0.5, -0.1, 0)
const JAW0 = 0.42
const EC = new V3(1.0, 0.2, 0.32)
const ER = 0.105

const palate: Sdf = (x, y, z) => sdE(x, y, z, 1.25, -0.32, 0, 0.72, 0.22, 0.2)
const tongueBed: Sdf = (x, y, z) => sdE(x, y, z, 1.0, -0.12, 0, 0.55, 0.09, 0.13)

/** Elip nghiêng góc a quanh trục z (mày, cánh mũi). */
const sdEr = (x: number, y: number, z: number, cx: number, cy: number, cz: number, rx: number, ry: number, rz: number, a: number) => {
  const dx = x - cx
  const dy = y - cy
  const c = Math.cos(a)
  const s = Math.sin(a)
  return sdE(dx * c + dy * s, -dx * s + dy * c, z, 0, 0, cz, rx, ry, rz)
}

/** Sọ + hàm trên: trán gồ, mày rậm che mắt, gò má bạnh, mõm dài, sống mũi u nần, mũi sư tử hếch, vòm miệng khoét. */
const skull: Sdf = (x, y, z) => {
  const az = Math.abs(z)
  let d = sdE(x, y, z, 0.42, 0.12, 0, 0.55, 0.4, 0.4)
  d = smin(d, sdCone(x, y, z, 0.3, 0, 0, -0.45, -0.02, 0, 0.3, 0.24), 0.2)
  d = smin(d, sdE(x, y, az, 0.55, -0.08, 0.22, 0.4, 0.3, 0.24), 0.15)
  d = smin(d, sdCone(x, y * 1.3, z, 0.8, 0.05, 0, 1.6, 0.02, 0, 0.3, 0.19) / 1.3, 0.2)
  d = smin(d, sdE(x, y, z, 1.2, 0.2, 0, 0.12, 0.07, 0.1), 0.07)
  d = smin(d, sdE(x, y, z, 1.42, 0.19, 0, 0.1, 0.065, 0.09), 0.06)
  d = smin(d, sdE(x, y, z, 0.8, 0.36, 0, 0.32, 0.13, 0.2), 0.12)
  // Mũi: khối tròn hếch lên, hai cánh mũi cuộn như vân như ý, lỗ mũi loe nhìn ra trước.
  d = smin(d, sdE(x, y, z, 1.68, 0.16, 0, 0.18, 0.15, 0.2), 0.1)
  d = smin(d, sdEr(x, y, az, 1.67, 0.23, 0.15, 0.15, 0.08, 0.1, -0.5), 0.06)
  d = smax(d, -sdE(x, y, az, 1.86, 0.2, 0.1, 0.045, 0.045, 0.04), 0.025)
  // Mày: gờ dày nghiêng, đuôi vểnh về sau, chìa ra che nửa trên con mắt.
  d = smin(d, sdEr(x, y, az, 0.97, 0.37, 0.24, 0.36, 0.09, 0.14, -0.38), 0.07)
  d = smax(d, -sdE(x, y, az, EC.x, EC.y, EC.z - 0.01, 0.13, 0.12, 0.12), 0.05)
  d = smin(d, sdE(x, y, az, 1.25, -0.07, 0.19, 0.5, 0.07, 0.08), 0.06)
  return smax(d, -palate(x, y, z), 0.06)
}

const rotJ = (x: number, y: number, a: number): [number, number] => {
  const c = Math.cos(a)
  const s = Math.sin(a)
  const dx = x - HINGE.x
  const dy = y - HINGE.y
  return [HINGE.x + dx * c - dy * s, HINGE.y + dx * s + dy * c]
}
const openJ = (p: THREE.Vector3) => {
  const [x, y] = rotJ(p.x, p.y, -JAW0)
  return p.set(x, y, p.z)
}

/** Hàm dưới (tư thế ngậm): dẹt, thon dần về cằm, viền môi gờ lên, góc hàm bạnh, lòng hàm khoét chỗ lưỡi. */
const jawClosed: Sdf = (x, y, z) => {
  const az = Math.abs(z)
  let d = sdCone(x, y * 1.6, z, 0.5, -0.24 * 1.6, 0, 1.4, -0.27 * 1.6, 0, 0.25, 0.11) / 1.6
  d = smin(d, sdE(x, y, z, 1.36, -0.28, 0, 0.09, 0.07, 0.09), 0.08)
  d = smin(d, sdE(x, y, az, 1.05, -0.17, 0.14, 0.38, 0.04, 0.06), 0.05)
  d = smin(d, sdE(x, y, az, 0.62, -0.22, 0.2, 0.26, 0.15, 0.12), 0.1)
  return smax(d, -tongueBed(x, y, z), 0.05)
}
const jawOpen: Sdf = (x, y, z) => {
  const [cx, cy] = rotJ(x, y, JAW0)
  return jawClosed(cx, cy, z)
}
const eyes: Sdf = (x, y, z) => Math.hypot(x - EC.x, y - EC.y, Math.abs(z) - EC.z) - ER
const headAll: Sdf = (x, y, z) => Math.min(skull(x, y, z), jawOpen(x, y, z), eyes(x, y, z))

const EDGES = [
  [0, 1], [2, 3], [4, 5], [6, 7],
  [0, 2], [1, 3], [4, 6], [5, 7],
  [0, 4], [1, 5], [2, 6], [3, 7],
]

/**
 * Surface nets: lấy mẫu f trên lưới bước h, mỗi ô cắt mặt sinh một đỉnh (trung bình các điểm cắt cạnh), mỗi cạnh cắt mặt
 * sinh một tứ giác. Pháp tuyến từ gradient; che sáng (AO) dò theo pháp tuyến trên cả khối đầu; mouth đánh dấu lòng miệng.
 */
function nets(b: Buf, f: Sdf, lo: THREE.Vector3, hi: THREE.Vector3, h: number, part: number, rig: Rig, mouth: Sdf) {
  const nx = Math.ceil((hi.x - lo.x) / h) + 1
  const ny = Math.ceil((hi.y - lo.y) / h) + 1
  const nz = Math.ceil((hi.z - lo.z) / h) + 1
  const F = new Float32Array(nx * ny * nz)
  const id = (i: number, j: number, k: number) => i + nx * (j + ny * k)
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) F[id(i, j, k)] = f(lo.x + i * h, lo.y + j * h, lo.z + k * h)
  const cx = nx - 1
  const cy = ny - 1
  const cell = new Int32Array(cx * cy * (nz - 1)).fill(-1)
  const cid = (i: number, j: number, k: number) => i + cx * (j + cy * k)
  const base = b.P.length / 3
  let count = 0
  const v = new Float32Array(8)
  const p = new V3()
  const n = new V3()
  const t = new V3()
  const e = h * 0.5
  for (let k = 0; k < nz - 1; k++) {
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        let m = 0
        for (let c = 0; c < 8; c++) {
          v[c] = F[id(i + (c & 1), j + ((c >> 1) & 1), k + (c >> 2))]
          if (v[c] < 0) m |= 1 << c
        }
        if (m === 0 || m === 255) continue
        let sx = 0
        let sy = 0
        let sz = 0
        let ne = 0
        for (const [a, c] of EDGES) {
          if (((m >> a) & 1) === ((m >> c) & 1)) continue
          const tt = v[a] / (v[a] - v[c])
          sx += (a & 1) + ((c & 1) - (a & 1)) * tt
          sy += ((a >> 1) & 1) + (((c >> 1) & 1) - ((a >> 1) & 1)) * tt
          sz += (a >> 2) + ((c >> 2) - (a >> 2)) * tt
          ne++
        }
        p.set(lo.x + (i + sx / ne) * h, lo.y + (j + sy / ne) * h, lo.z + (k + sz / ne) * h)
        n.set(f(p.x + e, p.y, p.z) - f(p.x - e, p.y, p.z), f(p.x, p.y + e, p.z) - f(p.x, p.y - e, p.z), f(p.x, p.y, p.z + e) - f(p.x, p.y, p.z - e)).normalize()
        // Tiếp tuyến hướng về đuôi (−x) như thân, để vảy trên gáy/má khớp chiều với vảy thân.
        t.set(-1, 0, 0).addScaledVector(n, n.x)
        if (t.lengthSq() < 1e-4) t.set(0, 0, 1)
        t.normalize()
        let occ = 0
        for (let q = 1; q <= 5; q++) {
          const dd = q * 0.04
          occ += Math.max(dd - headAll(p.x + n.x * dd, p.y + n.y * dd, p.z + n.z * dd), 0) / 2 ** q
        }
        const ao = Math.min(Math.max(1 - 3.2 * occ, 0), 1)
        const mo = 1 - THREE.MathUtils.smoothstep(Math.abs(mouth(p.x, p.y, p.z)), 0.01, 0.035)
        vert(b, p, n, t, [ao, mo, part, 0], rig)
        cell[cid(i, j, k)] = base + count++
      }
    }
  }
  const pa = new V3()
  const pb = new V3()
  const pc = new V3()
  const quad = (q: number[], axis: number, inside: boolean) => {
    if (q.some((x) => x < 0)) return
    pa.fromArray(b.P, q[0] * 3)
    pb.fromArray(b.P, q[1] * 3).sub(pa)
    pc.fromArray(b.P, q[2] * 3).sub(pa)
    const g = pb.cross(pc).getComponent(axis)
    if (g > 0 === inside) b.I.push(q[0], q[1], q[2], q[0], q[2], q[3])
    else b.I.push(q[0], q[2], q[1], q[0], q[3], q[2])
  }
  for (let k = 0; k < nz; k++) {
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const s0 = F[id(i, j, k)] < 0
        if (i < nx - 1 && j > 0 && k > 0 && j < ny - 1 && k < nz - 1 && s0 !== F[id(i + 1, j, k)] < 0)
          quad([cell[cid(i, j - 1, k - 1)], cell[cid(i, j, k - 1)], cell[cid(i, j, k)], cell[cid(i, j - 1, k)]], 0, s0)
        if (j < ny - 1 && i > 0 && k > 0 && i < nx - 1 && k < nz - 1 && s0 !== F[id(i, j + 1, k)] < 0)
          quad([cell[cid(i - 1, j, k - 1)], cell[cid(i - 1, j, k)], cell[cid(i, j, k)], cell[cid(i, j, k - 1)]], 1, s0)
        if (k < nz - 1 && i > 0 && j > 0 && i < nx - 1 && j < ny - 1 && s0 !== F[id(i, j, k + 1)] < 0)
          quad([cell[cid(i - 1, j - 1, k)], cell[cid(i, j - 1, k)], cell[cid(i, j, k)], cell[cid(i - 1, j, k)]], 2, s0)
      }
    }
  }
}

// ---------------------------------------------------------------- thân
// Thân rắn: cổ thắt, ngực hơi đầy, thon đều về đuôi; dài gần 25 lần bề ngang.
const S_TAB = [-0.3, 0.3, 1, 1.8, 3, 4.5, 6.5, 8.5, 10.5, 12, 13.2, 14.2, 15]
const rad = curve(S_TAB, [0.25, 0.26, 0.27, 0.3, 0.31, 0.31, 0.3, 0.28, 0.24, 0.19, 0.13, 0.07, 0.02])
/** Số hàng vảy quanh thân (vảy to, đọc được như nét cung). Toạ độ vảy dọc thân a(s) = ∫ NR / chu vi: vảy vuông, nhỏ dần về đuôi. */
const NR = 12
const S0 = -0.3
const A_TAB = (() => {
  const out = [0]
  for (let i = 1; i <= 600; i++) {
    const s = S0 + (i / 600) * (DL - S0)
    out.push(out[i - 1] + ((DL - S0) / 600) * (NR / (2 * Math.PI * Math.max(rad(s), 0.12))))
  }
  return out
})()
const aOf = (s: number) => {
  const x = ((s - S0) / (DL - S0)) * 600
  const i = Math.min(599, Math.max(0, Math.floor(x)))
  return THREE.MathUtils.lerp(A_TAB[i], A_TAB[i + 1], x - i)
}

const follow: RigFn = (q) => [Math.max(-q.x, SA0), 0, 0, 0]
const headRig: Rig = [SA0, 0, 0, 0]
const sm = THREE.MathUtils.smootherstep
const V = (x: number, y: number, z: number) => new V3(x, y, z)

function bodyParts(b: Buf, fl: Buf) {
  tube(b, [V(-S0, 0, 0), V(-DL, 0, 0)], (u) => rad(S0 + u * (DL - S0)), BODY, follow, { ns: 520, nr: 32, a: (u) => aOf(S0 + u * (DL - S0)) })

  // Vây lưng: nét mực răng cưa dọc sống, cắt trong shader. aSkin = (s, độ cao 0..1).
  const NS = 420
  const base = fl.P.length / 3
  const n = V(0, 0, 1)
  const t = V(-1, 0, 0)
  for (let i = 0; i <= NS; i++) {
    const s = THREE.MathUtils.lerp(0.5, DL - 0.4, i / NS)
    const H = (0.08 + 0.14 * sm(s, 0.5, 1.8) * (1 - sm(s, 4, DL - 0.8))) * (1 - sm(s, DL - 1, DL - 0.4) * 0.6)
    for (let j = 0; j <= 3; j++) {
      const h = j / 3
      const p = V(-s - 0.14 * h, rad(s) * 0.9 + h * H, 0)
      vert(fl, p, n, t, [s, h, CREST, 0], follow(p, h))
    }
  }
  grid(fl, base, NS, 3)

  // Chùm lửa đuôi: năm nét xoè trong mặt phẳng đứng, đi tiếp hướng đuôi, ngọn son.
  for (let k = 0; k < 5; k++) {
    const be = THREE.MathUtils.degToRad(-38 + k * 19)
    const r0 = V(-(DL - 0.75) - 0.08 * Math.abs(k - 2), 0, 0)
    const d = V(-Math.cos(be), Math.sin(be), 0)
    const L = 1.25 - 0.18 * Math.abs(k - 2)
    const wig = V(0, 0.12 * Math.sin(k * 2.1), 0)
    ribbon(fl, [r0, r0.clone().addScaledVector(d, L * 0.35).add(wig), r0.clone().addScaledVector(d, L * 0.7).sub(wig), r0.clone().addScaledVector(d, L)], (s) => 0.15 * (1 - s) ** 0.8 * sm(s, 0, 0.12) + 0.01, V(0, 0, 1), FLAME, (q, s) => [Math.max(-q.x, SA0), 0, 0, 0.12 * s ** 1.5], k * 1.7)
  }
}

// ---------------------------------------------------------------- đầu
function headParts(b: Buf, fl: Buf) {
  nets(b, skull, V(-0.45, -0.45, -0.62), V(2.0, 0.7, 0.62), 0.022, HEAD, headRig, palate)
  const jawRig: Rig = [SA0, 1, 0, 0]
  nets(b, jawOpen, V(0.15, -0.95, -0.45), V(1.75, 0.05, 0.45), 0.022, JAW, jawRig, (x, y, z) => {
    const [cx, cy] = rotJ(x, y, JAW0)
    return tongueBed(cx, cy, z)
  })
  const rigid: RigFn = () => headRig
  const jawed: RigFn = () => jawRig
  for (const side of [1, -1]) {
    const S = (x: number, y: number, z: number) => V(x, y, z * side)
    const J = (x: number, y: number, z: number) => openJ(V(x, y, z * side))
    sphere(b, S(EC.x, EC.y, EC.z), ER, EYE, side, headRig)

    // Răng hàm trên, nanh dài phía trước; răng hàm dưới, nanh dưới chĩa lên.
    for (let k = 0; k < 6; k++) {
      const x = 0.95 + k * 0.1
      const z = 0.19 - 0.03 * (k / 5)
      tube(b, [S(x, -0.09, z), S(x - 0.01, -0.13, z), S(x - 0.02, -0.17 - 0.01 * k, z)], (s) => 0.026 * (1 - s), TOOTH, rigid, { ns: 6, nr: 8 })
      const xj = 0.88 + k * 0.08
      tube(b, [J(xj, -0.15, z - 0.04), J(xj + 0.01, -0.1, z - 0.04), J(xj + 0.02, -0.06, z - 0.04)], (s) => 0.024 * (1 - s), TOOTH, jawed, { ns: 6, nr: 8 })
    }
    tube(b, [S(1.56, -0.05, 0.15), S(1.57, -0.18, 0.155), S(1.52, -0.33, 0.15)], (s) => 0.046 * (1 - s) ** 0.9, TOOTH, rigid, { ns: 10, nr: 10 })
    tube(b, [J(1.32, -0.2, 0.1), J(1.34, -0.06, 0.105), J(1.3, 0.04, 0.1)], (s) => 0.04 * (1 - s) ** 0.9, TOOTH, jawed, { ns: 10, nr: 10 })

    // Sừng hươu: gốc to sần sau mắt, vươn ra sau rồi vểnh lên, hai nhánh chĩa trời.
    const ar = (r0: number, r1: number) => (s: number) => THREE.MathUtils.lerp(r0, r1, s) * (1 - sm(s, 0.88, 1) * 0.65)
    tube(b, [S(0.3, 0.42, 0.17), S(0.18, 0.68, 0.22), S(-0.05, 0.88, 0.28), S(-0.4, 1.0, 0.34), S(-0.8, 0.98, 0.38)], ar(0.085, 0.035), ANTLER, rigid, { ns: 36, nr: 14 })
    tube(b, [S(0.1, 0.78, 0.25), S(0.2, 0.96, 0.27), S(0.2, 1.08, 0.27)], ar(0.045, 0.014), ANTLER, rigid, { ns: 14, nr: 10 })
    tube(b, [S(-0.3, 0.98, 0.33), S(-0.25, 1.14, 0.35), S(-0.28, 1.25, 0.35)], ar(0.04, 0.012), ANTLER, rigid, { ns: 14, nr: 10 })

    // Râu rồng: mọc cạnh cánh mũi, xoè ngang tầm má (dưới mắt), qua mắt thì vút lên khỏi gáy, bay về sau như dải lụa trên lưng.
    tube(
      b,
      [S(1.7, 0.08, 0.18), S(1.75, 0.04, 0.42), S(1.55, 0, 0.65), S(1.15, 0.02, 0.82), S(0.7, 0.22, 0.92), S(0.2, 0.62, 0.98), S(-0.35, 1.02, 1.0), S(-0.95, 1.18, 0.95), S(-1.5, 0.95, 0.9), S(-2.0, 1.08, 0.85), S(-2.45, 1.38, 0.8), S(-2.75, 1.32, 0.78)],
      (s) => 0.026 * (1 - s) ** 1.2 + 0.003,
      WHISKER,
      (_, s) => [SA0, 0, 0, 0.3 * s ** 1.5],
      { ns: 90, nr: 8, seed: side },
    )

    // Mày lửa vểnh ngược.
    ribbon(fl, [S(0.82, 0.44, 0.27), S(0.6, 0.6, 0.31), S(0.36, 0.72, 0.33), S(0.12, 0.74, 0.34)], (s) => 0.1 * (1 - s) ** 0.7 + 0.005, V(0, 0, side), FLAME, (_, s) => [SA0, 0, 0, 0.04 * s], 3 + side)

    // Lửa má: ba ngọn mọc sau góc hàm, quét ngược về sau.
    for (let k = 0; k < 3; k++) {
      const r0 = V(0.5 - 0.06 * k, -0.08 + 0.1 * k, 0.33 * side)
      const L = 0.85 - 0.12 * k
      ribbon(fl, [r0, r0.clone().add(V(-0.3 * L, -0.05, 0.12 * side)), r0.clone().add(V(-0.65 * L, 0.05, 0.18 * side)), r0.clone().add(V(-L, 0.12 - 0.05 * k, 0.16 * side))], (s) => 0.11 * (1 - s) ** 0.8 + 0.004, V(0, 0.4, side), FLAME, (_, s) => [SA0, 0, 0, 0.06 * s], 20 + k + side)
    }

    // Bờm: nhiều ngọn lửa mảnh mọc quanh gáy và sau gò má, chải về sau dọc cổ, ngọn cuộn.
    for (let k = 0; k < 12; k++) {
      const ph = THREE.MathUtils.degToRad(6 + k * 10.5)
      const o = V(0, Math.cos(ph), Math.sin(ph) * side)
      const r0 = V(0.28 - 0.1 * (k % 3), 0.06, 0).addScaledVector(o, 0.4)
      const L = 1.35 + 0.35 * Math.sin(k * 2.7) - 0.03 * k
      const wy = 0.12 * Math.sin(k * 1.9)
      const curl = 0.18 * Math.sin(k * 1.3 + 0.5)
      ribbon(
        fl,
        [r0, r0.clone().add(V(-0.3 * L, wy, 0)).addScaledVector(o, 0.12), r0.clone().add(V(-0.62 * L, -wy, 0)).addScaledVector(o, 0.2), r0.clone().add(V(-0.88 * L, wy, 0)).addScaledVector(o, 0.18 + curl), r0.clone().add(V(-L + 0.1, wy + curl, 0)).addScaledVector(o, 0.1 + curl)],
        (s) => 0.13 * (1 - s) ** 0.8 * (0.5 + 0.5 * sm(s, 0, 0.2)) + 0.004,
        o,
        MANE,
        (q, s) => [Math.max(-q.x, SA0), 0, 0, 0.1 * s ** 1.5],
        k * 1.3 + side,
        30,
      )
    }

    // Râu cằm: ba ngọn rủ xuống sau, theo hàm dưới.
    for (let k = 0; k < 3; k++) {
      const r0 = J(1.25 - k * 0.25, -0.33 + 0.02 * k, 0.04 + k * 0.06)
      const L = 0.75 - k * 0.12
      const d = openJ(V(-0.55, -0.75, 0)).sub(openJ(V(0, 0, 0))).normalize()
      ribbon(fl, [r0, r0.clone().addScaledVector(d, L * 0.4).add(V(0.06, 0, 0)), r0.clone().addScaledVector(d, L * 0.75).add(V(-0.04, 0, 0)), r0.clone().addScaledVector(d, L)], (s) => 0.09 * (1 - s) ** 0.8 + 0.004, V(0, 0, side), MANE, (_, s) => [SA0, 1, 0, 0.06 * s], 7 + k + side)
    }
  }
  // Lưỡi thè, cong vểnh ở ngọn.
  tube(b, [openJ(V(0.75, -0.16, 0)), openJ(V(1.1, -0.15, 0)), openJ(V(1.4, -0.15, 0)), openJ(V(1.62, -0.1, 0)), openJ(V(1.74, 0, 0)), openJ(V(1.7, 0.09, 0))], (s) => 0.095 * (1 - s * 0.5), TONGUE, () => [SA0, 1, 0, 0], { ns: 30, nr: 14, flat: 0.35 })
}

// ---------------------------------------------------------------- chân
/** Gốc chân trước, chân sau (s xương sống). */
const LEG_S = [2.2, 8.6]
/** Chân nhỏ so với thân rắn (như tranh): mọi kích thước chân nhân LS. */
const LS = 0.72

function legParts(b: Buf, fl: Buf) {
  for (const [li, sa] of LEG_S.entries()) {
    const front = li === 0
    for (const side of [1, -1]) {
      const L = (x: number, y: number, z: number) => V(LS * x - sa, LS * y, LS * z * side)
      const rig: Rig = [sa, 0, li + 1, 0]
      const fix: RigFn = () => rig
      const sh = L(0, -0.18, 0.3)
      const el = front ? L(-0.3, -0.62, 0.5) : L(0.34, -0.6, 0.5)
      const wr = front ? L(0.26, -0.92, 0.58) : L(-0.14, -0.92, 0.58)
      const pa = front ? L(0.4, -0.98, 0.6) : L(0.02, -1.04, 0.6)
      const rr = curve([0, 0.38, 0.8, 1], [0.3, 0.19, 0.12, 0.11])
      tube(b, [sh.clone().add(V(0, 0.15 * LS, -0.12 * LS * side)), sh, el, wr, pa], (s) => LS * (rr(s) + 0.03 * Math.sin(Math.PI * Math.min(s / 0.38, 1))), LEG, fix, { ns: 40, nr: 16, a: (s) => s * 6 })

      // Bàn chân hổ, bốn ngón trước một ngón sau, vuốt đại bàng quặp xuống.
      const fd = pa.clone().sub(wr).setY(0).normalize()
      const dn = V(0, -1, 0)
      for (let k = 0; k < 5; k++) {
        const back = k === 4
        const al = back ? Math.PI - 0.5 * side : THREE.MathUtils.degToRad(-42 + k * 28) * side
        const d = fd.clone().applyAxisAngle(dn, al)
        const len = LS * (back ? 0.19 : 0.33 - 0.035 * Math.abs(k - 1.5))
        const t0 = pa.clone().addScaledVector(d, 0.04 * LS)
        const t1 = pa.clone().addScaledVector(d, len * 0.45).addScaledVector(dn, -0.06 * LS)
        const t2 = pa.clone().addScaledVector(d, len).addScaledVector(dn, 0.02 * LS)
        tube(b, [t0, t1, t2], (s) => LS * (0.064 - 0.02 * s), LEG, fix, { ns: 10, nr: 10, a: (s) => 6 + s * 1.5 })
        tube(b, [t2.clone().addScaledVector(d, -0.01 * LS), t2.clone().addScaledVector(d, 0.07 * LS).addScaledVector(dn, 0.06 * LS), t2.clone().addScaledVector(d, 0.06 * LS).addScaledVector(dn, 0.18 * LS)], (s) => LS * 0.046 * (1 - s) ** 0.8, CLAW, fix, { ns: 10, nr: 10 })
      }

      // Lửa khuỷu: ba ngọn chải về sau, ngọn son.
      for (let k = 0; k < 3; k++) {
        const r0 = el.clone().add(V(0, (0.05 - k * 0.06) * LS, 0.02 * LS * side))
        const L2 = (0.6 - k * 0.1) * LS
        ribbon(fl, [r0, r0.clone().add(V(-0.3 * L2, -0.05 * LS, 0.05 * LS * side)), r0.clone().add(V(-0.65 * L2, 0.04 * LS, 0.08 * LS * side)), r0.clone().add(V(-L2, (-0.06 - k * 0.04) * LS, 0.1 * LS * side))], (s) => LS * (0.09 * (1 - s) ** 0.8 + 0.004), V(0, 0, side), FLAME, (_, s) => [sa, 0, li + 1, 0.08 * s ** 1.5], 11 + k + li + side)
      }
    }
  }
}

// ---------------------------------------------------------------- shader
const f = (x: number) => x.toFixed(4)
const RIG = /* glsl */ `
uniform sampler2D uSpine;
uniform float uTime, uJaw, uGait, uFlow;
const float DL = ${DL.toFixed(2)}, NSP = ${NSP}.;
const vec3 HINGE = vec3(${f(HINGE.x)}, ${f(HINGE.y)}, 0.);
const vec2 LEG_S = vec2(${LEG_S[0].toFixed(2)}, ${LEG_S[1].toFixed(2)});
mat3 rotZ(float a) { float c = cos(a), s = sin(a); return mat3(c, s, 0., -s, c, 0., 0., 0., 1.); }
vec3 spineRow(int i, int row) { return texelFetch(uSpine, ivec2(i, row), 0).xyz; }
// Khung xương sống ở s: tâm C, ma trận đưa trục nghỉ (+x mũi, +y lưng, +z sườn) vào thế giới.
void frameAt(float s, out vec3 C, out mat3 M) {
  float x = clamp(s / DL, 0., 1.) * (NSP - 1.);
  float fi = min(floor(x), NSP - 2.);
  float fr = x - fi;
  int i = int(fi);
  C = mix(spineRow(i, 0), spineRow(i + 1, 0), fr);
  vec3 T = normalize(mix(spineRow(i, 2), spineRow(i + 1, 2), fr));
  vec3 U = mix(spineRow(i, 1), spineRow(i + 1, 1), fr);
  U = normalize(U - T * dot(U, T));
  M = mat3(-T, U, cross(U, T));
}
vec3 rig(vec3 p, vec4 r, vec4 skin, inout vec3 n, inout vec3 tg) {
  if (r.y > .5) {
    mat3 R = rotZ(-uJaw);
    p = HINGE + R * (p - HINGE);
    n = R * n;
    tg = R * tg;
  }
  if (r.z > .5) {
    // Chân chèo không khí: trước/sau, trái/phải lệch nhịp.
    float side = sign(p.z);
    vec3 piv = vec3(-r.x, -.18, side * .3) * vec3(1., ${f(LS)}, ${f(LS)});
    float a = uGait * sin(uTime * 2.1 + (r.z > 1.5 ? 3.1 : 0.) + (side > 0. ? 0. : 1.7));
    mat3 R = rotZ(a);
    p = piv + R * (p - piv);
    n = R * n;
    tg = R * tg;
  }
  if (r.w > 0.) {
    float ph = skin.x * 5. + skin.w * 2.;
    p += vec3(.3 * sin(uTime * 1.1 - ph), sin(uTime * 1.8 - ph), cos(uTime * 1.3 - ph * .8)) * r.w * uFlow;
  }
  vec3 C;
  mat3 M;
  frameAt(r.x, C, M);
  n = M * n;
  tg = M * tg;
  return C + M * (p + vec3(clamp(r.x, 0., DL), 0., 0.));
}`

const VERT = /* glsl */ `
${RIG}
attribute vec3 aTan;
attribute vec4 aSkin, aRig;
varying vec3 vW, vN, vT, vObj;
varying vec4 vSkin;
varying float vS;
void main() {
  vec3 n = normal, tg = aTan;
  vec3 q = rig(position, aRig, aSkin, n, tg);
  vec4 w = modelMatrix * vec4(q, 1.);
  vW = w.xyz;
  vN = normalize(mat3(modelMatrix) * n);
  vT = normalize(mat3(modelMatrix) * tg);
  vObj = position;
  vSkin = aSkin;
  vS = max(-position.x, 0.);
  gl_Position = projectionMatrix * viewMatrix * w;
}`

// Đêm tính theo chỗ trên màn hình (dải chương đêm, mép tan khớp mặt nạ CSS của .night), không theo cả cảnh: rồng nửa trong
// nửa ngoài đêm thì đổi màu đúng ở mép nền. uNightR = từ, tới, độ dài mép tan (px thiết bị), w: 1 = theo x, 0 = theo y.
const BAND = /* glsl */ `
uniform vec4 uNightR;
float NT;
float nightAt() {
  float p = uNightR.w > .5 ? gl_FragCoord.x : gl_FragCoord.y;
  return clamp((p - uNightR.x) / uNightR.z, 0., 1.) * clamp((uNightR.y - p) / uNightR.z, 0., 1.);
}`

// Màu tranh: giấy, mực loang (wash 0..1), nét bút. Đêm là sơn mài: chỗ mực nhạt thành vàng lá, chỗ mực đậm thành son then,
// nét khắc đen trên vàng và nét vàng trên son. Ra thẳng sRGB, không qua đèn.
// Rồng tuôn ra từ mõm tới đuôi: phần chưa tới bị bỏ, mép đang thành hình là mực ướt đậm; uGlow = cả thân còn ướt lúc mới sinh.
const INK = /* glsl */ `
${BAND}
uniform float uReveal, uGlow;
varying float vS;
const vec3 PAPER = vec3(.95, .918, .86), INKC = vec3(.075, .1, .095), SON = vec3(.72, .17, .12), GOLDC = vec3(.86, .66, .3);
const vec3 KEY = vec3(-0.5164, 0.7746, 0.3651);
vec3 washC(float w) {
  w = clamp(w, 0., 1.);
  return mix(mix(PAPER, INKC, w), mix(vec3(.95, .77, .42), vec3(.34, .09, .05), smoothstep(.12, .9, w)), NT);
}
vec3 lineC(float w) { return mix(INKC * .6, mix(vec3(.1, .04, .02), vec3(1., .85, .52), smoothstep(.45, .7, w)), NT); }
float revealEdge() {
  NT = nightAt();
  float e = uReveal - vS + (vnoise(vObj * 5.) - .5) * .35;
  if (e < 0.) discard;
  return 1. - smoothstep(0., .45, e);
}
vec3 birth(vec3 col, float edge) { return mix(col, mix(vec3(.04, .05, .05), vec3(.9, .7, .32), NT), clamp(edge + uGlow * 1.6, 0., 1.)); }`

const BRUSH = /* glsl */ `
// Vảy vẽ bằng nét cung ở mép tự do của mỗi vảy (x = nét, y = mực đọng sát mép); nhỏ quá trên màn hình thì tan thành loang.
vec2 inkScales(vec2 g) {
  vec2 cen;
  vec4 sc = scaleAt(g, cen);
  float px = length(fwidth(g));
  float fade = 1. - smoothstep(.18, .45, px);
  float w = .06 + px * .8;
  return vec2((1. - smoothstep(w * .4, w, sc.z)) * fade * (.75 + .25 * hash12(cen)), (1. - smoothstep(0., .4, sc.z)) * fade);
}
// Nét viền bút lông: dày hơn ở phía khuất sáng, run tay theo nhiễu.
float outline(vec3 N, vec3 V, float lam) {
  float fr = 1. - abs(dot(N, V));
  return smoothstep(.55 - .2 * (1. - lam), .85, fr + (vnoise(vObj * 7.) - .5) * .25);
}`

export function createDragon() {
  const spineData = new Float32Array(NSP * 3 * 4)
  const spine = new THREE.DataTexture(spineData, NSP, 3, THREE.RGBAFormat, THREE.FloatType)
  spine.minFilter = THREE.NearestFilter
  spine.magFilter = THREE.NearestFilter
  const uniforms = {
    ...lightUniforms(),
    uSpine: { value: spine },
    uTime: { value: 0 },
    uJaw: { value: 0 },
    uGait: { value: 0.12 },
    uFlow: { value: 1 },
    uOpacity: { value: 1 },
    uGlow: { value: 0 },
    /** Độ dài thân đã hiện (tính từ mõm); 99 = hiện hết. */
    uReveal: { value: 99 },
    /** Dải đêm trên màn hình, xem BAND. */
    uNightR: { value: new THREE.Vector4(0, 0, 1, 1) },
  }

  const solid = buf()
  const flames = buf()
  bodyParts(solid, flames)
  headParts(solid, flames)
  legParts(solid, flames)

  const bodyMat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    vertexShader: VERT,
    fragmentShader: /* glsl */ `
      uniform float uOpacity, uTime;
      varying vec3 vW, vN, vT, vObj;
      varying vec4 vSkin;
      ${NOISE}
      ${SCALES}
      ${INK}
      ${BRUSH}
      const vec3 EC = vec3(${f(EC.x)}, ${f(EC.y)}, ${f(EC.z)});
      void main() {
        float edge = revealEdge();
        float part = vSkin.z;
        vec3 V = normalize(cameraPosition - vW);
        vec3 N = normalize(vN);
        float lam = dot(N, KEY) * .5 + .5;
        // wash: độ đậm mực; line: nét bút; tint/tw: màu riêng (mắt, lưỡi, lòng miệng) phủ lên.
        float wash = .5, line = 0., a = 1., tw = 0.;
        vec3 tint = SON;
        if (part < .5 || abs(part - ${LEG}.) < .5) {
          // ---------- Thân, chân: sống lưng đậm, sườn nhạt, quệt khô theo thớ; bụng là các đốt ngang để trắng ----------
          bool legP = part > .5;
          float cf = vSkin.y;
          float d = cf < .5 ? 2. * cf : 2. * (1. - cf);
          vec2 sl = inkScales(vec2(vSkin.x, cf * (legP ? 8. : ${NR}.)));
          float pool = fbm(vec3(vSkin.x * .05, d * 1.5, 1.));
          float dry = smoothstep(.55, .78, vnoise(vec3(vSkin.x * .05, d * 23., 5.)));
          wash = mix(.8, .32, smoothstep(.1, .7, d)) * mix(1.2, .6, lam) * (.8 + .4 * pool) * (1. - .55 * dry) + .25 * sl.y;
          line = sl.x * .75;
          float belly = legP ? 0. : smoothstep(.68, .74, d);
          if (belly > 0.) {
            float u = vSkin.x * .7;
            float fb = min(fract(u), 1. - fract(u));
            float fw = fwidth(u);
            wash = mix(wash, .06 + .14 * (1. - lam), belly);
            line = mix(line, (1. - smoothstep(fw * .5, fw * 1.5 + .03, fb)) * .7, belly);
          }
        } else if (part < 2.5) {
          // ---------- Đầu: loang theo khối, mực đọng ở hốc (che sáng tính sẵn), vảy bò lên gáy, lòng miệng son sẫm ----------
          float ao = vSkin.x, mouth = vSkin.y;
          float cf = fract(atan(-vObj.z, vObj.y) / 6.2832);
          float d = cf < .5 ? 2. * cf : 2. * (1. - cf);
          wash = mix(.55, .2, smoothstep(.1, .7, d)) * mix(1.25, .55, lam) * (.8 + .4 * fbm(vObj * 2.5)) + (1. - ao) * .9;
          line = smoothstep(.35, .65, 1. - ao) * .8;
          float on = (1. - smoothstep(.25, .7, vObj.x)) * (1. - smoothstep(.55, .72, d)) * (1. - mouth);
          if (on > 0.) {
            vec2 sl = inkScales(vec2((.3 - vObj.x) * 6.4, cf * ${NR}.));
            wash += .25 * sl.y * on;
            line = max(line, sl.x * .75 * on);
          }
          tint = vec3(.42, .08, .06) * mix(.6, 1., lam);
          tw = mouth * .85;
        } else if (part < 3.5) {
          // ---------- Mắt: lòng giấy, tròng son, viền mực, con ngươi dọc, đốm sáng, mi trên phủ bóng ----------
          float side = vSkin.w;
          vec3 dd = normalize(vObj - EC * vec3(1., 1., side));
          vec3 gz = normalize(vec3(.55, .05, .83 * side));
          float c = dot(dd, gz);
          vec3 ux = normalize(cross(vec3(0., 1., 0.), gz));
          vec3 uy = cross(gz, ux);
          vec2 pp = vec2(dot(dd, ux) * 2.1, dot(dd, uy));
          vec3 e = mix(vec3(.92, .88, .78), mix(SON, vec3(.95, .55, .18), smoothstep(.55, .95, c) * .7), smoothstep(.22, .3, c));
          e = mix(e, INKC, smoothstep(.2, .26, c) * (1. - smoothstep(.3, .4, c)));
          e = mix(e, vec3(.02), (1. - smoothstep(.33, .36, length(pp))) * step(.5, c));
          e = mix(e, vec3(1.), 1. - smoothstep(.1, .14, length(dd - normalize(gz + uy * .45 - ux * .3 * side))));
          tint = e * mix(1., .45, smoothstep(.35, .75, dd.y));
          tw = 1.;
        } else if (part < 4.5) {
          // ---------- Răng: để trắng giấy ----------
          wash = .05 + .15 * (1. - lam);
        } else if (part < 5.5) {
          // ---------- Vuốt: đậm dần về mũi ----------
          wash = mix(.45, .95, smoothstep(.2, .9, vSkin.x));
        } else if (part < 6.5) {
          // ---------- Sừng: gốc đậm, ngọn nhạt, rãnh dọc là nét ----------
          float s = vSkin.x;
          float gr = sin(vSkin.y * 6.2832 * 7. + fbm(vec3(s * 4., vSkin.y * 3., 2.)) * 6.);
          wash = mix(.75, .35, smoothstep(.1, .9, s)) * mix(1.15, .7, lam);
          line = .5 * smoothstep(.75, 1., gr);
        } else if (part < 7.5) {
          // ---------- Râu: một nét mực, nhạt dần về ngọn ----------
          wash = .95;
          a = 1. - .85 * smoothstep(.5, 1., vSkin.x);
        } else {
          // ---------- Lưỡi ----------
          tint = SON * mix(.6, 1.1, lam);
          tw = 1.;
        }
        vec3 col = mix(washC(wash), tint, tw);
        col = mix(col, lineC(wash), clamp(max(line, outline(N, V, lam)), 0., 1.));
        gl_FragColor = vec4(birth(col, edge), uOpacity * a);
      }`,
  })

  const flameMat = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
    vertexShader: VERT,
    fragmentShader: /* glsl */ `
      uniform float uOpacity, uTime;
      varying vec3 vW, vN, vT, vObj;
      varying vec4 vSkin;
      ${NOISE}
      ${INK}
      void main() {
        float edge = revealEdge();
        float s = vSkin.x, a = vSkin.y, part = vSkin.z, seed = vSkin.w;
        float alpha, along, strand;
        if (abs(part - ${CREST}.) < .5) {
          // Vây lưng: răng cưa cong về sau như ngọn lửa, gân chạy từ gốc lên chóp.
          float P = .27;
          float ph = fract((s + a * .16) / P);
          float spike = 1. - pow(abs(2. * ph - 1.), .7);
          float h = max(.18, spike);
          float aa = fwidth(a) * 1.5;
          alpha = 1. - smoothstep(h - aa, h, a);
          along = a;
          strand = abs(fract(ph * 5.) - .5);
        } else {
          float wv = .18 * sin(s * 11. + seed * 4.) * s;
          float e = 1. - .25 * s * s;
          float aa = fwidth(a) * 1.5;
          alpha = 1. - smoothstep(e - aa, e, abs(a + wv));
          along = s;
          strand = abs(fract((a + wv) * 3.5 + s * .5) - .5);
        }
        // Nét bút khô: sợi lông bút để lộ giấy giữa các sợi. Vây, bờm: mực (đêm: vàng); lửa: gốc mực, ngọn son.
        float dryS = smoothstep(.15, .45, strand);
        float fire = step(abs(part - ${FLAME}.), .5);
        float mane = step(abs(part - ${MANE}.), .5);
        alpha *= (.6 + .4 * dryS) * (1. - .75 * smoothstep(.55, 1., along) * mane);
        if (alpha < .01) discard;
        vec3 col = mix(washC(.95), lineC(.95), .4 + .6 * NT);
        col = mix(col, mix(SON, vec3(.95, .35, .15), NT), smoothstep(.3, .85, along) * fire);
        gl_FragColor = vec4(birth(col, edge), alpha * mix(.97, .85, along) * uOpacity);
      }`,
  })

  const bodyMesh = new THREE.Mesh(toGeo(solid), bodyMat)
  const flameMesh = new THREE.Mesh(toGeo(flames), flameMat)
  for (const m of [bodyMesh, flameMesh]) m.frustumCulled = false
  bodyMesh.renderOrder = 1
  flameMesh.renderOrder = 2
  const group = new THREE.Group()
  group.add(bodyMesh, flameMesh)

  // Mây quanh thân: mỗi đám là một tấm luôn quay về máy ảnh, đặt theo toạ độ của group (không theo xương sống), trước hoặc
  // sau thân. Đám trước che khúc thân, đám sau bị thân che: rồng luồn ra vào mây.
  const CLOUDS = 36
  const quad = new THREE.PlaneGeometry(2, 2)
  const cGeo = new THREE.InstancedBufferGeometry()
  cGeo.index = quad.index
  cGeo.setAttribute('position', quad.getAttribute('position'))
  const iPos = new THREE.InstancedBufferAttribute(new Float32Array(CLOUDS * 3), 3)
  /** [lúc sinh, tuổi thọ, cỡ (thế giới), seed]. */
  const iData = new THREE.InstancedBufferAttribute(new Float32Array(CLOUDS * 4).fill(-99), 4)
  cGeo.setAttribute('iPos', iPos)
  cGeo.setAttribute('iData', iData)
  cGeo.instanceCount = CLOUDS
  const cloudMat = new THREE.ShaderMaterial({
    uniforms: { uOpacity: uniforms.uOpacity, uNightR: uniforms.uNightR, uClock: { value: 0 }, uMist: { value: 1 } },
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      uniform float uClock;
      attribute vec3 iPos;
      attribute vec4 iData;
      varying vec2 vUv;
      varying float vA, vSeed;
      void main() {
        float age = uClock - iData.x, k = age / iData.y;
        vA = smoothstep(0., .12, k) * (1. - smoothstep(.45, 1., k));
        vUv = position.xy;
        vSeed = iData.w;
        if (k < 0. || k > 1.) { gl_Position = vec4(2., 2., 2., 1.); return; }
        vec4 mv = modelViewMatrix * vec4(iPos + vec3(.05, .012, 0.) * age * iData.z, 1.);
        mv.xy += position.xy * iData.z * length(modelMatrix[0].xyz) * (.85 + .3 * k) * vec2(1.6, 1.);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uOpacity, uMist;
      varying vec2 vUv;
      varying float vA, vSeed;
      ${NOISE}
      ${BAND}
      void main() {
        NT = nightAt();
        // Sương thuỷ mặc: lòng là giấy (thân rồng chìm vào giấy như tranh Cửu Long), không có viền cứng; mực xám loang thấm ở
        // mép, đọng nặng ở phía dưới, có vệt bút khô kéo ngang. Đêm đảo lại: lòng là trời đêm, mép loang ánh trăng bạc.
        // (Viền vàng từng đám thì nhiều đám chồng nhau thành rối như bản đồ, nên vàng chỉ để cho rồng.)
        vec2 p = vUv;
        vec2 q = p + (vec2(fbm(vec3(p * 1.3, vSeed * 13.)), fbm(vec3(p * 1.3 + 7., vSeed * 5.))) - .5) * .9;
        float r = length(q * vec2(1., 1.3)) + (fbm(vec3(p * 3.2, vSeed * 3. + 1.)) - .5) * .45;
        float dens = 1. - smoothstep(.2, .95, r);
        float streak = vnoise(vec3(p.x * 1.4, p.y * 11., vSeed * 9.));
        dens = clamp(dens * (.7 + .6 * streak), 0., 1.) * (1. - smoothstep(.7, 1., length(p)));
        float bloom = smoothstep(.05, .35, dens) * (1. - smoothstep(.4, .85, dens));
        float low = smoothstep(.35, -.7, p.y);
        float ink = clamp(bloom * (.35 + .9 * low) * (.55 + .8 * fbm(vec3(p * 4.5, vSeed * 2. + 9.))), 0., 1.);
        vec3 day = mix(vec3(.955, .93, .875), vec3(.4, .44, .42), ink * .75);
        vec3 night = mix(vec3(.05, .11, .13), vec3(.45, .53, .53), ink * .6);
        float al = smoothstep(0., .6, dens) * .97 * vA * uOpacity * uMist;
        if (al < .005) discard;
        gl_FragColor = vec4(mix(day, night, NT), al);
      }`,
  })
  const cloudMesh = new THREE.Mesh(cGeo, cloudMat)
  cloudMesh.frustumCulled = false
  cloudMesh.renderOrder = 3
  group.add(cloudMesh)
  const rnd = (lo: number, hi: number) => lo + Math.random() * (hi - lo)
  let nextPuff = 0
  let slot = 0

  const P = Array.from({ length: NSP }, () => new V3())
  const Tn = Array.from({ length: NSP }, () => new V3())
  const Up = Array.from({ length: NSP }, () => new V3())
  const side = new V3()
  const tmp = new V3()
  const a = new V3()
  const b = new V3()
  const ds = DL / (NSP - 1)
  const w = new V3()
  const frames = (up: THREE.Vector3) => {
    for (let i = 0; i < NSP; i++) Tn[i].subVectors(P[Math.min(i + 1, NSP - 1)], P[Math.max(i - 1, 0)]).normalize()
    Up[0].copy(up).addScaledVector(Tn[0], -up.dot(Tn[0]))
    if (Up[0].lengthSq() < 1e-4) Up[0].set(0, 0, 1).addScaledVector(Tn[0], -Tn[0].z)
    Up[0].normalize()
    for (let i = 1; i < NSP; i++) {
      // Truyền khung từ đốt trước (không giật), rồi kéo dần lưng về phía "lên" để thân không xoắn dồn về đuôi.
      w.copy(up).addScaledVector(Tn[i], -up.dot(Tn[i]))
      Up[i].copy(Up[i - 1]).addScaledVector(Tn[i], -Up[i - 1].dot(Tn[i])).normalize().addScaledVector(w, 0.15)
      Up[i].addScaledVector(Tn[i], -Up[i].dot(Tn[i])).normalize()
    }
  }

  return {
    group,
    uniforms,
    /**
     * Đặt rồng lên đường bay path(σ) (σ gần như độ dài cung): đầu ở σ = head, thân kéo theo sau. Thân lượn sóng lên xuống
     * chạy từ đầu ra đuôi (wave), rồi kéo căng như xích để giữ đúng chiều dài.
     */
    pose(path: (sigma: number, out: THREE.Vector3) => THREE.Vector3, head: number, t: number, wave = 0.22, up = new V3(0, 1, 0)) {
      // Lấy mẫu lại theo độ dài cung thật: σ chỉ gần đúng, kéo xích trên mẫu thưa/dày không đều sẽ gập thân thành nếp.
      path(head, P[0])
      a.copy(P[0])
      let k = 1
      let need = ds
      for (let n = 1; k < NSP && n < NSP * 16; n++) {
        path(head - (n * ds) / 4, b)
        let d = a.distanceTo(b)
        while (k < NSP && d >= need) {
          a.lerp(b, need / d)
          P[k++].copy(a)
          d -= need
          need = ds
        }
        need -= d
        a.copy(b)
      }
      // ponytail: đường quá chậm (tốc độ < 1/4) thì nối thẳng phần đuôi còn thiếu.
      for (; k < NSP; k++) P[k].copy(P[k - 1]).add(tmp.subVectors(P[k - 1], P[k - 2]))
      frames(up)
      // Sóng xoắn ốc (lên xuống + ngang lệch pha) chạy từ cổ ra đuôi: thân rắn luồn như dải lụa, không cứng như ống.
      for (let i = 1; i < NSP; i++) {
        const s = i * ds
        const env = sm(s, 0.3, 3) * (0.75 + 0.25 * sm(s, 6, 13))
        const ph = 1.5 * s - t * 2.6
        side.crossVectors(Up[i], Tn[i])
        P[i].addScaledVector(Up[i], wave * env * Math.sin(ph)).addScaledVector(side, 0.6 * wave * env * Math.cos(ph))
      }
      for (let i = 1; i < NSP; i++) {
        tmp.subVectors(P[i], P[i - 1]).setLength(ds)
        P[i].copy(P[i - 1]).add(tmp)
      }
      frames(up)
      // Thân lăn theo sóng: vây lưng nghiêng vào khúc cua.
      for (let i = 1; i < NSP; i++) {
        const s = i * ds
        Up[i].applyAxisAngle(Tn[i], 1.3 * wave * sm(s, 0.3, 3) * Math.cos(1.5 * s - t * 2.6))
      }
      for (let i = 0; i < NSP; i++) {
        P[i].toArray(spineData, i * 4)
        Up[i].toArray(spineData, (NSP + i) * 4)
        Tn[i].toArray(spineData, (2 * NSP + i) * 4)
      }
      spine.needsUpdate = true
    },
    /** Gọi sau pose(): thả một đám mây mới quanh khúc thân ngẫu nhiên mỗi 0,35–0,65 s. veil = độ đặc của mây (0–1). */
    mist(time: number, veil = 1) {
      cloudMat.uniforms.uClock.value = time
      cloudMat.uniforms.uMist.value = veil
      if (uniforms.uOpacity.value < 0.05 || time < nextPuff) return
      nextPuff = time + rnd(0.35, 0.65)
      const sMax = Math.min(DL - 1, uniforms.uReveal.value - 1.5)
      if (sMax < 3) return
      const i = Math.round(rnd(3, sMax) / ds)
      // Lệch ngang thân (trong mặt phẳng màn hình) một chút, lệch sâu nhiều: 60% đám nằm trước thân.
      tmp.set(-Tn[i].y, Tn[i].x, 0).normalize().multiplyScalar(rnd(-0.5, 0.5)).add(P[i])
      tmp.z += (Math.random() < 0.6 ? 1 : -1) * rnd(0.4, 1.6)
      tmp.toArray(iPos.array, slot * 3)
      iData.setXYZW(slot, time, rnd(5, 8), rnd(1.6, 2.8), Math.random() * 10)
      slot = (slot + 1) % CLOUDS
      // ponytail: tải lại cả 36 phần tử mỗi lần thả, đủ rẻ.
      iPos.needsUpdate = true
      iData.needsUpdate = true
    },
    dispose() {
      for (const o of [bodyMesh, flameMesh, cloudMesh]) {
        o.geometry.dispose()
        o.material.dispose()
      }
      quad.dispose()
      spine.dispose()
    },
  }
}
