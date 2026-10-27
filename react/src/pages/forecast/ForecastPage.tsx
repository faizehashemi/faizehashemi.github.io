import { useCallback, useEffect, useRef, useState } from 'react';
import { AllocLog } from '@/components/AllocLog';
import { useCore, useDb, useGuard, usePmsCtx, useLoadApp, useSite } from '@/pms/PmsContext';
import css from './forecast.css?raw';
import { fmt, parseDT, runForecast } from './forecast';

// Vacancy Forecast: the rooms occupied / vacant at a chosen date and time, capacity deviations and the headcount — then the building Planner and the one-click day
// Allocator (the framework-free windows of the old page, views/forecast/planner.js and allocate.js, drawn into this page) and the log of bulk changes.
// Rooms and bed counts come from Rooms & Buildings when it has the building (else from slip history).

type Row = Record<string, any>;
const clean = (s: unknown) => String(s ?? '').trim();
const pad = (n: number) => String(n).padStart(2, '0');

export default function ForecastPage() {
    const { stay, rooms } = useCore();
    const R = rooms as any;
    const db = useDb();
    const guard = useGuard();
    const ctx = usePmsCtx();
    const loadApp = useLoadApp();
    const { siteId } = useSite();
    const plRef = useRef<HTMLElement>(null), alRef = useRef<HTMLElement>(null);
    const now = new Date();
    const [date, setDate] = useState(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`), [time, setTime] = useState(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
    const [building, setBuilding] = useState('ALL'), [mode, setMode] = useState('builder'), [manual, setManual] = useState('');
    const [slips, setSlips] = useState<Row[]>([]), [blds, setBlds] = useState<Row[]>([]), [status, setStatus] = useState('');
    const [result, setResult] = useState<ReturnType<typeof runForecast> | null>(null);

    const refreshDB = useCallback(async () => {
        const b = await guard<Row[]>(R.loadBuildings()), s = (await db.all()) as Row[];
        setBlds(b); setSlips(s); setStatus(`${s.length} slip(s) loaded from DB.`);
        return { b, s };
    }, []);   // eslint-disable-line react-hooks/exhaustive-deps
    const run = (b = blds, s = slips, bld = building) => {
        const when = parseDT(date, time);
        if (!when) { setStatus('Choose a valid date and time.'); return; }
        const r = runForecast({ when, building: bld, mode, manualText: manual, slips: s, buildings: b, siteId, stay, rooms });
        setResult(r); setStatus(r.status);
    };
    useEffect(() => { refreshDB().then(({ b, s }) => run(b, s)).catch(err => { console.error(err); setStatus('Could not read local DB. Open the slip page first in this browser and save at least one slip.'); }); }, []);   // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        let alive = true;
        void (async () => {
            const [pl, al] = await Promise.all([loadApp('views/forecast/planner.js'), loadApp('views/forecast/allocate.js')]);
            if (!alive || !plRef.current || !alRef.current) return;
            const planner = pl.mountPlanner({ ctx, host: plRef.current });
            al.mountAllocator({ ctx, host: alRef.current, planner });
        })();
        return () => { alive = false; };
    }, []);   // eslint-disable-line react-hooks/exhaustive-deps

    const present = [...new Set(slips.map(r => clean(r.building)).filter(Boolean))];
    const canon = R.buildingNames(blds, siteId) as string[];
    const options = [...new Set(['ALL', ...canon, ...present])].filter(Boolean);
    const sm = result?.summary;
    return (
        <>
            <style>{css}</style>
            <section ref={plRef} className="wrap pl" id="planner" />
            <section ref={alRef} className="wrap pl al" id="allocator" />
            <section className="wrap pl lg" id="alloclog"><AllocLog /></section>
            <div className="wrap">
                <h1>Vacancy Forecast</h1>
                <div className="controls">
                    <div><label htmlFor="when_date">Date</label><input type="date" id="when_date" value={date} onChange={e => setDate(e.target.value)} /></div>
                    <div><label htmlFor="when_time">Time</label><input type="time" id="when_time" value={time} onChange={e => setTime(e.target.value)} /></div>
                    <div><label htmlFor="building">Building</label><select id="building" value={building} onChange={e => setBuilding(e.target.value)}>{options.map(v => <option key={v} value={v}>{v === 'ALL' ? 'ALL BUILDINGS' : v}</option>)}</select></div>
                    <div><label htmlFor="inventory_mode">Room inventory</label><select id="inventory_mode" value={mode} onChange={e => setMode(e.target.value)}><option value="builder">From Rooms &amp; Buildings</option><option value="infer">Infer from slips</option><option value="manual">Manual list</option></select></div>
                    <div><label htmlFor="inventory_text">Manual room list (comma or newline separated)</label><textarea id="inventory_text" placeholder={'e.g. 501, 502, 503\n510\n516'} disabled={mode !== 'manual'} style={{ opacity: mode === 'manual' ? 1 : 0.6 }} value={manual} onChange={e => setManual(e.target.value)} /></div>
                    <div><button type="button" onClick={() => run()}>Run Forecast</button> <button type="button" onClick={() => void refreshDB()}>Refresh DB</button> <button type="button" onClick={() => window.print()}>Print</button></div>
                </div>
                <div className="summary">
                    <div className="pill">Inventory rooms: <b>{sm?.total ?? 0}</b></div><div className="pill">Occupied rooms: <b>{sm?.occ ?? 0}</b></div><div className="pill">Vacant rooms: <b>{sm?.free ?? 0}</b></div>
                    <div className="pill">Known occupied capacity (eff.): <b>{sm?.occCap ?? 0}</b></div><div className="pill">Known free capacity: <b>{sm?.freeCap ?? 0}</b></div><div className="pill">Under-assigned rooms: <b>{sm?.under ?? 0}</b></div>
                    <div className="pill">Headcount now: <b>{sm?.head ?? 0}</b> <span className="muted">{sm ? `(G ${sm.sums.g} / L ${sm.sums.l} / C ${sm.sums.c} / I ${sm.sums.i})` : ''}</span></div>
                </div>
                <div className="two">
                    <div><h3 style={{ margin: '8px 0 6px' }}>Occupied at selected time</h3>
                        <table id="tblOcc"><thead><tr><th>Room</th><th>Group</th><th>Leader</th><th>Gender</th><th className="right">Cap (eff.)</th><th>Window</th><th>Building</th><th>SH No.</th></tr></thead>
                            <tbody>{(result?.occRows ?? []).map((e, i) => <tr key={i}><td className="nowrap">{e.room}</td><td>{e.tour}</td><td>{e.leader}</td><td>{e.gender}{e.excl ? ' · Exclusive' : ''}</td><td className="right">{Number.isInteger(e.eff) ? e.eff : ''}</td><td>{e.win}</td><td>{e.bld}</td><td>{String(e.sh)}</td></tr>)}</tbody></table></div>
                    <div><h3 style={{ margin: '8px 0 6px' }}>Vacant at selected time</h3>
                        <table id="tblFree"><thead><tr><th>Room</th><th className="right">Cap (eff.)</th><th className="muted">Note</th></tr></thead>
                            <tbody>{(result?.freeRows ?? []).map((e, i) => <tr key={i}><td className="nowrap">{e.room}</td><td className="right">{e.cap == null ? '' : e.cap}</td><td className="muted">{e.note}</td></tr>)}</tbody></table></div>
                </div>
                <div style={{ marginTop: 16 }}><h3 style={{ margin: '8px 0 6px' }}>Capacity deviations (Assigned vs Capacity)</h3>
                    <table id="tblUnder"><thead><tr><th>Building</th><th>Room</th><th className="right">Assigned</th><th className="right">Capacity</th><th className="right">Δ (A−C)</th><th className="muted">Note</th></tr></thead>
                        <tbody>{(result?.underRows ?? []).map((e, i) => <tr key={i}><td>{e.building}</td><td className="nowrap">{e.room}</td><td className="right">{e.asg}</td><td className="right">{e.cap}</td>
                            <td className={`right ${e.delta < 0 ? 'delta-neg' : 'delta-pos'}`}>{e.delta > 0 ? `+${e.delta}` : e.delta}</td><td className="muted">{e.delta < 0 ? 'under-assigned' : 'over-assigned'}</td></tr>)}</tbody></table>
                    <p className="muted" style={{ margin: '6px 0 0' }}>Snapshot at the selected date/time. Only rooms where assigned differs from capacity are listed.</p></div>
                <p className="muted">{status || fmt(null)}</p>
            </div>
        </>
    );
}
