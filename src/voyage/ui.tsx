import type { CSSProperties, ReactNode } from 'react'

export const idx = (i: number) => ({ '--i': i }) as CSSProperties

/** Tách chữ thành từng từ có mặt nạ để hiện lần lượt (chỉ cắt theo trục y: dấu tiếng Việt không bị xén). */
export function Words({ text, start = 0 }: { text: string; start?: number }) {
  return text.split(' ').map((w, i) => (
    <span key={i}>
      <span className="w">
        <span style={idx(start + i)}>{w}</span>
      </span>{' '}
    </span>
  ))
}

/** Giữ nguyên chữ; phần [cần xác nhận] / [X] hiện thành dấu son nhỏ để chủ trang soát. */
export function Rich({ text }: { text: string }) {
  return text.split(/(\[[^\]]+\])/).map((part, i) =>
    /^\[[^\]]+\]$/.test(part) ? (
      <mark key={i} className="mk">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

/** Mũi tên cuối nhãn (→ ↓ ↗) tách ra để chạy hiệu ứng; chữ giữ nguyên. */
export function Arrowed({ text }: { text: string }) {
  const m = text.match(/^(.*?)\s*([→↓↗])$/)
  if (!m) return <>{text}</>
  // Mũi tên dính với chữ cuối, không rơi xuống một dòng riêng.
  const cut = m[1].lastIndexOf(' ') + 1
  return (
    <span>
      {m[1].slice(0, cut)}
      <span className="whitespace-nowrap">
        {m[1].slice(cut)}{' '}
        <span aria-hidden className={m[2] === '↓' ? 'arrow arrow-down' : 'arrow'}>
          {m[2]}
        </span>
      </span>
    </span>
  )
}

export function Chapter({
  id,
  labelledBy,
  className = '',
  style,
  children,
}: {
  id: string
  labelledBy: string
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      data-chapter
      style={style}
      className={`relative shrink-0 px-6 py-24 hz:h-full hz:px-0 hz:py-0 ${className}`}
    >
      {children}
    </section>
  )
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`eyebrow ${className}`}>{children}</p>
}

/** Mở đầu một chương: nhãn nhỏ, tiêu đề hiện từng chữ, câu dẫn (nếu có). */
export function Intro({
  id,
  eyebrow,
  title,
  lead,
  className = '',
  children,
}: {
  id: string
  eyebrow: string
  title: string
  lead?: string
  className?: string
  children?: ReactNode
}) {
  return (
    <div data-reveal className={`max-w-xl shrink-0 ${className}`}>
      <Eyebrow className="reveal">{eyebrow}</Eyebrow>
      <h2 id={id} className="mt-5 font-display text-[clamp(2.2rem,3.5vw,4.1rem)] leading-[1.04] tracking-[-0.015em] text-balance">
        <Words text={title} start={1} />
      </h2>
      {lead && (
        <p className="reveal muted mt-5 max-w-md text-[1.02rem] leading-relaxed" style={idx(6)}>
          {lead}
        </p>
      )}
      {children}
    </div>
  )
}
