import type { Gem, GemStatus, Venue } from "./types";

export type RawMarket = {
  id: string;
  symbol: string;
  name: string;
  pair: string;
  iconUrl: string | null;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  fdv: number;
  liquidity: number;
  holders: number;
  circSupply: number;
  totalSupply: number;
  listingTime: number | null;
  listingCex: boolean;
  hotTag: boolean;
  alphaId: string | null;
  contractAddress: string | null;
  chainName: string | null;
  venues: Venue[];
  fundingRate: number | null;
  perpVolume24h: number | null;
  spotVolume24h: number | null;
  high24h: number;
  low24h: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function round(n: number) {
  return Math.round(n);
}

export function scoreMarket(raw: RawMarket, now = Date.now()): Gem {
  const price = raw.price;
  const vol = raw.volume24h;
  const mcap = Math.max(raw.marketCap, 0);
  const liq = Math.max(raw.liquidity, 0);
  const change = raw.change24h;
  const turnover = mcap > 0 ? vol / mcap : vol > 0 ? 99 : 0;
  const floatRatio =
    raw.totalSupply > 0 ? clamp(raw.circSupply / raw.totalSupply, 0, 1) : 1;
  const listingAgeDays =
    raw.listingTime && raw.listingTime > 0
      ? (now - raw.listingTime) / 86_400_000
      : null;

  const reasons: string[] = [];
  const riskFlags: string[] = [];

  // --- Gem score (early explosive setup, still room to run) ---
  let gem = 0;

  // Market-cap room matters more than the sticker price.
  if (mcap > 0 && mcap < 8_000_000) {
    gem += 16;
    reasons.push("Micro cap with 10x room");
  } else if (mcap < 25_000_000) {
    gem += 18;
    reasons.push("Small cap, still early");
  } else if (mcap < 80_000_000) {
    gem += 14;
    reasons.push("Mid-small cap, room to expand");
  } else if (mcap < 200_000_000) {
    gem += 8;
  } else if (mcap < 500_000_000) {
    gem += 3;
  }

  // Nominal price in the 0.01 → 1 moon zone (user language), but only if mcap agrees.
  const priceIllusion = price > 0 && price < 0.15 && mcap > 400_000_000;
  if (priceIllusion) {
    riskFlags.push("Cheap sticker price, large cap — supply illusion");
  } else if (price >= 0.003 && price <= 0.08) {
    gem += 14;
    reasons.push("Price still in the $0.01 zone");
  } else if (price <= 0.25) {
    gem += 11;
    reasons.push("Price under $0.25");
  } else if (price <= 1) {
    gem += 7;
    reasons.push("Still under $1");
  } else if (price <= 3) {
    gem += 3;
  }

  // Volume ignition — real activity, not a dead book.
  if (vol >= 20_000_000) {
    gem += 16;
    reasons.push("Massive 24h volume");
  } else if (vol >= 8_000_000) {
    gem += 14;
    reasons.push("Heavy volume expanding");
  } else if (vol >= 2_500_000) {
    gem += 11;
    reasons.push("Volume is waking up");
  } else if (vol >= 800_000) {
    gem += 7;
  } else if (vol >= 250_000) {
    gem += 3;
  }

  // Turnover: volume vs cap. Sweet spot is active, not pure wash.
  if (turnover >= 0.12 && turnover <= 1.8) {
    gem += 12;
    reasons.push("Volume/cap turnover in the expansion band");
  } else if (turnover > 1.8 && turnover <= 6) {
    gem += 7;
    reasons.push("Very high turnover — fast move, crowded");
  } else if (turnover > 6) {
    gem += 2;
  }

  // Momentum: early pumps live in +8% to +80%. Already +300% is late.
  const absChange = Math.abs(change);
  if (change >= 12 && change <= 45) {
    gem += 16;
    reasons.push("Fresh 24h expansion");
  } else if (change > 45 && change <= 110) {
    gem += 13;
    reasons.push("Launching — still catchable");
  } else if (change > 110 && change <= 250) {
    gem += 6;
    reasons.push("Already extended — late entry risk");
  } else if (change > 250) {
    gem += 2;
    riskFlags.push("Parabolic 24h move — likely late");
  } else if (change >= 5) {
    gem += 8;
  } else if (change <= -28) {
    gem -= 8;
  } else if (change < -12) {
    gem -= 3;
  }

  // Listing freshness. Revival of older Alpha names is also the MYX/RAVE pattern.
  if (listingAgeDays != null) {
    if (listingAgeDays <= 7) {
      gem += 12;
      reasons.push("Listed this week on Alpha");
    } else if (listingAgeDays <= 21) {
      gem += 10;
      reasons.push("Recently listed");
    } else if (listingAgeDays <= 45) {
      gem += 6;
    } else if (listingAgeDays > 90 && vol >= 2_000_000 && change >= 8) {
      gem += 8;
      reasons.push("Older Alpha name waking up — squeeze pattern");
    }
  }

  if (!raw.listingCex && raw.venues.includes("alpha")) {
    gem += 6;
    reasons.push("Alpha-only — not on main Binance spot yet");
  } else if (raw.listingCex) {
    gem += 2;
    reasons.push("Also listed on Binance CEX");
  }

  if (raw.hotTag) {
    gem += 4;
    reasons.push("Binance hot tag");
  }

  // Low float can fuel a squeeze (and a crime pump).
  if (floatRatio > 0 && floatRatio < 0.35) {
    gem += 6;
    reasons.push("Low circulating float");
  } else if (floatRatio < 0.55) {
    gem += 3;
  }

  // Perp overlay — the COAI/MYX squeeze fingerprint.
  if (raw.perpVolume24h && raw.perpVolume24h > vol * 1.5 && raw.perpVolume24h > 5_000_000) {
    gem += 6;
    reasons.push("Perp volume dominating spot");
  }
  if (raw.fundingRate != null && Math.abs(raw.fundingRate) > 0.01) {
    gem += 3;
    reasons.push("Extreme perp funding");
  }

  // Thin book + real volume = it can reprice fast.
  if (liq > 0 && vol > liq * 4 && vol > 500_000) {
    gem += 4;
    reasons.push("Volume multiple of liquidity — fast tape");
  }

  // --- Crime / wash / dump risk ---
  let crime = 0;

  if (turnover > 20 && absChange < 4) {
    crime += 38;
    riskFlags.push("Wash-like volume with almost no price change");
    gem -= 22;
  } else if (turnover > 8 && absChange < 6) {
    crime += 24;
    riskFlags.push("Volume far beyond cap without a move");
    gem -= 10;
  }

  if (turnover > 2) {
    crime += 16;
    riskFlags.push("Turnover above 2x market cap");
  } else if (turnover > 1) {
    crime += 10;
  }

  if (liq > 0 && vol > liq * 12) {
    crime += 14;
    riskFlags.push("Volume crushing liquidity");
  }

  if (floatRatio > 0 && floatRatio < 0.2) {
    crime += 14;
    riskFlags.push("Very low float — easy to squeeze");
  }

  if (change <= -30) {
    crime += 18;
    riskFlags.push("Sharp 24h dump");
  } else if (change >= 150) {
    crime += 12;
    riskFlags.push("Vertical pump — distribution risk");
  }

  if (raw.high24h > 0 && raw.low24h > 0) {
    const range = (raw.high24h - raw.low24h) / raw.low24h;
    if (range > 0.8) {
      crime += 10;
      riskFlags.push("Violent 24h range");
    }
  }

  if (raw.fundingRate != null && Math.abs(raw.fundingRate) > 0.02) {
    crime += 12;
    riskFlags.push("Funding in squeeze territory");
  }

  if (raw.perpVolume24h && vol > 0 && raw.perpVolume24h > vol * 8) {
    crime += 8;
    riskFlags.push("Perps running the show");
  }

  if (priceIllusion) crime += 10;

  gem = clamp(round(gem), 0, 100);
  crime = clamp(round(crime), 0, 100);

  const status = deriveStatus(gem, crime, change, vol);

  return {
    id: raw.id,
    symbol: raw.symbol,
    name: raw.name,
    pair: raw.pair,
    iconUrl: raw.iconUrl,
    price,
    change24h: change,
    volume24h: vol,
    marketCap: mcap,
    fdv: raw.fdv,
    liquidity: liq,
    holders: raw.holders,
    circSupply: raw.circSupply,
    totalSupply: raw.totalSupply,
    listingTime: raw.listingTime,
    listingAgeDays,
    listingCex: raw.listingCex,
    hotTag: raw.hotTag,
    alphaId: raw.alphaId,
    contractAddress: raw.contractAddress,
    chainName: raw.chainName,
    venues: raw.venues,
    score: gem,
    crimeRisk: crime,
    status,
    reasons: reasons.slice(0, 5),
    riskFlags: riskFlags.slice(0, 4),
    fundingRate: raw.fundingRate,
    perpVolume24h: raw.perpVolume24h,
    spotVolume24h: raw.spotVolume24h,
    high24h: raw.high24h,
    low24h: raw.low24h,
    turnover,
    floatRatio,
    firstSeenAt: null,
    firstPrice: null,
    highSinceDetect: null,
  };
}

function deriveStatus(
  score: number,
  crime: number,
  change: number,
  vol: number,
): GemStatus {
  if (change <= -25 && vol >= 400_000) return "dumped";
  if (change >= 40 && score >= 62) return "mooning";
  if (score >= 70 || (change >= 12 && vol >= 5_000_000 && score >= 55)) {
    return "launching";
  }
  if (change < -10 && score < 58) return "cooling";
  if (crime >= 70 && score < 50) return "cooling";
  return "heating";
}

const STABLES = new Set([
  "USDT",
  "USDC",
  "FDUSD",
  "BUSD",
  "TUSD",
  "DAI",
  "USDE",
  "USD1",
  "BFUSD",
]);

export function isTradableAlpha(row: {
  fullyDelisted?: boolean;
  offline?: boolean;
  offsell?: boolean;
  symbol?: string;
  price?: unknown;
}): boolean {
  if (row.fullyDelisted || row.offline || row.offsell) return false;
  const symbol = String(row.symbol ?? "").toUpperCase();
  if (!symbol || STABLES.has(symbol)) return false;
  return true;
}

export function isLeveragedSpot(symbol: string): boolean {
  const s = symbol.toUpperCase();
  return (
    s.endsWith("UPUSDT") ||
    s.endsWith("DOWNUSDT") ||
    s.endsWith("BULLUSDT") ||
    s.endsWith("BEARUSDT") ||
    s.startsWith("1000") ||
    s.startsWith("10000") ||
    s.startsWith("1M")
  );
}

export function shouldPersist(gem: Gem): boolean {
  return gem.score >= 48 || gem.crimeRisk >= 62 || gem.volume24h >= 5_000_000;
}
