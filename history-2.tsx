"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

const STORAGE_KEY = "blockflip-history"
const MAX_ENTRIES = 50

export type GameKey = "mines" | "dice" | "coinflip" | "towers" | "hilo" | "limbo"

export type HistoryEntry = {
  id: string
  game: GameKey
  bet: number
  payout: number
  win: boolean
  multiplier: number
  time: number
}

type HistoryContextValue = {
  entries: HistoryEntry[]
  ready: boolean
  record: (entry: Omit<HistoryEntry, "id" | "time">) => void
  clear: () => void
}

const HistoryContext = createContext<HistoryContextValue | null>(null)

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) setEntries(parsed)
      }
    } catch {
      // ignore
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    } catch {
      // ignore
    }
  }, [entries, ready])

  const record = useCallback((entry: Omit<HistoryEntry, "id" | "time">) => {
    setEntries((prev) => {
      const next: HistoryEntry = {
        ...entry,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        time: Date.now(),
      }
      return [next, ...prev].slice(0, MAX_ENTRIES)
    })
  }, [])

  const clear = useCallback(() => setEntries([]), [])

  return (
    <HistoryContext.Provider value={{ entries, ready, record, clear }}>
      {children}
    </HistoryContext.Provider>
  )
}

export function useHistory() {
  const ctx = useContext(HistoryContext)
  if (!ctx) throw new Error("useHistory must be used within HistoryProvider")
  return ctx
}

export const GAME_LABELS: Record<GameKey, string> = {
  mines: "Mines",
  dice: "Dice",
  coinflip: "Coinflip",
  towers: "Towers",
  hilo: "HiLo",
  limbo: "Limbo",
}
