// Desk login. On success the shell routes to the page that was asked for (or the desk's site).

import { login, apiBase, setApiOverride, UserError } from '../../core/cloud.js';
import { API_URL } from '../../config.js';

export default function mount() {
    const $ = (id) => document.getElementById(id);
    const reason = sessionStorage.getItem('pms_logout_reason');
    if (reason) { $('err').textContent = reason; sessionStorage.removeItem('pms_logout_reason'); }
    if (apiBase() !== API_URL.replace(/\/+$/, '')) { $('apiUrl').value = apiBase(); $('apiUrl').closest('details').open = true; }
    $('deskName').focus();

    $('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        $('err').textContent = '';
        setApiOverride($('apiUrl').value.trim());
        $('btnLogin').disabled = true;
        $('btnLogin').textContent = 'Logging in…';
        try {
            await login($('deskName').value.trim(), $('deskPass').value);
            window.dispatchEvent(new CustomEvent('pms:logged-in'));
        } catch (err) {
            console.error(err);
            $('err').textContent = err instanceof UserError ? err.message : 'Could not log in: ' + (err.message || err);
            $('btnLogin').disabled = false;
            $('btnLogin').textContent = 'Log in';
            $('deskPass').select();
        }
    });
}
