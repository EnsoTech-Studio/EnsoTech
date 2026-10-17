// Chụp từng phần tử khớp selector: node .claude/qa/els.mjs <out> <WxH> <url> <selector>
import { mkdirSync } from 'node:fs'
const { chromium } = await import('file:///D:/Jobs/EnsoTech%20Studio/Ensotech/node_modules/playwright/index.mjs')
const [out, size, url, sel] = process.argv.slice(2)
const [w, h] = size.split('x').map(Number)
mkdirSync(out, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: w, height: h } })
await page.goto(url, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
const els = await page.$$(sel)
for (const [i, el] of els.entries()) await el.screenshot({ path: `${out}/${String(i).padStart(2, '0')}.png` })
console.log(`${els.length} shots`)
await browser.close()
