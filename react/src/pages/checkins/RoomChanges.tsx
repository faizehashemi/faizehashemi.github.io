import { useEffect, useState } from 'react';
import { BedDouble, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Check-ins: the room changes of the last 24 hours (rooms assigned, moved, removed, building changed — by any login, a UMS import included) as
// cards at the top of the page, newest first; each one closes with ✕ (remembered on this computer). From the live-changes feed (GET /api/activity).

type Act = { id: number; at: string; desk_name: string; kind: string; sh: string; grp: string; text: string; items: { sh: string; grp: string; text: string }[] | null };
type Card = { key: string; at: string; who: string; sh: string; grp: string; text: string; via: string };
const ROOMISH = /\broom|building/i;
const keyOf = (site: string) => `pms_room_cards_closed:${site}`;
const readClosed = (site: string): string[] => { try { return JSON.parse(localStorage.getItem(keyOf(site)) || '[]'); } catch { return []; } };
const when = (at: string) => new Date(at).toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
// only the room parts of a change line ("Gents room 101 → 105 · check-out …" → "Gents room 101 → 105")
const roomPart = (t: string) => t.split(' · ').filter(p => ROOMISH.test(p)).join(' · ');

export function cardsOf(items: Act[]): Card[] {
    const out: Card[] = [];
    for (const a of items) {
        if (a.items) a.items.forEach((x, i) => { if (ROOMISH.test(x.text)) out.push({ key: `${a.id}:${i}`, at: a.at, who: a.desk_name, sh: x.sh, grp: x.grp, text: roomPart(x.text), via: a.kind.replace(/^bulk:/, '') }); });
        else if (ROOMISH.test(a.text)) out.push({ key: String(a.id), at: a.at, who: a.desk_name, sh: a.sh, grp: a.grp, text: roomPart(a.text), via: '' });
    }
    return out.reverse();
}

export function RoomChanges({ cloud, siteId }: { cloud: { request: (m: string, p: string) => Promise<any> }; siteId: string }) {
    const [cards, setCards] = useState<Card[]>([]);
    const [closed, setClosed] = useState<string[]>(() => readClosed(siteId));
    useEffect(() => {
        let off = false;
        const load = () => cloud.request('GET', `/api/activity?site=${siteId}&hours=24`).then(r => { if (!off) setCards(cardsOf(r.items || [])); }, () => { /* offline: keep what is shown */ });
        void load();
        const t = window.setInterval(() => { if (document.visibilityState === 'visible') void load(); }, 30_000);
        const onSync = () => { void load(); };   // this desk's own save reached the server, or another desk's change came in
        window.addEventListener('pms:sync', onSync);
        return () => { off = true; window.clearInterval(t); window.removeEventListener('pms:sync', onSync); };
    }, [siteId]);   // eslint-disable-line react-hooks/exhaustive-deps
    const close = (keys: string[]) => {
        const next = [...new Set([...closed, ...keys])].slice(-800);
        setClosed(next);
        try { localStorage.setItem(keyOf(siteId), JSON.stringify(next)); } catch { /* not kept */ }
    };
    const open = cards.filter(c => !closed.includes(c.key));
    if (!open.length) return null;
    return (
        <section aria-label="Room changes in the last 24 hours" className="grid gap-2 print:hidden">
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-300"><BedDouble className="size-4" />Room changes · last 24 hours ({open.length})
                {open.length > 1 && <Button size="sm" variant="ghost" className="ml-auto h-7" onClick={() => close(open.map(c => c.key))}>Close all</Button>}</div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {open.slice(0, 30).map(c => (
                    <div key={c.key} role="status" className="relative rounded-xl border border-amber-300 bg-amber-50 p-3 pr-9 text-sm shadow-sm dark:border-amber-700 dark:bg-amber-950/40">
                        <button type="button" aria-label="Close this card" className="absolute right-2 top-2 rounded p-1 text-amber-900/70 hover:bg-amber-200/60 dark:text-amber-200" onClick={() => close([c.key])}><X className="size-4" /></button>
                        <b className="block">{[c.sh && `SH ${c.sh}`, c.grp].filter(Boolean).join(' · ') || 'Slip'}</b>
                        <span className="block text-[15px] font-semibold text-amber-900 dark:text-amber-200">{c.text.charAt(0).toUpperCase() + c.text.slice(1)}</span>
                        <small className="text-muted-foreground">{c.via ? `${c.via === 'ums-import' ? 'UMS import' : c.via} · ` : ''}by {c.who} · {when(c.at)}</small>
                    </div>))}
            </div>
            {open.length > 30 && <p className="text-xs text-muted-foreground">… and {open.length - 30} more.</p>}
        </section>
    );
}
