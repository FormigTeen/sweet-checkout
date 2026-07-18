import confetti from 'canvas-confetti'

// Recompensa visual da conclusão — confete nas cores da marca.
export function celebrate() {
  const reduce = window.matchMedia?.(
    '(prefers-reduced-motion: reduce)',
  ).matches
  if (reduce) return

  const colors = ['#ed1b2f', '#27ae60', '#ffffff', '#e0a325']
  const fire = (ratio: number, opts: confetti.Options) =>
    confetti({
      origin: { y: 0.62 },
      colors,
      disableForReducedMotion: true,
      particleCount: Math.floor(180 * ratio),
      ...opts,
    })

  fire(0.25, { spread: 26, startVelocity: 55 })
  fire(0.2, { spread: 60 })
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.9 })
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
  fire(0.1, { spread: 120, startVelocity: 45 })
}
