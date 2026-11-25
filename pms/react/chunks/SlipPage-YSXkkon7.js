import { a as e, c as t, f as n, h as r, i, n as a, o, p as s, r as c, s as l, u } from "./PmsContext-BVMd13Oi.js";
import { a as d, i as f, n as p, o as m, t as h } from "./dialog-DtgtvZ4Q.js";
import { t as g } from "./label-CMEyi--P.js";
import { t as _ } from "./button-BGWa3SLr.js";
import { t as v } from "./input-DSBk_UeU.js";
import { t as y } from "./ConfirmDialog-GfriOiUy.js";
import { t as b } from "./PromptDialog-D_1ik4AU.js";
// src/pages/slip/slip.css?raw
var x = /* @__PURE__ */ r(s(), 1), S = "        :root {\r\n            /* Cream • Gold • Brown palette */\r\n            --bg: #f7efe1; /* page background (cream) */\r\n            --panel: #fffaf1; /* cards/panels (warm off-white) */\r\n            --text: #2b1e15; /* deep brown */\r\n            --muted: #3d3226; /* tobacco */\r\n            --gold: #d4af37; /* accent */\r\n            --gold2: #f3d984; /* light accent */\r\n            --edge: #dcc7a4; /* soft border */\r\n            --edge2: #cdb492; /* stronger border */\r\n            --shade: rgba(92,64,28,.10);\r\n            --ok: #2f7d32; /* success */\r\n            --warn: #a86a00; /* warning */\r\n            --pad: 5px;\r\n        }\r\n\r\n        /* Base */\r\n        * {\r\n            box-sizing: border-box\r\n        }\r\n\r\n        body {\r\n            font: 14px/1.45 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;\r\n            background: var(--bg) url(\"assets/pattern_gold_2x.png\") repeat;\r\n            background-size: 150px auto;\r\n            margin: 15px;\r\n            color: var(--text);\r\n        }\r\n\r\n        .wrap {\r\n            max-width: 1700px;\r\n            margin: 10px auto;\r\n            background: var(--panel);\r\n            padding: 12px;\r\n            border-radius: 10px;\r\n            border: 1px solid var(--edge);\r\n            box-shadow: 0 6px 20px var(--shade);\r\n        }\r\n\r\n        /* Controls */\r\n        .controls {\r\n            display: flex;\r\n            flex-wrap: wrap;\r\n            gap: 6px;\r\n            justify-content: flex-end;\r\n            margin: 6px 0 10px;\r\n        }\r\n\r\n        button, select {\r\n            padding: 6px 8px;\r\n            border: 1px solid var(--gold);\r\n            border-radius: 8px;\r\n            background: #fffdf5;\r\n            cursor: pointer;\r\n            font: inherit;\r\n            font-size: 14px;\r\n            color: #7a5b13;\r\n            transition: background .15s ease, transform .08s ease, filter .15s ease;\r\n        }\r\n\r\n            button:hover {\r\n                background: #fff6dd\r\n            }\r\n\r\n            button:active {\r\n                transform: translateY(1px)\r\n            }\r\n\r\n            button:focus-visible, select:focus-visible,\r\n            input:focus-visible, textarea:focus-visible {\r\n                outline: 2px solid color-mix(in oklab, var(--gold) 70%, #ffffff);\r\n                outline-offset: 1px;\r\n            }\r\n\r\n        /* Tables */\r\n        .grid {\r\n            width: 100%;\r\n            border-collapse: collapse;\r\n            background: #fff\r\n        }\r\n\r\n            .grid th, .grid td {\r\n                border: 1px solid var(--edge);\r\n                padding: var(--pad) 8px;\r\n                vertical-align: middle;\r\n                font-size: 13px;\r\n                color: var(--text);\r\n            }\r\n\r\n            .grid th {\r\n                background: #f6ecd6; /* light cream header */\r\n                text-align: center;\r\n                font-weight: 700;\r\n            }\r\n\r\n            .grid caption {\r\n                caption-side: top;\r\n                font-weight: 800;\r\n                padding: 6px 0 8px;\r\n                color: #7a5b13;\r\n            }\r\n\r\n        .kv th {\r\n            width: 5%;\r\n            text-align: center;\r\n        }\r\n\r\n        .kv td[colspan=\"1\"] input,\r\n        .kv td[colspan=\"1\"] select {\r\n            width: 100%;\r\n            text-align: center;\r\n        }\r\n\r\n        input[type=\"text\"],\r\n        input[type=\"number\"],\r\n        input[type=\"date\"],\r\n        input[type=\"time\"] {\r\n            width: 100%;\r\n            padding: 6px 8px;\r\n            border: 1px solid var(--edge2);\r\n            border-radius: 8px;\r\n            font: inherit;\r\n            font-size: 14px;\r\n            background: #fff;\r\n            color: var(--text);\r\n            text-align: center;\r\n        }\r\n\r\n        select {\r\n            width: 100%;\r\n            padding: 6px 8px;\r\n            border: 1px solid var(--edge2);\r\n            border-radius: 8px;\r\n            background: #fff;\r\n            color: var(--text);\r\n        }\r\n\r\n        .inline {\r\n            display: flex;\r\n            gap: 6px;\r\n            align-items: center\r\n        }\r\n\r\n            .inline > * {\r\n                flex: 1 1 auto\r\n            }\r\n\r\n            .inline button {\r\n                flex: 0 0 auto\r\n            }\r\n\r\n        /* Two minis side-by-side */\r\n        .subtables {\r\n            display: flex;\r\n            gap: 8px\r\n        }\r\n\r\n        .mini {\r\n            width: 50%;\r\n            border-collapse: collapse;\r\n            background: #fff\r\n        }\r\n\r\n            .mini th, .mini td {\r\n                border: 1px solid var(--edge);\r\n                padding: var(--pad)\r\n            }\r\n\r\n            .mini th {\r\n                background: #f6ecd6;\r\n                text-align: left\r\n            }\r\n\r\n            .mini tfoot td {\r\n                background: #fff8e6\r\n            }\r\n\r\n        .row-btn {\r\n            padding: 4px 8px;\r\n            border-radius: 8px;\r\n            border: 1px solid var(--gold);\r\n            background: #fffdf5;\r\n            cursor: pointer;\r\n            font: inherit;\r\n            color: #7a5b13;\r\n        }\r\n\r\n            .row-btn:hover {\r\n                background: #fff6dd\r\n            }\r\n\r\n        .help {\r\n            color: var(--muted-foreground);\r\n            font-size: 11px;\r\n            margin-top: 4px\r\n        }\r\n\r\n        .muted {\r\n            color: var(--muted-foreground)\r\n        }\r\n\r\n        .toolbar {\r\n            margin-top: 8px;\r\n            display: flex;\r\n            gap: 6px;\r\n            flex-wrap: wrap\r\n        }\r\n\r\n        /* Availability highlights */\r\n        .conflict input[type=\"text\"],\r\n        .conflict input[type=\"number\"] {\r\n            border-color: var(--warn);\r\n            background: #fff3e0;\r\n        }\r\n\r\n        .okfill input[type=\"text\"],\r\n        .okfill input[type=\"number\"] {\r\n            border-color: var(--ok);\r\n            background: #eef7ef;\r\n        }\r\n    \r\n\r\n/* ---------------- Room picker (room-picker.js) ---------------- */\r\ndialog.rp { width: min(1200px, 96vw); height: min(820px, 92vh); max-width: none; max-height: none; padding: 0; border: 0; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,.35); color: #1c2430; background: #fff; font: 14px/1.4 system-ui, -apple-system, \"Segoe UI\", sans-serif; }\r\ndialog.rp::backdrop { background: rgba(15, 23, 42, .55); }\r\n.rp .rp-wrap { display: flex; flex-direction: column; height: 100%; margin: 0; }\r\n.rp button { font: inherit; cursor: pointer; border: 1px solid #c9d2de; background: #f6f8fb; color: inherit; border-radius: 8px; padding: 6px 12px; margin: 0; width: auto; }\r\n.rp button:hover { background: #eaf0f7; }\r\n.rp .rp-primary { background: #1f6f43; border-color: #1f6f43; color: #fff; font-weight: 600; }\r\n.rp .rp-primary:hover { background: #185a36; }\r\n.rp .rp-head { display: flex; align-items: flex-start; gap: 12px; padding: 14px 18px 8px; border-bottom: 1px solid #e3e8ef; }\r\n.rp .rp-head > div { flex: 1; min-width: 0; }\r\n.rp .rp-head h2 { margin: 0; font-size: 18px; }\r\n.rp .rp-head p { margin: 2px 0 0; color: #5b6778; font-size: 13px; }\r\n.rp .rp-x { border: 0; background: none; font-size: 18px; padding: 4px 8px; }\r\n.rp .rp-needs { display: flex; flex-wrap: wrap; gap: 8px; padding: 8px 18px; align-items: center; border-bottom: 1px solid #e3e8ef; }\r\n.rp .rp-need { padding: 3px 10px; border-radius: 999px; font-size: 13px; }\r\n.rp .rp-need.ok { background: #e3f4ea; color: #1f6f43; }\r\n.rp .rp-need.short { background: #fff4de; color: #8a5a00; }\r\n.rp .rp-need.over { background: #fde7e7; color: #a12a2a; }\r\n.rp .rp-note { color: #5b6778; font-size: 12px; }\r\n.rp .rp-gl { display: flex; flex-wrap: wrap; gap: 8px 12px; padding: 8px 18px; align-items: center; border-bottom: 1px solid #e3e8ef; background: #fffbea; }\r\n.rp .rp-gl-on { display: inline-flex; gap: 6px; align-items: center; font-weight: 700; font-size: 13px; }\r\n.rp .rp-gl .rp-seg button { padding: 3px 12px; font-size: 13px; }\r\n.rp .rp-gl .rp-seg button:disabled { opacity: .5; }\r\n.rp .rp-gl-state { font-size: 13px; color: #5b6778; }\r\n.rp .rp-gl-state.wait { color: #9a5b00; font-weight: 600; }\r\n.rp .rp-gl-state.ok { color: #1f7a3a; }\r\n.rp .rp-gltag { font-style: normal; font-weight: 800; color: #9a5b00; }\r\n.rp .rp-tile.gone { outline: 2px dashed #c0392b; outline-offset: -3px; opacity: .85; }\r\n.rp .rp-body { flex: 1; display: grid; grid-template-columns: minmax(0, 1fr) 320px; min-height: 0; }\r\n.rp .rp-main { display: flex; flex-direction: column; min-height: 0; }\r\n.rp .rp-filters { display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: center; padding: 8px 18px; font-size: 13px; }\r\n.rp .rp-filters select, .rp .rp-filters input[type=search] { font: inherit; padding: 5px 8px; border: 1px solid #c9d2de; border-radius: 8px; width: auto; margin: 0; }\r\n.rp .rp-filters label { display: inline-flex; gap: 6px; align-items: center; white-space: nowrap; }\r\n.rp .rp-filters input[type=checkbox] { width: auto; margin: 0; }\r\n.rp .rp-legend { display: inline-flex; gap: 4px 8px; align-items: center; flex-wrap: wrap; color: #5b6778; font-size: 12px; margin-left: auto; }\r\n.rp .rp-legend i { display: inline-block; width: 12px; height: 12px; border-radius: 3px; margin-left: 4px; }\r\n.rp .l-free { background: #d8f0e1; border: 1px solid #7fbf97; }\r\n.rp .l-part { background: #fff1cc; border: 1px solid #e0b24a; }\r\n.rp .l-full { background: #f3d6d6; border: 1px solid #c77; }\r\n.rp .l-mine { background: #d9e6ff; border: 1px solid #4f7fd9; }\r\n.rp .rp-floors { flex: 1; overflow: auto; padding: 0 18px 16px; }\r\n.rp .rp-floor h4 { margin: 10px 0 6px; font-size: 13px; color: #5b6778; text-transform: uppercase; letter-spacing: .04em; }\r\n.rp .rp-tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 8px; }\r\n.rp .rp-tile { display: flex; flex-direction: column; align-items: stretch; gap: 4px; padding: 7px 8px; text-align: left; border-width: 1px; }\r\n.rp .rp-tile.free { background: #eef9f2; border-color: #9fd1b1; }\r\n.rp .rp-tile.part { background: #fff8e6; border-color: #e7c373; }\r\n.rp .rp-tile.full { background: #f8e6e6; border-color: #d99a9a; color: #7a3b3b; }\r\n.rp .rp-tile.mine { background: #e6eeff; border-color: #4f7fd9; }\r\n.rp .rp-tile.sel { outline: 3px solid #1f4fa8; outline-offset: 1px; }\r\n.rp .rp-no { font-weight: 700; display: flex; justify-content: space-between; }\r\n.rp .rp-no em { font-style: normal; font-weight: 600; font-size: 11px; padding: 0 5px; border-radius: 4px; background: rgba(0,0,0,.08); }\r\n.rp .rp-free { font-size: 12px; }\r\n.rp .rp-bar { position: relative; height: 6px; border-radius: 3px; background: rgba(31,111,67,.18); overflow: hidden; }\r\n.rp .rp-bar.big { height: 16px; border-radius: 5px; margin-top: 6px; }\r\n.rp .rp-bar span { position: absolute; top: 0; bottom: 0; }\r\n.rp .rp-bar span.part { background: #e0a526; }\r\n.rp .rp-bar span.full { background: #c0392b; }\r\n.rp .rp-side { border-left: 1px solid #e3e8ef; padding: 12px 16px; overflow: auto; background: #fafbfd; }\r\n.rp .rp-side h3 { font-size: 14px; margin: 16px 0 6px; }\r\n.rp .rp-dhead { display: flex; flex-direction: column; }\r\n.rp .rp-dhead b { font-size: 17px; }\r\n.rp .rp-dhead span, .rp .rp-muted { color: #5b6778; font-size: 12px; }\r\n.rp .rp-big { margin: 8px 0 0; font-weight: 600; }\r\n.rp .rp-axis { display: flex; justify-content: space-between; font-size: 11px; color: #5b6778; margin-top: 2px; }\r\n.rp .rp-others { list-style: none; padding: 0; margin: 10px 0; font-size: 13px; }\r\n.rp .rp-others li { padding: 6px 0; border-top: 1px dashed #dde3ea; }\r\n.rp .rp-assign { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 10px; }\r\n.rp .rp-seg { display: inline-flex; }\r\n.rp .rp-seg button { border-radius: 0; }\r\n.rp .rp-seg button:first-child { border-radius: 8px 0 0 8px; }\r\n.rp .rp-seg button:last-child { border-radius: 0 8px 8px 0; border-left: 0; }\r\n.rp .rp-seg button[aria-pressed=\"true\"] { background: #1f4fa8; border-color: #1f4fa8; color: #fff; }\r\n.rp .rp-step { display: inline-flex; align-items: center; gap: 6px; }\r\n.rp .rp-step button { width: 34px; padding: 6px 0; font-weight: 700; }\r\n.rp .rp-step output { min-width: 26px; text-align: center; font-weight: 700; font-size: 16px; }\r\n.rp .rp-warn { color: #a12a2a; font-size: 13px; margin: 8px 0 0; }\r\n.rp .rp-list { display: flex; flex-direction: column; gap: 4px; }\r\n.rp .rp-item { display: grid; grid-template-columns: 1fr auto 32px 30px; gap: 6px; align-items: center; font-size: 13px; }\r\n.rp .rp-link { border: 0; background: none; padding: 2px 0; text-align: left; font-weight: 600; color: #1f4fa8; }\r\n.rp .rp-rm { border: 0; background: none; padding: 2px 6px; color: #a12a2a; }\r\n.rp .rp-foot { display: flex; flex-wrap: wrap; gap: 8px; padding: 10px 18px; border-top: 1px solid #e3e8ef; }\r\n.rp .rp-grow { flex: 1; }\r\n@media (max-width: 800px) {\r\n    dialog.rp { width: 100vw; height: 100dvh; max-height: 100dvh; border-radius: 0; margin: 0; }\r\n    .rp .rp-body { grid-template-columns: 1fr; grid-template-rows: minmax(0, 1fr) auto; }\r\n    .rp .rp-side { border-left: 0; border-top: 1px solid #e3e8ef; max-height: 45dvh; }\r\n    .rp .rp-legend { margin-left: 0; }\r\n    .rp .rp-tiles { grid-template-columns: repeat(auto-fill, minmax(88px, 1fr)); }\r\n    .rp .rp-head, .rp .rp-needs, .rp .rp-filters, .rp .rp-floors, .rp .rp-foot { padding-left: 12px; padding-right: 12px; }\r\n}\r\n@media print { dialog.rp { display: none; } }\r\n\r\n/* Highlighted actions (Pick rooms…, Edit on a loaded slip); locked Save */\r\n.wrap button.btn-hot { background: linear-gradient(#e6c65a, #d4af37); border-color: #b8931f; color: #3b2a06; font-weight: 700; box-shadow: 0 2px 6px rgba(150, 110, 20, .35); }\r\n.wrap button.btn-hot:hover { filter: brightness(1.06); background: linear-gradient(#e6c65a, #d4af37); }\r\n/* beds given on the room tables vs the slip's counts (Gents; Ladies + Children) */\r\n.alloc-sum { display: inline-flex; flex-wrap: wrap; gap: 4px 16px; align-items: baseline; color: #c40000; font-weight: 800; font-size: 20px; line-height: 1.25; }\r\n.alloc-sum b { font-size: 26px; }\r\n.alloc-sum small { font-size: 13px; font-weight: 700; }\r\n.gl-badge { display: inline-block; margin-left: 4px; padding: 0 6px; border-radius: 6px; background: #9a5b00; color: #fff; font-size: 11px; font-weight: 800; vertical-align: middle; cursor: default; }\r\n.wrap button.btn-warn { border-color: #c0392b; color: #a12a2a; background: #fdecea; }\r\n.wrap button:disabled { opacity: .45; cursor: not-allowed; transform: none; filter: grayscale(.4); }\r\n.wrap button.linkish { border: 0; background: none; padding: 6px 4px; color: var(--muted-foreground); text-decoration: underline; font-size: 13px; }\r\n\r\n/* Pick rooms: side switch + feedback line */\r\n.rp .rp-lbl { font-size: 12px; color: #5b6778; }\r\n.rp button.rp-need { border: 2px solid transparent; cursor: pointer; font-size: 13px; padding: 4px 12px; border-radius: 999px; }\r\n.rp button.rp-need.free { background: #eef2f7; }\r\n.rp button.rp-need[aria-pressed=\"true\"] { border-color: #1f4fa8; box-shadow: 0 0 0 2px rgba(31, 79, 168, .15); }\r\n.rp .rp-msg { min-height: 0; padding: 0 18px; font-size: 13px; color: #1f6f43; }\r\n.rp .rp-msg:not(:empty) { padding: 6px 18px; background: #f2faf5; border-bottom: 1px solid #e3e8ef; }\r\n.rp .rp-msg.warn:not(:empty) { color: #a12a2a; background: #fdf1f0; }\r\n@media (max-width: 800px) { .rp .rp-msg:not(:empty) { padding: 6px 12px; } }\r\n\r\n/* delayed departure: each room row gets its own check-out */\r\n.delay-box { display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: center; margin: 12px 0 4px; padding: 10px 12px; border: 1px dashed #d8b46a; border-radius: 10px; background: #fffaf0; }\r\n.delay-box.on { border: 2px solid #c0392b; background: #fff4f2; }\r\n.delay-on { display: inline-flex; gap: 8px; align-items: center; cursor: pointer; }\r\n.delay-on input { width: 18px; height: 18px; }\r\n.delay-box.on .delay-on b { color: #a12a2a; }\r\n.delay-ctl { display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: center; width: 100%; }\r\n.delay-ctl label { display: inline-flex; gap: 6px; align-items: center; font-size: 13px; font-weight: 600; }\r\n.delay-note { flex: 1 1 260px; }\r\n.delay-note input { flex: 1; }\r\n.delay-all { display: inline-flex; flex-wrap: wrap; gap: 4px; align-items: center; font-size: 13px; font-weight: 600; }\r\n.subtables .out-cell { display: none; }\r\n.subtables.delayed .out-cell { display: table-cell; white-space: nowrap; }\r\n.subtables.delayed .out-cell input[type=date] { width: 132px; }\r\n.subtables.delayed .out-cell input[type=time] { width: 92px; }\r\n.subtables.delayed .out-cell select { width: auto; }\r\n.subtables.delayed .out-cell .out-split { padding: 2px 8px; }\r\n\r\n/* History: every version of the loaded slip (history.js) */\r\n.slip-history { margin-top: 18px; padding: 14px 16px; border: 1px solid #e3d2b1; border-radius: 14px; background: #fffaf1; }\r\n.slip-history h3 { margin: 0 0 4px; font-size: 17px; color: #9a7414; }\r\n.slip-history .sh-help { margin: 0 0 10px; font-size: 12.5px; }\r\n.slip-history .sh-msg { margin: 0 0 8px; font-weight: 700; color: #1f6f43; }\r\n.sh-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }\r\n.sh-ver { --c: hsl(calc(var(--lane) * 67 + 38) 55% 42%); margin-left: calc(var(--lane) * 18px); padding: 8px 12px; border-radius: 10px; background: #fff; border: 1px solid #ecdfc3; border-left: 6px solid var(--c); }\r\n.sh-ver.active { background: #fff7dc; border-color: #d4af37; box-shadow: 0 0 0 2px rgba(212, 175, 55, .35); }\r\n.sh-top { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; }\r\n.sh-n { font-size: 15px; color: var(--c); }\r\n.sh-act { font-weight: 700; } .sh-by, .sh-at { color: #3d3226; font-size: 12.5px; }\r\n.sh-badge { font-size: 11px; font-weight: 800; padding: 1px 8px; border-radius: 999px; }\r\n.sh-badge.on { background: #d4af37; color: #3b2a06; } .sh-badge.br { background: #efe3ff; color: #5b2a8f; }\r\n.sh-sum { display: flex; flex-wrap: wrap; gap: 4px 6px; margin: 5px 0; font-size: 12.5px; }\r\n.sh-chg { padding: 1px 8px; border-radius: 8px; background: #f6ecd2; } .sh-chg b { color: #7a5410; }\r\n.sh-first, .sh-more { color: #3d3226; font-style: italic; }\r\n.sh-btns { display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: center; }\r\n.sh-use { font: inherit; font-size: 12.5px; font-weight: 800; padding: 4px 12px; border-radius: 999px; border: 1px solid #b8931f; background: #fff; color: #7a5410; cursor: pointer; }\r\n.sh-use:hover { background: #fff6dd; }\r\n.sh-det { margin-top: 6px; border-collapse: collapse; font-size: 12.5px; width: 100%; max-width: 640px; }\r\n.sh-det th { text-align: left; width: 110px; color: #3d3226; padding: 2px 8px 2px 0; vertical-align: top; } .sh-det td { padding: 2px 0; overflow-wrap: anywhere; }\r\n\r\n/* Pick rooms: a gents / ladies room refused for the other side; Exclusive */\r\n.rp .rp-err { margin: 8px 0 0; padding: 8px 10px; border-radius: 8px; background: #fde2df; border: 1px solid #e3a7a1; color: #8f1d12; font-size: 13px; }\r\n.rp .rp-err a { color: #8f1d12; font-weight: 800; }\r\n.rp .rp-msg.warn { background: #fde2df; color: #8f1d12; font-weight: 700; padding: 8px 18px; }\r\n.rp .rp-excl { display: flex; align-items: center; gap: 6px; margin: 8px 0 0; font-weight: 700; font-size: 13px; }\r\n.rp .rp-excl.off { opacity: .55; } .rp .rp-excl input { width: auto; margin: 0; }\r\n\r\n/* Slip page: Exclusive room rows (the whole room kept for the guests assigned; may be in another building) */\r\n.excl-cell { white-space: nowrap; }\r\n.excl-cell .excl-on { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 700; cursor: pointer; }\r\n.excl-cell .excl-chk { width: auto; margin: 0; }\r\n.excl-cell .excl-bld { display: block; margin-top: 4px; font-size: 12px; max-width: 150px; }\r\ntr.excl > td:first-child { box-shadow: inset 4px 0 0 #7b3fb2; }\r\ntr.excl .excl-on { color: #5b2a8f; }\r\n/* 24-hour time fields (Settings → Slip page → 24-hour times) */\r\n.t24 { display: inline-flex; align-items: center; gap: 2px; }\r\n.t24 select { width: auto; min-width: 0; padding: 4px 2px; }\r\n\r\n.ci-chip { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 12.5px; font-weight: 700; background: #eee; color: #555; }\r\n.ci-chip.ci-arrived { background: #e3f4ea; color: #1f6f43; }\r\n\r\n#notes { width: 100%; box-sizing: border-box; font: inherit; padding: 6px 9px; border: 1px solid var(--edge, #d9cbb0); border-radius: 8px; resize: vertical; }\r\n/* Notes row: the text box takes the rest of the row (phone layout is a 4-column grid) */\r\ntd:has(> #notes) { grid-column: 2 / -1; min-width: 0; }\r\n.ums-held { margin: 8px 0; padding: 10px 14px; border: 2px solid #c0392b; border-radius: 12px; background: #fde8e8; color: #7a1a12; font-weight: 700; }\r\n\r\n.trip { margin-top: 14px; padding: 10px 12px; border: 1px solid #e3d2b1; border-radius: 10px; background: #fffaf1; }\r\n.trip h3 { margin: 0 0 6px; font-size: 15px; } .trip h3 small { font-weight: 500; color: #3d3226; margin-left: 8px; }\r\n.trip-list { margin: 0; padding-left: 20px; display: grid; gap: 4px; }\r\n.trip-list li span { margin-left: 10px; color: #4b4031; } .trip-list li em { margin-left: 8px; font-size: 11px; color: #7a5a10; font-style: normal; background: #f4e3b8; padding: 1px 7px; border-radius: 999px; }\r\n.trip-list li.here { font-weight: 700; }\r\n.trip-extra { margin-top: 6px; display: flex; flex-wrap: wrap; gap: 6px; } .trip-extra .chip { background: #f4e3b8; border-radius: 999px; padding: 2px 10px; font-size: 12px; }\r\n.trip-extra .chip button { border: 0; background: none; cursor: pointer; }\r\n.trip-add { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }\r\n.trip-add input, .trip-add select { padding: 4px 6px; }\r\n\r\n.wrap .slip-corner { display: flex; justify-content: flex-end; gap: 8px; margin: 0 0 8px; }\r\n/* a loaded slip's SH: read only (New Slip frees it) */\r\n#sh_no.sh-locked { background: #f3efe6; color: #4a3b22; font-weight: 700; cursor: not-allowed; }\r\n.moved-note { display: block; font-size: 11px; line-height: 1.25; color: #3d3226; }\r\n.moved-note .linkish { margin-left: 6px; }\r\n", C = () => ({
	sh_no: "",
	tour_name: "",
	group_leader: "",
	building: "",
	gents: "",
	ladies: "",
	children: "",
	infants: "",
	total: "",
	checkin_date: "",
	checkin_time: "",
	checkout_date: "",
	checkout_time: "",
	from_place: "",
	to_place: "",
	notes: ""
}), w = () => ({
	on: !1,
	status: "tentative",
	note: "",
	orig: null
}), T = 0, E = (e = {}) => {
	let t = (e.capacity ?? "") === "" ? "" : String(e.capacity), n = e.assigned != null && e.assigned !== "";
	return {
		uid: ++T,
		room_no: e.room_no || "",
		capacity: t,
		assigned: n ? String(e.assigned) : t,
		dirty: n,
		...e.gl ? { gl: !0 } : {},
		exclusive: !!e.exclusive,
		building: (e.exclusive || e.moves?.length) && e.building || "",
		...e.moves?.length ? { moves: e.moves } : {},
		out_date: e.out?.date || "",
		out_time: e.out?.time || "",
		out_status: e.out_status || "confirmed"
	};
}, D = (e) => String(e ?? "").trim(), O = (e, t) => {
	if (!e) return null;
	let n = /* @__PURE__ */ new Date(`${e}T${t && t.length ? t : "00:00"}`);
	return isNaN(+n) ? null : n;
}, ee = (e) => {
	let t = String(e ?? "").trim().toUpperCase();
	return t === "" ? "" : /^\d+$/.test(t) ? Number(t) : t;
}, k = (e) => String(e).padStart(2, "0"), te = (e, t) => {
	let n = /* @__PURE__ */ new Date();
	return n.setDate(n.getDate() + e), {
		date: `${n.getFullYear()}-${k(n.getMonth() + 1)}-${k(n.getDate())}`,
		time: t || "10:00"
	};
};
function A(e, t, n) {
	let r = [];
	for (let i of e) {
		let e = i.room_no.trim(), a = i.capacity.trim(), o = i.assigned.trim();
		if (e === "" && a === "" && o === "") continue;
		let s = {
			room_no: e,
			capacity: /^\d+$/.test(a) ? Number(a) : "",
			assigned: /^\d+$/.test(o) ? Number(o) : "",
			...i.gl ? { gl: !0 } : {}
		};
		if (i.exclusive && (s.exclusive = !0), i.exclusive || i.moves?.length) {
			let e = (i.building || "").trim();
			e && (s.building = e);
		}
		i.moves?.length && (s.moves = i.moves), t && (s.out = {
			date: i.out_date || n.checkout_date || "",
			time: i.out_time || n.checkout_time || ""
		}, s.out_status = i.out_status || "confirmed"), r.push(s);
	}
	return r;
}
function j(e, t, n, r) {
	let i = {
		gents: A(t, r.on, e),
		ladies: A(n, r.on, e)
	}, { checkout_date: a, checkout_time: o } = e, s = null;
	if (r.on) {
		let e = [...i.gents, ...i.ladies].filter((e) => e.out?.date).map((e) => `${e.out.date}T${e.out.time || "00:00"}`).sort();
		e.length && ([a, o] = e.at(-1).split("T")), s = {
			on: !0,
			status: r.status,
			note: r.note.trim(),
			original_checkout: r.orig || {
				date: a,
				time: o
			},
			updated_at: (/* @__PURE__ */ new Date()).toISOString()
		};
	}
	let c = (e) => e === "" ? "" : Number(e);
	return {
		tour_name: e.tour_name.trim(),
		group_leader: e.group_leader.trim(),
		checkin_date: e.checkin_date || "",
		checkin_time: e.checkin_time || "",
		checkout_date: a,
		checkout_time: o,
		building: e.building || "",
		sh_no: ee(e.sh_no),
		notes: e.notes.trim(),
		from_place: e.from_place || "",
		to_place: e.to_place || "",
		total: c(e.total),
		gents: c(e.gents),
		ladies: c(e.ladies),
		infants: c(e.infants),
		children: c(e.children),
		rooms: i,
		delayed: s,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
function ne(e) {
	let t = (e) => e == null ? "" : String(e), n = e.delayed && e.delayed.on ? e.delayed : null;
	return {
		form: {
			sh_no: t(e.sh_no),
			tour_name: t(e.tour_name),
			group_leader: t(e.group_leader),
			building: t(e.building),
			gents: t(e.gents),
			ladies: t(e.ladies),
			children: t(e.children),
			infants: t(e.infants),
			total: t(e.total),
			checkin_date: t(e.checkin_date),
			checkin_time: t(e.checkin_time),
			checkout_date: t(e.checkout_date),
			checkout_time: t(e.checkout_time),
			from_place: t(e.from_place),
			to_place: t(e.to_place),
			notes: t(e.notes)
		},
		delay: {
			on: !!n,
			status: n?.status || "tentative",
			note: n?.note || "",
			orig: n?.original_checkout || null
		},
		gents: (e.rooms?.gents || []).map((e) => E(e)),
		ladies: (e.rooms?.ladies || []).map((e) => E(e))
	};
}
function M(e, t, n, r, i) {
	return e.map((e) => {
		if (D(e.room_no) !== t.room || ((e.building || "").trim() || i) !== t.building) return e;
		let a = {
			room_no: t.room,
			capacity: e.capacity === "" ? "" : Number(e.capacity),
			...t.building === i ? {} : { building: t.building },
			until: r
		};
		return {
			...e,
			room_no: n.room,
			capacity: String(n.capacity ?? ""),
			building: n.building === i ? "" : n.building,
			moves: [...e.moves || [], a]
		};
	});
}
function re(e, t) {
	let n = e.moves?.[e.moves.length - 1];
	if (!n) return e;
	let r = e.moves.slice(0, -1), { moves: i, ...a } = e;
	return {
		...a,
		room_no: n.room_no,
		capacity: String(n.capacity ?? ""),
		building: (n.building || "") === t ? "" : n.building || "",
		...r.length ? { moves: r } : {}
	};
}
function ie(e, t) {
	let n = /* @__PURE__ */ new Map();
	for (let r of [...e].sort((e, t) => e.createdAt > t.createdAt ? -1 : 1)) for (let e of ["gents", "ladies"]) (r.rooms?.[e] || []).forEach((e) => {
		let i = String(e.building || r.building || "").trim();
		if (t && i !== t) return;
		let a = `${i}|${D(e.room_no)}`, o = e.capacity === "" || e.capacity == null ? null : Number(e.capacity);
		!n.has(a) && o != null && n.set(a, o);
	});
	return n;
}
function ae(e, t, n, r) {
	let { db: i, buildings: a, currentId: o, loadedRooms: s } = r, c = r.copy, l = r.stay, u = r.rooms, d = l.normB, f = (e.building || "").trim(), p = O(e.checkin_date, e.checkin_time), m = O(e.checkout_date, e.checkout_time);
	if (!f || !p || !m || m <= p) return {
		pass: !1,
		okRooms: [],
		issues: [{
			kind: "window",
			missing: [
				!f && "building",
				!p && "check-in",
				!m && "check-out",
				p && m && m <= p && "check-out not after check-in"
			].filter(Boolean)
		}],
		building: f,
		copy: c,
		own: [],
		blocked: /* @__PURE__ */ new Set(),
		start: 0,
		end: 0
	};
	let h = [], g = [], _ = (e, t, n) => `${e}|${u.normRoom(t)}|${d(n)}`, v = (e, t) => u.findBuilding(a, e)?.rooms?.find((e) => u.normRoom(e.room_no) === u.normRoom(t))?.type || "", y = [], b = /* @__PURE__ */ new Map(), x = (e, t) => `${d(e)}|${t}`;
	for (let i of ["gents", "ladies"]) for (let o of A(i === "gents" ? t : n, r.delayOn, e)) {
		let t = D(o.room_no);
		if (!t) continue;
		let n = (o.building || "").trim() || f, r = Number.isFinite(+o.assigned) ? +o.assigned : 0, c = o.out && O(o.out.date, o.out.time) || m, l = o.moves?.[o.moves.length - 1], g = l && O(l.until.date, l.until.time) || p;
		if (c <= g) {
			h.push({
				kind: "badtime",
				room: t,
				out: o.out || {
					date: e.checkout_date,
					time: e.checkout_time
				}
			});
			continue;
		}
		y.push({
			room: t,
			building: n,
			key: x(n, t),
			side: i,
			start: +g,
			end: +c,
			beds: r,
			excl: !!o.exclusive,
			cap_row: Number(o.capacity) || null
		});
		let S = u.findBuilding(a, n)?.rooms?.find((e) => u.normRoom(e.room_no) === u.normRoom(t))?.handed;
		S?.at && +c > Date.parse(S.at) && !s.has(_(i, t, n)) && h.push({
			kind: "text",
			text: `Room ${t} was handed back to the hotel on ${S.at.replace("T", " at ")}.`,
			help: ["Choose another room, or take the hand-over back in Rooms & Buildings if it was a mistake."]
		});
		let C = v(n, t);
		C !== "gents" && C !== "ladies" || C === i || s.has(_(i, t, n)) || h.push({
			kind: "roomtype",
			room: t,
			side: i,
			type: C,
			...d(n) === d(f) ? {} : { building: n }
		}), !b.get(x(n, t)) && Number.isFinite(+o.capacity) && +o.capacity > 0 && b.set(x(n, t), +o.capacity);
	}
	let S = [...new Set(y.map((e) => e.key))], C = Math.max(+m, ...y.map((e) => e.end)), w = new Map(S.map((e) => [e, []]));
	for (let e of i) if (!(o && e.id === o)) for (let t of l.rowsOf(e)) {
		let n = x(t.building, D(t.room_no));
		!w.has(n) || !t.start || !t.end || t.block <= 0 || t.start < C && t.end > +p && w.get(n).push({
			start: t.start,
			end: t.end,
			beds: t.block,
			pax: t.beds,
			excl: t.exclusive,
			sh: e.sh_no,
			id: e.id,
			status: t.status,
			ums: !!e.ums
		});
	}
	let T = /* @__PURE__ */ new Map();
	function E(e, t) {
		let n = x(e, t), r = b.get(n) || 0, o = u.builderCapacity(a, e, t), s = {
			row: r || null,
			builder: o ?? null,
			used: null
		};
		if (T.set(n, s), o > 0) return s.used = "builder", o;
		if (r > 0) return s.used = "row", r;
		for (let n = i.length - 1; n >= 0; n--) {
			let r = i[n], a = [...r.rooms?.gents || [], ...r.rooms?.ladies || []].filter((t) => d(t.building || r.building) === d(e)).find((e) => D(e.room_no) === t), o = Number.isFinite(+a?.capacity) ? +a.capacity : 0;
			if (o > 0) return s.used = "history", s.history = o, s.history_slip = r.id, o;
		}
		return 0;
	}
	let ee = /* @__PURE__ */ new Set();
	for (let e of S) {
		let t = y.filter((t) => t.key === e), n = w.get(e), r = t[0].room, i = t[0].building, a = E(i, r), o = d(i) === d(f) ? {} : { building: i };
		if (!a) {
			ee.add(r), h.push({
				kind: "nocap",
				room: r,
				...o,
				excl: t.some((e) => e.excl),
				cap_source: T.get(e)
			});
			continue;
		}
		let s = /* @__PURE__ */ new Set([...t.map((e) => e.start), ...n.map((e) => e.start)]), c = {
			total: -1,
			existing: 0,
			want: 0,
			t: null,
			who: []
		};
		for (let e of s) {
			let r = t.filter((t) => t.start <= e && e < t.end).reduce((e, t) => e + (t.excl ? Math.max(a, t.beds) : t.beds), 0);
			if (!r) continue;
			let i = n.filter((t) => t.start <= e && e < t.end), o = i.reduce((e, t) => e + t.beds, 0);
			o + r > c.total && (c = {
				total: o + r,
				existing: o,
				want: r,
				t: e,
				who: i
			});
		}
		if (c.total < 0) continue;
		let l = t.some((e) => e.excl);
		c.total <= a ? g.push({
			room: r,
			...o,
			before: c.existing,
			after: c.total,
			cap: a,
			excl: l,
			cap_source: T.get(e)
		}) : (ee.add(r), h.push({
			kind: "blocked",
			room: r,
			...o,
			excl: l,
			at: c.t,
			cap: a,
			existing: c.existing,
			want: c.want,
			total: c.total,
			who: c.who,
			cap_source: T.get(e),
			others: n
		}));
	}
	return {
		pass: !h.length,
		okRooms: g,
		issues: h,
		building: f,
		start: +p,
		end: C,
		copy: c,
		own: y,
		blocked: ee
	};
}
function oe(e) {
	if (!e) return [];
	let t = [], n = /* @__PURE__ */ new Set();
	for (let r of e.split(/[,\s/*\-.]+/).map((e) => e.trim()).filter(Boolean)) {
		let e = r.toLowerCase();
		n.has(e) || (n.add(e), t.push(r));
	}
	return t;
}
// src/pages/slip/ChangeRoom.tsx
var N = n(), P = (e) => String(e).padStart(2, "0"), se = (e) => ({
	date: `${e.getFullYear()}-${P(e.getMonth() + 1)}-${P(e.getDate())}`,
	time: `${P(e.getHours())}:${P(e.getMinutes())}`
}), F = (e) => new Date(e).toLocaleString(void 0, {
	day: "2-digit",
	month: "short",
	hour: "2-digit",
	minute: "2-digit"
}), ce = (e, t) => e.localeCompare(t, void 0, { numeric: !0 });
function le({ row: e, form: t, gents: n, ladies: r, mine: i, slips: a, buildings: o, names: s, stay: c, rooms: l, onApply: u, onClose: y }) {
	let b = (e.building || "").trim() || t.building, S = D(e.room_no), C = (e) => D(e.room_no) === S && ((e.building || "").trim() || t.building) === b, w = [...n.filter(C).map((e) => ({
		r: e,
		side: "gents"
	})), ...r.filter(C).map((e) => ({
		r: e,
		side: "ladies"
	}))], T = w.reduce((e, { r: t }) => e + (Number(t.assigned) || 0), 0), E = w.some(({ r: e }) => e.exclusive), ee = O(t.checkin_date, t.checkin_time), k = O(e.out_date || t.checkout_date, e.out_date ? e.out_time : t.checkout_time), te = e.moves?.[e.moves.length - 1], A = te && O(te.until.date, te.until.time) || ee, [j, ne] = (0, x.useState)(() => {
		let e = /* @__PURE__ */ new Date();
		return se(A && k && e > A && e < k ? e : A || e);
	}), [M, re] = (0, x.useState)(b), [ie, ae] = (0, x.useState)(""), oe = O(j.date, j.time), P = oe ? A && +oe <= +A ? `The change must be after ${F(+A)}.` : k && +oe >= +k ? `The change must be before the stay ends (${F(+k)}).` : "" : "Choose the date and time of the change.", le = (0, x.useMemo)(() => {
		if (P || !oe || !k) return [];
		let e = [...a, {
			...i,
			rooms: {
				gents: (i.rooms?.gents || []).filter((e) => D(e.room_no) !== S),
				ladies: (i.rooms?.ladies || []).filter((e) => D(e.room_no) !== S)
			}
		}], t = c.roomsUse(e, M, +oe, +k), n = new Set(w.map((e) => e.side));
		return l.activeRooms(o, M, +k).filter((e) => M !== b || D(e.room_no) !== S).map((e) => {
			let r = Number(e.capacity) || 0, i = t.get(l.normRoom(e.room_no)) || {
				peak: 0,
				who: []
			}, a = Math.max(0, r - i.peak), o = (e.type === "gents" || e.type === "ladies") && [...n].some((t) => t !== e.type), s = i.who[0], c = o ? `a ${e.type} room` : E && i.peak ? "not empty (Exclusive needs the whole room)" : a < T ? `${a} free, needs ${T}${s ? ` — SH ${s.sh} until ${F(s.end)}` : ""}` : "";
			return {
				no: String(e.room_no),
				cap: r,
				free: a,
				why: c
			};
		}).sort((e, t) => Number(!!e.why) - Number(!!t.why) || ce(e.no, t.no));
	}, [
		P,
		j.date,
		j.time,
		M
	]), ue = le.find((e) => e.no === ie && !e.why);
	return /* @__PURE__ */ (0, N.jsx)(h, {
		open: !0,
		onOpenChange: (e) => {
			e || y();
		},
		children: /* @__PURE__ */ (0, N.jsxs)(p, {
			className: "max-w-[calc(100%-1rem)] sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, N.jsx)(d, { children: /* @__PURE__ */ (0, N.jsxs)(m, { children: ["Change room ", S] }) }),
				/* @__PURE__ */ (0, N.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [
						T,
						" guest",
						T === 1 ? "" : "s",
						w.length > 1 ? " (gents and ladies rows of this room)" : "",
						". They keep room ",
						S,
						" until the change; the new room is checked from then to the end of the stay",
						k ? ` (${F(+k)})` : "",
						"."
					]
				}),
				/* @__PURE__ */ (0, N.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, N.jsxs)("div", {
						className: "grid gap-1",
						children: [/* @__PURE__ */ (0, N.jsx)(g, {
							htmlFor: "crDate",
							children: "Moves on"
						}), /* @__PURE__ */ (0, N.jsx)(v, {
							id: "crDate",
							type: "date",
							value: j.date,
							onChange: (e) => {
								ne((t) => ({
									...t,
									date: e.target.value
								})), ae("");
							}
						})]
					}), /* @__PURE__ */ (0, N.jsxs)("div", {
						className: "grid gap-1",
						children: [/* @__PURE__ */ (0, N.jsx)(g, {
							htmlFor: "crTime",
							children: "At"
						}), /* @__PURE__ */ (0, N.jsx)(v, {
							id: "crTime",
							type: "time",
							value: j.time,
							onChange: (e) => {
								ne((t) => ({
									...t,
									time: e.target.value
								})), ae("");
							}
						})]
					})]
				}),
				/* @__PURE__ */ (0, N.jsxs)("div", {
					className: "grid gap-1",
					children: [/* @__PURE__ */ (0, N.jsx)(g, {
						htmlFor: "crBld",
						children: "Building"
					}), /* @__PURE__ */ (0, N.jsx)("select", {
						id: "crBld",
						className: "h-9 rounded-md border bg-background px-2 text-sm",
						value: M,
						onChange: (e) => {
							re(e.target.value), ae("");
						},
						children: [.../* @__PURE__ */ new Set([b, ...s])].map((e) => /* @__PURE__ */ (0, N.jsx)("option", { children: e }, e))
					})]
				}),
				P ? /* @__PURE__ */ (0, N.jsx)("p", {
					className: "text-sm text-destructive",
					children: P
				}) : /* @__PURE__ */ (0, N.jsxs)("div", {
					className: "grid gap-1",
					children: [
						/* @__PURE__ */ (0, N.jsx)(g, {
							htmlFor: "crRoom",
							children: "New room"
						}),
						/* @__PURE__ */ (0, N.jsx)("select", {
							id: "crRoom",
							size: 8,
							className: "rounded-md border bg-background p-1 text-sm",
							value: ie,
							onChange: (e) => ae(e.target.value),
							children: le.map((e) => /* @__PURE__ */ (0, N.jsxs)("option", {
								value: e.no,
								disabled: !!e.why,
								children: [
									e.no,
									" — ",
									e.why || `${e.free} of ${e.cap} beds free`
								]
							}, e.no))
						}),
						!le.length && /* @__PURE__ */ (0, N.jsx)("span", {
							className: "text-sm text-muted-foreground",
							children: "No rooms set up for this building in Rooms & Buildings."
						}),
						/* @__PURE__ */ (0, N.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: "Rooms that would clash with another stay cannot be chosen."
						})
					]
				}),
				/* @__PURE__ */ (0, N.jsxs)(f, {
					className: "gap-2",
					children: [/* @__PURE__ */ (0, N.jsx)(_, {
						variant: "outline",
						onClick: y,
						children: "Cancel"
					}), /* @__PURE__ */ (0, N.jsx)(_, {
						disabled: !!P || !ue,
						onClick: () => u({
							room: ue.no,
							capacity: ue.cap,
							building: M,
							until: j
						}),
						children: "Change room"
					})]
				})
			]
		})
	});
}
// src/pages/slip/SlipPage.tsx
var ue = [
	"Madina Airport",
	"Jeddah Airport",
	"Makkah",
	"Medina",
	"By car",
	"By bus",
	"By train"
], de = (e) => e ? new Date(e).toISOString() : null, fe = (e) => ({
	...e,
	start: de(e.start),
	end: de(e.end)
});
function pe() {
	let { cloud: n, stay: r, rooms: s, prefs: d, settings: f, ums: p, checkin: m, timefmt: h } = a(), g = s, _ = f, v = c(), T = i(), k = t(), P = e(), se = o(), { siteId: F } = u(), { href: ce } = l(), { ask: pe, dialog: me } = y(), { ask: he, dialog: ge } = b(), _e = (0, x.useRef)(null), ve = (0, x.useRef)(null), I = d.getPrefs(), ye = h.use24(), [L, be] = (0, x.useState)(null), [xe, Se] = (0, x.useState)(!1), [Ce, we] = (0, x.useState)([]), [R, z] = (0, x.useState)({
		after: "-1",
		place: "",
		in_date: "",
		in_time: "",
		out_date: "",
		out_time: "",
		note: ""
	}), [B, Te] = (0, x.useState)(C()), [V, H] = (0, x.useState)([E()]), [U, W] = (0, x.useState)([E()]), [G, Ee] = (0, x.useState)(w()), [De, Oe] = (0, x.useState)({
		date: "",
		time: "",
		status: "tentative"
	}), [K, ke] = (0, x.useState)(null), [Ae, je] = (0, x.useState)(!1), [Me, Ne] = (0, x.useState)(!1), [Pe, Fe] = (0, x.useState)([]), [Ie, Le] = (0, x.useState)([]), [Re, q] = (0, x.useState)(""), [ze, Be] = (0, x.useState)({
		g: "",
		l: ""
	}), [Ve, He] = (0, x.useState)(null), [Ue, We] = (0, x.useState)(/* @__PURE__ */ new Set()), [Ge, Ke] = (0, x.useState)(/* @__PURE__ */ new Set()), [qe, Je] = (0, x.useState)([]), [J, Ye] = (0, x.useState)({
		prefixes: _.DEFAULTS.sh_prefixes,
		re: _.shPattern(_.DEFAULTS.sh_prefixes),
		hold: _.DEFAULTS.delay_hold_days
	}), Xe = (0, x.useRef)(/* @__PURE__ */ new Set()), Y = (0, x.useRef)(null), Ze = (0, x.useRef)(null), Qe = (0, x.useRef)([]);
	Qe.current = Pe;
	let $e = (0, x.useRef)([]);
	$e.current = Ie, Y.current = K;
	let et = (e, t, n) => `${e}|${g.normRoom(t)}|${r.normB(n)}`, X = (0, x.useCallback)(async () => {
		let e = await v.all();
		return Fe(e), Qe.current = e, e;
	}, []), tt = (e) => e ? new Intl.DateTimeFormat(void 0, {
		dateStyle: "medium",
		timeStyle: "short",
		hour12: !ye
	}).format(e) : "";
	(0, x.useEffect)(() => {
		(async () => {
			let [e, t, n, r, i, a] = await Promise.all([
				P("views/slip/room-picker.js"),
				P("views/slip/checkmodal.js"),
				P("views/slip/history.js"),
				se("telemetry"),
				se("itinerary"),
				se("slip-print")
			]);
			try {
				let e = (await T(_.loadSettings())).settings, t = e.sh_prefixes || _.DEFAULTS.sh_prefixes;
				Ye({
					prefixes: t,
					re: _.shPattern(t),
					hold: Number(e.delay_hold_days) || _.DEFAULTS.delay_hold_days
				});
			} catch {}
			let o = await T(g.loadBuildings());
			Le(o), $e.current = o, Te((e) => ({
				...e,
				building: I.slipDefaultBuilding || "",
				checkin_time: I.slipCheckinTime || "",
				checkout_time: I.slipCheckoutTime || ""
			})), v.readonly && q(v.readonlyReason), await X(), be({
				picker: e,
				modal: t,
				hist: n,
				tele: r,
				itin: i,
				sp: a
			});
		})();
	}, []), (0, x.useEffect)(() => {
		L && ve.current && (Ze.current = L.hist.mountSlipHistory({
			host: ve.current,
			api: v,
			current: () => Y.current,
			canWrite: () => !v.readonly,
			onActivated: async (e) => {
				ft(e), await X(), q(`Version in use changed — SH ${e.sh_no || ""} (#${e.id})`);
			}
		}));
	}, [L]), (0, x.useEffect)(() => {
		Ze.current?.load(K);
	}, [K]), (0, x.useEffect)(() => {
		let e = k.get("sh_no");
		L && e && (Te((t) => ({
			...t,
			sh_no: e
		})), Mt(e));
	}, [L]);
	let Z = K == null ? null : Pe.find((e) => e.id === K), nt = Z?.ums?.held, rt = m.isCheckedIn(Z), it = (e) => Number(e) || 0, Q = (e) => (t) => Te((n) => ({
		...n,
		[e]: t.target.value
	})), at = (e) => e === "gents" ? V : U, ot = (e) => e === "gents" ? H : W, st = (e, t, n) => ot(e)((e) => e.map((e) => e.uid === t ? {
		...e,
		...n
	} : e)), ct = (e, t, n) => ot(e)((e) => e.map((e) => e.uid === t ? {
		...e,
		capacity: n,
		...e.dirty ? {} : { assigned: n }
	} : e)), lt = (e) => {
		let t = D(e.room_no), n = (e.building || "").trim() || (B.building || "").trim();
		if (!t || !n) return null;
		let r = g.builderCapacity($e.current, n, t);
		return r != null && r > 0 ? String(r) : null;
	}, ut = (0, x.useMemo)(() => [...g.buildingNames(Ie, F)], [Ie]), dt = B.building && !ut.some((e) => e === B.building) ? [...ut, B.building] : ut;
	function ft(e) {
		Xe.current = new Set(["gents", "ladies"].flatMap((t) => (e.rooms?.[t] || []).map((n) => et(t, n.room_no, n.building || e.building))));
		let t = ne(e);
		we(Array.isArray(e.trip_extra) ? e.trip_extra : []), Te(t.form), Ee(t.delay), H(t.gents.length ? t.gents : [E()]), W(t.ladies.length ? t.ladies : [E()]), We(/* @__PURE__ */ new Set()), Ke(/* @__PURE__ */ new Set());
	}
	function pt() {
		ke(null), je(!1), Xe.current = /* @__PURE__ */ new Set(), Te({
			...C(),
			building: I.slipDefaultBuilding || "",
			checkin_time: I.slipCheckinTime || "",
			checkout_time: I.slipCheckoutTime || ""
		}), Ee(w()), H([E()]), W([E()]), We(/* @__PURE__ */ new Set()), Ke(/* @__PURE__ */ new Set()), Je([]), we([]);
	}
	let mt = () => ({
		...j(B, V, U, G),
		...Ce.length || Z?.trip_extra?.length ? { trip_extra: Ce } : {}
	}), ht = (e, t, n, r) => {
		let i = (i) => i.map((i) => r && i.out_date ? i : {
			...i,
			...e ? { out_date: e } : {},
			...t ? { out_time: t } : {},
			...n ? { out_status: n } : {}
		});
		H(i), W(i);
	};
	async function gt(e) {
		e ? (Ee((e) => ({
			...e,
			on: !0,
			orig: e.orig || {
				date: B.checkout_date,
				time: B.checkout_time
			},
			status: e.status || "tentative"
		})), ht(B.checkout_date, B.checkout_time, "tentative", !0)) : await pe({
			title: "Remove the delayed departure?",
			body: "Every room goes back to one check-out for the whole slip (the check-out above).",
			confirmLabel: "Remove"
		}) && Ee((e) => ({
			...e,
			on: !1
		}));
	}
	function _t() {
		let { date: e, time: t } = De;
		De.status === "unknown" && !e && ({date: e, time: t} = te(J.hold, B.checkout_time)), e ? ht(e, t || B.checkout_time, De.status, !1) : q("Choose the date for all rows (or status \"unknown\" to hold them).");
	}
	async function vt(e, t) {
		let n = Number(t.assigned) || Number(t.capacity) || 0;
		if (n < 2) {
			q("A row needs at least 2 beds to split.");
			return;
		}
		let r = Number(await he({
			title: `Room ${t.room_no}: ${n} beds`,
			body: "How many of them leave at a DIFFERENT time (they get a new row)?",
			value: "1",
			type: "number"
		}));
		if (!Number.isInteger(r) || r < 1 || r >= n) return;
		let i = E({
			room_no: t.room_no,
			capacity: t.capacity,
			assigned: r,
			...t.exclusive ? {
				exclusive: !0,
				building: t.building || ""
			} : {},
			out: {
				date: t.out_date,
				time: t.out_time
			},
			out_status: t.out_status
		});
		ot(e)((e) => {
			let a = e.findIndex((e) => e.uid === t.uid), o = e.map((e) => e.uid === t.uid ? {
				...e,
				assigned: String(n - r),
				dirty: !0
			} : e);
			return o.splice(a + 1, 0, i), o;
		});
	}
	async function yt(e = V, t = U) {
		let n = await X(), r = (B.building || "").trim();
		if (!r) return q("Select a building first."), null;
		let i = /* @__PURE__ */ new Map([[r, ie(n, r)]]), a = await T(g.loadBuildings({ force: !0 }));
		Le(a), $e.current = a;
		let o = 0, s = 0, c = /* @__PURE__ */ new Set(), l = (e) => e.map((e) => {
			let t = D(e.room_no);
			if (!t) return e;
			let l = (e.building || "").trim() || r;
			i.has(l) || i.set(l, ie(n, l));
			let u = g.builderCapacity(a, l, t), d = i.get(l).get(`${l}|${t}`);
			if (u != null || d != null) {
				o++, c.add(e.uid);
				let t = String(u ?? d);
				return {
					...e,
					capacity: t,
					...e.dirty ? {} : { assigned: t }
				};
			}
			return s++, {
				...e,
				capacity: ""
			};
		}), u = {
			gents: l(e),
			ladies: l(t)
		};
		return H(u.gents), W(u.ladies), Ke(c), q(`Capacity fetch: filled ${o} item(s); ${s} unassigned.`), u;
	}
	async function bt() {
		let e = oe(ze.g), t = oe(ze.l), n = e.length ? e.map((e) => E({
			room_no: e,
			capacity: ""
		})) : [E()], r = t.length ? t.map((e) => E({
			room_no: e,
			capacity: ""
		})) : [E()];
		H(n), W(r);
		let i = await yt(n, r), a = i ? xt(i.gents) + xt(i.ladies) : 0;
		He(a), i && q(`Bulk loaded; beds assigned = ${a}.`);
	}
	let xt = (e) => e.reduce((e, t) => {
		let n = Number(t.capacity);
		return e + (Number.isFinite(n) ? n : 0);
	}, 0), St = (e, t) => L.modal.showSlipReport({
		ok: e.okRooms,
		issues: e.issues,
		building: e.building,
		start: e.start,
		end: e.end,
		...t
	}, (e) => ce("timeline", e));
	async function Ct() {
		let e = !0;
		try {
			await n.sync({ force: !0 });
		} catch (t) {
			e = !1, t instanceof n.UserError || console.warn("sync before check", t);
		}
		let t = await X(), i = {
			synced: e,
			last_sync: n.state.lastSync ? new Date(n.state.lastSync).toISOString() : null,
			slips: t.length,
			online: navigator.onLine
		}, a = ae(B, V, U, {
			db: t,
			buildings: $e.current,
			currentId: Y.current,
			loadedRooms: Xe.current,
			stay: r,
			rooms: s,
			delayOn: G.on,
			copy: i
		});
		return We(a.blocked), q(a.pass ? "Availability OK." : `${a.issues.length} room problem${a.issues.length === 1 ? "" : "s"} — see the window.`), a;
	}
	function wt(e, t, n) {
		try {
			L.tele.recordSlipDenial({
				site: F,
				action: e,
				sh_no: B.sh_no.trim(),
				slip_id: Y.current || null,
				building: (B.building || "").trim(),
				form: {
					checkin: `${B.checkin_date} ${B.checkin_time}`,
					checkout: `${B.checkout_date} ${B.checkout_time}`,
					gents: B.gents,
					ladies: B.ladies,
					children: B.children,
					infants: B.infants,
					total: B.total,
					delayed: G.on
				},
				stay: t ? {
					start: de(t.start),
					end: de(t.end)
				} : null,
				rows: (t?.own || []).map(fe),
				issues: t ? t.issues.map((e) => ({
					...e,
					at: de(e.at),
					who: e.who?.map(fe),
					others: e.others?.map(fe)
				})) : [{
					kind: "server",
					...n
				}],
				ok_rooms: t?.okRooms || [],
				copy: t?.copy || null
			});
		} catch (e) {
			console.warn("could not record the refused save", e);
		}
	}
	let Tt = (e, t, n) => {
		wt(n, e), St(e, {
			tone: "bad",
			title: `Not ${t} — ${e.issues.length} problem${e.issues.length === 1 ? "" : "s"} to fix`,
			lead: "Nothing was saved. Fix the points in bold, then press the button again."
		});
	};
	function Et(e, t) {
		wt(t === "Save" ? Y.current ? "copy" : "save" : "update", null, {
			status: e?.status ?? null,
			message: String(e?.message || e).slice(0, 300)
		});
		let r = e instanceof n.UserError ? e.message : `${t} failed: ${e?.message || e}`, i = e?.status === 409 ? ["Another desk changed this slip a moment ago. Load it again (type its SH No. and fetch), check the changes, then save again."] : /offline|connection/i.test(r) ? ["The PMS cannot reach the server. Check the internet connection, then save again — nothing was saved yet."] : e?.status === 403 ? ["This login may not change this site's slips. Ask an admin, or log in with a desk login of this site."] : ["Try again in a moment. If it keeps failing, note the SH No. and tell the admin."];
		L.modal.showSlipReport({
			tone: "bad",
			title: `${t} failed`,
			issues: [{
				kind: "text",
				text: r,
				help: i
			}]
		}, (e) => ce("timeline", e));
	}
	let Dt = (e, t) => `${t.building || ""}${e.okRooms.length ? ` · ${e.okRooms.length} room${e.okRooms.length === 1 ? "" : "s"}` : " · no rooms yet"} · ${tt(new Date(e.start))} → ${tt(new Date(e.end))}`;
	async function Ot() {
		Ne(!0);
		try {
			if (Y.current && Qe.current.find((e) => e.id === Y.current)?.ums && !await pe({
				title: "This slip comes from the UMS import",
				confirmLabel: "Create a copy anyway",
				body: "Use \"Edit\" to update it (rooms, building, times).\n\"Save\" creates a separate copy that will double-count.\n\nCreate a separate copy anyway?"
			})) return;
			let e = mt();
			if (!Y.current) {
				let t = B.sh_no.trim().toUpperCase();
				if (t && await jt(t)) {
					q(`SH ${t} already has a slip — press Fetch to open it (or New Slip, then Save, for another group).`);
					return;
				}
				e.sh_no = "";
			}
			let t = await Ct();
			if (!t.pass) {
				Tt(t, "saved", Y.current ? "copy" : "save");
				return;
			}
			let n = await v.add(e);
			ke(n), je(!1);
			let r = (await X()).find((e) => e.id === n)?.sh_no || e.sh_no;
			Te((e) => ({
				...e,
				sh_no: String(r || "")
			})), q(`Saved as #${n} — SH ${r}`), St(t, {
				tone: "ok",
				title: `Saved ✓ — SH ${r || "—"} (#${n})`,
				lead: Dt(t, e)
			});
		} catch (e) {
			q(e instanceof n.UserError ? e.message : "Save failed."), console.error("Save error:", e), Et(e, "Save");
		} finally {
			Ne(!1);
		}
	}
	async function kt() {
		Ne(!0);
		try {
			if (!Y.current) {
				L.modal.showSlipReport({
					tone: "warn",
					title: "No slip loaded",
					issues: [{
						kind: "text",
						text: "Edit changes a slip that is already saved.",
						help: ["Type its SH No. and fetch it (or open it from a list) first, then press Edit.", "For a brand-new slip use Save instead."]
					}]
				}, (e) => ce("timeline", e));
				return;
			}
			let e = mt(), t = await Ct();
			if (!t.pass) {
				Tt(t, "updated", "update");
				return;
			}
			delete e.createdAt;
			let n = await v.update(Y.current, e);
			q(`Updated #${n}`), Ze.current?.load(Y.current), await X(), St(t, {
				tone: "ok",
				title: `Updated ✓ — SH ${e.sh_no || "—"} (#${n})`,
				lead: Dt(t, e)
			});
		} catch (e) {
			q(e instanceof n.UserError ? e.message : "Edit failed."), console.error("Edit error:", e), Et(e, "Update");
		} finally {
			Ne(!1);
		}
	}
	async function At() {
		let e = await Ct();
		e.pass ? St(e, {
			tone: "ok",
			title: "Availability OK ✓",
			lead: e.okRooms.length ? "Every room has room for this group for the whole stay." : "No rooms entered yet."
		}) : St(e, {
			tone: "bad",
			title: `${e.issues.length} problem${e.issues.length === 1 ? "" : "s"} to fix`,
			lead: "Fix the points in bold before saving."
		});
	}
	async function jt(e) {
		let t = String(e).trim().toUpperCase(), n = (await v.all()).filter((e) => e.ums && p.baseSh(e.sh_no) === p.baseSh(t)).sort((e, t) => `${e.checkin_date}T${e.checkin_time}`.localeCompare(`${t.checkin_date}T${t.checkin_time}`));
		if (Je(n.length >= 2 ? n : []), !n.length) return await v.latestBySh(ee(t)) || null;
		let r = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		return n.find((e) => String(e.sh_no).toUpperCase() === t) || n.find((e) => (e.checkout_date || "") >= r) || n[n.length - 1];
	}
	async function Mt(e) {
		let t = (e ?? B.sh_no).trim();
		if (!J.re.test(t)) {
			q(`Enter a valid SH No.: digits (e.g. 44030)${J.prefixes.length ? `, optionally after ${J.prefixes.join(", ")} (e.g. ${J.prefixes[0]}44030)` : ""}.`);
			return;
		}
		let n = await jt(t);
		n ? (ke(n.id), je(!1), ft(n), q(`Loaded latest slip for SH ${n.sh_no} (#${n.id})`)) : q("No slip found for that SH.");
	}
	async function Nt() {
		if (!I.slipAutoLoadSh || B.tour_name || B.group_leader || B.building && B.building !== I.slipDefaultBuilding) return;
		let e = B.sh_no.trim();
		if (J.re.test(e)) {
			let t = await jt(e);
			t && (ke(t.id), je(!1), ft(t), q(`Auto-loaded latest slip for SH ${t.sh_no} (#${t.id})`));
		}
	}
	async function Pt() {
		let e = (B.building || "").trim(), t = O(B.checkin_date, B.checkin_time), i = O(B.checkout_date, B.checkout_time);
		if (!e) {
			q("Choose the building first.");
			return;
		}
		if (!t || !i || i <= t) {
			q("Enter check-in and check-out (check-out after check-in) first.");
			return;
		}
		try {
			await T(n.sync({ force: !0 }));
		} catch (e) {
			if (!(e instanceof n.UserError)) throw e;
		}
		let a = await X(), o = await T(g.loadBuildings({ force: !0 }));
		Le(o), $e.current = o;
		let s = ie(a, e), c = {
			gents: A(V, G.on, B),
			ladies: A(U, G.on, B)
		}, l = (t) => !t.building || r.normB(t.building) === r.normB(e);
		L.picker.openRoomPicker({
			builderHref: ce("builder"),
			building: e,
			host: _e.current,
			onlyFree: I.pickerOnlyFree,
			checkin: {
				date: B.checkin_date,
				time: B.checkin_time
			},
			checkout: {
				date: B.checkout_date,
				time: B.checkout_time
			},
			slips: a,
			buildings: o,
			excludeId: Y.current,
			historyCap: (t) => s.get(`${e}|${D(t)}`) ?? null,
			current: {
				gents: c.gents.filter(l),
				ladies: c.ladies.filter(l)
			},
			needs: {
				gents: B.gents,
				ladies: B.ladies,
				children: B.children,
				infants: B.infants
			},
			onApply: (e, t) => {
				let n = (e) => [...c.gents, ...c.ladies].find((t) => t.moves && D(t.room_no) === D(e.room_no)), r = (e) => e.length ? e.map((e) => E(e.moves || !n(e) ? e : {
					...e,
					moves: n(e).moves,
					building: n(e).building
				})) : [E()];
				H(r([...e, ...c.gents.filter((e) => !l(e))])), W(r([...t, ...c.ladies.filter((e) => !l(e))]));
			}
		});
	}
	let [Ft, It] = (0, x.useState)(null);
	function Lt(e) {
		let t = {
			room: D(Ft.room_no),
			building: (Ft.building || "").trim() || B.building
		}, n = {
			room: e.room,
			capacity: e.capacity,
			building: e.building
		};
		H((r) => M(r, t, n, e.until, B.building)), W((r) => M(r, t, n, e.until, B.building)), It(null), q(`Room ${t.room} → ${e.room} from ${e.until.date.split("-").reverse().join("/")} ${e.until.time}. Press Edit to save it.`);
	}
	function Rt(e) {
		let t = e.moves[e.moves.length - 1], n = (n) => D(n.room_no) === D(e.room_no) && JSON.stringify(n.moves?.[n.moves.length - 1]?.until) === JSON.stringify(t.until), r = (e) => e.map((e) => n(e) ? re(e, B.building) : e);
		H(r), W(r), q(`Back to room ${t.room_no}. Press Edit to save it.`);
	}
	async function zt() {
		if (Z) {
			Ne(!0);
			try {
				await m.setCheckedIn(v, Z, !rt);
				let e = (await X()).find((e) => e.id === K);
				e && ft(e), Ze.current?.load(K), q(m.isCheckedIn(e) ? `SH ${Z.sh_no} checked in.` : `SH ${Z.sh_no} check-in undone.`);
			} catch (e) {
				q(e.message || "Could not save the check-in.");
			} finally {
				Ne(!1);
			}
		}
	}
	if (!L) return /* @__PURE__ */ (0, N.jsxs)(N.Fragment, { children: [/* @__PURE__ */ (0, N.jsx)("style", { children: S }), /* @__PURE__ */ (0, N.jsx)("div", {
		className: "wrap",
		children: /* @__PURE__ */ (0, N.jsx)("p", {
			className: "muted",
			children: "Loading…"
		})
	})] });
	let Bt = (e) => A(e, !1, B).reduce((e, t) => e + (t.assigned === "" ? Number(t.capacity) || 0 : t.assigned), 0), Vt = A(V, !1, B).some((e) => e.gl) ? "Gents" : A(U, !1, B).some((e) => e.gl) ? "Ladies" : "", Ht = Bt(V), Ut = Bt(U), Wt = it(B.gents), Gt = it(B.ladies) + it(B.children), Kt = (e, t, n, r) => /* @__PURE__ */ (0, N.jsxs)("span", {
		className: n && t === n ? "ok" : "",
		children: [
			e,
			" ",
			/* @__PURE__ */ (0, N.jsx)("b", { children: t }),
			n ? ` / ${n}` : "",
			r ? /* @__PURE__ */ (0, N.jsxs)(N.Fragment, { children: [" ", /* @__PURE__ */ (0, N.jsx)("small", { children: r })] }) : null,
			" "
		]
	}), qt = (e, t) => ye ? /* @__PURE__ */ (0, N.jsx)("input", {
		id: e,
		type: "text",
		inputMode: "numeric",
		placeholder: "HH:MM",
		pattern: "([01][0-9]|2[0-3]):[0-5][0-9]",
		maxLength: 5,
		value: B[t],
		onChange: Q(t)
	}) : /* @__PURE__ */ (0, N.jsx)("input", {
		id: e,
		type: "time",
		value: B[t],
		onChange: Q(t)
	}), Jt = (e) => at(e).map((t) => /* @__PURE__ */ (0, N.jsxs)("tr", {
		className: `${t.exclusive ? "excl " : ""}${Ge.has(t.uid) ? "okfill " : ""}${Ue.has(D(t.room_no)) && D(t.room_no) ? "conflict" : ""}`,
		"data-gl": t.gl ? "1" : void 0,
		children: [
			/* @__PURE__ */ (0, N.jsxs)("td", { children: [
				/* @__PURE__ */ (0, N.jsx)("input", {
					type: "text",
					value: t.room_no,
					onChange: (n) => st(e, t.uid, { room_no: n.target.value })
				}),
				t.gl && /* @__PURE__ */ (0, N.jsx)("span", {
					className: "gl-badge",
					title: "Group leader's room",
					children: "GL"
				}),
				t.moves?.map((e, n) => /* @__PURE__ */ (0, N.jsxs)("small", {
					className: "moved-note",
					children: [
						"was ",
						e.room_no,
						e.building ? ` (${e.building})` : "",
						" until ",
						e.until.date.split("-").reverse().slice(0, 2).join("/"),
						" ",
						e.until.time,
						n === t.moves.length - 1 && /* @__PURE__ */ (0, N.jsx)("button", {
							type: "button",
							className: "linkish",
							title: "Take this room change back",
							onClick: () => Rt(t),
							children: "undo"
						})
					]
				}, n)),
				(t.building || "").trim() && !t.exclusive && /* @__PURE__ */ (0, N.jsxs)("small", {
					className: "moved-note",
					children: ["in ", t.building]
				})
			] }),
			/* @__PURE__ */ (0, N.jsx)("td", { children: /* @__PURE__ */ (0, N.jsx)("input", {
				type: "number",
				min: 0,
				step: 1,
				inputMode: "numeric",
				value: t.capacity,
				placeholder: t.capacity === "" && t.room_no ? "unassigned" : "",
				onChange: (n) => ct(e, t.uid, n.target.value)
			}) }),
			/* @__PURE__ */ (0, N.jsx)("td", { children: /* @__PURE__ */ (0, N.jsx)("input", {
				type: "number",
				min: 0,
				step: 1,
				inputMode: "numeric",
				placeholder: "assigned",
				value: t.assigned,
				onChange: (n) => st(e, t.uid, {
					assigned: n.target.value,
					dirty: !0
				})
			}) }),
			/* @__PURE__ */ (0, N.jsxs)("td", {
				className: "excl-cell",
				children: [/* @__PURE__ */ (0, N.jsxs)("label", {
					className: "excl-on",
					title: "Keep the whole room for these guests",
					children: [
						/* @__PURE__ */ (0, N.jsx)("input", {
							type: "checkbox",
							className: "excl-chk",
							"aria-label": "Exclusive room",
							checked: !!t.exclusive,
							onChange: (n) => {
								let r = n.target.checked;
								if (st(e, t.uid, {
									exclusive: r,
									...r ? {} : { building: "" }
								}), r) {
									let n = lt({
										...t,
										exclusive: !0
									});
									n && ct(e, t.uid, n);
								}
							}
						}),
						" ",
						/* @__PURE__ */ (0, N.jsx)("span", { children: "Excl." })
					]
				}), t.exclusive && /* @__PURE__ */ (0, N.jsxs)("select", {
					className: "excl-bld",
					"aria-label": "Building of this exclusive room",
					value: t.building || "",
					onChange: (n) => {
						st(e, t.uid, { building: n.target.value });
						let r = lt({
							...t,
							building: n.target.value
						});
						r && ct(e, t.uid, r);
					},
					children: [/* @__PURE__ */ (0, N.jsx)("option", {
						value: "",
						children: "Same as the slip"
					}), (t.building && !ut.some((e) => r.normB(e) === r.normB(t.building)) ? [...ut, t.building] : ut).map((e) => /* @__PURE__ */ (0, N.jsx)("option", { children: e }, e))]
				})]
			}),
			/* @__PURE__ */ (0, N.jsxs)("td", {
				className: "out-cell",
				children: [
					/* @__PURE__ */ (0, N.jsx)("input", {
						type: "date",
						className: "out-date",
						"aria-label": "Leaves on",
						value: t.out_date,
						onChange: (n) => st(e, t.uid, { out_date: n.target.value })
					}),
					/* @__PURE__ */ (0, N.jsx)("input", {
						type: "time",
						className: "out-time",
						"aria-label": "Leaves at",
						value: t.out_time,
						onChange: (n) => st(e, t.uid, { out_time: n.target.value })
					}),
					/* @__PURE__ */ (0, N.jsxs)("select", {
						className: "out-status",
						"aria-label": "Status",
						value: t.out_status,
						onChange: (n) => {
							let r = n.target.value;
							st(e, t.uid, {
								out_status: r,
								...r === "unknown" ? (() => {
									let e = te(J.hold, B.checkout_time);
									return {
										out_date: e.date,
										out_time: e.time
									};
								})() : {}
							});
						},
						children: [
							/* @__PURE__ */ (0, N.jsx)("option", {
								value: "confirmed",
								children: "confirmed"
							}),
							/* @__PURE__ */ (0, N.jsx)("option", {
								value: "tentative",
								children: "tentative"
							}),
							/* @__PURE__ */ (0, N.jsx)("option", {
								value: "unknown",
								children: "unknown"
							})
						]
					}),
					/* @__PURE__ */ (0, N.jsx)("button", {
						type: "button",
						className: "row-btn out-split",
						title: "Split this row: some of its beds leave at a different time",
						onClick: () => void vt(e, t),
						children: "✂"
					})
				]
			}),
			/* @__PURE__ */ (0, N.jsxs)("td", { children: [K != null && D(t.room_no) && !v.readonly && /* @__PURE__ */ (0, N.jsx)("button", {
				className: "row-btn",
				type: "button",
				title: "Change room during the stay: from a date, without touching the days already spent in this room",
				onClick: () => It(t),
				children: "⇄"
			}), /* @__PURE__ */ (0, N.jsx)("button", {
				className: "row-btn",
				type: "button",
				title: "Delete row",
				onClick: () => ot(e)((e) => e.length > 1 ? e.filter((e) => e.uid !== t.uid) : [E()]),
				children: "X"
			})] })
		]
	}, t.uid)), Yt = (e, t) => /* @__PURE__ */ (0, N.jsxs)("table", {
		className: "mini",
		id: e === "gents" ? "tblGents" : "tblLadies",
		children: [
			/* @__PURE__ */ (0, N.jsx)("caption", { children: t }),
			/* @__PURE__ */ (0, N.jsx)("thead", { children: /* @__PURE__ */ (0, N.jsxs)("tr", { children: [
				/* @__PURE__ */ (0, N.jsx)("th", {
					style: { width: "34%" },
					children: "Room No"
				}),
				/* @__PURE__ */ (0, N.jsx)("th", {
					style: { width: "16%" },
					children: "Capacity"
				}),
				/* @__PURE__ */ (0, N.jsx)("th", {
					style: { width: "16%" },
					children: "Assigned"
				}),
				/* @__PURE__ */ (0, N.jsx)("th", {
					className: "excl-cell",
					title: "Exclusive: the room is kept for these guests alone (a couple or a single who wants privacy) — the whole room is blocked, only the guests assigned are counted as pax",
					children: "Exclusive"
				}),
				/* @__PURE__ */ (0, N.jsxs)("th", {
					className: "out-cell",
					children: ["Leaves ", /* @__PURE__ */ (0, N.jsx)("span", {
						className: "muted",
						children: "(date · time · status)"
					})]
				}),
				/* @__PURE__ */ (0, N.jsx)("th", { style: { width: "10%" } })
			] }) }),
			/* @__PURE__ */ (0, N.jsx)("tbody", {
				id: `${e}-tbody`,
				children: Jt(e)
			}),
			/* @__PURE__ */ (0, N.jsx)("tfoot", { children: /* @__PURE__ */ (0, N.jsx)("tr", { children: /* @__PURE__ */ (0, N.jsx)("td", {
				colSpan: 3,
				children: /* @__PURE__ */ (0, N.jsx)("button", {
					className: "row-btn",
					type: "button",
					onClick: () => ot(e)((e) => [...e, E()]),
					children: "Add Row"
				})
			}) }) })
		]
	}), $ = K != null, Xt = async (e) => {
		if (e.site !== "medina" || !e.checkout_date) return e;
		try {
			let [t, n] = await Promise.all([se("transport"), se("travel-mode")]), r = ((await t.loadDay(e.site, e.checkout_date)).rows || []).find((t) => p.baseSh(t.ref) === p.baseSh(e.sh_no));
			return r ? {
				...e,
				_leave: n.tripMode(r)
			} : e;
		} catch {
			return e;
		}
	};
	return /* @__PURE__ */ (0, N.jsxs)(N.Fragment, { children: [
		/* @__PURE__ */ (0, N.jsx)("style", { children: S }),
		/* @__PURE__ */ (0, N.jsxs)("div", {
			className: "wrap",
			ref: _e,
			children: [
				Ft && /* @__PURE__ */ (0, N.jsx)(le, {
					row: Ft,
					form: B,
					gents: V,
					ladies: U,
					mine: {
						...j(B, V, U, G),
						id: K
					},
					slips: Pe.filter((e) => e.id !== K),
					buildings: Ie,
					names: ut,
					stay: r,
					rooms: g,
					onApply: Lt,
					onClose: () => It(null)
				}),
				Z && /* @__PURE__ */ (0, N.jsxs)("div", {
					className: "slip-corner no-print",
					children: [
						/* @__PURE__ */ (0, N.jsx)("button", {
							type: "button",
							title: "This slip as an A5 picture to send to its group leader (Copy picture / Save JPEG)",
							onClick: () => void Xt(Z).then((e) => L.sp.openGlCopies([e], { title: `SH ${Z.sh_no}` })),
							children: "GL copy"
						}),
						/* @__PURE__ */ (0, N.jsx)("button", {
							type: "button",
							title: "Print this slip (A5)",
							onClick: () => void Xt(Z).then((e) => L.sp.printSlips([e], { title: `SH ${Z.sh_no}` })),
							children: "Print slip"
						}),
						/* @__PURE__ */ (0, N.jsx)("button", {
							type: "button",
							title: "The A4 itinerary letter of this slip",
							onClick: () => L.sp.printItineraries([Z], Pe, { title: `SH ${Z.sh_no}` }),
							children: "Print itinerary"
						})
					]
				}),
				/* @__PURE__ */ (0, N.jsx)("table", {
					className: "grid kv",
					children: /* @__PURE__ */ (0, N.jsxs)("tbody", { children: [
						/* @__PURE__ */ (0, N.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, N.jsx)("td", {
								colSpan: 2,
								children: /* @__PURE__ */ (0, N.jsxs)("div", {
									className: "inline",
									children: [
										/* @__PURE__ */ (0, N.jsx)("input", {
											placeholder: $ ? "SH Number" : "SH No. to find a slip",
											id: "sh_no",
											name: "sh_no",
											type: "text",
											value: B.sh_no,
											onChange: Q("sh_no"),
											onBlur: () => void Nt(),
											readOnly: $,
											"aria-readonly": $,
											className: $ ? "sh-locked" : void 0,
											title: $ ? "This slip's own SH — it cannot be changed. Press New Slip to look up another SH." : "Type an SH and press Fetch to open its slip. A new slip gets its own SH (MP… / DP…) when you Save."
										}),
										/* @__PURE__ */ (0, N.jsx)("button", {
											id: "btnFetchSh",
											type: "button",
											title: $ ? "Press New Slip first to look up another SH" : "Fetch latest slip with this SH",
											disabled: $,
											onClick: () => void Mt(),
											children: "Fetch"
										}),
										qe.length >= 2 && /* @__PURE__ */ (0, N.jsx)("select", {
											id: "stayPick",
											title: "This SH has more than one stay here",
											value: String(K ?? ""),
											onChange: (e) => {
												let t = qe.find((t) => t.id === Number(e.target.value));
												t && (ke(t.id), je(!1), ft(t), q(`Loaded stay #${t.id} for SH ${t.sh_no}`));
											},
											children: qe.map((e) => /* @__PURE__ */ (0, N.jsxs)("option", {
												value: e.id,
												children: [
													e.sh_no,
													" · ",
													(e.checkin_date || "").split("-").reverse().join("/"),
													" → ",
													(e.checkout_date || "").split("-").reverse().join("/"),
													e.building ? " · " + e.building : ""
												]
											}, e.id))
										})
									]
								})
							}),
							/* @__PURE__ */ (0, N.jsx)("td", {
								colSpan: 4,
								children: /* @__PURE__ */ (0, N.jsx)("input", {
									placeholder: "Tour Name",
									id: "tour_name",
									type: "text",
									value: B.tour_name,
									onChange: Q("tour_name")
								})
							}),
							/* @__PURE__ */ (0, N.jsx)("td", {
								colSpan: 4,
								children: /* @__PURE__ */ (0, N.jsx)("input", {
									placeholder: "Group Leader Name",
									id: "group_leader",
									type: "text",
									value: B.group_leader,
									onChange: Q("group_leader")
								})
							}),
							/* @__PURE__ */ (0, N.jsx)("th", { children: "G" }),
							/* @__PURE__ */ (0, N.jsx)("td", { children: /* @__PURE__ */ (0, N.jsx)("input", {
								placeholder: "Gents",
								id: "gents",
								type: "number",
								inputMode: "numeric",
								min: 0,
								step: 1,
								value: B.gents,
								onChange: Q("gents")
							}) }),
							/* @__PURE__ */ (0, N.jsx)("th", { children: "L" }),
							/* @__PURE__ */ (0, N.jsx)("td", { children: /* @__PURE__ */ (0, N.jsx)("input", {
								placeholder: "Ladies",
								id: "ladies",
								type: "number",
								inputMode: "numeric",
								min: 0,
								step: 1,
								value: B.ladies,
								onChange: Q("ladies")
							}) }),
							/* @__PURE__ */ (0, N.jsx)("td", {
								colSpan: 2,
								children: /* @__PURE__ */ (0, N.jsxs)("select", {
									id: "building",
									value: B.building,
									onChange: Q("building"),
									children: [/* @__PURE__ */ (0, N.jsx)("option", {
										value: "",
										children: "Select building…"
									}), dt.map((e) => /* @__PURE__ */ (0, N.jsx)("option", { children: e }, e))]
								})
							})
						] }),
						/* @__PURE__ */ (0, N.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, N.jsx)("th", { children: "CHECK IN" }),
							/* @__PURE__ */ (0, N.jsx)("td", { children: /* @__PURE__ */ (0, N.jsx)("input", {
								id: "checkin_date",
								type: "date",
								value: B.checkin_date,
								onChange: Q("checkin_date")
							}) }),
							/* @__PURE__ */ (0, N.jsx)("td", {
								colSpan: 2,
								children: qt("checkin_time", "checkin_time")
							}),
							/* @__PURE__ */ (0, N.jsx)("th", { children: "CHECK OUT" }),
							/* @__PURE__ */ (0, N.jsx)("td", { children: /* @__PURE__ */ (0, N.jsx)("input", {
								id: "checkout_date",
								type: "date",
								value: B.checkout_date,
								onChange: Q("checkout_date")
							}) }),
							/* @__PURE__ */ (0, N.jsx)("td", {
								colSpan: 2,
								children: qt("checkout_time", "checkout_time")
							}),
							/* @__PURE__ */ (0, N.jsx)("th", { children: "T" }),
							/* @__PURE__ */ (0, N.jsx)("td", { children: /* @__PURE__ */ (0, N.jsx)("input", {
								placeholder: "Total",
								id: "total",
								type: "number",
								inputMode: "numeric",
								min: 0,
								step: 1,
								value: B.total,
								onChange: Q("total")
							}) }),
							/* @__PURE__ */ (0, N.jsx)("th", { children: "I" }),
							/* @__PURE__ */ (0, N.jsx)("td", { children: /* @__PURE__ */ (0, N.jsx)("input", {
								placeholder: "Infants",
								id: "infants",
								type: "number",
								inputMode: "numeric",
								min: 0,
								step: 1,
								value: B.infants,
								onChange: Q("infants")
							}) }),
							/* @__PURE__ */ (0, N.jsx)("th", { children: "C" }),
							/* @__PURE__ */ (0, N.jsx)("td", { children: /* @__PURE__ */ (0, N.jsx)("input", {
								placeholder: "Children",
								id: "children",
								type: "number",
								inputMode: "numeric",
								min: 0,
								step: 1,
								value: B.children,
								onChange: Q("children")
							}) })
						] }),
						I.slipFromTo && /* @__PURE__ */ (0, N.jsxs)("tr", {
							id: "fromToRow",
							children: [
								/* @__PURE__ */ (0, N.jsx)("th", { children: "FROM" }),
								/* @__PURE__ */ (0, N.jsx)("td", {
									colSpan: 6,
									children: /* @__PURE__ */ (0, N.jsxs)("select", {
										id: "from_place",
										"aria-label": "Coming from",
										value: B.from_place,
										onChange: Q("from_place"),
										children: [/* @__PURE__ */ (0, N.jsx)("option", {
											value: "",
											children: "—"
										}), [...ue, ...B.from_place && !ue.includes(B.from_place) ? [B.from_place] : []].map((e) => /* @__PURE__ */ (0, N.jsx)("option", { children: e }, e))]
									})
								}),
								/* @__PURE__ */ (0, N.jsx)("th", { children: "TO" }),
								/* @__PURE__ */ (0, N.jsx)("td", {
									colSpan: 6,
									children: /* @__PURE__ */ (0, N.jsxs)("select", {
										id: "to_place",
										"aria-label": "Going to",
										value: B.to_place,
										onChange: Q("to_place"),
										children: [/* @__PURE__ */ (0, N.jsx)("option", {
											value: "",
											children: "—"
										}), [...ue, ...B.to_place && !ue.includes(B.to_place) ? [B.to_place] : []].map((e) => /* @__PURE__ */ (0, N.jsx)("option", { children: e }, e))]
									})
								})
							]
						}),
						/* @__PURE__ */ (0, N.jsxs)("tr", { children: [/* @__PURE__ */ (0, N.jsx)("th", { children: "NOTES" }), /* @__PURE__ */ (0, N.jsx)("td", {
							colSpan: 13,
							children: /* @__PURE__ */ (0, N.jsx)("textarea", {
								id: "notes",
								rows: 2,
								maxLength: 500,
								placeholder: "Notes for this slip (printed on the slip and the GL copy)",
								"aria-label": "Notes",
								value: B.notes,
								onChange: Q("notes")
							})
						})] })
					] })
				}),
				/* @__PURE__ */ (0, N.jsxs)("div", {
					className: `delay-box${G.on ? " on" : ""}`,
					id: "delayBox",
					children: [
						/* @__PURE__ */ (0, N.jsxs)("label", {
							className: "delay-on",
							children: [
								/* @__PURE__ */ (0, N.jsx)("input", {
									type: "checkbox",
									id: "delayOn",
									checked: G.on,
									onChange: (e) => void gt(e.target.checked)
								}),
								" ",
								/* @__PURE__ */ (0, N.jsx)("b", { children: "Delayed departure" })
							]
						}),
						" ",
						/* @__PURE__ */ (0, N.jsx)("span", {
							className: "muted",
							id: "delayInfo",
							children: G.on ? `Booked check-out ${G.orig ? `${G.orig.date} ${G.orig.time}` : "—"} · set each room's own check-out below (✂ splits a room's beds). Unknown holds the beds ${J.hold} days.` : "Tick when the group cannot leave on its booked date — each room row then gets its own check-out."
						}),
						G.on && /* @__PURE__ */ (0, N.jsxs)("div", {
							className: "delay-ctl",
							id: "delayCtl",
							children: [
								/* @__PURE__ */ (0, N.jsxs)("label", { children: ["Status ", /* @__PURE__ */ (0, N.jsxs)("select", {
									id: "delayStatus",
									value: G.status,
									onChange: (e) => Ee((t) => ({
										...t,
										status: e.target.value
									})),
									children: [
										/* @__PURE__ */ (0, N.jsx)("option", {
											value: "tentative",
											children: "Tentative (ticket not confirmed)"
										}),
										/* @__PURE__ */ (0, N.jsx)("option", {
											value: "unknown",
											children: "Unknown date (held)"
										}),
										/* @__PURE__ */ (0, N.jsx)("option", {
											value: "confirmed",
											children: "Confirmed new date"
										})
									]
								})] }),
								/* @__PURE__ */ (0, N.jsxs)("label", {
									className: "delay-note",
									children: ["Note ", /* @__PURE__ */ (0, N.jsx)("input", {
										id: "delayNote",
										maxLength: 300,
										placeholder: "e.g. waiting for Saudia tickets, call GL on…",
										value: G.note,
										onChange: (e) => Ee((t) => ({
											...t,
											note: e.target.value
										}))
									})]
								}),
								/* @__PURE__ */ (0, N.jsxs)("span", {
									className: "delay-all",
									children: [
										"All rows:",
										/* @__PURE__ */ (0, N.jsx)("input", {
											type: "date",
											id: "delayAllDate",
											"aria-label": "Check-out date for all rows",
											value: De.date,
											onChange: (e) => Oe((t) => ({
												...t,
												date: e.target.value
											}))
										}),
										/* @__PURE__ */ (0, N.jsx)("input", {
											type: "time",
											id: "delayAllTime",
											"aria-label": "Check-out time for all rows",
											value: De.time,
											onChange: (e) => Oe((t) => ({
												...t,
												time: e.target.value
											}))
										}),
										/* @__PURE__ */ (0, N.jsxs)("select", {
											id: "delayAllStatus",
											"aria-label": "Status for all rows",
											value: De.status,
											onChange: (e) => Oe((t) => ({
												...t,
												status: e.target.value
											})),
											children: [
												/* @__PURE__ */ (0, N.jsx)("option", {
													value: "tentative",
													children: "tentative"
												}),
												/* @__PURE__ */ (0, N.jsx)("option", {
													value: "unknown",
													children: "unknown"
												}),
												/* @__PURE__ */ (0, N.jsx)("option", {
													value: "confirmed",
													children: "confirmed"
												})
											]
										}),
										/* @__PURE__ */ (0, N.jsx)("button", {
											type: "button",
											id: "delayApplyAll",
											className: "row-btn",
											onClick: _t,
											children: "Apply"
										})
									]
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, N.jsxs)("div", {
					className: "bulk-row",
					children: [
						/* @__PURE__ */ (0, N.jsx)("input", {
							id: "gentsBulk",
							type: "text",
							placeholder: "Gents Rooms: 501-502-503",
							value: ze.g,
							onChange: (e) => Be((t) => ({
								...t,
								g: e.target.value
							})),
							onKeyDown: (e) => {
								e.key === "Enter" && (e.preventDefault(), bt());
							}
						}),
						/* @__PURE__ */ (0, N.jsx)("input", {
							id: "ladiesBulk",
							type: "text",
							placeholder: "Ladies Rooms: 401-402-403",
							value: ze.l,
							onChange: (e) => Be((t) => ({
								...t,
								l: e.target.value
							})),
							onKeyDown: (e) => {
								e.key === "Enter" && (e.preventDefault(), bt());
							}
						}),
						/* @__PURE__ */ (0, N.jsx)("button", {
							id: "btnBulkLoad",
							type: "button",
							onClick: () => void bt(),
							children: "Load"
						}),
						/* @__PURE__ */ (0, N.jsx)("button", {
							id: "btnPickRooms",
							className: "btn-hot",
							type: "button",
							title: "See free beds for the whole stay and pick rooms",
							onClick: () => void Pt(),
							children: "Pick rooms…"
						}),
						/* @__PURE__ */ (0, N.jsx)("span", {
							id: "allocSum",
							className: "alloc-sum",
							"aria-live": "polite",
							children: Ht || Ut || Wt || Gt ? /* @__PURE__ */ (0, N.jsxs)(N.Fragment, { children: [
								"Assigned: ",
								Kt("Gents", Ht, Wt, Vt === "Gents" ? "incl. GL" : ""),
								Kt("Ladies", Ut, Gt, [it(B.children) ? `${it(B.ladies)} + ${it(B.children)} children` : "", Vt === "Ladies" ? "incl. GL" : ""].filter(Boolean).join(" · "))
							] }) : null
						}),
						/* @__PURE__ */ (0, N.jsx)("span", {
							id: "bulkReport",
							className: "muted",
							style: Ve == null ? void 0 : {
								fontWeight: 700,
								fontSize: 22,
								color: "#654321"
							},
							children: Ve == null ? "" : /* @__PURE__ */ (0, N.jsxs)(N.Fragment, { children: ["Beds assigned: ", /* @__PURE__ */ (0, N.jsx)("span", {
								style: {
									fontWeight: 800,
									fontSize: 26
								},
								children: Ve
							})] })
						})
					]
				}),
				/* @__PURE__ */ (0, N.jsxs)("div", {
					className: `subtables${G.on ? " delayed" : ""}`,
					style: { marginTop: 16 },
					children: [Yt("gents", "GENTS — Rooms"), Yt("ladies", "LADIES — Rooms")]
				}),
				/* @__PURE__ */ (0, N.jsxs)("div", {
					className: "toolbar no-print",
					children: [/* @__PURE__ */ (0, N.jsx)("button", {
						id: "btnFetchCap",
						onClick: () => void yt(),
						children: "Fetch & Assign"
					}), /* @__PURE__ */ (0, N.jsx)("button", {
						id: "btnCheckAvail",
						onClick: () => void At(),
						children: "Check room availability"
					})]
				}),
				/* @__PURE__ */ (0, N.jsxs)("div", {
					className: "help no-print",
					children: [
						"Use ",
						/* @__PURE__ */ (0, N.jsx)("b", { children: "Fetch capacity data" }),
						" after you enter room numbers. Unknown rooms show capacity placeholder ",
						/* @__PURE__ */ (0, N.jsx)("b", { children: "“unassigned.”" }),
						/* @__PURE__ */ (0, N.jsx)("br", {}),
						"Use ",
						/* @__PURE__ */ (0, N.jsx)("b", { children: "Check room availability" }),
						" to catch conflicts before saving."
					]
				}),
				nt && /* @__PURE__ */ (0, N.jsxs)("div", {
					id: "umsHeld",
					className: "ums-held no-print",
					role: "alert",
					children: [
						"UMS wants ",
						p.wantedText(Z, nt),
						", but that would overfill a room: ",
						p.heldText(nt),
						". The dates were not changed. Move a group to another room (Pick rooms) — the next UMS import applies the new dates by itself."
					]
				}),
				L && (() => {
					let e = L.itin.tripOf({
						...Z || {
							...mt(),
							site: F
						},
						trip_extra: Ce
					}, Pe);
					if (e.legs.length < 2 && !Ce.length && !$) return null;
					let t = (e) => e ? L.itin.when(e) : "", n = (e) => e.own && !e.here ? e.own : null, r = () => {
						let e = R;
						e.place.trim() && (we((t) => [...t, {
							after: Number(e.after),
							place: e.place.trim(),
							in_date: e.in_date,
							in_time: e.in_time,
							out_date: e.out_date,
							out_time: e.out_time,
							note: e.note.trim()
						}]), z((e) => ({
							...e,
							place: "",
							in_date: "",
							in_time: "",
							out_date: "",
							out_time: "",
							note: ""
						})));
					};
					return /* @__PURE__ */ (0, N.jsxs)("section", {
						id: "tripBox",
						className: "trip no-print",
						children: [
							/* @__PURE__ */ (0, N.jsxs)("h3", { children: [
								"Trip — ",
								e.route,
								" ",
								/* @__PURE__ */ (0, N.jsx)("small", { children: e.cities })
							] }),
							/* @__PURE__ */ (0, N.jsx)("ol", {
								className: "trip-list",
								children: e.stops.map((e, r) => /* @__PURE__ */ (0, N.jsxs)("li", {
									className: e.here ? "here" : "",
									children: [
										/* @__PURE__ */ (0, N.jsx)("b", { children: e.label }),
										" ",
										e.extra && /* @__PURE__ */ (0, N.jsx)("em", { children: "added stop" }),
										/* @__PURE__ */ (0, N.jsxs)("span", { children: [
											t(e.in) || "—",
											" → ",
											t(e.out) || "—"
										] }),
										e.building && /* @__PURE__ */ (0, N.jsx)("span", { children: e.building }),
										e.here && /* @__PURE__ */ (0, N.jsx)("em", { children: "this slip" }),
										n(e) && /* @__PURE__ */ (0, N.jsx)("button", {
											type: "button",
											className: "linkish",
											onClick: () => {
												ke(n(e).id), je(!1), ft(n(e)), q(`Loaded SH ${n(e).sh_no} (#${n(e).id})`);
											},
											children: "open this stay"
										}),
										!e.extra && !e.own && /* @__PURE__ */ (0, N.jsx)("em", { children: "the other site's slip" })
									]
								}, r))
							}),
							Ce.length > 0 && /* @__PURE__ */ (0, N.jsx)("div", {
								className: "trip-extra",
								children: Ce.map((e, t) => /* @__PURE__ */ (0, N.jsxs)("span", {
									className: "chip",
									children: [
										e.place,
										e.in_date ? ` · ${e.in_date}` : "",
										" ",
										/* @__PURE__ */ (0, N.jsx)("button", {
											type: "button",
											"aria-label": `Remove stop ${e.place}`,
											onClick: () => we((e) => e.filter((e, n) => n !== t)),
											children: "✕"
										})
									]
								}, t))
							}),
							!v.readonly && !xe && /* @__PURE__ */ (0, N.jsx)("button", {
								type: "button",
								className: "linkish",
								onClick: () => Se(!0),
								children: "+ Add an extra stop to the itinerary"
							}),
							!v.readonly && xe && /* @__PURE__ */ (0, N.jsxs)("div", {
								className: "trip-add",
								children: [
									/* @__PURE__ */ (0, N.jsxs)("select", {
										"aria-label": "Where the stop goes",
										value: R.after,
										onChange: (e) => z((t) => ({
											...t,
											after: e.target.value
										})),
										children: [/* @__PURE__ */ (0, N.jsxs)("option", {
											value: "-1",
											children: ["above ", e.legs[0]?.label]
										}), e.legs.map((t, n) => /* @__PURE__ */ (0, N.jsx)("option", {
											value: n,
											children: n === e.legs.length - 1 ? `below ${t.label}` : `between ${t.label} and ${e.legs[n + 1].label}`
										}, n))]
									}),
									/* @__PURE__ */ (0, N.jsx)("input", {
										placeholder: "Stop (place)",
										value: R.place,
										onChange: (e) => z((t) => ({
											...t,
											place: e.target.value
										}))
									}),
									/* @__PURE__ */ (0, N.jsx)("input", {
										type: "date",
										"aria-label": "In date",
										value: R.in_date,
										onChange: (e) => z((t) => ({
											...t,
											in_date: e.target.value
										}))
									}),
									/* @__PURE__ */ (0, N.jsx)("input", {
										type: "time",
										"aria-label": "In time",
										value: R.in_time,
										onChange: (e) => z((t) => ({
											...t,
											in_time: e.target.value
										}))
									}),
									/* @__PURE__ */ (0, N.jsx)("input", {
										type: "date",
										"aria-label": "Out date",
										value: R.out_date,
										onChange: (e) => z((t) => ({
											...t,
											out_date: e.target.value
										}))
									}),
									/* @__PURE__ */ (0, N.jsx)("input", {
										type: "time",
										"aria-label": "Out time",
										value: R.out_time,
										onChange: (e) => z((t) => ({
											...t,
											out_time: e.target.value
										}))
									}),
									/* @__PURE__ */ (0, N.jsx)("input", {
										placeholder: "Note (optional)",
										value: R.note,
										onChange: (e) => z((t) => ({
											...t,
											note: e.target.value
										}))
									}),
									/* @__PURE__ */ (0, N.jsx)("button", {
										type: "button",
										onClick: () => {
											r();
										},
										children: "Add stop"
									}),
									/* @__PURE__ */ (0, N.jsx)("button", {
										type: "button",
										className: "linkish",
										onClick: () => Se(!1),
										children: "Close"
									})
								]
							}),
							/* @__PURE__ */ (0, N.jsx)("p", {
								className: "muted",
								children: "Stays at this site come from its slips; a stay at the other site shows only its dates. Added stops are saved with Edit and appear on the itinerary letter."
							})
						]
					});
				})(),
				/* @__PURE__ */ (0, N.jsxs)("div", {
					className: "controls no-print",
					children: [
						/* @__PURE__ */ (0, N.jsx)("button", {
							id: "btnNew",
							onClick: () => {
								pt(), q("New blank slip");
							},
							children: "New Slip"
						}),
						/* @__PURE__ */ (0, N.jsx)("button", {
							id: "btnSave",
							title: $ && !Ae ? "This slip is already saved — use Edit to change it (New Slip to start another)" : "Save as a new slip",
							className: Ae ? "btn-warn" : "",
							disabled: $ && !Ae || !!v.readonly || Me,
							onClick: () => void Ot(),
							children: "Save"
						}),
						/* @__PURE__ */ (0, N.jsx)("button", {
							id: "btnEdit",
							className: $ ? "btn-hot" : "",
							disabled: !$ || !!v.readonly || Me,
							onClick: () => void kt(),
							children: "Edit"
						}),
						Z && !v.readonly && /* @__PURE__ */ (0, N.jsx)("button", {
							id: "btnCheckIn",
							type: "button",
							title: "Tell the other desks this group has checked in",
							disabled: Me,
							onClick: () => void zt(),
							children: rt ? "Undo check-in" : "Check in"
						}),
						rt && /* @__PURE__ */ (0, N.jsx)("span", {
							className: "ci-chip ci-arrived",
							id: "ciChip",
							children: "✓ Checked in"
						}),
						$ && !Ae && !v.readonly && /* @__PURE__ */ (0, N.jsx)("button", {
							id: "btnUnlockSave",
							type: "button",
							className: "linkish",
							title: "Only if you really want a second, separate slip",
							onClick: async () => {
								await pe({
									title: "Unlock Save for a copy?",
									body: "Save creates a SECOND, separate slip (the loaded one stays). Rooms and pax would count twice.",
									confirmLabel: "Unlock Save"
								}) && je(!0);
							},
							children: "Save a copy instead…"
						}),
						/* @__PURE__ */ (0, N.jsx)("span", {
							className: "muted",
							id: "status",
							children: Re
						})
					]
				}),
				/* @__PURE__ */ (0, N.jsx)("section", {
					ref: ve,
					id: "slipHistory",
					className: "slip-history no-print",
					hidden: !0
				})
			]
		}),
		me,
		ge
	] });
}
export { pe as default };
