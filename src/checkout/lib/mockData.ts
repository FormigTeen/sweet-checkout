import type { Address, GiftCard, SavedCard, ShippingOption } from '../types'

// Pools para simulação (o 1º item espelha o orderForm).
export const savedCardsPool: SavedCard[] = [
  { id: '2', brand: 'Visa', last4: '4821' },
  { id: '1', brand: 'Mastercard', last4: '5090' },
  { id: '3', brand: 'Elo', last4: '7712' },
  { id: '4', brand: 'Visa', last4: '1144' },
  { id: '5', brand: 'Hipercard', last4: '8801' },
  { id: '6', brand: 'Amex', last4: '3209' },
  { id: '7', brand: 'Mastercard', last4: '6642' },
]

export const giftCardsPool: GiftCard[] = [
  {
    id: 'gc-1',
    label: 'Gift Card Le biscuit',
    code: 'LB-2026-85',
    balance: 8500,
  },
  {
    id: 'gc-2',
    label: 'Vale presente',
    code: 'PRESENTE-40',
    balance: 4000,
  },
]

export const savedAddressPool: Address[] = [
  {
    cep: '41820-021',
    street: 'Av. Tancredo Neves',
    number: '620',
    complement: 'Apto 1204',
    recipient: 'Marina Silva',
    district: 'Caminho das Árvores',
    city: 'Salvador',
    state: 'BA',
    label: 'Casa',
  },
  {
    cep: '41770-235',
    street: 'Av. Paulo VI',
    number: '190',
    complement: 'Sala 804',
    recipient: 'Marina Silva',
    district: 'Pituba',
    city: 'Salvador',
    state: 'BA',
    label: 'Trabalho',
  },
  {
    cep: '42700-000',
    street: 'Alameda das Dunas',
    number: '55',
    complement: 'Casa 2',
    recipient: 'Carlos Silva',
    district: 'Vilas do Atlântico',
    city: 'Lauro de Freitas',
    state: 'BA',
    label: 'Casa da praia',
  },
  {
    cep: '40140-110',
    street: 'Av. Oceânica',
    number: '238',
    complement: 'Bloco B',
    recipient: 'Marina Silva',
    district: 'Barra',
    city: 'Salvador',
    state: 'BA',
    label: 'Família',
  },
  {
    cep: '41940-001',
    street: 'Rua Conselheiro Pedro Luiz',
    number: '88',
    complement: 'Portaria',
    recipient: 'Rafael Silva',
    district: 'Rio Vermelho',
    city: 'Salvador',
    state: 'BA',
    label: 'Studio',
  },
  {
    cep: '40301-155',
    street: 'Ladeira do Bonfim',
    number: '12',
    complement: 'Casa térrea',
    recipient: 'Ana Souza',
    district: 'Bonfim',
    city: 'Salvador',
    state: 'BA',
    label: 'Avó',
  },
  {
    cep: '44001-344',
    street: 'Av. Getúlio Vargas',
    number: '740',
    complement: 'Apto 302',
    recipient: 'Marina Silva',
    district: 'Centro',
    city: 'Feira de Santana',
    state: 'BA',
    label: 'Interior',
  },
]

// Cupons válidos (código -> % de desconto sobre os produtos).
export const COUPONS: Record<string, number> = {
  LEBISCUIT10: 10,
  BEMVINDO15: 15,
  FRETEGRATIS: 5,
}

export interface PickupStore {
  id: string
  name: string
  neighborhood: string
  city: string
  distanceKm: number
  ready: string
  favorite?: boolean
}

// ~40 lojas para retirada — simula uma rede grande. A lista já vem
// ordenada por proximidade; uma loja é marcada como favorita do cliente.
const BAIRROS: [string, string][] = [
  ['Caminho das Árvores', 'Salvador'],
  ['Pituba', 'Salvador'],
  ['Itaigara', 'Salvador'],
  ['Barra', 'Salvador'],
  ['Rio Vermelho', 'Salvador'],
  ['Brotas', 'Salvador'],
  ['Costa Azul', 'Salvador'],
  ['Imbuí', 'Salvador'],
  ['Paralela', 'Salvador'],
  ['Cabula', 'Salvador'],
  ['Stella Maris', 'Salvador'],
  ['Ondina', 'Salvador'],
  ['Graça', 'Salvador'],
  ['Canela', 'Salvador'],
  ['Nazaré', 'Salvador'],
  ['Comércio', 'Salvador'],
  ['Bonfim', 'Salvador'],
  ['Federação', 'Salvador'],
  ['Cajazeiras', 'Salvador'],
  ['São Cristóvão', 'Salvador'],
  ['Periperi', 'Salvador'],
  ['Valéria', 'Salvador'],
  ['Liberdade', 'Salvador'],
  ['Pau da Lima', 'Salvador'],
  ['Vilas do Atlântico', 'Lauro de Freitas'],
  ['Buraquinho', 'Lauro de Freitas'],
  ['Centro', 'Lauro de Freitas'],
  ['Portão', 'Lauro de Freitas'],
  ['Centro', 'Camaçari'],
  ['Gleba B', 'Camaçari'],
  ['Abrantes', 'Camaçari'],
  ['Centro', 'Simões Filho'],
  ['Centro', 'Dias d’Ávila'],
  ['Centro', 'Feira de Santana'],
  ['Cidade Nova', 'Feira de Santana'],
  ['Centro', 'Alagoinhas'],
  ['Centro', 'Ilhéus'],
  ['Centro', 'Itabuna'],
  ['Centro', 'Vitória da Conquista'],
  ['Centro', 'Juazeiro'],
]

export const pickupStores: PickupStore[] = BAIRROS.map(
  ([neighborhood, city], i) => ({
    id: `store-${i}`,
    name: `Le biscuit ${neighborhood}`,
    neighborhood,
    city,
    distanceKm: Math.round((0.8 + i * 1.35) * 10) / 10,
    ready: i < 6 ? 'Pronto hoje' : i < 16 ? 'Pronto amanhã' : 'Pronto em 2 dias',
    favorite: i === 2, // loja habitual do cliente
  }),
)

/* Opções de frete — simula os SLAs que a VTEX devolve em
   shippingData.logisticsInfo[].slas após informar o CEP. */
export const shippingOptions: ShippingOption[] = [
  {
    id: 'express',
    label: 'Entrega expressa',
    detail: 'Chega amanhã',
    price: 1990,
    etaDays: 1,
  },
  {
    id: 'standard',
    label: 'Entrega padrão',
    detail: 'Frete grátis',
    price: 0,
    etaDays: 4,
  },
  {
    id: 'pickup',
    label: 'Retirar na loja',
    detail: 'Shopping da Bahia · hoje',
    price: 0,
    etaDays: 0,
  },
]

// Busca de CEP (simulação de /postal-code).
export function lookupCep(cep: string): Address | null {
  const clean = cep.replace(/\D/g, '')
  if (clean.length !== 8) return null
  return {
    cep: formatCep(clean),
    street: 'Rua das Laranjeiras',
    number: '',
    complement: '',
    recipient: '',
    district: 'Pituba',
    city: 'Salvador',
    state: 'BA',
  }
}

export function formatCep(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

export function formatPhone(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}
