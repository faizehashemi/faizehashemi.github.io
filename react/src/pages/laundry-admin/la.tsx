import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Libs, Range } from './ladmin';

type Row = Record<string, any>;
export type LaCtx = {
    site: string; isAdmin: boolean; canPay: boolean; libs: Libs; api: (m: string, p: string, b?: unknown) => Promise<any>;
    items: Row[]; staff: Row[]; cats: string[]; info: string;
    setItems: (x: Row[]) => void; setStaff: (x: Row[]) => void; setCats: (x: string[]) => void; setInfo: (x: string) => void;
    loadItems: () => Promise<void>; loadStaff: () => Promise<void>;
    openBill: (b: Row) => void; openStaffHistory: (id: number) => void; openStaffForm: (s: Row | null) => void; openItemForm: (i: Row | null) => void;
    indexBills: (bills: Row[]) => void; billIndex: React.MutableRefObject<Map<number, Row>>;
    fmtDay: (d: string) => string; presets: () => Record<string, [string, string, string]>;
    confirm: (o: { title: string; body?: ReactNode; confirmLabel?: string }) => Promise<boolean>;
    prompt: (o: { title: string; body?: ReactNode; value?: string; type?: 'text' | 'number' }) => Promise<string | null>;
    refresh: () => void;
};
const Ctx = createContext<LaCtx | null>(null);
export const LaProvider = Ctx.Provider;
export const useLa = () => { const c = useContext(Ctx); if (!c) throw new Error('LaProvider missing'); return c; };

export const Err = ({ e }: { e: unknown }) => <p className="text-sm text-destructive">{(e as any)?.message || String(e)}</p>;

export function Kpi({ icon, value, label, tone }: { icon: string; value: ReactNode; label: ReactNode; tone?: 'big' | 'neg' | 'bigneg' }) {
    return <div className="grid min-w-28 gap-0.5 rounded-xl border bg-card px-3 py-2"><span aria-hidden>{icon}</span><b className={cn('text-xl', tone?.includes('neg') && 'text-destructive')}>{value}</b><small className="text-xs text-muted-foreground">{label}</small></div>;
}

/** Item picture / emoji as the old pages draw it (core/laundry.js itemPic returns HTML). */
export function Pic({ item, cls = 'la-ipic' }: { item: Row | undefined; cls?: string }) {
    const { libs } = useLa() as any;
    const html = libs.laundry.itemPic(item, cls);
    return <span className="inline-block align-middle [&_img]:size-10 [&_img]:rounded-md [&_img]:object-cover [&_.la-ipic]:inline-grid [&_.la-ipic]:size-10 [&_.la-ipic]:place-items-center [&_.la-ipic]:text-2xl" dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Date range with presets + custom dates; state is kept per key by the parent so a tab remembers its range. */
export function RangeBar({ value, onChange }: { value: Range; onChange: (r: Range) => void }) {
    const { presets } = useLa();
    const P = presets();
    return (
        <div className="flex flex-wrap items-center gap-1.5">
            {Object.entries(P).map(([k, [l, f, t]]) => <Button key={k} size="sm" variant={value.preset === k ? 'default' : 'outline'} aria-pressed={value.preset === k} onClick={() => onChange({ preset: k, from: f, to: t })}>{l}</Button>)}
            <span className="flex items-center gap-1.5">
                <Input type="date" className="h-8 w-auto" value={value.from} onChange={e => { const from = e.target.value || value.from; onChange({ preset: 'custom', from, to: value.to < from ? from : value.to }); }} /> →
                <Input type="date" className="h-8 w-auto" value={value.to} onChange={e => { const to = e.target.value || value.to; onChange({ preset: 'custom', from: value.from, to: to < value.from ? value.from : to }); }} />
            </span>
        </div>
    );
}
export function useRange(def: string) {
    const { presets } = useLa();
    const [r, setR] = useState<Range>(() => { const P = presets(); return { preset: def, from: P[def][1], to: P[def][2] }; });
    return [r, setR] as const;
}

export function BarChart({ rows, unit = 'SAR' }: { rows: { label: string; value: number; note?: string }[]; unit?: string }) {
    const { libs } = useLa();
    if (!rows.length) return <p className="text-sm text-muted-foreground">Nothing in this period.</p>;
    const max = Math.max(1, ...rows.map(r => r.value));
    return <div className="grid gap-1">{rows.map((r, i) => (
        <div key={i} title={r.note} className="grid grid-cols-[minmax(5rem,10rem)_1fr_4.5rem] items-center gap-2 text-sm">
            <span className="truncate">{r.label}</span><span className="h-3 rounded bg-muted"><i className="block h-full rounded bg-primary" style={{ width: `${(r.value / max * 100).toFixed(1)}%` }} /></span>
            <b className="text-right">{unit === 'SAR' ? libs.sar(Math.round(r.value * 100)) : r.value}</b></div>))}</div>;
}

/** Loads something when mounted / when `deps` change, with the old pages' "Loading…" and red error line. */
export function useLoad<T>(fn: () => Promise<T>, deps: unknown[]) {
    const [data, setData] = useState<T | null>(null), [err, setErr] = useState<unknown>(null), [tick, setTick] = useState(0);
    useEffect(() => {
        let live = true; setErr(null);
        fn().then(d => live && setData(d)).catch(e => live && setErr(e));
        return () => { live = false; };
    }, [...deps, tick]);   // eslint-disable-line react-hooks/exhaustive-deps
    return { data, err, reload: () => setTick(t => t + 1), loading: !data && !err, set: setData };
}
export const Loading = () => <p className="text-sm text-muted-foreground">Loading…</p>;
