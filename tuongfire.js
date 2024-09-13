const protectedPaths = ['/keysweb.json', '/index.html', '/8888.js', '/acc.json', '/manifest.json', '/tuongfire.js'];

if (protectedPaths.includes(window.location.pathname)) {
    window.location.href = '/404.html';
}