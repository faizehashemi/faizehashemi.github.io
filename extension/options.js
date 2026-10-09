const FIELDS = { umsUrl: '', exportSelector: '', intervalMin: 60, keepAliveMin: 10, openTab: true };
const $ = (id) => document.getElementById(id);

async function load() {
    const s = { ...FIELDS, ...(await chrome.storage.sync.get(Object.keys(FIELDS))) };
    for (const [k, v] of Object.entries(s)) {
        if (typeof FIELDS[k] === 'boolean') $(k).checked = !!v; else $(k).value = v;
    }
    renderState();
}

function when(iso) { return iso ? new Date(iso).toLocaleString() : ''; }

async function renderState() {
    const st = await chrome.runtime.sendMessage({ type: 'state' });
    if (!st) return;
    const parts = [];
    if (st.lastStatus) parts.push(st.lastStatus.ok
        ? `<span class="ok">Last fetch OK</span> · ${when(st.lastStatus.at)}`
        : `<span class="bad">Last fetch failed</span> · ${when(st.lastStatus.at)} — ${st.lastStatus.error}`);
    if (st.latest) parts.push(`Latest file: ${st.latest.fileName} (${Math.round(st.latest.bytes / 1024)} KB) · ${when(st.latest.fetchedAt)}`);
    const next = (st.alarms || []).find(a => a.name === 'fetch');
    parts.push(next ? `Next fetch: ${new Date(next.scheduledTime).toLocaleTimeString()}` : 'Not scheduled — set the Group List address and Save.');
    $('status').innerHTML = parts.join('<br>');
}

$('save').addEventListener('click', async () => {
    const s = {};
    for (const k of Object.keys(FIELDS)) s[k] = typeof FIELDS[k] === 'boolean' ? $(k).checked : (typeof FIELDS[k] === 'number' ? Number($(k).value) : $(k).value.trim());
    let origin;
    try { origin = new URL(s.umsUrl).origin + '/*'; } catch { $('msg').innerHTML = '<span class="bad">Enter the full Group List address (https://…).</span>'; return; }
    // Chrome asks the user to allow access to that one site
    const granted = await chrome.permissions.request({ origins: [origin] });
    if (!granted) { $('msg').innerHTML = '<span class="bad">Access to the UMS site was not allowed.</span>'; return; }
    await chrome.storage.sync.set(s);
    $('msg').innerHTML = '<span class="ok">Saved.</span>';
    setTimeout(renderState, 300);
});

$('fetchNow').addEventListener('click', async () => {
    $('msg').textContent = 'Fetching…';
    const st = await chrome.runtime.sendMessage({ type: 'fetch-now' });
    $('msg').innerHTML = st?.ok ? '<span class="ok">Fetched and sent to open PMS tabs.</span>' : `<span class="bad">${st?.error || 'Failed.'}</span>`;
    renderState();
});

load();
