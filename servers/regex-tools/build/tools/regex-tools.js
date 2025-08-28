/**
 * Regex Tools for MCP Server
 * Comprehensive regex utilities for text processing
 */
export class RegexTools {
    /**
     * Count the number of matches for a regex pattern in text
     */
    static matchCount(text, pattern, flags) {
        try {
            const regex = new RegExp(pattern, flags || 'g');
            const matches = text.match(regex);
            const count = matches ? matches.length : 0;
            return {
                success: true,
                result: count,
                metadata: {
                    pattern,
                    flags: flags || 'g',
                    textLength: text.length
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Invalid regex pattern: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Test if text matches a regex pattern
     */
    static match(text, pattern, flags) {
        try {
            const regex = new RegExp(pattern, flags);
            const isMatch = regex.test(text);
            const execResult = regex.exec(text);
            return {
                success: true,
                result: {
                    isMatch,
                    firstMatch: execResult ? execResult[0] : null,
                    index: execResult ? execResult.index : -1
                },
                metadata: {
                    pattern,
                    flags: flags || '',
                    textLength: text.length
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Invalid regex pattern: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Extract all matches from text
     */
    static extract(text, pattern, flags) {
        try {
            const regex = new RegExp(pattern, flags || 'g');
            const matches = Array.from(text.matchAll(regex));
            const results = matches.map(match => ({
                match: match[0],
                index: match.index,
                groups: match.slice(1),
                namedGroups: match.groups || {}
            }));
            return {
                success: true,
                result: results,
                metadata: {
                    pattern,
                    flags: flags || 'g',
                    totalMatches: results.length,
                    textLength: text.length
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Invalid regex pattern: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Replace matches in text with replacement string
     */
    static replace(text, pattern, replacement, flags) {
        try {
            const regex = new RegExp(pattern, flags || 'g');
            const originalText = text;
            const newText = text.replace(regex, replacement);
            const changeCount = (originalText.match(regex) || []).length;
            return {
                success: true,
                result: {
                    originalText,
                    newText,
                    changeCount,
                    hasChanges: originalText !== newText
                },
                metadata: {
                    pattern,
                    replacement,
                    flags: flags || 'g',
                    originalLength: originalText.length,
                    newLength: newText.length
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Invalid regex pattern: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Split text by regex pattern
     */
    static split(text, pattern, flags, limit) {
        try {
            const regex = new RegExp(pattern, flags);
            const parts = text.split(regex, limit);
            return {
                success: true,
                result: {
                    parts,
                    count: parts.length
                },
                metadata: {
                    pattern,
                    flags: flags || '',
                    limit: limit || 'unlimited',
                    originalLength: text.length
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Invalid regex pattern: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Extract JSON objects from text using regex
     */
    static extractJson(text) {
        try {
            // Pattern to match JSON objects and arrays
            const jsonPattern = /\{(?:[^{}]|{(?:[^{}]|{[^{}]*})*})*\}|\[(?:[^\[\]]|\[(?:[^\[\]]|\[[^\[\]]*\])*\])*\]/g;
            const matches = text.match(jsonPattern) || [];
            const validJson = [];
            const invalidJson = [];
            for (const match of matches) {
                try {
                    const parsed = JSON.parse(match);
                    validJson.push({
                        raw: match,
                        parsed,
                        index: text.indexOf(match)
                    });
                }
                catch {
                    invalidJson.push({
                        raw: match,
                        index: text.indexOf(match),
                        error: 'Invalid JSON syntax'
                    });
                }
            }
            return {
                success: true,
                result: {
                    validJson,
                    invalidJson,
                    totalFound: matches.length,
                    validCount: validJson.length,
                    invalidCount: invalidJson.length
                },
                metadata: {
                    textLength: text.length
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Error extracting JSON: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Find and return capture groups from matches
     */
    static findGroups(text, pattern, flags) {
        try {
            const regex = new RegExp(pattern, flags || 'g');
            const matches = Array.from(text.matchAll(regex));
            const groups = matches.map((match, matchIndex) => ({
                matchIndex,
                fullMatch: match[0],
                index: match.index,
                captureGroups: match.slice(1),
                namedGroups: match.groups || {}
            }));
            return {
                success: true,
                result: {
                    groups,
                    totalMatches: groups.length,
                    hasNamedGroups: groups.some(g => Object.keys(g.namedGroups).length > 0)
                },
                metadata: {
                    pattern,
                    flags: flags || 'g',
                    textLength: text.length
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Invalid regex pattern: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Validate if a regex pattern is valid
     */
    static validate(pattern, flags) {
        try {
            const regex = new RegExp(pattern, flags);
            return {
                success: true,
                result: {
                    isValid: true,
                    pattern,
                    flags: flags || '',
                    source: regex.source,
                    compiledFlags: regex.flags
                },
                metadata: {
                    patternLength: pattern.length
                }
            };
        }
        catch (error) {
            return {
                success: true, // We successfully validated (even though the pattern is invalid)
                result: {
                    isValid: false,
                    pattern,
                    flags: flags || '',
                    error: error instanceof Error ? error.message : String(error)
                },
                metadata: {
                    patternLength: pattern.length
                }
            };
        }
    }
    /**
     * Tokenize text using regex pattern as delimiter
     */
    static tokenize(text, pattern, flags) {
        try {
            // Default tokenizer splits on whitespace and punctuation
            const defaultPattern = pattern || '\\s+|[\\p{P}\\p{S}]+';
            const regex = new RegExp(defaultPattern, flags || 'gu');
            const tokens = text
                .split(regex)
                .filter(token => token.trim().length > 0)
                .map((token, index) => ({
                index,
                token: token.trim(),
                length: token.trim().length
            }));
            return {
                success: true,
                result: {
                    tokens,
                    tokenCount: tokens.length,
                    averageTokenLength: tokens.length > 0
                        ? tokens.reduce((sum, t) => sum + t.length, 0) / tokens.length
                        : 0
                },
                metadata: {
                    pattern: defaultPattern,
                    flags: flags || 'gu',
                    originalLength: text.length
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Tokenization error: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Normalize whitespace in text
     */
    static normalizeWhitespace(text, options) {
        try {
            let result = text;
            const changes = [];
            const opts = {
                trimStart: true,
                trimEnd: true,
                collapseSpaces: true,
                removeLineBreaks: false,
                normalizeLineBreaks: true,
                ...options
            };
            if (opts.trimStart && result.startsWith(/^\s+/.exec(result)?.[0] || '')) {
                result = result.replace(/^\s+/, '');
                changes.push('trimmed start');
            }
            if (opts.trimEnd && result.endsWith(/\s+$/.exec(result)?.[0] || '')) {
                result = result.replace(/\s+$/, '');
                changes.push('trimmed end');
            }
            if (opts.normalizeLineBreaks) {
                result = result.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                changes.push('normalized line breaks');
            }
            if (opts.removeLineBreaks) {
                result = result.replace(/\n+/g, ' ');
                changes.push('removed line breaks');
            }
            if (opts.collapseSpaces) {
                result = result.replace(/[ \t]+/g, ' ');
                changes.push('collapsed spaces');
            }
            return {
                success: true,
                result: {
                    originalText: text,
                    normalizedText: result,
                    changes,
                    hasChanges: text !== result
                },
                metadata: {
                    originalLength: text.length,
                    newLength: result.length,
                    options: opts
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Normalization error: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * Redact sensitive information using regex patterns
     */
    static redact(text, patterns, flags) {
        try {
            let result = text;
            const redactions = [];
            for (const { name, pattern, replacement = '[REDACTED]' } of patterns) {
                const regex = new RegExp(pattern, flags || 'gi');
                const matches = Array.from(result.matchAll(regex));
                if (matches.length > 0) {
                    result = result.replace(regex, replacement);
                    redactions.push({
                        name,
                        pattern,
                        replacement,
                        matchCount: matches.length,
                        matches: matches.map(m => ({
                            text: m[0],
                            index: m.index
                        }))
                    });
                }
            }
            return {
                success: true,
                result: {
                    originalText: text,
                    redactedText: result,
                    redactions,
                    totalRedactions: redactions.reduce((sum, r) => sum + r.matchCount, 0),
                    hasRedactions: redactions.length > 0
                },
                metadata: {
                    originalLength: text.length,
                    newLength: result.length,
                    patternsUsed: patterns.length,
                    flags: flags || 'gi'
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Redaction error: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
}
//# sourceMappingURL=regex-tools.js.map