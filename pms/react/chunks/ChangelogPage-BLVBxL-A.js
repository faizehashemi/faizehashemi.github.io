import { a as e, f as t, h as n, p as r } from "./PmsContext-BVMd13Oi.js";
import { i, r as a, t as o } from "./tabs-IQDmk0rj.js";
import { t as s } from "./label-CMEyi--P.js";
import { n as c, t as l } from "./card-B9_OGomP.js";
import { t as u } from "./input-DSBk_UeU.js";
import { a as d, n as f, o as p, r as m, s as h, t as g } from "./table-DKR1WqRT.js";
import { t as _ } from "./badge-EB7Muw37.js";
// src/pages/changelog/ChangelogPage.tsx
var v = /* @__PURE__ */ n(r(), 1), y = t(), b = (e) => (/* @__PURE__ */ new Date(`${e}T12:00`)).toLocaleDateString(void 0, {
	day: "numeric",
	month: "short",
	year: "numeric"
}), x = (e) => (/* @__PURE__ */ new Date(`${e}T12:00`)).toLocaleDateString(void 0, {
	weekday: "short",
	day: "numeric",
	month: "short",
	year: "numeric"
}), S = (e) => (/* @__PURE__ */ new Date(`${e.slice(0, 7)}-15T12:00`)).toLocaleDateString(void 0, {
	month: "long",
	year: "numeric"
}), C = "https://github.com/faizehashemi/faizehashemi.github.io/commit/", w = ({ c: e }) => e.h ? /* @__PURE__ */ (0, y.jsxs)(y.Fragment, { children: [" ", /* @__PURE__ */ (0, y.jsx)("a", {
	className: "inline-block px-1 py-1 font-mono text-xs text-primary underline",
	href: C + e.h,
	target: "_blank",
	rel: "noopener",
	children: e.h
})] }) : null;
function T({ label: e, value: t, sub: n }) {
	return /* @__PURE__ */ (0, y.jsxs)("div", {
		className: "grid gap-0.5 rounded-xl border bg-card p-3",
		children: [
			/* @__PURE__ */ (0, y.jsx)("span", {
				className: "text-xs text-muted-foreground",
				children: e
			}),
			/* @__PURE__ */ (0, y.jsx)("b", {
				className: "text-2xl",
				children: t
			}),
			/* @__PURE__ */ (0, y.jsx)("small", {
				className: "text-xs text-muted-foreground",
				children: n
			})
		]
	});
}
function E() {
	let t = e(), [n, r] = (0, v.useState)(null), [C, E] = (0, v.useState)(!1), [D, O] = (0, v.useState)(""), [k, A] = (0, v.useState)("feature");
	(0, v.useEffect)(() => {
		t("views/changelog/data.js").then(r).catch(() => E(!0));
	}, []);
	let j = (0, v.useMemo)(() => {
		if (!n) return null;
		let { FEATURES: e, CHANGES: t } = n, r = D.trim().toLowerCase(), i = t.filter((t) => !r || t.m.toLowerCase().includes(r) || (e[t.f] || "").toLowerCase().includes(r)), a = [...new Set(t.map((e) => e.d))];
		return {
			rows: i,
			days: a,
			since: t.filter((e) => e.d >= "2026-09-27").length,
			features: new Set(t.map((e) => e.f)).size,
			lastCount: t.filter((e) => e.d === a[a.length - 1]).length
		};
	}, [n, D]);
	if (C) return /* @__PURE__ */ (0, y.jsx)("p", {
		className: "p-6 text-destructive",
		children: "Could not load the change log."
	});
	if (!n || !j) return /* @__PURE__ */ (0, y.jsx)("p", {
		className: "p-6 text-muted-foreground",
		children: "Loading…"
	});
	let { FEATURES: M, CHANGES: N, DEPLOYS: P } = n, { rows: F, days: I } = j, L;
	if (!F.length) L = /* @__PURE__ */ (0, y.jsx)(l, { children: /* @__PURE__ */ (0, y.jsx)(c, {
		className: "text-muted-foreground",
		children: "Nothing matches."
	}) });
	else if (k === "feature") {
		let e = [...new Set(F.map((e) => e.f))], t = (e) => F.filter((t) => t.f === e).at(-1).d;
		e.sort((e, n) => t(n).localeCompare(t(e)) || (M[e] || e).localeCompare(M[n] || n)), L = /* @__PURE__ */ (0, y.jsx)("div", {
			className: "grid gap-2",
			children: e.map((t) => {
				let n = F.filter((e) => e.f === t).reverse();
				return /* @__PURE__ */ (0, y.jsx)(l, {
					className: "py-0",
					children: /* @__PURE__ */ (0, y.jsxs)("details", {
						open: !!D.trim() || e.length <= 3,
						className: "group",
						children: [/* @__PURE__ */ (0, y.jsxs)("summary", {
							className: "flex cursor-pointer flex-wrap items-center gap-2 p-3",
							children: [
								/* @__PURE__ */ (0, y.jsx)("b", { children: M[t] || t }),
								/* @__PURE__ */ (0, y.jsx)(_, {
									variant: "secondary",
									children: n.length
								}),
								/* @__PURE__ */ (0, y.jsxs)("small", {
									className: "text-muted-foreground",
									children: [
										b(n[n.length - 1].d),
										" – ",
										b(n[0].d)
									]
								})
							]
						}), /* @__PURE__ */ (0, y.jsx)("ul", {
							className: "grid gap-1.5 border-t p-3 text-sm",
							children: n.map((e, t) => /* @__PURE__ */ (0, y.jsxs)("li", {
								className: "grid gap-x-3 sm:grid-cols-[7.5rem_1fr]",
								children: [/* @__PURE__ */ (0, y.jsx)("time", {
									className: "text-muted-foreground",
									children: b(e.d)
								}), /* @__PURE__ */ (0, y.jsxs)("span", {
									className: "min-w-0 break-words",
									children: [e.m, /* @__PURE__ */ (0, y.jsx)(w, { c: e })]
								})]
							}, t))
						})]
					})
				}, t);
			})
		});
	} else {
		let e = [...new Set(F.map((e) => e.d))].reverse(), t = "";
		L = /* @__PURE__ */ (0, y.jsx)(l, { children: /* @__PURE__ */ (0, y.jsx)(c, {
			className: "grid gap-3",
			children: e.map((e) => {
				let n = S(e), r = n === t ? null : /* @__PURE__ */ (0, y.jsx)("h2", {
					className: "mt-2 text-lg font-bold text-primary",
					children: n
				}, `m-${e}`);
				return t = n, /* @__PURE__ */ (0, y.jsxs)("div", {
					className: "grid gap-1.5",
					children: [
						r,
						/* @__PURE__ */ (0, y.jsx)("h3", {
							className: "font-bold",
							children: x(e)
						}),
						/* @__PURE__ */ (0, y.jsx)("ul", {
							className: "grid gap-1.5 text-sm",
							children: F.filter((t) => t.d === e).map((e, t) => /* @__PURE__ */ (0, y.jsxs)("li", {
								className: "flex flex-wrap items-start gap-2",
								children: [/* @__PURE__ */ (0, y.jsx)(_, {
									variant: "secondary",
									children: M[e.f] || e.f
								}), /* @__PURE__ */ (0, y.jsxs)("span", {
									className: "min-w-0 flex-1 break-words",
									children: [e.m, /* @__PURE__ */ (0, y.jsx)(w, { c: e })]
								})]
							}, t))
						})
					]
				}, e);
			})
		}) });
	}
	return /* @__PURE__ */ (0, y.jsxs)("div", {
		className: "mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4",
		children: [
			/* @__PURE__ */ (0, y.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, y.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, y.jsx)("h1", {
						className: "text-2xl font-bold text-primary",
						children: "Change log"
					}), /* @__PURE__ */ (0, y.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Every change deployed to the PMS since the first page, by feature or day by day."
					})]
				}), /* @__PURE__ */ (0, y.jsxs)("div", {
					className: "flex flex-wrap items-end gap-3",
					children: [/* @__PURE__ */ (0, y.jsxs)("div", {
						className: "grid gap-1",
						children: [/* @__PURE__ */ (0, y.jsx)(s, {
							htmlFor: "clQ",
							children: "Search"
						}), /* @__PURE__ */ (0, y.jsx)(u, {
							id: "clQ",
							type: "search",
							placeholder: "e.g. laundry, print, KG",
							autoComplete: "off",
							value: D,
							onChange: (e) => O(e.target.value)
						})]
					}), /* @__PURE__ */ (0, y.jsx)(o, {
						value: k,
						onValueChange: (e) => A(e),
						children: /* @__PURE__ */ (0, y.jsxs)(a, { children: [/* @__PURE__ */ (0, y.jsx)(i, {
							value: "feature",
							children: "By feature"
						}), /* @__PURE__ */ (0, y.jsx)(i, {
							value: "time",
							children: "Day by day"
						})] })
					})]
				})]
			}),
			/* @__PURE__ */ (0, y.jsxs)("section", {
				className: "grid grid-cols-2 gap-2 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, y.jsx)(T, {
						label: "Changes",
						value: N.length,
						sub: `${j.since} since the cloud PMS (27 Sep 2026)`
					}),
					/* @__PURE__ */ (0, y.jsx)(T, {
						label: "Deploy days",
						value: I.length,
						sub: `first ${b(I[0])}`
					}),
					/* @__PURE__ */ (0, y.jsx)(T, {
						label: "Features",
						value: j.features,
						sub: "areas of the PMS"
					}),
					/* @__PURE__ */ (0, y.jsx)(T, {
						label: "Latest",
						value: b(I[I.length - 1]),
						sub: `${j.lastCount} change(s) that day`
					})
				]
			}),
			L,
			/* @__PURE__ */ (0, y.jsx)(l, {
				className: "gap-2",
				children: /* @__PURE__ */ (0, y.jsxs)(c, {
					className: "grid gap-2",
					children: [
						/* @__PURE__ */ (0, y.jsx)("h2", {
							className: "text-base font-bold text-primary",
							children: "Latest Cloudflare deploys"
						}),
						/* @__PURE__ */ (0, y.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Site = pages and screens (pms-web) · API = server and database (pms-api). Cloudflare keeps only the last few; the list above is the full history."
						}),
						/* @__PURE__ */ (0, y.jsx)("div", {
							className: "overflow-x-auto",
							children: /* @__PURE__ */ (0, y.jsxs)(g, { children: [/* @__PURE__ */ (0, y.jsx)(p, { children: /* @__PURE__ */ (0, y.jsxs)(h, { children: [/* @__PURE__ */ (0, y.jsx)(d, { children: "When" }), /* @__PURE__ */ (0, y.jsx)(d, { children: "What" })] }) }), /* @__PURE__ */ (0, y.jsx)(f, { children: P.map((e, t) => /* @__PURE__ */ (0, y.jsxs)(h, { children: [/* @__PURE__ */ (0, y.jsx)(m, {
								className: "whitespace-nowrap",
								children: new Date(e.at).toLocaleString(void 0, {
									weekday: "short",
									day: "numeric",
									month: "short",
									year: "numeric",
									hour: "2-digit",
									minute: "2-digit"
								})
							}), /* @__PURE__ */ (0, y.jsx)(m, { children: e.w === "site" ? "Site (pages and screens)" : "API (server and database)" })] }, t)) })] })
						})
					]
				})
			})
		]
	});
}
export { E as default };
