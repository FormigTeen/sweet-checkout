/* ============================================================
   Estado inicial no formato orderForm da VTEX.

   Este objeto imita a resposta de `POST /api/checkout/pub/orderForm`.
   Para usar um pedido real: substitua `sampleOrderForm` pelo JSON
   retornado pela sua loja — o adaptador (orderFormAdapter.ts) cuida
   da conversão para o modelo interno do checkout.

   Campos marcados como "extensão Le biscuit" são específicos da loja
   (garantia estendida / cashback). Em produção chegam via
   assemblyOptions / attachmentOfferings ou apps de customData; aqui
   ficam inline no item para manter o checkout 100% estático.
   ============================================================ */

import { airfryerArt, blenderArt } from './productArt'

export interface VtexWarrantyOffering {
  id: string
  name: string
  months: number
  price: number // centavos
}

export interface VtexItem {
  uniqueId: string
  id: string // skuId
  productId: string
  name: string
  skuName: string
  brand: string
  imageUrl: string
  listPrice: number // centavos ("de")
  price: number // centavos
  sellingPrice: number // centavos ("por")
  quantity: number
  seller: string
  sellerName: string
  measurementUnit: string
  unitMultiplier: number
  availability: string
  // Extensões Le biscuit:
  warrantyOfferings?: VtexWarrantyOffering[]
  cashbackPercent?: number
}

export interface VtexClientProfile {
  email: string
  firstName: string
  lastName: string
  document: string // CPF
  phone: string
  isCorporate: boolean
}

export interface VtexAddress {
  addressType: string
  receiverName: string
  postalCode: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  addressLabel?: string
}

export interface VtexShippingData {
  address: VtexAddress | null
  selectedAddresses: VtexAddress[]
}

export interface VtexPaymentSystem {
  id: number
  name: string
  groupName: string
  displayName: string
}

export interface VtexSavedCard {
  paymentSystem: string
  paymentSystemName: string
  lastDigits: string
}

export interface VtexPaymentData {
  paymentSystems: VtexPaymentSystem[]
  availableAccounts: VtexSavedCard[]
  maxInstallments: number
}

export interface VtexTotalizer {
  id: string
  name: string
  value: number // centavos (Discounts vem negativo)
}

export interface VtexOrderForm {
  orderFormId: string
  salesChannel: string
  value: number // total em centavos
  items: VtexItem[]
  totalizers: VtexTotalizer[]
  clientProfileData: VtexClientProfile | null
  shippingData: VtexShippingData | null
  paymentData: VtexPaymentData
  storePreferencesData: { currencyCode: string; currencySymbol: string }
  // permite colar um orderForm real com campos extras
  [key: string]: unknown
}

export const sampleOrderForm: VtexOrderForm = {
  orderFormId: '3dda42c80c3f437bba106b00cc5bd42f',
  salesChannel: '1',
  value: 35480,
  storePreferencesData: { currencyCode: 'BRL', currencySymbol: 'R$' },
  items: [
    {
      uniqueId: 'A1B2C3',
      id: '2147293310',
      productId: '5114335',
      name: 'Liquidificador Mondial Easy Power L-550-B Preto - 220V',
      skuName: '220V',
      brand: 'Mondial',
      imageUrl: blenderArt,
      listPrice: 8999,
      price: 8999,
      sellingPrice: 7490,
      quantity: 1,
      seller: '1',
      sellerName: 'LOJAS LE BISCUIT S/A',
      measurementUnit: 'un',
      unitMultiplier: 1,
      availability: 'available',
      cashbackPercent: 3,
      warrantyOfferings: [
        { id: 'w12', name: 'Garantia estendida 12 meses', months: 12, price: 1290 },
        { id: 'w24', name: 'Garantia estendida 24 meses', months: 24, price: 1990 },
        { id: 'w36', name: 'Garantia estendida 36 meses', months: 36, price: 2590 },
      ],
    },
    {
      uniqueId: 'D4E5F6',
      id: '2147299887',
      productId: '5192930',
      name: 'Fritadeira Air Fryer Britânia 4L Preta - 127V',
      skuName: '127V',
      brand: 'Britânia',
      imageUrl: airfryerArt,
      listPrice: 34990,
      price: 34990,
      sellingPrice: 27990,
      quantity: 1,
      seller: '1',
      sellerName: 'LOJAS LE BISCUIT S/A',
      measurementUnit: 'un',
      unitMultiplier: 1,
      availability: 'available',
      cashbackPercent: 5,
      warrantyOfferings: [
        { id: 'a12', name: 'Garantia estendida 12 meses', months: 12, price: 2990 },
        { id: 'a24', name: 'Garantia estendida 24 meses', months: 24, price: 4490 },
        { id: 'a36', name: 'Garantia estendida 36 meses', months: 36, price: 5990 },
      ],
    },
  ],
  totalizers: [
    { id: 'Items', name: 'Total dos Itens', value: 43989 },
    { id: 'Discounts', name: 'Descontos', value: -8509 },
    { id: 'Shipping', name: 'Total do Frete', value: 0 },
  ],
  // Cliente recorrente — usado no modo "complete". No modo "simple"
  // (primeira compra) o checkout ignora estes dados e começa em branco.
  clientProfileData: {
    email: 'ana.ribeiro@email.com',
    firstName: 'Ana',
    lastName: 'Ribeiro',
    document: '123.456.789-09',
    phone: '(71) 99876-5432',
    isCorporate: false,
  },
  shippingData: {
    address: {
      addressType: 'residential',
      receiverName: 'Ana Ribeiro',
      postalCode: '41820-021',
      street: 'Av. Tancredo Neves',
      number: '620',
      complement: 'Apto 1204',
      neighborhood: 'Caminho das Árvores',
      city: 'Salvador',
      state: 'BA',
      addressLabel: 'Casa',
    },
    selectedAddresses: [],
  },
  paymentData: {
    maxInstallments: 10,
    paymentSystems: [
      { id: 125, name: 'Pix', groupName: 'instantPaymentPaymentGroup', displayName: 'Pix' },
      { id: 2, name: 'Visa', groupName: 'creditCardPaymentGroup', displayName: 'Cartão de crédito' },
      { id: 1, name: 'Mastercard', groupName: 'creditCardPaymentGroup', displayName: 'Cartão de crédito' },
      { id: 201, name: 'Cartão Le biscuit', groupName: 'creditCardPaymentGroup', displayName: 'Cartão Le biscuit' },
      { id: 6, name: 'Boleto', groupName: 'bankInvoicePaymentGroup', displayName: 'Boleto bancário' },
    ],
    availableAccounts: [
      { paymentSystem: '2', paymentSystemName: 'Visa', lastDigits: '4821' },
    ],
  },
}
