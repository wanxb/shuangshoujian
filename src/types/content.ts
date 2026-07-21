export const EDITORIAL_STATUSES = ['draft', 'needs-review', 'verified'] as const;
export type EditorialStatus = (typeof EDITORIAL_STATUSES)[number];

export const SOURCE_LEVELS = [
  'original-video',
  'primary-text',
  'publication',
  'modern-interpretation',
  'editorial-illustration',
] as const;
export type SourceLevel = (typeof SOURCE_LEVELS)[number];

export const RIGHTS_STATUSES = [
  'cleared',
  'public-domain',
  'attributed-use',
  'research-only',
  'unknown',
] as const;
export type RightsStatus = (typeof RIGHTS_STATUSES)[number];

export interface CommonContent {
  title: string;
  summary: string;
  editorialStatus: EditorialStatus;
  sourceIds: string[];
  publishedAt?: string;
  updatedAt: string;
  authorLabel: string;
  noindex?: boolean;
}

export interface TimedSegment {
  id: string;
  title: string;
  start: number;
  end: number;
}
