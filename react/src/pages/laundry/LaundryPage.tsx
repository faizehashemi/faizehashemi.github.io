import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCore, useGuard, useLoadApp, useLoadCore, useSite } from '@/pms/PmsContext';
import css from './pos.css?raw';
import { Dlg, Html, Wheel, type WheelApi } from './parts';

// Laundry POS — the laundry's touch screen (no keyboard). Built for speed and for people who read little: big pictures of each item, big numbers, a few icons,
// one SAVE button. Everything is cash. Same screen, same class names and CSS as the old page (pos.css = views/laundry/view.css), so the kiosk looks and touches
// the same; only the wiring is React. The scroll wheels, number pad, receipt and the offline bill queue are the old shared code (views/laundry/wheel.js,
// core/laundry.js) — bills made offline wait on this device and are sent when the internet is back.
//   🧺 New bill: swipe building → floor → room (wheels) → tap clothes (tap = one more) → SAVE → receipt
//   👷 Staff only: tap the staff category → a window with its people → tap the person, check the PHOTO, tap clothes → SAVE (value recorded, 0 collected)
//   📒 Staff log / 🧾 Building log: one day of staff-only entries or building linen (read only) — tap one to see / print its receipt
//   🏨 Building: the building's linen — tap an item → number pad for the quantity → SAVE
//   💵 Pending cash: my cash bills from a date (to a date) — Unpaid until the admin marks them Paid

type Row = Record<string, any>;
type Tab = 'bill' | 'free' | 'slog' | 'building' | 'blog' | 'cash';
const TABS: [Tab, string, string][] = [['bill', '🧺', 'New bill'], ['free', '👷', 'Staff only'], ['slog', '📒', 'Staff log'], ['building', '🏨', 'Building'], ['blog', '🧾', 'Building log'], ['cash', '💵', 'Pending cash']];
const natural = (a: unknown, b: unknown) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
const shiftDay = (ymd: string, n: number) => new Date(Date.parse(ymd + 'T12:00:00Z') + n * 864e5).toISOString().slice(0, 10);

export default function LaundryPage() {
    const { cloud, rooms, stay } = useCore();
    const guard = useGuard();
    const loadCore = useLoadCore();
    const loadApp = useLoadApp();
    const { siteId } = useSite();
    const rootRef = useRef<HTMLDivElement>(null);
    const [L, setL] = useState<any>(null);            // core/laundry.js
    const [wheelFn, setWheelFn] = useState<any>(null);
    const [tab, setTab] = useState<Tab>('bill');
    const [carts, setCarts] = useState<Record<'bill' | 'free' | 'building', Map<number, number>>>({ bill: new Map(), free: new Map(), building: new Map() });   // one cart per bill tab, so switching tabs never mixes clothes and linen
    const [items, setItems] = useState<Row[]>([]), [staffList, setStaffList] = useState<Row[]>([]), [cats, setCats] = useState<string[]>([]), [info, setInfo] = useState('');
    const [buildings, setBuildings] = useState<Row[]>([]), [slips, setSlips] = useState<Row[]>([]);
    const [staff, setStaff] = useState<Row | null>(null), [usage, setUsage] = useState<Row | null>(null);
    const [picked, setPicked] = useState<{ building: string; room: string }>({ building: '', room: '' });
    const [received, setReceived] = useState('');
    const [offline, setOffline] = useState(0), [saving, setSaving] = useState(false);
    const [dlg, setDlg] = useState<null | { kind: 'people'; g: Row } | { kind: 'approval'; warnings: string[] } | { kind: 'receipt'; bill: Row; warnings: string[]; offline: boolean; close: string }>(null);
    const [msg, setMsg] = useState('');
    const pendingUid = useRef<string | null>(null);
    const wheels = useRef<{ b?: WheelApi; f?: WheelApi; r?: WheelApi }>({});
    const buildingsRef = useRef<Row[]>([]); buildingsRef.current = buildings;

    const building = tab === 'building', free = tab === 'free';
    const billTab: 'bill' | 'free' | 'building' = tab === 'free' || tab === 'building' ? tab : 'bill';
    const cart = carts[billTab];

    // ---- data ----
    const cached = useCallback(async (key: string, fn: () => Promise<any>) => (await guard<any>(L.cached(key, fn))).data, [L]);   // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        void (async () => {
            const [l, w] = await Promise.all([loadCore('laundry'), loadApp('views/laundry/wheel.js')]);
            setL(l); setWheelFn(() => w.wheel);
        })();
    }, []);   // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!L) return;
        const req = (cloud as any).request;
        void (async () => {
            try { setItems((await guard<any>(L.cached(`pms_laundry_items:${siteId}`, () => req('GET', `/api/laundry/items?site=${siteId}`)))).data.items.filter((i: Row) => i.active)); } catch (e: any) { setMsg(e.message || 'Could not load the items.'); }
            try { const r = (await guard<any>(L.cached('pms_laundry_info', () => req('GET', '/api/settings')))).data; setInfo(r.settings?.laundry_info || L.DEFAULT_INFO); setCats(r.settings?.laundry_staff_categories?.[siteId] || []); } catch { setInfo(L.DEFAULT_INFO); }
            loadSlips();
            try { setStaffList((await guard<any>(L.cached(`pms_laundry_staff:${siteId}`, () => req('GET', `/api/laundry/staff?site=${siteId}`)))).data.staff.filter((s: Row) => s.active && s.free)); } catch { /* ignore */ }
            refreshOffline(); void tryFlush();
        })();
        const onOnline = () => void tryFlush();
        window.addEventListener('online', onOnline);
        const timer = setInterval(() => void tryFlush(), 30000);
        return () => { clearInterval(timer); window.removeEventListener('online', onOnline); };
    }, [L]);   // eslint-disable-line react-hooks/exhaustive-deps
    // in-house slips: tell which group is in the chosen room
    const loadSlips = () => { void guard<any[]>(cloud.mirrorAll(siteId)).then(a => setSlips(a.filter(s => !s.deleted))).catch(() => { /* ignore */ }); };
    const refreshOffline = () => setOffline(L ? L.queued().length : 0);
    const tryFlush = async () => { if (!L || !L.queued().length) return; const r = await L.flushQueue(); refreshOffline(); if (r.sent && tab === 'cash') setCashTick(t => t + 1); };

    // ---- the wheels: building → floor → room (buildings and rooms from Rooms & Buildings; this site's, all when the site has none) ----
    const floorOfRoom = (r: Row) => String(r.floor || rooms.floorOf(r.room_no) || '0');
    const bOf = (name?: string) => buildingsRef.current.find(b => b.name === name);
    function pickBuilding(name: string) {
        try { if (name) localStorage.setItem(`pms_laundry_building:${siteId}`, name); } catch { /* ignore */ }
        const floors = [...new Set((bOf(name)?.rooms || []).map(floorOfRoom))].sort(natural) as string[];
        wheels.current.f?.set(floors.map(f => ({ value: f, label: f === '0' ? 'G' : f })), floors[0]);
        pickFloor(floors[0], name);
    }
    function pickFloor(floor: string | undefined, name = wheels.current.b?.value) {
        const rs = (bOf(name)?.rooms || []).filter((r: Row) => floorOfRoom(r) === floor).map((r: Row) => rooms.normRoom(r.room_no)).sort(natural);
        wheels.current.r?.set([{ value: '', label: '—', cls: 'none' }, ...rs.map((r: string) => ({ value: r, label: r }))], '');
        setPicked({ building: name || '', room: '' });
    }
    const wheelsReady = !!wheelFn;
    useEffect(() => {
        if (!wheelsReady) return;
        void (async () => {
            try {
                const all = await guard<any[]>(rooms.loadBuildings({ force: true }));
                const own = rooms.buildingsOfSite(all, siteId);
                const bs = (own.length ? own : all).map((b: Row) => ({ name: b.name, sort: b.sort || 0, rooms: (b.rooms || []).filter((r: Row) => r.active !== false && r.room_no) })).filter((b: Row) => b.rooms.length)
                    .sort((a: Row, b: Row) => a.sort - b.sort || natural(a.name, b.name));
                buildingsRef.current = bs; setBuildings(bs);
                let keep = ''; try { keep = localStorage.getItem(`pms_laundry_building:${siteId}`) || ''; } catch { /* ignore */ }
                wheels.current.b?.set(bs.map((b: Row) => ({ value: b.name, label: b.name })), keep);
                pickBuilding(wheels.current.b?.value ?? '');
            } catch { /* the "No rooms yet" line shows */ }
        })();
    }, [wheelsReady]);   // eslint-disable-line react-hooks/exhaustive-deps
    // the group staying in that room right now (from the slips), kept on the bill
    const groupIn = (b: string, room: string) => {
        const now = Date.now();
        for (const s of slips) {
            if (rooms.normBuilding(s.building) !== b) continue;
            if ((stay.rowsOf(s) as Row[]).some(w => rooms.normRoom(w.room_no) === room && w.start <= now && now < w.end)) return s.tour_name || '';   // the room's own row still in house
        }
        return '';
    };
    const customer = () => ({ name: '', room: picked.room, building: picked.building, group: picked.room ? groupIn(picked.building, picked.room) : '' });
    useEffect(() => { if (tab === 'bill') Object.values(wheels.current).forEach(w => w?.sync()); }, [tab]);

    // ---- items & cart ----
    const shown = items.filter(i => (i.category || 'guest') === (building ? 'building' : 'guest'));
    const setQty = (id: number, q: number) => setCarts(c => { const m = new Map(c[billTab]); if (q > 0) m.set(id, q); else m.delete(id); return { ...c, [billTab]: m }; });
    const add = (id: number, n: number) => setCarts(c => { const m = new Map(c[billTab]); const q = Math.max(0, (m.get(id) || 0) + n); if (q > 0) m.set(id, q); else m.delete(id); return { ...c, [billTab]: m }; });
    async function askQty(id: number) {   // the number pad for one item's quantity
        const i = items.find(x => x.id === id);
        if (!i) return;
        const q = await L.keypad({ title: `${L.itemPic(i, 'kp-pic')}<span>${L.esc(i.name)}<br><small>How many?</small></span>`, value: cart.get(id) || 0, root: rootRef.current });
        if (q != null) setQty(id, q);
    }
    const lines = useMemo(() => [...cart].map(([id, qty]) => { const i = items.find(x => x.id === id); return i && { item_id: id, name: i.name, price: i.price, qty, amount: i.price * qty, image: i.image }; }).filter(Boolean) as Row[], [cart, items]);
    const total = building ? 0 : lines.reduce((n, l) => n + l.amount, 0);
    const pcs = lines.reduce((n, l) => n + l.qty, 0);
    function resetBill() {
        setCarts(c => ({ ...c, [billTab]: new Map() })); setReceived('');
        if (tab === 'bill') pickFloor(wheels.current.f?.value);   // keep building and floor (the next customer is often a neighbour), room back to —
        if (tab === 'free') { setStaff(null); setUsage(null); }
    }
    const got = received.trim() === '' ? null : Math.round(Number(received) * 100);

    // ---- staff only ----
    const groups = useMemo(() => {
        const known = new Set(cats);
        const out = cats.map(c => ({ key: c, label: c, people: staffList.filter(s => s.category === c) }));
        const rest = staffList.filter(s => !known.has(s.category || ''));
        if (rest.length) out.push({ key: '', label: 'Uncategorized', people: rest });
        return out;
    }, [cats, staffList]);
    async function pick(s: Row) {
        setDlg(null); setStaff(s); setUsage(null);
        try { setUsage((await guard<any>((cloud as any).request('GET', `/api/laundry/staff/${s.id}`))).usage); } catch { /* ignore */ }
    }
    const warnList = () => {
        if (!staff) return [] as string[];
        const Lm = staff.limits || {}, u = usage, w: string[] = [];
        if (Lm.per_bill_items && pcs > Lm.per_bill_items) w.push(`${pcs} pieces — limit ${Lm.per_bill_items} per time`);
        if (u && Lm.per_day_items && u.day_items + pcs > Lm.per_day_items) w.push(`${u.day_items + pcs} pieces today — limit ${Lm.per_day_items}`);
        if (u && Lm.per_week_items && u.week_items + pcs > Lm.per_week_items) w.push(`${u.week_items + pcs} pieces this week — limit ${Lm.per_week_items}`);
        if (u && Lm.per_month_value && u.month_value + total > Lm.per_month_value) w.push(`${L.sar(u.month_value + total)} SAR this month — limit ${L.sar(Lm.per_month_value)}`);
        if (u && Lm.per_month_bills && u.month_bills + 1 > Lm.per_month_bills) w.push(`${u.month_bills + 1} times this month — limit ${Lm.per_month_bills}`);
        return w;
    };

    // ---- save ----
    async function save(approval?: { name: string; password: string }) {
        if (!lines.length) return;
        const cust = customer();
        if (tab === 'bill' && !cust.room) { setMsg('Choose the room first (swipe the wheels).'); return; }
        const payload: Row = {
            site: siteId, kind: free ? 'free' : building ? 'building' : 'paid', customer: free || building ? undefined : cust, staff_id: free ? staff?.id : undefined,
            lines: lines.map(l => ({ item_id: l.item_id, qty: l.qty })), method: tab === 'bill' ? 'cash' : undefined, received: tab !== 'bill' || received.trim() === '' ? undefined : Number(received),
            preview_lines: lines.map(({ image: _i, ...l }) => l), preview_value: total, staff_name: free ? staff?.name : undefined, approval,
        };
        payload.client_uid = pendingUid.current || (pendingUid.current = L.uid());
        setSaving(true); setMsg('');
        try {
            const r = await guard<any>(L.saveBill(payload));
            pendingUid.current = null;
            setDlg({ kind: 'receipt', bill: r.bill, warnings: r.warnings || [], offline: !!r.offline, close: '➕ Next bill' });
            resetBill(); refreshOffline(); loadSlips();
        } catch (e: any) {
            if (e instanceof L.ApiError && e.status === 409 && e.extra?.needs_approval) setDlg({ kind: 'approval', warnings: e.extra.warnings || [] });
            else setMsg(e instanceof cloud.UserError ? e.message : (e.message || 'Could not save. Try again.'));
        } finally { setSaving(false); }
    }

    // ---- logs ----
    const [slog, setSlog] = useState<{ day: string; bills: Row[]; err: string; loading: boolean }>({ day: '', bills: [], err: '', loading: false });
    const [cash, setCash] = useState<{ from: string; to: string; show: string; bills: Row[]; err: string; picked: boolean }>({ from: '', to: '', show: 'all', bills: [], err: '', picked: false });
    const [cashTick, setCashTick] = useState(0);
    const slogDay = slog.day || (L ? L.jeddahDay() : '');
    useEffect(() => {
        if (!L || (tab !== 'slog' && tab !== 'blog')) return;
        const kind = tab === 'blog' ? 'building' : 'free', day = slogDay;
        setSlog(s => ({ ...s, day, loading: true, err: '' }));
        guard<any>((cloud as any).request('GET', `/api/laundry/bills?site=${siteId}&from=${day}&to=${day}&kind=${kind}&all=1`))
            .then(r => setSlog(s => ({ ...s, bills: r.bills, loading: false }))).catch(e => setSlog(s => ({ ...s, bills: [], err: e.message || 'Not available offline.', loading: false })));
    }, [L, tab, slogDay]);   // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!L || tab !== 'cash') return;
        void (async () => {
            let from = cash.from;
            if (!cash.picked) { try { from = (await guard<any>((cloud as any).request('GET', `/api/laundry/oldest-unpaid?site=${siteId}`))).day || L.jeddahDay(); } catch { from = from || L.jeddahDay(); } }
            const f = from || L.jeddahDay(), t = cash.to || L.jeddahDay();
            if (!cash.picked) setCash(c => ({ ...c, from: f, picked: true }));
            if (t < f) { setCash(c => ({ ...c, bills: [], err: '"To" is before "From".' })); return; }
            try { const r = await guard<any>((cloud as any).request('GET', `/api/laundry/bills?site=${siteId}&from=${f}&to=${t}&kind=paid&all=1`)); setCash(c => ({ ...c, bills: (r.bills as Row[]).filter(b => !b.voided), err: '' })); }
            catch (e: any) { setCash(c => ({ ...c, bills: [], err: e.message })); }
        })();
    }, [L, tab, cash.from, cash.to, cashTick]);   // eslint-disable-line react-hooks/exhaustive-deps

    if (!L) return <div className="p-4 text-sm">Loading…</div>;
    const { sar, itemPic, jeddahDay, jeddahTime, jeddahDate } = L;
    const html = (h: string) => <Html h={h} />;
    const custLabel = (b: Row) => (b.kind === 'free' ? '👷 ' + b.staff_name : b.kind === 'building' ? `🏨 Building linen${b.customer?.building ? ' · ' + b.customer.building : ''}` : `🚪 ${[b.customer?.building, b.customer?.room || '—'].filter(Boolean).join(' · ')}${b.customer?.name ? ' · ' + b.customer.name : ''}`);
    const billish = tab === 'bill' || tab === 'free' || tab === 'building';
    const quick = [...new Set([total, ...[5, 10, 20, 50, 100, 200, 500].map(v => v * 100).filter(v => v > total)].slice(0, 5))];
    const queue: Row[] = L.queued();

    function logs(kind: 'free' | 'building') {
        const bld = kind === 'building', live = slog.bills.filter(b => !b.voided), n = live.reduce((x, b) => x + b.items, 0);
        const byItem = new Map<string, number>();
        if (bld) for (const b of live) for (const l of b.lines) byItem.set(l.name, (byItem.get(l.name) || 0) + l.qty);
        const order = (nm: string) => items.findIndex(i => i.name === nm) + 1 || 999;
        const photo = (b: Row) => {
            if (bld) { const l = b.lines[0]; return html(itemPic(items.find(i => i.name === l?.name) || { name: l?.name }, 'ld-mini')); }
            const s = staffList.find(x => x.id === b.staff_id); return s?.photo ? <img className="ld-mini" src={s.photo} alt="" /> : <span className="ld-mini none">👤</span>;
        };
        const setDay = (d: string) => setSlog(s => ({ ...s, day: d }));
        return (
            <section className="ld-pane">
                <div className="ld-dates ld-day">
                    <button type="button" aria-label="Previous day" onClick={() => setDay(shiftDay(slogDay, -1))}>◀</button>
                    <label><span>📅 Day</span><input type="date" value={slogDay} onChange={e => setDay(e.target.value || jeddahDay())} /></label>
                    <button type="button" aria-label="Next day" disabled={slogDay >= jeddahDay()} onClick={() => setDay(shiftDay(slogDay, 1))}>▶</button>
                    <button type="button" onClick={() => setDay(jeddahDay())}>Today</button>
                </div>
                {!slog.err && <div className="ld-kpis">
                    {!bld && <div className="ld-kpi"><span>👷</span><b>{new Set(live.map(b => b.staff_id)).size}</b><small>staff</small></div>}
                    <div className="ld-kpi"><span>🧾</span><b>{live.length}</b><small>{live.length === 1 ? 'entry' : 'entries'}</small></div>
                    <div className="ld-kpi"><span>{bld ? '🧺' : '👕'}</span><b>{n}</b><small>pieces</small></div></div>}
                <div className="ld-logitems">{[...byItem].sort((x, y) => order(x[0]) - order(y[0])).map(([nm, q]) => <span key={nm} className="ld-logitem">{html(itemPic(items.find(i => i.name === nm) || { name: nm }, 'ld-pic sm'))}<b>{q}</b><small>{nm}</small></span>)}</div>
                <div className="ld-cards">
                    {slog.loading ? <p className="ld-muted">Loading…</p> : slog.err ? <p className="ld-muted">{slog.err}</p> : slog.bills.length ? [...slog.bills].sort((a, b) => a.given_at.localeCompare(b.given_at)).map(b => (
                        <button type="button" key={b.id} className={`ld-card row slog ${bld ? 'blog' : ''} ${b.voided ? 'void' : ''}`} onClick={() => setDlg({ kind: 'receipt', bill: b, warnings: [], offline: false, close: '✖ Close' })}>
                            {photo(b)}
                            <div className="ld-cmain"><b>{bld ? '🏨 Building linen' : '👷 ' + (b.staff_name || '')}</b>
                                <small>{jeddahTime(b.given_at)} · {b.receipt_no} · {b.worker || ''}{b.voided ? ' · ❌ cancelled' : ''}</small>
                                <small>{b.lines.map((l: Row) => `${l.name} × ${l.qty}`).join(', ')}</small></div>
                            <b className="ld-amt">{b.items} <small>pcs</small></b></button>)) : <p className="ld-muted">No {bld ? 'building linen' : 'staff laundry'} on this day.</p>}
                </div>
            </section>
        );
    }
    function cashPane() {
        const bs = cash.bills, unpaid = bs.filter(b => !b.settled_at), paid = bs.filter(b => b.settled_at), sum = (a: Row[]) => a.reduce((n, b) => n + b.paid, 0);
        const list = cash.show === 'paid' ? paid : cash.show === 'unpaid' ? unpaid : bs;
        const show = (k: string) => setCash(c => ({ ...c, show: c.show === k ? 'all' : k }));
        return (
            <section className="ld-pane">
                <div className="ld-queue">{queue.length > 0 && <div className="ld-qbox"><b>⏳ {queue.length} bill{queue.length === 1 ? '' : 's'} waiting on this device</b>
                    {queue.map(x => <div key={x.client_uid} className="ld-qrow"><span>{x.local_no} · {x.kind === 'free' ? '👷 ' + (x.staff_name || '') : [x.customer?.building, x.customer?.room, x.customer?.name].filter(Boolean).join(' ')} · {sar(x.preview_value || 0)} SAR</span>
                        {x.error && <><small className="bad">{x.error}</small><button type="button" onClick={() => { if (confirm('Remove this bill from the device? It will NOT be saved.')) { L.dropQueued(x.client_uid); refreshOffline(); } }}>Remove</button></>}</div>)}
                    <button type="button" className="ok" onClick={async () => { const r = await L.flushQueue(); refreshOffline(); if (r.sent) setCashTick(t => t + 1); if (r.left && !r.failed) setMsg('Still no connection. The bills stay on this device.'); }}>📤 Send now</button></div>}</div>
                <div className="ld-dates">
                    <label><span>📅 From</span><input type="date" value={cash.from} onChange={e => setCash(c => ({ ...c, picked: true, from: e.target.value || jeddahDay() }))} /></label>
                    <label><span>📅 To <small>(optional)</small></span><input type="date" value={cash.to} onChange={e => setCash(c => ({ ...c, to: e.target.value }))} /></label>
                    <button type="button" aria-label="Clear the To date" onClick={() => setCash(c => ({ ...c, to: '' }))}>✖ To</button>
                </div>
                {!cash.err && <div className="ld-kpis">
                    <button type="button" className={`ld-kpi unpaid${cash.show === 'unpaid' ? ' on' : ''}`} onClick={() => show('unpaid')}><span>⏳</span><b>{sar(sum(unpaid))}</b><small>Unpaid SAR · {unpaid.length} bill{unpaid.length === 1 ? '' : 's'}</small></button>
                    <button type="button" className={`ld-kpi paid${cash.show === 'paid' ? ' on' : ''}`} onClick={() => show('paid')}><span>✅</span><b>{sar(sum(paid))}</b><small>Paid SAR · {paid.length} bill{paid.length === 1 ? '' : 's'}</small></button>
                    <button type="button" className={`ld-kpi${cash.show === 'all' ? ' on' : ''}`} onClick={() => show('all')}><span>🧾</span><b>{sar(sum(bs))}</b><small>All cash SAR · {bs.length}</small></button></div>}
                <div className="ld-cards">{cash.err ? <p className="ld-muted">{cash.err}</p> : list.length ? list.map(b => (
                    <button type="button" key={b.id} className={`ld-card row ${b.settled_at ? 'paid' : 'unpaid'}`} onClick={() => setDlg({ kind: 'receipt', bill: b, warnings: [], offline: false, close: '✖ Close' })}>
                        <div className="ld-cmain"><b>{custLabel(b)}</b><small>{jeddahDate(b.given_at)} {jeddahTime(b.given_at)} · {b.receipt_no} · {b.items} pcs{b.settled_at ? ` · paid ${jeddahDate(b.settled_at)}${b.settled_by ? ' to ' + b.settled_by : ''}` : ''}</small></div>
                        <span className="ld-paytag">{b.settled_at ? 'Paid' : 'Unpaid'}</span><b className="ld-amt">{sar(b.paid)}</b></button>)) : <p className="ld-muted">No cash bills in these dates.</p>}</div>
            </section>
        );
    }
    const w = warnList();
    return (
        <div ref={rootRef}>
            <style>{css + L.RECEIPT_CSS + L.KEYPAD_CSS}</style>
            <div className={`ld${free ? ' free' : ''}${building ? ' bld' : ''}`}>
                <nav className="ld-tabs" role="tablist" aria-label="Laundry POS">
                    {TABS.map(([k, ic, l]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => { setTab(k); window.scrollTo(0, 0); }}><span aria-hidden="true">{ic}</span>{l}</button>)}
                </nav>
                <div className="ld-info"><span aria-hidden="true">🕗</span><div>{info.split('\n').map((x, i) => <span key={i}>{i ? <br /> : null}{x}</span>)}</div></div>
                {offline > 0 && <div className="ld-offline">⏳ {offline} bill{offline === 1 ? '' : 's'} waiting on this device — sent automatically when the internet is back.</div>}
                {msg && <div className="ld-warn" role="alert" onClick={() => setMsg('')}>{msg}</div>}

                <section className="ld-pane" hidden={!billish}>
                    <div className="ld-who" hidden={tab !== 'bill'}>
                        <div className="ld-wheels">
                            <div className="ld-wcol"><small>🏨 Building</small><Wheel make={wheelFn} onReady={w2 => { wheels.current.b = w2; }} onPick={v => pickBuilding(v)} label="Building" id="ldWBuilding" /></div>
                            <div className="ld-wcol narrow rm"><small>⬆️ Floor</small><Wheel make={wheelFn} onReady={w2 => { wheels.current.f = w2; }} onPick={v => pickFloor(v)} label="Floor" id="ldWFloor" /></div>
                            <div className="ld-wcol rm"><small>🚪 Room</small><Wheel make={wheelFn} onReady={w2 => { wheels.current.r = w2; }} onPick={v => setPicked(p => ({ ...p, room: v }))} label="Room" id="ldWRoom" /></div>
                        </div>
                        <div className="ld-picked">{!buildings.length ? <small>No rooms yet — the admin adds them on Rooms &amp; Buildings.</small>
                            : picked.room ? <>🚪 {picked.building} · {picked.room}{groupIn(picked.building, picked.room) ? <span className="grp">🏨 {groupIn(picked.building, picked.room)}</span> : null}</> : <small>👆 Swipe the wheels to the room</small>}</div>
                    </div>
                    <div className="ld-who" hidden={!free}>
                        {!staff && <div className="ld-cats">{groups.length ? groups.map(g => (
                            <button type="button" key={g.key || 'none'} className="ld-cat" disabled={!g.people.length} onClick={() => setDlg({ kind: 'people', g })}>
                                <span className="ld-cat-faces">{g.people.slice(0, 3).map((s, i) => (s.photo ? <img key={i} src={s.photo} alt="" /> : <span key={i}>👤</span>))}{!g.people.length && <span>👷</span>}</span>
                                <b>{g.label}</b><small>{g.people.length} {g.people.length === 1 ? 'person' : 'people'}</small></button>)) : <p className="ld-muted">No staff yet — the admin adds them on Laundry admin → Staff.</p>}</div>}
                        {staff && <div className="ld-staff-card">
                            <div className="ld-photo">{staff.photo ? <img src={staff.photo} alt={`Photo of ${staff.name}`} /> : <span>👤<small>no photo</small></span>}</div>
                            <div className="ld-sinfo"><b>{staff.name}</b><span>{[staff.staff_code && 'ID ' + staff.staff_code, staff.department, staff.room && '🚪 ' + staff.room].filter(Boolean).join(' · ')}</span>
                                <span className="ld-check">👀 Is this the same person? Check the photo.</span>
                                {usage && <span className="ld-usage">This month: <b>{usage.month_bills}</b> times · <b>{usage.month_items}</b> pcs · <b>{sar(usage.month_value)}</b> SAR</span>}
                                {w.length > 0 && <span className="ld-warn">⚠️ {w.map((x, i) => <span key={i}>{i ? <><br />⚠️ </> : null}{x}</span>)}{staff.limits?.enforce && <><br />Supervisor approval needed.</>}</span>}
                                <button type="button" className="ld-change-staff" onClick={() => setStaff(null)}>Change person</button></div></div>}
                    </div>

                    <div className="ld-items">{shown.length ? shown.map(i => {
                        const q = cart.get(i.id) || 0;
                        return (
                            <button type="button" key={i.id} className={`ld-item${q ? ' on' : ''}`} aria-label={`${i.name}${building ? '' : `, ${sar(i.price)} SAR`}${q ? `, ${q} added` : ''}`}
                                onClick={ev => { if (building) { void askQty(i.id); return; } add(i.id, 1); const b = ev.currentTarget; b.classList.add('pop'); setTimeout(() => b.classList.remove('pop'), 180); }}>   {/* linen comes in dozens: type the number */}
                                {html(itemPic(i))}
                                <span className="ld-iname">{i.name}{i.name_local ? <small>{i.name_local}</small> : null}</span>
                                {building ? <span className="ld-iprice"><small>🔢 tap for quantity</small></span> : <span className="ld-iprice">{sar(i.price)} <small>SAR</small></span>}
                                {q ? <b className="ld-badge">{q}</b> : null}
                            </button>);
                    }) : <p className="ld-muted">No {building ? 'building' : ''} items yet — the admin adds them on Laundry admin → Prices.</p>}</div>

                    <div className="ld-cart">{lines.length ? <table className="ld-cart-t"><tbody>{lines.map(l => (
                        <tr key={l.item_id}>
                            <td className="c-pic">{html(itemPic(l, 'ld-pic sm'))}</td><td className="c-name">{l.name}{building ? null : <small>{sar(l.price)} SAR</small>}</td>
                            <td className="c-qty"><button type="button" aria-label={`One less ${l.name}`} onClick={() => add(l.item_id, -1)}>−</button><button type="button" className="c-num" aria-label={`Type the quantity of ${l.name}`} onClick={() => void askQty(l.item_id)}>{l.qty}</button><button type="button" aria-label={`One more ${l.name}`} onClick={() => add(l.item_id, 1)}>+</button></td>
                            <td className="c-amt">{building ? '' : sar(l.amount)}</td></tr>))}</tbody></table>
                        : <p className="ld-hint">👆 {building ? 'Tap an item and type how many' : 'Tap the pictures to add clothes'}</p>}</div>

                    <div className="ld-pay" hidden={tab !== 'bill'}>
                        <div className="ld-recv" hidden={!total}>
                            <span>💵 Given</span>
                            <div className="ld-quick">{total ? quick.map(v => <button type="button" key={v} onClick={() => setReceived(sar(v))}>{sar(v)}</button>) : null}</div>
                            <input readOnly inputMode="none" placeholder="other" aria-label="Cash given (opens the number pad)" value={received}
                                onClick={async () => { const v = await L.keypad({ title: '<span>💵 Cash given<br><small>SAR</small></span>', value: Number(received) || 0, max: 100000, root: rootRef.current }); if (v != null) setReceived(v ? String(v) : ''); }} />   {/* no keyboard on the laundry screen */}
                            <b className={`ld-change${got != null && got < total ? ' bad' : ''}`}>{got == null || !Number.isFinite(got) ? '' : got < total ? `short ${sar(total - got)}` : `change ${sar(got - total)}`}</b>
                        </div>
                    </div>

                    <div className={`ld-bar${free ? ' free' : ''}${building ? ' bld' : ''}`}>
                        <div className="ld-total"><small>{free ? 'VALUE · STAFF' : building ? 'BUILDING · NO PAYMENT' : 'TOTAL · CASH'}</small><b>{building ? pcs : sar(total)}</b><small><span>{building ? 'pieces' : 'SAR'}</span>{!building && <span> · {pcs} pcs</span>}</small></div>
                        <button type="button" className="ld-clear" aria-label="Clear the bill" onClick={() => { if (!cart.size || confirm('Clear this bill?')) resetBill(); }}>✖</button>
                        <button type="button" className="ld-save" disabled={!lines.length || (free && !staff) || saving} onClick={() => void save()}><span aria-hidden="true">✔</span> SAVE{free ? ' · STAFF' : building ? ' · BUILDING' : ''}</button>
                    </div>
                </section>

                {(tab === 'slog' || tab === 'blog') && logs(tab === 'blog' ? 'building' : 'free')}
                {tab === 'cash' && cashPane()}
            </div>

            {dlg?.kind === 'people' && <Dlg className="ld-dlg ld-people" onClose={() => setDlg(null)}>
                <div className="ld-people-h"><h3>👷 {dlg.g.label}</h3><button type="button" aria-label="Close" onClick={() => setDlg(null)}>✖</button></div>
                <div className="ld-people-grid">{dlg.g.people.map((s: Row) => (
                    <button type="button" key={s.id} className="ld-person" onClick={() => void pick(s)}>
                        {s.photo ? <img src={s.photo} alt="" /> : <span className="nophoto">👤</span>}<b>{s.name}</b><small>{[s.staff_code, s.department, s.room && '🚪 ' + s.room].filter(Boolean).join(' · ')}</small></button>))}</div></Dlg>}
            {dlg?.kind === 'approval' && <ApprovalDlg warnings={dlg.warnings} onClose={() => setDlg(null)} onApprove={a => { setDlg(null); void save(a); }} />}
            {dlg?.kind === 'receipt' && <Dlg className="ld-dlg ld-rdlg" onClose={() => setDlg(null)}>
                {dlg.close === '➕ Next bill' && <div className="ld-done">{dlg.offline ? '⏳ Saved on this device — will send when online' : dlg.bill.kind === 'free' ? '✅ Saved · STAFF' : dlg.bill.kind === 'building' ? '✅ Saved · building linen' : `✅ Saved · ${sar(dlg.bill.paid)} SAR cash`}</div>}
                {dlg.warnings.length > 0 && <div className="ld-warn">⚠️ {dlg.warnings.map((x, i) => <span key={i}>{i ? <><br />⚠️ </> : null}{x}</span>)}</div>}
                {html(L.receiptHTML(dlg.bill, info))}
                <div className="ld-dlg-b"><button type="button" onClick={() => L.printReceipt(dlg.bill, info)}>🖨 Print</button><button type="button" className="ok" onClick={() => setDlg(null)}>{dlg.close}</button></div></Dlg>}
        </div>
    );
}

// over a staff member's limit with "approval required": a supervisor types their login name + password
function ApprovalDlg({ warnings, onClose, onApprove }: { warnings: string[]; onClose: () => void; onApprove: (a: { name: string; password: string }) => void }) {
    const [n, setN] = useState(''), [p, setP] = useState('');
    return <Dlg className="ld-dlg" onClose={onClose}><form className="ld-appr" onSubmit={e => { e.preventDefault(); onApprove({ name: n.trim(), password: p }); }}>
        <h3>⚠️ Supervisor approval</h3><p>{warnings.map((x, i) => <span key={i}>{i ? <br /> : null}{x}</span>)}</p>
        <label>Supervisor login<input autoComplete="off" required value={n} onChange={e => setN(e.target.value)} /></label>
        <label>Password<input type="password" autoComplete="off" required value={p} onChange={e => setP(e.target.value)} /></label>
        <div className="ld-dlg-b"><button type="button" onClick={onClose}>Cancel</button><button type="submit" className="ok">✔ Approve &amp; save</button></div></form></Dlg>;
}
