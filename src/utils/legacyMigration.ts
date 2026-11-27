import { DEFAULT_RESUME_DATA } from '../constants/themes';
import { createUniqueId, escapeHtml, sanitizeLinkUrl, sanitizeRichTextHtml } from './sanitize';
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

function sanitizeHeaderData(header: ResumeData['header']): ResumeData['header'] {
  return {
    fullName: sanitizeRichTextHtml(header.fullName),
    degreeTitle: sanitizeRichTextHtml(header.degreeTitle),
    universityCompany: sanitizeRichTextHtml(header.universityCompany),
    location: sanitizeRichTextHtml(header.location),
    email: sanitizeRichTextHtml(header.email),
    phone: sanitizeRichTextHtml(header.phone),
    links: (header.links || []).map((link, idx) => ({
      id: link.id || createUniqueId(`link-${idx}`),
      text: sanitizeRichTextHtml(link.text || 'Link'),
      url: sanitizeLinkUrl(link.url || '#'),
      icon: (link.icon as LinkIconType) || 'globe',
    })),
  };
}

function sanitizeSections(sections: SectionData[]): SectionData[] {
  return sections.map((sec) => {
    const title = sanitizeRichTextHtml(sec.title);
    if (sec.type === 'text') {
      return { ...sec, title, content: sanitizeRichTextHtml(sec.content) };
    }
    if (sec.type === 'list') {
      return { ...sec, title, items: sec.items.map((item) => sanitizeRichTextHtml(item)) };
    }
    if (sec.type === 'table') {
      return {
        ...sec,
        title,
        headers: sec.headers ? sec.headers.map((h) => sanitizeRichTextHtml(h)) : undefined,
        rows: sec.rows.map((row) => row.map((cell) => sanitizeRichTextHtml(cell))),
      };
    }
    return { ...sec, title };
  });
}

export function parseLegacyResume(data: any): ResumeData {
  if (!data) return DEFAULT_RESUME_DATA;

  // Already modern schema: merge any missing fields from defaults
  if (data.version === 4 && data.sections && data.header) {
    const merged: ResumeData = {
      ...DEFAULT_RESUME_DATA,
      ...data,
      meta: { ...DEFAULT_RESUME_DATA.meta, ...data.meta },
      header: sanitizeHeaderData({ ...DEFAULT_RESUME_DATA.header, ...data.header }),
      declaration: {
        ...DEFAULT_RESUME_DATA.declaration,
        ...data.declaration,
        text: sanitizeRichTextHtml(data.declaration?.text ?? DEFAULT_RESUME_DATA.declaration.text),
        place: sanitizeRichTextHtml(data.declaration?.place ?? DEFAULT_RESUME_DATA.declaration.place),
        date: sanitizeRichTextHtml(data.declaration?.date ?? DEFAULT_RESUME_DATA.declaration.date),
        signature: sanitizeRichTextHtml(data.declaration?.signature ?? DEFAULT_RESUME_DATA.declaration.signature),
      },
      sections: sanitizeSections(data.sections || DEFAULT_RESUME_DATA.sections),
    };
    return merged;
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

  // Migrate newer meta fields (added in recent iterations)
  if (data.meta?.showPhoto !== undefined) result.meta.showPhoto = !!data.meta.showPhoto;
  else if (data.showPhoto !== undefined) result.meta.showPhoto = !!data.showPhoto;

  if (data.meta?.fitSignatureToPage !== undefined) result.meta.fitSignatureToPage = !!data.meta.fitSignatureToPage;
  else if (data.fitSignatureToPage !== undefined) result.meta.fitSignatureToPage = !!data.fitSignatureToPage;

  if (data.meta?.margin) result.meta.margin = data.meta.margin;
  else if (data.margin) result.meta.margin = data.margin;

  if (data.meta?.lineHeight) result.meta.lineHeight = data.meta.lineHeight;
  else if (data.lineHeight) result.meta.lineHeight = data.lineHeight;

  // Migrate declaration fields
  if (data.declaration?.signatureImage) result.declaration.signatureImage = data.declaration.signatureImage;
  else if (data.signatureImage) result.declaration.signatureImage = data.signatureImage;
  if (data.declaration?.place) result.declaration.place = data.declaration.place;
  if (data.declaration?.date) result.declaration.date = data.declaration.date;
  if (data.declaration?.signature) result.declaration.signature = data.declaration.signature;

  // Handle version 3 format (array of { type, html })
  if (Array.isArray(data.sections)) {
    const parsedSections: SectionData[] = [];

    data.sections.forEach((sec: { type: string; html: string }, index: number) => {
      const doc = parser.parseFromString(`<div>${sec.html}</div>`, 'text/html');
      const root = doc.body.firstElementChild as HTMLElement;
      if (!root) return;

      if (sec.type === 'header') {
        const h1 = root.querySelector('h1');
        const h1Text = h1?.textContent?.trim();
        if (h1Text) result.header.fullName = sanitizeRichTextHtml(escapeHtml(h1Text));

        const subSpans = root.querySelectorAll('.subtitle-line span');
        if (subSpans.length >= 1) {
          const deg = subSpans[0].textContent?.trim() || '';
          result.header.degreeTitle = deg ? sanitizeRichTextHtml(escapeHtml(deg)) : '';
        }
        if (subSpans.length >= 3) {
          const uni = subSpans[2].textContent?.trim() || '';
          result.header.universityCompany = uni ? sanitizeRichTextHtml(escapeHtml(uni)) : '';
        }

        const phoneEl = root.querySelector('.phone-number');
        const phoneText = phoneEl?.textContent?.trim();
        if (phoneText) result.header.phone = sanitizeRichTextHtml(escapeHtml(phoneText));

        const emailLink = Array.from(root.querySelectorAll('.link-item')).find((el) =>
          (el.textContent || '').includes('@') && !el.querySelector('a')
        );
        if (emailLink?.textContent) {
          const emailText = emailLink.textContent.trim();
          result.header.email = emailText ? sanitizeRichTextHtml(escapeHtml(emailText)) : result.header.email;
        }

        // Links
        const linkItems = root.querySelectorAll('.link-item');
        const parsedLinks: HeaderLink[] = [];
        linkItems.forEach((item, lIdx) => {
          const a = item.querySelector('a');
          if (a) {
            const iconKey = (item.getAttribute('data-link-icon') as LinkIconType) || 'globe';
            parsedLinks.push({
              id: createUniqueId(`link-${lIdx}`),
              text: sanitizeRichTextHtml(escapeHtml(a.textContent?.trim() || 'Link')),
              url: sanitizeLinkUrl(a.getAttribute('href') || '#'),
              icon: iconKey,
            });
          }
        });
        if (parsedLinks.length > 0) result.header.links = parsedLinks;
      } else if (sec.type === 'section') {
        const titleEl = root.querySelector('.section-title');
        const title = sanitizeRichTextHtml(escapeHtml(titleEl?.textContent?.trim() || 'Section:'));
        const sectionId = createUniqueId(`sec-${index}`);

        // Table section
        const table = root.querySelector('table');
        if (table) {
          const headers: string[] = [];
          table.querySelectorAll('tr th').forEach((th) => {
            headers.push(sanitizeRichTextHtml(th.innerHTML.trim()));
          });

          const rows: string[][] = [];
          const trs = table.querySelectorAll('tr');
          trs.forEach((tr) => {
            const tds = tr.querySelectorAll('td');
            if (tds.length > 0) {
              const rowCells: string[] = [];
              tds.forEach((td) => rowCells.push(sanitizeRichTextHtml(td.innerHTML.trim())));
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
        const ul = root.querySelector('ul, ol');
        if (ul) {
          const items: string[] = [];
          ul.querySelectorAll('li').forEach((li) => {
            items.push(sanitizeRichTextHtml(li.innerHTML.trim()));
          });
          const listSec: ListSectionData = {
            id: sectionId,
            type: 'list',
            title,
            items,
            listType: ul.tagName.toLowerCase() === 'ol' ? 'numbered' : 'bullet',
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
        let rawContent = '';
        if (p) {
          rawContent = p.innerHTML.trim();
        } else {
          const contentClone = root.cloneNode(true) as HTMLElement;
          contentClone.querySelectorAll('.section-title').forEach((el) => el.remove());
          rawContent = contentClone.innerHTML.trim();
        }
        const content = sanitizeRichTextHtml(rawContent);
        const textSec: TextSectionData = {
          id: sectionId,
          type: 'text',
          title,
          content,
        };
        parsedSections.push(textSec);
      } else if (sec.type === 'final') {
        const decl = root.querySelector('.declaration');
        const declText = decl?.textContent?.trim();
        if (declText) result.declaration.text = sanitizeRichTextHtml(escapeHtml(declText));
      }
    });

    if (parsedSections.length > 0) {
      result.sections = parsedSections;
    }
  }

  return result;
}
