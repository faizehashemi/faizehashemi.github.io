import { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// The small field editors of the Signage Builder's inspector (label + control, one per row).
const row = 'grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-1.5 text-xs font-semibold';
const hex = (v: unknown) => (/^#[0-9a-f]{6}$/i.test(String(v || '')) ? String(v) : '#ffffff');

/** Number field (empty = null), or — with as="color" — a colour picker (with a "none" box when `none`). */
export function Num({ label, value, onChange, min = 0, max = 4000, disabled, as, none }: { label: string; value: unknown; onChange: (v: any) => void; min?: number; max?: number; disabled?: boolean; as?: 'color'; none?: boolean }) {
    if (as === 'color') {
        const off = none && !value;
        return <label className={row}>{label}<span className="flex items-center gap-1.5"><input type="color" className="h-8 w-14 rounded border" disabled={disabled || off} value={hex(value)} onChange={ev => onChange(ev.target.value)} />
            {none && <label className="flex items-center gap-1 font-normal"><input type="checkbox" checked={!value} disabled={disabled} onChange={ev => onChange(ev.target.checked ? '' : hex(value))} /> none</label>}</span></label>;
    }
    return <label className={row}>{label}<Input type="number" className="h-8" min={min} max={max} disabled={disabled} value={value == null ? '' : String(value)} onChange={ev => onChange(ev.target.value === '' ? null : Number(ev.target.value))} /></label>;
}
export function Sel({ label, value, list, onChange, disabled }: { label: string; value: unknown; list: [string, string][]; onChange: (v: string) => void; disabled?: boolean }) {
    return <label className={row}>{label}<select className="h-8 min-w-0 rounded-md border bg-background px-1.5 text-sm font-normal" disabled={disabled} value={String(value ?? '')} onChange={ev => onChange(ev.target.value)}>{list.map(([a, b]) => <option key={a} value={a}>{b}</option>)}</select></label>;
}
export function Chk({ label, value, onChange, disabled }: { label: string; value: unknown; onChange: (v: boolean) => void; disabled?: boolean }) {
    return <label className="flex items-center gap-2 text-xs"><Checkbox checked={!!value} disabled={disabled} onCheckedChange={v => onChange(v === true)} />{label}</label>;
}
export function Txt({ label, value, onChange, disabled }: { label: string; value: unknown; onChange: (v: string) => void; disabled?: boolean }) {
    return <label className="grid gap-1 text-xs font-semibold">{label}<Textarea className="min-h-16 text-sm font-normal" disabled={disabled} value={String(value ?? '')} onChange={ev => onChange(ev.target.value)} /></label>;
}

/** One table column: data, title, alignment, width %, with a grip to drag it to another place. */
export function Col({ c, fields, onSet, onDelete, onDragStart, onDrop, disabled }: { c: Record<string, any>; fields: Record<string, string[]>; onSet: (k: string, v: unknown) => void; onDelete: () => void; onDragStart: () => void; onDrop: () => void; disabled?: boolean }) {
    const [over, setOver] = useState(false);
    const [title, setTitle] = useState(c.title ?? '');
    useEffect(() => setTitle(c.title ?? ''), [c.title]);
    return (
        <div className={'grid grid-cols-[1.2rem_1fr_auto] items-center gap-1 rounded-lg border bg-card p-1.5 ' + (over ? 'border-gold shadow-[inset_0_3px_0_var(--gold)]' : '')}
            onDragOver={ev => { ev.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={ev => { ev.preventDefault(); setOver(false); onDrop(); }}>
            <span className="cursor-grab select-none text-center text-muted-foreground" draggable={!disabled} title="Drag to reorder" onDragStart={ev => { ev.dataTransfer.setData('text/plain', 'col'); ev.dataTransfer.effectAllowed = 'move'; onDragStart(); }}>⠿</span>
            <select aria-label="Data" className="h-8 min-w-0 rounded-md border bg-background px-1 text-sm" disabled={disabled} value={c.field} onChange={ev => onSet('field', ev.target.value)}>{Object.entries(fields).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}</select>
            <button type="button" className="px-1 text-destructive" title="Remove column" aria-label="Remove column" disabled={disabled} onClick={onDelete}>✕</button>
            <div className="col-span-2 col-start-2 grid grid-cols-[1fr_5rem_3.5rem] gap-1">
                <Input className="h-8" aria-label="Title" placeholder="Title" disabled={disabled} value={title} onChange={ev => { setTitle(ev.target.value); onSet('title', ev.target.value); }} />
                <select aria-label="Align" className="h-8 rounded-md border bg-background px-1 text-sm" disabled={disabled} value={c.align || 'center'} onChange={ev => onSet('align', ev.target.value)}><option value="left">Left</option><option value="center">Centre</option><option value="right">Right</option></select>
                <Input className="h-8 px-1" type="number" min={0} max={100} aria-label="Width %" placeholder="w %" disabled={disabled} value={c.width ?? ''} onChange={ev => onSet('width', ev.target.value === '' ? null : Number(ev.target.value))} />
            </div>
        </div>
    );
}

/** Smaller copies keep templates light (whole template ≤ ~1.5 MB); WebP keeps transparency. */
export async function readImage(file: File, max: number): Promise<string> {
    const url = await new Promise<string>((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result)); fr.onerror = rej; fr.readAsDataURL(file); });
    if (file.size < 250e3 && /^data:image\/(png|jpeg|webp|gif);/.test(url)) return url;
    const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/webp', 0.82);
}
