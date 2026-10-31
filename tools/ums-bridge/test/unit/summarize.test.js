import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDelta, redactForm, slug } from '../../src/summarize.js';

test('redactForm: passwords and ViewState are never kept, other fields are', () => {
    const f = redactForm('ctl00%24txtUser=desk&ctl00%24txtPass=hunter2&__VIEWSTATE=' + 'A'.repeat(500) + '&__EVENTTARGET=ctl00%24lnkExport&__EVENTVALIDATION=xyz');
    assert.equal(f['ctl00$txtUser'], 'desk');
    assert.equal(f['ctl00$txtPass'], '[not recorded]');
    assert.equal(f['__VIEWSTATE'], '[500 chars]');
    assert.equal(f['__EVENTTARGET'], 'ctl00$lnkExport');
    assert.equal(redactForm(null), null);
    assert.ok(!JSON.stringify(f).includes('hunter2'));
});

test('parseDelta reads the UpdatePanel answer into its parts', () => {
    const body = '5|hello|x|abcde|' ;   // not a real type, but the shape is the same: length|type|id|content|
    assert.deepEqual(parseDelta(body), [{ type: 'hello', id: 'x', length: 5 }]);
    const two = `10|updatePanel|ctl00_up|${'x'.repeat(10)}|4|hiddenField|__VIEWSTATE|abcd|`;
    assert.deepEqual(parseDelta(two), [{ type: 'updatePanel', id: 'ctl00_up', length: 10 }, { type: 'hiddenField', id: '__VIEWSTATE', length: 4 }]);
    assert.equal(parseDelta('not a delta'), null);
});

test('slug makes safe short file names', () => {
    assert.equal(slug('https://ums.sigatulhaj.org/Group List.aspx?x=1'), 'group-list-aspx-x-1');
    assert.equal(slug(''), 'page');
});
