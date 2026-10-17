import { Alegreya, Kolker_Brush } from 'next/font/google'
import { CONTACT, NAV, NAV_CTA, SITE, UI } from '../content/vi'
import { Enso } from '../voyage/chrome'

// Phần dùng chung của trang chính và trang dự án: phông, đầu trang, mép răng cưa con dấu.
const brush = Kolker_Brush({ subsets: ['latin', 'vietnamese'], weight: '400', display: 'swap', variable: '--font-brush' })
const serif = Alegreya({ subsets: ['latin', 'vietnamese'], weight: ['400', '500', '700'], display: 'swap', variable: '--font-serif' })
export const fonts = `${brush.variable} ${serif.variable}`

/** base = '' trên trang chính (neo trong trang), '/' trên trang con (về trang chính rồi tới chương). */
export function Head({ base = '', active }: { base?: string; active?: string }) {
  return (
    <header className="tp-head">
      <a href={`${base}#dau-trang`} className="tp-brand" aria-label={UI.home}>
        <span className="tp-chop" aria-hidden>
          <Enso className="size-[70%]" />
        </span>
        <span className="tp-brush whitespace-nowrap text-[length:clamp(1.25rem,5.6vw,1.9rem)] leading-none" aria-hidden>
          {SITE.name}
        </span>
      </a>
      <nav aria-label={UI.menu} className="tp-nav">
        {NAV.map((n) => (
          <a key={n.id} href={`${base}#${n.id}`} aria-current={n.id === active ? 'page' : undefined}>
            {n.label}
          </a>
        ))}
      </nav>
      <a href={CONTACT.zaloHref} target="_blank" rel="noopener noreferrer" className="seal seal-sm">
        {NAV_CTA}
      </a>
    </header>
  )
}

/** Mép con dấu son: răng cưa như dấu đóng trên giấy (filter: url(#tp-rough) trong thu-phap.css). */
export function Rough() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <filter id="tp-rough">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
        <feDisplacementMap in="SourceGraphic" scale="3.2" />
      </filter>
    </svg>
  )
}
