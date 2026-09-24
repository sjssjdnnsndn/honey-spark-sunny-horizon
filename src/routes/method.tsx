import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/method")({
  component: MethodPage,
});

const BLOCKS = [
  {
    title: "What Scout watches",
    body: "Every 20 seconds Scout pulls the public Binance Alpha token list, Binance spot 24h tickers, and USDT-M perpetual volume plus funding. Alpha is where names like MYX, LAB, COAI, RAVE, and AKE first printed cheap and thin. Spot and perps tell us when the same ticker graduates onto the main board or gets squeezed in futures.",
  },
  {
    title: "The early-gem shape",
    body: "High scores cluster around a sticker price still in the $0.01–$1 zone, a market cap with 10x room, expanding 24h volume, and turnover that looks like a real bid — not a dead book. Fresh Alpha listings get a lift. Older Alpha names that suddenly wake up with volume get a lift too; that revival-squeeze is how several of the 2025–26 runners started their second leg.",
  },
  {
    title: "Crime-pump tape",
    body: "The same board that prints moons also prints traps. Scout flags wash-like volume with no price change, turnover many times the cap, violent 24h ranges, extreme funding, and “cheap” prices that hide a huge supply. A high crime score is not a buy signal. It is the fingerprint of a tape that can run vertically — and unwind just as fast.",
  },
  {
    title: "Progress, not a prediction",
    body: "When a name clears the bar it is saved. Later sweeps compare live price to the first print, so you can see whether Scout caught it at $0.04 or already at $0.40. That log is shared. Your watchlist stays on this device. Scout cannot see wallets, insider supply, or tomorrow’s listing. It can only read the public tape and keep watching it.",
  },
];

function MethodPage() {
  return (
    <AppShell>
      <h1 className="font-display text-3xl tracking-tight">Method</h1>
      <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted sm:text-base">
        Scout is a live radar, not a crystal ball. It is built to surface the
        setup early — and to show the risk that usually travels with it.
      </p>
      <div className="mt-10 space-y-8">
        {BLOCKS.map((b) => (
          <section key={b.title} className="max-w-2xl">
            <h2 className="text-lg tracking-tight">{b.title}</h2>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-muted">
              {b.body}
            </p>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
