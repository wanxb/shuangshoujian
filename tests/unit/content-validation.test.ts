import { describe, expect, it } from 'vitest';
import { validateContent } from '../../scripts/lib/content-validation.mjs';

function createContent() {
  return {
    sources: [{ id: 'source-video' }],
    techniques: [],
    routineSections: Array.from({ length: 4 }, (_, index) => ({
      id: `section-${index + 1}`,
      sectionNumber: index + 1,
      actionGroupIds: [],
      sourceIds: ['source-video'],
    })),
    actionGroups: [],
    routineActions: Array.from({ length: 40 }, (_, index) => ({
      id: `action-${index + 1}`,
      actionNumber: index + 1,
      start: index,
      end: index + 0.5,
      sourceIds: ['source-video'],
    })),
    verses: [],
    people: [],
    manualForms: Array.from({ length: 24 }, (_, index) => ({
      id: `form-${index + 1}`,
      formNumber: index + 1,
      sourceIds: ['source-video'],
    })),
    illustrations: [] as Array<{
      id: string;
      path?: string;
      rightsStatus: string;
    }>,
    videoSegments: [],
  };
}

describe('content relationship validation', () => {
  it('accepts complete numbered collections', () => {
    const result = validateContent(createContent(), { strict: true });
    expect(result.errors).toEqual([]);
  });

  it('reports missing action numbers and invalid timecodes', () => {
    const content = createContent();
    content.routineActions.pop();
    content.routineActions[0].end = 1300;
    const result = validateContent(content, { strict: true, maxDuration: 1219 });
    expect(result.errors).toContain('套路动作应有 40 项，当前为 39 项。');
    expect(result.errors).toContain('套路动作缺少编号 40。');
    expect(result.errors.some((message) => message.includes('超过视频时长'))).toBe(true);
  });

  it('blocks research-only assets from public paths', () => {
    const content = createContent();
    content.illustrations.push({
      id: 'manual-reference',
      path: '/images/reference.png',
      rightsStatus: 'research-only',
    });
    const result = validateContent(content, { strict: true });
    expect(result.errors[0]).toContain('权利状态为 research-only');
  });

  it('allows explicitly attributed assets on public paths', () => {
    const content = createContent();
    content.illustrations.push({
      id: 'attributed-reference',
      path: '/images/attributed-reference.png',
      rightsStatus: 'attributed-use',
    });
    const result = validateContent(content, { strict: true });
    expect(result.errors).toEqual([]);
  });
});
