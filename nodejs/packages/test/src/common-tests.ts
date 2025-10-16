// Common test data for both DOM and string renderers
// This file contains shared test cases to eliminate duplication

import { jest } from '@jest/globals';

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
  }
];

// Security and validation test cases
export const securityErrorTests: ErrorTestCase[] = [
  {
    name: 'throws error for disallowed tags',
    input: { template: { script: 'alert("xss")' } },
    expectedError: 'Tag "script" is not allowed'
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

// Style object tests
export const styleObjectTests: TestCase[] = [
  {
    name: 'renders style object with single property',
    input: {
      template: {
        div: {
          style: { color: 'red' },
          $children: ['Styled content']
        }
      }
    }
  },
  {
    name: 'renders style object with multiple properties',
    input: {
      template: {
        div: {
          style: {
            'color': 'red',
            'background-color': 'blue',
            'font-size': '14px'
          },
          $children: ['Multiple styles']
        }
      }
    }
  },
  {
    name: 'handles kebab-case CSS properties',
    input: {
      template: {
        div: {
          style: {
            'font-size': '16px',
            'font-weight': 'bold',
            'text-align': 'center',
            'border-radius': '5px'
          },
          $children: ['Kebab-case properties']
        }
      }
    }
  },
  {
    name: 'handles numeric values',
    input: {
      template: {
        div: {
          style: {
            'width': '100px',
            'height': '50px',
            'opacity': '0.5',
            'z-index': '10'
          },
          $children: ['Numeric values']
        }
      }
    }
  },
  {
    name: 'skips null and undefined style values',
    input: {
      template: {
        div: {
          style: {
            'color': 'red',
            'background-color': null,
            'font-size': undefined,
            'padding': '10px'
          },
          $children: ['Skip null/undefined']
        }
      }
    }
  },
  {
    name: 'works with flexbox properties',
    input: {
      template: {
        div: {
          style: {
            'display': 'flex',
            'flex-direction': 'column',
            'justify-content': 'center',
            'align-items': 'center',
            'gap': '10px'
          },
          $children: ['Flexbox']
        }
      }
    }
  },
  {
    name: 'works with grid properties',
    input: {
      template: {
        div: {
          style: {
            'display': 'grid',
            'grid-template-columns': 'repeat(3, 1fr)',
            'gap': '20px'
          },
          $children: ['Grid layout']
        }
      }
    }
  },
  {
    name: 'handles conditional style object',
    input: {
      template: {
        div: {
          style: {
            $check: 'isActive',
            $then: { 'color': 'green', 'font-weight': 'bold' },
            $else: { 'color': 'gray' }
          },
          $children: ['Conditional style']
        }
      },
      data: { isActive: true }
    }
  }
];

export const styleObjectWarningTests: TestCase[] = [
  {
    name: 'warns for disallowed CSS property',
    input: {
      template: {
        div: {
          style: {
            'color': 'red',
            'unsafe-property': 'value'
          },
          $children: ['Unknown property']
        }
      }
    }
  },
  {
    name: 'blocks url() in style object values',
    input: {
      template: {
        div: {
          style: {
            'background-image': 'url(https://evil.com/track.gif)'
          },
          $children: ['URL blocked']
        }
      }
    }
  },
  {
    name: 'blocks expression() in style object values',
    input: {
      template: {
        div: {
          style: {
            'width': 'expression(alert(1))'
          },
          $children: ['Expression blocked']
        }
      }
    }
  },
  {
    name: 'blocks javascript: protocol in style object values',
    input: {
      template: {
        div: {
          style: {
            'background': 'javascript:alert(1)'
          },
          $children: ['JavaScript protocol blocked']
        }
      }
    }
  }
];

export const styleObjectErrorTests: ErrorTestCase[] = [
  {
    name: 'rejects string-based style attribute',
    input: {
      template: {
        div: {
          style: 'color: red',
          $children: ['String style']
        }
      }
    },
    expectedError: 'Style attribute must be an object'
  },
  {
    name: 'rejects array as style attribute',
    input: {
      template: {
        div: {
          style: ['color: red'],
          $children: ['Array style']
        }
      }
    },
    expectedError: 'Style attribute must be an object'
  },
  {
    name: 'rejects number as style attribute',
    input: {
      template: {
        div: {
          style: 123,
          $children: ['Number style']
        }
      }
    },
    expectedError: 'Style attribute must be an object'
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
          style: { color: 'red' },
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
  },
  {
    name: 'warns but continues for invalid attribute on tag',
    input: {
      template: {
        div: {
          src: 'image.jpg',  // Invalid for div, should trigger warning
          class: 'valid',    // Valid attribute
          $children: ['Content']
        }
      }
    }
  }
];

export const tagSpecificAttributeErrorTests: ErrorTestCase[] = [
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

export const voidTagWarningTests: TestCase[] = [
  {
    name: 'warns about children on void tags and renders tag without children',
    input: {
      template: {
        img: {
          src: 'image.jpg',
          $children: ['This should not work']
        }
      }
    }
  },
  {
    name: 'warns about children on void tags with shorthand syntax and renders tag without children',
    input: {
      template: {
        img: ['This should not work']
      }
    }
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
    input: { template: { $comment: 'This is a comment' } }
  },
  {
    name: 'renders comment with interpolation',
    input: { 
      template: { $comment: 'User: {{name}}' },
      data: { name: 'Alice' }
    }
  },
  {
    name: 'renders comment containing other tags',
    input: {
      template: {
        $comment: {
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
    input: { template: { $comment: '' } }
  },
  {
    name: 'renders comment with special characters',
    input: { template: { $comment: 'Special chars: & < > " \'' } }
  },
  {
    name: 'safely handles malicious interpolation',
    input: { 
      template: { $comment: 'User input: {{input}}' },
      data: { input: 'evil --> <script>alert(1)</script>' }
    }
  }
];

export const commentErrorTests: ErrorTestCase[] = [
  {
    name: 'prevents nested comments',
    input: {
      template: {
        $comment: {
          $children: [
            'Outer comment with ',
            { $comment: 'nested comment' },
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


// "$if" tag test cases
export const ifTagTests: TestCase[] = [
  {
    name: 'renders children when condition is truthy (true)',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'showMessage',
                $then:
                  { p: 'Message is shown' }
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
              $if: {
                $check: 'userName',
                $then:
                  { p: 'Hello {{userName}}' }
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
              $if: {
                $check: 'count',
                $then:
                  { p: 'Count: {{count}}' }
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
              $if: {
                $check: 'showMessage',
                $then:
                  { p: 'This should not appear' }
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
              $if: {
                $check: 'value',
                $then:
                  { p: 'This should not appear' }
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
              $if: {
                $check: 'value',
                $then:
                  { p: 'This should not appear' }
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
              $if: {
                $check: 'value',
                $then:
                  { p: 'This should not appear' }
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
              $if: {
                $check: 'value',
                $then:
                  { p: 'This should not appear' }
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
              $if: {
                $check: 'user.isAdmin',
                $then:
                  { p: 'Admin panel' }
              }
            }
          ]
        }
      },
      data: { user: { isAdmin: true } }
    }
  },
  {
    name: 'works with multiple children (wrapped in div)',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'showContent',
                $then: {
                  div: {
                    $children: [
                      { h1: 'Title' },
                      { p: 'Paragraph 1' },
                      { p: 'Paragraph 2' }
                    ]
                  }
                }
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
              $if: {
                $check: 'level1',
                $then: {
                  div: {
                    $children: [
                      { p: 'Level 1 visible' },
                      {
                        $if: {
                          $check: 'level2',
                          $then: { p: 'Level 2 visible' }
                        }
                      }
                    ]
                  }
                }
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
        $if: {
          $check: 'show',
          $then:
            { div: 'Content' }
        }
      },
      data: { show: true }
    }
  },
  {
    name: 'renders nothing at root level when falsy',
    input: {
      template: {
        $if: {
          $check: 'show',
          $then:
            { div: 'Content' }
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
              $if: {
                $check: 'showMessage',
                $not: true,
                $then:
                  { p: 'Message is hidden, showing this instead' }
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
              $if: {
                $check: 'showMessage',
                $not: true,
                $then:
                  { p: 'This should not appear' }
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
              $if: {
                $check: 'user.isGuest',
                $not: true,
                $then:
                  { p: 'Welcome back, member!' }
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
              $if: {
                $check: 'count',
                $not: true,
                $then:
                  { p: 'No items' }
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
              $if: {
                $check: 'message',
                $not: true,
                $then:
                  { p: 'No message provided' }
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
              $if: {
                $check: 'show',
                $then: {
                  div: {
                    $children: [
                      { p: 'First' },
                      { p: 'Second' },
                      { p: 'Third' }
                    ]
                  }
                }
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
                    $if: {
                      $check: 'show',
                      $then: {
                        div: {
                          $children: [
                            { p: 'First' },
                            { p: 'Second' },
                            { p: 'Third' }
                          ]
                        }
                      }
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
  },
  {
    name: 'warns but continues when $if tag has unsupported attributes',
    input: {
      template: {
        $if: {
          $check: 'show',
          class: 'my-class',  // This should trigger a warning
          $then: { p: 'Content' }
        } as any
      },
      data: { show: true }
    }
  },
  {
    name: 'warns but continues when $if tag has $children',
    input: {
      template: {
        $if: {
          $check: 'show',
          $children: [{ p: 'Ignored' }],  // This should trigger a warning and be ignored
          $then: { p: 'Content' }
        } as any
      },
      data: { show: true }
    }
  }
];

// Operator tests for $if tag (v2.0)
export const ifTagOperatorTests: TestCase[] = [
  {
    name: 'less than operator: renders when true',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'age',
                '$<': 18,
                $then:
                  { p: 'Minor' }
              }
            }
          ]
        }
      },
      data: { age: 15 }
    }
  },
  {
    name: 'less than operator: does not render when false',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'age',
                '$<': 18,
                $then:
                  { p: 'Minor' }
              }
            }
          ]
        }
      },
      data: { age: 20 }
    }
  },
  {
    name: 'greater than operator: renders when true',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'score',
                '$>': 90,
                $then:
                  { p: 'Excellent' }
              }
            }
          ]
        }
      },
      data: { score: 95 }
    }
  },
  {
    name: 'greater than operator: does not render when false',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'score',
                '$>': 90,
                $then:
                  { p: 'Excellent' }
              }
            }
          ]
        }
      },
      data: { score: 85 }
    }
  },
  {
    name: 'equals operator: renders when equal',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'status',
                '$=': 'active',
                $then:
                  { p: 'User is active' }
              }
            }
          ]
        }
      },
      data: { status: 'active' }
    }
  },
  {
    name: 'equals operator: does not render when not equal',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'status',
                '$=': 'active',
                $then:
                  { p: 'User is active' }
              }
            }
          ]
        }
      },
      data: { status: 'inactive' }
    }
  },
  {
    name: '$in operator: renders when value is in array',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'role',
                $in: ['admin', 'moderator', 'editor'],
                $then:
                  { p: 'Has special privileges' }
              }
            }
          ]
        }
      },
      data: { role: 'admin' }
    }
  },
  {
    name: '$in operator: does not render when value is not in array',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'role',
                $in: ['admin', 'moderator', 'editor'],
                $then:
                  { p: 'Has special privileges' }
              }
            }
          ]
        }
      },
      data: { role: 'user' }
    }
  },
  {
    name: 'less than or equal operator: renders when less than',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'age',
                '$<=': 18,
                $then:
                  { p: 'Youth' }
              }
            }
          ]
        }
      },
      data: { age: 15 }
    }
  },
  {
    name: 'less than or equal operator: renders when equal',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'age',
                '$<=': 18,
                $then:
                  { p: 'Youth' }
              }
            }
          ]
        }
      },
      data: { age: 18 }
    }
  },
  {
    name: 'less than or equal operator: does not render when greater than',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'age',
                '$<=': 18,
                $then:
                  { p: 'Youth' }
              }
            }
          ]
        }
      },
      data: { age: 20 }
    }
  },
  {
    name: 'greater than or equal operator: renders when greater than',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'score',
                '$>=': 90,
                $then:
                  { p: 'Excellent' }
              }
            }
          ]
        }
      },
      data: { score: 95 }
    }
  },
  {
    name: 'greater than or equal operator: renders when equal',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'score',
                '$>=': 90,
                $then:
                  { p: 'Excellent' }
              }
            }
          ]
        }
      },
      data: { score: 90 }
    }
  },
  {
    name: 'greater than or equal operator: does not render when less than',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'score',
                '$>=': 90,
                $then:
                  { p: 'Excellent' }
              }
            }
          ]
        }
      },
      data: { score: 85 }
    }
  },
  {
    name: 'stacking $>= and $<=: renders for inclusive range',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'age',
                '$>=': 18,
                '$<=': 65,
                $then:
                  { p: 'Working age adult' }
              }
            }
          ]
        }
      },
      data: { age: 18 }
    }
  },
  {
    name: 'stacking $>= and $<=: renders for middle of range',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'age',
                '$>=': 18,
                '$<=': 65,
                $then:
                  { p: 'Working age adult' }
              }
            }
          ]
        }
      },
      data: { age: 40 }
    }
  },
  {
    name: 'stacking $>= and $<=: renders at upper bound',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'age',
                '$>=': 18,
                '$<=': 65,
                $then:
                  { p: 'Working age adult' }
              }
            }
          ]
        }
      },
      data: { age: 65 }
    }
  },
  {
    name: 'stacking $>= and $<=: does not render below range',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'age',
                '$>=': 18,
                '$<=': 65,
                $then:
                  { p: 'Working age adult' }
              }
            }
          ]
        }
      },
      data: { age: 17 }
    }
  },
  {
    name: 'stacking $>= and $<=: does not render above range',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'age',
                '$>=': 18,
                '$<=': 65,
                $then:
                  { p: 'Working age adult' }
              }
            }
          ]
        }
      },
      data: { age: 66 }
    }
  },
  {
    name: 'multiple operators with AND (default): all must be true',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'age',
                '$>': 18,
                '$<': 65,
                $then:
                  { p: 'Working age adult' }
              }
            }
          ]
        }
      },
      data: { age: 30 }
    }
  },
  {
    name: 'multiple operators with AND: does not render if one is false',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'age',
                '$>': 18,
                '$<': 65,
                $then:
                  { p: 'Working age adult' }
              }
            }
          ]
        }
      },
      data: { age: 70 }
    }
  },
  {
    name: 'multiple operators with OR: renders if one is true',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'age',
                '$<': 18,
                '$>': 65,
                $join: 'OR',
                $then:
                  { p: 'Non-working age' }
              }
            }
          ]
        }
      },
      data: { age: 70 }
    }
  },
  {
    name: 'multiple operators with OR: does not render if all are false',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'age',
                '$<': 18,
                '$>': 65,
                $join: 'OR',
                $then:
                  { p: 'Non-working age' }
              }
            }
          ]
        }
      },
      data: { age: 30 }
    }
  },
  {
    name: 'operator with $not: inverts result',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'age',
                '$<': 18,
                $not: true,
                $then:
                  { p: 'Adult' }
              }
            }
          ]
        }
      },
      data: { age: 25 }
    }
  },
  {
    name: 'complex condition: multiple operators with OR and $not',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'status',
                '$=': 'pending',
                $in: ['error', 'failed'],
                $join: 'OR',
                $not: true,
                $then:
                  { p: 'Valid status' }
              }
            }
          ]
        }
      },
      data: { status: 'active' }
    }
  }
];

// $then and $else tests
export const ifTagThenElseTests: TestCase[] = [
  {
    name: 'renders $then when condition is true',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'isActive',
                $then: { p: 'Active user' }
              }
            }
          ]
        }
      },
      data: { isActive: true }
    }
  },
  {
    name: 'renders $else when condition is false',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'isActive',
                $then: { p: 'Active user' },
                $else: { p: 'Inactive user' }
              }
            }
          ]
        }
      },
      data: { isActive: false }
    }
  },
  {
    name: 'renders $then when condition is true with both branches',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'score',
                '$>': 90,
                $then: { p: 'Excellent!' },
                $else: { p: 'Keep trying!' }
              }
            }
          ]
        }
      },
      data: { score: 95 }
    }
  },
  {
    name: 'renders empty when $else not provided and condition false',
    input: {
      template: {
        div: {
          $children: [
            {
              $if: {
                $check: 'show',
                $then: { p: 'Content' }
              }
            }
          ]
        }
      },
      data: { show: false }
    }
  }
];

// Conditional attribute value tests
export const conditionalAttributeTests: TestCase[] = [
  {
    name: 'conditional attribute with $then and $else',
    input: {
      template: {
        div: {
          class: {
            $check: 'isActive',
            $then: 'active',
            $else: 'inactive'
          },
          $children: ['Content']
        }
      },
      data: { isActive: true }
    }
  },
  {
    name: 'conditional attribute evaluates to $else when false',
    input: {
      template: {
        div: {
          class: {
            $check: 'isActive',
            $then: 'active',
            $else: 'inactive'
          },
          $children: ['Content']
        }
      },
      data: { isActive: false }
    }
  },
  {
    name: 'conditional attribute with operator',
    input: {
      template: {
        div: {
          class: {
            $check: 'score',
            '$>': 90,
            $then: 'excellent',
            $else: 'good'
          },
          $children: ['Score display']
        }
      },
      data: { score: 95 }
    }
  },
  {
    name: 'conditional attribute with $in operator',
    input: {
      template: {
        div: {
          class: {
            $check: 'role',
            $in: ['admin', 'moderator'],
            $then: 'privileged',
            $else: 'regular'
          },
          $children: ['User']
        }
      },
      data: { role: 'admin' }
    }
  },
  {
    name: 'conditional attribute with $not modifier',
    input: {
      template: {
        div: {
          class: {
            $check: 'isGuest',
            $not: true,
            $then: 'member',
            $else: 'guest'
          },
          $children: ['User']
        }
      },
      data: { isGuest: false }
    }
  },
  {
    name: 'multiple attributes with conditionals',
    input: {
      template: {
        div: {
          class: {
            $check: 'theme',
            '$=': 'dark',
            $then: 'dark-mode',
            $else: 'light-mode'
          },
          'data-theme': {
            $check: 'theme',
            $then: '{{theme}}',
            $else: 'default'
          },
          $children: ['Themed content']
        }
      },
      data: { theme: 'dark' }
    }
  }
];

export const ifTagErrorTests: ErrorTestCase[] = [
  {
    name: 'throws error when $if tag has no $check',
    input: {
      template: {
        $if: {
          $then:
            { p: 'Content' }
        }
      },
      data: {}
    },
    expectedError: '"$if" tag requires $check attribute'
  },
  {
    name: 'throws error when $if tag $then is an array',
    input: {
      template: {
        $if: {
          $check: 'show',
          $then: [
            { p: 'First' },
            { p: 'Second' }
          ]
        }
      },
      data: { show: true }
    },
    expectedError: '"$if" tag $then must be a string or single element object, not an array'
  },
  {
    name: 'throws error when $if tag $else is an array',
    input: {
      template: {
        $if: {
          $check: 'show',
          $then: { p: 'Visible' },
          $else: [
            { p: 'First' },
            { p: 'Second' }
          ]
        }
      },
      data: { show: false }
    },
    expectedError: '"$if" tag $else must be a string or single element object, not an array'
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
    // Create a mock logger to check events
    const mockLogger = {
      error: jest.fn(),
      warn: jest.fn(),
      log: jest.fn()
    };
    
    // Call render function with mock logger
    const result = renderFunction(testCase.input, { ...testCase.options, logger: mockLogger });
    
    // Verify that an error was logged containing the expected message
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining(testCase.expectedError)
    );
    
    // For certain critical errors, the entire element should not render
    // For validation errors on nested elements, we allow graceful degradation
    const isCriticalError = 
      (testCase.expectedError.includes('is not allowed') && testCase.expectedError.includes('Tag ')) ||
      testCase.expectedError.includes('void element and cannot have children') ||
      (testCase.expectedError.includes('$if') && !testCase.expectedError.includes('Attribute'));
    
    if (isCriticalError) {
      // Critical errors should result in empty output
      if (typeof result === 'string') {
        expect(result).toBe('');
      } else if (result && typeof result === 'object' && 'childNodes' in result) {
        // For DOM fragments, check that it's empty
        expect(result.childNodes.length).toBe(0);
      }
    }
    // For other errors (like $bind validation, nested comments, invalid attributes), we allow graceful degradation
  });
}
