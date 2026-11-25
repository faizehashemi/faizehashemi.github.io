import { f as e, h as t, i as n, n as r, p as i, u as a } from "./PmsContext-BVMd13Oi.js";
import { a as o, n as s, o as c, r as l, t as u } from "./dialog-DtgtvZ4Q.js";
import { i as d, n as f, r as p, t as m } from "./tabs-IQDmk0rj.js";
import { t as h } from "./button-BGWa3SLr.js";
import { t as g } from "./card-B9_OGomP.js";
import { t as _ } from "./input-DSBk_UeU.js";
import { t as v } from "./utils-b7UP9Cmo.js";
import { t as y } from "./ConfirmDialog-GfriOiUy.js";
import { t as b } from "./badge-EB7Muw37.js";
import { t as x } from "./textarea-BxHERF6b.js";
// src/pages/hr/hr.ts
var S = /* @__PURE__ */ t(i(), 1), C = (e) => String(e).padStart(2, "0"), w = (e) => `${e.getFullYear()}-${C(e.getMonth() + 1)}-${C(e.getDate())}`, T = (e, t) => {
	let n = /* @__PURE__ */ new Date(`${e}T12:00`);
	return n.setDate(n.getDate() + t), w(n);
}, E = (e, t) => {
	let n = [];
	for (let r = e; r <= t && n.length < 400; r = T(r, 1)) n.push(r);
	return n;
}, D = () => new Date(Date.now() + 108e5).toISOString().slice(0, 16), O = (e) => {
	let [t, n] = e.split(":").map(Number);
	return t * 60 + n;
}, k = (e) => Date.parse(e + ":00Z") / 6e4, A = (e) => `${Math.floor(e / 60)}:${C(Math.round(e % 60))}`, j = (e) => (/* @__PURE__ */ new Date(`${e}T12:00`)).getDay();
function M(e, t, n, r) {
	let i = `${t}|${e.id}`;
	if (n.has(i)) {
		let e = n.get(i);
		return e == null ? null : r.find((t) => t.id === e) || null;
	}
	let a = r.find((t) => t.id === e.shift_id);
	return a && a.days.includes(j(t)) ? a : null;
}
function N(e, t, n, r, i, a, o = D()) {
	let s = n.filter((n) => n.staff_id === e.id && n.day === t).sort((e, t) => e.at.localeCompare(t.at)), c = s.filter((e) => e.kind === "in"), l = s.filter((e) => e.kind === "out"), u = M(e, t, r, i), d = a.find((n) => n.staff_id === e.id && n.status === "approved" && n.from_day <= t && n.to_day >= t), f = 0, p = null;
	for (let e of s) e.kind === "in" ? p ||= e : e.kind === "out" && p && (f += Math.max(0, k(e.at) - k(p.at)), p = null);
	p && t === o.slice(0, 10) && (f += Math.max(0, k(o) - k(p.at)));
	let m = c[0]?.at.slice(11, 16) || "", h = l[l.length - 1]?.at.slice(11, 16) || "", g = 0, _ = 0, v = 0;
	if (u) {
		let e = O(u.start), t = O(u.end), n = t <= e ? t + 1440 : t;
		if (v = Math.max(0, n - e - (u.break_min || 0)), m) {
			let t = O(m);
			t > e + (u.grace_min || 0) && (g = t - e);
		}
		if (h && !p) {
			let t = O(h) + (O(h) < e ? 1440 : 0);
			t < n && (_ = n - t);
		}
		f > 300 && (f = Math.max(0, f - (u.break_min || 0)));
	}
	let y = u ? Math.max(0, f - v) : f, b;
	b = d ? "leave" : p && t === o.slice(0, 10) ? g ? "late" : "working" : c.length ? g ? "late" : "present" : u ? t < o.slice(0, 10) || t === o.slice(0, 10) && o.slice(11, 16) > u.start ? "absent" : "upcoming" : "off";
	let x = [...new Set(s.flatMap((e) => String(e.flags || "").split(",").filter(Boolean)))];
	return s.some((e) => e.source === "manual") && x.push("manual"), {
		day: t,
		staff: e,
		shift: u,
		ins: c,
		outs: l,
		first: m,
		last: h,
		worked: Math.round(f),
		late: g,
		early: _,
		ot: Math.round(y),
		planned: v,
		status: b,
		leave: d,
		flags: x,
		refused: s.filter((e) => e.kind === "refused").length
	};
}
var P = {
	present: ["Present", "bg-emerald-100 text-emerald-900"],
	working: ["At work", "bg-emerald-100 text-emerald-900"],
	late: ["Late", "bg-amber-100 text-amber-900"],
	absent: ["Absent", "bg-red-100 text-red-900"],
	leave: ["On leave", "bg-sky-100 text-sky-900"],
	off: ["Day off", "bg-muted text-muted-foreground"],
	upcoming: ["Not yet", "bg-muted text-muted-foreground"]
}, F = (e, t, n) => e.filter((e) => e.staff_id === t && e.type === "annual" && e.status === "approved" && e.from_day.startsWith(n)).reduce((e, t) => e + t.days, 0), I = {
	"shared-phone": "📱 same phone as someone else today",
	"low-accuracy": "📍 weak location",
	manual: "✍️ entered by a manager"
}, L = e(), R = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13", z = [
	"Sun",
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat"
], B = (e) => (/* @__PURE__ */ new Date(`${e}T12:00`)).toLocaleDateString("en-GB", {
	weekday: "short",
	day: "2-digit",
	month: "short"
}), V = "h-9 rounded-md border bg-background px-2 text-sm", H = (e, t = 360, n = .75) => new Promise((r, i) => {
	let a = new Image();
	a.onload = () => {
		let e = Math.min(1, t / Math.max(a.width, a.height)), i = document.createElement("canvas");
		i.width = Math.round(a.width * e), i.height = Math.round(a.height * e), i.getContext("2d").drawImage(a, 0, 0, i.width, i.height), r(i.toDataURL("image/jpeg", n));
	}, a.onerror = i, a.src = URL.createObjectURL(e);
}), U = (e, t) => {
	let n = t.map((e) => e.map((e) => `"${String(e ?? "").replace(/"/g, "\"\"")}"`).join(",")).join("\n"), r = document.createElement("a");
	r.href = URL.createObjectURL(new Blob(["﻿" + n], { type: "text/csv" })), r.download = e, r.click();
};
function W() {
	let { cloud: e } = r(), t = n(), { site: i, siteId: o } = a(), { ask: s, dialog: c } = y(), l = (n, r, i) => t(e.request(n, r, i)), [u, h] = (0, S.useState)(null), [g, _] = (0, S.useState)(""), v = D().slice(0, 10), [b, x] = (0, S.useState)({
		from: T(v, -6),
		to: v
	}), [C, w] = (0, S.useState)([]), [E, O] = (0, S.useState)([]), [k, A] = (0, S.useState)(/* @__PURE__ */ new Map()), [j, M] = (0, S.useState)([]), [N, P] = (0, S.useState)("today"), F = async () => {
		try {
			h(await l("GET", `/api/hr/data?site=${o}`));
		} catch (e) {
			_(e.message);
		}
	}, I = async () => {
		let e = b.from < T(v, -1) ? b.from : T(v, -1), t = b.to > T(v, 13) ? b.to : T(v, 13);
		try {
			let [n, r, i, a] = await Promise.all([
				l("GET", `/api/hr/attendance?site=${o}&from=${e}&to=${b.to > v ? b.to : v}`),
				l("GET", `/api/hr/leaves?site=${o}`),
				l("GET", `/api/hr/schedule?site=${o}&from=${e}&to=${t}`),
				l("GET", `/api/hr/tasks?site=${o}&from=${e}&to=${t}`)
			]);
			w(n.punches), O(r.leaves), A(new Map(i.entries.map((e) => [`${e.day}|${e.staff_id}`, e.shift_id]))), M(a.tasks);
		} catch (e) {
			_(e.message);
		}
	};
	if ((0, S.useEffect)(() => {
		F();
	}, [o]), (0, S.useEffect)(() => {
		I();
		let e = setInterval(() => {
			document.visibilityState === "visible" && I();
		}, 6e4);
		return () => clearInterval(e);
	}, [
		o,
		b.from,
		b.to
	]), !u) return /* @__PURE__ */ (0, L.jsx)("div", {
		className: "p-6 text-sm text-muted-foreground",
		children: g || "Loading HR…"
	});
	let R = u.staff, z = u.shifts, B = u.roles, V = !!u.can_edit, H = R.filter((e) => e.active), U = {
		api: l,
		siteId: o,
		site: i,
		staff: R,
		active: H,
		shifts: z,
		roles: B,
		D: u,
		setD: h,
		can: V,
		punches: C,
		leaves: E,
		roster: k,
		tasks: j,
		today: v,
		range: b,
		setRange: x,
		reload: I,
		reloadAll: async () => {
			await F(), await I();
		},
		confirm: s
	}, W = E.filter((e) => e.status === "pending").length;
	return /* @__PURE__ */ (0, L.jsxs)("div", {
		className: "mx-auto grid max-w-[1800px] gap-4 px-3 pb-12 pt-4 sm:px-5",
		children: [
			/* @__PURE__ */ (0, L.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, L.jsxs)("div", { children: [/* @__PURE__ */ (0, L.jsx)("h1", {
					className: "font-serif text-3xl font-black",
					children: "HR"
				}), /* @__PURE__ */ (0, L.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [i.label, " · staff, attendance, roster, leave and tasks"]
				})] }), /* @__PURE__ */ (0, L.jsx)($, { siteId: o })]
			}),
			g && /* @__PURE__ */ (0, L.jsx)("p", {
				className: "text-sm text-destructive",
				children: g
			}),
			/* @__PURE__ */ (0, L.jsxs)(m, {
				value: N,
				onValueChange: P,
				children: [
					/* @__PURE__ */ (0, L.jsx)(p, {
						variant: "underline",
						className: "flex-wrap",
						children: [
							["today", "📊 Today"],
							["staff", `👥 Staff (${H.length})`],
							["attendance", "🕒 Attendance"],
							["roster", "🗓️ Roster"],
							["leave", `🤒 Leave${W ? ` (${W})` : ""}`],
							["tasks", "📋 Tasks"],
							["setup", "🧩 Roles & shifts"],
							["settings", "⚙️ Settings"]
						].map(([e, t]) => /* @__PURE__ */ (0, L.jsx)(d, {
							value: e,
							children: t
						}, e))
					}),
					/* @__PURE__ */ (0, L.jsx)(f, {
						value: "today",
						children: /* @__PURE__ */ (0, L.jsx)(J, { ...U })
					}),
					/* @__PURE__ */ (0, L.jsx)(f, {
						value: "staff",
						children: /* @__PURE__ */ (0, L.jsx)(Y, { ...U })
					}),
					/* @__PURE__ */ (0, L.jsx)(f, {
						value: "attendance",
						children: /* @__PURE__ */ (0, L.jsx)(Q, { ...U })
					}),
					/* @__PURE__ */ (0, L.jsx)(f, {
						value: "roster",
						children: /* @__PURE__ */ (0, L.jsx)(ee, { ...U })
					}),
					/* @__PURE__ */ (0, L.jsx)(f, {
						value: "leave",
						children: /* @__PURE__ */ (0, L.jsx)(te, { ...U })
					}),
					/* @__PURE__ */ (0, L.jsx)(f, {
						value: "tasks",
						children: /* @__PURE__ */ (0, L.jsx)(ne, { ...U })
					}),
					/* @__PURE__ */ (0, L.jsx)(f, {
						value: "setup",
						children: /* @__PURE__ */ (0, L.jsx)(ie, { ...U })
					}),
					/* @__PURE__ */ (0, L.jsx)(f, {
						value: "settings",
						children: /* @__PURE__ */ (0, L.jsx)(ae, { ...U })
					})
				]
			}),
			c
		]
	});
}
var G = ({ s: e, cls: t = "size-10" }) => e?.photo ? /* @__PURE__ */ (0, L.jsx)("img", {
	src: e.photo,
	alt: "",
	className: v(t, "shrink-0 rounded-full object-cover")
}) : /* @__PURE__ */ (0, L.jsx)("span", {
	className: v(t, "grid shrink-0 place-items-center rounded-full bg-muted"),
	children: "👤"
}), K = ({ v: e, l: t, tone: n }) => /* @__PURE__ */ (0, L.jsxs)("div", {
	className: v("min-w-28 rounded-xl border bg-card p-3", n),
	children: [/* @__PURE__ */ (0, L.jsx)("b", {
		className: "block font-serif text-3xl",
		children: e
	}), /* @__PURE__ */ (0, L.jsx)("small", {
		className: "text-xs uppercase tracking-wider text-muted-foreground",
		children: t
	})]
});
function q(e) {
	let [t, n] = (0, S.useState)(null);
	return {
		node: t && /* @__PURE__ */ (0, L.jsx)(u, {
			open: !0,
			onOpenChange: () => n(null),
			children: /* @__PURE__ */ (0, L.jsxs)(s, {
				className: "max-w-sm",
				children: [/* @__PURE__ */ (0, L.jsx)(o, { children: /* @__PURE__ */ (0, L.jsx)(c, { children: "Selfie" }) }), /* @__PURE__ */ (0, L.jsx)("img", {
					src: t,
					alt: "Selfie",
					className: "w-full rounded-xl"
				})]
			})
		}),
		open: async (t) => {
			let r = await e("GET", `/api/hr/attendance/${t}/selfie`);
			n(r.selfie || "");
		}
	};
}
function J(e) {
	let t = e.active.map((t) => N(t, e.today, e.punches, e.roster, e.shifts, e.leaves)), n = (e) => t.filter((t) => e.includes(t.status)).length, r = e.tasks.filter((t) => t.day === e.today), i = q(e.api), a = [
		"absent",
		"late",
		"working",
		"present",
		"upcoming",
		"leave",
		"off"
	];
	return /* @__PURE__ */ (0, L.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, L.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, L.jsx)(K, {
						v: t.filter((e) => e.shift).length,
						l: "On shift today"
					}),
					/* @__PURE__ */ (0, L.jsx)(K, {
						v: n([
							"present",
							"working",
							"late"
						]),
						l: "Came",
						tone: "border-emerald-300"
					}),
					/* @__PURE__ */ (0, L.jsx)(K, {
						v: n(["late"]),
						l: "Late",
						tone: "border-amber-300"
					}),
					/* @__PURE__ */ (0, L.jsx)(K, {
						v: n(["absent"]),
						l: "Absent",
						tone: "border-red-300"
					}),
					/* @__PURE__ */ (0, L.jsx)(K, {
						v: n(["leave"]),
						l: "On leave"
					}),
					/* @__PURE__ */ (0, L.jsx)(K, {
						v: `${r.filter((e) => e.status === "done" || e.status === "verified").length}/${r.length}`,
						l: "Tasks done"
					}),
					/* @__PURE__ */ (0, L.jsx)(K, {
						v: t.reduce((e, t) => e + t.refused, 0),
						l: "Refused check-ins",
						tone: "border-red-200"
					})
				]
			}),
			/* @__PURE__ */ (0, L.jsx)("div", {
				className: "grid gap-2 sm:grid-cols-2 xl:grid-cols-3",
				children: t.sort((e, t) => a.indexOf(e.status) - a.indexOf(t.status)).map((e) => /* @__PURE__ */ (0, L.jsxs)(g, {
					className: "flex-row items-center gap-3 p-3",
					children: [
						/* @__PURE__ */ (0, L.jsx)(G, {
							s: e.staff,
							cls: "size-12"
						}),
						/* @__PURE__ */ (0, L.jsxs)("div", {
							className: "grid min-w-0 flex-1 gap-0.5",
							children: [
								/* @__PURE__ */ (0, L.jsx)("b", {
									className: "truncate",
									children: e.staff.name
								}),
								/* @__PURE__ */ (0, L.jsxs)("small", {
									className: "text-muted-foreground",
									children: [
										e.shift ? `${e.shift.name} ${e.shift.start}–${e.shift.end}` : "no shift",
										e.first ? ` · in ${e.first}` : "",
										e.last ? ` · out ${e.last}` : "",
										e.late ? ` · ${e.late} min late` : ""
									]
								}),
								(e.flags.length > 0 || e.refused > 0) && /* @__PURE__ */ (0, L.jsx)("small", {
									className: "text-red-700 dark:text-red-400",
									children: [...e.flags.map((e) => I[e] || e), e.refused ? `❌ ${e.refused} refused` : ""].filter(Boolean).join(" · ")
								})
							]
						}),
						/* @__PURE__ */ (0, L.jsxs)("div", {
							className: "grid justify-items-end gap-1",
							children: [/* @__PURE__ */ (0, L.jsx)("span", {
								className: v("rounded-full px-2 py-0.5 text-xs font-semibold", P[e.status][1]),
								children: P[e.status][0]
							}), e.ins[0] && /* @__PURE__ */ (0, L.jsx)("button", {
								type: "button",
								className: "text-xs text-primary underline",
								onClick: () => void i.open(e.ins[0].id),
								children: "selfie"
							})]
						})
					]
				}, e.staff.id))
			}),
			!e.active.length && /* @__PURE__ */ (0, L.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Add your staff on the Staff tab, enroll their faces and give each a PIN."
			}),
			i.node
		]
	});
}
function Y(e) {
	let [t, n] = (0, S.useState)(null), [r, i] = (0, S.useState)(null), [a, d] = (0, S.useState)(null), [f, p] = (0, S.useState)(""), [m, y] = (0, S.useState)(!1), x = (t) => e.roles.find((e) => e.id === t), C = e.staff.filter((e) => (m || e.active) && (!f || [
		e.name,
		e.name_local,
		e.emp_no,
		e.phone
	].some((e) => String(e || "").toLowerCase().includes(f.toLowerCase()))));
	return /* @__PURE__ */ (0, L.jsxs)("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, L.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, L.jsx)(_, {
						type: "search",
						className: "max-w-xs",
						placeholder: "🔎 Name, number, phone",
						value: f,
						onChange: (e) => p(e.target.value)
					}),
					/* @__PURE__ */ (0, L.jsxs)("label", {
						className: "flex items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, L.jsx)("input", {
							type: "checkbox",
							checked: m,
							onChange: (e) => y(e.target.checked)
						}), "Show inactive"]
					}),
					e.can && /* @__PURE__ */ (0, L.jsx)(h, {
						className: "ml-auto",
						onClick: () => n({ active: !0 }),
						children: "➕ Add staff"
					})
				]
			}),
			/* @__PURE__ */ (0, L.jsxs)("div", {
				className: "grid gap-2 sm:grid-cols-2 xl:grid-cols-3",
				children: [C.map((t) => /* @__PURE__ */ (0, L.jsxs)(g, {
					className: v("flex-row gap-3 p-3", !t.active && "opacity-60"),
					children: [/* @__PURE__ */ (0, L.jsx)(G, {
						s: t,
						cls: "size-16"
					}), /* @__PURE__ */ (0, L.jsxs)("div", {
						className: "grid min-w-0 flex-1 gap-0.5 text-sm",
						children: [
							/* @__PURE__ */ (0, L.jsx)("b", {
								className: "truncate text-base",
								children: t.name
							}),
							t.name_local && /* @__PURE__ */ (0, L.jsx)("span", {
								className: "text-muted-foreground",
								children: t.name_local
							}),
							/* @__PURE__ */ (0, L.jsx)("span", {
								className: "text-muted-foreground",
								children: [
									t.emp_no && "#" + t.emp_no,
									x(t.role_id)?.title,
									e.shifts.find((e) => e.id === t.shift_id)?.name,
									t.phone
								].filter(Boolean).join(" · ") || "—"
							}),
							/* @__PURE__ */ (0, L.jsxs)("span", {
								className: "flex flex-wrap gap-1",
								children: [/* @__PURE__ */ (0, L.jsx)(b, {
									variant: t.has_face ? "default" : "outline",
									children: t.has_face ? "🙂 face enrolled" : "⚠ no face"
								}), /* @__PURE__ */ (0, L.jsx)(b, {
									variant: t.has_pin ? "default" : "outline",
									children: t.has_pin ? "🔢 PIN set" : "⚠ no PIN"
								})]
							}),
							e.can && /* @__PURE__ */ (0, L.jsxs)("span", {
								className: "mt-1 flex flex-wrap gap-1",
								children: [
									/* @__PURE__ */ (0, L.jsx)(h, {
										size: "sm",
										variant: "outline",
										onClick: () => n(t),
										children: "✏️ Edit"
									}),
									/* @__PURE__ */ (0, L.jsxs)(h, {
										size: "sm",
										variant: "outline",
										onClick: () => i(t),
										children: ["📸 ", t.has_face ? "Re-enroll face" : "Enroll face"]
									}),
									/* @__PURE__ */ (0, L.jsxs)(h, {
										size: "sm",
										variant: "outline",
										onClick: async () => {
											if (t.has_pin && !await e.confirm({
												title: `New PIN for ${t.name}?`,
												body: "The old PIN stops working.",
												confirmLabel: "New PIN"
											})) return;
											let n = await e.api("POST", `/api/hr/staff/${t.id}/pin`, {});
											d({
												s: t,
												pin: n.pin
											}), await e.reloadAll();
										},
										children: ["🔢 ", t.has_pin ? "New PIN" : "Give PIN"]
									})
								]
							})
						]
					})]
				}, t.id)), !C.length && /* @__PURE__ */ (0, L.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No staff yet."
				})]
			}),
			t && /* @__PURE__ */ (0, L.jsx)(X, {
				c: e,
				s: t,
				onClose: () => n(null)
			}),
			r && /* @__PURE__ */ (0, L.jsx)(Z, {
				c: e,
				s: r,
				onClose: () => i(null)
			}),
			a && /* @__PURE__ */ (0, L.jsx)(u, {
				open: !0,
				onOpenChange: () => d(null),
				children: /* @__PURE__ */ (0, L.jsxs)(s, {
					className: "max-w-sm text-center",
					children: [
						/* @__PURE__ */ (0, L.jsxs)(o, { children: [/* @__PURE__ */ (0, L.jsxs)(c, { children: ["PIN for ", a.s.name] }), /* @__PURE__ */ (0, L.jsx)(l, { children: "Shown only now — write it on their card. They type it on the check-in page." })] }),
						/* @__PURE__ */ (0, L.jsx)("div", {
							className: "font-mono text-6xl font-black tracking-[0.3em]",
							children: a.pin
						}),
						/* @__PURE__ */ (0, L.jsx)(h, {
							variant: "outline",
							onClick: () => {
								let e = window.open("", "_blank");
								e && (e.document.write(`<html><body style="font-family:system-ui;text-align:center;padding:30px"><div style="border:3px solid #000;border-radius:16px;padding:20px;display:inline-block;min-width:280px">${a.s.photo ? `<img src="${a.s.photo}" style="width:120px;height:120px;border-radius:50%;object-fit:cover">` : ""}<h2>${a.s.name}</h2>${a.s.name_local ? `<h3>${a.s.name_local}</h3>` : ""}<p>হাজিরা নম্বর · Attendance PIN</p><div style="font-size:64px;font-weight:900;letter-spacing:12px">${a.pin}</div></div><script>print()<\/script></body></html>`), e.document.close());
							},
							children: "🖨 Print card"
						})
					]
				})
			})
		]
	});
}
function X({ c: e, s: t, onClose: n }) {
	let [r, i] = (0, S.useState)({ ...t }), [a, l] = (0, S.useState)(""), d = (e, t) => i((n) => ({
		...n,
		[e]: t
	})), f = (e, t, n = {}) => /* @__PURE__ */ (0, L.jsxs)("label", {
		className: "grid gap-1 text-xs font-semibold",
		children: [e, /* @__PURE__ */ (0, L.jsx)(_, {
			value: r[t] ?? "",
			onChange: (e) => d(t, e.target.value),
			...n
		})]
	});
	async function p() {
		try {
			let t = {
				site: e.siteId,
				...r
			}, i = r.id ? await e.api("PUT", `/api/hr/staff/${r.id}`, t) : await e.api("POST", "/api/hr/staff", t);
			e.setD({
				...e.D,
				...i
			}), n();
		} catch (e) {
			l(e.message);
		}
	}
	return /* @__PURE__ */ (0, L.jsx)(u, {
		open: !0,
		onOpenChange: n,
		children: /* @__PURE__ */ (0, L.jsxs)(s, {
			className: "max-h-[90vh] max-w-xl overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, L.jsx)(o, { children: /* @__PURE__ */ (0, L.jsx)(c, { children: r.id ? `Edit ${t.name}` : "Add staff" }) }),
				/* @__PURE__ */ (0, L.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [
						f("Name (English)", "name"),
						f("Name (Bangla / own language)", "name_local"),
						f("Staff number", "emp_no"),
						f("Mobile", "phone"),
						/* @__PURE__ */ (0, L.jsxs)("label", {
							className: "grid gap-1 text-xs font-semibold",
							children: ["Job role", /* @__PURE__ */ (0, L.jsxs)("select", {
								className: V,
								value: r.role_id ?? "",
								onChange: (e) => d("role_id", Number(e.target.value) || null),
								children: [/* @__PURE__ */ (0, L.jsx)("option", {
									value: "",
									children: "—"
								}), e.roles.map((e) => /* @__PURE__ */ (0, L.jsx)("option", {
									value: e.id,
									children: e.title
								}, e.id))]
							})]
						}),
						/* @__PURE__ */ (0, L.jsxs)("label", {
							className: "grid gap-1 text-xs font-semibold",
							children: ["Usual shift", /* @__PURE__ */ (0, L.jsxs)("select", {
								className: V,
								value: r.shift_id ?? "",
								onChange: (e) => d("shift_id", Number(e.target.value) || null),
								children: [/* @__PURE__ */ (0, L.jsx)("option", {
									value: "",
									children: "—"
								}), e.shifts.map((e) => /* @__PURE__ */ (0, L.jsxs)("option", {
									value: e.id,
									children: [
										e.name,
										" ",
										e.start,
										"–",
										e.end
									]
								}, e.id))]
							})]
						}),
						f("Department", "dept"),
						f("Nationality", "nationality"),
						f("Monthly wage (SAR)", "wage", {
							type: "number",
							min: 0
						}),
						f("Joined on", "joined_on", { type: "date" }),
						/* @__PURE__ */ (0, L.jsxs)("label", {
							className: "grid gap-1 text-xs font-semibold sm:col-span-2",
							children: ["Notes", /* @__PURE__ */ (0, L.jsx)(x, {
								value: r.notes ?? "",
								onChange: (e) => d("notes", e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, L.jsxs)("label", {
							className: "flex items-center gap-2 text-sm",
							children: [/* @__PURE__ */ (0, L.jsx)("input", {
								type: "checkbox",
								checked: r.active !== !1,
								onChange: (e) => d("active", e.target.checked)
							}), "Active (can check in)"]
						}),
						/* @__PURE__ */ (0, L.jsxs)("label", {
							className: "text-xs font-semibold",
							children: ["Photo ", /* @__PURE__ */ (0, L.jsx)("input", {
								type: "file",
								accept: "image/*",
								onChange: async (e) => {
									e.target.files?.[0] && d("photo", await H(e.target.files[0], 360));
								}
							})]
						})
					]
				}),
				a && /* @__PURE__ */ (0, L.jsx)("p", {
					className: "text-sm text-destructive",
					children: a
				}),
				/* @__PURE__ */ (0, L.jsxs)("div", {
					className: "flex justify-between gap-2",
					children: [r.id ? /* @__PURE__ */ (0, L.jsx)(h, {
						variant: "ghost",
						className: "text-destructive",
						onClick: async () => {
							await e.confirm({
								title: `Remove ${t.name}?`,
								body: "Their attendance and leave records stay.",
								confirmLabel: "Remove"
							}) && (e.setD({
								...e.D,
								...await e.api("DELETE", `/api/hr/staff/${r.id}`)
							}), n());
						},
						children: "🗑 Remove"
					}) : /* @__PURE__ */ (0, L.jsx)("span", {}), /* @__PURE__ */ (0, L.jsxs)("span", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, L.jsx)(h, {
							variant: "outline",
							onClick: n,
							children: "Cancel"
						}), /* @__PURE__ */ (0, L.jsx)(h, {
							onClick: () => void p(),
							children: "Save"
						})]
					})]
				})
			]
		})
	});
}
function Z({ c: e, s: t, onClose: n }) {
	let r = (0, S.useRef)(null), [i, a] = (0, S.useState)("Starting the camera…"), [d, f] = (0, S.useState)(!1), p = (0, S.useRef)(null), m = (0, S.useRef)(null);
	(0, S.useEffect)(() => {
		let e = !1;
		return (async () => {
			try {
				if (m.current = await navigator.mediaDevices.getUserMedia({ video: {
					facingMode: "user",
					width: { ideal: 640 }
				} }), e) return;
				r.current.srcObject = m.current, await r.current.play(), a("Loading face models (first time takes a moment)…");
				let n = await import(
					/* @vite-ignore */
					`${R}/dist/face-api.esm.js`
);
				for (let e of [
					"tinyFaceDetector",
					"faceLandmark68Net",
					"faceRecognitionNet"
				]) await n.nets[e].loadFromUri(`${R}/model/`);
				p.current = n, a(`Ask ${t.name} to look straight at the camera, in good light, then press Capture.`);
			} catch (e) {
				a("Camera / models not available: " + (e.message || e));
			}
		})(), () => {
			e = !0, m.current?.getTracks().forEach((e) => e.stop());
		};
	}, []);
	async function g() {
		let i = p.current;
		if (i) {
			f(!0);
			try {
				let o = new i.TinyFaceDetectorOptions({
					inputSize: 320,
					scoreThreshold: .5
				}), s = [];
				for (let e = 0; e < 3; e++) {
					a(`Look ${e + 1} of 3…`);
					let t = await i.detectSingleFace(r.current, o).withFaceLandmarks().withFaceDescriptor();
					t && s.push(t.descriptor), await new Promise((e) => setTimeout(e, 900));
				}
				if (s.length < 2) {
					a("No clear face — better light, face the camera, try again.");
					return;
				}
				let c = Array.from({ length: 128 }, (e, t) => s.reduce((e, n) => e + n[t], 0) / s.length), l = document.createElement("canvas");
				l.width = r.current.videoWidth, l.height = r.current.videoHeight, l.getContext("2d").drawImage(r.current, 0, 0);
				let u = await H(await new Promise((e) => l.toBlob((t) => e(t), "image/jpeg", .85)), 360);
				e.setD({
					...e.D,
					...await e.api("POST", `/api/hr/staff/${t.id}/face`, {
						descriptor: c,
						photo: u
					})
				}), n();
			} catch (e) {
				a(e.message);
			} finally {
				f(!1);
			}
		}
	}
	return /* @__PURE__ */ (0, L.jsx)(u, {
		open: !0,
		onOpenChange: n,
		children: /* @__PURE__ */ (0, L.jsxs)(s, {
			className: "max-w-md",
			children: [
				/* @__PURE__ */ (0, L.jsxs)(o, { children: [/* @__PURE__ */ (0, L.jsxs)(c, { children: ["📸 Enroll the face of ", t.name] }), /* @__PURE__ */ (0, L.jsx)(l, { children: "Only the person themself, in person. Tell them their photo is kept for attendance only." })] }),
				/* @__PURE__ */ (0, L.jsx)("video", {
					ref: r,
					playsInline: !0,
					muted: !0,
					className: "aspect-[3/4] w-full -scale-x-100 rounded-xl bg-black object-cover"
				}),
				/* @__PURE__ */ (0, L.jsx)("p", {
					className: "text-sm",
					children: i
				}),
				/* @__PURE__ */ (0, L.jsx)(h, {
					disabled: d || !p.current,
					onClick: () => void g(),
					children: d ? "Capturing…" : "📸 Capture"
				})
			]
		})
	});
}
function Q(e) {
	let [t, n] = (0, S.useState)(0), [r, i] = (0, S.useState)(null), [a, d] = (0, S.useState)(null), f = q(e.api), p = E(e.range.from, e.range.to > e.today ? e.today : e.range.to), m = (0, S.useMemo)(() => p.flatMap((n) => e.staff.filter((e) => t ? e.id === t : e.active).map((t) => N(t, n, e.punches, e.roster, e.shifts, e.leaves))).filter((e) => e.status !== "off" || e.ins.length), [
		p.join(),
		t,
		e.punches,
		e.roster,
		e.leaves,
		e.staff
	]), y = /* @__PURE__ */ new Map();
	for (let e of m) {
		let t = y.get(e.staff.id) || {
			s: e.staff,
			days: 0,
			absent: 0,
			late: 0,
			lateMin: 0,
			worked: 0,
			ot: 0,
			leave: 0
		};
		e.ins.length && t.days++, e.status === "absent" && t.absent++, e.late && (t.late++, t.lateMin += e.late), t.worked += e.worked, t.ot += e.ot, e.status === "leave" && t.leave++, y.set(e.staff.id, t);
	}
	let b = e.D.settings.otRate || 1.5, x = (e) => (Number(e.wage) || 0) / 30 / 8;
	return /* @__PURE__ */ (0, L.jsxs)("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, L.jsxs)("div", {
				className: "flex flex-wrap items-end gap-2",
				children: [
					/* @__PURE__ */ (0, L.jsxs)("label", {
						className: "grid gap-1 text-xs font-semibold",
						children: ["From", /* @__PURE__ */ (0, L.jsx)(_, {
							type: "date",
							value: e.range.from,
							onChange: (t) => e.setRange({
								...e.range,
								from: t.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, L.jsxs)("label", {
						className: "grid gap-1 text-xs font-semibold",
						children: ["To", /* @__PURE__ */ (0, L.jsx)(_, {
							type: "date",
							value: e.range.to,
							onChange: (t) => e.setRange({
								...e.range,
								to: t.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, L.jsxs)("label", {
						className: "grid gap-1 text-xs font-semibold",
						children: ["Person", /* @__PURE__ */ (0, L.jsxs)("select", {
							className: V,
							value: t,
							onChange: (e) => n(Number(e.target.value)),
							children: [/* @__PURE__ */ (0, L.jsx)("option", {
								value: 0,
								children: "Everyone"
							}), e.staff.map((e) => /* @__PURE__ */ (0, L.jsx)("option", {
								value: e.id,
								children: e.name
							}, e.id))]
						})]
					}),
					/* @__PURE__ */ (0, L.jsx)(h, {
						variant: "outline",
						onClick: () => U(`timesheet_${e.range.from}_${e.range.to}.csv`, [[
							"Date",
							"Name",
							"Shift",
							"In",
							"Out",
							"Worked",
							"Late min",
							"Early min",
							"Overtime",
							"Status",
							"Flags"
						], ...m.map((e) => [
							e.day,
							e.staff.name,
							e.shift?.name || "",
							e.first,
							e.last,
							A(e.worked),
							e.late,
							e.early,
							A(e.ot),
							P[e.status][0],
							e.flags.join(" ")
						])]),
						children: "⬇️ CSV"
					}),
					e.can && /* @__PURE__ */ (0, L.jsx)(h, {
						variant: "outline",
						onClick: () => i({
							kind: "in",
							at: D()
						}),
						children: "✍️ Add a missed punch"
					})
				]
			}),
			/* @__PURE__ */ (0, L.jsx)(g, {
				className: "overflow-x-auto p-0",
				children: /* @__PURE__ */ (0, L.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, L.jsx)("thead", {
						className: "bg-muted/60 text-left",
						children: /* @__PURE__ */ (0, L.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, L.jsx)("th", {
								className: "p-2",
								children: "Person"
							}),
							/* @__PURE__ */ (0, L.jsx)("th", {
								className: "p-2 text-right",
								children: "Days"
							}),
							/* @__PURE__ */ (0, L.jsx)("th", {
								className: "p-2 text-right",
								children: "Absent"
							}),
							/* @__PURE__ */ (0, L.jsx)("th", {
								className: "p-2 text-right",
								children: "Late (times · min)"
							}),
							/* @__PURE__ */ (0, L.jsx)("th", {
								className: "p-2 text-right",
								children: "Worked"
							}),
							/* @__PURE__ */ (0, L.jsx)("th", {
								className: "p-2 text-right",
								children: "Overtime"
							}),
							/* @__PURE__ */ (0, L.jsx)("th", {
								className: "p-2 text-right",
								children: "Leave days"
							}),
							/* @__PURE__ */ (0, L.jsxs)("th", {
								className: "p-2 text-right",
								children: [
									"Overtime pay (×",
									b,
									")"
								]
							})
						] })
					}), /* @__PURE__ */ (0, L.jsx)("tbody", { children: [...y.values()].map((e) => /* @__PURE__ */ (0, L.jsxs)("tr", {
						className: "border-t",
						children: [
							/* @__PURE__ */ (0, L.jsx)("td", {
								className: "p-2",
								children: /* @__PURE__ */ (0, L.jsxs)("span", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, L.jsx)(G, {
										s: e.s,
										cls: "size-7"
									}), e.s.name]
								})
							}),
							/* @__PURE__ */ (0, L.jsx)("td", {
								className: "p-2 text-right",
								children: e.days
							}),
							/* @__PURE__ */ (0, L.jsx)("td", {
								className: "p-2 text-right",
								children: e.absent
							}),
							/* @__PURE__ */ (0, L.jsxs)("td", {
								className: "p-2 text-right",
								children: [
									e.late,
									" · ",
									e.lateMin
								]
							}),
							/* @__PURE__ */ (0, L.jsx)("td", {
								className: "p-2 text-right",
								children: A(e.worked)
							}),
							/* @__PURE__ */ (0, L.jsx)("td", {
								className: "p-2 text-right",
								children: A(e.ot)
							}),
							/* @__PURE__ */ (0, L.jsx)("td", {
								className: "p-2 text-right",
								children: e.leave
							}),
							/* @__PURE__ */ (0, L.jsx)("td", {
								className: "p-2 text-right",
								children: e.s.wage ? `${(x(e.s) * b * e.ot / 60).toFixed(2)} SAR` : "—"
							})
						]
					}, e.s.id)) })]
				})
			}),
			/* @__PURE__ */ (0, L.jsx)(g, {
				className: "overflow-x-auto p-0",
				children: /* @__PURE__ */ (0, L.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, L.jsx)("thead", {
						className: "bg-muted/60 text-left",
						children: /* @__PURE__ */ (0, L.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, L.jsx)("th", {
								className: "p-2",
								children: "Day"
							}),
							/* @__PURE__ */ (0, L.jsx)("th", {
								className: "p-2",
								children: "Person"
							}),
							/* @__PURE__ */ (0, L.jsx)("th", {
								className: "p-2",
								children: "Shift"
							}),
							/* @__PURE__ */ (0, L.jsx)("th", {
								className: "p-2",
								children: "In"
							}),
							/* @__PURE__ */ (0, L.jsx)("th", {
								className: "p-2",
								children: "Out"
							}),
							/* @__PURE__ */ (0, L.jsx)("th", {
								className: "p-2 text-right",
								children: "Worked"
							}),
							/* @__PURE__ */ (0, L.jsx)("th", {
								className: "p-2 text-right",
								children: "Late"
							}),
							/* @__PURE__ */ (0, L.jsx)("th", {
								className: "p-2 text-right",
								children: "Early"
							}),
							/* @__PURE__ */ (0, L.jsx)("th", {
								className: "p-2 text-right",
								children: "OT"
							}),
							/* @__PURE__ */ (0, L.jsx)("th", {
								className: "p-2",
								children: "Status"
							}),
							/* @__PURE__ */ (0, L.jsx)("th", {
								className: "p-2",
								children: "Checks"
							})
						] })
					}), /* @__PURE__ */ (0, L.jsx)("tbody", { children: m.slice().reverse().map((t) => {
						let n = `${t.day}|${t.staff.id}`, r = e.punches.filter((e) => e.staff_id === t.staff.id && e.day === t.day);
						return [/* @__PURE__ */ (0, L.jsxs)("tr", {
							className: "cursor-pointer border-t hover:bg-accent/40",
							onClick: () => d(a === n ? null : n),
							children: [
								/* @__PURE__ */ (0, L.jsx)("td", {
									className: "p-2 whitespace-nowrap",
									children: B(t.day)
								}),
								/* @__PURE__ */ (0, L.jsx)("td", {
									className: "p-2",
									children: t.staff.name
								}),
								/* @__PURE__ */ (0, L.jsx)("td", {
									className: "p-2",
									children: t.shift ? `${t.shift.start}–${t.shift.end}` : "—"
								}),
								/* @__PURE__ */ (0, L.jsx)("td", {
									className: "p-2",
									children: t.first || "—"
								}),
								/* @__PURE__ */ (0, L.jsx)("td", {
									className: "p-2",
									children: t.last || "—"
								}),
								/* @__PURE__ */ (0, L.jsx)("td", {
									className: "p-2 text-right",
									children: A(t.worked)
								}),
								/* @__PURE__ */ (0, L.jsx)("td", {
									className: v("p-2 text-right", t.late && "font-semibold text-amber-700"),
									children: t.late || ""
								}),
								/* @__PURE__ */ (0, L.jsx)("td", {
									className: v("p-2 text-right", t.early && "text-amber-700"),
									children: t.early || ""
								}),
								/* @__PURE__ */ (0, L.jsx)("td", {
									className: "p-2 text-right",
									children: t.ot ? A(t.ot) : ""
								}),
								/* @__PURE__ */ (0, L.jsx)("td", {
									className: "p-2",
									children: /* @__PURE__ */ (0, L.jsx)("span", {
										className: v("rounded-full px-2 py-0.5 text-xs font-semibold", P[t.status][1]),
										children: P[t.status][0]
									})
								}),
								/* @__PURE__ */ (0, L.jsx)("td", {
									className: "p-2 text-xs text-red-700",
									children: [...t.flags.map((e) => I[e] || e), t.refused ? `❌ ${t.refused} refused` : ""].filter(Boolean).join(" · ")
								})
							]
						}, n), a === n && /* @__PURE__ */ (0, L.jsx)("tr", {
							className: "bg-muted/30",
							children: /* @__PURE__ */ (0, L.jsx)("td", {
								colSpan: 11,
								className: "p-2",
								children: /* @__PURE__ */ (0, L.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [r.map((t) => /* @__PURE__ */ (0, L.jsxs)("span", {
										className: v("flex items-center gap-2 rounded-lg border bg-card px-2 py-1 text-xs", t.kind === "refused" && "border-red-300"),
										children: [
											/* @__PURE__ */ (0, L.jsx)("b", { children: t.kind.toUpperCase() }),
											" ",
											t.at.slice(11, 16),
											" · ",
											t.source,
											t.dist == null ? "" : ` · ${t.dist} m`,
											t.face_dist == null ? "" : ` · face ${t.face_dist}`,
											t.note ? ` · ${t.note}` : "",
											t.has_selfie ? /* @__PURE__ */ (0, L.jsx)("button", {
												type: "button",
												className: "text-primary underline",
												onClick: () => void f.open(t.id),
												children: "selfie"
											}) : null,
											e.can && t.source === "manual" && /* @__PURE__ */ (0, L.jsx)("button", {
												type: "button",
												className: "text-destructive",
												onClick: async () => {
													await e.api("DELETE", `/api/hr/attendance/${t.id}`), await e.reload();
												},
												children: "✕"
											})
										]
									}, t.id)), !r.length && /* @__PURE__ */ (0, L.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "No punches."
									})]
								})
							})
						}, n + "x")];
					}) })]
				})
			}),
			r && /* @__PURE__ */ (0, L.jsx)(u, {
				open: !0,
				onOpenChange: () => i(null),
				children: /* @__PURE__ */ (0, L.jsxs)(s, {
					className: "max-w-sm",
					children: [
						/* @__PURE__ */ (0, L.jsxs)(o, { children: [/* @__PURE__ */ (0, L.jsx)(c, { children: "Add a missed punch" }), /* @__PURE__ */ (0, L.jsx)(l, { children: "Kept as “entered by a manager”, with your reason." })] }),
						/* @__PURE__ */ (0, L.jsxs)("select", {
							className: V,
							value: r.staff_id ?? "",
							onChange: (e) => i({
								...r,
								staff_id: Number(e.target.value)
							}),
							children: [/* @__PURE__ */ (0, L.jsx)("option", {
								value: "",
								children: "Person…"
							}), e.active.map((e) => /* @__PURE__ */ (0, L.jsx)("option", {
								value: e.id,
								children: e.name
							}, e.id))]
						}),
						/* @__PURE__ */ (0, L.jsxs)("select", {
							className: V,
							value: r.kind,
							onChange: (e) => i({
								...r,
								kind: e.target.value
							}),
							children: [/* @__PURE__ */ (0, L.jsx)("option", {
								value: "in",
								children: "IN"
							}), /* @__PURE__ */ (0, L.jsx)("option", {
								value: "out",
								children: "OUT"
							})]
						}),
						/* @__PURE__ */ (0, L.jsx)(_, {
							type: "datetime-local",
							value: r.at,
							onChange: (e) => i({
								...r,
								at: e.target.value
							})
						}),
						/* @__PURE__ */ (0, L.jsx)(_, {
							placeholder: "Reason (required)",
							value: r.note ?? "",
							onChange: (e) => i({
								...r,
								note: e.target.value
							})
						}),
						r.err && /* @__PURE__ */ (0, L.jsx)("p", {
							className: "text-sm text-destructive",
							children: r.err
						}),
						/* @__PURE__ */ (0, L.jsx)(h, {
							onClick: async () => {
								try {
									await e.api("POST", "/api/hr/attendance", {
										site: e.siteId,
										...r
									}), i(null), await e.reload();
								} catch (e) {
									i({
										...r,
										err: e.message
									});
								}
							},
							children: "Save"
						})
					]
				})
			}),
			f.node
		]
	});
}
function ee(e) {
	let [t, n] = (0, S.useState)(() => {
		let t = e.today;
		return T(t, -j(t));
	}), r = E(t, T(t, 6)), [i, a] = (0, S.useState)(/* @__PURE__ */ new Map()), [o, s] = (0, S.useState)(""), c = (t, n) => {
		let r = `${t}|${n.id}`;
		if (i.has(r)) {
			let a = i.get(r);
			return a === void 0 ? M(n, t, /* @__PURE__ */ new Map(), e.shifts)?.id ?? "off" : a ?? "off";
		}
		return e.roster.has(r) ? e.roster.get(r) ?? "off" : M(n, t, /* @__PURE__ */ new Map(), e.shifts)?.id ?? "off";
	};
	async function l(t = i) {
		let n = [...t].map(([e, t]) => {
			let [n, r] = e.split("|");
			return {
				day: n,
				staff_id: Number(r),
				shift_id: t
			};
		});
		await e.api("PUT", "/api/hr/schedule", {
			site: e.siteId,
			entries: n
		}), a(/* @__PURE__ */ new Map()), s(`Saved ${n.length} change(s).`), await e.reload();
	}
	async function u() {
		let t = /* @__PURE__ */ new Map();
		for (let n of e.active) for (let i of r) {
			let r = `${T(i, -7)}|${n.id}`;
			e.roster.has(r) && t.set(`${i}|${n.id}`, e.roster.get(r) ?? null);
		}
		t.size ? await l(t) : s("Last week has no roster changes to copy.");
	}
	return /* @__PURE__ */ (0, L.jsxs)("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, L.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, L.jsx)(h, {
						variant: "outline",
						onClick: () => n(T(t, -7)),
						children: "◀"
					}),
					/* @__PURE__ */ (0, L.jsxs)("b", { children: [
						B(r[0]),
						" – ",
						B(r[6])
					] }),
					/* @__PURE__ */ (0, L.jsx)(h, {
						variant: "outline",
						onClick: () => n(T(t, 7)),
						children: "▶"
					}),
					e.can && /* @__PURE__ */ (0, L.jsxs)(L.Fragment, { children: [/* @__PURE__ */ (0, L.jsxs)(h, {
						disabled: !i.size,
						onClick: () => void l(),
						children: [
							"Save roster (",
							i.size,
							")"
						]
					}), /* @__PURE__ */ (0, L.jsx)(h, {
						variant: "outline",
						onClick: () => void u(),
						children: "Copy last week"
					})] }),
					/* @__PURE__ */ (0, L.jsx)("span", {
						className: "text-sm text-muted-foreground",
						children: o
					})
				]
			}),
			/* @__PURE__ */ (0, L.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Each person works their usual shift on its weekdays unless changed here. Choose “off” for a day off."
			}),
			/* @__PURE__ */ (0, L.jsx)(g, {
				className: "overflow-x-auto p-0",
				children: /* @__PURE__ */ (0, L.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, L.jsx)("thead", {
						className: "bg-muted/60",
						children: /* @__PURE__ */ (0, L.jsxs)("tr", { children: [/* @__PURE__ */ (0, L.jsx)("th", {
							className: "p-2 text-left",
							children: "Person"
						}), r.map((t) => /* @__PURE__ */ (0, L.jsx)("th", {
							className: v("p-2", t === e.today && "bg-primary/10"),
							children: B(t)
						}, t))] })
					}), /* @__PURE__ */ (0, L.jsx)("tbody", { children: e.active.map((t) => /* @__PURE__ */ (0, L.jsxs)("tr", {
						className: "border-t",
						children: [/* @__PURE__ */ (0, L.jsx)("td", {
							className: "p-2",
							children: /* @__PURE__ */ (0, L.jsxs)("span", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, L.jsx)(G, {
									s: t,
									cls: "size-7"
								}), t.name]
							})
						}), r.map((n) => {
							let r = c(n, t), i = e.shifts.find((e) => e.id === r), o = e.leaves.find((e) => e.staff_id === t.id && e.status === "approved" && e.from_day <= n && e.to_day >= n);
							return /* @__PURE__ */ (0, L.jsx)("td", {
								className: "p-1 text-center",
								style: { background: i ? i.color + "22" : void 0 },
								children: o ? /* @__PURE__ */ (0, L.jsxs)("span", {
									className: "text-xs font-semibold text-sky-700",
									children: ["🤒 ", o.type]
								}) : /* @__PURE__ */ (0, L.jsxs)("select", {
									disabled: !e.can,
									className: "h-8 w-full rounded border bg-background px-1 text-xs",
									value: String(r),
									onChange: (e) => a((r) => new Map(r).set(`${n}|${t.id}`, e.target.value === "off" ? null : Number(e.target.value))),
									children: [/* @__PURE__ */ (0, L.jsx)("option", {
										value: "off",
										children: "off"
									}), e.shifts.map((e) => /* @__PURE__ */ (0, L.jsxs)("option", {
										value: e.id,
										children: [
											e.name,
											" ",
											e.start
										]
									}, e.id))]
								})
							}, n);
						})]
					}, t.id)) })]
				})
			})
		]
	});
}
function te(e) {
	let [t, n] = (0, S.useState)(null), [r, i] = (0, S.useState)(null), a = (t) => e.staff.find((e) => e.id === t)?.name || "—", l = e.today.slice(0, 4), d = e.D.settings.annualDays ?? 21, f = [...e.leaves].sort((e, t) => (e.status === "pending" ? -1 : 0) - (t.status === "pending" ? -1 : 0)), p = async (t, n) => {
		await e.api("PUT", `/api/hr/leaves/${t.id}`, { status: n }), await e.reload();
	};
	return /* @__PURE__ */ (0, L.jsxs)("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, L.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [e.can && /* @__PURE__ */ (0, L.jsx)(h, {
					onClick: () => n({
						type: "annual",
						from_day: e.today,
						to_day: e.today,
						approved: !0
					}),
					children: "➕ Add leave"
				}), /* @__PURE__ */ (0, L.jsxs)("span", {
					className: "text-sm text-muted-foreground",
					children: [
						"Annual leave: ",
						d,
						" days a year each (Settings)."
					]
				})]
			}),
			/* @__PURE__ */ (0, L.jsx)(g, {
				className: "overflow-x-auto p-0",
				children: /* @__PURE__ */ (0, L.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, L.jsx)("thead", {
						className: "bg-muted/60 text-left",
						children: /* @__PURE__ */ (0, L.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, L.jsx)("th", {
								className: "p-2",
								children: "Person"
							}),
							/* @__PURE__ */ (0, L.jsx)("th", {
								className: "p-2",
								children: "Type"
							}),
							/* @__PURE__ */ (0, L.jsx)("th", {
								className: "p-2",
								children: "Dates"
							}),
							/* @__PURE__ */ (0, L.jsx)("th", {
								className: "p-2 text-right",
								children: "Days"
							}),
							/* @__PURE__ */ (0, L.jsx)("th", {
								className: "p-2",
								children: "Reason"
							}),
							/* @__PURE__ */ (0, L.jsx)("th", {
								className: "p-2",
								children: "Annual left"
							}),
							/* @__PURE__ */ (0, L.jsx)("th", {
								className: "p-2",
								children: "Status"
							}),
							/* @__PURE__ */ (0, L.jsx)("th", { className: "p-2" })
						] })
					}), /* @__PURE__ */ (0, L.jsx)("tbody", { children: f.map((t) => /* @__PURE__ */ (0, L.jsxs)("tr", {
						className: v("border-t", t.status === "pending" && "bg-amber-50 dark:bg-amber-950/30"),
						children: [
							/* @__PURE__ */ (0, L.jsx)("td", {
								className: "p-2",
								children: a(t.staff_id)
							}),
							/* @__PURE__ */ (0, L.jsx)("td", {
								className: "p-2",
								children: t.type
							}),
							/* @__PURE__ */ (0, L.jsxs)("td", {
								className: "p-2 whitespace-nowrap",
								children: [B(t.from_day), t.to_day === t.from_day ? "" : ` – ${B(t.to_day)}`]
							}),
							/* @__PURE__ */ (0, L.jsx)("td", {
								className: "p-2 text-right",
								children: t.days
							}),
							/* @__PURE__ */ (0, L.jsxs)("td", {
								className: "p-2",
								children: [
									t.reason,
									t.has_photo ? /* @__PURE__ */ (0, L.jsx)("button", {
										type: "button",
										className: "ml-1 text-primary underline",
										onClick: async () => i((await e.api("GET", `/api/hr/leaves/${t.id}/photo`)).photo),
										children: "📎 note"
									}) : null,
									/* @__PURE__ */ (0, L.jsx)("small", {
										className: "block text-muted-foreground",
										children: t.via === "worker" ? "asked on the check-in page" : "entered by a manager"
									})
								]
							}),
							/* @__PURE__ */ (0, L.jsx)("td", {
								className: "p-2",
								children: d - F(e.leaves, t.staff_id, l)
							}),
							/* @__PURE__ */ (0, L.jsxs)("td", {
								className: "p-2",
								children: [/* @__PURE__ */ (0, L.jsx)(b, {
									variant: t.status === "approved" ? "default" : "outline",
									children: t.status
								}), t.decided_by && /* @__PURE__ */ (0, L.jsx)("small", {
									className: "block text-muted-foreground",
									children: t.decided_by
								})]
							}),
							/* @__PURE__ */ (0, L.jsxs)("td", {
								className: "p-2 whitespace-nowrap",
								children: [e.can && t.status === "pending" && /* @__PURE__ */ (0, L.jsxs)(L.Fragment, { children: [
									/* @__PURE__ */ (0, L.jsx)(h, {
										size: "sm",
										onClick: () => void p(t, "approved"),
										children: "✔ Approve"
									}),
									" ",
									/* @__PURE__ */ (0, L.jsx)(h, {
										size: "sm",
										variant: "outline",
										onClick: () => void p(t, "rejected"),
										children: "✖ Refuse"
									})
								] }), e.can && t.status === "approved" && /* @__PURE__ */ (0, L.jsx)(h, {
									size: "sm",
									variant: "ghost",
									onClick: () => void p(t, "cancelled"),
									children: "Cancel"
								})]
							})
						]
					}, t.id)) })]
				})
			}),
			t && /* @__PURE__ */ (0, L.jsx)(u, {
				open: !0,
				onOpenChange: () => n(null),
				children: /* @__PURE__ */ (0, L.jsxs)(s, {
					className: "max-w-sm",
					children: [
						/* @__PURE__ */ (0, L.jsx)(o, { children: /* @__PURE__ */ (0, L.jsx)(c, { children: "Add leave" }) }),
						/* @__PURE__ */ (0, L.jsxs)("select", {
							className: V,
							value: t.staff_id ?? "",
							onChange: (e) => n({
								...t,
								staff_id: Number(e.target.value)
							}),
							children: [/* @__PURE__ */ (0, L.jsx)("option", {
								value: "",
								children: "Person…"
							}), e.active.map((e) => /* @__PURE__ */ (0, L.jsx)("option", {
								value: e.id,
								children: e.name
							}, e.id))]
						}),
						/* @__PURE__ */ (0, L.jsx)("select", {
							className: V,
							value: t.type,
							onChange: (e) => n({
								...t,
								type: e.target.value
							}),
							children: [
								"annual",
								"sick",
								"emergency",
								"unpaid",
								"other"
							].map((e) => /* @__PURE__ */ (0, L.jsx)("option", { children: e }, e))
						}),
						/* @__PURE__ */ (0, L.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, L.jsx)(_, {
								type: "date",
								value: t.from_day,
								onChange: (e) => n({
									...t,
									from_day: e.target.value
								})
							}), /* @__PURE__ */ (0, L.jsx)(_, {
								type: "date",
								value: t.to_day,
								onChange: (e) => n({
									...t,
									to_day: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, L.jsx)(_, {
							placeholder: "Reason",
							value: t.reason ?? "",
							onChange: (e) => n({
								...t,
								reason: e.target.value
							})
						}),
						/* @__PURE__ */ (0, L.jsxs)("label", {
							className: "flex items-center gap-2 text-sm",
							children: [/* @__PURE__ */ (0, L.jsx)("input", {
								type: "checkbox",
								checked: !!t.approved,
								onChange: (e) => n({
									...t,
									approved: e.target.checked
								})
							}), "Approved"]
						}),
						t.err && /* @__PURE__ */ (0, L.jsx)("p", {
							className: "text-sm text-destructive",
							children: t.err
						}),
						/* @__PURE__ */ (0, L.jsx)(h, {
							onClick: async () => {
								try {
									await e.api("POST", "/api/hr/leaves", {
										site: e.siteId,
										...t
									}), n(null), await e.reload();
								} catch (e) {
									n({
										...t,
										err: e.message
									});
								}
							},
							children: "Save"
						})
					]
				})
			}),
			r && /* @__PURE__ */ (0, L.jsx)(u, {
				open: !0,
				onOpenChange: () => i(null),
				children: /* @__PURE__ */ (0, L.jsx)(s, { children: /* @__PURE__ */ (0, L.jsx)("img", {
					src: r,
					alt: "Note",
					className: "w-full rounded-xl"
				}) })
			})
		]
	});
}
function ne(e) {
	let [t, n] = (0, S.useState)(e.today), [r, i] = (0, S.useState)(null), [a, o] = (0, S.useState)(null), c = e.tasks.filter((e) => e.day === t), l = (t) => e.staff.find((e) => e.id === t)?.name || "?", d = async (t, n) => {
		await e.api("PUT", `/api/hr/tasks/${t.id}`, { action: n }), await e.reload();
	}, f = [
		["open", "To do"],
		["started", "Started"],
		["done", "Done — check it"],
		["verified", "Checked ✔"]
	], p = (e) => e.started_at && e.done_at ? Math.round((Date.parse(e.done_at + ":00Z") - Date.parse(e.started_at + ":00Z")) / 6e4) : null;
	return /* @__PURE__ */ (0, L.jsxs)("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, L.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, L.jsx)(h, {
						variant: "outline",
						onClick: () => n(T(t, -1)),
						children: "◀"
					}),
					/* @__PURE__ */ (0, L.jsx)(_, {
						type: "date",
						className: "w-44",
						value: t,
						onChange: (e) => n(e.target.value || t)
					}),
					/* @__PURE__ */ (0, L.jsx)(h, {
						variant: "outline",
						onClick: () => n(T(t, 1)),
						children: "▶"
					}),
					e.can && /* @__PURE__ */ (0, L.jsx)(h, {
						className: "ml-auto",
						onClick: () => i({
							day: t,
							days: [t],
							staff_ids: [],
							priority: "normal",
							checklist: []
						}),
						children: "➕ New task"
					})
				]
			}),
			/* @__PURE__ */ (0, L.jsx)("div", {
				className: "grid gap-3 lg:grid-cols-4",
				children: f.map(([t, n]) => /* @__PURE__ */ (0, L.jsxs)(g, {
					className: "content-start gap-2 bg-muted/30 p-2",
					children: [/* @__PURE__ */ (0, L.jsxs)("b", {
						className: "px-1 text-sm",
						children: [
							n,
							" (",
							c.filter((e) => e.status === t).length,
							")"
						]
					}), c.filter((e) => e.status === t).map((t) => /* @__PURE__ */ (0, L.jsxs)("div", {
						className: v("grid gap-1 rounded-lg border bg-card p-2 text-sm", t.priority === "high" && "border-red-300"),
						children: [
							/* @__PURE__ */ (0, L.jsx)("b", { children: t.title }),
							t.title_local && /* @__PURE__ */ (0, L.jsx)("span", {
								className: "text-muted-foreground",
								children: t.title_local
							}),
							/* @__PURE__ */ (0, L.jsx)("small", {
								className: "text-muted-foreground",
								children: [
									t.place && "📍 " + t.place,
									t.due && "⏰ " + t.due,
									t.minutes && `⌛ ${t.minutes} min`
								].filter(Boolean).join(" · ")
							}),
							/* @__PURE__ */ (0, L.jsxs)("small", { children: ["👷 ", t.staff_ids.map(l).join(", ") || "—"] }),
							(t.started_at || t.done_at) && /* @__PURE__ */ (0, L.jsxs)("small", {
								className: "text-muted-foreground",
								children: [
									t.started_at ? `started ${t.started_at.slice(11)}` : "",
									t.done_at ? ` · done ${t.done_at.slice(11)}` : "",
									p(t) == null ? "" : ` · took ${p(t)} min${t.minutes && p(t) > t.minutes ? " ⚠" : ""}`
								]
							}),
							t.note && /* @__PURE__ */ (0, L.jsxs)("small", {
								className: "text-red-700",
								children: ["💬 ", t.note]
							}),
							/* @__PURE__ */ (0, L.jsxs)("span", {
								className: "flex flex-wrap gap-1",
								children: [
									t.has_photo ? /* @__PURE__ */ (0, L.jsx)(h, {
										size: "sm",
										variant: "outline",
										onClick: async () => o((await e.api("GET", `/api/hr/tasks/${t.id}/photo`)).photo),
										children: "📷 photo"
									}) : null,
									e.can && t.status === "done" && /* @__PURE__ */ (0, L.jsxs)(L.Fragment, { children: [/* @__PURE__ */ (0, L.jsx)(h, {
										size: "sm",
										onClick: () => void d(t, "verify"),
										children: "✔ OK"
									}), /* @__PURE__ */ (0, L.jsx)(h, {
										size: "sm",
										variant: "outline",
										onClick: () => void d(t, "redo"),
										children: "↺ Redo"
									})] }),
									e.can && /* @__PURE__ */ (0, L.jsx)(h, {
										size: "sm",
										variant: "ghost",
										onClick: () => i({
											...t,
											days: [t.day]
										}),
										children: "✏️"
									}),
									e.can && /* @__PURE__ */ (0, L.jsx)(h, {
										size: "sm",
										variant: "ghost",
										className: "text-destructive",
										onClick: async () => {
											await e.confirm({
												title: "Delete this task?",
												confirmLabel: "Delete"
											}) && (await e.api("DELETE", `/api/hr/tasks/${t.id}`), await e.reload());
										},
										children: "🗑"
									})
								]
							})
						]
					}, t.id))]
				}, t))
			}),
			r && /* @__PURE__ */ (0, L.jsx)(re, {
				c: e,
				t: r,
				onClose: () => i(null)
			}),
			a && /* @__PURE__ */ (0, L.jsx)(u, {
				open: !0,
				onOpenChange: () => o(null),
				children: /* @__PURE__ */ (0, L.jsx)(s, { children: /* @__PURE__ */ (0, L.jsx)("img", {
					src: a,
					alt: "Proof",
					className: "w-full rounded-xl"
				}) })
			})
		]
	});
}
function re({ c: e, t, onClose: n }) {
	let [r, i] = (0, S.useState)({
		...t,
		checklistText: (t.checklist || []).join("\n"),
		repeatTo: ""
	}), [a, d] = (0, S.useState)(""), f = (e, t) => i((n) => ({
		...n,
		[e]: t
	})), p = (t) => e.roles.find((e) => e.id === t);
	async function m() {
		let t = r.id ? [r.day] : r.repeatTo && r.repeatTo > r.day ? E(r.day, r.repeatTo) : [r.day], i = {
			site: e.siteId,
			...r,
			days: t,
			checklist: String(r.checklistText || "").split("\n").map((e) => e.trim()).filter(Boolean)
		};
		try {
			r.id ? await e.api("PUT", `/api/hr/tasks/${r.id}`, i) : await e.api("POST", "/api/hr/tasks", i), await e.reload(), n();
		} catch (e) {
			d(e.message);
		}
	}
	return /* @__PURE__ */ (0, L.jsx)(u, {
		open: !0,
		onOpenChange: n,
		children: /* @__PURE__ */ (0, L.jsxs)(s, {
			className: "max-h-[90vh] max-w-xl overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, L.jsxs)(o, { children: [/* @__PURE__ */ (0, L.jsx)(c, { children: r.id ? "Edit task" : "New task" }), /* @__PURE__ */ (0, L.jsx)(l, { children: "Write it short. Add the Bangla words if you can — the check-in page shows them first." })] }),
				/* @__PURE__ */ (0, L.jsxs)("div", {
					className: "grid gap-2",
					children: [
						/* @__PURE__ */ (0, L.jsx)(_, {
							placeholder: "Task (English), e.g. Clean the 7th floor corridor",
							value: r.title ?? "",
							onChange: (e) => f("title", e.target.value)
						}),
						/* @__PURE__ */ (0, L.jsx)(_, {
							placeholder: "Task (Bangla)",
							value: r.title_local ?? "",
							onChange: (e) => f("title_local", e.target.value)
						}),
						/* @__PURE__ */ (0, L.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, L.jsx)(_, {
								placeholder: "Where (📍 place)",
								value: r.place ?? "",
								onChange: (e) => f("place", e.target.value)
							}), /* @__PURE__ */ (0, L.jsx)(_, {
								type: "time",
								value: r.due ?? "",
								onChange: (e) => f("due", e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, L.jsxs)("div", {
							className: "grid grid-cols-3 gap-2",
							children: [
								/* @__PURE__ */ (0, L.jsxs)("label", {
									className: "grid gap-1 text-xs font-semibold",
									children: ["Day", /* @__PURE__ */ (0, L.jsx)(_, {
										type: "date",
										value: r.day,
										onChange: (e) => f("day", e.target.value)
									})]
								}),
								!r.id && /* @__PURE__ */ (0, L.jsxs)("label", {
									className: "grid gap-1 text-xs font-semibold",
									children: ["Repeat daily until", /* @__PURE__ */ (0, L.jsx)(_, {
										type: "date",
										value: r.repeatTo,
										onChange: (e) => f("repeatTo", e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, L.jsxs)("label", {
									className: "grid gap-1 text-xs font-semibold",
									children: ["Minutes it should take", /* @__PURE__ */ (0, L.jsx)(_, {
										type: "number",
										min: 0,
										value: r.minutes ?? "",
										onChange: (e) => f("minutes", Number(e.target.value))
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, L.jsxs)("div", {
							className: "flex flex-wrap gap-3 text-sm",
							children: [/* @__PURE__ */ (0, L.jsxs)("select", {
								className: V,
								value: r.priority,
								onChange: (e) => f("priority", e.target.value),
								children: [
									/* @__PURE__ */ (0, L.jsx)("option", {
										value: "high",
										children: "⚠ Urgent"
									}),
									/* @__PURE__ */ (0, L.jsx)("option", {
										value: "normal",
										children: "Normal"
									}),
									/* @__PURE__ */ (0, L.jsx)("option", {
										value: "low",
										children: "Low"
									})
								]
							}), /* @__PURE__ */ (0, L.jsxs)("label", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, L.jsx)("input", {
									type: "checkbox",
									checked: !!r.need_photo,
									onChange: (e) => f("need_photo", e.target.checked)
								}), "📷 Photo when done"]
							})]
						}),
						/* @__PURE__ */ (0, L.jsx)(x, {
							placeholder: "Details",
							value: r.details ?? "",
							onChange: (e) => f("details", e.target.value)
						}),
						/* @__PURE__ */ (0, L.jsx)(x, {
							placeholder: "Checklist — one step a line",
							value: r.checklistText,
							onChange: (e) => f("checklistText", e.target.value)
						}),
						/* @__PURE__ */ (0, L.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, L.jsx)("b", {
								className: "text-xs",
								children: "Who does it"
							}), /* @__PURE__ */ (0, L.jsx)("div", {
								className: "flex flex-wrap gap-1.5",
								children: e.active.map((e) => {
									let t = r.staff_ids.includes(e.id);
									return /* @__PURE__ */ (0, L.jsxs)("button", {
										type: "button",
										onClick: () => f("staff_ids", t ? r.staff_ids.filter((t) => t !== e.id) : [...r.staff_ids, e.id]),
										className: v("flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs", t && "border-primary bg-primary/10 font-semibold"),
										children: [
											/* @__PURE__ */ (0, L.jsx)(G, {
												s: e,
												cls: "size-5"
											}),
											e.name,
											p(e.role_id) ? ` · ${p(e.role_id).title}` : ""
										]
									}, e.id);
								})
							})]
						}),
						!r.id && e.roles.length > 0 && /* @__PURE__ */ (0, L.jsxs)("div", {
							className: "text-xs",
							children: [
								/* @__PURE__ */ (0, L.jsx)("b", { children: "From a job role's duties:" }),
								" ",
								e.roles.map((e) => /* @__PURE__ */ (0, L.jsx)("button", {
									type: "button",
									className: "ml-1 text-primary underline",
									onClick: () => f("checklistText", (e.duties || []).join("\n")),
									children: e.title
								}, e.id))
							]
						})
					]
				}),
				a && /* @__PURE__ */ (0, L.jsx)("p", {
					className: "text-sm text-destructive",
					children: a
				}),
				/* @__PURE__ */ (0, L.jsxs)("div", {
					className: "flex justify-end gap-2",
					children: [/* @__PURE__ */ (0, L.jsx)(h, {
						variant: "outline",
						onClick: n,
						children: "Cancel"
					}), /* @__PURE__ */ (0, L.jsx)(h, {
						onClick: () => void m(),
						children: "Save"
					})]
				})
			]
		})
	});
}
function ie(e) {
	let [t, n] = (0, S.useState)(null), [r, i] = (0, S.useState)(null), a = async () => {
		let r = t.id ? await e.api("PUT", `/api/hr/shifts/${t.id}`, t) : await e.api("POST", "/api/hr/shifts", {
			site: e.siteId,
			...t
		});
		e.setD({
			...e.D,
			...r
		}), n(null);
	}, l = async () => {
		let t = {
			...r,
			duties: String(r.dutiesText || "").split("\n").map((e) => e.trim()).filter(Boolean)
		}, n = r.id ? await e.api("PUT", `/api/hr/roles/${r.id}`, t) : await e.api("POST", "/api/hr/roles", {
			site: e.siteId,
			...t
		});
		e.setD({
			...e.D,
			...n
		}), i(null);
	};
	return /* @__PURE__ */ (0, L.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-2",
		children: [
			/* @__PURE__ */ (0, L.jsxs)(g, {
				className: "content-start gap-2 p-4",
				children: [
					/* @__PURE__ */ (0, L.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, L.jsx)("h2", {
							className: "font-bold",
							children: "Shifts"
						}), e.can && /* @__PURE__ */ (0, L.jsx)(h, {
							size: "sm",
							onClick: () => n({
								name: "Morning",
								start: "07:00",
								end: "15:00",
								break_min: 60,
								grace_min: 10,
								days: [
									0,
									1,
									2,
									3,
									4,
									6
								],
								color: "#2563eb"
							}),
							children: "➕ Shift"
						})]
					}),
					e.shifts.map((t) => /* @__PURE__ */ (0, L.jsxs)("div", {
						className: "flex items-center gap-2 rounded-lg border p-2 text-sm",
						children: [
							/* @__PURE__ */ (0, L.jsx)("span", {
								className: "size-4 rounded",
								style: { background: t.color }
							}),
							/* @__PURE__ */ (0, L.jsx)("b", { children: t.name }),
							/* @__PURE__ */ (0, L.jsxs)("span", { children: [
								t.start,
								"–",
								t.end
							] }),
							/* @__PURE__ */ (0, L.jsxs)("span", {
								className: "text-muted-foreground",
								children: [
									"break ",
									t.break_min,
									" · grace ",
									t.grace_min,
									" min · ",
									t.days.map((e) => z[e]).join(" ")
								]
							}),
							e.can && /* @__PURE__ */ (0, L.jsxs)("span", {
								className: "ml-auto flex gap-1",
								children: [/* @__PURE__ */ (0, L.jsx)(h, {
									size: "sm",
									variant: "ghost",
									onClick: () => n(t),
									children: "✏️"
								}), /* @__PURE__ */ (0, L.jsx)(h, {
									size: "sm",
									variant: "ghost",
									onClick: async () => e.setD({
										...e.D,
										...await e.api("DELETE", `/api/hr/shifts/${t.id}`)
									}),
									children: "🗑"
								})]
							})
						]
					}, t.id)),
					!e.shifts.length && /* @__PURE__ */ (0, L.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "No shifts yet."
					})
				]
			}),
			/* @__PURE__ */ (0, L.jsxs)(g, {
				className: "content-start gap-2 p-4",
				children: [
					/* @__PURE__ */ (0, L.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, L.jsx)("h2", {
							className: "font-bold",
							children: "Job roles and their duties"
						}), e.can && /* @__PURE__ */ (0, L.jsx)(h, {
							size: "sm",
							onClick: () => i({
								title: "",
								duties: [],
								dutiesText: ""
							}),
							children: "➕ Role"
						})]
					}),
					e.roles.map((t) => /* @__PURE__ */ (0, L.jsxs)("div", {
						className: "grid gap-1 rounded-lg border p-2 text-sm",
						children: [
							/* @__PURE__ */ (0, L.jsxs)("span", {
								className: "flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, L.jsx)("b", { children: t.title }),
									t.title_local && /* @__PURE__ */ (0, L.jsx)("span", {
										className: "text-muted-foreground",
										children: t.title_local
									}),
									e.can && /* @__PURE__ */ (0, L.jsxs)("span", {
										className: "ml-auto flex gap-1",
										children: [/* @__PURE__ */ (0, L.jsx)(h, {
											size: "sm",
											variant: "ghost",
											onClick: () => i({
												...t,
												dutiesText: (t.duties || []).join("\n")
											}),
											children: "✏️"
										}), /* @__PURE__ */ (0, L.jsx)(h, {
											size: "sm",
											variant: "ghost",
											onClick: async () => e.setD({
												...e.D,
												...await e.api("DELETE", `/api/hr/roles/${t.id}`)
											}),
											children: "🗑"
										})]
									})
								]
							}),
							(t.duties || []).length > 0 && /* @__PURE__ */ (0, L.jsx)("ul", {
								className: "list-disc pl-5 text-muted-foreground",
								children: t.duties.map((e, t) => /* @__PURE__ */ (0, L.jsx)("li", { children: e }, t))
							}),
							/* @__PURE__ */ (0, L.jsxs)("small", {
								className: "text-muted-foreground",
								children: [e.staff.filter((e) => e.role_id === t.id && e.active).length, " people"]
							})
						]
					}, t.id)),
					!e.roles.length && /* @__PURE__ */ (0, L.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "E.g. Room cleaner, Laundry, Kitchen helper, Driver, Security — each with its daily duties (they become task checklists)."
					})
				]
			}),
			t && /* @__PURE__ */ (0, L.jsx)(u, {
				open: !0,
				onOpenChange: () => n(null),
				children: /* @__PURE__ */ (0, L.jsxs)(s, {
					className: "max-w-sm",
					children: [
						/* @__PURE__ */ (0, L.jsx)(o, { children: /* @__PURE__ */ (0, L.jsx)(c, { children: "Shift" }) }),
						/* @__PURE__ */ (0, L.jsx)(_, {
							value: t.name,
							onChange: (e) => n({
								...t,
								name: e.target.value
							}),
							placeholder: "Name"
						}),
						/* @__PURE__ */ (0, L.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [
								/* @__PURE__ */ (0, L.jsxs)("label", {
									className: "grid gap-1 text-xs",
									children: ["Start", /* @__PURE__ */ (0, L.jsx)(_, {
										type: "time",
										value: t.start,
										onChange: (e) => n({
											...t,
											start: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, L.jsxs)("label", {
									className: "grid gap-1 text-xs",
									children: ["End", /* @__PURE__ */ (0, L.jsx)(_, {
										type: "time",
										value: t.end,
										onChange: (e) => n({
											...t,
											end: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, L.jsxs)("label", {
									className: "grid gap-1 text-xs",
									children: ["Break (min)", /* @__PURE__ */ (0, L.jsx)(_, {
										type: "number",
										value: t.break_min,
										onChange: (e) => n({
											...t,
											break_min: Number(e.target.value)
										})
									})]
								}),
								/* @__PURE__ */ (0, L.jsxs)("label", {
									className: "grid gap-1 text-xs",
									children: ["Grace before “late” (min)", /* @__PURE__ */ (0, L.jsx)(_, {
										type: "number",
										value: t.grace_min,
										onChange: (e) => n({
											...t,
											grace_min: Number(e.target.value)
										})
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, L.jsx)("div", {
							className: "flex flex-wrap gap-1",
							children: z.map((e, r) => /* @__PURE__ */ (0, L.jsx)("button", {
								type: "button",
								className: v("rounded border px-2 py-1 text-xs", t.days.includes(r) && "border-primary bg-primary/10 font-bold"),
								onClick: () => n({
									...t,
									days: t.days.includes(r) ? t.days.filter((e) => e !== r) : [...t.days, r]
								}),
								children: e
							}, e))
						}),
						/* @__PURE__ */ (0, L.jsxs)("label", {
							className: "flex items-center gap-2 text-sm",
							children: ["Colour ", /* @__PURE__ */ (0, L.jsx)("input", {
								type: "color",
								value: t.color,
								onChange: (e) => n({
									...t,
									color: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, L.jsx)(h, {
							onClick: () => void a(),
							children: "Save"
						})
					]
				})
			}),
			r && /* @__PURE__ */ (0, L.jsx)(u, {
				open: !0,
				onOpenChange: () => i(null),
				children: /* @__PURE__ */ (0, L.jsxs)(s, {
					className: "max-w-md",
					children: [
						/* @__PURE__ */ (0, L.jsx)(o, { children: /* @__PURE__ */ (0, L.jsx)(c, { children: "Job role" }) }),
						/* @__PURE__ */ (0, L.jsx)(_, {
							value: r.title,
							onChange: (e) => i({
								...r,
								title: e.target.value
							}),
							placeholder: "Title, e.g. Room cleaner"
						}),
						/* @__PURE__ */ (0, L.jsx)(_, {
							value: r.title_local ?? "",
							onChange: (e) => i({
								...r,
								title_local: e.target.value
							}),
							placeholder: "Title (Bangla)"
						}),
						/* @__PURE__ */ (0, L.jsx)(x, {
							className: "min-h-40",
							value: r.dutiesText,
							onChange: (e) => i({
								...r,
								dutiesText: e.target.value
							}),
							placeholder: "Duties — one a line, e.g.\nMake the beds\nEmpty the bins\nClean the bathroom"
						}),
						/* @__PURE__ */ (0, L.jsx)(_, {
							value: r.skills ?? "",
							onChange: (e) => i({
								...r,
								skills: e.target.value
							}),
							placeholder: "Skills needed"
						}),
						/* @__PURE__ */ (0, L.jsx)(h, {
							onClick: () => void l(),
							children: "Save"
						})
					]
				})
			})
		]
	});
}
function ae(e) {
	let t = e.D.settings, [n, r] = (0, S.useState)({
		lat: t.geo.lat ?? "",
		lng: t.geo.lng ?? "",
		radius: t.geo.radius ?? 200,
		code: t.geo.code ?? "",
		faceMax: t.faceMax,
		annualDays: t.annualDays,
		otRate: t.otRate
	}), [i, a] = (0, S.useState)(""), o = async () => {
		try {
			e.setD({
				...e.D,
				...await e.api("PUT", "/api/hr/settings", {
					site: e.siteId,
					geo: {
						lat: n.lat,
						lng: n.lng,
						radius: n.radius,
						code: n.code
					},
					faceMax: n.faceMax,
					annualDays: n.annualDays,
					otRate: n.otRate
				})
			}), a("Saved.");
		} catch (e) {
			a(e.message);
		}
	};
	return /* @__PURE__ */ (0, L.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, L.jsxs)(g, {
			className: "content-start gap-3 p-4",
			children: [
				/* @__PURE__ */ (0, L.jsx)("h2", {
					className: "font-bold",
					children: "📍 Workplace circle (geofence)"
				}),
				/* @__PURE__ */ (0, L.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Check-in works only within this distance of the point. Phones' GPS is usually right to 5–20 m outdoors, worse indoors — 200 m is a safe circle for a building."
				}),
				/* @__PURE__ */ (0, L.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [
						/* @__PURE__ */ (0, L.jsxs)("label", {
							className: "grid gap-1 text-xs font-semibold",
							children: ["Latitude", /* @__PURE__ */ (0, L.jsx)(_, {
								value: n.lat,
								onChange: (e) => r({
									...n,
									lat: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, L.jsxs)("label", {
							className: "grid gap-1 text-xs font-semibold",
							children: ["Longitude", /* @__PURE__ */ (0, L.jsx)(_, {
								value: n.lng,
								onChange: (e) => r({
									...n,
									lng: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, L.jsxs)("label", {
							className: "grid gap-1 text-xs font-semibold",
							children: ["Radius (m)", /* @__PURE__ */ (0, L.jsx)(_, {
								type: "number",
								value: n.radius,
								onChange: (e) => r({
									...n,
									radius: Number(e.target.value)
								})
							})]
						}),
						/* @__PURE__ */ (0, L.jsxs)("label", {
							className: "grid gap-1 text-xs font-semibold",
							children: ["Plus code / note", /* @__PURE__ */ (0, L.jsx)(_, {
								value: n.code,
								onChange: (e) => r({
									...n,
									code: e.target.value
								})
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, L.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, L.jsx)(h, {
						variant: "outline",
						onClick: () => navigator.geolocation.getCurrentPosition((e) => r((t) => ({
							...t,
							lat: Number(e.coords.latitude.toFixed(6)),
							lng: Number(e.coords.longitude.toFixed(6))
						})), (e) => a(e.message), { enableHighAccuracy: !0 }),
						children: "📍 Use where I am now"
					}), n.lat && n.lng && /* @__PURE__ */ (0, L.jsx)("a", {
						className: "text-sm text-primary underline",
						href: `https://www.google.com/maps?q=${n.lat},${n.lng}`,
						target: "_blank",
						rel: "noopener",
						children: "Check on the map ↗"
					})]
				}),
				/* @__PURE__ */ (0, L.jsx)("h2", {
					className: "mt-2 font-bold",
					children: "Rules"
				}),
				/* @__PURE__ */ (0, L.jsxs)("label", {
					className: "grid gap-1 text-xs font-semibold",
					children: ["Face match strictness (lower = stricter; 0.5 is standard)", /* @__PURE__ */ (0, L.jsx)(_, {
						type: "number",
						step: .01,
						min: .35,
						max: .65,
						value: n.faceMax,
						onChange: (e) => r({
							...n,
							faceMax: Number(e.target.value)
						})
					})]
				}),
				/* @__PURE__ */ (0, L.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, L.jsxs)("label", {
						className: "grid gap-1 text-xs font-semibold",
						children: ["Annual leave days a year", /* @__PURE__ */ (0, L.jsx)(_, {
							type: "number",
							value: n.annualDays,
							onChange: (e) => r({
								...n,
								annualDays: Number(e.target.value)
							})
						})]
					}), /* @__PURE__ */ (0, L.jsxs)("label", {
						className: "grid gap-1 text-xs font-semibold",
						children: ["Overtime pay rate (× hourly)", /* @__PURE__ */ (0, L.jsx)(_, {
							type: "number",
							step: .25,
							value: n.otRate,
							onChange: (e) => r({
								...n,
								otRate: Number(e.target.value)
							})
						})]
					})]
				}),
				/* @__PURE__ */ (0, L.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Saudi Labour Law: at least 21 days' annual leave (30 after 5 years), overtime paid at the hourly wage plus 50% (×1.5), normally up to 8 hours a day / 48 a week."
				}),
				e.can && /* @__PURE__ */ (0, L.jsx)(h, {
					onClick: () => void o(),
					children: "Save settings"
				}),
				/* @__PURE__ */ (0, L.jsx)("span", {
					className: "text-sm text-muted-foreground",
					children: i
				})
			]
		}), /* @__PURE__ */ (0, L.jsxs)(g, {
			className: "content-start gap-3 p-4",
			children: [
				/* @__PURE__ */ (0, L.jsx)("h2", {
					className: "font-bold",
					children: "📱 The check-in page"
				}),
				/* @__PURE__ */ (0, L.jsx)($, {
					siteId: e.siteId,
					big: !0
				}),
				/* @__PURE__ */ (0, L.jsxs)("ol", {
					className: "list-decimal space-y-1 pl-5 text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, L.jsxs)("li", { children: [
							"Add each person on Staff, take their photo and ",
							/* @__PURE__ */ (0, L.jsx)("b", { children: "Enroll face" }),
							" (in person, good light)."
						] }),
						/* @__PURE__ */ (0, L.jsxs)("li", { children: [
							"Press ",
							/* @__PURE__ */ (0, L.jsx)("b", { children: "Give PIN" }),
							" and print their card."
						] }),
						/* @__PURE__ */ (0, L.jsx)("li", { children: "Put the QR poster at the staff entrance. They open it on their own phone (or a phone at the gate), type the PIN, look and blink." }),
						/* @__PURE__ */ (0, L.jsx)("li", { children: "Refused attempts (wrong face, no blink, outside the circle) are kept with the selfie on Attendance." })
					]
				}),
				/* @__PURE__ */ (0, L.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Faces and selfies are personal data: tell staff what is taken and why (attendance only), keep it to that, and remove people when they leave."
				})
			]
		})]
	});
}
function $({ siteId: e, big: t }) {
	let n = new URL(`hr/?site=${e}`, location.href.split("#")[0]).href, [r, i] = (0, S.useState)("");
	return (0, S.useEffect)(() => {
		if (!t) return;
		let e = () => {
			let e = window.qrcode(0, "M");
			e.addData(n), e.make(), i(e.createSvgTag({
				cellSize: 6,
				margin: 2
			}));
		};
		if (window.qrcode) e();
		else {
			let t = document.createElement("script");
			t.src = "https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js", t.onload = e, document.head.appendChild(t);
		}
	}, [t, n]), t ? /* @__PURE__ */ (0, L.jsxs)("div", {
		className: "grid justify-items-start gap-2",
		children: [
			/* @__PURE__ */ (0, L.jsx)("a", {
				className: "break-all text-sm text-primary underline",
				href: n,
				target: "_blank",
				rel: "noopener",
				children: n
			}),
			/* @__PURE__ */ (0, L.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, L.jsx)(h, {
					size: "sm",
					variant: "outline",
					onClick: () => void navigator.clipboard.writeText(n),
					children: "Copy link"
				}), r && /* @__PURE__ */ (0, L.jsx)(h, {
					size: "sm",
					variant: "outline",
					onClick: () => {
						let e = window.open("", "_blank");
						e && (e.document.write(`<html><body style="font-family:system-ui;text-align:center;padding:40px"><h1 style="font-size:48px;margin:0">হাজিরা · Attendance</h1><p style="font-size:24px">ফোনের ক্যামেরা দিয়ে স্ক্যান করুন<br>Scan with your phone camera</p><div style="display:inline-block;transform:scale(1.6);margin:60px">${r}</div><p style="font-size:22px">১. আপনার নম্বর দিন · Type your number<br>২. ক্যামেরার দিকে তাকান, পলক ফেলুন · Look and blink<br>৩. কাজের তালিকা দেখুন · See your tasks</p><p style="font-size:14px;color:#555">${n}</p><script>setTimeout(()=>print(),400)<\/script></body></html>`), e.document.close());
					},
					children: "🖨 Print QR poster"
				})]
			}),
			r && /* @__PURE__ */ (0, L.jsx)("div", {
				className: "rounded-xl bg-white p-2",
				dangerouslySetInnerHTML: { __html: r }
			})
		]
	}) : /* @__PURE__ */ (0, L.jsx)("a", {
		className: "rounded-lg border bg-card px-3 py-2 text-sm font-semibold hover:border-gold",
		href: n,
		target: "_blank",
		rel: "noopener",
		children: "📱 Staff check-in page ↗"
	});
}
export { W as default };
