'use client';

import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowUpRight,
  BarChart3,
  Bot,
  Check,
  ChevronDown,
  Code2,
  Database,
  FileSearch,
  Layers3,
  Mail,
  Menu,
  MessageCircle,
  Phone,
  Radar,
  ShieldCheck,
  Target,
  User,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { MobileNav } from './components/MobileNav';

const CONTACT_EMAIL = 'ensotechstudio@gmail.com';
const MESSENGER_URL = 'https://m.me/61590018866554';
const CONTACT_PHONE = '0364151304';
const CONTACT_PHONE_LABEL = '0364 151 304';
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

const assets = {
  hero: '/assets/generated/hero-instrument.png',
  positioning: '/assets/generated/positioning-collage.png',
  process: '/assets/generated/process-rail.png',
  useCases: '/assets/generated/usecase-desk.png',
};

const navLinks = [
  { href: '#services', label: 'Dịch vụ' },
  { href: '#process', label: 'Quy trình' },
  { href: '#solutions', label: 'Giải pháp' },
  { href: '#studio', label: 'Studio' },
  { href: '#privacy', label: 'Tài nguyên' },
];

const pillars = [
  {
    icon: Target,
    title: 'Workflow',
    body: 'Làm rõ điểm nghẽn, vai trò và thao tác lặp để đội ngũ vận hành nhanh hơn.',
  },
  {
    icon: ShieldCheck,
    title: 'Security',
    body: 'Thiết kế quyền truy cập, dữ liệu và kiểm soát rủi ro ngay từ đầu.',
  },
  {
    icon: Database,
    title: 'Data',
    body: 'Chuẩn hóa dữ liệu để dashboard, CRM và AI dùng chung một nguồn đúng.',
  },
  {
    icon: Layers3,
    title: 'AI',
    body: 'Đưa AI Agent vào đúng tác vụ, có guardrail và kết quả đo được.',
  },
];

const services = [
  {
    icon: Code2,
    title: 'Phần mềm riêng',
    body: 'Xây web, mobile, API và cloud theo quy trình thật của doanh nghiệp.',
  },
  {
    icon: ShieldCheck,
    title: 'Kiểm toán bảo mật',
    body: 'Đánh giá quyền truy cập, cấu hình, dữ liệu nhạy cảm và điểm yếu hệ thống.',
  },
  {
    icon: BarChart3,
    title: 'Hệ thống và dữ liệu',
    body: 'Thiết kế dashboard, báo cáo và luồng dữ liệu để ra quyết định rõ hơn.',
  },
  {
    icon: Bot,
    title: 'AI Agent',
    body: 'Tự động hóa follow-up, phân loại yêu cầu, tóm tắt nội dung và nhắc việc.',
  },
];

const processSteps = [
  {
    title: 'Audit',
    subtitle: 'Hiểu đúng bức tranh',
    body: 'Phân tích hiện trạng, luồng dữ liệu, công cụ đang dùng và rủi ro vận hành.',
  },
  {
    title: 'Roadmap',
    subtitle: 'Chọn hướng triển khai',
    body: 'Sắp xếp sáng kiến theo tác động, độ khó, nguồn lực và mục tiêu kinh doanh.',
  },
  {
    title: 'Pilot',
    subtitle: 'Thử nghiệm có kiểm soát',
    body: 'Dựng bản nhỏ với dữ liệu thật để kiểm chứng giá trị trước khi mở rộng.',
  },
  {
    title: 'Operate',
    subtitle: 'Bàn giao và tối ưu',
    body: 'Theo dõi chỉ số, huấn luyện đội ngũ và cải tiến hệ thống sau khi chạy thật.',
  },
];

const processValues = [
  { icon: Radar, title: 'Chính xác', body: 'Phân tích đến gốc rễ vấn đề' },
  { icon: Layers3, title: 'Thực tiễn', body: 'Giải pháp phù hợp bối cảnh' },
  { icon: BarChart3, title: 'Bền vững', body: 'Tối ưu để vận hành lâu dài' },
];

const useCases = [
  {
    title: 'CRM',
    icon: UsersRound,
    body: 'Gom lead, nhắc follow-up và phân quyền cho đội sales nhỏ.',
  },
  {
    title: 'Audit',
    icon: FileSearch,
    body: 'Tìm điểm nghẽn trong quy trình, dữ liệu và công cụ hiện tại.',
  },
  {
    title: 'KPI',
    icon: BarChart3,
    body: 'Theo dõi doanh thu, kho, đơn hàng và khách hàng bằng một màn hình rõ ràng.',
  },
  {
    title: 'AI',
    icon: Bot,
    body: 'Tóm tắt yêu cầu, phân loại nội dung và gợi ý hành động kế tiếp.',
  },
  {
    title: 'Agent',
    icon: MessageCircle,
    body: 'Chuẩn bị email, cập nhật CRM và nhắc việc theo guardrail đã định.',
  },
];

const contactRows = [
  {
    icon: Phone,
    label: 'Gọi hoặc Zalo',
    value: CONTACT_PHONE_LABEL,
    href: `tel:${CONTACT_PHONE}`,
  },
  {
    icon: Mail,
    label: 'Email',
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
  },
  {
    icon: MessageCircle,
    label: 'Messenger',
    value: 'EnsoTech Studio',
    href: MESSENGER_URL,
    external: true,
  },
];

type TrackingFunction = (
  first: string,
  second?: string,
  third?: Record<string, unknown> | string,
) => void;

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
    fbq?: TrackingFunction;
    gtag?: TrackingFunction;
    clarity?: TrackingFunction;
  };

  trackingWindow.fbq?.('track', 'Lead', { content_name: need });
  trackingWindow.gtag?.('event', 'generate_lead', { method: 'contact_form', need });
  trackingWindow.clarity?.('set', 'lead_form', 'submitted');
}

function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand-mark">
      <span className="brand-symbol" aria-hidden="true">
        <span />
      </span>
      {!compact && (
        <span className="brand-name">
          EnsoTech <strong>Studio</strong>
        </span>
      )}
    </span>
  );
}

function SectionReveal({
  children,
  className = '',
  id,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      id={id}
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 36, filter: 'blur(14px)' }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.78, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.section>
  );
}

function HeroTitle() {
  const shouldReduceMotion = useReducedMotion();
  const lines = ['An toàn trước.', 'AI sau.'];

  return (
    <h1 className="hero-title" aria-label="An toàn trước. AI sau.">
      {lines.map((line, index) => (
        <motion.span
          key={line}
          className="block"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 32, filter: 'blur(10px)' }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.78, delay: 0.18 + index * 0.12, ease: [0.16, 1, 0.3, 1] }}
        >
          {line === 'AI sau.' ? (
            <>
              AI sau<span className="text-lime">.</span>
            </>
          ) : (
            line
          )}
        </motion.span>
      ))}
    </h1>
  );
}

function PrimaryLink({
  href,
  children,
  className = '',
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.a
      href={href}
      className={`primary-link group ${className}`}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
    >
      {children}
      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </motion.a>
  );
}

function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <motion.a
      href={href}
      className="text-link group"
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
    >
      {children}
      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
    </motion.a>
  );
}

function ContactInput({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="field-shell">
      <span className="field-label">
        <Icon className="h-5 w-5" strokeWidth={1.8} />
        {label}
      </span>
      {children}
    </label>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const processRailRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.35], [0, -70]);
  const heroScale = useTransform(scrollYProgress, [0, 0.35], [1, 1.04]);
  const collageY = useTransform(scrollYProgress, [0.08, 0.48], [34, -34]);
  const processY = useTransform(scrollYProgress, [0.38, 0.72], [30, -30]);

  useEffect(() => {
    setupTracking();
  }, []);

  useEffect(() => {
    const processRail = processRailRef.current;
    if (!processRail) return;

    const alignProcessRail = () => {
      if (window.innerWidth >= 1024) {
        processRail.scrollLeft = 0;
        return;
      }

      const maxScroll = processRail.scrollWidth - processRail.clientWidth;
      processRail.scrollLeft = maxScroll * 0.5;

      window.requestAnimationFrame(() => {
        const detailCard = processRail.querySelector<HTMLElement>('.roadmap-card');
        if (!detailCard) return;

        const railRect = processRail.getBoundingClientRect();
        const cardRect = detailCard.getBoundingClientRect();
        const gutter = window.innerWidth < 380 ? 4 : 12;

        if (cardRect.left < railRect.left + gutter) {
          processRail.scrollLeft = Math.max(0, processRail.scrollLeft - (railRect.left + gutter - cardRect.left));
          return;
        }

        if (cardRect.right > railRect.right - gutter) {
          processRail.scrollLeft = Math.min(
            maxScroll,
            processRail.scrollLeft + cardRect.right - (railRect.right - gutter),
          );
        }
      });
    };

    alignProcessRail();
    window.addEventListener('resize', alignProcessRail);

    return () => {
      window.removeEventListener('resize', alignProcessRail);
    };
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
    <div className="site-shell min-h-[100dvh] overflow-hidden bg-pale text-deep">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-xl focus:bg-deep focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-white"
      >
        Bỏ qua điều hướng
      </a>

      <header className="site-header">
        <motion.div
          className="header-inner"
          initial={shouldReduceMotion ? false : { opacity: 0, y: -18 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.64, ease: [0.16, 1, 0.3, 1] }}
        >
          <a
            href="#top"
            className="brand-link"
            aria-label="EnsoTech Studio"
          >
            <LogoMark />
          </a>

          <nav className="desktop-nav" aria-label="Điều hướng chính">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <PrimaryLink href="#contact" className="hidden sm:inline-flex">
              Đặt lịch
            </PrimaryLink>
            <button
              type="button"
              className="menu-button"
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

      <main id="main-content">
        <section id="top" className="hero-section">
          <div className="blueprint-grid" />
          <div className="paper-noise" />
          <motion.img
            src={assets.hero}
            alt=""
            className="hero-asset"
            style={shouldReduceMotion ? undefined : { y: heroY, scale: heroScale }}
            initial={shouldReduceMotion ? false : { opacity: 0, x: 36, filter: 'blur(16px)' }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            aria-hidden="true"
          />

          <div className="hero-copy">
            <HeroTitle />
            <motion.p
              className="hero-subtitle"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 22, filter: 'blur(10px)' }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.72, delay: 0.54, ease: [0.16, 1, 0.3, 1] }}
            >
              Thiết kế phần mềm, bảo mật và AI Agent theo một roadmap có kiểm soát.
            </motion.p>
            <motion.div
              className="hero-actions"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.72, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <PrimaryLink href="#contact">Đặt lịch</PrimaryLink>
              <TextLink href="#services">Xem dịch vụ</TextLink>
            </motion.div>
          </div>
        </section>

        <SectionReveal id="studio" className="positioning-section section-pad">
          <div className="blueprint-grid" />
          <div className="section-inner positioning-grid">
            <div className="positioning-copy">
              <LogoMark compact />
              <h2>Không chỉ làm phần mềm.</h2>
              <p>
                Chúng tôi thiết kế phần mềm, bảo mật, dữ liệu và AI như một hệ sinh thái thống nhất để tạo giá trị bền vững cho doanh nghiệp.
              </p>
              <div className="positioning-note">
                Bốn trụ cột hoạt động đồng bộ trong mọi dự án, được thiết kế phù hợp với bối cảnh và mục tiêu kinh doanh của bạn.
              </div>
            </div>

            <motion.div
              className="positioning-visual"
              style={shouldReduceMotion ? undefined : { y: collageY }}
              whileHover={shouldReduceMotion ? undefined : { rotate: -0.35, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            >
              <img src={assets.positioning} alt="" aria-hidden="true" />
            </motion.div>
          </div>

          <div className="section-inner pillar-strip">
            {pillars.map((pillar, index) => {
              const PillarIcon = pillar.icon;
              return (
                <motion.article
                  key={pillar.title}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.24 }}
                  transition={{ duration: 0.58, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                >
                  <PillarIcon className="h-7 w-7" strokeWidth={1.7} />
                  <h3>{pillar.title}</h3>
                  <p>{pillar.body}</p>
                </motion.article>
              );
            })}
          </div>
        </SectionReveal>

        <SectionReveal id="services" className="services-section section-pad">
          <div className="section-inner restored-services-grid">
            <div className="service-bento">
              <motion.article
                className="bento-panel bento-panel-wide"
                whileHover={shouldReduceMotion ? undefined : { y: -8, rotate: -0.25 }}
                transition={{ type: 'spring', stiffness: 150, damping: 18 }}
              >
                <p className="bento-label">Phần mềm riêng</p>
                <p className="mt-2 text-sm text-ink/66">Web - Mobile - API - Cloud</p>
                <div className="crm-stage">
                  <div className="glass-block" aria-hidden="true" />
                  <div className="metal-sphere" aria-hidden="true" />
                  <div className="crm-window">
                    <aside>
                      <strong>EnsoCRM</strong>
                      <span>Tổng quan</span>
                      <span>Khách hàng</span>
                      <span>Cơ hội</span>
                      <span>Công việc</span>
                      <span>Báo cáo</span>
                    </aside>
                    <main>
                      <div className="crm-search">Tìm kiếm khách hàng, cơ hội...</div>
                      <h4>Tổng quan</h4>
                      <div className="crm-metrics">
                        <div>
                          <strong>12,450,000đ</strong>
                          <span>Doanh thu</span>
                        </div>
                        <div>
                          <strong>328</strong>
                          <span>Cơ hội</span>
                        </div>
                        <div>
                          <strong>128</strong>
                          <span>Khách hàng</span>
                        </div>
                        <div>
                          <strong>72%</strong>
                          <span>Tỷ lệ thắng</span>
                        </div>
                      </div>
                      <div className="crm-charts">
                        <div className="bar-chart">
                          {[42, 54, 48, 66, 58, 72, 64, 78, 88].map((height, index) => (
                            <i key={`crm-bar-${index}`} style={{ height: `${height}%` }} />
                          ))}
                        </div>
                        <div className="donut-chart">
                          <span>328</span>
                        </div>
                      </div>
                    </main>
                  </div>
                </div>
              </motion.article>

              <motion.article
                className="bento-panel security-report"
                whileHover={shouldReduceMotion ? undefined : { y: -8, rotate: 0.25 }}
                transition={{ type: 'spring', stiffness: 150, damping: 18 }}
              >
                <p className="bento-label">Kiểm toán bảo mật</p>
                <p className="mt-2 text-sm text-ink/66">Web - API - Mobile - Infrastructure</p>
                <div className="report-card">
                  <h4>Security Audit Report</h4>
                  <strong>
                    82<span>/100</span>
                  </strong>
                  <ul>
                    <li>
                      <span>Missing security headers</span>
                      <b>Medium</b>
                    </li>
                    <li>
                      <span>Outdated dependencies</span>
                      <b>Medium</b>
                    </li>
                    <li>
                      <span>Information disclosure</span>
                      <b>Low</b>
                    </li>
                  </ul>
                </div>
              </motion.article>

              <motion.article
                className="bento-panel data-panel"
                whileHover={shouldReduceMotion ? undefined : { y: -8, rotate: -0.2 }}
                transition={{ type: 'spring', stiffness: 150, damping: 18 }}
              >
                <p className="bento-label">Hệ thống và dữ liệu</p>
                <p className="mt-2 text-sm text-ink/66">Dashboard - BI - Real-time</p>
                <div className="data-window">
                  <div>
                    <span>Doanh thu</span>
                    <strong>32,540,000đ</strong>
                  </div>
                  <svg viewBox="0 0 320 120" role="img" aria-label="Biểu đồ tăng trưởng doanh thu">
                    <path d="M8 88 C38 74 46 88 72 66 C96 42 120 40 146 56 C172 72 188 74 214 52 C236 28 252 42 276 28 C292 18 306 22 314 28" />
                  </svg>
                </div>
              </motion.article>

              <motion.article
                className="bento-panel ai-flow"
                whileHover={shouldReduceMotion ? undefined : { y: -8, rotate: 0.3 }}
                transition={{ type: 'spring', stiffness: 150, damping: 18 }}
              >
                <p className="bento-label">AI Agent</p>
                <p className="mt-2 text-sm text-ink/66">Workflow - RPA - LLM</p>
                <div className="agent-flow">
                  {['Trigger', 'Enrich data', 'Score lead', 'Notify'].map((step) => (
                    <span key={step}>{step}</span>
                  ))}
                </div>
              </motion.article>
            </div>

            <div className="service-copy xl:pt-16">
              <span className="section-kicker">Dịch vụ</span>
              <h2>Tạo ra sản phẩm digital có giá trị thực tiễn</h2>
              <p>
                EnsoTech Studio đồng hành cùng doanh nghiệp xây dựng hệ thống vững chắc, vận hành hiệu quả và sẵn sàng mở rộng.
              </p>
              <div className="service-list">
                {services.map((service, index) => {
                  const ServiceIcon = service.icon;
                  return (
                    <motion.article
                      key={service.title}
                      initial={shouldReduceMotion ? false : { opacity: 0, x: 24 }}
                      whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.56, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <span>
                        <ServiceIcon className="h-7 w-7" strokeWidth={1.7} />
                      </span>
                      <div>
                        <h3>{service.title}</h3>
                        <p>{service.body}</p>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
              <TextLink href="#contact">Đặt lịch</TextLink>
            </div>
          </div>
        </SectionReveal>

        <SectionReveal id="process" className="process-section section-pad">
          <div className="blueprint-grid" />
          <div className="section-inner process-header">
            <div>
              <span className="section-kicker">Quy trình</span>
              <h2>Đồng hành từ phân tích đến vận hành</h2>
            </div>
            <div className="process-value-grid">
              {processValues.map((value) => {
                const ValueIcon = value.icon;
                return (
                  <article key={value.title}>
                    <ValueIcon className="h-8 w-8" strokeWidth={1.7} />
                    <strong>{value.title}</strong>
                    <span>{value.body}</span>
                  </article>
                );
              })}
            </div>
          </div>

          <motion.div
            ref={processRailRef}
            className="process-visual-wrap"
            style={shouldReduceMotion ? undefined : { y: processY }}
          >
            <div className="process-canvas">
              <img src={assets.process} alt="" aria-hidden="true" />
              <div className="process-tabs">
                {processSteps.map((step, index) => (
                  <motion.article
                    key={step.title}
                    className={`process-tab process-tab-${index}${index === 1 ? ' is-active' : ''}`}
                    initial={shouldReduceMotion ? false : { opacity: 0 }}
                    whileInView={shouldReduceMotion ? undefined : { opacity: 1 }}
                    viewport={{ once: true, amount: 0.24 }}
                    transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <h3>{step.title}</h3>
                    <p>{step.subtitle}</p>
                  </motion.article>
                ))}
              </div>
              <motion.article
                className="roadmap-card"
                initial={shouldReduceMotion ? false : { opacity: 0, filter: 'blur(10px)' }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, filter: 'blur(0px)' }}
                viewport={{ once: true, amount: 0.28 }}
                transition={{ duration: 0.64, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                <Target className="h-10 w-10 text-tech" strokeWidth={1.6} />
                <div>
                  <h3>Roadmap triển khai</h3>
                  <p>{processSteps[1].body}</p>
                  <ul>
                    <li>Mục tiêu và chỉ số cần đo</li>
                    <li>Luồng dữ liệu cần chuẩn hóa</li>
                    <li>Rủi ro cần khóa trước khi mở rộng</li>
                  </ul>
                </div>
              </motion.article>
            </div>
          </motion.div>

          <TextLink href="#contact">Đặt lịch</TextLink>
        </SectionReveal>

        <SectionReveal id="solutions" className="use-case-section">
          <img src={assets.useCases} alt="" className="use-case-bg" aria-hidden="true" />
          <div className="use-case-scrim" />
          <div className="use-case-inner">
            <div className="use-case-copy">
              <span className="section-kicker">Giải pháp</span>
              <h2>Những bài toán vận hành cần một hệ thống rõ ràng</h2>
              <p>
                Mỗi doanh nghiệp có một cách chạy việc riêng. Chúng tôi thiết kế giải pháp đúng trọng tâm, đo được và sẵn sàng mở rộng.
              </p>
              <TextLink href="#contact">Đặt lịch</TextLink>
            </div>

            <div className="case-stack">
              {useCases.map((item, index) => {
                const CaseIcon = item.icon;
                return (
                  <motion.article
                    key={item.title}
                    className={index === 1 ? 'is-active' : ''}
                    initial={shouldReduceMotion ? false : { opacity: 0, x: 28 }}
                    whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.18 }}
                    transition={{ duration: 0.58, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <CaseIcon className="h-8 w-8" strokeWidth={1.6} />
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </SectionReveal>

        <SectionReveal id="contact" className="contact-section section-pad">
          <div className="blueprint-grid" />
          <div className="section-inner contact-grid">
            <div className="contact-copy">
              <span className="section-kicker">Bắt đầu cùng EnsoTech</span>
              <h2>Gửi quy trình. Nhận hướng đi rõ<span className="text-lime">.</span></h2>
              <p>
                Chúng tôi phân tích nhanh và gợi ý hướng tối ưu phù hợp với mục tiêu của bạn.
              </p>
              <div className="contact-list">
                {contactRows.map((row) => {
                  const ContactIcon = row.icon;
                  return (
                    <a
                      key={row.label}
                      href={row.href}
                      target={row.external ? '_blank' : undefined}
                      rel={row.external ? 'noreferrer' : undefined}
                      className="contact-row"
                    >
                      <span>
                        <ContactIcon className="h-5 w-5" strokeWidth={1.8} />
                      </span>
                      <i>
                        <b>{row.label}</b>
                        <strong>{row.value}</strong>
                      </i>
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="form-panel">
              {submitted ? (
                <div className="success-panel">
                  <span>
                    <Check className="h-10 w-10" />
                  </span>
                  <h3>Đã chuẩn bị email</h3>
                  <p>
                    Trình gửi email đã mở với nội dung điền sẵn. Nếu chưa gửi được, hãy nhắn Messenger hoặc gửi email đến {CONTACT_EMAIL}.
                  </p>
                  <div>
                    <a href={MESSENGER_URL} target="_blank" rel="noreferrer">
                      <MessageCircle className="h-4 w-4" />
                      Nhắn Messenger
                    </a>
                    <button type="button" onClick={() => setSubmitted(false)}>
                      Gửi yêu cầu khác
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  <ContactInput icon={User} label="Họ tên">
                    <input name="name" required placeholder="Nhập họ tên" />
                  </ContactInput>
                  <ContactInput icon={Phone} label="Số điện thoại hoặc Zalo">
                    <input name="phone" required type="tel" placeholder="Nhập số điện thoại" />
                  </ContactInput>
                  <ContactInput icon={Mail} label="Email">
                    <input name="email" type="email" placeholder="Nhập email" />
                  </ContactInput>
                  <ContactInput icon={Target} label="Bạn muốn bắt đầu từ đâu?">
                    <span className="select-wrap">
                      <select name="need" required defaultValue="">
                        <option disabled value="">
                          Chọn nhu cầu
                        </option>
                        <option>Phần mềm riêng</option>
                        <option>Kiểm toán bảo mật</option>
                        <option>Dashboard dữ liệu</option>
                        <option>AI Agent</option>
                        <option>Chưa rõ, cần tư vấn</option>
                      </select>
                      <ChevronDown className="h-5 w-5" />
                    </span>
                  </ContactInput>
                  <ContactInput icon={FileSearch} label="Mô tả quy trình">
                    <textarea
                      name="process"
                      rows={4}
                      placeholder="Mô tả công cụ đang dùng và điểm đang mất thời gian nhất"
                    />
                  </ContactInput>
                  <p className="form-note">
                    <ShieldCheck className="h-5 w-5 text-tech" strokeWidth={1.8} />
                    Chỉ dùng để tư vấn roadmap.
                  </p>
                  <button type="submit" className="submit-button">
                    Gửi thông tin
                    <ArrowUpRight className="h-6 w-6" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </SectionReveal>

        <footer id="privacy" className="site-footer">
          <div className="section-inner footer-grid">
            <div>
              <LogoMark />
              <p>
                EnsoTech Studio thiết kế phần mềm, bảo mật, dashboard và AI Agent theo roadmap rõ ràng cho doanh nghiệp nhỏ, chủ shop và startup.
              </p>
            </div>
            <div>
              <strong>Liên hệ</strong>
              <span>{CONTACT_PHONE_LABEL}</span>
            </div>
            <div>
              <strong>Email</strong>
              <span>{CONTACT_EMAIL}</span>
            </div>
            <div>
              <strong>Quyền riêng tư</strong>
              <span>Thông tin bạn gửi chỉ dùng để tư vấn và chuẩn bị roadmap.</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
