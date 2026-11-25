import { a as e, f as t, h as n, i as r, n as i, p as a, u as o } from "./PmsContext-BVMd13Oi.js";
import { t as s } from "./useQuery-BUXPY6q6.js";
import { a as c, i as l, n as u, r as d, t as f } from "./select-VcH2xuqJ.js";
import { a as p, i as m, n as h, o as ee, t as te } from "./dialog-DtgtvZ4Q.js";
import { t as g } from "./label-CMEyi--P.js";
import { t as _ } from "./printer-_t2PY0au.js";
import { t as v } from "./button-BGWa3SLr.js";
import { i as y, n as b, r as x, t as S } from "./card-B9_OGomP.js";
import { t as C } from "./input-DSBk_UeU.js";
import { t as w } from "./utils-b7UP9Cmo.js";
import { t as ne } from "./useSlips-DUKbzGma.js";
import { a as T, i as E, n as re, o as ie, r as D, t as O } from "./occupancy-BhwLIHY6.js";
// src/pages/occupancy/vacancy.ts
var k = /* @__PURE__ */ n(a(), 1), A = (e) => String(e ?? "").replace(/[&<>"']/g, (e) => ({
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
})[e]), j = (e) => (/* @__PURE__ */ new Date(`${e}T12:00`)).toLocaleDateString("en-GB", {
	day: "2-digit",
	month: "short"
}), M = (e) => (/* @__PURE__ */ new Date(`${e}T12:00`)).toLocaleDateString("en-GB", { weekday: "short" }), N = (e) => !e.off && e.cap > 0, P = (e) => (/* @__PURE__ */ new Date(`${e}T22:00`)).getTime(), F = (e, t, n) => !e.used[n] && !(e.until && P(t) >= e.until);
function I(e) {
	return e.days.map((t, n) => {
		let r = e.blds.map((e) => {
			let r = e.rooms.filter((e) => N(e) && F(e, t, n));
			return {
				name: e.name,
				rooms: r.map((e) => e.no),
				beds: r.reduce((e, t) => e + t.cap, 0)
			};
		});
		return {
			day: t,
			blds: r,
			rooms: r.reduce((e, t) => e + t.rooms.length, 0),
			beds: r.reduce((e, t) => e + t.beds, 0)
		};
	});
}
function L(e) {
	return e.blds.flatMap((t) => t.rooms.filter(N).map((n) => ({
		building: t.name,
		room: n.no,
		cap: n.cap,
		days: e.days.filter((e, t) => F(n, e, t))
	})).filter((e) => e.days.length));
}
function R(e, t) {
	let n = [], r = -1, i = -2, a = () => {
		r >= 0 && n.push(r === i ? j(t[r]) : `${j(t[r])} – ${j(t[i])}`);
	};
	for (let n of e) {
		let e = t.indexOf(n);
		e !== i + 1 && (a(), r = e), i = e;
	}
	return a(), n.join(", ");
}
var z = (e, t, n) => `<!doctype html><html><head><meta charset="utf-8"><title>${A(e)}</title><style>
    @page { size: A4 portrait; margin: 10mm; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #fff; color: #000; font: 10pt/1.3 Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    h1 { font-size: 14pt; margin: 0 0 1mm; } p.sub { margin: 0 0 3mm; font-size: 9pt; color: #333; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    thead { display: table-header-group; }
    th, td { border: 1px solid #000; padding: 1.2mm 1.6mm; vertical-align: top; text-align: left; overflow-wrap: anywhere; }
    th { background: #e8e8e8; font-size: 9pt; }
    tr { break-inside: avoid; page-break-inside: avoid; }
    td.n, th.n { text-align: center; white-space: nowrap; } td.b { font-weight: 700; }
    tr.first td { border-top: 2px solid #000; }
    tr.sub td { background: #f3f3f3; font-weight: 700; font-size: 9pt; }
    tr.tot td { background: #e0e0e0; font-weight: 800; border-top: 2px solid #000; }
    @media screen { body { padding: 10mm; background: #eee; } .page { background: #fff; padding: 8mm; max-width: 210mm; margin: 0 auto; } }
</style></head><body><div class="page"><h1>${A(e)}</h1><p class="sub">${A(t)}</p>${n}</div>
<script>window.addEventListener('load', () => setTimeout(() => window.print(), 250));<\/script></body></html>`, B = (e, t, n) => {
	let r = e.days.length;
	return `${t} · ${e.blds.map((e) => e.name).join(", ")} · ${j(e.days[0])} – ${j(e.days[r - 1])} (${r} night${r === 1 ? "" : "s"}) · ${n} · a room is empty when no bed in it is in use at 22:00${e.cut ? " · only the first 62 nights" : ""}`;
};
function ae(e, t) {
	let n = I(e), r = e.blds.length > 1, i = n.map((e) => {
		let t = e.blds.filter((e) => e.rooms.length || !r), n = t.map((t, n) => `<tr class="${n === 0 ? "first" : ""}"><td class="b">${n === 0 ? `${A(M(e.day))} ${A(j(e.day))}` : ""}</td>${r ? `<td>${A(t.name)}</td>` : ""}<td>${A(t.rooms.join(", ")) || "—"}</td><td class="n">${t.rooms.length}</td><td class="n">${t.beds}</td></tr>`).join("");
		return t.length ? n + (t.length > 1 ? `<tr class="sub"><td></td><td colspan="2">Total ${A(j(e.day))}</td><td class="n">${e.rooms}</td><td class="n">${e.beds}</td></tr>` : "") : `<tr class="first"><td class="b">${A(M(e.day))} ${A(j(e.day))}</td>${r ? "<td></td>" : ""}<td>No empty room</td><td class="n">0</td><td class="n">0</td></tr>`;
	}).join(""), a = n.reduce((e, t) => e + t.rooms, 0), o = n.reduce((e, t) => e + t.beds, 0);
	return z("Vacancy report — date wise", B(e, t, "empty rooms on each date"), `<table>
        <colgroup><col style="width:15%">${r ? "<col style=\"width:15%\">" : ""}<col><col style="width:9%"><col style="width:9%"></colgroup>
        <thead><tr><th>Date</th>${r ? "<th>Building</th>" : ""}<th>Empty rooms</th><th class="n">Rooms</th><th class="n">Beds</th></tr></thead>
        <tbody>${i}<tr class="tot"><td colspan="${r ? 3 : 2}">Total of the period (room-nights and bed-nights empty)</td><td class="n">${a}</td><td class="n">${o}</td></tr></tbody></table>`);
}
function oe(e, t) {
	let n = L(e), r = e.days.length, i = e.blds.length > 1, a = (t, n) => `<tr class="${n ? "first" : ""}"><td class="b">${A(t.room)}</td><td class="n">${t.cap}</td><td>${t.days.length === r ? "Every night" : A(R(t.days, e.days))}</td><td class="n">${t.days.length}</td></tr>`, o = (e) => e.reduce((e, t) => e + t.days.length, 0), s = e.blds.map((e) => {
		let t = n.filter((t) => t.building === e.name), r = e.rooms.filter(N).length;
		return `${i ? `<tr class="sub"><td colspan="4">${A(e.name)}</td></tr>` : ""}${t.map((e, t) => a(e, t === 0)).join("") || "<tr><td colspan=\"4\">No room stood empty on any night</td></tr>"}
            <tr class="sub"><td colspan="3">${i ? `Total ${A(e.name)}: ` : "Total: "}${t.length} of ${r} rooms empty at least one night</td><td class="n">${o(t)}</td></tr>`;
	}).join("");
	return z("Vacancy report — room wise", B(e, t, "dates each room stood empty"), `<table>
        <colgroup><col style="width:13%"><col style="width:8%"><col><col style="width:11%"></colgroup>
        <thead><tr><th>Room</th><th class="n">Beds</th><th>Empty on</th><th class="n">Nights</th></tr></thead>
        <tbody>${s}${i ? `<tr class="tot"><td colspan="3">Total: ${n.length} rooms empty at least one night</td><td class="n">${o(n)}</td></tr>` : ""}</tbody></table>`);
}
// src/pages/occupancy/OccupancyPage.tsx
var V = t(), H = (e) => (/* @__PURE__ */ new Date(`${e}T12:00`)).toLocaleDateString(void 0, {
	day: "2-digit",
	month: "short"
}), U = (e) => (/* @__PURE__ */ new Date(`${e}T12:00`)).toLocaleDateString(void 0, { weekday: "short" }), se = [
	[
		"Next 7 days",
		0,
		6
	],
	[
		"Next 14",
		0,
		13
	],
	[
		"Next 30",
		0,
		29
	],
	[
		"Last 7",
		-7,
		-1
	],
	[
		"Last 30",
		-30,
		-1
	]
], W = (e) => ({
	background: `color-mix(in srgb, #2f7d32 ${Math.min(100, e)}%, #fbf6ea)`,
	fontWeight: 700,
	color: "#2b1e15"
});
function G({ used: e, cap: t }) {
	return t > 12 || e > 16 ? /* @__PURE__ */ (0, V.jsxs)("span", {
		className: "text-xs font-bold",
		children: [
			e,
			"/",
			t
		]
	}) : /* @__PURE__ */ (0, V.jsx)("span", {
		className: "inline-flex max-w-16 flex-wrap justify-center gap-0.5",
		children: Array.from({ length: Math.max(t, e) }, (n, r) => /* @__PURE__ */ (0, V.jsx)("i", { className: w("size-2 rounded-full border", r >= t ? "border-destructive bg-destructive" : r < e ? "border-ok bg-ok" : "border-[#c9b48e] bg-white") }, r))
	});
}
function ce({ name: e, days: t, load: n }) {
	let [r, i] = (0, k.useState)(null), a = t.length;
	if ((0, k.useEffect)(() => {
		i(null);
		let t = setTimeout(() => i(n(e)), 30);
		return () => clearTimeout(t);
	}, [e, n]), !r) return /* @__PURE__ */ (0, V.jsx)("p", {
		className: "p-3 text-sm text-muted-foreground",
		children: "Loading rooms…"
	});
	let o = [...new Set(r.rooms.map((e) => e.floor))];
	return /* @__PURE__ */ (0, V.jsx)("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ (0, V.jsxs)("table", {
			className: "w-max min-w-full text-xs",
			children: [
				/* @__PURE__ */ (0, V.jsx)("thead", { children: /* @__PURE__ */ (0, V.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, V.jsx)("th", {
						className: "sticky left-0 z-10 bg-card p-1.5 text-left",
						children: "Room"
					}),
					/* @__PURE__ */ (0, V.jsx)("th", {
						className: "p-1.5",
						children: "Beds"
					}),
					t.map((e) => /* @__PURE__ */ (0, V.jsxs)("th", {
						className: "bg-secondary p-1.5 leading-tight",
						children: [/* @__PURE__ */ (0, V.jsx)("span", {
							className: "block text-[10px] font-medium text-muted-foreground",
							children: U(e)
						}), H(e)]
					}, e)),
					/* @__PURE__ */ (0, V.jsx)("th", {
						className: "border-l-2 border-gold bg-secondary p-1.5",
						children: "Avg"
					})
				] }) }),
				/* @__PURE__ */ (0, V.jsx)("tbody", { children: o.map((e) => [/* @__PURE__ */ (0, V.jsx)("tr", { children: /* @__PURE__ */ (0, V.jsxs)("td", {
					colSpan: a + 3,
					className: "bg-muted p-1.5 text-left font-bold",
					children: ["Floor ", e]
				}) }, `f-${e}`), ...r.rooms.filter((t) => t.floor === e).map((e) => {
					let n = e.cap ? D(T(e.used), e.cap * a) : 0;
					return /* @__PURE__ */ (0, V.jsxs)("tr", {
						className: w(e.off && "opacity-70"),
						children: [
							/* @__PURE__ */ (0, V.jsxs)("th", {
								className: "sticky left-0 z-10 bg-card p-1.5 text-left",
								children: [e.no, e.off && /* @__PURE__ */ (0, V.jsx)("small", {
									className: "block text-[10px] font-medium text-muted-foreground",
									children: "not in Rooms & Buildings"
								})]
							}),
							/* @__PURE__ */ (0, V.jsx)("td", {
								className: "border p-1.5 text-center",
								children: e.cap || "—"
							}),
							e.used.map((n, r) => e.until && (/* @__PURE__ */ new Date(`${t[r]}T22:00`)).getTime() >= e.until ? /* @__PURE__ */ (0, V.jsx)("td", {
								className: "border bg-muted p-1.5 text-center text-muted-foreground",
								title: "Handed back to the hotel",
								children: "—"
							}, r) : /* @__PURE__ */ (0, V.jsx)("td", {
								className: w("border p-1.5 text-center", n > e.cap && "bg-bad-soft"),
								title: `Room ${e.no} ${H(t[r])}: ${n} of ${e.cap} beds`,
								children: /* @__PURE__ */ (0, V.jsx)(G, {
									used: n,
									cap: e.cap
								})
							}, r)),
							/* @__PURE__ */ (0, V.jsx)("td", {
								style: e.cap ? W(n) : void 0,
								className: "border border-l-2 border-gold p-1.5 text-center",
								children: e.cap ? `${n}%` : "—"
							})
						]
					}, e.key);
				})]) }),
				/* @__PURE__ */ (0, V.jsx)("tfoot", { children: /* @__PURE__ */ (0, V.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, V.jsx)("th", {
						className: "sticky left-0 z-10 bg-card p-1.5 text-left",
						children: "Total"
					}),
					/* @__PURE__ */ (0, V.jsx)("td", {
						className: "p-1.5 text-center",
						children: r.cap
					}),
					r.used.map((e, t) => /* @__PURE__ */ (0, V.jsxs)("td", {
						className: "border p-1.5 text-center",
						children: [e, /* @__PURE__ */ (0, V.jsxs)("small", {
							className: "block text-[10px] text-muted-foreground",
							children: [D(e, r.cap), "%"]
						})]
					}, t)),
					/* @__PURE__ */ (0, V.jsxs)("td", {
						className: "border border-l-2 border-gold p-1.5 text-center font-bold",
						children: [D(T(r.used), r.cap * a), "%"]
					})
				] }) })
			]
		})
	});
}
function K() {
	let { rooms: t, stay: n } = i(), a = r(), A = e(), { site: j, siteId: M } = o(), N = ie(/* @__PURE__ */ new Date()), [P, F] = (0, k.useState)(N), [I, L] = (0, k.useState)(E(N, 13)), [R, z] = (0, k.useState)("all"), [B, G] = (0, k.useState)(!1), [K, q] = (0, k.useState)(""), [le, ue] = (0, k.useState)(/* @__PURE__ */ new Set()), J = ne(), Y = s({
		queryKey: ["buildings-force", M],
		queryFn: async () => t.buildingsOfSite(await a(t.loadBuildings({ force: !0 })), M)
	}), X = (0, k.useMemo)(() => (Y.data ?? []).map((e) => ({
		name: e.name,
		rooms: e.rooms.filter((e) => e.active !== !1 && re(e.capacity) > 0).map((e) => ({
			...e,
			until: t.handedAt(e) ?? void 0
		}))
	})).filter((e) => e.rooms.length), [Y.data]), Z = (0, k.useMemo)(() => J.data && Y.data ? O(J.data, X, {
		from: P || N,
		to: I || P || N,
		only: R === "all" ? void 0 : R,
		perRoom: !1
	}, n, t) : null, [
		J.data,
		X,
		P,
		I,
		R,
		n,
		t,
		Y.data
	]), Q = (0, k.useMemo)(() => /* @__PURE__ */ new Map(), [
		J.data,
		X,
		P,
		I
	]), de = (0, k.useMemo)(() => (e) => {
		let r = Q.get(e);
		return r || (r = O(J.data ?? [], X, {
			from: P || N,
			to: I || P || N,
			only: e
		}, n, t).blds[0], Q.set(e, r)), r;
	}, [Q]);
	async function fe() {
		if (!K) return;
		let e = P || N, t = I || e;
		e > t && ([e, t] = [t, e]), G(!1), (await A("views/occupancy/allocprint.js")).printAllocation(J.data ?? [], K, e, t);
	}
	function $(e) {
		if (!J.data || !X.length) {
			alert("No buildings in Rooms & Buildings for this site.");
			return;
		}
		let r = window.open("", "_blank");
		if (!r) {
			alert("The browser blocked the print page — allow pop-ups for this site and try again.");
			return;
		}
		let i = O(J.data, X, {
			from: P || N,
			to: I || P || N,
			only: R === "all" ? void 0 : R
		}, n, t);
		r.document.open(), r.document.write(e === "date" ? ae(i, j.label) : oe(i, j.label)), r.document.close();
	}
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		className: "mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4",
		children: [
			/* @__PURE__ */ (0, V.jsxs)("header", {
				className: "grid gap-3 print:hidden",
				children: [/* @__PURE__ */ (0, V.jsxs)("div", { children: [/* @__PURE__ */ (0, V.jsx)("h1", {
					className: "text-2xl font-bold text-primary",
					children: "Occupancy details"
				}), /* @__PURE__ */ (0, V.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Beds in use each night (counted at 22:00) — totals first, then each building, then every room and bed. From the rooms assigned on the slips; beds come from Rooms & Buildings."
				})] }), /* @__PURE__ */ (0, V.jsxs)("div", {
					className: "flex flex-wrap items-end gap-3",
					children: [
						/* @__PURE__ */ (0, V.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, V.jsx)(g, {
								htmlFor: "ocFrom",
								children: "From"
							}), /* @__PURE__ */ (0, V.jsx)(C, {
								id: "ocFrom",
								type: "date",
								value: P,
								onChange: (e) => F(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, V.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, V.jsx)(g, {
								htmlFor: "ocTo",
								children: "To"
							}), /* @__PURE__ */ (0, V.jsx)(C, {
								id: "ocTo",
								type: "date",
								value: I,
								onChange: (e) => L(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, V.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, V.jsx)(g, {
								htmlFor: "ocBld",
								children: "Building"
							}), /* @__PURE__ */ (0, V.jsxs)(f, {
								value: R,
								onValueChange: z,
								children: [/* @__PURE__ */ (0, V.jsx)(l, {
									id: "ocBld",
									className: "min-w-44",
									children: /* @__PURE__ */ (0, V.jsx)(c, {})
								}), /* @__PURE__ */ (0, V.jsxs)(u, { children: [/* @__PURE__ */ (0, V.jsx)(d, {
									value: "all",
									children: "All buildings"
								}), X.map((e) => /* @__PURE__ */ (0, V.jsx)(d, {
									value: e.name,
									children: e.name
								}, e.name))] })]
							})]
						}),
						/* @__PURE__ */ (0, V.jsx)("div", {
							className: "flex flex-wrap gap-1.5",
							children: se.map(([e, t, n]) => /* @__PURE__ */ (0, V.jsx)(v, {
								variant: "outline",
								size: "sm",
								onClick: () => {
									F(E(N, t)), L(E(N, n));
								},
								children: e
							}, e))
						}),
						/* @__PURE__ */ (0, V.jsxs)(v, {
							onClick: () => {
								X.length ? (q(R === "all" ? "" : R), G(!0)) : alert("No buildings in Rooms & Buildings for this site.");
							},
							children: [/* @__PURE__ */ (0, V.jsx)(_, { className: "size-4" }), "Print occupancy"]
						}),
						/* @__PURE__ */ (0, V.jsxs)(v, {
							variant: "outline",
							title: "Each date in the period: which rooms are empty, with a total",
							disabled: !J.data,
							onClick: () => $("date"),
							children: [/* @__PURE__ */ (0, V.jsx)(_, { className: "size-4" }), "Vacancy — date wise"]
						}),
						/* @__PURE__ */ (0, V.jsxs)(v, {
							variant: "outline",
							title: "Each room: on which dates of the period it is empty, with a total",
							disabled: !J.data,
							onClick: () => $("room"),
							children: [/* @__PURE__ */ (0, V.jsx)(_, { className: "size-4" }), "Vacancy — room wise"]
						})
					]
				})]
			}),
			!Z && /* @__PURE__ */ (0, V.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Loading…"
			}),
			Z && (() => {
				let { days: e, blds: t, total: n } = Z, r = e.length, i = T(n.used), a = T(n.capN), o = n.used.map((e, t) => D(e, n.capN[t])), s = o.indexOf(Math.max(...o)), c = o.indexOf(Math.min(...o)), l = Math.round((a - i) / r), u = Math.round(T(n.unroomed) / r), d = t.flatMap((e) => e.rooms.filter((e) => !e.off)), f = Math.round(T(e.map((e, t) => d.filter((t) => !t.until || (/* @__PURE__ */ new Date(`${e}T22:00`)).getTime() < t.until).length - n.roomsUsed[t])) / r), p = [
					[
						"Average occupancy",
						`${D(i, a)}%`,
						`${H(e[0])} → ${H(e[r - 1])} · ${r} night${r === 1 ? "" : "s"}`,
						"big"
					],
					[
						"Beds",
						n.cap,
						`${d.length} rooms · ${t.length} building${t.length === 1 ? "" : "s"}`
					],
					[
						"Beds in use per night",
						Math.round(i / r),
						`average · ${l} empty`
					],
					[
						"Busiest night",
						`${o[s] || 0}%`,
						`${U(e[s])} ${H(e[s])} · ${n.used[s]} beds`
					],
					[
						"Quietest night",
						`${o[c] || 0}%`,
						`${U(e[c])} ${H(e[c])} · ${n.used[c]} beds`
					],
					[
						"Bed-nights",
						i,
						`used of ${a}`
					],
					[
						"Empty rooms per night",
						f,
						"average"
					],
					...u ? [[
						"Guests without rooms",
						u,
						"per night, average — not in the %",
						"warn"
					]] : []
				], m = /* @__PURE__ */ (0, V.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, V.jsx)("th", {
						className: "sticky left-0 z-10 bg-card p-1.5 text-left",
						children: "Building"
					}),
					e.map((e) => /* @__PURE__ */ (0, V.jsxs)("th", {
						className: "bg-secondary p-1.5 leading-tight",
						children: [/* @__PURE__ */ (0, V.jsx)("span", {
							className: "block text-[10px] font-medium text-muted-foreground",
							children: U(e)
						}), H(e)]
					}, e)),
					/* @__PURE__ */ (0, V.jsx)("th", {
						className: "border-l-2 border-gold bg-secondary p-1.5",
						children: "Avg"
					})
				] }), h = (t, n, r, i, a) => /* @__PURE__ */ (0, V.jsxs)("tr", {
					className: w(a && "border-b-2 border-gold"),
					children: [
						/* @__PURE__ */ (0, V.jsxs)("th", {
							className: "sticky left-0 z-10 bg-card p-1.5 text-left",
							children: [t, /* @__PURE__ */ (0, V.jsxs)("small", {
								className: "block text-[10px] font-medium text-muted-foreground",
								children: [Math.max(...n), " beds"]
							})]
						}),
						r.map((r, a) => {
							let o = n[a], s = D(r, o);
							return /* @__PURE__ */ (0, V.jsxs)("td", {
								style: W(s),
								className: "border p-1.5 text-center",
								title: `${t} ${H(e[a])}: ${r} of ${o} beds${i[a] ? ` · ${i[a]} guests without rooms` : ""}`,
								children: [
									s,
									"%",
									i[a] ? /* @__PURE__ */ (0, V.jsx)("sup", {
										className: "font-extrabold text-warn",
										children: "+"
									}) : null
								]
							}, a);
						}),
						/* @__PURE__ */ (0, V.jsxs)("td", {
							style: W(D(T(r), T(n))),
							className: "border border-l-2 border-gold p-1.5 text-center",
							children: [D(T(r), T(n)), "%"]
						})
					]
				}, t);
				return /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [
					/* @__PURE__ */ (0, V.jsx)("section", {
						className: "grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8",
						children: p.map(([e, t, n, r]) => /* @__PURE__ */ (0, V.jsxs)("div", {
							className: w("grid gap-0.5 rounded-xl border bg-card p-3", r === "big" && "col-span-2 border-gold/60 bg-accent/40", r === "warn" && "border-warn/50 bg-warn-soft"),
							children: [
								/* @__PURE__ */ (0, V.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: e
								}),
								/* @__PURE__ */ (0, V.jsx)("b", {
									className: "text-2xl",
									children: t
								}),
								/* @__PURE__ */ (0, V.jsx)("small", {
									className: "text-xs text-muted-foreground",
									children: n
								})
							]
						}, e))
					}),
					/* @__PURE__ */ (0, V.jsxs)(S, { children: [/* @__PURE__ */ (0, V.jsx)(x, { children: /* @__PURE__ */ (0, V.jsxs)(y, {
						className: "text-base",
						children: ["Buildings — period averages ", /* @__PURE__ */ (0, V.jsx)("span", {
							className: "ml-1 text-xs font-normal text-muted-foreground",
							children: "average and busiest night per building over the period"
						})]
					}) }), /* @__PURE__ */ (0, V.jsx)(b, {
						className: "grid gap-3",
						children: t.length ? t.map((t) => {
							let n = t.used.map((e, n) => D(e, t.capN[n])), i = D(T(t.used), T(t.capN)), a = Math.max(...n), o = n.indexOf(a);
							return /* @__PURE__ */ (0, V.jsxs)("div", {
								className: "grid gap-1 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center sm:gap-3",
								children: [/* @__PURE__ */ (0, V.jsx)("b", { children: t.name }), /* @__PURE__ */ (0, V.jsxs)("div", {
									className: "grid gap-1",
									children: [/* @__PURE__ */ (0, V.jsxs)("span", {
										className: "relative h-3.5 rounded-full bg-muted",
										children: [/* @__PURE__ */ (0, V.jsx)("i", {
											className: "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold to-primary",
											style: { width: `${Math.min(100, i)}%` }
										}), /* @__PURE__ */ (0, V.jsx)("em", {
											title: "busiest night",
											className: "absolute -inset-y-0.5 w-[3px] rounded bg-destructive",
											style: { left: `${Math.min(100, a)}%` }
										})]
									}), /* @__PURE__ */ (0, V.jsxs)("span", {
										className: "text-xs text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, V.jsxs)("b", {
												className: "text-foreground",
												children: [i, "%"]
											}),
											" avg · ",
											a,
											"% busiest (",
											H(e[o]),
											") · ",
											t.cap,
											" beds · ",
											Math.round(T(t.used) / r),
											" in use per night",
											T(t.unroomed) ? ` · ${Math.round(T(t.unroomed) / r)} without rooms` : ""
										]
									})]
								})]
							}, t.name);
						}) : /* @__PURE__ */ (0, V.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No buildings with rooms — add them in Rooms & Buildings."
						})
					})] }),
					/* @__PURE__ */ (0, V.jsxs)(S, {
						className: "gap-0 py-0",
						children: [/* @__PURE__ */ (0, V.jsx)(x, {
							className: "border-b py-3",
							children: /* @__PURE__ */ (0, V.jsxs)(y, {
								className: "text-base",
								children: ["Night by night ", /* @__PURE__ */ (0, V.jsx)("span", {
									className: "ml-1 text-xs font-normal text-muted-foreground",
									children: "% of beds in use · hover a cell for beds · the first row is all buildings, the last column the average"
								})]
							})
						}), /* @__PURE__ */ (0, V.jsxs)(b, {
							className: "overflow-x-auto p-0",
							children: [/* @__PURE__ */ (0, V.jsxs)("table", {
								className: "w-max min-w-full text-xs",
								children: [/* @__PURE__ */ (0, V.jsx)("thead", { children: m }), /* @__PURE__ */ (0, V.jsxs)("tbody", { children: [t.length > 1 && h("All buildings", n.capN, n.used, n.unroomed, !0), t.map((e) => h(e.name, e.capN, e.used, e.unroomed))] })]
							}), T(n.unroomed) > 0 && /* @__PURE__ */ (0, V.jsxs)("p", {
								className: "p-3 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, V.jsx)("sup", { children: "+" }), " some guests that night have a building but no rooms yet (hover for how many) — they are not in the %."]
							})]
						})]
					}),
					/* @__PURE__ */ (0, V.jsxs)(S, { children: [/* @__PURE__ */ (0, V.jsx)(x, { children: /* @__PURE__ */ (0, V.jsxs)(y, {
						className: "text-base",
						children: ["Rooms and beds ", /* @__PURE__ */ (0, V.jsx)("span", {
							className: "ml-1 text-xs font-normal text-muted-foreground",
							children: "open a building to load its rooms · each dot is a bed: filled = in use that night · red = more guests than beds · avg = share of the room's bed-nights used"
						})]
					}) }), /* @__PURE__ */ (0, V.jsx)(b, {
						className: "grid gap-2",
						children: t.map((t) => /* @__PURE__ */ (0, V.jsxs)("details", {
							className: "rounded-lg border",
							onToggle: (e) => {
								let n = e.currentTarget.open;
								ue((e) => {
									let r = new Set(e);
									return n ? r.add(t.name) : r.delete(t.name), r;
								});
							},
							children: [/* @__PURE__ */ (0, V.jsxs)("summary", {
								className: "cursor-pointer p-2.5 text-sm",
								children: [
									/* @__PURE__ */ (0, V.jsx)("b", { children: t.name }),
									" · ",
									t.rooms.length,
									" rooms · ",
									t.cap,
									" beds · ",
									/* @__PURE__ */ (0, V.jsxs)("b", { children: [D(T(t.used), T(t.capN)), "%"] }),
									" average"
								]
							}), le.has(t.name) && /* @__PURE__ */ (0, V.jsx)(ce, {
								name: t.name,
								days: e,
								load: de
							})]
						}, t.name))
					})] }),
					/* @__PURE__ */ (0, V.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							r,
							" night",
							r === 1 ? "" : "s",
							" · counted at 22:00",
							Z.cut ? " · only the first 62 nights are shown" : ""
						]
					})
				] });
			})(),
			/* @__PURE__ */ (0, V.jsx)(te, {
				open: B,
				onOpenChange: G,
				children: /* @__PURE__ */ (0, V.jsxs)(h, {
					className: "max-w-[calc(100%-1rem)] sm:max-w-sm",
					children: [
						/* @__PURE__ */ (0, V.jsx)(p, { children: /* @__PURE__ */ (0, V.jsx)(ee, { children: "Print rooms allocation" }) }),
						/* @__PURE__ */ (0, V.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "One building at a time, for the period above."
						}),
						/* @__PURE__ */ (0, V.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, V.jsx)(g, {
								htmlFor: "ocPrintBld",
								children: "Building"
							}), /* @__PURE__ */ (0, V.jsxs)(f, {
								value: K,
								onValueChange: q,
								children: [/* @__PURE__ */ (0, V.jsx)(l, {
									id: "ocPrintBld",
									className: "w-full",
									children: /* @__PURE__ */ (0, V.jsx)(c, { placeholder: "Choose a building…" })
								}), /* @__PURE__ */ (0, V.jsx)(u, { children: X.map((e) => /* @__PURE__ */ (0, V.jsx)(d, {
									value: e.name,
									children: e.name
								}, e.name)) })]
							})]
						}),
						/* @__PURE__ */ (0, V.jsxs)(m, {
							className: "gap-2",
							children: [/* @__PURE__ */ (0, V.jsx)(v, {
								variant: "outline",
								onClick: () => G(!1),
								children: "Cancel"
							}), /* @__PURE__ */ (0, V.jsxs)(v, {
								disabled: !K,
								onClick: () => void fe(),
								children: [/* @__PURE__ */ (0, V.jsx)(_, { className: "size-4" }), "Open & print"]
							})]
						})
					]
				})
			})
		]
	});
}
export { K as default };
