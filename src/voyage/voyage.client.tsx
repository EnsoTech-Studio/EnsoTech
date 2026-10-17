'use client'

import Lenis from 'lenis'
import dynamic from 'next/dynamic'
import { Component, useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react'
import { HUD } from '../content/vi'
import { HZ_QUERY, clamp, smooth, voyage } from './store'

const Scene = dynamic(() => import('./scene/canvas.client').then((m) => m.Scene), { ssr: false })

let webgl: boolean | undefined
function detectWebGL() {
  if (webgl === undefined) {
    try {
      const c = document.createElement('canvas')
      webgl = !!(c.getContext('webgl2') || c.getContext('webgl'))
    } catch {
      webgl = false
    }
  }
  return webgl
}
const noop = () => () => {}

// WebGL có thể hỏng giữa chừng (máy cũ, GPU bị tắt): bỏ cảnh 3D, nội dung vẫn nguyên vẹn.
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/**
 * Hành trình ngược dòng: cuộn dọc được đổi thành trượt ngang (màn hình rộng và đủ cao).
 * Môi trường (back: sau cá, front: mây trước cá) đi cùng các chương; cuối đường có một
 * quãng "dừng" để cuộn tiếp điều khiển màn vượt thác (voyage.fin 0 → 1).
 */
export function Voyage({ back, front, children }: { back: ReactNode; front: ReactNode; children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const gl = useSyncExternalStore(noop, detectWebGL, () => false)

  useEffect(() => startVoyage(rootRef.current!, wrapRef.current!, trackRef.current!), [])

  return (
    <div ref={rootRef} className="relative">
      <div aria-hidden className="env z-0" data-env>
        <div className="hills hz-only" />
        <div className="env-track">{back}</div>
      </div>
      {gl && (
        <SceneBoundary>
          <Scene />
        </SceneBoundary>
      )}
      <div aria-hidden className="env z-[2]" data-env>
        <div className="env-track">{front}</div>
      </div>
      <div ref={wrapRef} className="relative z-[3]">
        {/* Trang dọc: cắt mép phải (điện thoại nghiêng 3D ở chương Dự án lòi ra ~1px ở 768) mà không tạo khung cuộn. */}
        <div className="overflow-x-clip hz:sticky hz:top-0 hz:h-svh hz:overflow-clip">
          <div ref={trackRef} className="relative hz:flex hz:h-full hz:w-max">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

const pad = (n: number) => String(n).padStart(2, '0')

function startVoyage(root: HTMLElement, wrap: HTMLElement, track: HTMLElement) {
  const hzMq = matchMedia(HZ_QUERY)
  const reduceMq = matchMedia('(prefers-reduced-motion: reduce)')
  const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s)
  const envs = [...root.querySelectorAll<HTMLElement>('[data-env]')]
  const envTracks = envs.map((e) => e.querySelector<HTMLElement>('.env-track')!)
  const hills = root.querySelector<HTMLElement>('.hills')
  const finEls = [...envs, ...document.querySelectorAll<HTMLElement>('[data-fin]')]
  const hud = { num: $('[data-hud-num]'), bar: $('[data-hud-bar]'), fish: $('[data-hud-fish]'), label: $('[data-hud-label]'), hint: $('[data-hud-hint]') }
  const navLinks = [...document.querySelectorAll<HTMLElement>('[data-nav]')]
  const cta = $('[data-cta]')
  // Logo và thước hành trình nằm cố định: dải đêm trôi qua dưới chúng thì đổi sang màu giấy.
  const inks = [...document.querySelectorAll<HTMLElement>('[data-ink]')].map((el) => ({ el, l: 0, w: 0, dark: false }))
  let night = -1

  let lenis: Lenis | null = null
  let chapters: HTMLElement[] = []
  let starts: number[] = []
  let sizes: number[] = []
  let vw = 0
  let vh = 0
  let wrapTop = 0
  let max = 0 // quãng trượt ngang (hoặc quãng cuộn dọc)
  let dwell = 0 // quãng cuộn thêm cho màn vượt thác (chỉ khi đi ngang)
  let end = 0
  let stageAt = 0
  let stageLen = 0
  let x = 0

  /** Toạ độ theo trục đi của một phần tử trong track (cộng dồn offset, không dính phép dịch). */
  const at = (el: HTMLElement) => {
    let v = 0
    for (let e: HTMLElement | null = el; e && e !== track; e = e.offsetParent as HTMLElement | null) v += voyage.hz ? e.offsetLeft : e.offsetTop
    return v
  }

  const measure = () => {
    voyage.hz = hzMq.matches
    vw = innerWidth
    vh = innerHeight
    chapters = [...track.querySelectorAll<HTMLElement>('[data-chapter]')]
    const stage = track.querySelector<HTMLElement>('[data-stage]')
    if (voyage.hz) {
      max = Math.max(0, track.offsetWidth - vw)
      dwell = stage ? Math.round(vh * 1.6) : 0
      end = max + dwell
      wrap.style.height = `${end + vh}px`
    } else {
      dwell = 0
      wrap.style.height = ''
      track.style.transform = ''
      envTracks.forEach((t) => (t.style.transform = ''))
      tf = ''
    }
    starts = chapters.map(at)
    sizes = chapters.map((c) => (voyage.hz ? c.offsetWidth : c.offsetHeight))
    stageAt = stage ? at(stage) : 1e6
    stageLen = stage ? (voyage.hz ? stage.offsetWidth : stage.offsetHeight) : 0
    wrapTop = wrap.getBoundingClientRect().top + scrollY
    if (!voyage.hz) end = max = document.documentElement.scrollHeight - vh - wrapTop
    envs.forEach((e) => {
      chapters.forEach((_, k) => {
        e.style.setProperty(`--c${k}`, `${starts[k]}px`)
        e.style.setProperty(`--w${k}`, `${sizes[k]}px`)
      })
      e.style.setProperty('--cs', `${stageAt}px`)
      e.style.setProperty('--ws', `${stageLen}px`)
      e.setAttribute('data-ready', '')
    })
    if (hills) hills.style.width = voyage.hz ? `${Math.ceil(vw + max * 0.25 + 40)}px` : ''
    night = chapters.findIndex((c) => c.classList.contains('on-night'))
    inks.forEach((k) => {
      // cá trên thước chạy dọc vạch: đo vạch, vị trí cá tính theo tiến độ mỗi khung hình
      const r = (k.el === hud.fish ? k.el.parentElement! : k.el).getBoundingClientRect()
      k.l = r.left
      k.w = r.width
    })
    lenis?.resize()
  }

  const setupLenis = () => {
    voyage.reduce = reduceMq.matches
    if (voyage.reduce) {
      lenis?.destroy()
      lenis = null
    } else {
      // allowNestedScroll: khung con chỉ giữ cú cuộn khi nó còn cuộn được, hết thì trả về trang.
      lenis ??= new Lenis({ autoRaf: false, lerp: 0.085, gestureOrientation: 'both', allowNestedScroll: true })
    }
  }
  voyage.lock = (on) => (on ? lenis?.stop() : lenis?.start())

  const scrollTo = (top: number, duration: number) => {
    if (lenis) lenis.scrollTo(top, { duration, force: true, immediate: duration === 0 })
    else window.scrollTo(0, top)
  }

  /** Cuộn tới phần tử (ngang hoặc dọc), xong thì chuyển focus như liên kết neo gốc. */
  const go = (el: HTMLElement, immediate = false) => {
    const r = el.getBoundingClientRect()
    const top = voyage.hz ? wrapTop + clamp(r.left + x, 0, max) : r.top + scrollY - (el.hasAttribute('data-chapter') ? 0 : 96)
    const focus = () => {
      if (!el.matches('a,button,input,select,textarea,[tabindex]')) el.setAttribute('tabindex', '-1')
      el.focus({ preventScroll: true })
    }
    // Mở khoá trước: lenis.start() gọi reset() sẽ huỷ cú cuộn đang chạy.
    voyage.lock(false)
    if (lenis && !immediate) {
      lenis.scrollTo(top, { duration: clamp(Math.abs(top - scrollY) / 2500, 1, 2.6), force: true, onComplete: focus })
    } else {
      scrollTo(top, 0)
      focus()
    }
  }

  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const a = (e.target as Element).closest?.('a[href^="#"]')
    const id = a && decodeURIComponent(a.getAttribute('href')!.slice(1))
    const el = id && document.getElementById(id)
    if (!el) return
    e.preventDefault()
    ;(a.closest('[popover]') as HTMLElement | null)?.hidePopover?.()
    go(el)
    history.replaceState(null, '', `#${id}`)
  }

  // Tab tới phần tử nằm ngoài khung nhìn ngang → trượt tới, đặt nó ở ~30% từ mép trái.
  const onFocus = (e: FocusEvent) => {
    const el = e.target as HTMLElement
    if (!voyage.hz || !track.contains(el)) return
    // Ô tích sr-only chỉ rộng 1px: đo cả thẻ nhãn bao quanh, thứ người dùng thật sự thấy.
    const r = (el.closest('label') ?? el).getBoundingClientRect()
    const fits = r.width > vw * 0.7 ? Math.abs(r.left) < vw * 0.2 : r.left >= 0 && r.right <= vw
    if (!fits) scrollTo(wrapTop + clamp(x + r.left - vw * 0.3, 0, max), 1.2)
  }

  const onKey = (e: KeyboardEvent) => {
    if (!voyage.hz || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    if ((e.target as Element).closest?.('input,textarea,select,[contenteditable]')) return
    e.preventDefault()
    const from = lenis ? lenis.targetScroll : scrollY
    scrollTo(clamp(from + (e.key === 'ArrowRight' ? 0.8 : -0.8) * vw, 0, wrapTop + end), 1)
  }

  // Thẻ giấy (.lumen): vệt mực theo con trỏ + nghiêng 3D bằng lò xo. Chỉ chuột/bút; chạm để cuộn thì không nghiêng.
  type Spring = { x: number; y: number; vx: number; vy: number; tx: number; ty: number }
  const tilts = new Map<HTMLElement, Spring>()
  const tilt = (el: HTMLElement) => tilts.get(el) ?? tilts.set(el, { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 }).get(el)!
  const cards = [...track.querySelectorAll<HTMLElement>('.lumen')]
  const lean = { x: 0, v: 0, s: '' }
  let hovered: HTMLElement | null = null
  let ptr: { x: number; y: number } | null = null

  const hover = (cx: number, cy: number, target: Element | null) => {
    const card = target?.closest?.<HTMLElement>('.lumen') ?? null
    if (hovered && hovered !== card) Object.assign(tilt(hovered), { tx: 0, ty: 0 })
    hovered = card
    if (!card) return
    const r = card.getBoundingClientRect()
    card.style.setProperty('--mx', `${cx - r.left}px`)
    card.style.setProperty('--my', `${cy - r.top}px`)
    if (!voyage.reduce) Object.assign(tilt(card), { tx: clamp((cx - r.left) / r.width) * 2 - 1, ty: clamp((cy - r.top) / r.height) * 2 - 1 })
  }

  const onMove = (e: PointerEvent) => {
    voyage.px = (e.clientX / vw) * 2 - 1
    voyage.py = -((e.clientY / vh) * 2 - 1)
    voyage.pMoved = performance.now()
    if (e.pointerType === 'touch') return
    ptr = { x: e.clientX, y: e.clientY }
    hover(e.clientX, e.clientY, e.target as Element)
    const btn = (e.target as Element).closest?.<HTMLElement>('.btn-son')
    if (btn) {
      const r = btn.getBoundingClientRect()
      btn.style.setProperty('--bx', `${e.clientX - r.left}px`)
      btn.style.setProperty('--by', `${e.clientY - r.top}px`)
    }
  }
  const onOut = (e: PointerEvent) => {
    if (e.relatedTarget) return
    ptr = null
    hover(0, 0, null)
  }
  const onDown = (e: PointerEvent) => {
    onMove(e)
    voyage.tap = performance.now()
    const card = (e.target as Element).closest?.<HTMLElement>('.lumen')
    if (!card || voyage.reduce) return
    const r = card.getBoundingClientRect()
    const ring = document.createElement('i')
    ring.className = 'ripple'
    ring.style.cssText = `--x:${e.clientX - r.left}px;--y:${e.clientY - r.top}px`
    card.append(ring)
    setTimeout(() => ring.remove(), 1700)
  }

  /** Lò xo hơi thiếu cản (ζ≈0.6 cho nghiêng, ≈0.4 cho lực cản): thả ra thì nảy nhẹ như tờ giấy trên mặt nước. */
  const springs = (frameDt: number) => {
    // Chia bước ≤ 1/120 s: khung hình giật (dt tới 0.1 s) sẽ làm lò xo cứng này phát tán.
    const n = Math.ceil(frameDt * 120)
    const dt = frameDt / n
    tilts.forEach((s, el) => {
      for (let k = 0; k < n; k++) {
        s.vx += ((s.tx - s.x) * 140 - s.vx * 14) * dt
        s.vy += ((s.ty - s.y) * 140 - s.vy * 14) * dt
        s.x += s.vx * dt
        s.y += s.vy * dt
      }
      const rest = el !== hovered && Math.abs(s.x) + Math.abs(s.y) + Math.abs(s.vx) + Math.abs(s.vy) < 0.004
      if (rest) tilts.delete(el)
      el.style.setProperty('--tx', rest ? '0' : s.x.toFixed(3))
      el.style.setProperty('--ty', rest ? '0' : s.y.toFixed(3))
    })
    const aim = voyage.hz && !voyage.reduce ? clamp(voyage.vel / 4500, -1, 1) : 0
    for (let k = 0; k < n; k++) {
      lean.v += ((aim - lean.x) * 70 - lean.v * 7) * dt
      lean.x += lean.v * dt
    }
    const v = (Math.round(lean.x * 1000) / 1000 || 0).toFixed(3) // `|| 0` gộp -0 → 0 để khỏi ghi DOM mãi khi dao động tắt dần
    if (v !== lean.s) cards.forEach((c) => c.style.setProperty('--lean', (lean.s = v)))
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue
        en.target.setAttribute('data-in', '')
        io.unobserve(en.target)
      }
    },
    { rootMargin: '0px -6% -10% 0px' },
  )
  track.querySelectorAll('[data-reveal]:not([data-in])').forEach((el) => io.observe(el))

  // Vòng lặp khung hình: Lenis → vị trí → biến CSS/HUD. Chỉ ghi DOM khi giá trị đổi.
  let raf = 0
  let last = performance.now()
  let lastPos = 0
  let tf = ''
  let finS = ''
  let chapterNo = -1
  let labelText = ''
  let activeId: string | undefined
  let hideCta = false
  const sp: string[] = []

  const frame = (t: number) => {
    raf = requestAnimationFrame(frame)
    lenis?.raf(t)
    const dt = clamp((t - last) / 1000, 1 / 240, 0.1)
    last = t
    if (!chapters.length) return

    const y = scrollY
    let pos: number
    let gate: number
    if (voyage.hz) {
      const raw = clamp(y - wrapTop, 0, end)
      x = Math.min(raw, max)
      const s = `translate3d(${-x}px,0,0)`
      if (s !== tf) {
        tf = s
        track.style.transform = s
        envTracks.forEach((e) => (e.style.transform = s))
        if (hills) hills.style.transform = `translate3d(${-x * 0.25}px,0,0)`
      }
      pos = x
      voyage.fin = dwell ? clamp((raw - max) / dwell) : 0
      voyage.sky = stageAt - x
      voyage.progress = end > 0 ? raw / end : 0
      gate = max > 0 ? x / max : 1
    } else {
      pos = y - wrapTop
      const run = Math.max(1, stageLen - vh)
      voyage.fin = clamp((pos - stageAt) / run)
      voyage.sky = stageAt - pos + clamp(pos - stageAt, 0, run)
      voyage.progress = max > 0 ? clamp(pos / max) : 0
      gate = clamp(pos / Math.max(1, stageAt))
    }
    const center = pos + (voyage.hz ? vw : vh) / 2
    let i = 0
    while (i < chapters.length - 1 && center >= starts[i + 1]) i++
    voyage.sec = i + clamp((center - starts[i]) / sizes[i])
    voyage.travel = pos
    voyage.vel += ((pos - lastPos) / dt - voyage.vel) * Math.min(1, dt * 6)
    // Thẻ trượt qua dưới con trỏ đứng yên khi cuộn → dò lại thẻ đang được trỏ.
    if (ptr && pos !== lastPos) hover(ptr.x, ptr.y, document.elementFromPoint(ptr.x, ptr.y))
    lastPos = pos
    springs(dt)

    const f = voyage.fin.toFixed(3)
    if (f !== finS) finEls.forEach((e) => e.style.setProperty('--fin', (finS = f)))

    if (voyage.hz) {
      chapters.forEach((c, k) => {
        const v = clamp((x + vw - starts[k]) / (sizes[k] + vw)).toFixed(3)
        if (sp[k] !== v) c.style.setProperty('--sp', (sp[k] = v))
      })
    }

    const no = Math.min(chapters.length, i + 1)
    if (no !== chapterNo && hud.num) hud.num.textContent = `${pad((chapterNo = no))} / ${pad(chapters.length)}`
    if (hud.bar) hud.bar.style.scale = `${voyage.progress} 1`
    if (hud.fish) hud.fish.style.left = `${voyage.progress * 100}%`
    const fin = voyage.fin
    const label =
      fin <= 0.1 ? HUD.toGate(Math.round((1 - gate) * 1200)) : fin < 0.45 ? HUD.climb(Math.round(smooth(0.1, 0.45, fin) * 100)) : HUD.dragon
    if (label !== labelText && hud.label) hud.label.textContent = labelText = label
    if (hud.hint) hud.hint.style.opacity = voyage.progress > 0.02 ? '0' : ''
    if (night >= 0) {
      // mép dải đêm (mask tan 15vw, nới 10vw) đậm quá nửa ở khoảng 2.5vw ngoài chương
      const a = starts[night] - x - vw * 0.025
      const b = a + sizes[night] + vw * 0.05
      for (const k of inks) {
        const cx = k.l + k.w * (k.el === hud.fish ? voyage.progress : 0.5)
        const dark = voyage.hz && cx > a && cx < b
        if (dark !== k.dark) k.el.toggleAttribute('data-dark', (k.dark = dark))
      }
    }

    const id = chapters[i].id
    if (id !== activeId) {
      activeId = id
      navLinks.forEach((a) => {
        const on = a.dataset.nav === id
        a.toggleAttribute('data-active', on)
        if (on) a.setAttribute('aria-current', 'location')
        else a.removeAttribute('aria-current')
      })
    }
    // Trang đầu đã có nút liên hệ riêng; từ cuối phần Hỏi đáp trở đi biểu mẫu liên hệ ở ngay phía trước.
    const hide = voyage.sec < 0.9 || voyage.sec >= 7.75
    if (hide !== hideCta && cta) cta.toggleAttribute('data-hide', (hideCta = hide))
  }

  setupLenis()
  measure()
  raf = requestAnimationFrame(frame)

  const initial = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)))
  // Chờ font tải xong để bề rộng các chương ổn định, rồi mới đo lại (và nhảy tới neo nếu có).
  document.fonts.ready.then(() => {
    measure()
    if (initial) go(initial, true)
  })

  const ro = new ResizeObserver(measure)
  ro.observe(track)
  hzMq.addEventListener('change', measure)
  reduceMq.addEventListener('change', setupLenis)
  addEventListener('resize', measure)
  document.addEventListener('click', onClick)
  document.addEventListener('focusin', onFocus)
  addEventListener('keydown', onKey)
  addEventListener('pointermove', onMove, { passive: true })
  addEventListener('pointerdown', onDown, { passive: true })
  addEventListener('pointerout', onOut, { passive: true })

  return () => {
    cancelAnimationFrame(raf)
    lenis?.destroy()
    io.disconnect()
    ro.disconnect()
    hzMq.removeEventListener('change', measure)
    reduceMq.removeEventListener('change', setupLenis)
    removeEventListener('resize', measure)
    document.removeEventListener('click', onClick)
    document.removeEventListener('focusin', onFocus)
    removeEventListener('keydown', onKey)
    removeEventListener('pointermove', onMove)
    removeEventListener('pointerdown', onDown)
    removeEventListener('pointerout', onOut)
    voyage.lock = () => {}
  }
}
