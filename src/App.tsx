import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './App.css'
import { CheckoutProvider, type SimConfig } from './checkout/CheckoutContext'
import { useCheckoutParams } from './checkout/useCheckoutParams'
import { Header } from './checkout/components/Header'
import { DemoDock } from './checkout/components/DemoDock'
import { OrderAside } from './checkout/components/OrderAside'
import { PostPurchaseAside } from './checkout/components/PostPurchaseAside'
import { CartStep } from './checkout/steps/CartStep'
import { AuthStep } from './checkout/steps/AuthStep'
import { ProfileStep } from './checkout/steps/ProfileStep'
import { DeliveryStep } from './checkout/steps/DeliveryStep'
import { BenefitsStep } from './checkout/steps/BenefitsStep'
import { PaymentStep } from './checkout/steps/PaymentStep'
import { ReviewStep } from './checkout/steps/ReviewStep'
import { SuccessStep } from './checkout/steps/SuccessStep'
import { stepDone } from './checkout/lib/feedback'
import type { Mode, StepId } from './checkout/types'

const SIM_STORAGE_KEY = 'lb.sim.config'
const DEFAULT_CASHBACK_BALANCE = 2500
const DEFAULT_SIM: SimConfig = {
  products: 1,
  cards: 0,
  addresses: 0,
  profileComplete: true,
  giftCardsEnabled: false,
  hasCashbackBalance: true,
  cashbackBalance: DEFAULT_CASHBACK_BALANCE,
}

function loadSimConfig(): SimConfig {
  try {
    const raw = localStorage.getItem(SIM_STORAGE_KEY)
    if (!raw) return DEFAULT_SIM
    const parsed = JSON.parse(raw) as Partial<SimConfig> & { benefitsEnabled?: boolean }
    return {
      products: clamp(parsed.products ?? DEFAULT_SIM.products, 1, 4),
      cards: clamp(parsed.cards ?? DEFAULT_SIM.cards, 0, 7),
      addresses: clamp(parsed.addresses ?? DEFAULT_SIM.addresses, 0, 7),
      profileComplete: parsed.profileComplete ?? DEFAULT_SIM.profileComplete,
      giftCardsEnabled: parsed.giftCardsEnabled ?? parsed.benefitsEnabled ?? DEFAULT_SIM.giftCardsEnabled,
      hasCashbackBalance: parsed.hasCashbackBalance ?? DEFAULT_SIM.hasCashbackBalance,
      cashbackBalance: DEFAULT_CASHBACK_BALANCE,
    }
  } catch {
    return DEFAULT_SIM
  }
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

function saveSimConfig(sim: SimConfig) {
  try {
    localStorage.setItem(SIM_STORAGE_KEY, JSON.stringify(sim))
  } catch {
    // A simulacao continua funcional mesmo quando o storage do navegador falha.
  }
}

export default function App() {
  const [sim, setSim] = useState<SimConfig>(loadSimConfig)
  const benefitsStepEnabled = sim.giftCardsEnabled || sim.hasCashbackBalance
  const { params, sequence, index, next, back, go, setConfig } =
    useCheckoutParams(sim.profileComplete, benefitsStepEnabled)
  const [runId, setRunId] = useState(0)
  const [returnTo, setReturnTo] = useState<StepId | null>(null)
  const dirRef = useRef(1)
  const lastIndex = useRef(index)

  dirRef.current = index >= lastIndex.current ? 1 : -1
  lastIndex.current = index

  const { step, mode, auth } = params
  const isDone = step === 'done'

  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    if (q.get('fast') === '1' && step === 'auth' && mode === 'complete' && auth === 0) {
      setReturnTo(benefitsStepEnabled ? 'benefits' : 'payment')
    }
  }, [step, mode, auth, benefitsStepEnabled])

  // Navegação não-linear: avançar normalmente segue a sequência; mas se o
  // usuário entrou numa etapa para editar (a partir do resumo), o próximo
  // passo volta direto para o resumo/pagamento.
  function advance() {
    stepDone()
    if (returnTo) {
      const dest = returnTo
      setReturnTo(null)
      go(dest)
      return
    }
    next()
  }

  function editStep(s: StepId, returnStep: StepId = 'review') {
    setReturnTo(returnStep)
    go(s)
  }

  function goBack() {
    setReturnTo(null)
    back()
  }

  function changeConfig(patch: Partial<{ mode: Mode; auth: 0 | 1 }>) {
    setReturnTo(null)
    setConfig(patch)
    setRunId((r) => r + 1)
  }

  function restart() {
    setReturnTo(null)
    setConfig({})
    setRunId((r) => r + 1)
  }

  // Fast checkout: pagamento primeiro; deslogado identifica e volta ao pagamento.
  function startFast(a: 0 | 1) {
    const firstPaymentStep = benefitsStepEnabled ? 'benefits' : 'payment'
    setReturnTo(a === 0 ? firstPaymentStep : null)
    setConfig({ mode: 'complete', auth: a }, a === 0 ? 'auth' : firstPaymentStep)
    setRunId((r) => r + 1)
  }

  function changeSim(patch: Partial<SimConfig>) {
    setReturnTo(null)
    setSim((s) => {
      const nextSim = { ...s, ...patch }
      saveSimConfig(nextSim)
      return nextSim
    })
  }

  // Rótulo do CTA por etapa (não há indicador de etapas no topo).
  function ctaLabel(current: StepId) {
    if (returnTo) return 'Salvar e voltar ao resumo'
    const i = sequence.indexOf(current)
    const nxt = sequence[i + 1]
    switch (nxt) {
      case 'auth':
        // não anunciamos "login" — evita fricção antecipada
        return 'Continuar'
      case 'delivery':
        return 'Continuar para a entrega'
      case 'profile':
        return 'Completar dados'
      case 'payment':
        return 'Ir para o pagamento'
      case 'benefits':
        return 'Ver benefícios'
      case 'review':
        return 'Revisar pedido'
      default:
        return 'Continuar'
    }
  }

  const step0 = index === 0

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: 40 * d }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: -40 * d }),
  }

  return (
    <div className="app">
      <CheckoutProvider
        key={`${mode}-${auth}-${sim.products}-${sim.cards}-${sim.addresses}-${sim.profileComplete}-${sim.giftCardsEnabled}-${sim.hasCashbackBalance}-${runId}`}
        mode={mode}
        auth={auth}
        sim={{
          ...sim,
          cashbackBalance: sim.hasCashbackBalance ? DEFAULT_CASHBACK_BALANCE : 0,
        }}
      >
        <div className={`shell ${isDone ? 'is-done' : ''}`}>
          <div className="phone">
            <Header canGoBack={!step0 && !isDone} onBack={goBack} />

            <main className="stage">
              <AnimatePresence mode="wait" custom={dirRef.current}>
                <motion.div
                  key={step}
                  className="step"
                  custom={dirRef.current}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 340, damping: 34 }}
                >
                  {step === 'cart' && (
                    <CartStep onNext={advance} ctaLabel={ctaLabel('cart')} />
                  )}
                  {step === 'auth' && <AuthStep onNext={advance} />}
                  {step === 'profile' && <ProfileStep onNext={advance} />}
                  {step === 'delivery' && (
                    <DeliveryStep onNext={advance} />
                  )}
                  {step === 'benefits' && (
                    <BenefitsStep onNext={advance} />
                  )}
                  {step === 'payment' && (
                    <PaymentStep onNext={advance} />
                  )}
                  {step === 'review' && (
                    <ReviewStep
                      onNext={advance}
                      onEdit={editStep}
                      sequence={sequence}
                    />
                  )}
                  {step === 'done' && (
                    <SuccessStep mode={mode} auth={auth} onRestart={restart} />
                  )}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>

          {isDone ? <PostPurchaseAside /> : <OrderAside />}
        </div>
      </CheckoutProvider>

      {/* Fora do provider: não remonta (nem fecha) ao mudar a configuração.
          Aparece só na sacola. */}
      {step === 'cart' && (
        <DemoDock
          mode={mode}
          auth={auth}
          sim={sim}
          onChange={changeConfig}
          onSim={changeSim}
          onFast={startFast}
        />
      )}
    </div>
  )
}
