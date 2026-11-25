import { f as e, h as t, m as n, p as r, t as i } from "./chunks/PmsContext-BVMd13Oi.js";
import { r as a } from "./chunks/dist-BFKqrRa-.js";
import { S as o, T as s, _ as c, a as l, c as u, d, f, g as p, h as m, m as h, o as g, s as _, t as v, u as ee, y } from "./chunks/query-DROYnevi.js";
import { t as b } from "./chunks/mutation-ggA4t488.js";
import { a as x } from "./chunks/dist-BQlDVxi3.js";
import { i as S } from "./chunks/dist-DPAKuE1t.js";
import { a as te, n as C, o as w, r as T, t as E } from "./chunks/dialog-DtgtvZ4Q.js";
import { i as D } from "./chunks/dist-B_7XVMlu.js";
import { t as O } from "./chunks/createLucideIcon-CQUC5AEZ.js";
import { n as k, t as A } from "./chunks/dist-BCHtOhmx.js";
import { t as ne } from "./chunks/button-BGWa3SLr.js";
// node_modules/react-dom/client.js
var re = /* @__PURE__ */ n(((e) => {
	var t = a();
	e.createRoot = t.createRoot, e.hydrateRoot = t.hydrateRoot;
})), j = class extends u {
	#e;
	#t;
	#n;
	constructor(e = {}) {
		super(), this.config = e, this.#e = /* @__PURE__ */ new Set(), this.#t = /* @__PURE__ */ new Map(), this.#n = 0;
	}
	build(e, t, n) {
		let r = new b({
			client: e,
			mutationCache: this,
			mutationId: ++this.#n,
			options: e.defaultMutationOptions(t),
			state: n
		});
		return this.add(r), r;
	}
	add(e) {
		this.#e.add(e);
		let t = M(e);
		if (typeof t == "string") {
			let n = this.#t.get(t);
			n ? n.push(e) : this.#t.set(t, [e]);
		}
		this.notify({
			type: "added",
			mutation: e
		});
	}
	remove(e) {
		if (this.#e.delete(e)) {
			let t = M(e);
			if (typeof t == "string") {
				let n = this.#t.get(t);
				if (n) {
					if (n.length > 1) {
						let t = n.indexOf(e);
						t !== -1 && n.splice(t, 1);
					} else n[0] === e && this.#t.delete(t);
				}
			}
		}
		this.notify({
			type: "removed",
			mutation: e
		});
	}
	canRun(e) {
		let t = M(e);
		if (typeof t == "string") {
			let n = this.#t.get(t)?.find((e) => e.state.status === "pending");
			return !n || n === e;
		}
		return !0;
	}
	runNext(e) {
		let t = M(e);
		return typeof t == "string" ? (this.#t.get(t)?.find((t) => t !== e && t.state.isPaused))?.continue() ?? Promise.resolve() : Promise.resolve();
	}
	clear() {
		g.batch(() => {
			let e = this.getAll();
			this.#e.clear(), this.#t.clear(), e.forEach((e) => {
				this.notify({
					type: "removed",
					mutation: e
				});
			});
		});
	}
	getAll() {
		return Array.from(this.#e);
	}
	find(e) {
		let t = {
			exact: !0,
			...e
		};
		return this.getAll().find((e) => h(t, e));
	}
	findAll(e = {}) {
		return this.getAll().filter((t) => h(e, t));
	}
	notify(e) {
		g.batch(() => {
			this.listeners.forEach((t) => {
				t(e);
			});
		});
	}
	resumePausedMutations() {
		let e = this.getAll().filter((e) => e.state.isPaused);
		return g.batch(() => Promise.all(e.map((e) => e.continue().catch(p))));
	}
};
function M(e) {
	return e.options.scope?.id;
}
// node_modules/@tanstack/query-core/build/modern/queryCache.js
var N = class extends u {
	#e;
	constructor(e = {}) {
		super(), this.config = e, this.#e = /* @__PURE__ */ new Map();
	}
	build(e, t, n) {
		let r = t.queryKey, i = t.queryHash ?? f(r, t), a = this.get(i);
		return a || (a = new v({
			client: e,
			queryKey: r,
			queryHash: i,
			options: e.defaultQueryOptions(t),
			state: n,
			defaultOptions: e.getQueryDefaults(r)
		}), this.add(a)), a;
	}
	add(e) {
		this.#e.has(e.queryHash) || (this.#e.set(e.queryHash, e), this.notify({
			type: "added",
			query: e
		}));
	}
	remove(e) {
		this.#e.get(e.queryHash) === e && (e.destroy(), this.#e.delete(e.queryHash), this.notify({
			type: "removed",
			query: e
		}));
	}
	clear() {
		g.batch(() => {
			this.getAll().forEach((e) => {
				this.remove(e);
			});
		});
	}
	get(e) {
		return this.#e.get(e);
	}
	getAll() {
		return [...this.#e.values()];
	}
	find(e) {
		let t = {
			exact: !0,
			...e
		};
		return this.getAll().find((e) => m(t, e));
	}
	findAll(e = {}) {
		let t = this.getAll();
		return Object.keys(e).length > 0 ? t.filter((t) => m(e, t)) : t;
	}
	notify(e) {
		g.batch(() => {
			this.listeners.forEach((t) => {
				t(e);
			});
		});
	}
	onFocus() {
		g.batch(() => {
			this.getAll().forEach((e) => {
				e.onFocus();
			});
		});
	}
	onOnline() {
		g.batch(() => {
			this.getAll().forEach((e) => {
				e.onOnline();
			});
		});
	}
}, P = class {
	#e;
	#t;
	#n;
	#r;
	#i;
	#a;
	#o;
	#s;
	constructor(e = {}) {
		this.#e = e.queryCache || new N(), this.#t = e.mutationCache || new j(), this.#n = e.defaultOptions || {}, this.#r = /* @__PURE__ */ new Map(), this.#i = /* @__PURE__ */ new Map(), this.#a = 0;
	}
	mount() {
		this.#a++, this.#a === 1 && (this.#o = _.subscribe(async (e) => {
			e && (await this.resumePausedMutations(), this.#e.onFocus());
		}), this.#s = l.subscribe(async (e) => {
			e && (await this.resumePausedMutations(), this.#e.onOnline());
		}));
	}
	unmount() {
		this.#a--, this.#a === 0 && (this.#o?.(), this.#o = void 0, this.#s?.(), this.#s = void 0);
	}
	isFetching(e) {
		return this.#e.findAll({
			...e,
			fetchStatus: "fetching"
		}).length;
	}
	isMutating(e) {
		return this.#t.findAll({
			...e,
			status: "pending"
		}).length;
	}
	getQueryData(e) {
		let t = this.defaultQueryOptions({ queryKey: e });
		return this.#e.get(t.queryHash)?.state.data;
	}
	ensureQueryData(e) {
		let t = this.defaultQueryOptions(e), n = this.#e.build(this, t), r = n.state.data;
		return r === void 0 ? this.fetchQuery(e) : (e.revalidateIfStale && n.isStaleByTime(y(t.staleTime, n)) && this.prefetchQuery(t), Promise.resolve(r));
	}
	getQueriesData(e) {
		return this.#e.findAll(e).map(({ queryKey: e, state: t }) => [e, t.data]);
	}
	setQueryData(e, t, n) {
		let r = this.defaultQueryOptions({ queryKey: e }), i = this.#e.get(r.queryHash)?.state.data, a = ee(t, i);
		if (a !== void 0) return this.#e.build(this, r).setData(a, {
			...n,
			manual: !0
		});
	}
	setQueriesData(e, t, n) {
		return g.batch(() => this.#e.findAll(e).map(({ queryKey: e }) => [e, this.setQueryData(e, t, n)]));
	}
	getQueryState(e) {
		let t = this.defaultQueryOptions({ queryKey: e });
		return this.#e.get(t.queryHash)?.state;
	}
	removeQueries(e) {
		let t = this.#e;
		g.batch(() => {
			t.findAll(e).forEach((e) => {
				t.remove(e);
			});
		});
	}
	resetQueries(e, t) {
		let n = this.#e;
		return g.batch(() => {
			let r = n.findAll(e), i = new Set(r);
			return r.forEach((e) => {
				e.reset();
			}), this.refetchQueries({
				type: "active",
				predicate: (e) => i.has(e)
			}, t);
		});
	}
	cancelQueries(e, t = {}) {
		let n = {
			revert: !0,
			...t
		}, r = g.batch(() => this.#e.findAll(e).map((e) => e.cancel(n)));
		return Promise.all(r).then(p).catch(p);
	}
	invalidateQueries(e, t = {}) {
		return g.batch(() => (this.#e.findAll(e).forEach((e) => {
			e.invalidate();
		}), e?.refetchType === "none" ? Promise.resolve() : this.refetchQueries({
			...e,
			type: e?.refetchType ?? e?.type ?? "active"
		}, t)));
	}
	refetchQueries(e, t = {}) {
		let n = {
			...t,
			cancelRefetch: t.cancelRefetch ?? !0
		}, r = g.batch(() => this.#e.findAll(e).filter((e) => !e.isDisabled() && !e.isStatic()).map((e) => {
			let t = e.fetch(void 0, n);
			return n.throwOnError || (t = t.catch(p)), e.state.fetchStatus === "paused" ? Promise.resolve() : t;
		}));
		return Promise.all(r).then(p);
	}
	async query(e) {
		let t = this.defaultQueryOptions(e);
		t.retry === void 0 && (t.retry = !1);
		let n = this.#e.build(this, t), r = n.isStaleByTime(y(t.staleTime, n)) ? await n.fetch(t) : n.state.data, i = t.select;
		return i ? i(r) : r;
	}
	fetchQuery(e) {
		let t = this.defaultQueryOptions(e);
		t.retry === void 0 && (t.retry = !1);
		let n = this.#e.build(this, t);
		return n.isStaleByTime(y(t.staleTime, n)) ? n.fetch(t) : Promise.resolve(n.state.data);
	}
	prefetchQuery(e) {
		return this.fetchQuery(e).then(p).catch(p);
	}
	infiniteQuery(e) {
		return e._type = "infinite", this.query(e);
	}
	fetchInfiniteQuery(e) {
		return e._type = "infinite", this.fetchQuery(e);
	}
	prefetchInfiniteQuery(e) {
		return this.fetchInfiniteQuery(e).then(p).catch(p);
	}
	ensureInfiniteQueryData(e) {
		return e._type = "infinite", this.ensureQueryData(e);
	}
	resumePausedMutations() {
		return l.isOnline() ? this.#t.resumePausedMutations() : Promise.resolve();
	}
	getQueryCache() {
		return this.#e;
	}
	getMutationCache() {
		return this.#t;
	}
	getDefaultOptions() {
		return this.#n;
	}
	setDefaultOptions(e) {
		this.#n = e;
	}
	setQueryDefaults(e, t) {
		this.#r.set(d(e), {
			queryKey: e,
			defaultOptions: t
		});
	}
	getQueryDefaults(e) {
		let t = [...this.#r.values()], n = {};
		return t.forEach((t) => {
			c(e, t.queryKey) && Object.assign(n, t.defaultOptions);
		}), n;
	}
	setMutationDefaults(e, t) {
		this.#i.set(d(e), {
			mutationKey: e,
			defaultOptions: t
		});
	}
	getMutationDefaults(e) {
		let t = [...this.#i.values()], n = {};
		return t.forEach((t) => {
			c(e, t.mutationKey) && Object.assign(n, t.defaultOptions);
		}), n;
	}
	defaultQueryOptions(e) {
		if (e._defaulted) return e;
		let t = {
			...this.#n.queries,
			...this.getQueryDefaults(e.queryKey),
			...e,
			_defaulted: !0
		};
		return t.queryHash ||= f(t.queryKey, t), t.refetchOnReconnect === void 0 && (t.refetchOnReconnect = t.networkMode !== "always"), t.throwOnError === void 0 && (t.throwOnError = !!t.suspense), !t.networkMode && t.persister && (t.networkMode = "offlineFirst"), t.queryFn === o && (t.enabled = !1), t;
	}
	defaultMutationOptions(e) {
		return e?._defaulted ? e : {
			...this.#n.mutations,
			...e?.mutationKey && this.getMutationDefaults(e.mutationKey),
			...e,
			_defaulted: !0
		};
	}
	clear() {
		this.#e.clear(), this.#t.clear();
	}
}, F = /* @__PURE__ */ t(r(), 1), I = e(), L = Object.defineProperty, R = (e, t) => L(e, "name", {
	value: t,
	configurable: !0
}), [z, B] = S("Tooltip", [D]);
D();
var ie = "TooltipProvider", V = 700, [H, ae] = z(ie), U = /* @__PURE__ */ R((e) => {
	let { __scopeTooltip: t, delayDuration: n = V, skipDelayDuration: r = 300, disableHoverableContent: i = !1, children: a } = e, o = F.useRef(!0), s = F.useRef(!1), c = F.useRef(0);
	return F.useEffect(() => {
		let e = c.current;
		return () => window.clearTimeout(e);
	}, []), /* @__PURE__ */ (0, I.jsx)(H, {
		scope: t,
		isOpenDelayedRef: o,
		delayDuration: n,
		onOpen: F.useCallback(() => {
			r <= 0 || (window.clearTimeout(c.current), o.current = !1);
		}, [r]),
		onClose: F.useCallback(() => {
			r <= 0 || (window.clearTimeout(c.current), c.current = window.setTimeout(() => o.current = !0, r));
		}, [r]),
		isPointerInTransitRef: s,
		onPointerInTransitChange: F.useCallback((e) => {
			s.current = e;
		}, []),
		disableHoverableContent: i,
		children: a
	});
}, "TooltipProvider"), [oe, se] = z("Tooltip"), [ce, W] = z("TooltipPortal", { forceMount: void 0 });
x("TooltipContent");
function le(e, t) {
	let n = Math.abs(t.top - e.y), r = Math.abs(t.bottom - e.y), i = Math.abs(t.right - e.x), a = Math.abs(t.left - e.x);
	switch (Math.min(n, r, i, a)) {
		case a: return "left";
		case i: return "right";
		case n: return "top";
		case r: return "bottom";
		default: throw Error("unreachable");
	}
}
R(le, "getExitSideFromRect");
function ue(e, t, n = 5) {
	let r = [];
	switch (t) {
		case "top":
			r.push({
				x: e.x - n,
				y: e.y + n
			}, {
				x: e.x + n,
				y: e.y + n
			});
			break;
		case "bottom":
			r.push({
				x: e.x - n,
				y: e.y - n
			}, {
				x: e.x + n,
				y: e.y - n
			});
			break;
		case "left":
			r.push({
				x: e.x + n,
				y: e.y - n
			}, {
				x: e.x + n,
				y: e.y + n
			});
			break;
		case "right": r.push({
			x: e.x - n,
			y: e.y - n
		}, {
			x: e.x - n,
			y: e.y + n
		});
	}
	return r;
}
R(ue, "getPaddedExitPoints");
function de(e) {
	let { top: t, right: n, bottom: r, left: i } = e;
	return [
		{
			x: i,
			y: t
		},
		{
			x: n,
			y: t
		},
		{
			x: n,
			y: r
		},
		{
			x: i,
			y: r
		}
	];
}
R(de, "getPointsFromRect");
function fe(e, t) {
	let { x: n, y: r } = e, i = !1;
	for (let e = 0, a = t.length - 1; e < t.length; a = e++) {
		let o = t[e], s = t[a], c = o.x, l = o.y, u = s.x, d = s.y;
		l > r != d > r && n < (u - c) * (r - l) / (d - l) + c && (i = !i);
	}
	return i;
}
R(fe, "isPointInPolygon");
function pe(e) {
	let t = e.slice();
	return t.sort((e, t) => e.x < t.x ? -1 : e.x > t.x ? 1 : e.y < t.y ? -1 : +(e.y > t.y)), me(t);
}
R(pe, "getHull");
function me(e) {
	if (e.length <= 1) return e.slice();
	let t = [];
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		for (; t.length >= 2;) {
			let e = t[t.length - 1], n = t[t.length - 2];
			if ((e.x - n.x) * (r.y - n.y) >= (e.y - n.y) * (r.x - n.x)) t.pop();
			else break;
		}
		t.push(r);
	}
	t.pop();
	let n = [];
	for (let t = e.length - 1; t >= 0; t--) {
		let r = e[t];
		for (; n.length >= 2;) {
			let e = n[n.length - 1], t = n[n.length - 2];
			if ((e.x - t.x) * (r.y - t.y) >= (e.y - t.y) * (r.x - t.x)) n.pop();
			else break;
		}
		n.push(r);
	}
	return n.pop(), t.length === 1 && n.length === 1 && t[0].x === n[0].x && t[0].y === n[0].y ? t : t.concat(n);
}
R(me, "getHullPresorted");
function he(...e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of e) if (typeof n == "string") for (let e of String(n).trim().split(/\s+/)) e && t.add(e);
	return t.size > 0 ? Array.from(t).join(" ") : void 0;
}
R(he, "concatAriaDescribedby");
// src/components/ui/tooltip.tsx
var ge = re();
function _e({ delayDuration: e = 0, ...t }) {
	return /* @__PURE__ */ (0, I.jsx)(U, {
		"data-slot": "tooltip-provider",
		delayDuration: e,
		...t
	});
}
// node_modules/lucide-react/dist/esm/icons/circle-check.mjs
var ve = {
	name: "circle-check",
	size: 24,
	node: [["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}], ["path", {
		d: "m16 9-5.5 5.5L8 12",
		key: "xofnsj"
	}]],
	aliases: ["check-circle-2"]
};
ve.node;
var ye = O(ve), be = {
	name: "info",
	size: 24,
	node: [
		["circle", {
			cx: "12",
			cy: "12",
			r: "10",
			key: "1mglay"
		}],
		["path", {
			d: "M12 16v-4",
			key: "1dtifu"
		}],
		["path", {
			d: "M12 8h.01",
			key: "e9boi3"
		}]
	]
};
be.node;
var xe = O(be), Se = {
	name: "loader-circle",
	size: 24,
	node: [["path", {
		d: "M21 12a9 9 0 1 1-6.219-8.56",
		key: "13zald"
	}]],
	aliases: ["loader-2"]
};
Se.node;
var Ce = O(Se), we = {
	name: "octagon-x",
	size: 24,
	node: [
		["path", {
			d: "m15 9-6 6",
			key: "1uzhvr"
		}],
		["path", {
			d: "M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z",
			key: "2d38gg"
		}],
		["path", {
			d: "m9 9 6 6",
			key: "z0biqf"
		}]
	],
	aliases: ["x-octagon"]
};
we.node;
var Te = O(we), Ee = {
	name: "triangle-alert",
	size: 24,
	node: [
		["path", {
			d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
			key: "wmoenq"
		}],
		["path", {
			d: "M12 9v4",
			key: "juzpu7"
		}],
		["path", {
			d: "M12 17h.01",
			key: "p32p05"
		}]
	],
	aliases: ["alert-triangle"]
};
Ee.node;
var De = O(Ee), Oe = ({ ...e }) => /* @__PURE__ */ (0, I.jsx)(A, {
	theme: "light",
	className: "toaster group",
	icons: {
		success: /* @__PURE__ */ (0, I.jsx)(ye, { className: "size-4" }),
		info: /* @__PURE__ */ (0, I.jsx)(xe, { className: "size-4" }),
		warning: /* @__PURE__ */ (0, I.jsx)(De, { className: "size-4" }),
		error: /* @__PURE__ */ (0, I.jsx)(Te, { className: "size-4" }),
		loading: /* @__PURE__ */ (0, I.jsx)(Ce, { className: "size-4 animate-spin" })
	},
	style: {
		"--normal-bg": "var(--popover)",
		"--normal-text": "var(--popover-foreground)",
		"--normal-border": "var(--border)",
		"--border-radius": "var(--radius)"
	},
	...e
}), G = {
	blank: () => import("./chunks/BlankPage-BTGR2470.js"),
	paxchart: () => import("./chunks/PaxChartPage-s6QN-KYa.js"),
	"slip-search": () => import("./chunks/SlipSearchPage-DlIXerxb.js"),
	backups: () => import("./chunks/BackupsPage-9zFLX8H8.js"),
	changelog: () => import("./chunks/ChangelogPage-BLVBxL-A.js"),
	"key-cards": () => import("./chunks/KeyCardsPage-BBHxBb9N.js"),
	"pending-checkouts": () => import("./chunks/PendingCheckoutsPage-DAxq4nrD.js"),
	"building-hisaab": () => import("./chunks/BuildingHisaabPage-CJ7wxBac.js"),
	reports: () => import("./chunks/ReportsPage-ByXdT1cE.js"),
	hr: () => import("./chunks/HrPage-BKQQIEde.js"),
	"lost-found": () => import("./chunks/LostFoundPage-luQKJJXc.js"),
	"slip-builder": () => import("./chunks/SlipBuilderPage-BDjGKqYf.js"),
	"menu-card": () => import("./chunks/MenuCardPage-y56SakjW.js"),
	performance: () => import("./chunks/PerformancePage-DkM1DZGA.js"),
	occupancy: () => import("./chunks/OccupancyPage-B972OvBR.js"),
	housekeeping: () => import("./chunks/HousekeepingPage-De95ute_.js"),
	departures: () => import("./chunks/DeparturesPage-DGylobur.js"),
	tosha: () => import("./chunks/ToshaPage-Bqr18Af9.js"),
	grouping: () => import("./chunks/GroupingPage-CIxcQvj-.js"),
	"group-export": () => import("./chunks/GroupExportPage-PzlkK5n0.js"),
	kg: () => import("./chunks/KgPage-CIW9Cb3K.js"),
	mawaid: () => import("./chunks/MawaidPage-BuFNj2z6.js"),
	timeline: () => import("./chunks/TimelinePage-D9DFIj81.js"),
	grid: () => import("./chunks/GridPage-Dt_Lov0I.js"),
	checkins: () => import("./chunks/CheckinsPage-ChK5cRSx.js"),
	transport: () => import("./chunks/TransportPage-B2l7t-UR.js"),
	slip: () => import("./chunks/SlipPage-YSXkkon7.js"),
	forecast: () => import("./chunks/ForecastPage-DuHksdDw.js"),
	home: () => import("./chunks/HomePage-Da8sifqc.js"),
	setup: () => import("./chunks/SetupPage-DVkgTfGe.js"),
	builder: () => import("./chunks/BuilderPage-CcPFCF6e.js"),
	settings: () => import("./chunks/SettingsPage-u2D7DtHc.js"),
	login: () => import("./chunks/LoginPage--HAQRmqS.js"),
	admin: () => import("./chunks/AdminPage-DWFoz1Eb.js"),
	ums: () => import("./chunks/UmsPage-BwXiXZhf.js"),
	laundry: () => import("./chunks/LaundryPage-CqVZ7WOx.js"),
	"signage-builder": () => import("./chunks/SignageBuilderPage-OJWHr0bB.js"),
	"notice-screens": () => import("./chunks/NoticeScreensPage-BDX8LnH6.js"),
	"laundry-admin": () => import("./chunks/LaundryAdminPage-a7YUpNaE.js"),
	"transport-import": () => import("./chunks/TransportImportPage-BvNH1WR6.js"),
	"transport-print": () => import("./chunks/TransportPrintPage-Bx661raL.js"),
	arrival: () => import("./chunks/ArrivalPage-BfsCNALv.js"),
	passport: () => import("./chunks/PassportPage-CqLolYra.js")
}, ke = 2e4, K = 6e5, Ae = 4, je = {
	"ums-import": "UMS import",
	"ums-undo": "UMS import undone",
	"ums-redo": "UMS import redone",
	"allocate-day": "Room allocation",
	"alloc-undo": "Room allocation undone",
	planner: "Room planner",
	delay: "Delayed departures",
	"from-to-fill": "From / To filled",
	"json-import": "Slips imported",
	bulk: "Many slips"
}, q = (e) => je[e.replace(/^bulk:/, "")] || e.replace(/^bulk:/, ""), Me = (e) => [e.sh && `SH ${e.sh}`, e.grp].filter(Boolean).join(" · "), Ne = (e) => new Date(e).toLocaleTimeString("en-GB", {
	hour: "2-digit",
	minute: "2-digit"
}), Pe = (e) => new Date(e).toLocaleString("en-GB", {
	day: "2-digit",
	month: "short",
	hour: "2-digit",
	minute: "2-digit"
}), Fe = (e) => e.charAt(0).toUpperCase() + e.slice(1);
function Ie(e, t) {
	if (e.kind.startsWith("bulk:")) {
		let n = e.items || [];
		k(`${q(e.kind)} by ${e.desk_name}`, {
			description: `${e.text || `${n.length} slips`}: ${n.slice(0, 3).map((e) => `${e.sh ? "SH " + e.sh : ""} ${e.text}`.trim()).join(" · ")}${n.length > 3 ? ` · +${n.length - 3} more` : ""}`,
			duration: 12e3,
			action: n.length > 3 ? {
				label: "View",
				onClick: t
			} : void 0
		});
	} else k(`${Fe(e.text)}`, {
		description: `${Me(e)} — by ${e.desk_name} · ${Ne(e.at)}`,
		duration: 9e3
	});
}
function Le({ cloud: e, siteId: t, deskId: n }) {
	let r = (0, F.useRef)(null), i = (0, F.useRef)(Date.now()), a = (0, F.useRef)(null), o = (0, F.useRef)([]), s = (0, F.useRef)(!1), [c, l] = (0, F.useState)(null), u = (0, F.useRef)([]);
	(0, F.useEffect)(() => {
		let c = !0;
		r.current = null, o.current = [], u.current = [];
		let d = (e) => e.filter((e) => e.desk_id !== n), f = (t) => {
			e.request("POST", "/api/activity/seen", { id: t }).catch(() => {});
		}, p = () => l({
			title: "Recent changes",
			items: [...u.current].reverse()
		});
		async function m(n = "toast") {
			if (!s.current && c) {
				s.current = !0;
				try {
					let a = r.current == null, s = await e.request("GET", `/api/activity?site=${t}${a ? "" : `&after=${r.current}`}`);
					if (!c) return;
					let m = d(s.items || []), h = r.current ?? 0;
					r.current = Math.max(h, Number(s.last) || 0, ...(s.items || []).map((e) => e.id)), u.current = [...u.current, ...m].slice(-200);
					let g = Date.now() - i.current >= K;
					if (a || n === "away") {
						let e = [...o.current, ...m];
						o.current = [], e.length && l({
							title: a ? "Changes since you were last here" : "Changes while you were away",
							items: [...e].reverse()
						});
					} else if (g || document.visibilityState !== "visible") o.current = [...o.current, ...m].slice(-300);
					else if (m.length > Ae) k(`${m.length} changes by ${[...new Set(m.map((e) => e.desk_name))].join(", ")}`, {
						description: m.slice(-3).map((e) => e.kind.startsWith("bulk:") ? q(e.kind) : `${e.sh ? "SH " + e.sh + ": " : ""}${e.text}`).join(" · "),
						duration: 12e3,
						action: {
							label: "View",
							onClick: p
						}
					});
					else for (let e of m) Ie(e, p);
					(r.current > h || a) && f(r.current);
				} catch {} finally {
					s.current = !1;
				}
			}
		}
		m();
		let h = window.setInterval(() => {
			document.visibilityState === "visible" && m();
		}, ke), g = () => {
			if (document.visibilityState === "hidden") {
				a.current = Date.now();
				return;
			}
			let e = a.current != null && Date.now() - a.current >= K;
			a.current = null, m(e || o.current.length ? "away" : "toast");
		}, _ = () => {
			let e = Date.now() - i.current >= K;
			i.current = Date.now(), e && m("away");
		};
		document.addEventListener("visibilitychange", g);
		for (let e of [
			"pointerdown",
			"keydown",
			"wheel"
		]) window.addEventListener(e, _, { passive: !0 });
		return () => {
			c = !1, window.clearInterval(h), document.removeEventListener("visibilitychange", g);
			for (let e of [
				"pointerdown",
				"keydown",
				"wheel"
			]) window.removeEventListener(e, _);
		};
	}, [t, n]);
	let d = c ? c.items.reduce((e, t) => e + (t.items ? t.items.length : 1), 0) : 0;
	return /* @__PURE__ */ (0, I.jsx)(E, {
		open: !!c,
		onOpenChange: (e) => {
			e || l(null);
		},
		children: /* @__PURE__ */ (0, I.jsxs)(C, {
			className: "flex max-h-[85vh] max-w-2xl flex-col",
			children: [
				/* @__PURE__ */ (0, I.jsxs)(te, { children: [/* @__PURE__ */ (0, I.jsxs)(w, { children: ["🔔 ", c?.title] }), /* @__PURE__ */ (0, I.jsxs)(T, { children: [
					d,
					" change",
					d === 1 ? "" : "s",
					" made by other logins",
					c?.items.length ? `, from ${Pe(c.items[c.items.length - 1].at)}` : "",
					"."
				] })] }),
				/* @__PURE__ */ (0, I.jsx)("ol", {
					className: "min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1",
					children: c?.items.map((e) => /* @__PURE__ */ (0, I.jsxs)("li", {
						className: "rounded-lg border bg-card p-2.5 text-sm",
						children: [/* @__PURE__ */ (0, I.jsxs)("div", {
							className: "flex flex-wrap items-baseline justify-between gap-2",
							children: [/* @__PURE__ */ (0, I.jsx)("b", { children: e.kind.startsWith("bulk:") ? `${q(e.kind)} — ${e.text}` : Me(e) || "Slip" }), /* @__PURE__ */ (0, I.jsxs)("small", {
								className: "text-muted-foreground",
								children: [
									e.desk_name,
									" · ",
									Pe(e.at)
								]
							})]
						}), e.kind.startsWith("bulk:") ? /* @__PURE__ */ (0, I.jsxs)("ul", {
							className: "mt-1 space-y-0.5 text-[13px]",
							children: [(e.items || []).slice(0, 60).map((e, t) => /* @__PURE__ */ (0, I.jsxs)("li", { children: [
								/* @__PURE__ */ (0, I.jsx)("span", {
									className: "font-medium",
									children: Me(e)
								}),
								": ",
								e.text
							] }, t)), (e.items || []).length > 60 && /* @__PURE__ */ (0, I.jsxs)("li", {
								className: "text-muted-foreground",
								children: [
									"… and ",
									(e.items || []).length - 60,
									" more"
								]
							})]
						}) : /* @__PURE__ */ (0, I.jsx)("div", {
							className: "mt-0.5",
							children: Fe(e.text)
						})]
					}, e.id))
				}),
				/* @__PURE__ */ (0, I.jsx)(ne, {
					onClick: () => l(null),
					children: "Got it"
				})
			]
		})
	});
}
// src/shell/route.ts
var Re = { movement: "checkins" };
function J(e) {
	let [t, n = ""] = e.replace(/^#\/?/, "").split("?"), [r = "", i = ""] = t.split("/");
	return {
		siteId: r,
		viewId: Re[i] || i,
		params: new URLSearchParams(n)
	};
}
function Y(e, t, n) {
	let r = n ? new URLSearchParams(n).toString() : "";
	return `#/${e}/${t}${r ? "?" + r : ""}`;
}
function ze(e, t) {
	let n = J(e), { desk: r } = t, i = (e) => t.VIEWS.find((t) => t.id === e), a = t.SITES[t.prefs.startSite || ""] ? t.prefs.startSite : t.SITES[t.lastSite || ""] ? t.lastSite : t.DEFAULT_SITE, o = t.SITES[n.siteId] ? n.siteId : r?.site || a;
	r && (o = t.siteFor(r, o));
	let s = n.viewId ? void 0 : t.VIEWS.find((e) => e.id === t.prefs.startView && e.id !== "login"), c = r ? t.VIEWS.find((e) => e.id === n.viewId && e.id !== "login") || s || i("home") : i("login"), l = null;
	r && !t.canOpen(c.id, r) && (c.id !== "home" && (l = `${c.label} is not available for ${r.name}. Ask the admin if you need it.`), c = i(t.firstPage(r, t.NAV.flatMap((e) => e.views))) || i("blank") || c);
	let u = new URLSearchParams(n.params);
	u.delete("source");
	let d = r && (o !== n.siteId || c.id !== n.viewId || n.params.has("source")) ? Y(o, c.id, u) : null;
	return {
		siteId: o,
		view: c,
		params: u,
		replace: d,
		notice: l,
		key: `${r ? r.id : "-"}/${o}/${c.id}/${u}`
	};
}
// src/shell/nav.css?raw
var Be = /* @__PURE__ */ t(a(), 1);
// src/shell/store.ts
function Ve(e) {
	let t = e, n = /* @__PURE__ */ new Set();
	return {
		get: () => t,
		set: (e) => {
			t = e, n.forEach((e) => e());
		},
		subscribe: (e) => (n.add(e), () => {
			n.delete(e);
		})
	};
}
var X = Ve({
	badge: {
		text: "",
		warn: !1
	},
	notice: ""
}), He, Z = {
	get: X.get,
	subscribe: X.subscribe,
	setBadge: (e, t = !1) => X.set({
		...X.get(),
		badge: {
			text: e || "",
			warn: !!t
		}
	}),
	notice: (e) => {
		X.set({
			...X.get(),
			notice: e
		}), clearTimeout(He), He = setTimeout(() => X.set({
			...X.get(),
			notice: ""
		}), 6e3);
	}
}, Ue = (e) => !!e && ([
	"INPUT",
	"TEXTAREA",
	"SELECT"
].includes(e.tagName) || e.isContentEditable), We = () => window.matchMedia("(min-width: 901px)");
function Ge({ deps: e, siteId: t, viewId: n, desk: r, onSiteChange: i, onLogout: a }) {
	let o = (0, F.useRef)(null), [s, c] = (0, F.useState)(null);
	(0, F.useLayoutEffect)(() => {
		let e = o.current;
		c(e.shadowRoot || e.attachShadow({ mode: "open" }));
	}, []);
	let [l, u] = (0, F.useState)(() => e.prefs.getPrefs()), [d, f] = (0, F.useState)(() => We().matches), p = l.navLayout === "side" && d && !!r;
	return (0, F.useEffect)(() => {
		let t = () => u(e.prefs.getPrefs()), n = We(), r = () => f(n.matches);
		return window.addEventListener("pms:prefs", t), n.addEventListener("change", r), () => {
			window.removeEventListener("pms:prefs", t), n.removeEventListener("change", r);
		};
	}, []), (0, F.useEffect)(() => {
		let e = o.current;
		p ? (e.setAttribute("data-layout", "side"), document.documentElement.dataset.nav = "side") : (e.removeAttribute("data-layout"), delete document.documentElement.dataset.nav), e.toggleAttribute("data-no-sync-text", !l.showSyncText);
	}, [p, l.showSyncText]), /* @__PURE__ */ (0, I.jsx)("site-nav", {
		ref: o,
		"data-shell": "",
		hidden: !r || void 0,
		children: s && r && (0, Be.createPortal)(/* @__PURE__ */ (0, I.jsxs)(I.Fragment, { children: [/* @__PURE__ */ (0, I.jsx)("style", { children: "/* The menu bar of the React shell (shell/SiteNav.tsx), drawn inside the <site-nav> element's shadow root so page styles never reach it.\r\n   Moved unchanged from core/nav.js (the legacy menu bar). */\r\n:host{\r\n  --gold:#d4af37; --gold-2:#e6b422; --gold-soft:#f3d984; --ink:#1f160f; --muted:#3d3226;\r\n  --edge:#e8dcc4; --panel:#fffdf8; --shadow:0 10px 30px rgba(60,40,10,.12);\r\n  display:block; position:sticky; top:0; z-index:1000;\r\n  font:500 15px/1.4 \"EB Garamond\",Garamond,Georgia,serif; color:var(--ink);\r\n}\r\n:host([hidden]){ display:none }\r\n*{ box-sizing:border-box; scrollbar-width:none }\r\n*::-webkit-scrollbar{ display:none }\r\na{ color:inherit; text-decoration:none }\r\nbutton{ font:inherit; color:inherit; cursor:pointer }\r\nkbd{ font:10px/1 ui-monospace,Consolas,monospace; color:var(--muted); border:1px solid var(--edge); border-radius:4px; padding:2px 4px; margin-left:8px; background:#fff }\r\n\r\n.bar{\r\n  position:relative; display:flex; align-items:center; gap:14px;\r\n  padding:8px 18px; min-height:56px;\r\n  background:linear-gradient(180deg,#fffefa,#fff9ec); border-bottom:1px solid var(--edge); box-shadow:var(--shadow);\r\n}\r\n.brand{ display:inline-flex; gap:6px; font-weight:800; letter-spacing:.14em; text-transform:uppercase; font-size:14px; white-space:nowrap }\r\n.brand .b2{ color:var(--gold) }\r\n.burger, .here{ display:none }\r\n\r\n.cats{ display:flex; align-items:center; gap:2px; margin-left:8px }\r\n.cat{\r\n  display:inline-flex; align-items:center; gap:6px; border:0; background:none;\r\n  padding:8px 12px; border-radius:10px; font-weight:650; font-size:13.5px; white-space:nowrap;\r\n}\r\n.cat:hover, .dd.open > .cat{ background:#fbf1d8 }\r\n.cat.active, .dd.active > .cat{ color:#8a6512; box-shadow:inset 0 -2px 0 var(--gold) }\r\n.caret{ width:6px; height:6px; border-right:1.5px solid currentColor; border-bottom:1.5px solid currentColor; transform:rotate(45deg) translateY(-2px); opacity:.6 }\r\n\r\n.dd{ position:relative }\r\n.menu{\r\n  position:absolute; top:calc(100% + 6px); left:0; min-width:270px; padding:6px;\r\n  background:var(--panel); border:1px solid var(--edge); border-radius:12px; box-shadow:0 18px 40px rgba(60,40,10,.18);\r\n  display:none; z-index:10;\r\n}\r\n.menu.right{ left:auto; right:0 }\r\n.dd.open > .menu{ display:grid; gap:2px }\r\n.mi{ display:grid; gap:1px; padding:8px 10px; border-radius:8px; border:0; background:none; text-align:left; width:100% }\r\n.mi:hover, .mi:focus-visible{ background:#fbf1d8; outline:none }\r\n.mi[aria-current=\"page\"]{ background:#f6e7bf }\r\n.mi-l{ font-weight:650; display:flex; align-items:center; justify-content:space-between }\r\n.mi-h{ font-size:12px; color:var(--muted) }\r\n.mi.static{ cursor:default; border-bottom:1px solid var(--edge); border-radius:8px 8px 0 0; margin-bottom:4px }\r\n.mi.static:hover{ background:none }\r\n.logout .mi-l{ color:#a12a2a }\r\n\r\n.tools{ margin-left:auto; display:flex; align-items:center; gap:10px }\r\n.site-sw{ border-bottom:1px solid var(--edge); margin-bottom:4px; padding-bottom:4px }\r\n.site-mi[aria-pressed=\"true\"]{ background:#f6e7bf }\r\n.site-mi[aria-pressed=\"true\"] .mi-h::after{ content:\" · showing now\" }\r\n.quick{ display:flex; gap:6px; padding:6px 18px; overflow-x:auto; scrollbar-width:thin;\r\n  background:#fffaf0; border-bottom:1px solid var(--edge); box-shadow:0 4px 12px rgba(60,40,10,.06) }\r\n.quick a{ flex:none; padding:4px 12px; border:1px solid var(--edge); border-radius:999px; background:#fff;\r\n  font-size:12.5px; font-weight:650; white-space:nowrap }\r\n.quick a:hover{ background:#fbf1d8; border-color:var(--gold) }\r\n.quick a[aria-current=\"page\"]{ background:var(--gold); border-color:var(--gold); color:#fff }\r\n.notice{ padding:6px 18px; background:#fff4de; color:#8a5a00; border-bottom:1px solid #f3d984; font-size:13px; font-weight:600 }\r\n[hidden]{ display:none !important }\r\n.seg{ display:inline-flex; border:1px solid var(--gold); border-radius:999px; overflow:hidden; flex:none }\r\n.seg button{ border:0; background:transparent; padding:5px 12px; font-size:12.5px; font-weight:700; color:#7a5b13 }\r\n.seg button + button{ border-left:1px solid var(--gold) }\r\n.seg button[aria-pressed=\"true\"]{ background:var(--gold); color:#fff }\r\n.desk{ display:inline-flex; align-items:center; gap:8px; border:1px solid var(--edge); background:#fff; border-radius:999px; padding:5px 12px; font-size:12.5px; font-weight:650; white-space:nowrap; max-width:220px }\r\n.desk #deskName{ overflow:hidden; text-overflow:ellipsis }\r\n.desk:hover, .desk-dd.open .desk{ background:#fbf1d8 }\r\n.sync:not(.warn){ display:none !important } /* no \"Synced\" sign on the bar; it shows only when offline / not saved */\r\n.sync{ display:inline-flex; align-items:center; gap:6px; font-size:12px; color:var(--muted); white-space:nowrap }\r\n.sync i{ width:8px; height:8px; border-radius:50%; background:#2f9e44; box-shadow:0 0 0 3px rgba(47,158,68,.15) }\r\n:host([data-no-sync-text]) #syncText{ display:none }\r\n.sync.warn{ color:#a12a2a; font-weight:650 }\r\n.sync.warn i{ background:#d9480f; box-shadow:0 0 0 3px rgba(217,72,15,.18) }\r\n\r\n.progress{ position:absolute; left:0; bottom:-1px; height:2px; width:0; background:linear-gradient(90deg,#ffe9a6,var(--gold),#b88900); transition:width .1s linear }\r\n\r\n/* drawer (phones) */\r\n.backdrop{ position:fixed; inset:0; background:rgba(20,14,8,.45); z-index:1001; opacity:0; transition:opacity .2s }\r\n.backdrop.show{ opacity:1 }\r\n.drawer{\r\n  position:fixed; top:0; bottom:0; left:0; width:min(320px, 86vw); z-index:1002;\r\n  background:var(--panel); box-shadow:10px 0 40px rgba(20,14,8,.25);\r\n  display:flex; flex-direction:column; transform:translateX(-105%); transition:transform .25s cubic-bezier(.2,.8,.2,1);\r\n  visibility:hidden;\r\n}\r\n.drawer.open{ transform:none; visibility:visible }\r\n.dr-head{ display:flex; align-items:center; justify-content:space-between; padding:14px 14px 10px; border-bottom:1px solid var(--edge) }\r\n.close{ border:0; background:none; font-size:18px; width:40px; height:40px; border-radius:10px }\r\n.close:hover{ background:#fbf1d8 }\r\n.dr-body{ flex:1; overflow:auto; overscroll-behavior:contain; padding:0 8px 12px }\r\n.dr-sec h4{ margin:14px 8px 4px; font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:var(--muted) }\r\n.dr-sec .mi{ padding:10px 10px }\r\n.dr-sec kbd{ display:none }\r\n.dr-foot{ border-top:1px solid var(--edge); padding:12px 14px calc(12px + env(safe-area-inset-bottom)); display:grid; gap:8px }\r\n.dr-desk{ font-weight:700 } .dr-desk small{ display:block; font-weight:500; color:var(--muted) }\r\n.dr-sync{ font-size:12px; color:var(--muted) } .dr-sync.warn{ color:#a12a2a; font-weight:650 }\r\n.dr-link{ font-size:13px; color:#7a5b13; text-decoration:underline; border:0; background:none; padding:0; text-align:left }\r\n.dr-admin{ display:flex; flex-wrap:wrap; gap:4px 14px }\r\n.dr-admin [aria-pressed=\"true\"]{ display:none }\r\n.dr-logout{ border:1px solid #e6bcbc; background:#fff; color:#a12a2a; border-radius:10px; padding:9px; font-weight:650 }\r\n\r\n/* drawer groups: one open at a time */\r\n.dr-sec > button.dr-h{ display:flex; width:100%; align-items:center; justify-content:space-between; margin:6px 0 0; padding:10px 8px; border:0; background:none;\r\n  font-size:12px; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); font-weight:700; border-radius:8px }\r\n.dr-sec > button.dr-h:hover{ background:#fbf1d8 }\r\n.dr-sec .dr-items{ display:none }\r\n.dr-sec.open .dr-items{ display:grid }\r\n.dr-sec.open > .dr-h{ color:#8a6512 }\r\n.dr-sec.open > .dr-h .caret, .sd-grp.open > .sd-h .caret{ transform:rotate(-135deg) translateY(-2px) }\r\n.srch{ border:1px solid var(--edge); background:#fff; border-radius:999px; width:34px; height:34px; display:inline-grid; place-items:center; font-size:14px }\r\n.srch.ai{ background:linear-gradient(135deg, #fff6dc, #fff); border-color:var(--gold) }\r\n.srch:hover{ background:#fbf1d8 }\r\n\r\n/* left sidebar */\r\n.side{ display:none }\r\n:host([data-layout=\"side\"]) .side{ position:fixed; top:0; bottom:0; left:0; width:252px; z-index:1000; display:flex; flex-direction:column;\r\n  background:linear-gradient(180deg,#fffefa,#fff6e2); border-right:1px solid var(--edge); box-shadow:6px 0 24px rgba(60,40,10,.08) }\r\n:host([data-layout=\"side\"]) .bar{ display:none }\r\n.sd-brand{ padding:16px 16px 8px; font-size:13px }\r\n.sd-search{ margin:4px 12px 8px; display:flex; align-items:center; gap:8px; padding:8px 10px; border:1px solid var(--edge); border-radius:10px; background:#fff; color:var(--muted); font-size:13px; text-align:left }\r\n.sd-search span{ flex:1 } .sd-search kbd{ margin:0 }\r\n.sd-search:hover{ border-color:var(--gold) }\r\n.sd-body{ flex:1; overflow:auto; overscroll-behavior:contain; padding:4px 8px 12px }\r\n.sd-grp{ margin-bottom:2px }\r\n.sd-h{ display:flex; width:100%; align-items:center; justify-content:space-between; gap:8px; padding:9px 10px; border:0; background:none; border-radius:10px; font-weight:750; font-size:13.5px; text-align:left }\r\n.sd-h:hover{ background:#fbf1d8 }\r\n.sd-grp.active > .sd-h, a.sd-solo.active{ color:#8a6512 }\r\n.sd-items{ display:none; padding:2px 0 6px 8px; border-left:2px solid #f0e2c2; margin-left:12px }\r\n.sd-grp.open .sd-items{ display:grid; gap:1px }\r\n.sd-items .mi{ padding:7px 10px }\r\n.sd-items .mi-h{ display:none }\r\na.sd-solo{ display:block; padding:9px 10px; border-radius:10px; font-weight:750; font-size:13.5px }\r\na.sd-solo:hover{ background:#fbf1d8 } a.sd-solo[aria-current=\"page\"]{ background:#f6e7bf }\r\n.sd-foot{ border-top:1px solid var(--edge); padding:10px 14px 14px; display:grid; gap:6px; font-size:12.5px }\r\n.sd-desk{ font-weight:700 } .sd-desk small{ display:block; font-weight:500; color:var(--muted) }\r\n.sd-sync{ color:var(--muted); font-size:12px } .sd-sync.warn{ color:#a12a2a; font-weight:650 }\r\n.sd-links{ display:flex; flex-wrap:wrap; gap:4px 12px; align-items:center }\r\n.sd-links a, .sd-links button{ border:0; background:none; padding:0; color:#7a5b13; text-decoration:underline; font-size:12.5px }\r\n.sd-links [aria-pressed=\"true\"]{ font-weight:800; text-decoration:none }\r\n.sd-links .sd-logout{ color:#a12a2a }\r\n\r\n/* quick search */\r\n.qs-back{ position:fixed; inset:0; z-index:1100; background:rgba(20,14,8,.4); display:grid; place-items:start center; padding-top:12vh }\r\n.qs{ width:min(560px,92vw); background:var(--panel); border:1px solid var(--edge); border-radius:14px; box-shadow:0 24px 60px rgba(20,14,8,.35); overflow:hidden }\r\n.qs input{ width:100%; border:0; border-bottom:1px solid var(--edge); padding:14px 16px; font:inherit; font-size:16px; outline:none; background:#fff }\r\n.qs-list{ max-height:50vh; overflow:auto; padding:6px }\r\n.qs-list a{ display:grid; grid-template-columns:1fr auto; gap:2px 10px; padding:9px 10px; border-radius:8px }\r\n.qs-list a small{ grid-column:1 / -1; color:var(--muted); font-size:12px }\r\n.qs-list a em{ font-style:normal; font-size:11px; color:var(--muted); align-self:center }\r\n.qs-list a.on, .qs-list a:hover{ background:#fbf1d8 }\r\n.qs-empty{ padding:14px; color:var(--muted) }\r\n.qs-hint{ padding:6px 12px; font-size:11px; color:var(--muted); border-top:1px solid var(--edge) }\r\n\r\n@media (max-width:1180px){ .sync #syncText{ display:none } .cat{ padding:8px 9px } }\r\n@media (max-width:900px){\r\n  .bar{ gap:8px; padding:6px 10px; min-height:52px }\r\n  .burger{ display:inline-grid; gap:4px; place-content:center; width:42px; height:42px; border:0; background:none; border-radius:10px; flex:none }\r\n  .burger span{ display:block; width:20px; height:2px; background:var(--ink); border-radius:2px }\r\n  .burger:hover{ background:#fbf1d8 }\r\n  .brand{ font-size:12.5px; letter-spacing:.1em }\r\n  .here{ display:block; font-weight:650; font-size:13px; color:#8a6512; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; min-width:0 }\r\n  .cats, .desk-dd{ display:none }\r\n  :host([data-layout=\"side\"]) .bar{ display:flex }\r\n  :host([data-layout=\"side\"]) .side{ display:none }\r\n  .quick{ padding:6px 10px }\r\n  .tools{ gap:6px }\r\n  .sync #syncText{ display:none }\r\n}\r\n@media (max-width:420px){ .bar .brand .b1{ display:none } }\r\n@media print{ :host{ display:none } }\r\n" }), /* @__PURE__ */ (0, I.jsx)(Ke, {
			deps: e,
			siteId: t,
			viewId: n,
			desk: r,
			prefs: l,
			wide: d,
			host: o,
			onSiteChange: i,
			onLogout: a
		})] }), s)
	});
}
function Ke({ deps: e, siteId: t, viewId: n, desk: r, prefs: i, wide: a, host: o, onSiteChange: s, onLogout: c }) {
	let { SITES: l, VIEWS: u, canOpen: d } = e, f = (0, F.useMemo)(() => Object.fromEntries(u.map((e) => [e.id, e])), [u]), { badge: p, notice: m } = (0, F.useSyncExternalStore)(Z.subscribe, Z.get), [h, g] = (0, F.useState)(null), [_, v] = (0, F.useState)(!1), [ee, y] = (0, F.useState)(!1), [b, x] = (0, F.useState)(!1), [S, te] = (0, F.useState)(""), [C, w] = (0, F.useState)(0), T = (0, F.useMemo)(() => e.menuFor(i).map((e) => ({
		...e,
		views: e.views.filter((e) => f[e] && d(e, r) && (!f[e].sites || f[e].sites.includes(t)))
	})).filter((e) => e.views.length), [
		i,
		r,
		f,
		t
	]), E = T.find((e) => e.views.includes(n)), [D, O] = (0, F.useState)(E?.id ?? null);
	(0, F.useEffect)(() => {
		O(E?.id ?? null);
	}, [n, E?.id]);
	let k = (0, F.useRef)(null), A = (0, F.useRef)(null), ne = (0, F.useRef)(null), re = (0, F.useRef)(null), j = r.role === "admin", M = r.role === "admin" || (r.role === "desk" || r.role === "siteadmin") && r.site === t ? r.role : `${r.role} · view only here`, N = (e, n) => `#/${t}/${e}${n ? `?section=${n}` : ""}`, P = (e, t) => e === n && !t ? "page" : void 0, L = () => {
		g(null), z();
	}, R = () => {
		y(!0), requestAnimationFrame(() => v(!0));
	};
	function z() {
		v((e) => (e && (setTimeout(() => y(!1), 200), ne.current?.focus({ preventScroll: !0 })), !1));
	}
	let B = () => {
		g(null), z(), te(""), w(0), x(!0), setTimeout(() => re.current?.focus(), 0);
	};
	(0, F.useEffect)(() => {
		_ && (A.current?.querySelector(".dr-body .mi[aria-current=\"page\"]") || A.current?.querySelector("#drClose"))?.focus();
	}, [_]), (0, F.useEffect)(() => {
		a && z();
	}, [a]), (0, F.useEffect)(() => {
		let n = (e) => {
			o.current && !e.composedPath().includes(o.current) && g(null);
		}, r = (n) => {
			if ((n.ctrlKey || n.metaKey) && !n.altKey && (n.key === "k" || n.key === "K")) {
				n.preventDefault(), B();
				return;
			}
			if (n.key === "Escape") {
				g(null), z(), x(!1);
				return;
			}
			if (!n.altKey || Ue(document.activeElement)) return;
			let r = e.prefs.matchesShortcut(n);
			r && (n.preventDefault(), location.hash = `#/${t}/${r}`);
		}, i = () => {
			let e = document.documentElement.scrollTop || document.body.scrollTop, t = document.documentElement.scrollHeight - document.documentElement.clientHeight || 1;
			k.current && (k.current.style.width = `${Math.max(0, Math.min(1, e / t)) * 100}%`);
		};
		return document.addEventListener("click", n), window.addEventListener("keydown", r), window.addEventListener("scroll", i, { passive: !0 }), () => {
			document.removeEventListener("click", n), window.removeEventListener("keydown", r), window.removeEventListener("scroll", i);
		};
	}, [t]);
	let ie = (t) => {
		let n = e.prefs.shortcutFor(t);
		return /* @__PURE__ */ (0, I.jsx)("kbd", {
			hidden: !n || !i.showKeyHints,
			children: n ? `${e.prefs.modLabel()} ${n.toUpperCase()}` : ""
		});
	}, V = (e) => e.views.map((e) => /* @__PURE__ */ (0, I.jsx)("a", {
		className: "mi",
		role: "menuitem",
		href: N(e),
		"aria-current": P(e),
		onClick: L,
		children: /* @__PURE__ */ (0, I.jsxs)("span", {
			className: "mi-l",
			children: [f[e].label, ie(e)]
		})
	}, e)), H = /* @__PURE__ */ (0, I.jsx)("i", { className: "caret" }), ae = (e = "brand", n) => /* @__PURE__ */ (0, I.jsxs)("a", {
		className: e,
		id: n,
		href: `#/${t}/home`,
		onClick: L,
		children: [/* @__PURE__ */ (0, I.jsx)("span", {
			className: "b1",
			children: "Faiz E Hashemi"
		}), /* @__PURE__ */ (0, I.jsx)("span", {
			className: "b2",
			children: l[t]?.brand
		})]
	}), U = (e) => {
		L(), s(e);
	}, oe = () => {
		L(), c();
	}, se = (i.quickLinks || []).filter((e) => f[e] && d(e, r)), ce = Object.fromEntries(T.flatMap((e) => e.views.map((t) => [t, e.label]))), W = (0, F.useMemo)(() => {
		if (!b) return [];
		let t = S.trim().toLowerCase();
		return u.filter((t) => (!t.hidden || t.id === "settings") && !e.NOT_IN_SEARCH.has(t.id) && d(t.id, r)).map((e) => ({
			v: e,
			hay: `${e.label} ${e.title} ${e.hint || ""} ${ce[e.id] || ""}`.toLowerCase()
		})).filter((e) => !t || t.split(/\s+/).every((t) => e.hay.includes(t))).sort((e, n) => Number(!!t && n.v.label.toLowerCase().startsWith(t)) - Number(!!t && e.v.label.toLowerCase().startsWith(t)) || e.v.label.localeCompare(n.v.label)).slice(0, 30);
	}, [
		b,
		S,
		r
	]), le = (e) => {
		location.hash = N(e), x(!1);
	}, ue = /* @__PURE__ */ (0, I.jsxs)("div", {
		className: "menu right",
		role: "menu",
		children: [
			/* @__PURE__ */ (0, I.jsxs)("div", {
				className: "mi static",
				children: [/* @__PURE__ */ (0, I.jsx)("span", {
					className: "mi-l",
					children: r.name
				}), /* @__PURE__ */ (0, I.jsxs)("span", {
					className: "mi-h",
					children: [
						l[r.site]?.label,
						" · ",
						M
					]
				})]
			}),
			j && /* @__PURE__ */ (0, I.jsx)("div", {
				className: "site-sw",
				children: Object.values(l).map((e) => /* @__PURE__ */ (0, I.jsxs)("button", {
					type: "button",
					className: "mi site-mi",
					role: "menuitem",
					"aria-pressed": e.id === t,
					onClick: () => U(e.id),
					children: [/* @__PURE__ */ (0, I.jsx)("span", {
						className: "mi-l",
						children: e.label
					}), /* @__PURE__ */ (0, I.jsxs)("span", {
						className: "mi-h",
						children: [
							"Show ",
							e.label,
							" data"
						]
					})]
				}, e.id))
			}),
			d("settings", r) && /* @__PURE__ */ (0, I.jsxs)(I.Fragment, { children: [/* @__PURE__ */ (0, I.jsxs)("a", {
				className: "mi",
				role: "menuitem",
				href: N("settings"),
				"aria-current": P("settings"),
				onClick: L,
				children: [/* @__PURE__ */ (0, I.jsx)("span", {
					className: "mi-l",
					children: "Settings"
				}), /* @__PURE__ */ (0, I.jsx)("span", {
					className: "mi-h",
					children: "Look, quick links, shortcuts — same on every device"
				})]
			}), /* @__PURE__ */ (0, I.jsxs)("a", {
				className: "mi",
				role: "menuitem",
				href: N("settings", "password"),
				onClick: L,
				children: [/* @__PURE__ */ (0, I.jsx)("span", {
					className: "mi-l",
					children: "Change password"
				}), /* @__PURE__ */ (0, I.jsx)("span", {
					className: "mi-h",
					children: "For this desk login"
				})]
			})] }),
			d("setup", r) && /* @__PURE__ */ (0, I.jsxs)("a", {
				className: "mi",
				role: "menuitem",
				href: N("setup"),
				"aria-current": P("setup"),
				onClick: L,
				children: [/* @__PURE__ */ (0, I.jsx)("span", {
					className: "mi-l",
					children: "Setup"
				}), /* @__PURE__ */ (0, I.jsx)("span", {
					className: "mi-h",
					children: "This desk, sync, desk logins"
				})]
			}),
			/* @__PURE__ */ (0, I.jsxs)("button", {
				type: "button",
				className: "mi logout",
				role: "menuitem",
				onClick: oe,
				children: [/* @__PURE__ */ (0, I.jsx)("span", {
					className: "mi-l",
					children: "Log out"
				}), /* @__PURE__ */ (0, I.jsx)("span", {
					className: "mi-h",
					children: "Removes this computer's copy of the data"
				})]
			})
		]
	}), de = (e) => ({
		className: `dd${h === e ? " open" : ""}${E?.id === e ? " active" : ""}`,
		onMouseEnter: () => {
			h && h !== e && h !== "desk" && g(e);
		}
	}), fe = (e) => (t) => {
		t.stopPropagation();
		let n = h !== e;
		g(n ? e : null);
		let r = t.currentTarget.parentElement;
		n && t.detail === 0 && setTimeout(() => (r?.querySelector(".mi:not(.static)"))?.focus(), 0);
	}, pe = (e) => () => O((t) => t === e ? null : e);
	return /* @__PURE__ */ (0, I.jsxs)(I.Fragment, { children: [
		/* @__PURE__ */ (0, I.jsxs)("header", {
			className: "bar",
			role: "navigation",
			"aria-label": "Main",
			onKeyDown: (e) => {
				e.key === "Escape" && L();
			},
			children: [
				/* @__PURE__ */ (0, I.jsxs)("button", {
					type: "button",
					ref: ne,
					className: "burger",
					id: "burger",
					"aria-label": "Open menu",
					"aria-controls": "drawer",
					"aria-expanded": _,
					onClick: R,
					children: [
						/* @__PURE__ */ (0, I.jsx)("span", {}),
						/* @__PURE__ */ (0, I.jsx)("span", {}),
						/* @__PURE__ */ (0, I.jsx)("span", {})
					]
				}),
				ae("brand", "brand"),
				/* @__PURE__ */ (0, I.jsx)("span", {
					className: "here",
					id: "here",
					children: f[n]?.hidden ? "" : f[n]?.label || ""
				}),
				/* @__PURE__ */ (0, I.jsx)("nav", {
					className: "cats",
					id: "cats",
					children: T.map((e) => e.views.length === 1 ? /* @__PURE__ */ (0, I.jsx)("a", {
						className: `cat solo${E?.id === e.id ? " active" : ""}`,
						href: N(e.views[0]),
						"aria-current": P(e.views[0]),
						onClick: L,
						children: e.label
					}, e.id) : /* @__PURE__ */ (0, I.jsxs)("div", {
						...de(e.id),
						children: [/* @__PURE__ */ (0, I.jsxs)("button", {
							type: "button",
							className: "cat",
							"aria-haspopup": "true",
							"aria-expanded": h === e.id,
							onClick: fe(e.id),
							children: [e.label, H]
						}), /* @__PURE__ */ (0, I.jsx)("div", {
							className: "menu",
							role: "menu",
							children: V(e)
						})]
					}, e.id))
				}),
				/* @__PURE__ */ (0, I.jsxs)("div", {
					className: "tools",
					children: [
						/* @__PURE__ */ (0, I.jsx)("button", {
							type: "button",
							className: "srch ai",
							title: "Ask the PMS — read-only AI assistant",
							"aria-label": "Ask the PMS (AI assistant)",
							onClick: () => {
								L(), e.openAssistant().catch(() => {});
							},
							children: "✨"
						}),
						/* @__PURE__ */ (0, I.jsx)("button", {
							type: "button",
							className: "srch",
							title: "Find a page (Ctrl+K)",
							"aria-label": "Find a page",
							onClick: B,
							children: "🔍"
						}),
						/* @__PURE__ */ (0, I.jsxs)("div", {
							className: `dd desk-dd${h === "desk" ? " open" : ""}`,
							children: [/* @__PURE__ */ (0, I.jsxs)("button", {
								type: "button",
								className: "desk",
								id: "deskBtn",
								"aria-haspopup": "true",
								"aria-expanded": h === "desk",
								onClick: fe("desk"),
								children: [/* @__PURE__ */ (0, I.jsxs)("span", {
									id: "deskName",
									children: [
										r.name,
										" · ",
										l[t]?.label || ""
									]
								}), H]
							}), ue]
						}),
						/* @__PURE__ */ (0, I.jsxs)("span", {
							className: `sync${p.warn ? " warn" : ""}`,
							id: "sync",
							title: p.text,
							children: [/* @__PURE__ */ (0, I.jsx)("i", {}), /* @__PURE__ */ (0, I.jsx)("span", {
								id: "syncText",
								children: p.warn ? "Offline" : p.text.replace(/ ·.*$/, "")
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, I.jsx)("div", {
					className: "progress",
					"aria-hidden": "true",
					ref: k
				})
			]
		}),
		/* @__PURE__ */ (0, I.jsx)("nav", {
			className: "quick",
			id: "quick",
			"aria-label": "Quick links",
			hidden: !se.length,
			children: se.map((e) => /* @__PURE__ */ (0, I.jsx)("a", {
				href: N(e),
				"aria-current": P(e),
				children: f[e].label
			}, e))
		}),
		/* @__PURE__ */ (0, I.jsx)("div", {
			className: "notice",
			id: "notice",
			role: "status",
			hidden: !m,
			children: m
		}),
		/* @__PURE__ */ (0, I.jsx)("div", {
			className: `backdrop${_ ? " show" : ""}`,
			id: "backdrop",
			hidden: !ee,
			onClick: z
		}),
		/* @__PURE__ */ (0, I.jsxs)("aside", {
			ref: A,
			className: `drawer${_ ? " open" : ""}`,
			id: "drawer",
			"aria-label": "Menu",
			"aria-hidden": !_,
			children: [
				/* @__PURE__ */ (0, I.jsxs)("div", {
					className: "dr-head",
					children: [ae("brand", "drBrand"), /* @__PURE__ */ (0, I.jsx)("button", {
						type: "button",
						className: "close",
						id: "drClose",
						"aria-label": "Close menu",
						onClick: z,
						children: "✕"
					})]
				}),
				/* @__PURE__ */ (0, I.jsx)("div", {
					className: "dr-body",
					id: "drBody",
					children: T.map((e) => /* @__PURE__ */ (0, I.jsxs)("section", {
						className: `dr-sec${D === e.id ? " open" : ""}`,
						children: [/* @__PURE__ */ (0, I.jsxs)("button", {
							type: "button",
							className: "dr-h",
							"aria-expanded": D === e.id,
							onClick: pe(e.id),
							children: [e.label, H]
						}), /* @__PURE__ */ (0, I.jsx)("div", {
							className: "dr-items",
							children: V(e)
						})]
					}, e.id))
				}),
				/* @__PURE__ */ (0, I.jsxs)("div", {
					className: "dr-foot",
					children: [
						/* @__PURE__ */ (0, I.jsxs)("div", {
							className: "dr-desk",
							id: "drDesk",
							children: [r.name, /* @__PURE__ */ (0, I.jsxs)("small", { children: [
								l[r.site]?.label,
								" · ",
								M
							] })]
						}),
						/* @__PURE__ */ (0, I.jsx)("div", {
							className: `dr-sync${p.warn ? " warn" : ""}`,
							id: "drSync",
							children: p.text
						}),
						d("settings", r) && /* @__PURE__ */ (0, I.jsxs)(I.Fragment, { children: [/* @__PURE__ */ (0, I.jsx)("a", {
							className: "dr-link",
							href: N("settings"),
							onClick: L,
							children: "Settings"
						}), /* @__PURE__ */ (0, I.jsx)("a", {
							className: "dr-link",
							href: N("settings", "password"),
							onClick: L,
							children: "Change password"
						})] }),
						j && /* @__PURE__ */ (0, I.jsx)("div", {
							className: "dr-admin",
							children: Object.values(l).map((e) => /* @__PURE__ */ (0, I.jsxs)("button", {
								type: "button",
								className: "dr-link",
								"aria-pressed": e.id === t,
								onClick: () => U(e.id),
								children: [
									"View ",
									e.label,
									" (admin)"
								]
							}, e.id))
						}),
						/* @__PURE__ */ (0, I.jsx)("button", {
							type: "button",
							className: "dr-logout",
							onClick: oe,
							children: "Log out"
						})
					]
				})
			]
		}),
		/* @__PURE__ */ (0, I.jsxs)("aside", {
			className: "side",
			id: "side",
			"aria-label": "Menu",
			children: [
				ae("brand sd-brand"),
				/* @__PURE__ */ (0, I.jsxs)("button", {
					type: "button",
					className: "sd-search",
					onClick: B,
					children: [
						"🔍 ",
						/* @__PURE__ */ (0, I.jsx)("span", { children: "Find a page" }),
						/* @__PURE__ */ (0, I.jsx)("kbd", { children: "Ctrl K" })
					]
				}),
				/* @__PURE__ */ (0, I.jsx)("div", {
					className: "sd-body",
					id: "sdBody",
					children: T.map((e) => e.views.length === 1 ? /* @__PURE__ */ (0, I.jsx)("a", {
						className: `sd-solo${E?.id === e.id ? " active" : ""}`,
						href: N(e.views[0]),
						"aria-current": P(e.views[0]),
						children: e.label
					}, e.id) : /* @__PURE__ */ (0, I.jsxs)("section", {
						className: `sd-grp${D === e.id ? " open" : ""}${E?.id === e.id ? " active" : ""}`,
						children: [/* @__PURE__ */ (0, I.jsxs)("button", {
							type: "button",
							className: "sd-h",
							"aria-expanded": D === e.id,
							onClick: pe(e.id),
							children: [e.label, H]
						}), /* @__PURE__ */ (0, I.jsx)("div", {
							className: "sd-items",
							children: V(e)
						})]
					}, e.id))
				}),
				/* @__PURE__ */ (0, I.jsxs)("div", {
					className: "sd-foot",
					children: [
						/* @__PURE__ */ (0, I.jsxs)("div", {
							className: "sd-desk",
							id: "sdDesk",
							children: [
								r.name,
								" · ",
								l[t]?.label || "",
								/* @__PURE__ */ (0, I.jsx)("small", { children: M })
							]
						}),
						/* @__PURE__ */ (0, I.jsx)("div", {
							className: `sd-sync${p.warn ? " warn" : ""}`,
							id: "sdSync",
							children: p.text
						}),
						/* @__PURE__ */ (0, I.jsxs)("div", {
							className: "sd-links",
							children: [
								d("settings", r) && /* @__PURE__ */ (0, I.jsx)("a", {
									href: N("settings"),
									"aria-current": P("settings"),
									children: "Settings"
								}),
								d("setup", r) && /* @__PURE__ */ (0, I.jsx)("a", {
									href: N("setup"),
									"aria-current": P("setup"),
									children: "Setup"
								}),
								j && /* @__PURE__ */ (0, I.jsx)("span", { children: Object.values(l).map((e) => /* @__PURE__ */ (0, I.jsx)("button", {
									type: "button",
									"aria-pressed": e.id === t,
									onClick: () => U(e.id),
									children: e.label
								}, e.id)) }),
								/* @__PURE__ */ (0, I.jsx)("button", {
									type: "button",
									className: "sd-logout",
									onClick: oe,
									children: "Log out"
								})
							]
						})
					]
				})
			]
		}),
		b && /* @__PURE__ */ (0, I.jsx)("div", {
			className: "qs-back",
			id: "qsBack",
			onClick: (e) => {
				e.target === e.currentTarget && x(!1);
			},
			children: /* @__PURE__ */ (0, I.jsxs)("div", {
				className: "qs",
				role: "dialog",
				"aria-modal": "true",
				"aria-label": "Find a page",
				children: [
					/* @__PURE__ */ (0, I.jsx)("input", {
						ref: re,
						id: "qsIn",
						type: "search",
						placeholder: "Find a page…",
						autoComplete: "off",
						spellCheck: !1,
						value: S,
						onChange: (e) => {
							te(e.target.value), w(0);
						},
						onKeyDown: (e) => {
							if (e.key === "ArrowDown" || e.key === "ArrowUp") e.preventDefault(), W.length && w((t) => (t + (e.key === "ArrowDown" ? 1 : -1) + W.length) % W.length);
							else if (e.key === "Enter") {
								e.preventDefault();
								let t = W[Math.max(0, C)];
								t && le(t.v.id);
							}
						}
					}),
					/* @__PURE__ */ (0, I.jsx)("div", {
						className: "qs-list",
						id: "qsList",
						role: "listbox",
						children: W.length ? W.map((e, t) => /* @__PURE__ */ (0, I.jsx)(F.Fragment, { children: /* @__PURE__ */ (0, I.jsxs)("a", {
							href: N(e.v.id),
							className: t === C ? "on" : "",
							role: "option",
							"aria-selected": t === C,
							ref: (e) => {
								t === C && e?.scrollIntoView({ block: "nearest" });
							},
							onClick: () => x(!1),
							children: [
								/* @__PURE__ */ (0, I.jsx)("b", { children: e.v.label }),
								/* @__PURE__ */ (0, I.jsx)("em", { children: ce[e.v.id] || "not in menu" }),
								/* @__PURE__ */ (0, I.jsx)("small", { children: e.v.hint || "" })
							]
						}) }, e.v.id)) : /* @__PURE__ */ (0, I.jsx)("div", {
							className: "qs-empty",
							children: "No page matches."
						})
					}),
					/* @__PURE__ */ (0, I.jsx)("div", {
						className: "qs-hint",
						children: "↑ ↓ to choose · Enter to open · Esc to close"
					})
				]
			})
		})
	] });
}
// src/shell/Shell.tsx
var qe = "pms_last_site", Q = Ve(null), $ = Ve(0), Je = /* @__PURE__ */ new Map(), Ye = (e) => (Je.has(e) || Je.set(e, (0, F.lazy)(G[e])), Je.get(e)), Xe = () => {
	try {
		return new URLSearchParams(location.search).get("legacy") === "1" || new URLSearchParams(location.hash.split("?")[1] || "").get("legacy") === "1";
	} catch {
		return !1;
	}
}, Ze = () => document.getElementById("view");
function Qe(e) {
	let { core: t, config: n } = e, r = t.cloud, i = t.prefs, a = 0;
	document.querySelectorAll("body > site-nav, body > #view").forEach((e) => e.remove());
	let o = document.createElement("div");
	o.id = "pms-shell", o.dataset.shell = "", o.style.display = "contents", document.body.prepend(o);
	function s(t = !1) {
		let o = r.currentDesk(), s = null;
		try {
			s = localStorage.getItem(qe);
		} catch {}
		let c = ze(location.hash, {
			SITES: n.SITES,
			VIEWS: n.VIEWS,
			NAV: n.NAV,
			DEFAULT_SITE: n.DEFAULT_SITE,
			desk: o,
			prefs: i.getPrefs(),
			lastSite: s,
			siteFor: r.siteFor,
			canOpen: r.canOpen,
			firstPage: r.firstPage
		});
		c.replace && history.replaceState(null, "", c.replace);
		try {
			localStorage.setItem(qe, c.siteId);
		} catch {}
		c.notice && Z.notice(c.notice);
		let l = Q.get();
		if (!t && l && l.key === c.key) return;
		document.title = `${c.view.title} · ${n.SITES[c.siteId].label}`, e.analytics.pageview(c.siteId, c.view.id);
		let u = Ze();
		u && (u.offsetHeight && (u.style.minHeight = `${u.offsetHeight}px`), u.setAttribute("aria-busy", "true")), window.dispatchEvent(new CustomEvent("pms:route-start", { detail: {
			view: c.view.id,
			site: c.siteId
		} })), Q.set({
			...c,
			nonce: ++a
		});
	}
	return window.addEventListener("hashchange", () => s()), (0, ge.createRoot)(o).render(/* @__PURE__ */ (0, I.jsx)($e, { deps: e })), {
		route: () => s(),
		forceRoute: () => s(!0),
		unmount: () => Q.set(null),
		setBadge: (e, t) => Z.setBadge(e, t),
		notice: (e) => Z.notice(e),
		setRoute: () => $.set($.get() + 1),
		siteId: () => J(location.hash).siteId,
		viewId: () => J(location.hash).viewId,
		preload: async (t) => {
			G[t] ? await G[t]() : await Promise.all([
				ut(t),
				e.loadApp(`views/${t}/view.js`),
				fetch(`app/views/${t}/view.css`)
			]);
		}
	};
}
function $e({ deps: e }) {
	let t = (0, F.useSyncExternalStore)(Q.subscribe, Q.get);
	(0, F.useSyncExternalStore)($.subscribe, $.get);
	let n = e.core.cloud, r = t ? n.currentDesk() : null, i = (0, F.useMemo)(() => ({
		SITES: e.config.SITES,
		VIEWS: e.config.VIEWS,
		menuFor: e.menu.menuFor,
		NOT_IN_SEARCH: e.menu.NOT_IN_SEARCH,
		prefs: e.core.prefs,
		canOpen: n.canOpen,
		openAssistant: e.openAssistant
	}), [e]);
	return /* @__PURE__ */ (0, I.jsxs)(_e, { children: [
		/* @__PURE__ */ (0, I.jsx)(Ge, {
			deps: i,
			siteId: t?.siteId || "",
			viewId: t?.view.id || "",
			desk: r,
			onSiteChange: (e) => {
				let { viewId: t, params: n } = J(location.hash);
				location.hash = Y(e, t || "home", n);
			},
			onLogout: () => {
				n.logout();
			}
		}),
		/* @__PURE__ */ (0, I.jsx)("div", {
			id: "view",
			"data-shell": "",
			"data-view": t?.view.id,
			children: t && /* @__PURE__ */ (0, I.jsx)(nt, {
				r: t,
				deps: e
			}, `${t.key}#${t.nonce}`)
		}),
		/* @__PURE__ */ (0, I.jsxs)("div", {
			className: "pms-react",
			children: [/* @__PURE__ */ (0, I.jsx)(Oe, {}), r && t?.siteId && /* @__PURE__ */ (0, I.jsx)(Le, {
				cloud: n,
				siteId: t.siteId,
				deskId: r.id
			}, `${r.id}|${t.siteId}`)]
		})
	] });
}
function et(e) {
	let t = { alive: !0 }, n = () => new Promise(() => {}), r = { ...e };
	for (let [i, a] of Object.entries(e)) typeof a == "function" && (r[i] = (...e) => t.alive ? a(...e).then((e) => t.alive ? e : n(), (e) => t.alive ? Promise.reject(e) : n()) : n());
	return {
		db: r,
		guard: (e) => Promise.resolve(e).then((e) => t.alive ? e : n(), (e) => t.alive ? Promise.reject(e) : n()),
		end: () => {
			t.alive = !1;
		}
	};
}
var tt = null;
function nt({ r: e, deps: t }) {
	let { siteId: n, view: r, params: a } = e, [o] = (0, F.useState)(() => (tt ??= {
		rootStyle: document.documentElement.getAttribute("style"),
		bodyStyle: document.body.getAttribute("style"),
		bodyClass: document.body.getAttribute("class")
	}, {
		body: new Set(Array.from(document.body.children)),
		head: new Set(Array.from(document.head.children)),
		...tt
	})), [c] = (0, F.useState)(() => et(t.createDb(n))), [l] = (0, F.useState)(() => new P({ defaultOptions: { queries: {
		retry: !1,
		refetchOnWindowFocus: !1
	} } })), u = (0, F.useMemo)(() => ({
		site: t.config.SITES[n],
		siteId: n,
		db: c.db,
		guard: c.guard,
		params: a,
		get root() {
			return Ze();
		},
		navigate: (e, t) => {
			location.hash = Y(n, e, t);
		},
		href: (e, t) => Y(n, e, t),
		core: t.core,
		views: t.config.VIEWS,
		loadApp: t.loadApp,
		loadCore: t.loadCore
	}), []), d = (0, F.useRef)(!1), f = (e) => {
		if (d.current) return;
		d.current = !0;
		let t = Ze();
		t && (t.removeAttribute("aria-busy"), t.style.minHeight = ""), window.dispatchEvent(new CustomEvent("pms:route-done", { detail: {
			view: r.id,
			site: n,
			ok: e
		} }));
	};
	if ((0, F.useEffect)(() => (window.scrollTo(0, 0), () => {
		c.end(), l.clear();
		for (let e of Array.from(document.body.children)) !o.body.has(e) && !("shell" in e.dataset) && e.remove();
		for (let e of Array.from(document.head.children)) !o.head.has(e) && e.tagName === "STYLE" && e.remove();
		let e = (e, t, n) => n == null ? e.removeAttribute(t) : e.setAttribute(t, n);
		e(document.documentElement, "style", o.rootStyle), e(document.body, "style", o.bodyStyle), e(document.body, "class", o.bodyClass);
	}), []), !G[r.id] || Xe()) return /* @__PURE__ */ (0, I.jsx)(dt, {
		id: r.id,
		ctx: u,
		deps: t,
		onDone: f
	});
	let p = Ye(r.id);
	return /* @__PURE__ */ (0, I.jsx)(s, {
		client: l,
		children: /* @__PURE__ */ (0, I.jsx)(i, {
			ctx: u,
			children: /* @__PURE__ */ (0, I.jsx)("div", {
				className: "pms-react",
				children: /* @__PURE__ */ (0, I.jsx)(ct, {
					title: r.title,
					onError: () => f(!1),
					children: /* @__PURE__ */ (0, I.jsx)(F.Suspense, {
						fallback: null,
						children: /* @__PURE__ */ (0, I.jsx)(rt, {
							onMounted: () => f(!0),
							children: /* @__PURE__ */ (0, I.jsx)(p, {})
						})
					})
				})
			})
		})
	});
}
function rt({ onMounted: e, children: t }) {
	return (0, F.useEffect)(() => {
		e();
	}, []), /* @__PURE__ */ (0, I.jsx)(I.Fragment, { children: t });
}
var it = (e, t) => /* @__PURE__ */ (0, I.jsxs)("div", {
	style: {
		maxWidth: 720,
		margin: "40px auto",
		padding: 16,
		border: "1px solid #e6bcbc",
		background: "#fff1f1",
		borderRadius: 12,
		font: "14px system-ui"
	},
	children: [
		/* @__PURE__ */ (0, I.jsxs)("b", { children: [
			"Could not open “",
			e,
			"”."
		] }),
		/* @__PURE__ */ (0, I.jsx)("br", {}),
		String(t?.message || t)
	]
}), at = /dynamically imported module|Importing a module script failed|error loading dynamically imported|ChunkLoadError|Failed to fetch/i;
function ot(e) {
	if (!at.test(String(e?.message || e || ""))) return !1;
	try {
		if (Date.now() - Number(sessionStorage.getItem("pms_stale_reload") || 0) < 6e4) return !1;
		sessionStorage.setItem("pms_stale_reload", String(Date.now()));
	} catch {
		return !1;
	}
	return location.reload(), !0;
}
var st = /* @__PURE__ */ (0, I.jsx)("div", {
	style: {
		maxWidth: 720,
		margin: "40px auto",
		padding: 16,
		font: "14px system-ui",
		textAlign: "center"
	},
	children: "Updating to the new version…"
}), ct = class extends F.Component {
	state = {
		err: null,
		reloading: !1
	};
	static getDerivedStateFromError(e) {
		return { err: e };
	}
	componentDidCatch(e) {
		console.error(e), ot(e) ? this.setState({ reloading: !0 }) : this.props.onError();
	}
	render() {
		return this.state.reloading ? st : this.state.err ? it(this.props.title, this.state.err) : this.props.children;
	}
}, lt = /* @__PURE__ */ new Map(), ut = (e) => (lt.has(e) || lt.set(e, fetch(`app/views/${e}/view.html`).then((t) => {
	if (!t.ok) throw Error(`No page "${e}"`);
	return t.text();
})), lt.get(e));
function dt({ id: e, ctx: t, deps: n, onDone: r }) {
	let i = (0, F.useRef)(null), [a, o] = (0, F.useState)(null);
	return (0, F.useEffect)(() => {
		let a = !0, s, c, l = document.createElement("link");
		l.rel = "stylesheet", l.href = `app/views/${e}/view.css`, l.dataset.shell = "";
		let u = new Promise((e) => {
			l.onload = l.onerror = e;
		});
		return document.head.insertBefore(l, document.getElementById("responsive-css")), (async () => {
			try {
				let [o, l] = await Promise.all([
					ut(e),
					n.loadApp(`views/${e}/view.js`),
					u
				]), d = i.current;
				if (!a || !d) return;
				d.innerHTML = o;
				let f = n.config.LEGACY_PAGES || {};
				d.querySelectorAll("a[href]").forEach((e) => {
					let n = (e.getAttribute("href") || "").match(/^(?:\.\/)?([\w-]+\.html)(\?.*)?$/);
					n && f[n[1]] && e.setAttribute("href", `#/${t.siteId}/${f[n[1]]}${n[2] || ""}`);
				}), c = n.watchTables(d);
				let p = await l.default({
					...t,
					root: d
				});
				typeof p == "function" && (a ? s = p : p()), r(!0);
			} catch (e) {
				if (console.error(e), ot(e)) return;
				a && (o(e), r(!1));
			}
		})(), () => {
			a = !1;
			try {
				s?.();
			} catch (e) {
				console.error("view cleanup failed", e);
			}
			c?.(), l.remove();
		};
	}, []), a ? it(e, a) : /* @__PURE__ */ (0, I.jsx)("div", {
		ref: i,
		className: "pms-legacy-view",
		style: { display: "contents" }
	});
}
// src/bridge.tsx
var ft = () => Object.keys(G), pt = (e) => G[e]?.().then(() => void 0, () => void 0);
async function mt(e, t) {
	let n = G[e];
	if (!n) throw Error(`No React page "${e}"`);
	let { default: r } = await n(), a = new P({ defaultOptions: { queries: {
		retry: !1,
		refetchOnWindowFocus: !1
	} } });
	t.root.innerHTML = "";
	let o = document.createElement("div");
	o.className = "pms-react", t.root.appendChild(o);
	let c = (0, ge.createRoot)(o);
	return c.render(/* @__PURE__ */ (0, I.jsx)(s, {
		client: a,
		children: /* @__PURE__ */ (0, I.jsx)(i, {
			ctx: t,
			children: /* @__PURE__ */ (0, I.jsxs)(_e, { children: [/* @__PURE__ */ (0, I.jsx)(r, {}), /* @__PURE__ */ (0, I.jsx)(Oe, {})] })
		})
	})), () => {
		c.unmount(), a.clear();
	};
}
export { mt as mountPage, Qe as mountShell, pt as preloadPage, ft as reactPages };
