import { ResumeData, SectionData, TableSectionData, ListSectionData, TextSectionData, LinkIconType } from '../types/resume';

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

export async function checkAvailableAiEngines(): Promise<{
  hasWindowAi: boolean;
  hasGeminiKey: boolean;
}> {
  const hasWindowAi = typeof window !== 'undefined' && Boolean((window as any).ai?.languageModel);
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
        technicalSkills.push(`● <strong>${cat.trim()}:</strong> ${items.trim()}`);
      } else {
        technicalSkills.push(line.replace(/^[•●-]\s*/, ''));
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
  apiKey: string
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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  const windowAi = (window as any).ai?.languageModel;
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

  // Career Objective
  if (parsed.careerObjective) {
    newSections.push({
      id: 'sec-objective',
      type: 'text',
      title: 'Career Objective:',
      content: parsed.careerObjective,
    } as TextSectionData);
  }

  // Academics Table
  if (parsed.academics && parsed.academics.rows.length > 0) {
    newSections.push({
      id: 'sec-academics',
      type: 'table',
      title: 'Academic Background:',
      headers: parsed.academics.headers || ['Year', 'Qualification', 'Institution / Board', 'Marks / CGPA'],
      rows: parsed.academics.rows,
      showColBorders: false,
    } as TableSectionData);
  }

  // Technical Skills
  if (parsed.technicalSkills && parsed.technicalSkills.length > 0) {
    const isFormattedTable = parsed.technicalSkills.some((s) => s.includes('<strong>') || s.includes(':'));
    if (isFormattedTable) {
      newSections.push({
        id: 'sec-techskills',
        type: 'table',
        title: 'Technical Skills:',
        rows: parsed.technicalSkills.map((s) => [s]),
        showColBorders: false,
      } as TableSectionData);
    } else {
      newSections.push({
        id: 'sec-techskills',
        type: 'list',
        title: 'Technical Skills:',
        items: parsed.technicalSkills,
        listType: 'bullet',
      } as ListSectionData);
    }
  }

  // Professional Skills
  if (parsed.professionalSkills && parsed.professionalSkills.length > 0) {
    newSections.push({
      id: 'sec-profskills',
      type: 'list',
      title: 'Professional Skills:',
      items: parsed.professionalSkills,
      listType: 'bullet',
    } as ListSectionData);
  }

  // Work Experience / Internships
  if (parsed.experience && parsed.experience.rows.length > 0) {
    newSections.push({
      id: 'sec-experience',
      type: 'table',
      title: 'Work Experience / Internships:',
      headers: parsed.experience.headers || ['Role / Company', 'Description', 'Duration'],
      rows: parsed.experience.rows,
      showColBorders: false,
    } as TableSectionData);
  }

  // Projects
  if (parsed.projects && parsed.projects.rows.length > 0) {
    newSections.push({
      id: 'sec-projects',
      type: 'table',
      title: 'Projects:',
      headers: parsed.projects.headers || ['Project Name', 'Role / Description / Technologies', 'Duration'],
      rows: parsed.projects.rows,
      showColBorders: false,
    } as TableSectionData);
  }

  // Personal Profile
  if (parsed.personalProfile && parsed.personalProfile.length > 0) {
    newSections.push({
      id: 'sec-profile',
      type: 'table',
      title: 'Personal Profile:',
      rows: parsed.personalProfile,
      variant: 'profile',
      showColBorders: false,
    } as TableSectionData);
  }

  // Map Header Links
  const headerLinks = (parsed.header.links || []).map((l, idx) => ({
    id: `link-ai-${idx + 1}`,
    text: l.text || 'Link',
    url: l.url || '#',
    icon: (l.icon as LinkIconType) || 'globe',
  }));

  const finalHeader = {
    fullName: parsed.header.fullName || current.header.fullName,
    degreeTitle: parsed.header.degreeTitle || current.header.degreeTitle,
    universityCompany: parsed.header.universityCompany || current.header.universityCompany,
    location: parsed.header.location || current.header.location,
    email: parsed.header.email || current.header.email,
    phone: parsed.header.phone || current.header.phone,
    links: headerLinks.length > 0 ? headerLinks : current.header.links,
  };

  const finalDeclaration = {
    text: parsed.declaration?.text || current.declaration.text,
    place: parsed.declaration?.place || current.declaration.place,
    date: parsed.declaration?.date || current.declaration.date,
    signature: parsed.declaration?.signature || current.declaration.signature,
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
