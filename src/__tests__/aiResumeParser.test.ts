import { describe, it, expect } from 'vitest';
import { DEFAULT_RESUME_DATA } from '../constants/themes';
import { parseResumeHeuristically, convertParsedToResumeData } from '../utils/aiResumeParser';

describe('aiResumeParser', () => {
  it('extracts contact info and escapes angle-bracket skill text', () => {
    const sample = [
      'Aarav Sharma',
      'B.Tech Computer Science',
      'Example Institute of Technology',
      'Bengaluru, India',
      'aarav@example.com | +91 98765 43210',
      'https://github.com/aaravsharma https://linkedin.com/in/aarav',
      'Technical Skills:',
      'Languages: C++ <vector>, TypeScript <T> & Python',
    ].join('\n');

    const parsed = parseResumeHeuristically(sample);
    expect(parsed.header.fullName).toBe('Aarav Sharma');
    expect(parsed.header.email).toBe('aarav@example.com');
    expect(parsed.header.links.some((l) => l.icon === 'github')).toBe(true);
    expect(parsed.technicalSkills?.[0]).toContain('&lt;vector&gt;');
    expect(parsed.technicalSkills?.[0]).toContain('&lt;T&gt;');
  });

  it('creates unique section IDs when merging into an existing resume', () => {
    const parsed = parseResumeHeuristically(
      'Priya Nair\nExperience:\nIntern | Built APIs | May 2025'
    );
    const merged = convertParsedToResumeData(parsed, DEFAULT_RESUME_DATA, 'merge');
    const ids = merged.sections.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
