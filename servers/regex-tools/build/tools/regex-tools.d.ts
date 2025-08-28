/**
 * Regex Tools for MCP Server
 * Comprehensive regex utilities for text processing
 */
export interface RegexToolResult {
    success: boolean;
    result?: any;
    error?: string;
    metadata?: Record<string, any>;
}
export declare class RegexTools {
    /**
     * Count the number of matches for a regex pattern in text
     */
    static matchCount(text: string, pattern: string, flags?: string): RegexToolResult;
    /**
     * Test if text matches a regex pattern
     */
    static match(text: string, pattern: string, flags?: string): RegexToolResult;
    /**
     * Extract all matches from text
     */
    static extract(text: string, pattern: string, flags?: string): RegexToolResult;
    /**
     * Replace matches in text with replacement string
     */
    static replace(text: string, pattern: string, replacement: string, flags?: string): RegexToolResult;
    /**
     * Split text by regex pattern
     */
    static split(text: string, pattern: string, flags?: string, limit?: number): RegexToolResult;
    /**
     * Extract JSON objects from text using regex
     */
    static extractJson(text: string): RegexToolResult;
    /**
     * Find and return capture groups from matches
     */
    static findGroups(text: string, pattern: string, flags?: string): RegexToolResult;
    /**
     * Validate if a regex pattern is valid
     */
    static validate(pattern: string, flags?: string): RegexToolResult;
    /**
     * Tokenize text using regex pattern as delimiter
     */
    static tokenize(text: string, pattern?: string, flags?: string): RegexToolResult;
    /**
     * Normalize whitespace in text
     */
    static normalizeWhitespace(text: string, options?: {
        trimStart?: boolean;
        trimEnd?: boolean;
        collapseSpaces?: boolean;
        removeLineBreaks?: boolean;
        normalizeLineBreaks?: boolean;
    }): RegexToolResult;
    /**
     * Redact sensitive information using regex patterns
     */
    static redact(text: string, patterns: {
        name: string;
        pattern: string;
        replacement?: string;
    }[], flags?: string): RegexToolResult;
}
//# sourceMappingURL=regex-tools.d.ts.map