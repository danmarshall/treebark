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
    name: 'handles $bind: "." to bind to current data object (array)',
    input: {
      template: {
        ul: {
          $bind: '.',
          $children: [{ li: '{{name}}' }]
        }
      },
      data: [
        { name: 'Item 1' },
        { name: 'Item 2' },
        { name: 'Item 3' }
      ]
    }
  },
  {
    name: 'handles $bind: "." to bind to current data object (nested)',
    input: {
      template: {
        div: {
          $bind: 'user',
          $children: [
            { h2: '{{name}}' },
            {
              div: {
                $bind: '.',
                $children: [
                  { p: 'Email: {{email}}' },
                  { p: 'Role: {{role}}' }
                ]
              }
            }
          ]
        }
      },
      data: {
        user: { name: 'Alice', email: 'alice@example.com', role: 'Admin' }
      }
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
// Parent property access test cases
export const parentPropertyTests: TestCase[] = [
  {
    name: 'accesses parent property with double dots',
    input: {
      template: {
        div: {
          $bind: 'user',
          $children: [
            { h2: '{{name}}' },
            { p: 'Organization: {{..orgName}}' }
          ]
        }
      },
      data: {
        orgName: 'ACME Corp',
        user: { name: 'Alice', email: 'alice@example.com' }
      }
    }
  },
  {
    name: 'accesses grandparent property with double dots and slash',
    input: {
      template: {
        div: {
          $bind: 'departments',
          $children: [
            {
              div: {
                $bind: 'users',
                $children: [
                  { span: '{{name}} works at {{../..companyName}}' }
                ]
              }
            }
          ]
        }
      },
      data: {
        companyName: 'Tech Solutions Inc',
        departments: [
          {
            name: 'Engineering',
            users: [
              { name: 'Alice' },
              { name: 'Bob' }
            ]
          }
        ]
      }
    }
  },
  {
    name: 'handles parent property in attributes',
    input: {
      template: {
        div: {
          $bind: 'items',
          $children: [
            {
              a: {
                href: '/{{..category}}/{{id}}',
                $children: ['{{name}}']
              }
            }
          ]
        }
      },
      data: {
        category: 'products',
        items: [
          { id: '1', name: 'Laptop' },
          { id: '2', name: 'Mouse' }
        ]
      }
    }
  },
  {
    name: 'returns empty string when parent not found',
    input: {
      template: {
        div: {
          $bind: 'user',
          $children: [
            { p: 'Missing: {{..nonexistent}}' }
          ]
        }
      },
      data: {
        user: { name: 'Alice' }
      }
    }
  },
  {
    name: 'returns empty string when too many parent levels requested',
    input: {
      template: {
        div: {
          $bind: 'user',
          $children: [
            { p: 'Missing: {{../../..tooDeep}}' }
          ]
        }
      },
      data: {
        user: { name: 'Alice' }
      }
    }
  },
  {
    name: 'works with nested object binding',
    input: {
      template: {
        div: {
          $bind: 'company',
          $children: [
            { h1: '{{name}}' },
            {
              div: {
                $bind: 'department',
                $children: [
                  { h2: '{{name}}' },
                  { p: 'Part of {{..name}}' }
                ]
              }
            }
          ]
        }
      },
      data: {
        company: {
          name: 'ACME Corp',
          department: {
            name: 'Engineering'
          }
        }
      }
    }
  }
];

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

// $bind validation error tests
export const bindValidationErrorTests: ErrorTestCase[] = [
  {
    name: 'throws error for $bind with double dots',
    input: {
      template: {
        div: {
          $bind: 'container',
          $children: [
            { ul: { $bind: '..users', $children: [{ li: '{{name}}' }] } }
          ]
        }
      },
      data: { users: [{ name: 'Alice' }], container: {} }
    },
    expectedError: '$bind does not support parent context access'
  },
  {
    name: 'throws error for $bind with multi-level parent access',
    input: {
      template: {
        div: {
          $bind: 'level1',
          $children: [
            {
              div: {
                $bind: 'level2',
                $children: [
                  { ul: { $bind: '../..users', $children: [{ li: '{{name}}' }] } }
                ]
              }
            }
          ]
        }
      },
      data: { users: [{ name: 'Bob' }], level1: { level2: {} } }
    },
    expectedError: '$bind does not support parent context access'
  },
  {
    name: 'throws error for $bind with interpolation',
    input: {
      template: {
        ul: { $bind: '{{dynamicPath}}', $children: [{ li: '{{name}}' }] }
      },
      data: { dynamicPath: 'users', users: [{ name: 'Charlie' }] }
    },
    expectedError: '$bind does not support interpolation'
  }
];


// "if" tag test cases
export const ifTagTests: TestCase[] = [
  {
    name: 'renders children when condition is truthy (true)',
    input: {
      template: {
        div: {
          $children: [
            {
              if: {
                $bind: 'showMessage',
                $children: [
                  { p: 'Message is shown' }
                ]
              }
            }
          ]
        }
      },
      data: { showMessage: true }
    }
  },
  {
    name: 'renders children when condition is truthy (non-empty string)',
    input: {
      template: {
        div: {
          $children: [
            {
              if: {
                $bind: 'userName',
                $children: [
                  { p: 'Hello {{userName}}' }
                ]
              }
            }
          ]
        }
      },
      data: { userName: 'Alice' }
    }
  },
  {
    name: 'renders children when condition is truthy (number)',
    input: {
      template: {
        div: {
          $children: [
            {
              if: {
                $bind: 'count',
                $children: [
                  { p: 'Count: {{count}}' }
                ]
              }
            }
          ]
        }
      },
      data: { count: 5 }
    }
  },
  {
    name: 'does not render children when condition is falsy (false)',
    input: {
      template: {
        div: {
          $children: [
            { p: 'Before' },
            {
              if: {
                $bind: 'showMessage',
                $children: [
                  { p: 'This should not appear' }
                ]
              }
            },
            { p: 'After' }
          ]
        }
      },
      data: { showMessage: false }
    }
  },
  {
    name: 'does not render children when condition is falsy (null)',
    input: {
      template: {
        div: {
          $children: [
            {
              if: {
                $bind: 'value',
                $children: [
                  { p: 'This should not appear' }
                ]
              }
            }
          ]
        }
      },
      data: { value: null }
    }
  },
  {
    name: 'does not render children when condition is falsy (undefined)',
    input: {
      template: {
        div: {
          $children: [
            {
              if: {
                $bind: 'value',
                $children: [
                  { p: 'This should not appear' }
                ]
              }
            }
          ]
        }
      },
      data: { value: undefined }
    }
  },
  {
    name: 'does not render children when condition is falsy (empty string)',
    input: {
      template: {
        div: {
          $children: [
            {
              if: {
                $bind: 'value',
                $children: [
                  { p: 'This should not appear' }
                ]
              }
            }
          ]
        }
      },
      data: { value: '' }
    }
  },
  {
    name: 'does not render children when condition is falsy (zero)',
    input: {
      template: {
        div: {
          $children: [
            {
              if: {
                $bind: 'value',
                $children: [
                  { p: 'This should not appear' }
                ]
              }
            }
          ]
        }
      },
      data: { value: 0 }
    }
  },
  {
    name: 'works with nested property access',
    input: {
      template: {
        div: {
          $children: [
            {
              if: {
                $bind: 'user.isAdmin',
                $children: [
                  { p: 'Admin panel' }
                ]
              }
            }
          ]
        }
      },
      data: { user: { isAdmin: true } }
    }
  },
  {
    name: 'works with multiple children',
    input: {
      template: {
        div: {
          $children: [
            {
              if: {
                $bind: 'showContent',
                $children: [
                  { h1: 'Title' },
                  { p: 'Paragraph 1' },
                  { p: 'Paragraph 2' }
                ]
              }
            }
          ]
        }
      },
      data: { showContent: true }
    }
  },
  {
    name: 'works with nested if tags',
    input: {
      template: {
        div: {
          $children: [
            {
              if: {
                $bind: 'level1',
                $children: [
                  { p: 'Level 1 visible' },
                  {
                    if: {
                      $bind: 'level2',
                      $children: [
                        { p: 'Level 2 visible' }
                      ]
                    }
                  }
                ]
              }
            }
          ]
        }
      },
      data: { level1: true, level2: true }
    }
  },
  {
    name: 'works at root level',
    input: {
      template: {
        if: {
          $bind: 'show',
          $children: [
            { div: 'Content' }
          ]
        }
      },
      data: { show: true }
    }
  },
  {
    name: 'renders nothing at root level when falsy',
    input: {
      template: {
        if: {
          $bind: 'show',
          $children: [
            { div: 'Content' }
          ]
        }
      },
      data: { show: false }
    }
  },
  {
    name: 'renders children with $not when condition is falsy',
    input: {
      template: {
        div: {
          $children: [
            {
              if: {
                $bind: 'showMessage',
                $not: true,
                $children: [
                  { p: 'Message is hidden, showing this instead' }
                ]
              }
            }
          ]
        }
      },
      data: { showMessage: false }
    }
  },
  {
    name: 'does not render children with $not when condition is truthy',
    input: {
      template: {
        div: {
          $children: [
            { p: 'Before' },
            {
              if: {
                $bind: 'showMessage',
                $not: true,
                $children: [
                  { p: 'This should not appear' }
                ]
              }
            },
            { p: 'After' }
          ]
        }
      },
      data: { showMessage: true }
    }
  },
  {
    name: 'works with $not and nested properties',
    input: {
      template: {
        div: {
          $children: [
            {
              if: {
                $bind: 'user.isGuest',
                $not: true,
                $children: [
                  { p: 'Welcome back, member!' }
                ]
              }
            }
          ]
        }
      },
      data: { user: { isGuest: false } }
    }
  },
  {
    name: 'works with $not and zero',
    input: {
      template: {
        div: {
          $children: [
            {
              if: {
                $bind: 'count',
                $not: true,
                $children: [
                  { p: 'No items' }
                ]
              }
            }
          ]
        }
      },
      data: { count: 0 }
    }
  },
  {
    name: 'works with $not and empty string',
    input: {
      template: {
        div: {
          $children: [
            {
              if: {
                $bind: 'message',
                $not: true,
                $children: [
                  { p: 'No message provided' }
                ]
              }
            }
          ]
        }
      },
      data: { message: '' }
    }
  },
  {
    name: 'preserves indentation with multiple children (one level)',
    input: {
      template: {
        div: {
          class: 'container',
          $children: [
            { p: 'Before' },
            {
              if: {
                $bind: 'show',
                $children: [
                  { p: 'First' },
                  { p: 'Second' },
                  { p: 'Third' }
                ]
              }
            },
            { p: 'After' }
          ]
        }
      },
      data: { show: true }
    },
    options: { indent: true }
  },
  {
    name: 'preserves indentation with multiple children (two levels)',
    input: {
      template: {
        div: {
          class: 'outer',
          $children: [
            { h1: 'Title' },
            {
              div: {
                class: 'inner',
                $children: [
                  {
                    if: {
                      $bind: 'show',
                      $children: [
                        { p: 'First' },
                        { p: 'Second' },
                        { p: 'Third' }
                      ]
                    }
                  }
                ]
              }
            },
            { p: 'Footer' }
          ]
        }
      },
      data: { show: true }
    },
    options: { indent: true }
  }
];

// New operator tests for 'if' tag
export const ifTagOperatorTests: TestCase[] = [
  {
    name: 'works with $condition instead of $bind',
    input: {
      template: {
        div: {
          $children: [
            {
              if: {
                $condition: 'showMessage',
                $children: [
                  { p: 'Using $condition' }
                ]
              }
            }
          ]
        }
      },
      data: { showMessage: true }
    }
  },
  {
    name: 'works with $condition and $not',
    input: {
      template: {
        div: {
          $children: [
            {
              if: {
                $condition: 'isHidden',
                $not: true,
                $children: [
                  { p: 'Not hidden' }
                ]
              }
            }
          ]
        }
      },
      data: { isHidden: false }
    }
  },
  {
    name: 'works with $equals operator (string match)',
    input: {
      template: {
        div: {
          $children: [
            {
              if: {
                $condition: 'status',
                $equals: 'active',
                $children: [
                  { p: 'Status is active' }
                ]
              }
            }
          ]
        }
      },
      data: { status: 'active' }
    }
  },
  {
    name: 'does not render when $equals does not match',
    input: {
      template: {
        div: {
          $children: [
            { p: 'Before' },
            {
              if: {
                $condition: 'status',
                $equals: 'active',
                $children: [
                  { p: 'This should not appear' }
                ]
              }
            },
            { p: 'After' }
          ]
        }
      },
      data: { status: 'inactive' }
    }
  },
  {
    name: 'works with $equals operator (number match)',
    input: {
      template: {
        div: {
          $children: [
            {
              if: {
                $condition: 'count',
                $equals: 5,
                $children: [
                  { p: 'Count is exactly 5' }
                ]
              }
            }
          ]
        }
      },
      data: { count: 5 }
    }
  },
  {
    name: 'works with $equals operator (boolean match)',
    input: {
      template: {
        div: {
          $children: [
            {
              if: {
                $condition: 'isActive',
                $equals: true,
                $children: [
                  { p: 'Is active' }
                ]
              }
            }
          ]
        }
      },
      data: { isActive: true }
    }
  },
  {
    name: 'works with $equals and $not (inverted equality)',
    input: {
      template: {
        div: {
          $children: [
            {
              if: {
                $condition: 'status',
                $equals: 'inactive',
                $not: true,
                $children: [
                  { p: 'Status is not inactive' }
                ]
              }
            }
          ]
        }
      },
      data: { status: 'active' }
    }
  },
  {
    name: 'works with $notEquals operator',
    input: {
      template: {
        div: {
          $children: [
            {
              if: {
                $condition: 'status',
                $notEquals: 'inactive',
                $children: [
                  { p: 'Status is not inactive' }
                ]
              }
            }
          ]
        }
      },
      data: { status: 'active' }
    }
  },
  {
    name: 'does not render when $notEquals matches',
    input: {
      template: {
        div: {
          $children: [
            { p: 'Before' },
            {
              if: {
                $condition: 'status',
                $notEquals: 'active',
                $children: [
                  { p: 'This should not appear' }
                ]
              }
            },
            { p: 'After' }
          ]
        }
      },
      data: { status: 'active' }
    }
  },
  {
    name: 'works with $notEquals and $not (double negation)',
    input: {
      template: {
        div: {
          $children: [
            {
              if: {
                $condition: 'status',
                $notEquals: 'active',
                $not: true,
                $children: [
                  { p: 'Status is active (double negation)' }
                ]
              }
            }
          ]
        }
      },
      data: { status: 'active' }
    }
  },
  {
    name: 'works with $equals checking null',
    input: {
      template: {
        div: {
          $children: [
            {
              if: {
                $condition: 'value',
                $equals: null,
                $children: [
                  { p: 'Value is null' }
                ]
              }
            }
          ]
        }
      },
      data: { value: null }
    }
  },
  {
    name: 'works with $equals checking 0',
    input: {
      template: {
        div: {
          $children: [
            {
              if: {
                $condition: 'count',
                $equals: 0,
                $children: [
                  { p: 'Count is zero' }
                ]
              }
            }
          ]
        }
      },
      data: { count: 0 }
    }
  },
  {
    name: 'works with $equals checking empty string',
    input: {
      template: {
        div: {
          $children: [
            {
              if: {
                $condition: 'message',
                $equals: '',
                $children: [
                  { p: 'Message is empty' }
                ]
              }
            }
          ]
        }
      },
      data: { message: '' }
    }
  },
  {
    name: 'backward compatibility: $bind still works with operators',
    input: {
      template: {
        div: {
          $children: [
            {
              if: {
                $bind: 'status',
                $equals: 'ready',
                $children: [
                  { p: 'Ready to go' }
                ]
              }
            }
          ]
        }
      },
      data: { status: 'ready' }
    }
  }
];

export const ifTagErrorTests: ErrorTestCase[] = [
  {
    name: 'throws error when if tag has no $bind or $condition',
    input: {
      template: {
        if: {
          $children: [
            { p: 'Content' }
          ]
        }
      },
      data: {}
    },
    expectedError: '"if" tag requires $bind or $condition attribute'
  },
  {
    name: 'throws error when if tag has attributes',
    input: {
      template: {
        if: {
          $bind: 'show',
          class: 'my-class',
          $children: [
            { p: 'Content' }
          ]
        }
      },
      data: { show: true }
    },
    expectedError: '"if" tag does not support attributes'
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