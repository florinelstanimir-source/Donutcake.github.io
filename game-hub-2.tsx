"use client"

import { useEffect, useState } from "react"
import { History, Trash2, Volume2, VolumeX, X } from "lucide-react"
import { Coinflip } from "@/components/games/coinflip"
import { Dice } from "@/components/games/dice"
import { HiLo } from "@/components/games/hilo"
import { Limbo } from "@/components/games/limbo"
import { Mines } from "@/components/games/mines"
import { Towers } from "@/components/games/towers"
import { formatCubes } from "@/lib/currency"
import { GAME_LABELS, useHistory, type GameKey } from "@/lib/history"
import { isMuted, setMuted } from "@/lib/sound"

type GameMeta = {
  id: GameKey
  name: string
  tag: string
  description: string
  image: string
  accent: string
}

const GAMES: GameMeta[] = [
  {
    id: "mines",
    name: "Mines",
    tag: "Strategia",
    description: "Scava i blocchi, evita le mine e incassa prima di saltare in aria.",
    image: "/games/mines.png",
    accent: "oklch(0.65 0.2 25 / 0.35)",
  },
  {
    id: "dice",
    name: "Dice",
    tag: "Classico",
    description: "Scegli la soglia, tira e supera il numero per vincere.",
    image: "/games/dice.png",
    accent: "oklch(0.82 0.22 135 / 0.35)",
  },
  {
    id: "coinflip",
    name: "Coinflip",
    tag: "50 / 50",
    description: "Testa o croce in versione voxel. Doppio o niente.",
    image: "/games/coinflip.png",
    accent: "oklch(0.82 0.19 85 / 0.35)",
  },
  {
    id: "towers",
    name: "Towers",
    tag: "Scalata",
    description: "Sali di riga in riga scegliendo i blocchi sicuri. Più sali, più vinci.",
    image: "/games/towers.png",
    accent: "oklch(0.82 0.22 145 / 0.35)",
  },
  {
    id: "hilo",
    name: "HiLo",
    tag: "Carte",
    description: "Più alto o più basso? Indovina la carta e accumula il moltiplicatore.",
    image: "/games/hilo.png",
    accent: "oklch(0.7 0.18 55 / 0.35)",
  },
  {
    id: "limbo",
    name: "Limbo",
    tag: "Rischio",
    description: "Imposta la soglia e spera che il razzo la superi prima di schiantarsi.",
    image: "/games/limbo.png",
    accent: "oklch(0.6 0.2 300 / 0.35)",
  },
]

export function GameHub() {
  const [active, setActive] = useState<GameKey | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [muted, setMutedState] = useState(false)

  useEffect(() => {
    setMutedState(isMuted())
  }, [])

  function toggleMute() {
    const next = !muted
    setMutedState(next)
    setMuted(next)
  }

  return (
    <section id="games" className="mx-auto max-w-6xl px-4 py-14 md:py-20">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight md:text-3xl">Scegli il tuo gioco</h2>
          <p className="mt-1 text-muted-foreground">Sei modi per mettere alla prova la fortuna.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 rounded-sm border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground transition hover:bg-secondary"
          >
            <History className="size-3.5" />
            Cronologia
          </button>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Attiva audio" : "Disattiva audio"}
            className="grid size-8 place-items-center rounded-sm border border-border bg-card text-foreground transition hover:bg-secondary"
          >
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-6">
        {GAMES.map((game) => (
          <button
            key={game.id}
            type="button"
            onClick={() => setActive(game.id)}
            title={game.description}
            className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card text-center transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
          >
            <div
              className="relative flex aspect-square items-center justify-center overflow-hidden"
              style={{ background: `radial-gradient(70% 70% at 50% 40%, ${game.accent}, transparent 75%)` }}
            >
              <img
                src={game.image || "/placeholder.svg"}
                alt={`Icona del gioco ${game.name}`}
                className="size-16 object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-110 md:size-20"
                width={96}
                height={96}
              />
            </div>
            <div className="flex flex-col gap-0.5 border-t border-border px-2 py-2.5">
              <span className="text-sm font-black leading-tight">{game.name}</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{game.tag}</span>
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Gioco ${GAME_LABELS[active]}`}
          onClick={() => setActive(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl border border-border bg-popover p-5 shadow-2xl sm:rounded-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-black tracking-tight">{GAME_LABELS[active]}</h3>
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Chiudi"
                className="grid size-9 place-items-center rounded-sm border border-border bg-card transition hover:bg-secondary"
              >
                <X className="size-4" />
              </button>
            </div>
            {active === "mines" && <Mines />}
            {active === "dice" && <Dice />}
            {active === "coinflip" && <Coinflip />}
            {active === "towers" && <Towers />}
            {active === "hilo" && <HiLo />}
            {active === "limbo" && <Limbo />}
          </div>
        </div>
      )}

      {showHistory && <HistoryPanel onClose={() => setShowHistory(false)} />}
    </section>
  )
}

function HistoryPanel({ onClose }: { onClose: () => void }) {
  const { entries, clear } = useHistory()

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Cronologia delle giocate"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-border bg-popover shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <h3 className="flex items-center gap-2 text-xl font-black tracking-tight">
            <History className="size-5 text-primary" />
            Cronologia
          </h3>
          <div className="flex items-center gap-2">
            {entries.length > 0 && (
              <button
                type="button"
                onClick={clear}
                className="flex items-center gap-1.5 rounded-sm border border-border bg-card px-2.5 py-1.5 text-xs font-bold text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              >
                <Trash2 className="size-3.5" />
                Svuota
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Chiudi"
              className="grid size-9 place-items-center rounded-sm border border-border bg-card transition hover:bg-secondary"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-3">
          {entries.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-muted-foreground">
              Nessuna giocata ancora. Gioca una partita per iniziare!
            </p>
          ) : (
            <ul className="space-y-1.5">
              {entries.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between gap-3 rounded-sm border border-border bg-card px-3 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`size-2 shrink-0 rounded-[2px] ${e.win ? "bg-primary" : "bg-destructive"}`}
                      aria-hidden
                    />
                    <div>
                      <div className="text-sm font-bold">{GAME_LABELS[e.game]}</div>
                      <div className="font-mono text-xs text-muted-foreground">
                        Punt. {formatCubes(e.bet)}
                        {e.win && e.multiplier > 0 ? ` · ${e.multiplier.toFixed(2)}×` : ""}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`font-mono text-sm font-bold ${e.win ? "text-primary" : "text-destructive"}`}
                  >
                    {e.win ? `+${formatCubes(e.payout - e.bet)}` : `-${formatCubes(e.bet)}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
