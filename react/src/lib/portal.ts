// Radix portals (dialogs, menus, selects, tooltips) render into this element instead of <body>: it carries the .pms-react
// class, so the shadcn theme variables apply to them (the variables are scoped to .pms-react to stay clear of the legacy pages).
export function portalContainer(): HTMLElement {
    let el = document.getElementById('pms-react-portal');
    if (!el) {
        el = document.createElement('div');
        el.id = 'pms-react-portal';
        el.className = 'pms-react';
        document.body.appendChild(el);
    }
    return el;
}
