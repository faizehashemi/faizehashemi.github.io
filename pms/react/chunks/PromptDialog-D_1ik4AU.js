import { f as e, h as t, p as n } from "./PmsContext-BVMd13Oi.js";
import { a as r, i, n as a, o, r as s, t as c } from "./dialog-DtgtvZ4Q.js";
import { t as l } from "./button-BGWa3SLr.js";
import { t as u } from "./input-DSBk_UeU.js";
// src/components/PromptDialog.tsx
var d = /* @__PURE__ */ t(n(), 1), f = e();
function p() {
	let [e, t] = (0, d.useState)(null), [n, p] = (0, d.useState)(""), m = (e) => new Promise((n) => {
		p(e.value ?? ""), t({
			title: e.title,
			body: e.body ?? null,
			value: e.value ?? "",
			type: e.type ?? "text",
			resolve: n
		});
	}), h = (n) => {
		e?.resolve(n), t(null);
	};
	return {
		ask: m,
		dialog: /* @__PURE__ */ (0, f.jsx)(c, {
			open: !!e,
			onOpenChange: (e) => {
				e || h(null);
			},
			children: /* @__PURE__ */ (0, f.jsx)(a, {
				className: "max-w-[calc(100%-1rem)] sm:max-w-sm",
				children: /* @__PURE__ */ (0, f.jsxs)("form", {
					onSubmit: (e) => {
						e.preventDefault(), h(n);
					},
					className: "grid gap-4",
					children: [
						/* @__PURE__ */ (0, f.jsxs)(r, { children: [/* @__PURE__ */ (0, f.jsx)(o, { children: e?.title }), /* @__PURE__ */ (0, f.jsx)(s, {
							asChild: !0,
							children: /* @__PURE__ */ (0, f.jsx)("div", {
								className: "whitespace-pre-wrap text-sm",
								children: e?.body
							})
						})] }),
						/* @__PURE__ */ (0, f.jsx)(u, {
							autoFocus: !0,
							type: e?.type ?? "text",
							inputMode: e?.type === "number" ? "numeric" : void 0,
							value: n,
							onChange: (e) => p(e.target.value)
						}),
						/* @__PURE__ */ (0, f.jsxs)(i, {
							className: "gap-2",
							children: [/* @__PURE__ */ (0, f.jsx)(l, {
								type: "button",
								variant: "outline",
								onClick: () => h(null),
								children: "Cancel"
							}), /* @__PURE__ */ (0, f.jsx)(l, {
								type: "submit",
								children: "OK"
							})]
						})
					]
				})
			})
		})
	};
}
export { p as t };
