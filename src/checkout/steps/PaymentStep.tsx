import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCheckout } from '../CheckoutContext'
import { useEnterAdvance } from '../useEnterAdvance'
import { BottomBar } from '../components/BottomBar'
import { Selectable } from '../components/Selectable'
import { ArrowRight, Card, Pix, Plus, Return } from '../components/Icons'
import { brl } from '../lib/format'
import { select } from '../lib/feedback'

type Phase = 'method' | 'cards' | 'newcard' | 'savedcvv' | 'installments'
type NewCardPhase = 'number' | 'name' | 'expiry' | 'cvc' | 'done'

interface NewCardState {
  number: string
  name: string
  expiry: string
  cvc: string
}

function cardBrand(number: string) {
  const digits = number.replace(/\D/g, '')
  if (digits.startsWith('4')) return 'Visa'
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard'
  if (/^3[47]/.test(digits)) return 'Amex'
  if (/^(4011|4312|4389|4514|4576|5041|5067|509|6277|6362|6363)/.test(digits)) return 'Elo'
  return 'Cartão'
}

function formatCardNumber(v: string) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 4)
  if (d.length <= 2) return d
  return `${d.slice(0, 2)}/${d.slice(2)}`
}

function isNewCardReady(card: NewCardState) {
  return (
    card.number.replace(/\D/g, '').length === 16 &&
    card.name.trim().length > 4 &&
    card.expiry.length === 5 &&
    card.cvc.length >= 3
  )
}

function CreditCardPreview({
  card,
  focus,
  brand,
}: {
  card: NewCardState
  focus: NewCardPhase
  brand?: string
}) {
  const isBack = focus === 'cvc'
  return (
    <motion.div
      className={`credit-preview ${isBack ? 'is-back' : ''}`}
      layout
      initial={{ opacity: 0, y: 14, rotateX: -8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
    >
      <div className="credit-face credit-front">
        <div className="credit-top">
          <span className="credit-chip" />
          <span className="credit-brand">{brand ?? cardBrand(card.number)}</span>
        </div>
        <motion.div
          className={`credit-number ${focus === 'number' ? 'active' : ''}`}
          layout
        >
          {card.number || '•••• •••• •••• ••••'}
        </motion.div>
        <div className="credit-bottom">
          <motion.span className={focus === 'name' ? 'active' : ''} layout>
            {card.name || 'NOME IMPRESSO'}
          </motion.span>
          <motion.span className={focus === 'expiry' ? 'active' : ''} layout>
            {card.expiry || 'MM/AA'}
          </motion.span>
        </div>
      </div>
      <div className="credit-face credit-back">
        <div className="credit-stripe" />
        <div className="credit-cvc-row">
          <span>CVV</span>
          <b>{card.cvc || '•••'}</b>
        </div>
      </div>
    </motion.div>
  )
}

function NewCardForm({
  card,
  setCard,
  phase,
  setPhase,
}: {
  card: NewCardState
  setCard: (card: NewCardState) => void
  phase: NewCardPhase
  setPhase: (phase: NewCardPhase) => void
}) {
  const numberRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const expiryRef = useRef<HTMLInputElement>(null)
  const cvcRef = useRef<HTMLInputElement>(null)

  const numberOk = card.number.replace(/\D/g, '').length === 16
  const nameOk = card.name.trim().length > 4
  const expiryOk = card.expiry.length === 5
  const cvcOk = card.cvc.length >= 3

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => {
      const input =
        phase === 'number'
          ? numberRef.current
          : phase === 'name'
            ? nameRef.current
            : phase === 'expiry'
              ? expiryRef.current
              : phase === 'cvc'
                ? cvcRef.current
                : null
      input?.focus()
    })
    return () => cancelAnimationFrame(id)
  }, [phase])

  function patch(patchCard: Partial<NewCardState>) {
    setCard({ ...card, ...patchCard })
  }

  function confirm(next: NewCardPhase, ready: boolean) {
    if (!ready) return
    select()
    setPhase(next)
  }

  return (
    <div className="new-card-flow">
      <CreditCardPreview card={card} focus={phase} />

      <AnimatePresence mode="wait">
        {phase === 'number' && (
          <motion.div key="number" className="field" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            <span className="field-label">Número do cartão</span>
            <div className="num-row">
              <input
                ref={numberRef}
                className="field-input"
                autoFocus
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="0000 0000 0000 0000"
                value={card.number}
                onChange={(e) => patch({ number: formatCardNumber(e.target.value) })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    confirm('name', numberOk)
                  }
                }}
              />
              <button className="num-confirm" aria-label="Confirmar número do cartão" disabled={!numberOk} onPointerDown={(e) => e.preventDefault()} onClick={() => confirm('name', numberOk)}>
                <ArrowRight width={22} height={22} />
              </button>
            </div>
            <span className="enter-hint">
              <Return width={13} height={13} /> Toque na seta ou aperte Enter para continuar
            </span>
          </motion.div>
        )}

        {phase === 'name' && (
          <motion.div key="name" className="field" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            <span className="field-label">Nome impresso no cartão</span>
            <div className="num-row">
              <input
                ref={nameRef}
                className="field-input"
                autoFocus
                autoComplete="cc-name"
                placeholder="Nome como está no cartão"
                value={card.name}
                onChange={(e) => patch({ name: e.target.value.toUpperCase() })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    confirm('expiry', nameOk)
                  }
                }}
              />
              <button className="num-confirm" aria-label="Confirmar nome do cartão" disabled={!nameOk} onPointerDown={(e) => e.preventDefault()} onClick={() => confirm('expiry', nameOk)}>
                <ArrowRight width={22} height={22} />
              </button>
            </div>
            <span className="enter-hint">
              <Return width={13} height={13} /> Toque na seta ou aperte Enter para continuar
            </span>
          </motion.div>
        )}

        {phase === 'expiry' && (
          <motion.div key="expiry" className="field" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            <span className="field-label">Validade</span>
            <div className="num-row">
              <input
                ref={expiryRef}
                className="field-input"
                autoFocus
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/AA"
                value={card.expiry}
                onChange={(e) => patch({ expiry: formatExpiry(e.target.value) })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    confirm('cvc', expiryOk)
                  }
                }}
              />
              <button className="num-confirm" aria-label="Confirmar validade do cartão" disabled={!expiryOk} onPointerDown={(e) => e.preventDefault()} onClick={() => confirm('cvc', expiryOk)}>
                <ArrowRight width={22} height={22} />
              </button>
            </div>
            <span className="enter-hint">
              <Return width={13} height={13} /> Toque na seta ou aperte Enter para continuar
            </span>
          </motion.div>
        )}

        {phase === 'cvc' && (
          <motion.div key="cvc" className="field" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            <span className="field-label">Código de segurança</span>
            <div className="num-row">
              <input
                ref={cvcRef}
                className="field-input"
                autoFocus
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="000"
                value={card.cvc}
                onChange={(e) => patch({ cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    confirm('done', cvcOk)
                  }
                }}
              />
              <button className="num-confirm" aria-label="Confirmar código do cartão" disabled={!cvcOk} onPointerDown={(e) => e.preventDefault()} onClick={() => confirm('done', cvcOk)}>
                <ArrowRight width={22} height={22} />
              </button>
            </div>
            <span className="enter-hint">
              <Return width={13} height={13} /> Toque na seta ou aperte Enter para continuar
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SavedCvvForm({
  card,
  brand,
  cvv,
  setCvv,
  onConfirm,
}: {
  card: NewCardState
  brand: string
  cvv: string
  setCvv: (cvv: string) => void
  onConfirm: () => void
}) {
  const cvcRef = useRef<HTMLInputElement>(null)
  const cvcOk = cvv.length >= 3

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => cvcRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [])

  function confirm() {
    if (!cvcOk) return
    select()
    onConfirm()
  }

  return (
    <div className="new-card-flow">
      <CreditCardPreview card={card} focus="cvc" brand={brand} />

      <AnimatePresence mode="wait">
        <motion.div
          key="saved-cvc"
          className="field"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
        >
          <span className="field-label">Código de segurança</span>
          <div className="num-row">
            <input
              ref={cvcRef}
              className="field-input"
              autoFocus
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="000"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  confirm()
                }
              }}
            />
            <button
              className="num-confirm"
              aria-label="Confirmar código de segurança"
              disabled={!cvcOk}
              onPointerDown={(e) => e.preventDefault()}
              onClick={confirm}
            >
              <ArrowRight width={22} height={22} />
            </button>
          </div>
          <span className="enter-hint">
            <Return width={13} height={13} /> Toque na seta ou aperte Enter para continuar
          </span>
        </motion.div>
      </AnimatePresence>
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
  const [newCard, setNewCard] = useState<NewCardState>({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
  })
  const [newCardPhase, setNewCardPhase] = useState<NewCardPhase>('number')
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
      if (phase === 'newcard') {
        if (newCardPhase === 'cvc') {
          setNewCardPhase('expiry')
          return true
        }
        if (newCardPhase === 'expiry') {
          setNewCardPhase('name')
          return true
        }
        if (newCardPhase === 'name') {
          setNewCardPhase('number')
          return true
        }
        if (newCardPhase === 'done') {
          setNewCardPhase('cvc')
          return true
        }
        setPhase('method')
        return true
      }
      if (phase === 'savedcvv' || phase === 'cards') {
        setPhase('method')
        return true
      }
      return false
    })
    return () => registerBack(null)
  }, [phase, sel, newCardPhase, registerBack])

  // Enter avança conforme a fase
  useEnterAdvance(
    phase === 'method' || phase === 'newcard' || phase === 'savedcvv' || phase === 'installments',
    () => {
      if (phase === 'method') primary()
      else if (phase === 'newcard') {
        if (!isNewCardReady(newCard)) return
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
    const savedPreview: NewCardState = {
      number: savedCard ? `•••• •••• •••• ${savedCard.last4}` : '•••• •••• •••• ••••',
      name: 'CARTÃO SALVO',
      expiry: '••/••',
      cvc: cvv,
    }
    return (
      <>
        <div className="step-scroll">
          <h1 className="step-title">Código de segurança</h1>
          <p className="step-sub">Digite o CVV que fica no verso do cartão.</p>

          <SavedCvvForm
            card={savedPreview}
            brand={savedCard?.brand ?? 'Cartão'}
            cvv={cvv}
            setCvv={setCvv}
            onConfirm={() => setPhase('installments')}
          />
        </div>
      </>
    )
  }

  // ---------- Novo cartão ----------
  if (phase === 'newcard') {
    return (
      <>
        <div className="step-scroll">
          <h1 className="step-title">Novo cartão</h1>
          <p className="step-sub">Preencha um dado por vez para continuar.</p>
          <NewCardForm
            card={newCard}
            setCard={setNewCard}
            phase={newCardPhase}
            setPhase={setNewCardPhase}
          />
        </div>
        {isNewCardReady(newCard) && (
          <BottomBar
            label="Escolher parcelas"
            variant="green"
            onNext={() => {
              select()
              setPhase('installments')
            }}
          />
        )}
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
