import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useCheckout } from '../CheckoutContext'
import { Check, Coin, Truck } from '../components/Icons'
import { BenchmarkDrawer } from '../components/BenchmarkDrawer'
import { brl } from '../lib/format'
import { reward } from '../lib/feedback'
import { celebrate } from '../lib/celebrate'
import type { Mode } from '../types'

export function SuccessStep({
  mode,
  auth,
  onRestart,
}: {
  mode: Mode
  auth: 0 | 1
  onRestart: () => void
}) {
  const { totals, taps, firstTapAt } = useCheckout()
  const fired = useRef(false)
  const elapsedMs = useRef(firstTapAt ? Date.now() - firstTapAt : null)
  const [benchOpen, setBenchOpen] = useState(false)

  useEffect(() => {
    if (!fired.current) {
      fired.current = true
      reward()
      celebrate()
    }
  }, [])

  return (
    <div className="step-scroll success">
      <motion.div
        className="done-check"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16 }}
      >
        <Check width={46} height={46} />
      </motion.div>

      <motion.h1
        className="done-title"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        Compra concluída!
      </motion.h1>
      <motion.p
        className="done-sub"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        Pedido <b>#LB-2026-4821</b> confirmado. Enviamos os detalhes por SMS.
      </motion.p>

      <motion.div
        className="done-cards"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="done-card">
          <span className="dc-label">Total pago</span>
          <span className="dc-value">{brl(totals.total)}</span>
        </div>
        <div className="done-card gold">
          <span className="dc-label">
            <Coin width={14} height={14} /> Cashback
          </span>
          <span className="dc-value">{brl(totals.cashback)}</span>
        </div>
        <div className="done-card">
          <span className="dc-label">
            <Truck width={14} height={14} /> Entrega
          </span>
          <span className="dc-value sm">Chega em breve</span>
        </div>
      </motion.div>

      <div className="done-actions">
        <button className="bench-open" onClick={() => setBenchOpen(true)}>
          Ver benchmark de toques ({taps})
        </button>
        <button className="restart" onClick={onRestart}>
          Refazer o teste
        </button>
      </div>

      <BenchmarkDrawer
        open={benchOpen}
        taps={taps}
        elapsedMs={elapsedMs.current}
        mode={mode}
        auth={auth}
        onClose={() => setBenchOpen(false)}
      />
    </div>
  )
}
