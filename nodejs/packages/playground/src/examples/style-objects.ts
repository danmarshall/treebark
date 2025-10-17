import type { Example } from './types.js';

export const styleObjects: Example = {
  template: {
    div: {
      class: "style-demo",
      $children: [
        { h2: "Style Object Examples" },
        { p: "Style attributes now use structured objects for security and type safety." },
        { hr: {} },
        { h3: "Basic Styling" },
        {
          div: {
            style: {
              color: "{{primaryColor}}",
              "font-size": "18px",
              padding: "10px",
              border: "2px solid {{primaryColor}}",
              "border-radius": "8px",
              "background-color": "#f0f0f0"
            },
            $children: ["This div has structured styles with interpolated color!"]
          }
        },
        { hr: {} },
        { h3: "Conditional Styles" },
        {
          div: {
            style: {
              $check: "theme",
              "$=": "dark",
              $then: {
                "background-color": "#333",
                color: "#fff",
                padding: "15px",
                "border-radius": "5px"
              },
              $else: {
                "background-color": "#fff",
                color: "#333",
                padding: "15px",
                border: "1px solid #ccc",
                "border-radius": "5px"
              }
            },
            $children: ["This div changes styles based on theme: {{theme}}"]
          }
        },
        { hr: {} },
        { h3: "Dynamic Status Colors" },
        {
          div: {
            $bind: "statuses",
            $children: [
              {
                div: {
                  style: {
                    $check: "status",
                    "$=": "success",
                    $then: {
                      color: "green",
                      "font-weight": "bold",
                      padding: "10px",
                      margin: "5px 0",
                      "border-left": "4px solid green"
                    },
                    $else: {
                      color: "red",
                      "font-weight": "bold",
                      padding: "10px",
                      margin: "5px 0",
                      "border-left": "4px solid red"
                    }
                  },
                  $children: ["{{message}} ({{status}})"]
                }
              }
            ]
          }
        },
        { hr: {} },
        { h3: "Flexbox Layout" },
        {
          div: {
            style: {
              display: "flex",
              gap: "10px",
              "align-items": "center",
              "justify-content": "space-between",
              padding: "10px",
              "background-color": "#e3f2fd"
            },
            $children: [
              {
                span: {
                  style: { "font-weight": "bold" },
                  $children: ["Left"]
                }
              },
              { span: "Center" },
              {
                span: {
                  style: { "font-style": "italic" },
                  $children: ["Right"]
                }
              }
            ]
          }
        }
      ]
    }
  },
  data: {
    primaryColor: "#3f51b5",
    theme: "dark",
    statuses: [
      { status: "success", message: "Operation completed successfully" },
      { status: "error", message: "Operation failed" },
      { status: "success", message: "All tests passed" }
    ]
  }
};
