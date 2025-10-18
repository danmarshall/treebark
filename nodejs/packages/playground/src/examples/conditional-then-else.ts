import type { Example } from './types.js';

export const conditionalThenElse: Example = {
  template: {
    div: {
      class: "auth-status",
      $children: [
        { h2: "Authentication Status" },
        {
          $if: {
            $check: "isLoggedIn",
            $then: {
              div: {
                class: "logged-in",
                $children: [
                  { p: "Hello, {{username}}!" },
                  { a: { href: "/logout", $children: ["Logout"] } }
                ]
              }
            },
            $else: {
              div: {
                class: "logged-out",
                $children: [
                  { p: "Please log in to continue." },
                  { a: { href: "/login", class: "btn", $children: ["Login"] } }
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
