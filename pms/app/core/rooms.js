// Buildings, rooms and capacities from the Rooms & Buildings builder (server table `buildings`).
// Pages ask here for building lists and capacities; when the builder has nothing for a building
// they fall back to what they did before (capacities remembered from earlier slips).
// A copy is kept in localStorage so capacities are still known offline.

import { SITES } from '../config.js';
import { request, OfflineError, ApiError } from './cloud.js';
import { track } from './analytics.js';

const CACHE_KEY = 'pms_buildings_cache';
const FRESH_MS = 60_000;

export const roomsState = { serverSupportsRooms: true };

let cache = (() => { try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch { return null; } })();
let loadedAt = 0;
let inflight = null;

export const normBuilding = (b) => String(b ?? '').trim().toUpperCase();
export const normRoom = (r) => String(r ?? '').trim().toUpperCase().replace(/\s+/g, '');

/** All buildings of both sites: [{ id, site, name, sort, version, rooms:[…], notes, updated_at, updated_by }] */
export function loadBuildings({ force = false } = {}) {
    if (!force && cache && Date.now() - loadedAt < FRESH_MS) return Promise.resolve(cache);
    if (inflight) return inflight;
    inflight = request('GET', '/api/buildings')
        .then(r => {
            cache = r.buildings || [];
            loadedAt = Date.now();
            roomsState.serverSupportsRooms = true;
            try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch { }
            return cache;
        })
        .catch(e => {
            if (e instanceof ApiError && e.status === 404) roomsState.serverSupportsRooms = false; // Worker not updated yet
            else if (!(e instanceof OfflineError) && !(e instanceof ApiError)) throw e;
            return cache || [];
        })
        .finally(() => { inflight = null; });
    return inflight;
}

export function cachedBuildings() { return cache || []; }

export const buildingsOfSite = (list, siteId) => (list || []).filter(b => b.site === siteId);

/** Building names for a site: the builder's, then any from the site config not in the builder. */
export function buildingNames(list, siteId) {
    const own = buildingsOfSite(list, siteId).map(b => b.name);
    const extra = (SITES[siteId]?.buildings || []).filter(n => !own.includes(normBuilding(n)));
    return [...own, ...extra];
}

export function findBuilding(list, name) {
    const n = normBuilding(name);
    return (list || []).find(b => b.name === n) || null;
}

/** Map "BUILDING|ROOM" → capacity for every room in the builder (active and inactive). */
export function capacityMap(list) {
    const m = new Map();
    for (const b of list || []) for (const r of b.rooms || []) m.set(`${b.name}|${normRoom(r.room_no)}`, r.capacity);
    return m;
}

export function builderCapacity(list, building, room) {
    const b = findBuilding(list, building);
    if (!b) return null;
    const r = b.rooms.find(x => normRoom(x.room_no) === normRoom(room));
    return r ? r.capacity : null;
}

/** Active rooms of a building from the builder (empty when the builder has no such building). */
export function activeRooms(list, building) {
    const b = findBuilding(list, building);
    return b ? b.rooms.filter(r => r.active !== false) : [];
}

export const totalBeds = (b) => (b.rooms || []).filter(r => r.active !== false).reduce((n, r) => n + (Number(r.capacity) || 0), 0);

/* ------------------------------- builder writes ------------------------------- */

export async function saveBuilding(b) {
    const payload = { site: b.site, name: b.name, sort: b.sort || 0, rooms: b.rooms, notes: b.notes || '', version: b.version };
    const r = b.id
        ? await request('PUT', `/api/buildings/${b.id}`, payload)
        : await request('POST', '/api/buildings', payload);
    await loadBuildings({ force: true });
    track('building_saved', { site: r.building.site, rooms: r.building.rooms.length, created: !b.id });
    return r.building;
}

export async function removeBuilding(b) {
    await request('DELETE', `/api/buildings/${b.id}?version=${b.version}`);
    await loadBuildings({ force: true });
}

/** Floor from a room number, the same rule as the Grid page: 1203A → 12, 501 → 5, 12 → 0. */
export function floorOf(room) {
    const m = normRoom(room).match(/^(\d+)([A-Z]*)$/);
    if (!m) return '';
    return m[1].length <= 2 ? '0' : m[1].slice(0, -2);
}
