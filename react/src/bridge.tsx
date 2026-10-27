// Entry of the React build (served as /react/bridge.js). The legacy router calls mountPage() for every page switched to React:
// it renders the page into the router's outlet and returns the clean-up the router runs when the page is left.
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { PmsProvider } from '@/pms/PmsContext';
import type { PmsCtx, PageModule } from '@/pms/types';
import './globals.css';

// one lazy chunk per page; a page appears here when it has been ported
const PAGES: Record<string, () => Promise<PageModule>> = {
    blank: () => import('@/pages/blank/BlankPage'),
    paxchart: () => import('@/pages/paxchart/PaxChartPage'),
    'slip-search': () => import('@/pages/slip-search/SlipSearchPage'),
    backups: () => import('@/pages/backups/BackupsPage'),
    changelog: () => import('@/pages/changelog/ChangelogPage'),
    'key-cards': () => import('@/pages/key-cards/KeyCardsPage'),
    'pending-checkouts': () => import('@/pages/pending-checkouts/PendingCheckoutsPage'),
    'menu-card': () => import('@/pages/menu-card/MenuCardPage'),
    performance: () => import('@/pages/performance/PerformancePage'),
    occupancy: () => import('@/pages/occupancy/OccupancyPage'),
    housekeeping: () => import('@/pages/housekeeping/HousekeepingPage'),
    departures: () => import('@/pages/departures/DeparturesPage'),
    tosha: () => import('@/pages/tosha/ToshaPage'),
    grouping: () => import('@/pages/grouping/GroupingPage'),
    'group-export': () => import('@/pages/group-export/GroupExportPage'),
    movement: () => import('@/pages/movement/MovementPage'),
    kg: () => import('@/pages/kg/KgPage'),
    mawaid: () => import('@/pages/mawaid/MawaidPage'),
    timeline: () => import('@/pages/timeline/TimelinePage'),
    grid: () => import('@/pages/grid/GridPage'),
    checkins: () => import('@/pages/checkins/CheckinsPage'),
    transport: () => import('@/pages/transport/TransportPage'),
    slip: () => import('@/pages/slip/SlipPage'),
    forecast: () => import('@/pages/forecast/ForecastPage'),
    home: () => import('@/pages/home/HomePage'),
    setup: () => import('@/pages/setup/SetupPage'),
    builder: () => import('@/pages/builder/BuilderPage'),
    settings: () => import('@/pages/settings/SettingsPage'),
    login: () => import('@/pages/login/LoginPage'),
    admin: () => import('@/pages/admin/AdminPage'),
    ums: () => import('@/pages/ums/UmsPage'),
    laundry: () => import('@/pages/laundry/LaundryPage'),
    'signage-builder': () => import('@/pages/signage-builder/SignageBuilderPage'),
    'laundry-admin': () => import('@/pages/laundry-admin/LaundryAdminPage'),
    'transport-import': () => import('@/pages/transport-import/TransportImportPage'),
    'transport-print': () => import('@/pages/transport-print/TransportPrintPage'),
};

export const reactPages = () => Object.keys(PAGES);

export async function mountPage(pageId: string, ctx: PmsCtx): Promise<() => void> {
    const load = PAGES[pageId];
    if (!load) throw new Error(`No React page "${pageId}"`);
    const { default: Page } = await load();
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } });
    ctx.root.innerHTML = '';
    const el = document.createElement('div');
    el.className = 'pms-react';
    ctx.root.appendChild(el);
    const root = createRoot(el);
    root.render(
        <QueryClientProvider client={client}>
            <PmsProvider ctx={ctx}>
                <TooltipProvider>
                    <Page />
                    <Toaster />
                </TooltipProvider>
            </PmsProvider>
        </QueryClientProvider>,
    );
    return () => { root.unmount(); client.clear(); };
}
