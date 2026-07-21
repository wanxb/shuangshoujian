import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import {
  EDITORIAL_STATUSES,
  RIGHTS_STATUSES,
  SOURCE_LEVELS,
} from './types/content';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const seconds = z.number().min(0);
const editorialStatus = z.enum(EDITORIAL_STATUSES);
const rightsStatus = z.enum(RIGHTS_STATUSES);
const sourceLevel = z.enum(SOURCE_LEVELS);

const commonFields = {
  title: z.string().min(1),
  summary: z.string().min(1),
  editorialStatus,
  sourceIds: z.array(z.string()).default([]),
  publishedAt: dateString.optional(),
  updatedAt: dateString,
  authorLabel: z.string().min(1).default('本站整理'),
  noindex: z.boolean().default(false),
};

const mediaReference = z.object({
  id: z.string().min(1),
  path: z.string().min(1).optional(),
  alt: z.string().min(1),
  caption: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  sourceId: z.string().min(1),
  rightsStatus,
});

const sources = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/sources' }),
  schema: z.object({
    title: z.string().min(1),
    sourceType: z.enum([
      'video',
      'book',
      'ancient-text',
      'article',
      'image',
      'editorial',
    ]),
    sourceLevel,
    author: z.string().optional(),
    publisher: z.string().optional(),
    year: z.number().int().min(1000).max(2200).optional(),
    url: z.url().optional(),
    accessDate: dateString.optional(),
    volumePage: z.string().optional(),
    rightsStatus,
    note: z.string().optional(),
  }),
});

const techniques = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/techniques' }),
  schema: z.object({
    ...commonFields,
    key: z.enum(['safety', 'equipment', 'grip', 'stance', 'footwork', 'ji', 'ci', 'ge', 'xi']),
    category: z.enum(['preparation', 'foundation', 'core-technique']),
    order: z.number().int().positive(),
    definition: z.string().min(1),
    videoSegmentId: z.string().optional(),
    keyPoints: z.array(z.string()).default([]),
    commonIssues: z.array(z.string()).default([]),
    illustrationIds: z.array(z.string()).default([]),
  }),
});

const routineSections = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/routine-sections' }),
  schema: z.object({
    ...commonFields,
    sectionNumber: z.number().int().min(1).max(4),
    order: z.number().int().min(1).max(4),
    actionGroupIds: z.array(z.string()),
    start: seconds.optional(),
    end: seconds.optional(),
  }),
});

const actionGroups = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/action-groups' }),
  schema: z.object({
    ...commonFields,
    sectionNumber: z.number().int().min(1).max(4),
    groupNumber: z.number().int().positive(),
    order: z.number().int().positive(),
    start: seconds,
    end: seconds,
    actionIds: z.array(z.string()).min(1),
  }),
});

const routineActions = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/routine-actions' }),
  schema: z.object({
    ...commonFields,
    actionNumber: z.number().int().min(1).max(40),
    sectionNumber: z.number().int().min(1).max(4),
    groupId: z.string().min(1),
    subtitleTitle: z.string().min(1),
    verifiedTitle: z.string().min(1).optional(),
    techniqueIds: z.array(z.string()).default([]),
    start: seconds,
    end: seconds,
    keyPoints: z.array(z.string()).default([]),
    commonIssues: z.array(z.string()).default([]),
    illustrationIds: z.array(z.string()).default([]),
  }),
});

const verses = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/verses' }),
  schema: z.object({
    ...commonFields,
    attribution: z.string().optional(),
    start: seconds,
    end: seconds,
    lines: z.array(
      z.object({
        id: z.string().min(1),
        order: z.number().int().positive(),
        start: seconds,
        end: seconds,
        transcription: z.string().min(1),
        verifiedText: z.string().min(1).optional(),
        uncertainParts: z.array(z.string()).default([]),
        note: z.string().optional(),
      }),
    ).min(1),
    revisions: z.array(
      z.object({
        date: dateString,
        editor: z.string().min(1),
        note: z.string().min(1),
        sourceIds: z.array(z.string()).default([]),
      }),
    ).default([]),
  }),
});

const people = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/people' }),
  schema: z.object({
    ...commonFields,
    fullName: z.string().min(1),
    born: dateString.optional(),
    died: dateString.optional(),
    images: z.array(mediaReference).default([]),
    timeline: z.array(
      z.object({
        dateLabel: z.string().min(1),
        title: z.string().min(1),
        description: z.string().min(1),
        sourceIds: z.array(z.string()).min(1),
        status: editorialStatus,
      }),
    ).default([]),
  }),
});

const manualForms = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/manual-forms' }),
  schema: z.object({
    ...commonFields,
    formNumber: z.number().int().min(1).max(24),
    formName: z.string().min(1),
    originalText: z.string().default(''),
    punctuatedText: z.string().default(''),
    explanation: z.string().default(''),
    techniqueIds: z.array(z.string()).default([]),
    image: mediaReference.optional(),
  }),
});

const illustrations = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/illustrations' }),
  schema: z.object({
    title: z.string().min(1),
    kind: z.enum(['original-frame', 'editorial-diagram', 'manual-plate']),
    path: z.string().min(1).optional(),
    alt: z.string().min(1),
    caption: z.string().min(1),
    sourceId: z.string().min(1),
    rightsStatus,
    editorialStatus,
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    mirroredPath: z.string().min(1).optional(),
  }),
});

const videoSegments = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/video-segments' }),
  schema: z.object({
    title: z.string().min(1),
    videoId: z.string().min(1),
    start: seconds,
    end: seconds,
    frameRate: z.number().positive().default(20),
    transcript: z.string().default(''),
    posterPath: z.string().optional(),
    editorialStatus,
    sourceIds: z.array(z.string()).min(1),
  }),
});

export const collections = {
  sources,
  techniques,
  routineSections,
  actionGroups,
  routineActions,
  verses,
  people,
  manualForms,
  illustrations,
  videoSegments,
};
