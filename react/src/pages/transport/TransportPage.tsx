import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useConfirm } from '@/components/ConfirmDialog';
import { usePrompt } from '@/components/PromptDialog';
import { useCore, useDb, useGuard, useLoadApp, useLoadCore, useNav, useParams, useSite } from '@/pms/PmsContext';
import { DayNav, cleanText } from './DayNav';

// Transport day: the saved trips of one day (cloud, GET /api/transport), bus numbers per destination (type one in — kept by later imports), times (tap to
// change, with a confirmation), vehicles, names, pax, groups riding with a bus, and the signage window. Day in the address: #/<site>/transport?day=YYYY-MM-DD.
// The "Plan from check-outs" window and the Ziyarat split are the framework-free dialogs of the old page (views/transport/plan.js, core/ziyarat.js).

type Row = Record<string, any>;
const NAME_LABEL: Record<string, string> = { operator: 'Tour operator', leader: 'Group leader' };
const SG_DEFAULT = { from: 'now', to_day: 1, to_time: '23:59' };
const manualCls = 'border-gold bg-accent';

export default function TransportPage() {
    const { cloud, transport: T0, rooms, ums } = useCore();
    const T = T0 as any;
    const db = useDb();
    const guard = useGuard();
    const params = useParams();
    const loadCore = useLoadCore();
    const loadApp = useLoadApp();
    const { siteId } = useSite();
    const { href, navigate } = useNav();
    const { ask: confirmAsk, dialog: confirmDialog } = useConfirm();
    const { ask: promptAsk, dialog: promptDialog } = usePrompt();

    const day = /^\d{4}-\d{2}-\d{2}$/.test(params.get('day') || '') ? (params.get('day') as string) : (T.today() as string);
    const writable = cloud.canWrite(siteId);
    const desk = cloud.currentDesk();
    const [doc, setDoc] = useState<{ rows: Row[]; version: number; updated_at?: string; updated_by?: string }>({ rows: [], version: 0 });
    const [days, setDays] = useState<{ day: string; n: number }[]>([]);
    const [filter, setFilter] = useState<'sign' | 'all'>('sign');
    const [find, setFind] = useState('');
    const [msg, setMsgState] = useState<{ text: string; kind: 'ok' | 'bad' } | null>(null);
    const [saving, setSaving] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [buildings, setBuildings] = useState<string[]>([]);
    const [editTime, setEditTime] = useState<string | null>(null);
    const [addBus, setAddBus] = useState<string | null>(null);
    const [dupeOpen, setDupeOpen] = useState(false);
    const [libs, setLibs] = useState<{ ziyarat: any; signage: any } | null>(null);
    const savingRef = useRef(false);
    const docRef = useRef(doc);
    docRef.current = doc;
    const setMsg = (text: string, kind: 'ok' | 'bad' = 'ok') => setMsgState(text ? { text, kind } : null);

    const rows = doc.rows;
    const info = useMemo(() => T.resolve(rows) as Map<string, Row>, [rows]);   // eslint-disable-line react-hooks/exhaustive-deps
    const sign = useMemo(() => T.signage(rows, siteId) as Row[], [rows, siteId]);   // eslint-disable-line react-hooks/exhaustive-deps
    const fleet = (list: Row[]) => T.fleetText(list, '0 buses') as string;
    const past = useMemo(() => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); }, [rows]);
    const q = find.trim().toLowerCase();
    const matches = (r: Row) => !q || [r.ref, r.operator, r.leader, r.transporter, r.vch, r.dora, r.route, r.remarks, ...(r.rooms || [])].some(v => String(v ?? '').toLowerCase().includes(q));

    const load = useCallback(async (quiet = false) => {
        try {
            const [d, ds] = await guard<any>(Promise.all([T.loadDay(siteId, day), T.listDays(siteId)]));
            setDoc(prev => (d.version !== prev.version ? d : prev)); setDays(ds);
        } catch (e: any) {
            if (!quiet) setMsg(e instanceof cloud.UserError ? e.message : 'Could not load the transport list.', 'bad');
        } finally { setLoaded(true); }
    }, [siteId, day]);   // eslint-disable-line react-hooks/exhaustive-deps

    const [window_, setWindow_] = useState<{ from: string; to_day: number; to_time: string }>(SG_DEFAULT);
    const [sgVersion, setSgVersion] = useState(0);
    const [sgMsg, setSgMsg] = useState('');
    const [sgBusy, setSgBusy] = useState(false);
    async function loadWindow(sg = libs?.signage) {
        if (!sg) return;
        try { const { config } = await guard<any>(sg.loadSignage(siteId)); setSgVersion(config.version); setWindow_({ ...SG_DEFAULT, ...(config.window || {}) }); }
        catch { setWindow_(SG_DEFAULT); }
        if (!writable) setSgMsg('This login cannot change it.');
    }

    useEffect(() => {
        void (async () => {
            const [ziyarat, signage] = await Promise.all([loadCore('ziyarat'), loadCore('signage-api')]);
            setLibs({ ziyarat, signage });
            try { setBuildings(rooms.buildingNames(await guard(rooms.loadBuildings()), siteId)); } catch { setBuildings(rooms.buildingNames([], siteId)); }
            await load();
            await loadWindow(signage);
        })();
        // other desks' imports: check every 30 s (not while a field is being typed)
        const t = setInterval(() => {
            const a = document.activeElement as HTMLElement | null;
            if (savingRef.current || document.visibilityState !== 'visible' || (a && a.matches('input[data-key], input.tp-time-in, select[data-from]'))) return;
            void load(true);
        }, 30e3);
        return () => clearInterval(t);
    }, []);   // eslint-disable-line react-hooks/exhaustive-deps

    async function save(next: Row[], note: string) {
        savingRef.current = true; setSaving(true);
        try { const d = await guard<any>(T.saveDay(siteId, day, next, docRef.current.version, note)); setDoc(d); setMsg('Saved.'); }
        catch (e: any) { setMsg(e instanceof cloud.UserError ? e.message : 'Could not save.', 'bad'); if (e.status === 409) await load(); }
        finally { savingRef.current = false; setSaving(false); }
    }

    // the building a bus departs from comes from the group's slip; only a building the desk picked (or cleared) by hand is left alone
    const filled = useRef('');
    useEffect(() => {
        if (!loaded || !writable || saving || !rows.length) return;
        const sig = `${day}:${doc.version}`;
        if (filled.current === sig) return;
        filled.current = sig;
        void (async () => {
            let all: Row[];
            try { all = await guard(db.all()); } catch { return; }
            const live = all.filter(s => !s.deleted && s.building);
            const slipOf = (ref: string) => {
                const same = live.filter(s => String(s.sh_no).toUpperCase() === ref || ums.baseSh(s.sh_no) === ums.baseSh(ref));
                return same.find(s => s.checkout_date === day || s.checkin_date === day) || same.sort((x, y) => String(y.checkin_date).localeCompare(String(x.checkin_date)))[0];
            };
            let n = 0;
            const next = docRef.current.rows.map(r => {
                if (r.building || r.building_set || info.get(r.key)?.parent || !r.ref) return r;
                const s = slipOf(String(r.ref).toUpperCase());
                if (!s) return r;
                n++; return { ...r, building: String(s.building).trim() };
            });
            if (n) await save(next, `buildings filled from the slips (${n})`);
        })();
    }, [loaded, writable, saving, day, doc.version]);   // eslint-disable-line react-hooks/exhaustive-deps

    // ---- the day's check: an SH listed more than once ----
    const dupes = useMemo(() => {
        const by = new Map<string, Row[]>();
        for (const r of rows) { const k = String(r.ref || '').trim().toUpperCase(); if (!k || k === '0') continue; (by.get(k) ?? by.set(k, []).get(k)!).push(r); }
        return [...by].filter(([, rs]) => rs.length > 1).map(([ref, rs]) => ({ ref, rows: rs }));
    }, [rows]);
    const dupeLines = (d: { rows: Row[] }) => d.rows.map(r => { const i = info.get(r.key); const to = i?.route || r.route || 'no route'; return `${T.time12(r.at)} · ${to}${i?.bus != null && !i.parent ? ' · bus ' + i.bus : i?.parent ? ' · grouped' : ''}`; });
    const dupeSig = dupes.map(x => `${x.ref}:${x.rows.length}`).join(',');
    const warned = useRef('');
    useEffect(() => { if (!dupeSig) { warned.current = ''; return; } if (dupeSig !== warned.current) { warned.current = dupeSig; setDupeOpen(true); } }, [dupeSig]);
    const dupeTitle = dupes.length === 1 ? `SH ${dupes[0]?.ref} is` : `${dupes.length} SHs are`;

    // ---- edits ----
    function setBus(key: string, value: string) {
        const n = parseInt(value, 10);
        if (!(n > 0)) return;
        if (rows.find(r => r.key === key)?.bus === n) return;
        void save(rows.map(r => (r.key === key ? { ...r, bus: n, bus_manual: true } : r)), `bus ${n} for SH ${key}`);
    }
    function setFrom(key: string, building: string) {
        void save(rows.map(r => (r.key === key ? (building ? { ...r, building, building_set: true } : { ...(({ building: _b, ...x }) => x)(r), building_set: true }) : r)), `SH ${key} departs from ${building || '(none)'}`);
    }
    async function setVehicle(row: Row, value: string) {
        let to = value, label = '';
        if (to === 'custom') {
            label = cleanText(await promptAsk({ title: 'Name of the vehicle', body: 'Shown on the bus sheet and the signage, e.g. Self- Bus', value: row.vehicle_label || 'Self- Bus' })).slice(0, 30);
            if (!label) return;
            to = 'other';
        } else if (to.startsWith('other:')) { label = to.slice(6); to = 'other'; }
        if (to === T.vehicleOf(row) && (to !== 'other' || label === row.vehicle_label)) return;
        const patch = (r: Row) => { const { vehicle: _v, vehicle_label: _l, ...x } = r; return { ...x, ...(to === 'bus' ? {} : { vehicle: to }), ...(to === 'other' ? { vehicle_label: label } : {}), bus_manual: false }; };
        const next: Row[] = T.assignBuses(rows.map(r => (r.key === row.key ? patch(r) : { ...r })), rows);
        // the cars (or this custom name) of this destination always run 1, 2, 3… in time order
        const inf = T.resolve(next) as Map<string, Row>, dest = inf.get(row.key)?.dest;
        if (to !== 'bus' && !T.isTrain(to, label)) next.filter(r => T.vehicleOf(r) === to && (to !== 'other' || String(r.vehicle_label).toUpperCase() === label.toUpperCase()) && !inf.get(r.key)!.parent && inf.get(r.key)!.dest === dest)
            .sort((a, b) => a.at.localeCompare(b.at)).forEach((r, i) => { r.bus = i + 1; r.bus_manual = false; });
        await save(next, `SH ${row.key} → ${to === 'other' ? label : to} ${next.find(r => r.key === row.key)?.bus ?? ''}`);
    }
    async function commitTime(row: Row, hm: string) {
        setEditTime(null);
        if (!/^\d{2}:\d{2}$/.test(hm) || hm === row.at.slice(11, 16)) return;
        const at = `${row.at.slice(0, 10)}T${hm}`;
        const riders = info.get(row.key)?.parent ? [] : rows.filter(r => info.get(r.key)?.parent === row && r.at === row.at);
        const ok = await confirmAsk({
            title: 'Change the time?', confirmLabel: 'Change time',
            body: [`SH ${row.ref}${row.leader ? ` (${row.leader})` : ''}`, `from ${T.time12(row.at)} to ${T.time12(at)}`,
                ...(riders.length ? ['', `${riders.length} grouped trip${riders.length === 1 ? '' : 's'} on the same ${T.vehicleOf(row)} move${riders.length === 1 ? 's' : ''} with it.`] : []),
                '', 'The signage and the bus sheet will show the new time.'].join('\n'),
        });
        if (!ok) return;
        const move = new Set([row.key, ...riders.map(r => r.key)]);
        const next = rows.map(r => {
            if (!move.has(r.key)) return r;
            const listAt = r.at_manual ? r.at_import : r.at;   // the transport list's own time
            return at === listAt ? (({ at_manual: _m, at_import: _i, ...x }) => ({ ...x, at }))(r) : { ...r, at, at_manual: true, at_import: listAt };
        }).sort((a, b) => a.at.localeCompare(b.at));
        await save(next, `time of SH ${row.ref}: ${row.at.slice(11, 16)} → ${hm}${riders.length ? ` (+${riders.length} grouped)` : ''}`);
    }
    async function editName(row: Row, field: string) {
        const v = await promptAsk({ title: `${NAME_LABEL[field]} for ${row.ref ? `SH ${row.ref}` : 'this trip'} (${T.time12(row.at)})`, value: row[field] || '' });
        if (v === null) return;
        const val = cleanText(v).slice(0, 80);
        if (val === (row[field] || '')) return;
        await save(rows.map(r => (r.key !== row.key ? r : { ...r, [field]: val, names_manual: [...new Set([...(r.names_manual || []), field])] })), `${NAME_LABEL[field].toLowerCase()} of ${row.ref ? `SH ${row.ref}` : 'a trip'}: ${val || '—'}`);
    }
    async function editTransporter(row: Row) {
        const tr = await promptAsk({ title: `Transporter for SH ${row.ref} (${T.time12(row.at)})`, value: row.transporter || '' });
        if (tr === null) return;
        const vch = await promptAsk({ title: `Vch No for SH ${row.ref}`, value: row.vch || '' });
        if (vch === null) return;
        const Tr = cleanText(tr).slice(0, 60), V = cleanText(vch).slice(0, 20);
        if (Tr === (row.transporter || '') && V === (row.vch || '')) return;
        // the list's own Vch No is kept: the groups adjusted into it still ride in this vehicle
        const listVch = row.vch_import ?? row.vch ?? '';
        await save(rows.map(r => (r.key !== row.key ? r : { ...r, transporter: Tr, vch: V, transporter_manual: true, ...(listVch && listVch !== V ? { vch_import: listVch } : {}) })), `SH ${row.ref}: transporter ${Tr || '—'}, Vch ${V || '—'}`);
    }
    async function editPax(row: Row) {
        const ans = await promptAsk({ title: `Pax for ${row.ref ? `SH ${row.ref}` : 'this vehicle'} (${T.time12(row.at)})`, body: 'Type M F C (e.g. 10 12 2), or just the total.', value: [row.m || 0, row.f || 0, row.c || 0].join(' ') });
        if (ans === null) return;
        const nums = String(ans).trim().split(/[\s,/]+/).filter(Boolean).map(x => parseInt(x, 10));
        if (!nums.length || nums.some(x => !Number.isFinite(x) || x < 0 || x > 999)) { setMsg('Type numbers only, e.g. 10 12 2 or 24.', 'bad'); return; }
        const patch = nums.length === 1 ? { pax: nums[0] } : { m: nums[0] || 0, f: nums[1] || 0, c: nums[2] || 0, pax: (nums[0] || 0) + (nums[1] || 0) + (nums[2] || 0) };
        if (patch.pax === Number(row.pax) && (nums.length === 1 || ((patch as any).m === (row.m || 0) && (patch as any).f === (row.f || 0) && (patch as any).c === (row.c || 0)))) return;
        const next = rows.map(r => (r.key === row.key ? { ...r, ...patch, pax_manual: true } : r));
        const main = (T.resolve(next) as Map<string, Row>).get(row.key)?.parent || next.find(r => r.key === row.key);
        if (main && T.limited(main) && T.vehiclePax(next, main.key) > T.BUS_LIMIT && patch.pax > Number(row.pax)) { setMsg(`That would put ${T.vehiclePax(next, main.key)} pax on one bus. A bus carries at most ${T.BUS_LIMIT}: put some of the groups on another bus first.`, 'bad'); return; }
        await save(next, `pax of ${row.ref ? `SH ${row.ref}` : 'a vehicle'}: ${row.pax} → ${patch.pax}`);
    }
    async function deleteTrip(row: Row) {
        const riders = rows.filter(r => info.get(r.key)?.parent === row), heir = riders[0];
        const ok = await confirmAsk({
            title: 'Delete this trip?', confirmLabel: 'Delete',
            body: [`SH ${row.ref}${row.leader ? ` (${row.leader})` : ''} — ${T.time12(row.at)}${info.get(row.key)?.route ? ', ' + info.get(row.key)!.route : ''}`,
                ...(riders.length ? ['', `${riders.length === 1 ? '1 group rides' : riders.length + ' groups ride'} with it (${riders.map(r => r.ref).join(', ')}). ${riders.length === 1 ? 'It stays' : 'They stay'} on this bus — SH ${heir.ref} becomes its first group.`] : []),
                '', `${riders.length ? 'Only this group' : 'It'} disappears from the signage and the bus sheets. A later import of the list would offer it again as “New”.`].join('\n'),
        });
        if (!ok) return;
        let next = rows.filter(r => r.key !== row.key);
        if (heir) {
            // the first rider becomes the bus's own trip: it takes over the route, vehicle, number, building, transporter and Vch No
            const carry = ['route', 'at', 'bus', 'bus_manual', 'vehicle', 'vehicle_label', 'building', 'transporter', 'transporter_manual', 'vch', 'vch_import', 'dora', 'at_manual', 'at_import'];
            const main: Row = { ...heir, route: row.route || info.get(row.key)?.route || '' };
            for (const k of carry) if (row[k] !== undefined) main[k] = row[k];
            delete main.with; main.adj = '';
            next = next.map(r => (r.key === heir.key ? main : (r.with === row.key ? { ...r, with: heir.key } : r)));
        }
        await save(next, `deleted SH ${row.ref}${heir ? `; SH ${heir.ref} is now first on its bus` : ''}`);
    }

    // add a group to a vehicle by its SH: the slip's group, leader, pax and rooms are filled in from the PMS
    const slipCache = useRef<Row[] | null>(null);
    async function groupOf(sh: string) {
        try { slipCache.current = slipCache.current || await guard(db.all()); } catch { slipCache.current = []; }
        // the slip of that SH whose stay starts or ends this day, else its latest
        const same = slipCache.current!.filter(s => !s.deleted && (String(s.sh_no).toUpperCase() === sh || ums.baseSh(s.sh_no) === ums.baseSh(sh)));
        const slip = same.find(s => s.checkout_date === day || s.checkin_date === day) || same.sort((x, y) => String(y.checkin_date).localeCompare(String(x.checkin_date)))[0];
        if (!slip) return null;
        const n = (v: any) => Math.max(0, parseInt(v, 10) || 0);
        const m = n(slip.gents), f = n(slip.ladies), c = n(slip.children ?? slip.child) + n(slip.infants ?? slip.infant);
        const rms = ['gents', 'ladies'].flatMap(k => (slip.rooms?.[k] || []).map((x: Row) => String(x.room_no || '').trim()).filter(Boolean));
        return { slip, add: { ref: String(slip.sh_no), operator: slip.tour_name || '', leader: String(slip.group_leader || '').trim(), m, f, c, pax: n(slip.total) || m + f + c, rooms: rms, ...(slip.building ? { building: String(slip.building).trim() } : {}) } };
    }
    async function addSh(parent: Row) {
        const typed = String((await promptAsk({ title: `SH to add to the ${T.vehicleOf(parent)} of ${parent.ref ? `SH ${parent.ref}` : 'this vehicle'} (${T.time12(parent.at)})`, body: 'Several at once: separate them with a comma or a space.' })) || '');
        const shs = [...new Set(typed.replace(/[<>]/g, '').toUpperCase().split(/[\s,;]+/).filter(Boolean))];
        if (!shs.length) return;
        const n = (v: any) => Math.max(0, parseInt(v, 10) || 0);
        const found: NonNullable<Awaited<ReturnType<typeof groupOf>>>[] = [], missing: string[] = [];
        for (const sh of shs) { const g = await groupOf(sh); if (g) found.push(g); else missing.push(sh); }
        const already = shs.filter(sh => rows.some(r => String(r.ref).toUpperCase() === sh));
        const lines = found.map(({ slip, add }) => `• SH ${slip.sh_no} — ${slip.tour_name || '—'} · ${String(slip.group_leader || '').trim() || '-'} · ${add.pax} pax (M ${add.m} · F ${add.f} · C ${add.c})${add.rooms.length ? ` · rooms ${add.rooms.join(', ')}` : ''}`);
        if (found.length && !(await confirmAsk({
            title: `Add ${found.length} group${found.length === 1 ? '' : 's'} to this ${T.vehicleOf(parent)}?`, confirmLabel: 'Add',
            body: [...lines, ...(missing.length ? ['', `Not in this site's slips: ${missing.join(', ')} — you will be asked their pax next.`] : []), ...(already.length ? ['', `Already on this day's list: ${already.join(', ')} — they are added again.`] : [])].join('\n'),
        }))) return;
        const adds = found.map(g => g.add);
        const have = T.vehiclePax(rows, parent.key), more = adds.reduce((s, a) => s + (Number(a.pax) || 0), 0);
        if (T.limited(parent) && have + more > T.BUS_LIMIT) { setMsg(`This bus has ${have} pax; adding ${more} more would pass the limit of ${T.BUS_LIMIT} per bus. Put the group on another bus.`, 'bad'); return; }
        for (const sh of missing) {
            const p = await promptAsk({ title: `SH ${sh} is not in this site's slips`, body: 'Add it anyway? Number of pax (Cancel to skip):', type: 'number' });
            if (p === null || !n(p)) continue;
            adds.push({ ref: sh, operator: '', leader: '', m: 0, f: 0, c: 0, pax: n(p), rooms: [] });
        }
        if (!adds.length) return;
        const stamp = Date.now().toString(36).toUpperCase();
        const riders = adds.map((add, i) => ({ key: `M${stamp}${i}`, dora: '', vch: '', transporter: '', at: parent.at, route: '', remarks: `added to SH ${parent.ref}'s ${T.vehicleOf(parent)}`, adj: '', loc: '', ...add, with: parent.key, manual: true }));
        await save([...rows, ...riders].sort((a, b) => a.at.localeCompare(b.at)), `SH ${adds.map(a => a.ref).join(', ')} added to ${parent.ref ? `SH ${parent.ref}` : 'a vehicle'}`);
    }
    async function submitAddBus(destId: string, f: { time: string; veh: string; transporter: string; vch: string; sh: string }) {
        const dest = T.destsFor(siteId).find((d: Row) => d.id === destId);
        if (!dest || !/^\d{2}:\d{2}$/.test(f.time)) return false;
        const sh = cleanText(f.sh).replace(/\s/g, '').toUpperCase();
        let add: Row = { ref: '', operator: '', leader: '', m: 0, f: 0, c: 0, pax: 0, rooms: [] };
        if (sh) {
            const g = await groupOf(sh);
            if (g) add = g.add;
            else {
                const p = await promptAsk({ title: `SH ${sh} is not in this site's slips`, body: 'Add the vehicle with it anyway? Number of pax:', type: 'number' });
                if (p === null) return false;
                add = { ...add, ref: sh, pax: Math.max(0, parseInt(p, 10) || 0) };
            }
        }
        if (f.veh !== 'car' && Number(add.pax) > T.BUS_LIMIT) { setMsg(`SH ${add.ref} has ${add.pax} pax — a bus carries at most ${T.BUS_LIMIT}. Add it as two buses (type the pax of each part), or use a car.`, 'bad'); return false; }
        const Tr = cleanText(f.transporter).slice(0, 60), V = cleanText(f.vch).slice(0, 20);
        const trip: Row = { key: `M${Date.now().toString(36).toUpperCase()}`, dora: '', vch: V, transporter: Tr, at: `${day}T${f.time}`, route: dest.route, remarks: 'vehicle added by hand', adj: '', loc: '', ...add, manual: true, ...(Tr || V ? { transporter_manual: true } : {}), ...(f.veh === 'car' ? { vehicle: 'car' } : {}) };
        // existing numbers stay; the new vehicle takes the next number of its destination
        const next: Row[] = T.assignBuses([...rows.map(r => ({ ...r })), trip].sort((a, b) => a.at.localeCompare(b.at)), rows);
        await save(next, `${dest.title}: ${f.veh} ${next.find(r => r.key === trip.key)?.bus ?? ''} added by hand at ${f.time}${add.ref ? ` with SH ${add.ref}` : ''}`);
        return true;
    }
    async function zsplit(key: string) {
        const main = rows.find(r => r.key === key);
        if (!main || !libs) return;
        const riders = rows.filter(r => info.get(r.key)?.parent === main);
        const next: Row[] | null = await libs.ziyarat.openZiyaratSplit(main, riders, rows);
        if (!next) return;
        const undone = !next.some(r => r.key === `${main.key}-L`);
        await save(T.assignBuses(next.map(r => ({ ...r })), rows), undone ? `Ziyarat split undone for SH ${main.ref || main.key}` : `Ziyarat gents / ladies for SH ${main.ref || main.key} (${riders.length + 1} groups)`);
    }
    async function byTime(destId: string) {
        const kind = (r: Row) => (T.vehicleOf(r) === 'other' ? `other:${String(r.vehicle_label || '').toUpperCase()}` : T.vehicleOf(r));
        const mains = rows.filter(r => info.get(r.key)?.dest === destId && !info.get(r.key)!.parent);
        const next = new Map<string, number>(), groups = new Map<string, Row[]>();
        for (const r of mains) (groups.get(kind(r)) ?? groups.set(kind(r), []).get(kind(r))!).push(r);
        for (const [k, list] of groups) list.sort((x, y) => x.at.localeCompare(y.at) || (x.bus ?? 1e9) - (y.bus ?? 1e9)).forEach((r, i) => next.set(r.key, T.firstNo(destId, k) + i));
        const moved = mains.filter(r => Number(r.bus) !== next.get(r.key));
        if (!moved.length) { setMsg('Already numbered by departure time.'); return; }
        const title = T.destsFor(siteId).find((d: Row) => d.id === destId)?.title || destId;
        if (!(await confirmAsk({
            title: `Number the ${title} vehicles ${T.firstNo(destId)}, ${T.firstNo(destId) + 1}, ${T.firstNo(destId) + 2}… by departure time?`, confirmLabel: 'Number them',
            body: [...moved.slice(0, 12).map(r => `SH ${r.ref} · ${T.time12(r.at)}: ${r.bus ?? '—'} → ${next.get(r.key)}`), ...(moved.length > 12 ? [`… and ${moved.length - 12} more`] : []), '', 'Bus sheets already stuck on vehicles may no longer match. You can still type a number in afterwards.'].join('\n'),
        }))) return;
        await save(rows.map(r => (next.has(r.key) && Number(r.bus) !== next.get(r.key) ? { ...r, bus: next.get(r.key), bus_manual: false } : r)), `${title}: numbered by departure time (${moved.length} changed)`);
    }
    async function plan() {
        let slips: Row[];
        try { slips = await guard(db.all()); } catch { setMsg('Could not read the slips.', 'bad'); return; }
        const mod = await loadApp('views/transport/plan.js');
        const trips: Row[] | null = await mod.openCheckoutPlan({ day, siteId, slips, rows });
        if (!trips?.length) return;
        await save(T.assignBuses([...rows.map(r => ({ ...r })), ...trips].sort((a, b) => a.at.localeCompare(b.at)), rows), `planned from check-outs: ${trips.length} group${trips.length === 1 ? '' : 's'} (SH ${trips.map(t => t.ref).join(', ')})`);
    }
    async function renumber() {
        if (!(await confirmAsk({ title: 'Renumber the buses?', confirmLabel: 'Renumber', body: 'Number every destination again from 1, in time order?\nBuses and cars count apart. Numbers typed in by hand are replaced, and sheets already stuck on buses may no longer match.' }))) return;
        await save(T.renumber(rows), 'renumbered');
    }
    async function deleteDay() {
        if (!(await confirmAsk({ title: `Delete the whole transport list of ${day}?`, confirmLabel: 'Delete day', body: 'Signage and bus sheets for the day go with it.' }))) return;
        try { await guard(T.deleteDay(siteId, day, doc.version)); setMsg('Deleted.'); } catch (e: any) { setMsg(e.message || 'Could not delete.', 'bad'); }
        await load();
    }
    async function saveWindow() {
        const w = window_;
        if (!/^\d{2}:\d{2}$/.test(w.to_time || '') || (w.from !== 'now' && !/^\d{2}:\d{2}$/.test(w.from || ''))) { setSgMsg('Fill in the times.'); return; }
        if (w.to_day === 0 && w.from !== 'now' && w.to_time <= w.from) { setSgMsg('The end must be after the beginning.'); return; }
        setSgBusy(true);
        try {
            const r = await guard<any>(libs!.signage.saveSignageConfig(siteId, { window: w }, sgVersion));
            setSgVersion(r.config.version); setWindow_(r.config.window);
            setSgMsg('Saved — every signage screen uses it from its next slide.');
        } catch (err: any) { setSgMsg(err instanceof cloud.UserError ? err.message : 'Could not save.'); if (err.status === 409) await loadWindow(); }
        finally { setSgBusy(false); }
    }

    // ---- cells ----
    const vehNames = [...new Set(['Train', ...rows.map(x => x.vehicle === 'other' && x.vehicle_label)].filter(Boolean))] as string[];
    const veh = T.VEHICLES as Record<string, { icon: string; title: string }>;
    const fromOptions = (own: string) => (own && !buildings.includes(own) ? [...buildings, own] : buildings);
    const ghost = 'inline-flex max-w-full items-center gap-1 rounded border border-transparent px-1.5 py-0.5 text-left hover:border-border hover:bg-accent';
    const sub = (t: React.ReactNode) => <small className="block text-xs text-muted-foreground">{t}</small>;

    const timeCell = (r: Row) => {
        const was = r.at_manual && r.at_import && r.at_import !== r.at ? sub(<span title={`Changed by hand — the transport list says ${T.time12(r.at_import)}`}>list: {T.time12(r.at_import)}</span>) : null;
        if (!writable) return <TableCell className="whitespace-nowrap">{T.time12(r.at)}{was}</TableCell>;
        return <TableCell className="whitespace-nowrap">
            {editTime === r.key
                ? <Input autoFocus type="time" className="tp-time-in h-8 w-28" defaultValue={r.at.slice(11, 16)} aria-label={`New time for SH ${r.ref}`}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); void commitTime(r, (e.target as HTMLInputElement).value); } else if (e.key === 'Escape') setEditTime(null); }}
                    onBlur={e => { if (editTime === r.key) void commitTime(r, e.target.value); }} />
                : <button type="button" className={cn(ghost, r.at_manual && manualCls)} title="Change the time" onClick={() => !saving && setEditTime(r.key)}>{T.time12(r.at)} <Pencil className="size-3 opacity-60" /></button>}
            {was}</TableCell>;
    };
    const fromCell = (r: Row, bus: Row | null) => {
        const own = r.building || '';
        if (!writable) return <TableCell>{own || (bus ? <span className="text-muted-foreground">{bus.building ? `↳ ${bus.building}` : ''}</span> : '—')}</TableCell>;
        const none = bus ? `↳ same as bus${bus.building ? ` (${bus.building})` : ''}` : '—';
        return <TableCell><select data-from={r.key} aria-label="Departs from (building)" className={cn('h-8 max-w-[10rem] rounded-md border bg-background px-1.5 text-sm', own && manualCls)} value={own} disabled={saving} onChange={e => setFrom(r.key, e.target.value)}>
            <option value="">{none}</option>{fromOptions(own).map(n => <option key={n} value={n}>{n}</option>)}</select></TableCell>;
    };
    const nameCell = (r: Row, field: string) => {
        const text = r[field] || '—';
        if (!writable) return <TableCell>{text}</TableCell>;
        const manual = (r.names_manual || []).includes(field);
        return <TableCell><button type="button" className={cn(ghost, manual && manualCls)} title={`Change the ${NAME_LABEL[field].toLowerCase()}`} onClick={() => !saving && void editName(r, field)}>{text} <Pencil className="size-3 opacity-60" /></button></TableCell>;
    };
    const trCell = (r: Row, rider: boolean) => {
        const text = <>{r.transporter || (rider ? 'with the bus above' : '—')}{r.vch ? sub(`Vch ${r.vch}`) : null}</>;
        if (!writable || rider) return <TableCell>{text}</TableCell>;
        return <TableCell><button type="button" className={cn(ghost, r.transporter_manual && manualCls)} title="Change the transporter / Vch No" onClick={() => !saving && void editTransporter(r)}><span>{text}</span> <Pencil className="size-3 opacity-60" /></button></TableCell>;
    };
    const paxCell = (r: Row) => {
        const body = <><b>{r.pax}</b>{sub([r.m && `M${r.m}`, r.f && `F${r.f}`, r.c && `C${r.c}`].filter(Boolean).join(' '))}</>;
        return <TableCell className="text-right">{writable ? <button type="button" className={cn(ghost, 'text-right', r.pax_manual && manualCls)} title="Change the pax" onClick={() => !saving && void editPax(r)}><span>{body}</span></button> : body}</TableCell>;
    };
    const delCell = (r: Row) => (writable ? <TableCell><Button variant="ghost" size="icon" className="size-8 text-destructive" title="Delete this trip" aria-label={`Delete SH ${r.ref}`} disabled={saving} onClick={() => void deleteTrip(r)}><Trash2 className="size-4" /></Button></TableCell> : null);
    const refCell = (r: Row) => <TableCell><b>{r.ref || '—'}</b>{r.dora ? sub(`Dora ${r.dora}`) : null}</TableCell>;

    function signageTables() {
        return sign.map(s => {
            const count = new Map<string, number>();
            const vk = (b: Row) => `${b.vehicle}${b.vehicle === 'other' ? String(b.vlabel).toUpperCase() : ''}#${b.bus}`;
            for (const b of s.buses) if (b.bus != null) count.set(vk(b), (count.get(vk(b)) || 0) + 1);
            const air = s.dest.tosha === 'airport';   // airport departures are listed by departure time (others by vehicle number)
            const buses: Row[] = air ? [...s.buses].sort((x, y) => x.at.localeCompare(y.at) || (x.bus ?? 1e9) - (y.bus ?? 1e9)) : s.buses;
            const body = buses.flatMap(b => b.rows.map((r: Row, i: number) => ({ r, b, i }))).filter(x => matches(x.r));
            return (
                <div key={s.dest.id} className="grid gap-2">
                    <div className="flex flex-wrap items-center gap-2 border-b pb-1.5 font-bold"><span aria-hidden>{s.dest.icon}</span>{s.dest.label}{air && <span className="text-xs font-normal text-muted-foreground">by departure time</span>}
                        <small className="font-normal text-muted-foreground">{fleet(s.buses)} · {s.groups} groups · {s.pax} pax</small>
                        {air && s.buses.length > 1 && writable && <Button size="sm" variant="outline" className="ml-auto" title="Number this destination's vehicles 1, 2, 3… by departure time" onClick={() => void byTime(s.dest.id)}>🔢 Number by time</Button>}</div>
                    {body.length ? <div className="overflow-x-auto"><Table>
                        <TableHeader><TableRow><TableHead>Vehicle</TableHead><TableHead>Time</TableHead><TableHead>From</TableHead><TableHead>SH</TableHead><TableHead>Tour operator</TableHead><TableHead>Group leader</TableHead><TableHead className="text-right">Pax</TableHead><TableHead>Transporter</TableHead><TableHead>Remarks</TableHead>{writable && <TableHead />}</TableRow></TableHeader>
                        <TableBody>{body.map(({ r, b, i }) => (
                            <TableRow key={r.key} className={cn(i > 0 && 'bg-muted/40', r.at < past && 'opacity-55')}>
                                <TableCell className="whitespace-nowrap">{i ? `↳ ${T.vehicleNo(b.bus, b.vehicle, b.vlabel)}` : writable
                                    ? <span className="inline-flex items-center gap-1">
                                        <select data-veh={r.key} aria-label="Vehicle" className="h-8 rounded-md border bg-background px-1 text-sm" disabled={saving} value={b.vehicle === 'other' ? `other:${b.vlabel}` : b.vehicle} onChange={e => void setVehicle(r, e.target.value)}>
                                            <option value="bus">{veh.bus.icon} Bus</option><option value="car">{veh.car.icon} Car</option>
                                            {(b.vehicle === 'other' && !vehNames.includes(b.vlabel) ? [...vehNames, b.vlabel] : vehNames).map(n => <option key={n} value={`other:${n}`}>{veh.other.icon} {n}</option>)}
                                            <option value="custom">✎ Custom…</option></select>
                                        <input key={`${r.key}-${b.bus}`} data-key={r.key} type="number" min={1} max={99999} inputMode="numeric" defaultValue={b.bus ?? ''} aria-label={`${T.isTrain(b.vehicle, b.vlabel) ? 'Train' : b.vlabel || veh[b.vehicle].title} number`}
                                            title={`${r.bus_manual ? 'Typed in by hand' : 'Given by the import'}${count.get(vk(b))! > 1 ? ' · used twice' : ''}`}
                                            className={cn('h-8 rounded-md border bg-background px-2 text-sm', T.isTrain(b.vehicle, b.vlabel) ? 'w-24' : 'w-16', r.bus_manual && manualCls, count.get(vk(b))! > 1 && 'border-destructive bg-destructive/10')}
                                            onBlur={e => setBus(r.key, e.target.value)} onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} />
                                    </span>
                                    : `${veh[b.vehicle].icon} ${T.vehicleNo(b.bus, b.vehicle, b.vlabel) || b.bus || '—'}`}
                                    {!i && writable && b.vehicle === 'other' && sub(b.vlabel)}</TableCell>
                                {timeCell(r)}{fromCell(r, i ? b : null)}{refCell(r)}{nameCell(r, 'operator')}{nameCell(r, 'leader')}{paxCell(r)}{trCell(r, !!i)}
                                <TableCell className="min-w-40">
                                    {!i && <span className={cn('mr-1.5 rounded border px-1.5 py-0.5 text-xs font-bold', T.limited(r) && b.pax > T.BUS_LIMIT && 'border-destructive bg-destructive/10 text-destructive')} title={`Pax on this ${veh[b.vehicle].title.toLowerCase()}${T.limited(r) ? ` (a bus carries at most ${T.BUS_LIMIT})` : ''}`}>{b.pax}{T.limited(r) ? ` / ${T.BUS_LIMIT}` : ''}</span>}
                                    {r.part && <Badge variant="outline" className="mr-1">{r.part === 'gents' ? 'GENTS' : 'LADIES'}</Badge>}{r.remarks}
                                    {!i && writable && <Button size="sm" variant="outline" className="ml-1.5 h-6 px-1.5 text-xs" title={`Add a group (SH) to this ${veh[b.vehicle].title.toLowerCase()}`} disabled={saving} onClick={() => void addSh(r)}>＋ SH</Button>}
                                    {!i && writable && libs?.ziyarat.isZiyarat(siteId, r.route) && <Button size="sm" variant="outline" className="ml-1.5 h-6 px-1.5 text-xs" title="Gents and ladies on their own Ziyarat trips" disabled={saving} onClick={() => void zsplit(String(r.key).replace(/-L$/, ''))}>{r.part ? '⚥ Gents / Ladies…' : '⚥ Split gents / ladies'}</Button>}</TableCell>
                                {delCell(r)}
                            </TableRow>))}</TableBody></Table></div>
                        : <p className="text-sm text-muted-foreground">{s.buses.length ? 'Nothing matches.' : 'No trips.'}</p>}
                    {writable && <AddBusForm dest={s.dest} open={addBus === s.dest.id} onOpen={o => setAddBus(o ? s.dest.id : null)} onSubmit={f => submitAddBus(s.dest.id, f)} busy={saving} />}
                </div>
            );
        });
    }
    function allTable() {
        const list = [...rows].sort((a, b) => a.at.localeCompare(b.at)).filter(matches);
        if (!list.length) return <p className="text-sm text-muted-foreground">Nothing matches.</p>;
        return <div className="overflow-x-auto"><Table>
            <TableHeader><TableRow><TableHead>Time</TableHead><TableHead>From</TableHead><TableHead>Route</TableHead><TableHead>Vehicle</TableHead><TableHead>SH</TableHead><TableHead>Tour operator</TableHead><TableHead>Group leader</TableHead><TableHead className="text-right">Pax</TableHead><TableHead>Transporter</TableHead><TableHead>Rooms</TableHead><TableHead>Remarks</TableHead>{writable && <TableHead />}</TableRow></TableHeader>
            <TableBody>{list.map(r => { const i = info.get(r.key)!; return (
                <TableRow key={r.key} className={cn(i.parent && 'bg-muted/40', r.at < past && 'opacity-55')}>
                    {timeCell(r)}{fromCell(r, i.parent ? { building: i.building } : null)}
                    <TableCell>{i.route || '—'}{i.parent ? sub('grouped') : null}</TableCell>
                    <TableCell className="whitespace-nowrap">{i.dest ? `${veh[i.vehicle].icon} ${i.vehicle === 'other' ? T.vehicleNo(i.bus, i.vehicle, i.vlabel) : i.bus ?? '—'}` : ''}</TableCell>
                    {refCell(r)}{nameCell(r, 'operator')}{nameCell(r, 'leader')}{paxCell(r)}{trCell(r, !!i.parent)}
                    <TableCell>{(r.rooms || []).join(', ')}</TableCell><TableCell>{r.remarks}</TableCell>{delCell(r)}
                </TableRow>); })}</TableBody></Table></div>;
    }

    const canImport = cloud.canOpen('transport-import', desk) && writable;
    const dests = (T.destsFor(siteId) as Row[]).map(d => d.title).join(', ').replace(/, ([^,]*)$/, ' and $1');
    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            <header className="flex flex-wrap items-start justify-between gap-3">
                <div><h1 className="text-2xl font-bold text-primary">Transport</h1><p className="text-sm text-muted-foreground">Trips of the day from the transport list. {dests} trips get a vehicle number, signage and a bus sheet.</p></div>
                <div className="flex flex-wrap gap-2">
                    {canImport && <Button asChild variant="outline"><a href={href('transport-import')}>📋 Import list</a></Button>}
                    {cloud.canOpen('transport-print', desk) && <Button asChild variant="outline"><a href={href('transport-print', { day })}>🖨️ Bus sheets</a></Button>}
                    <Button asChild><a href={`${siteId}/signage`} target="_blank" rel="noopener">📺 Signage ↗</a></Button>
                </div>
            </header>
            <DayNav day={day} days={days} onChange={d => navigate('transport', { day: d })} />
            {rows.length > 0 && (dupes.length
                ? <div role="alert" className="rounded-xl border border-destructive bg-destructive/10 p-3 text-sm"><b>⚠ {dupeTitle} listed more than once on this day.</b>
                    <ul className="ml-5 list-disc">{dupes.map(x => <li key={x.ref}><b>SH {x.ref}</b> × {x.rows.length}: {dupeLines(x).join('  |  ')}</li>)}</ul>
                    <span className="text-muted-foreground">Check each one: a group should ride one vehicle per route. Delete the extra trip (🗑) if it is a mistake.</span></div>
                : <div role="status" className="rounded-xl border border-ok/40 bg-ok-soft p-3 text-sm font-bold text-ok">✓ All good to go — no SH is listed twice on this day.</div>)}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {sign.map(s => <div key={s.dest.id} className="grid gap-0.5 rounded-xl border bg-card p-3"><span aria-hidden className="text-xl">{s.dest.icon}</span><b className="text-2xl">{s.pax}</b><span className="text-sm">{s.dest.title}</span>
                    <small className="text-xs text-muted-foreground">{fleet(s.buses)} · {s.groups} group{s.groups === 1 ? '' : 's'}{s.buses.length ? ` · ${T.time12(s.buses.reduce((a: Row, b: Row) => (a.at < b.at ? a : b)).at)} first` : ''}</small></div>)}
            </div>
            <Card className="gap-0 py-0">
                <CardContent className="grid gap-3 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <div role="group" aria-label="Which trips" className="inline-flex overflow-hidden rounded-md border">
                            {([['sign', 'Signage trips'], ['all', 'All trips']] as const).map(([k, l]) => <button key={k} type="button" aria-pressed={filter === k} className={cn('px-3 py-1.5 text-sm', filter === k ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-accent')} onClick={() => setFilter(k)}>{l}</button>)}
                        </div>
                        <Input type="search" className="min-w-48 flex-1" placeholder="Find SH, group, leader, transporter, vch…" aria-label="Find" value={find} onChange={e => setFind(e.target.value)} />
                        {writable && <>
                            <Button title="Make trips from the groups checking out on this day" disabled={saving} onClick={() => void plan()}>🧭 Plan from check-outs</Button>
                            <Button variant="outline" disabled={saving || !doc.version} title="Number each destination again from 1 in time order" onClick={() => void renumber()}>Renumber buses</Button>
                            <Button variant="outline" className="text-destructive" disabled={saving || !doc.version} onClick={() => void deleteDay()}>Delete day</Button></>}
                    </div>
                    {msg && <div className={cn('rounded-md border px-3 py-2 text-sm', msg.kind === 'ok' ? 'border-ok/40 bg-ok-soft text-ok' : 'border-destructive bg-destructive/10 text-destructive')}>{msg.text}</div>}
                    {!loaded ? <p className="text-sm text-muted-foreground">Loading…</p>
                        : !rows.length && !(writable && filter === 'sign')
                            ? <p className="text-sm text-muted-foreground">No transport list saved for this day.{canImport && <> <a className="text-primary underline" href={href('transport-import')}>Import one →</a></>}</p>
                            : <div className="grid gap-4">{filter === 'sign' ? signageTables() : allTable()}</div>}
                    <p className="text-xs text-muted-foreground">{doc.version ? `${rows.length} trips · saved ${new Date(doc.updated_at || '').toLocaleString()}${doc.updated_by ? ' by ' + doc.updated_by : ''}` : ''}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="text-base">Signage window <span className="text-sm font-normal text-muted-foreground">— which trips the public board shows (Riyadh time)</span></CardTitle>
                    <p className="text-sm text-muted-foreground">Default: from <b>now</b> (a trip drops off once it has left) to the end of <b>tomorrow</b>. Templates and slide times are in the Signage Builder.</p></CardHeader>
                <CardContent className="grid gap-3">
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="grid gap-1"><Label>Beginning</Label>
                            <Select disabled={!writable} value={window_.from === 'now' ? 'now' : 'time'} onValueChange={v => setWindow_(w => ({ ...w, from: v === 'now' ? 'now' : '00:00' }))}><SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="now">Now — hide trips that have left</SelectItem><SelectItem value="time">Today from a fixed time</SelectItem></SelectContent></Select></div>
                        {window_.from !== 'now' && <div className="grid gap-1"><Label htmlFor="sgFromTime">Today from</Label><Input id="sgFromTime" type="time" disabled={!writable} value={window_.from} onChange={e => setWindow_(w => ({ ...w, from: e.target.value }))} /></div>}
                        <div className="grid gap-1"><Label>End day</Label>
                            <Select disabled={!writable} value={String(window_.to_day)} onValueChange={v => setWindow_(w => ({ ...w, to_day: Number(v) }))}><SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="0">Today</SelectItem><SelectItem value="1">Tomorrow</SelectItem><SelectItem value="2">Day after tomorrow</SelectItem></SelectContent></Select></div>
                        <div className="grid gap-1"><Label htmlFor="sgToTime">End time</Label><Input id="sgToTime" type="time" disabled={!writable} value={window_.to_time} onChange={e => setWindow_(w => ({ ...w, to_time: e.target.value }))} /></div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {writable && <><Button variant="outline" onClick={() => { setWindow_(SG_DEFAULT); setSgMsg('Default filled in — press Save window.'); }}>Back to default</Button><Button disabled={sgBusy} onClick={() => void saveWindow()}>Save window</Button></>}
                        {cloud.canOpen('signage-builder', desk) && <Button asChild variant="outline"><a href={href('signage-builder')}>🎨 Signage Builder</a></Button>}
                        <span className="text-sm text-muted-foreground">{sgMsg}</span>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={dupeOpen} onOpenChange={setDupeOpen}>
                <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-md">
                    <DialogHeader><DialogTitle>⚠ {dupeTitle} listed twice</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">On {day}:</p>
                    <ul className="ml-5 list-disc text-sm">{dupes.map(x => <li key={x.ref}><b>SH {x.ref}</b> × {x.rows.length}<br /><span className="text-muted-foreground">{dupeLines(x).map((l, i) => <span key={i}>{l}<br /></span>)}</span></li>)}</ul>
                    <DialogFooter><Button onClick={() => setDupeOpen(false)}>OK, I will check</Button></DialogFooter>
                </DialogContent>
            </Dialog>
            {confirmDialog}{promptDialog}
        </div>
    );
}

// + Bus under each destination: a vehicle made by hand (optionally with a first group by its SH)
function AddBusForm({ dest, open, onOpen, onSubmit, busy }: { dest: Row; open: boolean; onOpen: (o: boolean) => void; onSubmit: (f: { time: string; veh: string; transporter: string; vch: string; sh: string }) => Promise<boolean>; busy: boolean }) {
    const blank = { time: dest.id === 'mdmakkah' ? '08:00' : '', veh: 'bus', transporter: '', vch: '', sh: '' };   // Madina → Makkah leaves at 8 am unless changed
    const [f, setF] = useState(blank);
    if (!open) return <div><Button size="sm" variant="outline" onClick={() => onOpen(true)}><Plus className="size-3.5" />Bus</Button></div>;
    const set = (k: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement>) => setF(p => ({ ...p, [k]: e.target.value }));
    return (
        <form autoComplete="off" className="grid grid-cols-2 items-end gap-2 rounded-xl border bg-accent/40 p-3 sm:grid-cols-3 lg:grid-cols-6" onSubmit={async e => { e.preventDefault(); if (await onSubmit(f)) { setF(blank); onOpen(false); } }}>
            <b className="col-span-full">New {dest.title} vehicle</b>
            <div className="grid gap-1"><Label>Time</Label><Input type="time" required value={f.time} onChange={set('time')} /></div>
            <div className="grid gap-1"><Label>Vehicle</Label>
                <Select value={f.veh} onValueChange={v => setF(p => ({ ...p, veh: v }))}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="bus">🚌 Bus</SelectItem><SelectItem value="car">🚗 Car</SelectItem></SelectContent></Select></div>
            <div className="grid gap-1"><Label>Transporter</Label><Input maxLength={60} value={f.transporter} onChange={set('transporter')} /></div>
            <div className="grid gap-1"><Label>Vch No</Label><Input maxLength={20} value={f.vch} onChange={set('vch')} /></div>
            <div className="grid gap-1"><Label>SH (optional)</Label><Input maxLength={20} placeholder="first group" value={f.sh} onChange={set('sh')} /></div>
            <div className="flex gap-2"><Button type="submit" disabled={busy}>Add</Button><Button type="button" variant="outline" onClick={() => { setF(blank); onOpen(false); }}>Cancel</Button></div>
        </form>
    );
}
