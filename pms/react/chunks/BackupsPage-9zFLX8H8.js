import { f as e, h as t, i as n, n as r, p as i, s as a } from "./PmsContext-BVMd13Oi.js";
import { a as o, i as s, n as c, r as ee, t as te } from "./select-VcH2xuqJ.js";
import { t as l } from "./label-CMEyi--P.js";
import { t as u } from "./refresh-cw-D-L_YZdS.js";
import { t as d } from "./button-BGWa3SLr.js";
import { i as f, n as p, r as m, t as h } from "./card-B9_OGomP.js";
import { t as g } from "./input-DSBk_UeU.js";
import { a as _, n as ne, o as re, r as v, s as y, t as b } from "./table-DKR1WqRT.js";
import { t as x } from "./utils-b7UP9Cmo.js";
import { t as ie } from "./ConfirmDialog-GfriOiUy.js";
import { t as S } from "./badge-EB7Muw37.js";
// src/lib/slipDiff.ts
var C = /* @__PURE__ */ t(i(), 1), w = (e) => (e || []).map((e) => `${e.room_no}×${e.assigned ?? e.beds ?? "?"}${e.exclusive ? " (exclusive" + (e.building ? `, ${e.building}` : "") + ")" : ""}${e.out && e.out.date ? ` → ${e.out.date}` : ""}`).join(", ") || "—";
function T(e) {
	e ||= {};
	let t = (e, t) => [e, t].filter(Boolean).join(" ") || "—";
	return [
		["SH", e.sh_no],
		["Tour", e.tour_name],
		["Leader", e.group_leader],
		["Building", e.building],
		["From", e.from_place],
		["To", e.to_place],
		["Check-in", t(e.checkin_date, e.checkin_time)],
		["Check-out", t(e.checkout_date, e.checkout_time)],
		["Gents", e.gents],
		["Ladies", e.ladies],
		["Children", e.children],
		["Infants", e.infants],
		["Total", e.total],
		["Checked in", e.checked_in ? "yes" : "no"],
		["Delayed", e.delayed && e.delayed.on ? `${e.delayed.status || "tentative"}${e.delayed.note ? ` · ${e.delayed.note}` : ""}` : "no"],
		["Gents rooms", w(e.rooms && e.rooms.gents)],
		["Ladies rooms", w(e.rooms && e.rooms.ladies)]
	].map(([e, t]) => [e, t == null || t === "" ? "—" : String(t)]);
}
function E(e, t) {
	if (!t) return null;
	let n = new Map(T(t)), r = [];
	for (let [t, i] of T(e)) n.get(t) !== i && r.push({
		l: t,
		from: n.get(t),
		to: i
	});
	return r;
}
// src/pages/backups/BackupsPage.tsx
var D = e(), O = (e) => e ? new Date(e).toLocaleString(void 0, {
	weekday: "short",
	day: "numeric",
	month: "short",
	hour: "2-digit",
	minute: "2-digit"
}) : "—", k = (e) => e == null ? "—" : e < 1048576 ? `${Math.max(1, Math.round(e / 1024))} KB` : `${(e / 1048576).toFixed(1)} MB`, A = (e) => {
	let t = Math.round(e / 6e4);
	return t < 1 ? "just now" : t < 90 ? `${t} min ago` : t < 2880 ? `${Math.round(t / 60)} h ago` : `${Math.round(t / 1440)} days ago`;
}, j = (e) => `${O(e.at)} · ${e.kind === "d" ? "daily" : e.trigger === "manual" ? "manual" : "hourly"}`, M = (e) => `${e.kind}|${e.stem}`;
function N() {
	let { cloud: e } = r(), t = n(), { href: i } = a(), { ask: w, dialog: T } = ie(), N = e.currentDesk()?.role === "admin", [P, ae] = (0, C.useState)([]), [F, oe] = (0, C.useState)(null), [se, ce] = (0, C.useState)(Date.now()), [I, le] = (0, C.useState)({ text: "" }), [L, R] = (0, C.useState)(!1), [z, B] = (0, C.useState)(""), [V, H] = (0, C.useState)(""), [U, W] = (0, C.useState)(null), G = (e, t = !1) => le({
		text: e,
		bad: t
	}), K = (t, n) => t instanceof e.UserError ? t.message : n;
	async function q() {
		try {
			let n = await t(e.request("GET", "/api/backups"));
			ae(n.items), oe(n.status), ce(Date.parse(n.now) || Date.now()), B((e) => e || (n.items[0] ? M(n.items[0]) : ""));
		} catch (e) {
			G(K(e, "Could not load the backups."), !0);
		}
	}
	if ((0, C.useEffect)(() => {
		N && q();
	}, []), !N) return /* @__PURE__ */ (0, D.jsx)("p", {
		className: "mx-auto max-w-3xl p-6 text-destructive",
		children: "Only admin logins can see the backups."
	});
	async function J() {
		R(!0), G("Backing up…");
		try {
			await t(e.request("POST", "/api/backups/run")), G("Backup done ✓"), await q();
		} catch (e) {
			G(K(e, "The backup failed."), !0), await q();
		} finally {
			R(!1);
		}
	}
	async function Y(t, n, r) {
		G("Preparing the download…");
		try {
			let i = e.getSession(), a = await fetch(`${e.apiBase()}/api/backups/download?kind=${encodeURIComponent(t)}&stem=${encodeURIComponent(n)}&part=${encodeURIComponent(r)}`, { headers: { Authorization: "Bearer " + i.token } });
			if (!a.ok) throw new e.UserError((await a.json().catch(() => ({}))).error || "Could not download.");
			let o = document.createElement("a");
			o.href = URL.createObjectURL(await a.blob()), o.download = `pms-${n}-${r}.json.gz`, document.body.appendChild(o), o.click(), o.remove(), setTimeout(() => URL.revokeObjectURL(o.href), 4e3), G("");
		} catch (e) {
			G(K(e, "Could not download."), !0);
		}
	}
	async function X() {
		let [n, r] = z.split("|"), i = V.trim();
		if (!r) {
			W({ note: "Pick a backup first." });
			return;
		}
		if (!i) {
			W({ note: "Type an SH number (or # and a slip id)." });
			return;
		}
		let a = i.startsWith("#") ? `id=${encodeURIComponent(i.slice(1))}` : `sh=${encodeURIComponent(i)}`;
		W({ note: "Looking…" });
		try {
			let i = await t(e.request("GET", `/api/backups/slip?kind=${n}&stem=${encodeURIComponent(r)}&${a}`));
			W({
				matches: i.matches,
				at: i.at,
				kind: n,
				stem: r
			});
		} catch (e) {
			W({
				note: K(e, "Could not look in the backup."),
				bad: !0
			});
		}
	}
	async function ue(n, r) {
		if (await w({
			title: `Restore SH ${n.sh_no || ""}?`,
			confirmLabel: "Restore",
			body: `Restore SH ${n.sh_no || ""} (slip #${n.id}) to how it was in this backup?\n\nIt is saved as a NEW version in the slip's History — nothing is lost, and you can make any other version the version in use again.`
		})) try {
			await t(e.request("POST", "/api/backups/restore-slip", {
				kind: r.kind,
				stem: r.stem,
				slip_id: Number(n.id)
			})), G(`SH ${n.sh_no || ""} restored ✓ — see its History on the Slip page.`), await X();
		} catch (e) {
			G(K(e, "Could not restore."), !0);
		}
	}
	let Z = "bad", Q = "No backup yet", $ = null;
	if (F && F.ok_at) {
		let e = se - Date.parse(F.ok_at);
		Z = F.ok === !1 ? "bad" : e <= 54e5 ? "ok" : e <= 108e5 ? "mid" : "bad", Q = F.ok === !1 ? "The last backup FAILED" : e <= 54e5 ? `Healthy — last backup ${A(e)}` : `Late — last backup ${A(e)}`, $ = /* @__PURE__ */ (0, D.jsxs)("div", {
			className: "flex flex-wrap gap-x-5 gap-y-1 text-sm",
			children: [
				/* @__PURE__ */ (0, D.jsxs)("span", { children: ["Last good backup ", /* @__PURE__ */ (0, D.jsx)("b", { children: O(F.ok_at) })] }),
				/* @__PURE__ */ (0, D.jsxs)("span", { children: [
					"Size ",
					/* @__PURE__ */ (0, D.jsx)("b", { children: k(F.bytes) }),
					" compressed"
				] }),
				/* @__PURE__ */ (0, D.jsxs)("span", { children: [
					/* @__PURE__ */ (0, D.jsx)("b", { children: F.rows }),
					" rows · ",
					/* @__PURE__ */ (0, D.jsx)("b", { children: F.tables }),
					" tables"
				] }),
				/* @__PURE__ */ (0, D.jsxs)("span", { children: ["Took ", /* @__PURE__ */ (0, D.jsxs)("b", { children: [F.ms, " ms"] })] })
			]
		});
	} else F && F.ok === !1 && (Q = "The last backup FAILED");
	let de = {
		ok: "bg-ok-soft text-ok",
		mid: "bg-warn-soft text-warn",
		bad: "bg-bad-soft text-destructive"
	}[Z];
	return /* @__PURE__ */ (0, D.jsxs)("div", {
		className: "mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4",
		children: [
			/* @__PURE__ */ (0, D.jsxs)("header", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, D.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, D.jsx)("h1", {
						className: "text-2xl font-bold text-primary",
						children: "Backups"
					}), /* @__PURE__ */ (0, D.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "The PMS saves a full copy of its database every hour (kept 72 hours) and one a day (kept 35 days). Find a slip as it was in any of them and put it back — as a new version, so nothing is lost."
					})]
				}), /* @__PURE__ */ (0, D.jsxs)(d, {
					onClick: J,
					disabled: L,
					children: [/* @__PURE__ */ (0, D.jsx)(u, { className: x("size-4", L && "animate-spin") }), "Back up now"]
				})]
			}),
			I.text && /* @__PURE__ */ (0, D.jsx)("p", {
				role: "status",
				className: x("text-sm font-semibold", I.bad ? "text-destructive" : "text-ok"),
				children: I.text
			}),
			/* @__PURE__ */ (0, D.jsx)(h, { children: /* @__PURE__ */ (0, D.jsxs)(p, {
				className: "grid gap-2",
				children: [
					/* @__PURE__ */ (0, D.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, D.jsx)("span", {
							className: x("rounded-full px-3 py-1 text-sm font-bold", de),
							children: Q
						}), /* @__PURE__ */ (0, D.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: "a backup is made every hour; this turns amber after 90 minutes"
						})]
					}),
					$,
					F && F.ok === !1 && /* @__PURE__ */ (0, D.jsxs)("p", {
						className: "text-sm text-destructive",
						children: [
							F.error || "unknown error",
							" (",
							O(F.failed_at),
							") — it is tried again at the next half hour."
						]
					})
				]
			}) }),
			/* @__PURE__ */ (0, D.jsxs)(h, { children: [/* @__PURE__ */ (0, D.jsx)(m, { children: /* @__PURE__ */ (0, D.jsxs)(f, {
				className: "text-base",
				children: ["Find a slip in a backup ", /* @__PURE__ */ (0, D.jsx)("span", {
					className: "ml-1 text-xs font-normal text-muted-foreground",
					children: "pick the copy, type the SH number (or the slip id), see what restoring would change"
				})]
			}) }), /* @__PURE__ */ (0, D.jsxs)(p, {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, D.jsxs)("form", {
						className: "grid items-end gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_auto]",
						onSubmit: (e) => {
							e.preventDefault(), X();
						},
						children: [
							/* @__PURE__ */ (0, D.jsxs)("div", {
								className: "grid gap-1.5",
								children: [/* @__PURE__ */ (0, D.jsx)(l, {
									htmlFor: "bkPick",
									children: "Backup"
								}), /* @__PURE__ */ (0, D.jsxs)(te, {
									value: z,
									onValueChange: B,
									children: [/* @__PURE__ */ (0, D.jsx)(s, {
										id: "bkPick",
										className: "w-full",
										children: /* @__PURE__ */ (0, D.jsx)(o, { placeholder: "(none yet)" })
									}), /* @__PURE__ */ (0, D.jsx)(c, { children: P.map((e) => /* @__PURE__ */ (0, D.jsx)(ee, {
										value: M(e),
										children: j(e)
									}, M(e))) })]
								})]
							}),
							/* @__PURE__ */ (0, D.jsxs)("div", {
								className: "grid gap-1.5",
								children: [/* @__PURE__ */ (0, D.jsx)(l, {
									htmlFor: "bkQ",
									children: "SH number or slip id"
								}), /* @__PURE__ */ (0, D.jsx)(g, {
									id: "bkQ",
									inputMode: "numeric",
									placeholder: "e.g. 43496",
									autoComplete: "off",
									value: V,
									onChange: (e) => H(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, D.jsx)(d, {
								type: "submit",
								children: "Find"
							})
						]
					}),
					U && "note" in U && /* @__PURE__ */ (0, D.jsx)("p", {
						className: x("text-sm", U.bad ? "text-destructive" : "text-muted-foreground"),
						children: U.note
					}),
					U && "matches" in U && (U.matches.length ? U.matches.map((e) => {
						let t = e.data, n = e.live, r = n ? E(t, n.data) : null, a = !!n && (n.deleted || r && r.length);
						return /* @__PURE__ */ (0, D.jsxs)("div", {
							className: x("grid gap-2 rounded-lg border bg-white p-3", n?.deleted && "border-destructive/50"),
							children: [
								/* @__PURE__ */ (0, D.jsxs)("h3", {
									className: "text-sm font-bold",
									children: [
										"SH ",
										e.sh_no || "—",
										" ",
										/* @__PURE__ */ (0, D.jsxs)("small", {
											className: "font-normal text-muted-foreground",
											children: [
												"· ",
												e.site,
												" · slip #",
												e.id,
												" · ",
												t.building || "no building",
												" · ",
												t.checkin_date || "",
												" → ",
												t.checkout_date || "",
												" (as in the backup of ",
												O(U.at),
												")"
											]
										})
									]
								}),
								n ? n.deleted ? /* @__PURE__ */ (0, D.jsx)("p", {
									className: "text-sm text-destructive",
									children: "This slip is DELETED now — restoring brings it back."
								}) : null : /* @__PURE__ */ (0, D.jsx)("p", {
									className: "text-sm text-destructive",
									children: "This slip no longer exists in the database, so it cannot be restored here."
								}),
								r && r.length > 0 && /* @__PURE__ */ (0, D.jsx)("div", {
									className: "flex flex-wrap gap-1.5",
									children: r.slice(0, 14).map((e) => /* @__PURE__ */ (0, D.jsxs)(S, {
										variant: "secondary",
										className: "whitespace-normal font-normal",
										children: [
											/* @__PURE__ */ (0, D.jsx)("b", { children: e.l }),
											" ",
											e.from,
											" → ",
											e.to
										]
									}, e.l))
								}),
								n && !n.deleted && r && !r.length && /* @__PURE__ */ (0, D.jsx)("p", {
									className: "text-sm text-ok",
									children: "Same as now — nothing to restore."
								}),
								a && /* @__PURE__ */ (0, D.jsxs)("div", {
									className: "flex flex-wrap items-center gap-3",
									children: [/* @__PURE__ */ (0, D.jsx)(d, {
										size: "sm",
										onClick: () => void ue(e, U),
										children: "Restore this state as a new version"
									}), /* @__PURE__ */ (0, D.jsx)("a", {
										className: "text-sm font-semibold text-primary underline",
										href: i("slip", { sh_no: e.sh_no || "" }),
										children: "open the slip"
									})]
								})
							]
						}, e.id);
					}) : /* @__PURE__ */ (0, D.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							"No slip with that SH was in the backup of ",
							O(U.at),
							"."
						]
					}))
				]
			})] }),
			/* @__PURE__ */ (0, D.jsxs)(h, {
				className: "gap-0 py-0",
				children: [/* @__PURE__ */ (0, D.jsx)(m, {
					className: "border-b py-3",
					children: /* @__PURE__ */ (0, D.jsxs)(f, {
						className: "text-base",
						children: ["Saved backups ", /* @__PURE__ */ (0, D.jsx)("span", {
							className: "ml-1 text-xs font-normal text-muted-foreground",
							children: "newest first · times are yours"
						})]
					})
				}), /* @__PURE__ */ (0, D.jsx)(p, {
					className: "overflow-x-auto p-0",
					children: /* @__PURE__ */ (0, D.jsxs)(b, { children: [/* @__PURE__ */ (0, D.jsx)(re, { children: /* @__PURE__ */ (0, D.jsxs)(y, { children: [
						/* @__PURE__ */ (0, D.jsx)(_, { children: "Taken" }),
						/* @__PURE__ */ (0, D.jsx)(_, { children: "Kind" }),
						/* @__PURE__ */ (0, D.jsx)(_, {
							className: "text-right",
							children: "Slips"
						}),
						/* @__PURE__ */ (0, D.jsx)(_, {
							className: "text-right",
							children: "All rows"
						}),
						/* @__PURE__ */ (0, D.jsx)(_, {
							className: "text-right",
							children: "Size"
						}),
						/* @__PURE__ */ (0, D.jsx)(_, { children: "Check" }),
						/* @__PURE__ */ (0, D.jsx)(_, {})
					] }) }), /* @__PURE__ */ (0, D.jsx)(ne, { children: P.length ? P.map((e) => {
						let t = e.parts, n = (t.slips?.rows || 0) + (t.rest?.rows || 0), r = Object.values(t).reduce((e, t) => e + (t.bytes || 0), 0), i = e.kind === "d" ? "Daily" : e.trigger === "manual" ? "Manual" : "Hourly";
						return /* @__PURE__ */ (0, D.jsxs)(y, { children: [
							/* @__PURE__ */ (0, D.jsx)(v, {
								className: "whitespace-nowrap",
								children: O(e.at)
							}),
							/* @__PURE__ */ (0, D.jsx)(v, { children: /* @__PURE__ */ (0, D.jsx)(S, {
								variant: e.kind === "d" ? "default" : "secondary",
								children: i
							}) }),
							/* @__PURE__ */ (0, D.jsx)(v, {
								className: "text-right",
								children: t.slips?.rows ?? "—"
							}),
							/* @__PURE__ */ (0, D.jsx)(v, {
								className: "text-right",
								children: n
							}),
							/* @__PURE__ */ (0, D.jsx)(v, {
								className: "text-right whitespace-nowrap",
								children: k(r)
							}),
							/* @__PURE__ */ (0, D.jsx)(v, { children: /* @__PURE__ */ (0, D.jsx)("code", {
								title: "SHA-256 of the slips file",
								children: (t.slips?.sha || "").slice(0, 8)
							}) }),
							/* @__PURE__ */ (0, D.jsxs)(v, {
								className: "whitespace-nowrap",
								children: [
									/* @__PURE__ */ (0, D.jsx)(d, {
										variant: "link",
										size: "sm",
										onClick: () => {
											B(M(e)), document.getElementById("bkQ")?.focus();
										},
										children: "Find a slip"
									}),
									/* @__PURE__ */ (0, D.jsx)(d, {
										variant: "link",
										size: "sm",
										onClick: () => void Y(e.kind, e.stem, "slips"),
										children: "⬇ slips"
									}),
									/* @__PURE__ */ (0, D.jsx)(d, {
										variant: "link",
										size: "sm",
										onClick: () => void Y(e.kind, e.stem, "rest"),
										children: "⬇ rest"
									})
								]
							})
						] }, M(e));
					}) : /* @__PURE__ */ (0, D.jsx)(y, { children: /* @__PURE__ */ (0, D.jsx)(v, {
						colSpan: 7,
						className: "text-muted-foreground",
						children: "No backups kept yet — the first one is made at the next hour, or press “Back up now”."
					}) }) })] })
				})]
			}),
			/* @__PURE__ */ (0, D.jsx)(h, { children: /* @__PURE__ */ (0, D.jsx)(p, { children: /* @__PURE__ */ (0, D.jsxs)("details", { children: [
				/* @__PURE__ */ (0, D.jsxs)("summary", {
					className: "cursor-pointer",
					children: [/* @__PURE__ */ (0, D.jsx)("b", { children: "Restoring everything" }), " — if the whole database is ever lost"]
				}),
				/* @__PURE__ */ (0, D.jsxs)("ol", {
					className: "mt-2 grid list-decimal gap-2 pl-5 text-sm",
					children: [
						/* @__PURE__ */ (0, D.jsxs)("li", { children: [
							"Do not panic and do not delete anything: switch the PMS to read-only (deploy the Worker with ",
							/* @__PURE__ */ (0, D.jsx)("code", { children: "--var MAINTENANCE:1" }),
							")."
						] }),
						/* @__PURE__ */ (0, D.jsxs)("li", { children: [
							"Download the ",
							/* @__PURE__ */ (0, D.jsx)("b", { children: "slips" }),
							" and ",
							/* @__PURE__ */ (0, D.jsx)("b", { children: "rest" }),
							" files of the backup you want from the table above. The login passwords are in a third file, ",
							/* @__PURE__ */ (0, D.jsx)("b", { children: "auth" }),
							", that this page never shows: fetch it with",
							" ",
							/* @__PURE__ */ (0, D.jsx)("code", {
								className: "break-all",
								children: "npx wrangler kv key get \"bk:h:<time>:auth\" --namespace-id 48710e49e880465987b706a98f70096e --remote > auth.json.gz"
							}),
							" (the time is the one in the key, e.g. 2026-10-23T18-00)."
						] }),
						/* @__PURE__ */ (0, D.jsxs)("li", { children: [
							"Turn them into SQL: ",
							/* @__PURE__ */ (0, D.jsx)("code", {
								className: "break-all",
								children: "node tools/restore-backup.mjs slips.json.gz rest.json.gz auth.json.gz > restore.sql"
							}),
							", create an empty database from ",
							/* @__PURE__ */ (0, D.jsx)("code", { children: "worker/schema.sql" }),
							" and run ",
							/* @__PURE__ */ (0, D.jsx)("code", { children: "restore.sql" }),
							" on it (",
							/* @__PURE__ */ (0, D.jsx)("code", { children: "wrangler d1 execute … --file restore.sql" }),
							")."
						] }),
						/* @__PURE__ */ (0, D.jsxs)("li", { children: [
							"Point the Worker at that database (",
							/* @__PURE__ */ (0, D.jsx)("code", { children: "worker/wrangler.toml" }),
							"), deploy, and switch maintenance off. Cloudflare's own ",
							/* @__PURE__ */ (0, D.jsx)("b", { children: "Time Travel" }),
							" (any minute of the last 7 days) is the other way back: ",
							/* @__PURE__ */ (0, D.jsx)("code", {
								className: "break-all",
								children: "wrangler d1 time-travel restore pms-weur --timestamp=…"
							}),
							"."
						] })
					]
				}),
				/* @__PURE__ */ (0, D.jsxs)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: [
						"One slip, or a few slips deleted or edited by mistake, do not need any of this: use ",
						/* @__PURE__ */ (0, D.jsx)("b", { children: "Find a slip in a backup" }),
						" above."
					]
				})
			] }) }) }),
			T
		]
	});
}
export { N as default };
