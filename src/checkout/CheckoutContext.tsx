import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {
  Address,
  CartItem,
  Contact,
  PaymentMethod,
  SavedCard,
} from './types'
import { sampleOrderForm } from './lib/orderForm'
import { adaptOrderForm } from './lib/orderFormAdapter'
import {
  COUPONS,
  savedAddressPool,
  savedCardsPool,
  shippingOptions,
} from './lib/mockData'

export interface SimConfig {
  products: number
  cards: number
  addresses: number
}

const PIX_DISCOUNT = 0.05 // 5% extra no PIX

export interface Coupon {
  code: string
  pct: number
}

interface Totals {
  productsTotal: number
  warrantyTotal: number
  shippingCost: number
  couponDiscount: number
  itemsBase: number
  pixSavings: number
  total: number
  cashback: number
  installmentsMax: number
  installmentValue: number
  count: number
}

interface CheckoutCtx {
  items: CartItem[]
  contact: Contact | null
  address: Address | null
  shippingId: string | null
  payment: PaymentMethod
  savedCards: SavedCard[]
  savedAddresses: Address[]
  hasLeCard: boolean
  totals: Totals
  coupon: Coupon | null
  taps: number
  tap: () => void
  resetTaps: () => void
  registerBack: (fn: (() => boolean) | null) => void
  runBack: () => boolean
  setWarranty: (itemId: string, warrantyId: string | null) => void
  setQty: (itemId: string, qty: number) => void
  setContact: (c: Contact) => void
  setAddress: (a: Address) => void
  setShipping: (id: string) => void
  setPayment: (p: PaymentMethod) => void
  applyCoupon: (code: string) => boolean
  removeCoupon: () => void
}

const Ctx = createContext<CheckoutCtx | null>(null)

export function CheckoutProvider({
  mode,
  auth,
  sim = { products: 2, cards: 1, addresses: 1 },
  children,
}: {
  mode: 'simple' | 'complete'
  auth: 0 | 1
  sim?: SimConfig
  children: ReactNode
}) {
  const adapted = useMemo(() => adaptOrderForm(sampleOrderForm), [])

  const prefillContact = mode === 'complete' || auth === 1
  const prefillRest = mode === 'complete'

  // Itens: cicla os itens do orderForm até atingir a quantidade simulada.
  const initialItems = useMemo<CartItem[]>(() => {
    const base = adapted.items
    if (!base.length) return []
    return Array.from({ length: Math.max(1, sim.products) }, (_, i) => {
      const b = base[i % base.length]
      return { ...b, id: i < base.length ? b.id : `${b.id}#${i}`, warrantyId: null }
    })
  }, [adapted.items, sim.products])

  const savedCards = useMemo(
    () => savedCardsPool.slice(0, Math.max(0, sim.cards)),
    [sim.cards],
  )
  const savedAddresses = useMemo(
    () => savedAddressPool.slice(0, Math.max(0, sim.addresses)),
    [sim.addresses],
  )

  const [items, setItems] = useState<CartItem[]>(initialItems)
  const [contact, setContact] = useState<Contact | null>(
    prefillContact ? adapted.savedContact : null,
  )
  const [address, setAddress] = useState<Address | null>(
    prefillRest ? savedAddresses[0] ?? null : null,
  )
  const [shippingId, setShipping] = useState<string | null>(
    prefillRest ? 'standard' : null,
  )
  const [payment, setPayment] = useState<PaymentMethod>('pix')
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [taps, setTaps] = useState(0)

  const tap = () => setTaps((t) => t + 1)
  const resetTaps = () => setTaps(0)

  // interceptador de "voltar": a etapa desfaz seu sub-estado antes de
  // deixar o botão do topo navegar entre etapas.
  const backRef = useRef<() => boolean>(() => false)
  const registerBack = useCallback((fn: (() => boolean) | null) => {
    backRef.current = fn ?? (() => false)
  }, [])
  const runBack = useCallback(() => backRef.current(), [])

  const applyCoupon = (code: string) => {
    const key = code.trim().toUpperCase()
    const pct = COUPONS[key]
    if (!pct) return false
    setCoupon({ code: key, pct })
    return true
  }
  const removeCoupon = () => setCoupon(null)

  const setWarranty = (itemId: string, warrantyId: string | null) =>
    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId ? { ...it, warrantyId } : it,
      ),
    )

  const setQty = (itemId: string, qty: number) =>
    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId ? { ...it, qty: Math.max(1, qty) } : it,
      ),
    )

  const totals = useMemo<Totals>(() => {
    const productsTotal = items.reduce((s, i) => s + i.price * i.qty, 0)
    const warrantyTotal = items.reduce((s, i) => {
      const w = i.warranties?.find((x) => x.id === i.warrantyId)
      return s + (w ? w.price : 0)
    }, 0)
    const opt = shippingOptions.find((o) => o.id === shippingId)
    const shippingCost = opt ? opt.price : 0
    const couponDiscount = coupon
      ? Math.round((productsTotal * coupon.pct) / 100)
      : 0
    const itemsBase = productsTotal + warrantyTotal + shippingCost - couponDiscount

    const isPix = payment === 'pix'
    const pixSavings = isPix ? Math.round(itemsBase * PIX_DISCOUNT) : 0
    const total = itemsBase - pixSavings

    const cashback = items.reduce(
      (s, i) => s + Math.round((i.price * i.qty * (i.cashbackPct ?? 0)) / 100),
      0,
    )

    // parcelas sem juros: mínimo R$5/parcela, teto = maxInstallments
    const cardBase = itemsBase
    let installmentsMax = adapted.maxInstallments
    while (installmentsMax > 1 && cardBase / installmentsMax < 500) {
      installmentsMax--
    }
    const count = payment === 'pix' ? 1 : installmentsMax
    const installmentValue = Math.round(cardBase / installmentsMax)

    return {
      productsTotal,
      warrantyTotal,
      shippingCost,
      couponDiscount,
      itemsBase,
      pixSavings,
      total,
      cashback,
      installmentsMax,
      installmentValue,
      count,
    }
  }, [items, shippingId, payment, coupon, adapted.maxInstallments])

  const value: CheckoutCtx = {
    items,
    contact,
    address,
    shippingId,
    payment,
    savedCards,
    savedAddresses,
    hasLeCard: adapted.hasLeCard,
    totals,
    coupon,
    taps,
    tap,
    resetTaps,
    registerBack,
    runBack,
    setWarranty,
    setQty,
    setContact,
    setAddress,
    setShipping,
    setPayment,
    applyCoupon,
    removeCoupon,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCheckout() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useCheckout deve estar dentro de CheckoutProvider')
  return c
}
