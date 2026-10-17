// Trạng thái hành trình: một object thường, khung hình nào cũng đọc (DOM lẫn WebGL), không qua React state.

/** Cùng chuỗi với screens.hz (tailwind.config.js) và các @media trong voyage.css — đổi thì đổi cả ba. */
export const HZ_QUERY = '(min-width: 64rem) and (min-height: 37.5rem)'

export const voyage = {
  hz: false,
  /** Chương đang ở giữa màn hình + phần đã đi trong chương đó (0 = chương đầu). */
  sec: 0.5,
  progress: 0,
  /** Quãng đã cuộn (px), dùng cho hạt trôi theo nội dung. */
  travel: 0,
  vel: 0,
  px: 0,
  py: 0,
  pMoved: 0,
  tap: 0,
  reduce: false,
  /** Màn cuối 0..1: vũng nước → nhảy thác → hoá rồng → bay vào mây. */
  fin: 0,
  /** Khoảng cách (px) từ mép màn hình tới đầu sân khấu màn cuối: ngang = mép trái, dọc = mép trên. */
  sky: 1e4,
  lock: (() => {}) as (on: boolean) => void,
}

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

/** Giá trị theo chương: một mốc cho đầu mỗi chương (10) + 2 mốc đệm, nội suy mượt giữa các mốc. */
export function along(table: readonly number[], sec: number) {
  const i = clamp(Math.floor(sec), 0, table.length - 2)
  return table[i] + (table[i + 1] - table[i]) * smooth(0, 1, sec - i)
}

// Đêm chỉ ở chương "Vì sao" (trăng = ensō): cá nhận ánh trăng ở viền và vảy.
export const NIGHT = [0, 0, 0, 0, 0, 0, 0.95, 0.06, 0, 0, 0, 0] as const
