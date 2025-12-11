import type { Example } from './types.js';

export const filterByRole: Example = {
  template: {
    div: {
      class: "user-dashboard",
      $children: [
        { h2: "Admins and Moderators" },
        {
          ul: {
            class: "user-list privileged",
            $bind: "users",
            $filter: {
              $check: "role",
              $in: ["admin", "moderator"]
            },
            $children: [
              { 
                li: {
                  $children: [
                    { strong: "{{name}}" },
                    " - ",
                    { span: { class: "role", $children: ["{{role}}"] } }
                  ]
                }
              }
            ]
          }
        },
        { h2: "All Users" },
        {
          ul: {
            class: "user-list",
            $bind: "users",
            $children: [
              { 
                li: {
                  $children: [
                    { strong: "{{name}}" },
                    " - ",
                    { span: { class: "role", $children: ["{{role}}"] } }
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
    users: [
      { name: "Alice", role: "admin" },
      { name: "Bob", role: "user" },
      { name: "Charlie", role: "moderator" },
      { name: "Dave", role: "user" },
      { name: "Eve", role: "editor" },
      { name: "Frank", role: "admin" }
    ]
  }
};
