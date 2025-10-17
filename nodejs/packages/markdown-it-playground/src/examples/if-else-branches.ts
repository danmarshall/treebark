import type { MarkdownExample } from './types.js';
import { treebark } from './helpers.js';

const authStatus = {
  div: {
    class: "auth-status",
    $children: [
      { h3: "Welcome!" },
      {
        $if: {
          $check: "isLoggedIn",
          $then: {
            div: {
              class: "logged-in",
              $children: [
                { p: "Hello, {{username}}!" },
                { a: { href: "#logout", $children: ["Logout"] } }
              ]
            }
          },
          $else: {
            div: {
              class: "logged-out",
              $children: [
                { p: "Please log in to continue." },
                { a: { href: "#login", class: "btn", $children: ["Login"] } }
              ]
            }
          }
        }
      }
    ]
  }
};

export const ifElseBranches: MarkdownExample = {
  templates: { authStatus },
  markdown: `# User Authentication Status

The **$then** and **$else** keys provide clean if/else branching.

## If/Else Example

${treebark(authStatus)}

## Key Features

- \`$then\` contains the element to render when condition is true
- \`$else\` contains the element to render when condition is false
- Each branch outputs exactly one element (1:1 mapping)
- Both branches are optional`,
  data: {
    isLoggedIn: true,
    username: 'Alice'
  }
};
