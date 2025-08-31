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

export default class StringTools {
  /**
   * Compare two strings with various comparison methods
   */
  static compare(
    str1: string,
    str2: string,
    method: 'exact' | 'case_insensitive' | 'length' | 'levenshtein' | 'similarity' | 'contains' | 'starts_with' | 'ends_with' = 'exact'
  ): StringToolResult {
    try {
      let result: any;
      let description: string;

      switch (method) {
        case 'exact':
          result = str1 === str2;
          description = result ? 'Strings are exactly equal' : 'Strings are not equal';
          break;

        case 'case_insensitive':
          result = str1.toLowerCase() === str2.toLowerCase();
          description = result ? 'Strings are equal (case-insensitive)' : 'Strings are not equal (case-insensitive)';
          break;

        case 'length':
          result = {
            str1Length: str1.length,
            str2Length: str2.length,
            difference: str1.length - str2.length,
            equal: str1.length === str2.length,
            comparison: str1.length > str2.length ? 'str1 is longer' : str1.length < str2.length ? 'str2 is longer' : 'equal length'
          };
          description = `Length comparison: ${result.comparison}`;
          break;

        case 'levenshtein':
          const distance = this.calculateLevenshteinDistance(str1, str2);
          result = {
            distance: distance,
            maxLength: Math.max(str1.length, str2.length),
            similarity: distance === 0 ? 1 : 1 - (distance / Math.max(str1.length, str2.length, 1)),
            identical: distance === 0
          };
          description = `Levenshtein distance: ${distance}`;
          break;

        case 'similarity':
          const sim = this.calculateJaroWinklerSimilarity(str1, str2);
          result = {
            similarity: sim,
            percentage: Math.round(sim * 100),
            identical: sim === 1.0,
            highSimilarity: sim > 0.8
          };
          description = `Similarity: ${Math.round(sim * 100)}%`;
          break;

        case 'contains':
          result = {
            str1ContainsStr2: str1.includes(str2),
            str2ContainsStr1: str2.includes(str1),
            mutualContainment: str1.includes(str2) && str2.includes(str1)
          };
          description = 'Substring containment analysis';
          break;

        case 'starts_with':
          result = {
            str1StartsWithStr2: str1.startsWith(str2),
            str2StartsWithStr1: str2.startsWith(str1),
            caseInsensitive: {
              str1StartsWithStr2: str1.toLowerCase().startsWith(str2.toLowerCase()),
              str2StartsWithStr1: str2.toLowerCase().startsWith(str1.toLowerCase())
            }
          };
          description = 'Prefix comparison analysis';
          break;

        case 'ends_with':
          result = {
            str1EndsWithStr2: str1.endsWith(str2),
            str2EndsWithStr1: str2.endsWith(str1),
            caseInsensitive: {
              str1EndsWithStr2: str1.toLowerCase().endsWith(str2.toLowerCase()),
              str2EndsWithStr1: str2.toLowerCase().endsWith(str1.toLowerCase())
            }
          };
          description = 'Suffix comparison analysis';
          break;

        default:
          return {
            success: false,
            error: `Invalid comparison method: ${method}`
          };
      }

      return {
        success: true,
        result: {
          method,
          comparison: result,
          description,
          strings: { str1, str2 }
        },
        metadata: {
          str1Length: str1.length,
          str2Length: str2.length,
          method
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `String comparison error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Transform strings with various operations
   */
  static transform(
    text: string,
    operations: Array<{
      type: 'uppercase' | 'lowercase' | 'title' | 'camel' | 'pascal' | 'snake' | 'kebab' | 'reverse' | 'trim' | 'pad';
      options?: any;
    }>
  ): StringToolResult {
    try {
      let result = text;
      const transformations = [];

      for (const operation of operations) {
        const before = result;
        
        switch (operation.type) {
          case 'uppercase':
            result = result.toUpperCase();
            break;

          case 'lowercase':
            result = result.toLowerCase();
            break;

          case 'title':
            result = result.replace(/\w\S*/g, (txt) => 
              txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );
            break;

          case 'camel':
            result = result
              .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
                index === 0 ? word.toLowerCase() : word.toUpperCase()
              )
              .replace(/\s+/g, '');
            break;

          case 'pascal':
            result = result
              .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
              .replace(/\s+/g, '');
            break;

          case 'snake':
            result = result
              .replace(/\W+/g, ' ')
              .split(/ |\B(?=[A-Z])/)
              .map(word => word.toLowerCase())
              .join('_');
            break;

          case 'kebab':
            result = result
              .replace(/\W+/g, ' ')
              .split(/ |\B(?=[A-Z])/)
              .map(word => word.toLowerCase())
              .join('-');
            break;

          case 'reverse':
            result = result.split('').reverse().join('');
            break;

          case 'trim':
            const trimType = operation.options?.type || 'both';
            switch (trimType) {
              case 'start':
                result = result.trimStart();
                break;
              case 'end':
                result = result.trimEnd();
                break;
              default:
                result = result.trim();
            }
            break;

          case 'pad':
            const length = operation.options?.length || 10;
            const char = operation.options?.character || ' ';
            const side = operation.options?.side || 'both';
            
            switch (side) {
              case 'start':
                result = result.padStart(length, char);
                break;
              case 'end':
                result = result.padEnd(length, char);
                break;
              default:
                const totalPad = Math.max(0, length - result.length);
                const leftPad = Math.floor(totalPad / 2);
                const rightPad = totalPad - leftPad;
                result = char.repeat(leftPad) + result + char.repeat(rightPad);
            }
            break;

          default:
            return {
              success: false,
              error: `Unknown transformation type: ${operation.type}`
            };
        }

        transformations.push({
          type: operation.type,
          options: operation.options,
          before,
          after: result,
          changed: before !== result
        });
      }

      return {
        success: true,
        result: {
          original: text,
          final: result,
          transformations,
          totalChanges: transformations.filter(t => t.changed).length
        },
        metadata: {
          originalLength: text.length,
          finalLength: result.length,
          operationsApplied: operations.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `String transformation error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Analyze string properties and characteristics
   */
  static analyze(text: string): StringToolResult {
    try {
      const lines = text.split('\n');
      const words = text.trim().split(/\s+/).filter(word => word.length > 0);
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

      // Character analysis
      const chars = text.split('');
      const letters = chars.filter(c => /[a-zA-Z]/.test(c));
      const digits = chars.filter(c => /\d/.test(c));
      const whitespace = chars.filter(c => /\s/.test(c));
      const punctuation = chars.filter(c => /[^\w\s]/.test(c));
      const uppercase = chars.filter(c => /[A-Z]/.test(c));
      const lowercase = chars.filter(c => /[a-z]/.test(c));

      // Frequency analysis
      const charFreq: { [key: string]: number } = {};
      const wordFreq: { [key: string]: number } = {};

      chars.forEach(c => {
        charFreq[c] = (charFreq[c] || 0) + 1;
      });

      words.forEach(w => {
        const word = w.toLowerCase();
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      });

      const topChars = Object.entries(charFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      const topWords = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      return {
        success: true,
        result: {
          basic: {
            length: text.length,
            lines: lines.length,
            words: words.length,
            sentences: sentences.length,
            paragraphs: paragraphs.length
          },
          characters: {
            total: text.length,
            letters: letters.length,
            digits: digits.length,
            whitespace: whitespace.length,
            punctuation: punctuation.length,
            uppercase: uppercase.length,
            lowercase: lowercase.length
          },
          averages: {
            wordsPerLine: lines.length > 0 ? words.length / lines.length : 0,
            wordsPerSentence: sentences.length > 0 ? words.length / sentences.length : 0,
            charactersPerWord: words.length > 0 ? letters.length / words.length : 0,
            sentencesPerParagraph: paragraphs.length > 0 ? sentences.length / paragraphs.length : 0
          },
          frequency: {
            topCharacters: topChars,
            topWords: topWords,
            uniqueWords: Object.keys(wordFreq).length,
            uniqueCharacters: Object.keys(charFreq).length
          },
          patterns: {
            hasNumbers: digits.length > 0,
            hasSpecialChars: punctuation.length > 0,
            hasMixedCase: uppercase.length > 0 && lowercase.length > 0,
            startsWithCapital: /^[A-Z]/.test(text),
            endsWithPunctuation: /[.!?]$/.test(text.trim())
          }
        },
        metadata: {
          analyzed: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `String analysis error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Find and highlight differences between two strings
   */
  static diff(str1: string, str2: string, options?: {
    ignoreCase?: boolean;
    ignoreWhitespace?: boolean;
    wordLevel?: boolean;
  }): StringToolResult {
    try {
      const opts = {
        ignoreCase: false,
        ignoreWhitespace: false,
        wordLevel: false,
        ...options
      };

      let text1 = str1;
      let text2 = str2;

      if (opts.ignoreCase) {
        text1 = text1.toLowerCase();
        text2 = text2.toLowerCase();
      }

      if (opts.ignoreWhitespace) {
        text1 = text1.replace(/\s+/g, ' ').trim();
        text2 = text2.replace(/\s+/g, ' ').trim();
      }

      let differences;
      if (opts.wordLevel) {
        differences = this.wordLevelDiff(text1, text2);
      } else {
        differences = this.characterLevelDiff(text1, text2);
      }

      const identical = text1 === text2;
      const similarity = identical ? 1 : 1 - (differences.changes / Math.max(text1.length, text2.length, 1));

      return {
        success: true,
        result: {
          identical,
          similarity: Math.round(similarity * 100) / 100,
          differences,
          options: opts,
          strings: {
            original1: str1,
            original2: str2,
            processed1: text1,
            processed2: text2
          }
        },
        metadata: {
          str1Length: str1.length,
          str2Length: str2.length,
          optionsApplied: opts
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `String diff error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Validate string against various patterns and rules
   */
  static validate(
    text: string,
    rules: Array<{
      type: 'email' | 'url' | 'phone' | 'length' | 'pattern' | 'required' | 'numeric' | 'alpha' | 'alphanumeric';
      options?: any;
      message?: string;
    }>
  ): StringToolResult {
    try {
      const results = [];
      let allValid = true;

      for (const rule of rules) {
        let isValid = false;
        let details = {};

        switch (rule.type) {
          case 'required':
            isValid = text.trim().length > 0;
            details = { hasContent: isValid };
            break;

          case 'length':
            const min = rule.options?.min || 0;
            const max = rule.options?.max || Infinity;
            isValid = text.length >= min && text.length <= max;
            details = { length: text.length, min, max, withinRange: isValid };
            break;

          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isValid = emailRegex.test(text);
            details = { format: isValid };
            break;

          case 'url':
            try {
              new URL(text);
              isValid = true;
            } catch {
              isValid = false;
            }
            details = { validUrl: isValid };
            break;

          case 'phone':
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            const cleanPhone = text.replace(/[\s\-\(\)\.]/g, '');
            isValid = phoneRegex.test(cleanPhone);
            details = { cleaned: cleanPhone, validFormat: isValid };
            break;

          case 'numeric':
            isValid = /^\d*\.?\d+$/.test(text.trim());
            details = { isNumber: isValid };
            break;

          case 'alpha':
            isValid = /^[a-zA-Z]+$/.test(text);
            details = { onlyLetters: isValid };
            break;

          case 'alphanumeric':
            isValid = /^[a-zA-Z0-9]+$/.test(text);
            details = { onlyAlphanumeric: isValid };
            break;

          case 'pattern':
            const pattern = rule.options?.pattern;
            const flags = rule.options?.flags || '';
            if (pattern) {
              const regex = new RegExp(pattern, flags);
              isValid = regex.test(text);
              details = { pattern, flags, matches: isValid };
            }
            break;
        }

        if (!isValid) {
          allValid = false;
        }

        results.push({
          type: rule.type,
          valid: isValid,
          message: rule.message || `${rule.type} validation ${isValid ? 'passed' : 'failed'}`,
          details,
          options: rule.options
        });
      }

      return {
        success: true,
        result: {
          allValid,
          validationResults: results,
          passedRules: results.filter(r => r.valid).length,
          failedRules: results.filter(r => !r.valid).length,
          totalRules: results.length
        },
        metadata: {
          textLength: text.length,
          rulesApplied: rules.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `String validation error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  // Helper methods

  private static calculateLevenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private static calculateJaroWinklerSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    if (str1.length === 0 || str2.length === 0) return 0.0;

    // Match window should use integer division
    const matchWindow = Math.floor(Math.max(str1.length, str2.length) / 2) - 1;
    const str1Matches = new Array(str1.length).fill(false);
    const str2Matches = new Array(str2.length).fill(false);

    let matches = 0;
    let transpositions = 0;

    // Identify matches
    for (let i = 0; i < str1.length; i++) {
      const start = Math.max(0, i - matchWindow);
      const end = Math.min(i + matchWindow + 1, str2.length);

      for (let j = start; j < end; j++) {
        if (str2Matches[j] || str1[i] !== str2[j]) continue;
        str1Matches[i] = true;
        str2Matches[j] = true;
        matches++;
        break;
      }
    }

    if (matches === 0) return 0.0;

    // Count transpositions
    let k = 0;
    for (let i = 0; i < str1.length; i++) {
      if (!str1Matches[i]) continue;
      while (!str2Matches[k]) k++;
      if (str1[i] !== str2[k]) transpositions++;
      k++;
    }

    const jaro = (matches / str1.length + matches / str2.length + (matches - transpositions / 2) / matches) / 3;

    // Jaro-Winkler prefix bonus
    let prefix = 0;
    for (let i = 0; i < Math.min(str1.length, str2.length, 4); i++) {
      if (str1[i] === str2[i]) prefix++;
      else break;
    }

    return jaro + (0.1 * prefix * (1 - jaro));
  }

  private static characterLevelDiff(str1: string, str2: string) {
    const changes = this.calculateLevenshteinDistance(str1, str2);
    return {
      changes,
      additions: Math.max(0, str2.length - str1.length),
      deletions: Math.max(0, str1.length - str2.length),
      type: 'character'
    };
  }

  private static wordLevelDiff(str1: string, str2: string) {
    const words1 = str1.split(/\s+/);
    const words2 = str2.split(/\s+/);
    
    const changes = this.calculateLevenshteinDistance(words1.join(' '), words2.join(' '));
    
    return {
      changes,
      additions: Math.max(0, words2.length - words1.length),
      deletions: Math.max(0, words1.length - words2.length),
      type: 'word',
      words1Count: words1.length,
      words2Count: words2.length
    };
  }
}