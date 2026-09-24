export type GemStatus =
  | "heating"
  | "launching"
  | "mooning"
  | "cooling"
  | "dumped";

export type Venue = "alpha" | "spot" | "perp";

export type Gem = {
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
  listingAgeDays: number | null;
  listingCex: boolean;
  hotTag: boolean;
  alphaId: string | null;
  contractAddress: string | null;
  chainName: string | null;
  venues: Venue[];
  score: number;
  crimeRisk: number;
  status: GemStatus;
  reasons: string[];
  riskFlags: string[];
  fundingRate: number | null;
  perpVolume24h: number | null;
  spotVolume24h: number | null;
  high24h: number;
  low24h: number;
  turnover: number;
  floatRatio: number;
  firstSeenAt: string | null;
  firstPrice: number | null;
  highSinceDetect: number | null;
};

export type ScanStats = {
  universe: number;
  alphaLive: number;
  spotPairs: number;
  heating: number;
  launching: number;
  mooning: number;
  dumped: number;
};

export type ScanResult = {
  gems: Gem[];
  crime: Gem[];
  caughtEarly: Gem[];
  stats: ScanStats;
  scannedAt: string;
  stale: boolean;
  error: string | null;
};

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type GemDetail = {
  gem: Gem | null;
  snapshots: Array<{
    price: number;
    quoteVolume: number;
    change24h: number;
    score: number;
    crimeRisk: number;
    capturedAt: string;
  }>;
  candles: Candle[];
};
