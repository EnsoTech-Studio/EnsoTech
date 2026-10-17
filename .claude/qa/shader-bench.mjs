// Đo thời gian mở WebGL và dịch shader mực trên GPU thật (D3D11): node .claude/qa/shader-bench.mjs
// Lấy nguyên shader trong stroke.ts, thêm phần đầu như three (GLSL 3), dịch vài biến thể để so.
import { readFileSync } from 'node:fs'
const { chromium } = await import('file:///D:/Jobs/EnsoTech%20Studio/Ensotech/node_modules/playwright/index.mjs')
const src = readFileSync('D:/Jobs/EnsoTech Studio/Ensotech/src/thu-phap/ink/stroke.ts', 'utf8')
const glsl = (name) => src.match(new RegExp('const ' + name + ' = /\\* glsl \\*/ `([\\s\\S]*?)`'))[1]
const vert = glsl('vert'), frag = glsl('frag')
const V = '#version 300 es\n#define attribute in\n#define varying out\nprecision highp float;\nuniform mat4 projectionMatrix;\nuniform mat4 modelViewMatrix;\nin vec3 position;\n'
const F = '#version 300 es\n#define varying in\nout highp vec4 pc_fragColor;\n#define gl_FragColor pc_fragColor\n'
const variants = {
  original: frag,
  original2: frag,
  fbm2oct: frag.replace('i < 4', 'i < 2'),
  fbmIsVn: frag.replace(/float fbm\(vec2 p\) \{[^\n]*\}/, 'float fbm(vec2 p) { return vn(p); }'),
  noBloom: frag.replace(/\} else if \(vBloom > 0\.5\) \{[\s\S]*?\} else \{/, '} else {'),
  loopUniform: frag.replace('float fbm(', 'uniform int uOct;\nfloat fbm(').replace('i < 4', 'i < uOct'),
  loopUniformAgain: frag.replace('float fbm(', 'uniform int uOct;\nfloat fbm(').replace('i < 4', 'i < uOct'),
  vnUniform: frag
    .replace('float fbm(', 'uniform int uOct;\nfloat fbm(')
    .replace('i < 4', 'i < uOct')
    .replace('float h21(vec2 p) {', 'uniform float uH;\nfloat h21(vec2 p) {'),
}
const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu'] })
const page = await browser.newPage()
await page.setContent('<body></body>')
const out = await page.evaluate(
  ({ V, F, vert, variants }) => {
    const r = {}
    const ctx = (aa) => {
      const c = document.createElement('canvas')
      c.width = 1440
      c.height = 900
      const s = performance.now()
      const gl = c.getContext('webgl2', { antialias: aa })
      return [gl, Math.round(performance.now() - s)]
    }
    r.ctxAA1 = ctx(true)[1]
    r.ctxAA2 = ctx(true)[1]
    const [gl, t] = ctx(false)
    r.ctxNoAA = t
    let n = 0
    for (const [k, f] of Object.entries(variants)) {
      const s = performance.now()
      const p = gl.createProgram()
      for (const [type, code] of [[gl.VERTEX_SHADER, V + vert], [gl.FRAGMENT_SHADER, F + '// ' + n++ + '\n' + f]]) {
        const sh = gl.createShader(type)
        gl.shaderSource(sh, code)
        gl.compileShader(sh)
        gl.attachShader(p, sh)
      }
      gl.linkProgram(p)
      const ok = gl.getProgramParameter(p, gl.LINK_STATUS)
      r[k] = ok ? Math.round(performance.now() - s) : 'FAIL ' + gl.getProgramInfoLog(p)
    }
    return r
  },
  { V, F, vert, variants },
)
console.log(JSON.stringify(out))
await browser.close()
