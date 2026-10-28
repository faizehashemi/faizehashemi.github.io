import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCore, useGuard, useSite } from '@/pms/PmsContext';
import { MONTHS, hasRooms, paxCharts, type Grid } from './paxchart';

// Pax counts, step by step: first the questions (where · which year · what to count · which chart), then the answer.
// Beside the steps the current week is always on show — guests staying each night and guests arriving each day.
const LABEL: Record<string, string> = { makkah: 'MAKKAH', medina: 'MADINA' };
const PLACE: Record<string, [string, string]> = { makkah: ['🕋', 'Makkah'], medina: ['🕌', 'Madina'] };
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Pick = { site: string; year: string; actual: boolean; show: 'both' | 'count' | 'arrivals' };

// a green that deepens with the number (the biggest number of the table is the deepest)
const shade = (v: number, max: number, arrivals: boolean) => (v && max ? `color-mix(in srgb, ${arrivals ? '#2f9e44' : '#d4af37'} ${Math.round(18 + 62 * (v / max))}%, #fffaf0)` : undefined);

function ChartTable({ values, year, arrivals }: { values: Grid; year: number; arrivals: boolean }) {
    const now = new Date();
    const today = now.getFullYear() === year ? `${now.getMonth()}-${now.getDate()}` : '';
    const max = Math.max(0, ...values.flat());
    return (
        <div className="overflow-x-auto px-3 sm:px-4">
            <table className="w-full min-w-[980px] text-[11px] font-bold">
                <thead>
                    <tr>
                        <th className="border border-border p-1.5 text-center font-extrabold">Mth</th>
                        {Array.from({ length: 31 }, (_, i) => <th key={i} className="border border-border p-1.5 text-center font-extrabold">{i + 1}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {MONTHS.map((m, mi) => {
                        const days = new Date(year, mi + 1, 0).getDate();
                        return (
                            <tr key={m}>
                                <th className="min-w-[90px] border border-border p-1.5 pl-2 text-left font-medium">{m}</th>
                                {Array.from({ length: 31 }, (_, di) => {
                                    if (di >= days) return <td key={di} className="border border-border bg-[#fad4da]" />;
                                    const v = values[mi][di];
                                    const isToday = `${mi}-${di + 1}` === today;
                                    return (
                                        <td key={di} style={isToday ? undefined : { background: shade(v, max, arrivals) }} className={cn('border border-border p-1.5 text-center', isToday && 'bg-[#c9dcf5] text-[#d6336c] ring-2 ring-inset ring-[#d6336c]')}>
                                            {v || '-'}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

// seven bars, today ringed, the busiest day flagged
function WeekBars({ title, emoji, days, values, tone }: { title: string; emoji: string; days: Date[]; values: number[]; tone: string }) {
    const max = Math.max(1, ...values), peak = values.indexOf(Math.max(...values)), total = values.reduce((a, b) => a + b, 0);
    const today = new Date().toDateString();
    return (
        <div className="grid gap-2 rounded-xl border bg-card p-3">
            <div className="flex items-baseline justify-between gap-2"><b className="text-sm">{emoji} {title}</b><span className="text-xs text-muted-foreground">week total <b className="text-foreground">{total.toLocaleString()}</b></span></div>
            <div className="grid grid-cols-7 items-end gap-1.5" style={{ height: 150 }}>
                {values.map((v, i) => (
                    <div key={i} className="flex h-full min-w-0 flex-col items-center justify-end gap-1" title={`${days[i].toDateString()}: ${v}`}>
                        <span className="text-[11px] font-bold tabular-nums">{v ? v.toLocaleString() : '–'}</span>
                        <div className={cn('w-full rounded-t-md transition-all', tone, days[i].toDateString() === today && 'ring-2 ring-[#d6336c]')} style={{ height: `${Math.max(v ? 6 : 2, Math.round((v / max) * 100))}px`, opacity: v ? 1 : 0.25 }} />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] text-muted-foreground">
                {days.map((d, i) => <span key={i} className={cn(d.toDateString() === today && 'font-extrabold text-[#d6336c]')}>{DOW[d.getDay()]}<br />{d.getDate()}{total > 0 && i === peak && values[i] > 0 ? ' 🔥' : ''}</span>)}
            </div>
        </div>
    );
}

const Choice = ({ on, onClick, emoji, title, hint }: { on: boolean; onClick: () => void; emoji: string; title: string; hint?: string }) => (
    <button type="button" onClick={onClick} aria-pressed={on} className={cn('grid gap-0.5 rounded-xl border-2 p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md', on ? 'border-gold bg-accent shadow-md' : 'border-border bg-card')}>
        <span className="text-2xl">{emoji}</span><b className="text-sm">{title}</b>{hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </button>
);

export default function PaxChartPage() {
    const { cloud, stay } = useCore();
    const guard = useGuard();
    const { siteId } = useSite();
    const thisYear = new Date().getFullYear();
    const [pick, setPick] = useState<Pick>({ site: siteId, year: String(thisYear), actual: false, show: 'both' });
    const [step, setStep] = useState(0);
    const [done, setDone] = useState<Pick | null>(null);
    const set = <K extends keyof Pick>(k: K, v: Pick[K]) => setPick(p => ({ ...p, [k]: v }));

    const slips = useQuery({ queryKey: ['mirror-all'], queryFn: () => guard(cloud.mirrorAll()) });
    const list = (site: string, actual: boolean) => (slips.data ?? []).filter((r: any) => !r.deleted && r.site === site && (!actual || hasRooms(r)));

    // the current week (Monday → Sunday) for the place picked in step 1, whatever year is chosen below
    const week = useMemo(() => {
        if (!slips.data) return null;
        const t = new Date(); t.setHours(12, 0, 0, 0);
        const mon = new Date(t); mon.setDate(t.getDate() - ((t.getDay() + 6) % 7));
        const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d; });
        const rows = list(pick.site, pick.actual);
        const years = [...new Set(days.map(d => d.getFullYear()))];
        const by = new Map(years.map(y => [y, paxCharts(rows, y, stay)]));
        const at = (d: Date, k: 'count' | 'arrivals') => by.get(d.getFullYear())![k][d.getMonth()][d.getDate() - 1];
        return { days, count: days.map(d => at(d, 'count')), arrivals: days.map(d => at(d, 'arrivals')) };
    }, [slips.data, pick.site, pick.actual, stay]);   // eslint-disable-line react-hooks/exhaustive-deps

    const charts = useMemo(() => (slips.data && done ? paxCharts(list(done.site, done.actual), Number(done.year), stay) : null), [slips.data, done, stay]);   // eslint-disable-line react-hooks/exhaustive-deps

    const STEPS: [string, string][] = [['📍', 'Where'], ['📅', 'Year'], ['🧾', 'Count'], ['📊', 'Chart']];
    const summary = [`${PLACE[pick.site][0]} ${PLACE[pick.site][1]}`, `📅 ${pick.year}`, pick.actual ? '🛏️ Rooms assigned' : '📝 Registrations', pick.show === 'both' ? '📊 Both charts' : pick.show === 'count' ? '👥 Pax count' : '🛬 Arrivals'];

    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-4 px-3 pb-10 pt-4 text-[13px] sm:px-4">
            <header>
                <h1 className="text-2xl font-extrabold text-primary">📊 Pax counts</h1>
                <p className="text-sm text-muted-foreground">Answer four quick steps and the chart appears. The week on the right is always up to date.</p>
            </header>

            <div className="grid items-start gap-4 lg:grid-cols-2">
                {/* ---------------------------------------- the steps ---------------------------------------- */}
                <Card className="gap-3 py-4">
                    <CardContent className="grid gap-4 px-4">
                        <ol className="flex items-center gap-1.5" aria-label="Steps">
                            {STEPS.map(([emoji, name], i) => (
                                <li key={name} className="flex flex-1 items-center gap-1.5">
                                    <button type="button" onClick={() => setStep(i)} className={cn('grid flex-1 justify-items-center gap-0.5 rounded-lg border px-1 py-1.5 text-xs font-bold transition', i === step ? 'border-gold bg-accent' : i < step ? 'border-ok/50 bg-ok/10' : 'bg-card text-muted-foreground')}>
                                        <span className="text-lg">{i < step ? '✅' : emoji}</span>{name}
                                    </button>
                                </li>
                            ))}
                        </ol>

                        {step === 0 && <div className="grid gap-2"><b>📍 Which place?</b>
                            <div className="grid grid-cols-2 gap-2">{Object.entries(PLACE).map(([k, [e, n]]) => <Choice key={k} on={pick.site === k} onClick={() => set('site', k)} emoji={e} title={n} hint={k === siteId ? 'your desk' : undefined} />)}</div></div>}
                        {step === 1 && <div className="grid gap-2"><b>📅 Which year?</b>
                            <div className="grid grid-cols-3 gap-2">{[thisYear - 1, thisYear, thisYear + 1].map(y => <Choice key={y} on={pick.year === String(y)} onClick={() => set('year', String(y))} emoji={y < thisYear ? '⏪' : y > thisYear ? '⏩' : '📍'} title={String(y)} hint={y < thisYear ? 'last year' : y > thisYear ? 'next year' : 'this year'} />)}</div></div>}
                        {step === 2 && <div className="grid gap-2"><b>🧾 What should be counted?</b>
                            <div className="grid grid-cols-2 gap-2">
                                <Choice on={!pick.actual} onClick={() => set('actual', false)} emoji="📝" title="Registrations" hint="every slip, including UMS imports" />
                                <Choice on={pick.actual} onClick={() => set('actual', true)} emoji="🛏️" title="Rooms assigned" hint="only slips with rooms (actual allocation)" />
                            </div></div>}
                        {step === 3 && <div className="grid gap-2"><b>📊 Which chart?</b>
                            <div className="grid grid-cols-3 gap-2">
                                <Choice on={pick.show === 'both'} onClick={() => set('show', 'both')} emoji="🗂️" title="Both" />
                                <Choice on={pick.show === 'count'} onClick={() => set('show', 'count')} emoji="👥" title="Pax count" hint="staying each night" />
                                <Choice on={pick.show === 'arrivals'} onClick={() => set('show', 'arrivals')} emoji="🛬" title="Arrivals" hint="checking in each day" />
                            </div></div>}

                        <div className="flex flex-wrap items-center gap-2">
                            {step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)}>← Back</Button>}
                            {step < 3 ? <Button onClick={() => setStep(step + 1)}>Next →</Button> : <Button onClick={() => setDone({ ...pick })}>✨ Show my chart</Button>}
                            <div className="ml-auto flex flex-wrap gap-1">{summary.map(s => <span key={s} className="rounded-full border bg-muted px-2 py-0.5 text-[11px] font-semibold">{s}</span>)}</div>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            {pick.actual
                                ? <>Only slips with <b>ROOMS ASSIGNED</b> are counted. Guests are counted for each night they stay (at 22:00).</>
                                : <>Based on <b>REGISTRATION INFORMATION</b> (every slip, including UMS imports), <b>not</b> only on room allocation. Guests are counted for each night they stay (at 22:00).</>}
                        </p>
                    </CardContent>
                </Card>

                {/* ---------------------------------------- the current week ---------------------------------------- */}
                <Card className="gap-3 py-4">
                    <CardHeader className="px-4"><CardTitle className="text-base">🗓️ This week · {PLACE[pick.site][0]} {PLACE[pick.site][1]}</CardTitle></CardHeader>
                    <CardContent className="grid gap-3 px-4">
                        {week ? <>
                            <WeekBars title="Guests staying each night" emoji="👥" days={week.days} values={week.count} tone="bg-gradient-to-t from-gold to-primary" />
                            <WeekBars title="Guests arriving each day" emoji="🛬" days={week.days} values={week.arrivals} tone="bg-gradient-to-t from-[#2f9e44] to-[#8ce99a]" />
                        </> : <p className="text-muted-foreground">Loading…</p>}
                        {slips.isError && <p className="text-destructive">Could not load the slips.</p>}
                    </CardContent>
                </Card>
            </div>

            {/* ---------------------------------------- the answer ---------------------------------------- */}
            {done && (
                <>
                    <div className="flex flex-wrap items-center gap-2">
                        <b className="text-base">{PLACE[done.site][0]} {PLACE[done.site][1]} · {done.year} · {done.actual ? 'rooms assigned' : 'registrations'}</b>
                        <Button size="sm" variant="outline" onClick={() => { setDone(null); setStep(0); }}>↺ Start over</Button>
                    </div>
                    {(done.show === 'both' || done.show === 'count') && (
                        <Card className="gap-0 py-0">
                            <CardHeader className="rounded-t-xl border-b bg-muted py-2.5"><CardTitle className="text-sm font-medium">👥 Yearly Pax Count Chart</CardTitle></CardHeader>
                            <CardContent className="px-0 py-3">
                                {charts ? <ChartTable values={charts.count} year={Number(done.year)} arrivals={false} /> : <p className="px-4 text-muted-foreground">Loading…</p>}
                                <p className="mx-4 mt-2 text-[11px] text-muted-foreground">Pax Count Chart for {LABEL[done.site]} for the year {done.year}</p>
                            </CardContent>
                        </Card>
                    )}
                    {(done.show === 'both' || done.show === 'arrivals') && (
                        <Card className="gap-0 py-0">
                            <CardHeader className="rounded-t-xl border-b bg-muted py-2.5"><CardTitle className="text-sm font-medium">🛬 Yearly Pax Arrival Chart</CardTitle></CardHeader>
                            <CardContent className="px-0 py-3">
                                {charts ? <ChartTable values={charts.arrivals} year={Number(done.year)} arrivals /> : <p className="px-4 text-muted-foreground">Loading…</p>}
                                <p className="mx-4 mt-2 text-[11px] text-muted-foreground">Pax ARRIVAL Chart for {LABEL[done.site]} for the year {done.year}</p>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
