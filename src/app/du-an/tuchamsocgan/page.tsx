import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import { FOOTER, NAV, PROJECT, SITE } from '../../../content/vi'
import { Facts } from '../../../voyage/chapters'
import { Enso, Header } from '../../../voyage/chrome'
import { ProductShot } from '../../../voyage/product-mock'
import { Arrowed, Rich, Words, idx } from '../../../voyage/ui'

const PATH = '/du-an/tuchamsocgan'
const OG = { url: '/assets/og-image.png', width: 1200, height: 630, alt: PROJECT.title }

// openGraph/twitter của trang con thay hẳn của layout (Next gộp nông theo khoá), nên khai đủ ở đây.
export const metadata: Metadata = {
  title: PROJECT.caption,
  description: PROJECT.lead,
  alternates: { canonical: PATH },
  openGraph: { type: 'article', locale: 'vi_VN', url: PATH, siteName: SITE.name, title: PROJECT.title, description: PROJECT.lead, images: [OG] },
  twitter: { card: 'summary_large_image', title: PROJECT.title, description: PROJECT.lead, images: [OG.url] },
}

const H2 = 'font-display text-[clamp(2.1rem,3.6vw,3.4rem)] leading-[1.05] tracking-[-0.015em]'

/**
 * Trang chi tiết dự án: trang dọc bình thường, không engine, không 3D. Mặt trời son mọc sau cửa sổ sản phẩm,
 * dãy núi mực mờ ở chân trang, dòng mực nối các việc đã làm. Mọi chuyển động là CSS theo cuộn (voyage.css, "Trang chi tiết").
 */
export default function ProjectDetail() {
  return (
    <>
      <div className="paper" aria-hidden />
      <Ridge />
      <Header base="/" active="du-an" />

      <main className="page-detail relative z-[3] overflow-x-clip">
        {/* Đầu trang: data-in có sẵn từ máy chủ nên chữ hiện ngay khi tải, không chờ JavaScript. */}
        <section data-in aria-labelledby="project-title" className="mx-auto grid max-w-7xl items-center gap-16 px-6 pb-10 pt-28 sm:pt-32 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-[5vw] lg:px-10 lg:pt-40">
          <div>
            <p className="reveal">
              <a href="/#du-an" className="link-ink inline-flex items-center gap-2 text-[0.92rem] text-wash">
                <ArrowLeft className="size-4" aria-hidden />
                {NAV[1].label}
              </a>
            </p>
            <p className="reveal eyebrow mt-9" style={idx(1)}>
              {PROJECT.eyebrow}
            </p>
            <p className="reveal mt-4 text-[0.95rem] font-semibold" style={idx(2)}>
              {PROJECT.caption}
            </p>
            <h1 id="project-title" className="mt-4 font-display text-[clamp(2.4rem,4.4vw,4.6rem)] leading-[1.02] tracking-[-0.02em] text-balance">
              <Words text={PROJECT.title} start={3} />
            </h1>
            <p className="reveal muted mt-6 max-w-lg text-[1.06rem] leading-relaxed" style={idx(8)}>
              {PROJECT.lead}
            </p>
            <Facts className="reveal mt-8 max-w-lg" style={idx(9)} />
          </div>

          <figure className="reveal relative [perspective:1600px]" style={idx(4)}>
            <div aria-hidden className="sun-up absolute -right-[6%] -top-[22%] size-[clamp(7rem,16vw,15rem)] rounded-full bg-son shadow-[0_0_90px_rgb(184_50_42/0.35)]" />
            <ProductShot />
          </figure>
        </section>

        <section aria-labelledby="bai-toan" className="rise-in mx-auto mt-24 grid max-w-6xl gap-6 px-6 lg:mt-36 lg:grid-cols-[13rem_1fr] lg:gap-10 lg:px-10">
          <h2 id="bai-toan" className="eyebrow self-start lg:mt-3">
            {PROJECT.problemTitle}
          </h2>
          <p className="border-l-2 border-son pl-5 font-display text-[clamp(1.45rem,2.5vw,2.3rem)] leading-[1.22] lg:pl-8">
            <Rich text={PROJECT.problem} />
          </p>
        </section>

        <section aria-labelledby="da-lam" className="mx-auto mt-28 max-w-6xl px-6 lg:mt-40 lg:px-10">
          <h2 id="da-lam" className={`rise-in ${H2}`}>
            {PROJECT.doneTitle}
          </h2>
          {/* Dòng mực chảy dọc nối năm việc, vẽ dần theo cuộn. */}
          <ol className="river mt-14 space-y-12 pl-16 lg:mt-20 lg:space-y-16 lg:pl-28">
            {PROJECT.done.map((d, i) => (
              <li key={d.title} className="rise-in relative max-w-3xl">
                <span aria-hidden className="absolute -left-16 -top-1 grid size-11 place-items-center rounded-full border border-ink/25 bg-[#faf5ea] font-display text-[1.2rem] italic lg:-left-28 lg:size-14 lg:text-[1.5rem]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-[clamp(1.5rem,2.3vw,2.1rem)] font-semibold leading-[1.12]">{d.title}</h3>
                {d.text && <p className="muted mt-3 max-w-2xl text-[1.02rem] leading-relaxed">{d.text}</p>}
                {d.list && (
                  <ul className="muted mt-4 grid gap-x-8 gap-y-2.5 text-[1.02rem] sm:grid-cols-2">
                    {d.list.map((l) => (
                      <li key={l} className="flex gap-3">
                        <span aria-hidden className="mt-[0.6em] size-[6px] shrink-0 rotate-45 bg-son" />
                        {l}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="nguoi-dung" className="mx-auto mt-28 max-w-6xl px-6 lg:mt-40 lg:px-10">
          <h2 id="nguoi-dung" className="rise-in eyebrow">
            {PROJECT.quotesTitle}
          </h2>
          <div className="mt-10 grid gap-12 md:grid-cols-2 md:gap-[5vw]">
            {PROJECT.quotes.map((q, i) => (
              <figure key={i} className={`rise-in relative ${i ? 'md:mt-24' : ''}`}>
                <span aria-hidden className="absolute -left-2 -top-[0.42em] font-display text-[clamp(6rem,10vw,9rem)] leading-none text-son/25">
                  “
                </span>
                <blockquote className="relative font-display text-[clamp(1.7rem,2.7vw,2.5rem)] italic leading-[1.14]">“{q.text}”</blockquote>
                <figcaption className="mt-4 text-[0.88rem] text-wash">— {q.by}</figcaption>
              </figure>
            ))}
          </div>
          <p className="rise-in mt-8">
            <Rich text={PROJECT.quotesMark} />
          </p>
          <p className="rise-in sheet mt-14 inline-flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-[4px] px-5 py-4">
            <span className="font-semibold">{PROJECT.numbersLabel}</span>
            <Rich text={PROJECT.numbers} />
          </p>
        </section>

        {/* Kết: vòng Ensō ôm chấm son như logo, câu nối sang cửa hàng của khách, hai lối đi tiếp. */}
        <section aria-label={PROJECT.similar} className="rise-in relative mx-auto mt-32 grid max-w-4xl place-items-center px-6 pb-24 pt-16 text-center lg:mt-44">
          <Enso className="absolute left-1/2 top-0 size-[min(30rem,88vw)] -translate-x-1/2 text-ink/[0.07]" />
          <p className="relative mt-[min(7rem,18vw)] max-w-2xl font-display text-[clamp(1.6rem,2.8vw,2.5rem)] leading-[1.2] text-balance">{PROJECT.bridge}</p>
          <div className="relative mt-10 flex flex-wrap justify-center gap-3">
            <a href="/#lien-he" className="btn btn-son">
              {PROJECT.similar}
            </a>
            <a href={PROJECT.liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-line">
              <Arrowed text={PROJECT.live} />
            </a>
          </div>
        </section>
      </main>

      <footer className="relative z-[3] mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-ink/10 px-6 py-8 text-[0.85rem] text-wash lg:px-10">
        <ul className="flex flex-wrap gap-x-6 gap-y-2" aria-label={FOOTER.contactTitle}>
          {FOOTER.contact.map((c) => (
            <li key={c.label}>
              <a href={c.href} target="_blank" rel="noopener noreferrer" className="link-ink text-ink">
                {c.label}
              </a>
            </li>
          ))}
        </ul>
        <p>
          {FOOTER.legal} <Rich text={FOOTER.legalNote} />
        </p>
      </footer>
      <div className="grain" aria-hidden />
    </>
  )
}

/** Dãy núi mực mờ ở chân màn hình, đứng yên khi chữ trôi qua. Hai lớp: xa nhạt chàm, gần đậm mực. */
function Ridge() {
  return (
    <svg aria-hidden viewBox="0 0 1600 400" preserveAspectRatio="none" className="pointer-events-none fixed inset-x-0 bottom-0 h-[34vh] w-full opacity-70 lg:h-[42vh]">
      <defs>
        <linearGradient id="ridge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#19211f" stopOpacity=".16" />
          <stop offset="1" stopColor="#19211f" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path fill="#2d5e78" fillOpacity=".09" d="M0 250C120 200 210 120 320 140C420 160 470 90 560 70C660 50 720 150 820 160C930 170 990 60 1100 40C1210 20 1280 130 1380 150C1470 170 1540 120 1600 110V400H0Z" />
      <path fill="url(#ridge)" d="M0 330C90 300 170 230 260 240C350 250 400 180 480 170C570 160 610 250 700 270C790 290 860 210 950 190C1040 170 1100 260 1190 280C1290 300 1350 220 1440 210C1520 200 1570 250 1600 260V400H0Z" />
    </svg>
  )
}
