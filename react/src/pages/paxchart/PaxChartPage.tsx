import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useCore, useGuard, useSite } from '@/pms/PmsContext';
import { MONTHS, hasRooms, paxCharts, type Grid } from './paxchart';

const LABEL: Record<string, string> = { makkah: 'MAKKAH', medina: 'MADINA' };

function ChartTable({ values, year, arrivals }: { values: Grid; year: number; arrivals: boolean }) {
    const now = new Date();
    const today = now.getFullYear() === year ? `${now.getMonth()}-${now.getDate()}` : '';
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
                                        <td key={di} className={cn('border border-border p-1.5 text-center', arrivals && v ? 'bg-[#d4e9dd]' : '', isToday && 'bg-[#c9dcf5] text-[#d6336c]')}>
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

export default function PaxChartPage() {
    const { cloud, stay } = useCore();
    const guard = useGuard();
    const { siteId } = useSite();
    const thisYear = new Date().getFullYear();
    const [year, setYear] = useState(String(thisYear));
    const [site, setSite] = useState(siteId);
    const [actual, setActual] = useState(false);
    const [applied, setApplied] = useState({ year: String(thisYear), site: siteId, actual: false });

    const slips = useQuery({ queryKey: ['mirror-all'], queryFn: () => guard(cloud.mirrorAll()) });
    const charts = useMemo(() => {
        if (!slips.data) return null;
        const list = slips.data.filter((r: any) => !r.deleted && r.site === applied.site && (!applied.actual || hasRooms(r)));
        return paxCharts(list, Number(applied.year), stay);
    }, [slips.data, applied, stay]);

    const y = Number(applied.year);
    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[1240px] min-w-0 gap-3.5 px-4 pb-7 pt-4 text-[13px]">
            <Card className="mx-auto w-full max-w-[980px] gap-2 py-3.5">
                <CardContent className="grid gap-2 px-3.5">
                    <div className="grid grid-cols-2 items-end gap-3 sm:grid-cols-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="px-year">Select Year</Label>
                            <Select value={year} onValueChange={setYear}>
                                <SelectTrigger id="px-year" className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>{[thisYear - 1, thisYear, thisYear + 1].map(v => <SelectItem key={v} value={String(v)}>{v}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="px-site">Select Location</Label>
                            <Select value={site} onValueChange={setSite}>
                                <SelectTrigger id="px-site" className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="makkah">Makkah</SelectItem><SelectItem value="medina">Madina</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2 pb-2">
                            <Checkbox id="px-actual" checked={actual} onCheckedChange={(v) => setActual(v === true)} />
                            <Label htmlFor="px-actual">Show Actuals</Label>
                        </div>
                        <Button onClick={() => setApplied({ year, site, actual })}>Update Chart</Button>
                    </div>
                    <div className="grid grid-cols-2 overflow-hidden rounded-md border text-[13px] sm:grid-cols-4">
                        <span className="border-r bg-white p-2">Color Indicators</span>
                        <span className="bg-[#ffb6c1] p-2">Invalid Date</span>
                        <span className="bg-[#90ee90] p-2">Arrivals</span>
                        <span className="bg-[#add8e6] p-2">Today</span>
                    </div>
                    <p className="text-center text-[11px]">
                        {applied.actual
                            ? <>Note:– Statistics below count only slips with <b>ROOMS ASSIGNED</b> (actual allocation). Guests are counted for each night they stay (at 22:00).</>
                            : <>Note:– All the Statistics mentioned below are based on <b>REGISTRATION INFORMATION</b> (every slip, including UMS imports) and <b>NOT</b> only on actual room allocation. Guests are counted for each night they stay (at 22:00).</>}
                    </p>
                </CardContent>
            </Card>

            {slips.isError && <p className="text-destructive">Could not load the slips.</p>}

            <Card className="gap-0 py-0">
                <CardHeader className="rounded-t-xl border-b bg-muted py-2.5"><CardTitle className="text-sm font-medium">Yearly Pax Count Chart</CardTitle></CardHeader>
                <CardContent className="px-0 py-3">
                    {charts ? <ChartTable values={charts.count} year={y} arrivals={false} /> : <p className="px-4 text-muted-foreground">Loading…</p>}
                    <p className="mx-4 mt-2 text-[11px] text-muted-foreground">Pax Count Chart for {LABEL[applied.site]} for the year {applied.year}</p>
                </CardContent>
            </Card>

            <Card className="gap-0 py-0">
                <CardHeader className="rounded-t-xl border-b bg-muted py-2.5"><CardTitle className="text-sm font-medium">Yearly Pax Arrival Chart</CardTitle></CardHeader>
                <CardContent className="px-0 py-3">
                    {charts ? <ChartTable values={charts.arrivals} year={y} arrivals /> : <p className="px-4 text-muted-foreground">Loading…</p>}
                    <p className="mx-4 mt-2 text-[11px] text-muted-foreground">Pax ARRIVAL Chart for {LABEL[applied.site]} for the year {applied.year}</p>
                </CardContent>
            </Card>
        </div>
    );
}
