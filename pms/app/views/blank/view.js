// Shown to a login that may open no page at all (Setup → Page access has nothing ticked for it).
import { currentDesk } from '../../core/cloud.js';

export default function mount(ctx) {
    ctx.root.querySelector('#blankWho').textContent = `Logged in as ${currentDesk()?.name || ''}.`;
    ctx.root.querySelector('[data-href="settings"]').href = ctx.href('settings');
}
