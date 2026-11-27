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

  it('handles skill lines ending with a trailing colon without throwing', () => {
    const sample = [
      'Rohan Das',
      'Technical Skills:',
      'Languages:',
      'Frameworks:   ',
      'Tools: Git, Docker',
    ].join('\n');

    expect(() => parseResumeHeuristically(sample)).not.toThrow();
    const parsed = parseResumeHeuristically(sample);
    expect(parsed.technicalSkills).toEqual([
      '● <strong>Languages:</strong>',
      '● <strong>Frameworks:</strong>',
      '● <strong>Tools:</strong> Git, Docker',
    ]);
  });

  it('normalizes academics pipe/tab rows to 4 columns and keeps multi-line projects intact', () => {
    const sample = [
      'Meera Iyer',
      'Academic Background:',
      '2021 - 2025 | B.Tech CSE | 9.2 CGPA',
      '2021 | Class XII | CBSE | Central School | 95%',
      'Projects:',
      'Distributed Cache Engine | Jan 2025 - Mar 2025',
      'Implemented a consistent hashing ring in C++ <vector> with lock-free reads and replication.',
      'Reduced p99 latency by over 40% across 8 nodes under synthetic load testing.',
      '',
      'Realtime Log Analyzer | Apr 2025',
      'Built streaming pipeline with Kafka and ClickHouse.',
    ].join('\n');

    const parsed = parseResumeHeuristically(sample);
    expect(parsed.academics?.rows).toEqual([
      ['2021 - 2025', 'B.Tech CSE', '9.2 CGPA', '-'],
      ['2021', 'Class XII', 'CBSE, Central School', '95%'],
    ]);
    expect(parsed.projects?.rows).toHaveLength(2);
    expect(parsed.projects?.rows[0][0]).toBe('Distributed Cache Engine');
    expect(parsed.projects?.rows[0][1]).toContain('consistent hashing ring');
    expect(parsed.projects?.rows[0][1]).toContain('Reduced p99 latency');
    expect(parsed.projects?.rows[1][0]).toBe('Realtime Log Analyzer');
  });

  it('escapes raw angle brackets and converts newlines cleanly in convertParsedToResumeData', () => {
    const converted = convertParsedToResumeData(
      {
        header: {
          fullName: 'Dev <Admin> & Lead',
          degreeTitle: 'B.Tech <CSE>',
          universityCompany: 'A & B Tech',
          location: 'Pune, India',
          email: 'dev@example.com',
          phone: '+91 99999 00000',
          links: [{ text: 'Docs <v2>', url: 'example.com/docs', icon: 'globe' }],
        },
        careerObjective: 'Line one with C++ <vector>\n\nLine two with GPA > 8.5',
        academics: {
          headers: ['Year', 'Degree <Hons>', 'College', 'Score'],
          rows: [['2025', 'B.Tech', 'NIT', 'GPA > 8.5']],
        },
        technicalSkills: [
          '● <strong>Languages:</strong> C++ <vector>, TypeScript <T>',
          'Python &amp; SQL',
        ],
        projects: {
          headers: ['Name', 'Details', 'Duration'],
          rows: [['Compiler', 'Built AST for C++ <vector>\nOptimized IR passes', '2025']],
        },
        experience: {
          headers: ['Role', 'Details', 'Duration'],
          rows: [['Intern', 'Latency < 10ms\nThroughput > 1k RPS', '2024']],
        },
        declaration: {
          text: 'True for <all> items\nSigned below',
          place: 'Pune <MH>',
          date: '01/01/2025',
          signature: 'Dev <Admin>',
        },
      },
      DEFAULT_RESUME_DATA,
      'replace'
    );

    expect(converted.header.fullName).toBe('Dev &lt;Admin&gt; &amp; Lead');
    expect(converted.header.links[0].text).toBe('Docs &lt;v2&gt;');

    const objSec = converted.sections.find((s) => s.id === 'sec-objective');
    expect(objSec?.type).toBe('text');
    if (objSec?.type === 'text') {
      expect(objSec.content).toBe('<div>Line one with C++ &lt;vector&gt;</div><div>Line two with GPA &gt; 8.5</div>');
    }

    const techSec = converted.sections.find((s) => s.id === 'sec-techskills');
    expect(techSec?.type).toBe('table');
    if (techSec?.type === 'table') {
      expect(techSec.rows[0][0]).toBe('● <strong>Languages:</strong> C++ &lt;vector&gt;, TypeScript &lt;T&gt;');
      expect(techSec.rows[1][0]).toBe('Python &amp; SQL');
    }

    const projSec = converted.sections.find((s) => s.id === 'sec-projects');
    if (projSec?.type === 'table') {
      expect(projSec.rows[0][1]).toBe('Built AST for C++ &lt;vector&gt;<br>Optimized IR passes');
    }

    const expSec = converted.sections.find((s) => s.id === 'sec-experience');
    if (expSec?.type === 'table') {
      expect(expSec.rows[0][1]).toBe('Latency &lt; 10ms<br>Throughput &gt; 1k RPS');
    }

    expect(converted.declaration.text).toBe('True for &lt;all&gt; items<br>Signed below');
    expect(converted.declaration.place).toBe('Pune &lt;MH&gt;');
  });
});
