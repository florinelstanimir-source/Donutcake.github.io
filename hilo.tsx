"use client"

import { useState } from "react"
import { ArrowDown, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCubes, useCurrency } from "@/lib/currency"
import { useHistory } from "@/lib/history"
import { playSound } from "@/lib/sound"
import { BetInput } from "./bet-input"

const HOUSE_EDGE = 0.99
const CARDS = 13 // ranks 1..13

function rankLabel(n: number) {
  if (n === 1) return "A"
  if (n === 11) return "J"
  if (n === 12) return "Q"
  if (n === 13) return "K"
  return String(n)
}

function draw() {
  return Math.floor(Math.random() * CARDS) + 1
}

export function HiLo() {
  const { add, subtract } = useCurrency()
  const { record } = useHistory()
  const [bet, setBet] = useState(50)
  const [card, setCard] = useState(() => draw())
  const [inRound, setInRound] = useState(false)
  const [multiplier, setMultiplier] = useState(1)
  const [message, setMessage] = useState<{ text: string; win: boolean } | null>(null)

  // Probabilities for the next card being >= or <= current (ties count for both).
  const higherOrEqual = (CARDS - card + 1) / CARDS
  const lowerOrEqual = card / CARDS
  const higherMult = higherOrEqual > 0 ? Math.max(1.01, (1 / higherOrEqual) * HOUSE_EDGE) : 0
  const lowerMult = lowerOrEqual > 0 ? Math.max(1.01, (1 / lowerOrEqual) * HOUSE_EDGE) : 0

  function start() {
    if (inRound) return
    if (!subtract(bet)) {
      setMessage({ text: "Cubes insufficienti", win: false })
      playSound("lose")
      return
    }
    setCard(draw())
    setMultiplier(1)
    setInRound(true)
    setMessage(null)
    playSound("click")
  }

  function guess(direction: "higher" | "lower") {
    if (!inRound) return
    const next = draw()
    const correct =
      direction === "higher" ? next >= card : next <= card
    playSound("flip")
    setCard(next)

    if (correct) {
      const step = direction === "higher" ? higherMult : lowerMult
      const newMult = Math.round(multiplier * step * 100) / 100
      setMultiplier(newMult)
      setMessage({ text: `Corretto! Moltiplicatore ${newMult.toFixed(2)}×`, win: true })
      playSound("reveal")
    } else {
      setInRound(false)
      setMessage({ text: `Sbagliato · era ${rankLabel(next)}`, win: false })
      playSound("lose")
      record({ game: "hilo", bet, payout: 0, win: false, multiplier: 0 })
    }
  }

  function cashout() {
    if (!inRound || multiplier <= 1) return
    const payout = Math.round(bet * multiplier * 100) / 100
    add(payout)
    setInRound(false)
    setMessage({ text: `Incassati ${formatCubes(payout)} Cubes!`, win: true })
    playSound("cashout")
    record({ game: "hilo", bet, payout, win: true, multiplier })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center rounded-lg border border-border bg-background/50 p-8">
        <div className="grid size-28 place-items-center rounded-lg border-2 border-primary/40 bg-card shadow-lg">
          <span className="font-mono text-5xl font-black text-foreground">{rankLabel(card)}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat label="Carta" value={rankLabel(card)} />
        <Stat label="Moltiplicatore" value={`${multiplier.toFixed(2)}×`} />
        <Stat label="Vincita" value={formatCubes(Math.round(bet * multiplier * 100) / 100)} />
      </div>

      {inRound ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => guess("higher")}
              variant="secondary"
              size="lg"
              className="h-auto flex-col gap-1 py-4 font-bold"
            >
              <ArrowUp className="size-5 text-primary" />
              Più alto o uguale
              <span className="font-mono text-xs text-muted-foreground">{higherMult.toFixed(2)}×</span>
            </Button>
            <Button
              onClick={() => guess("lower")}
              variant="secondary"
              size="lg"
              className="h-auto flex-col gap-1 py-4 font-bold"
            >
              <ArrowDown className="size-5 text-destructive" />
              Più basso o uguale
              <span className="font-mono text-xs text-muted-foreground">{lowerMult.toFixed(2)}×</span>
            </Button>
          </div>
          <Button
            onClick={cashout}
            disabled={multiplier <= 1}
            size="lg"
            className="w-full font-bold"
          >
            Incassa {formatCubes(Math.round(bet * multiplier * 100) / 100)} Cubes
          </Button>
        </>
      ) : (
        <>
          <BetInput bet={bet} setBet={setBet} />
          <Button onClick={start} size="lg" className="w-full font-bold">
            Distribuisci le carte
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
