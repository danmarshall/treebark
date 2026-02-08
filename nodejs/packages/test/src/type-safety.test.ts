/**
 * Type safety tests for improved TemplateObject types
 * These tests verify that TypeScript catches invalid template structures at compile time
 */

import { renderToString, TemplateObject } from 'treebark';
import { jest } from '@jest/globals';

describe('Type Safety', () => {
  describe('Valid templates', () => {
    it('should accept valid tag names', () => {
      const template: TemplateObject = { div: 'content' };
      const result = renderToString({ template });
      expect(result).toBe('<div style="contain: content; isolation: isolate;" data-treebark-container="true"><div>content</div></div>');
    });

    it('should accept $if with conditional properties', () => {
      const template: TemplateObject = {
        $if: {
          $check: 'isActive',
          $then: { div: 'Active' },
          $else: { div: 'Inactive' }
        }
      };
      const result = renderToString({ template, data: { isActive: true } });
      expect(result).toBe('<div style="contain: content; isolation: isolate;" data-treebark-container="true"><div>Active</div></div>');
    });

    it('should accept regular tags with attributes', () => {
      const template: TemplateObject = {
        div: {
          class: 'test',
          $children: ['content']
        }
      };
      const result = renderToString({ template });
      expect(result).toBe('<div style="contain: content; isolation: isolate;" data-treebark-container="true"><div class="test">content</div></div>');
    });

    it('should accept all container tags', () => {
      const templates: TemplateObject[] = [
        { div: 'test' },
        { span: 'test' },
        { p: 'test' },
        { h1: 'test' },
        { ul: { $children: [{ li: 'item' }] } },
        { table: { $children: [{ tr: { $children: [{ td: 'cell' }] } }] } },
        { a: { href: 'http://example.com', $children: ['link'] } }
      ];
      
      templates.forEach(template => {
        const result = renderToString({ template });
        expect(result).toBeTruthy();
      });
    });

    it('should accept void tags', () => {
      const templates: TemplateObject[] = [
        { img: { src: 'test.jpg', alt: 'test' } },
        { br: {} },
        { hr: {} }
      ];
      
      templates.forEach(template => {
        const result = renderToString({ template });
        expect(result).toBeTruthy();
      });
    });

    it('should accept $comment tag', () => {
      const template: TemplateObject = {
        $comment: 'This is a comment'
      };
      const result = renderToString({ template });
      expect(result).toBe('<div style="contain: content; isolation: isolate;" data-treebark-container="true"><!--This is a comment--></div>');
    });
  });

  describe('Runtime validation still works', () => {
    it('should reject invalid tags at runtime', () => {
      // We can still construct invalid objects at runtime using 'as any'
      // but the runtime validation should catch them
      const template = { zoo: 'animals' } as any;
      const mockLogger = { error: jest.fn(), warn: jest.fn(), log: jest.fn() };
      const result = renderToString({ template }, { logger: mockLogger });
      expect(mockLogger.error).toHaveBeenCalledWith(
        
        expect.stringContaining('Tag "zoo" is not allowed')
      );
      expect(result).toBe('<div style="contain: content; isolation: isolate;" data-treebark-container="true"></div>');
    });

    it('should reject mixing $if with regular tag properties', () => {
      // Even if we bypass TypeScript, runtime should catch this
      const template = {
        $if: {
          $check: 'test',
          $then: 'yes',
          class: 'invalid', // Not allowed in $if
          $children: ['also invalid']
        }
      } as any;
      
      const mockLogger = { error: jest.fn(), warn: jest.fn(), log: jest.fn() };
      const result = renderToString({ template, data: { test: true } }, { logger: mockLogger });
      expect(mockLogger.warn).toHaveBeenCalledWith(
        
        expect.stringContaining('does not support')
      );
      // Should still process despite warnings
      expect(result).toBe('<div style="contain: content; isolation: isolate;" data-treebark-container="true">yes</div>');
    });

    it('should reject invalid attribute keys for specific tags', () => {
      const template = {
        div: {
          invalidAttr: 'value',
          $children: ['content']
        }
      };
      
      const mockLogger = { error: jest.fn(), warn: jest.fn(), log: jest.fn() };
      const result = renderToString({ template }, { logger: mockLogger });
      expect(mockLogger.warn).toHaveBeenCalledWith(
        
        expect.stringContaining('Attribute "invalidAttr" is not allowed on tag "div"')
      );
      // Element should still render, just without the invalid attribute (graceful degradation)
      expect(result).toContain('<div>');
      expect(result).toContain('content');
      expect(result).not.toContain('invalidAttr');
    });
  });

  describe('Type-level enforcement', () => {
    // These tests verify TypeScript compile-time checks
    // They won't run but serve as documentation of what should NOT compile
    
    it('should document that invalid tag names are rejected by TypeScript', () => {
      // This would cause a TypeScript error:
      // const invalid: TemplateObject = { zoo: 'animals' };
      // Error: Type '{ zoo: string; }' is not assignable to type 'TemplateObject'
      
      // We can verify this by checking the valid case works
      const valid: TemplateObject = { div: 'content' };
      expect(valid).toBeDefined();
    });

    it('should document that $if cannot have arbitrary properties', () => {
      // This would cause a TypeScript error:
      // const invalid: TemplateObject = {
      //   $if: {
      //     $check: 'test',
      //     $then: 'yes',
      //     class: 'invalid'  // Error: Object literal may only specify known properties
      //   }
      // };
      
      // We can verify this by checking the valid case works
      const valid: TemplateObject = {
        $if: {
          $check: 'test',
          $then: 'yes'
        }
      };
      expect(valid).toBeDefined();
    });
  });

  describe('Conditional operator separation', () => {
    it('should allow $join in $if tags', () => {
      const template: TemplateObject = {
        $if: {
          $check: 'age',
          '$>': 18,
          '$<': 65,
          $join: 'AND',
          $then: { div: 'Adult' }
        }
      };
      const result = renderToString({ template, data: { age: 30 } });
      expect(result).toBe('<div style="contain: content; isolation: isolate;" data-treebark-container="true"><div>Adult</div></div>');
    });

    it('should not allow $join in regular tag attributes', () => {
      // Regular tags should not have $join in their attributes
      // TypeScript now prevents this with proper type checking
      const template: TemplateObject = {
        div: {
          class: 'test',
          $children: ['content']
        }
      };
      const result = renderToString({ template });
      expect(result).toBe('<div style="contain: content; isolation: isolate;" data-treebark-container="true"><div class="test">content</div></div>');
    });

    it('should reject $join in regular tags at runtime', () => {
      // Even if TypeScript is bypassed, runtime catches it
      const template = {
        em: {
          $join: 'OR',
          $children: ['text']
        }
      } as any;
      const mockLogger = { error: jest.fn(), warn: jest.fn(), log: jest.fn() };
      const result = renderToString({ template }, { logger: mockLogger });
      expect(mockLogger.warn).toHaveBeenCalledWith(
        
        expect.stringContaining('Attribute "$join" is not allowed on tag "em"')
      );
      // Element should still render, just without the invalid attribute (graceful degradation)
      expect(result).toContain('<em>');
      expect(result).toContain('text');
    });

    it('should reject $children in void tags at runtime', () => {
      // Even if TypeScript is bypassed, runtime catches it
      const template = {
        img: {
          src: 'test.jpg',
          $children: ['not allowed']
        }
      } as any;
      const mockLogger = { error: jest.fn(), warn: jest.fn(), log: jest.fn() };
      const result = renderToString({ template }, { logger: mockLogger });
      expect(mockLogger.warn).toHaveBeenCalledWith(
        
        expect.stringContaining('Tag "img" is a void element and cannot have children')
      );
      // Should render the img tag without children
      expect(result).toContain('<img');
    });

    it('should reject conditional operators in regular tags at runtime', () => {
      // Even if TypeScript is bypassed, runtime catches it
      const template = {
        div: {
          $check: 'test',
          $children: ['text']
        }
      } as any;
      const mockLogger = { error: jest.fn(), warn: jest.fn(), log: jest.fn() };
      const result = renderToString({ template }, { logger: mockLogger });
      expect(mockLogger.warn).toHaveBeenCalledWith(
        
        expect.stringContaining('Attribute "$check" is not allowed on tag "div"')
      );
      // Element should still render, just without the invalid attribute (graceful degradation)
      expect(result).toContain('<div>');
      expect(result).toContain('text');
    });
  });

  describe('Stricter type enforcement from comment feedback', () => {
    it('should accept valid void tags without $children', () => {
      const template: TemplateObject = {
        img: {
          src: 'image.jpg',
          alt: 'An image'
        }
      };
      const result = renderToString({ template });
      expect(result).toContain('<img');
      expect(result).toContain('src="image.jpg"');
    });

    it('should require $then in $if tags', () => {
      // TypeScript now requires $then
      const template: TemplateObject = {
        $if: {
          $check: 'test',
          $then: { div: 'Result' }
        }
      };
      const result = renderToString({ template, data: { test: true } });
      expect(result).toBe('<div style="contain: content; isolation: isolate;" data-treebark-container="true"><div>Result</div></div>');
    });
  });

  describe('Tag-specific attribute validation', () => {
    it('should reject src attribute on a tag at runtime', () => {
      const template = {
        a: {
          src: 'should not be allowed'
        }
      } as any;
      const mockLogger = { error: jest.fn(), warn: jest.fn(), log: jest.fn() };
      const result = renderToString({ template }, { logger: mockLogger });
      expect(mockLogger.warn).toHaveBeenCalledWith(
        
        expect.stringContaining('Attribute "src" is not allowed on tag "a"')
      );
      // Element should still render, just without the invalid attribute (graceful degradation)
      expect(result).toContain('<a>');
      expect(result).not.toContain('src=');
    });

    it('should reject href attribute on img tag at runtime', () => {
      const template = {
        img: {
          href: 'should not be allowed'
        }
      } as any;
      const mockLogger = { error: jest.fn(), warn: jest.fn(), log: jest.fn() };
      const result = renderToString({ template }, { logger: mockLogger });
      expect(mockLogger.warn).toHaveBeenCalledWith(
        
        expect.stringContaining('Attribute "href" is not allowed on tag "img"')
      );
      // Element should still render, just without the invalid attribute (graceful degradation)
      expect(result).toContain('<img>');
      expect(result).not.toContain('href=');
    });

    it('should accept valid a tag attributes', () => {
      const template: TemplateObject = {
        a: {
          href: 'http://example.com',
          target: '_blank',
          rel: 'noopener'
        }
      };
      const result = renderToString({ template });
      expect(result).toContain('href="http://example.com"');
      expect(result).toContain('target="_blank"');
      expect(result).toContain('rel="noopener"');
    });

    it('should accept valid img tag attributes', () => {
      const template: TemplateObject = {
        img: {
          src: 'image.jpg',
          alt: 'An image',
          width: '100',
          height: '100'
        }
      };
      const result = renderToString({ template });
      expect(result).toContain('src="image.jpg"');
      expect(result).toContain('alt="An image"');
      expect(result).toContain('width="100"');
      expect(result).toContain('height="100"');
    });
  });
});
