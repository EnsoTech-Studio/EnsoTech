// Kiểm tra luồng người dùng: node .claude/qa/flows.mjs [phần] [base]
// phần: all | size | key | form | reduce | nogl | touch | detail. Không gửi email thật: form dùng API giả, API thật chỉ nhận dữ liệu sai/bẫy máy.
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs'
const { chromium } = await import('file:///D:/Jobs/EnsoTech%20Studio/Ensotech/node_modules/playwright/index.mjs')
const [only = 'all', base = 'http://127.0.0.1:3000'] = process.argv.slice(2)
const out = '.claude/qa/flows'
mkdirSync(out, { recursive: true })
const log = `${out}/${only}.log`
writeFileSync(log, '')
const HZ = '(min-width: 64rem) and (min-height: 37.5rem)'
const GL = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
const run = (part) => only === 'all' || only === part
const ok = (name, pass, detail = '') => {
  const line = `${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`
  console.log(line)
  appendFileSync(log, line + '\n')
}

// Mỗi lần mở là một trình duyệt mới: dùng chung thì swiftshader hết ngữ cảnh WebGL sau vài trang và canvas không hiện.
async function open(args, size, opts = {}, path = '/') {
  const [width, height] = size.split('x').map(Number)
  const browser = await chromium.launch({ args })
  const ctx = await browser.newContext({ viewport: { width, height }, ...opts })
  ctx.close = () => browser.close()
  const page = await ctx.newPage()
  const logs = []
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && !m.text().includes('THREE.Clock') && logs.push(`${m.type()}: ${m.text().slice(0, 160)}`))
  page.on('pageerror', (e) => logs.push(`pageerror: ${e.message.slice(0, 160)}`))
  await page.goto(base + path, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  return { page, ctx, logs }
}

// Cuộn hết trang, ghi lại chữ nằm trọn trong khung nhìn mà không bao giờ hiện ra.
const sweep = (page, wait) =>
  page.evaluate(async (wait) => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
    const bad = new Map()
    const seen = new Set()
    const max = document.documentElement.scrollHeight - innerHeight
    for (let y = 0; ; y = Math.min(y + Math.round(innerHeight * 0.7), max)) {
      scrollTo(0, y)
      // Máy giả lập chậm: chữ đang chạy dở thì chờ thêm một nhịp rồi xét lại, chỉ kẹt thật mới tính lỗi.
      for (let pass = 0; pass < 2; pass++) {
        await sleep(wait)
        let late = 0
        for (const el of document.querySelectorAll('.reveal, .w > span')) {
          const r = el.getBoundingClientRect()
          if (r.width < 2 || r.left < 0 || r.right > innerWidth || r.top < 0 || r.bottom > innerHeight) continue
          const cs = getComputedStyle(el)
          // Chuyển động expo có đuôi dài: còn lệch dưới 4px / 15% coi như đã hiện.
          const [, ty = '0px'] = cs.translate === 'none' ? [] : cs.translate.split(' ')
          const shown = +cs.opacity > 0.9 && parseFloat(ty) < (ty.endsWith('%') ? 15 : 4)
          if (shown) seen.add(el), bad.delete(el)
          else if (!seen.has(el)) late++, bad.set(el, `${el.closest('[id]')?.id} y${y}: ${el.textContent.trim().slice(0, 40)} (o=${cs.opacity} t=${cs.translate})`)
        }
        if (!late) break
      }
      if (y === max) break
    }
    return [...bad.values()]
  }, wait)

if (run('size')) {
  for (const size of ['375x812', '390x844', '768x1024', '1024x600', '1024x768', '1280x720', '1440x900', '1623x849', '1920x1080']) {
    const { page, ctx, logs } = await open(GL,size)
    const r = await page.evaluate((HZ) => ({ hz: matchMedia(HZ).matches, sw: document.documentElement.scrollWidth, iw: innerWidth, canvas: !!document.querySelector('canvas') }), HZ)
    ok(`size ${size}`, r.sw <= r.iw && r.canvas && !logs.length, `hz=${r.hz} scrollW=${r.sw}/${r.iw} canvas=${r.canvas} ${logs.join(' | ')}`)
    await ctx.close()
  }
}
if (run('size') || only === 'sweep') {
  for (const size of ['1440x900', '390x844']) {
    const { page, ctx } = await open(GL,size)
    const bad = await sweep(page, 2000)
    ok(`chữ hiện đủ ${size}`, !bad.length, bad.join(' | '))
    await ctx.close()
  }
}

if (run('key')) {
  const { page, ctx, logs } = await open(GL,'1440x900')
  const y0 = await page.evaluate(() => scrollY)
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight'), await page.waitForTimeout(1300)
  const y1 = await page.evaluate(() => scrollY)
  ok('phím → đi tới', y1 > y0 + 1500, `${y0} → ${y1}`)
  await page.keyboard.press('ArrowLeft')
  await page.waitForTimeout(1300)
  ok('phím ← lùi lại', (await page.evaluate(() => scrollY)) < y1)
  await page.evaluate(() => scrollTo(0, 0))
  await page.waitForTimeout(1200)
  const off = []
  let n = 0
  for (; n < 90; n++) {
    await page.keyboard.press('Tab')
    await page.waitForTimeout(1300)
    const f = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return null
      // Ô chọn nhanh là input sr-only: xét nhãn bao quanh.
      const box = (el.closest('label') ?? el).getBoundingClientRect()
      return { t: `${el.tagName} ${(el.textContent || el.getAttribute('name') || el.getAttribute('aria-label') || '').trim().slice(0, 30)}`, in: box.left >= -1 && box.right <= innerWidth + 1 && box.top >= -1 && box.bottom <= innerHeight + 1 }
    })
    if (!f) break
    // NEXTJS-PORTAL = nút "N" của công cụ dev, không có trên bản build.
    if (!f.in && !f.t.startsWith('NEXTJS-PORTAL')) off.push(f.t)
  }
  ok(`Tab ${n} phần tử, phần tử nào cũng trượt vào khung`, !off.length, off.join(' | '))
  await page.evaluate(() => scrollTo(0, 0))
  await page.waitForTimeout(1200)
  await page.click('header a[data-nav="du-an"]')
  await page.waitForTimeout(3200)
  const nav = await page.evaluate(() => ({ left: Math.round(document.getElementById('du-an').getBoundingClientRect().left), active: document.querySelector('header a[data-nav="du-an"]').hasAttribute('data-active'), hash: location.hash }))
  ok('menu "Dự án" đưa tới chương', Math.abs(nav.left) < 200 && nav.active, JSON.stringify(nav))
  await page.screenshot({ path: `${out}/key-nav.png` })
  ok('console sạch (bàn phím)', !logs.length, logs.join(' | '))
  await ctx.close()
}

if (run('form')) {
  const { page, ctx, logs } = await open(GL,'1440x900')
  await page.focus('[name=name]')
  await page.waitForTimeout(2000)
  await page.click('form button[type=submit]')
  await page.waitForTimeout(400)
  const empty = await page.evaluate(() => ({ name: !!document.getElementById('name-err'), phone: !!document.getElementById('phone-err'), focus: document.activeElement?.getAttribute('name') }))
  ok('form trống báo lỗi + đưa con trỏ về ô tên', empty.name && empty.phone && empty.focus === 'name', JSON.stringify(empty))
  await page.screenshot({ path: `${out}/form-empty.png` })
  await page.fill('[name=name]', 'Khách thử')
  await page.fill('[name=phone]', '0912 345 678')
  await page.click('form fieldset label:first-of-type')
  let reply = { status: 502, body: { ok: false, error: 'send' } }
  let sent = null
  await page.route('**/api/contact', async (r) => {
    sent = r.request().postDataJSON()
    await new Promise((s) => setTimeout(s, 600))
    await r.fulfill({ status: reply.status, json: reply.body })
  })
  await page.click('form button[type=submit]')
  await page.waitForTimeout(150)
  const sending = await page.evaluate(() => document.querySelector('form button[type=submit]').disabled)
  await page.waitForSelector('form [role=alert]', { timeout: 5000 }).catch(() => null)
  const fail = await page.evaluate(() => document.querySelector('form [role=alert]')?.textContent ?? '')
  ok('đang gửi: nút khoá', sending)
  ok('gửi lỗi: báo lỗi, giữ chữ đã nhập', !!fail && (await page.inputValue('[name=name]')) === 'Khách thử', fail)
  await page.screenshot({ path: `${out}/form-fail.png` })
  reply = { status: 200, body: { ok: true } }
  await page.click('form button[type=submit]')
  await page.waitForSelector('[role=status] p', { timeout: 5000 }).catch(() => null)
  const done = await page.evaluate(() => document.querySelector('#lien-he [role=status] p')?.textContent ?? '')
  ok('gửi được: hiện lời cảm ơn', !!done, `${done} · gửi đi: ${JSON.stringify(sent)}`)
  await page.screenshot({ path: `${out}/form-ok.png` })
  await page.unroute('**/api/contact')
  // API thật: chỉ dữ liệu sai và bẫy máy, không cái nào gửi thư.
  const post = (data) => page.request.post(`${base}/api/contact`, { data, headers: { 'content-type': 'application/json' } })
  const bad = await post('không phải json')
  const invalid = await post({ name: '', phone: '123' })
  const spam = await post({ website: 'http://spam', name: 'Bot', phone: '0912345678' })
  ok('API: sai định dạng 400, thiếu/sai 422, bẫy máy 200', bad.status() === 400 && invalid.status() === 422 && spam.status() === 200, `${bad.status()} ${invalid.status()} ${spam.status()} ${JSON.stringify(await invalid.json())}`)
  // 502 là lỗi giả do chính bài thử dựng ra (route mock), không tính.
  const real = logs.filter((l) => !l.includes('status of 502'))
  ok('console sạch (form)', !real.length, real.join(' | '))
  await ctx.close()
}

if (run('reduce')) {
  for (const size of ['1440x900', '390x844']) {
    const { page, ctx, logs } = await open(GL,size, { reducedMotion: 'reduce' })
    const r = await page.evaluate(() => ({ lenis: document.documentElement.classList.contains('lenis'), canvas: !!document.querySelector('canvas') }))
    await page.screenshot({ path: `${out}/reduce-${size}.png` })
    const bad = await sweep(page, 500)
    ok(`giảm chuyển động ${size}: tắt cuộn mượt, cá vẫn còn, chữ hiện ngay`, !r.lenis && r.canvas && !bad.length, `${JSON.stringify(r)} ${bad.join(' | ')}`)
    await page.screenshot({ path: `${out}/reduce-end-${size}.png` })
    ok(`console sạch (giảm chuyển động ${size})`, !logs.length, logs.join(' | '))
    await ctx.close()
  }
}

if (run('nogl')) {
  for (const size of ['1440x900', '390x844']) {
    const { page, ctx, logs } = await open(['--disable-webgl', '--disable-webgl2', '--disable-3d-apis'], size)
    const r = await page.evaluate((HZ) => ({ hz: matchMedia(HZ).matches, canvas: !!document.querySelector('canvas'), sw: document.documentElement.scrollWidth, iw: innerWidth }), HZ)
    await page.screenshot({ path: `${out}/nogl-${size}.png` })
    const bad = await sweep(page, 1500)
    ok(`không WebGL ${size}: trang vẫn đủ chữ`, !r.canvas && r.sw <= r.iw && !bad.length, `${JSON.stringify(r)} ${bad.join(' | ')}`)
    ok(`console sạch (không WebGL ${size})`, !logs.some((l) => l.startsWith('pageerror')), logs.join(' | '))
    await ctx.close()
  }
}

if (run('touch')) {
  const { page, ctx, logs } = await open(GL,'390x844', { isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
  await page.tap('header button[popovertarget="nav-pop"]')
  await page.waitForTimeout(400)
  const opened = await page.evaluate(() => document.getElementById('nav-pop').matches(':popover-open'))
  await page.screenshot({ path: `${out}/touch-menu.png` })
  await page.tap('#nav-pop a[href$="#du-an"]')
  await page.waitForTimeout(2500)
  const after = await page.evaluate(() => ({ open: document.getElementById('nav-pop').matches(':popover-open'), top: Math.round(document.getElementById('du-an').getBoundingClientRect().top) }))
  ok('menu điện thoại mở, chạm "Dự án" thì đóng và tới chương', opened && !after.open && Math.abs(after.top) < 120, JSON.stringify(after))
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight * 0.35))
  await page.waitForTimeout(1500)
  const cta = await page.evaluate(() => !document.querySelector('[data-cta]').hasAttribute('data-hide'))
  await page.tap('[data-cta] button')
  await page.waitForTimeout(400)
  const pop = await page.evaluate(() => document.getElementById('cta-pop').matches(':popover-open'))
  await page.screenshot({ path: `${out}/touch-cta.png` })
  ok('nút liên hệ nổi hiện giữa trang, chạm mở danh sách kênh', cta && pop)
  ok('console sạch (điện thoại)', !logs.length, logs.join(' | '))
  await ctx.close()
}

if (run('detail')) {
  for (const size of ['1440x900', '390x844']) {
    const { page, ctx, logs } = await open(GL,size, {}, '/du-an/tuchamsocgan')
    const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, h1: document.querySelector('h1')?.textContent }))
    ok(`trang chi tiết ${size}`, r.sw <= r.iw && !logs.length, `${JSON.stringify(r)} ${logs.join(' | ')}`)
    await ctx.close()
  }
  const { page, ctx } = await open(GL,'1440x900', {}, '/khong-co-trang-nay')
  const res = await page.request.get(`${base}/khong-co-trang-nay`)
  ok('trang không tồn tại trả 404', res.status() === 404)
  await page.screenshot({ path: `${out}/404.png` })
  await ctx.close()
}

console.log('FLOWS_DONE')
