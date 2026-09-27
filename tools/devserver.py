"""Local dev server for the PMS: serves the repo root with caching disabled, so edited
ES modules are always re-fetched on reload.

    python tools/devserver.py [port]      # default 8766 → http://localhost:8766

It also plays a mock UMS: POSTing the export postback to /tools/mock-ums/GroupList.aspx returns
the anonymised sample export, like the real ASP.NET page would (used to test the extension).
"""
import functools
import http.server
import pathlib
import sys
import urllib.parse

ROOT = pathlib.Path(__file__).resolve().parent.parent
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8766
MOCK_PAGE = "/tools/mock-ums/GroupList.aspx"
FIXTURE = ROOT / "tools" / "fixtures" / "ums-grouplist-sample.xls"
EXPORT_TARGETS = {"ctl00$ContentPlaceHolder1$lnkExport", "ctl00$ContentPlaceHolder1$btnExportXls"}


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, ".aspx": "text/html", ".xls": "application/vnd.ms-excel"}

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_POST(self):
        if urllib.parse.urlparse(self.path).path != MOCK_PAGE:
            self.send_error(405)
            return
        body = self.rfile.read(int(self.headers.get("Content-Length") or 0)).decode("utf-8", "replace")
        form = urllib.parse.parse_qs(body, keep_blank_values=True)
        target = (form.get("__EVENTTARGET") or [""])[0]
        clicked = target in EXPORT_TARGETS or any(k in EXPORT_TARGETS for k in form)
        if clicked and form.get("__VIEWSTATE") == ["mockViewState=="]:
            data = FIXTURE.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "application/vnd.ms-excel")
            self.send_header("Content-Disposition", 'attachment; filename="GroupList2026_09_27_12_00_00.xls"')
        else:  # any other postback just re-renders the page
            data = (ROOT / MOCK_PAGE.lstrip("/")).read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


http.server.ThreadingHTTPServer(("127.0.0.1", PORT), functools.partial(Handler, directory=str(ROOT))).serve_forever()
