import { Fragment, useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useLoadApp } from '@/pms/PmsContext';

// The head of a page: "Menu group › Page › Open tab" in small grey type, then the page's title (the wireframe's in-page navigation). The menu group comes
// from the same NAV the top menu uses, so it always matches; `parent` names one for pages that are not in the menu (Settings).
let navCache: { id: string; label: string; views: string[] }[] | null = null;

export function PageHeader({ view, parent, title, current, children }: { view: string; parent?: string; title: string; current?: string; children?: React.ReactNode }) {
    const loadApp = useLoadApp();
    const [group, setGroup] = useState<string>(() => parent ?? (navCache?.find(g => g.views.includes(view))?.label || ''));
    useEffect(() => {
        if (parent !== undefined) { setGroup(parent); return; }
        if (navCache) { setGroup(navCache.find(g => g.views.includes(view))?.label || ''); return; }
        void loadApp('config.js').then((c: any) => { navCache = c.NAV; setGroup(navCache!.find(g => g.views.includes(view))?.label || ''); }).catch(() => { /* no crumb */ });
    }, [view, parent]);   // eslint-disable-line react-hooks/exhaustive-deps
    const crumbs = [group, title, current].filter(Boolean) as string[];
    return (
        <header className="grid gap-1">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                {crumbs.map((c, i) => (
                    <Fragment key={i}>
                        {i > 0 && <ChevronRight className="size-3" aria-hidden="true" />}
                        <span className={i === crumbs.length - 1 ? 'font-medium text-foreground' : ''} aria-current={i === crumbs.length - 1 ? 'page' : undefined}>{c}</span>
                    </Fragment>
                ))}
            </nav>
            <div className="flex flex-wrap items-end justify-between gap-3"><h1 className="text-2xl font-bold text-foreground">{title}</h1>{children}</div>
        </header>
    );
}
