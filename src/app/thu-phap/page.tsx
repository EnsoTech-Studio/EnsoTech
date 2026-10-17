import type { Metadata } from 'next'
import { Alegreya, Kolker_Brush } from 'next/font/google'
import { CONTACT, FOOTER, HERO, NAV, NAV_CTA, PAIN, SITE, UI } from '../../content/vi'
import { Enso } from '../../voyage/chrome'
import { Arrowed, Rich, Words, idx } from '../../voyage/ui'
import { A, place, type Box } from '../../thu-phap/anchor'
import { Contact, Faq, Process, Project, Scenarios, Services, Why } from '../../thu-phap/chapters'
import Painting from '../../thu-phap/painting.client'
import '../../thu-phap/thu-phap.css'

// ponytail: bản mẫu để duyệt hướng thư pháp; chốt rồi mới thay trang chính.
const brush = Kolker_Brush({ subsets: ['latin', 'vietnamese'], weight: '400', display: 'swap', variable: '--font-brush' })
const serif = Alegreya({ subsets: ['latin', 'vietnamese'], weight: ['400', '500', '700'], display: 'swap', variable: '--font-serif' })

export const metadata: Metadata = { title: 'Thư pháp', robots: { index: false, follow: false } }

// Dòng suối: cá bơi ngược từ đầu trang xuống, qua các hòn đá (nỗi khổ), rồi uốn lượn dưới chân từng chương tới chân thác.
const STREAM_P: Box[] = [
  [96, 4], [89, 16], [83, 28], [79, 40], [73, 53], [64, 64], [58, 76], [58, 89], [65, 102], [80, 111], [100, 115],
  [121, 113], [141, 115], [161, 121], [180, 127], [198, 124], [214, 104], [256, 95], [290, 98], [298, 110], [312, 119],
  [350, 120], [392, 116], [398, 100], [412, 89], [448, 88], [484, 92], [500, 104], [512, 112], [544, 114], [578, 112],
  [592, 100], [606, 89], [640, 88], [690, 95], [710, 113], [736, 114], [772, 112], [786, 98], [800, 89], [832, 88],
  [876, 100], [900, 113], [928, 114], [966, 112], [982, 96], [1000, 88], [1024, 88], [1062, 87], [1076, 104],
  [1090, 112], [1120, 112], [1160, 111], [1172, 96], [1184, 89], [1216, 89], [1256, 90], [1270, 104], [1282, 111],
  [1312, 112], [1350, 113], [1392, 116], [1426, 125], [1440, 130],
]
// Trang dọc: suối chạy ở làn phải, đổi bên một chút mỗi chương cho khỏi thẳng đơ.
const STREAM_V: [string, Box][] = [
  ['hero', [88, 10]], ['hero', [80, 46]], ['hero', [90, 88]],
  ['pain', [93, 6]], ['pain', [85, 34]], ['pain', [93, 64]], ['pain', [86, 96]],
  ['svc', [92, 4]], ['svc', [94, 50]], ['svc', [90, 96]],
  ['prj', [93, 4]], ['prj', [95, 56]], ['prj', [90, 96]],
  ['scn', [94, 4]], ['scn', [92, 54]], ['scn', [95, 96]],
  ['prc', [92, 4]], ['prc', [94, 96]],
  ['why', [93, 4]], ['why', [90, 96]],
  ['faq', [94, 4]], ['faq', [92, 96]],
  ['ct', [93, 4]], ['ct', [94, 70]],
  ['falls', [80, 4]], ['falls', [72, 18]],
]
const PAIN_AT: Box[] = [
  // Mỗi ô phải nằm trọn trong một điểm dừng của máy quay (B1 x 0–100, B2 x 92–192), không bị mép cắt.
  [7, 86, 33], [63, 77, 27], [13, 104, 36],
  [100, 84, 24], [100, 121, 24], [119, 93, 25], [118, 126.5, 28],
]
const ROCKS: Box[] = [
  [42, 84, 10, 6], [63, 92, 7, 4.5], [52, 106, 9, 5.5],
  [118, 106, 9, 5.5], [149, 110, 10, 6], [187, 117, 5, 4],
]
/** Thác và đoạn kết nằm sau các chương, cách chỗ cũ (ngay sau nỗi khổ) một quãng này. */
const DX = 1246
const dx = ([x, ...r]: Box): Box => [x + DX, ...r]

export default function ThuPhap() {
  const wp = (where: string) =>
    STREAM_V.map(([w, v], i) => (w === where ? <A key={`v${i}`} art="wp" o={i} v={v} /> : null))

  return (
    <div data-tp className={`tp ${brush.variable} ${serif.variable}`}>
      <div className="paper" aria-hidden />
      <Painting />

      <header className="tp-head">
        <a href="#dau-trang" className="tp-brand" aria-label={UI.home}>
          <span className="tp-chop" aria-hidden>
            <Enso className="size-[70%]" />
          </span>
          <span className="tp-brush whitespace-nowrap text-[length:clamp(1.25rem,5.6vw,1.9rem)] leading-none" aria-hidden>
            {SITE.name}
          </span>
        </a>
        <nav aria-label={UI.menu} className="tp-nav">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`}>
              {n.label}
            </a>
          ))}
        </nav>
        <a href={CONTACT.zaloHref} target="_blank" rel="noopener noreferrer" className="seal seal-sm">
          {NAV_CTA}
        </a>
      </header>

      <main className="tp-scroll">
        <div className="tp-stage">
          <div className="tp-world">
            <section id="dau-trang" aria-labelledby="tp-hero" className="tp-sec tp-hero" data-in>
              <p className="tp-eb reveal p" style={{ ...place([7.2, 10]), ...idx(0) }}>
                {HERO.eyebrow}
              </p>
              <h1 id="tp-hero" className="tp-brush tp-h1 p" style={place([6.6, 12.4, 58])}>
                <Words text={HERO.title} start={1} />
              </h1>
              <p className="tp-body reveal p" style={{ ...place([7.3, 34.6, 41]), ...idx(9) }}>
                {HERO.sub}
              </p>
              <div className="tp-ctas reveal p" style={{ ...place([7.3, 44.2]), ...idx(11) }}>
                <a href={CONTACT.zaloHref} target="_blank" rel="noopener noreferrer" className="seal">
                  {HERO.primary}
                </a>
                <a href="#du-an" className="tp-link">
                  <Arrowed text={HERO.secondary} />
                </a>
              </div>
              <ul className="tp-trust reveal p" style={{ ...place([7.3, 51.4, 64]), ...idx(13) }}>
                {HERO.trust.map((t) => (
                  <li key={t}>
                    <Rich text={t} />
                  </li>
                ))}
              </ul>

              <A art="sun" o={0} par={0.32} p={[80, 6, 6, 6]} v={[74, 3, 12, 6]} />
              <A art="mount" o={0} tone={0.42} seed={3} par={0.16} p={[56, 0, 48, 14]} v={[30, 0, 72, 9]} />
              <A art="mount" o={1} tone={0.85} seed={8} par={0.08} p={[67, 7, 36, 15]} v={[56, 3, 46, 9]} />
              <A art="tower" o={1} tone={0.5} seed={2} par={0.14} p={[64, 6, 4, 9]} />
              <A art="mist" o={1} par={0.08} p={[56, 14, 46, 5]} />
              <A art="birds" o={2} seed={4} par={0.22} p={[60, 2, 30, 12]} v={[20, 2, 60, 8]} />
              <A art="tree" o={4} seed={12} gap={0.6} p={[88, 16, 11, 22]} />
              <A art="leaves" o={5} seed={6} p={[84, 16, 16, 30]} />
              <A art="bridge" o={5} seed={7} p={[71, 35, 15, 9]} />
              <A art="dragonfly" o={6} seed={3} p={[90, 40, 8, 8]} />
              <A art="reed" o={6} seed={2} p={[93, 44, 3, 11]} v={[92, 70, 4, 16]} />
              <A art="reed" o={7} seed={5} p={[66, 48, 3, 8]} />
              <A art="rock" o={5} seed={11} p={[80, 50, 6, 4]} />
              <A art="drift" p={[0, 0, 1, 1]} v={[0, 0, 1, 1]} />
              {STREAM_P.map((p, i) => (
                <A key={i} art="wp" o={i} p={p} />
              ))}
              {wp('hero')}
            </section>

            <section id="noi-kho" aria-labelledby="tp-pain" className="tp-sec tp-pain">
              <div data-reveal className="tp-intro p" style={place([7, 71, 46])}>
                <p className="tp-eb reveal">{PAIN.eyebrow}</p>
                <h2 id="tp-pain" className="tp-brush tp-h2">
                  <Words text={PAIN.title} start={1} />
                </h2>
              </div>
              <ol className="tp-items">
                {PAIN.items.map((t, i) => (
                  <li key={t} data-reveal className="tp-item p" style={place(PAIN_AT[i])}>
                    <span className="reveal">{t}</span>
                  </li>
                ))}
              </ol>
              <div data-reveal className="tp-close p" style={place([157, 84, 25])}>
                <p className="tp-body reveal">{PAIN.closing}</p>
                <p className="reveal" style={idx(2)}>
                  <a href="#lien-he" className="tp-link">
                    <Arrowed text={PAIN.link} />
                  </a>
                </p>
              </div>
              {ROCKS.map((p, i) => (
                <A key={i} art="rock" seed={20 + i} p={p} />
              ))}
              <A art="reed" seed={9} p={[3, 100, 3, 8]} />
              <A art="reed" seed={13} p={[88, 98, 3, 9]} />
              <A art="reed" seed={17} p={[188, 112, 3, 10]} />
              <A art="rock" seed={31} v={[80, 52, 16, 4]} />
              {/* Cảnh 1: cành mai vươn từ mép phải, hoa rơi; sen dưới chân. Cảnh 2: hạc bay, thuyền câu, sen. */}
              {/* Đỉnh khung B1 là y 65 ở màn thấp, menu cao ~3,6 U: cành bắt đầu từ 71; nhánh rủ nằm ở x > 91, chữ ý 2 dừng ở x 90. */}
              <A art="plum" o={1} seed={5} gap={0.9} p={[86, 71, 15, 9]} v={[60, 0, 40, 5]} />
              <A art="petals" o={2} seed={3} p={[87, 72, 13, 34]} v={[70, 1, 30, 22]} />
              <A art="lotus" o={4} seed={8} gap={0.7} p={[70, 111, 20, 7]} v={[46, 96, 50, 2.5]} />
              <A art="lotus" o={4} seed={14} gap={0.35} p={[22, 112, 22, 6]} />
              <A art="dragonfly" o={5} seed={8} p={[70, 102, 10, 6]} />
              <A art="crane" seed={6} p={[126, 80, 30, 11]} />
              <A art="boat" o={3} seed={2} gap={0.6} p={[174, 121, 11, 6]} />
              <A art="lotus" o={4} seed={21} gap={0.35} p={[148, 124, 18, 6]} />
              <A art="dragonfly" o={5} seed={12} p={[150, 116, 10, 6]} />
              {wp('pain')}
            </section>

            <Services>{wp('svc')}</Services>
            <Project>{wp('prj')}</Project>
            <Scenarios>{wp('scn')}</Scenarios>
            <Process>{wp('prc')}</Process>
            <Why>{wp('why')}</Why>
            <Faq>{wp('faq')}</Faq>
            <Contact>{wp('ct')}</Contact>

            <div className="tp-falls" aria-hidden>
              {/* Cổng thác (máy quay lùi xa): dãy núi xa và đàn nhạn bay về phía thác. */}
              <A art="far" seed={9} tone={0.8} par={0.3} p={[1362, 42, 60, 24]} />
              <A art="geese" seed={5} gap={0.6} par={0.2} p={[1366, 36, 52, 14]} />
              <div className="tp-fstage">
                <A art="cliff" seed={4} gap={0.591} p={dx([166, 10, 62, 122])} v={[39, 30, 60, 64]} />
                <A art="pool" p={dx([190, 125, 28, 8])} v={[62, 90, 30, 6]} />
                <A art="lip" p={dx([207, 31])} v={[79, 39]} />
                <A art="sky" p={dx([122, -6, 112, 108])} v={[0, 0, 100, 100]} />
                <A art="cloud" seed={6} p={dx([126, -2, 48, 24])} v={[-10, 4, 70, 14]} />
                <A art="cloud" seed={7} p={dx([124, 60, 40, 20])} v={[10, 56, 70, 12]} />
                <A art="mist" over={1} p={dx([140, 42, 56, 6])} v={[-5, 44, 80, 4]} />
                <A art="mist" over={1} p={dx([176, 14, 34, 4])} v={[30, 18, 60, 3]} />
                <A art="crane" seed={9} gap={0.6} v={[0, 18, 45, 12]} />
                {/* Vị trí theo hướng màn (--e* trong thu-phap.css), con dấu tính theo vòng nên không dùng place(). */}
                <i aria-hidden className="a tp-enso-v" data-art="enso" data-f="0.8 0.93" data-v="" />
                <span className="tp-stamp tp-stamp-v">
                  <Enso className="size-[72%]" />
                </span>
              </div>
              {wp('falls')}
            </div>

            <section id="chan-trang" aria-labelledby="tp-fin" className="tp-sec tp-fin">
              <A art="enso" f="0.8 0.93" p={dx([234, 8, 28, 28])} />
              <span className="tp-stamp p" style={place(dx([263.5, 27, 5.4]))}>
                <Enso className="size-[72%]" />
              </span>
              <Enso className="tp-flat-enso" />
              <div data-reveal className="tp-fin-text p" style={place(dx([234, 44, 48]))}>
                <h2 id="tp-fin" className="tp-brush tp-h-fin reveal">
                  {SITE.name}
                </h2>
                <p className="tp-body reveal" style={idx(1)}>
                  {FOOTER.description}
                </p>
                <div className="reveal" style={idx(2)}>
                  <a href={CONTACT.zaloHref} target="_blank" rel="noopener noreferrer" className="seal">
                    {NAV_CTA}
                  </a>
                </div>
                <h3 className="tp-eb reveal" style={idx(3)}>
                  {FOOTER.contactTitle}
                </h3>
                <ul className="tp-contact reveal" style={idx(4)}>
                  {FOOTER.contact.map((c) => (
                    <li key={c.href}>
                      <a href={c.href} className="tp-link" {...(c.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                        {c.label}
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="tp-legal reveal" style={idx(5)}>
                  {FOOTER.legal} · <Rich text={FOOTER.legalNote} />
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <div className="grain" aria-hidden />
      {/* Mép con dấu son: răng cưa như dấu đóng trên giấy. */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <filter id="tp-rough">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="3.2" />
        </filter>
      </svg>
    </div>
  )
}
