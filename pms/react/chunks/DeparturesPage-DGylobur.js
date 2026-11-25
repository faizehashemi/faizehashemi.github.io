import { a as e, f as t, h as n, i as r, n as i, p as a, r as o, s, u as c } from "./PmsContext-BVMd13Oi.js";
import { t as l } from "./useQuery-BUXPY6q6.js";
import { a as u, i as d, n as ee, r as f, t as te } from "./select-VcH2xuqJ.js";
import { t as p } from "./checkbox-C3tIiLfF.js";
import { t as ne } from "./download-DbAPjole.js";
import { t as re } from "./refresh-cw-D-L_YZdS.js";
import { t as m } from "./button-BGWa3SLr.js";
import { i as h, n as g, r as _, t as v } from "./card-B9_OGomP.js";
import { t as y } from "./input-DSBk_UeU.js";
import { a as b, n as x, o as S, r as C, s as w, t as T } from "./table-DKR1WqRT.js";
import { t as E } from "./utils-b7UP9Cmo.js";
import { t as ie } from "./ConfirmDialog-GfriOiUy.js";
import { t as ae } from "./useSlips-DUKbzGma.js";
import { t as oe } from "./badge-EB7Muw37.js";
import { n as se, t as ce } from "./AllocLog-FIZnZtXK.js";
// src/pages/departures/DeparturesPage.tsx
var D = /* @__PURE__ */ n(a(), 1), O = t(), k = (e) => String(e).padStart(2, "0"), A = (e) => `${e.getFullYear()}-${k(e.getMonth() + 1)}-${k(e.getDate())}`, le = (e) => `${k(e.getHours())}:${k(e.getMinutes())}`, j = (e) => e ? new Date(e).toLocaleString(void 0, {
	weekday: "short",
	day: "2-digit",
	month: "short",
	hour: "2-digit",
	minute: "2-digit"
}) : "—", M = 864e5, N = {
	confirmed: "bg-ok-soft text-ok",
	tentative: "bg-warn-soft text-warn",
	unknown: "bg-bad-soft text-destructive",
	booked: "bg-muted text-muted-foreground",
	left: "bg-muted text-muted-foreground"
}, P = ({ s: e }) => /* @__PURE__ */ (0, O.jsx)("span", {
	className: E("rounded-full px-2 py-0.5 text-xs font-bold", N[e] || "bg-muted"),
	children: e
});
function F() {
	let { rooms: t, stay: n, settings: a, cloud: N } = i(), F = o(), I = r(), ue = e(), { site: de, siteId: L } = c(), { href: fe } = s(), { ask: R, dialog: pe } = ie(), z = !F.readonly, B = ae(6e4), V = l({
		queryKey: ["departures-extra", L],
		queryFn: async () => {
			let [e, n] = await Promise.all([I(t.loadBuildings({ force: !0 })), I(a.loadSettings()).catch(() => null)]);
			return {
				blds: e,
				hold: Number(n?.settings?.delay_hold_days) || a.DEFAULTS.delay_hold_days
			};
		}
	}), H = B.data ?? [], me = V.data?.blds ?? [], he = V.data?.hold ?? a.DEFAULTS.delay_hold_days, ge = (e, n) => t.builderCapacity(me, e, n), _e = (() => {
		let e = /* @__PURE__ */ new Date();
		return e.setDate(e.getDate() + 1), A(e);
	})(), [U, ve] = (0, D.useState)(/* @__PURE__ */ new Set()), [W, ye] = (0, D.useState)(_e), [G, be] = (0, D.useState)("10:00"), [K, xe] = (0, D.useState)("tentative"), [q, Se] = (0, D.useState)({ text: "" }), [Ce, we] = (0, D.useState)(() => {
		let e = /* @__PURE__ */ new Date();
		return `${e.getFullYear()}-${k(e.getMonth() + 1)}-01`;
	}), [Te, Ee] = (0, D.useState)(A(/* @__PURE__ */ new Date())), [De, Oe] = (0, D.useState)(!1), J = (e, t = !1) => Se({
		text: e,
		bad: t
	});
	(0, D.useEffect)(() => {
		let e = () => {
			B.refetch();
		};
		return window.addEventListener("pms:alloc-undone", e), () => window.removeEventListener("pms:alloc-undone", e);
	}, []);
	let Y = Date.now(), X = (0, D.useMemo)(() => {
		let e = H.filter((e) => n.isDelayed(e) && n.slipEnd(e) > Y).sort((e, t) => n.slipEnd(e) - n.slipEnd(t)), t = new Map(e.map((e) => [e.id, n.roomConflicts(e, H, ge, Y)])), r = e.flatMap((e) => n.rowsOf(e).filter((e) => e.end > Y).map((t) => ({
			s: e,
			w: t
		}))), i = (e) => r.filter((t) => t.w.status === e).reduce((e, t) => e + t.w.beds, 0), a = A(/* @__PURE__ */ new Date()), o = A(new Date(Y + M)), s = (t) => e.flatMap((e) => n.departuresOf(e).filter((e) => A(new Date(e.at)) === t).map((t) => n.paxAt(e, t.at - 1).total - n.paxAt(e, t.at).total)).reduce((e, t) => e + t, 0), c = [...t.values()].flat(), l = [];
		for (let e = 0; e < 14; e++) l.push(A(new Date(Y + e * M)));
		let u = l.map((t) => {
			let r = {
				d: t,
				confirmed: 0,
				tentative: 0,
				unknown: 0
			};
			for (let i of e) for (let e of n.departuresOf(i)) {
				if (A(new Date(e.at)) !== t) continue;
				let a = n.paxAt(i, e.at - 1).total - n.paxAt(i, e.at).total, o = e.status === "booked" ? "confirmed" : e.status;
				r[o] = (r[o] || 0) + a;
			}
			return r;
		}).filter((e) => e.confirmed + e.tentative + e.unknown), d = H.filter((e) => !n.isDelayed(e) && [a, o].includes(e.checkout_date) && n.slipEnd(e) > Y - 216e5).sort((e, t) => n.slipEnd(e) - n.slipEnd(t));
		return {
			delayed: e,
			conf: t,
			beds: i,
			leaving: {
				today: s(a),
				tomorrow: s(o)
			},
			clashes: c.filter((e) => e.clash).length,
			tight: c.filter((e) => e.tight).length,
			per: u,
			soon: d
		};
	}, [H, me]), Z = (e, t) => ve((n) => {
		let r = new Set(n);
		return t ? r.add(e) : r.delete(e), r;
	}), ke = (e) => JSON.parse(JSON.stringify(e));
	function Ae(e) {
		let t = ["gents", "ladies"].flatMap((t) => (e.rooms?.[t] || []).filter((e) => e.out?.date).map((e) => `${e.out.date}T${e.out.time || "00:00"}`)).sort();
		t.length && ([e.checkout_date, e.checkout_time] = t[t.length - 1].split("T"));
	}
	async function Q(e, t, r = null) {
		let i = new Map(H.map((e) => [e.id, e])), a = /* @__PURE__ */ new Map();
		if (r) for (let e of r) a.set(e, null);
		else for (let e of U) {
			let [t, n, r] = e.split("|"), i = Number(t);
			a.has(i) || a.set(i, []), a.get(i).push([n, Number(r)]);
		}
		if (!a.size) {
			J("Tick the rooms first.", !0);
			return;
		}
		let o = [];
		for (let [e, n] of a) {
			let r = i.get(e);
			if (!r) continue;
			let a = ke(r);
			t(a, n), Ae(a), o.push([r, a]);
		}
		let s = new Map(o.map(([e, t]) => [e.id, t])), c = H.map((e) => s.get(e.id) || e), l = (e, t, n) => {
			let r = (t.rooms.gents || []).includes(n) ? "gents" : "ladies", i = t.rooms[r].indexOf(n), a = e.rooms?.[r]?.[i];
			return !a || JSON.stringify(a.out || null) !== JSON.stringify(n.out || null);
		}, u = o.flatMap(([e, t]) => n.roomConflicts(t, c, ge).filter((n) => n.clash && l(e, t, n.row.row)).map((e) => `SH ${t.sh_no} room ${e.row.room_no}: ${e.peak}/${e.cap} beds on ${j(e.at)} with ${e.who.map((e) => `SH ${e.sh}`).join(", ")}`));
		if (u.length) await R({
			title: "Not saved",
			confirmLabel: "OK",
			body: `These rooms would overflow with groups booked in after:\n\n${u.join("\n")}\n\nMove the delayed guests to other rooms (Slip page → Pick rooms…) or choose an earlier date.`
		});
		else {
			J("Saving…");
			try {
				let t = await I(F.bulkWrite({ put: o.map(([, e]) => e) }, "delay"));
				await se(N, L, "delay", e, o), ve(/* @__PURE__ */ new Set()), await B.refetch(), J(`Saved ${t.updated} slip${t.updated === 1 ? "" : "s"}. Undo is in “Bulk changes” below.`);
			} catch (e) {
				J(e.message || String(e), !0);
			}
		}
	}
	let $ = (e, t, n, r, i) => {
		let a = e.rooms[t][n];
		a.out = r, a.out_status = i;
	}, je = () => {
		W ? Q(`${U.size} room(s) → ${W} ${G || "10:00"} (${K})`, (e, t) => t.forEach(([t, n]) => $(e, t, n, {
			date: W,
			time: G || "10:00"
		}, K))) : J("Choose the date.", !0);
	}, Me = () => {
		let e = new Date(Date.now() + he * M);
		Q(`${U.size} room(s) held ${he} days (unknown)`, (t, n) => n.forEach(([n, r]) => $(t, n, r, {
			date: A(e),
			time: t.rooms[n][r].out?.time || t.checkout_time || "10:00"
		}, "unknown")));
	};
	async function Ne() {
		if (!await R({
			title: "Mark as left?",
			confirmLabel: "Mark left",
			body: `Mark the ${U.size} ticked room(s) as left now? Their beds are free from this minute.`
		})) return;
		let e = /* @__PURE__ */ new Date();
		Q(`${U.size} room(s) left`, (t, n) => n.forEach(([n, r]) => $(t, n, r, {
			date: A(e),
			time: le(e)
		}, "confirmed")));
	}
	async function Pe(e) {
		await R({
			title: "Mark delayed?",
			confirmLabel: "Mark delayed",
			body: `Mark SH ${e.sh_no} as a delayed departure? Every room keeps today's check-out as tentative; change the dates above.`
		}) && Q(`SH ${e.sh_no} marked delayed`, (e) => {
			e.delayed = {
				on: !0,
				status: "tentative",
				note: "",
				original_checkout: {
					date: e.checkout_date,
					time: e.checkout_time
				},
				updated_at: (/* @__PURE__ */ new Date()).toISOString()
			};
			for (let t of ["gents", "ladies"]) for (let n of e.rooms?.[t] || []) String(n.room_no || "").trim() && (n.out = {
				date: e.checkout_date,
				time: e.checkout_time
			}, n.out_status = "tentative");
		}, [e.id]);
	}
	async function Fe() {
		let e = Ce, t = Te;
		e && t && e > t && ([e, t] = [t, e]), Oe(!0);
		try {
			let n = await I(N.mirrorAll()).catch(() => H), r = await ue("views/departures/report.js"), i = r.reportRows(H, n, {
				from: e,
				to: t
			});
			if (!i.length) {
				J("No delayed departures in these dates.", !0);
				return;
			}
			await r.exportReport(i, de.label, {
				from: e,
				to: t
			}), J(`Exported ${i.length} row${i.length === 1 ? "" : "s"}.`);
		} catch (e) {
			J(e.message || String(e), !0);
		} finally {
			Oe(!1);
		}
	}
	let Ie = [
		[
			"Delayed groups",
			X.delayed.length,
			`${X.delayed.reduce((e, t) => e + n.paxAt(t, Y).total, 0)} guests in house`,
			"big"
		],
		[
			"Unknown date",
			X.beds("unknown"),
			"beds held",
			"warn"
		],
		[
			"Tentative",
			X.beds("tentative"),
			"beds, ticket not confirmed"
		],
		[
			"Confirmed",
			X.beds("confirmed"),
			"beds with a new date"
		],
		[
			"Leaving today",
			X.leaving.today,
			"guests"
		],
		[
			"Leaving tomorrow",
			X.leaving.tomorrow,
			"guests"
		],
		[
			"Rooms clashing",
			X.clashes,
			"overflow with the next group",
			X.clashes ? "bad" : ""
		],
		[
			"Rooms tight",
			X.tight,
			"next group within 2 days",
			X.tight ? "amber" : ""
		]
	];
	return /* @__PURE__ */ (0, O.jsxs)("div", {
		className: "mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4",
		children: [
			/* @__PURE__ */ (0, O.jsxs)("header", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, O.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, O.jsx)("h1", {
						className: "text-2xl font-bold text-primary",
						children: "Delayed departures"
					}), /* @__PURE__ */ (0, O.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							"Groups that could not leave on their booked date. Each room has its own check-out: ",
							/* @__PURE__ */ (0, O.jsx)("b", { children: "confirmed" }),
							", ",
							/* @__PURE__ */ (0, O.jsx)("b", { children: "tentative" }),
							" (ticket not confirmed) or ",
							/* @__PURE__ */ (0, O.jsx)("b", { children: "unknown" }),
							" (beds held). Every change is checked against the groups booked into those rooms next."
						]
					})]
				}), /* @__PURE__ */ (0, O.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, O.jsxs)("span", {
							className: "flex flex-wrap items-center gap-1.5 text-sm",
							title: "Only the departures (Extended Departure Date) between these days",
							children: [
								"Departed from ",
								/* @__PURE__ */ (0, O.jsx)(y, {
									type: "date",
									className: "w-40",
									value: Ce,
									onChange: (e) => we(e.target.value)
								}),
								" to ",
								/* @__PURE__ */ (0, O.jsx)(y, {
									type: "date",
									className: "w-40",
									value: Te,
									onChange: (e) => Ee(e.target.value)
								})
							]
						}),
						/* @__PURE__ */ (0, O.jsxs)(m, {
							disabled: De,
							onClick: () => void Fe(),
							title: "Delayed Departure Report — one row per departure of each delayed group, between the two dates",
							children: [/* @__PURE__ */ (0, O.jsx)(ne, { className: "size-4" }), "Export Excel"]
						}),
						/* @__PURE__ */ (0, O.jsxs)(m, {
							variant: "outline",
							onClick: () => void B.refetch().then(() => J("")),
							children: [/* @__PURE__ */ (0, O.jsx)(re, { className: "size-4" }), "Refresh"]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, O.jsx)("section", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8",
				children: Ie.map(([e, t, n, r]) => /* @__PURE__ */ (0, O.jsxs)("div", {
					className: E("grid gap-0.5 rounded-xl border bg-card p-3", r === "big" && "col-span-2 border-gold/60 bg-accent/40", r === "warn" && "border-warn/50 bg-warn-soft", r === "bad" && "border-destructive/50 bg-bad-soft", r === "amber" && "border-warn/50"),
					children: [
						/* @__PURE__ */ (0, O.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: e
						}),
						/* @__PURE__ */ (0, O.jsx)("b", {
							className: "text-2xl",
							children: t
						}),
						/* @__PURE__ */ (0, O.jsx)("small", {
							className: "text-xs text-muted-foreground",
							children: n
						})
					]
				}, e))
			}),
			z && /* @__PURE__ */ (0, O.jsxs)("section", {
				className: "sticky top-0 z-20 flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3 shadow-sm",
				children: [
					/* @__PURE__ */ (0, O.jsxs)("span", {
						className: "text-sm font-bold",
						children: [
							U.size,
							" room",
							U.size === 1 ? "" : "s",
							" ticked"
						]
					}),
					/* @__PURE__ */ (0, O.jsxs)("span", {
						className: "flex flex-wrap items-center gap-1.5 text-sm",
						children: [
							"Leaves ",
							/* @__PURE__ */ (0, O.jsx)(y, {
								type: "date",
								className: "w-40",
								value: W,
								onChange: (e) => ye(e.target.value)
							}),
							/* @__PURE__ */ (0, O.jsx)(y, {
								type: "time",
								className: "w-28",
								value: G,
								onChange: (e) => be(e.target.value)
							}),
							/* @__PURE__ */ (0, O.jsxs)(te, {
								value: K,
								onValueChange: xe,
								children: [/* @__PURE__ */ (0, O.jsx)(d, {
									className: "w-32",
									"aria-label": "Status",
									children: /* @__PURE__ */ (0, O.jsx)(u, {})
								}), /* @__PURE__ */ (0, O.jsxs)(ee, { children: [
									/* @__PURE__ */ (0, O.jsx)(f, {
										value: "tentative",
										children: "tentative"
									}),
									/* @__PURE__ */ (0, O.jsx)(f, {
										value: "confirmed",
										children: "confirmed"
									}),
									/* @__PURE__ */ (0, O.jsx)(f, {
										value: "unknown",
										children: "unknown"
									})
								] })]
							}),
							/* @__PURE__ */ (0, O.jsx)(m, {
								onClick: je,
								children: "Set for ticked"
							})
						]
					}),
					/* @__PURE__ */ (0, O.jsx)(m, {
						variant: "outline",
						onClick: Me,
						children: "Hold unknown"
					}),
					/* @__PURE__ */ (0, O.jsx)(m, {
						variant: "outline",
						onClick: () => void Ne(),
						children: "Left now"
					}),
					q.text && /* @__PURE__ */ (0, O.jsx)("span", {
						role: "status",
						className: E("text-sm font-semibold", q.bad ? "text-destructive" : "text-ok"),
						children: q.text
					})
				]
			}),
			/* @__PURE__ */ (0, O.jsxs)(v, {
				className: "gap-0 py-0",
				children: [/* @__PURE__ */ (0, O.jsx)(_, {
					className: "border-b py-3",
					children: /* @__PURE__ */ (0, O.jsxs)(h, {
						className: "text-base",
						children: ["Delayed groups ", /* @__PURE__ */ (0, O.jsx)("span", {
							className: "ml-1 text-xs font-normal text-muted-foreground",
							children: "tick rooms, then use the bar above · red = the room overflows with the next group · amber = next group within 2 days"
						})]
					})
				}), /* @__PURE__ */ (0, O.jsx)(g, {
					className: "grid gap-3 p-3",
					children: X.delayed.length ? X.delayed.map((e) => {
						let t = X.conf.get(e.id) || [], r = e.ums || {}, i = String(e.group_leader || r.glName || "").trim(), a = r.glPhone || r.phone || "", o = [];
						for (let r of ["gents", "ladies"]) (e.rooms?.[r] || []).forEach((i, a) => {
							if (!String(i.room_no || "").trim()) return;
							let s = n.rowsOf({
								...e,
								rooms: {
									gents: r === "gents" ? [i] : [],
									ladies: r === "ladies" ? [i] : []
								}
							})[0], c = t.find((e) => e.row.row === i), l = `${e.id}|${r}|${a}`, u = s.end <= Y, d = !u && s.status !== "confirmed" && s.end - Y < 2 * M;
							o.push(/* @__PURE__ */ (0, O.jsxs)(w, {
								className: E(u && "opacity-50", !u && c?.clash && "bg-bad-soft", !u && !c?.clash && c?.tight && "bg-warn-soft/60", d && "outline outline-1 -outline-offset-1 outline-warn/50"),
								children: [
									/* @__PURE__ */ (0, O.jsx)(C, { children: z && !u ? /* @__PURE__ */ (0, O.jsx)(p, {
										checked: U.has(l),
										onCheckedChange: (e) => Z(l, e === !0),
										"aria-label": `Room ${i.room_no}`
									}) : null }),
									/* @__PURE__ */ (0, O.jsxs)(C, { children: [/* @__PURE__ */ (0, O.jsx)("b", { children: i.room_no }), /* @__PURE__ */ (0, O.jsxs)("small", {
										className: "block text-muted-foreground",
										children: [r === "gents" ? "Gents" : "Ladies", i.gl ? " · GL" : ""]
									})] }),
									/* @__PURE__ */ (0, O.jsx)(C, {
										className: "text-right",
										children: s.beds
									}),
									/* @__PURE__ */ (0, O.jsxs)(C, { children: [j(s.end), d && /* @__PURE__ */ (0, O.jsx)("small", {
										className: "block text-warn",
										children: "review — leaves soon, not confirmed"
									})] }),
									/* @__PURE__ */ (0, O.jsx)(C, { children: /* @__PURE__ */ (0, O.jsx)(P, { s: u ? "left" : s.status === "booked" ? "booked" : s.status }) }),
									/* @__PURE__ */ (0, O.jsx)(C, {
										className: "text-sm",
										children: u ? "" : c?.clash ? /* @__PURE__ */ (0, O.jsxs)(O.Fragment, { children: [
											/* @__PURE__ */ (0, O.jsx)("b", {
												className: "text-destructive",
												children: "Overflows"
											}),
											" ",
											j(c.at),
											": ",
											c.peak,
											"/",
											c.cap,
											" beds with ",
											c.who.map((e) => `SH ${e.sh}`).join(", ")
										] }) : c?.next ? `next: SH ${c.next.sh} from ${j(c.next.start)}` : /* @__PURE__ */ (0, O.jsx)("span", {
											className: "text-muted-foreground",
											children: "no one booked after"
										})
									})
								]
							}, l));
						});
						return /* @__PURE__ */ (0, O.jsxs)("article", {
							className: "grid gap-2 rounded-xl border bg-white p-3",
							children: [
								/* @__PURE__ */ (0, O.jsxs)("header", {
									className: "flex flex-wrap items-start justify-between gap-2",
									children: [/* @__PURE__ */ (0, O.jsxs)("div", {
										className: "min-w-0",
										children: [
											/* @__PURE__ */ (0, O.jsxs)("a", {
												className: "font-bold text-primary underline",
												href: fe("slip", { sh_no: e.sh_no }),
												title: "Open the slip",
												children: ["SH ", e.sh_no]
											}),
											" ",
											/* @__PURE__ */ (0, O.jsx)("b", { children: e.tour_name || "-" }),
											/* @__PURE__ */ (0, O.jsxs)("small", {
												className: "block text-muted-foreground",
												children: [
													i || "-",
													a ? ` · ${a}` : "",
													" · ",
													e.building || "no building"
												]
											})
										]
									}), /* @__PURE__ */ (0, O.jsxs)("div", {
										className: "flex flex-wrap items-center gap-2 text-sm",
										children: [
											/* @__PURE__ */ (0, O.jsx)(P, { s: e.delayed.status || "" }),
											/* @__PURE__ */ (0, O.jsxs)("span", { children: [n.paxAt(e, Y).total, " in house"] }),
											/* @__PURE__ */ (0, O.jsxs)("span", {
												className: "text-xs text-muted-foreground",
												children: ["booked to leave ", e.delayed.original_checkout ? `${e.delayed.original_checkout.date} ${e.delayed.original_checkout.time}` : "—"]
											})
										]
									})]
								}),
								e.delayed.note && /* @__PURE__ */ (0, O.jsx)("p", {
									className: "rounded bg-muted p-2 text-sm",
									children: e.delayed.note
								}),
								o.length ? /* @__PURE__ */ (0, O.jsx)("div", {
									className: "overflow-x-auto",
									children: /* @__PURE__ */ (0, O.jsxs)(T, { children: [/* @__PURE__ */ (0, O.jsx)(S, { children: /* @__PURE__ */ (0, O.jsxs)(w, { children: [
										/* @__PURE__ */ (0, O.jsx)(b, { children: z && /* @__PURE__ */ (0, O.jsx)(p, {
											"aria-label": "Tick all rooms",
											onCheckedChange: (t) => ["gents", "ladies"].forEach((n) => (e.rooms?.[n] || []).forEach((r, i) => {
												String(r.room_no || "").trim() && Z(`${e.id}|${n}|${i}`, t === !0);
											}))
										}) }),
										/* @__PURE__ */ (0, O.jsx)(b, { children: "Room" }),
										/* @__PURE__ */ (0, O.jsx)(b, {
											className: "text-right",
											children: "Beds"
										}),
										/* @__PURE__ */ (0, O.jsx)(b, { children: "Leaves" }),
										/* @__PURE__ */ (0, O.jsx)(b, { children: "Status" }),
										/* @__PURE__ */ (0, O.jsx)(b, { children: "Next group in the room" })
									] }) }), /* @__PURE__ */ (0, O.jsx)(x, { children: o })] })
								}) : /* @__PURE__ */ (0, O.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: "No rooms on this slip — the whole group leaves at the slip's check-out."
								})
							]
						}, e.id);
					}) : /* @__PURE__ */ (0, O.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "No delayed groups. Mark one from the list below or on the Slip page (Delayed departure)."
					})
				})]
			}),
			/* @__PURE__ */ (0, O.jsxs)("section", {
				className: "grid gap-3 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, O.jsxs)(v, {
					className: "gap-0 py-0",
					children: [/* @__PURE__ */ (0, O.jsx)(_, {
						className: "border-b py-3",
						children: /* @__PURE__ */ (0, O.jsxs)(h, {
							className: "text-base",
							children: ["Leaving per day ", /* @__PURE__ */ (0, O.jsx)("span", {
								className: "ml-1 text-xs font-normal text-muted-foreground",
								children: "guests leaving from delayed groups — for transport"
							})]
						})
					}), /* @__PURE__ */ (0, O.jsx)(g, {
						className: "overflow-x-auto p-0",
						children: X.per.length ? /* @__PURE__ */ (0, O.jsxs)(T, { children: [/* @__PURE__ */ (0, O.jsx)(S, { children: /* @__PURE__ */ (0, O.jsxs)(w, { children: [
							/* @__PURE__ */ (0, O.jsx)(b, { children: "Day" }),
							/* @__PURE__ */ (0, O.jsx)(b, {
								className: "text-right",
								children: "Confirmed"
							}),
							/* @__PURE__ */ (0, O.jsx)(b, {
								className: "text-right",
								children: "Tentative"
							}),
							/* @__PURE__ */ (0, O.jsx)(b, {
								className: "text-right",
								children: "Unknown (hold ends)"
							}),
							/* @__PURE__ */ (0, O.jsx)(b, {
								className: "text-right",
								children: "Total"
							})
						] }) }), /* @__PURE__ */ (0, O.jsx)(x, { children: X.per.map((e) => /* @__PURE__ */ (0, O.jsxs)(w, { children: [
							/* @__PURE__ */ (0, O.jsx)(C, { children: (/* @__PURE__ */ new Date(`${e.d}T12:00`)).toLocaleDateString(void 0, {
								weekday: "short",
								day: "2-digit",
								month: "short"
							}) }),
							/* @__PURE__ */ (0, O.jsx)(C, {
								className: "text-right",
								children: e.confirmed || ""
							}),
							/* @__PURE__ */ (0, O.jsx)(C, {
								className: "text-right",
								children: e.tentative || ""
							}),
							/* @__PURE__ */ (0, O.jsx)(C, {
								className: "text-right",
								children: e.unknown || ""
							}),
							/* @__PURE__ */ (0, O.jsx)(C, {
								className: "text-right",
								children: /* @__PURE__ */ (0, O.jsx)("b", { children: e.confirmed + e.tentative + e.unknown })
							})
						] }, e.d)) })] }) : /* @__PURE__ */ (0, O.jsx)("p", {
							className: "p-3 text-sm text-muted-foreground",
							children: "No delayed guests leaving in the next 14 days."
						})
					})]
				}), /* @__PURE__ */ (0, O.jsxs)(v, {
					className: "gap-0 py-0",
					children: [/* @__PURE__ */ (0, O.jsx)(_, {
						className: "border-b py-3",
						children: /* @__PURE__ */ (0, O.jsxs)(h, {
							className: "text-base",
							children: ["Booked to leave today & tomorrow ", /* @__PURE__ */ (0, O.jsx)("span", {
								className: "ml-1 text-xs font-normal text-muted-foreground",
								children: "mark a group delayed if its flight is off"
							})]
						})
					}), /* @__PURE__ */ (0, O.jsx)(g, {
						className: "overflow-x-auto p-0",
						children: X.soon.length ? /* @__PURE__ */ (0, O.jsxs)(T, { children: [/* @__PURE__ */ (0, O.jsx)(S, { children: /* @__PURE__ */ (0, O.jsxs)(w, { children: [
							/* @__PURE__ */ (0, O.jsx)(b, { children: "SH" }),
							/* @__PURE__ */ (0, O.jsx)(b, { children: "Group" }),
							/* @__PURE__ */ (0, O.jsx)(b, { children: "Leaves" }),
							/* @__PURE__ */ (0, O.jsx)(b, {
								className: "text-right",
								children: "Pax"
							}),
							/* @__PURE__ */ (0, O.jsx)(b, {})
						] }) }), /* @__PURE__ */ (0, O.jsx)(x, { children: X.soon.map((e) => /* @__PURE__ */ (0, O.jsxs)(w, { children: [
							/* @__PURE__ */ (0, O.jsx)(C, { children: /* @__PURE__ */ (0, O.jsx)("b", { children: e.sh_no }) }),
							/* @__PURE__ */ (0, O.jsxs)(C, { children: [e.tour_name || "-", /* @__PURE__ */ (0, O.jsx)("small", {
								className: "block text-muted-foreground",
								children: e.building || ""
							})] }),
							/* @__PURE__ */ (0, O.jsx)(C, { children: j(n.slipEnd(e)) }),
							/* @__PURE__ */ (0, O.jsx)(C, {
								className: "text-right",
								children: n.paxAt(e, n.slipEnd(e) - 1).total
							}),
							/* @__PURE__ */ (0, O.jsx)(C, { children: z && /* @__PURE__ */ (0, O.jsx)(m, {
								size: "sm",
								variant: "outline",
								onClick: () => void Pe(e),
								children: "Mark delayed"
							}) })
						] }, e.id)) })] }) : /* @__PURE__ */ (0, O.jsx)("p", {
							className: "p-3 text-sm text-muted-foreground",
							children: "No groups booked to leave today or tomorrow."
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, O.jsx)(ce, {}),
			pe,
			V.isError && /* @__PURE__ */ (0, O.jsx)(oe, {
				variant: "destructive",
				children: "Could not load the rooms."
			})
		]
	});
}
export { F as default };
