import { a as e, f as t, h as n, i as r, n as i, o as a, p as o, u as s } from "./PmsContext-BVMd13Oi.js";
import { t as ee } from "./PageHeader-DKvzTuZm.js";
// src/pages/laundry/pos.css?raw
var c = /* @__PURE__ */ n(o(), 1), te = "/* Laundry POS — big, picture-first, thumb-friendly (phones and tablets first) */\n:root {\n    --bg: #f5efe3; --panel: #fffaf1; --ink: #22170d; --muted: #3d3226; --gold: #d4af37; --gold-deep: #9a7414; --edge: #e3d2b1;\n    --ok: #1f8a4c; --ok-bg: #e3f4ea; --bad: #b3261e; --free: #6d3fc0; --free-bg: #efe7fb;\n}\n* { box-sizing: border-box; }\nbody { margin: 0; background: var(--bg); color: var(--ink); font: 16px/1.4 system-ui, -apple-system, \"Segoe UI\", Roboto, Arial, sans-serif; }\nbutton { font: inherit; color: inherit; cursor: pointer; }\n.ld { max-width: 1100px; margin: 0 auto; padding: 10px 10px 120px; }\n\n/* tabs: icon + short word */\n.ld-head { padding: 4px 2px 0; }\n.ld-tabs { display: flex; gap: 22px; position: sticky; top: 52px; z-index: 5; background: var(--bg); padding: 0; border-bottom: 1px solid var(--edge); overflow-x: auto; }\n.ld-tabs button { display: inline-flex; align-items: center; gap: 8px; padding: 14px 2px; border: 0; border-bottom: 3px solid transparent; border-radius: 0; background: transparent; font-size: 16px; font-weight: 600; color: #3d3226; white-space: nowrap; position: relative; }\n.ld-tabs button span { font-size: 22px; line-height: 1; }\n.ld-tabs button[aria-selected=\"true\"] { border-bottom-color: var(--gold-deep); color: var(--gold-deep); font-weight: 800; background: transparent; }\n.ld-count { position: absolute; top: 2px; right: 6px; min-width: 20px; padding: 0 5px; border-radius: 999px; background: var(--bad); color: #fff; font-size: 12px; line-height: 20px; }\n.ld-count:empty { display: none; }\n\n.ld-info { display: flex; gap: 10px; align-items: flex-start; margin: 6px 0; padding: 8px 12px; border-radius: 12px; background: #fff4de; color: #6b4a00; font-size: 13px; }\n.ld-info > span { font-size: 22px; }\n.ld-offline { margin: 6px 0; padding: 8px 12px; border-radius: 12px; background: #fde7e7; color: var(--bad); font-weight: 700; }\n\n/* who */\n.ld-who { display: grid; grid-template-columns: 1fr 1.4fr; gap: 8px; margin: 8px 0; }\n.ld-big-in { display: flex; align-items: center; gap: 8px; background: #fff; border: 2px solid var(--edge); border-radius: 14px; padding: 4px 10px; }\n.ld-big-in:focus-within { border-color: var(--gold-deep); }\n.ld-big-in span { font-size: 15px; font-weight: 700; white-space: nowrap; }\n.ld-big-in input { flex: 1; min-width: 0; border: 0; outline: 0; font: inherit; font-size: 24px; font-weight: 700; padding: 8px 0; background: transparent; }\n.ld-big-in.wide { grid-column: 1 / -1; }\n\n/* room wheels (iOS date-picker style): swipe a column, the row in the band is the choice */\n#ldCustomer { grid-template-columns: 1fr; }\n.ld-wheels { --row: 52px; display: grid; grid-template-columns: 1.4fr .8fr 1fr; gap: 6px; position: relative; background: #fff; border: 2px solid var(--edge); border-radius: 16px; padding: 6px 8px 8px; }\n.ld-wcol { display: grid; gap: 2px; min-width: 0; }\n.ld-wcol > small { text-align: center; font-weight: 700; color: var(--muted-foreground); font-size: 13px; }\n.ld-wheel { position: relative; height: calc(var(--row) * 5); overflow-y: scroll; scroll-snap-type: y mandatory; overscroll-behavior: contain; scrollbar-width: none;\n    padding: calc(var(--row) * 2) 0; perspective: 600px; touch-action: pan-y; user-select: none; -webkit-user-select: none;\n    -webkit-mask-image: linear-gradient(transparent, #000 30%, #000 70%, transparent); mask-image: linear-gradient(transparent, #000 30%, #000 70%, transparent); border-radius: 12px; }\n.ld-wheel::-webkit-scrollbar { display: none; }\n.ld-wopt { height: var(--row); line-height: var(--row); scroll-snap-align: center; text-align: center; font-size: 24px; font-weight: 700; white-space: nowrap; overflow: hidden;\n    text-overflow: ellipsis; padding: 0 4px; color: var(--ink); transform-origin: center; will-change: transform; cursor: pointer; }\n.ld-wopt.none { color: var(--muted-foreground); font-weight: 500; }\n.ld-wopt[aria-selected=\"true\"] { color: #000; }\n.ld-wheels::after { content: ''; position: absolute; left: 8px; right: 8px; top: calc(6px + 19px + var(--row) * 2); height: var(--row); border: 2px solid var(--gold-deep);\n    border-radius: 12px; background: rgba(212, 175, 55, .14); pointer-events: none; }\n.ld-wempty { height: var(--row); line-height: var(--row); text-align: center; color: var(--muted-foreground); font-size: 15px; }\n.ld-picked { font-size: 17px; font-weight: 700; padding: 2px 6px; min-height: 1.4em; }\n.ld-picked small { font-weight: 500; color: var(--muted-foreground); }\n.ld-picked .grp { display: inline-block; margin-left: 6px; padding: 2px 10px; border-radius: 999px; background: #eef4ff; border: 1px solid #c9d7f2; font-size: 15px; }\n\n/* item tiles */\n.ld-items { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; margin: 10px 0; }\n.ld-item { position: relative; display: grid; justify-items: center; align-content: start; gap: 4px; padding: 10px 6px 8px; background: #fff; border: 3px solid var(--edge);\n    border-radius: 18px; min-height: 150px; text-align: center; transition: transform .08s ease; touch-action: manipulation; }\n.ld-item.on { border-color: var(--ok); background: #f3fbf6; }\n.ld-item.pop { transform: scale(.94); }\n.ld-pic { width: 76px; height: 76px; object-fit: cover; border-radius: 12px; }\n.ld-pic.emoji { display: grid; place-items: center; font-size: 56px; line-height: 1; }\n.ld-pic.sm { width: 40px; height: 40px; font-size: 30px; border-radius: 8px; }\n.ld-iname { font-weight: 700; font-size: 15px; line-height: 1.2; }\n.ld-iname small { display: block; font-weight: 500; color: var(--muted-foreground); font-size: 13px; }\n.ld-iprice { font-weight: 800; font-size: 18px; color: var(--gold-deep); }\n.ld-iprice small { font-size: 11px; font-weight: 600; }\n.ld-badge { position: absolute; top: -8px; right: -8px; min-width: 38px; height: 38px; padding: 0 8px; border-radius: 999px; background: var(--ok); color: #fff;\n    font-size: 22px; display: grid; place-items: center; box-shadow: 0 2px 6px rgba(0,0,0,.25); }\n\n/* cart */\n.ld-cart { background: #fff; border: 2px solid var(--edge); border-radius: 16px; padding: 6px 8px; }\n.ld-hint { text-align: center; color: var(--muted-foreground); font-size: 17px; margin: 10px; }\n.ld-cart-t { width: 100%; border-collapse: collapse; }\n.ld-cart-t td { padding: 6px 4px; border-bottom: 1px dashed #eadcc0; vertical-align: middle; }\n.ld-cart-t tr:last-child td { border-bottom: 0; }\n.c-name { font-weight: 700; } .c-name small { display: block; font-weight: 500; color: var(--muted-foreground); font-size: 12px; }\n.c-qty { white-space: nowrap; text-align: center; }\n.c-qty button { width: 44px; height: 44px; border-radius: 12px; border: 2px solid var(--edge); background: #fff; font-size: 24px; font-weight: 800; }\n.c-qty b, .c-qty .c-num { display: inline-block; min-width: 52px; font-size: 22px; font-weight: 800; }\n.c-qty .c-num { width: auto; padding: 0 8px; margin: 0 4px; background: #fff8e6; }\n.c-amt { text-align: right; font-weight: 800; font-size: 18px; white-space: nowrap; }\n\n/* payment */\n.ld-pay { margin: 10px 0; display: grid; gap: 8px; }\n.ld-recv { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; background: #fff; border: 2px solid var(--edge); border-radius: 14px; padding: 8px; }\n.ld-recv > span { font-weight: 700; }\n.ld-quick { display: flex; flex-wrap: wrap; gap: 6px; }\n.ld-quick button { min-width: 56px; padding: 8px 10px; border: 2px solid var(--edge); border-radius: 10px; background: #fffdf5; font-weight: 800; font-size: 17px; }\n.ld-recv input { width: 90px; font: inherit; font-size: 20px; font-weight: 700; padding: 6px 8px; border: 2px solid var(--edge); border-radius: 10px; }\n.ld-change { font-size: 18px; color: var(--ok); } .ld-change.bad { color: var(--bad); }\n\n/* sticky total + save */\n.ld-bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 20; display: flex; align-items: center; gap: 10px; padding: 10px max(12px, env(safe-area-inset-left)) calc(10px + env(safe-area-inset-bottom));\n    background: #2b1e10; color: #fff; box-shadow: 0 -6px 20px rgba(0,0,0,.25); }\n.ld-bar.free { background: #3b2270; }\n.ld-total { flex: 1; display: grid; line-height: 1.05; }\n.ld-total b { font-size: 36px; font-weight: 900; }\n.ld-total small { font-size: 12px; opacity: .85; letter-spacing: .05em; }\n.ld-clear { width: 52px; height: 52px; border-radius: 14px; border: 2px solid rgba(255,255,255,.4); background: transparent; color: #fff; font-size: 22px; }\n.ld-save { min-width: 150px; height: 60px; border: 0; border-radius: 16px; background: #22a55b; color: #fff; font-size: 24px; font-weight: 900; letter-spacing: .04em; }\n.ld-save:disabled { background: #6b7d70; opacity: .6; cursor: not-allowed; }\n.ld-save.wide { width: 100%; margin-top: 12px; }\n\n/* free (staff) */\n.ld.free .ld-tabs [data-tab=\"free\"] { border-color: var(--free); background: var(--free-bg); }\n/* staff only: category tiles → people window */\n.ld-cats { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }\n.ld-cat { display: grid; justify-items: center; gap: 4px; padding: 14px 10px; border: 3px solid var(--edge); border-radius: 18px; background: #fff; min-height: 150px; touch-action: manipulation; }\n.ld-cat:not(:disabled):active { background: var(--free-bg); border-color: var(--free); }\n.ld-cat:disabled { opacity: .45; }\n.ld-cat b { font-size: 22px; } .ld-cat small { color: var(--muted-foreground); font-size: 14px; }\n.ld-cat-faces { display: flex; justify-content: center; }\n.ld-cat-faces img, .ld-cat-faces span { width: 58px; height: 58px; border-radius: 50%; object-fit: cover; border: 3px solid #fff; margin-left: -14px; display: grid; place-items: center; font-size: 34px; background: #f1ece2; box-shadow: 0 1px 4px rgba(0,0,0,.15); }\n.ld-cat-faces > :first-child { margin-left: 0; }\n.ld-people { width: min(980px, 96vw); max-height: 90vh; }\n.ld-people-h { display: flex; align-items: center; justify-content: space-between; gap: 10px; }\n.ld-people-h h3 { margin: 0; font-size: 24px; }\n.ld-people-h button { width: 56px; height: 56px; border-radius: 14px; border: 2px solid var(--edge); background: #fff; font-size: 24px; }\n.ld-people-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 10px; margin-top: 10px; overflow-y: auto; max-height: calc(90vh - 110px); }\n.ld-person { display: grid; justify-items: center; gap: 4px; padding: 10px; border: 3px solid var(--edge); border-radius: 16px; background: #fff; text-align: center; touch-action: manipulation; }\n.ld-person:active { border-color: var(--free); background: var(--free-bg); }\n.ld-person img, .ld-person .nophoto { width: 120px; height: 140px; border-radius: 12px; object-fit: cover; display: grid; place-items: center; font-size: 70px; background: #f1ece2; }\n.ld-person b { font-size: 17px; line-height: 1.2; } .ld-person small { color: var(--muted-foreground); font-size: 13px; }\n.ld-staff-card { grid-column: 1 / -1; display: flex; gap: 14px; align-items: flex-start; padding: 12px; border: 3px solid var(--free); border-radius: 18px; background: var(--free-bg); }\n.ld-photo img, .ld-photo span { width: 170px; height: 200px; object-fit: cover; border-radius: 14px; display: grid; place-items: center; font-size: 80px; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,.15); }\n.ld-photo span small { font-size: 13px; color: var(--muted-foreground); }\n.ld-sinfo { display: grid; gap: 6px; min-width: 0; }\n.ld-sinfo > b { font-size: 24px; }\n.ld-check { font-weight: 700; color: var(--free); }\n.ld-usage { font-size: 14px; }\n.ld-warn { display: block; padding: 8px 10px; border-radius: 10px; background: #fff1d6; color: #7a4d00; font-weight: 700; }\n.ld-change-staff { justify-self: start; padding: 6px 12px; border: 2px solid var(--free); border-radius: 10px; background: #fff; color: var(--free); font-weight: 700; }\n\n/* lists */\n.ld-cards { display: grid; gap: 8px; margin-top: 8px; }\n.ld-card { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: #fff; border: 2px solid var(--edge); border-left-width: 8px; border-radius: 14px; text-align: left; width: 100%; }\n.ld-card.received { border-left-color: #c78a00; } .ld-card.ready { border-left-color: var(--ok); } .ld-card.void { opacity: .55; text-decoration: line-through; }\n.ld-cmain { flex: 1; display: grid; min-width: 0; }\n.ld-cmain b { font-size: 18px; }\n.ld-cmain small { color: var(--muted-foreground); }\n.ld-st { font-weight: 700; font-size: 14px; }\n.ld-cbtn { display: flex; flex-wrap: wrap; gap: 6px; justify-content: flex-end; }\n.ld-cbtn button { padding: 12px 14px; border: 2px solid var(--edge); border-radius: 12px; background: #fff; font-weight: 800; font-size: 16px; }\n.ld-cbtn button.ok, .ld-dlg-b .ok, .ld-qbox .ok { background: var(--ok); border-color: var(--ok); color: #fff; }\n.ld-mini { width: 54px; height: 54px; border-radius: 10px; object-fit: cover; }\n.ld-amt { font-size: 20px; }\n.ld-muted { color: var(--muted-foreground); text-align: center; padding: 14px; }\n\n.ld-kpis { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }\n.ld-kpi { display: grid; justify-items: center; padding: 10px 6px; background: #fff; border: 2px solid var(--edge); border-radius: 14px; }\n.ld-kpi span { font-size: 26px; } .ld-kpi b { font-size: 22px; } .ld-kpi small { color: var(--muted-foreground); font-size: 12px; }\n.ld-qbox { margin-top: 10px; padding: 10px; border: 2px solid #e6bcbc; background: #fff5f5; border-radius: 14px; display: grid; gap: 6px; }\n.ld-qrow { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; justify-content: space-between; }\n.ld-qbox button { padding: 10px 14px; border-radius: 12px; border: 2px solid var(--edge); background: #fff; font-weight: 800; }\n.bad { color: var(--bad); }\n\n/* close day */\n\n/* dialogs */\ndialog.ld-dlg { border: 0; border-radius: 18px; padding: 14px; width: min(420px, 94vw); max-height: 92vh; box-shadow: 0 24px 60px rgba(0,0,0,.35); }\ndialog.ld-dlg::backdrop { background: rgba(20, 12, 4, .55); }\n.ld-done { text-align: center; font-size: 22px; font-weight: 900; color: var(--ok); margin-bottom: 8px; }\n.ld-dlg-b { display: flex; gap: 8px; margin-top: 12px; }\n.ld-dlg-b button { flex: 1; padding: 14px; border-radius: 14px; border: 2px solid var(--edge); background: #fff; font-weight: 800; font-size: 18px; }\n.ld-appr { display: grid; gap: 10px; }\n.ld-appr h3 { margin: 0; }\n.ld-appr label { display: grid; gap: 4px; font-weight: 700; }\n.ld-appr input { font: inherit; font-size: 20px; padding: 8px 10px; border: 2px solid var(--edge); border-radius: 10px; }\n.ld-rdlg .ld-receipt { border: 1px dashed #bbb; }\n\n@media (max-width: 640px) {\n    .ld { padding: 6px 6px 110px; }\n    .ld-tabs { gap: 14px; }\n    .ld-tabs button { font-size: 14px; padding: 12px 2px; }\n    .ld-tabs button span { font-size: 18px; }\n    .ld-who { grid-template-columns: 1fr; }\n    .ld-items { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }\n    .ld-item { min-height: 132px; padding: 8px 4px; }\n    .ld-pic { width: 60px; height: 60px; } .ld-pic.emoji { font-size: 46px; }\n    .ld-iname { font-size: 13px; }\n    .ld-staff-card { flex-direction: column; align-items: center; text-align: center; }\n    .ld-photo img, .ld-photo span { width: 200px; height: 230px; }\n    .ld-save { min-width: 120px; font-size: 20px; }\n    .ld-total b { font-size: 30px; }\n}\n/* building tab: linen items, no room or building to choose */\n.ld.bld .ld-tabs [data-tab=\"building\"] { border-color: #1f5fa8; background: #e6f0fb; }\n.ld-bar.bld { background: #163f6e; }\n.ld-pic.icon { object-fit: contain; background: transparent; }\n.ld-recv input { cursor: pointer; background: #fffdf5; }\n\n/* pending cash */\n.ld-dates { display: flex; flex-wrap: wrap; align-items: end; gap: 8px; margin: 8px 0; }\n.ld-dates label { display: grid; gap: 2px; font-weight: 700; }\n.ld-dates label small { font-weight: 500; color: var(--muted-foreground); }\n.ld-dates input { font: inherit; font-size: 22px; font-weight: 700; padding: 10px 12px; border: 2px solid var(--edge); border-radius: 14px; background: #fff; min-height: 56px; }\n.ld-dates button { min-height: 56px; padding: 0 16px; border: 2px solid var(--edge); border-radius: 14px; background: #fff; font-weight: 800; }\nbutton.ld-kpi { cursor: pointer; }\n.ld-kpi.on { border-color: var(--gold-deep); box-shadow: 0 0 0 2px var(--gold-deep) inset; }\n.ld-kpi.unpaid b { color: var(--bad); } .ld-kpi.paid b { color: var(--ok); }\n.ld-card.unpaid { border-left-color: var(--bad); } .ld-card.paid { border-left-color: var(--ok); }\n.ld-paytag { padding: 4px 12px; border-radius: 999px; font-weight: 800; font-size: 15px; white-space: nowrap; }\n.ld-card.unpaid .ld-paytag { background: #fde7e7; color: var(--bad); }\n.ld-card.paid .ld-paytag { background: var(--ok-bg); color: var(--ok); }\n\n@media print { .ld-bar, .ld-tabs { display: none; } }\n\n/* staff log */\n.ld-day { align-items: end; }\n.ld-day button { min-width: 64px; font-size: 22px; }\n.ld-day button:disabled { opacity: .4; }\n.ld-card.slog { border-left-color: var(--free); }\n.ld-card.slog .ld-cmain small + small { color: var(--ink); }\n.ld-mini.none { display: grid; place-items: center; font-size: 28px; background: #f1ece2; }\n\n/* building log */\n.ld-card.slog.blog { border-left-color: #1f5fa8; }\n.ld-card.slog.blog .ld-mini { object-fit: contain; background: #fff; }\n.ld-logitems { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0; }\n.ld-logitems:empty { display: none; }\n.ld-logitem { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px 4px 4px; border: 2px solid #dbe6f3; border-radius: 12px; background: #f4f8fd; }\n.ld-logitem b { font-size: 20px; color: #163f6e; } .ld-logitem small { color: var(--muted-foreground); }\n.ld-logitem .ld-pic.icon { object-fit: contain; }\n", l = t();
function ne({ make: e, onReady: t, onPick: n, label: r, id: i }) {
	let a = (0, c.useRef)(null), o = (0, c.useRef)(n);
	return o.current = n, (0, c.useEffect)(() => {
		e && a.current && t(e(a.current, (e) => o.current(e)));
	}, [e]), /* @__PURE__ */ (0, l.jsx)("div", {
		ref: a,
		id: i,
		className: "ld-wheel",
		role: "listbox",
		"aria-label": r
	});
}
function u({ className: e, onClose: t, children: n }) {
	let r = (0, c.useRef)(null);
	return (0, c.useEffect)(() => {
		let e = r.current;
		e && !e.open && e.showModal();
	}, []), /* @__PURE__ */ (0, l.jsx)("dialog", {
		ref: r,
		className: e,
		onClose: t,
		onCancel: t,
		children: n
	});
}
function re({ h: e }) {
	return /* @__PURE__ */ (0, l.jsx)("span", {
		style: { display: "contents" },
		dangerouslySetInnerHTML: { __html: e }
	});
}
// src/pages/laundry/LaundryPage.tsx
var ie = [
	[
		"bill",
		"🧺",
		"New bill"
	],
	[
		"free",
		"👷",
		"Staff only"
	],
	[
		"slog",
		"📒",
		"Staff log"
	],
	[
		"building",
		"🏨",
		"Building"
	],
	[
		"blog",
		"🧾",
		"Building log"
	],
	[
		"cash",
		"💵",
		"Pending cash"
	]
], d = (e, t) => String(e).localeCompare(String(t), void 0, {
	numeric: !0,
	sensitivity: "base"
}), ae = (e, t) => new Date(Date.parse(e + "T12:00:00Z") + t * 864e5).toISOString().slice(0, 10);
function f() {
	let { cloud: t, rooms: n, stay: o } = i(), f = r(), se = a(), ce = e(), { siteId: p } = s(), le = (0, c.useRef)(null), [m, ue] = (0, c.useState)(null), [h, de] = (0, c.useState)(null), [g, fe] = (0, c.useState)("bill"), [pe, _] = (0, c.useState)({
		bill: /* @__PURE__ */ new Map(),
		free: /* @__PURE__ */ new Map(),
		building: /* @__PURE__ */ new Map()
	}), [v, me] = (0, c.useState)([]), [y, he] = (0, c.useState)([]), [ge, _e] = (0, c.useState)([]), [ve, ye] = (0, c.useState)(""), [be, xe] = (0, c.useState)([]), [Se, Ce] = (0, c.useState)([]), [b, x] = (0, c.useState)(null), [S, C] = (0, c.useState)(null), [w, we] = (0, c.useState)({
		building: "",
		room: ""
	}), [T, E] = (0, c.useState)(""), [D, Te] = (0, c.useState)(0), [Ee, De] = (0, c.useState)(!1), [O, k] = (0, c.useState)(null), [Oe, A] = (0, c.useState)(""), ke = (0, c.useRef)(null), j = (0, c.useRef)({}), M = (0, c.useRef)([]);
	M.current = be;
	let N = g === "building", P = g === "free", F = g === "free" || g === "building" ? g : "bill", I = pe[F];
	(0, c.useCallback)(async (e, t) => (await f(m.cached(e, t))).data, [m]), (0, c.useEffect)(() => {
		(async () => {
			let [e, t] = await Promise.all([se("laundry"), ce("views/laundry/wheel.js")]);
			ue(e), de(() => t.wheel);
		})();
	}, []), (0, c.useEffect)(() => {
		if (!m) return;
		let e = t.request;
		(async () => {
			try {
				me((await f(m.cached(`pms_laundry_items:${p}`, () => e("GET", `/api/laundry/items?site=${p}`)))).data.items.filter((e) => e.active));
			} catch (e) {
				A(e.message || "Could not load the items.");
			}
			try {
				let t = (await f(m.cached("pms_laundry_info", () => e("GET", "/api/settings")))).data;
				ye(t.settings?.laundry_info || m.DEFAULT_INFO), _e(t.settings?.laundry_staff_categories?.[p] || []);
			} catch {
				ye(m.DEFAULT_INFO);
			}
			Ae();
			try {
				he((await f(m.cached(`pms_laundry_staff:${p}`, () => e("GET", `/api/laundry/staff?site=${p}`)))).data.staff.filter((e) => e.active && e.free && !e.archived));
			} catch {}
			L(), R();
		})();
		let n = () => void R();
		window.addEventListener("online", n);
		let r = setInterval(() => void R(), 3e4);
		return () => {
			clearInterval(r), window.removeEventListener("online", n);
		};
	}, [m]);
	let Ae = () => {
		f(t.mirrorAll(p)).then((e) => Ce(e.filter((e) => !e.deleted))).catch(() => {});
	}, L = () => Te(m ? m.queued().length : 0), R = async () => {
		if (!m || !m.queued().length) return;
		let e = await m.flushQueue();
		L(), e.sent && g === "cash" && Je((e) => e + 1);
	}, je = (e) => String(e.floor || n.floorOf(e.room_no) || "0"), Me = (e) => M.current.find((t) => t.name === e);
	function Ne(e) {
		try {
			e && localStorage.setItem(`pms_laundry_building:${p}`, e);
		} catch {}
		let t = [...new Set((Me(e)?.rooms || []).map(je))].sort(d);
		j.current.f?.set(t.map((e) => ({
			value: e,
			label: e === "0" ? "G" : e
		})), t[0]), z(t[0], e);
	}
	function z(e, t = j.current.b?.value) {
		let r = (Me(t)?.rooms || []).filter((t) => je(t) === e).map((e) => n.normRoom(e.room_no)).sort(d);
		j.current.r?.set([{
			value: "",
			label: "—",
			cls: "none"
		}, ...r.map((e) => ({
			value: e,
			label: e
		}))], ""), we({
			building: t || "",
			room: ""
		});
	}
	let Pe = !!h;
	(0, c.useEffect)(() => {
		Pe && (async () => {
			try {
				let e = await f(n.loadBuildings({ force: !0 })), t = n.buildingsOfSite(e, p), r = (t.length ? t : e).map((e) => ({
					name: e.name,
					sort: e.sort || 0,
					rooms: (e.rooms || []).filter((e) => e.active !== !1 && e.room_no)
				})).filter((e) => e.rooms.length).sort((e, t) => e.sort - t.sort || d(e.name, t.name));
				M.current = r, xe(r);
				let i = "";
				try {
					i = localStorage.getItem(`pms_laundry_building:${p}`) || "";
				} catch {}
				j.current.b?.set(r.map((e) => ({
					value: e.name,
					label: e.name
				})), i), Ne(j.current.b?.value ?? "");
			} catch {}
		})();
	}, [Pe]);
	let Fe = (e, t) => {
		let r = Date.now();
		for (let i of Se) if (n.normBuilding(i.building) === e && o.rowsOf(i).some((e) => n.normRoom(e.room_no) === t && e.start <= r && r < e.end)) return i.tour_name || "";
		return "";
	}, Ie = () => ({
		name: "",
		room: w.room,
		building: w.building,
		group: w.room ? Fe(w.building, w.room) : ""
	});
	(0, c.useEffect)(() => {
		g === "bill" && Object.values(j.current).forEach((e) => e?.sync());
	}, [g]);
	let Le = v.filter((e) => (e.category || "guest") === (N ? "building" : "guest")), Re = (e, t) => _((n) => {
		let r = new Map(n[F]);
		return t > 0 ? r.set(e, t) : r.delete(e), {
			...n,
			[F]: r
		};
	}), ze = (e, t) => _((n) => {
		let r = new Map(n[F]), i = Math.max(0, (r.get(e) || 0) + t);
		return i > 0 ? r.set(e, i) : r.delete(e), {
			...n,
			[F]: r
		};
	});
	async function Be(e) {
		let t = v.find((t) => t.id === e);
		if (!t) return;
		let n = await m.keypad({
			title: `${m.itemPic(t, "kp-pic")}<span>${m.esc(t.name)}<br><small>How many?</small></span>`,
			value: I.get(e) || 0,
			root: le.current
		});
		n != null && Re(e, n);
	}
	let B = (0, c.useMemo)(() => [...I].map(([e, t]) => {
		let n = v.find((t) => t.id === e);
		return n && {
			item_id: e,
			name: n.name,
			price: n.price,
			qty: t,
			amount: n.price * t,
			image: n.image
		};
	}).filter(Boolean), [I, v]), V = B.reduce((e, t) => e + t.qty, 0), Ve = P && !!b?.charged, H = N ? 0 : Ve ? V * 100 : B.reduce((e, t) => e + t.amount, 0);
	function He() {
		_((e) => ({
			...e,
			[F]: /* @__PURE__ */ new Map()
		})), E(""), g === "bill" && z(j.current.f?.value), g === "free" && (x(null), C(null));
	}
	let U = T.trim() === "" ? null : Math.round(Number(T) * 100), Ue = (0, c.useMemo)(() => {
		let e = new Set(ge), t = ge.map((e) => ({
			key: e,
			label: e,
			people: y.filter((t) => t.category === e)
		})), n = y.filter((t) => !e.has(t.category || ""));
		return n.length && t.push({
			key: "",
			label: "Uncategorized",
			people: n
		}), t;
	}, [ge, y]);
	async function We(e) {
		k(null), x(e), C(null);
		try {
			C((await f(t.request("GET", `/api/laundry/staff/${e.id}`))).usage);
		} catch {}
	}
	let Ge = () => {
		if (!b || b.charged) return [];
		let e = b.limits || {}, t = S, n = [];
		return e.per_bill_items && V > e.per_bill_items && n.push(`${V} pieces — limit ${e.per_bill_items} per time`), t && e.per_day_items && t.day_items + V > e.per_day_items && n.push(`${t.day_items + V} pieces today — limit ${e.per_day_items}`), t && e.per_week_items && t.week_items + V > e.per_week_items && n.push(`${t.week_items + V} pieces this week — limit ${e.per_week_items}`), t && e.per_month_value && t.month_value + H > e.per_month_value && n.push(`${m.sar(t.month_value + H)} SAR this month — limit ${m.sar(e.per_month_value)}`), t && e.per_month_bills && t.month_bills + 1 > e.per_month_bills && n.push(`${t.month_bills + 1} times this month — limit ${e.per_month_bills}`), n;
	};
	async function Ke(e) {
		if (!B.length) return;
		let n = Ie();
		if (g === "bill" && !n.room) {
			A("Choose the room first (swipe the wheels).");
			return;
		}
		let r = {
			site: p,
			kind: P ? "free" : N ? "building" : "paid",
			customer: P || N ? void 0 : n,
			staff_id: P ? b?.id : void 0,
			lines: B.map((e) => ({
				item_id: e.item_id,
				qty: e.qty
			})),
			method: g === "bill" ? "cash" : void 0,
			received: g !== "bill" || T.trim() === "" ? void 0 : Number(T),
			preview_lines: B.map(({ image: e, ...t }) => Ve ? {
				...t,
				price: 100,
				amount: 100 * t.qty
			} : t),
			preview_value: H,
			staff_name: P ? b?.name : void 0,
			approval: e
		};
		r.client_uid = ke.current ||= m.uid(), De(!0), A("");
		try {
			let e = await f(m.saveBill(r));
			ke.current = null, k({
				kind: "receipt",
				bill: e.bill,
				warnings: e.warnings || [],
				offline: !!e.offline,
				close: "➕ Next bill"
			}), He(), L(), Ae();
		} catch (e) {
			e instanceof m.ApiError && e.status === 409 && e.extra?.needs_approval ? k({
				kind: "approval",
				warnings: e.extra.warnings || []
			}) : A(e instanceof t.UserError ? e.message : e.message || "Could not save. Try again.");
		} finally {
			De(!1);
		}
	}
	let [W, G] = (0, c.useState)({
		day: "",
		bills: [],
		err: "",
		loading: !1
	}), [K, q] = (0, c.useState)({
		from: "",
		to: "",
		show: "all",
		bills: [],
		err: "",
		picked: !1
	}), [qe, Je] = (0, c.useState)(0), J = W.day || (m ? m.jeddahDay() : "");
	if ((0, c.useEffect)(() => {
		if (!m || g !== "slog" && g !== "blog") return;
		let e = g === "blog" ? "building" : "free", n = J;
		G((e) => ({
			...e,
			day: n,
			loading: !0,
			err: ""
		})), f(t.request("GET", `/api/laundry/bills?site=${p}&from=${n}&to=${n}${e === "building" ? "&kind=building" : ""}&all=1`)).then((t) => G((n) => ({
			...n,
			bills: e === "building" ? t.bills : t.bills.filter((e) => e.kind === "free" || e.kind === "paid" && e.staff_id),
			loading: !1
		}))).catch((e) => G((t) => ({
			...t,
			bills: [],
			err: e.message || "Not available offline.",
			loading: !1
		})));
	}, [
		m,
		g,
		J
	]), (0, c.useEffect)(() => {
		m && g === "cash" && (async () => {
			let e = K.from;
			if (!K.picked) try {
				e = (await f(t.request("GET", `/api/laundry/oldest-unpaid?site=${p}`))).day || m.jeddahDay();
			} catch {
				e ||= m.jeddahDay();
			}
			let n = e || m.jeddahDay(), r = K.to || m.jeddahDay();
			if (K.picked || q((e) => ({
				...e,
				from: n,
				picked: !0
			})), r < n) q((e) => ({
				...e,
				bills: [],
				err: "\"To\" is before \"From\"."
			}));
			else try {
				let e = await f(t.request("GET", `/api/laundry/bills?site=${p}&from=${n}&to=${r}&kind=paid&all=1`));
				q((t) => ({
					...t,
					bills: e.bills.filter((e) => !e.voided),
					err: ""
				}));
			} catch (e) {
				q((t) => ({
					...t,
					bills: [],
					err: e.message
				}));
			}
		})();
	}, [
		m,
		g,
		K.from,
		K.to,
		qe
	]), !m) return /* @__PURE__ */ (0, l.jsx)("div", {
		className: "p-4 text-sm",
		children: "Loading…"
	});
	let { sar: Y, itemPic: X, jeddahDay: Z, jeddahTime: Ye, jeddahDate: Xe } = m, Q = (e) => /* @__PURE__ */ (0, l.jsx)(re, { h: e }), Ze = (e) => e.kind === "free" || e.staff_id ? "👷 " + (e.staff_name || e.customer?.name || "") + (e.kind === "paid" && e.customer?.room ? " · 🚪 " + e.customer.room : "") : e.kind === "building" ? `🏨 Building linen${e.customer?.building ? " · " + e.customer.building : ""}` : `🚪 ${[e.customer?.building, e.customer?.room || "—"].filter(Boolean).join(" · ")}${e.customer?.name ? " · " + e.customer.name : ""}`, Qe = g === "bill" || g === "free" || g === "building", $e = [...new Set([H, ...[
		5,
		10,
		20,
		50,
		100,
		200,
		500
	].map((e) => e * 100).filter((e) => e > H)].slice(0, 5))], $ = m.queued();
	function et(e) {
		let t = e === "building", n = W.bills.filter((e) => !e.voided), r = n.reduce((e, t) => e + t.items, 0), i = /* @__PURE__ */ new Map();
		if (t) for (let e of n) for (let t of e.lines) i.set(t.name, (i.get(t.name) || 0) + t.qty);
		let a = (e) => v.findIndex((t) => t.name === e) + 1 || 999, o = (e) => {
			if (t) {
				let t = e.lines[0];
				return Q(X(v.find((e) => e.name === t?.name) || { name: t?.name }, "ld-mini"));
			}
			let n = y.find((t) => t.id === e.staff_id);
			return n?.photo ? /* @__PURE__ */ (0, l.jsx)("img", {
				className: "ld-mini",
				src: n.photo,
				alt: ""
			}) : /* @__PURE__ */ (0, l.jsx)("span", {
				className: "ld-mini none",
				children: "👤"
			});
		}, s = (e) => G((t) => ({
			...t,
			day: e
		}));
		return /* @__PURE__ */ (0, l.jsxs)("section", {
			className: "ld-pane",
			children: [
				/* @__PURE__ */ (0, l.jsxs)("div", {
					className: "ld-dates ld-day",
					children: [
						/* @__PURE__ */ (0, l.jsx)("button", {
							type: "button",
							"aria-label": "Previous day",
							onClick: () => s(ae(J, -1)),
							children: "◀"
						}),
						/* @__PURE__ */ (0, l.jsxs)("label", { children: [/* @__PURE__ */ (0, l.jsx)("span", { children: "📅 Day" }), /* @__PURE__ */ (0, l.jsx)("input", {
							type: "date",
							value: J,
							onChange: (e) => s(e.target.value || Z())
						})] }),
						/* @__PURE__ */ (0, l.jsx)("button", {
							type: "button",
							"aria-label": "Next day",
							disabled: J >= Z(),
							onClick: () => s(ae(J, 1)),
							children: "▶"
						}),
						/* @__PURE__ */ (0, l.jsx)("button", {
							type: "button",
							onClick: () => s(Z()),
							children: "Today"
						})
					]
				}),
				!W.err && /* @__PURE__ */ (0, l.jsxs)("div", {
					className: "ld-kpis",
					children: [
						!t && /* @__PURE__ */ (0, l.jsxs)("div", {
							className: "ld-kpi",
							children: [
								/* @__PURE__ */ (0, l.jsx)("span", { children: "👷" }),
								/* @__PURE__ */ (0, l.jsx)("b", { children: new Set(n.map((e) => e.staff_id)).size }),
								/* @__PURE__ */ (0, l.jsx)("small", { children: "staff" })
							]
						}),
						/* @__PURE__ */ (0, l.jsxs)("div", {
							className: "ld-kpi",
							children: [
								/* @__PURE__ */ (0, l.jsx)("span", { children: "🧾" }),
								/* @__PURE__ */ (0, l.jsx)("b", { children: n.length }),
								/* @__PURE__ */ (0, l.jsx)("small", { children: n.length === 1 ? "entry" : "entries" })
							]
						}),
						/* @__PURE__ */ (0, l.jsxs)("div", {
							className: "ld-kpi",
							children: [
								/* @__PURE__ */ (0, l.jsx)("span", { children: t ? "🧺" : "👕" }),
								/* @__PURE__ */ (0, l.jsx)("b", { children: r }),
								/* @__PURE__ */ (0, l.jsx)("small", { children: "pieces" })
							]
						})
					]
				}),
				/* @__PURE__ */ (0, l.jsx)("div", {
					className: "ld-logitems",
					children: [...i].sort((e, t) => a(e[0]) - a(t[0])).map(([e, t]) => /* @__PURE__ */ (0, l.jsxs)("span", {
						className: "ld-logitem",
						children: [
							Q(X(v.find((t) => t.name === e) || { name: e }, "ld-pic sm")),
							/* @__PURE__ */ (0, l.jsx)("b", { children: t }),
							/* @__PURE__ */ (0, l.jsx)("small", { children: e })
						]
					}, e))
				}),
				/* @__PURE__ */ (0, l.jsx)("div", {
					className: "ld-cards",
					children: W.loading ? /* @__PURE__ */ (0, l.jsx)("p", {
						className: "ld-muted",
						children: "Loading…"
					}) : W.err ? /* @__PURE__ */ (0, l.jsx)("p", {
						className: "ld-muted",
						children: W.err
					}) : W.bills.length ? [...W.bills].sort((e, t) => e.given_at.localeCompare(t.given_at)).map((e) => /* @__PURE__ */ (0, l.jsxs)("button", {
						type: "button",
						className: `ld-card row slog ${t ? "blog" : ""} ${e.voided ? "void" : ""}`,
						onClick: () => k({
							kind: "receipt",
							bill: e,
							warnings: [],
							offline: !1,
							close: "✖ Close"
						}),
						children: [
							o(e),
							/* @__PURE__ */ (0, l.jsxs)("div", {
								className: "ld-cmain",
								children: [
									/* @__PURE__ */ (0, l.jsx)("b", { children: t ? "🏨 Building linen" : "👷 " + (e.staff_name || "") }),
									/* @__PURE__ */ (0, l.jsxs)("small", { children: [
										Ye(e.given_at),
										" · ",
										e.receipt_no,
										" · ",
										e.worker || "",
										e.voided ? " · ❌ cancelled" : ""
									] }),
									/* @__PURE__ */ (0, l.jsx)("small", { children: e.lines.map((e) => `${e.name} × ${e.qty}`).join(", ") })
								]
							}),
							/* @__PURE__ */ (0, l.jsxs)("b", {
								className: "ld-amt",
								children: [
									e.items,
									" ",
									/* @__PURE__ */ (0, l.jsx)("small", { children: "pcs" })
								]
							})
						]
					}, e.id)) : /* @__PURE__ */ (0, l.jsxs)("p", {
						className: "ld-muted",
						children: [
							"No ",
							t ? "building linen" : "staff laundry",
							" on this day."
						]
					})
				})
			]
		});
	}
	function tt() {
		let e = K.bills, t = e.filter((e) => !e.settled_at), n = e.filter((e) => e.settled_at), r = (e) => e.reduce((e, t) => e + t.paid, 0), i = K.show === "paid" ? n : K.show === "unpaid" ? t : e, a = (e) => q((t) => ({
			...t,
			show: t.show === e ? "all" : e
		}));
		return /* @__PURE__ */ (0, l.jsxs)("section", {
			className: "ld-pane",
			children: [
				/* @__PURE__ */ (0, l.jsx)("div", {
					className: "ld-queue",
					children: $.length > 0 && /* @__PURE__ */ (0, l.jsxs)("div", {
						className: "ld-qbox",
						children: [
							/* @__PURE__ */ (0, l.jsxs)("b", { children: [
								"⏳ ",
								$.length,
								" bill",
								$.length === 1 ? "" : "s",
								" waiting on this device"
							] }),
							$.map((e) => /* @__PURE__ */ (0, l.jsxs)("div", {
								className: "ld-qrow",
								children: [/* @__PURE__ */ (0, l.jsxs)("span", { children: [
									e.local_no,
									" · ",
									e.kind === "free" ? "👷 " + (e.staff_name || "") : [
										e.customer?.building,
										e.customer?.room,
										e.customer?.name
									].filter(Boolean).join(" "),
									" · ",
									Y(e.preview_value || 0),
									" SAR"
								] }), e.error && /* @__PURE__ */ (0, l.jsxs)(l.Fragment, { children: [/* @__PURE__ */ (0, l.jsx)("small", {
									className: "bad",
									children: e.error
								}), /* @__PURE__ */ (0, l.jsx)("button", {
									type: "button",
									onClick: () => {
										confirm("Remove this bill from the device? It will NOT be saved.") && (m.dropQueued(e.client_uid), L());
									},
									children: "Remove"
								})] })]
							}, e.client_uid)),
							/* @__PURE__ */ (0, l.jsx)("button", {
								type: "button",
								className: "ok",
								onClick: async () => {
									let e = await m.flushQueue();
									L(), e.sent && Je((e) => e + 1), e.left && !e.failed && A("Still no connection. The bills stay on this device.");
								},
								children: "📤 Send now"
							})
						]
					})
				}),
				/* @__PURE__ */ (0, l.jsxs)("div", {
					className: "ld-dates",
					children: [
						/* @__PURE__ */ (0, l.jsxs)("label", { children: [/* @__PURE__ */ (0, l.jsx)("span", { children: "📅 From" }), /* @__PURE__ */ (0, l.jsx)("input", {
							type: "date",
							value: K.from,
							onChange: (e) => q((t) => ({
								...t,
								picked: !0,
								from: e.target.value || Z()
							}))
						})] }),
						/* @__PURE__ */ (0, l.jsxs)("label", { children: [/* @__PURE__ */ (0, l.jsxs)("span", { children: ["📅 To ", /* @__PURE__ */ (0, l.jsx)("small", { children: "(optional)" })] }), /* @__PURE__ */ (0, l.jsx)("input", {
							type: "date",
							value: K.to,
							onChange: (e) => q((t) => ({
								...t,
								to: e.target.value
							}))
						})] }),
						/* @__PURE__ */ (0, l.jsx)("button", {
							type: "button",
							"aria-label": "Clear the To date",
							onClick: () => q((e) => ({
								...e,
								to: ""
							})),
							children: "✖ To"
						})
					]
				}),
				!K.err && /* @__PURE__ */ (0, l.jsxs)("div", {
					className: "ld-kpis",
					children: [
						/* @__PURE__ */ (0, l.jsxs)("button", {
							type: "button",
							className: `ld-kpi unpaid${K.show === "unpaid" ? " on" : ""}`,
							onClick: () => a("unpaid"),
							children: [
								/* @__PURE__ */ (0, l.jsx)("span", { children: "⏳" }),
								/* @__PURE__ */ (0, l.jsx)("b", { children: Y(r(t)) }),
								/* @__PURE__ */ (0, l.jsxs)("small", { children: [
									"Unpaid SAR · ",
									t.length,
									" bill",
									t.length === 1 ? "" : "s"
								] })
							]
						}),
						/* @__PURE__ */ (0, l.jsxs)("button", {
							type: "button",
							className: `ld-kpi paid${K.show === "paid" ? " on" : ""}`,
							onClick: () => a("paid"),
							children: [
								/* @__PURE__ */ (0, l.jsx)("span", { children: "✅" }),
								/* @__PURE__ */ (0, l.jsx)("b", { children: Y(r(n)) }),
								/* @__PURE__ */ (0, l.jsxs)("small", { children: [
									"Paid SAR · ",
									n.length,
									" bill",
									n.length === 1 ? "" : "s"
								] })
							]
						}),
						/* @__PURE__ */ (0, l.jsxs)("button", {
							type: "button",
							className: `ld-kpi${K.show === "all" ? " on" : ""}`,
							onClick: () => a("all"),
							children: [
								/* @__PURE__ */ (0, l.jsx)("span", { children: "🧾" }),
								/* @__PURE__ */ (0, l.jsx)("b", { children: Y(r(e)) }),
								/* @__PURE__ */ (0, l.jsxs)("small", { children: ["All cash SAR · ", e.length] })
							]
						})
					]
				}),
				/* @__PURE__ */ (0, l.jsx)("div", {
					className: "ld-cards",
					children: K.err ? /* @__PURE__ */ (0, l.jsx)("p", {
						className: "ld-muted",
						children: K.err
					}) : i.length ? i.map((e) => /* @__PURE__ */ (0, l.jsxs)("button", {
						type: "button",
						className: `ld-card row ${e.settled_at ? "paid" : "unpaid"}`,
						onClick: () => k({
							kind: "receipt",
							bill: e,
							warnings: [],
							offline: !1,
							close: "✖ Close"
						}),
						children: [
							/* @__PURE__ */ (0, l.jsxs)("div", {
								className: "ld-cmain",
								children: [/* @__PURE__ */ (0, l.jsx)("b", { children: Ze(e) }), /* @__PURE__ */ (0, l.jsxs)("small", { children: [
									Xe(e.given_at),
									" ",
									Ye(e.given_at),
									" · ",
									e.receipt_no,
									" · ",
									e.items,
									" pcs",
									e.settled_at ? ` · paid ${Xe(e.settled_at)}${e.settled_by ? " to " + e.settled_by : ""}` : ""
								] })]
							}),
							/* @__PURE__ */ (0, l.jsx)("span", {
								className: "ld-paytag",
								children: e.settled_at ? "Paid" : "Unpaid"
							}),
							/* @__PURE__ */ (0, l.jsx)("b", {
								className: "ld-amt",
								children: Y(e.paid)
							})
						]
					}, e.id)) : /* @__PURE__ */ (0, l.jsx)("p", {
						className: "ld-muted",
						children: "No cash bills in these dates."
					})
				})
			]
		});
	}
	let nt = Ge();
	return /* @__PURE__ */ (0, l.jsxs)("div", {
		ref: le,
		children: [
			/* @__PURE__ */ (0, l.jsx)("style", { children: te + m.RECEIPT_CSS + m.KEYPAD_CSS }),
			/* @__PURE__ */ (0, l.jsxs)("div", {
				className: `ld${P ? " free" : ""}${N ? " bld" : ""}`,
				children: [
					/* @__PURE__ */ (0, l.jsx)("div", {
						className: "ld-head",
						children: /* @__PURE__ */ (0, l.jsx)(ee, {
							view: "laundry",
							title: "Laundry POS",
							current: ie.find((e) => e[0] === g)?.[2]
						})
					}),
					/* @__PURE__ */ (0, l.jsx)("nav", {
						className: "ld-tabs",
						role: "tablist",
						"aria-label": "Laundry POS",
						children: ie.map(([e, t, n]) => /* @__PURE__ */ (0, l.jsxs)("button", {
							type: "button",
							role: "tab",
							"aria-selected": g === e,
							onClick: () => {
								fe(e), window.scrollTo(0, 0);
							},
							children: [/* @__PURE__ */ (0, l.jsx)("span", {
								"aria-hidden": "true",
								children: t
							}), n]
						}, e))
					}),
					/* @__PURE__ */ (0, l.jsxs)("div", {
						className: "ld-info",
						children: [/* @__PURE__ */ (0, l.jsx)("span", {
							"aria-hidden": "true",
							children: "🕗"
						}), /* @__PURE__ */ (0, l.jsx)("div", { children: ve.split("\n").map((e, t) => /* @__PURE__ */ (0, l.jsxs)("span", { children: [t ? /* @__PURE__ */ (0, l.jsx)("br", {}) : null, e] }, t)) })]
					}),
					D > 0 && /* @__PURE__ */ (0, l.jsxs)("div", {
						className: "ld-offline",
						children: [
							"⏳ ",
							D,
							" bill",
							D === 1 ? "" : "s",
							" waiting on this device — sent automatically when the internet is back."
						]
					}),
					Oe && /* @__PURE__ */ (0, l.jsx)("div", {
						className: "ld-warn",
						role: "alert",
						onClick: () => A(""),
						children: Oe
					}),
					/* @__PURE__ */ (0, l.jsxs)("section", {
						className: "ld-pane",
						hidden: !Qe,
						children: [
							/* @__PURE__ */ (0, l.jsxs)("div", {
								className: "ld-who",
								id: "ldCustomer",
								hidden: g !== "bill",
								children: [/* @__PURE__ */ (0, l.jsxs)("div", {
									className: "ld-wheels",
									children: [
										/* @__PURE__ */ (0, l.jsxs)("div", {
											className: "ld-wcol",
											children: [/* @__PURE__ */ (0, l.jsx)("small", { children: "🏨 Building" }), /* @__PURE__ */ (0, l.jsx)(ne, {
												make: h,
												onReady: (e) => {
													j.current.b = e;
												},
												onPick: (e) => Ne(e),
												label: "Building",
												id: "ldWBuilding"
											})]
										}),
										/* @__PURE__ */ (0, l.jsxs)("div", {
											className: "ld-wcol narrow rm",
											children: [/* @__PURE__ */ (0, l.jsx)("small", { children: "⬆️ Floor" }), /* @__PURE__ */ (0, l.jsx)(ne, {
												make: h,
												onReady: (e) => {
													j.current.f = e;
												},
												onPick: (e) => z(e),
												label: "Floor",
												id: "ldWFloor"
											})]
										}),
										/* @__PURE__ */ (0, l.jsxs)("div", {
											className: "ld-wcol rm",
											children: [/* @__PURE__ */ (0, l.jsx)("small", { children: "🚪 Room" }), /* @__PURE__ */ (0, l.jsx)(ne, {
												make: h,
												onReady: (e) => {
													j.current.r = e;
												},
												onPick: (e) => we((t) => ({
													...t,
													room: e
												})),
												label: "Room",
												id: "ldWRoom"
											})]
										})
									]
								}), /* @__PURE__ */ (0, l.jsx)("div", {
									className: "ld-picked",
									children: be.length ? w.room ? /* @__PURE__ */ (0, l.jsxs)(l.Fragment, { children: [
										"🚪 ",
										w.building,
										" · ",
										w.room,
										Fe(w.building, w.room) ? /* @__PURE__ */ (0, l.jsxs)("span", {
											className: "grp",
											children: ["🏨 ", Fe(w.building, w.room)]
										}) : null
									] }) : /* @__PURE__ */ (0, l.jsx)("small", { children: "👆 Swipe the wheels to the room" }) : /* @__PURE__ */ (0, l.jsx)("small", { children: "No rooms yet — the admin adds them on Rooms & Buildings." })
								})]
							}),
							/* @__PURE__ */ (0, l.jsxs)("div", {
								className: "ld-who",
								hidden: !P,
								children: [!b && /* @__PURE__ */ (0, l.jsx)("div", {
									className: "ld-cats",
									children: Ue.length ? Ue.map((e) => /* @__PURE__ */ (0, l.jsxs)("button", {
										type: "button",
										className: "ld-cat",
										disabled: !e.people.length,
										onClick: () => k({
											kind: "people",
											g: e
										}),
										children: [
											/* @__PURE__ */ (0, l.jsxs)("span", {
												className: "ld-cat-faces",
												children: [e.people.slice(0, 3).map((e, t) => e.photo ? /* @__PURE__ */ (0, l.jsx)("img", {
													src: e.photo,
													alt: ""
												}, t) : /* @__PURE__ */ (0, l.jsx)("span", { children: "👤" }, t)), !e.people.length && /* @__PURE__ */ (0, l.jsx)("span", { children: "👷" })]
											}),
											/* @__PURE__ */ (0, l.jsx)("b", { children: e.label }),
											/* @__PURE__ */ (0, l.jsxs)("small", { children: [
												e.people.length,
												" ",
												e.people.length === 1 ? "person" : "people"
											] })
										]
									}, e.key || "none")) : /* @__PURE__ */ (0, l.jsx)("p", {
										className: "ld-muted",
										children: "No staff yet — the admin adds them on Laundry admin → Staff."
									})
								}), b && /* @__PURE__ */ (0, l.jsxs)("div", {
									className: "ld-staff-card",
									children: [/* @__PURE__ */ (0, l.jsx)("div", {
										className: "ld-photo",
										children: b.photo ? /* @__PURE__ */ (0, l.jsx)("img", {
											src: b.photo,
											alt: `Photo of ${b.name}`
										}) : /* @__PURE__ */ (0, l.jsxs)("span", { children: ["👤", /* @__PURE__ */ (0, l.jsx)("small", { children: "no photo" })] })
									}), /* @__PURE__ */ (0, l.jsxs)("div", {
										className: "ld-sinfo",
										children: [
											/* @__PURE__ */ (0, l.jsx)("b", { children: b.name }),
											/* @__PURE__ */ (0, l.jsx)("span", { children: [
												b.staff_code && "ID " + b.staff_code,
												b.department,
												b.room && "🚪 " + b.room
											].filter(Boolean).join(" · ") }),
											/* @__PURE__ */ (0, l.jsx)("span", {
												className: "ld-check",
												children: "👀 Is this the same person? Check the photo."
											}),
											b.charged && /* @__PURE__ */ (0, l.jsx)("span", {
												className: "ld-warn",
												children: "💵 PAID laundry · 1 SAR a piece — stays unpaid until the admin marks it paid"
											}),
											S && /* @__PURE__ */ (0, l.jsxs)("span", {
												className: "ld-usage",
												children: [
													"This month: ",
													/* @__PURE__ */ (0, l.jsx)("b", { children: S.month_bills }),
													" times · ",
													/* @__PURE__ */ (0, l.jsx)("b", { children: S.month_items }),
													" pcs · ",
													/* @__PURE__ */ (0, l.jsx)("b", { children: Y(S.month_value) }),
													" SAR"
												]
											}),
											nt.length > 0 && /* @__PURE__ */ (0, l.jsxs)("span", {
												className: "ld-warn",
												children: [
													"⚠️ ",
													nt.map((e, t) => /* @__PURE__ */ (0, l.jsxs)("span", { children: [t ? /* @__PURE__ */ (0, l.jsxs)(l.Fragment, { children: [/* @__PURE__ */ (0, l.jsx)("br", {}), "⚠️ "] }) : null, e] }, t)),
													b.limits?.enforce && /* @__PURE__ */ (0, l.jsxs)(l.Fragment, { children: [/* @__PURE__ */ (0, l.jsx)("br", {}), "Supervisor approval needed."] })
												]
											}),
											/* @__PURE__ */ (0, l.jsx)("button", {
												type: "button",
												className: "ld-change-staff",
												onClick: () => x(null),
												children: "Change person"
											})
										]
									})]
								})]
							}),
							/* @__PURE__ */ (0, l.jsx)("div", {
								className: "ld-items",
								children: Le.length ? Le.map((e) => {
									let t = I.get(e.id) || 0;
									return /* @__PURE__ */ (0, l.jsxs)("button", {
										type: "button",
										className: `ld-item${t ? " on" : ""}`,
										"aria-label": `${e.name}${N ? "" : `, ${Y(e.price)} SAR`}${t ? `, ${t} added` : ""}`,
										onClick: (t) => {
											if (N) {
												Be(e.id);
												return;
											}
											ze(e.id, 1);
											let n = t.currentTarget;
											n.classList.add("pop"), setTimeout(() => n.classList.remove("pop"), 180);
										},
										children: [
											"   ",
											Q(X(e)),
											/* @__PURE__ */ (0, l.jsxs)("span", {
												className: "ld-iname",
												children: [e.name, e.name_local ? /* @__PURE__ */ (0, l.jsx)("small", { children: e.name_local }) : null]
											}),
											N ? /* @__PURE__ */ (0, l.jsx)("span", {
												className: "ld-iprice",
												children: /* @__PURE__ */ (0, l.jsx)("small", { children: "🔢 tap for quantity" })
											}) : /* @__PURE__ */ (0, l.jsxs)("span", {
												className: "ld-iprice",
												children: [
													Y(e.price),
													" ",
													/* @__PURE__ */ (0, l.jsx)("small", { children: "SAR" })
												]
											}),
											t ? /* @__PURE__ */ (0, l.jsx)("b", {
												className: "ld-badge",
												children: t
											}) : null
										]
									}, e.id);
								}) : /* @__PURE__ */ (0, l.jsxs)("p", {
									className: "ld-muted",
									children: [
										"No ",
										N ? "building" : "",
										" items yet — the admin adds them on Laundry admin → Prices."
									]
								})
							}),
							/* @__PURE__ */ (0, l.jsx)("div", {
								className: "ld-cart",
								children: B.length ? /* @__PURE__ */ (0, l.jsx)("table", {
									className: "ld-cart-t",
									children: /* @__PURE__ */ (0, l.jsx)("tbody", { children: B.map((e) => /* @__PURE__ */ (0, l.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, l.jsx)("td", {
											className: "c-pic",
											children: Q(X(e, "ld-pic sm"))
										}),
										/* @__PURE__ */ (0, l.jsxs)("td", {
											className: "c-name",
											children: [e.name, N ? null : /* @__PURE__ */ (0, l.jsxs)("small", { children: [Y(e.price), " SAR"] })]
										}),
										/* @__PURE__ */ (0, l.jsxs)("td", {
											className: "c-qty",
											children: [
												/* @__PURE__ */ (0, l.jsx)("button", {
													type: "button",
													"aria-label": `One less ${e.name}`,
													onClick: () => ze(e.item_id, -1),
													children: "−"
												}),
												/* @__PURE__ */ (0, l.jsx)("button", {
													type: "button",
													className: "c-num",
													"aria-label": `Type the quantity of ${e.name}`,
													onClick: () => void Be(e.item_id),
													children: e.qty
												}),
												/* @__PURE__ */ (0, l.jsx)("button", {
													type: "button",
													"aria-label": `One more ${e.name}`,
													onClick: () => ze(e.item_id, 1),
													children: "+"
												})
											]
										}),
										/* @__PURE__ */ (0, l.jsx)("td", {
											className: "c-amt",
											children: N ? "" : Y(e.amount)
										})
									] }, e.item_id)) })
								}) : /* @__PURE__ */ (0, l.jsxs)("p", {
									className: "ld-hint",
									children: ["👆 ", N ? "Tap an item and type how many" : "Tap the pictures to add clothes"]
								})
							}),
							/* @__PURE__ */ (0, l.jsx)("div", {
								className: "ld-pay",
								hidden: g !== "bill",
								children: /* @__PURE__ */ (0, l.jsxs)("div", {
									className: "ld-recv",
									hidden: !H,
									children: [
										/* @__PURE__ */ (0, l.jsx)("span", { children: "💵 Given" }),
										/* @__PURE__ */ (0, l.jsx)("div", {
											className: "ld-quick",
											children: H ? $e.map((e) => /* @__PURE__ */ (0, l.jsx)("button", {
												type: "button",
												onClick: () => E(Y(e)),
												children: Y(e)
											}, e)) : null
										}),
										/* @__PURE__ */ (0, l.jsx)("input", {
											readOnly: !0,
											inputMode: "none",
											placeholder: "other",
											"aria-label": "Cash given (opens the number pad)",
											value: T,
											onClick: async () => {
												let e = await m.keypad({
													title: "<span>💵 Cash given<br><small>SAR</small></span>",
													value: Number(T) || 0,
													max: 1e5,
													root: le.current
												});
												e != null && E(e ? String(e) : "");
											}
										}),
										"   ",
										/* @__PURE__ */ (0, l.jsx)("b", {
											className: `ld-change${U != null && U < H ? " bad" : ""}`,
											children: U == null || !Number.isFinite(U) ? "" : U < H ? `short ${Y(H - U)}` : `change ${Y(U - H)}`
										})
									]
								})
							}),
							/* @__PURE__ */ (0, l.jsxs)("div", {
								className: `ld-bar${P ? " free" : ""}${N ? " bld" : ""}`,
								children: [
									/* @__PURE__ */ (0, l.jsxs)("div", {
										className: "ld-total",
										children: [
											/* @__PURE__ */ (0, l.jsx)("small", { children: Ve ? "TO PAY · 1 SAR / PIECE" : P ? "VALUE · STAFF" : N ? "BUILDING · NO PAYMENT" : "TOTAL · CASH" }),
											/* @__PURE__ */ (0, l.jsx)("b", { children: N ? V : Y(H) }),
											/* @__PURE__ */ (0, l.jsxs)("small", { children: [/* @__PURE__ */ (0, l.jsx)("span", { children: N ? "pieces" : "SAR" }), !N && /* @__PURE__ */ (0, l.jsxs)("span", { children: [
												" · ",
												V,
												" pcs"
											] })] })
										]
									}),
									/* @__PURE__ */ (0, l.jsx)("button", {
										type: "button",
										className: "ld-clear",
										"aria-label": "Clear the bill",
										onClick: () => {
											(!I.size || confirm("Clear this bill?")) && He();
										},
										children: "✖"
									}),
									/* @__PURE__ */ (0, l.jsxs)("button", {
										type: "button",
										className: "ld-save",
										disabled: !B.length || P && !b || Ee,
										onClick: () => void Ke(),
										children: [
											/* @__PURE__ */ (0, l.jsx)("span", {
												"aria-hidden": "true",
												children: "✔"
											}),
											" SAVE",
											P ? " · STAFF" : N ? " · BUILDING" : ""
										]
									})
								]
							})
						]
					}),
					(g === "slog" || g === "blog") && et(g === "blog" ? "building" : "free"),
					g === "cash" && tt()
				]
			}),
			O?.kind === "people" && /* @__PURE__ */ (0, l.jsxs)(u, {
				className: "ld-dlg ld-people",
				onClose: () => k(null),
				children: [/* @__PURE__ */ (0, l.jsxs)("div", {
					className: "ld-people-h",
					children: [/* @__PURE__ */ (0, l.jsxs)("h3", { children: ["👷 ", O.g.label] }), /* @__PURE__ */ (0, l.jsx)("button", {
						type: "button",
						"aria-label": "Close",
						onClick: () => k(null),
						children: "✖"
					})]
				}), /* @__PURE__ */ (0, l.jsx)("div", {
					className: "ld-people-grid",
					children: O.g.people.map((e) => /* @__PURE__ */ (0, l.jsxs)("button", {
						type: "button",
						className: "ld-person",
						onClick: () => void We(e),
						children: [
							e.photo ? /* @__PURE__ */ (0, l.jsx)("img", {
								src: e.photo,
								alt: ""
							}) : /* @__PURE__ */ (0, l.jsx)("span", {
								className: "nophoto",
								children: "👤"
							}),
							/* @__PURE__ */ (0, l.jsxs)("b", { children: [e.name, e.charged ? " 💵" : ""] }),
							/* @__PURE__ */ (0, l.jsx)("small", { children: [
								e.staff_code,
								e.department,
								e.room && "🚪 " + e.room
							].filter(Boolean).join(" · ") })
						]
					}, e.id))
				})]
			}),
			O?.kind === "approval" && /* @__PURE__ */ (0, l.jsx)(oe, {
				warnings: O.warnings,
				onClose: () => k(null),
				onApprove: (e) => {
					k(null), Ke(e);
				}
			}),
			O?.kind === "receipt" && /* @__PURE__ */ (0, l.jsxs)(u, {
				className: "ld-dlg ld-rdlg",
				onClose: () => k(null),
				children: [
					O.close === "➕ Next bill" && /* @__PURE__ */ (0, l.jsx)("div", {
						className: "ld-done",
						children: O.offline ? "⏳ Saved on this device — will send when online" : O.bill.kind === "free" ? "✅ Saved · STAFF" : O.bill.kind === "building" ? "✅ Saved · building linen" : `✅ Saved · ${Y(O.bill.paid)} SAR cash`
					}),
					O.warnings.length > 0 && /* @__PURE__ */ (0, l.jsxs)("div", {
						className: "ld-warn",
						children: ["⚠️ ", O.warnings.map((e, t) => /* @__PURE__ */ (0, l.jsxs)("span", { children: [t ? /* @__PURE__ */ (0, l.jsxs)(l.Fragment, { children: [/* @__PURE__ */ (0, l.jsx)("br", {}), "⚠️ "] }) : null, e] }, t))]
					}),
					Q(m.receiptHTML(O.bill, ve)),
					/* @__PURE__ */ (0, l.jsxs)("div", {
						className: "ld-dlg-b",
						children: [/* @__PURE__ */ (0, l.jsx)("button", {
							type: "button",
							onClick: () => m.printReceipt(O.bill, ve),
							children: "🖨 Print"
						}), /* @__PURE__ */ (0, l.jsx)("button", {
							type: "button",
							className: "ok",
							onClick: () => k(null),
							children: O.close
						})]
					})
				]
			})
		]
	});
}
function oe({ warnings: e, onClose: t, onApprove: n }) {
	let [r, i] = (0, c.useState)(""), [a, o] = (0, c.useState)("");
	return /* @__PURE__ */ (0, l.jsx)(u, {
		className: "ld-dlg",
		onClose: t,
		children: /* @__PURE__ */ (0, l.jsxs)("form", {
			className: "ld-appr",
			onSubmit: (e) => {
				e.preventDefault(), n({
					name: r.trim(),
					password: a
				});
			},
			children: [
				/* @__PURE__ */ (0, l.jsx)("h3", { children: "⚠️ Supervisor approval" }),
				/* @__PURE__ */ (0, l.jsx)("p", { children: e.map((e, t) => /* @__PURE__ */ (0, l.jsxs)("span", { children: [t ? /* @__PURE__ */ (0, l.jsx)("br", {}) : null, e] }, t)) }),
				/* @__PURE__ */ (0, l.jsxs)("label", { children: ["Supervisor login", /* @__PURE__ */ (0, l.jsx)("input", {
					autoComplete: "off",
					required: !0,
					value: r,
					onChange: (e) => i(e.target.value)
				})] }),
				/* @__PURE__ */ (0, l.jsxs)("label", { children: ["Password", /* @__PURE__ */ (0, l.jsx)("input", {
					type: "password",
					autoComplete: "off",
					required: !0,
					value: a,
					onChange: (e) => o(e.target.value)
				})] }),
				/* @__PURE__ */ (0, l.jsxs)("div", {
					className: "ld-dlg-b",
					children: [/* @__PURE__ */ (0, l.jsx)("button", {
						type: "button",
						onClick: t,
						children: "Cancel"
					}), /* @__PURE__ */ (0, l.jsx)("button", {
						type: "submit",
						className: "ok",
						children: "✔ Approve & save"
					})]
				})
			]
		})
	});
}
export { f as default };
