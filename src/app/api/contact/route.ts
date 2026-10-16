import { checkLead } from '../../../lib/contact-validation'
import { rateLimited, sendLead } from '../../../server/contact'

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'local'
  if (rateLimited(ip)) return Response.json({ ok: false, error: 'rate' }, { status: 429 })

  const body: unknown = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') return Response.json({ ok: false, error: 'invalid' }, { status: 400 })

  const check = checkLead(body as Record<string, unknown>)
  // Bẫy máy: trả "ok" để bot không thử lại, nhưng không gửi gì.
  if (!check.ok && check.spam) return Response.json({ ok: true })
  if (!check.ok) return Response.json({ ok: false, errors: check.errors }, { status: 422 })

  try {
    await sendLead(check.lead)
    return Response.json({ ok: true })
  } catch (err) {
    console.error('[contact] gửi thất bại', err)
    return Response.json({ ok: false, error: 'send' }, { status: 502 })
  }
}
