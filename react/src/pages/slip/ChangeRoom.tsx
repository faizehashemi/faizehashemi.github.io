import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cleanRoom, parseDT, type Form, type RoomRow } from './slip';

// Change room during a stay: from the chosen moment the guests of a room move to another one. The room they leave stays theirs up to that moment (nobody else's
// booking in it is touched) and the new room is checked only from that moment to the end of their stay, at its busiest moment, against every other slip —
// a room that would clash cannot be chosen. Applying changes the form; Edit saves it, with the slip's normal availability check.

type Row = Record<string, any>;
const pad = (n: number) => String(n).padStart(2, '0');
const toLocal = (d: Date) => ({ date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}` });
const short = (ms: number) => new Date(ms).toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const natural = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true });

export type Choice = { room: string; capacity: number | string; building: string; until: { date: string; time: string } };

export function ChangeRoom({ row, form, gents, ladies, mine, slips, buildings, names, stay, rooms, onApply, onClose }: {
    row: RoomRow; form: Form; gents: RoomRow[]; ladies: RoomRow[]; mine: Row; slips: Row[]; buildings: Row[]; names: string[]; stay: any; rooms: any;
    onApply: (c: Choice) => void; onClose: () => void;
}) {
    const here = (row.building || '').trim() || form.building, room = cleanRoom(row.room_no);
    const same = (r: RoomRow) => cleanRoom(r.room_no) === room && ((r.building || '').trim() || form.building) === here;
    const moving = [...gents.filter(same).map(r => ({ r, side: 'gents' })), ...ladies.filter(same).map(r => ({ r, side: 'ladies' }))];
    const beds = moving.reduce((n, { r }) => n + (Number(r.assigned) || 0), 0), exclusive = moving.some(({ r }) => r.exclusive);
    const start = parseDT(form.checkin_date, form.checkin_time), end = parseDT(row.out_date || form.checkout_date, row.out_date ? row.out_time : form.checkout_time);
    const lastMove = row.moves?.[row.moves.length - 1], after = (lastMove && parseDT(lastMove.until.date, lastMove.until.time)) || start;
    const [at, setAt] = useState(() => { const now = new Date(); return toLocal(after && end && now > after && now < end ? now : after || now); });
    const [bld, setBld] = useState(here), [pick, setPick] = useState('');
    const when = parseDT(at.date, at.time);
    const problem = !when ? 'Choose the date and time of the change.' : after && +when <= +after ? `The change must be after ${short(+after)}.` : end && +when >= +end ? `The change must be before the stay ends (${short(+end)}).` : '';

    // every room of the building from the change to the end of the stay: the other slips, and this slip's rows that do not move
    const list = useMemo(() => {
        if (problem || !when || !end) return [];
        const others = [...slips, { ...mine, rooms: { gents: (mine.rooms?.gents || []).filter((x: Row) => !(cleanRoom(x.room_no) === room)), ladies: (mine.rooms?.ladies || []).filter((x: Row) => !(cleanRoom(x.room_no) === room)) } }];
        const use = stay.roomsUse(others, bld, +when, +end) as Map<string, { peak: number; who: Row[] }>;
        const sides = new Set(moving.map(m => m.side));
        return (rooms.activeRooms(buildings, bld) as Row[]).filter(r => !(bld === here && cleanRoom(r.room_no) === room)).map(r => {
            const cap = Number(r.capacity) || 0, u = use.get(rooms.normRoom(r.room_no)) || { peak: 0, who: [] }, free = Math.max(0, cap - u.peak);
            const wrong = (r.type === 'gents' || r.type === 'ladies') && [...sides].some(s => s !== r.type);
            const first = u.who[0];
            const why = wrong ? `a ${r.type} room` : exclusive && u.peak ? 'not empty (Exclusive needs the whole room)' : free < beds ? `${free} free, needs ${beds}${first ? ` — SH ${first.sh} until ${short(first.end)}` : ''}` : '';
            return { no: String(r.room_no), cap, free, why };
        }).sort((a, b) => Number(!!a.why) - Number(!!b.why) || natural(a.no, b.no));
    }, [problem, at.date, at.time, bld]);   // eslint-disable-line react-hooks/exhaustive-deps
    const chosen = list.find(x => x.no === pick && !x.why);

    return (
        <Dialog open onOpenChange={o => { if (!o) onClose(); }}>
            <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-md">
                <DialogHeader><DialogTitle>Change room {room}</DialogTitle></DialogHeader>
                <p className="text-sm text-muted-foreground">{beds} guest{beds === 1 ? '' : 's'}{moving.length > 1 ? ' (gents and ladies rows of this room)' : ''}. They keep room {room} until the change; the new room is checked from then to the end of the stay{end ? ` (${short(+end)})` : ''}.</p>
                <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-1"><Label htmlFor="crDate">Moves on</Label><Input id="crDate" type="date" value={at.date} onChange={e => { setAt(a => ({ ...a, date: e.target.value })); setPick(''); }} /></div>
                    <div className="grid gap-1"><Label htmlFor="crTime">At</Label><Input id="crTime" type="time" value={at.time} onChange={e => { setAt(a => ({ ...a, time: e.target.value })); setPick(''); }} /></div>
                </div>
                <div className="grid gap-1"><Label htmlFor="crBld">Building</Label>
                    <select id="crBld" className="h-9 rounded-md border bg-background px-2 text-sm" value={bld} onChange={e => { setBld(e.target.value); setPick(''); }}>{[...new Set([here, ...names])].map(n => <option key={n}>{n}</option>)}</select></div>
                {problem ? <p className="text-sm text-destructive">{problem}</p> : <div className="grid gap-1"><Label htmlFor="crRoom">New room</Label>
                    <select id="crRoom" size={8} className="rounded-md border bg-background p-1 text-sm" value={pick} onChange={e => setPick(e.target.value)}>
                        {list.map(x => <option key={x.no} value={x.no} disabled={!!x.why}>{x.no} — {x.why || `${x.free} of ${x.cap} beds free`}</option>)}</select>
                    {!list.length && <span className="text-sm text-muted-foreground">No rooms set up for this building in Rooms &amp; Buildings.</span>}
                    <span className="text-xs text-muted-foreground">Rooms that would clash with another stay cannot be chosen.</span></div>}
                <DialogFooter className="gap-2"><Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button disabled={!!problem || !chosen} onClick={() => onApply({ room: chosen!.no, capacity: chosen!.cap, building: bld, until: at })}>Change room</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
