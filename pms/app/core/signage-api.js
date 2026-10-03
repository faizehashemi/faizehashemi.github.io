// Signage settings and templates in the cloud (worker.js → signage). Read: any login · write: desk of the site, admin.
import { request } from './cloud.js';

const q = (site) => `site=${encodeURIComponent(site)}`;

/** { config: { window, slides, version, updated_at, updated_by }, templates: [{ id, name, data, version, … }] } */
export const loadSignage = (site) => request('GET', `/api/signage?${q(site)}`);
/** Save the window and/or the slides (send only what changes). `version` = config.version as loaded (0 = never saved). */
export const saveSignageConfig = (site, config, version) => request('PUT', '/api/signage/config', { site, config, version });
export const createTemplate = (site, name, data) => request('POST', '/api/signage/templates', { site, name, data }).then(r => r.template);
export const updateTemplate = (id, name, data, version) => request('PUT', `/api/signage/templates/${id}`, { name, data, version }).then(r => r.template);
export const deleteTemplate = (id) => request('DELETE', `/api/signage/templates/${id}`);
/** Every trip type (route) in the saved lists: [{ type, trips, last }] */
export const loadTripTypes = (site) => request('GET', `/api/transport/types?${q(site)}`).then(r => r.types || []);
