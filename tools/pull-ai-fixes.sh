#!/usr/bin/env sh
# Copy into this local folder the AI fixes that are on GitHub but not here (Performance page → AI fixes commits them to GitHub
# main; this folder is not a git clone). Run from anywhere:  sh tools/pull-ai-fixes.sh
# web/deploy.sh refuses a production deploy while GitHub has AI fixes this folder lacks.
set -e
cd "$(dirname "$0")/.."
node -e "
const fs = require('fs'), path = require('path');
const RAW = 'https://raw.githubusercontent.com/faizehashemi/faizehashemi.github.io/main/';
(async () => {
  const gh = await (await fetch(RAW + 'pms/ai-fixes.json?' + Date.now())).json();
  let loc = []; try { loc = JSON.parse(fs.readFileSync('pms/ai-fixes.json', 'utf8')); } catch {}
  const have = new Set(loc.map(x => x.id)), miss = gh.filter(x => !have.has(x.id));
  if (!miss.length) { console.log('Up to date — no AI fixes missing.'); return; }
  const files = [...new Set(miss.flatMap(x => x.files || []))];
  for (const f of files) {
    const r = await fetch(RAW + f + '?' + Date.now());
    if (!r.ok) { console.error('could not download', f, r.status); process.exit(1); }
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
    console.log('updated', f);
  }
  fs.writeFileSync('pms/ai-fixes.json', JSON.stringify(gh, null, 1) + '\n');
  console.log('Pulled AI fixes:', miss.map(x => '#' + x.id + ' ' + x.title).join('; '));
  console.log('Note: these files now hold GitHub main\'s version (any newer edit made here to the same files must be re-applied).');
})().catch(e => { console.error(e.message); process.exit(1); });
"
