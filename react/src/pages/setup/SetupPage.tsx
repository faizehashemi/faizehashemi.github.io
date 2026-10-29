import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useConfirm } from '@/components/ConfirmDialog';
import { usePrompt } from '@/components/PromptDialog';
import { useCore, useGuard, useLoadApp, useLoadCore } from '@/pms/PmsContext';

// Setup: this desk's login and sync; (admin) the rules every desk shares — travel times, KG events, Fakkul Ehraam windows, delayed-departure hold, SH prefixes,
// GL copy colours — then the one-time upload of this browser's old data, and (admin) desk logins, page access and the audit log.

type Row = Record<string, any>;
const SETUP_TABS: [string, string][] = [['desk', 'This desk'], ['stays', 'Stays & travel'], ['groups', 'Groups & colours'], ['data', 'Data'], ['desks', 'Desks & access']];
const when = (iso?: string) => (iso ? new Date(iso).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');
const sel = 'h-9 rounded-md border bg-background px-2 text-sm';
const HEX = /^#[0-9a-f]{6}$/i;
const Msg = ({ children }: { children?: ReactNode }) => <span className="text-sm text-muted-foreground">{children}</span>;

export default function SetupPage() {
    const { cloud, settings: S } = useCore();
    const c = cloud as any, st = S as any;
    const guard = useGuard();
    const loadApp = useLoadApp();
    const loadCore = useLoadCore();
    const { ask: confirm, dialog: confirmDialog } = useConfirm();
    const { ask: prompt, dialog: promptDialog } = usePrompt();
    const me = cloud.currentDesk();
    const isAdmin = me?.role === 'admin';
    const [cfg, setCfg] = useState<{ SITES: Row; VIEWS: Row[]; NAV: Row[] } | null>(null);
    const [dbm, setDbm] = useState<any>(null);
    const [set, setSet] = useState<Row | null>(null);
    const [, tick] = useState(0);
    const [tab, setTab] = useState('desk');
    const label = (s: string) => cfg?.SITES[s]?.label || s;

    useEffect(() => {
        void (async () => {
            const [conf, d] = await Promise.all([loadApp('config.js'), loadCore('db')]);
            setCfg({ SITES: conf.SITES, VIEWS: conf.VIEWS, NAV: conf.NAV }); setDbm(d);
            setSet(await guard<any>(st.loadSettings()));
        })();
        const t = () => tick(n => n + 1);
        window.addEventListener('pms:sync', t); return () => window.removeEventListener('pms:sync', t);
    }, []);   // eslint-disable-line react-hooks/exhaustive-deps
    const reload = async () => setSet(await guard<any>(st.loadSettings()));
    if (!cfg || !set || !me) return <div className="mx-auto max-w-[2400px] p-4 text-sm text-muted-foreground">Loading…</div>;
    const { SITES } = cfg;
    const rights = me.role === 'admin' ? 'change both sites, manage desks' : me.role === 'siteadmin' ? `change ${label(me.site)} slips, manage ${label(me.site)} logins` : me.role === 'desk' ? `change ${label(me.site)} slips, view ${Object.keys(SITES).filter(s => s !== me.site).map(label).join(', ')}` : 'view only';

    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            <PageHeader view="setup" title="Setup" current={SETUP_TABS.find(t => t[0] === tab)?.[1]} />
            <Tabs value={tab} onValueChange={t => { setTab(t); window.scrollTo(0, 0); }} className="gap-3">
                <TabsList variant="underline">{SETUP_TABS.filter(([id]) => id !== 'desks' || isAdmin || me.role === 'siteadmin').map(([id, l]) => <TabsTrigger key={id} value={id}>{l}</TabsTrigger>)}</TabsList>
                <TabsContent value="desk" className="grid gap-3"><ThisDesk me={me} rights={rights} label={label} /></TabsContent>
                <TabsContent value="stays" className="grid gap-3">
                    <Travel set={set} isAdmin={isAdmin} reload={reload} />
                    <Delay set={set} isAdmin={isAdmin} reload={reload} />
                    <ShPrefixes set={set} isAdmin={isAdmin} reload={reload} />
                </TabsContent>
                <TabsContent value="groups" className="grid gap-3">
                    <Kg set={set} isAdmin={isAdmin} reload={reload} />
                    <Fe set={set} isAdmin={isAdmin} reload={reload} />
                    <GlColors set={set} isAdmin={isAdmin} reload={reload} label={label} />
                </TabsContent>
                <TabsContent value="data" className="grid gap-3"><Legacy me={me} isAdmin={isAdmin} dbm={dbm} label={label} confirm={confirm} /></TabsContent>
                {(isAdmin || me.role === 'siteadmin') && <TabsContent value="desks" className="grid gap-3"><Desks cfg={cfg} me={me} label={label} confirm={confirm} prompt={prompt} /></TabsContent>}
            </Tabs>
            {confirmDialog}{promptDialog}
        </div>
    );
}

function ThisDesk({ me: m, rights: rt, label: lb }: { me: Row; rights: string; label: (s: string) => string }) {
    const { cloud } = useCore(); const c = cloud as any;
    const [msg, setMsg] = useState('');
    return <Shell title="This desk"><>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-muted-foreground">Desk</dt><dd>{m.name}</dd><dt className="text-muted-foreground">Site</dt><dd>{lb(m.site)}</dd>
            <dt className="text-muted-foreground">Role</dt><dd>{m.role} <span className="text-muted-foreground">({rt})</span></dd><dt className="text-muted-foreground">Server</dt><dd className="text-xs">{c.apiBase()}</dd>
            <dt className="text-muted-foreground">Connection</dt><dd>{c.state.online ? 'online' : <span className="text-destructive">offline — saving is paused</span>}</dd>
            <dt className="text-muted-foreground">Last sync</dt><dd>{c.state.lastSync ? new Date(c.state.lastSync).toLocaleTimeString() : '—'}</dd></dl>
        <div className="flex items-center gap-3"><Button variant="outline" onClick={async () => { setMsg('Syncing…'); try { await c.sync({ force: true }); setMsg('Up to date.'); } catch (e: any) { setMsg(e.message); } }}>Sync now</Button><Msg>{msg}</Msg></div></></Shell>;
}

type CardProps = { set: Row; isAdmin: boolean; reload: () => Promise<void> };
function Shell({ title, sub, children }: { title: ReactNode; sub?: ReactNode; children: ReactNode }) {
    return <Card><CardHeader><CardTitle className="text-base">{title}</CardTitle>{sub && <p className="text-sm text-muted-foreground">{sub}</p>}</CardHeader><CardContent className="grid gap-3">{children}</CardContent></Card>;
}
function useSaver(reload: () => Promise<void>) {
    const guard = useGuard(); const { settings } = useCore();
    const [msg, setMsg] = useState(''), [busy, setBusy] = useState(false);
    async function run(patch: Row, ok: string) {
        setBusy(true);
        try { await guard((settings as any).saveSettings(patch)); await reload(); setMsg(ok); } catch (e: any) { setMsg(e.status === 404 ? 'The PMS server needs the update (worker.js + schema.sql) before this can be saved.' : e.message || String(e)); } finally { setBusy(false); }
    }
    return { msg, setMsg, busy, run };
}

function Travel({ set, isAdmin, reload }: CardProps) {
    const { settings } = useCore(); const st = settings as any;
    const s = set.settings;
    const [v, setV] = useState({ a: s.arrival_commute_hours, d: s.departure_lead_hours, i: s.transfer_checkin_time, o: s.transfer_checkout_time });
    const { msg, setMsg, busy, run } = useSaver(reload);
    const fmt = (d: string, t: string) => `${new Date(d + 'T00:00').toLocaleDateString([], { day: '2-digit', month: 'short' })} ${t}`;
    const land = st.shiftTime('2026-11-25', '23:00', Number(v.a) || 0), out = st.shiftTime('2026-12-01', '04:30', -(Number(v.d) || 0));
    const num = (k: 'a' | 'd') => <span className="flex items-center gap-1.5"><Input type="number" min={0} max={24} step={0.25} required className="w-24" disabled={!isAdmin} value={v[k]} onChange={e => setV(x => ({ ...x, [k]: e.target.value }))} /> hours</span>;
    return <Shell title={<>Travel times <span className="text-sm font-normal text-muted-foreground">— all sites, every desk</span></>} sub="Slips show hotel times, not flight times. UMS imports use these rules; the same for every desk.">
        <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" onSubmit={e => { e.preventDefault(); void run({ arrival_commute_hours: Number(v.a), departure_lead_hours: Number(v.d), transfer_checkin_time: v.i, transfer_checkout_time: v.o }, 'Saved for every desk. Imported slips get the new times at the next UMS import (desk edits are kept).'); }}>
            <div className="grid gap-1"><Label>After landing, travel to the hotel</Label>{num('a')}</div><div className="grid gap-1"><Label>Before the flight, leave the hotel</Label>{num('d')}</div>
            <div className="grid gap-1"><Label>Moving between cities: check-in at</Label><Input type="time" required disabled={!isAdmin} value={v.i} onChange={e => setV(x => ({ ...x, i: e.target.value }))} /></div>
            <div className="grid gap-1"><Label>Moving between cities: check-out at</Label><Input type="time" required disabled={!isAdmin} value={v.o} onChange={e => setV(x => ({ ...x, o: e.target.value }))} /></div>
            <div className="col-span-full flex items-center gap-3">{isAdmin && <Button type="submit" disabled={busy}>Save travel times</Button>}<Msg>{msg || (set.updated_at ? `Last changed by ${set.updated_by || '—'}, ${when(set.updated_at)}` : 'Using the default times.') + (isAdmin ? '' : ' Only an admin can change these.')}</Msg></div></form>
        <div className="grid gap-1 rounded-lg bg-accent/40 p-3 text-sm"><div>Flight lands <b>{fmt('2026-11-25', '23:00')}</b> → hotel check-in <b>{fmt(land.date, land.time)}</b></div><div>Flight departs <b>{fmt('2026-12-01', '04:30')}</b> → hotel check-out <b>{fmt(out.date, out.time)}</b></div>
            <div>Makkah ⇄ Madina on the day of the move: check-out <b>{v.o}</b>, check-in <b>{v.i}</b></div><div>Arriving or leaving by <b>car, bus or train</b> (UMS "CAR-…" / "BUS-…" / "TRAIN-…"): the UMS time is the hotel time, nothing added or taken off</div></div></Shell>;
}

function Kg({ set, isAdmin, reload }: CardProps) {
    const { settings } = useCore(); const st = settings as any;
    const [kg, setKg] = useState<Row[]>(() => (set.settings.kg_sessions || st.DEFAULTS.kg_sessions).map((x: Row) => ({ ...x })));
    const { msg, setMsg, busy, run } = useSaver(reload);
    return <Shell title={<>KG event times <span className="text-sm font-normal text-muted-foreground">— the events on the KG page, every desk</span></>} sub="The KG page's event list (Fakkul Ehraam, Atraaf…) and their times, used in the copied message.">
        <div className="grid gap-2">{kg.map((s, i) => <div key={i} className="flex items-center gap-2"><Input className="max-w-xs" maxLength={60} placeholder="Event name" aria-label="Event name" disabled={!isAdmin} value={s.name} onChange={e => setKg(k => k.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
            <Input type="time" className="w-32" aria-label="Time" disabled={!isAdmin} value={s.time} onChange={e => setKg(k => k.map((x, j) => (j === i ? { ...x, time: e.target.value } : x)))} />
            {isAdmin ? <Button size="icon" variant="outline" aria-label={`Remove ${s.name}`} disabled={kg.length <= 1} onClick={() => setKg(k => k.filter((_, j) => j !== i))}><X className="size-4" /></Button> : <Msg>{st.to12h(s.time)}</Msg>}</div>)}</div>
        {isAdmin ? <div className="flex flex-wrap items-center gap-2"><Button variant="outline" disabled={kg.length >= 10} onClick={() => setKg(k => [...k, { name: '', time: '12:00' }])}><Plus className="size-4" />Add event</Button>
            <Button disabled={busy} onClick={() => { const list = kg.map(x => ({ name: String(x.name || '').trim(), time: x.time })).filter(x => x.name); if (!list.length || list.some(x => !/^\d{2}:\d{2}$/.test(x.time || ''))) { setMsg('Every event needs a name and a time.'); return; } void run({ kg_sessions: list }, 'Saved — the KG page shows these events on every desk.'); }}>Save KG events</Button><Msg>{msg}</Msg></div> : <Msg>Only an admin can change these.</Msg>}</Shell>;
}

function Fe({ set, isAdmin, reload }: CardProps) {
    const { settings } = useCore(); const st = settings as any;
    const [w, setW] = useState<Row>({ ...st.DEFAULTS.fe_windows, ...(set.settings.fe_windows || {}) });
    const { msg, setMsg, busy, run } = useSaver(reload);
    const f = (label: ReactNode, k: string) => <div className="grid gap-1"><Label>{label}</Label><Input type="time" className="w-32" disabled={!isAdmin} value={w[k]} onChange={e => setW(x => ({ ...x, [k]: e.target.value }))} /></div>;
    return <Shell title={<>Fakkul Ehraam windows <span className="text-sm font-normal text-muted-foreground">— the counts on the Home page, every desk</span></>} sub={<>Which Makkah check-ins count as <b>Morning</b> and as <b>Night</b>. <b>Night · from Madina</b> is the Night window's groups whose SH starts with S.</>}>
        <div className="flex flex-wrap gap-4">{f(<>Morning from <small>(the day before)</small></>, 'morning_from')}{f('Morning ends / Night starts', 'split')}{f('Night ends', 'night_to')}</div>
        {isAdmin ? <div className="flex items-center gap-3"><Button disabled={busy} onClick={() => { if (Object.values(w).some(v => !/^\d{2}:\d{2}$/.test(String(v || '')))) { setMsg('Fill in all three times.'); return; } if (w.split >= w.night_to) { setMsg('Night must end after it starts.'); return; } void run({ fe_windows: { morning_from: w.morning_from, split: w.split, night_to: w.night_to } }, 'Saved — the Home page counts use these on every desk.'); }}>Save windows</Button><Msg>{msg}</Msg></div> : <Msg>Only an admin can change these.</Msg>}</Shell>;
}

function Delay({ set, isAdmin, reload }: CardProps) {
    const { settings } = useCore(); const st = settings as any;
    const [d, setD] = useState(String(set.settings.delay_hold_days ?? st.DEFAULTS.delay_hold_days));
    const { msg, setMsg, busy, run } = useSaver(reload);
    return <Shell title={<>Delayed departures <span className="text-sm font-normal text-muted-foreground">— every desk</span></>} sub={<>When a room's departure is marked <b>unknown</b> (Slip page or Delayed departures), its beds are held from today for this many days. The desk can change any room's date; holds that run into an incoming booking are flagged.</>}>
        <div className="grid max-w-xs gap-1"><Label>Hold unknown stays for (days)</Label><Input type="number" min={1} max={120} step={1} disabled={!isAdmin} value={d} onChange={e => setD(e.target.value)} /></div>
        {isAdmin ? <div className="flex items-center gap-3"><Button disabled={busy} onClick={() => { const n = Number(d); if (!Number.isInteger(n) || n < 1 || n > 120) { setMsg('Enter 1–120 days.'); return; } void run({ delay_hold_days: n }, `Saved — unknown departures hold their rooms ${n} days.`); }}>Save</Button><Msg>{msg}</Msg></div> : <Msg>Only an admin can change this.</Msg>}</Shell>;
}

function ShPrefixes({ set, isAdmin, reload }: CardProps) {
    const { settings } = useCore(); const st = settings as any;
    const [shp, setShp] = useState<string[]>(() => [...(set.settings.sh_prefixes || st.DEFAULTS.sh_prefixes)]);
    const [nw, setNw] = useState('');
    const { msg, setMsg, busy, run } = useSaver(reload);
    function add() {
        const p = nw.trim().toUpperCase();
        if (!/^[A-Z]{1,4}$/.test(p)) { setMsg('A prefix is 1–4 letters (A–Z).'); return; }
        if (shp.includes(p)) { setMsg(`${p} is already there.`); return; }
        if (shp.length >= 20) { setMsg('Up to 20 prefixes.'); return; }
        setShp(x => [...x, p]); setNw(''); setMsg('Press Save prefixes to keep it.');
    }
    return <Shell title={<>SH prefixes <span className="text-sm font-normal text-muted-foreground">— letters allowed before an SH number on the Slip page, every desk</span></>} sub="An SH No. is digits, or digits after one of these (S44030 is a group's second check-in here). 1–4 letters each.">
        <div className="flex flex-wrap gap-2">{shp.length ? shp.map((p, i) => <span key={p} className="inline-flex items-center gap-1.5 rounded-full border bg-accent/40 px-3 py-1 text-sm"><b>{p}</b><small className="text-muted-foreground">{p}44030</small>{isAdmin && <button type="button" aria-label={`Remove ${p}`} onClick={() => { setShp(x => x.filter((_, j) => j !== i)); setMsg('Press Save prefixes to keep the change.'); }}>✕</button>}</span>) : <Msg>No prefixes — only plain numbers are accepted.</Msg>}</div>
        {isAdmin ? <div className="flex flex-wrap items-center gap-2"><Input className="w-32" maxLength={4} placeholder="e.g. ES" aria-label="New prefix" autoComplete="off" spellCheck={false} value={nw} onChange={e => setNw(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
            <Button variant="outline" onClick={add}><Plus className="size-4" />Add prefix</Button><Button disabled={busy} onClick={() => void run({ sh_prefixes: shp }, 'Saved — the Slip page accepts these on every desk.')}>Save prefixes</Button><Msg>{msg}</Msg></div> : <Msg>Only an admin can change these.</Msg>}</Shell>;
}

function GlColors({ set, isAdmin, reload, label }: CardProps & { label: (s: string) => string }) {
    const { settings, rooms } = useCore(); const st = settings as any; const guard = useGuard();
    const [glc, setGlc] = useState<Record<string, string>>({}), [site, setSite] = useState<Record<string, string>>({});
    const { msg, setMsg, busy, run } = useSaver(reload);
    useEffect(() => {
        void (async () => {
            const blds = await guard<any[]>((rooms as any).loadBuildings({ force: true })).catch(() => [] as any[]);
            const saved = { ...st.DEFAULTS.gl_colors, ...(set.settings.gl_colors || {}) };
            const g: Record<string, string> = {}, s: Record<string, string> = {};
            for (const b of blds) { s[b.name] = b.site; g[b.name] = saved[b.name] || '#000000'; }
            for (const [n, c] of Object.entries(set.settings.gl_colors || {})) if (!(n in g)) g[n] = c as string;
            setGlc(g); setSite(s);
        })();
    }, []);   // eslint-disable-line react-hooks/exhaustive-deps
    const names = Object.keys(glc).sort((a, b) => a.localeCompare(b));
    return <Shell title={<>GL copy colours <span className="text-sm font-normal text-muted-foreground">— the ink of the GL copy per building, every desk</span></>} sub={<>Used by <b>GL copy</b> on the Print slips page and on Check-ins. A building without a colour prints black.</>}>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">{names.length ? names.map(n => <div key={n} className="flex flex-wrap items-center gap-2 text-sm"><span className="w-40 max-w-full truncate">{n}{site[n] && <span className="text-xs text-muted-foreground"> {label(site[n])}</span>}</span>
            <input type="color" aria-label={`Colour for ${n}`} disabled={!isAdmin} className="h-8 w-12" value={glc[n]} onChange={e => setGlc(g => ({ ...g, [n]: e.target.value }))} />
            <Input className="h-8 w-24" maxLength={7} spellCheck={false} aria-label={`Hex colour for ${n}`} disabled={!isAdmin} value={glc[n]} onChange={e => { const v = e.target.value.trim(); setGlc(g => ({ ...g, [n]: v })); }} />
            <span className="min-w-0 break-words font-bold" style={{ color: HEX.test(glc[n]) ? glc[n] : '#000' }}>SH 12345 · {n}</span></div>) : <Msg>No buildings yet — add them in Rooms &amp; Buildings.</Msg>}</div>
        {isAdmin ? <div className="flex flex-wrap items-center gap-2"><Button variant="outline" onClick={() => { setGlc(g => Object.fromEntries(Object.keys(g).map(n => [n, st.DEFAULTS.gl_colors[n] || '#000000']))); setMsg('Defaults shown — press Save colours to keep them.'); }}>Reset to defaults</Button>
            <Button disabled={busy} onClick={() => { const bad = Object.entries(glc).find(([, c]) => !HEX.test(c)); if (bad) { setMsg(`${bad[0]}: enter a colour like #e8590c.`); return; } void run({ gl_colors: glc }, 'Saved — GL copies print in these colours on every desk.'); }}>Save colours</Button><Msg>{msg}</Msg></div> : <Msg>Only an admin can change these.</Msg>}</Shell>;
}

// ---- upload this browser's old data (slips saved here before the cloud switch) ----
function Legacy({ me, isAdmin, dbm, label, confirm }: { me: Row; isAdmin: boolean; dbm: any; label: (s: string) => string; confirm: (o: any) => Promise<boolean> }) {
    const { cloud } = useCore(); const c = cloud as any; const guard = useGuard();
    const [legacy, setLegacy] = useState<Row[]>([]), [inc, setInc] = useState(true), [msg, setMsg] = useState(''), [busy, setBusy] = useState(false);
    useEffect(() => { void guard<Row[]>(dbm.legacyAllSlips().catch(() => [])).then(setLegacy); }, []);   // eslint-disable-line react-hooks/exhaustive-deps
    if (!legacy.length) return null;
    const deviceId = (() => { try { let id = localStorage.getItem('pms_device_id'); if (!id) { id = crypto.randomUUID().slice(0, 8); localStorage.setItem('pms_device_id', id); } return id; } catch { return 'dev'; } })();
    const bySite: Record<string, number> = {}; let noBld = 0;
    for (const r of legacy) { const s = dbm.legacySiteOf(r); if (s) bySite[s] = (bySite[s] || 0) + 1; else noBld++; }
    const writable = (s: string) => isAdmin || ((me.role === 'desk' || me.role === 'siteadmin') && s === me.site);
    async function upload() {
        const items: Row[] = [];
        for (const r of legacy) { const site = dbm.legacySiteOf(r) || (inc ? me.site : null); if (!site || !(isAdmin || site === me.site)) continue; const { id, ...slip } = r; items.push({ site, origin: `${deviceId}:${id}`, slip }); }
        if (!items.length) { setMsg('Nothing this desk may upload.'); return; }
        if (!(await confirm({ title: `Upload ${items.length} slip(s) to the cloud?`, confirmLabel: 'Upload' }))) return;
        setBusy(true); let created = 0, skipped = 0;
        try {
            for (let i = 0; i < items.length; i += 45) { const r = await c.request('POST', '/api/slips/migrate', { slips: items.slice(i, i + 45) }); created += r.created; skipped += r.skipped; setMsg(`Uploading… ${Math.min(i + 45, items.length)}/${items.length}`); }
            await c.sync({ force: true }); setMsg(`Done: ${created} uploaded${skipped ? `, ${skipped} were already there` : ''}.`);
        } catch (e: any) { setMsg((e instanceof c.UserError ? e.message : 'Upload failed.') + ` (${created} uploaded before the error — press Upload again to continue.)`); } finally { setBusy(false); }
    }
    return <Shell title="Move this browser's old data to the cloud" sub="Slips saved on this computer before the cloud switch are still in this browser. Upload them once; uploading again never creates duplicates. The local copy stays in this browser as a backup.">
        <div className="flex flex-wrap gap-2"><Badge variant="outline">{legacy.length} slip(s) in this browser</Badge>{Object.entries(bySite).map(([s, n]) => <Badge key={s} variant="outline" className={writable(s) ? 'border-ok text-ok' : 'border-warn text-warn'}>{n} {label(s)}{writable(s) ? '' : ' — upload these from a ' + label(s) + ' desk'}</Badge>)}{noBld > 0 && <Badge variant="outline">{noBld} with no building</Badge>}</div>
        {noBld > 0 && (me.role === 'desk' || me.role === 'siteadmin' || isAdmin) && <label className="flex items-center gap-2 text-sm"><Checkbox checked={inc} onCheckedChange={v => setInc(v === true)} /> Also upload the <b>{noBld}</b> slip(s) with no building, as <b>{label(me.site)}</b> slips</label>}
        <div className="flex items-center gap-3"><Button disabled={me.role === 'viewer' || busy} onClick={() => void upload()}>Upload</Button><Msg>{msg}</Msg></div></Shell>;
}

// ---- admin: desks, page access, audit ----
function Desks({ cfg, me, label, confirm, prompt }: { cfg: { SITES: Row; VIEWS: Row[]; NAV: Row[] }; me: Row; label: (s: string) => string; confirm: (o: any) => Promise<boolean>; prompt: (o: any) => Promise<string | null> }) {
    const { cloud } = useCore(); const c = cloud as any; const guard = useGuard();
    const [desks, setDesks] = useState<Row[]>([]), [audit, setAudit] = useState<Row[]>([]), [msg, setMsg] = useState('');
    const owner = me.role === 'admin';   // a site admin manages only its own site's desk and viewer logins
    const [nd, setNd] = useState({ name: '', site: me.site, role: 'desk', pass: '' });
    const loadAudit = async () => { try { setAudit((await guard<any>(c.request('GET', '/api/audit?limit=100'))).audit); } catch { /* offline */ } };
    const loadDesks = async () => { try { setDesks((await guard<any>(c.request('GET', '/api/desks'))).desks); } catch (e: any) { setMsg(e.message); } };
    useEffect(() => { void loadDesks(); if (owner) void loadAudit(); }, []);   // eslint-disable-line react-hooks/exhaustive-deps
    async function patch(id: number, change: Row, done: string) {
        try { setDesks((await guard<any>(c.request('PATCH', `/api/desks/${id}`, change))).desks); setMsg(done); void loadAudit(); } catch (e: any) { setMsg(e.message); void loadDesks(); }
    }
    async function del(d: Row) {
        if (!(await confirm({ title: `Delete the login “${d.name}” for good?`, confirmLabel: 'Delete', body: `It is logged out everywhere and can never log in again. Its page access and personal settings are removed. Slips and the change log are kept (the log shows it as “${d.name} (deleted)”).\n\nTo stop it only for now, use Disable instead.` }))) return;
        try { setDesks((await guard<any>(c.request('DELETE', `/api/desks/${d.id}`))).desks); setMsg(`Login “${d.name}” deleted.`); void loadAudit(); } catch (e: any) { setMsg(e?.status === 404 || e?.status === 405 ? 'The server does not support deleting logins yet (Worker not updated).' : e.message); void loadDesks(); }
    }
    async function add(e: React.FormEvent) {
        e.preventDefault();
        try { setDesks((await guard<any>(c.request('POST', '/api/desks', { name: nd.name.trim(), site: nd.site, role: nd.role, password: nd.pass }))).desks); setMsg(`Desk “${nd.name.trim()}” added. Give its password to that desk.`); setNd(x => ({ ...x, name: '', pass: '' })); void loadAudit(); } catch (er: any) { setMsg(er.message); }
    }
    return <>
        <Shell title="Desk logins" sub={null}>
            <Table><TableHeader><TableRow><TableHead>Desk</TableHead><TableHead>Site</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Last login</TableHead><TableHead /></TableRow></TableHeader>
                <TableBody>{desks.map(d => <TableRow key={d.id} className={d.disabled ? 'opacity-60' : ''}>
                    <TableCell>{d.name}{d.id === me.id && <Badge variant="outline" className="ml-1.5">you</Badge>}</TableCell><TableCell>{label(d.site)}</TableCell>
                    <TableCell><select className={sel} disabled={d.id === me.id || (!owner && !['desk', 'viewer'].includes(d.role))} value={d.role} onChange={e => void patch(d.id, { role: e.target.value }, 'Role changed; that desk was logged out.')}>{(owner ? ['desk', 'viewer', 'siteadmin', 'admin'] : ['desk', 'viewer']).map(r => <option key={r} value={r}>{r === 'siteadmin' ? 'site admin' : r}</option>)}</select></TableCell>
                    <TableCell>{d.disabled ? <Badge variant="destructive">disabled</Badge> : <Badge variant="outline" className="border-ok text-ok">active</Badge>}</TableCell><TableCell>{when(d.last_login)}</TableCell>
                    <TableCell className="space-x-1">
                        <Button size="sm" variant="outline" onClick={async () => { const pw = await prompt({ title: `New password for ${d.name}`, body: '8+ characters. They will be logged out on every computer.' }); if (pw) void patch(d.id, { password: pw }, `Password of ${d.name} changed.`); }}>Reset password</Button>
                        {d.id !== me.id && <><Button size="sm" variant="outline" onClick={async () => { const disable = !d.disabled; if (!disable || await confirm({ title: `Disable ${d.name}?`, body: 'It is logged out everywhere and cannot log in until enabled.', confirmLabel: 'Disable' })) void patch(d.id, { disabled: disable }, `${d.name} ${disable ? 'disabled' : 'enabled'}.`); }}>{d.disabled ? 'Enable' : 'Disable'}</Button>
                            <Button size="sm" variant="outline" className="text-destructive" title="Remove this login for good" onClick={() => void del(d)}>Delete</Button></>}</TableCell></TableRow>)}</TableBody></Table>
            <h4 className="font-bold">Add a desk</h4>
            <form className="flex flex-wrap gap-2" onSubmit={e => void add(e)}>
                <Input className="w-56" placeholder="Desk name, e.g. Makkah Desk 2" required value={nd.name} onChange={e => setNd(x => ({ ...x, name: e.target.value }))} />
                <select className={sel} value={nd.site} onChange={e => setNd(x => ({ ...x, site: e.target.value }))}>{Object.values(cfg.SITES).filter((s: Row) => owner || s.id === me.site).map((s: Row) => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
                <select className={sel} value={nd.role} onChange={e => setNd(x => ({ ...x, role: e.target.value }))}><option value="desk">desk — edits its own site</option><option value="viewer">viewer — read only</option>{owner && <option value="siteadmin">site admin — manages its own site's logins</option>}{owner && <option value="admin">admin — every site, every setting</option>}</select>
                <Input className="w-56" placeholder="Password (8+ characters)" minLength={8} required autoComplete="off" value={nd.pass} onChange={e => setNd(x => ({ ...x, pass: e.target.value }))} /><Button type="submit">Add</Button></form>
            <Msg>{msg}</Msg></Shell>
        <Access desks={desks} cfg={cfg} label={label} confirm={confirm} onSaved={(d: Row[]) => { setDesks(d); void loadAudit(); }} />
        {owner && <Shell title="Recent changes" sub={null}><Table><TableHeader><TableRow><TableHead>When</TableHead><TableHead>Desk</TableHead><TableHead>Action</TableHead><TableHead>Slip</TableHead><TableHead>Detail</TableHead></TableRow></TableHeader>
            <TableBody>{audit.length ? audit.map((a, i) => <TableRow key={i}><TableCell>{when(a.at)}</TableCell><TableCell>{a.desk || '—'}</TableCell><TableCell>{a.action}</TableCell><TableCell>{a.slip_id ?? ''}</TableCell><TableCell className="text-xs">{a.detail || ''}</TableCell></TableRow>) : <TableRow><TableCell colSpan={5} className="text-muted-foreground">Nothing yet.</TableCell></TableRow>}</TableBody></Table></Shell>}
    </>;
}

function Access({ desks, cfg, label, confirm, onSaved }: { desks: Row[]; cfg: { VIEWS: Row[]; NAV: Row[] }; label: (s: string) => string; confirm: (o: any) => Promise<boolean>; onSaved: (d: Row[]) => void }) {
    const { cloud } = useCore(); const c = cloud as any; const guard = useGuard();
    // pages an admin can give or take (Home, Login and Settings are always open)
    const groups = useMemo(() => [{ label: 'Start', views: ['home'] }, ...cfg.NAV.map(n => ({ label: n.label as string, views: (n.views as string[]).filter(id => !c.ALWAYS_OPEN.includes(id)) }))].filter(g => g.views.length), [cfg]);   // eslint-disable-line react-hooks/exhaustive-deps
    const ALL = useMemo(() => groups.flatMap(g => g.views), [groups]);
    const pageLabel = (id: string) => cfg.VIEWS.find(v => v.id === id)?.label || id;
    const accessDesks = desks.filter(d => d.role !== 'admin');
    const savedOf = (d: Row) => new Set<string>(Array.isArray(d.pages) ? d.pages.filter((p: string) => ALL.includes(p)) : ALL);
    const [edit, setEdit] = useState<Record<number, Set<string>>>({});
    const [who, setWho] = useState<number | 'all' | null>(null), [msg, setMsg] = useState(''), [busy, setBusy] = useState(false);
    const cur = (d: Row) => edit[d.id] ?? savedOf(d);
    const same = (a: Set<string>, b: Set<string>) => [...a].sort().join() === [...b].sort().join();
    const dirty = accessDesks.filter(d => edit[d.id] && !same(edit[d.id], savedOf(d)));
    const w = who ?? accessDesks[0]?.id ?? null;
    const shown = w === 'all' ? accessDesks : accessDesks.filter(d => d.id === w);
    const setFor = (id: number, fn: (s: Set<string>) => void) => setEdit(e => { const d = accessDesks.find(x => x.id === id)!; const s = new Set(e[id] ?? savedOf(d)); fn(s); return { ...e, [id]: s }; });
    async function saveAll() {
        const empty = dirty.filter(d => !edit[d.id].size).map(d => d.name);
        if (empty.length && !(await confirm({ title: `${empty.join(', ')} will see no page (only Settings). Save anyway?`, confirmLabel: 'Save anyway' }))) return;
        setBusy(true); setMsg('Saving…'); let last: Row[] | null = null; const failed: string[] = [];
        for (const d of dirty) {
            const set = edit[d.id], pages = ALL.every(p => set.has(p)) ? null : ALL.filter(p => set.has(p));   // every page ticked = no limit (pages added later are open too)
            try { last = (await guard<any>(c.request('PATCH', `/api/desks/${d.id}`, { pages }))).desks; } catch (e: any) { failed.push(`${d.name}: ${e.message}`); }
        }
        if (last) { setEdit({}); onSaved(last); }
        setMsg(failed.length ? `Not saved: ${failed.join('; ')}` : `Saved for ${dirty.length} login${dirty.length === 1 ? '' : 's'}. Their menus update within a minute.`); setBusy(false);
    }
    return <Shell title="Page access" sub={<>Tick the pages each login may open. Unticked pages disappear from its menus and cannot be opened (Settings always can; a login without Home starts on its first ticked page). Admin logins always see every page. What a login may <b>change</b> still follows its role and site. Takes effect on that desk within a minute; there is no need to log it out.</>}>
        {!accessDesks.length ? <Msg>No desk or viewer logins yet. Admins always see every page.</Msg> : <>
            <div className="flex flex-wrap items-end gap-3">
                <div className="grid gap-1"><Label>Login</Label><select className={sel} value={String(w)} onChange={e => setWho(e.target.value === 'all' ? 'all' : Number(e.target.value))}>{accessDesks.map(d => <option key={d.id} value={d.id}>{d.name} — {label(d.site)} · {d.role}{d.disabled ? ' (disabled)' : ''}{dirty.some(x => x.id === d.id) ? ' *' : ''}</option>)}<option value="all">All logins (table)</option></select></div>
                {w !== 'all' && accessDesks.length > 1 && <div className="grid gap-1"><Label>Copy pages from</Label><select className={sel} value="" onChange={e => { const from = accessDesks.find(d => d.id === Number(e.target.value)); if (from && typeof w === 'number') setEdit(x => ({ ...x, [w]: new Set(cur(from)) })); }}><option value="">—</option>{accessDesks.filter(d => d.id !== w).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>}</div>
            <div className="max-h-[70vh] overflow-auto"><table className="w-full text-sm">
                <thead className="sticky top-0 bg-card"><tr><th className="p-1 text-left">Page</th>{shown.map(d => <th key={d.id} className="p-1 text-center"><div>{d.name}</div><div className="text-xs font-normal text-muted-foreground">{label(d.site)} · {d.role}</div><div className="space-x-1"><button type="button" className="text-xs text-primary underline" onClick={() => setFor(d.id, s => ALL.forEach(p => s.add(p)))}>All</button><button type="button" className="text-xs text-primary underline" onClick={() => setFor(d.id, s => s.clear())}>None</button></div></th>)}</tr></thead>
                <tbody>{groups.map(g => <>
                    <tr key={g.label} className="bg-muted/50"><th className="p-1 text-left">{g.label}</th>{shown.map(d => <td key={d.id} className="p-1 text-center"><button type="button" className="text-xs text-primary underline" onClick={() => setFor(d.id, s => { const on = g.views.every(v => s.has(v)); g.views.forEach(v => (on ? s.delete(v) : s.add(v))); })}>{g.views.every(v => cur(d).has(v)) ? 'none' : 'all'}</button></td>)}</tr>
                    {g.views.map(v => <tr key={g.label + v} className="border-b"><th className="p-1 pl-4 text-left font-normal">{pageLabel(v)}</th>{shown.map(d => { const on = cur(d).has(v), was = savedOf(d).has(v); return <td key={d.id} className={cn('p-1 text-center', on !== was && 'bg-accent')}><Checkbox aria-label={`${d.name}: ${pageLabel(v)}`} checked={on} onCheckedChange={x => setFor(d.id, s => (x === true ? s.add(v) : s.delete(v)))} /></td>; })}</tr>)}</>)}</tbody></table></div>
            <div className="flex flex-wrap items-center gap-2"><Button disabled={!dirty.length || busy} onClick={() => void saveAll()}>{dirty.length ? `Save page access (${dirty.length} login${dirty.length === 1 ? '' : 's'})` : 'Save page access'}</Button><Button variant="outline" disabled={!dirty.length} onClick={() => { setEdit({}); setMsg(''); }}>Undo changes</Button><Msg>{msg}</Msg></div></>}</Shell>;
}
