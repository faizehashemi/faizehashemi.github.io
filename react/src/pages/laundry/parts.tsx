import { useEffect, useRef, type ReactNode } from 'react';

export type WheelApi = { set: (list: { value: string; label: string; cls?: string }[], value?: string) => void; sync: () => void; readonly value: string | undefined };

/** The old touch scroll wheel (views/laundry/wheel.js) on a div. `make` is its `wheel(el, onPick)` function. */
export function Wheel({ make, onReady, onPick, label, id }: { make: ((el: HTMLElement, onPick: (v: string) => void) => WheelApi) | null; onReady: (w: WheelApi) => void; onPick: (v: string) => void; label: string; id: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const pick = useRef(onPick); pick.current = onPick;
    useEffect(() => { if (make && ref.current) onReady(make(ref.current, v => pick.current(v))); }, [make]);   // eslint-disable-line react-hooks/exhaustive-deps
    return <div ref={ref} id={id} className="ld-wheel" role="listbox" aria-label={label} />;
}

/** A native <dialog> kept open while mounted, so the old laundry CSS (.ld-dlg) applies unchanged. */
export function Dlg({ className, onClose, children }: { className: string; onClose: () => void; children: ReactNode }) {
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => { const d = ref.current; if (d && !d.open) d.showModal(); }, []);
    return <dialog ref={ref} className={className} onClose={onClose} onCancel={onClose}>{children}</dialog>;
}

/** Trusted HTML made by core/laundry.js (item pictures, receipts) — every value in it is escaped there. */
export function Html({ h }: { h: string }) {
    return <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: h }} />;
}
