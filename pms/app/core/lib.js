// Loads a classic (UMD) script once, on demand. Returns the same promise on repeat calls.

const loading = new Map();

export function loadScript(url) {
    if (!loading.has(url)) {
        loading.set(url, new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = url;
            s.onload = resolve;
            s.onerror = () => { loading.delete(url); s.remove(); reject(new Error('Could not load ' + url)); };
            document.head.appendChild(s);
        }));
    }
    return loading.get(url);
}

export const LIBS = {
    jspdf: 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
    docx: 'https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.min.js',
    fileSaver: 'https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js',
};
