import { FormEvent, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowUpRight,
  BarChart3,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Code2,
  FileSearch,
  Mail,
  Menu,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import heroVisual from './assets/background_trans.png';
import { LiquidGlassCard } from './components/LiquidGlassCard';
import { MobileNav } from './components/MobileNav';
import { RoadmapSection } from './components/RoadmapSection';
import { SectionReveal } from './components/SectionReveal';

const CONTACT_EMAIL = 'ensotechstudio@gmail.com';
const MESSENGER_URL = 'https://m.me/61590018866554';
const CONTACT_PHONE = '0364151304';
const CONTACT_PHONE_LABEL = '0364 151 304';
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const CLARITY_PROJECT_ID = import.meta.env.VITE_CLARITY_PROJECT_ID;

const navLinks = [
  { href: '#positioning', label: 'Khác biệt' },
  { href: '#services', label: 'Năng lực' },
  { href: '#process', label: 'Roadmap' },
  { href: '#contact', label: 'Tư vấn' },
];

function appendInlineScript(id: string, source: string) {
  if (!source || document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.textContent = source;
  document.head.appendChild(script);
}

function appendExternalScript(id: string, src: string) {
  if (!src || document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

function setupTracking() {
  if (META_PIXEL_ID) {
    appendInlineScript(
      'meta-pixel-init',
      `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`,
    );
  }

  if (GA_MEASUREMENT_ID) {
    appendExternalScript(
      'ga-loader',
      `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`,
    );
    appendInlineScript(
      'ga-init',
      `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`,
    );
  }

  if (CLARITY_PROJECT_ID) {
    appendInlineScript(
      'clarity-init',
      `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,'clarity','script','${CLARITY_PROJECT_ID}');`,
    );
  }
}

function trackLeadSubmit(need: string) {
  const trackingWindow = window as Window & {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  };

  trackingWindow.fbq?.('track', 'Lead', { content_name: need });
  trackingWindow.gtag?.('event', 'generate_lead', { method: 'contact_form', need });
  trackingWindow.clarity?.('set', 'lead_form', 'submitted');
}

const positioningCards = [
  {
    icon: Code2,
    title: 'Software theo quy trình thật',
    text: 'Xây web app, hệ thống quản lý và dashboard dựa trên cách team bạn vận hành hằng ngày.',
  },
  {
    icon: ShieldCheck,
    title: 'Security audit từ sớm',
    text: 'Rà soát phân quyền, dữ liệu, API, backup và audit log trước khi hệ thống phình to.',
  },
  {
    icon: BrainCircuit,
    title: 'AI có kiểm soát',
    text: 'Không gắn chatbot cho có. AI được đặt đúng bước trong quy trình, có giới hạn và có người kiểm soát.',
  },
  {
    icon: Bot,
    title: 'Agentic AI thực dụng',
    text: 'Thiết kế AI agent cho các luồng lặp lại như lead, support, báo cáo, nhắc việc và CRM.',
  },
];

const services = [
  {
    icon: Code2,
    title: 'Phần mềm riêng',
    text: 'Web app, hệ thống quản lý nội bộ, CRM mini, quản lý đơn hàng, kho và khách hàng.',
    tags: ['Web app', 'Workflow', 'Admin'],
  },
  {
    icon: ShieldCheck,
    title: 'Nâng cấp bảo mật',
    text: 'Phân quyền, audit log, backup, bảo vệ API, kiểm soát dữ liệu và rà soát thông tin nhạy cảm.',
    tags: ['Security', 'Access', 'Audit log'],
  },
  {
    icon: FileSearch,
    title: 'Audit hệ thống',
    text: 'Đánh giá hệ thống cũ, quy trình, dữ liệu và roadmap nâng cấp trước khi viết lại.',
    tags: ['Review', 'Risk', 'Roadmap'],
  },
  {
    icon: BarChart3,
    title: 'Dashboard dữ liệu',
    text: 'Biến Excel, Zalo, Google Sheet và dữ liệu rời rạc thành báo cáo dễ nhìn, dễ quyết định.',
    tags: ['KPI', 'Realtime', 'Reports'],
  },
  {
    icon: BrainCircuit,
    title: 'Giải pháp AI',
    text: 'Tóm tắt, phân loại, trích xuất tài liệu, tìm kiếm nội bộ và gợi ý hành động.',
    tags: ['LLM', 'RAG', 'Automation'],
  },
  {
    icon: Bot,
    title: 'Agentic AI',
    text: 'AI agent hỗ trợ chuỗi công việc có nhiều bước, có guardrails, log và bước duyệt khi cần.',
    tags: ['Agent', 'Guardrails', 'Human review'],
  },
];

const useCases = [
  'Từ Excel/Zalo thành phần mềm quản lý có phân quyền',
  'Audit hệ thống cũ trước khi rewrite hoặc nâng cấp',
  'Dashboard realtime cho đơn hàng, kho, khách hàng, doanh thu',
  'AI tóm tắt yêu cầu khách hàng và gợi ý phản hồi',
  'AI agent chấm điểm lead, nhắc follow-up và cập nhật CRM',
  'Kiểm soát dữ liệu, quyền truy cập và hành động của AI',
];

function IconBadge({ icon: Icon, dark = false }: { icon: LucideIcon; dark?: boolean }) {
  return (
    <span
      className={`flex h-11 w-11 items-center justify-center rounded-lg transition-all duration-300 ${
        dark ? 'bg-white/12 text-lime' : 'bg-mint text-tech group-hover:bg-lime/45'
      }`}
    >
      <Icon className="h-5 w-5" />
    </span>
  );
}

function BlurText({ text, className = '' }: { text: string; className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  const words = text.split(' ');

  return (
    <h1 className={className} aria-label={text}>
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          aria-hidden="true"
          className="inline-block"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24, filter: 'blur(10px)' }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, delay: index * 0.065, ease: [0.22, 1, 0.36, 1] }}
        >
          {word}
          {index < words.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </h1>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setupTracking();
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get('name') ?? '').trim();
    const phone = String(formData.get('phone') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const need = String(formData.get('need') ?? '').trim();
    const process = String(formData.get('process') ?? '').trim();

    const subject = encodeURIComponent(
      `Yeu cau roadmap EnsoTech Studio${name ? ` - ${name}` : ''}`,
    );
    const body = encodeURIComponent(
      [
        'Chao EnsoTech Studio,',
        '',
        'Toi muon gui quy trinh hien tai de nhan roadmap tu van.',
        '',
        `Ho ten: ${name}`,
        `So dien thoai / Zalo: ${phone}`,
        `Email: ${email || 'Chua cung cap'}`,
        `Nhu cau: ${need}`,
        '',
        'Mo ta quy trinh hien tai:',
        process || 'Chua mo ta',
        '',
        'Cam on EnsoTech Studio.',
      ].join('\n'),
    );

    trackLeadSubmit(need);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setSubmitted(true);
    form.reset();
  };

  return (
    <div className="min-h-screen overflow-hidden bg-pale text-ink">
      <header className="fixed left-0 right-0 top-0 z-30 px-4 py-4 sm:px-6 lg:px-10">
        <motion.div
          className="mx-auto flex max-w-7xl items-center justify-between"
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <a
            href="#top"
            className="flex items-center gap-3 rounded-full pr-3 text-deep"
            aria-label="EnsoTech Studio"
          >
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-deep text-sm font-bold text-white shadow-soft">
              <img src="/assets/logo.png" alt="" className="h-full w-full object-cover" />
            </span>
            <span className="hidden text-sm font-bold tracking-tight sm:block">
              EnsoTech Studio
            </span>
          </a>

          <nav
            className="liquid-glass hidden items-center gap-1 rounded-full px-2 py-1.5 lg:flex"
            aria-label="Điều hướng chính"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-semibold text-medium transition-colors duration-200 hover:text-deep"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="#contact"
              className="group hidden min-h-11 items-center justify-center gap-2 rounded-lg bg-tech px-4 text-sm font-semibold text-white shadow-soft transition-all duration-300 hover:bg-deep sm:inline-flex"
            >
              Nhận roadmap
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/70 text-deep backdrop-blur-md transition-colors duration-300 hover:bg-white lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Mở menu"
              aria-expanded={menuOpen}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      </header>

      <MobileNav links={navLinks} open={menuOpen} onClose={() => setMenuOpen(false)} />

      <main id="top">
        <section className="mesh-bg relative min-h-screen overflow-hidden pt-24">
          <div className="grid-overlay pointer-events-none absolute inset-0" />
          <div className="noise pointer-events-none absolute inset-0 opacity-[0.08]" />
          <motion.div
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-[52%] items-center justify-center pt-20 lg:flex"
            initial={{ opacity: 0, y: 28, scale: 0.96, filter: 'blur(14px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.95, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
          >
            <img
              src={heroVisual}
              alt=""
              aria-hidden="true"
              className="h-auto w-[92%] max-w-none -translate-y-8 object-contain drop-shadow-[0_28px_76px_rgba(15,107,75,0.16)]"
            />
          </motion.div>

          <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] max-w-7xl flex-col justify-center px-4 pb-12 sm:px-6 lg:px-10">
            <div className="max-w-3xl">
              <motion.div
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/65 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-tech shadow-soft backdrop-blur-md"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <Sparkles className="h-4 w-4" />
                Software · Security Audit · Dashboard · AI Agent
              </motion.div>

              <BlurText
                text="Xây hệ thống an toàn hơn, thông minh hơn"
                className="max-w-4xl text-[2.36rem] font-extrabold leading-[1.04] tracking-tight text-deep sm:text-6xl lg:text-[4.7rem] xl:text-[5.1rem]"
              />

              <motion.p
                className="mt-6 max-w-2xl text-base leading-8 text-medium sm:text-lg"
                initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.7, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                EnsoTech Studio giúp doanh nghiệp nhỏ và startup xây phần mềm riêng, audit/nâng cấp
                bảo mật, dựng dashboard và triển khai AI/Agentic AI có kiểm soát. Không chỉ code
                tính năng, chúng tôi giúp bạn chọn đúng roadmap để dùng được thật.
              </motion.p>

              <motion.div
                className="mt-8 flex flex-col gap-3 sm:flex-row"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.82, ease: [0.22, 1, 0.36, 1] }}
              >
                <a
                  href="#contact"
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-tech px-6 text-sm font-bold text-white shadow-glass transition-all duration-300 hover:bg-deep"
                >
                  Gửi quy trình, nhận roadmap
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
                <a
                  href="#services"
                  className="inline-flex min-h-12 items-center justify-center rounded-lg border border-line bg-white/70 px-6 text-sm font-bold text-deep backdrop-blur-md transition-all duration-300 hover:border-lime hover:bg-white"
                >
                  Xem năng lực
                </a>
              </motion.div>

              <motion.div
                className="mt-8 flex flex-wrap gap-3"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1, ease: [0.22, 1, 0.36, 1] }}
              >
                {['Audit trước khi build', 'AI có guardrails', 'Security đi cùng dữ liệu'].map(
                  (chip) => (
                    <span
                      key={chip}
                      className="liquid-glass rounded-full px-4 py-2 text-sm font-semibold text-medium"
                    >
                      {chip}
                    </span>
                  ),
                )}
              </motion.div>

              <motion.div
                className="pointer-events-none relative mt-8 h-[260px] overflow-visible sm:h-[360px] lg:hidden"
                initial={{ opacity: 0, y: 24, scale: 0.96, filter: 'blur(12px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.9, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                aria-hidden="true"
              >
                <img
                  src={heroVisual}
                  alt=""
                  className="absolute left-1/2 top-0 h-auto w-[132%] max-w-none -translate-x-1/2 object-contain opacity-95 sm:w-[104%]"
                />
              </motion.div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 z-10 h-16 bg-gradient-to-t from-pale to-transparent" />
        </section>

        <SectionReveal id="positioning" className="relative bg-pale px-4 py-20 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-tech">
                // Khác biệt
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight text-deep sm:text-5xl">
                Không chỉ làm phần mềm. Xây nền vận hành an toàn và sẵn sàng AI.
              </h2>
              <p className="mt-5 text-base leading-8 text-medium sm:text-lg">
                Dữ liệu, quyền truy cập, bảo mật và AI phải được thiết kế cùng nhau. Đây là điểm
                EnsoTech muốn làm khác.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {positioningCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <LiquidGlassCard className="group h-full p-5 transition-all duration-300 hover:-translate-y-1 hover:border-lime hover:shadow-glass">
                    <IconBadge icon={card.icon} />
                    <h3 className="mt-8 text-xl font-bold text-deep">{card.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-medium">{card.text}</p>
                  </LiquidGlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </SectionReveal>

        <SectionReveal
          id="services"
          className="relative overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-10"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(183,227,109,0.18),transparent_32%)]" />
          <div className="relative mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-3xl">
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-tech">
                  // Năng lực
                </p>
                <h2 className="text-3xl font-extrabold tracking-tight text-deep sm:text-5xl">
                  Software, Security, Dashboard và AI Agent trong một roadmap
                </h2>
              </div>
              <p className="max-w-md text-base leading-8 text-medium">
                Bạn không cần biết thuật ngữ kỹ thuật. Chỉ cần mô tả quy trình, EnsoTech sẽ giúp
                chọn hướng đi phù hợp.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service, index) => (
                <motion.article
                  key={service.title}
                  className="group rounded-lg border border-line bg-pale p-6 transition-all duration-300 hover:-translate-y-1 hover:border-lime hover:bg-white hover:shadow-soft"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.55, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                >
                  <IconBadge icon={service.icon} />
                  <h3 className="mt-8 text-xl font-bold text-deep">{service.title}</h3>
                  <p className="mt-3 min-h-20 text-sm leading-7 text-medium">{service.text}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-tech"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </SectionReveal>

        <RoadmapSection />

        <SectionReveal className="relative overflow-hidden bg-deep px-4 py-20 text-white sm:px-6 lg:px-10">
          <div className="data-band pointer-events-none absolute inset-0 opacity-40" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(183,227,109,0.18),transparent_30%),radial-gradient(circle_at_90%_60%,rgba(239,125,91,0.14),transparent_32%)]" />
          <div className="relative mx-auto max-w-7xl">
            <LiquidGlassCard dark className="p-6 sm:p-10 lg:p-14">
              <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
                <div>
                  <p className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-lime">
                    // Use case
                  </p>
                  <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                    Từ hệ thống cũ đến AI Agent, đi từng bước để giảm rủi ro.
                  </h2>
                  <p className="mt-5 max-w-2xl text-base leading-8 text-white/82 sm:text-lg">
                    EnsoTech không bán một buzzword. Chúng tôi giúp bạn chọn use case nhỏ, có dữ
                    liệu, có quyền truy cập rõ và có thể đo được.
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <a
                      href="#contact"
                      className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-lime px-6 text-sm font-extrabold text-deep transition-all duration-300 hover:bg-white"
                    >
                      Nhận roadmap miễn phí
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                    <a
                      href={MESSENGER_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/20 px-6 text-sm font-bold text-white transition-all duration-300 hover:border-lime hover:bg-white/10"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Nhắn Messenger
                    </a>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {useCases.map((item) => (
                    <div
                      key={item}
                      className="rounded-lg border border-white/12 bg-white/8 p-4 text-sm font-semibold leading-6 text-white backdrop-blur"
                    >
                      <CheckCircle2 className="mb-5 h-5 w-5 text-lime" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        </SectionReveal>

        <SectionReveal id="contact" className="bg-white px-4 py-20 sm:px-6 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-tech">
                // Gửi quy trình
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight text-deep sm:text-5xl">
                Bạn chỉ cần gửi 3 thông tin.
              </h2>
              <p className="mt-5 text-base leading-8 text-medium">
                Bạn đang quản lý việc gì, đang dùng công cụ nào và điểm nào đang mất thời gian/dễ
                sai/khó kiểm soát nhất. Từ đó EnsoTech sẽ gợi ý nên bắt đầu từ Software, Security,
                Dashboard hay AI Agent.
              </p>
              <div className="mt-8 space-y-3">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="flex items-center gap-3 text-sm font-bold text-deep transition-colors duration-300 hover:text-tech"
                >
                  <Mail className="h-5 w-5 text-tech" />
                  {CONTACT_EMAIL}
                </a>
                <a
                  href={`tel:${CONTACT_PHONE}`}
                  className="flex items-center gap-3 text-sm font-bold text-deep transition-colors duration-300 hover:text-tech"
                >
                  <Phone className="h-5 w-5 text-tech" />
                  {CONTACT_PHONE_LABEL}
                </a>
                <a
                  href={MESSENGER_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-sm font-bold text-deep transition-colors duration-300 hover:text-tech"
                >
                  <MessageCircle className="h-5 w-5 text-tech" />
                  EnsoTech Studio
                </a>
              </div>
            </div>

            <LiquidGlassCard className="p-5 sm:p-7">
              {submitted ? (
                <div className="flex min-h-[430px] flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-lime/40 text-tech">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="mt-6 text-2xl font-extrabold text-deep">Đã chuẩn bị email</h3>
                  <p className="mt-3 max-w-md text-sm leading-7 text-medium">
                    Trình gửi email của bạn đã được mở với nội dung đã điền sẵn. Nếu chưa gửi được,
                    hãy nhắn trực tiếp qua Messenger hoặc gửi email đến {CONTACT_EMAIL}.
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <a
                      href={MESSENGER_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-tech px-5 text-sm font-bold text-white transition-colors duration-300 hover:bg-deep"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Nhắn Messenger
                    </a>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="rounded-lg border border-line bg-white px-5 py-3 text-sm font-bold text-deep transition-colors duration-300 hover:bg-mint"
                    >
                      Gửi yêu cầu khác
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-bold text-deep">
                      Họ tên
                      <input
                        name="name"
                        required
                        className="min-h-12 rounded-lg border border-line bg-white px-4 text-sm outline-none transition-colors duration-300 focus:border-tech"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-bold text-deep">
                      Số điện thoại / Zalo
                      <input
                        name="phone"
                        required
                        className="min-h-12 rounded-lg border border-line bg-white px-4 text-sm outline-none transition-colors duration-300 focus:border-tech"
                      />
                    </label>
                  </div>
                  <label className="grid gap-2 text-sm font-bold text-deep">
                    Email
                    <input
                      name="email"
                      type="email"
                      className="min-h-12 rounded-lg border border-line bg-white px-4 text-sm outline-none transition-colors duration-300 focus:border-tech"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-bold text-deep">
                    Bạn muốn bắt đầu từ đâu?
                    <select
                      name="need"
                      className="min-h-12 rounded-lg border border-line bg-white px-4 text-sm outline-none transition-colors duration-300 focus:border-tech"
                    >
                      <option>Gửi quy trình để nhận roadmap</option>
                      <option>Xây phần mềm riêng / web app</option>
                      <option>Audit hoặc nâng cấp bảo mật</option>
                      <option>Làm dashboard dữ liệu</option>
                      <option>Triển khai AI / Agentic AI</option>
                      <option>Chưa rõ, cần tư vấn</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-bold text-deep">
                    Mô tả quy trình hiện tại
                    <textarea
                      name="process"
                      rows={5}
                      className="resize-none rounded-lg border border-line bg-white px-4 py-3 text-sm leading-7 outline-none transition-colors duration-300 focus:border-tech"
                      placeholder="Ví dụ: đang quản lý lead bằng Google Sheet và Zalo, không biết ai follow-up, muốn có CRM mini và AI tóm tắt nhu cầu khách..."
                    />
                  </label>
                  <button
                    type="submit"
                    className="group mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-tech px-6 text-sm font-extrabold text-white transition-all duration-300 hover:bg-deep"
                  >
                    Gửi quy trình để nhận roadmap
                    <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </button>
                </form>
              )}
            </LiquidGlassCard>
          </div>
        </SectionReveal>

        <SectionReveal
          id="privacy"
          className="border-t border-line bg-pale px-4 py-16 sm:px-6 lg:px-10"
        >
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-tech">
                // Quyền riêng tư
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight text-deep sm:text-4xl">
                Thông tin của bạn chỉ dùng để tư vấn roadmap.
              </h2>
              <p className="mt-5 text-base leading-8 text-medium">
                EnsoTech Studio thu thập thông tin bạn chủ động gửi như họ tên, số điện thoại/Zalo,
                email và mô tả quy trình để liên hệ tư vấn dịch vụ phần mềm, bảo mật, dashboard hoặc
                AI Agent. Chúng tôi không bán dữ liệu cá nhân cho bên thứ ba.
              </p>
              <div className="mt-6 grid gap-3 text-sm leading-7 text-medium sm:grid-cols-3">
                <div className="rounded-lg border border-line bg-white/70 p-4">
                  <strong className="block text-deep">Liên hệ</strong>
                  {CONTACT_PHONE_LABEL}
                </div>
                <div className="rounded-lg border border-line bg-white/70 p-4">
                  <strong className="block text-deep">Email</strong>
                  {CONTACT_EMAIL}
                </div>
                <div className="rounded-lg border border-line bg-white/70 p-4">
                  <strong className="block text-deep">Tracking</strong>
                  Chỉ bật khi bạn cấu hình Pixel/Analytics.
                </div>
              </div>
            </div>
          </div>
        </SectionReveal>
      </main>

      <footer className="border-t border-line bg-pale px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-medium sm:flex-row sm:items-center">
          <p className="font-semibold">
            EnsoTech Studio — Software, Security, Dashboard và AI Agent.
          </p>
          <div className="flex gap-5">
            <a href="#services" className="transition-colors duration-300 hover:text-tech">
              Năng lực
            </a>
            <a href="#process" className="transition-colors duration-300 hover:text-tech">
              Roadmap
            </a>
            <a href="#contact" className="transition-colors duration-300 hover:text-tech">
              Tư vấn
            </a>
            <a href="#privacy" className="transition-colors duration-300 hover:text-tech">
              Quyền riêng tư
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
