import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useCheckout } from '../CheckoutContext'
import { BottomBar } from '../components/BottomBar'
import { PriceTag } from '../components/PriceTag'
import { QrCode } from '../components/QrCode'
import { Card, Coin, Copy, Pencil, Pix, Truck } from '../components/Icons'
import { pickupStores, shippingOptions } from '../lib/mockData'
import { brl } from '../lib/format'
import { select, tick } from '../lib/feedback'
import type { StepId } from '../types'

type PayPhase = 'review' | 'pix' | 'processing'
const PAYMENT_CONFIRM_DELAY_MS = 4000

function ReviewEdit({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button className="review-edit" onClick={onClick}>
      <Pencil width={14} height={14} />
      {label}
    </button>
  )
}

function ReviewSection({
  icon,
  title,
  action,
  children,
}: {
  icon: React.ReactNode
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="review-section">
      <div className="review-section-head">
        <span className="review-section-icon">{icon}</span>
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function ReviewStep({
  onNext,
  onEdit,
  sequence,
}: {
  onNext: () => void
  onEdit: (s: StepId) => void
  sequence: StepId[]
}) {
  const {
    items,
    address,
    shippingId,
    pickupId,
    payment,
    selectedCardId,
    installments,
    savedCards,
    selectedGiftCardIds,
    giftCards,
    cashbackToUse,
    totals,
    coupon,
    registerBack,
  } = useCheckout()
  const [phase, setPhase] = useState<PayPhase>('review')

  const ship = shippingOptions.find((o) => o.id === shippingId)
  const pickup = pickupStores.find((s) => s.id === pickupId)
  const card = selectedCardId
    ? savedCards.find((c) => c.id === selectedCardId)
    : null
  const selectedGifts = giftCards.filter((g) => selectedGiftCardIds.includes(g.id))
  void sequence

  const paymentLabel = useMemo(() => {
    if (payment === 'pix') return 'PIX com 5% de desconto'
    if (payment === 'lecard') return `Cartão Le biscuit em ${installments}x`
    const cardName = card ? `${card.brand} •••• ${card.last4}` : 'Novo cartão'
    return installments === 1
      ? `${cardName} à vista`
      : `${cardName} em ${installments}x sem juros`
  }, [payment, installments, card])

  const paymentDetail = useMemo(() => {
    if (payment === 'pix') return null
    if (payment === 'lecard') return `${installments}x de ${brl(totals.installmentValue)}`
    return card
      ? `Final ${card.last4} · ${installments}x de ${brl(totals.installmentValue)}`
      : `${installments}x de ${brl(totals.installmentValue)}`
  }, [payment, installments, totals.installmentValue, card])

  const payLabel = payment === 'pix' ? 'Pagar com PIX' : 'Confirmar pagamento'
  const payHint =
    payment === 'pix'
      ? 'Total no PIX'
      : installments === 1
        ? 'Total'
        : `${installments}x de ${brl(totals.installmentValue)}`

  const goEdit = (s: StepId) => () => {
    tick()
    onEdit(s)
  }

  function pay() {
    select()
    setPhase(payment === 'pix' ? 'pix' : 'processing')
  }

  useEffect(() => {
    registerBack(() => {
      if (phase === 'pix') {
        setPhase('review')
        return true
      }
      if (phase === 'processing') return true
      return false
    })
    return () => registerBack(null)
  }, [phase, registerBack])

  useEffect(() => {
    if (phase !== 'processing') return
    const t = setTimeout(onNext, PAYMENT_CONFIRM_DELAY_MS)
    return () => clearTimeout(t)
  }, [phase, onNext])

  useEffect(() => {
    if (phase !== 'pix') return
    const t = setTimeout(onNext, 3400)
    return () => clearTimeout(t)
  }, [phase, onNext])

  if (phase === 'pix') {
    return (
      <div className="step-scroll pix-wait">
        <h1 className="step-title">Pague com PIX</h1>
        <p className="step-sub">Escaneie o código no app do seu banco.</p>
        <motion.div
          className="qr-frame"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          <QrCode data={`lebiscuit-${totals.total}`} />
        </motion.div>
        <div className="pix-amount">
          <span>Valor</span>
          <b className="pix-value">{brl(totals.total)}</b>
        </div>
        <button className="pix-copy" onClick={() => tick()}>
          <Copy width={16} height={16} />
          Copiar código PIX
        </button>
        <div className="pix-status">
          <span className="spinner" />
          Aguardando pagamento...
        </div>
      </div>
    )
  }

  if (phase === 'processing') {
    return (
      <motion.div
        className="payment-confirm-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="payment-confirm-mark"
          initial={{ scale: 0.78, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        >
          <span />
          <b />
        </motion.div>
        <motion.h1
          className="payment-confirm-title"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          Confirmando pagamento
        </motion.h1>
        <motion.p
          className="payment-confirm-sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          Estamos reservando seus produtos e finalizando a compra.
        </motion.p>
        <div className="payment-confirm-bar" aria-hidden>
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: PAYMENT_CONFIRM_DELAY_MS / 1000,
              ease: 'easeOut',
            }}
          />
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <div className="step-scroll review-scroll">
        <h1 className="step-title">Revise seu pedido</h1>
        <p className="step-sub">Confira as informações antes de pagar.</p>

        <div className="review-stack">
          <ReviewSection
            icon={<Coin width={17} height={17} />}
            title="Itens"
            action={<ReviewEdit label="Editar" onClick={goEdit('cart')} />}
          >
            <div className="review-items">
              {items.map((item) => (
                <div className="review-item" key={item.id}>
                  <span className="review-item-qty">{item.qty}x</span>
                  <span className="review-item-name">{item.name}</span>
                  <b>{brl(item.price * item.qty)}</b>
                </div>
              ))}
            </div>
          </ReviewSection>

          <ReviewSection
            icon={<Truck width={17} height={17} />}
            title="Entrega"
            action={<ReviewEdit label="Editar" onClick={goEdit('delivery')} />}
          >
            {shippingId === 'pickup' ? (
              <>
                <p className="review-main-text">
                  {address?.street
                    ? `${address.street}, ${address.number}`
                    : 'Endereço de referência não informado'}
                </p>
                <p className="review-sub-text">
                  {address?.complement && `${address.complement} · `}
                  {address?.district && `${address.district} · `}
                  {address?.city}/{address?.state}
                </p>
                <div className="review-store-box">
                  <span>Retirar em</span>
                  <b>{pickup?.name ?? 'Loja de retirada'}</b>
                  <small>
                    {pickup
                      ? `${pickup.neighborhood} · ${pickup.city} · ${pickup.distanceKm} km`
                      : 'Escolha uma loja para retirada'}
                  </small>
                  {pickup && <small>{pickup.ready}</small>}
                </div>
              </>
            ) : (
              <>
                <p className="review-main-text">
                  {address?.street
                    ? `${address.street}, ${address.number}`
                    : 'Endereço não informado'}
                </p>
                <p className="review-sub-text">
                  {address?.complement && `${address.complement} · `}
                  {address?.recipient && `Recebe: ${address.recipient} · `}
                  {address?.district && `${address.district} · `}
                  {address?.city}/{address?.state}
                </p>
              </>
            )}
            <div className="review-pill-row">
              <span>{ship?.label ?? 'Frete'}</span>
              <b>{totals.shippingCost === 0 ? 'Grátis' : brl(totals.shippingCost)}</b>
            </div>
          </ReviewSection>

          <ReviewSection
            icon={payment === 'pix' ? <Pix width={17} height={17} /> : <Card width={17} height={17} />}
            title="Pagamento"
            action={<ReviewEdit label="Editar" onClick={goEdit('payment')} />}
          >
            <p className="review-main-text">{paymentLabel}</p>
            {paymentDetail && <p className="review-sub-text">{paymentDetail}</p>}
          </ReviewSection>

          <ReviewSection
            icon={<Coin width={17} height={17} />}
            title="Promoção aplicada"
          >
            <div className="review-reward">
              <span className="review-reward-kicker">Recompensa do pedido</span>
              <b>Você manteve o melhor preço desta compra</b>
              <p>
                Frete grátis garantido e desconto PIX reservado até a confirmação do pagamento.
              </p>
            </div>
          </ReviewSection>

          <section className="review-totals">
            <div className="sum-row">
              <span>Produtos</span>
              <span>{brl(totals.productsTotal)}</span>
            </div>
            {totals.warrantyTotal > 0 && (
              <div className="sum-row">
                <span>Garantia</span>
                <span>{brl(totals.warrantyTotal)}</span>
              </div>
            )}
            {coupon && (
              <div className="sum-row save">
                <span>Cupom {coupon.code}</span>
                <span>-{brl(totals.couponDiscount)}</span>
              </div>
            )}
            {selectedGifts.length > 0 && totals.giftCardDiscount > 0 && (
              <div className="sum-row save">
                <span>
                  {selectedGifts.length === 1
                    ? selectedGifts[0].label
                    : `${selectedGifts.length} gift cards`}
                </span>
                <span>-{brl(totals.giftCardDiscount)}</span>
              </div>
            )}
            {cashbackToUse > 0 && totals.cashbackDiscount > 0 && (
              <div className="sum-row save">
                <span>Cashback usado</span>
                <span>-{brl(totals.cashbackDiscount)}</span>
              </div>
            )}
            {totals.pixSavings > 0 && (
              <div className="sum-row save">
                <span>Desconto PIX</span>
                <span>-{brl(totals.pixSavings)}</span>
              </div>
            )}
            <div className="sum-row">
              <span>Frete</span>
              <span>{totals.shippingCost === 0 ? 'Grátis' : brl(totals.shippingCost)}</span>
            </div>
            <div className="sum-row cash">
              <span>
                <Coin width={15} height={15} /> Cashback
              </span>
              <span>+{brl(totals.cashback)}</span>
            </div>
            <div className="review-total-row">
              <span>Total</span>
              <PriceTag cents={totals.total} size="md" />
            </div>
          </section>
        </div>
      </div>

      <BottomBar
        label={payLabel}
        variant="green"
        arrow={false}
        sticky
        total={totals.total}
        totalHint={payHint}
        onNext={pay}
      />
    </>
  )
}
