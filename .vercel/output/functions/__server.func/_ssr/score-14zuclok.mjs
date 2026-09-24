//#region node_modules/.nitro/vite/services/ssr/assets/score-14zuclok.js
function clamp(n, min, max) {
	return Math.min(max, Math.max(min, n));
}
function round(n) {
	return Math.round(n);
}
function scoreMarket(raw, now = Date.now()) {
	const price = raw.price;
	const vol = raw.volume24h;
	const mcap = Math.max(raw.marketCap, 0);
	const liq = Math.max(raw.liquidity, 0);
	const change = raw.change24h;
	const turnover = mcap > 0 ? vol / mcap : vol > 0 ? 99 : 0;
	const floatRatio = raw.totalSupply > 0 ? clamp(raw.circSupply / raw.totalSupply, 0, 1) : 1;
	const listingAgeDays = raw.listingTime && raw.listingTime > 0 ? (now - raw.listingTime) / 864e5 : null;
	const reasons = [];
	const riskFlags = [];
	let gem = 0;
	if (mcap > 0 && mcap < 8e6) {
		gem += 16;
		reasons.push("Micro cap with 10x room");
	} else if (mcap < 25e6) {
		gem += 18;
		reasons.push("Small cap, still early");
	} else if (mcap < 8e7) {
		gem += 14;
		reasons.push("Mid-small cap, room to expand");
	} else if (mcap < 2e8) gem += 8;
	else if (mcap < 5e8) gem += 3;
	const priceIllusion = price > 0 && price < .15 && mcap > 4e8;
	if (priceIllusion) riskFlags.push("Cheap sticker price, large cap — supply illusion");
	else if (price >= .003 && price <= .08) {
		gem += 14;
		reasons.push("Price still in the $0.01 zone");
	} else if (price <= .25) {
		gem += 11;
		reasons.push("Price under $0.25");
	} else if (price <= 1) {
		gem += 7;
		reasons.push("Still under $1");
	} else if (price <= 3) gem += 3;
	if (vol >= 2e7) {
		gem += 16;
		reasons.push("Massive 24h volume");
	} else if (vol >= 8e6) {
		gem += 14;
		reasons.push("Heavy volume expanding");
	} else if (vol >= 25e5) {
		gem += 11;
		reasons.push("Volume is waking up");
	} else if (vol >= 8e5) gem += 7;
	else if (vol >= 25e4) gem += 3;
	if (turnover >= .12 && turnover <= 1.8) {
		gem += 12;
		reasons.push("Volume/cap turnover in the expansion band");
	} else if (turnover > 1.8 && turnover <= 6) {
		gem += 7;
		reasons.push("Very high turnover — fast move, crowded");
	} else if (turnover > 6) gem += 2;
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
	} else if (change >= 5) gem += 8;
	else if (change <= -28) gem -= 8;
	else if (change < -12) gem -= 3;
	if (listingAgeDays != null) {
		if (listingAgeDays <= 7) {
			gem += 12;
			reasons.push("Listed this week on Alpha");
		} else if (listingAgeDays <= 21) {
			gem += 10;
			reasons.push("Recently listed");
		} else if (listingAgeDays <= 45) gem += 6;
		else if (listingAgeDays > 90 && vol >= 2e6 && change >= 8) {
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
	if (floatRatio > 0 && floatRatio < .35) {
		gem += 6;
		reasons.push("Low circulating float");
	} else if (floatRatio < .55) gem += 3;
	if (raw.perpVolume24h && raw.perpVolume24h > vol * 1.5 && raw.perpVolume24h > 5e6) {
		gem += 6;
		reasons.push("Perp volume dominating spot");
	}
	if (raw.fundingRate != null && Math.abs(raw.fundingRate) > .01) {
		gem += 3;
		reasons.push("Extreme perp funding");
	}
	if (liq > 0 && vol > liq * 4 && vol > 5e5) {
		gem += 4;
		reasons.push("Volume multiple of liquidity — fast tape");
	}
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
	} else if (turnover > 1) crime += 10;
	if (liq > 0 && vol > liq * 12) {
		crime += 14;
		riskFlags.push("Volume crushing liquidity");
	}
	if (floatRatio > 0 && floatRatio < .2) {
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
		if ((raw.high24h - raw.low24h) / raw.low24h > .8) {
			crime += 10;
			riskFlags.push("Violent 24h range");
		}
	}
	if (raw.fundingRate != null && Math.abs(raw.fundingRate) > .02) {
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
		highSinceDetect: null
	};
}
function deriveStatus(score, crime, change, vol) {
	if (change <= -25 && vol >= 4e5) return "dumped";
	if (change >= 40 && score >= 62) return "mooning";
	if (score >= 70 || change >= 12 && vol >= 5e6 && score >= 55) return "launching";
	if (change < -10 && score < 58) return "cooling";
	if (crime >= 70 && score < 50) return "cooling";
	return "heating";
}
var STABLES = /* @__PURE__ */ new Set([
	"USDT",
	"USDC",
	"FDUSD",
	"BUSD",
	"TUSD",
	"DAI",
	"USDE",
	"USD1",
	"BFUSD"
]);
function isTradableAlpha(row) {
	if (row.fullyDelisted || row.offline || row.offsell) return false;
	const symbol = String(row.symbol ?? "").toUpperCase();
	if (!symbol || STABLES.has(symbol)) return false;
	return true;
}
function isLeveragedSpot(symbol) {
	const s = symbol.toUpperCase();
	return s.endsWith("UPUSDT") || s.endsWith("DOWNUSDT") || s.endsWith("BULLUSDT") || s.endsWith("BEARUSDT") || s.startsWith("1000") || s.startsWith("10000") || s.startsWith("1M");
}
function shouldPersist(gem) {
	return gem.score >= 48 || gem.crimeRisk >= 62 || gem.volume24h >= 5e6;
}
//#endregion
export { shouldPersist as i, isTradableAlpha as n, scoreMarket as r, isLeveragedSpot as t };
