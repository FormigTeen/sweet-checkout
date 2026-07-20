import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCheckout } from '../CheckoutContext'
import { useEnterAdvance } from '../useEnterAdvance'
import { Selectable } from '../components/Selectable'
import { StorePickerSheet } from '../components/StorePickerSheet'
import {
  ArrowRight,
  Bolt,
  MapPin,
  Pencil,
  Return,
  Store,
  Truck,
} from '../components/Icons'
import {
  formatCep,
  lookupCep,
  pickupStores,
  shippingOptions,
} from '../lib/mockData'
import { brl } from '../lib/format'
import { select, tick } from '../lib/feedback'
import type { ShippingOption } from '../types'

const ICONS: Record<string, React.ReactNode> = {
  express: <Bolt width={20} height={20} />,
  standard: <Truck width={20} height={20} />,
  pickup: <Store width={20} height={20} />,
}

function shipRight(o: ShippingOption) {
  return o.price === 0 ? (
    <span className="free">Grátis</span>
  ) : (
    <span className="ship-price">{brl(o.price)}</span>
  )
}

const FAVORITE = pickupStores.find((s) => s.favorite)
const BY_DISTANCE = [...pickupStores].sort((a, b) => a.distanceKm - b.distanceKm)

export function DeliveryStep({
  onNext,
}: {
  onNext: () => void
}) {
  const {
    address,
    setAddress,
    savedAddresses,
    shippingId,
    setShipping,
    pickupId,
    setPickup,
    tap,
    registerBack,
  } = useCheckout()
  const [numberInput, setNumberInput] = useState(address?.number ?? '')
  const [complementInput, setComplementInput] = useState(address?.complement ?? '')
  const [recipientInput, setRecipientInput] = useState(address?.recipient ?? '')
  const [labelInput, setLabelInput] = useState(address?.label ?? '')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [entering, setEntering] = useState(false)
  const [showAllSaved, setShowAllSaved] = useState(false)

  const sameAddr = (a: typeof address, b: (typeof savedAddresses)[number]) =>
    !!a && a.cep === b.cep && a.number === b.number && a.street === b.street
  const showSaved = savedAddresses.length > 0 && !entering
  const cepRef = useRef<HTMLInputElement>(null)
  const numRef = useRef<HTMLInputElement>(null)
  const complementRef = useRef<HTMLInputElement>(null)
  const recipientRef = useRef<HTMLInputElement>(null)
  const labelRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const pickupRef = useRef<HTMLDivElement>(null)

  const hasStreet = !!address?.street
  const numberDone = !!address?.number
  const complementDone = numberDone && typeof address?.complement === 'string'
  const recipientDone = complementDone && !!address?.recipient
  const addressDetailsDone = recipientDone && !!address?.label
  const addressProgress =
    addressDetailsDone ? 'complete' : recipientDone ? 'recipient' : complementDone ? 'complement' : numberDone ? 'number' : 'base'
  const isPickup = shippingId === 'pickup'
  const complete = addressDetailsDone && !!shippingId && (!isPickup || !!pickupId)
  useEnterAdvance(complete, onNext)

  useEffect(() => {
    const t = setTimeout(() => {
      if (showSaved) return
      if (!hasStreet) cepRef.current?.focus()
      else if (!numberDone) numRef.current?.focus()
      else if (!complementDone) complementRef.current?.focus()
      else if (!recipientDone) recipientRef.current?.focus()
      else if (!addressDetailsDone) labelRef.current?.focus()
    }, 60)
    return () => clearTimeout(t)
  }, [hasStreet, numberDone, complementDone, recipientDone, addressDetailsDone, showSaved])

  // voltar contextual: sair do "outro endereço" volta aos endereços salvos
  useEffect(() => {
    registerBack(() => {
      if (showAllSaved) {
        setShowAllSaved(false)
        return true
      }
      if (addressDetailsDone && address) {
        setShipping('')
        setPickup(null)
        setAddress({ ...address, label: '' })
        setLabelInput('')
        return true
      }
      if (recipientDone && address) {
        setShipping('')
        setPickup(null)
        setAddress({ ...address, recipient: '', label: '' })
        setRecipientInput('')
        setLabelInput('')
        return true
      }
      if (complementDone && address) {
        setAddress({ ...address, complement: undefined, recipient: '', label: '' })
        setRecipientInput('')
        setLabelInput('')
        return true
      }
      if (numberDone && address) {
        setAddress({ ...address, number: '', complement: '', recipient: '', label: '' })
        setNumberInput('')
        setComplementInput('')
        setRecipientInput('')
        setLabelInput('')
        return true
      }
      if (entering && savedAddresses.length > 0) {
        setEntering(false)
        setShowAllSaved(false)
        setNumberInput('')
        setComplementInput('')
        setRecipientInput('')
        setLabelInput('')
        setAddress(savedAddresses[0])
        return true
      }
      return false
    })
    return () => registerBack(null)
  }, [
    entering,
    showAllSaved,
    savedAddresses,
    registerBack,
    setAddress,
    address,
    addressDetailsDone,
    recipientDone,
    complementDone,
    numberDone,
    setShipping,
    setPickup,
  ])

  useEffect(() => {
    if (!isPickup) return
    if (!pickupId && FAVORITE) setPickup(FAVORITE.id)
    const frame = requestAnimationFrame(() => {
      const scrollEl = scrollRef.current
      const pickupEl = pickupRef.current
      if (!scrollEl || !pickupEl) return

      const scrollRect = scrollEl.getBoundingClientRect()
      const pickupRect = pickupEl.getBoundingClientRect()
      const top = scrollEl.scrollTop + pickupRect.top - scrollRect.top - 12
      scrollEl.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    })
    return () => cancelAnimationFrame(frame)
  }, [isPickup, pickupId, setPickup])

  // Lista fixa (favorita + mais próximas). NÃO reordena ao selecionar —
  // uma loja escolhida na busca aparece anexada ao fim, sem trocar posições.
  const base = useMemo(() => {
    const picked: typeof pickupStores = []
    if (FAVORITE) picked.push(FAVORITE)
    for (const s of BY_DISTANCE) {
      if (picked.length >= 3) break
      if (!picked.find((p) => p.id === s.id)) picked.push(s)
    }
    return picked
  }, [])
  const shortlist = useMemo(() => {
    if (!pickupId || base.find((s) => s.id === pickupId)) return base
    const sel = pickupStores.find((s) => s.id === pickupId)
    return sel ? [...base, sel] : base
  }, [pickupId, base])
  const selectedSavedAddress = useMemo(
    () => savedAddresses.find((a) => sameAddr(address, a)),
    [address, savedAddresses],
  )
  const otherSavedAddresses = selectedSavedAddress
    ? savedAddresses.filter((a) => !sameAddr(selectedSavedAddress, a))
    : []
  const visibleAddresses = selectedSavedAddress
    ? showAllSaved ? [selectedSavedAddress, ...otherSavedAddresses] : [selectedSavedAddress]
    : savedAddresses
  const hiddenAddresses = showAllSaved ? 0 : savedAddresses.length - visibleAddresses.length

  function addressKey(a: (typeof savedAddresses)[number]) {
    return `${a.cep}-${a.number}-${a.label ?? a.street}`
  }

  function onCep(v: string) {
    const cep = formatCep(v)
    const found = lookupCep(cep)
    if (found) {
      tick()
      setAddress(found)
      setComplementInput('')
      setRecipientInput('')
      setLabelInput('')
    } else {
      setAddress({ cep, street: '', number: '', complement: '', recipient: '', label: '', district: '', city: '', state: '' })
    }
  }

  function confirmNumber() {
    if (!numberInput.trim() || !address) return
    select()
    setAddress({ ...address, number: numberInput.trim(), complement: undefined, recipient: '', label: '' })
  }

  function confirmComplement() {
    if (!address) return
    select()
    setAddress({
      ...address,
      complement: complementInput.trim(),
    })
  }

  function confirmRecipient() {
    if (!address || !recipientInput.trim()) return
    select()
    setAddress({ ...address, recipient: recipientInput.trim(), label: '' })
  }

  function confirmLabel() {
    if (!address || !labelInput.trim()) return
    select()
    setAddress({ ...address, label: labelInput.trim() })
  }

  function editAddress() {
    tick()
    setNumberInput('')
    setComplementInput('')
    setRecipientInput('')
    setLabelInput('')
    setAddress({ cep: '', street: '', number: '', complement: '', recipient: '', label: '', district: '', city: '', state: '' })
  }

  return (
    <>
      <div ref={scrollRef} className="step-scroll">
        <h1 className="step-title">Onde entregamos?</h1>
        <p className="step-sub">Confirme o endereço e escolha o frete.</p>

        {showSaved ? (
          <motion.div className="saved-addr" layout>
            <span className="group-label">Endereço de entrega</span>
            <AnimatePresence initial={false}>
              {visibleAddresses.map((a) => (
                <motion.div
                  key={addressKey(a)}
                  layout
                  initial={{ opacity: 0, height: 0, y: -6 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -6 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                  style={{ overflow: 'hidden' }}
                >
                  <Selectable
                    icon={<MapPin width={20} height={20} />}
                    title={a.label ?? a.street}
                    subtitle={
                      <>
                        {a.street}, {a.number}
                        {a.complement ? ` · ${a.complement}` : ''} · {a.district} · {a.city}/{a.state}
                        <br />
                        <b className="saved-recipient">
                          Recebe: {a.recipient ?? 'Não informado'}
                        </b>
                      </>
                    }
                    selected={sameAddr(address, a)}
                    onSelect={() => {
                      setAddress(a)
                      setComplementInput(a.complement ?? '')
                      setRecipientInput(a.recipient ?? '')
                      setLabelInput(a.label ?? '')
                      setShowAllSaved(false)
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            {hiddenAddresses > 0 && (
              <button
                className="see-all"
                aria-expanded={showAllSaved}
                onClick={() => {
                  tick()
                  setShowAllSaved(true)
                }}
              >
                Ver outros {hiddenAddresses} endereços
              </button>
            )}
            {showAllSaved && selectedSavedAddress && (
              <button
                className="see-all"
                aria-expanded={showAllSaved}
                onClick={() => {
                  tick()
                  setShowAllSaved(false)
                }}
              >
                Ocultar outros endereços
              </button>
            )}
            <button
              className="see-all"
              onClick={() => {
                tick()
                setNumberInput('')
                setComplementInput('')
                setRecipientInput('')
                setLabelInput('')
                setShowAllSaved(false)
                setEntering(true)
                setAddress({
                  cep: '',
                  street: '',
                  number: '',
                  complement: '',
                  recipient: '',
                  label: '',
                  district: '',
                  city: '',
                  state: '',
                })
              }}
            >
              Entregar em outro endereço
            </button>
          </motion.div>
        ) : !hasStreet ? (
          <label className="field">
            <span className="field-label">CEP</span>
            <input
              ref={cepRef}
              className="field-input big"
              inputMode="numeric"
              placeholder="00000-000"
              value={address?.cep ?? ''}
              onChange={(e) => onCep(e.target.value)}
            />
            <span className="field-help">
              <a
                href="https://buscacepinter.correios.com.br"
                target="_blank"
                rel="noreferrer"
              >
                Não sei meu CEP
              </a>
            </span>
          </label>
        ) : (
          <motion.div
            className={`addr-card addr-card-${addressProgress}`}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{ type: 'spring', stiffness: 330, damping: 28 }}
          >
            <div className="addr-main">
              <span className="addr-title-row">
                <span className="addr-street">
                  {address!.label ? (
                    <motion.span
                      className="addr-inline-value addr-inline-filled"
                      initial={{ opacity: 0, scaleX: 0.72 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ type: 'spring', stiffness: 520, damping: 32 }}
                    >
                      {address!.label}
                    </motion.span>
                  ) : (
                    <span className="addr-inline-skeleton label" aria-hidden />
                  )}
                </span>
              </span>
              <span className="addr-rest addr-rest-address">
                {address!.street}
                <span className="addr-inline-sep">, </span>
                {numberDone ? (
                  <motion.span
                    className="addr-inline-value addr-inline-filled"
                    initial={{ opacity: 0, scaleX: 0.72 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ type: 'spring', stiffness: 520, damping: 32 }}
                  >
                    {address!.number}
                  </motion.span>
                ) : (
                  <span className="addr-inline-skeleton number" aria-hidden />
                )}
              </span>
              <span className="addr-rest addr-rest-primary">
                {complementDone ? (
                  <motion.span
                    className="addr-inline-value addr-inline-filled"
                    initial={{ opacity: 0, scaleX: 0.72 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ type: 'spring', stiffness: 520, damping: 32 }}
                  >
                    {address!.complement || 'Sem complemento'}
                  </motion.span>
                ) : (
                  <span className="addr-inline-skeleton complement" aria-hidden />
                )}
                <span className="addr-inline-sep"> · </span>
                {address!.district} · {address!.city}/{address!.state} · {address!.cep}
              </span>
              <span className="addr-rest addr-recipient-line">
                <span>Recebe: </span>
                {recipientDone ? (
                  <motion.span
                    className="addr-inline-value addr-inline-filled"
                    initial={{ opacity: 0, scaleX: 0.72 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ type: 'spring', stiffness: 520, damping: 32 }}
                  >
                    {address!.recipient}
                  </motion.span>
                ) : (
                  <span className="addr-inline-skeleton recipient" aria-hidden />
                )}
              </span>
            </div>
            <button
              className="icon-btn subtle"
              aria-label="Alterar endereço"
              onClick={editAddress}
            >
              <Pencil width={18} height={18} />
            </button>
          </motion.div>
        )}

        {hasStreet && !numberDone && (
          <motion.div className="field" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span className="field-label">Número</span>
            <div className="num-row">
              <input
                ref={numRef}
                className="field-input"
                inputMode="numeric"
                placeholder="Ex: 620"
                value={numberInput}
                onChange={(e) => setNumberInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    confirmNumber()
                  }
                }}
              />
              <button
                className="num-confirm"
                aria-label="Confirmar número"
                disabled={!numberInput.trim()}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => {
                  tap()
                  confirmNumber()
                }}
              >
                <ArrowRight width={22} height={22} />
              </button>
            </div>
            <span className="enter-hint">
              <Return width={13} height={13} /> Toque na seta ou pressione Enter
            </span>
          </motion.div>
        )}

        {numberDone && !complementDone && (
          <motion.div className="address-extra" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="field">
              <span className="field-label">Complemento</span>
              <div className="num-row">
                <input
                  ref={complementRef}
                  className="field-input"
                  placeholder="Apto, bloco, referência"
                  value={complementInput}
                  onChange={(e) => setComplementInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      confirmComplement()
                    }
                  }}
                />
                <button
                  className="num-confirm"
                  aria-label="Confirmar complemento"
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => {
                    tap()
                    confirmComplement()
                  }}
                >
                  <ArrowRight width={22} height={22} />
                </button>
              </div>
              <span className="enter-hint">
                <Return width={13} height={13} /> Toque na seta ou pressione Enter
              </span>
            </div>
          </motion.div>
        )}

        {complementDone && !recipientDone && (
          <motion.div className="address-extra" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="field">
              <span className="field-label">Quem vai receber</span>
              <div className="num-row">
                <input
                  ref={recipientRef}
                  className="field-input"
                  placeholder="Nome do recebedor"
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      confirmRecipient()
                    }
                  }}
                />
                <button
                  className="num-confirm"
                  aria-label="Confirmar recebedor"
                  disabled={!recipientInput.trim()}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => {
                    tap()
                    confirmRecipient()
                  }}
                >
                  <ArrowRight width={22} height={22} />
                </button>
              </div>
              <span className="enter-hint">
                <Return width={13} height={13} /> Toque na seta ou pressione Enter
              </span>
            </div>
          </motion.div>
        )}

        {recipientDone && !addressDetailsDone && (
          <motion.div className="address-extra" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="field">
              <span className="field-label">Apelido do endereço</span>
              <div className="num-row">
                <input
                  ref={labelRef}
                  className="field-input"
                  placeholder="Casa, trabalho, mãe..."
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      confirmLabel()
                    }
                  }}
                />
                <button
                  className="num-confirm"
                  aria-label="Confirmar apelido do endereço"
                  disabled={!labelInput.trim()}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => {
                    tap()
                    confirmLabel()
                  }}
                >
                  <ArrowRight width={22} height={22} />
                </button>
              </div>
              <span className="enter-hint">
                <Return width={13} height={13} /> Toque na seta ou pressione Enter
              </span>
            </div>
          </motion.div>
        )}

        {addressDetailsDone && (
          <motion.div
            className="ship-list"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="group-label">Como você quer receber</span>
            {shippingOptions.map((o) => (
              <Selectable
                key={o.id}
                icon={ICONS[o.id]}
                title={o.label}
                subtitle={o.detail}
                right={shipRight(o)}
                featured={o.id === 'standard'}
                indicator={o.id === 'pickup' ? 'check' : 'arrow'}
                selected={shippingId === o.id}
                onSelect={() => {
                  setShipping(o.id)
                  if (o.id !== 'pickup') onNext()
                }}
              />
            ))}

            <AnimatePresence>
              {isPickup && (
                <motion.div
                  ref={pickupRef}
                  className="pickup-block"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <span className="group-label">Lojas mais próximas de você</span>
                  {shortlist.map((s) => (
                    <Selectable
                      key={s.id}
                      icon={<Store width={20} height={20} />}
                      title={s.name}
                      badge={s.favorite ? 'Sua loja' : undefined}
                      subtitle={
                        <>
                          {s.neighborhood} · {s.city}
                          <br />
                          <b className="pickup-ready">{s.ready}</b>
                        </>
                      }
                      right={<span className="pickup-dist">{s.distanceKm} km</span>}
                      indicator="arrow"
                      selected={pickupId === s.id}
                      onSelect={() => {
                        setPickup(s.id)
                        onNext()
                      }}
                    />
                  ))}
                  <button
                    className="see-all"
                    onClick={() => {
                      tick()
                      setSheetOpen(true)
                    }}
                  >
                    Ver todas as lojas
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <StorePickerSheet
        open={sheetOpen}
        onSelect={(id) => {
          setPickup(id)
          onNext()
        }}
        onClose={() => setSheetOpen(false)}
      />
    </>
  )
}
