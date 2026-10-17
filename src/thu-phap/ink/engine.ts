import * as THREE from 'three'
import { clamp, ease, smooth } from '../layout'
import { drawDragon, dragonPath } from './dragon'
import { Koi, splash } from './koi'
import { drawLife } from './life'
import { buildScene, type Anchor, type Scene } from './scene'
import { InkBatch, Path, inkMaterial, inkUniforms, resample, stepOf, type Pt } from './stroke'

/** Trạng thái một khung hình do painting.client tính. Toạ độ là px thế giới (tờ giấy). */
export interface Frame {
  /** Tâm khung nhìn và độ phóng. */
  cx: number
  cy: number
  z: number
  /** Thước vẽ: nét nào có t0 < draw thì đã hiện. */
  draw: number
  /** Độ dời của sân khấu màn cuối (màn dọc: sân khấu dính màn hình). */
  stage: Pt
  /** Tiến độ hoá rồng 0..1. */
  f: number
  t: number
  dt: number
  reduced: boolean
  /** Điểm cá bám theo dọc suối. */
  follow: Pt
  /** Gió do cuộn (−1..1): cỏ cây ngả, hoa rơi bị hắt ngang. */
  wind: number
  /** Độ trôi tối đa của lớp sâu (px), mỗi trục. */
  lim: Pt
}

export type Engine = ReturnType<typeof createEngine>

export function createEngine(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
  const scene = new THREE.Scene()
  const cam = new THREE.OrthographicCamera(0, 1, 0, 1, 0.1, 100)
  cam.position.z = 10
  const uniforms = inkUniforms()
  const mat = inkMaterial(uniforms)
  const mesh = (b: InkBatch, order: number) => {
    const m = new THREE.Mesh(b.geometry, mat)
    m.renderOrder = order
    m.frustumCulled = false
    scene.add(m)
    return m
  }
  const koiB = new InkBatch(8000, true), splB = new InkBatch(6000, true), drB = new InkBatch(60000, true), lifeB = new InkBatch(60000, true)
  mesh(lifeB, 0.5)
  mesh(koiB, 1)
  mesh(splB, 2)
  mesh(drB, 3)
  // Dịch shader ở luồng nền (KHR_parallel_shader_compile) trong lúc dựng cảnh; chưa xong thì chưa vẽ,
  // khỏi khựng ~1 giây ở khung đầu. Máy không có tiện ích đó hoặc lỗi thì cứ vẽ, three tự dịch đồng bộ như cũ
  // (hỏi has() trước: compileAsync tự gọi get() và in cảnh báo ra console trên máy thiếu tiện ích).
  let ready = !renderer.extensions.has('KHR_parallel_shader_compile')
  if (!ready)
    renderer.compileAsync(scene, cam).then(
      () => (ready = true),
      () => (ready = true),
    )

  let statics: THREE.Mesh[] = []
  let sc: Scene | null = null
  let koi: Koi | null = null
  let dragon: ReturnType<typeof dragonPath> | null = null
  let climb: Path | null = null
  let u = 0
  let w = 1, h = 1
  let gust = 0

  return {
    /** Đã có cảnh và shader dịch xong: khung kế tiếp sẽ vẽ thật. */
    get ready() {
      return ready && !!sc
    },

    size(cw: number, ch: number) {
      w = Math.max(1, cw)
      h = Math.max(1, ch)
      renderer.setSize(w, h, false)
    },

    build(anchors: readonly Anchor[], unit: number, vh: number) {
      for (const m of statics) {
        scene.remove(m)
        m.geometry.dispose()
      }
      statics = []
      sc = buildScene(anchors, unit, vh)
      for (const [list, order] of [[sc.back, 0], [sc.front, 4]] as const) {
        if (!list.length) continue
        const ps = list.map((s) => resample(s.pts, stepOf(s)))
        const b = new InkBatch(ps.reduce((n, p) => n + p.length, 0))
        list.forEach((s, i) => b.add(s, ps[i]))
        b.commit()
        statics.push(mesh(b, order))
      }
      if (unit !== u || !koi) koi = new Koi(unit)
      u = unit
      const { lip, pool, sky } = sc
      dragon = lip && sky ? dragonPath(lip, sky, unit) : null
      // Đường vượt thác (toạ độ sân khấu): từ vũng nước bơi vào chân thác, ngược dòng lên gờ rồi vọt lên.
      climb = lip && pool ? new Path([[lip[0] - 6 * unit, pool[1] + unit], [lip[0], pool[1] - unit], lip, [lip[0] + 0.5 * unit, lip[1] - 4 * unit]], unit * 0.5) : null
    },

    frame(fr: Frame) {
      if (!sc || !ready) return
      uniforms.uDraw.value = fr.draw
      uniforms.uPx.value = fr.z * renderer.getPixelRatio()
      uniforms.uStage.value.set(fr.stage[0], fr.stage[1])
      uniforms.uCam.value.set(fr.cx, fr.cy)
      uniforms.uLim.value.set(fr.lim[0], fr.lim[1])
      uniforms.uParK.value = fr.reduced ? 0 : 1
      uniforms.uWind.value = fr.reduced ? 0 : fr.wind
      uniforms.uT.value = fr.reduced ? 0 : fr.t
      const hw = w / (2 * fr.z), hh = h / (2 * fr.z)
      cam.left = fr.cx - hw
      cam.right = fr.cx + hw
      cam.top = fr.cy - hh
      cam.bottom = fr.cy + hh
      cam.updateProjectionMatrix()

      const g = sc.stage
      const off = (p: Pt): Pt => [p[0] + fr.stage[0] * g, p[1] + fr.stage[1] * g]
      koiB.reset()
      splB.reset()
      drB.reset()

      if (koi) {
        let T: Pt = fr.follow
        let d: Pt = [1, 0]
        if (fr.f > 0 && climb) {
          T = off(climb.at(0))
          d = [0, -1]
        } else if (sc.stream) {
          const st = sc.stream
          const s = Math.min(st.L, st.nearest(fr.follow[0], fr.follow[1]) + 4 * u)
          T = st.at(s)
          const a = st.at(s - 1), b = st.at(s + 1), l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
          d = [(b[0] - a[0]) / l, (b[1] - a[1]) / l]
        }
        let lead: Pt | null = null, mix = 0
        if (climb && fr.f >= 0.08 && !fr.reduced) {
          mix = smooth(0.08, 0.11, fr.f)
          lead = off(climb.at(climb.L * ease(clamp((fr.f - 0.08) / 0.19))))
        }
        koi.update(T, d, fr.dt, fr.reduced, lead, mix)
        koi.draw(koiB, 1 - smooth(0.25, 0.32, fr.f))
      }
      if (sc.lip && !fr.reduced) splash(splB, sc.lip, fr.f, u, g)
      if (dragon) drawDragon(drB, dragon.path, fr.f, fr.t, dragon.u, fr.reduced, g)
      lifeB.reset()
      if (!fr.reduced) gust += (0.3 + 12 * fr.wind) * u * fr.dt
      const [lx, ly] = fr.lim
      drawLife(lifeB, sc.life, {
        t: fr.reduced ? 0 : fr.t, draw: fr.draw, gust, u, stream: sc.stream, streamT: sc.streamT, wind: fr.reduced ? 0 : fr.wind,
        view: [fr.cx - hw - lx, fr.cy - hh - ly, fr.cx + hw + lx, fr.cy + hh + ly],
      })
      lifeB.commit()
      koiB.commit()
      splB.commit()
      drB.commit()
      renderer.render(scene, cam)
    },

    dispose() {
      for (const m of statics) m.geometry.dispose()
      koiB.geometry.dispose()
      splB.geometry.dispose()
      drB.geometry.dispose()
      lifeB.geometry.dispose()
      mat.dispose()
      renderer.dispose()
    },
  }
}
