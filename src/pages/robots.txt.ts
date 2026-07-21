import type { APIRoute } from 'astro';
import { SITE } from '../data/site';
import { robotsContent } from '../utils/seo';

export const GET: APIRoute = ({ site }) => {
  const resolvedSite = site ?? new URL(SITE.url);
  return new Response(robotsContent(resolvedSite), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
