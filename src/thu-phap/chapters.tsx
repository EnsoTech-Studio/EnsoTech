import type { ReactNode } from 'react'
import { CONTACT_SECTION, FAQ, PROCESS, PROJECT, SCENARIOS, SERVICES, WHY } from '../content/vi'
import { Enso } from '../voyage/chrome'
import { Arrowed, Rich, Words, idx } from '../voyage/ui'
import { A, place, type AnchorProps, type Box } from './anchor'
import { InkForm } from './form.client'

/* Các chương giữa tranh. Mỗi khối chữ phải nằm trọn trong khung của điểm dừng máy quay gần nó (layout.ts):
   ở 1280×720, với điểm dừng (cx, cy): đỉnh ≥ cy − 22.4, đáy ≤ cy + 27.3, |tâm − cx| + w/2 ≤ 48.5.
   Nét vẽ đặt vào chỗ trống quanh chữ. par < 0: vật ở gần, lướt qua nhanh hơn khi máy quay đi. */

type Scene = AnchorProps[]
const Arts = ({ list }: { list: Scene }) => list.map((a, i) => <A key={i} {...a} />)
const ext = (href: string) => (href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})

interface SecProps {
  /** Điểm suối ở trang dọc (page.tsx giữ thứ tự cả dòng). */
  children?: ReactNode
}

/** Dòng nhỏ đầu chương; cuối dòng con dấu son đóng xuống khi chương hiện ra. */
function Eb({ children }: { children: ReactNode }) {
  return (
    <p className="tp-eb reveal">
      {children}
      <span aria-hidden className="tp-mark">
        <Enso className="size-[72%]" />
      </span>
    </p>
  )
}

function Title({ id, text, start = 1 }: { id: string; text: string; start?: number }) {
  return (
    <h2 id={id} className="tp-brush tp-h2">
      <Words text={text} start={start} />
    </h2>
  )
}

/* ---------- Dịch vụ: rừng trúc → khóm lan, cúc → thông già, hạc bay ---------- */

const SVC_AT: Box[] = [[248, 50, 28], [306, 73, 28], [360, 76, 28], [404, 46, 30]]
const SVC_ART: Scene = [
  // Trời giữa hai cảnh: chỉ lộ ra khi máy quay lùi xa lúc chuyển chương (ngoài khung cả hai trạm dừng).
  { art: 'far', seed: 24, tone: 0.45, par: 0.12, p: [118, 52, 70, 13] },
  { art: 'geese', seed: 25, par: 0.2, p: [138, 52, 26, 7] },
  // SV1 (256,70)
  { art: 'bamboo', o: 1, seed: 21, gap: 0.5, p: [284, 48, 16, 38], v: [84, 3, 12, 12] },
  { art: 'swash', o: 2, seed: 4, p: [276, 86, 30, 9] },
  { art: 'rock', o: 3, seed: 41, p: [212, 80, 10, 6] },
  { art: 'rock', o: 4, seed: 42, p: [225, 84, 6, 4] },
  { art: 'reed', o: 4, seed: 43, p: [244, 80, 3, 10] },
  { art: 'birds', o: 5, seed: 44, par: 0.2, p: [272, 43, 28, 7] },
  { art: 'mist', par: -0.6, p: [282, 92, 36, 4] },
  // SV2 (352,94)
  { art: 'orchid', o: 1, seed: 31, p: [338, 98, 18, 14], v: [86, 34, 12, 8] },
  { art: 'rock', o: 2, seed: 32, p: [336, 110, 10, 6] },
  { art: 'rock', o: 3, seed: 33, p: [348, 114, 7, 4] },
  { art: 'chrys', o: 2, seed: 34, p: [390, 94, 10, 22] },
  { art: 'dragonfly', o: 4, seed: 35, p: [336, 82, 12, 10] },
  { art: 'lotus', o: 5, seed: 36, gap: 0.4, p: [306, 113, 28, 6] },
  { art: 'leaves', o: 6, seed: 37, p: [390, 68, 12, 24] },
  { art: 'reed', seed: 38, par: -0.55, p: [398, 96, 4, 24] },
  // SV3 (448,66)
  // ponytail: không có v → ẩn ở trang dọc (tán tùng ngả vào cột chữ, không có khe nào đủ rộng).
  { art: 'tree', o: 1, seed: 51, gap: 0.55, p: [464, 46, 20, 40] },
  { art: 'plum', o: 2, seed: 53, gap: 0.9, p: [476, 40, 22, 18] },
  { art: 'crane', o: 3, seed: 52, p: [440, 40, 24, 8], v: [64, 54, 30, 6] },
  { art: 'petals', o: 4, seed: 54, p: [470, 44, 24, 40] },
  { art: 'rock', o: 3, seed: 55, p: [438, 82, 10, 6] },
  { art: 'reed', o: 4, seed: 56, p: [434, 80, 3, 10], v: [88, 92, 4, 6] },
  { art: 'mist', par: -0.6, p: [468, 86, 30, 4] },
]

export function Services({ children: wp }: SecProps) {
  return (
    <section id="dich-vu" aria-labelledby="tp-svc" className="tp-sec">
      <div data-reveal className="tp-blk p" style={place([210, 50, 34])}>
        <Eb>{SERVICES.eyebrow}</Eb>
        <Title id="tp-svc" text={SERVICES.title} />
        <p className="tp-body reveal" style={idx(6)}>
          {SERVICES.lead}
        </p>
      </div>
      {SERVICES.items.map((s, i) => (
        <article key={s.title} data-reveal className="tp-blk tp-card p" style={place(SVC_AT[i])}>
          <h3 className="tp-brush tp-h3">
            <Words text={s.title} />
          </h3>
          <p className="tp-body reveal" style={idx(2)}>
            {s.text}
          </p>
          <ul className="tp-dots reveal" style={idx(3)}>
            {s.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <p className="tp-fit reveal" style={idx(4)}>
            <b>{SERVICES.fitLabel}</b> {s.fit}
          </p>
          {s.result && (
            <p className="tp-fit reveal" style={idx(5)}>
              <b>{SERVICES.resultLabel}</b> <Rich text={s.result} />
            </p>
          )}
          {s.link && (
            <p className="reveal" style={idx(5)}>
              <a href={s.link.href} className="tp-link">
                <Arrowed text={s.link.label} />
              </a>
            </p>
          )}
        </article>
      ))}
      <Arts list={SVC_ART} />
      {wp}
    </section>
  )
}

/* ---------- Dự án: liễu và đình bên hồ → đèn lồng → thuyền buồm, đèn trời ---------- */

const PRJ_ART: Scene = [
  // Trời lúc chuyển từ Dịch vụ sang.
  { art: 'far', seed: 60, tone: 0.45, par: 0.1, p: [510, 36, 62, 12] },
  { art: 'birds', seed: 69, par: 0.2, p: [522, 44, 24, 6] },
  // PJ1 (544,90)
  { art: 'willow', o: 1, seed: 61, gap: 0.5, p: [576, 64, 16, 30], v: [84, 3, 12, 10] },
  { art: 'pavilion', o: 2, seed: 62, p: [572, 96, 22, 14], v: [84, 20, 14, 6] },
  { art: 'reed', o: 3, seed: 63, p: [500, 102, 3, 10] },
  { art: 'reed', o: 4, seed: 64, p: [506, 105, 3, 8] },
  { art: 'lotus', o: 3, seed: 65, gap: 0.6, p: [514, 108, 30, 6] },
  // PJ2 (640,64)
  { art: 'far', seed: 67, tone: 0.5, par: 0.2, p: [592, 80, 96, 12] },
  { art: 'lanterns', o: 1, seed: 66, p: [594, 68, 34, 10], v: [60, 44, 36, 4] },
  { art: 'mist', o: 2, p: [600, 84, 80, 4] },
  { art: 'boat', o: 3, seed: 68, gap: 0.4, p: [650, 83, 12, 6] },
  // PJ3 (736,90)
  { art: 'willow', o: 1, seed: 72, gap: 0.4, p: [770, 66, 14, 26] },
  { art: 'junk', o: 2, seed: 71, gap: 0.6, p: [744, 104, 14, 7], v: [78, 76, 16, 4] },
  { art: 'rise', o: 3, seed: 73, p: [696, 98, 22, 18] },
  { art: 'reed', o: 4, seed: 74, p: [726, 104, 3, 9] },
  { art: 'mist', par: -0.6, p: [760, 112, 30, 4] },
]

export function Project({ children: wp }: SecProps) {
  return (
    <section id="du-an" aria-labelledby="tp-prj" className="tp-sec">
      <div data-reveal className="tp-blk p" style={place([498, 68, 36])}>
        <Eb>{PROJECT.eyebrow}</Eb>
        <p className="reveal" style={idx(1)}>
          <a href="/du-an/tuchamsocgan" className="tp-link">
            {PROJECT.caption}
          </a>
        </p>
        <Title id="tp-prj" text={PROJECT.title} start={2} />
        <p className="tp-body reveal" style={idx(8)}>
          {PROJECT.lead}
        </p>
      </div>
      <dl data-reveal className="tp-blk tp-facts p" style={place([540, 70, 30])}>
        {PROJECT.facts.map(([k, v], i) => (
          <div key={k} className="reveal" style={idx(i)}>
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
      <div data-reveal className="tp-blk p" style={place([594, 44, 32])}>
        <h3 className="tp-brush tp-h3">
          <Words text={PROJECT.problemTitle} />
        </h3>
        <p className="tp-body reveal" style={idx(2)}>
          <Rich text={PROJECT.problem} />
        </p>
      </div>
      <div data-reveal className="tp-blk p" style={place([632, 44, 54])}>
        <h3 className="tp-brush tp-h3">
          <Words text={PROJECT.doneTitle} />
        </h3>
        <ol className="tp-did">
          {PROJECT.done.map((d, i) => (
            <li key={d.title} className="reveal" style={idx(3 + i)}>
              <span>
                <b>{d.title}</b> {d.text}
                {d.list && (
                  <span className="tp-sub">
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
      <div data-reveal className="tp-blk p" style={place([690, 70, 34])}>
        <h3 className="tp-brush tp-h3">
          <Words text={PROJECT.quotesTitle} />
        </h3>
        {PROJECT.quotes.map((q, i) => (
          <figure key={i} className="tp-quote reveal" style={idx(3 + i)}>
            <blockquote>“{q.text}”</blockquote>
            <figcaption>— {q.by}</figcaption>
          </figure>
        ))}
      </div>
      <div data-reveal className="tp-blk p" style={place([734, 72, 32])}>
        <p className="tp-bridge reveal">{PROJECT.bridge}</p>
        <div className="tp-ctas reveal" style={idx(2)}>
          <a href="#lien-he" className="seal">
            {PROJECT.similar}
          </a>
          <a href={PROJECT.liveUrl} target="_blank" rel="noopener noreferrer" className="tp-link">
            <Arrowed text={PROJECT.live} />
          </a>
        </div>
      </div>
      <Arts list={PRJ_ART} />
      {wp}
    </section>
  )
}

/* ---------- Tình huống: xóm nhỏ khói bếp, diều → nhà sàn trong mưa, thuyền ---------- */

const SC_AT: Box[] = [[820, 46, 27], [852, 50, 26], [884, 70, 30]]
const SC_ART: Scene = [
  // Trời lúc chuyển từ Dự án sang; đàn nhạn lúc chuyển sang Cách làm việc (máy quay hạ thấp, trời hẹp).
  { art: 'far', seed: 80, tone: 0.45, par: 0.1, p: [700, 36, 64, 12] },
  { art: 'geese', seed: 89, par: 0.2, p: [722, 46, 24, 6] },
  { art: 'geese', seed: 98, par: 0.1, p: [936, 47, 24, 7] },
  // SC1 (832,64)
  { art: 'village', o: 1, seed: 81, gap: 0.4, p: [784, 70, 28, 14], v: [84, 12, 14, 6] },
  { art: 'smoke', o: 2, seed: 82, gap: 0.5, p: [796, 69, 8, 10], v: [84, 6, 6, 6] },
  { art: 'kite', o: 3, seed: 83, gap: 0.3, p: [848, 77, 16, 13], v: [82, 40, 12, 12] },
  // SC2 (928,90)
  { art: 'village', o: 1, seed: 91, gap: 0.7, p: [922, 74, 30, 18], v: [76, 66, 20, 6] },
  { art: 'smoke', o: 2, seed: 92, gap: 0.3, p: [928, 71, 8, 12] },
  { art: 'boat', o: 2, seed: 94, gap: 0.5, p: [940, 99, 12, 6], v: [86, 90, 12, 3] },
  { art: 'boat', o: 3, seed: 95, gap: 0.3, p: [958, 95, 10, 5] },
  { art: 'reed', o: 3, seed: 96, p: [886, 98, 3, 10] },
  { art: 'reed', o: 4, seed: 97, p: [892, 100, 3, 8] },
  { art: 'rain', o: 4, seed: 93, p: [918, 64, 58, 40], v: [76, 72, 20, 12] },
  { art: 'mist', o: 5, p: [886, 106, 60, 4] },
]

export function Scenarios({ children: wp }: SecProps) {
  return (
    <section id="tinh-huong" aria-labelledby="tp-scn" className="tp-sec">
      <div data-reveal className="tp-blk p" style={place([786, 44, 30])}>
        <Eb>{SCENARIOS.eyebrow}</Eb>
        <Title id="tp-scn" text={SCENARIOS.title} />
      </div>
      {SCENARIOS.items.map((s, i) => (
        <article key={s.title} data-reveal className="tp-blk p" style={place(SC_AT[i])}>
          <p className="reveal">
            <span className="tp-tag">{SCENARIOS.tag}</span>
          </p>
          <h3 className="tp-brush tp-h3">
            <Words text={s.title} start={1} />
          </h3>
          <p className="tp-ba reveal" style={idx(3)}>
            <b>{SCENARIOS.before}</b> {s.before}
          </p>
          {/* Nét mực rối gỡ thành một đường thẳng: trước → sau. */}
          <svg aria-hidden viewBox="0 0 120 24" className="tp-untangle reveal" style={idx(4)} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
            <path pathLength={1} d="M2 14C8 2 14 24 19 10S30 0 26 13s11 9 15-4 10-3 8 5c5-2 10-2 18-2h48" />
            <path pathLength={1} d="m109 7 6 5-6 5" stroke="#b8322a" />
          </svg>
          <p className="tp-ba reveal" style={idx(5)}>
            <b>{SCENARIOS.after}</b> {s.after}
          </p>
        </article>
      ))}
      <Arts list={SC_ART} />
      {wp}
    </section>
  )
}

/* ---------- Cách làm việc: bốn bước như bậc đá chéo lên, đèn trời bay sang cảnh sau ---------- */

const STEP_AT: Box[] = [[978, 62, 20], [1001, 56, 20], [1024, 50, 20], [1047, 44, 20]]
const PRC_ART: Scene = [
  // PR (1024,63)
  { art: 'stones', o: 1, seed: 101, p: [1000, 76, 66, 10], v: [87, 30, 11, 40] },
  { art: 'mist', o: 2, p: [978, 87, 90, 4] },
  { art: 'birds', o: 3, seed: 103, par: 0.2, p: [1020, 38, 24, 6] },
  { art: 'reed', o: 3, seed: 102, p: [976, 84, 3, 8] },
  { art: 'rise', o: 4, seed: 104, p: [1060, 70, 14, 40], v: [84, 80, 12, 16] },
]

export function Process({ children: wp }: SecProps) {
  return (
    <section id="cach-lam-viec" aria-labelledby="tp-prc" className="tp-sec">
      <div data-reveal className="tp-blk p" style={place([978, 41, 36])}>
        <Eb>{PROCESS.eyebrow}</Eb>
        <Title id="tp-prc" text={PROCESS.title} />
      </div>
      <ol className="tp-blk tp-steps">
        {PROCESS.steps.map((s, i) => (
          <li key={s.title} data-reveal className="tp-blk tp-step p" style={place(STEP_AT[i])}>
            <h3 className="tp-brush tp-h3">
              <Words text={s.title} start={1} />
            </h3>
            {s.meta && (
              <p className="tp-meta reveal" style={idx(3)}>
                <Rich text={s.meta} />
              </p>
            )}
            <p className="tp-body reveal" style={idx(4)}>
              <Rich text={s.text} />
            </p>
          </li>
        ))}
      </ol>
      <p data-reveal className="tp-blk p" style={place([1047, 67.5, 21])}>
        <span className="reveal">
          <a href="#lien-he" className="seal">
            <Arrowed text={PROCESS.cta} />
          </a>
        </span>
      </p>
      <Arts list={PRC_ART} />
      {wp}
    </section>
  )
}

/* ---------- Vì sao: một vòng Ensō lớn ôm tiêu đề, trăng trong vòng ---------- */

const WHY_ART: Scene = [
  // WY (1121,88)
  { art: 'enso', o: 1, d: 1.8, seed: 111, p: [1074, 66, 40, 40], v: [80, 1, 16, 8] },
  { art: 'moon', o: 2, seed: 112, p: [1089, 68, 10, 10] },
  { art: 'rise', o: 3, seed: 113, p: [1080, 106, 26, 10] },
  { art: 'reed', o: 3, seed: 114, p: [1152, 102, 3, 10], v: [90, 90, 4, 8] },
  { art: 'reed', o: 4, seed: 115, p: [1160, 104, 3, 8] },
  { art: 'mist', o: 5, p: [1116, 102, 52, 4] },
]

function WhyList({ from, to }: { from: number; to?: number }) {
  return (
    <ul className="tp-why">
      {WHY.items.slice(from, to).map((w, i) => (
        <li key={w.title} className="reveal" style={idx(1 + i)}>
          <b>{w.title}</b> <Rich text={w.text} />
        </li>
      ))}
    </ul>
  )
}

export function Why({ children: wp }: SecProps) {
  return (
    <section id="vi-sao" aria-labelledby="tp-why" className="tp-sec">
      <div data-reveal className="tp-blk tp-ring p" style={place([1080, 79, 28])}>
        <Eb>{WHY.eyebrow}</Eb>
        <Title id="tp-why" text={WHY.title} />
      </div>
      <div data-reveal className="tp-blk p" style={place([1117, 67, 23])}>
        <WhyList from={0} to={3} />
      </div>
      <div data-reveal className="tp-blk p" style={place([1143, 67, 23])}>
        <WhyList from={3} />
        <p className="tp-aside reveal" style={idx(4)}>
          {WHY.enso}
        </p>
        <p className="tp-fit reveal" style={idx(5)}>
          <Rich text={WHY.team} />
        </p>
      </div>
      <Arts list={WHY_ART} />
      {wp}
    </section>
  )
}

/* ---------- Hỏi đáp: diều bay trên ba cột câu hỏi. Mở một câu thì câu khác tự đóng (details name). ---------- */

const FAQ_ART: Scene = [
  // FQ (1216,64)
  { art: 'kite', o: 2, seed: 121, gap: 0.45, p: [1216, 40, 22, 13], v: [82, 2, 14, 10] },
  { art: 'birds', o: 3, seed: 122, par: 0.2, p: [1236, 44, 20, 7] },
  { art: 'mist', o: 4, p: [1170, 89, 94, 3] },
  // Nửa dưới: núi xa thấp dưới đáy câu trả lời dài nhất (y ≈ 79), bờ lau, đá, thuyền câu trên dòng suối.
  { art: 'far', seed: 125, tone: 0.4, par: 0.15, p: [1170, 77, 92, 9] },
  { art: 'reed', o: 5, seed: 123, p: [1172, 81, 3, 10] },
  { art: 'reed', o: 5, seed: 124, p: [1177, 84, 3, 8] },
  { art: 'rock', o: 5, seed: 126, p: [1180, 87, 8, 4] },
  { art: 'boat', o: 6, seed: 127, gap: 0.5, p: [1240, 84, 12, 6] },
]

export function Faq({ children: wp }: SecProps) {
  const cols = [0, 3, 6].map((k) => FAQ.items.slice(k, k + 3))
  return (
    <section id="hoi-dap" aria-labelledby="tp-faq" className="tp-sec">
      <div data-reveal className="tp-blk p" style={place([1170, 42, 60])}>
        <Eb>{FAQ.eyebrow}</Eb>
        <Title id="tp-faq" text={FAQ.title} />
      </div>
      {cols.map((col, c) => (
        <div key={c} data-reveal className="tp-blk tp-faq p" style={place([1170 + 32 * c, 54, 29])}>
          {col.map((f, i) => (
            <details key={f.q} name="faq" className="qa tp-qa reveal" style={idx(c + i)}>
              <summary>
                {f.q}
                <span aria-hidden className="plus">
                  +
                </span>
              </summary>
              <div className="tp-ans">
                {f.a && (
                  <p>
                    <Rich text={f.a} />
                  </p>
                )}
                {f.list && (
                  <ul className="tp-dots">
                    {f.list.map((l) => (
                      <li key={l}>
                        <Rich text={l} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </details>
          ))}
        </div>
      ))}
      <Arts list={FAQ_ART} />
      {wp}
    </section>
  )
}

/* ---------- Liên hệ: ao sen, cá bơi vòng dưới các kênh liên lạc ---------- */

const CT_ART: Scene = [
  // CT (1312,88)
  { art: 'lotus', o: 1, seed: 131, gap: 0.4, p: [1266, 104, 30, 8], v: [76, 94, 22, 3] },
  { art: 'fish', o: 2, seed: 132, p: [1290, 97, 30, 12], v: [78, 80, 18, 8] },
  { art: 'reed', o: 3, seed: 133, p: [1264, 96, 3, 10] },
  { art: 'rock', o: 3, seed: 134, p: [1314, 108, 8, 5] },
]

export function Contact({ children: wp }: SecProps) {
  return (
    <section id="lien-he" aria-labelledby="tp-ct" className="tp-sec">
      <div data-reveal className="tp-blk p" style={place([1266, 67, 28])}>
        <Eb>{CONTACT_SECTION.eyebrow}</Eb>
        <Title id="tp-ct" text={CONTACT_SECTION.title} />
        <p className="tp-body reveal" style={idx(10)}>
          {CONTACT_SECTION.lead}
        </p>
      </div>
      <ul data-reveal className="tp-blk tp-ch p" style={place([1298, 67, 22])}>
        {CONTACT_SECTION.channels.map((c, i) => (
          <li key={c.href} className="reveal" style={idx(i)}>
            <a href={c.href} {...ext(c.href)}>
              <small>{c.label}</small>
              <strong>{c.value}</strong>
              {c.note && (
                <small>
                  <Rich text={c.note} />
                </small>
              )}
            </a>
          </li>
        ))}
      </ul>
      <div data-reveal className="tp-blk p" style={place([1324, 67, 34])}>
        <div className="reveal" style={idx(2)}>
          <InkForm />
        </div>
      </div>
      <Arts list={CT_ART} />
      {wp}
    </section>
  )
}
