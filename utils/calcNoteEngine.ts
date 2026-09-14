import { evaluate as mathEvaluate } from 'mathjs';
import { formatResult, preprocessExpression } from './calculator';
import { processCurrencyExpressions, convertCurrency } from './currency';

export type CalcNoteLine = {
  lineNumber: number; // 1-indexed
  rawText: string;
  mathExpression: string;
  resultText: string;
  numericValue: number | null;
  currencyCode?: string;
  isComment: boolean;
  isVariable: boolean;
  variableName?: string;
  hasError: boolean;
  error?: '#REF!' | '#VALUE!' | 'Error';
  dependencies: number[];
};

export type DocumentEvaluationResult = {
  lines: CalcNoteLine[];
  grandTotal: number | null;
  formattedGrandTotal: string;
  variables: Record<string, number>;
  lineCount: number;
  solvedCount: number;
  errorCount: number;
};

/**
 * Format currency amounts to 2 decimal places with thousands separators.
 * e.g. 487.76862115 -> "$487.77"
 */
export const formatCurrencyAmount = (amount: number, currencyCode?: string): string => {
  if (isNaN(amount) || !isFinite(amount)) return 'Error';

  const fixed = amount.toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  });

  if (!currencyCode) return fixed;

  if (currencyCode === 'USD') return `$${fixed}`;
  if (currencyCode === 'EUR') return `€${fixed}`;
  if (currencyCode === 'GBP') return `£${fixed}`;
  if (currencyCode === 'JPY') return `¥${fixed}`;
  if (currencyCode === 'INR') return `₹${fixed}`;
  if (currencyCode === 'BDT') return `৳${fixed}`;
  if (currencyCode === 'AED') return `د.إ ${fixed}`;
  if (currencyCode === 'SAR') return `ر.س ${fixed}`;

  return `${fixed} ${currencyCode}`;
};

/**
 * Normalizes Eastern Arabic (٠-٩), Persian/Urdu (۰-۹), and Bengali (০-৯) numerals,
 * Arabic punctuation (٫, ٬, ،), and spoken math keywords across English, Arabic, and Bangla.
 */
export const normalizeMultilingualInput = (input: string): string => {
  if (!input) return '';
  let res = input;

  // Bengali numerals ০-৯
  res = res.replace(/[\u09E6-\u09EF]/g, (d) => (d.charCodeAt(0) - 0x09E6).toString());
  // Eastern Arabic numerals ٠-٩
  res = res.replace(/[\u0660-\u0669]/g, (d) => (d.charCodeAt(0) - 0x0660).toString());
  // Persian / Urdu numerals ۰-۹
  res = res.replace(/[\u06F0-\u06F9]/g, (d) => (d.charCodeAt(0) - 0x06F0).toString());

  // Arabic decimal separator ٫ (U+066B) -> .
  res = res.replace(/\u066B/g, '.');
  // Arabic thousands separator ٬ (U+066C) and Arabic comma ، (U+060C) -> ,
  res = res.replace(/[\u066C\u060C]/g, ',');

  // Bengali spoken / typed math words
  res = res.replace(/(?<![a-zA-Z0-9_\u0980-\u09FF])যোগ(?![a-zA-Z0-9_\u0980-\u09FF])/gu, ' + ');
  res = res.replace(/(?<![a-zA-Z0-9_\u0980-\u09FF])বিয়োগ(?![a-zA-Z0-9_\u0980-\u09FF])/gu, ' - ');
  res = res.replace(/(?<![a-zA-Z0-9_\u0980-\u09FF])বাদ(?![a-zA-Z0-9_\u0980-\u09FF])/gu, ' - ');
  res = res.replace(/(?<![a-zA-Z0-9_\u0980-\u09FF])কাটা(?![a-zA-Z0-9_\u0980-\u09FF])/gu, ' - ');
  res = res.replace(/(?<![a-zA-Z0-9_\u0980-\u09FF])গুণ(?![a-zA-Z0-9_\u0980-\u09FF])/gu, ' * ');
  res = res.replace(/(?<![a-zA-Z0-9_\u0980-\u09FF])ভাগ(?![a-zA-Z0-9_\u0980-\u09FF])/gu, ' / ');
  res = res.replace(/(?<![a-zA-Z0-9_\u0980-\u09FF])শতাংশ(?![a-zA-Z0-9_\u0980-\u09FF])/gu, '%');
  res = res.replace(/(\d+(?:\.\d+)?)\s*এর\s*/gu, '$1 * ');
  res = res.replace(/(?<![a-zA-Z0-9_\u0980-\u09FF])লাইন\s*(\d+)(?![a-zA-Z0-9_\u0980-\u09FF])/gui, 'Line $1');
  res = res.replace(/(?<![a-zA-Z0-9_\u0980-\u09FF])আগের(?![a-zA-Z0-9_\u0980-\u09FF])/gu, 'prev');
  res = res.replace(/(?<![a-zA-Z0-9_\u0980-\u09FF])মোট(?![a-zA-Z0-9_\u0980-\u09FF])/gu, 'total');
  res = res.replace(/(?<![a-zA-Z0-9_\u0980-\u09FF])টাকা(?![a-zA-Z0-9_\u0980-\u09FF])/gu, ' BDT');
  res = res.replace(/(?<![a-zA-Z0-9_\u0980-\u09FF])ডলার(?![a-zA-Z0-9_\u0980-\u09FF])/gu, ' USD');
  res = res.replace(/(?<![a-zA-Z0-9_\u0980-\u09FF])ইউরো(?![a-zA-Z0-9_\u0980-\u09FF])/gu, ' EUR');
  res = res.replace(/(?<![a-zA-Z0-9_\u0980-\u09FF])রিয়াল(?![a-zA-Z0-9_\u0980-\u09FF])/gu, ' SAR');
  res = res.replace(/(?<![a-zA-Z0-9_\u0980-\u09FF])দিরহাম(?![a-zA-Z0-9_\u0980-\u09FF])/gu, ' AED');

  // Arabic spoken / typed math words
  res = res.replace(/(?<![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])زائد(?![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])/gu, ' + ');
  res = res.replace(/(?<![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])مع(?![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])/gu, ' + ');
  res = res.replace(/(?<![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])ناقص(?![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])/gu, ' - ');
  res = res.replace(/(?<![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])طرح(?![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])/gu, ' - ');
  res = res.replace(/(?<![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])ضرب(?![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])/gu, ' * ');
  res = res.replace(/(?<![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])قسمة(?![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])/gu, ' / ');
  res = res.replace(/(?<![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])على(?![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])/gu, ' / ');
  res = res.replace(/(?<![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])(بالمئة|في المئة|نسبة)(?![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])/gu, '%');
  res = res.replace(/(?<![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])سطر\s*(\d+)(?![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])/gui, 'Line $1');
  res = res.replace(/(?<![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])السابق(?![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])/gu, 'prev');
  res = res.replace(/(?<![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])المجموع(?![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])/gu, 'total');
  res = res.replace(/(?<![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])ريال(?![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])/gu, ' SAR');
  res = res.replace(/(?<![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])درهم(?![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])/gu, ' AED');
  res = res.replace(/(?<![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])دولار(?![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])/gu, ' USD');
  res = res.replace(/(?<![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])يورو(?![a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])/gu, ' EUR');

  return res;
};

/**
 * Normalizes thousands separators and shortcuts like 5k or 1.5M in numbers.
 * e.g. "5,500" -> "5500", "1,450.50" -> "1450.50", "10k" -> "10000"
 */
export const normalizeNumberStrings = (text: string): string => {
  let res = normalizeMultilingualInput(text);

  // Remove commas inside numbers (e.g. 5,500 -> 5500, 1,000,000 -> 1000000)
  while (/(\d+),(\d{3})/.test(res)) {
    res = res.replace(/(\d+),(\d{3})/g, '$1$2');
  }

  // Handle k/M suffixes: 5k -> 5000, 2.5k -> 2500, 1M -> 1000000
  res = res.replace(/\b(\d+(?:\.\d+)?)\s*k\b/gi, (_, n) => (parseFloat(n) * 1000).toString());
  res = res.replace(/\b(\d+(?:\.\d+)?)\s*m\b/gi, (_, n) => (parseFloat(n) * 1000000).toString());

  return res;
};

/**
 * Strips conversational prose and labels while preserving numbers, math, and variables.
 * Fully supports English, Arabic, and Bangla prose and variable names.
 */
export const extractMathFromProse = (
  rawText: string,
  knownVariables: Set<string>
): {
  expression: string;
  isComment: boolean;
  variableName?: string;
  explicitTargetCurrency?: string;
} => {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return { expression: '', isComment: true };
  }

  // Explicit comment prefixes (note: '#1' is a line ref, not a comment header!)
  if (
    trimmed.startsWith('//') ||
    trimmed.startsWith('/*') ||
    /^#\s+[A-Za-z\u0980-\u09FF\u0600-\u06FF]/.test(trimmed) ||
    trimmed === '#'
  ) {
    return { expression: '', isComment: true };
  }

  // Strip colon label or equals sign BEFORE math keyword normalization
  // This preserves labels like "মোট খরচ:" or "المجموع الكلي:" without converting them
  let variableName: string | undefined;
  let text = trimmed;

  const colonIndex = text.indexOf(':');
  if (colonIndex > 0) {
    const labelCandidate = text.slice(0, colonIndex).trim();
    const rest = text.slice(colonIndex + 1).trim();
    const candidateLower = labelCandidate
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_\u0980-\u09FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, '');
    const reserved = new Set([
      'line', 'row', 'l', 'total', 'sum', 'avg', 'average', 'prev', 'last', 'to', 'in', 'as',
      'লাইন', 'মোট', 'আগের', 'سطر', 'المجموع', 'السابق'
    ]);
    if (candidateLower.length > 0 && !reserved.has(candidateLower)) {
      variableName = candidateLower;
    }
    text = rest;
  } else {
    // Check for equals sign: "tax = 18%" or "বেতন = ৫০০০" or "راتب = ٥٠٠٠"
    const eqMatch = text.match(/^([a-zA-Z_\u0980-\u09FF\u0600-\u06FF][a-zA-Z0-9_\u0980-\u09FF\u0600-\u06FF\s]*)\s*=\s*(.+)$/);
    if (eqMatch) {
      const candidateLower = eqMatch[1]
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_\u0980-\u09FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, '');
      const reserved = new Set([
        'line', 'row', 'l', 'total', 'sum', 'avg', 'average', 'prev', 'last', 'to', 'in', 'as',
        'লাইন', 'মোট', 'আগের', 'سطر', 'المجموع', 'السابق'
      ]);
      if (candidateLower.length > 0 && !reserved.has(candidateLower)) {
        variableName = candidateLower;
      }
      text = eqMatch[2].trim();
    }
  }

  // Pre-bind known multi-word variables in text: e.g. "মোট খরচ" -> "মোট_খরচ"
  for (const knownVar of Array.from(knownVariables).sort((a, b) => b.length - a.length)) {
    if (knownVar.includes('_')) {
      const spaceForm = knownVar.replace(/_/g, '\\s+');
      const reg = new RegExp(`(?<![a-zA-Z0-9_\\u0980-\\u09FF\\u0600-\\u06FF])${spaceForm}(?![a-zA-Z0-9_\\u0980-\\u09FF\\u0600-\\u06FF])`, 'gui');
      text = text.replace(reg, knownVar);
    }
  }

  // Normalize numbers: strip commas, expand 5k, normalize multilingual digits & words
  text = normalizeNumberStrings(text);

  // Replace spoken / natural math words with mathematical operators
  text = text.replace(/\bplus\b/gi, ' + ');
  text = text.replace(/\band\b/gi, ' + ');
  text = text.replace(/\bminus\b/gi, ' - ');
  text = text.replace(/\bless\b/gi, ' - ');
  text = text.replace(/\btimes\b/gi, ' * ');
  text = text.replace(/\bmultiplied\s+by\b/gi, ' * ');
  text = text.replace(/\bdivided\s+by\b/gi, ' / ');
  text = text.replace(/\bover\b/gi, ' / ');
  text = text.replace(/\b(percent|pct)\b/gi, '%');
  text = text.replace(/\bhalf\s+(?:of\s+)?/gi, '0.5 * ');
  text = text.replace(/\bquarter\s+(?:of\s+)?/gi, '0.25 * ');
  text = text.replace(/\bdouble\s+(?:of\s+)?/gi, '2 * ');
  text = text.replace(/\btriple\s+(?:of\s+)?/gi, '3 * ');

  // Handle natural percentage operations:
  // "18% of Line 4" -> "18% * Line 4"
  text = text.replace(/(\d+(?:\.\d+)?)%\s*(?:of|in)\s+/gi, '$1% * ');

  // "20% off 500" -> "500 - (20% * 500)"
  text = text.replace(/(\d+(?:\.\d+)?)%\s*(?:off|discount on)\s+(\d+(?:\.\d+)?)/gi, '($2 - ($1% * $2))');

  // Handle "to Currency" or "in Currency"
  let explicitTargetCurrency: string | undefined;
  const currTargetMatch = text.match(/\b(?:to|in|as)\s+([A-Za-z]{3})\b/i);
  if (currTargetMatch) {
    explicitTargetCurrency = currTargetMatch[1].toUpperCase();
  }

  // Allowed math tokens and functions
  const allowedMathWords = new Set([
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
    'log', 'ln', 'sqrt', 'pi', 'e',
    'to', 'in', 'as',
    'line', 'row', 'l', 'prev', 'last', 'total', 'sum',
    'usd', 'eur', 'gbp', 'jpy', 'cad', 'aud', 'chf', 'cny', 'inr', 'brl', 'sgd', 'hkd', 'krw', 'mxn', 'sek', 'nzd',
    'bdt', 'aed', 'sar', 'kwd', 'qar', 'omr', 'bhd', 'egp',
  ]);

  // Tokenize words
  const words = text.split(/\s+/);
  const mathTokens: string[] = [];

  for (const w of words) {
    if (!w) continue;

    // Keep numbers and mathematical symbols
    if (/^[0-9+\-*/^().,%$€£¥₹৳!]+$/.test(w)) {
      mathTokens.push(w);
      continue;
    }

    // Keep line tokens: Line1, Row2, L3, #4
    if (/^(line\d+|row\d+|l\d+|\$\d+|#\d+)$/i.test(w)) {
      mathTokens.push(w);
      continue;
    }

    const cleanWord = w
      .toLowerCase()
      .replace(/[^a-zA-Z0-9_\u0980-\u09FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, '');

    // Keep recognized math functions, units, or line keywords
    if (allowedMathWords.has(cleanWord)) {
      mathTokens.push(cleanWord);
      continue;
    }

    // Keep if it's a recognized variable name that was previously defined
    if (knownVariables.has(cleanWord)) {
      mathTokens.push(cleanWord);
      continue;
    }

    // Otherwise, it's conversational prose (e.g. "car", "cost", "internet", "weeks", "tickets") -> IGNORE
  }

  const cleanedExpr = mathTokens.join(' ').trim();

  // Check if expression has recognized variable
  const hasKnownVar = Array.from(knownVariables).some((v) => {
    const escaped = v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?<![a-zA-Z0-9_\\u0980-\\u09FF\\u0600-\\u06FF])${escaped}(?![a-zA-Z0-9_\\u0980-\\u09FF\\u0600-\\u06FF])`, 'i').test(cleanedExpr);
  });

  // If after stripping prose there are NO numbers, NO line references, and NO variables:
  // It is pure text / comment -> treat as comment
  const hasCalculableContent =
    /[0-9$€£¥₹৳]/.test(cleanedExpr) ||
    /\b(?:line|row|l|\$|#)\s*\d+\b/i.test(cleanedExpr) ||
    /\b(?:prev|last|total|sum)\b/i.test(cleanedExpr) ||
    hasKnownVar;

  if (!hasCalculableContent) {
    return { expression: '', isComment: true, variableName };
  }

  return {
    expression: cleanedExpr,
    isComment: false,
    variableName,
    explicitTargetCurrency,
  };
};

/**
 * Detects circular dependencies in the line reference graph.
 */
export const detectCircularReferences = (
  dependencies: Record<number, number[]>
): Set<number> => {
  const cyclicLines = new Set<number>();
  const visited: Record<number, boolean> = {};
  const recStack: Record<number, boolean> = {};

  const isCyclic = (node: number, path: number[]): boolean => {
    visited[node] = true;
    recStack[node] = true;

    const neighbors = dependencies[node] || [];
    for (const neighbor of neighbors) {
      if (!visited[neighbor]) {
        if (isCyclic(neighbor, [...path, neighbor])) {
          cyclicLines.add(node);
          return true;
        }
      } else if (recStack[neighbor]) {
        cyclicLines.add(node);
        cyclicLines.add(neighbor);
        path.forEach((p) => cyclicLines.add(p));
        return true;
      }
    }

    recStack[node] = false;
    return false;
  };

  Object.keys(dependencies).forEach((key) => {
    const lineNum = parseInt(key, 10);
    if (!visited[lineNum]) {
      isCyclic(lineNum, [lineNum]);
    }
  });

  return cyclicLines;
};

/**
 * Core CalcNote Reactive Execution Engine
 * Evaluates document line-by-line while handling variables, line references, and currencies.
 */
export const evaluateDocument = (documentText: string): DocumentEvaluationResult => {
  const rawLines = documentText.split('\n');
  const totalLineCount = rawLines.length;

  type ParsedLineMeta = {
    lineNum: number;
    rawText: string;
    extractedExpr: string;
    isComment: boolean;
    variableName?: string;
    targetCurrency?: string;
    dependencies: number[];
  };

  const parsedLines: ParsedLineMeta[] = [];
  const lineDependencyMap: Record<number, number[]> = {};
  const knownVariables = new Set<string>();

  // Pass 1: Parse prose and gather variable declarations
  rawLines.forEach((rawText, index) => {
    const lineNum = index + 1;
    const { expression, isComment, variableName, explicitTargetCurrency } = extractMathFromProse(
      rawText,
      knownVariables
    );

    if (variableName) {
      knownVariables.add(variableName);
    }

    const deps: number[] = [];

    if (!isComment && expression) {
      // Find line references (Line 1, Row 2, L3, #4)
      const lineRefRegex = /(?:\b(?:line|row|l)|#)\s*(\d+)\b/gi;
      let match: RegExpExecArray | null;
      while ((match = lineRefRegex.exec(expression)) !== null) {
        const referencedLine = parseInt(match[1], 10);
        if (referencedLine >= 1 && referencedLine <= totalLineCount && referencedLine !== lineNum) {
          deps.push(referencedLine);
        }
      }

      // Find "prev" or "last"
      if (/\b(prev|last)\b/i.test(expression) && lineNum > 1) {
        for (let p = lineNum - 1; p >= 1; p--) {
          if (!parsedLines[p - 1]?.isComment) {
            deps.push(p);
            break;
          }
        }
      }
    }

    lineDependencyMap[lineNum] = Array.from(new Set(deps));
    parsedLines.push({
      lineNum,
      rawText,
      extractedExpr: expression,
      isComment,
      variableName,
      targetCurrency: explicitTargetCurrency,
      dependencies: deps,
    });
  });

  // Pass 2: Detect Circular References
  const cyclicLineNumbers = detectCircularReferences(lineDependencyMap);

  // Pass 3: Evaluate line-by-line in topological sequence
  const lineResults: CalcNoteLine[] = [];
  const lineNumericValues: Record<number, number> = {};
  const lineCurrencyCodes: Record<number, string | undefined> = {};
  const variableValues: Record<string, number> = {};

  const subtotalLines = new Set<number>();
  let runningSum = 0;
  let solvedCount = 0;
  let errorCount = 0;

  parsedLines.forEach(({ lineNum, rawText, extractedExpr, isComment, variableName, targetCurrency, dependencies }) => {
    // 1. Comments or non-calculable prose
    if (isComment || !extractedExpr) {
      lineResults.push({
        lineNumber: lineNum,
        rawText,
        mathExpression: '',
        resultText: '',
        numericValue: null,
        isComment: true,
        isVariable: !!variableName,
        variableName,
        hasError: false,
        dependencies: [],
      });
      return;
    }

    // 2. Circular reference error
    if (cyclicLineNumbers.has(lineNum)) {
      errorCount++;
      lineResults.push({
        lineNumber: lineNum,
        rawText,
        mathExpression: extractedExpr,
        resultText: '#REF!',
        numericValue: null,
        isComment: false,
        isVariable: !!variableName,
        variableName,
        hasError: true,
        error: '#REF!',
        dependencies,
      });
      return;
    }

    try {
      let exprToEval = extractedExpr;

      // Incomplete typing resilience: if expression ends with an operator while typing, don't show #VALUE!
      const trimmedExpr = exprToEval.trim();
      if (/[+\-*/^.(]$/.test(trimmedExpr)) {
        lineResults.push({
          lineNumber: lineNum,
          rawText,
          mathExpression: exprToEval,
          resultText: '',
          numericValue: null,
          isComment: false,
          isVariable: !!variableName,
          variableName,
          hasError: false,
          dependencies,
        });
        return;
      }

      // Detect if expression contains currency symbols
      let inferredCurrency = targetCurrency;
      if (!inferredCurrency) {
        if (exprToEval.includes('$') || /\bUSD\b/i.test(exprToEval)) inferredCurrency = 'USD';
        else if (exprToEval.includes('€') || /\bEUR\b/i.test(exprToEval)) inferredCurrency = 'EUR';
        else if (exprToEval.includes('£') || /\bGBP\b/i.test(exprToEval)) inferredCurrency = 'GBP';
        else if (exprToEval.includes('¥') || /\bJPY\b/i.test(exprToEval)) inferredCurrency = 'JPY';
        else if (exprToEval.includes('₹') || /\bINR\b/i.test(exprToEval)) inferredCurrency = 'INR';
        else if (exprToEval.includes('৳') || /\bBDT\b/i.test(exprToEval)) inferredCurrency = 'BDT';
        else if (exprToEval.includes('د.إ') || /\bAED\b/i.test(exprToEval)) inferredCurrency = 'AED';
        else if (exprToEval.includes('ر.س') || /\bSAR\b/i.test(exprToEval)) inferredCurrency = 'SAR';
      }

      // Substitute "prev" or "last" (looks back for the most recent calculated line)
      if (/\b(prev|last)\b/i.test(exprToEval)) {
        let prevVal: number | undefined;
        let prevLineCurrency: string | undefined;
        for (let p = lineNum - 1; p >= 1; p--) {
          if (lineNumericValues[p] !== undefined) {
            prevVal = lineNumericValues[p];
            prevLineCurrency = lineCurrencyCodes[p];
            break;
          }
        }

        if (prevVal !== undefined) {
          exprToEval = exprToEval.replace(/\b(prev|last)\b/gi, `(${prevVal})`);
          if (!inferredCurrency && prevLineCurrency) {
            inferredCurrency = prevLineCurrency;
          }
        } else {
          throw new Error('Prev line not available');
        }
      }

      // Substitute Line references: Line 1, Row 2, L3, #4
      exprToEval = exprToEval.replace(/(?:\b(?:line|row|l)|#)\s*(\d+)\b/gi, (_, numStr) => {
        const targetLine = parseInt(numStr, 10);
        const val = lineNumericValues[targetLine];
        if (val !== undefined) {
          if (!inferredCurrency && lineCurrencyCodes[targetLine]) {
            inferredCurrency = lineCurrencyCodes[targetLine];
          }
          return `(${val})`;
        }
        throw new Error(`Line ${targetLine} has no result`);
      });

      // Substitute variables (sorted by length descending for greedy match)
      const sortedVarNames = Object.keys(variableValues).sort((a, b) => b.length - a.length);
      for (const varName of sortedVarNames) {
        const varVal = variableValues[varName];
        const escaped = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const reg = new RegExp(`(?<![a-zA-Z0-9_\\u0980-\\u09FF\\u0600-\\u06FF])${escaped}(?![a-zA-Z0-9_\\u0980-\\u09FF\\u0600-\\u06FF])`, 'gui');
        exprToEval = exprToEval.replace(reg, `(${varVal})`);
      }

      // Handle "total", "sum", or "subtotal"
      if (/\b(?:total|sum|subtotal)\b/i.test(exprToEval)) {
        // 1. Find the start of the current section (look back until previous subtotal line, markdown header, or divider)
        let sectionStartLine = 1;
        for (let p = lineNum - 1; p >= 1; p--) {
          const prevRaw = parsedLines[p - 1]?.rawText?.trim() || '';
          if (
            subtotalLines.has(p) ||
            prevRaw.startsWith('#') ||
            prevRaw.startsWith('---') ||
            prevRaw.startsWith('===')
          ) {
            sectionStartLine = p + 1;
            break;
          }
        }

        // 2. Collect calculable lines in this section that have evaluated numeric values
        const candidateLines: number[] = [];
        for (let p = sectionStartLine; p < lineNum; p++) {
          if (lineNumericValues[p] !== undefined && !parsedLines[p - 1]?.isComment) {
            candidateLines.push(p);
          }
        }

        // 3. Prevent double-counting: only sum lines that are NOT consumed by any other line in candidateLines
        const unconsumedLines = candidateLines.filter(
          (p) => !candidateLines.some((q) => lineDependencyMap[q]?.includes(p))
        );

        const linesToSum = unconsumedLines.length > 0 ? unconsumedLines : candidateLines;
        const sectionSum = linesToSum.reduce((acc, p) => acc + (lineNumericValues[p] || 0), 0);

        // 4. Inherit currency from the lines in the block if not explicitly specified
        if (!inferredCurrency) {
          for (const p of linesToSum) {
            if (lineCurrencyCodes[p]) {
              inferredCurrency = lineCurrencyCodes[p];
              break;
            }
          }
        }

        // 5. Replace total/sum/subtotal token with calculated section sum
        exprToEval = exprToEval.replace(/\b(?:total|sum|subtotal)\b/gi, `(${sectionSum})`);

        // Register this line's dependencies as the lines it summed
        linesToSum.forEach((p) => {
          if (!dependencies.includes(p)) {
            dependencies.push(p);
          }
        });
        lineDependencyMap[lineNum] = dependencies;

        subtotalLines.add(lineNum);
      }

      // Convert currencies if present (e.g. 420 EUR to USD)
      const currencyResult = processCurrencyExpressions(exprToEval);
      exprToEval = currencyResult.processed;
      if (currencyResult.targetCurrency) {
        inferredCurrency = currencyResult.targetCurrency;
      }

      // Normalize arithmetic syntax (percentages, exponents)
      const preprocessed = preprocessExpression(exprToEval);

      // Evaluate with mathjs
      const rawResult = mathEvaluate(preprocessed);

      if (typeof rawResult !== 'number' || isNaN(rawResult)) {
        throw new Error('Invalid numeric result');
      }

      // Handle infinity or division by zero cleanly
      if (!isFinite(rawResult)) {
        lineResults.push({
          lineNumber: lineNum,
          rawText,
          mathExpression: exprToEval,
          resultText: '∞',
          numericValue: null,
          isComment: false,
          isVariable: !!variableName,
          variableName,
          hasError: false,
          dependencies,
        });
        return;
      }

      const formatted = inferredCurrency
        ? formatCurrencyAmount(rawResult, inferredCurrency)
        : formatResult(rawResult);

      lineNumericValues[lineNum] = rawResult;
      lineCurrencyCodes[lineNum] = inferredCurrency;
      if (!subtotalLines.has(lineNum)) {
        runningSum += rawResult;
      }
      solvedCount++;

      if (variableName) {
        variableValues[variableName] = rawResult;
      }

      lineResults.push({
        lineNumber: lineNum,
        rawText,
        mathExpression: exprToEval,
        resultText: formatted,
        numericValue: rawResult,
        currencyCode: inferredCurrency,
        isComment: false,
        isVariable: !!variableName,
        variableName,
        hasError: false,
        dependencies,
      });
    } catch (err: any) {
      errorCount++;
      const isRefErr = cyclicLineNumbers.has(lineNum);
      const errCode = isRefErr ? '#REF!' : '#VALUE!';

      lineResults.push({
        lineNumber: lineNum,
        rawText,
        mathExpression: extractedExpr,
        resultText: errCode,
        numericValue: null,
        isComment: false,
        isVariable: !!variableName,
        variableName,
        hasError: true,
        error: errCode,
        dependencies,
      });
    }
  });

  // Calculate DAG sink lines (lines that have values and are NOT consumed by downstream lines)
  const linesWithDependents = new Set<number>();
  Object.values(lineDependencyMap).forEach((deps) => {
    deps.forEach((d) => linesWithDependents.add(d));
  });

  const sinkLines = lineResults.filter(
    (l) => !l.isComment && !l.hasError && l.numericValue !== null && !linesWithDependents.has(l.lineNumber)
  );

  const grandTotal =
    sinkLines.length > 0
      ? sinkLines.reduce((acc, l) => acc + (l.numericValue || 0), 0)
      : (solvedCount > 0 ? runningSum : null);

  return {
    lines: lineResults,
    grandTotal,
    formattedGrandTotal: grandTotal !== null ? formatCurrencyAmount(grandTotal) : '0',
    variables: variableValues,
    lineCount: totalLineCount,
    solvedCount,
    errorCount,
  };
};
