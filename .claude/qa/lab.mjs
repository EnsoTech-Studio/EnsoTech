// Chụp phòng thử: node .claude/qa/lab.mjs <outdir> <WxH> "c=koi&t=1" "c=koi&yaw=30" ...
import { mkdirSync } from 'node:fs'
const { chromium } = await import('file:///D:/Jobs/EnsoTech%20Studio/Ensotech/node_modules/playwright/index.mjs')
const [out, size, ...qs] = process.argv.slice(2)
const [w, h] = size.split('x').map(Number)
const q0 = qs.join('&')
mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const page = await browser.newPage({ viewport: { width: w, height: h } })
const logs = []
page.on('console', (m) => (q0.includes('debug') || ['error', 'warning'].includes(m.type())) && logs.push(`${m.type()}: ${m.text().slice(0, 3000)}`))
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`))
let i = 0
for (const q of qs) {
  await page.goto(`http://127.0.0.1:3000/lab?${q}`, { waitUntil: 'load', timeout: 90000 })
  await page.waitForFunction(() => window.__ready, null, { timeout: 90000 }).catch(() => logs.push(`timeout: ${q}`))
  await page.screenshot({ path: `${out}/${String(i++).padStart(2, '0')}.png` })
}
console.log(`${i} shots`)
console.log(logs.slice(0, 10).join('\n'))
await browser.close()
