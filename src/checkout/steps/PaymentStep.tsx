import { useEffect, useState } from 'react'
import { useCheckout } from '../CheckoutContext'
import { useEnterAdvance } from '../useEnterAdvance'
import { BottomBar } from '../components/BottomBar'
import { Selectable } from '../components/Selectable'
import { Card, Pix, Plus } from '../components/Icons'
import { brl } from '../lib/format'
import { select } from '../lib/feedback'

type Phase = 'method' | 'cards' | 'newcard' | 'savedcvv' | 'installments'

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

export function PaymentStep({
  onNext,
}: {
  onNext: () => void
}) {
  const {
    setPayment,
    setSelectedCard,
    setInstallments,
    savedCards,
    hasLeCard,
    totals,
    registerBack,
  } = useCheckout()
  const [phase, setPhase] = useState<Phase>('method')
  // seleção: 'pix' | 'lecard' | 'new' | `saved:<id>`
  const [sel, setSel] = useState<string>('pix')
  const [cvv, setCvv] = useState('')
  const [selectedInstallments, setSelectedInstallments] = useState(1)
  const isPix = sel === 'pix'
  const savedCard = sel.startsWith('saved:')
    ? savedCards.find((c) => c.id === sel.slice('saved:'.length))
    : null
  const cvvReady = cvv.length >= 3

  function choose(value: string) {
    setSel(value)
    setCvv('')
    if (value === 'pix') {
      setPayment('pix')
      setSelectedCard(null)
      setInstallments(1)
      setSelectedInstallments(1)
    } else {
      setPayment(value === 'lecard' ? 'lecard' : 'card')
      setSelectedCard(value.startsWith('saved:') ? value.slice('saved:'.length) : null)
    }
  }

  function primary() {
    if (isPix) {
      select()
      onNext()
    } else if (sel === 'new') {
      select()
      setPhase('newcard')
    } else if (sel.startsWith('saved:')) {
      select()
      setPhase('savedcvv')
    } else {
      select()
      setPhase('installments')
    }
  }

  // voltar contextual (um único botão, no topo)
  useEffect(() => {
    registerBack(() => {
      if (phase === 'installments') {
        setPhase(sel === 'new' ? 'newcard' : sel.startsWith('saved:') ? 'savedcvv' : 'method')
        return true
      }
      if (phase === 'newcard' || phase === 'savedcvv' || phase === 'cards') {
        setPhase('method')
        return true
      }
      return false
    })
    return () => registerBack(null)
  }, [phase, sel, registerBack])

  // Enter avança conforme a fase
  useEnterAdvance(
    phase === 'method' || phase === 'newcard' || phase === 'savedcvv' || phase === 'installments',
    () => {
      if (phase === 'method') primary()
      else if (phase === 'newcard') {
        select()
        setPhase('installments')
      } else if (phase === 'savedcvv' && cvvReady) {
        select()
        setPhase('installments')
      } else if (phase === 'installments') {
        select()
        setInstallments(selectedInstallments)
        onNext()
      }
    },
  )

  // ---------- Codigo de seguranca do cartao salvo ----------
  if (phase === 'savedcvv') {
    return (
      <>
        <div className="step-scroll">
          <h1 className="step-title">Código de segurança</h1>
          <p className="step-sub">Digite o CVV do cartão para continuar.</p>

          <div className="saved-card-box">
            <span className="sel-icon">
              <Card width={22} height={22} />
            </span>
            <span className="saved-card-main">
              <b>{savedCard ? `${savedCard.brand} •••• ${savedCard.last4}` : 'Cartão salvo'}</b>
              <span>O código fica no verso do cartão.</span>
            </span>
          </div>

          <label className="field">
            <span className="field-label">CVV</span>
            <input
              className="field-input big cvv-input"
              inputMode="numeric"
              autoComplete="cc-csc"
              maxLength={4}
              autoFocus
              placeholder="000"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
            />
          </label>
        </div>
        <BottomBar
          label="Escolher parcelas"
          variant="green"
          disabled={!cvvReady}
          onNext={() => {
            select()
            setPhase('installments')
          }}
        />
      </>
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
      <div className="step-scroll step-pinned">
        <h1 className="step-title">Em quantas vezes?</h1>
        <p className="step-sub">Toque na parcela para revisar o pedido.</p>
        <div className="pay-list">
          {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
            <Selectable
              key={n}
              title={`${n}x de ${brl(Math.round(totals.itemsBase / n))}`}
              subtitle={
                n === 1 ? 'à vista' : `total ${brl(totals.itemsBase)} · sem juros`
              }
              indicator="arrow"
              selected={selectedInstallments === n}
              onSelect={() => {
                setSelectedInstallments(n)
                setInstallments(n)
                onNext()
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (phase === 'cards') {
    return (
      <div className="step-scroll">
        <h1 className="step-title">Cartões salvos</h1>
        <p className="step-sub">Escolha um cartão ou adicione outro.</p>
        <div className="pay-list">
          {savedCards.map((c) => (
            <Selectable
              key={c.id}
              icon={<Card width={22} height={22} />}
              title={`${c.brand} •••• ${c.last4}`}
              subtitle={`em até ${totals.installmentsMax}x sem juros`}
              indicator="arrow"
              selected={sel === `saved:${c.id}`}
              onSelect={() => {
                choose(`saved:${c.id}`)
                setPhase('savedcvv')
              }}
            />
          ))}
          <Selectable
            icon={<Plus width={22} height={22} />}
            title="Adicionar outro cartão"
            subtitle="Usar um cartão novo"
            indicator="arrow"
            selected={sel === 'new'}
            onSelect={() => {
              choose('new')
              setPhase('newcard')
            }}
          />
        </div>
      </div>
    )
  }

  // ---------- Método (cartões salvos inline) ----------
  const parcela = `em até ${totals.installmentsMax}x sem juros`
  const visibleCards = savedCards.slice(0, 3)
  const hiddenCards = savedCards.length - visibleCards.length
  return (
    <div className="step-scroll">
      <h1 className="step-title">Como quer pagar?</h1>
      <p className="step-sub">Toque em uma opção para continuar.</p>

      <div className="pay-list">
        <Selectable
          icon={<Pix width={22} height={22} />}
          title="PIX"
          subtitle="Aprovação na hora"
          badge="5% OFF"
          featured
          right={
            <span className="free">-{brl(Math.round(totals.itemsBase * 0.05))}</span>
          }
          indicator="arrow"
          selected={isPix}
          onSelect={() => {
            choose('pix')
            onNext()
          }}
        />

        {visibleCards.map((c) => (
          <Selectable
            key={c.id}
            icon={<Card width={22} height={22} />}
            title={`${c.brand} •••• ${c.last4}`}
            subtitle={parcela}
            indicator="arrow"
            selected={sel === `saved:${c.id}`}
            onSelect={() => {
              choose(`saved:${c.id}`)
              setPhase('savedcvv')
            }}
          />
        ))}

        {hiddenCards > 0 && (
          <Selectable
            icon={<Card width={22} height={22} />}
            title={`Ver outros ${hiddenCards} cartões`}
            subtitle="Selecionar outro cartão salvo"
            indicator="arrow"
            selected={false}
            onSelect={() => setPhase('cards')}
          />
        )}

        <Selectable
          icon={<Plus width={22} height={22} />}
          title="Usar outro cartão"
          subtitle="Adicionar cartão de crédito"
          indicator="arrow"
          selected={sel === 'new'}
          onSelect={() => {
            choose('new')
            setPhase('newcard')
          }}
        />

        {hasLeCard && (
          <Selectable
            icon={<Card width={22} height={22} />}
            title="Cartão Le biscuit"
            subtitle={parcela}
            badge="Sem juros"
            indicator="arrow"
            selected={sel === 'lecard'}
            onSelect={() => {
              choose('lecard')
              setPhase('installments')
            }}
          />
        )}
      </div>
    </div>
  )
}
