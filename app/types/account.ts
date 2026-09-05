export interface AccountBank {
  id: number
  name: string
  bank?: string
  code?: string
}

export interface AccountTransaction {
  id: number
  transaction_type: 'income' | 'expense'
  category: string
  amount: number
  date: string
  payment_method?: string | null
}

export interface Account {
  id: number
  bank_id: number
  account_number: string
  balance: number
  decimal?: number

  account_scope:
    | 'personal'
    | 'organization'

  registered_at: string
  transaction_count: number

  transactions?: AccountTransaction[]

  bank?: AccountBank
}