import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';

const root = path.resolve('dist');
const host = process.env.HOST ?? '127.0.0.1';
const port = Number(process.env.PORT ?? 4321);
const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.mp4', 'video/mp4'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.vtt', 'text/vtt; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.xml', 'application/xml; charset=utf-8'],
]);

function resolveRequestPath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://${host}:${port}`).pathname);
  const candidate = path.resolve(root, `.${pathname}`);
  if (candidate !== root && !candidate.startsWith(`${root}${path.sep}`)) return null;
  return path.extname(candidate) ? candidate : path.join(candidate, 'index.html');
}

function parseRange(value, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(value ?? '');
  if (!match) return null;
  const start = match[1] ? Number(match[1]) : 0;
  const end = match[2] ? Number(match[2]) : size - 1;
  if (!Number.isInteger(start) || !Number.isInteger(end) || start > end || end >= size) return null;
  return { start, end };
}

const server = createServer(async (request, response) => {
  const file = resolveRequestPath(request.url ?? '/');
  if (!file) {
    response.writeHead(400).end('Bad request');
    return;
  }

  try {
    const metadata = await stat(file);
    const range = parseRange(request.headers.range, metadata.size);
    const headers = {
      'Accept-Ranges': 'bytes',
      'Content-Type': mimeTypes.get(path.extname(file).toLowerCase()) ?? 'application/octet-stream',
    };

    if (request.headers.range && !range) {
      response.writeHead(416, { ...headers, 'Content-Range': `bytes */${metadata.size}` }).end();
      return;
    }

    if (range) {
      response.writeHead(206, {
        ...headers,
        'Content-Length': range.end - range.start + 1,
        'Content-Range': `bytes ${range.start}-${range.end}/${metadata.size}`,
      });
      if (request.method === 'HEAD') response.end();
      else createReadStream(file, range).pipe(response);
      return;
    }

    response.writeHead(200, { ...headers, 'Content-Length': metadata.size });
    if (request.method === 'HEAD') response.end();
    else createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
  }
});

server.listen(port, host, () => {
  console.log(`Static test server listening on http://${host}:${port}`);
});
