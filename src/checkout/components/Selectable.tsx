import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Check, ChevronRight } from './Icons'
import { select as selectSound } from '../lib/feedback'
import { useCheckout } from '../CheckoutContext'

export function Selectable({
  icon,
  title,
  subtitle,
  right,
  badge,
  featured = false,
  indicator = 'check',
  selected,
  onSelect,
}: {
  icon?: ReactNode
  title: string
  subtitle?: ReactNode
  right?: ReactNode
  badge?: string
  featured?: boolean
  indicator?: 'check' | 'arrow'
  selected: boolean
  onSelect: () => void
}) {
  const { tap } = useCheckout()
  const isSelection = indicator === 'check'
  return (
    <motion.button
      type="button"
      className={`selectable ${featured ? 'featured' : ''} ${
        isSelection && selected ? 'selected' : ''
      }`}
      whileTap={{ scale: 0.975 }}
      onClick={() => {
        tap()
        selectSound()
        onSelect()
      }}
      aria-pressed={isSelection ? selected : undefined}
    >
      {icon && <span className="sel-icon">{icon}</span>}
      <span className="sel-body">
        <span className="sel-title">
          {title}
          {badge && <span className="sel-badge">{badge}</span>}
        </span>
        {subtitle && <span className="sel-sub">{subtitle}</span>}
      </span>
      {right && <span className="sel-right">{right}</span>}
      <span className={`sel-check ${indicator === 'arrow' ? 'sel-next' : ''}`} aria-hidden>
        {indicator === 'arrow' ? (
          <ChevronRight width={17} height={17} />
        ) : (
          selected && (
          <motion.span
            className="sel-check-on"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 520, damping: 20 }}
          >
            <Check width={15} height={15} />
          </motion.span>
          )
        )}
      </span>
    </motion.button>
  )
}
