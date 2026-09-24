import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as cn } from "./app-shell-BavAEn_j.mjs";
import { a as TokenMark, d as formatPrice, f as formatUsd, i as StatusPill, n as ScoreBar, o as WatchButton, s as formatAge, u as formatPct } from "./actions-CFqjSexN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gem-list-Cy1JxAOT.js
var import_jsx_runtime = require_jsx_runtime();
function GemList({ gems }) {
	if (gems.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-xl bg-surface px-4 py-12 text-center shadow-[var(--shadow-border)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "No names match this filter right now."
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "hidden grid-cols-[1.4fr_0.9fr_0.7fr_0.8fr_0.7fr_0.8fr_0.9fr_0.7fr_44px] gap-2 px-4 py-3 text-[0.6875rem] uppercase tracking-wider text-subtle md:grid",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Token" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-right",
					children: "Price"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-right",
					children: "24h"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-right",
					children: "Volume"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-right",
					children: "Cap"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Score" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Risk" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Status" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: gems.map((gem) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
			className: "border-t border-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GemRow, { gem })
		}, gem.symbol)) })]
	});
}
function GemRow({ gem }) {
	const up = gem.change24h >= 0;
	const multiple = gem.firstPrice && gem.firstPrice > 0 ? gem.price / gem.firstPrice : null;
	const isNew = gem.firstSeenAt && Date.now() - new Date(gem.firstSeenAt).getTime() < 9e5;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "group relative flex items-stretch",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/gem/$symbol",
			params: { symbol: gem.symbol },
			className: "grid min-h-16 flex-1 grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 md:grid-cols-[1.4fr_0.9fr_0.7fr_0.8fr_0.7fr_0.8fr_0.9fr_0.7fr] md:gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TokenMark, {
						symbol: gem.symbol,
						iconUrl: gem.iconUrl
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium tracking-tight",
								children: gem.symbol
							}), isNew ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[0.65rem] uppercase tracking-wider text-accent",
								children: "New"
							}) : null]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "truncate text-xs text-muted",
							children: [
								gem.name,
								gem.venues.includes("alpha") ? " · Alpha" : "",
								gem.listingCex ? " · CEX" : "",
								gem.listingAgeDays != null ? ` · ${formatAge(gem.listingAgeDays)}` : ""
							]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-right md:contents",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "md:text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-sm tabular-nums",
								children: ["$", formatPrice(gem.price)]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted md:hidden",
								children: [formatUsd(gem.volume24h), " vol"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: cn("hidden font-mono text-sm tabular-nums md:block md:text-right", up ? "text-up" : "text-down"),
							children: formatPct(gem.change24h)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "hidden font-mono text-sm tabular-nums text-fg md:block md:text-right",
							children: formatUsd(gem.volume24h)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "hidden font-mono text-sm tabular-nums text-muted md:block md:text-right",
							children: formatUsd(gem.marketCap)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "hidden md:block",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreBar, {
								value: gem.score,
								tone: "accent"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "hidden md:block",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreBar, {
								value: gem.crimeRisk,
								tone: "warn"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "hidden md:flex md:justify-start",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, { status: gem.status })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "col-span-2 flex items-center justify-between gap-3 md:hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: cn("font-mono text-xs tabular-nums", up ? "text-up" : "text-down"),
						children: [formatPct(gem.change24h), multiple && multiple >= 1.04 ? ` · ${multiple.toFixed(2)}x since catch` : ""]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, { status: gem.status })]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center pr-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WatchButton, { symbol: gem.symbol })
		})]
	});
}
//#endregion
export { GemList as t };
