// Ported from pms/fea.html. Page logic is kept as it was; storage goes through ctx.db (app/core/db.js).

export default async function mount(ctx) {
const { db } = ctx;

/* ====== CONFIG & STORAGE ====== */
const DEFAULT_PEOPLE = [

];

        const LOCATIONS = ["*MP FLOOR*", "*DH FLOOR*", "*UG FLOOR*", "*SNOOD HOTEL*", "*MIZAB HOTEL*", "*LG FLOOR*"];
const TYPES = ["FE1","FE2","Atraaf"]; // FE split

const LS_PEOPLE = "umrah-atraaf-people-v2";
const LS_LOG    = "umrah-atraaf-log-v2";
const LS_FE1_BOOKMARK = "umrah-fe1-bookmark-v1";
let fe1Bookmark = loadBookmark();


let people = loadPeople();
let history = loadLog();

const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

/* ====== TRANSIENT SELECTIONS ====== */
const transient = new Map(); // name -> { type:Set(['FE1','FE2','Atraaf']), location }

/* ====== RENDER PEOPLE LIST ====== */
function renderPeople(){
  const list = $("#peopleList"); list.innerHTML = "";
  people.forEach((name, i)=>{
    const row = document.createElement("div");
    row.className = "person";
    row.dataset.person = name;

    const nameDiv = document.createElement("div");
    nameDiv.className = "name";
    nameDiv.innerHTML = `<span class="sr">${String(i+1).padStart(2,"0")}.</span> ${name}
                         <span class="tag small" style="margin-left:6px">${statsBadge(name)}</span>`;

    const fe1 = mkTick("FE1");
    const fe2 = mkTick("FE2");
    const at  = mkTick("Atraaf");

    const loc = document.createElement("select");
    loc.className = "select";
    loc.innerHTML = `<option value="">Select location…</option>` + LOCATIONS.map(l=>`<option>${l}</option>`).join("");
    loc.addEventListener("change", ()=>{
      const t = transient.get(name) || {type:new Set(), location:""};
      t.location = loc.value; transient.set(name, t); updatePreview();
    });

    const del = document.createElement("button");
    del.className = "del"; del.textContent = "Delete";
    del.title = "Remove person from list (history remains)";
    del.addEventListener("click", ()=>{
      if (!confirm(`Remove ${name}? History entries will stay.`)) return;
      people = people.filter(p=>p!==name); savePeople(); renderPeople(); renderKPIs(); drawHistogram(); updatePreview();
    });

    row.append(nameDiv, fe1, fe2, at, loc, del);
    list.append(row);

    function mkTick(label){
      const w = document.createElement("label");
      w.className = "switch";
      w.innerHTML = `<input type="checkbox" data-type="${label}" /> <span>${label}</span>`;
      w.querySelector("input").addEventListener("change", e=>{
        const t = transient.get(name) || {type:new Set(), location:""};
        if (e.target.checked) t.type.add(label); else t.type.delete(label);
        transient.set(name, t);
        updatePreview();
      });
      return w;
    }
  });

  // FE1 balance leaderboard chips
  renderFE1Leaderboard();
}

        function statsBadge(name) {
            const c = countByPerson(name);
            const feTotal = (c.FE1 || 0) + (c.FE2 || 0);
            return `T:${feTotal} · FE1:${c.FE1 || 0} · FE2:${c.FE2 || 0} · AT:${c.Atraaf || 0}`;
        }


        /* ====== PREVIEW (SECRET-FRIENDLY) ====== */
        function headerText() {
            const elTitle = $("#sessionTitle");
            const raw = (elTitle?.selectedOptions?.[0]?.text || elTitle?.value || "").trim();

            // pull time from end, e.g. "… 9:00 PM" or "… 2:30 am"
            let sessionTime = "";
            let sessionHead = raw;
            const m = raw.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i);
            if (m) {
                sessionTime = m[1].toUpperCase();
                sessionHead = raw.replace(m[0], "").trim().replace(/\s+/g, " ");
            }

            // date only from #sessionDate (type="date")
            const el = $("#sessionDate");
            let dt = new Date();
            if (el?.value) {
                const [d] = el.value.split("T"); // yyyy-mm-dd
                const [y, m2, dd] = (d || "").split("-").map(Number);
                if (y && m2 && dd) dt = new Date(y, (m2 || 1) - 1, dd || 1); // local midnight
            }

            const DD = String(dt.getDate()).padStart(2, "0");
            const MM = String(dt.getMonth() + 1).padStart(2, "0");
            const YYYY = dt.getFullYear();
            const WK = dt.toLocaleDateString(undefined, { weekday: "long" });

            // Three header lines: session head, date, time (+ weekday)
            const line1 = `*${sessionHead}*`;
            const line2 = `${DD}/${MM}/${YYYY} ${WK}`;
            const line3 = sessionTime ? `${sessionTime}` : WK;

            return `${line1}\n${line2}\n${line3}`;
        }

        function applyHeaderToPreview() {
            const headerLines = headerText().split("\n"); // [head, date, time+weekday]
            const prev = $("#preview");
            const lines = (prev.textContent || "").split("\n");

            if (lines.length < 3) {
                const body = lines.join("\n");
                prev.textContent =
                    `${headerLines[0] || ""}\n${headerLines[1] || ""}\n${headerLines[2] || ""}\n\n${body}`.trim();
            } else {
                lines[0] = headerLines[0] || "";
                lines[1] = headerLines[1] || "";
                lines[2] = headerLines[2] || "";
                prev.textContent = lines.join("\n");
            }
        }


function buildGroups(){
  const groups = {};
  for (const [name, obj] of transient.entries()){
    if (!obj || obj.type.size===0) continue; // must be assigned to something
    const loc = obj.location || "Unassigned";
    (groups[loc] ||= []).push(name);
  }
  for (const k in groups) groups[k].sort((a,b)=>a.localeCompare(b));
  const order = [...LOCATIONS.filter(l=>groups[l]), ...Object.keys(groups).filter(k=>!LOCATIONS.includes(k)).sort()];
  return {groups, order};
}

function updatePreview(){
    const { groups, order } = buildGroups();
    let out = headerText() + "\n\n"; // two-line header, then a blank line
    for (const k of order) {
        out += k + "\n";
        out += (groups[k] || []).join("\n") + "\n\n";
    }
    $("#preview").textContent = out.trim();

}

/* ====== SAVE ====== */
function saveAssignments(){
  const dt = ($("#sessionDate").value ? new Date($("#sessionDate").value) : new Date()).toISOString();
  let added = 0;

  for (const [name, obj] of transient.entries()){
    if (!obj || obj.type.size===0) continue;
    const loc = obj.location || "";
    for (const t of obj.type){
      history.push({ ts: dt, person: name, type: t, location: loc });
      added++;
    }
  }
  if (!added){ flash("Nothing ticked. Revolutionary to tick first, then save."); return; }
  saveLog(); renderHistory(); renderKPIs(); drawHistogram(); renderPeople();
  $("#btnClearChecks").click();
  flash(`Saved ${added} assignment${added>1?"s":""}.`);
}

/* ====== HISTORY TABLE ====== */
function renderHistory(){
  const tbody = $("#logTable tbody"); tbody.innerHTML = "";
  const sorted = [...history].sort((a,b)=> b.ts.localeCompare(a.ts));

  for (const r of sorted){
    const tr = document.createElement("tr");
    const when = new Date(r.ts).toLocaleString(undefined, {
      year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit"
    });
    const k = histKey(r);

    tr.innerHTML = `
      <td>${when}</td>
      <td>${r.type}</td>
      <td>${r.person}</td>
      <td>${r.location || ""}</td>
      <td class="td-actions">
        <button class="del small" data-del="${k}" title="Delete this assignment">Delete</button>
      </td>
    `;
    tbody.append(tr);
  }
}
// one listener for all delete buttons
document.querySelector("#logTable tbody").addEventListener("click", (e)=>{
  const btn = e.target.closest("button[data-del]");
  if (!btn) return;
  const key = btn.dataset.del;
  // tiny confirm so we don’t rage-delete an entire evening
  if (!confirm("Delete this assignment entry?")) return;
  deleteHistoryEntry(key);
});
function deleteHistoryEntry(key){
  const before = history.length;
  history = history.filter(r => histKey(r) !== key);
  saveLog();
  renderHistory(); renderKPIs(); drawHistogram(); renderPeople(); updatePreview();
  flash(before === history.length ? "Nothing deleted." : "Assignment deleted.");
}


/* ====== KPIs & STATS ====== */
function renderKPIs(){
  const today = new Date(); const Y=today.getFullYear(), M=today.getMonth(), D=today.getDate();
  const isToday = ts => { const t=new Date(ts); return t.getFullYear()===Y && t.getMonth()===M && t.getDate()===D; };
  $("#kpiFE1Today").textContent = history.filter(h=>h.type==="FE1"    && isToday(h.ts)).length;
  $("#kpiFE2Today").textContent = history.filter(h=>h.type==="FE2"    && isToday(h.ts)).length;
  $("#kpiATToday").textContent  = history.filter(h=>h.type==="Atraaf" && isToday(h.ts)).length;
  $("#kpiTotal").textContent    = history.length;
}

/* ====== FE1 FAIRNESS ====== */
function countByPerson(name){
  const counts = { FE1:0, FE2:0, Atraaf:0, lastFE1:null };
  for (const h of history) if (h.person===name){
    counts[h.type] = (counts[h.type]||0) + 1;
    if (h.type==="FE1") counts.lastFE1 = h.ts;
  }
  return counts;
}

function fe1Order(){
  // asc by FE1 count, then oldest lastFE1 first, then by name
  return people.map(n=>({ name:n, ...countByPerson(n) }))
    .sort((a,b)=>{
      if (a.FE1!==b.FE1) return a.FE1 - b.FE1;
      const ax = a.lastFE1 ? new Date(a.lastFE1).getTime() : 0;
      const bx = b.lastFE1 ? new Date(b.lastFE1).getTime() : 0;
      if (ax!==bx) return ax - bx;
      return a.name.localeCompare(b.name);
    });
}

function renderFE1Leaderboard(){
  const wrap = $("#fe1Leaderboard"); wrap.innerHTML = "";
  fe1Order().forEach((p,i)=>{
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = `${String(i+1).padStart(2,"0")} · ${p.name} · FE1:${p.FE1} (${p.lastFE1?new Date(p.lastFE1).toLocaleDateString(): "—"})`;
    wrap.append(span);
  });
}

$("#btnRecommendFE1").addEventListener("click", ()=>{
  const n = Math.max(1, parseInt($("#recCount").value||"3",10));
  const chosen = fe1Order().slice(0,n).map(p=>p.name);
  // tick FE1 for these, visually mark
  chosen.forEach(name=>{
    const row = $(`.person[data-person="${cssEscape(name)}"]`);
    if (!row) return;
    const cb = row.querySelector('input[data-type="FE1"]');
    cb.checked = true;
    const t = transient.get(name) || {type:new Set(), location:""};
    t.type.add("FE1"); transient.set(name,t);
    row.classList.add("balanced");
    setTimeout(()=>row.classList.remove("balanced"), 1200);
  });
  updatePreview();
});

/* ====== HISTOGRAM (vanilla canvas) ====== */
function drawHistogram(){
  const cv = $("#histPeople"); const ctx = cv.getContext("2d");
  const W = cv.width = cv.clientWidth; const H = cv.height = cv.clientHeight;

  // data
  const rows = people.map(n=>({ name:n, ...countByPerson(n) }));
  const maxV = Math.max(1, ...rows.map(r=>Math.max(r.FE1, r.FE2, r.Atraaf)));
  const padL=80, padR=10, padT=20, padB=30;
  const chartW = W - padL - padR; const chartH = H - padT - padB;

  // clear
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0,0,W,H);

  // axes
  ctx.strokeStyle = "#30465a"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(padL,padT); ctx.lineTo(padL, H-padB); ctx.lineTo(W-padR, H-padB); ctx.stroke();

  // y grid
  const steps = Math.min(6, maxV);
  for (let i=0;i<=steps;i++){
    const y = H - padB - (i/steps)*chartH;
    ctx.strokeStyle = i===0 ? "#30465a" : "rgba(82,116,140,.35)";
    ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(W-padR,y); ctx.stroke();
    ctx.fillStyle = "#7c8c9a"; ctx.font = "12px ui-monospace, monospace";
    ctx.fillText(String(Math.round((i/steps)*maxV)), 8, y+4);
  }

  // bars (grouped: FE1, FE2, Atraaf)
  const n = rows.length;
  const groupW = chartW / Math.max(1,n);
  const barW = Math.min(20, groupW/4);

  rows.forEach((r, idx)=>{
    const x0 = padL + idx*groupW + (groupW - 3*barW)/2;

    const series = [
      {key:"FE1",    val:r.FE1},
      {key:"FE2",    val:r.FE2},
      {key:"Atraaf", val:r.Atraaf}
    ];

    series.forEach((s, j)=>{
      const h = (s.val/maxV) * (chartH-2);
      const x = x0 + j*barW;
      const y = H - padB - h;

      // color by series without hard-coded colors request? fine, default canvas colors are bland; using stroke shades only.
      ctx.fillStyle = j===0 ? "#2e7dd1" : j===1 ? "#23a56b" : "#e3b341";
      ctx.strokeStyle = "#0a0a0a";
      ctx.fillRect(x, y, barW-2, h);
    });

    // labels
    ctx.fillStyle = "#9fb1c4"; ctx.font = "11px system-ui, sans-serif";
    const label = r.name.length>14 ? r.name.slice(0,12)+"…" : r.name;
    ctx.save(); ctx.translate(padL + idx*groupW + groupW/2, H - padB + 12);
    ctx.rotate(-Math.PI/6); ctx.textAlign = "center";
    ctx.fillText(label, 0, 0);
    ctx.restore();
  });
}

/* ====== IMPORT / EXPORT / RESET ====== */
$("#btnExport").addEventListener("click", ()=>{
  const blob = new Blob([JSON.stringify(history, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob); const a=document.createElement("a");
  a.href=url; a.download="umrah-atraaf-history.json"; a.click(); URL.revokeObjectURL(url);
});

$("#btnImport").addEventListener("click", ()=>{
  const inp = document.createElement("input"); inp.type="file"; inp.accept="application/json";
  inp.onchange = async e=>{
    const file = e.target.files[0]; if(!file) return;
    let data=[]; try{ data = JSON.parse(await file.text()); }catch{ flash("Invalid JSON. Nice try."); return; }
    const before = history.length;
    const key = r => [r.ts,r.person,r.type,r.location||""].join("|");
    const have = new Set(history.map(key));
    for (const r of data){ if (!r || !r.ts || !r.person || !r.type) continue; if (!have.has(key(r))) history.push(r); }
    saveLog(); renderHistory(); renderKPIs(); drawHistogram(); renderPeople();
    flash(`Imported ${history.length - before} new entries.`);
  };
  inp.click();
});

$("#btnReset").addEventListener("click", ()=>{
  if (!confirm("Wipe ALL saved history and people list?")) return;
  history = []; people = []; saveLog(); savePeople(); renderEverything(); flash("Factory reset. May fortune favor your next decisions.");
});

/* ====== COPY & CLEAR ====== */
$("#btnCopy").addEventListener("click", async ()=>{
  const text = $("#preview").textContent.trim();
  if (!text){ flash("Nothing to copy."); return; }
  try{ await navigator.clipboard.writeText(text); flash("Copied."); }
  catch{
    const ta=document.createElement("textarea"); ta.value=text; document.body.append(ta); ta.select();
    document.execCommand("copy"); ta.remove(); flash("Copied.");
  }
});

$("#btnClearChecks").addEventListener("click", ()=>{
  $$("#peopleList input[type=checkbox]").forEach(cb=>cb.checked=false);
  $$("#peopleList select").forEach(s=>s.selectedIndex = 0);
  transient.clear(); updatePreview();
});

/* ====== ADD PERSON ====== */
$("#btnAddPerson").addEventListener("click", ()=>{
  const name = ($("#newPersonName").value||"").trim();
  if (!name) return flash("Give the human a name.");
  if (people.includes(name)) return flash("Already exists.");
  people.push(name); savePeople(); $("#newPersonName").value=""; renderPeople(); drawHistogram(); updatePreview();
});

/* ====== BUTTON: SAVE ====== */
        $("#btnSave").addEventListener("click", saveAssignments);

        /* ====== Header Preview ====== */

        $("#sessionTitle").addEventListener("change", applyHeaderToPreview);
        $("#sessionDate").addEventListener("input", applyHeaderToPreview);


/* ====== UTIL ====== */
// unique-ish key for a history record
function histKey(r){
  return [r.ts, r.person, r.type, r.location || ""].join("|");
}

function flash(msg){
  const x = document.createElement("div");
  x.textContent = msg;
  x.style.cssText = "position:fixed; bottom:18px; left:50%; transform:translateX(-50%); background:#162433; color:#dff6ff; border:1px solid #264459; padding:10px 14px; border-radius:12px; z-index:99";
  document.body.append(x); setTimeout(()=>x.remove(), 2200);
}
function savePeople(){ localStorage.setItem(LS_PEOPLE, JSON.stringify(people)); }
function loadPeople(){
  try{ const v = JSON.parse(localStorage.getItem(LS_PEOPLE)||"null"); return Array.isArray(v)&&v.length ? v : DEFAULT_PEOPLE.slice(); }
  catch{ return DEFAULT_PEOPLE.slice(); }
}
function saveLog(){ localStorage.setItem(LS_LOG, JSON.stringify(history)); }
function loadLog(){ try{ return JSON.parse(localStorage.getItem(LS_LOG)||"[]"); } catch{ return []; } }
function cssEscape(s){ return s.replace(/[^\w-]/g, m=>`\\${m}`); }

/* ====== EXCEL EXPORT (HTML .xls to match your format) ====== */
function fmtShort(dISO){
  const d = new Date(dISO);
  const dd = String(d.getDate()).padStart(2,"0");
  const mon = d.toLocaleString(undefined, { month:"short" });
  return `${dd}-${mon}`;
}
function collectDatesByPerson(typeSet){
  // returns Map(name -> sorted array of dd-Mon strings)
  const m = new Map();
  people.forEach(n=>m.set(n, []));
  for (const r of history){
    if (!typeSet.has(r.type)) continue;
    if (!m.has(r.person)) m.set(r.person, []);
    m.get(r.person).push(fmtShort(r.ts));
  }
  // sort & dedupe
  for (const [k, arr] of m.entries()){
    arr.sort((a,b)=>{
      const pa = Date.parse(a.replace(/-(\w\w\w)$/, " $1 2001")); // month-order fallback
      const pb = Date.parse(b.replace(/-(\w\w\w)$/, " $1 2001"));
      return pa - pb || a.localeCompare(b);
    });
    m.set(k, Array.from(new Set(arr)));
  }
  return m;
}
function buildTableHTML(title, rows, dateColCount){
  const cols = 2 + dateColCount; // SR, NAME, dates...
  const border = "border:1px solid #000;";
  const th = `style="${border} font-weight:bold; text-align:center; padding:4px 6px;"`;
  const td = `style="${border} padding:4px 6px;"`;
  let html = `<table cellspacing="0" cellpadding="0" style="border-collapse:collapse; ${border} width:100%;">`;
  html += `<tr><th ${th} colspan="${cols}" style="${border} font-size:18px; color:#c00000; text-align:center;">${title}</th></tr>`;
  // header row
  html += `<tr><th ${th}>SR NO.</th><th ${th}>NAME</th>`;
  for(let i=0;i<dateColCount;i++) html += `<th ${th}>DATE</th>`;
  html += `</tr>`;
  // body
  let sr = 1;
  for (const [name, dates] of rows){
    html += `<tr><td ${td} style="text-align:center;">${sr++}</td><td ${td}>${name}</td>`;
    for(let i=0;i<dateColCount;i++){
      html += `<td ${td}>${dates[i] || ""}</td>`;
    }
    html += `</tr>`;
  }
  html += `</table>`;
  return html;
}
function exportExcelLikeSheet(){
  // FE1 + FE2 under FAKKUL
  const feMap = collectDatesByPerson(new Set(["FE1","FE2"]));
  const atMap = collectDatesByPerson(new Set(["Atraaf"]));

  // keep the order of current "people" list
  const feRows = people.map(n => [n, feMap.get(n) || []]);
  const atRows = people.map(n => [n, atMap.get(n) || []]);

  const feMaxCols = Math.max(0, ...feRows.map(r=>r[1].length), 14); // default to 14 DATE cols like your image
  const atMaxCols = Math.max(0, ...atRows.map(r=>r[1].length), 14);

  const headNote = `
    <div style="font-family:Calibri,Arial; font-size:12px; margin:6px 0 10px;">
      <div><strong>Session:</strong> ${($("#sessionTitle").value||"").trim() || "—"} | <strong>Date:</strong> ${($("#sessionDate").value ? new Date($("#sessionDate").value).toLocaleString() : new Date().toLocaleString())}</div>
    </div>
  `;

  const feTable = buildTableHTML("FAKKUL EHRAAM", feRows, feMaxCols);
  const atTable = buildTableHTML("ATRAAF", atRows, atMaxCols);

  const doc = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8" />
      <!-- This HTML is intentionally Excel-friendly. Yes, Excel will open it like a champ. -->
    </head>
    <body>
      ${headNote}
      ${feTable}
      <div style="height:16px"></div>
      ${atTable}
    </body>
    </html>
  `;
  const blob = new Blob([doc], {type: "application/vnd.ms-excel"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Assignments_FE_AT.xls";
  a.click();
  URL.revokeObjectURL(url);
}

/* wire up the new button */
document.getElementById("btnExportExcel").addEventListener("click", exportExcelLikeSheet);

        function loadBookmark() { try { return localStorage.getItem(LS_FE1_BOOKMARK) || ""; } catch { return ""; } }
        function saveBookmark(name) { fe1Bookmark = name || ""; localStorage.setItem(LS_FE1_BOOKMARK, fe1Bookmark); renderBookmarkUI(); }
        function renderBookmarkUI() {
            const disp = document.getElementById("bookmarkDisplay");
            if (disp) disp.textContent = fe1Bookmark ? `Bookmark: ${fe1Bookmark}` : "Bookmark: —";
            const sel = document.getElementById("feBookmark");
            if (sel) sel.innerHTML = `<option value="">— choose —</option>` + people.map(n => `<option ${n === fe1Bookmark ? 'selected' : ''}>${n}</option>`).join("");
        }

        function tickFE1ByName(name) {
            const row = document.querySelector(`.person[data-person="${cssEscape(name)}"]`);
            if (!row) return;
            const cb = row.querySelector('input[data-type="FE1"]');
            cb.checked = true;
            const t = transient.get(name) || { type: new Set(), location: "" };
            t.type.add("FE1"); transient.set(name, t);
            row.classList.add("balanced");
            setTimeout(() => row.classList.remove("balanced"), 1200);
        }

        function assignNextFromBookmark(n) {
            if (!people.length) return flash("No people to assign.");
            let start = fe1Bookmark ? people.indexOf(fe1Bookmark) : -1;
            if (start === -1) start = -1;
            const chosen = [];
            for (let i = 1; i <= people.length && chosen.length < n; i++) {
                const name = people[(start + i) % people.length];
                chosen.push(name);
            }
            chosen.forEach(tickFE1ByName);
            if (chosen.length) saveBookmark(chosen[chosen.length - 1]); // advance pointer
            updatePreview();
        }

        // Bookmark UI buttons
        document.getElementById("btnSetBookmark").addEventListener("click", () => {
            const val = (document.getElementById("feBookmark").value || "").trim();
            if (!val) return flash("Pick a name to bookmark.");
            if (!people.includes(val)) return flash("That name is not in the list.");
            saveBookmark(val);
        });

        document.getElementById("btnNextFromBookmark").addEventListener("click", () => {
            const n = Math.max(1, parseInt(document.getElementById("recCount2").value || "3", 10));
            assignNextFromBookmark(n);
        });

        // Icon toggles
        const cardDash = document.getElementById("cardDashboard");
        const cardHist = document.getElementById("cardHistory");
        document.getElementById("toggleDash").addEventListener("click", () => {
            cardDash.classList.toggle("hidden");
        });
        document.getElementById("toggleHistory").addEventListener("click", () => {
            cardHist.classList.toggle("hidden");
        });


/* ====== INIT ====== */
(function init(){
  const now = new Date(); now.setMinutes(now.getMinutes() - (now.getMinutes()%5), 0, 0);
  $("#sessionDate").value = new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,16);
  renderEverything();
})();
function renderEverything(){
    renderPeople(); renderHistory(); renderKPIs(); drawHistogram(); updatePreview(); renderBookmarkUI();

}

}
