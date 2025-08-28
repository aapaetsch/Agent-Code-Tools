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
export declare class DateTools {
    /**
     * Parse date from various string formats
     */
    static parse(dateString: string, options?: {
        format?: string;
        timezone?: string;
        locale?: string;
        strict?: boolean;
    }): DateToolResult;
    /**
     * Format date to specified format string
     */
    static format(date: string | number | Date, format: string, options?: {
        timezone?: string;
        locale?: string;
    }): DateToolResult;
    /**
     * Convert date from one format to another
     */
    static convert(dateString: string, fromFormat: string, toFormat: string, options?: {
        timezone?: string;
        locale?: string;
    }): DateToolResult;
    /**
     * Perform date arithmetic (add/subtract time periods)
     */
    static arithmetic(date: string | number | Date, operations: Array<{
        unit: 'years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds';
        value: number;
        operation: 'add' | 'subtract';
    }>): DateToolResult;
    /**
     * Compare two dates and calculate differences
     */
    static compare(date1: string | number | Date, date2: string | number | Date, options?: {
        precision?: 'years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds';
        absolute?: boolean;
    }): DateToolResult;
    /**
     * Get information about a specific date
     */
    static info(date: string | number | Date): DateToolResult;
    /**
     * Validate if a date string matches a specific format
     */
    static validate(dateString: string, format?: string, options?: {
        strict?: boolean;
        allowFuture?: boolean;
        allowPast?: boolean;
        minDate?: string | Date;
        maxDate?: string | Date;
    }): DateToolResult;
    private static parseCustomFormat;
    private static applyFormat;
    private static formatDuration;
}
//# sourceMappingURL=date-tools.d.ts.map