// Chụp hành trình: node .claude/qa/shot.mjs <out> <WxH> [pan|fin|vert] [url]
import { mkdirSync } from 'node:fs'
const { chromium } = await import('file:///D:/Jobs/EnsoTech%20Studio/Ensotech/node_modules/playwright/index.mjs')
// Thêm +d sau chế độ (vd. pan+d) để chụp khi đã hoá rồng.
const [out = 'shots', size = '1440x900', mode0 = 'pan', url = 'http://127.0.0.1:3000/'] = process.argv.slice(2)
const mode = mode0.replace(/\+d$/, '')
const [w, h] = size.split('x').map(Number)
mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const page = await browser.newPage({ viewport: { width: w, height: h } })
if (mode0 !== mode) await page.addInitScript(() => sessionStorage.setItem('ensotech:dragon', '1'))
const logs = []
page.on('console', (m) => ['error', 'warning'].includes(m.type()) && logs.push(`${m.type()}: ${m.text()}`))
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`))
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
const info = await page.evaluate(() => {
  const track = document.querySelector('footer[data-chapter]')?.parentElement
  const wrap = track?.parentElement.parentElement
  return { hz: matchMedia('(min-width: 64rem) and (min-height: 37.5rem)').matches, top: wrap ? wrap.getBoundingClientRect().top + scrollY : 0, H: document.documentElement.scrollHeight, trackW: track?.offsetWidth ?? 0 }
})
const go = async (y, wait = 2000) => {
  await page.evaluate((y) => window.scrollTo(0, y), y)
  await page.waitForTimeout(wait)
}
let n = 0
const snap = (tag) => page.screenshot({ path: `${out}/${String(n++).padStart(2, '0')}-${tag}.png` })
if (mode === 'pan') {
  const max = info.H - h
  const stageStart = await page.evaluate(() => { const s = document.querySelector('[data-stage]'); let v = 0; for (let e = s; e && !e.matches('[data-env]') && e.offsetParent; e = e.offsetParent) v += e.offsetLeft; return v })
  for (let y = 0; y < stageStart; y += Math.round(w * 0.85)) { await go(info.top + y); await snap(`x${y}`) }
} else if (mode === 'fin') {
  const H = info.H - h
  for (const f of [0, 0.08, 0.16, 0.24, 0.32, 0.4, 0.48, 0.56, 0.64, 0.72, 0.8, 0.88, 1]) {
    const y = await page.evaluate((f) => {
      const s = document.querySelector('[data-stage]')
      const hz = matchMedia('(min-width: 64rem) and (min-height: 37.5rem)').matches
      const max = document.documentElement.scrollHeight - innerHeight
      if (hz) return max - Math.round(innerHeight * 1.6 * (1 - f))
      const top = s.getBoundingClientRect().top + scrollY
      return top + (s.offsetHeight - innerHeight) * f
    }, f)
    await go(y, 900)
    await snap(`fin${f}`)
  }
} else if (mode.startsWith('at:')) {
  // at:<x> = đứng yên ở một chỗ trên hành trình, chụp 5 khung cách 1,5 s (rồng đã ổn định trên vòng lượn chưa).
  await go(info.top + Number(mode.slice(3)), 4000)
  for (let k = 0; k < 5; k++) { await snap(`at${k}`); await page.waitForTimeout(1500) }
} else if (mode.startsWith('fly:')) {
  // fly:<file.json> = [{ name, flight, sd, drifts: [..], fin? }]: đặt đường bay thử qua móc QA rồi chụp.
  const { readFileSync } = await import('node:fs')
  const cands = JSON.parse(readFileSync(mode.slice(4), 'utf8'))
  for (const c of cands) {
    const y = await page.evaluate((f) => document.documentElement.scrollHeight - innerHeight - Math.round(innerHeight * 1.6 * (1 - f)), c.fin ?? 1)
    await page.evaluate((c) => Object.assign(window, { __flight: c.flight, __sd: c.sd }), c)
    await go(y, 900)
    for (const d of c.drifts ?? [0]) {
      await page.evaluate((d) => (window.__drift = d), d)
      await page.waitForTimeout(700)
      await snap(`${c.name}-d${d}`)
    }
  }
} else {
  for (let y = 0; y < info.H; y += Math.round(h * 0.9)) { await go(y, 900); await snap(`y${y}`) }
}
console.log(JSON.stringify(info), `${n} shots`)
console.log(logs.slice(0, 20).join('\n'))
await browser.close()
