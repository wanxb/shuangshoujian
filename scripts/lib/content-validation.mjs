import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const PUBLISHABLE_RIGHTS = new Set(['cleared', 'public-domain', 'attributed-use']);
const CONTENT_DIRECTORIES = {
  sources: ['sources', 'json'],
  techniques: ['techniques', 'markdown'],
  routineSections: ['routine-sections', 'json'],
  actionGroups: ['action-groups', 'json'],
  routineActions: ['routine-actions', 'markdown'],
  verses: ['verses', 'json'],
  people: ['people', 'markdown'],
  manualForms: ['manual-forms', 'markdown'],
  illustrations: ['illustrations', 'json'],
  videoSegments: ['video-segments', 'json'],
};

async function listFiles(directory, allowedExtensions) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) return listFiles(fullPath, allowedExtensions);
        return allowedExtensions.has(path.extname(entry.name)) ? [fullPath] : [];
      }),
    );
    return nested.flat();
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

function idFromPath(filePath, baseDirectory) {
  return path
    .relative(baseDirectory, filePath)
    .replace(/\\/g, '/')
    .replace(/\.(json|md|mdx)$/i, '');
}

async function readCollection(baseDirectory, format) {
  const extensions =
    format === 'json' ? new Set(['.json']) : new Set(['.md', '.mdx']);
  const files = await listFiles(baseDirectory, extensions);
  return Promise.all(
    files.map(async (filePath) => {
      const raw = await readFile(filePath, 'utf8');
      const data = format === 'json' ? JSON.parse(raw) : matter(raw).data;
      return { id: idFromPath(filePath, baseDirectory), ...data };
    }),
  );
}

export async function collectContent(projectRoot) {
  const contentRoot = path.join(projectRoot, 'src', 'content');
  const pairs = await Promise.all(
    Object.entries(CONTENT_DIRECTORIES).map(async ([key, [directory, format]]) => [
      key,
      await readCollection(path.join(contentRoot, directory), format),
    ]),
  );
  return Object.fromEntries(pairs);
}

function validateSequence(items, field, expectedCount, label, strict, errors, warnings) {
  if (items.length === 0 && !strict) {
    warnings.push(`${label}尚未录入，严格发布校验将要求 ${expectedCount} 项。`);
    return;
  }

  const values = items.map((item) => item[field]);
  const unique = new Set(values);
  if (items.length !== expectedCount) {
    errors.push(`${label}应有 ${expectedCount} 项，当前为 ${items.length} 项。`);
  }
  if (unique.size !== values.length) {
    errors.push(`${label}的${field}存在重复。`);
  }
  for (let number = 1; number <= expectedCount; number += 1) {
    if (!unique.has(number)) errors.push(`${label}缺少编号 ${number}。`);
  }
}

function validateTimedEntries(items, label, maxDuration, errors) {
  for (const item of items) {
    if (typeof item.start !== 'number' || typeof item.end !== 'number') {
      errors.push(`${label}“${item.id}”缺少数值时间码。`);
      continue;
    }
    if (item.start < 0 || item.end <= item.start) {
      errors.push(`${label}“${item.id}”的时间码必须满足 0 <= start < end。`);
    }
    if (item.end > maxDuration) {
      errors.push(`${label}“${item.id}”结束时间 ${item.end} 超过视频时长 ${maxDuration}。`);
    }
  }
}

function validateReferences(items, field, targets, label, errors) {
  const targetIds = new Set(targets.map((item) => item.id));
  for (const item of items) {
    const references = Array.isArray(item[field]) ? item[field] : [];
    for (const reference of references) {
      if (!targetIds.has(reference)) {
        errors.push(`${label}“${item.id}”引用了不存在的 ${field}: ${reference}。`);
      }
    }
  }
}

function validateAssetRights(assets, label, errors) {
  for (const asset of assets) {
    if (asset.path && !PUBLISHABLE_RIGHTS.has(asset.rightsStatus)) {
      errors.push(
        `${label}“${asset.id || asset.title}”包含公开路径，但权利状态为 ${asset.rightsStatus}。`,
      );
    }
  }
}

export function validateContent(content, options = {}) {
  const strict = options.strict ?? false;
  const maxDuration = options.maxDuration ?? 1219;
  const errors = [];
  const warnings = [];

  validateSequence(
    content.routineSections,
    'sectionNumber',
    4,
    '套路段落',
    strict,
    errors,
    warnings,
  );
  validateSequence(
    content.routineActions,
    'actionNumber',
    40,
    '套路动作',
    strict,
    errors,
    warnings,
  );
  validateSequence(
    content.manualForms,
    'formNumber',
    24,
    '朝鲜势法',
    strict,
    errors,
    warnings,
  );

  validateTimedEntries(content.actionGroups, '动作组', maxDuration, errors);
  validateTimedEntries(content.routineActions, '套路动作', maxDuration, errors);
  validateTimedEntries(content.videoSegments, '视频片段', maxDuration, errors);
  validateTimedEntries(content.verses, '歌诀', maxDuration, errors);

  validateReferences(content.routineSections, 'actionGroupIds', content.actionGroups, '套路段落', errors);
  validateReferences(content.actionGroups, 'actionIds', content.routineActions, '动作组', errors);

  const sourcedCollections = [
    content.techniques,
    content.routineSections,
    content.actionGroups,
    content.routineActions,
    content.verses,
    content.people,
    content.manualForms,
    content.videoSegments,
  ];
  for (const collection of sourcedCollections) {
    validateReferences(collection, 'sourceIds', content.sources, '内容条目', errors);
  }

  validateAssetRights(content.illustrations, '插图', errors);
  validateAssetRights(
    content.manualForms.flatMap((form) =>
      form.image ? [{ id: `${form.id}:image`, ...form.image }] : [],
    ),
    '古谱图版',
    errors,
  );
  validateAssetRights(
    content.people.flatMap((person) =>
      (person.images || []).map((image) => ({ id: `${person.id}:image`, ...image })),
    ),
    '人物图片',
    errors,
  );

  for (const item of [
    ...content.techniques,
    ...content.routineSections,
    ...content.actionGroups,
    ...content.routineActions,
    ...content.verses,
    ...content.people,
    ...content.manualForms,
  ]) {
    if (item.editorialStatus === 'needs-review' && item.noindex === undefined) {
      warnings.push(`待校订条目“${item.id}”未显式设置 noindex，默认按可索引内容处理。`);
    }
  }

  return { errors, warnings };
}
