const KMS_DB_NAME='kms_db';const KMS_DB_VERSION=1;
const STORES={roles:{keyPath:'role_id',autoIncrement:true},stations:{keyPath:'station_id',autoIncrement:true},task_catalog:{keyPath:'task_id',autoIncrement:true},
workers:{keyPath:'worker_id',autoIncrement:true},shifts:{keyPath:'shift_id',autoIncrement:true},attendance:{keyPath:'attendance_id',autoIncrement:true},
timesheet_entries:{keyPath:'entry_id',autoIncrement:true},behavior_entries:{keyPath:'id',autoIncrement:true},change_log:{keyPath:'change_id',autoIncrement:true}};
function kmsOpenDB(){return new Promise((res,rej)=>{const r=indexedDB.open(KMS_DB_NAME,KMS_DB_VERSION);r.onupgradeneeded=()=>{const db=r.result;for(const n in STORES){if(!db.objectStoreNames.contains(n))db.createObjectStore(n,STORES[n]);}};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
async function kmsTx(names,mode='readonly'){const db=await kmsOpenDB();return db.transaction(names,mode)}
async function kmsAdd(s,v){const tx=await kmsTx([s],'readwrite');return new Promise((res,rej)=>{const req=tx.objectStore(s).add(v);req.onsuccess=()=>res(req.result);req.onerror=()=>rej(req.error)})}
async function kmsPut(s,v){const tx=await kmsTx([s],'readwrite');return new Promise((res,rej)=>{const req=tx.objectStore(s).put(v);req.onsuccess=()=>res(req.result);req.onerror=()=>rej(req.error)})}
async function kmsDel(s,k){const tx=await kmsTx([s],'readwrite');return new Promise((res,rej)=>{const req=tx.objectStore(s).delete(k);req.onsuccess=()=>res(true);req.onerror=()=>rej(req.error)})}
async function kmsGetAll(s){const tx=await kmsTx([s]);return new Promise((res,rej)=>{const req=tx.objectStore(s).getAll();req.onsuccess=()=>res(req.result||[]);req.onerror=()=>rej(req.error)})}
async function kmsEnsureSeeds(){if((await kmsGetAll('roles')).length===0){await kmsAdd('roles',{name:'Line Cook'});await kmsAdd('roles',{name:'Prep'})}
if((await kmsGetAll('stations')).length===0){await kmsAdd('stations',{name:'Grill'});await kmsAdd('stations',{name:'Fry'})}
if((await kmsGetAll('task_catalog')).length===0){await kmsAdd('task_catalog',{name:'Chop onions',category:'Prep',active:true});await kmsAdd('task_catalog',{name:'Grill chicken',category:'Cooking',active:true})}}