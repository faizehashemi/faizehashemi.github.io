import { useMemo, useState } from 'react';
import { Printer, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSlips } from '@/hooks/useSlips';
import { useCore, useSite } from '@/pms/PmsContext';
import { paxOf, printPassportSlip, roomList } from './passport';

// Passport slip (Accounts): find a group by its SH number, then print the note that asks the reception to hand back its passports because the dues are cleared.
type Row = Record<string, any>;
const base = (v: unknown) => String(v ?? '').trim().toUpperCase().replace(/^S(?=\d)/, '');

export default function PassportPage() {
    const { stay, ums } = useCore();
    const { site } = useSite();
    const slips = useSlips();
    const [sh, setSh] = useState(''), [q, setQ] = useState('');
    const [msg, setMsg] = useState('');
    const found = useMemo(() => {
        const want = base(q);
        if (!want) return [] as Row[];
        const all = (slips.data ?? []).filter(s => base((ums as any).baseSh ? (ums as any).baseSh(s.sh_no) : s.sh_no) === want || base(s.sh_no) === want);
        return all.sort((a, b) => String(b.checkin_date).localeCompare(String(a.checkin_date)));
    }, [q, slips.data, ums]);
    const go = () => { setMsg(''); setQ(sh); };
    const print = (s: Row) => { if (!printPassportSlip(s, site.label)) setMsg('The browser blocked the new tab. Allow pop-ups for this site, then press the button again.'); };

    return (
        <div className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)] gap-3 px-3 pb-10 pt-4 sm:px-4">
            <header>
                <h1 className="text-2xl font-bold text-primary">Passport slip</h1>
                <p className="text-sm text-muted-foreground">Type a group's SH number, then print the slip that asks the reception to give the group its passports because the dues are cleared.</p>
            </header>
            <form className="flex flex-wrap items-end gap-2" onSubmit={e => { e.preventDefault(); go(); }}>
                <div className="grid gap-1"><Label htmlFor="ppSh">SH number</Label><Input id="ppSh" className="w-48" inputMode="numeric" autoComplete="off" autoFocus placeholder="e.g. 44434" value={sh} onChange={e => setSh(e.target.value)} /></div>
                <Button type="submit" disabled={!sh.trim()}><Search className="size-4" />Find</Button>
            </form>
            {msg && <div className="rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">{msg}</div>}
            {q && !slips.isLoading && !found.length && <p className="text-muted-foreground">No slip with SH {q} at {site.label}.</p>}
            {found.map(s => {
                const rooms = roomList(s);
                return (
                    <Card key={s.id}><CardContent className="grid gap-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div><h2 className="text-lg font-bold">SH {s.sh_no} <span className="font-normal text-muted-foreground">· {s.tour_name || '—'}</span></h2>
                                <p className="text-sm text-muted-foreground">{String(s.group_leader || '').trim() || '—'}</p></div>
                            <Button onClick={() => print(s)}><Printer className="size-4" />Print passport release slip</Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                            <div><span className="block text-xs text-muted-foreground">Building</span><b>{s.building || '—'}</b></div>
                            <div><span className="block text-xs text-muted-foreground">Pax</span><b>{paxOf(s) || '—'}</b></div>
                            <div><span className="block text-xs text-muted-foreground">Check-in</span><b>{(s.checkin_date || '').split('-').reverse().join('/')} {s.checkin_time || ''}</b></div>
                            <div><span className="block text-xs text-muted-foreground">Check-out</span><b>{(s.checkout_date || '').split('-').reverse().join('/')} {s.checkout_time || ''}{(stay as any).isDelayed?.(s) ? ' (delayed)' : ''}</b></div>
                            <div className="col-span-2 sm:col-span-4"><span className="block text-xs text-muted-foreground">Rooms</span><b>{rooms.join(', ') || '—'}</b></div>
                        </div>
                    </CardContent></Card>
                );
            })}
        </div>
    );
}
