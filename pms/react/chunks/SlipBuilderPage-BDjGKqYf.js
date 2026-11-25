import { f as e, h as t, i as n, n as r, o as i, p as a, u as o } from "./PmsContext-BVMd13Oi.js";
import { t as s } from "./label-CMEyi--P.js";
import { n as c, t as l } from "./chevron-up-CnW0SoV4.js";
import { t as u } from "./plus-CPwEqLyF.js";
import { t as d } from "./printer-_t2PY0au.js";
import { t as f } from "./trash-8ywHN_MU.js";
import { t as p } from "./button-BGWa3SLr.js";
import { t as m } from "./card-B9_OGomP.js";
import { t as h } from "./input-DSBk_UeU.js";
import { t as g } from "./utils-b7UP9Cmo.js";
import { t as _ } from "./ConfirmDialog-GfriOiUy.js";
import { t as v } from "./useSlips-DUKbzGma.js";
// src/pages/slip-builder/SlipBuilderPage.tsx
var y = /* @__PURE__ */ t(a(), 1), b = e(), x = (e) => JSON.parse(JSON.stringify(e)), S = "h-8 min-w-0 rounded-md border bg-background px-1.5 text-sm";
function C() {
	let { cloud: e } = r(), t = i(), a = n(), { siteId: C } = o(), { ask: w, dialog: T } = _(), E = v(), [D, O] = (0, y.useState)(null), [k, A] = (0, y.useState)(null), [j, M] = (0, y.useState)(""), [N, P] = (0, y.useState)({ t: "" }), [F, I] = (0, y.useState)(!1), [L, R] = (0, y.useState)(""), z = e.canWrite(C), B = !!k && JSON.stringify(k) !== j;
	(0, y.useEffect)(() => {
		t("slip-print").then(async (e) => {
			O(e);
			let t = x(await e.loadSlipLayout("medina"));
			A(t), M(JSON.stringify(t));
		});
	}, []);
	let V = (0, y.useMemo)(() => {
		let e = (E.data ?? []).filter((e) => !e.deleted);
		return L.trim() && e.find((e) => String(e.sh_no).toUpperCase() === L.trim().toUpperCase()) || [...e].reverse().find((e) => e.rooms?.gents?.length || e.rooms?.ladies?.length) || e[e.length - 1] || {
			id: 0,
			site: "medina",
			sh_no: "43674",
			tour_name: "SAMPLE GROUP",
			group_leader: "-",
			building: "ARTAAL TAIBA",
			checkin_date: "2026-11-15",
			checkin_time: "12:00",
			checkout_date: "2026-11-19",
			checkout_time: "08:00",
			gents: 3,
			ladies: 2,
			children: 1,
			infants: 0,
			total: 6,
			from_place: "Makkah",
			to_place: "Makkah",
			rooms: {
				gents: [{
					room_no: "132",
					assigned: 3
				}],
				ladies: [{
					room_no: "134",
					assigned: 3
				}]
			}
		};
	}, [E.data, L]);
	if (C !== "medina") return /* @__PURE__ */ (0, b.jsx)("div", {
		className: "mx-auto max-w-3xl px-4 pt-8",
		children: /* @__PURE__ */ (0, b.jsxs)(m, {
			className: "p-6",
			children: [/* @__PURE__ */ (0, b.jsx)("h1", {
				className: "text-2xl font-bold text-primary",
				children: "Slip builder"
			}), /* @__PURE__ */ (0, b.jsx)("p", {
				className: "mt-2 text-muted-foreground",
				children: "The slip builder is set up for the Madina site. Switch to Madina to arrange its slip."
			})]
		})
	});
	if (!D || !k) return /* @__PURE__ */ (0, b.jsx)("div", {
		className: "p-6 text-muted-foreground",
		children: "Loading…"
	});
	let H = D.SLIP_FIELDS, U = Object.keys(H), W = [...new Set(k.rows.flat())].filter((e) => H[e]), G = (e) => A((t) => {
		let n = x(t);
		return e(n), n;
	}), K = (e, t, n) => G((r) => {
		r.fields[e] = {
			...r.fields[e] || {},
			[t]: n
		}, (n === "" || n === !1 || n == null) && delete r.fields[e][t];
	}), q = (e, t) => G((n) => {
		let r = e + t;
		if (r < 0 || r >= n.rows.length) return;
		let [i] = n.rows.splice(e, 1);
		n.rows.splice(r, 0, i);
	}), J = D.layoutSlip({
		...V,
		site: "medina"
	}, D.rowsFor(V), { admin: !0 }, k);
	async function Y(t) {
		I(!0);
		try {
			await a(e.request("PUT", "/api/slip-layout", {
				site: "medina",
				layout: t
			}));
			let n = x(t || D.DEFAULT_LAYOUT);
			D.setSlipLayout("medina", t), A(n), M(JSON.stringify(n)), P({ t: t ? "Saved. Print slips and the GL copy use this layout now." : "Back to the standard slip." });
		} catch (t) {
			P({
				t: t instanceof e.UserError ? t.message : "Could not save: " + (t.message || t),
				bad: !0
			});
		} finally {
			I(!1);
		}
	}
	function X() {
		D.setSlipLayout("medina", k), D.printSlips([{
			...V,
			site: "medina"
		}], { title: "Slip builder test" }), D.setSlipLayout("medina", JSON.parse(j));
	}
	let Z = (e, t = !1) => /* @__PURE__ */ (0, b.jsxs)(b.Fragment, { children: [t && /* @__PURE__ */ (0, b.jsx)("option", {
		value: "",
		children: "—"
	}), U.map((e) => /* @__PURE__ */ (0, b.jsxs)("option", {
		value: e,
		children: [
			k.fields[e]?.label || H[e][0],
			H[e][2] === "dt" ? " (date + time)" : "",
			""
		]
	}, e))] });
	return /* @__PURE__ */ (0, b.jsxs)("div", {
		className: "mx-auto grid max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4",
		children: [
			/* @__PURE__ */ (0, b.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("h1", {
					className: "text-2xl font-bold text-primary",
					children: "Slip builder — Madina"
				}), /* @__PURE__ */ (0, b.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Arrange the accommodation slip: rows, labels, colours and sizes. Print slips and the GL copy follow the saved layout."
				})] }), /* @__PURE__ */ (0, b.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, b.jsxs)(p, {
							variant: "outline",
							onClick: X,
							children: [/* @__PURE__ */ (0, b.jsx)(d, { className: "size-4" }), "Test print"]
						}),
						z && /* @__PURE__ */ (0, b.jsx)(p, {
							variant: "outline",
							disabled: F,
							onClick: async () => {
								await w({
									title: "Go back to the standard slip?",
									body: "Your layout is replaced by the standard Madina slip for every desk.",
									confirmLabel: "Use standard"
								}) && Y(null);
							},
							children: "Standard slip"
						}),
						z && /* @__PURE__ */ (0, b.jsx)(p, {
							disabled: !B || F,
							onClick: () => void Y(k),
							children: "Save layout"
						}),
						B && /* @__PURE__ */ (0, b.jsx)(p, {
							variant: "ghost",
							onClick: () => A(JSON.parse(j)),
							children: "Discard"
						})
					]
				})]
			}),
			N.t && /* @__PURE__ */ (0, b.jsx)("p", {
				className: g("text-sm", N.bad ? "text-destructive" : "text-muted-foreground"),
				role: "status",
				children: N.t
			}),
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "grid min-w-0 items-start gap-3 lg:grid-cols-[minmax(0,1fr)_560px]",
				children: [/* @__PURE__ */ (0, b.jsxs)("div", {
					className: "grid min-w-0 gap-3",
					children: [
						/* @__PURE__ */ (0, b.jsxs)(m, {
							className: "grid gap-3 p-4",
							children: [/* @__PURE__ */ (0, b.jsx)("h2", {
								className: "font-bold",
								children: "Heading and text"
							}), /* @__PURE__ */ (0, b.jsxs)("div", {
								className: "grid gap-2 sm:grid-cols-[1fr_7rem_7rem]",
								children: [
									/* @__PURE__ */ (0, b.jsxs)("div", {
										className: "grid gap-1",
										children: [/* @__PURE__ */ (0, b.jsx)(s, {
											htmlFor: "sbT",
											children: "Title"
										}), /* @__PURE__ */ (0, b.jsx)(h, {
											id: "sbT",
											value: k.title,
											onChange: (e) => G((t) => {
												t.title = e.target.value;
											})
										})]
									}),
									/* @__PURE__ */ (0, b.jsxs)("div", {
										className: "grid gap-1",
										children: [/* @__PURE__ */ (0, b.jsx)(s, {
											htmlFor: "sbTs",
											children: "Title size"
										}), /* @__PURE__ */ (0, b.jsx)(h, {
											id: "sbTs",
											type: "number",
											min: 8,
											max: 40,
											value: k.titleSize,
											onChange: (e) => G((t) => {
												t.titleSize = Number(e.target.value) || 14;
											})
										})]
									}),
									/* @__PURE__ */ (0, b.jsxs)("div", {
										className: "grid gap-1",
										children: [/* @__PURE__ */ (0, b.jsx)(s, {
											htmlFor: "sbS",
											children: "Text size"
										}), /* @__PURE__ */ (0, b.jsx)(h, {
											id: "sbS",
											type: "number",
											min: 7,
											max: 24,
											value: k.size,
											onChange: (e) => G((t) => {
												t.size = Number(e.target.value) || 11;
											})
										})]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, b.jsxs)(m, {
							className: "grid gap-2 p-4",
							children: [
								/* @__PURE__ */ (0, b.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, b.jsx)("h2", {
										className: "font-bold",
										children: "Rows"
									}), /* @__PURE__ */ (0, b.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "One field fills the row; two share it"
									})]
								}),
								k.rows.map((e, t) => /* @__PURE__ */ (0, b.jsxs)("div", {
									className: "grid grid-cols-[2rem_minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-2",
									children: [
										/* @__PURE__ */ (0, b.jsx)("span", {
											className: "text-center text-xs text-muted-foreground",
											children: t + 1
										}),
										/* @__PURE__ */ (0, b.jsx)("select", {
											"aria-label": `Row ${t + 1} first field`,
											className: S,
											value: e[0],
											onChange: (e) => G((n) => {
												n.rows[t][0] = e.target.value;
											}),
											children: Z(e[0])
										}),
										/* @__PURE__ */ (0, b.jsx)("select", {
											"aria-label": `Row ${t + 1} second field`,
											className: S,
											value: e[1] || "",
											onChange: (e) => G((n) => {
												n.rows[t] = e.target.value ? [n.rows[t][0], e.target.value] : [n.rows[t][0]];
											}),
											children: Z(e[1] || "", !0)
										}),
										/* @__PURE__ */ (0, b.jsxs)("span", {
											className: "flex",
											children: [
												/* @__PURE__ */ (0, b.jsx)(p, {
													variant: "ghost",
													size: "icon",
													className: "size-8",
													"aria-label": "Up",
													disabled: t === 0,
													onClick: () => q(t, -1),
													children: /* @__PURE__ */ (0, b.jsx)(l, { className: "size-4" })
												}),
												/* @__PURE__ */ (0, b.jsx)(p, {
													variant: "ghost",
													size: "icon",
													className: "size-8",
													"aria-label": "Down",
													disabled: t === k.rows.length - 1,
													onClick: () => q(t, 1),
													children: /* @__PURE__ */ (0, b.jsx)(c, { className: "size-4" })
												}),
												/* @__PURE__ */ (0, b.jsx)(p, {
													variant: "ghost",
													size: "icon",
													className: "size-8 text-destructive",
													"aria-label": "Remove row",
													onClick: () => G((e) => {
														e.rows.splice(t, 1);
													}),
													children: /* @__PURE__ */ (0, b.jsx)(f, { className: "size-4" })
												})
											]
										})
									]
								}, t)),
								/* @__PURE__ */ (0, b.jsxs)(p, {
									variant: "outline",
									size: "sm",
									className: "justify-self-start",
									disabled: k.rows.length >= 40,
									onClick: () => G((e) => {
										e.rows.push(["tour"]);
									}),
									children: [/* @__PURE__ */ (0, b.jsx)(u, { className: "size-4" }), "Add row"]
								})
							]
						}),
						/* @__PURE__ */ (0, b.jsxs)(m, {
							className: "grid gap-2 p-4",
							children: [
								/* @__PURE__ */ (0, b.jsx)("h2", {
									className: "font-bold",
									children: "How each field looks"
								}),
								/* @__PURE__ */ (0, b.jsxs)("div", {
									className: "grid grid-cols-[minmax(0,1.4fr)_3.2rem_3rem_4.5rem] items-center gap-x-2 gap-y-1.5 text-xs font-semibold text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, b.jsx)("span", { children: "Label" }),
										/* @__PURE__ */ (0, b.jsx)("span", { children: "Colour" }),
										/* @__PURE__ */ (0, b.jsx)("span", { children: "Bold" }),
										/* @__PURE__ */ (0, b.jsx)("span", { children: "Size" })
									]
								}),
								W.map((e) => {
									let t = k.fields[e] || {};
									return /* @__PURE__ */ (0, b.jsxs)("div", {
										className: "grid grid-cols-[minmax(0,1.4fr)_3.2rem_3rem_4.5rem] items-center gap-2",
										children: [
											/* @__PURE__ */ (0, b.jsx)(h, {
												className: "h-8",
												"aria-label": `${e} label`,
												placeholder: H[e][0],
												value: t.label || "",
												onChange: (t) => K(e, "label", t.target.value)
											}),
											/* @__PURE__ */ (0, b.jsx)("input", {
												type: "color",
												"aria-label": `${e} colour`,
												className: "h-8 w-12 rounded border",
												value: t.color || "#111111",
												onChange: (t) => K(e, "color", t.target.value === "#111111" ? "" : t.target.value)
											}),
											/* @__PURE__ */ (0, b.jsx)("input", {
												type: "checkbox",
												"aria-label": `${e} bold`,
												className: "size-5",
												checked: !!t.bold,
												onChange: (t) => K(e, "bold", t.target.checked)
											}),
											/* @__PURE__ */ (0, b.jsx)(h, {
												className: "h-8",
												type: "number",
												min: 7,
												max: 30,
												step: .5,
												"aria-label": `${e} size`,
												placeholder: String(k.size),
												value: t.size ?? "",
												onChange: (t) => K(e, "size", t.target.value === "" ? "" : Number(t.target.value))
											})
										]
									}, e);
								})
							]
						}),
						/* @__PURE__ */ (0, b.jsxs)(m, {
							className: "grid gap-3 p-4",
							children: [
								/* @__PURE__ */ (0, b.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, b.jsx)("h2", {
										className: "font-bold",
										children: "Room tables"
									}), /* @__PURE__ */ (0, b.jsxs)("label", {
										className: "flex items-center gap-2 text-sm",
										children: [/* @__PURE__ */ (0, b.jsx)("input", {
											type: "checkbox",
											checked: k.rooms.show !== !1,
											onChange: (e) => G((t) => {
												t.rooms.show = e.target.checked;
											})
										}), "Show"]
									})]
								}),
								/* @__PURE__ */ (0, b.jsx)("div", {
									className: "grid gap-2 sm:grid-cols-4",
									children: [
										["gentsTitle", "Gents title"],
										["ladiesTitle", "Ladies title"],
										["roomLabel", "Room column"],
										["bedsLabel", "Beds column"]
									].map(([e, t]) => /* @__PURE__ */ (0, b.jsxs)("div", {
										className: "grid gap-1",
										children: [/* @__PURE__ */ (0, b.jsx)(s, { children: t }), /* @__PURE__ */ (0, b.jsx)(h, {
											className: "h-8",
											value: k.rooms[e] || "",
											onChange: (t) => G((n) => {
												n.rooms[e] = t.target.value;
											})
										})]
									}, e))
								}),
								/* @__PURE__ */ (0, b.jsxs)("div", {
									className: "flex flex-wrap items-center gap-4 text-sm",
									children: [
										"Room numbers:",
										/* @__PURE__ */ (0, b.jsx)("input", {
											type: "color",
											"aria-label": "Room number colour",
											className: "h-8 w-12 rounded border",
											value: k.rooms.color || "#111111",
											onChange: (e) => G((t) => {
												t.rooms.color = e.target.value;
											})
										}),
										/* @__PURE__ */ (0, b.jsxs)("label", {
											className: "flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, b.jsx)("input", {
												type: "checkbox",
												checked: !!k.rooms.bold,
												onChange: (e) => G((t) => {
													t.rooms.bold = e.target.checked;
												})
											}), "Bold"]
										}),
										/* @__PURE__ */ (0, b.jsxs)("label", {
											className: "flex items-center gap-1.5",
											children: ["Size ", /* @__PURE__ */ (0, b.jsx)(h, {
												className: "h-8 w-20",
												type: "number",
												min: 7,
												max: 30,
												value: k.rooms.size ?? "",
												onChange: (e) => G((t) => {
													t.rooms.size = Number(e.target.value) || void 0;
												})
											})]
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, b.jsxs)(m, {
							className: "grid gap-3 p-4",
							children: [
								/* @__PURE__ */ (0, b.jsx)("h2", {
									className: "font-bold",
									children: "Footer"
								}),
								/* @__PURE__ */ (0, b.jsxs)("div", {
									className: "flex flex-wrap gap-5 text-sm",
									children: [/* @__PURE__ */ (0, b.jsxs)("label", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, b.jsx)("input", {
											type: "checkbox",
											checked: k.notes !== !1,
											onChange: (e) => G((t) => {
												t.notes = e.target.checked;
											})
										}), "The slip's own notes"]
									}), /* @__PURE__ */ (0, b.jsxs)("label", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, b.jsx)("input", {
											type: "checkbox",
											checked: k.adminBox !== !1,
											onChange: (e) => G((t) => {
												t.adminBox = e.target.checked;
											})
										}), "Checkout box (admin use only) on printed slips"]
									})]
								}),
								/* @__PURE__ */ (0, b.jsxs)("div", {
									className: "grid gap-1",
									children: [/* @__PURE__ */ (0, b.jsx)(s, {
										htmlFor: "sbN",
										children: "Note at the foot (empty = none)"
									}), /* @__PURE__ */ (0, b.jsx)(h, {
										id: "sbN",
										value: k.note || "",
										onChange: (e) => G((t) => {
											t.note = e.target.value;
										})
									})]
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, b.jsxs)(m, {
					className: "sticky top-16 grid gap-2 p-4",
					children: [
						/* @__PURE__ */ (0, b.jsxs)("div", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, b.jsx)("h2", {
								className: "font-bold",
								children: "Preview"
							}), /* @__PURE__ */ (0, b.jsx)(h, {
								className: "h-8 w-40",
								placeholder: "SH of a slip",
								"aria-label": "Preview a slip by SH",
								value: L,
								onChange: (e) => R(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, b.jsx)("style", { children: D.SLIP_CSS }),
						/* @__PURE__ */ (0, b.jsx)("div", {
							className: "pms-slips rounded-md bg-white p-3",
							children: /* @__PURE__ */ (0, b.jsx)("div", { dangerouslySetInnerHTML: { __html: J } })
						}),
						/* @__PURE__ */ (0, b.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								"Showing SH ",
								String(V.sh_no),
								". Printed, each copy is fitted to half of an A5 page."
							]
						})
					]
				})]
			}),
			T
		]
	});
}
export { C as default };
