/**
 * Tests for the logger functionality
 */
import { renderToString, renderToDOM } from 'treebark';
import { jest } from '@jest/globals';

describe('Logger Functionality', () => {
  describe('String Renderer with Logger', () => {
    it('should use custom logger when provided', () => {
      const mockLogger = {
        error: jest.fn(),
        warn: jest.fn(),
        log: jest.fn()
      };

      const template = { script: 'alert("xss")' } as any;
      const result = renderToString({ template }, { logger: mockLogger });

      expect(result).toBe('');
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Tag "script" is not allowed')
      );
    });

    it('should use console logger when no logger provided', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const template = { script: 'alert("xss")' } as any;
      const result = renderToString({ template });

      expect(result).toBe('');
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Tag "script" is not allowed'));

      consoleErrorSpy.mockRestore();
    });

    it('should log multiple errors and continue rendering what it can', () => {
      const mockLogger = {
        error: jest.fn(),
        warn: jest.fn(),
        log: jest.fn()
      };

      const template = {
        div: {
          invalidAttr: 'bad',
          class: 'valid',
          anotherBadAttr: 'also bad',
          $children: ['content']
        }
      };
      const result = renderToString({ template }, { logger: mockLogger });

      // Should log 2 errors (one for each invalid attribute)
      expect(mockLogger.error).toHaveBeenCalledTimes(2);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('invalidAttr')
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('anotherBadAttr')
      );

      // Should still render the element with valid attributes
      expect(result).toContain('<div class="valid">');
      expect(result).toContain('content');
      expect(result).not.toContain('invalidAttr');
      expect(result).not.toContain('anotherBadAttr');
    });

    it('should handle nested errors gracefully', () => {
      const mockLogger = {
        error: jest.fn(),
        warn: jest.fn(),
        log: jest.fn()
      };

      const template = {
        div: {
          $children: [
            { p: 'Valid paragraph' },
            { script: 'Bad script' },
            { span: 'Valid span' }
          ]
        }
      } as any;
      const result = renderToString({ template }, { logger: mockLogger });

      // Should log error for the script tag
      expect(mockLogger.error).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Tag "script" is not allowed')
      );

      // Should render valid children
      expect(result).toContain('<div>');
      expect(result).toContain('<p>Valid paragraph</p>');
      expect(result).toContain('<span>Valid span</span>');
      expect(result).not.toContain('script');
    });

    it('should log $if validation errors', () => {
      const mockLogger = {
        error: jest.fn(),
        warn: jest.fn(),
        log: jest.fn()
      };

      const template = {
        $if: {
          $check: 'condition',
          $then: { p: 'Yes' },
          $children: ['This is invalid for $if']  // $if doesn't support $children
        }
      } as any;
      const result = renderToString({ template, data: { condition: true } }, { logger: mockLogger });

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringMatching(/\$if.*\$children/)
      );
      expect(result).toBe('');
    });

    it('should log $bind validation errors and render parent element', () => {
      const mockLogger = {
        error: jest.fn(),
        warn: jest.fn(),
        log: jest.fn()
      };

      const template = {
        div: {
          $bind: 'container',
          $children: [
            { ul: { $bind: '..invalid', $children: [{ li: 'Item' }] } }
          ]
        }
      };
      const result = renderToString(
        { template, data: { container: {}, invalid: [] } },
        { logger: mockLogger }
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('$bind does not support parent context access')
      );

      // Parent div should still render
      expect(result).toBe('<div></div>');
    });
  });

  describe('DOM Renderer with Logger', () => {
    it('should use custom logger when provided', () => {
      const mockLogger = {
        error: jest.fn(),
        warn: jest.fn(),
        log: jest.fn()
      };

      const template = { script: 'alert("xss")' } as any;
      const fragment = renderToDOM({ template }, { logger: mockLogger });

      expect(fragment.childNodes.length).toBe(0);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Tag "script" is not allowed')
      );
    });

    it('should use console logger when no logger provided', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const template = { script: 'alert("xss")' } as any;
      const fragment = renderToDOM({ template });

      expect(fragment.childNodes.length).toBe(0);
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Tag "script" is not allowed'));

      consoleErrorSpy.mockRestore();
    });

    it('should handle invalid attributes gracefully in DOM', () => {
      const mockLogger = {
        error: jest.fn(),
        warn: jest.fn(),
        log: jest.fn()
      };

      const template = {
        div: {
          invalidAttr: 'bad',
          class: 'valid',
          $children: ['content']
        }
      };
      const fragment = renderToDOM({ template }, { logger: mockLogger });

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('invalidAttr')
      );

      // Should render element with valid attributes
      expect(fragment.childNodes.length).toBe(1);
      const div = fragment.firstChild as HTMLElement;
      expect(div.tagName).toBe('DIV');
      expect(div.className).toBe('valid');
      expect(div.textContent).toBe('content');
      expect(div.hasAttribute('invalidAttr')).toBe(false);
    });
  });

  describe('Graceful Degradation Behavior', () => {
    it('should skip invalid elements but continue rendering siblings', () => {
      const mockLogger = {
        error: jest.fn(),
        warn: jest.fn(),
        log: jest.fn()
      };

      const template = [
        { p: 'First paragraph' },
        { script: 'Should be skipped' },
        { div: 'Third element' },
        { onclick: 'Also invalid' },
        { span: 'Last element' }
      ] as any;
      const result = renderToString({ template }, { logger: mockLogger });

      // Should log errors for invalid tags
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('script')
      );

      // Should render valid elements
      expect(result).toContain('First paragraph');
      expect(result).toContain('Third element');
      expect(result).toContain('Last element');
      expect(result).not.toContain('script');
    });

    it('should render comment with valid children, skipping nested comments', () => {
      const mockLogger = {
        error: jest.fn(),
        warn: jest.fn(),
        log: jest.fn()
      };

      const template = {
        $comment: {
          $children: [
            'Start of comment ',
            { $comment: 'Nested (invalid)' },
            ' end of comment'
          ]
        }
      };
      const result = renderToString({ template }, { logger: mockLogger });

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Nested comments are not allowed')
      );

      // Outer comment should render, nested one skipped
      expect(result).toContain('<!--');
      expect(result).toContain('Start of comment');
      expect(result).toContain('end of comment');
      expect(result).toContain('-->');
    });
  });

  describe('Logger in Different Contexts', () => {
    it('should pass logger through data binding', () => {
      const mockLogger = {
        error: jest.fn(),
        warn: jest.fn(),
        log: jest.fn()
      };

      const template = {
        ul: {
          $bind: 'items',
          $children: [
            {
              li: {
                badAttr: 'invalid',
                $children: ['{{name}}']
              }
            }
          ]
        }
      };
      const result = renderToString(
        {
          template,
          data: { items: [{ name: 'Item 1' }, { name: 'Item 2' }] }
        },
        { logger: mockLogger }
      );

      // Should log error for each item (2 items with invalid attribute)
      expect(mockLogger.error).toHaveBeenCalledTimes(2);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('badAttr')
      );

      // Should still render the list with valid content
      expect(result).toContain('<ul>');
      expect(result).toContain('<li>Item 1</li>');
      expect(result).toContain('<li>Item 2</li>');
      expect(result).not.toContain('badAttr');
    });

    it('should pass logger through conditional rendering', () => {
      const mockLogger = {
        error: jest.fn(),
        warn: jest.fn(),
        log: jest.fn()
      };

      const template = {
        div: {
          $children: [
            {
              $if: {
                $check: 'show',
                $then: {
                  p: {
                    invalidAttr: 'bad',
                    $children: ['Shown']
                  }
                }
              }
            }
          ]
        }
      };
      const result = renderToString(
        { template, data: { show: true } },
        { logger: mockLogger }
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('invalidAttr')
      );

      // Should render the conditional content without the invalid attribute
      expect(result).toContain('<div>');
      expect(result).toContain('<p>Shown</p>');
      expect(result).not.toContain('invalidAttr');
    });
  });
});
