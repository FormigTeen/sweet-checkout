import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useCheckout } from '../CheckoutContext'
import { useEnterAdvance } from '../useEnterAdvance'
import { BottomBar } from '../components/BottomBar'
import { Selectable } from '../components/Selectable'
import { QrCode } from '../components/QrCode'
import { Card, Coin, Copy, Pencil, Pix, Plus } from '../components/Icons'
import { shippingOptions } from '../lib/mockData'
import { brl } from '../lib/format'
import { select, tick } from '../lib/feedback'
import type { StepId } from '../types'

type Phase = 'method' | 'newcard' | 'installments' | 'pix' | 'processing'

function NewCardForm() {
  return (
    <div className="pay-list">
      <input
        className="field-input"
        placeholder="Número do cartão"
        inputMode="numeric"
        autoFocus
      />
      <input className="field-input" placeholder="Nome impresso no cartão" />
      <div className="row-2">
        <input className="field-input" placeholder="Validade" inputMode="numeric" />
        <input className="field-input" placeholder="CVV" inputMode="numeric" />
      </div>
    </div>
  )
}

function ReviewRow({
  label,
  value,
  onEdit,
}: {
  label: string
  value: React.ReactNode
  onEdit: () => void
}) {
  return (
    <div className="review-row">
      <div className="review-main">
        <span className="review-label">{label}</span>
        <span className="review-value">{value}</span>
      </div>
      <button className="review-edit" onClick={onEdit}>
        <Pencil width={14} height={14} />
        Editar
      </button>
    </div>
  )
}

export function PaymentStep({
  onNext,
  onEdit,
  sequence,
}: {
  onNext: () => void
  onEdit: (s: StepId) => void
  sequence: StepId[]
}) {
  const {
    setPayment,
    savedCards,
    hasLeCard,
    totals,
    coupon,
    items,
    address,
    contact,
    shippingId,
    tap,
    registerBack,
  } = useCheckout()
  const [phase, setPhase] = useState<Phase>('method')
  // seleção: 'pix' | 'lecard' | 'new' | `saved:<id>`
  const [sel, setSel] = useState<string>('pix')
  const [installments, setInstallments] = useState(1)

  const ship = shippingOptions.find((o) => o.id === shippingId)
  const canEditContact = sequence.includes('auth') && !!contact?.email
  const isPix = sel === 'pix'
  const per = Math.round(totals.itemsBase / installments)

  function choose(value: string) {
    setSel(value)
    setPayment(value === 'pix' ? 'pix' : value === 'lecard' ? 'lecard' : 'card')
  }

  const goEdit = (s: StepId) => () => {
    tap()
    tick()
    onEdit(s)
  }

  function pay() {
    select()
    setPhase(isPix ? 'pix' : 'processing')
  }

  // CTA da tela de método conforme a seleção
  function primary() {
    if (isPix) {
      pay()
    } else if (sel === 'new') {
      select()
      setPhase('newcard')
    } else {
      select()
      setPhase('installments')
    }
  }

  useEffect(() => {
    if (phase !== 'pix' && phase !== 'processing') return
    const delay = phase === 'pix' ? 3400 : 1700
    const t = setTimeout(onNext, delay)
    return () => clearTimeout(t)
  }, [phase, onNext])

  // voltar contextual (um único botão, no topo)
  useEffect(() => {
    registerBack(() => {
      if (phase === 'installments') {
        setPhase(sel === 'new' ? 'newcard' : 'method')
        return true
      }
      if (phase === 'newcard' || phase === 'pix') {
        setPhase('method')
        return true
      }
      if (phase === 'processing') return true
      return false
    })
    return () => registerBack(null)
  }, [phase, sel, registerBack])

  // Enter avança conforme a fase
  useEnterAdvance(
    phase === 'method' || phase === 'newcard' || phase === 'installments',
    () => {
      if (phase === 'method') primary()
      else if (phase === 'newcard') {
        select()
        setPhase('installments')
      } else if (phase === 'installments') pay()
    },
  )

  // ---------- PIX ----------
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
          Aguardando pagamento…
        </div>
      </div>
    )
  }

  // ---------- Processando ----------
  if (phase === 'processing') {
    return (
      <div className="step-scroll pix-wait">
        <div className="spinner big" />
        <h1 className="step-title" style={{ marginTop: 20 }}>
          Confirmando pagamento…
        </h1>
        <p className="step-sub">Isso leva só um instante.</p>
      </div>
    )
  }

  // ---------- Novo cartão ----------
  if (phase === 'newcard') {
    return (
      <>
        <div className="step-scroll">
          <h1 className="step-title">Novo cartão</h1>
          <p className="step-sub">Preencha os dados do cartão de crédito.</p>
          <NewCardForm />
        </div>
        <BottomBar
          label="Escolher parcelas"
          variant="green"
          onNext={() => {
            select()
            setPhase('installments')
          }}
        />
      </>
    )
  }

  // ---------- Parcelas ----------
  if (phase === 'installments') {
    const max = totals.installmentsMax
    return (
      <>
        <div className="step-scroll step-pinned">
          <h1 className="step-title">Em quantas vezes?</h1>
          <p className="step-sub">Todas as parcelas são sem juros.</p>
          <div className="pay-list">
            {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
              <Selectable
                key={n}
                title={`${n}x de ${brl(Math.round(totals.itemsBase / n))}`}
                subtitle={
                  n === 1 ? 'à vista' : `total ${brl(totals.itemsBase)} · sem juros`
                }
                selected={installments === n}
                onSelect={() => setInstallments(n)}
              />
            ))}
          </div>
        </div>
        <BottomBar
          label={installments === 1 ? 'Pagar à vista' : `Pagar ${installments}x de ${brl(per)}`}
          variant="green"
          arrow={false}
          total={totals.total}
          totalHint={installments === 1 ? 'à vista' : `${installments}x sem juros`}
          onNext={pay}
        />
      </>
    )
  }

  // ---------- Método (cartões salvos inline) ----------
  const parcela = `em até ${totals.installmentsMax}x sem juros`
  return (
    <>
      <div className="step-scroll">
        <h1 className="step-title">Como quer pagar?</h1>
        <p className="step-sub">O PIX tem 5% de desconto na hora.</p>

        <div className="pay-list">
          <Selectable
            icon={<Pix width={22} height={22} />}
            title="PIX"
            subtitle="Aprovação na hora"
            badge="5% OFF"
            right={
              <span className="free">-{brl(Math.round(totals.itemsBase * 0.05))}</span>
            }
            selected={isPix}
            onSelect={() => choose('pix')}
          />

          {savedCards.map((c) => (
            <Selectable
              key={c.id}
              icon={<Card width={22} height={22} />}
              title={`${c.brand} •••• ${c.last4}`}
              subtitle={parcela}
              selected={sel === `saved:${c.id}`}
              onSelect={() => choose(`saved:${c.id}`)}
            />
          ))}

          <Selectable
            icon={<Plus width={22} height={22} />}
            title="Usar outro cartão"
            subtitle="Adicionar cartão de crédito"
            selected={sel === 'new'}
            onSelect={() => choose('new')}
          />

          {hasLeCard && (
            <Selectable
              icon={<Card width={22} height={22} />}
              title="Cartão Le biscuit"
              subtitle={parcela}
              badge="Sem juros"
              selected={sel === 'lecard'}
              onSelect={() => choose('lecard')}
            />
          )}
        </div>

        <div className="review">
          <span className="group-label">Revise seu pedido</span>
          <ReviewRow
            label="Itens"
            value={`${items.length} ${items.length > 1 ? 'itens' : 'item'} · ${brl(
              totals.productsTotal,
            )}`}
            onEdit={goEdit('cart')}
          />
          {canEditContact && (
            <ReviewRow label="Contato" value={contact!.email} onEdit={goEdit('auth')} />
          )}
          <ReviewRow
            label="Entrega"
            value={
              address?.street
                ? `${address.street}, ${address.number} · ${ship?.label ?? ''}`
                : ship?.label ?? '—'
            }
            onEdit={goEdit('delivery')}
          />
        </div>

        <div className="pay-summary">
          {coupon && (
            <div className="sum-row save">
              <span>Cupom {coupon.code}</span>
              <span>-{brl(totals.couponDiscount)}</span>
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
        </div>
      </div>

      <BottomBar
        label={isPix ? 'Pagar com PIX' : sel === 'new' ? 'Adicionar cartão' : 'Escolher parcelas'}
        variant="green"
        arrow={!isPix}
        total={totals.total}
        totalHint={isPix ? 'Total no PIX' : 'Total'}
        onNext={primary}
      />
    </>
  )
}
