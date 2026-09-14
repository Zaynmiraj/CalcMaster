import { evaluate as mathEvaluate } from 'mathjs';

export type AngleUnit = 'deg' | 'rad';

// Helper to convert degrees to radians
const degToRad = (degrees: number): number => (degrees * Math.PI) / 180;
const radToDeg = (radians: number): number => (radians * 180) / Math.PI;

// Factorial helper
const factorial = (n: number): number => {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity; // JS Number overflow limit
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
};

// Create math functions scoped to the specified angle unit
const getCustomFunctions = (angleUnit: AngleUnit) => {
  const isDeg = angleUnit === 'deg';

  return {
    sin: (x: number) => {
      const rad = isDeg ? degToRad(x) : x;
      // Handle exact values for sin(180), sin(360), etc.
      const val = Math.sin(rad);
      return Math.abs(val) < 1e-15 ? 0 : val;
    },
    cos: (x: number) => {
      const rad = isDeg ? degToRad(x) : x;
      // Handle exact values for cos(90), cos(270), etc.
      const val = Math.cos(rad);
      return Math.abs(val) < 1e-15 ? 0 : val;
    },
    tan: (x: number) => {
      const rad = isDeg ? degToRad(x) : x;
      if (isDeg && (Math.abs(x) % 180 === 90)) {
        return NaN; // tan(90) is undefined
      }
      const val = Math.tan(rad);
      return Math.abs(val) < 1e-15 ? 0 : val;
    },
    asin: (x: number) => {
      const rad = Math.asin(x);
      return isDeg ? radToDeg(rad) : rad;
    },
    acos: (x: number) => {
      const rad = Math.acos(x);
      return isDeg ? radToDeg(rad) : rad;
    },
    atan: (x: number) => {
      const rad = Math.atan(x);
      return isDeg ? radToDeg(rad) : rad;
    },
    log: (x: number) => Math.log10(x),
    ln: (x: number) => Math.log(x),
    sqrt: (x: number) => Math.sqrt(x),
    cbrt: (x: number) => Math.cbrt(x),
    factorial,
    fact: factorial,
  };
};

/**
 * Normalizes Eastern Arabic (٠-٩), Persian/Urdu (۰-۹), and Bengali (০-৯) digits
 * as well as Arabic decimal separators (٫) and commas (٬, ،) into standard ASCII.
 */
export const normalizeMultilingualDigits = (input: string): string => {
  if (!input) return '';
  return input
    // Eastern Arabic numerals ٠-٩
    .replace(/[\u0660-\u0669]/g, (d) => (d.charCodeAt(0) - 0x0660).toString())
    // Persian / Urdu numerals ۰-۹
    .replace(/[\u06F0-\u06F9]/g, (d) => (d.charCodeAt(0) - 0x06F0).toString())
    // Bengali numerals ০-৯
    .replace(/[\u09E6-\u09EF]/g, (d) => (d.charCodeAt(0) - 0x09E6).toString())
    // Arabic decimal separator ٫ (U+066B) -> .
    .replace(/\u066B/g, '.')
    // Arabic thousands separator ٬ (U+066C) and Arabic comma ، (U+060C) -> ,
    .replace(/[\u066C\u060C]/g, ',');
};

/**
 * Preprocess user-friendly mathematical expressions into mathjs-compatible strings.
 * Fully supports English, Arabic, and Bangla numbers and operators.
 */
export const preprocessExpression = (expr: string): string => {
  if (!expr) return '';

  let sanitized = expr;

  // 1. Normalize Eastern Arabic, Persian, and Bengali numerals and punctuation
  sanitized = normalizeMultilingualDigits(sanitized);

  // 2. Replace localized mathematical keywords
  // Bangla math words
  sanitized = sanitized
    .replace(/(?<![\u0980-\u09FF])যোগ(?![\u0980-\u09FF])/gu, ' + ')
    .replace(/(?<![\u0980-\u09FF])বিয়োগ(?![\u0980-\u09FF])/gu, ' - ')
    .replace(/(?<![\u0980-\u09FF])গুণ(?![\u0980-\u09FF])/gu, ' * ')
    .replace(/(?<![\u0980-\u09FF])ভাগ(?![\u0980-\u09FF])/gu, ' / ')
    .replace(/(?<![\u0980-\u09FF])শতাংশ(?![\u0980-\u09FF])/gu, '%');

  // Arabic math words
  sanitized = sanitized
    .replace(/(?<![\u0600-\u06FF])زائد(?![\u0600-\u06FF])/gu, ' + ')
    .replace(/(?<![\u0600-\u06FF])مع(?![\u0600-\u06FF])/gu, ' + ')
    .replace(/(?<![\u0600-\u06FF])ناقص(?![\u0600-\u06FF])/gu, ' - ')
    .replace(/(?<![\u0600-\u06FF])طرح(?![\u0600-\u06FF])/gu, ' - ')
    .replace(/(?<![\u0600-\u06FF])ضرب(?![\u0600-\u06FF])/gu, ' * ')
    .replace(/(?<![\u0600-\u06FF])قسمة(?![\u0600-\u06FF])/gu, ' / ')
    .replace(/(?<![\u0600-\u06FF])(بالمئة|في المئة|نسبة)(?![\u0600-\u06FF])/gu, '%');

  // 3. Replace unicode operators with standard symbols
  sanitized = sanitized.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');

  // 4. Replace standalone constants with their numeric equivalents or mathjs symbols
  sanitized = sanitized.replace(/π/g, 'pi');

  // 5. Replace factorial (e.g. 5! -> factorial(5))
  sanitized = sanitized.replace(/(\d+(\.\d+)?)!/g, 'factorial($1)');

  // 6. Handle percentages
  // "a + b%" -> "a + (a * b / 100)"
  // "a - b%" -> "a - (a * b / 100)"
  sanitized = sanitized.replace(
    /(\d+(\.\d+)?)\s*([+-])\s*(\d+(\.\d+)?)%/g,
    '($1 $3 ($1 * $4 / 100))'
  );

  // Standalone percentage "x%" -> "(x / 100)"
  sanitized = sanitized.replace(/(\d+(\.\d+)?)%/g, '($1 / 100)');

  // Replace exponent operator ^ with mathjs power
  sanitized = sanitized.replace(/\^/g, '^');

  return sanitized;
};

/**
 * Format calculation result to avoid floating point precision issues (e.g. 0.30000000000000004 -> 0.3)
 */
export const formatResult = (num: number): string => {
  if (isNaN(num)) return 'Error';
  if (!isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';

  // Fix precision quirks
  const precisionFix = parseFloat(num.toPrecision(12));

  // Very large or very small scientific notation handling
  if (Math.abs(precisionFix) >= 1e12 || (Math.abs(precisionFix) > 0 && Math.abs(precisionFix) < 1e-6)) {
    return precisionFix.toExponential(6).replace(/e\+?/, 'e');
  }

  // Format with thousand separators
  const parts = precisionFix.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

/**
 * Evaluates an expression with a given angle unit.
 */
export const evaluate = (expression: string, angleUnit: AngleUnit = 'deg'): number => {
  if (!expression.trim()) return 0;

  try {
    const preprocessed = preprocessExpression(expression);
    const customFunctions = getCustomFunctions(angleUnit);

    const result = mathEvaluate(preprocessed, {
      ...customFunctions,
      pi: Math.PI,
      e: Math.E,
    });

    if (typeof result !== 'number' || isNaN(result)) {
      throw new Error('Invalid calculation');
    }

    return result;
  } catch (err) {
    throw new Error('Calculation error');
  }
};

/**
 * Tries to calculate a live preview for an incomplete or actively typed expression.
 * Returns null if it cannot be previewed cleanly.
 */
export const getLivePreview = (expression: string, angleUnit: AngleUnit = 'deg'): string | null => {
  const trimmed = expression.trim();
  if (!trimmed) return null;

  // If it's just a single number, don't show live preview
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return null;

  // If it ends with an operator, strip it for temporary preview
  let candidate = trimmed.replace(/[+\-*/^÷×−.]$/, '');

  // Auto-close open parentheses
  const openCount = (candidate.match(/\(/g) || []).length;
  const closeCount = (candidate.match(/\)/g) || []).length;
  if (openCount > closeCount) {
    candidate += ')'.repeat(openCount - closeCount);
  }

  try {
    const result = evaluate(candidate, angleUnit);
    const formatted = formatResult(result);
    // Don't show preview if it's identical to the trimmed input or error
    if (formatted === 'Error' || formatted === trimmed) return null;
    return formatted;
  } catch {
    return null;
  }
};

/**
 * Beautifies an expression for UI display (e.g. converting * to × and / to ÷)
 */
export const formatDisplayExpression = (expr: string): string => {
  return expr
    .replace(/\*/g, ' × ')
    .replace(/\//g, ' ÷ ')
    .replace(/\+/g, ' + ')
    .replace(/(?<=\S)-(?=\S)/g, ' − ')
    .replace(/\s+/g, ' ')
    .trim();
};