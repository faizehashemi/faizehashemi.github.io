import { f as e, h as t, i as n, n as r, p as i, u as a } from "./PmsContext-BVMd13Oi.js";
import { t as o } from "./useQuery-BUXPY6q6.js";
import { t as s } from "./button-BGWa3SLr.js";
import { i as c, n as l, r as u, t as d } from "./card-B9_OGomP.js";
import { t as f } from "./utils-b7UP9Cmo.js";
// src/pages/paxchart/paxchart.ts
var p = /* @__PURE__ */ t(i(), 1), m = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December"
], h = (e) => {
	let t = Number(e);
	return Number.isFinite(t) ? t : 0;
}, g = (e) => ["gents", "ladies"].some((t) => (e.rooms?.[t] || []).some((e) => String(e.room_no || "").trim())), _ = (e) => h(e.total) || h(e.gents) + h(e.ladies) + h(e.children) + h(e.infants);
function v(e, t, n) {
	let r = m.map(() => Array(31).fill(0)), i = m.map(() => Array(31).fill(0)), a = new Date(t, 0, 1).getTime(), o = new Date(t + 1, 0, 1).getTime();
	for (let t of e) {
		let e = n.slipStart(t), s = n.slipEnd(t);
		if (!e || !s || s <= e) continue;
		let c = new Date(e);
		if (e >= a && e < o && (i[c.getMonth()][c.getDate() - 1] += _(t)), s <= a || e >= o) continue;
		let l = new Date(Math.max(e, a));
		for (l.setHours(22, 0, 0, 0), l.getTime() < e && l.setDate(l.getDate() + 1); l.getTime() < Math.min(s, o); l.setDate(l.getDate() + 1)) {
			let e = n.paxAt(t, l.getTime()).total;
			e && (r[l.getMonth()][l.getDate() - 1] += e);
		}
	}
	return {
		count: r,
		arrivals: i
	};
}
// src/pages/paxchart/PaxChartPage.tsx
var y = e(), b = {
	makkah: "MAKKAH",
	medina: "MADINA"
}, x = {
	makkah: ["🕋", "Makkah"],
	medina: ["🕌", "Madina"]
}, S = [
	"Sun",
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat"
], C = (e, t, n) => e && t ? `color-mix(in srgb, ${n ? "#2f9e44" : "#d4af37"} ${Math.round(18 + e / t * 62)}%, #fffaf0)` : void 0;
function w({ values: e, year: t, arrivals: n }) {
	let r = /* @__PURE__ */ new Date(), i = r.getFullYear() === t ? `${r.getMonth()}-${r.getDate()}` : "", a = Math.max(0, ...e.flat());
	return /* @__PURE__ */ (0, y.jsx)("div", {
		className: "overflow-x-auto px-3 sm:px-4",
		children: /* @__PURE__ */ (0, y.jsxs)("table", {
			className: "w-full min-w-[980px] text-[11px] font-bold",
			children: [/* @__PURE__ */ (0, y.jsx)("thead", { children: /* @__PURE__ */ (0, y.jsxs)("tr", { children: [/* @__PURE__ */ (0, y.jsx)("th", {
				className: "border border-border p-1.5 text-center font-extrabold",
				children: "Mth"
			}), Array.from({ length: 31 }, (e, t) => /* @__PURE__ */ (0, y.jsx)("th", {
				className: "border border-border p-1.5 text-center font-extrabold",
				children: t + 1
			}, t))] }) }), /* @__PURE__ */ (0, y.jsx)("tbody", { children: m.map((r, o) => {
				let s = new Date(t, o + 1, 0).getDate();
				return /* @__PURE__ */ (0, y.jsxs)("tr", { children: [/* @__PURE__ */ (0, y.jsx)("th", {
					className: "min-w-[90px] border border-border p-1.5 pl-2 text-left font-medium",
					children: r
				}), Array.from({ length: 31 }, (t, r) => {
					if (r >= s) return /* @__PURE__ */ (0, y.jsx)("td", { className: "border border-border bg-[#fad4da]" }, r);
					let c = e[o][r], l = `${o}-${r + 1}` === i;
					return /* @__PURE__ */ (0, y.jsx)("td", {
						style: l ? void 0 : { background: C(c, a, n) },
						className: f("border border-border p-1.5 text-center", l && "bg-[#c9dcf5] text-[#d6336c] ring-2 ring-inset ring-[#d6336c]"),
						children: c || "-"
					}, r);
				})] }, r);
			}) })]
		})
	});
}
function T({ title: e, emoji: t, days: n, values: r, tone: i }) {
	let a = Math.max(1, ...r), o = r.indexOf(Math.max(...r)), s = r.reduce((e, t) => e + t, 0), c = (/* @__PURE__ */ new Date()).toDateString();
	return /* @__PURE__ */ (0, y.jsxs)("div", {
		className: "grid gap-2 rounded-xl border bg-card p-3",
		children: [
			/* @__PURE__ */ (0, y.jsxs)("div", {
				className: "flex items-baseline justify-between gap-2",
				children: [/* @__PURE__ */ (0, y.jsxs)("b", {
					className: "text-sm",
					children: [
						t,
						" ",
						e
					]
				}), /* @__PURE__ */ (0, y.jsxs)("span", {
					className: "text-xs text-muted-foreground",
					children: ["week total ", /* @__PURE__ */ (0, y.jsx)("b", {
						className: "text-foreground",
						children: s.toLocaleString()
					})]
				})]
			}),
			/* @__PURE__ */ (0, y.jsx)("div", {
				className: "grid grid-cols-7 items-end gap-1.5",
				style: { height: 150 },
				children: r.map((e, t) => /* @__PURE__ */ (0, y.jsxs)("div", {
					className: "flex h-full min-w-0 flex-col items-center justify-end gap-1",
					title: `${n[t].toDateString()}: ${e}`,
					children: [/* @__PURE__ */ (0, y.jsx)("span", {
						className: "text-[11px] font-bold tabular-nums",
						children: e ? e.toLocaleString() : "–"
					}), /* @__PURE__ */ (0, y.jsx)("div", {
						className: f("w-full rounded-t-md transition-all", i, n[t].toDateString() === c && "ring-2 ring-[#d6336c]"),
						style: {
							height: `${Math.max(e ? 6 : 2, Math.round(e / a * 100))}px`,
							opacity: e ? 1 : .25
						}
					})]
				}, t))
			}),
			/* @__PURE__ */ (0, y.jsx)("div", {
				className: "grid grid-cols-7 gap-1.5 text-center text-[11px] text-muted-foreground",
				children: n.map((e, t) => /* @__PURE__ */ (0, y.jsxs)("span", {
					className: f(e.toDateString() === c && "font-extrabold text-[#d6336c]"),
					children: [
						S[e.getDay()],
						/* @__PURE__ */ (0, y.jsx)("br", {}),
						e.getDate(),
						s > 0 && t === o && r[t] > 0 ? " 🔥" : ""
					]
				}, t))
			})
		]
	});
}
var E = ({ on: e, onClick: t, emoji: n, title: r, hint: i }) => /* @__PURE__ */ (0, y.jsxs)("button", {
	type: "button",
	onClick: t,
	"aria-pressed": e,
	className: f("grid gap-0.5 rounded-xl border-2 p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md", e ? "border-gold bg-accent shadow-md" : "border-border bg-card"),
	children: [
		/* @__PURE__ */ (0, y.jsx)("span", {
			className: "text-2xl",
			children: n
		}),
		/* @__PURE__ */ (0, y.jsx)("b", {
			className: "text-sm",
			children: r
		}),
		i && /* @__PURE__ */ (0, y.jsx)("span", {
			className: "text-xs text-muted-foreground",
			children: i
		})
	]
});
function D() {
	let { cloud: e, stay: t } = r(), i = n(), { siteId: m } = a(), h = (/* @__PURE__ */ new Date()).getFullYear(), [_, S] = (0, p.useState)({
		site: m,
		year: String(h),
		actual: !1,
		show: "both"
	}), [C, D] = (0, p.useState)(0), [O, k] = (0, p.useState)(null), A = (e, t) => S((n) => ({
		...n,
		[e]: t
	})), j = o({
		queryKey: ["mirror-all"],
		queryFn: () => i(e.mirrorAll())
	}), M = (e, t) => (j.data ?? []).filter((n) => !n.deleted && n.site === e && (!t || g(n))), N = (0, p.useMemo)(() => {
		if (!j.data) return null;
		let e = /* @__PURE__ */ new Date();
		e.setHours(12, 0, 0, 0);
		let n = new Date(e);
		n.setDate(e.getDate() - (e.getDay() + 6) % 7);
		let r = Array.from({ length: 7 }, (e, t) => {
			let r = new Date(n);
			return r.setDate(n.getDate() + t), r;
		}), i = M(_.site, _.actual), a = [...new Set(r.map((e) => e.getFullYear()))], o = new Map(a.map((e) => [e, v(i, e, t)])), s = (e, t) => o.get(e.getFullYear())[t][e.getMonth()][e.getDate() - 1];
		return {
			days: r,
			count: r.map((e) => s(e, "count")),
			arrivals: r.map((e) => s(e, "arrivals"))
		};
	}, [
		j.data,
		_.site,
		_.actual,
		t
	]), P = (0, p.useMemo)(() => j.data && O ? v(M(O.site, O.actual), Number(O.year), t) : null, [
		j.data,
		O,
		t
	]), F = [
		["📍", "Where"],
		["📅", "Year"],
		["🧾", "Count"],
		["📊", "Chart"]
	], I = [
		`${x[_.site][0]} ${x[_.site][1]}`,
		`📅 ${_.year}`,
		_.actual ? "🛏️ Rooms assigned" : "📝 Registrations",
		_.show === "both" ? "📊 Both charts" : _.show === "count" ? "👥 Pax count" : "🛬 Arrivals"
	];
	return /* @__PURE__ */ (0, y.jsxs)("div", {
		className: "mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-4 px-3 pb-10 pt-4 text-[13px] sm:px-4",
		children: [
			/* @__PURE__ */ (0, y.jsxs)("header", { children: [/* @__PURE__ */ (0, y.jsx)("h1", {
				className: "text-2xl font-extrabold text-primary",
				children: "📊 Pax counts"
			}), /* @__PURE__ */ (0, y.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Answer four quick steps and the chart appears. The week on the right is always up to date."
			})] }),
			/* @__PURE__ */ (0, y.jsxs)("div", {
				className: "grid items-start gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, y.jsx)(d, {
					className: "gap-3 py-4",
					children: /* @__PURE__ */ (0, y.jsxs)(l, {
						className: "grid gap-4 px-4",
						children: [
							/* @__PURE__ */ (0, y.jsx)("ol", {
								className: "flex items-center gap-1.5",
								"aria-label": "Steps",
								children: F.map(([e, t], n) => /* @__PURE__ */ (0, y.jsx)("li", {
									className: "flex flex-1 items-center gap-1.5",
									children: /* @__PURE__ */ (0, y.jsxs)("button", {
										type: "button",
										onClick: () => D(n),
										className: f("grid flex-1 justify-items-center gap-0.5 rounded-lg border px-1 py-1.5 text-xs font-bold transition", n === C ? "border-gold bg-accent" : n < C ? "border-ok/50 bg-ok/10" : "bg-card text-muted-foreground"),
										children: [/* @__PURE__ */ (0, y.jsx)("span", {
											className: "text-lg",
											children: n < C ? "✅" : e
										}), t]
									})
								}, t))
							}),
							C === 0 && /* @__PURE__ */ (0, y.jsxs)("div", {
								className: "grid gap-2",
								children: [/* @__PURE__ */ (0, y.jsx)("b", { children: "📍 Which place?" }), /* @__PURE__ */ (0, y.jsx)("div", {
									className: "grid grid-cols-2 gap-2",
									children: Object.entries(x).map(([e, [t, n]]) => /* @__PURE__ */ (0, y.jsx)(E, {
										on: _.site === e,
										onClick: () => A("site", e),
										emoji: t,
										title: n,
										hint: e === m ? "your desk" : void 0
									}, e))
								})]
							}),
							C === 1 && /* @__PURE__ */ (0, y.jsxs)("div", {
								className: "grid gap-2",
								children: [/* @__PURE__ */ (0, y.jsx)("b", { children: "📅 Which year?" }), /* @__PURE__ */ (0, y.jsx)("div", {
									className: "grid grid-cols-3 gap-2",
									children: [
										h - 1,
										h,
										h + 1
									].map((e) => /* @__PURE__ */ (0, y.jsx)(E, {
										on: _.year === String(e),
										onClick: () => A("year", String(e)),
										emoji: e < h ? "⏪" : e > h ? "⏩" : "📍",
										title: String(e),
										hint: e < h ? "last year" : e > h ? "next year" : "this year"
									}, e))
								})]
							}),
							C === 2 && /* @__PURE__ */ (0, y.jsxs)("div", {
								className: "grid gap-2",
								children: [/* @__PURE__ */ (0, y.jsx)("b", { children: "🧾 What should be counted?" }), /* @__PURE__ */ (0, y.jsxs)("div", {
									className: "grid grid-cols-2 gap-2",
									children: [/* @__PURE__ */ (0, y.jsx)(E, {
										on: !_.actual,
										onClick: () => A("actual", !1),
										emoji: "📝",
										title: "Registrations",
										hint: "every slip, including UMS imports"
									}), /* @__PURE__ */ (0, y.jsx)(E, {
										on: _.actual,
										onClick: () => A("actual", !0),
										emoji: "🛏️",
										title: "Rooms assigned",
										hint: "only slips with rooms (actual allocation)"
									})]
								})]
							}),
							C === 3 && /* @__PURE__ */ (0, y.jsxs)("div", {
								className: "grid gap-2",
								children: [/* @__PURE__ */ (0, y.jsx)("b", { children: "📊 Which chart?" }), /* @__PURE__ */ (0, y.jsxs)("div", {
									className: "grid grid-cols-3 gap-2",
									children: [
										/* @__PURE__ */ (0, y.jsx)(E, {
											on: _.show === "both",
											onClick: () => A("show", "both"),
											emoji: "🗂️",
											title: "Both"
										}),
										/* @__PURE__ */ (0, y.jsx)(E, {
											on: _.show === "count",
											onClick: () => A("show", "count"),
											emoji: "👥",
											title: "Pax count",
											hint: "staying each night"
										}),
										/* @__PURE__ */ (0, y.jsx)(E, {
											on: _.show === "arrivals",
											onClick: () => A("show", "arrivals"),
											emoji: "🛬",
											title: "Arrivals",
											hint: "checking in each day"
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, y.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									C > 0 && /* @__PURE__ */ (0, y.jsx)(s, {
										variant: "outline",
										onClick: () => D(C - 1),
										children: "← Back"
									}),
									C < 3 ? /* @__PURE__ */ (0, y.jsx)(s, {
										onClick: () => D(C + 1),
										children: "Next →"
									}) : /* @__PURE__ */ (0, y.jsx)(s, {
										onClick: () => k({ ..._ }),
										children: "✨ Show my chart"
									}),
									/* @__PURE__ */ (0, y.jsx)("div", {
										className: "ml-auto flex flex-wrap gap-1",
										children: I.map((e) => /* @__PURE__ */ (0, y.jsx)("span", {
											className: "rounded-full border bg-muted px-2 py-0.5 text-[11px] font-semibold",
											children: e
										}, e))
									})
								]
							}),
							/* @__PURE__ */ (0, y.jsx)("p", {
								className: "text-[11px] text-muted-foreground",
								children: _.actual ? /* @__PURE__ */ (0, y.jsxs)(y.Fragment, { children: [
									"Only slips with ",
									/* @__PURE__ */ (0, y.jsx)("b", { children: "ROOMS ASSIGNED" }),
									" are counted. Guests are counted for each night they stay (at 22:00)."
								] }) : /* @__PURE__ */ (0, y.jsxs)(y.Fragment, { children: [
									"Based on ",
									/* @__PURE__ */ (0, y.jsx)("b", { children: "REGISTRATION INFORMATION" }),
									" (every slip, including UMS imports), ",
									/* @__PURE__ */ (0, y.jsx)("b", { children: "not" }),
									" only on room allocation. Guests are counted for each night they stay (at 22:00)."
								] })
							})
						]
					})
				}), /* @__PURE__ */ (0, y.jsxs)(d, {
					className: "gap-3 py-4",
					children: [/* @__PURE__ */ (0, y.jsx)(u, {
						className: "px-4",
						children: /* @__PURE__ */ (0, y.jsxs)(c, {
							className: "text-base",
							children: [
								"🗓️ This week · ",
								x[_.site][0],
								" ",
								x[_.site][1]
							]
						})
					}), /* @__PURE__ */ (0, y.jsxs)(l, {
						className: "grid gap-3 px-4",
						children: [N ? /* @__PURE__ */ (0, y.jsxs)(y.Fragment, { children: [/* @__PURE__ */ (0, y.jsx)(T, {
							title: "Guests staying each night",
							emoji: "👥",
							days: N.days,
							values: N.count,
							tone: "bg-gradient-to-t from-gold to-primary"
						}), /* @__PURE__ */ (0, y.jsx)(T, {
							title: "Guests arriving each day",
							emoji: "🛬",
							days: N.days,
							values: N.arrivals,
							tone: "bg-gradient-to-t from-[#2f9e44] to-[#8ce99a]"
						})] }) : /* @__PURE__ */ (0, y.jsx)("p", {
							className: "text-muted-foreground",
							children: "Loading…"
						}), j.isError && /* @__PURE__ */ (0, y.jsx)("p", {
							className: "text-destructive",
							children: "Could not load the slips."
						})]
					})]
				})]
			}),
			O && /* @__PURE__ */ (0, y.jsxs)(y.Fragment, { children: [
				/* @__PURE__ */ (0, y.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, y.jsxs)("b", {
						className: "text-base",
						children: [
							x[O.site][0],
							" ",
							x[O.site][1],
							" · ",
							O.year,
							" · ",
							O.actual ? "rooms assigned" : "registrations"
						]
					}), /* @__PURE__ */ (0, y.jsx)(s, {
						size: "sm",
						variant: "outline",
						onClick: () => {
							k(null), D(0);
						},
						children: "↺ Start over"
					})]
				}),
				(O.show === "both" || O.show === "count") && /* @__PURE__ */ (0, y.jsxs)(d, {
					className: "gap-0 py-0",
					children: [/* @__PURE__ */ (0, y.jsx)(u, {
						className: "rounded-t-xl border-b bg-muted py-2.5",
						children: /* @__PURE__ */ (0, y.jsx)(c, {
							className: "text-sm font-medium",
							children: "👥 Yearly Pax Count Chart"
						})
					}), /* @__PURE__ */ (0, y.jsxs)(l, {
						className: "px-0 py-3",
						children: [P ? /* @__PURE__ */ (0, y.jsx)(w, {
							values: P.count,
							year: Number(O.year),
							arrivals: !1
						}) : /* @__PURE__ */ (0, y.jsx)("p", {
							className: "px-4 text-muted-foreground",
							children: "Loading…"
						}), /* @__PURE__ */ (0, y.jsxs)("p", {
							className: "mx-4 mt-2 text-[11px] text-muted-foreground",
							children: [
								"Pax Count Chart for ",
								b[O.site],
								" for the year ",
								O.year
							]
						})]
					})]
				}),
				(O.show === "both" || O.show === "arrivals") && /* @__PURE__ */ (0, y.jsxs)(d, {
					className: "gap-0 py-0",
					children: [/* @__PURE__ */ (0, y.jsx)(u, {
						className: "rounded-t-xl border-b bg-muted py-2.5",
						children: /* @__PURE__ */ (0, y.jsx)(c, {
							className: "text-sm font-medium",
							children: "🛬 Yearly Pax Arrival Chart"
						})
					}), /* @__PURE__ */ (0, y.jsxs)(l, {
						className: "px-0 py-3",
						children: [P ? /* @__PURE__ */ (0, y.jsx)(w, {
							values: P.arrivals,
							year: Number(O.year),
							arrivals: !0
						}) : /* @__PURE__ */ (0, y.jsx)("p", {
							className: "px-4 text-muted-foreground",
							children: "Loading…"
						}), /* @__PURE__ */ (0, y.jsxs)("p", {
							className: "mx-4 mt-2 text-[11px] text-muted-foreground",
							children: [
								"Pax ARRIVAL Chart for ",
								b[O.site],
								" for the year ",
								O.year
							]
						})]
					})]
				})
			] })
		]
	});
}
export { D as default };
