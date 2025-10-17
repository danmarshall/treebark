import type { Example } from './types.js';

export const conditionalIfAdmin: Example = {
  template: {
    div: {
      class: "user-panel",
      $children: [
        { h2: "Welcome {{user.name}}!" },
        { p: "Role: {{user.role}}" },
        {
          $if: {
            $check: "user.isAdmin",
            $then: {
              div: {
                class: "admin-panel",
                $children: [
                  { h3: "Admin Tools" },
                  {
                    ul: [
                      {
                        li: {
                          $children: [
                            { a: { href: "/admin/users", $children: ["Manage Users"] } }
                          ]
                        }
                      },
                      {
                        li: {
                          $children: [
                            { a: { href: "/admin/settings", $children: ["System Settings"] } }
                          ]
                        }
                      }
                    ]
                  }
                ]
              }
            }
          }
        },
        {
          $if: {
            $check: "user.isPremium",
            $then: {
              div: {
                class: "premium-badge",
                style: {
                  background: "gold",
                  padding: "5px"
                },
                $children: ["⭐ Premium Member"]
              }
            }
          }
        }
      ]
    }
  },
  data: {
    user: {
      name: "Alice Johnson",
      role: "Administrator",
      isAdmin: true,
      isPremium: true
    }
  }
};
