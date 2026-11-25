import { f as e, h as t, i as n, n as r, p as i, r as a, u as o } from "./PmsContext-BVMd13Oi.js";
import { a as s, i as ee, n as te, o as ne, t as re } from "./dialog-DtgtvZ4Q.js";
import { t as ie } from "./checkbox-C3tIiLfF.js";
import { t as ae } from "./label-CMEyi--P.js";
import { t as c } from "./createLucideIcon-CQUC5AEZ.js";
import { t as oe } from "./plus-CPwEqLyF.js";
import { t as se } from "./x-Dis6Osjy.js";
import { t as l } from "./button-BGWa3SLr.js";
import { t as u } from "./card-B9_OGomP.js";
import { t as d } from "./input-DSBk_UeU.js";
import { t as f } from "./utils-b7UP9Cmo.js";
import { t as ce } from "./ConfirmDialog-GfriOiUy.js";
import { t as le } from "./PromptDialog-D_1ik4AU.js";
import { t as p } from "./badge-EB7Muw37.js";
import { t as ue } from "./textarea-BxHERF6b.js";
// node_modules/lucide-react/dist/esm/icons/key-round.mjs
var m = {
	name: "key-round",
	size: 24,
	node: [["path", {
		d: "M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z",
		key: "1s6t7t"
	}], ["circle", {
		cx: "16.5",
		cy: "7.5",
		r: ".5",
		fill: "currentColor",
		key: "w0ekpg"
	}]]
};
m.node;
var de = c(m), h = /* @__PURE__ */ t(i(), 1), g = (e) => String(e ?? "").replace(/[&<>"']/g, (e) => ({
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
})[e]);
function fe(e) {
	let t = Math.max(10, Math.ceil(e.length / 3));
	return [
		0,
		1,
		2
	].map((n) => e.slice(n * t, (n + 1) * t));
}
function pe({ building: e, at: t, rooms: n }) {
	let [r, i] = t.split("T"), a = (() => {
		let [e, t] = i.split(":").map(Number);
		return `${String(e % 12 || 12).padStart(2, "0")}:${String(t).padStart(2, "0")} ${e < 12 ? "AM" : "PM"}`;
	})(), o = fe(n), s = Math.max(...o.map((e) => e.length)), ee = Array.from({ length: s }, (e, t) => `<tr>${o.map((e) => `<td>${g(e[t] ?? "")}</td>`).join("")}</tr>`).join("");
	return `<!doctype html><html><head><meta charset="utf-8"><title>Room hand-over ${g(e)} ${g(r)}</title><style>
        @page { size: A4 portrait; margin: 12mm; }
        * { box-sizing: border-box; }
        html, body { margin: 0; background: #fff; color: #000; font: 700 12pt/1.3 Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        td { border: 1.2px solid #000; padding: 3mm 2mm; text-align: center; overflow-wrap: anywhere; }
        .h td { font-size: 14pt; padding: 4.5mm 2mm; } .gap td { height: 11mm; } .sign td { height: 30mm; }
        .tot td:last-child { width: 33.33%; }
        @media screen { body { padding: 10mm; background: #eee; } .page { background: #fff; padding: 8mm; max-width: 190mm; margin: 0 auto; } }
    </style></head><body><div class="page">
        <table><tbody><tr class="h"><td>ROOM KEY'S HAND OVER TO HOTEL ${g(e)}</td></tr><tr><td>DATE :- ${g(r.split("-").reverse().join("/"))}</td></tr><tr><td>TIME :- ${g(a)}</td></tr></tbody></table>
        <table><tbody>${ee}</tbody></table>
        <table><tbody><tr class="gap"><td></td></tr></tbody></table>
        <table><tbody><tr class="tot"><td>TOTAL</td><td>${n.length}</td></tr><tr class="sign"><td>NAME AND SIGN</td><td></td></tr></tbody></table>
    </div><script>window.addEventListener('load', () => setTimeout(() => window.print(), 250));<\/script></body></html>`;
}
// src/pages/builder/BuilderPage.tsx
var _ = e(), me = [
	"",
	"gents",
	"ladies",
	"family"
], v = (e, t) => String(e).localeCompare(String(t), void 0, {
	numeric: !0,
	sensitivity: "base"
}), he = (e) => JSON.parse(JSON.stringify(e)), y = "h-9 rounded-md border bg-background px-2 text-sm";
function b() {
	let { cloud: e, rooms: t, stay: i } = r(), c = t, m = a(), g = n(), { site: fe, siteId: b } = o(), { ask: x, dialog: ge } = ce(), { ask: _e, dialog: ve } = le(), S = e.canWrite(b), [C, ye] = (0, h.useState)([]), [w, T] = (0, h.useState)({}), [E, D] = (0, h.useState)(null), [O, k] = (0, h.useState)(/* @__PURE__ */ new Set()), [A, j] = (0, h.useState)({
		q: "",
		floor: ""
	}), [be, xe] = (0, h.useState)(null), [Se, M] = (0, h.useState)(""), [Ce, we] = (0, h.useState)(/* @__PURE__ */ new Set()), [N, P] = (0, h.useState)(!1), [F, I] = (0, h.useState)({
		from: "",
		to: "",
		cap: 4,
		type: ""
	}), [Te, Ee] = (0, h.useState)(""), [De, Oe] = (0, h.useState)([]), [ke, Ae] = (0, h.useState)(!1), je = (0, h.useRef)(0), [Me, Ne] = (0, h.useState)(!1), L = (e) => e.id ? `id${e.id}` : e._key, R = (e) => C.find((t) => L(t) === e) || null, z = (e) => {
		let t = w[e];
		if (!t) return !1;
		let n = R(e);
		if (!n) return !0;
		let r = (e) => JSON.stringify({
			name: e.name,
			sort: Number(e.sort) || 0,
			notes: e.notes || "",
			rooms: e.rooms
		});
		return r(t) !== r(n);
	}, B = E ? w[E] : null, V = !S || !c.roomsState.serverSupportsRooms, H = (0, h.useCallback)(async (e) => {
		let t = await g(c.loadBuildings({ force: !0 }));
		c.roomsState.serverSupportsRooms ? xe(S ? null : {
			t: m.readonlyReason || "Read-only.",
			bad: !1
		}) : xe({
			t: "The PMS server has not been updated for Rooms & Buildings yet. Ask the admin to redeploy worker.js and run schema.sql (see worker/README.md).",
			bad: !0
		});
		let n = c.buildingsOfSite(t, b).map(he);
		ye(n), T((e) => {
			let t = {};
			for (let [r, i] of Object.entries(e)) (!r.startsWith("id") || n.some((e) => L(e) === r)) && (t[r] = i);
			return t;
		}), D((t) => {
			let r = e === void 0 ? t : e;
			return r && (n.some((e) => L(e) === r) || r.startsWith("new")) ? r : n[0] ? L(n[0]) : null;
		}), Ne(!0);
	}, [b]);
	(0, h.useEffect)(() => {
		H();
	}, [H]), (0, h.useEffect)(() => {
		if (E && !w[E]) {
			let e = R(E);
			e && T((t) => ({
				...t,
				[E]: he(e)
			}));
		}
		k(/* @__PURE__ */ new Set()), we(/* @__PURE__ */ new Set()), j({
			q: "",
			floor: ""
		});
	}, [E, C]), (0, h.useEffect)(() => {
		let e = (e) => {
			Object.keys(w).some(z) && (e.preventDefault(), e.returnValue = "");
		};
		return window.addEventListener("beforeunload", e), () => window.removeEventListener("beforeunload", e);
	}), (0, h.useEffect)(() => {
		(async () => {
			if (S) try {
				Oe((await g(fetch("app/data/rooms-seed.json").then((e) => e.json()))).buildings.filter((e) => e.site === b));
			} catch {
				Oe([]);
			}
		})();
	}, []);
	let U = (e) => {
		E && T((t) => {
			let n = he(t[E]);
			return e(n), {
				...t,
				[E]: n
			};
		});
	}, W = (0, h.useMemo)(() => {
		let e = C.map((e) => w[L(e)] || e);
		for (let t of Object.values(w)) t.id || e.push(t);
		return e;
	}, [C, w]), G = (e) => e.floor || c.floorOf(e.room_no), Pe = B ? [...new Set(B.rooms.map(G))].sort(v) : [], K = B ? B.rooms.map((e, t) => t).filter((e) => {
		let t = B.rooms[e], n = c.normRoom(A.q);
		return n && !c.normRoom(t.room_no).includes(n) && !String(t.notes || "").toUpperCase().includes(n) ? !1 : !(A.floor && G(t) !== A.floor);
	}) : [], Fe = new Map((R(E)?.rooms || []).map((e) => [c.normRoom(e.room_no), JSON.stringify(e)]));
	function Ie() {
		(async () => {
			let e = (await _e({ title: "Name of the new building:" }) || "").trim().toUpperCase();
			if (!e) return;
			if (W.some((t) => t.name === e)) {
				M(`${e} already exists.`);
				return;
			}
			let t = `new${++je.current}`;
			T((n) => ({
				...n,
				[t]: {
					_key: t,
					site: b,
					name: e,
					sort: W.length,
					notes: "",
					rooms: []
				}
			})), D(t);
		})();
	}
	function Le(e, t) {
		let n = 0, r = 0;
		return U((i) => {
			let a = new Map(i.rooms.map((e) => [c.normRoom(e.room_no), e]));
			for (let o of e) {
				let e = a.get(c.normRoom(o.room_no));
				if (e) {
					t && e.capacity !== o.capacity && (e.capacity = o.capacity, r++);
					continue;
				}
				let s = {
					room_no: o.room_no,
					floor: c.floorOf(o.room_no),
					capacity: o.capacity,
					type: o.type || "",
					notes: "",
					active: !0
				};
				i.rooms.push(s), a.set(c.normRoom(s.room_no), s), n++;
			}
			i.rooms.sort((e, t) => v(e.room_no, t.room_no));
		}), k(/* @__PURE__ */ new Set()), {
			added: n,
			updated: r
		};
	}
	function Re() {
		let { from: e, cap: t } = F, n = F.to.trim() || e.trim();
		if (!/^\d+$/.test(e.trim()) || !/^\d+$/.test(n) || Number(n) < Number(e)) {
			M("Enter two room numbers, e.g. 501 and 520.");
			return;
		}
		if (Number(n) - Number(e) > 500) {
			M("At most 500 rooms at once.");
			return;
		}
		if (!Number.isInteger(Number(t)) || t < 0 || t > 50) {
			M("Beds must be 0–50.");
			return;
		}
		let r = [];
		for (let i = Number(e); i <= Number(n); i++) r.push({
			room_no: String(i).padStart(e.trim().length, "0"),
			capacity: Number(t),
			type: F.type
		});
		let i = new Set(B.rooms.map((e) => c.normRoom(e.room_no))), a = r.filter((e) => !i.has(c.normRoom(e.room_no))).length;
		Le(r, !1), M(`${a} room(s) added${r.length - a ? `, ${r.length - a} already existed` : ""} — not saved yet.`);
	}
	function ze() {
		let e = Te.split(/[,;\n]+/).map((e) => e.trim()).filter(Boolean), t = [], n = [];
		for (let r of e) {
			let e = r.match(/^([A-Za-z0-9-]{1,12})\s*[:\s]\s*(\d{1,2})$/);
			e && Number(e[2]) <= 50 ? t.push({
				room_no: e[1].toUpperCase(),
				capacity: Number(e[2])
			}) : n.push(r);
		}
		if (!t.length) {
			M("Nothing recognised. Use e.g. 501:4, 502:3");
			return;
		}
		let { added: r, updated: i } = Le(t, !0);
		M(`${r} added, ${i} updated${n.length ? `, ${n.length} not understood: ${n.slice(0, 5).join(", ")}` : ""} — not saved yet.`), n.length || Ee("");
	}
	let Be = (e, t) => {
		O.size ? (U((t) => {
			for (let n of O) e(t.rooms[n]);
		}), M(`${t} for ${O.size} room(s) — not saved yet.`)) : M("Tick the rooms first (the box at the start of each row).");
	}, [Ve, He] = (0, h.useState)(""), [q, J] = (0, h.useState)(null), Y = (e) => String(e).padStart(2, "0"), X = () => [...O].map((e) => B.rooms[e]).filter(Boolean);
	function Ue() {
		if (!X().filter((e) => !e.handed).length) {
			M("Tick the rooms to hand over first.");
			return;
		}
		if (z(E)) {
			M("Save or discard your changes first: a hand-over is saved straight away.");
			return;
		}
		let e = /* @__PURE__ */ new Date();
		J({
			date: `${e.getFullYear()}-${Y(e.getMonth() + 1)}-${Y(e.getDate())}`,
			time: `${Y(e.getHours())}:${Y(e.getMinutes())}`
		});
	}
	async function We(t, n, r) {
		let i = JSON.parse(JSON.stringify(B));
		i.rooms.forEach((e) => {
			n.has(e.room_no) && t(e);
		}), P(!0);
		try {
			let e = await g(c.saveBuilding(i));
			return T((e) => {
				let t = { ...e };
				return delete t[E], t;
			}), await H(L(e)), k(/* @__PURE__ */ new Set()), M(r), !0;
		} catch (t) {
			return M(t instanceof e.UserError ? t.message : "Could not save: " + (t.message || t)), !1;
		} finally {
			P(!1);
		}
	}
	let Ge = (e, t) => {
		let n = window.open("", "_blank");
		n ? (n.document.open(), n.document.write(pe({
			building: B.name,
			at: e,
			rooms: t
		})), n.document.close()) : M("The browser blocked the form: allow pop-ups for this site.");
	};
	async function Ke() {
		let t = `${q.date}T${q.time}`, n = Date.parse(t);
		if (!q.date || !q.time || Number.isNaN(n)) {
			M("Choose the date and time.");
			return;
		}
		let r = X().filter((e) => !e.handed), a = new Set(r.map((e) => e.room_no)), o = new Set(r.map((e) => c.normRoom(e.room_no))), s = /* @__PURE__ */ new Map();
		for (let e of await m.all()) if (!e.deleted) for (let t of i.rowsOf(e)) i.normB(t.building) === i.normB(B.name) && o.has(c.normRoom(t.room_no)) && t.end > n && (s.get(t.room_no) ?? s.set(t.room_no, /* @__PURE__ */ new Set()).get(t.room_no)).add(`SH ${e.sh_no}`);
		if (s.size && !await x({
			title: "These rooms still have stays after that moment",
			confirmLabel: "Hand over anyway",
			body: [
				...[...s].map(([e, t]) => `Room ${e}: ${[...t].join(", ")}`),
				"",
				"Change their rooms on the slip, or they keep pointing at a room the hotel has back."
			].join("\n")
		})) return;
		J(null);
		let ee = String(e.currentDesk()?.name || "");
		await We((e) => {
			e.handed = {
				at: t,
				by: ee
			};
		}, a, `${r.length} room(s) handed over: out of use from ${t.replace("T", " ")}.`) && Ge(t, r.map((e) => e.room_no).sort(v));
	}
	async function qe() {
		let e = X().filter((e) => e.handed);
		e.length ? z(E) ? M("Save or discard your changes first.") : await x({
			title: `Take back ${e.length} room(s)?`,
			confirmLabel: "Take back",
			body: "They return to use, as if never handed over. Use this for a mistake, or if the hotel gives them back."
		}) && await We((e) => {
			delete e.handed;
		}, new Set(e.map((e) => e.room_no)), `${e.length} room(s) back in use.`) : M("Tick rooms that were handed over.");
	}
	function Je() {
		let e = X().filter((e) => e.handed);
		e.length ? Ge(e[0].handed.at, e.filter((t) => t.handed.at === e[0].handed.at).map((e) => e.room_no).sort(v)) : M("Tick rooms that were handed over.");
	}
	async function Ye(e) {
		return (await m.all()).filter((t) => String(t.building || "").trim().toUpperCase() === e).length;
	}
	async function Xe() {
		let t = B;
		if (!t.name.trim()) {
			M("Give the building a name.");
			return;
		}
		let n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Set();
		if (t.rooms.forEach((e, t) => {
			let i = c.normRoom(e.room_no);
			i ? n.has(i) ? (r.add(t), r.add(n.get(i))) : n.set(i, t) : r.add(t), (!Number.isInteger(e.capacity) || e.capacity < 0 || e.capacity > 50) && r.add(t);
		}), r.size) {
			j({
				q: "",
				floor: ""
			}), we(r), M(`${r.size} room(s) need fixing (highlighted): each room needs a unique number and 0–50 beds.`);
			return;
		}
		let i = R(E);
		if (i && i.name !== t.name) {
			let e = await Ye(i.name);
			if (e && !await x({
				title: `Rename to ${t.name} anyway?`,
				body: `${e} slip(s) are for building ${i.name}. They keep that name — renaming here does not change them.`,
				confirmLabel: "Rename"
			})) return;
		}
		P(!0), M("Saving…");
		try {
			let e = await g(c.saveBuilding(t));
			T((e) => {
				let t = { ...e };
				return delete t[E], t;
			}), await H(L(e)), M(`Saved ${e.name}: ${e.rooms.length} rooms, ${c.totalBeds(e)} beds.`);
		} catch (n) {
			M(n instanceof e.UserError ? n.message : "Save failed: " + (n.message || n)), n.status === 409 && await x({
				title: `Throw away your changes to ${t.name} and load the latest version?`,
				body: n.message,
				confirmLabel: "Load latest"
			}) && (T((e) => {
				let t = { ...e };
				return delete t[E], t;
			}), await H(E));
		} finally {
			P(!1);
		}
	}
	async function Ze() {
		if (!E || !z(E) || !await x({
			title: "Throw away the unsaved changes to this building?",
			confirmLabel: "Discard"
		})) return;
		let e = !R(E), t = E;
		T((e) => {
			let n = { ...e };
			return delete n[t], n;
		}), e && D(C[0] ? L(C[0]) : null);
	}
	async function Qe() {
		let e = B;
		if (!e.id) {
			T((e) => {
				let t = { ...e };
				return delete t[E], t;
			}), D(C[0] ? L(C[0]) : null);
			return;
		}
		let t = await Ye(e.name);
		if (await x({
			title: `Delete building ${e.name} with ${e.rooms.length} rooms?`,
			body: t ? `${t} slip(s) are for this building; they are not deleted, but capacities for it will come from old slips again.` : void 0,
			confirmLabel: "Delete"
		})) try {
			await g(c.removeBuilding(R(E))), T((e) => {
				let t = { ...e };
				return delete t[E], t;
			}), await H(null);
		} catch (e) {
			M(e.message || String(e));
		}
	}
	let Z = De.filter((e) => {
		let t = C.find((t) => t.name === e.name);
		return !t || !t.rooms.length;
	});
	async function $e() {
		if (await x({
			title: `Create ${Z.map((e) => e.name).join(", ")} with their rooms and bed counts?`,
			confirmLabel: "Create"
		})) {
			P(!0);
			try {
				for (let [e, t] of Z.entries()) {
					let n = C.find((e) => e.name === t.name), r = t.rooms.map((e) => ({
						room_no: e.room_no,
						floor: c.floorOf(e.room_no),
						capacity: e.capacity,
						type: "",
						notes: e.capacity ? "" : "no beds in the original list",
						active: !0
					})).sort((e, t) => v(e.room_no, t.room_no));
					await g(c.saveBuilding(n ? {
						...n,
						rooms: r
					} : {
						site: b,
						name: t.name,
						sort: e,
						notes: "",
						rooms: r
					}));
				}
				await H(), xe({
					t: `Created ${Z.length} building(s) from the room lists.`,
					bad: !1
				});
			} catch (e) {
				M(e.message || String(e));
			} finally {
				P(!1);
			}
		}
	}
	let Q = (e, t, n) => U((r) => {
		r.rooms[e][t] = n;
	}), et = W.reduce((e, t) => e + t.rooms.length, 0), tt = B ? (() => {
		let e = B.rooms.filter((e) => e.active !== !1);
		return {
			active: e.length,
			floors: new Set(B.rooms.map(G)).size,
			zero: e.filter((e) => !e.capacity).length
		};
	})() : null;
	if (!Me) return /* @__PURE__ */ (0, _.jsx)("div", {
		className: "mx-auto max-w-[2400px] p-4 text-sm text-muted-foreground",
		children: "Loading…"
	});
	let $ = (e, t, n = "") => /* @__PURE__ */ (0, _.jsxs)("div", {
		className: f("grid gap-1", n),
		children: [/* @__PURE__ */ (0, _.jsx)(ae, { children: e }), t]
	});
	return /* @__PURE__ */ (0, _.jsxs)("div", {
		className: "mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4",
		children: [
			/* @__PURE__ */ (0, _.jsxs)("header", {
				className: "grid gap-1",
				children: [
					/* @__PURE__ */ (0, _.jsxs)("h1", {
						className: "text-2xl font-bold text-primary",
						children: ["Rooms & Buildings — ", fe.label]
					}),
					/* @__PURE__ */ (0, _.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Every building, room and bed count for this site. Slip, Forecast, Grid, Timeline and Home read capacities from here."
					}),
					be && /* @__PURE__ */ (0, _.jsx)("p", {
						className: f("rounded-md border px-3 py-2 text-sm", be.bad ? "border-destructive bg-destructive/10 text-destructive" : "bg-accent"),
						children: be.t
					})
				]
			}),
			Z.length > 0 && !V && /* @__PURE__ */ (0, _.jsxs)(u, {
				className: "flex-row flex-wrap items-center justify-between gap-3 p-4",
				children: [/* @__PURE__ */ (0, _.jsxs)("div", { children: [/* @__PURE__ */ (0, _.jsx)("h3", {
					className: "font-bold",
					children: "Start from the original room lists"
				}), /* @__PURE__ */ (0, _.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [Z.map((e) => `${e.name} (${e.rooms.length} rooms, ${e.rooms.reduce((e, t) => e + t.capacity, 0)} beds)`).join(" · "), " — from the original PMS room lists. Everything stays editable afterwards."]
				})] }), /* @__PURE__ */ (0, _.jsx)(l, {
					disabled: N,
					onClick: () => void $e(),
					children: "Create from room lists"
				})]
			}),
			/* @__PURE__ */ (0, _.jsxs)("div", {
				className: "grid items-start gap-3 lg:grid-cols-[16rem_minmax(0,1fr)]",
				children: [/* @__PURE__ */ (0, _.jsxs)(u, {
					className: "gap-2 p-3",
					children: [
						/* @__PURE__ */ (0, _.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, _.jsx)("h3", {
								className: "font-bold",
								children: "Buildings"
							}), S && c.roomsState.serverSupportsRooms && /* @__PURE__ */ (0, _.jsxs)(l, {
								size: "sm",
								variant: "outline",
								onClick: Ie,
								children: [/* @__PURE__ */ (0, _.jsx)(oe, { className: "size-3.5" }), "Building"]
							})]
						}),
						/* @__PURE__ */ (0, _.jsx)("select", {
							className: f(y, "lg:hidden"),
							"aria-label": "Building",
							value: E ?? "",
							onChange: (e) => D(e.target.value),
							children: W.map((e) => /* @__PURE__ */ (0, _.jsxs)("option", {
								value: L(e),
								children: [
									e.name,
									z(L(e)) ? " • unsaved" : "",
									" (",
									e.rooms.length,
									" rooms)"
								]
							}, L(e)))
						}),
						/* @__PURE__ */ (0, _.jsx)("ul", {
							className: "hidden gap-1 lg:grid",
							children: W.length ? W.map((e) => {
								let t = L(e);
								return /* @__PURE__ */ (0, _.jsx)("li", { children: /* @__PURE__ */ (0, _.jsxs)("button", {
									type: "button",
									"aria-current": t === E,
									className: f("grid w-full rounded-lg border px-3 py-2 text-left text-sm hover:bg-accent", t === E && "border-gold bg-accent"),
									onClick: () => D(t),
									children: [/* @__PURE__ */ (0, _.jsxs)("b", { children: [e.name || "(unnamed)", z(t) && /* @__PURE__ */ (0, _.jsx)("em", {
										className: "ml-2 text-xs font-normal text-warn",
										children: "unsaved"
									})] }), /* @__PURE__ */ (0, _.jsxs)("span", {
										className: "text-xs text-muted-foreground",
										children: [
											e.rooms.length,
											" rooms · ",
											c.totalBeds(e),
											" beds"
										]
									})]
								}) }, t);
							}) : /* @__PURE__ */ (0, _.jsx)("li", {
								className: "text-sm text-muted-foreground",
								children: "No buildings yet."
							})
						}),
						/* @__PURE__ */ (0, _.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: W.length ? `${fe.label}: ${W.length} buildings · ${et} rooms · ${W.reduce((e, t) => e + c.totalBeds(t), 0)} beds` : ""
						})
					]
				}), B ? /* @__PURE__ */ (0, _.jsxs)(u, {
					className: "gap-3 p-4",
					children: [
						/* @__PURE__ */ (0, _.jsxs)("div", {
							className: "flex flex-wrap items-end gap-3",
							children: [
								$("Building name", /* @__PURE__ */ (0, _.jsx)(d, {
									maxLength: 40,
									autoComplete: "off",
									disabled: V,
									value: B.name,
									onChange: (e) => U((t) => {
										t.name = e.target.value.toUpperCase();
									})
								}), "min-w-48 flex-1"),
								$("Order", /* @__PURE__ */ (0, _.jsx)(d, {
									type: "number",
									step: 1,
									className: "w-24",
									disabled: V,
									value: B.sort || 0,
									onChange: (e) => U((t) => {
										t.sort = Number(e.target.value) || 0;
									})
								})),
								/* @__PURE__ */ (0, _.jsxs)("div", {
									className: "flex flex-wrap gap-1.5",
									children: [
										/* @__PURE__ */ (0, _.jsxs)(p, {
											variant: "outline",
											children: [B.rooms.length, " rooms"]
										}),
										/* @__PURE__ */ (0, _.jsxs)(p, {
											variant: "outline",
											children: [tt.active, " active"]
										}),
										/* @__PURE__ */ (0, _.jsxs)(p, {
											variant: "outline",
											children: [/* @__PURE__ */ (0, _.jsx)("b", { children: c.totalBeds(B) }), "\xA0beds"]
										}),
										/* @__PURE__ */ (0, _.jsxs)(p, {
											variant: "outline",
											children: [tt.floors, " floors"]
										}),
										tt.zero > 0 && /* @__PURE__ */ (0, _.jsxs)(p, {
											variant: "outline",
											className: "border-warn text-warn",
											children: [tt.zero, " active with 0 beds"]
										}),
										z(E) && /* @__PURE__ */ (0, _.jsx)(p, {
											variant: "outline",
											className: "border-warn text-warn",
											children: "unsaved changes"
										})
									]
								})
							]
						}),
						$("Notes", /* @__PURE__ */ (0, _.jsx)(d, {
							maxLength: 500,
							placeholder: "e.g. entrance, lifts, contact at reception",
							disabled: V,
							value: B.notes || "",
							onChange: (e) => U((t) => {
								t.notes = e.target.value;
							})
						})),
						/* @__PURE__ */ (0, _.jsxs)("details", {
							open: !0,
							className: "rounded-lg border p-2",
							children: [
								/* @__PURE__ */ (0, _.jsx)("summary", {
									className: "cursor-pointer font-bold",
									children: "Add rooms"
								}),
								/* @__PURE__ */ (0, _.jsxs)("div", {
									className: "mt-2 flex flex-wrap items-end gap-2",
									children: [
										$("From", /* @__PURE__ */ (0, _.jsx)(d, {
											className: "w-24",
											placeholder: "501",
											inputMode: "numeric",
											disabled: V,
											value: F.from,
											onChange: (e) => I((t) => ({
												...t,
												from: e.target.value
											}))
										})),
										$("To", /* @__PURE__ */ (0, _.jsx)(d, {
											className: "w-24",
											placeholder: "520",
											inputMode: "numeric",
											disabled: V,
											value: F.to,
											onChange: (e) => I((t) => ({
												...t,
												to: e.target.value
											}))
										})),
										$("Beds", /* @__PURE__ */ (0, _.jsx)(d, {
											type: "number",
											min: 0,
											max: 50,
											className: "w-20",
											disabled: V,
											value: F.cap,
											onChange: (e) => I((t) => ({
												...t,
												cap: Number(e.target.value)
											}))
										})),
										$("Type", /* @__PURE__ */ (0, _.jsxs)("select", {
											className: y,
											disabled: V,
											value: F.type,
											onChange: (e) => I((t) => ({
												...t,
												type: e.target.value
											})),
											children: [
												/* @__PURE__ */ (0, _.jsx)("option", {
													value: "",
													children: "any"
												}),
												/* @__PURE__ */ (0, _.jsx)("option", {
													value: "gents",
													children: "gents"
												}),
												/* @__PURE__ */ (0, _.jsx)("option", {
													value: "ladies",
													children: "ladies"
												}),
												/* @__PURE__ */ (0, _.jsx)("option", {
													value: "family",
													children: "family"
												})
											]
										})),
										/* @__PURE__ */ (0, _.jsx)(l, {
											variant: "outline",
											disabled: V,
											onClick: Re,
											children: "Add range"
										})
									]
								}),
								/* @__PURE__ */ (0, _.jsx)("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: "Numbers only: 501 to 520 adds 501, 502 … 520. Existing rooms are left as they are."
								})
							]
						}),
						/* @__PURE__ */ (0, _.jsxs)("details", {
							className: "rounded-lg border p-2",
							children: [
								/* @__PURE__ */ (0, _.jsx)("summary", {
									className: "cursor-pointer font-bold",
									children: "Paste a list"
								}),
								/* @__PURE__ */ (0, _.jsx)(ue, {
									rows: 4,
									className: "mt-2",
									placeholder: "501:4, 502:3, 503:5\nor one per line: 1203A 2",
									disabled: V,
									value: Te,
									onChange: (e) => Ee(e.target.value)
								}),
								/* @__PURE__ */ (0, _.jsxs)("div", {
									className: "mt-2 flex flex-wrap items-center gap-2",
									children: [/* @__PURE__ */ (0, _.jsx)(l, {
										variant: "outline",
										disabled: V,
										onClick: ze,
										children: "Add / update from list"
									}), /* @__PURE__ */ (0, _.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "Room and beds separated by : or space. Existing rooms get the new bed count."
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, _.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, _.jsx)(d, {
									type: "search",
									className: "w-44",
									placeholder: "Find room…",
									"aria-label": "Find room",
									value: A.q,
									onChange: (e) => j((t) => ({
										...t,
										q: e.target.value
									}))
								}),
								/* @__PURE__ */ (0, _.jsxs)("select", {
									className: y,
									"aria-label": "Floor",
									value: A.floor,
									onChange: (e) => j((t) => ({
										...t,
										floor: e.target.value
									})),
									children: [/* @__PURE__ */ (0, _.jsx)("option", {
										value: "",
										children: "All floors"
									}), Pe.map((e) => /* @__PURE__ */ (0, _.jsxs)("option", {
										value: e,
										children: ["Floor ", e]
									}, e))]
								}),
								/* @__PURE__ */ (0, _.jsx)("span", { className: "grow" }),
								/* @__PURE__ */ (0, _.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: O.size ? `${O.size} selected` : ""
								}),
								/* @__PURE__ */ (0, _.jsx)(d, {
									type: "number",
									min: 0,
									max: 50,
									className: "w-24",
									placeholder: "beds",
									"aria-label": "Beds for selected",
									disabled: V,
									value: Ve,
									onChange: (e) => He(e.target.value)
								}),
								/* @__PURE__ */ (0, _.jsx)(l, {
									variant: "outline",
									size: "sm",
									disabled: V,
									onClick: () => {
										let e = Number(Ve);
										!Number.isInteger(e) || e < 0 || e > 50 ? M("Enter beds 0–50.") : Be((t) => {
											t.capacity = e;
										}, `Beds set to ${e}`);
									},
									children: "Set beds"
								}),
								/* @__PURE__ */ (0, _.jsx)(l, {
									variant: "outline",
									size: "sm",
									disabled: V,
									onClick: () => Be((e) => {
										e.active = !0;
									}, "Marked active"),
									children: "Active"
								}),
								/* @__PURE__ */ (0, _.jsx)(l, {
									variant: "outline",
									size: "sm",
									disabled: V,
									onClick: () => Be((e) => {
										e.active = !1;
									}, "Marked inactive"),
									children: "Inactive"
								}),
								/* @__PURE__ */ (0, _.jsxs)(l, {
									size: "sm",
									disabled: V || N,
									title: "Give the ticked rooms back to the hotel: out of use from that moment",
									onClick: Ue,
									children: [/* @__PURE__ */ (0, _.jsx)(de, { className: "size-4" }), "Hand over"]
								}),
								X().some((e) => e.handed) && /* @__PURE__ */ (0, _.jsxs)(_.Fragment, { children: [/* @__PURE__ */ (0, _.jsx)(l, {
									variant: "outline",
									size: "sm",
									disabled: V || N,
									onClick: () => void qe(),
									children: "Take back"
								}), /* @__PURE__ */ (0, _.jsx)(l, {
									variant: "outline",
									size: "sm",
									onClick: Je,
									children: "Print form"
								})] }),
								/* @__PURE__ */ (0, _.jsx)(l, {
									variant: "outline",
									size: "sm",
									className: "text-destructive",
									disabled: V,
									onClick: async () => {
										if (!O.size) {
											M("Tick the rooms first.");
											return;
										}
										if (!await x({
											title: `Remove ${O.size} room(s) from ${B.name}?`,
											confirmLabel: "Remove"
										})) return;
										let e = O;
										U((t) => {
											t.rooms = t.rooms.filter((t, n) => !e.has(n));
										}), k(/* @__PURE__ */ new Set());
									},
									children: "Delete"
								})
							]
						}),
						/* @__PURE__ */ (0, _.jsx)("div", {
							className: "overflow-x-auto",
							children: /* @__PURE__ */ (0, _.jsxs)("table", {
								className: "w-full text-sm",
								children: [/* @__PURE__ */ (0, _.jsx)("thead", { children: /* @__PURE__ */ (0, _.jsxs)("tr", {
									className: "border-b text-left",
									children: [
										/* @__PURE__ */ (0, _.jsx)("th", {
											className: "w-9 p-1",
											children: /* @__PURE__ */ (0, _.jsx)(ie, {
												"aria-label": "Select all shown",
												checked: K.length > 0 && K.every((e) => O.has(e)),
												onCheckedChange: (e) => k((t) => {
													let n = new Set(t);
													return K.forEach((t) => e === !0 ? n.add(t) : n.delete(t)), n;
												})
											})
										}),
										/* @__PURE__ */ (0, _.jsx)("th", {
											className: "p-1",
											children: "Room"
										}),
										/* @__PURE__ */ (0, _.jsx)("th", {
											className: "p-1",
											children: "Floor"
										}),
										/* @__PURE__ */ (0, _.jsx)("th", {
											className: "p-1",
											children: "Beds"
										}),
										/* @__PURE__ */ (0, _.jsx)("th", {
											className: "p-1",
											children: "Type"
										}),
										/* @__PURE__ */ (0, _.jsx)("th", {
											className: "p-1",
											children: "Notes"
										}),
										/* @__PURE__ */ (0, _.jsx)("th", {
											className: "p-1",
											children: "Active"
										}),
										/* @__PURE__ */ (0, _.jsx)("th", {})
									]
								}) }), /* @__PURE__ */ (0, _.jsx)("tbody", { children: K.length ? K.map((e) => {
									let t = B.rooms[e], n = R(E) && Fe.get(c.normRoom(t.room_no)) !== JSON.stringify(t);
									return /* @__PURE__ */ (0, _.jsxs)("tr", {
										className: f("border-b", (t.active === !1 || t.handed) && "opacity-55", n && "bg-accent/50", Ce.has(e) && "bg-destructive/15"),
										children: [
											/* @__PURE__ */ (0, _.jsx)("td", {
												className: "p-1",
												children: /* @__PURE__ */ (0, _.jsx)(ie, {
													"aria-label": `Select room ${t.room_no}`,
													checked: O.has(e),
													onCheckedChange: (t) => k((n) => {
														let r = new Set(n);
														return t === !0 ? r.add(e) : r.delete(e), r;
													})
												})
											}),
											/* @__PURE__ */ (0, _.jsx)("td", {
												className: "p-1",
												children: /* @__PURE__ */ (0, _.jsx)(d, {
													className: "h-8 w-28",
													maxLength: 12,
													"aria-label": "Room number",
													disabled: V,
													value: t.room_no,
													onChange: (t) => Q(e, "room_no", t.target.value.trim())
												})
											}),
											/* @__PURE__ */ (0, _.jsx)("td", {
												className: "p-1",
												children: /* @__PURE__ */ (0, _.jsx)(d, {
													className: "h-8 w-20",
													maxLength: 10,
													placeholder: c.floorOf(t.room_no),
													"aria-label": "Floor",
													disabled: V,
													value: t.floor,
													onChange: (t) => Q(e, "floor", t.target.value)
												})
											}),
											/* @__PURE__ */ (0, _.jsx)("td", {
												className: "p-1",
												children: /* @__PURE__ */ (0, _.jsx)(d, {
													type: "number",
													min: 0,
													max: 50,
													className: "h-8 w-20",
													"aria-label": "Beds",
													disabled: V,
													value: t.capacity,
													onChange: (t) => Q(e, "capacity", t.target.value === "" ? 0 : Math.max(0, Math.min(50, Math.round(Number(t.target.value)) || 0)))
												})
											}),
											/* @__PURE__ */ (0, _.jsx)("td", {
												className: "p-1",
												children: /* @__PURE__ */ (0, _.jsx)("select", {
													className: f(y, "h-8"),
													"aria-label": "Type",
													disabled: V,
													value: t.type || "",
													onChange: (t) => Q(e, "type", t.target.value),
													children: me.map((e) => /* @__PURE__ */ (0, _.jsx)("option", {
														value: e,
														children: e || "any"
													}, e))
												})
											}),
											/* @__PURE__ */ (0, _.jsxs)("td", {
												className: "p-1",
												children: [/* @__PURE__ */ (0, _.jsx)(d, {
													className: "h-8 min-w-40",
													maxLength: 200,
													"aria-label": "Notes",
													disabled: V,
													value: t.notes,
													onChange: (t) => Q(e, "notes", t.target.value)
												}), t.handed && /* @__PURE__ */ (0, _.jsxs)("small", {
													className: "mt-0.5 block whitespace-nowrap text-xs font-semibold text-destructive",
													children: [
														"🔑 Handed over ",
														t.handed.at.split("T")[0].split("-").reverse().join("/"),
														" ",
														t.handed.at.split("T")[1],
														t.handed.by ? ` · ${t.handed.by}` : ""
													]
												})]
											}),
											/* @__PURE__ */ (0, _.jsx)("td", {
												className: "p-1",
												children: /* @__PURE__ */ (0, _.jsx)(ie, {
													"aria-label": "Active",
													disabled: V,
													checked: t.active !== !1,
													onCheckedChange: (t) => Q(e, "active", t === !0)
												})
											}),
											/* @__PURE__ */ (0, _.jsx)("td", {
												className: "p-1",
												children: /* @__PURE__ */ (0, _.jsx)(l, {
													size: "icon",
													variant: "ghost",
													className: "size-7",
													title: "Remove room",
													"aria-label": "Remove room",
													disabled: V,
													onClick: () => {
														U((t) => {
															t.rooms.splice(e, 1);
														}), k(/* @__PURE__ */ new Set());
													},
													children: /* @__PURE__ */ (0, _.jsx)(se, { className: "size-4" })
												})
											})
										]
									}, e);
								}) : /* @__PURE__ */ (0, _.jsx)("tr", { children: /* @__PURE__ */ (0, _.jsx)("td", {
									colSpan: 8,
									className: "p-2 text-muted-foreground",
									children: B.rooms.length ? "No room matches the filter." : "No rooms yet — use “Add rooms”."
								}) }) })]
							})
						}),
						/* @__PURE__ */ (0, _.jsx)("div", { children: /* @__PURE__ */ (0, _.jsxs)(l, {
							variant: "outline",
							size: "sm",
							disabled: V,
							onClick: () => {
								U((e) => {
									e.rooms.push({
										room_no: "",
										floor: "",
										capacity: 0,
										type: "",
										notes: "",
										active: !0
									});
								}), j({
									q: "",
									floor: ""
								});
							},
							children: [/* @__PURE__ */ (0, _.jsx)(oe, { className: "size-3.5" }), "Room"]
						}) }),
						/* @__PURE__ */ (0, _.jsxs)("details", {
							className: "rounded-lg border p-2",
							open: ke,
							onToggle: (e) => Ae(e.target.open),
							children: [/* @__PURE__ */ (0, _.jsx)("summary", {
								className: "cursor-pointer font-bold",
								children: "Floor map"
							}), ke && (() => {
								let e = /* @__PURE__ */ new Map();
								for (let t of B.rooms) {
									let n = G(t) || "?";
									(e.get(n) ?? e.set(n, []).get(n)).push(t);
								}
								return /* @__PURE__ */ (0, _.jsx)("div", {
									className: "mt-2 grid gap-2",
									children: e.size ? [...e.keys()].sort(v).map((t) => /* @__PURE__ */ (0, _.jsxs)("div", { children: [/* @__PURE__ */ (0, _.jsxs)("b", {
										className: "text-sm",
										children: ["Floor ", t]
									}), /* @__PURE__ */ (0, _.jsx)("div", {
										className: "mt-1 flex flex-wrap gap-1",
										children: e.get(t).sort((e, t) => v(e.room_no, t.room_no)).map((e, t) => /* @__PURE__ */ (0, _.jsxs)("span", {
											title: `${e.type || "any"}${e.notes ? " — " + e.notes : ""}`,
											className: f("rounded-md border px-2 py-0.5 text-xs", e.active === !1 && "opacity-50", e.type === "gents" && "bg-blue-50", e.type === "ladies" && "bg-pink-50", e.type === "family" && "bg-green-50"),
											children: [
												e.room_no,
												" · ",
												e.capacity
											]
										}, t))
									})] }, t)) : /* @__PURE__ */ (0, _.jsx)("p", {
										className: "text-sm text-muted-foreground",
										children: "No rooms."
									})
								});
							})()]
						}),
						/* @__PURE__ */ (0, _.jsxs)("div", {
							className: "sticky bottom-0 flex flex-wrap items-center gap-2 border-t bg-card py-2",
							children: [
								/* @__PURE__ */ (0, _.jsx)(l, {
									disabled: V || N,
									onClick: () => void Xe(),
									children: "Save building"
								}),
								/* @__PURE__ */ (0, _.jsx)(l, {
									variant: "outline",
									disabled: V,
									onClick: () => void Ze(),
									children: "Discard changes"
								}),
								/* @__PURE__ */ (0, _.jsx)("span", {
									className: "grow text-sm text-muted-foreground",
									children: Se || (B.updated_by ? `Last saved by ${B.updated_by}, ${new Date(B.updated_at).toLocaleString()}` : B.id ? "" : "Not saved yet")
								}),
								/* @__PURE__ */ (0, _.jsx)(l, {
									variant: "outline",
									className: "text-destructive",
									disabled: V,
									onClick: () => void Qe(),
									children: "Delete building"
								})
							]
						})
					]
				}) : /* @__PURE__ */ (0, _.jsx)(u, {
					className: "p-6 text-sm text-muted-foreground",
					children: "Choose a building on the left, or add one."
				})]
			}),
			ge,
			ve,
			/* @__PURE__ */ (0, _.jsx)(re, {
				open: !!q,
				onOpenChange: (e) => {
					e || J(null);
				},
				children: /* @__PURE__ */ (0, _.jsxs)(te, {
					className: "max-w-[calc(100%-1rem)] sm:max-w-sm",
					children: [
						/* @__PURE__ */ (0, _.jsx)(s, { children: /* @__PURE__ */ (0, _.jsx)(ne, { children: "Hand over to the hotel" }) }),
						/* @__PURE__ */ (0, _.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [
								B?.name,
								": ",
								q ? X().filter((e) => !e.handed).map((e) => e.room_no).join(", ") : "",
								". From this moment they are out of use everywhere; nights before it stay in the numbers. The form prints next, for signing."
							]
						}),
						q && /* @__PURE__ */ (0, _.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, _.jsxs)("div", {
								className: "grid gap-1",
								children: [/* @__PURE__ */ (0, _.jsx)(ae, {
									htmlFor: "hoD",
									children: "Date"
								}), /* @__PURE__ */ (0, _.jsx)(d, {
									id: "hoD",
									type: "date",
									value: q.date,
									onChange: (e) => J((t) => ({
										...t,
										date: e.target.value
									}))
								})]
							}), /* @__PURE__ */ (0, _.jsxs)("div", {
								className: "grid gap-1",
								children: [/* @__PURE__ */ (0, _.jsx)(ae, {
									htmlFor: "hoT",
									children: "Time"
								}), /* @__PURE__ */ (0, _.jsx)(d, {
									id: "hoT",
									type: "time",
									value: q.time,
									onChange: (e) => J((t) => ({
										...t,
										time: e.target.value
									}))
								})]
							})]
						}),
						/* @__PURE__ */ (0, _.jsxs)(ee, {
							className: "gap-2",
							children: [/* @__PURE__ */ (0, _.jsx)(l, {
								variant: "outline",
								onClick: () => J(null),
								children: "Cancel"
							}), /* @__PURE__ */ (0, _.jsxs)(l, {
								disabled: N,
								onClick: () => void Ke(),
								children: [/* @__PURE__ */ (0, _.jsx)(de, { className: "size-4" }), "Hand over"]
							})]
						})
					]
				})
			})
		]
	});
}
export { b as default };
