import { f as e, h as t, i as n, n as r, p as i, r as a, u as o } from "./PmsContext-BVMd13Oi.js";
import { t as s } from "./undo-2-WssTO3qI.js";
import { t as c } from "./button-BGWa3SLr.js";
import { n as l, t as u } from "./card-B9_OGomP.js";
import { a as d, n as f, o as p, r as m, s as h, t as g } from "./table-DKR1WqRT.js";
import { t as _ } from "./ConfirmDialog-GfriOiUy.js";
// src/lib/alloclog.ts
var v = /* @__PURE__ */ t(i(), 1), y = {
	planner: "Building planner",
	"allocate-day": "Day's check-ins",
	delay: "Delayed departures"
};
function b(e) {
	let t = (t) => (e.rooms?.[t] || []).filter((e) => String(e.room_no || "").trim()).map((e) => ({
		room_no: String(e.room_no).trim(),
		capacity: e.capacity ?? "",
		assigned: e.assigned ?? "",
		...e.gl ? { gl: !0 } : {},
		...e.out ? {
			out: {
				date: e.out.date || "",
				time: e.out.time || ""
			},
			out_status: e.out_status || "confirmed"
		} : {}
	}));
	return {
		building: String(e.building || "").trim(),
		rooms: {
			gents: t("gents"),
			ladies: t("ladies")
		},
		checkout_date: e.checkout_date || "",
		checkout_time: e.checkout_time || "",
		delayed: e.delayed && e.delayed.on ? e.delayed : null
	};
}
function x(e, t) {
	let n = ["gents", "ladies"].some((e) => (t.rooms?.[e] || []).some((e) => e.out)), r = (e) => n ? e : {
		gents: e.gents.map(({ out: e, out_status: t, ...n }) => n),
		ladies: e.ladies.map(({ out: e, out_status: t, ...n }) => n)
	};
	return Object.keys(t).every((n) => JSON.stringify(n === "rooms" ? r(e.rooms) : e[n]) === JSON.stringify(t[n]));
}
var S = (e) => {
	let t = (t) => e.rooms[t].map((e) => e.room_no + (e.out ? `→${String(e.out.date).slice(8, 10)}/${String(e.out.date).slice(5, 7)} ${e.out.time}${e.out_status && e.out_status !== "confirmed" ? ` (${e.out_status})` : ""}` : "")).join(", "), n = [t("gents") && `G ${t("gents")}`, t("ladies") && `L ${t("ladies")}`].filter(Boolean);
	return `${e.building || "no building"}${n.length ? ` · ${n.join(" · ")}` : ""}`;
};
async function C(e, t, n, r, i) {
	let a = i.map(([e, t]) => ({
		id: e.id,
		sh: String(e.sh_no ?? ""),
		before: b(e),
		after: b(t)
	}));
	if (a.length) {
		try {
			await e.request("POST", "/api/alloc-log", {
				site: t,
				kind: n,
				note: r,
				changes: a
			});
		} catch (e) {
			console.warn("alloc log", e);
		}
		window.dispatchEvent(new Event("pms:alloc-log"));
	}
}
// src/components/AllocLog.tsx
var w = e(), T = (e) => e ? new Date(e).toLocaleString(void 0, {
	day: "2-digit",
	month: "short",
	hour: "2-digit",
	minute: "2-digit"
}) : "";
function E() {
	let { cloud: e } = r(), t = a(), i = n(), { siteId: C } = o(), { ask: E, dialog: D } = _(), [O, k] = (0, v.useState)(null), [A, j] = (0, v.useState)(""), [M, N] = (0, v.useState)(""), P = (0, v.useCallback)(async () => {
		try {
			k((await i(e.request("GET", `/api/alloc-log?site=${C}`))).log || []), j("");
		} catch (e) {
			j(`The log is not available right now (${e?.message || e}).`);
		}
	}, [C]);
	(0, v.useEffect)(() => (P(), window.addEventListener("pms:alloc-log", P), () => window.removeEventListener("pms:alloc-log", P)), [P]);
	async function F(n) {
		if (!await E({
			title: "Undo this change?",
			confirmLabel: "Undo",
			body: `Undo “${y[n.kind] || n.kind}” from ${T(n.created_at)} (${n.count} slip${n.count === 1 ? "" : "s"})?\n\nEach slip gets back its building and rooms as they were, unless it was changed since.`
		})) return;
		let r = new Map((await i(t.all())).map((e) => [e.id, e])), a = [], o = [], s = [];
		for (let e of n.changes) {
			let t = r.get(e.id);
			if (!t) {
				s.push(e.sh);
				continue;
			}
			if (!x(b(t), e.after)) {
				o.push(e.sh);
				continue;
			}
			let n = e.before;
			a.push({
				...t,
				building: n.building,
				rooms: {
					gents: n.rooms.gents,
					ladies: n.rooms.ladies
				},
				..."checkout_date" in n ? {
					checkout_date: n.checkout_date,
					checkout_time: n.checkout_time
				} : {},
				..."delayed" in n ? { delayed: n.delayed } : {}
			});
		}
		try {
			let r = a.length ? await i(t.bulkWrite({ put: a }, "alloc-undo")) : { updated: 0 }, c = `Restored ${r.updated} slip${r.updated === 1 ? "" : "s"}.` + (o.length ? ` Left ${o.length} changed since (SH ${o.join(", ")}).` : "") + (s.length ? ` ${s.length} no longer there (SH ${s.join(", ")}).` : "");
			k((await i(e.request("POST", `/api/alloc-log/${n.id}/undo`, { note: c }))).log || O), N(c), window.dispatchEvent(new Event("pms:alloc-undone"));
		} catch (e) {
			N(e?.message || String(e)), P();
		}
	}
	return /* @__PURE__ */ (0, w.jsx)(u, { children: /* @__PURE__ */ (0, w.jsxs)(l, {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, w.jsxs)("div", { children: [/* @__PURE__ */ (0, w.jsx)("h2", {
				className: "text-base font-bold text-primary",
				children: "🧾 Bulk changes"
			}), /* @__PURE__ */ (0, w.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [
					"Every “Write building” and “Apply allocations” made here, newest first, for every desk. ",
					/* @__PURE__ */ (0, w.jsx)("b", { children: "Undo" }),
					" puts back each slip's building and rooms as they were — except slips changed since then, which are left alone and listed."
				]
			})] }),
			M && /* @__PURE__ */ (0, w.jsx)("p", {
				role: "status",
				className: "text-sm font-semibold text-ok",
				children: M
			}),
			A ? /* @__PURE__ */ (0, w.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: A
			}) : O === null ? /* @__PURE__ */ (0, w.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Loading…"
			}) : O.length ? O.map((e) => /* @__PURE__ */ (0, w.jsxs)("details", {
				className: `rounded-lg border bg-white ${e.undone_at ? "opacity-60" : ""}`,
				children: [
					/* @__PURE__ */ (0, w.jsxs)("summary", {
						className: "flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 p-2.5 text-sm",
						children: [
							/* @__PURE__ */ (0, w.jsx)("span", {
								className: "text-muted-foreground",
								children: T(e.created_at)
							}),
							/* @__PURE__ */ (0, w.jsx)("b", { children: y[e.kind] || e.kind }),
							/* @__PURE__ */ (0, w.jsxs)("span", {
								className: "min-w-0 flex-1 text-muted-foreground",
								children: [
									e.note,
									" · ",
									e.count,
									" slip",
									e.count === 1 ? "" : "s",
									" · by ",
									e.by_name || "—"
								]
							}),
							e.undone_at ? /* @__PURE__ */ (0, w.jsxs)("span", {
								className: "text-xs font-semibold text-warn",
								children: [
									"Undone ",
									T(e.undone_at),
									" by ",
									e.undone_by_name || "—"
								]
							}) : t.readonly ? null : /* @__PURE__ */ (0, w.jsxs)(c, {
								variant: "outline",
								size: "sm",
								onClick: (t) => {
									t.preventDefault(), F(e);
								},
								children: [/* @__PURE__ */ (0, w.jsx)(s, { className: "size-4" }), "Undo"]
							})
						]
					}),
					e.undo_note && /* @__PURE__ */ (0, w.jsx)("p", {
						className: "px-3 pb-2 text-sm text-muted-foreground",
						children: e.undo_note
					}),
					/* @__PURE__ */ (0, w.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, w.jsxs)(g, { children: [/* @__PURE__ */ (0, w.jsx)(p, { children: /* @__PURE__ */ (0, w.jsxs)(h, { children: [
							/* @__PURE__ */ (0, w.jsx)(d, { children: "SH" }),
							/* @__PURE__ */ (0, w.jsx)(d, { children: "Before" }),
							/* @__PURE__ */ (0, w.jsx)(d, { children: "After" })
						] }) }), /* @__PURE__ */ (0, w.jsx)(f, { children: e.changes.map((e, t) => /* @__PURE__ */ (0, w.jsxs)(h, { children: [
							/* @__PURE__ */ (0, w.jsx)(m, {
								className: "font-bold",
								children: e.sh
							}),
							/* @__PURE__ */ (0, w.jsx)(m, { children: S(e.before) }),
							/* @__PURE__ */ (0, w.jsx)(m, { children: S(e.after) })
						] }, t)) })] })
					})
				]
			}, e.id)) : /* @__PURE__ */ (0, w.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No bulk changes yet."
			}),
			D
		]
	}) });
}
export { C as n, E as t };
