import { motion } from 'framer-motion'
import { Check } from './Icons'
import type { StepId } from '../types'

const LABELS: Record<StepId, string> = {
  cart: 'Sacola',
  auth: 'Você',
  delivery: 'Entrega',
  payment: 'Pagamento',
  done: 'Pronto',
}

export function Stepper({
  sequence,
  index,
}: {
  sequence: StepId[]
  index: number
}) {
  // não mostra a etapa final ("done") na trilha
  const steps = sequence.filter((s) => s !== 'done')
  const active = Math.min(index, steps.length - 1)
  const progress = steps.length > 1 ? active / (steps.length - 1) : 0

  return (
    <nav className="stepper" aria-label="Progresso do checkout">
      <div className="stepper-track">
        <motion.div
          className="stepper-fill"
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ type: 'spring', stiffness: 220, damping: 30 }}
        />
        {steps.map((s, i) => {
          const done = i < active
          const current = i === active
          return (
            <div
              key={s}
              className={`step-dot ${done ? 'done' : ''} ${
                current ? 'current' : ''
              }`}
            >
              <div className="dot">
                {done ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                  >
                    <Check width={13} height={13} />
                  </motion.span>
                ) : (
                  <span className="dot-num">{i + 1}</span>
                )}
              </div>
              <span className="step-label">{LABELS[s]}</span>
            </div>
          )
        })}
      </div>
    </nav>
  )
}
