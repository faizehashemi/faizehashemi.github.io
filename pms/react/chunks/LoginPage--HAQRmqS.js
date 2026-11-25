import { a as e, f as t, h as n, n as r, p as i } from "./PmsContext-BVMd13Oi.js";
// src/pages/login/login.css?raw
var a = /* @__PURE__ */ n(i(), 1), o = "/* Login + PMS showcase — navy and gold, big rounded headlines, scroll story (circle hero, word reveal, rising cards).\n   Laptops (≥ 1100px): the login is a panel fixed on the right, the story scrolls beside it.\n   Phones / tablets: the login comes first, centred on the screen; the story follows below. */\n@import url(\"https://fonts.googleapis.com/css2?family=Lilita+One&family=Inter:wght@400;500;600;700&display=swap\");\n:root {\n    --navy: #1b2545; --navy-2: #232f57; --navy-3: #2d3a68; --ink: #f6f1e4; --soft: #c9c3b2; --gold: #e3b341; --gold-2: #f3cf6b; --gold-deep: #b8871d;\n    --bad: #ff9b8f; --card: rgba(255, 255, 255, .06); --line: rgba(255, 255, 255, .12); --login-w: 400px;\n}\n* { box-sizing: border-box }\nhtml { scroll-behavior: smooth }\nbody { margin: 0; background: var(--navy); color: var(--ink); font: 16px/1.55 Inter, system-ui, -apple-system, \"Segoe UI\", Roboto, Arial, sans-serif; }\nbody .app-footer { background: var(--navy); color: var(--soft); border: 0 }\nbody .app-footer a { color: var(--gold-2) }\n.lp { position: relative; overflow-x: clip; }\n.lp a { color: var(--gold-2) }\n\n/* ------------------------------ the login ------------------------------ */\n.lp-login { display: grid; place-items: center; min-height: 100svh; padding: 24px 16px;\n    background: radial-gradient(90% 70% at 50% 0%, rgba(227, 179, 65, .18), transparent 60%), var(--navy); }\n.lp-card { width: min(100%, 380px); display: grid; gap: 6px; padding: 28px 26px 22px; border-radius: 26px;\n    background: #fffaf1; color: #2b1e15; box-shadow: 0 30px 80px rgba(0, 0, 0, .45), 0 0 0 6px rgba(227, 179, 65, .25); }\n.lp-logo { width: 104px; justify-self: center; margin-bottom: 2px }\n.lp-card h1 { margin: 0; text-align: center; font: 26px/1.1 \"Lilita One\", Inter, sans-serif; letter-spacing: .04em; text-transform: uppercase; color: var(--navy) }\n.lp-card h1 span { color: var(--gold-deep) }\n.lp-muted { color: #3d3226; text-align: center; margin: 0 0 10px; font-size: 14px }\n.lp-card label { font-weight: 700; font-size: 13px; margin-top: 6px }\n.lp-card input { width: 100%; padding: 11px 13px; font: inherit; font-size: 15px; border: 1.5px solid #d9c49d; border-radius: 12px; background: #fff; color: #2b1e15 }\n.lp-card input:focus-visible { outline: 3px solid var(--gold); outline-offset: 1px; border-color: var(--gold) }\n.lp-card button { margin-top: 14px; padding: 12px; font: 18px \"Lilita One\", Inter, sans-serif; letter-spacing: .06em; text-transform: uppercase;\n    border: 0; border-radius: 999px; background: var(--navy); color: var(--gold-2); cursor: pointer; transition: transform .15s, background .15s }\n.lp-card button:hover { background: var(--navy-3); transform: translateY(-1px) }\n.lp-card button:disabled { opacity: .6; cursor: wait }\n.lp-card .error { color: #a12a2a; min-height: 1.2em; margin: 6px 0 0; text-align: center; font-size: 13px }\n.lp-discover { justify-self: center; margin-top: 4px; font-size: 13px; font-weight: 700; color: var(--gold-deep) !important; text-decoration: none }\n\n@media (min-width: 1100px) {\n    .lp-login { position: fixed; z-index: 5; top: 0; right: 0; bottom: 0; width: var(--login-w); min-height: 0; border-left: 1px solid var(--line);\n        background: radial-gradient(120% 60% at 50% 0%, rgba(227, 179, 65, .22), transparent 60%), #172040; }\n    .lp-discover { display: none }\n    .lp-show, body .app-footer { margin-right: var(--login-w) }\n}\n\n/* ------------------------------ shared ------------------------------ */\n.lp-show { position: relative }\n.lp-sec { max-width: 1100px; margin: 0 auto; padding: 72px 24px 24px }\n.lp-kicker { margin: 0; color: var(--gold); font-weight: 700; letter-spacing: .2em; text-transform: uppercase; font-size: 13px }\n.lp-h { margin: 6px 0 22px; font: clamp(30px, 4.6vw, 54px)/1.02 \"Lilita One\", Inter, sans-serif; letter-spacing: .01em; text-transform: uppercase; color: var(--ink) }\n.lp-h4 { margin: 44px 0 16px; font: 24px/1.1 \"Lilita One\", Inter, sans-serif; text-transform: uppercase; color: var(--gold-2) }\n.lp-p { color: var(--soft); margin: -8px 0 20px; max-width: 70ch }\n.lp-p.small { font-size: 13px; margin: 12px 0 0 }\n.lp-btn { display: inline-flex; align-items: center; gap: 8px; padding: 13px 26px; border-radius: 999px; background: var(--gold); color: var(--navy) !important;\n    font: 18px \"Lilita One\", Inter, sans-serif; letter-spacing: .06em; text-transform: uppercase; text-decoration: none; box-shadow: 0 10px 30px rgba(227, 179, 65, .25); transition: transform .15s }\n.lp-btn:hover { transform: translateY(-2px) }\n.lp-btn.ghost { background: transparent; color: var(--ink) !important; box-shadow: inset 0 0 0 2px rgba(255, 255, 255, .6) }\n\n/* ------------------------------ hero ------------------------------ */\n.lp-hero { height: 190vh; position: relative }\n.lp-hero-stick { position: sticky; top: 0; height: 100svh; display: grid; place-items: center; overflow: hidden;\n    background: radial-gradient(60% 50% at 50% 50%, var(--navy-3), var(--navy)); }\n.lp-circle { --r: 32%; position: absolute; inset: 0; clip-path: circle(var(--r) at 50% 50%); transition: clip-path .05s linear;\n    background: linear-gradient(135deg, #7a5410, #b8871d 45%, #e3b341); }\n.lp-circle::after { content: \"\"; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(27, 37, 69, .25), rgba(27, 37, 69, .72)) }\n.lp-hero-shot { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: top center; transform: scale(calc(1.15 - var(--p, 0) * .15)); filter: saturate(1.05) }\n.lp-hero-text { position: relative; z-index: 1; text-align: center; padding: 0 20px }\n.lp-hello { margin: 0; font-weight: 700; color: var(--gold-2); letter-spacing: .06em }\n.lp-title { margin: 6px 0; font: clamp(44px, 8.5vw, 112px)/.95 \"Lilita One\", Inter, sans-serif; text-transform: uppercase; letter-spacing: .01em; color: #fff;\n    text-shadow: 0 6px 0 rgba(0, 0, 0, .25), 0 20px 60px rgba(0, 0, 0, .45) }\n.lp-title span { color: var(--gold-2) }\n.lp-sub { margin: 4px 0 26px; font: clamp(16px, 2vw, 22px) Inter, sans-serif; font-weight: 600; letter-spacing: .3em; text-transform: uppercase; color: #fff; opacity: .92 }\n.lp-cta { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center }\n\n/* ------------------------------ word reveal ------------------------------ */\n.lp-story { max-width: 1100px; margin: 0 auto; padding: 18vh 24px 10vh }\n.lp-words { margin: 0; font: clamp(28px, 4.4vw, 58px)/1.12 \"Lilita One\", Inter, sans-serif; text-transform: uppercase; letter-spacing: .01em }\n.lp-words span { color: rgba(246, 241, 228, .16); transition: color .25s }\n.lp-words span.on { color: var(--ink) }\n.lp-words span.on:nth-child(7n+3), .lp-words span.on:nth-child(11n+5) { color: var(--gold-2) }\n\n/* ------------------------------ stats, features ------------------------------ */\n.lp-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px }\n.lp-stat { padding: 20px; border-radius: 22px; background: var(--card); border: 1px solid var(--line) }\n.lp-stat b { display: block; font: 44px/1 \"Lilita One\", Inter, sans-serif; color: var(--gold-2) }\n.lp-stat span { color: var(--soft); font-size: 14px }\n.lp-feats { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px }\n.lp-feat { padding: 20px; border-radius: 22px; background: linear-gradient(180deg, rgba(255, 255, 255, .08), rgba(255, 255, 255, .03)); border: 1px solid var(--line) }\n.lp-feat .ic { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 14px; background: rgba(227, 179, 65, .16); font-size: 26px; margin-bottom: 10px }\n.lp-feat b { display: block; font-size: 17px; margin-bottom: 4px }\n.lp-feat p { margin: 0; color: var(--soft); font-size: 14.5px }\n\n/* ------------------------------ screens ------------------------------ */\n.lp-shots { display: grid; gap: 34px }\n.lp-shot { margin: 0; display: grid; grid-template-columns: 1.5fr 1fr; gap: 26px; align-items: center }\n.lp-shot.r { grid-template-columns: 1fr 1.5fr }\n.lp-shot.r .frame { order: 2 }\n.lp-shot .frame { position: relative; padding: 26px 8px 8px; border-radius: 18px; background: #e9e1cf; box-shadow: 0 30px 70px rgba(0, 0, 0, .45); transform: rotate(-1.2deg) }\n.lp-shot.r .frame { transform: rotate(1.2deg) }\n.lp-shot .frame i { position: absolute; top: 10px; width: 9px; height: 9px; border-radius: 50%; background: #e35d5d }\n.lp-shot .frame i:nth-child(1) { left: 14px } .lp-shot .frame i:nth-child(2) { left: 28px; background: #f0b429 } .lp-shot .frame i:nth-child(3) { left: 42px; background: #39b46a }\n.lp-shot img { display: block; width: 100%; height: auto; border-radius: 10px }\n.lp-shot figcaption b { display: block; font: 30px/1.05 \"Lilita One\", Inter, sans-serif; text-transform: uppercase; color: var(--gold-2); margin-bottom: 8px }\n.lp-shot figcaption span { color: var(--soft) }\n\n/* ------------------------------ stack ------------------------------ */\n.lp-stack { display: grid; gap: 8px; max-width: 760px }\n.lp-layer { padding: 20px 22px; border-radius: 22px; border: 1px solid var(--line) }\n.lp-layer b { display: block; font: 24px/1.1 \"Lilita One\", Inter, sans-serif; text-transform: uppercase; margin-bottom: 6px }\n.lp-layer span { color: var(--soft) }\n.lp-layer.l1 { background: rgba(120, 170, 255, .1) } .lp-layer.l1 b { color: #a9c8ff }\n.lp-layer.l2 { background: rgba(243, 128, 32, .12) } .lp-layer.l2 b { color: #ffb36b }\n.lp-layer.l3 { background: rgba(227, 179, 65, .14) } .lp-layer.l3 b { color: var(--gold-2) }\n.lp-arrow { text-align: center; color: var(--soft); font-size: 12px; font-weight: 700; letter-spacing: .2em }\n.lp-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px }\n.lp-chips span { padding: 7px 14px; border-radius: 999px; border: 1px solid var(--line); background: var(--card); font-size: 13.5px; font-weight: 600 }\n\n/* ------------------------------ metrics, shipping ------------------------------ */\n.lp-metrics, .lp-ship { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px }\n.lp-metric { position: relative; padding: 22px 20px; border-radius: 22px; background: var(--card); border: 1px solid var(--line) }\n.lp-metric b { display: block; font: 40px/1 \"Lilita One\", Inter, sans-serif; color: var(--ink); margin-bottom: 6px }\n.lp-metric span { color: var(--soft); font-size: 14px }\n.lp-metric.live b { color: #7ee2a8 }\n.lp-metric em { position: absolute; top: 14px; right: 14px; font-style: normal; font-size: 11px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: #7ee2a8 }\n.lp-metric em::before { content: \"\"; display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #7ee2a8; margin-right: 6px; animation: lp-pulse 1.6s infinite }\n@keyframes lp-pulse { 50% { opacity: .25 } }\n.lp-chart { margin-top: 24px; padding: 18px; border-radius: 22px; background: var(--card); border: 1px solid var(--line) }\n.lp-chart svg { width: 100%; height: auto; display: block }\n.lp-chart .bar { fill: var(--gold) }\n.lp-chart .v { fill: var(--ink); font: 16px \"Lilita One\", Inter, sans-serif; text-anchor: middle }\n.lp-chart .d { fill: var(--soft); font: 12px Inter, sans-serif; text-anchor: middle }\n.lp-principles { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 14px }\n.lp-pr { padding: 20px; border-radius: 22px; border: 1px dashed rgba(227, 179, 65, .45) }\n.lp-pr span { font: 30px \"Lilita One\", Inter, sans-serif; color: var(--gold) }\n.lp-pr b { display: block; font-size: 17px; margin: 4px 0 }\n.lp-pr p { margin: 0; color: var(--soft); font-size: 14.5px }\n.lp-ai { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 14px }\n\n/* ------------------------------ end ------------------------------ */\n.lp-end { max-width: 1100px; margin: 0 auto; padding: 90px 24px 70px; text-align: center }\n.lp-end h3 { margin: 0 0 20px; font: clamp(34px, 5vw, 64px)/1 \"Lilita One\", Inter, sans-serif; text-transform: uppercase }\n.lp-end p { color: var(--soft); margin-top: 26px; font-size: 14px }\n\n/* ------------------------------ motion ------------------------------ */\n.reveal { opacity: 0; transform: translateY(26px); transition: opacity .6s ease, transform .6s ease }\n.reveal.in { opacity: 1; transform: none }\n.lp-shot.reveal.in .frame { transition: transform .8s ease }\n@media (prefers-reduced-motion: reduce) {\n    html { scroll-behavior: auto }\n    .reveal { opacity: 1; transform: none; transition: none }\n    .lp-hero { height: auto } .lp-hero-stick { position: relative } .lp-circle { clip-path: none }\n}\n\n/* ------------------------------ small screens ------------------------------ */\n@media (max-width: 760px) {\n    .lp-sec { padding: 56px 16px 16px }\n    .lp-shot, .lp-shot.r { grid-template-columns: 1fr }\n    .lp-shot.r .frame { order: 0 }\n    .lp-hero { height: 150vh }\n    .lp-stat b { font-size: 36px }\n}\n", s = "<main class=\"lp-show\">\r\n        <!-- 1 · hero: the circle opens as you scroll -->\r\n        <section class=\"lp-hero\" id=\"lpHero\">\r\n            <div class=\"lp-hero-stick\">\r\n                <div class=\"lp-circle\" id=\"lpCircle\">\r\n                    <img src=\"assets/showcase/home.jpg\" alt=\"The PMS Home page\" class=\"lp-hero-shot\">\r\n                </div>\r\n                <div class=\"lp-hero-text\">\r\n                    <p class=\"lp-hello\">Hello, welcome to</p>\r\n                    <h2 class=\"lp-title\">Faiz E Hashemi <span>PMS</span></h2>\r\n                    <p class=\"lp-sub\" id=\"lpPmsName\">Project Management System</p>\r\n                    <div class=\"lp-cta\">\r\n                        <a class=\"lp-btn\" href=\"#lpLogin\" data-focus-login>Log in</a>\r\n                        <a class=\"lp-btn ghost\" href=\"#lpStory\" data-scroll=\"lpStory\">See what it does</a>\r\n                    </div>\r\n                </div>\r\n            </div>\r\n        </section>\r\n\r\n        <!-- 2 · the statement, word by word -->\r\n        <section class=\"lp-story\" id=\"lpStory\">\r\n            <p class=\"lp-words\" id=\"lpWords\">Every pilgrim, every room, every bus and every thaal — one system, live in Makkah and Madina, from the booking list to the bus seat. Built at the edge, shipped every day, decided by data.</p>\r\n        </section>\r\n\r\n        <!-- 3 · numbers -->\r\n        <section class=\"lp-sec\">\r\n            <p class=\"lp-kicker\">At a glance</p>\r\n            <h3 class=\"lp-h\">One platform, two cities</h3>\r\n            <div class=\"lp-stats\" id=\"lpStats\"></div>\r\n        </section>\r\n\r\n        <!-- 4 · features -->\r\n        <section class=\"lp-sec\">\r\n            <p class=\"lp-kicker\">Capabilities</p>\r\n            <h3 class=\"lp-h\">Everything a Miqaat desk runs on</h3>\r\n            <div class=\"lp-feats\" id=\"lpFeats\"></div>\r\n        </section>\r\n\r\n        <!-- 5 · screens -->\r\n        <section class=\"lp-sec\">\r\n            <p class=\"lp-kicker\">The screens</p>\r\n            <h3 class=\"lp-h\">Built for the desk, the phone and the wall</h3>\r\n            <p class=\"lp-p\">Demo data shown — real guest data never leaves the logged-in PMS.</p>\r\n            <div class=\"lp-shots\" id=\"lpShots\"></div>\r\n        </section>\r\n\r\n        <!-- 6 · technology -->\r\n        <section class=\"lp-sec\">\r\n            <p class=\"lp-kicker\">Technology</p>\r\n            <h3 class=\"lp-h\">Three layers. No servers to babysit.</h3>\r\n            <div class=\"lp-stack\">\r\n                <div class=\"lp-layer l1\"><b>Browser &amp; Android app</b><span>Plain HTML, CSS and JavaScript modules — no framework, no build step. An offline copy of the data in IndexedDB keeps pages instant. The Android app (TWA) updates itself.</span></div>\r\n                <div class=\"lp-arrow\">↓ HTTPS · JSON ↓</div>\r\n                <div class=\"lp-layer l2\"><b>Cloudflare Workers — the edge</b><span>The API runs in Cloudflare's data centre nearest to each desk. Logins with PBKDF2-SHA256 hashed passwords, roles, per-page access, version checks on every write, an audit log.</span></div>\r\n                <div class=\"lp-arrow\">↓ SQL ↓</div>\r\n                <div class=\"lp-layer l3\"><b>Cloudflare D1 — SQLite database</b><span>One source of truth for slips, rooms, transport, laundry and settings. Indexed incremental sync, soft deletes and 7-day point-in-time restore (Time Travel).</span></div>\r\n            </div>\r\n            <div class=\"lp-chips\">\r\n                <span>UMS group list import</span><span>Flightradar24</span><span>VariFlight</span><span>Telegram</span><span>GitHub</span><span>Android (TWA)</span><span>Public signage board</span>\r\n            </div>\r\n        </section>\r\n\r\n        <!-- 7 · speed -->\r\n        <section class=\"lp-sec\">\r\n            <p class=\"lp-kicker\">Speed</p>\r\n            <h3 class=\"lp-h\">Measured, not promised</h3>\r\n            <div class=\"lp-metrics\" id=\"lpMetrics\"></div>\r\n            <p class=\"lp-p small\">Live figures are measured by your browser while this page is open; the others come from the production database and deploy logs.</p>\r\n        </section>\r\n\r\n        <!-- 8 · shipping -->\r\n        <section class=\"lp-sec\">\r\n            <p class=\"lp-kicker\">Shipping</p>\r\n            <h3 class=\"lp-h\">From request to live — usually the same day</h3>\r\n            <div class=\"lp-ship\" id=\"lpShip\"></div>\r\n            <div class=\"lp-chart\" id=\"lpChart\" aria-label=\"Changes shipped per week\"></div>\r\n            <h4 class=\"lp-h4\">Simple computer-architecture principles, applied</h4>\r\n            <div class=\"lp-principles\" id=\"lpPrinciples\"></div>\r\n        </section>\r\n\r\n        <!-- 9 · AI and data -->\r\n        <section class=\"lp-sec\">\r\n            <p class=\"lp-kicker\">AI &amp; data</p>\r\n            <h3 class=\"lp-h\">AI-assisted engineering, data-first decisions</h3>\r\n            <div class=\"lp-ai\" id=\"lpAi\"></div>\r\n        </section>\r\n\r\n        <section class=\"lp-end\">\r\n            <h3>Ready when your desk is.</h3>\r\n            <a class=\"lp-btn\" href=\"#lpLogin\" data-focus-login>Log in to the PMS</a>\r\n            <p>Made by <a href=\"https://raajsoftware.com\" target=\"_blank\" rel=\"noopener\">Raaj Software</a> for Faiz E Hashemi · Makkah · Madina</p>\r\n        </section>\r\n    </main>", c = (e) => String(e ?? "").replace(/[&<>"']/g, (e) => ({
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
})[e]), l = (e) => Number(e).toLocaleString("en-GB"), u = "2026-09-27", d = [
	[
		"🛏️",
		"Slips & room allocation",
		"Accommodation slips with a visual room picker showing free beds over the whole stay, group-leader rooms, A5 slips and GL copies."
	],
	[
		"📥",
		"UMS import",
		"The UMS group list becomes slips — Makkah and Madina legs, flight-based times, a review of every change and of cancelled or postponed groups before anything is written."
	],
	[
		"🗓️",
		"Forecast & planner",
		"Free beds at any moment, a building planner that tries many placement orders and proposes the best three, one-click allocation for a day."
	],
	[
		"🏢",
		"Grid, timeline & occupancy",
		"Floor-by-floor occupancy, a room timeline, beds in use per night with building averages and the busiest night."
	],
	[
		"🛬",
		"Check-ins & flights",
		"Arrivals and departures for any window, split by airport or city, print tables, live flight status and delays."
	],
	[
		"⏳",
		"Delayed departures",
		"Per-room check-out windows when groups cannot leave, with clash checks against incoming groups."
	],
	[
		"🧹",
		"Room cleaning",
		"Housekeeping priorities per building — urgent turnovers first — staff per floor and floor-wise print-outs."
	],
	[
		"🚌",
		"Transport",
		"Pasted transport lists become bus numbers per destination, bus sheets, manual trips and a live public signage board."
	],
	[
		"🍱",
		"Mawaid & Tosha",
		"Thaal counts per building, travel refreshments per bus, menu cards ready to share."
	],
	[
		"🕋",
		"KG roster",
		"Fakkul Ehraam & Atraaf duty roster with history per person."
	],
	[
		"🧺",
		"Laundry POS",
		"Touch-screen point of sale, receipt series, staff and building linen, cash settlement and reports."
	],
	[
		"📊",
		"Charts & exports",
		"Pax counts per night and per hour, arrivals per day, CSV and Excel exports, a full change log."
	],
	[
		"🔐",
		"Logins & access",
		"Desk, viewer and admin logins per site, page-level access, personal menus and settings that follow the login."
	],
	[
		"📱",
		"Phone, desk & wall",
		"Responsive on every screen, an Android app with forced updates, TV signage without a login."
	]
], f = [
	[
		"home",
		"Home — today at a glance",
		"Check-ins, check-outs, guests in house, Fakkul Ehraam and transport cards, a look-ahead to any date."
	],
	[
		"checkins",
		"Check-ins & check-outs",
		"Every arrival and departure for a window, with print tables, slips and GL copies."
	],
	[
		"transport",
		"Transport day",
		"Bus numbers per destination, times, departure buildings, transporters and groups riding together."
	],
	[
		"occupancy",
		"Occupancy details",
		"Beds in use per night: totals, building averages, busiest and quietest nights."
	],
	[
		"housekeeping",
		"Room cleaning",
		"Urgent turnovers first, staff per floor, a print-out per floor."
	],
	[
		"tosha",
		"Tosha summary",
		"Travel refreshments per bus, copied as an image for the kitchen group."
	],
	[
		"paxchart",
		"Pax counts chart",
		"A year at a glance: guests per night and arrivals per day."
	]
], p = [
	["Locality & caching", "Like a CPU cache: every browser keeps its own copy of the data, and the API runs in the edge location nearest to the desk. Pages open from memory."],
	["An append-only change log", "Every write gets a sequence number; a desk asks only for what changed since its last one. One index cut the rows read per check from 1,812 to 1."],
	["Compare-and-swap writes", "Each record carries a version. A save made on stale data is refused and shown — two desks can never silently overwrite each other."],
	["A pipeline with a review stage", "Imports run parse → compare → review → apply. Nothing reaches the database until a person has ticked the changes."],
	["Modularity", "Each page is its own small module (HTML, CSS, JS) over a thin shared core, so one feature ships without touching the others."],
	["One source of truth", "Signage, bus sheets, Tosha and Home cards are computed from the same rows — nothing is typed twice, nothing disagrees."],
	["Undo at every level", "Soft deletes, a bulk-change log with undo, an audit log of every write and 7-day database Time Travel."],
	["Zero build", "The files written are the files that run: no compiler, no package tree. A deploy reaches every location in seconds."]
];
function m(e, { CHANGES: t, VIEWS: n, apiBase: r }) {
	let i = (t) => e.querySelector("#" + t), a = [], o = n.filter((e) => !e.hidden && e.id !== "login").length, s = [...new Set(t.map((e) => e.d))].sort(), m = t.filter((e) => e.d >= u), h = [...new Set(m.map((e) => e.d))], g = new Set(t.map((e) => e.f)).size, _ = new Set(m.map((e) => e.h).filter(Boolean)).size, v = Math.max(1, Math.ceil((Date.parse(s.at(-1)) - Date.parse(u)) / 6048e5));
	i("lpStats").innerHTML = [
		[o, "pages & tools"],
		[2, "cities, one database"],
		[l(m.length), "changes shipped since 27 Sep 2026"],
		[h.length, "days with a release"],
		[g, "feature areas"],
		["24/7", "at the edge, no server to run"]
	].map(([e, t]) => `<div class="lp-stat reveal"><b>${c(e)}</b><span>${c(t)}</span></div>`).join(""), i("lpFeats").innerHTML = d.map(([e, t, n]) => `<article class="lp-feat reveal"><span class="ic" aria-hidden="true">${e}</span><b>${c(t)}</b><p>${c(n)}</p></article>`).join(""), i("lpShots").innerHTML = f.map(([e, t, n], r) => `<figure class="lp-shot reveal ${r % 2 ? "r" : ""}">
        <div class="frame"><i></i><i></i><i></i><img src="assets/showcase/${e}.jpg" alt="${c(t)}" loading="lazy" width="800" height="500"></div>
        <figcaption><b>${c(t)}</b><span>${c(n)}</span></figcaption></figure>`).join(""), i("lpShip").innerHTML = [
		[l(t.length), "changes in the change log"],
		[l(m.length), "since the cloud PMS"],
		[(m.length / Math.max(1, h.length)).toFixed(1), "changes per release day"],
		[(m.length / v).toFixed(0), "changes per week"],
		[_, "releases (commits) since 27 Sep"],
		["≈ 15 s", "from deploy to every location"]
	].map(([e, t]) => `<div class="lp-stat reveal"><b>${c(e)}</b><span>${c(t)}</span></div>`).join("");
	let y = Date.parse(`${u}T00:00`), b = Array.from({ length: v }, (e, t) => ({
		i: t,
		n: 0,
		from: new Date(y + t * 6048e5)
	}));
	for (let e of m) {
		let t = Math.min(v - 1, Math.floor((Date.parse(`${e.d}T12:00`) - y) / 6048e5));
		b[t].n++;
	}
	let x = Math.max(...b.map((e) => e.n), 1), S = 640 / b.length;
	i("lpChart").innerHTML = `<svg viewBox="0 0 640 214" role="img" aria-label="Changes shipped per week">
        ${b.map((e) => {
		let t = Math.max(4, e.n / x * 180);
		return `<g><rect x="${e.i * S + 10}" y="${180 - t + 8}" width="${S - 20}" height="${t}" rx="8" class="bar"/>
          <text x="${e.i * S + S / 2}" y="${180 - t}" class="v">${e.n}</text>
          <text x="${e.i * S + S / 2}" y="208" class="d">${e.from.toLocaleDateString("en-GB", {
			day: "numeric",
			month: "short"
		})}</text></g>`;
	}).join("")}
    </svg><p class="lp-p small">Changes shipped per week since the one-app cloud PMS went live (from the Change log).</p>`, i("lpPrinciples").innerHTML = p.map(([e, t], n) => `<div class="lp-pr reveal"><span>${String(n + 1).padStart(2, "0")}</span><b>${c(e)}</b><p>${c(t)}</p></div>`).join("");
	let C = m.filter((e) => e.h).length;
	i("lpAi").innerHTML = [
		[
			"🤖",
			"AI pair-engineering",
			`The PMS is engineered with Claude (Anthropic) as an AI engineering partner: most of the ${l(C)} recorded changes since 27 Sep were designed, written and tested with it — each one checked against a local copy of the server and database before it went live.`
		],
		[
			"🧭",
			"Data before decisions",
			"Every import shows what will change — new, changed, cancelled or postponed — and waits for a person. Planners propose; people decide."
		],
		[
			"📈",
			"Answers from the live data",
			"Hourly pax counts, deleted-slip audits, the reason behind a sudden spike — answered from the production database in minutes, delivered as Excel."
		],
		[
			"🔮",
			"Forecasts, not guesses",
			"Free beds at any moment, the best three building plans, delayed-departure clashes and flight delays — so tomorrow is known today."
		]
	].map(([e, t, n]) => `<article class="lp-feat reveal"><span class="ic" aria-hidden="true">${e}</span><b>${c(t)}</b><p>${c(n)}</p></article>`).join("");
	let w = (e, t, n, r) => `<div class="lp-metric reveal ${r ? "live" : ""}" id="${e || ""}"><b>${t}</b><span>${n}</span>${r ? "<em>live</em>" : ""}</div>`, T = performance.getEntriesByType("navigation")[0], E = T ? Math.round(T.domContentLoadedEventEnd || T.responseEnd) : null;
	i("lpMetrics").innerHTML = [
		w("mPing", "…", "API round trip from your browser to the edge (median of 5)", !0),
		w("", E ? `${l(E)} ms` : "—", "this page ready in your browser", !0),
		w("", "≈ 12 ms", "database time for a 3,000-row query (D1, production)"),
		w("", "1,812 → 1", "rows read per sync check after indexing the change log"),
		w("", "330+", "Cloudflare locations the API can answer from"),
		w("", "0", "build steps and front-end packages")
	].join(""), (async () => {
		let e = [];
		for (let t = 0; t < 5; t++) {
			let t = performance.now();
			try {
				await fetch(`${r()}/api/health`, { cache: "no-store" }), e.push(performance.now() - t);
			} catch {}
		}
		let t = i("mPing");
		t && (e.sort((e, t) => e - t), t.querySelector("b").textContent = e.length ? `${Math.round(e[Math.floor(e.length / 2)])} ms` : "offline");
	})();
	let D = i("lpWords");
	D.innerHTML = D.textContent.trim().split(/\s+/).map((e) => `<span>${c(e)}</span> `).join("");
	let O = [...D.children], k = matchMedia("(prefers-reduced-motion: reduce)").matches;
	function A() {
		let e = innerHeight, t = i("lpHero");
		if (t) {
			let n = t.getBoundingClientRect(), r = Math.min(1, Math.max(0, -n.top / Math.max(1, n.height - e)));
			i("lpCircle").style.setProperty("--r", `${32 + r * 90}%`), t.style.setProperty("--p", r.toFixed(3));
		}
		let n = D.getBoundingClientRect(), r = Math.min(1, Math.max(0, (e * .85 - n.top) / (n.height + e * .35))), a = k ? O.length : Math.round(r * O.length);
		O.forEach((e, t) => e.classList.toggle("on", t < a));
	}
	addEventListener("scroll", A, { passive: !0 }), addEventListener("resize", A), a.push(() => {
		removeEventListener("scroll", A), removeEventListener("resize", A);
	}), A();
	let j = new IntersectionObserver((e) => e.forEach((e) => {
		e.isIntersecting && (e.target.classList.add("in"), j.unobserve(e.target));
	}), { threshold: .12 });
	return e.querySelectorAll(".reveal").forEach((e) => j.observe(e)), a.push(() => j.disconnect()), () => a.forEach((e) => e());
}
// src/pages/login/LoginPage.tsx
var h = t();
function g() {
	let { cloud: t } = r(), n = e(), i = (0, a.useRef)(null), c = (0, a.useRef)(null), l = (0, a.useRef)(null), [u, d] = (0, a.useState)(""), [f, p] = (0, a.useState)(""), [g, _] = (0, a.useState)(() => {
		try {
			let e = sessionStorage.getItem("pms_logout_reason");
			return e && sessionStorage.removeItem("pms_logout_reason"), e || "";
		} catch {
			return "";
		}
	}), [v, y] = (0, a.useState)(!1);
	(0, a.useEffect)(() => {
		c.current?.focus({ preventScroll: !0 });
	}, []), (0, a.useEffect)(() => {
		let e = () => {}, r = !1;
		return (async () => {
			let [{ CHANGES: a }, { VIEWS: o }] = await Promise.all([n("views/changelog/data.js"), n("config.js")]);
			!r && i.current && (e = m(i.current, {
				CHANGES: a,
				VIEWS: o,
				apiBase: t.apiBase
			}));
		})(), () => {
			r = !0, e();
		};
	}, []);
	async function b(e) {
		e.preventDefault(), _(""), y(!0);
		try {
			await t.login(u.trim(), f);
		} catch (e) {
			_(e instanceof t.UserError ? e.message : "Could not log in: " + (e.message || e)), y(!1), l.current?.select();
		}
	}
	function x(e) {
		let t = e.target.closest("[data-scroll], [data-focus-login]");
		t && (e.preventDefault(), t.hasAttribute("data-focus-login") ? (i.current?.querySelector("#lpLogin")?.scrollIntoView({
			behavior: "smooth",
			block: "center"
		}), setTimeout(() => c.current?.focus({ preventScroll: !0 }), 350)) : i.current?.querySelector("#" + t.dataset.scroll)?.scrollIntoView({
			behavior: "smooth",
			block: "start"
		}));
	}
	return /* @__PURE__ */ (0, h.jsxs)(h.Fragment, { children: [/* @__PURE__ */ (0, h.jsx)("style", { children: o }), /* @__PURE__ */ (0, h.jsxs)("div", {
		ref: i,
		className: "lp",
		onClick: x,
		children: [/* @__PURE__ */ (0, h.jsx)("aside", {
			className: "lp-login",
			id: "lpLogin",
			children: /* @__PURE__ */ (0, h.jsxs)("form", {
				className: "lp-card",
				id: "loginForm",
				autoComplete: "on",
				onSubmit: (e) => void b(e),
				children: [
					/* @__PURE__ */ (0, h.jsx)("img", {
						src: "assets/logo.png",
						alt: "",
						className: "lp-logo"
					}),
					/* @__PURE__ */ (0, h.jsxs)("h1", { children: ["Faiz E Hashemi ", /* @__PURE__ */ (0, h.jsx)("span", { children: "PMS" })] }),
					/* @__PURE__ */ (0, h.jsx)("p", {
						className: "lp-muted",
						children: "Log in with your desk's name and password."
					}),
					/* @__PURE__ */ (0, h.jsx)("label", {
						htmlFor: "deskName",
						children: "Desk"
					}),
					/* @__PURE__ */ (0, h.jsx)("input", {
						id: "deskName",
						ref: c,
						name: "username",
						autoComplete: "username",
						required: !0,
						placeholder: "e.g. Makkah Desk 1",
						value: u,
						onChange: (e) => d(e.target.value)
					}),
					/* @__PURE__ */ (0, h.jsx)("label", {
						htmlFor: "deskPass",
						children: "Password"
					}),
					/* @__PURE__ */ (0, h.jsx)("input", {
						id: "deskPass",
						ref: l,
						name: "password",
						type: "password",
						autoComplete: "current-password",
						required: !0,
						value: f,
						onChange: (e) => p(e.target.value)
					}),
					/* @__PURE__ */ (0, h.jsx)("button", {
						type: "submit",
						id: "btnLogin",
						disabled: v,
						children: v ? "Logging in…" : "Log in"
					}),
					/* @__PURE__ */ (0, h.jsx)("p", {
						className: "error",
						id: "err",
						role: "alert",
						children: g
					}),
					/* @__PURE__ */ (0, h.jsx)("a", {
						className: "lp-discover",
						href: "#lpStory",
						"data-scroll": "lpStory",
						children: "Discover the PMS ↓"
					})
				]
			})
		}), /* @__PURE__ */ (0, h.jsx)("div", {
			style: { display: "contents" },
			dangerouslySetInnerHTML: { __html: s }
		})]
	})] });
}
export { g as default };
