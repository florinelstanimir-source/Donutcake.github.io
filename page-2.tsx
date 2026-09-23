import { GameHub } from "@/components/game-hub"
import { SiteHeader } from "@/components/site-header"
import { CurrencyProvider } from "@/lib/currency"
import { HistoryProvider } from "@/lib/history"

export default function Page() {
  return (
    <CurrencyProvider>
      <HistoryProvider>
      <div id="top" className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <main>
          <GameHub />
        </main>
        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground">
            <p className="font-bold text-foreground">BLOCKFLIP</p>
            <p className="max-w-2xl text-pretty">
              Piattaforma di intrattenimento con valuta virtuale &quot;Cubes&quot; priva di valore reale.
              Nessun gioco d&apos;azzardo con denaro vero. Non affiliata ad alcun marchio o gioco esistente.
            </p>
            <p className="text-xs">© {new Date().getFullYear()} BLOCKFLIP. Solo per divertimento.</p>
          </div>
        </footer>
      </div>
      </HistoryProvider>
    </CurrencyProvider>
  )
}
