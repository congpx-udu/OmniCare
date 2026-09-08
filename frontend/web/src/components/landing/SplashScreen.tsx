import { useEffect, useState } from 'react'
import { cn } from '@/utils'

interface SplashScreenProps {
  onComplete: () => void
}

const STEP_MS = 20
const STEPS = 100

/** Màn chào: đếm 0→100 trong 2s ở góc dưới trái, mờ dần rồi gỡ khỏi DOM */
export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [count, setCount] = useState(0)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    let n = 0
    const timer = window.setInterval(() => {
      n += 1
      setCount(n)
      if (n >= STEPS) window.clearInterval(timer)
    }, STEP_MS)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (count < STEPS) return
    const t1 = window.setTimeout(() => setExiting(true), 200)
    const t2 = window.setTimeout(onComplete, 900)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [count, onComplete])

  return (
    <div
      aria-hidden
      className={cn(
        'bg-surface fixed inset-0 z-[100] flex items-end justify-start transition-opacity duration-700',
        exiting ? 'opacity-0' : 'opacity-100',
      )}
    >
      <span className="font-heading text-primary p-6 text-7xl leading-none font-bold tabular-nums md:p-10 md:text-9xl">
        {count}
      </span>
    </div>
  )
}
