import { f as e, h as t, i as n, n as r, p as i, u as a } from "./PmsContext-BVMd13Oi.js";
import { t as o } from "./useQuery-BUXPY6q6.js";
import { a as s, i as c, n as l, r as u, t as d } from "./select-VcH2xuqJ.js";
import { t as f } from "./checkbox-C3tIiLfF.js";
import { t as p } from "./label-CMEyi--P.js";
import { t as m } from "./createLucideIcon-CQUC5AEZ.js";
import { t as h } from "./printer-_t2PY0au.js";
import { t as g } from "./x-Dis6Osjy.js";
import { t as _ } from "./button-BGWa3SLr.js";
import { i as v, n as y, r as b, t as x } from "./card-B9_OGomP.js";
import { t as S } from "./input-DSBk_UeU.js";
import { a as C, n as ee, o as te, r as w, s as T, t as ne } from "./table-DKR1WqRT.js";
import { t as E } from "./utils-b7UP9Cmo.js";
import { t as re } from "./ConfirmDialog-GfriOiUy.js";
import { t as ie } from "./useSlips-DUKbzGma.js";
import { t as D } from "./badge-EB7Muw37.js";
import { t as ae } from "./usePrefs-CeGrJo8w.js";
// node_modules/lucide-react/dist/esm/icons/copy.mjs
var O = {
	name: "copy",
	size: 24,
	node: [["rect", {
		width: "14",
		height: "14",
		x: "8",
		y: "8",
		rx: "2",
		ry: "2",
		key: "17jyea"
	}], ["path", {
		d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",
		key: "zix9uf"
	}]]
};
O.node;
var oe = m(O), k = /* @__PURE__ */ t(i(), 1), A = (e) => String(e).padStart(2, "0"), j = (e) => `${e.getFullYear()}-${A(e.getMonth() + 1)}-${A(e.getDate())}`, se = (e, t) => {
	let n = /* @__PURE__ */ new Date(`${e}T12:00`);
	return n.setDate(n.getDate() + t), j(n);
}, M = (e, t) => String(e).localeCompare(String(t), void 0, {
	numeric: !0,
	sensitivity: "base"
}), N = (e) => new Date(e).toLocaleTimeString(void 0, {
	hour: "2-digit",
	minute: "2-digit"
}), P = (e) => new Date(e).toLocaleString(void 0, {
	weekday: "short",
	day: "2-digit",
	month: "short",
	hour: "2-digit",
	minute: "2-digit"
}), F = (e) => {
	let t = Math.round(e / 6e4);
	return t < 60 ? `${t} min` : `${Math.floor(t / 60)} h${t % 60 ? ` ${t % 60} min` : ""}`;
}, I = {
	1: "Urgent",
	2: "Check Required",
	3: "Checkout House keeping",
	4: "Daily Housekeeping"
};
function ce(e, t, n, r, i, a) {
	let o = (/* @__PURE__ */ new Date(`${n}T03:00`)).getTime(), s = o + 864e5, c = /* @__PURE__ */ new Map();
	for (let t of e) if (!t.deleted) for (let e of i.rowsOf(t)) {
		if (!e.start || !e.end || e.beds <= 0) continue;
		let n = `${i.normB(e.building)}|${a.normRoom(e.room_no)}`;
		c.has(n) || c.set(n, []), c.get(n).push({
			...e,
			sh: t.sh_no,
			tour: t.tour_name || "",
			delayed: e.status !== "booked"
		});
	}
	let l = [];
	for (let e of t.filter((e) => !r || e.name === r)) for (let t of e.rooms.filter((e) => e.active !== !1 && !(e.handed?.at && Date.parse(e.handed.at) <= o))) {
		let n = c.get(`${e.name}|${a.normRoom(t.room_no)}`) || [], r = n.filter((e) => e.end >= o && e.end < s), i = n.filter((e) => e.start >= o && e.start < s), u = n.filter((e) => e.start < o && e.end >= s);
		if (!r.length && !i.length && !u.length) continue;
		let d = r.length ? Math.max(...r.map((e) => e.end)) : null, f = i.length ? Math.min(...i.map((e) => e.start)) : null, p = i.length ? null : n.filter((e) => e.start >= s).sort((e, t) => e.start - t.start)[0] || null, m, h, g;
		if (r.length && i.length) {
			m = 1;
			let e = f - d;
			h = e > 0 ? `${F(e)} between them` : "arrival before the last leaves — check with the desk", g = [Math.max(0, e), f];
		} else i.length ? (m = 2, h = u.length ? "others staying in the room" : "room empty until then", g = [f, 0]) : r.length ? (m = 3, h = p ? `next arrival ${P(p.start)}` : "no one booked after", g = [p ? p.start : Infinity, d]) : (m = 4, h = "stay-over", g = [0, 0]);
		l.push({
			p: m,
			sortKey: g,
			bld: e.name,
			room: String(t.room_no).trim(),
			floor: String(t.floor || "").trim() || a.floorOf(t.room_no),
			cap: Number(t.capacity) || 0,
			outs: r,
			ins: i,
			stays: u,
			lastOut: d,
			firstIn: f,
			note: h
		});
	}
	return l.sort((e, t) => e.p - t.p || e.sortKey[0] - t.sortKey[0] || e.sortKey[1] - t.sortKey[1] || M(e.bld, t.bld) || M(e.room, t.room)), l;
}
var L = (e) => String(e ?? "").replace(/[&<>"']/g, (e) => ({
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
})[e]);
function le(e, t) {
	let { cats: n, all: r } = t, i = n.length === 1 && n[0] === 1, a = [...new Set(e.map((e) => `${e.bld}|${e.floor}`))].sort((e, t) => M(e.split("|")[0], t.split("|")[0]) || M(e.split("|")[1], t.split("|")[1])).map((i) => {
		let [a, o] = i.split("|"), s = e.filter((e) => e.bld === a && e.floor === o), c = n.map((e) => {
			let t = s.filter((t) => t.p === e).map((e) => e.room).sort(M);
			return t.length ? `<tr><th>${L(I[e])}<small>${t.length}</small></th><td><div class="rooms">${t.map((e) => `<span>${L(e)}</span>`).join("")}</div></td></tr>` : "";
		}).join(""), l = t.staffOn(a, o);
		return `<section><h2>${r ? `${L(a)} · ` : ""}Floor ${L(o)}${l.length ? ` <span class="staff">— ${l.map(L).join(", ")}</span>` : ""}</h2><table>${c}</table></section>`;
	}).join("") || "<p>—</p>", o = i ? "Urgent Room Cleaning Assignment Report" : "Room Cleaning Assignment Report";
	return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${o}</title><style>
        @page { margin: 12mm; } body { font: 16px/1.5 Arial, Helvetica, sans-serif; color: #000; margin: 0; }
        section { break-inside: avoid; padding: 4px 0 10px; }
        h2 { font-size: 18px; margin: 8px 0 4px; } h2 .staff { font-weight: 600; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        th, td { border: 1px solid #000; padding: 4px 6px; vertical-align: top; }
        th { width: 210px; text-align: left; font-size: 15px; } th small { float: right; font-weight: 400; }
        /* rooms in a fixed grid: every wrapped line lines up under the one above */
        .rooms { display: grid; grid-template-columns: repeat(auto-fill, minmax(58px, 1fr)); gap: 3px; }
        .rooms span { border: 1px solid #555; border-radius: 3px; text-align: center; font-size: 16px; font-weight: 700; padding: 1px 0; }
        .day { font-size: 20px; font-weight: 700; margin: 0 0 6px; padding-bottom: 6px; border-bottom: 2px solid #000; }
        .title { font-size: 22px; font-weight: 800; text-align: center; margin: 0 0 2px; }
        .bld { font-size: 18px; font-weight: 700; text-align: center; margin: 0 0 6px; }
        </style></head><body><h1 class="title">${o}</h1>
        <p class="bld">${r ? "All buildings" : L(t.buildingName)}</p>
        <p class="day">${L((/* @__PURE__ */ new Date(`${t.day}T12:00`)).toLocaleDateString("en-GB", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric"
	}))}</p>${a}<script>window.addEventListener('load', function () { setTimeout(function () { window.focus(); window.print(); }, 200); });<\/script></body></html>`;
}
function ue(e, t) {
	let { cats: n, all: r } = t, i = n.length === 1 && n[0] === 1, a = (e, t) => `${e} ${t}px Arial, Helvetica, sans-serif`, o = [...new Set(e.map((e) => `${e.bld}|${e.floor}`))].sort((e, t) => M(e.split("|")[0], t.split("|")[0]) || M(e.split("|")[1], t.split("|")[1])).map((i) => {
		let [a, o] = i.split("|"), s = e.filter((e) => e.bld === a && e.floor === o), c = t.staffOn(a, o), l = n.map((e) => {
			let t = s.filter((t) => t.p === e).map((e) => e.room).sort(M);
			return {
				label: I[e],
				n: t.length,
				rooms: t
			};
		}).filter((e) => e.n);
		return {
			head: `${r ? `${a} · ` : ""}Floor ${o}${c.length ? ` — ${c.join(", ")}` : ""}`,
			lines: l
		};
	}), s = (e) => Math.max(1, Math.ceil(e / 8)) * 34 - 6 + 16, c = 150 + o.reduce((e, t) => e + 34 + t.lines.reduce((e, t) => e + s(t.n), 0) + 14, 0) + 20, l = document.createElement("canvas");
	l.width = 1800, l.height = Math.max(c, 210) * 2;
	let u = l.getContext("2d");
	u.scale(2, 2), u.fillStyle = "#fff", u.fillRect(0, 0, 900, l.height / 2), u.fillStyle = "#000", u.textBaseline = "middle", u.textAlign = "center", u.font = a(800, 26), u.fillText(i ? "Urgent Room Cleaning Assignment Report" : "Room Cleaning Assignment Report", 450, 36), u.font = a(700, 20), u.fillText(r ? "All buildings" : t.buildingName, 450, 70), u.textAlign = "left", u.font = a(700, 20), u.fillText((/* @__PURE__ */ new Date(`${t.day}T12:00`)).toLocaleDateString("en-GB", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric"
	}), 20, 108), u.fillRect(20, 126, 860, 2);
	let d = 144;
	o.length || (u.font = a(500, 18), u.fillText("—", 20, d + 20));
	for (let e of o) {
		u.fillStyle = "#000", u.font = a(800, 19), u.textAlign = "left", u.fillText(e.head, 20, d + 17), d += 34;
		for (let t of e.lines) {
			let e = s(t.n);
			u.strokeStyle = "#000", u.lineWidth = 1, u.strokeRect(20.5, d + .5, 859, e - 1), u.beginPath(), u.moveTo(270.5, d), u.lineTo(270.5, d + e), u.stroke(), u.fillStyle = "#000", u.font = a(700, 16), u.textAlign = "left", u.fillText(t.label, 28, d + e / 2), u.textAlign = "right", u.font = a(500, 14), u.fillText(String(t.n), 262, d + e / 2), t.rooms.forEach((e, t) => {
				let n = 278 + t % 8 * 68, r = d + 8 + Math.floor(t / 8) * 34;
				u.strokeStyle = "#555", u.strokeRect(n + .5, r + .5, 61, 27), u.fillStyle = "#000", u.textAlign = "center", u.font = a(700, 16), u.fillText(e, n + 31, r + 14);
			}), d += e;
		}
		d += 14;
	}
	return l;
}
// src/pages/housekeeping/HousekeepingPage.tsx
var R = e(), z = {
	1: "bg-bad-soft text-destructive",
	2: "bg-warn-soft text-warn",
	3: "bg-secondary text-secondary-foreground",
	4: "bg-muted text-muted-foreground"
};
function B({ ws: e, at: t }) {
	return /* @__PURE__ */ (0, R.jsx)(R.Fragment, { children: e.map((e, n) => /* @__PURE__ */ (0, R.jsxs)("span", {
		className: "block whitespace-nowrap",
		children: [
			t === "out" ? N(e.end) : t === "stay" ? `until ${P(e.end)}` : N(e.start),
			" · SH ",
			e.sh,
			" · ",
			e.beds,
			" bed",
			e.beds === 1 ? "" : "s",
			e.delayed && /* @__PURE__ */ (0, R.jsx)("i", {
				className: "ml-1 text-xs text-warn",
				children: "delayed"
			})
		]
	}, n)) });
}
function V() {
	let { rooms: e, stay: t } = r(), i = n(), { siteId: m } = a(), { ask: O, dialog: A } = re(), { prefs: N, setPrefs: P } = ae(), [F, L] = (0, k.useState)(j(/* @__PURE__ */ new Date())), [V, de] = (0, k.useState)(""), [H, fe] = (0, k.useState)(!1), [U, pe] = (0, k.useState)([
		1,
		2,
		3,
		4
	]), [W, me] = (0, k.useState)(""), G = `pms_hk_done:${m}:${F}`, he = () => {
		try {
			return new Set(JSON.parse(localStorage.getItem(G) || "[]"));
		} catch {
			return /* @__PURE__ */ new Set();
		}
	}, [K, ge] = (0, k.useState)(he), [_e, ve] = (0, k.useState)(G);
	_e !== G && (ve(G), ge(he()));
	let ye = o({
		queryKey: ["buildings-force", m],
		queryFn: async () => e.buildingsOfSite(await i(e.loadBuildings({ force: !0 })), m).filter((e) => e.rooms.some((e) => e.active !== !1))
	}), q = ie(), J = ye.data ?? [], Y = (0, k.useMemo)(() => V && q.data ? ce(q.data, J, F, V === "*" ? "" : V, t, e) : [], [
		q.data,
		J,
		F,
		V,
		t,
		e
	]), be = (e, t) => {
		let n = new Set(K);
		t ? n.add(e) : n.delete(e), ge(n);
		try {
			localStorage.setItem(G, JSON.stringify([...n]));
		} catch {}
	}, X = (e) => `${m}|${e}`, Z = N.hkStaff || [], Q = (e, t) => N.hkFloors?.[X(e)]?.[t] || [], xe = (e, t, n) => {
		let r = { ...N.hkFloors || {} }, i = { ...r[X(e)] || {} };
		n.length ? i[t] = n : delete i[t], Object.keys(i).length ? r[X(e)] = i : delete r[X(e)], P({ hkFloors: r });
	}, Se = (t) => String(t.floor || "").trim() || e.floorOf(t.room_no), Ce = (e) => [...new Set(e.rooms.filter((e) => e.active !== !1).map(Se))].sort(M);
	function we() {
		let e = W.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 60);
		e && (Z.some((t) => t.toLowerCase() === e.toLowerCase()) || P({ hkStaff: [...Z, e].sort(M) }), me(""));
	}
	async function Te(e) {
		if (!await O({
			title: "Remove staff?",
			confirmLabel: "Remove",
			body: `Remove ${e} from the staff list and from every floor?`
		})) return;
		let t = {};
		for (let [n, r] of Object.entries(N.hkFloors || {})) {
			let i = Object.fromEntries(Object.entries(r).map(([t, n]) => [t, n.filter((t) => t !== e)]).filter(([, e]) => e.length));
			Object.keys(i).length && (t[n] = i);
		}
		P({
			hkStaff: Z.filter((t) => t !== e),
			hkFloors: t
		});
	}
	function Ee() {
		if (!V) {
			alert("Choose a building first.");
			return;
		}
		let e = Y.filter((e) => U.includes(e.p));
		if (!e.length) {
			alert("No rooms in the ticked categories on this day.");
			return;
		}
		let t = window.open("", "_blank");
		t ? (t.document.open(), t.document.write(le(e, {
			cats: U,
			all: V === "*",
			buildingName: V,
			day: F,
			staffOn: Q
		})), t.document.close()) : alert("The browser blocked the new tab. Allow pop-ups for this site, then press Print again.");
	}
	async function De() {
		if (!V) {
			alert("Choose a building first.");
			return;
		}
		let e = Y.filter((e) => U.includes(e.p));
		if (!e.length) {
			alert("No rooms in the ticked categories on this day.");
			return;
		}
		let t = ue(e, {
			cats: U,
			all: V === "*",
			buildingName: V,
			day: F,
			staffOn: Q
		});
		try {
			if (!navigator.clipboard?.write || typeof ClipboardItem > "u") throw Error("no picture clipboard");
			await navigator.clipboard.write([new ClipboardItem({ "image/png": new Promise((e, n) => t.toBlob((t) => t ? e(t) : n(/* @__PURE__ */ Error("empty")), "image/png")) })]), alert("Copied — paste it into WhatsApp.");
		} catch {
			let e = document.createElement("a");
			e.href = t.toDataURL("image/png"), e.download = `housekeeping-${F}${U.length === 4 ? "" : "-" + U.join("")}.png`, e.click();
		}
	}
	let Oe = (e) => Y.filter((t) => t.p === e), ke = (e) => Oe(e).filter((e) => !K.has(`${e.bld}|${e.room}`)).length, $ = Y.filter((e) => !H || !K.has(`${e.bld}|${e.room}`)), Ae = J.filter((e) => V === "*" || e.name === V);
	return /* @__PURE__ */ (0, R.jsxs)("div", {
		className: "mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4",
		children: [
			/* @__PURE__ */ (0, R.jsxs)("header", {
				className: "grid gap-3",
				children: [/* @__PURE__ */ (0, R.jsx)("h1", {
					className: "text-2xl font-bold text-primary",
					children: "Room cleaning"
				}), /* @__PURE__ */ (0, R.jsxs)("div", {
					className: "flex flex-wrap items-end gap-3",
					children: [
						/* @__PURE__ */ (0, R.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, R.jsx)(p, {
								htmlFor: "hkDay",
								children: "Day"
							}), /* @__PURE__ */ (0, R.jsx)(S, {
								id: "hkDay",
								type: "date",
								value: F,
								onChange: (e) => L(e.target.value || j(/* @__PURE__ */ new Date()))
							})]
						}),
						/* @__PURE__ */ (0, R.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, R.jsx)(p, {
								htmlFor: "hkBld",
								children: "Building"
							}), /* @__PURE__ */ (0, R.jsxs)(d, {
								value: V,
								onValueChange: de,
								children: [/* @__PURE__ */ (0, R.jsx)(c, {
									id: "hkBld",
									className: "min-w-52",
									children: /* @__PURE__ */ (0, R.jsx)(s, { placeholder: "Choose a building…" })
								}), /* @__PURE__ */ (0, R.jsxs)(l, { children: [J.map((e) => /* @__PURE__ */ (0, R.jsx)(u, {
									value: e.name,
									children: e.name
								}, e.name)), /* @__PURE__ */ (0, R.jsx)(u, {
									value: "*",
									children: "All buildings"
								})] })]
							})]
						}),
						/* @__PURE__ */ (0, R.jsx)("div", {
							className: "flex gap-1.5",
							children: [
								["Yesterday", -1],
								["Today", 0],
								["Tomorrow", 1]
							].map(([e, t]) => /* @__PURE__ */ (0, R.jsx)(_, {
								variant: "outline",
								onClick: () => L(se(j(/* @__PURE__ */ new Date()), t)),
								children: e
							}, e))
						}),
						/* @__PURE__ */ (0, R.jsxs)("fieldset", {
							className: "flex flex-wrap items-center gap-x-4 gap-y-1 pb-2",
							children: [
								/* @__PURE__ */ (0, R.jsx)("legend", {
									className: "sr-only",
									children: "Print and Copy image include"
								}),
								/* @__PURE__ */ (0, R.jsx)("span", {
									className: "text-sm font-semibold",
									children: "Print:"
								}),
								[
									1,
									2,
									3,
									4
								].map((e) => /* @__PURE__ */ (0, R.jsxs)("label", {
									className: "inline-flex items-center gap-1.5 text-sm",
									children: [/* @__PURE__ */ (0, R.jsx)(f, {
										checked: U.includes(e),
										onCheckedChange: (t) => pe((n) => t === !0 ? [...n, e].sort() : n.filter((t) => t !== e))
									}), I[e]]
								}, e))
							]
						}),
						/* @__PURE__ */ (0, R.jsxs)(_, {
							onClick: Ee,
							children: [/* @__PURE__ */ (0, R.jsx)(h, { className: "size-4" }), "Print"]
						}),
						/* @__PURE__ */ (0, R.jsxs)(_, {
							variant: "outline",
							onClick: () => void De(),
							children: [/* @__PURE__ */ (0, R.jsx)(oe, { className: "size-4" }), "Copy image"]
						})
					]
				})]
			}),
			V && /* @__PURE__ */ (0, R.jsxs)("section", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-5",
				children: [[
					1,
					2,
					3,
					4
				].map((e) => /* @__PURE__ */ (0, R.jsxs)("div", {
					className: "grid gap-0.5 rounded-xl border bg-card p-3",
					children: [
						/* @__PURE__ */ (0, R.jsx)("span", {
							className: E("w-fit rounded-full px-2 py-0.5 text-xs font-bold", z[e]),
							children: I[e]
						}),
						/* @__PURE__ */ (0, R.jsx)("b", {
							className: "text-2xl",
							children: Oe(e).length
						}),
						/* @__PURE__ */ (0, R.jsxs)("small", {
							className: "text-xs text-muted-foreground",
							children: [ke(e), " still to do"]
						})
					]
				}, e)), /* @__PURE__ */ (0, R.jsxs)("div", {
					className: "grid gap-0.5 rounded-xl border bg-card p-3",
					children: [
						/* @__PURE__ */ (0, R.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: "Guests arriving"
						}),
						/* @__PURE__ */ (0, R.jsx)("b", {
							className: "text-2xl",
							children: Y.reduce((e, t) => e + t.ins.reduce((e, t) => e + t.beds, 0), 0)
						}),
						/* @__PURE__ */ (0, R.jsxs)("small", {
							className: "text-xs text-muted-foreground",
							children: ["beds to make ready · ", (/* @__PURE__ */ new Date(`${F}T12:00`)).toLocaleDateString(void 0, {
								weekday: "long",
								day: "numeric",
								month: "short"
							})]
						})
					]
				})]
			}),
			V && /* @__PURE__ */ (0, R.jsxs)(x, { children: [/* @__PURE__ */ (0, R.jsxs)(b, {
				className: "flex-row flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, R.jsx)(v, {
					className: "text-base",
					children: "Staff on floors"
				}), /* @__PURE__ */ (0, R.jsxs)("form", {
					className: "flex gap-2",
					onSubmit: (e) => {
						e.preventDefault(), we();
					},
					children: [/* @__PURE__ */ (0, R.jsx)(S, {
						placeholder: "New staff name",
						maxLength: 60,
						autoComplete: "off",
						value: W,
						onChange: (e) => me(e.target.value),
						className: "w-48"
					}), /* @__PURE__ */ (0, R.jsx)(_, {
						type: "submit",
						variant: "outline",
						children: "+ Add staff"
					})]
				})]
			}), /* @__PURE__ */ (0, R.jsxs)(y, {
				className: "grid gap-3",
				children: [/* @__PURE__ */ (0, R.jsx)("div", {
					className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-3",
					children: Ae.flatMap((e) => Ce(e).map((t) => {
						let n = Q(e.name, t), r = e.rooms.filter((e) => e.active !== !1 && Se(e) === t).length;
						return /* @__PURE__ */ (0, R.jsxs)("div", {
							className: "grid gap-1.5 rounded-lg border bg-white p-2.5",
							children: [
								/* @__PURE__ */ (0, R.jsxs)("b", {
									className: "text-sm",
									children: [
										V === "*" ? `${e.name} · ` : "",
										"Floor ",
										t,
										" ",
										/* @__PURE__ */ (0, R.jsxs)("small", {
											className: "font-normal text-muted-foreground",
											children: [
												r,
												" room",
												r === 1 ? "" : "s"
											]
										})
									]
								}),
								/* @__PURE__ */ (0, R.jsx)("div", {
									className: "flex flex-wrap gap-1",
									children: n.length ? n.map((r, i) => /* @__PURE__ */ (0, R.jsxs)(D, {
										variant: "secondary",
										className: "gap-1",
										children: [r, /* @__PURE__ */ (0, R.jsx)("button", {
											type: "button",
											title: "Take off this floor",
											"aria-label": `Take ${r} off floor ${t}`,
											onClick: () => xe(e.name, t, n.filter((e, t) => t !== i)),
											children: /* @__PURE__ */ (0, R.jsx)(g, { className: "size-3" })
										})]
									}, i)) : /* @__PURE__ */ (0, R.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "no staff yet"
									})
								}),
								/* @__PURE__ */ (0, R.jsxs)(d, {
									value: "",
									onValueChange: (r) => xe(e.name, t, [...n, r]),
									disabled: !Z.length,
									children: [/* @__PURE__ */ (0, R.jsx)(c, {
										className: "h-8 w-full",
										"aria-label": `Add staff to floor ${t}`,
										children: /* @__PURE__ */ (0, R.jsx)(s, { placeholder: "+ staff" })
									}), /* @__PURE__ */ (0, R.jsx)(l, { children: Z.map((e) => /* @__PURE__ */ (0, R.jsx)(u, {
										value: e,
										children: e
									}, e)) })]
								})
							]
						}, `${e.name}|${t}`);
					}))
				}), /* @__PURE__ */ (0, R.jsx)("div", {
					className: "flex flex-wrap items-center gap-1.5 text-sm",
					children: Z.length ? /* @__PURE__ */ (0, R.jsxs)(R.Fragment, { children: ["Staff: ", Z.map((e) => /* @__PURE__ */ (0, R.jsxs)(D, {
						variant: "secondary",
						className: "gap-1",
						children: [e, /* @__PURE__ */ (0, R.jsx)("button", {
							type: "button",
							title: "Remove from the staff list",
							"aria-label": `Remove ${e}`,
							onClick: () => void Te(e),
							children: /* @__PURE__ */ (0, R.jsx)(g, { className: "size-3" })
						})]
					}, e))] }) : "No staff yet — add names above, then put them on floors."
				})]
			})] }),
			/* @__PURE__ */ (0, R.jsxs)(x, {
				className: "gap-0 py-0",
				children: [/* @__PURE__ */ (0, R.jsxs)(b, {
					className: "flex-row items-center justify-between border-b py-3",
					children: [/* @__PURE__ */ (0, R.jsx)(v, {
						className: "text-base",
						children: "Priority list"
					}), /* @__PURE__ */ (0, R.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, R.jsx)(f, {
							id: "hkHide",
							checked: H,
							onCheckedChange: (e) => fe(e === !0)
						}), /* @__PURE__ */ (0, R.jsx)(p, {
							htmlFor: "hkHide",
							children: "hide rooms marked done"
						})]
					})]
				}), /* @__PURE__ */ (0, R.jsx)(y, {
					className: "overflow-x-auto p-0",
					children: V ? $.length ? /* @__PURE__ */ (0, R.jsxs)(ne, { children: [/* @__PURE__ */ (0, R.jsx)(te, { children: /* @__PURE__ */ (0, R.jsxs)(T, { children: [
						/* @__PURE__ */ (0, R.jsx)(C, { children: "Done" }),
						/* @__PURE__ */ (0, R.jsx)(C, { children: "#" }),
						/* @__PURE__ */ (0, R.jsx)(C, { children: "Priority" }),
						/* @__PURE__ */ (0, R.jsx)(C, { children: "Building · room" }),
						/* @__PURE__ */ (0, R.jsx)(C, { children: "Leaves" }),
						/* @__PURE__ */ (0, R.jsx)(C, { children: "Arrives" }),
						/* @__PURE__ */ (0, R.jsx)(C, { children: "Note" })
					] }) }), /* @__PURE__ */ (0, R.jsx)(ee, { children: $.map((e, t) => {
						let n = `${e.bld}|${e.room}`;
						return /* @__PURE__ */ (0, R.jsxs)(T, {
							className: E(K.has(n) && "opacity-50"),
							children: [
								/* @__PURE__ */ (0, R.jsx)(w, { children: /* @__PURE__ */ (0, R.jsx)(f, {
									checked: K.has(n),
									onCheckedChange: (e) => be(n, e === !0),
									"aria-label": `Room ${e.room} done`
								}) }),
								/* @__PURE__ */ (0, R.jsx)(w, { children: t + 1 }),
								/* @__PURE__ */ (0, R.jsx)(w, { children: /* @__PURE__ */ (0, R.jsx)("span", {
									className: E("rounded-full px-2 py-0.5 text-xs font-bold whitespace-nowrap", z[e.p]),
									children: I[e.p]
								}) }),
								/* @__PURE__ */ (0, R.jsxs)(w, { children: [/* @__PURE__ */ (0, R.jsx)("b", { children: e.room }), /* @__PURE__ */ (0, R.jsxs)("small", {
									className: "block text-muted-foreground",
									children: [
										e.bld,
										" · floor ",
										e.floor,
										" · ",
										e.cap,
										" beds"
									]
								})] }),
								/* @__PURE__ */ (0, R.jsx)(w, { children: e.outs.length ? /* @__PURE__ */ (0, R.jsx)(B, {
									ws: e.outs,
									at: "out"
								}) : e.p === 4 ? /* @__PURE__ */ (0, R.jsx)(B, {
									ws: e.stays,
									at: "stay"
								}) : "—" }),
								/* @__PURE__ */ (0, R.jsx)(w, { children: e.ins.length ? /* @__PURE__ */ (0, R.jsx)(B, {
									ws: e.ins,
									at: "in"
								}) : "—" }),
								/* @__PURE__ */ (0, R.jsx)(w, {
									className: "text-sm text-muted-foreground",
									children: e.note
								})
							]
						}, n);
					}) })] }) : /* @__PURE__ */ (0, R.jsxs)("p", {
						className: "p-3 text-sm text-muted-foreground",
						children: [
							"No check-ins, check-outs or stays ",
							V === "*" ? "" : `in ${V} `,
							"on this day."
						]
					}) : /* @__PURE__ */ (0, R.jsx)("p", {
						className: "p-3 text-sm text-muted-foreground",
						children: "Choose a building to see which rooms to do first."
					})
				})]
			}),
			A
		]
	});
}
export { V as default };
