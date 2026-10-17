// Đo tốc độ trang chủ: node .claude/qa/perf.mjs [url] [WxH] [gpu] [prof] [css=...]
// In: thời điểm chữ hiện / tải engine / nét đầu tiên, rồi độ mượt khi cuộn hết hành trình (khoảng cách khung hình).
const { chromium } = await import('file:///D:/Jobs/EnsoTech%20Studio/Ensotech/node_modules/playwright/index.mjs')
const args = process.argv.slice(2)
const url = args.find((a) => a.startsWith('http')) ?? 'http://127.0.0.1:3000/'
const [w, h] = (args.find((a) => /^\d+x\d+$/.test(a)) ?? '1440x900').split('x').map(Number)
const gpu = args.includes('gpu')
const css = args.find((a) => a.startsWith('css='))?.slice(4)
// headful: mở cửa sổ thật (có vsync như máy người dùng); headless tự khoá nhịp nên số khung/giây kém tin cậy.
const browser = await chromium.launch({
  headless: !args.includes('headful'),
  args: gpu ? ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu'] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})
const page = await browser.newPage({ viewport: { width: w, height: h } })
await page.addInitScript(() => {
  const M = (window.__m = { draw: null, ctx: null, gl: 0, frames: [], long: [], gpu: '', up: 0, upN: 0, idx: 0, tl: [] })
  const P = WebGL2RenderingContext.prototype
  // Mốc thời gian khởi động: [việc, lúc bắt đầu, kéo dài].
  const mark = (k, s) => M.tl.length < 40 && M.tl.push([k, Math.round(s), Math.round(performance.now() - s)])
  const lp = P.linkProgram
  P.linkProgram = function (...a) {
    const s = performance.now()
    const r = lp.apply(this, a)
    mark('link', s)
    return r
  }
  const gpp = P.getProgramParameter
  P.getProgramParameter = function (p, k) {
    const s = performance.now()
    const r = gpp.call(this, p, k)
    if (k === 0x91b1 && r && !p.__done) (p.__done = 1), mark('compiled', s)
    if (k === 0x8b82) mark('linkStatus', s)
    return r
  }
  const bd = P.bufferData
  P.bufferData = function (t, d, ...a) {
    const s = performance.now()
    const r = bd.call(this, t, d, ...a)
    if ((d?.byteLength ?? d) > 1e6) mark('bufferData ' + Math.round((d?.byteLength ?? d) / 1e6) + 'MB', s)
    return r
  }
  const de = P.drawElements
  P.drawElements = function (m, c, ...a) {
    if (c > 0 && M.draw == null) (M.draw = performance.now()), mark('firstDraw', M.draw)
    M.idx += c
    return de.call(this, m, c, ...a)
  }
  const bs = P.bufferSubData
  P.bufferSubData = function (t, o, d, so, len) {
    M.upN++
    // WebGL2: length 0 / bỏ trống = chép tới hết mảng.
    M.up += d.BYTES_PER_ELEMENT ? (len || d.length - (so ?? 0)) * d.BYTES_PER_ELEMENT : d.byteLength ?? 0
    return bs.apply(this, arguments)
  }
  for (const k of ['compileShader', 'linkProgram', 'getProgramParameter', 'getShaderParameter']) {
    const f = P[k]
    P[k] = function (...a) {
      const s = performance.now()
      const r = f.apply(this, a)
      M.gl += performance.now() - s
      return r
    }
  }
  const gc = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function (t, ...a) {
    const s = performance.now()
    const r = gc.call(this, t, ...a)
    if (r && /webgl/.test(t) && this.classList.contains('tp-canvas') && M.ctx == null) {
      mark('getContext', s)
      M.ctx = performance.now()
      const i = r.getExtension('WEBGL_debug_renderer_info')
      M.gpu = i ? r.getParameter(i.UNMASKED_RENDERER_WEBGL) : '?'
    }
    return r
  }
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) M.long.push([Math.round(e.startTime), Math.round(e.duration)])
  }).observe({ type: 'longtask', buffered: true })
  let last = 0
  const tick = (now) => {
    if (last) M.frames.push(now - last)
    last = now
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
})
if (css) await page.addInitScript((c) => addEventListener('DOMContentLoaded', () => document.head.append(Object.assign(document.createElement('style'), { textContent: c }))), css)
const cdp = await page.context().newCDPSession(page)
await cdp.send('Performance.enable')
/** Gộp thời gian tự thân theo hàm của một CPU profile, lấy n hàm nặng nhất. */
const top = (profile, n) => {
  const dt = new Map()
  const byId = new Map(profile.nodes.map((x) => [x.id, x]))
  for (let i = 0; i < profile.samples.length; i++) {
    const cf = byId.get(profile.samples[i]).callFrame
    const key = `${cf.functionName || '(anon)'} ${cf.url.split('/').pop().slice(0, 30)}:${cf.lineNumber + 1}:${cf.columnNumber}`
    dt.set(key, (dt.get(key) ?? 0) + (profile.timeDeltas[i] ?? 0))
  }
  const tot = [...dt.values()].reduce((a, b) => a + b, 0)
  return [...dt].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${((100 * v) / tot).toFixed(1)}% ${Math.round(v / 1000)}ms ${k}`)
}
const lp = args.includes('loadprof')
if (lp) {
  await cdp.send('Profiler.enable')
  await cdp.send('Profiler.setSamplingInterval', { interval: 200 })
  await cdp.send('Profiler.start')
}
// warm: khởi động GPU trước như trình duyệt thật đang mở sẵn (máy đo mới mở thì lần WebGL đầu chậm hơn hẳn).
if (args.includes('warm')) {
  await page.goto('about:blank')
  await page.evaluate(() => document.createElement('canvas').getContext('webgl2', { antialias: true }))
}
await page.goto(url, { waitUntil: 'load' })
await page.waitForTimeout(6000)
if (lp) console.log((top((await cdp.send('Profiler.stop')).profile, 25)).join('\n'))
const load = await page.evaluate(() => {
  const M = window.__m
  const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime
  const nav = performance.getEntriesByType('navigation')[0]
  const js = performance
    .getEntriesByType('resource')
    .filter((r) => r.initiatorType === 'script' || r.name.endsWith('.js'))
    .map((r) => ({ n: r.name.split('/').pop().slice(0, 40), kb: Math.round(r.encodedBodySize / 1024), raw: Math.round(r.decodedBodySize / 1024), end: Math.round(r.responseEnd) }))
    .sort((a, b) => b.raw - a.raw)
    .slice(0, 6)
  return {
    gpu: M.gpu,
    fcp: Math.round(fcp ?? -1),
    domReady: Math.round(nav.domContentLoadedEventEnd),
    load: Math.round(nav.loadEventEnd),
    ctx: Math.round(M.ctx ?? -1),
    firstDraw: Math.round(M.draw ?? -1),
    glSync: Math.round(M.gl),
    longTasks: M.long.filter(([s]) => s < 6000),
    tl: M.tl,
    js,
  }
})
console.log(JSON.stringify(load))
if (args.includes('noscroll')) {
  await browser.close()
  process.exit(0)
}

// Cuộn hết hành trình bằng bánh xe chuột, đo khoảng cách giữa các khung hình.
const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
await page.mouse.move(w / 2, h / 2)
await page.evaluate(() => {
  Object.assign(window.__m, { frames: [], long: [], up: 0, upN: 0, idx: 0 })
})
const m0 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((x) => [x.name, x.value]))
if (args.includes('prof')) {
  await cdp.send('Profiler.enable')
  await cdp.send('Profiler.setSamplingInterval', { interval: 200 })
  await cdp.send('Profiler.start')
}
const trace = args.includes('trace')
if (trace) await browser.startTracing(page, { categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'toplevel', 'gpu'] })
const t0 = Date.now()
const ticks = Math.ceil(H / 120)
for (let i = 0; i < ticks; i++) {
  await page.mouse.wheel(0, 120)
  await page.waitForTimeout(24)
}
await page.waitForTimeout(1500)
const secs = (Date.now() - t0) / 1000
if (trace) {
  // Cộng thời gian theo luồng (việc cấp cao nhất) và theo tên sự kiện trên luồng chính của trang.
  const ev = JSON.parse((await browser.stopTracing()).toString()).traceEvents
  const names = new Map(ev.filter((e) => e.name === 'thread_name').map((e) => [e.pid + ':' + e.tid, e.args.name]))
  const busy = new Map(), by = { CrRendererMain: new Map(), CrGpuMain: new Map(), ThreadPoolForegroundWorker: new Map(), Compositor: new Map() }
  for (const e of ev) {
    if (e.ph !== 'X' || !e.dur) continue
    const th = names.get(e.pid + ':' + e.tid) ?? '?'
    if (/RunTask$/.test(e.name)) busy.set(th, (busy.get(th) ?? 0) + e.dur)
    else if (by[th]) by[th].set(e.name, (by[th].get(e.name) ?? 0) + e.dur)
  }
  const ms = (m) => [...m].sort((a, b) => b[1] - a[1]).slice(0, 18).map(([k, v]) => `${k} ${Math.round(v / 1000)}`).join(' | ')
  console.log('thread busy ms: ' + ms(busy))
  for (const [th, m] of Object.entries(by)) console.log(th + ' events ms: ' + ms(m))
}
let prof = null
if (args.includes('prof')) {
  prof = top((await cdp.send('Profiler.stop')).profile, 22)
}
const m1 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((x) => [x.name, x.value]))
const d = (k) => Math.round((m1[k] - m0[k]) * 1000)
const scroll = await page.evaluate(() => {
  const f = window.__m.frames.slice().sort((a, b) => a - b)
  const q = (p) => Math.round(f[Math.floor(p * (f.length - 1))] * 10) / 10
  return {
    frames: f.length,
    p50: q(0.5),
    p95: q(0.95),
    p99: q(0.99),
    max: Math.round(f[f.length - 1]),
    over25: f.filter((x) => x > 25).length,
    over50: f.filter((x) => x > 50).length,
    long: window.__m.long.length,
    longMs: window.__m.long.reduce((s, [, d]) => s + d, 0),
    // Mỗi khung: KB đẩy lên GPU, số lần đẩy, số chỉ số tam giác vẽ.
    upKB: Math.round(window.__m.up / 1024 / f.length),
    upN: Math.round(window.__m.upN / f.length),
    idx: Math.round(window.__m.idx / f.length),
  }
})
console.log(`scroll ${secs.toFixed(1)}s`, JSON.stringify(scroll))
console.log(`main thread ms: task ${d('TaskDuration')} script ${d('ScriptDuration')} style ${d('RecalcStyleDuration')} layout ${d('LayoutDuration')}`)
if (prof) console.log(prof.join('\n'))
await browser.close()
