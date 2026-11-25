import { h as e, i as t, p as n, r } from "./PmsContext-BVMd13Oi.js";
import { E as i } from "./query-DROYnevi.js";
import { t as a } from "./useQuery-BUXPY6q6.js";
// src/hooks/useSlips.ts
var o = /* @__PURE__ */ e(n(), 1);
function s(e = 12e4) {
	let n = r(), s = t(), c = i();
	return (0, o.useEffect)(() => {
		let e = (e) => {
			(e.detail?.changed ?? 0) > 0 && c.invalidateQueries({ queryKey: ["slips"] });
		};
		return window.addEventListener("pms:sync", e), () => window.removeEventListener("pms:sync", e);
	}, [c]), a({
		queryKey: ["slips", n.site?.id],
		queryFn: async () => (await s(n.all())).filter((e) => !e.deleted),
		refetchInterval: () => document.visibilityState === "visible" && e
	});
}
export { s as t };
