import { h as e, n as t, p as n } from "./PmsContext-BVMd13Oi.js";
// src/hooks/usePrefs.ts
var r = /* @__PURE__ */ e(n(), 1);
function i() {
	let { prefs: e } = t(), [n, i] = (0, r.useState)(() => e.getPrefs());
	return (0, r.useEffect)(() => {
		let t = () => i(e.getPrefs());
		return window.addEventListener("pms:prefs", t), () => window.removeEventListener("pms:prefs", t);
	}, [e]), {
		prefs: n,
		setPrefs: (t) => e.setPrefs(t)
	};
}
export { i as t };
