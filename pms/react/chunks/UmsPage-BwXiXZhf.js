import { f as e, h as t, i as n, n as r, o as ee, p as i, r as te, s as ne, u as re } from "./PmsContext-BVMd13Oi.js";
import { a, i as ie, n as o, o as s, t as ae } from "./dialog-DtgtvZ4Q.js";
import { t as c } from "./checkbox-C3tIiLfF.js";
import { t as l } from "./button-BGWa3SLr.js";
import { i as u, n as d, r as f, t as p } from "./card-B9_OGomP.js";
import { t as m } from "./input-DSBk_UeU.js";
import { a as oe, n as h, o as se, r as g, s as _, t as ce } from "./table-DKR1WqRT.js";
import { t as v } from "./utils-b7UP9Cmo.js";
import { t as le } from "./ConfirmDialog-GfriOiUy.js";
import { t as y } from "./badge-EB7Muw37.js";
// src/pages/ums/ImportUndo.tsx
var b = /* @__PURE__ */ t(i(), 1), x = e(), S = (e) => e ? new Date(e).toLocaleString([], {
	day: "2-digit",
	month: "short",
	hour: "2-digit",
	minute: "2-digit"
}) : "";
function ue({ refresh: e, onDone: t }) {
	let { cloud: n } = r(), i = te(), ne = ee(), { siteId: c } = re(), [v, le] = (0, b.useState)(null), [y, ue] = (0, b.useState)([]), [C, w] = (0, b.useState)(null), [T, E] = (0, b.useState)(""), [D, O] = (0, b.useState)(!1), [k, A] = (0, b.useState)(""), [de, j] = (0, b.useState)("");
	(0, b.useEffect)(() => {
		ne("ums-undo").then(le);
	}, []), (0, b.useEffect)(() => {
		v && v.listImports(c).then(ue);
	}, [
		v,
		c,
		e
	]);
	async function fe() {
		if (C && v) {
			O(!0), j("");
			try {
				await v.confirmPassword(T);
			} catch (e) {
				j(e instanceof n.UserError ? e.message : "Could not check the password: " + (e.message || e)), O(!1);
				return;
			}
			try {
				let e = await v.replay(i, C.e, C.way);
				A(`${C.way === "undo" ? "Undone" : "Redone"}: ${e.updated} slip(s) put back${e.deleted ? `, ${e.deleted} new slip(s) deleted` : ""}${e.created ? `, ${e.created} slip(s) made again` : ""}.${e.skipped.length ? ` Not touched: ${e.skipped.join("; ")}.` : ""}`), w(null), E(""), ue(await v.listImports(c)), t();
			} catch (e) {
				j("Could not finish: " + (e.message || e));
			} finally {
				O(!1);
			}
		}
	}
	return /* @__PURE__ */ (0, x.jsxs)(p, { children: [
		/* @__PURE__ */ (0, x.jsx)(f, { children: /* @__PURE__ */ (0, x.jsxs)(u, {
			className: "text-base",
			children: ["Undo / Redo imports ", /* @__PURE__ */ (0, x.jsx)("span", {
				className: "text-sm font-normal text-muted-foreground",
				children: "— the imports this computer applied; asks for your password"
			})]
		}) }),
		/* @__PURE__ */ (0, x.jsxs)(d, {
			className: "grid gap-2",
			children: [
				k && /* @__PURE__ */ (0, x.jsx)("p", {
					className: "text-sm",
					role: "status",
					children: k
				}),
				/* @__PURE__ */ (0, x.jsxs)(ce, { children: [/* @__PURE__ */ (0, x.jsx)(se, { children: /* @__PURE__ */ (0, x.jsx)(_, { children: [
					"When",
					"How",
					"File",
					"Changed",
					"State",
					""
				].map((e) => /* @__PURE__ */ (0, x.jsx)(oe, { children: e }, e)) }) }), /* @__PURE__ */ (0, x.jsx)(h, { children: y.length ? y.map((e) => {
					let t = e.history?.[e.history.length - 1];
					return /* @__PURE__ */ (0, x.jsxs)(_, { children: [
						/* @__PURE__ */ (0, x.jsx)(g, { children: S(e.at) }),
						/* @__PURE__ */ (0, x.jsx)(g, { children: e.via || "" }),
						/* @__PURE__ */ (0, x.jsx)(g, {
							className: "max-w-48 truncate text-xs",
							title: e.fileName,
							children: e.fileName || ""
						}),
						/* @__PURE__ */ (0, x.jsxs)(g, { children: [
							e.created.length,
							" new, ",
							e.updates.length,
							" updated"
						] }),
						/* @__PURE__ */ (0, x.jsx)(g, { children: e.applied ? t ? `redone ${S(t.at)}` : "applied" : `undone ${S(t?.at)}` }),
						/* @__PURE__ */ (0, x.jsxs)(g, {
							className: "space-x-1",
							children: [v?.canUndo(y, e) && /* @__PURE__ */ (0, x.jsx)(l, {
								size: "sm",
								variant: "outline",
								disabled: i.readonly,
								onClick: () => {
									w({
										e,
										way: "undo"
									}), E(""), j("");
								},
								children: "Undo"
							}), v?.canRedo(y, e) && /* @__PURE__ */ (0, x.jsx)(l, {
								size: "sm",
								variant: "outline",
								disabled: i.readonly,
								onClick: () => {
									w({
										e,
										way: "redo"
									}), E(""), j("");
								},
								children: "Redo"
							})]
						})
					] }, e.id);
				}) : /* @__PURE__ */ (0, x.jsx)(_, { children: /* @__PURE__ */ (0, x.jsx)(g, {
					colSpan: 6,
					className: "text-muted-foreground",
					children: "No import applied on this computer yet."
				}) }) })] }),
				/* @__PURE__ */ (0, x.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Undo puts back only what that import changed; other edits made since stay. New slips it made are deleted unless rooms were assigned to them since. An automatic import of a newer file applies UMS again."
				})
			]
		}),
		C && /* @__PURE__ */ (0, x.jsx)(ae, {
			open: !0,
			onOpenChange: (e) => {
				!e && !D && w(null);
			},
			children: /* @__PURE__ */ (0, x.jsxs)(o, {
				className: "max-w-[calc(100%-1rem)] sm:max-w-sm",
				children: [
					/* @__PURE__ */ (0, x.jsx)(a, { children: /* @__PURE__ */ (0, x.jsxs)(s, { children: [
						C.way === "undo" ? "Undo" : "Redo",
						" the import of ",
						S(C.e.at),
						"?"
					] }) }),
					/* @__PURE__ */ (0, x.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							C.e.created.length,
							" new slip(s), ",
							C.e.updates.length,
							" updated. Type the password of ",
							/* @__PURE__ */ (0, x.jsx)("b", { children: String(n.currentDesk()?.name || "") }),
							" to confirm."
						]
					}),
					/* @__PURE__ */ (0, x.jsx)(m, {
						type: "password",
						autoFocus: !0,
						autoComplete: "current-password",
						"aria-label": "Your password",
						value: T,
						onChange: (e) => E(e.target.value),
						onKeyDown: (e) => {
							e.key === "Enter" && T && fe();
						}
					}),
					de && /* @__PURE__ */ (0, x.jsx)("p", {
						className: "text-sm text-destructive",
						role: "alert",
						children: de
					}),
					/* @__PURE__ */ (0, x.jsxs)(ie, {
						className: "gap-2",
						children: [/* @__PURE__ */ (0, x.jsx)(l, {
							variant: "outline",
							disabled: D,
							onClick: () => w(null),
							children: "Cancel"
						}), /* @__PURE__ */ (0, x.jsx)(l, {
							disabled: D || !T,
							onClick: () => void fe(),
							children: D ? "Working…" : C.way === "undo" ? "Undo" : "Redo"
						})]
					})
				]
			})
		})
	] });
}
// src/pages/ums/UmsPage.tsx
var C = (e) => e ? e.split("-").reverse().join("/") : "", w = (e) => `${C(e.checkin_date)} ${e.checkin_time || ""} → ${C(e.checkout_date)} ${e.checkout_time || ""}`, T = (e) => e ? new Date(e).toLocaleString([], {
	day: "2-digit",
	month: "short",
	hour: "2-digit",
	minute: "2-digit"
}) : "", E = ({ children: e }) => /* @__PURE__ */ (0, x.jsx)("span", {
	className: "text-xs text-muted-foreground",
	children: e
}), D = ({ children: e, tone: t }) => /* @__PURE__ */ (0, x.jsx)(y, {
	variant: t === "bad" ? "destructive" : "outline",
	className: v(t === "ok" && "border-ok text-ok", t === "warn" && "border-warn text-warn"),
	children: e
}), O = () => /* @__PURE__ */ (0, x.jsx)(y, {
	variant: "outline",
	className: "ml-1 border-warn text-warn",
	title: "UMS now says Will Not Travel To Madina; the Madina dates of the earlier import are kept and only the departure follows UMS",
	children: "COMPLIANCE"
}), k = ({ children: e }) => /* @__PURE__ */ (0, x.jsxs)("span", {
	className: "block text-xs text-warn",
	children: ["⚠ ", e]
});
function A() {
	let { ums: e, settings: t } = r(), i = te(), a = n(), ie = ee(), { site: o, siteId: s } = re(), { href: ae } = ne(), { ask: y, dialog: S } = le(), [A, de] = (0, b.useState)(null), [j, fe] = (0, b.useState)(null), [M, pe] = (0, b.useState)(null), [N, me] = (0, b.useState)(null), [P, he] = (0, b.useState)("create"), [ge, F] = (0, b.useState)(""), [_e, I] = (0, b.useState)(""), [ve, L] = (0, b.useState)(!1), [ye, be] = (0, b.useState)(!1), [, xe] = (0, b.useState)(0), [Se, Ce] = (0, b.useState)(0), we = (0, b.useRef)(null), R = e, [z, Te] = (0, b.useState)(null), [B, Ee] = (0, b.useState)({
		running: !1,
		paired: !1
	}), [V, H] = (0, b.useState)({
		url: "http://127.0.0.1:8787",
		token: "",
		everyMin: 0
	}), [De, U] = (0, b.useState)(""), [W, Oe] = (0, b.useState)(""), ke = (/* @__PURE__ */ new Date(Date.now() - (/* @__PURE__ */ new Date()).getTimezoneOffset() * 6e4)).toISOString().slice(0, 10), [G, Ae] = (0, b.useState)({
		from: ke,
		to: ke,
		filter: ""
	}), K = async (e = z) => {
		if (e) try {
			Ee(await e.status());
		} catch (e) {
			Ee({
				running: !1,
				paired: !1,
				error: e.message
			});
		}
	};
	(0, b.useEffect)(() => {
		let e = !0, t = null, n = null;
		return ie("ums-bridge").then((r) => {
			e && (t = r, Te(r), H(r.getConfig()), K(r), n = setInterval(() => {
				document.visibilityState === "visible" && K(r);
			}, 4e3), r.startAutoFetch((e) => {
				e.file ? (q({ ...e.file }), U(`Fetched from UMS · ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`)) : e.error && U(`Automatic fetch failed: ${e.error.message}`);
			}));
		}), () => {
			e = !1, clearInterval(n), t?.stopAutoFetch();
		};
	}, []);
	let je = (e) => e?.state === "awaiting_human" ? "A browser window is open on the bridge computer — log in to UMS there (credentials, CAPTCHA, Login)." : "";
	async function Me(e) {
		if (z) {
			Oe(e), U(e === "login" ? "Opening the UMS login on the bridge computer…" : "Fetching the Group List from UMS…");
			try {
				let t = (e) => {
					let t = je(e);
					t && U(t), K();
				};
				e === "login" ? (await z.login({ onTick: t }), U("Logged in to UMS.")) : (await q({ ...await z.fetchGroupList({
					from: G.from,
					to: G.to || G.from,
					...G.filter ? { filter: G.filter } : {}
				}, { onTick: t }) }), U(`Fetched from UMS · ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`));
			} catch (e) {
				U(e.code === "CAPTCHA_TIMEOUT" ? "Nobody logged in within the time allowed — try again." : e.message || "Failed.");
			} finally {
				Oe(""), K();
			}
		}
	}
	let Ne = () => {
		z && (z.setConfig({
			url: V.url.trim() || "http://127.0.0.1:8787",
			token: V.token.trim(),
			everyMin: V.everyMin
		}), z.startAutoFetch(() => {}), U("Saved."), K());
	};
	(0, b.useEffect)(() => {
		ie("ums-auto").then((e) => {
			de(e), e.askExtension("get-latest");
		});
		let e = () => xe((e) => e + 1), t = [
			"pms:ums-ext",
			"pms:ums-status",
			"pms:ums-file",
			"pms:ums-applied"
		];
		return t.forEach((t) => window.addEventListener(t, e)), () => t.forEach((t) => window.removeEventListener(t, e));
	}, []);
	async function q(e) {
		fe(e), F("");
		let n = R.parseUms(e.html);
		if (pe(n), n.fatal) {
			me(null);
			return;
		}
		let r = R.planImport(n, await i.all(), s, await a(t.umsConfig()));
		me(r), he(r.create.length ? "create" : r.update.length ? "update" : "missing");
	}
	let Pe = async (e) => {
		e && await q({
			html: await e.text(),
			fileName: e.name,
			via: "file",
			fetchedAt: null
		});
	}, Fe = N ? [
		[
			"create",
			"New",
			() => N.create
		],
		[
			"update",
			"Updated",
			() => N.update.filter((e) => !e.relinkOnly)
		],
		[
			"held",
			"Needs a decision",
			() => N.held || []
		],
		[
			"attention",
			"Needs attention",
			() => N.update.filter((e) => e.notes.length)
		],
		[
			"kept",
			"Your edits kept",
			() => N.kept
		],
		[
			"relink",
			"Linked, no change",
			() => N.update.filter((e) => e.relinkOnly)
		],
		[
			"missing",
			"Not in this UMS file",
			() => N.missing
		]
	] : [], J = Fe.find((e) => e[0] === P)?.[2]() ?? [], Y = (0, b.useMemo)(() => N ? R.summarize(N) : null, [N, P]), Ie = M ? [
		...M.errors,
		...M.warnings,
		...N?.warnings || []
	] : [], X = R.lastApplied(s), Z = A?.ext;
	async function Le(e, t) {
		let n = e.slip;
		try {
			if (t === "delete") {
				if (!await y({
					title: `Delete slip SH ${n.sh_no}?`,
					body: `${n.tour_name || ""}, ${w(n)}\nIt is not in the UMS file — cancelled or postponed?`,
					confirmLabel: "Delete"
				})) return;
				await a(i.remove(n.id));
			} else await a(i.update(n.id, { ums_absent_kept: {
				at: (/* @__PURE__ */ new Date()).toISOString(),
				file: j?.fileName || ""
			} }));
			me((e) => e && {
				...e,
				missing: e.missing.filter((e) => e.slip.id !== n.id)
			}), F(t === "delete" ? `SH ${n.sh_no} deleted.` : `SH ${n.sh_no} kept.`);
		} catch (e) {
			F(e.message || String(e));
		}
	}
	async function Re() {
		try {
			let e = R.placesForSlips(await i.all());
			if (!e.length) {
				I("Every UMS slip already has its From / To.");
				return;
			}
			let t = (t) => e.filter((e) => t in e.patch).length;
			if (!await y({
				title: `Fill From on ${t("from_place")} slips and To on ${t("to_place")} slips?`,
				body: `${e.length} slips in all. Places already set are not changed.`,
				confirmLabel: "Fill"
			})) return;
			L(!0), I("Saving…");
			let n = await a(i.bulkWrite({ put: e.map((e) => ({
				...e.slip,
				...e.patch,
				updatedAt: (/* @__PURE__ */ new Date()).toISOString()
			})) }, "from-to-fill"));
			I(`Done: ${n.updated} slips updated${n.skipped ? `, ${n.skipped} skipped` : ""}.`);
		} catch (e) {
			I(e.message || "Could not save.");
		} finally {
			L(!1);
		}
	}
	async function ze() {
		if (N && j && Y && (!Y.attention || await y({
			title: `${Y.attention} slip(s) need attention`,
			body: "Rooms assigned, or your edits replaced. Apply anyway?",
			confirmLabel: "Apply anyway"
		}))) {
			L(!0), F("Applying…");
			try {
				let e = await A.runImport({
					siteId: s,
					html: j.html,
					fileName: j.fileName,
					fetchedAt: j.fetchedAt,
					via: j.via,
					force: !0
				});
				if (e.error) throw Error(e.error);
				let t = e.summary;
				await q(j), Ce((e) => e + 1), F(`Done: ${t.created} new, ${t.updated} updated${t.relinked ? `, ${t.relinked} linked` : ""}. Every desk sees it now.`);
			} catch (e) {
				F("Import failed: " + (e.message || e));
			} finally {
				L(!1);
			}
		}
	}
	let Q = (...e) => /* @__PURE__ */ (0, x.jsx)(se, { children: /* @__PURE__ */ (0, x.jsx)(_, { children: e.map((e) => /* @__PURE__ */ (0, x.jsx)(oe, { children: e }, e)) }) }), Be = (e) => /* @__PURE__ */ (0, x.jsxs)(x.Fragment, { children: [
		e.total ?? "",
		" ",
		/* @__PURE__ */ (0, x.jsxs)(E, { children: [
			"(",
			e.gents ?? 0,
			"/",
			e.ladies ?? 0,
			"/",
			e.children ?? 0,
			"/",
			e.infants ?? 0,
			")"
		] })
	] }), $ = (e) => /* @__PURE__ */ (0, x.jsx)(_, { children: /* @__PURE__ */ (0, x.jsx)(g, {
		colSpan: e,
		className: "text-muted-foreground",
		children: "Nothing here."
	}) }), Ve = (e, t) => /* @__PURE__ */ (0, x.jsx)("a", {
		className: "text-primary underline",
		href: ae("slip", { sh_no: e }),
		target: "_blank",
		rel: "noopener",
		children: t
	}), He = N?.missingRange, Ue = !Y || !Y.created && !Y.updated && !Y.relinked, We = R.readLog(s);
	return /* @__PURE__ */ (0, x.jsxs)("div", {
		className: "mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4",
		children: [
			/* @__PURE__ */ (0, x.jsxs)("header", { children: [/* @__PURE__ */ (0, x.jsxs)("h1", {
				className: "text-2xl font-bold text-primary",
				children: ["UMS Import — ", o.label]
			}), /* @__PURE__ */ (0, x.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Brings the UMS Group List into this site's slips. UMS decides names, leader, pax and dates; building and rooms stay exactly as the desk set them. Nothing is deleted."
			})] }),
			/* @__PURE__ */ (0, x.jsxs)(p, { children: [/* @__PURE__ */ (0, x.jsx)(f, { children: /* @__PURE__ */ (0, x.jsxs)(u, {
				className: "text-base",
				children: ["UMS bridge ", /* @__PURE__ */ (0, x.jsx)("span", {
					className: "text-sm font-normal text-muted-foreground",
					children: "— on this computer: logs in to UMS in a real browser window; the PMS reads UMS through it"
				})]
			}) }), /* @__PURE__ */ (0, x.jsxs)(d, {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, x.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2 text-sm",
						children: [
							/* @__PURE__ */ (0, x.jsx)(D, {
								tone: B.running && B.paired && !B.badToken ? "ok" : B.running ? "warn" : void 0,
								children: B.running ? B.badToken ? "wrong token" : B.paired ? B.state === "awaiting_human" ? "waiting for you to log in to UMS" : B.authenticated ? "connected · logged in to UMS" : "connected" : "running — paste its token" : "not running"
							}),
							/* @__PURE__ */ (0, x.jsx)(l, {
								size: "sm",
								disabled: !B.paired || !!W || !!B.badToken,
								onClick: () => void Me("login"),
								children: W === "login" ? "Waiting for you…" : "Log in to UMS"
							}),
							/* @__PURE__ */ (0, x.jsx)(l, {
								size: "sm",
								variant: "outline",
								disabled: !B.paired || !!W || !!B.badToken,
								onClick: () => void Me("fetch"),
								children: W === "fetch" ? "Fetching…" : "Fetch Group List now"
							}),
							/* @__PURE__ */ (0, x.jsxs)("label", {
								className: "flex items-center gap-1.5 text-sm",
								children: [
									"every",
									/* @__PURE__ */ (0, x.jsxs)("select", {
										className: "h-8 rounded-md border bg-background px-1",
										value: V.everyMin,
										onChange: (e) => {
											let t = Number(e.target.value);
											H((e) => ({
												...e,
												everyMin: t
											})), z?.setConfig({ everyMin: t }), z?.startAutoFetch((e) => {
												e.file ? (q({ ...e.file }), U(`Fetched from UMS · ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`)) : e.error && U(`Automatic fetch failed: ${e.error.message}`);
											});
										},
										children: [/* @__PURE__ */ (0, x.jsx)("option", {
											value: 0,
											children: "— (not automatic)"
										}), [
											15,
											30,
											60
										].map((e) => /* @__PURE__ */ (0, x.jsxs)("option", {
											value: e,
											children: [e, " min"]
										}, e))]
									}),
									" while this page is open"
								]
							})
						]
					}),
					/* @__PURE__ */ (0, x.jsxs)("div", {
						className: "flex flex-wrap items-end gap-2 text-sm",
						children: [
							/* @__PURE__ */ (0, x.jsxs)("label", {
								className: "grid gap-1 text-xs",
								children: ["From", /* @__PURE__ */ (0, x.jsx)(m, {
									type: "date",
									className: "w-40",
									value: G.from,
									onChange: (e) => Ae((t) => ({
										...t,
										from: e.target.value,
										to: t.to < e.target.value ? e.target.value : t.to
									}))
								})]
							}),
							/* @__PURE__ */ (0, x.jsxs)("label", {
								className: "grid gap-1 text-xs",
								children: ["Upto", /* @__PURE__ */ (0, x.jsx)(m, {
									type: "date",
									className: "w-40",
									value: G.to,
									min: G.from,
									onChange: (e) => Ae((t) => ({
										...t,
										to: e.target.value
									}))
								})]
							}),
							/* @__PURE__ */ (0, x.jsxs)("label", {
								className: "grid gap-1 text-xs",
								children: ["UMS list", /* @__PURE__ */ (0, x.jsx)("select", {
									className: "h-9 rounded-md border bg-background px-2 text-sm",
									value: G.filter,
									onChange: (e) => Ae((t) => ({
										...t,
										filter: e.target.value
									})),
									children: (z?.GROUP_FILTERS || [["", "No filter (None of These)"]]).map(([e, t]) => /* @__PURE__ */ (0, x.jsx)("option", {
										value: e,
										children: t
									}, e))
								})]
							}),
							/* @__PURE__ */ (0, x.jsx)("span", {
								className: "pb-2 text-xs text-muted-foreground",
								children: "for “Fetch Group List now” (the timer fetches today)"
							})
						]
					}),
					De && /* @__PURE__ */ (0, x.jsx)("p", {
						className: "text-sm",
						children: De
					}),
					/* @__PURE__ */ (0, x.jsxs)("details", {
						className: "text-sm",
						children: [
							/* @__PURE__ */ (0, x.jsx)("summary", {
								className: "cursor-pointer text-muted-foreground",
								children: "Connection"
							}),
							/* @__PURE__ */ (0, x.jsxs)("div", {
								className: "mt-2 flex flex-wrap items-end gap-2",
								children: [
									/* @__PURE__ */ (0, x.jsxs)("label", {
										className: "grid gap-1 text-xs",
										children: ["Address", /* @__PURE__ */ (0, x.jsx)(m, {
											className: "w-56",
											value: V.url,
											onChange: (e) => H((t) => ({
												...t,
												url: e.target.value
											}))
										})]
									}),
									/* @__PURE__ */ (0, x.jsxs)("label", {
										className: "grid gap-1 text-xs",
										children: ["Token", /* @__PURE__ */ (0, x.jsx)(m, {
											className: "w-72",
											type: "password",
											autoComplete: "off",
											placeholder: "printed when the bridge starts",
											value: V.token,
											onChange: (e) => H((t) => ({
												...t,
												token: e.target.value
											}))
										})]
									}),
									/* @__PURE__ */ (0, x.jsx)(l, {
										size: "sm",
										variant: "outline",
										onClick: Ne,
										children: "Save"
									})
								]
							}),
							/* @__PURE__ */ (0, x.jsxs)("p", {
								className: "mt-2 text-xs text-muted-foreground",
								children: [
									"Start the bridge on this computer: ",
									/* @__PURE__ */ (0, x.jsx)("code", { children: "cd tools/ums-bridge" }),
									", then ",
									/* @__PURE__ */ (0, x.jsx)("code", { children: "npm run serve" }),
									" (set ",
									/* @__PURE__ */ (0, x.jsx)("code", { children: "UMS_MANUAL_LOGIN=1" }),
									" and ",
									/* @__PURE__ */ (0, x.jsx)("code", { children: "UMS_HEADLESS=0" }),
									" so UMS opens in a window where you log in yourself). The address and token are kept in this browser only. The bridge never solves the CAPTCHA — you do."
								]
							})
						]
					})
				]
			})] }),
			/* @__PURE__ */ (0, x.jsxs)("div", {
				className: "grid gap-3 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, x.jsxs)(p, { children: [/* @__PURE__ */ (0, x.jsx)(f, { children: /* @__PURE__ */ (0, x.jsx)(u, {
					className: "text-base",
					children: "1 · Load the Group List"
				}) }), /* @__PURE__ */ (0, x.jsxs)(d, {
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ (0, x.jsxs)("label", {
							className: v("grid cursor-pointer place-items-center rounded-xl border-2 border-dashed p-6 text-center text-sm", ye && "border-gold bg-accent"),
							onDragOver: (e) => {
								e.preventDefault(), be(!0);
							},
							onDragLeave: () => be(!1),
							onDrop: (e) => {
								e.preventDefault(), be(!1), Pe(e.dataTransfer.files[0]);
							},
							children: [/* @__PURE__ */ (0, x.jsx)("input", {
								ref: we,
								hidden: !0,
								type: "file",
								accept: ".xls,.htm,.html,text/html",
								onChange: (e) => {
									Pe(e.target.files?.[0]), e.target.value = "";
								}
							}), /* @__PURE__ */ (0, x.jsxs)("span", { children: [
								"Drop ",
								/* @__PURE__ */ (0, x.jsx)("b", { children: "GroupList….xls" }),
								" here, or ",
								/* @__PURE__ */ (0, x.jsx)("u", { children: "choose the file" })
							] })]
						}),
						/* @__PURE__ */ (0, x.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2 text-sm",
							children: [
								"Chrome extension: ",
								/* @__PURE__ */ (0, x.jsx)(D, {
									tone: Z?.connected ? "ok" : void 0,
									children: Z?.connected ? `connected${Z.version ? " · v" + Z.version : ""}` : "not detected"
								}),
								Z?.connected && /* @__PURE__ */ (0, x.jsx)(l, {
									size: "sm",
									variant: "outline",
									onClick: () => A.askExtension("fetch-now"),
									children: "Fetch from UMS now"
								}),
								Z?.latestFile && /* @__PURE__ */ (0, x.jsx)(l, {
									size: "sm",
									variant: "outline",
									onClick: () => void q({
										...Z.latestFile,
										via: "extension"
									}),
									children: "Use latest from extension"
								})
							]
						}),
						/* @__PURE__ */ (0, x.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								Z?.latestFile && `Latest file: fetched ${T(Z.latestFile.fetchedAt)}.`,
								Z?.lastStatus && (Z.lastStatus.ok ? `Last fetch OK · ${T(Z.lastStatus.at)}.` : `Last fetch failed · ${T(Z.lastStatus.at)}: ${Z.lastStatus.error}`),
								!Z?.connected && "Install the extension from the extension/ folder (see its README) to fetch the Group List every hour."
							].filter(Boolean).join(" ")
						})
					]
				})] }), /* @__PURE__ */ (0, x.jsxs)(p, { children: [/* @__PURE__ */ (0, x.jsx)(f, { children: /* @__PURE__ */ (0, x.jsx)(u, {
					className: "text-base",
					children: "Automatic import on this device"
				}) }), /* @__PURE__ */ (0, x.jsxs)(d, {
					className: "grid gap-2 text-sm",
					children: [/* @__PURE__ */ (0, x.jsxs)("label", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, x.jsx)(c, {
							disabled: i.readonly || !A,
							checked: A?.getAutoSite() === s,
							onCheckedChange: (e) => {
								A.setAutoSite(e === !0 ? s : ""), xe((e) => e + 1);
							}
						}), /* @__PURE__ */ (0, x.jsxs)("span", { children: [
							"Apply every file the extension fetches to ",
							/* @__PURE__ */ (0, x.jsx)("b", { children: o.label }),
							" automatically"
						] })]
					}), /* @__PURE__ */ (0, x.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							A && A.getAutoSite() && A.getAutoSite() !== s && `This device auto-imports for ${A.getAutoSite()} — turning this on switches it to ${o.label}.`,
							"Keep one PMS tab open on this computer; the extension delivers each new file to it. Only this site is imported, and files that look incomplete are held for review.",
							X && `Last applied import: ${T(X.at)} (${X.rows} rows).`
						].filter(Boolean).join(" ")
					})]
				})] })]
			}),
			M && /* @__PURE__ */ (0, x.jsxs)(p, { children: [/* @__PURE__ */ (0, x.jsx)(f, { children: /* @__PURE__ */ (0, x.jsx)(u, {
				className: "text-base",
				children: "2 · File check"
			}) }), /* @__PURE__ */ (0, x.jsxs)(d, {
				className: "grid gap-2",
				children: [
					/* @__PURE__ */ (0, x.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, x.jsxs)(D, { children: [
								j?.fileName || "file",
								" ",
								j?.fetchedAt ? "· fetched " + T(j.fetchedAt) : ""
							] }),
							/* @__PURE__ */ (0, x.jsxs)(D, {
								tone: M.fatal ? "bad" : "ok",
								children: [M.rowCount, " group rows"]
							}),
							M.errors.length > 0 && /* @__PURE__ */ (0, x.jsxs)(D, {
								tone: "bad",
								children: [M.errors.length, " unreadable"]
							}),
							X && /* @__PURE__ */ (0, x.jsxs)(D, { children: [
								"last import: ",
								X.rows,
								" rows · ",
								T(X.at)
							] }),
							(N?.compliance ?? 0) > 0 && /* @__PURE__ */ (0, x.jsxs)(D, {
								tone: "warn",
								children: [N.compliance, " compliance group(s): Madina dates kept"]
							}),
							N && Y && /* @__PURE__ */ (0, x.jsxs)(x.Fragment, { children: [/* @__PURE__ */ (0, x.jsxs)(D, { children: [
								Y.groups,
								" groups stay in ",
								o.label,
								" (",
								Y.stays,
								" stays)"
							] }), /* @__PURE__ */ (0, x.jsxs)(D, { children: [N.otherSiteStays, " stays elsewhere — not imported here"] })] })
						]
					}),
					M.fatal && /* @__PURE__ */ (0, x.jsx)("p", {
						className: "text-sm text-destructive",
						children: M.fatal
					}),
					Ie.length > 0 && /* @__PURE__ */ (0, x.jsxs)("details", {
						className: "text-sm",
						children: [/* @__PURE__ */ (0, x.jsxs)("summary", {
							className: "cursor-pointer",
							children: [Ie.length, " note(s) about the file"]
						}), /* @__PURE__ */ (0, x.jsx)("ul", {
							className: "ml-5 list-disc",
							children: Ie.map((e, t) => /* @__PURE__ */ (0, x.jsx)("li", { children: e }, t))
						})]
					})
				]
			})] }),
			N && /* @__PURE__ */ (0, x.jsxs)(p, { children: [/* @__PURE__ */ (0, x.jsx)(f, { children: /* @__PURE__ */ (0, x.jsxs)(u, {
				className: "text-base",
				children: ["3 · Changes for ", o.label]
			}) }), /* @__PURE__ */ (0, x.jsxs)(d, {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, x.jsxs)("div", {
						role: "tablist",
						className: "flex flex-wrap items-center gap-1.5",
						children: [Fe.map(([e, t, n]) => /* @__PURE__ */ (0, x.jsxs)(l, {
							role: "tab",
							"aria-selected": e === P,
							size: "sm",
							variant: e === P ? "default" : "outline",
							onClick: () => he(e),
							children: [
								t,
								" ",
								/* @__PURE__ */ (0, x.jsx)("span", {
									className: "ml-1 rounded-full bg-background/30 px-1.5 text-xs",
									children: n().length
								})
							]
						}, e)), /* @__PURE__ */ (0, x.jsxs)(D, { children: [N.unchanged, " unchanged"] })]
					}),
					P === "held" && /* @__PURE__ */ (0, x.jsxs)("p", {
						className: "text-sm",
						children: [
							"UMS changed the dates of these slips, but a room would then hold more guests than its beds. ",
							/* @__PURE__ */ (0, x.jsx)("b", { children: "The dates were not changed." }),
							" Sort the room out (move one group to another room, or correct the stay); the next import applies the UMS dates by itself."
						]
					}),
					P === "missing" && /* @__PURE__ */ (0, x.jsx)("p", {
						className: "text-sm",
						children: He ? /* @__PURE__ */ (0, x.jsxs)(x.Fragment, { children: [
							"Slips in the PMS checking in ",
							/* @__PURE__ */ (0, x.jsxs)("b", { children: [
								C(He.from),
								" – ",
								C(He.to)
							] }),
							" (the dates this file covers) that the file does not have — the SH may have been ",
							/* @__PURE__ */ (0, x.jsx)("b", { children: "cancelled or postponed" }),
							" in UMS. Keep, edit or delete each. Kept slips are not listed again."
						] }) : "This file has no stays for this site."
					}),
					/* @__PURE__ */ (0, x.jsx)(ce, { children: P === "create" ? /* @__PURE__ */ (0, x.jsxs)(x.Fragment, { children: [Q("SH", "Group", "Leader", "Stay", "Pax (G/L/C/I)", "Itinerary", "Country"), /* @__PURE__ */ (0, x.jsx)(h, { children: J.length ? J.map(({ rec: e }) => /* @__PURE__ */ (0, x.jsxs)(_, { children: [
						/* @__PURE__ */ (0, x.jsxs)(g, { children: [e.sh_no, e.ums?.compliance && /* @__PURE__ */ (0, x.jsx)(O, {})] }),
						/* @__PURE__ */ (0, x.jsxs)(g, { children: [e.tour_name, e.ums.family && /* @__PURE__ */ (0, x.jsx)(D, { children: "family" })] }),
						/* @__PURE__ */ (0, x.jsx)(g, { children: e.group_leader }),
						/* @__PURE__ */ (0, x.jsx)(g, { children: w(e) }),
						/* @__PURE__ */ (0, x.jsx)(g, { children: Be(e) }),
						/* @__PURE__ */ (0, x.jsxs)(g, { children: [
							e.ums.itinerary,
							" #",
							e.ums.seg
						] }),
						/* @__PURE__ */ (0, x.jsx)(g, { children: e.ums.country })
					] }, e.sh_no + e.ums.seg)) : $(7) })] }) : P === "held" ? /* @__PURE__ */ (0, x.jsxs)(x.Fragment, { children: [Q("SH", "Group", "Stay now", "UMS wants", "Why it was held", ""), /* @__PURE__ */ (0, x.jsx)(h, { children: J.length ? J.map((e, t) => /* @__PURE__ */ (0, x.jsxs)(_, { children: [
						/* @__PURE__ */ (0, x.jsx)(g, { children: e.slip.sh_no }),
						/* @__PURE__ */ (0, x.jsx)(g, { children: e.slip.tour_name }),
						/* @__PURE__ */ (0, x.jsx)(g, { children: w(e.slip) }),
						/* @__PURE__ */ (0, x.jsx)(g, { children: R.wantedText(e.slip, e) }),
						/* @__PURE__ */ (0, x.jsx)(g, { children: /* @__PURE__ */ (0, x.jsx)(k, { children: R.heldText(e) }) }),
						/* @__PURE__ */ (0, x.jsx)(g, { children: Ve(e.slip.sh_no, "Open slip") })
					] }, t)) : $(6) })] }) : P === "kept" ? /* @__PURE__ */ (0, x.jsxs)(x.Fragment, { children: [Q("SH", "Group", "Stay", "Kept (yours → UMS says)"), /* @__PURE__ */ (0, x.jsx)(h, { children: J.length ? J.map(({ slip: e, kept: t }) => /* @__PURE__ */ (0, x.jsxs)(_, { children: [
						/* @__PURE__ */ (0, x.jsx)(g, { children: e.sh_no }),
						/* @__PURE__ */ (0, x.jsx)(g, { children: e.tour_name }),
						/* @__PURE__ */ (0, x.jsx)(g, { children: w(e) }),
						/* @__PURE__ */ (0, x.jsx)(g, { children: Object.entries(t).map(([e, t]) => /* @__PURE__ */ (0, x.jsxs)("span", {
							className: "block",
							children: [
								/* @__PURE__ */ (0, x.jsx)("b", { children: e }),
								": ",
								String(t.yours),
								" ",
								/* @__PURE__ */ (0, x.jsxs)(E, { children: [
									"(UMS: ",
									String(t.ums),
									t.delayed ? " — kept: delayed departure" : "",
									")"
								] })
							]
						}, e)) })
					] }, e.id)) : $(4) })] }) : P === "missing" ? /* @__PURE__ */ (0, x.jsxs)(x.Fragment, { children: [Q("SH", "Group", "Stay", "Building · rooms", "From", "Action"), /* @__PURE__ */ (0, x.jsx)(h, { children: J.length ? J.map((e) => {
						let t = e.slip, n = ["gents", "ladies"].flatMap((e) => (t.rooms?.[e] || []).map((e) => String(e.room_no || "").trim()).filter(Boolean));
						return /* @__PURE__ */ (0, x.jsxs)(_, { children: [
							/* @__PURE__ */ (0, x.jsx)(g, { children: t.sh_no }),
							/* @__PURE__ */ (0, x.jsxs)(g, { children: [
								t.tour_name,
								/* @__PURE__ */ (0, x.jsx)("br", {}),
								/* @__PURE__ */ (0, x.jsx)(E, { children: String(t.group_leader || "").trim() || "-" })
							] }),
							/* @__PURE__ */ (0, x.jsx)(g, { children: w(t) }),
							/* @__PURE__ */ (0, x.jsxs)(g, { children: [t.building || "—", n.length > 0 && /* @__PURE__ */ (0, x.jsxs)(x.Fragment, { children: [/* @__PURE__ */ (0, x.jsx)("br", {}), /* @__PURE__ */ (0, x.jsx)(E, { children: n.join(", ") })] })] }),
							/* @__PURE__ */ (0, x.jsx)(g, { children: e.why === "ums" ? `UMS, last imported ${T(t.ums?.importedAt)}` : "made in the PMS" }),
							/* @__PURE__ */ (0, x.jsx)(g, {
								className: "space-x-1",
								children: !i.readonly && /* @__PURE__ */ (0, x.jsxs)(x.Fragment, { children: [
									/* @__PURE__ */ (0, x.jsx)(l, {
										size: "sm",
										variant: "outline",
										onClick: () => void Le(e, "keep"),
										children: "Keep"
									}),
									Ve(t.sh_no, "Edit"),
									" ",
									/* @__PURE__ */ (0, x.jsx)(l, {
										size: "sm",
										variant: "outline",
										className: "text-destructive",
										onClick: () => void Le(e, "delete"),
										children: "Delete"
									})
								] })
							})
						] }, t.id);
					}) : $(6) })] }) : /* @__PURE__ */ (0, x.jsxs)(x.Fragment, { children: [Q("SH", "Group", "Building", "Stay (new)", "Changes"), /* @__PURE__ */ (0, x.jsx)(h, { children: J.length ? J.map((e) => /* @__PURE__ */ (0, x.jsxs)(_, { children: [
						/* @__PURE__ */ (0, x.jsxs)(g, { children: [e.rec.sh_no, e.rec.ums?.compliance && /* @__PURE__ */ (0, x.jsx)(O, {})] }),
						/* @__PURE__ */ (0, x.jsx)(g, { children: e.rec.tour_name }),
						/* @__PURE__ */ (0, x.jsx)(g, { children: e.rec.building || "—" }),
						/* @__PURE__ */ (0, x.jsx)(g, { children: w(e.rec) }),
						/* @__PURE__ */ (0, x.jsxs)(g, { children: [
							Object.entries(e.changes).map(([e, t]) => /* @__PURE__ */ (0, x.jsxs)("span", {
								className: "block",
								children: [
									/* @__PURE__ */ (0, x.jsx)("b", { children: e }),
									": ",
									/* @__PURE__ */ (0, x.jsx)("span", {
										className: "text-muted-foreground line-through",
										children: String(t.from)
									}),
									" → ",
									String(t.to)
								]
							}, e)),
							!Object.keys(e.changes).length && /* @__PURE__ */ (0, x.jsxs)(E, { children: ["linked to UMS stay ", e.key] }),
							e.notes.map((e, t) => /* @__PURE__ */ (0, x.jsx)(k, { children: e }, t))
						] })
					] }, e.key + e.rec.sh_no)) : $(5) })] }) }),
					/* @__PURE__ */ (0, x.jsxs)("div", {
						className: "flex flex-wrap items-center gap-3",
						children: [/* @__PURE__ */ (0, x.jsx)(l, {
							disabled: i.readonly || Ue || ve,
							onClick: () => void ze(),
							children: Ue ? "Nothing to apply" : `Apply: ${Y.created} new, ${Y.updated} updated${Y.relinked ? `, ${Y.relinked} linked` : ""}`
						}), /* @__PURE__ */ (0, x.jsx)("span", {
							className: "text-sm text-muted-foreground",
							children: ge || (i.readonly ? i.readonlyReason : "")
						})]
					})
				]
			})] }),
			/* @__PURE__ */ (0, x.jsxs)(p, { children: [/* @__PURE__ */ (0, x.jsxs)(f, { children: [/* @__PURE__ */ (0, x.jsx)(u, {
				className: "text-base",
				children: "From / To on existing slips"
			}), /* @__PURE__ */ (0, x.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [
					"Fills the ",
					/* @__PURE__ */ (0, x.jsx)("b", { children: "From" }),
					" and ",
					/* @__PURE__ */ (0, x.jsx)("b", { children: "To" }),
					" of every slip of ",
					o.label,
					" that came from UMS, using the arrival, departure and itinerary stored with it. Places already set by hand are kept. Every change is saved as a new slip version."
				]
			})] }), /* @__PURE__ */ (0, x.jsxs)(d, {
				className: "flex flex-wrap items-center gap-3",
				children: [/* @__PURE__ */ (0, x.jsx)(l, {
					variant: "outline",
					disabled: i.readonly || ve,
					onClick: () => void Re(),
					children: "Fill From / To on all slips"
				}), /* @__PURE__ */ (0, x.jsx)("span", {
					className: "text-sm text-muted-foreground",
					children: _e
				})]
			})] }),
			/* @__PURE__ */ (0, x.jsx)(ue, {
				refresh: Se,
				onDone: () => {
					j && q(j);
				}
			}),
			/* @__PURE__ */ (0, x.jsxs)(p, { children: [/* @__PURE__ */ (0, x.jsx)(f, { children: /* @__PURE__ */ (0, x.jsx)(u, {
				className: "text-base",
				children: "History"
			}) }), /* @__PURE__ */ (0, x.jsx)(d, { children: /* @__PURE__ */ (0, x.jsxs)(ce, { children: [Q("When", "How", "Result", "Rows", "New", "Updated", "Attention", "Not in export", "Note"), /* @__PURE__ */ (0, x.jsx)(h, { children: We.length ? We.map((e, t) => /* @__PURE__ */ (0, x.jsxs)(_, { children: [
				/* @__PURE__ */ (0, x.jsx)(g, { children: T(e.at) }),
				/* @__PURE__ */ (0, x.jsx)(g, { children: e.via }),
				/* @__PURE__ */ (0, x.jsx)(g, { children: /* @__PURE__ */ (0, x.jsx)(D, {
					tone: e.result === "applied" ? "ok" : e.result === "held" ? "warn" : "bad",
					children: e.result
				}) }),
				/* @__PURE__ */ (0, x.jsx)(g, { children: e.rows ?? "" }),
				/* @__PURE__ */ (0, x.jsx)(g, { children: e.created ?? "" }),
				/* @__PURE__ */ (0, x.jsx)(g, { children: e.updated ?? "" }),
				/* @__PURE__ */ (0, x.jsxs)(g, { children: [e.attention ?? "", e.held ? /* @__PURE__ */ (0, x.jsxs)("span", {
					className: "text-warn",
					title: "UMS date changes held: a room would be over capacity",
					children: [
						" ⚠ ",
						e.held,
						" held"
					]
				}) : null] }),
				/* @__PURE__ */ (0, x.jsx)(g, { children: e.missing ?? "" }),
				/* @__PURE__ */ (0, x.jsx)(g, {
					className: "text-xs",
					children: e.error || (e.warnings ? e.warnings + " note(s)" : "")
				})
			] }, t)) : /* @__PURE__ */ (0, x.jsx)(_, { children: /* @__PURE__ */ (0, x.jsx)(g, {
				colSpan: 9,
				className: "text-muted-foreground",
				children: "No imports yet."
			}) }) })] }) })] }),
			S
		]
	});
}
export { A as default };
