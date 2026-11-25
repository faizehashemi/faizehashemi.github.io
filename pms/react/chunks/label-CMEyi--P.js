import { f as e, h as t, p as n } from "./PmsContext-BVMd13Oi.js";
import { t as r } from "./dist-BFKqrRa-.js";
import { t as i } from "./dist-BdqL8a-N.js";
// node_modules/@radix-ui/react-label/dist/index.mjs
var a = /* @__PURE__ */ t(n(), 1), o = e(), s = Object.defineProperty, c = /* @__PURE__ */ a.forwardRef(/* @__PURE__ */ ((e, t) => s(e, "name", {
	value: t,
	configurable: !0
}))(function(e, t) {
	return /* @__PURE__ */ (0, o.jsx)(r.label, {
		...e,
		ref: t,
		onMouseDown: (t) => {
			t.target.closest("button, input, select, textarea") || (e.onMouseDown?.(t), !t.defaultPrevented && t.detail > 1 && t.preventDefault());
		}
	});
}, "Label"));
// src/components/ui/label.tsx
function l({ className: e, ...t }) {
	return /* @__PURE__ */ (0, o.jsx)(c, {
		"data-slot": "label",
		className: i("flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", e),
		...t
	});
}
export { l as t };
