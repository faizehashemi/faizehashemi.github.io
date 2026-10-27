#!/usr/bin/env sh
# Publish to https://pms.raajsoftware.com (production) or to the staging site.
#   sh deploy.sh            production: builds the React pages (../react → ../pms/react), stamps pms/version.json, publishes pms/
#   sh deploy.sh staging    staging: same files in a copy whose API is the staging API, React pages switched on, "STAGING" banner
# Every open page (browser or Android app) sees a new build id within ~5 minutes and reloads itself. Raise "android_min" in
# pms/version.json when an old APK must stop working.
set -e
cd "$(dirname "$0")"

# the React pages (pms/react/*); production keeps every page on the legacy version until a page is switched on in pms/app/config.js
if [ -f ../react/package.json ]; then
  (cd ../react && { [ -d node_modules ] || npm ci --silent; } && npm run build --silent)
fi

STAMP=$(node -e "console.log(new Date().toISOString().replace(/[-:.]/g,'').slice(0,15)+'Z')")

if [ "$1" = "staging" ]; then
  API_STAGING="${PMS_STAGING_API:-https://pms-api-staging.tkamlapur.workers.dev}"
  rm -rf .staging-build && mkdir .staging-build
  cp -R ../pms/. .staging-build/
  node -e "
    const fs=require('fs'), d='.staging-build/';
    let c=fs.readFileSync(d+'app/config.js','utf8');
    c=c.replace(/export const API_URL = '[^']*';/, \"export const API_URL = '$API_STAGING';\");
    c=c.replace(/export const REACT_PAGES = \[[^\]]*\];/, \"export const REACT_PAGES = (localStorage.getItem('pms_react_off') ? [] : ['paxchart','blank','slip-search','backups','changelog','key-cards','pending-checkouts','menu-card','performance','occupancy','housekeeping','departures','tosha','grouping','group-export','kg','mawaid','timeline','grid','checkins','transport','transport-print','transport-import','laundry-admin','signage-builder','laundry','admin','ums','login','settings','builder','setup','home','forecast','slip']);\");
    fs.writeFileSync(d+'app/config.js', c);
    let h=fs.readFileSync(d+'index.html','utf8');
    h=h.replace('<body>', '<body><div style=\"position:fixed;z-index:2147483000;left:0;right:0;bottom:0;background:#c0392b;color:#fff;text-align:center;font:700 12px system-ui;padding:3px\">STAGING — test data, nothing here is real</div>');
    fs.writeFileSync(d+'index.html', h);
    const v=JSON.parse(fs.readFileSync(d+'version.json','utf8')); v.web='staging-'+'$STAMP'; fs.writeFileSync(d+'version.json', JSON.stringify(v,null,2)+'\n');
  "
  npx --yes wrangler@4 deploy -c wrangler.staging.toml
  exit 0
fi

node -e "const f='../pms/version.json',fs=require('fs'),v=JSON.parse(fs.readFileSync(f,'utf8'));v.web='$STAMP';fs.writeFileSync(f,JSON.stringify(v,null,2)+'\n');console.log('build',v.web)"
npx --yes wrangler@4 deploy
