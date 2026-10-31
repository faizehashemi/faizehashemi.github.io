// Tells the PMS (Performance page → AI fixes) how an AI fix run is going: node .github/pms-ai-report.mjs <status> "<message>"
// Reads what earlier workflow steps left in /tmp (deploy ids, commit, changed files) and the AI's report ai-fix-summary.md.
import fs from 'node:fs';

const read = (f) => { try { return fs.readFileSync(f, 'utf8').trim(); } catch { return ''; } };
const [status, message = ''] = process.argv.slice(2);
const body = {
    status, message: message.slice(0, 480), run_url: process.env.RUN_URL,
    commit: read('/tmp/commit.txt') || undefined, deploy_web: read('/tmp/deploy_web.txt') || undefined, deploy_api: read('/tmp/deploy_api.txt') || undefined,
    files: read('/tmp/files.txt').split('\n').filter(Boolean).join(', ') || undefined, summary: read('ai-fix-summary.md').slice(0, 5800) || undefined,
};
const r = await fetch(process.env.REPORT_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-AI-Secret': process.env.AI_SECRET || '' }, body: JSON.stringify(body) });
console.log('report', status, r.status);
if (!r.ok) process.exitCode = 1;
