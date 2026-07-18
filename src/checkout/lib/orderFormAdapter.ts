import type { Address, CartItem, Contact, SavedCard } from '../types'
import type { VtexOrderForm } from './orderForm'

export interface AdaptedOrderForm {
  items: CartItem[]
  savedContact: Contact | null
  savedAddress: Address | null
  savedCard: SavedCard | null
  maxInstallments: number
  hasLeCard: boolean
}

/**
 * Converte um orderForm da VTEX no estado inicial do checkout estático.
 * Tolerante a campos ausentes para aceitar um orderForm real colado.
 */
export function adaptOrderForm(of: VtexOrderForm): AdaptedOrderForm {
  const items: CartItem[] = (of.items ?? []).map((it) => ({
    id: it.productId ?? it.id,
    name: it.name,
    brand: it.brand ?? '',
    image: it.imageUrl,
    listPrice: it.listPrice ?? it.price ?? it.sellingPrice,
    price: it.sellingPrice ?? it.price,
    qty: it.quantity ?? 1,
    cashbackPct: it.cashbackPercent,
    warranties: it.warrantyOfferings?.map((w) => ({
      id: w.id,
      months: w.months,
      price: w.price,
    })),
    warrantyId: null,
  }))

  const cpd = of.clientProfileData
  const savedContact: Contact | null = cpd
    ? {
        name: [cpd.firstName, cpd.lastName].filter(Boolean).join(' ').trim(),
        email: cpd.email,
        cpf: cpd.document,
        phone: cpd.phone,
      }
    : null

  const addr = of.shippingData?.address ?? null
  const savedAddress: Address | null = addr
    ? {
        cep: addr.postalCode,
        street: addr.street,
        number: addr.number,
        complement: addr.complement,
        district: addr.neighborhood,
        city: addr.city,
        state: addr.state,
        label: addr.addressLabel,
      }
    : null

  const acc = of.paymentData?.availableAccounts?.[0]
  const savedCard: SavedCard | null = acc
    ? {
        id: acc.paymentSystem,
        brand: acc.paymentSystemName,
        last4: acc.lastDigits,
      }
    : null

  const hasLeCard = (of.paymentData?.paymentSystems ?? []).some((p) =>
    /le biscuit/i.test(p.name),
  )

  return {
    items,
    savedContact,
    savedAddress,
    savedCard,
    maxInstallments: of.paymentData?.maxInstallments ?? 10,
    hasLeCard,
  }
}
