// Nước dựng bằng code, tông thuỷ mặc: nước để trắng giấy, viền là nét mực mảnh, chỗ khuất ngả xanh chàm.
// Một bộ phát hạt GPU (bọt khí, giọt, khối nước trắng, sương, bọt loang) + tấm thác Vũ Môn.
// Mọi chuyển động tính trong shader từ thời điểm sinh ra; CPU chỉ ghi vài số khi phát hạt mới.

import * as THREE from 'three'
import { rgb } from './kit'

/** tan(fov/2) với fov 35°: nửa chiều cao khung nhìn ở khoảng cách d là TAN·d. */
export const TAN = Math.tan((17.5 * Math.PI) / 180)

// Hạt "thuộc về thế giới": trôi theo cảnh khi cuộn (ngang hoặc dọc) — hạt gần trượt nhanh hơn hạt xa (thị sai).
const DRIFT = /* glsl */ `
uniform float uTravel, uPx, uHz;
vec3 drift(vec3 p, float from) {
  float s = (uTravel - from) * uPx;
  return p + (uHz > .5 ? vec3(-s, 0., 0.) : vec3(0., s, 0.));
}`

const NOISE = /* glsl */ `
float hash(vec2 p) {
  vec3 q = fract(p.xyx * .1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f *= f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + 1.), f.x), f.y);
}
float fbm(vec2 p) { return .5 * noise(p) + .3 * noise(p * 2.03 + 17.) + .2 * noise(p * 4.1 + 31.); }`

export const BUBBLE = 0
export const DROP = 1
export const SPRAY = 2
export const MIST = 3
export const FOAM = 4
export const EMBER = 5

const INK = rgb(0x19211f)
const CHAM = rgb(0x2d5e78)
const PAPER = rgb(0xfaf5ea)
const DAWN = rgb(0xf0a47a)

export function emitter(capacity: number) {
  const p0 = new Float32Array(capacity * 3)
  const v0 = new Float32Array(capacity * 3)
  // (thời điểm sinh, quãng cuộn lúc sinh, loại, hạt giống) — thời điểm âm rất xa = hạt chưa dùng.
  const meta = new Float32Array(capacity * 4).map((_, i) => (i % 4 === 0 ? -1e4 : 0))
  const g = new THREE.BufferGeometry()
  const attrs = [new THREE.BufferAttribute(p0, 3), new THREE.BufferAttribute(v0, 3), new THREE.BufferAttribute(meta, 4)]
  attrs.forEach((a) => a.setUsage(THREE.DynamicDrawUsage))
  g.setAttribute('position', attrs[0])
  g.setAttribute('aVel', attrs[1])
  g.setAttribute('aMeta', attrs[2])

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    // Màu nhân sẵn alpha: alpha < độ phủ = một phần cộng sáng (nước mỏng bắt nắng sáng lên thay vì phủ màu).
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    uniforms: {
      uTime: { value: 0 },
      uTravel: { value: 0 },
      uPx: { value: 0.01 },
      uHz: { value: 1 },
      uScale: { value: 1 },
      // Mặt hồ dưới chân thác (toạ độ thế giới): giọt và khối nước rơi xuống quá mặt hồ thì chìm mất.
      uFoot: { value: -1e3 },
      uInk: { value: INK },
      uCham: { value: CHAM },
      uPaper: { value: PAPER },
      uSun: { value: DAWN },
      // Tâm mặt trời trên màn hình (px thiết bị, gốc dưới-trái) + chiều cao khung — khớp .sun trong voyage.css.
      uSunAt: { value: new THREE.Vector3(0, 0, 1) },
    },
    vertexShader: /* glsl */ `
      ${DRIFT}
      uniform float uTime, uScale, uFoot;
      attribute vec3 aVel;
      attribute vec4 aMeta;
      varying float vA, vKind, vSeed, vStretch, vH, vK, vPx, vF;
      varying vec2 vDir;
      void main() {
        float age = uTime - aMeta.x, kind = aMeta.z, seed = aMeta.w;
        vDir = vec2(0., 1.);
        vStretch = 1.;
        vF = 0.;
        float dens = 1.;
        float life = kind < .5 ? 2.4 + seed * 2.2 : kind < 1.5 ? 2.4 : kind < 2.5 ? 2.2 + seed : kind > 4.5 ? 1.2 + seed * 1.6 : 3.5 + seed * 2.;
        // Khối nước trắng chỉ vẽ ở lượt mật độ (VOLUME); các loại khác chỉ vẽ ở lượt thường.
        #ifdef VOLUME
        if (abs(kind - 2.) > .5) age = -1.;
        #else
        if (abs(kind - 2.) < .5) age = -1.;
        #endif
        if (age < 0. || age > life) { gl_Position = vec4(2., 2., 2., 1.); gl_PointSize = 0.; return; }
        float k = age / life;
        vec3 p = position;
        float size, fade;
        if (kind < .5) {
          // Bọt khí: lực đẩy ban đầu tắt dần, nổi lên ngày càng nhanh, lắc lư.
          p += aVel * (1. - exp(-2. * age)) * .5 + vec3(0., .3 * age + .22 * age * age, 0.);
          p.x += sin(age * 3. + seed * 40.) * .07 * sqrt(age);
          p.z += cos(age * 2.6 + seed * 30.) * .05 * sqrt(age);
          size = 3. + seed * seed * 11.;
          fade = .55;
        } else if (kind < 1.5) {
          p += aVel * age + vec3(0., -3.3 * age * age, 0.);
          // Giọt bay nhanh nhoè thành vệt theo hướng bay (như ảnh chụp 1/60 s): dài theo tốc độ, bề ngang giữ nguyên.
          vec2 sv = aVel.xy - vec2(0., 6.6 * age);
          float sp = length(sv);
          if (sp > .001) vDir = vec2(sv.x, -sv.y) / sp;
          float base = 1.4 + seed * 2.2 + pow(seed, 12.) * 4.;
          size = base + sp * .5;
          vStretch = size / base;
          fade = .8;
        } else if (kind < 2.5) {
          // Khối nước bay theo quỹ đạo ném, cùng trọng lực với giọt (nước không lơ lửng — lơ lửng là khói).
          p += vec3(aVel.x * (1. - exp(-.7 * age)) / .7, aVel.y * age - 3.3 * age * age, aVel.z * (1. - exp(-.7 * age)) / .7);
          vec2 sv = vec2(aVel.x * exp(-.7 * age), aVel.y - 6.6 * age);
          float sp = length(sv);
          if (sp > .001) vDir = vec2(sv.x, -sv.y) / sp;
          // Phóng chậm là thân nước to dày, phóng nhanh là ngón nước hẹp mỏng; mảng nở dần khi tung ra.
          float slow = exp(-.3 * length(aVel));
          vStretch = 1. + min(sp * .35, 2.5);
          size = (10. + seed * 10.) * (1. + 1.2 * slow) * (.8 + .6 * k) * vStretch;
          dens = .8 + .2 * slow;
          vF = 1. - slow;
          fade = .65;
        } else if (kind > 4.5) {
          // Mực loang: giọt mực hãm nhanh rồi nở ra, cuộn chậm lên phía rồng đang thành hình; nhạt dần rồi tan.
          p += aVel * (1. - exp(-1.6 * age)) / 1.6 + vec3(sin(age * 1.3 + seed * 30.) * .1 * age, .25 * age, 0.);
          size = (6. + seed * 12.) * (.4 + 1.6 * sqrt(k));
          fade = .35;
        } else {
          // Sương và bọt loang bị hãm nên chậm dần, nở to và tan.
          float drag = kind < 3.5 ? .8 : 1.2;
          p += aVel * (1. - exp(-drag * age)) / drag;
          if (kind < 3.5) p += vec3(sin(age * .7 + seed * 9.) * .2, .12 * age, 0.);
          size = kind < 3.5 ? (150. + seed * 200.) * (.5 + .8 * k) : (40. + seed * 50.) * (.6 + .9 * k);
          fade = kind < 3.5 ? .2 : .4;
        }
        vec3 wp = drift(p, aMeta.y);
        vec4 mv = modelViewMatrix * vec4(wp, 1.);
        gl_Position = projectionMatrix * mv;
        float h = wp.y - uFoot;
        float wet = kind > .5 && kind < 2.5 ? smoothstep(-.15, 0., h) : 1.;
        vA = dens * smoothstep(0., .06, k) * (1. - smoothstep(fade, 1., k)) * wet;
        vH = h;
        vK = k;
        vKind = kind;
        vSeed = seed;
        gl_PointSize = uScale * size * (12. / -mv.z);
        vPx = gl_PointSize / uScale;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uCham, uPaper, uSun, uSunAt;
      varying float vA, vKind, vSeed, vStretch, vH, vK;
      varying vec2 vDir;
      ${NOISE}
      void main() {
        vec2 c = gl_PointCoord - .5;
        float d = length(c);
        if (d > .5) discard;
        vec2 e = vec2(dot(c, vDir), dot(c, vec2(-vDir.y, vDir.x)) * vStretch) * 2.;
        vec2 ds = (gl_FragCoord.xy - uSunAt.xy) / (uSunAt.z * .12);
        float sun = exp(-dot(ds, ds));
        if (vKind > 4.5) {
          // Vệt mực: mép rách theo nhiễu, lõi đặc, càng loang càng nhạt như mực thấm giấy ướt.
          float n = fbm(c * 5. + vSeed * 53. + vK * .6);
          float a = smoothstep(.5, .2, d + (n - .5) * .35) * vA * mix(.85, .35, vK);
          gl_FragColor = vec4(uInk * .6 * a, a);
          return;
        }
        if (vKind > 2.5) {
          // Sương: hơi giấy trắng, gần mặt trời ửng hồng. Bọt loang: trắng giấy, rìa chàm nhạt.
          bool mist = vKind < 3.5;
          vec2 q = mist ? c : c * vec2(1., 3.);
          float n = fbm(q * (mist ? 3. : 6.) + vSeed * 41. + vK * .8);
          float a = smoothstep(.5, mist ? 0. : .25, length(q)) * smoothstep(.3, .75, n) * vA * (mist ? .2 : .8);
          vec3 col = mist ? min(uPaper + uSun * sun * .35, 1.) : mix(mix(uCham, uPaper, .55), uPaper, smoothstep(.45, .7, n));
          gl_FragColor = vec4(col * a, a);
          return;
        }
        if (vKind > .5) {
          // Giọt như hạt cườm: lõi trắng giấy, viền chàm mực — đọc được trên nền giấy lẫn vách đá; trước mặt trời thì ửng nắng.
          float r = length(e);
          float glint = pow(.5 + .5 * sin(vK * 70. + vSeed * 90.), 16.);
          float a = smoothstep(1., .6, r) * vA * .9;
          vec3 col = mix(mix(uInk, uCham, .5), uPaper, smoothstep(.95, .35, r)) + uSun * (sun * 1.2 + glint * .4);
          gl_FragColor = vec4(min(col, 1.) * a, a);
          return;
        }
        // Bọt khí: vòng mực mảnh + đốm sáng lệch góc trên.
        float ring = smoothstep(.5, .43, d) * smoothstep(.3, .43, d) * .55;
        float hi = smoothstep(.14, 0., length(c - vec2(-.14, -.14))) * .6;
        float a = (ring + hi) * vA;
        gl_FragColor = vec4((uInk * ring + uPaper * hi) * vA, a);
      }`,
  })

  const points = new THREE.Points(g, material)
  points.frustumCulled = false

  // Khối nước trắng vẽ kiểu thể tích: mọi mảng cộng dồn mật độ vào bộ đệm riêng rồi tô một lần theo độ dày tích luỹ —
  // các mảng chạm nhau liền thành một khối nước, mép sắc gọn có nét mực (thay vì từng mảng tự tô: trông như bông).
  // ponytail: lớp này phủ lên cá (không có chiều sâu) — nước chỉ bắn quanh thân nên gần như không lộ.
  const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthBuffer: false })
  const density = new THREE.ShaderMaterial({
    defines: { VOLUME: '' },
    uniforms: material.uniforms,
    vertexShader: material.vertexShader,
    fragmentShader: /* glsl */ `
      varying float vA, vKind, vSeed, vStretch, vH, vK, vPx, vF;
      varying vec2 vDir;
      ${NOISE}
      void main() {
        vec2 c = gl_PointCoord - .5;
        vec2 e = vec2(dot(c, vDir), dot(c, vec2(-vDir.y, vDir.x)) * vStretch) * 2.;
        float r2 = dot(e, e);
        if (r2 > 1.) discard;
        // Vân nước tính theo px thật nên mảng to hay nhỏ đều mịn như nhau: thớ dài theo hướng bay.
        vec2 q = vec2(e.x, e.y / vStretch) * vPx * .5;
        vec2 nq = q * vec2(mix(.035, .05, vK), .11) * (1. + 2.5 * vF) + vSeed * 73. + vec2(vK * 2.5, 0.);
        float n = mix(fbm(nq), noise(nq * vec2(2., 3.7) + 11.), .6 * vK);
        // Tấm nước rách dần theo tuổi: liền khối → thủng lỗ → tách ngón → vụn thành giọt; mép trước rách thành tia.
        float th = mix(.22, .72, vK) + .2 * r2 + .12 * vF + .22 * smoothstep(0., 1., e.x);
        float blob = smoothstep(th, th + .1, n) * (1. - r2);
        // Mảng phóng nhanh là chùm giọt rời: mỗi ô 12×6 px tối đa một giọt, ô trống nhiều dần theo tuổi.
        vec2 cq = q / vec2(12., 6.) + vSeed * 91.;
        vec2 id = floor(cq), f = fract(cq) - .5 - (vec2(hash(id + 1.), hash(id + 2.)) - .5) * vec2(.2, .16);
        float rp = .8 + 1.7 * hash(id + 3.) * hash(id + 5.);
        float drop = step(hash(id), mix(.6, .25, vK) * (1. - .5 * r2)) * smoothstep(rp, rp - .9, length(f * vec2(12. / (1. + .4 * vStretch), 6.)));
        float d = mix(blob, drop, smoothstep(.4, .9, vF)) * vA;
        if (d < .002) discard;
        gl_FragColor = vec4(d, d * vH, 0., 0.);
      }`,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
  })
  const pool = new THREE.Points(g, density)
  pool.frustumCulled = false
  const pass = new THREE.Scene().add(pool)
  const res = new THREE.Vector2()
  const u = material.uniforms
  const veil = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms: { uMap: { value: rt.texture }, uRes: { value: res }, uSun: u.uSun, uSunAt: u.uSunAt, uInk: u.uInk, uCham: u.uCham, uPaper: u.uPaper },
      vertexShader: /* glsl */ `void main() { gl_Position = vec4(position.xy, 0., 1.); }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D uMap;
        uniform vec2 uRes;
        uniform vec3 uSun, uSunAt, uInk, uCham, uPaper;
        vec2 at(vec2 o) { return texture2D(uMap, (gl_FragCoord.xy + o) / uRes).rg; }
        float lt(vec2 o) { return log(1. + 3. * at(o).x); }
        void main() {
          float u = uSunAt.z / 900.;
          vec2 s = at(vec2(0.));
          float tau = s.x;
          // Beer–Lambert: mảng đơn trong mờ, chồng vài lớp là đục hẳn. Mép sắc gọn (sức căng bề mặt) — không nhoè như bông.
          float fw = max(fwidth(tau), 1e-4);
          float rim = 1. - smoothstep(0., 1.6, abs(tau - .12) / fw);
          float a = max(max(.6 * smoothstep(.12 - fw, .12 + fw, tau), 1. - exp(-2.2 * tau)), rim * .75);
          if (a < .003) discard;
          float h = s.y / max(tau, 1e-4);
          // Pháp tuyến từ độ dốc độ dày: cụm nước gồ lên như súp lơ — mặt ngửa sáng giấy, mặt úp ngả chàm.
          float r = 12. * u, f = 4. * u;
          vec2 g = .5 * vec2(lt(vec2(r, 0.)) - lt(vec2(-r, 0.)) + lt(vec2(2. * r, 0.)) - lt(vec2(-2. * r, 0.)),
                             lt(vec2(0., r)) - lt(vec2(0., -r)) + lt(vec2(0., 2. * r)) - lt(vec2(0., -2. * r)));
          vec2 gf = vec2(lt(vec2(f, 0.)) - lt(vec2(-f, 0.)), lt(vec2(0., f)) - lt(vec2(0., -f)));
          float L = .9 + (.22 * clamp(-1.2 * g.y - .3 * g.x, -1., 1.) + .16 * clamp(-2. * gf.y - gf.x, -1., 1.)) * smoothstep(.4, 1.8, tau);
          L *= mix(.84, 1., smoothstep(-.2, 1.2, h));
          L *= mix(.86, 1., exp(-.12 * (at(vec2(0., 16. * u)).x + at(vec2(0., 36. * u)).x + at(vec2(0., 64. * u)).x)));
          vec3 body = mix(mix(uCham, uPaper, .3), uPaper, clamp(L, 0., 1.));
          // Nét mực mảnh đúng mép khối nước — như nét bút lông bao quanh bọt sóng trong tranh thuỷ mặc.
          body = mix(body, uInk, rim * .6);
          // Nắng sớm sau lưng xuyên qua chỗ mỏng: rìa khối, ngón nước ửng hồng (rực nhất trước mặt trời).
          vec2 ds = (gl_FragCoord.xy - uSunAt.xy) / (uSunAt.z * .16);
          float sun = exp(-dot(ds, ds));
          vec3 glow = uSun * a * exp(-1.6 * tau) * (.12 + 1.1 * sun);
          gl_FragColor = vec4(min(body * a + glow, 1.), a);
        }`,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
    }),
  )
  veil.frustumCulled = false
  veil.visible = false
  let head = 0
  // Khoảng ô vừa ghi từ lần đẩy trước — chỉ đẩy đoạn đó lên GPU.
  let lo = capacity
  let hi = 0
  let sprayUntil = -1

  return {
    points,
    veil,
    material,
    emit(p: THREE.Vector3, v: THREE.Vector3, kind: number, time: number, travel: number) {
      p.toArray(p0, head * 3)
      v.toArray(v0, head * 3)
      meta.set([time, travel, kind, Math.random()], head * 4)
      lo = Math.min(lo, head)
      hi = Math.max(hi, head + 1)
      head = (head + 1) % capacity
      if (kind === SPRAY) sprayUntil = time + 3.3
    },
    flush() {
      if (hi <= lo) return
      attrs.forEach((a) => {
        a.addUpdateRange(lo * a.itemSize, (hi - lo) * a.itemSize)
        a.needsUpdate = true
      })
      lo = capacity
      hi = 0
    },
    /** Lượt mật độ của khối nước trắng — gọi mỗi khung trước khi vẽ cảnh chính; không có nước bắn thì bỏ qua cả hai lượt. */
    volume(gl: THREE.WebGLRenderer, cam: THREE.Camera, time: number) {
      veil.visible = time < sprayUntil
      if (!veil.visible) return
      gl.getDrawingBufferSize(res)
      if (rt.width !== res.x || rt.height !== res.y) rt.setSize(res.x, res.y)
      gl.setRenderTarget(rt)
      gl.clear()
      gl.render(pass, cam)
      gl.setRenderTarget(null)
    },
    dispose() {
      g.dispose()
      material.dispose()
      density.dispose()
      veil.geometry.dispose()
      veil.material.dispose()
      rt.dispose()
    },
  }
}

/**
 * Thác Vũ Môn: một tấm phẳng, nước rơi đúng gia tốc trọng trường. Hoa văn gắn với "lúc khối nước rời mép thác"
 * (b = t − τ(d), τ = thời gian rơi tới độ sâu d) nên vệt nước đi chậm ở mép rồi nhanh dần và kéo dài ra khi xuống chân thác.
 * Gờ thác là một lớp nước trong như kính uốn qua mép đá; xuống thấp nước sục khí trắng xoá rồi xé thành sợi, giữa các sợi lộ vách đá ướt.
 * Mép sợi sắc (khử răng cưa theo đạo hàm màn hình), viền chàm cho khối; mặt trời mọc sau khe thì rọi ngược làm ấm gờ và viền sợi.
 * uv.x: 1/3 → 2/3 ≈ bề rộng khe đá; màn nước loe dần khi rơi. front = lớp sợi thưa phía trước cá, để cá như đang ở trong dòng nước.
 */
export function fallsMaterial(front = false) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    defines: front ? { FRONT: 1 } : {},
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 1 },
      uSun: { value: 0 },
      uInk: { value: INK },
      uCham: { value: CHAM },
      uPaper: { value: PAPER },
      uDawn: { value: DAWN },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uOpacity, uSun;
      uniform vec3 uInk, uCham, uPaper, uDawn;
      varying vec2 vUv;
      ${NOISE}
      void main() {
        float d = 1. - vUv.y;
        float x = (vUv.x - .5) * 3.;
        // Rơi hết chiều cao trong ~1.5 s, rời mép với vận tốc nhỏ: d = V0·τ + G·τ²/2.
        const float V0 = .28, G = .62;
        float tau = (sqrt(V0 * V0 + 2. * G * d) - V0) / G;
        float b = uTime - tau;
        float hw = .45 + .5 * d * d;
        float sx = x / hw + .05 * d * sin(b * 1.7 + 1.3);
        // Hai mép rách thành tua đi theo khối nước, càng xuống càng rách sâu.
        float tear = fbm(vec2(sign(x) * 13. + b * 2.3, abs(sx) * 2. + d * 1.5));
        float edge = 1. - abs(sx) - (.06 + .5 * d) * tear;
        float sheet = smoothstep(0., fwidth(edge) + 1e-4, edge);
        // Gờ hơi vồng lên giữa: nước dày ở giữa khe.
        float lip = .012 * sx * sx;
        sheet *= smoothstep(lip, lip + fwidth(d) * 1.5 + 1e-4, d);
        // Tia nước: nhiễu kéo dài theo chiều rơi nên thành tia gần liền mạch. Giữa màn dày đặc (sục khí trắng xoá),
        // ra hai mép tách thành tia rời, càng xuống càng tách — không thu nhọn như nhũ băng.
        #ifdef FRONT
          float n = fbm(vec2(sx * 6. + 3., b * 1.4));
          float th = .62 + .1 * smoothstep(.4, 1., abs(sx));
        #else
          float n = fbm(vec2(sx * 4.5, b * 1.1));
          float th = .26 + .34 * smoothstep(.4, 1., abs(sx)) + .08 * smoothstep(.1, .7, d);
        #endif
        float na = fwidth(n) + 1e-4;
        float strand = smoothstep(th - na, th + na, n);
        // Đổ bóng một lần cho cả khối: màn nước cong ở hai mép, mép mỗi tia, và thớ nước mảnh trôi nhanh dần theo trọng lực.
        float rim = 1. - smoothstep(th, th + .1, n);
        float vol = smoothstep(.45, 1., abs(sx));
        float lines = smoothstep(.55, .85, noise(vec2(sx * 26., b * 2.4)));
        vec3 white = mix(uPaper, vec3(1.), .6);
        vec3 shade = mix(uCham, uPaper, .45);
        vec3 col = mix(white, shade, max(max(vol * .5, rim * .35), lines * .4));
        // Từng khối nước rơi xuống sáng tối khác nhau một chút, nên không thành cột đứng yên.
        col = mix(col, shade, (1. - fbm(vec2(sx * 3., b * 2.))) * .25);
        // Vài thớ mực đứt khúc rơi cùng nước (chất thuỷ mặc).
        float lane = abs(fract(sx * 9.) - .5);
        float inkLine = smoothstep(.62, .8, noise(vec2(floor(sx * 9.) * 7.3, b * 4.))) * (1. - smoothstep(.04, .12, lane));
        col = mix(col, uInk, inkLine * .35 * smoothstep(.1, .4, d));
        // Gờ thác: lớp nước trong ánh chàm, một vệt sáng ngang nơi nước uốn qua mép đá, rồi sục khí trắng dần.
        float glass = 1. - smoothstep(.02, .09, d);
        vec3 glassCol = mix(uCham, uPaper, .5 + .3 * smoothstep(.0, .03, d));
        glassCol = mix(glassCol, white, (1. - smoothstep(.0, .01, abs(d - lip - .01))) * .85);
        col = mix(col, glassCol, glass);
        // Mặt trời mọc sau khe: rọi ngược, gờ và viền sợi ấm lên.
        float back = uSun * (1. - smoothstep(0., .5, d));
        col = mix(col, mix(white, uDawn, .6), back * (.2 + .55 * rim));
        float a = sheet * max(strand, mix(.1, .92, glass));
        // Chân thác vỡ thành bọt rồi tan vào sương (phần còn lại do hạt bọt, sương lo).
        a *= 1. - smoothstep(.72, 1., d) * smoothstep(.3, .6, fbm(vec2(sx * 3., b * 3.)));
        a *= 1. - smoothstep(.88, 1., d);
        #ifdef FRONT
          a *= (1. - glass) * .5;
        #endif
        gl_FragColor = vec4(col, a * uOpacity);
      }`,
  })
}
