import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCheckout } from '../CheckoutContext'
import { useEnterAdvance } from '../useEnterAdvance'
import { PriceTag } from '../components/PriceTag'
import { BottomBar } from '../components/BottomBar'
import { CouponField } from '../components/CouponField'
import { WarrantyModal } from '../components/WarrantyModal'
import {
  Check,
  ChevronRight,
  Coin,
  Info,
  Minus,
  Pix,
  Plus,
  Shield,
} from '../components/Icons'
import { brl } from '../lib/format'
import { protect, tick } from '../lib/feedback'
import type { CartItem } from '../types'

function QtyStepper({ id, qty }: { id: string; qty: number }) {
  const { setQty, tap } = useCheckout()
  const step = (n: number) => {
    tap()
    tick()
    setQty(id, n)
  }
  return (
    <div className="qty">
      <button
        className="qty-btn"
        aria-label="Diminuir quantidade"
        disabled={qty <= 1}
        onClick={() => step(qty - 1)}
      >
        <Minus width={15} height={15} />
      </button>
      <span className="qty-val">{qty}</span>
      <button
        className="qty-btn"
        aria-label="Aumentar quantidade"
        onClick={() => step(qty + 1)}
      >
        <Plus width={15} height={15} />
      </button>
    </div>
  )
}

function WarrantyRow({
  item,
  onDetails,
}: {
  item: CartItem
  onDetails: () => void
}) {
  const { setWarranty, tap } = useCheckout()
  const [open, setOpen] = useState(false)
  if (!item.warranties?.length) return null

  const chosen = item.warranties.find((w) => w.id === item.warrantyId)
  const cheapest = Math.min(...item.warranties.map((w) => w.price))

  const choose = (id: string | null) => {
    tap()
    if (id) protect()
    else tick()
    setWarranty(item.id, id)
    setOpen(false)
  }

  // Selecionada (colapsada)
  if (chosen && !open) {
    return (
      <div className="warranty on">
        <span className="warranty-icon">
          <Shield width={17} height={17} />
        </span>
        <div className="warranty-body">
          <span className="warranty-title">Protegido por {chosen.months} meses</span>
          <span className="warranty-sub">Garantia estendida · +{brl(chosen.price)}</span>
        </div>
        <button className="warranty-change" onClick={() => { tick(); setOpen(true) }}>
          Alterar
        </button>
      </div>
    )
  }

  // Colapsada (chamada para abrir — estilo cupom)
  if (!open) {
    return (
      <button className="warranty-toggle" onClick={() => { tick(); setOpen(true) }}>
        <span className="warranty-icon">
          <Shield width={17} height={17} />
        </span>
        <span className="warranty-body">
          <span className="warranty-title">Proteja seu produto</span>
          <span className="warranty-sub">
            Garantia estendida a partir de {brl(cheapest)}
          </span>
        </span>
        <ChevronRight width={18} height={18} />
      </button>
    )
  }

  // Aberta — opções em linhas
  return (
    <motion.div
      className="warranty-open"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="warranty-head">
        <span className="warranty-title">
          <Shield width={15} height={15} /> Garantia estendida
        </span>
        <button className="warranty-details" onClick={onDetails}>
          <Info width={13} height={13} />
          Detalhes
        </button>
      </div>
      <div className="warranty-opts">
        {item.warranties.map((w) => {
          const on = item.warrantyId === w.id
          return (
            <button
              key={w.id}
              className={`warranty-opt ${on ? 'on' : ''}`}
              onClick={() => choose(w.id)}
            >
              <span className="wo-months">{w.months} meses</span>
              <span className="wo-price">+{brl(w.price)}</span>
              <span className="wo-check">
                {on && <Check width={14} height={14} />}
              </span>
            </button>
          )
        })}
        <button className="warranty-opt none" onClick={() => choose(null)}>
          Não quero garantia
        </button>
      </div>
    </motion.div>
  )
}

export function CartStep({
  onNext,
  ctaLabel,
}: {
  onNext: () => void
  ctaLabel: string
}) {
  const { items, totals } = useCheckout()
  const [detailsOpen, setDetailsOpen] = useState(false)
  useEnterAdvance(true, onNext)

  return (
    <>
      <div className="step-scroll">
        <h1 className="step-title">Sua sacola</h1>
        <p className="step-sub">
          {items.length} {items.length > 1 ? 'itens' : 'item'} · confira e siga
          para o pagamento
        </p>

        <div className="cart-list">
          {items.map((it, i) => {
            const protectedOn = !!it.warrantyId
            return (
              <motion.div
                key={it.id}
                className="cart-item"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.06,
                  type: 'spring',
                  stiffness: 260,
                  damping: 26,
                }}
              >
                <div className="cart-item-top">
                  <div className={`thumb-wrap ${protectedOn ? 'protected' : ''}`}>
                    <img className="thumb" src={it.image} alt="" />
                    <AnimatePresence>
                      {protectedOn && (
                        <>
                          <motion.span
                            className="shield-ring"
                            initial={{ scale: 0.4, opacity: 0.9 }}
                            animate={{ scale: 1.7, opacity: 0 }}
                            transition={{ duration: 0.6 }}
                          />
                          <motion.span
                            className="shield-badge"
                            initial={{ scale: 0, rotate: -30 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            transition={{ type: 'spring', stiffness: 480, damping: 16 }}
                          >
                            <Shield width={14} height={14} />
                          </motion.span>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="ci-info">
                    <span className="ci-brand">{it.brand}</span>
                    <span className="ci-name">{it.name}</span>
                    {it.cashbackPct ? (
                      <span className="cashback-tag">
                        <Coin width={13} height={13} />
                        {it.cashbackPct}% de volta
                      </span>
                    ) : null}
                    <div className="ci-price">
                      {it.listPrice > it.price && (
                        <span className="ci-was">{brl(it.listPrice)}</span>
                      )}
                      <PriceTag cents={it.price} size="sm" />
                    </div>
                  </div>
                  <QtyStepper id={it.id} qty={it.qty} />
                </div>
                <WarrantyRow item={it} onDetails={() => setDetailsOpen(true)} />
              </motion.div>
            )
          })}
        </div>

        <CouponField />

        <div className="pix-discount-card">
          <span className="pix-discount-icon">
            <Pix width={22} height={22} />
          </span>
          <div className="pix-discount-text">
            <span className="pix-discount-label">Desconto no PIX disponível</span>
            <span className="pix-discount-desc">
              Você confirma essa vantagem na etapa de pagamento.
            </span>
          </div>
          <span className="pix-discount-value">5% OFF</span>
        </div>

        {totals.cashback > 0 && (
          <div className="cashback-card">
            <span className="cashback-coin">
              <Coin width={22} height={22} />
            </span>
            <div className="cashback-text">
              <span className="cashback-label">Cashback nesta compra</span>
              <span className="cashback-desc">Volta como crédito na Le</span>
            </div>
            <PriceTag cents={totals.cashback} size="md" className="cashback-val" />
          </div>
        )}
      </div>

      <BottomBar
        label={ctaLabel}
        total={totals.itemsBase}
        totalHint="Subtotal"
        variant="green"
        onNext={onNext}
      />

      <WarrantyModal open={detailsOpen} onClose={() => setDetailsOpen(false)} />
    </>
  )
}
