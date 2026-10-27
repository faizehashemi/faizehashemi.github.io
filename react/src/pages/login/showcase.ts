// @ts-nocheck
// The login page's showcase (scroll story, numbers, features, screens, speed, shipping) — moved unchanged from views/login/view.js; it fills the markup of
// showcase.html and returns a cleanup. The login form itself is React (LoginPage.tsx).
type Libs = { CHANGES: any[]; VIEWS: any[]; apiBase: () => string };
const esc = (s: any) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n: any) => Number(n).toLocaleString('en-GB');
const CLOUD_START = '2026-09-27'; // the one-app cloud PMS

const FEATURE_CARDS = [
    ['🛏️', 'Slips & room allocation', 'Accommodation slips with a visual room picker showing free beds over the whole stay, group-leader rooms, A5 slips and GL copies.'],
    ['📥', 'UMS import', 'The UMS group list becomes slips — Makkah and Madina legs, flight-based times, a review of every change and of cancelled or postponed groups before anything is written.'],
    ['🗓️', 'Forecast & planner', 'Free beds at any moment, a building planner that tries many placement orders and proposes the best three, one-click allocation for a day.'],
    ['🏢', 'Grid, timeline & occupancy', 'Floor-by-floor occupancy, a room timeline, beds in use per night with building averages and the busiest night.'],
    ['🛬', 'Check-ins & flights', 'Arrivals and departures for any window, split by airport or city, print tables, live flight status and delays.'],
    ['⏳', 'Delayed departures', 'Per-room check-out windows when groups cannot leave, with clash checks against incoming groups.'],
    ['🧹', 'Room cleaning', 'Housekeeping priorities per building — urgent turnovers first — staff per floor and floor-wise print-outs.'],
    ['🚌', 'Transport', 'Pasted transport lists become bus numbers per destination, bus sheets, manual trips and a live public signage board.'],
    ['🍱', 'Mawaid & Tosha', 'Thaal counts per building, travel refreshments per bus, menu cards ready to share.'],
    ['🕋', 'KG roster', 'Fakkul Ehraam & Atraaf duty roster with history per person.'],
    ['🧺', 'Laundry POS', 'Touch-screen point of sale, receipt series, staff and building linen, cash settlement and reports.'],
    ['📊', 'Charts & exports', 'Pax counts per night and per hour, arrivals per day, CSV and Excel exports, a full change log.'],
    ['🔐', 'Logins & access', 'Desk, viewer and admin logins per site, page-level access, personal menus and settings that follow the login.'],
    ['📱', 'Phone, desk & wall', 'Responsive on every screen, an Android app with forced updates, TV signage without a login.'],
];
const SHOTS = [
    ['home', 'Home — today at a glance', 'Check-ins, check-outs, guests in house, Fakkul Ehraam and transport cards, a look-ahead to any date.'],
    ['checkins', 'Check-ins & check-outs', 'Every arrival and departure for a window, with print tables, slips and GL copies.'],
    ['transport', 'Transport day', 'Bus numbers per destination, times, departure buildings, transporters and groups riding together.'],
    ['occupancy', 'Occupancy details', 'Beds in use per night: totals, building averages, busiest and quietest nights.'],
    ['housekeeping', 'Room cleaning', 'Urgent turnovers first, staff per floor, a print-out per floor.'],
    ['tosha', 'Tosha summary', 'Travel refreshments per bus, copied as an image for the kitchen group.'],
    ['paxchart', 'Pax counts chart', 'A year at a glance: guests per night and arrivals per day.'],
];
const PRINCIPLES = [
    ['Locality & caching', 'Like a CPU cache: every browser keeps its own copy of the data, and the API runs in the edge location nearest to the desk. Pages open from memory.'],
    ['An append-only change log', 'Every write gets a sequence number; a desk asks only for what changed since its last one. One index cut the rows read per check from 1,812 to 1.'],
    ['Compare-and-swap writes', 'Each record carries a version. A save made on stale data is refused and shown — two desks can never silently overwrite each other.'],
    ['A pipeline with a review stage', 'Imports run parse → compare → review → apply. Nothing reaches the database until a person has ticked the changes.'],
    ['Modularity', 'Each page is its own small module (HTML, CSS, JS) over a thin shared core, so one feature ships without touching the others.'],
    ['One source of truth', 'Signage, bus sheets, Tosha and Home cards are computed from the same rows — nothing is typed twice, nothing disagrees.'],
    ['Undo at every level', 'Soft deletes, a bulk-change log with undo, an audit log of every write and 7-day database Time Travel.'],
    ['Zero build', 'The files written are the files that run: no compiler, no package tree. A deploy reaches every location in seconds.'],
];


export function runShowcase(root: HTMLElement, { CHANGES, VIEWS, apiBase }: Libs): () => void {
    const $ = (id: string) => root.querySelector('#' + id) as any;
    const cleanups: (() => void)[] = [];
    /* ------------------------------ content ------------------------------ */
    const pages = VIEWS.filter(v => !v.hidden && v.id !== 'login').length;
    const days = [...new Set(CHANGES.map(c => c.d))].sort();
    const cloud = CHANGES.filter(c => c.d >= CLOUD_START);
    const cloudDays = [...new Set(cloud.map(c => c.d))];
    const features = new Set(CHANGES.map(c => c.f)).size;
    const commits = new Set(cloud.map(c => c.h).filter(Boolean)).size;
    const weeks = Math.max(1, Math.ceil((Date.parse(days.at(-1)) - Date.parse(CLOUD_START)) / 6048e5));

    $('lpStats').innerHTML = [
        [pages, 'pages & tools'], [2, 'cities, one database'], [fmt(cloud.length), 'changes shipped since 27 Sep 2026'],
        [cloudDays.length, 'days with a release'], [features, 'feature areas'], ['24/7', 'at the edge, no server to run'],
    ].map(([n, l]) => `<div class="lp-stat reveal"><b>${esc(n)}</b><span>${esc(l)}</span></div>`).join('');

    $('lpFeats').innerHTML = FEATURE_CARDS.map(([i, t, d]) => `<article class="lp-feat reveal"><span class="ic" aria-hidden="true">${i}</span><b>${esc(t)}</b><p>${esc(d)}</p></article>`).join('');

    $('lpShots').innerHTML = SHOTS.map(([f, t, d], k) => `<figure class="lp-shot reveal ${k % 2 ? 'r' : ''}">
        <div class="frame"><i></i><i></i><i></i><img src="assets/showcase/${f}.jpg" alt="${esc(t)}" loading="lazy" width="800" height="500"></div>
        <figcaption><b>${esc(t)}</b><span>${esc(d)}</span></figcaption></figure>`).join('');

    $('lpShip').innerHTML = [
        [fmt(CHANGES.length), 'changes in the change log'], [fmt(cloud.length), 'since the cloud PMS'],
        [(cloud.length / Math.max(1, cloudDays.length)).toFixed(1), 'changes per release day'], [(cloud.length / weeks).toFixed(0), 'changes per week'],
        [commits, 'releases (commits) since 27 Sep'], ['≈ 15 s', 'from deploy to every location'],
    ].map(([n, l]) => `<div class="lp-stat reveal"><b>${esc(n)}</b><span>${esc(l)}</span></div>`).join('');

    // changes per week since the cloud PMS
    const start = Date.parse(`${CLOUD_START}T00:00`);
    const buckets = Array.from({ length: weeks }, (_, i) => ({ i, n: 0, from: new Date(start + i * 6048e5) }));
    for (const c of cloud) { const w = Math.min(weeks - 1, Math.floor((Date.parse(`${c.d}T12:00`) - start) / 6048e5)); buckets[w].n++; }
    const max = Math.max(...buckets.map(b => b.n), 1), W = 640, H = 180, bw = W / buckets.length;
    $('lpChart').innerHTML = `<svg viewBox="0 0 ${W} ${H + 34}" role="img" aria-label="Changes shipped per week">
        ${buckets.map(b => { const h = Math.max(4, (b.n / max) * H); return `<g><rect x="${b.i * bw + 10}" y="${H - h + 8}" width="${bw - 20}" height="${h}" rx="8" class="bar"/>
          <text x="${b.i * bw + bw / 2}" y="${H - h}" class="v">${b.n}</text>
          <text x="${b.i * bw + bw / 2}" y="${H + 28}" class="d">${b.from.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</text></g>`; }).join('')}
    </svg><p class="lp-p small">Changes shipped per week since the one-app cloud PMS went live (from the Change log).</p>`;

    $('lpPrinciples').innerHTML = PRINCIPLES.map(([t, d], i) => `<div class="lp-pr reveal"><span>${String(i + 1).padStart(2, '0')}</span><b>${esc(t)}</b><p>${esc(d)}</p></div>`).join('');

    const ai = cloud.filter(c => c.h).length;
    $('lpAi').innerHTML = [
        ['🤖', 'AI pair-engineering', `The PMS is engineered with Claude (Anthropic) as an AI engineering partner: most of the ${fmt(ai)} recorded changes since 27 Sep were designed, written and tested with it — each one checked against a local copy of the server and database before it went live.`],
        ['🧭', 'Data before decisions', 'Every import shows what will change — new, changed, cancelled or postponed — and waits for a person. Planners propose; people decide.'],
        ['📈', 'Answers from the live data', 'Hourly pax counts, deleted-slip audits, the reason behind a sudden spike — answered from the production database in minutes, delivered as Excel.'],
        ['🔮', 'Forecasts, not guesses', 'Free beds at any moment, the best three building plans, delayed-departure clashes and flight delays — so tomorrow is known today.'],
    ].map(([i, t, d]) => `<article class="lp-feat reveal"><span class="ic" aria-hidden="true">${i}</span><b>${esc(t)}</b><p>${esc(d)}</p></article>`).join('');

    /* ------------------------------ metrics ------------------------------ */
    const metric = (id, n, l, live) => `<div class="lp-metric reveal ${live ? 'live' : ''}" id="${id || ''}"><b>${n}</b><span>${l}</span>${live ? '<em>live</em>' : ''}</div>`;
    const nav = performance.getEntriesByType('navigation')[0];
    const ready = nav ? Math.round(nav.domContentLoadedEventEnd || nav.responseEnd) : null;
    $('lpMetrics').innerHTML = [
        metric('mPing', '…', 'API round trip from your browser to the edge (median of 5)', true),
        metric('', ready ? `${fmt(ready)} ms` : '—', 'this page ready in your browser', true),
        metric('', '≈ 12 ms', 'database time for a 3,000-row query (D1, production)'),
        metric('', '1,812 → 1', 'rows read per sync check after indexing the change log'),
        metric('', '330+', 'Cloudflare locations the API can answer from'),
        metric('', '0', 'build steps and front-end packages'),
    ].join('');
    (async () => {
        const times = [];
        for (let i = 0; i < 5; i++) {
            const t0 = performance.now();
            try { await fetch(`${apiBase()}/api/health`, { cache: 'no-store' }); times.push(performance.now() - t0); } catch { }
        }
        const el = $('mPing');
        if (!el) return;
        times.sort((a, b) => a - b);
        el.querySelector('b').textContent = times.length ? `${Math.round(times[Math.floor(times.length / 2)])} ms` : 'offline';
    })();

    /* ------------------------------ motion ------------------------------ */
    // the statement: one word lights up at a time while it scrolls past
    const words = $('lpWords');
    words.innerHTML = words.textContent.trim().split(/\s+/).map(w => `<span>${esc(w)}</span> `).join('');
    const spans = [...words.children];
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    function onScroll() {
        const vh = innerHeight;
        // hero: the circle grows from a porthole to the whole screen
        const hero = $('lpHero');
        if (hero) {
            const r = hero.getBoundingClientRect();
            const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - vh)));
            $('lpCircle').style.setProperty('--r', `${32 + p * 90}%`);
            hero.style.setProperty('--p', p.toFixed(3));
        }
        const s = words.getBoundingClientRect();
        const q = Math.min(1, Math.max(0, (vh * 0.85 - s.top) / (s.height + vh * 0.35)));
        const lit = still ? spans.length : Math.round(q * spans.length);
        spans.forEach((sp, i) => sp.classList.toggle('on', i < lit));
    }
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    cleanups.push(() => { removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); });
    onScroll();
    // cards rise into place once
    const io = new IntersectionObserver((list) => list.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: 0.12 });
    root.querySelectorAll('.reveal').forEach(el => io.observe(el));
    cleanups.push(() => io.disconnect());

    return () => cleanups.forEach(f => f());
}
