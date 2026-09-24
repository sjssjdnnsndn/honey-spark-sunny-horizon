import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as Search } from "../_libs/lucide-react.mjs";
import { n as cn, t as AppShell } from "./app-shell-BavAEn_j.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { g as timeAgo, h as scanMarket, r as Skeleton } from "./actions-CFqjSexN.mjs";
import { t as GemList } from "./gem-list-Cy1JxAOT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-G644wNnI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("flex h-11 w-full rounded-md bg-elevated px-3 text-sm text-fg shadow-[var(--shadow-border)]", "placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className),
		...props
	});
}
function Home() {
	const scan = useQuery({
		queryKey: ["scan"],
		queryFn: () => scanMarket(),
		refetchInterval: 2e4,
		refetchIntervalInBackground: true
	});
	const [view, setView] = (0, import_react.useState)("gems");
	const [q, setQ] = (0, import_react.useState)("");
	const data = scan.data;
	const list = (0, import_react.useMemo)(() => {
		let rows = data?.gems ?? [];
		if (view === "crime") rows = data?.crime ?? [];
		if (view === "caught") rows = data?.caughtEarly ?? [];
		if (view === "cheap") rows = (data?.gems ?? []).filter((g) => g.price > 0 && g.price <= .12);
		const query = q.trim().toLowerCase();
		if (query) rows = rows.filter((g) => g.symbol.toLowerCase().includes(query) || g.name.toLowerCase().includes(query));
		return rows;
	}, [
		data,
		view,
		q
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		live: !scan.isError && Boolean(data) && !data?.stale,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mb-8 sm:mb-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-xs uppercase tracking-[0.18em] text-muted",
						children: "Binance gem radar"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "font-display text-3xl leading-tight tracking-tight sm:text-5xl",
						children: [
							"Catch the $0.01 names",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", { className: "hidden sm:block" }),
							" before they run."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-xl text-pretty text-sm leading-relaxed text-muted sm:text-base",
						children: "Scout watches Binance Alpha, spot, and perps every 20 seconds. It ranks low-price coins with expanding volume — the same shape as early MYX, LAB, COAI, RAVE, and AKE — and tracks them from first detection."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatsBar, {
				loading: scan.isLoading,
				universe: data?.stats.universe,
				heating: data?.stats.heating,
				launching: data?.stats.launching,
				mooning: data?.stats.mooning,
				scannedAt: data?.scannedAt,
				stale: data?.stale,
				error: data?.error ?? (scan.isError ? "Radar feed paused" : null)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-1 overflow-x-auto pb-1",
					children: [
						["gems", "Early gems"],
						["cheap", "Under $0.12"],
						["crime", "Crime tape"],
						["caught", "Caught early"]
					].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setView(id),
						className: cn("h-11 shrink-0 rounded-full px-4 text-sm transition-colors duration-150", view === id ? "bg-accent text-accent-fg" : "text-muted hover:bg-elevated hover:text-fg"),
						children: label
					}, id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "relative block w-full sm:max-w-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "Search symbol",
						className: "pl-9",
						"aria-label": "Search symbol"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: scan.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListSkeleton, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GemList, { gems: list })
			})
		]
	});
}
function StatsBar({ loading, universe, heating, launching, mooning, scannedAt, stale, error }) {
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
		children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 rounded-xl" }, i))
	});
	const items = [
		{
			label: "Universe",
			value: universe?.toLocaleString() ?? "—"
		},
		{
			label: "Heating",
			value: String(heating ?? 0)
		},
		{
			label: "Launching",
			value: String(launching ?? 0)
		},
		{
			label: "Mooning",
			value: String(mooning ?? 0)
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
		children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl bg-surface px-4 py-3 shadow-[var(--shadow-border)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: item.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-mono text-xl tabular-nums tracking-tight",
				children: item.value
			})]
		}, item.label))
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-3 text-xs text-subtle",
		children: error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "text-heat",
			children: [error, ". Showing last known tape."]
		}) : stale ? "Feed delayed — last snapshot held." : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			"Last sweep ",
			timeAgo(scannedAt ?? null),
			" · Alpha + spot + perps"
		] })
	})] });
}
function ListSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-px overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]",
		children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3 px-4 py-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "size-10 rounded-md" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-24" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-40" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-16" })
			]
		}, i))
	});
}
//#endregion
export { Home as component };
