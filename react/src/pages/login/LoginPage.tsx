import { useEffect, useRef, useState } from 'react';
import { useCore, useLoadApp } from '@/pms/PmsContext';
import css from './login.css?raw';
import showcaseHtml from './showcase.html?raw';
import { runShowcase } from './showcase';

// Desk login, on a showcase of the PMS for visitors and stakeholders (scroll story in the style of a landing page). On success the shell routes to the page
// that was asked for (or the desk's site). The server address is fixed in app/config.js. The login form is React; the showcase keeps its own markup and
// styles (showcase.html, login.css — loaded only while this page is open) and is filled by showcase.ts.

export default function LoginPage() {
    const { cloud } = useCore();
    const loadApp = useLoadApp();
    const root = useRef<HTMLDivElement>(null);
    const nameRef = useRef<HTMLInputElement>(null), passRef = useRef<HTMLInputElement>(null);
    const [name, setName] = useState(''), [pass, setPass] = useState('');
    const [err, setErr] = useState(() => { try { const r = sessionStorage.getItem('pms_logout_reason'); if (r) sessionStorage.removeItem('pms_logout_reason'); return r || ''; } catch { return ''; } });
    const [busy, setBusy] = useState(false);

    useEffect(() => { nameRef.current?.focus({ preventScroll: true }); }, []);
    useEffect(() => {
        let stop = () => { /* not started */ }, gone = false;
        void (async () => {
            const [{ CHANGES }, { VIEWS }] = await Promise.all([loadApp('views/changelog/data.js'), loadApp('config.js')]);
            if (!gone && root.current) stop = runShowcase(root.current, { CHANGES, VIEWS, apiBase: (cloud as any).apiBase });
        })();
        return () => { gone = true; stop(); };
    }, []);   // eslint-disable-line react-hooks/exhaustive-deps

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setErr(''); setBusy(true);
        try { await (cloud as any).login(name.trim(), pass); }   // fires 'pms:logged-in'
        catch (ex: any) {
            setErr(ex instanceof cloud.UserError ? ex.message : 'Could not log in: ' + (ex.message || ex));
            setBusy(false); passRef.current?.select();
        }
    }
    // in-page links (the address keeps the route)
    function onClick(e: React.MouseEvent) {
        const a = (e.target as HTMLElement).closest<HTMLElement>('[data-scroll], [data-focus-login]');
        if (!a) return;
        e.preventDefault();
        if (a.hasAttribute('data-focus-login')) { root.current?.querySelector('#lpLogin')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 350); }
        else root.current?.querySelector('#' + a.dataset.scroll)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return (
        <>
            <style>{css}</style>
            <div ref={root} className="lp" onClick={onClick}>
                <aside className="lp-login" id="lpLogin">
                    <form className="lp-card" id="loginForm" autoComplete="on" onSubmit={e => void submit(e)}>
                        <img src="assets/logo.png" alt="" className="lp-logo" />
                        <h1>Faiz E Hashemi <span>PMS</span></h1>
                        <p className="lp-muted">Log in with your desk's name and password.</p>
                        <label htmlFor="deskName">Desk</label>
                        <input id="deskName" ref={nameRef} name="username" autoComplete="username" required placeholder="e.g. Makkah Desk 1" value={name} onChange={e => setName(e.target.value)} />
                        <label htmlFor="deskPass">Password</label>
                        <input id="deskPass" ref={passRef} name="password" type="password" autoComplete="current-password" required value={pass} onChange={e => setPass(e.target.value)} />
                        <button type="submit" id="btnLogin" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
                        <p className="error" id="err" role="alert">{err}</p>
                        <a className="lp-discover" href="#lpStory" data-scroll="lpStory">Discover the PMS ↓</a>
                    </form>
                </aside>
                <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: showcaseHtml }} />
            </div>
        </>
    );
}
