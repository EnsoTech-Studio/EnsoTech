'use client'

// Một khung WebGL cố định sau nội dung: cá koi bơi ngược dòng qua mười chương, vượt thác Vũ Môn, tan thành mực
// rồi mực tụ lại thành con rồng thuỷ mặc ẩn trong mây. Từ đó (nhớ trong phiên) rồng thay cá, bay lượn qua mọi chương.
// Camera đứng yên ở (0,0,12); mọi vị trí tính theo phân số màn hình nên bố cục giữ đúng ở mọi khổ màn hình.

import { useEffect, useRef, type RefObject } from 'react'
import { Canvas, useFrame, useThree, type RootState } from '@react-three/fiber'
import * as THREE from 'three'
import { NIGHT, along, clamp, smooth, voyage } from '../store'
import { DL, createDragon } from './dragon'
import { curve } from './kit'
import { ANCHORS, SL, createKoi, koiPoint, type Swim } from './koi'
import { BUBBLE, DROP, EMBER, FOAM, MIST, SPRAY, TAN, emitter, fallsMaterial } from './water'

export function Scene() {
  const svg = useRef<SVGSVGElement>(null)
  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[1]">
        <Canvas
          flat
          dpr={[1, 1.5]}
          style={{ pointerEvents: 'none' }}
          camera={{ position: [0, 0, 12], fov: 35, near: 0.1, far: 60 }}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        >
          <World svg={svg} />
        </Canvas>
      </div>
      {/* Đường chỉ từ thân cá tới nhãn tiêu bản — vẽ lại mỗi khung hình theo đúng chỗ vây, miệng đang ở. */}
      <svg ref={svg} aria-hidden className="pointer-events-none fixed inset-0 z-[4] size-full text-son opacity-0">
        {ANCHORS.map((_, i) => (
          <g key={i}>
            <path pathLength={1} fill="none" stroke="currentColor" strokeOpacity={0.75} strokeDasharray="1" strokeDashoffset="1" />
            <circle r={2.5} fill="currentColor" />
          </g>
        ))}
      </svg>
    </>
  )
}

function World({ svg }: { svg: RefObject<SVGSVGElement | null> }) {
  const scene = useThree((s) => s.scene)
  const tick = useRef<((s: RootState, dt: number) => void) | null>(null)
  useEffect(() => {
    const w = createWorld(scene, svg.current!)
    tick.current = w.tick
    return () => {
      tick.current = null
      w.dispose()
    }
  }, [scene, svg])
  useFrame((s, dt) => tick.current?.(s, dt))
  return null
}

/** Bảng mốc → hàm nội suy Hermite cho từng cột (cột 0 là trục: chương hoặc tiến độ màn cuối). */
function table(rows: readonly (readonly number[])[]) {
  const xs = rows.map((r) => r[0])
  const cols = rows[0].slice(1).map((_, c) => curve(xs, rows.map((r) => r[c + 1])))
  return (s: number, out: number[]) => {
    cols.forEach((f, i) => (out[i] = f(s)))
    return out
  }
}

// Đường bơi qua các chương: [chương, x, y (phân số màn hình), sâu, cỡ, lệch hướng, nghiêng lưng].
// Đi ngang: cá men đáy khung, dưới chữ, nghiêng lưng về phía người xem cho thấy mảng son. Dọc: nhìn từ trên xuống như ao cá, lượn chữ S.
const HZ_PATH = table([
  [1.0, 0.6, 0.76, 0, 0.78, 0, 0.9],
  [1.6, 0.56, 0.78, -0.6, 0.74, 0.15, 0.85],
  [2.4, 0.5, 0.84, 0, 0.74, -0.1, 0.9],
  [3.2, 0.45, 0.86, 0, 0.72, 0, 0.95],
  [4.0, 0.55, 0.84, -0.4, 0.74, 0.1, 0.9],
  [5.0, 0.5, 0.6, 0, 0.78, 0, 0.8],
  [6.4, 0.42, 0.78, 0, 0.74, 0, 0.85],
  [7.4, 0.45, 0.86, 0, 0.72, 0, 0.9],
  [8.4, 0.4, 0.9, 0, 0.68, 0, 0.9],
  [9.2, 0.5, 0.84, 0, 0.62, 0, 0.5],
])
const VT_PATH = table([
  [0.6, 0.5, 0.8, 0, 0.78, 0, 1.25],
  [1.5, 0.74, 0.7, 0, 0.74, 0, 1.25],
  [2.5, 0.28, 0.64, 0, 0.74, 0, 1.25],
  [3.5, 0.72, 0.72, 0, 0.74, 0, 1.25],
  [4.5, 0.3, 0.66, 0, 0.74, 0, 1.25],
  [5.5, 0.7, 0.7, 0, 0.74, 0, 1.25],
  [6.5, 0.3, 0.64, 0, 0.74, 0, 1.25],
  [7.5, 0.7, 0.72, 0, 0.74, 0, 1.25],
  [8.5, 0.32, 0.68, 0, 0.74, 0, 1.25],
  [9.5, 0.6, 0.74, 0, 0.7, 0, 1.25],
])
// Màn cuối theo tiến độ: [fin, x, y (phân số sân khấu, tâm thân cá), chúc/ngóc, nghiêng lưng, biên độ quẫy, nhịp quẫy].
// Hồ dưới chân thác → lao vào thác → quẫy ngược dòng → vọt qua gờ thác (gờ ở 40%) rồi treo lại ở đỉnh cú nhảy để tan thành rồng.
// Leo chậm (.17→.38), vọt nhanh gấp ba (.38→.44) — cú nhảy phải đọc ra là bật lên, không phải trôi lên.
const FINALE = table([
  [0, 0.56, 0.86, 0.05, 0.35, 0.45, 2.4],
  [0.1, 0.645, 0.85, 0.35, 0.4, 0.55, 3],
  [0.17, 0.715, 0.74, 1.45, 0.55, 0.8, 5.5],
  [0.3, 0.72, 0.58, 1.52, 0.5, 0.85, 5.8],
  [0.38, 0.724, 0.47, 1.48, 0.5, 0.8, 5.5],
  [0.44, 0.745, 0.27, 1.1, 0.35, 0.5, 3],
  [0.52, 0.75, 0.24, 0.9, 0.3, 0.3, 2],
])
/** Thác trong sân khấu: tâm ngang, gờ, chân (phân số sân khấu) — khớp khe đá trong Massif (env.tsx). */
const FALLS_X = 0.72
const FALLS_TOP = 0.4
const FALLS_BOT = 0.935
/**
 * Đường rồng vẽ ra: [x, y (phân số sân khấu), sâu (đơn vị thế giới)]. Tuôn ra từ đỉnh cú nhảy, vồng lên thành vòm rồi
 * sà xuống về phía người xem, đầu cúi nhìn thác — "giáng long", dừng thành một bức tranh và thở, không lượn vòng.
 * Ở nửa phải sân khấu, tránh cột chữ bên trái và thanh menu.
 */
const FLIGHT: [number, number, number][] = [
  [0.745, 0.29, 0],
  [0.74, 0.17, 0.3],
  [0.67, 0.12, 0.6],
  [0.58, 0.15, 1],
  [0.53, 0.25, 1.4],
  [0.52, 0.38, 1.8],
  [0.56, 0.5, 2],
  [0.6, 0.56, 2],
]
/** Màn dọc (điện thoại): không có cột chữ, nên rồng vồng qua khoảng trời trống bên trái thành chữ S, đầu quay về phía thác. */
const FLIGHT_TALL: [number, number, number][] = [
  [0.76, 0.27, 0],
  [0.72, 0.18, 0.3],
  [0.55, 0.155, 0.6],
  [0.32, 0.175, 1],
  [0.19, 0.27, 1.3],
  [0.23, 0.39, 1.6],
  [0.42, 0.45, 1.8],
  [0.56, 0.5, 2],
]
const DRAGON_SD = 0.4
/**
 * Hoá rồng xong thì rồng thay cá trên cả trang, bay lượn hình số 8 có chiều sâu quanh một tâm theo chương:
 * [chương, x, y (tâm, phân số màn hình), bán kính ngang, bán kính dọc, cỡ]. Đi ngang: dải dưới chữ như đường cá cũ. Dọc: giữa dưới.
 */
const DR_HZ = table([
  [1.0, 0.6, 0.8, 0.2, 0.07, 0.3],
  [2.4, 0.5, 0.82, 0.22, 0.06, 0.3],
  [3.2, 0.48, 0.84, 0.22, 0.05, 0.3],
  [4.0, 0.55, 0.82, 0.2, 0.06, 0.3],
  [5.0, 0.5, 0.62, 0.24, 0.08, 0.3],
  [6.4, 0.45, 0.8, 0.22, 0.07, 0.3],
  [7.4, 0.48, 0.84, 0.2, 0.05, 0.3],
  [8.4, 0.45, 0.86, 0.2, 0.05, 0.28],
  [9.2, 0.55, 0.8, 0.2, 0.06, 0.3],
])
const DR_VT = table([
  [0.6, 0.5, 0.72, 0.44, 0.1, 0.32],
  [5, 0.5, 0.7, 0.44, 0.1, 0.32],
  [9.5, 0.5, 0.72, 0.44, 0.1, 0.32],
])
/** Trên sân khấu thác: lượn trên nửa phải bầu trời (đi ngang), hay khoảng trời trên thác (dọc). [x, y, rộng, cao] */
const DR_STAGE_HZ = [0.64, 0.3, 0.17, 0.11]
const DR_STAGE_VT = [0.48, 0.3, 0.28, 0.09]
const DRAGON_KEY = 'ensotech:dragon'
/** Vệt bay của đầu rồng (đơn vị thế giới): thân bám theo vệt này như rắn bò trên cát. */
const TRAIL = 180
const TH = 0.08
const TRAVEL = 9
const TAU = Math.PI * 2
const wrap = (a: number) => a - Math.round(a / TAU) * TAU
const rand = (s = 1) => (Math.random() - 0.5) * s
const mix = THREE.MathUtils.lerp

function createWorld(scene: THREE.Scene, svgEl: SVGSVGElement) {
  const koi = createKoi()
  const fish = koi.group
  fish.rotation.order = 'YZX'
  const ku = koi.uniforms
  const dragon = createDragon()
  const du = dragon.uniforms
  const water = emitter(5000)
  water.points.renderOrder = 3
  water.veil.renderOrder = 4
  // Hai lớp thác: màn chính sau cá, một lớp sợi thưa trước cá (cá leo thác thì như ở trong dòng nước, không dán lên trên).
  const falls = [new THREE.Mesh(new THREE.PlaneGeometry(1, 1), fallsMaterial()), new THREE.Mesh(new THREE.PlaneGeometry(1, 1), fallsMaterial(true))] as const
  const FALLS_Z = [-0.6, 0.6]
  falls[1].renderOrder = 2
  falls.forEach((f) => (f.frustumCulled = false))
  scene.add(fish, dragon.group, ...falls, water.points, water.veil)
  // Có cảnh 3D thì giấu thác vẽ bằng CSS (bản dự phòng cho máy không có WebGL).
  document.documentElement.dataset.scene = ''

  const plate = document.querySelector<HTMLElement>('[data-plate]')
  const moon = document.querySelector<SVGElement>('[data-moon]')
  const nightEl = document.querySelector<HTMLElement>('.night')
  const pins = ANCHORS.map((_, i) => document.querySelector<HTMLElement>(`[data-label="${i}"] [data-pin]`))
  const lines = [...svgEl.querySelectorAll('g')].map((g) => ({ path: g.querySelector('path')!, dot: g.querySelector('circle')! }))
  let svgOn = false

  const sw: Swim = { phase: 0, amp: 0.4, bend: 0, flap: 0.04, spread: 0, curl: 0, pivot: 0 }
  let sec = voyage.sec
  let secV = 0
  let fin = voyage.fin
  let finV = 0
  let yaw = 0
  let pitch = 0
  let roll = 0
  let bank = 0
  let first = true
  let lastTap = voyage.tap
  let bubbleAt = 3
  let streamAcc = 0
  let footAcc = 0
  let sprayAcc = 0
  let emberAcc = 0
  let leapArmed = true
  // Rồng: đường bay dựng lại khi đổi khổ màn hình.
  let flight: THREE.CatmullRomCurve3 | null = null
  let flightKey = ''
  let flightLen = 1
  let Sd = 1
  const flightPath = (s: number, out: THREE.Vector3) => {
    const u = ((s * Sd) / flightLen) % 1
    return flight!.getPointAt(u < 0 ? u + 1 : u, out).divideScalar(Sd)
  }
  // Rồng tự do: đã hoá rồng thì nhớ trong phiên, tải lại trang cũng không còn cá.
  let free = false
  try {
    free = sessionStorage.getItem(DRAGON_KEY) === '1'
  } catch {}
  if (free) document.documentElement.dataset.dragon = ''
  let seeded = false
  let phi = 0
  let Sf = 0.3
  const head = new THREE.Vector3()
  const headV = new THREE.Vector3()
  const tgt = new THREE.Vector3()
  const dk: number[] = []
  // Vòng đệm các điểm đầu rồng đã đi qua, cách đều TH; k = 0 là điểm mới nhất.
  const trail = new Float32Array(TRAIL * 3)
  let ti = 0
  let tn = 0
  const tp = (k: number, out: THREE.Vector3) => out.fromArray(trail, ((ti - Math.min(k, tn - 1) + TRAIL) % TRAIL) * 3)
  const addTrail = (p: THREE.Vector3) => {
    ti = (ti + 1) % TRAIL
    p.toArray(trail, ti * 3)
    tn = Math.min(tn + 1, TRAIL)
  }
  const ta = new THREE.Vector3()
  const tb = new THREE.Vector3()
  const follow = () => {
    tp(0, ta)
    for (let d = ta.distanceTo(head); d >= TH; d -= TH) addTrail(ta.lerp(head, TH / d))
  }
  /** Đường cho dragon.pose: σ ≤ 0 là quãng (đơn vị rồng) sau đầu; hết vệt thì kéo thẳng đoạn cuối. */
  const trailPath = (s: number, out: THREE.Vector3) => {
    const d = Math.max(0, -s * Sf)
    const l0 = head.distanceTo(tp(0, ta))
    if (d <= l0) return out.copy(head).lerp(ta, l0 > 1e-6 ? d / l0 : 0).divideScalar(Sf)
    const x = (d - l0) / TH
    const k = Math.min(Math.floor(x), tn - 2)
    return out.copy(tp(k, ta)).lerp(tp(k + 1, tb), x - k).divideScalar(Sf)
  }
  const v = new THREE.Vector3()
  const vv = new THREE.Vector3()
  const pos = new THREE.Vector3()
  const last = new THREE.Vector3()
  const vel = new THREE.Vector3()
  const pA = new THREE.Vector3()
  const pB = new THREE.Vector3()
  const pPlate = new THREE.Vector3()
  const pFin = new THREE.Vector3()
  const key: number[] = []
  const ka: number[] = []
  const kb: number[] = []
  const fk: number[] = []
  /** Điểm trên sống thân cá ở u (0 mõm → 1 chóp đuôi), theo đúng dáng đang uốn, ra toạ độ thế giới. */
  const koiAt = (u: number, out: THREE.Vector3, y = 0, z = 0) => fish.localToWorld(koiPoint(out.set(SL / 2 - u * SL, y, z), u, sw))

  function tick(state: RootState, delta: number) {
    const dt = Math.min(delta, 0.1)
    const time = state.clock.elapsedTime
    const { width: W, height: H } = state.size
    const aspect = W / H
    const cam = state.camera
    const hz = voyage.hz
    const calm = voyage.reduce
    const damp = (r: number) => 1 - Math.exp(-dt * r)
    /** Đơn vị thế giới trên mỗi px CSS ở độ sâu 0. */
    const upx = (2 * TAN * 12) / H
    const toWorld = (fx: number, fy: number, z: number, out: THREE.Vector3) => {
      const hh = TAN * (12 - z)
      return out.set((2 * fx - 1) * hh * aspect, (1 - 2 * fy) * hh, z)
    }
    // Sân khấu cuối: phân số sân khấu → phân số màn hình (sky = độ lệch px của sân khấu so với chỗ dừng).
    const sky = voyage.sky
    const stageX = (sx: number) => sx + (hz ? sky / W : 0)
    const stageY = (sy: number) => sy + (hz ? 0 : sky / H)

    // Quán tính: cá đuổi theo vị trí cuộn bằng lò xo — cuộn nhanh thì cá trễ lại rồi bắt kịp. Chia bước nhỏ để lò xo không phát tán.
    for (let left = dt; left > 1e-6; left -= 1 / 120) {
      const h = Math.min(left, 1 / 120)
      secV += ((voyage.sec - sec) * 22 - secV * 8.5) * h
      sec += secV * h
      finV += ((voyage.fin - fin) * 30 - finV * 10) * h
      fin += finV * h
    }
    fin = clamp(fin)
    const stageVis = clamp(1 - Math.abs(sky) / (hz ? W : H))
    const fw = smooth(0.35, 0.85, stageVis)
    const fitV = hz ? 1 : Math.sqrt(Math.min(1, aspect / 1.6))

    // ---------- Tư thế theo chương ----------
    const path = hz ? HZ_PATH : VT_PATH
    path(sec, key)
    path(sec - 0.01, ka)
    path(sec + 0.01, kb)
    toWorld(key[0], key[1], key[2], pos)
    toWorld(ka[0], ka[1], ka[2], pA)
    toWorld(kb[0], kb[1], kb[2], pB)
    let S = key[3] * fitV
    // Đi ngang: luôn hướng về phía trước (ngược dòng). Dọc: lượn theo đường, hơi chúc xuống phía thác đang chờ ở cuối trang.
    const hx = (pB.x - pA.x) * 50 + (hz ? TRAVEL : 0)
    const hy = (pB.y - pA.y) * 50 + (hz ? 0 : -1.2)
    const hzz = (pB.z - pA.z) * 50
    let tYaw = hz ? Math.atan2(-hzz, hx) + key[4] : 0
    let tPitch = hz ? Math.atan2(hy, Math.hypot(hx, hzz)) * 0.8 : Math.atan2(hy, hx)
    let tRoll = key[5]

    // Lượn tại chỗ (không áp ở màn cuối): cá sống không bao giờ đứng yên tuyệt đối.
    if (!calm) pos.add(v.set(Math.sin(time * 0.27) * 0.12, Math.sin(time * 0.7) * 0.06, Math.sin(time * 0.19 + 1) * 0.2).multiplyScalar(1 - fw))

    // ---------- Tấm tiêu bản ở trang đầu ----------
    let plateW = 0
    let plateR: DOMRect | null = null
    if (plate && sec < 1.3) {
      const r = (plateR = plate.getBoundingClientRect())
      const cy = (r.top + r.height / 2) / H
      plateW = hz ? 1 - smooth(0.55, 0.95, sec) : 1 - smooth(0.25, 0.65, Math.abs(cy - 0.5))
      if (plateW > 0) {
        toWorld((r.left + r.width / 2) / W, cy, 0, pPlate)
        if (!calm) pPlate.add(v.set(Math.sin(time * 0.31) * 0.08, Math.sin(time * 0.53) * 0.05, 0))
        pos.lerp(pPlate, plateW)
        S = mix(S, (0.78 * r.width * upx) / SL, plateW)
        tYaw = mix(tYaw, 0, plateW)
        tPitch += wrap(0 - tPitch) * plateW
        tRoll = mix(tRoll, 0.45, plateW)
      }
    }

    // ---------- Màn cuối: hồ → vượt thác → tan thành ánh vàng ----------
    FINALE(fin, fk)
    toWorld(stageX(fk[0]), stageY(fk[1]), 0, pFin)
    if (fw > 0) {
      S = mix(S, 0.5 * fitV, fw)
      tYaw = mix(tYaw, 0, fw)
      tPitch += wrap(fk[2] - tPitch) * fw
      tRoll = mix(tRoll, fk[3], fw)
    }

    // ---------- Nhịp bơi: không đều như cá thật — quẫy mạnh, lướt, quẫy; cuộn nhanh thì quẫy gấp ----------
    const push = clamp(Math.abs(secV) * 0.8)
    const drive = calm ? 0 : 0.5 + 0.5 * Math.sin(time * 0.52 + Math.sin(time * 0.19) * 1.6)
    const ampT = mix(calm ? 0.3 : 0.4 + 0.25 * drive + 0.2 * push, calm ? 0.4 : fk[4], fw)
    const rate = mix(calm ? 1.2 : 2 + 1.1 * drive + 2.6 * push, calm ? 2 : fk[5], fw)
    sw.amp += (ampT - sw.amp) * damp(3)
    sw.spread += ((calm ? 0.01 : 0.02 + 0.03 * push) - sw.spread) * damp(4)
    sw.flap = calm ? 0.03 : 0.035 + 0.025 * drive
    // Cú quẫy mạnh nhanh, thì hồi chậm.
    sw.phase += dt * rate * (1 + 0.25 * Math.cos(sw.phase))
    // Đỉnh cú nhảy: cả thân cong lại như cánh cung.
    sw.curl = 0.2 * fw * smooth(0.36, 0.41, fin) * (1 - smooth(0.44, 0.5, fin))

    // Mở màn: cá từ sâu bên trái bơi vào tấm tiêu bản (~3 giây).
    const e = calm ? 1 : 1 - (1 - clamp((time - 0.3) / 3.2)) ** 3
    if (e < 1) {
      v.set(-9, -1.5, -8)
      tYaw += Math.atan2(8, 9) * (1 - e) * 0.8
      pos.addScaledVector(v, 1 - e)
    }
    const opacity = clamp((time - 0.3) / 1.6) * (hz ? 1 : mix(0.6, 1, Math.max(plateW, fw)))

    // ---------- Hướng: đuổi theo đích có quán tính; rẽ thì nghiêng và uốn thân ----------
    const k = opacity < 0.01 || first ? 1 : damp(4)
    first = false
    const dYaw = wrap(tYaw - yaw) * k
    const dPitch = wrap(tPitch - pitch) * k
    yaw += dYaw
    pitch += dPitch
    roll += wrap(tRoll - roll) * k
    const turn = (hz ? dYaw : dPitch) / Math.max(dt, 1e-3)
    bank += (clamp(-0.35 * turn, -0.5, 0.5) * (1 - fw) - bank) * damp(3)
    sw.bend += (clamp(-0.9 * turn, -1, 1) + (calm ? 0 : Math.sin(time * 0.31) * 0.2) * (1 - fw) - sw.bend) * damp(2.5)
    fish.rotation.set(roll + bank + (calm ? 0 : Math.sin(time * 0.5) * 0.05), yaw, pitch)

    if (fw > 0) pos.lerp(pFin, fw)
    // Mỗi cú quẫy đẩy thân lao tới một chút.
    if (!calm) pos.add(v.set(0.08 * sw.amp * Math.sin(2 * sw.phase) * S * (1 - fin), 0, 0).applyQuaternion(fish.quaternion))
    fish.position.copy(pos)
    fish.scale.setScalar(S)
    fish.updateMatrixWorld(true)
    vel.copy(pos).sub(last).divideScalar(Math.max(dt, 1e-3))
    last.copy(pos)

    // Cá thẫm lại như mực ướt ở đỉnh cú nhảy rồi tan từ đuôi lên đầu thành vệt mực loang.
    const glow = fw * smooth(0.37, 0.44, fin)
    // Dọc: cuộn qua khỏi thác (sky < 0) thì cá đã hoá rồng, không quay lại bơi trên chữ chân trang.
    const gone = (sky < 0 ? 1 : fw) * smooth(0.43, 0.52, fin)
    koi.swim(sw)
    ku.uTime.value = time
    ku.uOpacity.value = opacity
    ku.uNight.value = along(NIGHT, sec) * (1 - fw)
    // Rồng, mây đổi sang sơn mài đúng chỗ nền chương đêm (mép tan khớp --fade của .night trong voyage.css).
    const nb = du.uNightR.value.set(0, 0, 1, 1)
    if (nightEl && sec > 4.5 && sec < 8.5) {
      const r = nightEl.getBoundingClientRect()
      const px = state.gl.getPixelRatio()
      if (hz) nb.set(r.left * px, r.right * px, 0.22 * W * px, 1)
      else nb.set((H - r.bottom) * px, (H - r.top) * px, 0.18 * H * px, 0)
    }
    ku.uGlow.value = glow * (1 - gone)
    ku.uDissolve.value = gone
    ku.uViewH.value = H * state.gl.getPixelRatio()
    ku.uShadowA.value = 0.32 * (1 - fw * smooth(0.1, 0.17, fin))
    fish.visible = !free && gone < 0.999

    // ---------- Rồng: tuôn ra từ đỉnh cú nhảy, đầu trước đuôi sau, rồi giữ thế trên đường vẽ ----------
    const born = fw * smooth(0.42, 0.45, fin)
    // Thành hình trọn vẹn thì cất cánh: từ đây rồng thay cá trên cả trang. Vệt bay lấy đúng dáng đang giữ nên không giật.
    if (!free && born > 0 && fw > 0.5 && fin > 0.8 && flight) {
      free = seeded = true
      try {
        sessionStorage.setItem(DRAGON_KEY, '1')
      } catch {}
      document.documentElement.dataset.dragon = ''
      const R = DL + 1.2 + (calm ? 0 : 0.35 * Math.sin(time * 0.45))
      const off = dragon.group.position
      for (let k = TRAIL - 1; k >= 0; k--) addTrail(flightPath(R - (k * TH) / Sd, ta).multiplyScalar(Sd).add(off))
      flightPath(R, head).multiplyScalar(Sd).add(off)
      headV.copy(head).sub(tp(1, ta)).setLength(calm ? 0 : 1.2)
      Sf = Sd
    }
    if (free) {
      // Tâm vòng lượn: theo chương → tấm tiêu bản ở trang đầu → quanh trăng ở chương đêm → bầu trời thác ở màn cuối.
      let [cx, cy, rx, ry, St] = (hz ? DR_HZ : DR_VT)(sec, dk)
      // Màn ngang mà vuông (1024×768): cột chữ hẹp và thấp hơn → rồng nhỏ lại để nằm gọn dải núi.
      St *= Math.sqrt(fitV) * (hz ? Math.min(1, aspect / 1.6) : 1)
      cx += clamp(secV * 0.03, -0.08, 0.08) * (hz ? 1 : 0)
      if (plateR && plateW > 0) {
        cx = mix(cx, (plateR.left + plateR.width / 2) / W, plateW)
        cy = mix(cy, (plateR.top + plateR.height / 2) / H, plateW)
        rx = mix(rx, (0.3 * plateR.width) / W, plateW)
        ry = mix(ry, (0.2 * plateR.height) / H, plateW)
        St = mix(St, (0.9 * plateR.width * upx) / DL, plateW)
      }
      // Chương đêm: rồng vờn trăng như vờn ngọc, vòng elip quanh trăng (dưới thì gần, trên thì xa), không lượn qua cột chữ.
      let moonW = 0
      if (moon && sec > 5.2 && sec < 7.4) {
        const r = moon.getBoundingClientRect()
        const mx = (r.left + r.width / 2) / W
        const my = (r.top + (r.height * 50) / 260) / H
        moonW = hz ? 1 - smooth(0.15, 0.35, Math.abs(mx - 0.4)) : 1 - smooth(0.3, 0.5, Math.abs(my - 0.45))
        if (moonW > 0) {
          cx = mix(cx, mx, moonW)
          cy = mix(cy, my + (0.08 * r.width) / H, moonW)
          // Vòng ôm sát trăng, thân dài hơn nửa vòng: đầu đuổi đuôi quanh trăng, không lấn sang cột chữ.
          rx = mix(rx, (0.5 * r.width) / W, moonW)
          ry = mix(ry, (0.3 * r.width) / H, moonW)
          St = mix(St, (1.45 * r.width * upx) / DL, moonW)
        }
      }
      // Dọc: qua khỏi thác (sky < 0) thì rồng ở lại bầu trời thác, trôi lên cùng nó, không lượn trên chữ chân trang.
      const fs = hz || sky >= 0 ? fw : 1
      if (fs > 0) {
        const st = hz ? DR_STAGE_HZ : DR_STAGE_VT
        cx = mix(cx, stageX(st[0]), fs)
        cy = mix(cy, stageY(st[1]), fs)
        rx = mix(rx, st[2], fs)
        ry = mix(ry, st[3], fs)
        St = mix(St, DRAGON_SD * Math.sqrt(fitV), fs)
      }
      // Số 8 nằm ngang, vòng gần vòng xa: hai lần cắt nhau ở hai độ sâu khác nhau nên rồng lượn qua trước rồi sau chính mình.
      // Nhịp không đều, cuộn nhanh thì bay gấp.
      if (!calm) phi += dt * 0.55 * (1 + 0.25 * Math.sin(time * 0.21)) * (1 + clamp(Math.abs(secV)))
      const loop = (p: number, out: THREE.Vector3) => toWorld(cx + rx * Math.sin(p), cy + ry * mix(Math.sin(2 * p), Math.cos(p), moonW), calm ? 0 : 1.5 * Math.cos(p), out)
      loop(phi, tgt)
      if (!seeded) {
        // Tải lại trang khi đã là rồng: rồng có mặt ngay trên vòng lượn (khung tiêu bản không trống), thân nằm sẵn theo vòng.
        seeded = true
        addTrail(loop(phi - 6, head))
        for (let p = phi - 6; p < phi; p += 0.01) {
          loop(p, head)
          follow()
        }
        head.copy(tgt)
        follow()
        Sf = St
      }
      // Đầu đuổi theo đích bằng lò xo tắt dần tới hạn: có quán tính, vào cua tròn, không vọt quá.
      for (let left = dt; left > 1e-6; left -= 1 / 120) {
        const h = Math.min(left, 1 / 120)
        headV.addScaledVector(vv.subVectors(tgt, head), 5 * h).multiplyScalar(1 - 4.5 * h)
        head.addScaledVector(headV, h)
      }
      follow()
      Sf += (St - Sf) * damp(2)
      dragon.group.visible = true
      dragon.group.scale.setScalar(Sf)
      dragon.group.position.set(0, 0, 0)
      // "Lên" lệch ngang một chút: lúc lao thẳng đứng rồng vẫn nghiêng nửa mặt, không chĩa đỉnh đầu (cục xám) vào màn hình.
      dragon.pose(trailPath, 0, calm ? 0 : time, calm ? 0.18 : 0.5, v.set(0.45, 1, 0.35).normalize())
      du.uReveal.value = 99
      du.uGlow.value = 0
      du.uTime.value = calm ? 0 : time
      du.uGait.value = calm ? 0 : 0.2
      du.uFlow.value = calm ? 0.2 : 1
      du.uJaw.value = calm ? 0 : 0.06 * Math.sin(time * 0.7)
      // Dọc: chữ phủ cả bề ngang nên rồng chìm như nét mực nhạt sau chữ, chỉ đậm trong khung tiêu bản và trên thác.
      // Bầu trời thác trôi lên quá nửa màn hình thì rồng tan theo, chữ chân trang sạch.
      du.uOpacity.value = hz ? opacity : clamp((time - 0.3) / 1.6) * mix(0.32, 1, Math.max(smooth(0.6, 0.95, plateW), fs)) * (sky < 0 ? smooth(0.45, 0.8, stageVis) : 1)
    } else dragon.group.visible = born > 0
    if (!free && born > 0) {
      const fkey = `${W}x${H}${hz}`
      if (fkey !== flightKey) {
        flightKey = fkey
        Sd = DRAGON_SD * Math.sqrt(fitV)
        flight = new THREE.CatmullRomCurve3(
          (aspect < 1 ? FLIGHT_TALL : FLIGHT).map(([x, y, z]) => toWorld(x, y, z, new THREE.Vector3())),
          true,
          'centripetal',
        )
        flight.arcLengthDivisions = 400
        flightLen = flight.getLength()
      }
      // Thân hiện dần theo cuộn; quá chiều dài thân một chút để chóp đuôi không còn mép sáng.
      const R = (DL + 1.2) * smooth(0.43, 0.78, fin)
      // Thành hình rồi thì thở: cả thân trườn tới lui một chút trên đường vẽ, như con vật đang lơ lửng giữ thế.
      const drift = calm ? 0 : 0.35 * Math.sin(time * 0.45) * smooth(0.7, 0.85, fin)
      dragon.group.scale.setScalar(Sd)
      dragon.group.position.set(hz ? (sky / W) * 2 * TAN * 12 * aspect : 0, hz ? 0 : (-sky / H) * 2 * TAN * 12, 0)
      dragon.pose(flightPath, R + drift, calm ? 0 : time, 0.4, v.set(0.45, 1, 0.35).normalize())
      du.uReveal.value = R
      du.uGlow.value = 0.3 * (1 - smooth(0.45, 0.62, fin))
      du.uTime.value = calm ? 0 : time
      du.uGait.value = calm ? 0 : 0.2
      du.uFlow.value = calm ? 0.2 : 1
      du.uJaw.value = calm ? 0 : 0.06 * Math.sin(time * 0.7)
      du.uOpacity.value = born
    }
    // Mây cuộn qua thân: rồng ẩn hiện, chỉ lộ đầu, móng và vài khúc. Trên thác (trời hoàng hôn, không phải giấy) lòng mây
    // màu giấy thành cục bông trắng che thác, nên ở đó mây chỉ còn là làn sương mỏng, rồng lộ trọn lúc vừa hoá.
    if (dragon.group.visible && !calm) dragon.mist(time, 1 - 0.6 * fw)

    // ---------- Thác: màn nước rơi qua khe đá, đi theo sân khấu ----------
    falls.forEach((f, i) => {
      f.visible = stageVis > 0
      if (!f.visible) return
      const z = FALLS_Z[i]
      const hh = TAN * (12 - z)
      toWorld(stageX(FALLS_X), stageY((FALLS_TOP + FALLS_BOT) / 2), z, f.position)
      f.scale.set(0.24 * 2 * hh * aspect, (FALLS_BOT - FALLS_TOP) * 2 * hh, 1)
      const fu = f.material.uniforms
      fu.uTime.value = time
      fu.uSun.value = clamp(voyage.fin * 2 - 0.6)
      fu.uOpacity.value = clamp(stageVis * 4)
    })

    // ---------- Nước: bọt, giọt, khối nước trắng, sương; mực loang khi cá hoá rồng ----------
    const travel = -sky
    const wu = water.material.uniforms
    const dpr = state.gl.getPixelRatio()
    wu.uTime.value = time
    wu.uTravel.value = travel
    wu.uPx.value = upx
    wu.uHz.value = hz ? 1 : 0
    // Màn dọc hẹp: hạt nhỏ đi cùng tỉ lệ với cá, nước bắn ngang cũng hẹp lại (không thì vương khắp bề ngang điện thoại).
    wu.uScale.value = ((dpr * H) / 900) * fitV
    wu.uFoot.value = stageVis > 0 ? toWorld(0.5, stageY(0.95), 0, v).y : -1e3
    // Nắng sớm sau khe thác: rọi ngược làm ửng nước bắn quanh gờ.
    wu.uSunAt.value.set(stageX(FALLS_X) * W * dpr, (H - stageY(0.3) * H) * dpr, H * dpr)
    if (!calm && opacity > 0.05) {
      // Chân thác sủi bọt, bốc sương, giọt bắn lên.
      if (stageVis > 0) {
        footAcc += dt * 40
        for (; footAcc >= 1; footAcc--) {
          const r = Math.random()
          toWorld(stageX(FALLS_X + rand(0.11)), stageY(0.915 + rand(0.02)), 0.2, v)
          if (r < 0.45) water.emit(v, vv.set(rand(1.6), 0.3 + Math.random() * 0.4, rand(0.3)), FOAM, time, travel)
          else if (r < 0.55) water.emit(v, vv.set(rand(1), 0.4, 0), MIST, time, travel)
          else water.emit(v, vv.set(rand(2.4), 1.2 + Math.random() * 2.4, rand(0.4)), DROP, time, travel)
        }
      }
      // Quẫy ngược thác: đuôi quật nước tung trắng hai bên. (Đã là rồng thì không còn cá để vượt thác.)
      const kw = free ? 0 : fw
      const climb = kw * smooth(0.12, 0.17, fin) * (1 - smooth(0.36, 0.42, fin))
      if (climb > 0.05) {
        sprayAcc += dt * 26 * climb
        for (; sprayAcc >= 1; sprayAcc--) {
          koiAt(0.85, v)
          const side = Math.random() < 0.5 ? -1 : 1
          water.emit(v, vv.set(side * (1.2 + Math.random() * 2.2) * fitV, 0.4 + Math.random() * 1.8, rand(0.6)), SPRAY, time, travel)
          for (let j = 0; j < 2; j++) water.emit(v, vv.set(side * (1 + Math.random() * 3) * fitV, Math.random() * 3, rand(1)), DROP, time, travel)
        }
      }
      // Vọt qua gờ thác: một chùm nước tung lên quanh thân.
      if (leapArmed && fin > 0.38 && kw > 0.5) {
        leapArmed = false
        koiAt(0.6, v)
        for (let j = 0; j < 22; j++) {
          const a = Math.PI / 2 + rand(2.4)
          const s = 1.6 + Math.random() * 3
          water.emit(v, vv.set(Math.cos(a) * s * fitV, Math.sin(a) * s, rand(1)), SPRAY, time, travel)
        }
        for (let j = 0; j < 60; j++) {
          const a = Math.PI / 2 + rand(2.8)
          const s = 1.5 + Math.random() * 4.5
          water.emit(pA.copy(v).add(vv.set(rand(0.5), rand(0.5), 0)), vv.set(Math.cos(a) * s * fitV, Math.sin(a) * s, rand(1.5)), DROP, time, travel)
        }
      }
      if (fin < 0.32) leapArmed = true
      // Đang bay: nước rỏ thành giọt từ thân.
      const air = kw * smooth(0.37, 0.4, fin) * (1 - smooth(0.46, 0.5, fin))
      streamAcc += dt * 160 * air
      for (; streamAcc >= 1; streamAcc--) {
        koiAt(Math.random() * 0.8, v, rand(0.3), rand(0.2))
        water.emit(v, vv.set(vel.x * 0.4 + rand(0.6), vel.y * 0.4 + rand(0.6), rand(0.4)), DROP, time, travel)
      }
      // Cá tan: mực loang ra từ khắp thân, đuôi trước, cuộn lên chỗ rồng đang thành hình.
      const burn = kw * smooth(0.41, 0.44, fin) * (1 - smooth(0.5, 0.54, fin))
      emberAcc += dt * 140 * burn
      for (; emberAcc >= 1; emberAcc--) {
        koiAt(Math.min(1, 0.15 + Math.random() * (0.4 + 2 * gone)), v, rand(0.35), rand(0.3))
        water.emit(v, vv.set(rand(0.8), 0.2 + Math.random() * 0.8, rand(0.5)), EMBER, time, travel)
      }
      // Thỉnh thoảng nhả vài bọt khí ở miệng.
      if (!free && fw < 0.3 && time > bubbleAt) {
        bubbleAt = time + 2.5 + Math.random() * 3
        koiAt(0, v)
        for (let j = 0; j < 3 + Math.floor(Math.random() * 3); j++) water.emit(pA.copy(v).add(vv.set(rand(0.1), rand(0.1), 0)), vv.set(0.3 + rand(0.3), rand(0.2), rand(0.2)), BUBBLE, time, travel)
      }
    }
    // Chạm vào mặt nước: một chùm bọt khí nổi lên chỗ ngón tay.
    if (voyage.tap !== lastTap) {
      lastTap = voyage.tap
      if (!calm) {
        toWorld((voyage.px + 1) / 2, (1 - voyage.py) / 2, 0, pB)
        for (let j = 0; j < 20; j++) water.emit(v.copy(pB).add(vv.set(rand(0.3), rand(0.3), rand(0.3))), vv.set(rand(0.8), rand(0.6), rand(0.4)), BUBBLE, time, travel)
      }
    }
    water.flush()
    water.volume(state.gl, cam, time)

    // ---------- Đường chỉ tiêu bản ----------
    // Nhãn tiêu bản ghim vào thân cá; đã là rồng thì chỉ còn nhãn, không còn chỉ.
    const plateL = hz && !free ? (1 - smooth(0.55, 0.85, sec)) * clamp((time - 1.4) / 1.2) : 0
    if (plateL < 0.005) {
      if (svgOn) svgEl.style.opacity = '0'
      svgOn = false
      return
    }
    svgOn = true
    svgEl.style.opacity = String(plateL)
    const draw = calm ? 0 : 1 - smooth(2.4, 4, time)
    ANCHORS.forEach((an, i) => {
      const pin = pins[i]
      const ln = lines[i]
      if (!pin || !ln) return
      fish.localToWorld(koiPoint(v.copy(an.p), an.u, sw)).project(cam)
      const ax = ((v.x + 1) / 2) * W
      const ay = ((1 - v.y) / 2) * H
      const r = pin.getBoundingClientRect()
      const qx = r.left + r.width / 2
      const qy = r.top + r.height / 2
      const d = ax < qx - 30 ? `M${ax} ${ay}L${qx - 26} ${qy}H${qx}` : ay > qy + 56 ? `M${ax} ${ay}V${qy + 48}H${qx}V${qy}` : `M${ax} ${ay}H${qx}V${qy}`
      ln.path.setAttribute('d', d)
      ln.path.style.strokeDashoffset = String(draw)
      ln.dot.setAttribute('cx', String(ax))
      ln.dot.setAttribute('cy', String(ay))
    })
  }

  return {
    tick,
    dispose() {
      scene.remove(fish, dragon.group, ...falls, water.points, water.veil)
      koi.dispose()
      dragon.dispose()
      falls.forEach((f) => (f.geometry.dispose(), f.material.dispose()))
      water.dispose()
      delete document.documentElement.dataset.scene
      delete document.documentElement.dataset.dragon
      svgEl.style.opacity = '0'
    },
  }
}
