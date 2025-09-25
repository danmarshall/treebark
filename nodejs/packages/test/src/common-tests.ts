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
    input: { template: 'Hello world' }
  },
  {
    name: 'renders simple element',
    input: { template: { div: 'Hello world' } }
  },
  {
    name: 'renders element with attributes',
    input: {
      template: {
        div: {
          class: 'greeting',
          id: 'hello',
          $children: ['Hello world']
        }
      }
    }
  },
  {
    name: 'renders nested elements',
    input: {
      template: {
        div: {
          $children: [
            { h1: 'Title' },
            { p: 'Content' }
          ]
        }
      }
    }
  },
  {
    name: 'renders array as fragment',
    input: {
      template: [
        { h1: 'Title' },
        { p: 'Content' }
      ]
    }
  },
  {
    name: 'renders mixed content',
    input: {
      template: {
        div: {
          $children: [
            'Hello ',
            { span: 'world' },
            '!'
          ]
        }
      }
    }
  }
];

// Data interpolation test cases
export const dataInterpolationTests: TestCase[] = [
  {
    name: 'interpolates data',
    input: { 
      template: { div: 'Hello {{name}}!' },
      data: { name: 'Alice' }
    }
  },
  {
    name: 'interpolates nested properties',
    input: { 
      template: { div: 'Price: {{product.price}}' },
      data: { product: { price: '$99' } }
    }
  },
  {
    name: 'interpolates in attributes',
    input: {
      template: {
        a: {
          href: '/user/{{id}}',
          $children: ['{{name}}']
        }
      },
      data: { id: '123', name: 'Alice' }
    }
  },
  {
    name: 'handles escaped interpolation',
    input: { 
      template: 'Hello {{{name}}}!',
      data: { name: 'Alice' }
    }
  }
];

// Binding test cases
export const bindingTests: TestCase[] = [
  {
    name: 'handles array binding',
    input: {
      template: {
        ul: {
          $bind: 'items',
          $children: [{ li: '{{name}} - {{price}}' }]
        }
      },
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
      template: {
        div: {
          $bind: 'user',
          class: 'user-card',
          $children: [
            { h2: '{{name}}' },
            { p: '{{email}}' }
          ]
        }
      },
      data: {
        user: { name: 'Alice', email: 'alice@example.com' }
      }
    }
  },
  {
    name: 'handles TreebarkInput format',
    input: {
      template: { p: 'Hello {{name}}!' },
      data: { name: 'Bob' }
    }
  },
  {
    name: 'handles TreebarkInput format without data',
    input: {
      template: { div: 'Static content' }
    }
  },
  {
    name: 'handles single template with array data',
    input: {
      template: {
        div: {
          class: 'card',
          $children: [
            { h3: '{{name}}' },
            { p: 'Price: {{price}}' }
          ]
        }
      },
      data: [
        { name: 'Laptop', price: '$999' },
        { name: 'Mouse', price: '$25' }
      ]
    }
  }
];

// Security and validation test cases
export const securityErrorTests: ErrorTestCase[] = [
  {
    name: 'throws error for disallowed tags',
    input: { template: { script: 'alert("xss")' } },
    expectedError: 'Tag "script" is not allowed'
  },
  {
    name: 'throws error for disallowed attributes',
    input: {
      template: {
        div: {
          onclick: 'alert("xss")',
          $children: ['Content']
        }
      }
    },
    expectedError: 'Attribute "onclick" is not allowed'
  }
];

export const securityValidTests: TestCase[] = [
  {
    name: 'allows data- and aria- attributes',
    input: {
      template: {
        div: {
          'data-test': 'value',
          'aria-label': 'Test',
          $children: ['Content']
        }
      }
    }
  }
];

// Tag-specific attribute test cases
export const tagSpecificAttributeTests: TestCase[] = [
  {
    name: 'allows tag-specific attributes for img',
    input: {
      template: {
        img: {
          src: 'image.jpg',
          alt: 'An image',
          width: '100',
          height: '200'
        }
      }
    }
  },
  {
    name: 'allows tag-specific attributes for a',
    input: {
      template: {
        a: {
          href: 'https://example.com',
          target: '_blank',
          rel: 'noopener',
          $children: ['Link text']
        }
      }
    }
  },
  {
    name: 'allows global attributes on any tag',
    input: {
      template: {
        span: {
          id: 'test-id',
          class: 'test-class',
          style: 'color: red',
          title: 'Test title',
          role: 'button',
          $children: ['Content']
        }
      }
    }
  },
  {
    name: 'allows tag-specific attributes for table elements',
    input: {
      template: {
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
    }
  },
  {
    name: 'allows tag-specific attributes for blockquote',
    input: {
      template: {
        blockquote: {
          cite: 'https://example.com',
          $children: ['Quote text']
        }
      }
    }
  }
];

export const tagSpecificAttributeErrorTests: ErrorTestCase[] = [
  {
    name: 'throws error for tag-specific attribute on wrong tag',
    input: {
      template: {
        div: {
          src: 'image.jpg',
          $children: ['Content']
        }
      }
    },
    expectedError: 'Attribute "src" is not allowed on tag "div"'
  },
  {
    name: 'throws error for img-specific attribute on div',
    input: {
      template: {
        div: {
          width: '100',
          $children: ['Content']
        }
      }
    },
    expectedError: 'Attribute "width" is not allowed on tag "div"'
  },
  {
    name: 'throws error for a-specific attribute on div',
    input: {
      template: {
        div: {
          target: '_blank',
          $children: ['Content']
        }
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
      template: {
        div: [
          { h2: 'Title' },
          { p: 'Content' }
        ]
      }
    }
  },
  {
    name: 'shorthand array syntax with mixed content',
    input: {
      template: {
        div: [
          'Hello ',
          { span: 'world' },
          '!'
        ]
      }
    }
  },
  {
    name: 'shorthand array syntax with data interpolation',
    input: {
      template: {
        div: [
          { h1: '{{title}}' },
          { p: '{{content}}' }
        ]
      },
      data: { title: 'Welcome', content: 'This is a test.' }
    }
  },
  {
    name: 'shorthand array syntax works with empty arrays',
    input: {
      template: {
        div: []
      }
    }
  }
];

// Void tag validation test cases
export const voidTagTests: TestCase[] = [
  {
    name: 'allows void tags without children',
    input: {
      template: {
        img: {
          src: 'image.jpg',
          alt: 'Test image'
        }
      }
    }
  }
];

export const voidTagErrorTests: ErrorTestCase[] = [
  {
    name: 'prevents children on void tags',
    input: {
      template: {
        img: {
          src: 'image.jpg',
          $children: ['This should not work']
        }
      }
    },
    expectedError: 'Tag "img" is a void element and cannot have children'
  },
  {
    name: 'prevents children on void tags with shorthand syntax',
    input: {
      template: {
        img: ['This should not work']
      }
    },
    expectedError: 'Tag "img" is a void element and cannot have children'
  }
];

// Comment test cases
export const commentTests: TestCase[] = [
  {
    name: 'renders basic comment',
    input: { template: { comment: 'This is a comment' } }
  },
  {
    name: 'renders comment with interpolation',
    input: { 
      template: { comment: 'User: {{name}}' },
      data: { name: 'Alice' }
    }
  },
  {
    name: 'renders comment containing other tags',
    input: {
      template: {
        comment: {
          $children: [
            'Start: ',
            { span: 'highlighted text' },
            ' :End'
          ]
        }
      }
    }
  },
  {
    name: 'renders empty comment',
    input: { template: { comment: '' } }
  },
  {
    name: 'renders comment with special characters',
    input: { template: { comment: 'Special chars: & < > " \'' } }
  },
  {
    name: 'safely handles malicious interpolation',
    input: { 
      template: { comment: 'User input: {{input}}' },
      data: { input: 'evil --> <script>alert(1)</script>' }
    }
  }
];

export const commentErrorTests: ErrorTestCase[] = [
  {
    name: 'prevents nested comments',
    input: {
      template: {
        comment: {
          $children: [
            'Outer comment with ',
            { comment: 'nested comment' },
            ' inside'
          ]
        }
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