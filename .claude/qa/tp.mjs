// Chụp bản thư pháp: node .claude/qa/tp.mjs <out> <WxH> [paint|vert] [rm] [nogl] [url]
// paint: các trạm + từng khung hoá rồng theo journey() trong src/thu-phap/layout.ts (sửa STEPS thì sửa V ở đây).
// vert: cuộn từng 0,9 màn, màn thác chụp theo tiến độ f.
import { mkdirSync } from 'node:fs'
const { chromium } = await import('file:///D:/Jobs/EnsoTech%20Studio/Ensotech/node_modules/playwright/index.mjs')
const args = process.argv.slice(2)
const [out, size = '1440x900', mode = 'paint'] = args
const url = args.find((a) => a.startsWith('http')) ?? 'http://127.0.0.1:3000/'
const [w, h] = size.split('x').map(Number)
// wait=ms: chờ lâu hơn để nét chữ lộ hết (tiêu đề cần ~1,7 s), mặc định 1500 (paint) / 900 (vert).
const wait = args.find((a) => a.startsWith('wait='))?.slice(5)
mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const page = await browser.newPage({ viewport: { width: w, height: h }, reducedMotion: args.includes('rm') ? 'reduce' : 'no-preference' })
if (args.includes('nogl'))
  await page.addInitScript(() => {
    const g = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (t, ...a) {
      return /webgl/.test(t) ? null : g.call(this, t, ...a)
    }
  })
const logs = []
page.on('console', (m) => ['error', 'warning'].includes(m.type()) && logs.push(`${m.type()}: ${m.text()}`))
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`))
await page.goto(url, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(4000)
const info = await page.evaluate(() => {
  const root = document.querySelector('.tp'), falls = document.querySelector('.tp-falls'), fs = document.querySelector('.tp-fstage')
  const r = falls.getBoundingClientRect()
  return {
    paint: !!document.querySelector('.tp-world').style.transform,
    flat: 'flat' in root.dataset,
    U: root.style.getPropertyValue('--U'),
    H: document.documentElement.scrollHeight,
    fallsTop: Math.round(r.top + scrollY),
    span: falls.offsetHeight - fs.offsetHeight,
  }
})
let n = 0
const cut = []
const snap = async (tag) => {
  // Chữ bị mép màn cắt ngang (hiện một phần) là lỗi bố cục.
  const bad = await page.evaluate(() => {
    const head = [...document.querySelectorAll('.tp-head > *')].map((e) => e.getBoundingClientRect())
    return [...document.querySelectorAll('.tp .p')].flatMap((el) => {
      const r = el.getBoundingClientRect()
      const kids = el.querySelectorAll('.reveal')
      const own = +getComputedStyle(el).opacity
      const op = own * (kids.length ? Math.max(...[...kids].map((e) => +getComputedStyle(e).opacity)) : 1)
      const inView = r.right > 0 && r.left < innerWidth && r.bottom > 0 && r.top < innerHeight
      const whole = r.left >= -1 && r.right <= innerWidth + 1 && r.top >= -1 && r.bottom <= innerHeight + 1
      const name = `${el.className.split(' ')[0]} "${el.textContent.slice(0, 24)}"`
      // DIM: nằm trọn trong khung mà vẫn bị mờ do mép (trạm dừng không được có).
      if (whole && own > 0.02 && own < 0.97 && r.width > 0) return [`DIM ${own} ${name}`]
      // HEAD: chữ nằm dưới logo / nút Zalo cố định ở đầu trang.
      if (op > 0.05 && head.some((h) => r.left < h.right + 8 && r.right > h.left - 8 && r.top < h.bottom + 8 && r.bottom > h.top - 8)) return [`HEAD ${name}`]
      return inView && !whole && op > 0.05 && r.width > 0 ? [`${name} ${[r.left, r.top, r.right, r.bottom].map(Math.round)}`] : []
    })
  })
  if (bad.length) cut.push(`${tag}: ${bad.join(' | ')}`)
  await page.screenshot({ path: `${out}/${String(n++).padStart(2, '0')}-${tag}.png` })
}
const go = async (y, wait) => {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(y))
  await page.waitForTimeout(wait)
}
if (mode === 'paint') {
  // Trạm dừng = giữa mỗi hold; x-…: giữa đoạn chuyển chương (máy quay lùi xa, vồng lên/xuống).
  const FIN0 = 26.45
  const V = [
    ['hero', 0], ['t1', 0.8], ['b1', 1.7], ['t2', 2.65], ['b2', 3.65], ['x-sv', 4.65], ['sv1', 5.5], ['t-sv', 6.3], ['sv2', 7.1], ['sv3', 8.7],
    ['x-pj', 9.55], ['pj1', 10.4], ['pj2', 12], ['pj3', 13.6], ['x-sc', 14.45], ['sc1', 15.3], ['sc2', 16.9], ['x-pr', 17.75], ['pr', 18.65],
    ['t-wy', 19.5], ['wy', 20.35], ['x-fq', 21.2], ['fq', 22.1], ['ct', 23.95], ['x-gate', 24.9], ['gate', 25.6],
    ...[0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map((f) => [`f${f}`, FIN0 + 5 * f]),
    ['end', 31.65],
  ]
  const only = args.find((a) => a.startsWith('only='))?.slice(5).split(',')
  for (const [tag, v] of V) {
    if (only && !only.includes(tag)) continue
    await go(v * h, +(wait ?? 1500))
    await snap(tag)
    if (tag === 'fq') {
      // Mở lần lượt từng câu hỏi (tắt hiệu ứng mở): câu trả lời dài nhất không được tràn khỏi màn.
      const worst = await page.evaluate(() => {
        const st = document.head.appendChild(document.createElement('style'))
        st.textContent = '.qa::details-content{transition:none!important}'
        let w = { b: 0, q: '' }
        for (const d of document.querySelectorAll('.tp-qa')) {
          d.open = true
          const b = d.closest('.p').getBoundingClientRect().bottom
          if (b > w.b) w = { b: Math.round(b), q: d.querySelector('summary').textContent.slice(0, 30) }
          d.open = false
        }
        st.remove()
        return { ...w, vh: innerHeight }
      })
      if (worst.b > worst.vh) cut.push(`fq-open: "${worst.q}" bottom ${worst.b} > ${worst.vh}`)
      await page.evaluate(() => (document.querySelector('.tp-qa:last-of-type').open = true))
      await page.waitForTimeout(900)
      await snap('fq-open')
    }
    if (tag === 'ct') {
      await page.click('.tp-form button.seal')
      await page.waitForTimeout(600)
      await snap('ct-err')
    }
  }
} else {
  for (let y = 0; y < info.fallsTop; y += Math.round(h * 0.9)) {
    await go(y, +(wait ?? 900))
    await snap(`y${y}`)
  }
  for (const f of [0, 0.1, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]) {
    await go(info.fallsTop + info.span * f, +(wait ?? 900))
    await snap(`f${f}`)
  }
  for (let y = info.fallsTop + info.span + h; y < info.H; y += Math.round(h * 0.9)) {
    await go(y, +(wait ?? 900))
    await snap(`y${y}`)
  }
}
console.log(JSON.stringify(info), `${n} shots`)
console.log(logs.slice(0, 20).join('\n'))
console.log(cut.length ? `CUT:\n${cut.join('\n')}` : 'CUT: none')
await browser.close()
