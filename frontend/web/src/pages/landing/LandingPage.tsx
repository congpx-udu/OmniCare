import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { FeaturesSection, HeroSection, PersonasSection, SplashScreen } from '@/components/landing'
import { STORAGE_KEYS } from '@/constants'

function shouldShowSplash() {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.SPLASH_SEEN) !== '1'
  } catch {
    return true
  }
}

/** Landing page 3 màn hình full-height theo thiết kế "masked cards". Splash chỉ hiện lần đầu mỗi phiên. */
export function LandingPage() {
  const [showSplash, setShowSplash] = useState(shouldShowSplash)
  const { hash } = useLocation()

  // Cuộn tới section khi mở /#features, /#personas từ route khác (React Router không tự làm)
  useEffect(() => {
    if (!hash || showSplash) return
    const el = document.querySelector(hash)
    if (el) el.scrollIntoView({ block: 'start' })
  }, [hash, showSplash])

  const handleSplashDone = useCallback(() => {
    setShowSplash(false)
    try {
      sessionStorage.setItem(STORAGE_KEYS.SPLASH_SEEN, '1')
    } catch {
      /* private mode: bỏ qua */
    }
  }, [])

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashDone} />}
      <HeroSection />
      <FeaturesSection />
      <PersonasSection />
    </>
  )
}
