import { Mail, Menu, MessageCircle, Phone } from 'lucide-react'
import { CONTACT, CONTACT_SECTION, FLOATING_CTA, NAV, NAV_CTA, UI } from '../content/vi'

/** Ensō: một nét cọ tròn chưa khép. Nét dày mỏng nhờ hai vòng lệch tâm. */
export function Enso({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden fill="none" stroke="currentColor" strokeLinecap="round">
      <circle cx="50" cy="50" r="38" strokeWidth="9" pathLength={1} strokeDasharray="0.86 1" transform="rotate(-62 50 50)" />
      <circle cx="51.5" cy="49" r="36" strokeWidth="3.5" pathLength={1} strokeDasharray="0.7 1" transform="rotate(-40 50 50)" opacity=".55" />
    </svg>
  )
}

const ICON = [MessageCircle, Phone, MessageCircle, Mail]

/** Thanh trên cùng. base: trang con neo về trang chủ ("/"); active: mục luôn sáng trên trang con. */
export function Header({ base = '', active }: { base?: string; active?: string }) {
  return (
    <header
      className={`pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-3 bg-gradient-to-b from-paper from-55% to-transparent px-5 py-4 sm:px-6 hz:px-[4vw] hz:py-5 ${base ? '' : 'hz:bg-none'}`}
    >
      <a href={`${base}#dau-trang`} data-ink className="pill pointer-events-auto flex shrink-0 items-center gap-2.5 rounded-full border border-ink/10 bg-paper/60 py-1 pl-1 pr-4 backdrop-blur-md" aria-label={UI.home}>
        <span className="relative grid size-9 place-items-center">
          <Enso className="absolute inset-0" />
          <span className="size-2 rounded-[1px] bg-son" />
        </span>
        <span className="font-display text-[1.4rem] italic leading-none tracking-[-0.01em]">EnsoTech Studio</span>
      </a>
      <div className="flex items-center gap-2">
        <nav aria-label={UI.menu} data-ink className="pill pointer-events-auto hidden rounded-full border border-ink/10 bg-paper/60 p-1 backdrop-blur-md lg:block">
          <ul className="flex">
            {NAV.map((n) => (
              <li key={n.id}>
                <a
                  href={`${base}#${n.id}`}
                  data-nav={n.id}
                  data-active={n.id === active ? '' : undefined}
                  className="relative block rounded-full px-4 py-2 text-[0.88rem] text-ink/70 transition-colors hover:text-ink data-[active]:bg-ink data-[active]:text-paper"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a
          href={CONTACT.zaloHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={NAV_CTA}
          className="btn btn-son pointer-events-auto min-h-11 px-3.5 text-[0.9rem] [@media(min-width:420px)]:px-4"
        >
          <MessageCircle className="size-[1.05rem]" aria-hidden />
          <span className="hidden [@media(min-width:420px)]:inline">{NAV_CTA}</span>
        </a>
        <button
          type="button"
          popoverTarget="nav-pop"
          aria-label={UI.menu}
          className="pointer-events-auto grid size-11 place-items-center rounded-full border border-ink/15 bg-paper/70 backdrop-blur-md lg:hidden"
        >
          <Menu className="size-5" aria-hidden />
        </button>
        <nav id="nav-pop" popover="auto" aria-label={UI.menu} className="pop pointer-events-auto inset-auto right-5 top-[4.5rem] w-60 lg:hidden">
          <ul>
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`${base}#${n.id}`} className="block rounded-md px-4 py-3 text-[1rem] hover:bg-ink/5">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}

/** Thước hành trình ở đáy màn hình (chỉ khi đi ngang): chương, quãng đã bơi, cá chép tí hon, khoảng cách tới Vũ Môn. */
export function Hud() {
  return (
    <div aria-hidden className="pointer-events-none fixed bottom-6 left-[4vw] right-[calc(4vw+12rem)] z-30 hidden items-center gap-5 text-[0.72rem] text-wash hz:flex">
      <span data-hud-num data-ink className="w-14 tabular-nums tracking-[0.08em] text-ink">
        01 / 10
      </span>
      <span data-ink className="hud-line relative h-px flex-1 bg-ink/15">
        <span data-hud-bar className="absolute inset-0 origin-left scale-x-0 bg-ink" />
        <svg data-hud-fish data-ink viewBox="0 0 44 18" className="absolute -top-[9px] left-0 h-[18px] w-[44px] -translate-x-1/2 text-ink">
          <g className="hud-koi">
            <path fill="currentColor" d="M2 9c2-3 3-6 1-8 3 0 6 3 7 6 4-3 11-4 18-3 7 1 12 3 13 5-1 2-6 4-13 5-7 1-14 0-18-3-1 3-4 6-7 6 2-2 1-5-1-8Z" />
            <circle cx="35" cy="8" r="1.4" fill="#C9A14A" />
            <rect x="30" y="4.2" width="3" height="3" fill="#B8322A" transform="rotate(45 31.5 5.7)" />
          </g>
          {/* Đã hoá rồng (html[data-dragon]): rồng tí hon thay cá. */}
          <g className="hud-dragon">
            <path fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" d="M3 11.5c2.5 0 3.5-5 7-5s4.5 6.5 8 6.5 4.5-6.5 8-6.5 4 3.5 7.5 3.5" />
            <path fill="currentColor" d="M32 8.2c2.6-1.6 6.6-1.5 9.6.6-1.4.9-3.6 2.4-6.4 2.4-1.5 0-2.6-.6-3.2-1.4Z" />
            <path fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" d="M34.5 7.6l-1.2-4.2M36.6 7.1l.6-4M41.5 9.4c1 .8 1.6 2 1.4 3.4" />
            <circle cx="38.4" cy="8.4" r="0.85" fill="#C9A14A" />
          </g>
        </svg>
        <span data-hud-hint className="absolute left-12 top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-ink transition-opacity duration-700">
          <span className="relative h-6 w-4 rounded-full border border-ink/50 bg-paper">
            <span className="absolute left-1/2 top-1 h-1.5 w-px -translate-x-1/2 animate-bounce bg-son" />
          </span>
          <svg viewBox="0 0 24 24" className="size-4 animate-pulse" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 12h14m-5-5 5 5-5 5" />
          </svg>
        </span>
      </span>
      <span data-hud-label data-ink className="min-w-40 text-right tabular-nums text-ink" />
    </div>
  )
}

/** Nút liên hệ nổi dùng popover gốc (tự đóng khi bấm ra ngoài / Esc). Engine ẩn nó ở trang đầu và từ phần Liên hệ trở đi. */
export function FloatingCta() {
  return (
    <div
      data-cta
      data-hide
      className="fixed bottom-4 right-4 z-30 transition duration-500 data-[hide]:pointer-events-none data-[hide]:translate-y-4 data-[hide]:opacity-0 hz:right-[4vw]"
    >
      <button type="button" popoverTarget="cta-pop" className="btn btn-son rounded-full pl-2 pr-5 shadow-lg">
        <span className="grid size-9 place-items-center rounded-full bg-paper/15">
          <MessageCircle className="size-[1.1rem]" aria-hidden />
        </span>
        {FLOATING_CTA}
      </button>
      <ul id="cta-pop" popover="auto" className="pop inset-auto bottom-20 right-4 w-[min(20rem,calc(100vw-2rem))] space-y-0.5 hz:right-[4vw]">
        {CONTACT_SECTION.channels.map((c, i) => {
          const I = ICON[i]
          return (
            <li key={c.href}>
              <a
                href={c.href}
                {...(c.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-ink/5"
              >
                <I className="size-4 shrink-0 text-cham" aria-hidden />
                <span>
                  <span className="block text-[0.72rem] text-wash">{c.label}</span>
                  <span className="block text-[0.92rem] font-semibold">{c.value}</span>
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
