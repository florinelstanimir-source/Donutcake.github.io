import { ShieldCheck, Sparkles, Zap } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(60% 60% at 80% 0%, oklch(0.82 0.22 135 / 0.25), transparent 70%), radial-gradient(50% 50% at 0% 100%, oklch(0.6 0.18 300 / 0.25), transparent 70%)",
        }}
      />
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2 md:py-20">
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles className="size-3.5" />
            Provably Fair
          </span>
          <h1 className="mt-4 text-balance text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
            Costruisci la tua fortuna, <span className="text-primary">blocco</span> dopo blocco.
          </h1>
          <p className="mt-4 max-w-md text-pretty text-muted-foreground md:text-lg">
            L&apos;arcade social a tema voxel. Gioca a Mines, Dice e Coinflip con i tuoi Cubes.
            Solo per divertimento — nessun valore reale, nessun denaro.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <Zap className="size-4 text-accent" /> Partite istantanee
            </span>
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" /> Valuta virtuale
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute inset-0 -z-10 translate-y-4 scale-95 rounded-lg bg-primary/20 blur-2xl" aria-hidden />
          <img
            src="/hero-blocks.png"
            alt="Isola galleggiante fatta di blocchi voxel con cubi, dadi e monete luminose"
            className="w-full rounded-lg border border-border shadow-2xl"
            width={512}
            height={512}
          />
        </div>
      </div>
    </section>
  )
}
