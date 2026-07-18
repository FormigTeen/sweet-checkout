import { motion } from 'framer-motion'
import { useState } from 'react'
import { useCheckout } from '../CheckoutContext'
import { BottomBar } from '../components/BottomBar'
import { Selectable } from '../components/Selectable'
import { Card, Coin } from '../components/Icons'
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
                <small>Saldo {brl(cashbackBalance)} para usar nesta compra</small>
              </span>
            </div>
            <label className="field cashback-use-field">
              <span className="field-label">Quanto deseja usar?</span>
              <input
                className="field-input big"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={cashbackInput}
                onChange={(e) => onCashback(e.target.value)}
              />
            </label>
            <div className="cashback-use-actions">
              <button
                onClick={() => onCashback(centsToInput(cashbackBalance))}
              >
                Usar tudo
              </button>
              <button
                onClick={() => onCashback('')}
                disabled={cashbackToUse === 0}
              >
                Limpar
              </button>
            </div>
          </section>
        )}
      </div>

      <BottomBar
        label="Continuar para pagamento"
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
