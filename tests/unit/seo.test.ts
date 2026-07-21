import { describe, expect, it } from 'vitest';
import { canonicalPath, robotsContent, serializeJsonLd } from '../../src/utils/seo';
import { breadcrumbJsonLd, videoObjectJsonLd } from '../../src/utils/structured-data';

describe('SEO utilities', () => {
  it('removes transient query and hash values from canonical paths', () => {
    expect(canonicalPath('https://example.com/routine/actions/action-01?t=424#player')).toBe('/routine/actions/action-01/');
  });

  it('escapes markup in JSON-LD serialization', () => {
    expect(serializeJsonLd({ name: '</script>' })).not.toContain('</script>');
  });

  it('blocks localhost previews and publishes both sitemaps on a real host', () => {
    expect(robotsContent(new URL('http://localhost:4321'))).toContain('Disallow: /');
    const production = robotsContent(new URL('https://example.com'));
    expect(production).toContain('sitemap-index.xml');
    expect(production).toContain('video-sitemap.xml');
  });

  it('maps visible navigation and video clips to Schema.org objects', () => {
    const site = new URL('https://example.com');
    const breadcrumbs = breadcrumbJsonLd(site, [{ name: '套路', path: '/routine/' }]);
    expect(breadcrumbs['@type']).toBe('BreadcrumbList');
    const video = videoObjectJsonLd(site, {
      name: '第一式',
      description: '动作教学',
      pagePath: '/routine/actions/action-01/',
      contentPath: '/media/video.mp4',
      thumbnailPath: '/media/poster.webp',
      duration: 1219.2,
      clips: [{ name: '第一式', start: 424, end: 428, path: '/routine/actions/action-01/' }],
    });
    expect(video.duration).toBe('PT1219S');
    expect(video.hasPart).toHaveLength(1);
  });
});
