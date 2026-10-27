import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

/** Replaces window.prompt: `ask({ title, body, value, type })` resolves the typed text, or null when cancelled. Render `dialog` once in the page. */
export function usePrompt() {
    const [state, setState] = useState<null | { title: string; body: ReactNode; value: string; type: string; resolve: (v: string | null) => void }>(null);
    const [text, setText] = useState('');
    const ask = (o: { title: string; body?: ReactNode; value?: string; type?: 'text' | 'number' }) =>
        new Promise<string | null>(resolve => { setText(o.value ?? ''); setState({ title: o.title, body: o.body ?? null, value: o.value ?? '', type: o.type ?? 'text', resolve }); });
    const done = (v: string | null) => { state?.resolve(v); setState(null); };
    const dialog = (
        <Dialog open={!!state} onOpenChange={(o) => { if (!o) done(null); }}>
            <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-sm">
                <form onSubmit={e => { e.preventDefault(); done(text); }} className="grid gap-4">
                    <DialogHeader>
                        <DialogTitle>{state?.title}</DialogTitle>
                        <DialogDescription asChild><div className="whitespace-pre-wrap text-sm">{state?.body}</div></DialogDescription>
                    </DialogHeader>
                    <Input autoFocus type={state?.type ?? 'text'} inputMode={state?.type === 'number' ? 'numeric' : undefined} value={text} onChange={e => setText(e.target.value)} />
                    <DialogFooter className="gap-2"><Button type="button" variant="outline" onClick={() => done(null)}>Cancel</Button><Button type="submit">OK</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
    return { ask, dialog };
}
