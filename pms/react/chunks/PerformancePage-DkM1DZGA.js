import { d as e, f as t, h as n, i as r, n as i, p as a } from "./PmsContext-BVMd13Oi.js";
import { E as o, b as s, c, d as l, g as u, o as d, x as f } from "./query-DROYnevi.js";
import { t as p } from "./useQuery-BUXPY6q6.js";
import { n as m } from "./mutation-ggA4t488.js";
import { a as h, i as g, n as _, r as v, t as y } from "./select-VcH2xuqJ.js";
import { i as b, n as x, r as S, t as ee } from "./tabs-IQDmk0rj.js";
import { t as te } from "./refresh-cw-D-L_YZdS.js";
import { t as C } from "./button-BGWa3SLr.js";
import { i as ne, n as w, r as re, t as T } from "./card-B9_OGomP.js";
import { t as ie } from "./input-DSBk_UeU.js";
import { a as E, n as D, o as O, r as k, s as A, t as j } from "./table-DKR1WqRT.js";
import { t as M } from "./utils-b7UP9Cmo.js";
import { t as N } from "./badge-EB7Muw37.js";
import { t as ae } from "./PageHeader-DKvzTuZm.js";
// node_modules/@tanstack/query-core/build/modern/mutationObserver.js
var oe = class extends c {
	#e;
	#t = void 0;
	#n;
	#r;
	constructor(e, t) {
		super(), this.#e = e, this.setOptions(t), this.bindMethods(), this.#i();
	}
	bindMethods() {
		this.mutate = this.mutate.bind(this), this.reset = this.reset.bind(this);
	}
	setOptions(e) {
		let t = this.options;
		this.options = this.#e.defaultMutationOptions(e), s(this.options, t) || this.#e.getMutationCache().notify({
			type: "observerOptionsUpdated",
			mutation: this.#n,
			observer: this
		}), t?.mutationKey && this.options.mutationKey && l(t.mutationKey) !== l(this.options.mutationKey) ? this.reset() : this.#n?.state.status === "pending" && this.#n.setOptions(this.options);
	}
	onSubscribe() {
		this.listeners.size === 1 && this.#n && (this.#n.addObserver(this), this.#i());
	}
	onUnsubscribe() {
		this.hasListeners() || this.#n?.removeObserver(this);
	}
	onMutationUpdate(e) {
		this.#i(), this.#a(e);
	}
	getCurrentResult() {
		return this.#t;
	}
	reset() {
		this.#n?.removeObserver(this), this.#n = void 0, this.#i(), this.#a();
	}
	mutate(e, t) {
		return this.#r = t, this.#n?.removeObserver(this), this.#n = this.#e.getMutationCache().build(this.#e, this.options), this.#n.addObserver(this), this.#n.execute(e);
	}
	#i() {
		let e = this.#n?.state ?? m();
		this.#t = {
			...e,
			isPending: e.status === "pending",
			isSuccess: e.status === "success",
			isError: e.status === "error",
			isIdle: e.status === "idle",
			mutate: this.mutate,
			reset: this.reset
		};
	}
	#a(e) {
		d.batch(() => {
			let t = this.#r;
			if (t && this.hasListeners()) {
				let n = this.#t.variables, r = this.#t.context, i = {
					client: this.#e,
					meta: this.options.meta,
					mutationKey: this.options.mutationKey
				};
				if (e?.type === "success") {
					try {
						t.onSuccess?.(e.data, n, r, i);
					} catch (e) {
						Promise.reject(e);
					}
					try {
						t.onSettled?.(e.data, null, n, r, i);
					} catch (e) {
						Promise.reject(e);
					}
				} else if (e?.type === "error") {
					try {
						t.onError?.(e.error, n, r, i);
					} catch (e) {
						Promise.reject(e);
					}
					try {
						t.onSettled?.(void 0, e.error, n, r, i);
					} catch (e) {
						Promise.reject(e);
					}
				}
			}
			this.listeners.forEach((e) => {
				e(this.#t);
			});
		});
	}
}, P = /* @__PURE__ */ n(a(), 1);
function se(e, t) {
	let n = o(t), [r] = P.useState(() => new oe(n, e));
	P.useEffect(() => {
		r.setOptions(e);
	}, [r, e]);
	let i = P.useSyncExternalStore(P.useCallback((e) => r.subscribe(d.batchCalls(e)), [r]), () => r.getCurrentResult(), () => r.getCurrentResult()), a = P.useCallback((...e) => {
		r.mutate(e[0], e[1]).catch(u);
	}, [r]);
	if (i.error && f(r.options.throwOnError, [i.error])) throw i.error;
	return {
		...i,
		mutate: a,
		mutateAsync: i.mutate
	};
}
// src/pages/performance/Denials.tsx
var F = t(), I = (e) => e ? new Date(e).toLocaleString(void 0, {
	day: "numeric",
	month: "short",
	hour: "2-digit",
	minute: "2-digit"
}) : "—", L = {
	blocked: "Over the beds",
	nocap: "No bed count",
	badtime: "Row check-out before check-in",
	window: "Building / dates missing",
	server: "Server refused"
}, ce = {
	save: "Save",
	update: "Edit",
	copy: "Save as a copy"
}, le = {
	row: "this slip's row",
	builder: "Rooms & Buildings",
	history: "an older slip"
}, ue = {
	makkah: "Makkah",
	medina: "Medina"
}, R = (e) => {
	try {
		return JSON.parse(e.detail || "{}");
	} catch {
		return {};
	}
}, z = (e) => (e.kinds || "").split(",").filter(Boolean), B = (e, t) => e?.last_sync ? Math.round((Date.parse(t) - Date.parse(e.last_sync)) / 6e4) : null, V = (e) => {
	let t = /* @__PURE__ */ new Map();
	return e.forEach((e) => t.set(e, (t.get(e) || 0) + 1)), [...t].sort((e, t) => t[1] - e[1]);
};
function H({ cs: e, cap: t }) {
	if (!e) return /* @__PURE__ */ (0, F.jsxs)(F.Fragment, { children: [t ?? "?", " beds"] });
	let n = [
		e.used !== "row" && e.row ? `row says ${e.row}` : "",
		e.used !== "builder" && e.builder ? `Rooms & Buildings says ${e.builder}` : "",
		e.builder ? "" : "not in Rooms & Buildings"
	].filter(Boolean), r = e.row && e.builder && e.row !== e.builder;
	return /* @__PURE__ */ (0, F.jsxs)(F.Fragment, { children: [
		/* @__PURE__ */ (0, F.jsxs)("b", { children: [t ?? "?", " beds"] }),
		" from ",
		le[e.used] || "nowhere",
		n.length > 0 && ` (${n.join("; ")})`,
		r && /* @__PURE__ */ (0, F.jsx)(N, {
			variant: "destructive",
			className: "ml-1.5",
			children: "row ≠ Rooms & Buildings"
		})
	] });
}
function de({ x: e, d: t }) {
	let n = "font-bold text-destructive";
	if (e.kind === "blocked") {
		let t = e.others?.length ? e.others : e.who || [];
		return /* @__PURE__ */ (0, F.jsxs)("li", {
			className: "grid gap-1",
			children: [
				/* @__PURE__ */ (0, F.jsxs)("span", { children: [
					/* @__PURE__ */ (0, F.jsxs)("b", {
						className: n,
						children: [
							"Room ",
							e.room,
							": ",
							e.total,
							"/",
							e.cap,
							" on ",
							I(e.at)
						]
					}),
					" — other groups ",
					e.existing,
					" + this slip ",
					e.want,
					"."
				] }),
				/* @__PURE__ */ (0, F.jsxs)("span", {
					className: "text-xs text-muted-foreground",
					children: ["Capacity: ", /* @__PURE__ */ (0, F.jsx)(H, {
						cs: e.cap_source,
						cap: e.cap
					})]
				}),
				t.length > 0 && /* @__PURE__ */ (0, F.jsxs)(F.Fragment, { children: [/* @__PURE__ */ (0, F.jsxs)(j, { children: [/* @__PURE__ */ (0, F.jsx)(O, { children: /* @__PURE__ */ (0, F.jsxs)(A, { children: [
					/* @__PURE__ */ (0, F.jsx)(E, { children: "Other stays in the room during this slip" }),
					/* @__PURE__ */ (0, F.jsx)(E, {
						className: "text-right",
						children: "Beds"
					}),
					/* @__PURE__ */ (0, F.jsx)(E, { children: "From → to" }),
					/* @__PURE__ */ (0, F.jsx)(E, {})
				] }) }), /* @__PURE__ */ (0, F.jsx)(D, { children: t.map((t, n) => {
					let r = e.at && Date.parse(t.start) <= Date.parse(e.at) && Date.parse(e.at) < Date.parse(t.end);
					return /* @__PURE__ */ (0, F.jsxs)(A, {
						className: M(r && "bg-bad-soft"),
						children: [
							/* @__PURE__ */ (0, F.jsxs)(k, { children: [
								"SH ",
								t.sh || "—",
								t.id && /* @__PURE__ */ (0, F.jsxs)("small", {
									className: "ml-1 text-muted-foreground",
									children: ["#", t.id]
								}),
								t.ums && /* @__PURE__ */ (0, F.jsx)("small", {
									className: "ml-1 text-muted-foreground",
									children: "UMS"
								})
							] }),
							/* @__PURE__ */ (0, F.jsx)(k, {
								className: "text-right",
								children: t.beds
							}),
							/* @__PURE__ */ (0, F.jsxs)(k, { children: [
								I(t.start),
								" → ",
								I(t.end)
							] }),
							/* @__PURE__ */ (0, F.jsx)(k, { children: t.status && t.status !== "booked" ? `delayed · ${t.status}` : "" })
						]
					}, n);
				}) })] }), /* @__PURE__ */ (0, F.jsx)("small", {
					className: "text-muted-foreground",
					children: "Highlighted = in the room at the busiest moment."
				})] })
			]
		});
	}
	return e.kind === "nocap" ? /* @__PURE__ */ (0, F.jsxs)("li", { children: [
		/* @__PURE__ */ (0, F.jsxs)("b", {
			className: n,
			children: [
				"Room ",
				e.room,
				": no bed count"
			]
		}),
		" — ",
		/* @__PURE__ */ (0, F.jsx)(H, {
			cs: e.cap_source,
			cap: 0
		})
	] }) : e.kind === "badtime" ? /* @__PURE__ */ (0, F.jsxs)("li", { children: [/* @__PURE__ */ (0, F.jsxs)("b", {
		className: n,
		children: [
			"Room ",
			e.room,
			": its own check-out is before the check-in"
		]
	}), e.out && ` (row leaves ${e.out.date} ${e.out.time})`] }) : e.kind === "window" ? /* @__PURE__ */ (0, F.jsxs)("li", { children: [
		/* @__PURE__ */ (0, F.jsx)("b", {
			className: n,
			children: e.missing?.length ? `Missing or wrong: ${e.missing.join(", ")}` : "Building or dates missing"
		}),
		" (typed: building “",
		t.building,
		"”, ",
		t.form?.checkin,
		" → ",
		t.form?.checkout,
		")"
	] }) : e.kind === "server" ? /* @__PURE__ */ (0, F.jsxs)("li", { children: [
		/* @__PURE__ */ (0, F.jsxs)("b", {
			className: n,
			children: [
				"Server refused",
				e.status ? ` (${e.status})` : "",
				":"
			]
		}),
		" ",
		e.message
	] }) : /* @__PURE__ */ (0, F.jsx)("li", { children: JSON.stringify(e) });
}
function fe({ row: e }) {
	let t = R(e), n = t.form || {}, r = t.copy, i = B(r, e.at), [a, o] = (0, P.useState)("");
	return /* @__PURE__ */ (0, F.jsxs)("div", {
		className: "grid gap-2 border-t bg-white p-3 text-sm",
		children: [
			/* @__PURE__ */ (0, F.jsxs)("div", {
				className: "grid gap-1",
				children: [
					/* @__PURE__ */ (0, F.jsxs)("span", { children: [
						/* @__PURE__ */ (0, F.jsx)("b", { children: "Typed" }),
						" ",
						n.checkin,
						" → ",
						n.checkout,
						" · G ",
						n.gents || 0,
						" · L ",
						n.ladies || 0,
						" · C ",
						n.children || 0,
						" · I ",
						n.infants || 0,
						" · total ",
						n.total || 0,
						n.delayed ? " · delayed departure on" : ""
					] }),
					/* @__PURE__ */ (0, F.jsxs)("span", { children: [
						/* @__PURE__ */ (0, F.jsx)("b", { children: "Rooms in this slip" }),
						" ",
						(t.rows || []).map((e) => `${e.room} × ${e.beds}${e.cap_row ? ` (row cap ${e.cap_row})` : ""}`).join(", ") || "—"
					] }),
					/* @__PURE__ */ (0, F.jsxs)("span", { children: [
						/* @__PURE__ */ (0, F.jsx)("b", { children: "Data used" }),
						" ",
						r ? /* @__PURE__ */ (0, F.jsxs)(F.Fragment, { children: [
							r.synced ? "fresh from the server" : /* @__PURE__ */ (0, F.jsx)(N, {
								variant: "destructive",
								children: "could not reach the server — this browser's copy"
							}),
							" · ",
							r.slips,
							" slips",
							i == null ? " · never synced" : ` · last sync ${i <= 0 ? "just before" : `${i} min before`}`,
							r.online === !1 && " · offline"
						] }) : "—"
					] })
				]
			}),
			/* @__PURE__ */ (0, F.jsx)("ol", {
				className: "grid list-decimal gap-2 pl-5",
				children: (t.issues || []).map((e, n) => /* @__PURE__ */ (0, F.jsx)(de, {
					x: e,
					d: t
				}, n))
			}),
			t.ok_rooms?.length > 0 && /* @__PURE__ */ (0, F.jsxs)("p", {
				className: "font-semibold text-ok",
				children: ["✓ OK: ", t.ok_rooms.map((e) => `${e.room} ${e.after}/${e.cap}`).join(" · ")]
			}),
			/* @__PURE__ */ (0, F.jsx)("div", { children: /* @__PURE__ */ (0, F.jsx)(C, {
				size: "sm",
				variant: "outline",
				onClick: async () => {
					try {
						await navigator.clipboard.writeText(JSON.stringify({
							...e,
							detail: R(e)
						}, null, 2)), o("Copied ✓");
					} catch {
						o("Could not copy");
					}
				},
				children: a || "Copy the full record (JSON)"
			}) })
		]
	});
}
function U({ title: e, pairs: t }) {
	return t.length ? /* @__PURE__ */ (0, F.jsxs)("div", {
		className: "flex flex-wrap items-center gap-1.5",
		children: [/* @__PURE__ */ (0, F.jsx)("b", {
			className: "text-sm",
			children: e
		}), t.map(([e, t]) => /* @__PURE__ */ (0, F.jsxs)(N, {
			variant: "secondary",
			className: "font-normal",
			children: [
				e,
				" ",
				/* @__PURE__ */ (0, F.jsx)("i", {
					className: "ml-1 font-bold not-italic",
					children: t
				})
			]
		}, e))]
	}) : null;
}
function pe({ list: e }) {
	let [t, n] = (0, P.useState)("all"), [r, i] = (0, P.useState)("all"), [a, o] = (0, P.useState)(""), [s, c] = (0, P.useState)(!1), [l, u] = (0, P.useState)(null), d = (/* @__PURE__ */ new Date()).toDateString(), f = (e) => new Date(e.at).toDateString() === d, p = Object.keys(L).filter((t) => e.some((e) => z(e).includes(t))), m = [...new Set(e.map((e) => e.desk))].sort(), b = (0, P.useMemo)(() => {
		let n = a.trim().toUpperCase();
		return e.filter((e) => (s || f(e)) && (t === "all" || z(e).includes(t)) && (r === "all" || e.desk === r) && (!n || String(e.sh_no || "").toUpperCase().includes(n) || `,${e.rooms || ""},`.toUpperCase().includes(`,${n},`)));
	}, [
		e,
		t,
		r,
		a,
		s
	]), x = e.filter((e) => R(e).copy?.synced === !1).length, S = e.filter((e) => (R(e).issues || []).some((e) => e.cap_source?.row && e.cap_source?.builder && e.cap_source.row !== e.cap_source.builder)).length;
	return /* @__PURE__ */ (0, F.jsxs)("section", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, F.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, F.jsx)("h2", {
						className: "mr-2 text-base font-bold text-primary",
						children: "Slip saves refused"
					}),
					/* @__PURE__ */ (0, F.jsx)("span", {
						className: "min-w-0 flex-1 text-xs text-muted-foreground",
						children: "every Save / Edit / Save as a copy the Slip page stopped, with each condition it checked — open one to see why"
					}),
					/* @__PURE__ */ (0, F.jsxs)(y, {
						value: t,
						onValueChange: n,
						children: [/* @__PURE__ */ (0, F.jsx)(g, {
							className: "w-44",
							"aria-label": "Reason",
							children: /* @__PURE__ */ (0, F.jsx)(h, {})
						}), /* @__PURE__ */ (0, F.jsxs)(_, { children: [/* @__PURE__ */ (0, F.jsx)(v, {
							value: "all",
							children: "All reasons"
						}), p.map((e) => /* @__PURE__ */ (0, F.jsx)(v, {
							value: e,
							children: L[e]
						}, e))] })]
					}),
					/* @__PURE__ */ (0, F.jsxs)(y, {
						value: r,
						onValueChange: i,
						children: [/* @__PURE__ */ (0, F.jsx)(g, {
							className: "w-36",
							"aria-label": "Login",
							children: /* @__PURE__ */ (0, F.jsx)(h, {})
						}), /* @__PURE__ */ (0, F.jsxs)(_, { children: [/* @__PURE__ */ (0, F.jsx)(v, {
							value: "all",
							children: "All logins"
						}), m.map((e) => /* @__PURE__ */ (0, F.jsx)(v, {
							value: e,
							children: e
						}, e))] })]
					}),
					/* @__PURE__ */ (0, F.jsx)(ie, {
						className: "w-40",
						type: "search",
						placeholder: "SH or room",
						"aria-label": "Find SH or room",
						value: a,
						onChange: (e) => o(e.target.value)
					}),
					/* @__PURE__ */ (0, F.jsxs)("label", {
						className: "flex items-center gap-1.5 text-sm",
						children: [
							/* @__PURE__ */ (0, F.jsx)("input", {
								type: "checkbox",
								checked: s,
								onChange: (e) => c(e.target.checked)
							}),
							"Show earlier days",
							e.some((e) => !f(e)) ? ` (${e.filter((e) => !f(e)).length})` : ""
						]
					})
				]
			}),
			e.length > 0 && /* @__PURE__ */ (0, F.jsxs)("div", {
				className: "grid gap-2 rounded-lg bg-muted p-3",
				children: [
					/* @__PURE__ */ (0, F.jsx)(U, {
						title: "Reasons",
						pairs: V(e.flatMap(z)).map(([e, t]) => [L[e] || e, t])
					}),
					/* @__PURE__ */ (0, F.jsx)(U, {
						title: "Logins",
						pairs: V(e.map((e) => e.desk))
					}),
					/* @__PURE__ */ (0, F.jsx)(U, {
						title: "Rooms",
						pairs: V(e.flatMap((e) => (e.rooms || "").split(",").filter(Boolean).map((t) => `${e.building} ${t}`))).slice(0, 12)
					}),
					/* @__PURE__ */ (0, F.jsx)(U, {
						title: "Groups (SH)",
						pairs: V(e.map((e) => e.sh_no || "").filter(Boolean)).filter(([, e]) => e > 1).slice(0, 12)
					}),
					(x > 0 || S > 0) && /* @__PURE__ */ (0, F.jsxs)("p", {
						className: "text-sm font-semibold text-warn",
						children: [x > 0 && `${x} refused on a copy that could not be refreshed from the server. `, S > 0 && `${S} had a row capacity different from Rooms & Buildings.`]
					})
				]
			}),
			b.length ? /* @__PURE__ */ (0, F.jsx)("div", {
				className: "overflow-x-auto rounded-lg border",
				children: /* @__PURE__ */ (0, F.jsxs)(j, { children: [/* @__PURE__ */ (0, F.jsx)(O, { children: /* @__PURE__ */ (0, F.jsxs)(A, { children: [
					/* @__PURE__ */ (0, F.jsx)(E, { children: "When" }),
					/* @__PURE__ */ (0, F.jsx)(E, { children: "Login" }),
					/* @__PURE__ */ (0, F.jsx)(E, { children: "Site" }),
					/* @__PURE__ */ (0, F.jsx)(E, { children: "Action" }),
					/* @__PURE__ */ (0, F.jsx)(E, { children: "SH" }),
					/* @__PURE__ */ (0, F.jsx)(E, { children: "Building" }),
					/* @__PURE__ */ (0, F.jsx)(E, { children: "Rooms" }),
					/* @__PURE__ */ (0, F.jsx)(E, { children: "Why" })
				] }) }), /* @__PURE__ */ (0, F.jsx)(D, { children: b.map((e) => [/* @__PURE__ */ (0, F.jsxs)(A, {
					className: "cursor-pointer",
					onClick: () => u(l === e.id ? null : e.id),
					children: [
						/* @__PURE__ */ (0, F.jsx)(k, {
							className: "whitespace-nowrap",
							children: I(e.at)
						}),
						/* @__PURE__ */ (0, F.jsx)(k, { children: /* @__PURE__ */ (0, F.jsx)("b", { children: e.desk }) }),
						/* @__PURE__ */ (0, F.jsx)(k, { children: ue[e.site || ""] || e.site || "" }),
						/* @__PURE__ */ (0, F.jsx)(k, { children: ce[e.action] || e.action }),
						/* @__PURE__ */ (0, F.jsxs)(k, { children: [/* @__PURE__ */ (0, F.jsx)("b", { children: e.sh_no || "—" }), e.slip_id && /* @__PURE__ */ (0, F.jsxs)("small", {
							className: "ml-1 text-muted-foreground",
							children: ["#", e.slip_id]
						})] }),
						/* @__PURE__ */ (0, F.jsx)(k, { children: e.building || "—" }),
						/* @__PURE__ */ (0, F.jsx)(k, {
							className: "whitespace-normal",
							children: (e.rooms || "").split(",").filter(Boolean).join(", ")
						}),
						/* @__PURE__ */ (0, F.jsx)(k, {
							className: "whitespace-normal",
							children: /* @__PURE__ */ (0, F.jsx)("span", {
								className: "flex flex-wrap gap-1",
								children: z(e).map((e) => /* @__PURE__ */ (0, F.jsx)(N, {
									variant: "destructive",
									children: L[e] || e
								}, e))
							})
						})
					]
				}, e.id), l === e.id && /* @__PURE__ */ (0, F.jsx)(A, { children: /* @__PURE__ */ (0, F.jsx)(k, {
					colSpan: 8,
					className: "whitespace-normal p-0",
					children: /* @__PURE__ */ (0, F.jsx)(fe, { row: e })
				}) }, `${e.id}-d`)]) })] })
			}) : /* @__PURE__ */ (0, F.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: e.length ? s ? "None match." : "No refused saves today — tick “Show earlier days” to see the rest." : "No refused slip saves in this period."
			})
		]
	});
}
// src/pages/performance/AiFixes.tsx
var W = (e) => e ? new Date(e).toLocaleString(void 0, {
	day: "numeric",
	month: "short",
	hour: "2-digit",
	minute: "2-digit"
}) : "", me = {
	done: "default",
	running: "secondary",
	queued: "secondary",
	failed: "destructive",
	"rolled-back": "destructive",
	"no-change": "outline",
	"not-configured": "destructive"
}, he = {
	done: "✅ Fixed & live",
	running: "⏳ Working",
	queued: "⏳ Queued",
	failed: "❌ Failed",
	"rolled-back": "↩ Rolled back",
	"no-change": "— No change",
	"not-configured": "⚙ Not connected"
};
function ge({ can: e, source: t, sourceId: n, title: r, detail: a, onDone: o }) {
	let { cloud: s } = i(), [c, l] = (0, P.useState)(!1), [u, d] = (0, P.useState)(""), [f, p] = (0, P.useState)(!1), [m, h] = (0, P.useState)("");
	return e ? c ? /* @__PURE__ */ (0, F.jsxs)("div", {
		className: "grid w-full max-w-xl gap-2 rounded-lg border border-gold/50 bg-gold/5 p-2 text-sm",
		onClick: (e) => e.stopPropagation(),
		children: [
			/* @__PURE__ */ (0, F.jsxs)("b", { children: ["🤖 Fix with AI — ", r.slice(0, 90)] }),
			/* @__PURE__ */ (0, F.jsx)("textarea", {
				className: "min-h-16 rounded-md border bg-white p-2",
				placeholder: "Instructions for the AI (optional) — what the right behaviour is, what not to touch…",
				value: u,
				onChange: (e) => d(e.target.value)
			}),
			/* @__PURE__ */ (0, F.jsx)("span", {
				className: "text-xs text-muted-foreground",
				children: "The AI changes the code, deploys to staging, checks it, then deploys live and reports here. It never changes the database."
			}),
			/* @__PURE__ */ (0, F.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, F.jsx)(C, {
						size: "sm",
						disabled: f,
						onClick: async () => {
							p(!0), h("");
							try {
								let e = await s.request("POST", "/api/ai/fix", {
									source: t,
									source_id: String(n ?? ""),
									title: r,
									detail: a,
									note: u
								});
								h(`#${e.job.id}: ${e.job.message || e.job.status}`), l(!1), o?.();
							} catch (e) {
								h(e?.message || "Could not start.");
							} finally {
								p(!1);
							}
						},
						children: "Approve & start"
					}),
					/* @__PURE__ */ (0, F.jsx)(C, {
						size: "sm",
						variant: "ghost",
						onClick: () => l(!1),
						children: "Cancel"
					}),
					/* @__PURE__ */ (0, F.jsx)("span", {
						className: "text-xs",
						children: m
					})
				]
			})
		]
	}) : /* @__PURE__ */ (0, F.jsx)(C, {
		size: "sm",
		variant: "outline",
		onClick: (e) => {
			e.stopPropagation(), l(!0);
		},
		children: "🤖 Fix with AI"
	}) : null;
}
function _e({ data: e, onChanged: t }) {
	let [n, r] = (0, P.useState)(null), [i, a] = (0, P.useState)(""), [o, s] = (0, P.useState)(""), c = e?.jobs ?? [];
	return /* @__PURE__ */ (0, F.jsxs)("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, F.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, F.jsx)("h2", {
					className: "text-lg font-bold",
					children: "AI fixes"
				}), /* @__PURE__ */ (0, F.jsx)("span", {
					className: "text-xs text-muted-foreground",
					children: "approved by taha.ali only · the AI fixes the code, deploys staging → live, and reports back · it never changes the database"
				})]
			}),
			e && !e.configured && /* @__PURE__ */ (0, F.jsx)("p", {
				className: "rounded-md border border-warn/50 bg-warn/10 p-2 text-sm",
				children: "GitHub is not connected yet, so approved fixes cannot start. (Server secret GITHUB_DISPATCH_TOKEN.)"
			}),
			e?.can_approve && /* @__PURE__ */ (0, F.jsxs)("div", {
				className: "grid max-w-2xl gap-2 rounded-lg border p-3",
				children: [
					/* @__PURE__ */ (0, F.jsx)("b", {
						className: "text-sm",
						children: "Describe a problem to fix"
					}),
					/* @__PURE__ */ (0, F.jsx)("input", {
						className: "rounded-md border p-2 text-sm",
						placeholder: "What is wrong — e.g. “Home page takes 5 s on phones”",
						value: i,
						onChange: (e) => a(e.target.value)
					}),
					/* @__PURE__ */ (0, F.jsx)("textarea", {
						className: "min-h-20 rounded-md border p-2 text-sm",
						placeholder: "Details: which page, what you see, what should happen",
						value: o,
						onChange: (e) => s(e.target.value)
					}),
					i.trim() && /* @__PURE__ */ (0, F.jsx)(ge, {
						can: !0,
						source: "manual",
						title: i.trim(),
						detail: o,
						onDone: () => {
							a(""), s(""), t();
						}
					})
				]
			}),
			c.length ? /* @__PURE__ */ (0, F.jsx)("div", {
				className: "overflow-x-auto rounded-lg border",
				children: /* @__PURE__ */ (0, F.jsxs)(j, { children: [/* @__PURE__ */ (0, F.jsx)(O, { children: /* @__PURE__ */ (0, F.jsxs)(A, { children: [
					/* @__PURE__ */ (0, F.jsx)(E, { children: "#" }),
					/* @__PURE__ */ (0, F.jsx)(E, { children: "Approved" }),
					/* @__PURE__ */ (0, F.jsx)(E, { children: "Problem" }),
					/* @__PURE__ */ (0, F.jsx)(E, { children: "Status" }),
					/* @__PURE__ */ (0, F.jsx)(E, { children: "Result" })
				] }) }), /* @__PURE__ */ (0, F.jsx)(D, { children: c.map((e) => [/* @__PURE__ */ (0, F.jsxs)(A, {
					className: "cursor-pointer",
					onClick: () => r(n === e.id ? null : e.id),
					children: [
						/* @__PURE__ */ (0, F.jsx)(k, { children: e.id }),
						/* @__PURE__ */ (0, F.jsxs)(k, {
							className: "whitespace-nowrap",
							children: [W(e.requested_at), /* @__PURE__ */ (0, F.jsx)("small", {
								className: "block text-muted-foreground",
								children: e.requested_name
							})]
						}),
						/* @__PURE__ */ (0, F.jsxs)(k, {
							className: "max-w-[30rem] whitespace-normal",
							children: [/* @__PURE__ */ (0, F.jsx)("b", { children: e.title }), e.source && e.source !== "manual" ? /* @__PURE__ */ (0, F.jsxs)("small", {
								className: "ml-1 text-muted-foreground",
								children: [
									"(",
									e.source,
									" ",
									e.source_id,
									")"
								]
							}) : ""]
						}),
						/* @__PURE__ */ (0, F.jsxs)(k, { children: [/* @__PURE__ */ (0, F.jsx)(N, {
							variant: me[e.status] || "outline",
							children: he[e.status] || e.status
						}), /* @__PURE__ */ (0, F.jsx)("small", {
							className: "block text-muted-foreground",
							children: W(e.updated_at)
						})] }),
						/* @__PURE__ */ (0, F.jsx)(k, {
							className: "max-w-[26rem] whitespace-normal text-xs",
							children: e.message
						})
					]
				}, e.id), n === e.id && /* @__PURE__ */ (0, F.jsx)(A, { children: /* @__PURE__ */ (0, F.jsx)(k, {
					colSpan: 5,
					className: "whitespace-normal bg-muted/30 text-sm",
					children: /* @__PURE__ */ (0, F.jsxs)("div", {
						className: "grid gap-1",
						children: [
							e.note && /* @__PURE__ */ (0, F.jsxs)("span", { children: [
								/* @__PURE__ */ (0, F.jsx)("b", { children: "Instructions" }),
								" ",
								e.note
							] }),
							e.summary && /* @__PURE__ */ (0, F.jsxs)("div", { children: [/* @__PURE__ */ (0, F.jsx)("b", { children: "What the AI did" }), /* @__PURE__ */ (0, F.jsx)("pre", {
								className: "mt-1 max-h-72 overflow-auto whitespace-pre-wrap font-sans text-xs",
								children: e.summary
							})] }),
							e.files && /* @__PURE__ */ (0, F.jsxs)("span", { children: [
								/* @__PURE__ */ (0, F.jsx)("b", { children: "Files" }),
								" ",
								/* @__PURE__ */ (0, F.jsx)("span", {
									className: "font-mono text-xs",
									children: e.files
								})
							] }),
							/* @__PURE__ */ (0, F.jsxs)("span", {
								className: "flex flex-wrap gap-3",
								children: [
									e.run_url && /* @__PURE__ */ (0, F.jsx)("a", {
										className: "underline",
										href: e.run_url,
										target: "_blank",
										rel: "noopener",
										children: "GitHub run"
									}),
									e.commit_sha && /* @__PURE__ */ (0, F.jsxs)("a", {
										className: "underline",
										href: `https://github.com/faizehashemi/faizehashemi.github.io/commit/${e.commit_sha}`,
										target: "_blank",
										rel: "noopener",
										children: ["commit ", e.commit_sha.slice(0, 7)]
									}),
									e.deploy_web && /* @__PURE__ */ (0, F.jsxs)("span", { children: ["web ", e.deploy_web.slice(0, 8)] }),
									e.deploy_api && /* @__PURE__ */ (0, F.jsxs)("span", { children: ["api ", e.deploy_api.slice(0, 8)] })
								]
							})
						]
					})
				}) }, `${e.id}-d`)]) })] })
			}) : /* @__PURE__ */ (0, F.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No AI fixes yet."
			})
		]
	});
}
// src/pages/performance/Issues.tsx
var G = (e) => e ? new Date(e).toLocaleString(void 0, {
	day: "numeric",
	month: "short",
	hour: "2-digit",
	minute: "2-digit"
}) : "—", K = {
	makkah: "Makkah",
	medina: "Medina"
}, q = ({ title: e, items: t, mono: n = !0 }) => t?.length ? /* @__PURE__ */ (0, F.jsxs)("div", { children: [/* @__PURE__ */ (0, F.jsx)("h4", {
	className: "mt-2 text-sm font-bold",
	children: e
}), /* @__PURE__ */ (0, F.jsx)("ul", {
	className: `ml-5 list-disc text-xs ${n ? "font-mono" : ""}`,
	children: t.map((e, t) => /* @__PURE__ */ (0, F.jsx)("li", { children: e }, t))
})] }) : null;
function ve({ row: e, onStatus: t, canFix: n, onFix: a }) {
	let { cloud: o } = i(), s = r(), [c, l] = (0, P.useState)(null), [u, d] = (0, P.useState)(""), [f, p] = (0, P.useState)("");
	if ((0, P.useEffect)(() => {
		s(o.request("GET", `/api/issues/${e.id}`)).then((n) => {
			l(n.issue), e.status === "new" && o.request("PATCH", `/api/issues/${e.id}`, { status: "seen" }).then(() => t("seen")).catch(() => {});
		}).catch((e) => d(e.message || "Could not load."));
	}, [e.id]), u) return /* @__PURE__ */ (0, F.jsx)("p", {
		className: "text-sm text-destructive",
		children: u
	});
	if (!c) return /* @__PURE__ */ (0, F.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "Loading…"
	});
	let m = c.diag || {}, b = m.viewport || {}, x = m.ctx || {}, S = m.settings || {};
	return /* @__PURE__ */ (0, F.jsxs)("div", {
		className: "grid gap-2 text-sm",
		children: [
			/* @__PURE__ */ (0, F.jsx)("p", {
				className: "whitespace-pre-wrap font-bold",
				children: c.text
			}),
			c.shot ? /* @__PURE__ */ (0, F.jsx)("a", {
				href: c.shot,
				target: "_blank",
				rel: "noopener",
				title: "Open the picture full size",
				children: /* @__PURE__ */ (0, F.jsx)("img", {
					alt: "Screenshot from the desk",
					src: c.shot,
					className: "block max-h-[420px] max-w-full rounded-lg border"
				})
			}) : /* @__PURE__ */ (0, F.jsxs)("p", {
				className: "text-muted-foreground",
				children: [
					"No picture",
					m.shot_error ? ` (${m.shot_error})` : " sent",
					"."
				]
			}),
			/* @__PURE__ */ (0, F.jsxs)("div", {
				className: "grid gap-1",
				children: [
					/* @__PURE__ */ (0, F.jsxs)("span", { children: [
						/* @__PURE__ */ (0, F.jsx)("b", { children: "Page" }),
						" ",
						c.page,
						" · ",
						c.url,
						m.react ? " · React page" : ""
					] }),
					/* @__PURE__ */ (0, F.jsxs)("span", { children: [
						/* @__PURE__ */ (0, F.jsx)("b", { children: "Window" }),
						" ",
						b.w,
						"×",
						b.h,
						" px, ratio ",
						b.dpr,
						", scrolled ",
						b.scrollX,
						"/",
						b.scrollY,
						", page is ",
						b.pageW,
						"×",
						b.pageH,
						b.pageW > b.w + 2 && /* @__PURE__ */ (0, F.jsx)(N, {
							variant: "destructive",
							className: "ml-1",
							children: "wider than the window"
						}),
						" · ",
						b.orientation
					] }),
					/* @__PURE__ */ (0, F.jsxs)("span", { children: [
						/* @__PURE__ */ (0, F.jsx)("b", { children: "Device" }),
						" ",
						x.device,
						" · ",
						x.os,
						" · ",
						x.browser,
						" ",
						x.browser_ver,
						" · ",
						x.app,
						m.standalone ? " (installed app)" : "",
						" · screen ",
						x.screen,
						" · ",
						x.net_type || "",
						" ",
						m.online === !1 ? "· offline" : ""
					] }),
					/* @__PURE__ */ (0, F.jsxs)("span", { children: [
						/* @__PURE__ */ (0, F.jsx)("b", { children: "Build" }),
						" ",
						x.build,
						" · page opened in ",
						m.page_ms == null ? "—" : `${m.page_ms} ms`,
						" · looks: ",
						S.theme,
						", text ",
						S.textScale,
						"%, ",
						S.density,
						S.phoneCards === !1 ? ", cards off" : ""
					] }),
					/* @__PURE__ */ (0, F.jsxs)("span", { children: [
						/* @__PURE__ */ (0, F.jsx)("b", { children: "Who" }),
						" ",
						c.desk,
						" (",
						c.role,
						") · ",
						K[c.site] || c.site || "",
						" · ",
						c.colo || "",
						" ",
						c.country || ""
					] })
				]
			}),
			/* @__PURE__ */ (0, F.jsx)(q, {
				title: "Wider than the window",
				items: m.wider_than_window
			}),
			/* @__PURE__ */ (0, F.jsx)(q, {
				title: "Errors in this browser",
				items: m.errors
			}),
			/* @__PURE__ */ (0, F.jsx)(q, {
				title: "Failed calls",
				items: m.failed_calls
			}),
			/* @__PURE__ */ (0, F.jsx)(q, {
				title: "Pages visited just before",
				items: m.recent_pages
			}),
			/* @__PURE__ */ (0, F.jsx)(q, {
				title: "Dialogs open",
				items: m.open_dialogs,
				mono: !1
			}),
			m.dom && /* @__PURE__ */ (0, F.jsxs)("details", { children: [/* @__PURE__ */ (0, F.jsx)("summary", {
				className: "cursor-pointer",
				children: "Text on the page"
			}), /* @__PURE__ */ (0, F.jsx)("pre", {
				className: "max-h-64 overflow-auto whitespace-pre-wrap font-mono text-xs",
				children: m.dom
			})] }),
			/* @__PURE__ */ (0, F.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, F.jsx)(ge, {
						can: n,
						source: "issue",
						sourceId: c.id,
						title: `Issue #${c.id} on ${c.page || "a page"}: ${String(c.text || "").slice(0, 120)}`,
						detail: (() => {
							let { shot: e, ...t } = c;
							return JSON.stringify(t, null, 1).slice(0, 11e3);
						})(),
						onDone: a
					}),
					/* @__PURE__ */ (0, F.jsx)(C, {
						size: "sm",
						variant: "outline",
						onClick: async () => {
							let { shot: e, ...t } = c;
							try {
								await navigator.clipboard.writeText(JSON.stringify(t, null, 2)), p("Copied ✓");
							} catch {
								p("Could not copy");
							}
						},
						children: "Copy the full report (JSON, without the picture)"
					}),
					/* @__PURE__ */ (0, F.jsx)("span", {
						className: "text-xs",
						children: f
					}),
					/* @__PURE__ */ (0, F.jsxs)("label", {
						className: "ml-auto flex items-center gap-2",
						children: ["Status", /* @__PURE__ */ (0, F.jsxs)(y, {
							value: e.status,
							onValueChange: (n) => {
								o.request("PATCH", `/api/issues/${e.id}`, { status: n }).then(() => t(n));
							},
							children: [/* @__PURE__ */ (0, F.jsx)(g, {
								className: "h-8 w-28",
								children: /* @__PURE__ */ (0, F.jsx)(h, {})
							}), /* @__PURE__ */ (0, F.jsx)(_, { children: [
								"new",
								"seen",
								"handled"
							].map((e) => /* @__PURE__ */ (0, F.jsx)(v, {
								value: e,
								children: e
							}, e)) })]
						})]
					})
				]
			})
		]
	});
}
function ye({ list: e, onStatus: t, canFix: n = !1, onFix: r = () => {} }) {
	let [i, a] = (0, P.useState)("open"), [o, s] = (0, P.useState)("all"), [c, l] = (0, P.useState)(!1), [u, d] = (0, P.useState)(null), f = (0, P.useMemo)(() => [...new Set(e.map((e) => e.page).filter(Boolean))].sort(), [e]), p = e.filter((e) => (c || e.status !== "handled") && (i === "open" || e.status === i) && (o === "all" || e.page === o)), m = e.length - e.filter((e) => e.status !== "handled").length;
	return /* @__PURE__ */ (0, F.jsxs)("div", {
		className: "grid gap-2",
		children: [/* @__PURE__ */ (0, F.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2",
			children: [
				/* @__PURE__ */ (0, F.jsx)("h2", {
					className: "text-lg font-bold",
					children: "Issue reports"
				}),
				/* @__PURE__ */ (0, F.jsx)("span", {
					className: "text-xs text-muted-foreground",
					children: "from the “Facing an issue?” button — click a row for the picture and the details"
				}),
				/* @__PURE__ */ (0, F.jsxs)("span", {
					className: "ml-auto flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, F.jsxs)("label", {
							className: "flex items-center gap-1.5 text-sm",
							children: [
								/* @__PURE__ */ (0, F.jsx)("input", {
									type: "checkbox",
									checked: c,
									onChange: (e) => l(e.target.checked)
								}),
								"Show handled",
								m ? ` (${m})` : ""
							]
						}),
						/* @__PURE__ */ (0, F.jsxs)(y, {
							value: i,
							onValueChange: a,
							children: [/* @__PURE__ */ (0, F.jsx)(g, {
								className: "h-8 w-32",
								children: /* @__PURE__ */ (0, F.jsx)(h, {})
							}), /* @__PURE__ */ (0, F.jsxs)(_, { children: [
								/* @__PURE__ */ (0, F.jsx)(v, {
									value: "open",
									children: "New + seen"
								}),
								/* @__PURE__ */ (0, F.jsx)(v, {
									value: "new",
									children: "New"
								}),
								/* @__PURE__ */ (0, F.jsx)(v, {
									value: "seen",
									children: "Seen"
								}),
								/* @__PURE__ */ (0, F.jsx)(v, {
									value: "handled",
									children: "Handled"
								})
							] })]
						}),
						/* @__PURE__ */ (0, F.jsxs)(y, {
							value: o,
							onValueChange: s,
							children: [/* @__PURE__ */ (0, F.jsx)(g, {
								className: "h-8 w-36",
								children: /* @__PURE__ */ (0, F.jsx)(h, {})
							}), /* @__PURE__ */ (0, F.jsxs)(_, { children: [/* @__PURE__ */ (0, F.jsx)(v, {
								value: "all",
								children: "All pages"
							}), f.map((e) => /* @__PURE__ */ (0, F.jsx)(v, {
								value: e,
								children: e
							}, e))] })]
						})
					]
				})
			]
		}), p.length ? /* @__PURE__ */ (0, F.jsx)("div", {
			className: "overflow-x-auto rounded-lg border",
			children: /* @__PURE__ */ (0, F.jsxs)(j, { children: [/* @__PURE__ */ (0, F.jsx)(O, { children: /* @__PURE__ */ (0, F.jsxs)(A, { children: [
				/* @__PURE__ */ (0, F.jsx)(E, { children: "#" }),
				/* @__PURE__ */ (0, F.jsx)(E, { children: "When" }),
				/* @__PURE__ */ (0, F.jsx)(E, { children: "Login" }),
				/* @__PURE__ */ (0, F.jsx)(E, { children: "Site" }),
				/* @__PURE__ */ (0, F.jsx)(E, { children: "Page" }),
				/* @__PURE__ */ (0, F.jsx)(E, { children: "Device" }),
				/* @__PURE__ */ (0, F.jsx)(E, { children: "Status" }),
				/* @__PURE__ */ (0, F.jsx)(E, { children: "Report" })
			] }) }), /* @__PURE__ */ (0, F.jsx)(D, { children: p.map((e) => [/* @__PURE__ */ (0, F.jsxs)(A, {
				className: "cursor-pointer",
				onClick: () => d(u === e.id ? null : e.id),
				children: [
					/* @__PURE__ */ (0, F.jsx)(k, { children: e.id }),
					/* @__PURE__ */ (0, F.jsx)(k, {
						className: "whitespace-nowrap",
						children: G(e.at)
					}),
					/* @__PURE__ */ (0, F.jsx)(k, { children: /* @__PURE__ */ (0, F.jsx)("b", { children: e.desk }) }),
					/* @__PURE__ */ (0, F.jsx)(k, { children: K[e.site || ""] || e.site || "" }),
					/* @__PURE__ */ (0, F.jsx)(k, { children: e.page || "—" }),
					/* @__PURE__ */ (0, F.jsxs)(k, {
						className: "whitespace-nowrap",
						children: [
							e.device,
							" ",
							/* @__PURE__ */ (0, F.jsx)("small", {
								className: "text-muted-foreground",
								children: e.viewport
							}),
							" ",
							e.has_shot ? "📷" : ""
						]
					}),
					/* @__PURE__ */ (0, F.jsx)(k, { children: /* @__PURE__ */ (0, F.jsx)(N, {
						variant: e.status === "new" ? "destructive" : "outline",
						children: e.status
					}) }),
					/* @__PURE__ */ (0, F.jsxs)(k, {
						className: "max-w-[34rem] whitespace-normal",
						children: [e.text.slice(0, 140), e.text.length > 140 ? "…" : ""]
					})
				]
			}, e.id), u === e.id && /* @__PURE__ */ (0, F.jsx)(A, { children: /* @__PURE__ */ (0, F.jsx)(k, {
				colSpan: 8,
				className: "whitespace-normal bg-muted/30",
				children: /* @__PURE__ */ (0, F.jsx)(ve, {
					row: e,
					onStatus: (n) => t(e.id, n),
					canFix: n,
					onFix: r
				})
			}) }, `${e.id}-d`)]) })] })
		}) : /* @__PURE__ */ (0, F.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: e.length ? "Nothing new or seen — tick “Show handled” to see the rest." : "No issue reports in this period."
		})]
	});
}
// src/pages/performance/PerformancePage.tsx
var J = (e) => e == null ? "—" : e < 1e3 ? `${e} ms` : `${(e / 1e3).toFixed(e < 1e4 ? 2 : 1)} s`, be = (e) => e ? new Date(e).toLocaleString(void 0, {
	day: "numeric",
	month: "short",
	hour: "2-digit",
	minute: "2-digit"
}) : "", xe = (e) => "★".repeat(e) + "☆".repeat(5 - e), Y = (e) => e == null ? "" : e < 1e3 ? "ok" : e < 3e3 ? "mid" : "bad", X = (e) => e === "ok" ? "text-ok" : e === "mid" ? "text-warn" : e === "bad" ? "text-destructive" : "", Se = {
	overview: "Overview",
	issues: "Issues",
	refused: "Refused saves",
	feedback: "Feedback",
	errors: "Errors",
	ai: "AI fixes"
}, Ce = /* @__PURE__ */ (0, F.jsx)("p", {
	className: "p-3 text-sm text-muted-foreground",
	children: "No data yet."
});
function Z({ label: e, value: t, sub: n, tone: r }) {
	return /* @__PURE__ */ (0, F.jsxs)("div", {
		className: M("grid gap-0.5 rounded-xl border bg-card p-3", r === "ok" && "border-ok/40", r === "bad" && "border-destructive/40", r === "mid" && "border-warn/40"),
		children: [
			/* @__PURE__ */ (0, F.jsx)("span", {
				className: "text-xs text-muted-foreground",
				children: e
			}),
			/* @__PURE__ */ (0, F.jsx)("b", {
				className: M("text-2xl", X(r || "")),
				children: t ?? "—"
			}),
			n && /* @__PURE__ */ (0, F.jsx)("small", {
				className: "text-xs text-muted-foreground",
				children: n
			})
		]
	});
}
function Q({ title: e, note: t, children: n }) {
	return /* @__PURE__ */ (0, F.jsxs)(T, {
		className: "min-w-0 gap-0 py-0",
		children: [/* @__PURE__ */ (0, F.jsx)(re, {
			className: "border-b py-3",
			children: /* @__PURE__ */ (0, F.jsxs)(ne, {
				className: "text-base",
				children: [e, t && /* @__PURE__ */ (0, F.jsx)("span", {
					className: "ml-2 text-xs font-normal text-muted-foreground",
					children: t
				})]
			})
		}), /* @__PURE__ */ (0, F.jsx)(w, {
			className: "overflow-x-auto p-0",
			children: n
		})]
	});
}
function $({ rows: e, label: t }) {
	return e.length ? /* @__PURE__ */ (0, F.jsxs)(j, { children: [/* @__PURE__ */ (0, F.jsx)(O, { children: /* @__PURE__ */ (0, F.jsxs)(A, { children: [
		/* @__PURE__ */ (0, F.jsx)(E, { children: t }),
		/* @__PURE__ */ (0, F.jsx)(E, {
			className: "text-right",
			children: "Opened"
		}),
		/* @__PURE__ */ (0, F.jsx)(E, {
			className: "text-right",
			children: "Typical"
		}),
		/* @__PURE__ */ (0, F.jsx)(E, {
			className: "text-right",
			children: "Slow (95%)"
		}),
		/* @__PURE__ */ (0, F.jsx)(E, {
			className: "text-right",
			children: "Server"
		})
	] }) }), /* @__PURE__ */ (0, F.jsx)(D, { children: e.map((e) => /* @__PURE__ */ (0, F.jsxs)(A, { children: [
		/* @__PURE__ */ (0, F.jsx)(k, { children: e.key }),
		/* @__PURE__ */ (0, F.jsx)(k, {
			className: "text-right",
			children: e.n
		}),
		/* @__PURE__ */ (0, F.jsx)(k, {
			className: M("text-right", X(Y(e.p50))),
			children: J(e.p50)
		}),
		/* @__PURE__ */ (0, F.jsx)(k, {
			className: M("text-right", X(Y(e.p95))),
			children: J(e.p95)
		}),
		/* @__PURE__ */ (0, F.jsx)(k, {
			className: "text-right",
			children: J(e.server_p50)
		})
	] }, e.key)) })] }) : Ce;
}
var we = [
	{
		id: "name",
		label: "Page",
		get: (e) => e.name
	},
	{
		id: "n",
		label: "Opened",
		get: (e) => e.n
	},
	{
		id: "min",
		label: "Fastest",
		get: (e) => e.min,
		time: !0
	},
	{
		id: "p10",
		label: "P10",
		get: (e) => e.p10,
		time: !0
	},
	{
		id: "p25",
		label: "P25",
		get: (e) => e.p25,
		time: !0
	},
	{
		id: "p50",
		label: "P50 (typical)",
		get: (e) => e.p50,
		time: !0
	},
	{
		id: "p75",
		label: "P75",
		get: (e) => e.p75,
		time: !0
	},
	{
		id: "p95",
		label: "P95 (slow)",
		get: (e) => e.p95,
		time: !0
	},
	{
		id: "max",
		label: "Worst",
		get: (e) => e.max,
		time: !0
	},
	{
		id: "server",
		label: "Server",
		get: (e) => e.server_p50,
		time: !0
	},
	{
		id: "calls",
		label: "Calls",
		get: (e) => e.calls
	},
	{
		id: "errors",
		label: "Errors",
		get: (e) => e.errors ?? 0
	}
];
function Te({ rows: e, pageName: t }) {
	let [n, r] = (0, P.useState)({
		id: "n",
		dir: -1
	}), i = (0, P.useMemo)(() => {
		let r = we.find((e) => e.id === n.id);
		return e.map((e) => ({
			...e,
			name: t(e.key)
		})).sort((e, t) => {
			let i = r.get(e), a = r.get(t);
			return i == null && a == null ? 0 : i == null ? 1 : a == null ? -1 : (typeof i == "string" ? i.localeCompare(String(a)) : Number(i) - Number(a)) * n.dir;
		});
	}, [
		e,
		n,
		t
	]);
	return e.length ? /* @__PURE__ */ (0, F.jsxs)(j, { children: [/* @__PURE__ */ (0, F.jsx)(O, { children: /* @__PURE__ */ (0, F.jsx)(A, { children: we.map((e) => /* @__PURE__ */ (0, F.jsx)(E, {
		className: e.id === "name" ? "" : "text-right",
		"aria-sort": n.id === e.id ? n.dir === 1 ? "ascending" : "descending" : "none",
		children: /* @__PURE__ */ (0, F.jsxs)("button", {
			type: "button",
			className: "inline-flex items-center gap-1 whitespace-nowrap font-semibold hover:text-primary",
			title: "Sort highest to lowest, click again for lowest to highest",
			onClick: () => r((t) => t.id === e.id ? {
				id: e.id,
				dir: -t.dir
			} : {
				id: e.id,
				dir: e.id === "name" ? 1 : -1
			}),
			children: [e.label, /* @__PURE__ */ (0, F.jsx)("span", {
				className: M("text-[10px]", n.id === e.id ? "text-primary" : "text-muted-foreground"),
				children: n.id === e.id ? n.dir === 1 ? "▲" : "▼" : "⇅"
			})]
		})
	}, e.id)) }) }), /* @__PURE__ */ (0, F.jsx)(D, { children: i.map((e) => /* @__PURE__ */ (0, F.jsx)(A, { children: we.map((t) => {
		let n = t.get(e);
		return t.id === "name" ? /* @__PURE__ */ (0, F.jsx)(k, { children: /* @__PURE__ */ (0, F.jsx)("b", { children: e.name }) }, t.id) : t.time ? /* @__PURE__ */ (0, F.jsx)(k, {
			className: M("text-right", t.id !== "server" && X(Y(n))),
			children: J(n)
		}, t.id) : /* @__PURE__ */ (0, F.jsx)(k, {
			className: M("text-right", t.id === "errors" && n ? "text-destructive" : ""),
			children: n || (t.id === "errors" ? "" : n)
		}, t.id);
	}) }, e.key)) })] }) : Ce;
}
function Ee() {
	let { cloud: t } = i(), n = r(), a = e(), s = o(), c = t.currentDesk(), l = c?.role === "siteadmin", u = c?.role === "admin" || l, [d, f] = (0, P.useState)("7"), [m, ie] = (0, P.useState)(l ? String(c?.site) : "all"), [oe, I] = (0, P.useState)("overview"), [L, ce] = (0, P.useState)("all"), [le, ue] = (0, P.useState)("all"), [R, z] = (0, P.useState)("all"), B = (e) => a.find((t) => t.id === e)?.label || e || "—", V = p({
		queryKey: [
			"perf",
			d,
			m
		],
		enabled: u,
		queryFn: async () => {
			let [e, r, i, a] = await n(Promise.all([
				t.request("GET", `/api/perf/summary?days=${d}${m === "all" ? "" : `&site=${m}`}`),
				t.request("GET", `/api/feedback?days=${Math.max(30, Number(d))}`),
				t.request("GET", `/api/slip-denials?days=${d}${m === "all" ? "" : `&site=${m}`}`),
				t.request("GET", `/api/issues?days=${Math.max(30, Number(d))}`).catch(() => ({ issues: [] }))
			]));
			return {
				s: e,
				fb: r.feedback.filter((e) => m === "all" || e.site === m),
				denials: i.denials,
				issues: a.issues.filter((e) => m === "all" || e.site === m)
			};
		}
	}), H = p({
		queryKey: ["ai-jobs"],
		enabled: u,
		refetchInterval: 2e4,
		queryFn: () => t.request("GET", "/api/ai/jobs").catch(() => ({
			jobs: [],
			can_approve: !1,
			configured: !1
		}))
	}), de = !!H.data?.can_approve, fe = (H.data?.jobs ?? []).filter((e) => e.status === "queued" || e.status === "running").length, U = se({
		mutationFn: ({ id: e, status: r }) => n(t.request("PATCH", `/api/feedback/${e}`, { status: r })),
		onSuccess: (e, t) => s.setQueryData([
			"perf",
			d,
			m
		], (e) => e && {
			...e,
			fb: e.fb.map((e) => e.id === t.id ? {
				...e,
				status: t.status
			} : e)
		})
	}), W = V.data?.fb ?? [], me = (0, P.useMemo)(() => [...new Set(W.map((e) => e.page))].sort(), [W]), he = W.filter((e) => (L === "all" || (L === "1-2" ? e.rating <= 2 : L === "3" ? e.rating === 3 : e.rating >= 4)) && (le === "all" || e.status === le) && (R === "all" || e.page === R));
	if (!u) return /* @__PURE__ */ (0, F.jsx)("p", {
		className: "mx-auto max-w-3xl p-6 text-destructive",
		children: "Only admin logins can see performance and feedback."
	});
	let G = V.data?.s, K = G?.totals, q = V.data?.denials ?? [], ve = Math.max(1, ...(G?.day ?? []).map((e) => e.p50 || 0)), X = (G?.errors ?? []).filter((e) => !/cloudflareinsights/i.test(e.err || "")), we = (V.data?.issues ?? []).filter((e) => e.status === "new").length, Ee = W.filter((e) => e.status === "new").length, De = q.filter((e) => new Date(e.at).toDateString() === (/* @__PURE__ */ new Date()).toDateString()).length;
	return /* @__PURE__ */ (0, F.jsxs)("div", {
		className: "mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4",
		children: [
			/* @__PURE__ */ (0, F.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, F.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, F.jsx)(ae, {
						view: "performance",
						title: "Performance & feedback",
						current: Se[oe]
					}), /* @__PURE__ */ (0, F.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "How long pages take on the desks' own devices and connections, what breaks, and what the desks say about each page."
					})]
				}), /* @__PURE__ */ (0, F.jsxs)("div", {
					className: "flex flex-wrap items-end gap-2",
					children: [
						/* @__PURE__ */ (0, F.jsxs)(y, {
							value: d,
							onValueChange: f,
							children: [/* @__PURE__ */ (0, F.jsx)(g, {
								className: "w-40",
								"aria-label": "Period",
								children: /* @__PURE__ */ (0, F.jsx)(h, {})
							}), /* @__PURE__ */ (0, F.jsxs)(_, { children: [
								/* @__PURE__ */ (0, F.jsx)(v, {
									value: "1",
									children: "Last 24 hours"
								}),
								/* @__PURE__ */ (0, F.jsx)(v, {
									value: "7",
									children: "Last 7 days"
								}),
								/* @__PURE__ */ (0, F.jsx)(v, {
									value: "30",
									children: "Last 30 days"
								}),
								/* @__PURE__ */ (0, F.jsx)(v, {
									value: "90",
									children: "Last 90 days"
								})
							] })]
						}),
						!l && /* @__PURE__ */ (0, F.jsxs)(y, {
							value: m,
							onValueChange: ie,
							children: [/* @__PURE__ */ (0, F.jsx)(g, {
								className: "w-36",
								"aria-label": "Site",
								children: /* @__PURE__ */ (0, F.jsx)(h, {})
							}), /* @__PURE__ */ (0, F.jsxs)(_, { children: [
								/* @__PURE__ */ (0, F.jsx)(v, {
									value: "all",
									children: "Both sites"
								}),
								/* @__PURE__ */ (0, F.jsx)(v, {
									value: "makkah",
									children: "Makkah"
								}),
								/* @__PURE__ */ (0, F.jsx)(v, {
									value: "medina",
									children: "Medina"
								})
							] })]
						}),
						/* @__PURE__ */ (0, F.jsxs)(C, {
							variant: "outline",
							onClick: () => void V.refetch(),
							children: [/* @__PURE__ */ (0, F.jsx)(te, { className: M("size-4", V.isFetching && "animate-spin") }), "Refresh"]
						})
					]
				})]
			}),
			V.isLoading && /* @__PURE__ */ (0, F.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Loading…"
			}),
			V.isError && /* @__PURE__ */ (0, F.jsx)("p", {
				className: "text-sm text-destructive",
				children: V.error instanceof t.UserError ? V.error.message : "Could not load."
			}),
			G && !G.totals.routes && /* @__PURE__ */ (0, F.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No page timings yet — they arrive as desks use the PMS (sent every few minutes)."
			}),
			G && K && /* @__PURE__ */ (0, F.jsx)(F.Fragment, { children: /* @__PURE__ */ (0, F.jsxs)(ee, {
				value: oe,
				onValueChange: I,
				className: "gap-3",
				children: [
					/* @__PURE__ */ (0, F.jsxs)(S, {
						variant: "underline",
						children: [
							/* @__PURE__ */ (0, F.jsx)(b, {
								value: "overview",
								children: "Overview"
							}),
							/* @__PURE__ */ (0, F.jsxs)(b, {
								value: "issues",
								children: ["Issues", we ? ` (${we} new)` : ""]
							}),
							/* @__PURE__ */ (0, F.jsxs)(b, {
								value: "refused",
								children: ["Refused saves", De ? ` (${De} today)` : ""]
							}),
							/* @__PURE__ */ (0, F.jsxs)(b, {
								value: "feedback",
								children: ["Feedback", Ee ? ` (${Ee} new)` : ""]
							}),
							/* @__PURE__ */ (0, F.jsxs)(b, {
								value: "errors",
								children: ["Errors", X.length ? ` (${X.length})` : ""]
							}),
							/* @__PURE__ */ (0, F.jsxs)(b, {
								value: "ai",
								children: ["🤖 AI fixes", fe ? ` (${fe} working)` : ""]
							})
						]
					}),
					/* @__PURE__ */ (0, F.jsxs)(x, {
						value: "overview",
						className: "grid gap-3",
						children: [
							/* @__PURE__ */ (0, F.jsxs)("section", {
								className: "grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6",
								children: [
									/* @__PURE__ */ (0, F.jsx)(Z, {
										label: "Pages opened",
										value: K.routes,
										sub: `${K.desks} login${K.desks === 1 ? "" : "s"} · ${K.loads} full loads`
									}),
									/* @__PURE__ */ (0, F.jsx)(Z, {
										label: "Typical page",
										value: J(K.p50),
										sub: "median, menu click → page drawn",
										tone: Y(K.p50)
									}),
									/* @__PURE__ */ (0, F.jsx)(Z, {
										label: "Slow pages",
										value: J(K.p95),
										sub: "95% of openings are faster",
										tone: Y(K.p95)
									}),
									/* @__PURE__ */ (0, F.jsx)(Z, {
										label: "Errors",
										value: K.errors,
										sub: "pages that failed / script errors",
										tone: K.errors ? "bad" : "ok"
									}),
									/* @__PURE__ */ (0, F.jsx)(Z, {
										label: "Slip saves refused",
										value: q.length,
										sub: "see \"Slip saves refused\" below",
										tone: q.length ? "mid" : "ok"
									}),
									/* @__PURE__ */ (0, F.jsx)(Z, {
										label: "Feedback",
										value: K.feedback,
										sub: K.stars == null ? "no ratings yet" : `average ${K.stars} ★`,
										tone: K.stars == null ? "" : K.stars >= 4 ? "ok" : K.stars >= 3 ? "mid" : "bad"
									})
								]
							}),
							/* @__PURE__ */ (0, F.jsx)(Q, {
								title: "Pages",
								note: "time from the menu click until the page is drawn · typical (median) and slow (95th percentile) · server = time waiting for the server",
								children: /* @__PURE__ */ (0, F.jsx)(Te, {
									rows: G.pages,
									pageName: B
								})
							}),
							/* @__PURE__ */ (0, F.jsxs)("section", {
								className: "grid gap-3 md:grid-cols-2 xl:grid-cols-3",
								children: [
									/* @__PURE__ */ (0, F.jsx)(Q, {
										title: "By device",
										children: /* @__PURE__ */ (0, F.jsx)($, {
											rows: G.device,
											label: "Device"
										})
									}),
									/* @__PURE__ */ (0, F.jsx)(Q, {
										title: "By browser",
										children: /* @__PURE__ */ (0, F.jsx)($, {
											rows: G.browser,
											label: "Browser"
										})
									}),
									/* @__PURE__ */ (0, F.jsx)(Q, {
										title: "By connection",
										note: "as the browser reports it (Chrome, Edge, Android)",
										children: /* @__PURE__ */ (0, F.jsx)($, {
											rows: G.net,
											label: "Connection"
										})
									}),
									/* @__PURE__ */ (0, F.jsx)(Q, {
										title: "By system & app",
										children: /* @__PURE__ */ (0, F.jsx)($, {
											rows: [...G.os, ...G.app.map((e) => ({
												...e,
												key: e.key === "app" ? "Android app" : "In a browser"
											}))],
											label: "System / app"
										})
									}),
									/* @__PURE__ */ (0, F.jsx)(Q, {
										title: "By site",
										children: /* @__PURE__ */ (0, F.jsx)($, {
											rows: G.site_groups.map((e) => ({
												...e,
												key: e.key === "medina" ? "Medina" : e.key === "makkah" ? "Makkah" : e.key
											})),
											label: "Site"
										})
									}),
									/* @__PURE__ */ (0, F.jsx)(Q, {
										title: "By Cloudflare location",
										children: /* @__PURE__ */ (0, F.jsx)($, {
											rows: G.colo,
											label: "Location"
										})
									})
								]
							}),
							/* @__PURE__ */ (0, F.jsxs)("section", {
								className: "grid gap-3 md:grid-cols-2",
								children: [/* @__PURE__ */ (0, F.jsx)(Q, {
									title: "Day by day",
									note: "median page time per day",
									children: G.day.length ? /* @__PURE__ */ (0, F.jsx)("div", {
										className: "flex h-44 items-end gap-1 overflow-x-auto p-3",
										children: G.day.map((e) => /* @__PURE__ */ (0, F.jsxs)("div", {
											className: "flex h-full min-w-9 flex-1 flex-col items-center justify-end gap-0.5 text-[10px]",
											title: `${e.key}: ${J(e.p50)} typical · ${e.n} pages`,
											children: [
												/* @__PURE__ */ (0, F.jsx)("b", { children: J(e.p50) }),
												/* @__PURE__ */ (0, F.jsx)("i", {
													className: M("block w-full rounded-t", Y(e.p50) === "ok" ? "bg-ok" : Y(e.p50) === "mid" ? "bg-warn" : "bg-destructive"),
													style: { height: `${Math.max(4, (e.p50 || 0) / ve * 100)}%` }
												}),
												/* @__PURE__ */ (0, F.jsx)("small", {
													className: "text-muted-foreground",
													children: e.key.slice(5)
												})
											]
										}, e.key))
									}) : Ce
								}), /* @__PURE__ */ (0, F.jsx)(Q, {
									title: "By build",
									note: "each deploy of the website — did it get slower?",
									children: /* @__PURE__ */ (0, F.jsx)($, {
										rows: G.build,
										label: "Build"
									})
								})]
							}),
							/* @__PURE__ */ (0, F.jsx)(Q, {
								title: "Full loads (opening the PMS)",
								note: "median · first byte from the server, page ready, everything loaded, main content shown (LCP), slowest tap response (INP), layout shift (CLS)",
								children: /* @__PURE__ */ (0, F.jsxs)("div", {
									className: "grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:grid-cols-6",
									children: [[
										["First byte", "ttfb"],
										["Page ready", "dom_ready"],
										["All loaded", "load"],
										["Main content (LCP)", "lcp"],
										["Tap response (INP)", "inp"]
									].map(([e, t]) => /* @__PURE__ */ (0, F.jsx)(Z, {
										label: e,
										value: J(G.vitals[t]),
										tone: Y(G.vitals[t])
									}, t)), /* @__PURE__ */ (0, F.jsx)(Z, {
										label: "Layout shift (CLS)",
										value: G.vitals.cls ?? "—",
										tone: G.vitals.cls == null ? "" : G.vitals.cls < .1 ? "ok" : G.vitals.cls < .25 ? "mid" : "bad"
									})]
								})
							})
						]
					}),
					/* @__PURE__ */ (0, F.jsx)(x, {
						value: "issues",
						children: /* @__PURE__ */ (0, F.jsx)(T, { children: /* @__PURE__ */ (0, F.jsx)(w, { children: /* @__PURE__ */ (0, F.jsx)(ye, {
							canFix: de,
							onFix: () => void H.refetch(),
							list: V.data?.issues ?? [],
							onStatus: (e, t) => s.setQueryData([
								"perf",
								d,
								m
							], (n) => n && {
								...n,
								issues: n.issues.map((n) => n.id === e ? {
									...n,
									status: t
								} : n)
							})
						}) }) })
					}),
					/* @__PURE__ */ (0, F.jsx)(x, {
						value: "refused",
						children: /* @__PURE__ */ (0, F.jsx)(T, { children: /* @__PURE__ */ (0, F.jsx)(w, { children: /* @__PURE__ */ (0, F.jsx)(pe, { list: q }) }) })
					}),
					/* @__PURE__ */ (0, F.jsx)(x, {
						value: "feedback",
						children: /* @__PURE__ */ (0, F.jsxs)(T, { children: [/* @__PURE__ */ (0, F.jsx)(re, { children: /* @__PURE__ */ (0, F.jsxs)(ne, {
							className: "flex flex-wrap items-center gap-2 text-base",
							children: ["Feedback", /* @__PURE__ */ (0, F.jsxs)("span", {
								className: "ml-auto flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ (0, F.jsxs)(y, {
										value: L,
										onValueChange: ce,
										children: [/* @__PURE__ */ (0, F.jsx)(g, {
											className: "w-32",
											"aria-label": "Stars",
											children: /* @__PURE__ */ (0, F.jsx)(h, {})
										}), /* @__PURE__ */ (0, F.jsxs)(_, { children: [
											/* @__PURE__ */ (0, F.jsx)(v, {
												value: "all",
												children: "All stars"
											}),
											/* @__PURE__ */ (0, F.jsx)(v, {
												value: "1-2",
												children: "1–2 ★"
											}),
											/* @__PURE__ */ (0, F.jsx)(v, {
												value: "3",
												children: "3 ★"
											}),
											/* @__PURE__ */ (0, F.jsx)(v, {
												value: "4-5",
												children: "4–5 ★"
											})
										] })]
									}),
									/* @__PURE__ */ (0, F.jsxs)(y, {
										value: le,
										onValueChange: ue,
										children: [/* @__PURE__ */ (0, F.jsx)(g, {
											className: "w-32",
											"aria-label": "Status",
											children: /* @__PURE__ */ (0, F.jsx)(h, {})
										}), /* @__PURE__ */ (0, F.jsxs)(_, { children: [
											/* @__PURE__ */ (0, F.jsx)(v, {
												value: "all",
												children: "Any status"
											}),
											/* @__PURE__ */ (0, F.jsx)(v, {
												value: "new",
												children: "New"
											}),
											/* @__PURE__ */ (0, F.jsx)(v, {
												value: "seen",
												children: "Seen"
											}),
											/* @__PURE__ */ (0, F.jsx)(v, {
												value: "handled",
												children: "Handled"
											})
										] })]
									}),
									/* @__PURE__ */ (0, F.jsxs)(y, {
										value: R,
										onValueChange: z,
										children: [/* @__PURE__ */ (0, F.jsx)(g, {
											className: "w-40",
											"aria-label": "Page",
											children: /* @__PURE__ */ (0, F.jsx)(h, {})
										}), /* @__PURE__ */ (0, F.jsxs)(_, { children: [/* @__PURE__ */ (0, F.jsx)(v, {
											value: "all",
											children: "All pages"
										}), me.map((e) => /* @__PURE__ */ (0, F.jsx)(v, {
											value: e,
											children: B(e)
										}, e))] })]
									})
								]
							})]
						}) }), /* @__PURE__ */ (0, F.jsxs)(w, {
							className: "overflow-x-auto p-0",
							children: [he.length ? /* @__PURE__ */ (0, F.jsxs)(j, { children: [/* @__PURE__ */ (0, F.jsx)(O, { children: /* @__PURE__ */ (0, F.jsxs)(A, { children: [
								/* @__PURE__ */ (0, F.jsx)(E, { children: "When" }),
								/* @__PURE__ */ (0, F.jsx)(E, { children: "Stars" }),
								/* @__PURE__ */ (0, F.jsx)(E, { children: "Page" }),
								/* @__PURE__ */ (0, F.jsx)(E, { children: "Login" }),
								/* @__PURE__ */ (0, F.jsx)(E, { children: "Status" }),
								/* @__PURE__ */ (0, F.jsx)(E, { children: "Tags" }),
								/* @__PURE__ */ (0, F.jsx)(E, { children: "Comment" }),
								/* @__PURE__ */ (0, F.jsx)(E, { children: "Details" })
							] }) }), /* @__PURE__ */ (0, F.jsx)(D, { children: he.map((e) => /* @__PURE__ */ (0, F.jsxs)(A, {
								className: M(e.status === "handled" && "opacity-70"),
								children: [
									/* @__PURE__ */ (0, F.jsx)(k, {
										className: "whitespace-nowrap",
										children: be(e.at)
									}),
									/* @__PURE__ */ (0, F.jsx)(k, {
										className: "whitespace-nowrap text-gold",
										children: xe(e.rating)
									}),
									/* @__PURE__ */ (0, F.jsx)(k, { children: /* @__PURE__ */ (0, F.jsx)("b", { children: B(e.page) }) }),
									/* @__PURE__ */ (0, F.jsxs)(k, {
										className: "whitespace-nowrap",
										children: [
											e.desk || "",
											e.site ? /* @__PURE__ */ (0, F.jsx)("small", {
												className: "ml-1 text-muted-foreground",
												children: e.site === "medina" ? "Medina" : "Makkah"
											}) : "",
											/* @__PURE__ */ (0, F.jsx)("small", {
												className: "block text-muted-foreground",
												children: e.trigger === "after-save" ? "after a save" : "on the page"
											})
										]
									}),
									/* @__PURE__ */ (0, F.jsx)(k, { children: /* @__PURE__ */ (0, F.jsxs)(y, {
										value: e.status,
										onValueChange: (t) => U.mutate({
											id: e.id,
											status: t
										}),
										children: [/* @__PURE__ */ (0, F.jsx)(g, {
											className: "h-8 w-28",
											"aria-label": "Status",
											children: /* @__PURE__ */ (0, F.jsx)(h, {})
										}), /* @__PURE__ */ (0, F.jsx)(_, { children: [
											"new",
											"seen",
											"handled"
										].map((e) => /* @__PURE__ */ (0, F.jsx)(v, {
											value: e,
											children: e
										}, e)) })]
									}) }),
									/* @__PURE__ */ (0, F.jsx)(k, {
										className: "whitespace-normal",
										children: e.tags ? /* @__PURE__ */ (0, F.jsx)("span", {
											className: "flex flex-wrap gap-1",
											children: e.tags.split(", ").map((e) => /* @__PURE__ */ (0, F.jsx)(N, {
												variant: "secondary",
												children: e
											}, e))
										}) : ""
									}),
									/* @__PURE__ */ (0, F.jsx)(k, {
										className: "max-w-[28rem] whitespace-pre-wrap",
										children: e.text || ""
									}),
									/* @__PURE__ */ (0, F.jsx)(k, {
										className: "whitespace-normal text-xs text-muted-foreground",
										children: [
											e.page_ms == null ? "" : `took ${J(e.page_ms)}`,
											e.device,
											e.browser,
											e.net_type,
											e.colo && `${e.colo} (${e.country || "?"})`,
											e.build && `build ${e.build}`
										].filter(Boolean).join(" · ")
									})
								]
							}, e.id)) })] }) : /* @__PURE__ */ (0, F.jsx)("p", {
								className: "p-3 text-sm text-muted-foreground",
								children: "No feedback matches."
							}), U.isError && /* @__PURE__ */ (0, F.jsx)("p", {
								className: "p-3 text-sm text-destructive",
								children: "Could not save."
							})]
						})] })
					}),
					/* @__PURE__ */ (0, F.jsx)(x, {
						value: "errors",
						children: /* @__PURE__ */ (0, F.jsx)(Q, {
							title: "Recent errors",
							note: "pages that could not open and script errors, newest first",
							children: X.length ? /* @__PURE__ */ (0, F.jsxs)(j, { children: [/* @__PURE__ */ (0, F.jsx)(O, { children: /* @__PURE__ */ (0, F.jsxs)(A, { children: [
								/* @__PURE__ */ (0, F.jsx)(E, { children: "When" }),
								/* @__PURE__ */ (0, F.jsx)(E, { children: "Page" }),
								/* @__PURE__ */ (0, F.jsx)(E, { children: "Error" }),
								/* @__PURE__ */ (0, F.jsx)(E, { children: "Login" }),
								/* @__PURE__ */ (0, F.jsx)(E, { children: "Device" }),
								de && /* @__PURE__ */ (0, F.jsx)(E, {})
							] }) }), /* @__PURE__ */ (0, F.jsx)(D, { children: X.map((e, t) => /* @__PURE__ */ (0, F.jsxs)(A, { children: [
								/* @__PURE__ */ (0, F.jsx)(k, {
									className: "whitespace-nowrap",
									children: be(e.at)
								}),
								/* @__PURE__ */ (0, F.jsx)(k, { children: B(e.page) }),
								/* @__PURE__ */ (0, F.jsx)(k, {
									className: "break-all font-mono text-xs text-destructive",
									children: e.err
								}),
								/* @__PURE__ */ (0, F.jsx)(k, { children: e.desk }),
								/* @__PURE__ */ (0, F.jsx)(k, { children: [e.device, e.browser].filter(Boolean).join(" · ") }),
								de && /* @__PURE__ */ (0, F.jsx)(k, { children: /* @__PURE__ */ (0, F.jsx)(ge, {
									can: !0,
									source: "error",
									title: `Error on ${B(e.page)}: ${String(e.err || "").slice(0, 140)}`,
									detail: JSON.stringify({
										...e,
										same_error_count: X.filter((t) => t.err === e.err).length
									}, null, 1),
									onDone: () => void H.refetch()
								}) })
							] }, t)) })] }) : /* @__PURE__ */ (0, F.jsx)("p", {
								className: "p-3 text-sm text-muted-foreground",
								children: "No errors in this period. 🎉"
							})
						})
					}),
					/* @__PURE__ */ (0, F.jsx)(x, {
						value: "ai",
						children: /* @__PURE__ */ (0, F.jsx)(T, { children: /* @__PURE__ */ (0, F.jsx)(w, { children: /* @__PURE__ */ (0, F.jsx)(_e, {
							data: H.data,
							onChanged: () => void H.refetch()
						}) }) })
					})
				]
			}) })
		]
	});
}
export { Ee as default };
