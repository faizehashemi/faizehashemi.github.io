import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useConfirm } from '@/components/ConfirmDialog';
import { useCore, useGuard, useSite } from '@/pms/PmsContext';
import { FLAG, STATUS, addDays, annualTaken, dayLine, daysBetween, dow, hm, saudiNow, shiftOf, type DayLine, type Row, type Shift } from './hr';

// Main menu → HR: staff, faces and PINs, the check-in link, today at a glance, attendance and timesheets, the weekly roster, leave, the day's tasks,
// job roles with their duties, shifts and the workplace circle. Server: worker.js hrRoute; the public check-in page: pms/hr/index.html.

const FACE = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13';
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const fmtDay = (d: string) => new Date(`${d}T12:00`).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
const sel = 'h-9 rounded-md border bg-background px-2 text-sm';
const shrink = (file: Blob, max = 360, q = 0.75) => new Promise<string>((res, rej) => { const i = new Image(); i.onload = () => { const k = Math.min(1, max / Math.max(i.width, i.height)), c = document.createElement('canvas'); c.width = Math.round(i.width * k); c.height = Math.round(i.height * k); c.getContext('2d')!.drawImage(i, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', q)); }; i.onerror = rej; i.src = URL.createObjectURL(file); });
const csv = (name: string, rows: (string | number)[][]) => { const t = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + t], { type: 'text/csv' })); a.download = name; a.click(); };

export default function HrPage() {
    const { cloud } = useCore() as any;
    const guard = useGuard();
    const { site, siteId } = useSite();
    const { ask: confirm, dialog: confirmDialog } = useConfirm();
    const api = (m: string, p: string, b?: unknown) => guard(cloud.request(m, p, b)) as Promise<any>;
    const [D, setD] = useState<Row | null>(null), [err, setErr] = useState('');
    const today = saudiNow().slice(0, 10);
    const [range, setRange] = useState({ from: addDays(today, -6), to: today });
    const [punches, setPunches] = useState<Row[]>([]), [leaves, setLeaves] = useState<Row[]>([]), [roster, setRoster] = useState<Map<string, number | null>>(new Map()), [tasks, setTasks] = useState<Row[]>([]);
    const [tab, setTab] = useState('today');
    const load = async () => { try { setD(await api('GET', `/api/hr/data?site=${siteId}`)); } catch (e: any) { setErr(e.message); } };
    const loadRange = async () => {
        const from = range.from < addDays(today, -1) ? range.from : addDays(today, -1), to = range.to > addDays(today, 13) ? range.to : addDays(today, 13);
        try {
            const [a, l, s, t] = await Promise.all([api('GET', `/api/hr/attendance?site=${siteId}&from=${from}&to=${range.to > today ? range.to : today}`), api('GET', `/api/hr/leaves?site=${siteId}`),
                api('GET', `/api/hr/schedule?site=${siteId}&from=${from}&to=${to}`), api('GET', `/api/hr/tasks?site=${siteId}&from=${from}&to=${to}`)]);
            setPunches(a.punches); setLeaves(l.leaves); setRoster(new Map((s.entries as Row[]).map(e => [`${e.day}|${e.staff_id}`, e.shift_id]))); setTasks(t.tasks);
        } catch (e: any) { setErr(e.message); }
    };
    useEffect(() => { void load(); }, [siteId]);   // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => { void loadRange(); const t = setInterval(() => { if (document.visibilityState === 'visible') void loadRange(); }, 60000); return () => clearInterval(t); }, [siteId, range.from, range.to]);   // eslint-disable-line react-hooks/exhaustive-deps
    if (!D) return <div className="p-6 text-sm text-muted-foreground">{err || 'Loading HR…'}</div>;
    const staff: Row[] = D.staff, shifts: Shift[] = D.shifts, roles: Row[] = D.roles, can = !!D.can_edit;
    const active = staff.filter(s => s.active);
    const ctx = { api, siteId, site, staff, active, shifts, roles, D, setD, can, punches, leaves, roster, tasks, today, range, setRange, reload: loadRange, reloadAll: async () => { await load(); await loadRange(); }, confirm };
    const pending = leaves.filter(l => l.status === 'pending').length;
    return (
        <div className="mx-auto grid max-w-[1800px] gap-4 px-3 pb-12 pt-4 sm:px-5">
            <header className="flex flex-wrap items-end justify-between gap-3">
                <div><h1 className="font-serif text-3xl font-black">HR</h1><p className="text-sm text-muted-foreground">{site.label} · staff, attendance, roster, leave and tasks</p></div>
                <PublicLink siteId={siteId} />
            </header>
            {err && <p className="text-sm text-destructive">{err}</p>}
            <Tabs value={tab} onValueChange={setTab}>
                <TabsList variant="underline" className="flex-wrap">
                    {[['today', '📊 Today'], ['staff', `👥 Staff (${active.length})`], ['attendance', '🕒 Attendance'], ['roster', '🗓️ Roster'], ['leave', `🤒 Leave${pending ? ` (${pending})` : ''}`], ['tasks', '📋 Tasks'], ['setup', '🧩 Roles & shifts'], ['settings', '⚙️ Settings']].map(([k, l]) => <TabsTrigger key={k} value={k}>{l}</TabsTrigger>)}
                </TabsList>
                <TabsContent value="today"><Today {...ctx} /></TabsContent>
                <TabsContent value="staff"><Staff {...ctx} /></TabsContent>
                <TabsContent value="attendance"><Attendance {...ctx} /></TabsContent>
                <TabsContent value="roster"><Roster {...ctx} /></TabsContent>
                <TabsContent value="leave"><Leave {...ctx} /></TabsContent>
                <TabsContent value="tasks"><Tasks {...ctx} /></TabsContent>
                <TabsContent value="setup"><Setup {...ctx} /></TabsContent>
                <TabsContent value="settings"><Settings {...ctx} /></TabsContent>
            </Tabs>
            {confirmDialog}
        </div>
    );
}
type Ctx = Row & { api: (m: string, p: string, b?: unknown) => Promise<any>; staff: Row[]; active: Row[]; shifts: Shift[]; roles: Row[]; punches: Row[]; leaves: Row[]; roster: Map<string, number | null>; tasks: Row[]; can: boolean };
const Face = ({ s, cls = 'size-10' }: { s?: Row; cls?: string }) => s?.photo ? <img src={s.photo} alt="" className={cn(cls, 'shrink-0 rounded-full object-cover')} /> : <span className={cn(cls, 'grid shrink-0 place-items-center rounded-full bg-muted')}>👤</span>;
const Kpi = ({ v, l, tone }: { v: React.ReactNode; l: string; tone?: string }) => <div className={cn('min-w-28 rounded-xl border bg-card p-3', tone)}><b className="block font-serif text-3xl">{v}</b><small className="text-xs uppercase tracking-wider text-muted-foreground">{l}</small></div>;
function useSelfie(api: Ctx['api']) {
    const [s, setS] = useState<string | null>(null);
    return { node: s && <Dialog open onOpenChange={() => setS(null)}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Selfie</DialogTitle></DialogHeader><img src={s} alt="Selfie" className="w-full rounded-xl" /></DialogContent></Dialog>,
        open: async (id: number) => { const r = await api('GET', `/api/hr/attendance/${id}/selfie`); setS(r.selfie || ''); } };
}

/* ------------------------------ today ------------------------------ */
function Today(c: Ctx) {
    const lines = c.active.map(s => dayLine(s, c.today, c.punches, c.roster, c.shifts, c.leaves));
    const n = (st: string[]) => lines.filter(l => st.includes(l.status)).length;
    const todayTasks = c.tasks.filter(t => t.day === c.today);
    const selfie = useSelfie(c.api);
    const order = ['absent', 'late', 'working', 'present', 'upcoming', 'leave', 'off'];
    return (
        <div className="grid gap-4">
            <div className="flex flex-wrap gap-2">
                <Kpi v={lines.filter(l => l.shift).length} l="On shift today" /><Kpi v={n(['present', 'working', 'late'])} l="Came" tone="border-emerald-300" />
                <Kpi v={n(['late'])} l="Late" tone="border-amber-300" /><Kpi v={n(['absent'])} l="Absent" tone="border-red-300" /><Kpi v={n(['leave'])} l="On leave" />
                <Kpi v={`${todayTasks.filter(t => t.status === 'done' || t.status === 'verified').length}/${todayTasks.length}`} l="Tasks done" />
                <Kpi v={lines.reduce((s, l) => s + l.refused, 0)} l="Refused check-ins" tone="border-red-200" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {lines.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status)).map(l => (
                    <Card key={l.staff.id} className="flex-row items-center gap-3 p-3">
                        <Face s={l.staff} cls="size-12" />
                        <div className="grid min-w-0 flex-1 gap-0.5">
                            <b className="truncate">{l.staff.name}</b>
                            <small className="text-muted-foreground">{l.shift ? `${l.shift.name} ${l.shift.start}–${l.shift.end}` : 'no shift'}{l.first ? ` · in ${l.first}` : ''}{l.last ? ` · out ${l.last}` : ''}{l.late ? ` · ${l.late} min late` : ''}</small>
                            {(l.flags.length > 0 || l.refused > 0) && <small className="text-red-700 dark:text-red-400">{[...l.flags.map(f => FLAG[f] || f), l.refused ? `❌ ${l.refused} refused` : ''].filter(Boolean).join(' · ')}</small>}
                        </div>
                        <div className="grid justify-items-end gap-1"><span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', STATUS[l.status][1])}>{STATUS[l.status][0]}</span>
                            {l.ins[0] && <button type="button" className="text-xs text-primary underline" onClick={() => void selfie.open(l.ins[0].id)}>selfie</button>}</div>
                    </Card>))}
            </div>
            {!c.active.length && <p className="text-sm text-muted-foreground">Add your staff on the Staff tab, enroll their faces and give each a PIN.</p>}
            {selfie.node}
        </div>
    );
}

/* ------------------------------ staff ------------------------------ */
function Staff(c: Ctx) {
    const [edit, setEdit] = useState<Row | null>(null), [enroll, setEnroll] = useState<Row | null>(null), [pin, setPin] = useState<{ s: Row; pin: string } | null>(null), [q, setQ] = useState(''), [showOld, setShowOld] = useState(false);
    const role = (id: number) => c.roles.find(r => r.id === id);
    const list = c.staff.filter(s => (showOld || s.active) && (!q || [s.name, s.name_local, s.emp_no, s.phone].some(v => String(v || '').toLowerCase().includes(q.toLowerCase()))));
    return (
        <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2"><Input type="search" className="max-w-xs" placeholder="🔎 Name, number, phone" value={q} onChange={e => setQ(e.target.value)} />
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showOld} onChange={e => setShowOld(e.target.checked)} />Show inactive</label>
                {c.can && <Button className="ml-auto" onClick={() => setEdit({ active: true })}>➕ Add staff</Button>}</div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{list.map(s => (
                <Card key={s.id} className={cn('flex-row gap-3 p-3', !s.active && 'opacity-60')}>
                    <Face s={s} cls="size-16" />
                    <div className="grid min-w-0 flex-1 gap-0.5 text-sm">
                        <b className="truncate text-base">{s.name}</b>{s.name_local && <span className="text-muted-foreground">{s.name_local}</span>}
                        <span className="text-muted-foreground">{[s.emp_no && '#' + s.emp_no, role(s.role_id)?.title, c.shifts.find(x => x.id === s.shift_id)?.name, s.phone].filter(Boolean).join(' · ') || '—'}</span>
                        <span className="flex flex-wrap gap-1"><Badge variant={s.has_face ? 'default' : 'outline'}>{s.has_face ? '🙂 face enrolled' : '⚠ no face'}</Badge><Badge variant={s.has_pin ? 'default' : 'outline'}>{s.has_pin ? '🔢 PIN set' : '⚠ no PIN'}</Badge></span>
                        {c.can && <span className="mt-1 flex flex-wrap gap-1">
                            <Button size="sm" variant="outline" onClick={() => setEdit(s)}>✏️ Edit</Button>
                            <Button size="sm" variant="outline" onClick={() => setEnroll(s)}>📸 {s.has_face ? 'Re-enroll face' : 'Enroll face'}</Button>
                            <Button size="sm" variant="outline" onClick={async () => { if (s.has_pin && !(await c.confirm({ title: `New PIN for ${s.name}?`, body: 'The old PIN stops working.', confirmLabel: 'New PIN' }))) return; const r = await c.api('POST', `/api/hr/staff/${s.id}/pin`, {}); setPin({ s, pin: r.pin }); await c.reloadAll(); }}>🔢 {s.has_pin ? 'New PIN' : 'Give PIN'}</Button>
                        </span>}
                    </div>
                </Card>))}
                {!list.length && <p className="text-sm text-muted-foreground">No staff yet.</p>}</div>
            {edit && <StaffForm c={c} s={edit} onClose={() => setEdit(null)} />}
            {enroll && <Enroll c={c} s={enroll} onClose={() => setEnroll(null)} />}
            {pin && <Dialog open onOpenChange={() => setPin(null)}><DialogContent className="max-w-sm text-center">
                <DialogHeader><DialogTitle>PIN for {pin.s.name}</DialogTitle><DialogDescription>Shown only now — write it on their card. They type it on the check-in page.</DialogDescription></DialogHeader>
                <div className="font-mono text-6xl font-black tracking-[0.3em]">{pin.pin}</div>
                <Button variant="outline" onClick={() => { const w = window.open('', '_blank'); if (!w) return; w.document.write(`<html><body style="font-family:system-ui;text-align:center;padding:30px"><div style="border:3px solid #000;border-radius:16px;padding:20px;display:inline-block;min-width:280px">${pin.s.photo ? `<img src="${pin.s.photo}" style="width:120px;height:120px;border-radius:50%;object-fit:cover">` : ''}<h2>${pin.s.name}</h2>${pin.s.name_local ? `<h3>${pin.s.name_local}</h3>` : ''}<p>হাজিরা নম্বর · Attendance PIN</p><div style="font-size:64px;font-weight:900;letter-spacing:12px">${pin.pin}</div></div><script>print()<\/script></body></html>`); w.document.close(); }}>🖨 Print card</Button>
            </DialogContent></Dialog>}
        </div>
    );
}
function StaffForm({ c, s, onClose }: { c: Ctx; s: Row; onClose: () => void }) {
    const [f, setF] = useState<Row>({ ...s }), [err, setErr] = useState('');
    const set = (k: string, v: unknown) => setF(p => ({ ...p, [k]: v }));
    const field = (l: string, k: string, props: Row = {}) => <label className="grid gap-1 text-xs font-semibold">{l}<Input value={f[k] ?? ''} onChange={e => set(k, e.target.value)} {...props} /></label>;
    async function save() {
        try { const b = { site: c.siteId, ...f }; const r = f.id ? await c.api('PUT', `/api/hr/staff/${f.id}`, b) : await c.api('POST', '/api/hr/staff', b); c.setD({ ...c.D, ...r }); onClose(); }
        catch (e: any) { setErr(e.message); }
    }
    return <Dialog open onOpenChange={onClose}><DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader><DialogTitle>{f.id ? `Edit ${s.name}` : 'Add staff'}</DialogTitle></DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
            {field('Name (English)', 'name')}{field('Name (Bangla / own language)', 'name_local')}{field('Staff number', 'emp_no')}{field('Mobile', 'phone')}
            <label className="grid gap-1 text-xs font-semibold">Job role<select className={sel} value={f.role_id ?? ''} onChange={e => set('role_id', Number(e.target.value) || null)}><option value="">—</option>{c.roles.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}</select></label>
            <label className="grid gap-1 text-xs font-semibold">Usual shift<select className={sel} value={f.shift_id ?? ''} onChange={e => set('shift_id', Number(e.target.value) || null)}><option value="">—</option>{c.shifts.map(x => <option key={x.id} value={x.id}>{x.name} {x.start}–{x.end}</option>)}</select></label>
            {field('Department', 'dept')}{field('Nationality', 'nationality')}{field('Monthly wage (SAR)', 'wage', { type: 'number', min: 0 })}{field('Joined on', 'joined_on', { type: 'date' })}
            <label className="grid gap-1 text-xs font-semibold sm:col-span-2">Notes<Textarea value={f.notes ?? ''} onChange={e => set('notes', e.target.value)} /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.active !== false} onChange={e => set('active', e.target.checked)} />Active (can check in)</label>
            <label className="text-xs font-semibold">Photo <input type="file" accept="image/*" onChange={async e => { if (e.target.files?.[0]) set('photo', await shrink(e.target.files[0], 360)); }} /></label>
        </div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <div className="flex justify-between gap-2">{f.id ? <Button variant="ghost" className="text-destructive" onClick={async () => { if (await c.confirm({ title: `Remove ${s.name}?`, body: 'Their attendance and leave records stay.', confirmLabel: 'Remove' })) { c.setD({ ...c.D, ...(await c.api('DELETE', `/api/hr/staff/${f.id}`)) }); onClose(); } }}>🗑 Remove</Button> : <span />}
            <span className="flex gap-2"><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => void save()}>Save</Button></span></div>
    </DialogContent></Dialog>;
}
/** Face enrollment: three looks a second apart, averaged into one face descriptor (the check-in page compares against it) */
function Enroll({ c, s, onClose }: { c: Ctx; s: Row; onClose: () => void }) {
    const v = useRef<HTMLVideoElement>(null), [msg, setMsg] = useState('Starting the camera…'), [busy, setBusy] = useState(false), fa = useRef<any>(null), stream = useRef<MediaStream | null>(null);
    useEffect(() => {
        let off = false;
        void (async () => {
            try {
                stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 } } });
                if (off) return; v.current!.srcObject = stream.current; await v.current!.play();
                setMsg('Loading face models (first time takes a moment)…');
                const m = await import(/* @vite-ignore */ `${FACE}/dist/face-api.esm.js`);
                for (const n of ['tinyFaceDetector', 'faceLandmark68Net', 'faceRecognitionNet']) await m.nets[n].loadFromUri(`${FACE}/model/`);
                fa.current = m; setMsg(`Ask ${s.name} to look straight at the camera, in good light, then press Capture.`);
            } catch (e: any) { setMsg('Camera / models not available: ' + (e.message || e)); }
        })();
        return () => { off = true; stream.current?.getTracks().forEach(t => t.stop()); };
    }, []);   // eslint-disable-line react-hooks/exhaustive-deps
    async function capture() {
        const m = fa.current; if (!m) return; setBusy(true);
        try {
            const opt = new m.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }), got: Float32Array[] = [];
            for (let i = 0; i < 3; i++) { setMsg(`Look ${i + 1} of 3…`); const r = await m.detectSingleFace(v.current, opt).withFaceLandmarks().withFaceDescriptor(); if (r) got.push(r.descriptor); await new Promise(x => setTimeout(x, 900)); }
            if (got.length < 2) { setMsg('No clear face — better light, face the camera, try again.'); return; }
            const avg = Array.from({ length: 128 }, (_, i) => got.reduce((n, d) => n + d[i], 0) / got.length);
            const cv = document.createElement('canvas'); cv.width = v.current!.videoWidth; cv.height = v.current!.videoHeight; cv.getContext('2d')!.drawImage(v.current!, 0, 0);
            const photo = await shrink(await new Promise<Blob>(r => cv.toBlob(b => r(b!), 'image/jpeg', 0.85)), 360);
            c.setD({ ...c.D, ...(await c.api('POST', `/api/hr/staff/${s.id}/face`, { descriptor: avg, photo })) });
            onClose();
        } catch (e: any) { setMsg(e.message); } finally { setBusy(false); }
    }
    return <Dialog open onOpenChange={onClose}><DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>📸 Enroll the face of {s.name}</DialogTitle><DialogDescription>Only the person themself, in person. Tell them their photo is kept for attendance only.</DialogDescription></DialogHeader>
        <video ref={v} playsInline muted className="aspect-[3/4] w-full -scale-x-100 rounded-xl bg-black object-cover" />
        <p className="text-sm">{msg}</p>
        <Button disabled={busy || !fa.current} onClick={() => void capture()}>{busy ? 'Capturing…' : '📸 Capture'}</Button>
    </DialogContent></Dialog>;
}

/* ------------------------------ attendance / timesheet ------------------------------ */
function Attendance(c: Ctx) {
    const [who, setWho] = useState(0), [add, setAdd] = useState<Row | null>(null), [open, setOpen] = useState<string | null>(null);
    const selfie = useSelfie(c.api);
    const days = daysBetween(c.range.from, c.range.to > c.today ? c.today : c.range.to);
    const lines = useMemo(() => days.flatMap(d => c.staff.filter(s => (who ? s.id === who : s.active)).map(s => dayLine(s, d, c.punches, c.roster, c.shifts, c.leaves))).filter(l => l.status !== 'off' || l.ins.length), [days.join(), who, c.punches, c.roster, c.leaves, c.staff]);   // eslint-disable-line react-hooks/exhaustive-deps
    const per = new Map<number, Row>();
    for (const l of lines) { const p = per.get(l.staff.id) || { s: l.staff, days: 0, absent: 0, late: 0, lateMin: 0, worked: 0, ot: 0, leave: 0 }; if (l.ins.length) p.days++; if (l.status === 'absent') p.absent++; if (l.late) { p.late++; p.lateMin += l.late; } p.worked += l.worked; p.ot += l.ot; if (l.status === 'leave') p.leave++; per.set(l.staff.id, p); }
    const ot = c.D.settings.otRate || 1.5, hourly = (s: Row) => (Number(s.wage) || 0) / 30 / 8;
    return (
        <div className="grid gap-3">
            <div className="flex flex-wrap items-end gap-2">
                <label className="grid gap-1 text-xs font-semibold">From<Input type="date" value={c.range.from} onChange={e => c.setRange({ ...c.range, from: e.target.value })} /></label>
                <label className="grid gap-1 text-xs font-semibold">To<Input type="date" value={c.range.to} onChange={e => c.setRange({ ...c.range, to: e.target.value })} /></label>
                <label className="grid gap-1 text-xs font-semibold">Person<select className={sel} value={who} onChange={e => setWho(Number(e.target.value))}><option value={0}>Everyone</option>{c.staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
                <Button variant="outline" onClick={() => csv(`timesheet_${c.range.from}_${c.range.to}.csv`, [['Date', 'Name', 'Shift', 'In', 'Out', 'Worked', 'Late min', 'Early min', 'Overtime', 'Status', 'Flags'], ...lines.map(l => [l.day, l.staff.name, l.shift?.name || '', l.first, l.last, hm(l.worked), l.late, l.early, hm(l.ot), STATUS[l.status][0], l.flags.join(' ')])])}>⬇️ CSV</Button>
                {c.can && <Button variant="outline" onClick={() => setAdd({ kind: 'in', at: saudiNow() })}>✍️ Add a missed punch</Button>}
            </div>
            <Card className="overflow-x-auto p-0"><table className="w-full text-sm">
                <thead className="bg-muted/60 text-left"><tr><th className="p-2">Person</th><th className="p-2 text-right">Days</th><th className="p-2 text-right">Absent</th><th className="p-2 text-right">Late (times · min)</th><th className="p-2 text-right">Worked</th><th className="p-2 text-right">Overtime</th><th className="p-2 text-right">Leave days</th><th className="p-2 text-right">Overtime pay (×{ot})</th></tr></thead>
                <tbody>{[...per.values()].map(p => <tr key={p.s.id} className="border-t"><td className="p-2"><span className="flex items-center gap-2"><Face s={p.s} cls="size-7" />{p.s.name}</span></td><td className="p-2 text-right">{p.days}</td><td className="p-2 text-right">{p.absent}</td><td className="p-2 text-right">{p.late} · {p.lateMin}</td><td className="p-2 text-right">{hm(p.worked)}</td><td className="p-2 text-right">{hm(p.ot)}</td><td className="p-2 text-right">{p.leave}</td><td className="p-2 text-right">{p.s.wage ? `${(hourly(p.s) * ot * p.ot / 60).toFixed(2)} SAR` : '—'}</td></tr>)}</tbody>
            </table></Card>
            <Card className="overflow-x-auto p-0"><table className="w-full text-sm">
                <thead className="bg-muted/60 text-left"><tr><th className="p-2">Day</th><th className="p-2">Person</th><th className="p-2">Shift</th><th className="p-2">In</th><th className="p-2">Out</th><th className="p-2 text-right">Worked</th><th className="p-2 text-right">Late</th><th className="p-2 text-right">Early</th><th className="p-2 text-right">OT</th><th className="p-2">Status</th><th className="p-2">Checks</th></tr></thead>
                <tbody>{lines.slice().reverse().map(l => { const k = `${l.day}|${l.staff.id}`; const all = c.punches.filter(p => p.staff_id === l.staff.id && p.day === l.day); return [
                    <tr key={k} className="cursor-pointer border-t hover:bg-accent/40" onClick={() => setOpen(open === k ? null : k)}>
                        <td className="p-2 whitespace-nowrap">{fmtDay(l.day)}</td><td className="p-2">{l.staff.name}</td><td className="p-2">{l.shift ? `${l.shift.start}–${l.shift.end}` : '—'}</td><td className="p-2">{l.first || '—'}</td><td className="p-2">{l.last || '—'}</td>
                        <td className="p-2 text-right">{hm(l.worked)}</td><td className={cn('p-2 text-right', l.late && 'font-semibold text-amber-700')}>{l.late || ''}</td><td className={cn('p-2 text-right', l.early && 'text-amber-700')}>{l.early || ''}</td><td className="p-2 text-right">{l.ot ? hm(l.ot) : ''}</td>
                        <td className="p-2"><span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', STATUS[l.status][1])}>{STATUS[l.status][0]}</span></td>
                        <td className="p-2 text-xs text-red-700">{[...l.flags.map(f => FLAG[f] || f), l.refused ? `❌ ${l.refused} refused` : ''].filter(Boolean).join(' · ')}</td></tr>,
                    open === k && <tr key={k + 'x'} className="bg-muted/30"><td colSpan={11} className="p-2"><div className="flex flex-wrap gap-2">{all.map(p => <span key={p.id} className={cn('flex items-center gap-2 rounded-lg border bg-card px-2 py-1 text-xs', p.kind === 'refused' && 'border-red-300')}>
                        <b>{p.kind.toUpperCase()}</b> {p.at.slice(11, 16)} · {p.source}{p.dist != null ? ` · ${p.dist} m` : ''}{p.face_dist != null ? ` · face ${p.face_dist}` : ''}{p.note ? ` · ${p.note}` : ''}
                        {p.has_selfie ? <button type="button" className="text-primary underline" onClick={() => void selfie.open(p.id)}>selfie</button> : null}
                        {c.can && p.source === 'manual' && <button type="button" className="text-destructive" onClick={async () => { await c.api('DELETE', `/api/hr/attendance/${p.id}`); await c.reload(); }}>✕</button>}</span>)}{!all.length && <span className="text-xs text-muted-foreground">No punches.</span>}</div></td></tr>]; })}</tbody>
            </table></Card>
            {add && <Dialog open onOpenChange={() => setAdd(null)}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Add a missed punch</DialogTitle><DialogDescription>Kept as “entered by a manager”, with your reason.</DialogDescription></DialogHeader>
                <select className={sel} value={add.staff_id ?? ''} onChange={e => setAdd({ ...add, staff_id: Number(e.target.value) })}><option value="">Person…</option>{c.active.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                <select className={sel} value={add.kind} onChange={e => setAdd({ ...add, kind: e.target.value })}><option value="in">IN</option><option value="out">OUT</option></select>
                <Input type="datetime-local" value={add.at} onChange={e => setAdd({ ...add, at: e.target.value })} />
                <Input placeholder="Reason (required)" value={add.note ?? ''} onChange={e => setAdd({ ...add, note: e.target.value })} />
                {add.err && <p className="text-sm text-destructive">{add.err}</p>}
                <Button onClick={async () => { try { await c.api('POST', '/api/hr/attendance', { site: c.siteId, ...add }); setAdd(null); await c.reload(); } catch (e: any) { setAdd({ ...add, err: e.message }); } }}>Save</Button></DialogContent></Dialog>}
            {selfie.node}
        </div>
    );
}

/* ------------------------------ roster ------------------------------ */
function Roster(c: Ctx) {
    const [start, setStart] = useState(() => { const t = c.today; return addDays(t, -dow(t)); });
    const days = daysBetween(start, addDays(start, 6));
    const [edits, setEdits] = useState<Map<string, number | null | undefined>>(new Map()), [msg, setMsg] = useState('');
    const cur = (d: string, s: Row) => { const k = `${d}|${s.id}`; if (edits.has(k)) { const v = edits.get(k); return v === undefined ? shiftOf(s, d, new Map(), c.shifts)?.id ?? 'off' : v ?? 'off'; } return c.roster.has(k) ? (c.roster.get(k) ?? 'off') : (shiftOf(s, d, new Map(), c.shifts)?.id ?? 'off'); };
    async function save(list = edits) {
        const entries = [...list].map(([k, v]) => { const [day, id] = k.split('|'); return { day, staff_id: Number(id), shift_id: v }; });
        await c.api('PUT', '/api/hr/schedule', { site: c.siteId, entries }); setEdits(new Map()); setMsg(`Saved ${entries.length} change(s).`); await c.reload();
    }
    async function copyLast() {
        const m = new Map<string, number | null | undefined>();
        for (const s of c.active) for (const d of days) { const k = `${addDays(d, -7)}|${s.id}`; if (c.roster.has(k)) m.set(`${d}|${s.id}`, c.roster.get(k) ?? null); }
        if (!m.size) { setMsg('Last week has no roster changes to copy.'); return; }
        await save(m);
    }
    return (
        <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2"><Button variant="outline" onClick={() => setStart(addDays(start, -7))}>◀</Button><b>{fmtDay(days[0])} – {fmtDay(days[6])}</b><Button variant="outline" onClick={() => setStart(addDays(start, 7))}>▶</Button>
                {c.can && <><Button disabled={!edits.size} onClick={() => void save()}>Save roster ({edits.size})</Button><Button variant="outline" onClick={() => void copyLast()}>Copy last week</Button></>}<span className="text-sm text-muted-foreground">{msg}</span></div>
            <p className="text-xs text-muted-foreground">Each person works their usual shift on its weekdays unless changed here. Choose “off” for a day off.</p>
            <Card className="overflow-x-auto p-0"><table className="w-full text-sm">
                <thead className="bg-muted/60"><tr><th className="p-2 text-left">Person</th>{days.map(d => <th key={d} className={cn('p-2', d === c.today && 'bg-primary/10')}>{fmtDay(d)}</th>)}</tr></thead>
                <tbody>{c.active.map(s => <tr key={s.id} className="border-t"><td className="p-2"><span className="flex items-center gap-2"><Face s={s} cls="size-7" />{s.name}</span></td>
                    {days.map(d => { const v = cur(d, s), sh = c.shifts.find(x => x.id === v), lv = c.leaves.find(l => l.staff_id === s.id && l.status === 'approved' && l.from_day <= d && l.to_day >= d);
                        return <td key={d} className="p-1 text-center" style={{ background: sh ? sh.color + '22' : undefined }}>{lv ? <span className="text-xs font-semibold text-sky-700">🤒 {lv.type}</span>
                            : <select disabled={!c.can} className="h-8 w-full rounded border bg-background px-1 text-xs" value={String(v)} onChange={e => setEdits(m => new Map(m).set(`${d}|${s.id}`, e.target.value === 'off' ? null : Number(e.target.value)))}>
                                <option value="off">off</option>{c.shifts.map(x => <option key={x.id} value={x.id}>{x.name} {x.start}</option>)}</select>}</td>; })}</tr>)}</tbody>
            </table></Card>
        </div>
    );
}

/* ------------------------------ leave ------------------------------ */
function Leave(c: Ctx) {
    const [add, setAdd] = useState<Row | null>(null), [photo, setPhoto] = useState<string | null>(null);
    const name = (id: number) => c.staff.find(s => s.id === id)?.name || '—';
    const year = c.today.slice(0, 4), annual = c.D.settings.annualDays ?? 21;
    const list = [...c.leaves].sort((a, b) => (a.status === 'pending' ? -1 : 0) - (b.status === 'pending' ? -1 : 0));
    const decide = async (l: Row, status: string) => { await c.api('PUT', `/api/hr/leaves/${l.id}`, { status }); await c.reload(); };
    return (
        <div className="grid gap-3">
            <div className="flex flex-wrap gap-2">{c.can && <Button onClick={() => setAdd({ type: 'annual', from_day: c.today, to_day: c.today, approved: true })}>➕ Add leave</Button>}
                <span className="text-sm text-muted-foreground">Annual leave: {annual} days a year each (Settings).</span></div>
            <Card className="overflow-x-auto p-0"><table className="w-full text-sm">
                <thead className="bg-muted/60 text-left"><tr><th className="p-2">Person</th><th className="p-2">Type</th><th className="p-2">Dates</th><th className="p-2 text-right">Days</th><th className="p-2">Reason</th><th className="p-2">Annual left</th><th className="p-2">Status</th><th className="p-2" /></tr></thead>
                <tbody>{list.map(l => <tr key={l.id} className={cn('border-t', l.status === 'pending' && 'bg-amber-50 dark:bg-amber-950/30')}>
                    <td className="p-2">{name(l.staff_id)}</td><td className="p-2">{l.type}</td><td className="p-2 whitespace-nowrap">{fmtDay(l.from_day)}{l.to_day !== l.from_day ? ` – ${fmtDay(l.to_day)}` : ''}</td><td className="p-2 text-right">{l.days}</td>
                    <td className="p-2">{l.reason}{l.has_photo ? <button type="button" className="ml-1 text-primary underline" onClick={async () => setPhoto((await c.api('GET', `/api/hr/leaves/${l.id}/photo`)).photo)}>📎 note</button> : null}<small className="block text-muted-foreground">{l.via === 'worker' ? 'asked on the check-in page' : 'entered by a manager'}</small></td>
                    <td className="p-2">{annual - annualTaken(c.leaves, l.staff_id, year)}</td>
                    <td className="p-2"><Badge variant={l.status === 'approved' ? 'default' : 'outline'}>{l.status}</Badge>{l.decided_by && <small className="block text-muted-foreground">{l.decided_by}</small>}</td>
                    <td className="p-2 whitespace-nowrap">{c.can && l.status === 'pending' && <><Button size="sm" onClick={() => void decide(l, 'approved')}>✔ Approve</Button> <Button size="sm" variant="outline" onClick={() => void decide(l, 'rejected')}>✖ Refuse</Button></>}
                        {c.can && l.status === 'approved' && <Button size="sm" variant="ghost" onClick={() => void decide(l, 'cancelled')}>Cancel</Button>}</td></tr>)}</tbody>
            </table></Card>
            {add && <Dialog open onOpenChange={() => setAdd(null)}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Add leave</DialogTitle></DialogHeader>
                <select className={sel} value={add.staff_id ?? ''} onChange={e => setAdd({ ...add, staff_id: Number(e.target.value) })}><option value="">Person…</option>{c.active.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                <select className={sel} value={add.type} onChange={e => setAdd({ ...add, type: e.target.value })}>{['annual', 'sick', 'emergency', 'unpaid', 'other'].map(t => <option key={t}>{t}</option>)}</select>
                <div className="grid grid-cols-2 gap-2"><Input type="date" value={add.from_day} onChange={e => setAdd({ ...add, from_day: e.target.value })} /><Input type="date" value={add.to_day} onChange={e => setAdd({ ...add, to_day: e.target.value })} /></div>
                <Input placeholder="Reason" value={add.reason ?? ''} onChange={e => setAdd({ ...add, reason: e.target.value })} />
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!add.approved} onChange={e => setAdd({ ...add, approved: e.target.checked })} />Approved</label>
                {add.err && <p className="text-sm text-destructive">{add.err}</p>}
                <Button onClick={async () => { try { await c.api('POST', '/api/hr/leaves', { site: c.siteId, ...add }); setAdd(null); await c.reload(); } catch (e: any) { setAdd({ ...add, err: e.message }); } }}>Save</Button></DialogContent></Dialog>}
            {photo && <Dialog open onOpenChange={() => setPhoto(null)}><DialogContent><img src={photo} alt="Note" className="w-full rounded-xl" /></DialogContent></Dialog>}
        </div>
    );
}

/* ------------------------------ tasks ------------------------------ */
function Tasks(c: Ctx) {
    const [day, setDay] = useState(c.today), [form, setForm] = useState<Row | null>(null), [photo, setPhoto] = useState<string | null>(null);
    const list = c.tasks.filter(t => t.day === day);
    const name = (id: number) => c.staff.find(s => s.id === id)?.name || '?';
    const act = async (t: Row, action: string) => { await c.api('PUT', `/api/hr/tasks/${t.id}`, { action }); await c.reload(); };
    const cols: [string, string][] = [['open', 'To do'], ['started', 'Started'], ['done', 'Done — check it'], ['verified', 'Checked ✔']];
    const took = (t: Row) => (t.started_at && t.done_at ? Math.round((Date.parse(t.done_at + ':00Z') - Date.parse(t.started_at + ':00Z')) / 60000) : null);
    return (
        <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2"><Button variant="outline" onClick={() => setDay(addDays(day, -1))}>◀</Button><Input type="date" className="w-44" value={day} onChange={e => setDay(e.target.value || day)} /><Button variant="outline" onClick={() => setDay(addDays(day, 1))}>▶</Button>
                {c.can && <Button className="ml-auto" onClick={() => setForm({ day, days: [day], staff_ids: [], priority: 'normal', checklist: [] })}>➕ New task</Button>}</div>
            <div className="grid gap-3 lg:grid-cols-4">{cols.map(([k, l]) => <Card key={k} className="content-start gap-2 bg-muted/30 p-2"><b className="px-1 text-sm">{l} ({list.filter(t => t.status === k).length})</b>
                {list.filter(t => t.status === k).map(t => <div key={t.id} className={cn('grid gap-1 rounded-lg border bg-card p-2 text-sm', t.priority === 'high' && 'border-red-300')}>
                    <b>{t.title}</b>{t.title_local && <span className="text-muted-foreground">{t.title_local}</span>}
                    <small className="text-muted-foreground">{[t.place && '📍 ' + t.place, t.due && '⏰ ' + t.due, t.minutes && `⌛ ${t.minutes} min`].filter(Boolean).join(' · ')}</small>
                    <small>👷 {t.staff_ids.map(name).join(', ') || '—'}</small>
                    {(t.started_at || t.done_at) && <small className="text-muted-foreground">{t.started_at ? `started ${t.started_at.slice(11)}` : ''}{t.done_at ? ` · done ${t.done_at.slice(11)}` : ''}{took(t) != null ? ` · took ${took(t)} min${t.minutes && took(t)! > t.minutes ? ' ⚠' : ''}` : ''}</small>}
                    {t.note && <small className="text-red-700">💬 {t.note}</small>}
                    <span className="flex flex-wrap gap-1">{t.has_photo ? <Button size="sm" variant="outline" onClick={async () => setPhoto((await c.api('GET', `/api/hr/tasks/${t.id}/photo`)).photo)}>📷 photo</Button> : null}
                        {c.can && t.status === 'done' && <><Button size="sm" onClick={() => void act(t, 'verify')}>✔ OK</Button><Button size="sm" variant="outline" onClick={() => void act(t, 'redo')}>↺ Redo</Button></>}
                        {c.can && <Button size="sm" variant="ghost" onClick={() => setForm({ ...t, days: [t.day] })}>✏️</Button>}
                        {c.can && <Button size="sm" variant="ghost" className="text-destructive" onClick={async () => { if (await c.confirm({ title: 'Delete this task?', confirmLabel: 'Delete' })) { await c.api('DELETE', `/api/hr/tasks/${t.id}`); await c.reload(); } }}>🗑</Button>}</span>
                </div>)}</Card>)}</div>
            {form && <TaskForm c={c} t={form} onClose={() => setForm(null)} />}
            {photo && <Dialog open onOpenChange={() => setPhoto(null)}><DialogContent><img src={photo} alt="Proof" className="w-full rounded-xl" /></DialogContent></Dialog>}
        </div>
    );
}
function TaskForm({ c, t, onClose }: { c: Ctx; t: Row; onClose: () => void }) {
    const [f, setF] = useState<Row>({ ...t, checklistText: (t.checklist || []).join('\n'), repeatTo: '' }), [err, setErr] = useState('');
    const set = (k: string, v: unknown) => setF(p => ({ ...p, [k]: v }));
    const role = (id: number) => c.roles.find(r => r.id === id);
    async function save() {
        const days = f.id ? [f.day] : f.repeatTo && f.repeatTo > f.day ? daysBetween(f.day, f.repeatTo) : [f.day];
        const b = { site: c.siteId, ...f, days, checklist: String(f.checklistText || '').split('\n').map((x: string) => x.trim()).filter(Boolean) };
        try { if (f.id) await c.api('PUT', `/api/hr/tasks/${f.id}`, b); else await c.api('POST', '/api/hr/tasks', b); await c.reload(); onClose(); } catch (e: any) { setErr(e.message); }
    }
    return <Dialog open onOpenChange={onClose}><DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader><DialogTitle>{f.id ? 'Edit task' : 'New task'}</DialogTitle><DialogDescription>Write it short. Add the Bangla words if you can — the check-in page shows them first.</DialogDescription></DialogHeader>
        <div className="grid gap-2">
            <Input placeholder="Task (English), e.g. Clean the 7th floor corridor" value={f.title ?? ''} onChange={e => set('title', e.target.value)} />
            <Input placeholder="Task (Bangla)" value={f.title_local ?? ''} onChange={e => set('title_local', e.target.value)} />
            <div className="grid grid-cols-2 gap-2"><Input placeholder="Where (📍 place)" value={f.place ?? ''} onChange={e => set('place', e.target.value)} /><Input type="time" value={f.due ?? ''} onChange={e => set('due', e.target.value)} /></div>
            <div className="grid grid-cols-3 gap-2"><label className="grid gap-1 text-xs font-semibold">Day<Input type="date" value={f.day} onChange={e => set('day', e.target.value)} /></label>
                {!f.id && <label className="grid gap-1 text-xs font-semibold">Repeat daily until<Input type="date" value={f.repeatTo} onChange={e => set('repeatTo', e.target.value)} /></label>}
                <label className="grid gap-1 text-xs font-semibold">Minutes it should take<Input type="number" min={0} value={f.minutes ?? ''} onChange={e => set('minutes', Number(e.target.value))} /></label></div>
            <div className="flex flex-wrap gap-3 text-sm"><select className={sel} value={f.priority} onChange={e => set('priority', e.target.value)}><option value="high">⚠ Urgent</option><option value="normal">Normal</option><option value="low">Low</option></select>
                <label className="flex items-center gap-2"><input type="checkbox" checked={!!f.need_photo} onChange={e => set('need_photo', e.target.checked)} />📷 Photo when done</label></div>
            <Textarea placeholder="Details" value={f.details ?? ''} onChange={e => set('details', e.target.value)} />
            <Textarea placeholder="Checklist — one step a line" value={f.checklistText} onChange={e => set('checklistText', e.target.value)} />
            <div className="grid gap-1"><b className="text-xs">Who does it</b><div className="flex flex-wrap gap-1.5">{c.active.map(s => { const on = f.staff_ids.includes(s.id); return <button key={s.id} type="button" onClick={() => set('staff_ids', on ? f.staff_ids.filter((x: number) => x !== s.id) : [...f.staff_ids, s.id])}
                className={cn('flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs', on && 'border-primary bg-primary/10 font-semibold')}><Face s={s} cls="size-5" />{s.name}{role(s.role_id) ? ` · ${role(s.role_id)!.title}` : ''}</button>; })}</div></div>
            {!f.id && c.roles.length > 0 && <div className="text-xs"><b>From a job role's duties:</b> {c.roles.map(r => <button key={r.id} type="button" className="ml-1 text-primary underline" onClick={() => set('checklistText', (r.duties || []).join('\n'))}>{r.title}</button>)}</div>}
        </div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => void save()}>Save</Button></div>
    </DialogContent></Dialog>;
}

/* ------------------------------ roles & shifts ------------------------------ */
function Setup(c: Ctx) {
    const [sh, setSh] = useState<Row | null>(null), [ro, setRo] = useState<Row | null>(null);
    const saveShift = async () => { const r = sh!.id ? await c.api('PUT', `/api/hr/shifts/${sh!.id}`, sh) : await c.api('POST', '/api/hr/shifts', { site: c.siteId, ...sh }); c.setD({ ...c.D, ...r }); setSh(null); };
    const saveRole = async () => { const b = { ...ro, duties: String(ro!.dutiesText || '').split('\n').map((x: string) => x.trim()).filter(Boolean) }; const r = ro!.id ? await c.api('PUT', `/api/hr/roles/${ro!.id}`, b) : await c.api('POST', '/api/hr/roles', { site: c.siteId, ...b }); c.setD({ ...c.D, ...r }); setRo(null); };
    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <Card className="content-start gap-2 p-4"><div className="flex items-center justify-between"><h2 className="font-bold">Shifts</h2>{c.can && <Button size="sm" onClick={() => setSh({ name: 'Morning', start: '07:00', end: '15:00', break_min: 60, grace_min: 10, days: [0, 1, 2, 3, 4, 6], color: '#2563eb' })}>➕ Shift</Button>}</div>
                {c.shifts.map(s => <div key={s.id} className="flex items-center gap-2 rounded-lg border p-2 text-sm"><span className="size-4 rounded" style={{ background: s.color }} /><b>{s.name}</b><span>{s.start}–{s.end}</span><span className="text-muted-foreground">break {s.break_min} · grace {s.grace_min} min · {s.days.map(d => DOW[d]).join(' ')}</span>
                    {c.can && <span className="ml-auto flex gap-1"><Button size="sm" variant="ghost" onClick={() => setSh(s)}>✏️</Button><Button size="sm" variant="ghost" onClick={async () => c.setD({ ...c.D, ...(await c.api('DELETE', `/api/hr/shifts/${s.id}`)) })}>🗑</Button></span>}</div>)}
                {!c.shifts.length && <p className="text-sm text-muted-foreground">No shifts yet.</p>}</Card>
            <Card className="content-start gap-2 p-4"><div className="flex items-center justify-between"><h2 className="font-bold">Job roles and their duties</h2>{c.can && <Button size="sm" onClick={() => setRo({ title: '', duties: [], dutiesText: '' })}>➕ Role</Button>}</div>
                {c.roles.map(r => <div key={r.id} className="grid gap-1 rounded-lg border p-2 text-sm"><span className="flex items-center gap-2"><b>{r.title}</b>{r.title_local && <span className="text-muted-foreground">{r.title_local}</span>}
                    {c.can && <span className="ml-auto flex gap-1"><Button size="sm" variant="ghost" onClick={() => setRo({ ...r, dutiesText: (r.duties || []).join('\n') })}>✏️</Button><Button size="sm" variant="ghost" onClick={async () => c.setD({ ...c.D, ...(await c.api('DELETE', `/api/hr/roles/${r.id}`)) })}>🗑</Button></span>}</span>
                    {(r.duties || []).length > 0 && <ul className="list-disc pl-5 text-muted-foreground">{r.duties.map((d: string, i: number) => <li key={i}>{d}</li>)}</ul>}
                    <small className="text-muted-foreground">{c.staff.filter(s => s.role_id === r.id && s.active).length} people</small></div>)}
                {!c.roles.length && <p className="text-sm text-muted-foreground">E.g. Room cleaner, Laundry, Kitchen helper, Driver, Security — each with its daily duties (they become task checklists).</p>}</Card>
            {sh && <Dialog open onOpenChange={() => setSh(null)}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Shift</DialogTitle></DialogHeader>
                <Input value={sh.name} onChange={e => setSh({ ...sh, name: e.target.value })} placeholder="Name" />
                <div className="grid grid-cols-2 gap-2"><label className="grid gap-1 text-xs">Start<Input type="time" value={sh.start} onChange={e => setSh({ ...sh, start: e.target.value })} /></label><label className="grid gap-1 text-xs">End<Input type="time" value={sh.end} onChange={e => setSh({ ...sh, end: e.target.value })} /></label>
                    <label className="grid gap-1 text-xs">Break (min)<Input type="number" value={sh.break_min} onChange={e => setSh({ ...sh, break_min: Number(e.target.value) })} /></label><label className="grid gap-1 text-xs">Grace before “late” (min)<Input type="number" value={sh.grace_min} onChange={e => setSh({ ...sh, grace_min: Number(e.target.value) })} /></label></div>
                <div className="flex flex-wrap gap-1">{DOW.map((d, i) => <button key={d} type="button" className={cn('rounded border px-2 py-1 text-xs', sh.days.includes(i) && 'border-primary bg-primary/10 font-bold')} onClick={() => setSh({ ...sh, days: sh.days.includes(i) ? sh.days.filter((x: number) => x !== i) : [...sh.days, i] })}>{d}</button>)}</div>
                <label className="flex items-center gap-2 text-sm">Colour <input type="color" value={sh.color} onChange={e => setSh({ ...sh, color: e.target.value })} /></label>
                <Button onClick={() => void saveShift()}>Save</Button></DialogContent></Dialog>}
            {ro && <Dialog open onOpenChange={() => setRo(null)}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>Job role</DialogTitle></DialogHeader>
                <Input value={ro.title} onChange={e => setRo({ ...ro, title: e.target.value })} placeholder="Title, e.g. Room cleaner" />
                <Input value={ro.title_local ?? ''} onChange={e => setRo({ ...ro, title_local: e.target.value })} placeholder="Title (Bangla)" />
                <Textarea className="min-h-40" value={ro.dutiesText} onChange={e => setRo({ ...ro, dutiesText: e.target.value })} placeholder={'Duties — one a line, e.g.\nMake the beds\nEmpty the bins\nClean the bathroom'} />
                <Input value={ro.skills ?? ''} onChange={e => setRo({ ...ro, skills: e.target.value })} placeholder="Skills needed" />
                <Button onClick={() => void saveRole()}>Save</Button></DialogContent></Dialog>}
        </div>
    );
}

/* ------------------------------ settings and the public link ------------------------------ */
function Settings(c: Ctx) {
    const s = c.D.settings;
    const [f, setF] = useState<Row>({ lat: s.geo.lat ?? '', lng: s.geo.lng ?? '', radius: s.geo.radius ?? 200, code: s.geo.code ?? '', faceMax: s.faceMax, annualDays: s.annualDays, otRate: s.otRate }), [msg, setMsg] = useState('');
    const save = async () => { try { c.setD({ ...c.D, ...(await c.api('PUT', '/api/hr/settings', { site: c.siteId, geo: { lat: f.lat, lng: f.lng, radius: f.radius, code: f.code }, faceMax: f.faceMax, annualDays: f.annualDays, otRate: f.otRate })) }); setMsg('Saved.'); } catch (e: any) { setMsg(e.message); } };
    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <Card className="content-start gap-3 p-4"><h2 className="font-bold">📍 Workplace circle (geofence)</h2>
                <p className="text-sm text-muted-foreground">Check-in works only within this distance of the point. Phones' GPS is usually right to 5–20 m outdoors, worse indoors — 200 m is a safe circle for a building.</p>
                <div className="grid grid-cols-2 gap-2"><label className="grid gap-1 text-xs font-semibold">Latitude<Input value={f.lat} onChange={e => setF({ ...f, lat: e.target.value })} /></label><label className="grid gap-1 text-xs font-semibold">Longitude<Input value={f.lng} onChange={e => setF({ ...f, lng: e.target.value })} /></label>
                    <label className="grid gap-1 text-xs font-semibold">Radius (m)<Input type="number" value={f.radius} onChange={e => setF({ ...f, radius: Number(e.target.value) })} /></label><label className="grid gap-1 text-xs font-semibold">Plus code / note<Input value={f.code} onChange={e => setF({ ...f, code: e.target.value })} /></label></div>
                <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => navigator.geolocation.getCurrentPosition(p => setF(x => ({ ...x, lat: Number(p.coords.latitude.toFixed(6)), lng: Number(p.coords.longitude.toFixed(6)) })), e => setMsg(e.message), { enableHighAccuracy: true })}>📍 Use where I am now</Button>
                    {f.lat && f.lng && <a className="text-sm text-primary underline" href={`https://www.google.com/maps?q=${f.lat},${f.lng}`} target="_blank" rel="noopener">Check on the map ↗</a>}</div>
                <h2 className="mt-2 font-bold">Rules</h2>
                <label className="grid gap-1 text-xs font-semibold">Face match strictness (lower = stricter; 0.5 is standard)<Input type="number" step={0.01} min={0.35} max={0.65} value={f.faceMax} onChange={e => setF({ ...f, faceMax: Number(e.target.value) })} /></label>
                <div className="grid grid-cols-2 gap-2"><label className="grid gap-1 text-xs font-semibold">Annual leave days a year<Input type="number" value={f.annualDays} onChange={e => setF({ ...f, annualDays: Number(e.target.value) })} /></label>
                    <label className="grid gap-1 text-xs font-semibold">Overtime pay rate (× hourly)<Input type="number" step={0.25} value={f.otRate} onChange={e => setF({ ...f, otRate: Number(e.target.value) })} /></label></div>
                <p className="text-xs text-muted-foreground">Saudi Labour Law: at least 21 days' annual leave (30 after 5 years), overtime paid at the hourly wage plus 50% (×1.5), normally up to 8 hours a day / 48 a week.</p>
                {c.can && <Button onClick={() => void save()}>Save settings</Button>}<span className="text-sm text-muted-foreground">{msg}</span></Card>
            <Card className="content-start gap-3 p-4"><h2 className="font-bold">📱 The check-in page</h2><PublicLink siteId={c.siteId} big />
                <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground"><li>Add each person on Staff, take their photo and <b>Enroll face</b> (in person, good light).</li><li>Press <b>Give PIN</b> and print their card.</li><li>Put the QR poster at the staff entrance. They open it on their own phone (or a phone at the gate), type the PIN, look and blink.</li><li>Refused attempts (wrong face, no blink, outside the circle) are kept with the selfie on Attendance.</li></ol>
                <p className="text-xs text-muted-foreground">Faces and selfies are personal data: tell staff what is taken and why (attendance only), keep it to that, and remove people when they leave.</p></Card>
        </div>
    );
}
function PublicLink({ siteId, big }: { siteId: string; big?: boolean }) {
    const url = new URL(`hr/?site=${siteId}`, location.href.split('#')[0]).href;
    const [svg, setSvg] = useState('');
    useEffect(() => {
        if (!big) return;
        const draw = () => { const q = (window as any).qrcode(0, 'M'); q.addData(url); q.make(); setSvg(q.createSvgTag({ cellSize: 6, margin: 2 })); };
        if ((window as any).qrcode) draw(); else { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js'; s.onload = draw; document.head.appendChild(s); }
    }, [big, url]);
    const poster = () => { const w = window.open('', '_blank'); if (!w) return; w.document.write(`<html><body style="font-family:system-ui;text-align:center;padding:40px"><h1 style="font-size:48px;margin:0">হাজিরা · Attendance</h1><p style="font-size:24px">ফোনের ক্যামেরা দিয়ে স্ক্যান করুন<br>Scan with your phone camera</p><div style="display:inline-block;transform:scale(1.6);margin:60px">${svg}</div><p style="font-size:22px">১. আপনার নম্বর দিন · Type your number<br>২. ক্যামেরার দিকে তাকান, পলক ফেলুন · Look and blink<br>৩. কাজের তালিকা দেখুন · See your tasks</p><p style="font-size:14px;color:#555">${url}</p><script>setTimeout(()=>print(),400)<\/script></body></html>`); w.document.close(); };
    if (!big) return <a className="rounded-lg border bg-card px-3 py-2 text-sm font-semibold hover:border-gold" href={url} target="_blank" rel="noopener">📱 Staff check-in page ↗</a>;
    return <div className="grid justify-items-start gap-2"><a className="break-all text-sm text-primary underline" href={url} target="_blank" rel="noopener">{url}</a>
        <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => void navigator.clipboard.writeText(url)}>Copy link</Button>{svg && <Button size="sm" variant="outline" onClick={poster}>🖨 Print QR poster</Button>}</div>
        {svg && <div className="rounded-xl bg-white p-2" dangerouslySetInnerHTML={{ __html: svg }} />}</div>;
}
