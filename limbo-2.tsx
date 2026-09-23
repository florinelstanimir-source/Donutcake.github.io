"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { formatCubes, useCurrency } from "@/lib/currency"
import { useHistory } from "@/lib/history"
import { playSound } from "@/lib/sound"
import { BetInput } from "./bet-input"

const HOUSE_EDGE = 0.99

export function Limbo() {
  const { add, subtract } = useCurrency()
  const { record } = useHistory()
  const [bet, setBet] = useState(50)
  const [targetInput, setTargetInput] = useState("2.00")
  const [rolling, setRolling] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const [message, setMessage] = useState<{ text: string; win: boolean } | null>(null)

  const target = Math.max(1.01, Math.min(Number(targetInput) || 1.01, 1000))
  const winChance = (100 / target) * HOUSE_EDGE

  function play() {
    if (rolling) return
    if (!subtract(bet)) {
      setMessage({ text: "Cubes insufficienti", win: false })
      playSound("lose")
      return
    }
    setRolling(true)
    setMessage(null)
    playSound("tick")

    // Crash-style random multiplier with house edge.
    const r = Math.random()
    const crash = Math.max(1, Math.floor((HOUSE_EDGE / (1 - r)) * 100) / 100)

    let ticks = 0
    const interval = window.setInterval(() => {
      ticks++
      setResult(1 + Math.random() * Math.min(crash, target * 1.5))
      if (ticks >= 8) {
        window.clearInterval(interval)
        setResult(crash)
        setRolling(false)
        if (crash >= target) {
          const payout = Math.round(bet * target * 100) / 100
          add(payout)
          setMessage({ text: `${crash.toFixed(2)}× · Vinci ${formatCubes(payout)} Cubes!`, win: true })
          playSound("win")
          record({ game: "limbo", bet, payout, win: true, multiplier: target })
        } else {
          setMessage({ text: `${crash.toFixed(2)}× · Sotto la soglia`, win: false })
          playSound("lose")
          record({ game: "limbo", bet, payout: 0, win: false, multiplier: 0 })
        }
      }
    }, 55)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-background/50 p-8 text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Moltiplicatore
        </span>
        <div
          className={`mt-2 font-mono text-6xl font-black tabular-nums ${
            result === null
              ? "text-muted-foreground"
              : result >= target
                ? "text-primary"
                : "text-destructive"
          }`}
        >
          {result === null ? "1.00" : result.toFixed(2)}
          <span className="text-3xl">×</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label
            htmlFor="limbo-target"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Soglia obiettivo
          </label>
          <div className="flex items-center gap-2 rounded-sm border border-border bg-background px-3">
            <input
              id="limbo-target"
              type="number"
              min={1.01}
              step={0.01}
              disabled={rolling}
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              onBlur={() => setTargetInput(target.toFixed(2))}
              className="w-full bg-transparent py-2.5 font-mono text-sm font-bold outline-none disabled:opacity-50"
            />
            <span className="font-mono text-sm font-bold text-muted-foreground">×</span>
          </div>
        </div>
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Probabilità
          </span>
          <div className="rounded-sm border border-border bg-card px-3 py-2.5 font-mono text-sm font-bold">
            {winChance.toFixed(2)}%
          </div>
        </div>
      </div>

      <BetInput bet={bet} setBet={setBet} disabled={rolling} />

      <Button onClick={play} disabled={rolling} size="lg" className="w-full font-bold">
        {rolling ? "Lancio…" : "Lancia il razzo"}
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
  )
}
