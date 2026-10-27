// Small formatting helpers shared by the React pages (same output as the legacy pages).
export const num = (v: unknown) => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
export const natural = (a: unknown, b: unknown) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
export const when = (ms?: number | null) => ms ? new Date(ms).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
export const stamp = (v?: string | number | null) => { const d = new Date(v as any); return v && !isNaN(d.getTime()) ? when(d.getTime()) : '—'; };
export const dmy = (d?: string | null) => d ? d.split('-').reverse().join('/') : '';
export const slipPax = (s: Record<string, any>) => num(s.total) || num(s.gents) + num(s.ladies) + num(s.children) + num(s.infants);
export const roomsOf = (s: Record<string, any>): string[] => [...new Set(['gents', 'ladies'].flatMap(k => (s.rooms?.[k] || []).map((x: any) => String(x.room_no || '').trim()).filter(Boolean)))] as string[];
