"use client"

import { useEffect, useRef, type ReactNode } from "react"

interface ScrollAnimationProps {
  children: ReactNode
  className?: string
  animation?: "fadeIn" | "slideUp" | "slideLeft" | "slideRight" | "scaleIn" | "slideDown"
  delay?: number
}

export function ScrollAnimation({ children, className = "", animation = "fadeIn", delay = 0 }: ScrollAnimationProps) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Reset animation state
    const resetAnimation = () => {
      element.classList.remove("animate-in")
      // Force reflow
      element.offsetHeight
    }

    // Trigger animation
    const triggerAnimation = () => {
      setTimeout(() => {
        element.classList.add("animate-in")
      }, delay)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Reset and trigger animation
            resetAnimation()
            triggerAnimation()
          } else {
            // Reset animation when element leaves viewport
            entry.target.classList.remove("animate-in")
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -20px 0px",
      },
    )

    observer.observe(element)

    // Listen for navigation events to re-trigger animations
    const handleNavigation = () => {
      setTimeout(() => {
        const rect = element.getBoundingClientRect()
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0

        if (isVisible) {
          resetAnimation()
          triggerAnimation()
        }
      }, 100) // Small delay to ensure smooth scrolling is complete
    }

    // Listen for hash changes (navigation)
    window.addEventListener("hashchange", handleNavigation)

    // Also listen for custom navigation events
    window.addEventListener("navigate-to-section", handleNavigation)

    return () => {
      observer.disconnect()
      window.removeEventListener("hashchange", handleNavigation)
      window.removeEventListener("navigate-to-section", handleNavigation)
    }
  }, [delay])

  return (
    <div ref={elementRef} className={`scroll-animation ${animation} ${className}`}>
      {children}
    </div>
  )
}
