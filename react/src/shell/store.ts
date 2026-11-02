// Tiny stores the shell's API (called from plain JS: services.js, the router) writes and the React shell reads with useSyncExternalStore.
type Listener = () => void;
function store<T>(initial: T) {
    let value = initial;
    const ls = new Set<Listener>();
    return {
        get: () => value,
        set: (v: T) => { value = v; ls.forEach(l => l()); },
        subscribe: (l: Listener) => { ls.add(l); return () => { ls.delete(l); }; },
    };
}

/** the menu bar's sync line and its notice (gone after 6 s) */
const nav = store({ badge: { text: '', warn: false }, notice: '' });
let noticeTimer: ReturnType<typeof setTimeout> | undefined;
export const navStore = {
    get: nav.get, subscribe: nav.subscribe,
    setBadge: (text: string, warn = false) => nav.set({ ...nav.get(), badge: { text: text || '', warn: !!warn } }),
    notice: (text: string) => {
        nav.set({ ...nav.get(), notice: text });
        clearTimeout(noticeTimer);
        noticeTimer = setTimeout(() => nav.set({ ...nav.get(), notice: '' }), 6000);
    },
};

export { store };
