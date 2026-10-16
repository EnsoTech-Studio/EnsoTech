import { FOOTER, NAV, SITE } from '../content/vi'
import { Enso } from './chrome'
import { Rich } from './ui'

/**
 * Chân trang = màn cuối: thác Vũ Môn. Bầu trời, vách đá, thác dự phòng nằm ở env.tsx (sau cá);
 * ở đây chỉ có khung sân khấu [data-stage] để engine đo, và chữ chân trang.
 * Đi ngang: sân khấu phủ cả màn hình, cuộn tiếp thì cá vượt thác (voyage.fin 0 → 1), chữ nằm cột trái.
 * Dọc: sân khấu cao 240svh (cảnh dính màn hình trong lúc cuộn qua), chữ ở sau.
 */
export function Footer() {
  return (
    <footer id="chan-trang" data-chapter aria-labelledby="footer-title" className="relative shrink-0 hz:h-full hz:w-screen">
      <div data-stage className="h-[240svh] hz:absolute hz:inset-0 hz:h-auto" />
      <div className="relative px-6 pb-12 pt-16 hz:absolute hz:bottom-[max(5rem,11vh)] hz:left-[6vw] hz:top-[max(6.5rem,16vh)] hz:flex hz:w-[34vw] hz:max-w-[32rem] hz:flex-col hz:p-0">
        <p id="footer-title" className="flex items-center gap-3 font-display text-[clamp(1.8rem,2.4vw,2.6rem)] italic leading-none">
          <span className="relative grid size-11 shrink-0 place-items-center">
            <Enso className="absolute inset-0" />
            <span className="size-2.5 rounded-[1px] bg-son" />
          </span>
          {SITE.name}
        </p>
        <p className="muted mt-5 max-w-sm text-[0.95rem] leading-relaxed">{FOOTER.description}</p>

        <div className="mt-10 flex flex-wrap gap-x-12 gap-y-8 text-[0.9rem] [@media(max-height:46rem)]:mt-6">
          <nav aria-labelledby="ft-contact">
            <h2 id="ft-contact" className="eyebrow">
              {FOOTER.contactTitle}
            </h2>
            <ul className="mt-3 space-y-2">
              {FOOTER.contact.map((c) => (
                <li key={c.href}>
                  <a href={c.href} {...(c.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="link-ink break-words">
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-labelledby="ft-links">
            <h2 id="ft-links" className="eyebrow">
              {FOOTER.linksTitle}
            </h2>
            <ul className="mt-3 space-y-2">
              {NAV.map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`} className="link-ink">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 max-w-sm text-[0.82rem] leading-relaxed [@media(max-height:46rem)]:mt-5">
          <h2 className="font-semibold">{FOOTER.privacyTitle}</h2>
          <p className="muted mt-1">{FOOTER.privacy}</p>
        </div>

        <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-ink/10 pt-4 text-[0.78rem] text-wash hz:mt-auto">
          <span>{FOOTER.legal}</span>
          <Rich text={FOOTER.legalNote} />
        </p>
      </div>
    </footer>
  )
}
