import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useConfirm } from '@/components/ConfirmDialog';
import { usePrompt } from '@/components/PromptDialog';
import { useCore, useDb, useGuard, useLoadApp, useLoadCore, useNav, useParams, useSite } from '@/pms/PmsContext';
import css from './slip.css?raw';
import { bulkParse, buildCapacityMap, checkAvailability, cleanRoom, collectRows, emptyDelay, emptyForm, formData, formFrom, holdUntil, newRow, parseDT, shValue, type Availability, type Delay, type Form, type RoomRow } from './slip';

// Slip: the accommodation slip — SH, group, guests, stay, rooms (gents / ladies, each with beds, Exclusive and, for a delayed departure, its own check-out), notes,
// From / To; Save a new slip, Edit a saved one, Check room availability, Fetch capacities, Pick rooms…, the version History and the Check-in flag. The same screen,
// class names and CSS as the old page. The rules (availability against the other slips, capacity sources, Exclusive rooms, gents/ladies rooms) are slip.ts, moved
// unchanged; the Pick rooms… window, the result window and the History panel are the old framework-free modules (views/slip/*.js).

type Row = Record<string, any>;
const PLACES = ['Madina Airport', 'Jeddah Airport', 'Makkah', 'Medina', 'By car', 'By bus', 'By train'];
const iso = (ms?: number | null) => (ms ? new Date(ms).toISOString() : null);
const win = (w: Row) => ({ ...w, start: iso(w.start), end: iso(w.end) });

export default function SlipPage() {
    const { cloud, stay, rooms, prefs: prefsLib, settings: S, ums, checkin, timefmt } = useCore();
    const R = rooms as any, st = S as any;
    const db = useDb();
    const guard = useGuard();
    const params = useParams();
    const loadApp = useLoadApp();
    const loadCore = useLoadCore();
    const { siteId } = useSite();
    const { href } = useNav();
    const { ask: confirmAsk, dialog: confirmDialog } = useConfirm();
    const { ask: promptAsk, dialog: promptDialog } = usePrompt();
    const rootRef = useRef<HTMLDivElement>(null), histRef = useRef<HTMLElement>(null);
    const prefs = prefsLib.getPrefs() as Row;
    const use24 = (timefmt as any).use24() as boolean;

    const [mods, setMods] = useState<{ picker: any; modal: any; hist: any; tele: any } | null>(null);
    const [form, setForm] = useState<Form>(emptyForm());
    const [gents, setGents] = useState<RoomRow[]>([newRow()]), [ladies, setLadies] = useState<RoomRow[]>([newRow()]);
    const [delay, setDelay] = useState<Delay>(emptyDelay());
    const [allAll, setAllAll] = useState({ date: '', time: '', status: 'tentative' });
    const [currentId, setCurrentId] = useState<number | null>(null);
    const [unlocked, setUnlocked] = useState(false), [busy, setBusy] = useState(false);
    const [dbCache, setDbCache] = useState<Row[]>([]), [buildings, setBuildings] = useState<Row[]>([]);
    const [status, setStatus] = useState(''), [bulk, setBulk] = useState({ g: '', l: '' }), [bulkBeds, setBulkBeds] = useState<number | null>(null);
    const [conflicts, setConflicts] = useState<Set<string>>(new Set()), [okFill, setOkFill] = useState<Set<number>>(new Set());
    const [stays, setStays] = useState<Row[]>([]), [shCfg, setShCfg] = useState<{ prefixes: string[]; re: RegExp; hold: number }>({ prefixes: st.DEFAULTS.sh_prefixes, re: st.shPattern(st.DEFAULTS.sh_prefixes), hold: st.DEFAULTS.delay_hold_days });
    const loadedRooms = useRef<Set<string>>(new Set()), idRef = useRef<number | null>(null), history = useRef<any>(null);
    const cacheRef = useRef<Row[]>([]); cacheRef.current = dbCache;
    const bldRef = useRef<Row[]>([]); bldRef.current = buildings;
    idRef.current = currentId;
    const roomKey = (side: string, room: string, b: string) => `${side}|${R.normRoom(room)}|${(stay as any).normB(b)}`;

    const refreshCache = useCallback(async () => { const all = (await db.all()) as Row[]; setDbCache(all); cacheRef.current = all; return all; }, []);   // eslint-disable-line react-hooks/exhaustive-deps
    const fmt = (dt: Date | null) => (dt ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short', hour12: !use24 }).format(dt) : '');

    // ---- boot ----
    useEffect(() => {
        void (async () => {
            const [picker, modal, hist, tele] = await Promise.all([loadApp('views/slip/room-picker.js'), loadApp('views/slip/checkmodal.js'), loadApp('views/slip/history.js'), loadCore('telemetry')]);
            try { const s = (await guard<any>(st.loadSettings())).settings; const pf = s.sh_prefixes || st.DEFAULTS.sh_prefixes; setShCfg({ prefixes: pf, re: st.shPattern(pf), hold: Number(s.delay_hold_days) || st.DEFAULTS.delay_hold_days }); } catch { /* defaults */ }
            const b = await guard<Row[]>(R.loadBuildings()); setBuildings(b); bldRef.current = b;
            // this browser's defaults for a new slip (Settings → Slip page)
            setForm(f => ({ ...f, building: prefs.slipDefaultBuilding || '', checkin_time: prefs.slipCheckinTime || '', checkout_time: prefs.slipCheckoutTime || '' }));
            if (db.readonly) setStatus(db.readonlyReason);
            await refreshCache();
            setMods({ picker, modal, hist, tele });
        })();
    }, []);   // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!mods || !histRef.current) return;
        history.current = mods.hist.mountSlipHistory({
            host: histRef.current, api: db, current: () => idRef.current, canWrite: () => !db.readonly,
            onActivated: async (slip: Row) => { load(slip); await refreshCache(); setStatus(`Version in use changed — SH ${slip.sh_no || ''} (#${slip.id})`); },
        });
    }, [mods]);   // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => { history.current?.load(currentId); }, [currentId]);
    useEffect(() => { const sh = params.get('sh_no'); if (mods && sh) { setForm(f => ({ ...f, sh_no: sh })); void fetchBySh(sh); } }, [mods]);   // eslint-disable-line react-hooks/exhaustive-deps

    const rec = currentId != null ? dbCache.find(r => r.id === currentId) : null;
    const held = rec?.ums?.held;
    const checkedIn = checkin.isCheckedIn(rec);
    const num = (v: string) => Number(v) || 0;

    // ---- the form ----
    const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
    const rowsOf = (g: 'gents' | 'ladies') => (g === 'gents' ? gents : ladies);
    const setRowsOf = (g: 'gents' | 'ladies') => (g === 'gents' ? setGents : setLadies);
    const patchRow = (g: 'gents' | 'ladies', uid: number, p: Partial<RoomRow>) => setRowsOf(g)(rs => rs.map(r => (r.uid === uid ? { ...r, ...p } : r)));
    // capacity set programmatically or typed: Assigned mirrors it until the user edits Assigned
    const setCap = (g: 'gents' | 'ladies', uid: number, v: string) => setRowsOf(g)(rs => rs.map(r => (r.uid === uid ? { ...r, capacity: v, ...(r.dirty ? {} : { assigned: v }) } : r)));
    const exclCapacity = (r: RoomRow) => {   // an Exclusive row blocks the room's whole capacity, so the bed count must be known: take it from Rooms & Buildings
        const room = cleanRoom(r.room_no), b = (r.building || '').trim() || (form.building || '').trim();
        if (!room || !b) return null;
        const cap = R.builderCapacity(bldRef.current, b, room);
        return cap != null && cap > 0 ? String(cap) : null;
    };
    const names = useMemo(() => [...(R.buildingNames(buildings, siteId) as string[])], [buildings]);   // eslint-disable-line react-hooks/exhaustive-deps
    const buildingOpts = form.building && !names.some(n => n === form.building) ? [...names, form.building] : names;

    function load(data: Row) {
        loadedRooms.current = new Set(['gents', 'ladies'].flatMap(side => (data.rooms?.[side] || []).map((x: Row) => roomKey(side, x.room_no, x.building || data.building))));
        const f = formFrom(data);
        setForm(f.form); setDelay(f.delay); setGents(f.gents.length ? f.gents : [newRow()]); setLadies(f.ladies.length ? f.ladies : [newRow()]); setConflicts(new Set()); setOkFill(new Set());
    }
    function clearForm() {
        setCurrentId(null); setUnlocked(false); loadedRooms.current = new Set();
        setForm({ ...emptyForm(), building: prefs.slipDefaultBuilding || '', checkin_time: prefs.slipCheckinTime || '', checkout_time: prefs.slipCheckoutTime || '' });
        setDelay(emptyDelay()); setGents([newRow()]); setLadies([newRow()]); setConflicts(new Set()); setOkFill(new Set()); setStays([]);
    }
    const data = () => formData(form, gents, ladies, delay);

    // ---- delayed departure ----
    const fillOuts = (date: string, time: string, status: string, onlyBlank: boolean) => {
        const f = (rs: RoomRow[]) => rs.map(r => (onlyBlank && r.out_date ? r : { ...r, ...(date ? { out_date: date } : {}), ...(time ? { out_time: time } : {}), ...(status ? { out_status: status } : {}) }));
        setGents(f); setLadies(f);
    };
    async function toggleDelay(on: boolean) {
        if (on) {
            setDelay(d => ({ ...d, on: true, orig: d.orig || { date: form.checkout_date, time: form.checkout_time }, status: d.status || 'tentative' }));
            fillOuts(form.checkout_date, form.checkout_time, 'tentative', true);
        } else if (await confirmAsk({ title: 'Remove the delayed departure?', body: 'Every room goes back to one check-out for the whole slip (the check-out above).', confirmLabel: 'Remove' })) setDelay(d => ({ ...d, on: false }));
    }
    function applyAll() {
        let { date, time } = allAll;
        if (allAll.status === 'unknown' && !date) ({ date, time } = holdUntil(shCfg.hold, form.checkout_time));
        if (!date) { setStatus('Choose the date for all rows (or status "unknown" to hold them).'); return; }
        fillOuts(date, time || form.checkout_time, allAll.status, false);
    }
    async function splitRow(g: 'gents' | 'ladies', r: RoomRow) {
        // ✂ split: n of this row's beds leave at another time — the row becomes two rows of the same room
        const beds = Number(r.assigned) || Number(r.capacity) || 0;
        if (beds < 2) { setStatus('A row needs at least 2 beds to split.'); return; }
        const n = Number(await promptAsk({ title: `Room ${r.room_no}: ${beds} beds`, body: 'How many of them leave at a DIFFERENT time (they get a new row)?', value: '1', type: 'number' }));
        if (!Number.isInteger(n) || n < 1 || n >= beds) return;
        const copy = newRow({ room_no: r.room_no, capacity: r.capacity, assigned: n, ...(r.exclusive ? { exclusive: true, building: r.building || '' } : {}), out: { date: r.out_date, time: r.out_time }, out_status: r.out_status });
        setRowsOf(g)(rs => { const i = rs.findIndex(x => x.uid === r.uid); const next = rs.map(x => (x.uid === r.uid ? { ...x, assigned: String(beds - n), dirty: true } : x)); next.splice(i + 1, 0, copy); return next; });
    }

    // ---- capacities ----
    async function fetchCapacities(g0: RoomRow[] = gents, l0: RoomRow[] = ladies): Promise<{ gents: RoomRow[]; ladies: RoomRow[] } | null> {
        const all = await refreshCache();
        const b = (form.building || '').trim();
        if (!b) { setStatus('Select a building first.'); return null; }
        const capMaps = new Map([[b, buildCapacityMap(all, b)]]);
        const fresh = await guard<Row[]>(R.loadBuildings({ force: true })); setBuildings(fresh); bldRef.current = fresh;   // rooms edited on another desk count too
        let filled = 0, unknown = 0; const ok = new Set<number>();
        const fill = (rs: RoomRow[]) => rs.map(r => {
            const room = cleanRoom(r.room_no); if (!room) return r;
            const rb = (r.building || '').trim() || b;   // an Exclusive room's own building
            if (!capMaps.has(rb)) capMaps.set(rb, buildCapacityMap(all, rb));
            const fromBuilder = R.builderCapacity(fresh, rb, room), hist = capMaps.get(rb)!.get(`${rb}|${room}`);
            if (fromBuilder != null || hist != null) { filled++; ok.add(r.uid); const cap = String(fromBuilder != null ? fromBuilder : hist); return { ...r, capacity: cap, ...(r.dirty ? {} : { assigned: cap }) }; }
            unknown++; return { ...r, capacity: '' };
        });
        const out = { gents: fill(g0), ladies: fill(l0) };
        setGents(out.gents); setLadies(out.ladies); setOkFill(ok);
        setStatus(`Capacity fetch: filled ${filled} item(s); ${unknown} unassigned.`);
        return out;
    }
    async function bulkLoad() {
        // replace the rows with the typed room lists, fetch their capacities, show the bold beds count
        const pg = bulkParse(bulk.g), pl = bulkParse(bulk.l);
        const g = pg.length ? pg.map(r => newRow({ room_no: r, capacity: '' })) : [newRow()], l = pl.length ? pl.map(r => newRow({ room_no: r, capacity: '' })) : [newRow()];
        setGents(g); setLadies(l);
        const out = await fetchCapacities(g, l);
        const n = out ? sumAssigned(out.gents) + sumAssigned(out.ladies) : 0;
        setBulkBeds(n); if (out) setStatus(`Bulk loaded; beds assigned = ${n}.`);
    }
    const sumAssigned = (rs: RoomRow[]) => rs.reduce((n, r) => { const x = Number(r.capacity); return n + (Number.isFinite(x) ? x : 0); }, 0);

    // ---- availability / save ----
    const report = (r: Availability, extra: Row) => mods!.modal.showSlipReport({ ok: r.okRooms, issues: r.issues, building: r.building, start: r.start, end: r.end, ...extra }, (p: Row) => href('timeline', p));
    async function runCheck(): Promise<Availability> {
        // the latest slips from every desk first — a check-out corrected on another desk a minute ago must count (offline: this browser's copy)
        let synced = true;
        try { await (cloud as any).sync({ force: true }); } catch (e) { synced = false; if (!(e instanceof cloud.UserError)) console.warn('sync before check', e); }
        const all = await refreshCache();
        const copy = { synced, last_sync: (cloud as any).state.lastSync ? new Date((cloud as any).state.lastSync).toISOString() : null, slips: all.length, online: navigator.onLine };
        const r = checkAvailability(form, gents, ladies, { db: all, buildings: bldRef.current, currentId: idRef.current, loadedRooms: loadedRooms.current, stay, rooms, delayOn: delay.on, copy });
        setConflicts(r.blocked);
        setStatus(r.pass ? 'Availability OK.' : `${r.issues.length} room problem${r.issues.length === 1 ? '' : 's'} — see the window.`);
        return r;
    }
    // a refused Save / Edit goes to the Performance page with every condition that was checked
    function logDenial(action: string, r: Availability | null, server?: Row) {
        try {
            mods!.tele.recordSlipDenial({
                site: siteId, action, sh_no: form.sh_no.trim(), slip_id: idRef.current || null, building: (form.building || '').trim(),
                form: { checkin: `${form.checkin_date} ${form.checkin_time}`, checkout: `${form.checkout_date} ${form.checkout_time}`, gents: form.gents, ladies: form.ladies, children: form.children, infants: form.infants, total: form.total, delayed: delay.on },
                stay: r ? { start: iso(r.start), end: iso(r.end) } : null, rows: (r?.own || []).map(win),
                issues: r ? r.issues.map(x => ({ ...x, at: iso(x.at), who: x.who?.map(win), others: x.others?.map(win) })) : [{ kind: 'server', ...server }],
                ok_rooms: r?.okRooms || [], copy: r?.copy || null,
            });
        } catch (e) { console.warn('could not record the refused save', e); }
    }
    const notSaved = (r: Availability, what: string, action: string) => {
        logDenial(action, r);
        report(r, { tone: 'bad', title: `Not ${what} — ${r.issues.length} problem${r.issues.length === 1 ? '' : 's'} to fix`, lead: 'Nothing was saved. Fix the points in bold, then press the button again.' });
    };
    function saveError(err: any, what: string) {
        logDenial(what === 'Save' ? (idRef.current ? 'copy' : 'save') : 'update', null, { status: err?.status ?? null, message: String(err?.message || err).slice(0, 300) });
        const msg = err instanceof cloud.UserError ? err.message : `${what} failed: ${err?.message || err}`;
        const help = err?.status === 409 ? ['Another desk changed this slip a moment ago. Load it again (type its SH No. and fetch), check the changes, then save again.']
            : /offline|connection/i.test(msg) ? ['The PMS cannot reach the server. Check the internet connection, then save again — nothing was saved yet.']
                : err?.status === 403 ? ["This login may not change this site's slips. Ask an admin, or log in with a desk login of this site."]
                    : ['Try again in a moment. If it keeps failing, note the SH No. and tell the admin.'];
        mods!.modal.showSlipReport({ tone: 'bad', title: `${what} failed`, issues: [{ kind: 'text', text: msg, help }] }, (p: Row) => href('timeline', p));
    }
    const leadOf = (r: Availability, d: Row) => `${d.building || ''}${r.okRooms.length ? ` · ${r.okRooms.length} room${r.okRooms.length === 1 ? '' : 's'}` : ' · no rooms yet'} · ${fmt(new Date(r.start))} → ${fmt(new Date(r.end))}`;
    async function save() {
        setBusy(true);
        try {
            if (idRef.current && cacheRef.current.find(r => r.id === idRef.current)?.ums && !(await confirmAsk({ title: 'This slip comes from the UMS import', confirmLabel: 'Create a copy anyway',
                body: 'Use "Edit" to update it (rooms, building, times).\n"Save" creates a separate copy that will double-count.\n\nCreate a separate copy anyway?' }))) return;
            const d = data();
            const r = await runCheck();   // guard before saving
            if (!r.pass) { notSaved(r, 'saved', idRef.current ? 'copy' : 'save'); return; }
            const id = await db.add(d);
            setCurrentId(id); setUnlocked(false);
            setStatus(`Saved as #${id}`); await refreshCache();
            report(r, { tone: 'ok', title: `Saved ✓ — SH ${d.sh_no || '—'} (#${id})`, lead: leadOf(r, d) });
        } catch (err: any) { setStatus(err instanceof cloud.UserError ? err.message : 'Save failed.'); console.error('Save error:', err); saveError(err, 'Save'); }
        finally { setBusy(false); }
    }
    async function edit() {
        setBusy(true);
        try {
            if (!idRef.current) { mods!.modal.showSlipReport({ tone: 'warn', title: 'No slip loaded', issues: [{ kind: 'text', text: 'Edit changes a slip that is already saved.', help: ['Type its SH No. and fetch it (or open it from a list) first, then press Edit.', 'For a brand-new slip use Save instead.'] }] }, (p: Row) => href('timeline', p)); return; }
            const d: Row = data();
            const r = await runCheck();   // validate before edit too
            if (!r.pass) { notSaved(r, 'updated', 'update'); return; }
            delete d.createdAt;   // keep original
            const id = await db.update(idRef.current, d);
            setStatus(`Updated #${id}`); history.current?.load(idRef.current); await refreshCache();
            report(r, { tone: 'ok', title: `Updated ✓ — SH ${d.sh_no || '—'} (#${id})`, lead: leadOf(r, d) });
        } catch (err: any) { setStatus(err instanceof cloud.UserError ? err.message : 'Edit failed.'); console.error('Edit error:', err); saveError(err, 'Update'); }
        finally { setBusy(false); }
    }
    async function checkOnly() {
        const r = await runCheck();
        if (r.pass) report(r, { tone: 'ok', title: 'Availability OK ✓', lead: r.okRooms.length ? 'Every room has room for this group for the whole stay.' : 'No rooms entered yet.' });
        else report(r, { tone: 'bad', title: `${r.issues.length} problem${r.issues.length === 1 ? '' : 's'} to fix`, lead: 'Fix the points in bold before saving.' });
    }

    // ---- loading a slip by SH ----
    // A group can check in twice at this site (e.g. Makkah before and after Madina). The UMS import numbers the second check-in S44030; typing either loads that stay.
    async function pickStayFor(sh: string): Promise<Row | null> {
        const wanted = String(sh).trim().toUpperCase();
        const all = (await db.all()) as Row[];
        const list = all.filter(r => r.ums && (ums as any).baseSh(r.sh_no) === (ums as any).baseSh(wanted)).sort((a, b) => `${a.checkin_date}T${a.checkin_time}`.localeCompare(`${b.checkin_date}T${b.checkin_time}`));
        setStays(list.length >= 2 ? list : []);
        if (!list.length) return (await db.latestBySh(shValue(wanted))) || null;
        const today = new Date().toISOString().slice(0, 10);
        return list.find(r => String(r.sh_no).toUpperCase() === wanted) || list.find(r => (r.checkout_date || '') >= today) || list[list.length - 1];
    }
    async function fetchBySh(raw0?: string) {
        const raw = (raw0 ?? form.sh_no).trim();
        if (!shCfg.re.test(raw)) { setStatus(`Enter a valid SH No.: digits (e.g. 44030)${shCfg.prefixes.length ? `, optionally after ${shCfg.prefixes.join(', ')} (e.g. ${shCfg.prefixes[0]}44030)` : ''}.`); return; }
        const r = await pickStayFor(raw);
        if (!r) { setStatus('No slip found for that SH.'); return; }
        setCurrentId(r.id); setUnlocked(false); load(r); setStatus(`Loaded latest slip for SH ${r.sh_no} (#${r.id})`);
    }
    async function onShBlur() {
        if (!prefs.slipAutoLoadSh) return;
        // a default building alone does not count as "already filled in"
        if (form.tour_name || form.group_leader || (form.building && form.building !== prefs.slipDefaultBuilding)) return;
        const raw = form.sh_no.trim();
        if (shCfg.re.test(raw)) { const r = await pickStayFor(raw); if (r) { setCurrentId(r.id); setUnlocked(false); load(r); setStatus(`Auto-loaded latest slip for SH ${r.sh_no} (#${r.id})`); } }
    }

    async function pickRooms() {
        const building = (form.building || '').trim();
        const ci = parseDT(form.checkin_date, form.checkin_time), co = parseDT(form.checkout_date, form.checkout_time);
        if (!building) { setStatus('Choose the building first.'); return; }
        if (!ci || !co || co <= ci) { setStatus('Enter check-in and check-out (check-out after check-in) first.'); return; }
        // latest assignments from every desk, so no bed is handed out twice (offline: the local copy)
        try { await guard((cloud as any).sync({ force: true })); } catch (e) { if (!(e instanceof cloud.UserError)) throw e; }
        const all = await refreshCache();
        const fresh = await guard<Row[]>(R.loadBuildings({ force: true })); setBuildings(fresh); bldRef.current = fresh;
        const hist = buildCapacityMap(all, building);
        // the picker works on this slip's building; Exclusive rows kept in another building are left as they are
        const cur = { gents: collectRows(gents, delay.on, form), ladies: collectRows(ladies, delay.on, form) };
        const here = (r: Row) => !r.building || (stay as any).normB(r.building) === (stay as any).normB(building);
        mods!.picker.openRoomPicker({
            builderHref: href('builder'), building, host: rootRef.current, onlyFree: prefs.pickerOnlyFree,
            checkin: { date: form.checkin_date, time: form.checkin_time }, checkout: { date: form.checkout_date, time: form.checkout_time },
            slips: all, buildings: fresh, excludeId: idRef.current, historyCap: (room: string) => hist.get(`${building}|${cleanRoom(room)}`) ?? null,
            current: { gents: cur.gents.filter(here), ladies: cur.ladies.filter(here) },
            needs: { gents: form.gents, ladies: form.ladies, children: form.children, infants: form.infants },
            onApply: (g: Row[], l: Row[]) => {
                const to = (a: Row[]) => (a.length ? a.map(r => newRow(r)) : [newRow()]);
                setGents(to([...g, ...cur.gents.filter(r => !here(r))])); setLadies(to([...l, ...cur.ladies.filter(r => !here(r))]));
            },
        });
    }
    async function toggleCheckIn() {
        if (!rec) return;
        setBusy(true);
        try {
            await checkin.setCheckedIn(db, rec, !checkedIn);
            const all = await refreshCache(); const fresh = all.find(r => r.id === currentId);
            if (fresh) load(fresh);
            history.current?.load(currentId);
            setStatus(checkin.isCheckedIn(fresh) ? `SH ${rec.sh_no} checked in.` : `SH ${rec.sh_no} check-in undone.`);
        } catch (e: any) { setStatus(e.message || 'Could not save the check-in.'); } finally { setBusy(false); }
    }

    if (!mods) return <><style>{css}</style><div className="wrap"><p className="muted">Loading…</p></div></>;
    // ---- render ----
    const beds = (rs: RoomRow[]) => collectRows(rs, false, form).reduce((n, r) => n + (r.assigned !== '' ? r.assigned : Number(r.capacity) || 0), 0);
    const glSide = collectRows(gents, false, form).some(r => r.gl) ? 'Gents' : collectRows(ladies, false, form).some(r => r.gl) ? 'Ladies' : '';
    const bg = beds(gents), bl = beds(ladies), wantG = num(form.gents), wantL = num(form.ladies) + num(form.children);
    const part = (label: string, got: number, want: number, note: string) => <span className={want && got === want ? 'ok' : ''}>{label} <b>{got}</b>{want ? ` / ${want}` : ''}{note ? <> <small>{note}</small></> : null} </span>;
    const T = (id: string, k: keyof Form) => (use24
        ? <input id={id} type="text" inputMode="numeric" placeholder="HH:MM" pattern="([01][0-9]|2[0-3]):[0-5][0-9]" maxLength={5} value={form[k]} onChange={set(k)} />
        : <input id={id} type="time" value={form[k]} onChange={set(k)} />);
    const rt = (g: 'gents' | 'ladies') => rowsOf(g).map(r => (
        <tr key={r.uid} className={`${r.exclusive ? 'excl ' : ''}${okFill.has(r.uid) ? 'okfill ' : ''}${conflicts.has(cleanRoom(r.room_no)) && cleanRoom(r.room_no) ? 'conflict' : ''}`} data-gl={r.gl ? '1' : undefined}>
            <td><input type="text" value={r.room_no} onChange={e => patchRow(g, r.uid, { room_no: e.target.value })} />{r.gl && <span className="gl-badge" title="Group leader's room">GL</span>}</td>
            <td><input type="number" min={0} step={1} inputMode="numeric" value={r.capacity} placeholder={r.capacity === '' && r.room_no ? 'unassigned' : ''} onChange={e => setCap(g, r.uid, e.target.value)} /></td>
            <td><input type="number" min={0} step={1} inputMode="numeric" placeholder="assigned" value={r.assigned} onChange={e => patchRow(g, r.uid, { assigned: e.target.value, dirty: true })} /></td>
            <td className="excl-cell">
                <label className="excl-on" title="Keep the whole room for these guests"><input type="checkbox" className="excl-chk" aria-label="Exclusive room" checked={!!r.exclusive}
                    onChange={e => { const on = e.target.checked; patchRow(g, r.uid, { exclusive: on, ...(on ? {} : { building: '' }) }); if (on) { const c = exclCapacity({ ...r, exclusive: true }); if (c) setCap(g, r.uid, c); } }} /> <span>Excl.</span></label>
                {r.exclusive && <select className="excl-bld" aria-label="Building of this exclusive room" value={r.building || ''} onChange={e => { patchRow(g, r.uid, { building: e.target.value }); const c = exclCapacity({ ...r, building: e.target.value }); if (c) setCap(g, r.uid, c); }}>
                    <option value="">Same as the slip</option>{(r.building && !names.some(n => (stay as any).normB(n) === (stay as any).normB(r.building)) ? [...names, r.building] : names).map(n => <option key={n}>{n}</option>)}</select>}
            </td>
            <td className="out-cell">
                <input type="date" className="out-date" aria-label="Leaves on" value={r.out_date} onChange={e => patchRow(g, r.uid, { out_date: e.target.value })} />
                <input type="time" className="out-time" aria-label="Leaves at" value={r.out_time} onChange={e => patchRow(g, r.uid, { out_time: e.target.value })} />
                <select className="out-status" aria-label="Status" value={r.out_status} onChange={e => { const v = e.target.value; patchRow(g, r.uid, { out_status: v, ...(v === 'unknown' ? (() => { const h = holdUntil(shCfg.hold, form.checkout_time); return { out_date: h.date, out_time: h.time }; })() : {}) }); }}><option value="confirmed">confirmed</option><option value="tentative">tentative</option><option value="unknown">unknown</option></select>
                <button type="button" className="row-btn out-split" title="Split this row: some of its beds leave at a different time" onClick={() => void splitRow(g, r)}>✂</button>
            </td>
            <td><button className="row-btn" type="button" title="Delete row" onClick={() => setRowsOf(g)(rs => (rs.length > 1 ? rs.filter(x => x.uid !== r.uid) : [newRow()]))}>X</button></td>
        </tr>));
    const tbl = (g: 'gents' | 'ladies', title: string) => (
        <table className="mini" id={g === 'gents' ? 'tblGents' : 'tblLadies'}><caption>{title}</caption>
            <thead><tr><th style={{ width: '34%' }}>Room No</th><th style={{ width: '16%' }}>Capacity</th><th style={{ width: '16%' }}>Assigned</th>
                <th className="excl-cell" title="Exclusive: the room is kept for these guests alone (a couple or a single who wants privacy) — the whole room is blocked, only the guests assigned are counted as pax">Exclusive</th>
                <th className="out-cell">Leaves <span className="muted">(date · time · status)</span></th><th style={{ width: '10%' }} /></tr></thead>
            <tbody id={`${g}-tbody`}>{rt(g)}</tbody>
            <tfoot><tr><td colSpan={3}><button className="row-btn" type="button" onClick={() => setRowsOf(g)(rs => [...rs, newRow()])}>Add Row</button></td></tr></tfoot></table>);
    const loaded = currentId != null;
    return (
        <>
            <style>{css}</style>
            <div className="wrap" ref={rootRef}>
                <table className="grid kv"><tbody>
                    <tr>
                        <td colSpan={2}><div className="inline">
                            <input placeholder="SH Number" id="sh_no" name="sh_no" type="text" value={form.sh_no} onChange={set('sh_no')} onBlur={() => void onShBlur()} />
                            <button id="btnFetchSh" type="button" title="Fetch latest slip with this SH" onClick={() => void fetchBySh()}>Fetch</button>
                            {stays.length >= 2 && <select id="stayPick" title="This SH has more than one stay here" value={String(currentId ?? '')} onChange={e => { const r = stays.find(x => x.id === Number(e.target.value)); if (r) { setCurrentId(r.id); setUnlocked(false); load(r); setStatus(`Loaded stay #${r.id} for SH ${r.sh_no}`); } }}>
                                {stays.map(r => <option key={r.id} value={r.id}>{r.sh_no} · {(r.checkin_date || '').split('-').reverse().join('/')} → {(r.checkout_date || '').split('-').reverse().join('/')}{r.building ? ' · ' + r.building : ''}</option>)}</select>}
                        </div></td>
                        <td colSpan={4}><input placeholder="Tour Name" id="tour_name" type="text" value={form.tour_name} onChange={set('tour_name')} /></td>
                        <td colSpan={4}><input placeholder="Group Leader Name" id="group_leader" type="text" value={form.group_leader} onChange={set('group_leader')} /></td>
                        <th>G</th><td><input placeholder="Gents" id="gents" type="number" inputMode="numeric" min={0} step={1} value={form.gents} onChange={set('gents')} /></td>
                        <th>L</th><td><input placeholder="Ladies" id="ladies" type="number" inputMode="numeric" min={0} step={1} value={form.ladies} onChange={set('ladies')} /></td>
                        <td colSpan={2}><select id="building" value={form.building} onChange={set('building')}><option value="">Select building…</option>{buildingOpts.map(b => <option key={b}>{b}</option>)}</select></td>
                    </tr>
                    <tr>
                        <th>CHECK IN</th><td><input id="checkin_date" type="date" value={form.checkin_date} onChange={set('checkin_date')} /></td><td colSpan={2}>{T('checkin_time', 'checkin_time')}</td>
                        <th>CHECK OUT</th><td><input id="checkout_date" type="date" value={form.checkout_date} onChange={set('checkout_date')} /></td><td colSpan={2}>{T('checkout_time', 'checkout_time')}</td>
                        <th>T</th><td><input placeholder="Total" id="total" type="number" inputMode="numeric" min={0} step={1} value={form.total} onChange={set('total')} /></td>
                        <th>I</th><td><input placeholder="Infants" id="infants" type="number" inputMode="numeric" min={0} step={1} value={form.infants} onChange={set('infants')} /></td>
                        <th>C</th><td><input placeholder="Children" id="children" type="number" inputMode="numeric" min={0} step={1} value={form.children} onChange={set('children')} /></td>
                    </tr>
                    {prefs.slipFromTo && <tr id="fromToRow">
                        <th>FROM</th><td colSpan={6}><select id="from_place" aria-label="Coming from" value={form.from_place} onChange={set('from_place')}><option value="">—</option>{[...PLACES, ...(form.from_place && !PLACES.includes(form.from_place) ? [form.from_place] : [])].map(p => <option key={p}>{p}</option>)}</select></td>
                        <th>TO</th><td colSpan={6}><select id="to_place" aria-label="Going to" value={form.to_place} onChange={set('to_place')}><option value="">—</option>{[...PLACES, ...(form.to_place && !PLACES.includes(form.to_place) ? [form.to_place] : [])].map(p => <option key={p}>{p}</option>)}</select></td>
                    </tr>}
                    <tr><th>NOTES</th><td colSpan={13}><textarea id="notes" rows={2} maxLength={500} placeholder="Notes for this slip (printed on the slip and the GL copy)" aria-label="Notes" value={form.notes} onChange={set('notes')} /></td></tr>
                </tbody></table>

                <div className={`delay-box${delay.on ? ' on' : ''}`} id="delayBox">
                    <label className="delay-on"><input type="checkbox" id="delayOn" checked={delay.on} onChange={e => void toggleDelay(e.target.checked)} /> <b>Delayed departure</b></label>{' '}
                    <span className="muted" id="delayInfo">{delay.on ? `Booked check-out ${delay.orig ? `${delay.orig.date} ${delay.orig.time}` : '—'} · set each room's own check-out below (✂ splits a room's beds). Unknown holds the beds ${shCfg.hold} days.` : 'Tick when the group cannot leave on its booked date — each room row then gets its own check-out.'}</span>
                    {delay.on && <div className="delay-ctl" id="delayCtl">
                        <label>Status <select id="delayStatus" value={delay.status} onChange={e => setDelay(d => ({ ...d, status: e.target.value }))}><option value="tentative">Tentative (ticket not confirmed)</option><option value="unknown">Unknown date (held)</option><option value="confirmed">Confirmed new date</option></select></label>
                        <label className="delay-note">Note <input id="delayNote" maxLength={300} placeholder="e.g. waiting for Saudia tickets, call GL on…" value={delay.note} onChange={e => setDelay(d => ({ ...d, note: e.target.value }))} /></label>
                        <span className="delay-all">All rows:
                            <input type="date" id="delayAllDate" aria-label="Check-out date for all rows" value={allAll.date} onChange={e => setAllAll(a => ({ ...a, date: e.target.value }))} />
                            <input type="time" id="delayAllTime" aria-label="Check-out time for all rows" value={allAll.time} onChange={e => setAllAll(a => ({ ...a, time: e.target.value }))} />
                            <select id="delayAllStatus" aria-label="Status for all rows" value={allAll.status} onChange={e => setAllAll(a => ({ ...a, status: e.target.value }))}><option value="tentative">tentative</option><option value="unknown">unknown</option><option value="confirmed">confirmed</option></select>
                            <button type="button" id="delayApplyAll" className="row-btn" onClick={applyAll}>Apply</button></span></div>}
                </div>

                <div className="bulk-row">
                    <input id="gentsBulk" type="text" placeholder="Gents Rooms: 501-502-503" value={bulk.g} onChange={e => setBulk(b => ({ ...b, g: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); void bulkLoad(); } }} />
                    <input id="ladiesBulk" type="text" placeholder="Ladies Rooms: 401-402-403" value={bulk.l} onChange={e => setBulk(b => ({ ...b, l: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); void bulkLoad(); } }} />
                    <button id="btnBulkLoad" type="button" onClick={() => void bulkLoad()}>Load</button>
                    <button id="btnPickRooms" className="btn-hot" type="button" title="See free beds for the whole stay and pick rooms" onClick={() => void pickRooms()}>Pick rooms…</button>
                    <span id="allocSum" className="alloc-sum" aria-live="polite">{(bg || bl || wantG || wantL) ? <>Assigned: {part('Gents', bg, wantG, glSide === 'Gents' ? 'incl. GL' : '')}{part('Ladies', bl, wantL, [num(form.children) ? `${num(form.ladies)} + ${num(form.children)} children` : '', glSide === 'Ladies' ? 'incl. GL' : ''].filter(Boolean).join(' · '))}</> : null}</span>
                    <span id="bulkReport" className="muted" style={bulkBeds != null ? { fontWeight: 700, fontSize: 22, color: '#654321' } : undefined}>{bulkBeds != null ? <>Beds assigned: <span style={{ fontWeight: 800, fontSize: 26 }}>{bulkBeds}</span></> : ''}</span>
                </div>

                <div className={`subtables${delay.on ? ' delayed' : ''}`} style={{ marginTop: 16 }}>{tbl('gents', 'GENTS — Rooms')}{tbl('ladies', 'LADIES — Rooms')}</div>

                <div className="toolbar no-print"><button id="btnFetchCap" onClick={() => void fetchCapacities()}>Fetch &amp; Assign</button><button id="btnCheckAvail" onClick={() => void checkOnly()}>Check room availability</button></div>
                <div className="help no-print">Use <b>Fetch capacity data</b> after you enter room numbers. Unknown rooms show capacity placeholder <b>“unassigned.”</b><br />Use <b>Check room availability</b> to catch conflicts before saving.</div>

                {held && <div id="umsHeld" className="ums-held no-print" role="alert">UMS wants {ums.wantedText(rec, held)}, but that would overfill a room: {ums.heldText(held)}. The dates were not changed. Move a group to another room (Pick rooms) — the next UMS import applies the new dates by itself.</div>}
                <div className="controls no-print">
                    <button id="btnNew" onClick={() => { clearForm(); setStatus('New blank slip'); }}>New Slip</button>
                    <button id="btnSave" title={loaded && !unlocked ? 'This slip is already saved — use Edit to change it (New Slip to start another)' : 'Save as a new slip'} className={unlocked ? 'btn-warn' : ''} disabled={(loaded && !unlocked) || !!db.readonly || busy} onClick={() => void save()}>Save</button>
                    <button id="btnEdit" className={loaded ? 'btn-hot' : ''} disabled={!loaded || !!db.readonly || busy} onClick={() => void edit()}>Edit</button>
                    {rec && !db.readonly && <button id="btnCheckIn" type="button" title="Tell the other desks this group has checked in" disabled={busy} onClick={() => void toggleCheckIn()}>{checkedIn ? 'Undo check-in' : 'Check in'}</button>}
                    {checkedIn && <span className="ci-chip ci-arrived" id="ciChip">✓ Checked in</span>}
                    {loaded && !unlocked && !db.readonly && <button id="btnUnlockSave" type="button" className="linkish" title="Only if you really want a second, separate slip"
                        onClick={async () => { if (await confirmAsk({ title: 'Unlock Save for a copy?', body: 'Save creates a SECOND, separate slip (the loaded one stays). Rooms and pax would count twice.', confirmLabel: 'Unlock Save' })) setUnlocked(true); }}>Save a copy instead…</button>}
                    <span className="muted" id="status">{status}</span>
                </div>
                <section ref={histRef} id="slipHistory" className="slip-history no-print" hidden />
            </div>
            {confirmDialog}{promptDialog}
        </>
    );
}
