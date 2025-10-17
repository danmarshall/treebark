import type { Example } from './types.js';

export const userProfile: Example = {
  template: {
    div: {
      class: "user-profile",
      $children: [
        { h3: "{{name}}" },
        { p: "Email: {{email}}" },
        { p: "Skills: {{skills}}" }
      ]
    }
  },
  data: {
    name: "Alice Johnson",
    email: "alice@example.com",
    skills: "JavaScript, Python, React"
  }
};
