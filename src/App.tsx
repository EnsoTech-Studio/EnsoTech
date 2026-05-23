'use client';

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
  LayoutGrid,
  Mail,
  Menu,
  MessageCircle,
  PenLine,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  User,
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
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
const HERO_VISUAL_SRC = typeof heroVisual === 'string' ? heroVisual : heroVisual.src;

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
              src={HERO_VISUAL_SRC}
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
                  src={HERO_VISUAL_SRC}
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

        <SectionReveal
          id="contact"
          className="relative overflow-hidden bg-[#f7fbfa] px-6 py-20 sm:px-8 lg:px-10 lg:py-28"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(200,230,215,0.35)_0%,transparent_38%),radial-gradient(circle_at_90%_80%,rgba(200,230,215,0.25)_0%,transparent_38%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-55 [background-image:radial-gradient(#d1e5dd_1px,transparent_1px)] [background-size:20px_20px]" />
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-10"
            fill="none"
            viewBox="0 0 1637 961"
            aria-hidden="true"
          >
            <path
              d="M-100 0 C 400 0, 800 900, 1800 900"
              fill="none"
              stroke="#167e54"
              strokeWidth="2"
            />
          </svg>

          <div className="relative z-10 mx-auto grid w-full max-w-[1200px] grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="flex flex-col pt-4 lg:col-span-5 lg:pt-8">
              <div className="mb-4 flex items-center gap-3">
                <span className="text-sm font-extrabold uppercase tracking-[0.24em] text-tech">
                  // Gửi quy trình
                </span>
                <span className="relative h-px w-8 bg-tech/25">
                  <span className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-tech" />
                </span>
              </div>

              <h2 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-deep sm:text-5xl lg:text-[3.35rem]">
                Bạn chỉ cần gửi
                <br />
                <span className="relative inline-block">
                  3 thông tin.
                  <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-tech/18" />
                </span>
              </h2>

              <p className="mt-7 max-w-[31rem] text-base leading-8 text-medium sm:text-lg">
                Bạn đang quản lý việc gì, đang dùng công cụ nào và điểm nào đang mất thời gian/dễ
                sai/khó kiểm soát nhất.
                <br />
                <br />
                Từ đó EnsoTech sẽ gợi ý nên bắt đầu từ Software, Security, Dashboard hay AI Agent.
              </p>

              <div className="mt-10 space-y-4">
                {[
                  {
                    href: `mailto:${CONTACT_EMAIL}`,
                    icon: Mail,
                    title: CONTACT_EMAIL,
                    label: 'Email liên hệ',
                  },
                  {
                    href: `tel:${CONTACT_PHONE}`,
                    icon: Phone,
                    title: CONTACT_PHONE_LABEL,
                    label: 'Hotline / Zalo',
                  },
                  {
                    href: MESSENGER_URL,
                    icon: MessageCircle,
                    title: 'EnsoTech Studio',
                    label: 'Hỗ trợ nhanh chóng',
                    external: true,
                  },
                ].map((item) => {
                  const ContactIcon = item.icon;
                  return (
                    <a
                      key={item.title}
                      href={item.href}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noreferrer' : undefined}
                      className="group flex w-full max-w-[410px] items-center gap-5 rounded-[2rem] border border-white/40 bg-white/75 p-5 shadow-[0_8px_32px_rgba(31,38,135,0.07)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_14px_34px_rgba(18,49,43,0.1)]"
                    >
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-tech text-white shadow-[0_10px_22px_rgba(22,126,84,0.24)] transition-transform duration-300 group-hover:scale-105">
                        <ContactIcon className="h-6 w-6" />
                      </span>
                      <span className="min-w-0">
                        <span className="block break-all text-[0.95rem] font-extrabold leading-snug text-deep sm:text-base">
                          {item.title}
                        </span>
                        <span className="mt-1 block text-sm font-medium text-medium">
                          {item.label}
                        </span>
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.06)] sm:p-8 lg:p-10">
                <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-tech/25 to-transparent" />
                {submitted ? (
                  <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e6f3ee] text-tech shadow-[0_16px_34px_rgba(22,126,84,0.14)]">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h3 className="mt-6 text-2xl font-extrabold text-deep">Đã chuẩn bị email</h3>
                    <p className="mt-3 max-w-md text-sm leading-7 text-medium">
                      Trình gửi email của bạn đã được mở với nội dung đã điền sẵn. Nếu chưa gửi
                      được, hãy nhắn trực tiếp qua Messenger hoặc gửi email đến {CONTACT_EMAIL}.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <a
                        href={MESSENGER_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-tech px-5 text-sm font-bold text-white shadow-[0_10px_25px_-5px_rgba(22,126,84,0.36)] transition-colors duration-300 hover:bg-deep"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Nhắn Messenger
                      </a>
                      <button
                        type="button"
                        onClick={() => setSubmitted(false)}
                        className="rounded-2xl border border-line bg-white px-5 py-3 text-sm font-bold text-deep transition-colors duration-300 hover:bg-mint"
                      >
                        Gửi yêu cầu khác
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <label className="flex gap-4">
                        <span className="mt-6 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e6f3ee] text-tech shadow-[0_10px_24px_rgba(22,126,84,0.12)]">
                          <User className="h-5 w-5" />
                        </span>
                        <span className="flex-1">
                          <span className="mb-1 block text-sm font-extrabold text-deep">
                            Họ tên
                          </span>
                          <input
                            name="name"
                            required
                            placeholder="Nhập họ và tên"
                            className="min-h-14 w-full rounded-xl border border-[#d7e5de] bg-gray-50/50 px-4 text-base text-deep shadow-sm outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-tech focus:bg-white focus:ring-4 focus:ring-tech/10"
                          />
                        </span>
                      </label>

                      <label className="flex gap-4">
                        <span className="mt-6 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e6f3ee] text-tech shadow-[0_10px_24px_rgba(22,126,84,0.12)]">
                          <Phone className="h-5 w-5" />
                        </span>
                        <span className="flex-1">
                          <span className="mb-1 block text-sm font-extrabold text-deep">
                            Số điện thoại / Zalo
                          </span>
                          <input
                            name="phone"
                            required
                            type="tel"
                            placeholder="Nhập số điện thoại"
                            className="min-h-14 w-full rounded-xl border border-[#d7e5de] bg-gray-50/50 px-4 text-base text-deep shadow-sm outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-tech focus:bg-white focus:ring-4 focus:ring-tech/10"
                          />
                        </span>
                      </label>
                    </div>

                    <label className="flex gap-4">
                      <span className="mt-6 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e6f3ee] text-tech shadow-[0_10px_24px_rgba(22,126,84,0.12)]">
                        <Mail className="h-5 w-5" />
                      </span>
                      <span className="flex-1">
                        <span className="mb-1 block text-sm font-extrabold text-deep">Email</span>
                        <input
                          name="email"
                          type="email"
                          placeholder="Nhập email của bạn"
                          className="min-h-14 w-full rounded-xl border border-[#d7e5de] bg-gray-50/50 px-4 text-base text-deep shadow-sm outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-tech focus:bg-white focus:ring-4 focus:ring-tech/10"
                        />
                      </span>
                    </label>

                    <label className="flex gap-4">
                      <span className="mt-6 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e6f3ee] text-tech shadow-[0_10px_24px_rgba(22,126,84,0.12)]">
                        <LayoutGrid className="h-5 w-5" />
                      </span>
                      <span className="flex-1">
                        <span className="mb-1 block text-sm font-extrabold text-deep">
                          Bạn muốn bắt đầu từ đâu?
                        </span>
                        <select
                          name="need"
                          defaultValue=""
                          className="min-h-14 w-full cursor-pointer rounded-xl border border-[#d7e5de] bg-gray-50/50 px-4 text-base text-medium shadow-sm outline-none transition-all duration-300 focus:border-tech focus:bg-white focus:ring-4 focus:ring-tech/10"
                        >
                          <option disabled value="">
                            Chọn hạng mục phù hợp
                          </option>
                          <option>Software</option>
                          <option>Security</option>
                          <option>Dashboard</option>
                          <option>AI Agent</option>
                          <option>Chưa rõ, cần tư vấn</option>
                        </select>
                      </span>
                    </label>

                    <label className="flex gap-4">
                      <span className="mt-6 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e6f3ee] text-tech shadow-[0_10px_24px_rgba(22,126,84,0.12)]">
                        <PenLine className="h-5 w-5" />
                      </span>
                      <span className="flex-1">
                        <span className="mb-1 block text-sm font-extrabold text-deep">
                          Mô tả quy trình hiện tại
                        </span>
                        <textarea
                          name="process"
                          rows={4}
                          className="w-full resize-none rounded-xl border border-[#d7e5de] bg-gray-50/50 px-4 py-3 text-base leading-8 text-deep shadow-sm outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-tech focus:bg-white focus:ring-4 focus:ring-tech/10"
                          placeholder="Ví dụ: đang quản lý lead bằng Google Sheet và Zalo, không biết ai follow-up, muốn có CRM mini và AI tóm tắt nhu cầu khách..."
                        />
                      </span>
                    </label>

                    <button
                      type="submit"
                      className="group flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#167e54] to-[#20a36e] px-6 text-base font-extrabold text-white shadow-[0_10px_25px_-5px_rgba(22,126,84,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#116844] hover:to-[#1a8b5c] sm:text-lg"
                    >
                      Gửi quy trình để nhận roadmap
                      <Send className="h-6 w-6 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                    </button>

                    <div className="flex items-center justify-center gap-2 text-center text-sm text-gray-500">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-tech" />
                      <span>
                        Thông tin của bạn được bảo mật tuyệt đối và chỉ dùng để tư vấn giải pháp.
                      </span>
                    </div>
                  </form>
                )}
              </div>
            </div>
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
