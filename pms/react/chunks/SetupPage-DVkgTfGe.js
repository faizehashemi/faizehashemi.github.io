import { a as e, f as t, h as n, i as r, n as i, o as a, p as o } from "./PmsContext-BVMd13Oi.js";
import { t as s } from "./checkbox-C3tIiLfF.js";
import { i as c, n as l, r as u, t as d } from "./tabs-IQDmk0rj.js";
import { t as f } from "./label-CMEyi--P.js";
import { t as p } from "./plus-CPwEqLyF.js";
import { t as m } from "./x-Dis6Osjy.js";
import { t as h } from "./button-BGWa3SLr.js";
import { i as g, n as _, r as v, t as y } from "./card-B9_OGomP.js";
import { t as b } from "./input-DSBk_UeU.js";
import { a as x, n as S, o as C, r as w, s as T, t as E } from "./table-DKR1WqRT.js";
import { t as D } from "./utils-b7UP9Cmo.js";
import { t as O } from "./ConfirmDialog-GfriOiUy.js";
import { t as k } from "./PromptDialog-D_1ik4AU.js";
import { t as A } from "./badge-EB7Muw37.js";
import { t as j } from "./PageHeader-DKvzTuZm.js";
// src/pages/setup/SetupPage.tsx
var M = /* @__PURE__ */ n(o(), 1), N = t(), P = (0, M.createContext)("all"), F = [
	["desk", "This desk"],
	["stays", "Stays & travel"],
	["groups", "Groups & colours"],
	["data", "Data"],
	["desks", "Desks & access"]
], I = (e) => e ? new Date(e).toLocaleString([], {
	day: "2-digit",
	month: "short",
	hour: "2-digit",
	minute: "2-digit"
}) : "—", L = "h-9 rounded-md border bg-background px-2 text-sm", R = /^#[0-9a-f]{6}$/i, z = ({ children: e }) => /* @__PURE__ */ (0, N.jsx)("span", {
	className: "text-sm text-muted-foreground",
	children: e
});
function B() {
	let { cloud: t, settings: n } = i(), o = n, s = r(), f = e(), p = a(), { ask: m, dialog: h } = O(), { ask: g, dialog: _ } = k(), v = t.currentDesk(), y = v?.role === "admin", b = v?.role === "siteadmin", x = y || b, [S, C] = (0, M.useState)(v?.role === "siteadmin" ? v.site : "all"), [w, T] = (0, M.useState)(null), [E, D] = (0, M.useState)(null), [A, I] = (0, M.useState)(null), [, L] = (0, M.useState)(0), [R, z] = (0, M.useState)("desk"), B = (e) => w?.SITES[e]?.label || e;
	(0, M.useEffect)(() => {
		(async () => {
			let [e, t] = await Promise.all([f("config.js"), p("db")]);
			T({
				SITES: e.SITES,
				VIEWS: e.VIEWS,
				NAV: e.NAV
			}), D(t), I(await s(o.loadSettings(S === "all" ? null : S, { global: S === "all" })));
		})();
		let e = () => L((e) => e + 1);
		return window.addEventListener("pms:sync", e), () => window.removeEventListener("pms:sync", e);
	}, []);
	let U = async () => I(await s(o.loadSettings(S === "all" ? null : S, { global: S === "all" })));
	if ((0, M.useEffect)(() => {
		w && U();
	}, [S]), !w || !A || !v) return /* @__PURE__ */ (0, N.jsx)("div", {
		className: "mx-auto max-w-[2400px] p-4 text-sm text-muted-foreground",
		children: "Loading…"
	});
	let { SITES: W } = w, $ = v.role === "admin" ? "change both sites, manage desks" : v.role === "siteadmin" ? `change ${B(v.site)} slips, manage ${B(v.site)} logins` : v.role === "desk" ? `change ${B(v.site)} slips, view ${Object.keys(W).filter((e) => e !== v.site).map(B).join(", ")}` : "view only";
	return /* @__PURE__ */ (0, N.jsxs)("div", {
		className: "mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4",
		children: [
			/* @__PURE__ */ (0, N.jsx)(j, {
				view: "setup",
				title: "Setup",
				current: F.find((e) => e[0] === R)?.[1]
			}),
			/* @__PURE__ */ (0, N.jsxs)(d, {
				value: R,
				onValueChange: (e) => {
					z(e), window.scrollTo(0, 0);
				},
				className: "gap-3",
				children: [
					/* @__PURE__ */ (0, N.jsx)(u, {
						variant: "underline",
						children: F.filter(([e]) => e !== "desks" || y || v.role === "siteadmin").map(([e, t]) => /* @__PURE__ */ (0, N.jsx)(c, {
							value: e,
							children: t
						}, e))
					}),
					/* @__PURE__ */ (0, N.jsx)(l, {
						value: "desk",
						className: "grid gap-3",
						children: /* @__PURE__ */ (0, N.jsx)(V, {
							me: v,
							rights: $,
							label: B
						})
					}),
					/* @__PURE__ */ (0, N.jsxs)(P.Provider, {
						value: S,
						children: [/* @__PURE__ */ (0, N.jsxs)(l, {
							value: "stays",
							className: "grid gap-3",
							children: [
								/* @__PURE__ */ (0, N.jsx)(H, {
									scope: S,
									setScope: C,
									owner: y,
									label: B,
									sites: w.SITES,
									set: A
								}),
								/* @__PURE__ */ (0, N.jsx)(G, {
									set: A,
									isAdmin: x,
									reload: U
								}, S),
								/* @__PURE__ */ (0, N.jsx)(J, {
									set: A,
									isAdmin: x,
									reload: U
								}, S),
								/* @__PURE__ */ (0, N.jsx)(Y, {
									set: A,
									isAdmin: x,
									reload: U
								}, S)
							]
						}), /* @__PURE__ */ (0, N.jsxs)(l, {
							value: "groups",
							className: "grid gap-3",
							children: [
								/* @__PURE__ */ (0, N.jsx)(H, {
									scope: S,
									setScope: C,
									owner: y,
									label: B,
									sites: w.SITES,
									set: A
								}),
								/* @__PURE__ */ (0, N.jsx)(K, {
									set: A,
									isAdmin: x,
									reload: U
								}, S),
								/* @__PURE__ */ (0, N.jsx)(q, {
									set: A,
									isAdmin: x,
									reload: U
								}, S),
								/* @__PURE__ */ (0, N.jsx)(X, {
									set: A,
									isAdmin: x,
									reload: U,
									label: B
								}, S)
							]
						})]
					}),
					/* @__PURE__ */ (0, N.jsx)(l, {
						value: "data",
						className: "grid gap-3",
						children: /* @__PURE__ */ (0, N.jsx)(Z, {
							me: v,
							isAdmin: y,
							dbm: E,
							label: B,
							confirm: m
						})
					}),
					(y || v.role === "siteadmin") && /* @__PURE__ */ (0, N.jsx)(l, {
						value: "desks",
						className: "grid gap-3",
						children: /* @__PURE__ */ (0, N.jsx)(Q, {
							cfg: w,
							me: v,
							label: B,
							confirm: m,
							prompt: g
						})
					})
				]
			}),
			h,
			_
		]
	});
}
function V({ me: e, rights: t, label: n }) {
	let { cloud: r } = i(), a = r, [o, s] = (0, M.useState)("");
	return /* @__PURE__ */ (0, N.jsx)(U, {
		title: "This desk",
		children: /* @__PURE__ */ (0, N.jsxs)(N.Fragment, { children: [/* @__PURE__ */ (0, N.jsxs)("dl", {
			className: "grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm",
			children: [
				/* @__PURE__ */ (0, N.jsx)("dt", {
					className: "text-muted-foreground",
					children: "Desk"
				}),
				/* @__PURE__ */ (0, N.jsx)("dd", { children: e.name }),
				/* @__PURE__ */ (0, N.jsx)("dt", {
					className: "text-muted-foreground",
					children: "Site"
				}),
				/* @__PURE__ */ (0, N.jsx)("dd", { children: n(e.site) }),
				/* @__PURE__ */ (0, N.jsx)("dt", {
					className: "text-muted-foreground",
					children: "Role"
				}),
				/* @__PURE__ */ (0, N.jsxs)("dd", { children: [
					e.role,
					" ",
					/* @__PURE__ */ (0, N.jsxs)("span", {
						className: "text-muted-foreground",
						children: [
							"(",
							t,
							")"
						]
					})
				] }),
				/* @__PURE__ */ (0, N.jsx)("dt", {
					className: "text-muted-foreground",
					children: "Server"
				}),
				/* @__PURE__ */ (0, N.jsx)("dd", {
					className: "text-xs",
					children: a.apiBase()
				}),
				/* @__PURE__ */ (0, N.jsx)("dt", {
					className: "text-muted-foreground",
					children: "Connection"
				}),
				/* @__PURE__ */ (0, N.jsx)("dd", { children: a.state.online ? "online" : /* @__PURE__ */ (0, N.jsx)("span", {
					className: "text-destructive",
					children: "offline — saving is paused"
				}) }),
				/* @__PURE__ */ (0, N.jsx)("dt", {
					className: "text-muted-foreground",
					children: "Last sync"
				}),
				/* @__PURE__ */ (0, N.jsx)("dd", { children: a.state.lastSync ? new Date(a.state.lastSync).toLocaleTimeString() : "—" })
			]
		}), /* @__PURE__ */ (0, N.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, N.jsx)(h, {
				variant: "outline",
				onClick: async () => {
					s("Syncing…");
					try {
						await a.sync({ force: !0 }), s("Up to date.");
					} catch (e) {
						s(e.message);
					}
				},
				children: "Sync now"
			}), /* @__PURE__ */ (0, N.jsx)(z, { children: o })]
		})] })
	});
}
function H({ scope: e, setScope: t, owner: n, label: r, sites: i, set: a }) {
	let o = a?.overrides || [];
	return /* @__PURE__ */ (0, N.jsxs)("div", {
		className: "flex flex-wrap items-center gap-3 rounded-xl border bg-accent/40 px-3 py-2 text-sm",
		children: [
			/* @__PURE__ */ (0, N.jsx)("b", { children: "Applies to" }),
			n ? /* @__PURE__ */ (0, N.jsxs)("select", {
				className: L,
				value: e,
				onChange: (e) => t(e.target.value),
				"aria-label": "Applies to",
				children: [/* @__PURE__ */ (0, N.jsx)("option", {
					value: "all",
					children: "All sites (the default)"
				}), Object.values(i).map((e) => /* @__PURE__ */ (0, N.jsxs)("option", {
					value: e.id,
					children: [e.label, " only"]
				}, e.id))]
			}) : /* @__PURE__ */ (0, N.jsxs)("span", { children: [r(e), " only"] }),
			/* @__PURE__ */ (0, N.jsx)("span", {
				className: "text-muted-foreground",
				children: e === "all" ? "Every site uses these unless a site has its own value." : o.length ? `${r(e)} has its own value for: ${o.join(", ")}. The rest follows the all-sites value.` : `${r(e)} follows the all-sites values until you change one here.`
			})
		]
	});
}
function U({ title: e, sub: t, children: n }) {
	return /* @__PURE__ */ (0, N.jsxs)(y, { children: [/* @__PURE__ */ (0, N.jsxs)(v, { children: [/* @__PURE__ */ (0, N.jsx)(g, {
		className: "text-base",
		children: e
	}), t && /* @__PURE__ */ (0, N.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: t
	})] }), /* @__PURE__ */ (0, N.jsx)(_, {
		className: "grid gap-3",
		children: n
	})] });
}
function W(e) {
	let t = r(), { settings: n } = i(), a = (0, M.useContext)(P), [o, s] = (0, M.useState)(""), [c, l] = (0, M.useState)(!1);
	async function u(r, i) {
		l(!0);
		try {
			await t(n.saveSettings(r, a === "all" ? null : a)), await e(), s(i);
		} catch (e) {
			s(e.status === 404 ? "The PMS server needs the update (worker.js + schema.sql) before this can be saved." : e.message || String(e));
		} finally {
			l(!1);
		}
	}
	return {
		msg: o,
		setMsg: s,
		busy: c,
		run: u
	};
}
function G({ set: e, isAdmin: t, reload: n }) {
	let { settings: r } = i(), a = r, o = e.settings, [s, c] = (0, M.useState)({
		x: o.arrival_other_hours ?? 5,
		a: o.arrival_commute_hours,
		d: o.departure_lead_hours,
		i: o.transfer_checkin_time,
		o: o.transfer_checkout_time
	}), { msg: l, setMsg: u, busy: d, run: p } = W(n), m = (e, t) => `${(/* @__PURE__ */ new Date(e + "T00:00")).toLocaleDateString([], {
		day: "2-digit",
		month: "short"
	})} ${t}`, g = a.shiftTime("2026-11-25", "23:00", Number(s.a) || 0), _ = a.shiftTime("2026-12-01", "04:30", -(Number(s.d) || 0)), v = (e) => /* @__PURE__ */ (0, N.jsxs)("span", {
		className: "flex items-center gap-1.5",
		children: [/* @__PURE__ */ (0, N.jsx)(b, {
			type: "number",
			min: 0,
			max: 24,
			step: .25,
			required: !0,
			className: "w-24",
			disabled: !t,
			value: s[e],
			onChange: (t) => c((n) => ({
				...n,
				[e]: t.target.value
			}))
		}), " hours"]
	});
	return /* @__PURE__ */ (0, N.jsxs)(U, {
		title: /* @__PURE__ */ (0, N.jsxs)(N.Fragment, { children: ["Travel times ", /* @__PURE__ */ (0, N.jsx)("span", {
			className: "text-sm font-normal text-muted-foreground",
			children: "— all sites, every desk"
		})] }),
		sub: "Slips show hotel times, not flight times. UMS imports use these rules; the same for every desk.",
		children: [/* @__PURE__ */ (0, N.jsxs)("form", {
			className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
			onSubmit: (e) => {
				e.preventDefault(), p({
					arrival_commute_hours: Number(s.a),
					arrival_other_hours: Number(s.x),
					departure_lead_hours: Number(s.d),
					transfer_checkin_time: s.i,
					transfer_checkout_time: s.o
				}, "Saved for every desk. Imported slips get the new times at the next UMS import (desk edits are kept).");
			},
			children: [
				/* @__PURE__ */ (0, N.jsxs)("div", {
					className: "grid gap-1",
					children: [/* @__PURE__ */ (0, N.jsx)(f, { children: "After landing, travel to the hotel" }), v("a")]
				}),
				/* @__PURE__ */ (0, N.jsxs)("div", {
					className: "grid gap-1",
					children: [/* @__PURE__ */ (0, N.jsx)(f, { children: "Before the flight, leave the hotel" }), v("d")]
				}),
				/* @__PURE__ */ (0, N.jsxs)("div", {
					className: "grid gap-1",
					children: [/* @__PURE__ */ (0, N.jsx)(f, {
						title: "Used by the Arrival sheet: a flight landing at the other city's airport (Jeddah for a Medina hotel) or a bus from the other city",
						children: "Landing in another city, or coming by road: travel to the hotel"
					}), v("x")]
				}),
				/* @__PURE__ */ (0, N.jsxs)("div", {
					className: "grid gap-1",
					children: [/* @__PURE__ */ (0, N.jsx)(f, { children: "Moving between cities: check-in at" }), /* @__PURE__ */ (0, N.jsx)(b, {
						type: "time",
						required: !0,
						disabled: !t,
						value: s.i,
						onChange: (e) => c((t) => ({
							...t,
							i: e.target.value
						}))
					})]
				}),
				/* @__PURE__ */ (0, N.jsxs)("div", {
					className: "grid gap-1",
					children: [/* @__PURE__ */ (0, N.jsx)(f, { children: "Moving between cities: check-out at" }), /* @__PURE__ */ (0, N.jsx)(b, {
						type: "time",
						required: !0,
						disabled: !t,
						value: s.o,
						onChange: (e) => c((t) => ({
							...t,
							o: e.target.value
						}))
					})]
				}),
				/* @__PURE__ */ (0, N.jsxs)("div", {
					className: "col-span-full flex items-center gap-3",
					children: [t && /* @__PURE__ */ (0, N.jsx)(h, {
						type: "submit",
						disabled: d,
						children: "Save travel times"
					}), /* @__PURE__ */ (0, N.jsx)(z, { children: l || (e.updated_at ? `Last changed by ${e.updated_by || "—"}, ${I(e.updated_at)}` : "Using the default times.") + (t ? "" : " Only an admin can change these.") })]
				})
			]
		}), /* @__PURE__ */ (0, N.jsxs)("div", {
			className: "grid gap-1 rounded-lg bg-accent/40 p-3 text-sm",
			children: [
				/* @__PURE__ */ (0, N.jsxs)("div", { children: [
					"Flight lands ",
					/* @__PURE__ */ (0, N.jsx)("b", { children: m("2026-11-25", "23:00") }),
					" → hotel check-in ",
					/* @__PURE__ */ (0, N.jsx)("b", { children: m(g.date, g.time) })
				] }),
				/* @__PURE__ */ (0, N.jsxs)("div", { children: [
					"Flight departs ",
					/* @__PURE__ */ (0, N.jsx)("b", { children: m("2026-12-01", "04:30") }),
					" → hotel check-out ",
					/* @__PURE__ */ (0, N.jsx)("b", { children: m(_.date, _.time) })
				] }),
				/* @__PURE__ */ (0, N.jsxs)("div", { children: [
					"Makkah ⇄ Madina on the day of the move: check-out ",
					/* @__PURE__ */ (0, N.jsx)("b", { children: s.o }),
					", check-in ",
					/* @__PURE__ */ (0, N.jsx)("b", { children: s.i })
				] }),
				/* @__PURE__ */ (0, N.jsxs)("div", { children: [
					"Arriving or leaving by ",
					/* @__PURE__ */ (0, N.jsx)("b", { children: "car, bus or train" }),
					" (UMS \"CAR-…\" / \"BUS-…\" / \"TRAIN-…\"): the UMS time is the hotel time, nothing added or taken off"
				] })
			]
		})]
	});
}
function K({ set: e, isAdmin: t, reload: n }) {
	let { settings: r } = i(), a = r, [o, s] = (0, M.useState)(() => (e.settings.kg_sessions || a.DEFAULTS.kg_sessions).map((e) => ({ ...e }))), { msg: c, setMsg: l, busy: u, run: d } = W(n);
	return /* @__PURE__ */ (0, N.jsxs)(U, {
		title: /* @__PURE__ */ (0, N.jsxs)(N.Fragment, { children: ["KG event times ", /* @__PURE__ */ (0, N.jsx)("span", {
			className: "text-sm font-normal text-muted-foreground",
			children: "— the events on the KG page, every desk"
		})] }),
		sub: "The KG page's event list (Fakkul Ehraam, Atraaf…) and their times, used in the copied message.",
		children: [/* @__PURE__ */ (0, N.jsx)("div", {
			className: "grid gap-2",
			children: o.map((e, n) => /* @__PURE__ */ (0, N.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, N.jsx)(b, {
						className: "max-w-xs",
						maxLength: 60,
						placeholder: "Event name",
						"aria-label": "Event name",
						disabled: !t,
						value: e.name,
						onChange: (e) => s((t) => t.map((t, r) => r === n ? {
							...t,
							name: e.target.value
						} : t))
					}),
					/* @__PURE__ */ (0, N.jsx)(b, {
						type: "time",
						className: "w-32",
						"aria-label": "Time",
						disabled: !t,
						value: e.time,
						onChange: (e) => s((t) => t.map((t, r) => r === n ? {
							...t,
							time: e.target.value
						} : t))
					}),
					t ? /* @__PURE__ */ (0, N.jsx)(h, {
						size: "icon",
						variant: "outline",
						"aria-label": `Remove ${e.name}`,
						disabled: o.length <= 1,
						onClick: () => s((e) => e.filter((e, t) => t !== n)),
						children: /* @__PURE__ */ (0, N.jsx)(m, { className: "size-4" })
					}) : /* @__PURE__ */ (0, N.jsx)(z, { children: a.to12h(e.time) })
				]
			}, n))
		}), t ? /* @__PURE__ */ (0, N.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2",
			children: [
				/* @__PURE__ */ (0, N.jsxs)(h, {
					variant: "outline",
					disabled: o.length >= 10,
					onClick: () => s((e) => [...e, {
						name: "",
						time: "12:00"
					}]),
					children: [/* @__PURE__ */ (0, N.jsx)(p, { className: "size-4" }), "Add event"]
				}),
				/* @__PURE__ */ (0, N.jsx)(h, {
					disabled: u,
					onClick: () => {
						let e = o.map((e) => ({
							name: String(e.name || "").trim(),
							time: e.time
						})).filter((e) => e.name);
						!e.length || e.some((e) => !/^\d{2}:\d{2}$/.test(e.time || "")) ? l("Every event needs a name and a time.") : d({ kg_sessions: e }, "Saved — the KG page shows these events on every desk.");
					},
					children: "Save KG events"
				}),
				/* @__PURE__ */ (0, N.jsx)(z, { children: c })
			]
		}) : /* @__PURE__ */ (0, N.jsx)(z, { children: "Only an admin can change these." })]
	});
}
function q({ set: e, isAdmin: t, reload: n }) {
	let { settings: r } = i(), [a, o] = (0, M.useState)({
		...r.DEFAULTS.fe_windows,
		...e.settings.fe_windows || {}
	}), { msg: s, setMsg: c, busy: l, run: u } = W(n), d = (e, n) => /* @__PURE__ */ (0, N.jsxs)("div", {
		className: "grid gap-1",
		children: [/* @__PURE__ */ (0, N.jsx)(f, { children: e }), /* @__PURE__ */ (0, N.jsx)(b, {
			type: "time",
			className: "w-32",
			disabled: !t,
			value: a[n],
			onChange: (e) => o((t) => ({
				...t,
				[n]: e.target.value
			}))
		})]
	});
	return /* @__PURE__ */ (0, N.jsxs)(U, {
		title: /* @__PURE__ */ (0, N.jsxs)(N.Fragment, { children: ["Fakkul Ehraam windows ", /* @__PURE__ */ (0, N.jsx)("span", {
			className: "text-sm font-normal text-muted-foreground",
			children: "— the counts on the Home page, every desk"
		})] }),
		sub: /* @__PURE__ */ (0, N.jsxs)(N.Fragment, { children: [
			"Which Makkah check-ins count as ",
			/* @__PURE__ */ (0, N.jsx)("b", { children: "Morning" }),
			" and as ",
			/* @__PURE__ */ (0, N.jsx)("b", { children: "Night" }),
			". ",
			/* @__PURE__ */ (0, N.jsx)("b", { children: "Night · from Madina" }),
			" is the Night window's groups whose SH starts with S."
		] }),
		children: [/* @__PURE__ */ (0, N.jsxs)("div", {
			className: "flex flex-wrap gap-4",
			children: [
				d(/* @__PURE__ */ (0, N.jsxs)(N.Fragment, { children: ["Morning from ", /* @__PURE__ */ (0, N.jsx)("small", { children: "(the day before)" })] }), "morning_from"),
				d("Morning ends / Night starts", "split"),
				d("Night ends", "night_to")
			]
		}), t ? /* @__PURE__ */ (0, N.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, N.jsx)(h, {
				disabled: l,
				onClick: () => {
					Object.values(a).some((e) => !/^\d{2}:\d{2}$/.test(String(e || ""))) ? c("Fill in all three times.") : a.split >= a.night_to ? c("Night must end after it starts.") : u({ fe_windows: {
						morning_from: a.morning_from,
						split: a.split,
						night_to: a.night_to
					} }, "Saved — the Home page counts use these on every desk.");
				},
				children: "Save windows"
			}), /* @__PURE__ */ (0, N.jsx)(z, { children: s })]
		}) : /* @__PURE__ */ (0, N.jsx)(z, { children: "Only an admin can change these." })]
	});
}
function J({ set: e, isAdmin: t, reload: n }) {
	let { settings: r } = i(), a = r, [o, s] = (0, M.useState)(String(e.settings.delay_hold_days ?? a.DEFAULTS.delay_hold_days)), { msg: c, setMsg: l, busy: u, run: d } = W(n);
	return /* @__PURE__ */ (0, N.jsxs)(U, {
		title: /* @__PURE__ */ (0, N.jsxs)(N.Fragment, { children: ["Delayed departures ", /* @__PURE__ */ (0, N.jsx)("span", {
			className: "text-sm font-normal text-muted-foreground",
			children: "— every desk"
		})] }),
		sub: /* @__PURE__ */ (0, N.jsxs)(N.Fragment, { children: [
			"When a room's departure is marked ",
			/* @__PURE__ */ (0, N.jsx)("b", { children: "unknown" }),
			" (Slip page or Delayed departures), its beds are held from today for this many days. The desk can change any room's date; holds that run into an incoming booking are flagged."
		] }),
		children: [/* @__PURE__ */ (0, N.jsxs)("div", {
			className: "grid max-w-xs gap-1",
			children: [/* @__PURE__ */ (0, N.jsx)(f, { children: "Hold unknown stays for (days)" }), /* @__PURE__ */ (0, N.jsx)(b, {
				type: "number",
				min: 1,
				max: 120,
				step: 1,
				disabled: !t,
				value: o,
				onChange: (e) => s(e.target.value)
			})]
		}), t ? /* @__PURE__ */ (0, N.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, N.jsx)(h, {
				disabled: u,
				onClick: () => {
					let e = Number(o);
					!Number.isInteger(e) || e < 1 || e > 120 ? l("Enter 1–120 days.") : d({ delay_hold_days: e }, `Saved — unknown departures hold their rooms ${e} days.`);
				},
				children: "Save"
			}), /* @__PURE__ */ (0, N.jsx)(z, { children: c })]
		}) : /* @__PURE__ */ (0, N.jsx)(z, { children: "Only an admin can change this." })]
	});
}
function Y({ set: e, isAdmin: t, reload: n }) {
	let { settings: r } = i(), a = r, [o, s] = (0, M.useState)(() => [...e.settings.sh_prefixes || a.DEFAULTS.sh_prefixes]), [c, l] = (0, M.useState)(""), { msg: u, setMsg: d, busy: f, run: m } = W(n);
	function g() {
		let e = c.trim().toUpperCase();
		/^[A-Z]{1,4}$/.test(e) ? o.includes(e) ? d(`${e} is already there.`) : o.length >= 20 ? d("Up to 20 prefixes.") : (s((t) => [...t, e]), l(""), d("Press Save prefixes to keep it.")) : d("A prefix is 1–4 letters (A–Z).");
	}
	return /* @__PURE__ */ (0, N.jsxs)(U, {
		title: /* @__PURE__ */ (0, N.jsxs)(N.Fragment, { children: ["SH prefixes ", /* @__PURE__ */ (0, N.jsx)("span", {
			className: "text-sm font-normal text-muted-foreground",
			children: "— letters allowed before an SH number on the Slip page, every desk"
		})] }),
		sub: "An SH No. is digits, or digits after one of these (S44030 is a group's second check-in here). 1–4 letters each.",
		children: [/* @__PURE__ */ (0, N.jsx)("div", {
			className: "flex flex-wrap gap-2",
			children: o.length ? o.map((e, n) => /* @__PURE__ */ (0, N.jsxs)("span", {
				className: "inline-flex items-center gap-1.5 rounded-full border bg-accent/40 px-3 py-1 text-sm",
				children: [
					/* @__PURE__ */ (0, N.jsx)("b", { children: e }),
					/* @__PURE__ */ (0, N.jsxs)("small", {
						className: "text-muted-foreground",
						children: [e, "44030"]
					}),
					t && /* @__PURE__ */ (0, N.jsx)("button", {
						type: "button",
						"aria-label": `Remove ${e}`,
						onClick: () => {
							s((e) => e.filter((e, t) => t !== n)), d("Press Save prefixes to keep the change.");
						},
						children: "✕"
					})
				]
			}, e)) : /* @__PURE__ */ (0, N.jsx)(z, { children: "No prefixes — only plain numbers are accepted." })
		}), t ? /* @__PURE__ */ (0, N.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2",
			children: [
				/* @__PURE__ */ (0, N.jsx)(b, {
					className: "w-32",
					maxLength: 4,
					placeholder: "e.g. ES",
					"aria-label": "New prefix",
					autoComplete: "off",
					spellCheck: !1,
					value: c,
					onChange: (e) => l(e.target.value),
					onKeyDown: (e) => {
						e.key === "Enter" && (e.preventDefault(), g());
					}
				}),
				/* @__PURE__ */ (0, N.jsxs)(h, {
					variant: "outline",
					onClick: g,
					children: [/* @__PURE__ */ (0, N.jsx)(p, { className: "size-4" }), "Add prefix"]
				}),
				/* @__PURE__ */ (0, N.jsx)(h, {
					disabled: f,
					onClick: () => void m({ sh_prefixes: o }, "Saved — the Slip page accepts these on every desk."),
					children: "Save prefixes"
				}),
				/* @__PURE__ */ (0, N.jsx)(z, { children: u })
			]
		}) : /* @__PURE__ */ (0, N.jsx)(z, { children: "Only an admin can change these." })]
	});
}
function X({ set: e, isAdmin: t, reload: n, label: a }) {
	let { settings: o, rooms: s } = i(), c = o, l = r(), [u, d] = (0, M.useState)({}), [f, p] = (0, M.useState)({}), { msg: m, setMsg: g, busy: _, run: v } = W(n);
	(0, M.useEffect)(() => {
		(async () => {
			let t = await l(s.loadBuildings({ force: !0 })).catch(() => []), n = {
				...c.DEFAULTS.gl_colors,
				...e.settings.gl_colors || {}
			}, r = {}, i = {};
			for (let e of t) i[e.name] = e.site, r[e.name] = n[e.name] || "#000000";
			for (let [t, n] of Object.entries(e.settings.gl_colors || {})) t in r || (r[t] = n);
			d(r), p(i);
		})();
	}, []);
	let y = Object.keys(u).sort((e, t) => e.localeCompare(t));
	return /* @__PURE__ */ (0, N.jsxs)(U, {
		title: /* @__PURE__ */ (0, N.jsxs)(N.Fragment, { children: ["GL copy colours ", /* @__PURE__ */ (0, N.jsx)("span", {
			className: "text-sm font-normal text-muted-foreground",
			children: "— the ink of the GL copy per building, every desk"
		})] }),
		sub: /* @__PURE__ */ (0, N.jsxs)(N.Fragment, { children: [
			"Used by ",
			/* @__PURE__ */ (0, N.jsx)("b", { children: "GL copy" }),
			" on the Print slips page and on Check-ins. A building without a colour prints black."
		] }),
		children: [/* @__PURE__ */ (0, N.jsx)("div", {
			className: "grid gap-2 md:grid-cols-2 xl:grid-cols-3",
			children: y.length ? y.map((e) => /* @__PURE__ */ (0, N.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2 text-sm",
				children: [
					/* @__PURE__ */ (0, N.jsxs)("span", {
						className: "w-40 max-w-full truncate",
						children: [e, f[e] && /* @__PURE__ */ (0, N.jsxs)("span", {
							className: "text-xs text-muted-foreground",
							children: [" ", a(f[e])]
						})]
					}),
					/* @__PURE__ */ (0, N.jsx)("input", {
						type: "color",
						"aria-label": `Colour for ${e}`,
						disabled: !t,
						className: "h-8 w-12",
						value: u[e],
						onChange: (t) => d((n) => ({
							...n,
							[e]: t.target.value
						}))
					}),
					/* @__PURE__ */ (0, N.jsx)(b, {
						className: "h-8 w-24",
						maxLength: 7,
						spellCheck: !1,
						"aria-label": `Hex colour for ${e}`,
						disabled: !t,
						value: u[e],
						onChange: (t) => {
							let n = t.target.value.trim();
							d((t) => ({
								...t,
								[e]: n
							}));
						}
					}),
					/* @__PURE__ */ (0, N.jsxs)("span", {
						className: "min-w-0 break-words font-bold",
						style: { color: R.test(u[e]) ? u[e] : "#000" },
						children: ["SH 12345 · ", e]
					})
				]
			}, e)) : /* @__PURE__ */ (0, N.jsx)(z, { children: "No buildings yet — add them in Rooms & Buildings." })
		}), t ? /* @__PURE__ */ (0, N.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2",
			children: [
				/* @__PURE__ */ (0, N.jsx)(h, {
					variant: "outline",
					onClick: () => {
						d((e) => Object.fromEntries(Object.keys(e).map((e) => [e, c.DEFAULTS.gl_colors[e] || "#000000"]))), g("Defaults shown — press Save colours to keep them.");
					},
					children: "Reset to defaults"
				}),
				/* @__PURE__ */ (0, N.jsx)(h, {
					disabled: _,
					onClick: () => {
						let e = Object.entries(u).find(([, e]) => !R.test(e));
						e ? g(`${e[0]}: enter a colour like #e8590c.`) : v({ gl_colors: u }, "Saved — GL copies print in these colours on every desk.");
					},
					children: "Save colours"
				}),
				/* @__PURE__ */ (0, N.jsx)(z, { children: m })
			]
		}) : /* @__PURE__ */ (0, N.jsx)(z, { children: "Only an admin can change these." })]
	});
}
function Z({ me: e, isAdmin: t, dbm: n, label: a, confirm: o }) {
	let { cloud: c } = i(), l = c, u = r(), [d, f] = (0, M.useState)([]), [p, m] = (0, M.useState)(!0), [g, _] = (0, M.useState)(""), [v, y] = (0, M.useState)(!1);
	if ((0, M.useEffect)(() => {
		u(n.legacyAllSlips().catch(() => [])).then(f);
	}, []), !d.length) return null;
	let b = (() => {
		try {
			let e = localStorage.getItem("pms_device_id");
			return e || (e = crypto.randomUUID().slice(0, 8), localStorage.setItem("pms_device_id", e)), e;
		} catch {
			return "dev";
		}
	})(), x = {}, S = 0;
	for (let e of d) {
		let t = n.legacySiteOf(e);
		t ? x[t] = (x[t] || 0) + 1 : S++;
	}
	let C = (n) => t || (e.role === "desk" || e.role === "siteadmin") && n === e.site;
	async function w() {
		let r = [];
		for (let i of d) {
			let a = n.legacySiteOf(i) || (p ? e.site : null);
			if (!a || !(t || a === e.site)) continue;
			let { id: o, ...s } = i;
			r.push({
				site: a,
				origin: `${b}:${o}`,
				slip: s
			});
		}
		if (!r.length) {
			_("Nothing this desk may upload.");
			return;
		}
		if (!await o({
			title: `Upload ${r.length} slip(s) to the cloud?`,
			confirmLabel: "Upload"
		})) return;
		y(!0);
		let i = 0, a = 0;
		try {
			for (let e = 0; e < r.length; e += 45) {
				let t = await l.request("POST", "/api/slips/migrate", { slips: r.slice(e, e + 45) });
				i += t.created, a += t.skipped, _(`Uploading… ${Math.min(e + 45, r.length)}/${r.length}`);
			}
			await l.sync({ force: !0 }), _(`Done: ${i} uploaded${a ? `, ${a} were already there` : ""}.`);
		} catch (e) {
			_((e instanceof l.UserError ? e.message : "Upload failed.") + ` (${i} uploaded before the error — press Upload again to continue.)`);
		} finally {
			y(!1);
		}
	}
	return /* @__PURE__ */ (0, N.jsxs)(U, {
		title: "Move this browser's old data to the cloud",
		sub: "Slips saved on this computer before the cloud switch are still in this browser. Upload them once; uploading again never creates duplicates. The local copy stays in this browser as a backup.",
		children: [
			/* @__PURE__ */ (0, N.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, N.jsxs)(A, {
						variant: "outline",
						children: [d.length, " slip(s) in this browser"]
					}),
					Object.entries(x).map(([e, t]) => /* @__PURE__ */ (0, N.jsxs)(A, {
						variant: "outline",
						className: C(e) ? "border-ok text-ok" : "border-warn text-warn",
						children: [
							t,
							" ",
							a(e),
							C(e) ? "" : " — upload these from a " + a(e) + " desk"
						]
					}, e)),
					S > 0 && /* @__PURE__ */ (0, N.jsxs)(A, {
						variant: "outline",
						children: [S, " with no building"]
					})
				]
			}),
			S > 0 && (e.role === "desk" || e.role === "siteadmin" || t) && /* @__PURE__ */ (0, N.jsxs)("label", {
				className: "flex items-center gap-2 text-sm",
				children: [
					/* @__PURE__ */ (0, N.jsx)(s, {
						checked: p,
						onCheckedChange: (e) => m(e === !0)
					}),
					" Also upload the ",
					/* @__PURE__ */ (0, N.jsx)("b", { children: S }),
					" slip(s) with no building, as ",
					/* @__PURE__ */ (0, N.jsx)("b", { children: a(e.site) }),
					" slips"
				]
			}),
			/* @__PURE__ */ (0, N.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, N.jsx)(h, {
					disabled: e.role === "viewer" || v,
					onClick: () => void w(),
					children: "Upload"
				}), /* @__PURE__ */ (0, N.jsx)(z, { children: g })]
			})
		]
	});
}
function Q({ cfg: e, me: t, label: n, confirm: a, prompt: o }) {
	let { cloud: s } = i(), c = s, l = r(), [u, d] = (0, M.useState)([]), [f, p] = (0, M.useState)([]), [m, g] = (0, M.useState)(""), _ = t.role === "admin", [v, y] = (0, M.useState)({
		name: "",
		site: t.site,
		role: "desk",
		pass: ""
	}), D = async () => {
		try {
			p((await l(c.request("GET", "/api/audit?limit=100"))).audit);
		} catch {}
	}, O = async () => {
		try {
			d((await l(c.request("GET", "/api/desks"))).desks);
		} catch (e) {
			g(e.message);
		}
	};
	(0, M.useEffect)(() => {
		O(), _ && D();
	}, []);
	async function k(e, t, n) {
		try {
			d((await l(c.request("PATCH", `/api/desks/${e}`, t))).desks), g(n), D();
		} catch (e) {
			g(e.message), O();
		}
	}
	async function j(e) {
		if (await a({
			title: `Delete the login “${e.name}” for good?`,
			confirmLabel: "Delete",
			body: `It is logged out everywhere and can never log in again. Its page access and personal settings are removed. Slips and the change log are kept (the log shows it as “${e.name} (deleted)”).\n\nTo stop it only for now, use Disable instead.`
		})) try {
			d((await l(c.request("DELETE", `/api/desks/${e.id}`))).desks), g(`Login “${e.name}” deleted.`), D();
		} catch (e) {
			g(e?.status === 404 || e?.status === 405 ? "The server does not support deleting logins yet (Worker not updated)." : e.message), O();
		}
	}
	async function P(e) {
		e.preventDefault();
		try {
			d((await l(c.request("POST", "/api/desks", {
				name: v.name.trim(),
				site: v.site,
				role: v.role,
				password: v.pass
			}))).desks), g(`Desk “${v.name.trim()}” added. Give its password to that desk.`), y((e) => ({
				...e,
				name: "",
				pass: ""
			})), D();
		} catch (e) {
			g(e.message);
		}
	}
	return /* @__PURE__ */ (0, N.jsxs)(N.Fragment, { children: [
		/* @__PURE__ */ (0, N.jsxs)(U, {
			title: "Desk logins",
			sub: null,
			children: [
				/* @__PURE__ */ (0, N.jsxs)(E, { children: [/* @__PURE__ */ (0, N.jsx)(C, { children: /* @__PURE__ */ (0, N.jsxs)(T, { children: [
					/* @__PURE__ */ (0, N.jsx)(x, { children: "Desk" }),
					/* @__PURE__ */ (0, N.jsx)(x, { children: "Site" }),
					/* @__PURE__ */ (0, N.jsx)(x, { children: "Role" }),
					/* @__PURE__ */ (0, N.jsx)(x, { children: "Status" }),
					/* @__PURE__ */ (0, N.jsx)(x, { children: "Last login" }),
					/* @__PURE__ */ (0, N.jsx)(x, {})
				] }) }), /* @__PURE__ */ (0, N.jsx)(S, { children: u.map((e) => /* @__PURE__ */ (0, N.jsxs)(T, {
					className: e.disabled ? "opacity-60" : "",
					children: [
						/* @__PURE__ */ (0, N.jsxs)(w, { children: [e.name, e.id === t.id && /* @__PURE__ */ (0, N.jsx)(A, {
							variant: "outline",
							className: "ml-1.5",
							children: "you"
						})] }),
						/* @__PURE__ */ (0, N.jsx)(w, { children: n(e.site) }),
						/* @__PURE__ */ (0, N.jsx)(w, { children: /* @__PURE__ */ (0, N.jsx)("select", {
							className: L,
							disabled: e.id === t.id || !_ && !["desk", "viewer"].includes(e.role),
							value: e.role,
							onChange: (t) => void k(e.id, { role: t.target.value }, "Role changed; that desk was logged out."),
							children: (_ ? [
								"desk",
								"viewer",
								"siteadmin",
								"admin"
							] : ["desk", "viewer"]).map((e) => /* @__PURE__ */ (0, N.jsx)("option", {
								value: e,
								children: e === "siteadmin" ? "site admin" : e
							}, e))
						}) }),
						/* @__PURE__ */ (0, N.jsx)(w, { children: e.disabled ? /* @__PURE__ */ (0, N.jsx)(A, {
							variant: "destructive",
							children: "disabled"
						}) : /* @__PURE__ */ (0, N.jsx)(A, {
							variant: "outline",
							className: "border-ok text-ok",
							children: "active"
						}) }),
						/* @__PURE__ */ (0, N.jsx)(w, { children: I(e.last_login) }),
						/* @__PURE__ */ (0, N.jsxs)(w, {
							className: "space-x-1",
							children: [/* @__PURE__ */ (0, N.jsx)(h, {
								size: "sm",
								variant: "outline",
								onClick: async () => {
									let t = await o({
										title: `New password for ${e.name}`,
										body: "8+ characters. They will be logged out on every computer."
									});
									t && k(e.id, { password: t }, `Password of ${e.name} changed.`);
								},
								children: "Reset password"
							}), e.id !== t.id && /* @__PURE__ */ (0, N.jsxs)(N.Fragment, { children: [/* @__PURE__ */ (0, N.jsx)(h, {
								size: "sm",
								variant: "outline",
								onClick: async () => {
									let t = !e.disabled;
									(!t || await a({
										title: `Disable ${e.name}?`,
										body: "It is logged out everywhere and cannot log in until enabled.",
										confirmLabel: "Disable"
									})) && k(e.id, { disabled: t }, `${e.name} ${t ? "disabled" : "enabled"}.`);
								},
								children: e.disabled ? "Enable" : "Disable"
							}), /* @__PURE__ */ (0, N.jsx)(h, {
								size: "sm",
								variant: "outline",
								className: "text-destructive",
								title: "Remove this login for good",
								onClick: () => void j(e),
								children: "Delete"
							})] })]
						})
					]
				}, e.id)) })] }),
				/* @__PURE__ */ (0, N.jsx)("h4", {
					className: "font-bold",
					children: "Add a desk"
				}),
				/* @__PURE__ */ (0, N.jsxs)("form", {
					className: "flex flex-wrap gap-2",
					onSubmit: (e) => void P(e),
					children: [
						/* @__PURE__ */ (0, N.jsx)(b, {
							className: "w-56",
							placeholder: "Desk name, e.g. Makkah Desk 2",
							required: !0,
							value: v.name,
							onChange: (e) => y((t) => ({
								...t,
								name: e.target.value
							}))
						}),
						/* @__PURE__ */ (0, N.jsx)("select", {
							className: L,
							value: v.site,
							onChange: (e) => y((t) => ({
								...t,
								site: e.target.value
							})),
							children: Object.values(e.SITES).filter((e) => _ || e.id === t.site).map((e) => /* @__PURE__ */ (0, N.jsx)("option", {
								value: e.id,
								children: e.label
							}, e.id))
						}),
						/* @__PURE__ */ (0, N.jsxs)("select", {
							className: L,
							value: v.role,
							onChange: (e) => y((t) => ({
								...t,
								role: e.target.value
							})),
							children: [
								/* @__PURE__ */ (0, N.jsx)("option", {
									value: "desk",
									children: "desk — edits its own site"
								}),
								/* @__PURE__ */ (0, N.jsx)("option", {
									value: "viewer",
									children: "viewer — read only"
								}),
								_ && /* @__PURE__ */ (0, N.jsx)("option", {
									value: "siteadmin",
									children: "site admin — manages its own site's logins"
								}),
								_ && /* @__PURE__ */ (0, N.jsx)("option", {
									value: "admin",
									children: "admin — every site, every setting"
								})
							]
						}),
						/* @__PURE__ */ (0, N.jsx)(b, {
							className: "w-56",
							placeholder: "Password (8+ characters)",
							minLength: 8,
							required: !0,
							autoComplete: "off",
							value: v.pass,
							onChange: (e) => y((t) => ({
								...t,
								pass: e.target.value
							}))
						}),
						/* @__PURE__ */ (0, N.jsx)(h, {
							type: "submit",
							children: "Add"
						})
					]
				}),
				/* @__PURE__ */ (0, N.jsx)(z, { children: m })
			]
		}),
		/* @__PURE__ */ (0, N.jsx)($, {
			desks: u,
			cfg: e,
			label: n,
			confirm: a,
			onSaved: (e) => {
				d(e), D();
			}
		}),
		_ && /* @__PURE__ */ (0, N.jsx)(U, {
			title: "Recent changes",
			sub: null,
			children: /* @__PURE__ */ (0, N.jsxs)(E, { children: [/* @__PURE__ */ (0, N.jsx)(C, { children: /* @__PURE__ */ (0, N.jsxs)(T, { children: [
				/* @__PURE__ */ (0, N.jsx)(x, { children: "When" }),
				/* @__PURE__ */ (0, N.jsx)(x, { children: "Desk" }),
				/* @__PURE__ */ (0, N.jsx)(x, { children: "Action" }),
				/* @__PURE__ */ (0, N.jsx)(x, { children: "Slip" }),
				/* @__PURE__ */ (0, N.jsx)(x, { children: "Detail" })
			] }) }), /* @__PURE__ */ (0, N.jsx)(S, { children: f.length ? f.map((e, t) => /* @__PURE__ */ (0, N.jsxs)(T, { children: [
				/* @__PURE__ */ (0, N.jsx)(w, { children: I(e.at) }),
				/* @__PURE__ */ (0, N.jsx)(w, { children: e.desk || "—" }),
				/* @__PURE__ */ (0, N.jsx)(w, { children: e.action }),
				/* @__PURE__ */ (0, N.jsx)(w, { children: e.slip_id ?? "" }),
				/* @__PURE__ */ (0, N.jsx)(w, {
					className: "text-xs",
					children: e.detail || ""
				})
			] }, t)) : /* @__PURE__ */ (0, N.jsx)(T, { children: /* @__PURE__ */ (0, N.jsx)(w, {
				colSpan: 5,
				className: "text-muted-foreground",
				children: "Nothing yet."
			}) }) })] })
		})
	] });
}
function $({ desks: e, cfg: t, label: n, confirm: a, onSaved: o }) {
	let { cloud: c } = i(), l = c, u = r(), d = (0, M.useMemo)(() => [{
		label: "Start",
		views: ["home"]
	}, ...t.NAV.map((e) => ({
		label: e.label,
		views: e.views.filter((e) => !l.ALWAYS_OPEN.includes(e))
	}))].filter((e) => e.views.length), [t]), p = (0, M.useMemo)(() => d.flatMap((e) => e.views), [d]), m = (e) => t.VIEWS.find((t) => t.id === e)?.label || e, g = e.filter((e) => e.role !== "admin"), _ = (e) => new Set(Array.isArray(e.pages) ? e.pages.filter((e) => p.includes(e)) : p), [v, y] = (0, M.useState)({}), [b, x] = (0, M.useState)(null), [S, C] = (0, M.useState)(""), [w, T] = (0, M.useState)(!1), E = (e) => v[e.id] ?? _(e), O = (e, t) => [...e].sort().join() === [...t].sort().join(), k = g.filter((e) => v[e.id] && !O(v[e.id], _(e))), A = b ?? g[0]?.id ?? null, j = A === "all" ? g : g.filter((e) => e.id === A), P = (e, t) => y((n) => {
		let r = g.find((t) => t.id === e), i = new Set(n[e] ?? _(r));
		return t(i), {
			...n,
			[e]: i
		};
	});
	async function F() {
		let e = k.filter((e) => !v[e.id].size).map((e) => e.name);
		if (e.length && !await a({
			title: `${e.join(", ")} will see no page (only Settings). Save anyway?`,
			confirmLabel: "Save anyway"
		})) return;
		T(!0), C("Saving…");
		let t = null, n = [];
		for (let e of k) {
			let r = v[e.id], i = p.every((e) => r.has(e)) ? null : p.filter((e) => r.has(e));
			try {
				t = (await u(l.request("PATCH", `/api/desks/${e.id}`, { pages: i }))).desks;
			} catch (t) {
				n.push(`${e.name}: ${t.message}`);
			}
		}
		t && (y({}), o(t)), C(n.length ? `Not saved: ${n.join("; ")}` : `Saved for ${k.length} login${k.length === 1 ? "" : "s"}. Their menus update within a minute.`), T(!1);
	}
	return /* @__PURE__ */ (0, N.jsx)(U, {
		title: "Page access",
		sub: /* @__PURE__ */ (0, N.jsxs)(N.Fragment, { children: [
			"Tick the pages each login may open. Unticked pages disappear from its menus and cannot be opened (Settings always can; a login without Home starts on its first ticked page). Admin logins always see every page. What a login may ",
			/* @__PURE__ */ (0, N.jsx)("b", { children: "change" }),
			" still follows its role and site. Takes effect on that desk within a minute; there is no need to log it out."
		] }),
		children: g.length ? /* @__PURE__ */ (0, N.jsxs)(N.Fragment, { children: [
			/* @__PURE__ */ (0, N.jsxs)("div", {
				className: "flex flex-wrap items-end gap-3",
				children: [/* @__PURE__ */ (0, N.jsxs)("div", {
					className: "grid gap-1",
					children: [/* @__PURE__ */ (0, N.jsx)(f, { children: "Login" }), /* @__PURE__ */ (0, N.jsxs)("select", {
						className: L,
						value: String(A),
						onChange: (e) => x(e.target.value === "all" ? "all" : Number(e.target.value)),
						children: [g.map((e) => /* @__PURE__ */ (0, N.jsxs)("option", {
							value: e.id,
							children: [
								e.name,
								" — ",
								n(e.site),
								" · ",
								e.role,
								e.disabled ? " (disabled)" : "",
								k.some((t) => t.id === e.id) ? " *" : ""
							]
						}, e.id)), /* @__PURE__ */ (0, N.jsx)("option", {
							value: "all",
							children: "All logins (table)"
						})]
					})]
				}), A !== "all" && g.length > 1 && /* @__PURE__ */ (0, N.jsxs)("div", {
					className: "grid gap-1",
					children: [/* @__PURE__ */ (0, N.jsx)(f, { children: "Copy pages from" }), /* @__PURE__ */ (0, N.jsxs)("select", {
						className: L,
						value: "",
						onChange: (e) => {
							let t = g.find((t) => t.id === Number(e.target.value));
							t && typeof A == "number" && y((e) => ({
								...e,
								[A]: new Set(E(t))
							}));
						},
						children: [/* @__PURE__ */ (0, N.jsx)("option", {
							value: "",
							children: "—"
						}), g.filter((e) => e.id !== A).map((e) => /* @__PURE__ */ (0, N.jsx)("option", {
							value: e.id,
							children: e.name
						}, e.id))]
					})]
				})]
			}),
			/* @__PURE__ */ (0, N.jsx)("div", {
				className: "max-h-[70vh] overflow-auto",
				children: /* @__PURE__ */ (0, N.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, N.jsx)("thead", {
						className: "sticky top-0 bg-card",
						children: /* @__PURE__ */ (0, N.jsxs)("tr", { children: [/* @__PURE__ */ (0, N.jsx)("th", {
							className: "p-1 text-left",
							children: "Page"
						}), j.map((e) => /* @__PURE__ */ (0, N.jsxs)("th", {
							className: "p-1 text-center",
							children: [
								/* @__PURE__ */ (0, N.jsx)("div", { children: e.name }),
								/* @__PURE__ */ (0, N.jsxs)("div", {
									className: "text-xs font-normal text-muted-foreground",
									children: [
										n(e.site),
										" · ",
										e.role
									]
								}),
								/* @__PURE__ */ (0, N.jsxs)("div", {
									className: "space-x-1",
									children: [/* @__PURE__ */ (0, N.jsx)("button", {
										type: "button",
										className: "text-xs text-primary underline",
										onClick: () => P(e.id, (e) => p.forEach((t) => e.add(t))),
										children: "All"
									}), /* @__PURE__ */ (0, N.jsx)("button", {
										type: "button",
										className: "text-xs text-primary underline",
										onClick: () => P(e.id, (e) => e.clear()),
										children: "None"
									})]
								})
							]
						}, e.id))] })
					}), /* @__PURE__ */ (0, N.jsx)("tbody", { children: d.map((e) => /* @__PURE__ */ (0, N.jsxs)(N.Fragment, { children: [/* @__PURE__ */ (0, N.jsxs)("tr", {
						className: "bg-muted/50",
						children: [/* @__PURE__ */ (0, N.jsx)("th", {
							className: "p-1 text-left",
							children: e.label
						}), j.map((t) => /* @__PURE__ */ (0, N.jsx)("td", {
							className: "p-1 text-center",
							children: /* @__PURE__ */ (0, N.jsx)("button", {
								type: "button",
								className: "text-xs text-primary underline",
								onClick: () => P(t.id, (t) => {
									let n = e.views.every((e) => t.has(e));
									e.views.forEach((e) => n ? t.delete(e) : t.add(e));
								}),
								children: e.views.every((e) => E(t).has(e)) ? "none" : "all"
							})
						}, t.id))]
					}, e.label), e.views.map((t) => /* @__PURE__ */ (0, N.jsxs)("tr", {
						className: "border-b",
						children: [/* @__PURE__ */ (0, N.jsx)("th", {
							className: "p-1 pl-4 text-left font-normal",
							children: m(t)
						}), j.map((e) => {
							let n = E(e).has(t), r = _(e).has(t);
							return /* @__PURE__ */ (0, N.jsx)("td", {
								className: D("p-1 text-center", n !== r && "bg-accent"),
								children: /* @__PURE__ */ (0, N.jsx)(s, {
									"aria-label": `${e.name}: ${m(t)}`,
									checked: n,
									onCheckedChange: (n) => P(e.id, (e) => n === !0 ? e.add(t) : e.delete(t))
								})
							}, e.id);
						})]
					}, e.label + t))] })) })]
				})
			}),
			/* @__PURE__ */ (0, N.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, N.jsx)(h, {
						disabled: !k.length || w,
						onClick: () => void F(),
						children: k.length ? `Save page access (${k.length} login${k.length === 1 ? "" : "s"})` : "Save page access"
					}),
					/* @__PURE__ */ (0, N.jsx)(h, {
						variant: "outline",
						disabled: !k.length,
						onClick: () => {
							y({}), C("");
						},
						children: "Undo changes"
					}),
					/* @__PURE__ */ (0, N.jsx)(z, { children: S })
				]
			})
		] }) : /* @__PURE__ */ (0, N.jsx)(z, { children: "No desk or viewer logins yet. Admins always see every page." })
	});
}
export { B as default };
