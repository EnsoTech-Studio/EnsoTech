import type { CSSProperties } from 'react'

export type Box = readonly [x: number, y: number, w?: number, h?: number]

/** p: vị trí trên tranh (đơn vị U). v: vị trí ở trang dọc (% khung chứa). Thiếu cái nào thì ẩn ở chế độ đó. */
export function place(p?: Box, v?: Box): CSSProperties {
  const s: Record<string, string | number> = {}
  if (p) {
    s['--x'] = p[0]
    s['--y'] = p[1]
    if (p[2] !== undefined) s['--w'] = p[2]
    if (p[3] !== undefined) s['--h'] = p[3]
  }
  if (v) Object.assign(s, { '--vx': `${v[0]}%`, '--vy': `${v[1]}%`, '--vw': `${v[2] ?? 0}%`, '--vh': `${v[3] ?? 0}%` })
  return s as CSSProperties
}

export interface AnchorProps {
  art: string
  p?: Box
  v?: Box
  /** Thứ tự nét trong cùng một khung nhìn. */
  o?: number
  tone?: number
  seed?: number
  /** "a b": hiện theo tiến độ hoá rồng thay vì theo vị trí. */
  f?: string
  gap?: number
  /** Sương phủ lên trên rồng. */
  over?: number
  /** Hệ số thời lượng vẽ. */
  d?: number
  /** Lớp sâu: > 0 ở xa (trôi chậm theo máy quay), < 0 ở gần (lướt nhanh hơn). */
  par?: number
}

/** Điểm neo cho nét vẽ: engine đo hình chữ nhật này rồi vẽ núi, đá, lau, thác… vào đúng chỗ. */
export function A({ art, p, v, ...data }: AnchorProps) {
  const d: Record<string, string | number | undefined> = {}
  for (const [k, val] of Object.entries(data)) d[`data-${k}`] = val
  return <i aria-hidden className="a" data-art={art} data-p={p ? '' : undefined} data-v={v ? '' : undefined} style={place(p, v)} {...d} />
}
