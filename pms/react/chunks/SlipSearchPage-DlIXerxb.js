import { f as e, h as t, n, p as r, u as i } from "./PmsContext-BVMd13Oi.js";
import { t as a } from "./useQuery-BUXPY6q6.js";
import { a as o, i as s, n as c, r as l, t as u } from "./select-VcH2xuqJ.js";
import { t as d } from "./label-CMEyi--P.js";
import { i as f, n as p, r as m, t as h } from "./card-B9_OGomP.js";
import { t as g } from "./input-DSBk_UeU.js";
import { a as _, n as v, o as y, r as b, s as x, t as S } from "./table-DKR1WqRT.js";
import { t as C } from "./utils-b7UP9Cmo.js";
import { t as w } from "./useSlips-DUKbzGma.js";
import { t as T } from "./badge-EB7Muw37.js";
import { a as E, i as D, n as O, o as k, r as A, s as j } from "./format-bJxoSInv.js";
// src/pages/slip-search/SlipSearchPage.tsx
var M = /* @__PURE__ */ t(r(), 1), N = e(), P = 300;
function F({ label: e, children: t }) {
	return /* @__PURE__ */ (0, N.jsxs)("div", {
		className: "grid gap-0.5 rounded-lg border bg-white p-2",
		children: [/* @__PURE__ */ (0, N.jsx)("span", {
			className: "text-xs text-muted-foreground",
			children: e
		}), /* @__PURE__ */ (0, N.jsx)("b", {
			className: "break-words text-sm",
			children: t
		})]
	});
}
function I({ s: e, k: t, label: r }) {
	let { stay: i } = n(), a = i.isDelayed(e), o = i.rowsOf(e).filter((e) => e.side === t && !e.past);
	return o.length ? /* @__PURE__ */ (0, N.jsxs)("div", {
		className: "grid gap-1.5",
		children: [/* @__PURE__ */ (0, N.jsx)("h3", {
			className: "text-sm font-bold text-primary",
			children: r
		}), /* @__PURE__ */ (0, N.jsxs)(S, { children: [/* @__PURE__ */ (0, N.jsx)(y, { children: /* @__PURE__ */ (0, N.jsxs)(x, { children: [
			/* @__PURE__ */ (0, N.jsx)(_, { children: "Room" }),
			/* @__PURE__ */ (0, N.jsx)(_, {
				className: "text-right",
				children: "Beds"
			}),
			a && /* @__PURE__ */ (0, N.jsx)(_, { children: "Leaves" })
		] }) }), /* @__PURE__ */ (0, N.jsx)(v, { children: o.map((t, n) => /* @__PURE__ */ (0, N.jsxs)(x, { children: [
			/* @__PURE__ */ (0, N.jsxs)(b, { children: [
				t.room_no,
				t.exclusive && /* @__PURE__ */ (0, N.jsxs)(T, {
					variant: "outline",
					className: "ml-1.5",
					title: "The whole room is kept for these guests",
					children: [
						"exclusive · ",
						t.block,
						" beds kept"
					]
				}),
				t.building && t.building !== String(e.building || "").trim() && /* @__PURE__ */ (0, N.jsx)("small", {
					className: "ml-1 text-muted-foreground",
					children: t.building
				})
			] }),
			/* @__PURE__ */ (0, N.jsx)(b, {
				className: "text-right",
				children: t.beds
			}),
			a && /* @__PURE__ */ (0, N.jsxs)(b, { children: [j(t.end), t.status !== "booked" && /* @__PURE__ */ (0, N.jsx)(T, {
				variant: "outline",
				className: "ml-1.5",
				children: t.status
			})] })
		] }, n)) })] })]
	}) : null;
}
function L({ s: e }) {
	let { stay: t, transport: r } = n(), o = r, { siteId: s } = i(), c = String(e.sh_no ?? "").replace(/^S/i, ""), l = a({
		queryKey: [
			"slip-transport",
			s,
			e.id,
			e.sh_no,
			e.checkin_date,
			e.checkout_date
		],
		queryFn: async () => {
			let n = t.slipStart(e), r = t.slipEnd(e);
			if (!n || !r) return [];
			let i = o.addDays(o.ymd(new Date(n)), -2), a = o.addDays(o.ymd(new Date(r)), 2), l = (await o.listDays(s)).map((e) => e.day).filter((e) => e >= i && e <= a).slice(0, 30), u = await Promise.all(l.map((e) => o.loadDay(s, e))), d = [];
			for (let e of u) {
				let t = e.rows || [], n = o.resolve(t);
				for (let r of t.filter((e) => String(e.ref ?? "").replace(/^S/i, "") === c)) {
					let i = n.get(r.key) || {}, a = i.parent || r, o = t.filter((e) => e.key !== r.key && (e.key === a.key || n.get(e.key)?.parent === a));
					d.push({
						r,
						i,
						main: a,
						riders: o,
						day: e.day || r.day
					});
				}
			}
			return d.sort((e, t) => String(e.day + (e.r.at || "")).localeCompare(String(t.day + (t.r.at || ""))));
		},
		staleTime: 6e4
	}), u = l.data ?? [];
	return /* @__PURE__ */ (0, N.jsxs)("div", {
		className: "grid gap-2",
		children: [/* @__PURE__ */ (0, N.jsx)("h3", {
			className: "text-sm font-bold text-primary",
			children: "Transport"
		}), l.isLoading ? /* @__PURE__ */ (0, N.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Loading transport…"
		}) : l.isError ? /* @__PURE__ */ (0, N.jsx)("p", {
			className: "text-sm text-destructive",
			children: "Could not load the transport list."
		}) : u.length ? u.map(({ r: e, i: t, main: n, riders: r, day: i }, a) => {
			let s = o.destById?.[t.dest], c = o.vehicleWord(t.vehicle, t.vlabel), l = t.bus;
			return /* @__PURE__ */ (0, N.jsxs)("div", {
				className: "grid gap-1.5 rounded-lg border bg-white p-2.5",
				children: [
					/* @__PURE__ */ (0, N.jsxs)("div", {
						className: "flex flex-wrap items-baseline justify-between gap-2",
						children: [/* @__PURE__ */ (0, N.jsxs)("b", { children: [o.longDate(i), e.at ? ` · ${o.time12(e.at)}` : ""] }), /* @__PURE__ */ (0, N.jsx)(T, {
							variant: "outline",
							children: s ? s.title : t.route || e.route || "—"
						})]
					}),
					/* @__PURE__ */ (0, N.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [
							/* @__PURE__ */ (0, N.jsx)(F, {
								label: "Route",
								children: t.route || e.route || "—"
							}),
							/* @__PURE__ */ (0, N.jsxs)(F, {
								label: "Vehicle",
								children: [l != null && l !== "" ? `${c} no. ${l}` : c, t.parent && /* @__PURE__ */ (0, N.jsxs)("small", {
									className: "ml-1 font-normal",
									children: [
										"(adjusted into ",
										n.vch || n.operator,
										")"
									]
								})]
							}),
							/* @__PURE__ */ (0, N.jsxs)(F, {
								label: "Pax",
								children: [e.pax || "—", e.m || e.f || e.c ? ` (M ${e.m || 0} · F ${e.f || 0} · C ${e.c || 0})` : ""]
							}),
							/* @__PURE__ */ (0, N.jsx)(F, {
								label: "Building",
								children: t.building || e.building || "—"
							}),
							(n.transporter || e.transporter) && /* @__PURE__ */ (0, N.jsx)(F, {
								label: "Transporter",
								children: n.transporter || e.transporter
							}),
							(n.vch || e.vch) && /* @__PURE__ */ (0, N.jsx)(F, {
								label: "Vch No",
								children: n.vch || e.vch
							}),
							(e.dora || n.dora) && /* @__PURE__ */ (0, N.jsx)(F, {
								label: "Dora No",
								children: e.dora || n.dora
							}),
							(e.rooms || []).length > 0 && /* @__PURE__ */ (0, N.jsx)(F, {
								label: "Rooms",
								children: e.rooms.join(", ")
							})
						]
					}),
					e.remarks && /* @__PURE__ */ (0, N.jsxs)("p", {
						className: "text-sm",
						children: [
							/* @__PURE__ */ (0, N.jsx)("b", { children: "Remarks:" }),
							" ",
							e.remarks
						]
					}),
					r.length > 0 && /* @__PURE__ */ (0, N.jsxs)("div", {
						className: "text-sm",
						children: [
							/* @__PURE__ */ (0, N.jsx)("b", { children: "Also on this vehicle:" }),
							" ",
							r.map((e) => `${e.operator || "—"} (SH ${e.ref}, ${e.pax || 0} pax)`).join(" · ")
						]
					})
				]
			}, a);
		}) : /* @__PURE__ */ (0, N.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "No transport trip is saved for this slip."
		})]
	});
}
function R({ s: e }) {
	let { stay: t } = n(), r = t.isDelayed(e), i = String(e.notes || e.remarks || "").trim();
	return /* @__PURE__ */ (0, N.jsxs)("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, N.jsxs)("h2", {
				className: "text-lg font-bold text-primary",
				children: ["SH ", e.sh_no]
			}),
			/* @__PURE__ */ (0, N.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [
					/* @__PURE__ */ (0, N.jsx)(F, {
						label: "Group",
						children: e.tour_name || "—"
					}),
					/* @__PURE__ */ (0, N.jsx)(F, {
						label: "Group leader",
						children: String(e.group_leader || "").trim() || "-"
					}),
					/* @__PURE__ */ (0, N.jsx)(F, {
						label: "Building",
						children: e.building || "—"
					}),
					(e.from_place || e.to_place) && /* @__PURE__ */ (0, N.jsxs)(F, {
						label: "From → To",
						children: [
							e.from_place || "—",
							" → ",
							e.to_place || "—"
						]
					}),
					/* @__PURE__ */ (0, N.jsx)(F, {
						label: "Check-in",
						children: j(t.slipStart(e))
					}),
					e.checked_in && /* @__PURE__ */ (0, N.jsx)(F, {
						label: "Checked in",
						children: "yes"
					}),
					/* @__PURE__ */ (0, N.jsxs)(F, {
						label: "Check-out",
						children: [j(t.slipEnd(e)), r && /* @__PURE__ */ (0, N.jsx)(T, {
							variant: "outline",
							className: "ml-1.5",
							children: "delayed"
						})]
					}),
					/* @__PURE__ */ (0, N.jsx)(F, {
						label: "Total pax",
						children: E(e) || "—"
					}),
					/* @__PURE__ */ (0, N.jsxs)(F, {
						label: "Gents · Ladies",
						children: [
							A(e.gents),
							" · ",
							A(e.ladies)
						]
					}),
					/* @__PURE__ */ (0, N.jsxs)(F, {
						label: "Children · Infants",
						children: [
							A(e.children ?? e.child),
							" · ",
							A(e.infants ?? e.infant)
						]
					}),
					e.ums?.key && /* @__PURE__ */ (0, N.jsx)(F, {
						label: "From UMS",
						children: k(e.ums.importedAt)
					}),
					/* @__PURE__ */ (0, N.jsx)(F, {
						label: "Created",
						children: k(e.createdAt)
					}),
					e.updatedAt && /* @__PURE__ */ (0, N.jsx)(F, {
						label: "Last changed",
						children: k(e.updatedAt)
					})
				]
			}),
			/* @__PURE__ */ (0, N.jsx)(I, {
				s: e,
				k: "gents",
				label: "Gents rooms"
			}),
			/* @__PURE__ */ (0, N.jsx)(I, {
				s: e,
				k: "ladies",
				label: "Ladies rooms"
			}),
			!t.rowsOf(e).length && /* @__PURE__ */ (0, N.jsx)("p", {
				className: "text-muted-foreground",
				children: "No rooms assigned yet."
			}),
			i && /* @__PURE__ */ (0, N.jsxs)("div", { children: [/* @__PURE__ */ (0, N.jsx)("h3", {
				className: "text-sm font-bold text-primary",
				children: "Notes"
			}), /* @__PURE__ */ (0, N.jsx)("p", {
				className: "whitespace-pre-wrap",
				children: i
			})] }),
			/* @__PURE__ */ (0, N.jsx)(L, { s: e })
		]
	});
}
function z() {
	let { stay: e } = n(), t = w(), [r, i] = (0, M.useState)(""), [a, k] = (0, M.useState)(""), [A, F] = (0, M.useState)("all"), [I, L] = (0, M.useState)(""), [z, B] = (0, M.useState)(""), [V, H] = (0, M.useState)(null), U = t.data ?? [], W = (0, M.useMemo)(() => [...new Set(U.map((e) => String(e.building || "").trim()).filter(Boolean))].sort(O), [U]), G = (0, M.useMemo)(() => {
		let t = r.trim().toLowerCase(), n = a.trim().toLowerCase(), i = I ? (/* @__PURE__ */ new Date(`${I}T00:00`)).getTime() : null, o = z ? (/* @__PURE__ */ new Date(`${z}T23:59:59`)).getTime() : null;
		return U.filter((r) => !(A !== "all" && String(r.building || "").trim() !== A || t && ![
			r.sh_no,
			r.tour_name,
			r.group_leader,
			r.building
		].join(" ").toLowerCase().includes(t) || n && !D(r).some((e) => e.toLowerCase().includes(n)) || i && (e.slipEnd(r) || 0) < i || o && (e.slipStart(r) || Infinity) > o)).sort((t, n) => (e.slipStart(n) || 0) - (e.slipStart(t) || 0));
	}, [
		U,
		r,
		a,
		A,
		I,
		z,
		e
	]), K = G.slice(0, P), q = U.find((e) => e.id === V) ?? null;
	return /* @__PURE__ */ (0, N.jsxs)("div", {
		className: "mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-8 pt-4 sm:px-4",
		children: [/* @__PURE__ */ (0, N.jsxs)("header", {
			className: "grid gap-3",
			children: [/* @__PURE__ */ (0, N.jsxs)("div", { children: [/* @__PURE__ */ (0, N.jsx)("h1", {
				className: "text-2xl font-bold text-primary",
				children: "Search slips"
			}), /* @__PURE__ */ (0, N.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Find a slip and see its details. View only — nothing can be changed here."
			})] }), /* @__PURE__ */ (0, N.jsxs)("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5",
				children: [
					/* @__PURE__ */ (0, N.jsxs)("div", {
						className: "col-span-2 grid gap-1 sm:col-span-1",
						children: [/* @__PURE__ */ (0, N.jsx)(d, {
							htmlFor: "ssQ",
							children: "Search"
						}), /* @__PURE__ */ (0, N.jsx)(g, {
							id: "ssQ",
							type: "search",
							placeholder: "SH, group, leader, building",
							autoComplete: "off",
							value: r,
							onChange: (e) => i(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, N.jsxs)("div", {
						className: "grid gap-1",
						children: [/* @__PURE__ */ (0, N.jsx)(d, {
							htmlFor: "ssRoom",
							children: "Room"
						}), /* @__PURE__ */ (0, N.jsx)(g, {
							id: "ssRoom",
							type: "search",
							placeholder: "e.g. 501",
							autoComplete: "off",
							value: a,
							onChange: (e) => k(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, N.jsxs)("div", {
						className: "grid gap-1",
						children: [/* @__PURE__ */ (0, N.jsx)(d, {
							htmlFor: "ssBld",
							children: "Building"
						}), /* @__PURE__ */ (0, N.jsxs)(u, {
							value: A,
							onValueChange: F,
							children: [/* @__PURE__ */ (0, N.jsx)(s, {
								id: "ssBld",
								className: "w-full",
								children: /* @__PURE__ */ (0, N.jsx)(o, {})
							}), /* @__PURE__ */ (0, N.jsxs)(c, { children: [/* @__PURE__ */ (0, N.jsx)(l, {
								value: "all",
								children: "All buildings"
							}), W.map((e) => /* @__PURE__ */ (0, N.jsx)(l, {
								value: e,
								children: e
							}, e))] })]
						})]
					}),
					/* @__PURE__ */ (0, N.jsxs)("div", {
						className: "grid gap-1",
						children: [/* @__PURE__ */ (0, N.jsx)(d, {
							htmlFor: "ssFrom",
							children: "Staying from"
						}), /* @__PURE__ */ (0, N.jsx)(g, {
							id: "ssFrom",
							type: "date",
							value: I,
							onChange: (e) => L(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, N.jsxs)("div", {
						className: "grid gap-1",
						children: [/* @__PURE__ */ (0, N.jsx)(d, {
							htmlFor: "ssTo",
							children: "to"
						}), /* @__PURE__ */ (0, N.jsx)(g, {
							id: "ssTo",
							type: "date",
							value: z,
							onChange: (e) => B(e.target.value)
						})]
					})
				]
			})]
		}), /* @__PURE__ */ (0, N.jsxs)("div", {
			className: "grid min-w-0 items-start gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]",
			children: [/* @__PURE__ */ (0, N.jsxs)(h, {
				className: "min-w-0 gap-0 py-0",
				children: [/* @__PURE__ */ (0, N.jsxs)(m, {
					className: "flex-row items-center justify-between border-b py-2.5",
					children: [/* @__PURE__ */ (0, N.jsx)(f, {
						className: "text-base",
						children: "Slips"
					}), /* @__PURE__ */ (0, N.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: t.isLoading ? "Loading…" : G.length > P ? `${G.length} slips · first ${P} shown, narrow the search` : `${G.length} slip${G.length === 1 ? "" : "s"}`
					})]
				}), /* @__PURE__ */ (0, N.jsx)(p, {
					className: "max-h-[70vh] overflow-auto p-0",
					children: /* @__PURE__ */ (0, N.jsxs)(S, { children: [/* @__PURE__ */ (0, N.jsx)(y, { children: /* @__PURE__ */ (0, N.jsxs)(x, { children: [
						/* @__PURE__ */ (0, N.jsx)(_, { children: "SH" }),
						/* @__PURE__ */ (0, N.jsx)(_, { children: "Group · leader" }),
						/* @__PURE__ */ (0, N.jsx)(_, { children: "Building · rooms" }),
						/* @__PURE__ */ (0, N.jsx)(_, { children: "Check-in" }),
						/* @__PURE__ */ (0, N.jsx)(_, { children: "Check-out" }),
						/* @__PURE__ */ (0, N.jsx)(_, {
							className: "text-right",
							children: "Pax"
						})
					] }) }), /* @__PURE__ */ (0, N.jsx)(v, { children: K.length ? K.map((t) => {
						let n = D(t);
						return /* @__PURE__ */ (0, N.jsxs)(x, {
							tabIndex: 0,
							"data-state": V === t.id ? "selected" : void 0,
							className: C("cursor-pointer", V === t.id && "bg-accent"),
							onClick: () => H(t.id),
							onKeyDown: (e) => {
								e.key === "Enter" && H(t.id);
							},
							children: [
								/* @__PURE__ */ (0, N.jsx)(b, { children: /* @__PURE__ */ (0, N.jsx)("b", { children: t.sh_no }) }),
								/* @__PURE__ */ (0, N.jsxs)(b, { children: [t.tour_name, /* @__PURE__ */ (0, N.jsx)("small", {
									className: "block text-muted-foreground",
									children: String(t.group_leader || "").trim() || "-"
								})] }),
								/* @__PURE__ */ (0, N.jsxs)(b, { children: [t.building || "—", n.length > 0 && /* @__PURE__ */ (0, N.jsx)("small", {
									className: "block text-muted-foreground",
									children: n.join(", ")
								})] }),
								/* @__PURE__ */ (0, N.jsx)(b, {
									className: "whitespace-nowrap",
									children: j(e.slipStart(t))
								}),
								/* @__PURE__ */ (0, N.jsxs)(b, {
									className: "whitespace-nowrap",
									children: [j(e.slipEnd(t)), e.isDelayed(t) && /* @__PURE__ */ (0, N.jsx)(T, {
										variant: "outline",
										className: "ml-1.5",
										children: "delayed"
									})]
								}),
								/* @__PURE__ */ (0, N.jsx)(b, {
									className: "text-right",
									children: E(t) || "—"
								})
							]
						}, t.id);
					}) : /* @__PURE__ */ (0, N.jsx)(x, { children: /* @__PURE__ */ (0, N.jsx)(b, {
						colSpan: 6,
						className: "text-muted-foreground",
						children: "No slips match."
					}) }) })] })
				})]
			}), /* @__PURE__ */ (0, N.jsx)(h, {
				className: "min-w-0 lg:sticky lg:top-3",
				children: /* @__PURE__ */ (0, N.jsx)(p, { children: q ? /* @__PURE__ */ (0, N.jsx)(R, { s: q }) : /* @__PURE__ */ (0, N.jsx)("p", {
					className: "text-muted-foreground",
					children: "Tap a slip to see its details."
				}) })
			})]
		})]
	});
}
export { z as default };
