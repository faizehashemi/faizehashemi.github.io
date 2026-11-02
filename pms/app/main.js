// Start of the PMS: picks the shell that draws the menu and the pages.
//   React shell (react/src/shell, loaded by react-shell.js) when config.js REACT_SHELL is on, or this browser has localStorage
//   pms_react_shell=1; ?shell=legacy in the address (before or after the #) forces the old one.
//   Legacy shell (legacy-shell.js: core/nav.js menu + hash router) otherwise.
// Both use services.js for everything that runs behind the pages.
import { REACT_SHELL } from './config.js';

function reactShellOn() {
    try {
        const q = (s) => new URLSearchParams(s).get('shell');
        const ask = q(location.search) || q(location.hash.split('?')[1] || '');
        if (ask === 'legacy') return false;
        if (ask === 'react') return true;
        if (localStorage.getItem('pms_react_shell') === '0') return false;
        if (localStorage.getItem('pms_react_shell') === '1') return true;
    } catch { }
    return !!REACT_SHELL;
}

if (reactShellOn()) {
    import('./react-shell.js').catch((e) => {
        // the React shell could not start (e.g. its bundle failed to load): the old one still can
        console.error('React shell failed, using the legacy shell', e);
        import('./legacy-shell.js');
    });
} else import('./legacy-shell.js');
