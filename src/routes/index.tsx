import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { GemList } from "@/components/gem-list";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/format";
import { scanMarket } from "@/lib/scanner/actions";
import type { Gem } from "@/lib/scanner/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  loader: () => scanMarket(),
  component: Home,
});

type View = "gems" | "crime" | "caught" | "cheap";

function Home() {
  const initial = Route.useLoaderData();
  const scan = useQuery({
    queryKey: ["scan"],
    queryFn: () => scanMarket(),
    initialData: initial,
    refetchInterval: 20_000,
    refetchIntervalInBackground: true,
  });
  const [view, setView] = useState<View>("gems");
  const [q, setQ] = useState("");

  const data = scan.data;
  const list = useMemo(() => {
    let rows: Gem[] = data?.gems ?? [];
    if (view === "crime") rows = data?.crime ?? [];
    if (view === "caught") rows = data?.caughtEarly ?? [];
    if (view === "cheap") {
      rows = (data?.gems ?? []).filter((g) => g.price > 0 && g.price <= 0.12);
    }
    const query = q.trim().toLowerCase();
    if (query) {
      rows = rows.filter(
        (g) =>
          g.symbol.toLowerCase().includes(query) ||
          g.name.toLowerCase().includes(query),
      );
    }
    return rows;
  }, [data, view, q]);

  return (
    <AppShell live={Boolean(data) && !data.error}>
      <section className="mb-8 sm:mb-10">
        <p className="mb-2 text-xs uppercase tracking-[0.18em] text-muted">
          Binance gem radar
        </p>
        <h1 className="font-display text-3xl leading-tight tracking-tight sm:text-5xl">
          Catch the $0.01 names
          <br className="hidden sm:block" /> before they run.
        </h1>
        <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted sm:text-base">
          Scout watches Binance Alpha, spot, and perps every 20 seconds. It
          ranks low-price coins with expanding volume — the same shape as early
          MYX, LAB, COAI, RAVE, and AKE — and tracks them from first detection.
        </p>
      </section>

      <StatsBar
        loading={scan.isLoading}
        universe={data?.stats.universe}
        heating={data?.stats.heating}
        launching={data?.stats.launching}
        mooning={data?.stats.mooning}
        scannedAt={data?.scannedAt}
        stale={data?.stale}
        error={data?.error ?? (scan.isError ? "Radar feed paused" : null)}
      />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {(
            [
              ["gems", "Early gems"],
              ["cheap", "Under $0.12"],
              ["crime", "Crime tape"],
              ["caught", "Caught early"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              className={cn(
                "h-11 shrink-0 rounded-full px-4 text-sm transition-colors duration-150",
                view === id
                  ? "bg-accent text-accent-fg"
                  : "text-muted hover:bg-elevated hover:text-fg",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="relative block w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search symbol"
            className="pl-9"
            aria-label="Search symbol"
          />
        </label>
      </div>

      <div className="mt-4">
        {scan.isLoading ? <ListSkeleton /> : <GemList gems={list} />}
      </div>
    </AppShell>
  );
}

function StatsBar({
  loading,
  universe,
  heating,
  launching,
  mooning,
  scannedAt,
  stale,
  error,
}: {
  loading: boolean;
  universe?: number;
  heating?: number;
  launching?: number;
  mooning?: number;
  scannedAt?: string;
  stale?: boolean;
  error?: string | null;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  const items = [
    { label: "Universe", value: universe?.toLocaleString() ?? "—" },
    { label: "Heating", value: String(heating ?? 0) },
    { label: "Launching", value: String(launching ?? 0) },
    { label: "Mooning", value: String(mooning ?? 0) },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-xl bg-surface px-4 py-3 shadow-[var(--shadow-border)]"
          >
            <p className="text-xs text-muted">{item.label}</p>
            <p className="mt-1 font-mono text-xl tabular-nums tracking-tight">
              {item.value}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-subtle">
        {error ? (
          <span className="text-heat">{error}. Showing last known tape.</span>
        ) : stale ? (
          "Feed delayed — last snapshot held."
        ) : (
          <>Last sweep {timeAgo(scannedAt ?? null)} · Alpha + spot + perps</>
        )}
      </p>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-px overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-4">
          <Skeleton className="size-10 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}
