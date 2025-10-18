import type { Example } from './types.js';

export const calendar: Example = {
  template: {
    div: {
      class: "calendar",
      $children: [
        { h2: "Monthly Calendar" },
        {
          table: {
            class: "calendar-table",
            $children: [
              {
                thead: [
                  {
                    tr: [
                      { th: "Week" },
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
                  $bind: "weeks",
                  $children: [
                    {
                      tr: [
                        { td: "{{weekNum}}" },
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
        }
      ]
    }
  },
  data: {
    weeks: [
      { weekNum: 1, sun: "", mon: "", tue: 1, wed: 2, thu: 3, fri: 4, sat: 5 },
      { weekNum: 2, sun: 6, mon: 7, tue: 8, wed: 9, thu: 10, fri: 11, sat: 12 },
      { weekNum: 3, sun: 13, mon: 14, tue: 15, wed: 16, thu: 17, fri: 18, sat: 19 },
      { weekNum: 4, sun: 20, mon: 21, tue: 22, wed: 23, thu: 24, fri: 25, sat: 26 },
      { weekNum: 5, sun: 27, mon: 28, tue: 29, wed: 30, thu: 31, fri: "", sat: "" },
      { weekNum: 6, sun: "", mon: "", tue: "", wed: "", thu: "", fri: "", sat: "" }
    ]
  }
};
