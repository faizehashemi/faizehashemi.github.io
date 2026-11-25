import { a as e, c as t, f as n, h as r, i, n as a, o, p as s, r as c, s as l, u as ee } from "./PmsContext-BVMd13Oi.js";
import { a as u, i as d, n as f, r as p, t as te } from "./select-VcH2xuqJ.js";
import { a as m, i as ne, n as re, o as ie, t as ae } from "./dialog-DtgtvZ4Q.js";
import { t as oe } from "./checkbox-C3tIiLfF.js";
import { t as h } from "./label-CMEyi--P.js";
import { t as g } from "./createLucideIcon-CQUC5AEZ.js";
import { n as _, t as se } from "./DayNav-CaC48u7r.js";
import { t as v } from "./plus-CPwEqLyF.js";
import { t as ce } from "./trash-8ywHN_MU.js";
import { t as y } from "./button-BGWa3SLr.js";
import { i as le, n as ue, r as de, t as fe } from "./card-B9_OGomP.js";
import { t as b } from "./input-DSBk_UeU.js";
import { a as x, n as pe, o as me, r as S, s as he, t as ge } from "./table-DKR1WqRT.js";
import { t as C } from "./utils-b7UP9Cmo.js";
import { t as _e } from "./ConfirmDialog-GfriOiUy.js";
import { t as ve } from "./PromptDialog-D_1ik4AU.js";
import { t as ye } from "./badge-EB7Muw37.js";
// node_modules/lucide-react/dist/esm/icons/pencil.mjs
var w = {
	name: "pencil",
	size: 24,
	node: [["path", {
		d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
		key: "1a8usu"
	}], ["path", {
		d: "m15 5 4 4",
		key: "1mk7zo"
	}]]
};
w.node;
var be = g(w), T = /* @__PURE__ */ r(s(), 1), E = n(), xe = {
	operator: "Tour operator",
	leader: "Group leader"
}, Se = {
	from: "now",
	to_day: 1,
	to_time: "23:59"
}, D = "border-gold bg-accent";
function O() {
	let { cloud: n, transport: r, rooms: s, ums: g } = a(), v = r, w = c(), O = i(), we = t(), Te = o(), Ee = e(), { siteId: k } = ee(), { href: A, navigate: De } = l(), { ask: j, dialog: Oe } = _e(), { ask: M, dialog: ke } = ve(), N = /^\d{4}-\d{2}-\d{2}$/.test(we.get("day") || "") ? we.get("day") : v.today(), P = n.canWrite(k), F = n.currentDesk(), [I, Ae] = (0, T.useState)({
		rows: [],
		version: 0
	}), [je, Me] = (0, T.useState)([]), [Ne, Pe] = (0, T.useState)("sign"), [Fe, Ie] = (0, T.useState)(""), [Le, Re] = (0, T.useState)(() => {
		try {
			return localStorage.getItem("pms_tp_rooms") === "1";
		} catch {
			return !1;
		}
	}), ze = (e) => {
		Re(e);
		try {
			localStorage.setItem("pms_tp_rooms", e ? "1" : "0");
		} catch {}
	}, [Be, Ve] = (0, T.useState)([]);
	(0, T.useEffect)(() => {
		O(w.all()).then((e) => Ve(e.filter((e) => !e.deleted)), () => Ve([]));
	}, [N]);
	let [He, Ue] = (0, T.useState)(null), [L, We] = (0, T.useState)(!1), [Ge, Ke] = (0, T.useState)(!1), [qe, Je] = (0, T.useState)([]), [Ye, Xe] = (0, T.useState)(null), [Ze, Qe] = (0, T.useState)(null), [$e, et] = (0, T.useState)(!1), [R, tt] = (0, T.useState)(null), nt = (0, T.useRef)(!1), rt = (0, T.useRef)(I);
	rt.current = I;
	let z = (e, t = "ok") => Ue(e ? {
		text: e,
		kind: t
	} : null), B = I.rows, V = (0, T.useMemo)(() => v.resolve(B), [B]), [it, at] = (0, T.useState)({}), ot = F?.role === "admin" || F?.role === "siteadmin", H = (e) => e && it[e] || v.BUS_LIMIT, U = (e, t = B) => H((t === B ? V : v.resolve(t)).get(e.key)?.dest);
	async function st(e, t) {
		let r = await M({
			title: `Bus limit — ${t}`,
			body: `The most pax one bus may carry to ${t} (1–120). Desks cannot put more on a bus. Cars and trains have no limit.`,
			value: String(H(e)),
			type: "number"
		});
		if (r === null) return;
		let i = parseInt(String(r), 10);
		if (!Number.isInteger(i) || i < 1 || i > 120) z("Type a whole number from 1 to 120.", "bad");
		else try {
			let r = await O(n.request("PUT", "/api/settings", {
				settings: { bus_limits: {
					...it,
					[e]: i
				} },
				site: k
			}));
			at(r.settings?.bus_limits || {}), z(`${t}: a bus now carries at most ${i} pax.`);
		} catch (e) {
			z(e.message || "Could not save the limit.", "bad");
		}
	}
	let ct = (0, T.useMemo)(() => v.signage(B, k), [B, k]), lt = (e) => v.fleetText(e, "0 buses"), ut = (0, T.useMemo)(() => {
		let e = /* @__PURE__ */ new Date();
		return e.setMinutes(e.getMinutes() - e.getTimezoneOffset()), e.toISOString().slice(0, 16);
	}, [B]), dt = Fe.trim().toLowerCase(), ft = (e) => !dt || [
		e.ref,
		e.operator,
		e.leader,
		e.transporter,
		e.vch,
		e.dora,
		e.route,
		e.remarks,
		...e.rooms || []
	].some((e) => String(e ?? "").toLowerCase().includes(dt)), pt = (0, T.useCallback)(async (e = !1) => {
		try {
			let [e, t] = await O(Promise.all([v.loadDay(k, N), v.listDays(k)]));
			Ae((t) => e.version === t.version ? t : e), Me(t);
		} catch (t) {
			e || z(t instanceof n.UserError ? t.message : "Could not load the transport list.", "bad");
		} finally {
			Ke(!0);
		}
	}, [k, N]), [W, G] = (0, T.useState)(Se), [mt, ht] = (0, T.useState)(0), [gt, K] = (0, T.useState)(""), [_t, vt] = (0, T.useState)(!1);
	async function yt(e = R?.signage) {
		if (e) {
			try {
				let { config: t } = await O(e.loadSignage(k));
				ht(t.version), G({
					...Se,
					...t.window || {}
				});
			} catch {
				G(Se);
			}
			P || K("This login cannot change it.");
		}
	}
	(0, T.useEffect)(() => {
		(async () => {
			let [e, t] = await Promise.all([Te("ziyarat"), Te("signage-api")]);
			tt({
				ziyarat: e,
				signage: t
			});
			try {
				let e = await O(n.request("GET", `/api/settings?site=${k}`));
				at(e.settings?.bus_limits || {});
			} catch {}
			try {
				Je(s.buildingNames(await O(s.loadBuildings()), k));
			} catch {
				Je(s.buildingNames([], k));
			}
			await pt(), await yt(t);
		})();
		let e = setInterval(() => {
			let e = document.activeElement;
			nt.current || document.visibilityState !== "visible" || e && e.matches("input[data-key], input.tp-time-in, select[data-from]") || pt(!0);
		}, 3e4);
		return () => clearInterval(e);
	}, []);
	async function q(e, t) {
		nt.current = !0, We(!0);
		try {
			let n = await O(v.saveDay(k, N, e, rt.current.version, t));
			Ae(n), z("Saved.");
		} catch (e) {
			z(e instanceof n.UserError ? e.message : "Could not save.", "bad"), e.status === 409 && await pt();
		} finally {
			nt.current = !1, We(!1);
		}
	}
	let bt = (0, T.useRef)("");
	(0, T.useEffect)(() => {
		if (!Ge || !P || L || !B.length) return;
		let e = `${N}:${I.version}`;
		bt.current !== e && (bt.current = e, (async () => {
			let e;
			try {
				e = await O(w.all());
			} catch {
				return;
			}
			let t = e.filter((e) => !e.deleted && e.building), n = (e) => {
				let n = t.filter((t) => String(t.sh_no).toUpperCase() === e || g.baseSh(t.sh_no) === g.baseSh(e));
				return n.find((e) => e.checkout_date === N || e.checkin_date === N) || n.sort((e, t) => String(t.checkin_date).localeCompare(String(e.checkin_date)))[0];
			}, r = 0, i = rt.current.rows.map((e) => {
				if (e.building || e.building_set || V.get(e.key)?.parent || !e.ref) return e;
				let t = n(String(e.ref).toUpperCase());
				return t ? (r++, {
					...e,
					building: String(t.building).trim()
				}) : e;
			});
			r && await q(i, `buildings filled from the slips (${r})`);
		})());
	}, [
		Ge,
		P,
		L,
		N,
		I.version
	]);
	let J = (0, T.useMemo)(() => {
		let e = /* @__PURE__ */ new Map();
		for (let t of B) {
			let n = String(t.ref || "").trim().toUpperCase();
			!n || n === "0" || t.part === "ladies" && B.some((e) => e.key === String(t.key).replace(/-L$/, "")) || (e.get(n) ?? e.set(n, []).get(n)).push(t);
		}
		return [...e].filter(([, e]) => e.length > 1).map(([e, t]) => ({
			ref: e,
			rows: t
		}));
	}, [B]), xt = (e) => e.rows.map((e) => {
		let t = V.get(e.key), n = t?.route || e.route || "no route";
		return `${v.time12(e.at)} · ${n}${t?.bus != null && !t.parent ? " · bus " + t.bus : t?.parent ? " · grouped" : ""}`;
	}), St = J.map((e) => `${e.ref}:${e.rows.length}`).join(","), Ct = (0, T.useRef)("");
	(0, T.useEffect)(() => {
		St ? St !== Ct.current && (Ct.current = St, et(!0)) : Ct.current = "";
	}, [St]);
	let wt = J.length === 1 ? `SH ${J[0]?.ref} is` : `${J.length} SHs are`;
	function Tt(e, t) {
		let n = parseInt(t, 10);
		n > 0 && B.find((t) => t.key === e)?.bus !== n && q(B.map((t) => t.key === e ? {
			...t,
			bus: n,
			bus_manual: !0
		} : t), `bus ${n} for SH ${e}`);
	}
	function Et(e, t) {
		q(B.map((n) => n.key === e ? t ? {
			...n,
			building: t,
			building_set: !0
		} : {
			...(({ building: e, ...t }) => t)(n),
			building_set: !0
		} : n), `SH ${e} departs from ${t || "(none)"}`);
	}
	async function Dt(e, t) {
		let n = t, r = "";
		if (n === "custom") {
			if (r = _(await M({
				title: "Name of the vehicle",
				body: "Shown on the bus sheet and the signage, e.g. Self- Bus",
				value: e.vehicle_label || "Self- Bus"
			})).slice(0, 30), !r) return;
			n = "other";
		} else n.startsWith("other:") && (r = n.slice(6), n = "other");
		if (n === v.vehicleOf(e) && (n !== "other" || r === e.vehicle_label)) return;
		let i = (e) => {
			let { vehicle: t, vehicle_label: i, ...a } = e;
			return {
				...a,
				...n === "bus" ? {} : { vehicle: n },
				...n === "other" ? { vehicle_label: r } : {},
				bus_manual: !1
			};
		}, a = v.assignBuses(B.map((t) => t.key === e.key ? i(t) : { ...t }), B), o = v.resolve(a), s = o.get(e.key)?.dest, c = a.find((t) => t.key === e.key);
		c && v.limited(c) && v.vehiclePax(a, e.key) > H(s) ? z(`${v.vehiclePax(a, e.key)} pax ride in this vehicle — a ${r || "bus"} here carries at most ${H(s)}. Move some of the groups first.`, "bad") : (n !== "bus" && !v.isTrain(n, r) && a.filter((e) => v.vehicleOf(e) === n && (n !== "other" || String(e.vehicle_label).toUpperCase() === r.toUpperCase()) && !o.get(e.key).parent && o.get(e.key).dest === s).sort((e, t) => e.at.localeCompare(t.at)).forEach((e, t) => {
			e.bus = t + 1, e.bus_manual = !1;
		}), await q(a, `SH ${e.key} → ${n === "other" ? r : n} ${a.find((t) => t.key === e.key)?.bus ?? ""}`));
	}
	async function Ot(e, t) {
		if (Xe(null), !/^\d{2}:\d{2}$/.test(t) || t === e.at.slice(11, 16)) return;
		let n = `${e.at.slice(0, 10)}T${t}`, r = V.get(e.key)?.parent ? [] : B.filter((t) => V.get(t.key)?.parent === e && t.at === e.at);
		if (!await j({
			title: "Change the time?",
			confirmLabel: "Change time",
			body: [
				`SH ${e.ref}${e.leader ? ` (${e.leader})` : ""}`,
				`from ${v.time12(e.at)} to ${v.time12(n)}`,
				...r.length ? ["", `${r.length} grouped trip${r.length === 1 ? "" : "s"} on the same ${v.vehicleOf(e)} move${r.length === 1 ? "s" : ""} with it.`] : [],
				"",
				"The signage and the bus sheet will show the new time."
			].join("\n")
		})) return;
		let i = /* @__PURE__ */ new Set([e.key, ...r.map((e) => e.key)]);
		await q(B.map((e) => {
			if (!i.has(e.key)) return e;
			let t = e.at_manual ? e.at_import : e.at;
			return n === t ? (({ at_manual: e, at_import: t, ...r }) => ({
				...r,
				at: n
			}))(e) : {
				...e,
				at: n,
				at_manual: !0,
				at_import: t
			};
		}).sort((e, t) => e.at.localeCompare(t.at)), `time of SH ${e.ref}: ${e.at.slice(11, 16)} → ${t}${r.length ? ` (+${r.length} grouped)` : ""}`);
	}
	let kt = (e) => {
		let t = String(e.ref ?? "").trim();
		if (!t) return [];
		let n = Be.filter((e) => g.baseSh(e.sh_no) === g.baseSh(t)), r = n.find((e) => e.checkin_date === N || e.checkout_date === N) || n[0];
		return r ? [...new Set(["gents", "ladies"].flatMap((e) => (r.rooms?.[e] || []).map((e) => String(e.room_no || "").trim()).filter(Boolean)))] : [];
	}, At = (e) => e.rooms_set ? e.rooms || [] : kt(e).length ? kt(e) : e.rooms || [];
	async function jt(e) {
		let t = await M({
			title: `Rooms for SH ${e.ref} on this trip`,
			body: "A copy for transport only — the slip is not changed. Separate with commas; leave empty to follow the slip again.",
			value: At(e).join(", ")
		});
		if (t === null) return;
		let n = _(t).split(/[,\s]+/).map((e) => e.trim()).filter(Boolean).slice(0, 60);
		await q(B.map((t) => t.key === e.key ? n.length ? {
			...t,
			rooms: n,
			rooms_set: !0
		} : {
			...t,
			rooms_set: !1
		} : t), `rooms of SH ${e.ref}`);
	}
	let Mt = (e) => {
		let t = At(e), n = t.length ? t.join(", ") : "—";
		return P ? /* @__PURE__ */ (0, E.jsx)(S, {
			className: "min-w-32",
			children: /* @__PURE__ */ (0, E.jsxs)("button", {
				type: "button",
				className: C(Z, e.rooms_set && D),
				title: e.rooms_set ? "Edited for transport (the slip is unchanged)" : "From the slip — click to edit a copy for transport",
				onClick: () => !L && void jt(e),
				children: [
					n,
					" ",
					/* @__PURE__ */ (0, E.jsx)(be, { className: "size-3 opacity-60" })
				]
			})
		}) : /* @__PURE__ */ (0, E.jsx)(S, {
			className: "min-w-32",
			children: n
		});
	};
	async function Nt(e, t) {
		let n = await M({
			title: `${xe[t]} for ${e.ref ? `SH ${e.ref}` : "this trip"} (${v.time12(e.at)})`,
			value: e[t] || ""
		});
		if (n === null) return;
		let r = _(n).slice(0, 80);
		r !== (e[t] || "") && await q(B.map((n) => n.key === e.key ? {
			...n,
			[t]: r,
			names_manual: [.../* @__PURE__ */ new Set([...n.names_manual || [], t])]
		} : n), `${xe[t].toLowerCase()} of ${e.ref ? `SH ${e.ref}` : "a trip"}: ${r || "—"}`);
	}
	async function Pt(e) {
		let t = await M({
			title: `Transporter for SH ${e.ref} (${v.time12(e.at)})`,
			value: e.transporter || ""
		});
		if (t === null) return;
		let n = await M({
			title: `Vch No for SH ${e.ref}`,
			value: e.vch || ""
		});
		if (n === null) return;
		let r = _(t).slice(0, 60), i = _(n).slice(0, 20);
		if (r === (e.transporter || "") && i === (e.vch || "")) return;
		let a = e.vch_import ?? e.vch ?? "";
		await q(B.map((t) => t.key === e.key ? {
			...t,
			transporter: r,
			vch: i,
			transporter_manual: !0,
			...a && a !== i ? { vch_import: a } : {}
		} : t), `SH ${e.ref}: transporter ${r || "—"}, Vch ${i || "—"}`);
	}
	async function Ft(e) {
		let t = await M({
			title: `Pax for ${e.ref ? `SH ${e.ref}` : "this vehicle"} (${v.time12(e.at)})`,
			body: "Type M F C (e.g. 10 12 2), or just the total.",
			value: [
				e.m || 0,
				e.f || 0,
				e.c || 0
			].join(" ")
		});
		if (t === null) return;
		let n = String(t).trim().split(/[\s,/]+/).filter(Boolean).map((e) => parseInt(e, 10));
		if (!n.length || n.some((e) => !Number.isFinite(e) || e < 0 || e > 999)) {
			z("Type numbers only, e.g. 10 12 2 or 24.", "bad");
			return;
		}
		let r = n.length === 1 ? { pax: n[0] } : {
			m: n[0] || 0,
			f: n[1] || 0,
			c: n[2] || 0,
			pax: (n[0] || 0) + (n[1] || 0) + (n[2] || 0)
		};
		if (r.pax === Number(e.pax) && (n.length === 1 || r.m === (e.m || 0) && r.f === (e.f || 0) && r.c === (e.c || 0))) return;
		let i = B.map((t) => t.key === e.key ? {
			...t,
			...r,
			pax_manual: !0
		} : t), a = v.resolve(i).get(e.key)?.parent || i.find((t) => t.key === e.key);
		a && v.limited(a) && v.vehiclePax(i, a.key) > U(a) && r.pax > Number(e.pax) ? z(`That would put ${v.vehiclePax(i, a.key)} pax on one bus. A bus here carries at most ${U(a)}: put some of the groups on another bus first.`, "bad") : await q(i, `pax of ${e.ref ? `SH ${e.ref}` : "a vehicle"}: ${e.pax} → ${r.pax}`);
	}
	async function It(e) {
		let t = B.filter((t) => V.get(t.key)?.parent === e), n = t[0];
		if (!await j({
			title: "Delete this trip?",
			confirmLabel: "Delete",
			body: [
				`SH ${e.ref}${e.leader ? ` (${e.leader})` : ""} — ${v.time12(e.at)}${V.get(e.key)?.route ? ", " + V.get(e.key).route : ""}`,
				...t.length ? ["", `${t.length === 1 ? "1 group rides" : t.length + " groups ride"} with it (${t.map((e) => e.ref).join(", ")}). ${t.length === 1 ? "It stays" : "They stay"} on this bus — SH ${n.ref} becomes its first group.`] : [],
				"",
				`${t.length ? "Only this group" : "It"} disappears from the signage and the bus sheets. A later import of the list would offer it again as “New”.`
			].join("\n")
		})) return;
		let r = B.filter((t) => t.key !== e.key);
		if (n) {
			let t = [
				"route",
				"at",
				"bus",
				"bus_manual",
				"vehicle",
				"vehicle_label",
				"building",
				"transporter",
				"transporter_manual",
				"vch",
				"vch_import",
				"dora",
				"at_manual",
				"at_import"
			], i = {
				...n,
				route: e.route || V.get(e.key)?.route || ""
			};
			for (let n of t) e[n] !== void 0 && (i[n] = e[n]);
			delete i.with, i.adj = "", r = r.map((t) => t.key === n.key ? i : t.with === e.key ? {
				...t,
				with: n.key
			} : t);
		}
		await q(r, `deleted SH ${e.ref}${n ? `; SH ${n.ref} is now first on its bus` : ""}`);
	}
	let Y = (0, T.useRef)(null);
	async function Lt(e) {
		try {
			Y.current = Y.current || await O(w.all());
		} catch {
			Y.current = [];
		}
		let t = Y.current.filter((t) => !t.deleted && (String(t.sh_no).toUpperCase() === e || g.baseSh(t.sh_no) === g.baseSh(e))), n = t.find((e) => e.checkout_date === N || e.checkin_date === N) || t.sort((e, t) => String(t.checkin_date).localeCompare(String(e.checkin_date)))[0];
		if (!n) return null;
		let r = (e) => Math.max(0, parseInt(e, 10) || 0), i = r(n.gents), a = r(n.ladies), o = r(n.children ?? n.child) + r(n.infants ?? n.infant), s = ["gents", "ladies"].flatMap((e) => (n.rooms?.[e] || []).map((e) => String(e.room_no || "").trim()).filter(Boolean));
		return {
			slip: n,
			add: {
				ref: String(n.sh_no),
				operator: n.tour_name || "",
				leader: String(n.group_leader || "").trim(),
				m: i,
				f: a,
				c: o,
				pax: r(n.total) || i + a + o,
				rooms: s,
				...n.building ? { building: String(n.building).trim() } : {}
			}
		};
	}
	async function Rt(e) {
		let t = String(await M({
			title: `SH to add to the ${v.vehicleOf(e)} of ${e.ref ? `SH ${e.ref}` : "this vehicle"} (${v.time12(e.at)})`,
			body: "Several at once: separate them with a comma or a space."
		}) || ""), n = [...new Set(t.replace(/[<>]/g, "").toUpperCase().split(/[\s,;]+/).filter(Boolean))];
		if (!n.length) return;
		let r = (e) => Math.max(0, parseInt(e, 10) || 0), i = [], a = [];
		for (let e of n) {
			let t = await Lt(e);
			t ? i.push(t) : a.push(e);
		}
		let o = n.filter((e) => B.some((t) => String(t.ref).toUpperCase() === e)), s = i.map(({ slip: e, add: t }) => `• SH ${e.sh_no} — ${e.tour_name || "—"} · ${String(e.group_leader || "").trim() || "-"} · ${t.pax} pax (M ${t.m} · F ${t.f} · C ${t.c})${t.rooms.length ? ` · rooms ${t.rooms.join(", ")}` : ""}`);
		if (i.length && !await j({
			title: `Add ${i.length} group${i.length === 1 ? "" : "s"} to this ${v.vehicleOf(e)}?`,
			confirmLabel: "Add",
			body: [
				...s,
				...a.length ? ["", `Not in this site's slips: ${a.join(", ")} — you will be asked their pax next.`] : [],
				...o.length ? ["", `Already on this day's list: ${o.join(", ")} — they are added again.`] : []
			].join("\n")
		})) return;
		let c = i.map((e) => e.add), l = e.part === "gents" ? e.key : e.part === "ladies" ? String(e.key).replace(/-L$/, "") : "", ee = (e) => e ? V.get(e.key)?.parent || e : void 0, u = ee(l ? B.find((e) => e.key === l) : void 0), d = ee(l ? B.find((e) => e.key === `${l}-L`) : void 0), f = {
			g: !1,
			l: !1
		};
		if (u && d) {
			let e = (e, t) => ({
				have: v.vehiclePax(B, e.key),
				more: t,
				cap: U(e),
				over: v.limited(e) && v.vehiclePax(B, e.key) + t > U(e)
			}), t = e(u, c.reduce((e, t) => e + r(t.m), 0)), n = e(d, c.reduce((e, t) => e + r(t.f) + r(t.c), 0)), i = (e, t) => `${t} bus: ${e.have} + ${e.more} = ${e.have + e.more} of ${e.cap}`;
			if (t.over && n.over) {
				z(`Neither part fits — ${i(t, "gents")}, ${i(n, "ladies")}. Put the group on another bus.`, "bad");
				return;
			}
			if (t.over || n.over) {
				let e = t.over ? "ladies" : "gents", r = t.over ? "gents" : "ladies", a = v.time12((t.over ? u : d).at);
				if (!await j({
					title: `Only the ${e} fit on this bus`,
					confirmLabel: `Add — ${r} on a new bus`,
					body: [
						i(t, "Gents"),
						i(n, "Ladies (with the children)"),
						"",
						`The ${e} of ${c.map((e) => `SH ${e.ref}`).join(", ")} go on this bus; the ${r}${r === "ladies" ? " and children" : ""} get a new ${r} bus of their own (Madina Ziyarat, ${a}).`
					].join("\n")
				})) return;
				t.over ? f.g = !0 : f.l = !0;
			}
		} else {
			let t = v.vehiclePax(B, e.key), n = c.reduce((e, t) => e + (Number(t.pax) || 0), 0);
			if (v.limited(e) && t + n > U(e)) {
				let r = R?.ziyarat.isZiyarat(k, e.route) ? " On Ziyarat the gents and ladies can ride apart: press ⚥ Split gents / ladies on this bus first, then add the group — each part is then counted on its own bus." : " Put the group on another bus.";
				z(`This bus has ${t} pax; adding ${n} more would pass the limit of ${U(e)} per bus.${r}`, "bad");
				return;
			}
		}
		let p = c.length;
		for (let e of a) {
			let t = await M({
				title: `SH ${e} is not in this site's slips`,
				body: "Add it anyway? Number of pax (Cancel to skip):",
				type: "number"
			});
			t !== null && r(t) && c.push({
				ref: e,
				operator: "",
				leader: "",
				m: 0,
				f: 0,
				c: 0,
				pax: r(t),
				rooms: []
			});
		}
		if (!c.length) return;
		let te = Date.now().toString(36).toUpperCase(), m = (t, n) => ({
			key: `M${te}${n}`,
			dora: "",
			vch: "",
			transporter: "",
			at: e.at,
			route: "",
			remarks: `added to SH ${e.ref}'s ${v.vehicleOf(e)}`,
			adj: "",
			loc: "",
			...t,
			with: e.key,
			manual: !0
		}), ne = c.flatMap((t, n) => {
			if (!u || !d) return [m(t, n)];
			if (n >= p) {
				let i = r(t.pax), a = e.part === "gents";
				return [{
					...m(t, n),
					at: e.at,
					with: e.key,
					part: e.part,
					m: a ? i : 0,
					f: a ? 0 : i,
					c: 0,
					inf: 0
				}];
			}
			let i = r(t.m), a = r(t.f), o = r(t.c), s = (e, n, r) => {
				if (!r) return {
					...e,
					with: n.key
				};
				let { with: i, ...a } = e;
				return {
					...a,
					route: n.route || e.route,
					remarks: `${e.part} part of SH ${t.ref || ""}, on a bus of its own`
				};
			}, c = s({
				...m(t, n),
				at: u.at,
				part: "gents",
				m: i,
				f: 0,
				c: 0,
				inf: 0,
				pax: i,
				pax_manual: !0,
				split_orig: {
					m: t.m,
					f: t.f,
					c: t.c,
					pax: t.pax,
					at: u.at
				}
			}, u, f.g);
			return a + o > 0 ? [c, s({
				...m(t, n),
				key: `${c.key}-L`,
				at: d.at,
				part: "ladies",
				m: 0,
				f: a,
				c: o,
				inf: 0,
				pax: a + o,
				remarks: `ladies part of SH ${t.ref || ""}`.trim()
			}, d, f.l)] : [c];
		}), re = [...B, ...ne].sort((e, t) => e.at.localeCompare(t.at));
		await q(f.g || f.l ? v.assignBuses(re.map((e) => ({ ...e })), B) : re, `SH ${c.map((e) => e.ref).join(", ")} added to ${e.ref ? `SH ${e.ref}` : "a vehicle"}${f.g ? " (gents on a new bus)" : f.l ? " (ladies on a new bus)" : ""}`);
	}
	async function zt(e, t) {
		let n = v.destsFor(k).find((t) => t.id === e);
		if (!n || !/^\d{2}:\d{2}$/.test(t.time)) return !1;
		let r = _(t.sh).replace(/\s/g, "").toUpperCase(), i = {
			ref: "",
			operator: "",
			leader: "",
			m: 0,
			f: 0,
			c: 0,
			pax: 0,
			rooms: []
		};
		if (r) {
			let e = await Lt(r);
			if (e) i = e.add;
			else {
				let e = await M({
					title: `SH ${r} is not in this site's slips`,
					body: "Add the vehicle with it anyway? Number of pax:",
					type: "number"
				});
				if (e === null) return !1;
				i = {
					...i,
					ref: r,
					pax: Math.max(0, parseInt(e, 10) || 0)
				};
			}
		}
		if (t.veh === "bus" && Number(i.pax) > H(e)) return z(`SH ${i.ref} has ${i.pax} pax — a bus to ${n.title} carries at most ${H(e)}. Add it as two buses (type the pax of each part), or use a car.`, "bad"), !1;
		let a = _(t.transporter).slice(0, 60), o = _(t.vch).slice(0, 20), s = {
			key: `M${Date.now().toString(36).toUpperCase()}`,
			dora: "",
			vch: o,
			transporter: a,
			at: `${N}T${t.time}`,
			route: n.route,
			remarks: "vehicle added by hand",
			adj: "",
			loc: "",
			...i,
			manual: !0,
			...a || o ? { transporter_manual: !0 } : {},
			...t.veh === "car" ? { vehicle: "car" } : t.veh === "train" ? {
				vehicle: "other",
				vehicle_label: "Train"
			} : {}
		}, c = v.assignBuses([...B.map((e) => ({ ...e })), s].sort((e, t) => e.at.localeCompare(t.at)), B);
		return await q(c, `${n.title}: ${t.veh} ${c.find((e) => e.key === s.key)?.bus ?? ""} added by hand at ${t.time}${i.ref ? ` with SH ${i.ref}` : ""}`), !0;
	}
	async function Bt(e) {
		let t = B.find((t) => t.key === e);
		if (!t || !R) return;
		let n = B.filter((e) => V.get(e.key)?.parent === t), r = await R.ziyarat.openZiyaratSplit(t, n, B);
		if (!r) return;
		let i = !r.some((e) => e.key === `${t.key}-L`);
		await q(v.assignBuses(r.map((e) => ({ ...e })), B), i ? `Ziyarat split undone for SH ${t.ref || t.key}` : `Ziyarat gents / ladies for SH ${t.ref || t.key} (${n.length + 1} groups)`);
	}
	async function Vt(e) {
		let t = (e) => v.vehicleOf(e) === "other" ? `other:${String(e.vehicle_label || "").toUpperCase()}` : v.vehicleOf(e), n = B.filter((t) => V.get(t.key)?.dest === e && !V.get(t.key).parent), r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
		for (let e of n) (i.get(t(e)) ?? i.set(t(e), []).get(t(e))).push(e);
		for (let [t, n] of i) n.sort((e, t) => e.at.localeCompare(t.at) || (e.bus ?? 1e9) - (t.bus ?? 1e9)).forEach((n, i) => r.set(n.key, v.firstNo(e, t) + i));
		let a = n.filter((e) => Number(e.bus) !== r.get(e.key));
		if (!a.length) {
			z("Already numbered by departure time.");
			return;
		}
		let o = v.destsFor(k).find((t) => t.id === e)?.title || e;
		await j({
			title: `Number the ${o} vehicles ${v.firstNo(e)}, ${v.firstNo(e) + 1}, ${v.firstNo(e) + 2}… by departure time?`,
			confirmLabel: "Number them",
			body: [
				...a.slice(0, 12).map((e) => `SH ${e.ref} · ${v.time12(e.at)}: ${e.bus ?? "—"} → ${r.get(e.key)}`),
				...a.length > 12 ? [`… and ${a.length - 12} more`] : [],
				"",
				"Bus sheets already stuck on vehicles may no longer match. You can still type a number in afterwards."
			].join("\n")
		}) && await q(B.map((e) => r.has(e.key) && Number(e.bus) !== r.get(e.key) ? {
			...e,
			bus: r.get(e.key),
			bus_manual: !1
		} : e), `${o}: numbered by departure time (${a.length} changed)`);
	}
	async function Ht() {
		let e;
		try {
			e = await O(w.all());
		} catch {
			z("Could not read the slips.", "bad");
			return;
		}
		let t = await (await Ee("views/transport/plan.js")).openCheckoutPlan({
			day: N,
			siteId: k,
			slips: e,
			rows: B,
			limits: it
		});
		if (!t?.length) return;
		let n = [...new Set(t.map((e) => String(e.ref)))];
		await q(v.assignBuses([...B.map((e) => ({ ...e })), ...t].sort((e, t) => e.at.localeCompare(t.at)), B), `${t[0].remarks.replace(/, with SH .*| · .*/, "")}: ${n.length} group${n.length === 1 ? "" : "s"} (SH ${n.join(", ")})`);
	}
	async function Ut() {
		await j({
			title: "Renumber the buses?",
			confirmLabel: "Renumber",
			body: "Number every destination again from 1, in time order?\nBuses and cars count apart. Numbers typed in by hand are replaced, and sheets already stuck on buses may no longer match."
		}) && await q(v.renumber(B), "renumbered");
	}
	async function Wt() {
		if (await j({
			title: `Delete the whole transport list of ${N}?`,
			confirmLabel: "Delete day",
			body: "Signage and bus sheets for the day go with it."
		})) {
			try {
				await O(v.deleteDay(k, N, I.version)), z("Deleted.");
			} catch (e) {
				z(e.message || "Could not delete.", "bad");
			}
			await pt();
		}
	}
	async function Gt() {
		let e = W;
		if (!/^\d{2}:\d{2}$/.test(e.to_time || "") || e.from !== "now" && !/^\d{2}:\d{2}$/.test(e.from || "")) K("Fill in the times.");
		else if (e.to_day === 0 && e.from !== "now" && e.to_time <= e.from) K("The end must be after the beginning.");
		else {
			vt(!0);
			try {
				let t = await O(R.signage.saveSignageConfig(k, { window: e }, mt));
				ht(t.config.version), G(t.config.window), K("Saved — every signage screen uses it from its next slide.");
			} catch (e) {
				K(e instanceof n.UserError ? e.message : "Could not save."), e.status === 409 && await yt();
			} finally {
				vt(!1);
			}
		}
	}
	let Kt = [...new Set(["Train", ...B.map((e) => e.vehicle === "other" && e.vehicle_label)].filter(Boolean))], X = v.VEHICLES, qt = (e) => e && !qe.includes(e) ? [...qe, e] : qe, Z = "inline-flex max-w-full items-center gap-1 rounded border border-transparent px-1.5 py-0.5 text-left hover:border-border hover:bg-accent", Q = (e) => /* @__PURE__ */ (0, E.jsx)("small", {
		className: "block text-xs text-muted-foreground",
		children: e
	}), Jt = (e) => {
		let t = e.at_manual && e.at_import && e.at_import !== e.at ? Q(/* @__PURE__ */ (0, E.jsxs)("span", {
			title: `Changed by hand — the transport list says ${v.time12(e.at_import)}`,
			children: ["list: ", v.time12(e.at_import)]
		})) : null;
		return P ? /* @__PURE__ */ (0, E.jsxs)(S, {
			className: "whitespace-nowrap",
			children: [Ye === e.key ? /* @__PURE__ */ (0, E.jsx)(b, {
				autoFocus: !0,
				type: "time",
				className: "tp-time-in h-8 w-28",
				defaultValue: e.at.slice(11, 16),
				"aria-label": `New time for SH ${e.ref}`,
				onKeyDown: (t) => {
					t.key === "Enter" ? (t.preventDefault(), Ot(e, t.target.value)) : t.key === "Escape" && Xe(null);
				},
				onBlur: (t) => {
					Ye === e.key && Ot(e, t.target.value);
				}
			}) : /* @__PURE__ */ (0, E.jsxs)("button", {
				type: "button",
				className: C(Z, e.at_manual && D),
				title: "Change the time",
				onClick: () => !L && Xe(e.key),
				children: [
					v.time12(e.at),
					" ",
					/* @__PURE__ */ (0, E.jsx)(be, { className: "size-3 opacity-60" })
				]
			}), t]
		}) : /* @__PURE__ */ (0, E.jsxs)(S, {
			className: "whitespace-nowrap",
			children: [v.time12(e.at), t]
		});
	}, Yt = (e, t) => {
		let n = e.building || "";
		if (!P) return /* @__PURE__ */ (0, E.jsx)(S, { children: n || (t ? /* @__PURE__ */ (0, E.jsx)("span", {
			className: "text-muted-foreground",
			children: t.building ? `↳ ${t.building}` : ""
		}) : "—") });
		let r = t ? `↳ same as bus${t.building ? ` (${t.building})` : ""}` : "—";
		return /* @__PURE__ */ (0, E.jsx)(S, { children: /* @__PURE__ */ (0, E.jsxs)("select", {
			"data-from": e.key,
			"aria-label": "Departs from (building)",
			className: C("h-8 max-w-[10rem] rounded-md border bg-background px-1.5 text-sm", n && D),
			value: n,
			disabled: L,
			onChange: (t) => Et(e.key, t.target.value),
			children: [/* @__PURE__ */ (0, E.jsx)("option", {
				value: "",
				children: r
			}), qt(n).map((e) => /* @__PURE__ */ (0, E.jsx)("option", {
				value: e,
				children: e
			}, e))]
		}) });
	}, $ = (e, t) => {
		let n = e[t] || "—";
		if (!P) return /* @__PURE__ */ (0, E.jsx)(S, { children: n });
		let r = (e.names_manual || []).includes(t);
		return /* @__PURE__ */ (0, E.jsx)(S, { children: /* @__PURE__ */ (0, E.jsxs)("button", {
			type: "button",
			className: C(Z, r && D),
			title: `Change the ${xe[t].toLowerCase()}`,
			onClick: () => !L && void Nt(e, t),
			children: [
				n,
				" ",
				/* @__PURE__ */ (0, E.jsx)(be, { className: "size-3 opacity-60" })
			]
		}) });
	}, Xt = (e, t) => {
		let n = /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [e.transporter || (t ? "with the bus above" : "—"), e.vch ? Q(`Vch ${e.vch}`) : null] });
		return !P || t ? /* @__PURE__ */ (0, E.jsx)(S, { children: n }) : /* @__PURE__ */ (0, E.jsx)(S, { children: /* @__PURE__ */ (0, E.jsxs)("button", {
			type: "button",
			className: C(Z, e.transporter_manual && D),
			title: "Change the transporter / Vch No",
			onClick: () => !L && void Pt(e),
			children: [
				/* @__PURE__ */ (0, E.jsx)("span", { children: n }),
				" ",
				/* @__PURE__ */ (0, E.jsx)(be, { className: "size-3 opacity-60" })
			]
		}) });
	}, Zt = (e) => {
		let t = /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [/* @__PURE__ */ (0, E.jsx)("b", { children: e.pax }), Q([
			e.m && `M${e.m}`,
			e.f && `F${e.f}`,
			e.c && `C${e.c}`
		].filter(Boolean).join(" "))] });
		return /* @__PURE__ */ (0, E.jsx)(S, {
			className: "text-right",
			children: P ? /* @__PURE__ */ (0, E.jsx)("button", {
				type: "button",
				className: C(Z, "text-right", e.pax_manual && D),
				title: "Change the pax",
				onClick: () => !L && void Ft(e),
				children: /* @__PURE__ */ (0, E.jsx)("span", { children: t })
			}) : t
		});
	}, Qt = (e) => P ? /* @__PURE__ */ (0, E.jsx)(S, { children: /* @__PURE__ */ (0, E.jsx)(y, {
		variant: "ghost",
		size: "icon",
		className: "size-8 text-destructive",
		title: "Delete this trip",
		"aria-label": `Delete SH ${e.ref}`,
		disabled: L,
		onClick: () => void It(e),
		children: /* @__PURE__ */ (0, E.jsx)(ce, { className: "size-4" })
	}) }) : null, $t = (e, t) => /* @__PURE__ */ (0, E.jsxs)(S, { children: [
		/* @__PURE__ */ (0, E.jsx)("b", { children: e.ref || "—" }),
		e.dora ? Q(`Dora ${e.dora}`) : null,
		t && P && /* @__PURE__ */ (0, E.jsx)(y, {
			size: "sm",
			variant: "outline",
			className: "mt-1 block h-6 px-1.5 text-xs",
			title: `Add a group (SH) to this ${v.vehicleOf(t)}`,
			disabled: L,
			onClick: () => void Rt(t),
			children: "＋ SH"
		})
	] }), en = (e) => {
		let t = g.baseSh(e.ref), n = t ? Be.find((e) => g.baseSh(e.sh_no) === t && e.ums?.departure)?.ums.departure : null;
		return n ? `${n.flight}${n.port ? ` · ${n.port}` : ""} · ${String(n.date).split("-").reverse().slice(0, 2).join("/")} ${n.time}` : "";
	};
	function tn() {
		return ct.map((e) => {
			let t = /* @__PURE__ */ new Map(), n = (e) => `${e.vehicle}${e.vehicle === "other" ? String(e.vlabel).toUpperCase() : ""}#${e.bus}`;
			for (let r of e.buses) r.bus != null && t.set(n(r), (t.get(n(r)) || 0) + 1);
			let r = e.dest.tosha === "airport", i = (r ? [...e.buses].sort((e, t) => e.at.localeCompare(t.at) || (e.bus ?? 1e9) - (t.bus ?? 1e9)) : e.buses).flatMap((e) => e.rows.map((t, n) => ({
				r: t,
				b: e,
				i: n
			}))).filter((e) => ft(e.r));
			return /* @__PURE__ */ (0, E.jsxs)("div", {
				className: "grid gap-2",
				children: [
					/* @__PURE__ */ (0, E.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2 border-b pb-1.5 font-bold",
						children: [
							/* @__PURE__ */ (0, E.jsx)("span", {
								"aria-hidden": !0,
								children: e.dest.icon
							}),
							e.dest.label,
							r && /* @__PURE__ */ (0, E.jsx)("span", {
								className: "text-xs font-normal text-muted-foreground",
								children: "by departure time"
							}),
							/* @__PURE__ */ (0, E.jsxs)("small", {
								className: "font-normal text-muted-foreground",
								children: [
									lt(e.buses),
									" · ",
									e.groups,
									" groups · ",
									e.pax,
									" pax"
								]
							}),
							ot && P ? /* @__PURE__ */ (0, E.jsxs)(y, {
								size: "sm",
								variant: "outline",
								className: "h-6 px-1.5 text-xs font-normal",
								title: "The most pax one bus may carry on this route — change it",
								onClick: () => void st(e.dest.id, e.dest.title),
								children: [
									"🚌 max ",
									H(e.dest.id),
									" / bus ✎"
								]
							}) : /* @__PURE__ */ (0, E.jsxs)("small", {
								className: "rounded border px-1.5 text-xs font-normal text-muted-foreground",
								title: "The most pax one bus may carry on this route (an admin can change it)",
								children: [
									"🚌 max ",
									H(e.dest.id),
									" / bus"
								]
							}),
							r && e.buses.length > 1 && P && /* @__PURE__ */ (0, E.jsx)(y, {
								size: "sm",
								variant: "outline",
								className: "ml-auto",
								title: "Number this destination's vehicles 1, 2, 3… by departure time",
								onClick: () => void Vt(e.dest.id),
								children: "🔢 Number by time"
							})
						]
					}),
					i.length ? /* @__PURE__ */ (0, E.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, E.jsxs)(ge, { children: [/* @__PURE__ */ (0, E.jsx)(me, { children: /* @__PURE__ */ (0, E.jsxs)(he, { children: [
							/* @__PURE__ */ (0, E.jsx)(x, { children: "Vehicle" }),
							/* @__PURE__ */ (0, E.jsx)(x, { children: "Time" }),
							/* @__PURE__ */ (0, E.jsx)(x, { children: "From" }),
							/* @__PURE__ */ (0, E.jsx)(x, { children: "SH" }),
							/* @__PURE__ */ (0, E.jsx)(x, { children: "Tour operator" }),
							/* @__PURE__ */ (0, E.jsx)(x, { children: "Group leader" }),
							/* @__PURE__ */ (0, E.jsx)(x, {
								className: "text-right",
								children: "Pax"
							}),
							/* @__PURE__ */ (0, E.jsx)(x, { children: "Transporter" }),
							Le && /* @__PURE__ */ (0, E.jsx)(x, { children: "Rooms" }),
							/* @__PURE__ */ (0, E.jsx)(x, { children: "Departure flight" }),
							P && /* @__PURE__ */ (0, E.jsx)(x, {})
						] }) }), /* @__PURE__ */ (0, E.jsx)(pe, { children: i.map(({ r, b: i, i: a }) => /* @__PURE__ */ (0, E.jsxs)(he, {
							className: C(a > 0 && "bg-muted/40", r.at < ut && "opacity-55"),
							children: [
								/* @__PURE__ */ (0, E.jsxs)(S, {
									className: "whitespace-nowrap",
									children: [a ? `↳ ${v.vehicleNo(i.bus, i.vehicle, i.vlabel)}` : P ? /* @__PURE__ */ (0, E.jsxs)("span", {
										className: "inline-flex items-center gap-1",
										children: [/* @__PURE__ */ (0, E.jsxs)("select", {
											"data-veh": r.key,
											"aria-label": "Vehicle",
											className: "h-8 rounded-md border bg-background px-1 text-sm",
											disabled: L,
											value: i.vehicle === "other" ? `other:${i.vlabel}` : i.vehicle,
											onChange: (e) => void Dt(r, e.target.value),
											children: [
												/* @__PURE__ */ (0, E.jsxs)("option", {
													value: "bus",
													children: [X.bus.icon, " Bus"]
												}),
												/* @__PURE__ */ (0, E.jsxs)("option", {
													value: "car",
													children: [X.car.icon, " Car"]
												}),
												(i.vehicle === "other" && !Kt.includes(i.vlabel) ? [...Kt, i.vlabel] : Kt).map((e) => /* @__PURE__ */ (0, E.jsxs)("option", {
													value: `other:${e}`,
													children: [
														X.other.icon,
														" ",
														e
													]
												}, e)),
												/* @__PURE__ */ (0, E.jsx)("option", {
													value: "custom",
													children: "✎ Custom…"
												})
											]
										}), /* @__PURE__ */ (0, E.jsx)("input", {
											"data-key": r.key,
											type: "number",
											min: 1,
											max: 99999,
											inputMode: "numeric",
											defaultValue: i.bus ?? "",
											"aria-label": `${v.isTrain(i.vehicle, i.vlabel) ? "Train" : i.vlabel || X[i.vehicle].title} number`,
											title: `${r.bus_manual ? "Typed in by hand" : "Given by the import"}${t.get(n(i)) > 1 ? " · used twice" : ""}`,
											className: C("h-8 rounded-md border bg-background px-2 text-sm", v.isTrain(i.vehicle, i.vlabel) ? "w-24" : "w-16", r.bus_manual && D, t.get(n(i)) > 1 && "border-destructive bg-destructive/10"),
											onBlur: (e) => Tt(r.key, e.target.value),
											onKeyDown: (e) => {
												e.key === "Enter" && e.target.blur();
											}
										}, `${r.key}-${i.bus}`)]
									}) : `${X[i.vehicle].icon} ${v.vehicleNo(i.bus, i.vehicle, i.vlabel) || i.bus || "—"}`, !a && P && i.vehicle === "other" && Q(i.vlabel)]
								}),
								Jt(r),
								Yt(r, a ? i : null),
								$t(r, i.rows[0]),
								$(r, "operator"),
								$(r, "leader"),
								Zt(r),
								Xt(r, !!a),
								Le && Mt(r),
								/* @__PURE__ */ (0, E.jsxs)(S, {
									className: "min-w-40",
									children: [
										!a && /* @__PURE__ */ (0, E.jsxs)("span", {
											className: C("mr-1.5 rounded border px-1.5 py-0.5 text-xs font-bold", v.limited(r) && i.pax > H(e.dest.id) && "border-destructive bg-destructive/10 text-destructive"),
											title: `Pax on this ${X[i.vehicle].title.toLowerCase()}${v.limited(r) ? ` (a bus carries at most ${H(e.dest.id)})` : ""}`,
											children: [i.pax, v.limited(r) ? ` / ${H(e.dest.id)}` : ""]
										}),
										r.part && /* @__PURE__ */ (0, E.jsx)(ye, {
											variant: "outline",
											className: "mr-1",
											children: r.part === "gents" ? "GENTS" : "LADIES"
										}),
										/* @__PURE__ */ (0, E.jsx)("span", {
											title: r.remarks ? `Remarks: ${r.remarks}` : void 0,
											children: en(r) ? /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: ["✈ ", en(r)] }) : /* @__PURE__ */ (0, E.jsx)("span", {
												className: "text-muted-foreground",
												children: "no flight on the slip"
											})
										}),
										!a && P && R?.ziyarat.isZiyarat(k, r.route) && /* @__PURE__ */ (0, E.jsx)(y, {
											size: "sm",
											variant: "outline",
											className: "ml-1.5 h-6 px-1.5 text-xs",
											title: "Gents and ladies on their own Ziyarat trips",
											disabled: L,
											onClick: () => void Bt(String(r.key).replace(/-L$/, "")),
											children: r.part ? "⚥ Gents / Ladies…" : "⚥ Split gents / ladies"
										})
									]
								}),
								Qt(r)
							]
						}, r.key)) })] })
					}) : /* @__PURE__ */ (0, E.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: e.buses.length ? "Nothing matches." : "No trips."
					}),
					P && /* @__PURE__ */ (0, E.jsx)(Ce, {
						dest: e.dest,
						open: Ze === e.dest.id,
						onOpen: (t) => Qe(t ? e.dest.id : null),
						onSubmit: (t) => zt(e.dest.id, t),
						busy: L
					})
				]
			}, e.dest.id);
		});
	}
	function nn() {
		let e = [...B].sort((e, t) => e.at.localeCompare(t.at)).filter(ft);
		return e.length ? /* @__PURE__ */ (0, E.jsx)("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ (0, E.jsxs)(ge, { children: [/* @__PURE__ */ (0, E.jsx)(me, { children: /* @__PURE__ */ (0, E.jsxs)(he, { children: [
				/* @__PURE__ */ (0, E.jsx)(x, { children: "Time" }),
				/* @__PURE__ */ (0, E.jsx)(x, { children: "From" }),
				/* @__PURE__ */ (0, E.jsx)(x, { children: "Route" }),
				/* @__PURE__ */ (0, E.jsx)(x, { children: "Vehicle" }),
				/* @__PURE__ */ (0, E.jsx)(x, { children: "SH" }),
				/* @__PURE__ */ (0, E.jsx)(x, { children: "Tour operator" }),
				/* @__PURE__ */ (0, E.jsx)(x, { children: "Group leader" }),
				/* @__PURE__ */ (0, E.jsx)(x, {
					className: "text-right",
					children: "Pax"
				}),
				/* @__PURE__ */ (0, E.jsx)(x, { children: "Transporter" }),
				/* @__PURE__ */ (0, E.jsx)(x, { children: "Rooms" }),
				/* @__PURE__ */ (0, E.jsx)(x, { children: "Remarks" }),
				P && /* @__PURE__ */ (0, E.jsx)(x, {})
			] }) }), /* @__PURE__ */ (0, E.jsx)(pe, { children: e.map((e) => {
				let t = V.get(e.key);
				return /* @__PURE__ */ (0, E.jsxs)(he, {
					className: C(t.parent && "bg-muted/40", e.at < ut && "opacity-55"),
					children: [
						Jt(e),
						Yt(e, t.parent ? { building: t.building } : null),
						/* @__PURE__ */ (0, E.jsxs)(S, { children: [t.route || "—", t.parent ? Q("grouped") : null] }),
						/* @__PURE__ */ (0, E.jsx)(S, {
							className: "whitespace-nowrap",
							children: t.dest ? `${X[t.vehicle].icon} ${t.vehicle === "other" ? v.vehicleNo(t.bus, t.vehicle, t.vlabel) : t.bus ?? "—"}` : ""
						}),
						$t(e),
						$(e, "operator"),
						$(e, "leader"),
						Zt(e),
						Xt(e, !!t.parent),
						Mt(e),
						/* @__PURE__ */ (0, E.jsx)(S, { children: e.remarks }),
						Qt(e)
					]
				}, e.key);
			}) })] })
		}) : /* @__PURE__ */ (0, E.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Nothing matches."
		});
	}
	let rn = n.canOpen("transport-import", F) && P, an = v.destsFor(k).map((e) => e.title).join(", ").replace(/, ([^,]*)$/, " and $1");
	return /* @__PURE__ */ (0, E.jsxs)("div", {
		className: "mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4",
		children: [
			/* @__PURE__ */ (0, E.jsxs)("header", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, E.jsxs)("div", { children: [/* @__PURE__ */ (0, E.jsx)("h1", {
					className: "text-2xl font-bold text-primary",
					children: "Transport"
				}), /* @__PURE__ */ (0, E.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [
						"Trips of the day from the transport list. ",
						an,
						" trips get a vehicle number, signage and a bus sheet."
					]
				})] }), /* @__PURE__ */ (0, E.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						rn && /* @__PURE__ */ (0, E.jsx)(y, {
							asChild: !0,
							variant: "outline",
							children: /* @__PURE__ */ (0, E.jsx)("a", {
								href: A("transport-import"),
								children: "📋 Import list"
							})
						}),
						n.canOpen("transport-print", F) && /* @__PURE__ */ (0, E.jsx)(y, {
							asChild: !0,
							variant: "outline",
							children: /* @__PURE__ */ (0, E.jsx)("a", {
								href: A("transport-print", { day: N }),
								children: "🖨️ Bus sheets"
							})
						}),
						/* @__PURE__ */ (0, E.jsx)(y, {
							asChild: !0,
							children: /* @__PURE__ */ (0, E.jsx)("a", {
								href: `${k}/signage`,
								target: "_blank",
								rel: "noopener",
								children: "📺 Signage ↗"
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, E.jsx)(se, {
				day: N,
				days: je,
				onChange: (e) => De("transport", { day: e })
			}),
			B.length > 0 && (J.length ? /* @__PURE__ */ (0, E.jsxs)("div", {
				role: "alert",
				className: "rounded-xl border border-destructive bg-destructive/10 p-3 text-sm",
				children: [
					/* @__PURE__ */ (0, E.jsxs)("b", { children: [
						"⚠ ",
						wt,
						" listed more than once on this day."
					] }),
					/* @__PURE__ */ (0, E.jsx)("ul", {
						className: "ml-5 list-disc",
						children: J.map((e) => /* @__PURE__ */ (0, E.jsxs)("li", { children: [
							/* @__PURE__ */ (0, E.jsxs)("b", { children: ["SH ", e.ref] }),
							" × ",
							e.rows.length,
							": ",
							xt(e).join("  |  ")
						] }, e.ref))
					}),
					/* @__PURE__ */ (0, E.jsx)("span", {
						className: "text-muted-foreground",
						children: "Check each one: a group should ride one vehicle per route. Delete the extra trip (🗑) if it is a mistake."
					})
				]
			}) : /* @__PURE__ */ (0, E.jsx)("div", {
				role: "status",
				className: "rounded-xl border border-ok/40 bg-ok-soft p-3 text-sm font-bold text-ok",
				children: "✓ All good to go — no SH is listed twice on this day."
			})),
			/* @__PURE__ */ (0, E.jsx)("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6",
				children: ct.map((e) => /* @__PURE__ */ (0, E.jsxs)("div", {
					className: "grid gap-0.5 rounded-xl border bg-card p-3",
					children: [
						/* @__PURE__ */ (0, E.jsx)("span", {
							"aria-hidden": !0,
							className: "text-xl",
							children: e.dest.icon
						}),
						/* @__PURE__ */ (0, E.jsx)("b", {
							className: "text-2xl",
							children: e.pax
						}),
						/* @__PURE__ */ (0, E.jsx)("span", {
							className: "text-sm",
							children: e.dest.title
						}),
						/* @__PURE__ */ (0, E.jsxs)("small", {
							className: "text-xs text-muted-foreground",
							children: [
								lt(e.buses),
								" · ",
								e.groups,
								" group",
								e.groups === 1 ? "" : "s",
								e.buses.length ? ` · ${v.time12(e.buses.reduce((e, t) => e.at < t.at ? e : t).at)} first` : ""
							]
						})
					]
				}, e.dest.id))
			}),
			/* @__PURE__ */ (0, E.jsx)(fe, {
				className: "gap-0 py-0",
				children: /* @__PURE__ */ (0, E.jsxs)(ue, {
					className: "grid gap-3 p-3",
					children: [
						/* @__PURE__ */ (0, E.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, E.jsx)("div", {
									role: "group",
									"aria-label": "Which trips",
									className: "inline-flex overflow-hidden rounded-md border",
									children: [["sign", "Signage trips"], ["all", "All trips"]].map(([e, t]) => /* @__PURE__ */ (0, E.jsx)("button", {
										type: "button",
										"aria-pressed": Ne === e,
										className: C("px-3 py-1.5 text-sm", Ne === e ? "bg-primary text-primary-foreground" : "bg-card hover:bg-accent"),
										onClick: () => Pe(e),
										children: t
									}, e))
								}),
								/* @__PURE__ */ (0, E.jsx)(b, {
									type: "search",
									className: "min-w-48 flex-1",
									placeholder: "Find SH, group, leader, transporter, vch…",
									"aria-label": "Find",
									value: Fe,
									onChange: (e) => Ie(e.target.value)
								}),
								/* @__PURE__ */ (0, E.jsxs)("label", {
									className: "inline-flex items-center gap-1.5 text-sm font-semibold",
									children: [/* @__PURE__ */ (0, E.jsx)(oe, {
										checked: Le,
										onCheckedChange: (e) => ze(e === !0)
									}), "Show rooms"]
								}),
								P && /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [
									/* @__PURE__ */ (0, E.jsx)(y, {
										title: "Make trips from the groups checking out on a date you pick (or, Medina, the Ziyarat of the groups who checked in the day before)",
										disabled: L,
										onClick: () => void Ht(),
										children: "🧭 Plan trips"
									}),
									/* @__PURE__ */ (0, E.jsx)(y, {
										variant: "outline",
										disabled: L || !I.version,
										title: "Number each destination again from 1 in time order",
										onClick: () => void Ut(),
										children: "Renumber buses"
									}),
									/* @__PURE__ */ (0, E.jsx)(y, {
										variant: "outline",
										className: "text-destructive",
										disabled: L || !I.version,
										onClick: () => void Wt(),
										children: "Delete day"
									})
								] })
							]
						}),
						He && /* @__PURE__ */ (0, E.jsx)("div", {
							className: C("rounded-md border px-3 py-2 text-sm", He.kind === "ok" ? "border-ok/40 bg-ok-soft text-ok" : "border-destructive bg-destructive/10 text-destructive"),
							children: He.text
						}),
						Ge ? !B.length && !(P && Ne === "sign") ? /* @__PURE__ */ (0, E.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: ["No transport list saved for this day.", rn && /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [" ", /* @__PURE__ */ (0, E.jsx)("a", {
								className: "text-primary underline",
								href: A("transport-import"),
								children: "Import one →"
							})] })]
						}) : /* @__PURE__ */ (0, E.jsx)("div", {
							className: "grid gap-4",
							children: Ne === "sign" ? tn() : nn()
						}) : /* @__PURE__ */ (0, E.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Loading…"
						}),
						/* @__PURE__ */ (0, E.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: I.version ? `${B.length} trips · saved ${new Date(I.updated_at || "").toLocaleString()}${I.updated_by ? " by " + I.updated_by : ""}` : ""
						})
					]
				})
			}),
			/* @__PURE__ */ (0, E.jsxs)(fe, { children: [/* @__PURE__ */ (0, E.jsxs)(de, { children: [/* @__PURE__ */ (0, E.jsxs)(le, {
				className: "text-base",
				children: ["Signage window ", /* @__PURE__ */ (0, E.jsx)("span", {
					className: "text-sm font-normal text-muted-foreground",
					children: "— which trips the public board shows (Riyadh time)"
				})]
			}), /* @__PURE__ */ (0, E.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [
					"Default: from ",
					/* @__PURE__ */ (0, E.jsx)("b", { children: "now" }),
					" (a trip drops off once it has left) to the end of ",
					/* @__PURE__ */ (0, E.jsx)("b", { children: "tomorrow" }),
					". Templates and slide times are in the Signage Builder."
				]
			})] }), /* @__PURE__ */ (0, E.jsxs)(ue, {
				className: "grid gap-3",
				children: [/* @__PURE__ */ (0, E.jsxs)("div", {
					className: "flex flex-wrap items-end gap-3",
					children: [
						/* @__PURE__ */ (0, E.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, E.jsx)(h, { children: "Beginning" }), /* @__PURE__ */ (0, E.jsxs)(te, {
								disabled: !P,
								value: W.from === "now" ? "now" : "time",
								onValueChange: (e) => G((t) => ({
									...t,
									from: e === "now" ? "now" : "00:00"
								})),
								children: [/* @__PURE__ */ (0, E.jsx)(d, {
									className: "w-64",
									children: /* @__PURE__ */ (0, E.jsx)(u, {})
								}), /* @__PURE__ */ (0, E.jsxs)(f, { children: [/* @__PURE__ */ (0, E.jsx)(p, {
									value: "now",
									children: "Now — hide trips that have left"
								}), /* @__PURE__ */ (0, E.jsx)(p, {
									value: "time",
									children: "Today from a fixed time"
								})] })]
							})]
						}),
						W.from !== "now" && /* @__PURE__ */ (0, E.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, E.jsx)(h, {
								htmlFor: "sgFromTime",
								children: "Today from"
							}), /* @__PURE__ */ (0, E.jsx)(b, {
								id: "sgFromTime",
								type: "time",
								disabled: !P,
								value: W.from,
								onChange: (e) => G((t) => ({
									...t,
									from: e.target.value
								}))
							})]
						}),
						/* @__PURE__ */ (0, E.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, E.jsx)(h, { children: "End day" }), /* @__PURE__ */ (0, E.jsxs)(te, {
								disabled: !P,
								value: String(W.to_day),
								onValueChange: (e) => G((t) => ({
									...t,
									to_day: Number(e)
								})),
								children: [/* @__PURE__ */ (0, E.jsx)(d, {
									className: "w-48",
									children: /* @__PURE__ */ (0, E.jsx)(u, {})
								}), /* @__PURE__ */ (0, E.jsxs)(f, { children: [
									/* @__PURE__ */ (0, E.jsx)(p, {
										value: "0",
										children: "Today"
									}),
									/* @__PURE__ */ (0, E.jsx)(p, {
										value: "1",
										children: "Tomorrow"
									}),
									/* @__PURE__ */ (0, E.jsx)(p, {
										value: "2",
										children: "Day after tomorrow"
									})
								] })]
							})]
						}),
						/* @__PURE__ */ (0, E.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, E.jsx)(h, {
								htmlFor: "sgToTime",
								children: "End time"
							}), /* @__PURE__ */ (0, E.jsx)(b, {
								id: "sgToTime",
								type: "time",
								disabled: !P,
								value: W.to_time,
								onChange: (e) => G((t) => ({
									...t,
									to_time: e.target.value
								}))
							})]
						})
					]
				}), /* @__PURE__ */ (0, E.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						P && /* @__PURE__ */ (0, E.jsxs)(E.Fragment, { children: [/* @__PURE__ */ (0, E.jsx)(y, {
							variant: "outline",
							onClick: () => {
								G(Se), K("Default filled in — press Save window.");
							},
							children: "Back to default"
						}), /* @__PURE__ */ (0, E.jsx)(y, {
							disabled: _t,
							onClick: () => void Gt(),
							children: "Save window"
						})] }),
						n.canOpen("signage-builder", F) && /* @__PURE__ */ (0, E.jsx)(y, {
							asChild: !0,
							variant: "outline",
							children: /* @__PURE__ */ (0, E.jsx)("a", {
								href: A("signage-builder"),
								children: "🎨 Signage Builder"
							})
						}),
						/* @__PURE__ */ (0, E.jsx)("span", {
							className: "text-sm text-muted-foreground",
							children: gt
						})
					]
				})]
			})] }),
			/* @__PURE__ */ (0, E.jsx)(ae, {
				open: $e,
				onOpenChange: et,
				children: /* @__PURE__ */ (0, E.jsxs)(re, {
					className: "max-w-[calc(100%-1rem)] sm:max-w-md",
					children: [
						/* @__PURE__ */ (0, E.jsx)(m, { children: /* @__PURE__ */ (0, E.jsxs)(ie, { children: [
							"⚠ ",
							wt,
							" listed twice"
						] }) }),
						/* @__PURE__ */ (0, E.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [
								"On ",
								N,
								":"
							]
						}),
						/* @__PURE__ */ (0, E.jsx)("ul", {
							className: "ml-5 list-disc text-sm",
							children: J.map((e) => /* @__PURE__ */ (0, E.jsxs)("li", { children: [
								/* @__PURE__ */ (0, E.jsxs)("b", { children: ["SH ", e.ref] }),
								" × ",
								e.rows.length,
								/* @__PURE__ */ (0, E.jsx)("br", {}),
								/* @__PURE__ */ (0, E.jsx)("span", {
									className: "text-muted-foreground",
									children: xt(e).map((e, t) => /* @__PURE__ */ (0, E.jsxs)("span", { children: [e, /* @__PURE__ */ (0, E.jsx)("br", {})] }, t))
								})
							] }, e.ref))
						}),
						/* @__PURE__ */ (0, E.jsx)(ne, { children: /* @__PURE__ */ (0, E.jsx)(y, {
							onClick: () => et(!1),
							children: "OK, I will check"
						}) })
					]
				})
			}),
			Oe,
			ke
		]
	});
}
function Ce({ dest: e, open: t, onOpen: n, onSubmit: r, busy: i }) {
	let a = {
		time: e.id === "mdmakkah" ? "08:00" : "",
		veh: "bus",
		transporter: "",
		vch: "",
		sh: ""
	}, [o, s] = (0, T.useState)(a);
	if (!t) return /* @__PURE__ */ (0, E.jsx)("div", { children: /* @__PURE__ */ (0, E.jsxs)(y, {
		size: "sm",
		variant: "outline",
		onClick: () => n(!0),
		children: [/* @__PURE__ */ (0, E.jsx)(v, { className: "size-3.5" }), "Bus"]
	}) });
	let c = (e) => (t) => s((n) => ({
		...n,
		[e]: t.target.value
	}));
	return /* @__PURE__ */ (0, E.jsxs)("form", {
		autoComplete: "off",
		className: "grid grid-cols-2 items-end gap-2 rounded-xl border bg-accent/40 p-3 sm:grid-cols-3 lg:grid-cols-6",
		onSubmit: async (e) => {
			e.preventDefault(), await r(o) && (s(a), n(!1));
		},
		children: [
			/* @__PURE__ */ (0, E.jsxs)("b", {
				className: "col-span-full",
				children: [
					"New ",
					e.title,
					" vehicle"
				]
			}),
			/* @__PURE__ */ (0, E.jsxs)("div", {
				className: "grid gap-1",
				children: [/* @__PURE__ */ (0, E.jsx)(h, { children: "Time" }), /* @__PURE__ */ (0, E.jsx)(b, {
					type: "time",
					required: !0,
					value: o.time,
					onChange: c("time")
				})]
			}),
			/* @__PURE__ */ (0, E.jsxs)("div", {
				className: "grid gap-1",
				children: [/* @__PURE__ */ (0, E.jsx)(h, { children: "Vehicle" }), /* @__PURE__ */ (0, E.jsxs)(te, {
					value: o.veh,
					onValueChange: (e) => s((t) => ({
						...t,
						veh: e
					})),
					children: [/* @__PURE__ */ (0, E.jsx)(d, {
						className: "w-full",
						children: /* @__PURE__ */ (0, E.jsx)(u, {})
					}), /* @__PURE__ */ (0, E.jsxs)(f, { children: [
						/* @__PURE__ */ (0, E.jsx)(p, {
							value: "bus",
							children: "🚌 Bus"
						}),
						/* @__PURE__ */ (0, E.jsx)(p, {
							value: "car",
							children: "🚗 Car"
						}),
						/* @__PURE__ */ (0, E.jsx)(p, {
							value: "train",
							children: "🚆 Train"
						})
					] })]
				})]
			}),
			/* @__PURE__ */ (0, E.jsxs)("div", {
				className: "grid gap-1",
				children: [/* @__PURE__ */ (0, E.jsx)(h, { children: "Transporter" }), /* @__PURE__ */ (0, E.jsx)(b, {
					maxLength: 60,
					value: o.transporter,
					onChange: c("transporter")
				})]
			}),
			/* @__PURE__ */ (0, E.jsxs)("div", {
				className: "grid gap-1",
				children: [/* @__PURE__ */ (0, E.jsx)(h, { children: "Vch No" }), /* @__PURE__ */ (0, E.jsx)(b, {
					maxLength: 20,
					value: o.vch,
					onChange: c("vch")
				})]
			}),
			/* @__PURE__ */ (0, E.jsxs)("div", {
				className: "grid gap-1",
				children: [/* @__PURE__ */ (0, E.jsx)(h, { children: "SH (optional)" }), /* @__PURE__ */ (0, E.jsx)(b, {
					maxLength: 20,
					placeholder: "first group",
					value: o.sh,
					onChange: c("sh")
				})]
			}),
			/* @__PURE__ */ (0, E.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, E.jsx)(y, {
					type: "submit",
					disabled: i,
					children: "Add"
				}), /* @__PURE__ */ (0, E.jsx)(y, {
					type: "button",
					variant: "outline",
					onClick: () => {
						s(a), n(!1);
					},
					children: "Cancel"
				})]
			})
		]
	});
}
export { O as default };
