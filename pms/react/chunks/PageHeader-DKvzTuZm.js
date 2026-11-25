import { a as e, f as t, h as n, p as r } from "./PmsContext-BVMd13Oi.js";
import { t as i } from "./chevron-right-D69QZLEG.js";
// src/components/PageHeader.tsx
var a = /* @__PURE__ */ n(r(), 1), o = t(), s = null;
function c({ view: t, parent: n, title: r, current: c, children: l }) {
	let u = e(), [d, f] = (0, a.useState)(() => n ?? (s?.find((e) => e.views.includes(t))?.label || ""));
	(0, a.useEffect)(() => {
		n === void 0 ? s ? f(s.find((e) => e.views.includes(t))?.label || "") : u("config.js").then((e) => {
			s = e.NAV, f(s.find((e) => e.views.includes(t))?.label || "");
		}).catch(() => {}) : f(n);
	}, [t, n]);
	let p = [
		d,
		r,
		c
	].filter(Boolean);
	return /* @__PURE__ */ (0, o.jsxs)("header", {
		className: "grid gap-1",
		children: [/* @__PURE__ */ (0, o.jsx)("nav", {
			"aria-label": "Breadcrumb",
			className: "flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground",
			children: p.map((e, t) => /* @__PURE__ */ (0, o.jsxs)(a.Fragment, { children: [t > 0 && /* @__PURE__ */ (0, o.jsx)(i, {
				className: "size-3",
				"aria-hidden": "true"
			}), /* @__PURE__ */ (0, o.jsx)("span", {
				className: t === p.length - 1 ? "font-medium text-foreground" : "",
				"aria-current": t === p.length - 1 ? "page" : void 0,
				children: e
			})] }, t))
		}), /* @__PURE__ */ (0, o.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, o.jsx)("h1", {
				className: "text-2xl font-bold text-foreground",
				children: r
			}), l]
		})]
	});
}
export { c as t };
