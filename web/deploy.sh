#!/usr/bin/env sh
# Publish pms/ to https://pms.raajsoftware.com.
# Stamps a new build id into pms/version.json first: every open page (browser or Android app) sees it within
# ~5 minutes and reloads itself. Raise "android_min" in pms/version.json when an old APK must stop working.
set -e
cd "$(dirname "$0")"
node -e "const f='../pms/version.json',fs=require('fs'),v=JSON.parse(fs.readFileSync(f,'utf8'));v.web=new Date().toISOString().replace(/[-:.]/g,'').slice(0,15)+'Z';fs.writeFileSync(f,JSON.stringify(v,null,2)+'\n');console.log('build',v.web)"
npx --yes wrangler@4 deploy
