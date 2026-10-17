import { CONTACT, HERO } from '../content/vi'
import { Enso } from './chrome'
import { Arrowed, Chapter, Eyebrow, Rich, Words, idx } from './ui'

// Bản minh hoạ sinh vật: ba lời hứa ghim vào thân cá như nhãn tiêu bản. Thứ tự khớp ANCHORS trong scene/koi.ts:
// miệng (tư vấn), vây ngực (báo giá rõ), vảy lưng (của bạn, được che chắn).
const PLATE_POS = ['hz:right-[5%] hz:top-[27%]', 'hz:left-[30%] hz:top-[74%]', 'hz:left-[6%] hz:top-[24%]']

const [lead, rest] = HERO.title.split(/(?<=—) /)

export function Hero() {
  return (
    <Chapter id="dau-trang" labelledBy="hero-title" className="pt-28 hz:w-screen hz:pt-0">
      {/* data-in sẵn từ server: tiêu đề hiện ngay (xem @starting-style), không chờ JS. */}
      <div data-reveal data-in className="max-w-2xl hz:absolute hz:left-[6vw] hz:top-[max(6.5rem,16vh)] hz:w-[44vw] hz:max-w-[44rem]">
        <Eyebrow className="reveal">{HERO.eyebrow}</Eyebrow>
        <h1 id="hero-title" className="mt-6 font-display text-[clamp(2.6rem,4.9vw,5.6rem)] leading-[1.02] tracking-[-0.02em] text-balance">
          <Words text={lead} start={1} />
          <em className="hl">
            <Words text={rest} start={lead.split(' ').length + 1} />
          </em>
        </h1>
        <p className="reveal mt-6 max-w-[33rem] text-[1.06rem] leading-relaxed text-ink/75" style={idx(9)}>
          {HERO.sub}
        </p>
        <div className="reveal mt-8 flex flex-wrap gap-3" style={idx(10)}>
          <a href={CONTACT.zaloHref} target="_blank" rel="noopener noreferrer" className="btn btn-son">
            {HERO.primary}
          </a>
          <a href="#du-an" className="btn btn-line">
            <Arrowed text={HERO.secondary} />
          </a>
        </div>
      </div>

      {/* Tấm tiêu bản: cá chép bơi trong khung này (cảnh 3D đọc vị trí [data-plate]); đường chỉ tới nhãn được vẽ mỗi khung hình. */}
      <figure data-reveal data-in className="relative mt-12 hz:absolute hz:inset-y-0 hz:right-0 hz:mt-0 hz:w-[52vw]">
        <div
          data-plate
          aria-hidden
          className="relative h-[44svh] min-h-[16rem] hz:absolute hz:inset-x-[3vw] hz:bottom-[max(5rem,11vh)] hz:top-[max(5.5rem,13vh)] hz:h-auto"
        >
          <span className="reveal absolute inset-0 border border-ink/15" style={idx(4)} />
          {[
            'left-0 top-0 border-l border-t',
            'right-0 top-0 border-r border-t',
            'left-0 bottom-0 border-l border-b',
            'right-0 bottom-0 border-r border-b',
          ].map((c) => (
            <span key={c} className={`absolute -m-1.5 size-5 border-ink/60 ${c}`} />
          ))}
          <span className="reveal absolute -bottom-5 -right-5 grid size-14 rotate-[-4deg] place-items-center rounded-[3px] bg-son text-paper shadow-[0_6px_16px_-8px_rgb(184_50_42)]" style={idx(12)}>
            <Enso className="size-10" />
          </span>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-3 hz:static hz:mt-0 hz:block">
          {HERO.trust.map((t, i) => (
            <li
              key={i}
              data-label={i}
              className={`reveal relative pl-5 text-[0.95rem] leading-snug hz:absolute hz:w-max hz:max-w-[15rem] hz:text-[1.02rem] ${PLATE_POS[i]}`}
              style={idx(13 + i)}
            >
              <span data-pin aria-hidden className="absolute left-0 top-[0.42rem] size-[7px] rotate-45 bg-son" />
              <Rich text={t} />
            </li>
          ))}
        </ul>
      </figure>
    </Chapter>
  )
}
