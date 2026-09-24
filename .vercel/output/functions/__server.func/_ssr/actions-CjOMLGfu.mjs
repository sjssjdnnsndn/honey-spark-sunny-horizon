import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { a as string, i as object, t as array } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/actions-CjOMLGfu.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var scanMarket_createServerFn_handler = createServerRpc({
	id: "309b5e67be5a107c8f4874bf603f9b9f7b9288b50116e912474a0afd0367cae5",
	name: "scanMarket",
	filename: "src/lib/scanner/actions.ts"
}, (opts) => scanMarket.__executeServer(opts));
var scanMarket = createServerFn({ method: "GET" }).handler(scanMarket_createServerFn_handler, async () => {
	const { runScan } = await import("./binance.server-g77hDLyR.mjs");
	const { persistAndMerge, loadCaughtEarly } = await import("./persist.server-B3605L2j.mjs");
	const scan = await runScan();
	try {
		const merged = await persistAndMerge([...scan.gems, ...scan.crime]);
		const bySym = new Map(merged.map((g) => [g.symbol, g]));
		const gems = scan.gems.map((g) => bySym.get(g.symbol) ?? g);
		const crime = scan.crime.map((g) => bySym.get(g.symbol) ?? g);
		const caughtEarly = await loadCaughtEarly([...gems, ...crime]);
		return {
			...scan,
			gems,
			crime,
			caughtEarly
		};
	} catch {
		return scan;
	}
});
var getGemDetail_createServerFn_handler = createServerRpc({
	id: "1676ad1a665b492cf7e3d00fdeb60ebc473f17761f6b1e8fa780ef3f44da23dc",
	name: "getGemDetail",
	filename: "src/lib/scanner/actions.ts"
}, (opts) => getGemDetail.__executeServer(opts));
var getGemDetail = createServerFn({ method: "POST" }).validator(object({ symbol: string().min(1).max(24) })).handler(getGemDetail_createServerFn_handler, async ({ data }) => {
	const { findRawSymbol, loadCandles } = await import("./binance.server-g77hDLyR.mjs");
	const { loadGemRow, loadSnapshots } = await import("./persist.server-B3605L2j.mjs");
	const symbol = data.symbol.toUpperCase();
	let gem = await findRawSymbol(symbol);
	try {
		const row = await loadGemRow(symbol);
		if (gem && row) gem = {
			...gem,
			firstSeenAt: row.first_seen_at,
			firstPrice: Number(row.first_price),
			highSinceDetect: Number(row.high_since_detect)
		};
		const snapshots = await loadSnapshots(symbol);
		const candles = gem ? await loadCandles(gem) : [];
		return {
			gem,
			snapshots,
			candles
		};
	} catch {
		const candles = gem ? await loadCandles(gem) : [];
		return {
			gem,
			snapshots: [],
			candles
		};
	}
});
var getWatchGems_createServerFn_handler = createServerRpc({
	id: "6337d36dafab7020921056b62bc291afd87d4d906b5d9af8ce1487927172dd00",
	name: "getWatchGems",
	filename: "src/lib/scanner/actions.ts"
}, (opts) => getWatchGems.__executeServer(opts));
var getWatchGems = createServerFn({ method: "POST" }).validator(object({ symbols: array(string().min(1).max(24)).max(40) })).handler(getWatchGems_createServerFn_handler, async ({ data }) => {
	const { findRawSymbol } = await import("./binance.server-g77hDLyR.mjs");
	const { loadGemRow } = await import("./persist.server-B3605L2j.mjs");
	const gems = [];
	for (const raw of data.symbols) {
		const symbol = raw.toUpperCase();
		let gem = await findRawSymbol(symbol);
		if (!gem) continue;
		try {
			const row = await loadGemRow(symbol);
			if (row) gem = {
				...gem,
				firstSeenAt: row.first_seen_at,
				firstPrice: Number(row.first_price),
				highSinceDetect: Number(row.high_since_detect)
			};
		} catch {}
		gems.push(gem);
	}
	return gems;
});
//#endregion
export { getGemDetail_createServerFn_handler, getWatchGems_createServerFn_handler, scanMarket_createServerFn_handler };
