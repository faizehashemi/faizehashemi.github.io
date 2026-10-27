import { useEffect, useState } from 'react';
import { useCore } from '@/pms/PmsContext';

/** This login's settings (core/prefs.js), re-read when they change here or on another device (the 'pms:prefs' event). */
export function usePrefs() {
    const { prefs } = useCore();
    const [value, setValue] = useState<Record<string, any>>(() => prefs.getPrefs());
    useEffect(() => {
        const h = () => setValue(prefs.getPrefs());
        window.addEventListener('pms:prefs', h);
        return () => window.removeEventListener('pms:prefs', h);
    }, [prefs]);
    return { prefs: value, setPrefs: (patch: Record<string, any>) => prefs.setPrefs(patch) as Record<string, any> };
}
