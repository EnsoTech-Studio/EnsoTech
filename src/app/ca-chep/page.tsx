import type { Metadata } from 'next'
import { Analytics } from '../../voyage/analytics'
import { Faq, Pain, Process, Project, Scenarios, Services, Why } from '../../voyage/chapters'
import { FloatingCta, Header, Hud } from '../../voyage/chrome'
import { Contact } from '../../voyage/contact.client'
import { EnvBack, EnvFront } from '../../voyage/env'
import { Footer } from '../../voyage/footer'
import { Hero } from '../../voyage/hero'
import { Voyage } from '../../voyage/voyage.client'

// Bản cá chép 3D, giữ ở địa chỉ phụ; trang chính là bản thư pháp. Không cho lập chỉ mục để khỏi trùng nội dung.
export const metadata: Metadata = {
  title: 'Cá chép hoá rồng',
  alternates: { canonical: '/' },
  robots: { index: false, follow: true },
}

export default function CaChep() {
  return (
    <>
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
