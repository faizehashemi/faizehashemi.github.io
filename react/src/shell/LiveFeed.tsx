import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Live changes: every open PMS asks the server for the changes other logins made (GET /api/activity, worker.js) and shows each as a toast —
// "Room 101 → 105 · SH 44001 · by Desk 3", a UMS import as one toast with its slips. After time away — a fresh login, the tab hidden for a while,
// or no use of the page for a while — the changes come together in a pop-up instead ("since you were last here"). A new login starts from now.
// The server keeps what each login has seen (desks.seen_activity), so a login on another computer is not shown the same changes twice.

type Item = { id: number; at: string; site: string; desk_id: number | null; desk_name: string; kind: string; sh: string; grp: string; text: string; items: { sh: string; grp: string; text: string }[] | null };
type Cloud = { request: (m: string, p: string, b?: unknown) => Promise<any> };

const POLL_MS = 20_000, AWAY_MS = 10 * 60_000, TOASTS_AT_ONCE = 4;
const BULK: Record<string, string> = {
    'ums-import': 'UMS import', 'ums-undo': 'UMS import undone', 'ums-redo': 'UMS import redone', 'allocate-day': 'Room allocation', 'alloc-undo': 'Room allocation undone',
    planner: 'Room planner', delay: 'Delayed departures', 'from-to-fill': 'From / To filled', 'json-import': 'Slips imported', bulk: 'Many slips',
};
const bulkName = (k: string) => BULK[k.replace(/^bulk:/, '')] || k.replace(/^bulk:/, '');
const shLabel = (x: { sh: string; grp: string }) => [x.sh && `SH ${x.sh}`, x.grp].filter(Boolean).join(' · ');
const time = (at: string) => new Date(at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const when = (at: string) => new Date(at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function show(it: Item, openAll: () => void) {
    if (it.kind.startsWith('bulk:')) {
        const list = it.items || [];
        toast(`${bulkName(it.kind)} by ${it.desk_name}`, {
            description: `${it.text || `${list.length} slips`}: ${list.slice(0, 3).map(x => `${x.sh ? 'SH ' + x.sh : ''} ${x.text}`.trim()).join(' · ')}${list.length > 3 ? ` · +${list.length - 3} more` : ''}`,
            duration: 12_000, action: list.length > 3 ? { label: 'View', onClick: openAll } : undefined,
        });
        return;
    }
    toast(`${cap(it.text)}`, { description: `${shLabel(it)} — by ${it.desk_name} · ${time(it.at)}`, duration: 9_000 });
}

export function LiveFeed({ cloud, siteId, deskId }: { cloud: Cloud; siteId: string; deskId: number }) {
    const last = useRef<number | null>(null);
    const lastUse = useRef(Date.now()), hiddenAt = useRef<number | null>(null), held = useRef<Item[]>([]), busy = useRef(false);
    const [modal, setModal] = useState<{ title: string; items: Item[] } | null>(null);
    const recent = useRef<Item[]>([]);

    useEffect(() => {
        let alive = true;
        last.current = null; held.current = []; recent.current = [];
        const others = (list: Item[]) => list.filter(x => x.desk_id !== deskId);
        const seen = (id: number) => { void cloud.request('POST', '/api/activity/seen', { id }).catch(() => { /* next time */ }); };
        const openAll = () => setModal({ title: 'Recent changes', items: [...recent.current].reverse() });
        async function poll(mode: 'toast' | 'away' = 'toast') {
            if (busy.current || !alive) return;
            busy.current = true;
            try {
                const first = last.current == null;
                const r = await cloud.request('GET', `/api/activity?site=${siteId}${first ? '' : `&after=${last.current}`}`);
                if (!alive) return;
                const got = others(r.items || []);
                const before = last.current ?? 0;
                last.current = Math.max(before, Number(r.last) || 0, ...(r.items || []).map((x: Item) => x.id));   // ids count across both sites
                recent.current = [...recent.current, ...got].slice(-200);
                const idle = Date.now() - lastUse.current >= AWAY_MS;
                if (first || mode === 'away') {
                    const all = [...held.current, ...got]; held.current = [];
                    if (all.length) setModal({ title: first ? 'Changes since you were last here' : 'Changes while you were away', items: [...all].reverse() });
                } else if (idle || document.visibilityState !== 'visible') {
                    held.current = [...held.current, ...got].slice(-300);   // shown together when the desk comes back
                } else if (got.length > TOASTS_AT_ONCE) {
                    toast(`${got.length} changes by ${[...new Set(got.map(x => x.desk_name))].join(', ')}`, { description: got.slice(-3).map(x => x.kind.startsWith('bulk:') ? bulkName(x.kind) : `${x.sh ? 'SH ' + x.sh + ': ' : ''}${x.text}`).join(' · '), duration: 12_000, action: { label: 'View', onClick: openAll } });
                } else for (const it of got) show(it, openAll);
                if (last.current > before || first) seen(last.current);
            } catch { /* offline or logged out: next round */ }
            finally { busy.current = false; }
        }
        void poll();
        const t = window.setInterval(() => { if (document.visibilityState === 'visible') void poll(); }, POLL_MS);
        const onVis = () => {
            if (document.visibilityState === 'hidden') { hiddenAt.current = Date.now(); return; }
            const away = hiddenAt.current != null && Date.now() - hiddenAt.current >= AWAY_MS;
            hiddenAt.current = null;
            void poll(away || held.current.length ? 'away' : 'toast');
        };
        const onUse = () => {
            const wasIdle = Date.now() - lastUse.current >= AWAY_MS;
            lastUse.current = Date.now();
            if (wasIdle) void poll('away');
        };
        document.addEventListener('visibilitychange', onVis);
        for (const e of ['pointerdown', 'keydown', 'wheel'] as const) window.addEventListener(e, onUse, { passive: true });
        return () => {
            alive = false; window.clearInterval(t);
            document.removeEventListener('visibilitychange', onVis);
            for (const e of ['pointerdown', 'keydown', 'wheel'] as const) window.removeEventListener(e, onUse);
        };
    }, [siteId, deskId]);   // eslint-disable-line react-hooks/exhaustive-deps

    const n = modal ? modal.items.reduce((s, x) => s + (x.items ? x.items.length : 1), 0) : 0;
    return (
        <Dialog open={!!modal} onOpenChange={o => { if (!o) setModal(null); }}>
            <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col">
                <DialogHeader><DialogTitle>🔔 {modal?.title}</DialogTitle>
                    <DialogDescription>{n} change{n === 1 ? '' : 's'} made by other logins{modal?.items.length ? `, from ${when(modal.items[modal.items.length - 1].at)}` : ''}.</DialogDescription></DialogHeader>
                <ol className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1">
                    {modal?.items.map(it => (
                        <li key={it.id} className="rounded-lg border bg-card p-2.5 text-sm">
                            <div className="flex flex-wrap items-baseline justify-between gap-2"><b>{it.kind.startsWith('bulk:') ? `${bulkName(it.kind)} — ${it.text}` : shLabel(it) || 'Slip'}</b>
                                <small className="text-muted-foreground">{it.desk_name} · {when(it.at)}</small></div>
                            {it.kind.startsWith('bulk:')
                                ? <ul className="mt-1 space-y-0.5 text-[13px]">{(it.items || []).slice(0, 60).map((x, i) => <li key={i}><span className="font-medium">{shLabel(x)}</span>: {x.text}</li>)}{(it.items || []).length > 60 && <li className="text-muted-foreground">… and {(it.items || []).length - 60} more</li>}</ul>
                                : <div className="mt-0.5">{cap(it.text)}</div>}
                        </li>))}
                </ol>
                <Button onClick={() => setModal(null)}>Got it</Button>
            </DialogContent>
        </Dialog>
    );
}
