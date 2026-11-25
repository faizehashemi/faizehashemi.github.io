// src/lib/format.ts
var e = (e) => {
	let t = Number(e);
	return Number.isFinite(t) ? t : 0;
}, t = (e, t) => String(e).localeCompare(String(t), void 0, {
	numeric: !0,
	sensitivity: "base"
}), n = (e) => e ? new Date(e).toLocaleString(void 0, {
	weekday: "short",
	day: "numeric",
	month: "short",
	year: "numeric",
	hour: "2-digit",
	minute: "2-digit"
}) : "—", r = (e) => {
	let t = new Date(e);
	return e && !isNaN(t.getTime()) ? n(t.getTime()) : "—";
}, i = (e) => e ? e.split("-").reverse().join("/") : "", a = (t) => e(t.total) || e(t.gents) + e(t.ladies) + e(t.children) + e(t.infants), o = (e) => [...new Set(["gents", "ladies"].flatMap((t) => (e.rooms?.[t] || []).map((e) => String(e.room_no || "").trim()).filter(Boolean)))];
export { a, o as i, t as n, r as o, e as r, n as s, i as t };
