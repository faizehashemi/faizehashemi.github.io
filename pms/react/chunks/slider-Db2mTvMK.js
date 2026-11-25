import { f as e, h as t, p as n } from "./PmsContext-BVMd13Oi.js";
import { t as r } from "./dist-BFKqrRa-.js";
import { t as i } from "./dist-BdqL8a-N.js";
import { o as a } from "./dist-BQlDVxi3.js";
import { i as o, n as s, t as c } from "./dist-DPAKuE1t.js";
import { n as l, t as u } from "./dist-K6BQKrIW.js";
import { t as d } from "./dist-BPbXv5K2.js";
import { t as f } from "./dist-DSXUEWtZ.js";
// node_modules/@radix-ui/react-slider/dist/index.mjs
var p = /* @__PURE__ */ t(n(), 1), m = e(), h = Object.defineProperty, g = (e, t) => h(e, "name", {
	value: t,
	configurable: !0
}), _ = {
	Vertical: "vertical",
	Horizontal: "horizontal"
}, v = {
	LTR: "ltr",
	RTL: "rtl"
}, y = ["PageUp", "PageDown"], b = [
	"ArrowUp",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight"
], x = {
	"from-left": [
		"Home",
		"PageDown",
		"ArrowDown",
		"ArrowLeft"
	],
	"from-right": [
		"Home",
		"PageDown",
		"ArrowDown",
		"ArrowRight"
	],
	"from-bottom": [
		"Home",
		"PageDown",
		"ArrowDown",
		"ArrowLeft"
	],
	"from-top": [
		"Home",
		"PageDown",
		"ArrowUp",
		"ArrowLeft"
	]
}, S = "Slider", [C, w, T] = l(S), [E, D] = o(S, [T]), [ee, O] = E(S), k = /* @__PURE__ */ p.forwardRef(/* @__PURE__ */ g(function(e, t) {
	let { name: n, min: r = 0, max: i = 100, step: o = 1, orientation: l = _.Horizontal, disabled: u = !1, minStepsBetweenThumbs: d = 0, preserveThumbOrder: h = !1, defaultValue: v = [r], value: x, onValueChange: S = /* @__PURE__ */ g(() => {}, "onValueChange"), onValueCommit: w = /* @__PURE__ */ g(() => {}, "onValueCommit"), inverted: T = !1, form: E, ...D } = e, O = p.useRef(/* @__PURE__ */ new Set()), k = p.useRef(0), A = p.useRef(!1), [j, M] = p.useState(null), N = l === _.Horizontal ? te : ne, [P, F] = p.useState(null), re = a(t, F), [I = [], L] = c({
		prop: x,
		defaultProp: v,
		onChange: /* @__PURE__ */ g((e) => {
			[...O.current][k.current]?.focus({
				preventScroll: !0,
				focusVisible: A.current
			}), A.current = !1, S(e);
		}, "onChange")
	}), R = p.useRef(I), z = p.useRef(I);
	p.useEffect(() => {
		let e = E ? P?.ownerDocument.getElementById(E) : P?.closest("form");
		if (e instanceof HTMLFormElement) {
			let t = /* @__PURE__ */ g(() => L(z.current), "reset");
			return e.addEventListener("reset", t), () => e.removeEventListener("reset", t);
		}
	}, [
		P,
		E,
		L
	]);
	function B(e) {
		U(e, q(I, e));
	}
	g(B, "handleSlideStart");
	function V(e) {
		U(e, k.current);
	}
	g(V, "handleSlideMove");
	function H() {
		String(I) !== String(R.current) && w(I);
	}
	g(H, "handleSlideEnd");
	function U(e, t, { commit: n } = { commit: !1 }) {
		let a = Q(o), s = $(Math.round((e - r) / o) * o + r, a), c = f(s, [r, i]), l = d * o;
		function u(e) {
			let n = h ? f(c, [e[t - 1] === void 0 ? r : e[t - 1] + l, e[t + 1] === void 0 ? i : e[t + 1] - l]) : c, a = W(e, n, t);
			return X(a, l) ? {
				nextValues: a,
				changedIndex: h ? t : a.indexOf(n),
				hasChanged: String(a) !== String(e)
			} : null;
		}
		g(u, "getNextValues");
		let p = u(I);
		p?.hasChanged && M(p.nextValues), L((e = []) => {
			let t = u(e);
			return t ? (k.current = t.changedIndex, t.hasChanged && n && w(t.nextValues), t.hasChanged ? t.nextValues : e) : e;
		});
	}
	return g(U, "updateValues"), /* @__PURE__ */ (0, m.jsx)(ee, {
		scope: e.__scopeSlider,
		name: n,
		disabled: u,
		min: r,
		max: i,
		valueIndexToChangeRef: k,
		thumbs: O.current,
		values: I,
		orientation: l,
		form: E,
		userRequestedValues: j,
		children: /* @__PURE__ */ (0, m.jsx)(C.Provider, {
			scope: e.__scopeSlider,
			children: /* @__PURE__ */ (0, m.jsx)(C.Slot, {
				scope: e.__scopeSlider,
				children: /* @__PURE__ */ (0, m.jsx)(N, {
					"aria-disabled": u,
					"data-disabled": u ? "" : void 0,
					...D,
					ref: re,
					onPointerDown: s(D.onPointerDown, () => {
						u || (R.current = I, A.current = !1);
					}),
					min: r,
					max: i,
					inverted: T,
					onSlideStart: u ? void 0 : B,
					onSlideMove: u ? void 0 : V,
					onSlideEnd: u ? void 0 : H,
					onHomeKeyDown: () => {
						u || (A.current = !0, U(r, 0, { commit: !0 }));
					},
					onEndKeyDown: () => {
						u || (A.current = !0, U(i, I.length - 1, { commit: !0 }));
					},
					onStepKeyDown: ({ event: e, direction: t }) => {
						if (!u) {
							A.current = !0;
							let n = y.includes(e.key) || e.shiftKey && b.includes(e.key) ? 10 : 1, i = k.current, a = I[i];
							U(ae(a, {
								min: r,
								step: o,
								direction: t,
								multiplier: n
							}), i, { commit: !0 });
						}
					}
				})
			})
		})
	});
}, "Slider")), [A, j] = E(S, {
	startEdge: "left",
	endEdge: "right",
	size: "width",
	direction: 1
}), te = /* @__PURE__ */ p.forwardRef(/* @__PURE__ */ g(function(e, t) {
	let { min: n, max: r, dir: i, inverted: o, onSlideStart: s, onSlideMove: c, onSlideEnd: l, onStepKeyDown: d, ...f } = e, [h, _] = p.useState(null), y = a(t, _), b = p.useRef(void 0), S = u(i), C = S === v.LTR, w = C && !o || !C && o;
	function T(e) {
		let t = b.current || h.getBoundingClientRect(), i = Z([0, t.width], w ? [n, r] : [r, n]);
		return b.current = t, i(e - t.left);
	}
	return g(T, "getValueFromPointer"), /* @__PURE__ */ (0, m.jsx)(A, {
		scope: e.__scopeSlider,
		startEdge: w ? "left" : "right",
		endEdge: w ? "right" : "left",
		direction: w ? 1 : -1,
		size: "width",
		children: /* @__PURE__ */ (0, m.jsx)(M, {
			dir: S,
			"data-orientation": "horizontal",
			...f,
			ref: y,
			style: {
				...f.style,
				"--radix-slider-thumb-transform": "translateX(-50%)"
			},
			onSlideStart: (e) => {
				let t = T(e.clientX);
				s?.(t);
			},
			onSlideMove: (e) => {
				let t = T(e.clientX);
				c?.(t);
			},
			onSlideEnd: () => {
				b.current = void 0, l?.();
			},
			onStepKeyDown: (e) => {
				let t = x[w ? "from-left" : "from-right"].includes(e.key);
				d?.({
					event: e,
					direction: t ? -1 : 1
				});
			}
		})
	});
}, "SliderHorizontal")), ne = /* @__PURE__ */ p.forwardRef(/* @__PURE__ */ g(function(e, t) {
	let { min: n, max: r, inverted: i, onSlideStart: o, onSlideMove: s, onSlideEnd: c, onStepKeyDown: l, ...u } = e, d = p.useRef(null), f = a(t, d), h = p.useRef(void 0), _ = !i;
	function v(e) {
		let t = h.current || d.current.getBoundingClientRect(), i = Z([0, t.height], _ ? [r, n] : [n, r]);
		return h.current = t, i(e - t.top);
	}
	return g(v, "getValueFromPointer"), /* @__PURE__ */ (0, m.jsx)(A, {
		scope: e.__scopeSlider,
		startEdge: _ ? "bottom" : "top",
		endEdge: _ ? "top" : "bottom",
		size: "height",
		direction: _ ? 1 : -1,
		children: /* @__PURE__ */ (0, m.jsx)(M, {
			"data-orientation": "vertical",
			...u,
			ref: f,
			style: {
				...u.style,
				"--radix-slider-thumb-transform": "translateY(50%)"
			},
			onSlideStart: (e) => {
				let t = v(e.clientY);
				o?.(t);
			},
			onSlideMove: (e) => {
				let t = v(e.clientY);
				s?.(t);
			},
			onSlideEnd: () => {
				h.current = void 0, c?.();
			},
			onStepKeyDown: (e) => {
				let t = x[_ ? "from-bottom" : "from-top"].includes(e.key);
				l?.({
					event: e,
					direction: t ? -1 : 1
				});
			}
		})
	});
}, "SliderVertical")), M = /* @__PURE__ */ p.forwardRef(/* @__PURE__ */ g(function(e, t) {
	let { __scopeSlider: n, onSlideStart: i, onSlideMove: a, onSlideEnd: o, onHomeKeyDown: c, onEndKeyDown: l, onStepKeyDown: u, ...d } = e, f = O(S, n);
	return /* @__PURE__ */ (0, m.jsx)(r.span, {
		...d,
		ref: t,
		onKeyDown: s(e.onKeyDown, (e) => {
			e.key === "Home" ? (c(e), e.preventDefault()) : e.key === "End" ? (l(e), e.preventDefault()) : y.concat(b).includes(e.key) && (u(e), e.preventDefault());
		}),
		onPointerDown: s(e.onPointerDown, (e) => {
			let t = e.target;
			t.setPointerCapture(e.pointerId), e.preventDefault(), f.thumbs.has(t) ? t.focus({
				preventScroll: !0,
				focusVisible: !1
			}) : i(e);
		}),
		onPointerMove: s(e.onPointerMove, (e) => {
			e.target.hasPointerCapture(e.pointerId) && a(e);
		}),
		onPointerUp: s(e.onPointerUp, (e) => {
			let t = e.target;
			t.hasPointerCapture(e.pointerId) && (t.releasePointerCapture(e.pointerId), o(e));
		})
	});
}, "SliderImpl")), N = "SliderTrack", P = /* @__PURE__ */ p.forwardRef(/* @__PURE__ */ g(function(e, t) {
	let { __scopeSlider: n, ...i } = e, a = O(N, n);
	return /* @__PURE__ */ (0, m.jsx)(r.span, {
		"data-disabled": a.disabled ? "" : void 0,
		"data-orientation": a.orientation,
		...i,
		ref: t
	});
}, "SliderTrack")), F = "SliderRange", re = /* @__PURE__ */ p.forwardRef(/* @__PURE__ */ g(function(e, t) {
	let { __scopeSlider: n, ...i } = e, o = O(F, n), s = j(F, n), c = p.useRef(null), l = a(t, c), u = o.values.length, d = o.values.map((e) => G(e, o.min, o.max)), f = u > 1 ? Math.min(...d) : 0, h = 100 - Math.max(...d);
	return /* @__PURE__ */ (0, m.jsx)(r.span, {
		"data-orientation": o.orientation,
		"data-disabled": o.disabled ? "" : void 0,
		...i,
		ref: l,
		style: {
			...e.style,
			[s.startEdge]: f + "%",
			[s.endEdge]: h + "%"
		}
	});
}, "SliderRange")), [I, L] = E("SliderThumb"), R = "SliderThumbProvider";
function z(e) {
	let { __scopeSlider: t, name: n, children: r, internal_do_not_use_render: i } = e, a = O(R, t), o = w(t), [s, c] = p.useState(null), l = p.useMemo(() => s ? o().findIndex((e) => e.ref.current === s) : -1, [o, s]), u = d(s), f = !s || !!a.form || !!s.closest("form"), h = a.values[l], g = n ?? (a.name ? a.name + (a.values.length > 1 ? "[]" : "") : void 0), _ = h === void 0 ? 0 : G(h, a.min, a.max);
	p.useEffect(() => {
		if (s) return a.thumbs.add(s), () => {
			a.thumbs.delete(s);
		};
	}, [s, a.thumbs]);
	let v = {
		value: h,
		name: g,
		form: a.form,
		isFormControl: f,
		index: l,
		thumb: s,
		onThumbChange: c,
		percent: _,
		size: u
	};
	return /* @__PURE__ */ (0, m.jsx)(I, {
		scope: t,
		...v,
		children: oe(i) ? i(v) : r
	});
}
g(z, "SliderThumbProvider");
var B = "SliderThumbTrigger", V = /* @__PURE__ */ p.forwardRef(/* @__PURE__ */ g(function(e, t) {
	let { __scopeSlider: n, ...i } = e, o = O(B, n), c = j(B, n), { index: l, value: u, percent: d, size: f, onThumbChange: p } = L(B, n), h = a(t, p), g = K(l, o.values.length), _ = f?.[c.size], v = _ ? J(_, d, c.direction) : 0;
	return /* @__PURE__ */ (0, m.jsx)("span", {
		style: {
			transform: "var(--radix-slider-thumb-transform)",
			position: "absolute",
			[c.startEdge]: `calc(${d}% + ${v}px)`
		},
		children: /* @__PURE__ */ (0, m.jsx)(C.ItemSlot, {
			scope: n,
			children: /* @__PURE__ */ (0, m.jsx)(r.span, {
				role: "slider",
				"aria-label": e["aria-label"] || g,
				"aria-valuemin": o.min,
				"aria-valuenow": u,
				"aria-valuemax": o.max,
				"aria-orientation": o.orientation,
				"data-orientation": o.orientation,
				"data-disabled": o.disabled ? "" : void 0,
				tabIndex: o.disabled ? void 0 : 0,
				...i,
				ref: h,
				style: u === void 0 ? { display: "none" } : e.style,
				onFocus: s(e.onFocus, () => {
					o.valueIndexToChangeRef.current = l;
				})
			})
		})
	});
}, "SliderThumbTrigger")), H = /* @__PURE__ */ p.forwardRef(/* @__PURE__ */ g(function(e, t) {
	let { __scopeSlider: n, name: r, ...i } = e;
	return /* @__PURE__ */ (0, m.jsx)(z, {
		__scopeSlider: n,
		name: r,
		internal_do_not_use_render: ({ index: e, isFormControl: r }) => /* @__PURE__ */ (0, m.jsxs)(m.Fragment, { children: [/* @__PURE__ */ (0, m.jsx)(V, {
			...i,
			ref: t,
			__scopeSlider: n
		}), r ? /* @__PURE__ */ (0, m.jsx)(ie, { __scopeSlider: n }, e) : null] })
	});
}, "SliderThumb")), U = "SliderBubbleInput", ie = /* @__PURE__ */ p.forwardRef(/* @__PURE__ */ g(function({ __scopeSlider: e, onInput: t, ...n }, i) {
	let { index: o, value: c, name: l, form: u } = L(U, e), { userRequestedValues: d } = O(U, e), f = p.useRef(null), h = a(f, i), g = p.useRef(!1), _ = p.useRef(c), v = p.useRef(d), y = p.useRef(d);
	return p.useEffect(() => {
		let e = f.current;
		if (!e) return;
		let t = window.HTMLInputElement.prototype, n = Object.getOwnPropertyDescriptor(t, "value").set, r = _.current, i = r !== c;
		_.current = c;
		let a = d !== y.current;
		if (y.current = d, i && n) {
			let t = d !== v.current;
			v.current = d;
			let i = d?.[o];
			g.current = !(t && (a && i !== r || i === c));
			let s = new Event("input", { bubbles: !0 });
			n.call(e, c), e.dispatchEvent(s), g.current = !1;
		}
	}, [
		o,
		c,
		d
	]), /* @__PURE__ */ (0, m.jsx)(r.input, {
		style: { display: "none" },
		name: l,
		form: u,
		...n,
		ref: h,
		defaultValue: c,
		onInput: s(t, (e) => {
			g.current && e.stopPropagation();
		})
	});
}, "SliderBubbleInput"));
function W(e = [], t, n) {
	let r = [...e];
	return r[n] = t, r.sort((e, t) => e - t);
}
g(W, "getNextSortedValues");
function G(e, t, n) {
	let r = 100 / (n - t) * (e - t);
	return f(r, [0, 100]);
}
g(G, "convertValueToPercentage");
function K(e, t) {
	if (t > 2) return `Value ${e + 1} of ${t}`;
	if (t === 2) return ["Minimum", "Maximum"][e];
}
g(K, "getLabel");
function q(e, t) {
	if (e.length === 1) return 0;
	let n = e.map((e) => Math.abs(e - t)), r = Math.min(...n);
	return n.indexOf(r);
}
g(q, "getClosestValueIndex");
function J(e, t, n) {
	let r = e / 2;
	return (r - Z([0, 50], [0, r])(t) * n) * n;
}
g(J, "getThumbInBoundsOffset");
function Y(e) {
	return e.slice(0, -1).map((t, n) => e[n + 1] - t);
}
g(Y, "getStepsBetweenValues");
function X(e, t) {
	if (t > 0) {
		let n = Y(e);
		return Math.min(...n) >= t;
	}
	return !0;
}
g(X, "hasMinStepsBetweenValues");
function Z(e, t) {
	return (n) => {
		if (e[0] === e[1] || t[0] === t[1]) return t[0];
		let r = (t[1] - t[0]) / (e[1] - e[0]);
		return t[0] + r * (n - e[0]);
	};
}
g(Z, "linearScale");
function Q(e) {
	if (!Number.isFinite(e)) return 0;
	let t = e.toString();
	if (t.includes("e")) {
		let [e, n] = t.split("e"), r = e.split(".")[1] || "", i = Number(n);
		return Math.max(0, r.length - i);
	}
	let n = t.split(".")[1];
	return n ? n.length : 0;
}
g(Q, "getDecimalCount");
function $(e, t) {
	let n = 10 ** t;
	return Math.round(e * n) / n;
}
g($, "roundValue");
function ae(e, { min: t, step: n, direction: r, multiplier: i }) {
	let a = Q(n), o = (e - t) / n, s = Math.round(o), c = $(s * n + t, a) === $(e, a), l;
	return l = c ? s + i * r : r > 0 ? Math.ceil(o) : Math.floor(o), $(l * n + t, a);
}
g(ae, "getNextStepValue");
function oe(e) {
	return typeof e == "function";
}
g(oe, "isFunction");
// src/components/ui/slider.tsx
function se({ className: e, defaultValue: t, value: n, min: r = 0, max: a = 100, ...o }) {
	let s = p.useMemo(() => Array.isArray(n) ? n : Array.isArray(t) ? t : [r, a], [
		n,
		t,
		r,
		a
	]);
	return /* @__PURE__ */ (0, m.jsxs)(k, {
		"data-slot": "slider",
		defaultValue: t,
		value: n,
		min: r,
		max: a,
		className: i("relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col", e),
		...o,
		children: [/* @__PURE__ */ (0, m.jsx)(P, {
			"data-slot": "slider-track",
			className: i("relative grow overflow-hidden rounded-full bg-muted data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"),
			children: /* @__PURE__ */ (0, m.jsx)(re, {
				"data-slot": "slider-range",
				className: i("absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full")
			})
		}), Array.from({ length: s.length }, (e, t) => /* @__PURE__ */ (0, m.jsx)(H, {
			"data-slot": "slider-thumb",
			className: "block size-4 shrink-0 rounded-full border border-primary bg-white shadow-sm ring-ring/50 transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
		}, t))]
	});
}
export { se as t };
