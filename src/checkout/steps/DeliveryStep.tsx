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
  const pickupRef = useRef<HTMLDivElement>(null)

  const hasStreet = !!address?.street
  const numberDone = !!address?.number
  const complementDone = numberDone && typeof address?.complement === 'string'
  const addressDetailsDone = numberDone && !!address?.recipient
  const addressProgress =
    addressDetailsDone ? 'complete' : complementDone ? 'complement' : numberDone ? 'number' : 'base'
  const isPickup = shippingId === 'pickup'
  const complete = addressDetailsDone && !!shippingId && (!isPickup || !!pickupId)
  useEnterAdvance(complete, onNext)

  useEffect(() => {
    const t = setTimeout(() => {
      if (showSaved) return
      if (!hasStreet) cepRef.current?.focus()
      else if (!numberDone) numRef.current?.focus()
      else if (!complementDone) complementRef.current?.focus()
      else if (!addressDetailsDone) recipientRef.current?.focus()
    }, 60)
    return () => clearTimeout(t)
  }, [hasStreet, numberDone, complementDone, addressDetailsDone, showSaved])

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
        setAddress({ ...address, recipient: '' })
        return true
      }
      if (complementDone && address) {
        setAddress({ ...address, complement: undefined, recipient: '' })
        return true
      }
      if (numberDone && address) {
        setAddress({ ...address, number: '', complement: '', recipient: '' })
        setNumberInput('')
        return true
      }
      if (entering && savedAddresses.length > 0) {
        setEntering(false)
        setShowAllSaved(false)
        setNumberInput('')
        setComplementInput('')
        setRecipientInput('')
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
    complementDone,
    numberDone,
    setShipping,
    setPickup,
  ])

  useEffect(() => {
    if (!isPickup) return
    if (!pickupId && FAVORITE) setPickup(FAVORITE.id)
    // espera o layout expandir e rola o conteúdo até as lojas ficarem à vista
    const t = setTimeout(() => {
      const cont = pickupRef.current?.closest('.step') as HTMLElement | null
      if (cont) cont.scrollTo({ top: cont.scrollHeight, behavior: 'smooth' })
    }, 160)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } else {
      setAddress({ cep, street: '', number: '', complement: '', recipient: '', district: '', city: '', state: '' })
    }
  }

  function confirmNumber() {
    if (!numberInput.trim() || !address) return
    select()
    setAddress({ ...address, number: numberInput.trim(), complement: undefined, recipient: '' })
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
    setAddress({ ...address, recipient: recipientInput.trim() })
  }

  function editAddress() {
    tick()
    setNumberInput('')
    setAddress({ cep: '', street: '', number: '', complement: '', recipient: '', district: '', city: '', state: '' })
  }

  return (
    <>
      <div className="step-scroll">
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
                    subtitle={`${a.street}, ${a.number}${a.complement ? ` · ${a.complement}` : ''} · ${a.recipient ?? 'Recebedor não informado'}`}
                    selected={sameAddr(address, a)}
                    onSelect={() => {
                      setAddress(a)
                      setComplementInput(a.complement ?? '')
                      setRecipientInput(a.recipient ?? '')
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
                setShowAllSaved(false)
                setEntering(true)
                setAddress({
                  cep: '',
                  street: '',
                  number: '',
                  complement: '',
                  recipient: '',
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
              scale: addressProgress === 'base' ? 1 : 1.01,
            }}
            transition={{ type: 'spring', stiffness: 330, damping: 28 }}
          >
            <div className="addr-main">
              <span className="addr-street">
                {address!.street}
              </span>
              <motion.span className="addr-rest" layout>
                {address!.district} · {address!.city}/{address!.state} · {address!.cep}
              </motion.span>
              <AnimatePresence>
                {address!.number && (
                  <motion.span
                    key="number"
                    className="addr-detail-pill"
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4 }}
                  >
                    Número {address!.number}
                  </motion.span>
                )}
                {typeof address!.complement === 'string' && (
                  <motion.span
                    key="complement"
                    className="addr-detail-pill"
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4 }}
                  >
                    {address!.complement || 'Sem complemento'}
                  </motion.span>
                )}
                {address!.recipient && (
                  <motion.span
                    key="recipient"
                    className="addr-detail-pill addr-detail-strong"
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4 }}
                  >
                    Recebe: {address!.recipient}
                  </motion.span>
                )}
              </AnimatePresence>
              {address!.label && <span className="addr-tag">{address!.label}</span>}
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

        {complementDone && !addressDetailsDone && (
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
