import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

// Notice poster → a section's table, edited as a grid: click a cell and type; add / remove rows and columns; mark a row as a heading; merge a cell with
// the one above (^); make a cell bold or red. Kept as the same text the screen draws (core/screen.js tableHtml): one row a line, cells split by |,
// '#' = heading row, '^' = joined with the cell above, **bold**, !!red!! — so old tables open here unchanged, and "Edit as text" stays available.

type Row = { head: boolean; cells: string[] };
export function parseTable(src: string): Row[] {
    return String(src || '').split('\n').map(l => l.trim()).filter(Boolean).map(l => {
        const head = l.startsWith('#');
        return { head, cells: (head ? l.slice(1) : l).split('|').map(c => c.trim()) };
    });
}
export function tableText(rows: Row[]): string {
    return rows.filter(r => r.cells.some(c => c.trim()) || r.head).map(r => (r.head ? '# ' : '') + r.cells.map(c => c.replace(/\|/g, '/')).join(' | ')).join('\n');
}
const wrapped = (c: string, m: string) => c.startsWith(m) && c.endsWith(m) && c.length >= m.length * 2;
const toggle = (c: string, m: string) => (wrapped(c, m) ? c.slice(m.length, -m.length) : c ? `${m}${c}${m}` : c);
const plain = (c: string) => { let x = c; for (let k = 0; k < 3; k++) for (const m of ['**', '!!', '__']) if (wrapped(x, m)) x = x.slice(m.length, -m.length); return x; };

export function NoticeTable({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
    const [asText, setAsText] = useState(false);
    const [rows, setRows] = useState<Row[]>(() => parseTable(value));
    const [at, setAt] = useState<[number, number] | null>(null);
    useEffect(() => { if (tableText(rows) !== String(value || '').split('\n').map(l => l.trim()).filter(Boolean).join('\n')) setRows(parseTable(value)); }, [value]);   // eslint-disable-line react-hooks/exhaustive-deps
    const cols = Math.max(1, ...rows.map(r => (r.head && r.cells.length === 1 ? 1 : r.cells.length)));
    const commit = (next: Row[]) => { setRows(next); onChange(tableText(next)); };
    const edit = (f: (r: Row[]) => void) => { const n = rows.map(r => ({ head: r.head, cells: [...r.cells] })); f(n); commit(n); };
    const cell = at ? rows[at[0]]?.cells[at[1]] ?? '' : '';

    if (asText) return (
        <div className="grid gap-1 text-xs font-semibold">
            <div className="flex items-center justify-between">Table (as text)<button type="button" className="font-normal text-primary underline" onClick={() => { setRows(parseTable(value)); setAsText(false); }}>Edit as a grid</button></div>
            <Textarea className="min-h-24 font-mono text-xs font-normal" disabled={disabled} value={value} onChange={e => onChange(e.target.value)} />
        </div>
    );
    return (
        <div className="grid gap-1.5 text-xs">
            <div className="flex items-center justify-between font-semibold">Table <span className="flex gap-3 font-normal">{rows.length > 0 && <button type="button" className="text-destructive underline" disabled={disabled} onClick={() => commit([])}>Remove table</button>}<button type="button" className="text-primary underline" onClick={() => setAsText(true)}>Edit as text</button></span></div>
            {rows.length ? <div className="overflow-x-auto rounded-md border">
                <table className="w-full border-collapse">
                    <tbody>{rows.map((r, i) => (
                        <tr key={i} className={r.head ? 'bg-sky-100 dark:bg-sky-950' : ''}>
                            <td className="w-8 border-r px-1 text-center"><button type="button" title={r.head ? 'Heading row (click for a normal row)' : 'Make this a heading row'} disabled={disabled} className={cn('rounded px-1 font-bold', r.head ? 'bg-sky-600 text-white' : 'text-muted-foreground')} onClick={() => edit(n => { n[i].head = !n[i].head; })}>H</button></td>
                            {(r.head && r.cells.length === 1 ? [0] : Array.from({ length: cols }, (_, j) => j)).map(j => {
                                const v = r.cells[j] ?? '', merged = v === '^';
                                return <td key={j} colSpan={r.head && r.cells.length === 1 ? cols : 1} className={cn('min-w-24 border p-0.5', at && at[0] === i && at[1] === j && 'ring-2 ring-primary ring-inset')}>
                                    {merged ? <button type="button" className="h-8 w-full rounded bg-muted text-muted-foreground" title="Joined with the cell above — click to edit this cell" disabled={disabled} onClick={() => { edit(n => { n[i].cells[j] = ''; }); setAt([i, j]); }}>⤒ joined</button>
                                        : <Input className={cn('h-8 border-0 px-1.5 shadow-none', v.includes('**') && 'font-bold', v.includes('!!') && 'text-red-600')} disabled={disabled} value={plain(v)} onFocus={() => setAt([i, j])}
                                            onChange={e => edit(n => { while (n[i].cells.length <= j) n[i].cells.push(''); const old = n[i].cells[j]; let x = e.target.value; for (const m of ['**', '!!', '__']) if (old.includes(m)) x = `${m}${x}${m}`; n[i].cells[j] = x; })} />}
                                </td>;
                            })}
                            <td className="w-7 border-l text-center"><button type="button" aria-label="Remove row" title="Remove row" disabled={disabled} className="text-destructive" onClick={() => { edit(n => { n.splice(i, 1); }); setAt(null); }}>✕</button></td>
                        </tr>))}</tbody>
                </table>
            </div> : <p className="text-muted-foreground">No table in this section.</p>}
            {!disabled && <div className="flex flex-wrap gap-1">
                <Button size="sm" variant="outline" className="h-7" onClick={() => edit(n => { n.push({ head: false, cells: Array.from({ length: cols }, () => '') }); })}>＋ Row</Button>
                <Button size="sm" variant="outline" className="h-7" onClick={() => edit(n => { n.push({ head: true, cells: ['Heading'] }); })}>＋ Heading row</Button>
                <Button size="sm" variant="outline" className="h-7" disabled={!rows.length} onClick={() => edit(n => { n.forEach(r => { if (!(r.head && r.cells.length === 1)) { while (r.cells.length < cols) r.cells.push(''); r.cells.push(''); } }); })}>＋ Column</Button>
                <Button size="sm" variant="outline" className="h-7" disabled={cols < 2} onClick={() => edit(n => { n.forEach(r => { if (!(r.head && r.cells.length === 1) && r.cells.length >= cols) r.cells.splice(cols - 1, 1); }); })}>− Last column</Button>
                {at && rows[at[0]] && <>
                    <span className="mx-1 self-center text-muted-foreground">Cell:</span>
                    <Button size="sm" variant="outline" className={cn('h-7 font-bold', cell.includes('**') && 'bg-accent')} onClick={() => edit(n => { n[at[0]].cells[at[1]] = toggle(n[at[0]].cells[at[1]] ?? '', '**'); })}>B</Button>
                    <Button size="sm" variant="outline" className={cn('h-7 text-red-600', cell.includes('!!') && 'bg-accent')} onClick={() => edit(n => { n[at[0]].cells[at[1]] = toggle(n[at[0]].cells[at[1]] ?? '', '!!'); })}>Red</Button>
                    {at[0] > 0 && !rows[at[0]].head && <Button size="sm" variant="outline" className="h-7" title="Join this cell with the one above (one tall cell)" onClick={() => edit(n => { n[at[0]].cells[at[1]] = '^'; })}>⤒ Join with above</Button>}
                </>}
            </div>}
            <p className="text-muted-foreground">Click a cell to type. <b>H</b> makes a heading row; a heading row with one cell spans the table.</p>
        </div>
    );
}
