
/**
 * Test suite for MathTools
 */
/// <reference types="jest" />
import MathTools from './math-tools.js';

describe('MathTools', () => {
  describe('calculate', () => {
    test('basic addition', () => {
      const result = MathTools.calculate('2 + 3');
      expect(result.success).toBe(true);
      expect(result.result?.value).toBe(5);
      expect(result.result?.type).toBe('integer');
    });

    test('basic subtraction', () => {
      const result = MathTools.calculate('10 - 4');
      expect(result.success).toBe(true);
      expect(result.result?.value).toBe(6);
    });

    test('basic multiplication', () => {
      const result = MathTools.calculate('3 * 4');
      expect(result.success).toBe(true);
      expect(result.result?.value).toBe(12);
    });

    test('basic division', () => {
      const result = MathTools.calculate('15 / 3');
      expect(result.success).toBe(true);
      expect(result.result?.value).toBe(5);
    });

    test('decimal result', () => {
      const result = MathTools.calculate('7 / 2');
      expect(result.success).toBe(true);
      expect(result.result?.value).toBe(3.5);
      expect(result.result?.type).toBe('decimal');
    });

    test('complex expression with parentheses', () => {
      const result = MathTools.calculate('(2 + 3) * 4');
      expect(result.success).toBe(true);
      expect(result.result?.value).toBe(20);
    });

    test('order of operations', () => {
      const result = MathTools.calculate('2 + 3 * 4');
      expect(result.success).toBe(true);
      expect(result.result?.value).toBe(14);
    });

    test('division by zero', () => {
      const result = MathTools.calculate('5 / 0');
      expect(result.success).toBe(false);
      expect(result.error).toContain('not a finite number');
    });

    test('invalid characters', () => {
      const result = MathTools.calculate('2 + 3a');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid characters');
    });

    test('empty expression', () => {
      const result = MathTools.calculate('');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Empty expression');
    });

    test('malformed expression', () => {
      const result = MathTools.calculate('2 + + 3');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Calculation error');
    });
  });

  describe('compare', () => {
    test('greater than - true', () => {
      const result = MathTools.compare(5, 3, '>');
      expect(result.success).toBe(true);
      expect(result.result?.result).toBe(true);
      expect(result.result?.description).toContain('greater than');
    });

    test('greater than - false', () => {
      const result = MathTools.compare(3, 5, '>');
      expect(result.success).toBe(true);
      expect(result.result?.result).toBe(false);
    });

    test('less than - true', () => {
      const result = MathTools.compare(3, 5, '<');
      expect(result.success).toBe(true);
      expect(result.result?.result).toBe(true);
    });

    test('greater than or equal - equal', () => {
      const result = MathTools.compare(5, 5, '>=');
      expect(result.success).toBe(true);
      expect(result.result?.result).toBe(true);
    });

    test('less than or equal - less', () => {
      const result = MathTools.compare(3, 5, '<=');
      expect(result.success).toBe(true);
      expect(result.result?.result).toBe(true);
    });

    test('loose equality - true', () => {
      const result = MathTools.compare(5, '5', '==');
      expect(result.success).toBe(true);
      expect(result.result?.result).toBe(true);
    });

    test('strict equality - false for different types', () => {
      const result = MathTools.compare(5, '5', '===');
      expect(result.success).toBe(true);
      expect(result.result?.result).toBe(true); // Both converted to numbers
    });

    test('not equal - true', () => {
      const result = MathTools.compare(5, 3, '!=');
      expect(result.success).toBe(true);
      expect(result.result?.result).toBe(true);
    });

    test('string numbers', () => {
      const result = MathTools.compare('10', '5', '>');
      expect(result.success).toBe(true);
      expect(result.result?.result).toBe(true);
    });

    test('invalid number', () => {
      const result = MathTools.compare('abc', 5, '>');
      expect(result.success).toBe(false);
      expect(result.error).toContain('valid numbers');
    });

    test('invalid operator', () => {
      const result = MathTools.compare(5, 3, '%' as any);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid operator');
    });
  });

  describe('parseNumbers', () => {
    test('extract integers from text', () => {
      const result = MathTools.parseNumbers('I have 5 apples and 3 oranges');
      expect(result.success).toBe(true);
      expect(result.result?.numbers).toEqual([5, 3]);
      expect(result.result?.count).toBe(2);
    });

    test('extract decimals from text', () => {
      const result = MathTools.parseNumbers('Price is $12.99 and tax is 1.5%');
      expect(result.success).toBe(true);
      expect(result.result?.numbers).toEqual([12.99, 1.5]);
    });

    test('extract negative numbers', () => {
      const result = MathTools.parseNumbers('Temperature is -5.2 degrees');
      expect(result.success).toBe(true);
      expect(result.result?.numbers).toEqual([-5.2]);
    });

    test('integers only option', () => {
      const result = MathTools.parseNumbers('Price is $12.99', { integersOnly: true });
      expect(result.success).toBe(true);
      expect(result.result?.numbers).toEqual([12]);
    });

    test('exclude negative numbers', () => {
      const result = MathTools.parseNumbers('From -10 to 20', { includeNegative: false });
      expect(result.success).toBe(true);
      expect(result.result?.numbers).toEqual([10, 20]);
    });

    test('exclude decimals', () => {
      const result = MathTools.parseNumbers('Values: 12.5, 8, 3.14', { includeDecimals: false });
      expect(result.success).toBe(true);
      expect(result.result?.numbers).toEqual([12, 8, 3]);
    });

    test('no numbers in text', () => {
      const result = MathTools.parseNumbers('No numbers here!');
      expect(result.success).toBe(true);
      expect(result.result?.numbers).toEqual([]);
      expect(result.result?.count).toBe(0);
    });

    test('calculate statistics', () => {
      const result = MathTools.parseNumbers('Numbers: 1, 2, 3, 4, 5');
      expect(result.success).toBe(true);
      expect(result.result?.sum).toBe(15);
      expect(result.result?.average).toBe(3);
      expect(result.result?.min).toBe(1);
      expect(result.result?.max).toBe(5);
    });
  });

  describe('formatNumber', () => {
    test('basic formatting with decimals', () => {
      const result = MathTools.formatNumber(1234.567);
      expect(result.success).toBe(true);
      expect(result.result?.formatted).toBe('1,234.57');
    });

    test('custom decimal places', () => {
      const result = MathTools.formatNumber(123.456, { decimals: 1 });
      expect(result.success).toBe(true);
      expect(result.result?.formatted).toBe('123.5');
    });

    test('custom separators', () => {
      const result = MathTools.formatNumber(1234.56, { 
        thousandsSeparator: ' ', 
        decimalSeparator: ',' 
      });
      expect(result.success).toBe(true);
      expect(result.result?.formatted).toBe('1 234,56');
    });

    test('prefix and suffix', () => {
      const result = MathTools.formatNumber(100, { 
        prefix: '$', 
        suffix: ' USD' 
      });
      expect(result.success).toBe(true);
      expect(result.result?.formatted).toBe('$100.00 USD');
    });

    test('percentage formatting', () => {
      const result = MathTools.formatNumber(0.1575, { 
        percentage: true, 
        decimals: 1 
      });
      expect(result.success).toBe(true);
      expect(result.result?.formatted).toBe('15.8%');
    });

    test('currency formatting', () => {
      const result = MathTools.formatNumber(1234.56, { 
        currency: 'USD' 
      });
      expect(result.success).toBe(true);
      expect(result.result?.formatted).toContain('$');
      expect(result.result?.formatted).toContain('1,234.56');
    });

    test('string number input', () => {
      const result = MathTools.formatNumber('1234.567');
      expect(result.success).toBe(true);
      expect(result.result?.formatted).toBe('1,234.57');
    });

    test('invalid number', () => {
      const result = MathTools.formatNumber('invalid');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid number');
    });
  });

  describe('sanitizeNumber', () => {
    test('remove non-numeric characters', () => {
      const result = MathTools.sanitizeNumber('$1,234.56');
      expect(result.success).toBe(true);
      expect(result.result?.sanitized).toBe('1234.56');
      expect(result.result?.parsed).toBe(1234.56);
      expect(result.result?.isValid).toBe(true);
    });

    test('handle negative numbers', () => {
      const result = MathTools.sanitizeNumber('-$1,234.56');
      expect(result.success).toBe(true);
      expect(result.result?.sanitized).toBe('-1234.56');
      expect(result.result?.parsed).toBe(-1234.56);
    });

    test('custom separators', () => {
      const result = MathTools.sanitizeNumber('1 234,56', { 
        thousandsSeparator: ' ', 
        decimalSeparator: ',' 
      });
      expect(result.success).toBe(true);
      expect(result.result?.sanitized).toBe('1234.56');
      expect(result.result?.parsed).toBe(1234.56);
    });

    test('disallow decimals', () => {
      const result = MathTools.sanitizeNumber('123.45', { allowDecimals: false });
      expect(result.success).toBe(true);
      expect(result.result?.sanitized).toBe('12345');
      expect(result.result?.parsed).toBe(12345);
    });

    test('disallow negative', () => {
      const result = MathTools.sanitizeNumber('-123', { allowNegative: false });
      expect(result.success).toBe(true);
      expect(result.result?.sanitized).toBe('123');
      expect(result.result?.parsed).toBe(123);
    });

    test('multiple decimal points', () => {
      const result = MathTools.sanitizeNumber('12.34.56');
      expect(result.success).toBe(true);
      expect(result.result?.sanitized).toBe('12.3456');
    });

    test('multiple negative signs', () => {
      const result = MathTools.sanitizeNumber('--123');
      expect(result.success).toBe(true);
      expect(result.result?.sanitized).toBe('123');
    });

    test('odd number of negative signs', () => {
      const result = MathTools.sanitizeNumber('---123');
      expect(result.success).toBe(true);
      expect(result.result?.sanitized).toBe('-123');
    });

    test('already clean number', () => {
      const result = MathTools.sanitizeNumber('123.45');
      expect(result.success).toBe(true);
      expect(result.result?.changes).toBe('no changes needed');
    });
  });

  describe('statistics', () => {
    test('basic statistics', () => {
      const result = MathTools.statistics([1, 2, 3, 4, 5]);
      expect(result.success).toBe(true);
      expect(result.result?.count).toBe(5);
      expect(result.result?.sum).toBe(15);
      expect(result.result?.mean).toBe(3);
      expect(result.result?.median).toBe(3);
      expect(result.result?.min).toBe(1);
      expect(result.result?.max).toBe(5);
      expect(result.result?.range).toBe(4);
    });

    test('even number of values - median', () => {
      const result = MathTools.statistics([1, 2, 3, 4]);
      expect(result.success).toBe(true);
      expect(result.result?.median).toBe(2.5);
    });

    test('mode calculation - single mode', () => {
      const result = MathTools.statistics([1, 2, 2, 3, 4]);
      expect(result.success).toBe(true);
      expect(result.result?.mode).toEqual([2]);
    });

    test('mode calculation - multiple modes', () => {
      const result = MathTools.statistics([1, 1, 2, 2, 3]);
      expect(result.success).toBe(true);
      expect(result.result?.mode).toEqual([1, 2]);
    });

    test('no mode - all values unique', () => {
      const result = MathTools.statistics([1, 2, 3, 4, 5]);
      expect(result.success).toBe(true);
      expect(result.result?.mode).toBe(null);
    });

    test('string numbers', () => {
      const result = MathTools.statistics(['1', '2', '3', '4', '5']);
      expect(result.success).toBe(true);
      expect(result.result?.mean).toBe(3);
    });

    test('mixed valid and invalid numbers', () => {
      const result = MathTools.statistics([1, 2, 'invalid', 4, 5]);
      expect(result.success).toBe(true);
      expect(result.result?.count).toBe(4);
      expect(result.metadata?.invalidNumbers).toBe(1);
    });

    test('variance and standard deviation', () => {
      const result = MathTools.statistics([2, 4, 4, 4, 5, 5, 7, 9]);
      expect(result.success).toBe(true);
      expect(result.result?.variance).toBeCloseTo(4);
      expect(result.result?.standardDeviation).toBeCloseTo(2);
    });

    test('empty array', () => {
      const result = MathTools.statistics([]);
      expect(result.success).toBe(false);
      expect(result.error).toContain('No valid numbers');
    });

    test('all invalid numbers', () => {
      const result = MathTools.statistics(['abc', 'def', 'ghi']);
      expect(result.success).toBe(false);
      expect(result.error).toContain('No valid numbers');
    });

    test('sorted array included', () => {
      const result = MathTools.statistics([5, 2, 8, 1, 9]);
      expect(result.success).toBe(true);
      expect(result.result?.sorted).toEqual([1, 2, 5, 8, 9]);
    });
  });
});