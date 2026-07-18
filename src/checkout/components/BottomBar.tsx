import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { PriceTag } from './PriceTag'
import { ArrowRight } from './Icons'
import { useCheckout } from '../CheckoutContext'

export function BottomBar({
  label,
  total,
  totalHint,
  disabled,
  variant = 'green',
  arrow = true,
  sticky = false,
  onNext,
}: {
  label: string
  total?: number
  totalHint?: ReactNode
  disabled?: boolean
  variant?: 'green' | 'red'
  arrow?: boolean
  sticky?: boolean
  onNext: () => void
}) {
  const { tap } = useCheckout()
  return (
    <div className={`bottombar ${sticky ? 'bottombar-sticky' : ''}`}>
      {total != null && (
        <div className="bb-total">
          <span className="bb-total-label">{totalHint ?? 'Total'}</span>
          <PriceTag cents={total} size="md" />
        </div>
      )}
      <motion.button
        type="button"
        className={`cta cta-${variant} ${total != null ? 'has-total' : 'full'}`}
        whileTap={disabled ? undefined : { scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 600, damping: 20 }}
        disabled={disabled}
        onPointerDown={(e) => e.preventDefault()}
        onClick={() => {
          if (disabled) return
          tap()
          onNext()
        }}
      >
        <span className="cta-label">{label}</span>
        {arrow && !disabled && (
          <span className="cta-arrow" aria-hidden>
            <ArrowRight width={20} height={20} />
          </span>
        )}
      </motion.button>
    </div>
  )
}
