import { f as e, h as t, i as n, o as r, p as i, r as a, s as o, u as s } from "./PmsContext-BVMd13Oi.js";
import { i as c, r as l, t as u } from "./tabs-IQDmk0rj.js";
import { t as d } from "./printer-_t2PY0au.js";
import { t as f } from "./button-BGWa3SLr.js";
import { n as p, t as m } from "./card-B9_OGomP.js";
import { t as h } from "./input-DSBk_UeU.js";
import { a as g, n as _, o as v, r as y, s as b, t as x } from "./table-DKR1WqRT.js";
import { t as S } from "./utils-b7UP9Cmo.js";
import { t as C } from "./badge-EB7Muw37.js";
import { t as w } from "./format-bJxoSInv.js";
// src/pages/pending-checkouts/PendingCheckoutsPage.tsx
var T = /* @__PURE__ */ t(i(), 1), E = e(), D = (e) => e == null ? "—" : e.toLocaleString(void 0, { maximumFractionDigits: 2 }), O = (e) => {
	let t = new Date(e);
	return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
};
function k({ no: e, side: t, hot: n, title: r }) {
	return /* @__PURE__ */ (0, E.jsx)("span", {
		title: r || t,
		className: S("mr-1 inline-block rounded-md border px-2 py-0.5 text-xs font-bold", n ? "border-destructive/40 bg-bad-soft text-destructive" : "bg-white", t === "ladies" && "italic"),
		children: e
	});
}
function A() {
	let e = a(), t = n(), { site: i } = s(), { href: A } = o(), j = r(), [M, N] = (0, T.useState)(null), [P, F] = (0, T.useState)({}), [I, L] = (0, T.useState)("zero"), [R, z] = (0, T.useState)(""), [B, V] = (0, T.useState)(!1);
	(0, T.useEffect)(() => {
		if (!M) return;
		let e = (e) => {
			e.preventDefault(), e.returnValue = "";
		};
		return window.addEventListener("beforeunload", e), () => window.removeEventListener("beforeunload", e);
	}, [M]);
	async function H(n) {
		if (!n) return;
		F({ reading: n.name });
		let { parseCheckoutFile: r, matchGroups: i } = await j("checkout-list"), a;
		try {
			a = await t(r(n));
		} catch (e) {
			console.error(e), a = {
				fatal: "Could not read this file: " + (e.message || e),
				groups: [],
				warnings: []
			};
		}
		if (a.fatal) {
			N(null), F({
				fatal: a.fatal,
				reading: void 0
			});
			return;
		}
		let o = i(a.groups, await e.all()).sort((e, t) => `${e.checkoutDate} ${e.checkoutTime}`.localeCompare(`${t.checkoutDate} ${t.checkoutTime}`));
		a.hasAdvance || L("all"), N({
			file: n,
			parsed: a,
			rows: o
		}), F({});
	}
	let U = O(Date.now()), W = O(Date.now() + 864e5), G = (e) => e ? e < U ? /* @__PURE__ */ (0, E.jsx)(C, {
		variant: "destructive",
		className: "ml-1.5",
		children: "passed"
	}) : e === U ? /* @__PURE__ */ (0, E.jsx)(C, {
		className: "ml-1.5",
		children: "today"
	}) : e === W ? /* @__PURE__ */ (0, E.jsx)(C, {
		variant: "secondary",
		className: "ml-1.5",
		children: "tomorrow"
	}) : null : null, K = (0, T.useMemo)(() => {
		if (!M) return null;
		let { rows: e, parsed: t } = M, n = e.filter((e) => e.advance === 0), r = R.trim().toLowerCase(), i = (I === "zero" ? t.hasAdvance ? n : [] : e).filter((e) => !r || [
			e.sh,
			e.groupId,
			e.leader,
			e.operator,
			e.location,
			...e.umsRooms,
			...e.stays.flatMap((e) => [e.building, ...e.rooms.map((e) => e.no)])
		].some((e) => String(e ?? "").toLowerCase().includes(r)));
		return {
			zero: n,
			list: i,
			byBuilding: I === "zero" ? Object.entries(i.reduce((e, t) => {
				for (let n of t.stays) (e[n.building || "No building"] ||= []).push(...n.rooms.map((e) => ({
					...e,
					sh: t.sh
				})));
				return e;
			}, {})).sort(([e], [t]) => e.localeCompare(t)).map(([e, t]) => [e, [...t].sort((e, t) => e.no.localeCompare(t.no, void 0, { numeric: !0 }))]) : [],
			notes: [
				...t.warnings,
				...e.filter((e) => e.roomMismatch).map((e) => `SH ${e.sh}: UMS lists ${e.umsRooms.join(", ")}, the PMS slip has ${e.stays.flatMap((e) => e.rooms.map((e) => e.no)).join(", ") || "no rooms"}.`),
				...e.filter((e) => e.dateMismatch).map((e) => `SH ${e.sh}: UMS checkout ${w(e.checkoutDate)}, the PMS slip says ${e.stays.map((e) => w(e.checkout)).join(", ")}.`)
			],
			notFound: e.filter((e) => !e.found).length
		};
	}, [
		M,
		I,
		R
	]);
	return /* @__PURE__ */ (0, E.jsxs)("div", {
		className: "mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4",
		children: [
			/* @__PURE__ */ (0, E.jsxs)("header", {
				className: "print:hidden",
				children: [/* @__PURE__ */ (0, E.jsxs)("h1", {
					className: "text-2xl font-bold text-primary",
					children: ["Pending Checkouts — ", i.label]
				}), /* @__PURE__ */ (0, E.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Load the UMS checkout list (Excel or PDF). Each group is found in the PMS by its SH (the list's Booking Ref) to show its building and rooms."
				})]
			}),
			/* @__PURE__ */ (0, E.jsxs)("div", {
				role: "alert",
				className: "rounded-lg border-2 border-destructive/50 bg-bad-soft px-3 py-2 text-sm text-destructive print:hidden",
				children: [/* @__PURE__ */ (0, E.jsx)("b", { children: "⚠ Nothing on this page is saved." }), " Closing the tab, refreshing or opening another page wipes the list. Take a screenshot (or print) before you close it."]
			}),
			/* @__PURE__ */ (0, E.jsx)(m, {
				className: "print:hidden",
				children: /* @__PURE__ */ (0, E.jsxs)(p, {
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ (0, E.jsx)("h3", {
							className: "font-bold text-primary",
							children: "Load the list"
						}),
						/* @__PURE__ */ (0, E.jsxs)("label", {
							onDragOver: (e) => {
								e.preventDefault(), V(!0);
							},
							onDragLeave: () => V(!1),
							onDrop: (e) => {
								e.preventDefault(), V(!1), H(e.dataTransfer.files[0]);
							},
							className: S("grid cursor-pointer place-items-center gap-1 rounded-xl border-2 border-dashed border-gold bg-accent/40 p-6 text-center", B && "bg-accent"),
							children: [/* @__PURE__ */ (0, E.jsx)("input", {
								type: "file",
								className: "sr-only",
								accept: ".xlsx,.xls,.pdf,application/pdf",
								onChange: (e) => {
									H(e.target.files?.[0]), e.target.value = "";
								}
							}), /* @__PURE__ */ (0, E.jsxs)("span", { children: [
								"Drop the ",
								/* @__PURE__ */ (0, E.jsx)("b", { children: "Excel" }),
								" or ",
								/* @__PURE__ */ (0, E.jsx)("b", { children: "PDF" }),
								" here, or ",
								/* @__PURE__ */ (0, E.jsx)("u", { children: "choose the file" })
							] })]
						}),
						/* @__PURE__ */ (0, E.jsxs)("div", {
							className: "flex flex-wrap gap-1.5",
							children: [P.reading && /* @__PURE__ */ (0, E.jsxs)(C, {
								variant: "secondary",
								children: [
									"Reading ",
									P.reading,
									"…"
								]
							}), M && /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [
								/* @__PURE__ */ (0, E.jsxs)(C, {
									variant: "secondary",
									children: [
										M.file.name,
										" · ",
										M.parsed.source
									]
								}),
								/* @__PURE__ */ (0, E.jsxs)(C, {
									className: "bg-ok-soft text-ok",
									children: [M.rows.length, " groups"]
								}),
								M.parsed.hasAdvance ? /* @__PURE__ */ (0, E.jsxs)(C, {
									variant: "destructive",
									children: [K?.zero.length, " with advance 0"]
								}) : /* @__PURE__ */ (0, E.jsx)(C, {
									className: "bg-warn-soft text-warn",
									children: "no advance column"
								}),
								K && K.notFound > 0 && /* @__PURE__ */ (0, E.jsxs)(C, {
									className: "bg-warn-soft text-warn",
									children: [
										K.notFound,
										" SH not found in ",
										i.label
									]
								})
							] })]
						}),
						P.fatal && /* @__PURE__ */ (0, E.jsx)("p", {
							className: "text-destructive",
							children: P.fatal
						}),
						K && K.notes.length > 0 && /* @__PURE__ */ (0, E.jsxs)("details", { children: [/* @__PURE__ */ (0, E.jsxs)("summary", {
							className: "cursor-pointer text-sm",
							children: [K.notes.length, " difference(s) between the list and the PMS"]
						}), /* @__PURE__ */ (0, E.jsx)("ul", {
							className: "mt-1 list-disc pl-5 text-sm",
							children: K.notes.map((e, t) => /* @__PURE__ */ (0, E.jsx)("li", { children: e }, t))
						})] })
					]
				})
			}),
			M && K && /* @__PURE__ */ (0, E.jsx)(m, { children: /* @__PURE__ */ (0, E.jsxs)(p, {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, E.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2 print:hidden",
						children: [
							/* @__PURE__ */ (0, E.jsx)(u, {
								value: I,
								onValueChange: (e) => L(e),
								children: /* @__PURE__ */ (0, E.jsxs)(l, { children: [/* @__PURE__ */ (0, E.jsxs)(c, {
									value: "zero",
									children: ["Advance 0 ", /* @__PURE__ */ (0, E.jsx)(C, {
										variant: "secondary",
										className: "ml-1",
										children: M.parsed.hasAdvance ? K.zero.length : "—"
									})]
								}), /* @__PURE__ */ (0, E.jsxs)(c, {
									value: "all",
									children: ["Full list ", /* @__PURE__ */ (0, E.jsx)(C, {
										variant: "secondary",
										className: "ml-1",
										children: M.rows.length
									})]
								})] })
							}),
							/* @__PURE__ */ (0, E.jsx)(h, {
								type: "search",
								className: "min-w-48 flex-1",
								placeholder: "Search SH, name, room…",
								value: R,
								onChange: (e) => z(e.target.value)
							}),
							/* @__PURE__ */ (0, E.jsxs)(f, {
								variant: "outline",
								onClick: () => window.print(),
								children: [/* @__PURE__ */ (0, E.jsx)(d, { className: "size-4" }), "Print"]
							})
						]
					}),
					I === "zero" && !M.parsed.hasAdvance && /* @__PURE__ */ (0, E.jsxs)("p", {
						className: "rounded-lg bg-warn-soft p-2 text-sm text-warn",
						children: [
							"This file has no ",
							/* @__PURE__ */ (0, E.jsx)("b", { children: "Total Advance" }),
							" column (the PDF export leaves it out), so groups with zero advance cannot be picked out. Load the Excel file for this view, or use the full list."
						]
					}),
					K.byBuilding.map(([e, t]) => /* @__PURE__ */ (0, E.jsxs)("div", {
						className: "grid gap-1",
						children: [/* @__PURE__ */ (0, E.jsxs)("h4", {
							className: "font-bold",
							children: [
								e,
								" ",
								/* @__PURE__ */ (0, E.jsxs)("span", {
									className: "font-normal text-muted-foreground",
									children: [
										"· ",
										t.length,
										" room(s)"
									]
								})
							]
						}), /* @__PURE__ */ (0, E.jsx)("div", { children: t.map((e, t) => /* @__PURE__ */ (0, E.jsx)(k, {
							no: e.no,
							hot: !0,
							title: `SH ${e.sh}`
						}, t)) })]
					}, e)),
					/* @__PURE__ */ (0, E.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, E.jsxs)(x, { children: [/* @__PURE__ */ (0, E.jsx)(v, { children: /* @__PURE__ */ (0, E.jsxs)(b, { children: [
							/* @__PURE__ */ (0, E.jsx)(g, { children: "SH" }),
							/* @__PURE__ */ (0, E.jsx)(g, { children: "Group leader" }),
							/* @__PURE__ */ (0, E.jsx)(g, {
								className: "text-right",
								children: "Pax"
							}),
							/* @__PURE__ */ (0, E.jsx)(g, { children: "Expected checkout" }),
							/* @__PURE__ */ (0, E.jsx)(g, { children: "Location" }),
							/* @__PURE__ */ (0, E.jsx)(g, {
								className: "text-right",
								children: "Advance"
							}),
							/* @__PURE__ */ (0, E.jsx)(g, { children: "Building & rooms (PMS)" })
						] }) }), /* @__PURE__ */ (0, E.jsx)(_, { children: K.list.length ? K.list.map((e, t) => {
							let n = e.advance === 0;
							return /* @__PURE__ */ (0, E.jsxs)(b, {
								className: S(n && I === "all" && "bg-bad-soft/50"),
								children: [
									/* @__PURE__ */ (0, E.jsxs)(y, {
										className: "whitespace-nowrap",
										children: [/* @__PURE__ */ (0, E.jsx)("a", {
											className: "font-bold text-primary underline",
											href: A("slip", { sh_no: e.sh }),
											target: "_blank",
											rel: "noopener",
											title: "Open the slip in a new tab",
											children: e.sh
										}), /* @__PURE__ */ (0, E.jsxs)("small", {
											className: "block text-muted-foreground",
											children: ["Group ", e.groupId]
										})]
									}),
									/* @__PURE__ */ (0, E.jsxs)(y, { children: [e.leader, /* @__PURE__ */ (0, E.jsx)("small", {
										className: "block text-muted-foreground",
										children: e.operator
									})] }),
									/* @__PURE__ */ (0, E.jsx)(y, {
										className: "text-right",
										children: e.pax ?? ""
									}),
									/* @__PURE__ */ (0, E.jsxs)(y, {
										className: "whitespace-nowrap",
										children: [
											w(e.checkoutDate),
											" ",
											e.checkoutTime,
											G(e.checkoutDate),
											/* @__PURE__ */ (0, E.jsxs)("small", {
												className: "block text-muted-foreground",
												children: ["arrived ", w(e.arrival)]
											})
										]
									}),
									/* @__PURE__ */ (0, E.jsx)(y, { children: e.location }),
									/* @__PURE__ */ (0, E.jsx)(y, {
										className: "text-right",
										children: n ? /* @__PURE__ */ (0, E.jsx)("b", {
											className: "text-destructive",
											children: "0"
										}) : D(e.advance)
									}),
									/* @__PURE__ */ (0, E.jsx)(y, { children: e.found ? /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [e.stays.map((e, t) => /* @__PURE__ */ (0, E.jsxs)("div", {
										className: "mb-1",
										children: [/* @__PURE__ */ (0, E.jsx)("b", {
											className: "mr-1.5 text-xs",
											children: e.building || "No building"
										}), e.rooms.length ? e.rooms.map((e, t) => /* @__PURE__ */ (0, E.jsx)(k, {
											no: e.no,
											side: e.side,
											hot: n
										}, t)) : /* @__PURE__ */ (0, E.jsx)("span", {
											className: "text-muted-foreground",
											children: "no rooms assigned"
										})]
									}, t)), e.roomMismatch && /* @__PURE__ */ (0, E.jsxs)("span", {
										className: "text-xs font-bold text-warn",
										children: ["UMS: ", e.umsRooms.join(", ")]
									})] }) : /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [/* @__PURE__ */ (0, E.jsxs)("span", {
										className: "text-muted-foreground",
										children: [
											"Not in ",
											i.label,
											" PMS"
										]
									}), /* @__PURE__ */ (0, E.jsxs)("small", {
										className: "block text-muted-foreground",
										children: ["UMS: ", e.umsRooms.join(", ") || "—"]
									})] }) })
								]
							}, t);
						}) : /* @__PURE__ */ (0, E.jsx)(b, { children: /* @__PURE__ */ (0, E.jsx)(y, {
							colSpan: 7,
							className: "text-muted-foreground",
							children: I === "zero" && !M.parsed.hasAdvance ? "No advance column in this file." : "Nothing here."
						}) }) })] })
					}),
					/* @__PURE__ */ (0, E.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							"Rooms come from this site's slips. ",
							/* @__PURE__ */ (0, E.jsx)("span", {
								className: "font-bold text-warn",
								children: "UMS: …"
							}),
							" marks a room UMS lists that the slip does not have."
						]
					})
				]
			}) })
		]
	});
}
export { A as default };
