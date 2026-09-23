"use client"

import { Boxes, Plus, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCubes, useCurrency } from "@/lib/currency"

export function SiteHeader() {
  const { balance, ready, add, reset } = useCurrency()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <a href="#top" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-sm bg-primary text-primary-foreground shadow-[0_4px_0_0] shadow-primary/40">
            <Boxes className="size-5" />
          </span>
          <span className="text-lg font-black tracking-tight">
            BLOCK<span className="text-primary">FLIP</span>
          </span>
        </a>

        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="flex items-center gap-2 rounded-sm border border-border bg-card px-3 py-2"
            aria-live="polite"
          >
            <span className="size-4 rounded-[3px] bg-accent shadow-[inset_0_0_0_2px] shadow-black/20" aria-hidden />
            <span className="font-mono text-sm font-bold tabular-nums">
              {ready ? formatCubes(balance) : "—"}
            </span>
            <span className="text-xs font-medium text-muted-foreground">Cubes</span>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => add(500)}
            className="gap-1.5"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Ricarica</span>
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={reset}
            aria-label="Reimposta saldo"
            title="Reimposta saldo"
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
