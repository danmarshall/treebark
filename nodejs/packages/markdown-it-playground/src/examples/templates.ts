import type { TemplateElement } from '../../../treebark/dist/types.js';

export const treebarkTemplates: Record<string, TemplateElement | TemplateElement[]> = {
  greeting: {
    div: {
      class: "greeting",
      $children: [
        { h2: "Hello {{name}}!" },
        { p: "Welcome to the markdown-it-treebark plugin." }
      ]
    }
  },

  productCard: {
    div: {
      class: "product-card",
      $children: [
        { h2: "{{name}}" },
        { img: { src: "{{image}}", alt: "{{name}}" } },
        { p: "{{description}}" },
        { div: { class: "price", $children: ["{{price}}"] } },
        { a: { href: "{{link}}", class: "btn", $children: ["Learn More"] } }
      ]
    }
  },

  teamList: {
    ul: {
      class: "team-list",
      $bind: "members",
      $children: [
        {
          li: {
            class: "team-member",
            $children: [
              { strong: "{{name}}" },
              " - ",
              { em: "{{role}}" }
            ]
          }
        }
      ]
    }
  },

  quickStart: {
    div: {
      class: "quick-start",
      $children: [
        { h3: "Installation" },
        { pre: "npm install {{packageName}}" },
        { h3: "Usage" },
        { p: "Import and use in your project:" }
      ]
    }
  },

  featuresList: {
    ul: {
      class: "features",
      $bind: "features",
      $children: [
        {
          li: {
            $children: [
              { strong: "{{title}}" },
              " - ",
              "{{description}}"
            ]
          }
        }
      ]
    }
  },

  productGallery: {
    div: {
      class: "product-grid",
      $children: [
        { h2: "Featured Products" },
        {
          div: {
            class: "products",
            $bind: "products",
            $children: [
              {
                div: {
                  class: "product-card",
                  $children: [
                    { img: { src: "{{image}}", alt: "{{name}}" } },
                    { h3: "{{name}}" },
                    { p: "{{description}}" },
                    { div: { class: "price", $children: ["{{price}}"] } }
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  },

  productGalleryWithData: {
    div: {
      class: "product-grid",
      $children: [
        { h2: "Featured Products" },
        {
          div: {
            class: "products",
            $bind: "products",
            $children: [
              {
                div: {
                  class: "product-card",
                  $children: [
                    { img: { src: "{{image}}", alt: "{{name}}" } },
                    { h3: "{{name}}" },
                    { p: "{{description}}" },
                    { div: { class: "price", $children: ["{{price}}"] } }
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  },

  userStatus: {
    div: {
      class: "user-status",
      $children: [
        { h3: "Account Status" },
        {
          $if: {
            $check: "isPremium",
            $then: { p: { style: { color: "gold" }, $children: ["⭐ Premium Member"] } }
          }
        },
        {
          $if: {
            $check: "isPremium",
            $not: true,
            $then: { p: "Standard Member - Upgrade to Premium!" }
          }
        }
      ]
    }
  },

  authStatus: {
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
  },

  ageAccessControl: {
    div: {
      class: "access-control",
      $children: [
        { h3: "Access Level for Age: {{age}}" },
        {
          $if: {
            $check: "age",
            "$<": 13,
            $then: { p: { style: { color: "red" }, $children: ["❌ Child account - Restricted access"] } }
          }
        },
        {
          $if: {
            $check: "age",
            "$>=": 13,
            "$<": 18,
            $then: { p: { style: { color: "orange" }, $children: ["⚠️ Teen account - Limited access"] } }
          }
        },
        {
          $if: {
            $check: "age",
            "$>=": 18,
            $then: { p: { style: { color: "green" }, $children: ["✓ Full access granted"] } }
          }
        },
        { hr: {} },
        { h4: "Role-Based Access" },
        {
          $if: {
            $check: "role",
            $in: ["admin", "moderator", "editor"],
            $then: { p: { style: { color: "blue" }, $children: ["⭐ Special privileges granted"] } },
            $else: { p: "Standard user privileges" }
          }
        }
      ]
    }
  },

  ticketPricing: {
    div: {
      class: "pricing",
      $children: [
        { h3: "Standard Pricing" },
        { p: "Age: {{age}}, Member: {{isMember}}" },
        {
          $if: {
            $check: "age",
            "$>=": 18,
            "$<=": 65,
            $then: { p: { style: { color: "green" }, $children: ["✓ Standard adult rate: $50"] } },
            $else: { p: "Discounted rate available" }
          }
        },
        { hr: {} },
        { h3: "Discounted Pricing (OR Logic)" },
        {
          $if: {
            $check: "age",
            "$<": 18,
            "$>": 65,
            $join: "OR",
            $then: { p: { style: { color: "blue" }, $children: ["🎉 Special discount: $30"] } },
            $else: { p: "Standard rate: $50" }
          }
        },
        { hr: {} },
        { h3: "Negation Example" },
        {
          $if: {
            $check: "age",
            "$>=": 18,
            "$<=": 65,
            $not: true,
            $then: { p: { style: { color: "orange" }, $children: ["Outside working age range"] } },
            $else: { p: "Working age range (18-65)" }
          }
        }
      ]
    }
  },

  statusDashboard: {
    div: {
      class: "status-dashboard",
      $children: [
        { h3: "Server Status Dashboard" },
        {
          div: {
            class: {
              $check: "status",
              "$=": "online",
              $then: "status-online",
              $else: "status-offline"
            },
            $children: [
              { strong: "Server Status: " },
              { span: "{{status}}" }
            ]
          }
        },
        { hr: {} },
        { h4: "Performance Score: {{score}}" },
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
              $then: { color: "green", "font-weight": "bold" },
              $else: { color: "orange" }
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
        },
        { hr: {} },
        { h4: "User Role Badge" },
        {
          span: {
            class: {
              $check: "role",
              $in: ["admin", "moderator"],
              $then: "badge-special",
              $else: "badge-normal"
            },
            $children: ["Role: {{role}}"]
          }
        }
      ]
    }
  },
};
