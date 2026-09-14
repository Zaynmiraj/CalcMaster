import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalcNoteLine } from './calcNoteEngine';

export type AIModelOption = {
  id: string;
  name: string;
  provider: string;
  isFree: boolean;
  contextLength: string;
};

export const BUILTIN_OPENROUTER_KEY =
  process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '';

export const AVAILABLE_AI_MODELS: AIModelOption[] = [
  {
    id: 'nvidia/nemotron-3.5-lightning:free',
    name: 'Nemotron 3.5 (Fast & Free)',
    provider: 'Nvidia',
    isFree: true,
    contextLength: '128k',
  },
  {
    id: 'liquid/lfm-2.5-2.6b:free',
    name: 'Liquid LFM 2.5 (Free)',
    provider: 'Liquid',
    isFree: true,
    contextLength: '32k',
  },
  {
    id: 'google/gemma-4-26b-a4b-it:free',
    name: 'Gemma 4 26B (Free)',
    provider: 'Google',
    isFree: true,
    contextLength: '128k',
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1 (Free)',
    provider: 'DeepSeek',
    isFree: true,
    contextLength: '64k',
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini (Pro)',
    provider: 'OpenAI',
    isFree: false,
    contextLength: '128k',
  },
];

const STORAGE_KEYS = {
  API_KEY: 'calcmaster_openrouter_api_key',
  SELECTED_MODEL: 'calcmaster_ai_model',
  AI_ENABLED: 'calcmaster_ai_enabled',
};

export type AISummaryResult = {
  success: boolean;
  summary: string;
  keyInsights: string[];
  recommendations: string[];
  source: 'openrouter' | 'local_engine';
  modelUsed: string;
};

export const getStoredApiKey = async (): Promise<string> => {
  try {
    const envKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '';
    if (envKey && envKey.trim().length > 0) return envKey.trim();
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.API_KEY);
    if (stored && stored.trim().length > 0) return stored.trim();
    return BUILTIN_OPENROUTER_KEY;
  } catch {
    return BUILTIN_OPENROUTER_KEY;
  }
};

export const saveStoredApiKey = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.API_KEY, key.trim());
  } catch (e) {
    console.error('Failed to save API key', e);
  }
};

export const getStoredModel = async (): Promise<string> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_MODEL);
    if (stored && stored !== 'meta-llama/llama-3.2-3b-instruct:free') {
      return stored;
    }
    return 'nvidia/nemotron-3.5-lightning:free';
  } catch {
    return 'nvidia/nemotron-3.5-lightning:free';
  }
};

export const saveStoredModel = async (modelId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, modelId);
  } catch (e) {
    console.error('Failed to save AI model', e);
  }
};

/**
 * Local offline financial rule engine for instant zero-latency insights
 */
const generateLocalSummary = (
  lines: CalcNoteLine[],
  title: string,
  grandTotal: string,
  language: 'en' | 'ar' | 'bn'
): AISummaryResult => {
  const solvedLines = lines.filter((l) => !l.isComment && l.numericValue !== null && !l.hasError);
  const totalItems = solvedLines.length;

  let maxVal = -Infinity;
  let maxItem = '';
  let minVal = Infinity;
  let minItem = '';
  let totalPositive = 0;
  let totalNegative = 0;

  for (const l of solvedLines) {
    const val = l.numericValue || 0;
    if (val > maxVal) {
      maxVal = val;
      maxItem = l.rawText.split('=')[0].trim();
    }
    if (val < minVal && val !== 0) {
      minVal = val;
      minItem = l.rawText.split('=')[0].trim();
    }
    if (val > 0) totalPositive += val;
    else if (val < 0) totalNegative += Math.abs(val);
  }

  if (language === 'ar') {
    const insights: string[] = [];
    if (maxItem) insights.push(`أعلى بند في الحسابات: "${maxItem}" بقيمة ${maxVal.toLocaleString()}`);
    if (totalPositive > 0 && totalNegative > 0) {
      insights.push(`إجمالي الإيرادات / الإيجابيات: ${totalPositive.toLocaleString()} مقابل إجمالي المصروفات: ${totalNegative.toLocaleString()}`);
    }
    insights.push(`إجمالي العمليات المنجزة: ${totalItems} معادلة`);

    const recommendations: string[] = [];
    if (totalNegative > totalPositive && totalPositive > 0) {
      recommendations.push('المصروفات تتجاوز المدخول بنسبة ملحوظة، يوصى بمراجعة البنود الكبرى.');
    } else {
      recommendations.push('المعادلات متوازنة وتظهر نتائج مالية إيجابية.');
    }
    recommendations.push('يمكنك استخدام تصدير PDF للاحتفاظ بسجل رسمي من هذا المستند.');

    return {
      success: true,
      summary: `تحليل مالي لمستند "${title || 'الحسابات'}": المجموع الصافي النهائي هو ${grandTotal} عبر ${totalItems} بند محسوب.`,
      keyInsights: insights,
      recommendations,
      source: 'local_engine',
      modelUsed: 'NoteCalc Pro Offline Intelligence',
    };
  }

  if (language === 'bn') {
    const insights: string[] = [];
    if (maxItem) insights.push(`সর্বোচ্চ মান সম্পন্ন হিসাব: "${maxItem}" (মান: ${maxVal.toLocaleString()})`);
    if (totalPositive > 0 && totalNegative > 0) {
      insights.push(`মোট যোগ/আয়: ${totalPositive.toLocaleString()} এবং মোট বিয়োগ/ব্যয়: ${totalNegative.toLocaleString()}`);
    }
    insights.push(`মোট সমাধানকৃত লাইন: ${totalItems} টি`);

    const recommendations: string[] = [];
    if (totalNegative > totalPositive && totalPositive > 0) {
      recommendations.push('মোট ব্যয় আয়ের চেয়ে বেশি, প্রধান খরচের খাতগুলো পুনর্বিবেচনা করার পরামর্শ রইলো।');
    } else {
      recommendations.push('সকল হিসাব সুষম এবং নিট ব্যালেন্স সন্তোষজনক অবস্থায় রয়েছে।');
    }
    recommendations.push('স্থায়ী নথির জন্য আপনি এই হিসাবটি PDF অথবা রসিদ আকারে এক্সপোর্ট করতে পারেন।');

    return {
      success: true,
      summary: `"${title || 'ক্যালকুলেশন শিট'}" এর বিশ্লেষণ: সর্বমোট ব্যালেন্স ${grandTotal}, যা ${totalItems} টি সফল হিসাবের মাধ্যমে নির্ধারিত হয়েছে।`,
      keyInsights: insights,
      recommendations,
      source: 'local_engine',
      modelUsed: 'NoteCalc Pro Offline Intelligence',
    };
  }

  // Default English
  const insights: string[] = [];
  if (maxItem) insights.push(`Highest value recorded: "${maxItem}" at ${maxVal.toLocaleString()}`);
  if (totalPositive > 0 && totalNegative > 0) {
    insights.push(`Total additions: ${totalPositive.toLocaleString()} vs total deductions: ${totalNegative.toLocaleString()}`);
  }
  insights.push(`Analyzed ${totalItems} active mathematical statements`);

  const recommendations: string[] = [];
  if (totalNegative > totalPositive && totalPositive > 0) {
    recommendations.push('Net balance is negative. Consider trimming the top line items.');
  } else {
    recommendations.push('Net balance is healthy and properly categorized.');
  }
  recommendations.push('You can generate a formal visual receipt or PDF export from this document.');

  return {
    success: true,
    summary: `Analysis for "${title || 'Calculation Note'}": Net balance stands at ${grandTotal} calculated across ${totalItems} lines.`,
    keyInsights: insights,
    recommendations,
    source: 'local_engine',
    modelUsed: 'NoteCalc Pro Offline Intelligence',
  };
};

/**
 * Priority list of free OpenRouter models for automatic failover
 */
const FREE_MODEL_CASCADE = [
  'nvidia/nemotron-3.5-lightning:free',
  'liquid/lfm-2.5-2.6b:free',
  'google/gemma-4-26b-a4b-it:free',
];

/**
 * Executes an AI summary using OpenRouter API with automated model cascade fallback
 */
export const summarizeDocumentWithAI = async (params: {
  title: string;
  lines: CalcNoteLine[];
  grandTotal: string;
  language: 'en' | 'ar' | 'bn';
}): Promise<AISummaryResult> => {
  const { title, lines, grandTotal, language } = params;
  const apiKey = await getStoredApiKey();
  const preferredModel = await getStoredModel();

  // If no API key is provided, return rich offline local intelligence
  if (!apiKey || apiKey.trim().length < 8) {
    return generateLocalSummary(lines, title, grandTotal, language);
  }

  const calculationRows = lines
    .filter((l) => !l.isComment || l.rawText.trim().length > 0)
    .map((l) => `Line ${l.lineNumber}: ${l.rawText} => ${l.resultText || 'N/A'}`)
    .join('\n');

  const langName = language === 'ar' ? 'Arabic' : language === 'bn' ? 'Bengali' : 'English';

  const systemPrompt = `You are NoteCalc Pro AI, a financial and mathematical intelligence advisor.
Analyze the user's calculation notepad document.
Return your response ONLY in valid JSON matching this exact structure:
{
  "summary": "Concise 1-2 sentence executive summary of the document and net balance in ${langName}.",
  "keyInsights": ["3 bullet points highlighting largest items, income/expense ratios, or anomalies in ${langName}"],
  "recommendations": ["2 practical financial optimization suggestions or next steps in ${langName}"]
}
Do NOT include markdown backticks around JSON. Strictly write your text in ${langName}.`;

  const userPrompt = `Document Title: ${title || 'Calculation Note'}
Net Grand Total: ${grandTotal}
Calculation Sheet:
${calculationRows}`;

  // Try preferred model first, then fallback models in order
  const candidateModels = [
    preferredModel,
    ...FREE_MODEL_CASCADE.filter((m) => m !== preferredModel),
  ];

  for (const model of candidateModels) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 14000);

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://policy.nimions.com/privacy/notecalc-pro',
          'X-Title': 'NoteCalc Pro',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`OpenRouter model ${model} HTTP error ${response.status}, trying next fallback`);
        continue;
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content;

      if (!content) continue;

      const cleanContent = content.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleanContent);

      return {
        success: true,
        summary: parsed.summary || `Net balance: ${grandTotal}`,
        keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        source: 'openrouter',
        modelUsed: model,
      };
    } catch (err) {
      console.warn(`Model ${model} failed:`, err);
    }
  }

  // Graceful fallback to rich offline engine
  return generateLocalSummary(lines, title, grandTotal, language);
};

/**
 * Natural language to CalcNote equation converter via OpenRouter or offline parser
 * Fully multilingual across English, Arabic, and Bangla
 */
export const convertNaturalLanguageToMath = async (
  promptText: string,
  language: 'en' | 'ar' | 'bn'
): Promise<string[]> => {
  const apiKey = await getStoredApiKey();
  const preferredModel = await getStoredModel();

  if (apiKey && apiKey.length >= 8) {
    const candidateModels = [
      preferredModel,
      ...FREE_MODEL_CASCADE.filter((m) => m !== preferredModel),
    ];

    const promptInstructions = `Convert natural language descriptions into a series of CalcNote notepad equations.
The input may be written or spoken in English, Arabic, or Bengali.
1. Use # for descriptions or comments (preserve the user's language, e.g. # জামা, # قميص).
2. For equations, convert Arabic digits (٠-٩) and Bengali digits (০-৯) to standard numbers (0-9) and standard operators (+, -, *, /).
3. Output raw lines separated by newlines only. No markdown code blocks.
Example:
Input: "3 shirts at 25 dollars and shoes for 80, split between 2"
Output:
# 3 shirts
3 * 25
# Shoes
80
# Total split between 2
(prev + 75) / 2`;

    for (const model of candidateModels) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://policy.nimions.com/privacy/notecalc-pro',
            'X-Title': 'NoteCalc Pro',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: promptInstructions },
              { role: 'user', content: promptText },
            ],
            temperature: 0.2,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            const cleaned = text
              .replace(/^```(?:math|text)?\s*/i, '')
              .replace(/```\s*$/i, '')
              .trim();

            const lines = cleaned
              .split('\n')
              .map((l: string) => l.trim())
              .filter((l: string) => l.length > 0);

            if (lines.length > 0) {
              return lines;
            }
          }
        }
      } catch (e) {
        console.warn(`AI Math conversion with ${model} failed, trying next:`, e);
      }
    }
  }

  // Fallback direct line
  return [`# ${promptText}`, promptText];
};
