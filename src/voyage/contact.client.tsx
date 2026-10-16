'use client'

import { Check, Mail, MessageCircle, Phone } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { CONTACT_SECTION, FORM } from '../content/vi'
import { checkLead, type LeadErrors } from '../lib/contact-validation'
import { Chapter, Intro, Rich, idx } from './ui'

type Fn = (...args: unknown[]) => void
const ICON = [MessageCircle, Phone, MessageCircle, Mail]

/** Báo "có khách" cho các công cụ đo đã bật (xem analytics.tsx). Công cụ nào chưa bật thì bỏ qua. */
function trackLead(need: string) {
  const w = window as unknown as Partial<Record<'fbq' | 'gtag' | 'clarity', Fn>>
  w.fbq?.('track', 'Lead', { content_name: need })
  w.gtag?.('event', 'generate_lead', { method: 'contact_form', need })
  w.clarity?.('set', 'lead_form', 'submitted')
}

export function Contact() {
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'fail'>('idle')
  const [errors, setErrors] = useState<LeadErrors>({})
  const formRef = useRef<HTMLFormElement>(null)

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data = { ...Object.fromEntries(fd), quick: fd.getAll('quick').join(' · ') }
    const check = checkLead(data)
    if (!check.ok && !check.spam) {
      setErrors(check.errors)
      formRef.current?.querySelector<HTMLElement>(check.errors.name ? '[name=name]' : '[name=phone]')?.focus()
      return
    }
    setErrors({})
    setState('sending')
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) })
      const json = (await res.json()) as { ok?: boolean }
      if (!json.ok) throw new Error(String(res.status))
      trackLead(data.quick || String(fd.get('need') ?? ''))
      setState('ok')
    } catch {
      setState('fail')
    }
  }

  const field = (key: 'name' | 'phone', type: string, autoComplete: string) => (
    <label className="block">
      <span className="text-[0.82rem] font-semibold text-ink/80">{FORM[key].label}</span>
      <input
        name={key}
        type={type}
        autoComplete={autoComplete}
        inputMode={key === 'phone' ? 'tel' : undefined}
        placeholder={FORM[key].placeholder}
        aria-invalid={errors[key] ? true : undefined}
        aria-describedby={errors[key] ? `${key}-err` : undefined}
        onInput={() => errors[key] && setErrors((x) => ({ ...x, [key]: undefined }))}
        className="field"
      />
      {errors[key] && (
        <span id={`${key}-err`} className="mt-1.5 block text-[0.8rem] text-son">
          {FORM.errors[key]}
        </span>
      )}
    </label>
  )

  return (
    <Chapter id="lien-he" labelledBy="contact-title" className="hz:flex hz:items-center hz:gap-[5vw] hz:pl-[8vw] hz:pr-[12vw]">
      <Intro id="contact-title" eyebrow={CONTACT_SECTION.eyebrow} title={CONTACT_SECTION.title} lead={CONTACT_SECTION.lead} className="hz:w-[30vw]">
        <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10 [@media(max-height:46rem)]:mt-5">
          {CONTACT_SECTION.channels.map((c, i) => {
            const I = ICON[i]
            return (
              <li key={c.href} className="reveal" style={idx(7 + i)}>
                <a
                  href={c.href}
                  {...(c.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="group flex items-center gap-4 py-3 [@media(max-height:46rem)]:py-2"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border border-ink/15 text-cham transition-colors group-hover:border-son group-hover:bg-son group-hover:text-paper">
                    <I className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.74rem] text-wash">{c.label}</span>
                    <span className="block font-semibold underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-son">{c.value}</span>
                    {c.note && (
                      <span className="mt-0.5 block text-[0.78rem]">
                        <Rich text={c.note} />
                      </span>
                    )}
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </Intro>

      <div data-reveal className="mt-14 shrink-0 hz:mt-0 hz:w-[clamp(24rem,34vw,34rem)]">
        <div className="reveal sheet rounded-[4px] p-6 sm:p-8 [@media(max-height:46rem)]:p-5" style={idx(2)}>
          {state === 'ok' ? (
            <div role="status" className="py-6 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-son text-paper">
                <Check className="size-6" aria-hidden />
              </span>
              <p className="mt-5 font-display text-[2rem] font-semibold">{FORM.successTitle}</p>
              <p className="muted mx-auto mt-2 max-w-sm leading-relaxed">{FORM.success}</p>
            </div>
          ) : (
            <form ref={formRef} onSubmit={submit} noValidate aria-labelledby="form-title" className="space-y-5 [@media(max-height:46rem)]:space-y-3">
              <h3 id="form-title" className="font-display text-[clamp(1.4rem,1.7vw,1.8rem)] font-semibold leading-tight">
                {FORM.title}
              </h3>
              <div className="grid gap-5 sm:grid-cols-2 [@media(max-height:46rem)]:gap-3">
                {field('name', 'text', 'name')}
                {field('phone', 'tel', 'tel')}
              </div>
              <label className="block">
                <span className="text-[0.82rem] font-semibold text-ink/80">{FORM.need.label}</span>
                <textarea name="need" rows={2} placeholder={FORM.need.placeholder} className="field resize-none leading-relaxed" />
              </label>
              <fieldset>
                <legend className="text-[0.82rem] font-semibold text-ink/80">{FORM.quickLabel}</legend>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {FORM.quick.map((q) => (
                    <label
                      key={q}
                      className="cursor-pointer rounded-full border border-ink/20 px-3 py-1.5 text-[0.8rem] transition-colors hover:border-ink has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-son"
                    >
                      <input type="checkbox" name="quick" value={q} className="sr-only" />
                      {q}
                    </label>
                  ))}
                </div>
              </fieldset>
              {/* Bẫy máy: người thật không thấy ô này. */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] size-px opacity-0" />
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <button type="submit" disabled={state === 'sending'} className="btn btn-son disabled:cursor-wait disabled:opacity-70">
                  {state === 'sending' ? FORM.sending : FORM.submit}
                </button>
                <span role="status" className="sr-only">
                  {state === 'sending' ? FORM.sending : ''}
                </span>
              </div>
              {state === 'fail' && (
                <p role="alert" className="border-l-2 border-son pl-3 text-[0.88rem] text-son">
                  {FORM.failure}
                </p>
              )}
              <p className="text-[0.78rem] leading-relaxed text-wash">
                <Rich text={FORM.note} />
              </p>
            </form>
          )}
        </div>
      </div>
    </Chapter>
  )
}
