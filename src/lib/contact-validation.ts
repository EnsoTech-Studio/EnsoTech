// Dùng chung cho form (trình duyệt) và route /api/contact (máy chủ). Không import gì để chạy thẳng bằng node --test.

export type Lead = { name: string; phone: string; need: string; quick: string }
export type LeadErrors = Partial<Record<'name' | 'phone', true>>
export type LeadCheck = { ok: true; lead: Lead } | { ok: false; errors: LeadErrors; spam?: true }

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, max) : '')

/** Số Việt Nam: 0xxxxxxxxx hoặc +84xxxxxxxxx; cho phép khoảng trắng, chấm, gạch. */
export function normalizePhone(v: unknown): string | null {
  const digits = typeof v === 'string' ? v.replace(/[\s.\-()]/g, '') : ''
  const m = digits.match(/^(?:\+?84|0)([35789]\d{8})$/)
  return m ? `0${m[1]}` : null
}

export function checkLead(input: Record<string, unknown>): LeadCheck {
  if (text(input.website, 200)) return { ok: false, errors: {}, spam: true }
  const name = text(input.name, 80)
  const phone = normalizePhone(input.phone)
  const errors: LeadErrors = {}
  if (!name) errors.name = true
  if (!phone) errors.phone = true
  if (!phone || !name) return { ok: false, errors }
  return { ok: true, lead: { name, phone, need: text(input.need, 1500), quick: text(input.quick, 200) } }
}
