import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Budget, Transaction } from '../types'

type SettingRecord = { key: string; value: string | boolean }
type FinanceBackup = {
  app: 'Finmate'
  version: 1
  exportedAt: string
  transactions: Transaction[]
  budgets: Budget[]
  currency: string
  dark: boolean
}

type Ctx = {
  transactions: Transaction[]
  budgets: Budget[]
  addTransaction: (t: Omit<Transaction, 'id'>) => void
  updateTransaction: (t: Transaction) => void
  deleteTransaction: (id: string) => void
  addBudget: (b: Omit<Budget, 'id'>) => void
  updateBudget: (b: Budget) => void
  deleteBudget: (id: string) => void
  currency: string
  setCurrency: (v: string) => void
  dark: boolean
  setDark: (v: boolean) => void
  isReady: boolean
  createBackup: () => FinanceBackup
  restoreBackup: (data: FinanceBackup) => void
  clearData: () => void
}

const Context = createContext<Ctx | null>(null)
const DB_NAME = 'finmate-local-db'
const DB_VERSION = 1

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('transactions')) {
        db.createObjectStore('transactions', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('budgets')) {
        db.createObjectStore('budgets', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function readAll<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly')
    const request = transaction.objectStore(storeName).getAll()
    request.onsuccess = () => resolve(request.result as T[])
    request.onerror = () => reject(request.error)
  })
}

function readSetting<T>(db: IDBDatabase, key: string, fallback: T): Promise<T> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('settings', 'readonly')
    const request = transaction.objectStore('settings').get(key)
    request.onsuccess = () => {
      const record = request.result as SettingRecord | undefined
      resolve(record ? record.value as T : fallback)
    }
    request.onerror = () => reject(request.error)
  })
}

function saveAll<T extends { id: string }>(db: IDBDatabase, storeName: string, items: T[]) {
  const transaction = db.transaction(storeName, 'readwrite')
  const store = transaction.objectStore(storeName)
  store.clear()
  items.forEach(item => store.put(item))
}

function saveSetting(db: IDBDatabase, key: string, value: string | boolean) {
  const transaction = db.transaction('settings', 'readwrite')
  transaction.objectStore('settings').put({ key, value } satisfies SettingRecord)
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [currency, setCurrency] = useState('IDR')
  const [dark, setDark] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let active = true

    async function loadData() {
      try {
        const db = await openDatabase()
        const [savedTransactions, savedBudgets, savedCurrency, savedDark] = await Promise.all([
          readAll<Transaction>(db, 'transactions'),
          readAll<Budget>(db, 'budgets'),
          readSetting<string>(db, 'currency', 'IDR'),
          readSetting<boolean>(db, 'dark', false)
        ])

        if (active) {
          setTransactions(savedTransactions)
          setBudgets(savedBudgets)
          setCurrency(savedCurrency)
          setDark(savedDark)
          setIsReady(true)
        }

        db.close()
      } catch (error) {
        console.error('Finmate gagal membuka penyimpanan lokal:', error)
        if (active) setIsReady(true)
      }
    }

    loadData()
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!isReady) return

    let active = true
    openDatabase().then(db => {
      if (!active) {
        db.close()
        return
      }
      saveAll(db, 'transactions', transactions)
      db.close()
    }).catch(error => console.error('Gagal menyimpan transaksi:', error))

    return () => { active = false }
  }, [transactions, isReady])

  useEffect(() => {
    if (!isReady) return

    openDatabase().then(db => {
      saveAll(db, 'budgets', budgets)
      db.close()
    }).catch(error => console.error('Gagal menyimpan anggaran:', error))
  }, [budgets, isReady])

  useEffect(() => {
    if (!isReady) return

    openDatabase().then(db => {
      saveSetting(db, 'currency', currency)
      db.close()
    }).catch(error => console.error('Gagal menyimpan mata uang:', error))
  }, [currency, isReady])

  useEffect(() => {
    if (!isReady) return

    openDatabase().then(db => {
      saveSetting(db, 'dark', dark)
      db.close()
    }).catch(error => console.error('Gagal menyimpan tema:', error))
  }, [dark, isReady])

  const value = useMemo<Ctx>(() => ({
    transactions,
    budgets,
    currency,
    setCurrency,
    dark,
    setDark,
    isReady,
    addTransaction: (item) => setTransactions(current => [
      { ...item, id: crypto.randomUUID() },
      ...current
    ]),
    updateTransaction: (item) => setTransactions(current => current.map(row => row.id === item.id ? item : row)),
    deleteTransaction: (id) => setTransactions(current => current.filter(item => item.id !== id)),
    addBudget: (item) => setBudgets(current => [
      ...current,
      { ...item, id: crypto.randomUUID() }
    ]),
    updateBudget: (item) => setBudgets(current => current.map(row => row.id === item.id ? item : row)),
    deleteBudget: (id) => setBudgets(current => current.filter(item => item.id !== id)),
    createBackup: () => ({
      app: 'Finmate',
      version: 1,
      exportedAt: new Date().toISOString(),
      transactions,
      budgets,
      currency,
      dark
    }),
    restoreBackup: (data) => {
      setTransactions(data.transactions)
      setBudgets(data.budgets)
      setCurrency(data.currency || 'IDR')
      setDark(Boolean(data.dark))
    },
    clearData: () => {
      setTransactions([])
      setBudgets([])
      setCurrency('IDR')
      setDark(false)
    }
  }), [transactions, budgets, currency, dark, isReady])

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useFinance() {
  const value = useContext(Context)
  if (!value) throw new Error('FinanceProvider belum dipasang.')
  return value
}
