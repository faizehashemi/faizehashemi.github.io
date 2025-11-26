from pathlib import Path
import textwrap

OUTPUT_DIR = Path("partials")

modules = {}

def add_module(filename, data):
    modules[filename] = data


def render_filters(filters, actions):
    if not filters and not actions:
        return ""
    chips = "".join(
        f"<span class=\"badge bg-light text-dark me-2 mb-2\">{label}</span>" for label in filters
    )
    buttons = "".join(
        f"<button type=\"button\" class=\"btn btn-sm btn-primary me-2\">{label}</button>"
        for label in actions
    )
    return textwrap.dedent(f"""
        <div class=\"card mb-3\">
          <div class=\"card-body\">
            <div class=\"d-flex flex-wrap justify-content-between align-items-center\">
              <div class=\"filter-chips d-flex flex-wrap\">
                {chips or '<span class="text-muted small">No filters configured</span>'}
              </div>
              <div class=\"actions text-end\">
                {buttons}
              </div>
            </div>
          </div>
        </div>
    """)


def render_cards(cards):
    if not cards:
        return ""
    cols = []
    for card in cards:
        cols.append(textwrap.dedent(f"""
            <div class=\"col-md-3 col-sm-6\">
              <div class=\"card mb-3\">
                <div class=\"card-body\">
                  <div class=\"text-muted text-uppercase small\">{card['label']}</div>
                  <h3 class=\"mb-2\">{card.get('value', 'â€”')}</h3>
                  <div class=\"text-muted small\">{card.get('context', '')}</div>
                </div>
              </div>
            </div>
        """))
    return f"<div class=\"row\">{''.join(cols)}</div>"


def table_placeholder(columns):
    headers = "".join(f"<th>{col}</th>" for col in columns)
    return textwrap.dedent(f"""
        <table class=\"table table-striped table-hover mb-0\">
          <thead>
            <tr>{headers}</tr>
          </thead>
          <tbody>
            <tr>
              <td colspan=\"{len(columns)}\" class=\"text-muted text-center\">Data loads here from Supabase / API.</td>
            </tr>
          </tbody>
        </table>
    """)


def render_panel(panel):
    ptype = panel.get("type", "text")
    title = panel.get("title")
    body = ""
    if ptype == "table":
        body += table_placeholder(panel.get("columns", []))
    elif ptype == "list":
        items = panel.get("items", [])
        lis = "".join(f"<li class=\"list-group-item\">{item}</li>" for item in items)
        body += f"<ul class=\"list-group list-group-flush\">{lis}</ul>"
    elif ptype == "tabs":
        tabs = panel.get("tabs", [])
        nav = []
        content = []
        for idx, tab in enumerate(tabs):
            active = "active" if idx == 0 else ""
            show = "show active" if idx == 0 else ""
            tab_id = f"tab-{panel.get('id', 'panel')}-{idx}"
            nav.append(f"<button class=\"nav-link {active}\" data-bs-toggle=\"tab\" data-bs-target=\"#{tab_id}\">{tab['label']}</button>")
            inner = "".join(f"<li>{line}</li>" for line in tab.get("details", []))
            content.append(textwrap.dedent(f"""
              <div class=\"tab-pane fade {show}\" id=\"{tab_id}\">
                <p class=\"text-muted small\">{tab.get('description', '')}</p>
                <ul class=\"small\">{inner}</ul>
                {table_placeholder(tab.get('columns', [])) if tab.get('columns') else ''}
              </div>
            """))
        body += textwrap.dedent(f"""
          <ul class=\"nav nav-pills mb-3\" role=\"tablist\">{''.join(nav)}</ul>
          <div class=\"tab-content\">{''.join(content)}</div>
        """)
    elif ptype == "chart":
        body += textwrap.dedent(f"""
          <div class=\"text-center py-4\">
            <div class=\"chart-placeholder\" style=\"height:220px; border:1px dashed #d9dee7; border-radius:0.5rem;\">
              <div class=\"text-muted small pt-5\">{panel.get('description', 'Chart placeholder')}</div>
            </div>
          </div>
        """)
    else:
        paragraphs = panel.get("body", [])
        for para in paragraphs:
            body += f"<p class=\"mb-2\">{para}</p>"
    if panel.get("details"):
        detail_items = "".join(f"<li>{item}</li>" for item in panel["details"])
        body += f"<ul class=\"small text-muted mb-0\">{detail_items}</ul>"
    if panel.get("actions"):
        btns = "".join(f"<button class=\"btn btn-sm btn-outline-primary me-2\">{a}</button>" for a in panel["actions"])
        body += f"<div class=\"mt-3\">{btns}</div>"
    return textwrap.dedent(f"""
        <div class=\"card mb-3\">
          <div class=\"card-header d-flex justify-content-between align-items-center\">
            <h5 class=\"card-title mb-0\">{title}</h5>
            <span class=\"badge bg-light text-muted\">{panel.get('tag', ptype.title())}</span>
          </div>
          <div class=\"card-body\">
            {body}
          </div>
        </div>
    """)


def render_column(column):
    size = column.get("size", 12)
    panels = "".join(render_panel(panel) for panel in column.get("panels", []))
    return f"<div class=\"col-xl-{size}\">{panels}</div>"


def render_layout(layout):
    if not layout:
        return ""
    columns_html = "".join(render_column(col) for col in layout)
    return f"<div class=\"row\">{columns_html}</div>"


def render_notes(notes):
    if not notes:
        return ""
    items = "".join(f"<li>{note}</li>" for note in notes)
    return textwrap.dedent(f"""
        <div class=\"alert alert-info\">
          <ul class=\"mb-0\">{items}</ul>
        </div>
    """)


def render_modals(modals):
    if not modals:
        return ""
    items = "".join(f"<li>{modal}</li>" for modal in modals)
    return textwrap.dedent(f"""
        <div class=\"card mt-4\">
          <div class=\"card-header\">
            <h5 class=\"card-title mb-0\">Workflow dialogs & states</h5>
          </div>
          <div class=\"card-body\">
            <ul class=\"mb-0\">{items}</ul>
          </div>
        </div>
    """)


def render_module(data):
    header = textwrap.dedent(f"""
        <div class=\"row mb-3\">
          <div class=\"col-auto\">
            <h3 class=\"mb-0\"><strong>{data['section']}</strong> / {data['title']}</h3>
            <div class=\"text-muted\">{data['description']}</div>
          </div>
        </div>
    """)
    filters = render_filters(data.get("filters", []), data.get("actions", []))
    cards = render_cards(data.get("cards", []))
    layout = render_layout(data.get("layout", []))
    notes = render_notes(data.get("notes", []))
    modals = render_modals(data.get("modals", []))
    return textwrap.dedent(f"""
        <div class=\"container-fluid p-0\">
          {header}
          {filters}
          {cards}
          {notes}
          {layout}
          {modals}
        </div>
    """)

# TODO: populate modules using add_module(...)

# Placeholder minimal example to ensure script runs
add_module("example.html", {
    "section": "Demo",
    "title": "Example",
    "description": "Placeholder moduleâ€”replace with real specs.",
    "filters": ["Sample filter"],
    "actions": ["Sample action"],
    "cards": [{"label": "Metric", "value": "0", "context": "context"}],
    "layout": [
        {
            "size": 8,
            "panels": [
                {"title": "Sample table", "type": "table", "columns": ["Col A", "Col B"], "details": ["Explain data"], "actions": ["Do thing"]}
            ]
        },
        {
            "size": 4,
            "panels": [
                {"title": "Side notes", "type": "list", "items": ["Reminder", "Second"], "details": ["More context"]}
            ]
        }
    ],
    "modals": ["Sample modal"]
})

for filename, config in modules.items():
    if filename == "plan.md":
        continue
    target = OUTPUT_DIR / filename
    html = '<!-- Generated from plan specification -->\n' + render_module(config)
    target.write_text(html + "\n", encoding="utf-8")

print(f"Generated {len(modules)} partial(s)")
