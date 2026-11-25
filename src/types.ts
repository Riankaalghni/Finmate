export type TxType = 'income' | 'expense'
export type Transaction = {
  id: string; title: string; amount: number; type: TxType; category: string;
  date: string; method: string; notes: string
}
export type Budget = { id: string; category: string; amount: number; month: number; year: number }
export type ChatMessage = { id: string; from: 'user' | 'bot'; text: string; status: string }
