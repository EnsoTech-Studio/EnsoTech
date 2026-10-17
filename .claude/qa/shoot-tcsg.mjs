// Chụp ảnh thật của tuchamsocgan.vn cho trang dự án. Chỉ phần công khai trên trang chủ;
// né banner đầu trang (có ảnh bác sĩ) và "Góc chia sẻ" (có tên người bệnh).
// Chạy: node .claude/qa/shoot-tcsg.mjs
import { mkdirSync } from 'node:fs'
const { chromium } = await import('file:///D:/Jobs/EnsoTech%20Studio/Ensotech/node_modules/playwright/index.mjs')

const OUT = 'src/app/du-an/tuchamsocgan/_anh'
mkdirSync(OUT, { recursive: true })
const JPG = { type: 'jpeg', quality: 82 }
const browser = await chromium.launch()

async function open(opts) {
  const ctx = await browser.newContext({ locale: 'vi-VN', reducedMotion: 'reduce', ...opts })
  const page = await ctx.newPage()
  await page.goto('https://tuchamsocgan.vn', { waitUntil: 'networkidle', timeout: 90000 })
  // Cuộn hết trang một lượt cho các khối "hiện dần khi cuộn tới" hiện ra hẳn.
  for (let i = 0; i < 14; i++) {
    await page.mouse.wheel(0, 700)
    await page.waitForTimeout(250)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(800)
  return page
}
/** Ẩn nút chat nổi, thông báo nổi; header = true thì ẩn cả thanh menu dính. */
const hideFloating = (page, header) =>
  page.evaluate((header) => {
    for (const e of document.querySelectorAll('body *')) {
      const p = getComputedStyle(e).position
      if (p === 'fixed' || (header && p === 'sticky')) e.style.opacity = '0'
    }
  }, header)
const h2 = (page, text) => page.locator('h2', { hasText: text }).first()
/** Cuộn cho tiêu đề nằm ngay dưới thanh menu rồi chụp cả màn hình. */
async function viewportAt(page, text, file, offset) {
  // Trang thật đặt scroll-behavior: smooth, nên cuộn "instant" rồi chờ menu dính hết hiệu ứng.
  await h2(page, text).evaluate((el, offset) => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'instant' }), offset)
  await page.waitForTimeout(1500)
  await hideFloating(page, false)
  await page.screenshot({ path: `${OUT}/${file}`, ...JPG })
}

// ---------- Máy tính ----------
const desk = await open({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 })
await hideFloating(desk, false)
await viewportAt(desk, 'Lựa chọn theo nhu cầu', 'trang-chu.jpg', 190)
await hideFloating(desk, true)

const shots = [
  ['Hành trình điều trị TACE', "ancestor::div[contains(@class,'rounded-2xl')][1]", 'hanh-trinh.jpg'],
  ['Lời khuyên nhanh', "ancestor::div[contains(@class,'from-sky-50')][1]", 'loi-khuyen.jpg'],
  ['Lựa chọn theo nhu cầu', 'ancestor::section[1]', 'cam-nang.jpg'],
]
for (const [text, xp, file] of shots) {
  const el = h2(desk, text).locator(`xpath=${xp}`)
  await el.scrollIntoViewIfNeeded()
  await desk.waitForTimeout(700)
  await el.screenshot({ path: `${OUT}/${file}`, ...JPG })
}
// Nhật ký: chỉ phần chọn triệu chứng và thang đau, cắt trước "Thời gian ghi nhận".
const diary = h2(desk, 'Sức khỏe hôm nay').locator("xpath=ancestor::div[contains(@class,'col-span-6')][1]")
await diary.evaluate((el) => {
  const stop = [...el.querySelectorAll('*')].find((e) => e.childElementCount === 0 && e.textContent.trim() === 'Thời gian ghi nhận')
  el.style.maxHeight = `${stop.getBoundingClientRect().top - el.getBoundingClientRect().top - 40}px`
  el.style.overflow = 'hidden'
})
await diary.scrollIntoViewIfNeeded()
await desk.waitForTimeout(700)
await diary.screenshot({ path: `${OUT}/nhat-ky.jpg`, ...JPG })

// ---------- Điện thoại ----------
const phone = await open({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await hideFloating(phone, false)
await viewportAt(phone, 'Sức khỏe hôm nay', 'dien-thoai.jpg', 84)
await viewportAt(phone, 'Hành trình điều trị TACE', 'doc-to.jpg', 84)

await browser.close()
console.log('xong')
