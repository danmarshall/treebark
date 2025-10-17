import type { Example } from './types.js';

export const shorthandSyntax: Example = {
  template: {
    div: [
      { h2: "Welcome" },
      { p: "This is much cleaner with shorthand array syntax!" },
      {
        ul: [
          { li: "Item 1" },
          { li: "Item 2" },
          { li: "Item 3" }
        ]
      }
    ]
  },
  data: {}
};
