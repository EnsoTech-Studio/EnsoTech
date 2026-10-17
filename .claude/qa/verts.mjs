// Đếm đỉnh vẽ mỗi khung hình dọc cả trang: node .claude/qa/verts.mjs [WxH]
const { chromium } = await import('file:///D:/Jobs/EnsoTech%20Studio/Ensotech/node_modules/playwright/index.mjs')
const [w, h] = (process.argv[2] ?? '1440x900').split('x').map(Number)
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const page = await browser.newPage({ viewport: { width: w, height: h } })
await page.addInitScript(() => {
  const P = WebGL2RenderingContext.prototype, de = P.drawElements, da = P.drawArrays
  const s = (window.__v = { cur: 0, calls: 0, max: 0, maxCalls: 0 })
  P.drawElements = function (m, c, ...a) { s.cur += c; s.calls++; return de.call(this, m, c, ...a) }
  P.drawArrays = function (m, f, c, ...a) { s.cur += c; s.calls++; return da.call(this, m, f, c, ...a) }
  const tick = () => {
    s.max = Math.max(s.max, s.cur); s.maxCalls = Math.max(s.maxCalls, s.calls)
    s.cur = 0; s.calls = 0
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
})
await page.goto('http://127.0.0.1:3000/thu-phap', { waitUntil: 'networkidle' })
await page.waitForTimeout(4000)
const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
const rows = []
for (let i = 0; i <= 20; i++) {
  await page.evaluate((y) => { scrollTo(0, y); window.__v.max = 0; window.__v.maxCalls = 0 }, Math.round((H * i) / 20))
  await page.waitForTimeout(900)
  rows.push(await page.evaluate((i) => `${i * 5}%: ${window.__v.max} idx, ${window.__v.maxCalls} calls`, i))
}
const gpu = await page.evaluate(() => {
  const c = document.querySelector('canvas')
  return c ? `${c.width}x${c.height}` : 'no canvas'
})
console.log(`${w}x${h} canvas ${gpu}\n${rows.join('\n')}`)
await browser.close()
