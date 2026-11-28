import { AiEngineType, checkAvailableAiEngines } from './aiResumeParser';

export type RewriteMode = 'impact' | 'tighten' | 'executive';

export interface RewriteResult {
  rewritten: string;
  usedEngine: 'gemini' | 'window-ai' | 'local';
}

const PASSIVE_TO_ACTION: Array<[RegExp, string]> = [
  [/^\s*responsible for\s+/i, 'Spearheaded '],
  [/^\s*worked on\s+/i, 'Engineered '],
  [/^\s*helped(?: with| in| to)?\s+/i, 'Collaborated on '],
  [/^\s*assisted(?: with| in| to)?\s+/i, 'Contributed to '],
  [/^\s*made\s+/i, 'Developed '],
  [/^\s*created\s+/i, 'Architected '],
  [/^\s*handled\s+/i, 'Managed '],
  [/^\s*did\s+/i, 'Executed '],
  [/^\s*used\s+/i, 'Leveraged '],
  [/^\s*tested\s+/i, 'Validated '],
  [/^\s*fixed\s+/i, 'Resolved '],
];

const FILLER_PHRASES: Array<[RegExp, string]> = [
  [/\bin order to\b/gi, 'to'],
  [/\bas well as\b/gi, 'and'],
  [/\bwith the help of\b/gi, 'using'],
  [/\ba lot of\b/gi, 'multiple'],
  [/\bvarious different\b/gi, 'multiple'],
  [/\bbasically\b,?\s*/gi, ''],
  [/\bactually\b,?\s*/gi, ''],
  [/\beffectively\b,?\s*/gi, ''],
  [/\bsuccessfully\b\s+/gi, ''],
  [/\bin a timely manner\b/gi, 'on schedule'],
  [/\bday to day\b/gi, 'daily'],
  [/\bresponsible for managing\b/gi, 'Managed'],
  [/\bresponsible for developing\b/gi, 'Developed'],
  [/\bresponsible for building\b/gi, 'Built'],
];

/**
 * Deterministic client-side bullet/paragraph rewriter (zero API key required).
 */
export function rewriteTextLocally(rawText: string, mode: RewriteMode): string {
  let text = rawText.replace(/\s+/g, ' ').trim();
  if (!text) return text;

  for (const [pattern, replacement] of FILLER_PHRASES) {
    text = text.replace(pattern, replacement);
  }
  for (const [pattern, replacement] of PASSIVE_TO_ACTION) {
    if (pattern.test(text)) {
      text = text.replace(pattern, replacement);
      break;
    }
  }

  text = text.replace(/\s{2,}/g, ' ').trim();

  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  if (mode === 'tighten') {
    text = text
      .replace(/\b(?:that|which)\s+(?:was|were|is|are)\s+/gi, '')
      .replace(/\bthe system\b/gi, 'system')
      .replace(/\s+,\s+/g, ', ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  } else if (mode === 'executive') {
    text = text
      .replace(/\bbuilt\b/gi, 'architected')
      .replace(/\bimproved\b/gi, 'optimized')
      .replace(/\bfast\b/gi, 'high-throughput');
    text = text.charAt(0).toUpperCase() + text.slice(1);
  } else if (mode === 'impact' && !/[.%+\d]/.test(text) && text.length < 130) {
    // Remind user where measurable outcome fits cleanly without fabricating numbers
    if (!text.endsWith('.')) text += '.';
  }

  if (text && !/[.!?]$/.test(text)) {
    text += '.';
  }
  return text;
}

/**
 * Rewrites a resume bullet or summary paragraph using Gemini API, Chrome `window.ai`,
 * or falls back cleanly to local deterministic rewriting.
 */
export async function rewriteResumeSnippet(
  plainText: string,
  mode: RewriteMode,
  preferredEngine: AiEngineType = 'auto'
): Promise<RewriteResult> {
  const clean = plainText.trim();
  if (!clean) {
    return { rewritten: '', usedEngine: 'local' };
  }

  const instruction =
    mode === 'tighten'
      ? 'Condense this resume bullet by 25-35% into one concise, punchy impact line under 20 words for a 1-page resume. Preserve all real numbers and facts. Do NOT invent fake metrics. Return ONLY the rewritten plain text without quotes or markdown bullets.'
      : mode === 'executive'
      ? 'Rewrite this resume statement in polished executive technical language with a strong past-tense action verb and crisp technical framing. Preserve all facts. Do NOT invent numbers. Return ONLY the rewritten plain text.'
      : 'Rewrite this resume bullet to start with a strong action verb, eliminate weak filler words, and highlight engineering/business impact. Preserve all facts without inventing fake numbers. Return ONLY the rewritten plain text.';

  const prompt = `${instruction}\n\nOriginal:\n${clean}`;
  const { hasGeminiKey, hasWindowAi } = await checkAvailableAiEngines();

  if ((preferredEngine === 'auto' || preferredEngine === 'gemini') && hasGeminiKey) {
    try {
      const apiKey = (localStorage.getItem('placement_gemini_api_key') || '').trim();
      const model =
        localStorage.getItem('placement_gemini_selected_model') || 'gemini-2.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.35, maxOutputTokens: 256 },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (candidate) {
          return {
            rewritten: candidate.replace(/^[-*•"\s]+|["\s]+$/g, ''),
            usedEngine: 'gemini',
          };
        }
      }
    } catch {
      // Fall through cleanly
    }
  }

  if ((preferredEngine === 'auto' || preferredEngine === 'window-ai') && hasWindowAi) {
    try {
      const aiObj = (window as any).ai?.languageModel || (window as any).LanguageModel;
      if (aiObj) {
        const session = await aiObj.create({ systemPrompt: 'You are a concise technical resume editor.' });
        try {
          const out: string = await session.prompt(prompt);
          if (out && out.trim()) {
            return {
              rewritten: out.trim().replace(/^[-*•"\s]+|["\s]+$/g, ''),
              usedEngine: 'window-ai',
            };
          }
        } finally {
          session?.destroy?.();
        }
      }
    } catch {
      // Fall through cleanly
    }
  }

  return {
    rewritten: rewriteTextLocally(clean, mode),
    usedEngine: 'local',
  };
}
