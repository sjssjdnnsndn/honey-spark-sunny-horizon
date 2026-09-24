import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as string, i as object, t as array } from "../_libs/zod.mjs";
import { i as Bookmark } from "../_libs/lucide-react.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as cn } from "./app-shell-BavAEn_j.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/actions-CFqjSexN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function formatPrice(value) {
	if (!Number.isFinite(value) || value <= 0) return "—";
	if (value >= 1e3) return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
	if (value >= 1) return value.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 4
	});
	if (value >= .1) return value.toFixed(4);
	if (value >= .01) return value.toFixed(5);
	if (value >= 1e-4) return value.toFixed(6);
	return value.toPrecision(3);
}
function formatUsd(value) {
	if (!Number.isFinite(value) || value <= 0) return "—";
	const abs = Math.abs(value);
	if (abs >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
	if (abs >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
	if (abs >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
	return `$${value.toFixed(2)}`;
}
function formatPct(value) {
	if (!Number.isFinite(value)) return "—";
	return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}
function formatMultiple(value) {
	if (!Number.isFinite(value) || value <= 0) return "—";
	if (value >= 100) return `${value.toFixed(0)}x`;
	if (value >= 10) return `${value.toFixed(1)}x`;
	return `${value.toFixed(2)}x`;
}
function formatAge(days) {
	if (days == null || !Number.isFinite(days)) return "—";
	if (days < 1) return `${Math.max(1, Math.round(days * 24))}h`;
	if (days < 14) return `${days.toFixed(0)}d`;
	if (days < 60) return `${Math.round(days / 7)}w`;
	return `${(days / 30).toFixed(0)}mo`;
}
function formatInt(value) {
	if (!Number.isFinite(value)) return "—";
	return Math.round(value).toLocaleString("en-US");
}
function timeAgo(iso) {
	if (!iso) return "—";
	const then = new Date(iso).getTime();
	if (!Number.isFinite(then)) return "—";
	const sec = Math.max(0, Math.round((Date.now() - then) / 1e3));
	if (sec < 45) return "just now";
	if (sec < 3600) return `${Math.round(sec / 60)}m ago`;
	if (sec < 86400) return `${Math.round(sec / 3600)}h ago`;
	return `${Math.round(sec / 86400)}d ago`;
}
function ScoreBar({ value, tone = "accent" }) {
	const width = Math.max(0, Math.min(100, value));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-1.5 w-16 overflow-hidden rounded-full bg-elevated sm:w-20",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("h-full rounded-full transition-[width] duration-300", tone === "warn" && "bg-heat", tone === "up" && "bg-up", tone === "accent" && "bg-accent"),
				style: { width: `${width}%` }
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "w-6 text-right font-mono text-xs tabular-nums text-muted",
			children: Math.round(value)
		})]
	});
}
var badgeVariants = cva("inline-flex items-center rounded-full px-2 py-0.5 text-[0.6875rem] font-medium tracking-wide", {
	variants: { variant: {
		default: "bg-elevated text-muted",
		heat: "bg-accent/12 text-accent",
		up: "bg-up/15 text-up",
		down: "bg-down/15 text-down",
		warn: "bg-heat/15 text-heat"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var MAP = {
	heating: {
		label: "Heating",
		variant: "heat"
	},
	launching: {
		label: "Launching",
		variant: "up"
	},
	mooning: {
		label: "Mooning",
		variant: "up"
	},
	cooling: {
		label: "Cooling",
		variant: "default"
	},
	dumped: {
		label: "Dumped",
		variant: "down"
	}
};
function StatusPill({ status }) {
	const m = MAP[status];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: m.variant,
		children: m.label
	});
}
function TokenMark({ symbol, iconUrl, size = "md" }) {
	const [failed, setFailed] = (0, import_react.useState)(false);
	const dim = size === "sm" ? "size-8" : "size-10";
	const showImg = iconUrl && !failed;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-elevated", dim),
		children: showImg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: iconUrl,
			alt: "",
			className: "size-full object-cover outline outline-1 -outline-offset-1 outline-fg/10",
			onError: () => setFailed(true)
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-[0.65rem] text-muted",
			children: symbol.slice(0, 3)
		})
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,box-shadow,opacity,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:not-disabled:scale-[0.96] [&_svg]:pointer-events-none [&_svg]:size-4", {
	variants: {
		variant: {
			default: "bg-accent text-accent-fg hover:opacity-90",
			secondary: "bg-elevated text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
			ghost: "text-muted hover:bg-elevated hover:text-fg",
			outline: "bg-transparent text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 px-3 text-sm",
			lg: "h-12 px-5",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("animate-pulse rounded-md bg-elevated", className),
		...props
	});
}
var useWatchlist = create()(persist((set, get) => ({
	symbols: [],
	toggle: (symbol) => {
		const next = symbol.toUpperCase();
		const cur = get().symbols;
		set({ symbols: cur.includes(next) ? cur.filter((s) => s !== next) : [next, ...cur] });
	},
	has: (symbol) => get().symbols.includes(symbol.toUpperCase())
}), { name: "scout-watchlist" }));
function WatchButton({ symbol, className }) {
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setReady(true), []);
	const has = useWatchlist((s) => s.has(symbol));
	const toggle = useWatchlist((s) => s.toggle);
	const on = ready && has;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type: "button",
		variant: "ghost",
		size: "icon",
		"aria-label": on ? `Remove ${symbol} from watchlist` : `Watch ${symbol}`,
		className: cn("size-11 shrink-0", className),
		onClick: (e) => {
			e.preventDefault();
			e.stopPropagation();
			toggle(symbol);
			toast(on ? `${symbol} off watchlist` : `${symbol} on watchlist`);
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, {
			className: cn("size-4", on && "fill-accent text-accent"),
			strokeWidth: 1.75
		})
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var scanMarket = createServerFn({ method: "GET" }).handler(createSsrRpc("309b5e67be5a107c8f4874bf603f9b9f7b9288b50116e912474a0afd0367cae5"));
var getGemDetail = createServerFn({ method: "POST" }).validator(object({ symbol: string().min(1).max(24) })).handler(createSsrRpc("1676ad1a665b492cf7e3d00fdeb60ebc473f17761f6b1e8fa780ef3f44da23dc"));
var getWatchGems = createServerFn({ method: "POST" }).validator(object({ symbols: array(string().min(1).max(24)).max(40) })).handler(createSsrRpc("6337d36dafab7020921056b62bc291afd87d4d906b5d9af8ce1487927172dd00"));
//#endregion
export { useWatchlist as _, TokenMark as a, formatInt as c, formatPrice as d, formatUsd as f, timeAgo as g, scanMarket as h, StatusPill as i, formatMultiple as l, getWatchGems as m, ScoreBar as n, WatchButton as o, getGemDetail as p, Skeleton as r, formatAge as s, Button as t, formatPct as u };
