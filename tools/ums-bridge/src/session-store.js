// Persists the authenticated browser session (Playwright storageState: cookies + localStorage) encrypted with AES-256-GCM.
// File layout: "UMS1" | iv (12) | auth tag (16) | ciphertext. Writes are atomic (temp file + rename) and the file is private to the user (0600).
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { ConfigError } from './errors.js';

const MAGIC = Buffer.from('UMS1');

/** The 32-byte key: UMS_SESSION_KEY (base64) if given, else a random key kept in its own 0600 file beside the session. */
export function resolveKey({ key, keyFile }) {
    if (key) {
        const buf = Buffer.from(key, 'base64');
        if (buf.length !== 32) throw new ConfigError('UMS_SESSION_KEY must be 32 bytes, base64 encoded (openssl rand -base64 32).');
        return buf;
    }
    try { const buf = Buffer.from(fs.readFileSync(keyFile, 'utf8').trim(), 'base64'); if (buf.length === 32) return buf; } catch { /* make one */ }
    const fresh = crypto.randomBytes(32);
    fs.mkdirSync(path.dirname(keyFile), { recursive: true });
    fs.writeFileSync(keyFile, fresh.toString('base64'), { mode: 0o600 });
    return fresh;
}

export class SessionStore {
    constructor({ file, key, keyFile, ttlHours = 12, logger }) {
        this.file = file; this.ttlMs = ttlHours * 3600e3; this.log = logger;
        this.key = resolveKey({ key, keyFile });
    }

    save(state, meta = {}) {
        const iv = crypto.randomBytes(12);
        const c = crypto.createCipheriv('aes-256-gcm', this.key, iv);
        const body = Buffer.concat([c.update(JSON.stringify({ savedAt: Date.now(), meta, state }), 'utf8'), c.final()]);
        const blob = Buffer.concat([MAGIC, iv, c.getAuthTag(), body]);
        fs.mkdirSync(path.dirname(this.file), { recursive: true });
        const tmp = `${this.file}.${process.pid}.tmp`;
        fs.writeFileSync(tmp, blob, { mode: 0o600 });
        fs.renameSync(tmp, this.file);
        this.log?.debug('session saved', { cookies: state?.cookies?.length ?? 0 });
    }

    /** @returns {{ state, savedAt, meta } | null} null when there is none, it is expired, or it cannot be read (tampered / another key) */
    load() {
        let blob;
        try { blob = fs.readFileSync(this.file); } catch { return null; }
        try {
            if (blob.length < 33 || !blob.subarray(0, 4).equals(MAGIC)) throw new Error('not a session file');
            const d = crypto.createDecipheriv('aes-256-gcm', this.key, blob.subarray(4, 16));
            d.setAuthTag(blob.subarray(16, 32));
            const json = JSON.parse(Buffer.concat([d.update(blob.subarray(32)), d.final()]).toString('utf8'));
            if (Date.now() - json.savedAt > this.ttlMs) { this.log?.info('stored session is past its lifetime; ignoring it'); return null; }
            return json;
        } catch (e) {
            this.log?.warn('stored session unreadable; ignoring it', { error: e });
            return null;
        }
    }

    clear() { try { fs.rmSync(this.file, { force: true }); this.log?.info('stored session removed'); } catch { /* already gone */ } }
    ageMs() { try { return Date.now() - fs.statSync(this.file).mtimeMs; } catch { return null; } }
}
