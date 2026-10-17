import nodemailer from 'nodemailer'
import type { Lead } from '../lib/contact-validation'

// Chỉ chạy trên máy chủ (route /api/contact). Mật khẩu SMTP nằm trong biến môi trường, không bao giờ ra trình duyệt.

const WINDOW_MS = 10 * 60_000
const MAX_PER_WINDOW = 5
// ponytail: bộ đếm trong bộ nhớ của một tiến trình; chạy nhiều máy chủ thì chuyển sang Redis/KV.
const hits = new Map<string, number[]>()

export function rateLimited(ip: string, now = Date.now()) {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  hits.set(ip, [...recent, now])
  if (hits.size > 5000) hits.clear()
  return recent.length >= MAX_PER_WINDOW
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

export async function sendLead(lead: Lead) {
  const lines = [
    ['Tên', lead.name],
    ['Số điện thoại / Zalo', lead.phone],
    ['Chọn nhanh', lead.quick || '—'],
    ['Đang mất thời gian vào', lead.need || '—'],
  ]
  if (process.env.CONTACT_DRY_RUN === '1') {
    console.info('[contact] dry run', lead)
    return
  }
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_FROM, CONTACT_TO } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !CONTACT_TO) throw new Error('SMTP chưa cấu hình')
  const port = Number(SMTP_PORT || 465)
  const mailer = nodemailer.createTransport({ host: SMTP_HOST, port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } })
  await mailer.sendMail({
    from: CONTACT_FROM || SMTP_USER,
    to: CONTACT_TO,
    subject: `Khách mới: ${lead.name} · ${lead.phone}`,
    text: lines.map(([k, v]) => `${k}: ${v}`).join('\n'),
    html: `<table cellpadding="6">${lines.map(([k, v]) => `<tr><td><b>${k}</b></td><td>${esc(v)}</td></tr>`).join('')}</table>`,
  })
}
