import { ResumeData, SectionData, TableSectionData, ListSectionData, TextSectionData, LinkIconType } from '../types/resume';
import { createUniqueId, escapeHtml, sanitizeLinkUrl, sanitizeRichTextHtml } from './sanitize';

export interface ParsedResumeResult {
  header: {
    fullName: string;
    degreeTitle: string;
    universityCompany: string;
    location: string;
    email: string;
    phone: string;
    links: Array<{ text: string; url: string; icon: LinkIconType }>;
  };
  careerObjective?: string;
  academics?: {
    headers: string[];
    rows: string[][];
  };
  technicalSkills?: string[];
  professionalSkills?: string[];
  projects?: {
    headers: string[];
    rows: string[][];
  };
  experience?: {
    headers: string[];
    rows: string[][];
  };
  personalProfile?: string[][];
  declaration?: {
    text: string;
    place: string;
    date: string;
    signature: string;
  };
}

export type AiEngineType = 'auto' | 'gemini' | 'window-ai' | 'local';

export interface GeminiModelInfo {
  name: string; // e.g. "models/gemini-2.5-flash"
  id: string; // e.g. "gemini-2.5-flash"
  displayName: string; // e.g. "Gemini 2.5 Flash"
  description?: string;
  supportedGenerationMethods?: string[];
}

export const DEFAULT_GEMINI_MODELS: GeminiModelInfo[] = [
  {
    name: 'models/gemini-2.5-flash',
    id: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    description: 'Ultra-fast and cost-effective multimodal model for high-frequency tasks',
    supportedGenerationMethods: ['generateContent'],
  },
  {
    name: 'models/gemini-2.5-pro',
    id: 'gemini-2.5-pro',
    displayName: 'Gemini 2.5 Pro',
    description: 'Advanced reasoning model for complex structured extraction',
    supportedGenerationMethods: ['generateContent'],
  },
  {
    name: 'models/gemini-2.0-flash',
    id: 'gemini-2.0-flash',
    displayName: 'Gemini 2.0 Flash',
    description: 'Next-generation fast and capable model',
    supportedGenerationMethods: ['generateContent'],
  },
  {
    name: 'models/gemini-2.0-flash-lite',
    id: 'gemini-2.0-flash-lite',
    displayName: 'Gemini 2.0 Flash Lite',
    description: 'Lightweight, ultra-low latency model',
    supportedGenerationMethods: ['generateContent'],
  },
  {
    name: 'models/gemini-1.5-flash',
    id: 'gemini-1.5-flash',
    displayName: 'Gemini 1.5 Flash',
    description: 'Standard Gemini 1.5 Flash model with 1M token window',
    supportedGenerationMethods: ['generateContent'],
  },
  {
    name: 'models/gemini-1.5-pro',
    id: 'gemini-1.5-pro',
    displayName: 'Gemini 1.5 Pro',
    description: 'Mid-size multimodal model with 2M token window',
    supportedGenerationMethods: ['generateContent'],
  },
];

export async function fetchGeminiModels(
  apiKey: string,
  signal?: AbortSignal
): Promise<GeminiModelInfo[]> {
  if (!apiKey || apiKey.trim().length < 10) {
    return DEFAULT_GEMINI_MODELS;
  }

  const url = 'https://generativelanguage.googleapis.com/v1beta/models';
  const response = await fetch(url, {
    signal,
    headers: {
      'x-goog-api-key': apiKey.trim(),
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch Gemini models (${response.status})`);
  }

  const data = await response.json();
  const rawList: any[] = data.models || [];

  const filtered: GeminiModelInfo[] = rawList
    .filter((m) => {
      const methods: string[] = m.supportedGenerationMethods || [];
      const hasGenerate = methods.includes('generateContent');
      const isGemini = (m.name || '').toLowerCase().includes('gemini');
      return hasGenerate && isGemini;
    })
    .map((m) => {
      const rawName: string = m.name || '';
      const id = rawName.startsWith('models/') ? rawName.slice(7) : rawName;
      return {
        name: rawName.startsWith('models/') ? rawName : `models/${rawName}`,
        id,
        displayName: m.displayName || id,
        description: m.description || '',
        supportedGenerationMethods: m.supportedGenerationMethods,
      };
    });

  if (filtered.length === 0) {
    return DEFAULT_GEMINI_MODELS;
  }

  // Sort so recommended models appear at the top
  filtered.sort((a, b) => {
    const rank = (id: string) => {
      if (id.includes('2.5-flash')) return 100;
      if (id.includes('2.5-pro')) return 90;
      if (id.includes('2.0-flash')) return 80;
      if (id.includes('2.0-flash-lite')) return 75;
      if (id.includes('1.5-flash')) return 60;
      if (id.includes('1.5-pro')) return 50;
      if (id.includes('flash')) return 40;
      if (id.includes('pro')) return 30;
      return 10;
    };
    return rank(b.id) - rank(a.id);
  });

  return filtered;
}

export async function checkAvailableAiEngines(): Promise<{
  hasWindowAi: boolean;
  hasGeminiKey: boolean;
}> {
  const hasWindowAi =
    typeof window !== 'undefined' &&
    Boolean((window as any).ai?.languageModel || (window as any).LanguageModel);
  const geminiKey = typeof window !== 'undefined' ? localStorage.getItem('placement_gemini_api_key') : null;
  return {
    hasWindowAi,
    hasGeminiKey: Boolean(geminiKey && geminiKey.trim().length > 10),
  };
}

/**
 * 1. Heuristic Rule-Based / NLP Instant Local Parser
 */
export function parseResumeHeuristically(rawText: string): ParsedResumeResult {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Extract Email
  const emailMatch = rawText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  const email = emailMatch ? emailMatch[0] : '';

  // Extract Phone Number
  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+91[-.\s]?\d{10}|\b\d{10}\b/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // Extract Links
  const links: Array<{ text: string; url: string; icon: LinkIconType }> = [];
  const githubMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9_-]+)/i);
  if (githubMatch) {
    links.push({
      text: 'GitHub',
      url: githubMatch[0].startsWith('http') ? githubMatch[0] : `https://${githubMatch[0]}`,
      icon: 'github',
    });
  }

  const linkedinMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|pub)\/([A-Za-z0-9_-]+)/i);
  if (linkedinMatch) {
    links.push({
      text: 'LinkedIn',
      url: linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://${linkedinMatch[0]}`,
      icon: 'linkedin',
    });
  }

  const portfolioMatch = rawText.match(/https?:\/\/(?!github\.com|linkedin\.com)[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?:\/[^\s]*)?/i);
  if (portfolioMatch) {
    links.push({
      text: 'Portfolio',
      url: portfolioMatch[0],
      icon: 'globe',
    });
  }

  // Extract Name (First 1-3 prominent lines that aren't "Resume" or contact info)
  let fullName = '';
  let degreeTitle = '';
  let universityCompany = '';
  let location = '';

  for (let i = 0; i < Math.min(8, lines.length); i++) {
    const line = lines[i];
    if (
      !fullName &&
      !line.includes('@') &&
      !line.match(/\d{5,}/) &&
      !/curriculum|resume|biodata|profile|page \d/i.test(line) &&
      line.split(/\s+/).length >= 1 &&
      line.split(/\s+/).length <= 4
    ) {
      fullName = line;
      continue;
    }
    if (fullName && !degreeTitle && /b\.?tech|b\.?e|m\.?tech|b\.?sc|bca|mca|engineer|developer|analyst/i.test(line)) {
      degreeTitle = line;
      continue;
    }
    if (fullName && !universityCompany && /university|institute|college|school|technologies|solutions|ltd|inc/i.test(line)) {
      universityCompany = line;
      continue;
    }
    if (!location && /(?:city|state|india|kolkata|delhi|mumbai|bangalore|pune|hyderabad|chennai|[A-Za-z]+,\s*[A-Za-z]+)/i.test(line)) {
      location = line.replace(/mobile:?.*|email:?.*/i, '').trim();
    }
  }

  if (!fullName && lines.length > 0) {
    fullName = lines[0];
  }

  // Section Segmentation
  const sectionKeywords: Record<string, string[]> = {
    objective: ['career objective', 'objective', 'professional summary', 'summary'],
    academics: ['academic background', 'education', 'educational qualifications', 'academics'],
    techSkills: ['technical skills', 'skills', 'key skills', 'competencies', 'technologies'],
    profSkills: ['professional skills', 'soft skills', 'strengths'],
    projects: ['projects', 'academic projects', 'personal projects', 'key projects'],
    experience: ['experience', 'work experience', 'employment', 'internships', 'work history'],
    profile: ['personal profile', 'personal details', 'personal information'],
    declaration: ['declaration'],
  };

  const sectionsFound: Record<string, string[]> = {};
  let currentSecKey = 'header';

  for (const line of lines) {
    const lower = line.toLowerCase();
    let matchedSec = '';

    for (const [key, patterns] of Object.entries(sectionKeywords)) {
      if (patterns.some((p) => lower === p || lower.startsWith(p + ':') || lower.startsWith(p + ' :'))) {
        matchedSec = key;
        break;
      }
    }

    if (matchedSec) {
      currentSecKey = matchedSec;
      sectionsFound[currentSecKey] = [];
    } else if (currentSecKey !== 'header') {
      if (!sectionsFound[currentSecKey]) sectionsFound[currentSecKey] = [];
      sectionsFound[currentSecKey].push(line);
    }
  }

  // Parse Career Objective
  let careerObjective = '';
  if (sectionsFound.objective && sectionsFound.objective.length > 0) {
    careerObjective = sectionsFound.objective.join(' ').replace(/^objective:?\s*/i, '').trim();
  }

  // Parse Academics Table
  const academicRows: string[][] = [];
  if (sectionsFound.academics) {
    let currentRow: string[] = [];
    for (const line of sectionsFound.academics) {
      const yearMatch = line.match(/\b(20\d\d(?:\s*[-–]\s*(?:20\d\d|present|\d\d))?|19\d\d)\b/i);
      const cgpaMatch = line.match(/\b(?:\d{1,2}(?:\.\d{1,2})?\s*(?:%|cgpa|gpa)|\d\.\d{1,2})\b/i);
      if (yearMatch || cgpaMatch || /b\.?tech|m\.?tech|b\.?sc|higher secondary|secondary|class xii|class x|diploma/i.test(line)) {
        if (currentRow.length >= 2) {
          while (currentRow.length < 4) currentRow.push('-');
          academicRows.push(currentRow);
          currentRow = [];
        }
      }
      if (line.includes('|') || line.includes('\t')) {
        const parts = line.split(/[|\t]+/).map((p) => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          academicRows.push(parts);
          continue;
        }
      }
      if (currentRow.length === 0 && yearMatch) {
        currentRow.push(yearMatch[0]);
        const rem = line.replace(yearMatch[0], '').trim();
        if (rem) currentRow.push(rem);
      } else if (currentRow.length > 0) {
        currentRow.push(line);
      }
    }
    if (currentRow.length >= 2) {
      while (currentRow.length < 4) currentRow.push('-');
      academicRows.push(currentRow);
    }
  }

  // Parse Technical Skills
  const technicalSkills: string[] = [];
  if (sectionsFound.techSkills) {
    for (const line of sectionsFound.techSkills) {
      if (line.includes(':')) {
        const [cat, items] = line.split(/:\s*(.+)/);
        technicalSkills.push(`● <strong>${escapeHtml(cat.trim())}:</strong> ${escapeHtml(items.trim())}`);
      } else {
        technicalSkills.push(escapeHtml(line.replace(/^[•●-]\s*/, '')));
      }
    }
  }

  // Parse Projects
  const projectRows: string[][] = [];
  if (sectionsFound.projects) {
    let currentProj: { name: string; desc: string; duration: string } = { name: '', desc: '', duration: '' };
    for (const line of sectionsFound.projects) {
      const dateMatch = line.match(/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\s*20\d\d(?:\s*[-–]\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\s*20\d\d|present)?\b/i);
      if (dateMatch && !currentProj.duration) {
        currentProj.duration = dateMatch[0];
      }
      if (!currentProj.name) {
        currentProj.name = line.replace(/^[•●-]\s*/, '');
      } else {
        currentProj.desc = currentProj.desc ? `${currentProj.desc} ${line}` : line;
      }
      if (currentProj.name && currentProj.desc.length > 40) {
        projectRows.push([currentProj.name, currentProj.desc, currentProj.duration || 'Duration']);
        currentProj = { name: '', desc: '', duration: '' };
      }
    }
    if (currentProj.name) {
      projectRows.push([currentProj.name, currentProj.desc || 'Project Description', currentProj.duration || 'Duration']);
    }
  }

  // Parse Personal Profile
  const personalProfile: string[][] = [];
  if (sectionsFound.profile) {
    for (const line of sectionsFound.profile) {
      if (line.includes(':')) {
        const [k, v] = line.split(/:\s*(.+)/);
        if (k && v) personalProfile.push([k.trim(), v.trim()]);
      }
    }
  }

  // Parse Declaration
  let declarationText = 'I hereby declare that the information given above is true and correct to the best of my knowledge.';
  let place = location.split(',')[0]?.trim() || '';
  if (sectionsFound.declaration && sectionsFound.declaration.length > 0) {
    declarationText = sectionsFound.declaration.join(' ').replace(/^declaration:?\s*/i, '').trim() || declarationText;
  }

  return {
    header: {
      fullName: fullName || '[Your Full Name]',
      degreeTitle: degreeTitle || '[Degree / Job Title]',
      universityCompany: universityCompany || '[University / Company]',
      location: location || '[City, State, Country]',
      email: email || '[your.email@example.com]',
      phone: phone || '+91 00000 00000',
      links: links.length > 0 ? links : [
        { text: 'GitHub', url: 'https://github.com/', icon: 'github' },
        { text: 'LinkedIn', url: 'https://linkedin.com/in/', icon: 'linkedin' },
        { text: 'Portfolio', url: '#', icon: 'globe' },
      ],
    },
    careerObjective: careerObjective || undefined,
    academics: academicRows.length > 0 ? {
      headers: ['Year', 'Qualification', 'Institution / Board', 'Marks / CGPA'],
      rows: academicRows,
    } : undefined,
    technicalSkills: technicalSkills.length > 0 ? technicalSkills : undefined,
    professionalSkills: sectionsFound.profSkills?.map((s) => s.replace(/^[•●-]\s*/, '')),
    projects: projectRows.length > 0 ? {
      headers: ['Project Name', 'Role / Description / Technologies', 'Duration'],
      rows: projectRows,
    } : undefined,
    personalProfile: personalProfile.length > 0 ? personalProfile : undefined,
    declaration: {
      text: declarationText,
      place: place || '___________',
      date: '___________',
      signature: fullName || 'Signature',
    },
  };
}

/**
 * 2. Google Gemini API In-Browser Parser
 */
export async function parseResumeWithGemini(
  rawText: string,
  apiKey: string,
  modelName: string = 'gemini-2.5-flash',
  signal?: AbortSignal
): Promise<ParsedResumeResult> {
  const systemInstruction = `
You are an expert resume parsing AI. Extract and structure the candidate's resume text into a strict, valid JSON object matching this schema:
{
  "header": {
    "fullName": "Candidate Full Name",
    "degreeTitle": "e.g. B.Tech Computer Science & Engineering",
    "universityCompany": "e.g. Institute of Engineering & Management",
    "location": "e.g. Kolkata, West Bengal, India",
    "email": "email@example.com",
    "phone": "+91 98765 43210",
    "links": [
      { "text": "GitHub", "url": "https://github.com/...", "icon": "github" },
      { "text": "LinkedIn", "url": "https://linkedin.com/in/...", "icon": "linkedin" },
      { "text": "Portfolio", "url": "https://...", "icon": "globe" }
    ]
  },
  "careerObjective": "Brief professional career summary",
  "academics": {
    "headers": ["Year", "Qualification", "Institution / Board", "Marks / CGPA"],
    "rows": [
      ["2020 - 2024", "B.Tech in CSE", "University Name", "8.9 CGPA"],
      ["2020", "Class XII (CBSE)", "School Name", "92%"]
    ]
  },
  "technicalSkills": [
    "● <strong>Languages:</strong> Python, Java, C++, TypeScript, SQL",
    "● <strong>Frameworks:</strong> React, Node.js, Express, Tailwind CSS"
  ],
  "professionalSkills": [
    "Problem Solving",
    "Agile Methodology",
    "Team Leadership"
  ],
  "projects": {
    "headers": ["Project Name", "Role / Description / Technologies", "Duration"],
    "rows": [
      ["Project Title", "Detailed description of what was built, your contribution, and tech stack.", "Duration / Month Year"]
    ]
  },
  "experience": {
    "headers": ["Role / Company", "Key Responsibilities & Achievements", "Duration"],
    "rows": [
      ["Software Engineer Intern at XYZ", "Implemented features and optimized performance.", "May 2023 - Jul 2023"]
    ]
  },
  "personalProfile": [
    ["Date of birth", "DD/MM/YYYY"],
    ["Gender / Nationality", "Male / Indian"],
    ["Languages known", "English, Hindi"]
  ],
  "declaration": {
    "text": "I hereby declare that the information given above is true and correct to the best of my knowledge.",
    "place": "City name",
    "date": "",
    "signature": "Candidate Name"
  }
}
Return ONLY valid JSON.
`;

  const cleanModel = modelName.replace(/^models\//, '');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent`;

  const response = await fetch(url, {
    signal,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey.trim(),
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemInstruction}\n\nResume Document Content:\n${rawText}` },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API request failed (${response.status})`);
  }

  const data = await response.json();
  const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textOutput) {
    throw new Error('Gemini API returned an empty response.');
  }

  const parsed = JSON.parse(textOutput);
  return parsed as ParsedResumeResult;
}

/**
 * 3. Chrome Built-in AI (Prompt API / Gemini Nano)
 */
export async function parseResumeWithWindowAi(rawText: string): Promise<ParsedResumeResult> {
  const windowAi = (window as any).ai?.languageModel || (window as any).LanguageModel;
  if (!windowAi) {
    throw new Error('Chrome Built-in AI is not available in this browser.');
  }

  const session = await windowAi.create({
    systemPrompt: 'You are an expert resume parsing AI. Extract the resume text into structured JSON matching header, academics, technicalSkills, projects, and declaration.',
  });

  const prompt = `Parse the following resume into JSON with keys "header" (fullName, degreeTitle, universityCompany, location, email, phone, links), "careerObjective", "academics" (headers, rows), "technicalSkills" (array of strings), "projects" (headers, rows), "declaration":\n\n${rawText}`;

  const response = await session.prompt(prompt);
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Built-in AI did not return a valid JSON structure.');
  }

  return JSON.parse(jsonMatch[0]) as ParsedResumeResult;
}

/**
 * 4. Convert Parsed Result into PlacementResume Document Data Structure
 */
export function convertParsedToResumeData(
  parsed: ParsedResumeResult,
  current: ResumeData,
  mode: 'replace' | 'merge' = 'replace'
): ResumeData {
  const newSections: SectionData[] = [];
  const nextId = (base: string) => (mode === 'merge' ? createUniqueId(base) : base);

  // Career Objective
  if (parsed.careerObjective) {
    newSections.push({
      id: nextId('sec-objective'),
      type: 'text',
      title: 'Career Objective:',
      content: sanitizeRichTextHtml(parsed.careerObjective),
    } as TextSectionData);
  }

  // Academics Table
  if (parsed.academics && parsed.academics.rows.length > 0) {
    newSections.push({
      id: nextId('sec-academics'),
      type: 'table',
      title: 'Academic Background:',
      headers: (parsed.academics.headers || ['Year', 'Qualification', 'Institution / Board', 'Marks / CGPA']).map(sanitizeRichTextHtml),
      rows: parsed.academics.rows.map((r) => r.map(sanitizeRichTextHtml)),
      showColBorders: false,
    } as TableSectionData);
  }

  // Technical Skills
  if (parsed.technicalSkills && parsed.technicalSkills.length > 0) {
    const isFormattedTable = parsed.technicalSkills.some((s) => s.includes('<strong>') || s.includes(':'));
    if (isFormattedTable) {
      newSections.push({
        id: nextId('sec-techskills'),
        type: 'table',
        title: 'Technical Skills:',
        rows: parsed.technicalSkills.map((s) => [sanitizeRichTextHtml(s)]),
        showColBorders: false,
      } as TableSectionData);
    } else {
      newSections.push({
        id: nextId('sec-techskills'),
        type: 'list',
        title: 'Technical Skills:',
        items: parsed.technicalSkills.map(sanitizeRichTextHtml),
        listType: 'bullet',
      } as ListSectionData);
    }
  }

  // Professional Skills
  if (parsed.professionalSkills && parsed.professionalSkills.length > 0) {
    newSections.push({
      id: nextId('sec-profskills'),
      type: 'list',
      title: 'Professional Skills:',
      items: parsed.professionalSkills.map(sanitizeRichTextHtml),
      listType: 'bullet',
    } as ListSectionData);
  }

  // Work Experience / Internships
  if (parsed.experience && parsed.experience.rows.length > 0) {
    newSections.push({
      id: nextId('sec-experience'),
      type: 'table',
      title: 'Work Experience / Internships:',
      headers: (parsed.experience.headers || ['Role / Company', 'Description', 'Duration']).map(sanitizeRichTextHtml),
      rows: parsed.experience.rows.map((r) => r.map(sanitizeRichTextHtml)),
      showColBorders: false,
    } as TableSectionData);
  }

  // Projects
  if (parsed.projects && parsed.projects.rows.length > 0) {
    newSections.push({
      id: nextId('sec-projects'),
      type: 'table',
      title: 'Projects:',
      headers: (parsed.projects.headers || ['Project Name', 'Role / Description / Technologies', 'Duration']).map(sanitizeRichTextHtml),
      rows: parsed.projects.rows.map((r) => r.map(sanitizeRichTextHtml)),
      showColBorders: false,
    } as TableSectionData);
  }

  // Personal Profile
  if (parsed.personalProfile && parsed.personalProfile.length > 0) {
    newSections.push({
      id: nextId('sec-profile'),
      type: 'table',
      title: 'Personal Profile:',
      rows: parsed.personalProfile.map((r) => r.map(sanitizeRichTextHtml)),
      variant: 'profile',
      showColBorders: false,
    } as TableSectionData);
  }

  // Map Header Links
  const headerLinks = (parsed.header.links || []).map((l, idx) => ({
    id: createUniqueId(`link-ai-${idx + 1}`),
    text: sanitizeRichTextHtml(l.text || 'Link'),
    url: sanitizeLinkUrl(l.url || '#'),
    icon: (l.icon as LinkIconType) || 'globe',
  }));

  const finalHeader = {
    fullName: sanitizeRichTextHtml(parsed.header.fullName || current.header.fullName),
    degreeTitle: sanitizeRichTextHtml(parsed.header.degreeTitle || current.header.degreeTitle),
    universityCompany: sanitizeRichTextHtml(parsed.header.universityCompany || current.header.universityCompany),
    location: sanitizeRichTextHtml(parsed.header.location || current.header.location),
    email: sanitizeRichTextHtml(parsed.header.email || current.header.email),
    phone: sanitizeRichTextHtml(parsed.header.phone || current.header.phone),
    links: headerLinks.length > 0 ? headerLinks : current.header.links,
  };

  const finalDeclaration = {
    text: sanitizeRichTextHtml(parsed.declaration?.text || current.declaration.text),
    place: sanitizeRichTextHtml(parsed.declaration?.place || current.declaration.place),
    date: sanitizeRichTextHtml(parsed.declaration?.date || current.declaration.date),
    signature: sanitizeRichTextHtml(parsed.declaration?.signature || current.declaration.signature),
    signatureImage: current.declaration.signatureImage,
  };

  if (mode === 'merge') {
    // Merge: keep current sections, but update header, declaration, and add new non-overlapping sections
    const existingTitles = new Set(current.sections.map((s) => s.title.toLowerCase().trim()));
    const mergedSections = [...current.sections];
    for (const sec of newSections) {
      if (!existingTitles.has(sec.title.toLowerCase().trim())) {
        mergedSections.push(sec);
      }
    }
    return {
      ...current,
      header: finalHeader,
      sections: mergedSections,
      declaration: finalDeclaration,
    };
  }

  // Replace mode: replace all sections with new structured sections
  return {
    ...current,
    header: finalHeader,
    sections: newSections.length > 0 ? newSections : current.sections,
    declaration: finalDeclaration,
  };
}
