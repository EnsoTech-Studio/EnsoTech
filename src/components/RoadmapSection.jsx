import { motion, useReducedMotion } from 'framer-motion';
import { BarChart3, Box, ChevronRight, Code2, Map, ShieldCheck } from 'lucide-react';

const roadmapSteps = [
  {
    number: '01',
    title: 'Audit',
    text: 'Nhìn lại quy trình, dữ liệu, hệ thống cũ và rủi ro bảo mật.',
    icon: ShieldCheck,
  },
  {
    number: '02',
    title: 'Roadmap',
    text: 'Chọn hướng đi: Software, Security, Dashboard, AI Agent hoặc kết hợp.',
    icon: Map,
  },
  {
    number: '03',
    title: 'Prototype',
    text: 'Làm bản nhỏ để kiểm chứng luồng, quyền truy cập, dữ liệu và trải nghiệm.',
    icon: Box,
  },
  {
    number: '04',
    title: 'Build',
    text: 'Triển khai theo từng mốc, demo sớm, không ôm quá nhiều tính năng.',
    icon: Code2,
  },
  {
    number: '05',
    title: 'Operate',
    text: 'Bàn giao, theo dõi, log, backup và mở rộng AI/automation khi dữ liệu đã sẵn sàng.',
    icon: BarChart3,
  },
];

function IconBox({ icon: Icon, compact = false }) {
  return (
    <div
      className={`relative z-10 flex shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f0fdf4_0%,#dcfce7_100%)] text-[#2b7a4b] shadow-inner ${
        compact ? 'h-14 w-14' : 'h-16 w-16'
      }`}
    >
      <Icon className={`${compact ? 'h-7 w-7' : 'h-8 w-8'} stroke-[2.15]`} />
    </div>
  );
}

function TimelineMarker({ index }) {
  return (
    <motion.div
      className="roadmap-marker relative z-10 hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_0_0_4px_rgba(43,122,75,0.10),inset_0_2px_4px_rgba(0,0,0,0.10)] sm:flex"
      initial={{ opacity: 0, scale: 0.74 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.45 }}
      transition={{ duration: 0.42, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <span
        className="roadmap-marker-halo"
        style={{ animationDelay: `${index * 0.16}s` }}
      />
      <span
        className="roadmap-marker-dot relative h-3 w-3 rounded-full bg-[linear-gradient(135deg,#2b7a4b_0%,#1a4331_100%)]"
        style={{ animationDelay: `${index * 0.16}s` }}
      />
    </motion.div>
  );
}

function RoadmapCard({ step, index }) {
  return (
    <motion.div
      className="group relative flex cursor-pointer items-center gap-6 lg:gap-10"
      initial={{ opacity: 0, x: 28 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      <TimelineMarker index={index} />

      <article className="roadmap-wave-card relative isolate flex flex-1 items-center gap-4 overflow-hidden rounded-3xl border border-gray-50 bg-white p-5 shadow-[0_12px_40px_-12px_rgba(43,122,75,0.10)] transition-[transform,box-shadow,border-color] duration-500 ease-smooth group-hover:-translate-y-2 group-hover:border-green-100 group-hover:shadow-[0_22px_54px_-18px_rgba(43,122,75,0.22)] sm:gap-5 lg:px-6 lg:py-4">
        <span className="pointer-events-none absolute right-6 top-1/2 z-0 -translate-y-1/2 text-[2.7rem] font-extrabold leading-none text-gray-100/70 transition-colors duration-300 group-hover:text-green-50 sm:text-5xl">
          {step.number}
        </span>

        <IconBox compact icon={step.icon} />

        <div className="relative z-10 min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-3">
            <span className="text-base font-bold text-[#2b7a4b] sm:text-lg">{step.number}</span>
            <h3 className="text-lg font-bold text-[#1a4331] sm:text-xl">{step.title}</h3>
          </div>
          <p className="max-w-md text-sm leading-6 text-gray-500">{step.text}</p>
        </div>

        <ChevronRight className="relative z-10 h-5 w-5 shrink-0 text-gray-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#2b7a4b]" />
      </article>
    </motion.div>
  );
}

export function RoadmapSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      id="process"
      className="flex min-h-screen items-center justify-center bg-[#fcfcfc] px-8 py-16 text-[#1a4331] lg:py-14"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24, filter: 'blur(8px)' }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <main className="relative mx-auto grid w-full max-w-[1400px] grid-cols-1 items-start gap-16 lg:grid-cols-12">
        <div className="flex h-full flex-col justify-center lg:sticky lg:top-8 lg:col-span-5">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-tech">
            // Roadmap
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-deep sm:text-5xl">
            Bắt đầu bằng audit, không bắt đầu bằng đoán mò.
          </h2>
          <p className="mt-5 text-base leading-8 text-medium">
            Một roadmap tốt giúp bạn biết nên làm phần mềm, nâng cấp bảo mật, dựng dashboard hay thử AI agent trước.
          </p>

          <motion.div
            className="relative mt-12 flex max-w-lg items-start gap-6 overflow-hidden rounded-3xl border border-gray-100 bg-white/90 p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05),0_4px_6px_-4px_rgba(0,0,0,0.02)] backdrop-blur-md"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <IconBox icon={ShieldCheck} />
            <div className="relative z-10">
              <h3 className="mb-2 text-lg font-bold text-[#1a4331]">
                Minh bạch • Có kế hoạch • Hiệu quả
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">
                Quy trình chuẩn giúp bạn tiết kiệm thời gian, chi phí và tránh rủi ro.
              </p>
            </div>
          </motion.div>
        </div>

        <div className="relative pl-8 lg:col-span-7 lg:pl-16">
          <div className="roadmap-timeline-line absolute bottom-8 left-[calc(3rem-1px)] top-8 -z-10 hidden w-[2px] border-l-2 border-dashed border-green-200 sm:block lg:left-[calc(5rem-1px)]" />

          <div className="flex flex-col gap-4">
            {roadmapSteps.map((step, index) => (
              <RoadmapCard key={step.title} step={step} index={index} />
            ))}
          </div>
        </div>
      </main>
    </motion.section>
  );
}
