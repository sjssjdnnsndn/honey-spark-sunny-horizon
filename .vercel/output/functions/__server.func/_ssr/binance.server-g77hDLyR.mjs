import { n as isTradableAlpha, r as scoreMarket, t as isLeveragedSpot } from "./score-14zuclok.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/binance.server-g77hDLyR.js
var ALPHA_LIST = "https://www.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/cex/alpha/all/token/list";
var ALPHA_KLINES = "https://www.binance.com/bapi/defi/v1/public/alpha-trade/klines";
var SPOT_TICKER = "https://api.binance.com/api/v3/ticker/24hr";
var FUT_TICKER = "https://fapi.binance.com/fapi/v1/ticker/24hr";
var FUT_PREMIUM = "https://fapi.binance.com/fapi/v1/premiumIndex";
var SPOT_KLINES = "https://api.binance.com/api/v3/klines";
var SCAN_TTL_MS = 2e4;
var BROWSER_HEADERS = {
	Accept: "application/json,text/plain,*/*",
	"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
	Origin: "https://www.binance.com",
	Referer: "https://www.binance.com/"
};
var g = globalThis;
function num(v) {
	const n = typeof v === "number" ? v : Number(v);
	return Number.isFinite(n) ? n : 0;
}
async function fetchJson(url, timeout = 12e3) {
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), timeout);
	try {
		const res = await fetch(url, {
			signal: ctrl.signal,
			headers: BROWSER_HEADERS
		});
		if (!res.ok) throw new Error(`Feed ${res.status}`);
		return await res.json();
	} finally {
		clearTimeout(timer);
	}
}
async function loadAlpha() {
	const hit = g.__scoutAlpha__;
	if (hit && Date.now() - hit.at < SCAN_TTL_MS) return hit.value;
	const body = await fetchJson(ALPHA_LIST);
	const rows = Array.isArray(body.data) ? body.data : [];
	g.__scoutAlpha__ = {
		at: Date.now(),
		value: rows
	};
	return rows;
}
function alphaToRaw(t, perps, spot) {
	if (!isTradableAlpha(t)) return null;
	const symbol = String(t.symbol ?? "").trim();
	if (!symbol) return null;
	const price = num(t.price);
	if (price <= 0) return null;
	const key = symbol.toUpperCase();
	const spotRow = spot.get(`${key}USDT`) ?? (t.cexCoinName ? spot.get(`${t.cexCoinName.toUpperCase()}USDT`) : void 0);
	const perp = perps.get(`${key}USDT`);
	const venues = ["alpha"];
	if (spotRow) venues.push("spot");
	if (perp && perp.volume > 0) venues.push("perp");
	return {
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
		low24h: num(t.priceLow24h) || num(spotRow?.lowPrice)
	};
}
function spotOnlyRaw(t, perps, already) {
	if (!t.symbol.endsWith("USDT")) return null;
	if (isLeveragedSpot(t.symbol)) return null;
	const base = t.symbol.slice(0, -4);
	if (already.has(base)) return null;
	const price = num(t.lastPrice);
	const vol = num(t.quoteVolume);
	if (price <= 0 || price > 8) return null;
	if (vol < 2e6) return null;
	const perp = perps.get(t.symbol);
	const venues = ["spot"];
	if (perp && perp.volume > 0) venues.push("perp");
	return {
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
		low24h: num(t.lowPrice)
	};
}
async function runScan() {
	const hit = g.__scoutScan__;
	if (hit && Date.now() - hit.at < SCAN_TTL_MS) return hit.value;
	try {
		const [alpha, spot, fut, prem] = await Promise.all([
			loadAlpha(),
			fetchJson(SPOT_TICKER).catch(() => []),
			fetchJson(FUT_TICKER).catch(() => []),
			fetchJson(FUT_PREMIUM).catch(() => [])
		]);
		const spotMap = /* @__PURE__ */ new Map();
		for (const s of spot) spotMap.set(s.symbol, s);
		const funding = /* @__PURE__ */ new Map();
		for (const p of prem) funding.set(p.symbol, num(p.lastFundingRate));
		const perps = /* @__PURE__ */ new Map();
		for (const f of fut) perps.set(f.symbol, {
			volume: num(f.quoteVolume),
			funding: funding.get(f.symbol) ?? null
		});
		const raws = [];
		const seen = /* @__PURE__ */ new Set();
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
		const scored = raws.map((r) => scoreMarket(r)).filter((g) => g.volume24h >= 8e4 || g.score >= 40);
		scored.sort((a, b) => b.score - a.score || b.volume24h - a.volume24h);
		const gems = scored.filter((g) => g.score >= 42).slice(0, 60);
		const gemSet = new Set(gems.map((g) => g.symbol));
		const result = {
			gems,
			crime: scored.filter((g) => g.crimeRisk >= 55 && !gemSet.has(g.symbol)).sort((a, b) => b.crimeRisk - a.crimeRisk).slice(0, 24),
			caughtEarly: [],
			stats: {
				universe: raws.length,
				alphaLive: alpha.filter((t) => isTradableAlpha(t)).length,
				spotPairs: spot.filter((s) => s.symbol.endsWith("USDT")).length,
				heating: gems.filter((g) => g.status === "heating").length,
				launching: gems.filter((g) => g.status === "launching").length,
				mooning: gems.filter((g) => g.status === "mooning").length,
				dumped: scored.filter((g) => g.status === "dumped").length
			},
			scannedAt: (/* @__PURE__ */ new Date()).toISOString(),
			stale: false,
			error: null
		};
		g.__scoutScan__ = {
			at: Date.now(),
			value: result
		};
		return result;
	} catch (err) {
		if (hit) return {
			...hit.value,
			stale: true,
			error: err instanceof Error ? err.message : "Feed error"
		};
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
				dumped: 0
			},
			scannedAt: (/* @__PURE__ */ new Date()).toISOString(),
			stale: true,
			error: err instanceof Error ? err.message : "Binance feed unreachable"
		};
	}
}
async function findRawSymbol(symbol) {
	const scan = await runScan();
	const key = symbol.toUpperCase();
	const fromScan = scan.gems.find((g) => g.symbol === key) || scan.crime.find((g) => g.symbol === key) || scan.caughtEarly.find((g) => g.symbol === key);
	if (fromScan) return fromScan;
	const row = (await loadAlpha()).find((t) => String(t.symbol).toUpperCase() === key);
	if (row) {
		const raw = alphaToRaw(row, /* @__PURE__ */ new Map(), /* @__PURE__ */ new Map());
		return raw ? scoreMarket(raw) : null;
	}
	return null;
}
function parseCandles(input) {
	if (!Array.isArray(input)) return [];
	const out = [];
	for (const row of input) {
		if (Array.isArray(row) && row.length >= 6) {
			out.push({
				time: num(row[0]),
				open: num(row[1]),
				high: num(row[2]),
				low: num(row[3]),
				close: num(row[4]),
				volume: num(row[5])
			});
			continue;
		}
		if (row && typeof row === "object") {
			const o = row;
			const time = num(o.openTime ?? o.t ?? o.time);
			const close = num(o.close ?? o.c);
			if (time && close) out.push({
				time,
				open: num(o.open ?? o.o),
				high: num(o.high ?? o.h),
				low: num(o.low ?? o.l),
				close,
				volume: num(o.volume ?? o.v)
			});
		}
	}
	return out.filter((c) => c.close > 0);
}
async function loadCandles(gem) {
	try {
		if (gem.alphaId) {
			const body = await fetchJson(`${ALPHA_KLINES}?symbol=${encodeURIComponent(`${gem.alphaId}USDT`)}&interval=1h&limit=72`);
			const candles = parseCandles(body && typeof body === "object" && "data" in body ? body.data : body);
			if (candles.length > 2) return candles;
		}
		return parseCandles(await fetchJson(`${SPOT_KLINES}?symbol=${encodeURIComponent(gem.pair)}&interval=1h&limit=72`));
	} catch {
		return [];
	}
}
//#endregion
export { findRawSymbol, loadCandles, runScan };
