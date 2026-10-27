import { useQuery } from '@tanstack/react-query';
import { useDb, useGuard } from '@/pms/PmsContext';

/** This site's live slips (db.all()), refreshed every `refreshMs` while the page is visible (other desks' changes). */
export function useSlips(refreshMs = 120_000) {
    const db = useDb();
    const guard = useGuard();
    return useQuery({
        queryKey: ['slips', db.site?.id],
        queryFn: async () => ((await guard(db.all())) as Record<string, any>[]).filter(s => !s.deleted),
        refetchInterval: () => (document.visibilityState === 'visible' ? refreshMs : false),
    });
}
