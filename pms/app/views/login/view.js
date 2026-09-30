// Desk login. On success the shell routes to the page that was asked for (or the desk's site).
// The server address is fixed in app/config.js (API_URL); there is no server field on this page.

import { login, UserError } from '../../core/cloud.js';

export default function mount() {
    const $ = (id) => document.getElementById(id);
    const reason = sessionStorage.getItem('pms_logout_reason');
    if (reason) { $('err').textContent = reason; sessionStorage.removeItem('pms_logout_reason'); }
    $('deskName').focus();

    $('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        $('err').textContent = '';
        $('btnLogin').disabled = true;
        $('btnLogin').textContent = 'Logging in…';
        try {
            await login($('deskName').value.trim(), $('deskPass').value); // fires 'pms:logged-in'
        } catch (err) {
            console.error(err);
            $('err').textContent = err instanceof UserError ? err.message : 'Could not log in: ' + (err.message || err);
            $('btnLogin').disabled = false;
            $('btnLogin').textContent = 'Log in';
            $('deskPass').select();
        }
    });
}
