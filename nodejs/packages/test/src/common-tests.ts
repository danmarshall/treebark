// Common test data for both DOM and string renderers
// This file contains shared test cases to eliminate duplication

export interface TestCase {
  name: string;
  input: any;
  options?: any;
  description?: string;
}

export interface ErrorTestCase {
  name: string;
  input: any;
  options?: any;
  expectedError: string;
  description?: string;
}

// Basic rendering test cases
export const basicRenderingTests: TestCase[] = [
  {
    name: 'renders simple text',
    input: 'Hello world'
  },
  {
    name: 'renders simple element',
    input: { div: 'Hello world' }
  },
  {
    name: 'renders element with attributes',
    input: {
      div: {
        class: 'greeting',
        id: 'hello',
        $children: ['Hello world']
      }
    }
  },
  {
    name: 'renders nested elements',
    input: {
      div: {
        $children: [
          { h1: 'Title' },
          { p: 'Content' }
        ]
      }
    }
  },
  {
    name: 'renders array as fragment',
    input: [
      { h1: 'Title' },
      { p: 'Content' }
    ]
  },
  {
    name: 'renders mixed content',
    input: {
      div: {
        $children: [
          'Hello ',
          { span: 'world' },
          '!'
        ]
      }
    }
  }
];

// Data interpolation test cases
export const dataInterpolationTests: TestCase[] = [
  {
    name: 'interpolates data',
    input: { div: 'Hello {{name}}!' },
    options: { data: { name: 'Alice' } }
  },
  {
    name: 'interpolates nested properties',
    input: { div: 'Price: {{product.price}}' },
    options: { data: { product: { price: '$99' } } }
  },
  {
    name: 'interpolates in attributes',
    input: {
      a: {
        href: '/user/{{id}}',
        $children: ['{{name}}']
      }
    },
    options: { data: { id: '123', name: 'Alice' } }
  },
  {
    name: 'handles escaped interpolation',
    input: 'Hello {{{name}}}!',
    options: { data: { name: 'Alice' } }
  }
];

// Binding test cases
export const bindingTests: TestCase[] = [
  {
    name: 'handles array binding',
    input: {
      ul: {
        $bind: 'items',
        $children: [{ li: '{{name}} - {{price}}' }]
      }
    },
    options: {
      data: {
        items: [
          { name: 'Apple', price: '$1' },
          { name: 'Banana', price: '$2' }
        ]
      }
    }
  },
  {
    name: 'handles object binding',
    input: {
      div: {
        $bind: 'user',
        class: 'user-card',
        $children: [
          { h2: '{{name}}' },
          { p: '{{email}}' }
        ]
      }
    },
    options: {
      data: {
        user: { name: 'Alice', email: 'alice@example.com' }
      }
    }
  },
  {
    name: 'handles self-contained template',
    input: {
      $template: { p: 'Hello {{name}}!' },
      $data: { name: 'Alice' }
    }
  }
];

// Security and validation test cases
export const securityErrorTests: ErrorTestCase[] = [
  {
    name: 'throws error for disallowed tags',
    input: { script: 'alert("xss")' },
    expectedError: 'Tag "script" is not allowed'
  },
  {
    name: 'throws error for disallowed attributes',
    input: {
      div: {
        onclick: 'alert("xss")',
        $children: ['Content']
      }
    },
    expectedError: 'Attribute "onclick" is not allowed'
  }
];

export const securityValidTests: TestCase[] = [
  {
    name: 'allows data- and aria- attributes',
    input: {
      div: {
        'data-test': 'value',
        'aria-label': 'Test',
        $children: ['Content']
      }
    }
  }
];

// Tag-specific attribute test cases
export const tagSpecificAttributeTests: TestCase[] = [
  {
    name: 'allows tag-specific attributes for img',
    input: {
      img: {
        src: 'image.jpg',
        alt: 'An image',
        width: '100',
        height: '200'
      }
    }
  },
  {
    name: 'allows tag-specific attributes for a',
    input: {
      a: {
        href: 'https://example.com',
        target: '_blank',
        rel: 'noopener',
        $children: ['Link text']
      }
    }
  },
  {
    name: 'allows global attributes on any tag',
    input: {
      span: {
        id: 'test-id',
        class: 'test-class',
        style: 'color: red',
        title: 'Test title',
        role: 'button',
        $children: ['Content']
      }
    }
  },
  {
    name: 'allows tag-specific attributes for table elements',
    input: {
      table: {
        summary: 'Test table',
        $children: [
          {
            tr: [
              {
                th: {
                  scope: 'col',
                  colspan: '2',
                  $children: ['Header']
                }
              },
              {
                td: {
                  rowspan: '1',
                  $children: ['Data']
                }
              }
            ]
          }
        ]
      }
    }
  },
  {
    name: 'allows tag-specific attributes for blockquote',
    input: {
      blockquote: {
        cite: 'https://example.com',
        $children: ['Quote text']
      }
    }
  }
];

export const tagSpecificAttributeErrorTests: ErrorTestCase[] = [
  {
    name: 'throws error for tag-specific attribute on wrong tag',
    input: {
      div: {
        src: 'image.jpg',
        $children: ['Content']
      }
    },
    expectedError: 'Attribute "src" is not allowed on tag "div"'
  },
  {
    name: 'throws error for img-specific attribute on div',
    input: {
      div: {
        width: '100',
        $children: ['Content']
      }
    },
    expectedError: 'Attribute "width" is not allowed on tag "div"'
  },
  {
    name: 'throws error for a-specific attribute on div',
    input: {
      div: {
        target: '_blank',
        $children: ['Content']
      }
    },
    expectedError: 'Attribute "target" is not allowed on tag "div"'
  }
];

// Shorthand array syntax test cases
export const shorthandArrayTests: TestCase[] = [
  {
    name: 'renders shorthand array syntax for nodes without attributes',
    input: {
      div: [
        { h2: 'Title' },
        { p: 'Content' }
      ]
    }
  },
  {
    name: 'shorthand array syntax with mixed content',
    input: {
      div: [
        'Hello ',
        { span: 'world' },
        '!'
      ]
    }
  },
  {
    name: 'shorthand array syntax with data interpolation',
    input: {
      div: [
        { h1: '{{title}}' },
        { p: '{{content}}' }
      ]
    },
    options: { data: { title: 'Welcome', content: 'This is a test.' } }
  },
  {
    name: 'shorthand array syntax works with empty arrays',
    input: {
      div: []
    }
  }
];

// Void tag validation test cases
export const voidTagTests: TestCase[] = [
  {
    name: 'allows void tags without children',
    input: {
      img: {
        src: 'image.jpg',
        alt: 'Test image'
      }
    }
  }
];

export const voidTagErrorTests: ErrorTestCase[] = [
  {
    name: 'prevents children on void tags',
    input: {
      img: {
        src: 'image.jpg',
        $children: ['This should not work']
      }
    },
    expectedError: 'Tag "img" is a void element and cannot have children'
  },
  {
    name: 'prevents children on void tags with shorthand syntax',
    input: {
      img: ['This should not work']
    },
    expectedError: 'Tag "img" is a void element and cannot have children'
  }
];

// HTML comment tag test cases
export const commentTagTests: TestCase[] = [
  {
    name: 'renders simple comment tag',
    input: { comment: 'This is a comment' }
  },
  {
    name: 'renders comment tag with data interpolation',
    input: { comment: 'User: {{name}}' },
    options: { data: { name: 'Alice' } }
  },
  {
    name: 'renders comment tag with HTML content',
    input: {
      comment: {
        $children: [
          'Start ',
          { span: 'middle' },
          ' end'
        ]
      }
    }
  },
  {
    name: 'renders comment tag in mixed content',
    input: {
      div: {
        $children: [
          'Before comment',
          { comment: 'This is a comment' },
          'After comment'
        ]
      }
    }
  },
  {
    name: 'renders multiple comment tags',
    input: [
      { comment: 'First comment' },
      { comment: 'Second comment' }
    ]
  },
  {
    name: 'renders comment tag within nested structure',
    input: {
      div: {
        class: 'container',
        $children: [
          { h1: 'Title' },
          { comment: 'TODO: Add more content here' },
          { p: 'Content paragraph' }
        ]
      }
    }
  },
  {
    name: 'renders empty comment tag',
    input: { comment: '' }
  },
  {
    name: 'renders comment tag with nested property interpolation',
    input: { comment: 'Debug: {{user.id}} - {{user.name}}' },
    options: { data: { user: { id: 123, name: 'Bob' } } }
  }
];

export const commentTagErrorTests: ErrorTestCase[] = [
  {
    name: 'prevents nested comments',
    input: {
      comment: {
        $children: [
          'Outer comment ',
          { comment: 'nested comment' }
        ]
      }
    },
    expectedError: 'Nested comments are not allowed'
  },
  {
    name: 'prevents nested comments in complex structure',
    input: {
      comment: {
        $children: [
          'Start',
          { div: [{ comment: 'nested in div' }] },
          'End'
        ]
      }
    },
    expectedError: 'Nested comments are not allowed'
  }
];

// Utility function to create test from test case data
export function createTest(testCase: TestCase, renderFunction: (input: any, options?: any) => any, assertFunction: (result: any, testCase: TestCase) => void) {
  test(testCase.name, () => {
    const result = renderFunction(testCase.input, testCase.options);
    assertFunction(result, testCase);
  });
}

// Utility function to create error test from test case data
export function createErrorTest(testCase: ErrorTestCase, renderFunction: (input: any, options?: any) => any) {
  test(testCase.name, () => {
    expect(() => {
      renderFunction(testCase.input, testCase.options);
    }).toThrow(testCase.expectedError);
  });
}