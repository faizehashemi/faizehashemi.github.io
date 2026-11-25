import { a as e, f as t, h as n, i as r, n as i, o as a, p as o, r as s, s as c, u as l } from "./PmsContext-BVMd13Oi.js";
import { a as u, n as d, o as f, t as p } from "./dialog-DtgtvZ4Q.js";
// src/pages/home/home.css?raw
var m = /* @__PURE__ */ n(o(), 1), h = "/* Home — welcome, today at a glance, Fakkul Ehraam counts, thaals (cream • gold • brown) */\n:root {\n    --bg: #f7efe1;\n    --panel: #fffaf1;\n    --ink: #2b1e15;\n    --muted: #3d3226;\n    --gold: #d4af37;\n    --gold-deep: #9a7414;\n    --edge: #e3d2b1;\n    --shade: 0 8px 24px rgba(92, 64, 28, .10);\n}\n\n* { box-sizing: border-box; }\n\nbody {\n    font: 14px/1.5 system-ui, -apple-system, \"Segoe UI\", Roboto, Arial, sans-serif;\n    background: var(--bg) url(\"assets/pattern_gold_2x.png\") repeat;\n    background-size: 150px auto;\n    margin: 0;\n    color: var(--ink);\n}\n\n.hm { max-width: none; margin: 0; padding: 18px 18px 30px; display: grid; gap: 18px; }\n\n/* ---------- hero ---------- */\n.hm-hero {\n    display: flex; flex-wrap: wrap; gap: 18px; align-items: flex-end; justify-content: space-between;\n    padding: 24px 26px; border-radius: 18px; color: #fffaf0;\n    background:\n        radial-gradient(120% 140% at 0% 0%, rgba(255, 236, 170, .35), transparent 55%),\n        linear-gradient(135deg, #7a5410 0%, #b8871d 45%, #d4af37 100%);\n    box-shadow: 0 14px 34px rgba(122, 84, 16, .28);\n}\n.hm-hello { min-width: 0; flex: 1 1 380px; }\n.hm-greet { margin: 0; font-size: 13px; letter-spacing: .14em; text-transform: uppercase; opacity: .9; }\n.hm-hero h1 { margin: 4px 0 6px; font-size: clamp(22px, 3.2vw, 32px); line-height: 1.2; font-weight: 800; text-shadow: 0 1px 2px rgba(0, 0, 0, .15); }\n.hm-praise { margin: 0; font-size: 15px; max-width: 60ch; opacity: .95; font-style: italic; }\n.hm-dates { text-align: right; display: grid; gap: 2px; }\n.hm-hijri { font: inherit; font-size: 19px; font-weight: 800; color: inherit; background: none; border: 0; padding: 0; cursor: pointer;\n    text-align: inherit; text-decoration: underline dotted rgba(255, 255, 255, .6); text-underline-offset: 5px; }\n.hm-hijri:hover { text-decoration-color: #fff; }\n.hm-greg { font-size: 14px; opacity: .92; }\n\n/* ---------- sections + stat tiles ---------- */\n.hm-section { display: grid; gap: 10px; }\n.hm-head { display: flex; flex-wrap: wrap; gap: 4px 12px; align-items: baseline; justify-content: space-between; }\n.hm-head h2, .hm-card h2 { margin: 0; font-size: 16px; color: var(--gold-deep); letter-spacing: .02em; }\n.hm-sub, .hm-muted { color: var(--muted-foreground); font-size: 12px; }\n.hm-muted.small { font-size: 11px; margin: 8px 0 0; }\n.hm-more { color: var(--gold-deep); font-size: 13px; font-weight: 600; text-decoration: none; }\n.hm-more:hover { text-decoration: underline; }\n\n.hm-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }\n.hm-stat {\n    position: relative; display: grid; gap: 2px; padding: 16px 16px 14px; border-radius: 14px;\n    background: var(--panel); border: 1px solid var(--edge); box-shadow: var(--shade);\n    color: inherit; text-decoration: none; overflow: hidden; min-width: 0;\n}\na.hm-stat:not([href]) { cursor: default; }\na.hm-stat:not([href]):hover { transform: none; box-shadow: var(--shade); }\na.hm-stat, button.hm-stat { transition: transform .12s ease, box-shadow .12s ease; cursor: pointer; }\na.hm-stat:hover, button.hm-stat:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(92, 64, 28, .16); }\nbutton.hm-stat { font: inherit; text-align: left; width: 100%; }\nbutton.hm-stat:focus-visible, a.hm-stat:focus-visible { outline: 3px solid var(--gold); outline-offset: 2px; }\n.hm-stat::before { content: \"\"; position: absolute; inset: 0 auto 0 0; width: 5px; background: var(--accent, var(--gold)); }\n.hm-stat .hm-ico { position: absolute; right: 12px; top: 10px; font-size: 26px; opacity: .85; }\n.hm-stat b { font-size: 32px; line-height: 1.1; font-weight: 800; color: var(--accent-ink, var(--ink)); font-variant-numeric: tabular-nums; }\n.hm-lbl { font-weight: 650; font-size: 13px; }\n.hm-stat small { color: #33291d; font-size: 13px; font-weight: 600; line-height: 1.35; }   /* the details line under each count: dark enough to read on every card colour */\n.hm-stat.in { --accent: #2f9e44; --accent-ink: #1f6f33; }\n.hm-stat.out { --accent: #d9480f; --accent-ink: #a8380b; }\n.hm-stat.mk { --accent: #3b3b3b; }\n.hm-stat.b { --accent: #f2a93b; }\n.hm-stat.l { --accent: #2a9fd6; }\n.hm-stat.d { --accent: #7c5cc4; }\n.hm-stat.fm { --accent: #e8590c; }\n.hm-stat.fn { --accent: #364fc7; }\n.hm-stat.fs { --accent: #0c8599; }\n.hm-stat.ta { --accent: #f1c232; }\n.hm-stat.tm { --accent: #2b8a3e; }\n.hm-stat.tj { --accent: #1c7ed6; }\n\n/* ---------- mega cards: one panel holding a row of tiles ---------- */\n.hm-mega { display: grid; gap: 12px; padding: 16px; border-radius: 18px; border: 1px solid var(--edge);\n    background: linear-gradient(180deg, #fff6e2, #fbefd6); box-shadow: var(--shade); }\n.hm-mega .hm-stat { background: #fffdf8; }\n\n/* ---------- cards ---------- */\n.hm-card { background: var(--panel); border: 1px solid var(--edge); border-radius: 14px; padding: 16px; box-shadow: var(--shade); min-width: 0; }\n.hm-card h2 { margin-bottom: 10px; }\n\n\n\n\n\n/* ---------- in-house calendar (calendar.js) ---------- */\ndialog.mc { width: min(980px, 96vw); max-height: 94vh; padding: 0; border: 0; border-radius: 16px; background: var(--panel); color: var(--ink);\n    box-shadow: 0 24px 60px rgba(40, 26, 6, .35); font: 14px/1.45 system-ui, -apple-system, \"Segoe UI\", Roboto, Arial, sans-serif; }\ndialog.mc::backdrop { background: rgba(30, 20, 5, .5); }\n.mc-wrap { display: flex; flex-direction: column; max-height: 94vh; }\n.mc-head { display: flex; align-items: center; gap: 6px; padding: 12px 14px; color: #fffaf0;\n    background: linear-gradient(135deg, #7a5410 0%, #b8871d 55%, #d4af37 100%); }\n.mc-title { flex: 1; display: grid; text-align: center; }\n.mc-title b { font-size: 19px; }\n.mc-title span { font-size: 12px; opacity: .9; }\n.mc-head button { font: inherit; cursor: pointer; border: 1px solid rgba(255, 255, 255, .55); background: rgba(255, 255, 255, .12); color: #fff; border-radius: 10px; }\n.mc-head button:hover { background: rgba(255, 255, 255, .25); }\n.mc-nav { width: 36px; height: 36px; font-size: 18px; }\n.mc-today { padding: 6px 12px; }\n.mc-head .mc-x { width: 36px; height: 36px; border: 0; background: none; font-size: 18px; }\n.mc-body { display: grid; grid-template-columns: minmax(0, 1fr) 280px; overflow: auto; }\n.mc-grid-wrap { padding: 12px 14px; }\n.mc-week, .mc-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; }\n.mc-week span { text-align: center; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--muted-foreground); padding-bottom: 4px; }\n.mc-day { position: relative; display: grid; align-content: start; gap: 2px; min-height: 64px; padding: 6px 6px 4px; text-align: left; cursor: pointer;\n    font: inherit; color: inherit; background: #fff; border: 1px solid #eadcc0; border-radius: 10px; }\n.mc-day:hover { border-color: var(--gold); background: #fffaf0; }\n.mc-day.fri { background: #fdf7ea; }\n.mc-day.has { border-color: #e4c983; }\n.mc-day.today { box-shadow: inset 0 0 0 2px #2f9e44; }\n.mc-day.sel { background: #f6e7bf; border-color: var(--gold-deep); }\n.mc-h { font-size: 20px; font-weight: 700; line-height: 1.1; }\n.mc-g { font-size: 11px; color: var(--muted-foreground); }\n.mc-mark { position: absolute; right: 5px; top: 4px; font-size: 13px; }\n.mc-mark .dot, .mc-legend .dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: var(--gold-deep); }\n.mc-legend { display: flex; flex-wrap: wrap; gap: 4px 14px; margin: 10px 0 0; font-size: 12px; color: var(--muted-foreground); }\n.mc-pad { min-height: 64px; }\n.mc-side { border-left: 1px solid var(--edge); padding: 14px; background: #fffdf7; }\n.mc-sel-h { font-size: 18px; font-weight: 800; color: var(--gold-deep); }\n.mc-sel-g { font-size: 13px; color: var(--muted-foreground); margin-bottom: 10px; }\n.mc-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }\n.mc-list li { display: grid; grid-template-columns: 18px 1fr; gap: 6px; }\n.mc-list li.major { font-weight: 700; color: var(--gold-deep); }\n.mc-list small { display: block; color: var(--muted-foreground); font-weight: 500; font-size: 12px; }\n.mc-none { color: var(--muted-foreground); }\n.mc-foot { padding: 8px 14px; border-top: 1px solid var(--edge); font-size: 11px; color: var(--muted-foreground); }\n@media (max-width: 760px) {\n    dialog.mc { width: 100vw; max-width: 100vw; height: 100dvh; max-height: 100dvh; margin: 0; border-radius: 0; }\n    .mc-wrap { max-height: 100dvh; height: 100%; }\n    .mc-body { grid-template-columns: 1fr; }\n    .mc-side { border-left: 0; border-top: 1px solid var(--edge); }\n    .mc-grid-wrap { padding: 8px; }\n    .mc-week, .mc-grid { gap: 3px; }\n    .mc-day, .mc-pad { min-height: 50px; padding: 4px; }\n    .mc-h { font-size: 16px; }\n    .mc-g { font-size: 10px; }\n    .mc-nav[data-go=\"-12\"], .mc-nav[data-go=\"12\"] { display: none; }\n}\n\n/* ---------- building occupancy (occupancy.js, the old Home tiles) ---------- */\n.hm-occ .battery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; min-height: 120px; }\n.hm-dc .dc-svg { min-height: 340px; } /* the chart's room before it is drawn (no jump) */\n.hm-occ .battery-card { border: 1px solid var(--edge); border-radius: 14px; padding: 12px; display: grid; gap: 8px; background: var(--panel); box-shadow: var(--shade); }\n.hm-occ .b-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }\n.hm-occ .b-name { font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.hm-occ .b-cap { color: var(--muted-foreground); font-size: 12px; }\n.hm-occ .cap-edit { display: flex; gap: 6px; align-items: center; }\n.hm-occ .cap-edit input { width: 80px; padding: 6px 8px; border: 1px solid var(--edge); border-radius: 10px; font: inherit; background: #fff; }\n.hm-occ .cap-edit button, .hm-occ .cap-link { font: inherit; font-size: 12px; font-weight: 650; padding: 6px 10px; border: 1px solid var(--edge); border-radius: 10px; background: #fffdf5; color: #8a6512; cursor: pointer; text-decoration: none; white-space: nowrap; }\n.hm-occ .cap-edit button:hover, .hm-occ .cap-link:hover { background: #fff6dd; }\n.hm-occ .battery { position: relative; height: 44px; border: 2px solid var(--edge); border-radius: 10px; overflow: hidden; display: flex; align-items: center; background: #fff; margin-right: 10px; }\n.hm-occ .battery::after { content: \"\"; position: absolute; right: -10px; width: 8px; height: 18px; background: var(--edge); border-radius: 3px; }\n.hm-occ .fill { height: 100%; transition: width .3s ease; background: linear-gradient(90deg, #f0d989, #d4af37); }\n.hm-occ .bad .fill { background: linear-gradient(90deg, #e78b7e, #c24a3a); }\n.hm-occ .warn .fill { background: linear-gradient(90deg, #f3c260, #d1901a); }\n.hm-occ .meter { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-variant-numeric: tabular-nums; font-weight: 700; text-shadow: 0 1px 0 rgba(255, 255, 255, .5); }\n.hm-occ .b-stats { display: flex; gap: 8px; justify-content: space-between; font-size: 12px; color: var(--muted-foreground); }\n.hm-occ .b-stats b { color: var(--ink); }\n/* ---------- guests day by day (Count in Makkah / Medina) ---------- */\n.hm-dc .dc-tools { display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: center; padding: 10px 12px; border: 1px solid var(--edge); border-radius: 12px; background: var(--panel); }\n.hm-dc .dc-tools label { display: inline-flex; gap: 6px; align-items: center; font-size: 13px; color: var(--muted-foreground); }\n.hm-dc .dc-tools input, .hm-dc .dc-tools select { font: inherit; font-size: 13px; padding: 4px 6px; border: 1px solid var(--edge); border-radius: 8px; background: #fff; color: var(--ink); }\n.hm-dc .dc-markh { color: #c62828; font-weight: 700; }\n.hm-dc .dc-btn { font: inherit; font-size: 12px; border: 1px solid var(--gold); border-radius: 999px; padding: 5px 12px; cursor: pointer; background: #fffdf5; color: var(--gold-deep); }\n.hm-dc .dc-btn:hover { background: #fff6dd; }\n.hm-dc .dc-expand { margin-left: auto; font-weight: 700; }\n.hm-dc .dc-fig { border: 1px solid var(--edge); border-radius: 14px; padding: 12px 12px 4px; background: #fbf3e2; box-shadow: var(--shade); min-width: 0; }\n.hm-dc .dc-title { margin: 2px 0 4px; text-align: center; font-size: 22px; font-weight: 800; color: #7f7f7f; letter-spacing: .02em; }\n.hm-dc .dc-title small { font-size: 14px; font-weight: 800; letter-spacing: .06em; }\n.hm-dc .dc-scroll { overflow-x: auto; }\n.hm-dc .dc-svg { display: block; max-width: none !important; }\n.hm-dc .dc-bar { fill: #ffc000; }\n.hm-dc .dc-bar:hover { fill: #e0a800; }\n.hm-dc .dc-bar.marked { fill: #e53935; }\n.hm-dc .dc-grid { stroke: #ead9b8; stroke-width: .8; }\n.hm-dc .dc-base { stroke: #bfbfbf; stroke-width: 1; }\n.hm-dc svg text { fill: #404040; font-size: 11px; font-variant-numeric: tabular-nums; }\n.hm-dc svg text.dc-axis { fill: #595959; }\n.hm-dc svg text.dc-count { font-weight: 600; }\n.hm-dc svg text.marked { fill: #c62828; font-weight: 800; }\n/* full view: the section covers the screen until Minimize / Esc */\n.hm-dc.full { position: fixed; inset: 0; z-index: 2000; overflow: auto; padding: 14px 18px; background: var(--bg); align-content: start; }\nbody.dc-noscroll { overflow: hidden; }\n\n/* ---------- smaller screens ---------- */\n@media (max-width: 980px) {\n    .hm-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }\n}\n@media (max-width: 640px) {\n    .hm { padding: 12px 12px 24px; gap: 14px; }\n    .hm-hero { padding: 18px; }\n    .hm-dates { text-align: left; }\n    .hm-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }\n    .hm-stats .hm-stat { padding: 12px 10px; }\n    .hm-stats .hm-ico { display: none; }\n    .hm-stat b { font-size: 26px; }\n}\n@media print { .hm-hero { box-shadow: none; } }\n\n/* ---------- \"Currently in …\" list (inhouse.js) ---------- */\ndialog.ih { width: min(1180px, 96vw); height: min(860px, 92vh); max-width: none; max-height: none; padding: 0; border: 0; border-radius: 16px;\n    background: var(--panel); color: var(--ink); box-shadow: 0 24px 60px rgba(40, 26, 6, .35);\n    font: 14px/1.45 system-ui, -apple-system, \"Segoe UI\", Roboto, Arial, sans-serif; }\ndialog.ih::backdrop { background: rgba(30, 20, 5, .5); }\n.ih-wrap { display: flex; flex-direction: column; height: 100%; }\n.ih-head { display: flex; align-items: flex-start; gap: 12px; padding: 14px 18px; color: #fffaf0;\n    background: linear-gradient(135deg, #7a5410 0%, #b8871d 55%, #d4af37 100%); }\n.ih-head > div { flex: 1; }\n.ih-head h2 { margin: 0; font-size: 19px; }\n.ih-head p { margin: 2px 0 0; font-size: 13px; opacity: .95; }\n.ih-bad { background: #fff; color: #a12a2a; padding: 0 8px; border-radius: 999px; }\n.ih-x { font: inherit; font-size: 18px; width: 36px; height: 36px; border: 0; background: none; color: #fff; cursor: pointer; border-radius: 10px; }\n.ih-x:hover { background: rgba(255, 255, 255, .2); }\n.ih-tools { display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: center; padding: 10px 18px; border-bottom: 1px solid var(--edge); }\n.ih-tools input[type=search] { flex: 1 1 260px; font: inherit; padding: 7px 10px; border: 1px solid var(--edge); border-radius: 8px; background: #fff; }\n.ih-tools select { font: inherit; padding: 7px 10px; border: 1px solid var(--edge); border-radius: 8px; background: #fff; }\n.ih-tools label { display: inline-flex; gap: 6px; align-items: center; font-size: 13px; white-space: nowrap; }\n.ih-list { flex: 1; overflow: auto; padding: 0 0 12px; }\n.ih-tbl { width: 100%; border-collapse: collapse; font-size: 13px; }\n.ih-tbl th { position: sticky; top: 0; z-index: 1; background: #f6ecd2; text-align: left; padding: 8px 10px; font-size: 12px; white-space: nowrap; border-bottom: 1px solid var(--edge); }\n.ih-tbl td { padding: 8px 10px; border-bottom: 1px solid #efe3cb; vertical-align: top; }\n.ih-tbl td small { display: block; color: var(--muted-foreground); font-size: 12px; }\n.ih-tbl .n { text-align: right; white-space: nowrap; }\n.ih-tbl .stay { white-space: nowrap; }\n.ih-tbl .sh { font-weight: 700; white-space: nowrap; }\n.ih-tbl .sh a { color: var(--gold-deep); }\n.ih-tbl tr.bad { background: #fff7f5; }\n.ih-tbl .chk ul { margin: 0; padding-left: 16px; color: #a12a2a; font-size: 12px; }\n.ih-tbl .chk .ok { color: #2f7d32; font-weight: 700; }\n.ih-empty { padding: 20px 18px; color: var(--muted-foreground); }\n@media (max-width: 760px) {\n    dialog.ih { width: 100vw; height: 100dvh; max-height: 100dvh; margin: 0; border-radius: 0; }\n    .ih-head, .ih-tools { padding-left: 12px; padding-right: 12px; }\n    /* rows as cards on phones */\n    .ih-tbl thead { display: none; }\n    .ih-tbl, .ih-tbl tbody, .ih-tbl tr, .ih-tbl td { display: block; width: auto; }\n    .ih-tbl tr { margin: 10px 12px; border: 1px solid var(--edge); border-radius: 12px; background: #fff; padding: 6px 4px; }\n    .ih-tbl tr.bad { border-color: #e6bcbc; }\n    .ih-tbl td { border: 0; padding: 4px 10px; text-align: left; }\n    .ih-tbl .n { text-align: left; display: inline-block; }\n    .ih-tbl .sh { font-size: 15px; }\n}\n\n.hm-more[hidden] { display: none; }\n\n/* ---------- transport list behind a Transport tile (transport.js) ---------- */\n.ih-tbl td.bus { text-align: center; font-weight: 800; font-size: 16px; width: 60px; }\n.ih-tbl tr.rider td { background: #fffbea; }\n.ih-tbl tr.rider td.bus { color: var(--muted-foreground); font-size: 12px; font-weight: 600; }\n.ih-tbl tr.past td { opacity: .55; }\n\n/* ---------- look ahead: another day / a period summary ---------- */\n.hm-tt { padding: 10px 14px; border-radius: 14px; border: 1px solid var(--edge); background: var(--panel); box-shadow: var(--shade); }\n.hm-tt-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }\n.hm-tt-lbl { font-weight: 800; color: var(--gold-deep); font-size: 14px; }\n.hm-tt input[type=date] { font: inherit; padding: 6px 8px; border: 1px solid var(--edge); border-radius: 8px; background: #fff; }\n.hm-tt-btn { font: inherit; font-weight: 700; padding: 6px 12px; border-radius: 8px; border: 1px solid var(--gold); background: #fff; color: #7a5b13; cursor: pointer; }\n.hm-tt-btn:hover { background: #fff6dd; }\n.hm-tt-btn.go { background: linear-gradient(#e6c65a, #d4af37); border-color: #b8931f; color: #3b2a06; }\n.hm-tt-sep { flex: 0 0 1px; align-self: stretch; background: var(--edge); margin: 0 4px; }\n.hm-tt #ttForecast { margin-left: auto; }\n.hm-tt-note { margin: 8px 0 0; padding: 6px 10px; border-radius: 8px; background: #fff4d6; border: 1px solid #ecd9a6; color: #7a4d00; font-size: 13px; font-weight: 600; }\n.hm.travel .hm-section:first-of-type, .hm.travel .hm-mega.fe, .hm.travel .hm-mega.meals, .hm.travel .hm-occ { outline: 2px dashed #e0b24a; outline-offset: 4px; border-radius: 14px; }\n@media (max-width: 640px) { .hm-tt-sep { display: none; } .hm-tt #ttForecast { margin-left: 0; } }\n\n/* period summary window */\n.ts-tbl td, .ts-tbl th { text-align: center; }\n.ts-tbl td:first-child, .ts-tbl th:first-child { text-align: left; }\n.ts-tbl tbody tr { cursor: pointer; }\n.ts-tbl tbody tr:hover { background: #fff6dd; }\n.ts-tbl tfoot td { font-weight: 800; background: #f6ecd2; border-top: 2px solid var(--edge); }\n.ts-tbl .grp { font-size: 11px; color: var(--muted-foreground); display: block; font-weight: 500; }\n.ts-tbl .wk { font-size: 11px; color: var(--muted-foreground); display: block; }\n\n/* delayed departures card (core/stay.js) */\n.hm-stats.four { grid-template-columns: repeat(4, minmax(0, 1fr)); }\n.hm-stat.dls { --accent: #a8471d; }\n.hm-stat.dlu { --accent: #a12a2a; --accent-ink: #a12a2a; }\n.hm-stat.dlt { --accent: #2a9fd6; }\n.hm-stat.dlc { --accent: #c0392b; --accent-ink: #c0392b; }\n@media (max-width: 640px) { .hm-stats.four { grid-template-columns: repeat(2, minmax(0, 1fr)); } }\n\n\n/* ---------- board: tall mega cards side by side (wide screens); on a phone the cards keep the stacked rows above ---------- */\n.hm-board { display: grid; gap: 18px; align-items: stretch; }\n.hm-board [hidden] { display: none !important; }\n.hm-mega.glance { background: linear-gradient(180deg, #fff6e2, #fbefd6); }\n@media (min-width: 900px) {\n    .hm-board { grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); }\n    .hm-board .hm-mega { align-content: start; }\n    .hm-board .hm-stats, .hm-board .hm-stats.four, .hm-board .hm-stats.meals { grid-template-columns: minmax(0, 1fr); }\n    .hm-board .hm-head { display: grid; gap: 2px; }\n}\n", g = (e) => String(e).padStart(2, "0"), _ = (e) => `${e.getFullYear()}-${g(e.getMonth() + 1)}-${g(e.getDate())}`, v = (e, t) => {
	if (!e) return null;
	let n = /* @__PURE__ */ new Date(`${e}T${t && t.length ? t : "00:00"}`);
	return isNaN(+n) ? null : n;
}, y = (e) => {
	let t = Number(e);
	return Number.isFinite(t) ? t : 0;
}, b = (e) => y(e.total) || y(e.gents) + y(e.ladies) + y(e.children) + y(e.infants), x = (e, t) => {
	let n = /* @__PURE__ */ new Date(`${e}T12:00`);
	return n.setDate(n.getDate() + t), _(n);
}, ee = [
	"The guests of Allah are in wonderful hands today.",
	"Your care turns a room number into a home away from home.",
	"Calm, careful and kind — the desk simply runs better when you are on it.",
	"You make the busiest day at the desk look effortless.",
	"Every pilgrim who rests well tonight owes a little of it to you.",
	"Thank you for the patience you pour into every check-in.",
	"Organised, generous with your time and always on top of it — shukran.",
	"May Allah accept and reward the khidmat you do for His guests.",
	"Your attention to detail keeps hundreds of families comfortable.",
	"The smile at the desk starts with you — thank you for it."
], te = (e, t) => {
	let n = 0;
	for (let e of `${_(/* @__PURE__ */ new Date())}|${t}`) n = n * 31 + e.charCodeAt(0) >>> 0;
	return e[n % e.length];
};
function S(e, t, n, r, i, a, o) {
	let s = e === _(/* @__PURE__ */ new Date()), c = s ? /* @__PURE__ */ new Date() : /* @__PURE__ */ new Date(`${e}T12:00`), l = /* @__PURE__ */ new Date(`${e}T03:00`), u = /* @__PURE__ */ new Date(+l + 864e5), d = (e) => !!e && e >= l && e < u, f = t.filter((e) => d(v(e.checkin_date, e.checkin_time))), p = t.flatMap((e) => a.departuresOf(e).filter((e) => d(new Date(e.at))).map((t) => ({
		r: e,
		pax: a.isDelayed(e) ? a.paxAt(e, t.at - 1).total - a.paxAt(e, t.at).total : b(e)
	}))), m = [...new Set(p.map((e) => e.r))], h = n.filter((e) => e.site === r).filter((e) => a.presentAt(e, +c)), g = (t, n = 0) => {
		let r = /* @__PURE__ */ new Date(`${e}T${t}`);
		return r.setDate(r.getDate() + n), r;
	}, y = n.filter((e) => e.site === "makkah"), x = (e, t, n = () => !0) => ({
		from: e,
		to: t,
		items: y.filter(n).filter((n) => {
			let r = v(n.checkin_date, n.checkin_time);
			return !!r && r >= e && r < t;
		}).map((e) => ({
			r: e,
			pax: b(e)
		}))
	}), ee = (e) => /^S/i.test(String(e.sh_no ?? "").trim()), { morning_from: te, split: S, night_to: C } = i, w = {
		morning: x(g(te, -1), g(S)),
		night: x(g(S), g(C)),
		madina: x(g(S), g(C), ee)
	};
	return {
		day: e,
		isToday: s,
		t: c,
		ins: f,
		outs: m,
		inPax: ((e) => e.reduce((e, t) => e + b(t), 0))(f),
		outPax: p.reduce((e, t) => e + t.pax, 0),
		mk: h,
		mkPax: h.reduce((e, t) => e + a.paxAt(t, +c).total, 0),
		fe: w,
		fePax: Object.fromEntries(Object.entries(w).map(([e, t]) => [e, t.items.reduce((e, t) => e + t.pax, 0)])),
		meals: o.mealThalsFor(t, e),
		mealsWho: o.mealGuestsFor(t, e)
	};
}
// src/pages/home/HomePage.tsx
var C = t(), w = (e) => `${e} group${e === 1 ? "" : "s"}`, ne = "<div class=\"hm-head\"><h2 id=\"hmDcTitle\">Guests day by day</h2><span class=\"hm-sub\">Guests in house at 12:00 each day, by city. Hover a bar for the date and count.</span></div>\n        <div class=\"dc-tools\"><label>From <input type=\"date\" class=\"dc-from\"></label><label>To <input type=\"date\" class=\"dc-to\"></label><label>Each bar <select class=\"dc-step\"></select></label>\n            <label class=\"dc-hl\">Highlight <input type=\"date\" class=\"dc-mark\"><span class=\"dc-markh\"></span></label><button type=\"button\" class=\"dc-btn dc-clear\">Clear</button>\n            <button type=\"button\" class=\"dc-btn dc-today\">Reset</button><button type=\"button\" class=\"dc-btn dc-expand\" aria-pressed=\"false\">⤢ Full view</button></div>\n        <div class=\"dc-fig\" data-site=\"makkah\"><h3 class=\"dc-title\">Count in <span class=\"dc-city\"></span> <small class=\"dc-mode\">(DAY WISE)</small></h3><div class=\"dc-scroll\"><svg class=\"dc-svg\" role=\"img\" aria-label=\"Guests in Makkah by day\"></svg></div></div>\n        <div class=\"dc-fig\" data-site=\"medina\"><h3 class=\"dc-title\">Count in <span class=\"dc-city\"></span> <small class=\"dc-mode\">(DAY WISE)</small></h3><div class=\"dc-scroll\"><svg class=\"dc-svg\" role=\"img\" aria-label=\"Guests in Medina by day\"></svg></div></div>", re = "<div class=\"hm-head\"><h2 id=\"hmOccTitle\">Building occupancy</h2><span class=\"hm-sub\">Share of each building's beds in use today. Capacities come from Rooms &amp; Buildings.</span></div><div class=\"battery-grid\"></div>";
function T() {
	let { cloud: t, stay: n, settings: o, rooms: g, transport: v } = i(), y = v, b = o, T = s(), E = r(), D = e(), ie = a(), { site: O, siteId: k } = l(), { href: A } = c(), j = t.currentDesk(), M = (0, m.useRef)(null), N = (0, m.useRef)(null), P = (0, m.useRef)(null), [F, ae] = (0, m.useState)(null), [I, L] = (0, m.useState)(_(/* @__PURE__ */ new Date())), [R, oe] = (0, m.useState)(b.DEFAULTS.fe_windows), [z, se] = (0, m.useState)([]), [B, ce] = (0, m.useState)([]), [le, ue] = (0, m.useState)(null), [de, fe] = (0, m.useState)(!1), [V, pe] = (0, m.useState)(null), [H, U] = (0, m.useState)(null), [W, me] = (0, m.useState)({
		a: I,
		b: x(I, 6)
	}), [he, ge] = (0, m.useState)(0), _e = `pms_home_dl_shown:${k}`, [ve] = (0, m.useState)(() => {
		try {
			return localStorage.getItem(_e) === "1";
		} catch {
			return !1;
		}
	});
	(0, m.useEffect)(() => {
		(async () => {
			let [e, t] = await Promise.all([ie("meals"), ie("hijri")]);
			ae((n) => ({
				...n || {},
				meals: e,
				hijri: t
			}));
			let [n, r, i, a, o, s] = await Promise.all([
				D("views/home/calendar.js"),
				D("views/home/inhouse.js"),
				D("views/home/groups.js"),
				D("views/home/transport.js"),
				D("views/home/occupancy.js"),
				D("views/home/daycount.js")
			]);
			ae((e) => ({
				...e || {},
				cal: n,
				inh: r,
				grp: i,
				tr: a,
				occ: o,
				dc: s
			}));
		})();
		let e = () => location.reload();
		window.addEventListener("pms:desk-changed", e);
		let t = setInterval(() => ge((e) => e + 1), 6e4);
		return () => {
			window.removeEventListener("pms:desk-changed", e), clearInterval(t);
		};
	}, []);
	let ye = (0, m.useCallback)(async () => {
		E(b.loadSettings()).then((e) => {
			e && oe((t) => ({
				...t,
				...e.settings.fe_windows || {}
			}));
		}, () => {}), E(g.loadBuildings({ force: !0 })).catch(() => null);
		let [e, n] = await Promise.all([T.all(), E(t.mirrorAll())]);
		se(e), ce(n.filter((e) => !e.deleted));
	}, []);
	(0, m.useEffect)(() => {
		ye().catch((e) => console.warn("home numbers", e));
	}, [ye, Math.floor(he / 2)]);
	let be = (0, m.useCallback)(async () => {
		let e = await E(y.loadDay(k, y.today()));
		ue(y.signage(e.rows, k)), fe(!!e.version);
	}, []);
	(0, m.useEffect)(() => {
		be().catch((e) => console.warn("home transport", e));
	}, [be, he]);
	let G = (0, m.useMemo)(() => F ? S(I, z, B.length ? B : z, k, R, n, F.meals) : null, [
		F,
		I,
		z,
		B,
		R
	]);
	(0, m.useEffect)(() => {
		(async () => {
			let e = Date.now(), t = z.filter((t) => !t.deleted && n.isDelayed(t) && n.slipEnd(t) > e);
			try {
				localStorage.setItem(_e, t.length ? "1" : "0");
			} catch {}
			if (!t.length) {
				pe(null);
				return;
			}
			let r = await E(g.loadBuildings()), i = (e, t) => g.builderCapacity(r, e, t), a = _(/* @__PURE__ */ new Date()), o = t.filter((t) => n.presentAt(t, e)).map((t) => ({
				r: t,
				pax: n.paxAt(t, e).total
			})), s = t.map((t) => ({
				r: t,
				pax: n.rowsOf(t).filter((t) => t.end > e && t.status === "unknown").reduce((e, t) => e + t.beds, 0)
			})).filter((e) => e.pax), c = t.map((t) => ({
				r: t,
				pax: n.departuresOf(t).filter((t) => t.at > e && _(new Date(t.at)) === a).reduce((e, r) => e + n.paxAt(t, r.at - 1).total - n.paxAt(t, r.at).total, 0)
			})).filter((e) => e.pax), l = t.map((t) => ({
				r: t,
				n: n.roomConflicts(t, z, i, e).filter((e) => e.clash).length
			})).filter((e) => e.n).map((e) => ({
				r: e.r,
				pax: e.n
			})), u = (t) => [...new Set(n.rowsOf(t).filter((t) => t.end > e && t.start <= e).map((e) => e.room_no))], d = (e) => e.map((e) => ({
				...e,
				rooms: u(e.r)
			}));
			pe({
				stay: d(o),
				unknown: d(s),
				leaving: d(c),
				clash: d(l)
			});
		})().catch((e) => console.warn("home delayed", e));
	}, [z]), (0, m.useEffect)(() => {
		F?.occ && N.current && F.occ.renderOccupancy({
			guard: E,
			siteId: k,
			href: A
		}, N.current, z, I).then(() => {
			let e = N.current?.querySelector(".hm-head .hm-sub");
			e && (e.textContent = `Share of each building's beds in use ${G?.isToday ? "today" : (/* @__PURE__ */ new Date(`${I}T12:00`)).toLocaleDateString(void 0, {
				weekday: "short",
				day: "numeric",
				month: "short"
			})}. Capacities come from Rooms & Buildings.`);
		});
	}, [
		F,
		z,
		I
	]), (0, m.useEffect)(() => {
		F?.dc && P.current && B.length && F.dc.renderDayCounts(P.current, B);
	}, [F, B]);
	let xe = (e) => t.canOpen("slip", j) && (j?.role === "admin" || j?.site === e), Se = (e) => (t) => `#/${e}/slip?sh_no=${encodeURIComponent(t)}`, K = (e, t, n, r, i) => F?.grp?.openGroupList({
		title: t,
		sub: n,
		items: r,
		paxLabel: i,
		host: M.current,
		canOpen: xe(e),
		slipHref: Se(e)
	}), q = k === "medina" ? "Madina" : "Makkah", J = /* @__PURE__ */ new Date(), Y = J.getHours(), Ce = Y < 5 ? "Good night" : Y < 12 ? "Good morning" : Y < 17 ? "Good afternoon" : "Good evening", X = !G || G.isToday ? "today" : (/* @__PURE__ */ new Date(`${I}T12:00`)).toLocaleDateString(void 0, {
		weekday: "short",
		day: "numeric",
		month: "short"
	}), we = (e) => e.toLocaleString(void 0, {
		weekday: "short",
		hour: "2-digit",
		minute: "2-digit"
	}), { morning_from: Te, split: Z, night_to: Ee } = R, De = {
		summary: "ta",
		long: "tm",
		airport: "tj"
	}, Oe = y.destsFor(k), ke = (e) => (V?.[e] ?? []).reduce((e, t) => e + t.pax, 0);
	async function Ae() {
		let e = await E(t.mirrorAll());
		F?.inh && F.inh.openInHouse({
			site: k,
			label: q,
			slips: e,
			canOpen: xe(k),
			host: M.current,
			slipHref: Se(k)
		});
	}
	async function je() {
		let { a: e, b: r } = W;
		if (!e || !r) return;
		e > r && ([e, r] = [r, e]);
		let i = [];
		for (let t = e; t <= r && i.length < 92; t = x(t, 1)) i.push(t);
		let a = await T.all(), o = (await E(t.mirrorAll())).filter((e) => !e.deleted);
		U({
			rows: i.map((e) => S(e, a, o, k, R, n, F.meals)),
			cut: i.length === 92 && i[91] < r
		});
	}
	if (!F || !G) return /* @__PURE__ */ (0, C.jsxs)(C.Fragment, { children: [/* @__PURE__ */ (0, C.jsx)("style", { children: h }), /* @__PURE__ */ (0, C.jsx)("div", {
		className: "hm",
		children: /* @__PURE__ */ (0, C.jsx)("p", {
			className: "hm-sub",
			style: { padding: 16 },
			children: "Loading…"
		})
	})] });
	let { toHijri: Me, formatHijri: Ne } = F.hijri, Pe = [
		[
			"fm",
			"morning",
			"🌄",
			"Morning",
			`${Te} the day before – ${Z}`,
			"Fakkul Ehraam · Morning"
		],
		[
			"fn",
			"night",
			"🌃",
			"Night",
			`${Z} – ${Ee}, with Madina`,
			"Fakkul Ehraam · Night"
		],
		[
			"fs",
			"madina",
			"🕌",
			"Night · from Madina only",
			`${Z} – ${Ee}, SH starting with S`,
			"Fakkul Ehraam · Night, from Madina"
		]
	], Q = (e, t) => e.meals ? e.meals[t] : "—", $ = (e, t) => e.reduce((e, n) => e + t(n), 0);
	return /* @__PURE__ */ (0, C.jsxs)(C.Fragment, { children: [
		/* @__PURE__ */ (0, C.jsx)("style", { children: h }),
		/* @__PURE__ */ (0, C.jsxs)("div", {
			ref: M,
			className: `hm${G.isToday ? "" : " travel"}`,
			children: [
				/* @__PURE__ */ (0, C.jsxs)("header", {
					className: "hm-hero",
					children: [/* @__PURE__ */ (0, C.jsxs)("div", {
						className: "hm-hello",
						children: [/* @__PURE__ */ (0, C.jsxs)("h1", { children: [
							Ce,
							", ",
							j?.name || "friend"
						] }), /* @__PURE__ */ (0, C.jsx)("p", {
							className: "hm-praise",
							children: te(ee, j?.name || "")
						})]
					}), /* @__PURE__ */ (0, C.jsxs)("div", {
						className: "hm-dates",
						children: [/* @__PURE__ */ (0, C.jsx)("button", {
							type: "button",
							className: "hm-hijri",
							title: "Open the calendar",
							onClick: () => void F.cal?.openCalendar({
								host: M.current,
								date: /* @__PURE__ */ new Date()
							}),
							children: Ne(Me(J))
						}), /* @__PURE__ */ (0, C.jsx)("div", {
							className: "hm-greg",
							children: J.toLocaleDateString(void 0, {
								weekday: "long",
								day: "numeric",
								month: "long",
								year: "numeric"
							})
						})]
					})]
				}),
				/* @__PURE__ */ (0, C.jsxs)("section", {
					className: "hm-tt",
					id: "hmTt",
					"aria-label": "Look at another day",
					children: [/* @__PURE__ */ (0, C.jsxs)("div", {
						className: "hm-tt-row",
						children: [
							/* @__PURE__ */ (0, C.jsx)("span", {
								className: "hm-tt-lbl",
								children: "📅 Look ahead"
							}),
							/* @__PURE__ */ (0, C.jsx)("button", {
								type: "button",
								className: "hm-tt-btn",
								"aria-label": "Day before",
								onClick: () => L(x(I, -1)),
								children: "◀"
							}),
							/* @__PURE__ */ (0, C.jsx)("input", {
								type: "date",
								"aria-label": "Show the cards for this day",
								value: I,
								onChange: (e) => e.target.value && L(e.target.value)
							}),
							/* @__PURE__ */ (0, C.jsx)("button", {
								type: "button",
								className: "hm-tt-btn",
								"aria-label": "Day after",
								onClick: () => L(x(I, 1)),
								children: "▶"
							}),
							/* @__PURE__ */ (0, C.jsx)("button", {
								type: "button",
								className: "hm-tt-btn",
								onClick: () => L(_(/* @__PURE__ */ new Date())),
								children: "Today"
							}),
							/* @__PURE__ */ (0, C.jsx)("span", { className: "hm-tt-sep" }),
							/* @__PURE__ */ (0, C.jsx)("span", {
								className: "hm-tt-lbl",
								children: "Summary"
							}),
							/* @__PURE__ */ (0, C.jsx)("input", {
								type: "date",
								"aria-label": "Summary from",
								value: W.a,
								onChange: (e) => me((t) => ({
									...t,
									a: e.target.value
								}))
							}),
							" ",
							/* @__PURE__ */ (0, C.jsx)("span", {
								className: "hm-sub",
								children: "to"
							}),
							" ",
							/* @__PURE__ */ (0, C.jsx)("input", {
								type: "date",
								"aria-label": "Summary to",
								value: W.b,
								onChange: (e) => me((t) => ({
									...t,
									b: e.target.value
								}))
							}),
							/* @__PURE__ */ (0, C.jsx)("button", {
								type: "button",
								className: "hm-tt-btn go",
								onClick: () => void je(),
								children: "Show summary"
							}),
							t.canOpen("forecast", j) && /* @__PURE__ */ (0, C.jsx)("a", {
								className: "hm-more",
								href: A("forecast"),
								children: "Open Forecast →"
							})
						]
					}), !G.isToday && /* @__PURE__ */ (0, C.jsxs)("p", {
						className: "hm-tt-note",
						children: [
							"Showing ",
							(/* @__PURE__ */ new Date(`${I}T12:00`)).toLocaleDateString(void 0, {
								weekday: "long",
								day: "numeric",
								month: "long",
								year: "numeric"
							}),
							" — from the slips as they are now. Transport stays on today."
						]
					})]
				}),
				/* @__PURE__ */ (0, C.jsxs)("div", {
					className: "hm-board",
					children: [
						/* @__PURE__ */ (0, C.jsxs)("section", {
							className: "hm-mega glance",
							"aria-labelledby": "hmTodayTitle",
							children: [/* @__PURE__ */ (0, C.jsxs)("div", {
								className: "hm-head",
								children: [/* @__PURE__ */ (0, C.jsx)("h2", {
									id: "hmTodayTitle",
									children: G.isToday ? "Today at a glance" : `${X} at a glance`
								}), /* @__PURE__ */ (0, C.jsxs)("span", {
									className: "hm-sub",
									children: [
										"Check-ins and check-outs from 03:00 ",
										G.isToday ? "today" : X,
										" to 03:00 the next day · ",
										O.label
									]
								})]
							}), /* @__PURE__ */ (0, C.jsxs)("div", {
								className: "hm-stats",
								children: [
									/* @__PURE__ */ (0, C.jsxs)("a", {
										className: "hm-stat in",
										id: "stIn",
										href: t.canOpen("checkins", j) ? A("checkins") : void 0,
										children: [
											/* @__PURE__ */ (0, C.jsx)("span", {
												className: "hm-ico",
												"aria-hidden": "true",
												children: "🛬"
											}),
											/* @__PURE__ */ (0, C.jsx)("b", { children: G.inPax }),
											/* @__PURE__ */ (0, C.jsxs)("span", {
												className: "hm-lbl",
												children: ["Check-ins ", X]
											})
										]
									}),
									/* @__PURE__ */ (0, C.jsxs)("a", {
										className: "hm-stat out",
										id: "stOut",
										href: t.canOpen("checkins", j) ? A("checkins") : void 0,
										children: [
											/* @__PURE__ */ (0, C.jsx)("span", {
												className: "hm-ico",
												"aria-hidden": "true",
												children: "🧳"
											}),
											/* @__PURE__ */ (0, C.jsx)("b", { children: G.outPax }),
											/* @__PURE__ */ (0, C.jsxs)("span", {
												className: "hm-lbl",
												children: ["Check-outs ", X]
											})
										]
									}),
									/* @__PURE__ */ (0, C.jsxs)("button", {
										type: "button",
										className: "hm-stat mk",
										id: "stMakkah",
										title: `See every group staying in ${q} now`,
										onClick: () => void Ae(),
										children: [
											/* @__PURE__ */ (0, C.jsx)("span", {
												className: "hm-ico",
												"aria-hidden": "true",
												children: k === "medina" ? "🕌" : "🕋"
											}),
											/* @__PURE__ */ (0, C.jsx)("b", { children: G.mkPax }),
											/* @__PURE__ */ (0, C.jsx)("span", {
												className: "hm-lbl",
												children: G.isToday ? `Currently in ${q}` : `In ${q} ${X}`
											})
										]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, C.jsxs)("section", {
							className: "hm-mega fe",
							"aria-labelledby": "hmFeTitle",
							children: [/* @__PURE__ */ (0, C.jsxs)("div", {
								className: "hm-head",
								children: [/* @__PURE__ */ (0, C.jsxs)("h2", {
									id: "hmFeTitle",
									children: ["🕋 Fakkul Ehraam counts", G.isToday ? "" : ` · ${X}`]
								}), /* @__PURE__ */ (0, C.jsx)("span", {
									className: "hm-sub",
									children: "Arrivals in Makkah · tap a card for the groups"
								})]
							}), /* @__PURE__ */ (0, C.jsx)("div", {
								className: "hm-stats",
								children: Pe.map(([e, t, n, r, i, a]) => /* @__PURE__ */ (0, C.jsxs)("button", {
									type: "button",
									className: `hm-stat ${e}`,
									onClick: () => {
										let e = G.fe[t];
										K("makkah", a, `arrivals ${we(e.from)} → ${we(e.to)}`, e.items);
									},
									children: [
										/* @__PURE__ */ (0, C.jsx)("span", {
											className: "hm-ico",
											"aria-hidden": "true",
											children: n
										}),
										/* @__PURE__ */ (0, C.jsx)("b", { children: G.fePax[t] }),
										/* @__PURE__ */ (0, C.jsx)("span", {
											className: "hm-lbl",
											children: r
										})
									]
								}, t))
							})]
						}),
						/* @__PURE__ */ (0, C.jsxs)("section", {
							className: "hm-mega dl",
							"aria-labelledby": "hmDlTitle",
							hidden: !V && !ve || !V,
							children: [/* @__PURE__ */ (0, C.jsxs)("div", {
								className: "hm-head",
								children: [/* @__PURE__ */ (0, C.jsx)("h2", {
									id: "hmDlTitle",
									children: "✈️ Delayed departures"
								}), t.canOpen("departures", j) && /* @__PURE__ */ (0, C.jsx)("a", {
									className: "hm-more",
									href: A("departures"),
									children: "Open Delayed departures →"
								})]
							}), /* @__PURE__ */ (0, C.jsx)("div", {
								className: "hm-stats four",
								children: [
									[
										"dls",
										"stay",
										"🏨",
										"Staying, delayed",
										"Delayed — staying now",
										"guests",
										(e) => `${w(e.length)} in house now`
									],
									[
										"dlu",
										"unknown",
										"❔",
										"Unknown date",
										"Delayed — unknown date",
										"beds held",
										(e) => `beds held · ${w(e.length)}`
									],
									[
										"dlt",
										"leaving",
										"🛫",
										"Leaving today",
										"Delayed — leaving today",
										"guests",
										(e) => `guests · ${w(e.length)}`
									],
									[
										"dlc",
										"clash",
										"⚠️",
										"Rooms clashing",
										"Delayed — rooms clashing with the next group",
										"rooms",
										(e) => e.length ? `rooms · ${w(e.length)} — open the page` : "none"
									]
								].map(([e, t, n, r, i, a, o]) => /* @__PURE__ */ (0, C.jsxs)("button", {
									type: "button",
									className: `hm-stat ${e}`,
									onClick: () => {
										V?.[t]?.length && K(k, i, O.label, V[t], a);
									},
									children: [
										/* @__PURE__ */ (0, C.jsx)("span", {
											className: "hm-ico",
											"aria-hidden": "true",
											children: n
										}),
										/* @__PURE__ */ (0, C.jsx)("b", { children: ke(t) }),
										/* @__PURE__ */ (0, C.jsx)("span", {
											className: "hm-lbl",
											children: r
										})
									]
								}, t))
							})]
						}),
						/* @__PURE__ */ (0, C.jsxs)("section", {
							className: "hm-mega tr",
							"aria-labelledby": "hmTrTitle",
							children: [/* @__PURE__ */ (0, C.jsxs)("div", {
								className: "hm-head",
								children: [/* @__PURE__ */ (0, C.jsx)("h2", {
									id: "hmTrTitle",
									children: "🚌 Transport today"
								}), t.canOpen("transport", j) && /* @__PURE__ */ (0, C.jsx)("a", {
									className: "hm-more",
									href: A("transport"),
									children: "Open Transport →"
								})]
							}), /* @__PURE__ */ (0, C.jsx)("div", {
								className: "hm-stats",
								children: Oe.map((e) => {
									let n = le?.find((t) => t.dest.id === e.id);
									return n?.buses.length && n.buses.reduce((e, t) => e.at < t.at ? e : t).at, /* @__PURE__ */ (0, C.jsxs)("button", {
										type: "button",
										className: `hm-stat ${De[e.tosha] || "tj"}`,
										onClick: () => n && F.tr?.openTransportList({
											title: `Transport today · ${n.dest.title}`,
											sub: O.label,
											group: n,
											host: M.current,
											dayHref: t.canOpen("transport", j) ? A("transport") : ""
										}),
										children: [
											/* @__PURE__ */ (0, C.jsx)("span", {
												className: "hm-ico",
												"aria-hidden": "true",
												children: e.icon
											}),
											/* @__PURE__ */ (0, C.jsx)("b", { children: n ? n.pax : "—" }),
											/* @__PURE__ */ (0, C.jsx)("span", {
												className: "hm-lbl",
												children: e.title
											})
										]
									}, e.id);
								})
							})]
						}),
						/* @__PURE__ */ (0, C.jsxs)("section", {
							className: "hm-mega meals",
							"aria-labelledby": "hmMealsTitle",
							children: [/* @__PURE__ */ (0, C.jsxs)("div", {
								className: "hm-head",
								children: [/* @__PURE__ */ (0, C.jsxs)("h2", {
									id: "hmMealsTitle",
									children: [
										"Thaals ",
										X,
										" · ",
										O.label
									]
								}), t.canOpen("mawaid", j) && /* @__PURE__ */ (0, C.jsx)("a", {
									className: "hm-more",
									href: A("mawaid"),
									children: "Open Mawaid →"
								})]
							}), /* @__PURE__ */ (0, C.jsx)("div", {
								className: "hm-stats meals",
								children: [
									[
										"b",
										"B",
										"🌅",
										"Breakfast",
										"breakfast"
									],
									[
										"l",
										"L",
										"☀️",
										"Lunch",
										"lunch"
									],
									[
										"d",
										"D",
										"🌙",
										"Dinner",
										"dinner"
									]
								].map(([e, t, n, r, i]) => /* @__PURE__ */ (0, C.jsxs)("button", {
									type: "button",
									className: `hm-stat ${e}`,
									onClick: () => K(k, `${r} thaals · ${O.label}`, "adults counted, as on the Mawaid page", G.mealsWho[t], "guests"),
									children: [
										/* @__PURE__ */ (0, C.jsx)("span", {
											className: "hm-ico",
											"aria-hidden": "true",
											children: n
										}),
										/* @__PURE__ */ (0, C.jsx)("b", { children: G.meals ? G.meals[i] : "—" }),
										/* @__PURE__ */ (0, C.jsxs)("span", {
											className: "hm-lbl",
											children: [r, " thaals"]
										})
									]
								}, t))
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, C.jsx)("section", {
					ref: N,
					className: "hm-section hm-occ",
					id: "hmOcc",
					"aria-labelledby": "hmOccTitle",
					dangerouslySetInnerHTML: { __html: re }
				}),
				/* @__PURE__ */ (0, C.jsx)("section", {
					ref: P,
					className: "hm-section hm-dc",
					id: "hmDayCount",
					"aria-labelledby": "hmDcTitle",
					dangerouslySetInnerHTML: { __html: ne }
				})
			]
		}),
		/* @__PURE__ */ (0, C.jsx)(p, {
			open: !!H,
			onOpenChange: (e) => !e && U(null),
			children: /* @__PURE__ */ (0, C.jsx)(d, {
				className: "max-h-[92vh] max-w-[calc(100%-1rem)] overflow-auto sm:max-w-6xl",
				children: H && (() => {
					let e = H.rows, t = Math.max(0, ...e.map((e) => e.mkPax)), n = (e) => /* @__PURE__ */ (0, C.jsxs)("span", {
						className: "grp",
						children: [
							" ",
							e,
							" grp"
						]
					});
					return /* @__PURE__ */ (0, C.jsxs)(C.Fragment, { children: [
						/* @__PURE__ */ (0, C.jsx)(u, { children: /* @__PURE__ */ (0, C.jsxs)(f, { children: [
							"Summary · ",
							e[0].day,
							" → ",
							e.at(-1).day
						] }) }),
						/* @__PURE__ */ (0, C.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [
								e.length,
								" day",
								e.length === 1 ? "" : "s",
								" · ",
								O.label,
								" · ",
								$(e, (e) => e.inPax),
								" arriving, ",
								$(e, (e) => e.outPax),
								" leaving · ",
								q,
								" busiest ",
								t,
								" guests",
								H.cut ? " · first 92 days only" : ""
							]
						}),
						/* @__PURE__ */ (0, C.jsx)("div", {
							className: "overflow-x-auto",
							children: /* @__PURE__ */ (0, C.jsxs)("table", {
								className: "w-full text-sm",
								children: [
									/* @__PURE__ */ (0, C.jsx)("thead", { children: /* @__PURE__ */ (0, C.jsxs)("tr", {
										className: "border-b text-left",
										children: [
											/* @__PURE__ */ (0, C.jsx)("th", { children: "Day" }),
											/* @__PURE__ */ (0, C.jsx)("th", { children: "Check-ins" }),
											/* @__PURE__ */ (0, C.jsx)("th", { children: "Check-outs" }),
											/* @__PURE__ */ (0, C.jsxs)("th", { children: [
												"In ",
												q,
												/* @__PURE__ */ (0, C.jsx)("br", {}),
												/* @__PURE__ */ (0, C.jsx)("small", { children: "12:00 · now" })
											] }),
											/* @__PURE__ */ (0, C.jsx)("th", { children: "FE Morning" }),
											/* @__PURE__ */ (0, C.jsx)("th", { children: "FE Night" }),
											/* @__PURE__ */ (0, C.jsx)("th", { children: "FE from Madina" }),
											/* @__PURE__ */ (0, C.jsxs)("th", { children: [
												"Breakfast",
												/* @__PURE__ */ (0, C.jsx)("br", {}),
												/* @__PURE__ */ (0, C.jsx)("small", { children: "thaals" })
											] }),
											/* @__PURE__ */ (0, C.jsxs)("th", { children: [
												"Lunch",
												/* @__PURE__ */ (0, C.jsx)("br", {}),
												/* @__PURE__ */ (0, C.jsx)("small", { children: "thaals" })
											] }),
											/* @__PURE__ */ (0, C.jsxs)("th", { children: [
												"Dinner",
												/* @__PURE__ */ (0, C.jsx)("br", {}),
												/* @__PURE__ */ (0, C.jsx)("small", { children: "thaals" })
											] })
										]
									}) }),
									/* @__PURE__ */ (0, C.jsx)("tbody", { children: e.map((e) => /* @__PURE__ */ (0, C.jsxs)("tr", {
										className: "cursor-pointer border-b hover:bg-accent/50",
										title: `Show ${e.day} on the cards`,
										onClick: () => {
											U(null), L(e.day), document.getElementById("hmTt")?.scrollIntoView({
												behavior: "smooth",
												block: "start"
											});
										},
										children: [
											/* @__PURE__ */ (0, C.jsxs)("td", { children: [
												/* @__PURE__ */ (0, C.jsx)("b", { children: (/* @__PURE__ */ new Date(`${e.day}T12:00`)).toLocaleDateString(void 0, {
													day: "2-digit",
													month: "short"
												}) }),
												/* @__PURE__ */ (0, C.jsx)("br", {}),
												/* @__PURE__ */ (0, C.jsx)("small", { children: (/* @__PURE__ */ new Date(`${e.day}T12:00`)).toLocaleDateString(void 0, { weekday: "long" }) })
											] }),
											/* @__PURE__ */ (0, C.jsxs)("td", { children: [/* @__PURE__ */ (0, C.jsx)("b", { children: e.inPax }), n(e.ins.length)] }),
											/* @__PURE__ */ (0, C.jsxs)("td", { children: [/* @__PURE__ */ (0, C.jsx)("b", { children: e.outPax }), n(e.outs.length)] }),
											/* @__PURE__ */ (0, C.jsxs)("td", { children: [/* @__PURE__ */ (0, C.jsx)("b", { children: e.mkPax }), n(e.mk.length)] }),
											/* @__PURE__ */ (0, C.jsxs)("td", { children: [/* @__PURE__ */ (0, C.jsx)("b", { children: e.fePax.morning }), n(e.fe.morning.items.length)] }),
											/* @__PURE__ */ (0, C.jsxs)("td", { children: [/* @__PURE__ */ (0, C.jsx)("b", { children: e.fePax.night }), n(e.fe.night.items.length)] }),
											/* @__PURE__ */ (0, C.jsxs)("td", { children: [/* @__PURE__ */ (0, C.jsx)("b", { children: e.fePax.madina }), n(e.fe.madina.items.length)] }),
											/* @__PURE__ */ (0, C.jsx)("td", { children: Q(e, "breakfast") }),
											/* @__PURE__ */ (0, C.jsx)("td", { children: Q(e, "lunch") }),
											/* @__PURE__ */ (0, C.jsx)("td", { children: Q(e, "dinner") })
										]
									}, e.day)) }),
									/* @__PURE__ */ (0, C.jsx)("tfoot", { children: /* @__PURE__ */ (0, C.jsxs)("tr", {
										className: "font-bold",
										children: [
											/* @__PURE__ */ (0, C.jsx)("td", { children: "Total" }),
											/* @__PURE__ */ (0, C.jsx)("td", { children: $(e, (e) => e.inPax) }),
											/* @__PURE__ */ (0, C.jsx)("td", { children: $(e, (e) => e.outPax) }),
											/* @__PURE__ */ (0, C.jsxs)("td", { children: ["peak ", t] }),
											/* @__PURE__ */ (0, C.jsx)("td", { children: $(e, (e) => e.fePax.morning) }),
											/* @__PURE__ */ (0, C.jsx)("td", { children: $(e, (e) => e.fePax.night) }),
											/* @__PURE__ */ (0, C.jsx)("td", { children: $(e, (e) => e.fePax.madina) }),
											/* @__PURE__ */ (0, C.jsx)("td", { children: $(e, (e) => e.meals?.breakfast || 0) }),
											/* @__PURE__ */ (0, C.jsx)("td", { children: $(e, (e) => e.meals?.lunch || 0) }),
											/* @__PURE__ */ (0, C.jsx)("td", { children: $(e, (e) => e.meals?.dinner || 0) })
										]
									}) })
								]
							})
						})
					] });
				})()
			})
		})
	] });
}
export { T as default };
