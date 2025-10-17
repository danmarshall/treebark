import type { Example } from './types.js';

export const conditionalIfBasic: Example = {
  template: {
    div: {
      class: "user-greeting",
      $children: [
        { h2: "User Dashboard" },
        {
          $if: {
            $check: "isLoggedIn",
            $then: {
              div: {
                $children: [
                  { p: "Welcome back, {{username}}!" },
                  { a: { href: "/profile", $children: ["View Profile"] } }
                ]
              }
            }
          }
        },
        {
          $if: {
            $check: "isLoggedIn",
            $not: true,
            $then: {
              div: {
                $children: [
                  { p: "Please log in to continue." },
                  { a: { href: "/login", $children: ["Login"] } }
                ]
              }
            }
          }
        }
      ]
    }
  },
  data: {
    isLoggedIn: true,
    username: "Alice"
  }
};
