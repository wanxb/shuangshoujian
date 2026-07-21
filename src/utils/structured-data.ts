import { absoluteUrl } from './seo';

type JsonLd = Record<string, unknown>;

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function websiteJsonLd(site: URL, name: string, description: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': absoluteUrl('/#website', site),
    url: absoluteUrl('/', site),
    name,
    description,
    inLanguage: 'zh-CN',
  };
}

export function breadcrumbJsonLd(site: URL, items: BreadcrumbItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, site),
    })),
  };
}

export function courseJsonLd(site: URL, input: { name: string; description: string; path: string; provider: string }): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path, site),
    provider: { '@type': 'Organization', name: input.provider, url: absoluteUrl('/', site) },
    inLanguage: 'zh-CN',
    isAccessibleForFree: true,
  };
}

export function learningResourceJsonLd(site: URL, input: { name: string; description: string; path: string; position?: number }): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path, site),
    inLanguage: 'zh-CN',
    isAccessibleForFree: true,
    ...(input.position ? { position: input.position } : {}),
  };
}

export function videoObjectJsonLd(site: URL, input: {
  name: string;
  description: string;
  pagePath: string;
  contentPath: string;
  thumbnailPath: string;
  duration: number;
  clips?: Array<{ name: string; start: number; end: number; path: string }>;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.pagePath, site),
    contentUrl: absoluteUrl(input.contentPath, site),
    thumbnailUrl: absoluteUrl(input.thumbnailPath, site),
    duration: `PT${Math.round(input.duration)}S`,
    inLanguage: 'zh-CN',
    hasPart: input.clips?.map((clip) => ({
      '@type': 'Clip',
      name: clip.name,
      startOffset: clip.start,
      endOffset: clip.end,
      url: absoluteUrl(`${clip.path}?t=${clip.start}`, site),
    })),
  };
}

export function personJsonLd(site: URL, input: { name: string; description: string; path: string; birthDate?: string }): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path, site),
    ...(input.birthDate ? { birthDate: input.birthDate } : {}),
  };
}

export function articleJsonLd(site: URL, input: { headline: string; description: string; path: string; author: string; dateModified: string }): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    mainEntityOfPage: absoluteUrl(input.path, site),
    author: { '@type': 'Organization', name: input.author },
    dateModified: input.dateModified,
    inLanguage: 'zh-CN',
  };
}

export function imageObjectJsonLd(site: URL, input: { name: string; description: string; path: string; width: number; height: number; credit: string }): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    name: input.name,
    description: input.description,
    contentUrl: absoluteUrl(input.path, site),
    width: input.width,
    height: input.height,
    creditText: input.credit,
  };
}
