import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCore, useDb, useGuard, useLoadApp, useLoadCore, useNav, useSite } from '@/pms/PmsContext';
import css from './home.css?raw';
import { PRAISE, dayNumbers, dayPick, shift, ymd, type DayNumbers } from './home';

// Home: a friendly start page — welcome, today's numbers (this site), today's thaals (Mawaid rules), Gregorian + Misri Hijri date (tap it for the in-house calendar).
// "Currently in …" lists the groups staying there now. Fakkul Ehraam counts (Makkah arrivals; windows from Setup): Morning = check-ins from the evening before to
// the split time, Night = split to night end (Madina groups included), Night · from Madina = SH starting with S. Delayed departures, Transport today and Thaals are
// tiles that open their groups. "Look ahead" shows another day's cards, or a day-by-day summary. The group-list windows, the Hijri calendar and the two chart panels
// are the framework-free modules of the old page (views/home/*.js) and its styles (home.css), drawn into this page.

type Row = Record<string, any>;
const groupsText = (n: number) => `${n} group${n === 1 ? '' : 's'}`;
const DC_HTML = `<div class="hm-head"><h2 id="hmDcTitle">Guests day by day</h2><span class="hm-sub">Guests in house at 12:00 each day, by city. Hover a bar for the date and count.</span></div>
        <div class="dc-tools"><label>From <input type="date" class="dc-from"></label><label>To <input type="date" class="dc-to"></label><label>Each bar <select class="dc-step"></select></label>
            <label class="dc-hl">Highlight <input type="date" class="dc-mark"><span class="dc-markh"></span></label><button type="button" class="dc-btn dc-clear">Clear</button>
            <button type="button" class="dc-btn dc-today">Reset</button><button type="button" class="dc-btn dc-expand" aria-pressed="false">⤢ Full view</button></div>
        <div class="dc-fig" data-site="makkah"><h3 class="dc-title">Count in <span class="dc-city"></span> <small class="dc-mode">(DAY WISE)</small></h3><div class="dc-scroll"><svg class="dc-svg" role="img" aria-label="Guests in Makkah by day"></svg></div></div>
        <div class="dc-fig" data-site="medina"><h3 class="dc-title">Count in <span class="dc-city"></span> <small class="dc-mode">(DAY WISE)</small></h3><div class="dc-scroll"><svg class="dc-svg" role="img" aria-label="Guests in Medina by day"></svg></div></div>`;
const OCC_HTML = `<div class="hm-head"><h2 id="hmOccTitle">Building occupancy</h2><span class="hm-sub">Share of each building's beds in use today. Capacities come from Rooms &amp; Buildings.</span></div><div class="battery-grid"></div>`;

function Stat({ cls, ico, big, label, small, onClick, href, id }: { cls: string; ico: string; big: ReactNode; label: ReactNode; small?: ReactNode; onClick?: () => void; href?: string; id?: string }) {
    const body = <><span className="hm-ico" aria-hidden="true">{ico}</span><b>{big}</b><span className="hm-lbl">{label}</span><small>{small}</small></>;
    return href !== undefined || (!onClick && id === 'link')
        ? <a className={`hm-stat ${cls}`} href={href || undefined} id={id}>{body}</a>
        : <button type="button" className={`hm-stat ${cls}`} onClick={onClick} id={id}>{body}</button>;
}

export default function HomePage() {
    const { cloud, stay, settings: S, rooms, transport } = useCore();
    const T = transport as any, st = S as any;
    const db = useDb();
    const guard = useGuard();
    const loadApp = useLoadApp();
    const loadCore = useLoadCore();
    const { site, siteId } = useSite();
    const { href } = useNav();
    const desk = cloud.currentDesk();
    const rootRef = useRef<HTMLDivElement>(null), occRef = useRef<HTMLElement>(null), dcRef = useRef<HTMLElement>(null);
    const [mods, setMods] = useState<{ cal: any; inh: any; grp: any; tr: any; occ: any; dc: any; meals: any; hijri: any } | null>(null);
    const [viewDay, setViewDay] = useState(ymd(new Date()));
    const [feWin, setFeWin] = useState<Row>(st.DEFAULTS.fe_windows);
    const [here, setHere] = useState<Row[]>([]), [all, setAll] = useState<Row[]>([]);
    const [trGroups, setTrGroups] = useState<Row[] | null>(null), [trHasList, setTrHasList] = useState(false);
    const [dl, setDl] = useState<Record<string, { r: Row; pax: number; rooms?: string[] }[]> | null>(null);
    const [summary, setSummary] = useState<{ rows: DayNumbers[]; cut: boolean } | null>(null);
    const [sumRange, setSumRange] = useState({ a: viewDay, b: shift(viewDay, 6) });
    const [tick, setTick] = useState(0);
    const DL_SHOWN = `pms_home_dl_shown:${siteId}`;
    const [dlWas] = useState(() => { try { return localStorage.getItem(DL_SHOWN) === '1'; } catch { return false; } });

    useEffect(() => {
        void (async () => {
            const [cal, inh, grp, tr, occ, dc, meals, hijri] = await Promise.all([loadApp('views/home/calendar.js'), loadApp('views/home/inhouse.js'), loadApp('views/home/groups.js'), loadApp('views/home/transport.js'),
                loadApp('views/home/occupancy.js'), loadApp('views/home/daycount.js'), loadCore('meals'), loadCore('hijri')]);
            setMods({ cal, inh, grp, tr, occ, dc, meals, hijri });
        })();
        const reload = () => location.reload();
        window.addEventListener('pms:desk-changed', reload);
        // keep the numbers current: other desks' check-ins every 2 minutes, a new transport import every minute
        const t = setInterval(() => setTick(n => n + 1), 60e3);
        return () => { window.removeEventListener('pms:desk-changed', reload); clearInterval(t); };
    }, []);   // eslint-disable-line react-hooks/exhaustive-deps

    // what the page needs from the server, asked at the same time: the settings, Rooms & Buildings (fresh) and the slips
    const loadAll = useCallback(async () => {
        const [s, , h, a] = await Promise.all([guard<any>(st.loadSettings()).catch(() => null), guard(rooms.loadBuildings({ force: true })).catch(() => null), db.all() as Promise<Row[]>, guard<Row[]>(cloud.mirrorAll())]);
        if (s) setFeWin((w: Row) => ({ ...w, ...(s.settings.fe_windows || {}) }));
        setHere(h); setAll(a.filter(r => !r.deleted));
    }, []);   // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => { void loadAll().catch(e => console.warn('home numbers', e)); }, [loadAll, Math.floor(tick / 2)]);

    const loadTransport = useCallback(async () => {
        const doc = await guard<any>(T.loadDay(siteId, T.today()));
        setTrGroups(T.signage(doc.rows, siteId)); setTrHasList(!!doc.version);
    }, []);   // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => { void loadTransport().catch(e => console.warn('home transport', e)); }, [loadTransport, tick]);

    const N = useMemo(() => (mods ? dayNumbers(viewDay, here, all.length ? all : here, siteId, feWin as any, stay, mods.meals) : null), [mods, viewDay, here, all, feWin]);   // eslint-disable-line react-hooks/exhaustive-deps

    // delayed departures
    useEffect(() => {
        void (async () => {
            const now = Date.now();
            const delayed = here.filter(s => !s.deleted && stay.isDelayed(s) && (stay.slipEnd(s) as number) > now);
            try { localStorage.setItem(DL_SHOWN, delayed.length ? '1' : '0'); } catch { /* ignore */ }
            if (!delayed.length) { setDl(null); return; }
            const blds = await guard<any[]>(rooms.loadBuildings());
            const capOf = (b: string, room: string) => rooms.builderCapacity(blds, b, room);
            const today = ymd(new Date());
            const stayL = delayed.filter(s => stay.presentAt(s, now)).map(r => ({ r, pax: stay.paxAt(r, now).total }));
            const unknown = delayed.map(r => ({ r, pax: (stay.rowsOf(r) as Row[]).filter(w => w.end > now && w.status === 'unknown').reduce((n, w) => n + w.beds, 0) })).filter(x => x.pax);
            const leaving = delayed.map(r => ({ r, pax: (stay.departuresOf(r) as Row[]).filter(d => d.at > now && ymd(new Date(d.at)) === today).reduce((n, d) => n + stay.paxAt(r, d.at - 1).total - stay.paxAt(r, d.at).total, 0) })).filter(x => x.pax);
            const clash = delayed.map(r => ({ r, n: (stay.roomConflicts(r, here, capOf, now) as Row[]).filter(c => c.clash).length })).filter(x => x.n).map(x => ({ r: x.r, pax: x.n }));
            // the rooms each delayed group still occupies (rooms already checked out are not listed)
            const inHouse = (r: Row) => [...new Set((stay.rowsOf(r) as Row[]).filter(w => w.end > now && w.start <= now).map(w => w.room_no))] as string[];
            const withRooms = (list: { r: Row; pax: number }[]) => list.map(x => ({ ...x, rooms: inHouse(x.r) }));
            setDl({ stay: withRooms(stayL), unknown: withRooms(unknown), leaving: withRooms(leaving), clash: withRooms(clash) });
        })().catch(e => console.warn('home delayed', e));
    }, [here]);   // eslint-disable-line react-hooks/exhaustive-deps

    // the chart panels (old modules)
    useEffect(() => {
        if (!mods || !occRef.current) return;
        void mods.occ.renderOccupancy({ guard, siteId, href }, occRef.current, here, viewDay).then(() => {
            const sub = occRef.current?.querySelector('.hm-head .hm-sub');
            if (sub) sub.textContent = `Share of each building's beds in use ${N?.isToday ? 'today' : new Date(`${viewDay}T12:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}. Capacities come from Rooms & Buildings.`;
        });
    }, [mods, here, viewDay]);   // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => { if (mods && dcRef.current && all.length) mods.dc.renderDayCounts(dcRef.current, all); }, [mods, all]);

    const mayOpenSlip = (s: string) => cloud.canOpen('slip', desk) && (desk?.role === 'admin' || desk?.site === s);
    const slipHref = (s: string) => (sh: string) => `#/${s}/slip?sh_no=${encodeURIComponent(sh)}`;
    const list = (s: string, title: string, sub: string, items: Row[], paxLabel?: string) => mods?.grp.openGroupList({ title, sub, items, paxLabel, host: rootRef.current, canOpen: mayOpenSlip(s), slipHref: slipHref(s) });
    const CITY = siteId === 'medina' ? 'Madina' : 'Makkah';
    const now = new Date();
    const hour = now.getHours();
    const part = hour < 5 ? 'Good night' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const label = !N || N.isToday ? 'today' : new Date(`${viewDay}T12:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
    const hm = (d: Date) => d.toLocaleString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    const { morning_from: mf, split: sp, night_to: nt } = feWin;
    const TILE_CLS: Record<string, string> = { summary: 'ta', long: 'tm', airport: 'tj' };
    const dests = T.destsFor(siteId) as Row[];
    const dlSum = (k: string) => (dl?.[k] ?? []).reduce((n, x) => n + x.pax, 0);
    const dlSmall = (k: string, fmt: (a: any[]) => string) => fmt(dl?.[k] ?? []);

    async function openInHouse() {
        const slips = await guard<Row[]>(cloud.mirrorAll());
        mods!.inh.openInHouse({ site: siteId, label: CITY, slips, canOpen: mayOpenSlip(siteId), host: rootRef.current, slipHref: slipHref(siteId) });
    }
    async function showSummary() {
        let { a, b } = sumRange;
        if (!a || !b) return;
        if (a > b) [a, b] = [b, a];
        const days: string[] = [];
        for (let d = a; d <= b && days.length < 92; d = shift(d, 1)) days.push(d);
        const h = (await db.all()) as Row[], al = (await guard<Row[]>(cloud.mirrorAll())).filter(r => !r.deleted);
        setSummary({ rows: days.map(d => dayNumbers(d, h, al, siteId, feWin as any, stay, mods!.meals)), cut: days.length === 92 && days[91] < b });
    }

    if (!mods || !N) return <><style>{css}</style><div className="hm"><p className="hm-sub" style={{ padding: 16 }}>Loading…</p></div></>;
    const { toHijri, formatHijri } = mods.hijri;
    const feTiles: [string, 'morning' | 'night' | 'madina', string, string, string, string][] = [
        ['fm', 'morning', '🌄', 'Morning', `${mf} the day before – ${sp}`, 'Fakkul Ehraam · Morning'],
        ['fn', 'night', '🌃', 'Night', `${sp} – ${nt}, with Madina`, 'Fakkul Ehraam · Night'],
        ['fs', 'madina', '🕌', 'Night · from Madina only', `${sp} – ${nt}, SH starting with S`, 'Fakkul Ehraam · Night, from Madina'],
    ];
    const meal = (r: DayNumbers, k: 'breakfast' | 'lunch' | 'dinner') => (r.meals ? r.meals[k] : '—');
    const sumOf = (rows: DayNumbers[], f: (r: DayNumbers) => number) => rows.reduce((s, r) => s + f(r), 0);
    return (
        <>
            <style>{css}</style>
            <div ref={rootRef} className={`hm${N.isToday ? '' : ' travel'}`}>
                <header className="hm-hero">
                    <div className="hm-hello"><p className="hm-greet">Assalaamo Alaikum</p><h1>{part}, {desk?.name || 'friend'}</h1><p className="hm-praise">{dayPick(PRAISE, desk?.name || '')}</p></div>
                    <div className="hm-dates"><button type="button" className="hm-hijri" title="Open the calendar" onClick={() => void mods.cal.openCalendar({ host: rootRef.current, date: new Date() })}>{formatHijri(toHijri(now))}</button>
                        <div className="hm-greg">{now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div></div>
                </header>

                <section className="hm-section" aria-labelledby="hmTodayTitle">
                    <div className="hm-head"><h2 id="hmTodayTitle">{N.isToday ? 'Today at a glance' : `${label} at a glance`}</h2><span className="hm-sub">Check-ins and check-outs from 03:00 {N.isToday ? 'today' : label} to 03:00 the next day · {site.label}</span></div>
                    <div className="hm-stats">
                        <a className="hm-stat in" id="stIn" href={cloud.canOpen('checkins', desk) ? href('checkins') : undefined}><span className="hm-ico" aria-hidden="true">🛬</span><b>{N.inPax}</b><span className="hm-lbl">Check-ins {label}</span><small>{groupsText(N.ins.length)} · {site.label}</small></a>
                        <a className="hm-stat out" id="stOut" href={cloud.canOpen('checkins', desk) ? href('checkins') : undefined}><span className="hm-ico" aria-hidden="true">🧳</span><b>{N.outPax}</b><span className="hm-lbl">Check-outs {label}</span><small>{groupsText(N.outs.length)} · {site.label}</small></a>
                        <button type="button" className="hm-stat mk" id="stMakkah" title={`See every group staying in ${CITY} now`} onClick={() => void openInHouse()}><span className="hm-ico" aria-hidden="true">{siteId === 'medina' ? '🕌' : '🕋'}</span><b>{N.mkPax}</b>
                            <span className="hm-lbl">{N.isToday ? `Currently in ${CITY}` : `In ${CITY} ${label}`}</span><small>{N.isToday ? 'guests right now' : 'guests at 12:00'} · {groupsText(N.mk.length)}</small></button>
                    </div>
                </section>

                <section className="hm-tt" id="hmTt" aria-label="Look at another day">
                    <div className="hm-tt-row">
                        <span className="hm-tt-lbl">📅 Look ahead</span>
                        <button type="button" className="hm-tt-btn" aria-label="Day before" onClick={() => setViewDay(shift(viewDay, -1))}>◀</button>
                        <input type="date" aria-label="Show the cards for this day" value={viewDay} onChange={e => e.target.value && setViewDay(e.target.value)} />
                        <button type="button" className="hm-tt-btn" aria-label="Day after" onClick={() => setViewDay(shift(viewDay, 1))}>▶</button>
                        <button type="button" className="hm-tt-btn" onClick={() => setViewDay(ymd(new Date()))}>Today</button>
                        <span className="hm-tt-sep" /><span className="hm-tt-lbl">Summary</span>
                        <input type="date" aria-label="Summary from" value={sumRange.a} onChange={e => setSumRange(r => ({ ...r, a: e.target.value }))} /> <span className="hm-sub">to</span> <input type="date" aria-label="Summary to" value={sumRange.b} onChange={e => setSumRange(r => ({ ...r, b: e.target.value }))} />
                        <button type="button" className="hm-tt-btn go" onClick={() => void showSummary()}>Show summary</button>
                        {cloud.canOpen('forecast', desk) && <a className="hm-more" href={href('forecast')}>Open Forecast →</a>}
                    </div>
                    {!N.isToday && <p className="hm-tt-note">Showing {new Date(`${viewDay}T12:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} — from the slips as they are now. Transport stays on today.</p>}
                </section>

                <section className="hm-mega fe" aria-labelledby="hmFeTitle">
                    <div className="hm-head"><h2 id="hmFeTitle">🕋 Fakkul Ehraam counts{N.isToday ? '' : ` · ${label}`}</h2><span className="hm-sub">Arrivals in Makkah · tap a card for the groups</span></div>
                    <div className="hm-stats">{feTiles.map(([cls, key, ico, lbl, when, title]) => (
                        <button key={key} type="button" className={`hm-stat ${cls}`} onClick={() => { const w = N.fe[key]; list('makkah', title, `arrivals ${hm(w.from)} → ${hm(w.to)}`, w.items); }}>
                            <span className="hm-ico" aria-hidden="true">{ico}</span><b>{N.fePax[key]}</b><span className="hm-lbl">{lbl}</span><small>{groupsText(N.fe[key].items.length)} · {when}</small></button>))}</div>
                </section>

                <section className="hm-mega dl" aria-labelledby="hmDlTitle" hidden={!dl && !dlWas ? true : !dl}>
                    <div className="hm-head"><h2 id="hmDlTitle">✈️ Delayed departures</h2>{cloud.canOpen('departures', desk) && <a className="hm-more" href={href('departures')}>Open Delayed departures →</a>}</div>
                    <div className="hm-stats four">{([
                        ['dls', 'stay', '🏨', 'Staying, delayed', 'Delayed — staying now', 'guests', (a: any[]) => `${groupsText(a.length)} in house now`],
                        ['dlu', 'unknown', '❔', 'Unknown date', 'Delayed — unknown date', 'beds held', (a: any[]) => `beds held · ${groupsText(a.length)}`],
                        ['dlt', 'leaving', '🛫', 'Leaving today', 'Delayed — leaving today', 'guests', (a: any[]) => `guests · ${groupsText(a.length)}`],
                        ['dlc', 'clash', '⚠️', 'Rooms clashing', 'Delayed — rooms clashing with the next group', 'rooms', (a: any[]) => (a.length ? `rooms · ${groupsText(a.length)} — open the page` : 'none')],
                    ] as const).map(([cls, key, ico, lbl, title, pl, fmt]) => (
                        <button key={key} type="button" className={`hm-stat ${cls}`} onClick={() => { if (dl?.[key]?.length) list(siteId, title, site.label, dl[key], pl); }}>
                            <span className="hm-ico" aria-hidden="true">{ico}</span><b>{dlSum(key)}</b><span className="hm-lbl">{lbl}</span><small>{dlSmall(key, fmt)}</small></button>))}</div>
                </section>

                <section className="hm-mega tr" aria-labelledby="hmTrTitle">
                    <div className="hm-head"><h2 id="hmTrTitle">🚌 Transport today</h2>{cloud.canOpen('transport', desk) && <a className="hm-more" href={href('transport')}>Open Transport →</a>}</div>
                    <div className="hm-stats">{dests.map(d => {
                        const g = trGroups?.find(x => x.dest.id === d.id);
                        const first = g?.buses.length ? g.buses.reduce((a: Row, b: Row) => (a.at < b.at ? a : b)).at : null;
                        return <button key={d.id} type="button" className={`hm-stat ${TILE_CLS[d.tosha] || 'tj'}`} onClick={() => g && mods.tr.openTransportList({ title: `Transport today · ${g.dest.title}`, sub: site.label, group: g, host: rootRef.current, dayHref: cloud.canOpen('transport', desk) ? href('transport') : '' })}>
                            <span className="hm-ico" aria-hidden="true">{d.icon}</span><b>{g ? g.pax : '—'}</b><span className="hm-lbl">{d.title}</span>
                            <small>{g ? (g.buses.length ? `${T.fleetText(g.buses)} · ${groupsText(g.groups)} · from ${T.time12(first)}` : (trHasList ? 'no buses today' : 'no transport list for today')) : ''}</small></button>;
                    })}</div>
                </section>

                <section className="hm-mega meals" aria-labelledby="hmMealsTitle">
                    <div className="hm-head"><h2 id="hmMealsTitle">Thaals {label} · {site.label}</h2>{cloud.canOpen('mawaid', desk) && <a className="hm-more" href={href('mawaid')}>Open Mawaid →</a>}</div>
                    <div className="hm-stats meals">{([['b', 'B', '🌅', 'Breakfast', 'breakfast'], ['l', 'L', '☀️', 'Lunch', 'lunch'], ['d', 'D', '🌙', 'Dinner', 'dinner']] as const).map(([cls, k, ico, lbl, key]) => (
                        <button key={k} type="button" className={`hm-stat ${cls}`} onClick={() => list(siteId, `${lbl} thaals · ${site.label}`, 'adults counted, as on the Mawaid page', N.mealsWho[k], 'guests')}>
                            <span className="hm-ico" aria-hidden="true">{ico}</span><b>{N.meals ? N.meals[key] : '—'}</b><span className="hm-lbl">{lbl} thaals</span><small>{N.meals ? `${N.meals.pax[key]} guests` : ''}</small></button>))}</div>
                </section>

                <section ref={occRef} className="hm-section hm-occ" id="hmOcc" aria-labelledby="hmOccTitle" dangerouslySetInnerHTML={{ __html: OCC_HTML }} />
                <section ref={dcRef} className="hm-section hm-dc" id="hmDayCount" aria-labelledby="hmDcTitle" dangerouslySetInnerHTML={{ __html: DC_HTML }} />
            </div>

            <Dialog open={!!summary} onOpenChange={o => !o && setSummary(null)}>
                <DialogContent className="max-h-[92vh] max-w-[calc(100%-1rem)] overflow-auto sm:max-w-6xl">
                    {summary && (() => { const rows = summary.rows, peak = Math.max(0, ...rows.map(r => r.mkPax)); const g = (n: number) => <span className="grp"> {n} grp</span>;
                        return <>
                            <DialogHeader><DialogTitle>Summary · {rows[0].day} → {rows.at(-1)!.day}</DialogTitle></DialogHeader>
                            <p className="text-sm text-muted-foreground">{rows.length} day{rows.length === 1 ? '' : 's'} · {site.label} · {sumOf(rows, r => r.inPax)} arriving, {sumOf(rows, r => r.outPax)} leaving · {CITY} busiest {peak} guests{summary.cut ? ' · first 92 days only' : ''}</p>
                            <div className="overflow-x-auto"><table className="w-full text-sm">
                                <thead><tr className="border-b text-left"><th>Day</th><th>Check-ins</th><th>Check-outs</th><th>In {CITY}<br /><small>12:00 · now</small></th><th>FE Morning</th><th>FE Night</th><th>FE from Madina</th><th>Breakfast<br /><small>thaals</small></th><th>Lunch<br /><small>thaals</small></th><th>Dinner<br /><small>thaals</small></th></tr></thead>
                                <tbody>{rows.map(r => <tr key={r.day} className="cursor-pointer border-b hover:bg-accent/50" title={`Show ${r.day} on the cards`} onClick={() => { setSummary(null); setViewDay(r.day); document.getElementById('hmTt')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                                    <td><b>{new Date(`${r.day}T12:00`).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</b><br /><small>{new Date(`${r.day}T12:00`).toLocaleDateString(undefined, { weekday: 'long' })}</small></td>
                                    <td><b>{r.inPax}</b>{g(r.ins.length)}</td><td><b>{r.outPax}</b>{g(r.outs.length)}</td><td><b>{r.mkPax}</b>{g(r.mk.length)}</td>
                                    <td><b>{r.fePax.morning}</b>{g(r.fe.morning.items.length)}</td><td><b>{r.fePax.night}</b>{g(r.fe.night.items.length)}</td><td><b>{r.fePax.madina}</b>{g(r.fe.madina.items.length)}</td>
                                    <td>{meal(r, 'breakfast')}</td><td>{meal(r, 'lunch')}</td><td>{meal(r, 'dinner')}</td></tr>)}</tbody>
                                <tfoot><tr className="font-bold"><td>Total</td><td>{sumOf(rows, r => r.inPax)}</td><td>{sumOf(rows, r => r.outPax)}</td><td>peak {peak}</td><td>{sumOf(rows, r => r.fePax.morning)}</td><td>{sumOf(rows, r => r.fePax.night)}</td><td>{sumOf(rows, r => r.fePax.madina)}</td>
                                    <td>{sumOf(rows, r => r.meals?.breakfast || 0)}</td><td>{sumOf(rows, r => r.meals?.lunch || 0)}</td><td>{sumOf(rows, r => r.meals?.dinner || 0)}</td></tr></tfoot></table></div></>; })()}
                </DialogContent>
            </Dialog>
        </>
    );
}
