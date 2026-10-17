import { ArrowUpRight, LayoutDashboard, Repeat2, ShieldCheck, Smartphone } from 'lucide-react'
import type { CSSProperties } from 'react'
import { FAQ, PAIN, PROCESS, PROJECT, SCENARIOS, SERVICES, WHY } from '../content/vi'
import { MoonPath } from './env'
import { ProductShot } from './product-mock'
import { Arrowed, Chapter, Eyebrow, Intro, Rich, Words, idx } from './ui'

// Mỗi chương một cảnh trên dòng sông (nền vẽ ở env.tsx). Mảng vị trí dưới đây khớp số mục trong content:
// đổi số mục thì đổi mảng tương ứng.

const css = (o: Record<string, string | number>) => o as CSSProperties
const DETAIL = '/du-an/tuchamsocgan'

/* ---------- 1. Nỗi đau: mẩu giấy trôi giữa lau sậy. Chạm mẩu nào "gật đầu" thì đóng dấu son mẩu đó. ---------- */

const SLIP = [
  'hz:-mt-[4vh] hz:rotate-[-2deg]',
  'hz:mt-[3vh] hz:rotate-[1.5deg]',
  'hz:mt-[6vh] hz:rotate-[1deg]',
  'hz:-mt-[2vh] hz:rotate-[-1.2deg]',
  'hz:-mt-[6vh] hz:rotate-[2deg]',
  'hz:mt-[1vh] hz:rotate-[-1.8deg]',
  'hz:mt-[4vh] hz:rotate-[-0.6deg]',
]

export function Pain() {
  return (
    <Chapter id="noi-dau" labelledBy="pain-title" className="pain hz:flex hz:items-center hz:gap-[5vw] hz:pl-[8vw] hz:pr-[9vw]">
      <Intro id="pain-title" eyebrow={PAIN.eyebrow} title={PAIN.title} className="hz:w-[26vw]" />
      <ul data-reveal aria-labelledby="pain-title" className="mt-12 grid gap-4 sm:grid-cols-2 hz:mt-0 hz:grid-flow-col hz:grid-rows-2 hz:gap-x-[2.4vw] hz:gap-y-[7vh]">
        {PAIN.items.map((t, i) => (
          <li key={i} className={`reveal hz:w-[clamp(13.5rem,16vw,18rem)] ${SLIP[i]} ${i % 2 ? 'hz:translate-x-[6vw]' : ''}`} style={idx(i)}>
            <label className="slip relative block cursor-pointer px-5 pb-6 pt-5 pr-12 text-[0.98rem] leading-snug transition duration-500 ease-expo hover:-translate-y-1 has-[:checked]:-translate-y-1">
              <input type="checkbox" className="peer sr-only" />
              <span aria-hidden className="tick absolute right-3.5 top-3.5 grid size-7 place-items-center rounded-[3px] text-ink/25 peer-checked:text-son peer-focus-visible:ring-2 peer-focus-visible:ring-son">
                {/* khung dấu son vuông, đóng xuống khi gật đầu */}
                <svg viewBox="0 0 28 28" className="absolute inset-0" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="2" y="2" width="24" height="24" rx="2.5" />
                </svg>
                <svg viewBox="0 0 20 20" className="tick-mark size-3.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 10.5 8.2 14.5 16 5.5" pathLength={1} />
                </svg>
              </span>
              {t}
            </label>
          </li>
        ))}
      </ul>
      <div data-reveal className="mt-14 max-w-md shrink-0 hz:mt-[24vh] hz:w-[24vw]">
        <p className="reveal font-display text-[clamp(1.55rem,2.1vw,2.4rem)] leading-[1.15]">
          <span className="nod">{PAIN.closing}</span>
        </p>
        <p className="reveal mt-6" style={idx(2)}>
          <a href="#lien-he" className="link-ink font-semibold">
            <Arrowed text={PAIN.link} />
          </a>
        </p>
      </div>
    </Chapter>
  )
}

/* ---------- 2. Dịch vụ: bốn tờ giấy nổi ở bốn độ sâu trên ghềnh nước. ---------- */

const SERVICE_ICON = [LayoutDashboard, Smartphone, Repeat2, ShieldCheck]
const SERVICE_LIFT = ['hz:-mt-[14vh]', 'hz:mt-[12vh]', 'hz:-mt-[8vh]', 'hz:mt-[16vh]']
const SERVICE_DRIFT = ['-3vw', '4vw', '-5vw', '6vw']

export function Services() {
  return (
    <Chapter id="dich-vu" labelledBy="services-title" className="hz:flex hz:items-center hz:gap-[4.5vw] hz:pl-[6vw] hz:pr-[9vw]">
      <Intro id="services-title" eyebrow={SERVICES.eyebrow} title={SERVICES.title} lead={SERVICES.lead} className="hz:w-[28vw]" />
      <ul className="mt-14 grid gap-6 md:grid-cols-2 hz:mt-0 hz:flex hz:items-center hz:gap-[2.6vw]">
        {SERVICES.items.map((s, i) => {
          const Icon = SERVICE_ICON[i]
          return (
            <li key={i} data-reveal className={`drift bob shrink-0 hz:w-[clamp(19.5rem,23vw,25rem)] ${SERVICE_LIFT[i]}`} style={css({ '--drift': SERVICE_DRIFT[i], '--bob': i })}>
              <article className="reveal lumen sheet flex h-full flex-col rounded-[4px] p-6 sm:p-7 [@media(max-height:46rem)]:p-5" style={css({ '--bob': i })}>
                <span className="float flex items-center justify-between" style={css({ '--z': 26 })}>
                  <span className="relative grid size-12 place-items-center rounded-[3px] bg-[linear-gradient(135deg,rgb(63_139_118/0.2),rgb(45_94_120/0.08))] text-cham">
                    <Icon className="size-5" aria-hidden strokeWidth={1.6} />
                  </span>
                  <span aria-hidden className="h-px w-12 bg-ink/20" />
                </span>
                <h3 className="float mt-5 font-display text-[clamp(1.45rem,1.7vw,1.8rem)] font-semibold leading-[1.08] [@media(max-height:46rem)]:mt-3" style={css({ '--z': 16 })}>
                  {s.title}
                </h3>
                <p className="muted mt-3 text-[0.92rem] leading-relaxed [@media(max-height:46rem)]:text-[0.86rem]">{s.text}</p>
                <ul className="mt-4 space-y-1.5 text-[0.88rem] leading-snug [@media(max-height:46rem)]:mt-3 [@media(max-height:46rem)]:space-y-1 [@media(max-height:46rem)]:text-[0.84rem]">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex gap-2.5">
                      <span aria-hidden className="mt-[0.5em] h-px w-3 shrink-0 bg-son" />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto space-y-2 border-t border-ink/10 pt-4 text-[0.84rem] leading-snug [@media(max-height:46rem)]:pt-3">
                  <p className="mt-4 [@media(max-height:46rem)]:mt-3">
                    <span className="font-semibold text-cham">{SERVICES.fitLabel}</span> {s.fit}
                  </p>
                  {s.result && (
                    <p>
                      <span className="font-semibold text-cham">{SERVICES.resultLabel}</span> <Rich text={s.result} />
                    </p>
                  )}
                  {s.link && (
                    <a href={s.link.href} className="link-ink inline-block font-semibold text-ink">
                      <Arrowed text={s.link.label} />
                    </a>
                  )}
                </div>
              </article>
            </li>
          )
        })}
      </ul>
    </Chapter>
  )
}

/* ---------- 3. Dự án: nước trong, cửa sổ sản phẩm nghiêng trong không gian. ---------- */

/** Bảng thông tin dự án (trang chính và trang chi tiết). */
export function Facts({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <dl className={`divide-y divide-ink/10 border-y border-ink/10 text-[0.88rem] ${className}`} style={style}>
      {PROJECT.facts.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[8.5rem_1fr] gap-3 py-2.5 [@media(max-height:46rem)]:py-1.5">
          <dt className="text-wash">{k}</dt>
          <dd>
            {v === 'tuchamsocgan.vn' ? (
              <a href={PROJECT.liveUrl} target="_blank" rel="noopener noreferrer" className="link-ink font-semibold">
                {v}
              </a>
            ) : (
              <Rich text={v} />
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function Project() {
  return (
    <Chapter id="du-an" labelledBy="project-title" className="hz:flex hz:items-center hz:gap-[6vw] hz:pl-[7vw] hz:pr-[9vw]">
      <div data-reveal className="max-w-xl shrink-0 hz:w-[33vw] hz:max-w-[36rem]">
        <Eyebrow className="reveal">{PROJECT.eyebrow}</Eyebrow>
        <p className="reveal mt-4" style={idx(1)}>
          <a href={DETAIL} className="link-ink inline-flex items-center gap-1.5 text-[0.95rem] font-semibold">
            {PROJECT.caption}
            <ArrowUpRight className="size-4" aria-hidden />
          </a>
        </p>
        <h2 id="project-title" className="mt-4 font-display text-[clamp(2.1rem,3.2vw,3.8rem)] leading-[1.04] tracking-[-0.015em] text-balance">
          <Words text={PROJECT.title} start={2} />
        </h2>
        <p className="reveal muted mt-5 text-[1.02rem] leading-relaxed" style={idx(6)}>
          {PROJECT.lead}
        </p>
        <Facts className="reveal mt-7 [@media(max-height:46rem)]:mt-5" style={idx(7)} />
      </div>

      {/* Cửa sổ sản phẩm nghiêng, điện thoại chồng một góc. Bấm vào là sang trang chi tiết dự án. */}
      <figure data-reveal className="relative mt-14 shrink-0 hz:mt-0 hz:w-[46vw]">
        <a href={DETAIL} aria-label={PROJECT.caption} className="reveal group block [perspective:1600px]" style={idx(2)}>
          <ProductShot className="transition-transform duration-1000 ease-expo group-hover:[transform:rotateY(-6deg)_rotateX(2deg)]" />
        </a>
      </figure>

      <div data-reveal className="mt-16 grid max-w-3xl shrink-0 gap-10 hz:mt-0 hz:w-[54vw] hz:max-w-none hz:grid-cols-[0.9fr_1.1fr] hz:gap-[3.5vw]">
        <div className="reveal sheet self-start rounded-[4px] p-6 sm:p-7">
          <h3 className="font-display text-[1.6rem] font-semibold">{PROJECT.problemTitle}</h3>
          <p className="muted mt-3 text-[0.94rem] leading-relaxed [@media(max-height:46rem)]:text-[0.86rem]">
            <Rich text={PROJECT.problem} />
          </p>
        </div>
        <div>
          <h3 className="reveal font-display text-[1.6rem] font-semibold" style={idx(1)}>
            {PROJECT.doneTitle}
          </h3>
          <ol className="mt-4 space-y-3.5 text-[0.9rem] leading-snug [@media(max-height:46rem)]:space-y-2 [@media(max-height:46rem)]:text-[0.84rem]">
            {PROJECT.done.map((d, i) => (
              <li key={d.title} className="reveal flex gap-3.5" style={idx(2 + i)}>
                <span aria-hidden className="mt-[0.45em] size-[7px] shrink-0 rotate-45 bg-son" />
                <span>
                  <span className="font-semibold">{d.title}</span> {d.text}
                  {d.list && (
                    <span className="muted mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5">
                      {d.list.map((l) => (
                        <span key={l}>{l}</span>
                      ))}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div data-reveal className="mt-16 max-w-xl shrink-0 hz:mt-0 hz:w-[32vw]">
        <h3 className="reveal eyebrow">{PROJECT.quotesTitle}</h3>
        {PROJECT.quotes.map((q, i) => (
          <figure key={i} className="reveal mt-6" style={idx(1 + i)}>
            <blockquote className="font-display text-[clamp(1.45rem,1.9vw,2.15rem)] italic leading-[1.15]">“{q.text}”</blockquote>
            <figcaption className="mt-2 text-[0.82rem] text-wash">— {q.by}</figcaption>
          </figure>
        ))}
        <p className="reveal mt-8 border-l-2 border-son pl-4 text-[0.98rem] leading-relaxed [@media(max-height:46rem)]:mt-5" style={idx(4)}>
          {PROJECT.bridge}
        </p>
        <div className="reveal mt-7 flex flex-wrap gap-3 [@media(max-height:46rem)]:mt-5" style={idx(5)}>
          <a href="#lien-he" className="btn btn-son">
            {PROJECT.similar}
          </a>
          <a href={PROJECT.liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-line">
            <Arrowed text={PROJECT.live} />
          </a>
        </div>
      </div>
    </Chapter>
  )
}

/* ---------- 4. Tình huống: sông chia ba nhánh, mỗi nhánh một bài toán. ---------- */

const FORK = ['hz:-mt-[16vh]', 'hz:mt-[10vh]', 'hz:-mt-[4vh]']

export function Scenarios() {
  return (
    <Chapter id="tinh-huong" labelledBy="scenarios-title" className="hz:flex hz:items-center hz:gap-[4.5vw] hz:pl-[6vw] hz:pr-[9vw]">
      <Intro id="scenarios-title" eyebrow={SCENARIOS.eyebrow} title={SCENARIOS.title} className="hz:w-[26vw]" />
      <ul className="mt-14 grid gap-6 md:grid-cols-3 hz:mt-0 hz:flex hz:items-center hz:gap-[2.8vw]">
        {SCENARIOS.items.map((s, i) => (
          <li key={i} data-reveal className={`drift bob shrink-0 hz:w-[clamp(19rem,23vw,25rem)] ${FORK[i]}`} style={css({ '--drift': ['-4vw', '3vw', '-2vw'][i], '--bob': i + 1 })}>
            <article className="reveal lumen sheet rounded-[4px] p-6 sm:p-7 [@media(max-height:46rem)]:p-5" style={css({ '--bob': i })}>
              <span className="float inline-block rounded-full border border-dashed border-ink/35 px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-wash" style={css({ '--z': 24 })}>
                {SCENARIOS.tag}
              </span>
              <h3 className="float mt-4 font-display text-[clamp(1.4rem,1.7vw,1.75rem)] font-semibold leading-[1.1]" style={css({ '--z': 14 })}>
                {s.title}
              </h3>
              <p className="muted mt-4 text-[0.9rem] leading-relaxed [@media(max-height:46rem)]:text-[0.84rem]">
                <span className="font-semibold text-wash">{SCENARIOS.before}</span> {s.before}
              </p>
              {/* Nét mực rối gỡ thành một đường thẳng: trước → sau. */}
              <svg aria-hidden viewBox="0 0 120 24" className="my-3 h-6 w-32 text-ink/45" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
                <path d="M2 14C8 2 14 24 19 10S30 0 26 13s11 9 15-4 10-3 8 5c5-2 10-2 18-2h48" />
                <path d="m109 7 6 5-6 5" className="text-son" stroke="#B8322A" />
              </svg>
              <p className="text-[0.92rem] leading-relaxed [@media(max-height:46rem)]:text-[0.86rem]">
                <span className="font-semibold text-cham">{SCENARIOS.after}</span> {s.after}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </Chapter>
  )
}

/* ---------- 5. Cách làm việc: ruộng bậc thang, dòng nước vẽ dần nối bốn bước. ---------- */

const STEP_POS = ['hz:-translate-y-[17vh]', 'hz:translate-y-[17vh]', 'hz:-translate-y-[17vh]', 'hz:translate-y-[17vh]']
const CURRENT = 'M0 50 C 120 -20, 220 120, 340 50 S 560 -20, 680 50 S 880 120, 1000 50'

export function Process() {
  return (
    <Chapter id="cach-lam-viec" labelledBy="process-title" className="hz:flex hz:items-center hz:gap-[3vw] hz:pl-[6vw] hz:pr-[16vw]">
      <Intro id="process-title" eyebrow={PROCESS.eyebrow} title={PROCESS.title} className="hz:w-[25vw]">
        <p className="reveal mt-8" style={idx(7)}>
          <a href="#lien-he" className="btn btn-son">
            <Arrowed text={PROCESS.cta} />
          </a>
        </p>
      </Intro>
      <div className="relative mt-14 shrink-0 hz:mt-0 hz:flex hz:h-full hz:w-[96vw] hz:items-center">
        <svg aria-hidden viewBox="0 0 1000 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-1/2 hidden h-[22vh] -translate-y-1/2 [mask-image:linear-gradient(to_right,transparent,#000_6%,#000_84%,transparent)] hz:block" fill="none">
          <path d={CURRENT} stroke="rgb(25 33 31 / 0.12)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <path d={CURRENT} className="current" stroke="#2d5e78" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <ol className="relative space-y-10 border-l border-ink/15 pl-8 hz:flex hz:w-full hz:items-center hz:justify-between hz:space-y-0 hz:border-0 hz:pl-0">
          {PROCESS.steps.map((s, i) => (
            <li key={i} data-reveal className={`relative hz:w-[clamp(15rem,19vw,20rem)] ${STEP_POS[i]}`}>
              <span aria-hidden className="absolute -left-[2.45rem] top-1 grid size-5 place-items-center rounded-full border border-ink/30 bg-paper hz:hidden">
                <span className="size-1.5 rounded-full bg-son" />
              </span>
              <div className="reveal sheet rounded-[4px] p-5 sm:p-6">
                <h3 className="font-display text-[clamp(1.4rem,1.6vw,1.7rem)] font-semibold leading-tight">{s.title}</h3>
                {s.meta && (
                  <p className="mt-1.5 text-[0.8rem] font-semibold text-cham">
                    <Rich text={s.meta} />
                  </p>
                )}
                <p className="muted mt-3 text-[0.9rem] leading-relaxed [@media(max-height:46rem)]:text-[0.84rem]">
                  <Rich text={s.text} />
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Chapter>
  )
}

/* ---------- 6. Vì sao: đêm, trăng rằm trải vệt sáng trên mặt nước. ---------- */

export function Why() {
  return (
    <Chapter
      id="vi-sao"
      labelledBy="why-title"
      className="on-night py-40 text-paper hz:flex hz:items-center hz:gap-[6vw] hz:py-0 hz:pl-[17vw] hz:pr-[17vw]"
    >
      <figure data-reveal className="relative max-w-md shrink-0 hz:w-[26vw]">
        {/* Chú thích đặt trên, trăng và vệt trăng bên dưới: cá bơi ngang qua vệt trăng chứ không đè lên chữ. */}
        <figcaption className="reveal mb-6 font-display text-[clamp(1.15rem,1.35vw,1.45rem)] italic leading-snug text-paper/85" style={idx(2)}>
          {WHY.enso}
        </figcaption>
        <MoonPath className="reveal mx-auto block aspect-[10/13] w-[min(64vw,18rem)] hz:w-[min(40vh,20vw)]" />
      </figure>
      {/* Chương nhiều chữ nhất: cột chữ không hẹp hơn 34rem, và gọn lại từ 48rem chiều cao (1024×768 vẫn vừa). */}
      <div data-reveal className="mt-16 max-w-2xl shrink-0 hz:mt-0 hz:w-[max(44vw,34rem)] hz:max-w-[52rem]">
        <Eyebrow className="reveal">{WHY.eyebrow}</Eyebrow>
        <h2 id="why-title" className="mt-5 font-display text-[clamp(2.2rem,3.5vw,4.1rem)] leading-[1.04] tracking-[-0.015em] [@media(max-height:48rem)]:mt-3">
          <Words text={WHY.title} start={1} />
        </h2>
        <ul className="mt-9 grid gap-x-[3vw] gap-y-6 sm:grid-cols-2 [@media(max-height:48rem)]:mt-6 [@media(max-height:48rem)]:gap-y-4">
          {WHY.items.map((w, i) => (
            <li key={i} className="reveal flex gap-3.5" style={idx(5 + i)}>
              <span aria-hidden className="mt-[0.5em] size-2 shrink-0 rounded-full border border-paper/70" />
              <span>
                <span className="block font-semibold">{w.title}</span>
                <span className="muted mt-1 block text-[0.9rem] leading-relaxed [@media(max-height:48rem)]:text-[0.84rem]">
                  <Rich text={w.text} />
                </span>
              </span>
            </li>
          ))}
        </ul>
        <p className="reveal mt-9 flex items-center gap-3 text-[0.9rem] [@media(max-height:48rem)]:mt-6" style={idx(11)}>
          <span aria-hidden className="h-px w-10 bg-paper/50" />
          <Rich text={WHY.team} />
        </p>
      </div>
    </Chapter>
  )
}

/* ---------- 7. Hỏi đáp: xoáy nước. Ba cột, mở một câu thì câu khác tự đóng (details name="faq"). ---------- */

export function Faq() {
  const cols = [0, 3, 6].map((k) => FAQ.items.slice(k, k + 3))
  return (
    <Chapter id="hoi-dap" labelledBy="faq-title" className="hz:flex hz:items-start hz:gap-[4vw] hz:pl-[9vw] hz:pr-[8vw] hz:pt-[max(7rem,22vh)]">
      <Intro id="faq-title" eyebrow={FAQ.eyebrow} title={FAQ.title} className="hz:w-[21vw]" />
      <div data-reveal className="mt-12 grid gap-x-[2.6vw] lg:grid-cols-3 hz:mt-0 hz:flex hz:items-start">
        {cols.map((col, c) => (
          <div key={c} className="hz:w-[clamp(17rem,21vw,23rem)]">
            {col.map((f, i) => (
              <details key={f.q} name="faq" className="qa reveal border-t border-ink/15 last:border-b" style={idx(c * 3 + i)}>
                <summary className="flex items-start justify-between gap-4 py-4 font-display text-[clamp(1.15rem,1.3vw,1.35rem)] font-semibold leading-snug transition-colors hover:text-son [@media(max-height:46rem)]:py-3">
                  {f.q}
                  <span aria-hidden className="plus mt-1 grid size-6 shrink-0 place-items-center rounded-full border border-ink/25 font-sans text-[0.95rem] font-normal">
                    +
                  </span>
                </summary>
                <div className="muted pb-5 text-[0.9rem] leading-relaxed">
                  {f.a && (
                    <p>
                      <Rich text={f.a} />
                    </p>
                  )}
                  {f.list && (
                    <ul className="mt-2 space-y-1">
                      {f.list.map((l) => (
                        <li key={l} className="flex gap-2.5">
                          <span aria-hidden className="mt-[0.6em] h-px w-3 shrink-0 bg-son" />
                          <span>
                            <Rich text={l} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </details>
            ))}
          </div>
        ))}
      </div>
    </Chapter>
  )
}
