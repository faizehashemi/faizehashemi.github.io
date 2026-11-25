import { f as e, h as t, p as n } from "./PmsContext-BVMd13Oi.js";
import { t as r } from "./dist-BFKqrRa-.js";
import { t as i } from "./dist-BdqL8a-N.js";
import { o as a, t as o } from "./dist-BQlDVxi3.js";
import { i as s, n as c, r as l, t as u } from "./dist-DPAKuE1t.js";
import { n as d, t as f } from "./dist-K6BQKrIW.js";
import { t as p } from "./dist-C9AF_ym5.js";
import { n as m, t as h } from "./dist-CqlFeEAx.js";
// node_modules/@radix-ui/react-use-is-hydrated/dist/index.mjs
var g = /* @__PURE__ */ t(n(), 1), _ = Object.defineProperty, v = (e, t) => _(e, "name", {
	value: t,
	configurable: !0
}), y = !1;
function b() {
	let [e, t] = g.useState(y);
	return g.useEffect(() => {
		y || (y = !0, t(!0));
	}, []), e;
}
v(b, "useIsHydrated");
var x = g.useSyncExternalStore;
function S() {
	return () => {};
}
v(S, "subscribe");
function C() {
	return x(S, () => !0, () => !1);
}
v(C, "useIsHydratedModern");
var w = typeof x == "function" ? C : b, T = e(), E = Object.defineProperty, D = (e, t) => E(e, "name", {
	value: t,
	configurable: !0
}), O = "rovingFocusGroup.onEntryFocus", ee = {
	bubbles: !1,
	cancelable: !0
}, k = "RovingFocusGroup", [A, j, M] = d(k), [N, P] = s(k, [M]), F = {
	Vertical: "vertical",
	Horizontal: "horizontal"
}, te = {
	LTR: "ltr",
	RTL: "rtl"
}, [ne, I] = N(k), L = /* @__PURE__ */ g.forwardRef(/* @__PURE__ */ D(function(e, t) {
	return /* @__PURE__ */ (0, T.jsx)(A.Provider, {
		scope: e.__scopeRovingFocusGroup,
		children: /* @__PURE__ */ (0, T.jsx)(A.Slot, {
			scope: e.__scopeRovingFocusGroup,
			children: /* @__PURE__ */ (0, T.jsx)(R, {
				...e,
				ref: t
			})
		})
	});
}, "RovingFocusGroup")), R = /* @__PURE__ */ g.forwardRef(/* @__PURE__ */ D(function(e, t) {
	let { __scopeRovingFocusGroup: n, orientation: i, loop: o = !1, dir: s, currentTabStopId: l, defaultCurrentTabStopId: d, onCurrentTabStopIdChange: p, onEntryFocus: m, preventScrollOnEntryFocus: _ = !1, ...v } = e, y = g.useRef(null), b = a(t, y), x = f(s), [S, C] = u({
		prop: l,
		defaultProp: d ?? null,
		onChange: p,
		caller: k
	}), [w, E] = g.useState(!1), D = h(m), A = j(n), M = g.useRef(!1), [N, P] = g.useState(0);
	return g.useEffect(() => {
		let e = y.current;
		if (e) return e.addEventListener(O, D), () => e.removeEventListener(O, D);
	}, [D]), /* @__PURE__ */ (0, T.jsx)(ne, {
		scope: n,
		orientation: i,
		dir: x,
		loop: o,
		currentTabStopId: S,
		onItemFocus: g.useCallback((e) => C(e), [C]),
		onItemShiftTab: g.useCallback(() => E(!0), []),
		onFocusableItemAdd: g.useCallback(() => P((e) => e + 1), []),
		onFocusableItemRemove: g.useCallback(() => P((e) => e - 1), []),
		children: /* @__PURE__ */ (0, T.jsx)(r.div, {
			tabIndex: w || N === 0 ? -1 : 0,
			"data-orientation": i,
			...v,
			ref: b,
			style: {
				outline: "none",
				...e.style
			},
			onMouseDown: c(e.onMouseDown, () => {
				M.current = !0;
			}),
			onFocus: c(e.onFocus, (e) => {
				let t = !M.current;
				if (e.target === e.currentTarget && t && !w) {
					let t = new CustomEvent(O, ee);
					if (e.currentTarget.dispatchEvent(t), !t.defaultPrevented) {
						let e = A().filter((e) => e.focusable);
						H([
							e.find((e) => e.active),
							e.find((e) => e.id === S),
							...e
						].filter(Boolean).map((e) => e.ref.current), _);
					}
				}
				M.current = !1;
			}),
			onBlur: c(e.onBlur, () => E(!1))
		})
	});
}, "RovingFocusGroupImpl")), z = "RovingFocusGroupItem", re = /* @__PURE__ */ g.forwardRef(/* @__PURE__ */ D(function(e, t) {
	let { __scopeRovingFocusGroup: n, focusable: i = !0, active: a = !1, tabStopId: o, children: s, ...u } = e, d = m(), f = o || d, p = I(z, n), h = p.currentTabStopId === f, _ = j(n), { onFocusableItemAdd: v, onFocusableItemRemove: y, currentTabStopId: b } = p, x = w();
	return l(() => {
		if (x && i) return v(), () => y();
	}, [
		x,
		i,
		v,
		y
	]), g.useEffect(() => {
		if (!x && i) return v(), () => y();
	}, [
		x,
		i,
		v,
		y
	]), /* @__PURE__ */ (0, T.jsx)(A.ItemSlot, {
		scope: n,
		id: f,
		focusable: i,
		active: a,
		children: /* @__PURE__ */ (0, T.jsx)(r.span, {
			tabIndex: h ? 0 : -1,
			"data-orientation": p.orientation,
			...u,
			ref: t,
			onMouseDown: c(e.onMouseDown, (e) => {
				i ? p.onItemFocus(f) : e.preventDefault();
			}),
			onFocus: c(e.onFocus, () => p.onItemFocus(f)),
			onKeyDown: c(e.onKeyDown, (e) => {
				if (e.key === "Tab" && e.shiftKey) {
					p.onItemShiftTab();
					return;
				}
				if (e.target !== e.currentTarget) return;
				let t = V(e, p.orientation, p.dir);
				if (t !== void 0) {
					if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
					e.preventDefault();
					let n = _().filter((e) => e.focusable).map((e) => e.ref.current);
					if (t === "last") n.reverse();
					else if (t === "prev" || t === "next") {
						t === "prev" && n.reverse();
						let r = n.indexOf(e.currentTarget);
						n = p.loop ? U(n, r + 1) : n.slice(r + 1);
					}
					setTimeout(() => H(n));
				}
			}),
			children: typeof s == "function" ? s({
				isCurrentTabStop: h,
				hasTabStop: b != null
			}) : s
		})
	});
}, "RovingFocusGroupItem")), ie = {
	ArrowLeft: "prev",
	ArrowUp: "prev",
	ArrowRight: "next",
	ArrowDown: "next",
	PageUp: "first",
	Home: "first",
	PageDown: "last",
	End: "last"
};
function B(e, t) {
	return t === te.RTL ? e === "ArrowLeft" ? "ArrowRight" : e === "ArrowRight" ? "ArrowLeft" : e : e;
}
D(B, "getDirectionAwareKey");
function V(e, t, n) {
	let r = B(e.key, n);
	if (!(t === F.Vertical && ["ArrowLeft", "ArrowRight"].includes(r)) && !(t === F.Horizontal && ["ArrowUp", "ArrowDown"].includes(r))) return ie[r];
}
D(V, "getFocusIntent");
function H(e, t = !1) {
	let n = document.activeElement;
	for (let r of e) if (r === n || (r.focus({ preventScroll: t }), document.activeElement !== n)) return;
}
D(H, "focusFirst");
function U(e, t) {
	return e.map((n, r) => e[(t + r) % e.length]);
}
D(U, "wrapArray");
// node_modules/@radix-ui/react-tabs/dist/index.mjs
var W = Object.defineProperty, G = (e, t) => W(e, "name", {
	value: t,
	configurable: !0
}), K = {
	Automatic: "automatic",
	Manual: "manual"
}, q = "Tabs", [J, ae] = s(q, [P]), Y = P(), [oe, X] = J(q), se = /* @__PURE__ */ g.forwardRef(/* @__PURE__ */ G(function(e, t) {
	let { __scopeTabs: n, value: i, onValueChange: a, defaultValue: o, orientation: s = "horizontal", dir: c, activationMode: l = K.Automatic, ...d } = e, p = f(c), [h, g] = u({
		prop: i,
		onChange: a,
		defaultProp: o ?? "",
		caller: q
	});
	return /* @__PURE__ */ (0, T.jsx)(oe, {
		scope: n,
		baseId: m(),
		value: h,
		onValueChange: g,
		orientation: s,
		dir: p,
		activationMode: l,
		children: /* @__PURE__ */ (0, T.jsx)(r.div, {
			dir: p,
			"data-orientation": s,
			...d,
			ref: t
		})
	});
}, "Tabs")), ce = "TabsList", le = /* @__PURE__ */ g.forwardRef(/* @__PURE__ */ G(function(e, t) {
	let { __scopeTabs: n, loop: i = !0, ...a } = e, o = X(ce, n), s = Y(n);
	return /* @__PURE__ */ (0, T.jsx)(L, {
		asChild: !0,
		...s,
		orientation: o.orientation,
		dir: o.dir,
		loop: i,
		children: /* @__PURE__ */ (0, T.jsx)(r.div, {
			role: "tablist",
			"aria-orientation": o.orientation,
			...a,
			ref: t
		})
	});
}, "TabsList")), ue = "TabsTrigger", de = /* @__PURE__ */ g.forwardRef(/* @__PURE__ */ G(function(e, t) {
	let { __scopeTabs: n, value: i, disabled: a = !1, ...o } = e, s = X(ue, n), l = Y(n), u = Z(s.baseId, i), d = Q(s.baseId, i), f = i === s.value;
	return /* @__PURE__ */ (0, T.jsx)(re, {
		asChild: !0,
		...l,
		focusable: !a,
		active: f,
		children: /* @__PURE__ */ (0, T.jsx)(r.button, {
			type: "button",
			role: "tab",
			"aria-selected": f,
			"aria-controls": d,
			"data-state": f ? "active" : "inactive",
			"data-disabled": a ? "" : void 0,
			disabled: a,
			id: u,
			...o,
			ref: t,
			onMouseDown: c(e.onMouseDown, (e) => {
				!a && e.button === 0 && e.ctrlKey === !1 ? (e.currentTarget.focus(), s.onValueChange(i)) : e.preventDefault();
			}),
			onKeyDown: c(e.onKeyDown, (e) => {
				a || e.target !== e.currentTarget || [" ", "Enter"].includes(e.key) && s.onValueChange(i);
			}),
			onFocus: c(e.onFocus, () => {
				let e = s.activationMode !== K.Manual;
				!f && !a && e && s.onValueChange(i);
			})
		})
	});
}, "TabsTrigger")), fe = "TabsContent", pe = /* @__PURE__ */ g.forwardRef(/* @__PURE__ */ G(function(e, t) {
	let { __scopeTabs: n, value: i, forceMount: a, children: o, ...s } = e, c = X(fe, n), l = Z(c.baseId, i), u = Q(c.baseId, i), d = i === c.value, f = g.useRef(d);
	return g.useEffect(() => {
		let e = requestAnimationFrame(() => f.current = !1);
		return () => cancelAnimationFrame(e);
	}, []), /* @__PURE__ */ (0, T.jsx)(p, {
		present: a || d,
		children: ({ present: n }) => /* @__PURE__ */ (0, T.jsx)(r.div, {
			"data-state": d ? "active" : "inactive",
			"data-orientation": c.orientation,
			role: "tabpanel",
			"aria-labelledby": l,
			hidden: !n,
			id: u,
			tabIndex: 0,
			...s,
			ref: t,
			style: {
				...e.style,
				animationDuration: f.current ? "0s" : void 0
			},
			children: n && o
		})
	});
}, "TabsContent"));
function Z(e, t) {
	return `${e}-trigger-${t}`;
}
G(Z, "makeTriggerId");
function Q(e, t) {
	return `${e}-content-${t}`;
}
G(Q, "makeContentId");
// src/components/ui/tabs.tsx
function $({ className: e, orientation: t = "horizontal", ...n }) {
	return /* @__PURE__ */ (0, T.jsx)(se, {
		"data-slot": "tabs",
		"data-orientation": t,
		orientation: t,
		className: i("group/tabs flex gap-2 data-[orientation=horizontal]:flex-col", e),
		...n
	});
}
var me = o("group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-[orientation=horizontal]/tabs:min-h-9 group-data-[orientation=horizontal]/tabs:flex-wrap group-data-[orientation=horizontal]/tabs:gap-1 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none", {
	variants: { variant: {
		default: "bg-muted",
		line: "gap-1 bg-transparent",
		underline: "w-full justify-start gap-6 overflow-x-auto rounded-none border-b bg-transparent p-0 group-data-[orientation=horizontal]/tabs:flex-nowrap group-data-[orientation=horizontal]/tabs:gap-6"
	} },
	defaultVariants: { variant: "default" }
});
function he({ className: e, variant: t = "default", ...n }) {
	return /* @__PURE__ */ (0, T.jsx)(le, {
		"data-slot": "tabs-list",
		"data-variant": t,
		className: i(me({ variant: t }), e),
		...n
	});
}
function ge({ className: e, ...t }) {
	return /* @__PURE__ */ (0, T.jsx)(de, {
		"data-slot": "tabs-trigger",
		className: i("group-data-[variant=underline]/tabs-list:min-h-0 group-data-[variant=underline]/tabs-list:-mb-px group-data-[variant=underline]/tabs-list:flex-none group-data-[variant=underline]/tabs-list:rounded-none group-data-[variant=underline]/tabs-list:border-0 group-data-[variant=underline]/tabs-list:border-b-2 group-data-[variant=underline]/tabs-list:border-transparent group-data-[variant=underline]/tabs-list:bg-transparent group-data-[variant=underline]/tabs-list:px-0 group-data-[variant=underline]/tabs-list:py-3 group-data-[variant=underline]/tabs-list:font-medium group-data-[variant=underline]/tabs-list:text-muted-foreground group-data-[variant=underline]/tabs-list:hover:text-foreground group-data-[variant=underline]/tabs-list:data-[state=active]:border-primary group-data-[variant=underline]/tabs-list:data-[state=active]:bg-transparent group-data-[variant=underline]/tabs-list:data-[state=active]:font-bold group-data-[variant=underline]/tabs-list:data-[state=active]:text-primary group-data-[variant=underline]/tabs-list:data-[state=active]:shadow-none group-data-[variant=underline]/tabs-list:after:hidden relative inline-flex min-h-8 flex-auto items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-semibold whitespace-nowrap text-foreground transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent", "group-data-[variant=default]/tabs-list:data-[state=active]:bg-primary group-data-[variant=default]/tabs-list:data-[state=active]:text-primary-foreground data-[state=active]:bg-background data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground", "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100", e),
		...t
	});
}
function _e({ className: e, ...t }) {
	return /* @__PURE__ */ (0, T.jsx)(pe, {
		"data-slot": "tabs-content",
		className: i("flex-1 outline-none", e),
		...t
	});
}
export { ge as i, _e as n, he as r, $ as t };
