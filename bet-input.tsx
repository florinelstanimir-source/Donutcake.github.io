"use client"

import { formatCubes, useCurrency } from "@/lib/currency"

type BetInputProps = {
  bet: number
  setBet: (value: number) => void
  disabled?: boolean
}

export function BetInput({ bet, setBet, disabled }: BetInputProps) {
  const { balance } = useCurrency()

  const clamp = (value: number) =>
    Math.max(1, Math.min(Math.floor(value || 0), Math.max(1, Math.floor(balance))))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="bet-amount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Puntata
        </label>
        <span className="text-xs text-muted-foreground">
          Saldo: <span className="font-mono text-foreground">{formatCubes(balance)}</span>
        </span>
      </div>
      <div className="flex items-stretch gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-sm border border-border bg-background px-3">
          <span className="size-3.5 rounded-[3px] bg-accent" aria-hidden />
          <input
            id="bet-amount"
            type="number"
            inputMode="numeric"
            min={1}
            disabled={disabled}
            value={bet}
            onChange={(e) => setBet(clamp(Number(e.target.value)))}
            className="w-full bg-transparent py-2.5 font-mono text-sm font-bold outline-none disabled:opacity-50"
          />
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setBet(clamp(Math.ceil(bet / 2)))}
          className="rounded-sm border border-border bg-secondary px-3 text-xs font-bold text-secondary-foreground transition hover:bg-secondary/70 disabled:opacity-50"
        >
          ½
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setBet(clamp(bet * 2))}
          className="rounded-sm border border-border bg-secondary px-3 text-xs font-bold text-secondary-foreground transition hover:bg-secondary/70 disabled:opacity-50"
        >
          2×
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setBet(clamp(balance))}
          className="rounded-sm border border-border bg-secondary px-3 text-xs font-bold text-secondary-foreground transition hover:bg-secondary/70 disabled:opacity-50"
        >
          Max
        </button>
      </div>
    </div>
  )
}
