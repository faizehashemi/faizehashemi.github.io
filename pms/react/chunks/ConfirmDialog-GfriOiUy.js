import { f as e, h as t, p as n } from "./PmsContext-BVMd13Oi.js";
import { a as r, i, n as a, o, r as s, t as c } from "./dialog-DtgtvZ4Q.js";
import { t as l } from "./button-BGWa3SLr.js";
// src/components/ConfirmDialog.tsx
var u = /* @__PURE__ */ t(n(), 1), d = e();
function f() {
	let [e, t] = (0, u.useState)(null), n = (e) => new Promise((n) => t({
		title: e.title,
		body: e.body ?? null,
		confirmLabel: e.confirmLabel ?? "OK",
		resolve: n
	})), f = (n) => {
		e?.resolve(n), t(null);
	};
	return {
		ask: n,
		dialog: /* @__PURE__ */ (0, d.jsx)(c, {
			open: !!e,
			onOpenChange: (e) => {
				e || f(!1);
			},
			children: /* @__PURE__ */ (0, d.jsxs)(a, {
				className: "max-w-[calc(100%-1rem)] sm:max-w-md",
				children: [/* @__PURE__ */ (0, d.jsxs)(r, { children: [/* @__PURE__ */ (0, d.jsx)(o, { children: e?.title }), /* @__PURE__ */ (0, d.jsx)(s, {
					asChild: !0,
					children: /* @__PURE__ */ (0, d.jsx)("div", {
						className: "whitespace-pre-wrap text-sm",
						children: e?.body
					})
				})] }), /* @__PURE__ */ (0, d.jsxs)(i, {
					className: "gap-2",
					children: [/* @__PURE__ */ (0, d.jsx)(l, {
						variant: "outline",
						onClick: () => f(!1),
						children: "Cancel"
					}), /* @__PURE__ */ (0, d.jsx)(l, {
						onClick: () => f(!0),
						children: e?.confirmLabel
					})]
				})]
			})
		})
	};
}
export { f as t };
