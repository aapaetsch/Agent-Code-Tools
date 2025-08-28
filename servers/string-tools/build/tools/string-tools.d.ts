/**
 * String Tools for MCP Server
 * String manipulation and comparison utilities
 */
export interface StringToolResult {
    success: boolean;
    result?: any;
    error?: string;
    metadata?: Record<string, any>;
}
export declare class StringTools {
    /**
     * Compare two strings with various comparison methods
     */
    static compare(str1: string, str2: string, method?: 'exact' | 'case_insensitive' | 'length' | 'levenshtein' | 'similarity' | 'contains' | 'starts_with' | 'ends_with'): StringToolResult;
    /**
     * Transform strings with various operations
     */
    static transform(text: string, operations: Array<{
        type: 'uppercase' | 'lowercase' | 'title' | 'camel' | 'pascal' | 'snake' | 'kebab' | 'reverse' | 'trim' | 'pad';
        options?: any;
    }>): StringToolResult;
    /**
     * Analyze string properties and characteristics
     */
    static analyze(text: string): StringToolResult;
    /**
     * Find and highlight differences between two strings
     */
    static diff(str1: string, str2: string, options?: {
        ignoreCase?: boolean;
        ignoreWhitespace?: boolean;
        wordLevel?: boolean;
    }): StringToolResult;
    /**
     * Validate string against various patterns and rules
     */
    static validate(text: string, rules: Array<{
        type: 'email' | 'url' | 'phone' | 'length' | 'pattern' | 'required' | 'numeric' | 'alpha' | 'alphanumeric';
        options?: any;
        message?: string;
    }>): StringToolResult;
    private static calculateLevenshteinDistance;
    private static calculateJaroWinklerSimilarity;
    private static characterLevelDiff;
    private static wordLevelDiff;
}
//# sourceMappingURL=string-tools.d.ts.map