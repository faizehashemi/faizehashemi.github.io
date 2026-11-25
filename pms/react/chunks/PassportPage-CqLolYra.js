import { f as e, h as t, i as n, n as r, p as i, u as a } from "./PmsContext-BVMd13Oi.js";
import { E as o } from "./query-DROYnevi.js";
import { t as s } from "./useQuery-BUXPY6q6.js";
import { t as c } from "./label-CMEyi--P.js";
import { t as l } from "./printer-_t2PY0au.js";
import { t as u } from "./search-C_WlyVyV.js";
import { t as d } from "./button-BGWa3SLr.js";
import { n as f, t as p } from "./card-B9_OGomP.js";
import { t as m } from "./input-DSBk_UeU.js";
import { a as h, n as g, o as _, r as v, s as y, t as b } from "./table-DKR1WqRT.js";
import { t as x } from "./useSlips-DUKbzGma.js";
// src/pages/passport/passport.ts
var S = /* @__PURE__ */ t(i(), 1), C = (e) => String(e ?? "").replace(/[&<>"']/g, (e) => ({
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
})[e]), w = (e) => e ? e.split("-").reverse().join("/") : "—", T = (e) => [...new Set(["gents", "ladies"].flatMap((t) => (e.rooms?.[t] || []).map((e) => String(e.room_no || "").trim()).filter(Boolean)))], E = (e) => Number(e.total) || [
	"gents",
	"ladies",
	"children",
	"infants"
].reduce((t, n) => t + (Number(e[n]) || 0), 0);
function D(e, t, n) {
	let r = T(e), i = n.toLocaleString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	}), a = (e, t) => `<div><span>${C(e)}</span><b>${C(t || "—")}</b></div>`;
	return `<!doctype html><html><head><meta charset="utf-8"><title>Passport release — SH ${C(e.sh_no)}</title><style>
        @page { size: A5 landscape; margin: 8mm; }
        * { box-sizing: border-box; }
        html, body { margin: 0; background: #fff; color: #000; font-family: Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .slip { width: 100%; min-height: 130mm; border: 2px solid #000; border-radius: 3mm; padding: 6mm 8mm; display: flex; flex-direction: column; gap: 4mm; }
        .head { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #000; padding-bottom: 3mm; }
        .head h1 { margin: 0; font-size: 20pt; letter-spacing: .04em; }
        .head small { font-size: 9.5pt; color: #333; text-align: right; }
        .to { font-size: 12pt; }
        .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 3mm 6mm; }
        .grid div { border-bottom: 1px dotted #777; padding-bottom: 1.2mm; }
        .grid .w2 { grid-column: span 2; } .grid .w3 { grid-column: span 3; }
        .grid span { display: block; font-size: 8pt; letter-spacing: .1em; text-transform: uppercase; color: #444; }
        .grid b { font-size: 13pt; }
        .msg { border: 2px solid #000; border-radius: 2mm; padding: 4mm 5mm; font-size: 13pt; line-height: 1.45; text-align: center; font-weight: 700; }
        .sign { margin-top: auto; display: grid; grid-template-columns: 1fr 1fr; gap: 12mm; font-size: 9.5pt; }
        .sign div { border-top: 1.5px solid #000; padding-top: 1.5mm; text-align: center; }
        .bar { position: sticky; top: 0; display: flex; gap: 10px; align-items: center; padding: 10px 16px; background: #fffaf1; border-bottom: 1px solid #dcc7a4; font: 14px system-ui, sans-serif; z-index: 1; }
        .bar button { font: inherit; padding: 6px 14px; border: 1px solid #d4af37; border-radius: 8px; background: #d4af37; color: #fff; font-weight: 700; cursor: pointer; }
        @media screen { body { background: #e9e6df; } .slip { width: 210mm; margin: 10mm auto; background: #fff; box-shadow: 0 4px 16px rgba(0,0,0,.15); } }
        @media print { .bar { display: none; } }
    </style></head><body>
    <div class="bar"><button type="button" onclick="window.print()">Print</button><span>A5 landscape</span></div>
    <div class="slip">
        <div class="head"><h1>PASSPORT RELEASE SLIP</h1><small>${C(t)}<br>Printed ${C(i)}</small></div>
        <div class="to"><b>To: Reception</b></div>
        <div class="grid">
            ${a("SH No.", String(e.sh_no ?? ""))}${a("Pax", String(E(e) || ""))}${a("Building", String(e.building || ""))}
            <div class="w3"><span>Group</span><b>${C(e.tour_name || "—")}</b></div>
            <div class="w2"><span>Group leader</span><b>${C(String(e.group_leader || "").trim() || "—")}</b></div>
            ${a("Check-out", `${w(e.checkout_date)} ${e.checkout_time || ""}`.trim())}
            <div class="w3"><span>Rooms</span><b>${C(r.join(", ") || "—")}</b></div>
        </div>
        <div class="msg">Please hand over the passports of this group.<br>Their dues are cleared by Accounts.</div>
        <div class="sign"><div>Accounts — name &amp; signature</div><div>Reception — passports handed over (date &amp; signature)</div></div>
    </div>
    <script>window.addEventListener('load', function () { setTimeout(function () { window.focus(); window.print(); }, 250); });<\/script>
    </body></html>`;
}
function O(e, t) {
	let n = window.open("", "_blank");
	return n ? (n.document.open(), n.document.write(D(e, t, /* @__PURE__ */ new Date())), n.document.close(), !0) : !1;
}
// src/pages/passport/PassportPage.tsx
var k = e(), A = (e) => String(e ?? "").trim().toUpperCase().replace(/^S(?=\d)/, "");
function j() {
	let { stay: e, ums: t, cloud: i } = r(), C = n(), w = o(), { site: D, siteId: j } = a(), M = x(), [N, P] = (0, S.useState)(""), [F, I] = (0, S.useState)(""), [L, R] = (0, S.useState)(""), z = (0, S.useMemo)(() => {
		let e = A(F);
		return e ? (M.data ?? []).filter((n) => A(t.baseSh ? t.baseSh(n.sh_no) : n.sh_no) === e || A(n.sh_no) === e).sort((e, t) => String(t.checkin_date).localeCompare(String(e.checkin_date))) : [];
	}, [
		F,
		M.data,
		t
	]), B = () => {
		R(""), I(N);
	}, V = (e) => {
		let t = (M.data ?? []).find((t) => A(t.sh_no) === A(e.sh_no));
		U(t ?? {
			sh_no: e.sh_no,
			tour_name: e.tour,
			group_leader: e.leader,
			total: e.pax,
			building: e.building,
			rooms: { gents: String(e.rooms || "").split(",").map((e) => ({ room_no: e.trim() })).filter((e) => e.room_no) }
		});
	}, H = s({
		queryKey: ["passport-log", j],
		queryFn: async () => (await C(i.request("GET", `/api/passport-log?site=${j}`))).log ?? []
	}), U = (e) => {
		O(e, D.label) ? i.request("POST", "/api/passport-log", {
			site: j,
			sh_no: String(e.sh_no ?? ""),
			tour: e.tour_name || "",
			leader: String(e.group_leader || "").trim(),
			pax: E(e),
			building: e.building || "",
			rooms: T(e).join(", ")
		}).then(() => w.invalidateQueries({ queryKey: ["passport-log", j] }), () => R("The slip was printed but could not be entered in the log.")) : R("The browser blocked the new tab. Allow pop-ups for this site, then press the button again.");
	};
	return /* @__PURE__ */ (0, k.jsxs)("div", {
		className: "mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)] gap-3 px-3 pb-10 pt-4 sm:px-4",
		children: [
			/* @__PURE__ */ (0, k.jsxs)("header", { children: [/* @__PURE__ */ (0, k.jsx)("h1", {
				className: "text-2xl font-bold text-primary",
				children: "Passport slip"
			}), /* @__PURE__ */ (0, k.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Type a group's SH number, then print the slip that asks the reception to give the group its passports because the dues are cleared."
			})] }),
			/* @__PURE__ */ (0, k.jsxs)("form", {
				className: "flex flex-wrap items-end gap-2",
				onSubmit: (e) => {
					e.preventDefault(), B();
				},
				children: [/* @__PURE__ */ (0, k.jsxs)("div", {
					className: "grid gap-1",
					children: [/* @__PURE__ */ (0, k.jsx)(c, {
						htmlFor: "ppSh",
						children: "SH number"
					}), /* @__PURE__ */ (0, k.jsx)(m, {
						id: "ppSh",
						className: "w-48",
						inputMode: "numeric",
						autoComplete: "off",
						autoFocus: !0,
						placeholder: "e.g. 44434",
						value: N,
						onChange: (e) => P(e.target.value)
					})]
				}), /* @__PURE__ */ (0, k.jsxs)(d, {
					type: "submit",
					disabled: !N.trim(),
					children: [/* @__PURE__ */ (0, k.jsx)(u, { className: "size-4" }), "Find"]
				})]
			}),
			L && /* @__PURE__ */ (0, k.jsx)("div", {
				className: "rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive",
				children: L
			}),
			F && !M.isLoading && !z.length && /* @__PURE__ */ (0, k.jsxs)("p", {
				className: "text-muted-foreground",
				children: [
					"No slip with SH ",
					F,
					" at ",
					D.label,
					"."
				]
			}),
			z.map((t) => {
				let n = T(t);
				return /* @__PURE__ */ (0, k.jsx)(p, { children: /* @__PURE__ */ (0, k.jsxs)(f, {
					className: "grid gap-3",
					children: [/* @__PURE__ */ (0, k.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, k.jsxs)("div", { children: [/* @__PURE__ */ (0, k.jsxs)("h2", {
							className: "text-lg font-bold",
							children: [
								"SH ",
								t.sh_no,
								" ",
								/* @__PURE__ */ (0, k.jsxs)("span", {
									className: "font-normal text-muted-foreground",
									children: ["· ", t.tour_name || "—"]
								})
							]
						}), /* @__PURE__ */ (0, k.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: String(t.group_leader || "").trim() || "—"
						})] }), /* @__PURE__ */ (0, k.jsxs)(d, {
							onClick: () => U(t),
							children: [/* @__PURE__ */ (0, k.jsx)(l, { className: "size-4" }), "Print passport release slip"]
						})]
					}), /* @__PURE__ */ (0, k.jsxs)("div", {
						className: "grid grid-cols-2 gap-2 text-sm sm:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, k.jsxs)("div", { children: [/* @__PURE__ */ (0, k.jsx)("span", {
								className: "block text-xs text-muted-foreground",
								children: "Building"
							}), /* @__PURE__ */ (0, k.jsx)("b", { children: t.building || "—" })] }),
							/* @__PURE__ */ (0, k.jsxs)("div", { children: [/* @__PURE__ */ (0, k.jsx)("span", {
								className: "block text-xs text-muted-foreground",
								children: "Pax"
							}), /* @__PURE__ */ (0, k.jsx)("b", { children: E(t) || "—" })] }),
							/* @__PURE__ */ (0, k.jsxs)("div", { children: [/* @__PURE__ */ (0, k.jsx)("span", {
								className: "block text-xs text-muted-foreground",
								children: "Check-in"
							}), /* @__PURE__ */ (0, k.jsxs)("b", { children: [
								(t.checkin_date || "").split("-").reverse().join("/"),
								" ",
								t.checkin_time || ""
							] })] }),
							/* @__PURE__ */ (0, k.jsxs)("div", { children: [/* @__PURE__ */ (0, k.jsx)("span", {
								className: "block text-xs text-muted-foreground",
								children: "Check-out"
							}), /* @__PURE__ */ (0, k.jsxs)("b", { children: [
								(t.checkout_date || "").split("-").reverse().join("/"),
								" ",
								t.checkout_time || "",
								e.isDelayed?.(t) ? " (delayed)" : ""
							] })] }),
							/* @__PURE__ */ (0, k.jsxs)("div", {
								className: "col-span-2 sm:col-span-4",
								children: [/* @__PURE__ */ (0, k.jsx)("span", {
									className: "block text-xs text-muted-foreground",
									children: "Rooms"
								}), /* @__PURE__ */ (0, k.jsx)("b", { children: n.join(", ") || "—" })]
							})
						]
					})]
				}) }, t.id);
			}),
			/* @__PURE__ */ (0, k.jsx)(p, { children: /* @__PURE__ */ (0, k.jsxs)(f, {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, k.jsxs)("h2", {
					className: "text-base font-bold text-primary",
					children: ["Passport slips issued ", /* @__PURE__ */ (0, k.jsxs)("span", {
						className: "text-sm font-normal text-muted-foreground",
						children: [
							"— ",
							D.label,
							", newest first"
						]
					})]
				}), H.isLoading ? /* @__PURE__ */ (0, k.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Loading…"
				}) : (H.data ?? []).length ? /* @__PURE__ */ (0, k.jsx)("div", {
					className: "max-h-[50vh] overflow-auto",
					children: /* @__PURE__ */ (0, k.jsxs)(b, { children: [/* @__PURE__ */ (0, k.jsx)(_, { children: /* @__PURE__ */ (0, k.jsxs)(y, { children: [
						/* @__PURE__ */ (0, k.jsx)(h, { children: "When" }),
						/* @__PURE__ */ (0, k.jsx)(h, { children: "SH" }),
						/* @__PURE__ */ (0, k.jsx)(h, { children: "Group · leader" }),
						/* @__PURE__ */ (0, k.jsx)(h, {
							className: "text-right",
							children: "Pax"
						}),
						/* @__PURE__ */ (0, k.jsx)(h, { children: "Building · rooms" }),
						/* @__PURE__ */ (0, k.jsx)(h, { children: "Issued by" }),
						/* @__PURE__ */ (0, k.jsx)(h, {})
					] }) }), /* @__PURE__ */ (0, k.jsx)(g, { children: (H.data ?? []).map((e) => /* @__PURE__ */ (0, k.jsxs)(y, { children: [
						/* @__PURE__ */ (0, k.jsx)(v, {
							className: "whitespace-nowrap",
							children: new Date(e.at).toLocaleString(void 0, {
								day: "2-digit",
								month: "short",
								hour: "2-digit",
								minute: "2-digit"
							})
						}),
						/* @__PURE__ */ (0, k.jsx)(v, { children: /* @__PURE__ */ (0, k.jsx)("b", { children: e.sh_no }) }),
						/* @__PURE__ */ (0, k.jsxs)(v, { children: [e.tour || "—", /* @__PURE__ */ (0, k.jsx)("small", {
							className: "block text-muted-foreground",
							children: e.leader || "—"
						})] }),
						/* @__PURE__ */ (0, k.jsx)(v, {
							className: "text-right",
							children: e.pax || "—"
						}),
						/* @__PURE__ */ (0, k.jsxs)(v, { children: [e.building || "—", e.rooms && /* @__PURE__ */ (0, k.jsx)("small", {
							className: "block text-muted-foreground",
							children: e.rooms
						})] }),
						/* @__PURE__ */ (0, k.jsx)(v, { children: e.desk }),
						/* @__PURE__ */ (0, k.jsx)(v, { children: /* @__PURE__ */ (0, k.jsxs)(d, {
							size: "sm",
							variant: "outline",
							title: "Print this slip again (it is entered in the log again)",
							onClick: () => V(e),
							children: [/* @__PURE__ */ (0, k.jsx)(l, { className: "size-3.5" }), "Print again"]
						}) })
					] }, e.id)) })] })
				}) : /* @__PURE__ */ (0, k.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No passport slip has been printed yet."
				})]
			}) })
		]
	});
}
export { j as default };
