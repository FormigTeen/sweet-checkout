import { useCallback, useEffect, useState } from 'react'
import type { Mode, StepId } from './types'

export interface CheckoutParams {
  step: StepId
  mode: Mode
  auth: 0 | 1
}

const DEFAULTS: CheckoutParams = { step: 'cart', mode: 'simple', auth: 0 }

function readParams(): CheckoutParams {
  const q = new URLSearchParams(window.location.search)
  const step = (q.get('step') as StepId) || DEFAULTS.step
  const mode = (q.get('mode') as Mode) || DEFAULTS.mode
  const authRaw = q.get('auth')
  const auth = authRaw === '1' ? 1 : authRaw === '0' ? 0 : DEFAULTS.auth
  const valid: StepId[] = ['cart', 'auth', 'profile', 'delivery', 'payment', 'review', 'done']
  return {
    step: valid.includes(step) ? step : 'cart',
    mode: mode === 'complete' ? 'complete' : 'simple',
    auth,
  }
}

function writeUrl(p: CheckoutParams, replace = false) {
  const q = new URLSearchParams(window.location.search)
  q.set('step', p.step)
  q.set('mode', p.mode)
  q.set('auth', String(p.auth))
  const url = `${window.location.pathname}?${q.toString()}`
  if (replace) window.history.replaceState({ p }, '', url)
  else window.history.pushState({ p }, '', url)
}

/** Sequência de etapas conforme autenticação (auth=1 pula identificação). */
export function sequenceFor(auth: 0 | 1, profileComplete = true): StepId[] {
  const profile: StepId[] = profileComplete ? [] : ['profile']
  return auth === 1
    ? ['cart', ...profile, 'delivery', 'payment', 'review', 'done']
    : ['cart', 'auth', ...profile, 'delivery', 'payment', 'review', 'done']
}

export function useCheckoutParams(profileComplete = true) {
  const [params, setParams] = useState<CheckoutParams>(readParams)

  // Grava a URL inicial (replace) para deixar os params explícitos.
  useEffect(() => {
    writeUrl(readParams(), true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Recupera o estado ao usar voltar/avançar do navegador ou recarregar.
  useEffect(() => {
    const onPop = () => setParams(readParams())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const sequence = sequenceFor(params.auth, profileComplete)
  const index = Math.max(0, sequence.indexOf(params.step))

  const go = useCallback((step: StepId) => {
    setParams((prev) => {
      const nextP = { ...prev, step }
      writeUrl(nextP)
      return nextP
    })
  }, [])

  const next = useCallback(() => {
    setParams((prev) => {
      const seq = sequenceFor(prev.auth, profileComplete)
      const i = seq.indexOf(prev.step)
      const step = seq[Math.min(seq.length - 1, i + 1)]
      const nextP = { ...prev, step }
      writeUrl(nextP)
      return nextP
    })
  }, [profileComplete])

  const back = useCallback(() => {
    // usa o histórico do navegador para preservar a pilha
    window.history.back()
  }, [])

  const setConfig = useCallback(
    (
      patch: Partial<Pick<CheckoutParams, 'mode' | 'auth'>>,
      step: StepId = 'cart',
    ) => {
      setParams((prev) => {
        const nextP: CheckoutParams = { ...prev, ...patch, step }
        writeUrl(nextP)
        return nextP
      })
    },
    [],
  )

  return { params, sequence, index, go, next, back, setConfig }
}
