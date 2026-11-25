import { f as e, h as t, i as n, n as r, p as i, u as a } from "./PmsContext-BVMd13Oi.js";
import { a as o, i as s, n as c, r as l, t as ee } from "./select-VcH2xuqJ.js";
import { t as te } from "./checkbox-C3tIiLfF.js";
import { t as u } from "./label-CMEyi--P.js";
import { t as ne } from "./printer-_t2PY0au.js";
import { t as d } from "./button-BGWa3SLr.js";
import { t as f } from "./input-DSBk_UeU.js";
import { t as p } from "./utils-b7UP9Cmo.js";
import { t as re } from "./ConfirmDialog-GfriOiUy.js";
import { t as ie } from "./useSlips-DUKbzGma.js";
import { n as m, t as h } from "./format-bJxoSInv.js";
// src/pages/key-cards/key-cards.css
var g = /* @__PURE__ */ t(i(), 1), _ = [{
	id: "portrait",
	label: "A4 portrait"
}, {
	id: "landscape",
	label: "A4 landscape"
}], v = 8, y = (e) => String(e ?? "").replace(/[&<>"']/g, (e) => ({
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
})[e]);
function b(e) {
	let t = [];
	for (let n = 0; n < e.length; n += v) t.push(e.slice(n, n + v));
	return t.length && t[t.length - 1].length !== v || t.push([]), t;
}
function x(e, t) {
	let n = b(e.rooms), r = n.map((t, r) => {
		let i = r === n.length - 1, a = v - t.length - +!!i;
		return `<tr class="rn">${t.map(([e]) => `<td>${y(e)}</td>`).join("")}${((e) => e > 0 ? `<td class="gap" colspan="${e}" rowspan="2"></td>` : "")(a)}${i ? `<td class="bw">${y(e.busWord)}</td>` : ""}</tr>
            <tr class="rc">${t.map(([, e]) => `<td>${e}</td>`).join("")}${i ? `<td class="bn">${y(e.busNo)}</td>` : ""}</tr>`;
	}).join("");
	return `<table class="kc"><colgroup>${"<col>".repeat(v)}</colgroup><tbody>
        <tr class="top"><td colspan="4">Departure Date -</td><td colspan="4">${y(t)}</td></tr>
        <tr class="sh"><td colspan="2">SH NO.</td><td colspan="2">${y(e.sh)}</td><td colspan="2">Group Leader</td><td colspan="2" class="ld">${y(e.leader) || "-"}${e.phone ? `<br>${y(e.phone)}` : ""}</td></tr>
        <tr class="gr"><td colspan="6">${y(e.group) || "-"}${e.part ? " <small>(these rooms only)</small>" : ""}</td><td colspan="2">${e.pax}</td></tr>
        ${e.transporter ? `<tr class="tp"><td colspan="2">Transporter</td><td colspan="6">${y(e.transporter)}</td></tr>` : ""}
        ${r}</tbody></table>`;
}
function ae({ day: e, layout: t, site: n, cards: r }) {
	let i = t === "landscape";
	return `<!doctype html><html><head><meta charset="utf-8"><title>Room key cards ${y(e)} — ${y(n)}</title><style>
        @page { size: A4 ${i ? "landscape" : "portrait"}; margin: 8mm; }
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #fff; color: #000; font: 700 12pt/1.2 "Times New Roman", Times, serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        table.kc { width: 100%; border-collapse: collapse; table-layout: fixed; margin: 0 0 4.5mm; break-inside: avoid; page-break-inside: avoid; }
        .kc td { border: 1px solid #000; padding: .6mm 1mm; text-align: center; vertical-align: middle; overflow-wrap: anywhere; }
        tr.top td { background: #bfbfbf; font-size: 13pt; } tr.sh td { background: #d9d9d9; font-size: 13pt; } tr.sh td.ld { background: #f2f2f2; font-size: 11pt; }
        tr.gr td { background: #f2f2f2; font-size: 13pt; } small { font-size: 9pt; font-weight: 400; }
        tr.tp td { background: #fff; font-size: 11pt; }
        tr.rn td { font-size: 17pt; } tr.rc td { font-size: 12pt; }
        td.gap { background: #fff; }
        tr.rn td.bw { background: #d9d9d9; font-size: 15pt; } tr.rc td.bn { background: #d9d9d9; font-size: 18pt; }
        p.none { font: 400 11pt Arial, sans-serif; }
        @media screen { body { padding: 8mm; background: #eee; } .page { background: #fff; padding: 8mm; max-width: ${i ? 297 : 210}mm; margin: 0 auto; } }
    </style></head><body><div class="page">${r.map((t) => x(t, e)).join("") || "<p class=\"none\">No group leaves on this day.</p>"}</div>
    <script>window.addEventListener('load', () => setTimeout(() => window.print(), 250));<\/script></body></html>`;
}
// src/pages/key-cards/KeyCardsPage.tsx
var S = e(), C = (e) => String(e).padStart(2, "0"), w = (e) => `${e.getFullYear()}-${C(e.getMonth() + 1)}-${C(e.getDate())}`, oe = (e, t) => {
	let n = /* @__PURE__ */ new Date(`${e}T12:00`);
	return n.setDate(n.getDate() + t), w(n);
}, se = (e) => new Date(e).toLocaleTimeString(void 0, {
	hour: "2-digit",
	minute: "2-digit"
}), T = 99, E = (e, t) => `${e}|${t}`;
function ce() {
	let { cloud: e, stay: t, transport: i, ums: v } = r(), y = i, b = n(), { site: x, siteId: C } = a(), { ask: ce, dialog: le } = re(), D = e.canWrite(C), O = C === "makkah", k = ie(3e4), [A, j] = (0, g.useState)(w(/* @__PURE__ */ new Date())), [M, N] = (0, g.useState)("all"), [P, ue] = (0, g.useState)(""), [de, fe] = (0, g.useState)(!1), [pe, me] = (0, g.useState)(() => {
		try {
			let e = localStorage.getItem("pms_kc_paper");
			return _.some((t) => t.id === e) ? e : "portrait";
		} catch {
			return "portrait";
		}
	}), he = (e) => {
		me(e);
		try {
			localStorage.setItem("pms_kc_paper", e);
		} catch {}
	}, [F, I] = (0, g.useState)(/* @__PURE__ */ new Map()), [L, ge] = (0, g.useState)({ text: "" }), R = (0, g.useRef)(/* @__PURE__ */ new Map()), z = (0, g.useRef)(null), _e = (0, g.useRef)(F);
	_e.current = F;
	let B = (e, t = !1) => {
		ge({
			text: e,
			bad: t
		}), e && !t && setTimeout(() => ge((t) => t.text === e ? { text: "" } : t), 2500);
	}, V = (0, g.useMemo)(() => {
		let e = [];
		for (let n of k.data ?? []) for (let r of t.departuresOf(n)) {
			if (w(new Date(r.at)) !== A) continue;
			let i = /* @__PURE__ */ new Map();
			for (let e of r.rooms) {
				let t = String(e.room_no || "").trim();
				t && i.set(t, (i.get(t) || 0) + (Number(e.beds) || 0));
			}
			let a = [...i].filter(([, e]) => e > 0).sort((e, t) => m(e[0], t[0]));
			if (!a.length) continue;
			let o = Number(n.total) || 0, s = a.reduce((e, [, t]) => e + t, 0), c = t.isDelayed(n) ? Math.max(0, t.paxAt(n, r.at - 1).total - t.paxAt(n, r.at).total) : o;
			e.push({
				slip: n,
				at: r.at,
				part: t.isDelayed(n) && !r.last,
				rooms: a,
				pax: c || s
			});
		}
		return e.sort((e, t) => e.at - t.at || m(e.slip.tour_name || "", t.slip.tour_name || "") || m(e.slip.sh_no, t.slip.sh_no));
	}, [
		k.data,
		A,
		t
	]), [ve, ye] = (0, g.useState)(/* @__PURE__ */ new Map()), [be, xe] = (0, g.useState)(/* @__PURE__ */ new Map());
	(0, g.useEffect)(() => {
		let e = !0;
		return (async () => {
			try {
				let t = await b(y.loadDay(C, A)), n = y.resolve(t.rows || []), r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
				for (let e of t.rows || []) {
					let t = n.get(e.key), a = v.baseSh(e.ref);
					if (!a || !t || t.bus == null) continue;
					let o = String(t.route || "").split("-").slice(1).join("-") || t.route || "", s = `${t.vehicle === "car" || t.vehicle === "other" ? y.vehicleNo(t.bus, t.vehicle, t.vlabel) : `Bus ${t.bus}`}${e.part ? ` (${e.part})` : ""}`, c = r.get(a) ?? r.set(a, []).get(a);
					c.some((e) => e.veh === s && e.to === o) || c.push({
						veh: s,
						to: o
					});
					let l = i.get(a) ?? i.set(a, {
						word: y.vehicleWord(t.vehicle, t.vlabel),
						nos: [],
						transporter: ""
					}).get(a);
					l.transporter = l.transporter || String(e.transporter || t.parent?.transporter || "").trim(), l.nos.includes(String(t.bus)) || l.nos.push(String(t.bus));
				}
				e && (ye(r), xe(i));
			} catch {
				e && (ye(/* @__PURE__ */ new Map()), xe(/* @__PURE__ */ new Map()));
			}
		})(), () => {
			e = !1;
		};
	}, [A, C]);
	let Se = (e, t) => C === "medina" && !/ZIYARAT/i.test(t) && String(e.to_place || "").trim() ? String(e.to_place).trim().toUpperCase() : t, Ce = (e) => (ve.get(v.baseSh(e.sh_no)) || []).map((t) => {
		let n = Se(e, t.to);
		return `${t.veh}${n ? ` · ${n}` : ""}`;
	}).filter((e, t, n) => n.indexOf(e) === t).join(", "), H = (e) => be.get(v.baseSh(e.sh_no)), U = (e) => String(e.ums?.glPhone || e.ums?.phone || "").trim(), we = (e) => Number(H(e.slip)?.nos[0]) || 1e9, W = (e, t) => Math.min(T, F.get(E(e.slip.id, t)) || 0), G = (e) => ({
		issued: e.rooms.reduce((e, [, t]) => e + t, 0),
		got: e.rooms.reduce((t, [n]) => t + W(e, n), 0),
		out: e.rooms.reduce((t, [n, r]) => t + Math.max(0, r - W(e, n)), 0)
	}), K = (0, g.useCallback)(async () => {
		try {
			let t = await b(e.request("GET", `/api/key-cards?site=${C}&day=${A}`)), n = /* @__PURE__ */ new Map();
			for (let e of t.rows) n.set(E(e.slip_id, e.room_no), e.returned);
			for (let [e, t] of R.current) n.set(e, t.returned);
			I(n);
		} catch (t) {
			B(t instanceof e.UserError ? t.message : "Could not load the cards.", !0);
		}
	}, [A, C]);
	(0, g.useEffect)(() => {
		K();
		let e = setInterval(() => {
			document.visibilityState === "visible" && !R.current.size && K();
		}, 3e4);
		return () => clearInterval(e);
	}, [K]);
	let q = (0, g.useCallback)(async () => {
		if (z.current && clearTimeout(z.current), !R.current.size) return;
		let t = [...R.current.values()];
		for (let n = 0; n < t.length; n += 40) {
			let r = t.slice(n, n + 40);
			try {
				await b(e.request("PUT", "/api/key-cards", {
					site: C,
					day: A,
					items: r
				}));
				for (let e of r) {
					let t = E(e.slip_id, e.room_no);
					R.current.get(t)?.returned === e.returned && R.current.delete(t);
				}
			} catch (t) {
				B(t instanceof e.UserError ? t.message : "Could not save the cards — check the connection.", !0);
				return;
			}
		}
	}, [A, C]);
	(0, g.useEffect)(() => {
		let e = () => {
			document.visibilityState === "hidden" && q();
		};
		return document.addEventListener("visibilitychange", e), () => {
			document.removeEventListener("visibilitychange", e), q();
		};
	}, [q]);
	let J = (e, t, n) => {
		let r = Math.max(0, Math.min(T, Math.round(Number(n) || 0)));
		I((n) => new Map(n).set(E(e, t), r)), R.current.set(E(e, t), {
			slip_id: Number(e),
			room_no: t,
			returned: r
		}), z.current && clearTimeout(z.current), z.current = setTimeout(() => void q(), 500);
	}, Te = (0, g.useMemo)(() => [...new Set(V.map((e) => e.slip.building || "").filter(Boolean))].sort(m), [V]), Y = V.filter((e) => (M === "all" || (e.slip.building || "") === M) && (!P.trim() || [
		e.slip.tour_name,
		e.slip.group_leader,
		e.slip.sh_no,
		...e.rooms.map((e) => e[0])
	].some((e) => String(e || "").toLowerCase().includes(P.trim().toLowerCase()))) && (!de || G(e).out > 0)).sort((e, t) => we(e) - we(t) || e.at - t.at), X = Y.map(G), Z = X.reduce((e, t) => e + t.issued, 0), Q = X.reduce((e, t) => e + t.got, 0), $ = X.reduce((e, t) => e + t.out, 0), Ee = X.filter((e) => e.issued && !e.out).length, De = [
		[
			"Cards given",
			Z,
			`${Y.length} group${Y.length === 1 ? "" : "s"} leaving`,
			""
		],
		[
			"Cards back",
			Q,
			Z ? `${Math.round(Q / Z * 100)}% collected` : "",
			Q ? "ok" : ""
		],
		[
			"Still out",
			$,
			$ ? "to collect" : "all collected",
			$ ? "bad" : "ok"
		],
		[
			"Groups complete",
			`${Ee} / ${Y.length}`,
			"",
			Ee === Y.length && Y.length ? "ok" : ""
		]
	];
	async function Oe(e) {
		await ce({
			title: "Clear cards?",
			confirmLabel: "Clear",
			body: `Clear the cards recorded back for ${e.slip.tour_name || "this group"}?`
		}) && e.rooms.forEach(([t]) => J(e.slip.id, t, 0));
	}
	return /* @__PURE__ */ (0, S.jsxs)("div", {
		className: "kc-print mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4 print:p-0",
		children: [
			/* @__PURE__ */ (0, S.jsxs)("header", {
				className: "grid gap-3 print:hidden",
				children: [/* @__PURE__ */ (0, S.jsxs)("div", { children: [/* @__PURE__ */ (0, S.jsx)("h1", {
					className: "text-2xl font-bold text-primary",
					children: "Room Key Cards"
				}), /* @__PURE__ */ (0, S.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Cards given to the rooms of every group leaving that day (one card per assigned bed). Record how many came back."
				})] }), /* @__PURE__ */ (0, S.jsxs)("div", {
					className: "flex flex-wrap items-end gap-3",
					children: [
						/* @__PURE__ */ (0, S.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, S.jsx)(u, {
								htmlFor: "kcDay",
								children: "Departure day"
							}), /* @__PURE__ */ (0, S.jsx)(f, {
								id: "kcDay",
								type: "date",
								value: A,
								onChange: (e) => {
									q(), j(e.target.value || w(/* @__PURE__ */ new Date())), N("all");
								}
							})]
						}),
						/* @__PURE__ */ (0, S.jsx)("div", {
							className: "flex gap-1.5",
							children: [
								["Yesterday", -1],
								["Today", 0],
								["Tomorrow", 1]
							].map(([e, t]) => /* @__PURE__ */ (0, S.jsx)(d, {
								variant: "outline",
								onClick: () => {
									q(), j(oe(w(/* @__PURE__ */ new Date()), t)), N("all");
								},
								children: e
							}, e))
						}),
						/* @__PURE__ */ (0, S.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, S.jsx)(u, {
								htmlFor: "kcBld",
								children: "Building"
							}), /* @__PURE__ */ (0, S.jsxs)(ee, {
								value: M,
								onValueChange: N,
								children: [/* @__PURE__ */ (0, S.jsx)(s, {
									id: "kcBld",
									className: "min-w-40",
									children: /* @__PURE__ */ (0, S.jsx)(o, {})
								}), /* @__PURE__ */ (0, S.jsxs)(c, { children: [/* @__PURE__ */ (0, S.jsx)(l, {
									value: "all",
									children: "All buildings"
								}), Te.map((e) => /* @__PURE__ */ (0, S.jsx)(l, {
									value: e,
									children: e
								}, e))] })]
							})]
						}),
						/* @__PURE__ */ (0, S.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, S.jsx)(u, {
								htmlFor: "kcFind",
								children: "Find"
							}), /* @__PURE__ */ (0, S.jsx)(f, {
								id: "kcFind",
								type: "search",
								placeholder: "Group, leader, SH, room",
								autoComplete: "off",
								value: P,
								onChange: (e) => ue(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, S.jsxs)("div", {
							className: "flex items-center gap-2 pb-2",
							children: [/* @__PURE__ */ (0, S.jsx)(te, {
								id: "kcOut",
								checked: de,
								onCheckedChange: (e) => fe(e === !0)
							}), /* @__PURE__ */ (0, S.jsx)(u, {
								htmlFor: "kcOut",
								children: "Only cards still out"
							})]
						}),
						/* @__PURE__ */ (0, S.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, S.jsx)(u, {
								htmlFor: "kcPer",
								children: "Paper"
							}), /* @__PURE__ */ (0, S.jsxs)(ee, {
								value: pe,
								onValueChange: he,
								children: [/* @__PURE__ */ (0, S.jsx)(s, {
									id: "kcPer",
									className: "min-w-44",
									children: /* @__PURE__ */ (0, S.jsx)(o, {})
								}), /* @__PURE__ */ (0, S.jsx)(c, { children: _.map((e) => /* @__PURE__ */ (0, S.jsx)(l, {
									value: e.id,
									children: e.label
								}, e.id)) })]
							})]
						}),
						/* @__PURE__ */ (0, S.jsxs)(d, {
							disabled: !Y.length,
							onClick: () => {
								let e = window.open("", "_blank");
								if (!e) {
									B("The browser blocked the print page — allow pop-ups for this site and try again.", !0);
									return;
								}
								e.document.open();
								let t = Y.map((e) => ({
									group: e.slip.tour_name || "",
									leader: String(e.slip.group_leader || "").trim(),
									phone: U(e.slip),
									transporter: H(e.slip)?.transporter || "",
									pax: e.pax,
									sh: String(e.slip.sh_no || "—"),
									part: e.part,
									rooms: e.rooms,
									busWord: H(e.slip)?.word || "BUS",
									busNo: (H(e.slip)?.nos || []).join(", ")
								}));
								e.document.write(ae({
									day: h(A).replace(/\//g, "-"),
									layout: pe,
									site: x.label,
									cards: t
								})), e.document.close();
							},
							children: [/* @__PURE__ */ (0, S.jsx)(ne, { className: "size-4" }), "Print"]
						})
					]
				})]
			}),
			!D && /* @__PURE__ */ (0, S.jsxs)("p", {
				className: "text-sm font-semibold text-muted-foreground print:hidden",
				children: [
					"View only — this login cannot record cards for ",
					x.label,
					"."
				]
			}),
			L.text && /* @__PURE__ */ (0, S.jsx)("p", {
				role: "status",
				className: p("text-sm font-semibold print:hidden", L.bad ? "text-destructive" : "text-ok"),
				children: L.text
			}),
			/* @__PURE__ */ (0, S.jsx)("section", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-4 print:hidden",
				children: De.map(([e, t, n, r]) => /* @__PURE__ */ (0, S.jsxs)("div", {
					className: p("grid gap-0.5 rounded-xl border bg-card p-3", r === "ok" && "border-ok/40", r === "bad" && "border-destructive/40"),
					children: [
						/* @__PURE__ */ (0, S.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: e
						}),
						/* @__PURE__ */ (0, S.jsx)("b", {
							className: p("text-2xl", r === "ok" && "text-ok", r === "bad" && "text-destructive"),
							children: t
						}),
						/* @__PURE__ */ (0, S.jsx)("small", {
							className: "text-xs text-muted-foreground",
							children: n
						})
					]
				}, e))
			}),
			/* @__PURE__ */ (0, S.jsx)("section", {
				className: p("grid items-start gap-3 print:grid-cols-2 print:gap-2", O ? "grid-cols-[repeat(auto-fill,minmax(min(100%,560px),1fr))]" : "sm:grid-cols-2 xl:grid-cols-3"),
				children: Y.length ? Y.map((e) => {
					let t = e.slip, n = G(e), r = n.out === 0 && n.issued > 0;
					return /* @__PURE__ */ (0, S.jsxs)("article", {
						className: p("break-inside-avoid overflow-hidden rounded border-[1.5px] border-foreground bg-white", r && "border-ok shadow-[0_0_0_2px_rgba(31,111,67,.25)] print:shadow-none"),
						children: [
							/* @__PURE__ */ (0, S.jsxs)("div", {
								className: p("border-b bg-muted px-3 py-1 text-xs font-bold", O && "border-b-[1.5px] border-foreground bg-white py-1.5 text-center text-[15px] font-extrabold"),
								children: ["Departure Date: ", h(A)]
							}),
							/* @__PURE__ */ (0, S.jsxs)("div", {
								className: p("px-3 py-2 font-bold", O && "border-b-[1.5px] border-foreground py-1.5 text-center text-[15px]"),
								children: [
									t.tour_name || "—",
									t.group_leader ? ` (${t.group_leader})` : "",
									" ",
									e.pax,
									"pax",
									Ce(t) && /* @__PURE__ */ (0, S.jsxs)("span", {
										className: "my-1 inline-block max-w-full rounded border border-foreground/40 bg-accent/40 px-1.5 text-sm leading-snug",
										children: ["🚌 ", Ce(t)]
									}),
									(U(t) || H(t)?.transporter) && /* @__PURE__ */ (0, S.jsxs)("small", {
										className: "block text-xs font-normal",
										children: [
											U(t) && /* @__PURE__ */ (0, S.jsxs)(S.Fragment, { children: ["📞 GL ", U(t)] }),
											U(t) && H(t)?.transporter ? " · " : "",
											H(t)?.transporter && /* @__PURE__ */ (0, S.jsxs)(S.Fragment, { children: ["Transporter: ", H(t).transporter] })
										]
									}),
									/* @__PURE__ */ (0, S.jsxs)("small", {
										className: "block text-xs font-normal text-muted-foreground",
										children: [
											"SH ",
											t.sh_no || "—",
											" · ",
											t.building || "no building",
											" · leaves ",
											se(e.at),
											e.part ? " · only these rooms leave today" : ""
										]
									})
								]
							}),
							O ? /* @__PURE__ */ (0, S.jsx)("div", {
								className: "grid grid-cols-4 sm:grid-cols-8",
								children: e.rooms.map(([n, r]) => {
									let i = W(e, n), a = i === 0 ? "" : i > r ? "bg-bad-soft" : i === r ? "bg-ok-soft" : "bg-warn-soft", o = i === 0 ? "" : i > r ? "text-destructive" : i === r ? "text-ok" : "text-warn";
									return /* @__PURE__ */ (0, S.jsxs)("div", {
										className: p("min-w-0 border-b border-r border-[#c9bda3] px-0.5 pb-1.5 pt-1 text-center", a),
										children: [
											/* @__PURE__ */ (0, S.jsx)("div", {
												className: "text-base font-extrabold",
												children: n
											}),
											/* @__PURE__ */ (0, S.jsx)("div", {
												className: "mt-0.5 border-t border-[#c9bda3] pt-0.5 text-base",
												title: "cards given",
												children: r
											}),
											/* @__PURE__ */ (0, S.jsxs)("div", {
												className: "mt-1 flex items-center justify-center gap-0.5",
												children: [
													/* @__PURE__ */ (0, S.jsx)("button", {
														type: "button",
														className: "h-[26px] w-6 rounded-md border bg-white p-0 text-[15px] font-extrabold leading-none text-[#7a5410] disabled:opacity-40",
														disabled: !D || i <= 0,
														"aria-label": `One card less in room ${n}`,
														onClick: () => J(t.id, n, i - 1),
														children: "−"
													}),
													/* @__PURE__ */ (0, S.jsx)("b", {
														className: p("min-w-[22px] text-[15px] tabular-nums", o),
														title: "cards back",
														children: i
													}),
													/* @__PURE__ */ (0, S.jsx)("button", {
														type: "button",
														className: "h-[26px] w-6 rounded-md border bg-white p-0 text-[15px] font-extrabold leading-none text-[#7a5410] disabled:opacity-40",
														disabled: !D || i >= T,
														"aria-label": `One card more in room ${n}`,
														onClick: () => J(t.id, n, i + 1),
														children: "+"
													})
												]
											})
										]
									}, n);
								})
							}) : /* @__PURE__ */ (0, S.jsx)("div", {
								className: "grid gap-1 px-3 pb-2",
								children: e.rooms.map(([n, r]) => {
									let i = W(e, n);
									return /* @__PURE__ */ (0, S.jsxs)("label", {
										className: p("flex cursor-pointer items-center gap-2.5 rounded-md border px-2 py-1.5", i === 0 ? "" : i > r ? "bg-bad-soft" : i === r ? "bg-ok-soft" : "bg-warn-soft", !D && "cursor-default"),
										children: [
											/* @__PURE__ */ (0, S.jsx)(te, {
												className: "size-6",
												disabled: !D,
												"aria-label": `Cards of room ${n} back`,
												checked: i >= r || i > 0 && "indeterminate",
												onCheckedChange: () => J(t.id, n, i >= r ? 0 : r)
											}),
											/* @__PURE__ */ (0, S.jsx)("span", {
												className: "w-16 font-bold",
												children: n
											}),
											/* @__PURE__ */ (0, S.jsxs)("span", {
												className: "text-sm text-muted-foreground",
												children: [
													r,
													" card",
													r === 1 ? "" : "s"
												]
											}),
											i > 0 && i !== r && /* @__PURE__ */ (0, S.jsxs)("span", {
												className: "ml-auto text-xs font-semibold",
												children: [i, " back"]
											})
										]
									}, n);
								})
							}),
							/* @__PURE__ */ (0, S.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2 border-t bg-muted/40 px-3 py-2 text-sm",
								children: [
									/* @__PURE__ */ (0, S.jsxs)("span", {
										className: p("whitespace-nowrap font-semibold", r ? "text-ok" : n.got ? "text-warn" : ""),
										children: [
											n.got,
											" / ",
											n.issued,
											" cards back",
											n.out ? ` · ${n.out} still out` : " ✓"
										]
									}),
									/* @__PURE__ */ (0, S.jsx)("span", {
										className: "h-1.5 min-w-16 flex-1 overflow-hidden rounded-full bg-border print:hidden",
										children: /* @__PURE__ */ (0, S.jsx)("i", {
											className: p("block h-full", r ? "bg-ok" : "bg-gold"),
											style: { width: `${n.issued ? Math.min(100, Math.round(n.got / n.issued * 100)) : 0}%` }
										})
									}),
									/* @__PURE__ */ (0, S.jsx)(d, {
										variant: "outline",
										size: "sm",
										className: "print:hidden",
										disabled: !D || !n.out,
										onClick: () => e.rooms.forEach(([e, n]) => J(t.id, e, Math.max(n, F.get(E(t.id, e)) || 0))),
										children: "All back"
									}),
									/* @__PURE__ */ (0, S.jsx)(d, {
										variant: "outline",
										size: "sm",
										className: "print:hidden",
										disabled: !D || !n.got,
										onClick: () => void Oe(e),
										children: "Clear"
									})
								]
							})
						]
					}, `${t.id}-${e.at}`);
				}) : /* @__PURE__ */ (0, S.jsx)("p", {
					className: "col-span-full p-6 text-center text-muted-foreground",
					children: k.isLoading ? "Loading…" : V.length ? "No group matches the filters." : `No group with assigned rooms leaves on ${h(A)}.`
				})
			}),
			le
		]
	});
}
export { ce as default };
