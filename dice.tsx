"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { formatCubes, useCurrency } from "@/lib/currency"
import { BetInput } from "./bet-input"

const HOUSE_EDGE = 0.99

export function Dice() {
  const { add, subtract } = useCurrency()
  const [bet, setBet] = useState(50)
  const [target, setTarget] = useState(50)
  const [rolling, setRolling] = useState(false)
  const [roll, setRoll] = useState<number | null>(null)
  const [message, setMessage] = useState<{ text: string; win: boolean } | null>(null)

  const winChance = 100 - target
  const multiplier = winChance > 0 ? (100 / winChance) * HOUSE_EDGE : 0

  function play() {
    if (rolling) return
    if (winChance <= 0) return
    if (!subtract(bet)) {
      setMessage({ text: "Cubes insufficienti", win: false })
      return
    }
    setRolling(true)
    setMessage(null)
    const outcome = Math.round(Math.random() * 10000) / 100
    window.setTimeout(() => {
      setRoll(outcome)
      setRolling(false)
      if (outcome > target) {
        const payout = Math.round(bet * multiplier * 100) / 100
        add(payout)
        setMessage({ text: `${outcome.toFixed(2)} · Vinci ${formatCubes(payout)} Cubes!`, win: true })
      } else {
        setMessage({ text: `${outcome.toFixed(2)} · Troppo basso`, win: false })
      }
    }, 500)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-background/50 p-6">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Risultato
          </span>
          <span
            className={`font-mono text-3xl font-black tabular-nums ${
              roll === null ? "text-muted-foreground" : roll > target ? "text-primary" : "text-destructive"
            }`}
          >
            {rolling ? "··.··" : roll === null ? "00.00" : roll.toFixed(2)}
          </span>
        </div>

        <div className="relative mt-6 h-3 rounded-full bg-destructive/40">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary/70"
            style={{ left: `${target}%`, right: 0 }}
          />
          <input
            type="range"
            min={2}
            max={98}
            value={target}
            disabled={rolling}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="absolute inset-x-0 -top-2 h-7 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:size-7 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-foreground"
            aria-label="Soglia di vincita"
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>Tira sopra {target}</span>
          <span>100</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-3">
        <Stat label="Vincita" value={`${multiplier.toFixed(2)}×`} />
        <Stat label="Probabilità" value={`${winChance.toFixed(0)}%`} />
        <Stat label="Soglia" value={target.toFixed(0)} className="col-span-2 sm:col-span-1" />
      </div>

      <BetInput bet={bet} setBet={setBet} disabled={rolling} />

      <Button onClick={play} disabled={rolling} size="lg" className="w-full font-bold">
        {rolling ? "Lancio…" : "Tira i dadi"}
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

function Stat({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`rounded-sm border border-border bg-card px-3 py-2 ${className}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-mono text-lg font-bold">{value}</div>
    </div>
  )
}
