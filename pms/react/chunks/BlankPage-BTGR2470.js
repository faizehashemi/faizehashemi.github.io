import { f as e, n as t, s as n } from "./PmsContext-BVMd13Oi.js";
import { n as r, t as i } from "./card-B9_OGomP.js";
// src/pages/blank/BlankPage.tsx
var a = e();
function o() {
	let { cloud: e } = t(), { href: o } = n();
	return /* @__PURE__ */ (0, a.jsx)("div", {
		className: "mx-auto max-w-xl px-4 py-12",
		children: /* @__PURE__ */ (0, a.jsx)(i, {
			className: "text-center",
			children: /* @__PURE__ */ (0, a.jsxs)(r, {
				className: "grid gap-3 py-8",
				children: [
					/* @__PURE__ */ (0, a.jsx)("div", {
						className: "text-5xl",
						"aria-hidden": "true",
						children: "🔒"
					}),
					/* @__PURE__ */ (0, a.jsx)("h1", {
						className: "text-xl font-bold text-primary",
						children: "No pages are open for this login yet"
					}),
					/* @__PURE__ */ (0, a.jsxs)("p", { children: [
						"Logged in as ",
						e.currentDesk()?.name || "",
						"."
					] }),
					/* @__PURE__ */ (0, a.jsxs)("p", {
						className: "text-muted-foreground",
						children: [
							"Ask the admin to tick the pages you need (Setup → Page access). You can still change your password in",
							" ",
							/* @__PURE__ */ (0, a.jsx)("a", {
								className: "font-semibold text-primary underline",
								href: o("settings"),
								children: "Settings"
							}),
							"."
						]
					})
				]
			})
		})
	});
}
export { o as default };
