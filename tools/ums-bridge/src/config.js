// Configuration: environment variables over defaults, validated once. Credentials come only from the environment (never from code or request bodies).
import path from 'node:path';
import { ConfigError } from './errors.js';

const num = (v, d) => { const n = Number(v); return Number.isFinite(n) && v !== '' && v != null ? n : d; };
const bool = (v, d) => (v == null || v === '' ? d : /^(1|true|yes|on)$/i.test(String(v)));

export function loadConfig(env = process.env, overrides = {}) {
    const baseUrl = String(overrides.baseUrl || env.UMS_BASE_URL || 'https://ums.sigatulhaj.org').replace(/\/+$/, '');
    let host;
    try { host = new URL(baseUrl).host; } catch { throw new ConfigError(`UMS_BASE_URL is not a URL: ${baseUrl}`); }
    const dir = path.resolve(overrides.dataDir || env.UMS_BRIDGE_DIR || '.ums-bridge');
    const cfg = {
        baseUrl,
        allowedHosts: [host, ...String(env.UMS_ALLOWED_HOSTS || '').split(',').map(s => s.trim()).filter(Boolean)],   // the browser is only ever sent to these
        loginPath: env.UMS_LOGIN_PATH || '/login.aspx',            // where a person logs in
        homePath: env.UMS_HOME_PATH || '/',
        manualLogin: bool(env.UMS_MANUAL_LOGIN, false),            // never type credentials: a person logs in by hand in the window (the formal way, CAPTCHA included)
        credentials: { username: env.UMS_USERNAME || '', password: env.UMS_PASSWORD || '' },
        dataDir: dir,
        session: {
            file: path.join(dir, 'session.enc'),
            keyFile: path.join(dir, 'session.key'),
            key: env.UMS_SESSION_KEY || '',                       // base64, 32 bytes; else a random key file is created next to the session
            ttlHours: num(env.UMS_SESSION_TTL_HOURS, 12),
        },
        browser: {
            headless: bool(env.UMS_HEADLESS, true),
            slowMo: num(env.UMS_SLOW_MO, 0),
            channel: env.UMS_BROWSER_CHANNEL || undefined,        // e.g. 'chrome' or 'msedge' to use an installed browser
            navTimeoutMs: num(env.UMS_NAV_TIMEOUT_MS, 30000),
            actionTimeoutMs: num(env.UMS_ACTION_TIMEOUT_MS, 15000),
        },
        captcha: {
            escalateToHeaded: bool(env.UMS_CAPTCHA_HEADED, true),  // a hidden browser is reopened visibly so a person can complete the CAPTCHA
            returnToHeadless: bool(env.UMS_CAPTCHA_RETURN_HEADLESS, true),
            waitInPlace: bool(env.UMS_CAPTCHA_WAIT_IN_PLACE, false),   // headless but watched (remote desktop / debug port): wait without opening a window

            timeoutMs: num(env.UMS_CAPTCHA_TIMEOUT_MS, 15 * 60 * 1000),
            pollMs: num(env.UMS_CAPTCHA_POLL_MS, 1000),
        },
        selectors: {
            username: env.UMS_SEL_USER || 'input[type="text"][name*="user" i], input[name*="login" i][type="text"], input[id*="user" i][type="text"], input[type="email"]',
            password: env.UMS_SEL_PASS || 'input[type="password"]',
            submit: env.UMS_SEL_SUBMIT || 'input[type="submit"], button[type="submit"], input[type="image"], a[id*="login" i]',
            loggedIn: env.UMS_SEL_LOGGED_IN || 'a[href*="logout" i], a[id*="logout" i], input[value*="logout" i], a[href*="signout" i]',
            error: env.UMS_SEL_ERROR || '.validation-summary-errors, [id*="lblError" i], [id*="lblMessage" i], span[style*="color:Red" i], span[style*="color: red" i], .error',
        },
        expiredPatterns: [/session\s+(has\s+)?(expired|timed\s*out)/i, /please\s+log\s*in/i, /login\.aspx/i, /sign\s*in\s+again/i],
        retries: { reauth: 1 },
        debugDir: path.join(dir, 'debug'),                         // screenshots of failures
        logFile: env.UMS_LOG_FILE || path.join(dir, 'bridge.log'),
        logLevel: env.UMS_LOG_LEVEL || 'info',
        api: {
            host: env.UMS_API_HOST || '127.0.0.1', port: num(env.UMS_API_PORT, 8787), token: env.UMS_BRIDGE_TOKEN || '', outDir: path.join(dir, 'exports'), tokenFile: path.join(dir, 'api-token'),
            // the web pages whose scripts may call the API from a browser (the PMS); loopback origins (local test servers) are always allowed
            allowedOrigins: [...new Set(['https://pms.raajsoftware.com', 'https://faizehashemi.github.io', ...String(env.UMS_ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)])],
        },
        ...overrides,
    };
    return cfg;
}

export function assertCanServe(cfg) {
    if (!cfg.api.token || cfg.api.token.length < 24) throw new ConfigError('Set UMS_BRIDGE_TOKEN (at least 24 characters) before starting the API.');
    if (!['127.0.0.1', '::1', 'localhost'].includes(cfg.api.host) && !/^https?:/.test(process.env.UMS_API_BEHIND_TLS || '')) {
        throw new ConfigError('The API listens on localhost only. To expose it, put it behind a TLS proxy and set UMS_API_BEHIND_TLS=https://your-proxy.');
    }
}
