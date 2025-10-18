import type { Example } from './types.js';

export const buttonExample: Example = {
  template: {
    div: {
      class: "button-demo",
      $children: [
        { h2: "Button Tag Example (DOM-only)" },
        { p: "Buttons can have click handlers and payloads:" },
        {
          button: {
            class: "btn-primary",
            type: "button",
            'data-payload': JSON.stringify({ action: 'save', id: 123 }),
            $children: ['Save Item']
          }
        },
        {
          button: {
            class: "btn-danger",
            type: "button",
            'data-payload': JSON.stringify({ action: 'delete', id: 123 }),
            $children: ['Delete Item']
          }
        },
        {
          button: {
            class: "btn-info",
            disabled: "false",
            $children: ['Info Button']
          }
        }
      ]
    }
  },
  data: {}
};
