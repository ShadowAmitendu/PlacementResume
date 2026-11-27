import { describe, it, expect } from 'vitest';
import { parseLegacyResume } from '../utils/legacyMigration';
import { ListSectionData, TableSectionData } from '../types/resume';

describe('legacyMigration', () => {
  it('sanitizes v4 imported payloads and fills missing defaults', () => {
    const migrated = parseLegacyResume({
      version: 4,
      meta: { theme: 'navy' },
      header: {
        fullName: '<b>Jane Doe</b><script>alert(1)</script>',
        links: [{ id: '1', text: 'Site', url: 'javascript:alert(1)', icon: 'globe' }],
      },
      sections: [
        {
          id: 's1',
          type: 'text',
          title: 'Summary:<img src=x onerror=alert(1)>',
          content: 'Built <strong>apps</strong>.',
        },
      ],
    });

    expect(migrated.meta.showPhoto).toBe(true);
    expect(migrated.meta.margin).toBe('normal');
    expect(migrated.header.fullName).toBe('<b>Jane Doe</b>');
    expect(migrated.header.links[0].url).toBe('#');
    expect(migrated.sections[0].title).toBe('Summary:');
  });

  it('migrates v3 HTML sections including ordered lists and tables safely', () => {
    const v3 = {
      theme: 'burgundy',
      sections: [
        {
          type: 'header',
          html: '<h1>John Smith</h1><div class="subtitle-line"><span>B.Tech</span><span>|</span><span>NIT</span></div><span class="link-item">john@example.com</span><span class="link-item" data-link-icon="github"><a href="github.com/js">GitHub</a></span>',
        },
        {
          type: 'section',
          html: '<div class="section-title">Achievements</div><ol><li>First <script>bad()</script></li><li>Second</li></ol>',
        },
        {
          type: 'section',
          html: '<div class="section-title">Academics</div><table><tr><th>Year</th><th>Grade</th></tr><tr><td>2025</td><td>9.1</td></tr></table>',
        },
      ],
    };

    const res = parseLegacyResume(v3);
    expect(res.meta.theme).toBe('burgundy');
    expect(res.header.fullName).toBe('John Smith');
    expect(res.header.email).toBe('john@example.com');
    expect(res.header.links[0].url).toBe('https://github.com/js');

    const listSec = res.sections[0] as ListSectionData;
    expect(listSec.type).toBe('list');
    expect(listSec.listType).toBe('numbered');
    expect(listSec.items[0]).toBe('First ');

    const tableSec = res.sections[1] as TableSectionData;
    expect(tableSec.type).toBe('table');
    expect(tableSec.headers).toEqual(['Year', 'Grade']);
  });
});
