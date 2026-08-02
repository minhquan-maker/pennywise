import { useEffect, useRef } from 'react'

interface ScrollRevealOptions {
  threshold?: number
  rootMargin?: string
  stagger?: number
}

export function useScrollReveal({
  threshold = 0.15,
  rootMargin = '0px 0px -60px 0px',
  stagger = 80,
}: ScrollRevealOptions = {}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const children = Array.from(container.children) as HTMLElement[]
    children.forEach((child, i) => {
      child.classList.add('scroll-hidden')
      child.style.transitionDelay = `${i * stagger}ms`
    })

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          children.forEach((child) => {
            child.classList.replace('scroll-hidden', 'scroll-visible')
          })
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [rootMargin, stagger, threshold])

  return ref
}
