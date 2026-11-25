import { f as e, h as t, n, o as r, p as i, u as a } from "./PmsContext-BVMd13Oi.js";
import { t as o } from "./checkbox-C3tIiLfF.js";
import { t as s } from "./label-CMEyi--P.js";
import { t as c } from "./image-down-DIpmmZZM.js";
import { t as l } from "./printer-_t2PY0au.js";
import { n as u } from "./dist-BCHtOhmx.js";
import { t as d } from "./button-BGWa3SLr.js";
import { i as f, n as p, r as m, t as h } from "./card-B9_OGomP.js";
import { t as g } from "./input-DSBk_UeU.js";
import { t as _ } from "./utils-b7UP9Cmo.js";
import { t as ee } from "./useSlips-DUKbzGma.js";
// src/pages/mawaid/mawaid.ts
var v = /* @__PURE__ */ t(i(), 1);
function y(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) t = t * 31 + e.charCodeAt(n) >>> 0;
	return `hsl(${t % 360} 70% 35%)`;
}
function te(e, t) {
	let n = /* @__PURE__ */ new Set([
		"BAHA",
		"HUSN",
		"MOHAMMEDI",
		"MUFADDAL"
	]), r = new Map(e.rows.map((e) => [e.building, e])), i = e.rows.filter((e) => !n.has(e.building)).map((e) => JSON.parse(JSON.stringify(e))), a = [
		"BAHA",
		"HUSN",
		"MOHAMMEDI",
		"MUFADDAL"
	].map((e) => r.get(e)).filter(Boolean);
	if (a.length) {
		let e = (e) => a.reduce((t, n) => t + e(n), 0), t = (t) => ({
			g: e((e) => e[t].g),
			l: e((e) => e[t].l),
			c: e((e) => e[t].c),
			i: e((e) => e[t].i)
		});
		i.push({
			building: "BAHA+HUSN+MOHAMMEDI+MUFADDAL",
			bp: e((e) => e.bp),
			lp: e((e) => e.lp),
			dp: e((e) => e.dp),
			bt: 0,
			lt: 0,
			dt: 0,
			b: t("b"),
			l: t("l"),
			d: t("d")
		});
	}
	for (let e of i) e.bt = Math.ceil(e.bp / t), e.lt = Math.ceil(e.lp / t), e.dt = Math.ceil(e.dp / t);
	return {
		rows: i,
		totals: i.reduce((e, t) => (e.tBP += t.bp, e.tLP += t.lp, e.tDP += t.dp, e.tBT += t.bt, e.tLT += t.lt, e.tDT += t.dt, e), {
			tBP: 0,
			tLP: 0,
			tDP: 0,
			tBT: 0,
			tLT: 0,
			tDT: 0
		})
	};
}
function b(e, t, n) {
	let r = [{
		name: "MUFADDAL+MOHAMMEDI",
		members: ["MUFADDAL", "MOHAMMEDI"]
	}, {
		name: "HUSN+BAHA",
		members: ["HUSN", "BAHA"]
	}], i = new Set(r.flatMap((e) => e.members)), a = new Map(e.rows.map((e) => [e.building, e])), o = [];
	for (let r of e.rows) i.has(r.building) || o.push({
		building: r.building,
		ltx: Math.round((r.lt || 0) * t),
		dtx: Math.round((r.dt || 0) * n)
	});
	for (let e of r) {
		let r = e.members.map((e) => a.get(e)).filter(Boolean);
		r.length && o.push({
			building: e.name,
			ltx: Math.round(r.reduce((e, t) => e + (t.lt || 0), 0) * t),
			dtx: Math.round(r.reduce((e, t) => e + (t.dt || 0), 0) * n)
		});
	}
	return {
		rows: o,
		totals: o.reduce((e, t) => ({
			ltx: e.ltx + t.ltx,
			dtx: e.dtx + t.dtx
		}), {
			ltx: 0,
			dtx: 0
		})
	};
}
// src/pages/mawaid/MawaidPage.tsx
var x = e(), S = (e) => String(e).padStart(2, "0"), C = {
	B: "bg-[#fff8e6]",
	L: "bg-[#eaf9ff]",
	D: "bg-[#f3e9ff]"
}, w = {
	B: "Breakfast",
	L: "Lunch",
	D: "Dinner"
};
function T({ stats: e, show: t, tableRef: n, id: r }) {
	let i = [
		t.p && "Pax",
		"Thals",
		t.g && "Gents",
		t.l && "Ladies",
		t.c && "Children",
		t.i && "Infants"
	].filter(Boolean), a = (t) => e.rows.reduce((e, n) => e + t(n), 0), o = (e, n) => {
		let r = e[n.toLowerCase()], a = n === "B" ? e.bp : n === "L" ? e.lp : e.dp, o = n === "B" ? e.bt : n === "L" ? e.lt : e.dt;
		return [
			t.p && a,
			o,
			t.g && r.g,
			t.l && r.l,
			t.c && r.c,
			t.i && r.i
		].map((e, r) => e === !1 ? null : /* @__PURE__ */ (0, x.jsx)("td", {
			className: _("border px-2 py-1.5 text-center", C[n], i[[
				t.p,
				!0,
				t.g,
				t.l,
				t.c,
				t.i
			].slice(0, r + 1).filter(Boolean).length - 1] === "Thals" && "font-bold"),
			children: e
		}, `${n}${r}`));
	}, s = e.unassigned, c = e.totals, l = (e, t) => ({
		g: t.g + s[e].g,
		l: t.l + s[e].l,
		c: t.c + s[e].c,
		i: t.i + s[e].i
	}), u = (e) => l(e, {
		g: a((t) => t[e].g),
		l: a((t) => t[e].l),
		c: a((t) => t[e].c),
		i: a((t) => t[e].i)
	}), d = s ? {
		building: "Total with them",
		bp: c.tBP + s.bp,
		lp: c.tLP + s.lp,
		dp: c.tDP + s.dp,
		bt: Math.ceil((c.tBP + s.bp) / s.thal),
		lt: Math.ceil((c.tLP + s.lp) / s.thal),
		dt: Math.ceil((c.tDP + s.dp) / s.thal),
		b: u("b"),
		l: u("l"),
		d: u("d")
	} : null, f = (n) => {
		let r = e.totals, i = n.toLowerCase();
		return [
			t.p && (n === "B" ? r.tBP : n === "L" ? r.tLP : r.tDP),
			n === "B" ? r.tBT : n === "L" ? r.tLT : r.tDT,
			t.g && a((e) => e[i].g),
			t.l && a((e) => e[i].l),
			t.c && a((e) => e[i].c),
			t.i && a((e) => e[i].i)
		].map((e, t) => e === !1 ? null : /* @__PURE__ */ (0, x.jsx)("td", {
			className: _("border px-2 py-1.5 text-center font-bold", C[n]),
			children: e
		}, `${n}${t}`));
	};
	return /* @__PURE__ */ (0, x.jsx)("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ (0, x.jsxs)("table", {
			id: r,
			ref: n,
			className: "w-full text-sm",
			children: [
				/* @__PURE__ */ (0, x.jsxs)("thead", { children: [/* @__PURE__ */ (0, x.jsxs)("tr", {
					className: "bg-[#f3e6ca]",
					children: [/* @__PURE__ */ (0, x.jsx)("th", {
						rowSpan: 2,
						className: "border px-2 py-1.5",
						children: "Building"
					}), [
						"B",
						"L",
						"D"
					].map((e) => /* @__PURE__ */ (0, x.jsx)("th", {
						colSpan: i.length,
						className: _("border px-2 py-1.5", C[e]),
						children: w[e]
					}, e))]
				}), /* @__PURE__ */ (0, x.jsx)("tr", {
					className: "bg-[#f3e6ca]",
					children: [
						"B",
						"L",
						"D"
					].flatMap((e) => i.map((t) => /* @__PURE__ */ (0, x.jsx)("th", {
						className: _("border px-2 py-1.5 text-xs", C[e]),
						children: t
					}, e + t)))
				})] }),
				/* @__PURE__ */ (0, x.jsx)("tbody", { children: e.rows.map((e) => /* @__PURE__ */ (0, x.jsxs)("tr", {
					style: { color: y(e.building) },
					children: [
						/* @__PURE__ */ (0, x.jsx)("td", {
							className: "border px-2 py-1.5 text-left font-bold",
							children: e.building
						}),
						o(e, "B"),
						o(e, "L"),
						o(e, "D")
					]
				}, e.building)) }),
				/* @__PURE__ */ (0, x.jsxs)("tfoot", { children: [/* @__PURE__ */ (0, x.jsxs)("tr", {
					className: "bg-[#fbf2dc] font-bold",
					children: [
						/* @__PURE__ */ (0, x.jsx)("td", {
							className: "border px-2 py-1.5",
							children: "Total"
						}),
						f("B"),
						f("L"),
						f("D")
					]
				}), d && /* @__PURE__ */ (0, x.jsxs)(x.Fragment, { children: [/* @__PURE__ */ (0, x.jsxs)("tr", {
					className: "text-destructive",
					children: [
						/* @__PURE__ */ (0, x.jsx)("td", {
							className: "border px-2 py-1.5 text-left font-bold",
							title: "Slips in house at this meal that have no building yet — not in the rows or the Total above",
							children: "No building yet"
						}),
						o(s, "B"),
						o(s, "L"),
						o(s, "D")
					]
				}), /* @__PURE__ */ (0, x.jsxs)("tr", {
					className: "bg-[#fbf2dc] font-bold",
					children: [
						/* @__PURE__ */ (0, x.jsx)("td", {
							className: "border px-2 py-1.5",
							children: "Total with them"
						}),
						o(d, "B"),
						o(d, "L"),
						o(d, "D")
					]
				})] })] })
			]
		})
	});
}
function E() {
	let { cloud: e } = n(), t = r(), { site: i, siteId: w } = a(), E = ee(6e4), [D, O] = (0, v.useState)(null);
	(0, v.useEffect)(() => {
		t("meals").then(O);
	}, []);
	let k = /* @__PURE__ */ new Date(), [A, ne] = (0, v.useState)(`${k.getFullYear()}-${S(k.getMonth() + 1)}-${S(k.getDate())}`), [j, M] = (0, v.useState)({
		bS: "04:00",
		bE: "09:30",
		lS: "11:00",
		lE: "16:00",
		dS: "18:00",
		dE: "23:00"
	}), [N, re] = (0, v.useState)("8"), [P, ie] = (0, v.useState)(!0), [F, ae] = (0, v.useState)(w === "medina"), [I, L] = (0, v.useState)(!1), [R, z] = (0, v.useState)("3"), [B, V] = (0, v.useState)("2.5"), [H, oe] = (0, v.useState)({
		p: !1,
		g: !1,
		l: !1,
		c: !1,
		i: !1
	}), U = (0, v.useRef)(null), W = (0, v.useRef)(null), G = (0, v.useRef)(null), [se, K] = (0, v.useState)(""), q = `pms_mawaid_hidden:${w}`, [J, Y] = (0, v.useState)(() => {
		try {
			return JSON.parse(localStorage.getItem(q) || "[]");
		} catch {
			return [];
		}
	}), [X, ce] = (0, v.useState)(!1), le = (e) => Y((t) => {
		let n = t.includes(e) ? t.filter((t) => t !== e) : [...t, e];
		try {
			localStorage.setItem(q, JSON.stringify(n));
		} catch {}
		return n;
	}), Z = (0, v.useMemo)(() => {
		if (!D || !E.data) return null;
		let e = Math.max(1, Number(N) || 8), t = {
			B: {
				start: j.bS || "04:00",
				end: j.bE || "09:30"
			},
			L: {
				start: j.lS || "11:00",
				end: j.lE || "16:00"
			},
			D: {
				start: j.dS || "18:00",
				end: j.dE || "23:00"
			}
		}, n = D.computeByBuilding(E.data, A, t, e, P, F, I);
		if (!n) return { error: "Check your start/end times; end must be after start for each meal." };
		let r = n.rows.map((e) => e.building), i = {
			...n,
			rows: n.rows.filter((e) => !J.includes(e.building))
		};
		return {
			main: {
				...D.buildFirstMerged(i, e),
				unassigned: n.unassigned
			},
			cook: te(i, e),
			manda: b(i, Number(R) || 3, Number(B) || 2.5),
			names: r
		};
	}, [
		D,
		E.data,
		A,
		j,
		N,
		P,
		F,
		I,
		R,
		B,
		J
	]), ue = () => {
		let e = U.current;
		if (!e) return;
		let t = ["Building", ...[
			"B",
			"L",
			"D"
		].flatMap((e) => [
			H.p && `${e}:Pax`,
			`${e}:Thals`,
			H.g && `${e}:Gents`,
			H.l && `${e}:Ladies`,
			H.c && `${e}:Children`,
			H.i && `${e}:Infants`
		].filter(Boolean))], n = [...e.querySelectorAll("tbody tr, tfoot tr")].map((e) => [...e.children].map((e) => (e.textContent || "").replace(/,/g, "")).join(",")), r = document.createElement("a");
		r.href = URL.createObjectURL(new Blob([[t.join(","), ...n].join("\n")], { type: "text/csv;charset=utf-8;" })), r.download = `mawaid_${A || "date"}.csv`, r.click(), URL.revokeObjectURL(r.href);
	};
	async function Q(e, n, r) {
		if (!e.current) K("Nothing to copy yet.");
		else try {
			let a = await (await t("table-image")).copyTableImage(e.current, `${n} · ${i.label}${A ? " · " + A.split("-").reverse().join("/") : ""}`, `${r}-${A}.png`);
			u(a === "copied" ? `${n} copied — paste it into the chat.` : "This browser cannot copy pictures — the image was downloaded instead.");
		} catch (e) {
			K("Could not make the image: " + (e?.message || e));
		}
	}
	let $ = (e, t) => /* @__PURE__ */ (0, x.jsxs)("div", {
		className: "grid gap-1",
		children: [/* @__PURE__ */ (0, x.jsx)(s, {
			htmlFor: `t-${e}`,
			children: t
		}), /* @__PURE__ */ (0, x.jsx)(g, {
			id: `t-${e}`,
			type: "time",
			value: j[e],
			onChange: (t) => M((n) => ({
				...n,
				[e]: t.target.value
			}))
		})]
	});
	return /* @__PURE__ */ (0, x.jsxs)("div", {
		className: "mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4",
		children: [
			/* @__PURE__ */ (0, x.jsxs)("header", { children: [/* @__PURE__ */ (0, x.jsx)("h1", {
				className: "text-2xl font-bold text-primary",
				children: "Mawaid Counts"
			}), /* @__PURE__ */ (0, x.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [i.label, " · a guest counts for a meal when their stay overlaps the meal time. Thals = pax ÷ thal size, rounded up."]
			})] }),
			/* @__PURE__ */ (0, x.jsx)(h, {
				className: "print:hidden",
				children: /* @__PURE__ */ (0, x.jsxs)(p, {
					className: "grid gap-4",
					children: [
						/* @__PURE__ */ (0, x.jsxs)("div", {
							className: "grid grid-cols-2 items-end gap-3 sm:grid-cols-4 lg:grid-cols-6",
							children: [
								/* @__PURE__ */ (0, x.jsxs)("div", {
									className: "col-span-2 grid gap-1",
									children: [/* @__PURE__ */ (0, x.jsx)(s, {
										htmlFor: "statDate",
										children: "Select date"
									}), /* @__PURE__ */ (0, x.jsx)(g, {
										id: "statDate",
										type: "date",
										value: A,
										onChange: (e) => ne(e.target.value)
									})]
								}),
								$("bS", "Breakfast start"),
								$("bE", "Breakfast end"),
								$("lS", "Lunch start"),
								$("lE", "Lunch end"),
								$("dS", "Dinner start"),
								$("dE", "Dinner end"),
								/* @__PURE__ */ (0, x.jsxs)("div", {
									className: "grid gap-1",
									children: [/* @__PURE__ */ (0, x.jsx)(s, {
										htmlFor: "thalSize",
										children: "Thal size"
									}), /* @__PURE__ */ (0, x.jsx)(g, {
										id: "thalSize",
										type: "number",
										min: 1,
										step: 1,
										value: N,
										onChange: (e) => re(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, x.jsxs)("div", {
									className: "grid gap-1",
									children: [/* @__PURE__ */ (0, x.jsx)(s, {
										htmlFor: "multL",
										children: "Manda: Lunch thal ×"
									}), /* @__PURE__ */ (0, x.jsx)(g, {
										id: "multL",
										type: "number",
										step: .1,
										value: R,
										onChange: (e) => z(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, x.jsxs)("div", {
									className: "grid gap-1",
									children: [/* @__PURE__ */ (0, x.jsx)(s, {
										htmlFor: "multD",
										children: "Manda: Dinner thal ×"
									}), /* @__PURE__ */ (0, x.jsx)(g, {
										id: "multD",
										type: "number",
										step: .1,
										value: B,
										onChange: (e) => V(e.target.value)
									})]
								})
							]
						}),
						Z && "names" in Z && /* @__PURE__ */ (0, x.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, x.jsxs)("button", {
								type: "button",
								className: "w-fit text-sm font-semibold underline-offset-2 hover:underline",
								"aria-expanded": X,
								onClick: () => ce((e) => !e),
								children: [
									"🏨 Buildings shown: ",
									Z.names.filter((e) => !J.includes(e)).length,
									" of ",
									Z.names.length,
									J.length ? ` · hidden: ${J.join(", ")}` : "",
									" ",
									X ? "▴" : "▾"
								]
							}), X && /* @__PURE__ */ (0, x.jsxs)("div", {
								className: "flex flex-wrap gap-x-5 gap-y-2 text-sm",
								children: [[.../* @__PURE__ */ new Set([...Z.names, ...J])].map((e) => /* @__PURE__ */ (0, x.jsxs)("label", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, x.jsx)(o, {
										checked: !J.includes(e),
										onCheckedChange: () => le(e)
									}), e]
								}, e)), J.length > 0 && /* @__PURE__ */ (0, x.jsx)("button", {
									type: "button",
									className: "text-primary underline",
									onClick: () => {
										Y([]);
										try {
											localStorage.removeItem(q);
										} catch {}
									},
									children: "Show all"
								})]
							})]
						}),
						/* @__PURE__ */ (0, x.jsxs)("div", {
							className: "flex flex-wrap gap-x-8 gap-y-3",
							children: [/* @__PURE__ */ (0, x.jsxs)("div", {
								className: "grid gap-1.5",
								children: [/* @__PURE__ */ (0, x.jsx)("b", {
									className: "text-sm",
									children: "Include in Pax totals"
								}), /* @__PURE__ */ (0, x.jsx)("div", {
									className: "flex flex-wrap gap-4 text-sm",
									children: [
										[
											"Adults",
											P,
											ie
										],
										[
											"Children",
											F,
											ae
										],
										[
											"Infants",
											I,
											L
										]
									].map(([e, t, n]) => /* @__PURE__ */ (0, x.jsxs)("label", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, x.jsx)(o, {
											checked: t,
											onCheckedChange: (e) => n(e === !0)
										}), e]
									}, e))
								})]
							}), /* @__PURE__ */ (0, x.jsxs)("div", {
								className: "grid gap-1.5",
								children: [/* @__PURE__ */ (0, x.jsx)("b", {
									className: "text-sm",
									children: "Show breakdown columns"
								}), /* @__PURE__ */ (0, x.jsx)("div", {
									className: "flex flex-wrap gap-4 text-sm",
									children: [
										["p", "Pax"],
										["g", "Gents"],
										["l", "Ladies"],
										["c", "Children"],
										["i", "Infants"]
									].map(([e, t]) => /* @__PURE__ */ (0, x.jsxs)("label", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, x.jsx)(o, {
											checked: H[e],
											onCheckedChange: (t) => oe((n) => ({
												...n,
												[e]: t === !0
											}))
										}), t]
									}, e))
								})]
							})]
						}),
						/* @__PURE__ */ (0, x.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, x.jsx)(d, {
									onClick: () => void E.refetch().then(() => K(`${E.data?.length ?? 0} ${i.label} slip(s).`)),
									children: "Refresh data"
								}),
								/* @__PURE__ */ (0, x.jsxs)(d, {
									variant: "outline",
									onClick: () => window.print(),
									children: [/* @__PURE__ */ (0, x.jsx)(l, { className: "size-4" }), "Print"]
								}),
								/* @__PURE__ */ (0, x.jsx)(d, {
									variant: "outline",
									onClick: ue,
									children: "Export CSV"
								}),
								/* @__PURE__ */ (0, x.jsxs)(d, {
									variant: "outline",
									title: "Put the table on the clipboard as a picture",
									onClick: () => void Q(U, "Mawaid counts", "tbl"),
									children: [/* @__PURE__ */ (0, x.jsx)(c, { className: "size-4" }), "Copy image"]
								})
							]
						})
					]
				})
			}),
			!Z && /* @__PURE__ */ (0, x.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Loading…"
			}),
			Z && "error" in Z && /* @__PURE__ */ (0, x.jsx)("p", {
				role: "alert",
				className: "font-semibold text-destructive",
				children: Z.error
			}),
			Z && "main" in Z && /* @__PURE__ */ (0, x.jsxs)(x.Fragment, { children: [
				/* @__PURE__ */ (0, x.jsx)(h, {
					className: "gap-0 py-0",
					children: /* @__PURE__ */ (0, x.jsx)(p, {
						className: "p-0",
						children: /* @__PURE__ */ (0, x.jsx)(T, {
							stats: Z.main,
							show: H,
							tableRef: U,
							id: "tbl"
						})
					})
				}),
				/* @__PURE__ */ (0, x.jsxs)(h, {
					className: "gap-0 py-0",
					children: [/* @__PURE__ */ (0, x.jsxs)(m, {
						className: "flex-row flex-wrap items-center justify-between border-b py-3",
						children: [/* @__PURE__ */ (0, x.jsxs)(f, {
							className: "text-base",
							children: ["Cooking Count ", /* @__PURE__ */ (0, x.jsx)("span", {
								className: "ml-1 text-xs font-normal text-muted-foreground",
								children: "• HUSN+BAHA merged. Lunch & Dinner also merge MUFADDAL+MOHAMMEDI."
							})]
						}), /* @__PURE__ */ (0, x.jsx)(d, {
							size: "sm",
							variant: "outline",
							className: "print:hidden",
							onClick: () => void Q(W, "Cooking count", "tblCook"),
							children: "Copy image"
						})]
					}), /* @__PURE__ */ (0, x.jsx)(p, {
						className: "p-0",
						children: /* @__PURE__ */ (0, x.jsx)(T, {
							stats: Z.cook,
							show: H,
							tableRef: W,
							id: "tblCook"
						})
					})]
				}),
				/* @__PURE__ */ (0, x.jsxs)(h, {
					className: "gap-0 py-0",
					children: [/* @__PURE__ */ (0, x.jsxs)(m, {
						className: "flex-row flex-wrap items-center justify-between border-b py-3",
						children: [/* @__PURE__ */ (0, x.jsxs)(f, {
							className: "text-base",
							children: ["Manda Counts ", /* @__PURE__ */ (0, x.jsx)("span", {
								className: "ml-1 text-xs font-normal text-muted-foreground",
								children: "• Only Lunch & Dinner thals. Multipliers applied."
							})]
						}), /* @__PURE__ */ (0, x.jsx)(d, {
							size: "sm",
							variant: "outline",
							className: "print:hidden",
							onClick: () => void Q(G, "Manda counts", "tblManda"),
							children: "Copy image"
						})]
					}), /* @__PURE__ */ (0, x.jsx)(p, {
						className: "overflow-x-auto p-0",
						children: /* @__PURE__ */ (0, x.jsxs)("table", {
							id: "tblManda",
							ref: G,
							className: "w-full text-sm",
							children: [
								/* @__PURE__ */ (0, x.jsx)("thead", { children: /* @__PURE__ */ (0, x.jsxs)("tr", {
									className: "bg-[#f3e6ca]",
									children: [
										/* @__PURE__ */ (0, x.jsx)("th", {
											className: "border px-2 py-1.5",
											children: "Building"
										}),
										/* @__PURE__ */ (0, x.jsx)("th", {
											className: _("border px-2 py-1.5", C.L),
											children: "Lunch Thals×"
										}),
										/* @__PURE__ */ (0, x.jsx)("th", {
											className: _("border px-2 py-1.5", C.D),
											children: "Dinner Thals×"
										}),
										/* @__PURE__ */ (0, x.jsx)("th", {
											className: "border px-2 py-1.5",
											children: "Total"
										})
									]
								}) }),
								/* @__PURE__ */ (0, x.jsx)("tbody", { children: Z.manda.rows.map((e) => /* @__PURE__ */ (0, x.jsxs)("tr", {
									style: { color: y(e.building) },
									children: [
										/* @__PURE__ */ (0, x.jsx)("td", {
											className: "border px-2 py-1.5 text-left font-bold",
											children: e.building
										}),
										/* @__PURE__ */ (0, x.jsx)("td", {
											className: _("border px-2 py-1.5 text-center font-bold", C.L),
											children: e.ltx
										}),
										/* @__PURE__ */ (0, x.jsx)("td", {
											className: _("border px-2 py-1.5 text-center font-bold", C.D),
											children: e.dtx
										}),
										/* @__PURE__ */ (0, x.jsx)("td", {
											className: "border px-2 py-1.5 text-center",
											children: +(e.ltx + e.dtx).toFixed(2)
										})
									]
								}, e.building)) }),
								/* @__PURE__ */ (0, x.jsx)("tfoot", { children: /* @__PURE__ */ (0, x.jsxs)("tr", {
									className: "bg-[#fbf2dc] font-bold",
									children: [
										/* @__PURE__ */ (0, x.jsx)("td", {
											className: "border px-2 py-1.5",
											children: "Total"
										}),
										/* @__PURE__ */ (0, x.jsx)("td", {
											className: _("border px-2 py-1.5 text-center", C.L),
											children: Z.manda.totals.ltx
										}),
										/* @__PURE__ */ (0, x.jsx)("td", {
											className: _("border px-2 py-1.5 text-center", C.D),
											children: Z.manda.totals.dtx
										}),
										/* @__PURE__ */ (0, x.jsx)("td", {
											className: "border px-2 py-1.5 text-center",
											children: +(Z.manda.totals.ltx + Z.manda.totals.dtx).toFixed(2)
										})
									]
								}) })
							]
						})
					})]
				})
			] }),
			/* @__PURE__ */ (0, x.jsx)("p", {
				className: "text-xs text-muted-foreground print:hidden",
				children: se
			})
		]
	});
}
export { E as default };
