import { getSql } from "@/lib/db";
import { shouldPersist } from "./score";
import type { Gem } from "./types";

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

type GemRow = {
  symbol: string;
  name: string;
  pair: string;
  venue: string;
  first_seen_at: string;
  first_price: string | number;
  last_price: string | number;
  high_since_detect: string | number;
  last_score: number;
  last_crime_risk: number;
  last_change_24h: string | number;
  last_quote_volume: string | number;
  last_market_cap: string | number;
  last_status: string;
  reasons: string;
  updated_at: string;
};

type SnapRow = {
  price: string | number;
  quote_volume: string | number;
  change_24h: string | number;
  score: number;
  crime_risk: number;
  captured_at: string;
};

function applyTrack(gem: Gem, row: GemRow): Gem {
  const firstPrice = num(row.first_price);
  return {
    ...gem,
    firstSeenAt: row.first_seen_at,
    firstPrice,
    highSinceDetect: num(row.high_since_detect),
  };
}

export async function persistAndMerge(gems: Gem[]): Promise<Gem[]> {
  const sql = await getSql();
  const keep = gems.filter(shouldPersist).slice(0, 40);

  for (const gem of keep) {
    const venue = gem.venues.includes("alpha") ? "alpha" : gem.venues[0] ?? "spot";
    await sql`
      insert into gems (
        symbol, name, pair, venue, first_price, last_price, high_since_detect,
        last_score, last_crime_risk, last_change_24h, last_quote_volume,
        last_market_cap, last_status, reasons, updated_at
      ) values (
        ${gem.symbol}, ${gem.name}, ${gem.pair}, ${venue}, ${gem.price}, ${gem.price},
        ${gem.price}, ${gem.score}, ${gem.crimeRisk}, ${gem.change24h}, ${gem.volume24h},
        ${gem.marketCap}, ${gem.status}, ${gem.reasons.join(" · ")}, now()
      )
      on conflict (symbol) do update set
        name = excluded.name,
        pair = excluded.pair,
        venue = excluded.venue,
        last_price = excluded.last_price,
        high_since_detect = greatest(gems.high_since_detect, excluded.last_price),
        last_score = excluded.last_score,
        last_crime_risk = excluded.last_crime_risk,
        last_change_24h = excluded.last_change_24h,
        last_quote_volume = excluded.last_quote_volume,
        last_market_cap = excluded.last_market_cap,
        last_status = excluded.last_status,
        reasons = excluded.reasons,
        updated_at = now()
    `;
  }

  if (keep.length > 0) {
    const latest = await sql.query<{ symbol: string; last_at: string }>(
      `select symbol, max(captured_at)::text as last_at from gem_snapshots group by symbol`,
    );
    const lastMap = new Map(latest.map((r) => [r.symbol, new Date(r.last_at).getTime()]));
    const cutoff = Date.now() - 120_000;
    for (const gem of keep) {
      const last = lastMap.get(gem.symbol) ?? 0;
      if (last > cutoff) continue;
      await sql`
        insert into gem_snapshots (symbol, price, quote_volume, change_24h, score, crime_risk)
        values (${gem.symbol}, ${gem.price}, ${gem.volume24h}, ${gem.change24h}, ${gem.score}, ${gem.crimeRisk})
      `;
    }
  }

  const tracked = await sql<GemRow>`
    select symbol, name, pair, venue, first_seen_at::text as first_seen_at,
           first_price, last_price, high_since_detect, last_score, last_crime_risk,
           last_change_24h, last_quote_volume, last_market_cap, last_status, reasons,
           updated_at::text as updated_at
    from gems
  `;
  const bySymbol = new Map(tracked.map((r) => [r.symbol, r]));
  return gems.map((gem) => {
    const row = bySymbol.get(gem.symbol);
    return row ? applyTrack(gem, row) : gem;
  });
}

export async function loadCaughtEarly(live: Gem[]): Promise<Gem[]> {
  const sql = await getSql();
  const rows = await sql<GemRow>`
    select symbol, name, pair, venue, first_seen_at::text as first_seen_at,
           first_price, last_price, high_since_detect, last_score, last_crime_risk,
           last_change_24h, last_quote_volume, last_market_cap, last_status, reasons,
           updated_at::text as updated_at
    from gems
    order by first_seen_at desc
    limit 12
  `;
  const liveMap = new Map(live.map((g) => [g.symbol, g]));
  return rows.map((row) => {
    const liveGem = liveMap.get(row.symbol);
    if (liveGem) return applyTrack(liveGem, row);
    return {
      id: `db-${row.symbol}`,
      symbol: row.symbol,
      name: row.name,
      pair: row.pair,
      iconUrl: null,
      price: num(row.last_price),
      change24h: num(row.last_change_24h),
      volume24h: num(row.last_quote_volume),
      marketCap: num(row.last_market_cap),
      fdv: 0,
      liquidity: 0,
      holders: 0,
      circSupply: 0,
      totalSupply: 0,
      listingTime: null,
      listingAgeDays: null,
      listingCex: row.venue !== "alpha",
      hotTag: false,
      alphaId: null,
      contractAddress: null,
      chainName: null,
      venues: [row.venue === "spot" ? "spot" : "alpha"],
      score: num(row.last_score),
      crimeRisk: num(row.last_crime_risk),
      status: (row.last_status as Gem["status"]) || "heating",
      reasons: row.reasons ? row.reasons.split(" · ") : [],
      riskFlags: [],
      fundingRate: null,
      perpVolume24h: null,
      spotVolume24h: null,
      high24h: 0,
      low24h: 0,
      turnover: 0,
      floatRatio: 0,
      firstSeenAt: row.first_seen_at,
      firstPrice: num(row.first_price),
      highSinceDetect: num(row.high_since_detect),
    } satisfies Gem;
  });
}

export async function loadSnapshots(symbol: string) {
  const sql = await getSql();
  const rows = await sql<SnapRow>`
    select price, quote_volume, change_24h, score, crime_risk,
           captured_at::text as captured_at
    from gem_snapshots
    where symbol = ${symbol.toUpperCase()}
    order by captured_at asc
    limit 240
  `;
  return rows.map((r) => ({
    price: num(r.price),
    quoteVolume: num(r.quote_volume),
    change24h: num(r.change_24h),
    score: num(r.score),
    crimeRisk: num(r.crime_risk),
    capturedAt: r.captured_at,
  }));
}

export async function loadGemRow(symbol: string): Promise<GemRow | null> {
  const sql = await getSql();
  const rows = await sql<GemRow>`
    select symbol, name, pair, venue, first_seen_at::text as first_seen_at,
           first_price, last_price, high_since_detect, last_score, last_crime_risk,
           last_change_24h, last_quote_volume, last_market_cap, last_status, reasons,
           updated_at::text as updated_at
    from gems
    where symbol = ${symbol.toUpperCase()}
    limit 1
  `;
  return rows[0] ?? null;
}
