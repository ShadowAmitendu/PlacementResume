import { DEFAULT_RESUME_DATA } from '../constants/themes';
import {
  ResumeData,
  SectionData,
  HeaderLink,
  LinkIconType,
  TableSectionData,
  ListSectionData,
  TextSectionData,
  DividerSectionData,
} from '../types/resume';

export function parseLegacyResume(data: any): ResumeData {
  if (!data) return DEFAULT_RESUME_DATA;

  // Already modern schema
  if (data.version === 4 && data.sections && data.header) {
    return data as ResumeData;
  }

  const parser = new DOMParser();
  const result: ResumeData = JSON.parse(JSON.stringify(DEFAULT_RESUME_DATA));

  // Meta properties
  if (data.theme) result.meta.theme = data.theme;
  if (data.font) result.meta.font = data.font;
  if (data.marker !== undefined) result.meta.marker = data.marker;
  if (data.tableStyle) result.meta.tableStyle = data.tableStyle;
  if (data.photo) result.meta.photo = data.photo;
  if (data.zoom) result.meta.zoom = parseFloat(data.zoom) || 1;
  if (data.showLinkIcons !== undefined) {
    result.meta.showLinkIcons = !!data.showLinkIcons;
  } else if (data.hideLinkIcons !== undefined) {
    result.meta.showLinkIcons = !data.hideLinkIcons;
  }

  // Handle version 3 format (array of { type, html })
  if (Array.isArray(data.sections)) {
    const parsedSections: SectionData[] = [];

    data.sections.forEach((sec: { type: string; html: string }, index: number) => {
      const doc = parser.parseFromString(`<div>${sec.html}</div>`, 'text/html');
      const root = doc.body.firstElementChild as HTMLElement;
      if (!root) return;

      if (sec.type === 'header') {
        const h1 = root.querySelector('h1');
        if (h1) result.header.fullName = h1.textContent?.trim() || result.header.fullName;

        const subSpans = root.querySelectorAll('.subtitle-line span');
        if (subSpans.length >= 1) result.header.degreeTitle = subSpans[0].textContent?.trim() || '';
        if (subSpans.length >= 3) result.header.universityCompany = subSpans[2].textContent?.trim() || '';

        const phoneEl = root.querySelector('.phone-number');
        if (phoneEl) result.header.phone = phoneEl.textContent?.trim() || result.header.phone;

        // Links
        const linkItems = root.querySelectorAll('.link-item');
        const parsedLinks: HeaderLink[] = [];
        linkItems.forEach((item, lIdx) => {
          const a = item.querySelector('a');
          if (a) {
            const iconKey = (item.getAttribute('data-link-icon') as LinkIconType) || 'globe';
            parsedLinks.push({
              id: `link-${lIdx}`,
              text: a.textContent?.trim() || 'Link',
              url: a.getAttribute('href') || '#',
              icon: iconKey,
            });
          }
        });
        if (parsedLinks.length > 0) result.header.links = parsedLinks;
      } else if (sec.type === 'section') {
        const titleEl = root.querySelector('.section-title');
        const title = titleEl?.textContent?.trim() || 'Section:';
        const sectionId = `sec-${index}-${Date.now()}`;

        // Table section
        const table = root.querySelector('table');
        if (table) {
          const headers: string[] = [];
          table.querySelectorAll('tr th').forEach((th) => {
            headers.push(th.innerHTML.trim());
          });

          const rows: string[][] = [];
          const trs = table.querySelectorAll('tr');
          trs.forEach((tr) => {
            const tds = tr.querySelectorAll('td');
            if (tds.length > 0) {
              const rowCells: string[] = [];
              tds.forEach((td) => rowCells.push(td.innerHTML.trim()));
              rows.push(rowCells);
            }
          });

          const isProfile = table.classList.contains('profile-table');
          const tableSec: TableSectionData = {
            id: sectionId,
            type: 'table',
            title,
            rows,
            headers: headers.length > 0 ? headers : undefined,
            variant: isProfile ? 'profile' : 'striped',
            showColBorders: table.classList.contains('show-col-borders'),
          };
          parsedSections.push(tableSec);
          return;
        }

        // List section
        const ul = root.querySelector('ul');
        if (ul) {
          const items: string[] = [];
          ul.querySelectorAll('li').forEach((li) => {
            items.push(li.innerHTML.trim());
          });
          const listSec: ListSectionData = {
            id: sectionId,
            type: 'list',
            title,
            items,
          };
          parsedSections.push(listSec);
          return;
        }

        // HR section
        if (root.querySelector('hr')) {
          const hrSec: DividerSectionData = {
            id: sectionId,
            type: 'hr',
            title: '',
          };
          parsedSections.push(hrSec);
          return;
        }

        // Text paragraph section
        const p = root.querySelector('p');
        const content = p ? p.innerHTML.trim() : root.innerHTML.trim();
        const textSec: TextSectionData = {
          id: sectionId,
          type: 'text',
          title,
          content,
        };
        parsedSections.push(textSec);
      } else if (sec.type === 'final') {
        const decl = root.querySelector('.declaration');
        if (decl) result.declaration.text = decl.textContent?.trim() || result.declaration.text;
      }
    });

    if (parsedSections.length > 0) {
      result.sections = parsedSections;
    }
  }

  return result;
}
