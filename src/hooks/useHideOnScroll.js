import { useEffect, useRef, useState } from 'react'

/**
 * useHideOnScroll — show on scroll-up / near top, hide on scroll-down.
 * Returns { visible, scrolled }.
 */
export default function useHideOnScroll({ threshold = 8, topBuffer = 96 } = {}) {
  const [visible, setVisible] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    lastY.current = window.scrollY || 0
    setScrolled(lastY.current > 10)
    let ticking = false

    const update = () => {
      ticking = false
      const y = window.scrollY || 0
      setScrolled(y > 10)
      const dy = y - lastY.current
      if (y < topBuffer) {
        setVisible(true)
      } else if (Math.abs(dy) > threshold) {
        setVisible(dy < 0)
      }
      lastY.current = y
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold, topBuffer])

  return { visible, scrolled }
}
