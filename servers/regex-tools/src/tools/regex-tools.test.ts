/**
 * Comprehensive test suite for RegexTools
 * Tests all public methods with multiple test cases including success and failure scenarios
 */
/// <reference types="jest" />
import RegexTools from './regex-tools.js';

describe('RegexTools', () => {
  describe('matchCount', () => {
    test('should count simple pattern matches', () => {
      const result = RegexTools.matchCount('hello world hello', 'hello');
      
      expect(result.success).toBe(true);
      expect(result.result).toBe(2);
      expect(result.metadata?.pattern).toBe('hello');
      expect(result.metadata?.flags).toBe('g');
      expect(result.metadata?.textLength).toBe(17);
    });

    test('should count with case insensitive flag', () => {
      const result = RegexTools.matchCount('Hello HELLO hello', 'hello', 'gi');
      
      expect(result.success).toBe(true);
      expect(result.result).toBe(3);
      expect(result.metadata?.flags).toBe('gi');
    });

    test('should count complex regex patterns', () => {
      const result = RegexTools.matchCount('test@email.com and user@domain.org', '\\w+@\\w+\\.\\w+');
      
      expect(result.success).toBe(true);
      expect(result.result).toBe(2);
    });

    test('should return zero for no matches', () => {
      const result = RegexTools.matchCount('hello world', 'xyz');
      
      expect(result.success).toBe(true);
      expect(result.result).toBe(0);
    });

    test('should handle empty text', () => {
      const result = RegexTools.matchCount('', 'test');
      
      expect(result.success).toBe(true);
      expect(result.result).toBe(0);
    });

    test('should fail with invalid regex pattern', () => {
      const result = RegexTools.matchCount('test text', '[invalid');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid regex pattern');
    });

    test('should count digit patterns', () => {
      const result = RegexTools.matchCount('123 abc 456 def 789', '\\d+');
      
      expect(result.success).toBe(true);
      expect(result.result).toBe(3);
    });
  });

  describe('match', () => {
    test('should test simple pattern match', () => {
      const result = RegexTools.match('hello world', 'world');
      
      expect(result.success).toBe(true);
      expect(result.result.isMatch).toBe(true);
      expect(result.result.firstMatch).toBe('world');
      expect(result.result.index).toBe(6);
    });

    test('should return false for no match', () => {
      const result = RegexTools.match('hello world', 'xyz');
      
      expect(result.success).toBe(true);
      expect(result.result.isMatch).toBe(false);
      expect(result.result.firstMatch).toBe(null);
      expect(result.result.index).toBe(-1);
    });

    test('should test with case insensitive flag', () => {
      const result = RegexTools.match('Hello World', 'hello', 'i');
      
      expect(result.success).toBe(true);
      expect(result.result.isMatch).toBe(true);
      expect(result.result.firstMatch).toBe('Hello');
      expect(result.result.index).toBe(0);
    });

    test('should test email pattern', () => {
      const result = RegexTools.match('Contact us at test@example.com', '\\w+@\\w+\\.\\w+');
      
      expect(result.success).toBe(true);
      expect(result.result.isMatch).toBe(true);
      expect(result.result.firstMatch).toBe('test@example.com');
    });

    test('should handle anchored patterns', () => {
      const result = RegexTools.match('hello world', '^hello');
      
      expect(result.success).toBe(true);
      expect(result.result.isMatch).toBe(true);
      expect(result.result.index).toBe(0);
    });

    test('should fail with invalid regex pattern', () => {
      const result = RegexTools.match('test text', '[invalid');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid regex pattern');
    });

    test('should include metadata in result', () => {
      const result = RegexTools.match('test string', 'test', 'i');
      
      expect(result.success).toBe(true);
      expect(result.metadata?.pattern).toBe('test');
      expect(result.metadata?.flags).toBe('i');
      expect(result.metadata?.textLength).toBe(11);
    });
  });

  describe('extract', () => {
    test('should extract all simple matches', () => {
      const result = RegexTools.extract('abc 123 def 456', '\\d+');
      
      expect(result.success).toBe(true);
      expect(result.result).toHaveLength(2);
      expect(result.result[0].match).toBe('123');
      expect(result.result[0].index).toBe(4);
      expect(result.result[1].match).toBe('456');
      expect(result.metadata?.totalMatches).toBe(2);
    });

    test('should extract with capture groups', () => {
      const result = RegexTools.extract('John: 25, Jane: 30', '(\\w+): (\\d+)');
      
      expect(result.success).toBe(true);
      expect(result.result).toHaveLength(2);
      expect(result.result[0].match).toBe('John: 25');
      expect(result.result[0].groups).toEqual(['John', '25']);
      expect(result.result[1].match).toBe('Jane: 30');
      expect(result.result[1].groups).toEqual(['Jane', '30']);
    });

    test('should extract with named groups', () => {
      const result = RegexTools.extract('user@domain.com', '(?<user>\\w+)@(?<domain>\\w+\\.\\w+)');
      
      expect(result.success).toBe(true);
      expect(result.result).toHaveLength(1);
      expect(result.result[0].namedGroups.user).toBe('user');
      expect(result.result[0].namedGroups.domain).toBe('domain.com');
    });

    test('should return empty array for no matches', () => {
      const result = RegexTools.extract('hello world', '\\d+');
      
      expect(result.success).toBe(true);
      expect(result.result).toHaveLength(0);
      expect(result.metadata?.totalMatches).toBe(0);
    });

    test('should extract email addresses', () => {
      const text = 'Contact john@test.com or support@company.org for help';
      const result = RegexTools.extract(text, '\\w+@\\w+\\.\\w+');
      
      expect(result.success).toBe(true);
      expect(result.result).toHaveLength(2);
      expect(result.result[0].match).toBe('john@test.com');
      expect(result.result[1].match).toBe('support@company.org');
    });

    test('should handle case insensitive extraction', () => {
      const result = RegexTools.extract('HELLO world HELLO', 'hello', 'gi');
      
      expect(result.success).toBe(true);
      expect(result.result).toHaveLength(2);
      expect(result.result[0].match).toBe('HELLO');
      expect(result.result[1].match).toBe('HELLO');
    });

    test('should fail with invalid regex pattern', () => {
      const result = RegexTools.extract('test text', '[invalid');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid regex pattern');
    });
  });

  describe('replace', () => {
    test('should replace simple pattern', () => {
      const result = RegexTools.replace('hello world hello', 'hello', 'hi');
      
      expect(result.success).toBe(true);
      expect(result.result.originalText).toBe('hello world hello');
      expect(result.result.newText).toBe('hi world hi');
      expect(result.result.changeCount).toBe(2);
      expect(result.result.hasChanges).toBe(true);
    });

    test('should replace with capture group references', () => {
      const result = RegexTools.replace('John Smith', '(\\w+) (\\w+)', '$2, $1');
      
      expect(result.success).toBe(true);
      expect(result.result.newText).toBe('Smith, John');
      expect(result.result.changeCount).toBe(1);
    });

    test('should replace multiple occurrences', () => {
      const result = RegexTools.replace('cat bat rat', '(\\w)at', '$1og');
      
      expect(result.success).toBe(true);
      expect(result.result.newText).toBe('cog bog rog');
      expect(result.result.changeCount).toBe(3);
    });

    test('should handle no matches', () => {
      const result = RegexTools.replace('hello world', 'xyz', 'abc');
      
      expect(result.success).toBe(true);
      expect(result.result.originalText).toBe('hello world');
      expect(result.result.newText).toBe('hello world');
      expect(result.result.changeCount).toBe(0);
      expect(result.result.hasChanges).toBe(false);
    });

    test('should replace with case insensitive flag', () => {
      const result = RegexTools.replace('Hello HELLO hello', 'hello', 'hi', 'gi');
      
      expect(result.success).toBe(true);
      expect(result.result.newText).toBe('hi hi hi');
      expect(result.result.changeCount).toBe(3);
    });

    test('should replace only first occurrence without global flag', () => {
      const result = RegexTools.replace('test test test', 'test', 'exam', '');
      
      expect(result.success).toBe(true);
      expect(result.result.newText).toBe('exam test test');
      expect(result.result.changeCount).toBe(1);
    });

    test('should fail with invalid regex pattern', () => {
      const result = RegexTools.replace('test text', '[invalid', 'replacement');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid regex pattern');
    });

    test('should include metadata with lengths', () => {
      const result = RegexTools.replace('hello', 'hello', 'goodbye');
      
      expect(result.success).toBe(true);
      expect(result.metadata?.originalLength).toBe(5);
      expect(result.metadata?.newLength).toBe(7);
      expect(result.metadata?.replacement).toBe('goodbye');
    });
  });

  describe('split', () => {
    test('should split by simple pattern', () => {
      const result = RegexTools.split('apple,banana,cherry', ',');
      
      expect(result.success).toBe(true);
      expect(result.result.parts).toEqual(['apple', 'banana', 'cherry']);
      expect(result.result.count).toBe(3);
    });

    test('should split by regex pattern', () => {
      const result = RegexTools.split('one1two2three3four', '\\d');
      
      expect(result.success).toBe(true);
      expect(result.result.parts).toEqual(['one', 'two', 'three', 'four']);
      expect(result.result.count).toBe(4);
    });

    test('should split with limit', () => {
      const result = RegexTools.split('a,b,c,d,e', ',', '', 3);
      
      expect(result.success).toBe(true);
      expect(result.result.parts).toEqual(['a', 'b', 'c,d,e']);
      expect(result.result.count).toBe(3);
      expect(result.metadata?.limit).toBe(3);
    });

    test('should split on whitespace', () => {
      const result = RegexTools.split('hello   world  test', '\\s+');
      
      expect(result.success).toBe(true);
      expect(result.result.parts).toEqual(['hello', 'world', 'test']);
      expect(result.result.count).toBe(3);
    });

    test('should handle no split pattern found', () => {
      const result = RegexTools.split('hello world', 'xyz');
      
      expect(result.success).toBe(true);
      expect(result.result.parts).toEqual(['hello world']);
      expect(result.result.count).toBe(1);
    });

    test('should split empty string', () => {
      const result = RegexTools.split('', ',');
      
      expect(result.success).toBe(true);
      expect(result.result.parts).toEqual(['']);
      expect(result.result.count).toBe(1);
    });

    test('should fail with invalid regex pattern', () => {
      const result = RegexTools.split('test text', '[invalid');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid regex pattern');
    });

    test('should include metadata', () => {
      const result = RegexTools.split('a,b,c', ',');
      
      expect(result.success).toBe(true);
      expect(result.metadata?.pattern).toBe(',');
      expect(result.metadata?.originalLength).toBe(5);
      expect(result.metadata?.limit).toBe('unlimited');
    });
  });

  describe('extractJson', () => {
    test('should extract valid JSON objects', () => {
      const text = 'Here is data: {"name": "John", "age": 30} and more';
      const result = RegexTools.extractJson(text);
      
      expect(result.success).toBe(true);
      expect(result.result.validJson).toHaveLength(1);
      expect(result.result.validJson[0].parsed).toEqual({ name: "John", age: 30 });
      expect(result.result.validCount).toBe(1);
      expect(result.result.invalidCount).toBe(0);
    });

    test('should extract multiple JSON objects', () => {
      const text = 'Data: {"a": 1} and {"b": 2} plus [1,2,3]';
      const result = RegexTools.extractJson(text);
      
      expect(result.success).toBe(true);
      expect(result.result.validJson).toHaveLength(3);
      expect(result.result.validJson[0].parsed).toEqual({ a: 1 });
      expect(result.result.validJson[1].parsed).toEqual({ b: 2 });
      expect(result.result.validJson[2].parsed).toEqual([1, 2, 3]);
    });

    test('should handle invalid JSON syntax', () => {
      const text = 'Invalid: {name: "John"} and valid: {"age": 30}';
      const result = RegexTools.extractJson(text);
      
      expect(result.success).toBe(true);
      expect(result.result.validCount).toBe(1);
      expect(result.result.invalidCount).toBe(1);
      expect(result.result.invalidJson[0].error).toBe('Invalid JSON syntax');
    });

    test('should extract nested JSON', () => {
      const text = 'Nested: {"user": {"name": "John", "data": [1,2,3]}}';
      const result = RegexTools.extractJson(text);
      
      expect(result.success).toBe(true);
      expect(result.result.validJson).toHaveLength(1);
      expect(result.result.validJson[0].parsed.user.name).toBe('John');
      expect(result.result.validJson[0].parsed.user.data).toEqual([1, 2, 3]);
    });

    test('should handle text with no JSON', () => {
      const result = RegexTools.extractJson('Just plain text here');
      
      expect(result.success).toBe(true);
      expect(result.result.totalFound).toBe(0);
      expect(result.result.validCount).toBe(0);
      expect(result.result.invalidCount).toBe(0);
    });

    test('should include metadata', () => {
      const text = 'Some data: {"test": true}';
      const result = RegexTools.extractJson(text);
      
      expect(result.success).toBe(true);
      expect(result.metadata?.textLength).toBe(25);
    });
  });

  describe('findGroups', () => {
    test('should find capture groups', () => {
      const result = RegexTools.findGroups('John: 25, Jane: 30', '(\\w+): (\\d+)');
      
      expect(result.success).toBe(true);
      expect(result.result.groups).toHaveLength(2);
      expect(result.result.groups[0].captureGroups).toEqual(['John', '25']);
      expect(result.result.groups[1].captureGroups).toEqual(['Jane', '30']);
      expect(result.result.totalMatches).toBe(2);
    });

    test('should find named groups', () => {
      const result = RegexTools.findGroups(
        'test@example.com',
        '(?<user>\\w+)@(?<domain>\\w+\\.\\w+)'
      );
      
      expect(result.success).toBe(true);
      expect(result.result.groups).toHaveLength(1);
      expect(result.result.groups[0].namedGroups.user).toBe('test');
      expect(result.result.groups[0].namedGroups.domain).toBe('example.com');
      expect(result.result.hasNamedGroups).toBe(true);
    });

    test('should handle no groups', () => {
      const result = RegexTools.findGroups('hello world', 'hello');
      
      expect(result.success).toBe(true);
      expect(result.result.groups).toHaveLength(1);
      expect(result.result.groups[0].captureGroups).toEqual([]);
      expect(result.result.hasNamedGroups).toBe(false);
    });

    test('should handle multiple matches with groups', () => {
      const result = RegexTools.findGroups('id:123 ref:456', '(\\w+):(\\d+)');
      
      expect(result.success).toBe(true);
      expect(result.result.groups).toHaveLength(2);
      expect(result.result.groups[0].captureGroups).toEqual(['id', '123']);
      expect(result.result.groups[1].captureGroups).toEqual(['ref', '456']);
    });

    test('should include match index and position', () => {
      const result = RegexTools.findGroups('test (abc) more (def)', '\\((\\w+)\\)');
      
      expect(result.success).toBe(true);
      expect(result.result.groups).toHaveLength(2);
      expect(result.result.groups[0].matchIndex).toBe(0);
      expect(result.result.groups[0].index).toBe(5);
      expect(result.result.groups[1].matchIndex).toBe(1);
    });

    test('should fail with invalid regex pattern', () => {
      const result = RegexTools.findGroups('test text', '[invalid');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid regex pattern');
    });
  });

  describe('validate', () => {
    test('should validate correct regex pattern', () => {
      const result = RegexTools.validate('\\d+', 'g');
      
      expect(result.success).toBe(true);
      expect(result.result.isValid).toBe(true);
      expect(result.result.pattern).toBe('\\d+');
      expect(result.result.flags).toBe('g');
      expect(result.result.source).toBe('\\d+');
      expect(result.result.compiledFlags).toBe('g');
    });

    test('should detect invalid regex pattern', () => {
      const result = RegexTools.validate('[invalid');
      
      expect(result.success).toBe(true);
      expect(result.result.isValid).toBe(false);
      expect(result.result.error).toBeDefined();
    });

    test('should validate complex regex', () => {
      const result = RegexTools.validate('(?<user>\\w+)@(?<domain>\\w+\\.\\w+)', 'gi');
      
      expect(result.success).toBe(true);
      expect(result.result.isValid).toBe(true);
      expect(result.result.compiledFlags).toBe('gi');
    });

    test('should handle empty pattern', () => {
      const result = RegexTools.validate('');
      
      expect(result.success).toBe(true);
      expect(result.result.isValid).toBe(true);
      expect(result.result.source).toBe('(?:)');
    });

    test('should validate with no flags', () => {
      const result = RegexTools.validate('test');
      
      expect(result.success).toBe(true);
      expect(result.result.isValid).toBe(true);
      expect(result.result.flags).toBe('');
    });

    test('should include metadata', () => {
      const result = RegexTools.validate('\\w+');
      
      expect(result.success).toBe(true);
      expect(result.metadata?.patternLength).toBe(3);
    });
  });

  describe('tokenize', () => {
    test('should tokenize with default pattern', () => {
      const result = RegexTools.tokenize('Hello, world! How are you?');
      
      expect(result.success).toBe(true);
      expect(result.result.tokens.map((t: any) => t.token)).toEqual(['Hello', 'world', 'How', 'are', 'you']);
      expect(result.result.tokenCount).toBe(5);
    });

    test('should tokenize with custom pattern', () => {
      const result = RegexTools.tokenize('apple,banana;cherry:grape', '[,;:]');
      
      expect(result.success).toBe(true);
      expect(result.result.tokens.map((t: any) => t.token)).toEqual(['apple', 'banana', 'cherry', 'grape']);
      expect(result.result.tokenCount).toBe(4);
    });

    test('should calculate average token length', () => {
      const result = RegexTools.tokenize('a bb ccc');
      
      expect(result.success).toBe(true);
      expect(result.result.averageTokenLength).toBe(2); // (1+2+3)/3 = 2
    });

    test('should handle empty text', () => {
      const result = RegexTools.tokenize('');
      
      expect(result.success).toBe(true);
      expect(result.result.tokenCount).toBe(0);
      expect(result.result.averageTokenLength).toBe(0);
    });

    test('should filter out empty tokens', () => {
      const result = RegexTools.tokenize('  hello   world  ', '\\s+');
      
      expect(result.success).toBe(true);
      expect(result.result.tokens.map((t: any) => t.token)).toEqual(['hello', 'world']);
      expect(result.result.tokenCount).toBe(2);
    });

    test('should include token indices', () => {
      const result = RegexTools.tokenize('one two three');
      
      expect(result.success).toBe(true);
      expect(result.result.tokens[0].index).toBe(0);
      expect(result.result.tokens[1].index).toBe(1);
      expect(result.result.tokens[2].index).toBe(2);
    });

    test('should fail with invalid regex pattern', () => {
      const result = RegexTools.tokenize('test text', '[invalid');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Tokenization error');
    });
  });

  describe('normalizeWhitespace', () => {
    test('should normalize with default options', () => {
      const result = RegexTools.normalizeWhitespace('  hello    world  \r\n  ');
      
      expect(result.success).toBe(true);
      expect(result.result.normalizedText).toBe('hello world');
      expect(result.result.hasChanges).toBe(true);
      expect(result.result.changes).toContain('trimmed start');
      expect(result.result.changes).toContain('trimmed end');
    });

    test('should collapse multiple spaces', () => {
      const result = RegexTools.normalizeWhitespace('hello     world', { collapseSpaces: true });
      
      expect(result.success).toBe(true);
      expect(result.result.normalizedText).toBe('hello world');
      expect(result.result.changes).toContain('collapsed spaces');
    });

    test('should remove line breaks', () => {
      const result = RegexTools.normalizeWhitespace('hello\nworld\ntest', { removeLineBreaks: true });
      
      expect(result.success).toBe(true);
      expect(result.result.normalizedText).toBe('hello world test');
      expect(result.result.changes).toContain('removed line breaks');
    });

    test('should normalize line breaks', () => {
      const result = RegexTools.normalizeWhitespace('hello\r\nworld\rtest', { normalizeLineBreaks: true });
      
      expect(result.success).toBe(true);
      expect(result.result.normalizedText).toBe('hello\nworld\ntest');
      expect(result.result.changes).toContain('normalized line breaks');
    });

    test('should handle custom options', () => {
      const result = RegexTools.normalizeWhitespace('  hello  world  ', {
        trimStart: false,
        trimEnd: false,
        collapseSpaces: true
      });
      
      expect(result.success).toBe(true);
      expect(result.result.normalizedText).toBe(' hello world ');
    });

    test('should handle no changes needed', () => {
      const result = RegexTools.normalizeWhitespace('hello world');
      
      expect(result.success).toBe(true);
      expect(result.result.hasChanges).toBe(false);
      expect(result.result.changes).toHaveLength(0);
    });

    test('should include metadata', () => {
      const result = RegexTools.normalizeWhitespace('  test  ');
      
      expect(result.success).toBe(true);
      expect(result.metadata?.originalLength).toBe(8);
      expect(result.metadata?.newLength).toBe(4);
    });
  });

  describe('redact', () => {
    test('should redact sensitive information', () => {
      const patterns = [
        { name: 'email', pattern: '\\w+@\\w+\\.\\w+' },
        { name: 'phone', pattern: '\\d{3}-\\d{3}-\\d{4}' }
      ];
      const text = 'Contact john@test.com or call 555-123-4567';
      const result = RegexTools.redact(text, patterns);
      
      expect(result.success).toBe(true);
      expect(result.result.redactedText).toBe('Contact [REDACTED] or call [REDACTED]');
      expect(result.result.redactions).toHaveLength(2);
      expect(result.result.totalRedactions).toBe(2);
      expect(result.result.hasRedactions).toBe(true);
    });

    test('should use custom replacement text', () => {
      const patterns = [
        { name: 'email', pattern: '\\w+@\\w+\\.\\w+', replacement: '[EMAIL]' }
      ];
      const text = 'Email me at test@example.com';
      const result = RegexTools.redact(text, patterns, 'gi');
      
      expect(result.success).toBe(true);
      expect(result.result.redactedText).toBe('Email me at [EMAIL]');
      expect(result.result.redactions[0].replacement).toBe('[EMAIL]');
    });

    test('should track multiple matches per pattern', () => {
      const patterns = [
        { name: 'number', pattern: '\\d+' }
      ];
      const text = 'Numbers: 123, 456, 789';
      const result = RegexTools.redact(text, patterns);
      
      expect(result.success).toBe(true);
      expect(result.result.redactions[0].matchCount).toBe(3);
      expect(result.result.redactions[0].matches).toHaveLength(3);
    });

    test('should handle no matches', () => {
      const patterns = [
        { name: 'email', pattern: '\\w+@\\w+\\.\\w+' }
      ];
      const text = 'No sensitive data here';
      const result = RegexTools.redact(text, patterns);
      
      expect(result.success).toBe(true);
      expect(result.result.redactedText).toBe('No sensitive data here');
      expect(result.result.hasRedactions).toBe(false);
      expect(result.result.totalRedactions).toBe(0);
    });

    test('should redact credit card numbers', () => {
      const patterns = [
        { name: 'credit-card', pattern: '\\d{4}-?\\d{4}-?\\d{4}-?\\d{4}', replacement: '[CARD]' }
      ];
      const text = 'Card: 1234-5678-9012-3456 or 1111222233334444';
      const result = RegexTools.redact(text, patterns);
      
      expect(result.success).toBe(true);
      expect(result.result.redactedText).toBe('Card: [CARD] or [CARD]');
    });

    test('should include detailed match information', () => {
      const patterns = [
        { name: 'word', pattern: 'test' }
      ];
      const text = 'This is a test string for test purposes';
      const result = RegexTools.redact(text, patterns);
      
      expect(result.success).toBe(true);
      expect(result.result.redactions[0].matches[0].text).toBe('test');
      expect(result.result.redactions[0].matches[0].index).toBeDefined();
    });

    test('should handle empty patterns array', () => {
      const result = RegexTools.redact('test text', []);
      
      expect(result.success).toBe(true);
      expect(result.result.hasRedactions).toBe(false);
      expect(result.result.redactedText).toBe('test text');
    });

    test('should fail with invalid regex pattern', () => {
      const patterns = [
        { name: 'invalid', pattern: '[invalid' }
      ];
      const result = RegexTools.redact('test text', patterns);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Redaction error');
    });

    test('should include metadata', () => {
      const patterns = [{ name: 'test', pattern: 'test' }];
      const result = RegexTools.redact('test string', patterns, 'gi');
      
      expect(result.success).toBe(true);
      expect(result.metadata?.originalLength).toBe(11);
      expect(result.metadata?.patternsUsed).toBe(1);
      expect(result.metadata?.flags).toBe('gi');
    });
  });

  describe('Error handling', () => {
    test('should handle null/undefined inputs gracefully', () => {
      const result = RegexTools.matchCount(null as any, 'test');
      expect(result.success).toBe(false);
    });

    test('should provide meaningful error messages', () => {
      const result = RegexTools.extract('test', '*invalid*');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid regex pattern');
    });

    test('should handle edge cases in tokenization', () => {
      const result = RegexTools.tokenize('   ');
      expect(result.success).toBe(true);
      expect(result.result.tokenCount).toBe(0);
    });
  });
});