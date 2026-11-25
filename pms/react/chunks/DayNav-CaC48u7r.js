import { f as e, n as t } from "./PmsContext-BVMd13Oi.js";
import { t as n } from "./createLucideIcon-CQUC5AEZ.js";
import { t as r } from "./chevron-right-D69QZLEG.js";
import { t as i } from "./button-BGWa3SLr.js";
import { t as a } from "./input-DSBk_UeU.js";
// node_modules/lucide-react/dist/esm/icons/chevron-left.mjs
var o = {
	name: "chevron-left",
	size: 24,
	node: [["path", {
		d: "m15 18-6-6 6-6",
		key: "1wnfg3"
	}]]
};
o.node;
var s = n(o), c = e();
function l({ day: e, days: n, onChange: o }) {
	let l = t().transport, u = n.map((e) => e.day), d = [...u].reverse().find((t) => t < e), f = u.find((t) => t > e), p = n.find((t) => t.day === e), m = l.today();
	return /* @__PURE__ */ (0, c.jsxs)("div", {
		className: "flex flex-wrap items-center gap-2 rounded-xl border bg-card p-2",
		children: [
			/* @__PURE__ */ (0, c.jsx)(i, {
				variant: "outline",
				size: "icon",
				"aria-label": "Previous day",
				title: "Previous day",
				onClick: () => o(l.addDays(e, -1)),
				children: /* @__PURE__ */ (0, c.jsx)(s, { className: "size-4" })
			}),
			/* @__PURE__ */ (0, c.jsx)(a, {
				type: "date",
				className: "w-auto",
				value: e,
				"aria-label": "Day",
				onChange: (e) => e.target.value && o(e.target.value)
			}),
			/* @__PURE__ */ (0, c.jsx)(i, {
				variant: "outline",
				size: "icon",
				"aria-label": "Next day",
				title: "Next day",
				onClick: () => o(l.addDays(e, 1)),
				children: /* @__PURE__ */ (0, c.jsx)(r, { className: "size-4" })
			}),
			/* @__PURE__ */ (0, c.jsx)(i, {
				variant: "outline",
				disabled: e === m,
				onClick: () => o(m),
				children: "Today"
			}),
			/* @__PURE__ */ (0, c.jsx)("b", {
				className: "text-sm",
				children: l.longDate(e)
			}),
			/* @__PURE__ */ (0, c.jsx)("span", {
				className: "text-xs text-muted-foreground",
				children: p ? `${p.n} trips saved` : "no list saved for this day"
			}),
			/* @__PURE__ */ (0, c.jsxs)("span", {
				className: "ml-auto flex gap-3 text-xs",
				children: [d && /* @__PURE__ */ (0, c.jsxs)("button", {
					type: "button",
					className: "text-primary underline",
					onClick: () => o(d),
					children: ["← ", d]
				}), f && /* @__PURE__ */ (0, c.jsxs)("button", {
					type: "button",
					className: "text-primary underline",
					onClick: () => o(f),
					children: [f, " →"]
				})]
			})
		]
	});
}
var u = (e) => String(e ?? "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
export { u as n, l as t };
