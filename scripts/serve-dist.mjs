#!/usr/bin/env node
/**
 * serve-dist.mjs — serves the built static output in `dist/client` over HTTP.
 *
 * Why this exists: `wrangler pages dev` is the documented way to run the site
 * locally, but it cannot start in every environment (it fails with "No such
 * module wrangler:modules-watch" in some sandboxes/CI images), and the CI
 * pipeline previously pointed Playwright at a deployed Cloudflare preview URL —
 * which made the whole E2E suite dependent on a working deploy credential.
 *
 * All seven public routes are prerendered (`prerender = true`), so serving the
 * files straight off disk exercises byte-for-byte the same HTML that ships.
 * That makes the tests faster, credential-free, and able to run on PRs from
 * forks. Uses only the Node standard library — no dependency to install.
 *
 * What this deliberately does NOT do: apply `_headers`. Cloudflare adds those
 * at the edge, so any assertion about CSP, caching, or security headers cannot
 * be made against this server. `scripts/checks/verify-csp-hashes.mjs` covers
 * the CSP separately, by inspecting the shipped `dist/client/_headers`.
 *
 * Usage:
 *   node scripts/serve-dist.mjs [--port 8788] [--root dist/client]
 */
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { createBrotliCompress, createGzip } from 'node:zlib';

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const PORT = Number(arg('port', process.env.PORT || 8788));
const ROOT = resolve(arg('root', 'dist/client'));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

async function statOrNull(path) {
  try {
    return await stat(path);
  } catch {
    return null;
  }
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', ...headers });
  res.end(body);
}

/*
 * Text assets are compressed on the fly. This is not an optimisation of the
 * server — it is measurement fidelity. Cloudflare serves HTML/CSS/JS with
 * Brotli, so auditing an uncompressed local copy inflates transfer size and
 * therefore LCP, and would make a Lighthouse budget fail here for a reason that
 * does not exist in production. Compressible types only: images, video and
 * fonts are already compressed and would just burn CPU.
 */
const COMPRESSIBLE = new Set([
  '.html',
  '.js',
  '.mjs',
  '.css',
  '.json',
  '.xml',
  '.txt',
  '.svg',
  '.ico',
]);

function sendFile(req, res, path, size) {
  const ext = extname(path).toLowerCase();
  const headers = {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    Vary: 'Accept-Encoding',
  };

  const accepted = String(req.headers['accept-encoding'] || '');
  const encoding = !COMPRESSIBLE.has(ext)
    ? null
    : /\bbr\b/.test(accepted)
      ? 'br'
      : /\bgzip\b/.test(accepted)
        ? 'gzip'
        : null;

  if (!encoding) {
    res.writeHead(200, { ...headers, 'Content-Length': size });
    if (req.method === 'HEAD') return res.end();
    return createReadStream(path).pipe(res);
  }

  // Content-Length is omitted deliberately: the compressed length is not known
  // until the stream finishes, so the response is chunked, exactly as at the edge.
  res.writeHead(200, { ...headers, 'Content-Encoding': encoding });
  if (req.method === 'HEAD') return res.end();
  const compressor = encoding === 'br' ? createBrotliCompress() : createGzip();
  createReadStream(path).pipe(compressor).pipe(res);
}

const server = createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Method Not Allowed', { Allow: 'GET, HEAD' });
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = decodeURIComponent(url.pathname);

  // Contain every request inside ROOT — a request for "/../../etc/passwd"
  // must not escape the served directory.
  const target = resolve(join(ROOT, normalize(pathname)));
  if (target !== ROOT && !target.startsWith(ROOT + sep)) {
    return send(res, 403, 'Forbidden');
  }

  const info = await statOrNull(target);

  // The site is built with `build.format: 'directory'` and
  // `trailingSlash: 'always'`, so /menu is a directory holding index.html.
  // Redirect to the canonical slashed form rather than serving both, which
  // keeps the served URLs consistent with the canonical tags under test.
  if (info?.isDirectory()) {
    if (!pathname.endsWith('/')) {
      return send(res, 301, '', { Location: pathname + '/' + (url.search || '') });
    }
    const index = join(target, 'index.html');
    const indexInfo = await statOrNull(index);
    if (indexInfo?.isFile()) return sendFile(req, res, index, indexInfo.size);
  }

  if (info?.isFile()) return sendFile(req, res, target, info.size);

  const notFound = join(ROOT, '404.html');
  const notFoundInfo = await statOrNull(notFound);
  if (notFoundInfo?.isFile()) {
    res.writeHead(404, { 'Content-Type': MIME['.html'] });
    if (req.method === 'HEAD') return res.end();
    return createReadStream(notFound).pipe(res);
  }
  return send(res, 404, 'Not Found');
});

const rootInfo = await statOrNull(ROOT);
if (!rootInfo?.isDirectory()) {
  console.error(`serve-dist: "${ROOT}" does not exist. Run \`pnpm build\` first.`);
  process.exit(1);
}

server.listen(PORT, '127.0.0.1', () => {
  console.log(`serve-dist: serving ${ROOT} at http://127.0.0.1:${PORT}/`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
