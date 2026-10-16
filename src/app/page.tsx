import { CONTACT, SITE } from '../content/vi'
import { Analytics } from '../voyage/analytics'
import { Faq, Pain, Process, Project, Scenarios, Services, Why } from '../voyage/chapters'
import { FloatingCta, Header, Hud } from '../voyage/chrome'
import { Contact } from '../voyage/contact.client'
import { EnvBack, EnvFront } from '../voyage/env'
import { Footer } from '../voyage/footer'
import { Hero } from '../voyage/hero'
import { Voyage } from '../voyage/voyage.client'

const jsonLd = [
  { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE.url}/#website`, name: SITE.name, url: SITE.url, inLanguage: 'vi-VN' },
  {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/assets/favicon-logo-notext-rounded.png`,
    image: `${SITE.url}/assets/og-image.png`,
    description: SITE.description,
    email: CONTACT.email,
    telephone: CONTACT.phoneE164,
    areaServed: { '@type': 'Country', name: 'Vietnam' },
    sameAs: [CONTACT.messengerHref],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: SITE.name,
      itemListElement: SITE.services.map((name) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })),
    },
  },
]

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <div aria-hidden className="paper" />
      <Header />
      <Voyage back={<EnvBack />} front={<EnvFront />}>
        <main className="hz:contents">
          <Hero />
          <Pain />
          <Services />
          <Project />
          <Scenarios />
          <Process />
          <Why />
          <Faq />
          <Contact />
        </main>
        <Footer />
      </Voyage>
      <Hud />
      <FloatingCta />
      <div aria-hidden className="grain" />
      <Analytics />
    </>
  )
}
