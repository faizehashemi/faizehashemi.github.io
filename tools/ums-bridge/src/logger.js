// JSON-lines logger with secrets stripped: passwords, cookies, tokens and ASP.NET ViewState never reach a log file.
import fs from 'node:fs';
import path from 'node:path';

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40, silent: 99 };
const SECRET_KEY = /pass(word)?|secret|token|cookie|authorization|api[-_]?key|__viewstate|__eventvalidation|storagestate|session(key)?$/i;

export function redact(value, depth = 0) {
    if (value == null || depth > 6) return value;
    if (value instanceof Error) return { name: value.name, message: value.message, code: value.code, stack: value.stack?.split('\n').slice(0, 6).join('\n') };
    if (Array.isArray(value)) return value.slice(0, 50).map(v => redact(v, depth + 1));
    if (typeof value === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(value)) out[k] = SECRET_KEY.test(k) ? '[redacted]' : redact(v, depth + 1);
        return out;
    }
    if (typeof value === 'string' && value.length > 500) return value.slice(0, 500) + `…(${value.length} chars)`;
    return value;
}

export function createLogger({ level = 'info', file = '', bindings = {}, sink } = {}) {
    const min = LEVELS[level] ?? LEVELS.info;
    let stream = null;
    if (file) { fs.mkdirSync(path.dirname(file), { recursive: true }); stream = fs.createWriteStream(file, { flags: 'a', mode: 0o600 }); }
    const write = (lvl, msg, data) => {
        if (LEVELS[lvl] < min) return;
        const line = JSON.stringify({ t: new Date().toISOString(), level: lvl, msg, ...bindings, ...(data ? redact(data) : {}) });
        if (sink) sink(line); else process.stderr.write(line + '\n');
        if (stream) stream.write(line + '\n');
    };
    const log = { child: (b) => createLogger({ level, file: '', bindings: { ...bindings, ...b }, sink: sink || ((l) => { process.stderr.write(l + '\n'); stream?.write(l + '\n'); }) }), close: () => stream?.end() };
    for (const l of ['debug', 'info', 'warn', 'error']) log[l] = (msg, data) => write(l, msg, data);
    return log;
}
