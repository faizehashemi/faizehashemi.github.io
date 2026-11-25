import { f as e, h as t, p as n } from "./PmsContext-BVMd13Oi.js";
import { t as r } from "./dist-BFKqrRa-.js";
import { t as i } from "./dist-BdqL8a-N.js";
import { o as a } from "./dist-BQlDVxi3.js";
import { i as o, n as s, t as c } from "./dist-DPAKuE1t.js";
import { t as l } from "./dist-BPbXv5K2.js";
// node_modules/@radix-ui/react-switch/dist/index.mjs
var u = /* @__PURE__ */ t(n(), 1), d = e(), f = Object.defineProperty, p = (e, t) => f(e, "name", {
	value: t,
	configurable: !0
}), m = "Switch", [h, g] = o(m), [_, v] = h(m);
function y(e) {
	let { __scopeSwitch: t, checked: n, children: r, defaultChecked: i, disabled: a, form: o, name: s, onCheckedChange: l, required: f, value: p = "on", internal_do_not_use_render: h } = e, [g, v] = c({
		prop: n,
		defaultProp: i ?? !1,
		onChange: l,
		caller: m
	}), [y, b] = u.useState(null), [x, S] = u.useState(null), [C, w] = u.useState(null), T = {
		checked: g,
		setChecked: v,
		disabled: a,
		control: y,
		setControl: b,
		name: s,
		form: o,
		value: p,
		userClick: C,
		onUserClick: w,
		required: f,
		defaultChecked: i,
		isFormControl: !y || !!o || !!y.closest("form"),
		bubbleInput: x,
		setBubbleInput: S
	};
	return /* @__PURE__ */ (0, d.jsx)(_, {
		scope: t,
		...T,
		children: D(h) ? h(T) : r
	});
}
p(y, "SwitchProvider");
var b = "SwitchTrigger", x = /* @__PURE__ */ u.forwardRef(/* @__PURE__ */ p(function({ __scopeSwitch: e, onClick: t, ...n }, i) {
	let { control: o, form: c, value: l, disabled: f, checked: m, required: h, setControl: g, setChecked: _, onUserClick: y, isFormControl: x, bubbleInput: S } = v(b, e), C = a(i, g), w = u.useRef(m);
	return u.useEffect(() => {
		let e = c ? o?.ownerDocument.getElementById(c) : o?.form;
		if (e instanceof HTMLFormElement) {
			let t = /* @__PURE__ */ p(() => _(w.current), "reset");
			return e.addEventListener("reset", t), () => e.removeEventListener("reset", t);
		}
	}, [
		o,
		c,
		_
	]), /* @__PURE__ */ (0, d.jsx)(r.button, {
		type: "button",
		role: "switch",
		"aria-checked": m,
		"aria-required": h,
		"data-state": O(m),
		"data-disabled": f ? "" : void 0,
		disabled: f,
		value: l,
		...n,
		ref: C,
		onClick: s(t, (e) => {
			let t = e.isPropagationStopped();
			y({
				requestedChecked: !m,
				hasConsumerStoppedPropagation: t
			}), _((e) => !e), S && x && (t || e.stopPropagation());
		})
	});
}, "SwitchTrigger")), S = /* @__PURE__ */ u.forwardRef(/* @__PURE__ */ p(function(e, t) {
	let { __scopeSwitch: n, name: r, checked: i, defaultChecked: a, required: o, disabled: s, value: c, onCheckedChange: l, form: u, ...f } = e;
	return /* @__PURE__ */ (0, d.jsx)(y, {
		__scopeSwitch: n,
		checked: i,
		defaultChecked: a,
		disabled: s,
		required: o,
		onCheckedChange: l,
		name: r,
		form: u,
		value: c,
		internal_do_not_use_render: ({ isFormControl: e }) => /* @__PURE__ */ (0, d.jsxs)(d.Fragment, { children: [/* @__PURE__ */ (0, d.jsx)(x, {
			...f,
			ref: t,
			__scopeSwitch: n
		}), e && /* @__PURE__ */ (0, d.jsx)(E, { __scopeSwitch: n })] })
	});
}, "Switch")), C = "SwitchThumb", w = /* @__PURE__ */ u.forwardRef(/* @__PURE__ */ p(function(e, t) {
	let { __scopeSwitch: n, ...i } = e, a = v(C, n);
	return /* @__PURE__ */ (0, d.jsx)(r.span, {
		"data-state": O(a.checked),
		"data-disabled": a.disabled ? "" : void 0,
		...i,
		ref: t
	});
}, "SwitchThumb")), T = "SwitchBubbleInput", E = /* @__PURE__ */ u.forwardRef(/* @__PURE__ */ p(function({ __scopeSwitch: e, onClick: t, ...n }, i) {
	let { control: o, userClick: c, checked: f, defaultChecked: p, required: m, disabled: h, name: g, value: _, form: y, bubbleInput: b, setBubbleInput: x } = v(T, e), S = a(i, x), C = l(o), w = u.useRef(!1), E = u.useRef(f), D = u.useRef(c), O = u.useRef(null);
	u.useEffect(() => {
		let e = b;
		if (!e) return;
		let t = window.HTMLInputElement.prototype, n = Object.getOwnPropertyDescriptor(t, "checked").set;
		if (!n) return;
		let r = E.current !== f;
		E.current = f;
		let i = c !== null && c !== D.current;
		if (D.current = c, i) O.current = r ? null : c, r && n.call(e, f), e.dispatchEvent(new Event("click", { bubbles: !c.hasConsumerStoppedPropagation }));
		else if (r) {
			let t = O.current;
			O.current = null;
			let r = t?.requestedChecked === f;
			w.current = !0, n.call(e, f), e.dispatchEvent(new Event("click", { bubbles: !(r && t.hasConsumerStoppedPropagation) })), w.current = !1;
		}
	}, [
		b,
		f,
		c
	]);
	let k = u.useRef(f);
	return /* @__PURE__ */ (0, d.jsx)(r.input, {
		type: "checkbox",
		"aria-hidden": !0,
		defaultChecked: p ?? k.current,
		required: m,
		disabled: h,
		name: g,
		value: _,
		form: y,
		...n,
		tabIndex: -1,
		ref: S,
		onClick: s(t, (e) => {
			w.current && e.stopPropagation();
		}),
		style: {
			...n.style,
			...C,
			position: "absolute",
			pointerEvents: "none",
			opacity: 0,
			margin: 0,
			transform: "translateX(-100%)"
		}
	});
}, "SwitchBubbleInput"));
function D(e) {
	return typeof e == "function";
}
p(D, "isFunction");
function O(e) {
	return e ? "checked" : "unchecked";
}
p(O, "getState");
// src/components/ui/switch.tsx
function k({ className: e, size: t = "default", ...n }) {
	return /* @__PURE__ */ (0, d.jsx)(S, {
		"data-slot": "switch",
		"data-size": t,
		className: i("peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80", e),
		...n,
		children: /* @__PURE__ */ (0, d.jsx)(w, {
			"data-slot": "switch-thumb",
			className: i("pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground")
		})
	});
}
export { k as t };
