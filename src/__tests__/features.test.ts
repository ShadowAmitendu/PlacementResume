import { describe, it, expect } from 'vitest';
import { DEFAULT_RESUME_DATA } from '../constants/themes';
import { RESUME_TEMPLATES } from '../constants/templates';
import { runResumePreflight } from '../utils/resumePreflight';
import { extractJdKeywords, analyzeJdMatch } from '../utils/jdMatcher';
import { rewriteTextLocally } from '../utils/bulletRewriter';
import {
  exportResumeToPlainText,
  exportResumeToMarkdown,
  exportResumeToDocxBlob,
} from '../utils/exporters';
import { parseLegacyResume } from '../utils/legacyMigration';

describe('PlacementResume new features', () => {
  it('detects placeholders, sample email/phone, links, and multi-page warnings in preflight', () => {
    const defaultIssues = runResumePreflight(DEFAULT_RESUME_DATA, 2);
    expect(defaultIssues.length).toBeGreaterThan(3);
    expect(defaultIssues.some((i) => i.category === 'placeholder')).toBe(true);
    expect(defaultIssues.some((i) => i.category === 'contact')).toBe(true);
    expect(defaultIssues.some((i) => i.category === 'link')).toBe(true);
    expect(defaultIssues.some((i) => i.category === 'pagination')).toBe(true);

    const sdeTemplate = RESUME_TEMPLATES.find((t) => t.id === 'software-tech')!.buildData();
    sdeTemplate.header.email = 'aarav.sharma@nit.ac.in';
    const cleanIssues = runResumePreflight(sdeTemplate, 1);
    expect(cleanIssues).toEqual([]);
  });

  it('extracts tech keywords and computes JD match score offline', async () => {
    const jd = 'Seeking React, TypeScript, Node.js, PostgreSQL, Docker, and Kubernetes experience.';
    const kws = extractJdKeywords(jd);
    expect(kws).toEqual(
      expect.arrayContaining(['react', 'typescript', 'node.js', 'postgresql', 'docker', 'kubernetes'])
    );

    const sdeTemplate = RESUME_TEMPLATES.find((t) => t.id === 'software-tech')!.buildData();
    const match = await analyzeJdMatch(sdeTemplate, jd, false);
    expect(match.matchedKeywords).toContain('typescript');
    expect(match.missingKeywords).toContain('kubernetes');
    expect(match.scorePct).toBeGreaterThan(60);
    expect(match.usedEngine).toBe('local');
  });

  it('rewrites weak passive bullets cleanly using local action verbs & tightener', () => {
    const bullet = 'worked on basically building the system in order to track orders as well as payments';
    const impact = rewriteTextLocally(bullet, 'impact');
    expect(impact).toMatch(/^Engineered /);
    expect(impact).not.toContain('basically');
    expect(impact).not.toContain('in order to');

    const tightened = rewriteTextLocally('created a tool that was built for fast logs', 'tighten');
    expect(tightened.startsWith('Architected')).toBe(true);
  });

  it('exports plain text, markdown, and valid ZIP/OOXML .docx blob', async () => {
    const sdeTemplate = RESUME_TEMPLATES.find((t) => t.id === 'software-tech')!.buildData();
    const txt = exportResumeToPlainText(sdeTemplate);
    expect(txt).toContain('Aarav Sharma');
    expect(txt).toContain('CloudScale Technologies');

    const md = exportResumeToMarkdown(sdeTemplate);
    expect(md).toContain('# Aarav Sharma');
    expect(md).toContain('## Technical Skills');

    const docx = exportResumeToDocxBlob(sdeTemplate);
    expect(docx.size).toBeGreaterThan(500);
    const bytes = new Uint8Array(await docx.arrayBuffer());
    // ZIP magic bytes: 'PK\x03\x04'
    expect(bytes[0]).toBe(0x50);
    expect(bytes[1]).toBe(0x4b);
    expect(bytes[2]).toBe(0x03);
    expect(bytes[3]).toBe(0x04);
  });

  it('round-trips entries, keyvalue, hidden, and pageBreakBefore through parseLegacyResume', () => {
    const sdeTemplate = RESUME_TEMPLATES.find((t) => t.id === 'software-tech')!.buildData();
    sdeTemplate.sections[0].hidden = true;
    sdeTemplate.sections[2].pageBreakBefore = true;

    const migrated = parseLegacyResume(JSON.parse(JSON.stringify(sdeTemplate)));
    expect(migrated.sections[0].hidden).toBe(true);
    expect(migrated.sections[2].pageBreakBefore).toBe(true);
    expect(migrated.sections.some((s) => s.type === 'entries')).toBe(true);
    expect(migrated.sections.some((s) => s.type === 'keyvalue')).toBe(true);
  });
});
