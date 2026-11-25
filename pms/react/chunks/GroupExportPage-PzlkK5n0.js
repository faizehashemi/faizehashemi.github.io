import { f as e, h as t, i as n, o as r, p as i, r as a } from "./PmsContext-BVMd13Oi.js";
import { t as o } from "./checkbox-C3tIiLfF.js";
import { t as s } from "./label-CMEyi--P.js";
import { t as c } from "./download-DbAPjole.js";
import { t as l } from "./button-BGWa3SLr.js";
import { n as u, t as d } from "./card-B9_OGomP.js";
import { t as f } from "./input-DSBk_UeU.js";
import { a as p, n as m, o as h, r as g, s as _, t as v } from "./table-DKR1WqRT.js";
import { t as y } from "./ConfirmDialog-GfriOiUy.js";
import { t as b } from "./PromptDialog-D_1ik4AU.js";
import { t as x } from "./badge-EB7Muw37.js";
// src/pages/group-export/groupexport.ts
var S = /* @__PURE__ */ t(i(), 1), C = (e) => Number(e || 0), w = (e) => String(e ?? "").trim(), T = (e) => String(e).padStart(2, "0"), ee = (e) => {
	let t = w(e).toLowerCase();
	return t ? t.charAt(0).toUpperCase() + t.slice(1) : "";
}, E = () => "S" + (crypto.randomUUID?.().slice(0, 8) || Math.random().toString(36).slice(2, 10)), D = () => {
	let e = /* @__PURE__ */ new Date();
	return `${e.getFullYear()}${T(e.getMonth() + 1)}${T(e.getDate())}_${T(e.getHours())}${T(e.getMinutes())}`;
}, O = (e) => e.tour_name + "|" + e.group_leader;
function k(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e.tours) {
		let e = w(n.tour_name), r = w(n.group_leader);
		if (!e && !r) continue;
		let i = e + "|" + r;
		t.has(i) || t.set(i, {
			tour_name: e,
			group_leader: r,
			count: 0
		}), t.get(i).count += Number.isFinite(C(n.total)) && C(n.total) > 0 ? C(n.total) : 1;
	}
	return Array.from(t.values());
}
function A(e) {
	let t = e.map((e) => ({
		tour_name: w(e.tour_name),
		group_leader: w(e.group_leader),
		sh: w(e.sh_no ?? e.sh),
		total: C(e.total)
	})), n = {
		id: E(),
		tours: t,
		pax: e.reduce((e, t) => e + C(t.total), 0) || e.length,
		showLeaderByKey: {}
	}, r = k(n);
	for (let e of r) n.showLeaderByKey[O(e)] = r.length <= 2;
	return n;
}
var j = (e) => e >= 9 ? 3 : e >= 4 ? 2 : 1;
async function te(e, t) {
	try {
		await t.loadScript(t.LIBS.jspdf);
	} catch {}
	let n = window;
	if (!(n.jspdf && n.jspdf.jsPDF)) throw Error("PDF engine not loaded. Check your connection.");
	let r = new n.jspdf.jsPDF({
		orientation: "landscape",
		unit: "mm",
		format: "a4"
	}), i = r.internal.pageSize.getWidth(), a = r.internal.pageSize.getHeight(), o = (e, t) => (r.setFontSize(t), r.getTextWidth(e)), s = (e, t, n, i) => {
		r.setFont("helvetica", "bold"), r.setFontSize(i), r.text(e, t, n, {
			align: "center",
			baseline: "alphabetic"
		});
	}, c = (e, t, n, i) => {
		r.setFont("helvetica", "normal"), r.setFontSize(i), r.text(e, t, n, {
			align: "center",
			baseline: "alphabetic"
		});
	};
	e.forEach((e, t) => {
		t > 0 && r.addPage("a4", "landscape");
		let n = k(e), l = j(n.length), u = (i - 16 - 6 * (l - 1)) / l, d = Math.ceil(n.length / l), f = (e) => {
			let t = 100 * e, n = 50 * e, r = t * 1.08 + (n > 0 ? n * 1.05 : 0) + 2;
			return d * r + 12 + 50 * e + 4;
		}, p = Math.min(1, (() => {
			let e = 1;
			for (let t of n) {
				let n = o(`${t.tour_name} (${t.count})`, 100);
				e = Math.min(e, u * .96 / n);
			}
			return Math.min(1, e);
		})()), m = f(p);
		m > a - 16 && (p *= (a - 16) / m);
		let h = 100 * p, g = 50 * p, _ = 1 * p, v = 50 * p, y = h * 1.08 + (g > 0 ? g * 1.05 : 0) + _ * 2, b = 8 + (a - 16 - d * y - v - 6) / 2;
		b < 8 && (b = 8);
		for (let e = 0; e < n.length; e++) {
			let t = e % l, r = Math.floor(e / l), i = 8 + t * (u + 6) + u / 2, a = b + r * y + h, o = n[e];
			s(`${o.tour_name} (${o.count})`, i, a, h);
			let d = ee(o.group_leader);
			d && c(d, i, a + h * .15 + g + _, g);
		}
		s(`PAX LIMIT: ${C(e.pax)}`, i / 2, a - 8 - 4, v);
	}), r.save(`Groups_${D()}.pdf`);
}
async function ne(e, t) {
	try {
		await Promise.all([t.loadScript(t.LIBS.docx), t.loadScript(t.LIBS.fileSaver)]);
	} catch {}
	let n = window;
	if (!(n.docx && n.saveAs)) throw Error("DOCX engine not loaded.");
	let { Document: r, Paragraph: i, TextRun: a, AlignmentType: o, PageOrientation: s, convertMillimetersToTwip: c } = n.docx, l = {
		size: {
			width: c(297),
			height: c(210),
			orientation: s.LANDSCAPE
		},
		margin: {
			top: c(8),
			right: c(8),
			bottom: c(8),
			left: c(8)
		}
	}, u = {
		tour: 44,
		leader: 22,
		pax: 26
	}, d = (e) => k(e).map((t) => ({
		...t,
		showLeader: !!e.showLeaderByKey[O(t)]
	}));
	function f(e, t) {
		if (e.length <= 1) return { ...u };
		let n = ((e) => e * 2.83464567)(194), r = 0, i = 0, a = 0;
		for (let t of e) i = Math.max(i, `${t.tour_name} (${t.count})`.length), r += 1, t.showLeader && (t.group_leader || "").trim() && (a = Math.max(a, t.group_leader.length), r += 1);
		t && (r += 1);
		let o = r * (u.tour * 1.08 * .5 + u.leader * 1.08 * .5), s = Math.min(1, n / Math.max(1, o)), c = Math.min(1, i ? 32 / i : 1, a ? 48 / a : 1), l = Math.max(.35, Math.min(s, c));
		return {
			tour: Math.round(u.tour * l),
			leader: Math.round(u.leader * l),
			pax: Math.round(u.pax * l)
		};
	}
	function p(e, t, n) {
		let r = [];
		for (let t of e) if (r.push(new i({
			alignment: o.CENTER,
			spacing: {
				before: 0,
				after: 0
			},
			children: [new a({
				text: `${t.tour_name} (${t.count})`,
				bold: !0,
				size: n.tour * 2
			})]
		})), t.showLeader && (t.group_leader || "").trim()) {
			let e = t.group_leader.charAt(0).toUpperCase() + t.group_leader.slice(1).toLowerCase();
			r.push(new i({
				alignment: o.CENTER,
				spacing: {
					before: 0,
					after: 0
				},
				children: [new a({
					text: e,
					size: n.leader * 2
				})]
			}));
		}
		return r.push(new i({
			text: "",
			spacing: {
				before: 0,
				after: 0
			}
		})), r.push(new i({
			alignment: o.CENTER,
			spacing: {
				before: 0,
				after: 0
			},
			children: [new a({
				text: `PAX LIMIT: ${Number(t || 0)}`,
				bold: !0,
				size: n.pax * 2
			})]
		})), r;
	}
	let m = [], h = e.filter((e) => (e.tours || []).length > 1);
	if (h.length) {
		let e = [];
		h.forEach((t, n) => {
			let r = d(t);
			n > 0 && e.push(new i({
				text: "",
				spacing: {
					before: 80,
					after: 80
				}
			})), e.push(...p(r, t.pax, f(r, !0)));
		}), m.push({
			properties: { page: l },
			children: e
		});
	}
	for (let t of e.filter((e) => (e.tours || []).length <= 1)) m.push({
		properties: { page: l },
		children: p(d(t), t.pax, { ...u })
	});
	let g = await n.docx.Packer.toBlob(new r({ sections: m }));
	n.saveAs(g, `Groups_${D()}.docx`);
}
// src/pages/group-export/GroupExportPage.tsx
var M = e(), N = (e) => String(e).padStart(2, "0"), P = (e, t) => {
	if (!e) return null;
	let [n, r, i] = e.split("-").map(Number), a = 0, o = 0;
	return t && /^\d{1,2}:\d{2}$/.test(t) && ([a, o] = t.split(":").map(Number)), new Date(n, (r || 1) - 1, i || 1, a || 0, o || 0, 0, 0);
}, F = (e, t, n) => {
	let r = new Set(e);
	return n ? r.add(t) : r.delete(t), r;
};
function I() {
	let e = a(), t = n(), i = r(), { ask: T, dialog: D } = y(), { ask: j, dialog: I } = b(), L = /* @__PURE__ */ new Date(), R = `${L.getFullYear()}-${N(L.getMonth() + 1)}-${N(L.getDate())}`, [z, re] = (0, S.useState)(R), [B, ie] = (0, S.useState)(R), [V, ae] = (0, S.useState)(""), [H, oe] = (0, S.useState)(""), [U, se] = (0, S.useState)(""), [W, ce] = (0, S.useState)([]), [le, ue] = (0, S.useState)(!1), [G, K] = (0, S.useState)(/* @__PURE__ */ new Set()), [q, J] = (0, S.useState)([]), [Y, X] = (0, S.useState)(/* @__PURE__ */ new Set()), [de, Z] = (0, S.useState)({ text: "" }), [Q, fe] = (0, S.useState)(""), $ = (e, t = !0) => Z({
		text: e,
		bad: t
	});
	async function pe() {
		if (!z || !B) {
			$("Pick a date range.");
			return;
		}
		let n = await t(e.all()), r = P(z, V || "00:00"), i = P(B, H || "23:59"), a = w(U), o = n.filter((e) => {
			let t = P(e.checkin_date, e.checkin_time);
			return !!t && t >= r && t <= i;
		}).filter((e) => !a || w(e.building) === a).map((e) => ({
			tour_name: w(e.tour_name),
			group_leader: w(e.group_leader),
			sh_no: w(e.sh_no),
			checkin_date: e.checkin_date || "",
			checkin_time: e.checkin_time || "",
			building: w(e.building),
			total: C(e.total)
		})).sort((e, t) => (e.checkin_date + e.checkin_time).localeCompare(t.checkin_date + t.checkin_time));
		ce(o), K(/* @__PURE__ */ new Set()), ue(!0), Z({ text: "" });
	}
	let me = () => W.filter((e, t) => G.has(t)), he = () => {
		let e = me();
		e.length ? (J((t) => [...t, ...e.map((e) => A([e]))]), Z({ text: "" })) : $("Select arrivals first.");
	}, ge = () => {
		let e = me();
		e.length < 2 ? $("Select at least two arrivals to bundle.") : (J((t) => [...t, A(e)]), Z({ text: "" }));
	};
	function _e() {
		let e = q.filter((e) => Y.has(e.id));
		if (e.length < 2) {
			$("Pick at least two slots.");
			return;
		}
		let t = {
			id: E(),
			tours: e.flatMap((e) => e.tours),
			pax: e.reduce((e, t) => e + C(t.pax), 0),
			showLeaderByKey: {}
		};
		t.showLeaderByKey = A(t.tours).showLeaderByKey;
		for (let n of e) for (let e in n.showLeaderByKey) n.showLeaderByKey[e] && (t.showLeaderByKey[e] = !0);
		J((e) => [...e.filter((e) => !Y.has(e.id)), t]), X(/* @__PURE__ */ new Set()), Z({ text: "" });
	}
	async function ve(e) {
		let t = C(e.pax), n = await j({
			title: "Split slot",
			body: `Total ${t}. Enter first half pax:`,
			value: String(Math.floor(t / 2)),
			type: "number"
		});
		if (n == null) return;
		let r = Math.max(0, C(n)), i = Math.max(0, t - r), a = (t) => ({
			id: E(),
			tours: JSON.parse(JSON.stringify(e.tours)),
			pax: t,
			showLeaderByKey: { ...e.showLeaderByKey }
		});
		J((t) => {
			let n = t.indexOf(e);
			return n < 0 ? t : [
				...t.slice(0, n),
				a(r),
				a(i),
				...t.slice(n + 1)
			];
		});
	}
	async function ye() {
		await T({
			title: "Clear the list?",
			confirmLabel: "Clear",
			body: "Clear the assignment list?"
		}) && (J([]), X(/* @__PURE__ */ new Set()));
	}
	async function be(e) {
		if (!q.length) $("Add or bundle something first.");
		else {
			fe(e);
			try {
				let t = await i("lib");
				await (e === "pdf" ? te(q, t) : ne(q, t)), Z({ text: "" });
			} catch (e) {
				$(e?.message || String(e));
			} finally {
				fe("");
			}
		}
	}
	return /* @__PURE__ */ (0, M.jsxs)("div", {
		className: "mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4",
		children: [
			/* @__PURE__ */ (0, M.jsx)("h1", {
				className: "text-2xl font-bold text-primary",
				children: "Fakkul Ehraam Groups — PDF / DOCX"
			}),
			/* @__PURE__ */ (0, M.jsx)(d, { children: /* @__PURE__ */ (0, M.jsxs)(u, {
				className: "grid gap-3",
				children: [/* @__PURE__ */ (0, M.jsxs)("div", {
					className: "grid grid-cols-2 items-end gap-3 sm:grid-cols-3 lg:grid-cols-6",
					children: [
						/* @__PURE__ */ (0, M.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, M.jsx)(s, {
								htmlFor: "dateFrom",
								children: "Arrivals from"
							}), /* @__PURE__ */ (0, M.jsx)(f, {
								id: "dateFrom",
								type: "date",
								value: z,
								onChange: (e) => re(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, M.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, M.jsx)(s, {
								htmlFor: "dateTo",
								children: "Arrivals to"
							}), /* @__PURE__ */ (0, M.jsx)(f, {
								id: "dateTo",
								type: "date",
								value: B,
								onChange: (e) => ie(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, M.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, M.jsx)(s, {
								htmlFor: "timeFrom",
								children: "Time from"
							}), /* @__PURE__ */ (0, M.jsx)(f, {
								id: "timeFrom",
								type: "time",
								value: V,
								onChange: (e) => ae(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, M.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, M.jsx)(s, {
								htmlFor: "timeTo",
								children: "Time to"
							}), /* @__PURE__ */ (0, M.jsx)(f, {
								id: "timeTo",
								type: "time",
								value: H,
								onChange: (e) => oe(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, M.jsxs)("div", {
							className: "col-span-2 grid gap-1 sm:col-span-1",
							children: [/* @__PURE__ */ (0, M.jsx)(s, {
								htmlFor: "building",
								children: "Building"
							}), /* @__PURE__ */ (0, M.jsx)(f, {
								id: "building",
								placeholder: "exact match or blank",
								value: U,
								onChange: (e) => se(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, M.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, M.jsx)(l, {
								onClick: () => void pe(),
								children: "Load arrivals"
							}), /* @__PURE__ */ (0, M.jsxs)(x, {
								variant: "secondary",
								children: [W.length, " found"]
							})]
						})
					]
				}), le && W.length > 0 && /* @__PURE__ */ (0, M.jsxs)(M.Fragment, { children: [/* @__PURE__ */ (0, M.jsx)("div", {
					className: "max-h-96 overflow-auto rounded-lg border",
					children: /* @__PURE__ */ (0, M.jsxs)(v, { children: [/* @__PURE__ */ (0, M.jsx)(h, { children: /* @__PURE__ */ (0, M.jsxs)(_, { children: [
						/* @__PURE__ */ (0, M.jsx)(p, { children: /* @__PURE__ */ (0, M.jsx)(o, {
							"aria-label": "Select all arrivals",
							checked: G.size === W.length,
							onCheckedChange: (e) => K(e === !0 ? new Set(W.map((e, t) => t)) : /* @__PURE__ */ new Set())
						}) }),
						/* @__PURE__ */ (0, M.jsx)(p, { children: "Tour Name" }),
						/* @__PURE__ */ (0, M.jsx)(p, { children: "Leader" }),
						/* @__PURE__ */ (0, M.jsx)(p, { children: "SH" }),
						/* @__PURE__ */ (0, M.jsx)(p, { children: "Check-in" }),
						/* @__PURE__ */ (0, M.jsx)(p, { children: "Building" }),
						/* @__PURE__ */ (0, M.jsx)(p, {
							className: "text-right",
							children: "Total"
						}),
						/* @__PURE__ */ (0, M.jsx)(p, { children: "Add" })
					] }) }), /* @__PURE__ */ (0, M.jsx)(m, { children: W.map((e, t) => /* @__PURE__ */ (0, M.jsxs)(_, { children: [
						/* @__PURE__ */ (0, M.jsx)(g, { children: /* @__PURE__ */ (0, M.jsx)(o, {
							"aria-label": `Select SH ${e.sh_no}`,
							checked: G.has(t),
							onCheckedChange: (e) => K((n) => F(n, t, e === !0))
						}) }),
						/* @__PURE__ */ (0, M.jsx)(g, { children: e.tour_name }),
						/* @__PURE__ */ (0, M.jsx)(g, { children: e.group_leader }),
						/* @__PURE__ */ (0, M.jsx)(g, { children: e.sh_no }),
						/* @__PURE__ */ (0, M.jsxs)(g, {
							className: "whitespace-nowrap",
							children: [
								e.checkin_date,
								" ",
								/* @__PURE__ */ (0, M.jsx)("small", {
									className: "text-muted-foreground",
									children: e.checkin_time
								})
							]
						}),
						/* @__PURE__ */ (0, M.jsx)(g, { children: e.building }),
						/* @__PURE__ */ (0, M.jsx)(g, {
							className: "text-right",
							children: e.total
						}),
						/* @__PURE__ */ (0, M.jsx)(g, { children: /* @__PURE__ */ (0, M.jsx)(l, {
							size: "sm",
							variant: "outline",
							onClick: () => J((t) => [...t, A([e])]),
							children: "Add"
						}) })
					] }, t)) })] })
				}), /* @__PURE__ */ (0, M.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, M.jsx)(l, {
						variant: "outline",
						onClick: he,
						children: "Add selected"
					}), /* @__PURE__ */ (0, M.jsx)(l, {
						variant: "outline",
						onClick: ge,
						children: "Bundle selected"
					})]
				})] })]
			}) }),
			/* @__PURE__ */ (0, M.jsx)(d, { children: /* @__PURE__ */ (0, M.jsxs)(u, {
				className: "grid gap-3",
				children: [/* @__PURE__ */ (0, M.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, M.jsx)(l, {
							variant: "outline",
							onClick: _e,
							children: "Bundle selected from list"
						}),
						/* @__PURE__ */ (0, M.jsx)(l, {
							variant: "outline",
							onClick: () => void ye(),
							children: "Clear"
						}),
						/* @__PURE__ */ (0, M.jsxs)(l, {
							disabled: !!Q,
							onClick: () => void be("pdf"),
							children: [/* @__PURE__ */ (0, M.jsx)(c, { className: "size-4" }), "Download PDF"]
						}),
						/* @__PURE__ */ (0, M.jsxs)(l, {
							disabled: !!Q,
							onClick: () => void be("docx"),
							children: [/* @__PURE__ */ (0, M.jsx)(c, { className: "size-4" }), "Download DOCX"]
						}),
						/* @__PURE__ */ (0, M.jsxs)(x, {
							variant: "secondary",
							children: [
								q.length,
								" slot",
								q.length === 1 ? "" : "s"
							]
						}),
						Q && /* @__PURE__ */ (0, M.jsxs)("span", {
							className: "text-sm text-muted-foreground",
							children: [
								"Making the ",
								Q.toUpperCase(),
								"…"
							]
						}),
						de.text && /* @__PURE__ */ (0, M.jsx)("span", {
							role: "status",
							className: "text-sm font-semibold text-destructive",
							children: de.text
						})
					]
				}), /* @__PURE__ */ (0, M.jsx)("div", {
					className: "overflow-x-auto rounded-lg border",
					children: /* @__PURE__ */ (0, M.jsxs)(v, { children: [/* @__PURE__ */ (0, M.jsx)(h, { children: /* @__PURE__ */ (0, M.jsxs)(_, { children: [
						/* @__PURE__ */ (0, M.jsx)(p, {
							className: "w-11",
							children: /* @__PURE__ */ (0, M.jsx)(o, {
								"aria-label": "Select all slots",
								checked: Y.size === q.length && q.length > 0,
								onCheckedChange: (e) => X(e === !0 ? new Set(q.map((e) => e.id)) : /* @__PURE__ */ new Set())
							})
						}),
						/* @__PURE__ */ (0, M.jsx)(p, { children: "Tour & Leader" }),
						/* @__PURE__ */ (0, M.jsx)(p, {
							className: "w-32",
							children: "Pax limit"
						}),
						/* @__PURE__ */ (0, M.jsx)(p, {
							className: "w-44",
							children: "Tools"
						})
					] }) }), /* @__PURE__ */ (0, M.jsx)(m, { children: q.length ? q.map((e) => /* @__PURE__ */ (0, M.jsxs)(_, { children: [
						/* @__PURE__ */ (0, M.jsx)(g, { children: /* @__PURE__ */ (0, M.jsx)(o, {
							"aria-label": "Pick slot",
							checked: Y.has(e.id),
							onCheckedChange: (t) => X((n) => F(n, e.id, t === !0))
						}) }),
						/* @__PURE__ */ (0, M.jsx)(g, { children: k(e).map((t) => {
							let n = O(t), r = ee(t.group_leader);
							return /* @__PURE__ */ (0, M.jsxs)("div", {
								className: "mb-1.5",
								children: [/* @__PURE__ */ (0, M.jsxs)("div", {
									className: "font-bold",
									children: [
										t.tour_name,
										" ",
										/* @__PURE__ */ (0, M.jsxs)("span", {
											className: "font-normal opacity-75",
											children: [
												"(",
												t.count,
												")"
											]
										})
									]
								}), r && /* @__PURE__ */ (0, M.jsxs)("label", {
									className: "mt-0.5 flex items-center gap-2 text-xs text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, M.jsx)(o, {
											checked: !!e.showLeaderByKey[n],
											onCheckedChange: (t) => J((r) => r.map((r) => r.id === e.id ? {
												...r,
												showLeaderByKey: {
													...r.showLeaderByKey,
													[n]: t === !0
												}
											} : r))
										}),
										r,
										" ",
										/* @__PURE__ */ (0, M.jsx)("span", {
											className: "opacity-70",
											children: "(show in DOCX)"
										})
									]
								})]
							}, n);
						}) }),
						/* @__PURE__ */ (0, M.jsx)(g, { children: /* @__PURE__ */ (0, M.jsx)(f, {
							type: "number",
							min: 0,
							className: "w-24",
							value: C(e.pax),
							onChange: (t) => {
								let n = Math.max(0, C(t.target.value));
								J((t) => t.map((t) => t.id === e.id ? {
									...t,
									pax: n
								} : t));
							}
						}) }),
						/* @__PURE__ */ (0, M.jsxs)(g, {
							className: "whitespace-nowrap",
							children: [/* @__PURE__ */ (0, M.jsx)(l, {
								variant: "ghost",
								size: "sm",
								onClick: () => void ve(e),
								children: "Split"
							}), /* @__PURE__ */ (0, M.jsx)(l, {
								variant: "ghost",
								size: "sm",
								onClick: () => J((t) => t.filter((t) => t.id !== e.id)),
								children: "Remove"
							})]
						})
					] }, e.id)) : /* @__PURE__ */ (0, M.jsx)(_, { children: /* @__PURE__ */ (0, M.jsx)(g, {
						colSpan: 4,
						className: "text-muted-foreground",
						children: "Load arrivals and add them — each slot becomes a sheet."
					}) }) })] })
				})]
			}) }),
			D,
			I
		]
	});
}
export { I as default };
