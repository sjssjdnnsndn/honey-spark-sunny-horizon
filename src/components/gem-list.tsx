import { Link } from "@tanstack/react-router";
import { formatAge, formatPct, formatPrice, formatUsd } from "@/lib/format";
import type { Gem } from "@/lib/scanner/types";
import { cn } from "@/lib/utils";
import { ScoreBar } from "./score-bar";
import { StatusPill } from "./status-pill";
import { TokenMark } from "./token-mark";
import { WatchButton } from "./watch-button";

export function GemList({ gems }: { gems: Gem[] }) {
  if (gems.length === 0) {
    return (
      <div className="rounded-xl bg-surface px-4 py-12 text-center shadow-[var(--shadow-border)]">
        <p className="text-sm text-muted">No names match this filter right now.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
      <div className="hidden grid-cols-[1.4fr_0.9fr_0.7fr_0.8fr_0.7fr_0.8fr_0.9fr_0.7fr_44px] gap-2 px-4 py-3 text-[0.6875rem] uppercase tracking-wider text-subtle md:grid">
        <span>Token</span>
        <span className="text-right">Price</span>
        <span className="text-right">24h</span>
        <span className="text-right">Volume</span>
        <span className="text-right">Cap</span>
        <span>Score</span>
        <span>Risk</span>
        <span>Status</span>
        <span />
      </div>
      <ul>
        {gems.map((gem) => (
          <li key={gem.id} className="border-t border-border">
            <GemRow gem={gem} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function GemRow({ gem }: { gem: Gem }) {
  const up = gem.change24h >= 0;
  const multiple =
    gem.firstPrice && gem.firstPrice > 0 ? gem.price / gem.firstPrice : null;
  const isNew =
    gem.firstSeenAt &&
    Date.now() - new Date(gem.firstSeenAt).getTime() < 15 * 60_000;

  return (
    <div className="group relative flex items-stretch">
      <Link
        to="/gem/$symbol"
        params={{ symbol: gem.symbol }}
        className="grid min-h-16 flex-1 grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 md:grid-cols-[1.4fr_0.9fr_0.7fr_0.8fr_0.7fr_0.8fr_0.9fr_0.7fr] md:gap-2"
      >
        <div className="flex items-center gap-3">
          <TokenMark symbol={gem.symbol} iconUrl={gem.iconUrl} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium tracking-tight">{gem.symbol}</span>
              {isNew ? (
                <span className="text-[0.65rem] uppercase tracking-wider text-accent">
                  New
                </span>
              ) : null}
            </div>
            <p className="truncate text-xs text-muted">
              {gem.name}
              {gem.venues.includes("alpha") ? " · Alpha" : ""}
              {gem.listingCex ? " · CEX" : ""}
              {gem.listingAgeDays != null ? ` · ${formatAge(gem.listingAgeDays)}` : ""}
            </p>
          </div>
        </div>

        <div className="text-right md:contents">
          <div className="md:text-right">
            <p className="font-mono text-sm tabular-nums">${formatPrice(gem.price)}</p>
            <p className="text-xs text-muted md:hidden">
              {formatUsd(gem.volume24h)} vol
            </p>
          </div>
          <p
            className={cn(
              "hidden font-mono text-sm tabular-nums md:block md:text-right",
              up ? "text-up" : "text-down",
            )}
          >
            {formatPct(gem.change24h)}
          </p>
          <p className="hidden font-mono text-sm tabular-nums text-fg md:block md:text-right">
            {formatUsd(gem.volume24h)}
          </p>
          <p className="hidden font-mono text-sm tabular-nums text-muted md:block md:text-right">
            {formatUsd(gem.marketCap)}
          </p>
          <div className="hidden md:block">
            <ScoreBar value={gem.score} tone="accent" />
          </div>
          <div className="hidden md:block">
            <ScoreBar value={gem.crimeRisk} tone="warn" />
          </div>
          <div className="hidden md:flex md:justify-start">
            <StatusPill status={gem.status} />
          </div>
        </div>

        <div className="col-span-2 flex items-center justify-between gap-3 md:hidden">
          <p className={cn("font-mono text-xs tabular-nums", up ? "text-up" : "text-down")}>
            {formatPct(gem.change24h)}
            {multiple && multiple >= 1.04 ? ` · ${multiple.toFixed(2)}x since catch` : ""}
          </p>
          <StatusPill status={gem.status} />
        </div>
      </Link>
      <div className="flex items-center pr-1">
        <WatchButton symbol={gem.symbol} />
      </div>
    </div>
  );
}
