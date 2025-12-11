import type { Example } from './types.js';

export const filterAgeRange: Example = {
  template: {
    div: {
      class: "age-groups",
      $children: [
        { h2: "Working Age (18-65)" },
        {
          ul: {
            $bind: "people",
            $filter: {
              $check: "age",
              "$>=": 18,
              "$<=": 65
            },
            $children: [
              { li: "{{name}} ({{age}} years old)" }
            ]
          }
        },
        { h2: "Non-Working Age" },
        {
          ul: {
            $bind: "people",
            $filter: {
              $check: "age",
              "$<": 18,
              "$>": 65,
              $join: "OR" as const
            },
            $children: [
              { li: "{{name}} ({{age}} years old)" }
            ]
          }
        },
        { h2: "Everyone" },
        {
          ul: {
            $bind: "people",
            $children: [
              { li: "{{name}} ({{age}} years old)" }
            ]
          }
        }
      ]
    }
  },
  data: {
    people: [
      { name: "Alice", age: 15 },
      { name: "Bob", age: 25 },
      { name: "Charlie", age: 70 },
      { name: "Dave", age: 40 },
      { name: "Eve", age: 12 },
      { name: "Frank", age: 55 }
    ]
  }
};
