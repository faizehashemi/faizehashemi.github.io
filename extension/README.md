# PMS — UMS Group List sync (Chrome extension)

Every hour this extension exports the **Group List** from your logged-in UMS tab and hands the file
to the PMS, which imports it into this desk's site (see the **UMS** page in the PMS).

It uses your existing UMS login in the browser. It never sees or stores your UMS password.

## Install (once per computer)

1. Chrome → `chrome://extensions` → switch on **Developer mode** (top right).
2. **Load unpacked** → choose this `extension` folder.
3. Click the extension's icon (or *Details → Extension options*):
   - **UMS Group List page address** — open the Group List in UMS, set the filters you want exported
     (e.g. the date range), and paste the address bar here.
   - Leave **Export control** empty unless the fetch reports it cannot find the export button;
     then right-click the Export button in UMS → *Inspect* → copy its `id` and enter `#that-id`.
   - Press **Save** — Chrome asks to allow access to the UMS site. Allow it.
   - Press **Fetch now** to test. Status should read *Last fetch OK*.
4. In the PMS, open **UMS** for your site and tick **Apply every file the extension fetches automatically**
   (or leave it off and review each file there).

Keep one PMS tab and the UMS tab open on that computer. If no UMS tab is open, the extension opens one
pinned in the background (you still need to be logged in).

## How it works

- `background.js` — every *N* minutes (default 60) finds the UMS tab and runs `ums-export.js` in it.
  That repeats what clicking **Export** does in ASP.NET — posts the page's form (ViewState, current filters)
  with the export control as the event — but reads the response instead of downloading it.
- The file is kept (latest only) and sent to every open PMS tab through `bridge.js`.
- The PMS applies it only if auto-import is on for its site, skips a file it already applied, and holds
  files that look incomplete (fewer than half the rows of the last import) for review.
- **Keep-alive** (default every 10 min) re-requests the UMS page so the session does not expire between
  fetches. If UMS still logs you out, the icon shows **!** and a notification asks you to log in again.

## Troubleshooting

| Message | Fix |
|---|---|
| *No export control found* | Not logged in, or the address is not the Group List page, or set the Export control selector. |
| *UMS returned the page instead of the export file* | Auto-detect picked the wrong button — set the Export control selector. |
| *UMS returned its login page* | Log in to UMS in that tab again. |
| *Access to the UMS site is not granted* | Open the options and press **Save**, then allow. |
| PMS shows *held for review* | The export was much smaller than last time. Check the UMS filters, then apply it from the PMS UMS page. |

## Testing locally

`python tools/devserver.py` also serves a mock UMS page at
`http://localhost:8766/tools/mock-ums/GroupList.aspx` that answers the export with an anonymised sample.
Put that address in the options to try the whole flow without touching UMS.
