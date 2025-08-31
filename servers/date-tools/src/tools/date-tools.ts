/**
 * Date Tools for MCP Server
 * Date parsing, formatting, and manipulation utilities
 */

export interface DateToolResult {
  success: boolean;
  result?: any;
  error?: string;
  metadata?: Record<string, any>;
}

export default class DateTools {
  /**
   * Parse date from various string formats
   */
  static parse(
    dateString: string,
    options?: {
      format?: string;
      timezone?: string;
      locale?: string;
      strict?: boolean;
    }
  ): DateToolResult {
    try {
      // Handle null/undefined inputs
      if (dateString == null || dateString === '') {
        return {
          success: false,
          error: 'Date string cannot be null, undefined, or empty'
        };
      }

      const opts = {
        timezone: 'UTC',
        locale: 'en-US',
        strict: false,
        ...options
      };

      // Try to parse the date
      let parsedDate: Date;
      
      if (opts.format) {
        // Custom format parsing (basic implementation)
        parsedDate = this.parseCustomFormat(dateString, opts.format);
      } else {
        // Use native Date parsing
        parsedDate = new Date(dateString);
      }

      if (isNaN(parsedDate.getTime())) {
        // Try some common formats
        const commonFormats = [
          /^\d{4}-\d{2}-\d{2}$/,  // YYYY-MM-DD
          /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
          /^\d{2}-\d{2}-\d{4}$/,   // MM-DD-YYYY
          /^\d{4}\/\d{2}\/\d{2}$/  // YYYY/MM/DD
        ];

        for (const format of commonFormats) {
          if (format.test(dateString)) {
            parsedDate = new Date(dateString);
            break;
          }
        }
      }

      if (isNaN(parsedDate.getTime())) {
        return {
          success: false,
          error: `Unable to parse date: "${dateString}"`
        };
      }

      const result = {
        original: dateString,
        parsed: parsedDate.toISOString(),
        timestamp: parsedDate.getTime(),
        components: {
          year: opts.timezone === 'UTC' ? parsedDate.getUTCFullYear() : parsedDate.getFullYear(),
          month: (opts.timezone === 'UTC' ? parsedDate.getUTCMonth() : parsedDate.getMonth()) + 1,
          day: opts.timezone === 'UTC' ? parsedDate.getUTCDate() : parsedDate.getDate(),
          hour: opts.timezone === 'UTC' ? parsedDate.getUTCHours() : parsedDate.getHours(),
          minute: opts.timezone === 'UTC' ? parsedDate.getUTCMinutes() : parsedDate.getMinutes(),
          second: opts.timezone === 'UTC' ? parsedDate.getUTCSeconds() : parsedDate.getSeconds(),
          millisecond: opts.timezone === 'UTC' ? parsedDate.getUTCMilliseconds() : parsedDate.getMilliseconds(),
          weekday: opts.timezone === 'UTC' ? parsedDate.getUTCDay() : parsedDate.getDay(),
          weekdayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][opts.timezone === 'UTC' ? parsedDate.getUTCDay() : parsedDate.getDay()],
          monthName: ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'][opts.timezone === 'UTC' ? parsedDate.getUTCMonth() : parsedDate.getMonth()]
        },
        formats: {
          iso: parsedDate.toISOString(),
          utc: parsedDate.toUTCString(),
          local: parsedDate.toLocaleString(opts.locale),
          date: parsedDate.toDateString(),
          time: parsedDate.toTimeString()
        }
      };

      return {
        success: true,
        result,
        metadata: {
          timezone: opts.timezone,
          locale: opts.locale,
          inputFormat: opts.format || 'auto-detected'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Date parsing error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Format date to specified format string
   */
  static format(
    date: string | number | Date,
    format: string,
    options?: {
      timezone?: string;
      locale?: string;
    }
  ): DateToolResult {
    try {
      // Handle null/undefined inputs
      if (date == null || format == null) {
        return {
          success: false,
          error: 'Date and format cannot be null or undefined'
        };
      }

      const opts = {
        timezone: 'UTC',
        locale: 'en-US',
        ...options
      };

      let dateObj: Date;
      
      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'number') {
        dateObj = new Date(date);
      } else {
        dateObj = new Date(date);
      }

      if (isNaN(dateObj.getTime())) {
        return {
          success: false,
          error: 'Invalid date provided'
        };
      }

      // Format the date according to the format string
      const formatted = this.applyFormat(dateObj, format, opts);

      return {
        success: true,
        result: {
          original: date,
          formatted,
          format,
          timestamp: dateObj.getTime(),
          iso: dateObj.toISOString()
        },
        metadata: {
          timezone: opts.timezone,
          locale: opts.locale,
          formatPattern: format
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Date formatting error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Convert date from one format to another
   */
  static convert(
    dateString: string,
    fromFormat: string,
    toFormat: string,
    options?: {
      timezone?: string;
      locale?: string;
    }
  ): DateToolResult {
    try {
      // First parse the date
      const parseResult = this.parse(dateString, { format: fromFormat, ...options });
      
      if (!parseResult.success) {
        return parseResult;
      }

      // Then format it to the target format
      const formatResult = this.format(parseResult.result.parsed, toFormat, options);
      
      if (!formatResult.success) {
        return formatResult;
      }

      return {
        success: true,
        result: {
          original: dateString,
          fromFormat,
          toFormat,
          converted: formatResult.result.formatted,
          intermediate: parseResult.result
        },
        metadata: {
          ...options,
          conversion: `${fromFormat} → ${toFormat}`
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Date conversion error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Perform date arithmetic (add/subtract time periods)
   */
  static arithmetic(
    date: string | number | Date,
    operations: Array<{
      unit: 'years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds';
      value: number;
      operation: 'add' | 'subtract';
    }>
  ): DateToolResult {
    try {
      let dateObj: Date;
      
      if (date instanceof Date) {
        dateObj = new Date(date);
      } else if (typeof date === 'number') {
        dateObj = new Date(date);
      } else {
        dateObj = new Date(date);
      }

      if (isNaN(dateObj.getTime())) {
        return {
          success: false,
          error: 'Invalid date provided'
        };
      }

      const originalDate = new Date(dateObj);
      const steps = [];

      for (const op of operations) {
        const before = new Date(dateObj);
        const multiplier = op.operation === 'add' ? 1 : -1;
        const value = op.value * multiplier;

        switch (op.unit) {
          case 'years':
            dateObj.setFullYear(dateObj.getFullYear() + value);
            break;
          case 'months':
            dateObj.setMonth(dateObj.getMonth() + value);
            break;
          case 'weeks':
            dateObj.setDate(dateObj.getDate() + (value * 7));
            break;
          case 'days':
            dateObj.setDate(dateObj.getDate() + value);
            break;
          case 'hours':
            dateObj.setHours(dateObj.getHours() + value);
            break;
          case 'minutes':
            dateObj.setMinutes(dateObj.getMinutes() + value);
            break;
          case 'seconds':
            dateObj.setSeconds(dateObj.getSeconds() + value);
            break;
          case 'milliseconds':
            dateObj.setMilliseconds(dateObj.getMilliseconds() + value);
            break;
        }

        steps.push({
          operation: `${op.operation} ${op.value} ${op.unit}`,
          before: before.toISOString(),
          after: dateObj.toISOString(),
          unit: op.unit,
          value: op.value,
          type: op.operation
        });
      }

      return {
        success: true,
        result: {
          original: originalDate.toISOString(),
          final: dateObj.toISOString(),
          originalTimestamp: originalDate.getTime(),
          finalTimestamp: dateObj.getTime(),
          difference: dateObj.getTime() - originalDate.getTime(),
          steps,
          summary: `Applied ${operations.length} operations`
        },
        metadata: {
          operationsCount: operations.length,
          totalTimeDifference: dateObj.getTime() - originalDate.getTime()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Date arithmetic error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Compare two dates and calculate differences
   */
  static compare(
    date1: string | number | Date,
    date2: string | number | Date,
    options?: {
      precision?: 'years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds';
      absolute?: boolean;
    }
  ): DateToolResult {
    try {
      const opts = {
        precision: 'milliseconds' as const,
        absolute: false,
        ...options
      };

      const dateObj1 = new Date(date1);
      const dateObj2 = new Date(date2);

      if (isNaN(dateObj1.getTime()) || isNaN(dateObj2.getTime())) {
        return {
          success: false,
          error: 'One or both dates are invalid'
        };
      }

      const diff = dateObj2.getTime() - dateObj1.getTime();
      const absDiff = Math.abs(diff);

      const comparison = {
        earlier: diff > 0 ? dateObj1 : dateObj2,
        later: diff > 0 ? dateObj2 : dateObj1,
        equal: diff === 0,
        date1IsEarlier: diff > 0,
        date2IsEarlier: diff < 0
      };

      const differences = {
        milliseconds: opts.absolute ? absDiff : diff,
        seconds: (opts.absolute ? absDiff : diff) / 1000,
        minutes: (opts.absolute ? absDiff : diff) / (1000 * 60),
        hours: (opts.absolute ? absDiff : diff) / (1000 * 60 * 60),
        days: (opts.absolute ? absDiff : diff) / (1000 * 60 * 60 * 24),
        weeks: (opts.absolute ? absDiff : diff) / (1000 * 60 * 60 * 24 * 7),
        // Approximate months and years
        months: (opts.absolute ? absDiff : diff) / (1000 * 60 * 60 * 24 * 30.44),
        years: (opts.absolute ? absDiff : diff) / (1000 * 60 * 60 * 24 * 365.25)
      };

      // Human-readable difference
      const humanReadable = this.formatDuration(absDiff);

      return {
        success: true,
        result: {
          date1: dateObj1.toISOString(),
          date2: dateObj2.toISOString(),
          comparison,
          differences,
          primaryDifference: differences[opts.precision],
          humanReadable: diff === 0 ? 'Same time' : 
                        (diff > 0 ? `Date 2 is ${humanReadable} after Date 1` : 
                         `Date 2 is ${humanReadable} before Date 1`),
          rawDifference: diff
        },
        metadata: {
          precision: opts.precision,
          absolute: opts.absolute,
          unit: opts.precision
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Date comparison error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Get information about a specific date
   */
  static info(date: string | number | Date): DateToolResult {
    try {
      const dateObj = new Date(date);

      if (isNaN(dateObj.getTime())) {
        return {
          success: false,
          error: 'Invalid date provided'
        };
      }

      const now = new Date();
      const startOfYear = new Date(dateObj.getFullYear(), 0, 1);
      const dayOfYear = Math.floor((dateObj.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      // Calculate week of year
      const startOfYearWeekday = startOfYear.getDay();
      const weekOfYear = Math.ceil((dayOfYear + startOfYearWeekday) / 7);

      // Check if leap year
      const isLeapYear = (dateObj.getFullYear() % 4 === 0 && dateObj.getFullYear() % 100 !== 0) || 
                        (dateObj.getFullYear() % 400 === 0);

      // Quarter
      const quarter = Math.ceil((dateObj.getMonth() + 1) / 3);

      // Days in month
      const daysInMonth = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate();

      // Age relative to now
      const ageMs = now.getTime() - dateObj.getTime();
      const age = this.formatDuration(Math.abs(ageMs));

      return {
        success: true,
        result: {
          date: dateObj.toISOString(),
          timestamp: dateObj.getTime(),
          components: {
            year: dateObj.getUTCFullYear(),
            month: dateObj.getUTCMonth() + 1,
            day: dateObj.getUTCDate(),
            hour: dateObj.getUTCHours(),
            minute: dateObj.getUTCMinutes(),
            second: dateObj.getUTCSeconds(),
            millisecond: dateObj.getUTCMilliseconds(),
            weekday: dateObj.getUTCDay(),
            weekdayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dateObj.getUTCDay()],
            monthName: ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'][dateObj.getUTCMonth()]
          },
          calendar: {
            dayOfYear,
            weekOfYear,
            quarter,
            daysInMonth,
            isLeapYear,
            daysInYear: isLeapYear ? 366 : 365
          },
          relative: {
            isInPast: dateObj < now,
            isInFuture: dateObj > now,
            isToday: dateObj.toDateString() === now.toDateString(),
            age: ageMs < 0 ? `${age} in the future` : `${age} ago`,
            description: ageMs < 0 ? 'Future date' : ageMs === 0 ? 'Now' : 'Past date'
          },
          formats: {
            iso: dateObj.toISOString(),
            utc: dateObj.toUTCString(),
            local: dateObj.toLocaleString(),
            date: dateObj.toDateString(),
            time: dateObj.toTimeString(),
            short: dateObj.toLocaleDateString(),
            long: dateObj.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })
          }
        },
        metadata: {
          analyzedAt: now.toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Date info error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Validate if a date string matches a specific format
   */
  static validate(
    dateString: string,
    format?: string,
    options?: {
      strict?: boolean;
      allowFuture?: boolean;
      allowPast?: boolean;
      minDate?: string | Date;
      maxDate?: string | Date;
    }
  ): DateToolResult {
    try {
      const opts = {
        strict: false,
        allowFuture: true,
        allowPast: true,
        ...options
      };

      // Try to parse the date
      const parseResult = this.parse(dateString, { format, strict: opts.strict });
      
      if (!parseResult.success) {
        return {
          success: true, // Validation completed successfully, even if date is invalid
          result: {
            isValid: false,
            dateString,
            format: format || 'auto-detect',
            errors: [parseResult.error],
            validationsPassed: 0,
            validationsFailed: 1
          },
          metadata: opts
        };
      }

      const parsedDate = new Date(parseResult.result.parsed);
      const now = new Date();
      const errors = [];
      const validations = [];

      // Check future/past restrictions
      if (!opts.allowFuture && parsedDate > now) {
        errors.push('Future dates not allowed');
        validations.push({ rule: 'allowFuture', passed: false });
      } else {
        validations.push({ rule: 'allowFuture', passed: true });
      }

      if (!opts.allowPast && parsedDate < now) {
        errors.push('Past dates not allowed');
        validations.push({ rule: 'allowPast', passed: false });
      } else {
        validations.push({ rule: 'allowPast', passed: true });
      }

      // Check min/max date restrictions
      if (opts.minDate) {
        const minDate = new Date(opts.minDate);
        if (parsedDate < minDate) {
          errors.push(`Date must be on or after ${minDate.toISOString()}`);
          validations.push({ rule: 'minDate', passed: false, value: minDate.toISOString() });
        } else {
          validations.push({ rule: 'minDate', passed: true, value: minDate.toISOString() });
        }
      }

      if (opts.maxDate) {
        const maxDate = new Date(opts.maxDate);
        if (parsedDate > maxDate) {
          errors.push(`Date must be on or before ${maxDate.toISOString()}`);
          validations.push({ rule: 'maxDate', passed: false, value: maxDate.toISOString() });
        } else {
          validations.push({ rule: 'maxDate', passed: true, value: maxDate.toISOString() });
        }
      }

      const isValid = errors.length === 0;
      const passedCount = validations.filter(v => v.passed).length;
      const failedCount = validations.filter(v => !v.passed).length;

      return {
        success: true,
        result: {
          isValid,
          dateString,
          parsedDate: parsedDate.toISOString(),
          format: format || 'auto-detect',
          errors,
          validations,
          validationsPassed: passedCount,
          validationsFailed: failedCount,
          summary: isValid ? 'All validations passed' : `${failedCount} validation(s) failed`
        },
        metadata: opts
      };
    } catch (error) {
      return {
        success: false,
        error: `Date validation error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  // Helper methods

  private static parseCustomFormat(dateString: string, format: string): Date {
    // Basic custom format parsing - can be extended
    // This is a simplified implementation
    
    const formatMap: { [key: string]: string } = {
      'YYYY': '(\\d{4})',
      'YY': '(\\d{2})',
      'MM': '(\\d{2})',
      'DD': '(\\d{2})',
      'HH': '(\\d{2})',
      'mm': '(\\d{2})',
      'ss': '(\\d{2})'
    };

    let pattern = format;
    const captureGroups: string[] = [];

    // Find all tokens in the order they appear in the format string
    const tokenOrder = ['YYYY', 'YY', 'MM', 'DD', 'HH', 'mm', 'ss'];
    const foundTokens: Array<{token: string, position: number}> = [];

    for (const token of tokenOrder) {
      const position = pattern.indexOf(token);
      if (position !== -1) {
        foundTokens.push({token, position});
      }
    }

    // Sort by position in the format string
    foundTokens.sort((a, b) => a.position - b.position);

    // Replace tokens with regex groups in the correct order
    for (const {token} of foundTokens) {
      pattern = pattern.replace(token, formatMap[token]);
      captureGroups.push(token);
    }

    const match = dateString.match(new RegExp(pattern));
    if (!match) {
      return new Date(NaN);
    }

    const components: { [key: string]: number } = {};
    captureGroups.forEach((token, index) => {
      components[token] = parseInt(match[index + 1], 10);
    });

    // Build date from components
    const year = components['YYYY'] || (components['YY'] ? 2000 + components['YY'] : new Date().getFullYear());
    const month = (components['MM'] || 1) - 1; // Month is 0-indexed
    const day = components['DD'] || 1;
    const hour = components['HH'] || 0;
    const minute = components['mm'] || 0;
    const second = components['ss'] || 0;

    return new Date(year, month, day, hour, minute, second);
  }

  private static applyFormat(date: Date, format: string, options: any): string {
    const useUTC = options.timezone === 'UTC';
    const formatMap: { [key: string]: string | number } = {
      'YYYY': useUTC ? date.getUTCFullYear() : date.getFullYear(),
      'YY': String(useUTC ? date.getUTCFullYear() : date.getFullYear()).slice(-2),
      'MM': String((useUTC ? date.getUTCMonth() : date.getMonth()) + 1).padStart(2, '0'),
      'M': (useUTC ? date.getUTCMonth() : date.getMonth()) + 1,
      'DD': String(useUTC ? date.getUTCDate() : date.getDate()).padStart(2, '0'),
      'D': useUTC ? date.getUTCDate() : date.getDate(),
      'HH': String(useUTC ? date.getUTCHours() : date.getHours()).padStart(2, '0'),
      'H': useUTC ? date.getUTCHours() : date.getHours(),
      'mm': String(useUTC ? date.getUTCMinutes() : date.getMinutes()).padStart(2, '0'),
      'm': useUTC ? date.getUTCMinutes() : date.getMinutes(),
      'ss': String(useUTC ? date.getUTCSeconds() : date.getSeconds()).padStart(2, '0'),
      's': useUTC ? date.getUTCSeconds() : date.getSeconds(),
      'SSS': String(useUTC ? date.getUTCMilliseconds() : date.getMilliseconds()).padStart(3, '0')
    };

    let result = format;
    for (const [token, value] of Object.entries(formatMap)) {
      result = result.replace(new RegExp(token, 'g'), String(value));
    }

    return result;
  }

  private static formatDuration(milliseconds: number): string {
    const units = [
      { label: 'year', ms: 1000 * 60 * 60 * 24 * 365.25 },
      { label: 'month', ms: 1000 * 60 * 60 * 24 * 30.44 },
      { label: 'week', ms: 1000 * 60 * 60 * 24 * 7 },
      { label: 'day', ms: 1000 * 60 * 60 * 24 },
      { label: 'hour', ms: 1000 * 60 * 60 },
      { label: 'minute', ms: 1000 * 60 },
      { label: 'second', ms: 1000 }
    ];

    for (const unit of units) {
      const value = Math.floor(milliseconds / unit.ms);
      if (value >= 1) {
        return `${value} ${unit.label}${value > 1 ? 's' : ''}`;
      }
    }

    return '0 seconds';
  }
}