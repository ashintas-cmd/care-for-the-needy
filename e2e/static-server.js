/**
 * Minimal static server for the production build.
 *
 * Used by Playwright so the end-to-end tests run against exactly what Firebase
 * Hosting will serve (the contents of `build/`), with SPA fallback and the same
 * `cleanUrls` behaviour as firebase.json. No extra dependency required.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 4173;
const ROOT = path.resolve(__dirname, '..', 'build');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8'
};

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const stream = fs.createReadStream(filePath);

  stream.on('error', () => {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  });

  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': ext === '.html' ? 'no-store' : 'public, max-age=31536000'
  });
  stream.pipe(res);
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);

  // API routes are handled by the Cloud Function in production; in this local
  // preview they intentionally do not exist so the site's offline fallbacks
  // can be exercised.
  if (urlPath.startsWith('/api/')) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Route not found' }));
    return;
  }

  const requested = urlPath === '/' ? '/index.html' : urlPath;
  const filePath = path.join(ROOT, requested);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      sendFile(res, filePath);
      return;
    }

    // `cleanUrls: true` - /about serves /about.html
    const withHtml = `${filePath}.html`;
    fs.stat(withHtml, (htmlErr, htmlStats) => {
      if (!htmlErr && htmlStats.isFile()) {
        sendFile(res, withHtml);
        return;
      }

      // SPA fallback (firebase.json rewrites ** to /index.html)
      sendFile(res, path.join(ROOT, 'index.html'));
    });
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Serving build/ on http://127.0.0.1:${PORT}`);
});
