"use client"

import { useEffect } from "react"

export function SmoothScroll() {
  useEffect(() => {
    const handleClick = (e: Event) => {
      const target = e.target as HTMLAnchorElement
      if (target.tagName === "A" && target.getAttribute("href")?.startsWith("#")) {
        e.preventDefault()
        const id = target.getAttribute("href")?.substring(1)
        const element = document.getElementById(id!)
        if (element) {
          const headerOffset = 80
          const elementPosition = element.offsetTop
          const offsetPosition = elementPosition - headerOffset

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          })

          // Dispatch custom event to trigger animations after navigation
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("navigate-to-section", { detail: { targetId: id } }))
          }, 500) // Wait for smooth scroll to complete
        }
      }
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  return null
}
