import { describe, expect, it } from 'vitest';
import { departuresOf, paxAt, rowsOf, roomsUse } from '@core/stay.js';
import { checkAvailability, collectRows, emptyForm, moveRows, newRow, undoMove } from './slip';

// a 7-day stay in rooms 501 and 502; 502 is changed to 601 after 3 days
const T = (d: number, h = 12) => new Date(2026, 10, d, h).getTime();
const slip = (extra = {}) => ({ id: 1, sh_no: 'A', building: 'RUBAT', checkin_date: '2026-11-01', checkin_time: '12:00', checkout_date: '2026-11-08', checkout_time: '12:00', gents: 8, total: 8,
    rooms: { gents: [{ room_no: '501', capacity: 4, assigned: 4 }, { room_no: '601', capacity: 4, assigned: 4, moves: [{ room_no: '502', capacity: 4, until: { date: '2026-11-04', time: '12:00' } }] }], ladies: [] }, ...extra });

describe('a room changed during the stay', () => {
    it('takes the old room up to the change and the new room from it', () => {
        const w = rowsOf(slip());
        expect(w.map((x: any) => [x.room_no, x.start, x.end, !!x.past])).toEqual([['501', T(1), T(8), false], ['601', T(4), T(8), false], ['502', T(1), T(4), true]]);
    });
    it('does not clash with a stay in the new room that left before the change, nor one in the old room after it', () => {
        const before = { id: 2, sh_no: 'B', building: 'RUBAT', checkin_date: '2026-11-01', checkin_time: '12:00', checkout_date: '2026-11-03', checkout_time: '12:00', rooms: { gents: [{ room_no: '601', capacity: 4, assigned: 4 }], ladies: [] } };
        const after = { id: 3, sh_no: 'C', building: 'RUBAT', checkin_date: '2026-11-05', checkin_time: '12:00', checkout_date: '2026-11-07', checkout_time: '12:00', rooms: { gents: [{ room_no: '502', capacity: 4, assigned: 4 }], ladies: [] } };
        const use = roomsUse([slip(), before, after], 'RUBAT', T(1), T(8));
        expect(use.get('601').peak).toBe(4);   // never 8: the group came after the other left
        expect(use.get('502').peak).toBe(4);
    });
    it('sees a real clash in the new room', () => {
        const during = { id: 4, sh_no: 'D', building: 'RUBAT', checkin_date: '2026-11-05', checkin_time: '12:00', checkout_date: '2026-11-07', checkout_time: '12:00', rooms: { gents: [{ room_no: '601', capacity: 4, assigned: 2 }], ladies: [] } };
        expect(roomsUse([slip(), during], 'RUBAT', T(1), T(8)).get('601').peak).toBe(6);
    });
    it('checks out of the room they are in now, and counts the guests once', () => {
        const d = departuresOf(slip());
        expect(d).toHaveLength(1);
        expect(d[0].rooms.map((r: any) => r.room_no)).toEqual(['501', '601']);
        expect(d[0].beds).toBe(8);
        expect(paxAt(slip(), T(5)).total).toBe(8);
    });
    it('keeps the history through the form, and undo goes back', () => {
        const f = { ...emptyForm(), building: 'RUBAT' };
        const moved = moveRows([newRow({ room_no: '502', capacity: 4, assigned: 4 })], { room: '502', building: 'RUBAT' }, { room: '601', capacity: 3, building: 'RUBAT' }, { date: '2026-11-04', time: '12:00' }, 'RUBAT');
        const saved = collectRows(moved, false, f)[0];
        expect(saved).toMatchObject({ room_no: '601', capacity: 3, moves: [{ room_no: '502', capacity: 4, until: { date: '2026-11-04', time: '12:00' } }] });
        const again = newRow(saved);
        expect(again.moves).toHaveLength(1);
        const back = undoMove(again, 'RUBAT');
        expect(back).toMatchObject({ room_no: '502', capacity: '4' });
        expect(back.moves).toBeUndefined();
    });
    it('a move to another building keeps that building on the row', () => {
        const moved = moveRows([newRow({ room_no: '502', capacity: 4, assigned: 4 })], { room: '502', building: 'RUBAT' }, { room: '101', capacity: 4, building: 'ONARA' }, { date: '2026-11-04', time: '12:00' }, 'RUBAT');
        const row = collectRows(moved, false, { ...emptyForm(), building: 'RUBAT' })[0];
        expect(row.building).toBe('ONARA');
        expect(rowsOf({ ...slip(), rooms: { gents: [row], ladies: [] } }).map((w: any) => [w.room_no, w.building])).toEqual([['101', 'ONARA'], ['502', 'RUBAT']]);
    });
    it('the slip check does not count the new room before the change', () => {
        const f = { ...emptyForm(), building: 'RUBAT', checkin_date: '2026-11-01', checkin_time: '12:00', checkout_date: '2026-11-08', checkout_time: '12:00' };
        const row = newRow({ room_no: '601', capacity: 4, assigned: 4, moves: [{ room_no: '502', capacity: 4, until: { date: '2026-11-04', time: '12:00' } }] });
        const earlier = { id: 2, sh_no: 'B', building: 'RUBAT', checkin_date: '2026-11-01', checkin_time: '12:00', checkout_date: '2026-11-03', checkout_time: '12:00', rooms: { gents: [{ room_no: '601', capacity: 4, assigned: 4 }], ladies: [] } };
        const R = { normRoom: (r: string) => r, findBuilding: () => null, builderCapacity: () => 4 };
        const stay = { normB: (b: string) => String(b).toUpperCase(), rowsOf };
        const a = checkAvailability(f, [row], [], { db: [earlier], buildings: [], currentId: 1, loadedRooms: new Set(), stay, rooms: R, delayOn: false, copy: {} } as any);
        expect(a.pass).toBe(true);
    });
});
