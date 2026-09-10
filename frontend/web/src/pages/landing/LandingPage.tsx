import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  CtaSection,
  FaqSection,
  FeaturesSection,
  HeroSection,
  PersonasSection,
  StepsSection,
} from '@/components/landing'

/** Landing công khai: hero → tính năng → cách hoạt động → dành cho ai → câu hỏi → CTA */
export function LandingPage() {
  const { hash } = useLocation()

  // Cuộn tới section khi mở /#features, /#faq... từ route khác (React Router không tự làm)
  useEffect(() => {
    if (!hash) return
    document.querySelector(hash)?.scrollIntoView({ block: 'start' })
  }, [hash])

  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <StepsSection />
      <PersonasSection />
      <FaqSection />
      <CtaSection />
    </>
  )
}
