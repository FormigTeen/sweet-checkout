import { useEffect } from 'react'

/**
 * Enter avança para a próxima etapa quando a etapa está completa.
 * Ignora: modais abertos, teclas com modificador, foco em textarea/botão,
 * e Enter já tratado por um input (que chama preventDefault).
 */
export function useEnterAdvance(canAdvance: boolean, onAdvance: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.defaultPrevented || e.repeat) return
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return
      if (!canAdvance) return
      // não interfere com folhas/modais abertos
      if (document.querySelector('.sheet-backdrop, .bench-backdrop')) return
      const el = document.activeElement
      const tag = el?.tagName
      if (tag === 'TEXTAREA' || tag === 'BUTTON') return
      onAdvance()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [canAdvance, onAdvance])
}
