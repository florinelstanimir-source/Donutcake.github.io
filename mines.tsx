"use client"

import { useState } from "react"
import { Bomb, Gem } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCubes, useCurrency } from "@/lib/currency"
import { useHistory } from "@/lib/history"
import { playSound } from "@/lib/sound"
import { BetInput } from "./bet-input"

const GRID = 25
const HOUSE_EDGE = 0.99

function buildMines(count: number) {
  const set = new Set<number>()
  while (set.size < count) set.add(Math.floor(Math.random() * GRID))
  return set
}

function multiplierFor(mines: number, picks: number) {
  if (picks === 0) return 1
  const safe = GRID - mines
  let m = 1
  for (let i = 0; i < picks; i++) {
    m *= (GRID - i) / (safe - i)
  }
  return Math.round(m * HOUSE_EDGE * 100) / 100
}

export function Mines() {
  const { add, subtract } = useCurrency()
  const { record } = useHistory()
  const [bet, setBet] = useState(50)
  const [mineCount, setMineCount] = useState(3)
  const [active, setActive] = useState(false)
  const [mines, setMines] = useState<Set<number>>(new Set())
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [exploded, setExploded] = useState<number | null>(null)
  const [message, setMessage] = useState<{ text: string; win: boolean } | null>(null)

  const picks = revealed.size
  const currentMult = multiplierFor(mineCount, picks)
  const nextMult = multiplierFor(mineCount, picks + 1)
  const potential = Math.round(bet * currentMult * 100) / 100

  function start() {
    if (!subtract(bet)) {
      setMessage({ text: "Cubes insufficienti", win: false })
      playSound("lose")
      return
    }
    setMines(buildMines(mineCount))
    setRevealed(new Set())
    setExploded(null)
    setMessage(null)
    setActive(true)
    playSound("click")
  }

  function pick(index: number) {
    if (!active || revealed.has(index)) return
    if (mines.has(index)) {
      setExploded(index)
      setActive(false)
      setMessage({ text: `Boom! Hai perso ${formatCubes(bet)} Cubes`, win: false })
      playSound("lose")
      record({ game: "mines", bet, payout: 0, win: false, multiplier: 0 })
      return
    }
    const next = new Set(revealed)
    next.add(index)
    setRevealed(next)
    playSound("reveal")
    if (next.size === GRID - mineCount) {
      cashOut(next.size)
    }
  }

  function cashOut(count = picks) {
    if (!active || count === 0) return
    const mult = multiplierFor(mineCount, count)
    const payout = Math.round(bet * mult * 100) / 100
    add(payout)
    setActive(false)
    setMessage({ text: `Incassato ${formatCubes(payout)} Cubes!`, win: true })
    playSound("cashout")
    record({ game: "mines", bet, payout, win: true, multiplier: mult })
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_18rem]">
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: GRID }).map((_, i) => {
          const isRevealed = revealed.has(i)
          const isExploded = exploded === i
          const showMine = !active && mines.has(i)
          return (
            <button
              key={i}
              type="button"
              onClick={() => pick(i)}
              disabled={!active || isRevealed}
              aria-label={`Blocco ${i + 1}`}
              className={`grid aspect-square place-items-center rounded-sm border-2 text-xl transition ${
                isExploded
                  ? "border-destructive bg-destructive/25"
                  : isRevealed
                    ? "border-primary/60 bg-primary/15"
                    : showMine
                      ? "border-border bg-destructive/10"
                      : "border-border bg-card enabled:hover:border-primary/50 enabled:hover:bg-secondary"
              } ${active ? "enabled:active:translate-y-0.5" : ""}`}
            >
              {isRevealed && <Gem className="size-5 text-primary" />}
              {(isExploded || showMine) && (
                <Bomb className={`size-5 ${isExploded ? "text-destructive" : "text-muted-foreground"}`} />
              )}
            </button>
          )
        })}
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-sm border border-border bg-card px-3 py-2">
            <div className="text-xs text-muted-foreground">Vincita</div>
            <div className="font-mono text-lg font-bold">{currentMult.toFixed(2)}×</div>
          </div>
          <div className="rounded-sm border border-border bg-card px-3 py-2">
            <div className="text-xs text-muted-foreground">Prossimo</div>
            <div className="font-mono text-lg font-bold text-primary">{nextMult.toFixed(2)}×</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Mine
            </span>
            <span className="font-mono text-sm font-bold">{mineCount}</span>
          </div>
          <input
            type="range"
            min={1}
            max={24}
            value={mineCount}
            disabled={active}
            onChange={(e) => setMineCount(Number(e.target.value))}
            className="w-full cursor-pointer accent-primary disabled:opacity-50"
            aria-label="Numero di mine"
          />
        </div>

        <BetInput bet={bet} setBet={setBet} disabled={active} />

        {active ? (
          <Button onClick={() => cashOut()} disabled={picks === 0} size="lg" className="w-full font-bold">
            Incassa {picks > 0 ? formatCubes(potential) : ""}
          </Button>
        ) : (
          <Button onClick={start} size="lg" className="w-full font-bold">
            Nuova partita
          </Button>
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
    </div>
  )
}
