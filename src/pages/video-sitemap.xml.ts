import type { APIRoute } from 'astro';
import { SITE } from '../data/site';
import { MAIN_VIDEO } from '../data/video-manifest';
import { absoluteUrl } from '../utils/seo';

const escapeXml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

export const GET: APIRoute = ({ site }) => {
  const resolvedSite = site ?? new URL(SITE.url);
  const page = absoluteUrl('/routine/', resolvedSite);
  const thumbnail = absoluteUrl('/media/posters/full-routine.webp', resolvedSite);
  const content = absoluteUrl(MAIN_VIDEO.publicSources.lowBandwidth, resolvedSite);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  <url>
    <loc>${escapeXml(page)}</loc>
    <video:video>
      <video:thumbnail_loc>${escapeXml(thumbnail)}</video:thumbnail_loc>
      <video:title>${escapeXml('于承惠双手剑四段四十式教学')}</video:title>
      <video:description>${escapeXml('于承惠先生演练并分组讲解双手剑四段四十式，含击、刺、格、洗四种主要剑法和片尾两篇歌诀。')}</video:description>
      <video:content_loc>${escapeXml(content)}</video:content_loc>
      <video:duration>${Math.floor(MAIN_VIDEO.duration)}</video:duration>
      <video:family_friendly>yes</video:family_friendly>
      <video:requires_subscription>no</video:requires_subscription>
    </video:video>
  </url>
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
