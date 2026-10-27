// What the legacy router (pms/app/main.js) hands to a page, plus the shared core modules it already loaded.
// The core modules are NOT bundled into the React build: the legacy shell imports them once and passes them in `core`, so
// React pages and legacy pages share the same instances (login session, IndexedDB mirror, sync state, prefs).
export type CoreModules = {
    cloud: typeof import('@core/cloud.js');
    stay: typeof import('@core/stay.js');
    rooms: typeof import('@core/rooms.js');
    prefs: typeof import('@core/prefs.js');
    settings: typeof import('@core/settings.js');
    ums: typeof import('@core/ums.js');
    transport: typeof import('@core/transport.js');
    checkin: typeof import('@core/checkin.js');
    timefmt: typeof import('@core/timefmt.js');
};

export interface PmsCtx {
    site: { id: string; label: string; [k: string]: unknown };
    siteId: string;
    db: any;                                   // scoped slips db (core/db.js createDb)
    guard: <T>(p: Promise<T>) => Promise<T>;   // turns "page left" / offline into quiet rejections like the legacy pages
    params: URLSearchParams;
    root: HTMLElement;
    navigate: (view: string, params?: Record<string, string>) => void;
    href: (view: string, params?: Record<string, string>) => string;
    core: CoreModules;
    views: { id: string; label: string; title: string }[];     // config.js VIEWS
    loadApp: (path: string) => Promise<any>;                 // any file of pms/app, imported at run time (not bundled)
    loadCore: (name: string) => Promise<any>;                // any other core module, shared with the legacy pages
}

export type PageModule = { default: React.ComponentType };
