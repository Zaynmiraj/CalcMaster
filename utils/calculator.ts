import { evaluate as mathEvaluate } from 'mathjs';

// Custom functions for calculator
const customFunctions = {
  sin: (x: number) => Math.sin(x),
  cos: (x: number) => Math.cos(x),
  tan: (x: number) => Math.tan(x),
  log: (x: number) => Math.log10(x),
  ln: (x: number) => Math.log(x),
  sqrt: (x: number) => Math.sqrt(x),
  factorial: (n: number) => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }
};

// Preprocess the expression before evaluation
const preprocessExpression = (expr: string): string => {
  // Replace percentage calculations
  expr = expr.replace(/(\d+(\.\d+)?)%/g, '($1/100)');
  
  // Replace ^ with ** for exponentiation
  expr = expr.replace(/\^/g, '**');
  
  // Replace factorial notation
  expr = expr.replace(/(\d+)!/g, (match, num) => {
    return `factorial(${num})`;
  });
  
  return expr;
};

// Main evaluate function
export const evaluate = (expression: string): number => {
  try {
    const processedExpression = preprocessExpression(expression);
    const result = mathEvaluate(processedExpression, {
      ...customFunctions
    });
    
    // Handle non-numeric results
    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('Invalid result');
    }
    
    return result;
  } catch (error) {
    throw new Error('Calculation error');
  }
};