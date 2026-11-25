import { f as e, h as t, i as n, n as r, o as i, p as a, s as o, u as s } from "./PmsContext-BVMd13Oi.js";
import { a as c, i as l, n as u, r as d, t as f } from "./select-VcH2xuqJ.js";
import { t as p } from "./checkbox-C3tIiLfF.js";
import { t as m } from "./label-CMEyi--P.js";
import { n as h } from "./DayNav-CaC48u7r.js";
import { t as g } from "./button-BGWa3SLr.js";
import { i as _, n as v, r as y, t as b } from "./card-B9_OGomP.js";
import { t as x } from "./input-DSBk_UeU.js";
import { a as S, n as C, o as w, r as T, s as E, t as D } from "./table-DKR1WqRT.js";
import { t as O } from "./utils-b7UP9Cmo.js";
import { t as k } from "./badge-EB7Muw37.js";
import { t as A } from "./textarea-BxHERF6b.js";
// src/pages/transport-import/TransportImportPage.tsx
var j = /* @__PURE__ */ t(a(), 1), M = e(), N = "pms_transport_draft", P = (e) => /* @__PURE__ */ (0, M.jsx)("small", {
	className: "block text-xs text-muted-foreground",
	children: e
});
function F() {
	let { cloud: e, transport: t } = r(), a = t, c = n(), { site: l, siteId: u } = s(), { href: d } = o(), f = e.canWrite(u), m = a.routesFor(u), [h, F] = (0, j.useState)(() => {
		try {
			return sessionStorage.getItem(N) || "";
		} catch {
			return "";
		}
	}), [L, R] = (0, j.useState)([]), [z, B] = (0, j.useState)(""), V = (e) => {
		F(e);
		try {
			sessionStorage.setItem(N, e);
		} catch {}
	}, H = (e) => {
		if (!m) return e;
		let t = a.resolve(e);
		return e.filter((e) => m.includes(a.normRoute(t.get(e.key).route)));
	}, [U, W] = (0, j.useState)(null), G = i(), K = (/* @__PURE__ */ new Date(Date.now() - (/* @__PURE__ */ new Date()).getTimezoneOffset() * 6e4)).toISOString().slice(0, 10), [q, ee] = (0, j.useState)(K), [J, Y] = (0, j.useState)(!1);
	(0, j.useEffect)(() => {
		G("ums-bridge").then(W);
	}, []);
	async function te() {
		if (U) {
			Y(!0), B("Asking UMS for the transport roster… (if a login window opens on the bridge computer, log in there)");
			try {
				let e = await U.status();
				if (!e.running) {
					B("The UMS bridge is not running on this computer. Start it (start-bridge.bat) and pair it on the UMS page.");
					return;
				}
				if (!e.paired) {
					B("Pair the bridge first: UMS page → UMS bridge → Connection.");
					return;
				}
				let t = await U.fetchTransportRoster({ date: q }, { onTick: (e) => {
					e?.state === "awaiting_human" && B("A browser window is open on the bridge computer — log in to UMS there.");
				} });
				if (V(t.text), !t.count) {
					B(`UMS has no transport trips for ${q}.`), R([]);
					return;
				}
				await X(t.text);
			} catch (e) {
				B(e.message || "Could not fetch the roster from UMS.");
			} finally {
				Y(!1);
			}
		}
	}
	async function X(t) {
		let n = a.parseTransport(t ?? h), r = n.rows, i = 0, { skipped: o } = n;
		if (m && r.length) {
			let e = [...a.byDay(r).values()].flatMap(H);
			if (i = r.length - e.length, r = e, !r.length) {
				B(`None of the ${i} trips is on ${m.join(", ")} — nothing to load for ${l.label}.`), R([]);
				return;
			}
		}
		if (!r.length) B("No trips found. Copy the whole list, including the date column."), R([]);
		else {
			B("Comparing with the saved days…");
			try {
				let e = a.byDay(r), t = await c(Promise.all([...e].map(async ([e, t]) => {
					let n = await a.loadDay(u, e), r = a.diffDay(n.rows, t);
					return {
						day: e,
						rows: t,
						saved: n,
						diff: r,
						picks: /* @__PURE__ */ new Set([
							...r.added.map((e) => `add:${e.key}`),
							...r.changed.map((e) => `chg:${e.now.key}`),
							...r.removed.map((e) => `del:${e.key}`)
						])
					};
				})));
				R(t), B(`${r.length} trips on ${t.length} day${t.length === 1 ? "" : "s"}${o ? ` · ${o} line${o === 1 ? "" : "s"} without a booking ref skipped (hotel shuttles)` : ""}${i ? ` · ${i} trip${i === 1 ? "" : "s"} on other routes left out` : ""}.`);
			} catch (t) {
				B(t instanceof e.UserError ? t.message : "Could not reach the server."), R([]);
			}
		}
	}
	let Z = (e, t) => R((n) => n.map((n, r) => r === e ? {
		...n,
		...t
	} : n));
	async function Q(t, n, r) {
		let i = L[t];
		Z(t, { error: "" });
		try {
			await c(a.saveDay(u, i.day, n, i.saved.version, r)), Z(t, { done: !0 });
		} catch (n) {
			Z(t, { error: (n instanceof e.UserError ? n.message : "Could not save.") + (n.status === 409 ? " Press “Read the list” again to compare with the latest." : "") });
		}
	}
	let ne = (e) => {
		let t = a.signage(e, u).filter((e) => e.buses.length);
		return `${e.length} trips${t.length ? " · " + t.map((e) => `${e.dest.title} ${e.buses.length} bus${e.buses.length === 1 ? "" : "es"}`).join(", ") : " · none for signage"}`;
	}, re = (e) => /* @__PURE__ */ (0, M.jsxs)(M.Fragment, { children: [
		/* @__PURE__ */ (0, M.jsx)("b", { children: e.ref }),
		" · ",
		e.leader || "—",
		P(`${e.operator || ""}${e.route ? " · " + e.route : ""} · ${a.time12(e.at)} · ${e.pax} pax`)
	] });
	function ie(e) {
		let t = a.resolve(e), n = [...e].sort((e, t) => e.at.localeCompare(t.at));
		return /* @__PURE__ */ (0, M.jsx)("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ (0, M.jsxs)(D, { children: [/* @__PURE__ */ (0, M.jsx)(w, { children: /* @__PURE__ */ (0, M.jsxs)(E, { children: [
				/* @__PURE__ */ (0, M.jsx)(S, { children: "Time" }),
				/* @__PURE__ */ (0, M.jsx)(S, { children: "Route" }),
				/* @__PURE__ */ (0, M.jsx)(S, { children: "Bus" }),
				/* @__PURE__ */ (0, M.jsx)(S, { children: "SH" }),
				/* @__PURE__ */ (0, M.jsx)(S, { children: "Tour operator" }),
				/* @__PURE__ */ (0, M.jsx)(S, { children: "Group leader" }),
				/* @__PURE__ */ (0, M.jsx)(S, {
					className: "text-right",
					children: "Pax"
				}),
				/* @__PURE__ */ (0, M.jsx)(S, { children: "Transporter" }),
				/* @__PURE__ */ (0, M.jsx)(S, { children: "Remarks" })
			] }) }), /* @__PURE__ */ (0, M.jsx)(C, { children: n.map((e) => {
				let n = t.get(e.key);
				return /* @__PURE__ */ (0, M.jsxs)(E, {
					className: O(n.parent && "bg-muted/40"),
					children: [
						/* @__PURE__ */ (0, M.jsx)(T, {
							className: "whitespace-nowrap",
							children: a.time12(e.at)
						}),
						/* @__PURE__ */ (0, M.jsxs)(T, { children: [n.route || "—", n.parent ? P("grouped") : null] }),
						/* @__PURE__ */ (0, M.jsx)(T, { children: n.dest ? n.bus ?? "" : "" }),
						/* @__PURE__ */ (0, M.jsx)(T, { children: /* @__PURE__ */ (0, M.jsx)("b", { children: e.ref }) }),
						/* @__PURE__ */ (0, M.jsx)(T, { children: e.operator }),
						/* @__PURE__ */ (0, M.jsx)(T, { children: e.leader }),
						/* @__PURE__ */ (0, M.jsx)(T, {
							className: "text-right",
							children: e.pax
						}),
						/* @__PURE__ */ (0, M.jsxs)(T, { children: [e.transporter, e.vch ? P(`Vch ${e.vch}`) : null] }),
						/* @__PURE__ */ (0, M.jsx)(T, { children: e.remarks })
					]
				}, e.key);
			}) })] })
		});
	}
	function ae(e, t) {
		let n = t.diff, r = (n, r) => {
			let i = new Set(t.picks);
			r ? i.add(n) : i.delete(n), Z(e, { picks: i });
		}, i = (e, n, i, a, o) => /* @__PURE__ */ (0, M.jsxs)(E, {
			className: i,
			children: [
				/* @__PURE__ */ (0, M.jsx)(T, { children: /* @__PURE__ */ (0, M.jsx)(p, {
					"aria-label": "Apply",
					checked: t.picks.has(e),
					onCheckedChange: (t) => r(e, t === !0)
				}) }),
				/* @__PURE__ */ (0, M.jsx)(T, {
					className: "font-bold",
					children: n
				}),
				/* @__PURE__ */ (0, M.jsx)(T, { children: re(a) }),
				/* @__PURE__ */ (0, M.jsx)(T, { children: o })
			]
		}, e);
		return /* @__PURE__ */ (0, M.jsx)("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ (0, M.jsxs)(D, { children: [/* @__PURE__ */ (0, M.jsx)(w, { children: /* @__PURE__ */ (0, M.jsxs)(E, { children: [
				/* @__PURE__ */ (0, M.jsx)(S, {}),
				/* @__PURE__ */ (0, M.jsx)(S, { children: "Change" }),
				/* @__PURE__ */ (0, M.jsx)(S, { children: "Trip" }),
				/* @__PURE__ */ (0, M.jsx)(S, { children: "Details" })
			] }) }), /* @__PURE__ */ (0, M.jsxs)(C, { children: [
				n.added.map((e) => i(`add:${e.key}`, "New", "bg-ok-soft/50", e, "—")),
				n.changed.map((e) => i(`chg:${e.now.key}`, "Changed", "bg-accent/50", e.now, /* @__PURE__ */ (0, M.jsx)("ul", {
					className: "list-disc pl-4",
					children: e.fields.map(([e, t, n], r) => /* @__PURE__ */ (0, M.jsxs)("li", { children: [
						e,
						": ",
						/* @__PURE__ */ (0, M.jsx)("del", { children: t || "(empty)" }),
						" → ",
						/* @__PURE__ */ (0, M.jsx)("ins", {
							className: "font-bold no-underline",
							children: n || "(empty)"
						})
					] }, r))
				}))),
				n.removed.map((e) => i(`del:${e.key}`, "Gone", "bg-destructive/10", e, `Not in the new list — ${e.bus == null ? "will be removed" : `frees bus ${e.bus}`}`))
			] })] })
		});
	}
	let $ = /* @__PURE__ */ (0, M.jsx)("span", {
		className: "rounded-md border border-warn/40 bg-warn-soft px-2 py-1 text-sm",
		children: "This login cannot save here (read-only)."
	});
	function oe(e, t) {
		let n = !!e.saved.version, r = e.diff, i = r.added.length + r.changed.length + r.removed.length;
		return /* @__PURE__ */ (0, M.jsxs)(b, { children: [/* @__PURE__ */ (0, M.jsx)(y, { children: /* @__PURE__ */ (0, M.jsxs)(_, {
			className: "flex flex-wrap items-center gap-2 text-base",
			children: [
				a.longDate(e.day),
				" ",
				/* @__PURE__ */ (0, M.jsx)(k, {
					variant: n ? "outline" : "default",
					children: n ? "already saved" : "new day"
				}),
				/* @__PURE__ */ (0, M.jsx)("small", {
					className: "font-normal text-muted-foreground",
					children: ne(e.rows)
				})
			]
		}) }), /* @__PURE__ */ (0, M.jsxs)(v, {
			className: "grid gap-3",
			children: [e.error && /* @__PURE__ */ (0, M.jsx)("div", {
				className: "rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive",
				children: e.error
			}), e.done ? /* @__PURE__ */ (0, M.jsxs)("div", {
				className: "rounded-md border border-ok/40 bg-ok-soft px-3 py-2 text-sm text-ok",
				children: [
					"Saved ✓ — ",
					/* @__PURE__ */ (0, M.jsx)("a", {
						className: "underline",
						href: d("transport", { day: e.day }),
						children: "open the day"
					}),
					" · ",
					/* @__PURE__ */ (0, M.jsx)("a", {
						className: "underline",
						href: d("transport-print", { day: e.day }),
						children: "bus sheets"
					})
				]
			}) : n ? /* @__PURE__ */ (0, M.jsxs)(M.Fragment, { children: [
				/* @__PURE__ */ (0, M.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [
						"Saved list: ",
						e.saved.rows.length,
						" trips",
						e.saved.updated_at ? ` · ${new Date(e.saved.updated_at).toLocaleString()}` : "",
						e.saved.updated_by ? " by " + e.saved.updated_by : ""
					]
				}),
				/* @__PURE__ */ (0, M.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, M.jsxs)(k, { children: [r.added.length, " new"] }),
						/* @__PURE__ */ (0, M.jsxs)(k, {
							variant: "outline",
							children: [r.changed.length, " changed"]
						}),
						/* @__PURE__ */ (0, M.jsxs)(k, {
							variant: "destructive",
							children: [r.removed.length, " gone"]
						}),
						/* @__PURE__ */ (0, M.jsxs)(k, {
							variant: "secondary",
							children: [r.same, " unchanged"]
						})
					]
				}),
				i ? /* @__PURE__ */ (0, M.jsxs)(M.Fragment, { children: [ae(t, e), /* @__PURE__ */ (0, M.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [f ? /* @__PURE__ */ (0, M.jsxs)(M.Fragment, { children: [
						/* @__PURE__ */ (0, M.jsx)(g, {
							disabled: !e.picks.size,
							onClick: () => {
								let n = (t) => [...e.picks].filter((e) => e.startsWith(t)).length;
								Q(t, a.applyChanges(e.saved.rows, e.diff, e.picks), `update: ${n("add:")} new, ${n("chg:")} changed, ${n("del:")} removed`);
							},
							children: "Apply ticked changes"
						}),
						/* @__PURE__ */ (0, M.jsx)(g, {
							variant: "outline",
							onClick: () => Z(t, { picks: /* @__PURE__ */ new Set([
								...r.added.map((e) => `add:${e.key}`),
								...r.changed.map((e) => `chg:${e.now.key}`),
								...r.removed.map((e) => `del:${e.key}`)
							]) }),
							children: "Tick all"
						}),
						/* @__PURE__ */ (0, M.jsx)(g, {
							variant: "outline",
							onClick: () => Z(t, { picks: /* @__PURE__ */ new Set() }),
							children: "Untick all"
						})
					] }) : $, /* @__PURE__ */ (0, M.jsx)("span", {
						className: "text-sm text-muted-foreground",
						children: "Bus numbers already given stay the same; new trips get the next free numbers."
					})]
				})] }) : /* @__PURE__ */ (0, M.jsx)("div", {
					className: "rounded-md border border-ok/40 bg-ok-soft px-3 py-2 text-sm text-ok",
					children: "Nothing changed — the saved list is already the same."
				})
			] }) : /* @__PURE__ */ (0, M.jsxs)(M.Fragment, { children: [ie(a.assignBuses(e.rows.map((e) => ({ ...e })))), /* @__PURE__ */ (0, M.jsx)("div", { children: f ? /* @__PURE__ */ (0, M.jsxs)(g, {
				onClick: () => void Q(t, a.assignBuses(e.rows.map((e) => ({ ...e }))), `import: ${e.rows.length} trips`),
				children: ["Save ", e.day]
			}) : $ })] })]
		})] }, e.day);
	}
	return /* @__PURE__ */ (0, M.jsxs)("div", {
		className: "mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4",
		children: [
			/* @__PURE__ */ (0, M.jsxs)("header", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, M.jsxs)("div", { children: [/* @__PURE__ */ (0, M.jsx)("h1", {
					className: "text-2xl font-bold text-primary",
					children: "Transport import"
				}), /* @__PURE__ */ (0, M.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [
						"Paste the transport list (with or without its heading row). Days that are already saved are compared first — you choose which changes to apply.",
						" ",
						m && /* @__PURE__ */ (0, M.jsxs)("b", { children: [
							l.label,
							" keeps only ",
							m.join(", "),
							" — every other route in the list is left out."
						] })
					]
				})] }), /* @__PURE__ */ (0, M.jsx)(g, {
					asChild: !0,
					variant: "outline",
					children: /* @__PURE__ */ (0, M.jsx)("a", {
						href: d("transport"),
						children: "🚌 Transport day"
					})
				})]
			}),
			/* @__PURE__ */ (0, M.jsxs)(b, { children: [/* @__PURE__ */ (0, M.jsx)(y, { children: /* @__PURE__ */ (0, M.jsx)(_, {
				className: "text-base",
				children: "Paste the list"
			}) }), /* @__PURE__ */ (0, M.jsxs)(v, {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, M.jsx)(A, {
						spellCheck: !1,
						className: "min-h-40 font-mono text-xs",
						value: h,
						onChange: (e) => V(e.target.value),
						placeholder: "Booking Ref	Dora No	Vch No	Transporter	Date	Tour Operator	Gr Leader	Source-Destination	Pax Count	Total Pax	Rooms Allocated	Remarks	User Loc"
					}),
					/* @__PURE__ */ (0, M.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2 rounded-lg border bg-accent/30 p-2 text-sm",
						children: [
							/* @__PURE__ */ (0, M.jsx)("b", { children: "From UMS" }),
							/* @__PURE__ */ (0, M.jsx)(x, {
								type: "date",
								className: "w-40",
								"aria-label": "Transport roster day",
								value: q,
								onChange: (e) => ee(e.target.value)
							}),
							/* @__PURE__ */ (0, M.jsx)(g, {
								variant: "outline",
								disabled: !U || J || !q,
								onClick: () => void te(),
								children: J ? "Fetching…" : "Fetch the roster from UMS"
							}),
							/* @__PURE__ */ (0, M.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: "needs the UMS bridge on this computer (UMS page → UMS bridge); fills the box below and reads it"
							})
						]
					}),
					/* @__PURE__ */ (0, M.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, M.jsx)(g, {
								onClick: () => void X(),
								children: "Read the list"
							}),
							/* @__PURE__ */ (0, M.jsx)(g, {
								variant: "outline",
								onClick: () => {
									V(""), R([]), B("");
								},
								children: "Clear"
							}),
							/* @__PURE__ */ (0, M.jsx)("span", {
								className: "text-sm text-muted-foreground",
								children: z
							})
						]
					})
				]
			})] }),
			L.map(oe),
			/* @__PURE__ */ (0, M.jsx)(I, {})
		]
	});
}
function I() {
	let { cloud: e, transport: t } = r(), i = t, a = n(), { siteId: p } = s(), { href: S } = o(), C = e.canWrite(p), w = i.destsFor(p), T = {
		day: i.today(),
		time: "",
		route: w[0]?.route ?? "",
		other: "",
		vehicle: "bus",
		ref: "",
		operator: "",
		leader: "",
		m: 0,
		f: 0,
		c: 0,
		pax: 0,
		transporter: "",
		vch: "",
		rooms: "",
		remarks: ""
	}, [E, D] = (0, j.useState)(T), [k, A] = (0, j.useState)(C ? "" : "This login cannot save here (read-only)."), [N, P] = (0, j.useState)(!1), F = (e) => Math.max(0, parseInt(String(e), 10) || 0), I = (e) => (t) => D((n) => {
		let r = {
			...n,
			[e]: t.target.value
		};
		return [
			"m",
			"f",
			"c"
		].includes(e) ? {
			...r,
			pax: F(r.m) + F(r.f) + F(r.c)
		} : r;
	});
	async function L(t) {
		t.preventDefault();
		let n = i.normRoute(E.route || E.other);
		if (!E.day || !E.time) {
			A("Give the date and time.");
			return;
		}
		if (!n) {
			A("Choose a route or type its name.");
			return;
		}
		if (!F(E.pax)) {
			A("Give the pax.");
			return;
		}
		let r = `M${Date.now().toString(36).toUpperCase()}`, o = {
			key: r,
			ref: h(E.ref) || r,
			dora: "",
			vch: h(E.vch),
			transporter: h(E.transporter),
			day: E.day,
			at: `${E.day}T${E.time}`,
			operator: h(E.operator),
			leader: h(E.leader),
			route: n,
			m: F(E.m),
			f: F(E.f),
			c: F(E.c),
			pax: F(E.pax),
			rooms: h(E.rooms).split(/[,\s]+/).filter(Boolean),
			remarks: h(E.remarks),
			adj: "",
			loc: "",
			manual: !0,
			...E.vehicle === "car" ? { vehicle: "car" } : {}
		};
		P(!0), A("Saving…");
		try {
			let e = await a(i.loadDay(p, E.day)), t = i.assignBuses([...e.rows.map((e) => ({ ...e })), o].sort((e, t) => e.at.localeCompare(t.at)), e.rows);
			await a(i.saveDay(p, E.day, t, e.version || 0, `added by hand: ${o.ref} ${n}`));
			let s = t.find((e) => e.key === r);
			A(/* @__PURE__ */ (0, M.jsxs)(M.Fragment, { children: [
				"Added ✓ ",
				n,
				" at ",
				i.time12(o.at),
				s?.bus ? ` · bus ${s.bus}` : "",
				" — ",
				/* @__PURE__ */ (0, M.jsxs)("a", {
					className: "underline",
					href: S("transport", { day: E.day }),
					children: ["open ", E.day]
				})
			] })), D((e) => ({
				...e,
				ref: "",
				operator: "",
				leader: "",
				transporter: "",
				vch: "",
				rooms: "",
				remarks: "",
				m: 0,
				f: 0,
				c: 0,
				pax: 0
			}));
		} catch (t) {
			A(t instanceof e.UserError ? t.message + (t.status === 409 ? " Try again." : "") : "Could not save.");
		} finally {
			P(!1);
		}
	}
	let R = (e, t, n = {}, r = "") => /* @__PURE__ */ (0, M.jsxs)("div", {
		className: O("grid gap-1", r),
		children: [/* @__PURE__ */ (0, M.jsx)(m, { children: e }), /* @__PURE__ */ (0, M.jsx)(x, {
			value: E[t],
			onChange: I(t),
			...n
		})]
	});
	return /* @__PURE__ */ (0, M.jsxs)(b, { children: [/* @__PURE__ */ (0, M.jsxs)(y, { children: [/* @__PURE__ */ (0, M.jsx)(_, {
		className: "text-base",
		children: "Add a trip by hand"
	}), /* @__PURE__ */ (0, M.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "For a trip that is not in the pasted list. It goes onto that day's list (a new day is started if none is saved) and stays there when a list is pasted again."
	})] }), /* @__PURE__ */ (0, M.jsx)(v, { children: /* @__PURE__ */ (0, M.jsxs)("form", {
		autoComplete: "off",
		onSubmit: (e) => void L(e),
		className: "grid grid-cols-2 items-end gap-3 sm:grid-cols-4",
		children: [
			R("Date", "day", {
				type: "date",
				required: !0
			}),
			R("Time", "time", {
				type: "time",
				required: !0
			}),
			/* @__PURE__ */ (0, M.jsxs)("div", {
				className: "col-span-2 grid gap-1",
				children: [/* @__PURE__ */ (0, M.jsx)(m, { children: "Route" }), /* @__PURE__ */ (0, M.jsxs)(f, {
					value: E.route || "__other",
					onValueChange: (e) => D((t) => ({
						...t,
						route: e === "__other" ? "" : e
					})),
					children: [/* @__PURE__ */ (0, M.jsx)(l, {
						className: "w-full",
						children: /* @__PURE__ */ (0, M.jsx)(c, {})
					}), /* @__PURE__ */ (0, M.jsxs)(u, { children: [w.map((e) => /* @__PURE__ */ (0, M.jsxs)(d, {
						value: e.route,
						children: [
							e.icon,
							" ",
							e.title,
							" — ",
							e.route
						]
					}, e.id)), /* @__PURE__ */ (0, M.jsx)(d, {
						value: "__other",
						children: "Other route…"
					})] })]
				})]
			}),
			!E.route && R("Route name", "other", {
				maxLength: 60,
				placeholder: "e.g. MADINA-BADR"
			}, "col-span-2"),
			/* @__PURE__ */ (0, M.jsxs)("div", {
				className: "grid gap-1",
				children: [/* @__PURE__ */ (0, M.jsx)(m, { children: "Vehicle" }), /* @__PURE__ */ (0, M.jsxs)(f, {
					value: E.vehicle,
					onValueChange: (e) => D((t) => ({
						...t,
						vehicle: e
					})),
					children: [/* @__PURE__ */ (0, M.jsx)(l, {
						className: "w-full",
						children: /* @__PURE__ */ (0, M.jsx)(c, {})
					}), /* @__PURE__ */ (0, M.jsxs)(u, { children: [/* @__PURE__ */ (0, M.jsx)(d, {
						value: "bus",
						children: "Bus"
					}), /* @__PURE__ */ (0, M.jsx)(d, {
						value: "car",
						children: "Car"
					})] })]
				})]
			}),
			R("SH / booking ref", "ref", {
				maxLength: 30,
				placeholder: "optional"
			}),
			R("Tour operator", "operator", { maxLength: 80 }, "col-span-2"),
			R("Group leader", "leader", { maxLength: 80 }, "col-span-2"),
			R("M", "m", {
				type: "number",
				min: 0
			}),
			R("F", "f", {
				type: "number",
				min: 0
			}),
			R("C", "c", {
				type: "number",
				min: 0
			}),
			R("Total pax", "pax", {
				type: "number",
				min: 0
			}),
			R("Transporter", "transporter", { maxLength: 60 }),
			R("Vch No", "vch", { maxLength: 20 }),
			R("Rooms", "rooms", {
				maxLength: 200,
				placeholder: "e.g. 101, 102"
			}, "col-span-2"),
			R("Remarks", "remarks", { maxLength: 200 }, "col-span-2 sm:col-span-4"),
			/* @__PURE__ */ (0, M.jsxs)("div", {
				className: "col-span-full flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, M.jsx)(g, {
					type: "submit",
					disabled: !C || N,
					children: "Add trip"
				}), /* @__PURE__ */ (0, M.jsx)("span", {
					className: "text-sm text-muted-foreground",
					children: k
				})]
			})
		]
	}) })] });
}
export { F as default };
