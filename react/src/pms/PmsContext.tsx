import { createContext, useContext, type ReactNode } from 'react';
import type { PmsCtx } from './types';

const Ctx = createContext<PmsCtx | null>(null);

export function PmsProvider({ ctx, children }: { ctx: PmsCtx; children: ReactNode }) {
    return <Ctx.Provider value={ctx}>{children}</Ctx.Provider>;
}

function usePms(): PmsCtx {
    const c = useContext(Ctx);
    if (!c) throw new Error('PmsProvider missing');
    return c;
}

export const useSite = () => { const c = usePms(); return { site: c.site, siteId: c.siteId }; };
export const useDb = () => usePms().db;
export const useGuard = () => usePms().guard;
export const useParams = () => usePms().params;
export const useNav = () => { const c = usePms(); return { navigate: c.navigate, href: c.href }; };
export const useCore = () => usePms().core;
