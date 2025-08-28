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
export declare class MathTools {
    /**
     * Perform basic arithmetic calculations
     */
    static calculate(expression: string): MathToolResult;
    /**
     * Compare two numbers with various operators
     */
    static compare(num1: number | string, num2: number | string, operator: '>' | '<' | '>=' | '<=' | '==' | '!=' | '===' | '!=='): MathToolResult;
    /**
     * Extract and parse numbers from text
     */
    static parseNumbers(text: string, options?: {
        integersOnly?: boolean;
        includeNegative?: boolean;
        includeDecimals?: boolean;
    }): MathToolResult;
    /**
     * Format numbers with various options
     */
    static formatNumber(number: number | string, options?: {
        decimals?: number;
        thousandsSeparator?: string;
        decimalSeparator?: string;
        prefix?: string;
        suffix?: string;
        percentage?: boolean;
        currency?: string;
        locale?: string;
    }): MathToolResult;
    /**
     * Clean and sanitize numeric strings
     */
    static sanitizeNumber(input: string, options?: {
        allowDecimals?: boolean;
        allowNegative?: boolean;
        thousandsSeparator?: string;
        decimalSeparator?: string;
    }): MathToolResult;
    /**
     * Perform statistical calculations on an array of numbers
     */
    static statistics(numbers: (number | string)[]): MathToolResult;
}
//# sourceMappingURL=math-tools.d.ts.map