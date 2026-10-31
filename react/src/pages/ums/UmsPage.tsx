import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useConfirm } from '@/components/ConfirmDialog';
import { useCore, useDb, useGuard, useLoadCore, useNav, useSite } from '@/pms/PmsContext';

// UMS Import: load a Group List export (file or Chrome extension), review the changes for this site, apply. The reading, planning, import lock and the
// extension link are the shared core (core/ums.js, core/ums-auto.js) — this page only shows them.

type Row = Record<string, any>;
const dmy = (d?: string) => (d ? d.split('-').reverse().join('/') : '');
const stayText = (r: Row) => `${dmy(r.checkin_date)} ${r.checkin_time || ''} → ${dmy(r.checkout_date)} ${r.checkout_time || ''}`;
const when = (iso?: string) => (iso ? new Date(iso).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');
const Muted = ({ children }: { children: React.ReactNode }) => <span className="text-xs text-muted-foreground">{children}</span>;
const Pill = ({ children, tone }: { children: React.ReactNode; tone?: 'ok' | 'bad' | 'warn' }) => <Badge variant={tone === 'bad' ? 'destructive' : 'outline'} className={cn(tone === 'ok' && 'border-ok text-ok', tone === 'warn' && 'border-warn text-warn')}>{children}</Badge>;
const Note = ({ children }: { children: React.ReactNode }) => <span className="block text-xs text-warn">⚠ {children}</span>;

export default function UmsPage() {
    const { ums, settings } = useCore();
    const db = useDb();
    const guard = useGuard();
    const loadCore = useLoadCore();
    const { site, siteId } = useSite();
    const { href } = useNav();
    const { ask: confirm, dialog: confirmDialog } = useConfirm();
    const [auto, setAuto] = useState<any>(null);
    const [loaded, setLoaded] = useState<Row | null>(null);
    const [parsed, setParsed] = useState<Row | null>(null);
    const [plan, setPlan] = useState<Row | null>(null);
    const [tab, setTab] = useState('create');
    const [status, setStatus] = useState(''), [placesStatus, setPlacesStatus] = useState('');
    const [busy, setBusy] = useState(false), [over, setOver] = useState(false);
    const [, tick] = useState(0);
    const file = useRef<HTMLInputElement>(null);
    const u = ums as any;

    // ---- the UMS bridge on this computer (tools/ums-bridge): logs in to the UMS in a real browser window, the PMS reads UMS through it ----
    const [br, setBr] = useState<any>(null);                       // core/ums-bridge.js
    const [bst, setBst] = useState<Row>({ running: false, paired: false });
    const [bcfg, setBcfg] = useState({ url: 'http://127.0.0.1:8787', token: '', everyMin: 0 });
    const [bmsg, setBmsg] = useState(''), [bbusy, setBbusy] = useState('');
    const refreshBridge = async (m = br) => { if (m) { try { setBst(await m.status()); } catch (e: any) { setBst({ running: false, paired: false, error: e.message }); } } };
    useEffect(() => {
        let alive = true; let mod: any = null; let t: any = null;
        void loadCore('ums-bridge').then(m => {
            if (!alive) return;
            mod = m; setBr(m); setBcfg(m.getConfig()); void refreshBridge(m);
            t = setInterval(() => { if (document.visibilityState === 'visible') void refreshBridge(m); }, 4000);
            m.startAutoFetch((r: Row) => { if (r.file) { void load({ ...r.file }); setBmsg(`Fetched from UMS · ${new Date().toLocaleTimeString()}`); } else if (r.error) setBmsg(`Automatic fetch failed: ${r.error.message}`); });
        });
        return () => { alive = false; clearInterval(t); mod?.stopAutoFetch(); };
    }, []);   // eslint-disable-line react-hooks/exhaustive-deps
    const bridgeNote = (st: Row | null) => (st?.state === 'awaiting_human' ? 'A browser window is open on the bridge computer — log in to UMS there (credentials, CAPTCHA, Login).' : '');
    async function bridgeDo(what: 'login' | 'fetch') {
        if (!br) return;
        setBbusy(what); setBmsg(what === 'login' ? 'Opening the UMS login on the bridge computer…' : 'Fetching the Group List from UMS…');
        try {
            const onTick = (st: Row | null) => { const n = bridgeNote(st); if (n) setBmsg(n); void refreshBridge(); };
            if (what === 'login') { await br.login({ onTick }); setBmsg('Logged in to UMS.'); }
            else { const f = await br.fetchGroupList({}, { onTick }); await load({ ...f }); setBmsg(`Fetched from UMS · ${new Date().toLocaleTimeString()}`); }
        } catch (e: any) { setBmsg(e.code === 'CAPTCHA_TIMEOUT' ? 'Nobody logged in within the time allowed — try again.' : e.message || 'Failed.'); }
        finally { setBbusy(''); void refreshBridge(); }
    }
    const saveBridge = () => { if (!br) return; br.setConfig({ url: bcfg.url.trim() || 'http://127.0.0.1:8787', token: bcfg.token.trim(), everyMin: bcfg.everyMin }); br.startAutoFetch(() => {}); setBmsg('Saved.'); void refreshBridge(); };

    useEffect(() => {
        void loadCore('ums-auto').then(a => { setAuto(a); a.askExtension('get-latest'); });
        const t = () => tick(n => n + 1);
        const ev = ['pms:ums-ext', 'pms:ums-status', 'pms:ums-file', 'pms:ums-applied'];
        ev.forEach(e => window.addEventListener(e, t));
        return () => ev.forEach(e => window.removeEventListener(e, t));
    }, []);   // eslint-disable-line react-hooks/exhaustive-deps

    async function load(f: Row) {
        setLoaded(f); setStatus('');
        const p = u.parseUms(f.html);
        setParsed(p);
        if (p.fatal) { setPlan(null); return; }
        const pl = u.planImport(p, await db.all(), siteId, await guard(settings.umsConfig()));
        setPlan(pl);
        setTab(pl.create.length ? 'create' : pl.update.length ? 'update' : 'missing');
    }
    const fromFile = async (f?: File) => { if (f) await load({ html: await f.text(), fileName: f.name, via: 'file', fetchedAt: null }); };

    const TABS: [string, string, () => Row[]][] = plan ? [
        ['create', 'New', () => plan.create], ['update', 'Updated', () => plan.update.filter((x: Row) => !x.relinkOnly)], ['held', 'Needs a decision', () => plan.held || []],
        ['attention', 'Needs attention', () => plan.update.filter((x: Row) => x.notes.length)], ['kept', 'Your edits kept', () => plan.kept],
        ['relink', 'Linked, no change', () => plan.update.filter((x: Row) => x.relinkOnly)], ['missing', 'Not in this UMS file', () => plan.missing],
    ] : [];
    const rows = TABS.find(t => t[0] === tab)?.[2]() ?? [];
    const sum = useMemo(() => (plan ? u.summarize(plan) : null), [plan, tab]);   // eslint-disable-line react-hooks/exhaustive-deps
    const issues = parsed ? [...parsed.errors, ...parsed.warnings, ...(plan?.warnings || [])] : [];
    const prev = u.lastApplied(siteId);
    const ext = auto?.ext;

    async function missAct(item: Row, act: 'keep' | 'delete') {
        const s = item.slip;
        try {
            if (act === 'delete') {
                if (!(await confirm({ title: `Delete slip SH ${s.sh_no}?`, body: `${s.tour_name || ''}, ${stayText(s)}\nIt is not in the UMS file — cancelled or postponed?`, confirmLabel: 'Delete' }))) return;
                await guard(db.remove(s.id));
            } else await guard(db.update(s.id, { ums_absent_kept: { at: new Date().toISOString(), file: loaded?.fileName || '' } }));
            setPlan((p: Row | null) => (p ? { ...p, missing: p.missing.filter((m: Row) => m.slip.id !== s.id) } : p));
            setStatus(act === 'delete' ? `SH ${s.sh_no} deleted.` : `SH ${s.sh_no} kept.`);
        } catch (e: any) { setStatus(e.message || String(e)); }
    }
    async function fillPlaces() {
        try {
            const todo = u.placesForSlips(await db.all());
            if (!todo.length) { setPlacesStatus('Every UMS slip already has its From / To.'); return; }
            const n = (f: string) => todo.filter((t: Row) => f in t.patch).length;
            if (!(await confirm({ title: `Fill From on ${n('from_place')} slips and To on ${n('to_place')} slips?`, body: `${todo.length} slips in all. Places already set are not changed.`, confirmLabel: 'Fill' }))) return;
            setBusy(true); setPlacesStatus('Saving…');
            const r = await guard<any>(db.bulkWrite({ put: todo.map((t: Row) => ({ ...t.slip, ...t.patch, updatedAt: new Date().toISOString() })) }, 'from-to-fill'));
            setPlacesStatus(`Done: ${r.updated} slips updated${r.skipped ? `, ${r.skipped} skipped` : ''}.`);
        } catch (e: any) { setPlacesStatus(e.message || 'Could not save.'); } finally { setBusy(false); }
    }
    async function apply() {
        if (!plan || !loaded || !sum) return;
        if (sum.attention && !(await confirm({ title: `${sum.attention} slip(s) need attention`, body: 'Rooms assigned, or your edits replaced. Apply anyway?', confirmLabel: 'Apply anyway' }))) return;
        setBusy(true); setStatus('Applying…');
        try {
            // re-plan against current data inside the import lock, in case something changed meanwhile
            const res = await auto.runImport({ siteId, html: loaded.html, fileName: loaded.fileName, fetchedAt: loaded.fetchedAt, via: loaded.via, force: true });
            if (res.error) throw new Error(res.error);
            const r = res.summary;
            await load(loaded);   // show the (now empty) remaining diff
            setStatus(`Done: ${r.created} new, ${r.updated} updated${r.relinked ? `, ${r.relinked} linked` : ''}. Every desk sees it now.`);
        } catch (e: any) { setStatus('Import failed: ' + (e.message || e)); } finally { setBusy(false); }
    }

    const th = (...h: string[]) => <TableHeader><TableRow>{h.map(x => <TableHead key={x}>{x}</TableHead>)}</TableRow></TableHeader>;
    const pax = (r: Row) => <>{r.total ?? ''} <Muted>({r.gents ?? 0}/{r.ladies ?? 0}/{r.children ?? 0}/{r.infants ?? 0})</Muted></>;
    const empty = (n: number) => <TableRow><TableCell colSpan={n} className="text-muted-foreground">Nothing here.</TableCell></TableRow>;
    const slipLink = (sh: string, label: string) => <a className="text-primary underline" href={href('slip', { sh_no: sh })} target="_blank" rel="noopener">{label}</a>;
    const missRange = plan?.missingRange;
    const nothing = !sum || (!sum.created && !sum.updated && !sum.relinked);
    const log = u.readLog(siteId) as Row[];

    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            <header><h1 className="text-2xl font-bold text-primary">UMS Import — {site.label}</h1>
                <p className="text-sm text-muted-foreground">Brings the UMS Group List into this site's slips. UMS decides names, leader, pax and dates; building and rooms stay exactly as the desk set them. Nothing is deleted.</p></header>
            <Card><CardHeader><CardTitle className="text-base">UMS bridge <span className="text-sm font-normal text-muted-foreground">— on this computer: logs in to UMS in a real browser window; the PMS reads UMS through it</span></CardTitle></CardHeader><CardContent className="grid gap-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Pill tone={bst.running && bst.paired && !bst.badToken ? 'ok' : bst.running ? 'warn' : undefined}>{!bst.running ? 'not running' : bst.badToken ? 'wrong token' : !bst.paired ? 'running — paste its token' : bst.state === 'awaiting_human' ? 'waiting for you to log in to UMS' : bst.authenticated ? 'connected · logged in to UMS' : 'connected'}</Pill>
                    <Button size="sm" disabled={!bst.paired || !!bbusy || !!bst.badToken} onClick={() => void bridgeDo('login')}>{bbusy === 'login' ? 'Waiting for you…' : 'Log in to UMS'}</Button>
                    <Button size="sm" variant="outline" disabled={!bst.paired || !!bbusy || !!bst.badToken} onClick={() => void bridgeDo('fetch')}>{bbusy === 'fetch' ? 'Fetching…' : 'Fetch Group List now'}</Button>
                    <label className="flex items-center gap-1.5 text-sm">every
                        <select className="h-8 rounded-md border bg-background px-1" value={bcfg.everyMin} onChange={e => { const v = Number(e.target.value); setBcfg(c => ({ ...c, everyMin: v })); br?.setConfig({ everyMin: v }); br?.startAutoFetch((r: Row) => { if (r.file) { void load({ ...r.file }); setBmsg(`Fetched from UMS · ${new Date().toLocaleTimeString()}`); } else if (r.error) setBmsg(`Automatic fetch failed: ${r.error.message}`); }); }}>
                            <option value={0}>— (not automatic)</option>{[15, 30, 60].map(m => <option key={m} value={m}>{m} min</option>)}</select> while this page is open</label>
                </div>
                {bmsg && <p className="text-sm">{bmsg}</p>}
                <details className="text-sm"><summary className="cursor-pointer text-muted-foreground">Connection</summary>
                    <div className="mt-2 flex flex-wrap items-end gap-2">
                        <label className="grid gap-1 text-xs">Address<Input className="w-56" value={bcfg.url} onChange={e => setBcfg(c => ({ ...c, url: e.target.value }))} /></label>
                        <label className="grid gap-1 text-xs">Token<Input className="w-72" type="password" autoComplete="off" placeholder="printed when the bridge starts" value={bcfg.token} onChange={e => setBcfg(c => ({ ...c, token: e.target.value }))} /></label>
                        <Button size="sm" variant="outline" onClick={saveBridge}>Save</Button></div>
                    <p className="mt-2 text-xs text-muted-foreground">Start the bridge on this computer: <code>cd tools/ums-bridge</code>, then <code>npm run serve</code> (set <code>UMS_MANUAL_LOGIN=1</code> and <code>UMS_HEADLESS=0</code> so UMS opens in a window where you log in yourself). The address and token are kept in this browser only. The bridge never solves the CAPTCHA — you do.</p></details>
            </CardContent></Card>
            <div className="grid gap-3 lg:grid-cols-2">
                <Card><CardHeader><CardTitle className="text-base">1 · Load the Group List</CardTitle></CardHeader><CardContent className="grid gap-3">
                    <label className={cn('grid cursor-pointer place-items-center rounded-xl border-2 border-dashed p-6 text-center text-sm', over && 'border-gold bg-accent')} onDragOver={e => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={e => { e.preventDefault(); setOver(false); void fromFile(e.dataTransfer.files[0]); }}>
                        <input ref={file} hidden type="file" accept=".xls,.htm,.html,text/html" onChange={e => { void fromFile(e.target.files?.[0]); e.target.value = ''; }} />
                        <span>Drop <b>GroupList….xls</b> here, or <u>choose the file</u></span></label>
                    <div className="flex flex-wrap items-center gap-2 text-sm">Chrome extension: <Pill tone={ext?.connected ? 'ok' : undefined}>{ext?.connected ? `connected${ext.version ? ' · v' + ext.version : ''}` : 'not detected'}</Pill>
                        {ext?.connected && <Button size="sm" variant="outline" onClick={() => auto.askExtension('fetch-now')}>Fetch from UMS now</Button>}
                        {ext?.latestFile && <Button size="sm" variant="outline" onClick={() => void load({ ...ext.latestFile, via: 'extension' })}>Use latest from extension</Button>}</div>
                    <p className="text-xs text-muted-foreground">{[ext?.latestFile && `Latest file: fetched ${when(ext.latestFile.fetchedAt)}.`, ext?.lastStatus && (ext.lastStatus.ok ? `Last fetch OK · ${when(ext.lastStatus.at)}.` : `Last fetch failed · ${when(ext.lastStatus.at)}: ${ext.lastStatus.error}`), !ext?.connected && 'Install the extension from the extension/ folder (see its README) to fetch the Group List every hour.'].filter(Boolean).join(' ')}</p>
                </CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">Automatic import on this device</CardTitle></CardHeader><CardContent className="grid gap-2 text-sm">
                    <label className="flex items-center gap-2"><Checkbox disabled={db.readonly || !auto} checked={auto?.getAutoSite() === siteId} onCheckedChange={v => { auto.setAutoSite(v === true ? siteId : ''); tick(n => n + 1); }} /><span>Apply every file the extension fetches to <b>{site.label}</b> automatically</span></label>
                    <p className="text-xs text-muted-foreground">{[auto && auto.getAutoSite() && auto.getAutoSite() !== siteId && `This device auto-imports for ${auto.getAutoSite()} — turning this on switches it to ${site.label}.`, 'Keep one PMS tab open on this computer; the extension delivers each new file to it. Only this site is imported, and files that look incomplete are held for review.', prev && `Last applied import: ${when(prev.at)} (${prev.rows} rows).`].filter(Boolean).join(' ')}</p></CardContent></Card>
            </div>

            {parsed && <Card><CardHeader><CardTitle className="text-base">2 · File check</CardTitle></CardHeader><CardContent className="grid gap-2">
                <div className="flex flex-wrap gap-2"><Pill>{loaded?.fileName || 'file'} {loaded?.fetchedAt ? '· fetched ' + when(loaded.fetchedAt) : ''}</Pill><Pill tone={parsed.fatal ? 'bad' : 'ok'}>{parsed.rowCount} group rows</Pill>
                    {parsed.errors.length > 0 && <Pill tone="bad">{parsed.errors.length} unreadable</Pill>}{prev && <Pill>last import: {prev.rows} rows · {when(prev.at)}</Pill>}
                    {plan && sum && <><Pill>{sum.groups} groups stay in {site.label} ({sum.stays} stays)</Pill><Pill>{plan.otherSiteStays} stays elsewhere — not imported here</Pill></>}</div>
                {parsed.fatal && <p className="text-sm text-destructive">{parsed.fatal}</p>}
                {issues.length > 0 && <details className="text-sm"><summary className="cursor-pointer">{issues.length} note(s) about the file</summary><ul className="ml-5 list-disc">{issues.map((w, i) => <li key={i}>{w}</li>)}</ul></details>}
            </CardContent></Card>}

            {plan && <Card><CardHeader><CardTitle className="text-base">3 · Changes for {site.label}</CardTitle></CardHeader><CardContent className="grid gap-3">
                <div role="tablist" className="flex flex-wrap items-center gap-1.5">{TABS.map(([id, label, r]) => <Button key={id} role="tab" aria-selected={id === tab} size="sm" variant={id === tab ? 'default' : 'outline'} onClick={() => setTab(id)}>{label} <span className="ml-1 rounded-full bg-background/30 px-1.5 text-xs">{r().length}</span></Button>)}<Pill>{plan.unchanged} unchanged</Pill></div>
                {tab === 'held' && <p className="text-sm">UMS changed the dates of these slips, but a room would then hold more guests than its beds. <b>The dates were not changed.</b> Sort the room out (move one group to another room, or correct the stay); the next import applies the UMS dates by itself.</p>}
                {tab === 'missing' && <p className="text-sm">{missRange ? <>Slips in the PMS checking in <b>{dmy(missRange.from)} – {dmy(missRange.to)}</b> (the dates this file covers) that the file does not have — the SH may have been <b>cancelled or postponed</b> in UMS. Keep, edit or delete each. Kept slips are not listed again.</> : 'This file has no stays for this site.'}</p>}
                <Table>
                    {tab === 'create' ? <>{th('SH', 'Group', 'Leader', 'Stay', 'Pax (G/L/C/I)', 'Itinerary', 'Country')}<TableBody>{rows.length ? rows.map(({ rec }) => <TableRow key={rec.sh_no + rec.ums.seg}><TableCell>{rec.sh_no}</TableCell><TableCell>{rec.tour_name}{rec.ums.family && <Pill>family</Pill>}</TableCell><TableCell>{rec.group_leader}</TableCell><TableCell>{stayText(rec)}</TableCell><TableCell>{pax(rec)}</TableCell><TableCell>{rec.ums.itinerary} #{rec.ums.seg}</TableCell><TableCell>{rec.ums.country}</TableCell></TableRow>) : empty(7)}</TableBody></>
                        : tab === 'held' ? <>{th('SH', 'Group', 'Stay now', 'UMS wants', 'Why it was held', '')}<TableBody>{rows.length ? rows.map((h, i) => <TableRow key={i}><TableCell>{h.slip.sh_no}</TableCell><TableCell>{h.slip.tour_name}</TableCell><TableCell>{stayText(h.slip)}</TableCell><TableCell>{u.wantedText(h.slip, h)}</TableCell><TableCell><Note>{u.heldText(h)}</Note></TableCell><TableCell>{slipLink(h.slip.sh_no, 'Open slip')}</TableCell></TableRow>) : empty(6)}</TableBody></>
                        : tab === 'kept' ? <>{th('SH', 'Group', 'Stay', 'Kept (yours → UMS says)')}<TableBody>{rows.length ? rows.map(({ slip, kept }) => <TableRow key={slip.id}><TableCell>{slip.sh_no}</TableCell><TableCell>{slip.tour_name}</TableCell><TableCell>{stayText(slip)}</TableCell><TableCell>{Object.entries(kept as Record<string, Row>).map(([f, k]) => <span key={f} className="block"><b>{f}</b>: {String(k.yours)} <Muted>(UMS: {String(k.ums)}{k.delayed ? ' — kept: delayed departure' : ''})</Muted></span>)}</TableCell></TableRow>) : empty(4)}</TableBody></>
                        : tab === 'missing' ? <>{th('SH', 'Group', 'Stay', 'Building · rooms', 'From', 'Action')}<TableBody>{rows.length ? rows.map(item => { const s = item.slip; const rms = ['gents', 'ladies'].flatMap(k => (s.rooms?.[k] || []).map((x: Row) => String(x.room_no || '').trim()).filter(Boolean));
                            return <TableRow key={s.id}><TableCell>{s.sh_no}</TableCell><TableCell>{s.tour_name}<br /><Muted>{String(s.group_leader || '').trim() || '-'}</Muted></TableCell><TableCell>{stayText(s)}</TableCell><TableCell>{s.building || '—'}{rms.length > 0 && <><br /><Muted>{rms.join(', ')}</Muted></>}</TableCell>
                                <TableCell>{item.why === 'ums' ? `UMS, last imported ${when(s.ums?.importedAt)}` : 'made in the PMS'}</TableCell>
                                <TableCell className="space-x-1">{!db.readonly && <><Button size="sm" variant="outline" onClick={() => void missAct(item, 'keep')}>Keep</Button>{slipLink(s.sh_no, 'Edit')} <Button size="sm" variant="outline" className="text-destructive" onClick={() => void missAct(item, 'delete')}>Delete</Button></>}</TableCell></TableRow>; }) : empty(6)}</TableBody></>
                        : <>{th('SH', 'Group', 'Building', 'Stay (new)', 'Changes')}<TableBody>{rows.length ? rows.map(x => <TableRow key={x.key + x.rec.sh_no}><TableCell>{x.rec.sh_no}</TableCell><TableCell>{x.rec.tour_name}</TableCell><TableCell>{x.rec.building || '—'}</TableCell><TableCell>{stayText(x.rec)}</TableCell>
                            <TableCell>{Object.entries(x.changes as Record<string, Row>).map(([f, c]) => <span key={f} className="block"><b>{f}</b>: <span className="text-muted-foreground line-through">{String(c.from)}</span> → {String(c.to)}</span>)}{!Object.keys(x.changes).length && <Muted>linked to UMS stay {x.key}</Muted>}{x.notes.map((n: string, i: number) => <Note key={i}>{n}</Note>)}</TableCell></TableRow>) : empty(5)}</TableBody></>}
                </Table>
                <div className="flex flex-wrap items-center gap-3"><Button disabled={db.readonly || nothing || busy} onClick={() => void apply()}>{nothing ? 'Nothing to apply' : `Apply: ${sum.created} new, ${sum.updated} updated${sum.relinked ? `, ${sum.relinked} linked` : ''}`}</Button>
                    <span className="text-sm text-muted-foreground">{status || (db.readonly ? db.readonlyReason : '')}</span></div>
            </CardContent></Card>}

            <Card><CardHeader><CardTitle className="text-base">From / To on existing slips</CardTitle>
                <p className="text-sm text-muted-foreground">Fills the <b>From</b> and <b>To</b> of every slip of {site.label} that came from UMS, using the arrival, departure and itinerary stored with it. Places already set by hand are kept. Every change is saved as a new slip version.</p></CardHeader>
                <CardContent className="flex flex-wrap items-center gap-3"><Button variant="outline" disabled={db.readonly || busy} onClick={() => void fillPlaces()}>Fill From / To on all slips</Button><span className="text-sm text-muted-foreground">{placesStatus}</span></CardContent></Card>

            <Card><CardHeader><CardTitle className="text-base">History</CardTitle></CardHeader><CardContent><Table>
                {th('When', 'How', 'Result', 'Rows', 'New', 'Updated', 'Attention', 'Not in export', 'Note')}
                <TableBody>{log.length ? log.map((l, i) => <TableRow key={i}><TableCell>{when(l.at)}</TableCell><TableCell>{l.via}</TableCell><TableCell><Pill tone={l.result === 'applied' ? 'ok' : l.result === 'held' ? 'warn' : 'bad'}>{l.result}</Pill></TableCell>
                    <TableCell>{l.rows ?? ''}</TableCell><TableCell>{l.created ?? ''}</TableCell><TableCell>{l.updated ?? ''}</TableCell><TableCell>{l.attention ?? ''}{l.held ? <span className="text-warn" title="UMS date changes held: a room would be over capacity"> ⚠ {l.held} held</span> : null}</TableCell><TableCell>{l.missing ?? ''}</TableCell>
                    <TableCell className="text-xs">{l.error || (l.warnings ? l.warnings + ' note(s)' : '')}</TableCell></TableRow>) : <TableRow><TableCell colSpan={9} className="text-muted-foreground">No imports yet.</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
            {confirmDialog}
        </div>
    );
}
