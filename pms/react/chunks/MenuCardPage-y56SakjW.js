import { f as e, h as t, i as n, o as r, p as i, u as a } from "./PmsContext-BVMd13Oi.js";
import { t as o } from "./label-CMEyi--P.js";
import { t as s } from "./clipboard-copy-tf2KqiDa.js";
import { t as c } from "./download-DbAPjole.js";
import { t as l } from "./share-2-CEVagBFD.js";
import { t as u } from "./button-BGWa3SLr.js";
import { n as d, t as f } from "./card-B9_OGomP.js";
import { t as p } from "./input-DSBk_UeU.js";
import { t as ee } from "./utils-b7UP9Cmo.js";
import { t as m } from "./textarea-BxHERF6b.js";
// src/pages/menu-card/menucard.ts
var h = /* @__PURE__ */ t(i(), 1), g = import.meta.url, _ = new URL("../../assets/menu-card/", g).href, v = 10692e3, y = 756e4, b = 2400, x = Math.round(b * y / v), S = b / v, C = 12700, w = "#57360F", T = [{
	x: 1334552,
	w: 3081145
}, {
	x: 5531706,
	w: 3081145
}], E = {
	y: 2188471,
	h: 515025,
	w: 3078191,
	xs: [1334552, 5533181]
}, D = 3226770, O = 530560, k = 19.52, A = null;
function te() {
	if (A) return A;
	let e = (e) => new Promise((t, n) => {
		let r = new Image();
		r.onload = () => t(r), r.onerror = n, r.src = _ + e;
	}), t = (e, t) => new FontFace(e, `url(${_}${t})`).load().then((e) => (document.fonts.add(e), e));
	return A = Promise.all([
		e("desert.jpg"),
		e("corner.png"),
		e("makkah.png"),
		t("MenuAmiri", "Amiri-Regular.ttf"),
		t("MenuAmiriBold", "Amiri-Bold.ttf")
	]).then(([e, t, n]) => ({
		bg: e,
		corner: t,
		makkah: n
	})).catch((e) => {
		throw A = null, e;
	}), A;
}
var j = (e) => e * S, M = (e, t = !1) => `${(e * C * S).toFixed(2)}px ${t ? "MenuAmiriBold" : "MenuAmiri"}`, N = (e) => e.split(/\r?\n/).map((e) => e.trim()).filter(Boolean);
function P(e, t, n) {
	e.width = b, e.height = x;
	let r = e.getContext("2d"), { bg: i, corner: a, makkah: o } = t, s = (e, t, n, i, a) => {
		r.beginPath(), r.moveTo(e + a, t), r.lineTo(e + n - a, t), r.quadraticCurveTo(e + n, t, e + n, t + a), r.lineTo(e + n, t + i - a), r.quadraticCurveTo(e + n, t + i, e + n - a, t + i), r.lineTo(e + a, t + i), r.quadraticCurveTo(e, t + i, e, t + i - a), r.lineTo(e, t + a), r.quadraticCurveTo(e, t, e + a, t), r.closePath();
	};
	r.save(), r.clearRect(0, 0, b, x), r.letterSpacing = "0px", r.drawImage(i, j(-.2218 * v), 0, j(1.2218 * v), x);
	let c = j(1132280);
	r.drawImage(a, j(9559720), j(39847), c, c), r.save(), r.translate(c, j(39847)), r.scale(-1, 1), r.drawImage(a, 0, 0, c, c), r.restore(), n.siteId === "makkah" ? r.drawImage(o, j(4209293), j(-716804), j(2273413), j(2273413)) : (r.fillStyle = "#1b1208", r.textAlign = "center", r.textBaseline = "alphabetic", r.font = M(38, !0), r.fillText("المدينة المنورة", j(5346e3), j(64e4))), r.fillStyle = w, r.textAlign = "center", r.textBaseline = "alphabetic", r.font = M(30), r.letterSpacing = `${(-.48 * C * S).toFixed(2)}px`, r.fillText(n.greg.trim(), j(531e4), j(13e5), j(62e5)), r.fillText(n.hijri.trim(), j(531e4), j(1765e3), j(62e5)), r.letterSpacing = "0px";
	let l = [`Lunch | ${n.lunchTime.trim()} | الغداء`, `Dinner | ${n.dinnerTime.trim()} | العشاء`];
	E.xs.forEach((e, t) => {
		let n = j(e), i = j(E.y), a = j(E.w), o = j(E.h), c = r.createLinearGradient(n, 0, n + a, 0);
		c.addColorStop(0, "#FFDE59"), c.addColorStop(1, "#FF914D"), r.fillStyle = c, s(n, i, a, o, j(53280)), r.fill(), r.fillStyle = w, r.textAlign = "center", r.textBaseline = "middle", r.font = M(k, !0), r.fillText(l[t], n + a / 2, i + o * .52, a * .94);
	});
	let u = [N(n.lunch), N(n.dinner)], d = Math.max(1, ...u.map((e) => e.length)), f = d > 1 ? Math.min(O, 3473230 / (d - 1)) : O, p = Math.min(k, k * f / O * 1.08);
	r.textAlign = "left", r.textBaseline = "alphabetic", T.forEach((e, t) => {
		let n = j(e.x), i = j(e.w);
		for (let e = 0; e < d; e++) {
			let a = j(D + e * f), o = u[t][e];
			if (o) {
				let e = p;
				for (r.letterSpacing = `${(.58 * C * S).toFixed(2)}px`, r.font = M(e); r.measureText(o).width > i && e > p * .62;) e -= .25, r.font = M(e);
				r.fillStyle = w, r.fillText(o, n + j(5e3), a - j(e * C * .52), i);
			}
			r.save(), r.strokeStyle = "#3B250B", r.lineWidth = j(19050), r.setLineDash([j(19050), j(19050)]), r.beginPath(), r.moveTo(n, a), r.lineTo(n + i, a), r.stroke(), r.restore();
		}
	}), r.letterSpacing = `${(.39 * C * S).toFixed(2)}px`, r.fillStyle = w, r.textAlign = "center", r.font = M(13.01), r.fillText("•   subject to change", j(5141856), j(718e4)), r.restore();
}
// src/pages/menu-card/MenuCardPage.tsx
var F = e(), I = "pms_menu_card", L = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday"
], ne = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December"
], R = (e) => String(e).padStart(2, "0"), z = (e) => `${e.getFullYear()}-${R(e.getMonth() + 1)}-${R(e.getDate())}`, B = () => {
	try {
		let e = JSON.parse(localStorage.getItem(I) || "{}") || {};
		return e.drafts ||= {}, e;
	} catch {
		return { drafts: {} };
	}
}, V = (e) => {
	try {
		localStorage.setItem(I, JSON.stringify(e));
	} catch {}
};
function H() {
	let { siteId: e } = a(), t = n(), i = r(), g = (0, h.useRef)(null), _ = (0, h.useRef)(B()), [v, y] = (0, h.useState)(null), [S, C] = (0, h.useState)(null), [w, T] = (0, h.useState)(!1), [E, D] = (0, h.useState)(z(/* @__PURE__ */ new Date())), [O, k] = (0, h.useState)(_.current.lunchTime || "1:30"), [A, j] = (0, h.useState)(_.current.dinnerTime || "7:30"), [M, I] = (0, h.useState)(""), [H, U] = (0, h.useState)(""), [W, G] = (0, h.useState)(""), [K, q] = (0, h.useState)(""), [J, Y] = (0, h.useState)({ text: "Loading the card…" }), re = typeof File == "function" && !!navigator.canShare?.({ files: [new File([""], "x.jpg", { type: "image/jpeg" })] });
	(0, h.useEffect)(() => {
		i("hijri").then(y);
	}, []), (0, h.useEffect)(() => {
		t(te()).then(C).catch(() => T(!0));
	}, []);
	let ie = (e) => {
		let [t, n, r] = e.split("-").map(Number);
		return t ? new Date(t, n - 1, r) : /* @__PURE__ */ new Date();
	}, X = (e) => {
		let t = ie(e), n = v?.toHijri(t);
		return {
			greg: `${L[t.getDay()]} ${R(t.getDate())} ${ne[t.getMonth()]} ${t.getFullYear()}`,
			hijri: n ? `${R(n.day)} ${v.HIJRI_MONTHS[n.month]} ${n.year}` : ""
		};
	};
	(0, h.useEffect)(() => {
		if (!v) return;
		let e = _.current.drafts[E] || {}, t = X(E);
		I(e.lunch || ""), U(e.dinner || ""), G(e.greg || t.greg), q(e.hijri || t.hijri);
	}, [E, v]), (0, h.useEffect)(() => {
		if (!v) return;
		let e = X(E), t = _.current, n = {
			lunch: M,
			dinner: H,
			greg: W === e.greg ? void 0 : W,
			hijri: K === e.hijri ? void 0 : K
		};
		n.lunch.trim() || n.dinner.trim() || n.greg || n.hijri ? t.drafts[E] = n : delete t.drafts[E];
		let r = Object.keys(t.drafts).sort();
		for (let e of r.slice(0, Math.max(0, r.length - 60))) delete t.drafts[e];
		t.lunchTime = O, t.dinnerTime = A, V(t);
	}, [
		M,
		H,
		W,
		K,
		O,
		A
	]), (0, h.useEffect)(() => {
		if (!S || !g.current) return;
		let t = requestAnimationFrame(() => P(g.current, S, {
			greg: W,
			hijri: K,
			lunchTime: O,
			dinnerTime: A,
			lunch: M,
			dinner: H,
			siteId: e
		}));
		return () => cancelAnimationFrame(t);
	}, [
		S,
		W,
		K,
		O,
		A,
		M,
		H,
		e
	]), (0, h.useEffect)(() => {
		w ? Y({
			text: "Could not load the card pictures or fonts — check the connection and open the page again.",
			bad: !0
		}) : S && Y({ text: N(M).length || N(H).length ? "Your text is kept on this device for each date." : "Type the menu — one dish per line (Enter for a new line)." });
	}, [S, w]);
	let Z = (e) => new Promise((t, n) => g.current.toBlob((e) => e ? t(e) : n(/* @__PURE__ */ Error("Could not make the image.")), e, .92)), Q = () => `Menu ${E || z(/* @__PURE__ */ new Date())}.jpg`, $ = (e) => Y({
		text: e?.message || String(e),
		bad: !0
	});
	async function ae() {
		try {
			let e = URL.createObjectURL(await Z("image/jpeg")), t = document.createElement("a");
			t.href = e, t.download = Q(), document.body.appendChild(t), t.click(), t.remove(), setTimeout(() => URL.revokeObjectURL(e), 5e3), Y({
				text: `Downloaded “${Q()}”.`,
				ok: !0
			});
		} catch (e) {
			$(e);
		}
	}
	async function oe() {
		try {
			if (!navigator.clipboard?.write || typeof ClipboardItem > "u") throw Error("This browser cannot copy images — use Download instead.");
			await navigator.clipboard.write([new ClipboardItem({ "image/png": Z("image/png") })]), Y({
				text: "Image copied — paste it into WhatsApp or anywhere else.",
				ok: !0
			});
		} catch (e) {
			Y({
				text: e?.name === "NotAllowedError" ? "The browser blocked copying — try again, or use Download." : e?.message || String(e),
				bad: !0
			});
		}
	}
	async function se() {
		try {
			await navigator.share({ files: [new File([await Z("image/jpeg")], Q(), { type: "image/jpeg" })] });
		} catch (e) {
			e?.name !== "AbortError" && $(e);
		}
	}
	let ce = (0, h.useMemo)(() => () => {
		let e = X(E);
		G(e.greg), q(e.hijri);
	}, [E, v]);
	return /* @__PURE__ */ (0, F.jsxs)("div", {
		className: "mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4",
		children: [/* @__PURE__ */ (0, F.jsxs)("header", {
			className: "flex flex-wrap items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, F.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, F.jsx)("h1", {
					className: "text-2xl font-bold text-primary",
					children: "Menu Card"
				}), /* @__PURE__ */ (0, F.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Type the lunch and dinner menu, one dish per line — the card is drawn as you type. Download it or copy it to paste into WhatsApp."
				})]
			}), /* @__PURE__ */ (0, F.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, F.jsxs)(u, {
						onClick: () => void ae(),
						children: [/* @__PURE__ */ (0, F.jsx)(c, { className: "size-4" }), "Download"]
					}),
					/* @__PURE__ */ (0, F.jsxs)(u, {
						variant: "outline",
						onClick: () => void oe(),
						children: [/* @__PURE__ */ (0, F.jsx)(s, { className: "size-4" }), "Copy image"]
					}),
					re && /* @__PURE__ */ (0, F.jsxs)(u, {
						variant: "outline",
						onClick: () => void se(),
						children: [/* @__PURE__ */ (0, F.jsx)(l, { className: "size-4" }), "Share"]
					})
				]
			})]
		}), /* @__PURE__ */ (0, F.jsxs)("div", {
			className: "grid min-w-0 items-start gap-3 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]",
			children: [/* @__PURE__ */ (0, F.jsx)(f, { children: /* @__PURE__ */ (0, F.jsxs)(d, {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, F.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, F.jsx)(o, {
							htmlFor: "mcdDate",
							children: "Date"
						}), /* @__PURE__ */ (0, F.jsx)(p, {
							id: "mcdDate",
							type: "date",
							value: E,
							onChange: (e) => D(e.target.value || z(/* @__PURE__ */ new Date()))
						})]
					}),
					/* @__PURE__ */ (0, F.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, F.jsx)(o, {
							htmlFor: "mcdGreg",
							children: "Date line"
						}), /* @__PURE__ */ (0, F.jsx)(p, {
							id: "mcdGreg",
							autoComplete: "off",
							value: W,
							onChange: (e) => G(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, F.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, F.jsx)(o, {
							htmlFor: "mcdHijri",
							children: "Hijri line"
						}), /* @__PURE__ */ (0, F.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, F.jsx)(p, {
								id: "mcdHijri",
								autoComplete: "off",
								value: K,
								onChange: (e) => q(e.target.value)
							}), /* @__PURE__ */ (0, F.jsx)(u, {
								variant: "outline",
								title: "Fill both date lines from the date again",
								onClick: ce,
								children: "↺ from date"
							})]
						})]
					}),
					/* @__PURE__ */ (0, F.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-1",
						children: [/* @__PURE__ */ (0, F.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, F.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, F.jsx)("b", { children: "Lunch" }), /* @__PURE__ */ (0, F.jsxs)(o, {
									className: "gap-1.5",
									children: ["time ", /* @__PURE__ */ (0, F.jsx)(p, {
										className: "h-8 w-20",
										autoComplete: "off",
										value: O,
										onChange: (e) => k(e.target.value)
									})]
								})]
							}), /* @__PURE__ */ (0, F.jsx)(m, {
								rows: 8,
								className: "min-h-44",
								spellCheck: !1,
								placeholder: "Namak\nIce Cream Kwality\nSamosa\nNaan, Kasak\nChaas\nKeri Achar",
								value: M,
								onChange: (e) => I(e.target.value)
							})]
						}), /* @__PURE__ */ (0, F.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, F.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, F.jsx)("b", { children: "Dinner" }), /* @__PURE__ */ (0, F.jsxs)(o, {
									className: "gap-1.5",
									children: ["time ", /* @__PURE__ */ (0, F.jsx)(p, {
										className: "h-8 w-20",
										autoComplete: "off",
										value: A,
										onChange: (e) => j(e.target.value)
									})]
								})]
							}), /* @__PURE__ */ (0, F.jsx)(m, {
								rows: 8,
								className: "min-h-44",
								spellCheck: !1,
								placeholder: "Namak\nSholo\nChilli Chicken\nChicken Angara, Manda\nKhichdi, Bhajiya Kadi\nLemon Ichar, Fruits",
								value: H,
								onChange: (e) => U(e.target.value)
							})]
						})]
					}),
					/* @__PURE__ */ (0, F.jsx)("p", {
						role: "status",
						className: ee("text-xs", J.bad ? "font-semibold text-destructive" : J.ok ? "font-semibold text-ok" : "text-muted-foreground"),
						children: J.text
					})
				]
			}) }), /* @__PURE__ */ (0, F.jsx)("section", {
				className: "min-w-0 overflow-hidden rounded-xl border bg-white shadow-sm",
				children: /* @__PURE__ */ (0, F.jsx)("canvas", {
					ref: g,
					width: b,
					height: x,
					"aria-label": "Menu card preview",
					className: "block h-auto w-full"
				})
			})]
		})]
	});
}
export { H as default };
