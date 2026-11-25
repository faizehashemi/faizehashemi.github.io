import { f as e, h as t, i as n, n as r, p as i, u as a } from "./PmsContext-BVMd13Oi.js";
import { t as o } from "./useQuery-BUXPY6q6.js";
import { t as s } from "./label-CMEyi--P.js";
import { t as c } from "./printer-_t2PY0au.js";
import { t as l } from "./button-BGWa3SLr.js";
import { t as u } from "./card-B9_OGomP.js";
import { t as d } from "./input-DSBk_UeU.js";
import { t as f } from "./utils-b7UP9Cmo.js";
import { t as p } from "./useSlips-DUKbzGma.js";
// src/pages/building-hisaab/hisaab.ts
var m = /* @__PURE__ */ t(i(), 1), h = (e) => String(e).padStart(2, "0"), g = (e) => `${e.getFullYear()}-${h(e.getMonth() + 1)}-${h(e.getDate())}`, _ = (e, t) => e.localeCompare(t, void 0, {
	numeric: !0,
	sensitivity: "base"
});
function v(e, t) {
	let n = [], r = new Date(e);
	for (; +r < t && n.length < 121;) {
		let e = +r;
		r.setDate(r.getDate() + 1), n.push({
			day: g(new Date(e)),
			a: e,
			b: Math.min(+r, t)
		});
	}
	return n;
}
async function y(e, t, n, r, i, a, o, s = () => {}) {
	let c = v(n, r), l = c.length > 120, u = c.slice(0, 120), d = (t.rooms || []).filter((e) => String(e.room_no || "").trim()).sort((e, t) => _(String(e.room_no).trim(), String(t.room_no).trim())), f = new Map(d.map((e) => [a.normRoom(e.room_no), u.map(() => !1)])), p = i.normB(t.name);
	for (let t = 0; t < e.length; t++) {
		let n = e[t];
		if (t % 250 == 0 && (s(t, e.length), await new Promise((e) => setTimeout(e, 0))), !n.deleted) for (let e of i.rowsOf(n)) {
			if (i.normB(e.building) !== p || !e.start || !e.end) continue;
			let t = f.get(a.normRoom(e.room_no));
			t && u.forEach((n, r) => {
				!t[r] && e.start < n.b && e.end > n.a && (t[r] = !0);
			});
		}
	}
	let m = u.map((e) => ({
		day: e.day,
		occ: 0,
		vac: 0,
		amount: 0
	})), h = d.filter((e) => e.active !== !1 || f.get(a.normRoom(e.room_no)).some(Boolean)).map((e) => {
		let t = String(e.room_no).trim(), n = a.normRoom(t), r = f.get(n), i = e.active === !1, s = a.handedAt ? a.handedAt(e) : null, c = u.map((e, t) => s !== null && s <= e.a ? "gone" : r[t] ? "yes" : i ? "off" : "no"), l = c.filter((e) => e === "yes").length, d = c.filter((e) => e === "no").length;
		return c.forEach((e, t) => {
			e === "yes" ? (m[t].occ++, m[t].amount += o) : e === "no" && m[t].vac++;
		}), {
			no: t,
			...i ? { off: i } : {},
			cells: c,
			occ: l,
			vac: d,
			amount: l * o
		};
	}), g = h.reduce((e, t) => e + t.occ, 0), y = h.reduce((e, t) => e + t.vac, 0);
	return s(e.length, e.length), {
		building: t.name,
		from: n,
		to: r,
		rate: o,
		days: u.map((e) => e.day),
		rooms: h,
		perDay: m,
		occ: g,
		vac: y,
		payable: h.reduce((e, t) => e + t.amount, 0),
		cut: l
	};
}
var b = (e) => e.toLocaleString("en-US", {
	minimumFractionDigits: 0,
	maximumFractionDigits: 2
}), x = (e, t) => t ? Math.round(e / t * 1e3) / 10 : 0, S = (e) => String(e ?? "").replace(/[&<>"']/g, (e) => ({
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
})[e]), C = (e) => (/* @__PURE__ */ new Date(`${e}T12:00`)).toLocaleDateString("en-GB", {
	day: "2-digit",
	month: "short"
}), w = (e) => (/* @__PURE__ */ new Date(`${e}T12:00`)).toLocaleDateString("en-GB", { weekday: "short" }), T = (e) => new Date(e).toLocaleString("en-GB", {
	day: "2-digit",
	month: "short",
	year: "numeric",
	hour: "2-digit",
	minute: "2-digit"
}), E = {
	yes: "✓",
	no: "✗",
	gone: "—",
	off: "·"
};
function D(e, t, n) {
	let r = e.occ + e.vac, i = `SAR ${b(e.rate)} per room per day`, a = (e, t, n = "") => `<div class="kpi"><span>${S(e)}</span><b>${S(t)}</b>${n ? `<small>${S(n)}</small>` : ""}</div>`, o = e.perDay.map((e) => `<tr><td>${S(w(e.day))} ${S(C(e.day))}</td><td class="n">${e.occ}</td><td class="n">${e.vac}</td><td class="n">${x(e.occ, e.occ + e.vac)}%</td><td class="r">${b(e.amount)}</td></tr>`).join(""), s = [];
	for (let t = 0; t < e.days.length; t += 16) {
		let n = e.days.slice(t, t + 16), r = n.map((e, n) => t + n), i = t + 16 >= e.days.length, a = `<tr><th class="rm">Room</th>${n.map((e) => `<th class="d">${S(w(e))}<br>${S(C(e))}</th>`).join("")}${i ? "<th class=\"n\">Days</th><th class=\"r\">Amount</th>" : ""}</tr>`, o = e.rooms.map((e) => `<tr><td class="rm">${S(e.no)}${e.off ? "<small class=\"off\">inactive</small>" : ""}</td>${r.map((t) => `<td class="d ${e.cells[t]}">${E[e.cells[t]]}</td>`).join("")}${i ? `<td class="n">${e.occ}</td><td class="r">${b(e.amount)}</td>` : ""}</tr>`).join(""), c = `<tr class="tot"><td class="rm">Occupied</td>${r.map((t) => `<td class="d">${e.perDay[t].occ}</td>`).join("")}${i ? `<td class="n">${e.occ}</td><td class="r">${b(e.payable)}</td>` : ""}</tr>
            <tr class="tot"><td class="rm">Vacant</td>${r.map((t) => `<td class="d">${e.perDay[t].vac}</td>`).join("")}${i ? `<td class="n">${e.vac}</td><td></td>` : ""}</tr>`;
		s.push(`<h2>Room chart ${e.days.length > 16 ? `· ${S(C(n[0]))} – ${S(C(n[n.length - 1]))}` : ""}</h2><table class="grid"><thead>${a}</thead><tbody>${o}</tbody><tfoot>${c}</tfoot></table>`);
	}
	return `<!doctype html><html><head><meta charset="utf-8"><title>Building Hisaab ${S(e.building)} ${S(e.days[0] || "")}</title><style>
        @page { size: A4 landscape; margin: 10mm; }
        * { box-sizing: border-box; }
        html, body { margin: 0; background: #fff; color: #111; font: 9.5pt/1.35 Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .bar { position: sticky; top: 0; display: flex; gap: 10px; align-items: center; padding: 8px 12px; background: #fffaf1; border-bottom: 1px solid #dcc7a4; font: 13px system-ui, sans-serif; }
        .bar button { font: inherit; padding: 5px 14px; border: 1px solid #b08d2a; border-radius: 8px; background: #b08d2a; color: #fff; font-weight: 700; cursor: pointer; }
        header.top { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2.5px solid #7a5c12; padding-bottom: 3mm; margin-bottom: 4mm; }
        header.top h1 { margin: 0; font-size: 18pt; color: #4a3708; letter-spacing: .5px; } header.top .who { text-align: right; font-size: 9pt; color: #444; }
        .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2mm 6mm; margin-bottom: 4mm; font-size: 10pt; } .meta b { color: #4a3708; }
        .kpis { display: grid; grid-template-columns: repeat(5, 1fr); gap: 3mm; margin-bottom: 5mm; }
        .kpi { border: 1px solid #cdb67a; border-radius: 2mm; padding: 2.5mm 3mm; background: #fdf8ec; } .kpi span { display: block; font-size: 8pt; color: #6b5a2e; text-transform: uppercase; letter-spacing: .4px; }
        .kpi b { display: block; font-size: 15pt; color: #2b2105; margin-top: 1mm; } .kpi small { color: #555; }
        .kpi.main { background: #4a3708; border-color: #4a3708; } .kpi.main span, .kpi.main b, .kpi.main small { color: #fff; }
        h2 { font-size: 11.5pt; margin: 0 0 2mm; color: #4a3708; break-after: avoid; }
        table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #9a8a5e; padding: 1.2mm 1.6mm; }
        th { background: #efe4c4; font-size: 8.5pt; } thead { display: table-header-group; } tfoot { display: table-footer-group; } tr { break-inside: avoid; }
        .n { text-align: center; white-space: nowrap; } .r { text-align: right; white-space: nowrap; }
        .days { width: 60%; } .days td:first-child { white-space: nowrap; }
        table.grid { table-layout: fixed; font-size: 8.5pt; } table.grid th.rm, table.grid td.rm { width: 15mm; text-align: left; font-weight: 700; } table.grid th.d, table.grid td.d { text-align: center; padding: .8mm .3mm; }
        table.grid th.n, table.grid td.n { width: 13mm; } table.grid th.r, table.grid td.r { width: 20mm; }
        td.yes { color: #146c2e; font-weight: 700; } td.off { color: #aaa; background: #fafafa; } small.off { display: block; font-size: 6.5pt; font-weight: 400; color: #8a6d00; } td.no { color: #b42318; } td.gone { color: #888; background: #f1f1f1; }
        tr.tot td { background: #f6efda; font-weight: 700; }
        .page2 { break-before: page; } .page2 + .page2 { break-before: page; }
        .note { font-size: 8.5pt; color: #555; margin-top: 3mm; }
        .sign { display: grid; grid-template-columns: 1fr 1fr; gap: 20mm; margin-top: 12mm; font-size: 9pt; } .sign div { border-top: 1px solid #333; padding-top: 1.5mm; }
        @media screen { body { background: #e9e6df; } .page { width: 277mm; margin: 8mm auto; padding: 10mm; background: #fff; box-shadow: 0 4px 16px rgba(0,0,0,.15); } }
        @media print { .bar { display: none; } }
    </style></head><body>
    <div class="bar"><button type="button" onclick="window.print()">Print / Save as PDF</button><span>A4 landscape — page 1 is the summary, then the room chart</span></div>
    <div class="page">
        <header class="top"><div><h1>Building Hisaab — ${S(e.building)}</h1><div>${S(t)}</div></div><div class="who">Prepared ${S(T(Date.now()))}${n ? `<br>by ${S(n)}` : ""}</div></header>
        <div class="meta"><div><b>Period:</b> ${S(T(e.from))} → ${S(T(e.to))}</div><div><b>Days:</b> ${e.days.length} (24 hours each from ${S(new Date(e.from).toTimeString().slice(0, 5))})${e.cut ? " — first 120 only" : ""}</div><div><b>Rooms:</b> ${e.rooms.length}</div><div><b>Charge:</b> ${S(i)}</div><div><b>Room-days:</b> ${r}</div></div>
        <div class="kpis">${a("Total payable", `SAR ${b(e.payable)}`, "occupied room-days × charge").replace("class=\"kpi\"", "class=\"kpi main\"")}${a("Room-days occupied", String(e.occ), `${x(e.occ, r)}%`)}${a("Room-days vacant", String(e.vac), `${x(e.vac, r)}%`)}${a("Occupancy", `${x(e.occ, r)}%`)}${a("Vacancy", `${x(e.vac, r)}%`)}</div>
        <h2>Day by day</h2>
        <table class="days"><thead><tr><th>Day</th><th class="n">Rooms occupied</th><th class="n">Rooms vacant</th><th class="n">Occupancy</th><th class="r">Payable (SAR)</th></tr></thead>
            <tbody>${o}</tbody><tfoot><tr class="tot"><td>Total</td><td class="n">${e.occ}</td><td class="n">${e.vac}</td><td class="n">${x(e.occ, r)}%</td><td class="r">${b(e.payable)}</td></tr></tfoot></table>
        <p class="note">✓ occupied · ✗ vacant · — handed back to the hotel (not counted) · · inactive room, counted only on the days it was occupied. Rooms in number order. A room is occupied on a day when a guest stay is in it at any time of those 24 hours, from the slips of the PMS.</p>
        <div class="sign"><div>Prepared by</div><div>Checked / received by (${S(e.building)})</div></div>
        ${s.map((e) => `<section class="page2">${e}</section>`).join("")}
    </div><script>window.addEventListener('load', () => setTimeout(() => window.print(), 300));<\/script></body></html>`;
}
// src/pages/building-hisaab/BuildingHisaabPage.tsx
var O = e(), k = {
	yes: "✓",
	no: "✗",
	gone: "—",
	off: "·"
}, A = (e) => (/* @__PURE__ */ new Date(`${e}T12:00`)).toLocaleDateString("en-GB", {
	day: "2-digit",
	month: "short"
}), j = (e) => (/* @__PURE__ */ new Date(`${e}T12:00`)).toLocaleDateString("en-GB", { weekday: "short" }), M = (e, t) => {
	let n = /* @__PURE__ */ new Date(`${e}T12:00`);
	return n.setDate(n.getDate() + t), g(n);
};
function N() {
	let { rooms: e, stay: t, cloud: i } = r(), h = e, _ = n(), { site: v, siteId: S } = a(), C = g(/* @__PURE__ */ new Date()), w = p(), T = o({
		queryKey: ["buildings-force", S],
		queryFn: async () => h.buildingsOfSite(await _(h.loadBuildings({ force: !0 })), S)
	}), [E, N] = (0, m.useState)(""), [P, F] = (0, m.useState)({
		fd: M(C, -6),
		ft: "12:00",
		td: C,
		tt: "12:00"
	}), [I, L] = (0, m.useState)(""), [R, z] = (0, m.useState)(null), [B, V] = (0, m.useState)(null), [H, U] = (0, m.useState)({ t: "" });
	(0, m.useEffect)(() => {
		try {
			Object.keys(localStorage).filter((e) => e.startsWith("pms_hisaab_")).forEach((e) => localStorage.removeItem(e));
		} catch {}
	}, []);
	let W = T.data ?? [];
	(0, m.useEffect)(() => {
		!E && W.length && N(W[0].name);
	}, [W.length]);
	let G = Date.parse(`${P.fd}T${P.ft}`), K = Date.parse(`${P.td}T${P.tt}`), q = !P.fd || !P.td || Number.isNaN(G) || Number.isNaN(K) ? "Choose both dates." : K <= G ? "The end must be after the beginning." : "";
	(0, m.useEffect)(() => {
		z(null);
	}, [
		E,
		P.fd,
		P.ft,
		P.td,
		P.tt,
		I
	]);
	let J = R ? R.occ + R.vac : 0;
	async function Y() {
		let n = Number(I);
		if (q) U({
			t: q,
			bad: !0
		});
		else if (I === "" || !(n >= 0)) U({
			t: "Enter the charge per room per day.",
			bad: !0
		});
		else {
			z(null), U({ t: "" });
			try {
				V({
					t: "Reading the latest slips and buildings…",
					f: .05
				});
				let [r, i] = await Promise.all([w.refetch(), T.refetch()]), a = (i.data ?? []).find((e) => e.name === E);
				if (!a) throw Error("Building not found");
				let o = await y(r.data ?? [], a, G, K, t, e, n, (e, t) => V({
					t: `Checking the stays — ${e} of ${t} slips`,
					f: .1 + .85 * (t ? e / t : 1)
				}));
				z(o), U({ t: `Calculated ${(/* @__PURE__ */ new Date()).toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit"
				})}.` });
			} catch (e) {
				U({
					t: "Could not calculate: " + (e.message || e),
					bad: !0
				});
			} finally {
				V(null);
			}
		}
	}
	function X() {
		if (!R) return;
		let e = window.open("", "_blank");
		e ? (e.document.open(), e.document.write(D(R, v.label, String(i.currentDesk()?.name || ""))), e.document.close()) : U({
			t: "The browser blocked the new tab: allow pop-ups for this site.",
			bad: !0
		});
	}
	let Z = (e, t, n, r) => /* @__PURE__ */ (0, O.jsxs)("div", {
		className: f("rounded-lg border p-3", r ? "border-primary bg-primary text-primary-foreground" : "bg-card"),
		children: [
			/* @__PURE__ */ (0, O.jsx)("div", {
				className: f("text-xs font-semibold uppercase tracking-wide", r ? "opacity-90" : "text-muted-foreground"),
				children: e
			}),
			/* @__PURE__ */ (0, O.jsx)("div", {
				className: "text-2xl font-bold",
				children: t
			}),
			n && /* @__PURE__ */ (0, O.jsx)("div", {
				className: "text-xs opacity-80",
				children: n
			})
		]
	});
	return /* @__PURE__ */ (0, O.jsxs)("div", {
		className: "mx-auto grid max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4",
		children: [
			/* @__PURE__ */ (0, O.jsxs)("header", { children: [/* @__PURE__ */ (0, O.jsxs)("h1", {
				className: "text-2xl font-bold text-primary",
				children: ["Building Hisaab — ", v.label]
			}), /* @__PURE__ */ (0, O.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Enter the charge per room per day and the period, then Calculate. The period is cut into 24-hour days from the From time; a room is occupied (✓) on a day if a guest was in it at any time of those 24 hours, else vacant (✗). Payable = occupied room-days × charge. Nothing is kept: each Calculate reads the latest slips."
			})] }),
			/* @__PURE__ */ (0, O.jsxs)(u, {
				className: "flex-row flex-wrap items-end gap-3 p-3",
				children: [
					/* @__PURE__ */ (0, O.jsxs)("div", {
						className: "grid gap-1",
						children: [/* @__PURE__ */ (0, O.jsx)(s, {
							htmlFor: "hbB",
							children: "Building"
						}), /* @__PURE__ */ (0, O.jsx)("select", {
							id: "hbB",
							className: "h-9 min-w-40 rounded-md border bg-background px-2 text-sm",
							value: E,
							onChange: (e) => N(e.target.value),
							children: W.map((e) => /* @__PURE__ */ (0, O.jsx)("option", { children: e.name }, e.name))
						})]
					}),
					/* @__PURE__ */ (0, O.jsxs)("div", {
						className: "grid gap-1",
						children: [/* @__PURE__ */ (0, O.jsx)(s, {
							htmlFor: "hbFd",
							children: "From"
						}), /* @__PURE__ */ (0, O.jsxs)("div", {
							className: "flex gap-1",
							children: [/* @__PURE__ */ (0, O.jsx)(d, {
								id: "hbFd",
								type: "date",
								className: "h-9 w-40",
								value: P.fd,
								onChange: (e) => F({
									...P,
									fd: e.target.value
								})
							}), /* @__PURE__ */ (0, O.jsx)(d, {
								"aria-label": "From time",
								type: "time",
								className: "h-9 w-28",
								value: P.ft,
								onChange: (e) => F({
									...P,
									ft: e.target.value
								})
							})]
						})]
					}),
					/* @__PURE__ */ (0, O.jsxs)("div", {
						className: "grid gap-1",
						children: [/* @__PURE__ */ (0, O.jsx)(s, {
							htmlFor: "hbTd",
							children: "To"
						}), /* @__PURE__ */ (0, O.jsxs)("div", {
							className: "flex gap-1",
							children: [/* @__PURE__ */ (0, O.jsx)(d, {
								id: "hbTd",
								type: "date",
								className: "h-9 w-40",
								value: P.td,
								onChange: (e) => F({
									...P,
									td: e.target.value
								})
							}), /* @__PURE__ */ (0, O.jsx)(d, {
								"aria-label": "To time",
								type: "time",
								className: "h-9 w-28",
								value: P.tt,
								onChange: (e) => F({
									...P,
									tt: e.target.value
								})
							})]
						})]
					}),
					/* @__PURE__ */ (0, O.jsxs)("div", {
						className: "grid gap-1",
						children: [/* @__PURE__ */ (0, O.jsx)(s, {
							htmlFor: "hbRate",
							children: "Charge per room per day (SAR)"
						}), /* @__PURE__ */ (0, O.jsx)(d, {
							id: "hbRate",
							type: "number",
							min: 0,
							step: "any",
							className: "h-9 w-40",
							value: I,
							onChange: (e) => L(e.target.value),
							onKeyDown: (e) => {
								e.key === "Enter" && Y();
							}
						})]
					}),
					/* @__PURE__ */ (0, O.jsx)(l, {
						disabled: !!B || !W.length,
						onClick: () => void Y(),
						children: B ? "Calculating…" : "Calculate"
					}),
					/* @__PURE__ */ (0, O.jsxs)(l, {
						variant: "outline",
						disabled: !R || !!B,
						onClick: X,
						children: [/* @__PURE__ */ (0, O.jsx)(c, { className: "size-4" }), "Print statement"]
					}),
					/* @__PURE__ */ (0, O.jsx)("span", {
						className: f("text-sm", q || H.bad ? "text-destructive" : "text-muted-foreground"),
						role: "status",
						children: q || H.t
					})
				]
			}),
			B && /* @__PURE__ */ (0, O.jsxs)(u, {
				className: "grid gap-2 p-4",
				"aria-busy": "true",
				children: [/* @__PURE__ */ (0, O.jsx)("span", {
					className: "text-sm font-semibold",
					children: B.t
				}), /* @__PURE__ */ (0, O.jsx)("div", {
					className: "h-2.5 overflow-hidden rounded-full bg-muted",
					children: /* @__PURE__ */ (0, O.jsx)("div", {
						className: "h-full rounded-full bg-primary transition-[width]",
						style: { width: `${Math.round(B.f * 100)}%` }
					})
				})]
			}),
			!W.length && T.isSuccess && /* @__PURE__ */ (0, O.jsxs)(u, {
				className: "p-4 text-sm",
				children: [
					"No buildings are set up for ",
					v.label,
					" in Rooms & Buildings."
				]
			}),
			!R && !B && W.length > 0 && /* @__PURE__ */ (0, O.jsx)(u, {
				className: "p-4 text-sm text-muted-foreground",
				children: "Enter the charge and the period, then press Calculate."
			}),
			R && /* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [
				/* @__PURE__ */ (0, O.jsxs)("div", {
					className: "grid grid-cols-2 gap-3 md:grid-cols-5",
					children: [
						Z("Total payable", `SAR ${b(R.payable)}`, `${R.days.length} days · ${R.rooms.length} rooms · SAR ${b(R.rate)} a day`, !0),
						Z("Room-days occupied", String(R.occ), `${x(R.occ, J)}%`),
						Z("Room-days vacant", String(R.vac), `${x(R.vac, J)}%`),
						Z("Occupancy", `${x(R.occ, J)}%`),
						Z("Vacancy", `${x(R.vac, J)}%`)
					]
				}),
				R.cut && /* @__PURE__ */ (0, O.jsxs)("p", {
					className: "text-sm text-warn",
					children: [
						"Only the first ",
						120,
						" days are shown."
					]
				}),
				/* @__PURE__ */ (0, O.jsx)(u, {
					className: "overflow-auto p-0",
					children: /* @__PURE__ */ (0, O.jsxs)("table", {
						className: "w-max min-w-full border-collapse text-sm",
						children: [
							/* @__PURE__ */ (0, O.jsx)("thead", {
								className: "sticky top-0 z-10 bg-secondary",
								children: /* @__PURE__ */ (0, O.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, O.jsx)("th", {
										className: "sticky left-0 z-20 bg-secondary p-1.5 text-left",
										children: "Room"
									}),
									R.days.map((e) => /* @__PURE__ */ (0, O.jsxs)("th", {
										className: "p-1 text-center leading-tight",
										children: [/* @__PURE__ */ (0, O.jsx)("span", {
											className: "block text-[10px] font-medium text-muted-foreground",
											children: j(e)
										}), A(e)]
									}, e)),
									/* @__PURE__ */ (0, O.jsx)("th", {
										className: "border-l-2 border-gold p-1.5",
										children: "Days"
									}),
									/* @__PURE__ */ (0, O.jsx)("th", {
										className: "p-1.5 text-right",
										children: "Amount"
									})
								] })
							}),
							/* @__PURE__ */ (0, O.jsx)("tbody", { children: R.rooms.map((e) => /* @__PURE__ */ (0, O.jsxs)("tr", {
								className: "border-b",
								children: [
									/* @__PURE__ */ (0, O.jsxs)("th", {
										className: "sticky left-0 z-10 bg-card p-1.5 text-left",
										children: [e.no, e.off && /* @__PURE__ */ (0, O.jsx)("small", {
											className: "block text-[10px] font-normal text-warn",
											title: "Inactive in Rooms & Buildings, but a slip used it in this period",
											children: "inactive"
										})]
									}),
									e.cells.map((t, n) => /* @__PURE__ */ (0, O.jsx)("td", {
										className: f("border-l p-1 text-center font-bold", t === "yes" ? "text-good" : t === "no" ? "text-destructive" : "bg-muted text-muted-foreground"),
										title: `${e.no} · ${A(R.days[n])}: ${t === "yes" ? "occupied" : t === "no" ? "vacant" : t === "off" ? "inactive room, not used" : "handed back to the hotel"}`,
										children: k[t]
									}, n)),
									/* @__PURE__ */ (0, O.jsx)("td", {
										className: "border-l-2 border-gold p-1.5 text-center",
										children: e.occ
									}),
									/* @__PURE__ */ (0, O.jsx)("td", {
										className: "p-1.5 text-right",
										children: b(e.amount)
									})
								]
							}, e.no)) }),
							/* @__PURE__ */ (0, O.jsxs)("tfoot", {
								className: "bg-secondary font-bold",
								children: [
									/* @__PURE__ */ (0, O.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, O.jsx)("th", {
											className: "sticky left-0 bg-secondary p-1.5 text-left",
											children: "Occupied"
										}),
										R.perDay.map((e) => /* @__PURE__ */ (0, O.jsx)("td", {
											className: "p-1 text-center",
											children: e.occ
										}, e.day)),
										/* @__PURE__ */ (0, O.jsx)("td", {
											className: "border-l-2 border-gold p-1.5 text-center",
											children: R.occ
										}),
										/* @__PURE__ */ (0, O.jsxs)("td", {
											className: "p-1.5 text-right",
											children: ["SAR ", b(R.payable)]
										})
									] }),
									/* @__PURE__ */ (0, O.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, O.jsx)("th", {
											className: "sticky left-0 bg-secondary p-1.5 text-left",
											children: "Vacant"
										}),
										R.perDay.map((e) => /* @__PURE__ */ (0, O.jsx)("td", {
											className: "p-1 text-center",
											children: e.vac
										}, e.day)),
										/* @__PURE__ */ (0, O.jsx)("td", {
											className: "border-l-2 border-gold p-1.5 text-center",
											children: R.vac
										}),
										/* @__PURE__ */ (0, O.jsx)("td", {})
									] }),
									/* @__PURE__ */ (0, O.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, O.jsx)("th", {
											className: "sticky left-0 bg-secondary p-1.5 text-left",
											children: "Payable"
										}),
										R.perDay.map((e) => /* @__PURE__ */ (0, O.jsx)("td", {
											className: "p-1 text-center text-xs",
											children: b(e.amount)
										}, e.day)),
										/* @__PURE__ */ (0, O.jsx)("td", { className: "border-l-2 border-gold" }),
										/* @__PURE__ */ (0, O.jsx)("td", {})
									] })
								]
							})
						]
					})
				})
			] })
		]
	});
}
export { N as default };
