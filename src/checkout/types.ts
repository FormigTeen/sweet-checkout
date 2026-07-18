export type StepId = 'cart' | 'auth' | 'delivery' | 'payment' | 'done'
export type Mode = 'simple' | 'complete'

export interface WarrantyOption {
  id: string
  months: number
  price: number // centavos
}

export interface CartItem {
  id: string
  name: string
  brand: string
  image: string
  listPrice: number // centavos (de)
  price: number // centavos (por, à vista)
  qty: number
  cashbackPct?: number // % de cashback
  warranties?: WarrantyOption[]
  warrantyId?: string | null // opção escolhida
}

export interface Address {
  cep: string
  street: string
  number: string
  complement?: string
  district: string
  city: string
  state: string
  label?: string // ex: "Casa"
}

export interface ShippingOption {
  id: string
  label: string
  detail: string
  price: number // centavos (0 = grátis)
  etaDays: number
}

export type PaymentMethod = 'pix' | 'card' | 'lecard' | 'boleto'

export interface Contact {
  phone: string
  name: string
  email: string
  cpf: string
}

export interface SavedCard {
  id: string
  brand: string
  last4: string
}

export interface CheckoutState {
  items: CartItem[]
  contact: Contact | null
  address: Address | null
  shippingId: string | null
  payment: PaymentMethod | null
  installments: number
}
