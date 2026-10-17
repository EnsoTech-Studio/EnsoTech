'use client'

import { useRef, useState, type FormEvent } from 'react'
import { FORM } from '../content/vi'
import { checkLead, type LeadErrors } from '../lib/contact-validation'
import { trackLead } from '../voyage/contact.client'
import { Rich } from '../voyage/ui'

/** Form liên hệ trên tranh: cùng kiểm tra, cùng API với trang chính; ô nhập là một nét mực gạch chân. */
export function InkForm() {
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
    <label className="tp-field">
      <span>{FORM[key].label}</span>
      <input
        name={key}
        type={type}
        autoComplete={autoComplete}
        inputMode={key === 'phone' ? 'tel' : undefined}
        placeholder={FORM[key].placeholder}
        aria-invalid={errors[key] ? true : undefined}
        aria-describedby={errors[key] ? `tp-${key}-err` : undefined}
        onInput={() => errors[key] && setErrors((x) => ({ ...x, [key]: undefined }))}
        className="tp-input"
      />
      {errors[key] && (
        <span id={`tp-${key}-err`} className="tp-err">
          {FORM.errors[key]}
        </span>
      )}
    </label>
  )

  if (state === 'ok')
    return (
      // Form dài trên điện thoại thu lại thành lời cảm ơn ngắn, có thể nằm trên màn hình: focus để trình duyệt cuộn tới.
      <div ref={(el) => el?.focus()} tabIndex={-1} role="status" className="tp-form tp-done">
        <p className="tp-brush tp-h3">{FORM.successTitle}</p>
        <p className="tp-body">{FORM.success}</p>
      </div>
    )

  return (
    <form ref={formRef} onSubmit={submit} noValidate aria-labelledby="tp-form-title" className="tp-form">
      <h3 id="tp-form-title" className="tp-brush tp-h3">
        {FORM.title}
      </h3>
      <div className="tp-pair">
        {field('name', 'text', 'name')}
        {field('phone', 'tel', 'tel')}
      </div>
      <label className="tp-field">
        <span>{FORM.need.label}</span>
        <textarea name="need" rows={2} placeholder={FORM.need.placeholder} className="tp-input" />
      </label>
      <fieldset className="tp-field">
        <legend>{FORM.quickLabel}</legend>
        <div className="tp-chips">
          {FORM.quick.map((q) => (
            <label key={q} className="tp-chip">
              <input type="checkbox" name="quick" value={q} className="sr-only" />
              {q}
            </label>
          ))}
        </div>
      </fieldset>
      {/* Bẫy máy: người thật không thấy ô này. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] size-px opacity-0" />
      <div>
        <button type="submit" disabled={state === 'sending'} className="seal">
          {state === 'sending' ? FORM.sending : FORM.submit}
        </button>
        <span role="status" className="sr-only">
          {state === 'sending' ? FORM.sending : ''}
        </span>
      </div>
      {state === 'fail' && (
        <p role="alert" className="tp-err">
          {FORM.failure}
        </p>
      )}
      <p className="tp-note">
        <Rich text={FORM.note} />
      </p>
    </form>
  )
}
