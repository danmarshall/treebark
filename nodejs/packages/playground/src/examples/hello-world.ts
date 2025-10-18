import type { Example } from './types.js';

export const helloWorld: Example = {
  template: {
    div: {
      class: "greeting",
      $children: [
        { h1: "Hello World!" },
        { p: "Welcome to Treebark - safe HTML tree structures." }
      ]
    }
  },
  data: {}
};
