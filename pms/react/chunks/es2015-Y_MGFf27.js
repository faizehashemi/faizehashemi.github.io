import { f as e, h as t, p as n } from "./PmsContext-BVMd13Oi.js";
import { n as r, r as i, t as a } from "./dist-BFKqrRa-.js";
import { o } from "./dist-BQlDVxi3.js";
import { n as s, r as c } from "./dist-DPAKuE1t.js";
import { t as l } from "./dist-CqlFeEAx.js";
// src/lib/portal.ts
function u() {
	let e = document.getElementById("pms-react-portal");
	return e || (e = document.createElement("div"), e.id = "pms-react-portal", e.className = "pms-react", document.body.appendChild(e)), e;
}
// node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs
var d = /* @__PURE__ */ t(n(), 1), f = e(), p = Object.defineProperty, m = (e, t) => p(e, "name", {
	value: t,
	configurable: !0
}), h = "dismissableLayer.update", g = "dismissableLayer.pointerDownOutside", _ = "dismissableLayer.focusOutside", v, y = d.createContext({
	layers: /* @__PURE__ */ new Set(),
	layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
	branches: /* @__PURE__ */ new Set(),
	dismissableSurfaces: /* @__PURE__ */ new Set()
}), b = /* @__PURE__ */ d.forwardRef(/* @__PURE__ */ m(function(e, t) {
	let { disableOutsidePointerEvents: n = !1, deferPointerDownOutside: r = !1, onEscapeKeyDown: i, onPointerDownOutside: c, onFocusOutside: u, onInteractOutside: p, onDismiss: g, ..._ } = e, b = d.useContext(y), [x, S] = d.useState(null), E = x?.ownerDocument ?? globalThis?.document, [, ee] = d.useState({}), D = o(t, S), O = Array.from(b.layers), [k] = [...b.layersWithOutsidePointerEventsDisabled].slice(-1), te = k ? O.indexOf(k) : -1, ne = x ? O.indexOf(x) : -1, re = b.layersWithOutsidePointerEventsDisabled.size > 0, A = ne >= te, j = d.useRef(!1), ie = C((e) => {
		c?.(e), p?.(e), e.defaultPrevented || g?.();
	}, {
		ownerDocument: E,
		deferPointerDownOutside: r,
		isDeferredPointerDownOutsideRef: j,
		dismissableSurfaces: b.dismissableSurfaces,
		shouldHandlePointerDownOutside: d.useCallback((e) => {
			if (!(e instanceof Node)) return !1;
			let t = [...b.branches].some((t) => t.contains(e));
			return A && !t;
		}, [b.branches, A])
	}), M = w((e) => {
		if (r && j.current) return;
		let t = e.target;
		[...b.branches].some((e) => e.contains(t)) || (u?.(e), p?.(e), e.defaultPrevented || g?.());
	}, E), N = x ? ne === O.length - 1 : !1, P = l((e) => {
		e.key === "Escape" && (i?.(e), !e.defaultPrevented && g && (e.preventDefault(), g()));
	});
	return d.useEffect(() => {
		if (N) return E.addEventListener("keydown", P, { capture: !0 }), () => E.removeEventListener("keydown", P, { capture: !0 });
	}, [
		E,
		N,
		P
	]), d.useEffect(() => {
		if (x) return n && (b.layersWithOutsidePointerEventsDisabled.size === 0 && (v = E.body.style.pointerEvents, E.body.style.pointerEvents = "none"), b.layersWithOutsidePointerEventsDisabled.add(x)), b.layers.add(x), T(), () => {
			n && (b.layersWithOutsidePointerEventsDisabled.delete(x), b.layersWithOutsidePointerEventsDisabled.size === 0 && (E.body.style.pointerEvents = v));
		};
	}, [
		x,
		E,
		n,
		b
	]), d.useEffect(() => () => {
		x && (b.layers.delete(x), b.layersWithOutsidePointerEventsDisabled.delete(x), T());
	}, [x, b]), d.useEffect(() => {
		let e = /* @__PURE__ */ m(() => ee({}), "handleUpdate");
		return document.addEventListener(h, e), () => document.removeEventListener(h, e);
	}, []), /* @__PURE__ */ (0, f.jsx)(a.div, {
		..._,
		ref: D,
		style: {
			pointerEvents: re ? A ? "auto" : "none" : void 0,
			...e.style
		},
		onFocusCapture: s(e.onFocusCapture, M.onFocusCapture),
		onBlurCapture: s(e.onBlurCapture, M.onBlurCapture),
		onPointerDownCapture: s(e.onPointerDownCapture, ie.onPointerDownCapture)
	});
}, "DismissableLayer"));
function x() {
	let e = d.useContext(y), [t, n] = d.useState(null);
	return d.useEffect(() => {
		if (t) return e.dismissableSurfaces.add(t), () => {
			e.dismissableSurfaces.delete(t);
		};
	}, [t, e.dismissableSurfaces]), n;
}
m(x, "useDismissableLayerSurface");
var S = /* @__PURE__ */ m(() => !0, "IS_TRUE");
function C(e, t) {
	let { ownerDocument: n = globalThis?.document, deferPointerDownOutside: r = !1, isDeferredPointerDownOutsideRef: i, dismissableSurfaces: a, shouldHandlePointerDownOutside: o = S } = t, s = l(e), c = d.useRef(!1), u = d.useRef(!1), f = d.useRef(/* @__PURE__ */ new Map()), p = d.useRef(() => {});
	return d.useEffect(() => {
		function e() {
			u.current = !1, i.current = !1, f.current.clear();
		}
		m(e, "resetOutsideInteraction");
		function t() {
			return Array.from(f.current.values()).some(Boolean);
		}
		m(t, "isOutsideInteractionIntercepted");
		function l(e) {
			if (!u.current) return;
			let t = e.target;
			t instanceof Node && [...a].some((e) => e.contains(t)) || f.current.set(e.type, !0), e.type === "click" && window.setTimeout(() => {
				u.current && p.current();
			}, 0);
		}
		m(l, "handleInteractionCapture");
		function d(e) {
			u.current && f.current.set(e.type, !1);
		}
		m(d, "handleInteractionBubble");
		let h = /* @__PURE__ */ m((a) => {
			if (a.target && !c.current) {
				let l = function() {
					n.removeEventListener("click", p.current);
					let r = t();
					e(), r || E(g, s, d, { discrete: !0 });
				};
				if (m(l, "handleAndDispatchPointerDownOutsideEvent"), !o(a.target)) {
					n.removeEventListener("click", p.current), e(), c.current = !1;
					return;
				}
				let d = { originalEvent: a };
				u.current = !0, i.current = r && a.button === 0, f.current.clear(), !r || a.button !== 0 ? l() : (n.removeEventListener("click", p.current), p.current = l, n.addEventListener("click", p.current, { once: !0 }));
			} else n.removeEventListener("click", p.current), e();
			c.current = !1;
		}, "handlePointerDown"), _ = [
			"pointerup",
			"mousedown",
			"mouseup",
			"touchstart",
			"touchend",
			"click"
		];
		for (let e of _) n.addEventListener(e, l, !0), n.addEventListener(e, d);
		let v = window.setTimeout(() => {
			n.addEventListener("pointerdown", h);
		}, 0);
		return () => {
			window.clearTimeout(v), n.removeEventListener("pointerdown", h), n.removeEventListener("click", p.current);
			for (let e of _) n.removeEventListener(e, l, !0), n.removeEventListener(e, d);
		};
	}, [
		n,
		s,
		r,
		i,
		a,
		o
	]), { onPointerDownCapture: /* @__PURE__ */ m(() => c.current = !0, "onPointerDownCapture") };
}
m(C, "usePointerDownOutside");
function w(e, t = globalThis?.document) {
	let n = l(e), r = d.useRef(!1);
	return d.useEffect(() => {
		let e = /* @__PURE__ */ m((e) => {
			e.target && !r.current && E(_, n, { originalEvent: e }, { discrete: !1 });
		}, "handleFocus");
		return t.addEventListener("focusin", e), () => t.removeEventListener("focusin", e);
	}, [t, n]), {
		onFocusCapture: /* @__PURE__ */ m(() => r.current = !0, "onFocusCapture"),
		onBlurCapture: /* @__PURE__ */ m(() => r.current = !1, "onBlurCapture")
	};
}
m(w, "useFocusOutside");
function T() {
	let e = new CustomEvent(h);
	document.dispatchEvent(e);
}
m(T, "dispatchUpdate");
function E(e, t, n, { discrete: i }) {
	let a = n.originalEvent.target, o = new CustomEvent(e, {
		bubbles: !1,
		cancelable: !0,
		detail: n
	});
	t && a.addEventListener(e, t, { once: !0 }), i ? r(a, o) : a.dispatchEvent(o);
}
m(E, "handleAndDispatchCustomEvent");
// node_modules/@radix-ui/react-focus-scope/dist/index.mjs
var ee = Object.defineProperty, D = (e, t) => ee(e, "name", {
	value: t,
	configurable: !0
}), O = "focusScope.autoFocusOnMount", k = "focusScope.autoFocusOnUnmount", te = {
	bubbles: !1,
	cancelable: !0
}, ne = /* @__PURE__ */ d.forwardRef(/* @__PURE__ */ D(function(e, t) {
	let { loop: n = !1, trapped: r = !1, branches: i, onMountAutoFocus: s, onUnmountAutoFocus: c, ...u } = e, [p, m] = d.useState(null), h = l(s), g = l(c), _ = d.useRef(null), v = o(t, m), y = d.useRef(i);
	d.useEffect(() => {
		y.current = i;
	});
	let b = d.useCallback((e) => e ? p?.contains(e) ? !0 : !!y.current?.some((t) => t.contains(e)) : !1, [p]), x = d.useRef({
		paused: !1,
		pause() {
			this.paused = !0;
		},
		resume() {
			this.paused = !1;
		}
	}).current;
	d.useEffect(() => {
		if (r) {
			let e = function(e) {
				if (x.paused || !p) return;
				let t = e.target;
				b(t) ? _.current = t : I(_.current, { select: !0 });
			}, t = function(e) {
				if (x.paused || !p) return;
				let t = e.relatedTarget;
				t !== null && (b(t) || I(_.current, { select: !0 }));
			}, n = function(e) {
				if (document.activeElement === document.body) for (let t of e) t.removedNodes.length > 0 && I(p);
			};
			D(e, "handleFocusIn"), D(t, "handleFocusOut"), D(n, "handleMutations"), document.addEventListener("focusin", e), document.addEventListener("focusout", t);
			let r = new MutationObserver(n);
			return p && r.observe(p, {
				childList: !0,
				subtree: !0
			}), () => {
				document.removeEventListener("focusin", e), document.removeEventListener("focusout", t), r.disconnect();
			};
		}
	}, [
		r,
		p,
		x.paused,
		b
	]), d.useEffect(() => {
		if (p) {
			se.add(x);
			let e = document.activeElement;
			if (!p.contains(e)) {
				let t = new CustomEvent(O, te);
				p.addEventListener(O, h), p.dispatchEvent(t), t.defaultPrevented || (M(le(P(p)), { select: !0 }), document.activeElement === e && I(p));
			}
			return () => {
				p.removeEventListener(O, h);
				let t = p.ownerDocument, n = CustomEvent;
				setTimeout(() => {
					let r = new n(k, te);
					p.addEventListener(k, g), p.dispatchEvent(r), r.defaultPrevented || I(e ?? t.body, { select: !0 }), p.removeEventListener(k, g), se.remove(x);
				}, 0);
			};
		}
	}, [
		p,
		h,
		g,
		x
	]);
	let S = d.useCallback((e) => {
		if (!n && !r || x.paused) return;
		let t = e.key === "Tab" && !e.altKey && !e.ctrlKey && !e.metaKey, i = document.activeElement;
		if (t && i) {
			let t = e.currentTarget, [r, a] = N(t);
			r && a ? !e.shiftKey && i === a ? (e.preventDefault(), n && I(r, { select: !0 })) : e.shiftKey && i === r && (e.preventDefault(), n && I(a, { select: !0 })) : i === t && e.preventDefault();
		}
	}, [
		n,
		r,
		x.paused
	]);
	return /* @__PURE__ */ (0, f.jsx)(a.div, {
		tabIndex: -1,
		...u,
		ref: v,
		onKeyDown: S
	});
}, "FocusScope")), re = d.createContext(null);
function A({ registry: e, children: t }) {
	return e ? /* @__PURE__ */ (0, f.jsx)(re.Provider, {
		value: e,
		children: t
	}) : t;
}
D(A, "FocusScopeBranchProvider");
function j() {
	let [e, t] = d.useState([]);
	return {
		nodes: e,
		registry: d.useMemo(() => ({
			add: /* @__PURE__ */ D((e) => t((t) => t.includes(e) ? t : [...t, e]), "add"),
			remove: /* @__PURE__ */ D((e) => t((t) => t.filter((t) => t !== e)), "remove")
		}), [])
	};
}
D(j, "useFocusScopeBranchRegistry");
function ie(e) {
	let t = d.useContext(re);
	d.useEffect(() => {
		if (e && t) return t.add(e), () => t.remove(e);
	}, [e, t]);
}
D(ie, "useFocusScopeBranch");
function M(e, { select: t = !1 } = {}) {
	let n = document.activeElement;
	for (let r of e) if (I(r, { select: t }), document.activeElement !== n) return;
}
D(M, "focusFirst");
function N(e) {
	let t = P(e);
	return [F(t, e), F(t.reverse(), e)];
}
D(N, "getTabbableEdges");
function P(e) {
	let t = [], n = e.ownerDocument.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, { acceptNode: /* @__PURE__ */ D((e) => {
		let t = e.tagName === "INPUT" && e.type === "hidden";
		return e.disabled || e.hidden || t ? NodeFilter.FILTER_SKIP : e.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
	}, "acceptNode") });
	for (; n.nextNode();) t.push(n.currentNode);
	return t;
}
D(P, "getTabbableCandidates");
function F(e, t) {
	let n = typeof t.checkVisibility == "function" && t.checkVisibility({ checkVisibilityCSS: !0 });
	for (let r of e) if (!(n ? !r.checkVisibility({ checkVisibilityCSS: !0 }) : ae(r, { upTo: t }))) return r;
}
D(F, "findVisible");
function ae(e, { upTo: t }) {
	if (getComputedStyle(e).visibility === "hidden") return !0;
	for (; e;) {
		if (t !== void 0 && e === t) return !1;
		if (getComputedStyle(e).display === "none") return !0;
		e = e.parentElement;
	}
	return !1;
}
D(ae, "isHidden");
function oe(e) {
	return e.tagName === "INPUT" && typeof e.select == "function";
}
D(oe, "isSelectableInput");
function I(e, { select: t = !1 } = {}) {
	if (e && e.focus) {
		let n = (e.ownerDocument ?? document).activeElement;
		e.focus({ preventScroll: !0 }), e !== n && oe(e) && t && e.select();
	}
}
D(I, "focus");
var se = ce();
function ce() {
	let e = [];
	return {
		add(t) {
			let n = e[0];
			t !== n && n?.pause(), e = L(e, t), e.unshift(t);
		},
		remove(t) {
			e = L(e, t), e[0]?.resume();
		}
	};
}
D(ce, "createFocusScopesStack");
function L(e, t) {
	let n = [...e], r = n.indexOf(t);
	return r !== -1 && n.splice(r, 1), n;
}
D(L, "arrayRemove");
function le(e) {
	return e.filter((e) => e.tagName !== "A");
}
D(le, "removeLinks");
// node_modules/@radix-ui/react-portal/dist/index.mjs
var ue = /* @__PURE__ */ t(i(), 1), de = Object.defineProperty, fe = /* @__PURE__ */ d.forwardRef(/* @__PURE__ */ ((e, t) => de(e, "name", {
	value: t,
	configurable: !0
}))(function(e, t) {
	let { container: n, ...r } = e, [i, o] = d.useState(!1);
	c(() => o(!0), []);
	let s = n || i && globalThis?.document?.body;
	return s ? ue.createPortal(/* @__PURE__ */ (0, f.jsx)(a.div, {
		...r,
		ref: t
	}), s) : null;
}, "Portal")), pe = Object.defineProperty, R = (e, t) => pe(e, "name", {
	value: t,
	configurable: !0
}), z = 0, B = null;
function me(e) {
	return V(), e.children;
}
R(me, "FocusGuards");
function V() {
	d.useEffect(() => {
		B ||= {
			start: he(),
			end: he()
		};
		let { start: e, end: t } = B;
		return document.body.firstElementChild !== e && document.body.insertAdjacentElement("afterbegin", e), document.body.lastElementChild !== t && document.body.insertAdjacentElement("beforeend", t), z++, () => {
			z === 1 && (B?.start.remove(), B?.end.remove(), B = null), z = Math.max(0, z - 1);
		};
	}, []);
}
R(V, "useFocusGuards");
function he() {
	let e = document.createElement("span");
	return e.setAttribute("data-radix-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
R(he, "createFocusGuard");
// node_modules/tslib/tslib.es6.mjs
var H = function() {
	return H = Object.assign || function(e) {
		for (var t, n = 1, r = arguments.length; n < r; n++) for (var i in t = arguments[n], t) Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
		return e;
	}, H.apply(this, arguments);
};
function ge(e, t) {
	var n = {};
	for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
	if (e != null && typeof Object.getOwnPropertySymbols == "function") for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++) t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
	return n;
}
function _e(e, t, n) {
	if (n || arguments.length === 2) for (var r = 0, i = t.length, a; r < i; r++) (a || !(r in t)) && (a ||= Array.prototype.slice.call(t, 0, r), a[r] = t[r]);
	return e.concat(a || Array.prototype.slice.call(t));
}
// node_modules/react-remove-scroll-bar/dist/es2015/constants.js
var U = "right-scroll-bar-position", W = "width-before-scroll-bar", ve = "with-scroll-bars-hidden", ye = "--removed-body-scroll-bar-size";
// node_modules/use-callback-ref/dist/es2015/assignRef.js
function be(e, t) {
	return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
// node_modules/use-callback-ref/dist/es2015/useRef.js
function xe(e, t) {
	var n = (0, d.useState)(function() {
		return {
			value: e,
			callback: t,
			facade: {
				get current() {
					return n.value;
				},
				set current(e) {
					var t = n.value;
					t !== e && (n.value = e, n.callback(e, t));
				}
			}
		};
	})[0];
	return n.callback = t, n.facade;
}
// node_modules/use-callback-ref/dist/es2015/useMergeRef.js
var Se = typeof window < "u" ? d.useLayoutEffect : d.useEffect, Ce = /* @__PURE__ */ new WeakMap();
function we(e, t) {
	var n = xe(t || null, function(t) {
		return e.forEach(function(e) {
			return be(e, t);
		});
	});
	return Se(function() {
		var t = Ce.get(n);
		if (t) {
			var r = new Set(t), i = new Set(e), a = n.current;
			r.forEach(function(e) {
				i.has(e) || be(e, null);
			}), i.forEach(function(e) {
				r.has(e) || be(e, a);
			});
		}
		Ce.set(n, e);
	}, [e]), n;
}
// node_modules/use-sidecar/dist/es2015/medium.js
function Te(e) {
	return e;
}
function Ee(e, t) {
	t === void 0 && (t = Te);
	var n = [], r = !1;
	return {
		read: function() {
			if (r) throw Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");
			return n.length ? n[n.length - 1] : e;
		},
		useMedium: function(e) {
			var i = t(e, r);
			return n.push(i), function() {
				n = n.filter(function(e) {
					return e !== i;
				});
			};
		},
		assignSyncMedium: function(e) {
			for (r = !0; n.length;) {
				var t = n;
				n = [], t.forEach(e);
			}
			n = {
				push: function(t) {
					return e(t);
				},
				filter: function() {
					return n;
				}
			};
		},
		assignMedium: function(e) {
			r = !0;
			var t = [];
			if (n.length) {
				var i = n;
				n = [], i.forEach(e), t = n;
			}
			var a = function() {
				var n = t;
				t = [], n.forEach(e);
			}, o = function() {
				return Promise.resolve().then(a);
			};
			o(), n = {
				push: function(e) {
					t.push(e), o();
				},
				filter: function(e) {
					return t = t.filter(e), n;
				}
			};
		}
	};
}
function De(e) {
	e === void 0 && (e = {});
	var t = Ee(null);
	return t.options = H({
		async: !0,
		ssr: !1
	}, e), t;
}
// node_modules/use-sidecar/dist/es2015/exports.js
var Oe = function(e) {
	var t = e.sideCar, n = ge(e, ["sideCar"]);
	if (!t) throw Error("Sidecar: please provide `sideCar` property to import the right car");
	var r = t.read();
	if (!r) throw Error("Sidecar medium not found");
	return d.createElement(r, H({}, n));
};
Oe.isSideCarExport = !0;
function ke(e, t) {
	return e.useMedium(t), Oe;
}
// node_modules/react-remove-scroll/dist/es2015/medium.js
var Ae = De(), je = function() {}, G = d.forwardRef(function(e, t) {
	var n = d.useRef(null), r = d.useState({
		onScrollCapture: je,
		onWheelCapture: je,
		onTouchMoveCapture: je
	}), i = r[0], a = r[1], o = e.forwardProps, s = e.children, c = e.className, l = e.removeScrollBar, u = e.enabled, f = e.shards, p = e.sideCar, m = e.noRelative, h = e.noIsolation, g = e.inert, _ = e.allowPinchZoom, v = e.as, y = v === void 0 ? "div" : v, b = e.gapMode, x = ge(e, [
		"forwardProps",
		"children",
		"className",
		"removeScrollBar",
		"enabled",
		"shards",
		"sideCar",
		"noRelative",
		"noIsolation",
		"inert",
		"allowPinchZoom",
		"as",
		"gapMode"
	]), S = p, C = we([n, t]), w = H(H({}, x), i);
	return d.createElement(d.Fragment, null, u && d.createElement(S, {
		sideCar: Ae,
		removeScrollBar: l,
		shards: f,
		noRelative: m,
		noIsolation: h,
		inert: g,
		setCallbacks: a,
		allowPinchZoom: !!_,
		lockRef: n,
		gapMode: b
	}), o ? d.cloneElement(d.Children.only(s), H(H({}, w), { ref: C })) : d.createElement(y, H({}, w, {
		className: c,
		ref: C
	}), s));
});
G.defaultProps = {
	enabled: !0,
	removeScrollBar: !0,
	inert: !1
}, G.classNames = {
	fullWidth: W,
	zeroRight: U
};
// node_modules/get-nonce/dist/es2015/index.js
var Me = function() {
	if (typeof __webpack_nonce__ < "u") return __webpack_nonce__;
};
// node_modules/react-style-singleton/dist/es2015/singleton.js
function Ne() {
	if (!document) return null;
	var e = document.createElement("style");
	e.type = "text/css";
	var t = Me();
	return t && e.setAttribute("nonce", t), e;
}
function Pe(e, t) {
	e.styleSheet ? e.styleSheet.cssText = t : e.appendChild(document.createTextNode(t));
}
function Fe(e) {
	(document.head || document.getElementsByTagName("head")[0]).appendChild(e);
}
var Ie = function() {
	var e = 0, t = null;
	return {
		add: function(n) {
			e == 0 && (t = Ne()) && (Pe(t, n), Fe(t)), e++;
		},
		remove: function() {
			e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), t = null);
		}
	};
}, Le = function() {
	var e = Ie();
	return function(t, n) {
		d.useEffect(function() {
			return e.add(t), function() {
				e.remove();
			};
		}, [t && n]);
	};
}, Re = function() {
	var e = Le();
	return function(t) {
		var n = t.styles, r = t.dynamic;
		return e(n, r), null;
	};
}, ze = {
	left: 0,
	top: 0,
	right: 0,
	gap: 0
}, Be = function(e) {
	return parseInt(e || "", 10) || 0;
}, Ve = function(e) {
	var t = window.getComputedStyle(document.body), n = t[e === "padding" ? "paddingLeft" : "marginLeft"], r = t[e === "padding" ? "paddingTop" : "marginTop"], i = t[e === "padding" ? "paddingRight" : "marginRight"];
	return [
		Be(n),
		Be(r),
		Be(i)
	];
}, He = function(e) {
	if (e === void 0 && (e = "margin"), typeof window > "u") return ze;
	var t = Ve(e), n = document.documentElement.clientWidth, r = window.innerWidth;
	return {
		left: t[0],
		top: t[1],
		right: t[2],
		gap: Math.max(0, r - n + t[2] - t[0])
	};
}, Ue = Re(), K = "data-scroll-locked", We = function(e, t, n, r) {
	var i = e.left, a = e.top, o = e.right, s = e.gap;
	return n === void 0 && (n = "margin"), `
  .${ve} {
   overflow: hidden ${r};
   padding-right: ${s}px ${r};
  }
  body[${K}] {
    overflow: hidden ${r};
    overscroll-behavior: contain;
    ${[
		t && `position: relative ${r};`,
		n === "margin" && `
    padding-left: ${i}px;
    padding-top: ${a}px;
    padding-right: ${o}px;
    margin-left:0;
    margin-top:0;
    margin-right: ${s}px ${r};
    `,
		n === "padding" && `padding-right: ${s}px ${r};`
	].filter(Boolean).join("")}
  }
  
  .${U} {
    right: ${s}px ${r};
  }
  
  .${W} {
    margin-right: ${s}px ${r};
  }
  
  .${U} .${U} {
    right: 0 ${r};
  }
  
  .${W} .${W} {
    margin-right: 0 ${r};
  }
  
  body[${K}] {
    ${ye}: ${s}px;
  }
`;
}, Ge = function() {
	var e = parseInt(document.body.getAttribute("data-scroll-locked") || "0", 10);
	return isFinite(e) ? e : 0;
}, Ke = function() {
	d.useEffect(function() {
		return document.body.setAttribute(K, (Ge() + 1).toString()), function() {
			var e = Ge() - 1;
			e <= 0 ? document.body.removeAttribute(K) : document.body.setAttribute(K, e.toString());
		};
	}, []);
}, qe = function(e) {
	var t = e.noRelative, n = e.noImportant, r = e.gapMode, i = r === void 0 ? "margin" : r;
	Ke();
	var a = d.useMemo(function() {
		return He(i);
	}, [i]);
	return d.createElement(Ue, { styles: We(a, !t, i, n ? "" : "!important") });
}, Je = !1;
if (typeof window < "u") try {
	var q = Object.defineProperty({}, "passive", { get: function() {
		return Je = !0, !0;
	} });
	window.addEventListener("test", q, q), window.removeEventListener("test", q, q);
} catch {
	Je = !1;
}
var J = Je ? { passive: !1 } : !1, Ye = function(e) {
	return e.tagName === "TEXTAREA";
}, Xe = function(e, t) {
	if (!(e instanceof Element)) return !1;
	var n = window.getComputedStyle(e);
	return n[t] !== "hidden" && !(n.overflowY === n.overflowX && !Ye(e) && n[t] === "visible");
}, Ze = function(e) {
	return Xe(e, "overflowY");
}, Qe = function(e) {
	return Xe(e, "overflowX");
}, $e = function(e, t) {
	var n = t.ownerDocument, r = t;
	do {
		if (typeof ShadowRoot < "u" && r instanceof ShadowRoot && (r = r.host), nt(e, r)) {
			var i = rt(e, r);
			if (i[1] > i[2]) return !0;
		}
		r = r.parentNode;
	} while (r && r !== n.body);
	return !1;
}, et = function(e) {
	return [
		e.scrollTop,
		e.scrollHeight,
		e.clientHeight
	];
}, tt = function(e) {
	return [
		e.scrollLeft,
		e.scrollWidth,
		e.clientWidth
	];
}, nt = function(e, t) {
	return e === "v" ? Ze(t) : Qe(t);
}, rt = function(e, t) {
	return e === "v" ? et(t) : tt(t);
}, it = function(e, t) {
	return e === "h" && t === "rtl" ? -1 : 1;
}, at = function(e, t, n, r, i) {
	var a = it(e, window.getComputedStyle(t).direction), o = a * r, s = n.target, c = t.contains(s), l = !1, u = o > 0, d = 0, f = 0;
	do {
		if (!s) break;
		var p = rt(e, s), m = p[0], h = p[1] - p[2] - a * m;
		(m || h) && nt(e, s) && (d += h, f += m);
		var g = s.parentNode;
		s = g && g.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? g.host : g;
	} while (!c && s !== document.body || c && (t.contains(s) || t === s));
	return (u && (i && Math.abs(d) < 1 || !i && o > d) || !u && (i && Math.abs(f) < 1 || !i && -o > f)) && (l = !0), l;
}, Y = function(e) {
	return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, ot = function(e) {
	return [e.deltaX, e.deltaY];
}, st = function(e) {
	return e && "current" in e ? e.current : e;
}, ct = function(e, t) {
	return e[0] === t[0] && e[1] === t[1];
}, lt = function(e) {
	return `
  .block-interactivity-${e} {pointer-events: none;}
  .allow-interactivity-${e} {pointer-events: all;}
`;
}, ut = 0, X = [];
function dt(e) {
	var t = d.useRef([]), n = d.useRef([0, 0]), r = d.useRef(), i = d.useState(ut++)[0], a = d.useState(Re)[0], o = d.useRef(e);
	d.useEffect(function() {
		o.current = e;
	}, [e]), d.useEffect(function() {
		if (e.inert) {
			document.body.classList.add(`block-interactivity-${i}`);
			var t = _e([e.lockRef.current], (e.shards || []).map(st), !0).filter(Boolean);
			return t.forEach(function(e) {
				return e.classList.add(`allow-interactivity-${i}`);
			}), function() {
				document.body.classList.remove(`block-interactivity-${i}`), t.forEach(function(e) {
					return e.classList.remove(`allow-interactivity-${i}`);
				});
			};
		}
	}, [
		e.inert,
		e.lockRef.current,
		e.shards
	]);
	var s = d.useCallback(function(e, t) {
		if ("touches" in e && e.touches.length === 2 || e.type === "wheel" && e.ctrlKey) return !o.current.allowPinchZoom;
		var i = Y(e), a = n.current, s = "deltaX" in e ? e.deltaX : a[0] - i[0], c = "deltaY" in e ? e.deltaY : a[1] - i[1], l, u = e.target, d = Math.abs(s) > Math.abs(c) ? "h" : "v";
		if ("touches" in e && d === "h" && u.type === "range") return !1;
		var f = window.getSelection(), p = f && f.anchorNode;
		if (p && (p === u || p.contains(u))) return !1;
		var m = $e(d, u);
		if (!m) return !0;
		if (m ? l = d : (l = d === "v" ? "h" : "v", m = $e(d, u)), !m) return !1;
		if (!r.current && "changedTouches" in e && (s || c) && (r.current = l), !l) return !0;
		var h = r.current || l;
		return at(h, t, e, h === "h" ? s : c, !0);
	}, []), c = d.useCallback(function(e) {
		var n = e;
		if (X.length && X[X.length - 1] === a) {
			var r = "deltaY" in n ? ot(n) : Y(n), i = t.current.filter(function(e) {
				return e.name === n.type && (e.target === n.target || n.target === e.shadowParent) && ct(e.delta, r);
			})[0];
			if (i && i.should) n.cancelable && n.preventDefault();
			else if (!i) {
				var c = (o.current.shards || []).map(st).filter(Boolean).filter(function(e) {
					return e.contains(n.target);
				});
				(c.length > 0 ? s(n, c[0]) : !o.current.noIsolation) && n.cancelable && n.preventDefault();
			}
		}
	}, []), l = d.useCallback(function(e, n, r, i) {
		var a = {
			name: e,
			delta: n,
			target: r,
			should: i,
			shadowParent: ft(r)
		};
		t.current.push(a), setTimeout(function() {
			t.current = t.current.filter(function(e) {
				return e !== a;
			});
		}, 1);
	}, []), u = d.useCallback(function(e) {
		n.current = Y(e), r.current = void 0;
	}, []), f = d.useCallback(function(t) {
		l(t.type, ot(t), t.target, s(t, e.lockRef.current));
	}, []), p = d.useCallback(function(t) {
		l(t.type, Y(t), t.target, s(t, e.lockRef.current));
	}, []);
	d.useEffect(function() {
		return X.push(a), e.setCallbacks({
			onScrollCapture: f,
			onWheelCapture: f,
			onTouchMoveCapture: p
		}), document.addEventListener("wheel", c, J), document.addEventListener("touchmove", c, J), document.addEventListener("touchstart", u, J), function() {
			X = X.filter(function(e) {
				return e !== a;
			}), document.removeEventListener("wheel", c, J), document.removeEventListener("touchmove", c, J), document.removeEventListener("touchstart", u, J);
		};
	}, []);
	var m = e.removeScrollBar, h = e.inert;
	return d.createElement(d.Fragment, null, h ? d.createElement(a, { styles: lt(i) }) : null, m ? d.createElement(qe, {
		noRelative: e.noRelative,
		gapMode: e.gapMode
	}) : null);
}
function ft(e) {
	for (var t = null; e !== null;) e instanceof ShadowRoot && (t = e.host, e = e.host), e = e.parentNode;
	return t;
}
// node_modules/react-remove-scroll/dist/es2015/sidecar.js
var pt = ke(Ae, dt), mt = d.forwardRef(function(e, t) {
	return d.createElement(G, H({}, e, {
		ref: t,
		sideCar: pt
	}));
});
mt.classNames = G.classNames;
// node_modules/aria-hidden/dist/es2015/index.js
var ht = function(e) {
	return typeof document > "u" ? null : (Array.isArray(e) ? e[0] : e).ownerDocument.body;
}, Z = /* @__PURE__ */ new WeakMap(), Q = /* @__PURE__ */ new WeakMap(), $ = {}, gt = 0, _t = function(e) {
	return e && (e.host || _t(e.parentNode));
}, vt = function(e, t) {
	return t.map(function(t) {
		if (e.contains(t)) return t;
		var n = _t(t);
		return n && e.contains(n) ? n : (console.error("aria-hidden", t, "in not contained inside", e, ". Doing nothing"), null);
	}).filter(function(e) {
		return !!e;
	});
}, yt = function(e, t, n, r) {
	var i = vt(t, Array.isArray(e) ? e : [e]);
	$[n] || ($[n] = /* @__PURE__ */ new WeakMap());
	var a = $[n], o = [], s = /* @__PURE__ */ new Set(), c = new Set(i), l = function(e) {
		e && !s.has(e) && (s.add(e), l(e.parentNode));
	};
	i.forEach(l);
	var u = function(e) {
		e && !c.has(e) && Array.prototype.forEach.call(e.children, function(e) {
			if (s.has(e)) u(e);
			else try {
				var t = e.getAttribute(r), i = t !== null && t !== "false", c = (Z.get(e) || 0) + 1, l = (a.get(e) || 0) + 1;
				Z.set(e, c), a.set(e, l), o.push(e), c === 1 && i && Q.set(e, !0), l === 1 && e.setAttribute(n, "true"), i || e.setAttribute(r, "true");
			} catch (t) {
				console.error("aria-hidden: cannot operate on ", e, t);
			}
		});
	};
	return u(t), s.clear(), gt++, function() {
		o.forEach(function(e) {
			var t = Z.get(e) - 1, i = a.get(e) - 1;
			Z.set(e, t), a.set(e, i), t || (Q.has(e) || e.removeAttribute(r), Q.delete(e)), i || e.removeAttribute(n);
		}), gt--, gt || (Z = /* @__PURE__ */ new WeakMap(), Z = /* @__PURE__ */ new WeakMap(), Q = /* @__PURE__ */ new WeakMap(), $ = {});
	};
}, bt = function(e, t, n) {
	n === void 0 && (n = "data-aria-hidden");
	var r = Array.from(Array.isArray(e) ? e : [e]), i = t || ht(e);
	return i ? (r.push.apply(r, Array.from(i.querySelectorAll("[aria-live], script"))), yt(r, i, n, "aria-hidden")) : function() {
		return null;
	};
};
export { ne as a, b as c, fe as i, x as l, mt as n, A as o, V as r, j as s, bt as t, u };
