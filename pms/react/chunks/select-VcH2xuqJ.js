import { f as e, h as t, p as n } from "./PmsContext-BVMd13Oi.js";
import { r, t as i } from "./dist-BFKqrRa-.js";
import { a, c as o, i as s, n as c, r as l, t as u, u as d } from "./es2015-Y_MGFf27.js";
import { t as f } from "./dist-BdqL8a-N.js";
import { i as p, o as m } from "./dist-BQlDVxi3.js";
import { i as h, n as g, r as _, t as v } from "./dist-DPAKuE1t.js";
import { n as y, t as b } from "./dist-K6BQKrIW.js";
import { t as x } from "./dist-C9AF_ym5.js";
import { n as S, t as C } from "./dist-CqlFeEAx.js";
import { i as w, n as T, r as E, t as ee } from "./dist-B_7XVMlu.js";
import { t as D } from "./dist-DSXUEWtZ.js";
import { t as O } from "./check-CgcMNk3u.js";
import { n as k, t as A } from "./chevron-up-CnW0SoV4.js";
// node_modules/@radix-ui/react-visually-hidden/dist/index.mjs
var j = /* @__PURE__ */ t(r(), 1), M = /* @__PURE__ */ t(n(), 1), N = e(), P = Object.freeze({
	position: "absolute",
	border: 0,
	width: 1,
	height: 1,
	padding: 0,
	margin: -1,
	overflow: "hidden",
	clip: "rect(0, 0, 0, 0)",
	whiteSpace: "nowrap",
	wordWrap: "normal"
}), te = Object.defineProperty, F = (e, t) => te(e, "name", {
	value: t,
	configurable: !0
}), ne = {
	ItemAligned: "item-aligned",
	Popper: "popper"
}, I = {
	LTR: "ltr",
	RTL: "rtl"
}, L = [
	" ",
	"Enter",
	"ArrowUp",
	"ArrowDown"
], re = [" ", "Enter"], R = "Select", [z, B, V] = y(R), [H, U] = h(R, [V, w]), W = w(), [G, K] = H(R), [ie, q] = H(R);
function J(e) {
	let { __scopeSelect: t, children: n, open: r, defaultOpen: i, onOpenChange: a, value: o, defaultValue: s, onValueChange: c, dir: l, name: u, autoComplete: d, disabled: f, required: p, form: m, internal_do_not_use_render: h } = e, g = W(t), [_, y] = M.useState(null), [x, C] = M.useState(null), [w, T] = M.useState(!1), E = b(l), [D, O] = v({
		prop: r,
		defaultProp: i ?? !1,
		onChange: a,
		caller: R
	}), [k, A] = v({
		prop: o,
		defaultProp: s,
		onChange: c,
		caller: R
	}), j = M.useRef(null), P = M.useRef(!1), [te, ne] = M.useState(null), I = /* @__PURE__ */ F((e) => {
		ne({
			value: e,
			hasConsumerStoppedPropagation: P.current
		}), A(e);
	}, "handleUserSelect"), L = M.useRef(k);
	M.useEffect(() => {
		let e = m ? _?.ownerDocument.getElementById(m) : _?.form;
		if (e instanceof HTMLFormElement) {
			let t = /* @__PURE__ */ F(() => A(L.current), "reset");
			return e.addEventListener("reset", t), () => e.removeEventListener("reset", t);
		}
	}, [
		m,
		_,
		A
	]);
	let re = !_ || !!m || !!_.closest("form"), [B, V] = M.useState(/* @__PURE__ */ new Set()), H = S(), U = Array.from(B).map((e) => e.props.value).join(";"), K = M.useCallback((e) => {
		V((t) => new Set(t).add(e));
	}, []), q = M.useCallback((e) => {
		V((t) => {
			let n = new Set(t);
			return n.delete(e), n;
		});
	}, []), J = {
		required: p,
		trigger: _,
		onTriggerChange: y,
		valueNode: x,
		onValueNodeChange: C,
		valueNodeHasChildren: w,
		onValueNodeHasChildrenChange: T,
		contentId: H,
		value: k,
		onValueChange: A,
		hasConsumerStoppedPropagationRef: P,
		userSelection: te,
		onUserSelect: I,
		open: D,
		onOpenChange: O,
		dir: E,
		triggerPointerDownPosRef: j,
		disabled: f,
		name: u,
		autoComplete: d,
		form: m,
		nativeOptions: B,
		nativeSelectKey: U,
		isFormControl: re
	};
	return /* @__PURE__ */ (0, N.jsx)(ee, {
		...g,
		children: /* @__PURE__ */ (0, N.jsx)(G, {
			scope: t,
			...J,
			children: /* @__PURE__ */ (0, N.jsx)(z.Provider, {
				scope: t,
				children: /* @__PURE__ */ (0, N.jsx)(ie, {
					scope: t,
					onNativeOptionAdd: K,
					onNativeOptionRemove: q,
					children: Ve(h) ? h(J) : n
				})
			})
		})
	});
}
F(J, "SelectProvider");
var ae = /* @__PURE__ */ F((e) => {
	let { __scopeSelect: t, children: n, ...r } = e;
	return /* @__PURE__ */ (0, N.jsx)(J, {
		__scopeSelect: t,
		...r,
		internal_do_not_use_render: ({ isFormControl: e }) => /* @__PURE__ */ (0, N.jsxs)(N.Fragment, { children: [n, e ? /* @__PURE__ */ (0, N.jsx)(Be, { __scopeSelect: t }) : null] })
	});
}, "Select"), oe = "SelectTrigger", se = /* @__PURE__ */ M.forwardRef(/* @__PURE__ */ F(function(e, t) {
	let { __scopeSelect: n, disabled: r = !1, ...a } = e, o = W(n), s = K(oe, n), c = s.disabled || r, l = m(t, s.onTriggerChange), u = B(n), d = M.useRef("touch"), [f, p, h] = He((e) => {
		let t = u().filter((e) => !e.disabled), n = Ue(t, e, t.find((e) => e.value === s.value));
		n !== void 0 && s.onUserSelect(n.value);
	}), _ = /* @__PURE__ */ F((e) => {
		c || (s.onOpenChange(!0), h()), e && (s.triggerPointerDownPosRef.current = {
			x: Math.round(e.pageX),
			y: Math.round(e.pageY)
		});
	}, "handleOpen");
	return /* @__PURE__ */ (0, N.jsx)(T, {
		asChild: !0,
		...o,
		children: /* @__PURE__ */ (0, N.jsx)(i.button, {
			type: "button",
			role: "combobox",
			"aria-controls": s.open ? s.contentId : void 0,
			"aria-expanded": s.open,
			"aria-required": s.required,
			"aria-autocomplete": "none",
			dir: s.dir,
			"data-state": s.open ? "open" : "closed",
			disabled: c,
			"data-disabled": c ? "" : void 0,
			"data-placeholder": $(s.value) ? "" : void 0,
			...a,
			ref: l,
			onClick: g(a.onClick, (e) => {
				e.currentTarget.focus(), d.current !== "mouse" && _(e);
			}),
			onPointerDown: g(a.onPointerDown, (e) => {
				d.current = e.pointerType;
				let t = e.target;
				t.hasPointerCapture(e.pointerId) && t.releasePointerCapture(e.pointerId), e.button === 0 && e.ctrlKey === !1 && e.pointerType === "mouse" && (_(e), e.preventDefault());
			}),
			onKeyDown: g(a.onKeyDown, (e) => {
				let t = f.current !== "";
				!(e.ctrlKey || e.altKey || e.metaKey) && e.key.length === 1 && (s.hasConsumerStoppedPropagationRef.current = e.isPropagationStopped(), p(e.key)), !(t && e.key === " ") && L.includes(e.key) && (_(), e.preventDefault());
			})
		})
	});
}, "SelectTrigger")), ce = "SelectValue", le = /* @__PURE__ */ M.forwardRef(/* @__PURE__ */ F(function(e, t) {
	let { __scopeSelect: n, className: r, style: a, children: o, placeholder: s = "", ...c } = e, l = K(ce, n), { onValueNodeHasChildrenChange: u } = l, d = o !== void 0, f = m(t, l.onValueNodeChange);
	_(() => {
		u(d);
	}, [u, d]);
	let p = $(l.value);
	return /* @__PURE__ */ (0, N.jsx)(i.span, {
		...c,
		asChild: !p && c.asChild,
		ref: f,
		style: { pointerEvents: "none" },
		children: /* @__PURE__ */ (0, N.jsx)(M.Fragment, { children: p ? s : o }, p ? "placeholder" : "value")
	});
}, "SelectValue")), ue = /* @__PURE__ */ M.forwardRef(/* @__PURE__ */ F(function(e, t) {
	let { __scopeSelect: n, children: r, ...a } = e;
	return /* @__PURE__ */ (0, N.jsx)(i.span, {
		"aria-hidden": !0,
		...a,
		ref: t,
		children: r || "▼"
	});
}, "SelectIcon")), [de, fe] = H("SelectPortal", { forceMount: void 0 }), pe = /* @__PURE__ */ F((e) => {
	let { __scopeSelect: t, forceMount: n, ...r } = e;
	return /* @__PURE__ */ (0, N.jsx)(de, {
		scope: e.__scopeSelect,
		forceMount: n,
		children: /* @__PURE__ */ (0, N.jsx)(s, {
			asChild: !0,
			...r
		})
	});
}, "SelectPortal"), Y = "SelectContent", me = /* @__PURE__ */ M.forwardRef(/* @__PURE__ */ F(function(e, t) {
	let n = fe(Y, e.__scopeSelect), { forceMount: r = n.forceMount, ...i } = e, a = K(Y, e.__scopeSelect), [o, s] = M.useState();
	return _(() => {
		s(new DocumentFragment());
	}, []), /* @__PURE__ */ (0, N.jsx)(x, {
		present: r || a.open,
		children: ({ present: e }) => e ? /* @__PURE__ */ (0, N.jsx)(ve, {
			...i,
			ref: t
		}) : /* @__PURE__ */ (0, N.jsx)(he, {
			...i,
			fragment: o
		})
	});
}, "SelectContent")), he = /* @__PURE__ */ M.forwardRef(/* @__PURE__ */ F(function(e, t) {
	let { __scopeSelect: n, children: r, fragment: i } = e;
	return i ? j.createPortal(/* @__PURE__ */ (0, N.jsx)(ge, {
		scope: n,
		children: /* @__PURE__ */ (0, N.jsx)(z.Slot, {
			scope: n,
			children: /* @__PURE__ */ (0, N.jsx)("div", {
				ref: t,
				children: r
			})
		})
	}), i) : null;
}, "SelectContentFragment")), X = 10, [ge, Z] = H(Y), _e = p("SelectContent.RemoveScroll"), ve = /* @__PURE__ */ M.forwardRef(/* @__PURE__ */ F(function(e, t) {
	let { __scopeSelect: n } = e, { position: r = ne.ItemAligned, onCloseAutoFocus: i, onEscapeKeyDown: s, onPointerDownOutside: d, side: f, sideOffset: p, align: h, alignOffset: _, arrowPadding: v, collisionBoundary: y, collisionPadding: b, sticky: x, hideWhenDetached: S, avoidCollisions: C, ...w } = e, T = K(Y, n), [E, ee] = M.useState(null), [D, O] = M.useState(null), k = m(t, ee), [A, j] = M.useState(null), [P, te] = M.useState(null), I = B(n), [L, re] = M.useState(!1), R = M.useRef(!1), z = M.useRef(!1), V = M.useRef(!1);
	M.useEffect(() => {
		if (E) return u(E);
	}, [E]), l();
	let H = M.useCallback((e) => {
		let [t, ...n] = I().map((e) => e.ref.current), [r] = n.slice(-1), i = document.activeElement;
		for (let n of e) if (n === i || (n?.scrollIntoView({ block: "nearest" }), n === t && D && (D.scrollTop = 0), n === r && D && (D.scrollTop = D.scrollHeight), n?.focus(), document.activeElement !== i)) return;
	}, [I, D]), U = M.useCallback(() => H([A, E]), [
		H,
		A,
		E
	]);
	M.useEffect(() => {
		L && U();
	}, [L, U]);
	let { onOpenChange: W, triggerPointerDownPosRef: G } = T;
	M.useEffect(() => {
		if (E) {
			let e = {
				x: 0,
				y: 0
			}, t = /* @__PURE__ */ F((t) => {
				e = {
					x: Math.abs(Math.round(t.pageX) - (G.current?.x ?? 0)),
					y: Math.abs(Math.round(t.pageY) - (G.current?.y ?? 0))
				};
			}, "handlePointerMove"), n = /* @__PURE__ */ F((n) => {
				e.x <= 10 && e.y <= 10 ? n.preventDefault() : n.composedPath().includes(E) || W(!1), document.removeEventListener("pointermove", t), G.current = null;
			}, "handlePointerUp");
			return G.current !== null && (document.addEventListener("pointermove", t), document.addEventListener("pointerup", n, {
				capture: !0,
				once: !0
			})), () => {
				document.removeEventListener("pointermove", t), document.removeEventListener("pointerup", n, { capture: !0 });
			};
		}
	}, [
		E,
		W,
		G
	]), M.useEffect(() => {
		let e = /* @__PURE__ */ F(() => W(!1), "close");
		return window.addEventListener("blur", e), window.addEventListener("resize", e), () => {
			window.removeEventListener("blur", e), window.removeEventListener("resize", e);
		};
	}, [W]);
	let [ie, q] = He((e) => {
		let t = I().filter((e) => !e.disabled), n = Ue(t, e, t.find((e) => e.ref.current === document.activeElement));
		n && setTimeout(() => n.ref.current?.focus());
	}), J = M.useCallback((e, t, n) => {
		let r = !z.current;
		r && (z.current = !0);
		let i = !R.current && !n;
		T.value !== void 0 && T.value === t || i ? (j(e), i && (R.current = !0)) : r && j(e);
	}, [T.value]), ae = M.useCallback(() => E?.focus(), [E]), oe = M.useCallback((e, t, n) => {
		if (!e) return;
		let r = !V.current;
		r && (V.current = !0);
		let i = !R.current && !n;
		(T.value !== void 0 && T.value === t || i || r) && te(e);
	}, [T.value]), se = r === ne.Popper ? be : ye, ce = se === be ? {
		side: f,
		sideOffset: p,
		align: h,
		alignOffset: _,
		arrowPadding: v,
		collisionBoundary: y,
		collisionPadding: b,
		sticky: x,
		hideWhenDetached: S,
		avoidCollisions: C
	} : {};
	return /* @__PURE__ */ (0, N.jsx)(ge, {
		scope: n,
		content: E,
		viewport: D,
		onViewportChange: O,
		itemRefCallback: J,
		selectedItem: A,
		onItemLeave: ae,
		itemTextRefCallback: oe,
		focusSelectedItem: U,
		selectedItemText: P,
		position: r,
		isPositioned: L,
		searchRef: ie,
		children: /* @__PURE__ */ (0, N.jsx)(c, {
			as: _e,
			allowPinchZoom: !0,
			children: /* @__PURE__ */ (0, N.jsx)(a, {
				asChild: !0,
				trapped: T.open,
				onMountAutoFocus: (e) => {
					e.preventDefault();
				},
				onUnmountAutoFocus: g(i, (e) => {
					T.trigger?.focus({ preventScroll: !0 }), e.preventDefault();
				}),
				children: /* @__PURE__ */ (0, N.jsx)(o, {
					asChild: !0,
					disableOutsidePointerEvents: !0,
					onEscapeKeyDown: s,
					onPointerDownOutside: d,
					onFocusOutside: (e) => e.preventDefault(),
					onDismiss: () => T.onOpenChange(!1),
					children: /* @__PURE__ */ (0, N.jsx)(se, {
						role: "listbox",
						id: T.contentId,
						"data-state": T.open ? "open" : "closed",
						dir: T.dir,
						onContextMenu: (e) => e.preventDefault(),
						...w,
						...ce,
						onPlaced: () => re(!0),
						ref: k,
						style: {
							display: "flex",
							flexDirection: "column",
							outline: "none",
							...w.style
						},
						onKeyDown: g(w.onKeyDown, (e) => {
							let t = e.ctrlKey || e.altKey || e.metaKey;
							if (e.key === "Tab" && e.preventDefault(), !t && e.key.length === 1 && q(e.key), [
								"ArrowUp",
								"ArrowDown",
								"Home",
								"End"
							].includes(e.key)) {
								let t = I().filter((e) => !e.disabled).map((e) => e.ref.current);
								if (["ArrowUp", "End"].includes(e.key) && (t = t.slice().reverse()), ["ArrowUp", "ArrowDown"].includes(e.key)) {
									let n = e.target, r = t.indexOf(n);
									t = t.slice(r + 1);
								}
								setTimeout(() => H(t)), e.preventDefault();
							}
						})
					})
				})
			})
		})
	});
}, "SelectContentImpl")), ye = /* @__PURE__ */ M.forwardRef(/* @__PURE__ */ F(function(e, t) {
	let { __scopeSelect: n, onPlaced: r, ...a } = e, o = K(Y, n), s = Z(Y, n), [c, l] = M.useState(null), [u, d] = M.useState(null), f = m(t, d), p = B(n), h = M.useRef(!1), g = M.useRef(!0), { viewport: v, selectedItem: y, selectedItemText: b, focusSelectedItem: x } = s, S = M.useCallback(() => {
		if (o.trigger && o.valueNode && c && u && v && y && b) {
			let e = o.trigger.getBoundingClientRect(), t = u.getBoundingClientRect(), n = o.valueNode.getBoundingClientRect(), i = b.getBoundingClientRect();
			if (o.dir !== I.RTL) {
				let r = i.left - t.left, a = n.left - r, o = e.left - a, s = e.width + o, l = Math.max(s, t.width), u = window.innerWidth - X, d = D(a, [X, Math.max(X, u - l)]);
				c.style.minWidth = s + "px", c.style.left = d + "px";
			} else {
				let r = t.right - i.right, a = window.innerWidth - n.right - r, o = window.innerWidth - e.right - a, s = e.width + o, l = Math.max(s, t.width), u = window.innerWidth - X, d = D(a, [X, Math.max(X, u - l)]);
				c.style.minWidth = s + "px", c.style.right = d + "px";
			}
			let a = p(), s = window.innerHeight - X * 2, l = v.scrollHeight, d = window.getComputedStyle(u), f = parseInt(d.borderTopWidth, 10), m = parseInt(d.paddingTop, 10), g = parseInt(d.borderBottomWidth, 10), _ = parseInt(d.paddingBottom, 10), x = f + m + l + _ + g, S = Math.min(y.offsetHeight * 5, x), C = window.getComputedStyle(v), w = parseInt(C.paddingTop, 10), T = parseInt(C.paddingBottom, 10), E = e.top + e.height / 2 - X, ee = s - E, O = y.offsetHeight / 2, k = y.offsetTop + O, A = f + m + k, j = x - A;
			if (A <= E) {
				let e = a.length > 0 && y === a[a.length - 1].ref.current;
				c.style.bottom = "0px";
				let t = u.clientHeight - v.offsetTop - v.offsetHeight, n = A + Math.max(ee, O + (e ? T : 0) + t + g);
				c.style.height = n + "px";
			} else {
				let e = a.length > 0 && y === a[0].ref.current;
				c.style.top = "0px";
				let t = Math.max(E, f + v.offsetTop + (e ? w : 0) + O) + j;
				c.style.height = t + "px", v.scrollTop = A - E + v.offsetTop;
			}
			c.style.margin = `${X}px 0`, c.style.minHeight = S + "px", c.style.maxHeight = s + "px", r?.(), requestAnimationFrame(() => h.current = !0);
		}
	}, [
		p,
		o.trigger,
		o.valueNode,
		c,
		u,
		v,
		y,
		b,
		o.dir,
		r
	]);
	_(() => S(), [S]);
	let [C, w] = M.useState();
	_(() => {
		u && w(window.getComputedStyle(u).zIndex);
	}, [u]);
	let T = M.useCallback((e) => {
		e && g.current === !0 && (S(), x?.(), g.current = !1);
	}, [S, x]);
	return /* @__PURE__ */ (0, N.jsx)(xe, {
		scope: n,
		contentWrapper: c,
		shouldExpandOnScrollRef: h,
		onScrollButtonChange: T,
		children: /* @__PURE__ */ (0, N.jsx)("div", {
			ref: l,
			style: {
				display: "flex",
				flexDirection: "column",
				position: "fixed",
				zIndex: C
			},
			children: /* @__PURE__ */ (0, N.jsx)(i.div, {
				...a,
				ref: f,
				style: {
					boxSizing: "border-box",
					maxHeight: "100%",
					...a.style
				}
			})
		})
	});
}, "SelectItemAlignedPosition")), be = /* @__PURE__ */ M.forwardRef(/* @__PURE__ */ F(function(e, t) {
	let { __scopeSelect: n, align: r = "start", collisionPadding: i = X, ...a } = e, o = W(n);
	return /* @__PURE__ */ (0, N.jsx)(E, {
		...o,
		...a,
		ref: t,
		align: r,
		collisionPadding: i,
		style: {
			boxSizing: "border-box",
			...a.style,
			"--radix-select-content-transform-origin": "var(--radix-popper-transform-origin)",
			"--radix-select-content-available-width": "var(--radix-popper-available-width)",
			"--radix-select-content-available-height": "var(--radix-popper-available-height)",
			"--radix-select-trigger-width": "var(--radix-popper-anchor-width)",
			"--radix-select-trigger-height": "var(--radix-popper-anchor-height)"
		}
	});
}, "SelectPopperPosition")), [xe, Se] = H(Y, {}), Ce = "SelectViewport", we = /* @__PURE__ */ M.forwardRef(/* @__PURE__ */ F(function(e, t) {
	let { __scopeSelect: n, nonce: r, ...a } = e, o = Z(Ce, n), s = Se(Ce, n), c = m(t, o.onViewportChange), l = M.useRef(0);
	return /* @__PURE__ */ (0, N.jsxs)(N.Fragment, { children: [/* @__PURE__ */ (0, N.jsx)("style", {
		dangerouslySetInnerHTML: { __html: "[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}" },
		nonce: r
	}), /* @__PURE__ */ (0, N.jsx)(z.Slot, {
		scope: n,
		children: /* @__PURE__ */ (0, N.jsx)(i.div, {
			"data-radix-select-viewport": "",
			role: "presentation",
			...a,
			ref: c,
			style: {
				position: "relative",
				flex: 1,
				overflow: "hidden auto",
				...a.style
			},
			onScroll: g(a.onScroll, (e) => {
				let t = e.currentTarget, { contentWrapper: n, shouldExpandOnScrollRef: r } = s;
				if (r?.current && n) {
					let e = Math.abs(l.current - t.scrollTop);
					if (e > 0) {
						let r = window.innerHeight - X * 2, i = parseFloat(n.style.minHeight), a = parseFloat(n.style.height), o = Math.max(i, a);
						if (o < r) {
							let i = o + e, a = Math.min(r, i), s = i - a;
							n.style.height = a + "px", n.style.bottom === "0px" && (t.scrollTop = s > 0 ? s : 0, n.style.justifyContent = "flex-end");
						}
					}
				}
				l.current = t.scrollTop;
			})
		})
	})] });
}, "SelectViewport")), [Te, Ee] = H("SelectGroup"), De = "SelectItem", [Oe, ke] = H(De), Ae = /* @__PURE__ */ M.forwardRef(/* @__PURE__ */ F(function(e, t) {
	let { __scopeSelect: n, value: r, disabled: a = !1, textValue: o, ...s } = e, c = K(De, n), l = Z(De, n), u = c.value === r, [d, f] = M.useState(o ?? ""), [p, h] = M.useState(!1), _ = C((e) => l.itemRefCallback?.(e, r, a)), v = m(t, _), y = S(), b = M.useRef("touch");
	function x(e) {
		c.hasConsumerStoppedPropagationRef.current = e.isPropagationStopped(), c.onUserSelect(r), c.onOpenChange(!1);
	}
	return F(x, "handleSelect"), /* @__PURE__ */ (0, N.jsx)(Oe, {
		scope: n,
		value: r,
		disabled: a,
		textId: y,
		isSelected: u,
		onItemTextChange: M.useCallback((e) => {
			f((t) => t || (e?.textContent ?? "").trim());
		}, []),
		children: /* @__PURE__ */ (0, N.jsx)(z.ItemSlot, {
			scope: n,
			value: r,
			disabled: a,
			textValue: d,
			children: /* @__PURE__ */ (0, N.jsx)(i.div, {
				role: "option",
				"aria-labelledby": y,
				"data-highlighted": p ? "" : void 0,
				"aria-selected": u && p,
				"data-state": u ? "checked" : "unchecked",
				"aria-disabled": a || void 0,
				"data-disabled": a ? "" : void 0,
				tabIndex: a ? void 0 : -1,
				...s,
				ref: v,
				onFocus: g(s.onFocus, () => h(!0)),
				onBlur: g(s.onBlur, () => h(!1)),
				onClick: g(s.onClick, (e) => {
					a || b.current !== "mouse" && x(e);
				}),
				onPointerUp: g(s.onPointerUp, (e) => {
					a || b.current === "mouse" && x(e);
				}),
				onPointerDown: g(s.onPointerDown, (e) => {
					b.current = e.pointerType;
				}),
				onPointerMove: g(s.onPointerMove, (e) => {
					b.current = e.pointerType, a ? l.onItemLeave?.() : b.current === "mouse" && e.currentTarget.focus({ preventScroll: !0 });
				}),
				onPointerLeave: g(s.onPointerLeave, (e) => {
					e.currentTarget === document.activeElement && l.onItemLeave?.();
				}),
				onKeyDown: g(s.onKeyDown, (e) => {
					a || e.target !== e.currentTarget || (l.searchRef?.current === "" || e.key !== " ") && (re.includes(e.key) && x(e), e.key === " " && e.preventDefault());
				})
			})
		})
	});
}, "SelectItem")), Q = "SelectItemText", je = /* @__PURE__ */ M.forwardRef(/* @__PURE__ */ F(function(e, t) {
	let { __scopeSelect: n, className: r, style: a, ...o } = e, s = K(Q, n), c = Z(Q, n), l = ke(Q, n), u = q(Q, n), [d, f] = M.useState(null), p = C((e) => c.itemTextRefCallback?.(e, l.value, l.disabled)), h = m(t, f, l.onItemTextChange, p), g = d?.textContent, v = M.useMemo(() => /* @__PURE__ */ (0, N.jsx)("option", {
		value: l.value,
		disabled: l.disabled,
		children: g
	}, l.value), [
		l.disabled,
		l.value,
		g
	]), { onNativeOptionAdd: y, onNativeOptionRemove: b } = u;
	return _(() => (y(v), () => b(v)), [
		y,
		b,
		v
	]), /* @__PURE__ */ (0, N.jsxs)(N.Fragment, { children: [/* @__PURE__ */ (0, N.jsx)(i.span, {
		id: l.textId,
		...o,
		ref: h
	}), l.isSelected && s.valueNode && !s.valueNodeHasChildren && !$(s.value) ? j.createPortal(o.children, s.valueNode) : null] });
}, "SelectItemText")), Me = "SelectItemIndicator", Ne = /* @__PURE__ */ M.forwardRef(/* @__PURE__ */ F(function(e, t) {
	let { __scopeSelect: n, ...r } = e;
	return ke(Me, n).isSelected ? /* @__PURE__ */ (0, N.jsx)(i.span, {
		"aria-hidden": !0,
		...r,
		ref: t
	}) : null;
}, "SelectItemIndicator")), Pe = "SelectScrollUpButton", Fe = /* @__PURE__ */ M.forwardRef(/* @__PURE__ */ F(function(e, t) {
	let n = Z(Pe, e.__scopeSelect), r = Se(Pe, e.__scopeSelect), [i, a] = M.useState(!1), o = m(t, r.onScrollButtonChange);
	return _(() => {
		if (n.viewport && n.isPositioned) {
			let e = function() {
				let e = t.scrollTop > 0;
				a(e);
			};
			F(e, "handleScroll");
			let t = n.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [n.viewport, n.isPositioned]), i ? /* @__PURE__ */ (0, N.jsx)(Re, {
		...e,
		ref: o,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = n;
			e && t && (e.scrollTop -= t.offsetHeight);
		}
	}) : null;
}, "SelectScrollUpButton")), Ie = "SelectScrollDownButton", Le = /* @__PURE__ */ M.forwardRef(/* @__PURE__ */ F(function(e, t) {
	let n = Z(Ie, e.__scopeSelect), r = Se(Ie, e.__scopeSelect), [i, a] = M.useState(!1), o = m(t, r.onScrollButtonChange);
	return _(() => {
		if (n.viewport && n.isPositioned) {
			let e = function() {
				let e = t.scrollHeight - t.clientHeight, n = Math.ceil(t.scrollTop) < e;
				a(n);
			};
			F(e, "handleScroll");
			let t = n.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [n.viewport, n.isPositioned]), i ? /* @__PURE__ */ (0, N.jsx)(Re, {
		...e,
		ref: o,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = n;
			e && t && (e.scrollTop += t.offsetHeight);
		}
	}) : null;
}, "SelectScrollDownButton")), Re = /* @__PURE__ */ M.forwardRef(/* @__PURE__ */ F(function(e, t) {
	let { __scopeSelect: n, onAutoScroll: r, ...a } = e, o = Z("SelectScrollButton", n), s = M.useRef(null), c = B(n), l = M.useCallback(() => {
		s.current !== null && (window.clearInterval(s.current), s.current = null);
	}, []);
	return M.useEffect(() => () => l(), [l]), _(() => {
		c().find((e) => e.ref.current === document.activeElement)?.ref.current?.scrollIntoView({ block: "nearest" });
	}, [c]), /* @__PURE__ */ (0, N.jsx)(i.div, {
		"aria-hidden": !0,
		...a,
		ref: t,
		style: {
			flexShrink: 0,
			...a.style
		},
		onPointerDown: g(a.onPointerDown, () => {
			s.current === null && (s.current = window.setInterval(r, 50));
		}),
		onPointerMove: g(a.onPointerMove, () => {
			o.onItemLeave?.(), s.current === null && (s.current = window.setInterval(r, 50));
		}),
		onPointerLeave: g(a.onPointerLeave, () => {
			l();
		})
	});
}, "SelectScrollButtonImpl")), ze = "SelectBubbleInput", Be = /* @__PURE__ */ M.forwardRef(/* @__PURE__ */ F(function({ __scopeSelect: e, ...t }, n) {
	let r = K(ze, e), { value: a, onValueChange: o, required: s, disabled: c, name: l, autoComplete: u, form: d, userSelection: f } = r, { nativeOptions: p, nativeSelectKey: h } = r, g = M.useRef(null), _ = m(n, g), v = a ?? "", y = M.useRef(v), b = M.useRef(f), x = M.useRef(!1), S = Array.from(p).some((e) => (e.props.value ?? "") === "");
	return M.useEffect(() => {
		let e = g.current;
		if (!e) return;
		let t = window.HTMLSelectElement.prototype, n = Object.getOwnPropertyDescriptor(t, "value").set, r = f !== null && f !== b.current;
		b.current = f;
		let i = y.current !== v;
		y.current = v;
		let a = r && i;
		if (r && !i && f.value !== v && !f.hasConsumerStoppedPropagation && n) {
			x.current = !0;
			try {
				n.call(e, f.value), e.dispatchEvent(new Event("change", { bubbles: !0 }));
			} finally {
				x.current = !1, n.call(e, v);
			}
			return;
		}
		let o = a && !f.hasConsumerStoppedPropagation;
		if (i && n) {
			let t = new Event("change", { bubbles: o });
			n.call(e, v), e.dispatchEvent(t);
		}
	}, [v, f]), /* @__PURE__ */ (0, N.jsxs)(i.select, {
		"aria-hidden": !0,
		required: s,
		tabIndex: -1,
		name: l,
		autoComplete: u,
		disabled: c,
		form: d,
		onChange: (e) => {
			x.current || o(e.target.value);
		},
		...t,
		style: {
			...P,
			...t.style
		},
		ref: _,
		defaultValue: v,
		children: [$(a) && !S ? /* @__PURE__ */ (0, N.jsx)("option", { value: "" }) : null, Array.from(p)]
	}, h);
}, "SelectBubbleInput"));
function Ve(e) {
	return typeof e == "function";
}
F(Ve, "isFunction");
function $(e) {
	return e === "" || e === void 0;
}
F($, "shouldShowPlaceholder");
function He(e) {
	let t = C(e), n = M.useRef(""), r = M.useRef(0), i = M.useCallback((e) => {
		let i = n.current + e;
		t(i);
		function a(e) {
			n.current = e, window.clearTimeout(r.current), e !== "" && (r.current = window.setTimeout(() => a(""), 1e3));
		}
		F(a, "updateSearch"), a(i);
	}, [t]), a = M.useCallback(() => {
		n.current = "", window.clearTimeout(r.current);
	}, []);
	return M.useEffect(() => () => window.clearTimeout(r.current), []), [
		n,
		i,
		a
	];
}
F(He, "useTypeaheadSearch");
function Ue(e, t, n) {
	let r = t.length > 1 && Array.from(t).every((e) => e === t[0]) ? t[0] : t, i = n ? e.indexOf(n) : -1, a = We(e, Math.max(i, 0));
	r.length === 1 && (a = a.filter((e) => e !== n));
	let o = a.find((e) => e.textValue.toLowerCase().startsWith(r.toLowerCase()));
	return o === n ? void 0 : o;
}
F(Ue, "findNextItem");
function We(e, t) {
	return e.map((n, r) => e[(t + r) % e.length]);
}
F(We, "wrapArray");
// src/components/ui/select.tsx
function Ge({ ...e }) {
	return /* @__PURE__ */ (0, N.jsx)(ae, {
		"data-slot": "select",
		...e
	});
}
function Ke({ ...e }) {
	return /* @__PURE__ */ (0, N.jsx)(le, {
		"data-slot": "select-value",
		...e
	});
}
function qe({ className: e, size: t = "default", children: n, ...r }) {
	return /* @__PURE__ */ (0, N.jsxs)(se, {
		"data-slot": "select-trigger",
		"data-size": t,
		className: f("flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground", e),
		...r,
		children: [n, /* @__PURE__ */ (0, N.jsx)(ue, {
			asChild: !0,
			children: /* @__PURE__ */ (0, N.jsx)(k, { className: "size-4 opacity-50" })
		})]
	});
}
function Je({ className: e, children: t, position: n = "item-aligned", align: r = "center", ...i }) {
	return /* @__PURE__ */ (0, N.jsx)(pe, {
		container: d(),
		children: /* @__PURE__ */ (0, N.jsxs)(me, {
			"data-slot": "select-content",
			className: f("relative z-[1200] max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", n === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", e),
			position: n,
			align: r,
			...i,
			children: [
				/* @__PURE__ */ (0, N.jsx)(Xe, {}),
				/* @__PURE__ */ (0, N.jsx)(we, {
					className: f("p-1", n === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"),
					children: t
				}),
				/* @__PURE__ */ (0, N.jsx)(Ze, {})
			]
		})
	});
}
function Ye({ className: e, children: t, ...n }) {
	return /* @__PURE__ */ (0, N.jsxs)(Ae, {
		"data-slot": "select-item",
		className: f("relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2", e),
		...n,
		children: [/* @__PURE__ */ (0, N.jsx)("span", {
			"data-slot": "select-item-indicator",
			className: "absolute right-2 flex size-3.5 items-center justify-center",
			children: /* @__PURE__ */ (0, N.jsx)(Ne, { children: /* @__PURE__ */ (0, N.jsx)(O, { className: "size-4" }) })
		}), /* @__PURE__ */ (0, N.jsx)(je, { children: t })]
	});
}
function Xe({ className: e, ...t }) {
	return /* @__PURE__ */ (0, N.jsx)(Fe, {
		"data-slot": "select-scroll-up-button",
		className: f("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ (0, N.jsx)(A, { className: "size-4" })
	});
}
function Ze({ className: e, ...t }) {
	return /* @__PURE__ */ (0, N.jsx)(Le, {
		"data-slot": "select-scroll-down-button",
		className: f("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ (0, N.jsx)(k, { className: "size-4" })
	});
}
export { Ke as a, qe as i, Je as n, Ye as r, Ge as t };
