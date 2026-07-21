export interface SeoInput {
  title: string;
  description: string;
  canonicalPath: string;
  imagePath?: string;
  noindex?: boolean;
  type?: 'website' | 'article' | 'video.other';
}

export function absoluteUrl(pathname: string, base: URL | string) {
  return new URL(pathname, base).toString();
}

export function canonicalPath(url: URL | string) {
  const parsed = new URL(url, 'https://example.invalid');
  const pathname = parsed.pathname.replace(/\/{2,}/g, '/');
  return pathname.endsWith('/') || pathname.includes('.') ? pathname : `${pathname}/`;
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

export function robotsContent(site: URL) {
  const isPreview = ['localhost', '127.0.0.1'].includes(site.hostname) || site.hostname.endsWith('.local');
  if (isPreview) return 'User-agent: *\nDisallow: /\n';

  return [
    'User-agent: *',
    'Allow: /',
    `Sitemap: ${absoluteUrl('/sitemap-index.xml', site)}`,
    `Sitemap: ${absoluteUrl('/video-sitemap.xml', site)}`,
    '',
  ].join('\n');
}
