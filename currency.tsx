"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

const STORAGE_KEY = "blockflip-balance"
const STARTING_BALANCE = 1000

type CurrencyContextValue = {
  balance: number
  ready: boolean
  add: (amount: number) => void
  subtract: (amount: number) => boolean
  reset: () => void
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(STARTING_BALANCE)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored !== null) {
        const parsed = Number.parseFloat(stored)
        if (Number.isFinite(parsed)) setBalance(parsed)
      }
    } catch {
      // ignore storage errors (private mode, etc.)
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      window.localStorage.setItem(STORAGE_KEY, String(balance))
    } catch {
      // ignore
    }
  }, [balance, ready])

  const add = useCallback((amount: number) => {
    setBalance((b) => Math.round((b + amount) * 100) / 100)
  }, [])

  const subtract = useCallback((amount: number) => {
    let success = false
    setBalance((b) => {
      if (b >= amount) {
        success = true
        return Math.round((b - amount) * 100) / 100
      }
      return b
    })
    return success
  }, [])

  const reset = useCallback(() => setBalance(STARTING_BALANCE), [])

  return (
    <CurrencyContext.Provider value={{ balance, ready, add, subtract, reset }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider")
  return ctx
}

export function formatCubes(amount: number) {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}
