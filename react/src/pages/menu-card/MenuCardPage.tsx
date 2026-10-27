import { useEffect, useMemo, useRef, useState } from 'react';
import { ClipboardCopy, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useGuard, useLoadCore, useSite } from '@/pms/PmsContext';
import { OUT_H, OUT_W, drawCard, loadAssets, menuLines, type Assets } from './menucard';

// Menu Card (Mawaid): type the lunch and dinner menu, one dish per line — the card is drawn as you type. Download it or copy it to paste into WhatsApp.
// Each date keeps its own menu (and date lines, if edited) in this browser (localStorage "pms_menu_card").

const STORE = 'pms_menu_card';
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const pad = (n: number) => String(n).padStart(2, '0');
const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

type Draft = { lunch: string; dinner: string; greg?: string; hijri?: string };
type Store = { drafts: Record<string, Draft>; lunchTime?: string; dinnerTime?: string };
const readStore = (): Store => { try { const s = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; s.drafts ||= {}; return s; } catch { return { drafts: {} }; } };
const writeStore = (s: Store) => { try { localStorage.setItem(STORE, JSON.stringify(s)); } catch { /* storage full or blocked: the card still works */ } };

export default function MenuCardPage() {
    const { siteId } = useSite();
    const guard = useGuard();
    const loadCore = useLoadCore();
    const canvas = useRef<HTMLCanvasElement>(null);
    const store = useRef<Store>(readStore());
    const [hijri, setHijriLib] = useState<any>(null);
    const [assets, setAssets] = useState<Assets | null>(null);
    const [loadError, setLoadError] = useState(false);
    const [date, setDate] = useState(isoOf(new Date()));
    const [lunchTime, setLunchTime] = useState(store.current.lunchTime || '1:30');
    const [dinnerTime, setDinnerTime] = useState(store.current.dinnerTime || '7:30');
    const [lunch, setLunch] = useState(''), [dinner, setDinner] = useState('');
    const [greg, setGreg] = useState(''), [hij, setHij] = useState('');
    const [msg, setMsg] = useState<{ text: string; bad?: boolean; ok?: boolean }>({ text: 'Loading the card…' });
    const canShare = typeof File === 'function' && !!navigator.canShare?.({ files: [new File([''], 'x.jpg', { type: 'image/jpeg' })] });

    useEffect(() => { void loadCore('hijri').then(setHijriLib); }, []);   // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => { guard(loadAssets()).then(setAssets).catch(() => setLoadError(true)); }, []);   // eslint-disable-line react-hooks/exhaustive-deps

    const dateOf = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return y ? new Date(y, m - 1, d) : new Date(); };
    const autoLines = (iso: string) => {
        const d = dateOf(iso), h = hijri?.toHijri(d);
        return { greg: `${WEEKDAYS[d.getDay()]} ${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`, hijri: h ? `${pad(h.day)} ${hijri.HIJRI_MONTHS[h.month]} ${h.year}` : '' };
    };

    // load the date's draft (once the Hijri library is there for the automatic lines)
    useEffect(() => {
        if (!hijri) return;
        const dr = store.current.drafts[date] || ({} as Draft), a = autoLines(date);
        setLunch(dr.lunch || ''); setDinner(dr.dinner || '');
        setGreg(dr.greg || a.greg); setHij(dr.hijri || a.hijri);
    }, [date, hijri]);   // eslint-disable-line react-hooks/exhaustive-deps

    // keep the draft (only edited date lines are kept) and the meal times
    useEffect(() => {
        if (!hijri) return;
        const a = autoLines(date), s = store.current;
        const dr: Draft = { lunch, dinner, greg: greg !== a.greg ? greg : undefined, hijri: hij !== a.hijri ? hij : undefined };
        if (dr.lunch.trim() || dr.dinner.trim() || dr.greg || dr.hijri) s.drafts[date] = dr; else delete s.drafts[date];
        const keys = Object.keys(s.drafts).sort();
        for (const k of keys.slice(0, Math.max(0, keys.length - 60))) delete s.drafts[k];   // keep the 60 most recent dates
        s.lunchTime = lunchTime; s.dinnerTime = dinnerTime;
        writeStore(s);
    }, [lunch, dinner, greg, hij, lunchTime, dinnerTime]);   // eslint-disable-line react-hooks/exhaustive-deps

    // draw as you type
    useEffect(() => {
        if (!assets || !canvas.current) return;
        const id = requestAnimationFrame(() => drawCard(canvas.current!, assets, { greg, hijri: hij, lunchTime, dinnerTime, lunch, dinner, siteId }));
        return () => cancelAnimationFrame(id);
    }, [assets, greg, hij, lunchTime, dinnerTime, lunch, dinner, siteId]);
    useEffect(() => {
        if (loadError) setMsg({ text: 'Could not load the card pictures or fonts — check the connection and open the page again.', bad: true });
        else if (assets) setMsg({ text: menuLines(lunch).length || menuLines(dinner).length ? 'Your text is kept on this device for each date.' : 'Type the menu — one dish per line (Enter for a new line).' });
    }, [assets, loadError]);   // eslint-disable-line react-hooks/exhaustive-deps

    // the clipboard takes only PNG; files are JPEG (the photo background makes a PNG ~4 MB)
    const blobOf = (type: string) => new Promise<Blob>((res, rej) => canvas.current!.toBlob(b => b ? res(b) : rej(new Error('Could not make the image.')), type, 0.92));
    const fileName = () => `Menu ${date || isoOf(new Date())}.jpg`;
    const err = (e: any) => setMsg({ text: e?.message || String(e), bad: true });

    async function download() {
        try {
            const url = URL.createObjectURL(await blobOf('image/jpeg'));
            const a = document.createElement('a'); a.href = url; a.download = fileName();
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 5000);
            setMsg({ text: `Downloaded “${fileName()}”.`, ok: true });
        } catch (e) { err(e); }
    }
    async function copy() {
        try {
            if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') throw new Error('This browser cannot copy images — use Download instead.');
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blobOf('image/png') })]);
            setMsg({ text: 'Image copied — paste it into WhatsApp or anywhere else.', ok: true });
        } catch (e: any) { setMsg({ text: e?.name === 'NotAllowedError' ? 'The browser blocked copying — try again, or use Download.' : (e?.message || String(e)), bad: true }); }
    }
    async function share() {
        try { await navigator.share({ files: [new File([await blobOf('image/jpeg')], fileName(), { type: 'image/jpeg' })] }); }
        catch (e: any) { if (e?.name !== 'AbortError') err(e); }
    }

    const resetLines = useMemo(() => () => { const a = autoLines(date); setGreg(a.greg); setHij(a.hijri); }, [date, hijri]);   // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[2400px] min-w-0 gap-3 px-3 pb-10 pt-4 sm:px-4">
            <header className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-bold text-primary">Menu Card</h1>
                    <p className="text-sm text-muted-foreground">Type the lunch and dinner menu, one dish per line — the card is drawn as you type. Download it or copy it to paste into WhatsApp.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button onClick={() => void download()}><Download className="size-4" />Download</Button>
                    <Button variant="outline" onClick={() => void copy()}><ClipboardCopy className="size-4" />Copy image</Button>
                    {canShare && <Button variant="outline" onClick={() => void share()}><Share2 className="size-4" />Share</Button>}
                </div>
            </header>

            <div className="grid min-w-0 items-start gap-3 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
                <Card><CardContent className="grid gap-3">
                    <div className="grid gap-1.5"><Label htmlFor="mcdDate">Date</Label><Input id="mcdDate" type="date" value={date} onChange={e => setDate(e.target.value || isoOf(new Date()))} /></div>
                    <div className="grid gap-1.5"><Label htmlFor="mcdGreg">Date line</Label><Input id="mcdGreg" autoComplete="off" value={greg} onChange={e => setGreg(e.target.value)} /></div>
                    <div className="grid gap-1.5"><Label htmlFor="mcdHijri">Hijri line</Label>
                        <div className="flex gap-2"><Input id="mcdHijri" autoComplete="off" value={hij} onChange={e => setHij(e.target.value)} />
                            <Button variant="outline" title="Fill both date lines from the date again" onClick={resetLines}>↺ from date</Button></div></div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                        <div className="grid gap-1.5">
                            <div className="flex items-center justify-between gap-2"><b>Lunch</b><Label className="gap-1.5">time <Input className="h-8 w-20" autoComplete="off" value={lunchTime} onChange={e => setLunchTime(e.target.value)} /></Label></div>
                            <Textarea rows={8} className="min-h-44" spellCheck={false} placeholder={'Namak\nIce Cream Kwality\nSamosa\nNaan, Kasak\nChaas\nKeri Achar'} value={lunch} onChange={e => setLunch(e.target.value)} />
                        </div>
                        <div className="grid gap-1.5">
                            <div className="flex items-center justify-between gap-2"><b>Dinner</b><Label className="gap-1.5">time <Input className="h-8 w-20" autoComplete="off" value={dinnerTime} onChange={e => setDinnerTime(e.target.value)} /></Label></div>
                            <Textarea rows={8} className="min-h-44" spellCheck={false} placeholder={'Namak\nSholo\nChilli Chicken\nChicken Angara, Manda\nKhichdi, Bhajiya Kadi\nLemon Ichar, Fruits'} value={dinner} onChange={e => setDinner(e.target.value)} />
                        </div>
                    </div>
                    <p role="status" className={cn('text-xs', msg.bad ? 'font-semibold text-destructive' : msg.ok ? 'font-semibold text-ok' : 'text-muted-foreground')}>{msg.text}</p>
                </CardContent></Card>

                <section className="min-w-0 overflow-hidden rounded-xl border bg-white shadow-sm">
                    <canvas ref={canvas} width={OUT_W} height={OUT_H} aria-label="Menu card preview" className="block h-auto w-full" />
                </section>
            </div>
        </div>
    );
}
