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
  GiftCard,
  PaymentMethod,
  SavedCard,
} from './types'
import { sampleOrderForm } from './lib/orderForm'
import { adaptOrderForm } from './lib/orderFormAdapter'
import {
  COUPONS,
  giftCardsPool,
  savedAddressPool,
  savedCardsPool,
  shippingOptions,
} from './lib/mockData'

export interface SimConfig {
  products: number
  cards: number
  addresses: number
  profileComplete: boolean
  benefitsEnabled: boolean
  hasCashbackBalance: boolean
  cashbackBalance: number
}

const PIX_DISCOUNT = 0.05 // 5% extra no PIX

const fallbackContact: Contact = {
  phone: '(11) 99999-9999',
  name: '',
  email: 'marina.silva@email.com',
  cpf: '',
}

export interface Coupon {
  code: string
  pct: number
}

interface Totals {
  productsTotal: number
  warrantyTotal: number
  shippingCost: number
  couponDiscount: number
  giftCardDiscount: number
  cashbackDiscount: number
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
  pickupId: string | null
  payment: PaymentMethod
  selectedCardId: string | null
  installments: number
  savedCards: SavedCard[]
  savedAddresses: Address[]
  giftCards: GiftCard[]
  selectedGiftCardIds: string[]
  cashbackBalance: number
  cashbackToUse: number
  hasLeCard: boolean
  totals: Totals
  coupon: Coupon | null
  taps: number
  firstTapAt: number | null
  tap: () => void
  resetTaps: () => void
  registerBack: (fn: (() => boolean) | null) => void
  runBack: () => boolean
  setWarranty: (itemId: string, warrantyId: string | null) => void
  setQty: (itemId: string, qty: number) => void
  setContact: (c: Contact) => void
  setAddress: (a: Address) => void
  setShipping: (id: string) => void
  setPickup: (id: string | null) => void
  setPayment: (p: PaymentMethod) => void
  setSelectedCard: (id: string | null) => void
  setInstallments: (n: number) => void
  toggleGiftCard: (id: string) => void
  setCashbackToUse: (value: number) => void
  applyCoupon: (code: string) => boolean
  removeCoupon: () => void
}

const Ctx = createContext<CheckoutCtx | null>(null)

export function CheckoutProvider({
  mode,
  auth,
  sim = { products: 1, cards: 0, addresses: 0, profileComplete: true, benefitsEnabled: false, hasCashbackBalance: true, cashbackBalance: 2500 },
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
  const savedContact = adapted.savedContact ?? fallbackContact
  const [contact, setContact] = useState<Contact | null>(
    prefillContact && sim.profileComplete ? {
      ...savedContact,
      firstName: 'Marina',
      lastName: 'Silva',
      birthDate: '1991-04-18',
      gender: 'Feminino',
    } : prefillContact ? { ...savedContact, name: '', cpf: '' } : null,
  )
  const [address, setAddress] = useState<Address | null>(
    prefillRest ? savedAddresses[0] ?? null : null,
  )
  const [shippingId, setShipping] = useState<string | null>(
    prefillRest ? 'standard' : null,
  )
  const [pickupId, setPickup] = useState<string | null>(null)
  const [payment, setPayment] = useState<PaymentMethod>('pix')
  const [selectedCardId, setSelectedCard] = useState<string | null>(null)
  const [installments, setInstallments] = useState(1)
  const [selectedGiftCardIds, setSelectedGiftCardIds] = useState<string[]>([])
  const [cashbackToUse, setCashbackToUseRaw] = useState(0)
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [taps, setTaps] = useState(0)
  const [firstTapAt, setFirstTapAt] = useState<number | null>(null)

  const tap = () => {
    setFirstTapAt((started) => started ?? Date.now())
    setTaps((t) => t + 1)
  }
  const resetTaps = () => {
    setFirstTapAt(null)
    setTaps(0)
  }

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
    const cashback = items.reduce(
      (s, i) => s + Math.round((i.price * i.qty * (i.cashbackPct ?? 0)) / 100),
      0,
    )
    const beforeBenefits = productsTotal + warrantyTotal + shippingCost - couponDiscount
    const giftBalance = giftCardsPool
      .filter((g) => selectedGiftCardIds.includes(g.id))
      .reduce((sum, g) => sum + g.balance, 0)
    const giftCardDiscount = Math.min(giftBalance, beforeBenefits)
    const cashbackDiscount = Math.min(
      Math.max(0, cashbackToUse),
      Math.max(0, beforeBenefits - giftCardDiscount),
    )
    const itemsBase = Math.max(0, beforeBenefits - giftCardDiscount - cashbackDiscount)

    const isPix = payment === 'pix'
    const pixSavings = isPix ? Math.round(itemsBase * PIX_DISCOUNT) : 0
    const total = itemsBase - pixSavings

    // parcelas sem juros: mínimo R$5/parcela, teto = maxInstallments
    const cardBase = itemsBase
    let installmentsMax = adapted.maxInstallments
    while (installmentsMax > 1 && cardBase / installmentsMax < 500) {
      installmentsMax--
    }
    const boundedInstallments = Math.min(Math.max(1, installments), installmentsMax)
    const count = payment === 'pix' ? 1 : boundedInstallments
    const installmentValue = Math.round(cardBase / count)

    return {
      productsTotal,
      warrantyTotal,
      shippingCost,
      couponDiscount,
      giftCardDiscount,
      cashbackDiscount,
      itemsBase,
      pixSavings,
      total,
      cashback,
      installmentsMax,
      installmentValue,
      count,
    }
  }, [items, shippingId, payment, coupon, adapted.maxInstallments, installments, selectedGiftCardIds, cashbackToUse])

  const toggleGiftCard = (id: string) => {
    setSelectedGiftCardIds((ids) =>
      ids.includes(id) ? ids.filter((giftId) => giftId !== id) : [...ids, id],
    )
  }

  const setCashbackToUse = (value: number) => {
    const max = Math.max(0, sim.cashbackBalance)
    setCashbackToUseRaw(Math.min(max, Math.max(0, value)))
  }

  const value: CheckoutCtx = {
    items,
    contact,
    address,
    shippingId,
    pickupId,
    payment,
    selectedCardId,
    installments,
    savedCards,
    savedAddresses,
    giftCards: sim.benefitsEnabled ? giftCardsPool : [],
    selectedGiftCardIds,
    cashbackBalance: sim.cashbackBalance,
    cashbackToUse,
    hasLeCard: adapted.hasLeCard,
    totals,
    coupon,
    taps,
    firstTapAt,
    tap,
    resetTaps,
    registerBack,
    runBack,
    setWarranty,
    setQty,
    setContact,
    setAddress,
    setShipping,
    setPickup,
    setPayment,
    setSelectedCard,
    setInstallments,
    toggleGiftCard,
    setCashbackToUse,
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
