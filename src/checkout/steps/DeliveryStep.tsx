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
  const [sheetOpen, setSheetOpen] = useState(false)
  const [entering, setEntering] = useState(false)

  const sameAddr = (a: typeof address, b: (typeof savedAddresses)[number]) =>
    !!a && a.cep === b.cep && a.number === b.number && a.street === b.street
  const showSaved = savedAddresses.length > 0 && !entering
  const cepRef = useRef<HTMLInputElement>(null)
  const numRef = useRef<HTMLInputElement>(null)
  const pickupRef = useRef<HTMLDivElement>(null)

  const hasStreet = !!address?.street
  const numberDone = !!address?.number
  const isPickup = shippingId === 'pickup'
  const complete = numberDone && !!shippingId && (!isPickup || !!pickupId)
  useEnterAdvance(complete, onNext)

  useEffect(() => {
    const t = setTimeout(() => {
      if (showSaved) return
      if (!hasStreet) cepRef.current?.focus()
      else if (!numberDone) numRef.current?.focus()
    }, 60)
    return () => clearTimeout(t)
  }, [hasStreet, numberDone, showSaved])

  // voltar contextual: sair do "outro endereço" volta aos endereços salvos
  useEffect(() => {
    registerBack(() => {
      if (entering && savedAddresses.length > 0) {
        setEntering(false)
        setNumberInput('')
        setAddress(savedAddresses[0])
        return true
      }
      return false
    })
    return () => registerBack(null)
  }, [entering, savedAddresses, registerBack, setAddress])

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

  function onCep(v: string) {
    const cep = formatCep(v)
    const found = lookupCep(cep)
    if (found) {
      tick()
      setAddress(found)
    } else {
      setAddress({ cep, street: '', number: '', district: '', city: '', state: '' })
    }
  }

  function confirmNumber() {
    if (!numberInput.trim() || !address) return
    select()
    setAddress({ ...address, number: numberInput.trim() })
  }

  function editAddress() {
    tick()
    setNumberInput('')
    setAddress({ cep: '', street: '', number: '', district: '', city: '', state: '' })
  }

  return (
    <>
      <div className="step-scroll">
        <h1 className="step-title">Onde entregamos?</h1>
        <p className="step-sub">Confirme o endereço e escolha o frete.</p>

        {showSaved ? (
          <div className="saved-addr">
            <span className="group-label">Endereço de entrega</span>
            {savedAddresses.map((a) => (
              <Selectable
                key={`${a.label}-${a.cep}`}
                icon={<MapPin width={20} height={20} />}
                title={a.label ?? a.street}
                subtitle={`${a.street}, ${a.number} · ${a.district} · ${a.city}/${a.state}`}
                selected={sameAddr(address, a)}
                onSelect={() => setAddress(a)}
              />
            ))}
            <button
              className="see-all"
              onClick={() => {
                tick()
                setNumberInput('')
                setEntering(true)
                setAddress({
                  cep: '',
                  street: '',
                  number: '',
                  district: '',
                  city: '',
                  state: '',
                })
              }}
            >
              Entregar em outro endereço
            </button>
          </div>
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
            className="addr-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="addr-main">
              <span className="addr-street">
                {address!.street}
                {address!.number ? `, ${address!.number}` : ''}
              </span>
              <span className="addr-rest">
                {address!.district} · {address!.city}/{address!.state} ·{' '}
                {address!.cep}
              </span>
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

        {numberDone && (
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
                    Ver todas as {pickupStores.length} lojas
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
