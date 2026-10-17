// Đáy chữ mỗi chương (phân số chiều cao màn hình): rồng bay dưới mức này thì không đè chữ. node .claude/qa/textfloor.mjs
const { chromium } = await import('file:///D:/Jobs/EnsoTech%20Studio/Ensotech/node_modules/playwright/index.mjs')
const browser = await chromium.launch()
for (const [w, h] of [[1440, 900], [1280, 720], [1623, 849], [1024, 768], [1920, 1080]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  const rows = await page.evaluate(() =>
    [...document.querySelectorAll('[data-chapter]')].map((ch, i) => {
      const walk = document.createTreeWalker(ch, NodeFilter.SHOW_TEXT)
      let lo = 0
      const r = document.createRange()
      for (let n; (n = walk.nextNode()); ) {
        if (!n.textContent.trim()) continue
        r.selectNodeContents(n)
        const b = r.getBoundingClientRect()
        if (b.height > 0) lo = Math.max(lo, b.bottom)
      }
      return `${i}:${(lo / innerHeight).toFixed(3)}`
    }).join('  '),
  )
  console.log(`${w}x${h}  ${rows}`)
  await page.close()
}
await browser.close()
console.log('FLOOR_DONE')
