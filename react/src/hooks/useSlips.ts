import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDb, useGuard } from '@/pms/PmsContext';

/** This site's live slips (db.all()), refreshed every `refreshMs` while the page is visible (other desks' changes). */
export function useSlips(refreshMs = 120_000) {
    const db = useDb();
    const guard = useGuard();
    const qc = useQueryClient();
    // the copy is shown at once; when a sync finds other desks' changes the page redraws from the updated copy
    useEffect(() => {
        const on = (e: Event) => { if (((e as CustomEvent).detail?.changed ?? 0) > 0) void qc.invalidateQueries({ queryKey: ['slips'] }); };
        window.addEventListener('pms:sync', on);
        return () => window.removeEventListener('pms:sync', on);
    }, [qc]);
    return useQuery({
        queryKey: ['slips', db.site?.id],
        queryFn: async () => ((await guard(db.all())) as Record<string, any>[]).filter(s => !s.deleted),
        refetchInterval: () => (document.visibilityState === 'visible' ? refreshMs : false),
    });
}
