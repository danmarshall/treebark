import type { Example } from './types.js';

export const calendar: Example = {
  template: {
    table: {
      class: "calendar-table",
      $children: [
        {
          thead: [
            {
              tr: [
                { th: "Sun" },
                { th: "Mon" },
                { th: "Tue" },
                { th: "Wed" },
                { th: "Thu" },
                { th: "Fri" },
                { th: "Sat" }
              ]
            }
          ]
        },
        {
          tbody: {
            $bind: ".",
            $children: [
              {
                tr: [
                  { td: "{{sun}}" },
                  { td: "{{mon}}" },
                  { td: "{{tue}}" },
                  { td: "{{wed}}" },
                  { td: "{{thu}}" },
                  { td: "{{fri}}" },
                  { td: "{{sat}}" }
                ]
              }
            ]
          }
        }
      ]
    }
  },
  data: [
    { rowId: 1, sun: "", mon: "", tue: 1, wed: 2, thu: 3, fri: 4, sat: 5 },
    { rowId: 2, sun: 6, mon: 7, tue: 8, wed: 9, thu: 10, fri: 11, sat: 12 },
    { rowId: 3, sun: 13, mon: 14, tue: 15, wed: 16, thu: 17, fri: 18, sat: 19 },
    { rowId: 4, sun: 20, mon: 21, tue: 22, wed: 23, thu: 24, fri: 25, sat: 26 },
    { rowId: 5, sun: 27, mon: 28, tue: 29, wed: 30, thu: 31, fri: "", sat: "" }
  ]
};
