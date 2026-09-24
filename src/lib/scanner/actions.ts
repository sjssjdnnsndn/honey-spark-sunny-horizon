import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { GemDetail, ScanResult } from "./types";

export const scanMarket = createServerFn({ method: "GET" }).handler(
  async (): Promise<ScanResult> => {
    const { runScan } = await import("./binance.server");
    const { persistAndMerge, loadCaughtEarly } = await import("./persist.server");
    const scan = await runScan();
    try {
      const pool = [...scan.gems, ...scan.crime];
      const merged = await persistAndMerge(pool);
      const bySym = new Map(merged.map((g) => [g.symbol, g]));
      const gems = scan.gems.map((g) => bySym.get(g.symbol) ?? g);
      const crime = scan.crime.map((g) => bySym.get(g.symbol) ?? g);
      const caughtEarly = await loadCaughtEarly([...gems, ...crime]);
      return { ...scan, gems, crime, caughtEarly };
    } catch {
      return scan;
    }
  },
);

export const getGemDetail = createServerFn({ method: "POST" })
  .validator(z.object({ symbol: z.string().min(1).max(24) }))
  .handler(async ({ data }): Promise<GemDetail> => {
    const { findRawSymbol, loadCandles } = await import("./binance.server");
    const { loadGemRow, loadSnapshots } = await import("./persist.server");
    const symbol = data.symbol.toUpperCase();
    let gem = await findRawSymbol(symbol);
    try {
      const row = await loadGemRow(symbol);
      if (gem && row) {
        gem = {
          ...gem,
          firstSeenAt: row.first_seen_at,
          firstPrice: Number(row.first_price),
          highSinceDetect: Number(row.high_since_detect),
        };
      }
      const snapshots = await loadSnapshots(symbol);
      const candles = gem ? await loadCandles(gem) : [];
      return { gem, snapshots, candles };
    } catch {
      const candles = gem ? await loadCandles(gem) : [];
      return { gem, snapshots: [], candles };
    }
  });

export const getWatchGems = createServerFn({ method: "POST" })
  .validator(z.object({ symbols: z.array(z.string().min(1).max(24)).max(40) }))
  .handler(async ({ data }) => {
    const { findRawSymbol } = await import("./binance.server");
    const { loadGemRow } = await import("./persist.server");
    const gems = [];
    for (const raw of data.symbols) {
      const symbol = raw.toUpperCase();
      let gem = await findRawSymbol(symbol);
      if (!gem) continue;
      try {
        const row = await loadGemRow(symbol);
        if (row) {
          gem = {
            ...gem,
            firstSeenAt: row.first_seen_at,
            firstPrice: Number(row.first_price),
            highSinceDetect: Number(row.high_since_detect),
          };
        }
      } catch {
        /* still return live */
      }
      gems.push(gem);
    }
    return gems;
  });
