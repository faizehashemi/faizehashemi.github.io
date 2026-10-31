// Every failure of the bridge is a BridgeError with a stable `code`, so callers (the HTTP API, the CLI, the middleware) can react without parsing messages.
export class BridgeError extends Error {
    constructor(message, { code = 'BRIDGE_ERROR', cause, details, status = 500 } = {}) {
        super(message, cause ? { cause } : undefined);
        this.name = this.constructor.name;
        this.code = code;
        this.details = details;
        this.status = status;   // the HTTP status the API answers with
    }
    toJSON() { return { error: this.code, message: this.message, details: this.details }; }
}

export class ConfigError extends BridgeError { constructor(m, o) { super(m, { code: 'CONFIG', status: 500, ...o }); } }
export class NavigationError extends BridgeError { constructor(m, o) { super(m, { code: 'NAVIGATION', status: 502, ...o }); } }
export class FormError extends BridgeError { constructor(m, o) { super(m, { code: 'FORM', status: 422, ...o }); } }
export class ExtractError extends BridgeError { constructor(m, o) { super(m, { code: 'EXTRACT', status: 502, ...o }); } }
export class AuthError extends BridgeError { constructor(m, o) { super(m, { code: 'AUTH', status: 401, ...o }); } }
export class SessionExpiredError extends BridgeError { constructor(m = 'The UMS session has expired.', o) { super(m, { code: 'SESSION_EXPIRED', status: 401, ...o }); } }
export class BusyError extends BridgeError { constructor(m = 'The bridge is busy with another job.', o) { super(m, { code: 'BUSY', status: 409, ...o }); } }

/** A CAPTCHA is in the way and a human has to deal with it (the bridge never solves one). */
export class CaptchaRequiredError extends BridgeError {
    constructor(kind, m = `A ${kind || 'CAPTCHA'} needs a person: complete it in the browser window.`, o) { super(m, { code: 'CAPTCHA_REQUIRED', status: 409, details: { kind }, ...o }); this.kind = kind; }
}
export class CaptchaTimeoutError extends BridgeError { constructor(kind, ms, o) { super(`Nobody completed the ${kind || 'CAPTCHA'} within ${Math.round(ms / 1000)} s.`, { code: 'CAPTCHA_TIMEOUT', status: 408, details: { kind }, ...o }); } }

export const isBridgeError = (e) => e instanceof BridgeError;
