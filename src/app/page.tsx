import Script from 'next/script';
import App from '../App';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://enso.io.vn';

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${siteUrl}/#website`,
  name: 'EnsoTech Studio',
  alternateName: ['EnsoTech', 'EnsoTech Studio Vietnam'],
  url: siteUrl,
  inLanguage: 'vi-VN',
  publisher: {
    '@id': `${siteUrl}/#organization`,
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${siteUrl}/#organization`,
  name: 'EnsoTech Studio',
  alternateName: 'EnsoTech',
  url: siteUrl,
  logo: `${siteUrl}/assets/favicon-logo-notext-rounded.png`,
  image: `${siteUrl}/assets/og-image.png`,
  description:
    'EnsoTech Studio tư vấn roadmap và xây phần mềm theo yêu cầu: audit bảo mật, dashboard dữ liệu, AI/Agentic AI cho doanh nghiệp nhỏ, chủ shop và startup.',
  email: 'ensotechstudio@gmail.com',
  telephone: '+84364151304',
  areaServed: {
    '@type': 'Country',
    name: 'Vietnam',
  },
  sameAs: ['https://m.me/61590018866554'],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: 'ensotechstudio@gmail.com',
      telephone: '+84364151304',
      availableLanguage: ['vi', 'en'],
    },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'EnsoTech Studio services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Phần mềm theo yêu cầu',
          description: 'Xây web app, hệ thống quản lý nội bộ, CRM mini và workflow riêng.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Security audit và nâng cấp bảo mật',
          description: 'Rà soát phân quyền, dữ liệu, API, backup và audit log.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Dashboard dữ liệu',
          description: 'Dựng dashboard cho KPI, doanh thu, đơn hàng, kho và khách hàng.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'AI Agent và Agentic AI',
          description: 'Thiết kế AI agent có guardrails, log và bước duyệt khi cần.',
        },
      },
    ],
  },
};

export default function HomePage() {
  return (
    <>
      <Script
        id="ensotech-organization-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([websiteJsonLd, organizationJsonLd]) }}
      />
      <App />
    </>
  );
}
