// Public API of the bridge, for use as a library:
//   import { createBridge } from './src/index.js';
//   const bridge = createBridge();                    // configuration from UMS_* environment variables
//   bridge.on('captcha:required', e => notifyStaff(e)); // a person must complete it in the browser window
//   const { records } = await bridge.extractTable({ path: '/GroupList.aspx', selector: '#ctl00_ContentPlaceHolder1_gvGroups', paged: true });
//   await bridge.close();
import { loadConfig } from './config.js';
import { UmsBridge } from './bridge.js';
import { createLogger } from './logger.js';

export function createBridge(overrides = {}, env = process.env) {
    const cfg = loadConfig(env, overrides);
    const logger = overrides.logger || createLogger({ level: cfg.logLevel, file: cfg.logFile });
    return new UmsBridge(cfg, { logger });
}
export { loadConfig, UmsBridge, createLogger };
export * from './errors.js';
export { detectCaptcha, classify } from './captcha.js';
export { SessionStore } from './session-store.js';
