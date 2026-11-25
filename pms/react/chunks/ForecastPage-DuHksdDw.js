import { a as e, f as t, h as n, i as r, l as i, n as a, o, p as s, r as c, u as l } from "./PmsContext-BVMd13Oi.js";
import { t as u } from "./checkbox-C3tIiLfF.js";
import { i as d, n as f, r as p, t as m } from "./tabs-IQDmk0rj.js";
import { t as h } from "./label-CMEyi--P.js";
import { t as g } from "./createLucideIcon-CQUC5AEZ.js";
import { t as _ } from "./download-DbAPjole.js";
import { t as v } from "./button-BGWa3SLr.js";
import { t as y } from "./input-DSBk_UeU.js";
import { t as b } from "./AllocLog-FIZnZtXK.js";
import { t as x } from "./PageHeader-DKvzTuZm.js";
// node_modules/lucide-react/dist/esm/icons/play.mjs
var S = {
	name: "play",
	size: 24,
	node: [["path", {
		d: "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",
		key: "10ikf1"
	}]]
};
S.node;
var C = g(S), w = /* @__PURE__ */ n(s(), 1), T = "        /* Planner, Allocator and log tabs only: the page wraps this sheet in .fc-legacy { … } (CSS nesting), so the plain element rules below never reach\r\n           the Vacancy tab. Cream • Gold • Brown */\r\n        & {\r\n            --b: #dcc7a4;\r\n            --m: #3d3226;\r\n            --bg: #f7efe1;\r\n            --gold: #d4af37\r\n        }\r\n\r\n        * {\r\n            box-sizing: border-box\r\n        }\r\n\r\n        .wrap {\r\n            max-width: 1200px;\r\n            margin: 22px auto;\r\n            background: #fffaf1;\r\n            padding: 18px;\r\n            border-radius: 12px;\r\n            border: 1px solid var(--b);\r\n            box-shadow: 0 6px 20px rgba(92,64,28,.12)\r\n        }\r\n\r\n        h1 {\r\n            margin: 0 0 12px;\r\n            text-align: center;\r\n            color: #1a0f0a\r\n        }\r\n\r\n        .controls {\r\n            display: grid;\r\n            grid-template-columns: repeat(6,minmax(140px,1fr));\r\n            gap: 10px;\r\n            align-items: end;\r\n            margin: 10px 0 16px\r\n        }\r\n\r\n            .controls > div {\r\n                display: flex;\r\n                flex-direction: column;\r\n                gap: 6px\r\n            }\r\n\r\n        label {\r\n            font-size: 12px;\r\n            color: var(--m)\r\n        }\r\n\r\n        input, select, textarea, button {\r\n            font: inherit;\r\n            color: #1a0f0a\r\n        }\r\n\r\n            input[type='date'], input[type='time'], select, textarea {\r\n                border: 1px solid var(--b);\r\n                border-radius: 10px;\r\n                padding: 8px;\r\n                background: #fffdf7\r\n            }\r\n\r\n        textarea {\r\n            min-height: 44px\r\n        }\r\n\r\n        button {\r\n            padding: 8px 12px;\r\n            border: 1px solid var(--b);\r\n            border-radius: 10px;\r\n            background: #fffdf5;\r\n            cursor: pointer;\r\n            transition: background .15s ease, transform .08s ease\r\n        }\r\n\r\n            button:hover {\r\n                background: #fff6dd\r\n            }\r\n\r\n            button:active {\r\n                transform: translateY(1px)\r\n            }\r\n\r\n        .summary {\r\n            display: flex;\r\n            gap: 12px;\r\n            flex-wrap: wrap;\r\n            margin: 6px 0 14px\r\n        }\r\n\r\n        .pill {\r\n            border: 1px solid var(--b);\r\n            border-radius: 999px;\r\n            padding: 6px 12px;\r\n            background: #fffaf1;\r\n            color: var(--m)\r\n        }\r\n\r\n        table {\r\n            width: 100%;\r\n            border-collapse: collapse;\r\n            margin-top: 10px;\r\n            background: #fff\r\n        }\r\n\r\n        th, td {\r\n            border: 1px solid var(--b);\r\n            padding: 8px;\r\n            vertical-align: top;\r\n            color: #1a0f0a\r\n        }\r\n\r\n        th {\r\n            background: #f3e6ca;\r\n            text-align: left;\r\n            font-weight: 700;\r\n            white-space: nowrap\r\n        }\r\n\r\n        .muted {\r\n            color: var(--m)\r\n        }\r\n\r\n        .right {\r\n            text-align: right\r\n        }\r\n\r\n        .nowrap {\r\n            white-space: nowrap\r\n        }\r\n\r\n        .two {\r\n            display: grid;\r\n            grid-template-columns: 1fr 1fr;\r\n            gap: 16px\r\n        }\r\n\r\n        .delta-pos {\r\n            color: #2f7d32;\r\n            font-weight: 700\r\n        }\r\n\r\n        .delta-neg {\r\n            color: #a12a2a;\r\n            font-weight: 700\r\n        }\r\n\r\n        @media(max-width:900px) {\r\n            .controls {\r\n                grid-template-columns: 1fr 1fr\r\n            }\r\n\r\n            .two {\r\n                grid-template-columns: 1fr\r\n            }\r\n        }\r\n\r\n        @media print {\r\n            .controls, .muted, #status {\r\n                display: none !important\r\n            }\r\n\r\n            .wrap {\r\n                box-shadow: none;\r\n                padding: 0;\r\n                margin: 0;\r\n                border: none;\r\n                background: #fff\r\n            }\r\n        }\r\n    \r\n\r\n/* ---------- building planner (planner.js) ---------- */\r\n.pl h2 { margin: 0; font-size: 19px; }\r\n.pl h3 { margin: 16px 0 8px; font-size: 15px; display: flex; gap: 10px; align-items: baseline; flex-wrap: wrap; }\r\n.pl-head p { margin: 4px 0 12px; color: var(--m); max-width: 80ch; }\r\n.pl-hint { font-size: 12px; color: #7a6a57; font-weight: 400; }\r\n.pl-msg { padding: 12px; border-radius: 10px; background: #fff6dd; border: 1px solid #ecd9a6; }\r\n.pl-setup { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 16px; align-items: start; }\r\n.pl-sub { font-weight: 700; font-size: 13px; margin-bottom: 6px; }\r\n.pl-prio { min-width: 0; }\r\n#plPrio { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }\r\n#plPrio li { display: grid; grid-template-columns: 30px minmax(120px, 1fr) 80px 130px auto; gap: 10px; align-items: center; padding: 7px 10px;\r\n    border: 1px solid var(--b); border-radius: 10px; background: #fff; cursor: grab; }\r\n#plPrio li.off { opacity: .55; background: #f7f2e8; }\r\n#plPrio li.drag { outline: 2px dashed var(--gold); }\r\n.pl-rank { display: inline-grid; place-items: center; width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(#e6c65a, #d4af37); color: #3b2a06; font-weight: 800; font-size: 13px; }\r\n#plPrio li.off .pl-rank { background: #e6dccb; color: #7a6a57; }\r\n.pl-on { display: inline-flex; gap: 6px; align-items: center; cursor: pointer; }\r\n.pl-beds { font-size: 12px; color: #7a6a57; }\r\n.pl-target { font-size: 12px; color: #7a6a57; display: inline-flex; gap: 4px; align-items: center; }\r\n.pl-target input { width: 58px; padding: 4px 6px; border: 1px solid var(--b); border-radius: 6px; font: inherit; }\r\n.pl-move { display: inline-flex; gap: 2px; }\r\n.pl-move button { padding: 2px 8px; font-size: 11px; border: 1px solid var(--b); background: #fffaf1; border-radius: 6px; cursor: pointer; }\r\n.pl-move button:disabled { opacity: .35; cursor: default; }\r\n.pl-run { display: grid; gap: 8px; align-content: start; min-width: 220px; }\r\n.pl-run label { display: grid; gap: 4px; font-size: 13px; font-weight: 600; }\r\n.pl-run select { padding: 7px 9px; border: 1px solid var(--b); border-radius: 8px; font: inherit; background: #fff; }\r\n.pl-btn { font: inherit; font-weight: 700; padding: 9px 14px; border-radius: 10px; border: 1px solid var(--gold); background: #fff; color: #7a5b13; cursor: pointer; }\r\n.pl-btn.primary { background: linear-gradient(#e6c65a, #d4af37); border-color: #b8931f; color: #3b2a06; }\r\n.pl-btn:disabled { opacity: .6; cursor: progress; }\r\n\r\n.pl-plans { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; margin-top: 14px; }\r\n.pl-plan { font: inherit; text-align: left; display: grid; gap: 6px; padding: 12px; border-radius: 12px; border: 1px solid var(--b); background: #fff; cursor: pointer; }\r\n.pl-plan.on { border: 2px solid var(--gold); background: #fffaf0; box-shadow: 0 6px 18px rgba(92, 64, 28, .12); }\r\n.pl-plan-h { font-weight: 800; font-size: 15px; }\r\n.pl-plan-h small { font-weight: 500; color: #7a6a57; margin-left: 4px; font-size: 12px; }\r\n.pl-ok { color: #2f7d32; font-weight: 700; font-size: 13px; }\r\n.pl-bad { color: #a12a2a; font-weight: 700; font-size: 13px; }\r\n.pl-bar { display: grid; grid-template-columns: 90px 1fr; gap: 2px 8px; align-items: center; font-size: 12px; }\r\n.pl-bar b { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\r\n.pl-bar i { height: 8px; border-radius: 999px; background: linear-gradient(90deg, #d4af37 var(--w), #efe5d1 var(--w)); }\r\n.pl-bar em { grid-column: 2; font-style: normal; color: #7a6a57; font-size: 11px; }\r\n\r\n.pl-heat-wrap { overflow-x: auto; border: 1px solid var(--b); border-radius: 10px; background: #fff; }\r\n.pl-heat { border-collapse: collapse; font-size: 11px; }\r\n.pl-heat th, .pl-heat td { padding: 4px 5px; text-align: center; border: 1px solid #f0e6d2; white-space: nowrap; }\r\n.pl-heat thead th { font-weight: 600; color: #7a6a57; line-height: 1.1; }\r\n.pl-heat tbody th { text-align: left; position: sticky; left: 0; background: #fffaf1; }\r\n.pl-heat td { min-width: 30px; font-weight: 700; background: color-mix(in srgb, #c0392b calc(var(--p) * 1%), #eaf6ec); color: #2b1e15; }\r\n\r\n.pl-table-head { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: space-between; }\r\n.pl-apply { display: flex; gap: 10px; align-items: center; font-size: 13px; }\r\n.pl-table-wrap { max-height: 520px; overflow: auto; border: 1px solid var(--b); border-radius: 10px; background: #fff; }\r\n.pl-table { width: 100%; border-collapse: collapse; font-size: 13px; }\r\n.pl-table th { position: sticky; top: 0; background: #f6ecd2; text-align: left; padding: 7px 8px; z-index: 1; }\r\n.pl-table td { padding: 6px 8px; border-top: 1px solid #f0e6d2; vertical-align: top; }\r\n.pl-table td small { display: block; color: #7a6a57; font-size: 12px; }\r\n.pl-table .n { text-align: right; }\r\n.pl-table .sh { font-weight: 700; white-space: nowrap; }\r\n.pl-table .stay { white-space: nowrap; }\r\n.pl-table .why { color: #7a6a57; font-size: 12px; }\r\n.pl-table tr.un { background: #fff4f2; }\r\n.pl-b { display: inline-block; padding: 2px 9px; border-radius: 999px; font-weight: 800; font-size: 12px; color: #fff; background: #8a7a62; }\r\n.pl-b.r0 { background: #2f7d32; } .pl-b.r1 { background: #4c8fd6; } .pl-b.r2 { background: #b8871d; } .pl-b.r3 { background: #8e5aa8; }\r\n.pl-b.none { background: #a12a2a; }\r\n@media (max-width: 760px) {\r\n    .pl-setup { grid-template-columns: 1fr; }\r\n    #plPrio li { grid-template-columns: 28px minmax(0, 1fr) auto; }\r\n    .pl-beds, .pl-target { grid-column: 2; }\r\n}\r\n@media print { .pl { display: none; } }\r\n\r\n/* ---------- day allocation (allocate.js) ---------- */\r\n.al-run { grid-template-columns: auto auto 1fr; align-items: end; }\r\n.al-run input[type=date] { padding: 7px 9px; border: 1px solid var(--b); border-radius: 8px; font: inherit; background: #fff; }\r\n.al-sum { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0 4px; }\r\n.al-kpi { display: grid; padding: 8px 12px; border-radius: 10px; border: 1px solid var(--b); background: #fff; min-width: 110px; }\r\n.al-kpi b { font-size: 18px; }\r\n.al-kpi span { font-size: 12px; color: #7a6a57; }\r\n.al-kpi.ok b { color: #2f7d32; } .al-kpi.bad b { color: #a12a2a; }\r\n.al-rooms { font-size: 12px; line-height: 1.7; }\r\n.al-rooms sup { color: #9a7414; font-weight: 700; margin-right: 2px; }\r\n@media (max-width: 760px) { .al-run { grid-template-columns: 1fr; } }\r\n\r\n/* ---------- bulk change log (alloclog.js) ---------- */\r\n.lg-item { border: 1px solid var(--b); border-radius: 10px; background: #fff; margin-top: 8px; }\r\n.lg-item summary { display: flex; flex-wrap: wrap; gap: 6px 12px; align-items: center; padding: 9px 12px; cursor: pointer; list-style: none; }\r\n.lg-item summary::-webkit-details-marker { display: none; }\r\n.lg-item summary::before { content: '▸'; color: #9a7414; }\r\n.lg-item[open] summary::before { content: '▾'; }\r\n.lg-when { font-weight: 700; white-space: nowrap; }\r\n.lg-kind { font-size: 12px; font-weight: 800; padding: 1px 8px; border-radius: 999px; background: #f3e6ca; color: #7a5b13; }\r\n.lg-note { flex: 1 1 260px; color: #3d3226; font-size: 13px; }\r\n.lg-undone { font-size: 12px; font-weight: 700; color: #a12a2a; }\r\n.lg-item.undone { opacity: .75; }\r\n.lg-item .pl-hint { margin: 0 12px 6px; }\r\n.lg-table { border-top: 1px solid #f0e6d2; }\r\n.lg-table td { font-size: 12px; }\r\n", E = (e, t) => e.localeCompare(t, void 0, { numeric: !0 }), D = (e) => String(e ?? "").trim().toUpperCase().replace(/\s+/g, "");
function O(e, t, n) {
	let r = e.filter((e) => e.start < n && e.end > t).flatMap((e) => [[Math.max(e.start, t), e.beds], [Math.min(e.end, n), -e.beds]]).sort((e, t) => e[0] - t[0] || e[1] - t[1]), i = 0, a = 0;
	for (let [, e] of r) i += e, a = Math.max(a, i);
	return a;
}
function k({ slips: e, buildings: t, from: n, to: r, libs: i }) {
	let a = [];
	for (let o of t) {
		let t = i.normB(o), s = /* @__PURE__ */ new Map();
		for (let a of e) if (!a.deleted) for (let e of i.rowsOf(a)) {
			if (i.normB(e.building) !== t || !(e.end > n) || !(e.start < r) || !(Number(e.block) > 0)) continue;
			let o = D(e.room_no);
			s.has(o) || s.set(o, []), s.get(o).push({
				start: e.start,
				end: e.end,
				beds: Number(e.block),
				label: [a.sh_no, a.tour_name || a.group_leader].filter(Boolean).join(" ")
			});
		}
		let c = i.activeRooms(o), l = new Map(c.map((e) => [D(e.room_no), Number(e.capacity) > 0 ? Number(e.capacity) : null]));
		if (!c.length) for (let e of s.keys()) l.set(e, null);
		for (let [e, t] of l) {
			let i = s.get(e) || [], c = O(i, n, r);
			a.push({
				building: o,
				room: e,
				capacity: t,
				used: c,
				free: t == null ? null : Math.max(0, t - c),
				groups: [...new Set(i.map((e) => e.label))].join(", ")
			});
		}
	}
	return a.sort((e, t) => E(e.building, t.building) || E(e.room, t.room)), {
		rows: a,
		rooms: a.length,
		vacant: a.filter((e) => e.used === 0).length,
		withSpace: a.filter((e) => e.used > 0 && (e.free ?? 0) > 0).length,
		full: a.filter((e) => e.used > 0 && e.free === 0).length,
		freeBeds: a.reduce((e, t) => e + (t.free ?? 0), 0)
	};
}
// src/pages/forecast/ForecastPage.tsx
var A = t(), j = (e) => String(e).padStart(2, "0"), M = (e) => `${e.getFullYear()}-${j(e.getMonth() + 1)}-${j(e.getDate())}T${j(e.getHours())}:${j(e.getMinutes())}`, N = (e) => new Intl.DateTimeFormat(void 0, {
	dateStyle: "medium",
	timeStyle: "short"
}).format(e), P = [
	["all", "All rooms"],
	["space", "With free beds"],
	["vacant", "Empty"],
	["full", "Full"]
], F = (e) => (t) => e === "all" || (e === "vacant" ? t.used === 0 : e === "full" ? t.free === 0 : (t.free ?? 0) > 0);
function I() {
	let { stay: e, rooms: t } = a(), n = t, i = e, s = c(), d = r(), f = o(), { siteId: p } = l(), m = /* @__PURE__ */ new Date(), [g, b] = (0, w.useState)(M(m)), [x, S] = (0, w.useState)(M(/* @__PURE__ */ new Date(+m + 864e5))), [T, E] = (0, w.useState)([]), [D, O] = (0, w.useState)(null), [j, I] = (0, w.useState)([]), [L, R] = (0, w.useState)(null), [z, B] = (0, w.useState)("all"), [V, H] = (0, w.useState)(""), [U, W] = (0, w.useState)(!1);
	(0, w.useEffect)(() => {
		(async () => {
			try {
				let [e, t] = await Promise.all([d(n.loadBuildings()), s.all()]);
				E(e), O(t);
			} catch (e) {
				console.error(e), H("Could not read the slips in this browser. Open the slip page once, then come back.");
			}
		})();
	}, []);
	let G = (0, w.useMemo)(() => {
		let e = n.buildingNames(T, p);
		return e.length ? e : [...new Set((D || []).map((e) => String(e.building || "").trim().toUpperCase()).filter(Boolean))].sort();
	}, [
		T,
		D,
		p
	]), K = Date.parse(g), q = Date.parse(x), J = !(K > 0) || !(q > 0) ? "Choose both dates and times." : q <= K ? "\"To\" must be after \"From\"." : j.length ? D ? "" : "Loading the slips…" : "Pick at least one building.", Y = () => {
		J || (W(!0), setTimeout(() => {
			try {
				R({
					...k({
						slips: D,
						buildings: j,
						from: K,
						to: q,
						libs: {
							rowsOf: i.rowsOf,
							normB: i.normB,
							activeRooms: (e) => n.activeRooms(T, e, q)
						}
					}),
					from: K,
					to: q,
					buildings: j
				}), B("all"), H("");
			} catch (e) {
				H("The forecast failed: " + (e?.message || e));
			} finally {
				W(!1);
			}
		}, 0));
	}, X = L ? L.rows.filter(F(z)) : [], Z = (L?.buildings.length ?? 0) > 1;
	async function Q() {
		if (!L) return;
		let e = await f("lib");
		await e.loadScript(e.LIBS.xlsx);
		let t = window.XLSX, n = t.utils.book_new();
		t.utils.book_append_sheet(n, t.utils.aoa_to_sheet([
			["Vacancy forecast"],
			["From", N(L.from)],
			["To", N(L.to)],
			["Buildings", L.buildings.join(", ")],
			["Showing", P.find((e) => e[0] === z)[1]],
			[],
			["Rooms", L.rooms],
			["Empty rooms", L.vacant],
			["Rooms with some beds free", L.withSpace],
			["Full rooms", L.full],
			["Free beds", L.freeBeds]
		]), "Summary"), t.utils.book_append_sheet(n, t.utils.json_to_sheet(X.map((e) => ({
			Building: e.building,
			Room: e.room,
			Beds: e.capacity ?? "",
			"Beds in use (most)": e.used,
			"Free beds": e.free ?? "",
			Groups: e.groups
		}))), "Rooms"), t.writeFile(n, `Vacancy ${g.slice(0, 10)} to ${x.slice(0, 10)}.xlsx`);
	}
	return /* @__PURE__ */ (0, A.jsxs)("div", {
		className: "grid gap-4",
		children: [/* @__PURE__ */ (0, A.jsxs)("section", {
			className: "grid gap-4 rounded-xl border bg-card p-4",
			children: [
				/* @__PURE__ */ (0, A.jsxs)("div", {
					className: "flex flex-wrap items-end gap-4",
					children: [/* @__PURE__ */ (0, A.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, A.jsx)(h, {
							htmlFor: "vf-from",
							children: "From"
						}), /* @__PURE__ */ (0, A.jsx)(y, {
							id: "vf-from",
							type: "datetime-local",
							value: g,
							onChange: (e) => b(e.target.value),
							className: "w-56"
						})]
					}), /* @__PURE__ */ (0, A.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, A.jsx)(h, {
							htmlFor: "vf-to",
							children: "To"
						}), /* @__PURE__ */ (0, A.jsx)(y, {
							id: "vf-to",
							type: "datetime-local",
							value: x,
							min: g,
							onChange: (e) => S(e.target.value),
							className: "w-56"
						})]
					})]
				}),
				/* @__PURE__ */ (0, A.jsxs)("div", {
					className: "grid gap-2",
					children: [/* @__PURE__ */ (0, A.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, A.jsx)("span", {
								className: "text-sm font-medium",
								children: "Buildings"
							}),
							/* @__PURE__ */ (0, A.jsx)("button", {
								type: "button",
								className: "text-xs text-primary underline",
								onClick: () => I(G),
								children: "All"
							}),
							/* @__PURE__ */ (0, A.jsx)("button", {
								type: "button",
								className: "text-xs text-primary underline",
								onClick: () => I([]),
								children: "None"
							})
						]
					}), /* @__PURE__ */ (0, A.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [G.map((e) => /* @__PURE__ */ (0, A.jsxs)(h, {
							className: `cursor-pointer gap-2 rounded-lg border px-3 py-2 ${j.includes(e) ? "border-primary bg-primary/10" : ""}`,
							children: [/* @__PURE__ */ (0, A.jsx)(u, {
								checked: j.includes(e),
								onCheckedChange: (t) => I((n) => t === !0 ? [...n, e] : n.filter((t) => t !== e))
							}), e]
						}, e)), !G.length && /* @__PURE__ */ (0, A.jsx)("span", {
							className: "text-sm text-muted-foreground",
							children: D ? "No buildings set up for this site." : "Loading…"
						})]
					})]
				}),
				/* @__PURE__ */ (0, A.jsxs)("div", {
					className: "flex flex-wrap items-center gap-3",
					children: [/* @__PURE__ */ (0, A.jsxs)(v, {
						size: "lg",
						onClick: Y,
						disabled: !!J || U,
						className: "shadow-md ring-2 ring-primary/30",
						children: [/* @__PURE__ */ (0, A.jsx)(C, { className: "size-4" }), U ? "Working…" : "Run forecast"]
					}), J && /* @__PURE__ */ (0, A.jsx)("span", {
						className: "text-sm text-muted-foreground",
						children: J
					})]
				}),
				V && /* @__PURE__ */ (0, A.jsx)("p", {
					className: "text-sm text-destructive",
					children: V
				})
			]
		}), L && /* @__PURE__ */ (0, A.jsxs)("section", {
			className: "grid gap-3 rounded-xl border bg-card p-4",
			children: [
				/* @__PURE__ */ (0, A.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, A.jsxs)("div", { children: [/* @__PURE__ */ (0, A.jsxs)("h2", {
						className: "text-lg font-bold",
						children: [
							N(L.from),
							" → ",
							N(L.to)
						]
					}), /* @__PURE__ */ (0, A.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: L.buildings.join(", ")
					})] }), /* @__PURE__ */ (0, A.jsxs)(v, {
						variant: "outline",
						onClick: () => void Q(),
						disabled: !X.length,
						children: [/* @__PURE__ */ (0, A.jsx)(_, { className: "size-4" }), "Download Excel"]
					})]
				}),
				/* @__PURE__ */ (0, A.jsx)("div", {
					className: "grid grid-cols-2 gap-2 sm:grid-cols-5",
					children: [
						[
							"Free beds",
							L.freeBeds,
							"text-emerald-700"
						],
						[
							"Rooms",
							L.rooms,
							""
						],
						[
							"Empty rooms",
							L.vacant,
							""
						],
						[
							"Rooms with some beds free",
							L.withSpace,
							""
						],
						[
							"Full rooms",
							L.full,
							""
						]
					].map(([e, t, n]) => /* @__PURE__ */ (0, A.jsxs)("div", {
						className: "rounded-lg border p-3",
						children: [/* @__PURE__ */ (0, A.jsx)("div", {
							className: `text-2xl font-bold ${n}`,
							children: t
						}), /* @__PURE__ */ (0, A.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: e
						})]
					}, e))
				}),
				/* @__PURE__ */ (0, A.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Free beds = beds still free for the whole period (beds minus the most in use at any one time). An Exclusive room counts as full."
				}),
				/* @__PURE__ */ (0, A.jsx)("div", {
					className: "flex flex-wrap gap-1.5",
					children: P.map(([e, t]) => /* @__PURE__ */ (0, A.jsxs)(v, {
						size: "sm",
						variant: z === e ? "default" : "outline",
						onClick: () => B(e),
						children: [
							t,
							" (",
							L.rows.filter(F(e)).length,
							")"
						]
					}, e))
				}),
				/* @__PURE__ */ (0, A.jsx)("div", {
					className: "max-h-[65vh] overflow-auto rounded-lg border",
					children: /* @__PURE__ */ (0, A.jsxs)("table", {
						className: "w-full text-sm",
						children: [/* @__PURE__ */ (0, A.jsx)("thead", {
							className: "sticky top-0 bg-muted text-left",
							children: /* @__PURE__ */ (0, A.jsxs)("tr", { children: [
								Z && /* @__PURE__ */ (0, A.jsx)("th", {
									className: "p-2",
									children: "Building"
								}),
								/* @__PURE__ */ (0, A.jsx)("th", {
									className: "p-2",
									children: "Room"
								}),
								/* @__PURE__ */ (0, A.jsx)("th", {
									className: "p-2 text-right",
									children: "Beds"
								}),
								/* @__PURE__ */ (0, A.jsx)("th", {
									className: "p-2 text-right",
									children: "In use (most)"
								}),
								/* @__PURE__ */ (0, A.jsx)("th", {
									className: "p-2 text-right",
									children: "Free beds"
								}),
								/* @__PURE__ */ (0, A.jsx)("th", {
									className: "p-2",
									children: "Groups in the period"
								})
							] })
						}), /* @__PURE__ */ (0, A.jsxs)("tbody", { children: [X.map((e) => /* @__PURE__ */ (0, A.jsxs)("tr", {
							className: "border-t",
							children: [
								Z && /* @__PURE__ */ (0, A.jsx)("td", {
									className: "p-2",
									children: e.building
								}),
								/* @__PURE__ */ (0, A.jsx)("td", {
									className: "p-2 font-medium",
									children: e.room
								}),
								/* @__PURE__ */ (0, A.jsx)("td", {
									className: "p-2 text-right",
									children: e.capacity ?? "?"
								}),
								/* @__PURE__ */ (0, A.jsx)("td", {
									className: "p-2 text-right",
									children: e.used || ""
								}),
								/* @__PURE__ */ (0, A.jsx)("td", {
									className: `p-2 text-right font-bold ${e.free ? "text-emerald-700" : "text-muted-foreground"}`,
									children: e.free ?? "?"
								}),
								/* @__PURE__ */ (0, A.jsx)("td", {
									className: "p-2 text-xs text-muted-foreground",
									children: e.groups
								})
							]
						}, e.building + e.room)), !X.length && /* @__PURE__ */ (0, A.jsx)("tr", { children: /* @__PURE__ */ (0, A.jsx)("td", {
							colSpan: 6,
							className: "p-6 text-center text-muted-foreground",
							children: "No rooms here."
						}) })] })]
					})
				})
			]
		})]
	});
}
function L() {
	let t = i(), n = e(), r = (0, w.useRef)(null), a = (0, w.useRef)(null), [o, s] = (0, w.useState)("vacancy");
	(0, w.useEffect)(() => {
		let e = !0;
		return (async () => {
			let [i, o] = await Promise.all([n("views/forecast/planner.js"), n("views/forecast/allocate.js")]);
			if (!e || !r.current || !a.current) return;
			let s = i.mountPlanner({
				ctx: t,
				host: r.current
			});
			o.mountAllocator({
				ctx: t,
				host: a.current,
				planner: s
			});
		})(), () => {
			e = !1;
		};
	}, []);
	let c = [
		["vacancy", "Vacancy forecast"],
		["planner", "Building planner"],
		["allocator", "Day allocation"]
	];
	return /* @__PURE__ */ (0, A.jsxs)("div", {
		className: "mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4",
		children: [
			/* @__PURE__ */ (0, A.jsx)("style", { children: `.fc-legacy {\n${T}\n}` }),
			/* @__PURE__ */ (0, A.jsx)(x, {
				view: "forecast",
				title: "Forecast",
				current: c.find((e) => e[0] === o)?.[1]
			}),
			/* @__PURE__ */ (0, A.jsxs)(m, {
				value: o,
				onValueChange: s,
				children: [
					/* @__PURE__ */ (0, A.jsx)(p, {
						variant: "underline",
						children: c.map(([e, t]) => /* @__PURE__ */ (0, A.jsx)(d, {
							value: e,
							children: t
						}, e))
					}),
					/* @__PURE__ */ (0, A.jsx)(f, {
						value: "vacancy",
						forceMount: !0,
						className: "data-[state=inactive]:hidden",
						children: /* @__PURE__ */ (0, A.jsx)(I, {})
					}),
					/* @__PURE__ */ (0, A.jsx)(f, {
						value: "planner",
						forceMount: !0,
						className: "fc-legacy data-[state=inactive]:hidden",
						children: /* @__PURE__ */ (0, A.jsx)("section", {
							ref: r,
							className: "wrap pl",
							id: "planner"
						})
					}),
					/* @__PURE__ */ (0, A.jsxs)(f, {
						value: "allocator",
						forceMount: !0,
						className: "fc-legacy data-[state=inactive]:hidden",
						children: [/* @__PURE__ */ (0, A.jsx)("section", {
							ref: a,
							className: "wrap pl al",
							id: "allocator"
						}), /* @__PURE__ */ (0, A.jsx)("section", {
							className: "wrap pl lg",
							id: "alloclog",
							children: /* @__PURE__ */ (0, A.jsx)(b, {})
						})]
					})
				]
			})
		]
	});
}
export { L as default };
