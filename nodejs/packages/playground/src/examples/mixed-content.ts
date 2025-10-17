import type { Example } from './types.js';

export const mixedContent: Example = {
  template: {
    div: {
      $children: [
        "Hello ",
        {
          span: {
            style: {
              color: "blue",
              "font-weight": "bold"
            },
            $children: ["World"]
          }
        },
        "! This mixes text and elements."
      ]
    }
  },
  data: {}
};
