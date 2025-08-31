/**
 * Test suite for StringTools
 */

/// <reference types="jest" />
import StringTools from './string-tools.js';

describe('StringTools', () => {
  describe('compare', () => {
    test('exact comparison - equal strings', () => {
      const result = StringTools.compare('hello', 'hello', 'exact');
      expect(result.success).toBe(true);
      expect(result.result?.comparison).toBe(true);
      expect(result.result?.description).toBe('Strings are exactly equal');
    });

    test('exact comparison - different strings', () => {
      const result = StringTools.compare('hello', 'world', 'exact');
      expect(result.success).toBe(true);
      expect(result.result?.comparison).toBe(false);
      expect(result.result?.description).toBe('Strings are not equal');
    });

    test('case insensitive comparison', () => {
      const result = StringTools.compare('Hello', 'HELLO', 'case_insensitive');
      expect(result.success).toBe(true);
      expect(result.result?.comparison).toBe(true);
      expect(result.result?.description).toBe('Strings are equal (case-insensitive)');
    });

    test('length comparison - equal length', () => {
      const result = StringTools.compare('abc', 'xyz', 'length');
      expect(result.success).toBe(true);
      expect(result.result?.comparison.equal).toBe(true);
      expect(result.result?.comparison.difference).toBe(0);
      expect(result.result?.comparison.comparison).toBe('equal length');
    });

    test('length comparison - different lengths', () => {
      const result = StringTools.compare('hello', 'hi', 'length');
      expect(result.success).toBe(true);
      expect(result.result?.comparison.equal).toBe(false);
      expect(result.result?.comparison.difference).toBe(3);
      expect(result.result?.comparison.comparison).toBe('str1 is longer');
    });

    test('levenshtein distance - identical strings', () => {
      const result = StringTools.compare('test', 'test', 'levenshtein');
      expect(result.success).toBe(true);
      expect(result.result?.comparison.distance).toBe(0);
      expect(result.result?.comparison.similarity).toBe(1);
      expect(result.result?.comparison.identical).toBe(true);
    });

    test('levenshtein distance - different strings', () => {
      const result = StringTools.compare('kitten', 'sitting', 'levenshtein');
      expect(result.success).toBe(true);
      expect(result.result?.comparison.distance).toBe(3);
      expect(result.result?.comparison.identical).toBe(false);
    });

    test('similarity comparison', () => {
      const result = StringTools.compare('hello', 'hallo', 'similarity');
      expect(result.success).toBe(true);
      expect(result.result?.comparison.similarity).toBeGreaterThan(0.7);
      expect(result.result?.comparison.identical).toBe(false);
    });

    test('contains comparison', () => {
      const result = StringTools.compare('hello world', 'world', 'contains');
      expect(result.success).toBe(true);
      expect(result.result?.comparison.str1ContainsStr2).toBe(true);
      expect(result.result?.comparison.str2ContainsStr1).toBe(false);
    });

    test('starts_with comparison', () => {
      const result = StringTools.compare('hello world', 'hello', 'starts_with');
      expect(result.success).toBe(true);
      expect(result.result?.comparison.str1StartsWithStr2).toBe(true);
      expect(result.result?.comparison.str2StartsWithStr1).toBe(false);
    });

    test('ends_with comparison', () => {
      const result = StringTools.compare('hello world', 'world', 'ends_with');
      expect(result.success).toBe(true);
      expect(result.result?.comparison.str1EndsWithStr2).toBe(true);
      expect(result.result?.comparison.str2EndsWithStr1).toBe(false);
    });

    test('invalid comparison method', () => {
      const result = StringTools.compare('test', 'test', 'invalid' as any);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid comparison method');
    });
  });

  describe('transform', () => {
    test('uppercase transformation', () => {
      const result = StringTools.transform('hello world', [{ type: 'uppercase' }]);
      expect(result.success).toBe(true);
      expect(result.result?.final).toBe('HELLO WORLD');
    });

    test('lowercase transformation', () => {
      const result = StringTools.transform('HELLO WORLD', [{ type: 'lowercase' }]);
      expect(result.success).toBe(true);
      expect(result.result?.final).toBe('hello world');
    });

    test('title case transformation', () => {
      const result = StringTools.transform('hello world test', [{ type: 'title' }]);
      expect(result.success).toBe(true);
      expect(result.result?.final).toBe('Hello World Test');
    });

    test('camelCase transformation', () => {
      const result = StringTools.transform('hello world test', [{ type: 'camel' }]);
      expect(result.success).toBe(true);
      expect(result.result?.final).toBe('helloWorldTest');
    });

    test('PascalCase transformation', () => {
      const result = StringTools.transform('hello world test', [{ type: 'pascal' }]);
      expect(result.success).toBe(true);
      expect(result.result?.final).toBe('HelloWorldTest');
    });

    test('snake_case transformation', () => {
      const result = StringTools.transform('hello world test', [{ type: 'snake' }]);
      expect(result.success).toBe(true);
      expect(result.result?.final).toBe('hello_world_test');
    });

    test('kebab-case transformation', () => {
      const result = StringTools.transform('hello world test', [{ type: 'kebab' }]);
      expect(result.success).toBe(true);
      expect(result.result?.final).toBe('hello-world-test');
    });

    test('reverse transformation', () => {
      const result = StringTools.transform('hello', [{ type: 'reverse' }]);
      expect(result.success).toBe(true);
      expect(result.result?.final).toBe('olleh');
    });

    test('trim transformation', () => {
      const result = StringTools.transform('  hello world  ', [{ type: 'trim' }]);
      expect(result.success).toBe(true);
      expect(result.result?.final).toBe('hello world');
    });

    test('trim start transformation', () => {
      const result = StringTools.transform('  hello world  ', [{ type: 'trim', options: { type: 'start' } }]);
      expect(result.success).toBe(true);
      expect(result.result?.final).toBe('hello world  ');
    });

    test('pad transformation', () => {
      const result = StringTools.transform('test', [{ type: 'pad', options: { length: 10, character: '*' } }]);
      expect(result.success).toBe(true);
      expect(result.result?.final).toBe('***test***');
    });

    test('pad start transformation', () => {
      const result = StringTools.transform('test', [{ type: 'pad', options: { length: 8, character: '0', side: 'start' } }]);
      expect(result.success).toBe(true);
      expect(result.result?.final).toBe('0000test');
    });

    test('multiple transformations', () => {
      const result = StringTools.transform('  hello world  ', [
        { type: 'trim' },
        { type: 'uppercase' },
        { type: 'reverse' }
      ]);
      expect(result.success).toBe(true);
      expect(result.result?.final).toBe('DLROW OLLEH');
      expect(result.result?.transformations).toHaveLength(3);
    });

    test('unknown transformation type', () => {
      const result = StringTools.transform('test', [{ type: 'unknown' as any }]);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown transformation type');
    });
  });

  describe('analyze', () => {
    test('basic text analysis', () => {
      const text = 'Hello world! This is a test.';
      const result = StringTools.analyze(text);
      
      expect(result.success).toBe(true);
      expect(result.result?.basic.length).toBe(text.length);
      expect(result.result?.basic.words).toBe(6);
      expect(result.result?.basic.sentences).toBe(2);
    });

    test('multiline text analysis', () => {
      const text = 'Line 1\nLine 2\n\nParagraph 2';
      const result = StringTools.analyze(text);
      
      expect(result.success).toBe(true);
      expect(result.result?.basic.lines).toBe(4);
      expect(result.result?.basic.paragraphs).toBe(2);
    });

    test('character type analysis', () => {
      const text = 'Hello123!';
      const result = StringTools.analyze(text);
      
      expect(result.success).toBe(true);
      expect(result.result?.characters.letters).toBe(5);
      expect(result.result?.characters.digits).toBe(3);
      expect(result.result?.characters.punctuation).toBe(1);
      expect(result.result?.characters.uppercase).toBe(1);
      expect(result.result?.characters.lowercase).toBe(4);
    });

    test('frequency analysis', () => {
      const text = 'hello hello world';
      const result = StringTools.analyze(text);
      
      expect(result.success).toBe(true);
      expect(result.result?.frequency.uniqueWords).toBe(2);
      expect(result.result?.frequency.topWords[0][0]).toBe('hello');
      expect(result.result?.frequency.topWords[0][1]).toBe(2);
    });

    test('pattern detection', () => {
      const text = 'Hello world!';
      const result = StringTools.analyze(text);
      
      expect(result.success).toBe(true);
      expect(result.result?.patterns.startsWithCapital).toBe(true);
      expect(result.result?.patterns.endsWithPunctuation).toBe(true);
      expect(result.result?.patterns.hasMixedCase).toBe(true);
    });

    test('empty string analysis', () => {
      const result = StringTools.analyze('');
      
      expect(result.success).toBe(true);
      expect(result.result?.basic.length).toBe(0);
      expect(result.result?.basic.words).toBe(0);
    });
  });

  describe('diff', () => {
    test('identical strings', () => {
      const result = StringTools.diff('hello', 'hello');
      
      expect(result.success).toBe(true);
      expect(result.result?.identical).toBe(true);
      expect(result.result?.similarity).toBe(1);
    });

    test('different strings', () => {
      const result = StringTools.diff('hello', 'hallo');
      
      expect(result.success).toBe(true);
      expect(result.result?.identical).toBe(false);
      expect(result.result?.similarity).toBeLessThan(1);
    });

    test('case insensitive diff', () => {
      const result = StringTools.diff('Hello', 'HELLO', { ignoreCase: true });
      
      expect(result.success).toBe(true);
      expect(result.result?.identical).toBe(true);
    });

    test('ignore whitespace diff', () => {
      const result = StringTools.diff('hello  world', 'hello world', { ignoreWhitespace: true });
      
      expect(result.success).toBe(true);
      expect(result.result?.identical).toBe(true);
    });

    test('word level diff', () => {
      const result = StringTools.diff('hello world test', 'hello world demo', { wordLevel: true });
      
      expect(result.success).toBe(true);
      expect(result.result?.differences.type).toBe('word');
    });

    test('completely different strings', () => {
      const result = StringTools.diff('abc', 'xyz');
      
      expect(result.success).toBe(true);
      expect(result.result?.identical).toBe(false);
      expect(result.result?.similarity).toBe(0);
    });
  });

  describe('validate', () => {
    test('required validation - valid', () => {
      const result = StringTools.validate('hello', [{ type: 'required' }]);
      
      expect(result.success).toBe(true);
      expect(result.result?.allValid).toBe(true);
      expect(result.result?.validationResults[0].valid).toBe(true);
    });

    test('required validation - invalid', () => {
      const result = StringTools.validate('  ', [{ type: 'required' }]);
      
      expect(result.success).toBe(true);
      expect(result.result?.allValid).toBe(false);
      expect(result.result?.validationResults[0].valid).toBe(false);
    });

    test('length validation - valid', () => {
      const result = StringTools.validate('hello', [{ type: 'length', options: { min: 3, max: 10 } }]);
      
      expect(result.success).toBe(true);
      expect(result.result?.allValid).toBe(true);
    });

    test('length validation - invalid', () => {
      const result = StringTools.validate('hi', [{ type: 'length', options: { min: 5, max: 10 } }]);
      
      expect(result.success).toBe(true);
      expect(result.result?.allValid).toBe(false);
    });

    test('email validation - valid', () => {
      const result = StringTools.validate('test@example.com', [{ type: 'email' }]);
      
      expect(result.success).toBe(true);
      expect(result.result?.allValid).toBe(true);
    });

    test('email validation - invalid', () => {
      const result = StringTools.validate('invalid-email', [{ type: 'email' }]);
      
      expect(result.success).toBe(true);
      expect(result.result?.allValid).toBe(false);
    });

    test('url validation - valid', () => {
      const result = StringTools.validate('https://example.com', [{ type: 'url' }]);
      
      expect(result.success).toBe(true);
      expect(result.result?.allValid).toBe(true);
    });

    test('url validation - invalid', () => {
      const result = StringTools.validate('not-a-url', [{ type: 'url' }]);
      
      expect(result.success).toBe(true);
      expect(result.result?.allValid).toBe(false);
    });

    test('phone validation - valid', () => {
      const result = StringTools.validate('+1234567890', [{ type: 'phone' }]);
      
      expect(result.success).toBe(true);
      expect(result.result?.allValid).toBe(true);
    });

    test('numeric validation - valid', () => {
      const result = StringTools.validate('123.45', [{ type: 'numeric' }]);
      
      expect(result.success).toBe(true);
      expect(result.result?.allValid).toBe(true);
    });

    test('numeric validation - invalid', () => {
      const result = StringTools.validate('abc123', [{ type: 'numeric' }]);
      
      expect(result.success).toBe(true);
      expect(result.result?.allValid).toBe(false);
    });

    test('alpha validation - valid', () => {
      const result = StringTools.validate('hello', [{ type: 'alpha' }]);
      
      expect(result.success).toBe(true);
      expect(result.result?.allValid).toBe(true);
    });

    test('alphanumeric validation - valid', () => {
      const result = StringTools.validate('hello123', [{ type: 'alphanumeric' }]);
      
      expect(result.success).toBe(true);
      expect(result.result?.allValid).toBe(true);
    });

    test('pattern validation - valid', () => {
      const result = StringTools.validate('hello123', [{ 
        type: 'pattern', 
        options: { pattern: '^[a-z]+\\d+$' } 
      }]);
      
      expect(result.success).toBe(true);
      expect(result.result?.allValid).toBe(true);
    });

    test('multiple validation rules', () => {
      const result = StringTools.validate('test@example.com', [
        { type: 'required' },
        { type: 'email' },
        { type: 'length', options: { min: 5, max: 50 } }
      ]);
      
      expect(result.success).toBe(true);
      expect(result.result?.allValid).toBe(true);
      expect(result.result?.passedRules).toBe(3);
    });

    test('mixed validation results', () => {
      const result = StringTools.validate('test', [
        { type: 'required' },
        { type: 'email' },
        { type: 'length', options: { min: 2, max: 10 } }
      ]);
      
      expect(result.success).toBe(true);
      expect(result.result?.allValid).toBe(false);
      expect(result.result?.passedRules).toBe(2);
      expect(result.result?.failedRules).toBe(1);
    });
  });
});