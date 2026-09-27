// PostHog product analytics. Off until POSTHOG.key is set in config.js.
//
// Privacy: the pages show guest names and phone numbers, so autocaptured clicks have their text
// masked, session recording is off, and people are identified only as their desk login.
// Events: $pageview (per route), login, logout, slip_created, slip_updated, slip_conflict,
// ums_import, building_saved, went_offline, app_error.

import { POSTHOG } from '../config.js';

const queue = [];
let ready = false;
let loading = false;

function assetsUrl(host) {
    const h = host.replace(/\/+$/, '');
    return /\.i\.posthog\.com$/.test(h) ? h.replace('.i.posthog.com', '-assets.i.posthog.com') + '/static/array.js' : h + '/static/array.js';
}

export function initAnalytics() {
    if (!POSTHOG.key || loading) return;
    loading = true;
    const s = document.createElement('script');
    s.async = true;
    s.src = assetsUrl(POSTHOG.host);
    s.dataset.shell = '';
    s.onload = () => {
        const ph = window.posthog;
        if (!ph || typeof ph.init !== 'function') return;
        ph.init(POSTHOG.key, {
            api_host: POSTHOG.host,
            person_profiles: 'identified_only',
            capture_pageview: false,           // sent per route below (hash router)
            capture_pageleave: true,
            autocapture: true,
            mask_all_text: true,                // no guest names/phones in click events
            mask_all_element_attributes: true,
            disable_session_recording: true,
            persistence: 'localStorage+cookie',
        });
        ready = true;
        for (const [fn, args] of queue.splice(0)) { try { ph[fn](...args); } catch { } }
    };
    s.onerror = () => { loading = false; };
    document.head.appendChild(s);

    window.addEventListener('error', (e) => track('app_error', { message: String(e.message || '').slice(0, 300), source: String(e.filename || '').split('/').slice(-2).join('/'), line: e.lineno }));
    window.addEventListener('unhandledrejection', (e) => track('app_error', { message: String(e.reason?.message || e.reason || '').slice(0, 300), kind: 'promise' }));
}

function call(fn, ...args) {
    if (!POSTHOG.key) return;
    if (ready) { try { window.posthog[fn](...args); } catch { } }
    else queue.push([fn, args]);
}

export const track = (event, props = {}) => call('capture', event, props);

export function pageview(siteId, viewId) {
    call('capture', '$pageview', { $current_url: location.href, site: siteId, view: viewId });
}

export function identify(desk) {
    if (!desk) return;
    call('identify', `desk-${desk.id}`, { desk: desk.name, site: desk.site, role: desk.role });
    call('register', { desk_site: desk.site, desk_role: desk.role });
}

export function resetAnalytics() { call('reset'); }
