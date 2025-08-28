/**
 * Math Tools for MCP Server
 * Mathematical calculations and number utilities
 */
export class MathTools {
    /**
     * Perform basic arithmetic calculations
     */
    static calculate(expression) {
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
        }
        catch (error) {
            return {
                success: false,
                error: `Calculation error: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Compare two numbers with various operators
     */
    static compare(num1, num2, operator) {
        try {
            const n1 = typeof num1 === 'string' ? parseFloat(num1) : num1;
            const n2 = typeof num2 === 'string' ? parseFloat(num2) : num2;
            if (!Number.isFinite(n1) || !Number.isFinite(n2)) {
                return {
                    success: false,
                    error: 'Both values must be valid numbers'
                };
            }
            let result;
            let description;
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
        }
        catch (error) {
            return {
                success: false,
                error: `Comparison error: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Extract and parse numbers from text
     */
    static parseNumbers(text, options) {
        try {
            const opts = {
                integersOnly: false,
                includeNegative: true,
                includeDecimals: true,
                ...options
            };
            let pattern;
            if (opts.integersOnly) {
                pattern = opts.includeNegative ? '-?\\d+' : '\\d+';
            }
            else {
                if (opts.includeDecimals) {
                    pattern = opts.includeNegative ? '-?\\d*\\.?\\d+' : '\\d*\\.?\\d+';
                }
                else {
                    pattern = opts.includeNegative ? '-?\\d+' : '\\d+';
                }
            }
            const regex = new RegExp(pattern, 'g');
            const matches = text.match(regex) || [];
            const numbers = matches
                .map(match => parseFloat(match))
                .filter(num => Number.isFinite(num));
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
                    pattern: pattern
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Number parsing error: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Format numbers with various options
     */
    static formatNumber(number, options) {
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
            let formatted;
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
            }
            else {
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
        }
        catch (error) {
            return {
                success: false,
                error: `Number formatting error: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Clean and sanitize numeric strings
     */
    static sanitizeNumber(input, options) {
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
        }
        catch (error) {
            return {
                success: false,
                error: `Number sanitization error: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Perform statistical calculations on an array of numbers
     */
    static statistics(numbers) {
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
            const frequency = {};
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
        }
        catch (error) {
            return {
                success: false,
                error: `Statistics calculation error: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
}
//# sourceMappingURL=math-tools.js.map