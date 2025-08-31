/**
 * Comprehensive test suite for DateTools
 * Tests all public methods with multiple test cases including success and failure scenarios
 */
/// <reference types="jest" />
import DateTools, { DateToolResult } from './date-tools.js';

describe('DateTools', () => {
  describe('parse', () => {
    test('should parse ISO date string successfully', () => {
      const result = DateTools.parse('2023-12-25T10:30:00Z');
      
      expect(result.success).toBe(true);
      expect(result.result.original).toBe('2023-12-25T10:30:00Z');
      expect(result.result.components.year).toBe(2023);
      expect(result.result.components.month).toBe(12);
      expect(result.result.components.day).toBe(25);
      expect(result.result.components.hour).toBe(10);
      expect(result.result.components.minute).toBe(30);
      expect(result.result.components.weekdayName).toBe('Monday');
      expect(result.result.components.monthName).toBe('December');
      expect(result.metadata?.timezone).toBe('UTC');
    });

    test('should parse YYYY-MM-DD format', () => {
      const result = DateTools.parse('2023-06-15');
      
      expect(result.success).toBe(true);
      expect(result.result.components.year).toBe(2023);
      expect(result.result.components.month).toBe(6);
      expect(result.result.components.day).toBe(15);
    });

    test('should parse MM/DD/YYYY format', () => {
      const result = DateTools.parse('03/14/2023');
      
      expect(result.success).toBe(true);
      expect(result.result.components.year).toBe(2023);
      expect(result.result.components.month).toBe(3);
      expect(result.result.components.day).toBe(14);
    });

    test('should parse with custom options', () => {
      const result = DateTools.parse('2023-01-01', {
        timezone: 'America/New_York',
        locale: 'en-US',
        strict: true
      });
      
      expect(result.success).toBe(true);
      expect(result.metadata?.timezone).toBe('America/New_York');
      expect(result.metadata?.locale).toBe('en-US');
    });

    test('should fail to parse invalid date string', () => {
      const result = DateTools.parse('invalid-date');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unable to parse date');
    });

    test('should fail to parse completely malformed input', () => {
      const result = DateTools.parse('not-a-date-at-all');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should handle empty string gracefully', () => {
      const result = DateTools.parse('');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should include all format variations in result', () => {
      const result = DateTools.parse('2023-12-25T15:30:45Z');
      
      expect(result.success).toBe(true);
      expect(result.result.formats.iso).toBeDefined();
      expect(result.result.formats.utc).toBeDefined();
      expect(result.result.formats.local).toBeDefined();
      expect(result.result.formats.date).toBeDefined();
      expect(result.result.formats.time).toBeDefined();
    });
  });

  describe('format', () => {
    test('should format date with YYYY-MM-DD pattern', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      const result = DateTools.format(date, 'YYYY-MM-DD');
      
      expect(result.success).toBe(true);
      expect(result.result.formatted).toBe('2023-12-25');
      expect(result.result.format).toBe('YYYY-MM-DD');
    });

    test('should format date with complex pattern', () => {
      const date = new Date('2023-06-15T14:30:45Z');
      const result = DateTools.format(date, 'DD/MM/YYYY HH:mm:ss');
      
      expect(result.success).toBe(true);
      expect(result.result.formatted).toBe('15/06/2023 14:30:45');
    });

    test('should format timestamp input', () => {
      const timestamp = new Date('2023-01-01T12:00:00Z').getTime();
      const result = DateTools.format(timestamp, 'YYYY-MM-DD HH:mm');
      
      expect(result.success).toBe(true);
      expect(result.result.formatted).toBe('2023-01-01 12:00');
    });

    test('should format string date input', () => {
      const result = DateTools.format('2023-03-15T09:45:30Z', 'MM/DD/YY');
      
      expect(result.success).toBe(true);
      expect(result.result.formatted).toBe('03/15/23');
    });

    test('should handle custom timezone and locale options', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      const result = DateTools.format(date, 'YYYY-MM-DD', {
        timezone: 'America/New_York',
        locale: 'en-US'
      });
      
      expect(result.success).toBe(true);
      expect(result.metadata?.timezone).toBe('America/New_York');
      expect(result.metadata?.locale).toBe('en-US');
    });

    test('should fail with invalid date input', () => {
      const result = DateTools.format('invalid-date', 'YYYY-MM-DD');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid date provided');
    });

    test('should include metadata in successful format', () => {
      const date = new Date('2023-06-15T10:30:00Z');
      const result = DateTools.format(date, 'YYYY-MM-DD');
      
      expect(result.success).toBe(true);
      expect(result.result.original).toBe(date);
      expect(result.result.timestamp).toBe(date.getTime());
      expect(result.result.iso).toBe(date.toISOString());
      expect(result.metadata?.formatPattern).toBe('YYYY-MM-DD');
    });
  });

  describe('convert', () => {
    test('should convert between different formats', () => {
      const result = DateTools.convert('25/12/2023', 'DD/MM/YYYY', 'YYYY-MM-DD');
      
      expect(result.success).toBe(true);
      expect(result.result.original).toBe('25/12/2023');
      expect(result.result.fromFormat).toBe('DD/MM/YYYY');
      expect(result.result.toFormat).toBe('YYYY-MM-DD');
      expect(result.result.converted).toBe('2023-12-25');
    });

    test('should convert with timezone options', () => {
      const result = DateTools.convert(
        '2023-06-15 14:30:00',
        'YYYY-MM-DD HH:mm:ss',
        'MM/DD/YY',
        { timezone: 'UTC', locale: 'en-US' }
      );
      
      expect(result.success).toBe(true);
      expect(result.metadata?.timezone).toBe('UTC');
      expect(result.metadata?.locale).toBe('en-US');
    });

    test('should fail with invalid source date', () => {
      const result = DateTools.convert('invalid-date', 'YYYY-MM-DD', 'MM/DD/YYYY');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should include intermediate parsing result', () => {
      const result = DateTools.convert('2023-01-15', 'YYYY-MM-DD', 'DD/MM/YY');
      
      expect(result.success).toBe(true);
      expect(result.result.intermediate).toBeDefined();
      expect(result.result.intermediate.components).toBeDefined();
    });

    test('should handle conversion metadata', () => {
      const result = DateTools.convert('01/01/2023', 'MM/DD/YYYY', 'YYYY-MM-DD');
      
      expect(result.success).toBe(true);
      expect(result.metadata?.conversion).toBe('MM/DD/YYYY → YYYY-MM-DD');
    });
  });

  describe('arithmetic', () => {
    test('should add days to a date', () => {
      const date = new Date('2023-06-15T10:00:00Z');
      const operations = [{ unit: 'days' as const, value: 5, operation: 'add' as const }];
      const result = DateTools.arithmetic(date, operations);
      
      expect(result.success).toBe(true);
      expect(result.result.steps).toHaveLength(1);
      expect(result.result.steps[0].operation).toBe('add 5 days');
      expect(result.result.summary).toBe('Applied 1 operations');
    });

    test('should subtract months from a date', () => {
      const date = '2023-06-15T10:00:00Z';
      const operations = [{ unit: 'months' as const, value: 2, operation: 'subtract' as const }];
      const result = DateTools.arithmetic(date, operations);
      
      expect(result.success).toBe(true);
      expect(result.result.steps[0].operation).toBe('subtract 2 months');
    });

    test('should handle multiple operations in sequence', () => {
      const date = new Date('2023-01-01T00:00:00Z');
      const operations = [
        { unit: 'years' as const, value: 1, operation: 'add' as const },
        { unit: 'months' as const, value: 6, operation: 'add' as const },
        { unit: 'days' as const, value: 10, operation: 'subtract' as const }
      ];
      const result = DateTools.arithmetic(date, operations);
      
      expect(result.success).toBe(true);
      expect(result.result.steps).toHaveLength(3);
      expect(result.result.summary).toBe('Applied 3 operations');
      expect(result.metadata?.operationsCount).toBe(3);
    });

    test('should handle all time units', () => {
      const date = new Date('2023-06-15T12:30:45.500Z');
      const operations = [
        { unit: 'years' as const, value: 1, operation: 'add' as const },
        { unit: 'months' as const, value: 1, operation: 'add' as const },
        { unit: 'weeks' as const, value: 1, operation: 'add' as const },
        { unit: 'days' as const, value: 1, operation: 'add' as const },
        { unit: 'hours' as const, value: 1, operation: 'add' as const },
        { unit: 'minutes' as const, value: 1, operation: 'add' as const },
        { unit: 'seconds' as const, value: 1, operation: 'add' as const },
        { unit: 'milliseconds' as const, value: 100, operation: 'add' as const }
      ];
      const result = DateTools.arithmetic(date, operations);
      
      expect(result.success).toBe(true);
      expect(result.result.steps).toHaveLength(8);
    });

    test('should handle timestamp input', () => {
      const timestamp = new Date('2023-06-15T10:00:00Z').getTime();
      const operations = [{ unit: 'hours' as const, value: 12, operation: 'add' as const }];
      const result = DateTools.arithmetic(timestamp, operations);
      
      expect(result.success).toBe(true);
      expect(result.result.difference).toBe(12 * 60 * 60 * 1000); // 12 hours in ms
    });

    test('should fail with invalid date input', () => {
      const operations = [{ unit: 'days' as const, value: 1, operation: 'add' as const }];
      const result = DateTools.arithmetic('invalid-date', operations);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid date provided');
    });

    test('should track before and after for each step', () => {
      const date = new Date('2023-06-15T10:00:00Z');
      const operations = [{ unit: 'days' as const, value: 1, operation: 'add' as const }];
      const result = DateTools.arithmetic(date, operations);
      
      expect(result.success).toBe(true);
      expect(result.result.steps[0].before).toBeDefined();
      expect(result.result.steps[0].after).toBeDefined();
      expect(result.result.steps[0].unit).toBe('days');
      expect(result.result.steps[0].value).toBe(1);
      expect(result.result.steps[0].type).toBe('add');
    });
  });

  describe('compare', () => {
    test('should compare two dates with date2 later', () => {
      const date1 = new Date('2023-06-15T10:00:00Z');
      const date2 = new Date('2023-06-20T10:00:00Z');
      const result = DateTools.compare(date1, date2);
      
      expect(result.success).toBe(true);
      expect(result.result.comparison.date1IsEarlier).toBe(true);
      expect(result.result.comparison.date2IsEarlier).toBe(false);
      expect(result.result.comparison.equal).toBe(false);
      expect(result.result.differences.days).toBe(5);
    });

    test('should compare two equal dates', () => {
      const date = '2023-06-15T10:00:00Z';
      const result = DateTools.compare(date, date);
      
      expect(result.success).toBe(true);
      expect(result.result.comparison.equal).toBe(true);
      expect(result.result.differences.milliseconds).toBe(0);
      expect(result.result.humanReadable).toBe('Same time');
    });

    test('should compare with absolute difference option', () => {
      const date1 = new Date('2023-06-20T10:00:00Z');
      const date2 = new Date('2023-06-15T10:00:00Z');
      const result = DateTools.compare(date1, date2, { absolute: true });
      
      expect(result.success).toBe(true);
      expect(result.result.differences.days).toBe(5); // Should be positive
      expect(result.metadata?.absolute).toBe(true);
    });

    test('should compare with different precision levels', () => {
      const date1 = new Date('2023-06-15T10:00:00Z');
      const date2 = new Date('2023-06-15T13:30:00Z');
      
      const hourResult = DateTools.compare(date1, date2, { precision: 'hours' });
      expect(hourResult.success).toBe(true);
      expect(hourResult.result.primaryDifference).toBe(3.5);
      
      const minuteResult = DateTools.compare(date1, date2, { precision: 'minutes' });
      expect(minuteResult.success).toBe(true);
      expect(minuteResult.result.primaryDifference).toBe(210);
    });

    test('should handle timestamp inputs', () => {
      const timestamp1 = new Date('2023-06-15T10:00:00Z').getTime();
      const timestamp2 = new Date('2023-06-15T12:00:00Z').getTime();
      const result = DateTools.compare(timestamp1, timestamp2);
      
      expect(result.success).toBe(true);
      expect(result.result.differences.hours).toBe(2);
    });

    test('should fail with invalid first date', () => {
      const result = DateTools.compare('invalid-date', new Date());
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('One or both dates are invalid');
    });

    test('should fail with invalid second date', () => {
      const result = DateTools.compare(new Date(), 'invalid-date');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('One or both dates are invalid');
    });

    test('should include human readable description', () => {
      const date1 = new Date('2023-06-15T10:00:00Z');
      const date2 = new Date('2023-06-16T10:00:00Z');
      const result = DateTools.compare(date1, date2);
      
      expect(result.success).toBe(true);
      expect(result.result.humanReadable).toContain('Date 2 is');
      expect(result.result.humanReadable).toContain('after Date 1');
    });

    test('should calculate all time unit differences', () => {
      const date1 = new Date('2023-01-01T00:00:00Z');
      const date2 = new Date('2023-01-02T12:30:00Z');
      const result = DateTools.compare(date1, date2);
      
      expect(result.success).toBe(true);
      expect(result.result.differences.milliseconds).toBeGreaterThan(0);
      expect(result.result.differences.seconds).toBeGreaterThan(0);
      expect(result.result.differences.minutes).toBeGreaterThan(0);
      expect(result.result.differences.hours).toBeGreaterThan(0);
      expect(result.result.differences.days).toBeGreaterThan(1);
    });
  });

  describe('info', () => {
    test('should provide comprehensive date information', () => {
      const date = new Date('2023-06-15T14:30:45.123Z');
      const result = DateTools.info(date);
      
      expect(result.success).toBe(true);
      expect(result.result.components.year).toBe(2023);
      expect(result.result.components.month).toBe(6);
      expect(result.result.components.day).toBe(15);
      expect(result.result.components.hour).toBe(14);
      expect(result.result.components.minute).toBe(30);
      expect(result.result.components.second).toBe(45);
      expect(result.result.components.millisecond).toBe(123);
      expect(result.result.components.weekdayName).toBe('Thursday');
      expect(result.result.components.monthName).toBe('June');
    });

    test('should calculate calendar information', () => {
      const date = new Date('2023-06-15T10:00:00Z');
      const result = DateTools.info(date);
      
      expect(result.success).toBe(true);
      expect(result.result.calendar.quarter).toBe(2);
      expect(result.result.calendar.dayOfYear).toBeDefined();
      expect(result.result.calendar.weekOfYear).toBeDefined();
      expect(result.result.calendar.daysInMonth).toBe(30); // June has 30 days
      expect(result.result.calendar.isLeapYear).toBe(false);
      expect(result.result.calendar.daysInYear).toBe(365);
    });

    test('should detect leap year correctly', () => {
      const leapYearDate = new Date('2024-02-15T10:00:00Z');
      const result = DateTools.info(leapYearDate);
      
      expect(result.success).toBe(true);
      expect(result.result.calendar.isLeapYear).toBe(true);
      expect(result.result.calendar.daysInYear).toBe(366);
    });

    test('should provide relative date information', () => {
      const pastDate = new Date('2020-01-01T10:00:00Z');
      const result = DateTools.info(pastDate);
      
      expect(result.success).toBe(true);
      expect(result.result.relative.isInPast).toBe(true);
      expect(result.result.relative.isInFuture).toBe(false);
      expect(result.result.relative.description).toBe('Past date');
      expect(result.result.relative.age).toContain('ago');
    });

    test('should detect future dates', () => {
      const futureDate = new Date(Date.now() + 86400000); // Tomorrow
      const result = DateTools.info(futureDate);
      
      expect(result.success).toBe(true);
      expect(result.result.relative.isInFuture).toBe(true);
      expect(result.result.relative.isInPast).toBe(false);
      expect(result.result.relative.description).toBe('Future date');
      expect(result.result.relative.age).toContain('in the future');
    });

    test('should handle string date input', () => {
      const result = DateTools.info('2023-12-25T00:00:00Z');
      
      expect(result.success).toBe(true);
      expect(result.result.components.year).toBe(2023);
      expect(result.result.components.month).toBe(12);
      expect(result.result.components.day).toBe(25);
    });

    test('should handle timestamp input', () => {
      const timestamp = new Date('2023-06-15T10:00:00Z').getTime();
      const result = DateTools.info(timestamp);
      
      expect(result.success).toBe(true);
      expect(result.result.timestamp).toBe(timestamp);
    });

    test('should fail with invalid date input', () => {
      const result = DateTools.info('invalid-date');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid date provided');
    });

    test('should include various format representations', () => {
      const date = new Date('2023-06-15T14:30:00Z');
      const result = DateTools.info(date);
      
      expect(result.success).toBe(true);
      expect(result.result.formats.iso).toBeDefined();
      expect(result.result.formats.utc).toBeDefined();
      expect(result.result.formats.local).toBeDefined();
      expect(result.result.formats.date).toBeDefined();
      expect(result.result.formats.time).toBeDefined();
      expect(result.result.formats.short).toBeDefined();
      expect(result.result.formats.long).toBeDefined();
    });

    test('should include metadata with analysis timestamp', () => {
      const result = DateTools.info('2023-06-15T10:00:00Z');
      
      expect(result.success).toBe(true);
      expect(result.metadata?.analyzedAt).toBeDefined();
      expect(result.metadata?.timezone).toBeDefined();
    });
  });

  describe('validate', () => {
    test('should validate correct date string', () => {
      const result = DateTools.validate('2023-06-15T10:00:00Z');
      
      expect(result.success).toBe(true);
      expect(result.result.isValid).toBe(true);
      expect(result.result.errors).toHaveLength(0);
      expect(result.result.validationsPassed).toBeGreaterThan(0);
      expect(result.result.validationsFailed).toBe(0);
      expect(result.result.summary).toBe('All validations passed');
    });

    test('should reject invalid date string', () => {
      const result = DateTools.validate('invalid-date');
      
      expect(result.success).toBe(true);
      expect(result.result.isValid).toBe(false);
      expect(result.result.errors).toHaveLength(1);
      expect(result.result.validationsFailed).toBe(1);
    });

    test('should validate with future date restriction', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString(); // Tomorrow
      const result = DateTools.validate(futureDate, undefined, { allowFuture: false });
      
      expect(result.success).toBe(true);
      expect(result.result.isValid).toBe(false);
      expect(result.result.errors).toContain('Future dates not allowed');
    });

    test('should validate with past date restriction', () => {
      const pastDate = '2020-01-01T10:00:00Z';
      const result = DateTools.validate(pastDate, undefined, { allowPast: false });
      
      expect(result.success).toBe(true);
      expect(result.result.isValid).toBe(false);
      expect(result.result.errors).toContain('Past dates not allowed');
    });

    test('should validate with minimum date restriction', () => {
      const testDate = '2023-01-01T10:00:00Z';
      const minDate = '2023-06-01T10:00:00Z';
      const result = DateTools.validate(testDate, undefined, { minDate });
      
      expect(result.success).toBe(true);
      expect(result.result.isValid).toBe(false);
      expect(result.result.errors[0]).toContain('Date must be on or after');
    });

    test('should validate with maximum date restriction', () => {
      const testDate = '2023-12-01T10:00:00Z';
      const maxDate = '2023-06-01T10:00:00Z';
      const result = DateTools.validate(testDate, undefined, { maxDate });
      
      expect(result.success).toBe(true);
      expect(result.result.isValid).toBe(false);
      expect(result.result.errors[0]).toContain('Date must be on or before');
    });

    test('should validate with multiple restrictions passing', () => {
      const testDate = '2023-06-15T10:00:00Z';
      const result = DateTools.validate(testDate, undefined, {
        allowFuture: true,
        allowPast: true,
        minDate: '2023-01-01T00:00:00Z',
        maxDate: '2023-12-31T23:59:59Z'
      });
      
      expect(result.success).toBe(true);
      expect(result.result.isValid).toBe(true);
      expect(result.result.errors).toHaveLength(0);
    });

    test('should validate with strict parsing option', () => {
      const result = DateTools.validate('2023-06-15', 'YYYY-MM-DD', { strict: true });
      
      expect(result.success).toBe(true);
      expect(result.result.format).toBe('YYYY-MM-DD');
    });

    test('should provide detailed validation results', () => {
      const testDate = '2023-06-15T10:00:00Z';
      const result = DateTools.validate(testDate, undefined, {
        allowFuture: true,
        allowPast: true,
        minDate: '2020-01-01T00:00:00Z'
      });
      
      expect(result.success).toBe(true);
      expect(result.result.validations).toBeInstanceOf(Array);
      expect(result.result.validations.length).toBeGreaterThan(0);
      expect(result.result.validations[0]).toHaveProperty('rule');
      expect(result.result.validations[0]).toHaveProperty('passed');
    });

    test('should handle validation error gracefully', () => {
      const result = DateTools.validate('2023-06-15', undefined, {
        minDate: 'invalid-min-date'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Date validation error');
    });

    test('should include parsed date in successful validation', () => {
      const testDate = '2023-06-15T10:00:00Z';
      const result = DateTools.validate(testDate);
      
      expect(result.success).toBe(true);
      expect(result.result.parsedDate).toBeDefined();
      expect(result.result.dateString).toBe(testDate);
    });
  });

  describe('Error handling', () => {
    test('should handle null/undefined inputs gracefully', () => {
      const parseResult = DateTools.parse(null as any);
      expect(parseResult.success).toBe(false);
      
      const formatResult = DateTools.format(null as any, 'YYYY-MM-DD');
      expect(formatResult.success).toBe(false);
    });

    test('should provide meaningful error messages', () => {
      const result = DateTools.arithmetic('invalid-date', []);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid date provided');
    });

    test('should handle edge cases in date operations', () => {
      const result = DateTools.compare(new Date(NaN), new Date());
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});