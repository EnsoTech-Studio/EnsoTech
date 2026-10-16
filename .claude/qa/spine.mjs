// Soi khung xương sống của rồng theo đường chữ S trong phòng thử: in góc lăn (lưng lệch khỏi phương thẳng đứng) dọc thân.
const THREE = await import('file:///D:/Jobs/EnsoTech%20Studio/Ensotech/node_modules/three/build/three.module.js')
const V3 = THREE.Vector3
const NSP = 128
const DL = 12
const ds = DL / (NSP - 1)
const P = Array.from({ length: NSP }, () => new V3())
const Tn = Array.from({ length: NSP }, () => new V3())
const Up = Array.from({ length: NSP }, () => new V3())
const w = new V3()
const up = new V3(0, 1, 0)
const frames = () => {
  for (let i = 0; i < NSP; i++) Tn[i].subVectors(P[Math.min(i + 1, NSP - 1)], P[Math.max(i - 1, 0)]).normalize()
  Up[0].copy(up).addScaledVector(Tn[0], -up.dot(Tn[0])).normalize()
  for (let i = 1; i < NSP; i++) {
    w.copy(up).addScaledVector(Tn[i], -up.dot(Tn[i]))
    Up[i].copy(Up[i - 1]).addScaledVector(Tn[i], -Up[i - 1].dot(Tn[i])).normalize().addScaledVector(w, 0.15)
    Up[i].addScaledVector(Tn[i], -Up[i].dot(Tn[i])).normalize()
  }
}
const path = (s, o) => o.set(0.75 * s, 1.3 * Math.sin(0.55 * s + 0.5), 0.8 * Math.sin(0.35 * s + 1))
const side = new V3()
const tmp = new V3()
const a = new V3()
const b = new V3()
path(6, P[0])
a.copy(P[0])
let k = 1
let need = ds
for (let n = 1; k < NSP && n < NSP * 16; n++) {
  path(6 - (n * ds) / 4, b)
  let d = a.distanceTo(b)
  while (k < NSP && d >= need) {
    a.lerp(b, need / d)
    P[k++].copy(a)
    d -= need
    need = ds
  }
  need -= d
  a.copy(b)
}
for (; k < NSP; k++) P[k].copy(P[k - 1]).add(tmp.subVectors(P[k - 1], P[k - 2]))
frames()
const sm = THREE.MathUtils.smootherstep
const wave = 0.22
const t = 1
for (let i = 1; i < NSP; i++) {
  const s = i * ds
  const env = sm(s, 0, 2.5) * (0.7 + 0.3 * sm(s, 6, 12))
  const ph = 1.05 * s - t * 2.2
  side.crossVectors(Up[i], Tn[i])
  P[i].addScaledVector(Up[i], wave * env * Math.sin(ph)).addScaledVector(side, 0.5 * wave * env * Math.cos(ph))
}
for (let i = 1; i < NSP; i++) {
  tmp.subVectors(P[i], P[i - 1]).setLength(ds)
  P[i].copy(P[i - 1]).add(tmp)
}
frames()
const bad = []
for (let i = 1; i < NSP; i++) if (Up[i].dot(Up[i - 1]) < 0.99 || Tn[i].dot(Tn[i - 1]) < 0.99) bad.push(`${i}:${Up[i].dot(Up[i - 1]).toFixed(3)}/${Tn[i].dot(Tn[i - 1]).toFixed(3)}`)
console.log('jumps', bad.join(' '))
const out = []
for (let i = 0; i < NSP; i += 4) {
  w.copy(up).addScaledVector(Tn[i], -up.dot(Tn[i])).normalize()
  const roll = (Math.acos(Math.min(1, Math.max(-1, Up[i].dot(w)))) * 180) / Math.PI
  out.push(`${(i * ds).toFixed(1)}:${roll.toFixed(0)}`)
}
console.log(out.join(' '))
