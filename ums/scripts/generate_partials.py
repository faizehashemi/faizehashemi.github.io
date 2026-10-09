from __future__ import annotations
from pathlib import Path
from textwrap import dedent

ROOT = Path(__file__).resolve().parents[1]
PARTIALS = ROOT / "partials"


def render_badge(text: str, badge: str = "bg-primary") -> str:
    if not text:
        return ""
    return f"<span class=\"badge {badge}\">{text}</span>"


def render_filters(filters: list[str]) -> str:
    if not filters:
        return ""
    inputs = []
    for flt in filters:
        inputs.append(dedent(f"""
            <div class=\"col-md-3\">
              <label class=\"form-label\">{flt}</label>
              <input type=\"text\" class=\"form-control form-control-sm\" placeholder=\"{flt}\">
            </div>
        """))
    return dedent(f"""
        <div class=\"card mb-3\">
          <div class=\"card-body\">
            <form class=\"row g-3\">
{''.join(inputs)}
              <div class=\"col-md-3 d-flex align-items-end\">
                <div class=\"btn-group\">
                  <button type=\"button\" class=\"btn btn-primary btn-sm\">Apply</button>
                  <button type=\"button\" class=\"btn btn-outline-secondary btn-sm\">Reset</button>
                </div>
              </div>
            </form>
          </div>
        </div>
    """)


def render_cards(cards: list[dict]) -> str:
    if not cards:
        return ""
    items = []
    for card in cards:
        badge = render_badge(card.get("context"), card.get("badge", "bg-primary"))
        items.append(dedent(f"""
            <div class=\"col-sm-6 col-lg-3\">
              <div class=\"card mb-3\">
                <div class=\"card-body\">
                  <div class=\"text-muted small\">{card['label']}</div>
                  <h3 class=\"mb-2\">{card['value']}</h3>
                  {badge}
                </div>
              </div>
            </div>
        """))
    return "<div class=\"row\">" + "".join(items) + "</div>"


def render_buttons(actions: list[str]) -> str:
    if not actions:
        return ""
    btns = "".join(
        f"<button type=\"button\" class=\"btn btn-outline-primary btn-sm\">{action}</button>" for action in actions
    )
    return dedent(f"""
        <div class=\"d-flex flex-wrap gap-2 mb-3\">{btns}</div>
    """)


def render_table(table: dict) -> str:
    if not table:
        return ""
    columns = table.get("columns", [])
    if not columns:
        return ""
    sample_rows = []
    for _ in range(3):
        tds = "".join(f"<td>Sample {col}</td>" for col in columns)
        sample_rows.append(f"<tr>{tds}</tr>")
    return dedent(f"""
        <div class=\"card mb-3\">
          <div class=\"card-header\">
            <h5 class=\"card-title mb-0\">{table.get('title', 'Data')}</h5>
            <div class=\"text-muted small\">{table.get('description', 'Replace with live data')}</div>
          </div>
          <div class=\"table-responsive\">
            <table class=\"table table-striped align-middle\">
              <thead>
                <tr>{''.join(f'<th>{col}</th>' for col in columns)}</tr>
              </thead>
              <tbody>
{''.join(sample_rows)}
              </tbody>
            </table>
          </div>
        </div>
    """)


def render_tabs(tabs: list[dict]) -> str:
    if not tabs:
        return ""
    nav = []
    content = []
    for idx, tab in enumerate(tabs):
        active = "active" if idx == 0 else ""
        show = "show active" if idx == 0 else ""
        selected = "true" if idx == 0 else "false"
        tab_id = f"tab-{tab['name'].lower().replace(' ', '-') }"
        nav.append(dedent(f"""
          <li class=\"nav-item\">
            <button class=\"nav-link {active}\" data-bs-toggle=\"tab\" data-bs-target=\"#{tab_id}\" type=\"button\" role=\"tab\" aria-selected=\"{selected}\">{tab['name']}</button>
          </li>
        """))
        table_html = render_table(tab.get('table', {})) if tab.get('table') else ''
        content.append(dedent(f"""
          <div class=\"tab-pane fade {show}\" id=\"{tab_id}\" role=\"tabpanel\">
            <p class=\"text-muted\">{tab.get('description', 'Tab content goes here.')}</p>
            {table_html}
          </div>
        """))
    return dedent(f"""
        <div class=\"card mb-3\">
          <div class=\"card-header border-bottom-0 pb-0\">
            <ul class=\"nav nav-tabs card-header-tabs\" role=\"tablist\">
{''.join(nav)}
            </ul>
          </div>
          <div class=\"card-body\">
            <div class=\"tab-content\">
{''.join(content)}
            </div>
          </div>
        </div>
    """)


def render_sidecards(sidecards: list[dict]) -> str:
    blocks = []
    for card in sidecards:
        items = "".join(f"<li>{item}</li>" for item in card.get("items", []))
        extra = card.get("extra", "")
        blocks.append(dedent(f"""
            <div class=\"card mb-3\">
              <div class=\"card-header\">
                <h5 class=\"card-title mb-0\">{card['title']}</h5>
              </div>
              <div class=\"card-body\">
                <p class=\"text-muted small\">{card.get('description', '')}</p>
                <ul class=\"small ps-3 mb-0\">{items}</ul>
                {extra}
              </div>
            </div>
        """))
    return "".join(blocks)


def render_charts(charts: list[dict]) -> str:
    cards = []
    for chart in charts:
        cards.append(dedent(f"""
            <div class=\"card mb-3\">
              <div class=\"card-header\">
                <h5 class=\"card-title mb-0\">{chart['title']}</h5>
                <div class=\"text-muted small\">{chart.get('description', 'Hook chart library later')}</div>
              </div>
              <div class=\"card-body\">
                <div class=\"chart-placeholder\" style=\"height: 220px; background: rgba(0,0,0,.04); border-radius: .5rem;\"></div>
              </div>
            </div>
        """))
    return "".join(cards)


def render_modals(modals: list[dict]) -> str:
    blocks = []
    for modal in modals:
        blocks.append(dedent(f"""
            <div class=\"modal fade\" tabindex=\"-1\" id=\"modal-{modal['id']}\" aria-hidden=\"true\">
              <div class=\"modal-dialog modal-lg modal-dialog-centered\">
                <div class=\"modal-content\">
                  <div class=\"modal-header\">
                    <h5 class=\"modal-title\">{modal['title']}</h5>
                    <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"modal\" aria-label=\"Close\"></button>
                  </div>
                  <div class=\"modal-body\">
                    <p class=\"text-muted\">{modal.get('description', 'Describe the form fields here.')}</p>
                  </div>
                  <div class=\"modal-footer\">
                    <button type=\"button\" class=\"btn btn-outline-secondary\" data-bs-dismiss=\"modal\">Cancel</button>
                    <button type=\"button\" class=\"btn btn-primary\">Save</button>
                  </div>
                </div>
              </div>
            </div>
        """))
    return "".join(blocks)


def render_page(spec: dict) -> str:
    header = dedent(f"""
        <div class=\"row mb-2 mb-xl-3\">
          <div class=\"col-auto d-none d-sm-block\">
            <h3 class=\"mb-0\"><strong>{spec['section']}</strong> / {spec['title']}</h3>
            <div class=\"text-muted\">{spec['goal']}</div>
          </div>
        </div>
    """)

    cards = render_cards(spec.get('kpis', []))
    filters = render_filters(spec.get('filters', []))
    actions = render_buttons(spec.get('actions', []))
    tabs = render_tabs(spec.get('tabs', []))
    table = render_table(spec.get('table', {})) if not tabs else ''
    charts = render_charts(spec.get('charts', []))
    sidecards = render_sidecards(spec.get('sidecards', []))
    modals = render_modals(spec.get('modals', []))

    main = "".join([
        cards,
        filters,
        actions,
        tabs or table,
        spec.get('extra', ''),
        charts,
    ])

    if spec.get('layout', 'split') == 'full':
        body = dedent(f"""
            <div class=\"container-fluid p-0\">
              {header}
              {main}
              {modals}
            </div>
        """)
    else:
        body = dedent(f"""
            <div class=\"container-fluid p-0\">
              {header}
              <div class=\"row\">
                <div class=\"col-xxl-9\">{main}</div>
                <div class=\"col-xxl-3\">{sidecards}</div>
              </div>
              {modals}
            </div>
        """)
    return "\n".join(line.rstrip() for line in body.splitlines()) + "\n"


SPEC: list[dict] = []


def add_spec(**kwargs):
    SPEC.append(kwargs)


def add_accommodation_specs():
    add_spec(
        file="accommodation-allocation.html",
        section="Accommodation",
        title="Allocation",
        goal="Allocate rooms to bookings quickly and avoid conflicts.",
        filters=["Date range", "Building", "Floor", "Booking type", "Status"],
        actions=["Auto-Allocate", "Manual Allocate", "Export Allocation"],
        kpis=[
            {"label": "Total rooms", "value": "620", "context": "Across towers"},
            {"label": "Rooms free today", "value": "88", "context": "Ready"},
            {"label": "Over-capacity alerts", "value": "3", "context": "Investigate", "badge": "bg-danger"},
            {"label": "Conflicts", "value": "5", "context": "Needs action", "badge": "bg-warning"},
        ],
        table={
            "title": "Bookings queue",
            "description": "Allocate bookings to rooms using the drawer or quick actions.",
            "columns": [
                "SH No.", "Group / Tour", "Pax (M/F/C)", "Arrive / Depart", "Priority", "Allocation status", "Actions"
            ],
        },
        sidecards=[
            {"title": "Room availability grid", "description": "Legend", "items": [
                "Green = Vacant", "Blue = Partial", "Orange = Hold", "Red = Maintenance"
            ]},
            {"title": "Quick links", "items": ["View conflicts", "Blocked rooms", "VIP arrivals"]},
        ],
        modals=[
            {"id": "allocate", "title": "Allocate booking", "description": "Suggested rooms, manual picker, split group options."},
            {"id": "conflict", "title": "Conflict details", "description": "List of conflicts when allocation fails."},
        ],
        extra=dedent("""
            <div class="card mb-3">
              <div class="card-header">
                <h5 class="card-title mb-0">Room occupancy summary</h5>
                <div class="text-muted small">Hover legend to highlight floors.</div>
              </div>
              <div class="card-body">
                <div class="d-flex flex-wrap gap-4">
                  <div>
                    <div class="text-muted small">BAHA Tower</div>
                    <h4>92% occupied</h4>
                  </div>
                  <div>
                    <div class="text-muted small">HUSN Tower</div>
                    <h4>88% occupied</h4>
                  </div>
                  <div>
                    <div class="text-muted small">MOHAMMEDI</div>
                    <h4>74% occupied</h4>
                  </div>
                </div>
              </div>
            </div>
        """),
    )

    add_spec(
        file="accommodation-checkins-checkouts.html",
        section="Accommodation",
        title="Check-ins & Check-outs",
        goal="Operational dashboard for arrivals and departures.",
        filters=["Date", "Building", "Status"],
        actions=["Bulk Check-in", "Bulk Check-out"],
        kpis=[
            {"label": "Expected arrivals", "value": "145", "context": "Today"},
            {"label": "Checked-in", "value": "86", "context": "+12 since 08:00"},
            {"label": "Expected departures", "value": "132", "context": "Today"},
            {"label": "Pending check-outs", "value": "18", "context": "Need follow-up", "badge": "bg-danger"},
        ],
        tabs=[
            {
                "name": "Check-ins",
                "description": "Guests expected to arrive. Highlight unpaid or high-risk reservations.",
                "table": {
                    "title": "Incoming guests",
                    "description": "Use quick actions to check-in or edit room.",
                    "columns": ["Time window", "SH No.", "Guest / Group", "Pax", "Planned room", "Status", "Actions"],
                },
            },
            {
                "name": "Check-outs",
                "description": "Guests leaving today. Track keys, dues, housekeeping.",
                "table": {
                    "title": "Departures",
                    "columns": ["Out time", "Room", "Outstanding dues", "HK status", "Notes", "Actions"],
                },
            },
        ],
        sidecards=[
            {"title": "Warnings", "items": ["Over-capacity alert in HUSN", "3 check-outs flagged unpaid"]},
            {"title": "Shortcuts", "items": ["Print wristbands", "Download arrivals list", "Notify transport"]},
        ],
        modals=[
            {"id": "checkin", "title": "Check-in guest", "description": "Confirm identity, collect key, assign ID band."},
            {"id": "checkout", "title": "Check-out summary", "description": "Show stay summary, payments, and remarks."},
        ],
    )

    add_spec(
        file="accommodation-grid-layout.html",
        section="Accommodation",
        title="Grid Layout",
        goal="Visual building layout showing occupancy and room states.",
        filters=["Building", "View", "Legend"],
        kpis=[
            {"label": "Rooms occupied", "value": "482", "context": "78% occupancy"},
            {"label": "Rooms free", "value": "134", "context": "Ready", "badge": "bg-success"},
            {"label": "Blocked", "value": "12", "context": "Maintenance", "badge": "bg-warning"},
            {"label": "Pending clean", "value": "21", "context": "Housekeeping", "badge": "bg-danger"},
        ],
        extra=dedent("""
            <div class="card mb-3">
              <div class="card-header">
                <h5 class="card-title mb-0">Floor grid</h5>
                <div class="text-muted small">Click a room to open drawer with details.</div>
              </div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-4">
                    <div class="border rounded p-3">
                      <div class="d-flex justify-content-between">
                        <strong>Room 1405</strong>
                        <span class="badge bg-success">Occupied</span>
                      </div>
                      <div class="text-muted small">Capacity 4 · Current 3</div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="border rounded p-3">
                      <div class="d-flex justify-content-between">
                        <strong>Room 1502</strong>
                        <span class="badge bg-warning">Maintenance</span>
                      </div>
                      <div class="text-muted small">HVAC issue · ETA 18:00</div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="border rounded p-3">
                      <div class="d-flex justify-content-between">
                        <strong>Room 1207</strong>
                        <span class="badge bg-info">Reserved</span>
                      </div>
                      <div class="text-muted small">Arriving 21:00</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        """),
        sidecards=[
            {"title": "Legend", "items": ["Green = Occupied", "Gray = Vacant", "Blue = Reserved", "Orange = Blocked"]},
            {"title": "Actions", "items": ["Move guest", "Mark maintenance", "Mark cleaned"]},
        ],
        modals=[
            {"id": "move-guest", "title": "Move guest", "description": "Select target room and reason."},
            {"id": "block-room", "title": "Block / Unblock room", "description": "Capture reason and duration."},
        ],
    )

    add_spec(
        file="accommodation-housekeeping.html",
        section="Accommodation",
        title="Housekeeping",
        goal="Manage cleaning schedules, assignments and overdue rooms.",
        filters=["Date", "Building", "Floor", "Status", "Housekeeper"],
        actions=["Assign rooms", "Mark cleaned"],
        kpis=[
            {"label": "Rooms dirty", "value": "47", "context": "Need cleaning", "badge": "bg-danger"},
            {"label": "In progress", "value": "18", "context": "Being cleaned"},
            {"label": "Clean & inspected", "value": "365", "context": "Ready"},
            {"label": "Issues reported", "value": "6", "context": "Needs maintenance", "badge": "bg-warning"},
        ],
        table={
            "title": "Housekeeping queue",
            "columns": ["Room", "Guest / Group", "Checkout", "Status", "Assigned staff", "Priority", "Notes", "Actions"],
        },
        sidecards=[
            {"title": "Staff workload", "description": "Rooms per staff", "items": [
                "Aisha · 8 rooms · ETA 14:00",
                "Fatema · 6 rooms · ETA 13:30",
                "Yusuf · 5 rooms · ETA 12:45",
            ]},
            {"title": "Alerts", "items": ["3 rooms overdue > 2h", "Report issue: BAHA 1608"]},
        ],
        modals=[
            {"id": "assign-rooms", "title": "Assign rooms", "description": "Multi-select rooms and choose staff."},
            {"id": "update-status", "title": "Update status", "description": "Change to Dirty / In progress / Clean."},
            {"id": "report-issue", "title": "Report issue", "description": "Capture damage or missing items."},
        ],
    )

    add_spec(
        file="accommodation-maintenance.html",
        section="Accommodation",
        title="Maintenance",
        goal="Track room and building maintenance requests and scheduled work.",
        filters=["Building", "Severity", "Status", "Category"],
        actions=["New ticket", "Schedule visit"],
        kpis=[
            {"label": "Open tickets", "value": "42", "context": "All severities"},
            {"label": "Critical", "value": "7", "context": "Immediate", "badge": "bg-danger"},
            {"label": "Avg resolution time", "value": "18h", "context": "Last 7 days"},
            {"label": "Scheduled today", "value": "15", "context": "Tech visits"},
        ],
        table={
            "title": "Maintenance tickets",
            "columns": ["Ticket ID", "Room / Area", "Issue", "Category", "Priority", "Assigned", "Status", "Opened", "Actions"],
        },
        charts=[
            {"title": "Issues by category", "description": "Bar chart - plumbing, electrical, HVAC..."},
            {"title": "Open vs closed", "description": "Trend over days"},
        ],
        sidecards=[
            {"title": "Calendar", "description": "Upcoming scheduled tasks", "items": [
                "09:00 · HVAC inspection · MOHAMMEDI",
                "11:30 · Plumbing · BAHA 1805",
                "14:45 · Electrical · HUSN lobby",
            ]},
            {"title": "Shortcuts", "items": ["New maintenance request", "Download work orders"]},
        ],
        modals=[
            {"id": "new-maintenance", "title": "New maintenance request", "description": "Room selection, issue summary, photos."},
            {"id": "update-ticket", "title": "Update ticket", "description": "Change status, add notes, upload proof."},
        ],
    )

    add_spec(
        file="accommodation-vacancy-forecast.html",
        section="Accommodation",
        title="Vacancy Forecast",
        goal="Forecast room availability and occupancy risk.",
        layout="full",
        filters=["Date range", "Building", "View"],
        actions=["Export forecast", "Run what-if"],
        kpis=[
            {"label": "Forecasted occupancy", "value": "82%", "context": "Next 14 days"},
            {"label": "Expected arrivals", "value": "860", "context": "Period"},
            {"label": "Expected departures", "value": "780", "context": "Period"},
            {"label": "Overbooking risk days", "value": "3", "context": ">95%", "badge": "bg-danger"},
        ],
        charts=[
            {"title": "Occupancy trend", "description": "Line / area chart of occupancy."},
        ],
        table={
            "title": "Forecast table",
            "columns": ["Date", "Rooms available", "Rooms reserved", "Arrivals", "Departures", "Risk"],
        },
        sidecards=[
            {"title": "What-if scenario", "items": ["+40 rooms closed for maintenance", "+2 large group bookings"]},
            {"title": "Warnings", "items": ["Nov 28 - >98% occupancy", "Dec 02 - Under capacity"]},
        ],
    )


def add_accounts_specs():
    add_spec(
        file="accounts-cash-submission.html",
        section="Accounts",
        title="Cash Submission",
        goal="Capture daily cash submissions and variances.",
        filters=["Date", "Department", "Collector", "Shift"],
        actions=["New submission", "Approve all"],
        kpis=[
            {"label": "Submitted today", "value": "SAR 185,000", "context": "+12% vs yesterday"},
            {"label": "Variance detected", "value": "SAR 2,450", "context": "Needs approval", "badge": "bg-danger"},
            {"label": "Pending submissions", "value": "6", "context": "Awaiting"},
            {"label": "Approved", "value": "28", "context": "Today"},
        ],
        table={
            "title": "Department submissions",
            "columns": ["Department", "Expected", "Submitted", "Variance", "Collector", "Submitted at", "Status", "Actions"],
        },
        sidecards=[
            {"title": "Guidelines", "items": ["Double count cash before submitting", "Variance > SAR 500 needs approval"]},
            {"title": "Latest notes", "items": ["Night shift deposit delayed", "Maintenance submitted via bank"]},
        ],
        modals=[
            {"id": "new-cash", "title": "New submission", "description": "Department, amount, payment type breakdown."},
            {"id": "approve-cash", "title": "Approve submission", "description": "Review attachments & leave comments."},
        ],
    )

    expense_variants = [
        ("accounts-expenses-maintenance.html", "Expenses / Maintenance", "Track building & equipment upkeep costs.", ["Building / Room"]),
        ("accounts-expenses-mawaid.html", "Expenses / Mawaid", "Monitor kitchen and dining hall expenses.", ["Meal type / Event"]),
        ("accounts-expenses-transport.html", "Expenses / Transport", "Review transport related claims.", ["Vehicle / Trip ID"]),
        ("accounts-expenses-other.html", "Expenses / Other", "Miscellaneous spend requests.", ["Cost center / Justification"]),
    ]

    for file_name, title, goal, extra_filters in expense_variants:
        add_spec(
            file=file_name,
            section="Accounts",
            title=title,
            goal=goal,
            filters=["Date range", "Vendor", "Approval status"] + extra_filters,
            actions=["Add expense", "Approve selected", "Export"],
            kpis=[
                {"label": "Total spend", "value": "SAR 420k", "context": "This month"},
                {"label": "Avg ticket", "value": "SAR 3,200", "context": "Per expense"},
                {"label": "Pending approvals", "value": "18", "context": "Need finance", "badge": "bg-warning"},
                {"label": "Top vendor", "value": "Al Baraka", "context": "SAR 65k"},
            ],
            tabs=[
                {
                    "name": "List",
                    "description": "All expenses with status and attachments.",
                    "table": {
                        "title": "Expense list",
                        "columns": ["Expense ID", "Date", "Department", "Category", "Vendor", "Amount", "Mode", "Status", "Actions"],
                    },
                },
                {
                    "name": "Analytics",
                    "description": "Visual breakdown and top vendors.",
                },
            ],
            sidecards=[
                {"title": "Reminders", "items": ["Attach invoices for > SAR 5k", "Use split expense for shared costs"]},
                {"title": "Shortcuts", "items": ["Upload CSV", "Download approvals report"]},
            ],
            modals=[
                {"id": f"add-expense-{title.split('/')[-1].strip().lower()}", "title": "Add expense", "description": "Category, vendor, amount, attachments."},
                {"id": f"approve-expense-{title.split('/')[-1].strip().lower()}", "title": "Approve / Reject", "description": "Leave audit comment."},
            ],
        )

    add_spec(
        file="accounts-lawazim-collection.html",
        section="Accounts",
        title="Lawazim Collection",
        goal="Track lawazim items issued and payments.",
        filters=["Date range", "Item", "Booking / Group", "Payment status"],
        actions=["Issue lawazim", "Mark paid", "Export"],
        kpis=[
            {"label": "Items issued", "value": "128", "context": "Today"},
            {"label": "Revenue", "value": "SAR 46k", "context": "Today"},
            {"label": "Pending payments", "value": "18", "context": "Follow-up", "badge": "bg-warning"},
            {"label": "Returns", "value": "2", "context": "Await QC"},
        ],
        table={
            "title": "Lawazim ledger",
            "columns": ["Lawazim ID", "SH No. / Guest", "Item", "Qty", "Rate", "Total", "Paid status", "Payment method", "Actions"],
        },
        charts=[
            {"title": "Lawazim revenue", "description": "Bar chart over time"},
            {"title": "Items by type", "description": "Pie chart distribution"},
        ],
        sidecards=[
            {"title": "Shortcuts", "items": ["Issue from template", "Return / exchange item", "Print receipt"]},
        ],
        modals=[
            {"id": "issue-lawazim", "title": "Issue lawazim", "description": "Search guest, select items, quantities."},
            {"id": "mark-paid-lawazim", "title": "Mark as paid", "description": "Receipt number and payment method."},
        ],
    )

    add_spec(
        file="accounts-niyaz-collection.html",
        section="Accounts",
        title="Niyaz Collection",
        goal="Manage niyaz contributions and allocations.",
        filters=["Date", "Source", "Mode"],
        actions=["Record niyaz", "Allocate niyaz"],
        kpis=[
            {"label": "Total niyaz today", "value": "SAR 82k", "context": "Goal SAR 100k"},
            {"label": "Month-to-date", "value": "SAR 1.2M", "context": "+8%"},
            {"label": "Avg per guest", "value": "SAR 250", "context": "Today"},
            {"label": "Unallocated", "value": "SAR 45k", "context": "Assign to events", "badge": "bg-warning"},
        ],
        table={
            "title": "Niyaz receipts",
            "columns": ["Receipt ID", "Date", "Payer", "Amount", "Mode", "Reference", "Allocated", "Actions"],
        },
        sidecards=[
            {"title": "Warnings", "items": ["Duplicate reference detected", "Pending sponsor confirmation"]},
        ],
        modals=[
            {"id": "record-niyaz", "title": "Record niyaz", "description": "Capture payer info, amount, mode."},
            {"id": "allocate-niyaz", "title": "Allocate niyaz", "description": "Link to cost centers or events."},
        ],
    )

    add_spec(
        file="accounts-salaries.html",
        section="Accounts",
        title="Salaries",
        goal="Handle payroll generation and disbursement status.",
        filters=["Month", "Department", "Status"],
        actions=["Generate payroll", "Mark as paid", "Export PDF"],
        kpis=[
            {"label": "Total payroll", "value": "SAR 2.4M", "context": "This month"},
            {"label": "Paid %", "value": "68%", "context": "Updated daily"},
            {"label": "Pending amount", "value": "SAR 780k", "context": "Awaiting approval"},
            {"label": "Adjustments", "value": "34", "context": "This cycle"},
        ],
        table={
            "title": "Payroll list",
            "columns": ["Employee", "Role", "Department", "Basic", "Allowances", "Deductions", "Net", "Status", "Payment date", "Actions"],
        },
        charts=[
            {"title": "Department wise cost", "description": "Bar chart for payroll distribution."},
        ],
        sidecards=[
            {"title": "Reminders", "items": ["Verify IBAN before marking paid", "Upload signed approvals"]},
        ],
        modals=[
            {"id": "generate-payroll", "title": "Generate payroll", "description": "Select month and departments."},
            {"id": "adjust-salary", "title": "Adjust salary", "description": "Add allowances/deductions with reason."},
        ],
    )


def add_hr_specs():
    add_spec(
        file="hr-leave-management.html",
        section="Human Resources",
        title="Leave Management",
        goal="Manage leave requests, balances and calendar view.",
        filters=["Date range", "Department", "Leave type", "Status"],
        actions=["New request", "Approve selected"],
        kpis=[
            {"label": "Leaves in range", "value": "62", "context": "This month"},
            {"label": "Today's absences", "value": "11", "context": "Critical roles 2"},
            {"label": "Pending approvals", "value": "9", "context": "Need manager"},
            {"label": "Overrides", "value": "1", "context": "Policy exceptions"},
        ],
        tabs=[
            {
                "name": "Requests",
                "description": "Queue of leave requests awaiting action.",
                "table": {
                    "title": "Leave requests",
                    "columns": ["Request ID", "Employee", "Dept", "Leave type", "From - To", "Days", "Status", "Approver", "Actions"],
                },
            },
            {
                "name": "Calendar",
                "description": "Monthly calendar view showing who is off.",
            },
        ],
        sidecards=[
            {"title": "Warnings", "items": ["Transport supervisors below minimum headcount", "Multiple chefs off on Friday"]},
        ],
        modals=[
            {"id": "new-leave", "title": "New leave request", "description": "Employee, dates, reason."},
            {"id": "approve-leave", "title": "Approve / Reject", "description": "Add comment and notify employee."},
        ],
    )

    add_spec(
        file="hr-scheduling.html",
        section="Human Resources",
        title="Scheduling",
        goal="Plan shifts and detect conflicts.",
        filters=["Week", "Department", "Role"],
        actions=["Generate schedule", "Publish schedule"],
        kpis=[
            {"label": "Shifts published", "value": "182", "context": "Current week"},
            {"label": "Conflicts", "value": "4", "context": "Resolve before publish", "badge": "bg-danger"},
            {"label": "Overtime risk", "value": "6", "context": "Watch list"},
            {"label": "Open requests", "value": "12", "context": "Swap / leave"},
        ],
        extra=dedent("""
            <div class="card mb-3">
              <div class="card-header">
                <h5 class="card-title mb-0">Shift grid</h5>
                <div class="text-muted small">Rows = employees, columns = days with shift codes.</div>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-bordered text-center">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Mon</th>
                        <th>Tue</th>
                        <th>Wed</th>
                        <th>Thu</th>
                        <th>Fri</th>
                        <th>Sat</th>
                        <th>Sun</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Alias Hussain</td>
                        <td>M</td>
                        <td>M</td>
                        <td>E</td>
                        <td>E</td>
                        <td>N</td>
                        <td>Off</td>
                        <td>Off</td>
                      </tr>
                      <tr>
                        <td>Mariam Rangwala</td>
                        <td>Off</td>
                        <td>M</td>
                        <td>M</td>
                        <td>E</td>
                        <td>E</td>
                        <td>N</td>
                        <td>Off</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
        """),
        sidecards=[
            {"title": "Day summary", "items": ["Mon: Required 58 / Assigned 56", "Tue: Required 60 / Assigned 61"]},
        ],
        modals=[
            {"id": "edit-shift", "title": "Edit shift", "description": "Change shift type, add notes."},
            {"id": "publish-schedule", "title": "Publish schedule", "description": "Notify staff via SMS/email."},
        ],
    )

    add_spec(
        file="hr-staff-directory.html",
        section="Human Resources",
        title="Staff Directory",
        goal="Master list of staff with quick actions.",
        filters=["Search name/ITS", "Department", "Role", "Status"],
        actions=["Add staff", "Export"],
        kpis=[
            {"label": "Total staff", "value": "486", "context": "All types"},
            {"label": "Active", "value": "432", "context": "On duty"},
            {"label": "On leave", "value": "28", "context": "Today"},
            {"label": "Contractors", "value": "42", "context": "Active"},
        ],
        table={
            "title": "Staff list",
            "columns": ["Avatar", "Name", "ITS#", "Role", "Department", "Phone", "Email", "Status", "Actions"],
        },
        sidecards=[
            {"title": "Tips", "items": ["Click avatar to open profile drawer", "Use filters to find by role"]},
        ],
        modals=[
            {"id": "add-staff", "title": "Add staff", "description": "Personal, employment, documents."},
            {"id": "deactivate-staff", "title": "Deactivate staff", "description": "Capture reason and effective date."},
        ],
    )

    add_spec(
        file="hr-training.html",
        section="Human Resources",
        title="Training",
        goal="Track training programs and attendance.",
        filters=["Training type", "Date range", "Status"],
        actions=["Create session", "Mark attendance"],
        kpis=[
            {"label": "Sessions planned", "value": "18", "context": "This quarter"},
            {"label": "Completion %", "value": "64%", "context": "Average"},
            {"label": "Avg attendance", "value": "22", "context": "Per session"},
            {"label": "Resources uploaded", "value": "45", "context": "Materials"},
        ],
        table={
            "title": "Training sessions",
            "columns": ["Session", "Date", "Trainer", "Target dept", "Seats", "Enrolled", "Completed", "Actions"],
        },
        charts=[
            {"title": "Attendance rate", "description": "Bar chart per session."},
            {"title": "Skills coverage", "description": "Radar chart placeholder."},
        ],
        sidecards=[
            {"title": "Shortcuts", "items": ["View attendees", "Upload resources", "Download certificates"]},
        ],
        modals=[
            {"id": "create-training", "title": "Create session", "description": "Session details, trainer, targets."},
            {"id": "mark-attendance", "title": "Mark attendance", "description": "Check participants and scores."},
        ],
    )


def add_mawaid_specs():
    add_spec(
        file="mawaid-dining-hall.html",
        section="Mawaid",
        title="Dining Hall",
        goal="Manage dining hall capacity and session status.",
        filters=["Date", "Meal type", "Location"],
        actions=["Assign hall & time", "Move group"],
        kpis=[
            {"label": "Expected pax", "value": "1,820", "context": "Lunch"},
            {"label": "Seated", "value": "1,240", "context": "Live"},
            {"label": "Remaining capacity", "value": "580", "context": "Across halls"},
            {"label": "Waiting groups", "value": "6", "context": "Queue", "badge": "bg-warning"},
        ],
        table={
            "title": "Session table",
            "columns": ["Group / SH No.", "Pax", "Hall", "Slot", "Status", "Notes", "Actions"],
        },
        charts=[
            {"title": "Expected vs actual seated", "description": "Live bar indicator."},
        ],
        sidecards=[
            {"title": "Sessions timeline", "description": "Upcoming slots", "items": [
                "12:15 · Hall A · Capacity 400",
                "12:45 · Hall B · Capacity 350",
                "13:10 · Hall C · Capacity 280",
            ]},
        ],
        modals=[
            {"id": "assign-hall", "title": "Assign hall & time", "description": "Select hall, slot, and status."},
            {"id": "mark-seated", "title": "Mark seated", "description": "Confirm arrival and start time."},
        ],
    )

    add_spec(
        file="mawaid-inventory.html",
        section="Mawaid",
        title="Inventory",
        goal="Track raw material stock levels.",
        filters=["Category", "Store", "Stock status"],
        actions=["Adjust stock", "New item", "Set reorder rule"],
        kpis=[
            {"label": "Total items", "value": "342", "context": "Tracked"},
            {"label": "Low stock", "value": "28", "context": "Below reorder", "badge": "bg-danger"},
            {"label": "Out of stock", "value": "6", "context": "Urgent"},
            {"label": "Stock value", "value": "SAR 1.8M", "context": "Est."},
        ],
        table={
            "title": "Inventory list",
            "columns": ["Item", "Category", "Unit", "Current stock", "Reorder level", "Supplier", "Last GRN", "Actions"],
        },
        charts=[
            {"title": "Stock value by category", "description": "Bar chart"},
        ],
        sidecards=[
            {"title": "Guidelines", "items": ["Update consumption daily", "Sync with supply chain POs"]},
        ],
        modals=[
            {"id": "adjust-stock", "title": "Adjust stock", "description": "Increment/decrement with reason."},
            {"id": "new-item", "title": "New item", "description": "Define category, unit, supplier."},
        ],
    )

    add_spec(
        file="mawaid-kitchen-operations.html",
        section="Mawaid",
        title="Kitchen Operations",
        goal="Kitchen production planning and execution.",
        filters=["Date", "Meal type", "Kitchen location"],
        actions=["Generate prep plan", "Update status", "Report shortage"],
        kpis=[
            {"label": "Total thals", "value": "640", "context": "Breakfast"},
            {"label": "Total plates", "value": "4,500", "context": "All meals"},
            {"label": "Veg / Non-veg split", "value": "60% / 40%", "context": "Current"},
            {"label": "Issues logged", "value": "5", "context": "Live issues"},
        ],
        table={
            "title": "Prep plan",
            "columns": ["Dish", "Planned qty", "Unit", "Status", "Responsible", "Notes", "Actions"],
        },
        sidecards=[
            {"title": "Live issues", "items": ["Short on cumin seeds", "Kneading machine maintenance at 14:00"]},
        ],
        modals=[
            {"id": "generate-prep", "title": "Generate prep plan", "description": "Use menu & headcount."},
            {"id": "report-shortage", "title": "Report shortage", "description": "Escalate to inventory team."},
        ],
    )

    add_spec(
        file="mawaid-make-recipies.html",
        section="Mawaid",
        title="Make Recipes",
        goal="Manage master recipes and ingredients.",
        filters=["Search dish", "Category", "Tags"],
        actions=["New recipe", "Scale recipe"],
        kpis=[
            {"label": "Total recipes", "value": "182", "context": "Active"},
            {"label": "Under testing", "value": "12", "context": "Draft"},
            {"label": "Recently updated", "value": "8", "context": "Last 7 days"},
            {"label": "Ingredients per recipe", "value": "14 avg", "context": "Reference"},
        ],
        table={
            "title": "Recipe list",
            "columns": ["Dish", "Category", "Yield (servings)", "Status", "Last updated", "Actions"],
        },
        sidecards=[
            {"title": "Actions", "items": ["Create / Edit recipe", "Duplicate recipe", "Export ingredients list"]},
        ],
        modals=[
            {"id": "edit-recipe", "title": "Recipe editor", "description": "Dish details, method, ingredients table."},
            {"id": "scale-recipe", "title": "Scale recipe", "description": "Enter desired servings to recalc ingredients."},
        ],
    )

    add_spec(
        file="mawaid-menu-planning.html",
        section="Mawaid",
        title="Menu Planning",
        goal="Plan menus per day and meal.",
        filters=["Date range", "Location"],
        actions=["Edit menu", "Publish menu"],
        kpis=[
            {"label": "Days planned", "value": "14", "context": "Current view"},
            {"label": "Special events", "value": "3", "context": "Upcoming"},
            {"label": "Signature dishes", "value": "5", "context": "This week"},
            {"label": "Cuisine mix", "value": "Indian 40% / Continental 30% / Others 30%", "context": "Diversity"},
        ],
        extra=dedent("""
            <div class="card mb-3">
              <div class="card-header">
                <h5 class="card-title mb-0">Menu calendar</h5>
                <div class="text-muted small">Rows = dates, columns = meals (Breakfast / Lunch / Dinner).</div>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-bordered">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Breakfast</th>
                        <th>Lunch</th>
                        <th>Dinner</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Nov 26</td>
                        <td>Paratha · Omelette</td>
                        <td>Grilled chicken · Rice</td>
                        <td>Dal · Paneer tikka</td>
                      </tr>
                      <tr>
                        <td>Nov 27</td>
                        <td>Upma · Fruits</td>
                        <td>Mutton curry · Naan</td>
                        <td>Fish masala · Rice</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
        """),
        charts=[
            {"title": "Cuisine mix", "description": "Pie chart by cuisine"},
            {"title": "Dish frequency", "description": "Heatmap placeholder"},
        ],
        sidecards=[
            {"title": "Upcoming notes", "items": ["Friday – fasting menu", "Saturday – VIP dinner"]},
        ],
    )

    add_spec(
        file="mawaid-reports.html",
        section="Mawaid",
        title="Reports",
        goal="Analytical reports for production, cost, and waste.",
        filters=["Date range", "Building", "Meal type", "Vendor"],
        actions=["Export CSV", "Download PDF"],
        kpis=[
            {"label": "Food cost %", "value": "38%", "context": "Target 35%"},
            {"label": "Waste quantity", "value": "210 thals", "context": "Last week"},
            {"label": "Top dish", "value": "Chicken makhani", "context": "By frequency"},
            {"label": "Vendor OTIF", "value": "96%", "context": "On-time deliveries"},
        ],
        charts=[
            {"title": "Consumption vs headcount", "description": "Line chart"},
            {"title": "Food cost %", "description": "Bar chart by day"},
            {"title": "Top dishes", "description": "Horizontal bar chart"},
            {"title": "Waste trend", "description": "Area chart"},
        ],
        layout="full",
    )

    add_spec(
        file="mawaid-supply-chain.html",
        section="Mawaid",
        title="Supply Chain",
        goal="Purchase orders and deliveries tracking.",
        filters=["Date", "Supplier", "Status"],
        actions=["Create PO", "Receive items"],
        kpis=[
            {"label": "Open POs", "value": "24", "context": "Active"},
            {"label": "Late deliveries", "value": "3", "context": "Follow up", "badge": "bg-warning"},
            {"label": "Total PO value", "value": "SAR 980k", "context": "Month-to-date"},
            {"label": "Partially received", "value": "5", "context": "Awaiting balance"},
        ],
        table={
            "title": "PO list",
            "columns": ["PO No.", "Date", "Supplier", "Items count", "Value", "Status", "Expected delivery", "Actions"],
        },
        charts=[
            {"title": "Ordered vs received", "description": "Bar chart per supplier"},
        ],
        sidecards=[
            {"title": "Next deliveries", "items": ["Nov 27 · Fresh Farms · Vegetables", "Nov 28 · Spice Hub · Dry goods"]},
        ],
        modals=[
            {"id": "create-po", "title": "Create PO", "description": "Supplier, item lines, delivery date."},
            {"id": "receive-items", "title": "Receive items", "description": "Capture delivered qty, short/excess."},
        ],
    )

    add_spec(
        file="mawaid-thal-counts.html",
        section="Mawaid",
        title="Thal Counts",
        goal="Manage thal and meal counts.",
        filters=["Date", "Meal type", "Group / Building"],
        actions=["Adjust thals", "Lock counts"],
        kpis=[
            {"label": "Total thals", "value": "642", "context": "Today"},
            {"label": "Extra thals", "value": "48", "context": "Included"},
            {"label": "Cancelled thals", "value": "14", "context": "Last update", "badge": "bg-warning"},
            {"label": "Locked", "value": "Yes", "context": "After freeze?"},
        ],
        table={
            "title": "Thal summary",
            "columns": ["Group / SH No.", "Pax", "Thals requested", "Extra", "Net", "Notes", "Actions"],
        },
        charts=[
            {"title": "Thal trend", "description": "Line chart over day/week"},
        ],
        sidecards=[
            {"title": "Rules", "items": ["Freeze time 2h before meal", "Use adjust thal modal for changes"]},
        ],
        modals=[
            {"id": "adjust-thal", "title": "Adjust thals", "description": "Increase/decrease counts with reason."},
            {"id": "lock-thal", "title": "Lock counts", "description": "Prevents edits after freeze."},
        ],
    )

    add_spec(
        file="mawaid-vendors.html",
        section="Mawaid",
        title="Vendors",
        goal="Manage food vendors, SLAs and ratings.",
        filters=["Vendor type", "Status"],
        actions=["Add vendor", "Rate vendor"],
        kpis=[
            {"label": "Active vendors", "value": "32", "context": "Approved"},
            {"label": "Avg rating", "value": "4.3/5", "context": "Based on feedback"},
            {"label": "Lead time", "value": "2.3 days", "context": "Avg"},
            {"label": "Complaints", "value": "3", "context": "Last month"},
        ],
        table={
            "title": "Vendor list",
            "columns": ["Vendor", "Type", "Contact", "Rating", "Avg lead time", "Active", "Actions"],
        },
        sidecards=[
            {"title": "Vendor profile drawer", "items": ["Recent POs", "Complaints log", "Documents"]},
        ],
        modals=[
            {"id": "add-vendor", "title": "Add vendor", "description": "Vendor info, categories, documents."},
            {"id": "rate-vendor", "title": "Rate vendor", "description": "Stars & comments."},
        ],
    )


def add_reservations_specs():
    add_spec(
        file="reservations-approved.html",
        section="Reservations",
        title="Approved",
        goal="List of approved reservations ready for processing.",
        filters=["Date range", "Type", "Status"],
        actions=["Download confirmations", "Send message"],
        kpis=[
            {"label": "Approved today", "value": "32", "context": "New"},
            {"label": "Arriving within 48h", "value": "18", "context": "Prepare"},
            {"label": "Converted to check-in", "value": "24", "context": "Week to date"},
            {"label": "Pending docs", "value": "4", "context": "Follow-up", "badge": "bg-warning"},
        ],
        table={
            "title": "Approved reservations",
            "columns": ["Ref no", "Guest / Group", "Pax", "Dates", "Package", "Source", "Status", "Actions"],
        },
        sidecards=[
            {"title": "Actions", "items": ["Convert to check-in batch", "Download manifest"]},
        ],
        modals=[
            {"id": "view-reservation", "title": "View reservation", "description": "Tabs for pax, payments, notes."},
        ],
    )

    add_spec(
        file="reservations-create-individuals.html",
        section="Reservations",
        title="Create (Individual)",
        goal="Guided form to create individual reservations.",
        layout="full",
        actions=["Save draft", "Submit for approval"],
        extra=dedent("""
            <div class="row">
              <div class="col-xl-8">
                <div class="card mb-3">
                  <div class="card-header">
                    <h5 class="card-title mb-0">Step 1 · Guest information</h5>
                  </div>
                  <div class="card-body">
                    <div class="row g-3">
                      <div class="col-md-4">
                        <label class="form-label">ITS No.</label>
                        <input type="text" class="form-control" placeholder="ITS number">
                      </div>
                      <div class="col-md-8">
                        <label class="form-label">Full name</label>
                        <input type="text" class="form-control" placeholder="Name">
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">WhatsApp</label>
                        <input type="tel" class="form-control" placeholder="+9665...">
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-control" placeholder="optional">
                      </div>
                    </div>
                  </div>
                </div>
                <div class="card mb-3">
                  <div class="card-header">
                    <h5 class="card-title mb-0">Step 2 · Dates & package</h5>
                  </div>
                  <div class="card-body">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="form-label">Arrival date</label>
                        <input type="date" class="form-control">
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Departure date</label>
                        <input type="date" class="form-control">
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Package</label>
                        <select class="form-select">
                          <option>Makkah first</option>
                          <option>Madinah first</option>
                          <option>Custom</option>
                        </select>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Special requests</label>
                        <input type="text" class="form-control" placeholder="Notes">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-xl-4">
                <div class="card">
                  <div class="card-header">
                    <h5 class="card-title mb-0">Live summary</h5>
                  </div>
                  <div class="card-body">
                    <ul class="list-unstyled mb-0 small">
                      <li><strong>ITS:</strong> —</li>
                      <li><strong>Name:</strong> —</li>
                      <li><strong>WhatsApp:</strong> —</li>
                      <li><strong>Dates:</strong> —</li>
                      <li><strong>Pax:</strong> —</li>
                      <li><strong>Package:</strong> —</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
        """),
        modals=[
            {"id": "submit-individual", "title": "Submit reservation", "description": "Confirm details and send for approval."},
        ],
    )

    add_spec(
        file="reservations-create-tour-operator.html",
        section="Reservations",
        title="Create (Tour Operator)",
        goal="Bulk/group reservation entry with manifests.",
        layout="full",
        extra=dedent("""
            <div class="row">
              <div class="col-xl-8">
                <div class="card mb-3">
                  <div class="card-header">
                    <h5 class="card-title mb-0">Operator details</h5>
                  </div>
                  <div class="card-body">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="form-label">Operator name</label>
                        <input type="text" class="form-control" placeholder="Company name">
                      </div>
                      <div class="col-md-3">
                        <label class="form-label">License no.</label>
                        <input type="text" class="form-control" placeholder="MOT-123">
                      </div>
                      <div class="col-md-3">
                        <label class="form-label">Country</label>
                        <input type="text" class="form-control" placeholder="IN">
                      </div>
                    </div>
                  </div>
                </div>
                <div class="card mb-3">
                  <div class="card-header">
                    <h5 class="card-title mb-0">Pax breakdown</h5>
                  </div>
                  <div class="card-body">
                    <div class="row g-3">
                      <div class="col-md-4">
                        <label class="form-label">Adults</label>
                        <input type="number" class="form-control" value="0">
                      </div>
                      <div class="col-md-4">
                        <label class="form-label">Children</label>
                        <input type="number" class="form-control" value="0">
                      </div>
                      <div class="col-md-4">
                        <label class="form-label">Infants</label>
                        <input type="number" class="form-control" value="0">
                      </div>
                      <div class="col-12">
                        <label class="form-label">Upload pax list</label>
                        <input class="form-control" type="file">
                        <small class="text-muted">Supports CSV import with mapping modal.</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-xl-4">
                <div class="card mb-3">
                  <div class="card-header">
                    <h5 class="card-title mb-0">Submission checklist</h5>
                  </div>
                  <div class="card-body">
                    <ul class="list-unstyled small mb-0">
                      <li>✅ Valid operator license copy.</li>
                      <li>✅ Payment plan shared.</li>
                      <li>✅ Arrival manifest uploaded.</li>
                      <li>⬜ Passport scan batch.</li>
                    </ul>
                  </div>
                </div>
                <div class="card">
                  <div class="card-header">
                    <h5 class="card-title mb-0">Recent submissions</h5>
                  </div>
                  <div class="card-body">
                    <ul class="list-group list-group-flush">
                      <li class="list-group-item d-flex justify-content-between align-items-center">
                        Husaini Travels
                        <span class="badge bg-success">Approved</span>
                      </li>
                      <li class="list-group-item d-flex justify-content-between align-items-center">
                        Najmi Tours
                        <span class="badge bg-warning">Awaiting docs</span>
                      </li>
                      <li class="list-group-item d-flex justify-content-between align-items-center">
                        Ridha Expeditions
                        <span class="badge bg-info">Draft</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
        """),
    )

    add_spec(
        file="reservations-pending.html",
        section="Reservations",
        title="Pending",
        goal="Work queue of pending reservations awaiting action.",
        filters=["Source", "Age", "Risk"],
        actions=["Approve", "Reject", "Request info"],
        kpis=[
            {"label": "Total pending", "value": "54", "context": "Queue"},
            {"label": ">3 days old", "value": "12", "context": "Escalate", "badge": "bg-danger"},
            {"label": "High risk", "value": "6", "context": "Needs review"},
            {"label": "Today processed", "value": "18", "context": "Approved + Rejected"},
        ],
        table={
            "title": "Pending reservations",
            "columns": ["Ref", "Guest / Group", "Date requested", "Age", "Source", "Notes", "Actions"],
        },
        sidecards=[
            {"title": "Tips", "items": ["Use request info to gather missing documents", "Tag high risk bookings"]},
        ],
    )


def add_transport_specs():
    add_spec(
        file="transport-driver-management.html",
        section="Transport",
        title="Driver Management",
        goal="Maintain driver profiles and availability.",
        filters=["Status", "License expiry"],
        actions=["Add driver", "Assign vehicle", "Suspend driver"],
        kpis=[
            {"label": "Total drivers", "value": "86", "context": "Profiled"},
            {"label": "On duty", "value": "42", "context": "Current shift"},
            {"label": "On leave", "value": "6", "context": "Approved"},
            {"label": "License expiring", "value": "4", "context": "Within 30 days", "badge": "bg-warning"},
        ],
        table={
            "title": "Drivers",
            "columns": ["Driver", "Code", "Phone", "License no / expiry", "Vehicle", "Status", "Actions"],
        },
        sidecards=[
            {"title": "Reminders", "items": ["Upload new license scans", "Update medical certificates annually"]},
        ],
        modals=[
            {"id": "add-driver", "title": "Add driver", "description": "Personal details, docs, preferred shifts."},
            {"id": "assign-vehicle", "title": "Assign vehicle", "description": "Select vehicle and validity dates."},
        ],
    )

    journey_variants = [
        ("transport-journeys-istiqbal.html", "Journeys / Istiqbal", "Airport welcome journeys."),
        ("transport-journeys-salawaat.html", "Journeys / Salawaat", "Salawaat transfers."),
        ("transport-journeys-madina.html", "Journeys / Madina", "Madina route buses."),
        ("transport-journeys-ziyarah.html", "Journeys / Ziyarah", "Ziyarah excursions."),
    ]

    for file_name, title, goal in journey_variants:
        slug = title.split("/")[-1].strip().lower()
        add_spec(
            file=file_name,
            section="Transport",
            title=title,
            goal=goal,
            filters=["Date", "Route", "Vehicle type", "Status"],
            actions=["Create trip", "Assign passengers"],
            kpis=[
                {"label": "Trips scheduled", "value": "28", "context": "Today"},
                {"label": "Completed", "value": "12", "context": "On time"},
                {"label": "Pax moved", "value": "1,240", "context": "Today"},
                {"label": "Delayed", "value": "3", "context": "Investigate", "badge": "bg-warning"},
            ],
            table={
                "title": "Trip list",
                "columns": ["Trip ID", "Date / Time", "Route", "Vehicle", "Driver", "Pax booked", "Status", "Actions"],
            },
            sidecards=[
                {"title": "Notes", "items": ["Use drawer for passenger manifest", "Mark trip delayed with reason"]},
            ],
            modals=[
                {"id": f"create-trip-{slug}", "title": "Create trip", "description": "Route, capacity, pickup points."},
                {"id": f"assign-passengers-{slug}", "title": "Assign passengers", "description": "Multi-select groups."},
            ],
        )

    add_spec(
        file="transport-roster.html",
        section="Transport",
        title="Roster",
        goal="Driver & vehicle roster schedule.",
        filters=["Date", "Journey type"],
        actions=["Reassign trip", "Block vehicle"],
        kpis=[
            {"label": "Trips today", "value": "62", "context": "Scheduled"},
            {"label": "Drivers on duty", "value": "44", "context": "Shift"},
            {"label": "Vehicles available", "value": "58", "context": "Ready"},
            {"label": "Conflicts", "value": "2", "context": "Resolve quickly", "badge": "bg-danger"},
        ],
        extra=dedent("""
            <div class="card mb-3">
              <div class="card-header">
                <h5 class="card-title mb-0">Roster timeline</h5>
                <div class="text-muted small">Gantt-like view of drivers vs trips.</div>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-bordered text-center">
                    <thead>
                      <tr>
                        <th>Driver</th>
                        <th>06:00</th>
                        <th>09:00</th>
                        <th>12:00</th>
                        <th>15:00</th>
                        <th>18:00</th>
                        <th>21:00</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Alias Hussain</td>
                        <td colspan="2" class="bg-light">Istiqbal Trip 101</td>
                        <td colspan="2" class="bg-light">Salawaat Trip 205</td>
                        <td colspan="2">Off</td>
                      </tr>
                      <tr>
                        <td>Yusuf Fakhr</td>
                        <td colspan="3" class="bg-light">Madina Trip 310</td>
                        <td colspan="2">Break</td>
                        <td class="bg-warning text-white">Standby</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
        """),
        sidecards=[
            {"title": "Alerts", "items": ["Vehicle BUS-12 due service", "Driver Hamid on sick leave"]},
        ],
    )

    add_spec(
        file="transport-vehicle-maintenance.html",
        section="Transport",
        title="Vehicle Maintenance",
        goal="Plan and log vehicle maintenance.",
        filters=["Vehicle type", "Status", "Next service due"],
        actions=["Log service", "Schedule service"],
        kpis=[
            {"label": "Vehicles active", "value": "62", "context": "Fleet"},
            {"label": "Under maintenance", "value": "4", "context": "In workshop"},
            {"label": "Overdue service", "value": "2", "context": "Schedule now", "badge": "bg-danger"},
            {"label": "Avg service cost", "value": "SAR 2,800", "context": "Last month"},
        ],
        table={
            "title": "Maintenance schedule",
            "columns": ["Vehicle ID", "Plate", "Last service", "Next service due", "Odometer", "Status", "Actions"],
        },
        charts=[
            {"title": "Service cost per vehicle", "description": "Bar chart per month"},
        ],
        sidecards=[
            {"title": "Reminders", "items": ["Update odometer after every trip", "Attach invoices to log"]},
        ],
    )


def add_report_specs():
    report_variants = [
        ("report-accommodation.html", "Accommodation Report", "Occupancy %, ADR, and turnaways.", ["Date range", "Building", "Room type"], ["Occupancy %", "Rooms vacant", "ADR"], ["Date", "Rooms occupied", "Rooms vacant", "Turnaways", "Overbookings"]),
        ("report-accounts.html", "Accounts Report", "Revenue vs expenses analytics.", ["Date range", "Department", "Account head"], ["Revenue", "Expenses", "Net"], ["Date", "Revenue", "Expenses", "Variance"]),
        ("report-fakkulehraam.html", "Fakkul Ehraam Report", "Track Fakkul Ehraam processing.", ["Date range", "Package type"], ["Total processed", "Avg spend"], ["Guest / Group", "Dates", "Amount", "Status"]),
        ("report-human-resources.html", "HR Report", "Headcount, attrition, absence metrics.", ["Date range", "Department"], ["Headcount", "Attrition", "Absence rate"], ["Department", "Headcount", "Attrition", "Absences"]),
        ("report-legal.html", "Legal Report", "Case tracking and status.", ["Case type", "Status", "Date range"], ["Active cases", "Closed cases"], ["Case ID", "Type", "Parties", "Status", "Next hearing"]),
        ("report-mawaid.html", "Mawaid Report", "High level Mawaid analytics.", ["Date range", "Meal type", "Building"], ["Food cost %", "Waste"], ["Metric", "Value", "Target"]),
        ("report-reservations.html", "Reservations Report", "Bookings funnel and conversion.", ["Date range", "Source", "Status"], ["Bookings", "Conversion"], ["Operator / Country", "Bookings", "Conversion %", "Revenue"]),
        ("report-transport.html", "Transport Report", "Trips, occupancy, fuel usage.", ["Date range", "Route", "Vehicle"], ["Trips", "Avg occupancy"], ["Date", "Trips", "On-time %", "Fuel usage"]),
    ]

    for file_name, title, goal, filters, summary_labels, table_cols in report_variants:
        add_spec(
            file=file_name,
            section="Reports",
            title=title.replace("Report", "").strip(),
            goal=goal,
            layout="full",
            filters=filters,
            actions=["Apply filters", "Download"],
            kpis=[{"label": label, "value": "—", "context": "TBD"} for label in summary_labels],
            charts=[
                {"title": f"{title} chart 1", "description": "Chart placeholder"},
                {"title": f"{title} chart 2", "description": "Chart placeholder"},
            ],
            table={
                "title": "Aggregated table",
                "columns": table_cols,
            },
        )


def add_settings_users_specs():
    add_spec(
        file="pages-settings.html",
        section="System",
        title="Settings",
        goal="Global preferences, feature toggles, roles and theme palettes.",
        layout="full",
        extra=dedent("""
            <ul class="nav nav-tabs mb-3" role="tablist">
              <li class="nav-item">
                <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#tab-general" type="button" role="tab">General</button>
              </li>
              <li class="nav-item">
                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-modules" type="button" role="tab">Modules</button>
              </li>
              <li class="nav-item">
                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-roles" type="button" role="tab">Roles & Permissions</button>
              </li>
              <li class="nav-item">
                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-themes" type="button" role="tab">Themes</button>
              </li>
            </ul>
            <div class="tab-content">
              <div class="tab-pane fade show active" id="tab-general" role="tabpanel">
                <div class="card mb-3">
                  <div class="card-header"><h5 class="card-title mb-0">Organization</h5></div>
                  <div class="card-body">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="form-label">Org name</label>
                        <input type="text" class="form-control" placeholder="Faiz e Hashemi">
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Timezone</label>
                        <select class="form-select"><option>Asia/Riyadh</option><option>Asia/Dubai</option></select>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Language</label>
                        <select class="form-select"><option>English</option><option>Arabic</option></select>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Support email</label>
                        <input type="email" class="form-control" value="support@example.com">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="tab-pane fade" id="tab-modules" role="tabpanel">
                <div class="row g-3">
                  <div class="col-md-4">
                    <div class="card h-100">
                      <div class="card-body">
                        <div class="d-flex justify-content-between">
                          <strong>Accommodation</strong>
                          <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" checked>
                          </div>
                        </div>
                        <p class="text-muted small mb-0">Enable allocation, housekeeping, forecasts.</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="card h-100">
                      <div class="card-body">
                        <div class="d-flex justify-content-between">
                          <strong>Mawaid</strong>
                          <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" checked>
                          </div>
                        </div>
                        <p class="text-muted small mb-0">Menu planning, inventory, vendors.</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="card h-100">
                      <div class="card-body">
                        <div class="d-flex justify-content-between">
                          <strong>Transport</strong>
                          <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" checked>
                          </div>
                        </div>
                        <p class="text-muted small mb-0">Journeys, roster, maintenance.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="tab-pane fade" id="tab-roles" role="tabpanel">
                <div class="card">
                  <div class="card-header"><h5 class="card-title mb-0">Roles</h5></div>
                  <div class="card-body">
                    <div class="table-responsive">
                      <table class="table">
                        <thead><tr><th>Role</th><th>Description</th><th>Assigned</th><th>Actions</th></tr></thead>
                        <tbody>
                          <tr><td>System Admin</td><td>Full access</td><td>4 users</td><td><button class="btn btn-sm btn-outline-primary">Permissions</button></td></tr>
                          <tr><td>Accommodation Lead</td><td>Allocation & housekeeping</td><td>8 users</td><td><button class="btn btn-sm btn-outline-primary">Permissions</button></td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div class="tab-pane fade" id="tab-themes" role="tabpanel">
                <p class="text-muted">Select one of the 7 named palettes.</p>
                <div class="setting-toggle-grid" data-accent-picker></div>
              </div>
            </div>
        """),
    )

    add_spec(
        file="ums-users.html",
        section="System",
        title="Users & Roles",
        goal="Central user management, invites and status tracking.",
        filters=["Search", "Role", "Status", "Department"],
        actions=["Invite user", "Export list"],
        kpis=[
            {"label": "Total users", "value": "164", "context": "Platform"},
            {"label": "Active", "value": "152", "context": "Logged last 30d"},
            {"label": "Locked", "value": "6", "context": "Security", "badge": "bg-danger"},
            {"label": "Pending invites", "value": "4", "context": "Await acceptance"},
        ],
        table={
            "title": "Users",
            "columns": ["Avatar", "Name", "Username", "ITS", "Email", "Role", "Status", "Last login", "Actions"],
        },
        sidecards=[
            {"title": "Guidance", "items": ["Warn when demoting admins", "Reset password sends email"]},
        ],
        modals=[
            {"id": "invite-user", "title": "Invite user", "description": "Email, role, module access."},
            {"id": "edit-user", "title": "Edit user", "description": "Profile, roles, restrictions."},
        ],
    )


def build_spec_from_plan():
    add_accommodation_specs()
    add_accounts_specs()
    add_hr_specs()
    add_mawaid_specs()
    add_reservations_specs()
    add_transport_specs()
    add_report_specs()
    add_settings_users_specs()


build_spec_from_plan()


def build():
    PARTIALS.mkdir(exist_ok=True)
    for spec in SPEC:
        html = render_page(spec)
        target = PARTIALS / spec['file']
        target.write_text(html, encoding='utf-8')
        print(f"Wrote {target.relative_to(ROOT)}")


if __name__ == "__main__":
    build()
