export type ShopPaymentMethod =
  | 'online'
  | 'digipay'
  | 'snappay'
  | 'bank_transfer'
  | 'card_to_card'
  | 'cash_on_delivery'

export interface BankTransferDetails {
  bankName: string
  accountHolder: string
  accountNumber: string
  iban: string
  cardNumber: string
  instructions: string
}

export interface ShopPaymentSettings {
  enableOnline: boolean
  enableDigipay: boolean
  enableSnappay: boolean
  enableBankTransfer: boolean
  enableCardToCard: boolean
  enableCod: boolean
  bank: BankTransferDetails
  taxRatePercent: number
}

export interface CartLineInput {
  productId: string
  quantity: number
  unitPrice: number
  name: string
  sku: string
  slug: string
  image?: string | null
  options?: Record<string, string>
}

export interface CheckoutAddressInput {
  fullName: string
  phone: string
  province: string
  city: string
  address: string
  postalCode?: string
}

export interface CreateOrderInput {
  items: CartLineInput[]
  paymentMethod: ShopPaymentMethod
  shippingAddress: CheckoutAddressInput
  customerNote?: string
  transferRef?: string
}
