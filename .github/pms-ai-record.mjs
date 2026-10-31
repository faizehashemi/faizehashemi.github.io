// Adds this AI fix to pms/ai-fixes.json (job id, date, title, files). web/deploy.sh compares that list with GitHub's before a
// production deploy from a local folder, so a deploy from an old local copy cannot silently undo an AI fix
// (tools/pull-ai-fixes.sh copies the missing fixes in).
import fs from 'node:fs';

const task = JSON.parse(fs.readFileSync('/tmp/task.json', 'utf8'));
const files = fs.readFileSync('/tmp/files.txt', 'utf8').split('\n').filter(Boolean);
const f = 'pms/ai-fixes.json';
let list = [];
try { list = JSON.parse(fs.readFileSync(f, 'utf8')); } catch { }
if (!Array.isArray(list)) list = [];
list = list.filter(x => x.id !== task.job_id);
list.push({ id: task.job_id, date: new Date().toISOString().slice(0, 10), title: String(task.title || '').slice(0, 160), files });
fs.writeFileSync(f, JSON.stringify(list, null, 1) + '\n');
console.log('recorded AI fix', task.job_id, files.length, 'files');
