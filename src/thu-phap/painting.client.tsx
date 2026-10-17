'use client'

import { useEffect, useRef } from 'react'
import type { Engine } from './ink/engine'
import type { Anchor } from './ink/scene'
import type { Pt } from './ink/stroke'
import { PAINT_Q, STOPS, TOTAL, clamp, journey, smooth, unit, vAtF, type Cam } from './layout'

interface Box {
  x: number
  y: number
  w: number
  h: number
}

/**
 * Một canvas cố định sau chữ. Cuộn trang gốc (không chiếm bánh xe chuột) điều khiển mọi thứ:
 * - Màn lớn: tờ tranh .tp-world trượt/phóng theo máy quay journey(v); canvas vẽ cùng máy quay đó.
 * - Màn khác: trang dọc bình thường, canvas vẽ theo toạ độ trang; màn thác dính màn hình.
 * Nét vẽ hiện dần theo thước "draw" (px cuộn), lùi lại thì thu về.
 */
export default function Painting() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const root = canvas?.closest<HTMLElement>('.tp')
    const scroller = root?.querySelector<HTMLElement>('.tp-scroll')
    const world = root?.querySelector<HTMLElement>('.tp-world')
    const falls = root?.querySelector<HTMLElement>('.tp-falls')
    const fstage = root?.querySelector<HTMLElement>('.tp-fstage')
    const finText = root?.querySelector<HTMLElement>('.tp-fin-text')
    if (!canvas || !root || !scroller || !world || !falls || !fstage || !finText) return
    let paint = false

    // Chữ hiện khi vào khung nhìn (cả hai chế độ, kể cả không có WebGL). Màn lớn: chữ cuối do tiến độ hoá rồng quyết định (tick).
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (!e.isIntersecting || (paint && e.target === finText)) continue
          ;(e.target as HTMLElement).dataset.in = ''
          io.unobserve(e.target)
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    root.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el))

    let gl2 = false
    try {
      const gl = document.createElement('canvas').getContext('webgl2')
      gl2 = !!gl
      gl?.getExtension('WEBGL_lose_context')?.loseContext()
    } catch {
      gl2 = false
    }
    if (!gl2) {
      root.dataset.flat = ''
      return () => io.disconnect()
    }

    const paintMq = matchMedia(PAINT_Q)
    const rmMq = matchMedia('(prefers-reduced-motion: reduce)')
    let engine: Engine | null = null
    let dead = false
    let U = 1, u = 1, cw = 1, ch = 1, K = 1
    let cams: Cam[] = []
    // Khối chữ tan vào giấy khi chạm mép khung (màn rộng hơn 16:9 thì khung thấy cả chữ của trạm bên cạnh, bị mép cắt ngang).
    // Máy quay lùi xa (cổng thác, hoá rồng) thì chữ cỡ thường cũng tan, chỉ chữ màn cuối (in to gấp đôi) ở lại.
    // Bỏ chữ màn đầu (.reveal tự lo độ mờ) và con dấu (opacity riêng).
    const blocks = Array.from(world.querySelectorAll<HTMLElement>('.p:not(.reveal):not(.tp-stamp)'), (el) => ({
      el, b: null as Box | null, s: '', near: !el.closest('.tp-fin'),
    }))
    let fallsTop = 0, fallsLeft = 0, span = 1
    let ys = scrollY
    let wind = 0
    let tr = ''
    let stamp = false
    let hashDone = false

    /** Vị trí cuộn đầu tiên mà khối lọt vào khung (lim: 1 = vừa chạm mép, nhỏ hơn = vào sâu hơn). */
    const visP = (b: Box, lim: number) => {
      const cx = (b.x + b.w / 2) / U, cy = (b.y + b.h / 2) / U, rw = b.w / 2 / U, rh = b.h / 2 / U
      let best = 0, bm = Infinity
      for (let i = 0; i < cams.length; i++) {
        const c = cams[i]
        const m = Math.max(Math.max(0, Math.abs(cx - c.x) - rw) / (cw / (2 * U * c.z)), Math.max(0, Math.abs(cy - c.y) - rh) / (ch / (2 * U * c.z)))
        if (m < lim) return i * 0.01 * ch
        if (m < bm) {
          bm = m
          best = i
        }
      }
      return best * 0.01 * ch
    }

    /** Đo điểm neo → toạ độ thế giới + cửa sổ vẽ. */
    const measure = (): Anchor[] => {
      const fr = fstage.getBoundingClientRect()
      if (!paint) {
        const r = falls.getBoundingClientRect()
        fallsTop = r.top + scrollY
        fallsLeft = r.left + scrollX
        span = Math.max(1, falls.offsetHeight - fstage.offsetHeight)
      }
      const tOfF = (f: number) => (paint ? vAtF(f) * ch : fallsTop + span * f)
      const rm = rmMq.matches
      return Array.from(root.querySelectorAll<HTMLElement>(paint ? '.a[data-p]' : '.a[data-v]'), (el, i) => {
        const ds = el.dataset
        const group = el.closest('.tp-fstage') ? 1 : 0
        let b: Box
        if (paint) {
          const n = (k: string) => (parseFloat(el.style.getPropertyValue(k)) || 0) * U
          b = { x: n('--x'), y: n('--y'), w: n('--w'), h: n('--h') }
        } else {
          const r = el.getBoundingClientRect()
          b = group
            ? { x: r.left - fr.left + fallsLeft, y: r.top - fr.top + fallsTop, w: r.width, h: r.height }
            : { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height }
        }
        const o = Number(ds.o ?? 0), d = Number(ds.d ?? 1)
        const f = ds.f?.split(' ').map(Number)
        let t0: number, t1: number
        // Giảm chuyển động: không vẽ dần; nét theo hoá rồng (vòng Ensō) hiện một lần ở cuối cửa sổ, nét khác hiện sẵn.
        if (f) {
          t0 = tOfF(f[rm ? 1 : 0])
          t1 = tOfF(f[1])
        } else if (rm) {
          t0 = t1 = -K
        } else {
          // Suối chạy tới mép khung là phải có nước; vật khác vào hẳn khung mới vẽ.
          const vis = paint ? visP(b, ds.art === 'wp' ? 1 : 0.9) : group ? fallsTop - 0.5 * ch : b.y - 0.8 * ch
          t0 = vis <= 0 ? -K + o * 0.11 * ch : vis + (ds.art === 'wp' ? 0 : o * 0.08 * ch)
          t1 = t0 + 0.35 * ch * d
        }
        // Lớp sâu đứng đúng chỗ đã đặt khi máy quay ở khung dừng gần nhất (dọc: khi vật ở giữa màn hình).
        const mx = b.x + b.w / 2, my = b.y + b.h / 2
        const stop = STOPS.reduce((p, c) => (Math.hypot(c.x * U - mx, c.y * U - my) < Math.hypot(p.x * U - mx, p.y * U - my) ? c : p))
        const home: Pt = paint ? [stop.x * U, stop.y * U] : [cw / 2, my]
        return {
          art: ds.art ?? '', ...b, o, d, f, group, t0, t1, home,
          par: group ? 0 : Number(ds.par ?? 0),
          seed: ds.seed ? Number(ds.seed) : 100 + i,
          tone: Number(ds.tone ?? 1),
          gap: Number(ds.gap ?? 0.45),
          over: ds.over !== undefined,
        }
      })
    }

    // ---------- Máy quay & điều hướng (chỉ màn lớn) ----------
    /** Khối chữ trong tờ tranh, đơn vị U (offset không tính transform). */
    const boxU = (el: HTMLElement): Box | null => {
      let x = 0, y = 0
      let n: HTMLElement | null = el
      while (n && n !== world) {
        x += n.offsetLeft
        y += n.offsetTop
        n = n.offsetParent as HTMLElement | null
      }
      return n === world ? { x: x / U, y: y / U, w: el.offsetWidth / U, h: el.offsetHeight / U } : null
    }
    /** Điểm xa nhất của khối so với nửa khung nhìn: ≤ 1 là lọt khung. Mép trên lùi xuống dưới logo / nút Zalo cố định (64px). */
    const far = (c: Cam, b: Box) => {
      const hh = ch / (2 * U * c.z)
      return Math.max((Math.abs(b.x + b.w / 2 - c.x) + b.w / 2) / (cw / (2 * U * c.z)), (b.y + b.h - c.y) / hh, (c.y - b.y) / (hh - 64 / (U * c.z)))
    }
    /** Vị trí cuộn gần nhất mà khối nằm trọn trong khung, chữ đúng cỡ đọc (màn cuối chữ gấp đôi nên đọc ở độ phóng 0.5). */
    const bestV = (b: Box, from: number, scale: number) => {
      let best = -1, bs = Infinity, fb = 0, fm = Infinity
      for (let i = 0; i < cams.length; i++) {
        const c = cams[i], m = far(c, b)
        if (m < fm) {
          fm = m
          fb = i
        }
        if (m > 0.9) continue
        const s = Math.abs(Math.log(c.z * scale)) + 0.05 * Math.abs(i / 100 - from)
        if (s < bs) {
          bs = s
          best = i
        }
      }
      return (best < 0 ? fb : best) / 100
    }
    const go = (target: HTMLElement, smoothly: boolean) => {
      const id = target.id
      let v: number | null = id === 'dau-trang' ? 0 : id === 'chan-trang' ? TOTAL : null
      if (v === null) {
        const b = boxU(target.querySelector<HTMLElement>('.p') ?? target)
        if (!b) return
        v = bestV(b, scrollY / ch, target.closest('.tp-fin') ? 2 : 1)
      }
      scrollTo({ top: v * ch, behavior: smoothly ? 'smooth' : 'auto' })
      if (!smoothly) ys = v * ch
      if (!target.hasAttribute('tabindex')) target.tabIndex = -1
      target.focus({ preventScroll: true })
    }
    const onClick = (e: MouseEvent) => {
      if (!paint || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href^="#"]')
      const target = a && root.contains(a) ? document.getElementById(a.getAttribute('href')!.slice(1)) : null
      if (!target) return
      e.preventDefault()
      go(target, true)
    }
    // Tab tới chữ đang nằm ngoài khung → máy quay lướt tới.
    const onFocus = (e: FocusEvent) => {
      const el = e.target as HTMLElement
      if (!paint || !world.contains(el) || el.matches('[tabindex="-1"]')) return
      const from = scrollY / ch
      const fin = !!el.closest('.tp-fin')
      requestAnimationFrame(() => {
        const b = boxU(el), c = journey(from).cam
        // Chữ thường đang tan vì máy quay lùi xa (xem blocks) thì vẫn phải lướt tới.
        if (!b || (far(c, b) <= 0.9 && (fin || c.z > 0.9))) return
        scrollTo({ top: bestV(b, from, fin ? 2 : 1) * ch, behavior: 'smooth' })
      })
    }

    // ---------- Dựng lại khi đổi kích thước ----------
    const layout = () => {
      paint = paintMq.matches && gl2
      cw = canvas.clientWidth || innerWidth
      ch = canvas.clientHeight || innerHeight
      K = 1.3 * ch
      if (paint) {
        U = unit(cw, ch)
        u = U
        root.style.setProperty('--U', `${U}px`)
        scroller.style.height = `${(TOTAL + 1) * ch}px`
        cams = Array.from({ length: Math.round(TOTAL * 100) + 1 }, (_, i) => journey(i / 100).cam)
        for (const k of blocks) k.b = boxU(k.el)
      } else {
        for (const k of blocks) {
          k.el.style.removeProperty('opacity')
          k.s = ''
        }
        root.style.removeProperty('--U')
        scroller.style.height = ''
        world.style.transform = ''
        tr = ''
        u = clamp(cw / 55, 6.5, 12)
        // Trả chữ cuối về cho IntersectionObserver (quan sát lại để nhận ngay trạng thái hiện tại).
        io.unobserve(finText)
        if (!('in' in finText.dataset)) io.observe(finText)
      }
      ys = scrollY
      if (!engine) return
      engine.size(cw, ch)
      engine.build(measure(), u, ch)
      if (!hashDone && paint && location.hash) {
        const t = document.getElementById(decodeURIComponent(location.hash.slice(1)))
        if (t && root.contains(t)) go(t, false)
      }
      hashDone = true
    }
    let pending = 0
    const relayout = () => {
      clearTimeout(pending)
      pending = window.setTimeout(layout, 120)
    }
    const ro = new ResizeObserver(relayout)
    ro.observe(root)
    addEventListener('resize', relayout)
    paintMq.addEventListener('change', relayout)
    rmMq.addEventListener('change', relayout)
    document.fonts?.ready.then(() => !dead && relayout())
    root.addEventListener('click', onClick, true)
    root.addEventListener('focusin', onFocus)
    layout()

    import('./ink/engine')
      .then(({ createEngine }) => {
        if (dead) return
        engine = createEngine(canvas)
        layout()
      })
      .catch(() => {
        if (dead) return
        gl2 = false
        root.dataset.flat = ''
        layout()
      })

    // ---------- Vòng khung hình ----------
    const born = performance.now()
    let last = born
    let raf = 0
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const reduced = rmMq.matches
      const y = scrollY
      const ys0 = ys
      let cx: number, cy: number, z: number, f: number
      let stage: Pt = [0, 0]
      if (paint) {
        ys += (y - ys) * (1 - Math.exp(-8 * dt))
        if (Math.abs(y - ys) < 0.5) ys = y
        const j = journey(ys / ch)
        z = j.cam.z
        f = j.f
        const flatZ = Math.abs(z - 1) < 1e-4
        const tx = cw / 2 - j.cam.x * U * z, ty = ch / 2 - j.cam.y * U * z
        const rx = flatZ ? Math.round(tx) : tx, ry = flatZ ? Math.round(ty) : ty
        const s = flatZ ? `translate3d(${rx}px,${ry}px,0)` : `translate3d(${rx.toFixed(2)}px,${ry.toFixed(2)}px,0) scale(${z.toFixed(4)})`
        if (s !== tr) {
          world.style.transform = s
          tr = s
        }
        cx = (cw / 2 - rx) / z
        cy = (ch / 2 - ry) / z
        for (const k of blocks) {
          const s = k.b ? ((1 - smooth(0.97, 1, far(j.cam, k.b))) * (k.near ? smooth(0.62, 0.9, z) : 1)).toFixed(2) : '1.00'
          if (s !== k.s) {
            k.el.style.opacity = s
            k.s = s
          }
        }
      } else {
        ys = y
        cx = cw / 2
        cy = y + ch / 2
        z = 1
        stage = [0, clamp(y - fallsTop, 0, span)]
        f = clamp((y - fallsTop) / span)
      }
      if (paint) {
        const on = 'in' in finText.dataset
        if (!on && f > 0.88) finText.dataset.in = ''
        else if (on && f < 0.82) delete finText.dataset.in
      }
      if (!stamp && f > 0.93) {
        stamp = true
        root.dataset.stamp = ''
      } else if (stamp && f < 0.9) {
        stamp = false
        delete root.dataset.stamp
      }
      if (!engine) return
      // Gió: cuộn càng nhanh cỏ cây càng ngả; buông tay thì đứng lại từ từ.
      const vel = dt > 0 ? (ys - ys0) / dt : 0
      wind += (clamp(vel / (ch * 1.5), -1, 1) - wind) * (1 - Math.exp(-4 * dt))
      const intro = clamp((now - born) / 3200)
      engine.frame({
        cx, cy, z, f, stage, dt, reduced, wind,
        lim: paint ? [40 * U, 40 * U] : [ch, ch],
        t: (now - born) / 1000,
        draw: reduced ? ys : ys - K * (1 - intro) ** 3,
        follow: paint ? [cx, cy] : [cw * 0.5, y + ch * 0.55],
      })
    }
    raf = requestAnimationFrame(tick)

    return () => {
      dead = true
      cancelAnimationFrame(raf)
      clearTimeout(pending)
      io.disconnect()
      ro.disconnect()
      removeEventListener('resize', relayout)
      paintMq.removeEventListener('change', relayout)
      rmMq.removeEventListener('change', relayout)
      root.removeEventListener('click', onClick, true)
      root.removeEventListener('focusin', onFocus)
      engine?.dispose()
      engine = null
      root.style.removeProperty('--U')
      scroller.style.height = ''
      world.style.transform = ''
      for (const k of blocks) k.el.style.removeProperty('opacity')
      delete root.dataset.stamp
    }
  }, [])

  return <canvas ref={ref} className="tp-canvas" aria-hidden />
}
