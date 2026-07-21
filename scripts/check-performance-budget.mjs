import { readdir, stat } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const root = path.resolve('dist');
const limits = {
  javascriptTransferTotal: 90 * 1024,
  cssTransferTotal: 40 * 1024,
  largestJavascriptAsset: 200 * 1024,
  largestImage: 500 * 1024,
};

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : absolute;
  }));
  return nested.flat();
}

const files = await walk(root);
const sizes = await Promise.all(files.map(async (file) => {
  const bytes = (await stat(file)).size;
  const transferBytes = /\.(?:css|js)$/i.test(file) ? gzipSync(await readFile(file)).byteLength : bytes;
  return { file, bytes, transferBytes };
}));
const transferSum = (extension) => sizes
  .filter((item) => item.file.endsWith(extension))
  .reduce((total, item) => total + item.transferBytes, 0);
const javascriptSizes = sizes.filter((item) => item.file.endsWith('.js'));
const imageSizes = sizes.filter((item) => /\.(?:avif|webp|png|jpe?g|svg)$/i.test(item.file));
const result = {
  javascriptTransferTotal: transferSum('.js'),
  cssTransferTotal: transferSum('.css'),
  largestJavascriptAsset: Math.max(0, ...javascriptSizes.map((item) => item.bytes)),
  largestImage: Math.max(0, ...imageSizes.map((item) => item.bytes)),
};

const failures = Object.entries(result).filter(([key, value]) => value > limits[key]);
console.log('[performance budget]', result);
if (failures.length) {
  for (const [key, value] of failures) console.error(`${key}: ${value} > ${limits[key]}`);
  process.exit(1);
}
