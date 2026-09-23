"use client"

import { useState } from "react"
import { Bomb, Gem } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCubes, useCurrency } from "@/lib/currency"
import { useHistory } from "@/lib/history"
import { playSound } from "@/lib/sound"
import { BetInput } from "./bet-input"

const HOUSE_EDGE = 0.99
const ROWS = 8
const COLS = 3
const SAFE_PER_ROW = 2 // 2 safe of 3 tiles

// Multiplier after clearing N rows.
function multiplierAt(rowsCleared: number) {
  if (rowsCleared <= 0) return 0
  const p = SAFE_PER_ROW / COLS
  return Math.round(Math.pow(1 / p, rowsCleared) * HOUSE_EDGE * 100) / 100
}

type RowState = {
  bombIndex: number
  picked: number | null
}

function buildRows(): RowState[] {
  return Array.from({ length: ROWS }, () => ({
    bombIndex: Math.floor(Math.random() * COLS),
    picked: null,
  }))
}

export function Towers() {
  const { add, subtract } = useCurrency()
  const { record } = useHistory()
  const [bet, setBet] = useState(50)
  const [rows, setRows] = useState<RowState[]>(buildRows)
  const [active, setActive] = useState(false)
  const [currentRow, setCurrentRow] = useState(0)
  const [dead, setDead] = useState(false)
  const [message, setMessage] = useState<{ text: string; win: boolean } | null>(null)

  const nextMultiplier = multiplierAt(currentRow + 1)
  const currentMultiplier = multiplierAt(currentRow)

  function start() {
    if (active) return
    if (!subtract(bet)) {
      setMessage({ text: "Cubes insufficienti", win: false })
      playSound("lose")
      return
    }
    setRows(buildRows())
    setActive(true)
    setDead(false)
    setCurrentRow(0)
    setMessage(null)
    playSound("click")
  }

  function pick(col: number) {
    if (!active || dead) return
    // Only the current row (from bottom) is playable.
    const rowIdx = currentRow
    setRows((prev) => {
      const next = prev.map((r, i) => (i === rowIdx ? { ...r, picked: col } : r))
      return next
    })

    const isBomb = rows[rowIdx].bombIndex === col
    if (isBomb) {
      setDead(true)
      setActive(false)
      setMessage({ text: "Boom! Sei caduto dalla torre.", win: false })
      playSound("lose")
      record({ game: "towers", bet, payout: 0, win: false, multiplier: 0 })
      return
    }

    playSound("reveal")
    const cleared = rowIdx + 1
    if (cleared >= ROWS) {
      const payout = Math.round(bet * multiplierAt(ROWS) * 100) / 100
      add(payout)
      setActive(false)
      setCurrentRow(ROWS)
      setMessage({ text: `Cima raggiunta! ${formatCubes(payout)} Cubes!`, win: true })
      playSound("win")
      record({ game: "towers", bet, payout, win: true, multiplier: multiplierAt(ROWS) })
    } else {
      setCurrentRow(cleared)
    }
  }

  function cashout() {
    if (!active || currentRow <= 0) return
    const payout = Math.round(bet * currentMultiplier * 100) / 100
    add(payout)
    setActive(false)
    setMessage({ text: `Incassati ${formatCubes(payout)} Cubes!`, win: true })
    playSound("cashout")
    record({ game: "towers", bet, payout, win: true, multiplier: currentMultiplier })
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <TowerVisual currentRow={currentRow} dead={dead} totalRows={ROWS} />
        <div className="flex-1 space-y-1.5 rounded-lg border border-border bg-background/50 p-3">
        {rows.map((row, i) => {
          // Render top row first (highest index at top).
          const rowIdx = ROWS - 1 - i
          const r = rows[rowIdx]
          const isCurrent = active && rowIdx === currentRow
          const isCleared = rowIdx < currentRow
          const rowMult = multiplierAt(rowIdx + 1)
          return (
            <div key={rowIdx} className="flex items-center gap-2">
              <span className="w-14 shrink-0 text-right font-mono text-xs text-muted-foreground">
                {rowMult.toFixed(2)}×
              </span>
              <div className="grid flex-1 grid-cols-3 gap-2">
                {Array.from({ length: COLS }).map((_, col) => {
                  const revealed = r.picked !== null || dead || (!active && isCleared)
                  const isBomb = r.bombIndex === col
                  const wasPicked = r.picked === col
                  return (
                    <button
                      key={col}
                      type="button"
                      disabled={!isCurrent}
                      onClick={() => pick(col)}
                      className={`grid h-11 place-items-center rounded-sm border text-sm font-bold transition ${
                        isCurrent
                          ? "border-primary/60 bg-primary/10 hover:bg-primary/20"
                          : isCleared || (dead && wasPicked)
                            ? "border-border bg-secondary"
                            : "border-border bg-card opacity-50"
                      }`}
                      aria-label={`Riga ${rowIdx + 1}, colonna ${col + 1}`}
                    >
                      {revealed && (isCleared || dead) ? (
                        isBomb ? (
                          <Bomb className={`size-4 ${wasPicked ? "text-destructive" : "text-muted-foreground"}`} />
                        ) : wasPicked || isCleared ? (
                          <Gem className="size-4 text-primary" />
                        ) : null
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
        <Stat label="Attuale" value={`${currentMultiplier.toFixed(2)}×`} />
        <Stat label="Prossimo" value={`${nextMultiplier.toFixed(2)}×`} />
      </div>

      {active ? (
        <Button
          onClick={cashout}
          disabled={currentRow <= 0}
          size="lg"
          className="w-full font-bold"
        >
          {currentRow <= 0
            ? "Scala una riga per incassare"
            : `Incassa ${formatCubes(Math.round(bet * currentMultiplier * 100) / 100)} Cubes`}
        </Button>
      ) : (
        <>
          <BetInput bet={bet} setBet={setBet} />
          <Button onClick={start} size="lg" className="w-full font-bold">
            Inizia a scalare
          </Button>
        </>
      )}

      {message && (
        <p
          className={`text-center text-sm font-bold ${message.win ? "text-primary" : "text-destructive"}`}
          aria-live="polite"
        >
          {message.text}
        </p>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border bg-card px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-mono text-lg font-bold">{value}</div>
    </div>
  )
}

function TowerVisual({
  currentRow,
  dead,
  totalRows,
}: {
  currentRow: number
  dead: boolean
  totalRows: number
}) {
  return (
    <div className="flex w-16 shrink-0 flex-col items-center justify-end gap-1 rounded-lg border border-border bg-background/50 p-2">
      {Array.from({ length: totalRows }).map((_, i) => {
        // Bottom block is index 0; render from top down.
        const level = totalRows - 1 - i
        const reached = level < currentRow
        const isFlag = level === currentRow && !dead
        return (
          <div key={level} className="relative w-full" style={{ height: 18 }}>
            {isFlag && (
              <span
                aria-hidden
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs"
              >
                <span className="block size-2 rounded-sm bg-primary shadow-[0_0_8px_var(--color-primary)]" />
              </span>
            )}
            <div
              className={`h-full w-full rounded-[3px] border transition-colors ${
                reached
                  ? "border-primary/70 bg-primary/30 shadow-[inset_0_-3px_0_rgba(0,0,0,0.35),0_0_6px_var(--color-primary)]"
                  : "border-border bg-secondary shadow-[inset_0_-3px_0_rgba(0,0,0,0.35)]"
              }`}
            />
          </div>
        )
      })}
      <div className="mt-1 text-[10px] font-bold text-muted-foreground">
        {currentRow}/{totalRows}
      </div>
    </div>
  )
}
