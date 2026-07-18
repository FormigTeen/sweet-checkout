import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCheckout } from '../CheckoutContext'
import { Check, X } from './Icons'
import { brl } from '../lib/format'
import { select, tick, warn } from '../lib/feedback'

export function CouponField() {
  const { coupon, applyCoupon, removeCoupon, totals, tap } = useCheckout()
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const entryRef = useRef<HTMLDivElement>(null)

  if (coupon) {
    return (
      <div className="coupon applied">
        <span className="coupon-check">
          <Check width={15} height={15} />
        </span>
        <span className="coupon-info">
          Cupom <b>{coupon.code}</b> · -{brl(totals.couponDiscount)}
        </span>
        <button
          className="coupon-remove"
          aria-label="Remover cupom"
          onClick={() => {
            tick()
            removeCoupon()
          }}
        >
          <X width={16} height={16} />
        </button>
      </div>
    )
  }

  if (!open) {
    return (
      <button
        className="coupon-toggle"
        onClick={() => {
          tick()
          setOpen(true)
        }}
      >
        Tem um cupom de desconto?
      </button>
    )
  }

  function apply() {
    tap()
    if (applyCoupon(code)) {
      select()
      setError(false)
    } else {
      warn()
      setError(true)
    }
  }

  function closeIfFocusLeft() {
    window.setTimeout(() => {
      if (entryRef.current?.contains(document.activeElement)) return
      setOpen(false)
      setCode('')
      setError(false)
    }, 0)
  }

  return (
    <div className="coupon-entry" ref={entryRef} onBlur={closeIfFocusLeft}>
      <div className={`coupon-inputwrap ${error ? 'error' : ''}`}>
        <input
          className="coupon-input"
          autoFocus
          placeholder="Digite o cupom"
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            setError(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              apply()
            }
          }}
        />
        <button
          className="coupon-apply"
          onPointerDown={(e) => e.preventDefault()}
          onClick={apply}
        >
          Aplicar
        </button>
      </div>
      <AnimatePresence>
        {error && (
          <motion.span
            className="coupon-error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            Cupom inválido. Tente LEBISCUIT10.
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
