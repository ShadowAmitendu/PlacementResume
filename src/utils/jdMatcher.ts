import { ResumeData } from '../types/resume';
import { checkAvailableAiEngines } from './aiResumeParser';
import { extractResumePlainText } from './documentMetrics';

export interface JdMatchResult {
  scorePct: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  totalKeywords: number;
  aiSuggestions?: string[];
  usedEngine: 'gemini' | 'window-ai' | 'local';
}

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'of', 'in', 'on', 'at', 'to', 'for', 'with',
  'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'should', 'can', 'could', 'may', 'might', 'must',
  'this', 'that', 'these', 'those', 'we', 'you', 'our', 'your', 'they', 'their', 'about',
  'into', 'over', 'after', 'before', 'across', 'strong', 'good', 'excellent', 'experience',
  'years', 'year', 'role', 'team', 'work', 'working', 'ability', 'skills', 'knowledge',
  'required', 'preferred', 'plus', 'bonus', 'looking', 'candidate', 'candidates', 'build',
  'building', 'using', 'used', 'including', 'well', 'such', 'high', 'new', 'multiple', 'make',
  'job', 'position', 'company', 'opportunity', 'join', 'must', 'equivalent', 'degree', 'bachelor',
  'master', 'engineering', 'computer', 'science', 'related', 'field', 'familiarity', 'understanding',
  'proficient', 'hands', 'written', 'verbal', 'communication', 'problem', 'solving', 'fast',
  'paced', 'environment', 'deliver', 'maintain', 'write', 'clean', 'scalable', 'reliable',
]);

const KNOWN_TECH_TERMS = [
  'typescript', 'javascript', 'react', 'next.js', 'nextjs', 'node.js', 'nodejs', 'python',
  'java', 'c++', 'c#', 'go', 'golang', 'rust', 'sql', 'postgresql', 'mysql', 'mongodb',
  'redis', 'graphql', 'rest api', 'restful', 'docker', 'kubernetes', 'aws', 'gcp', 'azure',
  'terraform', 'ci/cd', 'git', 'linux', 'microservices', 'distributed systems', 'system design',
  'pytorch', 'tensorflow', 'scikit-learn', 'machine learning', 'deep learning', 'nlp', 'llm',
  'html', 'css', 'tailwind', 'express', 'spring boot', 'django', 'flask', 'fastapi',
  'kafka', 'elasticsearch', 'spark', 'hadoop', 'pandas', 'numpy', 'agile', 'scrum',
  'unit testing', 'jest', 'vitest', 'cypress', 'playwright', 'figma', 'dsa', 'oop', 'dbms',
];

function normalizeToken(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Extracts ranked skills and domain terms from a pasted Job Description cleanly.
 */
export function extractJdKeywords(jdText: string): string[] {
  const lower = jdText.toLowerCase();
  const seen = new Set<string>();
  const results: string[] = [];

  for (const term of KNOWN_TECH_TERMS) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?:^|[^a-z0-9+#.])${escaped}(?=$|[^a-z0-9+#.])`, 'i');
    if (re.test(lower) && !seen.has(term)) {
      seen.add(term);
      results.push(term);
    }
  }

  // Also capture capitalized product/framework tokens or frequent substantive words
  const freq = new Map<string, { count: number; display: string }>();
  const tokenMatches = jdText.match(/[A-Za-z][A-Za-z0-9.+#/-]{1,28}/g) || [];
  for (const rawTok of tokenMatches) {
    const clean = rawTok.replace(/^[./-]+|[.,:;!?/()-]+$/g, '');
    if (clean.length < 2) continue;
    const norm = clean.toLowerCase();
    if (STOPWORDS.has(norm) || seen.has(norm)) continue;
    const isProperOrTech = /[A-Z0-9+#.]/.test(clean.slice(1)) || /^[A-Z]/.test(clean);
    const prev = freq.get(norm);
    freq.set(norm, {
      count: (prev?.count || 0) + (isProperOrTech ? 2 : 1),
      display: prev?.display || clean,
    });
  }

  const extras = Array.from(freq.entries())
    .filter(([_, info]) => info.count >= 2)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, Math.max(0, 28 - results.length));

  for (const [norm, info] of extras) {
    if (!seen.has(norm)) {
      seen.add(norm);
      results.push(info.display);
    }
  }

  return results.slice(0, 30);
}

/**
 * Compares resume content against a Job Description locally, optionally enriched via AI.
 */
export async function analyzeJdMatch(
  resumeData: ResumeData,
  jdText: string,
  useAi = true
): Promise<JdMatchResult> {
  const resumeText = extractResumePlainText(resumeData, { includeHidden: false }).toLowerCase();
  const keywords = extractJdKeywords(jdText);

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const kw of keywords) {
    const escaped = kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?:^|[^a-z0-9+#.])${escaped}(?=$|[^a-z0-9+#.])`, 'i');
    if (re.test(resumeText)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  const totalKeywords = keywords.length;
  const scorePct = totalKeywords > 0 ? Math.round((matchedKeywords.length / totalKeywords) * 100) : 0;

  let aiSuggestions: string[] | undefined;
  let usedEngine: JdMatchResult['usedEngine'] = 'local';

  if (useAi && jdText.trim().length > 20) {
    const { hasGeminiKey, hasWindowAi } = await checkAvailableAiEngines();
    const prompt = `Compare this candidate resume to the target Job Description and provide 3 to 4 crisp, actionable bullet tips on missing skills or how to tailor bullets (do NOT fabricate experience). Return ONLY a JSON array of short strings.\n\nMissing keywords detected: ${missingKeywords.slice(0, 12).join(', ')}\n\nResume:\n${resumeText.slice(0, 3500)}\n\nJob Description:\n${jdText.slice(0, 2500)}`;

    if (hasGeminiKey) {
      try {
        const apiKey = (localStorage.getItem('placement_gemini_api_key') || '').trim();
        const model =
          localStorage.getItem('placement_gemini_selected_model') || 'gemini-2.5-flash';
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json', temperature: 0.25 },
            }),
          }
        );
        if (res.ok) {
          const payload = await res.json();
          const raw = payload.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            aiSuggestions = parsed.map(String).slice(0, 5);
            usedEngine = 'gemini';
          }
        }
      } catch {
        // Ignore and keep local result
      }
    } else if (hasWindowAi) {
      try {
        const aiObj = (window as any).ai?.languageModel || (window as any).LanguageModel;
        if (aiObj) {
          const session = await aiObj.create({ systemPrompt: 'Return strictly a JSON array of 3 concise tips.' });
          try {
            const raw = await session.prompt(prompt);
            const match = raw.match(/\[[\s\S]*\]/);
            if (match) {
              const parsed = JSON.parse(match[0]);
              if (Array.isArray(parsed)) {
                aiSuggestions = parsed.map(String).slice(0, 5);
                usedEngine = 'window-ai';
              }
            }
          } finally {
            session?.destroy?.();
          }
        }
      } catch {
        // Ignore
      }
    }
  }

  return {
    scorePct,
    matchedKeywords: matchedKeywords.map(normalizeToken).map((_, i) => matchedKeywords[i]),
    missingKeywords,
    totalKeywords,
    aiSuggestions,
    usedEngine,
  };
}
