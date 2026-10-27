import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCore } from '@/pms/PmsContext';

/** ◀ [date] ▶ Today · "earlier / later day with a list" jumps. `days` = [{ day, n }] saved in the cloud. */
export function DayNav({ day, days, onChange }: { day: string; days: { day: string; n: number }[]; onChange: (d: string) => void }) {
    const t = useCore().transport as any;
    const saved = days.map(d => d.day);
    const prev = [...saved].reverse().find(d => d < day), next = saved.find(d => d > day);
    const here = days.find(d => d.day === day);
    const today = t.today() as string;
    return (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-2">
            <Button variant="outline" size="icon" aria-label="Previous day" title="Previous day" onClick={() => onChange(t.addDays(day, -1))}><ChevronLeft className="size-4" /></Button>
            <Input type="date" className="w-auto" value={day} aria-label="Day" onChange={e => e.target.value && onChange(e.target.value)} />
            <Button variant="outline" size="icon" aria-label="Next day" title="Next day" onClick={() => onChange(t.addDays(day, 1))}><ChevronRight className="size-4" /></Button>
            <Button variant="outline" disabled={day === today} onClick={() => onChange(today)}>Today</Button>
            <b className="text-sm">{t.longDate(day)}</b>
            <span className="text-xs text-muted-foreground">{here ? `${here.n} trips saved` : 'no list saved for this day'}</span>
            <span className="ml-auto flex gap-3 text-xs">
                {prev && <button type="button" className="text-primary underline" onClick={() => onChange(prev)}>← {prev}</button>}
                {next && <button type="button" className="text-primary underline" onClick={() => onChange(next)}>{next} →</button>}
            </span>
        </div>
    );
}

export const cleanText = (v: unknown) => String(v ?? '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
