import { f as e, h as t, i as n, n as r, p as i, s as a, u as o } from "./PmsContext-BVMd13Oi.js";
import { t as s } from "./useQuery-BUXPY6q6.js";
import { t as c } from "./checkbox-C3tIiLfF.js";
import { t as l } from "./label-CMEyi--P.js";
import { t as u } from "./clipboard-copy-tf2KqiDa.js";
import { t as d } from "./share-2-CEVagBFD.js";
import { t as f } from "./button-BGWa3SLr.js";
import { n as p, t as m } from "./card-B9_OGomP.js";
import { t as h } from "./input-DSBk_UeU.js";
import { a as g, i as _, n as v, o as y, r as b, s as x, t as S } from "./table-DKR1WqRT.js";
import { t as ee } from "./utils-b7UP9Cmo.js";
// src/pages/tosha/tosha.ts
var C = /* @__PURE__ */ t(i(), 1), w = (e) => e.vehicle === "other" && /^\s*train\s*$/i.test(String(e.vlabel || "")), T = (e, t) => e.vehicle === "car" ? +!!t?.buses[D(e)]?.driver : w(e) ? 0 : 2, te = {
	time: "06:30",
	biryani: !1,
	burger: !1,
	packet: !0
}, E = {
	packet: !0,
	burger: !1,
	driver: !1
}, ne = (e) => ({
	madina: {
		...te,
		...e?.madina || {}
	},
	buses: e?.buses || {}
}), D = (e) => e.rows[0].key, O = (e, t, n = t + "s") => `${e} ${e === 1 ? t : n}`, k = (e) => e.rows.map((e) => e.leader).filter(Boolean);
function A(e) {
	let t = (t) => e.fleetText(t, "no buses"), n = (t) => e.vehicleNo(t.bus, t.vehicle, t.vlabel);
	return {
		fleet: t,
		vno: n,
		vlabel: (t) => `${e.VEHICLES[t.vehicle].icon} ${n(t) || "—"}`,
		busChoice: (e, t) => ({
			...E,
			...e.buses[D(t)] || {}
		})
	};
}
function re(e, t, n, r, i) {
	let { fleet: a, vno: o } = A(e), s = [...n.buses].sort((e, t) => e.at.localeCompare(t.at)), c = r.madina, l = s.reduce((e, t) => e + t.pax, 0), u = s.reduce((e, t) => e + T(t, r), 0), d = l + u, f = c.biryani ? "Biryani" : c.burger ? "Burger" : "";
	return {
		model: {
			title: `${i.label} · TOSHA`,
			sub: `${e.sheetDate(t)} · ${a(s)}`,
			notes: [`Preparation time: ${e.time12(`2000-01-01T${c.time || "06:30"}`)}`, `Prepare: ${[c.packet && "Tosha packet", f].filter(Boolean).join(" + ") || "—"}`],
			head: [
				"Bus",
				"Time",
				"From",
				"Groups",
				"Pax",
				"+",
				"Total"
			],
			widths: [
				12,
				12,
				15,
				33,
				9,
				7,
				12
			],
			align: [
				void 0,
				void 0,
				void 0,
				void 0,
				"right",
				"right",
				"right"
			],
			rows: s.map((t) => ({ cells: [
				o(t) || "—",
				e.time12(t.at),
				t.building || "",
				k(t).join(", "),
				t.pax,
				T(t, r) ? `+${T(t, r)}` : "",
				t.pax + T(t, r)
			] })),
			foot: [
				"Total",
				"",
				"",
				O(n.groups, "group"),
				l,
				u ? `+${u}` : "",
				d
			],
			chips: [c.packet && `Tosha packets: ${d}`, f && `${f}: ${d}`].filter(Boolean)
		},
		buses: s,
		pax: l,
		extra: u,
		total: d,
		meal: f
	};
}
function ie(e, t, n, r, i) {
	let { fleet: a, vno: o, busChoice: s } = A(e), c = [...n.buses].sort((e, t) => e.at.localeCompare(t.at) || (e.bus ?? 0) - (t.bus ?? 0)), l = /* @__PURE__ */ new Map();
	for (let e of c) {
		let t = e.at.slice(11, 16);
		l.has(t) || l.set(t, []), l.get(t).push(e);
	}
	let u = c.reduce((e, t) => e + t.pax, 0), d = c.reduce((e, t) => e + T(t, i), 0), f = u + d, p = c.reduce((e, t) => e + (s(i, t).packet ? t.pax + T(t, i) : 0), 0), m = c.reduce((e, t) => e + (s(i, t).burger ? t.pax + T(t, i) : 0), 0), h = [];
	for (let [t, n] of l) {
		let r = n.reduce((e, t) => e + t.pax, 0), c = n.reduce((e, t) => e + T(t, i), 0);
		h.push({
			slot: !0,
			cells: [
				e.time12(`2000-01-01T${t}`),
				a(n),
				"",
				r,
				c ? `+${c}` : "",
				r + c,
				"",
				""
			]
		});
		for (let e of n) {
			let t = s(i, e);
			h.push({ cells: [
				`   ${o(e) || "—"}`,
				e.building || "",
				k(e).join(", "),
				e.pax,
				T(e, i) ? `+${T(e, i)}` : "",
				e.pax + T(e, i),
				t.packet ? "✓" : "",
				t.burger ? "✓" : ""
			] });
		}
	}
	return {
		model: {
			title: `${r.label} · TOSHA`,
			sub: `${e.sheetDate(t)} · ${a(c)}`,
			notes: [],
			head: [
				"Time / Bus",
				"From",
				"Groups",
				"Pax",
				"+",
				"Total",
				"Tosha",
				"Burger"
			],
			widths: [
				20,
				12,
				30,
				8,
				6,
				9,
				7,
				8
			],
			align: [
				void 0,
				void 0,
				void 0,
				"right",
				"right",
				"right",
				"center",
				"center"
			],
			rows: h,
			foot: [
				"Total",
				"",
				O(n.groups, "group"),
				u,
				d ? `+${d}` : "",
				f,
				p,
				m || ""
			],
			chips: [`Tosha packets: ${p}`, m && `Burgers: ${m}`].filter(Boolean)
		},
		buses: c,
		slots: l,
		pax: u,
		extra: d,
		total: f,
		packets: p,
		burgers: m
	};
}
function ae(e, t, n, r) {
	let { fleet: i, vno: a } = A(e), o = [...n.buses].sort((e, t) => e.at.localeCompare(t.at) || (e.bus ?? 0) - (t.bus ?? 0));
	return {
		model: {
			title: r.label,
			sub: `${e.sheetDate(t)} · ${i(o)}`,
			notes: [],
			head: [
				"Bus",
				"Time",
				"From",
				"Groups",
				"Pax"
			],
			widths: [
				12,
				13,
				15,
				48,
				12
			],
			align: [
				void 0,
				void 0,
				void 0,
				void 0,
				"right"
			],
			rows: o.map((t) => ({ cells: [
				a(t) || "—",
				e.time12(t.at),
				t.building || "",
				k(t).join(", "),
				t.pax
			] })),
			foot: [
				"Total",
				"",
				"",
				O(n.groups, "group"),
				n.pax
			],
			chips: []
		},
		buses: o
	};
}
function j(e) {
	let t = 1100, n = e.notes.length ? e.notes.length * 28 + 14 : 0, r = e.chips.length ? 56 : 0, i = 92 + n + 38 + Math.max(1, e.rows.length) * 36 + (e.foot ? 36 : 0) + r + 22, a = document.createElement("canvas");
	a.width = t * 2, a.height = i * 2;
	let o = a.getContext("2d");
	o.scale(2, 2), o.fillStyle = "#fff9e6", o.fillRect(0, 0, t, i);
	let s = 22;
	if (o.fillStyle = "#f1c232", o.fillRect(22, s, 1056, 70), o.fillStyle = "#fff", o.textBaseline = "middle", o.font = "900 32px \"Arial Black\", Arial, sans-serif", o.fillText(e.title, 40, s + 35), o.font = "700 20px Arial, sans-serif", o.textAlign = "right", o.fillText(e.sub, 1060, s + 35), o.textAlign = "left", s += 70, e.notes.length) {
		s += 10, o.fillStyle = "#3d3100", o.font = "700 20px Arial, sans-serif";
		for (let t of e.notes) o.fillText(t, 28, s + 13), s += 28;
		s += 4;
	}
	let c = e.widths.reduce((e, t) => e + t, 0), l = 1056, u = [], d = 22;
	for (let t of e.widths) u.push(d), d += t / c * l;
	let f = (t, n, r, i, a, s) => {
		let d = e.widths[n] / c * l;
		o.font = a, o.fillStyle = s;
		let f = String(t ?? "");
		for (; f.length > 1 && o.measureText(f).width > d - 14;) f = f.slice(0, -2) + "…";
		o.textAlign = e.align?.[n] === "right" ? "right" : e.align?.[n] === "center" ? "center" : "left";
		let p = o.textAlign === "right" ? u[n] + d - 8 : o.textAlign === "center" ? u[n] + d / 2 : u[n] + 8;
		o.fillText(f, p, r + i / 2), o.textAlign = "left";
	}, p = (e, t, n) => {
		o.fillStyle = n, o.fillRect(22, e, l, t), o.strokeStyle = "#c9a227", o.lineWidth = 1, o.strokeRect(22.5, e + .5, 1055, t - 1);
		for (let n of u.slice(1)) o.beginPath(), o.moveTo(n + .5, e), o.lineTo(n + .5, e + t), o.stroke();
	};
	p(s, 38, "#ffd966"), e.head.forEach((e, t) => f(e, t, s, 38, "900 15px \"Arial Black\", Arial, sans-serif", "#3d3100")), s += 38, e.rows.length || (p(s, 36, "#fff2cc"), o.font = "600 17px Arial", o.fillStyle = "#3d3226", o.fillText("No buses", 32, s + 18), s += 36);
	for (let t of e.rows) p(s, 36, t.slot ? "#ffe8a3" : "#fff2cc"), t.cells.forEach((e, n) => f(e, n, s, 36, t.slot ? "800 17px Arial, sans-serif" : "700 17px Arial, sans-serif", "#1f1600")), s += 36;
	if (e.foot && (p(s, 36, "#ffffff"), e.foot.forEach((e, t) => f(e, t, s, 36, "900 18px Arial, sans-serif", "#000")), s += 36), e.chips.length) {
		s += 12, o.font = "800 19px Arial, sans-serif";
		let t = 22;
		for (let n of e.chips) {
			let e = o.measureText(n).width + 28;
			o.fillStyle = "#fff3d1", o.strokeStyle = "#d4af37", o.beginPath(), o.roundRect(t, s, e, 36, 18), o.fill(), o.stroke(), o.fillStyle = "#3d3100", o.fillText(n, t + 14, s + 18), t += e + 10;
		}
	}
	return a;
}
var oe = (e) => new Promise((t) => e.toBlob(t, "image/png"));
function se(e) {
	let t = atob(e.toDataURL("image/png").split(",")[1]), n = new Uint8Array(t.length);
	for (let e = 0; e < t.length; e++) n[e] = t.charCodeAt(e);
	return new Blob([n], { type: "image/png" });
}
function ce(e, t) {
	let n = e.map(j), r = n[0].width, i = document.createElement("canvas");
	i.width = r, i.height = 120 + n.reduce((e, t) => e + t.height + 10, 0);
	let a = i.getContext("2d");
	a.fillStyle = "#fff9e6", a.fillRect(0, 0, i.width, i.height), a.fillStyle = "#7a5410", a.fillRect(44, 36, r - 88, 76), a.fillStyle = "#fff", a.textBaseline = "middle", a.font = "900 52px \"Arial Black\", Arial, sans-serif", a.fillText(t, 80, 74);
	let o = 120;
	for (let e of n) a.drawImage(e, 0, o), o += e.height + 10;
	return i;
}
// src/pages/tosha/ToshaPage.tsx
var M = e(), le = typeof File == "function" && !!navigator.canShare?.({ files: [new File([""], "x.png", { type: "image/png" })] });
function N({ n: e, text: t }) {
	return /* @__PURE__ */ (0, M.jsxs)("div", {
		className: "flex items-baseline gap-2",
		children: [/* @__PURE__ */ (0, M.jsx)("b", {
			className: "text-4xl text-primary",
			children: e
		}), /* @__PURE__ */ (0, M.jsx)("span", {
			className: "text-sm text-muted-foreground",
			children: t
		})]
	});
}
function ue({ list: e }) {
	return /* @__PURE__ */ (0, M.jsx)("div", {
		className: "flex flex-wrap gap-2",
		children: e.map((e) => /* @__PURE__ */ (0, M.jsx)("span", {
			className: "rounded-full border border-gold bg-accent px-3 py-1 text-sm font-bold",
			children: e
		}, e))
	});
}
var P = ({ b: e }) => /* @__PURE__ */ (0, M.jsxs)(M.Fragment, { children: [k(e)[0] || "", e.rows.length > 1 && /* @__PURE__ */ (0, M.jsxs)("small", {
	className: "block text-muted-foreground",
	children: ["+ ", O(e.rows.length - 1, "more group")]
})] });
function F({ label: e, day: t, writable: i }) {
	let { transport: a, cloud: w } = r(), E = n(), { siteId: k } = o(), F = a.destsFor(k), de = F.find((e) => e.tosha === "long"), { fleet: I, vno: L, vlabel: R, busChoice: z } = (0, C.useMemo)(() => A(a), [a]), [B, V] = (0, C.useState)(null), [H, U] = (0, C.useState)({}), [W, G] = (0, C.useState)(!1), [K, fe] = (0, C.useState)(""), q = (0, C.useRef)(null), J = s({
		queryKey: [
			"tosha",
			k,
			t
		],
		queryFn: async () => {
			let [e, n] = await E(Promise.all([a.loadDay(k, t), w.request("GET", `/api/tosha?site=${encodeURIComponent(k)}&day=${t}`)]));
			return {
				groups: a.signage(e.rows, k),
				choice: ne(n.data),
				updated_at: n.updated_at,
				updated_by: n.updated_by
			};
		},
		refetchInterval: 6e4
	});
	(0, C.useEffect)(() => {
		J.data && !q.current && V(J.data);
	}, [J.data]);
	function pe(e) {
		V(e), q.current && clearTimeout(q.current), q.current = setTimeout(async () => {
			q.current = null;
			try {
				let n = await E(w.request("PUT", "/api/tosha", {
					site: k,
					day: t,
					data: e.choice
				}));
				V((e) => e && {
					...e,
					updated_at: n.updated_at,
					updated_by: n.updated_by
				}), fe("");
			} catch (e) {
				fe(e instanceof w.UserError ? e.message : "Could not save the choices.");
			}
		}, 500);
	}
	let Y = (e, t) => {
		if (!B) return;
		let n = {
			...B.choice.madina,
			[e]: t
		};
		t === !0 && e === "biryani" && (n.burger = !1), t === !0 && e === "burger" && (n.biryani = !1), pe({
			...B,
			choice: {
				...B.choice,
				madina: n
			}
		});
	}, me = (e) => e.vehicle === "car" ? /* @__PURE__ */ (0, M.jsxs)(l, {
		className: "inline-flex items-center gap-1 text-xs font-bold",
		children: [/* @__PURE__ */ (0, M.jsx)(c, {
			disabled: $,
			checked: !!z(B.choice, e).driver,
			onCheckedChange: (t) => X(D(e), "driver", t === !0),
			"aria-label": `Driver of ${L(e)}`
		}), "+1"]
	}) : T(e, B.choice) ? `+${T(e, B.choice)}` : "", X = (e, t, n) => B && pe({
		...B,
		choice: {
			...B.choice,
			buses: {
				...B.choice.buses,
				[e]: {
					packet: !0,
					burger: !1,
					...B.choice.buses[e] || {},
					[t]: n
				}
			}
		}
	}), Z = (0, C.useMemo)(() => {
		if (!B) return [];
		let e = {
			long: 0,
			airport: 1,
			summary: 2
		};
		return [...F].sort((t, n) => e[t.tosha] - e[n.tosha]).flatMap((e) => {
			let n = B.groups.find((t) => t.dest.id === e.id);
			return !n || e.onlyWhenUsed && !n.buses.length ? [] : e.tosha === "long" ? [{
				id: "madina",
				D: e,
				kind: "long",
				g: n,
				r: re(a, t, n, B.choice, de)
			}] : e.tosha === "airport" ? [{
				id: e.id,
				D: e,
				kind: "airport",
				g: n,
				r: ie(a, t, n, e, B.choice)
			}] : [{
				id: e.id,
				D: e,
				kind: "summary",
				g: n,
				r: ae(a, t, n, e)
			}];
		});
	}, [B, t]), he = B?.groups.some((e) => e.buses.length), Q = (e, t) => {
		U((n) => ({
			...n,
			[e]: t
		})), setTimeout(() => U((n) => n[e] === t ? {
			...n,
			[e]: ""
		} : n), 6e3);
	};
	async function ge(e, t, n, r, i) {
		if (!W) {
			G(!0);
			try {
				if (i) {
					await navigator.share({
						files: [new File([se(t)], n, { type: "image/png" })],
						title: r
					});
					return;
				}
				await navigator.clipboard.write([new ClipboardItem({ "image/png": oe(t) })]), Q(e, "Copied — paste it in the Mawaid WhatsApp group.");
			} catch (r) {
				if (r?.name === "AbortError") return;
				if (i) {
					Q(e, "Sharing did not open here — use Copy image instead.");
					return;
				}
				let a = document.createElement("a");
				a.href = t.toDataURL("image/png"), a.download = n, a.click(), Q(e, "This browser cannot copy pictures — the image was downloaded instead.");
			} finally {
				G(!1);
			}
		}
	}
	let _e = (e, n) => void ge(e.id, j(e.r.model), `tosha-${e.id}-${t}.png`, e.r.model.title, n), ve = (e) => {
		let n = Z.map((e) => e.r.model).filter((e) => e.rows.length);
		n.length && ge("all", ce(n, `TOSHA SUMMARY · ${a.sheetDate(t)}`), `tosha-${t}.png`, "Tosha summary", e);
	};
	if (J.isError) return /* @__PURE__ */ (0, M.jsxs)("section", {
		className: "grid gap-3",
		children: [/* @__PURE__ */ (0, M.jsx)("h2", {
			className: "text-xl font-bold text-primary",
			children: e
		}), /* @__PURE__ */ (0, M.jsx)("p", {
			className: "text-destructive",
			children: "Could not load the transport lists."
		})]
	});
	if (!B) return /* @__PURE__ */ (0, M.jsxs)("section", {
		className: "grid gap-3",
		children: [/* @__PURE__ */ (0, M.jsx)("h2", {
			className: "text-xl font-bold text-primary",
			children: e
		}), /* @__PURE__ */ (0, M.jsx)("p", {
			className: "text-muted-foreground",
			children: "Loading…"
		})]
	});
	let $ = !i;
	return /* @__PURE__ */ (0, M.jsxs)("section", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, M.jsxs)("h2", {
				className: "text-xl font-bold text-primary",
				children: [
					e,
					" ",
					/* @__PURE__ */ (0, M.jsxs)("small", {
						className: "text-sm font-normal text-muted-foreground",
						children: [a.longDate(t), B.updated_at ? ` · choices saved ${new Date(B.updated_at).toLocaleString()}${B.updated_by ? " by " + B.updated_by : ""}` : ""]
					})
				]
			}),
			K && /* @__PURE__ */ (0, M.jsx)("p", {
				role: "alert",
				className: "text-sm font-semibold text-destructive",
				children: K
			}),
			he ? /* @__PURE__ */ (0, M.jsxs)(M.Fragment, { children: [/* @__PURE__ */ (0, M.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, M.jsxs)(f, {
						disabled: W,
						onClick: () => ve(!1),
						children: [
							/* @__PURE__ */ (0, M.jsx)(u, { className: "size-4" }),
							"Copy all ",
							Z.length,
							" in one image"
						]
					}),
					le && /* @__PURE__ */ (0, M.jsxs)(f, {
						variant: "outline",
						disabled: W,
						onClick: () => ve(!0),
						children: [
							/* @__PURE__ */ (0, M.jsx)(d, { className: "size-4" }),
							"Share all ",
							Z.length
						]
					}),
					/* @__PURE__ */ (0, M.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: H.all
					})
				]
			}), /* @__PURE__ */ (0, M.jsx)("div", {
				className: "grid items-start gap-3 xl:grid-cols-2",
				children: Z.map((e) => {
					let t = e.r.model;
					return /* @__PURE__ */ (0, M.jsxs)(m, {
						className: "min-w-0 gap-0 overflow-hidden py-0",
						children: [/* @__PURE__ */ (0, M.jsxs)("div", {
							className: "bg-[#f1c232] px-4 py-3 text-lg font-black text-white",
							children: [
								e.D.icon,
								" ",
								e.D.label,
								/* @__PURE__ */ (0, M.jsx)("small", {
									className: "ml-3 text-sm font-bold",
									children: e.kind === "long" ? `${I(e.r.buses)} · ${e.r.total} to prepare` : e.kind === "airport" ? `${I(e.r.buses)} · ${e.r.total} pax with staff` : `${I(e.r.buses)} · ${e.g.pax} pax`
								})
							]
						}), /* @__PURE__ */ (0, M.jsxs)(p, {
							className: "grid gap-3 p-4",
							children: [
								e.kind === "long" && (() => {
									let t = e.r, n = B.choice.madina;
									return /* @__PURE__ */ (0, M.jsxs)(M.Fragment, { children: [
										/* @__PURE__ */ (0, M.jsx)(N, {
											n: t.total,
											text: `${t.pax} pax + ${t.extra} for drivers and helpers`
										}),
										/* @__PURE__ */ (0, M.jsxs)("div", {
											className: "flex flex-wrap items-center gap-3",
											children: [/* @__PURE__ */ (0, M.jsxs)(l, {
												className: "gap-2",
												children: ["Preparation ", /* @__PURE__ */ (0, M.jsx)(h, {
													type: "time",
													className: "w-28",
													disabled: $,
													value: n.time || te.time,
													onChange: (e) => Y("time", e.target.value || "06:30")
												})]
											}), [
												"biryani",
												"burger",
												"packet"
											].map((e) => /* @__PURE__ */ (0, M.jsxs)(l, {
												className: "gap-2",
												children: [/* @__PURE__ */ (0, M.jsx)(c, {
													disabled: $,
													checked: !!n[e],
													onCheckedChange: (t) => Y(e, t === !0)
												}), e === "packet" ? "Tosha packet" : e === "biryani" ? "Biryani" : "Burger"]
											}, e))]
										}),
										t.buses.length ? /* @__PURE__ */ (0, M.jsx)("div", {
											className: "overflow-x-auto",
											children: /* @__PURE__ */ (0, M.jsxs)(S, { children: [
												/* @__PURE__ */ (0, M.jsx)(y, { children: /* @__PURE__ */ (0, M.jsxs)(x, { children: [
													/* @__PURE__ */ (0, M.jsx)(g, { children: "Bus" }),
													/* @__PURE__ */ (0, M.jsx)(g, { children: "Time" }),
													/* @__PURE__ */ (0, M.jsx)(g, { children: "From" }),
													/* @__PURE__ */ (0, M.jsx)(g, { children: "Groups" }),
													/* @__PURE__ */ (0, M.jsx)(g, {
														className: "text-right",
														children: "Pax"
													}),
													/* @__PURE__ */ (0, M.jsx)(g, {
														className: "text-right",
														children: "+"
													}),
													/* @__PURE__ */ (0, M.jsx)(g, {
														className: "text-right",
														children: "Total"
													})
												] }) }),
												/* @__PURE__ */ (0, M.jsx)(v, { children: t.buses.map((e) => /* @__PURE__ */ (0, M.jsxs)(x, { children: [
													/* @__PURE__ */ (0, M.jsx)(b, { children: R(e) }),
													/* @__PURE__ */ (0, M.jsx)(b, { children: a.time12(e.at) }),
													/* @__PURE__ */ (0, M.jsx)(b, { children: e.building || "—" }),
													/* @__PURE__ */ (0, M.jsx)(b, { children: /* @__PURE__ */ (0, M.jsx)(P, { b: e }) }),
													/* @__PURE__ */ (0, M.jsx)(b, {
														className: "text-right",
														children: e.pax
													}),
													/* @__PURE__ */ (0, M.jsx)(b, {
														className: "text-right",
														children: me(e)
													}),
													/* @__PURE__ */ (0, M.jsx)(b, {
														className: "text-right font-bold",
														children: e.pax + T(e, B.choice)
													})
												] }, D(e))) }),
												/* @__PURE__ */ (0, M.jsx)(_, { children: /* @__PURE__ */ (0, M.jsxs)(x, { children: [
													/* @__PURE__ */ (0, M.jsx)(b, {
														colSpan: 4,
														children: O(e.g.groups, "group")
													}),
													/* @__PURE__ */ (0, M.jsx)(b, {
														className: "text-right",
														children: t.pax
													}),
													/* @__PURE__ */ (0, M.jsxs)(b, {
														className: "text-right",
														children: ["+", t.extra]
													}),
													/* @__PURE__ */ (0, M.jsx)(b, {
														className: "text-right",
														children: t.total
													})
												] }) })
											] })
										}) : /* @__PURE__ */ (0, M.jsxs)("p", {
											className: "text-muted-foreground",
											children: [
												"No ",
												e.D.title,
												" buses."
											]
										})
									] });
								})(),
								e.kind === "airport" && (() => {
									let t = e.r;
									return /* @__PURE__ */ (0, M.jsxs)(M.Fragment, { children: [/* @__PURE__ */ (0, M.jsx)(N, {
										n: t.total,
										text: `${t.pax} pax + ${t.extra} for the buses · ${t.slots.size} departure time${t.slots.size === 1 ? "" : "s"}`
									}), t.buses.length ? /* @__PURE__ */ (0, M.jsx)("div", {
										className: "overflow-x-auto",
										children: /* @__PURE__ */ (0, M.jsxs)(S, { children: [
											/* @__PURE__ */ (0, M.jsx)(y, { children: /* @__PURE__ */ (0, M.jsxs)(x, { children: [
												/* @__PURE__ */ (0, M.jsx)(g, { children: "Bus" }),
												/* @__PURE__ */ (0, M.jsx)(g, { children: "From" }),
												/* @__PURE__ */ (0, M.jsx)(g, { children: "Groups" }),
												/* @__PURE__ */ (0, M.jsx)(g, {
													className: "text-right",
													children: "Pax"
												}),
												/* @__PURE__ */ (0, M.jsx)(g, {
													className: "text-right",
													children: "+"
												}),
												/* @__PURE__ */ (0, M.jsx)(g, {
													className: "text-right",
													children: "Total"
												}),
												/* @__PURE__ */ (0, M.jsx)(g, {
													className: "text-center",
													children: "Tosha packet"
												}),
												/* @__PURE__ */ (0, M.jsx)(g, {
													className: "text-center",
													children: "Burger"
												})
											] }) }),
											/* @__PURE__ */ (0, M.jsx)(v, { children: [...t.slots].flatMap(([e, t]) => {
												let n = t.reduce((e, t) => e + t.pax, 0), r = t.reduce((e, t) => e + T(t, B.choice), 0);
												return [/* @__PURE__ */ (0, M.jsxs)(x, {
													className: "bg-accent font-bold",
													children: [
														/* @__PURE__ */ (0, M.jsxs)(b, {
															colSpan: 3,
															children: [
																a.time12(`2000-01-01T${e}`),
																" · ",
																I(t)
															]
														}),
														/* @__PURE__ */ (0, M.jsx)(b, {
															className: "text-right",
															children: n
														}),
														/* @__PURE__ */ (0, M.jsx)(b, {
															className: "text-right",
															children: r ? `+${r}` : ""
														}),
														/* @__PURE__ */ (0, M.jsx)(b, {
															className: "text-right",
															children: n + r
														}),
														/* @__PURE__ */ (0, M.jsx)(b, {}),
														/* @__PURE__ */ (0, M.jsx)(b, {})
													]
												}, `s-${e}`), ...t.map((e) => {
													let t = z(B.choice, e), n = D(e);
													return /* @__PURE__ */ (0, M.jsxs)(x, { children: [
														/* @__PURE__ */ (0, M.jsx)(b, { children: R(e) }),
														/* @__PURE__ */ (0, M.jsx)(b, { children: e.building || "—" }),
														/* @__PURE__ */ (0, M.jsx)(b, { children: /* @__PURE__ */ (0, M.jsx)(P, { b: e }) }),
														/* @__PURE__ */ (0, M.jsx)(b, {
															className: "text-right",
															children: e.pax
														}),
														/* @__PURE__ */ (0, M.jsx)(b, {
															className: "text-right",
															children: me(e)
														}),
														/* @__PURE__ */ (0, M.jsx)(b, {
															className: "text-right font-bold",
															children: e.pax + T(e, B.choice)
														}),
														/* @__PURE__ */ (0, M.jsx)(b, {
															className: "text-center",
															children: /* @__PURE__ */ (0, M.jsx)(c, {
																disabled: $,
																checked: !!t.packet,
																onCheckedChange: (e) => X(n, "packet", e === !0),
																"aria-label": `Tosha packet for ${L(e)}`
															})
														}),
														/* @__PURE__ */ (0, M.jsx)(b, {
															className: "text-center",
															children: /* @__PURE__ */ (0, M.jsx)(c, {
																disabled: $,
																checked: !!t.burger,
																onCheckedChange: (e) => X(n, "burger", e === !0),
																"aria-label": `Burger for ${L(e)}`
															})
														})
													] }, n);
												})];
											}) }),
											/* @__PURE__ */ (0, M.jsx)(_, { children: /* @__PURE__ */ (0, M.jsxs)(x, { children: [
												/* @__PURE__ */ (0, M.jsx)(b, {
													colSpan: 3,
													children: O(e.g.groups, "group")
												}),
												/* @__PURE__ */ (0, M.jsx)(b, {
													className: "text-right",
													children: t.pax
												}),
												/* @__PURE__ */ (0, M.jsxs)(b, {
													className: "text-right",
													children: ["+", t.extra]
												}),
												/* @__PURE__ */ (0, M.jsx)(b, {
													className: "text-right",
													children: t.total
												}),
												/* @__PURE__ */ (0, M.jsx)(b, {
													className: "text-center",
													children: t.packets
												}),
												/* @__PURE__ */ (0, M.jsx)(b, {
													className: "text-center",
													children: t.burgers
												})
											] }) })
										] })
									}) : /* @__PURE__ */ (0, M.jsxs)("p", {
										className: "text-muted-foreground",
										children: [
											"No ",
											e.D.title,
											" buses."
										]
									})] });
								})(),
								e.kind === "summary" && (() => {
									let t = e.r;
									return /* @__PURE__ */ (0, M.jsxs)(M.Fragment, { children: [/* @__PURE__ */ (0, M.jsx)(N, {
										n: e.g.pax,
										text: `pax · ${O(e.g.groups, "group")}`
									}), t.buses.length ? /* @__PURE__ */ (0, M.jsx)("div", {
										className: "overflow-x-auto",
										children: /* @__PURE__ */ (0, M.jsxs)(S, { children: [
											/* @__PURE__ */ (0, M.jsx)(y, { children: /* @__PURE__ */ (0, M.jsxs)(x, { children: [
												/* @__PURE__ */ (0, M.jsx)(g, { children: "Bus" }),
												/* @__PURE__ */ (0, M.jsx)(g, { children: "Time" }),
												/* @__PURE__ */ (0, M.jsx)(g, { children: "From" }),
												/* @__PURE__ */ (0, M.jsx)(g, { children: "Groups" }),
												/* @__PURE__ */ (0, M.jsx)(g, {
													className: "text-right",
													children: "Pax"
												})
											] }) }),
											/* @__PURE__ */ (0, M.jsx)(v, { children: t.buses.map((e) => /* @__PURE__ */ (0, M.jsxs)(x, { children: [
												/* @__PURE__ */ (0, M.jsx)(b, { children: R(e) }),
												/* @__PURE__ */ (0, M.jsx)(b, { children: a.time12(e.at) }),
												/* @__PURE__ */ (0, M.jsx)(b, { children: e.building || "—" }),
												/* @__PURE__ */ (0, M.jsx)(b, { children: /* @__PURE__ */ (0, M.jsx)(P, { b: e }) }),
												/* @__PURE__ */ (0, M.jsx)(b, {
													className: "text-right font-bold",
													children: e.pax
												})
											] }, D(e))) }),
											/* @__PURE__ */ (0, M.jsx)(_, { children: /* @__PURE__ */ (0, M.jsxs)(x, { children: [/* @__PURE__ */ (0, M.jsx)(b, {
												colSpan: 4,
												children: "Total"
											}), /* @__PURE__ */ (0, M.jsx)(b, {
												className: "text-right",
												children: e.g.pax
											})] }) })
										] })
									}) : /* @__PURE__ */ (0, M.jsxs)("p", {
										className: "text-muted-foreground",
										children: [
											"No ",
											e.D.title,
											" buses."
										]
									})] });
								})(),
								t.chips.length > 0 && /* @__PURE__ */ (0, M.jsx)(ue, { list: t.chips }),
								/* @__PURE__ */ (0, M.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [
										/* @__PURE__ */ (0, M.jsxs)(f, {
											disabled: W,
											onClick: () => _e(e, !1),
											children: [/* @__PURE__ */ (0, M.jsx)(u, { className: "size-4" }), "Copy image"]
										}),
										le && /* @__PURE__ */ (0, M.jsxs)(f, {
											variant: "outline",
											disabled: W,
											onClick: () => _e(e, !0),
											children: [/* @__PURE__ */ (0, M.jsx)(d, { className: "size-4" }), "Share"]
										}),
										/* @__PURE__ */ (0, M.jsx)("span", {
											className: ee("text-xs text-muted-foreground"),
											children: H[e.id]
										})
									]
								})
							]
						})]
					}, e.id);
				})
			})] }) : /* @__PURE__ */ (0, M.jsxs)("p", {
				className: "rounded-lg border bg-card p-4 text-muted-foreground",
				children: [
					"No transport list saved for ",
					a.longDate(t),
					" yet."
				]
			})
		]
	});
}
function de() {
	let { cloud: e, transport: t } = r(), { siteId: n } = o(), { href: i } = a(), s = e.canWrite(n);
	return /* @__PURE__ */ (0, M.jsxs)("div", {
		className: "mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-4 px-3 pb-10 pt-4 sm:px-4",
		children: [
			/* @__PURE__ */ (0, M.jsxs)("header", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, M.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, M.jsx)("h1", {
						className: "text-2xl font-bold text-primary",
						children: "Tosha summary"
					}), /* @__PURE__ */ (0, M.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Travel refreshments for the buses from the Transport day lists — tomorrow on top, today below. Madina and Jeddah Airport count each bus's pax + 2 (driver and helper); a car adds +1 when its driver box is ticked; a train adds nothing. “Copy image” puts the card on the clipboard to paste in the Mawaid WhatsApp group."
					})]
				}), /* @__PURE__ */ (0, M.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, M.jsx)(f, {
						variant: "outline",
						asChild: !0,
						children: /* @__PURE__ */ (0, M.jsx)("a", {
							href: i("transport-print"),
							children: "🖨️ Bus sheets"
						})
					}), /* @__PURE__ */ (0, M.jsx)(f, {
						variant: "outline",
						asChild: !0,
						children: /* @__PURE__ */ (0, M.jsx)("a", {
							href: i("transport"),
							children: "🚌 Transport day"
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, M.jsx)(F, {
				label: "Tomorrow",
				day: t.addDays(t.today(), 1),
				writable: s
			}),
			/* @__PURE__ */ (0, M.jsx)("div", { className: "border-t-2 border-dashed" }),
			/* @__PURE__ */ (0, M.jsx)(F, {
				label: "Today",
				day: t.today(),
				writable: s
			})
		]
	});
}
export { de as default };
