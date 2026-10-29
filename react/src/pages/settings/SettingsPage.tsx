import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useConfirm } from '@/components/ConfirmDialog';
import { PageHeader } from '@/components/PageHeader';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePrefs } from '@/hooks/usePrefs';
import { useCore, useGuard, useLoadApp, useLoadCore, useNav, useParams, useViews } from '@/pms/PmsContext';

// Settings: this login's personal preferences (core/prefs.js — saved on the server with the login, so the same on every device) and the desk's own password.
// Every control saves on change and the shell applies it at once.

type Row = Record<string, any>;
const BROWSER_KEYS = new Set(['D', 'E', 'F']);   // Alt+<these> open the browser's own menus in some browsers — allowed, but worth a warning
// the tabs, and which tab holds each card
const SETTINGS_TABS: [string, string][] = [['account', 'Account'], ['look', 'Appearance'], ['menus', 'Menus & shortcuts'], ['pages', 'Pages'], ['data', 'Data & backup']];
const TAB_OF: Record<string, string> = { password: 'account', look: 'look', layout: 'look', menu: 'menus', quick: 'menus', keys: 'menus', start: 'pages', slip: 'pages', checkins: 'pages', data: 'data', backup: 'data' };
const SECTIONS: [string, string][] = [['password', 'Password'], ['look', 'Appearance'], ['layout', 'Menu & layout'], ['menu', 'Menu builder'], ['quick', 'Quick links'], ['keys', 'Shortcuts'], ['start', 'Start page'], ['slip', 'Slip page'], ['checkins', 'Check-ins page'], ['data', 'Data & privacy'], ['backup', 'Backup & reset']];
const NOT_IN_MENU = new Set(['home', 'login', 'blank']);
const sel = 'h-9 rounded-md border bg-background px-2 text-sm';

function Opt({ title, hint, children }: { title: ReactNode; hint?: ReactNode; children?: ReactNode }) {
    return <div className="flex flex-wrap items-center justify-between gap-3 border-b py-2.5 last:border-0"><div className="grid max-w-xl gap-0.5"><b className="text-sm">{title}</b>{hint && <span className="text-xs text-muted-foreground">{hint}</span>}</div>{children && <div className="flex max-w-full flex-wrap items-center gap-2">{children}</div>}</div>;
}
function Seg({ value, list, onChange }: { value: string; list: [string, string][]; onChange: (v: string) => void }) {
    return <div className="inline-flex max-w-full flex-wrap overflow-hidden rounded-md border">{list.map(([v, l]) => <button key={v} type="button" aria-pressed={value === v} className={cn('px-3 py-1.5 text-sm', value === v ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-accent')} onClick={() => onChange(v)}>{l}</button>)}</div>;
}

export default function SettingsPage() {
    const { cloud, prefs: prefsLib, rooms } = useCore();
    const guard = useGuard();
    const params = useParams();
    const views = useViews() as Row[];
    const loadCore = useLoadCore();
    const loadApp = useLoadApp();
    const { navigate } = useNav();
    const { prefs: p, setPrefs } = usePrefs();
    const { ask: confirm, dialog: confirmDialog } = useConfirm();
    const me = cloud.currentDesk();
    const [toast, setToast] = useState('');
    const [cfg, setCfg] = useState<{ SITES: Row; NAV: Row[] } | null>(null);
    const [libs, setLibs] = useState<{ nav: any; cols: [string, string][] } | null>(null);
    const [buildings, setBuildings] = useState<string[]>([]);
    const [sync, setSync] = useState<{ ok: boolean } | null>(null);
    const [keysMsg, setKeysMsg] = useState(''), [mbMsg, setMbMsg] = useState<{ t: string; ok: boolean } | null>(null), [bkMsg, setBkMsg] = useState<{ t: string; ok: boolean } | null>(null);
    const [newGroup, setNewGroup] = useState('');
    const [pw, setPw] = useState({ cur: '', n1: '', n2: '', show: false }), [pwMsg, setPwMsg] = useState<{ t: string; ok: boolean } | null>(null), [pwBusy, setPwBusy] = useState(false);
    const toastT = useRef<ReturnType<typeof setTimeout>>(undefined);
    const secRefs = useRef<Record<string, HTMLElement | null>>({});
    const [cur, setCur] = useState('password');
    const [tab, setTab] = useState('account');
    const fileRef = useRef<HTMLInputElement>(null), menuFile = useRef<HTMLInputElement>(null);
    const flash = (t: string) => { setToast(t); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(''), 1600); };
    const save = (patch: Row, text = 'Saved') => { setPrefs(patch); flash(text); };

    useEffect(() => {
        void (async () => {
            const [conf, nav, cols] = await Promise.all([loadApp('config.js'), loadCore('nav'), loadCore('checkins-cols')]);
            setCfg({ SITES: conf.SITES, NAV: conf.NAV }); setLibs({ nav, cols: cols.CHECKINS_COLS });
            try { const list = await guard<any[]>(rooms.loadBuildings()); setBuildings([...new Set(Object.keys(conf.SITES).flatMap(s => rooms.buildingNames(list, s)))] as string[]); } catch { /* ignore */ }
        })();
        const h = (e: Event) => setSync({ ok: !!(e as CustomEvent).detail?.ok });
        window.addEventListener('pms:prefs-saved', h);
        return () => window.removeEventListener('pms:prefs-saved', h);
    }, []);   // eslint-disable-line react-hooks/exhaustive-deps
    const section = params.get('section');
    useEffect(() => { if (cfg && section) requestAnimationFrame(() => show(section, false)); }, [cfg]);   // eslint-disable-line react-hooks/exhaustive-deps
    function show(sec: string, smooth = true) {
        if (TAB_OF[sec] && TAB_OF[sec] !== tab) { setTab(TAB_OF[sec]); setCur(sec); setTimeout(() => show(sec, false), 60); return; }   // open the tab that holds it first
        const el = secRefs.current[sec]; if (!el) return;
        setCur(sec); el.scrollIntoView({ behavior: smooth && !p.reduceMotion ? 'smooth' : 'auto', block: 'start' });
        if (sec === 'password') setTimeout(() => document.getElementById('pwCur')?.focus({ preventScroll: true }), 300);
    }

    // only pages this login may open (Setup → Page access)
    const pages = useMemo(() => views.filter(v => (!v.hidden || v.id === 'home') && v.id !== 'login' && cloud.canOpen(v.id, me)), [views]);   // eslint-disable-line react-hooks/exhaustive-deps
    const label = (id: string) => views.find(v => v.id === id)?.label || id;
    if (!cfg || !libs) return <div className="mx-auto max-w-[2400px] p-4 text-sm text-muted-foreground">Loading…</div>;
    const { SITES, NAV } = cfg;
    const sw = (k: string) => <Switch checked={!!p[k]} onCheckedChange={v => save({ [k]: v })} />;

    // ---- menu builder: the editable menu = what the menu shows now (standard, or this login's own, plus "New pages"); two levels only: groups → pages ----
    const draft = (): { label: string; views: string[] }[] => libs.nav.menuFor().map((g: Row) => ({ label: g.label, views: [...g.views] }));
    const poolOf = (groups: Row[]) => { const used = new Set(groups.flatMap(g => g.views)); return views.filter(v => !v.hidden && !NOT_IN_MENU.has(v.id) && !used.has(v.id)).map(v => v.id); };
    const saveMenu = (groups: Row[], text = 'Menu saved') => save({ navMenu: groups.map(g => ({ label: g.label, views: g.views })), navHidden: poolOf(groups) }, text);
    const groups = draft(), pool = poolOf(groups);
    const mutate = (fn: (g: any[]) => string) => { const g = draft(); const t = fn(g); saveMenu(g, t); };
    const move = <T,>(a: T[], i: number, j: number) => { [a[i], a[j]] = [a[j], a[i]]; };

    // ---- quick links ----
    const ql: string[] = (p.quickLinks || []).filter((id: string) => pages.some(v => v.id === id));

    // ---- shortcuts ----
    const used: Record<string, string[]> = {};
    for (const [id, k] of Object.entries(p.shortcuts || {})) if (k) (used[(k as string).toUpperCase()] ||= []).push(id);
    function onKey(e: React.KeyboardEvent, id: string) {
        if (e.key === 'Tab') return;
        e.preventDefault(); e.stopPropagation();
        let key: string | null = null;
        if (e.key === 'Backspace' || e.key === 'Delete') key = '';
        else { const k = (/^Digit(\d)$/.exec(e.code)?.[1] ?? /^Key([A-Z])$/.exec(e.code)?.[1] ?? '').toUpperCase(); if (k) key = k; }
        if (key === null) { setKeysMsg('Use a letter (A–Z) or a digit (0–9).'); return; }
        const sc: Row = { [id]: key }; let note = '';
        if (key) {
            const other = Object.entries(p.shortcuts || {}).find(([vid, k]) => vid !== id && ((k as string) || '').toUpperCase() === key);
            if (other) { sc[other[0]] = ''; note = `${label(other[0])} no longer has a shortcut (it had ${key}). `; }
            if (BROWSER_KEYS.has(key) && p.shortcutMod === 'alt') note += `Alt+${key} also opens a browser menu in some browsers.`;
        }
        setPrefs({ shortcuts: sc }); setKeysMsg(note);
        flash(key ? `${prefsLib.modLabel()} + ${key} opens ${label(id)}` : 'Shortcut removed');
    }

    // ---- password ----
    const strength = (s: string) => { let n = 0; if (s.length >= 8) n++; if (s.length >= 12) n++; if (/[a-z]/.test(s) && /[A-Z]/.test(s)) n++; if (/\d/.test(s)) n++; if (/[^\w\s]/.test(s) || /\s/.test(s.trim())) n++; return s.length < 8 ? 0 : Math.min(4, n); };
    const st = strength(pw.n1);
    async function changePw(e: React.FormEvent) {
        e.preventDefault();
        const bad = (t: string) => setPwMsg({ t, ok: false });
        if (pw.n1.length < 8) return bad('The new password needs at least 8 characters.');
        if (pw.n1 !== pw.n2) return bad('The two new passwords are not the same.');
        if (pw.n1 === pw.cur) return bad('The new password is the same as the current one.');
        setPwBusy(true); setPwMsg({ t: 'Changing…', ok: true });
        try { await guard((cloud as any).request('POST', '/api/me/password', { current: pw.cur, password: pw.n1 })); setPw({ cur: '', n1: '', n2: '', show: false }); setPwMsg({ t: 'Password changed. Other computers using this desk must log in again with the new password.', ok: true }); flash('Password changed'); }
        catch (er: any) { bad(er?.status === 404 ? 'The server does not support this yet — ask the admin to update the PMS Worker.' : er instanceof cloud.UserError ? er.message : 'Could not change the password. Check the connection and try again.'); }
        finally { setPwBusy(false); }
    }
    const dl = (name: string, text: string) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); };
    const noSlipBld = p.slipDefaultBuilding && !buildings.includes(p.slipDefaultBuilding) ? [...buildings, p.slipDefaultBuilding] : buildings;
    const card = (id: string, title: string, body: ReactNode) => TAB_OF[id] !== tab ? null : <section ref={el => { secRefs.current[id] = el; }} key={id} className="scroll-mt-20"><Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent>{body}</CardContent></Card></section>;

    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            <PageHeader view="settings" parent="" title="Settings" current={SETTINGS_TABS.find(t => t[0] === tab)?.[1]} />
            <p className="-mt-1 text-sm text-muted-foreground">Changes apply at once and are saved <b>with your login</b>, so you get the same settings on any computer or phone you log in on. Other logins are not affected.{' '}
                    {sync && <span className={sync.ok ? 'text-ok' : 'text-destructive'}>{sync.ok ? '✓ Saved to your login.' : 'Not saved to the server yet (offline?) — kept on this device and sent when the connection is back.'}</span>}</p>
            <Tabs value={tab} onValueChange={t => { setTab(t); window.scrollTo(0, 0); }}>
                <TabsList variant="underline">{SETTINGS_TABS.map(([id, l]) => <TabsTrigger key={id} value={id}>{l}</TabsTrigger>)}</TabsList>
            </Tabs>
            <div className="grid items-start gap-4">
                <div className="grid min-w-0 gap-3">
                    {card('password', 'Change password', <>
                        <p className="mb-2 text-xs text-muted-foreground">{me ? `Desk login: ${me.name} (${SITES[me.site]?.label || me.site}, ${me.role})` : ''}</p>
                        <form className="grid max-w-md gap-3" autoComplete="on" onSubmit={e => void changePw(e)}>
                            <input type="text" name="username" autoComplete="username" hidden readOnly value={me?.name || ''} />
                            <div className="grid gap-1"><Label htmlFor="pwCur">Current password</Label><Input id="pwCur" type={pw.show ? 'text' : 'password'} autoComplete="current-password" required value={pw.cur} onChange={e => setPw(x => ({ ...x, cur: e.target.value }))} /></div>
                            <div className="grid gap-1"><Label>New password</Label><Input type={pw.show ? 'text' : 'password'} autoComplete="new-password" minLength={8} required value={pw.n1} onChange={e => setPw(x => ({ ...x, n1: e.target.value }))} /></div>
                            <div className="grid gap-1"><Label>New password again</Label><Input type={pw.show ? 'text' : 'password'} autoComplete="new-password" minLength={8} required value={pw.n2} onChange={e => setPw(x => ({ ...x, n2: e.target.value }))} /></div>
                            <label className="flex items-center gap-2 text-sm"><Checkbox checked={pw.show} onCheckedChange={v => setPw(x => ({ ...x, show: v === true }))} /> Show passwords</label>
                            <div aria-live="polite" className="grid gap-1"><i className="block h-1.5 rounded transition-all" style={{ width: `${pw.n1 ? [4, 30, 55, 80, 100][st] : 0}%`, background: ['#c0392b', '#d35400', '#d4a017', '#6aa84f', '#2f7d32'][st] }} />
                                <span className="text-xs text-muted-foreground">{pw.n1.length < 8 ? (pw.n1 ? 'At least 8 characters.' : 'At least 8 characters. Longer is stronger; mix words, digits and signs.') : ['Too short', 'Weak — make it longer', 'Fair', 'Good', 'Strong'][st]}</span></div>
                            <div className="flex items-center gap-3"><Button type="submit" disabled={pwBusy}>Change password</Button><span role="status" className={cn('text-sm', pwMsg?.ok ? 'text-ok' : 'text-destructive')}>{pwMsg?.t}</span></div>
                        </form>
                        <p className="mt-3 text-xs text-muted-foreground">Every other computer logged in as this desk is logged out; this one stays logged in. Forgot it? The admin can set a new one on <a className="text-primary underline" href="#" onClick={e => { e.preventDefault(); navigate('setup'); }}>Setup</a>.</p></>)}

                    {card('look', 'Appearance', <>
                        <Opt title="Text and page size" hint="Makes everything bigger or smaller (menus, pages, dialogs).">
                            <Button variant="outline" size="sm" aria-label="Smaller" onClick={() => save({ textScale: Math.max(75, p.textScale - 5) })}>A−</Button>
                            <Slider className="w-40" min={75} max={150} step={5} value={[p.textScale]} aria-label="Text size" onValueChange={v => setPrefs({ textScale: v[0] })} onValueCommit={() => flash('Saved')} />
                            <Button variant="outline" size="sm" aria-label="Bigger" onClick={() => save({ textScale: Math.min(150, p.textScale + 5) })}>A+</Button><output className="w-12 text-sm">{p.textScale}%</output></Opt>
                        <Opt title="Spacing in tables and forms" hint="Compact fits more rows on a laptop screen."><Seg value={p.density} list={[['compact', 'Compact'], ['normal', 'Normal'], ['comfortable', 'Roomy']]} onChange={v => save({ density: v })} /></Opt>
                        <Opt title="Colours" hint="Night mode is easier on the eyes in the dark; high contrast darkens faint text and borders. Printing is always normal."><Seg value={p.theme} list={[['light', 'Normal'], ['dark', 'Night'], ['contrast', 'High contrast']]} onChange={v => save({ theme: v })} /></Opt>
                        <Opt title="Reduce motion" hint="No sliding menus or animations.">{sw('reduceMotion')}</Opt></>)}

                    {card('layout', 'Menu & layout', <>
                        <Opt title="Keep the menu bar at the top while scrolling">{sw('stickyNav')}</Opt>
                        <Opt title="Show shortcut keys in the menus" hint="e.g. “Alt 1” next to Slip.">{sw('showKeyHints')}</Opt>
                        <Opt title="Show sync time next to the green dot" hint="Hover the dot to see it anyway.">{sw('showSyncText')}</Opt>
                        <Opt title="Show the support footer">{sw('showFooter')}</Opt>
                        <Opt title="Tables as cards on phones" hint="Off: tables keep their columns and scroll sideways. Takes effect when you open a page.">{sw('phoneCards')}</Opt></>)}

                    {card('menu', 'Menu builder', <div className="grid gap-3">
                        <Opt title="Menu position" hint="On laptops. Phones always open the menu from ☰."><Seg value={p.navLayout} list={[['top', 'Top (legacy)'], ['side', 'Left side']]} onChange={v => save({ navLayout: v })} /></Opt>
                        <p className="text-xs text-muted-foreground">Your own groups and pages — rename, reorder, move pages between groups, or take pages out of the menu. Groups hold pages; pages cannot hold more pages. Saved to your login on every device. Ctrl+K finds any page, even one not in the menu.</p>
                        <div className="grid gap-2">{groups.map((g, gi) => (
                            <div key={gi} className="grid gap-1.5 rounded-xl border p-2">
                                <div className="flex items-center gap-1.5"><Input key={g.label} className="h-8" maxLength={40} aria-label="Group name" defaultValue={g.label} onBlur={e => { if (e.target.value.trim() !== g.label) mutate(a => { a[gi].label = e.target.value.trim() || 'Untitled'; return 'Group renamed'; }); }} />
                                    <Button size="icon" variant="outline" className="size-8" aria-label="Move group up" disabled={gi === 0} onClick={() => mutate(a => { move(a, gi, gi - 1); return 'Order saved'; })}><ArrowUp className="size-4" /></Button>
                                    <Button size="icon" variant="outline" className="size-8" aria-label="Move group down" disabled={gi === groups.length - 1} onClick={() => mutate(a => { move(a, gi, gi + 1); return 'Order saved'; })}><ArrowDown className="size-4" /></Button>
                                    <Button size="icon" variant="outline" className="size-8 text-destructive" aria-label={`Delete group ${g.label}`} title="Delete the group (its pages go to “Not in the menu”)" onClick={async () => { if (await confirm({ title: `Delete the group “${g.label}”?`, body: 'Its pages go to “Not in the menu”.', confirmLabel: 'Delete' })) mutate(a => { a.splice(gi, 1); return 'Group deleted'; }); }}><X className="size-4" /></Button></div>
                                <ul className="grid gap-1">{g.views.map((id, pi) => (
                                    <li key={id} className="flex flex-wrap items-center gap-1.5 text-sm"><span className="grow">{label(id)}{cloud.canOpen(id, me) ? '' : <small className="text-muted-foreground"> (no access)</small>}</span>
                                        <Button size="icon" variant="outline" className="size-7" aria-label="Up" disabled={pi === 0} onClick={() => mutate(a => { move(a[gi].views, pi, pi - 1); return 'Order saved'; })}><ArrowUp className="size-3.5" /></Button>
                                        <Button size="icon" variant="outline" className="size-7" aria-label="Down" disabled={pi === g.views.length - 1} onClick={() => mutate(a => { move(a[gi].views, pi, pi + 1); return 'Order saved'; })}><ArrowDown className="size-3.5" /></Button>
                                        <select className={cn(sel, 'h-7 py-0')} aria-label={`Move ${label(id)} to`} value={gi} onChange={e => mutate(a => { const to = Number(e.target.value); const [v] = a[gi].views.splice(pi, 1); a[to].views.push(v); return `Moved to ${a[to].label}`; })}>{groups.map((x, i) => <option key={i} value={i}>{x.label}</option>)}</select>
                                        <Button size="icon" variant="outline" className="size-7" aria-label={`Take ${label(id)} out of the menu`} onClick={() => mutate(a => { a[gi].views.splice(pi, 1); return 'Taken out of the menu'; })}><X className="size-3.5" /></Button></li>))}
                                    {!g.views.length && <li className="text-xs text-muted-foreground">No pages — move some here, or delete the group.</li>}</ul></div>))}</div>
                        <div className="flex gap-2"><Input className="max-w-xs" maxLength={40} placeholder="New group name, e.g. My pages" value={newGroup} onChange={e => setNewGroup(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('mbAdd')?.click(); } }} />
                            <Button id="mbAdd" variant="outline" onClick={() => { const n = newGroup.trim(); if (!n) return; setNewGroup(''); mutate(a => { a.push({ label: n, views: [] }); return `Group “${n}” added — move pages into it`; }); }}>➕ Add group</Button></div>
                        <div><h3 className="mb-1 text-sm font-bold">Not in the menu</h3><div className="flex flex-wrap gap-2">{pool.length ? pool.map(id => <span key={id} className="inline-flex items-center gap-1.5 rounded-full border bg-accent/40 px-3 py-1 text-sm">{label(id)}
                            <select className={cn(sel, 'h-7 py-0')} aria-label={`Add ${label(id)} to a group`} value="" onChange={e => { if (e.target.value === '') return; mutate(a => { a[Number(e.target.value)].views.push(id); return `Added to ${a[Number(e.target.value)].label}`; }); }}><option value="">Add to…</option>{groups.map((x, i) => <option key={i} value={i}>{x.label}</option>)}</select></span>) : <span className="text-xs text-muted-foreground">Every page is in the menu.</span>}</div></div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button variant="outline" onClick={async () => { if (await confirm({ title: 'Go back to the standard menu?', body: 'Your groups are removed (the layout stays).', confirmLabel: 'Reset menu' })) save({ navMenu: null, navHidden: [] }, 'Standard menu back'); }}>Back to the standard menu</Button>
                            <Button variant="outline" onClick={() => dl(`pms-menu-${(me?.name || 'login').replace(/\W+/g, '-')}.json`, JSON.stringify({ pmsMenu: 1, navLayout: p.navLayout, navMenu: p.navMenu, navHidden: p.navHidden }, null, 2))}>⬇ Export menu</Button>
                            <Button variant="outline" onClick={() => menuFile.current?.click()}>⬆ Import menu</Button>
                            <input ref={menuFile} type="file" hidden accept="application/json,.json" onChange={async e => {
                                const f = e.target.files?.[0]; e.target.value = ''; if (!f) return;
                                try {
                                    const m = JSON.parse(await f.text());
                                    if (!m || m.pmsMenu !== 1 || (m.navMenu !== null && !Array.isArray(m.navMenu))) throw new Error('not a PMS menu file');
                                    const ok = (id: string) => views.some(v => v.id === id);
                                    save({ navLayout: m.navLayout === 'side' ? 'side' : 'top', navMenu: m.navMenu && m.navMenu.map((g: Row) => ({ label: String(g?.label || 'Untitled').slice(0, 40), views: (Array.isArray(g?.views) ? g.views : []).filter(ok) })), navHidden: Array.isArray(m.navHidden) ? m.navHidden.filter(ok) : [] }, 'Menu imported');
                                    setMbMsg({ t: 'Menu imported.', ok: true });
                                } catch (er: any) { setMbMsg({ t: `Could not import: ${er.message}`, ok: false }); }
                            }} />
                            <span role="status" className={cn('text-sm', mbMsg?.ok ? 'text-ok' : 'text-destructive')}>{mbMsg?.t}</span></div></div>)}

                    {card('quick', 'Quick links', <div className="grid gap-3">
                        <p className="text-xs text-muted-foreground">Pick the pages you use most. They show as buttons right under the menu bar, in this order.</p>
                        <div className="flex flex-wrap gap-2">{ql.length ? ql.map((id, i) => <span key={id} className="inline-flex items-center gap-1 rounded-full border bg-accent/40 px-2 py-1 text-sm">
                            <button type="button" disabled={i === 0} aria-label={`Move ${label(id)} left`} onClick={() => { const a = [...ql]; move(a, i, i - 1); save({ quickLinks: a }, 'Order saved'); }}>◀</button><b>{label(id)}</b>
                            <button type="button" disabled={i === ql.length - 1} aria-label={`Move ${label(id)} right`} onClick={() => { const a = [...ql]; move(a, i, i + 1); save({ quickLinks: a }, 'Order saved'); }}>▶</button>
                            <button type="button" aria-label={`Remove ${label(id)}`} onClick={() => save({ quickLinks: ql.filter(x => x !== id) }, 'Removed from quick links')}>✕</button></span>) : <span className="text-xs text-muted-foreground">No quick links yet — tick pages below.</span>}</div>
                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{NAV.map(c => ({ label: c.label, views: (c.views as string[]).filter(id => pages.some(v => v.id === id)) })).filter(g => g.views.length).map(g => (
                            <fieldset key={g.label} className="rounded-lg border p-2"><legend className="px-1 text-xs font-bold">{g.label}</legend>{g.views.map(id => <label key={id} className="flex items-center gap-2 py-0.5 text-sm"><Checkbox checked={ql.includes(id)} onCheckedChange={v => { const c = ql.filter(x => x !== id); save({ quickLinks: v === true ? [...c, id] : c }, v === true ? 'Added to quick links' : 'Removed from quick links'); }} />{label(id)}</label>)}</fieldset>))}</div>
                        <div><Button variant="outline" onClick={() => { prefsLib.resetPrefs(['quickLinks']); flash('Quick links removed'); }}>Remove all quick links</Button></div></div>)}

                    {card('keys', 'Keyboard shortcuts', <div className="grid gap-3">
                        <Opt title="Use shortcuts" hint="They never fire while you type in a field.">{sw('shortcutsOn')}</Opt>
                        <Opt title="Hold" hint="Pick another combination if Alt clashes with something on this computer."><Seg value={p.shortcutMod} list={[['alt', 'Alt'], ['alt+shift', 'Alt + Shift'], ['ctrl+alt', 'Ctrl + Alt']]} onChange={v => save({ shortcutMod: v })} /></Opt>
                        <p className="text-xs text-muted-foreground">Click a box and press a letter or digit. Backspace clears it.</p>
                        <div className={cn('grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3', !p.shortcutsOn && 'opacity-50')}>{pages.map(v => { const k = ((p.shortcuts || {})[v.id] || '').toUpperCase(); return (
                            <label key={v.id} className={cn('flex items-center justify-between gap-2 rounded-lg border px-2 py-1 text-sm', k && used[k]?.length > 1 && 'border-destructive bg-destructive/10')}><span>{v.id === 'home' ? 'Home' : v.label}</span>
                                <span className="flex items-center gap-1"><kbd className="text-xs">{prefsLib.modLabel()} +</kbd><Input className="h-8 w-12 text-center uppercase" maxLength={1} inputMode="none" aria-label={`Shortcut for ${v.label}`} value={k} onKeyDown={e => onKey(e, v.id)} onChange={() => { /* set by key */ }} /></span></label>); })}</div>
                        <div className="flex items-center gap-3"><Button variant="outline" onClick={() => { prefsLib.resetPrefs(['shortcuts', 'shortcutMod', 'shortcutsOn']); setKeysMsg(''); flash('Default shortcuts back'); }}>Default shortcuts</Button><span className="text-sm text-destructive">{keysMsg}</span></div></div>)}

                    {card('start', 'Start page', <>
                        <Opt title="Open this page" hint="When the PMS is opened without a page in the address."><select className={sel} value={p.startView} onChange={e => save({ startView: e.target.value })}>{pages.map(v => <option key={v.id} value={v.id}>{v.id === 'home' ? 'Home (overview)' : v.label}</option>)}</select></Opt>
                        {me?.role === 'admin' && <Opt title="Site" hint="“Last used” remembers Makkah or Medina."><select className={sel} value={p.startSite} onChange={e => save({ startSite: e.target.value })}><option value="last">Last used</option>{Object.values(SITES).map((s: Row) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></Opt>}</>)}

                    {card('slip', 'Slip page', <>
                        <Opt title="Building for a new slip"><select className={sel} value={p.slipDefaultBuilding || ''} onChange={e => save({ slipDefaultBuilding: e.target.value })}><option value="">None (choose each time)</option>{noSlipBld.map(n => <option key={n}>{n}</option>)}</select></Opt>
                        <Opt title="Check-in time for a new slip" hint="Empty = none."><Input type="time" className="w-32" value={p.slipCheckinTime || ''} onChange={e => save({ slipCheckinTime: e.target.value })} /><button type="button" className="text-sm text-primary underline" onClick={() => save({ slipCheckinTime: '' })}>clear</button></Opt>
                        <Opt title="Check-out time for a new slip"><Input type="time" className="w-32" value={p.slipCheckoutTime || ''} onChange={e => save({ slipCheckoutTime: e.target.value })} /><button type="button" className="text-sm text-primary underline" onClick={() => save({ slipCheckoutTime: '' })}>clear</button></Opt>
                        <Opt title="Load the slip when an SH is typed into an empty form">{sw('slipAutoLoadSh')}</Opt>
                        <Opt title="Pick rooms…: hide full rooms at first">{sw('pickerOnlyFree')}</Opt>
                        <Opt title="From / To on the slip" hint="Adds “From” and “To” to every slip — where the group or self comes from and goes to (Madina Airport, Jeddah Airport, Makkah, Medina, by car, by bus, by train). Off: the fields are hidden (anything already saved is kept).">{sw('slipFromTo')}</Opt>
                        <Opt title="24-hour times" hint="Off (default): times are shown am / pm. On: the Slip page's time fields and times use 24 hours (15:00).">{sw('time24')}</Opt></>)}

                    {card('checkins', 'Check-ins page', <>
                        <Opt title="Split by from / to" hint="Check-ins in two tables, from the airport and from the other city; check-outs in two, departing to the airport and to the other city. The page's own tick can still switch it.">{sw('checkinsSplit')}</Opt>
                        <Opt title="Columns" hint="Ticked columns show. Each table always shows its own date & time (Check-in in Check-ins, Check-out in Check-outs); “the other date & time” is the check-out in Check-ins and the check-in in Check-outs. Export CSV follows the same columns." />
                        <div className="grid gap-3 sm:grid-cols-2">{([['checkinsHideIn', 'Check-ins table'], ['checkinsHideOut', 'Check-outs table']] as const).map(([key, title]) => (
                            <fieldset key={key} className="rounded-lg border p-2"><legend className="px-1 text-xs font-bold">{title}</legend>{libs.cols.map(([id, l]) => (
                                <label key={id} className="flex items-center gap-2 py-0.5 text-sm"><Checkbox checked={!(p[key] || []).includes(id)} onCheckedChange={v => { const set = new Set<string>(p[key] || []); if (v === true) set.delete(id); else set.add(id); save({ [key]: libs.cols.map(c => c[0]).filter(x => set.has(x)) }, v === true ? 'Column shown' : 'Column hidden'); }} />{l}</label>))}</fieldset>))}</div>
                        <div className="mt-2"><Button variant="outline" onClick={() => { prefsLib.resetPrefs(['checkinsHideIn', 'checkinsHideOut']); flash('Standard columns back'); }}>Back to standard columns</Button></div></>)}

                    {card('data', 'Data & privacy', <Opt title="Check for other desks' changes every" hint="Pages also refresh when you open them and when the connection returns.">
                        <select className={sel} value={String(p.syncSeconds)} onChange={e => save({ syncSeconds: Number(e.target.value) })}>{[['15', '15 seconds'], ['30', '30 seconds'], ['60', '1 minute'], ['300', '5 minutes'], ['0', 'Only when I open a page']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Opt>)}

                    {card('backup', 'Backup & reset', <div className="grid gap-3">
                        <p className="text-xs text-muted-foreground">Keep a copy of your settings as a file, load one back, or start over.</p>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button variant="outline" onClick={() => dl(`pms-settings-${new Date().toISOString().slice(0, 10)}.json`, prefsLib.exportPrefs())}>Download my settings</Button>
                            <Button variant="outline" onClick={() => fileRef.current?.click()}>Load settings file…</Button>
                            <input ref={fileRef} type="file" hidden accept=".json,application/json" onChange={async e => { const f = e.target.files?.[0]; e.target.value = ''; if (!f) return; try { prefsLib.importPrefs(await f.text()); setBkMsg({ t: 'Settings loaded.', ok: true }); } catch (er: any) { setBkMsg({ t: `Could not load: ${er.message}`, ok: false }); } }} />
                            <Button variant="outline" className="text-destructive" onClick={async () => { if (await confirm({ title: 'Reset everything to default?', body: 'All your settings go back to default (on every device). Your password is not affected.', confirmLabel: 'Reset' })) { prefsLib.resetPrefs(); flash('Everything back to default'); } }}>Reset everything to default</Button>
                            <span role="status" className={cn('text-sm', bkMsg?.ok ? 'text-ok' : 'text-destructive')}>{bkMsg?.t}</span></div></div>)}
                </div>
            </div>
            <div role="status" aria-live="polite" className={cn('pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-sm text-background transition-opacity', toast ? 'opacity-100' : 'opacity-0')}>{toast}</div>
            {confirmDialog}
        </div>
    );
}
