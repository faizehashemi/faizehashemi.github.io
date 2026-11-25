import { h as e, p as t } from "./PmsContext-BVMd13Oi.js";
import { r as n } from "./dist-DPAKuE1t.js";
// node_modules/@radix-ui/react-id/dist/index.mjs
var r = /* @__PURE__ */ e(t(), 1), i = Object.defineProperty, a = (e, t) => i(e, "name", {
	value: t,
	configurable: !0
}), o = r.useId || (() => void 0), s = 0;
function c(e) {
	let [t, i] = r.useState(o());
	return n(() => {
		e || i((e) => e ?? String(s++));
	}, [e]), e || (t ? `radix-${t}` : "");
}
a(c, "useId");
// node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs
var l = Object.defineProperty, u = (e, t) => l(e, "name", {
	value: t,
	configurable: !0
}), d = r.useInsertionEffect;
function f(e) {
	let t = r.useRef(e);
	return typeof d == "function" ? d(() => {
		t.current = e;
	}) : n(() => {
		t.current = e;
	}), r.useMemo(() => ((...e) => t.current?.(...e)), []);
}
u(f, "useCallbackRef");
export { c as n, f as t };
