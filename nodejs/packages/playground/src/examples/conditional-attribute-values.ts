import type { Example } from './types.js';

export const conditionalAttributeValues: Example = {
  template: {
    div: {
      class: "status-dashboard",
      $children: [
        { h2: "Server Status Dashboard" },
        {
          div: {
            class: {
              $check: "status",
              "$=": "online",
              $then: "status-online",
              $else: "status-offline"
            },
            style: {
              $check: "status",
              "$=": "online",
              $then: { "color": "green", "font-weight": "bold" },
              $else: { "color": "red", "font-weight": "bold" }
            },
            $children: [
              { strong: "Server Status: " },
              { span: "{{status}}" }
            ]
          }
        },
        { hr: {} },
        { h3: "Performance Score: {{score}}" },
        {
          div: {
            class: {
              $check: "score",
              "$>=": 90,
              $then: "score-excellent",
              $else: "score-average"
            },
            style: {
              $check: "score",
              "$>=": 90,
              $then: { "color": "green", "font-weight": "bold" },
              $else: { "color": "orange" }
            },
            $children: [
              {
                $if: {
                  $check: "score",
                  "$>=": 90,
                  $then: { span: "⭐ Excellent Performance" },
                  $else: { span: "Average Performance" }
                }
              }
            ]
          }
        }
      ]
    }
  },
  data: {
    status: "online",
    score: 95
  }
};
