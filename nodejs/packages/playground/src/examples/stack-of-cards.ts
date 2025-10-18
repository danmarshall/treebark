import type { Example } from './types.js';

export const stackOfCards: Example = {
  template: {
    div: {
      class: "cards-container",
      $children: [
        { h2: "Team Members" },
        {
          div: {
            class: "cards-stack",
            $bind: "team",
            $children: [
              {
                div: {
                  class: "member-card",
                  $children: [
                    { h3: "{{name}}" },
                    { p: "{{role}}" },
                    { p: "Experience: {{experience}} years" }
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  },
  data: {
    team: [
      { name: "Alice Smith", role: "Frontend Developer", experience: 5 },
      { name: "Bob Johnson", role: "Backend Developer", experience: 8 },
      { name: "Carol Brown", role: "UI/UX Designer", experience: 3 }
    ]
  }
};
