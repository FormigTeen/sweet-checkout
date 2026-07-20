import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useCheckout } from '../CheckoutContext'
import { BottomBar } from '../components/BottomBar'
import { Selectable } from '../components/Selectable'
import { ArrowRight, Card, Coin } from '../components/Icons'
import { brl } from '../lib/format'
import { select, tick } from '../lib/feedback'

export function BenefitsStep({ onNext }: { onNext: () => void }) {
  const {
    giftCards,
    selectedGiftCardIds,
    toggleGiftCard,
    cashbackBalance,
    cashbackToUse,
    setCashbackToUse,
    totals,
  } = useCheckout()
  const [cashbackInput, setCashbackInput] = useState(
    cashbackToUse > 0 ? centsToInput(cashbackToUse) : '',
  )
  const [cashbackEditing, setCashbackEditing] = useState(false)
  const cashbackInputRef = useRef<HTMLInputElement>(null)
  const cashbackEntryRef = useRef<HTMLDivElement>(null)

  const hasCashbackBalance = cashbackBalance > 0
  const hasGiftCards = giftCards.length > 0
  const hasApplied = selectedGiftCardIds.length > 0 || cashbackToUse > 0
  const appliedValue = totals.giftCardDiscount + totals.cashbackDiscount

  function toggleGift(id: string) {
    tick()
    toggleGiftCard(id)
  }

  function onCashback(v: string) {
    const cents = inputToCents(v)
    const next = Math.min(cents, cashbackBalance)
    setCashbackInput(centsToInput(next))
    setCashbackToUse(next)
    tick()
  }

  function focusCashbackInput() {
    setCashbackEditing(true)
  }

  useEffect(() => {
    if (!cashbackEditing) return
    const id = requestAnimationFrame(() => cashbackInputRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [cashbackEditing])

  function closeCashbackIfFocusLeft() {
    window.setTimeout(() => {
      if (cashbackEntryRef.current?.contains(document.activeElement)) return
      setCashbackEditing(false)
    }, 0)
  }

  function confirmCashback() {
    select()
    onNext()
  }

  return (
    <>
      <div className="step-scroll benefits-step">
        <h1 className="step-title">Benefícios disponíveis</h1>
        <p className="step-sub">
          Escolha se quer usar saldo antes de pagar.
        </p>

        <motion.div
          className={`benefit-reward ${hasApplied ? 'on' : ''}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="benefit-reward-icon">
            <Coin width={22} height={22} />
          </span>
          <span>
            <b>
              {hasApplied
                ? `${brl(appliedValue)} aplicado`
                : hasGiftCards
                  ? 'Você tem benefícios para usar'
                  : 'Você tem cashback disponível'}
            </b>
            <small>
              {hasApplied
                ? 'O total do pedido já foi atualizado.'
                : 'Aplicar agora reduz o valor antes do pagamento.'}
            </small>
          </span>
        </motion.div>

        {hasGiftCards && (
          <div className="pay-list">
            {giftCards.map((gift) => (
              <Selectable
                key={gift.id}
                icon={<Card width={22} height={22} />}
                title={gift.label}
                subtitle={`${gift.code} · saldo ${brl(gift.balance)}`}
                right={<span className="free">-{brl(gift.balance)}</span>}
                selected={selectedGiftCardIds.includes(gift.id)}
                indicator="check"
                onSelect={() => toggleGift(gift.id)}
              />
            ))}
          </div>
        )}

        {hasCashbackBalance && (
          <section className="cashback-use-card">
            <div className="cashback-use-head">
              <span className="benefit-reward-icon">
                <Coin width={22} height={22} />
              </span>
              <span>
                <b>Cashback disponível</b>
                <small>Use seu saldo para reduzir o valor agora.</small>
              </span>
            </div>
            <div
              className={`cashback-balance-box ${cashbackToUse > 0 ? 'on' : ''}`}
            >
              <span>
                <small>Saldo para esta compra</small>
                <b>{brl(cashbackBalance)}</b>
              </span>
            </div>
            <div
              className="cashback-entry"
              ref={cashbackEntryRef}
              onBlur={closeCashbackIfFocusLeft}
            >
              <AnimatePresence initial={false}>
                {cashbackEditing ? (
                  <motion.div
                    key="cashback-input"
                    className="cashback-inputwrap"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                  >
                    <input
                      ref={cashbackInputRef}
                      className="cashback-input"
                      inputMode="numeric"
                      placeholder="R$ 0,00"
                      value={cashbackInput}
                      onChange={(e) => onCashback(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter') return
                        e.preventDefault()
                        confirmCashback()
                      }}
                    />
                    <button
                      className="cashback-confirm"
                      aria-label="Continuar com cashback"
                      onPointerDown={(e) => e.preventDefault()}
                      onClick={confirmCashback}
                    >
                      <ArrowRight width={21} height={21} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="cashback-summary"
                    type="button"
                    className={`cashback-summary ${cashbackToUse > 0 ? 'on' : ''}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    onClick={() => {
                      tick()
                      focusCashbackInput()
                    }}
                  >
                    <span>
                      <small>Cashback no pedido</small>
                      <b>{cashbackToUse > 0 ? brl(cashbackToUse) : 'Toque para usar'}</b>
                    </span>
                    <strong>{cashbackToUse > 0 ? 'Editar' : 'Aplicar'}</strong>
                  </motion.button>
                )}
              </AnimatePresence>
              <div className="cashback-use-actions">
                <button
                  onClick={() => {
                    onCashback(centsToInput(cashbackBalance))
                    focusCashbackInput()
                  }}
                >
                  Usar tudo
                </button>
                <button
                  onClick={() => {
                    onCashback('')
                    focusCashbackInput()
                  }}
                  disabled={cashbackToUse === 0}
                >
                  Limpar
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      <BottomBar
        label="Continuar"
        variant="green"
        total={totals.total}
        totalHint={hasApplied ? 'Total com benefícios' : 'Total do pedido'}
        onNext={() => {
          select()
          onNext()
        }}
      />
    </>
  )
}

function inputToCents(v: string) {
  return Number(v.replace(/\D/g, '') || 0)
}

function centsToInput(cents: number) {
  if (!cents) return ''
  return brl(cents)
}
