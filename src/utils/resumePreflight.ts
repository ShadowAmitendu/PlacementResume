import {
  ResumeData,
  TextSectionData,
  ListSectionData,
  TableSectionData,
  EntriesSectionData,
  KeyValueSectionData,
} from '../types/resume';
import { htmlToPlainText } from './documentMetrics';

export type PreflightSeverity = 'warning' | 'info';

export interface PreflightIssue {
  id: string;
  severity: PreflightSeverity;
  category: 'placeholder' | 'link' | 'pagination' | 'contact';
  title: string;
  detail: string;
}

const BRACKET_PLACEHOLDER_RE = /\[[^\[\]\n]{3,60}\]/g;

function scanPlaceholders(rawHtml: string | undefined, locationLabel: string, out: PreflightIssue[]) {
  if (!rawHtml) return;
  const plain = htmlToPlainText(rawHtml);
  const matches = plain.match(BRACKET_PLACEHOLDER_RE);
  if (matches && matches.length > 0) {
    out.push({
      id: `ph-${out.length}-${locationLabel}`,
      severity: 'warning',
      category: 'placeholder',
      title: `Unreplaced placeholder in ${locationLabel}`,
      detail: `Found ${matches.slice(0, 2).join(', ')}`,
    });
  }
}

/**
 * Inspects a resume before printing/PDF export for template placeholders,
 * dummy contact/URLs, or slight multi-page spillovers.
 */
export function runResumePreflight(data: ResumeData, pageCount = 1): PreflightIssue[] {
  const issues: PreflightIssue[] = [];

  // 1. Header contact & placeholder checks
  scanPlaceholders(data.header.fullName, 'Full Name', issues);
  scanPlaceholders(data.header.degreeTitle, 'Degree / Title', issues);
  scanPlaceholders(data.header.universityCompany, 'University / Company', issues);
  scanPlaceholders(data.header.location, 'Location', issues);

  const plainEmail = htmlToPlainText(data.header.email).trim().toLowerCase();
  if (!plainEmail || plainEmail.includes('example.com') || plainEmail.includes('your.email')) {
    issues.push({
      id: 'contact-email',
      severity: 'warning',
      category: 'contact',
      title: 'Update sample email address',
      detail: `Current email is "${plainEmail || 'empty'}". Replace it with your active email.`,
    });
  }

  const plainPhone = htmlToPlainText(data.header.phone).trim();
  if (!plainPhone || plainPhone.includes('00000')) {
    issues.push({
      id: 'contact-phone',
      severity: 'warning',
      category: 'contact',
      title: 'Update sample phone number',
      detail: `Phone appears to use sample digits ("${plainPhone || 'empty'}").`,
    });
  }

  // 2. Links validation
  data.header.links.forEach((link) => {
    const label = htmlToPlainText(link.text).trim() || 'Link';
    const url = (link.url || '').trim();
    if (!url || url === '#' || url === 'https://github.com/' || url === 'https://linkedin.com/in/') {
      issues.push({
        id: `link-${link.id}`,
        severity: 'warning',
        category: 'link',
        title: `Generic or empty URL on "${label}"`,
        detail: `Click the link badge in your header to add your full ${label} profile URL.`,
      });
    }
  });

  // 3. Visible section placeholders
  data.sections.forEach((sec) => {
    if (sec.hidden) return;
    const secLabel = htmlToPlainText(sec.title).replace(/:$/, '').trim() || 'Section';
    if (sec.type === 'text') {
      scanPlaceholders((sec as TextSectionData).content, secLabel, issues);
    } else if (sec.type === 'list') {
      (sec as ListSectionData).items.forEach((item, i) =>
        scanPlaceholders(item, `${secLabel} (item ${i + 1})`, issues)
      );
    } else if (sec.type === 'table') {
      const t = sec as TableSectionData;
      t.headers?.forEach((h, i) => scanPlaceholders(h, `${secLabel} header ${i + 1}`, issues));
      t.rows.forEach((row, r) =>
        row.forEach((cell) => scanPlaceholders(cell, `${secLabel} row ${r + 1}`, issues))
      );
    } else if (sec.type === 'entries') {
      (sec as EntriesSectionData).entries.forEach((entry, i) => {
        scanPlaceholders(entry.heading, `${secLabel} entry ${i + 1}`, issues);
        scanPlaceholders(entry.subheading, `${secLabel} entry ${i + 1}`, issues);
        entry.bullets.forEach((b) => scanPlaceholders(b, `${secLabel} entry ${i + 1}`, issues));
      });
    } else if (sec.type === 'keyvalue') {
      (sec as KeyValueSectionData).pairs.forEach((p, i) => {
        scanPlaceholders(p.label, `${secLabel} row ${i + 1}`, issues);
        scanPlaceholders(p.value, `${secLabel} row ${i + 1}`, issues);
      });
    }
  });

  // 4. Declaration checks
  if (data.meta.showDeclaration) {
    const place = htmlToPlainText(data.declaration.place).trim();
    const date = htmlToPlainText(data.declaration.date).trim();
    if (/^_+$/.test(place) || /^_+$/.test(date)) {
      issues.push({
        id: 'decl-blanks',
        severity: 'info',
        category: 'placeholder',
        title: 'Blank Place or Date in Declaration',
        detail: 'Your Declaration still has underscore placeholders ("___________").',
      });
    }
  }

  // 5. Pagination warning when exceeding 1 A4 page
  if (pageCount > 1) {
    issues.push({
      id: 'page-overflow',
      severity: 'info',
      category: 'pagination',
      title: `Resume currently spans ${pageCount} A4 pages`,
      detail: 'If you are aiming for a strict 1-page campus placement resume, use "Tighten to 1 Page".',
    });
  }

  return issues;
}
