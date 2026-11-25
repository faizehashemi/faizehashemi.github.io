import { a as e, f as t, h as n, i as r, n as i, p as a, r as o, u as s } from "./PmsContext-BVMd13Oi.js";
import { t as c } from "./useQuery-BUXPY6q6.js";
import { t as l } from "./checkbox-C3tIiLfF.js";
import { t as u } from "./label-CMEyi--P.js";
import { t as d } from "./button-BGWa3SLr.js";
import { t as f } from "./card-B9_OGomP.js";
import { t as p } from "./input-DSBk_UeU.js";
import { a as m, n as h, o as g, r as _, s as v, t as y } from "./table-DKR1WqRT.js";
import { t as b } from "./utils-b7UP9Cmo.js";
import { t as x } from "./ConfirmDialog-GfriOiUy.js";
import { t as S } from "./PromptDialog-D_1ik4AU.js";
// src/pages/admin/AdminPage.tsx
var C = /* @__PURE__ */ n(a(), 1), w = t(), T = (e) => {
	let t = new Date(e);
	return isNaN(+t) ? "" : new Intl.DateTimeFormat(void 0, {
		dateStyle: "medium",
		timeStyle: "short"
	}).format(t);
}, E = (e) => [...new Set([...e.rooms?.gents || [], ...e.rooms?.ladies || []].map((e) => String(e.room_no || "").trim()).filter(Boolean))], D = (e, t) => e ? T(/* @__PURE__ */ new Date(`${e}T${t || "00:00"}`)) : "";
function O() {
	let { cloud: t, stay: n } = i(), a = o(), O = r(), k = e(), { site: A, siteId: j } = s(), { ask: M, dialog: N } = x(), { ask: P, dialog: ee } = S(), F = c({
		queryKey: ["admin-slips", j],
		queryFn: async () => await O(a.all())
	}), [I, L] = (0, C.useState)({
		q: "",
		room: "",
		bld: "",
		from: "",
		to: ""
	}), [R, z] = (0, C.useState)(/* @__PURE__ */ new Set()), [B, V] = (0, C.useState)(null), [te, H] = (0, C.useState)(""), U = (0, C.useRef)(null), W = F.data ?? [], G = () => a.readonly ? (H(a.readonlyReason), !0) : !1, K = (0, C.useMemo)(() => [...new Set(W.map((e) => (e.building || "").trim()).filter(Boolean))].sort(), [W]), q = (0, C.useMemo)(() => {
		let e = I.q.trim().toLowerCase(), t = I.room.trim().toLowerCase(), n = I.from ? /* @__PURE__ */ new Date(I.from + "T00:00") : null, r = I.to ? /* @__PURE__ */ new Date(I.to + "T23:59:59") : null;
		return W.filter((i) => !(I.bld && (i.building || "").trim() !== I.bld || n && new Date(i.createdAt) < n || r && new Date(i.createdAt) > r || e && ![
			i.tour_name || "",
			i.group_leader || "",
			i.building || "",
			String(i.sh_no || ""),
			String(i.total || "")
		].join(" ").toLowerCase().includes(e) || t && !E(i).some((e) => e.toLowerCase().includes(t)))).sort((e, t) => e.createdAt > t.createdAt ? -1 : 1);
	}, [W, I]), J = (e) => (t) => {
		L((n) => ({
			...n,
			[e]: t.target.value
		})), z(/* @__PURE__ */ new Set());
	}, Y = async () => {
		V(null), await F.refetch();
	};
	async function X() {
		if (G()) return;
		let e = [...R];
		if (!e.length) {
			H("Select at least one slip to delete.");
			return;
		}
		if (!await M({
			title: `Delete ${e.length} selected slip(s)?`,
			body: "They can be put back from Deleted slips below.",
			confirmLabel: "Delete"
		})) return;
		let t = 0, n = 0;
		for (let r of e) try {
			await a.remove(r), t++;
		} catch {
			n++;
		}
		z(/* @__PURE__ */ new Set()), await Y(), H(`Deleted ${t} slip(s). ${n ? n + " failed." : ""}`);
	}
	let [Z, ne] = (0, C.useState)(null), Q = async () => {
		try {
			ne((await O(t.request("GET", `/api/slips/deleted?site=${j}`))).slips);
		} catch (e) {
			H(e.message || "Could not load the deleted slips.");
		}
	}, re = (e) => {
		let t = /* @__PURE__ */ new Set();
		for (let r of n.rowsOf(e)) {
			if (!r.start || !r.end || r.block <= 0) continue;
			let e = n.roomsUse(W, r.building, r.start, r.end).get(String(r.room_no).toUpperCase().replace(/\s+/g, ""));
			e?.who.length && t.add(`Room ${r.room_no}: ${[...new Set(e.who.map((e) => `SH ${e.sh}`))].join(", ")}`);
		}
		return [...t];
	};
	async function ie(e) {
		if (G()) return;
		let t = re(e);
		if (await M({
			title: `Restore SH ${e.sh_no || e.id}?`,
			confirmLabel: "Restore",
			body: [
				`${e.tour_name || "—"} · ${D(e.checkin_date, e.checkin_time)} → ${D(e.checkout_date, e.checkout_time)}`,
				"It counts again in rooms, meals and every other page.",
				...t.length ? [
					"",
					"These rooms are also booked now — check beds and change rooms if needed:",
					...t
				] : []
			].join("\n")
		})) try {
			await a.restore(e.id), await Y(), await Q(), H(`SH ${e.sh_no || e.id} restored.`);
		} catch (e) {
			H(e.message || "Could not restore the slip.");
		}
	}
	async function ae() {
		if (!G() && await P({
			title: `Type DELETE to erase ALL ${A.label} slips for every desk.`,
			body: "No backsies."
		}) === "DELETE") try {
			let { deleted: e } = await a.clear();
			await Y(), H(`Deleted ${e} ${A.label} slip(s).`);
		} catch (e) {
			H(e.message);
		}
	}
	async function oe() {
		let e = await O(a.all()), t = new Blob([JSON.stringify({
			exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
			site: j,
			count: e.length,
			slips: e
		}, null, 2)], { type: "application/json" }), n = document.createElement("a");
		n.href = URL.createObjectURL(t), n.download = `pms_slips_${j}_backup_${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.json`, document.body.appendChild(n), n.click(), n.remove();
	}
	async function se(e) {
		if (e) try {
			let t = JSON.parse(await e.text()), n = Array.isArray(t) ? t : t.slips || t.db?.stores?.slips?.rows || [];
			if (!Array.isArray(n) || !n.length) {
				H("No slips found in file.");
				return;
			}
			let { siteOfBuilding: r } = await k("config.js"), i = n.filter((e) => (e.site || r(e.building) || j) === j), o = n.length - i.length;
			if (!i.length) {
				H(`All ${n.length} slip(s) in this file belong to the other site. Import them from that site.`);
				return;
			}
			if (!await M({
				title: `${i.length} ${A.label} slip(s) to import${o ? ` (${o} of the other site will be left out)` : ""}`,
				body: "Add to existing, or replace all of this site's slips first?",
				confirmLabel: "Add to existing"
			})) {
				if (await P({ title: `Type REPLACE to delete ALL ${A.label} slips for every desk, then import.` }) !== "REPLACE") return;
				await a.clear();
			}
			let s = await a.bulkWrite({ add: i.map(({ id: e, _v: t, _seq: n, ...r }) => ({
				...r,
				site: j
			})) }, "json-import");
			await Y(), H(`Imported ${s.created} slip(s)${s.skipped ? `, ${s.skipped} already there` : ""}${o ? `, ${o} of the other site left out` : ""}.`);
		} catch (e) {
			H("Import failed: " + (e.message || e));
		} finally {
			U.current && (U.current.value = "");
		}
	}
	let $ = (e, t) => /* @__PURE__ */ (0, w.jsxs)("div", {
		className: "grid gap-1",
		children: [/* @__PURE__ */ (0, w.jsx)(u, { children: e }), t]
	});
	return /* @__PURE__ */ (0, w.jsxs)("div", {
		className: "mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4",
		children: [
			/* @__PURE__ */ (0, w.jsx)("h1", {
				className: "text-2xl font-bold text-primary print:text-black",
				children: "Slip Admin — Delete & Backup"
			}),
			/* @__PURE__ */ (0, w.jsxs)("div", {
				className: "grid grid-cols-2 items-end gap-3 sm:grid-cols-3 lg:grid-cols-5 print:hidden",
				children: [
					$("Search (tour / leader / building / SH)", /* @__PURE__ */ (0, w.jsx)(p, {
						placeholder: "type to filter…",
						value: I.q,
						onChange: J("q")
					})),
					$("Search by room", /* @__PURE__ */ (0, w.jsx)(p, {
						placeholder: "e.g., 501 or 12A",
						value: I.room,
						onChange: J("room")
					})),
					$("Building", /* @__PURE__ */ (0, w.jsxs)("select", {
						className: "h-9 rounded-md border bg-background px-2 text-sm",
						value: I.bld,
						onChange: J("bld"),
						children: [/* @__PURE__ */ (0, w.jsx)("option", {
							value: "",
							children: "All buildings"
						}), K.map((e) => /* @__PURE__ */ (0, w.jsx)("option", { children: e }, e))]
					})),
					$("Created from", /* @__PURE__ */ (0, w.jsx)(p, {
						type: "date",
						value: I.from,
						onChange: J("from")
					})),
					$("Created to", /* @__PURE__ */ (0, w.jsx)(p, {
						type: "date",
						value: I.to,
						onChange: J("to")
					})),
					/* @__PURE__ */ (0, w.jsxs)("div", {
						className: "col-span-full flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, w.jsx)(d, {
								variant: "outline",
								onClick: () => void Y(),
								children: "Refresh"
							}),
							/* @__PURE__ */ (0, w.jsx)(d, {
								variant: "outline",
								onClick: () => void oe(),
								children: "Export JSON"
							}),
							/* @__PURE__ */ (0, w.jsx)("input", {
								ref: U,
								hidden: !0,
								type: "file",
								accept: "application/json",
								onChange: (e) => void se(e.target.files?.[0])
							}),
							/* @__PURE__ */ (0, w.jsx)(d, {
								variant: "outline",
								onClick: () => {
									G() || U.current?.click();
								},
								children: "Import JSON"
							}),
							/* @__PURE__ */ (0, w.jsx)(d, {
								variant: "outline",
								onClick: () => window.print(),
								children: "Print List"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, w.jsxs)("div", {
				className: "grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_22rem]",
				children: [/* @__PURE__ */ (0, w.jsxs)("div", {
					className: "grid gap-2",
					children: [/* @__PURE__ */ (0, w.jsxs)(y, { children: [/* @__PURE__ */ (0, w.jsx)(g, { children: /* @__PURE__ */ (0, w.jsxs)(v, { children: [
						/* @__PURE__ */ (0, w.jsx)(m, {
							className: "w-9 print:hidden",
							children: /* @__PURE__ */ (0, w.jsx)(l, {
								"aria-label": "Select all",
								checked: q.length > 0 && R.size === q.length,
								onCheckedChange: (e) => z(e === !0 ? new Set(q.map((e) => e.id)) : /* @__PURE__ */ new Set())
							})
						}),
						/* @__PURE__ */ (0, w.jsx)(m, { children: "ID" }),
						/* @__PURE__ */ (0, w.jsx)(m, { children: "Tour" }),
						/* @__PURE__ */ (0, w.jsx)(m, { children: "Leader" }),
						/* @__PURE__ */ (0, w.jsx)(m, { children: "Building" }),
						/* @__PURE__ */ (0, w.jsx)(m, { children: "SH" }),
						/* @__PURE__ */ (0, w.jsx)(m, { children: "Check-in" }),
						/* @__PURE__ */ (0, w.jsx)(m, { children: "Check-out" }),
						/* @__PURE__ */ (0, w.jsx)(m, { children: "Created" })
					] }) }), /* @__PURE__ */ (0, w.jsx)(h, { children: q.map((e) => /* @__PURE__ */ (0, w.jsxs)(v, {
						className: b("cursor-pointer", B?.id === e.id && "bg-accent"),
						onClick: () => V(e),
						children: [
							/* @__PURE__ */ (0, w.jsx)(_, {
								className: "print:hidden",
								onClick: (e) => e.stopPropagation(),
								children: /* @__PURE__ */ (0, w.jsx)(l, {
									"aria-label": `Select ${e.id}`,
									checked: R.has(e.id),
									onCheckedChange: (t) => z((n) => {
										let r = new Set(n);
										return t === !0 ? r.add(e.id) : r.delete(e.id), r;
									})
								})
							}),
							/* @__PURE__ */ (0, w.jsx)(_, { children: e.id }),
							/* @__PURE__ */ (0, w.jsx)(_, { children: e.tour_name || "" }),
							/* @__PURE__ */ (0, w.jsx)(_, { children: e.group_leader || "" }),
							/* @__PURE__ */ (0, w.jsx)(_, { children: (e.building || "").trim() }),
							/* @__PURE__ */ (0, w.jsx)(_, { children: e.sh_no ?? "" }),
							/* @__PURE__ */ (0, w.jsx)(_, { children: D(e.checkin_date, e.checkin_time) }),
							/* @__PURE__ */ (0, w.jsx)(_, { children: D(e.checkout_date, e.checkout_time) }),
							/* @__PURE__ */ (0, w.jsx)(_, { children: T(e.createdAt) })
						]
					}, e.id)) })] }), /* @__PURE__ */ (0, w.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2 print:hidden",
						children: [
							/* @__PURE__ */ (0, w.jsx)(d, {
								variant: "outline",
								className: "text-destructive",
								onClick: () => void X(),
								children: "Delete selected"
							}),
							/* @__PURE__ */ (0, w.jsx)(d, {
								variant: "outline",
								className: "text-destructive",
								onClick: () => void ae(),
								children: "Delete ALL"
							}),
							/* @__PURE__ */ (0, w.jsxs)("span", {
								className: "text-sm text-muted-foreground",
								children: [q.length, " slip(s) shown"]
							})
						]
					})]
				}), /* @__PURE__ */ (0, w.jsxs)(f, {
					className: "gap-1 p-3 text-sm print:hidden",
					children: [/* @__PURE__ */ (0, w.jsx)("h3", {
						className: "font-bold",
						children: "Preview"
					}), B ? (() => {
						let e = B, t = (e) => `${e.room_no || ""} (cap ${e.capacity ?? "?"})`;
						return /* @__PURE__ */ (0, w.jsxs)("div", {
							className: "grid gap-1",
							children: [
								/* @__PURE__ */ (0, w.jsxs)("div", { children: [
									/* @__PURE__ */ (0, w.jsx)("b", { children: "ID" }),
									" #",
									e.id,
									" · ",
									/* @__PURE__ */ (0, w.jsx)("b", { children: "Created" }),
									" ",
									T(e.createdAt),
									e.updatedAt ? /* @__PURE__ */ (0, w.jsxs)(w.Fragment, { children: [
										" · ",
										/* @__PURE__ */ (0, w.jsx)("b", { children: "Updated" }),
										" ",
										T(e.updatedAt)
									] }) : null
								] }),
								/* @__PURE__ */ (0, w.jsxs)("div", { children: [
									/* @__PURE__ */ (0, w.jsx)("b", { children: "Tour:" }),
									" ",
									e.tour_name
								] }),
								/* @__PURE__ */ (0, w.jsxs)("div", { children: [
									/* @__PURE__ */ (0, w.jsx)("b", { children: "Leader:" }),
									" ",
									e.group_leader
								] }),
								/* @__PURE__ */ (0, w.jsxs)("div", { children: [
									/* @__PURE__ */ (0, w.jsx)("b", { children: "Building:" }),
									" ",
									(e.building || "").trim(),
									" \xA0 ",
									/* @__PURE__ */ (0, w.jsx)("b", { children: "SH:" }),
									" ",
									e.sh_no ?? ""
								] }),
								/* @__PURE__ */ (0, w.jsxs)("div", { children: [
									/* @__PURE__ */ (0, w.jsx)("b", { children: "Check-in:" }),
									" ",
									e.checkin_date,
									" ",
									e.checkin_time
								] }),
								/* @__PURE__ */ (0, w.jsxs)("div", { children: [
									/* @__PURE__ */ (0, w.jsx)("b", { children: "Check-out:" }),
									" ",
									e.checkout_date,
									" ",
									e.checkout_time
								] }),
								/* @__PURE__ */ (0, w.jsxs)("div", {
									className: "mt-1",
									children: [
										/* @__PURE__ */ (0, w.jsx)("b", { children: "Rooms:" }),
										" ",
										E(e).join(", ") || "—"
									]
								}),
								/* @__PURE__ */ (0, w.jsxs)("div", { children: [
									/* @__PURE__ */ (0, w.jsx)("b", { children: "Gents rooms:" }),
									" ",
									(e.rooms?.gents || []).map(t).join(", ") || "—"
								] }),
								/* @__PURE__ */ (0, w.jsxs)("div", { children: [
									/* @__PURE__ */ (0, w.jsx)("b", { children: "Ladies rooms:" }),
									" ",
									(e.rooms?.ladies || []).map(t).join(", ") || "—"
								] }),
								/* @__PURE__ */ (0, w.jsxs)("div", {
									className: "mt-1",
									children: [
										/* @__PURE__ */ (0, w.jsx)("b", { children: "Totals:" }),
										" Total ",
										e.total ?? "",
										" | Gents ",
										e.gents ?? "",
										" | Ladies ",
										e.ladies ?? "",
										" | Children ",
										e.children ?? "",
										" | Infants ",
										e.infants ?? ""
									]
								})
							]
						});
					})() : /* @__PURE__ */ (0, w.jsx)("p", {
						className: "text-muted-foreground",
						children: "Select a row to preview its details."
					})]
				})]
			}),
			/* @__PURE__ */ (0, w.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: te || `${W.length} ${A.label} slip(s).${a.readonly ? " " + a.readonlyReason : ""}`
			}),
			/* @__PURE__ */ (0, w.jsxs)(f, {
				className: "gap-2 p-3 print:hidden",
				children: [/* @__PURE__ */ (0, w.jsxs)("div", {
					className: "flex flex-wrap items-center gap-3",
					children: [
						/* @__PURE__ */ (0, w.jsx)("h2", {
							className: "font-bold",
							children: "Deleted slips"
						}),
						/* @__PURE__ */ (0, w.jsx)(d, {
							variant: "outline",
							size: "sm",
							onClick: () => void Q(),
							children: Z ? "Refresh" : "Show deleted slips"
						}),
						Z && /* @__PURE__ */ (0, w.jsxs)("span", {
							className: "text-sm text-muted-foreground",
							children: [
								Z.length,
								" deleted, newest first",
								Z.length === 300 ? " (latest 300)" : ""
							]
						})
					]
				}), Z && (Z.length ? /* @__PURE__ */ (0, w.jsx)("div", {
					className: "max-h-[50vh] overflow-auto",
					children: /* @__PURE__ */ (0, w.jsxs)(y, { children: [/* @__PURE__ */ (0, w.jsx)(g, { children: /* @__PURE__ */ (0, w.jsxs)(v, { children: [
						/* @__PURE__ */ (0, w.jsx)(m, { children: "SH" }),
						/* @__PURE__ */ (0, w.jsx)(m, { children: "Group · leader" }),
						/* @__PURE__ */ (0, w.jsx)(m, { children: "Building · rooms" }),
						/* @__PURE__ */ (0, w.jsx)(m, { children: "Stay" }),
						/* @__PURE__ */ (0, w.jsx)(m, { children: "Deleted" }),
						/* @__PURE__ */ (0, w.jsx)(m, {})
					] }) }), /* @__PURE__ */ (0, w.jsx)(h, { children: Z.map((e) => /* @__PURE__ */ (0, w.jsxs)(v, { children: [
						/* @__PURE__ */ (0, w.jsx)(_, { children: /* @__PURE__ */ (0, w.jsx)("b", { children: e.sh_no || `#${e.id}` }) }),
						/* @__PURE__ */ (0, w.jsxs)(_, { children: [e.tour_name || "—", /* @__PURE__ */ (0, w.jsx)("small", {
							className: "block text-muted-foreground",
							children: e.group_leader || "—"
						})] }),
						/* @__PURE__ */ (0, w.jsxs)(_, { children: [(e.building || "").trim() || "—", /* @__PURE__ */ (0, w.jsx)("small", {
							className: "block text-muted-foreground",
							children: E(e).join(", ")
						})] }),
						/* @__PURE__ */ (0, w.jsxs)(_, {
							className: "whitespace-nowrap",
							children: [D(e.checkin_date, e.checkin_time), /* @__PURE__ */ (0, w.jsx)("small", {
								className: "block text-muted-foreground",
								children: D(e.checkout_date, e.checkout_time)
							})]
						}),
						/* @__PURE__ */ (0, w.jsxs)(_, {
							className: "whitespace-nowrap",
							children: [T(e.deleted_at), /* @__PURE__ */ (0, w.jsx)("small", {
								className: "block text-muted-foreground",
								children: e.deleted_by || ""
							})]
						}),
						/* @__PURE__ */ (0, w.jsx)(_, { children: /* @__PURE__ */ (0, w.jsx)(d, {
							size: "sm",
							variant: "outline",
							disabled: !!a.readonly,
							onClick: () => void ie(e),
							children: "Restore"
						}) })
					] }, e.id)) })] })
				}) : /* @__PURE__ */ (0, w.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No deleted slips."
				}))]
			}),
			N,
			ee
		]
	});
}
export { O as default };
