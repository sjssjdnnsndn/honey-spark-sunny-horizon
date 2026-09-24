import { isLeveragedSpot, isTradableAlpha, scoreMarket, type RawMarket } from "./score";
import type { Candle, Gem, ScanResult } from "./types";

const ALPHA_LIST =
  "https://www.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/cex/alpha/all/token/list";
const ALPHA_KLINES = "https://www.binance.com/bapi/defi/v1/public/alpha-trade/klines";
const SPOT_TICKER = "https://api.binance.com/api/v3/ticker/24hr";
const FUT_TICKER = "https://fapi.binance.com/fapi/v1/ticker/24hr";
const FUT_PREMIUM = "https://fapi.binance.com/fapi/v1/premiumIndex";
const SPOT_KLINES = "https://api.binance.com/api/v3/klines";

const SCAN_TTL_MS = 20_000;
const BROWSER_HEADERS = {
  Accept: "application/json,text/plain,*/*",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  Origin: "https://www.binance.com",
  Referer: "https://www.binance.com/",
};

type CacheBox<T> = { at: number; value: T };

const g = globalThis as typeof globalThis & {
  __scoutScan__?: CacheBox<ScanResult>;
  __scoutAlpha__?: CacheBox<AlphaToken[]>;
};

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

async function fetchJson<T>(url: string, timeout = 12_000): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: BROWSER_HEADERS });
    if (!res.ok) throw new Error(`Feed ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

type AlphaToken = {
  tokenId?: string;
  alphaId?: string;
  symbol?: string;
  name?: string;
  iconUrl?: string;
  chainId?: string;
  price?: string | number;
  percentChange24h?: string | number;
  volume24h?: string | number;
  marketCap?: string | number;
  fdv?: string | number;
  liquidity?: string | number;
  holders?: string | number;
  circulatingSupply?: string | number;
  totalSupply?: string | number;
  listingTime?: string | number;
  listingCex?: boolean;
  hotTag?: boolean;
  fullyDelisted?: boolean;
  offline?: boolean;
  offsell?: boolean;
  contractAddress?: string;
  chainName?: string;
  priceHigh24h?: string | number;
  priceLow24h?: string | number;
  cexCoinName?: string;
};

type SpotTicker = {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  quoteVolume: string;
  volume: string;
  highPrice: string;
  lowPrice: string;
  count: number;
};

type FutTicker = {
  symbol: string;
  quoteVolume: string;
  lastPrice: string;
  priceChangePercent: string;
};

type Premium = {
  symbol: string;
  lastFundingRate: string;
};

async function loadAlpha(): Promise<AlphaToken[]> {
  const hit = g.__scoutAlpha__;
  if (hit && Date.now() - hit.at < SCAN_TTL_MS) return hit.value;
  const body = await fetchJson<{ data?: AlphaToken[] }>(ALPHA_LIST);
  const rows = Array.isArray(body.data) ? body.data : [];
  g.__scoutAlpha__ = { at: Date.now(), value: rows };
  return rows;
}

function alphaToRaw(
  t: AlphaToken,
  perps: Map<string, { volume: number; funding: number | null }>,
  spot: Map<string, SpotTicker>,
): RawMarket | null {
  if (!isTradableAlpha(t)) return null;
  const symbol = String(t.symbol ?? "").trim();
  if (!symbol) return null;
  const price = num(t.price);
  if (price <= 0) return null;
  const key = symbol.toUpperCase();
  const spotRow = spot.get(`${key}USDT`) ?? (t.cexCoinName ? spot.get(`${t.cexCoinName.toUpperCase()}USDT`) : undefined);
  const perp = perps.get(`${key}USDT`);
  const venues: RawMarket["venues"] = ["alpha"];
  if (spotRow) venues.push("spot");
  if (perp && perp.volume > 0) venues.push("perp");

  return {
    id: String(t.tokenId || `${key}-${t.chainId || "alpha"}`),
    symbol: key,
    name: String(t.name || symbol),
    pair: `${key}USDT`,
    iconUrl: t.iconUrl || null,
    price,
    change24h: num(t.percentChange24h),
    volume24h: num(t.volume24h),
    marketCap: num(t.marketCap),
    fdv: num(t.fdv),
    liquidity: num(t.liquidity),
    holders: num(t.holders),
    circSupply: num(t.circulatingSupply),
    totalSupply: num(t.totalSupply),
    listingTime: num(t.listingTime) || null,
    listingCex: Boolean(t.listingCex),
    hotTag: Boolean(t.hotTag),
    alphaId: t.alphaId ? String(t.alphaId) : null,
    contractAddress: t.contractAddress || null,
    chainName: t.chainName || null,
    venues,
    fundingRate: perp?.funding ?? null,
    perpVolume24h: perp?.volume ?? null,
    spotVolume24h: spotRow ? num(spotRow.quoteVolume) : null,
    high24h: num(t.priceHigh24h) || num(spotRow?.highPrice),
    low24h: num(t.priceLow24h) || num(spotRow?.lowPrice),
  };
}

function spotOnlyRaw(
  t: SpotTicker,
  perps: Map<string, { volume: number; funding: number | null }>,
  already: Set<string>,
): RawMarket | null {
  if (!t.symbol.endsWith("USDT")) return null;
  if (isLeveragedSpot(t.symbol)) return null;
  const base = t.symbol.slice(0, -4);
  if (already.has(base)) return null;
  const price = num(t.lastPrice);
  const vol = num(t.quoteVolume);
  if (price <= 0 || price > 8) return null;
  if (vol < 2_000_000) return null;
  const perp = perps.get(t.symbol);
  const venues: RawMarket["venues"] = ["spot"];
  if (perp && perp.volume > 0) venues.push("perp");
  return {
    id: `spot-${t.symbol}`,
    symbol: base,
    name: base,
    pair: t.symbol,
    iconUrl: null,
    price,
    change24h: num(t.priceChangePercent),
    volume24h: vol,
    marketCap: 0,
    fdv: 0,
    liquidity: 0,
    holders: 0,
    circSupply: 0,
    totalSupply: 0,
    listingTime: null,
    listingCex: true,
    hotTag: false,
    alphaId: null,
    contractAddress: null,
    chainName: null,
    venues,
    fundingRate: perp?.funding ?? null,
    perpVolume24h: perp?.volume ?? null,
    spotVolume24h: vol,
    high24h: num(t.highPrice),
    low24h: num(t.lowPrice),
  };
}

export async function runScan(): Promise<ScanResult> {
  const hit = g.__scoutScan__;
  if (hit && Date.now() - hit.at < SCAN_TTL_MS) return hit.value;

  try {
    const [alpha, spot, fut, prem] = await Promise.all([
      loadAlpha(),
      fetchJson<SpotTicker[]>(SPOT_TICKER).catch(() => [] as SpotTicker[]),
      fetchJson<FutTicker[]>(FUT_TICKER).catch(() => [] as FutTicker[]),
      fetchJson<Premium[]>(FUT_PREMIUM).catch(() => [] as Premium[]),
    ]);

    const spotMap = new Map<string, SpotTicker>();
    for (const s of spot) spotMap.set(s.symbol, s);

    const funding = new Map<string, number>();
    for (const p of prem) funding.set(p.symbol, num(p.lastFundingRate));

    const perps = new Map<string, { volume: number; funding: number | null }>();
    for (const f of fut) {
      perps.set(f.symbol, {
        volume: num(f.quoteVolume),
        funding: funding.get(f.symbol) ?? null,
      });
    }

    const raws: RawMarket[] = [];
    const seen = new Set<string>();
    for (const t of alpha) {
      const raw = alphaToRaw(t, perps, spotMap);
      if (!raw) continue;
      seen.add(raw.symbol);
      raws.push(raw);
    }
    for (const s of spot) {
      const raw = spotOnlyRaw(s, perps, seen);
      if (raw) raws.push(raw);
    }

    const scored = raws
      .map((r) => scoreMarket(r))
      .filter((row) => row.volume24h >= 80_000 || row.score >= 40);

    const bySymbol = new Map<string, Gem>();
    for (const row of scored) {
      const prev = bySymbol.get(row.symbol);
      if (
        !prev ||
        row.score > prev.score ||
        (row.score === prev.score && row.volume24h > prev.volume24h)
      ) {
        bySymbol.set(row.symbol, row);
      }
    }
    const unique = [...bySymbol.values()];
    unique.sort((a, b) => b.score - a.score || b.volume24h - a.volume24h);

    const gems = unique.filter((row) => row.score >= 42).slice(0, 60);
    const gemSet = new Set(gems.map((row) => row.symbol));
    const crime = unique
      .filter((row) => row.crimeRisk >= 55 && !gemSet.has(row.symbol))
      .sort((a, b) => b.crimeRisk - a.crimeRisk)
      .slice(0, 24);

    const stats = {
      universe: raws.length,
      alphaLive: alpha.filter((t) => isTradableAlpha(t)).length,
      spotPairs: spot.filter((s) => s.symbol.endsWith("USDT")).length,
      heating: gems.filter((row) => row.status === "heating").length,
      launching: gems.filter((row) => row.status === "launching").length,
      mooning: gems.filter((row) => row.status === "mooning").length,
      dumped: unique.filter((row) => row.status === "dumped").length,
    };

    const result: ScanResult = {
      gems,
      crime,
      caughtEarly: [],
      stats,
      scannedAt: new Date().toISOString(),
      stale: false,
      error: null,
    };
    g.__scoutScan__ = { at: Date.now(), value: result };
    return result;
  } catch (err) {
    if (hit) {
      return { ...hit.value, stale: true, error: err instanceof Error ? err.message : "Feed error" };
    }
    return {
      gems: [],
      crime: [],
      caughtEarly: [],
      stats: {
        universe: 0,
        alphaLive: 0,
        spotPairs: 0,
        heating: 0,
        launching: 0,
        mooning: 0,
        dumped: 0,
      },
      scannedAt: new Date().toISOString(),
      stale: true,
      error: err instanceof Error ? err.message : "Binance feed unreachable",
    };
  }
}

export async function findRawSymbol(symbol: string): Promise<Gem | null> {
  const scan = await runScan();
  const key = symbol.toUpperCase();
  const fromScan =
    scan.gems.find((g) => g.symbol === key) ||
    scan.crime.find((g) => g.symbol === key) ||
    scan.caughtEarly.find((g) => g.symbol === key);
  if (fromScan) return fromScan;

  const alpha = await loadAlpha();
  const row = alpha.find((t) => String(t.symbol).toUpperCase() === key);
  if (row) {
    const raw = alphaToRaw(row, new Map(), new Map());
    return raw ? scoreMarket(raw) : null;
  }
  return null;
}

function parseCandles(input: unknown): Candle[] {
  if (!Array.isArray(input)) return [];
  const out: Candle[] = [];
  for (const row of input) {
    if (Array.isArray(row) && row.length >= 6) {
      out.push({
        time: num(row[0]),
        open: num(row[1]),
        high: num(row[2]),
        low: num(row[3]),
        close: num(row[4]),
        volume: num(row[5]),
      });
      continue;
    }
    if (row && typeof row === "object") {
      const o = row as Record<string, unknown>;
      const time = num(o.openTime ?? o.t ?? o.time);
      const close = num(o.close ?? o.c);
      if (time && close) {
        out.push({
          time,
          open: num(o.open ?? o.o),
          high: num(o.high ?? o.h),
          low: num(o.low ?? o.l),
          close,
          volume: num(o.volume ?? o.v),
        });
      }
    }
  }
  return out.filter((c) => c.close > 0);
}

export async function loadCandles(gem: Gem): Promise<Candle[]> {
  try {
    if (gem.alphaId) {
      const url = `${ALPHA_KLINES}?symbol=${encodeURIComponent(`${gem.alphaId}USDT`)}&interval=1h&limit=72`;
      const body = await fetchJson<unknown>(url);
      const data =
        body && typeof body === "object" && "data" in (body as object)
          ? (body as { data: unknown }).data
          : body;
      const candles = parseCandles(data);
      if (candles.length > 2) return candles;
    }
    const url = `${SPOT_KLINES}?symbol=${encodeURIComponent(gem.pair)}&interval=1h&limit=72`;
    const body = await fetchJson<unknown>(url);
    return parseCandles(body);
  } catch {
    return [];
  }
}
