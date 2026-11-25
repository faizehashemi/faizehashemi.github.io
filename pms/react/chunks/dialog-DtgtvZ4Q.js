import { f as e, h as t, p as n } from "./PmsContext-BVMd13Oi.js";
import { t as r } from "./dist-BFKqrRa-.js";
import { a as i, c as a, i as o, l as s, n as c, o as l, r as u, s as d, t as f, u as p } from "./es2015-Y_MGFf27.js";
import { t as m } from "./dist-BdqL8a-N.js";
import { i as h, o as g } from "./dist-BQlDVxi3.js";
import { i as _, n as v, r as y, t as b } from "./dist-DPAKuE1t.js";
import { t as x } from "./dist-C9AF_ym5.js";
import { n as S } from "./dist-CqlFeEAx.js";
import { t as C } from "./x-Dis6Osjy.js";
import { t as w } from "./button-BGWa3SLr.js";
// node_modules/@radix-ui/react-dialog/dist/index.mjs
var T = /* @__PURE__ */ t(n(), 1), E = e(), D = Object.defineProperty, O = (e, t) => D(e, "name", {
	value: t,
	configurable: !0
}), k = "Dialog", [A, ee] = _(k), [j, M] = A(k), N = /* @__PURE__ */ O((e) => {
	let { __scopeDialog: t, children: n, open: r, defaultOpen: i, onOpenChange: a, modal: o = !0 } = e, s = T.useRef(null), c = T.useRef(null), { nodes: l, registry: u } = d(), [f, p] = b({
		prop: r,
		defaultProp: i ?? !1,
		onChange: a,
		caller: k
	}), [m, h] = T.useState(0), [g, _] = T.useState(0);
	return /* @__PURE__ */ (0, E.jsx)(j, {
		scope: t,
		triggerRef: s,
		contentRef: c,
		contentId: S(),
		titleId: S(),
		descriptionId: S(),
		titlePresent: m > 0,
		descriptionPresent: g > 0,
		setTitleCount: h,
		setDescriptionCount: _,
		open: f,
		onOpenChange: p,
		onOpenToggle: T.useCallback(() => p((e) => !e), [p]),
		modal: o,
		branchNodes: l,
		branchRegistry: u,
		children: n
	});
}, "Dialog"), P = "DialogPortal", [F, I] = A(P, { forceMount: void 0 }), L = /* @__PURE__ */ O((e) => {
	let { __scopeDialog: t, forceMount: n, children: r, container: i } = e, a = M(P, t);
	return /* @__PURE__ */ (0, E.jsx)(F, {
		scope: t,
		forceMount: n,
		children: T.Children.map(r, (e) => /* @__PURE__ */ (0, E.jsx)(x, {
			present: n || a.open,
			children: /* @__PURE__ */ (0, E.jsx)(o, {
				asChild: !0,
				container: i,
				children: e
			})
		}))
	});
}, "DialogPortal"), R = "DialogOverlay", z = /* @__PURE__ */ T.forwardRef(/* @__PURE__ */ O(function(e, t) {
	let n = I(R, e.__scopeDialog), { forceMount: r = n.forceMount, ...i } = e, a = M(R, e.__scopeDialog);
	return a.modal ? /* @__PURE__ */ (0, E.jsx)(x, {
		present: r || a.open,
		children: /* @__PURE__ */ (0, E.jsx)(V, {
			...i,
			ref: t
		})
	}) : null;
}, "DialogOverlay")), B = h("DialogOverlay.RemoveScroll"), V = /* @__PURE__ */ T.forwardRef(/* @__PURE__ */ O(function(e, t) {
	let { __scopeDialog: n, ...i } = e, a = M(R, n), o = s(), l = g(t, o);
	return /* @__PURE__ */ (0, E.jsx)(c, {
		as: B,
		allowPinchZoom: !0,
		shards: T.useMemo(() => [a.contentRef, ...a.branchNodes.map((e) => ({ current: e }))], [a.contentRef, a.branchNodes]),
		children: /* @__PURE__ */ (0, E.jsx)(r.div, {
			"data-state": Q(a.open),
			...i,
			ref: l,
			style: {
				pointerEvents: "auto",
				...i.style
			}
		})
	});
}, "DialogOverlayImpl")), H = "DialogContent", U = /* @__PURE__ */ T.forwardRef(/* @__PURE__ */ O(function(e, t) {
	let n = I(H, e.__scopeDialog), { forceMount: r = n.forceMount, ...i } = e, a = M(H, e.__scopeDialog);
	return /* @__PURE__ */ (0, E.jsx)(x, {
		present: r || a.open,
		children: a.modal ? /* @__PURE__ */ (0, E.jsx)(W, {
			...i,
			ref: t
		}) : /* @__PURE__ */ (0, E.jsx)(G, {
			...i,
			ref: t
		})
	});
}, "DialogContent")), W = /* @__PURE__ */ T.forwardRef(/* @__PURE__ */ O(function(e, t) {
	let n = M(H, e.__scopeDialog), r = T.useRef(null), i = g(t, n.contentRef, r);
	return T.useEffect(() => {
		let e = r.current;
		if (e) return f(e);
	}, []), /* @__PURE__ */ (0, E.jsx)(K, {
		...e,
		ref: i,
		trapFocus: n.open,
		disableOutsidePointerEvents: n.open,
		onCloseAutoFocus: v(e.onCloseAutoFocus, (e) => {
			e.preventDefault(), n.triggerRef.current?.focus();
		}),
		onPointerDownOutside: v(e.onPointerDownOutside, (e) => {
			let t = e.detail.originalEvent, n = t.button === 0 && t.ctrlKey === !0;
			(t.button === 2 || n) && e.preventDefault();
		}),
		onFocusOutside: v(e.onFocusOutside, (e) => e.preventDefault())
	});
}, "DialogContentModal")), G = /* @__PURE__ */ T.forwardRef(/* @__PURE__ */ O(function(e, t) {
	let n = M(H, e.__scopeDialog), r = T.useRef(!1), i = T.useRef(!1);
	return /* @__PURE__ */ (0, E.jsx)(K, {
		...e,
		ref: t,
		trapFocus: !1,
		disableOutsidePointerEvents: !1,
		onCloseAutoFocus: (t) => {
			e.onCloseAutoFocus?.(t), t.defaultPrevented || (r.current || n.triggerRef.current?.focus(), t.preventDefault()), r.current = !1, i.current = !1;
		},
		onInteractOutside: (t) => {
			e.onInteractOutside?.(t), t.defaultPrevented || (r.current = !0, t.detail.originalEvent.type === "pointerdown" && (i.current = !0));
			let a = t.target;
			n.triggerRef.current?.contains(a) && t.preventDefault(), t.detail.originalEvent.type === "focusin" && i.current && t.preventDefault();
		}
	});
}, "DialogContentNonModal")), K = /* @__PURE__ */ T.forwardRef(/* @__PURE__ */ O(function(e, t) {
	let { __scopeDialog: n, trapFocus: r, onOpenAutoFocus: o, onCloseAutoFocus: s, "aria-describedby": c, children: d, ...f } = e, p = M(H, n);
	return u(), /* @__PURE__ */ (0, E.jsx)(l, {
		registry: p.branchRegistry,
		children: /* @__PURE__ */ (0, E.jsx)(i, {
			asChild: !0,
			loop: !0,
			trapped: r,
			branches: p.branchNodes,
			onMountAutoFocus: o,
			onUnmountAutoFocus: s,
			children: /* @__PURE__ */ (0, E.jsx)(a, {
				role: "dialog",
				id: p.contentId,
				"aria-labelledby": p.titlePresent ? p.titleId : void 0,
				"aria-describedby": p.descriptionPresent ? Z(c, p.descriptionId) : c,
				"data-state": Q(p.open),
				...f,
				ref: t,
				deferPointerDownOutside: !0,
				onDismiss: () => p.onOpenChange(!1),
				children: d
			})
		})
	});
}, "DialogContentImpl")), q = /* @__PURE__ */ T.forwardRef(/* @__PURE__ */ O(function(e, t) {
	let { __scopeDialog: n, ...i } = e, a = M("DialogTitle", n), { setTitleCount: o } = a;
	return y(() => (o((e) => e + 1), () => o((e) => e - 1)), [o]), /* @__PURE__ */ (0, E.jsx)(r.h2, {
		id: a.titleId,
		...i,
		ref: t
	});
}, "DialogTitle")), J = /* @__PURE__ */ T.forwardRef(/* @__PURE__ */ O(function(e, t) {
	let { __scopeDialog: n, ...i } = e, a = M("DialogDescription", n), { setDescriptionCount: o } = a;
	return y(() => (o((e) => e + 1), () => o((e) => e - 1)), [o]), /* @__PURE__ */ (0, E.jsx)(r.p, {
		id: a.descriptionId,
		...i,
		ref: t
	});
}, "DialogDescription")), Y = "DialogClose", X = /* @__PURE__ */ T.forwardRef(/* @__PURE__ */ O(function(e, t) {
	let { __scopeDialog: n, ...i } = e, a = M(Y, n);
	return /* @__PURE__ */ (0, E.jsx)(r.button, {
		type: "button",
		...i,
		ref: t,
		onClick: v(e.onClick, () => a.onOpenChange(!1))
	});
}, "DialogClose"));
function Z(...e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of e) if (typeof n == "string") for (let e of String(n).trim().split(/\s+/)) e && t.add(e);
	return t.size > 0 ? Array.from(t).join(" ") : void 0;
}
O(Z, "concatAriaDescribedby");
function Q(e) {
	return e ? "open" : "closed";
}
O(Q, "getState");
// src/components/ui/dialog.tsx
function $({ ...e }) {
	return /* @__PURE__ */ (0, E.jsx)(N, {
		"data-slot": "dialog",
		...e
	});
}
function te({ ...e }) {
	return /* @__PURE__ */ (0, E.jsx)(L, {
		container: p(),
		"data-slot": "dialog-portal",
		...e
	});
}
function ne({ className: e, ...t }) {
	return /* @__PURE__ */ (0, E.jsx)(z, {
		"data-slot": "dialog-overlay",
		className: m("fixed inset-0 z-[1100] bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", e),
		...t
	});
}
function re({ className: e, children: t, showCloseButton: n = !0, ...r }) {
	return /* @__PURE__ */ (0, E.jsxs)(te, {
		"data-slot": "dialog-portal",
		children: [/* @__PURE__ */ (0, E.jsx)(ne, {}), /* @__PURE__ */ (0, E.jsxs)(U, {
			"data-slot": "dialog-content",
			className: m("fixed top-[50%] left-[50%] z-[1100] grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-lg", e),
			...r,
			children: [t, n && /* @__PURE__ */ (0, E.jsxs)(X, {
				"data-slot": "dialog-close",
				className: "absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				children: [/* @__PURE__ */ (0, E.jsx)(C, {}), /* @__PURE__ */ (0, E.jsx)("span", {
					className: "sr-only",
					children: "Close"
				})]
			})]
		})]
	});
}
function ie({ className: e, ...t }) {
	return /* @__PURE__ */ (0, E.jsx)("div", {
		"data-slot": "dialog-header",
		className: m("flex flex-col gap-2 text-center sm:text-left", e),
		...t
	});
}
function ae({ className: e, showCloseButton: t = !1, children: n, ...r }) {
	return /* @__PURE__ */ (0, E.jsxs)("div", {
		"data-slot": "dialog-footer",
		className: m("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", e),
		...r,
		children: [n, t && /* @__PURE__ */ (0, E.jsx)(X, {
			asChild: !0,
			children: /* @__PURE__ */ (0, E.jsx)(w, {
				variant: "outline",
				children: "Close"
			})
		})]
	});
}
function oe({ className: e, ...t }) {
	return /* @__PURE__ */ (0, E.jsx)(q, {
		"data-slot": "dialog-title",
		className: m("text-lg leading-none font-semibold", e),
		...t
	});
}
function se({ className: e, ...t }) {
	return /* @__PURE__ */ (0, E.jsx)(J, {
		"data-slot": "dialog-description",
		className: m("text-sm text-muted-foreground", e),
		...t
	});
}
export { ie as a, ae as i, re as n, oe as o, se as r, $ as t };
