import type { Metadata } from 'next'
import { Alegreya, Comforter_Brush, Kolker_Brush, Moon_Dance } from 'next/font/google'
import { HERO, PAIN, SERVICES } from '../../../content/vi'

// ponytail: trang tạm để chủ trang chọn phông, xoá sau khi chốt.
// Đã loại vì lỗi dấu tiếng Việt: Splash (mất dấu trên "u"), Grechen Fuemen (mất móc "ư"); Mansalva trông như bút dạ.
const kolker = Kolker_Brush({ subsets: ['latin', 'vietnamese'], weight: '400', display: 'swap' })
const comforter = Comforter_Brush({ subsets: ['latin', 'vietnamese'], weight: '400', display: 'swap' })
const moon = Moon_Dance({ subsets: ['latin', 'vietnamese'], weight: '400', display: 'swap' })
const body = Alegreya({ subsets: ['latin', 'vietnamese'], weight: ['400', '500'], display: 'swap' })

export const metadata: Metadata = { title: 'Thử phông thư pháp', robots: { index: false, follow: false } }

const FONTS = [
  { key: 'A', name: 'Comforter Brush', f: comforter, scale: 1.3 },
  { key: 'B', name: 'Kolker Brush', f: kolker, scale: 1.25 },
  { key: 'C', name: 'Moon Dance', f: moon, scale: 1.25 },
]

export default function FontSheet() {
  return (
    <main className={`${body.className} mx-auto max-w-6xl px-6 py-12`}>
      {FONTS.map(({ key, name, f, scale }) => (
        <section key={key} data-font={key} className="border-b border-ink/15 py-10">
          <p className="text-sm tracking-[0.2em] text-son">
            {key} · {name}
          </p>
          <h2 className={`${f.className} mt-4 leading-[1.3]`} style={{ fontSize: `${3.6 * scale}rem` }}>
            {HERO.title}
          </h2>
          <p className={`${f.className} mt-4 leading-[1.3]`} style={{ fontSize: `${2.3 * scale}rem` }}>
            {PAIN.title} · {SERVICES.title}
          </p>
          <p className="mt-5 max-w-2xl text-[1.12rem] leading-relaxed text-ink/80">{HERO.sub}</p>
        </section>
      ))}
    </main>
  )
}
