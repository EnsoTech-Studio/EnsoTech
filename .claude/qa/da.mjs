// Chụp trang dự án: node .claude/qa/da.mjs <out> <WxH> [rm]
// Cuộn từng 0,9 màn; ghi lỗi console, mọi phản hồi >= 400 và lúc tiêu đề hiện xong.
import { mkdirSync } from 'node:fs'
const { chromium } = await import('file:///D:/Jobs/EnsoTech%20Studio/Ensotech/node_modules/playwright/index.mjs')
const args = process.argv.slice(2)
const [out, size = '1440x900'] = args
const [w, h] = size.split('x').map(Number)
mkdirSync(out, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: w, height: h }, reducedMotion: args.includes('rm') ? 'reduce' : 'no-preference' })
const logs = []
page.on('console', (m) => ['error', 'warning'].includes(m.type()) && logs.push(`${m.type()}: ${m.text()}`))
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`))
page.on('response', (r) => r.status() >= 400 && logs.push(`${r.status()} ${r.url()}`))
const t0 = Date.now()
await page.goto('http://127.0.0.1:3000/du-an/tuchamsocgan', { waitUntil: 'networkidle' })
await page.waitForFunction(() => +getComputedStyle(document.querySelector('main figure')).opacity > 0.99, null, { timeout: 15000 })
const shown = Date.now() - t0
await page.waitForTimeout(600)
const info = await page.evaluate(() => ({
  H: document.documentElement.scrollHeight,
  overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  h1: document.querySelectorAll('h1').length,
  imgs: [...document.querySelectorAll('main img')].map((i) => `${i.alt.slice(0, 24)}… ${i.naturalWidth ? 'ok' : 'MISSING'}`),
}))
let n = 0
for (let y = 0; y < info.H; y += Math.round(h * 0.9)) {
  await page.evaluate((y) => window.scrollTo(0, y), y)
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${out}/${String(n++).padStart(2, '0')}-y${y}.png` })
}
console.log(JSON.stringify({ ...info, shownMs: shown }), `${n} shots`)
console.log(logs.slice(0, 20).join('\n') || 'logs: none')
await browser.close()
