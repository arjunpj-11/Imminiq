import { describe, expect, it } from 'vitest';

import { allOutlinePaths, parseTrackerOutlineJson, selectedOutline } from './tracker-outline';

describe('tracker outline JSON', () => {
  it('normalizes recursive subtopics and children aliases', () => {
    const outline = parseTrackerOutlineJson(JSON.stringify({
      topics: [{
        title: 'Topic',
        children: [{ title: 'Child', subtopics: [{ title: 'Grandchild' }] }],
      }],
    }));

    expect(outline[0]?.subtopics[0]?.title).toBe('Child');
    expect(outline[0]?.subtopics[0]?.subtopics[0]?.title).toBe('Grandchild');
  });

  it('rejects invalid and empty imports before any request is sent', () => {
    expect(() => parseTrackerOutlineJson('{broken')).toThrow('not valid JSON');
    expect(() => parseTrackerOutlineJson('{"topics":[]}')).toThrow('at least one topic');
  });

  it('keeps only confirmed AI suggestions and their confirmed descendants', () => {
    const nodes = parseTrackerOutlineJson(JSON.stringify([
      { title: 'One', subtopics: [{ title: 'One child' }] },
      { title: 'Two' },
    ]));

    expect(allOutlinePaths(nodes)).toEqual(['0', '0.0', '1']);
    expect(selectedOutline(nodes, new Set(['0', '0.0']))).toHaveLength(1);
    expect(selectedOutline(nodes, new Set(['0']))[0]?.subtopics).toEqual([]);
  });
});
