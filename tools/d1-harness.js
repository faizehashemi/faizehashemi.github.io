// Test harness: runs worker/worker.js in the browser against real SQLite (sql.js / WebAssembly)
// through a small D1-compatible shim, and routes the app's API calls to it.
// Dev only — the app never imports this. Usage from the console on http://localhost:8766/pms/:
//
//   const h = await import('/tools/d1-harness.js');
//   const api = await h.start();                       // fresh in-memory D1 + schema
//   await api.addDesk('admin', 'makkah', 'admin', 'admin-pass-1');
//   h.routeFetch('https://pms-api.test');              // app requests to that URL hit the Worker

const SQLJS = 'https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/';

function loadSqlJs() {
    if (window.initSqlJs) return window.initSqlJs({ locateFile: f => SQLJS + f });
    return new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = SQLJS + 'sql-wasm.js';
        s.onload = () => res(window.initSqlJs({ locateFile: f => SQLJS + f }));
        s.onerror = rej;
        document.head.appendChild(s);
    });
}

// Minimal D1: prepare().bind().first()/all()/run(), batch() as a transaction
class Stmt {
    constructor(db, sql, args = []) { this.db = db; this.sql = sql; this.args = args; }
    bind(...args) { return new Stmt(this.db, this.sql, args.map(a => a === undefined ? null : a)); }
    _rows() {
        const st = this.db.prepare(this.sql);
        st.bind(this.args);
        const rows = [];
        while (st.step()) rows.push(st.getAsObject());
        st.free();
        return rows;
    }
    _run() {
        this.db.run(this.sql, this.args);
        const changes = this.db.getRowsModified();
        const last = this.db.exec('SELECT last_insert_rowid() AS id')[0].values[0][0];
        return { success: true, results: [], meta: { changes, last_row_id: last } };
    }
    _exec() { return /^\s*(select|with)/i.test(this.sql) ? { success: true, results: this._rows(), meta: {} } : this._run(); }
    async first(col) { const r = this._rows()[0]; return r ? (col ? r[col] : r) : null; }
    async all() { return { success: true, results: this._rows(), meta: {} }; }
    async run() { return this._run(); }
}

class D1 {
    constructor(db) { this.db = db; }
    prepare(sql) { return new Stmt(this.db, sql); }
    async batch(stmts) {
        this.db.run('BEGIN');
        try { const out = stmts.map(s => s._exec()); this.db.run('COMMIT'); return out; }
        catch (e) { this.db.run('ROLLBACK'); throw e; }
    }
}

let current = null;

export async function start() {
    const SQL = await loadSqlJs();
    const db = new SQL.Database();
    db.run(await (await fetch('/worker/schema.sql', { cache: 'no-store' })).text());
    const worker = (await import('/worker/worker.js?t=' + Date.now())).default;
    const env = { DB: new D1(db), ALLOWED_ORIGINS: location.origin };
    const call = (path, init = {}) => worker.fetch(new Request('https://pms-api.test' + path, { ...init, headers: { Origin: location.origin, ...(init.headers || {}) } }), env);
    current = { db, env, worker, call };
    return {
        db, env, call,
        // same hashing as tools/make_desk.py, but through the Worker's own admin API when possible
        async addDesk(name, site, role, password) {
            const salt = [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, '0')).join('');
            const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
            const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new Uint8Array(salt.match(/../g).map(h => parseInt(h, 16))), iterations: 100000 }, key, 256);
            const hash = [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, '0')).join('');
            db.run('INSERT INTO desks (name, site, role, pw_hash, pw_salt, pw_iter, created_at) VALUES (?,?,?,?,?,?,?)', [name, site, role, hash, salt, 100000, new Date().toISOString()]);
        },
        query: (sql, args = []) => { const st = db.prepare(sql); st.bind(args); const r = []; while (st.step()) r.push(st.getAsObject()); st.free(); return r; },
    };
}

// Send the page's requests for `apiUrl` to the in-browser Worker instead of the network
export function routeFetch(apiUrl) {
    const real = window.__realFetch || (window.__realFetch = window.fetch.bind(window));
    window.fetch = async (input, init = {}) => {
        const url = typeof input === 'string' ? input : input.url;
        if (!current || !url.startsWith(apiUrl)) return real(input, init);
        const path = url.slice(apiUrl.length);
        const headers = new Headers(init.headers || {});
        headers.set('Origin', location.origin);
        return current.worker.fetch(new Request('https://pms-api.test' + path, { ...init, headers }), current.env);
    };
}
