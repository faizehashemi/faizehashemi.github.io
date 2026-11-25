import { a as e, c as t, d as n, f as r, h as i, i as a, n as ee, o as te, p as o, s as ne } from "./PmsContext-BVMd13Oi.js";
import { t as s } from "./checkbox-C3tIiLfF.js";
import { i as re, r as ie, t as ae } from "./tabs-IQDmk0rj.js";
import { t as c } from "./label-CMEyi--P.js";
import { t as oe } from "./slider-Db2mTvMK.js";
import { t as se } from "./switch-zmjMQiva.js";
import { t as l } from "./createLucideIcon-CQUC5AEZ.js";
import { t as u } from "./x-Dis6Osjy.js";
import { t as d } from "./button-BGWa3SLr.js";
import { i as ce, n as le, r as ue, t as de } from "./card-B9_OGomP.js";
import { t as f } from "./input-DSBk_UeU.js";
import { t as p } from "./utils-b7UP9Cmo.js";
import { t as fe } from "./ConfirmDialog-GfriOiUy.js";
import { t as pe } from "./usePrefs-CeGrJo8w.js";
import { t as me } from "./PageHeader-DKvzTuZm.js";
// node_modules/lucide-react/dist/esm/icons/arrow-down.mjs
var m = {
	name: "arrow-down",
	size: 24,
	node: [["path", {
		d: "M12 5v14",
		key: "s699le"
	}], ["path", {
		d: "m19 12-7 7-7-7",
		key: "1idqje"
	}]]
};
m.node;
var he = l(m), h = {
	name: "arrow-up",
	size: 24,
	node: [["path", {
		d: "m5 12 7-7 7 7",
		key: "hav0vg"
	}], ["path", {
		d: "M12 19V5",
		key: "x0mq9r"
	}]]
};
h.node;
var ge = l(h), g = /* @__PURE__ */ i(o(), 1), _ = r(), _e = /* @__PURE__ */ new Set([
	"D",
	"E",
	"F"
]), ve = [
	["account", "Account"],
	["look", "Appearance"],
	["menus", "Menus & shortcuts"],
	["pages", "Pages"],
	["data", "Data & backup"]
], v = {
	password: "account",
	look: "look",
	layout: "look",
	menu: "menus",
	quick: "menus",
	keys: "menus",
	start: "pages",
	slip: "pages",
	checkins: "pages",
	data: "data",
	backup: "data"
}, ye = /* @__PURE__ */ new Set([
	"home",
	"login",
	"blank"
]), y = "h-9 rounded-md border bg-background px-2 text-sm";
function b({ title: e, hint: t, children: n }) {
	return /* @__PURE__ */ (0, _.jsxs)("div", {
		className: "flex flex-wrap items-center justify-between gap-3 border-b py-2.5 last:border-0",
		children: [/* @__PURE__ */ (0, _.jsxs)("div", {
			className: "grid max-w-xl gap-0.5",
			children: [/* @__PURE__ */ (0, _.jsx)("b", {
				className: "text-sm",
				children: e
			}), t && /* @__PURE__ */ (0, _.jsx)("span", {
				className: "text-xs text-muted-foreground",
				children: t
			})]
		}), n && /* @__PURE__ */ (0, _.jsx)("div", {
			className: "flex max-w-full flex-wrap items-center gap-2",
			children: n
		})]
	});
}
function x({ value: e, list: t, onChange: n }) {
	return /* @__PURE__ */ (0, _.jsx)("div", {
		className: "inline-flex max-w-full flex-wrap overflow-hidden rounded-md border",
		children: t.map(([t, r]) => /* @__PURE__ */ (0, _.jsx)("button", {
			type: "button",
			"aria-pressed": e === t,
			className: p("px-3 py-1.5 text-sm", e === t ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent"),
			onClick: () => n(t),
			children: r
		}, t))
	});
}
function S() {
	let { cloud: r, prefs: i, rooms: o } = ee(), l = a(), m = t(), h = n(), S = te(), be = e(), { navigate: xe } = ne(), { prefs: C, setPrefs: w } = pe(), { ask: T, dialog: Se } = fe(), E = r.currentDesk(), [D, O] = (0, g.useState)(""), [k, Ce] = (0, g.useState)(null), [A, we] = (0, g.useState)(null), [j, Te] = (0, g.useState)([]), [M, Ee] = (0, g.useState)(null), [De, N] = (0, g.useState)(""), [P, F] = (0, g.useState)(null), [I, Oe] = (0, g.useState)(null), [ke, Ae] = (0, g.useState)(""), [L, R] = (0, g.useState)({
		cur: "",
		n1: "",
		n2: "",
		show: !1
	}), [je, z] = (0, g.useState)(null), [Me, Ne] = (0, g.useState)(!1), Pe = (0, g.useRef)(void 0), Fe = (0, g.useRef)({}), [Ie, Le] = (0, g.useState)("password"), [B, Re] = (0, g.useState)("account"), ze = (0, g.useRef)(null), Be = (0, g.useRef)(null), V = (e) => {
		O(e), clearTimeout(Pe.current), Pe.current = setTimeout(() => O(""), 1600);
	}, H = (e, t = "Saved") => {
		w(e), V(t);
	};
	(0, g.useEffect)(() => {
		(async () => {
			let [e, t, n] = await Promise.all([
				be("config.js"),
				S("menu"),
				S("checkins-cols")
			]);
			Ce({
				SITES: e.SITES,
				NAV: e.NAV
			}), we({
				nav: t,
				cols: n.CHECKINS_COLS
			});
			try {
				let t = await l(o.loadBuildings());
				Te([...new Set(Object.keys(e.SITES).flatMap((e) => o.buildingNames(t, e)))]);
			} catch {}
		})();
		let e = (e) => Ee({ ok: !!e.detail?.ok });
		return window.addEventListener("pms:prefs-saved", e), () => window.removeEventListener("pms:prefs-saved", e);
	}, []);
	let Ve = m.get("section");
	(0, g.useEffect)(() => {
		k && Ve && requestAnimationFrame(() => He(Ve, !1));
	}, [k]);
	function He(e, t = !0) {
		if (v[e] && v[e] !== B) {
			Re(v[e]), Le(e), setTimeout(() => He(e, !1), 60);
			return;
		}
		let n = Fe.current[e];
		n && (Le(e), n.scrollIntoView({
			behavior: t && !C.reduceMotion ? "smooth" : "auto",
			block: "start"
		}), e === "password" && setTimeout(() => document.getElementById("pwCur")?.focus({ preventScroll: !0 }), 300));
	}
	let U = (0, g.useMemo)(() => h.filter((e) => (!e.hidden || e.id === "home") && e.id !== "login" && r.canOpen(e.id, E)), [h]), W = (e) => h.find((t) => t.id === e)?.label || e;
	if (!k || !A) return /* @__PURE__ */ (0, _.jsx)("div", {
		className: "mx-auto max-w-[2400px] p-4 text-sm text-muted-foreground",
		children: "Loading…"
	});
	let { SITES: Ue, NAV: We } = k, G = (e) => /* @__PURE__ */ (0, _.jsx)(se, {
		checked: !!C[e],
		onCheckedChange: (t) => H({ [e]: t })
	}), K = () => A.nav.menuFor().map((e) => ({
		label: e.label,
		views: [...e.views]
	})), Ge = (e) => {
		let t = new Set(e.flatMap((e) => e.views));
		return h.filter((e) => !e.hidden && !ye.has(e.id) && !t.has(e.id)).map((e) => e.id);
	}, Ke = (e, t = "Menu saved") => H({
		navMenu: e.map((e) => ({
			label: e.label,
			views: e.views
		})),
		navHidden: Ge(e)
	}, t), q = K(), qe = Ge(q), J = (e) => {
		let t = K(), n = e(t);
		Ke(t, n);
	}, Y = (e, t, n) => {
		[e[t], e[n]] = [e[n], e[t]];
	}, X = (C.quickLinks || []).filter((e) => U.some((t) => t.id === e)), Je = {};
	for (let [e, t] of Object.entries(C.shortcuts || {})) t && (Je[t.toUpperCase()] ||= []).push(e);
	function Ye(e, t) {
		if (e.key === "Tab") return;
		e.preventDefault(), e.stopPropagation();
		let n = null;
		if (e.key === "Backspace" || e.key === "Delete") n = "";
		else {
			let t = (/^Digit(\d)$/.exec(e.code)?.[1] ?? /^Key([A-Z])$/.exec(e.code)?.[1] ?? "").toUpperCase();
			t && (n = t);
		}
		if (n === null) {
			N("Use a letter (A–Z) or a digit (0–9).");
			return;
		}
		let r = { [t]: n }, a = "";
		if (n) {
			let e = Object.entries(C.shortcuts || {}).find(([e, r]) => e !== t && (r || "").toUpperCase() === n);
			e && (r[e[0]] = "", a = `${W(e[0])} no longer has a shortcut (it had ${n}). `), _e.has(n) && C.shortcutMod === "alt" && (a += `Alt+${n} also opens a browser menu in some browsers.`);
		}
		w({ shortcuts: r }), N(a), V(n ? `${i.modLabel()} + ${n} opens ${W(t)}` : "Shortcut removed");
	}
	let Z = ((e) => {
		let t = 0;
		return e.length >= 8 && t++, e.length >= 12 && t++, /[a-z]/.test(e) && /[A-Z]/.test(e) && t++, /\d/.test(e) && t++, (/[^\w\s]/.test(e) || /\s/.test(e.trim())) && t++, e.length < 8 ? 0 : Math.min(4, t);
	})(L.n1);
	async function Xe(e) {
		e.preventDefault();
		let t = (e) => z({
			t: e,
			ok: !1
		});
		if (L.n1.length < 8) return t("The new password needs at least 8 characters.");
		if (L.n1 !== L.n2) return t("The two new passwords are not the same.");
		if (L.n1 === L.cur) return t("The new password is the same as the current one.");
		Ne(!0), z({
			t: "Changing…",
			ok: !0
		});
		try {
			await l(r.request("POST", "/api/me/password", {
				current: L.cur,
				password: L.n1
			})), R({
				cur: "",
				n1: "",
				n2: "",
				show: !1
			}), z({
				t: "Password changed. Other computers using this desk must log in again with the new password.",
				ok: !0
			}), V("Password changed");
		} catch (e) {
			t(e?.status === 404 ? "The server does not support this yet — ask the admin to update the PMS Worker." : e instanceof r.UserError ? e.message : "Could not change the password. Check the connection and try again.");
		} finally {
			Ne(!1);
		}
	}
	let Q = (e, t) => {
		let n = document.createElement("a");
		n.href = URL.createObjectURL(new Blob([t], { type: "application/json" })), n.download = e, n.click(), setTimeout(() => URL.revokeObjectURL(n.href), 2e3);
	}, Ze = C.slipDefaultBuilding && !j.includes(C.slipDefaultBuilding) ? [...j, C.slipDefaultBuilding] : j, $ = (e, t, n) => v[e] === B ? /* @__PURE__ */ (0, _.jsx)("section", {
		ref: (t) => {
			Fe.current[e] = t;
		},
		className: "scroll-mt-20",
		children: /* @__PURE__ */ (0, _.jsxs)(de, { children: [/* @__PURE__ */ (0, _.jsx)(ue, { children: /* @__PURE__ */ (0, _.jsx)(ce, { children: t }) }), /* @__PURE__ */ (0, _.jsx)(le, { children: n })] })
	}, e) : null;
	return /* @__PURE__ */ (0, _.jsxs)("div", {
		className: "mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4",
		children: [
			/* @__PURE__ */ (0, _.jsx)(me, {
				view: "settings",
				parent: "",
				title: "Settings",
				current: ve.find((e) => e[0] === B)?.[1]
			}),
			/* @__PURE__ */ (0, _.jsxs)("p", {
				className: "-mt-1 text-sm text-muted-foreground",
				children: [
					"Changes apply at once and are saved ",
					/* @__PURE__ */ (0, _.jsx)("b", { children: "with your login" }),
					", so you get the same settings on any computer or phone you log in on. Other logins are not affected.",
					" ",
					M && /* @__PURE__ */ (0, _.jsx)("span", {
						className: M.ok ? "text-ok" : "text-destructive",
						children: M.ok ? "✓ Saved to your login." : "Not saved to the server yet (offline?) — kept on this device and sent when the connection is back."
					})
				]
			}),
			/* @__PURE__ */ (0, _.jsx)(ae, {
				value: B,
				onValueChange: (e) => {
					Re(e), window.scrollTo(0, 0);
				},
				children: /* @__PURE__ */ (0, _.jsx)(ie, {
					variant: "underline",
					children: ve.map(([e, t]) => /* @__PURE__ */ (0, _.jsx)(re, {
						value: e,
						children: t
					}, e))
				})
			}),
			/* @__PURE__ */ (0, _.jsx)("div", {
				className: "grid items-start gap-4",
				children: /* @__PURE__ */ (0, _.jsxs)("div", {
					className: "grid min-w-0 gap-3",
					children: [
						$("password", "Change password", /* @__PURE__ */ (0, _.jsxs)(_.Fragment, { children: [
							/* @__PURE__ */ (0, _.jsx)("p", {
								className: "mb-2 text-xs text-muted-foreground",
								children: E ? `Desk login: ${E.name} (${Ue[E.site]?.label || E.site}, ${E.role})` : ""
							}),
							/* @__PURE__ */ (0, _.jsxs)("form", {
								className: "grid max-w-md gap-3",
								autoComplete: "on",
								onSubmit: (e) => void Xe(e),
								children: [
									/* @__PURE__ */ (0, _.jsx)("input", {
										type: "text",
										name: "username",
										autoComplete: "username",
										hidden: !0,
										readOnly: !0,
										value: E?.name || ""
									}),
									/* @__PURE__ */ (0, _.jsxs)("div", {
										className: "grid gap-1",
										children: [/* @__PURE__ */ (0, _.jsx)(c, {
											htmlFor: "pwCur",
											children: "Current password"
										}), /* @__PURE__ */ (0, _.jsx)(f, {
											id: "pwCur",
											type: L.show ? "text" : "password",
											autoComplete: "current-password",
											required: !0,
											value: L.cur,
											onChange: (e) => R((t) => ({
												...t,
												cur: e.target.value
											}))
										})]
									}),
									/* @__PURE__ */ (0, _.jsxs)("div", {
										className: "grid gap-1",
										children: [/* @__PURE__ */ (0, _.jsx)(c, { children: "New password" }), /* @__PURE__ */ (0, _.jsx)(f, {
											type: L.show ? "text" : "password",
											autoComplete: "new-password",
											minLength: 8,
											required: !0,
											value: L.n1,
											onChange: (e) => R((t) => ({
												...t,
												n1: e.target.value
											}))
										})]
									}),
									/* @__PURE__ */ (0, _.jsxs)("div", {
										className: "grid gap-1",
										children: [/* @__PURE__ */ (0, _.jsx)(c, { children: "New password again" }), /* @__PURE__ */ (0, _.jsx)(f, {
											type: L.show ? "text" : "password",
											autoComplete: "new-password",
											minLength: 8,
											required: !0,
											value: L.n2,
											onChange: (e) => R((t) => ({
												...t,
												n2: e.target.value
											}))
										})]
									}),
									/* @__PURE__ */ (0, _.jsxs)("label", {
										className: "flex items-center gap-2 text-sm",
										children: [/* @__PURE__ */ (0, _.jsx)(s, {
											checked: L.show,
											onCheckedChange: (e) => R((t) => ({
												...t,
												show: e === !0
											}))
										}), " Show passwords"]
									}),
									/* @__PURE__ */ (0, _.jsxs)("div", {
										"aria-live": "polite",
										className: "grid gap-1",
										children: [/* @__PURE__ */ (0, _.jsx)("i", {
											className: "block h-1.5 rounded transition-all",
											style: {
												width: `${L.n1 ? [
													4,
													30,
													55,
													80,
													100
												][Z] : 0}%`,
												background: [
													"#c0392b",
													"#d35400",
													"#d4a017",
													"#6aa84f",
													"#2f7d32"
												][Z]
											}
										}), /* @__PURE__ */ (0, _.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: L.n1.length < 8 ? L.n1 ? "At least 8 characters." : "At least 8 characters. Longer is stronger; mix words, digits and signs." : [
												"Too short",
												"Weak — make it longer",
												"Fair",
												"Good",
												"Strong"
											][Z]
										})]
									}),
									/* @__PURE__ */ (0, _.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, _.jsx)(d, {
											type: "submit",
											disabled: Me,
											children: "Change password"
										}), /* @__PURE__ */ (0, _.jsx)("span", {
											role: "status",
											className: p("text-sm", je?.ok ? "text-ok" : "text-destructive"),
											children: je?.t
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, _.jsxs)("p", {
								className: "mt-3 text-xs text-muted-foreground",
								children: [
									"Every other computer logged in as this desk is logged out; this one stays logged in. Forgot it? The admin can set a new one on ",
									/* @__PURE__ */ (0, _.jsx)("a", {
										className: "text-primary underline",
										href: "#",
										onClick: (e) => {
											e.preventDefault(), xe("setup");
										},
										children: "Setup"
									}),
									"."
								]
							})
						] })),
						$("look", "Appearance", /* @__PURE__ */ (0, _.jsxs)(_.Fragment, { children: [
							/* @__PURE__ */ (0, _.jsxs)(b, {
								title: "Text and page size",
								hint: "Makes everything bigger or smaller (menus, pages, dialogs).",
								children: [
									/* @__PURE__ */ (0, _.jsx)(d, {
										variant: "outline",
										size: "sm",
										"aria-label": "Smaller",
										onClick: () => H({ textScale: Math.max(75, C.textScale - 5) }),
										children: "A−"
									}),
									/* @__PURE__ */ (0, _.jsx)(oe, {
										className: "w-40",
										min: 75,
										max: 150,
										step: 5,
										value: [C.textScale],
										"aria-label": "Text size",
										onValueChange: (e) => w({ textScale: e[0] }),
										onValueCommit: () => V("Saved")
									}),
									/* @__PURE__ */ (0, _.jsx)(d, {
										variant: "outline",
										size: "sm",
										"aria-label": "Bigger",
										onClick: () => H({ textScale: Math.min(150, C.textScale + 5) }),
										children: "A+"
									}),
									/* @__PURE__ */ (0, _.jsxs)("output", {
										className: "w-12 text-sm",
										children: [C.textScale, "%"]
									})
								]
							}),
							/* @__PURE__ */ (0, _.jsx)(b, {
								title: "Spacing in tables and forms",
								hint: "Compact fits more rows on a laptop screen.",
								children: /* @__PURE__ */ (0, _.jsx)(x, {
									value: C.density,
									list: [
										["compact", "Compact"],
										["normal", "Normal"],
										["comfortable", "Roomy"]
									],
									onChange: (e) => H({ density: e })
								})
							}),
							/* @__PURE__ */ (0, _.jsx)(b, {
								title: "Colours",
								hint: "Night mode is easier on the eyes in the dark; high contrast darkens faint text and borders. Printing is always normal.",
								children: /* @__PURE__ */ (0, _.jsx)(x, {
									value: C.theme,
									list: [
										["light", "Normal"],
										["dark", "Night"],
										["contrast", "High contrast"]
									],
									onChange: (e) => H({ theme: e })
								})
							}),
							/* @__PURE__ */ (0, _.jsx)(b, {
								title: "Reduce motion",
								hint: "No sliding menus or animations.",
								children: G("reduceMotion")
							})
						] })),
						$("layout", "Menu & layout", /* @__PURE__ */ (0, _.jsxs)(_.Fragment, { children: [
							/* @__PURE__ */ (0, _.jsx)(b, {
								title: "Keep the menu bar at the top while scrolling",
								children: G("stickyNav")
							}),
							/* @__PURE__ */ (0, _.jsx)(b, {
								title: "Show shortcut keys in the menus",
								hint: "e.g. “Alt 1” next to Slip.",
								children: G("showKeyHints")
							}),
							/* @__PURE__ */ (0, _.jsx)(b, {
								title: "Show sync time next to the green dot",
								hint: "Hover the dot to see it anyway.",
								children: G("showSyncText")
							}),
							/* @__PURE__ */ (0, _.jsx)(b, {
								title: "Show the support footer",
								children: G("showFooter")
							}),
							/* @__PURE__ */ (0, _.jsx)(b, {
								title: "Tables as cards on phones",
								hint: "Off: tables keep their columns and scroll sideways. Takes effect when you open a page.",
								children: G("phoneCards")
							})
						] })),
						$("menu", "Menu builder", /* @__PURE__ */ (0, _.jsxs)("div", {
							className: "grid gap-3",
							children: [
								/* @__PURE__ */ (0, _.jsx)(b, {
									title: "Menu position",
									hint: "On laptops. Phones always open the menu from ☰.",
									children: /* @__PURE__ */ (0, _.jsx)(x, {
										value: C.navLayout,
										list: [["top", "Top (legacy)"], ["side", "Left side"]],
										onChange: (e) => H({ navLayout: e })
									})
								}),
								/* @__PURE__ */ (0, _.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "Your own groups and pages — rename, reorder, move pages between groups, or take pages out of the menu. Groups hold pages; pages cannot hold more pages. Saved to your login on every device. Ctrl+K finds any page, even one not in the menu."
								}),
								/* @__PURE__ */ (0, _.jsx)("div", {
									className: "grid gap-2",
									children: q.map((e, t) => /* @__PURE__ */ (0, _.jsxs)("div", {
										className: "grid gap-1.5 rounded-xl border p-2",
										children: [/* @__PURE__ */ (0, _.jsxs)("div", {
											className: "flex items-center gap-1.5",
											children: [
												/* @__PURE__ */ (0, _.jsx)(f, {
													className: "h-8",
													maxLength: 40,
													"aria-label": "Group name",
													defaultValue: e.label,
													onBlur: (n) => {
														n.target.value.trim() !== e.label && J((e) => (e[t].label = n.target.value.trim() || "Untitled", "Group renamed"));
													}
												}, e.label),
												/* @__PURE__ */ (0, _.jsx)(d, {
													size: "icon",
													variant: "outline",
													className: "size-8",
													"aria-label": "Move group up",
													disabled: t === 0,
													onClick: () => J((e) => (Y(e, t, t - 1), "Order saved")),
													children: /* @__PURE__ */ (0, _.jsx)(ge, { className: "size-4" })
												}),
												/* @__PURE__ */ (0, _.jsx)(d, {
													size: "icon",
													variant: "outline",
													className: "size-8",
													"aria-label": "Move group down",
													disabled: t === q.length - 1,
													onClick: () => J((e) => (Y(e, t, t + 1), "Order saved")),
													children: /* @__PURE__ */ (0, _.jsx)(he, { className: "size-4" })
												}),
												/* @__PURE__ */ (0, _.jsx)(d, {
													size: "icon",
													variant: "outline",
													className: "size-8 text-destructive",
													"aria-label": `Delete group ${e.label}`,
													title: "Delete the group (its pages go to “Not in the menu”)",
													onClick: async () => {
														await T({
															title: `Delete the group “${e.label}”?`,
															body: "Its pages go to “Not in the menu”.",
															confirmLabel: "Delete"
														}) && J((e) => (e.splice(t, 1), "Group deleted"));
													},
													children: /* @__PURE__ */ (0, _.jsx)(u, { className: "size-4" })
												})
											]
										}), /* @__PURE__ */ (0, _.jsxs)("ul", {
											className: "grid gap-1",
											children: [e.views.map((n, i) => /* @__PURE__ */ (0, _.jsxs)("li", {
												className: "flex flex-wrap items-center gap-1.5 text-sm",
												children: [
													/* @__PURE__ */ (0, _.jsxs)("span", {
														className: "grow",
														children: [W(n), r.canOpen(n, E) ? "" : /* @__PURE__ */ (0, _.jsx)("small", {
															className: "text-muted-foreground",
															children: " (no access)"
														})]
													}),
													/* @__PURE__ */ (0, _.jsx)(d, {
														size: "icon",
														variant: "outline",
														className: "size-7",
														"aria-label": "Up",
														disabled: i === 0,
														onClick: () => J((e) => (Y(e[t].views, i, i - 1), "Order saved")),
														children: /* @__PURE__ */ (0, _.jsx)(ge, { className: "size-3.5" })
													}),
													/* @__PURE__ */ (0, _.jsx)(d, {
														size: "icon",
														variant: "outline",
														className: "size-7",
														"aria-label": "Down",
														disabled: i === e.views.length - 1,
														onClick: () => J((e) => (Y(e[t].views, i, i + 1), "Order saved")),
														children: /* @__PURE__ */ (0, _.jsx)(he, { className: "size-3.5" })
													}),
													/* @__PURE__ */ (0, _.jsx)("select", {
														className: p(y, "h-7 py-0"),
														"aria-label": `Move ${W(n)} to`,
														value: t,
														onChange: (e) => J((n) => {
															let r = Number(e.target.value), [a] = n[t].views.splice(i, 1);
															return n[r].views.push(a), `Moved to ${n[r].label}`;
														}),
														children: q.map((e, t) => /* @__PURE__ */ (0, _.jsx)("option", {
															value: t,
															children: e.label
														}, t))
													}),
													/* @__PURE__ */ (0, _.jsx)(d, {
														size: "icon",
														variant: "outline",
														className: "size-7",
														"aria-label": `Take ${W(n)} out of the menu`,
														onClick: () => J((e) => (e[t].views.splice(i, 1), "Taken out of the menu")),
														children: /* @__PURE__ */ (0, _.jsx)(u, { className: "size-3.5" })
													})
												]
											}, n)), !e.views.length && /* @__PURE__ */ (0, _.jsx)("li", {
												className: "text-xs text-muted-foreground",
												children: "No pages — move some here, or delete the group."
											})]
										})]
									}, t))
								}),
								/* @__PURE__ */ (0, _.jsxs)("div", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, _.jsx)(f, {
										className: "max-w-xs",
										maxLength: 40,
										placeholder: "New group name, e.g. My pages",
										value: ke,
										onChange: (e) => Ae(e.target.value),
										onKeyDown: (e) => {
											e.key === "Enter" && (e.preventDefault(), document.getElementById("mbAdd")?.click());
										}
									}), /* @__PURE__ */ (0, _.jsx)(d, {
										id: "mbAdd",
										variant: "outline",
										onClick: () => {
											let e = ke.trim();
											e && (Ae(""), J((t) => (t.push({
												label: e,
												views: []
											}), `Group “${e}” added — move pages into it`)));
										},
										children: "➕ Add group"
									})]
								}),
								/* @__PURE__ */ (0, _.jsxs)("div", { children: [/* @__PURE__ */ (0, _.jsx)("h3", {
									className: "mb-1 text-sm font-bold",
									children: "Not in the menu"
								}), /* @__PURE__ */ (0, _.jsx)("div", {
									className: "flex flex-wrap gap-2",
									children: qe.length ? qe.map((e) => /* @__PURE__ */ (0, _.jsxs)("span", {
										className: "inline-flex items-center gap-1.5 rounded-full border bg-accent/40 px-3 py-1 text-sm",
										children: [W(e), /* @__PURE__ */ (0, _.jsxs)("select", {
											className: p(y, "h-7 py-0"),
											"aria-label": `Add ${W(e)} to a group`,
											value: "",
											onChange: (t) => {
												t.target.value !== "" && J((n) => (n[Number(t.target.value)].views.push(e), `Added to ${n[Number(t.target.value)].label}`));
											},
											children: [/* @__PURE__ */ (0, _.jsx)("option", {
												value: "",
												children: "Add to…"
											}), q.map((e, t) => /* @__PURE__ */ (0, _.jsx)("option", {
												value: t,
												children: e.label
											}, t))]
										})]
									}, e)) : /* @__PURE__ */ (0, _.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "Every page is in the menu."
									})
								})] }),
								/* @__PURE__ */ (0, _.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [
										/* @__PURE__ */ (0, _.jsx)(d, {
											variant: "outline",
											onClick: async () => {
												await T({
													title: "Go back to the standard menu?",
													body: "Your groups are removed (the layout stays).",
													confirmLabel: "Reset menu"
												}) && H({
													navMenu: null,
													navHidden: []
												}, "Standard menu back");
											},
											children: "Back to the standard menu"
										}),
										/* @__PURE__ */ (0, _.jsx)(d, {
											variant: "outline",
											onClick: () => Q(`pms-menu-${(E?.name || "login").replace(/\W+/g, "-")}.json`, JSON.stringify({
												pmsMenu: 1,
												navLayout: C.navLayout,
												navMenu: C.navMenu,
												navHidden: C.navHidden
											}, null, 2)),
											children: "⬇ Export menu"
										}),
										/* @__PURE__ */ (0, _.jsx)(d, {
											variant: "outline",
											onClick: () => Be.current?.click(),
											children: "⬆ Import menu"
										}),
										/* @__PURE__ */ (0, _.jsx)("input", {
											ref: Be,
											type: "file",
											hidden: !0,
											accept: "application/json,.json",
											onChange: async (e) => {
												let t = e.target.files?.[0];
												if (e.target.value = "", t) try {
													let e = JSON.parse(await t.text());
													if (!e || e.pmsMenu !== 1 || e.navMenu !== null && !Array.isArray(e.navMenu)) throw Error("not a PMS menu file");
													let n = (e) => h.some((t) => t.id === e);
													H({
														navLayout: e.navLayout === "side" ? "side" : "top",
														navMenu: e.navMenu && e.navMenu.map((e) => ({
															label: String(e?.label || "Untitled").slice(0, 40),
															views: (Array.isArray(e?.views) ? e.views : []).filter(n)
														})),
														navHidden: Array.isArray(e.navHidden) ? e.navHidden.filter(n) : []
													}, "Menu imported"), F({
														t: "Menu imported.",
														ok: !0
													});
												} catch (e) {
													F({
														t: `Could not import: ${e.message}`,
														ok: !1
													});
												}
											}
										}),
										/* @__PURE__ */ (0, _.jsx)("span", {
											role: "status",
											className: p("text-sm", P?.ok ? "text-ok" : "text-destructive"),
											children: P?.t
										})
									]
								})
							]
						})),
						$("quick", "Quick links", /* @__PURE__ */ (0, _.jsxs)("div", {
							className: "grid gap-3",
							children: [
								/* @__PURE__ */ (0, _.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "Pick the pages you use most. They show as buttons right under the menu bar, in this order."
								}),
								/* @__PURE__ */ (0, _.jsx)("div", {
									className: "flex flex-wrap gap-2",
									children: X.length ? X.map((e, t) => /* @__PURE__ */ (0, _.jsxs)("span", {
										className: "inline-flex items-center gap-1 rounded-full border bg-accent/40 px-2 py-1 text-sm",
										children: [
											/* @__PURE__ */ (0, _.jsx)("button", {
												type: "button",
												disabled: t === 0,
												"aria-label": `Move ${W(e)} left`,
												onClick: () => {
													let e = [...X];
													Y(e, t, t - 1), H({ quickLinks: e }, "Order saved");
												},
												children: "◀"
											}),
											/* @__PURE__ */ (0, _.jsx)("b", { children: W(e) }),
											/* @__PURE__ */ (0, _.jsx)("button", {
												type: "button",
												disabled: t === X.length - 1,
												"aria-label": `Move ${W(e)} right`,
												onClick: () => {
													let e = [...X];
													Y(e, t, t + 1), H({ quickLinks: e }, "Order saved");
												},
												children: "▶"
											}),
											/* @__PURE__ */ (0, _.jsx)("button", {
												type: "button",
												"aria-label": `Remove ${W(e)}`,
												onClick: () => H({ quickLinks: X.filter((t) => t !== e) }, "Removed from quick links"),
												children: "✕"
											})
										]
									}, e)) : /* @__PURE__ */ (0, _.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "No quick links yet — tick pages below."
									})
								}),
								/* @__PURE__ */ (0, _.jsx)("div", {
									className: "grid gap-2 sm:grid-cols-2 xl:grid-cols-3",
									children: We.map((e) => ({
										label: e.label,
										views: e.views.filter((e) => U.some((t) => t.id === e))
									})).filter((e) => e.views.length).map((e) => /* @__PURE__ */ (0, _.jsxs)("fieldset", {
										className: "rounded-lg border p-2",
										children: [/* @__PURE__ */ (0, _.jsx)("legend", {
											className: "px-1 text-xs font-bold",
											children: e.label
										}), e.views.map((e) => /* @__PURE__ */ (0, _.jsxs)("label", {
											className: "flex items-center gap-2 py-0.5 text-sm",
											children: [/* @__PURE__ */ (0, _.jsx)(s, {
												checked: X.includes(e),
												onCheckedChange: (t) => {
													let n = X.filter((t) => t !== e);
													H({ quickLinks: t === !0 ? [...n, e] : n }, t === !0 ? "Added to quick links" : "Removed from quick links");
												}
											}), W(e)]
										}, e))]
									}, e.label))
								}),
								/* @__PURE__ */ (0, _.jsx)("div", { children: /* @__PURE__ */ (0, _.jsx)(d, {
									variant: "outline",
									onClick: () => {
										i.resetPrefs(["quickLinks"]), V("Quick links removed");
									},
									children: "Remove all quick links"
								}) })
							]
						})),
						$("keys", "Keyboard shortcuts", /* @__PURE__ */ (0, _.jsxs)("div", {
							className: "grid gap-3",
							children: [
								/* @__PURE__ */ (0, _.jsx)(b, {
									title: "Use shortcuts",
									hint: "They never fire while you type in a field.",
									children: G("shortcutsOn")
								}),
								/* @__PURE__ */ (0, _.jsx)(b, {
									title: "Hold",
									hint: "Pick another combination if Alt clashes with something on this computer.",
									children: /* @__PURE__ */ (0, _.jsx)(x, {
										value: C.shortcutMod,
										list: [
											["alt", "Alt"],
											["alt+shift", "Alt + Shift"],
											["ctrl+alt", "Ctrl + Alt"]
										],
										onChange: (e) => H({ shortcutMod: e })
									})
								}),
								/* @__PURE__ */ (0, _.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "Click a box and press a letter or digit. Backspace clears it."
								}),
								/* @__PURE__ */ (0, _.jsx)("div", {
									className: p("grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3", !C.shortcutsOn && "opacity-50"),
									children: U.map((e) => {
										let t = ((C.shortcuts || {})[e.id] || "").toUpperCase();
										return /* @__PURE__ */ (0, _.jsxs)("label", {
											className: p("flex items-center justify-between gap-2 rounded-lg border px-2 py-1 text-sm", t && Je[t]?.length > 1 && "border-destructive bg-destructive/10"),
											children: [/* @__PURE__ */ (0, _.jsx)("span", { children: e.id === "home" ? "Home" : e.label }), /* @__PURE__ */ (0, _.jsxs)("span", {
												className: "flex items-center gap-1",
												children: [/* @__PURE__ */ (0, _.jsxs)("kbd", {
													className: "text-xs",
													children: [i.modLabel(), " +"]
												}), /* @__PURE__ */ (0, _.jsx)(f, {
													className: "h-8 w-12 text-center uppercase",
													maxLength: 1,
													inputMode: "none",
													"aria-label": `Shortcut for ${e.label}`,
													value: t,
													onKeyDown: (t) => Ye(t, e.id),
													onChange: () => {}
												})]
											})]
										}, e.id);
									})
								}),
								/* @__PURE__ */ (0, _.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, _.jsx)(d, {
										variant: "outline",
										onClick: () => {
											i.resetPrefs([
												"shortcuts",
												"shortcutMod",
												"shortcutsOn"
											]), N(""), V("Default shortcuts back");
										},
										children: "Default shortcuts"
									}), /* @__PURE__ */ (0, _.jsx)("span", {
										className: "text-sm text-destructive",
										children: De
									})]
								})
							]
						})),
						$("start", "Start page", /* @__PURE__ */ (0, _.jsxs)(_.Fragment, { children: [/* @__PURE__ */ (0, _.jsx)(b, {
							title: "Open this page",
							hint: "When the PMS is opened without a page in the address.",
							children: /* @__PURE__ */ (0, _.jsx)("select", {
								className: y,
								value: C.startView,
								onChange: (e) => H({ startView: e.target.value }),
								children: U.map((e) => /* @__PURE__ */ (0, _.jsx)("option", {
									value: e.id,
									children: e.id === "home" ? "Home (overview)" : e.label
								}, e.id))
							})
						}), E?.role === "admin" && /* @__PURE__ */ (0, _.jsx)(b, {
							title: "Site",
							hint: "“Last used” remembers Makkah or Medina.",
							children: /* @__PURE__ */ (0, _.jsxs)("select", {
								className: y,
								value: C.startSite,
								onChange: (e) => H({ startSite: e.target.value }),
								children: [/* @__PURE__ */ (0, _.jsx)("option", {
									value: "last",
									children: "Last used"
								}), Object.values(Ue).map((e) => /* @__PURE__ */ (0, _.jsx)("option", {
									value: e.id,
									children: e.label
								}, e.id))]
							})
						})] })),
						$("slip", "Slip page", /* @__PURE__ */ (0, _.jsxs)(_.Fragment, { children: [
							/* @__PURE__ */ (0, _.jsx)(b, {
								title: "Building for a new slip",
								children: /* @__PURE__ */ (0, _.jsxs)("select", {
									className: y,
									value: C.slipDefaultBuilding || "",
									onChange: (e) => H({ slipDefaultBuilding: e.target.value }),
									children: [/* @__PURE__ */ (0, _.jsx)("option", {
										value: "",
										children: "None (choose each time)"
									}), Ze.map((e) => /* @__PURE__ */ (0, _.jsx)("option", { children: e }, e))]
								})
							}),
							/* @__PURE__ */ (0, _.jsxs)(b, {
								title: "Check-in time for a new slip",
								hint: "Empty = none.",
								children: [/* @__PURE__ */ (0, _.jsx)(f, {
									type: "time",
									className: "w-32",
									value: C.slipCheckinTime || "",
									onChange: (e) => H({ slipCheckinTime: e.target.value })
								}), /* @__PURE__ */ (0, _.jsx)("button", {
									type: "button",
									className: "text-sm text-primary underline",
									onClick: () => H({ slipCheckinTime: "" }),
									children: "clear"
								})]
							}),
							/* @__PURE__ */ (0, _.jsxs)(b, {
								title: "Check-out time for a new slip",
								children: [/* @__PURE__ */ (0, _.jsx)(f, {
									type: "time",
									className: "w-32",
									value: C.slipCheckoutTime || "",
									onChange: (e) => H({ slipCheckoutTime: e.target.value })
								}), /* @__PURE__ */ (0, _.jsx)("button", {
									type: "button",
									className: "text-sm text-primary underline",
									onClick: () => H({ slipCheckoutTime: "" }),
									children: "clear"
								})]
							}),
							/* @__PURE__ */ (0, _.jsx)(b, {
								title: "Load the slip when an SH is typed into an empty form",
								children: G("slipAutoLoadSh")
							}),
							/* @__PURE__ */ (0, _.jsx)(b, {
								title: "Pick rooms…: hide full rooms at first",
								children: G("pickerOnlyFree")
							}),
							/* @__PURE__ */ (0, _.jsx)(b, {
								title: "From / To on the slip",
								hint: "Adds “From” and “To” to every slip — where the group or self comes from and goes to (Madina Airport, Jeddah Airport, Makkah, Medina, by car, by bus, by train). Off: the fields are hidden (anything already saved is kept).",
								children: G("slipFromTo")
							}),
							/* @__PURE__ */ (0, _.jsx)(b, {
								title: "24-hour times",
								hint: "Off (default): times are shown am / pm. On: the Slip page's time fields and times use 24 hours (15:00).",
								children: G("time24")
							})
						] })),
						$("checkins", "Check-ins page", /* @__PURE__ */ (0, _.jsxs)(_.Fragment, { children: [
							/* @__PURE__ */ (0, _.jsx)(b, {
								title: "Split by from / to",
								hint: "Check-ins in two tables, from the airport and from the other city; check-outs in two, departing to the airport and to the other city. The page's own tick can still switch it.",
								children: G("checkinsSplit")
							}),
							/* @__PURE__ */ (0, _.jsx)(b, {
								title: "Columns",
								hint: "Ticked columns show. Each table always shows its own date & time (Check-in in Check-ins, Check-out in Check-outs); “the other date & time” is the check-out in Check-ins and the check-in in Check-outs. Export CSV follows the same columns."
							}),
							/* @__PURE__ */ (0, _.jsx)("div", {
								className: "grid gap-3 sm:grid-cols-2",
								children: [["checkinsHideIn", "Check-ins table"], ["checkinsHideOut", "Check-outs table"]].map(([e, t]) => /* @__PURE__ */ (0, _.jsxs)("fieldset", {
									className: "rounded-lg border p-2",
									children: [/* @__PURE__ */ (0, _.jsx)("legend", {
										className: "px-1 text-xs font-bold",
										children: t
									}), A.cols.map(([t, n]) => /* @__PURE__ */ (0, _.jsxs)("label", {
										className: "flex items-center gap-2 py-0.5 text-sm",
										children: [/* @__PURE__ */ (0, _.jsx)(s, {
											checked: !(C[e] || []).includes(t),
											onCheckedChange: (n) => {
												let r = new Set(C[e] || []);
												n === !0 ? r.delete(t) : r.add(t), H({ [e]: A.cols.map((e) => e[0]).filter((e) => r.has(e)) }, n === !0 ? "Column shown" : "Column hidden");
											}
										}), n]
									}, t))]
								}, e))
							}),
							/* @__PURE__ */ (0, _.jsx)("div", {
								className: "mt-2",
								children: /* @__PURE__ */ (0, _.jsx)(d, {
									variant: "outline",
									onClick: () => {
										i.resetPrefs(["checkinsHideIn", "checkinsHideOut"]), V("Standard columns back");
									},
									children: "Back to standard columns"
								})
							})
						] })),
						$("data", "Data & privacy", /* @__PURE__ */ (0, _.jsx)(b, {
							title: "Check for other desks' changes every",
							hint: "Pages also refresh when you open them and when the connection returns.",
							children: /* @__PURE__ */ (0, _.jsx)("select", {
								className: y,
								value: String(C.syncSeconds),
								onChange: (e) => H({ syncSeconds: Number(e.target.value) }),
								children: [
									["15", "15 seconds"],
									["30", "30 seconds"],
									["60", "1 minute"],
									["300", "5 minutes"],
									["0", "Only when I open a page"]
								].map(([e, t]) => /* @__PURE__ */ (0, _.jsx)("option", {
									value: e,
									children: t
								}, e))
							})
						})),
						$("backup", "Backup & reset", /* @__PURE__ */ (0, _.jsxs)("div", {
							className: "grid gap-3",
							children: [/* @__PURE__ */ (0, _.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Keep a copy of your settings as a file, load one back, or start over."
							}), /* @__PURE__ */ (0, _.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, _.jsx)(d, {
										variant: "outline",
										onClick: () => Q(`pms-settings-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`, i.exportPrefs()),
										children: "Download my settings"
									}),
									/* @__PURE__ */ (0, _.jsx)(d, {
										variant: "outline",
										onClick: () => ze.current?.click(),
										children: "Load settings file…"
									}),
									/* @__PURE__ */ (0, _.jsx)("input", {
										ref: ze,
										type: "file",
										hidden: !0,
										accept: ".json,application/json",
										onChange: async (e) => {
											let t = e.target.files?.[0];
											if (e.target.value = "", t) try {
												i.importPrefs(await t.text()), Oe({
													t: "Settings loaded.",
													ok: !0
												});
											} catch (e) {
												Oe({
													t: `Could not load: ${e.message}`,
													ok: !1
												});
											}
										}
									}),
									/* @__PURE__ */ (0, _.jsx)(d, {
										variant: "outline",
										className: "text-destructive",
										onClick: async () => {
											await T({
												title: "Reset everything to default?",
												body: "All your settings go back to default (on every device). Your password is not affected.",
												confirmLabel: "Reset"
											}) && (i.resetPrefs(), V("Everything back to default"));
										},
										children: "Reset everything to default"
									}),
									/* @__PURE__ */ (0, _.jsx)("span", {
										role: "status",
										className: p("text-sm", I?.ok ? "text-ok" : "text-destructive"),
										children: I?.t
									})
								]
							})]
						}))
					]
				})
			}),
			/* @__PURE__ */ (0, _.jsx)("div", {
				role: "status",
				"aria-live": "polite",
				className: p("pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-sm text-background transition-opacity", D ? "opacity-100" : "opacity-0"),
				children: D
			}),
			Se
		]
	});
}
export { S as default };
