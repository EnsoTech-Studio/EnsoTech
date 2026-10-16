import { Volume2 } from 'lucide-react'
import { MOCK } from '../content/vi'

// Bản dựng lại giao diện tuchamsocgan.vn bằng HTML/CSS (không dùng ảnh chụp). Chữ thật chỉ lấy từ MOCK;
// phần còn lại là vạch xám thay chữ. Trang trí thuần tuý: aria-hidden ở nơi dùng.

const SKY = '#0ea5e9'
const bar = (w: string, c = 'bg-slate-200') => <span className={`block h-[0.42em] rounded-full ${c}`} style={{ width: w }} />

/** Gương mặt thang đo đau Wong-Baker, vẽ bằng CSS. mood 0 (cười) → 5 (khóc). */
function Face({ mood, on = false }: { mood: number; on?: boolean }) {
  const hue = [140, 95, 60, 40, 20, 0][mood]
  return (
    <span
      className={`relative grid aspect-square w-full place-items-center rounded-[22%] border ${on ? 'border-emerald-400 bg-emerald-50 shadow-[0_0_0_2px_rgb(52_211_153/0.25)]' : 'border-slate-200 bg-white'}`}
    >
      <span className="relative block size-[62%] rounded-full" style={{ background: `hsl(${hue} 80% 62%)` }}>
        <span className="absolute left-[26%] top-[34%] size-[13%] rounded-full bg-slate-800/80" />
        <span className="absolute right-[26%] top-[34%] size-[13%] rounded-full bg-slate-800/80" />
        <span
          className="absolute left-1/2 top-[60%] h-[16%] w-[44%] -translate-x-1/2 border-slate-800/80"
          style={mood < 3 ? { borderBottomWidth: 2, borderRadius: '0 0 999px 999px' } : { borderTopWidth: 2, borderRadius: '999px 999px 0 0', top: '66%' }}
        />
      </span>
    </span>
  )
}

function Tile({ hue }: { hue: number }) {
  return (
    <span className="flex flex-col items-center gap-[0.5em] rounded-[0.6em] border border-slate-100 bg-white py-[0.8em] shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
      <span className="size-[1.6em] rounded-full" style={{ background: `hsl(${hue} 75% 70%)` }} />
      {bar('46%')}
    </span>
  )
}

/** Cửa sổ trình duyệt: thanh đọc to, khối "Sức khỏe hôm nay", "Lời khuyên nhanh", "Hành trình điều trị". */
export function DesktopMock() {
  return (
    <div className="overflow-hidden rounded-[10px] bg-slate-50 text-[clamp(7px,0.62vw,10px)] leading-tight text-slate-700 shadow-[0_40px_80px_-40px_rgb(28_27_25/0.7),0_0_0_1px_rgb(28_27_25/0.08)]">
      <div className="flex items-center gap-[0.6em] border-b border-slate-200 bg-white px-[1.2em] py-[0.8em]">
        <span className="flex gap-[0.4em]">
          {['#f87171', '#fbbf24', '#34d399'].map((c) => (
            <span key={c} className="size-[0.8em] rounded-full" style={{ background: c }} />
          ))}
        </span>
        <span className="mx-auto h-[1.7em] w-[46%] rounded-full bg-slate-100" />
      </div>
      <div className="flex items-center gap-[0.8em] bg-white px-[1.6em] py-[0.9em] shadow-[0_1px_0_rgb(15_23_42/0.06)]">
        <span className="grid size-[2.2em] place-items-center rounded-[0.5em] text-white" style={{ background: SKY }}>
          <span className="text-[1.4em] font-bold leading-none">+</span>
        </span>
        <span className="w-[16%] space-y-[0.35em]">
          {bar('100%', 'bg-slate-300')}
          {bar('70%')}
        </span>
        <span className="ml-auto flex w-[50%] justify-between">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="w-[20%]">
              {bar('100%')}
            </span>
          ))}
        </span>
      </div>

      <div className="space-y-[1.2em] p-[1.6em]">
        <div className="flex items-center gap-[0.8em] rounded-[0.7em] px-[1.2em] py-[0.9em] text-white" style={{ background: `linear-gradient(90deg, ${SKY}, #38bdf8)` }}>
          <Volume2 className="size-[1.5em]" />
          <span className="text-[1.25em] font-semibold">{MOCK.readAloud}</span>
          <span className="ml-auto h-[1.8em] w-[3.8em] rounded-full bg-white/25" />
        </div>

        <div className="grid grid-cols-[1.15fr_1fr] gap-[1.2em]">
          <div className="rounded-[0.9em] bg-white p-[1.2em] shadow-[0_6px_18px_-10px_rgb(14_165_233/0.5)]">
            <p className="flex items-center gap-[0.5em] text-[1.45em] font-bold text-slate-800">
              <span className="size-[1.1em] rounded-[0.3em] border-2" style={{ borderColor: SKY }} />
              {MOCK.health}
            </p>
            <span className="mt-[0.7em] block w-[60%]">{bar('100%')}</span>
            <div className="mt-[1em] grid grid-cols-3 gap-[0.6em]">
              {[200, 150, 0, 30, 20, 350].map((h) => (
                <Tile key={h} hue={h} />
              ))}
            </div>
            <span className="mt-[1.1em] block w-[44%]">{bar('100%', 'bg-slate-300')}</span>
            <div className="mt-[0.7em] grid grid-cols-6 gap-[0.45em]">
              {[0, 1, 2, 3, 4, 5].map((m) => (
                <Face key={m} mood={m} on={m === 0} />
              ))}
            </div>
            <span className="relative mt-[0.9em] block h-[0.55em] rounded-full bg-[linear-gradient(90deg,#22c55e,#eab308_45%,#f97316_70%,#ef4444)]">
              <span className="absolute -top-[0.3em] left-0 size-[1.15em] rounded-full border-2 border-white shadow" style={{ background: SKY }} />
            </span>
          </div>

          <div className="space-y-[1.2em]">
            <div className="rounded-[0.9em] border border-sky-100 bg-white p-[1.2em] shadow-[0_6px_18px_-10px_rgb(14_165_233/0.5)]">
              <p className="text-[1.3em] font-bold leading-snug text-slate-800">{MOCK.advice}</p>
              <span className="mt-[0.8em] block space-y-[0.5em]">
                {bar('90%', 'bg-sky-100')}
                {bar('70%', 'bg-sky-100')}
              </span>
              <span className="mt-[1em] block space-y-[0.55em] rounded-[0.6em] bg-slate-50 p-[0.9em]">
                {bar('80%', 'bg-slate-300')}
                {bar('95%')}
                {bar('88%')}
                {bar('60%')}
              </span>
            </div>
            <div className="rounded-[0.9em] bg-white p-[1.2em] shadow-[0_6px_18px_-10px_rgb(14_165_233/0.5)]">
              <p className="flex items-center gap-[0.5em] text-[1.2em] font-bold text-slate-800">
                {MOCK.journey}
                <Volume2 className="ml-auto size-[1.2em]" style={{ color: SKY }} />
              </p>
              <span className="mt-[1em] flex items-center">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className="flex flex-1 items-center last:flex-none">
                    <span className="grid size-[1.6em] place-items-center rounded-full text-[0.9em] font-bold text-white" style={{ background: i < 2 ? SKY : '#cbd5e1' }}>
                      {i + 1}
                    </span>
                    {i < 3 && <span className="h-[2px] flex-1" style={{ background: i < 1 ? SKY : '#e2e8f0' }} />}
                  </span>
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Cửa sổ sản phẩm nghiêng, điện thoại chồng một góc (trang chính và trang chi tiết dự án). */
export function ProductShot({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={`[transform:rotateY(-11deg)_rotateX(4deg)] ${className}`}>
      <DesktopMock />
      <div className="absolute -bottom-[8%] -right-[2%] w-[23%] [transform:translateZ(80px)]">
        <PhoneMock />
      </div>
    </div>
  )
}

/** Điện thoại: đầu trang xanh trời và thang đo đau. */
export function PhoneMock() {
  return (
    <div className="overflow-hidden rounded-[1.4em] border-[0.35em] border-ink bg-slate-50 text-[clamp(6px,0.5vw,8px)] leading-tight shadow-[0_30px_60px_-24px_rgb(28_27_25/0.75)]">
      <div className="space-y-[0.9em] px-[1.2em] pb-[3.2em] pt-[2.2em] text-white" style={{ background: `linear-gradient(160deg, ${SKY}, #7dd3fc)` }}>
        <span className="block w-[50%]">{bar('100%', 'bg-white/50')}</span>
        <span className="block space-y-[0.5em]">
          <span className="block h-[1.4em] w-[90%] rounded-full bg-white/90" />
          <span className="block h-[1.4em] w-[52%] rounded-full bg-white/90" />
        </span>
        <span className="block w-[80%] space-y-[0.4em]">
          {bar('100%', 'bg-white/40')}
          {bar('86%', 'bg-white/40')}
        </span>
      </div>
      <div className="-mt-[2em] space-y-[0.8em] px-[0.9em] pb-[1.4em]">
        <div className="rounded-[0.9em] bg-white p-[1em] shadow-[0_6px_14px_-8px_rgb(14_165_233/0.6)]">
          <p className="text-[1.35em] font-bold text-slate-800">{MOCK.health}</p>
          <div className="mt-[0.8em] grid grid-cols-3 gap-[0.4em]">
            {[0, 2, 5].map((m) => (
              <Face key={m} mood={m} on={m === 0} />
            ))}
          </div>
          <span className="mt-[0.8em] block h-[0.5em] rounded-full bg-[linear-gradient(90deg,#22c55e,#eab308_45%,#f97316_70%,#ef4444)]" />
        </div>
        <div className="flex items-center gap-[0.5em] rounded-[0.8em] px-[0.9em] py-[0.8em] text-white" style={{ background: SKY }}>
          <Volume2 className="size-[1.3em] shrink-0" />
          <span className="w-full">{bar('80%', 'bg-white/60')}</span>
        </div>
      </div>
    </div>
  )
}
