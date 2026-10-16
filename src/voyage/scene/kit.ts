// Đồ nghề chung cho cá và rồng: nội suy bảng mốc, màu, và một "phòng chụp" ánh sáng vật lý viết tay
// (không texture, không tải gì): bầu trời lụa ấm, một hộp đèn lớn phía trên để thân ướt có vệt bóng dài,
// mặt trời xiên trái, viền sáng từ sau, mặt nước ngọc bích phản chiếu từ dưới. Chương đêm: ánh trăng xanh.

import * as THREE from 'three'

/** Màu sRGB thô (giữ nguyên giá trị) — cho các shader nước vẽ thẳng ra màn hình. */
export const rgb = (hex: number) => new THREE.Vector3(((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255)

/** Nội suy Hermite qua các mốc (độ dốc = trung bình hai cát tuyến kề): mượt, không gợn; ngoài khoảng thì giữ giá trị biên. */
export function curve(xs: number[], ys: number[]) {
  const m = ys.map((_, i) => {
    const a = Math.max(0, i - 1)
    const b = Math.min(ys.length - 1, i + 1)
    return (ys[b] - ys[a]) / (xs[b] - xs[a])
  })
  return (x: number) => {
    let i = 0
    while (i < xs.length - 2 && x > xs[i + 1]) i++
    const h = xs[i + 1] - xs[i]
    const t = THREE.MathUtils.clamp((x - xs[i]) / h, 0, 1)
    const t2 = t * t
    const t3 = t2 * t
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1]
  }
}

/** Uniform ánh sáng dùng chung (cá, rồng, bóng): ngày ↔ đêm, độ phơi sáng. */
export const lightUniforms = () => ({ uNight: { value: 0 }, uExposure: { value: 1 } })

/** Nhiễu giá trị 3D + fbm: vân da, mép mảng màu, lửa. */
export const NOISE = /* glsl */ `
float hash13(vec3 p) { p = fract(p * .1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float hash12(vec2 p) { return hash13(vec3(p, 17.17)); }
float vnoise(vec3 x) {
  vec3 i = floor(x), f = fract(x);
  f = f * f * (3. - 2. * f);
  return mix(mix(mix(hash13(i), hash13(i + vec3(1, 0, 0)), f.x), mix(hash13(i + vec3(0, 1, 0)), hash13(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(hash13(i + vec3(0, 0, 1)), hash13(i + vec3(1, 0, 1)), f.x), mix(hash13(i + vec3(0, 1, 1)), hash13(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
float fbm(vec3 p) { return .5 * vnoise(p) + .28 * vnoise(p * 2.07 + 7.1) + .14 * vnoise(p * 4.13 + 3.7) + .08 * vnoise(p * 8.3 + 1.3); }
`

/**
 * Lưới vảy so le: vảy nào gần đầu hơn thì đè lên vảy sau (như ngói). Trả về độ lệch tới tâm vảy đang lộ, khoảng cách tới
 * mép sau của nó, và khoảng cách tới mép vảy trước đang đè lên (bóng đổ mảnh).
 */
export const SCALES = /* glsl */ `
const float SR = .86;
vec4 scaleAt(vec2 g, out vec2 center) {
  float best = 1e9, jr = floor(g.y + .5);
  center = vec2(0.);
  for (int dj = -1; dj <= 1; dj++) {
    float j = jr + float(dj), off = mod(j, 2.) * .5, ic = floor(g.x - off + .5);
    for (int di = -1; di <= 1; di++) {
      vec2 c = vec2(ic + float(di) + off, j);
      float key = c.x + c.y * .001;
      if (length(g - c) < SR && key < best) { best = key; center = c; }
    }
  }
  float shade = 1e3;
  for (int dj = -1; dj <= 1; dj++) {
    float j = jr + float(dj), off = mod(j, 2.) * .5, ic = floor(g.x - off + .5);
    for (int di = -1; di <= 1; di++) {
      vec2 c = vec2(ic + float(di) + off, j);
      if (c.x + c.y * .001 < best) shade = min(shade, length(g - c) - SR);
    }
  }
  vec2 d = g - center;
  return vec4(d, SR - length(d), shade);
}
`

/** Chiếu sáng tuyến tính: GGX + Fresnel Schlick, môi trường dựng bằng công thức, ACES, ra sRGB. */
export const LIGHT = /* glsl */ `
uniform float uNight, uExposure;
const float PI = 3.14159265;
const vec3 KEY = vec3(-0.5164, 0.7746, 0.3651);
const vec3 BOX = vec3(-0.1543, 0.9258, 0.3443);
const vec3 RIM = vec3(0.5698, 0.3108, -0.7608);
vec3 dn(vec3 day, vec3 night) { return mix(day, night, uNight); }
vec3 keyCol() { return dn(vec3(2.5, 2.25, 1.85), vec3(.55, .68, .95)); }
vec3 rimCol() { return dn(vec3(1.5, 1.45, 1.35), vec3(.8, .95, 1.4)); }

/** Ánh sáng môi trường theo hướng phản chiếu R; rough làm nhoè hộp đèn và mặt trời. */
vec3 envRad(vec3 R, float rough) {
  float w = clamp(rough * rough * 1.6, 0., 1.);
  vec3 top = dn(vec3(.55, .62, .7), vec3(.03, .05, .09));
  vec3 hor = dn(vec3(1.3, 1.16, .95), vec3(.1, .13, .2));
  vec3 gnd = dn(vec3(.07, .16, .14), vec3(.01, .015, .025));
  vec3 c = mix(hor, top, smoothstep(.0, .8, R.y));
  c = mix(c, gnd, smoothstep(.04, -.35 - w * .3, R.y));
  float b = dot(R, BOX);
  c += dn(vec3(3.6, 3.45, 3.2), vec3(.7, .85, 1.2)) * smoothstep(.93 - w * .8, .965 - w * .45, b) * (1. - .75 * w);
  float k = max(dot(R, KEY), 0.);
  c += dn(vec3(9., 7.5, 5.5), vec3(1.8, 2., 2.6)) * pow(k, mix(600., 8., w)) * mix(1., .12, w);
  return c;
}
/** Ánh sáng khuếch tán từ môi trường (bán cầu trời/nước + hộp đèn). */
vec3 envIrr(vec3 N) {
  vec3 sky = dn(vec3(.66, .68, .7), vec3(.07, .1, .17));
  vec3 gnd = dn(vec3(.16, .21, .2), vec3(.015, .025, .04));
  return mix(gnd, sky, .5 + .5 * N.y) + dn(vec3(.4, .38, .35), vec3(.08, .1, .14)) * max(dot(N, BOX), 0.);
}
float dGGX(float NoH, float a) { float a2 = a * a; float d = NoH * NoH * (a2 - 1.) + 1.; return a2 / (PI * d * d); }
float vSmith(float NoV, float NoL, float a) { return .5 / (NoL * (NoV * (1. - a) + a) + NoV * (NoL * (1. - a) + a) + 1e-5); }
float fSchlick(float f0, float c) { return f0 + (1. - f0) * pow(1. - c, 5.); }
/** Một thuỳ phản xạ gương của đèn L (đã nhân NoL), hệ số phản xạ f0. */
float specLobe(vec3 N, vec3 V, vec3 L, float rough, float f0) {
  vec3 H = normalize(L + V);
  float NoL = max(dot(N, L), 0.), NoV = max(dot(N, V), 1e-3), NoH = max(dot(N, H), 0.);
  float a = max(rough * rough, .002);
  return dGGX(NoH, a) * vSmith(NoV, NoL, a) * fSchlick(f0, max(dot(V, H), 0.)) * NoL;
}
vec3 aces(vec3 x) { return clamp((x * (2.51 * x + .03)) / (x * (2.43 * x + .59) + .14), 0., 1.); }
vec3 toScreen(vec3 c) { return pow(aces(c * uExposure), vec3(1. / 2.2)); }
`
