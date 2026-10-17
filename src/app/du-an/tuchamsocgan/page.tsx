import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Image, { type StaticImageData } from 'next/image'
import { FOOTER, NAV, PROJECT, SITE } from '../../../content/vi'
import { Head, Rough, fonts } from '../../../thu-phap/shell'
import { Analytics } from '../../../voyage/analytics'
import { Enso } from '../../../voyage/chrome'
import { Arrowed, Rich, Words, idx } from '../../../voyage/ui'
import '../../../thu-phap/thu-phap.css'
import '../../../thu-phap/du-an.css'
import camNang from './_anh/cam-nang.jpg'
import dienThoai from './_anh/dien-thoai.jpg'
import docTo from './_anh/doc-to.jpg'
import hanhTrinh from './_anh/hanh-trinh.jpg'
import loiKhuyen from './_anh/loi-khuyen.jpg'
import nhatKy from './_anh/nhat-ky.jpg'
import trangChu from './_anh/trang-chu.jpg'

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

/** Ảnh chụp trang thật cho từng việc trong PROJECT.done, cùng thứ tự. */
const DONE_SHOTS = [docTo, nhatKy, loiKhuyen, hanhTrinh, camNang]
const WIDE = '(min-width: 64rem) 55vw, 100vw'
const HOST = new URL(PROJECT.liveUrl).host

/** Ảnh máy tính nằm trong cửa sổ kiểu Mac (ba chấm, thanh địa chỉ); ảnh điện thoại trong khung điện thoại. */
function Shot({ src, alt, phone, preload, className = '' }: { src: StaticImageData; alt: string; phone?: boolean; preload?: boolean; className?: string }) {
  return (
    <div className={`${phone ? 'tpd-phone' : 'tpd-shot'} ${className}`}>
      {!phone && (
        <div className="tpd-bar" aria-hidden>
          <i />
          <i />
          <i />
          <span>{HOST}</span>
        </div>
      )}
      <Image src={src} alt={alt} placeholder="blur" preload={preload} sizes={phone ? '(min-width: 64rem) 17rem, 70vw' : WIDE} />
    </div>
  )
}

/**
 * Trang chi tiết dự án, cùng giấy, mực, son với trang chính nhưng là trang dọc bình thường: không engine, không 3D.
 * Đầu trang có data-in sẵn từ máy chủ nên chữ hiện ngay; phần dưới trồi lên theo cuộn (rise-in, chỉ CSS).
 * Tiêu đề bút lông phía dưới để chữ trơn: <Words> chỉ hiện khi có data-in.
 */
export default function ProjectDetail() {
  return (
    <div data-flat className={`tp ${fonts}`}>
      <div className="paper" aria-hidden />
      <Ridge />
      <Head base="/" active="du-an" />

      <main className="page-detail relative z-[1] overflow-x-clip">
        <section data-in aria-labelledby="tpd-title" className="mx-auto grid max-w-7xl items-center gap-x-[5vw] gap-y-16 px-6 pb-16 pt-28 sm:pt-32 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:px-10 lg:pt-36">
          <div>
            <p className="reveal">
              <a href="/#du-an" className="tp-link inline-flex items-center gap-2 text-[0.92rem]">
                <ArrowLeft className="size-4" aria-hidden />
                {NAV[1].label}
              </a>
            </p>
            <p className="tp-eb reveal mt-8" style={idx(1)}>
              {PROJECT.eyebrow}
            </p>
            <p className="reveal mt-3 font-medium" style={idx(2)}>
              {PROJECT.caption}
            </p>
            <h1 id="tpd-title" className="tp-brush tpd-h1">
              <Words text={PROJECT.title} start={3} />
            </h1>
            <p className="tp-body reveal max-w-xl text-[1.08rem]" style={idx(10)}>
              {PROJECT.lead}
            </p>
            <dl className="tp-facts mt-8 max-w-xl">
              {PROJECT.facts.map(([k, v], i) => (
                <div key={k} className="reveal" style={idx(11 + i)}>
                  <dt>{k}</dt>
                  <dd>
                    {v === 'tuchamsocgan.vn' ? (
                      <a href={PROJECT.liveUrl} target="_blank" rel="noopener noreferrer" className="tp-link">
                        {v}
                      </a>
                    ) : (
                      <Rich text={v} />
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <figure className="reveal relative mb-10 lg:mb-0" style={idx(5)}>
            <div aria-hidden className="sun-up absolute -right-[5%] -top-[18%] size-[clamp(7rem,15vw,14rem)] rounded-full bg-son [filter:url(#tp-rough)]" />
            <Shot src={trangChu} alt={PROJECT.shots.home} preload />
            <Shot src={dienThoai} alt={PROJECT.shots.phone} phone className="tpd-hero-phone" />
          </figure>
        </section>

        <section aria-labelledby="bai-toan" className="rise-in mx-auto mt-20 grid max-w-6xl gap-x-12 gap-y-4 px-6 lg:mt-32 lg:grid-cols-[15rem_1fr] lg:px-10">
          <h2 id="bai-toan" className="tp-brush tp-h2 !mt-0">
            {PROJECT.problemTitle}
          </h2>
          <p className="tp-bridge self-center text-[clamp(1.2rem,1.9vw,1.55rem)] leading-[1.45]">
            <Rich text={PROJECT.problem} />
          </p>
        </section>

        <section aria-labelledby="da-lam" className="mx-auto mt-28 max-w-7xl px-6 lg:mt-40 lg:px-10">
          <h2 id="da-lam" className="rise-in tp-brush tp-h2">
            {PROJECT.doneTitle}
          </h2>
          <ol className="tpd-done">
            {PROJECT.done.map((d, i) => (
              <li key={d.title}>
                <div className="rise-in">
                  <h3>{d.title}</h3>
                  {d.text && <p className="tp-body text-[1.08rem]">{d.text}</p>}
                  {d.list && (
                    <ul className="tp-dots">
                      {d.list.map((l) => (
                        <li key={l}>{l}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <figure className="rise-in">
                  <Shot src={DONE_SHOTS[i]} alt={PROJECT.shots.done[i]} phone={DONE_SHOTS[i] === docTo} />
                </figure>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="nguoi-dung" className="mx-auto mt-32 max-w-6xl px-6 lg:mt-44 lg:px-10">
          <h2 id="nguoi-dung" className="rise-in tp-brush tp-h2">
            {PROJECT.quotesTitle}
          </h2>
          <div className="mt-12 grid gap-14 md:grid-cols-2 md:gap-[5vw]">
            {PROJECT.quotes.map((q, i) => (
              <figure key={i} className={`tpd-q rise-in relative ${i ? 'md:mt-24' : ''}`}>
                <blockquote className="relative">“{q.text}”</blockquote>
                <figcaption>— {q.by}</figcaption>
              </figure>
            ))}
          </div>
          <p className="rise-in mt-16 flex flex-wrap items-baseline gap-x-4 text-[1.1rem]">
            <span className="font-bold">{PROJECT.numbersLabel}</span>
            <span className="tp-brush text-[clamp(3rem,6vw,4.6rem)] leading-none text-son">{PROJECT.numbers}</span>
          </p>
        </section>

        {/* Kết: vòng Ensō mờ ôm câu nối sang cửa hàng của khách, con dấu son để liên hệ. */}
        <section aria-label={PROJECT.similar} className="rise-in relative mx-auto mt-32 grid max-w-4xl place-items-center px-6 pb-24 pt-16 text-center lg:mt-44">
          <Enso className="absolute left-1/2 top-0 size-[min(30rem,88vw)] -translate-x-1/2 text-ink/[0.08]" />
          <p className="relative mt-[min(7rem,18vw)] max-w-2xl text-[clamp(1.4rem,2.6vw,2.2rem)] leading-[1.3] text-balance">{PROJECT.bridge}</p>
          <div className="tp-ctas relative justify-center">
            <a href="/#lien-he" className="seal">
              {PROJECT.similar}
            </a>
            <a href={PROJECT.liveUrl} target="_blank" rel="noopener noreferrer" className="tp-link">
              <Arrowed text={PROJECT.live} />
            </a>
          </div>
        </section>
      </main>

      <footer className="relative z-[1] mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-ink/15 px-6 py-8 text-[0.92rem] lg:px-10">
        <ul className="flex flex-wrap gap-x-6 gap-y-2" aria-label={FOOTER.contactTitle}>
          {FOOTER.contact.map((c) => (
            <li key={c.href}>
              <a href={c.href} className="tp-link" {...(c.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                {c.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="tp-legal">
          {FOOTER.legal} · <Rich text={FOOTER.legalNote} />
        </p>
      </footer>

      <div className="grain" aria-hidden />
      <Analytics />
      <Rough />
    </div>
  )
}

/** Dãy núi mực mờ ở chân màn hình, đứng yên khi chữ trôi qua: lớp xa nhạt, lớp gần đậm hơn. */
function Ridge() {
  return (
    <svg aria-hidden viewBox="0 0 1600 400" preserveAspectRatio="none" className="pointer-events-none fixed inset-x-0 bottom-0 h-[34vh] w-full opacity-70 lg:h-[42vh]">
      <defs>
        <linearGradient id="ridge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#19211f" stopOpacity=".16" />
          <stop offset="1" stopColor="#19211f" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path fill="#19211f" fillOpacity=".05" d="M0 250C120 200 210 120 320 140C420 160 470 90 560 70C660 50 720 150 820 160C930 170 990 60 1100 40C1210 20 1280 130 1380 150C1470 170 1540 120 1600 110V400H0Z" />
      <path fill="url(#ridge)" d="M0 330C90 300 170 230 260 240C350 250 400 180 480 170C570 160 610 250 700 270C790 290 860 210 950 190C1040 170 1100 260 1190 280C1290 300 1350 220 1440 210C1520 200 1570 250 1600 260V400H0Z" />
    </svg>
  )
}
