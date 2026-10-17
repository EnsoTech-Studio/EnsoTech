// Trạng thái form thư pháp (API giả, không gửi gì đi): node .claude/qa/tpform.mjs <out> [WxH]
import { mkdirSync } from 'node:fs'
const { chromium } = await import('file:///D:/Jobs/EnsoTech%20Studio/Ensotech/node_modules/playwright/index.mjs')
const [out, size = '390x844'] = process.argv.slice(2)
const [w, h] = size.split('x').map(Number)
mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const page = await browser.newPage({ viewport: { width: w, height: h } })
let reply = { status: 502, body: '{"ok":false}' }
await page.route('**/api/contact', async (r) => {
  await new Promise((s) => setTimeout(s, 1200))
  await r.fulfill({ status: reply.status, contentType: 'application/json', body: reply.body })
})
await page.goto('http://127.0.0.1:3000/thu-phap', { waitUntil: 'networkidle' })
await page.waitForTimeout(3000)
const shot = (n) => page.screenshot({ path: `${out}/${n}.png` })
// Focus như người dùng Tab tới: dọc thì trình duyệt cuộn, tranh thì máy quay lướt tới.
await page.focus('.tp-form [name=name]')
await page.waitForTimeout(2500)
await page.fill('.tp-form [name=name]', 'Chị Lan')
await page.fill('.tp-form [name=phone]', '0912345678')
await page.click('.tp-form .tp-chip >> nth=0')
await page.click('.tp-form button.seal')
await page.waitForTimeout(300)
await shot('1-sending')
await page.waitForTimeout(1500)
await shot('2-fail')
reply = { status: 200, body: '{"ok":true}' }
const y0 = await page.evaluate(() => scrollY)
await page.click('.tp-form button.seal')
await page.waitForTimeout(2500)
await shot('3-ok')
const r = await page.evaluate(() => {
  const d = document.querySelector('.tp-done')
  const b = d?.getBoundingClientRect()
  return { y: scrollY, top: b && Math.round(b.top), bottom: b && Math.round(b.bottom), focused: document.activeElement === d }
})
console.log({ size, y0, ...r, inView: r.top >= 0 && r.bottom <= h })
await browser.close()
