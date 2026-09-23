"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { formatCubes, useCurrency } from "@/lib/currency"
import { useHistory } from "@/lib/history"
import { playSound } from "@/lib/sound"
import { BetInput } from "./bet-input"

type Side = "cubes" | "shards"

export function Coinflip() {
  const { add, subtract } = useCurrency()
  const { record } = useHistory()
  const [bet, setBet] = useState(50)
  const [pick, setPick] = useState<Side>("cubes")
  const [flipping, setFlipping] = useState(false)
  const [result, setResult] = useState<Side | null>(null)
  const [message, setMessage] = useState<{ text: string; win: boolean } | null>(null)

  function flip() {
    if (flipping) return
    if (!subtract(bet)) {
      setMessage({ text: "Cubes insufficienti", win: false })
      playSound("lose")
      return
    }
    setFlipping(true)
    setMessage(null)
    playSound("flip")
    const outcome: Side = Math.random() < 0.5 ? "cubes" : "shards"
    window.setTimeout(() => {
      setResult(outcome)
      setFlipping(false)
      if (outcome === pick) {
        const payout = bet * 2
        add(payout)
        setMessage({ text: `Vinci ${formatCubes(payout)} Cubes!`, win: true })
        playSound("win")
        record({ game: "coinflip", bet, payout, win: true, multiplier: 2 })
      } else {
        setMessage({ text: `Peccato! Uscito ${outcome === "cubes" ? "Cubes" : "Shards"}`, win: false })
        playSound("lose")
        record({ game: "coinflip", bet, payout: 0, win: false, multiplier: 0 })
      }
    }, 1100)
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="flex flex-col items-center justify-center gap-6 rounded-lg border border-border bg-background/50 p-8">
        <div
          className="grid size-32 place-items-center rounded-md text-2xl font-black transition-transform duration-1000"
          style={{
            transform: flipping ? "rotateY(1440deg)" : "rotateY(0deg)",
            transformStyle: "preserve-3d",
            background:
              result === "shards"
                ? "linear-gradient(135deg, oklch(0.6 0.18 300), oklch(0.4 0.12 300))"
                : "linear-gradient(135deg, oklch(0.82 0.19 85), oklch(0.6 0.16 70))",
            boxShadow: "0 8px 0 0 rgba(0,0,0,0.35)",
            color: "oklch(0.2 0.03 90)",
          }}
          aria-hidden
        >
          {result === "shards" ? "◈" : "▣"}
        </div>
        <p className="text-sm text-muted-foreground">Probabilità 50 / 50 · Vincita 2×</p>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          {(["cubes", "shards"] as const).map((side) => (
            <button
              key={side}
              type="button"
              onClick={() => setPick(side)}
              disabled={flipping}
              className={`rounded-sm border-2 px-4 py-4 text-sm font-bold capitalize transition disabled:opacity-50 ${
                pick === side
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-muted-foreground/40"
              }`}
            >
              {side === "cubes" ? "▣ Cubes" : "◈ Shards"}
            </button>
          ))}
        </div>

        <BetInput bet={bet} setBet={setBet} disabled={flipping} />

        <Button onClick={flip} disabled={flipping} size="lg" className="w-full font-bold">
          {flipping ? "Lancio in corso…" : "Lancia la moneta"}
        </Button>

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
