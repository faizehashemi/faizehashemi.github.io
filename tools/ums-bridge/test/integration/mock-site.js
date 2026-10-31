// A stand-in for the legacy UMS, for tests only: a Web Forms-style login (optionally behind a mock CAPTCHA widget), a Group List page with a filter, a
// two-page GridView pager, an "Export" postback that returns an HTML table as an attachment, and sessions that can be expired on demand.
// The mock CAPTCHA is just a widget the page's own check looks at — a test plays the "person" by setting its token; the real UMS is never contacted.
import http from 'node:http';

const ROWS = Array.from({ length: 7 }, (_, i) => ({ sr: i + 1, sh: String(44000 + i), name: `GROUP ${i + 1}`, from: i < 4 ? '01/10/2026' : '05/10/2026' }));
const PAGE = 4;

export function startMockSite({ captcha = false, user = 'desk', pass = 'secret' } = {}) {
    const sessions = new Set();
    const stats = { logins: 0, exports: 0, captchaRejects: 0 };
    const cookieOf = (req) => (String(req.headers.cookie || '').match(/sid=([\w-]+)/) || [])[1];
    const form = (action, inner) => `<form method="post" action="${action}" id="form1"><input type="hidden" name="__EVENTTARGET" id="__EVENTTARGET"><input type="hidden" name="__EVENTARGUMENT" id="__EVENTARGUMENT"><input type="hidden" name="__VIEWSTATE" value="vs=="><input type="hidden" name="__EVENTVALIDATION" value="ev==">
        <script>function __doPostBack(t,a){var f=document.forms.form1;f.__EVENTTARGET.value=t;f.__EVENTARGUMENT.value=a;f.submit();}</script>${inner}</form>`;
    const login = (msg = '') => `<!doctype html><html><head><title>UMS Login</title></head><body><h2>Login</h2>${form('/Login.aspx', `
        <span id="ctl00_lblError" style="color:Red">${msg}</span>
        <input type="text" name="ctl00$txtUser" id="ctl00_txtUser"><input type="password" name="ctl00$txtPass" id="ctl00_txtPass">
        ${captcha ? `<div class="g-recaptcha" data-sitekey="mock" style="width:304px;height:78px;border:1px solid #999"><iframe src="https://www.google.com/recaptcha/api2/anchor?mock" title="reCAPTCHA" width="304" height="78"></iframe></div><textarea name="g-recaptcha-response" id="g-recaptcha-response" style="display:none"></textarea>` : ''}
        <input type="submit" name="ctl00$btnLogin" value="Login">`)}</body></html>`;
    const table = (rows) => `<table id="gv"><tr><th>SR NO</th><th>SH Ref</th><th>Group</th><th>From</th></tr>${rows.map(r => `<tr><td>${r.sr}</td><td>${r.sh}</td><td>${r.name}</td><td>${r.from}</td></tr>`).join('')}</table>`;
    const list = (q = {}) => {
        const from = q['ctl00$ContentPlaceHolder1$txtFrom'] || '';
        const all = ROWS.filter(r => !from || r.from === from);
        const page = Math.max(1, Number(String(q.__EVENTTARGET) === 'gv' ? String(q.__EVENTARGUMENT).replace('Page$', '') : q.page) || 1);
        const rows = all.slice((page - 1) * PAGE, page * PAGE);
        const pages = Math.ceil(all.length / PAGE);
        return `<!doctype html><html><head><title>Group List</title></head><body><a id="lnkLogout" href="/Logout.aspx">Logout</a><h2>Group List</h2>${form(`/GroupList.aspx?page=${page}`, `
            <input type="text" name="ctl00$ContentPlaceHolder1$txtFrom" value="${from}"><input type="submit" name="ctl00$ContentPlaceHolder1$btnSearch" value="Search">
            <a id="lnkExport" href="javascript:__doPostBack('ctl00$ContentPlaceHolder1$lnkExport','')">Export to Excel</a>
            ${table(rows)}<div class="pager">${page < pages ? `<a href="javascript:__doPostBack('gv','Page$${page + 1}')">Next</a>` : ''}</div>`)}</body></html>`;
    };
    const body = (req) => new Promise(r => { let s = ''; req.on('data', c => (s += c)); req.on('end', () => r(Object.fromEntries(new URLSearchParams(s)))); });
    const send = (res, code, text, headers = {}) => { res.writeHead(code, { 'content-type': 'text/html; charset=utf-8', ...headers }); res.end(text); };

    const server = http.createServer(async (req, res) => {
        const url = new URL(req.url, 'http://x');
        url.pathname = url.pathname.replace(/^\/login\.aspx$/i, '/Login.aspx').replace(/^\/grouplist\.aspx$/i, '/GroupList.aspx');   // IIS paths are case-insensitive
        const authed = sessions.has(cookieOf(req));
        if (url.pathname === '/Login.aspx') {
            if (req.method === 'GET') return send(res, 200, login());
            const f = await body(req);
            if (captcha && String(f['g-recaptcha-response'] || '').length < 20) { stats.captchaRejects++; return send(res, 200, login('Please complete the CAPTCHA.')); }
            if (f['ctl00$txtUser'] !== user || f['ctl00$txtPass'] !== pass) return send(res, 200, login('Invalid user name or password.'));
            const sid = `s${Date.now()}${Math.random().toString(36).slice(2, 8)}`; sessions.add(sid); stats.logins++;
            return send(res, 302, '', { location: '/GroupList.aspx', 'set-cookie': `sid=${sid}; Path=/; HttpOnly` });
        }
        if (url.pathname === '/Logout.aspx') { sessions.delete(cookieOf(req)); return send(res, 302, '', { location: '/Login.aspx' }); }
        if (!authed) return send(res, 302, '', { location: '/Login.aspx?ReturnUrl=' + encodeURIComponent(url.pathname) });
        if (url.pathname === '/Panel.aspx') {
            if (req.method === 'GET') return send(res, 200, `<!doctype html><html><head><title>Panel</title></head><body><a id="lnkLogout" href="/Logout.aspx">Logout</a>${form('/Panel.aspx', `
                <script>window.Sys = { WebForms: { PageRequestManager: (function () { var h = []; var o = { add_endRequest: function (f) { h.push(f); }, fire: function () { h.forEach(function (f) { f(); }); } }; return { getInstance: function () { return o; } }; })() } };</script>
                <div id="ctl00_UpdatePanel1"><span id="lblCount">0</span></div>
                <input type="button" id="btnMore" name="ctl00$btnMore" value="More" onclick="fetch('/Panel.aspx', { method: 'POST', headers: { 'X-MicrosoftAjax': 'Delta=true', 'content-type': 'application/x-www-form-urlencoded' }, body: 'ctl00%24btnMore=More&__VIEWSTATE=vs%3D%3D' }).then(function (r) { return r.text(); }).then(function (t) { var i = t.indexOf('|updatePanel|'); var rest = t.slice(i + 13); var id = rest.slice(0, rest.indexOf('|')); var content = rest.slice(id.length + 1); document.getElementById(id).innerHTML = content.slice(0, content.lastIndexOf('|', content.length - 2)); Sys.WebForms.PageRequestManager.getInstance().fire(); })">`)}</body></html>`);
            const f = await body(req); stats.async = (stats.async || 0) + 1;
            const html = `<span id="lblCount">${stats.async}</span>`;
            return send(res, 200, `${html.length}|updatePanel|ctl00_UpdatePanel1|${html}|`, { 'content-type': 'text/plain; charset=utf-8' });
        }
        if (url.pathname === '/GroupList.aspx') {
            if (req.method === 'GET') return send(res, 200, list({ page: url.searchParams.get('page') }));
            const f = await body(req);
            if (f.__EVENTTARGET === 'ctl00$ContentPlaceHolder1$lnkExport') { stats.exports++; return send(res, 200, table(ROWS.filter(r => !f['ctl00$ContentPlaceHolder1$txtFrom'] || r.from === f['ctl00$ContentPlaceHolder1$txtFrom'])), { 'content-disposition': 'attachment; filename="GroupList_mock.xls"', 'content-type': 'application/vnd.ms-excel' }); }
            return send(res, 200, list(f));
        }
        send(res, 404, 'not found');
    });
    return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve({
        url: `http://127.0.0.1:${server.address().port}`, host: `127.0.0.1:${server.address().port}`, stats, user, pass,
        expireSessions: () => sessions.clear(),
        close: () => new Promise(r => server.close(r)),
    })));
}
