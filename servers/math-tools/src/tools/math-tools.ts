/**
 * Math Tools for MCP Server
 * Mathematical calculations and number utilities
 */

export interface MathToolResult {
  success: boolean;
  result?: any;
  error?: string;
  metadata?: Record<string, any>;
}

export default class MathTools {
  /**
   * Perform basic arithmetic calculations.
   * @param {string} expression - Arithmetic expression to evaluate. Only digits, +, -, *, /, (, ) and spaces are allowed.
   * @returns {MathToolResult} Result with evaluated value and metadata, or an error message.
   */
  static calculate(expression: string): MathToolResult {
    try {
      // Sanitize the expression - only allow numbers, operators, parentheses, and whitespace
      const sanitized = expression.replace(/[^0-9+\-*/().\ ]/g, '');
      
      if (sanitized !== expression) {
        return {
          success: false,
          error: 'Invalid characters in expression. Only numbers, +, -, *, /, (, ), and spaces are allowed.'
        };
      }

      // Check for empty expression
      if (!sanitized.trim()) {
        return {
          success: false,
          error: 'Empty expression provided'
        };
      }

      // Check for malformed expressions (consecutive operators)
      if (/[+\-*/]{2,}/.test(sanitized.replace(/\s/g, ''))) {
        return {
          success: false,
          error: 'Calculation error: Malformed expression with consecutive operators'
        };
      }

      // Evaluate the expression safely
      const result = Function(`"use strict"; return (${sanitized})`)();
      
      if (!Number.isFinite(result)) {
        return {
          success: false,
          error: 'Result is not a finite number (division by zero or invalid operation)'
        };
      }

      return {
        success: true,
        result: {
          expression: expression,
          sanitized: sanitized,
          value: result,
          type: Number.isInteger(result) ? 'integer' : 'decimal'
        },
        metadata: {
          originalExpression: expression,
          evaluatedAs: sanitized
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Calculation error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Compare two numbers with various operators.
   * @param {number|string} num1 - First value to compare (number or numeric string).
   * @param {number|string} num2 - Second value to compare (number or numeric string).
   * @param {'>'|'<'|'>='|'<='|'=='|'!='|'==='|'!==' } operator - Comparison operator to use.
   * @returns {MathToolResult} Result containing boolean outcome and description.
   */
  static compare(
    num1: number | string, 
    num2: number | string, 
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=' | '===' | '!=='
  ): MathToolResult {
    try {
      const n1 = typeof num1 === 'string' ? parseFloat(num1) : num1;
      const n2 = typeof num2 === 'string' ? parseFloat(num2) : num2;

      if (!Number.isFinite(n1) || !Number.isFinite(n2)) {
        return {
          success: false,
          error: 'Both values must be valid numbers'
        };
      }

      let result: boolean;
      let description: string;

      switch (operator) {
        case '>':
          result = n1 > n2;
          description = `${n1} is greater than ${n2}`;
          break;
        case '<':
          result = n1 < n2;
          description = `${n1} is less than ${n2}`;
          break;
        case '>=':
          result = n1 >= n2;
          description = `${n1} is greater than or equal to ${n2}`;
          break;
        case '<=':
          result = n1 <= n2;
          description = `${n1} is less than or equal to ${n2}`;
          break;
        case '==':
          result = n1 == n2;
          description = `${n1} equals ${n2} (loose equality)`;
          break;
        case '!=':
          result = n1 != n2;
          description = `${n1} does not equal ${n2} (loose inequality)`;
          break;
        case '===':
          result = n1 === n2;
          description = `${n1} strictly equals ${n2}`;
          break;
        case '!==':
          result = n1 !== n2;
          description = `${n1} does not strictly equal ${n2}`;
          break;
        default:
          return {
            success: false,
            error: `Invalid operator: ${operator}. Use >, <, >=, <=, ==, !=, ===, or !==`
          };
      }

      return {
        success: true,
        result: {
          comparison: `${n1} ${operator} ${n2}`,
          result: result,
          description: description,
          values: { num1: n1, num2: n2 }
        },
        metadata: {
          operator,
          originalInputs: { num1, num2 }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Comparison error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Extract and parse numbers from text.
   * @param {string} text - Source text to scan for numbers.
   * @param {Object} [options] - Parsing options.
   * @param {boolean} [options.integersOnly=false] - When true, return only integer values (decimal parts are truncated).
   * @param {boolean} [options.includeNegative=true] - Whether to include negative numbers; if false, negatives are converted to positive.
   * @param {boolean} [options.includeDecimals=true] - Whether to include decimal numbers.
   * @returns {MathToolResult} Parsed numbers and statistics.
   */
  static parseNumbers(text: string, options?: {
    integersOnly?: boolean;
    includeNegative?: boolean;
    includeDecimals?: boolean;
  }): MathToolResult {
    try {
      const opts = {
        integersOnly: false,
        includeNegative: true,
        includeDecimals: true,
        ...options
      };

      // First, find all numbers (integers and decimals)
      const allNumbersPattern = '-?\\d+(?:\\.\\d+)?';
      const allNumbersRegex = new RegExp(allNumbersPattern, 'g');
      const matches = text.match(allNumbersRegex) || [];
      
      let numbers: number[] = [];
      
      for (const match of matches) {
        const num = parseFloat(match);
        if (!Number.isFinite(num)) continue;
        
        let processedNum = num;
        
        // Handle negative numbers
        if (!opts.includeNegative && num < 0) {
          // Convert negative to positive (absolute value)
          processedNum = Math.abs(num);
        }
        
        // Handle integersOnly and includeDecimals options
        if (opts.integersOnly || !opts.includeDecimals) {
          // Only include integers, but for decimal numbers like 12.99,
          // extract the integer part (12) when integersOnly is true
          if (Number.isInteger(processedNum)) {
            numbers.push(processedNum);
          } else {
            // Extract integer part from decimal numbers
            const integerPart = Math.trunc(processedNum);
            if (integerPart !== 0 || match.includes('0')) {
              numbers.push(integerPart);
            }
          }
        } else {
          // Include all numbers (integers and decimals)
          numbers.push(processedNum);
        }
      }

      const integers = numbers.filter(n => Number.isInteger(n));
      const decimals = numbers.filter(n => !Number.isInteger(n));

      return {
        success: true,
        result: {
          numbers,
          count: numbers.length,
          integers: integers,
          decimals: decimals,
          sum: numbers.reduce((sum, n) => sum + n, 0),
          average: numbers.length > 0 ? numbers.reduce((sum, n) => sum + n, 0) / numbers.length : 0,
          min: numbers.length > 0 ? Math.min(...numbers) : null,
          max: numbers.length > 0 ? Math.max(...numbers) : null
        },
        metadata: {
          originalText: text,
          options: opts,
          pattern: allNumbersPattern
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Number parsing error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Format numbers with various options.
   * @param {number|string} number - Number to format (number or numeric string).
   * @param {Object} [options] - Formatting options.
   * @param {number} [options.decimals=2] - Number of decimal places.
   * @param {string} [options.thousandsSeparator=","] - Thousands separator character.
   * @param {string} [options.decimalSeparator= "."] - Decimal separator character.
   * @param {string} [options.prefix=""] - String to prepend.
   * @param {string} [options.suffix=""] - String to append.
   * @param {boolean} [options.percentage=false] - When true, multiply by 100 and append a %.
   * @param {string} [options.currency] - ISO 4217 currency code for localized currency formatting.
   * @param {string} [options.locale="en-US"] - Locale used for currency formatting.
   * @returns {MathToolResult} Formatted string and numeric value.
   */
  static formatNumber(
    number: number | string,
    options?: {
      decimals?: number;
      thousandsSeparator?: string;
      decimalSeparator?: string;
      prefix?: string;
      suffix?: string;
      percentage?: boolean;
      currency?: string;
      locale?: string;
    }
  ): MathToolResult {
    try {
      const num = typeof number === 'string' ? parseFloat(number) : number;
      
      if (!Number.isFinite(num)) {
        return {
          success: false,
          error: 'Invalid number provided'
        };
      }

      const opts = {
        decimals: 2,
        thousandsSeparator: ',',
        decimalSeparator: '.',
        prefix: '',
        suffix: '',
        percentage: false,
        currency: undefined,
        locale: 'en-US',
        ...options
      };

      let result = num;
      let formatted: string;

      // Handle percentage
      if (opts.percentage) {
        result = num * 100;
      }

      // Handle currency formatting
      if (opts.currency) {
        formatted = new Intl.NumberFormat(opts.locale, {
          style: 'currency',
          currency: opts.currency,
          minimumFractionDigits: opts.decimals,
          maximumFractionDigits: opts.decimals
        }).format(result);
      } else {
        // Manual formatting
        formatted = result.toFixed(opts.decimals);
        
        // Replace decimal separator
        if (opts.decimalSeparator !== '.') {
          formatted = formatted.replace('.', opts.decimalSeparator);
        }
        
        // Add thousands separator
        if (opts.thousandsSeparator) {
          const parts = formatted.split(opts.decimalSeparator);
          parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, opts.thousandsSeparator);
          formatted = parts.join(opts.decimalSeparator);
        }
        
        // Add prefix and suffix
        formatted = opts.prefix + formatted + opts.suffix;
        
        // Add percentage symbol
        if (opts.percentage) {
          formatted += '%';
        }
      }

      return {
        success: true,
        result: {
          original: number,
          formatted: formatted,
          numeric: result,
          options: opts
        },
        metadata: {
          originalNumber: number,
          appliedOptions: opts
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Number formatting error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Clean and sanitize numeric strings.
   * @param {string} input - Raw input string containing numeric content.
   * @param {Object} [options] - Sanitization options.
   * @param {boolean} [options.allowDecimals=true] - Whether to allow decimal separator.
   * @param {boolean} [options.allowNegative=true] - Whether to allow negative numbers.
   * @param {string} [options.thousandsSeparator=","] - Thousands separator to remove.
   * @param {string} [options.decimalSeparator="."] - Decimal separator to normalize to '.'.
   * @returns {MathToolResult} Sanitized string and parsed number if valid.
   */
  static sanitizeNumber(
    input: string,
    options?: {
      allowDecimals?: boolean;
      allowNegative?: boolean;
      thousandsSeparator?: string;
      decimalSeparator?: string;
    }
  ): MathToolResult {
    try {
      const opts = {
        allowDecimals: true,
        allowNegative: true,
        thousandsSeparator: ',',
        decimalSeparator: '.',
        ...options
      };

      let sanitized = input.trim();
      const original = sanitized;

      // Remove all non-numeric characters except specified separators and minus
      let allowedChars = '\\d';
      
      if (opts.allowNegative) {
        allowedChars += '\\-';
      }
      
      if (opts.allowDecimals && opts.decimalSeparator) {
        allowedChars += '\\' + opts.decimalSeparator;
      }
      
      if (opts.thousandsSeparator) {
        allowedChars += '\\' + opts.thousandsSeparator;
      }

      const cleanupRegex = new RegExp(`[^${allowedChars}]`, 'g');
      sanitized = sanitized.replace(cleanupRegex, '');

      // Remove thousands separators
      if (opts.thousandsSeparator) {
        sanitized = sanitized.replace(new RegExp('\\' + opts.thousandsSeparator, 'g'), '');
      }

      // Handle decimal separator
      if (opts.decimalSeparator !== '.') {
        sanitized = sanitized.replace(new RegExp('\\' + opts.decimalSeparator, 'g'), '.');
      }

      // Handle multiple decimal points
      const decimalParts = sanitized.split('.');
      if (decimalParts.length > 2) {
        sanitized = decimalParts[0] + '.' + decimalParts.slice(1).join('');
      }

      // Handle multiple negative signs
      const negativeCount = (sanitized.match(/-/g) || []).length;
      if (negativeCount > 1) {
        sanitized = sanitized.replace(/-/g, '');
        if (negativeCount % 2 === 1) {
          sanitized = '-' + sanitized;
        }
      }

      // Ensure negative sign is at the beginning
      if (sanitized.includes('-') && !sanitized.startsWith('-')) {
        sanitized = sanitized.replace(/-/g, '');
        sanitized = '-' + sanitized;
      }

      const parsed = parseFloat(sanitized);
      const isValid = Number.isFinite(parsed);

      return {
        success: true,
        result: {
          original: input,
          sanitized: sanitized,
          parsed: isValid ? parsed : null,
          isValid: isValid,
          changes: original !== sanitized ? 'sanitized' : 'no changes needed'
        },
        metadata: {
          options: opts,
          removedCharacters: original.replace(new RegExp(`[${allowedChars}]`, 'g'), '')
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Number sanitization error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Perform statistical calculations on an array of numbers.
   * @param {(number|string)[]} numbers - Values to analyze (numbers or numeric strings).
   * @returns {MathToolResult} Summary statistics including mean, median, mode, etc.
   */
  static statistics(numbers: (number | string)[]): MathToolResult {
    try {
      const nums = numbers
        .map(n => typeof n === 'string' ? parseFloat(n) : n)
        .filter(n => Number.isFinite(n));

      if (nums.length === 0) {
        return {
          success: false,
          error: 'No valid numbers provided'
        };
      }

      const sorted = [...nums].sort((a, b) => a - b);
      const sum = nums.reduce((acc, n) => acc + n, 0);
      const mean = sum / nums.length;
      
      // Calculate median
      const median = nums.length % 2 === 0
        ? (sorted[nums.length / 2 - 1] + sorted[nums.length / 2]) / 2
        : sorted[Math.floor(nums.length / 2)];

      // Calculate mode
      const frequency: { [key: number]: number } = {};
      nums.forEach(n => {
        frequency[n] = (frequency[n] || 0) + 1;
      });
      const maxFreq = Math.max(...Object.values(frequency));
      const modes = Object.keys(frequency)
        .filter(key => frequency[parseFloat(key)] === maxFreq)
        .map(key => parseFloat(key));

      // Calculate variance and standard deviation
      const variance = nums.reduce((acc, n) => acc + Math.pow(n - mean, 2), 0) / nums.length;
      const standardDeviation = Math.sqrt(variance);

      return {
        success: true,
        result: {
          count: nums.length,
          sum: sum,
          mean: mean,
          median: median,
          mode: modes.length === nums.length ? null : modes,
          min: Math.min(...nums),
          max: Math.max(...nums),
          range: Math.max(...nums) - Math.min(...nums),
          variance: variance,
          standardDeviation: standardDeviation,
          sorted: sorted
        },
        metadata: {
          originalCount: numbers.length,
          invalidNumbers: numbers.length - nums.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Statistics calculation error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}
