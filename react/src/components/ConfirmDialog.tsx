import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

/** Replaces window.confirm: `ask({ title, body, confirmLabel })` resolves true / false. Render `dialog` once in the page. */
export function useConfirm() {
    const [state, setState] = useState<null | { title: string; body: ReactNode; confirmLabel: string; resolve: (v: boolean) => void }>(null);
    const ask = (o: { title: string; body?: ReactNode; confirmLabel?: string }) =>
        new Promise<boolean>(resolve => setState({ title: o.title, body: o.body ?? null, confirmLabel: o.confirmLabel ?? 'OK', resolve }));
    const done = (v: boolean) => { state?.resolve(v); setState(null); };
    const dialog = (
        <Dialog open={!!state} onOpenChange={(o) => { if (!o) done(false); }}>
            <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{state?.title}</DialogTitle>
                    <DialogDescription asChild><div className="whitespace-pre-wrap text-sm">{state?.body}</div></DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => done(false)}>Cancel</Button>
                    <Button onClick={() => done(true)}>{state?.confirmLabel}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
    return { ask, dialog };
}
